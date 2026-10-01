/* 经纬春秋 · 生产新鲜度抽验门（r54-2 立，2026-09-26；★ **不破缓存**之门）
 * ============================================================================
 *
 * 【立门之由（`team/round53_prompts.md` §十一 新发现 → `team/round54_prompts.md` r54-2 三节）】
 *   `prod_data_invariants.js` 与 `prod_render_invariants.js` 二门**逐个同源子资源改写 URL 加参**
 *   （r52 门头明书其由：「只在文档 URL 上加参不足以把 `app.js`／`styles.css` 的旧本冲掉」）。
 *   ★ 故二门**永远拿到新本，结构上看不见读者会看见的这个问题**。本门专补此一处：
 *   **以常人之法访生产——不加任何 `?v=`、不改写任何子资源之 URL、不设 `Cache-Control` 请求头。**
 *
 * 【★ 本门所不能答之问（先书其界，免后人以本门之绿充「读者已拿到新本」）】
 *   读者之旧本在**读者自己浏览器的缓存里**，而 `node` 之请求**没有浏览器缓存**。
 *   ★ 故本门所得者是**边缘此刻所服之本**，不是某个回访读者此刻所跑之本——**服务端探不到读者的缓存。**
 *   本门能量者二：
 *     ① **边缘此刻所服之本**与**本仓所推之本**是否同一本（§二）；
 *     ② **读者之窗有多长**——其长 = 主脚本之 `max-age`；其存否 = 其 URL 是否指纹化（§三）。
 *   ★ 此即本轮「**量具与读者所见不是一个东西**」之训落到读者身上的一条：
 *     **本门绿，不等于回访之读者拿到的是新本。** 二者何时才等，见下【升格之约】。
 *
 * 【本门之五节】
 *   §一 · **常人之法取物**——取生产之文档，自其内正则得 `<script src>`／`<link rel=stylesheet href>`
 *        之**实际 URL**（★ 不写死脚本之名：日后若改为 `app-<hash>.js`，本门自随之），
 *        并就此一并量「其引法**有无版本参／内容哈希**」。
 *   §二 · **新鲜之量（边缘层）**——所期**跑时自本仓 `site/app.js` 求得，一名不写死**：
 *        取本仓主脚本内**全部函数声明之名**（`function NAME(` 之形，其数亦跑时自数），
 *        逐名验其在生产所得之文内；并以 SHA-256 与字节数对位。
 *        ★ 「本轮所推之新函数」自然含于此全集之内——**不必指名某一函数，故不必每轮回改本门一个字。**
 *        ★ **所期取工作区之本**（「本次所推之本」之所在），故工作区若有**在制未推之改**，本门必报其差；
 *          **其时之差不是生产之误**——读法随报一并印出（同一轮里旁人在改 `site/` 是常事）。
 *   §三 · **窗之量（结构层）**——`Cache-Control` 之 `max-age` 即读者之窗；逐样本列其头，
 *        并分二类：**在窗内者**与**不在窗内者**（样本之名跑时自本仓 `site/` 求得，不写死）。
 *   §四 · **其头出自何处之机器旁证**——生产之头 vs GitHub Pages 镜像之头（镜像之 URL 跑时自
 *        `git remote get-url origin` 推得，不写死）。★ 二者不同，即证生产之头**非 GitHub Pages 之常设**。
 *   §五 · **按类反证**（裁四十九⑤、裁二十四）——本门既以「同一本」责生产，须自证其量得住：
 *        ① **逐名对位**：逐个去其一名之声明，喂同一量法，**须恰报该一名缺**；一名测不出即抛错中止。
 *           ★ **其底取本仓之文，不取生产之文**（落笔当日实测所改，其由记此）：生产之文若本已缺某名
 *             （如本轮在制之新函数尚未推），则「去其声明」于生产之文**无一字可去**，该名遂永测不出——
 *             **那是反证之底选错了，不是量法不行**。本仓之文**必含每一名**，故「去一名即报一名」之对位
 *             于此才立得住。生产之文之状，由 §二 之正验与 §五之二 之真旧本二处责之。
 *        ② **真旧本**：自 git 取一个**已知为旧**之 `site/app.js`（其最近一个较旧之提交），
 *           喂同一量法，**须当场报缺名且 SHA 不同**；测不出即抛错中止；
 *        ③ **自证不写死**：读本门之源码，证其内**无任何主脚本函数名之声明形**、
 *           **无所测 `max-age` 之数字**；并各配其反证（当场注入一个，须命中）。
 *
 * 【★ 判之分寸：**只报不红**（本门之退出码不因「不同」而变，见下）】
 *   r54-2 三节命「其判为『只报不红』抑或『红』，由你拟并陈其由」。**拟为：只报不红。** 四由——
 *   ① **缓存之窗有其常态**：一次部署之后，边缘与浏览器俱可能在一段时间内持旧本；
 *      一律红则**每逢部署后必红**，其门遂成噪音（r52 之训：「间歇红之门终将被当成噪音关掉」）。
 *   ② **§三之量今日必然成立**：URL 未指纹化、`max-age` 远大于零——**若以其为红，本门自今日起长红不灭**，
 *      直到二案之一落笔为止。**长红之门与关掉之门无异。**
 *   ③ **真红之位在别处，本门不重复其职**：「推了没上线」已有二门责之——
 *      `.github/workflows/pages.yml` 之部署后自检（带 cache-bust 参比 `generated_at`）
 *      与 `prod_data_invariants.js` §一（逐表同数）。二者之判为红且不噪。
 *   ④ ★ **本门之职在「记」不在「拦」**：把一个**结构上看不见**的病，变成每轮都会被读到的一行字。
 *      故其文**必书窗之长**（跑时自算自报，不写死）。
 *   ★ **惟「本门自身之量不成立」为硬错**（取物失败／反证失效／本仓无主脚本）——退出码 2，**决不默然放行**。
 *
 * 【★ 升格之约（后人改本门之凭据；勿径改判而不读此段）】
 *   二案之一落笔**之后**——即文档之引法指纹化（甲）**或** 主脚本之 `max-age` 降至 0（乙）——
 *   **长红之虞即去**，其时 §二／§三 方可改判为红：
 *     · 甲落笔后：§三之「有无版本参／哈希」一转为**红**（其失即回旧病）；
 *     · 乙落笔后：§三之「`max-age` 大于零」一转为**红**（须连样式表、SVG 一并看）。
 *   ★ **改判之时须连本段一并改**，不得只改码而留此文（同 `prod_data_invariants.js`「无重试」段之式）。
 *
 * 【跑法】
 *   node tools/qa/prod_freshness.js
 *     · 不设 QA_BASE_URL       → 生产站 https://chunqiu.timechorus.com（**本门之常法**）
 *     · QA_BASE_URL=http://... → 指向任意源端；★ 其时 §三／§四 所量者是**该源端**之头，
 *                                 本门当场声明，**不冒充已验生产之窗**。
 *   ★ 本门**一律不加破缓存之参**——加之即失本门之义（此系本门与二门之唯一分野，勿「顺手补上」）。
 *
 * 【退出码】 0＝量成立（含「只报」之异）；2＝本门自身出错、反证失效或依赖缺。★ **本门无退出码 1。**
 *
 * 【本门无重试（承裁五十七，2026-09-26；★ 有意为之，勿补）】
 *   一次网络失败即退出码 2，不自行复跑。**其由**：复跑之代价只是重跑一次；
 *   而加重试之代价是把真的故障也熬成绿。**宁可多跑一次。** 后人见偶发 exit 2，请复跑，勿补重试。
 */
"use strict";

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..", "..");
const SITE = path.join(ROOT, "site");
const SELF = __filename;
const PROD = "https://chunqiu.timechorus.com";
const BASE = String(process.env.QA_BASE_URL || PROD).replace(/\/+$/, "");
const NET_MS = 25000;            /* 同二门之分寸：宁长勿短，超时取短者会把「网络慢」变成「见红」 */
const SHOW_N = 8;                /* 列示之上限；凡列示者一律自书「此系前 N，非全量」（常条，r53 裁五十八） */
/* 常人之法：一个寻常浏览器之 UA，且**不设任何 `Cache-Control`／`Pragma` 请求头**。
 * ★ 读法：边缘对 UA 之别不施别样之头（r54-2 落笔时以 curl 之 UA 与此 UA 各量一过，所得之
 *   `Cache-Control` 相同）。 */
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

let reports = 0;                 /* 「只报」之数——不入退出码，只入末尾之述 */
function sect(s) { console.log("\n" + s); }
function note(s) { console.log("    " + s); }
function okay(label, detail) { console.log("  ✓ " + label + (detail ? "  —— " + detail : "")); }
function rep(label, detail) { reports++; console.log("  ! " + label + (detail ? "  —— " + detail : "")); }
function die(msg) { throw new Error(msg); }

/* ---------------- 取物（不加参、不设缓存头） ---------------- */
function fetchRaw(u, hops) {
  hops = hops == null ? 4 : hops;
  const mod = u.indexOf("https:") === 0 ? https : http;
  return new Promise((resolve, reject) => {
    const rq = mod.get(u, { headers: { "User-Agent": UA, "Accept": "*/*" } }, (res) => {
      const st = res.statusCode;
      if (st >= 300 && st < 400 && res.headers.location && hops > 0) {
        res.resume();
        let next;
        try { next = new URL(res.headers.location, u).toString(); } catch (e) { return reject(e); }
        return fetchRaw(next, hops - 1).then(resolve, reject);
      }
      const chunks = [];
      res.on("data", (d) => chunks.push(d));
      res.on("end", () => resolve({ url: u, status: st, headers: res.headers, buf: Buffer.concat(chunks) }));
      res.on("error", reject);
    });
    rq.on("error", reject);
    rq.setTimeout(NET_MS, () => rq.destroy(new Error("取物超时 " + NET_MS + "ms：" + u)));
  });
}
function sha256(buf) { return crypto.createHash("sha256").update(buf).digest("hex"); }
function maxAgeOf(cc) {
  if (!cc) return null;
  const m = String(cc).match(/max-age\s*=\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}
function humanWindow(sec) {
  if (sec == null) return "无 max-age（其窗由启发式定，须以真浏览器实测）";
  if (sec === 0) return "零（每访必回源校验）";
  const h = sec / 3600;
  return sec + " 秒＝" + (Number.isInteger(h) ? h + " 小时" : (sec / 60).toFixed(1) + " 分钟");
}

/* ---------------- 量法：函数声明之名（所期跑时自本仓求得，一名不写死） ---------------- */
function namesIn(text) {
  const re = /\bfunction\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
  const out = new Set();
  let m;
  while ((m = re.exec(text)) !== null) out.add(m[1]);
  return out;
}
function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function declRe(name) { return new RegExp("function\\s+" + escRe(name) + "\\s*\\(", "g"); }
/* ★ 正验与反证共用此一函数——反证与正验不是两套码（同 `prod_data_invariants.js` §一之式） */
function missingOf(expectNames, text) {
  const have = namesIn(text);
  return expectNames.filter((n) => !have.has(n));
}

/* ---------------- git（只读之命：log／show／remote get-url；★ 一条也不写 index） ---------------- */
function gitOut(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
}
function gitBuf(args) {
  return execFileSync("git", args, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
}
function mirrorFromGit() {
  const url = gitOut(["remote", "get-url", "origin"]).trim();
  const m = url.match(/github\.com[:/]+([^/]+)\/([^/.\s]+)/);
  if (!m) return null;
  return { owner: m[1], repo: m[2], base: "https://" + m[1].toLowerCase() + ".github.io/" + m[2] };
}
function firstSvgUnder(dir) {
  let hit = null;
  (function walk(d) {
    if (hit) return;
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      if (hit) return;
      const p = path.join(d, f.name);
      if (f.isDirectory()) walk(p);
      else if (f.name.toLowerCase().endsWith(".svg")) hit = path.relative(SITE, p).split(path.sep).join("/");
    }
  })(dir);
  return hit;
}

/* ================================================================ 主 ================================================================ */
async function run() {
  console.log("经纬春秋 · 生产新鲜度抽验门（r54-2 立）——★ 不破缓存、不改写子资源之门");
  console.log("所访源端：" + BASE + (BASE === PROD ? "（生产）" : "（★ 非生产：§三／§四 所量者是此源端之头，不得以其绿充『生产之窗已验』）"));
  console.log("本机时刻：" + new Date().toString());

  const localAppPath = path.join(SITE, "app.js");
  if (!fs.existsSync(localAppPath)) die("本仓无 " + localAppPath + "——本门之所期无从求得，中止");
  const localApp = fs.readFileSync(localAppPath);
  const localNames = Array.from(namesIn(localApp.toString("utf8"))).sort();
  if (localNames.length < 20) die("本仓主脚本只提取到 " + localNames.length + " 个函数声明——量具自身可疑（提取式或文件有变），中止");
  const localSha = sha256(localApp);

  /* ---------------- §一 常人之法取物 ---------------- */
  sect("【一】常人之法取物：不加 `?v=`、不改写子资源、不设 `Cache-Control` 请求头");
  const doc = await fetchRaw(BASE + "/");
  if (doc.status !== 200) die("取文档失败：" + doc.url + " -> HTTP " + doc.status);
  const docText = doc.buf.toString("utf8");
  okay("文档已取", doc.url + "（HTTP 200，" + doc.buf.length + " 字节）");

  const scripts = [];
  const sre = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let sm;
  while ((sm = sre.exec(docText)) !== null) scripts.push(sm[1]);
  const sameOrigin = scripts.filter((s) => !/^(https?:)?\/\//i.test(s));
  const cssRefs = [];
  const lre = /<link\b[^>]*\brel\s*=\s*["']stylesheet["'][^>]*>/gi;
  let lm;
  while ((lm = lre.exec(docText)) !== null) {
    const h = lm[0].match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (h && !/^(https?:)?\/\//i.test(h[1])) cssRefs.push(h[1]);
  }
  note("文档内 `<script src>` 共 " + scripts.length + " 处，其中同源（相对路径）" + sameOrigin.length + " 处：" + sameOrigin.join("、"));
  note("文档内同源样式表 " + cssRefs.length + " 处：" + (cssRefs.join("、") || "无"));
  if (!sameOrigin.length) die("文档内无同源 `<script src>`——本门无从取其脚本，中止");

  const scriptRef = sameOrigin[0];   /* 主脚本：同源之第一处；★ 其名跑时自文档取，不写死 */
  const cssRef = cssRefs.length ? cssRefs[0] : null;

  const hasQuery = scriptRef.indexOf("?") >= 0;
  const hasHashInName = /[.-][0-9a-f]{8,}\.js(\?|$)/i.test(scriptRef);
  if (hasQuery || hasHashInName) {
    okay("主脚本之引法**已指纹化**", scriptRef + "（" + (hasQuery ? "带查询参" : "") + (hasHashInName ? (hasQuery ? "＋" : "") + "名内含哈希" : "") + "）");
    note("★ 若此系二案之甲已落笔，请照门头【升格之约】把本条与 §三之窗一并改判为红。");
  } else {
    rep("主脚本之引法**未指纹化**（读者之窗由此而存）", scriptRef + "——无版本参、无内容哈希");
  }

  /* ---------------- §二 新鲜之量（边缘层） ---------------- */
  sect("【二】新鲜之量（边缘层）：本仓主脚本之函数名全集逐名对位；所期跑时求得，一名不写死");
  const scriptUrl = new URL(scriptRef, doc.url).toString();
  const prodScript = await fetchRaw(scriptUrl);
  if (prodScript.status !== 200) die("取主脚本失败：" + scriptUrl + " -> HTTP " + prodScript.status);
  const prodText = prodScript.buf.toString("utf8");
  const prodSha = sha256(prodScript.buf);
  note("所取之 URL（一字未改、一参未加）：" + prodScript.url);
  note("本仓所声明之函数名 " + localNames.length + " 个（跑时提取，非写死）；生产所得之文内声明 " + namesIn(prodText).size + " 个");

  const missing = missingOf(localNames, prodText);
  if (!missing.length) {
    okay("本仓所声明之 " + localNames.length + " 名**逐名在位**于生产所服之本", "一名不缺");
  } else {
    rep("生产所服之本**缺 " + missing.length + " 名**（边缘此刻所服者非工作区之本）",
      "缺名（前 " + Math.min(SHOW_N, missing.length) + "，**此系前 N，非全量**）：" + missing.slice(0, SHOW_N).join("、"));
    note("★ 读法（勿误读）：所期取**工作区**之本。若此刻工作区有**在制未推**之改（旁人之件亦然），");
    note("    则缺名之报是**本门量到了那些未推之新函数**，**不是生产之误**；欲分辨二者，以 `git status --porcelain -- site/app.js` 一看即知。");
  }
  if (localSha === prodSha) {
    okay("SHA-256 对位：边缘此刻所服之 `" + scriptRef + "` 与本仓**同一本**", localSha.slice(0, 16) + "…（" + prodScript.buf.length + " 字节）");
  } else {
    rep("SHA-256 对位：**不同本**", "本仓 " + localSha.slice(0, 16) + "…（" + localApp.length + " 字节）／生产 " + prodSha.slice(0, 16) + "…（" + prodScript.buf.length + " 字节）");
  }
  const extra = Array.from(namesIn(prodText)).filter((n) => localNames.indexOf(n) < 0).sort();
  if (extra.length) {
    rep("生产所服之本另有 " + extra.length + " 名为本仓所无（其本或**新于**本仓，或本仓有未推之删）",
      "（前 " + Math.min(SHOW_N, extra.length) + "，**此系前 N，非全量**）：" + extra.slice(0, SHOW_N).join("、"));
  }
  /* 文档与脚本之同步态（★ 三态之分：其第二态正是读者所见之病在服务端之投影） */
  const localDocPath = path.join(SITE, "index.html");
  if (fs.existsSync(localDocPath)) {
    const docSame = sha256(fs.readFileSync(localDocPath)) === sha256(doc.buf);
    const jsSame = localSha === prodSha;
    const state = docSame && jsSame ? "文档新·脚本新（同步）"
      : docSame && !jsSame ? "★ **文档新·脚本旧**——此即读者所见之病在边缘层之投影"
        : !docSame && jsSame ? "文档旧·脚本新" : "文档旧·脚本旧（部署尚未到此边缘，或本仓有未推之改）";
    note("文档／脚本之同步态：" + state);
    if (!docSame) note("★ 读法：文档之 SHA 与本仓不同，未必是生产之误——本仓若有未推之改（如在制之件），其差即由此而来。");
  }

  /* ---------------- §三 窗之量（结构层） ---------------- */
  sect("【三】窗之量（结构层）：`Cache-Control` 之 `max-age` 即读者之窗");
  const samples = [{ label: "文档", ref: "/", res: doc }, { label: "主脚本", ref: scriptRef, res: prodScript }];
  if (cssRef) samples.push({ label: "样式表", ref: cssRef, res: await fetchRaw(new URL(cssRef, doc.url).toString()) });
  const dataDir = path.join(SITE, "data");
  if (fs.existsSync(dataDir)) {
    const j = fs.readdirSync(dataDir).filter((f) => f.toLowerCase().endsWith(".json")).sort()[0];
    if (j) samples.push({ label: "数据 JSON", ref: "data/" + j, res: await fetchRaw(new URL("data/" + j, doc.url).toString()) });
  }
  const svgRef = firstSvgUnder(fs.existsSync(path.join(SITE, "assets")) ? path.join(SITE, "assets") : SITE);
  if (svgRef) samples.push({ label: "SVG 资产", ref: svgRef, res: await fetchRaw(new URL(svgRef, doc.url).toString()) });

  const inWindow = [], outWindow = [];
  for (const s of samples) {
    const cc = s.res.headers["cache-control"] || null;
    const ma = maxAgeOf(cc);
    const tag = [s.res.headers["server"] ? "server=" + s.res.headers["server"] : null,
      s.res.headers["cf-cache-status"] ? "cf-cache-status=" + s.res.headers["cf-cache-status"] : null,
      s.res.headers["etag"] ? "etag=" + String(s.res.headers["etag"]).slice(0, 20) : null].filter(Boolean).join("，");
    console.log("  · " + s.label + "（" + s.ref + "）：Cache-Control: " + (cc || "（无）") + "　｜　" + tag);
    (ma ? inWindow : outWindow).push({ label: s.label, ref: s.ref, ma: ma });
  }
  const scriptMa = maxAgeOf(prodScript.headers["cache-control"]);
  note("★ **读者之窗**（本门之要句）：主脚本 `" + scriptRef + "` 之 max-age = " + humanWindow(scriptMa));
  if (scriptMa) {
    rep("读者之窗**存在**，其长 " + humanWindow(scriptMa),
      "一次部署之后，回访之读者可能在此窗之内拿到**新文档配旧脚本**（文档之 max-age = " + humanWindow(maxAgeOf(doc.headers["cache-control"])) + "）");
    note("在窗内者（max-age 大于零）：" + (inWindow.map((x) => x.label + " " + x.ma + "s").join("、") || "无"));
    note("不在窗内者（max-age 为零或无）：" + (outWindow.map((x) => x.label).join("、") || "无"));
    note("★ 其治二案候站长之裁（r54-2 二节：**只陈不落**）：甲·指纹其 URL（一换即必回源）／乙·缩其 TTL（恃 ETag 省流）。");
  } else {
    okay("主脚本之 max-age 为零或无——读者之窗已不存（若此系二案之乙已落笔，请照【升格之约】改判为红）");
  }

  /* ---------------- §四 其头出自何处之机器旁证 ---------------- */
  sect("【四】其头出自何处之机器旁证：生产之头 vs GitHub Pages 镜像之头（镜像 URL 跑时自 git remote 推得）");
  let mirror = null;
  try { mirror = mirrorFromGit(); } catch (e) { note("git remote 取不得（" + String(e.message).split("\n")[0] + "）"); }
  if (!mirror) {
    rep("镜像之 URL 无从推得，本节之旁证缺", "★ 缺之即声明，不算已验");
  } else {
    note("镜像之推得：" + mirror.owner + "/" + mirror.repo + " → " + mirror.base);
    let mres = null;
    try { mres = await fetchRaw(mirror.base + "/" + scriptRef.replace(/^\.?\//, "")); } catch (e) { note("镜像取物失败：" + String(e.message).split("\n")[0]); }
    if (!mres || mres.status !== 200) {
      rep("镜像之同名脚本取不得（" + (mres ? "HTTP " + mres.status : "网络失败") + "）", "★ 本节之旁证缺，只报不判");
    } else {
      const pcc = String(prodScript.headers["cache-control"] || "");
      const mcc = String(mres.headers["cache-control"] || "");
      console.log("  · 生产：Cache-Control: " + pcc + "　｜　server=" + (prodScript.headers["server"] || "（无）") + "，cf-cache-status=" + (prodScript.headers["cf-cache-status"] || "（无）"));
      console.log("  · 镜像：Cache-Control: " + mcc + "　｜　server=" + (mres.headers["server"] || "（无）") + "，via=" + (mres.headers["via"] || "（无）") + "，x-github-request-id=" + (mres.headers["x-github-request-id"] ? "在" : "不在"));
      if (pcc && mcc && pcc !== mcc) {
        okay("二头**不同** → 生产之 `Cache-Control` **非 GitHub Pages 之常设**", "生产「" + pcc + "」／镜像「" + mcc + "」");
        const cfSign = String(prodScript.headers["server"] || "").toLowerCase().indexOf("cloudflare") >= 0 || !!prodScript.headers["cf-cache-status"] || !!prodScript.headers["cf-ray"];
        const ghSign = !!mres.headers["x-github-request-id"] || /varnish/i.test(String(mres.headers["via"] || ""));
        note("★ 读法：生产之供者" + (cfSign ? "**是 Cloudflare**（server／cf-cache-status／cf-ray 之征在）" : "未见 Cloudflare 之征")
          + "；镜像之供者" + (ghSign ? "**是 GitHub Pages**（x-github-request-id／via: varnish 之征在）" : "未见 GitHub 之征") + "。");
        note("★ 故此头可设与否，**不在本仓，在 Cloudflare 一侧**（`docs/deploy_cloudflare.md`：主站系 Cloudflare Pages ＋ 自定义域，与 GH Pages 镜像二管线相互独立）。");
      } else if (pcc && mcc) {
        rep("二头**相同**——本节之旁证不成立（其头或出自二者之共同上游）", "生产「" + pcc + "」／镜像「" + mcc + "」");
      } else {
        rep("二者之一无 `Cache-Control`，无从相比", "生产「" + (pcc || "（无）") + "」／镜像「" + (mcc || "（无）") + "」");
      }
      const msha = sha256(mres.buf);
      note("二管线之本：生产 " + prodSha.slice(0, 12) + "…／镜像 " + msha.slice(0, 12) + "…" + (msha === prodSha ? "（同）" : "（★ 不同——二管线各有其部署之迟，非必为病）"));
    }
  }

  /* ---------------- §五 按类反证 ---------------- */
  sect("【五之一】按类反证 · **逐名对位**：逐个去其一名之声明，须恰报该一名缺（裁二十四：不得以整批见红充每名之能量）");
  note("★ 反证之底取**本仓之文**（其必含每一名），非生产之文——其由见门头 §五①之记。");
  const localText = localApp.toString("utf8");
  const deadNames = [], sloppy = [];
  for (const n of localNames) {
    const mutated = localText.replace(declRe(n), "function __cp_removed__(");
    const got = missingOf(localNames, mutated);
    if (got.indexOf(n) < 0) deadNames.push(n);
    else if (got.length !== 1) sloppy.push(n + "→" + got.join("＋"));
  }
  if (deadNames.length) {
    die("反证失效（五之一 · 逐名）：以下名之对照喂入而量法**不报其缺**——本门量不到它自称在量的东西，中止（前 "
      + Math.min(SHOW_N, deadNames.length) + "，**此系前 N，非全量**）：" + deadNames.slice(0, SHOW_N).join("、"));
  }
  okay("逐名反证 " + localNames.length + "／" + localNames.length + " 名**俱当场报缺**",
    sloppy.length ? "★ 其中 " + sloppy.length + " 名牵动他名（前 " + Math.min(SHOW_N, sloppy.length) + "）：" + sloppy.slice(0, SHOW_N).join("；") : "且无一名牵动他名");

  sect("【五之二】按类反证 · **真旧本**：自 git 取一个已知为旧之 `site/app.js`，喂同一量法，须当场报缺名且 SHA 不同");
  let proved = null;
  const tried = [];
  try {
    const shas = gitOut(["log", "--format=%H", "--", "site/app.js"]).trim().split(/\s+/).filter(Boolean);
    for (const sh of shas.slice(0, 30)) {
      const buf = gitBuf(["show", sh + ":site/app.js"]);
      const miss = missingOf(localNames, buf.toString("utf8"));
      tried.push(sh.slice(0, 7) + "(缺" + miss.length + ")");
      if (miss.length && sha256(buf) !== localSha) { proved = { sha: sh, miss: miss, bytes: buf.length }; break; }
    }
  } catch (e) {
    die("反证失效（五之二 · 真旧本）：git 不可用或取不得旧本（" + String(e.message).split("\n")[0] + "）——本门无从自证其量得住，中止");
  }
  if (!proved) {
    die("反证失效（五之二 · 真旧本）：所试之 " + tried.length + " 个旧本**无一被量出缺名**——量法可疑，中止。所试（前 "
      + Math.min(SHOW_N, tried.length) + "，**此系前 N，非全量**）：" + tried.slice(0, SHOW_N).join("、"));
  }
  okay("真旧本 " + proved.sha.slice(0, 7) + " 当场报缺 " + proved.miss.length + " 名（" + proved.bytes + " 字节，其 SHA 与本仓不同）",
    "缺名（前 " + Math.min(SHOW_N, proved.miss.length) + "，**此系前 N，非全量**）：" + proved.miss.slice(0, SHOW_N).join("、"));
  note("所试之旧本序（前 " + Math.min(SHOW_N, tried.length) + "，**此系前 N，非全量**）：" + tried.slice(0, SHOW_N).join("、"));

  sect("【五之三】自证不写死：读本门之源码，证其内无主脚本函数名之声明形、无所测之 max-age 数；并各配其反证");
  const selfSrc = fs.readFileSync(SELF, "utf8");
  const hardNames = localNames.filter((n) => declRe(n).test(selfSrc));
  if (hardNames.length) {
    die("自证不过：本门源码内含主脚本函数名之声明形 " + hardNames.length + " 处（前 " + Math.min(SHOW_N, hardNames.length) + "："
      + hardNames.slice(0, SHOW_N).join("、") + "）——所期写死即本门之所戒；若系本门私名与其偶合，请改本门之私名。中止");
  }
  const probe = localNames[localNames.length - 1];
  if (!declRe(probe).test(selfSrc + "\nfunction " + probe + "(){}")) {
    die("自证之反证失效（名）：注入 `function " + probe + "(` 而扫不出——扫描式无力，中止");
  }
  okay("本门源码内**无一个**主脚本函数名之声明形（" + localNames.length + " 名逐名扫过）", "其反证（注入 `" + probe + "` 之声明）当场命中");
  if (scriptMa != null) {
    const maStr = String(scriptMa);
    const hitSelf = selfSrc.split("\n").filter((ln) => ln.indexOf(maStr) >= 0);
    if (hitSelf.length) {
      rep("自证（数）：本门源码内出现 `" + maStr + "` 之字样 " + hitSelf.length + " 行", "★ 须人眼过目：其为门头之实测记述（可）抑或落入码内之写死（不可）");
      hitSelf.slice(0, 3).forEach((ln) => note("  ↳ " + ln.trim().slice(0, 90)));
    } else {
      const injected = selfSrc + "\n/* " + maStr + " */\n";
      okay("本门源码内**无** `" + maStr + "`（所测之 max-age）之字样——窗之长跑时自算，非写死",
        "其反证：注入 `" + maStr + "` 后" + (injected.indexOf(maStr) >= 0 ? "当场命中" : "★ 扫不出，量法无力"));
    }
  }

  /* ---------------- 收 ---------------- */
  sect("【收】");
  console.log("  本门之判：**只报不红**（门头已陈其四由）。本跑「只报」之条 " + reports + " 条，退出码 **0**。");
  console.log("  ★ 读者之窗：主脚本 `" + scriptRef + "` 之 max-age = " + humanWindow(scriptMa) + "；其 URL " + (hasQuery || hasHashInName ? "已指纹化" : "**未指纹化**") + "。");
  console.log("  ★ 本门之界（勿忘）：所量者是**边缘此刻所服之本**与**窗之长**；**读者浏览器内之旧本，服务端探不到**。");
  console.log("  ★ 二案（甲·指纹／乙·缩 TTL）候站长之裁；裁定落笔之后，照门头【升格之约】改判，**须连其文一并改**。");
  process.exit(0);
}

run().catch((e) => {
  console.error("\n✗ 本门自身出错或反证失效：" + (e && e.stack ? e.stack : e));
  console.error("★ 本门无重试（承裁五十七）：若系一次网络抖断，请**复跑**，勿补重试。");
  process.exit(2);
});
