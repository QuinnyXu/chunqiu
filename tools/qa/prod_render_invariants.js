/* 经纬春秋 · 生产渲染不变量门（r52 裁十六立）
 * ============================================================================
 *
 * 【名之所以不从轮次】
 *   既有三本 `r43_prod_check.js`／`r44_`／`r45_` 锁的是**数据不变量**（某表若干行、
 *   某条某值之属）。数据一扩表，这些断言就得回改 N 个文件——这账本项目已经在付
 *   （r52 一轮即为 `r43_prod_check.js` 改过数，十处之一）。
 *   本门所锁者是**渲染不变量**：**不随数据变，只随 CSS/DOM 变**。故名从其所锁之物，
 *   不从立它的那一轮——它要能**常设**，日后逐条增，而不是每轮另起一本。
 *
 * 【本门之界（硬界，不得越）】
 *   ☠ **一条数据断言不得放入。** 行数、条数、总量、某 id 某值——一概不收。
 *      放入即重蹈 `r43_prod_check.js` 之覆辙，它就不能真常设。
 *   故本门**不写死任何行 id、任何表之行数**：须逐页量者，其页由跑时从
 *   `PROTAGONISTS` 取；须取「最长之值所在之页」者，其值亦由跑时于 `DATA` 内求之——
 *   数据涨了它自己跟着涨，不必回改本文件一个字。
 *   此界有**机器自证**，见 §自证（本门读自己的源码，逐条报所有数字比较）。
 *
 * 【本门所收之不变量（每条书其立条之轮与其由）】
 *   ⓵ **role-chip 不溢出**（r52 立；由：裁五甲、裁十六）
 *      `.event .role-chip` 自立条之日起即 `white-space: nowrap` 且无 `max-width`，
 *      是**为短值而设**之胶囊；r52 之前百余字之值即撑出容器（潜伏之缺陷）。
 *      r52 改为 `white-space: normal` ＋ `overflow-wrap: anywhere` ＋ `max-width: 100%`，
 *      **不取任何字数上界**。此条设防者正是「他日有人改 `.role-chip` 而未读其注」。
 *      判据取 `getBoundingClientRect()` 之右缘与 `scrollWidth <= clientWidth`，
 *      **不以截图目测代之**。覆 1440／375 两宽、全部主角页，并另取跑时求得之最长值所在之页。
 *   ⓶ **注文之 markdown 星号不裸出**（r51 ⚑H 立、r52 丙扩施；由：v1.44 §7 ⚑H ④款）
 *      已落显示层之两栏（`passages.modern_note`、`event_people.role_in_event`）
 *      其渲染须经 `mdBoldFrag()` 一路，落到屏上**不得有成对 `**` 裸出**。
 *      ★ 判据取「成对」（照 `mdBoldMarks()` 之口径）——落单之 `**` 系该函数所**有意**留下者
 *        （「落单者不入，留在文本里原样照出」），不算病，不红。
 *      ★ 此条若红，意谓**渲染层之缺**（有栏未经 `mdBoldFrag()` 一路，或该路被改断），
 *        不是「数据里多了几处星号」——它不数处数，只问「有没有一处漏到屏上」。
 *   ⓷ **六档层色之在位**（r32 立；由：design_notes §3.5／§3.5.1，色值见 site/styles.css :82 等）
 *      引文分层六档之色与左线线型，在生产 CSS 中仍绑得住。
 *      量法**不取页上恰好有没有那一层之引文**（那是数据），而是**当场造一个合式之
 *      空引文节点**入文档，读 `getComputedStyle()`——量的是 CSS 与类名之绑定本身。
 *
 * 【按类反证（本门必备，照 r51 裁二十六硬闸、r52 `vision_r52.js` §三之二之式）】
 *   三条不变量**各配一条反证**：以**同一量法**施于一个**已知会红**之对照
 *   （注入 `nowrap` 之副本／注入裸星号之节点／改掉层色之变量）。
 *   ★ 反证若测不出红，即说明本门量的不是它自称在量的东西——**当场抛错停门**，
 *     不许带病往下跑。「跑绿了事」是本轮再三所戒。
 *   ★ **反证须逐条对位**（r52 裁二十四）：⓷ 七档之反证旧法只注入 `--excav`／`--poem`／`--cinnabar`
 *     三变量，**整批见红 5 档即算过**；而 `layer-houchu`（其左线承 `--ink-soft`）与
 *     `layer-jingyi`（`border-left-color: #6E5A86`，字面量，无变量可改）**从不在注入所及之内**——
 *     此二档今日之绿，是「量得出而在位」抑或「根本量不出」，旧法**分不出**，而这正是本门自己所禁之事。
 *     今改为**逐档各自见红、逐档各自验其撤后复归在位**，一档不红即停门。
 *     **不得以集合之性质代其成员之性质。**
 *   ★ **本门之自证一节亦配反证**（r52 裁二十三）：见 `selfAuditCounterProof()`——
 *     本门既以反证责人，不可独免其身。
 *
 * 【跑法】
 *   node tools/qa/prod_render_invariants.js
 *     · 不设 QA_BASE_URL          → 生产站 https://chunqiu.timechorus.com
 *     · QA_BASE_URL=local         → 本门自起一个静态源端供出本仓 site/（推送前亦可跑）
 *     · QA_BASE_URL=http://...    → 指向任意源端
 *   ★ 一律带参破缓存（`?v=<随机>`），且**逐个子资源改写其 URL 加参**——
 *     裸 URL 有 CDN 缓存陷阱，只在文档 URL 上加参**不足以**把 app.js／styles.css 的旧本冲掉。
 *   退出码：0 全过；1 有不变量红；2 门自身出错或**反证失效**（后者尤须当回事）。
 */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const SITE = path.join(ROOT, "site");
const PROD = "https://chunqiu.timechorus.com";
const WIDTHS = [1440, 375];
const BUST = String(Date.now()) + "-" + Math.random().toString(36).slice(2, 8);

let fails = 0;
let checks = 0;
function ok(cond, label, detail) {
  checks++;
  if (!cond) fails++;
  console.log("  " + (cond ? "✓" : "✗") + " " + label + (detail ? "  —— " + detail : ""));
  return !!cond;
}
function head(s) { console.log("\n" + s); }

/* ---------------- 本地源端（QA_BASE_URL=local 时用；同 vision_r52.js 之式） ---------------- */
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json", ".txt": "text/plain; charset=utf-8",
};
function localServer(root) {
  return new Promise((res, rej) => {
    const s = http.createServer((rq, rs) => {
      let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]);
      if (u === "/") u = "/index.html";
      const fp = path.join(root, u);
      if (!fp.startsWith(root)) { rs.writeHead(403); rs.end(); return; }
      fs.readFile(fp, (e, d) => {
        if (e) { rs.writeHead(404); rs.end(); return; }
        rs.writeHead(200, { "Content-Type": MIME[path.extname(u).toLowerCase()] || "application/octet-stream" });
        rs.end(d);
      });
    });
    s.on("error", rej);
    s.listen(0, "127.0.0.1", () => res(s));
  });
}

/* ---------------- 页面内之量法（三条不变量共用，反证亦用同一套） ---------------- */

/* ⓵ 量一页时间线上全部 role-chip：右缘越卡即溢出；summary 之 scrollWidth>clientWidth 亦是溢出 */
const MEASURE_CHIPS = `() => {
  const out = [];
  const docOver = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  for (const d of document.querySelectorAll("details.event")) {
    const chip = d.querySelector(".role-chip");
    if (!chip) continue;
    const sm = d.querySelector("summary");
    const cb = chip.getBoundingClientRect(), db = d.getBoundingClientRect();
    out.push({
      eid: d.dataset.eid || "",
      chars: chip.textContent.length,
      over: +(cb.right - db.right).toFixed(2),
      smOver: sm ? sm.scrollWidth - sm.clientWidth : 0,
      docOver: docOver,
    });
  }
  return out;
}`;

/* ⓶ 扫渲染后之文本，问「有没有成对 ** 裸在屏上」。
 *   判「成对」用生产自己的 mdBoldMarks()（页面全局），口径与渲染层同一条，不另写一份。
 *   取 textContent 而非 innerText：前者跨 <strong> 子节点连缀，正好照出「该成粗体而没成」之串。 */
const SCAN_BARE_STARS = `() => {
  /* 严判之域＝**已落显示层之两栏**之全部落点，一个不少、一个不多：
   *   passages.modern_note → 编者层标 p.q-caveat ＋ 引文页脚 .quote footer 之 rest 段
   *   event_people.role_in_event → 胶囊 .role-chip ＋ 卡内 p.evt-role-note
   * 取 textContent（跨 <strong> 子节点连缀），正照出「该成粗体而没成」之串。 */
  const STRICT = [".q-caveat", ".quote footer", ".role-chip", ".evt-role-note"];
  if (typeof mdBoldMarks !== "function") return { strict: [{ where: "(mdBoldMarks 不在页上)", pairs: 0, text: "" }], loose: [] };
  const seen = new Set(), strict = [];
  for (const sel of STRICT) for (const el of document.querySelectorAll(sel)) {
    const t = el.textContent || "";
    if (t.indexOf("**") < 0) continue;
    const pairs = mdBoldMarks(t).length / 2;
    if (!pairs) continue;                       // 落单之 ** 系 mdBoldFrag 有意所留，不算病
    const i = t.indexOf("**");
    const key = sel + "|" + t.slice(0, 40);
    if (seen.has(key)) continue;
    seen.add(key);
    strict.push({ where: sel, pairs: pairs, text: t.slice(Math.max(0, i - 18), i + 26) });
  }
  /* 通栏之察（**只报不红**）：⚑H 止血条②款所登记之「尚未扩施显示层之诸栏」，
   * 其值里的成对星号本就还裸在屏上——那是已在册之欠账，不是本门所锁之渲染回归。
   * 故此处不入断言，只把它**认到栏**（从 DATA 里机械回查是哪一表哪一栏）报出来，供排期用。
   * 逐元素只取其**自有文本节点**，不取 textContent——后者跨元素连缀会拼出根本不存在的「成对」。 */
  const loose = [], lseen = new Set();
  const locate = (frag) => {
    for (const tb in DATA) {
      const rows = DATA[tb];
      if (!Array.isArray(rows)) continue;
      for (const r of rows) for (const k in r) {
        const v = r[k];
        if (typeof v === "string" && v.indexOf(frag) >= 0) return tb + "." + k;
      }
    }
    return "(未在 DATA 内定位)";
  };
  for (const el of document.querySelectorAll("*")) {
    let own = "";
    for (const n of el.childNodes) if (n.nodeType === 3) own += n.textContent;
    const i = own.indexOf("**");
    if (i < 0) continue;
    if (!mdBoldMarks(own).length) continue;
    const frag = own.slice(i, i + 24);
    if (lseen.has(frag)) continue;
    lseen.add(frag);
    loose.push({ col: locate(frag), text: own.slice(Math.max(0, i - 14), i + 26) });
  }
  return { strict: strict, loose: loose };
}`;

/* ⓷ 层色探针：当场造合式之空引文节点，读 getComputedStyle——不靠页上恰好有没有那一层之引文 */
const LAYER_PROBE = `(specs) => {
  const host = document.createElement("div");
  host.style.cssText = "position:absolute;left:-9999px;top:0;width:600px";
  document.body.appendChild(host);
  const out = [];
  for (const s of specs) {
    const bq = document.createElement("blockquote");
    bq.className = "quote" + (s.cls ? " " + s.cls : "");
    const tag = document.createElement("span");
    tag.className = "q-layer";
    tag.textContent = s.name;
    bq.appendChild(tag);
    const p = document.createElement("p");
    p.textContent = "測";
    bq.appendChild(p);
    host.appendChild(bq);
    const cs = getComputedStyle(bq), ts = getComputedStyle(tag);
    out.push({ name: s.name, borderColor: cs.borderLeftColor, borderStyle: cs.borderLeftStyle, tagColor: ts.color });
  }
  host.remove();
  return out;
}`;

/* 六档层色之期望值（design_notes §3.5／§3.5.1；色值实读 site/styles.css）。
 * 「六档」者：原文／言论·评论（同档同色）／后出叙事／诗歌／经义异闻／出土文献，去重得五色。
 * 此处之数是**色值与线型**，属 CSS，不属数据——本门之界不禁之。 */
const CINNABAR = "rgb(188, 68, 51)";     // 原文朱砂 --cinnabar #BC4433
const INK_SOFT = "rgb(122, 113, 102)";   // 淡墨 --ink-soft #7A7166
const POEM = "rgb(99, 114, 47)";         // 诗歌菉 --poem #63722F
const PLUM = "rgb(110, 90, 134)";        // 经义异闻·乌梅紫 #6E5A86
const EXCAV = "rgb(84, 70, 20)";         // 出土文献·窖土褐 --excav #544614（r32 立）
const LAYER_SPECS = [
  { name: "原文", cls: "", borderColor: CINNABAR, borderStyle: "solid", tagColor: null },
  { name: "言论", cls: "layer-yanlun", borderColor: CINNABAR, borderStyle: "solid", tagColor: INK_SOFT },
  { name: "评论", cls: "layer-pinglun", borderColor: CINNABAR, borderStyle: "solid", tagColor: INK_SOFT },
  { name: "后出叙事", cls: "layer-houchu", borderColor: INK_SOFT, borderStyle: "dashed", tagColor: INK_SOFT },
  { name: "诗歌", cls: "layer-shige", borderColor: POEM, borderStyle: "solid", tagColor: POEM },
  { name: "经义异闻", cls: "layer-jingyi", borderColor: PLUM, borderStyle: "solid", tagColor: PLUM },
  { name: "出土文献", cls: "layer-chutu", borderColor: EXCAV, borderStyle: "solid", tagColor: EXCAV },
];

/* ---------------- §自证：本门读自己的源码，证「一条数据断言也没放进来」 ----------------
 * 两条机器判据（不是自我声明，是可复核之扫描）：
 *   甲 · 源码内不得有「`.length` 或 `DATA.*` 与非零数字字面量相比」之式——
 *        `xxx.length === 0`（零不符之断言）不在禁内，凡与 1 以上之数相比者一律禁。
 *   乙 · 源码内不得出现任何**行 id 字面量**（事目／引文／人物／地望／关系／考古／背景／书目之属）。
 * 并逐条打印源码内**全部**数字比较，供人眼复核（不只报「过了」）。
 *
 * 【乙判之前缀集合，跑时实读求得】（r52 裁二十三）
 *   旧本之正则写死六个单字母前缀＋ `P_`／`L_` 两形，**实漏九类**（Co站长实测、本门今日复测）：
 *   `relations`（`R###`）、`archaeology`（`ARC###`）、`background`（`BKG###`）、
 *   以及 `sources` 十前缀中之六（`G`／`P`／`Y`／`T`／`L`／`J`）。
 *   `ARC`／`BKG` 之漏同因：旧式须单字母后**直接**跟数字，而 `A` 后是 `R`、`B` 后是 `K`。
 *   ★ 此漏在本门要长的那一边——⓷ 所分者即引文之层，`J`（出土文献）／`G`（国语）／`Y`／`L` 诸前缀恰在其中。
 *   今改为**跑时自 `data/csv/*.csv` 各表首列求其前缀集合**（见 `idClasses()`），
 *   本文件内一个前缀也不枚举、一个 id 也不写死：新表新前缀一出，乙判自己跟着长，
 *   **不必回改本文件一个字**——与本门「不写死数据」之界同一条理。
 *
 * 【甲判之网有二形之漏——漏写在明处】（r52 裁二十三，本轮不追）
 *   其一：长度先落于变量而后比较（`const n = X.length;` 而后 `ok(n === …)`），
 *         比较之左已非 `.length`，甲判之正则够不着；
 *   其二：累加器之属（`ok(acc.chips === …)`），其名不带 `length`，亦够不着。
 *   此二形**恃下文 `ANY_CMP` 之逐条打印兜之**——源码内全部数字比较一处不漏地列出，人眼可见。
 *   **不假装没有这个漏**；他日若欲补，补在甲判之正则，不在此注。
 *
 * 【本节之按类反证】（r52 裁二十三）
 *   见 `selfAuditCounterProof()`：以**跑时自 `data/csv/` 取之真实 id**（逐类一枚）喂乙判、
 *   以**跑时拼成之数据断言之形**喂甲判，逐类逐形俱须当场红；一类不红即抛错停门（退出码 2）。
 *   ★ 分寸：反证之料**一律跑时取、跑时拼**——本文件内既不写死 id，
 *     亦不写死任何「`.length` 与非零数相比」之字面量（拼串之式其 `.length` 之后紧跟引号，
 *     不合甲判之形），故**植入对照不会使本门自己的两判见红**。此即「反证而不自污」之法。
 */

/* 行 id 之前缀集合：跑时自 data/csv/*.csv 各表首列实读求得（表名｜前缀｜其一枚真实样本｜该表行数）。
 * ★ 此处所取之行数只用于**拼一条数据断言之形**（反证之料），不入任何断言，故非数据断言。 */
function idClasses() {
  const dir = path.join(ROOT, "data", "csv");
  let files;
  try { files = fs.readdirSync(dir).filter((f) => /\.csv$/i.test(f)).sort(); }
  catch (e) {
    throw new Error("自证之反证取料失败：读不到 " + dir + "——本门之自证须以库中真实 id 为料，"
      + "无料则乙判之覆盖无从证，停门。原由：" + e.message);
  }
  const out = [];
  for (const f of files) {
    const table = f.replace(/\.csv$/i, "");
    const lines = fs.readFileSync(path.join(dir, f), "utf8").split(/\r?\n/);
    const rows = lines.slice(1).filter((ln) => ln.trim().length > 0).length;
    const seen = new Set();
    for (let i = 1; i < lines.length; i++) {
      const v = (lines[i].split(",")[0] || "").trim().replace(/^"|"$/g, "");
      const m = /^([A-Z]+)(_?)/.exec(v);
      if (!m) continue;
      const prefix = m[1] + m[2];
      if (seen.has(prefix)) continue;
      seen.add(prefix);
      out.push({ table: table, prefix: prefix, sample: v, underscored: !!m[2], rows: rows });
    }
  }
  if (!out.length) throw new Error("自证之反证取料失败：" + dir + " 内一个行 id 也没读出来，停门。");
  return out;
}

/* 以跑时求得之前缀集合拼乙判之正则：两形——「前缀＋三位以上数字」与「前缀＋下划线＋大写名」。
 * 多字母前缀须排在单字母之前（`ARC` 不可被 `A` 先截走）。 */
function rowIdRe(classes) {
  const solid = [], und = [];
  for (const c of classes) (c.underscored ? und : solid).push(c.prefix.replace(/_$/, ""));
  const uniq = (a) => Array.from(new Set(a)).sort((x, y) => y.length - x.length || (x < y ? -1 : 1));
  const alt = [];
  if (solid.length) alt.push("(?:" + uniq(solid).join("|") + ")\\d{3,}");
  if (und.length) alt.push("(?:" + uniq(und).join("|") + ")_[A-Z][A-Z_]*");
  return new RegExp("\\b(?:" + alt.join("|") + ")\\b");
}

/* §自证之按类反证：本门既以反证责人，不可独免其身（r52 裁二十三）。 */
function selfAuditCounterProof(DATA_CMP, ROW_ID, classes) {
  head("【自证之反证】以库中真实 id ＋ 数据断言之形喂本门两判，逐类逐形须当场红（r52 裁二十三）");
  console.log("  ★ 反证之料一律**跑时取、跑时拼**：id 自 `data/csv/` 各表首列逐类取一枚，断言之形以表名与行数当场拼成；");
  console.log("    本文件内不写死一个 id、不写死一处「长度与非零数之比较」，故植入对照**不会**使本门自己的两判见红。");

  /* 乙判之反证：逐类对位，一类不红即停门 */
  const notRed = [];
  for (const c of classes) {
    const red = ROW_ID.test(c.sample);
    if (!red) notRed.push(c.table + " 之 " + c.prefix + " 类（" + c.sample + "）");
    console.log("    · 乙判 " + (red ? "当场红" : "✗ 未红") + "：" + c.table + " 之 " + c.prefix + " 类 → " + c.sample);
  }
  if (notRed.length) {
    throw new Error("自证之反证失效（乙判）：以下类之真实 id 喂入而乙判不红——乙判量不到这些类，"
      + "其「零处」之绿于此数类是空的，停门：" + notRed.join("、"));
  }
  ok(true, "乙判之反证：跑时取得之 " + classes.length + " 类行 id（逐类一枚真实样本）**逐类当场红**",
    "一类不红即停门；前缀集合跑时自 data/csv 各表首列求得，本文件内不枚举");
  const wrong = classes.map((c) => c.table).filter((s) => ROW_ID.test(s));
  ok(wrong.length === 0, "乙判之不误红：表名之属（跑时取）不入其网——证其非恒真",
    wrong.length ? wrong.join("、") : "零误红");

  /* 甲判之反证：以跑时之表名与行数拼数据断言之形 */
  const tb = classes[0].table, n = classes[0].rows;
  const mk = (lhs, op, num) => "ok(" + lhs + " " + op + " " + num + ", \"（反证之对照，跑时拼成）\");";
  const shapes = [
    { why: "表之长度与非零数相比", line: mk("DATA." + tb + ".length", "===", n) },
    { why: "变量之 `.length` 与非零数相比", line: mk("rows.length", ">=", n) },
    { why: "`DATA.*` 之属与非零数相比", line: mk("DATA." + tb + ".total", ">", n) },
  ];
  const dead = [];
  for (const s of shapes) {
    const red = DATA_CMP.test(s.line);
    if (!red) dead.push(s.why);
    console.log("    · 甲判 " + (red ? "当场红" : "✗ 未红") + "：" + s.why + " → " + s.line);
  }
  if (dead.length) {
    throw new Error("自证之反证失效（甲判）：以下形之数据断言喂入而甲判不红——甲判量不到这些形，停门："
      + dead.join("、"));
  }
  ok(true, "甲判之反证：" + shapes.length + " 形数据断言（跑时以表名与行数拼成）**逐形当场红**",
    "一形不红即停门");
  const zeroLine = mk("rows.length", "===", 0);
  ok(!DATA_CMP.test(zeroLine), "甲判之不误红：与零相比之式不入其网（「零不符」之断言本在禁外，门头已书）",
    zeroLine);
  console.log("  ★ 二判俱当场咬得住其对照，故下文「零处」之绿是**量过而无**，不是**量不到**。");
}

function selfAudit() {
  const src = fs.readFileSync(__filename, "utf8");
  const lines = src.split(/\r?\n/);
  const DATA_CMP = /(?:DATA\.[A-Za-z_]+(?:\.[A-Za-z_]+)*|[A-Za-z_$][\w$]*\.length)\s*(?:===|!==|==|>=|<=|>|<)\s*([1-9]\d*)/;
  const classes = idClasses();
  const ROW_ID = rowIdRe(classes);
  const ANY_CMP = /(?:===|!==|==|>=|<=|>|<)\s*-?\d+(?:\.\d+)?/;
  const badCmp = [], badId = [], allCmp = [];
  lines.forEach((ln, i) => {
    const n = i + 1;
    if (DATA_CMP.test(ln)) badCmp.push(n + ": " + ln.trim());
    if (ROW_ID.test(ln)) badId.push(n + ": " + ln.trim());
    if (ANY_CMP.test(ln)) allCmp.push(n + ": " + ln.trim());
  });
  head("【自证】本门读自己的源码，证其内无数据断言（机器扫描，非自述）");
  console.log("  乙判之前缀集合跑时实读求得（" + classes.length + " 类，其形："
    + Array.from(new Set(classes.map((c) => c.prefix))).join("／") + "）：" + ROW_ID.source);
  console.log("  源码内全部「与数字字面量之比较」逐条列出（供人眼复核，共 " + allCmp.length + " 处）：");
  for (const c of allCmp) console.log("    · " + c);
  ok(badCmp.length === 0, "甲：无「表之长度／DATA.* 与非零数字」之比较（数据断言之形）",
    badCmp.length ? badCmp.join(" | ") : "零处");
  ok(badId.length === 0, "乙：无任何行 id 字面量（前缀集合跑时自 data/csv 各表首列求得，非写死之枚举）",
    badId.length ? badId.join(" | ") : "零处");
  console.log("  ★ 二者俱零，故本门之绿不因数据涨落而变；数据扩表时**无须回改本文件一个字**。");
  selfAuditCounterProof(DATA_CMP, ROW_ID, classes);
}

/* ---------------- 主 ---------------- */
(async () => {
  const pw = require("playwright");
  const raw = (process.env.QA_BASE_URL || "").trim();
  let server = null, base;
  if (!raw) {
    base = PROD;
  } else if (raw === "local" || raw === "site") {
    server = await localServer(SITE);
    base = "http://127.0.0.1:" + server.address().port;
  } else {
    base = raw.replace(/\/+$/, "");
  }
  const origin = new URL(base).origin;

  console.log("=== 生产渲染不变量门（r52 裁十六立）===");
  console.log("  源端：" + base + (server ? "（本门自起之本地源端，供出 " + SITE + "）" : (base === PROD ? "（生产）" : "（QA_BASE_URL 所指）")));
  console.log("  破缓存参：v=" + BUST + "（文档 URL ＋ 逐个同源子资源）");
  console.log("  量宽：" + WIDTHS.join(" / ") + "px");
  console.log("  本门收三条不变量：⓵ role-chip 不溢出（r52）　⓶ 注文成对星号不裸出（r51 立／r52 扩）　⓷ 六档层色在位（r32）");

  selfAudit();

  const browser = await pw.chromium.launch();
  const errs = [];
  const ctxs = [];
  const mkPage = async (width, tag) => {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, bypassCSP: false });
    await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) { } });
    /* 逐个同源子资源改写 URL 加参：只在文档 URL 上加参不足以冲掉 CDN 里的 app.js／styles.css 旧本 */
    await ctx.route("**/*", (route) => {
      const req = route.request();
      let u;
      try { u = new URL(req.url()); } catch (e) { return route.continue(); }
      if (u.origin !== origin || req.resourceType() === "document") return route.continue();
      u.searchParams.set("v", BUST);
      return route.continue({ url: u.toString() });
    });
    const p = await ctx.newPage();
    p.on("pageerror", (e) => errs.push(tag + "@" + width + "：" + e.message));
    ctxs.push(ctx);
    return p;
  };
  const docUrl = (hash) => base + "/?v=" + BUST + hash;
  /* ---- 就绪闸（r52 §六之五立；原以 `waitForTimeout(800)` 之固定等待充凭，网络稍慢则数据未到而仍往下跑，
   *      遂有「同机同日五跑一败」之 `DATA.event_people is not iterable`。此系门自身之竞态，非站点之病） ----
   * ★ 只判「形」不判「量」：DATA 在、`DATA.event_people` 可迭代且非空、`PROTAGONISTS` 是数组且非空。
   *   非空以「迭代一步即止」验之——**不与任何数字相比**、不写任何行 id，故非数据断言：
   *   数据扩表、缩表、改行，俱不须回改本闸一个字。
   * ★ 超时不默然放行：抛错停门，并把当场探得之状况一并报出。 */
  const READY_MS = 30000;
  const ready = async (p, where) => {
    const t0 = Date.now();
    try {
      await p.waitForFunction(() => {
        if (typeof DATA !== "object" || !DATA) return false;
        const ep = DATA.event_people;
        if (!ep || typeof ep[Symbol.iterator] !== "function") return false;
        let epAny = false;
        for (const row of ep) { epAny = true; break; }   /* 迭代一步即止：可迭代＋非空，一验而两得 */
        if (!epAny) return false;
        if (typeof PROTAGONISTS === "undefined" || !Array.isArray(PROTAGONISTS)) return false;
        let prAny = false;
        for (const x of PROTAGONISTS) { prAny = true; break; }
        return prAny;
      }, null, { timeout: READY_MS, polling: 120 });
    } catch (e) {
      let probe = "（探测亦失败）";
      try {
        probe = JSON.stringify(await p.evaluate(() => ({
          data: typeof DATA,
          ep: typeof DATA === "object" && DATA ? typeof DATA.event_people : "-",
          epIterable: typeof DATA === "object" && DATA && DATA.event_people
            ? typeof DATA.event_people[Symbol.iterator] === "function" : false,
          protos: typeof PROTAGONISTS,
          ready: document.readyState,
        })));
      } catch (e2) { }
      throw new Error("就绪闸未过（" + where + "）：候 `DATA.event_people` 可迭代且非空、`PROTAGONISTS` 就位，"
        + READY_MS + "ms 内未至，**门就此停，不往下跑**。当场探得：" + probe + "；原由：" + e.message);
    }
    console.log("    就绪闸过（" + where + "）：数据可迭代且非空、主角表就位，候时 " + (Date.now() - t0) + "ms");
  };
  const goPerson = async (p, pid) => {
    await p.goto(docUrl("#/p/" + pid + "/timeline"), { waitUntil: "load", timeout: 45000 });
    await p.waitForSelector("details.event", { timeout: 30000 });
    await p.waitForTimeout(450);
  };

  try {
    const pages = {};
    for (const w of WIDTHS) pages[w] = await mkPage(w, "本门");

    /* ===== §〇 源端之实与量法之前提 ===== */
    head("【〇】源端之实（不预设、当场读）");
    const p0 = pages[WIDTHS[0]];
    await p0.goto(docUrl("#/"), { waitUntil: "load", timeout: 45000 });
    await ready(p0, "§〇 源端之实");
    const fx = await p0.evaluate(() => ({
      hasRoleParts: typeof roleParts === "function",
      hasMdMarks: typeof mdBoldMarks === "function",
      hasRenderTimeline: typeof renderTimeline === "function",
      hasData: typeof DATA === "object" && !!DATA && !!DATA.event_people,
      hasProtos: Array.isArray(typeof PROTAGONISTS === "undefined" ? null : PROTAGONISTS),
      chipRule: (() => {
        for (const ss of document.styleSheets) {
          let rules; try { rules = ss.cssRules; } catch (e) { continue; }
          for (const r of rules || []) if (r.selectorText === ".event .role-chip") {
            return { ws: r.style.whiteSpace, mw: r.style.maxWidth, owrap: r.style.overflowWrap };
          }
        }
        return null;
      })(),
    }));
    ok(fx.hasData && fx.hasProtos, "源端之数据与主角表已在页上（本门据以跑时取页，不写死）");
    ok(fx.hasMdMarks, "生产之 `mdBoldMarks()` 在页上（⓶ 之判「成对」与渲染层同一条口径）");
    ok(fx.hasRenderTimeline, "生产之 `renderTimeline()` 在页上（最长值之人若非主角，据此直驱渲入可见容器）");
    console.log("    源端 `.event .role-chip` 之现行规则：" + JSON.stringify(fx.chipRule));

    const protos = await p0.evaluate(() => PROTAGONISTS.map((x) => x.id));
    ok(protos.length > 0, "主角页之名单跑时取得（数量随数据而变，本门不断其数）", protos.length + " 页");

    /* 最长之值所在之页：跑时于 DATA 内求，不写死 id、不写死字数 */
    const longest = await p0.evaluate(() => {
      let best = null;
      for (const l of DATA.event_people) {
        const v = l.role_in_event;
        if (!v) continue;
        if (!best || v.length > best.chars) best = { eid: l.event_id, pid: l.person_id, chars: v.length };
      }
      return best;
    });
    ok(!!longest, "全库 `role_in_event` 最长之值跑时求得",
      longest ? longest.eid + "／" + longest.pid + "，" + longest.chars + " 字（★ 此三者俱跑时所得，源码内无一写死）" : "未求得");
    const longestIsProto = !!longest && protos.indexOf(longest.pid) >= 0;
    console.log("    最长值之人" + (longestIsProto ? "系主角，径走其页" : "非主角（其页今日走不进去），故以生产 `renderTimeline()` 直驱渲入可见时间线容器"));

    /* 把最长值之卡渲入可见容器 */
    const driveLongest = async (p) => {
      if (longestIsProto) { await goPerson(p, longest.pid); return; }
      await goPerson(p, protos[0]);
      await p.evaluate((pid) => { state.person = pid; renderTimeline(); }, longest.pid);
      await p.waitForTimeout(350);
    };

    /* ===== §一 ⓵⓶ 合扫（一遍走完，三事同量） =====
     * 一页之内办三件：① 净态量胶囊（⓵ 之判据）；② 开卡扫成对星号（⓶ 之判据）；
     * ③ 就地注入 r52 之前那条旧规则（`nowrap` ＋ 无 `max-width`）复量一遍——**此即⓵ 之反证之料**。
     * 反证与不变量走的是**同一批页、同一个量法、同一次访问**，故不可能「反证跑的是另一摊」。 */
    head("【一】不变量⓵ role-chip 不溢出（r52 立；由裁五甲、裁十六）＋ ⓶ 之同页合扫");
    console.log("  ⓵ 判据：胶囊右缘不逾其卡（`getBoundingClientRect`）＋ `summary.scrollWidth <= clientWidth` ＋ 页面横向不溢；不以截图目测代之。");
    console.log("  ⓶ 判据：`mdBoldMarks()`（生产之同一函数）所判之**成对** `**` 数须为零；落单之 `**` 系该函数有意所留，不算病。");
    const OLD_CHIP_CSS = ".event .role-chip{white-space:nowrap !important;max-width:none !important;overflow-wrap:normal !important;}";
    const overOf = (rows) => rows.filter((x) => x.over > 0.5 || x.smOver > 0 || x.docOver > 0);
    const visit = async (p, label) => {
      const clean = await p.evaluate(eval("(" + MEASURE_CHIPS + ")"));
      await p.evaluate(() => { for (const d of document.querySelectorAll("details.event")) d.open = true; });
      await p.waitForTimeout(120);
      const stars = await p.evaluate(eval("(" + SCAN_BARE_STARS + ")"));
      const st = await p.addStyleTag({ content: OLD_CHIP_CSS });
      await p.waitForTimeout(120);
      const old = await p.evaluate(eval("(" + MEASURE_CHIPS + ")"));
      await st.evaluate((e) => e.remove());
      return {
        label,
        bad: overOf(clean).map((r) => ({ label, eid: r.eid, over: r.over, smOver: r.smOver, docOver: r.docOver, chars: r.chars })),
        stars: stars.strict.map((h) => Object.assign({ label }, h)),
        loose: stars.loose,
        chips: clean.length,
        maxChars: clean.reduce((a, r) => (r.chars > a ? r.chars : a), 0),
        cpRed: overOf(old).length,
        cpWorst: overOf(old).reduce((a, r) => (r.over > a ? r.over : a), 0),
      };
    };
    const sweep = {};
    const looseAll = new Map();   // ⚑H②款 之未扩施栏：只报不红，逐栏并计
    const noteLoose = (rows) => { for (const h of rows) if (!looseAll.has(h.text)) looseAll.set(h.text, h); };
    for (const w of WIDTHS) {
      const p = pages[w];
      const acc = { bad: [], stars: [], chips: 0, pageCount: 0, maxChars: 0, cpRed: 0, cpWorst: 0, cpPages: 0, longestSeen: null };
      for (const pid of protos) {
        await goPerson(p, pid);
        const v = await visit(p, pid);
        acc.pageCount++;
        acc.chips += v.chips;
        acc.bad.push.apply(acc.bad, v.bad);
        acc.stars.push.apply(acc.stars, v.stars);
        noteLoose(v.loose);
        if (v.maxChars > acc.maxChars) acc.maxChars = v.maxChars;
        acc.cpRed += v.cpRed;
        if (v.cpRed) acc.cpPages++;
        if (v.cpWorst > acc.cpWorst) acc.cpWorst = v.cpWorst;
      }
      /* 最长之值所在之页（跑时求得；其人若非主角，以生产 renderTimeline() 直驱渲入可见容器） */
      await driveLongest(p);
      const vL = await visit(p, "(最长值之页)");
      acc.bad.push.apply(acc.bad, vL.bad);
      acc.stars.push.apply(acc.stars, vL.stars);
      noteLoose(vL.loose);
      acc.chips += vL.chips;
      acc.cpRed += vL.cpRed;
      if (vL.cpRed) acc.cpPages++;
      const rowsL = await p.evaluate(eval("(" + MEASURE_CHIPS + ")"));
      acc.longestSeen = rowsL.find((x) => x.eid === longest.eid) || null;
      sweep[w] = acc;

      ok(acc.bad.length === 0, w + "px：" + acc.pageCount + " 页（主角全数）＋ 最长值之页，共 " + acc.chips
        + " 枚 role-chip 无一溢出（卡右缘／summary／页面横向三处俱不越）",
        acc.bad.length ? JSON.stringify(acc.bad.slice(0, 4)) : "零溢出（本宽所见最长胶囊 " + acc.maxChars + " 字）");
      ok(!!acc.longestSeen, w + "px：最长之值所在之卡已渲入可见时间线容器",
        acc.longestSeen ? "其胶囊实载 " + acc.longestSeen.chars + " 字（原值 " + longest.chars + " 字，余者落卡内）" : "未渲出");
      ok(!!acc.longestSeen && acc.longestSeen.over <= 0.5 && acc.longestSeen.smOver <= 0 && acc.longestSeen.docOver <= 0,
        w + "px：最长之值（" + longest.chars + " 字）不溢出其容器",
        acc.longestSeen ? "越卡右缘 " + acc.longestSeen.over + "px／summary " + acc.longestSeen.smOver + "／页面横向 " + acc.longestSeen.docOver : "");
      ok(acc.stars.length === 0, w + "px：已落显示层两栏之四个落点（`.q-caveat`／`.quote footer`／`.role-chip`／`.evt-role-note`）无一成对星号裸出（⓶）",
        acc.stars.length ? JSON.stringify(acc.stars.slice(0, 3)) : "零处");
    }

    /* ⚑H②款 之察：只报不红。理由与其界见 SCAN_BARE_STARS 之注。 */
    head("【一之附】通栏之察（**只报不红**）：尚未扩施显示层之诸栏，其成对星号仍裸在屏上");
    if (looseAll.size === 0) {
      console.log("  本批页上一处也无。");
    } else {
      const byCol = new Map();
      for (const h of looseAll.values()) byCol.set(h.col, (byCol.get(h.col) || 0) + 1);
      console.log("  逐栏并计（栏名系从页上之值回查 `DATA` 机械认得，非写死）：");
      for (const [col, n] of byCol) console.log("    · " + col + "：本批页上 " + n + " 处");
      let shown = 0;
      for (const h of looseAll.values()) { if (shown >= 3) break; shown++; console.log("      例：[" + h.col + "] " + h.text); }
      console.log("  ★ 此系 conventions §7 ⚑H 止血条**②款所登记之未扩施栏**，**在册之欠账，非本门所锁之渲染回归**——");
      console.log("    本门只锁「已落显示层者不得回退」，不越俎代庖替排期做判断。待其扩施之日，把该栏之选择器补进上文之严判之域即可。");
    }

    /* ===== §一之二 ⓵ 之按类反证 ===== */
    head("【一之二】⓵ 之按类反证：同一量法、同一批页，施于**已知会红**之对照");
    console.log("  ★ 反证测不出红即说明本门量的不是它自称在量的东西——当场抛错停门，不许带病往下跑。");
    console.log("  甲 · **史上真发生过那一版**：就地注入 r52 之前之规则（`white-space: nowrap` ＋ 无 `max-width` ＋ `overflow-wrap: normal`），于上文同一批页复量。");
    let cpTotal = 0;
    for (const w of WIDTHS) {
      const a = sweep[w];
      cpTotal += a.cpRed;
      console.log("    " + w + "px：旧规则下 " + a.cpPages + " 页见红、共 " + a.cpRed + " 枚溢出，最甚者越卡 " + a.cpWorst.toFixed(2) + "px");
    }
    if (cpTotal === 0) {
      throw new Error("反证失效（⓵甲）：注入 r52 之前之规则后，同一量法于全批页仍测不出一处溢出——停门。");
    }
    ok(true, "甲：旧规则之对照于两宽合计**当场红** " + cpTotal + " 枚（反证咬得住；而净态同批页零溢出，二者相减即甲之治）");
    console.log("    ★ 一处如实之限：此对照所红者**少于 r52 走查所记之旧版红数**，因旧版之胶囊载全串、今之胶囊只载首句（`roleParts()` 已在 DOM 层分过），");
    console.log("      故此处只还原 CSS 一半、未还原 DOM 一半。欲两半俱还原者，仍须 `vision_r52.js` 之双源端对读——本门不取其法（那要 git 与本地源端，跑不到生产上）。");
    console.log("  乙 · **与宽无关之确定性反证**：强令胶囊宽于其卡（`min-width:140%`），凡量得住溢出者此条必红，每一宽俱须红。");
    for (const w of WIDTHS) {
      const p = pages[w];
      await goPerson(p, protos[0]);
      const st = await p.addStyleTag({ content: ".event .role-chip{min-width:140% !important;max-width:none !important;white-space:nowrap !important;}" });
      await p.waitForTimeout(150);
      const red = overOf(await p.evaluate(eval("(" + MEASURE_CHIPS + ")")));
      await st.evaluate((e) => e.remove());
      await p.waitForTimeout(150);
      const back = overOf(await p.evaluate(eval("(" + MEASURE_CHIPS + ")")));
      if (red.length === 0) {
        throw new Error("反证失效（⓵乙，" + w + "px）：强令胶囊宽于其卡之后同一量法仍报零溢出——本门量的不是溢出，停门。");
      }
      ok(true, "乙：" + w + "px 强制超宽之对照**当场红** " + red.length + " 枚", "最甚者越卡 " + Math.max.apply(null, red.map((x) => x.over)).toFixed(2) + "px");
      ok(back.length === 0, "乙：" + w + "px 撤去注入之后复归零溢出（证所红者系注入所致，非本门之误）", "撤后溢出 " + back.length + " 枚");
    }

    /* ===== §二 ⓶ 之反证 ===== */
    head("【二】⓶ 之按类反证：把一处**未经 `mdBoldFrag()`** 之值照旧法塞进同一选择器，扫描须当场红");
    {
      const p = pages[WIDTHS[0]];
      await goPerson(p, protos[0]);
      const planted = await p.evaluate(() => {
        const sm = document.querySelector("details.event summary");
        if (!sm) return null;
        const span = document.createElement("span");
        span.className = "role-chip";
        span.id = "qa-counterproof-chip";
        // 这正是 r51 之前之旧法：`el.textContent = 原串`，星号原样落到屏上
        span.textContent = "反证之值：此处当成**粗体**而未成";
        sm.appendChild(span);
        return true;
      });
      if (!planted) throw new Error("反证失效（⓶）：页上取不到 `details.event summary`，无从植入对照，停门。");
      const hits = (await p.evaluate(eval("(" + SCAN_BARE_STARS + ")"))).strict;
      await p.evaluate(() => { const e = document.getElementById("qa-counterproof-chip"); if (e) e.remove(); });
      const after = (await p.evaluate(eval("(" + SCAN_BARE_STARS + ")"))).strict;
      if (hits.length === 0) {
        throw new Error("反证失效（⓶）：植入一处裸出之成对星号之后，同一扫描仍报零——本门量的不是裸星号，停门。");
      }
      ok(true, "植入之对照**当场红** " + hits.length + " 处（反证咬得住）", JSON.stringify(hits[0]));
      ok(after.length === 0, "撤去植入之后复归零（证所红者系植入所致）", "撤后 " + after.length + " 处");
    }

    /* ===== §三 ⓷ 六档层色之在位 ===== */
    head("【三】不变量⓷ 六档层色之在位（r32 立；design_notes §3.5／§3.5.1）");
    console.log("  量法：当场造合式之空引文节点入文档读 `getComputedStyle()`——量的是 CSS 与类名之绑定，不靠页上恰好有没有那一层之引文。");
    {
      const p = pages[WIDTHS[0]];
      await goPerson(p, protos[0]);
      const got = await p.evaluate(eval("(" + LAYER_PROBE + ")"), LAYER_SPECS.map((s) => ({ name: s.name, cls: s.cls })));
      LAYER_SPECS.forEach((want, i) => {
        const g = got[i];
        const bcOk = g.borderColor === want.borderColor;
        const bsOk = g.borderStyle === want.borderStyle;
        const tcOk = want.tagColor === null ? true : g.tagColor === want.tagColor;
        ok(bcOk && bsOk && tcOk, "「" + want.name + "」层：左线 " + want.borderStyle + " " + want.borderColor
          + (want.tagColor === null ? "（本档无徽标，不断其色）" : "／徽标 " + want.tagColor),
          bcOk && bsOk && tcOk ? "在位" : "实测 左线 " + g.borderStyle + " " + g.borderColor + "／徽标 " + g.tagColor);
      });
    }

    /* ===== §三之二 ⓷ 之反证（r52 裁二十四改为逐档对位） =====
     * 旧法只注入 `--excav`／`--poem`／`--cinnabar` 三变量，整批见红 5 档即算过；
     * 而 `layer-houchu` 之左线承 `--ink-soft`、`layer-jingyi` 之左线是字面量 `#6E5A86`，
     * 二档**从不在注入所及之内**——其绿是「量得出而在位」抑或「根本量不出」，旧法分不出。
     * 今：① 注入并及 `--ink-soft`；② `layer-jingyi` 直注一条改其 `border-left-color`；
     *     ③ **逐档各自判其红否、逐档各自验其撤后复归**，一档不红即停门。
     * ★ 所注之对照色系 CSS 之数不是数据之数，本门之界不禁之（门头已有其说）。 */
    head("【三之二】⓷ 之按类反证：**逐档对位**，每一档各自见红、各自验其撤后复归（r52 裁二十四）");
    console.log("  ★ 不得以「整批见红 N 档」充「每档俱可量」——以集合之性质代其成员之性质，是 r51 勘注十二之同型之病。");
    {
      const p = pages[WIDTHS[0]];
      const CP_VARS = ":root{--excav:#010203;--poem:#010203;--cinnabar:#010203;--ink-soft:#010203;}";
      /* `layer-jingyi` 之色无变量可改，故直注一条规则易其左线之色（其徽标之色亦系同一字面量，
       *  本条只需其左线见红即足以证「本门量得到这一档」） */
      const CP_JINGYI = ".quote.layer-jingyi{border-left-color:#010203 !important;}";
      console.log("    注入之对照：" + CP_VARS + "　＋　" + CP_JINGYI);
      const specArg = LAYER_SPECS.map((s) => ({ name: s.name, cls: s.cls }));
      const st = await p.addStyleTag({ content: CP_VARS + CP_JINGYI });
      await p.waitForTimeout(150);
      const got = await p.evaluate(eval("(" + LAYER_PROBE + ")"), specArg);
      await st.evaluate((e) => e.remove());
      await p.waitForTimeout(150);
      const back = await p.evaluate(eval("(" + LAYER_PROBE + ")"), specArg);
      const isRed = (want, g) => g.borderColor !== want.borderColor
        || (want.tagColor !== null && g.tagColor !== want.tagColor);
      const notRed = LAYER_SPECS.filter((want, i) => !isRed(want, got[i]));
      if (notRed.length) {
        throw new Error("反证失效（⓷，逐档对位）：以下档于对照注入之后探针仍报「在位」——"
          + "本门量不到这几档，其今日之绿是空的，停门：" + notRed.map((x) => x.name).join("、")
          + "（实测：" + JSON.stringify(notRed.map((w) => got[LAYER_SPECS.indexOf(w)])) + "）");
      }
      LAYER_SPECS.forEach((want, i) => {
        const g = got[i];
        ok(isRed(want, g), "「" + want.name + "」层：对照之下**当场红**（本档量得出来）",
          "实测 左线 " + g.borderStyle + " " + g.borderColor + "／徽标 " + g.tagColor
          + "（期 " + want.borderColor + (want.tagColor === null ? "，本档无徽标" : "／" + want.tagColor) + "）");
      });
      LAYER_SPECS.forEach((want, i) => {
        const b = back[i];
        const okBack = b.borderColor === want.borderColor && b.borderStyle === want.borderStyle
          && (want.tagColor === null || b.tagColor === want.tagColor);
        ok(okBack, "「" + want.name + "」层：撤去注入之后**复归在位**（证所红者系注入所致，非本门之误）",
          okBack ? "复归" : "实测 左线 " + b.borderStyle + " " + b.borderColor + "／徽标 " + b.tagColor);
      });
    }

    /* ===== §四 页面无脚本错 ===== */
    head("【四】本门所历诸页零 pageerror");
    ok(errs.length === 0, "零 pageerror", errs.slice(0, 3).join(" | ") || "零");

  } finally {
    for (const c of ctxs) { try { await c.close(); } catch (e) { } }
    await browser.close();
    if (server) server.close();
  }

  console.log("\n=== 合计 " + checks + " 项，FAIL " + fails + " ===");
  process.exit(fails ? 1 : 0);
})().catch((e) => {
  console.error("\n【门自身出错 / 反证失效】" + (e && e.message ? e.message : e));
  if (e && e.stack) console.error(e.stack);
  process.exit(2);
});
