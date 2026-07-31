"use strict";
// r21 Vision 自验：陈/宋两国色家族＋夏姬/宋襄公上线（九分区/归罪层前端呈现/两线全流程）＋23主角回归
const http = require("http"), fs = require("fs"), path = require("path");
const SITE_DIR = path.resolve(__dirname, "..", "..", "site");
const OUT = path.resolve(__dirname, "screenshots");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
function srv(root) { return new Promise((res, rej) => { const s = http.createServer((rq, rs) => { let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]); if (u === "/") u = "/index.html"; const fp = path.join(root, u); if (!fp.startsWith(root)) { rs.writeHead(403); rs.end(); return; } fs.readFile(fp, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(fp).toLowerCase()] || "application/octet-stream" }); rs.end(d); }); }); s.on("error", rej); s.listen(0, "127.0.0.1", () => res(s)); }); }
const PROTS = ["P_WENJIANG", "P_QIXIANG", "P_QIHUAN", "P_GUANZHONG", "P_QIXI", "P_LUYIN", "P_LUHUAN", "P_LUZHUANG",
  "P_ZHENGZHUANG", "P_ZHENGZHAO", "P_WUJIANG", "P_JIZHONG", "P_JINWEN", "P_QINMU", "P_CHUCHENG", "P_CHUZHUANG",
  "P_XIGUI", "P_LIJI", "P_MUJI", "P_ZHUANGJIANG", "P_XUANJIANG", "P_SONGXIANG", "P_XIAJI"];
const log = [];
const say = (...a) => { const s = a.join(" "); log.push(s); console.log(s); };

(async () => {
  const pw = require("playwright");
  const baseURL = process.env.QA_BASE_URL || null;
  let s = null, origin = baseURL;
  if (!origin) { s = await srv(SITE_DIR); origin = `http://127.0.0.1:${s.address().port}`; say("本地服务器：" + origin); }
  else say("真机 QA_BASE_URL：" + origin);
  const b = await pw.chromium.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  await c.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) { } });
  const p = await c.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message));

  // ---------- 1) 首页地图模式：九分区 ----------
  await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(900);
  const home = await p.evaluate(() => {
    const hs = [...document.querySelectorAll("#home-map .home-state")].map(g => g.dataset.state);
    const cl = [...document.querySelectorAll("#home-map .home-cluster")];
    const groups = [...document.querySelectorAll("#person-groups .state-group")]
      .map(g => (g.querySelector(".state-name") || {}).textContent);
    const cs = getComputedStyle(document.documentElement);
    return {
      hotspots: hs, clusterCount: cl.length, groups,
      chenVar: cs.getPropertyValue("--state-chen").trim(),
      songVar: cs.getPropertyValue("--state-song").trim(),
      xiajiVar: cs.getPropertyValue("--p-xiaji").trim(),
      songxVar: cs.getPropertyValue("--p-songxiang").trim(),
      clusters: cl.map(g => {
        const cir = [...g.querySelectorAll("circle")];
        return cir.map(x => x.getAttribute("cx") + "," + x.getAttribute("cy") + " " + x.getAttribute("fill"));
      }),
    };
  });
  await p.screenshot({ path: path.join(OUT, "r21_home_map.png") });
  // 首页地图局部放大：宋/陈相邻两区
  const mapBox = await p.$("#home-map");
  if (mapBox) {
    const bb = await mapBox.boundingBox();
    await p.screenshot({
      path: path.join(OUT, "r21_home_song_chen_zoom.png"),
      clip: { x: bb.x + bb.width * 0.48, y: bb.y + bb.height * 0.30, width: bb.width * 0.35, height: bb.height * 0.42 },
    });
  }
  // 点陈色块 → 右侧面板出夏姬卡（含流向 chip）
  await p.click('#home-map .home-state[data-state="陈"]'); await p.waitForTimeout(400);
  const chenPanel = await p.evaluate(() => {
    const pn = document.querySelector("#home-state-panel");
    return {
      head: (pn.querySelector("h3") || {}).textContent,
      note: (pn.querySelector(".state-note") || {}).textContent,
      cards: [...pn.querySelectorAll(".person-card")].map(c => ({
        name: (c.querySelector("h3") || {}).textContent,
        flow: (c.querySelector(".flow-chip") || {}).textContent || "",
        flowTitle: (c.querySelector(".flow-chip") || {}).title || "",
        color: c.style.getPropertyValue("--card-color"),
        h3w: c.querySelector("h3") ? c.querySelector("h3").scrollWidth - c.querySelector("h3").clientWidth : null,
      })),
    };
  });
  await p.screenshot({ path: path.join(OUT, "r21_home_chen_panel.png") });
  await p.click('#home-map .home-state[data-state="宋"]'); await p.waitForTimeout(400);
  const songPanel = await p.evaluate(() => {
    const pn = document.querySelector("#home-state-panel");
    return {
      head: (pn.querySelector("h3") || {}).textContent,
      cards: [...pn.querySelectorAll(".person-card")].map(c => ({
        name: (c.querySelector("h3") || {}).textContent,
        flow: (c.querySelector(".flow-chip") || {}).textContent || "",
        color: c.style.getPropertyValue("--card-color"),
      })),
    };
  });
  await p.screenshot({ path: path.join(OUT, "r21_home_song_panel.png") });

  // ---------- 2) 列表模式同步 ----------
  await p.goto(origin + "/#/?home=list", { waitUntil: "load" }); await p.waitForTimeout(600);
  const listMode = await p.evaluate(() => {
    const gs = [...document.querySelectorAll("#person-groups .state-group")];
    const tabs = [...document.querySelectorAll("#state-tabs button")].map(b => b.textContent);
    return {
      tabs,
      groups: gs.map(g => ({
        state: (g.querySelector(".state-name") || {}).textContent,
        note: (g.querySelector(".state-note") || {}).textContent || "",
        n: g.querySelectorAll(".person-card").length,
      })),
      flows: [...document.querySelectorAll(".person-card")].map(c => {
        const f = c.querySelector(".flow-chip");
        return f ? ((c.querySelector("h3").firstChild || {}).textContent || "") + "=" + f.textContent : null;
      }).filter(Boolean),
      // h3 溢出检查（流向 chip 变长后是否撑破单行）
      overflow: [...document.querySelectorAll(".person-card h3")]
        .filter(h => h.scrollWidth > h.clientWidth + 1)
        .map(h => h.textContent),
    };
  });
  const chenG = await p.$('#person-groups .state-group:last-child');
  if (chenG) { await chenG.scrollIntoViewIfNeeded(); await p.waitForTimeout(250); }
  await p.screenshot({ path: path.join(OUT, "r21_home_list_tail.png") });

  // ---------- 3) 夏姬时间线：归罪话术层 / P 层的前端呈现 ----------
  await p.goto(origin + "/#/p/P_XIAJI/timeline", { waitUntil: "load" }); await p.waitForTimeout(700);
  const xjTl = await p.evaluate(() => {
    const ds = [...document.querySelectorAll("#view-timeline details[data-eid]")];
    ds.forEach(d => { d.open = true; });
    return {
      name: (document.querySelector(".person-nav .pn-name") || {}).textContent || "?",
      eids: ds.map(d => d.dataset.eid),
      presenceChips: ds.map(d => {
        const c = [...d.querySelectorAll(".chip")].map(x => x.textContent);
        return d.dataset.eid + ":" + (c.find(t => t === "亲至" || t === "相关") || "?");
      }),
      layerBadges: [...document.querySelectorAll("#view-timeline .q-layer")].map(x => x.textContent),
      caveats: [...document.querySelectorAll("#view-timeline .q-caveat")].map(x => ({
        text: x.textContent,
        qid: x.closest("blockquote").dataset.qid,
        // 截断检测：是否有内容溢出可视框
        clipped: x.scrollWidth > x.clientWidth + 1 || x.scrollHeight > x.clientHeight + 1,
        color: getComputedStyle(x).color,
      })),
      // 层标是否确实在原文之前
      caveatBeforeQuote: [...document.querySelectorAll("#view-timeline blockquote.has-caveat")].map(bq => {
        const kids = [...bq.children].map(e => e.className || e.tagName);
        return bq.dataset.qid + " → " + kids.join(" | ");
      }),
      // footer 中不应再残留【】
      footerLeftover: [...document.querySelectorAll("#view-timeline blockquote footer")]
        .filter(f => f.textContent.includes("【")).map(f => f.textContent.slice(0, 40)),
    };
  });
  await p.waitForTimeout(300);
  for (const [eid, tag] of [["E179", "guizui_wuchen"], ["E182", "guizui_shuxiang"], ["E176", "zhulin_P"]]) {
    const el = await p.$(`#view-timeline details[data-eid="${eid}"]`);
    if (el) {
      await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(250);
      const bb = await el.boundingBox();
      if (bb) await p.screenshot({
        path: path.join(OUT, `r21_xiaji_${tag}_${eid}.png`),
        clip: { x: bb.x, y: bb.y, width: bb.width, height: Math.min(bb.height, 900) },
      });
    }
  }

  // ---------- 4) 夏姬地图：薄轨迹（郑→晋）＋相关空心 ----------
  await p.goto(origin + "/#/p/P_XIAJI/map", { waitUntil: "load" }); await p.waitForTimeout(800);
  const xjMap = await p.evaluate(() => ({
    status: (document.querySelector("#map-status") || {}).textContent || "",
    playHidden: document.querySelector("#btn-play").hidden,
    degradeShown: !document.querySelector("#play-degrade").hidden,
    trajPts: (document.querySelector("#map-canvas polyline.traj") || {}).getAttribute
      ? document.querySelector("#map-canvas polyline.traj").getAttribute("points") : "(无轨迹线)",
    solid: [...document.querySelectorAll("#map-canvas .anchor")]
      .map(g => g.getAttribute("aria-label")).filter(t => t && t.includes("亲至地点")),
    hollow: [...document.querySelectorAll("#map-canvas .anchor")]
      .map(g => g.getAttribute("aria-label")).filter(t => t && t.includes("相关地点")),
  }));
  await p.screenshot({ path: path.join(OUT, "r21_xiaji_map.png") });

  // ---------- 5) 夏姬 ego 关系图 ----------
  await p.goto(origin + "/#/p/P_XIAJI/relations", { waitUntil: "load" }); await p.waitForTimeout(900);
  const xjEgo = await p.evaluate(() => {
    const texts = [...document.querySelectorAll("#view-relations text")].map(t => t.textContent);
    return { nodeLabels: texts, edges: document.querySelectorAll("#view-relations line, #view-relations path.rel-edge, #view-relations .rel-edge").length };
  });
  await p.screenshot({ path: path.join(OUT, "r21_xiaji_ego.png") });

  // ---------- 6) 宋襄公时间线（用鄫子条）＋地图 ----------
  await p.goto(origin + "/#/p/P_SONGXIANG/timeline", { waitUntil: "load" }); await p.waitForTimeout(700);
  const sxTl = await p.evaluate(() => {
    const ds = [...document.querySelectorAll("#view-timeline details[data-eid]")];
    ds.forEach(d => { if (["E173", "E174", "E111"].includes(d.dataset.eid)) d.open = true; });
    return {
      name: (document.querySelector(".person-nav .pn-name") || {}).textContent || "?",
      eids: ds.map(d => d.dataset.eid),
      presence: ds.map(d => d.dataset.eid + ":" + ([...d.querySelectorAll(".chip")].map(x => x.textContent).find(t => t === "亲至" || t === "相关") || "?")),
      layerBadges: [...document.querySelectorAll("#view-timeline .q-layer")].map(x => x.textContent),
    };
  });
  await p.waitForTimeout(250);
  const e173 = await p.$('#view-timeline details[data-eid="E173"]');
  if (e173) {
    await e173.scrollIntoViewIfNeeded(); await p.waitForTimeout(250);
    const bb = await e173.boundingBox();
    if (bb) await p.screenshot({ path: path.join(OUT, "r21_songxiang_E173_zengzi.png"), clip: { x: bb.x, y: bb.y, width: bb.width, height: Math.min(bb.height, 900) } });
  }
  await p.goto(origin + "/#/p/P_SONGXIANG/map", { waitUntil: "load" }); await p.waitForTimeout(800);
  const sxMap = await p.evaluate(() => ({
    status: (document.querySelector("#map-status") || {}).textContent || "",
    degradeShown: !document.querySelector("#play-degrade").hidden,
    solid: [...document.querySelectorAll("#map-canvas .anchor")].map(g => g.getAttribute("aria-label")).filter(t => t && t.includes("亲至地点")),
    hollow: [...document.querySelectorAll("#map-canvas .anchor")].map(g => g.getAttribute("aria-label")).filter(t => t && t.includes("相关地点")),
  }));
  await p.screenshot({ path: path.join(OUT, "r21_songxiang_map.png") });

  // ---------- 7) 楚庄王线：入陈条 E178 回归 ＋ E179 降级 ----------
  await p.goto(origin + "/#/p/P_CHUZHUANG/timeline", { waitUntil: "load" }); await p.waitForTimeout(700);
  const czTl = await p.evaluate(() => {
    const ds = [...document.querySelectorAll("#view-timeline details[data-eid]")];
    const pick = id => { const d = ds.find(x => x.dataset.eid === id); if (!d) return null; d.open = true; return { title: (d.querySelector(".evt-title") || {}).textContent, presence: [...d.querySelectorAll(".chip")].map(x => x.textContent).find(t => t === "亲至" || t === "相关"), role: (d.querySelector(".role-chip") || {}).textContent }; };
    return { count: ds.length, E178: pick("E178"), E179: pick("E179") };
  });
  await p.waitForTimeout(250);
  const e178 = await p.$('#view-timeline details[data-eid="E178"]');
  if (e178) { await e178.scrollIntoViewIfNeeded(); await p.waitForTimeout(250); const bb = await e178.boundingBox(); if (bb) await p.screenshot({ path: path.join(OUT, "r21_chuzhuang_E178.png"), clip: { x: bb.x, y: bb.y, width: bb.width, height: Math.min(bb.height, 700) } }); }

  // ---------- 8) 关系全景：陈/宋阵营弧 ----------
  await p.goto(origin + "/#/relations", { waitUntil: "load" }); await p.waitForTimeout(1000);
  await p.screenshot({ path: path.join(OUT, "r21_panorama.png") });

  // ---------- 9) 搜索命中二人 ----------
  await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(400);
  const search = {};
  for (const kw of ["夏姬", "宋襄公", "株林"]) {
    search[kw] = await p.evaluate(async (k) => {
      const inp = document.querySelector("#global-search"); if (!inp) return { ok: false, reason: "无搜索框" };
      const tog = document.querySelector("#search-toggle"); if (tog) tog.click();
      inp.value = ""; inp.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise(r => setTimeout(r, 120));
      inp.value = k; inp.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise(r => setTimeout(r, 500));
      const pop = document.querySelector("#search-pop");
      const t = (pop && pop.textContent || "").replace(/\s+/g, " ");
      return { ok: t.includes(k), sample: t.slice(0, 110) };
    }, kw);
  }

  // ---------- 10) 23 人回归：播放按钮状态全查 ----------
  const reg = [];
  for (const id of PROTS) {
    await p.goto(origin + "/#/p/" + id + "/map", { waitUntil: "load" }); await p.waitForTimeout(360);
    const r = await p.evaluate(() => ({
      name: (document.querySelector(".person-nav .pn-name") || {}).textContent || "?",
      playHidden: document.querySelector("#btn-play").hidden,
      playDisabled: document.querySelector("#btn-play").disabled,
      degradeShown: !document.querySelector("#play-degrade").hidden,
      degradeText: (document.querySelector("#play-degrade") || {}).textContent || "",
      hasSvg: !!document.querySelector("#map-canvas svg"),
      status: (document.querySelector("#map-status") || {}).textContent || "",
    }));
    reg.push({ id, ...r });
  }

  // ---------- 11) 四档宽度 ----------
  const widths = [{ w: 1440, h: 900, n: "1440" }, { w: 1024, h: 800, n: "1024" }, { w: 768, h: 900, n: "768" }, { w: 390, h: 844, n: "390" }];
  const wres = [];
  for (const v of widths) {
    await p.setViewportSize({ width: v.w, height: v.h });
    await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(700);
    const r = await p.evaluate(() => ({
      docW: document.documentElement.scrollWidth, winW: window.innerWidth,
      overflowH: document.documentElement.scrollWidth > window.innerWidth + 1,
      chipOverflow: [...document.querySelectorAll(".person-card h3")].filter(h => h.scrollWidth > h.clientWidth + 1).length,
    }));
    await p.screenshot({ path: path.join(OUT, `r21_w${v.n}_home.png`), fullPage: false });
    // 夏姬时间线在该宽度下的层标条
    await p.goto(origin + "/#/p/P_XIAJI/timeline", { waitUntil: "load" }); await p.waitForTimeout(600);
    const cv = await p.evaluate(() => {
      document.querySelectorAll("#view-timeline details[data-eid]").forEach(d => { d.open = true; });
      return [...document.querySelectorAll("#view-timeline .q-caveat")].map(x => ({
        text: x.textContent, clipped: x.scrollWidth > x.clientWidth + 1 || x.scrollHeight > x.clientHeight + 1,
      }));
    });
    await p.waitForTimeout(200);
    const el = await p.$('#view-timeline details[data-eid="E179"]');
    if (el) { await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(200); }
    await p.screenshot({ path: path.join(OUT, `r21_w${v.n}_xiaji_caveat.png`) });
    wres.push({ ...v, ...r, caveats: cv });
  }
  await p.setViewportSize({ width: 1280, height: 900 });

  // ---------- 12) 分享卡自动 23 ----------
  await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(500);
  const share = await p.evaluate(async () => {
    const btn = [...document.querySelectorAll("button")].find(b => b.textContent.includes("生成分享卡"));
    if (!btn) return { ok: false, reason: "无入口" };
    btn.click();
    await new Promise(r => setTimeout(r, 900));
    const cv = document.querySelector("#share-canvas");
    if (!cv) return { ok: false, reason: "无 canvas" };
    // 数色签：扫描色签行，统计连续非底色区段数
    const ctx = cv.getContext("2d");
    const rowY = Math.round(cv.height === cv.width ? 324 : 428);
    // 只扫内框以内（x 60 起、W-60 止），排除青铜双线框的 4 条竖线被误计为色签
    const d = ctx.getImageData(0, rowY, cv.width, 1).data;
    let segs = 0, inSeg = false;
    for (let x = 60; x < cv.width - 60; x++) {
      const r = d[x * 4], g = d[x * 4 + 1], b = d[x * 4 + 2];
      const isBg = Math.abs(r - 244) < 12 && Math.abs(g - 237) < 12 && Math.abs(b - 223) < 12;
      if (!isBg && !inSeg) { segs++; inSeg = true; } else if (isBg) inSeg = false;
    }
    return { ok: true, w: cv.width, h: cv.height, tickSegments: segs, protoCount: (window.PROTAGONISTS || []).length || null };
  });
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(OUT, "r21_share_card.png") });

  // ================= 报告 =================
  say("\n===== r21 Vision 自验 =====");
  say("[1] 首页热区 " + home.hotspots.length + " 个：" + home.hotspots.join("/"));
  say("    徽记簇 " + home.clusterCount + " 簇；分区 " + home.groups.length + " 个：" + home.groups.join("/"));
  say("    色变量 --state-chen=" + home.chenVar + " --state-song=" + home.songVar +
    " --p-xiaji=" + home.xiajiVar + " --p-songxiang=" + home.songxVar);
  say("    陈面板：" + chenPanel.head + " · " + chenPanel.note + " → " + JSON.stringify(chenPanel.cards));
  say("    宋面板：" + songPanel.head + " → " + JSON.stringify(songPanel.cards));
  say("[2] 列表模式分区：" + listMode.groups.map(g => g.state + "(" + g.n + ")").join(" ") +
    "\n    选项卡：" + listMode.tabs.join("/") +
    "\n    流向 chip：" + listMode.flows.join(" ; ") +
    "\n    h3 溢出：" + (listMode.overflow.length ? listMode.overflow.join(" | ") : "无"));
  say("[3] 夏姬时间线 " + xjTl.name + " 事件 " + xjTl.eids.length + " 条：" + xjTl.eids.join(","));
  say("    presence：" + xjTl.presenceChips.join(" "));
  say("    层徽标：" + xjTl.layerBadges.join("/"));
  say("    编者层标 " + xjTl.caveats.length + " 条：" + JSON.stringify(xjTl.caveats));
  say("    结构（层标须在原文 <p> 之前）：" + xjTl.caveatBeforeQuote.join(" ;; "));
  say("    footer 残留【】：" + (xjTl.footerLeftover.length ? xjTl.footerLeftover.join(" | ") : "无"));
  say("[4] 夏姬地图 状态行：" + xjMap.status);
  say("    轨迹点：" + xjMap.trajPts + " | 播放隐藏=" + xjMap.playHidden + " 降级显=" + xjMap.degradeShown);
  say("    亲至(实心) " + xjMap.solid.length + "：" + xjMap.solid.join("、"));
  say("    相关(空心) " + xjMap.hollow.length + "：" + xjMap.hollow.join("、"));
  say("[5] 夏姬 ego 节点：" + xjEgo.nodeLabels.join("/") + " | 边数=" + xjEgo.edges);
  say("[6] 宋襄公时间线 " + sxTl.name + " " + sxTl.eids.length + " 条：" + sxTl.eids.join(","));
  say("    presence：" + sxTl.presence.join(" "));
  say("    宋襄公地图 状态行：" + sxMap.status);
  say("    亲至 " + sxMap.solid.length + "：" + sxMap.solid.join("、"));
  say("    相关 " + sxMap.hollow.length + "：" + sxMap.hollow.join("、"));
  say("[7] 楚庄王线 " + czTl.count + " 条 | E178=" + JSON.stringify(czTl.E178) + " | E179=" + JSON.stringify(czTl.E179));
  say("[9] 搜索：" + Object.entries(search).map(([k, v]) => k + "=" + v.ok).join(" ") +
    "\n    样本 夏姬：" + (search["夏姬"].sample || "") +
    "\n    样本 宋襄公：" + (search["宋襄公"].sample || "") +
    "\n    样本 株林：" + (search["株林"].sample || ""));
  say("[10] 23 人回归：");
  for (const r of reg) {
    say("    " + (r.hasSvg ? "✓" : "✗无图") + " " + r.id + " " + r.name +
      " | 播放" + (r.playHidden ? "隐藏" : "在场") + (r.playDisabled ? "(disabled)" : "") +
      " 降级" + (r.degradeShown ? "显" : "隐") + " | " + r.status);
  }
  say("    降级清单：" + reg.filter(r => r.degradeShown).map(r => r.name).join("、") || "（无）");
  say("    无图：" + (reg.filter(r => !r.hasSvg).map(r => r.id).join("、") || "无"));
  say("[11] 四档宽度：");
  for (const w of wres) say("    " + w.n + "px 横向溢出=" + w.overflowH + " (doc " + w.docW + "/win " + w.winW + ")" +
    " h3溢出数=" + w.chipOverflow + " 层标截断=" + JSON.stringify(w.caveats.map(c => c.clipped)));
  say("[12] 分享卡：" + JSON.stringify(share));
  say("页面错误：" + (errs.length ? errs.join(" | ") : "无"));
  fs.writeFileSync(path.join(OUT, "r21_report.txt"), log.join("\n"), "utf8");
  await b.close(); if (s) s.close();
})().catch(e => { console.error(e); process.exit(1); });
