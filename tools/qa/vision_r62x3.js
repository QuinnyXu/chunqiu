/* 经纬春秋 · r62-X3 之门：关系全景之边名（点选一人示其关系名；「全部关系名」开关开时相交者先隐、示「另 N 条因重叠未示」）、
 * 弹性拖拽（内嵌与放大查看）、同源之力学器、偏置之量。
 * 任务书 team/round61_prompts.md：§一百三十八 定 1–4；§一百四十三 裁二百五十五 一之三约、三；§一百四十四 站长「照荐」五定；
 *   §一百四十七 裁二百五十六（取甲：偏置；加「不加偏置之松弛位移」之门）。
 * 来源：Vision 子代理 r62-X3 落笔，2026-10-22；承原型门 team/r62X3_proto/tools/qa/vision_r62x3.js（原型目录不动），随所定改其断言与反证。
 * X3 续·治颤（§一百五十三 裁二百五十八）：§三 另印止之由（自然止／限时）与止前 0.5 s 之最大每帧位移。
 * X3 续（2026-10-22，§一百五十 裁二百五十七）：拖中之交改印备查（门量止动后之静态）；§三 加印渐停前之颤；§四 加断提示句及其行数；§六 改量只主角与显示全部（CPU ×4），印其的。
 *
 * 用法（自 tools/qa/ 起跑）：  node vision_r62x3.js
 *   SITE＝仓根 site/；BASE＝以 `git show <X3_BASE>:site/{app.js,index.html,styles.css}` 代今版三件（X3_BASE 默认 33a7523），数据取今 site/data，
 *   供 §〇 对照初布局。截图落 team/r62X3_shots/（x3c_* 前缀）。
 * 【退出码】 0 ＝ 全过；1 ＝ 有判红；2 ＝ 本门自身出错（浏览器取不到、前提不成、反证不红、页面抛错）。
 * 【进程】只以 browser.close() 收其自启之浏览器；不按映像名杀进程（裁二百五十三 四）。
 *
 * ★ 诸框俱 DOM 实量（getBoundingClientRect；开区间判交）：名签＝.rel-node > text；边名＝.pano-elabel 之显者（display 非 none）；
 *   圆签＝多重关系圆签之 circle（含其边自身之签；落笔时加，见 §二 反证三）。所示边名与名签、圆签、他边名俱不得相交。
 * 验：
 *  §〇 前提：初布局诸盘心与 X3_BASE 逐位同（只主角、显示全部；1440、375）——三约之一「同源」之断；
 *      未点选、开关关：边名层隐；开关之字「全部关系名」；小注一字合 a；⟲ 之 aria-label「复位视野、布局与点选」（X3 续二改，旧「复位视野与布局」须无）。
 *  §一 点选一人（1440、375；只主角与显示全部）：逐一点选全部主角，所示边名只属其所连之边，与诸名签、他所示边名两两不相交；
 *      真点度最高者一次；点空白处解点选；Esc 解点选。反证 PANO_ELAB.AVOID＝false 须红。
 *  §二 开关开：所示两两不交、不压名签；「另 N 条因重叠未示」之 N＝DOM 实隐之数＝panoElabStats.hidden（开关开且点选一人时亦断）；
 *      N 为 0 则不示；开关关则不示。悬停隐者之边即现；拖中逐帧重判；拖开即现。
 *      反证：AVOID＝false 须红；另令一条隐者之名私自现出（DOM 实隐之数与条上 N 脱节），「N＝实隐」之断须红。
 *  §三 弹性拖拽（内嵌；点选态、开关开态）：随动、钉住、限时止动、再拖不移前钉、⟲ 复初逐位同。反证 ELASTIC／STOP／RESET_LAYOUT 俱红。
 *  §四 放大查看内之弹性拖拽（§一百四十四 定 4；门同内嵌）：克隆体上拖一人——随动、钉住、限时止动、克隆与内嵌逐位同（镜）；
 *      浮层 ⟲ 后内嵌与克隆俱与初布局逐位同、钉者俱解；拖人后放手不开抽屉；点人仍开抽屉。
 *      反证：STOP＝false、RESET_LAYOUT＝false、断镜（relZoom.mirror＝null）俱须红。
 *  §五 偏置（裁二百五十六 三）：印偏置 |F(x0)| 之中位、最大与最大五人（只主角、显示全部）；
 *      不加偏置、全式松弛之最大位移：只主角须 ＜ 15（主角盘半径）——断之；显示全部印其数备查。
 *      反证：令一人初位外移 30 单位（盘径；r62-U-丙 乙段由 20 改，53 人之图 20 不红）而不重算布局，此断须红。
 *  〔r62-U-丙 乙段〕§二 反证三（OWN_BADGE）：只主角开关开态无例时，另求点选态之例（逐一点选主角，取首个）；§〇 对照本之名册随今（见 BASE_FILES 注）。
 *  §七 X3 续二（§一百六十一 裁二百六十 一）：
 *      1 ⟲ 兼解点选——内嵌与放大查看之 ⟲：点选一人 → ⟲ → relView.focus 空、无 .focused（内嵌与克隆）、右栏「关系详情」复初句；
 *        「全部关系名」「显示全部」二开关不动。反证 PANO_SIM.RESET_FOCUS＝false 须红。
 *      2 条上开关不竖排——六宽 375、682、768、900、1024、1440：「全部关系名」之签高 ≤ 1.5 行高、条（.pano-row）无横溢、条不出图框；
 *        反证（682）：甲 只去 nowrap——今制条可折、签本不受挤，不红，印之备查（x3e_try1 所见，交付上报）；
 *        乙 去 nowrap ＋ 条不折，须红（nowrap 之守）；丙 复旧（条不折、小注不另起、签可折），须红（复现生产之病）。
 *      3 放大查看之提示句——各「·」分段（.hint-seg）只占一行（段内不折），375 不逾二行；textContent 一字合；
 *        反证：注入 .hint-seg { white-space: normal } 于 375 须红。
 *      4 〔r62-U-丙 乙段，裁二百六十一 二2 登记、裁二百六十三 七2〕浮层 ⟲ 兼收底部抽屉——放大查看内点一人开抽屉，焦点移至 ⟲ 以键盘（Enter）触之：
 *        抽屉闭（drawer.open 假、#place-drawer 无 .open 且 250 ms 后 hidden）、点选与视野之复照 1；焦点留于 ⟲。1440、375。
 *        ★ 指针之途：抽屉开时其幕（#drawer-backdrop，z 58）覆浮层（z 50）全屏，点 ⟲ 之位实中幕而收抽屉、⟲ 之处理不行——印之备查（交付上报）。
 *        〔r62-U-丙 乙段续，裁二百六十四 四〕治以幕之孔（drawerBackdropHole），指针之途入判：拖后点人开抽屉，以指针（1440 鼠标、375 触屏）实点 ⟲ 中心，
 *        断一按即抽屉闭、点选解、内嵌与克隆坐标复初；反证 PANO_SIM.HOLE＝false（复旧层叠）须红。键盘之断留。
 *        反证 PANO_SIM.RESET_DRAWER＝false：键盘触 ⟲ 后抽屉仍开，须红。
 *      5 〔同上，裁二百六十一 三登记〕条上小注以「；」分段（.pano-note .hint-seg，「；」随前段），各段只占一行（段内不折）；textContent 一字合 a。
 *        六宽 375、682、768、900、1024、1440，开关开（示「另 N 条」）与关。反证：682 开关开注入 .pano-note .hint-seg { white-space: normal } 须红（复现「可｜拉开」）。
 *  §八 〔r62-U-丙 乙段续，裁二百六十四 三〕定步可复之弹性：测试之钩 panoSimSync（不经 rAF，虚拟之钟每帧 1000/60 ms）拖度最高之主角八向各 100 屏 px，
 *      断「放手后 150 帧内自然止」「止前 30 帧每帧最大位移 ≤ 0.5」——只主角（开关关）／开关开 × 内嵌／放大查看 四式，1440、375 俱断；
 *      门自检：同拖再跑逐一同。反证：复旧（PANO_SIM.PUSH＝1、CONTACT＝false）须红；甲独（PUSH 20、CONTACT 关）与「显示全部」印备查。rAF 实时之数仍于 §三 印之。
 *      〔r62-U-丙 乙段再续，裁二百六十五 一；上二行之扇与「150 帧」「复旧」之反证俱代以下式，原文存档不删〕冷却收束，扩样定步：
 *      只主角 53 人每人为被拖者 × 八向 × 二距（60、140 屏 px）＝848 拖（内嵌、开关关）；开关开、放大查看（只主角／开关开）照 id 取四分之一（id 升序 i%4＝0 之 14 人，224 拖）；
 *      「显示全部」（内嵌）照 id 取 64 拖；1440、375 俱跑。逐拖断四事：冷却之限（⌈ln KAPPA_MIN／ln DECAY⌉＝64 帧）内止（非兜底）、收尾推尽之最大位移 ≤0.5、
 *      止前 30 帧每帧最大位移 ≤0.5、止后名签无交（力学器之矩形，容差 FIN_TOL）。印各式之分布（止帧、收尾位移、止前位移）。
 *      反证：COOL＝false（κ 恒 1）——逐式各自须红（每式四断有一红），不以合计论。门自检：首 32 拖再跑逐数同。
 *  §六 帧耗：375 触屏于 CDP CPU ×4 实测只主角与「显示全部」拖动（书 panoSimTick 之中位／P95／最大、rAF 帧距、分项；印其的：只主角 P95 ≤ 33、
 *      显示全部 ≤ 50，裁二百五十七 二1），另书 1440、375 不降速之「显示全部」备查。只书，不入判（无头机之时不稳）。
 */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http"), cp = require("child_process");
const { requireBrowser } = require("./require_browser.js");
const ROOT = path.resolve(__dirname, "..", "..");
const SITE = path.join(ROOT, "site");
const OUT = path.join(ROOT, "team", "r62X3_shots");
const X3_BASE = process.env.X3_BASE || "33a7523";
fs.mkdirSync(OUT, { recursive: true });
const PEOPLE = JSON.parse(fs.readFileSync(path.join(SITE, "data", "people.json"), "utf8"));
const PROTO_N = PEOPLE.filter(p => +p.is_protagonist === 1).length;
const NOTE_A = "点人物看其关系名；拖动人物可拉开";
const RESET_SEL = ".pano-zoom[aria-label='复位视野、布局与点选']";
const OV_RESET_SEL = "#overlay-rel-tools button[aria-label='复位视野、布局与点选']";
const PANEL_INIT = "点人物节点，高亮其一度关系；点连线看出处。";

let fails = 0, gateErrs = 0, asserts = 0;
const ok = (c, l, d) => { asserts++; if (!c) fails++; console.log("  " + (c ? "✓" : "✗") + " " + l + (d ? "  —— " + d : "")); };
const selfcheck = (c, l, d) => { if (!c) gateErrs++; console.log("  " + (c ? "✓" : "⚠") + " 〔门自检〕" + l + (d ? "  —— " + d : "")); };
const anti = (red, l, d) => { if (red) console.log("  ✓ 【反证·如期而红】" + l + (d ? "  —— " + d : "")); else { gateErrs++; console.log("  ⚠ 【反证·★ 不红：门自身出错】" + l + (d ? "  —— " + d : "")); } };
const H = (s) => console.log("\n" + s);
const nameOf = (id) => (PEOPLE.find(p => p.id === id) || { name: id }).name;

let BASE_FILES = null;
try {
  BASE_FILES = {};
  for (const f of ["app.js", "index.html", "styles.css"]) BASE_FILES["/" + f] = cp.execSync("git show " + X3_BASE + ":site/" + f, { cwd: ROOT, maxBuffer: 1 << 26 });
  /* 〔r62-U-丙 乙段 改〕名册随今：对照本之 PROTAGONISTS 数组代以今 app.js 之数组（一字照搬）。
   * 由：§〇 所断者「初布局之函数与 X3_BASE 同源」，人集是其入参；X3_BASE 之名册只 49 人，今库与今前端俱 53（4c57411 升四人），
   *   不同步则二本人集不同，逐位之比必红而与布局之函数无涉。名册之对账另由 vision_r24a §17（protoRoster）与本门 §〇 之人数自检守之。 */
  const cur = fs.readFileSync(path.join(SITE, "app.js"), "utf8"), old = BASE_FILES["/app.js"].toString("utf8");
  const arr = (t) => { const i = t.indexOf("const PROTAGONISTS = ["), j = t.indexOf("\n];", i); if (i < 0 || j < 0) throw new Error("PROTAGONISTS 数组不得"); return t.slice(i, j + 3); };
  BASE_FILES["/app.js"] = Buffer.from(old.replace(arr(old), () => arr(cur)), "utf8");
} catch (e) { console.log("门自身出错：取 " + X3_BASE + " 之三件不得：" + e.message); process.exit(2); }

function srv(root, over) {
  const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png" };
  return new Promise((res, rej) => {
    const s = http.createServer((rq, rs) => {
      let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]); if (u === "/") u = "/index.html";
      if (over && over[u]) { rs.writeHead(200, { "Content-Type": MIME[path.extname(u)] }); rs.end(over[u]); return; }
      const fp = path.join(root, u); if (!fp.startsWith(root)) { rs.writeHead(403); rs.end(); return; }
      fs.readFile(fp, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(u)] || "application/octet-stream" }); rs.end(d); });
    });
    s.on("error", rej); s.listen(0, "127.0.0.1", () => res(s));
  });
}

/* DOM 实量：名签与所示边名之框（屏幕 px），判其交；并数「应示而隐」之实数 */
const measure = (pg) => pg.evaluate(() => {
  const svg = document.querySelector("#rel-canvas svg.pano-svg");
  const layerOn = getComputedStyle(svg.querySelector(".pano-elabels")).display !== "none";
  const names = [...svg.querySelectorAll(".rel-node")].map(g => { const b = g.querySelector("text").getBoundingClientRect();
    return { id: g.dataset.node, s: g.querySelector("text").textContent, x0: b.left, y0: b.top, x1: b.right, y1: b.bottom }; });
  const labs = [];
  const focus = relView.focus;
  let domHidden = 0;
  relView.edges.forEach((e) => {
    const want = layerOn && (focus ? (e.a === focus || e.b === focus) : panoView.edgeLabels);
    if (want && e.lab.style.display === "none") domHidden++;
    if (!layerOn || e.lab.style.display === "none") return;
    const b = e.lab.getBoundingClientRect();
    if (b.width === 0) return;
    labs.push({ a: e.a, b: e.b, s: e.lab.textContent, x0: b.left, y0: b.top, x1: b.right, y1: b.bottom });
  });
  /* 圆签：几何之圆（r，不含描边）之外接框 */
  const badges = relView.edges.filter(e => e.badge).map(e => { const c = e.badge.querySelector("circle"), b = c.getBoundingClientRect();
    return { s: e.badge.textContent.replace(/\s+/g, "").slice(0, 2), x0: b.left, y0: b.top, x1: b.right, y1: b.bottom }; });
  const hc = document.querySelector("#rel-canvas .pano-hidden");
  const hcTxt = hc && !hc.hidden && getComputedStyle(hc).display !== "none" ? hc.textContent : "";
  return { layerOn, names, labs, badges, stats: JSON.parse(JSON.stringify(panoElabStats)), focus, domHidden, hcTxt, sw: panoView.edgeLabels };
});
const inter = (A, B) => A.x0 < B.x1 && B.x0 < A.x1 && A.y0 < B.y1 && B.y0 < A.y1;
function judge(m) {
  const bad = [];
  for (let i = 0; i < m.labs.length; i++) {
    const L = m.labs[i];
    for (const n of m.names) if (inter(L, n)) bad.push("「" + L.s + "」×名签" + n.s);
    for (const g of m.badges) if (inter(L, g)) bad.push("「" + L.s + "」×圆签" + g.s);
    for (let j = i + 1; j < m.labs.length; j++) if (inter(L, m.labs[j])) bad.push("「" + L.s + "」×「" + m.labs[j].s + "」");
  }
  return bad;
}
/* 「另 N 条因重叠未示」之判：开关开且实隐＞0 → 文为「另 实隐 条因重叠未示」且＝stats.hidden；否则不示 */
function judgeN(m) {
  const want = m.sw && m.domHidden > 0 ? "另 " + m.domHidden + " 条因重叠未示" : "";
  return { okN: m.hcTxt === want && (!m.sw || m.stats.hidden === m.domHidden || !m.layerOn), want, got: m.hcTxt };
}
const coords = (pg) => pg.evaluate(() => [...document.querySelectorAll("#rel-canvas .rel-node")].map(g => {
  const c = g.querySelector("circle"); return g.dataset.node + ":" + c.getAttribute("cx") + "," + c.getAttribute("cy"); }).sort().join(";"));
const cloneCoords = (pg) => pg.evaluate(() => [...document.querySelectorAll("#map-overlay-body .rel-node")].map(g => {
  const c = g.querySelector("circle"); return g.dataset.node + ":" + c.getAttribute("cx") + "," + c.getAttribute("cy"); }).sort().join(";"));
const coordMap = (pg) => pg.evaluate(() => Object.fromEntries([...relView.nodes.values()].map(v => [v.p.id, [v.x, v.y]])));
const setAll = async (pg, on) => { await pg.evaluate((on) => { const c = document.querySelector("#rel-show-all"); c.checked = on; c.dispatchEvent(new Event("change")); }, on); await pg.waitForTimeout(700); };
const setSwitch = async (pg, on) => { await pg.evaluate((on) => { const c = document.querySelector("#pano-elabel"); if (c.checked !== on) c.click(); }, on); await pg.waitForTimeout(150); };
const waitStop = (pg, ms) => pg.evaluate((ms) => new Promise(res => { const t0 = performance.now();
  const f = () => { if (!panoSim || !panoSim.running) res({ stopped: true, by: panoSim ? panoSim.stoppedBy : "", after: panoSim && panoSim.stoppedAt && panoSim.releasedAt ? +(panoSim.stoppedAt - panoSim.releasedAt).toFixed(0) : null });
    else if (performance.now() - t0 > ms) res({ stopped: false, after: null }); else setTimeout(f, 30); }; f(); }), ms);
const q = (a, p) => { const b = [...a].sort((x, y) => x - y); return b.length ? b[Math.min(b.length - 1, Math.floor(p * b.length))] : NaN; };

(async () => {
  console.log("vision_r62x3 · 关系全景之边名、弹性拖拽（内嵌与放大查看）、同源、偏置（站根：" + SITE + "；对照 " + X3_BASE + "）");
  const { browser, executablePath, browserVersion } = await requireBrowser();
  console.log("  浏览器：" + executablePath + "  " + browserVersion);
  const s = await srv(SITE), sb = await srv(SITE, BASE_FILES);
  const base = "http://127.0.0.1:" + s.address().port + "/", baseOld = "http://127.0.0.1:" + sb.address().port + "/";
  const errs = [];
  const open = async (w, opts = {}) => {
    const touch = w <= 680;
    const ctx = await browser.newContext({ viewport: { width: w, height: w > 680 ? 900 : 812 }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", JSON.stringify({ v: 1, step: -1, done: true })); } catch (e) { /* 无妨 */ } });
    const pg = await ctx.newPage(); pg.on("pageerror", e => errs.push(w + "：" + String(e)));
    await pg.goto((opts.old ? baseOld : base) + "#/relations", { waitUntil: "networkidle" });
    await pg.waitForSelector("#rel-canvas .rel-node", { state: "attached" });
    await pg.waitForTimeout(600);
    return { ctx, pg, touch };
  };
  const scr = async (pg, name, sel) => {
    const p = path.join(OUT, name + ".png");
    if (sel === "page") await pg.screenshot({ path: p });
    else await (await pg.$(sel || ".rel-main")).screenshot({ path: p });
  };
  const nodeXY = (pg, id, inClone) => pg.evaluate(([id, inClone]) => { const c = document.querySelector((inClone ? "#map-overlay-body" : "#rel-canvas") + ' .rel-node[data-node="' + id + '"] circle').getBoundingClientRect(); return [c.left + c.width / 2, c.top + c.height / 2]; }, [id, !!inClone]);
  /* 拖：鼠标或触屏（CDP），steps 步；hold＝拖至末步而不放，返回放手之函数以便量拖中 */
  const drag = async (pg, ctx, touch, id, dx, dy, steps = 12, hold = false, inClone = false) => {
    const [x, y] = await nodeXY(pg, id, inClone);
    let cdp = null;
    if (touch) { cdp = await ctx.newCDPSession(pg); await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] }); }
    else { await pg.mouse.move(x, y); await pg.mouse.down(); }
    for (let i = 1; i <= steps; i++) {
      const px = x + dx * i / steps, py = y + dy * i / steps;
      if (touch) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: px, y: py, id: 1 }] });
      else await pg.mouse.move(px, py);
      await pg.waitForTimeout(16);
    }
    const up = async () => { if (touch) { await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await cdp.detach(); } else await pg.mouse.up(); };
    if (hold) return up;
    await up();
    return null;
  };
  const topDeg = (pg) => pg.evaluate(() => { const deg = new Map(); for (const e of relView.edges) for (const x of [e.a, e.b]) deg.set(x, (deg.get(x) || 0) + 1);
    return [...deg.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0]; });

  /* ===== §〇 前提 ===== */
  H("§〇 前提：初布局与 " + X3_BASE + " 逐位同（同源一函数之断）；条之字");
  for (const w of [1440, 375]) {
    const a = await open(w), b = await open(w, { old: true });
    const ca = await coords(a.pg), cb = await coords(b.pg);
    const n = await a.pg.evaluate(() => document.querySelectorAll("#rel-canvas .rel-node").length);
    selfcheck(n === PROTO_N, w + " 默认视图只主角 " + n + " 人");
    ok(ca === cb && ca.length > 0, w + " 只主角：初布局诸盘心与 " + X3_BASE + " 逐位同（" + n + " 人）");
    await setAll(a.pg, true); await setAll(b.pg, true);
    const ca2 = await coords(a.pg), cb2 = await coords(b.pg);
    const n2 = await a.pg.evaluate(() => relView.nodes.size);
    ok(ca2 === cb2 && ca2.length > 0, w + " 显示全部：初布局诸盘心与 " + X3_BASE + " 逐位同（" + n2 + " 人）");
    const lay = await a.pg.evaluate(() => ({ off: getComputedStyle(document.querySelector("#rel-canvas .pano-elabels")).display,
      note: (document.querySelector(".pano-note") || {}).textContent, sw: document.querySelector("#pano-elabel").parentNode.textContent.trim(),
      reset: !!document.querySelector(".pano-zoom[aria-label='复位视野、布局与点选']"), oldReset: !!document.querySelector(".pano-zoom[aria-label='复位视野'], .pano-zoom[aria-label='复位视野与布局']"),
      hid: (() => { const h = document.querySelector(".pano-hidden"); return h ? (h.hidden ? "隐" : h.textContent) : "无"; })(),
      ov: document.scrollingElement.scrollWidth > innerWidth }));
    ok(lay.off === "none", w + " 未点选、开关关：边名层隐（" + lay.off + "）");
    ok(lay.note === NOTE_A, w + " 小注一字合 a：「" + lay.note + "」");
    ok(lay.sw === "全部关系名", w + " 开关之字：「" + lay.sw + "」");
    ok(lay.reset && !lay.oldReset, w + " ⟲ 之 aria-label 为「复位视野、布局与点选」");
    ok(lay.hid === "隐", w + " 开关关：「另 N 条」不示（" + lay.hid + "）");
    ok(!lay.ov, w + " 页无横溢");
    await a.ctx.close(); await b.ctx.close();
  }
  {
    /* 反证：力之参改一毫（REP 200 → 200.01），重算后与基比，须红（x3c_try1 曾用 1e-9，其差小于坐标之 toFixed(2)，不红；见交付） */
    const a = await open(1440), b = await open(1440, { old: true });
    await a.pg.evaluate(() => { PANO_FORCE.REP += 0.01; panoView.cache = null; drawPanoGraph(); });
    await a.pg.waitForTimeout(300);
    anti((await coords(a.pg)) !== (await coords(b.pg)), "1440 令 PANO_FORCE.REP 增 0.01 重算 → 与 " + X3_BASE + " 不再逐位同（「逐位同」之断能红）");
    await a.ctx.close(); await b.ctx.close();
  }

  /* ===== §一 点选一人 ===== */
  H("§一 点选一人：示其所连诸边之名；所示边名与诸名签、边名两两不相交；点空白、Esc 解点选");
  for (const w of [1440, 375]) {
    const { ctx, pg, touch } = await open(w);
    for (const all of [false, true]) {
      if (all) await setAll(pg, true);
      const tag = w + (all ? " 显示全部" : " 只主角");
      const protos = await pg.evaluate(() => [...relView.nodes.values()].filter(v => v.proto).map(v => v.p.id));
      let shown = 0, hidden = 0, foreign = 0, people = 0;
      const bad = [], hidList = [];
      for (const id of protos) {
        await pg.evaluate((id) => focusRelNode(id), id);
        const m = await measure(pg);
        people++; shown += m.labs.length; hidden += m.stats.hidden;
        if (m.stats.hidden) hidList.push(...m.stats.hiddenList);
        foreign += m.labs.filter(l => l.a !== id && l.b !== id).length;
        for (const b of judge(m)) bad.push(nameOf(id) + "：" + b);
      }
      ok(foreign === 0, tag + "：所示边名只属其所连之边（逐点 " + people + " 主角）");
      ok(bad.length === 0, tag + "：所示边名 " + shown + " 条与诸名签、他边名两两不相交（隐 " + hidden + "）", bad.slice(0, 5).join("；"));
      if (hidList.length) console.log("    〔备查〕" + tag + " 点选态所隐 " + hidList.length + "：" + hidList.slice(0, 12).join("、") + (hidList.length > 12 ? "……" : ""));
      await pg.evaluate(() => { PANO_ELAB.AVOID = false; });
      let badZ = 0, firstZ = "";
      for (const id of protos) { await pg.evaluate((id) => focusRelNode(id), id); const j = judge(await measure(pg)); badZ += j.length; if (j.length && !firstZ) firstZ = nameOf(id) + "：" + j[0]; }
      anti(badZ > 0, tag + " AVOID＝false → 点选态相交 " + badZ + " 处", firstZ);
      await pg.evaluate(() => { PANO_ELAB.AVOID = true; resetRelFocus(); });
    }
    await setAll(pg, false);
    const pick = await topDeg(pg);
    const [x, y] = await nodeXY(pg, pick);
    if (touch) await pg.touchscreen.tap(x, y); else await pg.mouse.click(x, y);
    await pg.waitForTimeout(250);
    const m = await measure(pg);
    ok(m.focus === pick && m.layerOn && m.labs.length > 0 && judge(m).length === 0, w + (touch ? " 触点" : " 鼠标点") + "「" + nameOf(pick) + "」：边名层现，示 " + m.labs.length + " 条（隐 " + m.stats.hidden + "），不相交");
    await scr(pg, "x3c_select_" + w);
    const bg = await pg.evaluate(() => { const svg = document.querySelector("#rel-canvas svg"), r = svg.getBoundingClientRect();
      for (let fy = 0.05; fy < 1; fy += 0.05) for (let fx = 0.05; fx < 1; fx += 0.05) { const x = r.left + r.width * fx, y = r.top + r.height * fy; if (document.elementFromPoint(x, y) === svg) return [x, y]; } return null; });
    if (touch) await pg.touchscreen.tap(bg[0], bg[1]); else await pg.mouse.click(bg[0], bg[1]);
    await pg.waitForTimeout(200);
    const m2 = await measure(pg);
    ok(!m2.focus && !m2.layerOn, w + " 点空白处解点选，边名层复隐");
    if (!touch) {
      await pg.focus('#rel-canvas .rel-node[data-node="' + pick + '"]'); await pg.keyboard.press("Enter"); await pg.waitForTimeout(150);
      const f1 = await pg.evaluate(() => relView.focus);
      await pg.keyboard.press("Escape"); await pg.waitForTimeout(150);
      const m3 = await measure(pg);
      ok(f1 === pick && !m3.focus && !m3.layerOn, w + " 键盘：Enter 点选、Esc 解点选，边名层复隐");
    }
    await ctx.close();
  }

  /* ===== §二 开关开 ===== */
  H("§二 「全部关系名」开关开：相交者先隐，「另 N 条因重叠未示」N 照实；悬停即现；拖中重判；拖开即现");
  for (const w of [1440, 375]) {
    const { ctx, pg, touch } = await open(w);
    for (const all of [false, true]) {
      if (all) await setAll(pg, true);
      const tag = w + (all ? " 显示全部" : " 只主角");
      await setSwitch(pg, true);
      const m = await measure(pg);
      const bad = judge(m), total = await pg.evaluate(() => relView.edges.length), jn = judgeN(m);
      ok(m.layerOn && bad.length === 0 && m.labs.length + m.domHidden === total, tag + "：开关开，所示边名 " + m.labs.length + " 两两不交、不压名签；实隐 " + m.domHidden + "（共 " + total + " 边）", bad.slice(0, 5).join("；"));
      ok(jn.okN, tag + "：条上「" + jn.got + "」＝实隐 " + m.domHidden + "＝panoElabStats.hidden " + m.stats.hidden, jn.okN ? "" : "应「" + jn.want + "」");
      console.log("    〔备查〕" + tag + " 隐者 " + m.stats.hidden + "：" + m.stats.hiddenList.slice(0, 10).join("、") + (m.stats.hidden > 10 ? "……" : ""));
      await scr(pg, "x3c_switch_" + (all ? "all_" : "") + w);
      /* 反证一：AVOID＝false */
      await pg.evaluate(() => { PANO_ELAB.AVOID = false; panoPlaceLabels(); });
      const bz = judge(await measure(pg));
      anti(bz.length > 0, tag + " AVOID＝false → 开关开相交 " + bz.length + " 处", bz[0]);
      await pg.evaluate(() => { PANO_ELAB.AVOID = true; panoPlaceLabels(); });
      /* 反证三：PANO_ELAB.OWN_BADGE＝false（复原型之法：其边自身之圆签不为障）——「不压圆签」之断须红；只主角二宽俱有其例（「兄·私通」×圆签 2），
       *   显示全部之例随宽而定（x3c_try3：1440 有 3 处、375 无），只印备查 */
      await pg.evaluate(() => { PANO_ELAB.OWN_BADGE = false; for (const e of relView.edges) e.lab.dataset.t = ""; panoPlaceLabels(); });
      const bo = judge(await measure(pg)).filter(x => x.includes("×圆签"));
      if (!all && bo.length > 0) anti(true, tag + " OWN_BADGE＝false → 边名压圆签 " + bo.length + " 处", bo[0]);
      else if (!all) {
        /* 〔r62-U-丙 乙段 改〕53 人之只主角图，开关开态已无其例（u3_try1：1440、375 俱 0；x3c_try3 之「兄·私通」例系 49 人之图）。
         * 照「另路求之」：逐一点选在图诸主角（PROTAGONISTS 之序），取首个 OWN_BADGE＝false 下边名压圆签之点选态为反证之例；俱无则门自身出错。
         * 断言（「不压圆签」）一字未动，只换反证取例之途。 */
        console.log("    〔备查〕" + tag + " 开关开态 OWN_BADGE＝false → 边名压圆签 0 处（53 人之图此态无例），改求点选态之例");
        let hit = null;
        const ids = await pg.evaluate(() => PROTAGONISTS.map(m => m.id).filter(id => relView.nodes.has(id)));
        for (const id of ids) {
          await pg.evaluate((id) => { for (const e of relView.edges) e.lab.dataset.t = ""; focusRelNode(id); }, id);
          const bf = judge(await measure(pg)).filter(x => x.includes("×圆签"));
          if (bf.length) { hit = { id, n: bf.length, ex: bf[0] }; break; }
        }
        await pg.evaluate(() => resetRelFocus());
        anti(!!hit, tag + " OWN_BADGE＝false → 点选「" + (hit ? nameOf(hit.id) : "—") + "」之态边名压圆签 " + (hit ? hit.n : 0) + " 处", hit ? hit.ex : "");
      }
      else console.log("    〔备查〕" + tag + " OWN_BADGE＝false → 边名压圆签 " + bo.length + " 处（此图之例不定，不入反证；只主角之例见上，53 人之图起取点选态）" + (bo[0] ? "：" + bo[0] : ""));
      await pg.evaluate(() => { PANO_ELAB.OWN_BADGE = true; for (const e of relView.edges) e.lab.dataset.t = ""; panoPlaceLabels(); });
      /* 反证二：令一条隐者之名私自现出（不经 panoPlaceLabels），条上 N 与实隐脱节 */
      if (m.domHidden > 0) {
        await pg.evaluate(() => { const e = relView.edges.find(e => e.lab.style.display === "none"); e.lab.style.display = ""; });
        const jz = judgeN(await measure(pg));
        anti(!jz.okN, tag + " 私现一条隐名 → 「N＝实隐」之断红（条上「" + jz.got + "」，实应「" + jz.want + "」）");
        await pg.evaluate(() => panoPlaceLabels());
      }
      /* 点选一人且开关开：N 为其所连诸边中所隐者 */
      {
        const pk = await topDeg(pg);
        await pg.evaluate((id) => focusRelNode(id), pk);
        const mf = await measure(pg), jf = judgeN(mf);
        ok(jf.okN && judge(mf).length === 0, tag + "：开关开且点选「" + nameOf(pk) + "」，条上「" + jf.got + "」＝其所连诸边之实隐 " + mf.domHidden, jf.okN ? "" : "应「" + jf.want + "」");
        await pg.evaluate(() => resetRelFocus());
      }
      if (!all && !touch) {
        const hp = await pg.evaluate(() => { const e = relView.edges.find(e => e.lab.style.display === "none" && e.el.getTotalLength() > 40);
          if (!e) return null; const L = e.el.getTotalLength(); let best = null;
          for (const f of [0.5, 0.4, 0.6, 0.3, 0.7, 0.25, 0.75]) { const p = e.el.getPointAtLength(L * f), mm = e.el.getScreenCTM(), x = mm.a * p.x + mm.e, y = mm.d * p.y + mm.f;
            const t = document.elementFromPoint(x, y); if (t === e.hit || t === e.el) { best = [x, y]; break; } }
          return best ? { x: best[0], y: best[1], i: relView.edges.indexOf(e) } : null; });
        if (hp) {
          await pg.mouse.move(hp.x, hp.y); await pg.waitForTimeout(150);
          const on = await pg.evaluate((i) => relView.edges[i].lab.style.display !== "none", hp.i);
          await pg.mouse.move(5, 5); await pg.waitForTimeout(150);
          const off = await pg.evaluate((i) => relView.edges[i].lab.style.display === "none", hp.i);
          ok(on && off, tag + "：悬停一条隐者之边，其名即现；移开复隐");
        } else selfcheck(false, tag + "：觅得可悬停之隐边");
      }
      const pick = await topDeg(pg);
      const up = await drag(pg, ctx, touch, pick, 70, 40, 14, true);
      await pg.waitForTimeout(60);
      const md = await measure(pg);
      const bd = judge(md), jd = judgeN(md);
      /* X3 续（裁二百五十七 二1）：拖动之中边名隔帧一判、圆签随中点移，门量止动后之静态；拖中之交只印备查（5e14000 时为断） */
      console.log("    〔备查〕" + tag + "：拖动之中（指针未放）所示边名 " + md.labs.length + "，相交 " + bd.length + " 处" + (bd.length ? "（" + bd.slice(0, 3).join("；") + "）" : "") + "；条上「" + jd.got + "」");
      await up();
      await waitStop(pg, 4000);
      const ms = await measure(pg);
      ok(judge(ms).length === 0 && judgeN(ms).okN, tag + "：止后所示边名仍不交，N 照实（" + ms.hcTxt + "）");
      await pg.evaluate(() => panoResetAll(document.querySelector("#rel-canvas svg")));
      const tries = await pg.evaluate(() => {
        const cx = panoView.full.w / 2, cy = panoView.full.h / 2;
        return relView.edges.map((e, i) => ({ e, i })).filter(o => o.e.lab.style.display === "none").slice(0, 8).map(({ e, i }) => {
          const da = Math.hypot(e.A.x - cx, e.A.y - cy), db = Math.hypot(e.B.x - cx, e.B.y - cy), end = da > db ? e.A : e.B, other = da > db ? e.B : e.A;
          let ux = end.x - other.x, uy = end.y - other.y; const L = Math.hypot(ux, uy) || 1; ux /= L; uy /= L;
          return { i, id: end.p.id, ux, uy, s: e.lab.textContent };
        }); });
      let pulled = null;
      for (const t of tries) {
        const k = await pg.evaluate(() => document.querySelector("#rel-canvas svg").getScreenCTM().a);
        await drag(pg, ctx, touch, t.id, t.ux * 120 * k, t.uy * 120 * k, 14);
        await waitStop(pg, 4000);
        if (await pg.evaluate((i) => relView.edges[i].lab.style.display !== "none", t.i)) { pulled = t; break; }
        await pg.evaluate(() => panoResetAll(document.querySelector("#rel-canvas svg")));
      }
      ok(!!pulled, tag + "：拖开即现——" + (pulled ? "拖「" + nameOf(pulled.id) + "」外移，「" + pulled.s + "」由隐而现" : "试 " + tries.length + " 条俱未现"));
      await pg.evaluate(() => panoResetAll(document.querySelector("#rel-canvas svg")));
      await setSwitch(pg, false);
      const mo = await measure(pg);
      ok(mo.hcTxt === "", tag + "：开关关，「另 N 条」不示");
    }
    await ctx.close();
  }

  /* ===== §三 弹性拖拽（内嵌） ===== */
  H("§三 弹性拖拽（内嵌）：随动、钉住、限时止动、⟲ 复初布局；反证");
  for (const w of [1440, 375]) {
    const { ctx, pg, touch } = await open(w);
    const init = await coords(pg);
    const pick = await topDeg(pg), name = nameOf(pick);
    const limit = await pg.evaluate(() => PANO_SIM.SETTLE_MS);
    for (const st of ["select", "switch"]) {
      const tag = w + " " + (st === "select" ? "点选态" : "开关开态");
      if (st === "select") await pg.evaluate((id) => focusRelNode(id), pick); else { await pg.evaluate(() => resetRelFocus()); await setSwitch(pg, true); }
      await scr(pg, "x3c_drag_before_" + st + "_" + w);
      const pre = await coordMap(pg);
      const up = await drag(pg, ctx, touch, pick, 90, 60, 14, true);
      await pg.waitForTimeout(80);
      const mid = await coordMap(pg);
      const movedOthers = Object.keys(mid).filter(id => id !== pick && Math.hypot(mid[id][0] - pre[id][0], mid[id][1] - pre[id][1]) > 0.5).length;
      if (st === "switch") await scr(pg, "x3d_dragging_" + w);
      await up();
      const rel = await pg.evaluate((id) => { const v = relView.nodes.get(id); return [v.x, v.y]; }, pick);
      const ws = await waitStop(pg, limit + 300);
      /* 渐停前之颤（裁二百五十七 二3）：放手后各帧诸人之最大位移；印渐停前 0.5 s（[SETTLE−FADE−500, SETTLE−FADE)）与渐停之 0.5 s 内之最大者；逾 0.5 则停而报 */
      {
        const dz = await pg.evaluate(() => ({ d: panoSim ? panoSim.disp.slice() : [], S: PANO_SIM.SETTLE_MS, F: PANO_SIM.FADE_MS }));
        const pre05 = dz.d.filter(a => a[0] >= dz.S - dz.F - 500 && a[0] < dz.S - dz.F).map(a => a[1]);
        const fade = dz.d.filter(a => a[0] >= dz.S - dz.F).map(a => a[1]);
        const m1 = pre05.length ? Math.max(...pre05) : NaN, m2 = fade.length ? Math.max(...fade) : NaN;
        const last05 = dz.d.filter(a => a[0] >= (ws.after || 0) - 500).map(a => a[1]), m3 = last05.length ? Math.max(...last05) : NaN;
        console.log("    " + (m1 > 0.5 || m2 > 0.5 ? "★★ 逾 0.5" : "〔备查〕") + " " + tag + " 止于放手后 " + ws.after + " ms（" + (ws.by === "cool" ? "冷却之限：κ＜KAPPA_MIN" : ws.by === "calm" ? "提早止：连续 10 帧实移＜V_MIN" : "2.5 s 之限兜底") + "；rAF " + dz.d.length + " 帧，均 " + (ws.after && dz.d.length ? (ws.after / dz.d.length).toFixed(1) : "—") + " ms／帧）；" +
          "渐停前 0.5 s（" + (dz.S - dz.F - 500) + "–" + (dz.S - dz.F) + " ms，" + pre05.length + " 帧）每帧最大位移 " + (isNaN(m1) ? "—（已止）" : m1.toFixed(3)) +
          "；渐停之 0.5 s（" + fade.length + " 帧）" + (isNaN(m2) ? "—（已止）" : m2.toFixed(3)) + "；止前 0.5 s（" + last05.length + " 帧）" + (isNaN(m3) ? "—" : m3.toFixed(3)) + "（单位：viewBox）");
      }
      const s1 = await coordMap(pg);
      await pg.waitForTimeout(600);
      const s2 = await coordMap(pg);
      const still = JSON.stringify(s1) === JSON.stringify(s2);
      const pinned = s2[pick][0] === rel[0] && s2[pick][1] === rel[1];
      const focusKept = await pg.evaluate(() => relView.focus);
      ok(movedOthers > 0, tag + "：拖「" + name + "」，拖中余者随动 " + movedOthers + " 人");
      ok(pinned, tag + "：放手后被拖者钉住（" + rel.join(",") + "）");
      ok(ws.stopped && still, tag + "：放手后 " + (ws.after != null ? ws.after + " ms" : "？") + " 止动（" + (ws.by === "cool" ? "冷却之限" : ws.by === "calm" ? "提早止" : "限时") + "；限 " + limit + "＋300），止后 600 ms 坐标不变");
      ok(st !== "select" || focusKept === pick, tag + "：拖动不改点选（不误触）");
      const lm = await measure(pg);
      ok(judge(lm).length === 0 && judgeN(lm).okN, tag + "：止后所示边名不交，N 照实", judge(lm).slice(0, 3).join("；"));
      await scr(pg, "x3c_drag_after_" + st + "_" + w);
      if (st === "switch") await scr(pg, "x3d_stopped_" + w);
      if (st === "switch") {
        const oth = await pg.evaluate((p) => { const a = relView.nodes.get(p); let best = null, bd = 1e9;
          for (const v of relView.nodes.values()) { if (v.p.id === p) continue; const d = Math.hypot(v.x - a.x, v.y - a.y); if (d < bd) { bd = d; best = v.p.id; } } return best; }, pick);
        await drag(pg, ctx, touch, oth, -60, 30, 10);
        await waitStop(pg, limit + 300);
        const s3 = await coordMap(pg);
        ok(s3[pick][0] === rel[0] && s3[pick][1] === rel[1], tag + "：再拖近旁一人（" + nameOf(oth) + "），前钉者不移");
      }
      await pg.click(RESET_SEL);
      await pg.waitForTimeout(150);
      const back = await coords(pg);
      const pins = await pg.evaluate(() => panoSim ? [...panoSim.pin].reduce((a, b) => a + b, 0) : 0);
      const vb = await pg.evaluate(() => ({ b: { ...panoView.box }, f: { ...panoView.full } }));
      ok(back === init && pins === 0 && Math.abs(vb.b.w - vb.f.w) < 0.5, tag + "：⟲ 后诸盘心与初布局逐位同、钉者俱解、视野复全图");
      await scr(pg, "x3c_reset_" + st + "_" + w);
      if (st === "select") await pg.evaluate(() => resetRelFocus());
    }
    await setSwitch(pg, false);
    {
      await pg.evaluate(() => { PANO_SIM.ELASTIC = false; });
      const pre = await coordMap(pg);
      const up = await drag(pg, ctx, touch, pick, 90, 60, 14, true);
      await pg.waitForTimeout(80);
      const mid = await coordMap(pg);
      await up(); await waitStop(pg, 1000);
      const mo = Object.keys(mid).filter(id => id !== pick && Math.hypot(mid[id][0] - pre[id][0], mid[id][1] - pre[id][1]) > 0.5).length;
      anti(mo === 0, w + " ELASTIC＝false → 拖中余者随动 " + mo + "（「随动＞0」之断红）");
      await pg.evaluate(() => { PANO_SIM.ELASTIC = true; panoResetAll(document.querySelector("#rel-canvas svg")); });
    }
    {
      await pg.evaluate(() => { PANO_SIM.STOP = false; });
      await drag(pg, ctx, touch, pick, 90, 60, 14);
      const ws = await waitStop(pg, limit + 300);
      anti(!ws.stopped, w + " STOP＝false → 放手 " + (limit + 300) + " ms 后仍未止（「限时止动」之断红）");
      await pg.evaluate(() => { PANO_SIM.STOP = true; panoSimStop(); panoResetAll(document.querySelector("#rel-canvas svg")); });
    }
    {
      await pg.evaluate(() => { PANO_SIM.RESET_LAYOUT = false; });
      await drag(pg, ctx, touch, pick, 90, 60, 14);
      await waitStop(pg, limit + 300);
      await pg.click(RESET_SEL);
      await pg.waitForTimeout(150);
      anti((await coords(pg)) !== init, w + " RESET_LAYOUT＝false → ⟲ 后坐标与初布局不同（「逐位同」之断红）");
      await pg.evaluate(() => { PANO_SIM.RESET_LAYOUT = true; panoResetAll(document.querySelector("#rel-canvas svg")); });
      ok((await coords(pg)) === init, w + " 反证毕，⟲ 复初布局");
    }
    await setAll(pg, true);
    const initAll = await coords(pg), pickAll = await topDeg(pg);
    await drag(pg, ctx, touch, pickAll, 120, 80, 20);
    await waitStop(pg, limit + 300);
    await pg.click(RESET_SEL); await pg.waitForTimeout(150);
    ok((await coords(pg)) === initAll, w + " 「显示全部」拖后 ⟲，诸盘心与初布局逐位同");
    await ctx.close();
  }

  /* ===== §四 放大查看内之弹性拖拽 ===== */
  H("§四 放大查看内之弹性拖拽：门同内嵌（随动、钉住、限时止动、⟲ 复初逐位同）；克隆与内嵌逐位同；反证");
  for (const w of [1440, 375]) {
    const { ctx, pg, touch } = await open(w);
    const init = await coords(pg);
    const limit = await pg.evaluate(() => PANO_SIM.SETTLE_MS);
    const openOv = async () => { await pg.click("#btn-rel-zoom"); await pg.waitForTimeout(500); };
    const closeOv = async () => { await pg.click("#btn-overlay-close"); await pg.waitForTimeout(250); };
    await openOv();
    const cl0 = await cloneCoords(pg);
    selfcheck(cl0 === init, w + " 放大查看：克隆体初开与初布局逐位同");
    {
      const hint = await pg.evaluate(() => { const h = document.querySelector("#map-overlay-hint"), cs = getComputedStyle(h);
        const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2, r = h.getBoundingClientRect();
        return { t: h.textContent, lines: Math.round(r.height / lh), h: +r.height.toFixed(1), lh: +lh.toFixed(1) }; });
      ok(hint.t === "拖空白处平移 · 拖人物可拉开 · 滚轮/双指缩放 · 点连线/节点看关系" && hint.lines <= 2,
        w + " 放大查看之提示句「" + hint.t + "」，占 " + hint.lines + " 行（高 " + hint.h + "／行高 " + hint.lh + "；375 宽须不逾二行）");
      if (w === 375) await scr(pg, "x3d_fullscreen_hint_375", "page");
    }
    /* 择克隆体内可见之度最高者 */
    const pick = await pg.evaluate(() => { const deg = new Map(); for (const e of relView.edges) for (const x of [e.a, e.b]) deg.set(x, (deg.get(x) || 0) + 1);
      const body = document.querySelector("#map-overlay-body").getBoundingClientRect();
      const vis = (id) => { const r = document.querySelector('#map-overlay-body .rel-node[data-node="' + id + '"] circle').getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2; return x > body.left + 120 && x < body.right - 120 && y > body.top + 120 && y < body.bottom - 120; };
      return [...deg.entries()].filter(([id]) => vis(id)).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0]; });
    await scr(pg, "x3c_fullscreen_before_" + w, "page");
    const pre = await coordMap(pg);
    const up = await drag(pg, ctx, touch, pick, 80, 50, 14, true, true);
    await pg.waitForTimeout(80);
    const mid = await coordMap(pg);
    const movedOthers = Object.keys(mid).filter(id => id !== pick && Math.hypot(mid[id][0] - pre[id][0], mid[id][1] - pre[id][1]) > 0.5).length;
    const draggedMoved = Math.hypot(mid[pick][0] - pre[pick][0], mid[pick][1] - pre[pick][1]);
    await up();
    await pg.waitForTimeout(60);
    const drawerOpen = await pg.evaluate(() => typeof drawer !== "undefined" && !!drawer.open);
    const rel = await pg.evaluate((id) => { const v = relView.nodes.get(id); return [v.x, v.y]; }, pick);
    const ws = await waitStop(pg, limit + 300);
    const s1 = await coordMap(pg);
    await pg.waitForTimeout(600);
    const s2 = await coordMap(pg);
    const tag = w + " 放大查看";
    ok(draggedMoved > 5 && movedOthers > 0, tag + "：拖「" + nameOf(pick) + "」（移 " + draggedMoved.toFixed(1) + "），拖中余者随动 " + movedOthers + " 人");
    ok(s2[pick][0] === rel[0] && s2[pick][1] === rel[1], tag + "：放手后被拖者钉住");
    ok(ws.stopped && JSON.stringify(s1) === JSON.stringify(s2), tag + "：放手后 " + (ws.after != null ? ws.after + " ms" : "？") + " 止动（" + (ws.by === "cool" ? "冷却之限" : ws.by === "calm" ? "提早止" : "限时") + "；限 " + limit + "＋300），止后 600 ms 坐标不变");
    ok(!drawerOpen, tag + "：拖人放手不开抽屉（不误触）");
    const [ce, cc] = [await coords(pg), await cloneCoords(pg)];
    ok(ce === cc && ce !== init, tag + "：克隆体诸盘心与内嵌逐位同（镜），且已离初布局");
    await scr(pg, "x3c_fullscreen_after_" + w, "page");
    await pg.click(OV_RESET_SEL);
    await pg.waitForTimeout(200);
    const pins = await pg.evaluate(() => panoSim ? [...panoSim.pin].reduce((a, b) => a + b, 0) : 0);
    ok((await coords(pg)) === init && (await cloneCoords(pg)) === init && pins === 0, tag + "：浮层 ⟲ 后内嵌与克隆俱与初布局逐位同、钉者俱解");
    await scr(pg, "x3c_fullscreen_reset_" + w, "page");
    /* 点人仍开抽屉 */
    {
      const [x, y] = await nodeXY(pg, pick, true);
      if (touch) await pg.touchscreen.tap(x, y); else await pg.mouse.click(x, y);
      await pg.waitForTimeout(300);
      const dOpen = await pg.evaluate(() => !!drawer.open);
      ok(dOpen, tag + "：点人（未拖）仍开抽屉，列其一度关系");
      await pg.evaluate(() => { if (drawer.open) closeDrawer(); });
      await pg.waitForTimeout(450);   // closeDrawer 之幕（#drawer-backdrop）250 ms 后方 hidden；未候足则其后之拖落于幕上（x3c_try1 之误，见交付）
    }
    /* 反证 */
    {
      await pg.evaluate(() => { PANO_SIM.STOP = false; });
      await drag(pg, ctx, touch, pick, 80, 50, 14, false, true);
      const wz = await waitStop(pg, limit + 300);
      anti(!wz.stopped, tag + " STOP＝false → 放手 " + (limit + 300) + " ms 后仍未止");
      await pg.evaluate(() => { PANO_SIM.STOP = true; panoSimStop(); });
      await pg.click("#overlay-rel-tools button"); await pg.waitForTimeout(150);
    }
    {
      await pg.evaluate(() => { PANO_SIM.RESET_LAYOUT = false; });
      await drag(pg, ctx, touch, pick, 80, 50, 14, false, true);
      await waitStop(pg, limit + 300);
      await pg.click("#overlay-rel-tools button"); await pg.waitForTimeout(150);
      anti((await cloneCoords(pg)) !== init, tag + " RESET_LAYOUT＝false → 浮层 ⟲ 后坐标与初布局不同");
      await pg.evaluate(() => { PANO_SIM.RESET_LAYOUT = true; });
      await pg.click("#overlay-rel-tools button"); await pg.waitForTimeout(150);
    }
    {
      await pg.evaluate(() => { relZoom.mirror = null; });
      await drag(pg, ctx, touch, pick, 80, 50, 14, false, true);
      await waitStop(pg, limit + 300);
      const [ez, cz] = [await coords(pg), await cloneCoords(pg)];
      anti(ez !== cz, tag + " 断镜（relZoom.mirror＝null）→ 克隆与内嵌不再逐位同（「镜」之断红）");
    }
    await closeOv();
    await pg.evaluate(() => panoResetAll(document.querySelector("#rel-canvas svg")));
    ok((await coords(pg)) === init, w + " 关浮层后内嵌 ⟲ 复初布局");
    /* 显示全部：放大查看内拖后 ⟲ 逐位同 */
    await setAll(pg, true);
    const initAll = await coords(pg);
    await openOv();
    const pickAll = await pg.evaluate(() => { const body = document.querySelector("#map-overlay-body").getBoundingClientRect();
      let best = null, bd = 1e9; for (const g of document.querySelectorAll("#map-overlay-body .rel-node.proto")) { const r = g.querySelector("circle").getBoundingClientRect();
        const d = Math.hypot(r.left + r.width / 2 - (body.left + body.width / 2), r.top + r.height / 2 - (body.top + body.height / 2)); if (d < bd) { bd = d; best = g.dataset.node; } } return best; });
    const pa = await coordMap(pg);
    await drag(pg, ctx, touch, pickAll, 60, 40, 12, false, true);
    const ws2 = await waitStop(pg, limit + 300);
    const pb = await coordMap(pg);
    const mv = Object.keys(pb).filter(id => id !== pickAll && Math.hypot(pb[id][0] - pa[id][0], pb[id][1] - pa[id][1]) > 0.5).length;
    ok(mv > 0 && ws2.stopped && (await coords(pg)) === (await cloneCoords(pg)), w + " 放大查看「显示全部」：拖「" + nameOf(pickAll) + "」余者随动 " + mv + " 人、" + ws2.after + " ms 止、克隆与内嵌逐位同");
    await pg.click("#overlay-rel-tools button"); await pg.waitForTimeout(200);
    ok((await coords(pg)) === initAll && (await cloneCoords(pg)) === initAll, w + " 放大查看「显示全部」⟲ 后逐位同初布局");
    await closeOv();
    await ctx.close();
  }

  /* ===== §五 偏置之量（裁二百五十六 三） ===== */
  H("§五 偏置之量；不加偏置、全式松弛之最大位移（只主角须 ＜ 15）；反证");
  {
    const { ctx, pg } = await open(1440);
    for (const all of [false, true]) {
      if (all) await setAll(pg, true);
      const r = await pg.evaluate(() => panoBiasProbe(600));
      const tag = all ? "显示全部" : "只主角";
      console.log("    〔备查〕" + tag + "（" + r.n + " 人，" + (r.grid ? "网格" : "逐对") + "）偏置 |F(x0)| 中位 " + r.biasMed + "、最大 " + r.biasMax +
        "；最大五人：" + r.biasTop.map(o => o.name + " " + o.v).join("、"));
      console.log("    〔备查〕" + tag + " 不加偏置松弛 600 步：位移中位 " + r.driftMed + "、最大 " + r.driftMax + "（逾 5 者 " + r.over5 + " 人）；最大五人：" + r.driftTop.map(o => o.name + " " + o.v).join("、"));
      if (!all) {
        ok(r.driftMax < 15, "只主角：不加偏置、全式松弛之最大位移 " + r.driftMax + " ＜ 15（主角盘半径）");
        const victim = r.biasTop[0].id;
        /* 〔r62-U-丙 乙段 改〕外移之量 20 → 30（＝主角盘之径，2×15）。由：53 人之图外移 20 者（息妫）松弛只回 10.971，「＜15」之断不红（u3_try1）；
         *   探之 25 → 15.52、30 → 20.283、40 → 22.677（team/r62U_bing_luobi/logs/probe_anti_53.log）。取盘径为量，不取恰过之 25。
         *   断言（只主角最大位移 ＜ 15）一字未动，只增反证之扰。 */
        const rz = await pg.evaluate((id) => { const p = panoView.cache.pos.get(id), old = p.slice(); p[0] = +(p[0] + 30).toFixed(2);
          const res = panoBiasProbe(600); panoView.cache.pos.set(id, old); return res; }, victim);
        anti(!(rz.driftMax < 15), "令「" + nameOf(victim) + "」初位外移 30（盘径）而不重算布局 → 最大位移 " + rz.driftMax + "（「＜15」之断红）");
      }
    }
    await ctx.close();
  }

  /* ===== §六 帧耗 ===== */
  H("§六 拖动之帧耗（只书，不入判；的：375 CPU ×4 只主角 P95 ≤ 33 ms、显示全部 ≤ 50 ms，裁二百五十七 二1）");
  for (const [w, rate, grid, all] of [[1440, 1, true, true], [375, 1, true, true], [375, 4, true, false], [375, 4, true, true]]) {
    const { ctx, pg, touch } = await open(w);
    if (all) await setAll(pg, true);
    await pg.evaluate((g) => { PANO_SIM.GRID = g; panoSim = null; }, grid);   // grid＝false：逐对精算（「前」之数），只为量
    const n = await pg.evaluate(() => relView.nodes.size);
    const pickAll = await topDeg(pg);
    let cdp = null;
    if (rate > 1) { cdp = await ctx.newCDPSession(pg); await cdp.send("Emulation.setCPUThrottlingRate", { rate }); }
    const limit = await pg.evaluate(() => PANO_SIM.SETTLE_MS);
    for (const st of ["switch", "select"]) {
      if (st === "switch") await setSwitch(pg, true); else { await setSwitch(pg, false); await pg.evaluate((id) => focusRelNode(id), pickAll); }
      await pg.evaluate(() => { window.__raf = []; let last = performance.now(); window.__rafOn = true;
        const f = (t) => { window.__raf.push(t - last); last = t; if (window.__rafOn) requestAnimationFrame(f); }; requestAnimationFrame(f); });
      await drag(pg, ctx, touch, pickAll, 120, 80, 60);
      await waitStop(pg, limit * 3 + 300);
      const fr = await pg.evaluate(() => { window.__rafOn = false; return { tick: panoSim.frames.slice(), split: panoSim.split.slice(), raf: window.__raf.slice(2), grid: panoSim.grid }; });
      const goal = rate > 1 ? (all ? 50 : 33) : null, p95 = q(fr.tick, 0.95);
      console.log("    ★ " + w + (rate > 1 ? "（CDP CPU ×" + rate + "）" : "（不降速）") + (all ? " 「显示全部」" : " 只主角 ") + n + " 人" + (fr.grid ? "（网格）" : "（逐对）") +
        (goal ? "〔的 P95 ≤ " + goal + "：" + (p95 <= goal ? "达" : "未达") + "〕" : "") +
        (st === "switch" ? "，开关开" : "，点选「" + nameOf(pickAll) + "」") +
        "：panoSimTick " + fr.tick.length + " 帧，中位 " + q(fr.tick, 0.5).toFixed(1) + "、P95 " + q(fr.tick, 0.95).toFixed(1) + "、最大 " + Math.max(...fr.tick).toFixed(1) +
        " ms；rAF 帧距中位 " + q(fr.raf, 0.5).toFixed(1) + "、P95 " + q(fr.raf, 0.95).toFixed(1) + " ms");
      console.log("      分项中位：力学＋推开＋置点 " + q(fr.split.map(a => a[0]), 0.5).toFixed(1) + "／置边 " + q(fr.split.map(a => a[1]), 0.5).toFixed(1) + "／边名择位 " + q(fr.split.map(a => a[2]), 0.5).toFixed(1) + " ms");
      if (w === 1440 && st === "switch" && rate === 1 && grid) await scr(pg, "x3c_all_drag_after_1440");
      await pg.click(RESET_SEL);
      await pg.waitForTimeout(rate > 1 ? 600 : 150);
    }
    if (cdp) { await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 }); await cdp.detach(); }
    await ctx.close();
  }

  /* ===== §七 X3 续二 ===== */
  H("§七 X3 续二（裁二百六十 一）：⟲ 兼解点选；条上开关不竖排（六宽）；提示句「·」分段不折；反证");
  const stateOf = (pg) => pg.evaluate(() => ({ focus: relView.focus, fe: document.querySelectorAll("#rel-canvas .rel-node.focused").length,
    fc: document.querySelectorAll("#map-overlay-body .rel-node.focused").length,
    dimE: [...document.querySelectorAll("#rel-canvas .rel-node")].filter(g => g.style.opacity && g.style.opacity !== "0.25").length,
    dimC: [...document.querySelectorAll("#map-overlay-body .rel-node")].filter(g => g.style.opacity && g.style.opacity !== "0.25").length,
    panel: (() => { const p = document.querySelector("#rel-panel"); const h = p.querySelector("h3"), s = p.querySelector("p.map-status");
      return (h ? h.textContent : "") + "｜" + (s ? s.textContent : "") + "｜" + p.children.length; })(),
    sw: document.querySelector("#pano-elabel").checked, all: document.querySelector("#rel-show-all").checked, ev: panoView.edgeLabels }));
  const panelInit = "关系详情｜" + PANEL_INIT + "｜2";
  for (const w of [1440, 375]) {
    const { ctx, pg } = await open(w);
    const pick = await topDeg(pg);
    for (const [all, swOn] of [[false, false], [true, true]]) {
      await setAll(pg, all); await setSwitch(pg, swOn);
      const tag = w + (all ? " 显示全部、全部关系名开" : " 只主角、开关关");
      /* 内嵌：真点其人（点盘心）→ ⟲ */
      const [x, y] = await nodeXY(pg, pick);
      if (w <= 680) await pg.touchscreen.tap(x, y); else await pg.mouse.click(x, y);
      await pg.waitForTimeout(200);
      const s0 = await stateOf(pg);
      selfcheck(s0.focus === pick && s0.fe === 1 && s0.panel !== panelInit, tag + "：点「" + nameOf(pick) + "」已点选（focus " + s0.focus + "、focused " + s0.fe + "）");
      await pg.click(RESET_SEL); await pg.waitForTimeout(200);
      const s1 = await stateOf(pg);
      ok(s1.focus === null && s1.fe === 0 && s1.dimE === 0 && s1.panel === panelInit, tag + "：内嵌 ⟲ 后 focus 空、无 focused、无淡出、右栏复初句", JSON.stringify(s1));
      ok(s1.sw === swOn && s1.ev === swOn && s1.all === all, tag + "：内嵌 ⟲ 不动「全部关系名」「显示全部」二开关（" + s1.sw + "／" + s1.all + "）");
      if (w === 375 && all) await scr(pg, "x3e_reset_focus_embed_375");
      /* 放大查看：内嵌点选后开浮层（克隆带点选之态）→ 浮层 ⟲ */
      await pg.evaluate((id) => focusRelNode(id), pick);
      await pg.click("#btn-rel-zoom"); await pg.waitForTimeout(500);
      const s2 = await stateOf(pg);
      selfcheck(s2.focus === pick && s2.fc === 1, tag + "：放大查看开，克隆体带点选之态（focused " + s2.fc + "）");
      await pg.click(OV_RESET_SEL); await pg.waitForTimeout(200);
      const s3 = await stateOf(pg);
      ok(s3.focus === null && s3.fe === 0 && s3.fc === 0 && s3.dimE === 0 && s3.dimC === 0 && s3.panel === panelInit,
        tag + "：浮层 ⟲ 后 focus 空、内嵌与克隆俱无 focused、无淡出、右栏复初句", JSON.stringify(s3));
      ok(s3.sw === swOn && s3.all === all, tag + "：浮层 ⟲ 不动二开关");
      if (w === 375 && all) await scr(pg, "x3e_reset_focus_overlay_375", "page");
      await pg.click("#btn-overlay-close"); await pg.waitForTimeout(300);
    }
    /* 反证：RESET_FOCUS＝false（⟲ 不解点选） */
    await setAll(pg, false); await setSwitch(pg, false);
    await pg.evaluate((id) => { PANO_SIM.RESET_FOCUS = false; focusRelNode(id); }, pick);
    await pg.click(RESET_SEL); await pg.waitForTimeout(200);
    const r1 = await stateOf(pg);
    anti(!(r1.focus === null && r1.fe === 0 && r1.panel === panelInit), w + " RESET_FOCUS＝false → 内嵌 ⟲ 后 focus 仍 " + r1.focus + "、focused " + r1.fe + "（「解点选」之断红）");
    await pg.click("#btn-rel-zoom"); await pg.waitForTimeout(500);
    await pg.click(OV_RESET_SEL); await pg.waitForTimeout(200);
    const r2 = await stateOf(pg);
    anti(!(r2.focus === null && r2.fc === 0 && r2.panel === panelInit), w + " RESET_FOCUS＝false → 浮层 ⟲ 后 focus 仍 " + r2.focus + "、克隆 focused " + r2.fc + "（「解点选」之断红）");
    await pg.click("#btn-overlay-close"); await pg.waitForTimeout(300);
    await pg.evaluate(() => { PANO_SIM.RESET_FOCUS = true; resetRelFocus(); });
    await ctx.close();
  }
  /* 2 条上开关不竖排 */
  const barM = (pg) => pg.evaluate(() => {
    const lab = document.querySelector("#rel-canvas .pano-bar .rel-filter"), row = document.querySelector("#rel-canvas .pano-row"),
      bar = document.querySelector("#rel-canvas .pano-bar"), cv = document.querySelector("#rel-canvas");
    const cs = getComputedStyle(lab), fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) || fs * 1.2;
    const lr = lab.getBoundingClientRect(), br = bar.getBoundingClientRect(), cr = cv.getBoundingClientRect();
    const kids = [...row.children].filter(k => getComputedStyle(k).display !== "none").map(k => k.getBoundingClientRect());
    const out = kids.filter(k => k.right > br.right + 0.5 || k.left < br.left - 0.5).length;
    const aside = document.querySelector("#rel-canvas .pano-aside").getBoundingClientRect();
    return { lw: +lr.width.toFixed(1), lh: +lr.height.toFixed(1), line: +lh.toFixed(1), frame: +cr.width.toFixed(0),
      rowOv: row.scrollWidth - row.clientWidth, out, barOut: br.right > cr.right + 0.5 ? 1 : 0, pageOv: document.scrollingElement.scrollWidth > innerWidth,
      asideOwnLine: aside.top >= lr.bottom - 0.5, asideH: +aside.height.toFixed(1), asideW: +aside.width.toFixed(0) };
  });
  for (const w of [375, 682, 768, 900, 1024, 1440]) {
    const { ctx, pg } = await open(w);
    for (const swOn of [false, true]) {
      await setSwitch(pg, swOn);
      const m = await barM(pg);
      const good = m.lh <= 1.5 * m.line && m.rowOv <= 0 && m.out === 0 && m.barOut === 0 && !m.pageOv;
      ok(good, w + (swOn ? "（开关开，示「另 N 条」）" : "（开关关）") + "：图框宽 " + m.frame + "，「全部关系名」签 " + m.lw + "×" + m.lh + "（≤ 1.5×" + m.line + "＝" + (1.5 * m.line).toFixed(1) +
        "），条横溢 " + m.rowOv + "、出条 " + m.out + "、页横溢 " + m.pageOv + "；小注" + (m.asideOwnLine ? "另起一行" : "同行") + "（" + m.asideW + "×" + m.asideH + "）");
      if (swOn) await scr(pg, "x3e_bar_" + w, "#rel-canvas .pano-bar");
    }
    if (w === 682) {
      /* 反证三式（x3e_try1：只去 nowrap 不红——今制条可折、图框窄则小注另起一行，签本不受挤；nowrap 为条不能折时之守。见交付「验收偏差上报」）：
       *   甲 只去 nowrap、可缩：印之备查，不入判；
       *   乙 去 nowrap ＋ 条不折（.pano-row nowrap）：须红——nowrap 之守；
       *   丙 复旧（条不折、小注不另起、签可折，即 28dcd46 于 681–… 宽之式）：须红——复现生产之病。 */
      const css = {
        甲: ".pano-bar .rel-filter { white-space: normal !important; flex-shrink: 1 !important; }",
        乙: ".pano-bar .rel-filter { white-space: normal !important; flex-shrink: 1 !important; } .pano-row { flex-wrap: nowrap !important; }",
        丙: ".pano-bar .rel-filter { white-space: normal !important; flex-shrink: 1 !important; margin-right: 4px !important; } .pano-row { flex-wrap: nowrap !important; } " +
            ".pano-aside { order: 0 !important; flex-basis: auto !important; margin-right: auto !important; }",
      };
      for (const k of ["甲", "乙", "丙"]) {
        const tagEl = await pg.addStyleTag({ content: css[k] });
        await setSwitch(pg, true);
        const m = await barM(pg);
        const red = !(m.lh <= 1.5 * m.line);
        const msg = "682 反证" + k + "（" + (k === "甲" ? "只去 nowrap、可缩" : k === "乙" ? "去 nowrap ＋ 条不折" : "复旧：条不折、小注不另起、签可折") + "）→ 签 " + m.lw + "×" + m.lh + "（1.5×" + m.line + "＝" + (1.5 * m.line).toFixed(1) + "）";
        if (k === "甲") console.log("    〔备查·不入判〕" + msg + (red ? "，红" : "，不红（条可折，签不受挤）"));
        else anti(red, msg + "（「签高」之断红）");
        await scr(pg, "x3e_bar_682_anti_" + (k === "甲" ? "a" : k === "乙" ? "b" : "c"), "#rel-canvas .pano-bar");
        await tagEl.evaluate(el => el.remove());
      }
    }
    await ctx.close();
  }
  /* 3 提示句之段 */
  const hintM = (pg) => pg.evaluate(() => { const h = document.querySelector("#map-overlay-hint"), cs = getComputedStyle(h);
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2, r = h.getBoundingClientRect();
    const segs = [...h.querySelectorAll(".hint-seg")].map(s => ({ t: s.textContent, n: [...s.getClientRects()].filter(x => x.width > 0).length }));
    return { t: h.textContent, lines: Math.round(r.height / lh), segs }; });
  for (const w of [375, 682, 1440]) {
    const { ctx, pg } = await open(w);
    await pg.click("#btn-rel-zoom"); await pg.waitForTimeout(500);
    const m = await hintM(pg);
    const broken = m.segs.filter(s => s.n !== 1).map(s => s.t);
    ok(m.t === "拖空白处平移 · 拖人物可拉开 · 滚轮/双指缩放 · 点连线/节点看关系" && m.segs.length === 4 && broken.length === 0 && m.lines <= 2,
      w + " 放大查看之提示句：" + m.segs.length + " 段，段内折者 " + broken.length + (broken.length ? "（" + broken.join("、") + "）" : "") + "，占 " + m.lines + " 行（须 ≤ 2）");
    if (w === 375) {
      await scr(pg, "x3e_fullscreen_hint_375", "page");
      await pg.addStyleTag({ content: ".hint-seg { white-space: normal !important; }" });
      await pg.waitForTimeout(100);
      const a = await hintM(pg);
      const b2 = a.segs.filter(s => s.n !== 1).map(s => s.t);
      anti(b2.length > 0, "375 注入 .hint-seg 去 nowrap → 段内折者 " + b2.length + "（" + b2.join("、") + "；「段内不折」之断红）");
      await scr(pg, "x3e_fullscreen_hint_375_anti", "page");
    }
    await pg.click("#btn-overlay-close"); await pg.waitForTimeout(300);
    await ctx.close();
  }

  /* 4 浮层 ⟲ 兼收底部抽屉（r62-U-丙 乙段） */
  H("§七 4 浮层 ⟲ 兼收底部抽屉（键盘触 ⟲；指针实点 ⟲ 中心）；反证 RESET_DRAWER＝false、HOLE＝false");
  const drawerS = (pg) => pg.evaluate(() => ({ open: drawer.open, cls: document.querySelector("#place-drawer").classList.contains("open"),
    hid: document.querySelector("#place-drawer").hidden, bd: document.querySelector("#drawer-backdrop").hidden,
    act: document.activeElement && document.activeElement.getAttribute("aria-label"), focus: relView.focus,
    fc: document.querySelectorAll("#map-overlay-body .rel-node.focused").length }));
  const openDrawerInOverlay = async (pg, pick) => {
    await pg.click("#btn-rel-zoom"); await pg.waitForTimeout(500);
    await pg.evaluate((id) => document.querySelector('#map-overlay-body .rel-node[data-node="' + id + '"]').dispatchEvent(new MouseEvent("click", { bubbles: true })), pick);
    await pg.waitForTimeout(350);
    return drawerS(pg);
  };
  const kbReset = async (pg) => { await pg.focus(OV_RESET_SEL); await pg.keyboard.press("Enter"); await pg.waitForTimeout(400); return drawerS(pg); };
  for (const w of [1440, 375]) {
    const { ctx, pg } = await open(w);
    const pick = await topDeg(pg);
    const d0 = await openDrawerInOverlay(pg, pick);
    selfcheck(d0.open && d0.cls && !d0.hid, w + "：放大查看内点「" + nameOf(pick) + "」，底部抽屉开");
    if (w === 375) await scr(pg, "u3_overlay_drawer_open_375", "page");
    const d1 = await kbReset(pg);
    ok(!d1.open && !d1.cls && d1.hid && d1.bd && d1.focus === null && d1.fc === 0 && d1.act === "复位视野、布局与点选",
      w + "：键盘触浮层 ⟲ → 抽屉闭（drawer.open " + d1.open + "、.open " + d1.cls + "、hidden " + d1.hid + "、幕 hidden " + d1.bd + "）、点选解、焦点留于 ⟲（" + d1.act + "）");
    if (w === 375) await scr(pg, "u3_overlay_drawer_reset_375", "page");
    /* 指针之途（r62-U-丙 乙段续，裁二百六十四 四：入判）：放大查看内拖一人（坐标离初）→ 点一人开抽屉 → 以指针实点 ⟲ 之中心
     * （1440 鼠标、375 触屏 tap）→ 断一按：抽屉闭、点选解、内嵌与克隆之坐标复初。反证 PANO_SIM.HOLE＝false（复旧层叠：幕全覆浮层）须红 */
    const ptrRound = async (tag) => {
      await drag(pg, ctx, w <= 680, pick, 70, 40, 12, false, true);
      await waitStop(pg, 2800);
      await pg.waitForTimeout(120);
      const moved = (await coords(pg)) !== init0;
      await pg.evaluate((id) => document.querySelector('#map-overlay-body .rel-node[data-node="' + id + '"]').dispatchEvent(new MouseEvent("click", { bubbles: true })), pick);
      await pg.waitForTimeout(350);
      const hit = await pg.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return e ? (e.id ? "#" + e.id : (e.getAttribute("aria-label") || e.tagName)) : "无"; }, OV_RESET_SEL);
      const op = await drawerS(pg);
      const bb = await (await pg.$(OV_RESET_SEL)).boundingBox();
      if (w <= 680) await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await pg.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
      await pg.waitForTimeout(400);
      const dp = await drawerS(pg), back = (await coords(pg)) === init0 && (await cloneCoords(pg)) === init0;
      return { moved, open: op.open, hit, dp, back, pass: !dp.open && !dp.cls && dp.hid && dp.focus === null && dp.fc === 0 && back };
    };
    const init0 = await coords(pg);
    {
      const r = await ptrRound("正");
      selfcheck(r.moved && r.open, w + "：指针之途前提——拖后坐标已离初、点人抽屉已开");
      ok(r.pass, w + "：抽屉开时以" + (w <= 680 ? "触屏 tap" : "鼠标") + "实点 ⟲ 中心（其位最上者 " + r.hit + "）→ 一按：抽屉闭（drawer.open " + r.dp.open + "、hidden " + r.dp.hid + "）、点选解（focus " + r.dp.focus + "）、内嵌与克隆坐标复初 " + r.back);
      if (w === 375) await scr(pg, "u3b_ptr_reset_375", "page");
      await pg.evaluate(() => { PANO_SIM.HOLE = false; });
      const z2 = await ptrRound("反");
      anti(!z2.pass, w + " HOLE＝false（复旧层叠）→ 指针点 ⟲ 之位最上者 " + z2.hit + "；抽屉 " + (z2.dp.open ? "仍开" : "闭") + "、坐标复初 " + z2.back + "（「一按复初」之断红）");
      await pg.evaluate(() => { PANO_SIM.HOLE = true; if (drawer.open) closeDrawer(); });
      await pg.waitForTimeout(300);
      await pg.click(OV_RESET_SEL); await pg.waitForTimeout(200);
    }
    /* 反证 */
    await pg.evaluate(() => { PANO_SIM.RESET_DRAWER = false; });
    await pg.evaluate((id) => document.querySelector('#map-overlay-body .rel-node[data-node="' + id + '"]').dispatchEvent(new MouseEvent("click", { bubbles: true })), pick);
    await pg.waitForTimeout(350);
    const z = await kbReset(pg);
    anti(z.open || z.cls, w + " RESET_DRAWER＝false → 键盘触浮层 ⟲ 后抽屉仍开（drawer.open " + z.open + "；「抽屉闭」之断红）");
    if (w === 375) await scr(pg, "u3_overlay_drawer_anti_375", "page");
    await pg.evaluate(() => { PANO_SIM.RESET_DRAWER = true; if (drawer.open) closeDrawer(); });
    await pg.waitForTimeout(300);
    await pg.click("#btn-overlay-close"); await pg.waitForTimeout(300);
    await ctx.close();
  }
  /* 5 条上小注「；」分段不折（r62-U-丙 乙段） */
  H("§七 5 条上小注以「；」分段、段内不折（六宽，开关开与关）；反证 682 开关开去段之 nowrap");
  const noteM = (pg) => pg.evaluate(() => { const n = document.querySelector("#rel-canvas .pano-note");
    const segs = [...n.querySelectorAll(".hint-seg")].map(s => ({ t: s.textContent, n: [...s.getClientRects()].filter(x => x.width > 0).length }));
    const lh = parseFloat(getComputedStyle(n).lineHeight) || 14, r = n.getBoundingClientRect();
    return { t: n.textContent, segs, lines: Math.round(r.height / lh), w: +r.width.toFixed(0) }; });
  for (const w of [375, 682, 768, 900, 1024, 1440]) {
    const { ctx, pg } = await open(w);
    for (const swOn of [false, true]) {
      await setSwitch(pg, swOn);
      const m = await noteM(pg);
      const broken = m.segs.filter(x => x.n !== 1).map(x => x.t);
      ok(m.t === NOTE_A && m.segs.length === 2 && m.segs[0].t.endsWith("；") && broken.length === 0,
        w + (swOn ? "（开关开）" : "（开关关）") + "：小注 " + m.segs.length + " 段（" + m.segs.map(x => "「" + x.t + "」").join("") + "），段内折者 " + broken.length + "，占 " + m.lines + " 行，textContent 一字合 a");
      if (swOn && (w === 682 || w === 375)) await scr(pg, "u3_note_" + w, "#rel-canvas .pano-bar");
    }
    if (w === 682) {
      const t = await pg.addStyleTag({ content: "#rel-canvas .pano-note .hint-seg { white-space: normal !important; }" });
      await pg.waitForTimeout(100);
      const a = await noteM(pg);
      const b2 = a.segs.filter(x => x.n !== 1).map(x => x.t);
      anti(b2.length > 0, "682 开关开注入小注之段去 nowrap → 段内折者 " + b2.length + "（" + b2.join("、") + "；「段内不折」之断红）");
      await scr(pg, "u3_note_682_anti", "#rel-canvas .pano-bar");
      await t.evaluate(el => el.remove());
    }
    await ctx.close();
  }

  /* ===== §八 定步之弹性·冷却收束（r62-U-丙 乙段再续，裁二百六十五 一；前式 裁二百六十四 三之八向一扇，今扩样代之） ===== */
  H("§八 定步可复之弹性·冷却收束（panoSimSync：不经 rAF，虚拟之钟每帧 1000/60 ms）：扩样——只主角 53 人每人 × 八向 × 二距（60、140 屏 px）＝848 拖；" +
    "开关开、放大查看照 id 取四分之一；「显示全部」照 id 取 64 拖。断：冷却之限内止、收尾推尽最大位移 ≤0.5、止前 30 帧每帧最大位移 ≤0.5、止后名签无交；反证 κ 恒 1（COOL＝false）逐式俱红");
  /* 样（照 id 定样，不随机）：ids＝在图之人（只主角之式取一级，「显示全部」取全部）按 id 升序；L＝ids × 距 [60, 140] × 向 k·45°（k＝0…7）之序。
   *   只主角 内嵌（开关关）：全 L（53×2×8＝848）；开关开、放大查看：只取 ids 中序号 i % 4 ＝ 0 之人（14 人，224 拖）；
   *   「显示全部」（内嵌、开关关）：全 L 中取第 ⌊k·|L|／64⌋ 拖（k＝0…63）。每拖之前 panoResetAll 复初布局。
   * 每拖记：f＝放手后至止之帧，by＝止之由（cool 冷却之限／calm 提早止／limit 兜底），tail＝止前 30 帧（含止之帧，收尾推尽之前）每帧诸人最大位移，
   *   last＝放手后末一帧位移逾 0.5 者之帧序（备查），fin＝收尾推尽之最大位移、left＝其末遍所见相交之对数，
   *   ov＝止后诸名签矩形（力学器之状，HW／T／B）两两之交之最大者（min(交宽, 交高)），ovR＝同上而取所呈之坐标（两位小数）——备查。
   *   冷却之限 LIM＝⌈ln KAPPA_MIN／ln DECAY⌉ 帧（页内算）。 */
  const runSample = (pg, inClone, all, quarter, cfg, lim) => pg.evaluate(([inClone, all, quarter, cfg, lim]) => {
    const SAVE = { ...PANO_SIM }; Object.assign(PANO_SIM, cfg || {});
    const svg = document.querySelector("#rel-canvas svg"), m = (inClone ? document.querySelector("#map-overlay-body svg") : svg).getScreenCTM();
    const ids = all ? [...relView.nodes.keys()].sort() : [...relView.nodes.values()].filter(v => v.proto).map(v => v.p.id).sort();
    let L = [];
    for (const id of (quarter ? ids.filter((_, i) => i % 4 === 0) : ids)) for (const d of [60, 140]) for (let a = 0; a < 8; a++) L.push([id, d, a]);
    if (all) { const M = L.length; L = Array.from({ length: 64 }, (_, k) => L[Math.floor(k * M / 64)]); }
    if (lim) L = L.slice(0, lim);
    const ovOf = (K, X, Y) => { let ov = 0;
      for (let i = 0; i < K.n; i++) for (let j = i + 1; j < K.n; j++) {
        const ox = Math.min(X[i] + K.HW[i], X[j] + K.HW[j]) - Math.max(X[i] - K.HW[i], X[j] - K.HW[j]);
        if (ox <= 0) continue;
        const oy = Math.min(Y[i] + K.B[i], Y[j] + K.B[j]) - Math.max(Y[i] - K.T[i], Y[j] - K.T[j]);
        if (oy > 0) ov = Math.max(ov, Math.min(ox, oy));
      } return ov; };
    const out = L.map(([id, d, a]) => {
      panoResetAll(svg);
      const o = panoSimSync(id, d * Math.cos(a * Math.PI / 4) / m.a, d * Math.sin(a * Math.PI / 4) / m.d, 14, 600);
      const f = o.frames, tail = f ? o.disp.slice(Math.max(0, f - 30), f) : o.disp.slice(-30);
      const K = panoSim.K, nodes = panoSim.nodes;
      let last = 0; o.disp.forEach((x, k) => { if (x > 0.5) last = k + 1; });
      return { id, d, a, f, by: o.by, tail: Math.max(0, ...tail), last, fin: o.fin ? o.fin.d : NaN, left: o.fin ? o.fin.left : -1,
               ov: ovOf(K, K.X, K.Y), ovR: ovOf(K, nodes.map(v => v.x), nodes.map(v => v.y)) };
    });
    panoResetAll(svg); Object.assign(PANO_SIM, SAVE);
    return out;
  }, [inClone, all, quarter, cfg || null, lim || 0]);
  const LIMF = (pg) => pg.evaluate(() => ({ lim: Math.ceil(Math.log(PANO_SIM.KAPPA_MIN) / Math.log(PANO_SIM.DECAY)), tol: PANO_SIM.FIN_TOL, fmax: PANO_SIM.FIN_MAX }));
  /* 四断，逐拖判 */
  const P_STOP = (o, C) => o.f != null && o.by !== "limit" && o.f <= C.lim, P_FIN = (o) => o.fin <= 0.5, P_TAIL = (o) => o.tail <= 0.5,
        P_OV = (o, C) => o.left === 0 && o.ov <= C.tol, P_ALL = (o, C) => P_STOP(o, C) && P_FIN(o) && P_TAIL(o) && P_OV(o, C);
  const crit = (r, C) => ({ stop: r.filter(o => !P_STOP(o, C)).length, fin: r.filter(o => !P_FIN(o)).length,
                            tail: r.filter(o => !P_TAIL(o)).length, ov: r.filter(o => !P_OV(o, C)).length });
  const qs = (a) => { const b = a.slice().sort((x, y) => x - y), g = (p) => b[Math.min(b.length - 1, Math.floor(p * b.length))]; return [b[0], g(0.5), g(0.9), b[b.length - 1]]; };
  const fx = (a, k) => a.map(x => (x === 9999 ? "未止" : +(+x).toFixed(k))).join("／");
  const dist = (r) => {
    const by = {}; r.forEach(o => { const k = o.by || "未止"; by[k] = (by[k] || 0) + 1; });
    return "止帧（最小／中位／P90／最大）" + fx(qs(r.map(o => (o.f == null ? 9999 : o.f))), 0) + "，由 " + Object.entries(by).map(([k, v]) => k + " " + v).join("、") +
      "；收尾推尽位移 " + fx(qs(r.map(o => o.fin)), 3) + "；止前 30 帧最大位移 " + fx(qs(r.map(o => o.tail)), 3) +
      "；末逾 0.5 之帧序最大 " + Math.max(...r.map(o => o.last)) +
      "；止后名签之交（力学器）最大 " + Math.max(...r.map(o => o.ov)).toExponential(2) + "、（所呈两位小数）最大 " + Math.max(...r.map(o => o.ovR)).toFixed(4);
  };
  const badEx = (r) => r.slice(0, 5).map(o => nameOf(o.id) + " " + o.d + "px/" + (o.a * 45) + "°：" + (o.f == null ? "未止" : o.f + " 帧 " + o.by) +
    "，止前 " + o.tail.toFixed(3) + "（末逾 0.5 之帧 " + o.last + "），收尾 " + (+o.fin).toFixed(3) + "，交 " + o.ov.toExponential(1) + "／余 " + o.left).join("；");
  {
    const MODES = [
      { tag: "内嵌 只主角", inClone: false, sw: false, all: false, quarter: false },
      { tag: "内嵌 开关开", inClone: false, sw: true, all: false, quarter: true },
      { tag: "放大查看 只主角", inClone: true, sw: false, all: false, quarter: true },
      { tag: "放大查看 开关开", inClone: true, sw: true, all: false, quarter: true },
      { tag: "内嵌 显示全部", inClone: false, sw: false, all: true, quarter: false },
    ];
    for (const w of [1440, 375]) {
      const { ctx, pg } = await open(w);
      const C = await LIMF(pg);
      console.log("    〔前提〕" + w + " 冷却之限 LIM＝⌈ln KAPPA_MIN／ln DECAY⌉＝" + C.lim + " 帧；收尾推尽容差 " + C.tol + "、至多 " + C.fmax + " 遍");
      for (const M of MODES) {
        if (M.all) await setAll(pg, true);
        if (M.inClone) { await pg.click("#btn-rel-zoom"); await pg.waitForTimeout(500); }
        await setSwitch(pg, M.sw);
        const tag = w + " " + M.tag;
        const init = await coords(pg);
        const t0 = Date.now();
        const r = await runSample(pg, M.inClone, M.all, M.quarter, null);
        const secs = ((Date.now() - t0) / 1000).toFixed(1);
        if (!M.inClone && !M.sw && !M.all) {
          const r2 = await runSample(pg, M.inClone, M.all, M.quarter, null, 32);
          selfcheck(JSON.stringify(r.slice(0, 32)) === JSON.stringify(r2), tag + "：首 32 拖再跑，逐数同（定步可复）");
        }
        const c = crit(r, C);
        console.log("    〔分布〕" + tag + "（" + r.length + " 拖，" + secs + " s）：" + dist(r));
        ok(c.stop === 0, tag + "：" + r.length + " 拖俱于冷却之限（" + C.lim + " 帧）内止（非兜底）", c.stop ? "未过 " + c.stop + "：" + badEx(r.filter(o => !P_STOP(o, C))) : "");
        ok(c.fin === 0, tag + "：收尾推尽之最大位移俱 ≤ 0.5", c.fin ? "未过 " + c.fin + "：" + badEx(r.filter(o => !P_FIN(o))) : "");
        ok(c.tail === 0, tag + "：止前 30 帧每帧最大位移俱 ≤ 0.5", c.tail ? "未过 " + c.tail + "：" + badEx(r.filter(o => !P_TAIL(o))) : "");
        ok(c.ov === 0, tag + "：止后名签俱无交（容差 " + C.tol + "）", c.ov ? "未过 " + c.ov + "：" + badEx(r.filter(o => !P_OV(o, C))) : "");
        /* 反证：去冷却（κ 恒 1）——本式自红（四断有一红即是），不以诸式合计论 */
        const z = await runSample(pg, M.inClone, M.all, M.quarter, { COOL: false });
        const cz = crit(z, C), nz = z.filter(o => !P_ALL(o, C)).length;
        anti(nz > 0, tag + " COOL＝false（κ 恒 1）→ " + z.length + " 拖未过 " + nz + "（冷却之限内止 " + cz.stop + "、收尾 " + cz.fin + "、止前 " + cz.tail + "、无交 " + cz.ov + "）");
        console.log("      〔反证之分布〕" + dist(z));
        selfcheck((await coords(pg)) === init, tag + "：样毕复初布局");
        if (M.inClone) { await pg.click("#btn-overlay-close"); await pg.waitForTimeout(250); }
        if (M.all) await setAll(pg, false);
      }
      await ctx.close();
    }
  }
  await browser.close(); s.close(); sb.close();
  console.log("\n页面抛错：" + errs.length + (errs.length ? "  " + errs.slice(0, 3).join(" | ") : ""));
  if (errs.length) gateErrs++;
  console.log("\n结：断言 " + asserts + "，未过 " + fails + "；门自身出错 " + gateErrs);
  process.exit(gateErrs ? 2 : (fails ? 1 : 0));
})().catch(e => { console.error("门自身出错：", e); process.exit(2); });
