/* 经纬春秋 · r51 走查门：⚑H 丙案——引文卡注文之 markdown 星号（passages.modern_note 两个落点）
 *
 * 本门要回答三个问题，一个都不许用「源码读着像是对的」来答：
 *   ① 新函数 mdBoldFrag 的切分对不对——**只认成对 `**`，且不吞字、不吃星号**（裁五口径二）；
 *   ② 全库 509 条注文经它渲染之后，**把 <strong> 两侧的 `**` 补回去必须逐字还原成原串**（r51 round51_peijue 批丙合入后基线，506→509，+3 系本批扩表所致之预期内联动，非本件所生）
 *      ——这是「不吞字」唯一可机械证伪的说法，故取它作全库断言，不取抽样目测；
 *   ③ 不含成对星号之卡，**DOM 与旧版全等**（零影响之证）。这一条不与「我觉得没动它」对读，
 *      而是**真把 ⚑H 合入前那一版的 app.js/styles.css 另起一个源端一并跑起来**，两版逐卡对读 outerHTML。
 *
 * §三之所以要两个源端：本改动落在 eventQuotesFrag 内部，若只在新版里自证，
 * 「旧版长什么样」就成了脑补。二源对读把它变成实测：旧版 outerHTML 里若出现 <strong>，
 * 或无星号之卡两版不逐位相同，本门即红——测错对象要看得出来，不能跑绿了事。
 *
 * 另：本门**不动仓库任何文件**，旧版取自 `git show <OLD_REF>:site/...`（只读），不切分支、不 stash。
 * ★ `OLD_REF` 锚定固定哈希 `bf4242c`（⚑H 合入前之 `main`），**不取 `HEAD`**：
 *   ⚑H 已随 `5f87d39` 提交，`HEAD` 之 app.js 自此即含 `mdBoldFrag`，「旧版」遂等于新版，
 *   两版对读之前提当场消失、本门必红 3 项（2026-09-20 勘注十三、裁二十六）。
 *   故旧版源端须钉在那一版上，且于起手取源端处（:123–133）打印所取哈希与「旧版 app.js 内 mdBoldFrag 出现 0 次」
 *   之正面证据——锚定若再失效，是**看得出来**，不是静默跑绿。
 *
 * 用法：node tools/qa/vision_r51.js [--shots]
 *   --shots  另存截图入 tools/qa/screenshots/（Q442 一卡 ＋ 143 个落点之逐屏走查底片）
 */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path"), zlib = require("zlib");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..", "..");
const SITE = path.join(ROOT, "site");
const SHOT_DIR = path.join(__dirname, "screenshots");
const WANT_SHOTS = process.argv.includes("--shots");

let fails = 0, checks = 0;
function ok(cond, label, detail) {
  checks++; if (!cond) fails++;
  console.log("  " + (cond ? "✓" : "✗") + " " + label + (detail ? "  —— " + detail : ""));
}

/* ---------- 双源端静态服务器 ----------
 * override 里的路径从内存（锚定之旧版 OLD_REF 之本）供出，其余一律落回真实 site/——
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
/* 旧版源端之锚：`bf4242c` 系 ⚑H（注文 markdown 星号）合入前之 `main`，即「丙案落地之前一版」。
 * 【不得改回 HEAD】⚑H 随 `5f87d39` 落地后，HEAD 之 app.js 即含 mdBoldFrag，旧版会等于新版，
 * 两版对读之前提消失，本门必红 3 项（勘注十三、裁二十六，2026-09-20）。 */
const OLD_REF = "bf4242c";
const gitShow = (p) => execFileSync("git", ["show", OLD_REF + ":" + p], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });

/* ---------- PNG 解码与墨量（只为「加粗可辨」出一个数，不看截图反推） ---------- */
function decodePNG(buf) {
  let pos = 8, w = 0, h = 0, bd = 0, ct = 0; const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.slice(pos + 8, pos + 8 + len);
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; }
    else if (type === "IDAT") idat.push(data); else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (bd !== 8 || (ct !== 6 && ct !== 2)) throw new Error("PNG 非预期格式 bd=" + bd + " ct=" + ct);
  const bpp = ct === 6 ? 4 : 3, raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp;
  const out = Buffer.alloc(w * h * bpp); let rp = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[rp++], line = raw.slice(rp, rp + stride); rp += stride;
    const cur = out.slice(y * stride, (y + 1) * stride);
    const prev = y ? out.slice((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      cur[x] = v & 255;
    }
  }
  return { w, h, bpp, data: out };
}
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const relLum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
function inkOf(png) {                       // 墨量＝逐像素相对底色之亮度亏损均值
  const { w, h, bpp, data } = png;
  const at = (x, y) => { const i = (y * w + x) * bpp; return [data[i], data[i + 1], data[i + 2]]; };
  const bg = relLum(...at(0, 0));
  let sum = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const L = relLum(...at(x, y)); if (L < bg) sum += bg - L; }
  return sum / (w * h);
}

/* ---------- 页面内：把 509 条引文全部经生产同一条路渲出来（r51 round51_peijue 批丙合入后基线，506→509）----------
 * 取 eventQuotesFrag(evt) 直调，不靠逐个展开 details——
 * 展开 265 张卡既慢又容易漏，而直调走的正是生产渲染函数本身，覆盖面反而是全的。 */
const COLLECT = `() => {
  const out = [];
  for (const e of DATA.events) {
    const frag = eventQuotesFrag(e);
    const host = document.createElement("div");
    host.appendChild(frag);
    for (const bq of host.querySelectorAll("blockquote.quote")) out.push({ qid: bq.dataset.qid, html: bq.outerHTML });
  }
  return out;
}`;

(async () => {
  const pw = require("playwright");
  console.log("=== r51 走查门：⚑H 丙案 · 注文 markdown 星号（passages.modern_note）===\n");

  // 旧版源端：app.js / styles.css 取锚定之 OLD_REF（⚑H 合入前之 main），其余落回真实 site/
  const oldApp = gitShow("site/app.js"), oldCss = gitShow("site/styles.css");

  /* ★ 锚定有效之正面证据（非「跑绿了」之自陈）：旧版 app.js 内 mdBoldFrag 须一次不出现。
   *   若出现，说明所锚之版已含新码、两版对读之前提不成立——当场抛错停门，不许带病往下跑。 */
  const OLD_REF_FULL = execFileSync("git", ["rev-parse", OLD_REF], { cwd: ROOT }).toString().trim();
  const oldFragCnt = (String(oldApp).match(/mdBoldFrag/g) || []).length;
  console.log("  旧版源端锚定 " + OLD_REF + "（" + OLD_REF_FULL + "）：其 app.js 内 mdBoldFrag 出现 " + oldFragCnt + " 次"
    + (oldFragCnt === 0 ? "，对读之前提成立" : ""));
  if (oldFragCnt !== 0) {
    throw new Error("锚定失效：旧版源端 " + OLD_REF + " 之 app.js 已含 mdBoldFrag " + oldFragCnt
      + " 处，「旧版」等于新版，两版对读无意义——请核 OLD_REF（应为 ⚑H 合入前之 main）。");
  }
  const sNew = await srv(SITE, null);
  const sOld = await srv(SITE, { "/app.js": oldApp, "/styles.css": oldCss });
  const NEW = "http://127.0.0.1:" + sNew.address().port;
  const OLD = "http://127.0.0.1:" + sOld.address().port;
  console.log("  新版源端 " + NEW + "   旧版源端（" + OLD_REF + " 之 app.js/styles.css）" + OLD + "\n");

  const browser = await pw.chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 4 });
  await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) { } });
  const errs = [];
  const page = await ctx.newPage();
  page.on("pageerror", e => errs.push("新版:" + e.message));
  await page.goto(NEW + "/#/chronicle", { waitUntil: "load" });
  await page.waitForTimeout(1200);

  /* ================= §0 落点在位 ================= */
  console.log("【〇】落点与函数在位");
  const env = await page.evaluate(() => ({
    md: typeof mdBoldFrag, mk: typeof mdBoldMarks, sc: typeof splitCaveat, eq: typeof eventQuotesFrag,
    n: DATA.passages.length, ne: DATA.events.length,
  }));
  ok(env.md === "function" && env.mk === "function", "mdBoldFrag / mdBoldMarks 已在位", env.md + " / " + env.mk);
  ok(env.n === 509, "passages 总量（r51 round51_peijue 批丙合入后基线，506→509，+3 系本批扩表所致之预期内联动，非本件所生）", String(env.n));
  ok(env.ne === 265, "events 总量", String(env.ne));

  /* ================= §一 纯函数断言：只认成对 ** ================= */
  console.log("\n【一】mdBoldFrag 切分断言（裁五口径二：奇数、跨段不闭合、*** 之属一律原样照出）");
  const CASES = [
    // [入串, 期望之节点谱（T:=文本节点，STRONG:=元素）, 期望还原（把 strong 两侧补回 **）]
    ["", [], ""],
    [null, [], ""],
    ["abc", ["T:abc"], "abc"],
    ["**a**", ["STRONG:a"], "**a**"],
    ["x**a**y", ["T:x", "STRONG:a", "T:y"], "x**a**y"],
    ["**a**b**c**", ["STRONG:a", "T:b", "STRONG:c"], "**a**b**c**"],
    ["**a", ["T:**a"], "**a"],                                   // 落单，原样
    ["a**b**c**d", ["T:a", "STRONG:b", "T:c**d"], "a**b**c**d"],      // 奇数个，末一个退回文字
    ["***abc***", ["T:***abc***"], "***abc***"],                 // *** 不认
    ["****", ["T:****"], "****"],                                // **** 不认，不造空 strong
    ["a*b", ["T:a*b"], "a*b"],                                   // 单星不认
    ["`{{*|…}}`", ["T:`{{*|…}}`"], "`{{*|…}}`"],                 // Q504 实例之型
    ["**a****b**", ["STRONG:a****b"], "**a****b**"],                  // 中段 **** 属文字，两端成对
    ["＊＊a＊＊", ["T:＊＊a＊＊"], "＊＊a＊＊"],                  // 全角星号不认
  ];
  const r1 = await page.evaluate((cases) => {
    const spell = (frag) => [...frag.childNodes].map(n => (n.nodeType === 3 ? "T:" : n.nodeName + ":") + n.textContent);
    const restore = (frag) => [...frag.childNodes].map(n => n.nodeType === 3 ? n.textContent : "**" + n.textContent + "**").join("");
    return cases.map(([inp]) => { const f = mdBoldFrag(inp); return { spell: spell(f), restore: restore(f), tag: [...f.childNodes].filter(n => n.nodeType === 1).map(n => n.nodeName).join(",") }; });
  }, CASES.map(c => [c[0]]));
  CASES.forEach(([inp, spell, back], i) => {
    const g = r1[i];
    const label = "「" + (inp === null ? "null" : inp) + "」";
    ok(JSON.stringify(g.spell) === JSON.stringify(spell), label + " 节点谱", g.spell.join(" | ") || "（空）");
    ok(g.restore === back, label + " 还原全等", JSON.stringify(g.restore));
    ok(g.tag === "" || /^(STRONG,?)+$/.test(g.tag), label + " 所造元素只有 STRONG", g.tag || "（无元素）");
  });

  /* 现库唯一的奇数星号实例：Q504 之 `{{*|…}}`（韦昭注剥离之记法），须原样留在文本里 */
  const q504 = await page.evaluate(() => {
    const q = DATA.passages.find(p => p.id === "Q504");
    const { caveat, rest } = splitCaveat(q.modern_note);
    const host = document.createElement("div"); host.appendChild(mdBoldFrag(rest));
    return {
      stars: (q.modern_note.match(/\*/g) || []).length,
      strongs: host.querySelectorAll("strong").length,
      keepsLone: host.textContent.indexOf("{{*|") >= 0,
      back: [...host.childNodes].map(n => n.nodeType === 3 ? n.textContent : "**" + n.textContent + "**").join("") === rest,
      cav: caveat.slice(0, 12),
    };
  });
  ok(q504.stars === 13, "Q504 原串星号共 13 个（奇数，现库唯一）", String(q504.stars));
  ok(q504.strongs === 3, "其中成对者 3 对成粗体", String(q504.strongs));
  ok(q504.keepsLone, "落单之单星原样留在文本里（`{{*|…}}` 未被吃掉）");
  ok(q504.back, "Q504 往返还原逐字全等");

  /* ================= §二 零 XSS 面 ================= */
  console.log("\n【二】零 XSS 面：数据无论写成什么样都不得成为标记");
  const EVIL = [
    "**<script>window.__pwned=1<\/script>**",
    "**<img src=x onerror=window.__pwned=1>**",
    "**\" onerror=\"window.__pwned=1**",
    "<b>粗</b>**真粗**",
    "**</strong><script>window.__pwned=1<\/script>**",
  ];
  const r2 = await page.evaluate((evil) => {
    const res = [];
    for (const s of evil) {
      const f = mdBoldFrag(s);
      const host = document.createElement("div");
      host.appendChild(f);
      document.body.appendChild(host);
      res.push({
        text: host.textContent,
        els: [...host.querySelectorAll("*")].map(n => n.nodeName).join(","),
        scripts: host.querySelectorAll("script,img,b").length,
        attrs: [...host.querySelectorAll("*")].reduce((a, n) => a + n.attributes.length, 0),
      });
      host.remove();
    }
    return { res, pwned: !!window.__pwned };
  }, EVIL);
  EVIL.forEach((s, i) => {
    const g = r2.res[i];
    const expectText = s.replace(/\*\*/g, "");            // 只掉成对分隔符，别的一字不掉
    ok(g.text === expectText, "「" + s.slice(0, 26) + "…」文本逐字照出，标记未被解析", JSON.stringify(g.text.slice(0, 40)));
    ok(g.scripts === 0, "未生成 script/img/b 任何元素", "计 " + g.scripts);
    ok(/^(STRONG,?)*$/.test(g.els), "所造元素只有 STRONG", g.els || "（无）");
    ok(g.attrs === 0, "所造元素零属性", "计 " + g.attrs);
  });
  ok(!r2.pwned, "注入串未触发任何脚本执行（window.__pwned 未被置位）");

  /* ================= §三 全库复扫：往返还原逐字全等 ================= */
  console.log("\n【三】全库复扫 509 条：渲染后把 <strong> 两侧 `**` 补回，须逐字还原成原串（r51 round51_peijue 批丙合入后基线，506→509）");
  const r3 = await page.evaluate(() => {
    const restore = (el) => [...el.childNodes].map(n => n.nodeType === 3 ? n.textContent : (n.nodeName === "STRONG" ? "**" + n.textContent + "**" : "?" + n.textContent)).join("");
    const bad = [], stat = { cavRows: 0, cavPairs: 0, restRows: 0, restPairs: 0, rows: new Set() };
    for (const q of DATA.passages) {
      const { caveat, rest } = splitCaveat(q.modern_note);
      for (const [half, s] of [["caveat", caveat], ["rest", rest]]) {
        const host = document.createElement("div");
        host.appendChild(mdBoldFrag(s));
        const back = restore(host);
        const n = host.querySelectorAll("strong").length;
        if (back !== s) bad.push({ qid: q.id, half, got: back.slice(0, 80), want: s.slice(0, 80) });
        if ([...host.querySelectorAll("strong")].some(x => x.textContent === "")) bad.push({ qid: q.id, half, got: "空 strong", want: "" });
        if (n) { if (half === "caveat") { stat.cavRows++; stat.cavPairs += n; } else { stat.restRows++; stat.restPairs += n; } stat.rows.add(q.id); }
      }
    }
    return { bad, cavRows: stat.cavRows, cavPairs: stat.cavPairs, restRows: stat.restRows, restPairs: stat.restPairs, rows: stat.rows.size };
  });
  ok(r3.bad.length === 0, "509 条 × 两半（层标／页脚）往返还原逐字全等（r51 round51_peijue 批丙合入后基线，506→509）", r3.bad.length ? JSON.stringify(r3.bad.slice(0, 3)) : "零不符");
  ok(r3.cavRows === 9 && r3.cavPairs === 20, "层标落点：9 行 20 处（对任务书 §六实读值）", r3.cavRows + " 行 " + r3.cavPairs + " 处");
  ok(r3.restRows === 137 && r3.restPairs === 1201, "页脚落点：137 行 1201 处（任务书 §六实读值 134 行 1197 处系合入 round51_peijue 批丙〔+3 passages，Q524–Q526〕之前之基线；该三行 modern_note 亦含成对 `**`〔各 1／1／2 对〕，合入后一并实渲，+3 行 +4 处系本批扩表所致之预期内联动，非本件所生）", r3.restRows + " 行 " + r3.restPairs + " 处");
  ok(r3.cavRows + r3.restRows === 146 && r3.cavPairs + r3.restPairs === 1221, "本轮范围合计 146 落点 1221 处（任务书 §六原记 143 落点 1217 处，+3／+4 系批丙合入后之预期内联动，见上条）", (r3.cavRows + r3.restRows) + " / " + (r3.cavPairs + r3.restPairs));

  /* ================= §四 新旧两版逐卡对读 ================= */
  console.log("\n【四】新旧两版逐卡对读（旧版＝" + OLD_REF + " 之 app.js/styles.css，同一份 site/data/）");
  const pageOld = await ctx.newPage();
  pageOld.on("pageerror", e => errs.push("旧版:" + e.message));
  await pageOld.goto(OLD + "/#/chronicle", { waitUntil: "load" });
  await pageOld.waitForTimeout(1200);
  const oldCards = await pageOld.evaluate(eval("(" + COLLECT + ")"));
  const newCards = await page.evaluate(eval("(" + COLLECT + ")"));
  ok(oldCards.length === 509 && newCards.length === 509, "两版各渲出 509 张引文卡（r51 round51_peijue 批丙合入后基线，506→509，+3 系本批扩表所致之预期内联动，非本件所生）", oldCards.length + " / " + newCards.length);
  ok(oldCards.every(c => !/<strong/i.test(c.html)), "旧版卡内本无 <strong>（对读之前提成立）");

  const starSet = await page.evaluate(() => {
    const s = [];
    for (const q of DATA.passages) {
      const { caveat, rest } = splitCaveat(q.modern_note);
      if (mdBoldMarks(caveat).length || mdBoldMarks(rest).length) s.push(q.id);
    }
    return s;
  });
  const starIds = new Set(starSet);
  let sameCnt = 0, diffCnt = 0; const plainDiff = [], starDiff = [];
  for (let i = 0; i < newCards.length; i++) {
    const a = oldCards[i], b = newCards[i];
    if (a.qid !== b.qid) { starDiff.push({ qid: a.qid + "≠" + b.qid, why: "次序不一致" }); continue; }
    if (starIds.has(b.qid)) {
      // 有星号之卡：新版 <strong>x</strong> 还原成 **x** 后须与旧版逐位相同
      const back = b.html.replace(/<strong>/g, "**").replace(/<\/strong>/g, "**");
      if (back === a.html) diffCnt++; else starDiff.push({ qid: b.qid, len: [a.html.length, back.length] });
    } else {
      if (a.html === b.html) sameCnt++; else plainDiff.push({ qid: b.qid });
    }
  }
  ok(plainDiff.length === 0, "不含成对星号之卡 " + sameCnt + " 张，outerHTML 与旧版逐位全等（零影响之证）", plainDiff.length ? JSON.stringify(plainDiff.slice(0, 5)) : "零差异");
  ok(starDiff.length === 0, "含成对星号之卡 " + diffCnt + " 张，两版之差**只有** `**x**`→`<strong>x</strong>`", starDiff.length ? JSON.stringify(starDiff.slice(0, 5)) : "无他差");
  ok(sameCnt + diffCnt === 509, "两类相加＝509，无卡漏检（r51 round51_peijue 批丙合入后基线，506→509，+3 系本批扩表所致之预期内联动，非本件所生）", sameCnt + "+" + diffCnt);
  ok(starIds.size === 137, "含星号之卡（按行计）137 张（批丙 Q524–Q526 三行 modern_note 亦含成对 `**`，+3 系本批扩表所致之预期内联动，非本件所生）", String(starIds.size));

  /* quote_original 未改道之证：正文节点两版全等已含在上文 509 张对读内（r51 round51_peijue 批丙合入后基线，506→509），此处另取通行字视图一卡明记 */
  const diploCmp = await page.evaluate(() => {
    const evt = DATA.events.find(e => e.id === "E146");
    const host = document.createElement("div"); host.appendChild(eventQuotesFrag(evt));
    const bq = host.querySelector('blockquote.quote[data-qid="Q442"]');
    return { text: bq.querySelector("p.q-text").outerHTML, swap: !!bq.querySelector(".q-diplo-toggle") };
  });
  const diploOld = await pageOld.evaluate(() => {
    const evt = DATA.events.find(e => e.id === "E146");
    const host = document.createElement("div"); host.appendChild(eventQuotesFrag(evt));
    const bq = host.querySelector('blockquote.quote[data-qid="Q442"]');
    return { text: bq.querySelector("p.q-text").outerHTML, swap: !!bq.querySelector(".q-diplo-toggle") };
  });
  ok(diploCmp.text === diploOld.text, "Q442 引文正文（通行字视图，在转换域）两版 outerHTML 全等 —— quote_original 一字未改道", String(diploCmp.text.length) + " 字符");
  ok(diploCmp.swap && diploOld.swap, "释文原貌切换钮两版俱在（限域判据仍读 caveat 原串）");

  /* ================= §五 视觉实测：加粗可辨、字幅零变 ================= */
  console.log("\n【五】视觉实测（同字同上下文，墨量＝逐像素相对底色之亮度亏损均值）");
  const SAMPLE = "不可并存者三节";
  const probes = await page.evaluate((sample) => {
    const evt = DATA.events.find(e => e.id === "E146");
    const d = [...document.querySelectorAll("details.event")].find(x => x.dataset.eid === "E146");
    d.open = true;
    (d.querySelector(".event-body") || d).appendChild(eventQuotesFrag(evt));
    const bq = d.querySelector('blockquote.quote[data-qid="Q442"]');
    const out = [];
    const put = (host, key, bold) => {
      const sp = document.createElement(bold ? "strong" : "span");
      sp.textContent = sample; sp.style.display = "inline-block"; sp.id = "pb51-" + out.length;
      const ln = document.createElement("div"); ln.appendChild(sp); host.appendChild(ln);
      const cs = getComputedStyle(sp);
      out.push({ key, id: sp.id, weight: cs.fontWeight, size: cs.fontSize, color: cs.color });
    };
    put(bq.querySelector("p.q-caveat"), "层标·常规", false);
    put(bq.querySelector("p.q-caveat"), "层标·strong", true);
    put(bq.querySelector("footer"), "页脚·常规", false);
    put(bq.querySelector("footer"), "页脚·strong", true);
    bq.scrollIntoView({ block: "center", behavior: "instant" });
    return out;
  }, SAMPLE);
  await page.waitForTimeout(300);
  const ink = {};
  for (const pr of probes) {
    const el = await page.$("#" + pr.id);
    const box = await el.boundingBox();
    ink[pr.key] = { ink: inkOf(decodePNG(await el.screenshot())), w: +box.width.toFixed(2), h: +box.height.toFixed(2), weight: pr.weight, size: pr.size, color: pr.color };
  }
  for (const k of Object.keys(ink)) console.log("    " + k.padEnd(12) + " 墨量=" + ink[k].ink.toFixed(5) + "  盒=" + ink[k].w + "×" + ink[k].h + "  字重=" + ink[k].weight + "  " + ink[k].size + " " + ink[k].color);
  const cavR = ink["层标·strong"].ink / ink["层标·常规"].ink, ftR = ink["页脚·strong"].ink / ink["页脚·常规"].ink;
  ok(ink["层标·strong"].weight === "600" && ink["页脚·strong"].weight === "600", "两处 strong 字重实测均为 600（CSS 已生效）");
  ok(cavR >= 1.25, "层标加粗**可辨**：墨量 ×" + cavR.toFixed(3), "下限 1.25");
  ok(ftR >= 1.25, "页脚加粗**可辨**：墨量 ×" + ftR.toFixed(3), "下限 1.25");
  ok(ink["层标·strong"].w === ink["层标·常规"].w && ink["层标·strong"].h === ink["层标·常规"].h,
    "层标加粗**不喧宾**之一：盒宽盒高零变（汉字等宽进距，不改排版）", ink["层标·常规"].w + "×" + ink["层标·常规"].h);
  ok(ink["页脚·strong"].w === ink["页脚·常规"].w && ink["页脚·strong"].h === ink["页脚·常规"].h,
    "页脚加粗**不喧宾**之一：盒宽盒高零变", ink["页脚·常规"].w + "×" + ink["页脚·常规"].h);
  ok(ink["层标·strong"].color === ink["层标·常规"].color, "不喧宾之二：层标 strong 色不变（仍暖赭，不夺层色）", ink["层标·strong"].color);
  ok(ink["页脚·strong"].color === ink["页脚·常规"].color, "不喧宾之二：页脚 strong 色不变（仍淡墨）", ink["页脚·strong"].color);

  /* ================= §五之二 全库粗体段普查 =================
   * 人眼逐屏扫 1221 处只能扫出「哪一屏看着不对」，扫不出「哪一处不对」。
   * 故把逐屏走查里真正要找的三样东西写成断言：空段、段内残留单星、以及**整段被加粗**
   * （粗体覆盖率逼近满格＝页面上一整条注文全是粗的，那才是真「喧宾」）。
   * 三样俱零，加上 §三之往返还原，146 个落点就是逐个核过的，不是抽样看过的
   * （任务书原记 143 落点 1217 处系合入 round51_peijue 批丙之前之基线，+3／+4 系该批扩表所致之预期内联动）。 */
  console.log("\n【五之二】全库粗体段普查（1221 处逐处，不抽样）");
  const cen = await page.evaluate(() => {
    const lens = [], empty = [], resid = [], hot = [];
    for (const q of DATA.passages) {
      const { caveat, rest } = splitCaveat(q.modern_note);
      for (const [half, s] of [["caveat", caveat], ["rest", rest]]) {
        const host = document.createElement("div"); host.appendChild(mdBoldFrag(s));
        const ss = [...host.querySelectorAll("strong")];
        if (!ss.length) continue;
        let bold = 0;
        for (const st of ss) {
          const t = st.textContent;
          lens.push(t.length); bold += t.length;
          if (!t.length) empty.push(q.id + "/" + half);
          if (t.indexOf("*") >= 0) resid.push(q.id + "/" + half);
        }
        const cov = bold / Math.max(1, host.textContent.length);
        if (cov > 0.75) hot.push({ id: q.id, half, cov: +(cov * 100).toFixed(0), len: host.textContent.length });
      }
    }
    lens.sort((a, b) => a - b);
    return { n: lens.length, min: lens[0], med: lens[lens.length >> 1], max: lens[lens.length - 1], empty, resid, hot };
  });
  console.log("    段长 最短 " + cen.min + " / 中位 " + cen.med + " / 最长 " + cen.max + " 字");
  ok(cen.n === 1221, "粗体段总数 1221（任务书原记 1217 处系合入 round51_peijue 批丙之前之基线，+4 系该批三行 Q524–Q526 modern_note 亦含成对 `**` 所致之预期内联动，非本件所生）", String(cen.n));
  ok(cen.empty.length === 0, "无空粗体段（`****` 不造空 strong）", cen.empty.slice(0, 5).join("、") || "零");
  ok(cen.resid.length === 0, "无粗体段内残留单星（切分未把星号吞进内容）", cen.resid.slice(0, 5).join("、") || "零");
  ok(cen.hot.length === 0, "无「整段皆粗」之落点（粗体覆盖率 >75% 者）", cen.hot.length ? JSON.stringify(cen.hot.slice(0, 5)) : "零；最重者为九条层标，实测 62%（Q447）");

  /* ================= §六 移动端 390px ================= */
  console.log("\n【六】移动端 390px：层标粗体段不溢出卡外、不横向撑页");
  const mob = await ctx.newPage();
  mob.on("pageerror", e => errs.push("移动:" + e.message));
  await mob.setViewportSize({ width: 390, height: 780 });
  await mob.goto(NEW + "/#/chronicle", { waitUntil: "load" });
  await mob.waitForTimeout(1000);
  const mr = await mob.evaluate(() => {
    const ids = [];
    for (const q of DATA.passages) { const { caveat } = splitCaveat(q.modern_note); if (mdBoldMarks(caveat).length) ids.push(q.event_id); }
    const eids = [...new Set(ids)];
    const host = document.createElement("div");
    host.style.cssText = "max-width:100%";
    document.querySelector("main").appendChild(host);
    for (const eid of eids) host.appendChild(eventQuotesFrag(DATA.events.find(e => e.id === eid)));
    let over = 0, n = 0;
    for (const st of host.querySelectorAll("p.q-caveat strong, footer strong")) {
      n++;
      const r = st.getBoundingClientRect(), pr = st.closest("blockquote.quote").getBoundingClientRect();
      if (r.right > pr.right + 1 || r.left < pr.left - 1) over++;
    }
    return { n, over, docW: document.documentElement.scrollWidth, winW: window.innerWidth };
  });
  ok(mr.n > 0, "390px 下取到粗体段 " + mr.n + " 处");
  ok(mr.over === 0, "无一处粗体段溢出所在引文卡的左右边界", "越界 " + mr.over);
  ok(mr.docW <= mr.winW + 1, "页面无横向溢出", mr.docW + " ≤ " + mr.winW);

  /* ================= §七 截图留证 =================
   * `tools/qa/screenshots/*.png` 按 .gitignore:32 本就不入公开仓，是本机留证；
   * 故此处所虑非仓库体积，而是**留证目录别被一次性大图淹掉**——
   * 134 行页脚注之逐屏底片首版实测 33 屏、逾 100MB，堆进去只会把 r19b 以来的
   * 历轮留证埋了。故留证目录只存三张定点（口径六之「至少取 Q442 一卡」＋
   * 对读所需之旧版同卡＋九条层标之接触印相），逐屏底片另落 --sweep-dir（默认系统临时目录）。
   * 「143 个落点逐个核过」这句话的**可复跑之证**在 §三／§四 的全库机械断言，不在截图；
   * 截图是给人眼看的旁证，走查所见记于 docs/delivery_vision_r51.md。 */
  if (WANT_SHOTS) {
    console.log("\n【七】截图留证");
    fs.mkdirSync(SHOT_DIR, { recursive: true });
    const shotCtx = await browser.newContext({ viewport: { width: 880, height: 900 }, deviceScaleFactor: 2 });
    await shotCtx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) { } });
    const OPEN_Q442 = () => {
      const d = [...document.querySelectorAll("details.event")].find(x => x.dataset.eid === "E146");
      d.open = true;
      const body = d.querySelector(".event-body") || d;
      if (!body.querySelector('blockquote.quote[data-qid="Q442"]')) body.appendChild(eventQuotesFrag(DATA.events.find(e => e.id === "E146")));
      document.querySelector('blockquote.quote[data-qid="Q442"]').id = "shot-target";
    };
    for (const [tag, base] of [["new", NEW], ["old", OLD]]) {
      const pg = await shotCtx.newPage();
      await pg.goto(base + "/#/chronicle", { waitUntil: "load" });
      await pg.waitForTimeout(900);
      await pg.evaluate(OPEN_Q442);
      await pg.waitForTimeout(250);
      await (await pg.$("#shot-target")).screenshot({ path: path.join(SHOT_DIR, "r51_q442_" + tag + ".png") });
      await pg.close();
      console.log("    screenshots/r51_q442_" + tag + ".png（Q442：层标与页脚同卡俱有星号）");
    }
    // 九条层标（Q442–Q451，皆 J 层）接触印相一张
    const sheetPg = await shotCtx.newPage();
    await sheetPg.goto(NEW + "/#/chronicle", { waitUntil: "load" });
    await sheetPg.waitForTimeout(900);
    const sheetH = await sheetPg.evaluate(() => {
      const ids = DATA.passages.filter(q => mdBoldMarks(splitCaveat(q.modern_note).caveat).length).map(q => q.id);
      const main = document.querySelector("main"); main.textContent = "";
      const wrap = document.createElement("div"); wrap.id = "sweep"; wrap.style.cssText = "padding:14px";
      for (const eid of [...new Set(ids.map(i => DATA.passages.find(p => p.id === i).event_id))]) wrap.appendChild(eventQuotesFrag(DATA.events.find(e => e.id === eid)));
      main.appendChild(wrap);
      const keep = new Set(ids);
      for (const bq of [...wrap.querySelectorAll("blockquote.quote")]) if (!keep.has(bq.dataset.qid)) bq.remove();
      for (const p of wrap.querySelectorAll("p.q-text")) p.remove();   // 只看层标与页脚，正文不入印相
      return { n: wrap.querySelectorAll("blockquote.quote").length, h: wrap.scrollHeight };
    });
    await sheetPg.setViewportSize({ width: 880, height: Math.min(sheetH.h + 40, 4000) });
    await sheetPg.waitForTimeout(200);
    await sheetPg.screenshot({ path: path.join(SHOT_DIR, "r51_caveat_sheet.png"), fullPage: true });
    console.log("    screenshots/r51_caveat_sheet.png（九条层标 Q442–Q451 接触印相，共 " + sheetH.n + " 卡）");
    await sheetPg.close();

    // 134 行页脚注之逐屏走查底片 —— 另落，不入仓
    const SWEEP_DIR = (process.argv.find(a => a.startsWith("--sweep-dir=")) || "").slice(12) ||
      path.join(require("os").tmpdir(), "chunqiu_r51_sweep");
    fs.mkdirSync(SWEEP_DIR, { recursive: true });
    const sw = await browser.newContext({ viewport: { width: 880, height: 1200 }, deviceScaleFactor: 1 });
    await sw.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) { } });
    const swPg = await sw.newPage();
    await swPg.goto(NEW + "/#/chronicle", { waitUntil: "load" });
    await swPg.waitForTimeout(900);
    const sweep = await swPg.evaluate(() => {
      const ids = DATA.passages.filter(q => mdBoldMarks(splitCaveat(q.modern_note).caveat).length || mdBoldMarks(splitCaveat(q.modern_note).rest).length).map(q => q.id);
      const main = document.querySelector("main"); main.textContent = "";
      const wrap = document.createElement("div"); wrap.id = "sweep"; wrap.style.cssText = "padding:12px";
      for (const eid of [...new Set(ids.map(i => DATA.passages.find(p => p.id === i).event_id))]) wrap.appendChild(eventQuotesFrag(DATA.events.find(e => e.id === eid)));
      main.appendChild(wrap);
      const keep = new Set(ids);
      for (const bq of [...wrap.querySelectorAll("blockquote.quote")]) if (!keep.has(bq.dataset.qid)) bq.remove();
      for (const p of wrap.querySelectorAll("p.q-text")) p.remove();
      return { cards: wrap.querySelectorAll("blockquote.quote").length, h: wrap.scrollHeight };
    });
    const PAGE_H = 1200, n = Math.ceil(sweep.h / PAGE_H);
    for (let i = 0; i < n; i++) {
      await swPg.evaluate((y) => window.scrollTo(0, y), i * PAGE_H);
      await swPg.waitForTimeout(80);
      await swPg.screenshot({ path: path.join(SWEEP_DIR, "r51_sweep_" + String(i + 1).padStart(2, "0") + ".png") });
    }
    console.log("    逐屏走查底片：含星号之卡 " + sweep.cards + " 张、" + n + " 屏 → " + SWEEP_DIR + "（不入仓）");
    await sw.close(); await shotCtx.close();
  }

  console.log("\n页面错误：" + (errs.length ? errs.join(" | ") : "无"));
  ok(errs.length === 0, "两版页面零 JS 错误");
  console.log("\n=== 合计 " + checks + " 项，红 " + fails + " 项 ===");
  await browser.close(); sNew.close(); sOld.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
