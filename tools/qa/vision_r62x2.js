/* 经纬春秋 · r62-X2 可重跑之验：关系全景力导向图（锚甲）之离群、耗时、字号、交互
 * （任务书 team/round61_prompts.md §一百二十一 裁二百五十 三；§一百二十四 裁二百五十一 三 3；§一百二十七 发 X2）
 * 「名签两两不相交」与「定形」二断在 tools/qa/vision_r62x1.js（X1 之门于新图之上重立），本门不复断。
 *
 * 用法（自 tools/qa/ 起跑，playwright 在此处 node_modules 内）：  node vision_r62x2.js
 * 【退出码】 0 ＝ 全过；1 ＝ 有判红；2 ＝ 本门自身出错（浏览器取不到、前提不成、反证不红、页面抛错）。
 *
 * 验：
 *  §一 离群之量（裁二百五十一 三3）：每人与本国在图诸人心距之均 a，对与他国（在图二人以上之国）诸人心距之均之最小者 b；
 *      b＜a 者为离群。★ 本门**另路**算之（由 DOM 诸盘心之 cx、cy 与 site/data/people.json 之 state 首国、app.js 名册之 home），
 *      不取页内 panoOutliers；再与页内 panoOutliers 之所报对账（二路之名单须同）。
 *      只主角默认视图（1440）以 0 为的——**断之**（离群即红）；「显示全部」之数只印备查，不入判。
 *      宽量（「他国」连在图只一人之国亦计）另印备查。
 *      反证：页内令 PANO_FORCE.COH＝0、CTR＝0、XREP＝1（去国聚、国心、异国斥力三力），清存重绘——离群须 ＞0，不红即 exit 2。
 *  §二 「显示全部」之耗时（裁二百五十一 三3）：1440、375 各三绘（每绘清布局之存），取布局之中位数（ms，页内 performance.now）；
 *      断其用网格分桶（人数 ＞ PANO_FORCE.GRID_MIN）；耗时只书，不入判（机器之速不一）。
 *  §三 字号（裁二百五十一 三3：375 内嵌最小约 6px、全屏 14–18px）：名签之呈现字号＝computed font-size × svg 之屏幕缩放。
 *      断 375 只主角内嵌最小 ≥ 6、放大查看初开最小 ≥ 14；1440 之数只书。
 *  §四 交互（1440 鼠标、375 触屏各一套）：点人高亮一度、点边见出处、拖人（边随之、不误触高亮）、滚轮／双指缩放
 *      （双指于图上不缩页面）、拖底平移（鼠标）、复位钮、边名开关、显示全部⇄仅主角边⇄回只主角、ego 往返（图下之条随之去来）、
 *      放大查看（取全图之框，非内嵌缩放后之框）。
 *  §六 边名之截法（r62-X2 续，裁二百五十二 二3；加断）：诸 .pano-elabel 之文——无括注（「（」）、无未闭之括（「」《》（）()）、
 *      未逾 10 字者与全文同、逾者以「…」终且为全文（去括注、前二以「·」连）之前缀、至多 11 字；只主角与「显示全部」二图俱断；
 *      截者点边，出处之列须见其诸 rel_label 之全文。反证：以旧法硬截（前二连、硬取 10 字）之文代之，须红。另路逐条之数印之备查。
 *  §四 之滚轮（r62-X2 续，裁二百五十二 二5；改断）：原「滚轮缩放」改为三断——内嵌常滚 wheel 不被 preventDefault、页滚过、视框不变；
 *      Ctrl＋滚轮则缩放（wheel 带 ctrlKey 而被 preventDefault）；放大查看之内滚轮即缩放。反证：于内嵌图注入旧之硬拦，常滚之断须红。
 *  §五 截图：team/r62X2_shots/x2_{proto,all}_{1440,375}.png（图框＋图例）、x2_{proto,all}_375_fullscreen.png（放大查看初开）、
 *      x2_proto_1440_fullscreen.png。
 */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { requireBrowser } = require("./require_browser.js");
const ROOT = path.resolve(__dirname, "..", "..");
const SITE = path.join(ROOT, "site");
const PEOPLE = JSON.parse(fs.readFileSync(path.join(SITE, "data", "people.json"), "utf8"));
const APP = fs.readFileSync(path.join(SITE, "app.js"), "utf8");
/* 名册之 home（另路：读 app.js 源之 PROTAGONISTS 块之文，不取页内之值） */
const HOME = (() => {
  const i = APP.indexOf("const PROTAGONISTS = ["), j = APP.indexOf("\n];", i);
  const m = {}; for (const x of APP.slice(i, j).matchAll(/id: "(P_[A-Z0-9_]+)"[^\n]*?home: "([^"]+)"/g)) m[x[1]] = x[2];
  return m;
})();
const stOf = (id) => HOME[id] || (PEOPLE.find(p => p.id === id).state || "").split("/")[0];
const OUT = path.join(ROOT, "team", "r62X2_shots");
fs.mkdirSync(OUT, { recursive: true });

let fails = 0, gateErrs = 0, asserts = 0;
const ok = (c, l, d) => { asserts++; if (!c) fails++; console.log("  " + (c ? "✓" : "✗") + " " + l + (d ? "  —— " + d : "")); };
const selfcheck = (c, l, d) => { if (!c) gateErrs++; console.log("  " + (c ? "✓" : "⚠") + " 〔门自检〕" + l + (d ? "  —— " + d : "")); };
const H = (s) => console.log("\n" + s);

function srv() {
  const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png" };
  return new Promise((res, rej) => {
    const s = http.createServer((rq, rs) => {
      let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]); if (u === "/") u = "/index.html";
      const fp = path.join(SITE, u); if (!fp.startsWith(SITE)) { rs.writeHead(403); rs.end(); return; }
      fs.readFile(fp, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(u)] || "application/octet-stream" }); rs.end(d); });
    });
    s.on("error", rej); s.listen(0, "127.0.0.1", () => res(s));
  });
}

/* 另路之离群：pts = [{id, x, y}] */
function outliers(pts) {
  const by = new Map();
  for (const v of pts) { const st = stOf(v.id); v.st = st; if (!by.has(st)) by.set(st, []); by.get(st).push(v); }
  const mean = (v, vs) => { let s = 0, c = 0; for (const u of vs) if (u !== v) { s += Math.hypot(u.x - v.x, u.y - v.y); c++; } return c ? s / c : Infinity; };
  const strict = [], loose = [];
  for (const v of pts) {
    const own = by.get(v.st); if (own.length < 2) continue;
    const a = mean(v, own);
    let b = Infinity, nb = "", b1 = Infinity, nb1 = "";
    for (const [st, vs] of by) { if (st === v.st) continue; const m = mean(v, vs); if (vs.length >= 2 && m < b) { b = m; nb = st; } if (m < b1) { b1 = m; nb1 = st; } }
    const name = PEOPLE.find(p => p.id === v.id).name;
    if (b < a) strict.push({ id: v.id, s: name + "（" + v.st + "；本国 " + a.toFixed(1) + "／" + nb + " " + b.toFixed(1) + "）" });
    if (b1 < a) loose.push({ id: v.id, s: name + "（" + v.st + "→" + nb1 + "）" });
  }
  return { strict, loose };
}
const centers = (pg) => pg.evaluate(() => [...document.querySelectorAll("#rel-canvas .rel-node")].map(g => {
  const c = g.querySelector("circle"); return { id: g.dataset.node, x: +c.getAttribute("cx"), y: +c.getAttribute("cy") }; }));
const pageOutliers = (pg) => pg.evaluate(() => panoOutliers(panoView.cache.N).list.map(o => o.id).sort().join(","));
async function setAll(pg, on) {
  await pg.evaluate((on) => { const c = document.querySelector("#rel-show-all"); c.checked = on; c.dispatchEvent(new Event("change")); }, on);
  await pg.waitForTimeout(700);
}
const fontPx = (pg, sel) => pg.evaluate((sel) => {
  const svg = document.querySelector(sel), k = svg.getScreenCTM().a;
  const fs = [...svg.querySelectorAll(".rel-node > text")].map(t => parseFloat(getComputedStyle(t).fontSize) * k);
  return { min: +Math.min(...fs).toFixed(2), max: +Math.max(...fs).toFixed(2) };
}, sel);

(async () => {
  console.log("vision_r62x2 · 关系全景力导向图之离群、耗时、字号、交互");
  const { browser, executablePath, browserVersion } = await requireBrowser();
  console.log("  浏览器：" + executablePath + "  " + browserVersion);
  const s = await srv(); const base = "http://127.0.0.1:" + s.address().port + "/";
  const errs = [];
  const open = async (w, opts = {}) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: w > 680 ? 900 : 812 }, hasTouch: !!opts.touch, isMobile: !!opts.touch });
    await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", JSON.stringify({ v: 1, step: -1, done: true })); } catch (e) { /* 无妨 */ } });
    const pg = await ctx.newPage(); pg.on("pageerror", e => errs.push(w + "：" + String(e)));
    await pg.goto(base + "#/relations", { waitUntil: "networkidle" });
    await pg.waitForSelector("#rel-canvas .rel-node", { state: "attached" });
    await pg.waitForTimeout(600);
    return { ctx, pg };
  };

  /* ===== §一 离群 ===== */
  H("§一 离群之量（另路算之，再与页内对账）");
  {
    const { ctx, pg } = await open(1440);
    const pre = await pg.evaluate(() => ({ mode: relView.mode, showAll: relView.showAll, n: document.querySelectorAll("#rel-canvas .rel-node").length }));
    selfcheck(pre.mode === "pano" && !pre.showAll && pre.n === PEOPLE.filter(p => +p.is_protagonist === 1).length, "默认视图：全景、只主角，" + pre.n + " 人");
    const o = outliers(await centers(pg));
    const pageList = await pageOutliers(pg);
    selfcheck(o.strict.map(x => x.id).sort().join(",") === pageList, "另路之离群名单与页内 panoOutliers 同", "另路 [" + o.strict.map(x => x.id).join(",") + "]／页内 [" + pageList + "]");
    ok(o.strict.length === 0, "只主角默认视图离群 0（裁二百五十一 三3：以 0 为的）", o.strict.map(x => x.s).join("、"));
    console.log("    〔备查〕宽量（他国连在图只一人之国）离群 " + o.loose.length + (o.loose.length ? "：" + o.loose.map(x => x.s).join("、") : ""));
    await setAll(pg, true);
    const oa = outliers(await centers(pg));
    console.log("    〔备查·不入判〕「显示全部」离群 " + oa.strict.length + "（宽量 " + oa.loose.length + "）：" + oa.strict.map(x => x.s).join("、"));
    await setAll(pg, false);
    /* 反证：去国聚、国心、异国斥力三力 */
    await pg.evaluate(() => { PANO_FORCE.COH = 0; PANO_FORCE.CTR = 0; PANO_FORCE.XREP = 1; panoView.cache = null; drawRel(); });
    await pg.waitForTimeout(500);
    const oz = outliers(await centers(pg));
    if (oz.strict.length) console.log("  ✓ 【反证·如期而红】去国聚三力 → 离群 " + oz.strict.length + "：" + oz.strict.slice(0, 6).map(x => x.s).join("、"));
    else { gateErrs++; console.log("  ⚠ 【反证·★ 不红：门自身出错】去国聚三力而离群仍 0"); }
    await ctx.close();
  }

  /* ===== §二 显示全部之耗时；§三 字号；§五 截图 ===== */
  H("§二 「显示全部」之耗时（三绘中位数）／§三 字号／§五 截图");
  for (const w of [1440, 375]) {
    const { ctx, pg } = await open(w);
    const fp = await fontPx(pg, "#rel-canvas svg");
    console.log("    " + w + " 只主角内嵌名签字号 " + fp.min + "–" + fp.max + " px");
    if (w === 375) ok(fp.min >= 6, "375 只主角内嵌名签最小字号 " + fp.min + " px ≥ 6（裁二百五十一 三3：约 6px 可）");
    await (await pg.$(".rel-main")).screenshot({ path: path.join(OUT, "x2_proto_" + w + ".png") });
    await pg.click("#btn-rel-zoom"); await pg.waitForTimeout(600);
    const ff = await fontPx(pg, "#map-overlay-body svg");
    console.log("    " + w + " 只主角放大查看初开名签字号 " + ff.min + "–" + ff.max + " px");
    if (w === 375) ok(ff.min >= 14, "375 放大查看初开最小字号 " + ff.min + " px ≥ 14（全屏 14–18px 可；初开为 1:1 局部）");
    await pg.screenshot({ path: path.join(OUT, "x2_proto_" + w + "_fullscreen.png") });
    await pg.click("#btn-overlay-close"); await pg.waitForTimeout(300);
    await setAll(pg, true);
    const st = await pg.evaluate(() => ({ ...panoView.stats, gridMin: PANO_FORCE.GRID_MIN }));
    ok(st.n > st.gridMin, w + " 「显示全部」" + st.n + " 人 ＞ GRID_MIN " + st.gridMin + "：布局走网格分桶");
    const ms = [];
    for (let i = 0; i < 3; i++) ms.push(await pg.evaluate(() => { panoView.cache = null; drawRel(); return panoView.stats.layoutMs; }));
    const sorted = [...ms].sort((a, b) => a - b);
    console.log("    ★ " + w + " 「显示全部」布局耗时三绘 " + ms.join("／") + " ms，中位 " + sorted[1] + " ms（" + st.n + " 人、" + st.links + " 对）");
    const fa = await fontPx(pg, "#rel-canvas svg");
    console.log("    " + w + " 「显示全部」内嵌名签字号 " + fa.min + "–" + fa.max + " px");
    await (await pg.$(".rel-main")).screenshot({ path: path.join(OUT, "x2_all_" + w + ".png") });
    if (w === 375) {
      await pg.click("#btn-rel-zoom"); await pg.waitForTimeout(600);
      const fz = await fontPx(pg, "#map-overlay-body svg");
      console.log("    375 「显示全部」放大查看初开名签字号 " + fz.min + "–" + fz.max + " px");
      await pg.screenshot({ path: path.join(OUT, "x2_all_375_fullscreen.png") });
      await pg.click("#btn-overlay-close"); await pg.waitForTimeout(300);
    }
    const ov = await pg.evaluate(() => document.scrollingElement.scrollWidth > innerWidth);
    ok(!ov, w + " 页无横溢（显示全部态）");
    await ctx.close();
  }

  /* ===== §六 边名之截法（r62-X2 续；裁二百五十二 二3） ===== */
  H("§六 边名之截法（括注不入；逾 10 字截而加「…」；不截于括中）");
  {
    /* 另路之量（只读 relations.json，不取页内函数）：逐条之数，以对 Co站长 之量 */
    const RELS = JSON.parse(fs.readFileSync(path.join(SITE, "data", "relations.json"), "utf8"));
    const strip = (x) => (x || "").split("（")[0].trim();
    const len = (x) => [...x].length;
    const hardInParen = RELS.filter(r => { const h = [...r.rel_label].slice(0, 10).join(""); return len(r.rel_label) > 10 && (h.split("（").length > h.split("）").length); }).length;
    console.log("    〔另路·逐条〕rel_label " + RELS.length + " 条；逾 10 字 " + RELS.filter(r => len(r.rel_label) > 10).length +
      "；旧法硬截 10 字而截于括注之中 " + hardInParen + "；去括注后逾 10 字（今法截之）" + RELS.filter(r => len(strip(r.rel_label)) > 10).length);
    const PAIRS = { "「": "」", "《": "》", "（": "）", "(": ")" };
    const unclosed = (t) => { const st = []; for (const ch of t) { if (PAIRS[ch]) st.push(ch); else if (st.length && PAIRS[st[st.length - 1]] === ch) st.pop(); } return st.length > 0; };
    const judgeLabels = (L) => {
      const bad = []; let cut = 0;
      for (const e of L) {
        const full = e.labels.map(strip).filter(Boolean).slice(0, 2).join("·"), t = e.t;
        let why = "";
        if (/[（(]/.test(t)) why = "含括注";
        else if (unclosed(t)) why = "有未闭之括";
        else if (len(full) <= 10) { if (t !== full) why = "未逾 10 字而与全文不同"; }
        else if (!t.endsWith("…")) why = "逾 10 字而截者不以「…」终";
        else if (len(t) > 11 || !full.startsWith(t.slice(0, -1))) why = "截文非全文之前缀或逾 10 字";
        if (t.endsWith("…")) cut++;
        if (why) bad.push("「" + t + "」" + why + "（全文「" + e.labels.join("／") + "」）");
      }
      return { bad, cut };
    };
    const { ctx, pg } = await open(1440);
    const grab = () => pg.evaluate(() => relView.edges.map(e => ({ t: e.lab.textContent, labels: e.rels.map(r => r.rel_label) })));
    const L1 = await grab();
    const j1 = judgeLabels(L1);
    ok(j1.bad.length === 0 && L1.length > 0, "只主角之图边名 " + L1.length + " 条：无括注、无未闭之括、逾 10 字者截而以「…」终（截 " + j1.cut + "）", j1.bad.slice(0, 4).join("；"));
    await setAll(pg, true);
    const L2 = await grab();
    const j2 = judgeLabels(L2);
    ok(j2.bad.length === 0 && L2.length > 0, "「显示全部」之图边名 " + L2.length + " 条：同上（截 " + j2.cut + "）", j2.bad.slice(0, 4).join("；"));
    /* 全文点边可见：取一条截者，点其触区，出处之列须见其诸关系之 rel_label 全文 */
    const full = await pg.evaluate(() => {
      const e = relView.edges.find(e => e.lab.textContent.endsWith("…") && e.rels.some(r => r.rel_label.includes("（")));
      e.hit.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      const txt = document.querySelector("#rel-panel").textContent;
      return { lab: e.lab.textContent, all: e.rels.map(r => r.rel_label), seen: e.rels.every(r => txt.includes(r.rel_label)) };
    });
    ok(full.seen, "截者点边见全文：「" + full.lab + "」→ 出处列「" + full.all.join("／") + "」");
    /* 反证：复旧之硬截（前二以「·」连、硬取 10 字），须红 */
    const L3 = await pg.evaluate(() => relView.edges.map(e => ({ t: e.rels.map(r => r.rel_label).filter(Boolean).slice(0, 2).join("·").slice(0, 10), labels: e.rels.map(r => r.rel_label) })));
    const j3 = judgeLabels(L3);
    if (j3.bad.length) console.log("  ✓ 【反证·如期而红】复硬截 → 「显示全部」边名红 " + j3.bad.length + " 条：" + j3.bad.slice(0, 3).join("；"));
    else { gateErrs++; console.log("  ⚠ 【反证·★ 不红：门自身出错】复硬截而边名之断仍过"); }
    await ctx.close();
  }

  /* ===== §四 交互 ===== */
  for (const w of [1440, 375]) {
    H("§四 交互 " + w + (w <= 680 ? "（触屏）" : "（鼠标）"));
    const touch = w <= 680;
    const { ctx, pg } = await open(w, { touch });
    const cen = (id) => pg.evaluate((id) => { const c = document.querySelector('#rel-canvas .rel-node[data-node="' + id + '"] circle').getBoundingClientRect(); return [c.left + c.width / 2, c.top + c.height / 2]; }, id);
    const pick = await pg.evaluate(() => { const deg = new Map(); for (const e of relView.edges) for (const x of [e.a, e.b]) deg.set(x, (deg.get(x) || 0) + 1);
      return [...deg.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0]; });
    const name = PEOPLE.find(p => p.id === pick).name;
    let [x, y] = await cen(pick);
    if (touch) await pg.touchscreen.tap(x, y); else await pg.mouse.click(x, y);
    await pg.waitForTimeout(300);
    const f = await pg.evaluate((id) => ({ focus: relView.focus, h3: document.querySelector("#rel-panel h3").textContent,
      dim: relView.edges.filter(e => e.a !== id && e.b !== id).every(e => e.el.style.opacity === "0.06" && e.lab.style.opacity === "0.08"),
      hit: relView.edges.filter(e => e.a === id || e.b === id).every(e => e.el.style.opacity === "0.95") }), pick);
    ok(f.focus === pick && f.h3.includes(name) && f.dim && f.hit, "点人高亮一度（" + name + "；他边及其边名俱淡）", f.h3);
    await pg.evaluate(() => resetRelFocus());
    const ep = await pg.evaluate(() => { const e = relView.edges.find(e => !e.badge && e.el.getTotalLength() > 60); const L = e.el.getTotalLength(), p = e.el.getPointAtLength(L * 0.3), m = e.el.getScreenCTM();
      return { x: m.a * p.x + m.e, y: m.d * p.y + m.f }; });
    if (touch) await pg.touchscreen.tap(ep.x, ep.y); else await pg.mouse.click(ep.x, ep.y);
    await pg.waitForTimeout(300);
    const ed = await pg.evaluate(() => ({ h3: document.querySelector("#rel-panel h3").textContent, li: document.querySelectorAll("#rel-panel .rel-list li").length }));
    ok(ed.li >= 1 && !/的一度关系/.test(ed.h3), "点边见出处", ed.h3 + "／" + ed.li + " 条");
    await pg.evaluate(() => resetRelFocus());
    [x, y] = await cen(pick);
    const before = await pg.evaluate((id) => { const v = relView.nodes.get(id); return [v.x, v.y]; }, pick);
    if (touch) {
      const cdp = await ctx.newCDPSession(pg);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] });
      for (let i = 1; i <= 8; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + i * 6, y: y + i * 4, id: 1 }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    } else {
      await pg.mouse.move(x, y); await pg.mouse.down();
      for (let i = 1; i <= 8; i++) await pg.mouse.move(x + i * 8, y + i * 5);
      await pg.mouse.up();
    }
    await pg.waitForTimeout(250);
    const dr = await pg.evaluate((id) => { const v = relView.nodes.get(id), e = relView.edges.find(e => e.a === id || e.b === id);
      return { at: [v.x, v.y], focus: relView.focus, edgeHas: e.el.getAttribute("d").includes(v.x + " " + v.y), cx: +v.el.querySelector("circle").getAttribute("cx") }; }, pick);
    const moved = Math.hypot(dr.at[0] - before[0], dr.at[1] - before[1]);
    ok(moved > 20 && dr.edgeHas && dr.cx === dr.at[0] && !dr.focus, (touch ? "单指" : "鼠标") + "拖人：移 " + moved.toFixed(0) + "、边随之、不误触高亮");
    const vb0 = await pg.evaluate(() => ({ ...panoView.box }));
    const sb = await pg.evaluate(() => { const r = document.querySelector("#rel-canvas svg").getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    if (touch) {
      const cdp = await ctx.newCDPSession(pg);
      const cx = sb.x + sb.w * 0.5, cy = sb.y + sb.h * 0.5;
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: cx - 20, y: cy, id: 1 }, { x: cx + 20, y: cy, id: 2 }] });
      for (let i = 1; i <= 8; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: cx - 20 - i * 8, y: cy, id: 1 }, { x: cx + 20 + i * 8, y: cy, id: 2 }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    } else {
      /* r62-X2 续（裁二百五十二 二5）：内嵌常滚归页——不 preventDefault、页滚过、视框不变；反证（复硬拦）须红 */
      const plain = async () => {
        await pg.evaluate(() => { window.scrollTo(0, 0); window.__wp = [];
          if (!window.__wpOn) { window.__wpOn = 1; window.addEventListener("wheel", e => window.__wp.push({ p: e.defaultPrevented, c: e.ctrlKey }), { passive: true }); } });
        await pg.waitForTimeout(150);
        const r0 = await pg.evaluate(() => { const r = document.querySelector("#rel-canvas svg").getBoundingClientRect();
          return { x: r.left + r.width / 2, y: Math.min(innerHeight - 40, r.top + r.height / 2), sy: scrollY, w: panoView.box.w, max: document.scrollingElement.scrollHeight - innerHeight }; });
        await pg.mouse.move(r0.x, r0.y);
        await pg.mouse.wheel(0, 300);
        await pg.waitForTimeout(400);
        const r1 = await pg.evaluate(() => ({ sy: scrollY, w: panoView.box.w, ev: window.__wp.slice() }));
        return { pass: r1.ev.length > 0 && r1.ev.every(v => !v.p && !v.c) && r1.sy > r0.sy && r1.w === r0.w, r0, r1 };
      };
      const pl = await plain();
      ok(pl.pass && pl.r0.max > 0, "内嵌常滚归页：wheel 未被 preventDefault（" + pl.r1.ev.length + " 次）、页滚 " + pl.r0.sy + "→" + pl.r1.sy + "、视框宽不变 " + pl.r1.w.toFixed(0));
      /* 反证：复旧之硬拦（无条件 preventDefault 而缩放）于内嵌图上，常滚之断须红 */
      await pg.evaluate(() => { const svg = document.querySelector("#rel-canvas svg");
        svg.addEventListener("wheel", (e) => { e.preventDefault(); panoZoomAt(svg, e.deltaY < 0 ? 0.85 : 1 / 0.85, e.clientX, e.clientY); }, { passive: false }); });
      const plz = await plain();
      if (!plz.pass) console.log("  ✓ 【反证·如期而红】复硬拦 → 常滚之断红（preventDefault " + plz.r1.ev.filter(v => v.p).length + "/" + plz.r1.ev.length + "、页滚 " + plz.r0.sy + "→" + plz.r1.sy + "、视框宽 " + plz.r0.w.toFixed(0) + "→" + plz.r1.w.toFixed(0) + "）");
      else { gateErrs++; console.log("  ⚠ 【反证·★ 不红：门自身出错】复硬拦而常滚之断仍过"); }
      await pg.evaluate(() => { drawRel(); window.scrollTo(0, 0); });   // 重绘即去所注之拦（svg 新建）
      await pg.waitForTimeout(400);
      const sb2 = await pg.evaluate(() => { const r = document.querySelector("#rel-canvas svg").getBoundingClientRect(); return { x: r.left + r.width / 2, y: Math.min(innerHeight - 40, r.top + r.height / 2), w: panoView.box.w }; });
      vb0.w = sb2.w;
      await pg.evaluate(() => { window.__wp = []; });
      await pg.mouse.move(sb2.x, sb2.y);
      await pg.keyboard.down("Control");
      await pg.mouse.wheel(0, -300);
      await pg.keyboard.up("Control");
    }
    await pg.waitForTimeout(300);
    const vb1 = await pg.evaluate(() => ({ ...panoView.box }));
    const cev = touch ? [] : await pg.evaluate(() => window.__wp.slice());
    ok(vb1.w < vb0.w * 0.9 && (touch || (cev.length > 0 && cev.every(v => v.p && v.c))),
      (touch ? "双指" : "Ctrl＋滚轮") + "缩放：视框宽 " + vb0.w.toFixed(0) + "→" + vb1.w.toFixed(0) + (touch ? "" : "（wheel 带 ctrlKey、被 preventDefault " + cev.filter(v => v.p).length + "/" + cev.length + "）"));
    if (touch) { const sc = await pg.evaluate(() => window.visualViewport ? window.visualViewport.scale : 1); ok(sc === 1, "双指于图上不缩页面（visualViewport.scale=" + sc + "）"); }
    if (!touch) {
      const bg = await pg.evaluate(() => { const r = document.querySelector("#rel-canvas svg").getBoundingClientRect();
        for (let fy = 0.05; fy < 1; fy += 0.05) for (let fx = 0.05; fx < 1; fx += 0.05) { const x = r.left + r.width * fx, y = r.top + r.height * fy, el = document.elementFromPoint(x, y); if (el && el.tagName === "svg") return [x, y]; } return null; });
      await pg.mouse.move(bg[0], bg[1]); await pg.mouse.down(); await pg.mouse.move(bg[0] + 60, bg[1] + 30, { steps: 6 }); await pg.mouse.up();
      const vb2 = await pg.evaluate(() => ({ ...panoView.box }));
      ok(Math.abs(vb2.x - vb1.x) > 5 && !(await pg.evaluate(() => relView.focus)), "拖底平移：视框 x " + vb1.x.toFixed(0) + "→" + vb2.x.toFixed(0) + "，不误触");
    }
    /* 缩放后开放大查看：取全图之框 */
    await pg.click("#btn-rel-zoom"); await pg.waitForTimeout(500);
    const ov = await pg.evaluate(() => ({ on: !document.querySelector("#map-overlay").hidden, full: panoView.full, vbW: relZoom.vbW, vbH: relZoom.vbH,
      nodes: document.querySelectorAll("#map-overlay-body .rel-node").length, hits: document.querySelectorAll("#map-overlay-body .pano-edge-hit").length }));
    ok(ov.on && ov.vbW === ov.full.w && ov.vbH === ov.full.h && ov.nodes > 0 && ov.hits > 0, "内嵌已缩放后开放大查看：其框取全图（" + ov.vbW + "×" + ov.vbH + "），节点 " + ov.nodes + "、边之触区 " + ov.hits);
    if (!touch) {
      /* r62-X2 续：放大查看之内，滚轮（不按 Ctrl）即缩放（照今，bindZoomGesture） */
      const z0 = await pg.evaluate(() => { const r = document.querySelector("#map-overlay-body svg").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: relZoom.box.w }; });
      await pg.mouse.move(z0.x, z0.y); await pg.mouse.wheel(0, -300); await pg.waitForTimeout(300);
      const z1 = await pg.evaluate(() => relZoom.box.w);
      ok(z1 < z0.w * 0.95, "放大查看之内滚轮即缩放：视框宽 " + z0.w.toFixed(0) + "→" + z1.toFixed(0));
    }
    await pg.click("#btn-overlay-close"); await pg.waitForTimeout(300);
    await pg.click(".pano-zoom[aria-label='复位视野']");
    const vb3 = await pg.evaluate(() => ({ b: { ...panoView.box }, f: { ...panoView.full } }));
    ok(Math.abs(vb3.b.w - vb3.f.w) < 0.5 && Math.abs(vb3.b.x) < 0.5, "复位钮复全图");
    await pg.click(".pano-zoom[aria-label='放大']");
    const vb4 = await pg.evaluate(() => panoView.box.w);
    ok(vb4 < vb3.f.w * 0.9, "「＋」钮放大：视框宽 " + vb3.f.w.toFixed(0) + "→" + vb4.toFixed(0));
    await pg.click("#pano-elabel");
    const el1 = await pg.evaluate(() => getComputedStyle(document.querySelector("#rel-canvas .pano-elabels")).display);
    await pg.click("#pano-elabel");
    const el2 = await pg.evaluate(() => getComputedStyle(document.querySelector("#rel-canvas .pano-elabels")).display);
    ok(el1 !== "none" && el2 === "none", "边名可开关（" + el1 + "→" + el2 + "）");
    await setAll(pg, true);
    const nAll = await pg.evaluate(() => document.querySelectorAll("#rel-canvas .rel-node").length);
    const k0 = await pg.evaluate(() => panoView.cache.key.length);
    await pg.evaluate(() => { const c = document.querySelector("#rel-proto-only"); c.checked = true; c.dispatchEvent(new Event("change")); });
    await pg.waitForTimeout(600);
    const po = await pg.evaluate(() => ({ iso: relView.isolated.size, edges: relView.edges.every(e => isProto(e.a) || isProto(e.b)), cached: panoView.stats.cached }));
    await pg.evaluate(() => { const c = document.querySelector("#rel-proto-only"); c.checked = false; c.dispatchEvent(new Event("change")); });
    await pg.waitForTimeout(600);
    await setAll(pg, false);
    const nBack = await pg.evaluate(() => document.querySelectorAll("#rel-canvas .rel-node").length);
    ok(nAll === PEOPLE.length && po.edges && po.iso > 0 && po.cached && k0 > 0 && nBack === PEOPLE.filter(p => +p.is_protagonist === 1).length,
      "显示全部 " + nAll + "／仅主角边（淡出 " + po.iso + "；布局取存、不重排）／回只主角 " + nBack);
    await pg.evaluate((id) => relRecenter(id), pick);
    await pg.waitForTimeout(500);
    const eg = await pg.evaluate(() => ({ mode: relView.mode, n: document.querySelectorAll("#rel-canvas .rel-node").length, bar: !!document.querySelector("#rel-canvas .pano-bar") }));
    await pg.click("#btn-rel-mode"); await pg.waitForTimeout(600);
    const back = await pg.evaluate(() => ({ mode: relView.mode, svg: !!document.querySelector("#rel-canvas svg.pano-svg"), bar: !!document.querySelector("#rel-canvas .pano-bar") }));
    ok(eg.mode === "ego" && eg.n > 1 && !eg.bar && back.mode === "pano" && back.svg && back.bar, "ego 往返（ego 节点 " + eg.n + "，图下之条随之去来）");
    await ctx.close();
  }

  await browser.close(); s.close();
  console.log("\n页面抛错：" + errs.length + (errs.length ? "  " + errs.slice(0, 3).join(" | ") : ""));
  if (errs.length) gateErrs++;
  console.log("\n结：断言 " + asserts + "，未过 " + fails + "；门自身出错 " + gateErrs);
  process.exit(gateErrs ? 2 : (fails ? 1 : 0));
})().catch(e => { console.error("门自身出错：", e); process.exit(2); });
