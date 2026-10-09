/* 经纬春秋 · r54-1／r54-4 走查门：首访之径——编年之显、导览之记与其形、首页之言
 * （任务书 `team/round54_prompts.md` §一、Task for Vision · r54-1、领队之一〇／一／四；
 *   r54-4 部分：§三 裁七十一至七十四、Task for Vision · r54-4、领队之四〇／一／三）
 *
 * ★★ 【r60-I 外科切除，2026-10-09】原 §八（考据索引之读者页）及其量函数已随该屏并其路由切除；
 *   §三／§七之三 中三处「句三之考据链」之断言再反转为「无此链」。切处各留其痕。以下为 r54-7 并入时之原注，照留：
 * ★★ 【r54-7 并入，2026-09-29】本门今**一本三轮**：新增 §八（考据索引之读者页，`#/kaodui`）。
 *   并于 §三 **二次反转三条断言**（句三之链、引言之链数、`KAODUI_ENTRY` 之值）——
 *   **其原条之文与其立意俱照录于该处之注，不默然改**（照 r54-4b 之例）。
 *   ★ §八 之按类反证**不取旧版取注入之变体**，其由写在 §八 之首注：`OLD_REF` 根本无此页，
 *     其红恒真而不指向任何一条断言之能——**「测出红」与「测出它该测的那个红」是两件事**。
 *
 * ★ 本门一本两轮：§一–§六 系 r54-1 之门（其中 §六 为「供裁之量」，非断言），
 *   §七 系 r54-4 之门——r54-1 只量不落者（编年之径、导览之形），r54-4 照裁落之，
 *   故 §七 量的是**站上真形**（一字不注入），而 §六 之模拟照留不删：
 *   **裁之所据与落之所成，要能在同一本里对读。**
 *   r54-4 于 §三 改了一条断言（原「引言内链数=0」→ 今分问「句三内 0」与「引言全块恰 1」），
 *   其由就地写在该条之注——原条若照留，甲之落会把它撞红，而红之处并非病所在。
 *
 * ★ **r54-4b（站长 2026-09-26 裁「丁可落」）于本门改二处，二处俱留其痕，不默然改**：
 *   ① §七之四【丁·〇】之**期望值反转**——r54-4 时断「钮仍无数」（其立正为使「未落」可复验），
 *      今断「钮带数且其数＝独立复算」；原条之文与其立意照录于该处之注。
 *   ② `measureNav` 之二态由「现状／**注入**丁」改为「带数／**去其数**」——丁既落，再注入即是
 *      在丁之上再注一个丁；**基准由模拟改为现量之真态**（清 `#nav-chron-count` 之文即复原无数之钮）。
 *
 * 本门要回答六个问题，一个都不许用「我改完看着对」来答：
 *   ① **本件之前提**——编年页之筛选条与其自述之数，须与任务书〇节所期逐项相符（13 目／17 类／265／24）；
 *      ★ 且其数须是**跑时自算**：本门另从 `site/data/*.json` 独立复算一遍（不读页面之文），两路须相等；
 *      并以源码实读断 `index.html`／新增之 `renderHomeLede` 内**未写死**这几个数。
 *   ② **导览之记已治**——七种离场之式（跳过／Esc／走完／中途重载／径自不理／旧值 "1"／存储不可用）
 *      逐式量其键值与「下次是否复弹」。★ 其判据不是「键非 null」，而是**下次不复覆于地图之上**。
 *   ③ **首页之言已立**——三句俱在、句二四数与 `meta.tables` 逐个相等、句三**今日无链**（其页未立）；
 *      并断 `KAODUI_ENTRY` 之位确在源码之内（「留其位」之机械证据，非口说）。
 *   ④ **按类反证逐条对位**（r52 裁二十四）——②③ 之每一条新断言，各配一个**同法施于旧版**之量，
 *      须当场红；**不得以整批见红充每条能量**。★ 其中有几条新旧同绿（如旧值 "1" 之兼容），
 *      本门**照实标为「非本轮之新能」，不冒充反证**——测不出红而硬说测出红，是量具作假。
 *   ⑤ **零影响**——未涉之页（编年／资料库／关于／关系全景／人物时间线·地图）其 DOM 与旧版**逐位全等**。
 *   ⑥ **二案之量**（供裁，非断言）——「编年之径」四案、「导览之形」三案，逐案实测其量；
 *      任务书一节 3、二节 2 明命「停下上报、不自行落定」，故本节**只量不改站**，其改一行也不落。
 *
 * ★ 旧版源端锚定固定哈希 `OLD_REF`（见下），**不取 `HEAD`**（照 r51 裁二十六、r52、r53 之例）：
 *   本件合入后 `HEAD` 即含本轮之改，「旧版」会等于新版，§四之反证必转绿而 §五必绿——两头都错，且是静默的错。
 *   故钉死哈希，并于起手处打印「旧版 app.js 内 renderHomeLede 出现 0 次／旧版 index.html 内无 home-lede」
 *   之**正面证据**；锚定若失效，当场抛错停门，不许带病往下跑。
 *
 * ★ 本门**不动仓库任何文件**：旧版取自 `git show <OLD_REF>:site/...`（只读），不切分支、不 stash、不写 git index。
 * ★ 本门**不碰 `tools/qa/` 之他本**。
 *
 * 用法：node tools/qa/vision_r54.js
 */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..", "..");
const SITE = path.join(ROOT, "site");

let fails = 0, checks = 0;
function ok(cond, label, detail) {
  checks++; if (!cond) fails++;
  console.log("  " + (cond ? "✓" : "✗") + " " + label + (detail ? "  —— " + detail : ""));
}
function head(s) { console.log("\n" + s); }

/* ---------- 双源端静态服务器（同 r51／r52／r53 之式） ---------- */
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
function srv(root, override) {
  return new Promise((res, rej) => {
    const s = http.createServer((rq, rs) => {
      let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]);
      if (u === "/") u = "/index.html";
      const ct = MIME[path.extname(u).toLowerCase()] || "application/octet-stream";
      if (override && Object.prototype.hasOwnProperty.call(override, u)) {
        rs.writeHead(200, { "Content-Type": ct }); rs.end(override[u]); return;
      }
      const fp = path.join(root, u);
      if (!fp.startsWith(root)) { rs.writeHead(403); rs.end(); return; }
      fs.readFile(fp, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": ct }); rs.end(d); });
    });
    s.on("error", rej); s.listen(0, "127.0.0.1", () => res(s));
  });
}
/* 旧版源端之锚：`9c646f8` 系 r53 收官之 `main`（2026-09-26 实读 `git log --oneline -1` 与
 * `git status --porcelain` 恰一项未跟踪之 `data/incoming/r53_kongzi_role/`），即**本件改动之前一版**。
 * 【不得改回 HEAD】理由见门头。 */
const OLD_REF = "9c646f8";
const gitShow = (p) => execFileSync("git", ["show", OLD_REF + ":" + p], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });

const TOUR_KEY = "chunqiu_tour_v1";
const W_WIDE = 1440, H_WIDE = 900, W_NARROW = 375, H_NARROW = 780;

/* ---------- 独立复算：不读页面之文，直接自 site/data/*.json 算出「265／24」 ----------
 * 这一路是 ① 之骨：若只读页面自述之数再与任务书对，量的是「页面说了什么」，
 * 不是「数是否自数据来」。两路相等才算数。 */
function recomputeFromData() {
  const J = (n) => JSON.parse(fs.readFileSync(path.join(SITE, "data", n + ".json"), "utf8"));
  const events = J("events"), links = J("event_people"), people = J("people"), meta = J("meta");
  const proto = new Set(people.filter(p => Number(p.is_protagonist) === 1).map(p => p.id));
  const linked = new Set(links.filter(l => proto.has(l.person_id)).map(l => l.event_id));
  const orphan = events.filter(e => !linked.has(e.id)).length;
  return { total: events.length, orphan, meta };
}

async function pageOf(br, base, opts) {
  const o = opts || {};
  const ctx = await br.newContext({ viewport: { width: o.w || W_WIDE, height: o.h || H_WIDE } });
  if (o.blockStorage) {
    await ctx.addInitScript(() => {
      Object.defineProperty(window, "localStorage", { get() { throw new Error("storage blocked"); } });
    });
  }
  /* ★ clearOnInit：**每次导航之页脚本跑前**清掉导览之记。
   * 不可改用「先 goto 再 removeItem」——那一 goto 本身已让导览起手并落记（本轮之治所使然），
   * 之后再删键、再 goto，键之有无遂系于两步之先后，量出来的「导览在显」会随机为假。
   * 此坑系本门实测撞上（§六之二首跑「导览在显=false」四条），记此免后人再踩。 */
  if (o.clearOnInit) {
    await ctx.addInitScript(() => { try { localStorage.removeItem("chunqiu_tour_v1"); } catch {} });
  }
  const pg = await ctx.newPage();
  /* ★ 「零 pageerror」之谓词（本门之基准，照 r53 裁六十六「自验之数须书明其基准」）：
   *   errs 只收 **pageerror**（页内未捕获之抛错），另收一路 console error 于 cerrs 并**剔去
   *   Cloudflare Analytics beacon 之 CORS 噪音**——该 beacon 系 conventions 红线六之特批例外，
   *   自 127.0.0.1 源必被 CORS 挡下，与本轮之改毫无关系；若把它算进「零 pageerror」，
   *   则本门自立之日即恒红，正是 r52「间歇红之门终将被当成噪音关掉」之训。
   *   ★ 剔除之式写死为「其 URL 含 cloudflareinsights」一条，不做泛化白名单——别的噪音照旧报。 */
  const errs = [], cerrs = [];
  pg.on("pageerror", e => errs.push(String(e)));
  pg.on("console", m => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (/cloudflareinsights|cdn-cgi\/rum/.test(t)) return;
    if (/Failed to load resource/.test(t) && /cloudflareinsights|cdn-cgi\/rum/.test(String(m.location && m.location().url || ""))) return;
    cerrs.push("console:" + t);
  });
  if (o.seed !== undefined) {   // 先落地同源，才写得进 localStorage
    await pg.goto(base, { waitUntil: "domcontentloaded" });
    await pg.evaluate((v) => { try { if (v === null) localStorage.removeItem("chunqiu_tour_v1"); else localStorage.setItem("chunqiu_tour_v1", v); } catch {} }, o.seed);
  }
  await pg.goto(base + (o.hash || ""), { waitUntil: "networkidle" });
  await pg.waitForTimeout(o.settle == null ? 700 : o.settle);
  return { ctx, pg, errs, cerrs };
}

/* ---------- ② 之量法：一式离场，量其键与「下次是否复弹」 ----------
 * ★ 同一个函数施于新旧两版（§二用新版源端、§四用旧版源端），量法一字不变——
 *   量具两版共用，才谈得上「对位反证」。 */
async function measureTour(br, base, how) {
  const seed = how === "legacy-1" ? "1" : how === "garbage" ? "{oops" : undefined;
  const { ctx, pg, errs, cerrs } = await pageOf(br, base, { seed, blockStorage: how === "blocked" });
  const shown0 = await pg.evaluate(() => !document.getElementById("tour").hidden);
  if (how === "skip") await pg.click("#tour-skip").catch(() => {});
  if (how === "esc") await pg.keyboard.press("Escape");
  if (how === "finish") { for (let i = 0; i < 3; i++) { await pg.click("#tour-next").catch(() => {}); await pg.waitForTimeout(700); } }
  // "abandon"／"legacy-1"／"garbage"／"blocked"：什么也不做
  await pg.waitForTimeout(400);
  const key = await pg.evaluate(() => { try { return localStorage.getItem("chunqiu_tour_v1"); } catch { return "<throws>"; } });
  await pg.reload({ waitUntil: "networkidle" });
  await pg.waitForTimeout(800);
  const reshown = await pg.evaluate(() => !document.getElementById("tour").hidden);
  const entry = await pg.evaluate(() => {
    const b = document.getElementById("home-tour-entry");
    if (!b) return null;
    return { text: b.textContent.trim(), resume: b.dataset.resume, visible: b.offsetWidth > 0 && b.offsetHeight > 0 };
  });
  await ctx.close();
  return { shown0, key, reshown, entry, errs, cerrs };
}

/* ---------- ③ 之量法：首页引言 ----------
 * ★ r54-4 扩：并量第四句（编年之径一链，裁七十一取甲）之链、其文所报之二数、其盒与其径；
 *   并把「句三之无链」与「引言之链数」分开量——r54-1 时引言内一个链也没有，
 *   r54-4 之后**恰有一个**（甲之链），而句三（#home-lede-why）仍须**一个也没有**。
 *   若仍只量「引言内链数＝0」，甲之落即会把这条断言撞红，而撞红之处并非病所在。 */
async function measureLede(br, base, w, h) {
  const { ctx, pg, errs, cerrs } = await pageOf(br, base, { seed: "1", w, h });
  const r = await pg.evaluate(() => {
    /* ★ 主导航之三读（丁之量）**先于「引言在否」之早退**——r54-4b 首跑撞此一坑，记之：
     *   原式把 nav 之读放在 `if (!L) return` 之后，故旧源端（无引言）根本**没量到 nav**，
     *   其值为 `undefined` 而非量出来的 `null`；而 §七之五 之反证以 `=== null` 为红之据，遂误报两红。
     *   ★ 其病不在那两条之谓词，在**量具没量到**：`undefined` 与「量了，是空的」是两件事，
     *     以前者充后者即是拿「没量」当「量出无」——与 design_notes §7.9 同族。故改在此处，不改其谓词。 */
    const navChron0 = [...document.querySelectorAll(".main-nav button")].find(b => b.dataset.view === "chronicle");
    const nav = {
      navChronText: navChron0 ? navChron0.textContent.trim() : null,
      navChronAria: navChron0 ? navChron0.getAttribute("aria-label") : null,
      navNum: (() => { const s = document.getElementById("nav-chron-count"); return s ? s.textContent.trim() : null; })(),
      navBtnFound: !!navChron0,
    };
    const L = document.getElementById("home-lede");
    if (!L) return { exists: false, ...nav };
    const rect = L.getBoundingClientRect();
    const map = document.getElementById("home-map");
    const mr = map ? map.getBoundingClientRect() : null;
    const ps = [...L.querySelectorAll("p")].map(p => p.textContent.trim());
    const why = document.getElementById("home-lede-why");
    const a = L.querySelector(".hl-chron");
    const ab = a ? a.getBoundingClientRect() : null;
    const mt = a ? (a.textContent.match(/全库\s*(\d+)\s*条/) || [])[1] : null;
    const mo = a ? (a.textContent.match(/其中\s*(\d+)\s*条只此一处可见/) || [])[1] : null;
    return {
      exists: true, ps, ...nav,
      nLinks: L.querySelectorAll("a").length,
      whyText: why ? why.textContent.trim() : null,
      whyLinks: why ? why.querySelectorAll("a").length : null,
      deadHref: document.querySelectorAll('a[href*="kaodui"]').length,
      /* 〔r60-I 切除〕原此处有 r54-7 增之 `kaodui` 量项（句三之考据链），该链已去。 */
      chron: a ? {
        href: a.getAttribute("href"), text: a.textContent.trim(),
        total: mt == null ? null : Number(mt), orphan: mo == null ? null : Number(mo),
        box: { x: Math.round(ab.x), y: Math.round(ab.y), w: Math.round(ab.width), h: Math.round(ab.height) },
        inFold: ab.top >= 0 && ab.bottom <= innerHeight,
        scrollNeeded: Math.max(0, Math.round(ab.bottom - innerHeight)),
      } : null,
      box: { y: Math.round(rect.y), h: Math.round(rect.height) },
      inFold: rect.top < innerHeight && rect.bottom > 0,
      mapTop: mr ? Math.round(mr.top) : null,
      mapFullyInFold: mr ? (mr.bottom <= innerHeight && mr.top >= 0) : null,
      docOverflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      vh: innerHeight,
    };
  });
  await ctx.close();
  return { ...r, errs, cerrs };
}

/* ---------- r54-4 之量法（一）：甲之链**点得进去**（不只是「在」） ---------- */
async function measureChronHop(br, base, w, h) {
  const { ctx, pg, errs, cerrs } = await pageOf(br, base, { seed: "1", w, h });
  await pg.click(".hl-chron");
  await pg.waitForTimeout(900);
  const r = await pg.evaluate(() => ({
    hash: location.hash,
    shown: !document.getElementById("view-chronicle").hidden,
    rows: Number(document.getElementById("chron-list").dataset.rows),
    intro: document.getElementById("chron-intro").textContent,
  }));
  await ctx.close();
  return { ...r, errs, cerrs };
}

/* ---------- r54-4 之量法（二）：导览之形已落——走真导览，不注入一字 CSS ----------
 * ★ 与 §六之二（供裁之量）之别在此：那里以行内样式**模拟**三案，此处量的是**站上真形**。
 *   故此函数不写 pop 之任何样式，并**顺手断其 style 属性为空**——若日后有人把位又写回 JS，此条即红。 */
async function measureTourReal(br, base, w, h) {
  const { ctx, pg, errs, cerrs } = await pageOf(br, base, { clearOnInit: true, w, h, settle: 1200 });
  const steps = [];
  const READ = () => {
    const rect = (el) => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
    const inter = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
                            Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    const pop = document.getElementById("tour-pop"), hole = document.getElementById("tour-hole");
    const P = rect(pop), H = rect(hole);
    const mapEl = document.querySelector("#home-map svg");
    const M = mapEl ? rect(mapEl) : null;
    return {
      step: document.getElementById("tour-step").textContent.trim(),
      shown: !document.getElementById("tour").hidden,
      pop: { x: Math.round(P.x), y: Math.round(P.y), w: Math.round(P.w), h: Math.round(P.h) },
      hole: { x: Math.round(H.x), y: Math.round(H.y), w: Math.round(H.w), h: Math.round(H.h) },
      holePct: H.w * H.h ? Math.round(1000 * inter(H, P) / (H.w * H.h)) / 10 : null,
      mapArea: M ? Math.round(M.w * M.h) : null,
      mapOvl: M ? Math.round(inter(M, P)) : null,
      mapPct: M && M.w * M.h ? Math.round(1000 * inter(M, P) / (M.w * M.h)) / 10 : null,
      popInView: P.y >= 0 && P.y + P.h <= innerHeight && P.x >= 0 && P.x + P.w <= innerWidth,
      inlineStyle: pop.getAttribute("style") || "",
      focusId: document.activeElement ? document.activeElement.id : null,
      vw: innerWidth, vh: innerHeight,
    };
  };
  for (let i = 0; i < 3; i++) {
    steps.push(await pg.evaluate(new Function("return (" + READ.toString() + ")()")));
    if (i < 2) { await pg.click("#tour-next").catch(() => {}); await pg.waitForTimeout(950); }
  }
  await ctx.close();
  return { steps, errs, cerrs };
}

/* ---------- r54-4 之量法（三·补）：Δ地图顶之三个基准，俱现量，不抄旧文 ----------
 * 「Δ」无基准即是空话（r53 裁六十六）。本门量三态之地图顶：
 *   ① 旧版（`OLD_REF`，无引言）——自旧源端量；
 *   ② 本件之前（引言三句）——自**新**源端量，惟量前把第四句之 <p> 摘掉（其余一字不动）；
 *   ③ 今（引言四句）——自新源端直量。
 * ★ ② 之所以能现量，是因为第四句独占一个 <p>：摘之即复原「三句之引言」之版式。 */
async function measureMapTop(br, base, w, h, dropChron) {
  const { ctx, pg, errs, cerrs } = await pageOf(br, base, { seed: "1", w, h });
  const r = await pg.evaluate((drop) => {
    if (drop) { const p = document.getElementById("home-lede-chron"); if (p) p.remove(); }
    const m = document.getElementById("home-map").getBoundingClientRect();
    const L = document.getElementById("home-lede");
    return {
      mapTop: Math.round(m.top),
      mapFullyInFold: m.bottom <= innerHeight && m.top >= 0,
      ledeH: L ? Math.round(L.getBoundingClientRect().height) : null,
      nP: L ? L.querySelectorAll("p").length : 0,
    };
  }, dropChron);
  await ctx.close();
  return { ...r, errs, cerrs };
}

/* ---------- r54-4 之量法（三）：主导航之行——丁之代价（裁七十一之末） ----------
 * ★ flex 行数**不能只比 top**：诸项高不同而 align-items:center，同一行内 top 各异
 *   （实测 375px 下一行三项 top 为 128／131／132）。故以「纵向区间是否与前行相交」归行。
 * ★ **本函数于 r54-4b 换了其二态，其改之痕记此**（站长 2026-09-26 裁「丁可落」）：
 *   - **r54-4 时丁未落**，二态为「站上现状」与「**注入**丁」——注入只为量其代价，`site/` 一字未动；
 *   - **r54-4b 丁已落**，二态改为「站上现状（带数）」与「**去其数**」——**基准由注入之模拟改为现量之真态**
 *     （清空 `#nav-chron-count` 之文即复原「无数之钮」，与摘第四句之 `<p>` 同法）。
 *   ★ 换之由：丁既落，再「注入丁」即是**在丁之上再注一个丁**——**标签与所量之物不符即是假账**
 *     （与 r54-4 §六之基准漂移同族，见 design_notes §7.9）。 */
async function measureNav(br, base, w, h) {
  const { ctx, pg, errs, cerrs } = await pageOf(br, base, { seed: "1", w, h });
  const NAVM = () => {
    const nav = document.querySelector(".main-nav");
    const items = [...nav.children];
    const nb = nav.getBoundingClientRect();
    const boxes = items.map(e => { const r = e.getBoundingClientRect(); return { t: r.top, b: r.bottom }; }).sort((a, b) => a.t - b.t);
    let lines = 0, cur = -1;
    for (const bx of boxes) { if (bx.t >= cur) { lines++; cur = bx.b; } else { cur = Math.max(cur, bx.b); } }
    const btn = items.find(e => e.dataset && e.dataset.view === "chronicle");
    const bb = btn.getBoundingClientRect();
    const cs = getComputedStyle(btn);
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
    const innerH = bb.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - parseFloat(cs.borderTopWidth) * 2;
    return {
      navH: Math.round(nb.height), lines,
      navOverflowX: nav.scrollWidth > nav.clientWidth,
      docOverflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      docScrollW: document.documentElement.scrollWidth, docClientW: document.documentElement.clientWidth,
      chron: { x: Math.round(bb.x), y: Math.round(bb.y), w: Math.round(bb.width), h: Math.round(bb.height) },
      chronText: btn.textContent.trim(),
      chronTextLines: Math.round(innerH / lh * 10) / 10,
      headerH: Math.round(document.querySelector(".site-header").getBoundingClientRect().height),
      mapTop: Math.round(document.getElementById("home-map").getBoundingClientRect().top),
    };
  };
  /* ① 站上真态（丁已落，钮带数） */
  const ding = await pg.evaluate(new Function("return (" + NAVM.toString() + ")()"));
  /* ② 去其数之态（基准）——只清 `#nav-chron-count` 之文，其余一字不动。
   *    若此元素不在（旧源端即如此），则二态本是同一态，其差自然为 0，下之断言以 `hasNum` 分判。 */
  const hasNum = await pg.evaluate(() => {
    const sp = document.getElementById("nav-chron-count");
    if (!sp) return false;
    sp.textContent = "";
    return true;
  });
  const bare = await pg.evaluate(new Function("return (" + NAVM.toString() + ")()"));
  await ctx.close();
  return { ding, bare, hasNum, errs, cerrs };
}

/* ---------- ⑥ 之量法：一案之注入 → 量其位、其径、其所推之地图顶 ----------
 * ★ 只在无头页内注入，**不改 site/ 任何一字**（任务书一节 3「停下上报、不自行落定」）。 */
async function measureEntryCase(br, base, w, h, caseId, nums) {
  const { ctx, pg, errs, cerrs } = await pageOf(br, base, { seed: "1", w, h });
  const r = await pg.evaluate(({ cid, n }) => {
    /* ★ r54-4 之后必先摘去站上已落之第四句（甲），否则所量者是「甲之上再加一案」——
     *   四案之「现状」本指**无甲之态**，不摘即把甲之代价算进每一案，而 base 之 Δ 亦不再为 0。
     *   摘之即复原 r54-1 裁前之版式（第四句独占一个 <p>，见 index.html 之注）。 */
    const dropped = document.getElementById("home-lede-chron");
    if (dropped) dropped.remove();
    const mk = (txt) => { const b = document.createElement("button"); b.type = "button"; b.id = "probe-entry"; b.textContent = txt; return b; };
    const lede = document.getElementById("home-lede");
    const label = "编年 · 全库 " + n.total + " 条按年铺开，其中 " + n.orphan + " 条只此一处可见 →";
    const hero = document.getElementById("home-hero");
    let el = null;
    if (cid === "base") { el = [...document.querySelectorAll(".main-nav button")].find(b => b.dataset.view === "chronicle"); }
    if (cid === "jia") {                       // 甲·引言第四行之一链
      el = mk(label); el.className = "hl-chron"; const p = document.createElement("p");
      p.className = "hl-why"; p.appendChild(el); lede.appendChild(p);
    }
    if (cid === "yi") {                        // 乙·引言与地图之间一张入口卡
      const card = document.createElement("div");
      card.style.cssText = "border:1px solid #DCD2BC;border-left:3px solid #B4652F;border-radius:3px;background:#FBF7EC;padding:0.7rem 0.9rem;margin:0 0 1.1rem;";
      const t = document.createElement("p"); t.style.cssText = "margin:0 0 0.35rem;font-size:1.02rem;";
      t.textContent = "编年 · 大事年表";
      const d = document.createElement("p"); d.style.cssText = "margin:0 0 0.5rem;font-size:0.85rem;color:#7A7166;";
      d.textContent = "全库 " + n.total + " 条事件按年铺开，按国与按类可筛；其中 " + n.orphan + " 条未系于任何主角，只此一处可见。";
      el = mk("入编年 →"); card.appendChild(t); card.appendChild(d); card.appendChild(el);
      hero.parentNode.insertBefore(card, hero);
    }
    if (cid === "bing") {                      // 丙·首页 .home-extra 之一钮（同现有诸入口之式）
      el = mk(label); el.className = "library-entry";
      const ex = document.querySelector(".home-extra"); ex.insertBefore(el, ex.firstChild);
    }
    if (cid === "ding") {                       // 丁·主导航「编年」钮带数（零新增高度）
      el = [...document.querySelectorAll(".main-nav button")].find(b => b.dataset.view === "chronicle");
      el.textContent = "编年 " + n.total;
    }
    const b = el.getBoundingClientRect();
    const map = document.getElementById("home-map").getBoundingClientRect();
    return {
      entryBox: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) },
      inFold: b.top >= 0 && b.bottom <= innerHeight,
      scrollNeeded: Math.max(0, Math.round(b.bottom - innerHeight)),
      mapTop: Math.round(map.top),
      mapFullyInFold: map.bottom <= innerHeight && map.top >= 0,
      text: (el.textContent || "").trim(),
      vh: innerHeight,
    };
  }, { cid: caseId, n: nums });
  await ctx.close();
  return { ...r, errs, cerrs };
}

/* ---------- ⑥ 之量法：导览之形——浮卡遮地图之比 ---------- */
async function measureTourShape(br, base, w, h, shape) {
  const { ctx, pg, errs, cerrs } = await pageOf(br, base, { clearOnInit: true, w, h, settle: 1100 });
  const r = await pg.evaluate((sh) => {
    const pop = document.getElementById("tour-pop");
    if (sh === "xia") {          // 甲·下置贴边条：全宽、贴视口底
      pop.style.cssText += ";left:0 !important;right:0 !important;top:auto !important;bottom:0 !important;width:auto !important;max-width:none;border-radius:0;";
    }
    if (sh === "ce") {           // 乙·侧置：贴视口右缘、垂直居中（窄屏退为下置）
      if (innerWidth > 680) pop.style.cssText += ";left:auto !important;right:8px !important;top:50% !important;transform:translateY(-50%) !important;";
      else pop.style.cssText += ";left:0 !important;right:0 !important;top:auto !important;bottom:0 !important;width:auto !important;";
    }
    if (sh === "bi") {           // 丙·避让：择地图盒之外最空一侧落卡（此处以「地图盒下缘之下」为例）
      const m = document.getElementById("home-map").getBoundingClientRect();
      const ph = pop.offsetHeight;
      const below = innerHeight - m.bottom, above = m.top;
      const top = below >= ph + 12 ? m.bottom + 8 : (above >= ph + 12 ? Math.max(4, m.top - ph - 8) : innerHeight - ph - 4);
      pop.style.cssText += ";top:" + Math.round(top) + "px !important;left:8px !important;right:auto !important;transform:none !important;";
    }
    const rect = (el) => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
    const inter = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
                            Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    const mapEl = document.querySelector("#home-map svg") || document.getElementById("home-map");
    const M = rect(mapEl), P = rect(pop);
    const popVisible = P.w > 0 && P.h > 0 && P.y < innerHeight && P.y + P.h > 0 && P.x < innerWidth && P.x + P.w > 0;
    return { mapArea: M.w * M.h, ovl: inter(M, P), pct: M.w * M.h ? 100 * inter(M, P) / (M.w * M.h) : null,
             popBox: { x: Math.round(P.x), y: Math.round(P.y), w: Math.round(P.w), h: Math.round(P.h) }, popVisible,
             tourShown: !document.getElementById("tour").hidden };
  }, shape);
  await ctx.close();
  return { ...r, errs, cerrs };
}

/* ---------- ⑤ 之量法：一页之 DOM 快照 ----------
 * ★ 两处归一，各有实测之由，**不是为了跑绿而抹掉差异**：
 *   ① `data-render-ms` 是逐次计时（编年自记其渲染毫秒），两跑必不同，与本轮之改无关。
 *   ② 关系全景之**徽记顶层**（`drawPanoGraph` 末所附之最后一个 `<g>`，见 app.js `badgeTop`）：
 *      其子元素由 `fetchSVG(...).then()` **异步竞速追加**，故其**次序在同一版内即不可复现**。
 *      ★ 此系本门自行实测所得，非假定：另起一探针，**同一（新）版连跑六次**取 `#view-relations`
 *        之 outerHTML，跑 2–6 与跑 1 **全不相等**，首异处正在该层之 `<image>`／徽记根元素之 x／y；
 *        把该层子元素按 outerHTML 排序之后，同六跑**逐位全等**。
 *      故本门只把该层之**次序**归一（排序后以一属性记其多重集），其内容一字不改——
 *      次序若真有差，排序后之多重集必不等，仍会见红。
 *      ★ 附带发现（登记、本件不治，越界）：该层之叠序因此在生产上亦随每次绘制而变，
 *        徽记相叠处之上下关系不稳定。见 docs/delivery_vision_r54.md §顺带所见。 */
const SNAP = `(sel) => {
  const el = document.querySelector(sel);
  if (!el) return "<MISSING " + sel + ">";
  const c = el.cloneNode(true);
  c.querySelectorAll("[data-render-ms]").forEach(n => n.removeAttribute("data-render-ms"));
  const svg = c.querySelector("svg");
  if (svg) {
    const gs = [...svg.children].filter(n => n.tagName === "g");
    const top = gs[gs.length - 1];
    if (top && top.children.length) {
      const kids = [...top.children].map(n => n.outerHTML).sort();
      top.textContent = "";
      top.setAttribute("data-badgelayer-sorted", kids.join(""));
    }
  }
  return c.outerHTML;
}`;
async function snapshot(br, base, hash, sel, w, h) {
  const { ctx, pg, errs, cerrs } = await pageOf(br, base, { seed: "1", hash, w, h, settle: 900 });
  const s = await pg.evaluate(new Function("return " + SNAP)(), sel);
  await ctx.close();
  return { s, errs, cerrs };
}

/* 〔r60-I 外科切除留痕〕此处原有 r54-7 之三量法（`measureKaodui`／`measureKaoduiFilter`）与 `KD_CLICKS`／`kdClick`，
 * 俱量 `#/kaodui` 一屏；该屏并其路由已去，其量法随之切除。 */

(async () => {
  const { chromium } = require(path.join(__dirname, "node_modules", "playwright"));

  /* ===== 锚定之正面证据（不合则当场停门） ===== */
  head("§〇 旧版源端之锚（OLD_REF = " + OLD_REF + "）");
  const oldApp = gitShow("site/app.js").toString("utf8");
  const oldHtml = gitShow("site/index.html").toString("utf8");
  const oldCss = gitShow("site/styles.css").toString("utf8");
  const newApp = fs.readFileSync(path.join(SITE, "app.js"), "utf8");
  const newHtml = fs.readFileSync(path.join(SITE, "index.html"), "utf8");
  const cnt = (s, t) => s.split(t).length - 1;
  const anchor = [
    ["旧版 app.js 内 renderHomeLede 出现 0 次", cnt(oldApp, "renderHomeLede") === 0, String(cnt(oldApp, "renderHomeLede"))],
    ["旧版 app.js 内 tourRead 出现 0 次", cnt(oldApp, "tourRead") === 0, String(cnt(oldApp, "tourRead"))],
    ["旧版 index.html 内 home-lede 出现 0 次", cnt(oldHtml, "home-lede") === 0, String(cnt(oldHtml, "home-lede"))],
    ["旧版 index.html 内 home-tour-entry 出现 0 次", cnt(oldHtml, "home-tour-entry") === 0, String(cnt(oldHtml, "home-tour-entry"))],
    ["新版 app.js 内 renderHomeLede ≥1 次", cnt(newApp, "renderHomeLede") >= 1, String(cnt(newApp, "renderHomeLede"))],
    ["新版 index.html 内 home-lede ≥1 次", cnt(newHtml, "home-lede") >= 1, String(cnt(newHtml, "home-lede"))],
  ];
  for (const [l, c, d] of anchor) console.log("  " + (c ? "✓" : "✗") + " " + l + "  —— 实测 " + d);
  if (anchor.some(a => !a[1])) throw new Error("锚定失效：OLD_REF 已不是「本件之前一版」，停门。勿改回 HEAD，见门头。");

  const srvNew = await srv(SITE);
  const srvOld = await srv(SITE, { "/app.js": oldApp, "/index.html": oldHtml, "/styles.css": oldCss });
  const baseNew = "http://127.0.0.1:" + srvNew.address().port + "/";
  const baseOld = "http://127.0.0.1:" + srvOld.address().port + "/";
  const br = await chromium.launch();

  /* ===== §一 本件之前提（任务书〇节三条，逐条附求法｜所期｜读法） ===== */
  head("§一 本件之前提——编年之筛选条与其自述之数（〇节；所期不取任务书之数，另路复算）");
  const rc = recomputeFromData();
  {
    const { ctx, pg, errs, cerrs } = await pageOf(br, baseNew, { seed: "1", hash: "#/chronicle", settle: 1200 });
    const r = await pg.evaluate(() => ({
      states: [...document.querySelectorAll("#chron-f-state .chron-chip")].map(b => b.textContent.trim()),
      cats: [...document.querySelectorAll("#chron-f-cat .chron-chip")].map(b => b.textContent.trim()),
      intro: document.getElementById("chron-intro").textContent,
      rows: Number(document.getElementById("chron-list").dataset.rows),
    }));
    ok(r.states.length === 13, "按国之目 13", "实测 " + r.states.length + " 目：" + r.states.join(" | "));
    ok(r.cats.length === 17, "按类 17 类", "实测 " + r.cats.length + " 类：" + r.cats.join(" | "));
    const mTotal = r.intro.match(/全库\s*(\d+)\s*条事件/);
    const mOrph = r.intro.match(/其中\s*(\d+)\s*条未系于任何主角/);
    ok(!!mTotal && !!mOrph, "编年自述之二数可取", r.intro.slice(0, 40) + "…");
    ok(mTotal && Number(mTotal[1]) === rc.total, "自述之全库条数＝独立自 events.json 复算之数",
      "页面 " + (mTotal && mTotal[1]) + " ／ 复算 " + rc.total);
    ok(mOrph && Number(mOrph[1]) === rc.orphan, "自述之「只此一处可见」＝独立复算之数",
      "页面 " + (mOrph && mOrph[1]) + " ／ 复算 " + rc.orphan);
    ok(r.rows === rc.total, "chron-list data-rows＝复算之全库条数", r.rows + " ／ " + rc.total);
    ok(errs.length === 0 && cerrs.length === 0, "编年页零 pageerror（beacon 噪音已剔，见 pageOf 之注）", "pageerror " + errs.length + "／console " + cerrs.length + (errs.concat(cerrs).length ? "：" + errs.concat(cerrs).join(" ; ") : ""));
    await ctx.close();
  }
  // 「不得写死」之机械证据：新增之文内不许出现这两个数之字面
  {
    const ledeSrc = (newApp.match(/function renderHomeLede\(\)[\s\S]*?\n}/) || [""])[0];
    const badLede = [String(rc.total), String(rc.orphan), String(rc.meta.tables.people), String(rc.meta.tables.places), String(rc.meta.tables.passages)]
      .filter(n => ledeSrc.includes(n));
    ok(badLede.length === 0, "renderHomeLede 源码内不含任何一个库数之字面", badLede.length ? "撞见 " + badLede.join("/") : "无");
    const homeBlock = (newHtml.match(/<div class="home-lede"[\s\S]*?<\/div>/) || [""])[0];
    const badHtml = [String(rc.total), String(rc.orphan), String(rc.meta.tables.people)].filter(n => homeBlock.includes(n));
    ok(badHtml.length === 0, "index.html 之引言块内不含任何一个库数之字面", badHtml.length ? "撞见 " + badHtml.join("/") : "无");
  }

  /* ===== §二 导览之记（二节 1；七式离场逐式量） ===== */
  head("§二 导览之记已治——七式离场（★ 判据是「下次不复覆于地图之上」，非「键非 null」）");
  const HOWS = ["skip", "esc", "finish", "abandon", "legacy-1", "garbage", "blocked"];
  const newTour = {};
  for (const how of HOWS) {
    const m = await measureTour(br, baseNew, how);
    newTour[how] = m;
    console.log("    · " + how.padEnd(9) + " 初显=" + m.shown0 + " 键=" + JSON.stringify(m.key) +
      " 复弹=" + m.reshown + " 入口=" + (m.entry ? JSON.stringify(m.entry.text) + "/resume=" + JSON.stringify(m.entry.resume) + "/可见=" + m.entry.visible : "无"));
  }
  ok(newTour["abandon"].key !== null, "【记·甲】中途不理（未走完）亦留记", "键=" + JSON.stringify(newTour["abandon"].key));
  ok(newTour["abandon"].reshown === false, "【记·乙】未走完者下次不复弹（不复覆地图）", "复弹=" + newTour["abandon"].reshown);
  ok(newTour["skip"].reshown === false && newTour["esc"].reshown === false && newTour["finish"].reshown === false,
    "【记·丙】跳过／Esc／走完三式俱不复弹", "skip=" + newTour["skip"].reshown + " esc=" + newTour["esc"].reshown + " finish=" + newTour["finish"].reshown);
  ok(/"done":true/.test(String(newTour["finish"].key)) && /"step":2/.test(String(newTour["finish"].key)),
    "【记·丁】走完者其记书明 step=2、done=true", "键=" + JSON.stringify(newTour["finish"].key));
  ok(newTour["legacy-1"].shown0 === false, "【记·戊】旧值 \"1\" 读作已走完（向后兼容，不复弹）", "初显=" + newTour["legacy-1"].shown0);
  ok(newTour["garbage"].shown0 === false, "【记·己】键已损者不抛错、断为已走完", "初显=" + newTour["garbage"].shown0);
  const entAll = HOWS.every(h => newTour[h].entry && newTour[h].entry.visible);
  ok(entAll, "【记·庚】七式之后首页皆有可见之常驻导览入口（二节 3 之明路）",
    HOWS.map(h => h + "=" + !!(newTour[h].entry && newTour[h].entry.visible)).join(" "));
  ok(newTour["blocked"].entry && newTour["blocked"].entry.visible,
    "【记·辛】存储不可用（隐私模式）时首页仍有明路", "入口可见=" + !!(newTour["blocked"].entry && newTour["blocked"].entry.visible));
  ok(newTour["abandon"].entry && newTour["abandon"].entry.resume === "0",
    "【记·壬】未走完之记使入口转为「继续」并带其步", "resume=" + JSON.stringify(newTour["abandon"].entry && newTour["abandon"].entry.resume));
  ok(HOWS.every(h => newTour[h].errs.length === 0 && newTour[h].cerrs.length === 0), "【记·癸】七式俱零 pageerror（beacon 噪音已剔）",
    HOWS.map(h => h + ":p" + newTour[h].errs.length + "/c" + newTour[h].cerrs.length).join(" ") +
    (HOWS.some(h => newTour[h].errs.length || newTour[h].cerrs.length) ? " ：" + HOWS.flatMap(h => newTour[h].errs.concat(newTour[h].cerrs)).join(" ; ") : ""));

  /* ===== §三 首页之言（三节；两宽） ===== */
  head("§三 首页之言已立（三节；1440／375 两宽）");
  const lede = {};
  for (const [w, h] of [[W_WIDE, H_WIDE], [W_NARROW, H_NARROW]]) {
    const m = await measureLede(br, baseNew, w, h);
    lede[w] = m;
    console.log("    · " + w + "px 盒=" + JSON.stringify(m.box) + " 视口高=" + m.vh +
      " 首屏内=" + m.inFold + " 地图顶=" + m.mapTop + " 地图整幅在首屏=" + m.mapFullyInFold + " 链数=" + m.nLinks);
    (m.ps || []).forEach((t, i) => console.log("        句" + (i + 1) + "：" + t));
    ok(m.exists, w + "px 引言块在", "");
    /* r54-4 之后为**四**句（第四句系裁七十一之甲：编年之径一链）。 */
    ok(m.ps && m.ps.length === 4 && m.ps.every(t => t.length > 0), w + "px 四句俱在且非空（r54-4 增第四句）", "实测 " + (m.ps || []).length + " 句");
    ok(m.inFold, w + "px 引言在第一眼之内", "y=" + (m.box && m.box.y) + " 视口高=" + m.vh);
    ok(m.mapFullyInFold, w + "px 引言落地之后地图整幅仍在首屏", "地图顶=" + m.mapTop);
    /* ★ 此条 r54-4 分了家：句三（#home-lede-why）内**一个链也没有**（考据页未立），
     *   而引言全块之链数今为 **1**（甲之链）。原条只问「引言内链数=0」，甲落即撞红，
     *   而红之处非病所在——故改问两处，各问其所该问。 */
    /* ★★ 【r54-7 二次反转之再反转，r60-I，2026-10-09；照 r54-4b 之例留其痕，不默然改】
     *   r54-7 曾因考据页立而断「句三内恰一链（`.hl-kaodui`，href `#/kaodui`，数＝meta.tables.kaodui）、
     *   引言全块之链恰二个」。**该屏并其路由与句三之链今已去之**（r60-I），所断之事实又变：
     *   故断回 r54-4 之原形——句三内**无链**、引言全块之链**恰一个**（即甲之链，编年之径）；
     *   并另断页上无任何指向 `#/kaodui` 之链（死路由不留入口）。**判据本身未变，变的是所系之前提。** */
    ok(m.whyLinks === 0, w + "px 句三内无链（r60-I 考据链已去）", "句三内链数=" + m.whyLinks);
    ok(m.nLinks === 1, w + "px 引言全块之链恰一个（即甲之链，别无他链）", "链数=" + m.nLinks);
    ok(m.deadHref === 0, w + "px 页上无任何指向 #/kaodui 之链", "数=" + m.deadHref);
    ok(m.errs.length === 0 && m.cerrs.length === 0, w + "px 零 pageerror（beacon 噪音已剔）", "pageerror " + m.errs.length + "／console " + m.cerrs.length + (m.errs.concat(m.cerrs).length ? "：" + m.errs.concat(m.cerrs).join(" ; ") : ""));
  }
  {
    const t = rc.meta.tables;
    const s = (lede[W_WIDE].ps || [])[1] || "";
    for (const [k, v] of [["events", t.events], ["people", t.people], ["places", t.places], ["passages", t.passages]]) {
      ok(s.includes(String(v)), "句二之 " + k + " 数＝meta.tables." + k + " = " + v, "句二：" + s);
    }
    /* ★ 【r54-7 反转之再反转，r60-I 留痕】原条（r54-7）断 `KAODUI_ENTRY` 之值为 `{hash:"#/kaodui",…}`、其内不含数字、
     *   其出否系于该常量、句三之数取 `meta.tables.kaodui`。**该常量与该链今已去**，故断其**确已不在**：
     *   源码内无 `KAODUI_ENTRY`、无 `#/kaodui`、无 `.hl-kaodui`（不留死路由）。 */
    ok(!/KAODUI_ENTRY|#\/kaodui|hl-kaodui/.test(newApp), "app.js 内无 KAODUI_ENTRY／#/kaodui／hl-kaodui（考据入口并其路由已去）", "");
    ok(!/innerHTML/.test((newApp.match(/function renderHomeLede\(\)[\s\S]*?\n}/) || [""])[0]),
      "引言不走 innerHTML（红线六·零 XSS 面）", "");
    /* r54-4：二数之唯一出处 chronCounts() 内亦不许有任何库数之字面。 */
    const cntSrc = (newApp.match(/function chronCounts\(\)[\s\S]*?\n}/) || [""])[0];
    ok(cntSrc.length > 0, "chronCounts() 在源码之内（甲之二数与编年自述之唯一出处）", "长 " + cntSrc.length + " 字");
    const badCnt = [String(rc.total), String(rc.orphan)].filter(n => cntSrc.includes(n));
    ok(badCnt.length === 0, "chronCounts() 源码内不含库数之字面", badCnt.length ? "撞见 " + badCnt.join("/") : "无");
    ok(/const nOrphan = chronCounts\(\)\.orphan/.test(newApp),
      "编年页之自述亦取 chronCounts()（二处同源，不各算一遍）",
      (newApp.match(/const nOrphan[^\n]*/) || [""])[0].trim());
  }

  /* ===== §四 按类反证·逐条对位（r52 裁二十四） ===== */
  head("§四 按类反证·逐条对位——同法施于旧版（" + OLD_REF + "），逐条各自见红");
  const oldTour = {};
  for (const how of ["abandon", "skip", "legacy-1", "blocked"]) {
    oldTour[how] = await measureTour(br, baseOld, how);
    const m = oldTour[how];
    console.log("    · 旧版 " + how.padEnd(9) + " 初显=" + m.shown0 + " 键=" + JSON.stringify(m.key) +
      " 复弹=" + m.reshown + " 入口=" + (m.entry ? "有" : "无"));
  }
  const oldLede = await measureLede(br, baseOld, W_WIDE, H_WIDE);
  const counter = [
    ["记·甲 未走完亦留记", oldTour["abandon"].key === null, "旧版键=" + JSON.stringify(oldTour["abandon"].key) + "（应为 null 方算见红）"],
    ["记·乙 未走完不复弹", oldTour["abandon"].reshown === true, "旧版复弹=" + oldTour["abandon"].reshown + "（应为 true 方算见红）"],
    ["记·丁 其记书明 step／done", !/"done"/.test(String(oldTour["skip"].key)), "旧版键=" + JSON.stringify(oldTour["skip"].key)],
    ["记·庚 首页常驻入口", oldTour["abandon"].entry === null, "旧版入口=" + (oldTour["abandon"].entry ? "有" : "无")],
    ["记·辛 隐私模式仍有明路", oldTour["blocked"].entry === null, "旧版入口=" + (oldTour["blocked"].entry ? "有" : "无")],
    ["记·壬 入口转「继续」并带其步", oldTour["abandon"].entry === null, "旧版无入口，故无 resume 可言"],
    ["三节 引言三句", oldLede.exists !== true, "旧版 #home-lede 存在=" + !!oldLede.exists],
  ];
  for (const [cls, red, d] of counter) ok(red, "〔反证〕" + cls + " —— 旧版当场红", d);
  // ★ 诚实一条：新旧同绿者照实标出，不冒充反证
  console.log("  ⚠ 新旧同绿·非本轮之新能（照实标出，不入反证之数）：");
  console.log("      · 记·戊「旧值 \"1\" 读作已走完」——旧版 tourSeen() 对 \"1\" 亦为真，旧版初显=" +
    oldTour["legacy-1"].shown0 + "。本条是**向后兼容之不回退**，非新增之能，故无红可测。");
  console.log("      · 记·己「键已损者不抛错」——旧版 `!!getItem` 对任何非空串皆真，亦不抛错；本条同为不回退。");
  console.log("      · 记·丙「跳过／Esc／走完不复弹」——旧版此三式本已留记（实测旧版 skip 键=" +
    JSON.stringify(oldTour["skip"].key) + "、复弹=" + oldTour["skip"].reshown +
    "）。★ 即任务书二节 1「略过之后仍为 null」于「跳过」一钮**不复现**，详见交付文档之验收偏差上报。");

  /* ===== §五 零影响：未涉之页 DOM 与旧版逐位全等 ===== */
  head("§五 零影响——未涉之页 DOM 与旧版逐位全等（两宽）");
  const PAGES = [
    ["#/chronicle", "#view-chronicle"],
    ["#/library", "#view-library"],
    ["#/about", "#view-about"],
    ["#/relations", "#view-relations"],
    ["#/p/P_WENJIANG/timeline", "#view-timeline"],
    ["#/p/P_WENJIANG/map", "#view-map"],
  ];
  for (const [w, h] of [[W_WIDE, H_WIDE], [W_NARROW, H_NARROW]]) {
    for (const [hash, sel] of PAGES) {
      const a = await snapshot(br, baseNew, hash, sel, w, h);
      const b = await snapshot(br, baseOld, hash, sel, w, h);
      let where = "";
      if (a.s !== b.s) {
        const n = Math.min(a.s.length, b.s.length);
        let i = 0; while (i < n && a.s[i] === b.s[i]) i++;
        where = " 首异于第 " + i + " 字：新「" + a.s.slice(i, i + 60) + "」／旧「" + b.s.slice(i, i + 60) + "」";
      }
      ok(a.s === b.s, w + "px " + hash + " → " + sel + " 逐位全等",
        "长 " + a.s.length + " ／ " + b.s.length + where);
      ok(a.errs.length === 0 && a.cerrs.length === 0, w + "px " + hash + " 零 pageerror（beacon 噪音已剔）", "pageerror " + a.errs.length + "／console " + a.cerrs.length + (a.errs.concat(a.cerrs).length ? "：" + a.errs.concat(a.cerrs).join(" ; ") : ""));
    }
  }

  /* ===== §六 二案之量（供裁，非断言；本节一行也不落改） ===== */
  head("§六 供裁之量（一）「编年之径」四案——任务书一节 3 三项：首屏可见性／点击之径长／窄屏之形");
  console.log("  ★ 本节只量不改站；四案俱在无头页内注入后量，site/ 一字未动。");
  console.log("  ★ r54-4 之后仍留此节，惟量前**先摘去站上已落之第四句**（见 measureEntryCase 之注）——");
  console.log("    不摘则「现状」已含甲，四案之 Δ 皆自甲之上起算，裁之所据即不可复读。");
  console.log("    ★ 甲一案之 Δ 与 r54-1 交付文档 §四所载不同（那里 +28／+43，此处 +33／+31），其因已查明，非量之飘："
    + "本节之探针给注入之元素挂 `class=\"hl-chron\"`，而 r54-4 已为该类落了字号与行高之 CSS——"
    + "**探针遂被站上新落之样式管住**：375px 下其文自二行收为一行（盒高 38→27），故 Δ 自 +43 落到 +31。"
    + "★ 此非坏事（探针之数因此贴近真数），惟**须记明**：本节之数自 r54-4 起已不是 r54-1 受裁时之数；"
    + "落于站上之真数见 §七之一·附（Δ对本件之前 +31／+31）。");
  console.log("  ★ 点击之径长：现状「主导航·编年」本已 1 击可达，故四案之别不在径长，而在**其所值是否说得出来**。");
  const ENTRY_CASES = [["base", "现状·主导航「编年」二字（无数、无一语其值）"],
                       ["jia", "甲·引言第四行一链（带 265／24 二数）"],
                       ["yi", "乙·引言与地图之间一张入口卡"],
                       ["bing", "丙·首页 .home-extra 之一钮（同现有诸入口之式）"],
                       ["ding", "丁·主导航「编年」钮带全库条数（零新增高度）"]];
  const entryTab = {};
  for (const [w, h] of [[W_WIDE, H_WIDE], [W_NARROW, H_NARROW]]) {
    for (const [cid, desc] of ENTRY_CASES) {
      const m = await measureEntryCase(br, baseNew, w, h, cid, { total: rc.total, orphan: rc.orphan });
      entryTab[w + "/" + cid] = m;
      console.log("    · " + w + "px " + cid.padEnd(5) + " 盒=" + JSON.stringify(m.entryBox) +
        " 首屏内=" + m.inFold + " 需下滚=" + m.scrollNeeded + "px 地图顶=" + m.mapTop +
        " 地图整幅在首屏=" + m.mapFullyInFold + " ｜ " + desc);
      if (m.errs.length || m.cerrs.length) console.log("      ⚠ pageerror " + m.errs.length + "／console " + m.cerrs.length + "：" + m.errs.concat(m.cerrs).join(" ; "));
    }
  }
  console.log("  ★ 与现状之差（Δ地图顶，正数＝把地图往下推）：");
  for (const w of [W_WIDE, W_NARROW]) {
    const b = entryTab[w + "/base"].mapTop;
    for (const [cid] of ENTRY_CASES) {
      if (cid === "base") continue;
      console.log("      " + w + "px " + cid + "：Δ地图顶 = " + (entryTab[w + "/" + cid].mapTop - b) + "px");
    }
  }

  head("§六 供裁之量（二）「导览之形」三案——任务书二节 2：遮挡面积占地图之比，两宽各量"
    + "（★ r54-4 之后改量**旧源端** " + OLD_REF + "，其由见下注）");
  const SHAPES = [["now", "现状·浮卡随高亮孔就近落位（覆于地图之上）"],
                  ["xia", "甲·下置贴边条（全宽、贴视口底）"],
                  ["ce", "乙·侧置（>680px 贴右缘垂直居中；≤680px 退为下置）"],
                  ["bi", "丙·避让（择地图盒之外最空一侧落卡，高亮孔不变）"]];
  /* ★ r54-4 之后本节改量**旧源端**（`OLD_REF`），其由要紧：
   *   乙既已落于站上，新源端之「现状·就近落位」一案**已不存在**——其定位之码已去（app.js 之 drawTourHole）。
   *   若仍量新源端，则「现状」一行量到的是**乙**（实测 0.0%），而标签写着「就近落位」——**标签与所量之物不符即是假账**。
   *   故本节自此量旧源端：那才是四案受裁时所对之真形。
   *   ★ 一事须记明：旧源端**无首页引言**（引言系 r54-1 所立），故其地图坐得比 r54-1 量时高约 120／156px；
   *     惟「现状」一案之浮卡系随高亮孔落位、孔随地图同移，故其比**恰与 r54-1 所载相同**（8.3%／54.1%，下可自证）；
   *     甲（贴视口底之条）之数则因地图上移而与 r54-1 所载不同——**不可混引**。 */
  for (const [w, h] of [[W_WIDE, H_WIDE], [W_NARROW, H_NARROW]]) {
    for (const [sh, desc] of SHAPES) {
      const m = await measureTourShape(br, baseOld, w, h, sh);
      console.log("    · " + w + "px " + sh.padEnd(4) + " 遮挡 " + Math.round(m.ovl) + " / 地图 " + Math.round(m.mapArea) +
        " = " + (m.pct == null ? "n/a" : m.pct.toFixed(1) + "%") + " 浮卡盒=" + JSON.stringify(m.popBox) +
        " 浮卡可见=" + m.popVisible + " 导览在显=" + m.tourShown + " ｜ " + desc);
      if (m.errs.length || m.cerrs.length) console.log("      ⚠ pageerror " + m.errs.length + "／console " + m.cerrs.length + "：" + m.errs.concat(m.cerrs).join(" ; "));
    }
  }

  /* ===================================================================
   * §七 r54-4 之落（裁七十一取甲／裁七十二取乙／裁七十三只藏其链）
   * ★ 与 §六之别：§六 以行内样式**模拟**诸案以供裁；§七 量的是**站上真形**，一字不注入。
   * =================================================================== */
  head("§七 r54-4 之落——甲（编年之径）／乙（导览侧置）／句三（只藏其链），量站上真形");

  /* ---- 七之一 甲：引言第四句一链（裁七十一） ---- */
  console.log("  ── 七之一 甲·编年之径（引言第四句一链）");
  const hop = {};
  for (const w of [W_WIDE, W_NARROW]) {
    const m = lede[w];                                   // §三 已量，此处只断其 r54-4 之条
    const c = m.chron;
    console.log("    · " + w + "px 第四句：" + (c ? JSON.stringify(c.text) : "无") +
      " href=" + (c && c.href) + " 盒=" + (c ? JSON.stringify(c.box) : "—") +
      " 首屏内=" + (c && c.inFold) + " 需下滚=" + (c && c.scrollNeeded) + "px 横溢=" + m.docOverflowX);
    ok(!!c, w + "px 【径·甲】引言第四句在，且是一条链", c ? "文=" + c.text : "无 .hl-chron");
    ok(c && c.href === "#/chronicle", w + "px 【径·甲】其 href 指编年（相对之 hash，非绝对路径）", c && c.href);
    ok(c && /^编年 · 全库 \d+ 条按年铺开，其中 \d+ 条只此一处可见 →$/.test(c.text),
      w + "px 【径·甲】其文合裁七十一所定之形", c && c.text);
    ok(c && c.total === rc.total, w + "px 【径·乙】其「全库」之数＝独立自 events.json 复算之数",
      (c && c.total) + " ／ 复算 " + rc.total);
    ok(c && c.orphan === rc.orphan, w + "px 【径·乙】其「只此一处可见」之数＝独立复算之数",
      (c && c.orphan) + " ／ 复算 " + rc.orphan);
    ok(c && c.inFold && c.scrollNeeded === 0, w + "px 【径·丙】其链整个在首屏之内、需下滚 0px",
      "盒=" + (c ? JSON.stringify(c.box) : "—") + " 视口高=" + m.vh);
    ok(m.docOverflowX === false, w + "px 【径·丙】落其链之后页无横向溢出", "doc 横溢=" + m.docOverflowX);
    const hp = await measureChronHop(br, baseNew, w, W_WIDE === w ? H_WIDE : H_NARROW);
    hop[w] = hp;
    console.log("      点其链 → hash=" + hp.hash + " 编年屏在显=" + hp.shown + " rows=" + hp.rows);
    ok(hp.hash === "#/chronicle" && hp.shown === true, w + "px 【径·丁】其链**点得进去**（不只是「在」）",
      "hash=" + hp.hash + " 编年屏在显=" + hp.shown);
    ok(hp.rows === rc.total, w + "px 【径·丁】落地之编年确铺全库", "rows=" + hp.rows + " ／ " + rc.total);
    const mt = (hp.intro.match(/全库\s*(\d+)\s*条事件/) || [])[1];
    const mo = (hp.intro.match(/其中\s*(\d+)\s*条未系于任何主角/) || [])[1];
    ok(Number(mt) === c.total && Number(mo) === c.orphan,
      w + "px 【径·戊】首页第四句之二数与编年页自述**逐个相等**（同源之证，非巧合）",
      "首页 " + c.total + "／" + c.orphan + " ⇔ 编年 " + mt + "／" + mo);
    ok(hp.errs.length === 0 && hp.cerrs.length === 0, w + "px 【径·己】点其链一路零 pageerror",
      "pageerror " + hp.errs.length + "／console " + hp.cerrs.length +
      (hp.errs.concat(hp.cerrs).length ? "：" + hp.errs.concat(hp.cerrs).join(" ; ") : ""));
  }
  /* Δ地图顶：三个基准俱现量（基准之义见 measureMapTop 之注） */
  console.log("  ── 七之一·附 Δ地图顶（三基准俱现量；正数＝把地图往下推）");
  for (const [w, h] of [[W_WIDE, H_WIDE], [W_NARROW, H_NARROW]]) {
    const old0 = await measureMapTop(br, baseOld, w, h, false);       // ① 旧版：无引言
    const pre = await measureMapTop(br, baseNew, w, h, true);         // ② 本件之前：引言三句
    const now = await measureMapTop(br, baseNew, w, h, false);        // ③ 今：引言四句
    console.log("    · " + w + "px 地图顶：旧版(无引言) " + old0.mapTop + " → 本件之前(三句) " + pre.mapTop +
      "（Δ对旧版 +" + (pre.mapTop - old0.mapTop) + "） → 今(四句) " + now.mapTop +
      "（Δ对本件之前 +" + (now.mapTop - pre.mapTop) + "；Δ对旧版 +" + (now.mapTop - old0.mapTop) + "）" +
      " ｜ 引言盒高 三句 " + pre.ledeH + " → 四句 " + now.ledeH + " ｜ 地图整幅在首屏 " + now.mapFullyInFold);
    ok(pre.nP === 3 && now.nP === 4, w + "px 基准②之复原属实（摘第四句之 <p> 后恰三句）",
      "本件之前 " + pre.nP + " 句 ／ 今 " + now.nP + " 句");
    ok(now.mapFullyInFold === true, w + "px 【径·庚】第四句落地之后地图整幅**仍**在首屏", "地图顶=" + now.mapTop);
  }

  /* ---- 七之二 乙：导览侧置（裁七十二） ---- */
  console.log("  ── 七之二 乙·导览之形（侧置；≤680px 退下置）；★ 走真导览，一字不注入");
  const realTour = {};
  for (const [w, h] of [[W_WIDE, H_WIDE], [W_NARROW, H_NARROW]]) {
    const m = await measureTourReal(br, baseNew, w, h);
    realTour[w] = m;
    m.steps.forEach((s, i) => console.log("    · " + w + "px 步" + (i + 1) + " [" + s.step + "] 卡=" + JSON.stringify(s.pop) +
      " 孔=" + JSON.stringify(s.hole) + " 遮图=" + (s.mapPct == null ? "n/a" : s.mapPct + "%") +
      " 遮孔=" + s.holePct + "% 卡全在视口=" + s.popInView + " 行内样式=" + JSON.stringify(s.inlineStyle) + " 焦点=" + s.focusId));
    const s1 = m.steps[0];
    ok(s1.shown === true, w + "px 【形·〇】导览确在显（否则以下诸量皆是假 0）", "在显=" + s1.shown);
    ok(s1.mapPct === 0, w + "px 【形·甲】步一浮卡遮首页地图 0.0%（裁七十二之验收）",
      "遮 " + s1.mapOvl + " / 地图 " + s1.mapArea + " = " + s1.mapPct + "%");
    ok(m.steps.every(s => s.inlineStyle === ""), w + "px 【形·乙】浮卡之位全由 CSS 定（三步俱无行内样式）",
      m.steps.map((s, i) => "步" + (i + 1) + "=" + JSON.stringify(s.inlineStyle)).join(" "));
    ok(m.steps.every(s => s.popInView), w + "px 【形·丙】三步之卡俱整个在视口之内",
      m.steps.map((s, i) => "步" + (i + 1) + "=" + s.popInView).join(" "));
    ok(m.steps.every(s => s.focusId === "tour-next"), w + "px 【形·丁】三步之焦点仍落「下一步」（键盘可达不回退）",
      m.steps.map(s => s.focusId).join("/"));
    ok(m.errs.length === 0 && m.cerrs.length === 0, w + "px 【形·戊】走完三步零 pageerror",
      "pageerror " + m.errs.length + "／console " + m.cerrs.length +
      (m.errs.concat(m.cerrs).length ? "：" + m.errs.concat(m.cerrs).join(" ; ") : ""));
  }
  /* ★ r54-4b：此注之**理由**照站长 2026-09-26 之裁改写（原作「任何固定之卡必与之有交」一路，
   *   其失在以「其数之所以然」代「其为何不足为据」；站长所正者是**量法与所量之物对不上**）。 */
  console.log("  ★ 步二／步三之「遮孔比」只作**量**记，不作断言——其由是**量法与所量之物对不上**（站长 2026-09-26 裁）：");
  console.log("    裁七十二之验收，步一量的是「**卡 ∩ 地图 ／ 地图**」；**而步二所指之物不是地图**"
    + "（是文姜时间线之首卡，1440px 1196×520／375px 343×918）。");
  console.log("    ★ **同一个比施于步二，是换了被量之物而不换其名**——故其数不入验收，只作量记。"
    + "★ 此与裁七十一之条件（「仍不换行」所预设者不成立）**同族**：判据与所量之物对不上。");
  console.log("    （其数与旧版之对照见 §七之五 反证表；★ 不以「其数尚小」为由——那是以量之大小论其可否为据。）");

  /* ---- 七之三 句三：只藏其链，且其无链之态须读得通（裁七十三） ---- */
  console.log("  ── 七之三 句三·只藏其链（裁七十三）；★ r54-7 之后其链**已出**，下为实读之文");
  for (const w of [W_WIDE, W_NARROW]) {
    const t = lede[w].whyText || "";
    console.log("    · " + w + "px 句三实读：" + JSON.stringify(t));
    /* ★★ 【r54-7 三次反转之一，照 r54-4b 之例留其痕，不默然改】
     *   **原条**：`ok(lede[w].whyLinks === 0, "【句三·甲】今日句三内一个链也没有")`。
     *   **其立意**（裁七十三「只藏其链」）：页未立之日，句三之文照出而**链不出**——
     *   把「**不显一个点不进去的链**」钉成一条可复验之事实。
     *   ★ **今考据页已立（r54-7），那条事实即不复存在**：藏之之由是「点不进去」，其页既立，藏即成掩。
     *   故改断其**有且恰一**，并另断其**指得着**（`href === "#/kaodui"`，§三 已断之）。
     *   ★ **裁七十三一字未变**——变的是它所系之前提（页立与否），**不是判据本身**。 */
    /* 〔r60-I 再反转〕考据页并其链已去：句三复无链，故复断 0（回到 r54-4 原形；上注所述「藏之之由」亦随页而去）。 */
    ok(lede[w].whyLinks === 0, w + "px 【句三·甲】句三内无链（r60-I 考据链已去）",
      "链数=" + lede[w].whyLinks);
    /* 「读得通」之机械判（裁七十三：不得出现一句指向空处之文）：
     *   ① 不以悬空之引语收尾（「见」「：」「，」「、」）；② 不含空括（（）〔〕[]()）；③ 以句号收。
     *   ★ 此三条**不因链之出而松**：链既出，「…之记录见<链>。」仍须是一句读得通之整话。 */
    ok(/。$/.test(t), w + "px 【句三·乙】以句号收，不以悬空之引语收尾", "末三字=" + JSON.stringify(t.slice(-3)));
    ok(!/[见：，、]$/.test(t.replace(/。$/, "")), w + "px 【句三·丙】去句号后亦不以「见／：／，／、」收尾",
      "末三字=" + JSON.stringify(t.replace(/。$/, "").slice(-3)));
    ok(!/（\s*）|〔\s*〕|\(\s*\)|\[\s*\]/.test(t), w + "px 【句三·丁】文内无空括（无一处指向空处）", "");
  }

  /* ---- 七之四 丁：**已落**（r54-4b，站长 2026-09-26 裁「丁可落」），并现量其代价 ---- */
  console.log("  ── 七之四 丁·导航钮带全库条数（★ r54-4b **已落**；站长 2026-09-26 裁「丁可落」）");
  /* ★★ 一条断言之期望值在此反转，其痕记此（站长明命「不得默然改一个断言之期望值」）：
   *   - **r54-4 时**本条作「【丁·〇】主导航『编年』钮今**仍无数**」——其立**正为使「未落」本身可复验**
   *     （一件事没做，也要留下可核之证；领队之五·一以此为当记者）；
   *   - **r54-4b 站长裁「丁可落」**，丁既落，原期望值即成陈迹，故**反转为其反面**：钮**须**带数，
   *     且其数须与独立复算相等。
   *   ★ 原条之文与其立意照录于上，不删——**期望值可以改，改之之由不可无声**。 */
  console.log("    ★ 【丁·〇】之期望值于 r54-4b **反转**：r54-4 时断「钮仍无数」（为使「未落」可复验），"
    + "今站长裁「丁可落」，遂改断「钮带数且其数＝独立复算」。原条之文与其立意照录于门内之注，不删。");
  for (const w of [W_WIDE, W_NARROW]) {
    const m = lede[w];
    console.log("    · " + w + "px 钮文=" + JSON.stringify(m.navChronText) + " 其数=" + JSON.stringify(m.navNum) +
      " aria-label=" + JSON.stringify(m.navChronAria));
    ok(m.navNum !== null && m.navNum === String(rc.total),
      w + "px 【丁·〇】主导航「编年」钮**带数**，且其数＝独立自 events.json 复算之数（期望值 r54-4b 反转，见上）",
      "其数=" + JSON.stringify(m.navNum) + " ／ 复算 " + rc.total);
    ok(m.navChronText === "编年" + rc.total, w + "px 【丁·甲】钮之文恰为「编年」＋其数（别无他字）",
      JSON.stringify(m.navChronText));
    ok(m.navChronAria === "编年 · 全库 " + rc.total + " 条",
      w + "px 【丁·乙】其 `aria-label` 明其义（读屏不致读作「编年二百六十五」而不知所指）",
      JSON.stringify(m.navChronAria));
  }
  /* 源码之证：其数不写死（与 renderHomeLede／chronCounts 同一口径之断言） */
  {
    const src = (newApp.match(/function syncNavChronCount\(\)[\s\S]*?\n}/) || [""])[0];
    ok(src.length > 0, "【丁·丙】`syncNavChronCount()` 在源码之内", "长 " + src.length + " 字");
    const bad = [String(rc.total), String(rc.orphan)].filter(n => src.includes(n));
    ok(bad.length === 0, "【丁·丙】其源码内不含任何库数之字面（数自 chronCounts() 取）", bad.length ? "撞见 " + bad.join("/") : "无");
    ok(/syncNavChronCount\(\);/.test(newApp), "【丁·丙】其于 `boot()` 内确被调用一次", "");
    const navBlock = (newHtml.match(/<button type="button" data-view="chronicle">[\s\S]*?<\/button>/) || [""])[0];
    ok(navBlock.includes('id="nav-chron-count"') && !navBlock.includes(String(rc.total)),
      "【丁·丙】`index.html` 之钮内只留其位，不写死其数", JSON.stringify(navBlock));
  }
  /* 代价：现量「带数」与「去其数」二态（基准＝去其数之真态，非注入之模拟） */
  for (const [w, h] of [[W_NARROW, H_NARROW], [320, 700], [680, 800], [W_WIDE, H_WIDE]]) {
    const n = await measureNav(br, baseNew, w, h);
    ok(n.hasNum === true, w + "px 【丁·丁】`#nav-chron-count` 确在（基准②之复原所系）", "hasNum=" + n.hasNum);
    for (const [lab, r] of [["带数", n.ding], ["去数", n.bare]]) {
      console.log("    · " + w + "px [" + lab + "] nav 高=" + r.navH + " flex 行数=" + r.lines +
        " nav 横溢=" + r.navOverflowX + " doc 横溢=" + r.docOverflowX + "(" + r.docScrollW + "/" + r.docClientW + ")" +
        " 编年钮=" + JSON.stringify(r.chron) + " 文=" + JSON.stringify(r.chronText) +
        " 钮内文行数≈" + r.chronTextLines + " headerH=" + r.headerH + " mapTop=" + r.mapTop);
    }
    const zero = n.bare.navH === n.ding.navH && n.bare.lines === n.ding.lines &&
                 n.bare.headerH === n.ding.headerH && n.bare.mapTop === n.ding.mapTop;
    ok(zero, w + "px 【丁·戊】丁之代价为**零**：nav 高／flex 行数／headerH／地图顶，带数与去数**逐项相同**",
      "高 " + n.bare.navH + "→" + n.ding.navH + "、行 " + n.bare.lines + "→" + n.ding.lines +
      "、headerH " + n.bare.headerH + "→" + n.ding.headerH + "、地图顶 " + n.bare.mapTop + "→" + n.ding.mapTop);
    ok(n.ding.docOverflowX === false && n.ding.navOverflowX === false,
      w + "px 【丁·己】带数之后 nav 与页俱无横向溢出",
      "nav=" + n.ding.navOverflowX + " doc=" + n.ding.docOverflowX + "(" + n.ding.docScrollW + "/" + n.ding.docClientW + ")");
    ok(n.ding.chronTextLines <= 1.2, w + "px 【丁·庚】钮内文不换行", "行数≈" + n.ding.chronTextLines);
    console.log("      ⇒ " + w + "px ★ 而「" + w + "px 下导航栏恰一行」本身＝" + (n.bare.lines === 1) +
      "（**落丁之前即如此**，与丁无关——裁七十一之条件严读所以量不着丁者，正在此数）");
  }
  console.log("  ★ 裁七十一之条件严读（「375px 下导航栏不换行」）**本不满足，且其不满足与丁无关**：");
  console.log("    375px 下主导航自 r13 起即 `flex-wrap:wrap`，落丁之前已 2 行（选人／关系／编年／资料库 ｜ 关于／反馈／邮件）；320px 下 3 行。");
  console.log("    r54-4 遂照任务书之退路「丁不落」并上报；★ **站长 2026-09-26 裁「丁可落」**，r54-4b 补落之——");
  console.log("    **其判据之改在裁者，执行者只呈其量**（此即 design_notes §7.8 所记者）。");

  /* ---- 七之五 按类反证·逐条对位（r52 裁二十四；r54-4 之诸类） ---- */
  head("§七之五 r54-4 之按类反证·逐条对位——同法施于旧版（" + OLD_REF + "），逐条各自见红");
  const oldLede4 = await measureLede(br, baseOld, W_WIDE, H_WIDE);
  const oldTourW = await measureTourReal(br, baseOld, W_WIDE, H_WIDE);
  const oldTourN = await measureTourReal(br, baseOld, W_NARROW, H_NARROW);
  console.log("    · 旧版 1440px 步一 卡=" + JSON.stringify(oldTourW.steps[0].pop) + " 遮图=" + oldTourW.steps[0].mapPct +
    "% 遮孔=" + oldTourW.steps[0].holePct + "% 行内样式=" + JSON.stringify(oldTourW.steps[0].inlineStyle));
  console.log("    · 旧版 375px  步一 卡=" + JSON.stringify(oldTourN.steps[0].pop) + " 遮图=" + oldTourN.steps[0].mapPct +
    "% 遮孔=" + oldTourN.steps[0].holePct + "% 行内样式=" + JSON.stringify(oldTourN.steps[0].inlineStyle));
  console.log("    · 旧版 1440px 步二／步三 遮孔=" + oldTourW.steps[1].holePct + "%／" + oldTourW.steps[2].holePct +
    "%；旧版 375px 步二／步三 遮孔=" + oldTourN.steps[1].holePct + "%／" + oldTourN.steps[2].holePct + "%");
  const counter4 = [
    ["径·甲 引言第四句为编年之一链", oldLede4.exists !== true, "旧版 #home-lede 存在=" + !!oldLede4.exists + "（并无第四句可言）"],
    /* ★ 此二条之红须以「**量到了，而其无**」为据，不得以「没量到」充之：
     *   故先断旧版之钮**确已找到**（`navBtnFound`），再断其无数、无 aria-label。 */
    ["丁·〇 导航钮带全库条数", oldLede4.navBtnFound === true && oldLede4.navNum === null,
      "旧版钮确已找到=" + oldLede4.navBtnFound + "；其 #nav-chron-count 不在（量出之值 null），钮文=" + JSON.stringify(oldLede4.navChronText)],
    ["丁·乙 其 aria-label 明其义", oldLede4.navBtnFound === true && oldLede4.navChronAria === null,
      "旧版钮确已找到=" + oldLede4.navBtnFound + "；其 aria-label 量出之值=" + JSON.stringify(oldLede4.navChronAria)],
    ["径·乙 其二数与编年自述同源同数", oldLede4.chron == null, "旧版首页无 .hl-chron，一个数也不报"],
    ["形·甲 步一浮卡遮地图 0.0%（1440px）", oldTourW.steps[0].mapPct > 0, "旧版遮 " + oldTourW.steps[0].mapPct + "%（>0 方算见红）"],
    ["形·甲 步一浮卡遮地图 0.0%（375px）", oldTourN.steps[0].mapPct > 0, "旧版遮 " + oldTourN.steps[0].mapPct + "%（>0 方算见红）"],
    ["形·乙 浮卡之位全由 CSS 定（无行内样式）", oldTourW.steps[0].inlineStyle !== "", "旧版行内样式=" + JSON.stringify(oldTourW.steps[0].inlineStyle)],
  ];
  for (const [cls, red, d] of counter4) ok(red, "〔反证〕" + cls + " —— 旧版当场红", d);
  console.log("  ⚠ 新旧同绿·非本轮之新能（照实标出，不入反证之数）：");
  console.log("      · 形·丙「卡整个在视口之内」——旧版「就近落位」本已有夹取（Math.min/max 之两笔），三步亦俱在视口内；本条是**不回退**。");
  console.log("      · 形·丁「焦点落下一步」——旧版 placeTour 末已 focus #tour-next；本条同为不回退。");
  console.log("      · 句三·乙／丙／丁「其文读得通」——旧版无句三可读，故其红不足以证本轮之文**本身**读得通；");
  console.log("        句三之据是本门实读其文并逐条机械判（见 §七之三 所印之字），不靠反证。");

  /* ===================================================================================
   * 〔r60-I 外科切除，2026-10-09 EDT；照 r54-4b 之例留痕，不默然改〕
   * 原 §八（r54-7 之门，考据索引之读者页 `#/kaodui`：八之〇独立复算、八之一同数、八之二形与三数、
   * 八之二·附筛选往返、八之三凡例同源、八之四回库之链五表五路真点、八之五按类反证五类注入）
   * 连同其量函数 `measureKaodui`／`measureKaoduiFilter`／`kdClick`／`KD_CLICKS`，
   * 随该屏并其路由一并去之（站长 2026-10-06 裁：科普，非学术考订；任务书 r60-I）。
   * ★ 所去者仅此一屏之断言；§一至§七（r54-1／r54-4／r54-4b）其余仍有效之断言一字未动，
   *   惟 §三、§七之三 中三处「句三之链」之断言随该链之去而再反转，见各处之注。
   * =================================================================================== */

  await br.close(); srvNew.close(); srvOld.close();
  head("—— 共 " + checks + " 项断言，FAIL " + fails + " ——");
  console.log("（§六 为供裁之量，不计入断言；其改一行未落，照任务书一节 3／二节 2「停下上报、不自行落定」。）");
  if (fails) process.exitCode = 1;
})().catch(e => {
  console.error("门内抛错：" + (e && e.stack || e));
  /* ★ 【r54-7 改，留痕】原作 `process.exitCode = 2`——**不够**：抛错之时浏览器与二源端俱未关，
   *   node 之事件循环遂不空，**进程挂住不退**。其果是本门首跑时「输出一字不出、CPU 不动」，
   *   我一度疑其死循环，实则是**抛错之后没人收摊**。★ 一个**抛了错却不退**的门，比一个红门更坏：
   *   红门在说话，挂住之门什么也不说，而调它的人只能等。故改 `process.exit(2)` 强退。 */
  process.exit(2);
});
