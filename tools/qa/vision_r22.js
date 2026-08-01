"use strict";
// r22 Vision 自验：三贤（鲍叔牙/曹刿/介之推）上线——三阶色/三徽记/分享卡国色点改造＋三线走查＋26主角回归
const http = require("http"), fs = require("fs"), path = require("path");
const SITE_DIR = path.resolve(__dirname, "..", "..", "site");
const OUT = path.resolve(__dirname, "screenshots");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
function srv(root) { return new Promise((res, rej) => { const s = http.createServer((rq, rs) => { let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]); if (u === "/") u = "/index.html"; const fp = path.join(root, u); if (!fp.startsWith(root)) { rs.writeHead(403); rs.end(); return; } fs.readFile(fp, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(fp).toLowerCase()] || "application/octet-stream" }); rs.end(d); }); }); s.on("error", rej); s.listen(0, "127.0.0.1", () => res(s)); }); }
const log = [];
const say = (...a) => { const s = a.join(" "); log.push(s); console.log(s); };
const H = (t) => say("\n===== " + t + " =====");

(async () => {
  const pw = require("playwright");
  const baseURL = process.env.QA_BASE_URL || null;
  let s = null, origin = baseURL;
  if (!origin) { s = await srv(SITE_DIR); origin = `http://127.0.0.1:${s.address().port}`; say("本地服务器：" + origin); }
  else say("真机 QA_BASE_URL：" + origin);
  const b = await pw.chromium.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2,
    extraHTTPHeaders: { "Cache-Control": "no-cache", "Pragma": "no-cache" } });
  // 线上复验时绕开 CDN 边缘缓存（部署直后边缘可能仍供旧副本；本地跑无副作用）
  await c.route("**/*.{js,css,json,svg}", r => r.continue({ headers: { ...r.request().headers(), "Cache-Control": "no-cache" } }));
  await c.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) { } });
  const p = await c.newPage(); const errs = [];
  p.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
  const warns = [];
  p.on("console", m => { if (m.type() === "warning" || m.type() === "error") warns.push(m.type() + ": " + m.text()); });

  // ---------- 0) 启动与色变量注册 ----------
  H("0) 26 主角注册与三新色读入");
  await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(900);
  const boot = await p.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      n: PROTAGONISTS.length,
      newOnes: ["P_BAOSHUYA", "P_CAOGUI", "P_JIEZHITUI"].map(id => {
        const m = PROTAGONISTS.find(x => x.id === id);
        return { id, color: m && m.color, badge: m && m.badge, inData: !!PEOPLE[id], name: PEOPLE[id] && PEOPLE[id].name };
      }),
      vars: { baoshuya: cs.getPropertyValue("--p-baoshuya").trim(), caogui: cs.getPropertyValue("--p-caogui").trim(), jiezhitui: cs.getPropertyValue("--p-jiezhitui").trim() },
      fams: Object.keys(STATE_FAMILY_VAR).map(k => k + "=" + familyColor(k)),
      groups: [...document.querySelectorAll("#person-groups .state-group")].map(g => (g.querySelector(".state-name") || {}).textContent),
    };
  });
  say("主角数：" + boot.n);
  boot.newOnes.forEach(x => say("  " + x.id + " 名=" + x.name + " 色=" + x.color + " 徽记=" + x.badge + " 数据在库=" + x.inData));
  say("CSS 变量：" + JSON.stringify(boot.vars));
  say("九国色家族（分享卡与首页同源）：" + boot.fams.join(" | "));
  say("首页分区序：" + boot.groups.join("/"));

  // ---------- 1) 齐组六人色阶 ----------
  H("1) 齐组六人色阶（截图）");
  const qi = await p.evaluate(() => {
    const g = [...document.querySelectorAll("#person-groups .state-group")].find(x => (x.querySelector(".state-name") || {}).textContent.indexOf("齐") === 0);
    if (!g) return null;
    return [...g.querySelectorAll(".person-card")].map(cd => ({
      name: ((cd.querySelector("h3") || {}).textContent || "").replace(/\s+/g," ").trim(),
      color: cd.style.getPropertyValue("--card-color"),
    }));
  });
  say("齐分区卡：" + JSON.stringify(qi));
  await p.goto(origin + "/#/?home=list", { waitUntil: "load" }); await p.waitForTimeout(700);
  const qbox = await p.$("#person-groups .state-group");
  if (qbox) { await qbox.screenshot({ path: path.join(OUT, "r22_qi_six.png") }); say("截图 r22_qi_six.png"); }

  // ---------- 2) 三人轨迹（站数与站序） ----------
  H("2) 三人亲至轨迹实测（站数·站序）");
  for (const pid of ["P_BAOSHUYA", "P_CAOGUI", "P_JIEZHITUI"]) {
    await p.goto(origin + "/#/p/" + pid + "/map", { waitUntil: "load" }); await p.waitForTimeout(900);
    const t = await p.evaluate((pid) => {
      const tr = (typeof buildTraj === "function") ? buildTraj(pid) : null;
      const status = (document.querySelector("#map-status") || {}).textContent || "";
      const solid = [...document.querySelectorAll("#map-anchors .anchor")].map(g => ({
        n: (g.getAttribute("aria-label") || ""), cls: g.getAttribute("class"),
      }));
      return {
        track: tr && tr.map(x => (x.placeNames || []).join("/") + " [" + (x.events || []).map(e => e.id + "/" + e.year_bce).join(",") + "]"),
        status, anchors: solid.length,
      };
    }, pid);
    say(pid + " 轨迹站数=" + (t.track ? t.track.length : "n/a"));
    (t.track || []).forEach((x, i) => say("   " + (i + 1) + ". " + x));
    say("   状态行：" + t.status.trim().replace(/\s+/g, " "));
    await p.screenshot({ path: path.join(OUT, "r22_map_" + pid + ".png") });
  }

  // ---------- 3a) 并观 管仲 × 鲍叔牙 ----------
  H("3a) 并观 管仲×鲍叔牙（堂阜 E046 应为 a 级同场）");
  await p.goto(origin + "/#compare=P_GUANZHONG,P_BAOSHUYA", { waitUntil: "load" }); await p.waitForTimeout(1200);
  const cmpRes = await p.evaluate(() => {
    const items = [...document.querySelectorAll(".cmp-meet-row")].map(li => li.className + " ｜ " + li.textContent.replace(/\s+/g, " ").trim());
    return { hash: location.hash, items, degrade: (document.querySelector("#cmp-play-note") || {}).textContent || "" };
  });
  say("交会列表 " + cmpRes.items.length + " 条：");
  cmpRes.items.forEach(x => say("   · " + x));
  await p.screenshot({ path: path.join(OUT, "r22_compare_guan_bao.png"), fullPage: false });

  // ---------- 3a') E186 medium 徽标 ----------
  H("3a') E186 reliability=medium 徽标呈现");
  await p.goto(origin + "/#/p/P_BAOSHUYA/timeline", { waitUntil: "load" }); await p.waitForTimeout(900);
  const e186 = await p.evaluate(() => {
    const det = document.querySelector('details[data-eid="E186"]');
    if (!det) return null; det.open = true;
    const chips = [...det.querySelectorAll(".chip, .evt-chip, [class*=rel-]")].map(x => x.className + " → " + x.textContent.trim());
    return { title: (det.querySelector("summary") || {}).textContent.replace(/\s+/g, " ").trim(), chips };
  });
  say("E186：" + (e186 ? e186.title : "未找到"));
  (e186 ? e186.chips : []).forEach(x => say("   chip " + x));
  const e186el = await p.$('details[data-eid="E186"]');
  if (e186el) { await e186el.scrollIntoViewIfNeeded(); await p.waitForTimeout(300); await e186el.screenshot({ path: path.join(OUT, "r22_E186_medium.png") }); }

  // ---------- 3b) 介之推 E095/E185 与焚山 Q227 ----------
  H("3b) 介之推 E095/E185 拆分＋焚山 Q227 分层呈现");
  await p.goto(origin + "/#/p/P_JIEZHITUI/timeline", { waitUntil: "load" }); await p.waitForTimeout(900);
  const jie = await p.evaluate(() => {
    const out = [];
    for (const eid of ["E093", "E095", "E185"]) {
      const det = document.querySelector('details[data-eid="' + eid + '"]');
      if (!det) { out.push({ eid, miss: true }); continue; }
      det.open = true;
      out.push({
        eid, title: (det.querySelector("summary") || {}).textContent.replace(/\s+/g, " ").trim(),
        quotes: [...det.querySelectorAll("blockquote.quote")].map(bq => ({
          qid: bq.dataset.qid, cls: bq.className,
          layer: (bq.querySelector(".q-layer") || {}).textContent || "",
          caveat: (bq.querySelector(".q-caveat") || {}).textContent || "",
          footHead: ((bq.querySelector("footer") || {}).textContent || "").slice(0, 110),
        })),
      });
    }
    return out;
  });
  jie.forEach(e => {
    say(e.eid + " " + (e.miss ? "缺失!" : e.title));
    (e.quotes || []).forEach(q => say("   " + q.qid + " 层徽标=「" + q.layer + "」 编者层标=「" + q.caveat + "」 class=" + q.cls + "\n       footer: " + q.footHead));
  });
  const q227 = await p.$('blockquote[data-qid="Q227"]');
  if (q227) { await q227.scrollIntoViewIfNeeded(); await p.waitForTimeout(300); await q227.screenshot({ path: path.join(OUT, "r22_Q227_fenshan.png") }); say("截图 r22_Q227_fenshan.png"); }
  const q224 = await p.$('blockquote[data-qid="Q224"]');
  if (q224) { await q224.scrollIntoViewIfNeeded(); await p.waitForTimeout(200); await q224.screenshot({ path: path.join(OUT, "r22_Q224_yanlun.png") }); }

  // ---------- 3c) 曹刿 长勺/柯盟 与 L001 ----------
  H("3c) 曹刿 长勺×柯盟对读＋穀梁 L001 首秀");
  await p.goto(origin + "/#/p/P_CAOGUI/timeline", { waitUntil: "load" }); await p.waitForTimeout(900);
  const cao = await p.evaluate(() => {
    const out = [];
    for (const eid of ["E047", "E052", "E056"]) {
      const det = document.querySelector('details[data-eid="' + eid + '"]');
      if (!det) { out.push({ eid, miss: true }); continue; }
      det.open = true;
      out.push({
        eid, title: (det.querySelector("summary") || {}).textContent.replace(/\s+/g, " ").trim(),
        quotes: [...det.querySelectorAll("blockquote.quote")].map(bq => {
          const cs = getComputedStyle(bq);
          return { qid: bq.dataset.qid, layer: (bq.querySelector(".q-layer") || {}).textContent || "(无徽标·原文)", cls: bq.className, border: cs.borderLeftColor + " " + cs.borderLeftStyle, foot: ((bq.querySelector("footer") || {}).textContent || "").slice(0, 60) };
        }),
      });
    }
    return out;
  });
  cao.forEach(e => {
    say(e.eid + " " + (e.miss ? "缺失!" : e.title));
    (e.quotes || []).forEach(q => say("   " + q.qid + " 层=「" + q.layer + "」 左线=" + q.border + "\n       " + q.foot));
  });
  const e052 = await p.$('details[data-eid="E052"]');
  if (e052) { await e052.scrollIntoViewIfNeeded(); await p.waitForTimeout(300); await e052.screenshot({ path: path.join(OUT, "r22_E052_L001.png") }); }

  // ---------- 3d) flow-chip 与 ego 图 ----------
  H("3d) flow-chip 复核（介之推单晋／鲍叔牙单齐）");
  await p.goto(origin + "/#/?home=list", { waitUntil: "load" }); await p.waitForTimeout(800);
  const chips = await p.evaluate(() => {
    const out = {};
    [...document.querySelectorAll(".person-card")].forEach(cd => {
      const nm = (cd.querySelector("h3") || {}).textContent || "";
      const fc = cd.querySelector(".flow-chip");
      out[nm.replace(/\s+/g, " ").trim()] = fc ? fc.textContent.trim() : "(无 chip)";
    });
    return out;
  });
  ["鲍叔牙", "曹刿", "介之推", "夏姬", "息妫", "文姜"].forEach(n => {
    const k = Object.keys(chips).find(x => x.indexOf(n) >= 0);
    say("  " + n + " → " + (k ? chips[k] : "未找到卡") + (k && chips[k] === "(无 chip)" ? "  ← state 单国，按规则不出 chip＝正确（无全链残留）" : ""));
  });
  for (const pid of ["P_BAOSHUYA", "P_CAOGUI", "P_JIEZHITUI"]) {
    await p.goto(origin + "/#/p/" + pid + "/relations", { waitUntil: "load" }); await p.waitForTimeout(900);
    const ego = await p.evaluate(() => ({
      nodes: document.querySelectorAll("#rel-canvas .rel-node").length,
      edges: document.querySelectorAll("#rel-canvas .rel-edge").length,
      names: [...document.querySelectorAll("#rel-canvas .rel-node")].map(n => (n.textContent || "").replace(/\s+/g, " ").trim()).filter(Boolean).join("、"),
    }));
    say("  " + pid + " ego 节点=" + ego.nodes + " 边=" + ego.edges + "\n      邻接：" + ego.names);
    await p.screenshot({ path: path.join(OUT, "r22_ego_" + pid + ".png") });
  }

  // ---------- 4) 26 人回归：播放状态 ----------
  H("4) 26 人回归 · 地图播放状态全查");
  const ALL = boot.newOnes && await p.evaluate(() => PROTAGONISTS.map(m => m.id));
  const degraded = [], playable = [];
  for (const pid of ALL) {
    await p.goto(origin + "/#/p/" + pid + "/map", { waitUntil: "load" }); await p.waitForTimeout(560);
    const r = await p.evaluate(() => {
      const btn = document.querySelector("#btn-play");
      const note = document.querySelector(".play-degrade, #play-degrade");
      return { hidden: !btn || btn.hidden, disabled: !!(btn && btn.disabled), note: note ? note.textContent.trim() : "", status: ((document.querySelector("#map-status") || {}).textContent || "").replace(/\s+/g, " ").trim() };
    });
    if (r.hidden || r.disabled) { degraded.push(pid + " ← " + r.note); } else playable.push(pid);
    say("  " + pid + (r.hidden || r.disabled ? " 降级" : " 可播") + " | " + r.status);
  }
  say("可播 " + playable.length + " 人；降级 " + degraded.length + " 人：" + degraded.join(" ; "));

  // ---------- 5) 搜索命中 ----------
  H("5) 搜索命中");
  await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(700);
  for (const kw of ["鲍叔牙", "曹刿", "曹沫", "介之推", "堂阜", "长勺", "绵上", "生窦"]) {
    const hit = await p.evaluate(async (kw) => {
      const inp = document.querySelector("#global-search");
      if (!inp) return "无搜索框";
      inp.focus(); inp.value = kw; inp.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise(r => setTimeout(r, 500));
      const box = document.querySelector("#search-pop");
      if (!box || box.hidden) return "结果面板未开";
      const rows = [...box.querySelectorAll('[role="option"], li')].map(x => x.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
      return rows.length + " 条：" + rows.slice(0, 5).join(" ／ ");
    }, kw);
    say("  「" + kw + "」→ " + hit);
  }

  // ---------- 6) 分享卡（九枚国色点） ----------
  H("6) 分享卡国色点实测");
  const share = await p.evaluate(async () => {
    const btn = [...document.querySelectorAll("button,a")].find(x => /生成分享卡/.test(x.textContent));
    if (!btn) return { err: "未找到入口" };
    btn.click();
    await new Promise(r => setTimeout(r, 1400));
    const cv = document.querySelector("#share-canvas");
    if (!cv) return { err: "无 canvas" };
    const fams = Object.keys(STATE_FAMILY_VAR);
    const dotR = 10, dotGap = 44;
    const rowW = (fams.length - 1) * dotGap + 2 * dotR;
    const left = cv.width / 2 - rowW / 2;
    return {
      w: cv.width, h: cv.height, fams: fams.length, rowW,
      left, right: left + rowW,
      innerLeft: 44, innerRight: cv.width - 44,
      marginLeft: left - 44, marginRight: (cv.width - 44) - (left + rowW),
      dataUrl: cv.toDataURL("image/png"),
    };
  });
  if (share.err) say("分享卡：" + share.err);
  else {
    say("画布 " + share.w + "×" + share.h + "，国色点 " + share.fams + " 枚，一行宽 " + share.rowW + "px");
    say("色点行 x " + share.left + "–" + share.right + "；内框净区 x " + share.innerLeft + "–" + share.innerRight);
    say("左右余量各 " + share.marginLeft + "px / " + share.marginRight + "px");
    say("对照：旧法（每主角一枚）26 人一行宽 = 40×26−14 = " + (40 * 26 - 14) + "px，起点 x = " + (share.w / 2 - (40 * 26 - 14) / 2) + "（外框 x=30、内框 x=44 ⇒ 触框）");
    fs.writeFileSync(path.join(OUT, "r22_share_card.png"), Buffer.from(share.dataUrl.split(",")[1], "base64"));
    say("已保存 r22_share_card.png");
  }
  await p.screenshot({ path: path.join(OUT, "r22_share_dialog.png") });

  // ---------- 7) 四档宽度 ----------
  H("7) 四档宽度（1440/1024/768/390）横向溢出与三人卡");
  for (const w of [1440, 1024, 768, 390]) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.goto(origin + "/#/?home=list", { waitUntil: "load" }); await p.waitForTimeout(700);
    const ov = await p.evaluate(() => ({ over: document.documentElement.scrollWidth > document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    say("  " + w + "px 选人页 横向溢出=" + ov.over + " (" + ov.sw + "/" + ov.cw + ")");
    await p.goto(origin + "/#/p/P_JIEZHITUI/timeline", { waitUntil: "load" }); await p.waitForTimeout(700);
    const ov2 = await p.evaluate(() => {
      const det = document.querySelector('details[data-eid="E095"]'); if (det) det.open = true;
      return { over: document.documentElement.scrollWidth > document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
    });
    say("  " + w + "px 介之推时间线 横向溢出=" + ov2.over + " (" + ov2.sw + "/" + ov2.cw + ")");
    await p.screenshot({ path: path.join(OUT, "r22_w" + w + ".png") });
  }
  await p.setViewportSize({ width: 1280, height: 900 });

  H("控制台");
  say("pageerror：" + (errs.length ? errs.join(" | ") : "无"));
  say("console warn/error：" + (warns.length ? warns.join(" | ") : "无"));

  fs.writeFileSync(path.join(OUT, "r22_report.txt"), log.join("\n"), "utf8");
  await b.close(); if (s) s.close();
})().catch(e => { console.error(e); process.exit(1); });
