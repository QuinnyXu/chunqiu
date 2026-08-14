"use strict";
/* 经纬春秋 · r28 Vision 走查（吴越终章：越分区／33 人／夫差·勾践两枚徽记／属镂三节层标）
 *
 * 本脚本是 r28 的**专项走查与出图**门，回归总门仍是 tools/qa/vision_r24a.js（§20 已并入 r28 断言）。
 * 分工同 r27：总门管「既有各节不因本轮而红」，本脚本管「本轮新增之物是否真的到位」并出截图。
 *
 * 节次：
 *   §1  越分区（第 11 分区）几何：色块／国名／簇心在块内／块不入海／与吴簇不相犯
 *   §2  33 人全流程：名册四方对账 ＋ 六处呈现（选人／首页／时间线／地图／并观可选／全景默认环）
 *   §3  全景 33 槽距实测（2R·sin(π/33) 现算再对 DOM）
 *   §4  夫差／勾践人物地图：轨迹、「N 条事件无地望」计数**实指哪条**
 *   §5  甬东走**地点侧**：地点行在、坐标「未定位」、说明可读；且**不入**任何无地望计数
 *   §6  属镂条（E248）三节层标——终章大考的前端呈现
 *   §7  「卧薪尝胆」注文展示（Q427 后出叙事层 ＋ 其分层说明）
 *   §8  泛舟五湖 G 层（Q435）
 *   §9  并观 夫差×勾践（宿敌并观）——交会级别与地点逐一报数
 *   §10 季札历聘立目后：晏婴／子产／叔向三线的实际增量与**三人两两交会数对账**
 *   §11 四档宽度（1440／1024／768／390）
 *
 * 跑法：node tools/qa/vision_r28.js
 */
const http = require("http"), fs = require("fs"), path = require("path");
const SITE_DIR = path.resolve(__dirname, "..", "..", "site");
const OUT = path.resolve(__dirname, "screenshots");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
function srv(root) { return new Promise((res, rej) => { const s = http.createServer((rq, rs) => { let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]); if (u === "/") u = "/index.html"; const fp = path.join(root, u); if (!fp.startsWith(root)) { rs.writeHead(403); rs.end(); return; } fs.readFile(fp, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(fp).toLowerCase()] || "application/octet-stream" }); rs.end(d); }); }); s.on("error", rej); s.listen(0, "127.0.0.1", () => res(s)); }); }
let nFail = 0;
const say = (...a) => console.log(a.join(" "));
const H = (t) => say("\n===== " + t + " =====");
const OK = (c, t) => { if (!c) nFail++; say((c ? "  [OK]   " : "  [FAIL] ") + t); };

(async () => {
  const pw = require("playwright");
  const s = await srv(SITE_DIR);
  const origin = `http://127.0.0.1:${s.address().port}`;
  say("本地服务器：" + origin);
  const b = await pw.chromium.launch();
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await c.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) { } });
  const p = await c.newPage();
  const errs = [];
  p.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
  /* Cloudflare Analytics beacon 是 conventions §9.2 例外清单内的外部资源，
   * 本地 127.0.0.1 起服务时它必然 CORS 失败——那是环境噪声，不是站点缺陷，故按域名滤除。 */
  const NOISE = /cloudflareinsights|cdn-cgi\/rum|ERR_FAILED/;
  p.on("console", m => { if (m.type() === "error" && !NOISE.test(m.text())) errs.push("CONSOLE: " + m.text()); });
  fs.mkdirSync(OUT, { recursive: true });

  /* ================= §1 越分区几何 ================= */
  H("§1 越分区（第 11 分区）几何");
  await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(1200);
  const g1 = await p.evaluate(() => {
    const svg = document.querySelector("#home-map svg") || document.querySelector("#home-map");
    const q = (sel) => svg ? svg.querySelector(sel) : null;
    const yueBlk = q('#layer-states-southeast ellipse[data-state="越"]');
    const wuBlk = q('#layer-states-southeast ellipse[data-state="吴"]');
    const yueLbl = q('#layer-labels text[data-state="越"]');
    const clusters = [...document.querySelectorAll("[data-home-state]")].map(e => ({
      st: e.dataset.homeState,
      box: (() => { const r = e.getBBox ? e.getBBox() : null; return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; })(),
    }));
    return {
      hasYueBlk: !!yueBlk,
      yue: yueBlk ? { cx: +yueBlk.getAttribute("cx"), cy: +yueBlk.getAttribute("cy"), rx: +yueBlk.getAttribute("rx"), ry: +yueBlk.getAttribute("ry") } : null,
      wu: wuBlk ? { cx: +wuBlk.getAttribute("cx"), cy: +wuBlk.getAttribute("cy"), rx: +wuBlk.getAttribute("rx"), ry: +wuBlk.getAttribute("ry") } : null,
      hasYueLbl: !!yueLbl,
      yueLbl: yueLbl ? { x: +yueLbl.getAttribute("x"), y: +yueLbl.getAttribute("y") } : null,
      clusters,
    };
  });
  OK(g1.hasYueBlk, "底图 layer-states-southeast 有越色块" + (g1.yue ? `（${g1.yue.cx},${g1.yue.cy} r ${g1.yue.rx}×${g1.yue.ry}）` : ""));
  OK(g1.hasYueLbl, "底图有「越」国名" + (g1.yueLbl ? `（${g1.yueLbl.x},${g1.yueLbl.y}）` : ""));
  // 簇心（app.js HOME_BADGE_POS）与块的关系：读页内常量不可行，改由 DOM 徽记圆实测
  const g1b = await p.evaluate(() => {
    const circles = [...document.querySelectorAll("#home-map circle")].filter(c => Math.abs(+c.getAttribute("r") - 13.5) < 0.01);
    return circles.map(c => ({ cx: +c.getAttribute("cx"), cy: +c.getAttribute("cy"), title: (c.parentNode && c.parentNode.textContent || "").slice(0, 20) }));
  });
  say("  首页徽记圆共 " + g1b.length + " 枚（＝主角数）");
  const yueCs = g1b.filter(c => c.cy > 620);           // 越块所在纬带
  OK(yueCs.length === 1, "越分区徽记 1 枚（勾践）：" + JSON.stringify(yueCs));
  if (g1.yue && yueCs.length) {
    const c0 = yueCs[0], R = 13.5;
    const norm = (x, y) => Math.pow((x - g1.yue.cx) / g1.yue.rx, 2) + Math.pow((y - g1.yue.cy) / g1.yue.ry, 2);
    const worst = Math.max(norm(c0.cx + R, c0.cy + R), norm(c0.cx - R, c0.cy - R), norm(c0.cx + R, c0.cy - R), norm(c0.cx - R, c0.cy + R));
    OK(worst < 1, "越徽记（含 R=13.5 圆）落在越色块椭圆内，最远角归一化 " + worst.toFixed(3) + " < 1");
    // 块不入海：椭圆右缘在杭州湾南岸线（(1127,630)→(1145,646)→(1173,669)）之西
    const coast = [[1127, 630], [1136, 636], [1145, 646], [1154, 655], [1164, 663], [1173, 669]];
    let bad = [];
    for (const [cx, cy] of coast) {
      const dy = cy - g1.yue.cy;
      if (Math.abs(dy) >= g1.yue.ry) continue;
      const halfW = g1.yue.rx * Math.sqrt(1 - Math.pow(dy / g1.yue.ry, 2));
      const right = g1.yue.cx + halfW;
      if (right > cx) bad.push(`y=${cy} 块右缘 ${right.toFixed(1)} > 岸 ${cx}`);
    }
    OK(bad.length === 0, "越色块不入海（逐个岸线取样点核块右缘）" + (bad.length ? "：" + bad.join("；") : ""));
    const wuC = g1b.filter(x => x.cy > 520 && x.cy < 600);
    if (wuC.length) {
      const d = Math.hypot(wuC[0].cx - c0.cx, wuC[0].cy - c0.cy);
      OK(d > 27, `越簇心与吴簇心相距 ${d.toFixed(1)}px ＞ 两徽记直径 27px`);
    }
  }
  await p.screenshot({ path: path.join(OUT, "r28_01_home.png"), fullPage: false });
  const homeSvg = await p.locator("#home-map").boundingBox();
  if (homeSvg) {
    await p.screenshot({
      path: path.join(OUT, "r28_02_home_wuyue.png"),
      clip: { x: homeSvg.x + homeSvg.width * 0.78, y: homeSvg.y + homeSvg.height * 0.60, width: homeSvg.width * 0.22, height: homeSvg.height * 0.40 },
    });
  }

  /* ================= §2 33 人全流程 ================= */
  H("§2 33 人全流程（名册对账 ＋ 六处呈现）");
  const roster = await p.evaluate(async () => {
    const d = await (await fetch("data/people.json")).json();
    const arr = Array.isArray(d) ? d : (d.items || Object.values(d));
    return { dataPro: arr.filter(x => +x.is_protagonist === 1).map(x => x.id) };
  });
  /* 选人页即首页（#/），人物卡为 #person-groups 内的 button.person-card，无 data-person 属性，
   * 故按「卡数 ＋ 卡内文本」实测——这是 DOM 实况，不是我想当然的属性名。 */
  const pick = await p.evaluate(() => {
    const cards = [...document.querySelectorAll("#person-groups .person-card")];
    return {
      n: cards.length,
      enabled: cards.filter(e => !e.disabled).length,
      has: { fucha: cards.some(e => /夫差/.test(e.textContent)), goujian: cards.some(e => /勾践/.test(e.textContent)) },
      groups: [...document.querySelectorAll("#person-groups h3, #person-groups .group-title, #person-groups .state-name")].map(e => e.textContent.trim()).filter(Boolean),
      yueCard: (cards.find(e => /勾践/.test(e.textContent)) || {}).textContent || "",
    };
  });
  say("  数据侧 is_protagonist=1 共 " + roster.dataPro.length + " 人");
  OK(roster.dataPro.length === 33, "数据侧主角 33 人");
  OK(pick.n === 33, "选人页 33 张人物卡（实测 " + pick.n + "）");
  OK(pick.enabled === 33, "33 张卡皆可点入（实测可点 " + pick.enabled + "）");
  OK(pick.has.fucha && pick.has.goujian, "选人页含夫差、勾践");
  say("  选人页分组：" + pick.groups.join(" / "));
  say("  勾践卡：" + pick.yueCard.replace(/\s+/g, " ").slice(0, 110));
  await p.screenshot({ path: path.join(OUT, "r28_03_pick_33.png"), fullPage: true });
  const brand = await p.evaluate(() => (document.querySelector("#brand-caption") || {}).textContent || "");
  say("  页脚品牌语：" + brand);
  OK(/33\s*条人物线/.test(brand), "页脚品牌语报 33 条人物线（取实际可进者）");

  for (const [pid, nm] of [["P_FUCHA", "夫差"], ["P_GOUJIAN", "勾践"]]) {
    await p.goto(origin + "/#/p/" + pid + "/timeline", { waitUntil: "load" }); await p.waitForTimeout(1100);
    const t = await p.evaluate(() => ({
      title: (document.querySelector("#timeline-nameline") || {}).textContent || "",
      events: document.querySelectorAll("#timeline-list details[data-eid]").length,
      theme: getComputedStyle(document.documentElement).getPropertyValue("--theme").trim(),
    }));
    OK(new RegExp(nm).test(t.title), nm + " 时间线可入（姓名行「" + t.title.replace(/\s+/g, " ").trim().slice(0, 40) + "」）");
    OK(t.events === 11, nm + " 时间线 11 条事件（实测 " + t.events + "）");
    say("    --theme " + t.theme);
    await p.screenshot({ path: path.join(OUT, "r28_04_timeline_" + pid + ".png"), fullPage: true });
  }

  /* ================= §3 全景 33 槽距 ================= */
  H("§3 关系全景 33 槽距");
  await p.goto(origin + "/#/relations", { waitUntil: "load" }); await p.waitForTimeout(1800);
  await p.evaluate(() => { const b = document.querySelector("#btn-rel-mode"); if (b && b.getAttribute("aria-pressed") !== "true") b.click(); });
  await p.waitForTimeout(1700);
  /* 全景主角节点＝ #rel-canvas 内 r=15 的 circle（配角 r=8）；徽记另在 badgeTop 顶层。 */
  const pano = await p.evaluate(() => {
    const cs = [...document.querySelectorAll("#rel-canvas circle")].filter(c => Math.abs(+c.getAttribute("r") - 15) < 0.01);
    return { n: cs.length, pts: cs.map(c => ({ x: +c.getAttribute("cx"), y: +c.getAttribute("cy") })),
             badges: document.querySelectorAll("#rel-canvas svg").length };
  });
  say("  全景默认环节点数：" + pano.n);
  OK(pano.n === 33, "全景默认环 33 槽（33 主角）");
  if (pano.pts.length > 2) {
    const cx = pano.pts.reduce((s, q) => s + q.x, 0) / pano.pts.length;
    const cy = pano.pts.reduce((s, q) => s + q.y, 0) / pano.pts.length;
    const R = pano.pts.reduce((s, q) => s + Math.hypot(q.x - cx, q.y - cy), 0) / pano.pts.length;
    const slot = 2 * R * Math.sin(Math.PI / pano.n);
    let minD = Infinity;
    for (let i = 0; i < pano.pts.length; i++) for (let j = i + 1; j < pano.pts.length; j++) {
      minD = Math.min(minD, Math.hypot(pano.pts[i].x - pano.pts[j].x, pano.pts[i].y - pano.pts[j].y));
    }
    say(`  环半径 R≈${R.toFixed(1)}；现算槽距 2R·sin(π/${pano.n}) = ${slot.toFixed(2)}px；DOM 实测最近两点 ${minD.toFixed(2)}px`);
    OK(slot > 30, `槽距 ${slot.toFixed(2)} ＞ 节点直径 30`);
    OK(slot > 22, `槽距 ${slot.toFixed(2)} ＞ 徽记边长 22`);
  }
  await p.locator("#rel-canvas").screenshot({ path: path.join(OUT, "r28_05_pano_33.png") }).catch(() => {});

  /* ================= §4 夫差／勾践地图与无地望计数 ================= */
  H("§4 夫差／勾践人物地图：轨迹与「N 条事件无地望」实指");
  for (const [pid, nm] of [["P_FUCHA", "夫差"], ["P_GOUJIAN", "勾践"]]) {
    await p.goto(origin + "/#/p/" + pid + "/map", { waitUntil: "load" }); await p.waitForTimeout(1300);
    const m = await p.evaluate(() => {
      const ng = document.querySelector("#map-nogeo");
      const sum = document.querySelector("#map-nogeo-summary");
      const list = [...document.querySelectorAll("#map-nogeo-list li")].map(e => e.textContent.trim());
      const traj = [...document.querySelectorAll("#layer-anchors .traj")].map(e => e.textContent.trim()).filter(t => /^\d+$/.test(t));
      const solid = document.querySelectorAll("#layer-anchors circle.visited, #layer-anchors .anchor-visited").length;
      const nocoord = [...document.querySelectorAll("#nocoord-list li")].map(e => e.textContent.trim());
      const status = (document.querySelector("#map-status, .map-status") || {}).textContent || "";
      return { hidden: ng ? ng.hidden : null, sum: sum ? sum.textContent : "", list, trajN: traj.length, solid, nocoord, status: status.trim() };
    });
    say("  【" + nm + "】" + m.sum);
    say("    无地望明细：" + (m.list.join(" | ") || "（空）"));
    say("    未定位地点侧栏：" + (m.nocoord.join(" | ") || "（空）"));
    say("    轨迹序号数：" + m.trajN + "；状态行：" + m.status.slice(0, 120));
    OK(/^1 条事件无地望/.test(m.sum), nm + " 无地望计数为 1 条");
    OK(m.list.length === 1 && /吴许越成/.test(m.list[0]), nm + " 之无地望一条实指 E246「吴许越成」：" + (m.list[0] || ""));
    OK(!m.nocoord.some(x => /甬东/.test(x)), nm + " 之「未定位地点」侧栏**不含**甬东（全库无事目落其上，裁定 4）");
    await p.screenshot({ path: path.join(OUT, "r28_06_map_" + pid + ".png"), fullPage: false });
  }

  /* ================= §5 甬东走地点侧 ================= */
  H("§5 甬东：地点侧展示（地点行在、坐标未定位、说明可读）");
  /* 资料库只有 background／archaeology／sources 三页签（LIB_TABS），**没有地点页**；
   * 地点的正式入口是全站搜索「地点」组 → goSearchPlace → 落某主角地图并弹出地点卡。
   * 甬东全库无事目落其上，故其在**任何主角地图上都无锚点**——本节要验的正是
   * 「无锚点之地点，卡片仍打得开、留空之由仍读得到」。 */
  await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(1000);
  await p.fill("#global-search", "甬东"); await p.waitForTimeout(800);
  const ydOpts = await p.evaluate(() => [...document.querySelectorAll("#search-pop [role='option'], #search-pop li")]
    .map(e => e.innerText.replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 12));
  say("  搜索「甬东」候选：" + ydOpts.join(" | "));
  OK(ydOpts.some(t => /甬东/.test(t)), "全站搜索命中甬东");
  const clicked = await p.evaluate(() => {
    const el = [...document.querySelectorAll("#search-pop [role='option'], #search-pop li")]
      .find(e => /甬东/.test(e.innerText) && /舟山|越/.test(e.innerText));
    if (!el) return false;
    (el.querySelector("button") || el).click(); return true;
  });
  await p.waitForTimeout(1500);
  const ydCard = await p.evaluate(() => {
    const cands = [...document.querySelectorAll("aside, .panel, .drawer, dialog, [role='dialog']")]
      .filter(e => /甬东/.test(e.innerText || "") && !e.hidden);
    const card = cands.sort((a, b) => (a.innerText || "").length - (b.innerText || "").length)[0];
    const t = (card && card.innerText) || "";
    return { hasCard: !!card, unloc: /未定位/.test(t), txt: t.replace(/\s+/g, " ") };
  });
  OK(clicked, "点击搜索结果（地点组）");
  OK(ydCard.hasCard, "甬东地点卡打得开（其地无任何事目落点，故地图上本无锚点）");
  OK(ydCard.unloc, "坐标行显示「未定位」");
  OK(/超出本库投影覆盖范围|东经 122|不落图|不为一点重做底图|留空，非地望无考|坐标留空/.test(ydCard.txt),
     "「坐标留空非地望无考」之说明可读");
  say("  甬东卡片片段：" + ydCard.txt.slice(0, 460));
  await p.screenshot({ path: path.join(OUT, "r28_07_yongdong.png"), fullPage: false });

  /* ================= §6 属镂条三节层标 ================= */
  H("§6 属镂条（E248 伍员之死）三节层标——终章大考");
  await p.goto(origin + "/#/chronicle", { waitUntil: "load" }); await p.waitForTimeout(1500);
  const zl = await p.evaluate(() => {
    const row = [...document.querySelectorAll("details.chron-row[data-eid]")].find(e => e.dataset.eid === "E248");
    if (!row) return { found: false };
    row.open = true; row.scrollIntoView({ block: "center" });
    return { found: true };
  });
  await p.waitForTimeout(700);
  const zlq = await p.evaluate(() => {
    const host = [...document.querySelectorAll("details.chron-row[data-eid]")].find(e => e.dataset.eid === "E248");
    if (!host) return null;
    const qs = [...host.querySelectorAll("blockquote.quote")].map(bq => ({
      qid: bq.dataset.qid,
      layerTag: (bq.querySelector(".q-layer") || {}).textContent || "（无徽标＝原文层）",
      caveat: (bq.querySelector(".q-caveat") || {}).textContent || "",
      src: (bq.querySelector("footer") || {}).textContent || "",
      head: (bq.querySelector("p:not(.q-caveat)") || {}).textContent || "",
    }));
    return { n: qs.length, qs };
  });
  if (zlq) {
    say("  E248 引文 " + zlq.n + " 条：");
    zlq.qs.forEach(q => say("    " + q.qid + " 【" + q.layerTag + "】" + (q.caveat ? " 层标：" + q.caveat : "") +
      "  " + q.src.replace(/\s+/g, " ").slice(0, 74) + "  ｜ " + q.head.replace(/\s+/g, " ").slice(0, 34)));
    const srcs = zlq.qs.map(q => q.src);
    const has = (re) => srcs.some(s => re.test(s));
    OK(has(/左传/), "第一节：《左传》层在（属镂本文）");
    OK(has(/国语/), "第二节：《国语·吴语》层在（鸱夷投江）");
    OK(has(/史记/), "第三节：《史记》层在（抉眼县门）");
    OK(zlq.qs.some(q => /后出叙事/.test(q.layerTag)), "《史记》两条挂「后出叙事」层徽标");
  }
  /* ★ 用 locator 元素截图，不手工算 clip：展开后的编年卡高度常超出 900 视口，
   * 手工 clip 一旦越界 Playwright 只截出空图（本轮首跑即得三张 120 字节的空 PNG，记此备核）。 */
  await p.locator('details.chron-row[data-eid="E248"]').screenshot({ path: path.join(OUT, "r28_08_LAYER_shulou.png") });
  say("  截图：r28_08_LAYER_shulou.png（locator 元素截图，含全部 6 条引文）");

  /* ================= §7 卧薪尝胆注文 ================= */
  H("§7 「卧薪尝胆」注文展示（E265 会稽之栖）");
  const wx = await p.evaluate(() => {
    const row = [...document.querySelectorAll("details.chron-row[data-eid]")].find(e => e.dataset.eid === "E265");
    if (!row) return { found: false };
    row.open = true; row.scrollIntoView({ block: "center" });
    return { found: true };
  });
  await p.waitForTimeout(700);
  const wxq = await p.evaluate(() => {
    const host = [...document.querySelectorAll("details.chron-row[data-eid]")].find(e => e.dataset.eid === "E265");
    if (!host) return null;
    const qs = [...host.querySelectorAll("blockquote.quote")].map(bq => ({
      qid: bq.dataset.qid, layerTag: (bq.querySelector(".q-layer") || {}).textContent || "（原文层）",
      caveat: (bq.querySelector(".q-caveat") || {}).textContent || "",
      src: (bq.querySelector("footer") || {}).textContent || "",
      body: (bq.querySelector("p:not(.q-caveat)") || {}).textContent || "",
    }));
    return { n: qs.length, qs, txt: host.innerText };
  });
  if (wxq) {
    say("  E265 引文 " + wxq.n + " 条：");
    wxq.qs.forEach(q => say("    " + q.qid + " 【" + q.layerTag + "】" + (q.caveat ? " 层标：" + q.caveat : "") + " " + q.src.replace(/\s+/g, " ").slice(0, 90)));
    const dan = wxq.qs.find(q => /嘗膽|尝胆/.test(q.body));
    OK(!!dan, "「尝胆」一条在（Q427，《史记·越王勾践世家》）" + (dan ? "：层徽标＝" + dan.layerTag : ""));
    OK(!!dan && /后出叙事/.test(dan.layerTag), "「尝胆」条挂「后出叙事」层徽标，不与经传同列");
    OK(/卧薪/.test(wxq.txt) === false || /三书皆无|宋以后|不建源/.test(wxq.txt),
       "「卧薪」二字若出现于页面则必带其分层说明（三书皆无／宋以后之语）");
    await p.locator('details.chron-row[data-eid="E265"]').screenshot({ path: path.join(OUT, "r28_09_LAYER_woxin.png") });
    say("  截图：r28_09_LAYER_woxin.png");
  }

  /* ================= §8 泛舟五湖 G 层 ================= */
  H("§8 泛舟五湖 G 层（Q435，《国语·越语下》）");
  const wh = await p.evaluate(() => {
    const row = [...document.querySelectorAll("details.chron-row[data-eid]")].find(e => e.dataset.eid === "E253");
    if (!row) return null;
    row.open = true; row.scrollIntoView({ block: "center" });
    return true;
  });
  await p.waitForTimeout(700);
  const whq = await p.evaluate(() => {
    const host = [...document.querySelectorAll("details.chron-row[data-eid]")].find(e => e.dataset.eid === "E253");
    if (!host) return null;
    return {
      qs: [...host.querySelectorAll("blockquote.quote")].map(bq => ({
        qid: bq.dataset.qid, layerTag: (bq.querySelector(".q-layer") || {}).textContent || "（原文层）",
        src: (bq.querySelector("footer") || {}).textContent || "", body: (bq.querySelector("p:not(.q-caveat)") || {}).textContent || "",
      })),
    };
  });
  if (whq) {
    whq.qs.forEach(q => say("    " + q.qid + " 【" + q.layerTag + "】" + q.src.replace(/\s+/g, " ").slice(0, 80)));
    const wu = whq.qs.find(q => /五湖/.test(q.body));
    OK(!!wu, "「反至五湖，范蠡辞于王」一条在" + (wu ? "（" + wu.qid + "，层＝" + wu.layerTag + "）" : ""));
    OK(!!wu && /国语/.test(wu.src), "其出处为《国语》（G 层），非《史记》");
    await p.locator('details.chron-row[data-eid="E253"]').screenshot({ path: path.join(OUT, "r28_10_LAYER_wuhu.png") });
    say("  截图：r28_10_LAYER_wuhu.png");
  }

  /* ================= §9 并观 夫差×勾践 ================= */
  H("§9 并观 夫差×勾践（宿敌并观）");
  await p.goto(origin + "/#compare=P_FUCHA,P_GOUJIAN", { waitUntil: "load" }); await p.waitForTimeout(1800);
  const cmp = await p.evaluate(() => {
    const items = [...document.querySelectorAll("#cmp-meetings .cmp-meet-row")];
    return {
      title: (document.querySelector("#cmp-title") || {}).textContent || "",
      legend: [(document.querySelector("#cmp-legend-a") || {}).textContent || "", (document.querySelector("#cmp-legend-b") || {}).textContent || ""],
      count: (document.querySelector("#cmp-meet-count") || {}).textContent || "",
      meets: items.map(e => e.innerText.replace(/\s+/g, " ").trim()),
      n: items.length,
      degraded: !!(document.querySelector("#cmp-play-degrade") && !document.querySelector("#cmp-play-degrade").hidden),
      playable: !!(document.querySelector("#cmp-play") && !document.querySelector("#cmp-play").hidden),
      disclaimer: (document.querySelector("#cmp-meetings .cmp-disclaimer") || {}).textContent || "",
    };
  });
  say("  并观标题：" + cmp.title.replace(/\s+/g, " ").trim() + "；图例 " + cmp.legend.join(" x "));
  say("  交会计数徽标 " + cmp.count + "；侧栏 " + cmp.n + " 条：");
  cmp.meets.forEach(m => say("    · " + m.slice(0, 150)));
  OK(cmp.playable && !cmp.degraded, "并观可播（两人亲至可落图地点皆 ≥2）");
  OK(cmp.n >= 1, "夫差×勾践有交会点");
  OK(cmp.meets.filter(m => /同场/.test(m)).length >= 1, "至少一处为「同场」级交会");
  /* ★ 本节判据写成**双向自洽式**，不写死「夫椒／姑苏应为同场」：
   * 交会两级的成立条件在 app.js 里是硬的——a 级同场＝同事件同地且**两人皆亲至**；
   * b 级同年同地＝同年同地之两条异事件、亦须两人皆亲至。
   * 故某地入不入交会，完全由 event_people.presence 决定。下面直接从数据现算这两级，
   * 与 DOM 侧栏逐条对账：**对得上就绿**。若日后 presence 有修订，本门自动跟随，无须改码。 */
  const meetCalc = await p.evaluate(async () => {
    const j = async (n) => (await (await fetch("data/" + n + ".json")).json());
    const asArr = (d) => Array.isArray(d) ? d : (d.items || Object.values(d));
    const E = asArr(await j("events")), EP = asArr(await j("event_people")), L = asArr(await j("places"));
    const em = Object.fromEntries(E.map(e => [e.id, e])), lm = Object.fromEntries(L.map(l => [l.id, l]));
    const of = (pid) => EP.filter(r => r.person_id === pid)
      .map(r => ({ eid: r.event_id, pres: r.presence || "亲至", e: em[r.event_id] }))
      .filter(x => x.e);
    const A = of("P_FUCHA"), B = of("P_GOUJIAN");
    const live = (x) => x.pres === "亲至" && x.e.place_id && lm[x.e.place_id] && lm[x.e.place_id].lat != null;
    const same = [], sameYearPlace = [];
    for (const a of A) for (const b of B) {
      if (a.eid === b.eid && live(a) && live(b)) same.push({ eid: a.eid, place: lm[a.e.place_id].ancient_name, year: a.e.year_bce });
      else if (a.eid !== b.eid && a.e.place_id === b.e.place_id && a.e.year_bce === b.e.year_bce && live(a) && live(b))
        sameYearPlace.push({ a: a.eid, b: b.eid, place: lm[a.e.place_id].ancient_name, year: a.e.year_bce });
    }
    /* 逐条列出两人共处一地／一事的 presence 组合，作为「为何不成交会」的正面证据 */
    const shared = [];
    for (const a of A) for (const b of B) {
      if (a.eid !== b.eid) continue;
      shared.push({ eid: a.eid, year: a.e.year_bce, place: a.e.place_id ? (lm[a.e.place_id] || {}).ancient_name : "（无地望）",
                    fucha: a.pres, goujian: b.pres, meet: (a.pres === "亲至" && b.pres === "亲至") });
    }
    return { same, sameYearPlace, shared };
  });
  say("  —— 数据侧现算（判据自证） ——");
  say("  二人同挂之事共 " + meetCalc.shared.length + " 条，presence 组合逐条：");
  meetCalc.shared.sort((x, y) => y.year - x.year).forEach(x => say(
    "    " + x.eid + " 前" + (-x.year) + " " + x.place + "：夫差 " + x.fucha + " / 勾践 " + x.goujian + (x.meet ? "  → 同场 ✔" : "  → 不成同场")));
  say("  a 级同场：" + (meetCalc.same.map(x => x.eid + " 前" + (-x.year) + " " + x.place).join("、") || "（无）"));
  say("  b 级同年同地：" + (meetCalc.sameYearPlace.map(x => x.a + "×" + x.b + " 前" + (-x.year) + " " + x.place).join("、") || "（无）"));
  OK(cmp.n === meetCalc.same.length + meetCalc.sameYearPlace.length,
     "并观侧栏交会数（" + cmp.n + "）＝数据侧现算之两级之和（" + (meetCalc.same.length + meetCalc.sameYearPlace.length) + "）");
  for (const x of meetCalc.same) {
    OK(cmp.meets.some(m => m.includes(x.place)), "同场「" + x.place + "」在侧栏之列");
  }
  /* 夫椒与姑苏（吴都）——任务书随手预期为同场，实测不成立。此处以数据正面自证其所以然，
   * **不为凑预期而松动 presence**（数据侧 P_FUCHA.notes／P_GOUJIAN.notes 已逐条写明其判据）。 */
  const fj = meetCalc.shared.find(x => /夫椒/.test(x.place));
  OK(!!fj && !fj.meet, "夫椒（E245）不入交会 ⇐ 二人 presence 为「" + (fj ? fj.fucha + "／" + fj.goujian : "?") +
     "」——传只书「吴王夫差败越于夫椒」，无一人有在场明文，从严皆标「相关」");
  const wuduRows = meetCalc.shared.filter(x => /吴（吴都）|吴都|^吴$/.test(x.place));
  OK(wuduRows.length > 0 && wuduRows.every(x => !x.meet),
     "姑苏（吴都）不入交会 ⇐ 二人同挂于此的 " + wuduRows.length + " 条中，无一条两人皆亲至（" +
     wuduRows.map(x => x.eid + " " + x.fucha + "/" + x.goujian).join("、") + "）");
  say("  免责口径：" + cmp.disclaimer.replace(/\s+/g, " ").slice(0, 120));
  await p.screenshot({ path: path.join(OUT, "r28_11_compare_fucha_goujian.png"), fullPage: false });

  /* ================= §10 历聘立目后三线 ================= */
  H("§10 季札历聘立目后：晏婴／子产／叔向三线");
  const trio = [["P_YANYING", "晏婴", "E268", "临淄"], ["P_ZICHAN", "子产", "E269", "新郑"], ["P_SHUXIANG", "叔向", "E271", "新田"]];
  for (const [pid, nm, eid, place] of trio) {
    await p.goto(origin + "/#/p/" + pid + "/timeline", { waitUntil: "load" }); await p.waitForTimeout(1100);
    const r = await p.evaluate((eid) => {
      const el = [...document.querySelectorAll("#timeline-list details[data-eid]")].find(e => e.dataset.eid === eid);
      return { has: !!el, n: document.querySelectorAll("#timeline-list details[data-eid]").length,
               txt: el ? el.innerText.replace(/\s+/g, " ").slice(0, 120) : "" };
    }, eid);
    OK(r.has, nm + " 时间线有 " + eid + "（季札聘其国）：" + r.txt.slice(0, 80) + " | 其线共 " + r.n + " 条");
  }
  for (const [a, b, na, nb] of [["P_YANYING", "P_ZICHAN", "晏婴", "子产"], ["P_YANYING", "P_SHUXIANG", "晏婴", "叔向"], ["P_ZICHAN", "P_SHUXIANG", "子产", "叔向"]]) {
    await p.goto(origin + `/#compare=${a},${b}`, { waitUntil: "load" }); await p.waitForTimeout(1500);
    const m = await p.evaluate(() => [...document.querySelectorAll("#cmp-meetings .cmp-meet-row")].map(e => e.innerText.replace(/\s+/g, " ").trim()));
    say("  " + na + "×" + nb + " 交会 " + m.length + " 处：" + (m.map(x => x.slice(0, 60)).join(" ｜ ") || "（无）"));
    OK(!m.some(x => /前544|季札/.test(x)),
       na + "×" + nb + " 未因历聘而新增交会——三条聘目分落临淄／新郑／新田三地，同年而异地，两级交会（同场／同年同地）皆不成立");
  }

  /* ================= §11 四档宽度 ================= */
  H("§11 四档宽度");
  for (const w of [1440, 1024, 768, 390]) {
    const ctx = await b.newContext({ viewport: { width: w, height: w < 500 ? 780 : 900 }, deviceScaleFactor: 1, isMobile: w < 500, hasTouch: w < 500 });
    await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) { } });
    const q = await ctx.newPage();
    const bad = [];
    q.on("pageerror", e => bad.push(e.message));
    for (const [tag, hash] of [["home", "/#/"], ["pick", "/#/people"], ["tl·夫差", "/#/p/P_FUCHA/timeline"], ["map·勾践", "/#/p/P_GOUJIAN/map"], ["cmp·夫差×勾践", "/#compare=P_FUCHA,P_GOUJIAN"], ["pano", "/#/relations"], ["chron", "/#/chronicle"]]) {
      await q.goto(origin + hash, { waitUntil: "load" }); await q.waitForTimeout(w < 500 ? 1100 : 900);
      const ov = await q.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      const overflow = ov.sw - ov.cw;
      if (overflow > 2) bad.push(tag + " 横向溢出 " + overflow + "px");
    }
    await q.goto(origin + "/#/p/P_GOUJIAN/map", { waitUntil: "load" }); await q.waitForTimeout(1000);
    await q.screenshot({ path: path.join(OUT, "r28_12_w" + w + "_map_goujian.png"), fullPage: false });
    OK(bad.length === 0, w + "px 七视图无横向溢出、无页面错误" + (bad.length ? "：" + bad.join("；") : ""));
    await ctx.close();
  }

  H("截图产出自检（★ 首跑教训：手工 clip 越界会静默产出 120 字节的空 PNG）");
  for (const f of ["r28_08_LAYER_shulou.png", "r28_09_LAYER_woxin.png", "r28_10_LAYER_wuhu.png",
                   "r28_02_home_wuyue.png", "r28_11_compare_fucha_goujian.png"]) {
    const fp = path.join(OUT, f);
    const sz = fs.existsSync(fp) ? fs.statSync(fp).size : 0;
    OK(sz > 2048, f + " 已产出且非空（" + sz + " 字节）");
  }

  H("收尾");
  say("  页面错误 / console error 计 " + errs.length + (errs.length ? "：\n    " + errs.slice(0, 10).join("\n    ") : ""));
  OK(errs.length === 0, "全程无 pageerror / console error");
  say("\n===== 合计 [FAIL] " + nFail + " 条 =====");
  await b.close(); s.close();
  process.exit(nFail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
