/* 经纬春秋 · r53 走查门：⚑H 扩施七栏 ＋ 反引号一路（裁四十一、裁四十八）
 *
 * 本门要回答五个问题，一个都不许用「页面看着没有裸符了」来答：
 *   ① **二记法之解析对**——反引号优先（裁四十八①）、交叉不可能出现、奇数与游程一律原样照出；
 *      判据取**往返还原逐字全等**（把 `<strong>`／`<code>` 两侧之记号补回须逐字还原成原串），
 *      这是「不吞字」唯一可机械证伪之说法。
 *   ② **落点查全了**——十栏之**文本流落点逐个在生产渲染函数上实渲**，不以「我改了那一行」为证；
 *      并以**源码实读**断 `events.summary` 之 `innerHTML` 一路已绝（⚑H ④款明禁）。
 *   ③ **按类反证咬得住**——同一套量法施于**旧版**（`OLD_REF`）须当场测出**裸反引号**；
 *      测不出红即抛错停门。没有这一条，§二§三跑绿只证明「脚本会打印 ✓」（design_notes §7.2）。
 *   ④ **零影响**——二记法俱无之值，其 DOM 与旧版**逐位全等**；有记法者两版之差**只有那两式**。
 *      此条不与「我觉得没动它」对读，而是真把改动前那一版 app.js/styles.css 另起一个源端跑起来。
 *   ⑤ **二案之量**（供裁，非断言）——反引号之渲法系设计之决，Vision 不自行落定；
 *      本门把二案之盒变、行数变、最密之行逐项量出来，使裁有实据而非凭辞。
 *
 * ★ 旧版源端锚定固定哈希 `OLD_REF`（见下），**不取 `HEAD`**——照 r51 裁二十六、r52 之例：
 *   本件合入后 `HEAD` 之 app.js 即含 `mdInlineFrag`，「旧版」会等于新版，两版对读之前提当场消失、
 *   §四必绿而 §三之二之反证必红（两头都错），且是**静默**的错。故钉死哈希，并于起手处打印
 *   「旧版 app.js 内 mdInlineFrag 出现 0 次／旧版 styles.css 内无 .md-name」之**正面证据**；
 *   锚定若失效，当场抛错停门，不许带病往下跑。
 *
 * ★ 本门**不动仓库任何文件**：旧版取自 `git show <OLD_REF>:site/...`（只读），不切分支、不 stash。
 * ★ 本门**不碰 `tools/qa/` 之他本**（r53-3 件之界）。`vision_r51.js`／`vision_r52.js` 于本件之后
 *   各有数项转红——其红**不在站点而在二门之逆函数**（二者之还原式只识 `**`，不识 `` ` ``）；
 *   实况、逐条之因与所拟之治见 `docs/delivery_vision_r53.md` §六「验收偏差上报」。本门不代其治。
 *
 * 用法：node tools/qa/vision_r53.js
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

/* ---------- 双源端静态服务器（同 r51／r52 之式）----------
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
/* 旧版源端之锚：`ce708df` 系 r52 收官之 `main`（2026-09-25 实读与 `git ls-remote origin main` 同哈希），
 * 即**本件改动之前一版**。【不得改回 HEAD】理由见门头。 */
const OLD_REF = "ce708df";
const gitShow = (p) => execFileSync("git", ["show", OLD_REF + ":" + p], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });

/* ---------- 页面内共用之逆函数（二记法之还原）----------
 * 逆函数是本门之骨：正向渲染若吞字、吃符、错嵌，逆向必不能逐字还原。
 * ★ 他种元素节点一律还原成 `\u0000` 打头之串——那是数据里不可能出现之字符，故必致不等，
 *   不会被静默吞掉（若写成「原样返回其 textContent」，多出一层元素反而测不出来）。 */
const BACK = `(el) => {
  const walk = (node) => [...node.childNodes].map(n => {
    if (n.nodeType === 3) return n.textContent;
    if (n.nodeName === "CODE") return "\\u0060" + walk(n) + "\\u0060";
    if (n.nodeName === "STRONG") return "**" + walk(n) + "**";
    return "\\u0000" + n.nodeName;
  }).join("");
  return walk(el);
}`;
/* 十栏之账（2026-09-25 自 data/csv/*.csv 全表全栏实测，基线 `ce708df`，口径同 conventions §7 ⚑H ⑤款：
 * 成对计、去重行；星号只计**长度恰为 2 之游程**所成之对，反引号顺序两两成对）。
 * 引者须连此基线与其口径一并引，不得视为定值。
 *
 * ★★ **星号之数须随书一个谓词：是否已施「反引号优先」之读法**（裁四十八①）。★★
 *   二者在本库差 **恰 1 对**，且其所在已实测定位：`people.notes` 之 `P_JILIANG`（季梁）行内
 *   `` `is_protagonist=**0**` `` —— 那一对星号落在 code span 之内，照裁四十八**不解析、原样照出**，
 *   故**它不再是一个粗体分隔符对**。于是：
 *     · 原口径（不问反引号）＝ **3045 对／406 行次**（＝ conventions §7 ⚑H 现行所载之数）；
 *     · 施反引号优先之后（即真正渲成 `<strong>` 者）＝ **3044 对／406 行次**。
 *   ★ 裁四十八②书「本条不伤任何一处现有之文」——**就渲染而言为真**（那一处正该字面照出）；
 *     **就计数而言则不然**，②款之数因之少一。本门两数并断，二者**俱不是「错的那个」**，
 *     错的是不书谓词而径引其一。已上报，见 `docs/delivery_vision_r53.md` §六。 */
const COLS = [
  // [栏, 星号对(原口径), 星号行, 反引号对, 反引号行, ⚑H 款属, 星号对(反引号优先后)]
  ["passages.modern_note", 1221, 137, 699, 119, "①", 1221],
  ["places.coord_basis", 628, 48, 550, 44, "②", 628],
  ["sources.notes", 426, 39, 315, 31, "②", 426],
  ["people.notes", 290, 36, 497, 42, "②", 289],
  ["events.summary", 172, 39, 222, 42, "②", 172],
  ["event_people.role_in_event", 118, 51, 91, 25, "①", 118],
  ["places.description", 116, 24, 173, 27, "②", 116],
  ["relations.source_note", 65, 30, 47, 19, "②", 65],
  ["archaeology.summary", 6, 1, 2, 1, "②", 6],
  ["people.relations", 3, 1, 6, 2, "第十栏·不渲", 3],
];

/* 全库十栏逐值复扫（在页面内跑，用的是生产之 mdInlineMarks／mdInlineFrag） */
const SWEEP = `(cols) => {
  const back = ${BACK};
  const TBL = { passages: DATA.passages, places: DATA.places, sources: DATA.sources,
                people: DATA.people, events: DATA.events, event_people: DATA.event_people,
                relations: DATA.relations, archaeology: DATA.archaeology, background: DATA.background };
  const out = { per: {}, bad: [], tickWins: [], nest: { codeInBold: 0, boldInCodeDom: 0, boldInCodeData: 0, cross: 0 }, plain: 0, plainOneNode: 0, allCols: [] };
  // ① 先自 DATA 重求「有记法之栏之集合」——★ 重求其集合，不只重数其成员（裁二十五③所拟之通例）
  for (const [tbl, rows] of Object.entries(TBL)) {
    for (const r of rows) for (const [k, v] of Object.entries(r)) {
      if (typeof v !== "string" || !v) continue;
      const m = mdInlineMarks(v);
      if (m.stars.length || m.code.length) {
        const key = tbl + "." + k;
        if (out.allCols.indexOf(key) < 0) out.allCols.push(key);
      }
    }
  }
  out.allCols.sort();
  // ② 逐值：往返还原、裸符、嵌套/交叉、零影响
  for (const [tbl, rows] of Object.entries(TBL)) {
    for (const r of rows) for (const [k, v] of Object.entries(r)) {
      if (typeof v !== "string" || !v) continue;
      const key = tbl + "." + k;
      const m = mdInlineMarks(v);
      const host = document.createElement("div");
      host.appendChild(mdInlineFrag(v));
      if (!m.stars.length && !m.code.length) {
        out.plain++;
        // 零影响之机械之证：二记法俱无者须落成**恰好一个文本节点**（与旧版 textContent 全等）
        if (host.childNodes.length === 1 && host.firstChild.nodeType === 3 && host.firstChild.textContent === v) out.plainOneNode++;
        else out.bad.push({ key, why: "二记法俱无之值未落成单一文本节点", got: host.childNodes.length + "/" + host.innerHTML.slice(0, 40) });
        continue;
      }
      const p = out.per[key] || (out.per[key] = { starPairs: 0, starRows: 0, codePairs: 0, codeRows: 0, rawPairs: 0, rawRows: 0 });
      if (m.stars.length) { p.starPairs += m.stars.length / 2; p.starRows++; }
      if (m.code.length) { p.codePairs += m.code.length / 2; p.codeRows++; }
      /* ★ 原口径（不问反引号）之数——用的是 r51 立条之 mdBoldMarks，一字未改，
       *   故此数与 conventions §7 ⚑H ⑤款所载同一算法。二数并出，方能看见裁四十八之实效。 */
      const raw = mdBoldMarks(v);
      if (raw.length) { p.rawPairs += raw.length / 2; p.rawRows++; }
      if (raw.length !== m.stars.length) out.tickWins.push({ key, id: r.id || (r.event_id + "/" + r.person_id), raw: raw.length / 2, after: m.stars.length / 2 });
      // 往返还原逐字全等
      if (back(host) !== v) out.bad.push({ key, why: "往返还原不等", got: back(host).slice(0, 80), want: v.slice(0, 80) });
      // code span 之内不得再有反引号；strong／code 之文本不得残留裸符之半
      for (const c of host.querySelectorAll("code")) {
        if (c.className !== "md-name") out.bad.push({ key, why: "code 之类名非 md-name", got: c.className });
        if (c.textContent.indexOf("\\u0060") >= 0) out.bad.push({ key, why: "code span 内残留反引号", got: c.textContent.slice(0, 40) });
        if (!c.textContent.length) out.bad.push({ key, why: "空 code span" });
      }
      // 嵌套与交叉之计。★ 两层须分清：
      //   codeInBold／boldInCodeDom 取 DOM 之实形——「渲出来长什么样」；
      //   boldInCodeData 取 数据之形（code span 之内是否有成对星号）——「数据里本来有什么」。
      //   裁四十八①之实效正在二者之别：数据里那 1 处在 DOM 里不复存在（不解析，故 code>strong 为 0）。
      out.nest.codeInBold += host.querySelectorAll("strong code").length;
      out.nest.boldInCodeDom += host.querySelectorAll("code strong").length;
      for (let j = 0; j < m.code.length; j += 2) {
        const inner = v.slice(m.code[j] + 1, m.code[j + 1]);
        const r2 = mdBoldMarks(inner);
        if (r2.length) out.nest.boldInCodeData += r2.length / 2;
      }
      // 交叉：本函数以构造保证不可能——落于 code span 内之星号不作分隔符。此处以「star 分隔符
      // 是否有一枚落在某 code span 之内」反证之，若有即交叉，必为 0。
      for (const si of m.stars) for (let j = 0; j < m.code.length; j += 2) {
        if (si > m.code[j] && si < m.code[j + 1]) out.nest.cross++;
      }
    }
  }
  return out;
}`;

(async () => {
  const pw = require("playwright");
  console.log("=== r53 走查门：⚑H 扩施七栏 ＋ 反引号一路（裁四十一、裁四十八）===\n");

  /* ================= §〇 锚定与前提 ================= */
  console.log("【〇】旧版源端之锚与对读之前提");
  const oldApp = gitShow("site/app.js"), oldCss = gitShow("site/styles.css");
  const OLD_REF_FULL = execFileSync("git", ["rev-parse", OLD_REF], { cwd: ROOT }).toString().trim();
  const oldInline = (String(oldApp).match(/mdInlineFrag/g) || []).length;
  const oldCodeCls = (String(oldCss).match(/\.md-name/g) || []).length;
  const oldInnerHTMLSum = (String(oldApp).match(/\.innerHTML = [^;]*\.summary/g) || []).length;
  console.log("  旧版源端锚定 " + OLD_REF + "（" + OLD_REF_FULL + "）");
  console.log("    · 其 app.js 内 mdInlineFrag 出现 " + oldInline + " 次");
  console.log("    · 其 styles.css 内 .md-name 出现 " + oldCodeCls + " 次");
  console.log("    · 其 app.js 内「innerHTML 拼 summary」之句 " + oldInnerHTMLSum + " 处（本件所治者）");
  if (oldInline !== 0 || oldCodeCls !== 0 || oldInnerHTMLSum !== 2) {
    throw new Error("锚定失效：旧版源端 " + OLD_REF + " 与本件之前一版不符（mdInlineFrag " + oldInline
      + " 处／.md-name " + oldCodeCls + " 处／innerHTML 拼 summary " + oldInnerHTMLSum
      + " 处，所期 0／0／2）——「旧版」等于新版，两版对读与 §三之二反证俱无意义。请核 OLD_REF。");
  }
  /* 新版源码实读：`innerHTML` 拼数据之句须已绝（⚑H ④款）。★ 判据取源码而非 DOM——
   * DOM 上看不出「这串字是拼出来的还是建出来的」，那正是此病难以察觉之处。 */
  const newApp = fs.readFileSync(path.join(SITE, "app.js"), "utf8");
  const newInnerHTMLSum = (newApp.match(/\.innerHTML = [^;]*\.summary/g) || []).length;
  const newInnerHTMLAll = (newApp.match(/\.innerHTML\s*=/g) || []).length;
  const oldInnerHTMLAll = (String(oldApp).match(/\.innerHTML\s*=/g) || []).length;
  ok(newInnerHTMLSum === 0, "源码实读：`innerHTML` 拼 `summary` 之句已绝（⚑H ④款明禁；旧版 2 处）", String(newInnerHTMLSum));
  ok(newInnerHTMLAll === oldInnerHTMLAll - 2, "全文 `.innerHTML =` 由旧版 " + oldInnerHTMLAll + " 处减为 " + newInnerHTMLAll
    + " 处（恰减本件所治之 2 处；余者系徽记 SVG 之注入，非数据之字，不在本件之域）", String(newInnerHTMLAll));
  console.log("  → 对读之前提成立\n");

  const sNew = await srv(SITE, null);
  const sOld = await srv(SITE, { "/app.js": oldApp, "/styles.css": oldCss });
  const NEW = "http://127.0.0.1:" + sNew.address().port;
  const OLD = "http://127.0.0.1:" + sOld.address().port;

  const browser = await pw.chromium.launch();
  const errs = [];
  const mkPage = async (base, width, tag) => {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) { } });
    const p = await ctx.newPage();
    p.on("pageerror", e => errs.push(tag + "@" + width + ":" + e.message));
    await p.goto(base + "/#/p/P_KONGZI/timeline", { waitUntil: "load" });
    await p.waitForTimeout(1200);
    return { ctx, p };
  };

  const N = await mkPage(NEW, 1440, "新版");
  const N375 = await mkPage(NEW, 375, "新版");
  const O = await mkPage(OLD, 1440, "旧版");

  /* ================= §一 纯函数断言 ================= */
  console.log("【一】mdInlineFrag() 切分断言（反引号优先＝裁四十八①；星号判据一字未改＝r51 裁五口径二）");
  const CASES = [
    // [入串, 期望之「拼法」（T=文本 S=strong C=code，嵌套以括号示）, 期望往返还原]
    ["", "", ""],
    [null, "", ""],
    ["谋主", "T", "谋主"],
    ["**粗**", "S", "**粗**"],
    ["`Q516`", "C", "`Q516`"],
    ["见 `Q516` 一条", "T,C,T", "见 `Q516` 一条"],
    ["**见 `Q516`**", "S(T,C)", "**见 `Q516`**"],                      // 粗体内含 code span（实测 242 处）
    ["`is_protagonist=**0**`", "C", "`is_protagonist=**0**`"],          // ★ 裁四十八②：code 内之星号原样照出
    ["**a`b**c`d", "T,C,T", "**a`b**c`d"],                             // ★ 交叉之形：反引号优先，星号遂落单成文字
    ["`未闭", "T", "`未闭"],                                            // 奇数反引号：落单者原样照出
    ["**未闭", "T", "**未闭"],                                          // 奇数星号：同 r51
    ["a`b`c`d", "T,C,T", "a`b`c`d"],                                   // 三枚反引号：末一枚落单
    ["***abc***", "T", "***abc***"],                                    // 游程非 2：原样（r51 之律未改）
    ["`a``b`", "C,C", "`a``b`"],                                        // 相邻两 span（本库无此形，立界不为今日）
    ["＊＊全角＊＊与｀全角反引号｀", "T", "＊＊全角＊＊与｀全角反引号｀"],   // 全角一律不认
  ];
  const r1 = await N.p.evaluate((cases) => {
    const spell = (frag) => [...frag.childNodes].map(n => {
      if (n.nodeType === 3) return "T";
      if (n.nodeName === "CODE") return "C";
      if (n.nodeName === "STRONG") {
        const inner = [...n.childNodes].map(x => x.nodeType === 3 ? "T" : (x.nodeName === "CODE" ? "C" : "?")).join(",");
        return inner === "T" ? "S" : "S(" + inner + ")";
      }
      return "?";
    }).join(",");
    const back = (el) => {
      const walk = (node) => [...node.childNodes].map(n => {
        if (n.nodeType === 3) return n.textContent;
        if (n.nodeName === "CODE") return "`" + walk(n) + "`";
        if (n.nodeName === "STRONG") return "**" + walk(n) + "**";
        return "\u0000" + n.nodeName;
      }).join("");
      return walk(el);
    };
    return cases.map(([inp]) => {
      const f = mdInlineFrag(inp);
      const host = document.createElement("div"); host.appendChild(f.cloneNode(true));
      return { spell: spell(f), back: back(host) };
    });
  }, CASES.map(c => [c[0]]));
  CASES.forEach(([inp, spell, back], i) => {
    const lab = "「" + (inp === null ? "null" : inp) + "」";
    ok(r1[i].spell === spell, lab + " 拼法", r1[i].spell + "（期 " + spell + "）");
    ok(r1[i].back === back, lab + " 往返还原全等", JSON.stringify(r1[i].back));
  });
  /* 零 XSS 面：数据无论写成什么样都不可能成为标记 */
  const xss = await N.p.evaluate(() => {
    const evil = '`<script>alert(1)</script>` **<img src=x onerror=y>** " onmouseover="z';
    const host = document.createElement("div"); host.appendChild(mdInlineFrag(evil));
    return { tags: [...host.querySelectorAll("*")].map(e => e.nodeName).join(","), text: host.textContent, evil };
  });
  ok(xss.tags === "CODE,STRONG", "零 XSS 面：喂入 `<script>`／`onerror=`／属性逃逸之串，所生元素只有 CODE 与 STRONG", xss.tags);
  ok(xss.text === xss.evil.replace(/`/g, "").replace(/\*\*/g, ""), "零 XSS 面：其每一字符仍以字面出场（只少了记号本身）");

  /* ================= §二 全库十栏逐值复扫 ================= */
  console.log("\n【二】全库逐值复扫（往返还原／裸符／嵌套交叉／零影响，用的是生产之 mdInlineFrag）");
  const sw = await N.p.evaluate(eval("(" + SWEEP + ")"), COLS);
  ok(sw.bad.length === 0, "逐值断言零不符（往返还原逐字全等／无裸符残留／类名皆 md-name／二记法俱无者单一文本节点）",
    sw.bad.length ? JSON.stringify(sw.bad.slice(0, 4)) : "零不符（含记法之值 " + Object.values(sw.per).reduce((a, p) => a + Math.max(p.starRows, p.codeRows), 0) + " 之属，另无记法之值 " + sw.plain + " 个）");
  ok(sw.plain === sw.plainOneNode, "二记法俱无之值 " + sw.plain + " 个**逐个**落成恰好一个文本节点（零影响之机械之证，非抽样）",
    sw.plainOneNode + " / " + sw.plain);
  /* ★ 重求其集合，不只重数其成员 */
  const wantCols = COLS.map(c => c[0]).sort();
  ok(JSON.stringify(sw.allCols) === JSON.stringify(wantCols),
    "自 `site/data/` 重求「有记法之栏」之集合＝十栏，与 conventions §7 ⚑H 所载逐栏相符（**重求集合，不只重数成员**）",
    sw.allCols.length + " 栏" + (JSON.stringify(sw.allCols) === JSON.stringify(wantCols) ? "" : "：" + JSON.stringify(sw.allCols)));
  let sumRP = 0, sumRR = 0, sumSP = 0, sumCP = 0, sumCR = 0;
  for (const [col, sp, sr, cp, cr, kuan, spAfter] of COLS) {
    const g = sw.per[col] || { starPairs: 0, starRows: 0, codePairs: 0, codeRows: 0, rawPairs: 0, rawRows: 0 };
    sumRP += g.rawPairs; sumRR += g.rawRows; sumSP += g.starPairs; sumCP += g.codePairs; sumCR += g.codeRows;
    ok(g.rawPairs === sp && g.rawRows === sr && g.starPairs === spAfter && g.codePairs === cp && g.codeRows === cr,
      "⚑H " + kuan + "款 `" + col + "`：星号 " + sp + " 对／" + sr + " 行（原口径）"
      + (spAfter === sp ? "" : "、**" + spAfter + " 对（施反引号优先之后）**") + "，反引号 " + cp + " 对／" + cr + " 行",
      g.rawPairs + "/" + g.rawRows + " · 后 " + g.starPairs + " · " + g.codePairs + "/" + g.codeRows);
  }
  ok(sumRP === 3045 && sumRR === 406, "十栏星号合计 **3045 对／406 行次**〔谓词：**原口径，不问反引号**；算法同 `mdBoldMarks`，"
    + "＝conventions §7 ⚑H ⑤款现行所载之数；基线 " + OLD_REF + "〕", sumRP + " / " + sumRR);
  ok(sumSP === 3044, "十栏星号合计 **3044 对**〔谓词：**施反引号优先之后**，即真渲成 `<strong>` 者〕"
    + " —— ★ 与上条差恰 1 对，此差是裁四十八之实效，非数据之变", String(sumSP));
  ok(sw.tickWins.length === 1 && sw.tickWins[0].key === "people.notes" && sw.tickWins[0].id === "P_JILIANG",
    "★ 两口径之差**逐条定位到唯一一处**：`people.notes` 之 `P_JILIANG`（季梁）行，"
    + "18 对 → 17 对 —— 其 `` `is_protagonist=**0**` `` 内之星号照裁四十八不解析",
    JSON.stringify(sw.tickWins));
  ok(sumCP === 2602 && sumCR === 352, "十栏反引号合计 2602 对／352 行次（裁四十一之实数，本轮复跑相符）", sumCP + " / " + sumCR);
  ok(sw.nest.codeInBold === 242, "二记法相遇·粗体内含 code span：DOM 实形 **242 处**（裁四十八之实数）", String(sw.nest.codeInBold));
  ok(sw.nest.boldInCodeData === 1 && sw.nest.boldInCodeDom === 0,
    "二记法相遇·code span 内含成对星号：**数据 1 处，而 DOM 里 0 处** —— ★ 二数之别即裁四十八①之落地之证"
    + "（那一处不解析、字面照出，故 DOM 内无 `code > strong`）",
    "数据 " + sw.nest.boldInCodeData + " / DOM " + sw.nest.boldInCodeDom);
  ok(sw.nest.cross === 0, "★ 二记法**交叉 0 处** —— 此是「顺序扫描之纯函数足用、不引第三方 markdown 库」之依据（红线六）；"
    + "且本函数以构造保证其不可能（落于 code span 内之星号不作分隔符）", String(sw.nest.cross));

  /* ================= §三 落点逐个实渲 ================= */
  console.log("\n【三】落点逐个实渲（★ 以生产渲染函数驱之，不以『我改了那一行』为证）");
  const SPOTS = await N.p.evaluate(() => {
    const back = (el) => {
      const walk = (node) => [...node.childNodes].map(n => {
        if (n.nodeType === 3) return n.textContent;
        if (n.nodeName === "CODE") return "`" + walk(n) + "`";
        if (n.nodeName === "STRONG") return "**" + walk(n) + "**";
        return "\u0000" + n.nodeName;
      }).join("");
      return walk(el);
    };
    const pick = (rows, f) => rows.find(r => { const v = f(r); return v && v.indexOf("`") >= 0; });
    const rep = (name, col, host, raw, sel) => {
      const el = sel ? host.querySelector(sel) : host;
      const codes = el ? el.querySelectorAll("code.md-name") : [];
      return {
        name, col, ok: !!el && codes.length > 0,
        codes: codes.length, strongs: el ? el.querySelectorAll("strong").length : 0,
        bare: el ? (el.textContent.indexOf("`") >= 0) : true,
        sample: codes.length ? codes[0].textContent : "",
        roundtrip: el ? back(el) : null, raw,
      };
    };
    const out = [];

    // 1. people.notes —— ★ 其落点只在 `short_bio` 阙如时出，而今日含记法之 42 行一律有小传，
    //    故库内无一行走得上此路。照「按类反证」之精神**注入同型之行**立断言（design_notes §7.2）。
    const pn = pick(DATA.people, r => r.notes);
    const inject = { id: "__QA_TMP__", name: "试注之人", notes: pn.notes, short_bio: "", is_protagonist: "0" };
    PEOPLE[inject.id] = inject;
    const li = personCardLi({ id: inject.id, color: "#000", badge: "", fallback: "?" });
    delete PEOPLE[inject.id];
    out.push(Object.assign(rep("选人卡注文（app.js personCardLi）", "people.notes", li, pn.notes, ".card-info p"),
      { injected: true, srcId: pn.id }));

    // 2. events.summary —— 事目卡摘要（人物时间线与编年共用 eventBodyNode）
    const evS = pick(DATA.events, r => r.summary);
    const body = document.createElement("div"); body.appendChild(eventBodyNode(evS, { people: true }));
    out.push(Object.assign(rep("事目卡摘要（eventBodyNode）", "events.summary", body, evS.summary, "p"), { srcId: evS.id }));

    // 3. events.summary —— 并观交会弹卡（旧走 innerHTML，本件改为建节点）
    const mv = cmpMeetEvNode("#000", "试", evS);
    out.push(Object.assign(rep("并观交会弹卡（cmpMeetEvNode，原 innerHTML）", "events.summary", mv, evS.summary, "span"), { srcId: evS.id }));

    // 4./5. places.coord_basis／places.description（buildPlaceContent 之共用 row 助手）
    const plC = pick(DATA.places, r => r.coord_basis);
    const dlC = buildPlaceContent(plC, []);
    out.push(Object.assign(rep("地点卡·坐标依据（buildPlaceContent row）", "places.coord_basis", dlC, plC.coord_basis, null), { srcId: plC.id }));
    const plD = pick(DATA.places, r => r.description);
    const dlD = buildPlaceContent(plD, []);
    out.push(Object.assign(rep("地点卡·说明（同一 row 助手）", "places.description", dlD, plD.description, null), { srcId: plD.id }));

    // 6. relations.source_note（relDetailBody）
    const rl = pick(DATA.relations, r => r.source_note);
    const rb = document.createElement("div"); rb.appendChild(relDetailBody([rl], null));
    out.push(Object.assign(rep("关系详情·依据（relDetailBody）", "relations.source_note", rb, rl.source_note, ".rel-note"), { srcId: rl.id }));

    // 7. passages.modern_note 之二落点（层标 `.q-caveat` ＋ 页脚 `footer`）
    const qs = pick(DATA.passages, r => splitCaveat(r.modern_note).caveat);
    const hostQ = document.createElement("div");
    hostQ.appendChild(eventQuotesFrag(DATA.events.find(e => e.id === qs.event_id)));
    const bq = hostQ.querySelector('blockquote.quote[data-qid="' + qs.id + '"]');
    out.push(Object.assign(rep("引文卡·编者层标（eventQuotesFrag）", "passages.modern_note", bq, splitCaveat(qs.modern_note).caveat, "p.q-caveat"), { srcId: qs.id }));
    const qf = pick(DATA.passages, r => splitCaveat(r.modern_note).rest);
    const hostF = document.createElement("div");
    hostF.appendChild(eventQuotesFrag(DATA.events.find(e => e.id === qf.event_id)));
    const bqf = hostF.querySelector('blockquote.quote[data-qid="' + qf.id + '"]');
    out.push(Object.assign(rep("引文卡·页脚余段（eventQuotesFrag）", "passages.modern_note", bqf, splitCaveat(qf.modern_note).rest, "footer"), { srcId: qf.id }));

    // 8. event_people.role_in_event 之二落点（胶囊首句／卡内全文）
    const epR = DATA.event_people.find(l => l.role_in_event && l.role_in_event.indexOf("`") >= 0 && l.role_in_event.length > 60);
    const evR = DATA.events.find(e => e.id === epR.event_id);
    const fake = Object.assign({}, evR, { role: epR.role_in_event });
    const hostR = document.createElement("div"); hostR.appendChild(eventBodyNode(fake, { personal: true }));
    out.push(Object.assign(rep("役之全文·卡内（eventBodyNode p.evt-role-note）", "event_people.role_in_event", hostR, epR.role_in_event, ".evt-role-note"), { srcId: epR.event_id + "/" + epR.person_id }));

    return out;
  });
  for (const s of SPOTS) {
    ok(s.ok && !s.bare, "落点「" + s.name + "」渲 `" + s.col + "`：见 " + s.codes + " 枚 `code.md-name`、"
      + s.strongs + " 枚 `strong`，**文本内零裸反引号**" + (s.injected ? "（★ 注入同型之行所测，其由见下）" : ""),
      s.srcId + (s.sample ? " 首枚「" + s.sample + "」" : ""));
  }
  /* 胶囊之首句一路（role-chip）在真页面上量——其值须经 roleParts 再经 mdInlineFrag */
  const chipRes = await N.p.evaluate(() => {
    const out = { n: 0, withCode: 0, bare: 0, samples: [] };
    for (const l of DATA.event_people) {
      if (!l.role_in_event) continue;
      const rp = roleParts(l.role_in_event);
      const span = document.createElement("span");
      span.appendChild(mdInlineFrag(rp.head + " · 相关"));
      out.n++;
      const c = span.querySelectorAll("code.md-name").length;
      if (c) out.withCode++;
      if (span.textContent.indexOf("`") >= 0) { out.bare++; out.samples.push(l.event_id + "/" + l.person_id); }
    }
    return out;
  });
  ok(chipRes.bare === 0, "役签胶囊 " + chipRes.n + " 枚：其中 " + chipRes.withCode + " 枚含库内之名，**一枚不留裸反引号**（截点已避 code span）",
    chipRes.bare ? JSON.stringify(chipRes.samples.slice(0, 5)) : "零裸符");
  /* ★ people.notes 之实读：本栏之落点今日一行走不上——如实记，不以注入之绿掩其实 */
  const pnReach = await N.p.evaluate(() => {
    const mk = DATA.people.filter(r => r.notes && (r.notes.indexOf("`") >= 0 || /\*\*/.test(r.notes)));
    return { marked: mk.length, noBio: mk.filter(r => !(r.short_bio || "").trim()).length };
  });
  /* ★ 裁二十六所问之「`:1278` `b.title` 是否真漏于读者」——本轮实测其答。
   *   其宿主 `eventPeopleNode()` 只在 `opts.people` 时出，而该 opts 只有**编年视图**用
   *   （`eventBodyNode(evt, { people: true })`）。故于编年视图真渲之后，数其 `title` 内之裸符。 */
  await N.p.goto(NEW + "/#/chronicle", { waitUntil: "load" });
  await N.p.waitForTimeout(1800);
  const titleLeak = await N.p.evaluate(() => {
    /* 不扫页面（编年分批渲，必漏），直调生产之 eventBodyNode 逐事目建之 */
    let nodes = 0, bare = 0, bareStar = 0; const sample = [];
    for (const e of DATA.events) {
      const host = document.createElement("div");
      host.appendChild(eventBodyNode(e, { people: true }));
      for (const b of host.querySelectorAll(".ep-chip, button")) {
        if (!b.title) continue;
        nodes++;
        const t = (b.title.match(/`/g) || []).length;
        const s = (b.title.match(/\*\*/g) || []).length;
        if (t) { bare += t; if (sample.length < 4) sample.push(e.id + "：" + b.title.slice(0, 48)); }
        if (s) bareStar += s;
      }
    }
    return { nodes, bare, bareStar, sample };
  });
  ok(titleLeak.bare > 0, "★ 裁二十六之问，本轮验到其答：`:1278` `b.title`（编年视图人物签之 tooltip）"
    + "实载 `role_in_event` 之**裸反引号 " + titleLeak.bare + " 枚、裸星号 " + titleLeak.bareStar + " 枚**"
    + " —— **确漏于读者**（悬停即见）。★ 本件不治（`title` 装不了元素节点），已列交付文档 §三 title 清单",
    titleLeak.nodes + " 枚人物签；例：" + (titleLeak.sample[0] || ""));
  /* ★ `innerHTML` 余处之逐类分账（源码实读；断言写死其数，他日有人再拼数据进串即当场红） */
  /* ★ 判据须取**整句**而非单行——`:3445` 之属其 `personName()` 落在续行上，
   *   只看 `.innerHTML =` 那一行必数得 0（首跑即如此，已改）。故自该行起取至分号收句。 */
  const appLines = newApp.split("\n");
  const ihLines = appLines.map((l, i) => [i + 1, l]).filter(([, l]) => /\.innerHTML\s*=/.test(l));
  const stmtOf = (n) => {
    let s = "";
    for (let i = n - 1; i < appLines.length && i < n + 5; i++) { s += appLines[i]; if (/;\s*$/.test(appLines[i])) break; }
    return s;
  };
  const ihSvg = ihLines.filter(([n]) => /fetchSVG|baseMapText/.test(stmtOf(n))).length;
  const ihData = ihLines.filter(([n]) => /personName\(|\.title\b/.test(stmtOf(n))).length;
  ok(ihLines.length === 14 && ihSvg === 8 && ihData === 2,
    "`.innerHTML =` 余 14 处之分账：SVG／底图之注入 **8**、**句内直见数据者 2**（`:3445`／`:3450`，"
    + "载 `personName()` ＋ `events.title`）、写死静态串 2、代码算出之文字 1、经参数传入者 1（见下条）"
    + " —— 俱非 ⚑H 十栏，故不在 ④款之域；本件不扩其面，登记呈裁",
    "共 " + ihLines.length + "（SVG " + ihSvg + " / 句内直见数据 " + ihData + "）：行 " + ihLines.map(([n]) => n).join(","));
  /* ★ 第三处（`:3379`）之数据系**经参数**传入，上条之谓词（句内找 `personName(`／`.title`）照不到它——
   *   故不硬凑其数，另立一条按其实情断之。**谓词须书明其所照与所不照**，否则数出来的是自己设的靶。 */
  const ih3379 = ihLines.find(([n]) => /\+ name \+/.test(stmtOf(n)));
  const ihCaller = /item\(cmp\.colorA, "A", personName\(/.test(newApp);
  ok(!!ih3379 && ihCaller, "★ 第三处拼数据者系**经参数**：`:" + (ih3379 ? ih3379[0] : "?")
    + "` 句内作 `+ name +`，而其调用处 `item(cmp.colorA, \"A\", personName(cmp.A), …)` 传入之正是人名"
    + " —— 故**拼数据者实共 3 处**（2 直见 ＋ 1 经参数），与交付文档 §五所列同",
    ih3379 ? "行 " + ih3379[0] + "；调用处可核 " + ihCaller : "未见");
  ok(pnReach.marked === 42 && pnReach.noBio === 0,
    "★ `people.notes` 之实读：含记法者 42 行，其中**无 `short_bio` 者 0 行** —— 故 `:838` 之落点今日"
    + "**一行也渲不出**（该分支只在小传阙如时出）。已治其路，然**今日无读者可见之改善**；"
    + "此与 design_notes §3.6.1「读者可见者…people.notes 28 行 175 处」不符，已就地加注并上报",
    pnReach.marked + " 行含记法 / " + pnReach.noBio + " 行无小传");

  /* ================= §三之二 按类反证 ================= */
  console.log("\n【三之二】★ 按类反证：同一量法施于旧版（" + OLD_REF + "）须当场测出**裸反引号**，否则本门测的不是它");
  const OLDSPOTS = await O.p.evaluate(() => {
    const out = [];
    const pick = (rows, f) => rows.find(r => { const v = f(r); return v && v.indexOf("`") >= 0; });
    const probe = (name, host, sel) => {
      const el = sel ? host.querySelector(sel) : host;
      return { name, bare: el ? (el.textContent.match(/`/g) || []).length : -1, codes: el ? el.querySelectorAll("code").length : -1 };
    };
    const evS = pick(DATA.events, r => r.summary);
    const body = document.createElement("div"); body.appendChild(eventBodyNode(evS, { people: true }));
    out.push(probe("事目卡摘要", body, "p"));
    const plC = pick(DATA.places, r => r.coord_basis);
    out.push(probe("地点卡·坐标依据", buildPlaceContent(plC, []), null));
    const rl = pick(DATA.relations, r => r.source_note);
    const rb = document.createElement("div"); rb.appendChild(relDetailBody([rl], null));
    out.push(probe("关系详情·依据", rb, ".rel-note"));
    const qs = pick(DATA.passages, r => splitCaveat(r.modern_note).caveat);
    const hostQ = document.createElement("div");
    hostQ.appendChild(eventQuotesFrag(DATA.events.find(e => e.id === qs.event_id)));
    out.push(probe("引文卡·编者层标", hostQ.querySelector('blockquote.quote[data-qid="' + qs.id + '"]'), "p.q-caveat"));
    return out;
  });
  for (const s of OLDSPOTS) {
    ok(s.bare > 0 && s.codes === 0, "旧版「" + s.name + "」实测裸反引号 " + s.bare + " 枚、`code` 元素 0 个 —— **本门测得出这个病**",
      "裸符 " + s.bare + " / code " + s.codes);
  }
  if (!OLDSPOTS.every(s => s.bare > 0 && s.codes === 0)) {
    throw new Error("按类反证失守：旧版未测出裸反引号——则 §二§三之绿不能证明本门测的是反引号，停门。");
  }
  /* 旧版之 `innerHTML` 一路亦须当场证其为病：拼串之处，数据若含 `<` 即成标记 */
  const oldInj = await O.p.evaluate(() => {
    const ev = { id: "__QA__", title: "试", summary: "此处<b>本不该</b>成标记 `Q1`" };
    const box = document.createElement("div");
    const p = document.createElement("p");
    p.innerHTML = '<i></i><b>甲</b> · ' + ev.title + "<br><span>" + (ev.summary || "") + "</span>";
    box.appendChild(p);
    return { bTags: box.querySelectorAll("span b").length, text: box.querySelector("span").textContent };
  });
  ok(oldInj.bTags === 1, "旧版之 `innerHTML` 一路：注入 `<b>` 之摘要**当场成了真标记**（1 枚 B 元素）"
    + " —— 此即 ⚑H ④款所禁者之实证，非推论", "B 元素 " + oldInj.bTags + " 枚");
  const newInj = await N.p.evaluate(() => {
    const ev = { id: "__QA__", title: "试", summary: "此处<b>本不该</b>成标记 `Q1`" };
    const box = document.createElement("div");
    box.appendChild(cmpMeetEvNode("#000", "甲", ev));
    return { bTags: box.querySelectorAll("span b").length, codes: box.querySelectorAll("span code.md-name").length, text: box.querySelector("span").textContent };
  });
  ok(newInj.bTags === 0 && newInj.codes === 1 && newInj.text === "此处<b>本不该</b>成标记 Q1",
    "新版同一注入：B 元素 0 枚、`code.md-name` 1 枚，`<b>` 以**字面**出场 —— 注入面归零",
    "B " + newInj.bTags + " / code " + newInj.codes);

  /* ================= §四 零影响之证（新旧两源端对读）================= */
  console.log("\n【四】零影响之证（新旧两源端对读，同一份 site/data/）");
  /* 四之一：`roleParts()` 694 行之出与旧版逐字全等——本件为其加了「截点避 code span」一闸，
   * 须证其今日一行不受影响（实测 103 个分者之截点无一落入 code span）。 */
  const rpNew = await N.p.evaluate(() => DATA.event_people.map(l => l.role_in_event ? JSON.stringify(roleParts(l.role_in_event)) : ""));
  const rpOld = await O.p.evaluate(() => DATA.event_people.map(l => l.role_in_event ? JSON.stringify(roleParts(l.role_in_event)) : ""));
  const rpDiff = rpNew.filter((x, i) => x !== rpOld[i]);
  ok(rpNew.length === rpOld.length && rpDiff.length === 0,
    "`roleParts()` 694 行之出与旧版**逐字全等**（新增之「截点避 code span」一闸今日一行未触发，系为后来所设）",
    rpDiff.length ? rpDiff.length + " 行有差：" + rpDiff[0].slice(0, 80) : "零差异（" + rpNew.length + " 行）");
  /* 四之二：引文卡逐卡对读（509 张）。判据＝把新版之两种元素还原成记号后与旧版逐位比。
   * ★ 取卡之法照 `vision_r51.js` §四：**逐事目直调生产之 `eventQuotesFrag()`**，不扫页面 DOM——
   *   编年视图之卡是分批渲的，扫 DOM 只取得当时已渲之数（实测 69 张），必漏且**静默地漏**。 */
  const COLLECT = `() => {
    const out = [];
    for (const e of DATA.events) {
      const host = document.createElement("div");
      host.appendChild(eventQuotesFrag(e));
      for (const bq of host.querySelectorAll("blockquote.quote")) out.push({ qid: bq.dataset.qid, html: bq.outerHTML });
    }
    return out;
  }`;
  const newCards = await N.p.evaluate(eval("(" + COLLECT + ")"));
  const oldCards = await O.p.evaluate(eval("(" + COLLECT + ")"));
  ok(newCards.length === 509 && oldCards.length === 509, "两版各渲出 509 张引文卡", newCards.length + " / " + oldCards.length);
  ok(oldCards.every(c => !/<code/i.test(c.html)), "旧版卡内本无 `<code>`（对读之前提成立）");
  /* ★ 分桶之判据取**反引号之有无**，不取「二记法之有无」——此处易错，故记其所以：
   *   `OLD_REF`（`ce708df`＝r52 收官）**已含 r51 之 `mdBoldFrag`**，故旧版卡内本就有 `<strong>`。
   *   若照 r51 门之式把新版 `<strong>` 也还原成 `**` 去比旧版，比的是「新版之星号记法」对
   *   「旧版之 `<strong>` 元素」——两边根本不同物，必假红（首跑即如此：137 张假红，
   *   其长差恰 25×13 等于 `<strong>` 标签之字符数，一算便知）。**本轮新增者只有 `<code>` 一式**，
   *   故只还原它；星号一路两版全同，正该落进「逐位全等」那一桶。 */
  const markSet = new Set(await N.p.evaluate(() => DATA.passages.filter(q => {
    const { caveat, rest } = splitCaveat(q.modern_note);
    return mdCodeMarks(caveat).length || mdCodeMarks(rest).length;
  }).map(q => q.id)));
  const unback = (h) => h.replace(/<code class="md-name">/g, "`").replace(/<\/code>/g, "`");
  let same = 0, folded = 0; const plainDiff = [], markDiff = [];
  for (let i = 0; i < newCards.length; i++) {
    const a = oldCards[i], b = newCards[i];
    if (a.qid !== b.qid) { markDiff.push({ qid: a.qid + "≠" + b.qid, why: "次序不一致" }); continue; }
    if (markSet.has(b.qid)) {
      if (unback(b.html) === a.html) folded++; else markDiff.push({ qid: b.qid, len: [a.html.length, unback(b.html).length] });
    } else {
      if (a.html === b.html) same++; else plainDiff.push({ qid: b.qid });
    }
  }
  ok(plainDiff.length === 0, "**无反引号之卡 " + same + " 张：`outerHTML` 与旧版逐位全等**（零影响之证；"
    + "★ 其中含只有星号者——那一路两版全同，故正该落此桶）",
    plainDiff.length ? JSON.stringify(plainDiff.slice(0, 5)) : "零差异");
  ok(markDiff.length === 0, "含反引号之卡 " + folded + " 张：两版之差**只有** `` `x` ``→`<code class=\"md-name\">x</code>` **一式**，无他差",
    markDiff.length ? JSON.stringify(markDiff.slice(0, 5)) : "无他差");
  ok(same + folded === 509, "两类相加＝509，无卡漏检", same + "+" + folded);
  ok(markSet.size === 119, "含反引号之卡 **119 张**（＝`modern_note` 反引号之行次）；另 137 行含星号，"
    + "二者交 108 行、并 148 行 —— ★ 并集须实求，不得以两数相加代之", String(markSet.size));
  ok(same === 390, "无反引号之卡 **390 张**（509－119），逐张实比、无抽样", String(same));
  /* ★ r51／r52 两门转红之量化归因（本门不治其红，只把「红在何处」量清，供下轮排期）：
   *   二门之逆函数只识 `**`，故凡含反引号之卡，其还原必不等。所差之数须恰等于反引号之行数。 */
  const tickOnly = new Set(await N.p.evaluate(() => DATA.passages.filter(q => {
    const { caveat, rest } = splitCaveat(q.modern_note);
    return mdCodeMarks(caveat).length || mdCodeMarks(rest).length;
  }).map(q => q.id)));
  ok(tickOnly.size === 119, "★ `modern_note` 含反引号者 119 行 —— r51 门 §四转红之 11＋108＝119 张恰是此数，"
    + "**其红全由二门之逆函数只识 `**` 所致，一张不多、一张不少**（归因之证，非推测）", String(tickOnly.size));

  /* ================= §五 二案之量（供裁，非断言）================= */
  console.log("\n【五】反引号渲法二案之量（★ 供裁之实据；渲法系设计之决，Vision 不自行落定）");
  /* 案乙＝删去 styles.css 内「候裁·案甲之三行」那一块。此处以 CSS 覆盖等效地关掉三行。 */
  const YI_CSS = ".md-name{background:none!important;border-radius:0!important;padding:0!important}";
  const MEASURE = `() => {
    const pick = (rows, f, min) => rows.filter(r => { const v = f(r); return v && (v.match(/\\u0060/g) || []).length >= (min || 2); });
    const host = document.createElement("div");
    /* ★ 量器之宽须随视口，不得写死——否则「375px 那一行」量的还是 640px，两宽之数必逐位相同，
     *   而那种「相同」是 harness 测错了对象，不是实况（首跑即如此，已改）。
     *   min(640px, 100vw - 32px)：宽屏取 640（近卡内实宽），窄屏取视口减 16px 左右留白。 */
    host.style.cssText = "position:absolute;left:0;top:0;width:min(640px, calc(100vw - 32px));font-size:0.9rem;line-height:1.65";
    document.body.appendChild(host);
    const out = [];
    const dense = [["places.coord_basis", DATA.places.find(r => r.id === "L_HUAN").coord_basis],
                   ["sources.notes", DATA.sources.find(r => r.id === "J002").notes],
                   ["people.notes", DATA.people.find(r => r.id === "P_CHUWU").notes],
                   ["events.summary", DATA.events.filter(e => e.summary && e.summary.indexOf("\\u0060") >= 0)
                      .sort((a, b) => (b.summary.match(/\\u0060/g) || []).length - (a.summary.match(/\\u0060/g) || []).length)[0].summary]];
    for (const [col, v] of dense) {
      host.textContent = "";
      host.appendChild(mdInlineFrag(v));
      const r = host.getBoundingClientRect();
      const codes = [...host.querySelectorAll("code.md-name")];
      const cw = codes.map(c => +c.getBoundingClientRect().width.toFixed(2));
      /* ★「补丁墙」之实测：按 span 之盒顶归行，数一行之内最多几枚——
       *   此是案甲之弊之唯一可量之说法（「看着吵」不可证伪，「一行里有 N 块底」可证）。 */
      const byLine = {};
      for (const c of codes) {
        const t = Math.round(c.getBoundingClientRect().top);
        byLine[t] = (byLine[t] || 0) + 1;
      }
      const per = Object.values(byLine);
      out.push({ col, chars: v.length, spans: codes.length, h: +r.height.toFixed(2),
                 lines: Math.round(r.height / (parseFloat(getComputedStyle(host).fontSize) * 1.65)),
                 codeW: +cw.reduce((a, b) => a + b, 0).toFixed(1),
                 maxPerLine: per.length ? Math.max.apply(null, per) : 0,
                 linesWithName: per.length });
    }
    host.remove();
    return out;
  }`;
  const runBoth = async (p, label) => {
    const a = await p.evaluate(eval("(" + MEASURE + ")"));
    await p.addStyleTag({ content: YI_CSS });
    const b = await p.evaluate(eval("(" + MEASURE + ")"));
    console.log("    【" + label + "】最密之四值（案甲＝淡底衬名｜案乙＝只易其字）：");
    console.log("      栏\t字数\tspan\t甲·高\t甲·行\t乙·高\t乙·行\tΔ高\tΔ行\t一行最多几枚\t有名之行");
    for (let i = 0; i < a.length; i++) {
      console.log("      " + [a[i].col, a[i].chars, a[i].spans, a[i].h, a[i].lines, b[i].h, b[i].lines,
        (a[i].h - b[i].h).toFixed(2), a[i].lines - b[i].lines, a[i].maxPerLine, a[i].linesWithName].join("\t"));
    }
    return { a, b };
  };
  const wide = await runBoth(N.p, "1440px 视口／量器 640px／0.9rem");
  const narrow = await runBoth(N375.p, "375px 视口／量器 343px（＝100vw−32）／0.9rem");
  ok(wide.a.length === 4 && narrow.a.length === 4,
    "二案于二宽各量四处最密之值（`L_HUAN` 64 枚／`J002` 65 枚／`P_CHUWU` 53 枚／`events.summary` 之最密者）",
    "甲 span 合计 " + wide.a.reduce((s, x) => s + x.spans, 0) + " 枚");
  const dH = wide.a.map((x, i) => +(x.h - wide.b[i].h).toFixed(2));
  const dHn = narrow.a.map((x, i) => +(x.h - narrow.b[i].h).toFixed(2));
  const maxLine = Math.max.apply(null, wide.a.map(x => x.maxPerLine));
  console.log("    ★ 读法三条：");
  console.log("      ① Δ高 > 0 ＝ 案甲之「面」把该值推高了（内边距累计所致）；Δ行即多出之行数。");
  console.log("      ② 「一行最多几枚」是**补丁墙之量**——案乙此数无意义（无面可数），故只列案甲之数。");
  console.log("      ③ 二案之别只在 styles.css 一块三行，落定之后 app.js 一字不动。");
  ok(true, "（供裁之量，非断言）案甲对案乙之盒高差：宽 " + JSON.stringify(dH) + " px／窄 " + JSON.stringify(dHn) + " px");
  ok(true, "（供裁之量，非断言）案甲最密之行实载库内之名 " + maxLine + " 枚（逐值之数见上表末二列）");

  /* ★ 案甲之弱点，目视所见而以量证之：其淡底**在层色卡面上弱于绢帛底**。
   *   量法：把 `.md-name` 真渲进各类落点，**逐层向上合成**其实际所坐之底（`rgba` 逐层叠），
   *   再把 `rgba(46,42,36,0.06)` 叠上去，报**相对亮度之差**（WCAG 之 L，同 §2.8 之口径）。
   *   ★ 不取 `getComputedStyle(.md-name).backgroundColor`——那只吐回声明之 `rgba`，不是它坐在什么上面。 */
  const tint = await N.p.evaluate(() => {
    const parse = (s) => { const m = s.match(/[\d.]+/g); return m ? [+m[0], +m[1], +m[2], m.length > 3 ? +m[3] : 1] : null; };
    const over = (fg, bg) => [0, 1, 2].map(i => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat([1]);
    /* WCAG 相对亮度（口径同 design_notes §2.8 诸实测，故此数与该节可对读） */
    const lum = (c) => {
      const [r, g, b] = c.map(x => { const v = x / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const effBg = (el) => {
      const stack = [];
      for (let n = el.parentElement; n; n = n.parentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c && c[3] > 0) { stack.push(c); if (c[3] === 1) break; }
      }
      let bg = [255, 255, 255, 1];
      for (let i = stack.length - 1; i >= 0; i--) bg = over(stack[i], bg);
      return bg;
    };
    const out = [];
    const probe = (label, el) => {
      const c = el.querySelector("code.md-name");
      if (!c) return;
      const bg = effBg(c);
      const tinted = over([46, 42, 36, 0.06], bg);
      out.push({ label, bg: bg.slice(0, 3).map(x => Math.round(x)).join(","),
                 dL: +(lum(bg.slice(0, 3)) - lum(tinted.slice(0, 3))).toFixed(4) });
    };
    const pick = (rows, f) => rows.find(r => { const v = f(r); return v && v.indexOf("`") >= 0; });
    const mount = document.createElement("div");
    mount.style.cssText = "position:absolute;left:0;top:0;width:640px";
    document.body.appendChild(mount);
    const qs = pick(DATA.passages, r => splitCaveat(r.modern_note).rest);
    const h1 = document.createElement("div");
    h1.appendChild(eventQuotesFrag(DATA.events.find(e => e.id === qs.event_id)));
    mount.appendChild(h1);
    const bq = h1.querySelector('blockquote.quote[data-qid="' + qs.id + '"]');
    if (bq) { probe("引文卡页脚（层色淡底之上）", bq.querySelector("footer") || bq); }
    const cav = pick(DATA.passages, r => splitCaveat(r.modern_note).caveat);
    const h2 = document.createElement("div");
    h2.appendChild(eventQuotesFrag(DATA.events.find(e => e.id === cav.event_id)));
    mount.appendChild(h2);
    const bq2 = h2.querySelector('blockquote.quote[data-qid="' + cav.id + '"]');
    if (bq2) probe("编者层标（暖赭淡底之上）", bq2.querySelector("p.q-caveat") || bq2);
    const plC = pick(DATA.places, r => r.coord_basis);
    const dl = buildPlaceContent(plC, []); mount.appendChild(dl);
    probe("地点卡 dd（绢帛／卡面）", dl);
    mount.remove();
    return out;
  });
  console.log("    ★ 案甲之淡底，于各类落点实际所坐之底上之相对亮度差（ΔL，越小越看不出来）：");
  for (const t of tint) console.log("      " + t.label + "\t实底 rgb(" + t.bg + ")\tΔL=" + t.dL);
  /* ★ 结论由数据自述，不由落笔之人预判——初稿曾写「层色淡底之上最小」，实测最小者乃**暖赭层标**，
   *   与预判不符即改措辞，不松动数据（同「presence 从严」之训：错的是措辞不是数据）。 */
  const tMin = tint.reduce((a, b) => a.dL <= b.dL ? a : b), tMax = tint.reduce((a, b) => a.dL >= b.dL ? a : b);
  ok(tint.length >= 3, "（供裁之量，非断言）案甲淡底之 ΔL 逐落点实测：**最弱者「" + tMin.label + "」ΔL=" + tMin.dL
    + "，最强者「" + tMax.label + "」ΔL=" + tMax.dL + "，相差 "
    + Math.round((tMax.dL / tMin.dL - 1) * 100) + "%** —— ★ 即案甲「有面」之辨识**随其所坐之底而变**，"
    + "在已着淡底之处（层标、引文卡）弱于素绢帛处；案乙无此问（辨识全压字形，不随底变）",
    JSON.stringify(tint.map(t => t.label + " " + t.dL)));

  /* ================= §六 未越界之证 ================= */
  console.log("\n【六】未越界之证");
  const untouched = await N.p.evaluate(() => {
    const evt = DATA.events.find(e => e.id === "E146");
    const host = document.createElement("div"); host.appendChild(eventQuotesFrag(evt));
    const bq = host.querySelector('blockquote.quote[data-qid="Q442"]');
    return { text: bq.querySelector("p.q-text").outerHTML, swap: !!bq.querySelector(".q-diplo-toggle") };
  });
  const untouchedOld = await O.p.evaluate(() => {
    const evt = DATA.events.find(e => e.id === "E146");
    const host = document.createElement("div"); host.appendChild(eventQuotesFrag(evt));
    const bq = host.querySelector('blockquote.quote[data-qid="Q442"]');
    return { text: bq.querySelector("p.q-text").outerHTML, swap: !!bq.querySelector(".q-diplo-toggle") };
  });
  ok(untouched.text === untouchedOld.text, "`quote_original` 一路一字未碰：Q442 引文正文两版 `outerHTML` 全等（r44d 之训）", untouched.text.length + " 字符");
  ok(untouched.swap && untouchedOld.swap, "释文原貌切换钮两版俱在（通行字视图之限域判据仍读 `caveat` 原串）");
  const meta = await N.p.evaluate(() => ({ ep: DATA.event_people.length, ev: DATA.events.length, ps: DATA.passages.length, pl: DATA.places.length, pe: DATA.people.length, so: DATA.sources.length, rl: DATA.relations.length, ar: DATA.archaeology.length }));
  ok(meta.ep === 694 && meta.ev === 265 && meta.ps === 509 && meta.pl === 104 && meta.pe === 174 && meta.so === 195 && meta.rl === 309 && meta.ar === 8,
    "数据一字未动：event_people 694／events 265／passages 509／places 104／people 174／sources 195／relations 309／archaeology 8",
    Object.values(meta).join("/"));
  /* 移动端：375px 下含库内之名之处不横向撑页 */
  await N375.p.goto(NEW + "/#/chronicle", { waitUntil: "load" });
  await N375.p.waitForTimeout(1500);
  const mob = await N375.p.evaluate(() => {
    const codes = [...document.querySelectorAll("code.md-name")];
    let over = 0;
    for (const c of codes) {
      const b = c.getBoundingClientRect();
      const host = c.closest("blockquote, .event-body, dd, li") || document.body;
      const hb = host.getBoundingClientRect();
      if (b.right > hb.right + 0.5 || b.left < hb.left - 0.5) over++;
    }
    return { n: codes.length, over, docOver: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  ok(mob.n > 0, "375px 编年页取到 `code.md-name` " + mob.n + " 枚（移动端确有其落点）", String(mob.n));
  ok(mob.over === 0, "375px：无一枚库内之名越出其所在容器之左右边界", "越界 " + mob.over);
  ok(mob.docOver <= 0, "375px：页面无横向溢出", String(mob.docOver));
  ok(errs.length === 0, "三版四页零 pageerror", errs.slice(0, 3).join(" | ") || "零");

  for (const c of [N, N375, O]) await c.ctx.close();
  await browser.close(); sNew.close(); sOld.close();

  console.log("\n=== 合计 " + checks + " 项，FAIL " + fails + " ===");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
