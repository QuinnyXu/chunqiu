/* 经纬春秋 · r52 走查门：role-chip 溢出件（裁五甲＋丙、裁六②）
 *
 * 本门要回答四个问题，一个都不许用「截图看着不挤了」来答：
 *   ① **甲之改对任意长度成立**——全库最长之值（`E295`／`P_CHUWU`，486 字）在 1440／375 两宽下
 *      不溢出其容器；且不止此一值，**38 主角全部时间线卡之 role-chip 逐卡实测**，
 *      判据取 `getBoundingClientRect()` 之右缘与 `scrollWidth <= clientWidth`，**不以截图目测代之**。
 *   ② **叔向零影响**——站长所举之正例，改前改后 DOM 逐位相同、1440px 下盒矩形逐位相同。
 *      此条不与「我觉得没动它」对读，而是**真把 r52 改动前那一版的 app.js/styles.css 另起一个源端跑起来**两版对读。
 *   ③ **不吞字**——`role_in_event` 之 `**` 往返还原逐字全等（照 `vision_r51.js` §二之式），
 *      且胶囊之首句须是原值之真前缀、卡内之全文须是原值本身，一字不增不减。
 *   ④ **断言咬得住**——同一套实测施于**旧版**须当场**红**（旧版确实溢出）。
 *      没有这一条，§三跑绿只能证明「脚本会打印 ✓」，不能证明「脚本测的是溢出」（§7.2 按类反证）。
 *
 * ★ 旧版源端锚定固定哈希 `OLD_REF`（见下），**不取 `HEAD`**——照 r51 裁二十六之例：
 *   本件合入之后 `HEAD` 之 app.js 即含 `roleParts`，「旧版」会等于新版，两版对读之前提当场消失、
 *   §四必红而 §三之反证必绿（两头都错），且是**静默**的错。故钉死哈希，并于起手处打印
 *   「旧版 app.js 内 roleParts 出现 0 次／旧版 styles.css 之 role-chip 仍是 nowrap」之**正面证据**；
 *   锚定若失效，当场抛错停门，不许带病往下跑。
 *
 * ★ 本门**不动仓库任何文件**：旧版取自 `git show <OLD_REF>:site/...`（只读），不切分支、不 stash。
 * ★ `E295`／`P_CHUWU` 之所以要用 `state.person` 直驱 `renderTimeline()`：`P_CHUWU`（楚武王）
 *   `is_protagonist = 0`，`parseHash()` 只认 `PROTAGONISTS` 之 id，故 `#/p/P_CHUWU/timeline`
 *   今日**走不进去**——全库最长之值在公开页面上尚无落点。既然任务书口径六①点名要测它，
 *   就得把它**真渲进可见之时间线容器**里量，而不是量一个离屏的克隆。所用者仍是生产渲染函数本身。
 *
 * 用法：node tools/qa/vision_r52.js
 */
/* 【退出码】（r61-T 补书，旧书裁二百〇五 三②、裁二百二十七 三3；照 prod_freshness.js 门头之式）
 *   0 ＝ 全过；1 ＝ 判红（任一 ✗）；2 ＝ 本门自身出错（锚定失效之 throw、页面驱动抛错，`.catch` 出）。★ r61-T 改：`.catch` 原以 1 退，与判红混同——今改 2。
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

/* ---------- 双源端静态服务器（同 r51 之式）----------
 * override 里的路径从内存（锚定之旧版）供出，其余一律落回真实 site/——
 * 故「旧版」页面用的是同一份 site/data/，两版之差只剩 app.js 与 styles.css 本身。 */
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
/* 旧版源端之锚：`ae3e800` 系 r51 收官之 `main`，即**本件改动之前一版**。
 * 【不得改回 HEAD】理由见门头。 */
const OLD_REF = "ae3e800";
const gitShow = (p) => execFileSync("git", ["show", OLD_REF + ":" + p], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });

/* ---- r61-Q 校基线（裁二百二十五 ③，2026-10-13）：『旧版连其当日数据一并取』 ----
 *   原『旧版源端』＝旧码（app.js／styles.css）＋**今日**之 site/data/——故凡『旧版某数』（如孔子 25 行溢出其 N）
 *   随数据之增而漂（实测：1440px 18→19、375px 24→25），**漂的是数据，不是旧码之病变了**。
 *   治：另起一个『旧版整站』源端，由 `git show OLD_REF:site/<路径>` **逐请求现取**（同一提交之 site/ 全取，码与数据同源，
 *   不落盘、不用 worktree／junction），其数即定于当日、永不漂。凡『旧版有病』之数断言一律改用它。
 *   而『新旧同一份数据逐位对读』（叔向 DOM 零影响）仍须同一份数据，故仍用上面的『旧码＋今数据』源端——二者各有其用，不混。 */
const GIT_MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
function srvGit(ref) {
  const cache = new Map();
  return new Promise((res, rej) => {
    const s = http.createServer((rq, rs) => {
      let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]);
      if (u === "/") u = "/index.html";
      const ct = GIT_MIME[path.extname(u).toLowerCase()] || "application/octet-stream";
      let buf = cache.get(u);
      if (buf === undefined) {
        try { buf = execFileSync("git", ["show", ref + ":site" + u], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }); } catch (e) { buf = null; }
        cache.set(u, buf);
      }
      if (buf === null) { rs.writeHead(404); rs.end(); return; }
      rs.writeHead(200, { "Content-Type": ct }); rs.end(buf);
    });
    s.on("error", rej); s.listen(0, "127.0.0.1", () => res(s));
  });
}
/* ---- r61-Q 校基线：规模之数一律取自 site/data/*.json，不写死（裁二百二十五 ②㈠）；期望另路读文件，不取自被测页 ---- */
const readJSON = (n) => JSON.parse(fs.readFileSync(path.join(SITE, "data", n + ".json"), "utf8"));
const EP = readJSON("event_people"), EVS = readJSON("events"), PASS = readJSON("passages"), PEOPLE = readJSON("people");
const ROLE_ROWS = EP.filter(l => l.role_in_event);
/* ---- r61-T 校基线（裁二百二十七 三3、裁二百二十五 ②㈠）：暂绿之写死数改另路之期 ----
 *   旧：「含成对 `**` 者 51 行 118 处」「E295／P_CHUWU 486 字（全库最长）」「叔向 9 卡」——俱 r52 当日之数，至今恰等故绿。
 *   新：俱自 site/data/event_people.json 另路算（Node 端，不取被测页）：
 *     · 星号成对之口径照 conventions §7 ⚑H ⑤款（只计长度恰为 2 之游程，顺序两两成对）——同 vision_r51 之 starScan；
 *     · 「全库最长」改为可证之断：其值之长＝json 中 role_in_event 最长者之长，且最长者恰为 E295／P_CHUWU；
 *     · 叔向之卡数＝json 中 P_SHUXIANG 之挂链行数。
 *   ★ 测具互验：同一算法施于 r52 提交 3b5f38a 当日之 event_people.json，须复现 51／118、486、9（对该提交之断言，不漂）。 */
const starPairsH = (s) => Math.floor([...(s || "").matchAll(/\*+/g)].filter(m => m[0].length === 2).length / 2);
function roleScan(ep) {
  let starRows = 0, starPairs = 0, longest = null;
  for (const l of ep) {
    const v = l.role_in_event || ""; if (!v) continue;
    const n = starPairsH(v); if (n) { starRows++; starPairs += n; }
    if (!longest || v.length > longest.len) longest = { len: v.length, eid: l.event_id, pid: l.person_id };
  }
  return { starRows, starPairs, longest, sx: ep.filter(l => l.person_id === "P_SHUXIANG").length };
}
const ROLE_SCAN = roleScan(EP);
const ROLE_R52_REF = "3b5f38a";
const ROLE_R52 = roleScan(JSON.parse(execFileSync("git", ["show", ROLE_R52_REF + ":site/data/event_people.json"], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString("utf8")));
const SX_N = ROLE_SCAN.sx, CHUWU_LEN = ROLE_SCAN.longest ? ROLE_SCAN.longest.len : null;
const ROLE_GATE = 60;   // 胶囊门槛（§一 CASES 以 60 字不分、61 字分钉住其界，故『分否』可自长度另路推出）
const BT_PAIR = /`[^`]+`/g, STAR_PAIR = /\*\*[^*]+\*\*/g;

/* ---------- 页面内：全库 694 行逐行经生产之 roleParts()／mdBoldFrag() 渲出 ----------
 * 不靠逐人逐卡展开——那既慢又必漏；直调生产函数覆盖面反而是全的。 */
const SWEEP = `() => {
  const restore = (el) => [...el.childNodes].map(n => n.nodeType === 3 ? n.textContent
      : (n.nodeName === "STRONG" ? "**" + n.textContent + "**" : "?" + n.textContent)).join("");
  const out = { n: 0, kept: 0, clipped: 0, starRows: 0, starPairs: 0, bad: [], heads: [] };
  for (const l of DATA.event_people) {
    const raw = l.role_in_event;
    if (!raw) continue;
    out.n++;
    const rp = roleParts(raw);
    const pairs = mdBoldMarks(raw).length / 2;
    if (pairs) { out.starRows++; out.starPairs += pairs; }
    const key = l.event_id + "/" + l.person_id;
    // 胶囊
    const chip = document.createElement("span");
    chip.appendChild(mdBoldFrag(rp.head));
    const headBack = restore(chip);
    // 卡内全文（只分者出）
    let fullBack = null;
    if (rp.clipped) {
      const note = document.createElement("p");
      note.appendChild(mdBoldFrag(rp.full));
      fullBack = restore(note);
    }
    if (rp.clipped) {
      out.clipped++;
      if (fullBack !== raw) out.bad.push({ key, why: "卡内全文往返不等", got: String(fullBack).slice(0, 60) });
      const bare = rp.head.slice(0, -1);                 // 去尾之「…」
      if (headBack !== rp.head) out.bad.push({ key, why: "胶囊往返不等", got: headBack.slice(0, 60) });
      if (raw.indexOf(bare) !== 0) out.bad.push({ key, why: "首句非原值之前缀", got: bare.slice(0, 60) });
      if (!bare.length) out.bad.push({ key, why: "首句为空" });
      if (chip.textContent.indexOf("*") >= 0) out.bad.push({ key, why: "胶囊内残留裸星号", got: chip.textContent.slice(0, 60) });
      if (rp.head.length > 62) out.bad.push({ key, why: "胶囊逾限", got: String(rp.head.length) });
      out.heads.push(rp.head.length);
    } else {
      out.kept++;
      if (rp.head !== raw || rp.full !== raw) out.bad.push({ key, why: "不分者之值被动过" });
      if (headBack !== raw) out.bad.push({ key, why: "不分者往返不等", got: headBack.slice(0, 60) });
      // 零影响之机械之证：不含成对星号者，胶囊须是**恰好一个文本节点**（与旧版 textContent 全等）
      if (!mdBoldMarks(raw).length && !(chip.childNodes.length === 1 && chip.firstChild.nodeType === 3)) {
        out.bad.push({ key, why: "无星号之值未落成单一文本节点", got: String(chip.childNodes.length) });
      }
    }
  }
  out.heads.sort((a, b) => a - b);
  return out;
}`;

/* 量一页时间线之全部 role-chip：右缘越卡即溢出；summary 之 scrollWidth>clientWidth 亦是溢出 */
const MEASURE = `() => {
  const out = [];
  for (const d of document.querySelectorAll("details.event")) {
    const chip = d.querySelector(".role-chip");
    if (!chip) continue;
    const sm = d.querySelector("summary");
    const cb = chip.getBoundingClientRect(), db = d.getBoundingClientRect();
    out.push({
      eid: d.dataset.eid,
      text: chip.textContent,
      chipW: +cb.width.toFixed(2), chipH: +cb.height.toFixed(2),
      dx: +(cb.left - db.left).toFixed(2), dy: +(cb.top - db.top).toFixed(2),
      over: +(cb.right - db.right).toFixed(2),
      smOver: sm.scrollWidth - sm.clientWidth,
      docOver: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      chipHTML: chip.outerHTML,
    });
  }
  return out;
}`;

/* P_CHUWU（非主角，`#/p/P_CHUWU/timeline` 走不进去）：以生产之 renderTimeline() 直驱，渲进可见容器 */
const DRIVE_CHUWU = `() => { state.person = "P_CHUWU"; renderTimeline(); return true; }`;

(async () => {
  const pw = require("playwright");
  console.log("=== r52 走查门：role-chip 溢出件（裁五甲＋丙、裁六②）===\n");

  /* ================= §〇 锚定与前提 ================= */
  console.log("【〇】旧版源端之锚与对读之前提");
  const oldApp = gitShow("site/app.js"), oldCss = gitShow("site/styles.css");
  const OLD_REF_FULL = execFileSync("git", ["rev-parse", OLD_REF], { cwd: ROOT }).toString().trim();
  const oldRoleParts = (String(oldApp).match(/roleParts/g) || []).length;
  const oldNowrap = /\.event \.role-chip \{[^}]*white-space: nowrap/.test(String(oldCss));
  const oldMaxW = /\.event \.role-chip \{[^}]*max-width/.test(String(oldCss));
  console.log("  旧版源端锚定 " + OLD_REF + "（" + OLD_REF_FULL + "）");
  console.log("    · 其 app.js 内 roleParts 出现 " + oldRoleParts + " 次");
  console.log("    · 其 styles.css 之 .event .role-chip " + (oldNowrap ? "仍是 white-space: nowrap" : "已非 nowrap") + "、" + (oldMaxW ? "已有 max-width" : "无 max-width"));
  if (oldRoleParts !== 0 || !oldNowrap || oldMaxW) {
    throw new Error("锚定失效：旧版源端 " + OLD_REF + " 已含本件之改（roleParts " + oldRoleParts
      + " 处／nowrap " + oldNowrap + "／max-width " + oldMaxW + "），「旧版」等于新版，两版对读与§三反证俱无意义"
      + "——请核 OLD_REF（应为 r52 改动前之 main）。");
  }
  console.log("  → 对读之前提成立\n");

  const sNew = await srv(SITE, null);
  const sOld = await srv(SITE, { "/app.js": oldApp, "/styles.css": oldCss });
  const NEW = "http://127.0.0.1:" + sNew.address().port;
  const OLD = "http://127.0.0.1:" + sOld.address().port;

  const browser = await pw.chromium.launch();
  const errs = [];
  const mkPage = async (base, width) => {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) { } });
    const p = await ctx.newPage();
    p.on("pageerror", e => errs.push((base === NEW ? "新版" : "旧版") + "@" + width + ":" + e.message));
    await p.goto(base + "/#/p/P_KONGZI/timeline", { waitUntil: "load" });
    await p.waitForTimeout(1200);
    return { ctx, p };
  };
  const goPerson = async (p, base, pid) => {
    await p.goto(base + "/#/p/" + pid + "/timeline", { waitUntil: "load" });
    await p.waitForTimeout(700);
  };

  const n1440 = await mkPage(NEW, 1440);
  const n375 = await mkPage(NEW, 375);

  /* ================= §一 roleParts 纯函数断言 ================= */
  console.log("【一】roleParts() 切分断言（判据＝首句，门槛 60 字，与裁六③所命编者当写者同一条）");
  const A = "甲".repeat(70), B = "乙".repeat(70);
  const CASES = [
    // [入串, 期望 head, 期望 clipped]
    ["", "", false],
    [null, "", false],
    ["谋主", "谋主", false],
    ["甲".repeat(60), "甲".repeat(60), false],                       // 恰在门槛上：不分
    ["甲".repeat(61), "甲".repeat(60) + "…", true],                  // 逾门槛一字：分，无句读即硬截
    ["所葬者。" + A, "所葬者…", true],                                // 首句三字，短语入胶囊
    ["所葬者；" + A, "所葬者…", true],                                // 「；」亦算句读
    ["问曰：何如？" + A, "问曰：何如…", true],                        // 「？」亦算；尾标点去之
    ["。" + A, ("。" + A).slice(0, 60) + "…", true],                  // 句读在首位：不取（否则空胶囊），退回硬截
    [A + "。乙", "甲".repeat(60) + "…", true],                        // 首句逾门槛：硬截至门槛
    ["逗，顿、之属不算句" + A, ("逗，顿、之属不算句" + A).slice(0, 60) + "…", true],   // 逗顿不算句读，故硬截
    ["前**粗体**后。" + A, "前**粗体**后…", true],                     // 成对星号完整落在首句内：照出
    ["**" + A + "**。乙", "…", true],                                 // 退化之防：见下条另断
  ];
  const r1 = await n1440.p.evaluate((cases) => cases.map(([inp]) => {
    const rp = roleParts(inp);
    return { head: rp.head, clipped: rp.clipped, full: rp.full };
  }), CASES.map(c => [c[0]]));
  CASES.forEach(([inp, head, clipped], i) => {
    const g = r1[i];
    const lab = "「" + (inp === null ? "null" : (String(inp).length > 24 ? String(inp).slice(0, 18) + "…（" + String(inp).length + "字）" : inp)) + "」";
    if (i === CASES.length - 1) return;   // 末条另断
    ok(g.head === head, lab + " 首句", JSON.stringify(g.head.length > 30 ? g.head.slice(0, 26) + "…" : g.head));
    ok(g.clipped === clipped, lab + " 分否", String(g.clipped));
  });
  const deg = r1[CASES.length - 1];
  ok(deg.clipped === true && deg.head.length > 1 && deg.head.indexOf("…") === deg.head.length - 1,
    "退化之防：整串首即逾限之粗体时不出空胶囊", "head 长 " + deg.head.length);
  const rFull = await n1440.p.evaluate(() => {
    const s = "所葬者。" + "甲".repeat(70);
    const rp = roleParts(s);
    return { same: rp.full === s, headIsPrefix: s.indexOf(rp.head.slice(0, -1)) === 0 };
  });
  ok(rFull.same, "`full` 一字不动，即原值本身（卡内所载者是全文，不是余段）");
  ok(rFull.headIsPrefix, "`head` 去尾「…」后是原值之真前缀（不改字、不补字）");

  /* ================= §二 全库 694 行复扫 ================= */
  console.log("\n【二】全库 `event_people.role_in_event` 逐行复扫（往返还原、前缀、裸星号、零影响）");
  const sw = await n1440.p.evaluate(eval("(" + SWEEP + ")"));
  ok(sw.bad.length === 0, "逐行断言零不符（往返还原逐字全等／首句为真前缀／无裸星号／不分者单一文本节点）",
    sw.bad.length ? JSON.stringify(sw.bad.slice(0, 4)) : "零不符（" + sw.n + " 行）");
  ok(sw.n === ROLE_ROWS.length, "`role_in_event` 非空行数＝event_people.json 中该栏非空行数（旧写死 694〔对任务书 §五实读值〕，r61-Q 同步；期望另路读文件）", sw.n + " ／ " + ROLE_ROWS.length);
  const wantClip = ROLE_ROWS.filter(l => l.role_in_event.length > ROLE_GATE).length;
  ok(sw.kept === ROLE_ROWS.length - wantClip && sw.clipped === wantClip, "不分 " + (ROLE_ROWS.length - wantClip) + " 行（DOM 与旧版全等）／分 " + wantClip + " 行（期望＝以 " + ROLE_GATE + " 字门槛自 json 另路切出；旧写死 591／103，r61-Q 同步）", sw.kept + " / " + sw.clipped);
  ok(ROLE_R52.starRows === 51 && ROLE_R52.starPairs === 118 && ROLE_R52.longest.len === 486 && ROLE_R52.longest.eid === "E295" &&
     ROLE_R52.longest.pid === "P_CHUWU" && ROLE_R52.sx === 9,
     "〔测具互验〕另路之 roleScan 施于 r52 提交 " + ROLE_R52_REF + " 当日之 event_people.json，复现 r52 所立之 51／118、E295／P_CHUWU 486 字、叔向 9 行",
     JSON.stringify(ROLE_R52));
  ok(sw.starRows === ROLE_SCAN.starRows && sw.starPairs === ROLE_SCAN.starPairs, "含成对 `**` 者 " + ROLE_SCAN.starRows + " 行 " + ROLE_SCAN.starPairs + " 处（期望另路自 event_people.json 算；旧写死 51／118，r52 当日之数）",
    sw.starRows + " 行 " + sw.starPairs + " 处");
  console.log("    首句长 最短 " + sw.heads[0] + " / 中位 " + sw.heads[sw.heads.length >> 1] + " / 最长 " + sw.heads[sw.heads.length - 1] + " 字（含尾「…」）");

  /* ================= §三 溢出实测（口径六①）================= */
  console.log("\n【三】溢出实测：1440／375 两宽，38 主角逐卡量（getBoundingClientRect ＋ scrollWidth，不以截图代之）");
  const PROTOS = await n1440.p.evaluate(() => PROTAGONISTS.map(p => p.id));
  const PROTO_N = PEOPLE.filter(p => Number(p.is_protagonist) === 1).length;
  ok(PROTOS.length === PROTO_N, "主角 " + PROTO_N + " 人＝people.json 中 is_protagonist=1 之数（全数逐页量，不抽样；旧写死 38，r61-Q 改取 json）", PROTOS.length + " ／ " + PROTO_N);

  const scan = async (p, base, width) => {
    const bad = [], stat = { chips: 0, pages: 0 };
    for (const pid of PROTOS) {
      await goPerson(p, base, pid);
      const rows = await p.evaluate(eval("(" + MEASURE + ")"));
      stat.pages++; stat.chips += rows.length;
      for (const r of rows) {
        if (r.over > 0.5 || r.smOver > 0 || r.docOver > 0) bad.push({ pid, eid: r.eid, over: r.over, smOver: r.smOver, docOver: r.docOver, len: r.text.length });
      }
    }
    return { bad, stat };
  };
  for (const [p, W] of [[n1440.p, 1440], [n375.p, 375]]) {
    const { bad, stat } = await scan(p, NEW, W);
    ok(bad.length === 0, W + "px：38 页 " + stat.chips + " 枚 role-chip 无一溢出（卡右缘／summary.scrollWidth／页面横向三处俱不越）",
      bad.length ? JSON.stringify(bad.slice(0, 5)) : "零溢出");
  }

  /* 口径六①点名之最长值：E295／P_CHUWU，486 字。其人非主角，公开页走不进去，故以生产 renderTimeline() 直驱 */
  const chuwuLen = await n1440.p.evaluate(() =>
    (DATA.event_people.find(l => l.event_id === "E295" && l.person_id === "P_CHUWU") || {}).role_in_event.length);
  ok(chuwuLen === CHUWU_LEN && ROLE_SCAN.longest.eid === "E295" && ROLE_SCAN.longest.pid === "P_CHUWU",
     "`E295`／`P_CHUWU` 之 `role_in_event` 实测 " + CHUWU_LEN + " 字，且为全库最长（期望另路自 event_people.json 取最长者；旧写死 486）",
     String(chuwuLen) + "（json 最长者 " + JSON.stringify(ROLE_SCAN.longest) + "）");
  for (const [p, W] of [[n1440.p, 1440], [n375.p, 375]]) {
    await goPerson(p, NEW, "P_KONGZI");
    await p.evaluate(eval("(" + DRIVE_CHUWU + ")"));
    await p.waitForTimeout(300);
    const rows = await p.evaluate(eval("(" + MEASURE + ")"));
    const r = rows.find(x => x.eid === "E295");
    ok(!!r, W + "px：`E295` 卡已渲入可见时间线容器（生产 renderTimeline 直驱）", r ? "胶囊 " + r.chipW + "×" + r.chipH : "未渲出");
    ok(r && r.over <= 0.5 && r.smOver <= 0 && r.docOver <= 0,
      W + "px：" + CHUWU_LEN + " 字之值**不溢出其容器**（越卡右缘 " + (r ? r.over : "?") + "px，summary 溢出 " + (r ? r.smOver : "?") + "，页面横向溢出 " + (r ? r.docOver : "?") + "）",
      r ? "胶囊实载 " + r.text.length + " 字" : "");
    // 同一页上，486 字之全文须在卡内可见（不是丢了）
    const inCard = await p.evaluate(() => {
      const d = [...document.querySelectorAll("details.event")].find(x => x.dataset.eid === "E295");
      if (!d) return null;
      d.open = true;
      const note = d.querySelector(".evt-role-note");
      const raw = DATA.event_people.find(l => l.event_id === "E295" && l.person_id === "P_CHUWU").role_in_event;
      /* ★ r61-Q 补测具（裁二百二十五，2026-10-13；非放判据）：往返还原原只认文本与 STRONG，余者记「?」。
       *   r53（27717c3，2026-09-26，后于本门立于 09-20）起，反引号记法渲为 <code class="md-name">——
       *   486 字之值内有反引号 8 对，故今卡内有 8 枚 <code>，旧还原法遇之记「?」而红。
       *   辨：此是**测具未随 r53 之记法**，非站之退（卡内全文逐字俱在，只是反引号二字变成了 <code> 的包裹）。
       *   治：还原法增认 `CODE.md-name` → 反引号包裹，**其余一概仍记「?」**——故仍是逐字全等之断，一字不松；
       *   且下以〔反证〕注入二病（<code> 换成别的元素／少一字），各须使还原不等。 */
      const restore = (nt) => [...nt.childNodes].filter(n => !(n.nodeType === 1 && n.classList && n.classList.contains("evt-role-label")))
        .map(n => n.nodeType === 3 ? n.textContent
          : (n.nodeName === "STRONG" ? "**" + n.textContent + "**"
            : (n.nodeName === "CODE" && n.classList.contains("md-name") ? "`" + n.textContent + "`" : "?"))).join("");
      const back = note ? restore(note) : null;
      let proofSwap = null, proofDrop = null, codeN = 0;
      if (note) {
        codeN = note.querySelectorAll("code.md-name").length;
        const c1 = note.cloneNode(true), cd = c1.querySelector("code.md-name");
        if (cd) { const sp = document.createElement("span"); sp.textContent = cd.textContent; cd.replaceWith(sp); proofSwap = restore(c1) === raw; }
        const c2 = note.cloneNode(true), tn = [...c2.childNodes].find(n => n.nodeType === 3 && n.textContent.length > 3);
        if (tn) { tn.textContent = tn.textContent.slice(0, -1); proofDrop = restore(c2) === raw; }
      }
      return { has: !!note, label: note ? note.querySelector(".evt-role-label").textContent : "", same: back === raw, visible: note ? note.getBoundingClientRect().width > 0 : false, codeN, proofSwap, proofDrop, rawPairs: (raw.match(/`[^`]+`/g) || []).length };
    });
    ok(inCard && inCard.has && inCard.same && inCard.visible,
      W + "px：" + CHUWU_LEN + " 字之全文落卡内「" + (inCard ? inCard.label : "") + "」一节，往返还原逐字全等且可见（还原法已认 <code.md-name>，见上注）", inCard ? "卡内 <code> " + inCard.codeN + " 枚／值内反引号 " + inCard.rawPairs + " 对" : "未见该节");
    ok(inCard && inCard.codeN === inCard.rawPairs && inCard.codeN > 0, W + "px：" + CHUWU_LEN + " 字之值内反引号对数（" + (inCard && inCard.rawPairs) + "，自 DATA 值数）＝卡内 <code.md-name> 枚数——不多不少", inCard ? String(inCard.codeN) : "");
    ok(inCard && inCard.proofSwap === false && inCard.proofDrop === false, W + "px：〔反证〕<code> 换成 <span> 或卡内少一字，还原须不等（测具仍咬得住）", inCard ? "换元素→" + inCard.proofSwap + "；少一字→" + inCard.proofDrop + "（false＝已红）" : "");
  }

  /* ★ 按类反证：同一套量法施于**旧版**须当场红——否则跑绿只证明脚本会打印 ✓ */
  console.log("\n【三之二】按类反证：同一量法施于旧版（" + OLD_REF + "）须测出溢出，否则本门测的不是溢出");
  const o1440 = await mkPage(OLD, 1440);
  const o375 = await mkPage(OLD, 375);
  /* r61-Q：『旧版有病』之数断言改取旧版整站（旧码＋其当日数据，同一提交 ae3e800 之 site/ 全取），数即定于当日、不随今日之库漂。
   *   旧：旧码配今数据，1440px 得 19、375px 得 25（库增而漂）；新：旧版整站，复得 2026-09-20 实读之 18／24。 */
  const sOldD = await srvGit(OLD_REF);
  const OLDD = "http://127.0.0.1:" + sOldD.address().port;
  const oD1440 = await mkPage(OLDD, 1440);
  const oD375 = await mkPage(OLDD, 375);
  const dOld = await oD1440.p.evaluate(() => ({ ep: DATA.event_people.length, ev: DATA.events.length, ps: DATA.passages.length }));
  console.log("  · 旧版整站（" + OLD_REF + " 之 site/ 全取）自带之数据：event_people " + dOld.ep + "／events " + dOld.ev + "／passages " + dOld.ps + "（即 r52 当日之 694／265／509）");
  ok(dOld.ep === 694 && dOld.ev === 265 && dOld.ps === 509, "旧版整站之数据＝r52 当日基线 694／265／509（钉住旧版数据；此三数是对该提交的断言，不随今日之库漂）", dOld.ep + "／" + dOld.ev + "／" + dOld.ps);
  for (const [p, W, wantKz, wantSx] of [[oD1440.p, 1440, 18, 0], [oD375.p, 375, 24, 8]]) {
    const res = {};
    for (const pid of ["P_KONGZI", "P_SHUXIANG"]) {
      await goPerson(p, OLDD, pid);
      const rows = await p.evaluate(eval("(" + MEASURE + ")"));
      res[pid] = rows.filter(r => r.over > 0.5).length;
    }
    ok(res.P_KONGZI === wantKz, "旧版（旧码＋其当日数据）" + W + "px 孔子 25 行溢出其 " + wantKz + "（2026-09-20 实读基线；r61-Q 改取旧版整站，旧版连其当日数据一并取）", String(res.P_KONGZI));
    ok(res.P_SHUXIANG === wantSx, "旧版 " + W + "px 叔向 9 行溢出其 " + wantSx
      + (wantSx ? "（★ 正例自身亦是甲之受害者，故『逐像素相同』一语在 375px 下不成立，见交付文档验收偏差上报）" : "（1440px 下本不溢出）"),
      String(res.P_SHUXIANG));
  }

  /* ================= §四 叔向零影响（新旧两版对读）================= */
  console.log("\n【四】叔向零影响之证（新旧两源端对读，同一份 site/data/）");
  const grab = `() => {
    const out = [];
    for (const d of document.querySelectorAll("details.event")) {
      const chip = d.querySelector(".role-chip");
      const body = d.querySelector(".event-body");
      const db = d.getBoundingClientRect();
      const cb = chip ? chip.getBoundingClientRect() : null;
      out.push({
        eid: d.dataset.eid,
        chipHTML: chip ? chip.outerHTML : null,
        bodyHTML: body ? body.outerHTML : null,
        hasNote: !!d.querySelector(".evt-role-note"),
        sum: (() => { const sp = d.querySelector(".event-body > p"); return sp ? sp.outerHTML : null; })(),
        rect: cb ? [+(cb.left - db.left).toFixed(2), +(cb.top - db.top).toFixed(2), +cb.width.toFixed(2), +cb.height.toFixed(2)] : null,
      });
    }
    return out;
  }`;
  for (const [np, op, W] of [[n1440.p, o1440.p, 1440], [n375.p, o375.p, 375]]) {
    await goPerson(np, NEW, "P_SHUXIANG"); await goPerson(op, OLD, "P_SHUXIANG");
    const a = await op.evaluate(eval("(" + grab + ")"));
    const b = await np.evaluate(eval("(" + grab + ")"));
    ok(a.length === SX_N && b.length === SX_N, W + "px：叔向两版各 " + SX_N + " 卡（期望另路自 event_people.json；旧写死 9）", a.length + " / " + b.length);
    /* ★ r61-Q 校基线·二项期望差异（裁二百二十五 ①，2026-10-13；先查明差在何处，不放判据）
     *   本条原断言『叔向 9 行胶囊与卡体 outerHTML 逐位相同』。今实测 9 卡中 4 卡（E206／E210／E221／E271）卡体不同，
     *   逐处剖开，差异**恰为 r53（27717c3，2026-09-26「⚑H 扩施七栏＋反引号一路」）所致二项、别无他项**：
     *   ① 反引号记法：旧版 `X` 为纯文字；今版 `<code class="md-name">X</code>`。
     *      旧版 X；今版 Y；其由 r53。E206 卡体之反引号**不在其摘要里**（摘要 0 对），而在其所挂引文之 modern_note 注文中（6 对）——
     *      故『E206 无反引号』仅指摘要，卡体内有；E271＝摘要 5 对＋引文注 8 对；E221＝20 对。
     *   ② 事件摘要之成对星号：旧版摘要里 `**x**` 为裸星号；今版 `<strong>x</strong>`（⚑H 扩施至 events.summary）。
     *      旧版 X；今版 Y；其由 r53。惟 E210 摘要含一对（`**本条为晏婴、叔向共用事件**`）。
     *   期望之数皆另路自 events.json／passages.json 数出（不读 DOM）：每卡 <code> 枚数＝摘要与其引文注文之反引号对数之和；
     *   摘要 <strong> 枚数＝摘要内成对星号数。
     *   对读之法：把今版卡体**逆施**此二项（<code>→反引号；仅摘要段内 <strong>→**），须与旧版**逐位全等**；逆施之外一字之差俱红。
     *   〔胶囊（.role-chip）不在差异之列〕仍断逐位相同。 */
    const sxExpect = (eid) => {
      const e = EVS.find(x => x.id === eid);
      const codeN = (e.summary.match(BT_PAIR) || []).length + PASS.filter(q => q.event_id === eid).reduce((n, q) => n + ((q.modern_note || "").match(BT_PAIR) || []).length, 0);
      return { codeN, sumStrong: (e.summary.match(STAR_PAIR) || []).length };
    };
    const sxInverse = (html) => {
      if (html == null) return html;
      let h = html.replace(/<code class="md-name">([\s\S]*?)<\/code>/g, (_, x) => "`" + x + "`");
      const i = h.indexOf('<p style="margin: 0px;">'), j = i < 0 ? -1 : h.indexOf("</p>", i);
      if (i >= 0 && j > i) h = h.slice(0, i) + h.slice(i, j).replace(/<strong>/g, "**").replace(/<\/strong>/g, "**") + h.slice(j);
      return h;
    };
    const domDiff = b.filter((x, i) => x.chipHTML !== a[i].chipHTML || sxInverse(x.bodyHTML) !== a[i].bodyHTML || x.eid !== a[i].eid);
    ok(domDiff.length === 0, W + "px：叔向 " + SX_N + " 行胶囊 outerHTML 逐位相同；卡体逆施『①<code>→反引号、②摘要内 <strong>→**』二项期望差异后与旧版逐位全等（DOM 零影响之证；逆施之外零差异）",
      domDiff.length ? JSON.stringify(domDiff.slice(0, 2).map(x => x.eid)) : "零差异");
    const nDiffCards = b.filter((x, i) => x.bodyHTML !== a[i].bodyHTML).map(x => x.eid);
    const sxBad = b.filter(x => {
      const ex = sxExpect(x.eid);
      const codeN = (x.bodyHTML.match(/<code class="md-name">/g) || []).length;
      const sumStrong = ((x.sum || "").match(/<strong>/g) || []).length;
      return codeN !== ex.codeN || sumStrong !== ex.sumStrong;
    }).map(x => x.eid);
    ok(sxBad.length === 0, W + "px：期望之核——每卡 <code.md-name> 枚数＝摘要＋引文注文之反引号对数（自 json 另路数）、摘要 <strong> 枚数＝摘要成对星号数",
      sxBad.length ? JSON.stringify(sxBad) : "九卡俱合；有差之卡 " + nDiffCards.join("、"));
    { /* 〔反证〕r56 款：对今版之真卡注入同型之病，逆施后对读须红 */
      const k = b.findIndex(x => /<code class="md-name">/.test(x.bodyHTML)), k2 = b.findIndex(x => /<strong>/.test(x.sum || ""));
      const r1 = sxInverse(b[k].bodyHTML.replace('<code class="md-name">', '<code class="md-nam">')) !== a[k].bodyHTML;
      const r2 = sxInverse(b[k].bodyHTML.replace("</p>", "X</p>")) !== a[k].bodyHTML;
      const r3 = sxInverse(b[k2].bodyHTML.replace("<strong>", "<strong>Y")) !== a[k2].bodyHTML;
      ok(r1 && r2 && r3, W + "px：〔反证〕<code> 类名改一字／卡体多一字／摘要粗体内多一字——逆施后对读须各自当场红（r56 款）", "类名→" + r1 + "；多字→" + r2 + "；粗体内→" + r3 + "（true＝已红）");
    }
    ok(b.every(x => !x.hasNote), W + "px：叔向 " + SX_N + " 行一律不出卡内「所任之役」一节（其值本短，不当受任何影响）");
    const rectDiff = b.filter((x, i) => JSON.stringify(x.rect) !== JSON.stringify(a[i].rect));
    if (W === 1440) {
      ok(rectDiff.length === 0, "1440px：叔向 " + SX_N + " 行胶囊盒矩形（相对卡之 x/y/宽/高）**逐位相同**（像素零影响之证）",
        rectDiff.length ? JSON.stringify(rectDiff.slice(0, 3).map(x => [x.eid, x.rect, a.find(y => y.eid === x.eid).rect])) : "零差异");
    } else {
      /* ★ 375px 下两版盒矩形**本就不可能相同**，且不同正是本件之目的——
       *   旧版此宽下叔向 9 行溢出其 8（§三之二实测），新版不溢出。
       *   故此处不断「相同」，改断「新版不溢出且文字一字未少」，并把差异逐行打印留痕。 */
      console.log("    375px 叔向盒矩形两版之差（旧→新，x/y/宽/高）：");
      for (const x of b) {
        const y = a.find(z => z.eid === x.eid);
        console.log("      " + x.eid + "  " + JSON.stringify(y.rect) + " → " + JSON.stringify(x.rect));
      }
      ok(rectDiff.length === 8 || rectDiff.length === 9,
        "375px：叔向盒矩形两版有差 " + rectDiff.length + " 行 —— **此差即甲之治**（旧版此宽下 9 行溢出其 8），不是回归；DOM 仍逐位相同（上条已断）",
        "详见交付文档「验收偏差上报」");
    }
  }

  /* ================= §五 未越界之证 ================= */
  console.log("\n【五】未越界之证");
  const untouched = await n1440.p.evaluate(() => {
    const evt = DATA.events.find(e => e.id === "E146");
    const host = document.createElement("div"); host.appendChild(eventQuotesFrag(evt));
    const bq = host.querySelector('blockquote.quote[data-qid="Q442"]');
    return { text: bq.querySelector("p.q-text").outerHTML, swap: !!bq.querySelector(".q-diplo-toggle") };
  });
  const untouchedOld = await o1440.p.evaluate(() => {
    const evt = DATA.events.find(e => e.id === "E146");
    const host = document.createElement("div"); host.appendChild(eventQuotesFrag(evt));
    const bq = host.querySelector('blockquote.quote[data-qid="Q442"]');
    return { text: bq.querySelector("p.q-text").outerHTML, swap: !!bq.querySelector(".q-diplo-toggle") };
  });
  ok(untouched.text === untouchedOld.text, "`quote_original` 一路一字未碰：Q442 引文正文两版 outerHTML 全等（r44d 之训）", untouched.text.length + " 字符");
  ok(untouched.swap && untouchedOld.swap, "释文原貌切换钮两版俱在");
  /* ★ r61-Q 校基线·类㈡『历史断言』（裁二百二十五 ②㈡，2026-10-13）：
   *   原：以今日 DATA 之行数断『数据一字未动：694／265／509』。此是**对 r52 那一笔提交（3b5f38a）之断言**，在今 HEAD 上本就不该成立
   *   （库已增至 871／314／628）；若改成今数即成『r52 之后数据未动』，假。
   *   新：不改其数，改书为对其提交之断言——① 该提交自身未动 data/ 与 site/data/（git diff --name-only 3b5f38a^ 3b5f38a）；
   *        ② 该提交时点之 site/data 行数仍是 694／265／509（git show 3b5f38a:site/data/…）。
   *   其义（『r52 件一字未动数据』）不变，其数不漂。 */
  const R52 = "3b5f38a";
  const touched = execFileSync("git", ["diff", "--name-only", R52 + "^", R52, "--", "data", "site/data"], { cwd: ROOT }).toString().trim();
  ok(touched === "", "数据一字未动（对 r52 提交 " + R52 + " 之断言）：该提交未触 data/ 与 site/data/（裁六①）", touched ? "触及：" + touched : "git diff --name-only 无输出");
  const cnt52 = ["event_people", "events", "passages"].map(n => JSON.parse(execFileSync("git", ["show", R52 + ":site/data/" + n + ".json"], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString()).length);
  ok(cnt52[0] === 694 && cnt52[1] === 265 && cnt52[2] === 509, "该提交时点 site/data 行数：event_people 694／events 265／passages 509（裁六①；此三数是对该提交的断言，不随今日之库漂）", cnt52.join(" / "));
  { /* 〔反证〕r56 款：本断言咬得住——换一个确实动过 site/data 的提交，同法须得非空 */
    const other = execFileSync("git", ["log", "-1", "--format=%h", "--", "site/data/passages.json"], { cwd: ROOT }).toString().trim();
    const t2 = execFileSync("git", ["diff", "--name-only", other + "^", other, "--", "data", "site/data"], { cwd: ROOT }).toString().trim();
    ok(t2 !== "", "〔反证〕换用动过 site/data 之提交 " + other + "，同一断言法须得非空（即会红）", t2.split("\n")[0] || "★ 空：量具作假");
  }
  ok(errs.length === 0, "两版四页零 pageerror", errs.slice(0, 3).join(" | ") || "零");

  for (const c of [n1440, n375, o1440, o375, oD1440, oD375]) await c.ctx.close();
  await browser.close(); sNew.close(); sOld.close(); sOldD.close();

  console.log("\n=== 合计 " + checks + " 项，FAIL " + fails + " ===");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
