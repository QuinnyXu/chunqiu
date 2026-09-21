/* 经纬春秋 · r52 走查门：role-chip 溢出件（裁五甲＋丙、裁六②）
 *
 * 本门要回答四个问题，一个都不许用「截图看着不挤了」来答：
 *   ① **甲之改对任意长度成立**——全库最长之值（`E295`／`P_CHUWU`，486 字）在 1440／375 两宽下
 *      不溢出其容器；且不止此一值，**34 主角全部时间线卡之 role-chip 逐卡实测**，
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
  ok(sw.n === 694, "`role_in_event` 非空行数 694（对任务书 §五实读值）", String(sw.n));
  ok(sw.kept === 591 && sw.clipped === 103, "不分 591 行（DOM 与旧版全等）／分 103 行", sw.kept + " / " + sw.clipped);
  ok(sw.starRows === 51 && sw.starPairs === 118, "含成对 `**` 者 51 行 118 处（⚑H②款所登记之本栏之数，对任务书 §五实读值）",
    sw.starRows + " 行 " + sw.starPairs + " 处");
  console.log("    首句长 最短 " + sw.heads[0] + " / 中位 " + sw.heads[sw.heads.length >> 1] + " / 最长 " + sw.heads[sw.heads.length - 1] + " 字（含尾「…」）");

  /* ================= §三 溢出实测（口径六①）================= */
  console.log("\n【三】溢出实测：1440／375 两宽，34 主角逐卡量（getBoundingClientRect ＋ scrollWidth，不以截图代之）");
  const PROTOS = await n1440.p.evaluate(() => PROTAGONISTS.map(p => p.id));
  ok(PROTOS.length === 34, "主角 34 人（全数逐页量，不抽样）", String(PROTOS.length));

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
    ok(bad.length === 0, W + "px：34 页 " + stat.chips + " 枚 role-chip 无一溢出（卡右缘／summary.scrollWidth／页面横向三处俱不越）",
      bad.length ? JSON.stringify(bad.slice(0, 5)) : "零溢出");
  }

  /* 口径六①点名之最长值：E295／P_CHUWU，486 字。其人非主角，公开页走不进去，故以生产 renderTimeline() 直驱 */
  const chuwuLen = await n1440.p.evaluate(() =>
    (DATA.event_people.find(l => l.event_id === "E295" && l.person_id === "P_CHUWU") || {}).role_in_event.length);
  ok(chuwuLen === 486, "`E295`／`P_CHUWU` 之 `role_in_event` 实测 486 字（全库最长）", String(chuwuLen));
  for (const [p, W] of [[n1440.p, 1440], [n375.p, 375]]) {
    await goPerson(p, NEW, "P_KONGZI");
    await p.evaluate(eval("(" + DRIVE_CHUWU + ")"));
    await p.waitForTimeout(300);
    const rows = await p.evaluate(eval("(" + MEASURE + ")"));
    const r = rows.find(x => x.eid === "E295");
    ok(!!r, W + "px：`E295` 卡已渲入可见时间线容器（生产 renderTimeline 直驱）", r ? "胶囊 " + r.chipW + "×" + r.chipH : "未渲出");
    ok(r && r.over <= 0.5 && r.smOver <= 0 && r.docOver <= 0,
      W + "px：486 字之值**不溢出其容器**（越卡右缘 " + (r ? r.over : "?") + "px，summary 溢出 " + (r ? r.smOver : "?") + "，页面横向溢出 " + (r ? r.docOver : "?") + "）",
      r ? "胶囊实载 " + r.text.length + " 字" : "");
    // 同一页上，486 字之全文须在卡内可见（不是丢了）
    const inCard = await p.evaluate(() => {
      const d = [...document.querySelectorAll("details.event")].find(x => x.dataset.eid === "E295");
      if (!d) return null;
      d.open = true;
      const note = d.querySelector(".evt-role-note");
      const raw = DATA.event_people.find(l => l.event_id === "E295" && l.person_id === "P_CHUWU").role_in_event;
      const back = note ? [...note.childNodes].filter(n => !(n.nodeType === 1 && n.classList && n.classList.contains("evt-role-label")))
        .map(n => n.nodeType === 3 ? n.textContent : (n.nodeName === "STRONG" ? "**" + n.textContent + "**" : "?")).join("") : null;
      return { has: !!note, label: note ? note.querySelector(".evt-role-label").textContent : "", same: back === raw, visible: note ? note.getBoundingClientRect().width > 0 : false };
    });
    ok(inCard && inCard.has && inCard.same && inCard.visible,
      W + "px：486 字之全文落卡内「" + (inCard ? inCard.label : "") + "」一节，往返还原逐字全等且可见", inCard ? "" : "未见该节");
  }

  /* ★ 按类反证：同一套量法施于**旧版**须当场红——否则跑绿只证明脚本会打印 ✓ */
  console.log("\n【三之二】按类反证：同一量法施于旧版（" + OLD_REF + "）须测出溢出，否则本门测的不是溢出");
  const o1440 = await mkPage(OLD, 1440);
  const o375 = await mkPage(OLD, 375);
  for (const [p, W, wantKz, wantSx] of [[o1440.p, 1440, 18, 0], [o375.p, 375, 24, 8]]) {
    const res = {};
    for (const pid of ["P_KONGZI", "P_SHUXIANG"]) {
      await goPerson(p, OLD, pid);
      const rows = await p.evaluate(eval("(" + MEASURE + ")"));
      res[pid] = rows.filter(r => r.over > 0.5).length;
    }
    ok(res.P_KONGZI === wantKz, "旧版 " + W + "px 孔子 25 行溢出其 " + wantKz + "（2026-09-20 实读基线）", String(res.P_KONGZI));
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
        rect: cb ? [+(cb.left - db.left).toFixed(2), +(cb.top - db.top).toFixed(2), +cb.width.toFixed(2), +cb.height.toFixed(2)] : null,
      });
    }
    return out;
  }`;
  for (const [np, op, W] of [[n1440.p, o1440.p, 1440], [n375.p, o375.p, 375]]) {
    await goPerson(np, NEW, "P_SHUXIANG"); await goPerson(op, OLD, "P_SHUXIANG");
    const a = await op.evaluate(eval("(" + grab + ")"));
    const b = await np.evaluate(eval("(" + grab + ")"));
    ok(a.length === 9 && b.length === 9, W + "px：叔向两版各 9 卡", a.length + " / " + b.length);
    const domDiff = b.filter((x, i) => x.chipHTML !== a[i].chipHTML || x.bodyHTML !== a[i].bodyHTML || x.eid !== a[i].eid);
    ok(domDiff.length === 0, W + "px：叔向 9 行胶囊与卡体 outerHTML **逐位相同**（DOM 零影响之证）",
      domDiff.length ? JSON.stringify(domDiff.slice(0, 2).map(x => x.eid)) : "零差异");
    ok(b.every(x => !x.hasNote), W + "px：叔向 9 行一律不出卡内「所任之役」一节（其值本短，不当受任何影响）");
    const rectDiff = b.filter((x, i) => JSON.stringify(x.rect) !== JSON.stringify(a[i].rect));
    if (W === 1440) {
      ok(rectDiff.length === 0, "1440px：叔向 9 行胶囊盒矩形（相对卡之 x/y/宽/高）**逐位相同**（像素零影响之证）",
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
  const meta = await n1440.p.evaluate(() => ({ ep: DATA.event_people.length, ev: DATA.events.length, ps: DATA.passages.length }));
  ok(meta.ep === 694 && meta.ev === 265 && meta.ps === 509, "数据一字未动：event_people 694／events 265／passages 509（裁六①）",
    meta.ep + " / " + meta.ev + " / " + meta.ps);
  ok(errs.length === 0, "两版四页零 pageerror", errs.slice(0, 3).join(" | ") || "零");

  for (const c of [n1440, n375, o1440, o375]) await c.ctx.close();
  await browser.close(); sNew.close(); sOld.close();

  console.log("\n=== 合计 " + checks + " 项，FAIL " + fails + " ===");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
