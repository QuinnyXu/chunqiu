/* 经纬春秋 · r55-B 走查门：底图之契与载时自验
 * （任务书 `team/round54_prompts.md` §八 裁九十九、§九 裁一百〇五、领队之十八·〇～五）
 *
 * 本件所落者三：
 *   ① `site/app.js` 头之「契之清册」（今所依赖之底图结构逐一列明）＋ `BASE_MAP_NEEDS` ＋ `mountBaseMap()`；
 *   ② 三处注入点（首页地图／人物地图／并观地图）注入后**自验其契**，缺一即**显式报出**（一行可见之告）；
 *   ③ 一约二处（`app.js` 头与 `base_map.svg` 头）。
 *
 * 本门要回答五个问题，一个都不许用「我改完看着对」来答：
 *   ⑴ **契写下来了**——清册逐条在源码之内（机械实读，非口说）；一约二处同文。
 *   ⑵ **常态无变**——两宽（1440／375）三页（首页地图／人物地图／并观地图）皆照旧出图、零告、零 pageerror；
 *      且新旧两版所量之数逐一相等（`.home-state` 枚数、`#layer-anchors` 子节点数、国名字号）。
 *   ⑶ **按类反证（裁二十四「逐条对位」）**——以**变体底图**喂之，其告须**当场可见**：
 *      甲 删去 `#layer-anchors`；乙 去国名之 `data-state`；丙 改 `viewBox`。
 *      ★ 每式各配一个**同法施于旧版**之量，其对位之判据不是「旧版也红」，而是——
 *        **旧版于图之处无一字之告**（详见门头【实测反转·一】：甲之深链态以页脚一句张冠李戴之告蒙过，
 *        甲之站内导航态抛未捕获之错；乙丙二态连错都不抛，全然无声）。
 *      **这正是裁九十九所称之「坏而不声」，本门把它量成了数。**
 *   ⑷ **新版之告不以抛错代之**——三式变体下新版 pageerror 皆须为 0、页脚亦不被污（不冒充「加载失败」）：
 *      **有声不等于崩。**
 *   ⑸ **两宽二途俱量**——⑵在两宽；⑶⑷在 1440px／375px × 深链／站内导航**四格全跑**。
 *
 * ★ 旧版源端锚定固定哈希 `OLD_REF`（见下），**不取 `HEAD`**（照 r51 裁二十六、r52／r53／r54 之例）：
 *   本件合入后 `HEAD` 即含本轮之改，「旧版」会等于新版，§三之反证必转绿——错且是静默的错。
 * ★ **单变量**：旧版源端**只覆 `/app.js` 一物**。本轮 `base_map.svg` 之改只是一段注释（一约），
 *   不涉结构；§一之【约·乙】以「剥去注释后二版逐字全等」机械证之。反证之三变体亦**一律自工作区之图派生**，
 *   故新旧两版所食之底图一字不差，**变量只有 `app.js` 一个**。
 * ★ 本门**不动仓库任何文件**：旧版取自 `git show <OLD_REF>:site/app.js`（只读），
 *   不切分支、不 stash、不写 git index；亦**不碰 `tools/qa/` 之他本**。
 *
 * ★★ 【门内自撞·一，当记】首跑【契·己】红：其量法作 `innerHTML = baseMapText` 之计数，
 *   期三而得四——**第四个出自我自己写进 `app.js` 头之清册注文**。
 *   错在量具（注文与代码同形而被一并数去），不在被量之物；故改量法为 `.innerHTML = baseMapText;`
 *   （带点带分号＝代码之形），**不改断言之期以凑绿**。此与 r54「标签与所量之物不符即是假账」同族。
 *
 * ★★ 【门内自撞·二，当记】次跑「其告确在页面上现形」于「丙式·375px·站内导航·人物地图」一格红：
 *   其量法作 `notes.every(可见)`，而该格之告有二枚——先落首页（viewBox 之变即告一枚于 `#home-map`），
 *   再导航入人物地图（又告一枚）；**首页之告随其视图隐去而不可见，遂把「皆可见」撞红**。
 *   ★ **红的是量法，不是被量之物**：此格之真相是「本页之告可见、上一视图之遗留不可见」，
 *   二者俱属应然。故判据改取**当前可见者之中有一枚记明所缺**，并连「告内记明」一条一并改以可见者为准——
 *   **否则那一条会拿上一视图之遗留来充本页之证据，是假账。**
 *
 * ★★ 【实测反转·一，当记；原断言之文照录不删】§三之甲（删 `#layer-anchors`）本门初稿断
 *   「**旧版另抛未捕获之错（pageerror ≥ 1）**」——**其言不实，首跑四条俱红**。实测旧版之坏**分两态**：
 *     ·**深链入站**（首载即在 `#/p/.../map`）：其错落在 `boot()` 之内，被文末 `boot().catch(...)` **吞掉**——
 *       **pageerror 为 0**，而页脚出一句**张冠李戴之告**：
 *       「加载失败：Cannot read properties of null (reading 'appendChild')（请经 http 访问并确认已运行 tools/csv_to_json.py）」
 *       ——**指向数据管线与 http 访问，而病在底图**；且其位在页脚，图之处一字不告。
 *     ·**站内导航**（自首页点入，经 hashchange → `render()`，已出 `boot()` 之外）：
 *       **抛未捕获之 TypeError**（`appendChild` of null），页内仍一字不告。
 *   ★ **故「坏而不声」比裁九十九所书更坏一层：它不只是不声，还会指错方向。**
 *   本门遂改为**二途俱量**（`nav: "deeplink"｜"insession"`），逐态书其所期——
 *   **一个只量深链的门会把旧版之抛错整个漏掉；一个只量站内导航的门会把那句误导之告整个漏掉。**
 *
 * 用法：node tools/qa/vision_r55.js
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
/* 把多行之错压成一行，便于逐条并列打印（本门之打印一条一行） */
const oneLine = (t) => String(t).split("\n").join(" ").split("\r").join(" ");

/* ---------- 双源端静态服务器（同 r51／r52／r53／r54 之式） ---------- */
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

/* 旧版源端之锚：`f611b81` 系 r54 收官之 `main`（2026-09-30 实读 `git log -1` 与
 * `git ls-remote origin HEAD` 同哈希、`git status --porcelain` 0 项），即**本件改动之前一版**。
 * 【不得改回 HEAD】理由见门头。 */
const OLD_REF = "f611b81";
const gitShow = (p) => execFileSync("git", ["show", OLD_REF + ":" + p], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString("utf8");

const TOUR_KEY = "chunqiu_tour_v1";
const TOUR_DONE = JSON.stringify({ v: 1, step: -1, done: true });   // 导览之记置为「已走完」，免浮层压图
const W_WIDE = 1440, H_WIDE = 900, W_NARROW = 375, H_NARROW = 780;

const NEW_APP = fs.readFileSync(path.join(SITE, "app.js"), "utf8");
const OLD_APP = gitShow("site/app.js");
const NEW_MAP = fs.readFileSync(path.join(SITE, "assets", "map", "base_map.svg"), "utf8");
const OLD_MAP = gitShow("site/assets/map/base_map.svg");

/* ---------- 三变体底图（皆自工作区之图派生，单变量） ---------- */
const ANCHOR_LINE = '  <g id="layer-anchors"></g>\n';
if (!NEW_MAP.includes(ANCHOR_LINE)) {
  throw new Error("锚定失效：base_map.svg 内未见 `" + ANCHOR_LINE.trim() + "`，变体无从派生——停门，不带病往下跑");
}
const MUT_NO_ANCHORS = NEW_MAP.replace(ANCHOR_LINE, "");                                  // 甲：整枚删去
const MUT_NO_LABEL_STATE = NEW_MAP.replace(/<text data-state=/g, "<text data-stateX=");   // 乙：只动国名之属性名（色块 ellipse 之 data-state 不动）
const MUT_VIEWBOX = NEW_MAP.replace('viewBox="0 0 1200 700"', 'viewBox="0 0 1200 701"');  // 丙：只动一位数
const MUT_PATH = "/assets/map/base_map.svg";

/* ---------- 独立复算：不读页面之文，直接自 base_map.svg 数其物 ---------- */
const N_STATE_ELLIPSE = (NEW_MAP.match(/<ellipse data-state=/g) || []).length;
const N_STATE_LABEL = (NEW_MAP.match(/<text data-state=/g) || []).length;

const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{2,}/g, "\n").trim();

async function pageOf(br, base, opts) {
  const o = opts || {};
  const ctx = await br.newContext({ viewport: { width: o.w || W_WIDE, height: o.h || H_WIDE } });
  await ctx.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch (e) {} }, [TOUR_KEY, TOUR_DONE]);
  const pg = await ctx.newPage();
  /* 「零 pageerror」之基准同 r54：errs 只收 pageerror；console error 另收一路并剔去
   * Cloudflare Analytics beacon 之 CORS 噪音（红线六之特批例外，自 127.0.0.1 必被挡）。
   * ★ 另单列一路 `breach`：`[base_map 契]` 一行系**本件所立之声**，正是反证所要的那个红——
   *   若把它算进「console 零错」，本门之 ⑷ 与 ⑶ 便自相矛盾。 */
  const errs = [], cerrs = [], breach = [];
  pg.on("pageerror", e => errs.push(String(e)));
  pg.on("console", m => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (t.includes("[base_map 契]")) { breach.push(t); return; }
    if (/cloudflareinsights|cdn-cgi\/rum/.test(t)) return;
    if (/Failed to load resource/.test(t) && /cloudflareinsights|cdn-cgi\/rum/.test(String(m.location && m.location().url || ""))) return;
    cerrs.push("console:" + t);
  });
  /* 二途导航（见门头【实测反转·一】）：
   *   deeplink  —— 首载即在目标 hash，其 render 落在 `boot()` 之内（错被 `boot().catch` 吞）；
   *   insession —— 先落首页，再改 hash，其 render 经 hashchange 而出 `boot()` 之外（错即未捕获）。
   * ★ 二途所量不同，是本门首跑撞出来的实情，非求全之赘。 */
  if (o.nav === "insession") {
    await pg.goto(base + "#/", { waitUntil: "networkidle" });
    await pg.waitForTimeout(500);
    await pg.evaluate((h) => { location.hash = h; }, o.hash || "#/");
  } else {
    await pg.goto(base + (o.hash || ""), { waitUntil: "networkidle" });
  }
  await pg.waitForTimeout(o.settle == null ? 900 : o.settle);
  return { ctx, pg, errs, cerrs, breach };
}

/* 一式之量：同一个函数施于新旧两版、施于常态与三变体——量具共用，才谈得上对位反证 */
async function measure(br, base, hash, w, h, nav) {
  const { ctx, pg, errs, cerrs, breach } = await pageOf(br, base, { hash: hash, w: w, h: h, nav: nav });
  const m = await pg.evaluate(() => {
    const notes = Array.from(document.querySelectorAll(".base-map-breach"));
    const anchorsIn = (sel) => {
      const host = document.querySelector(sel);
      const g = host && host.querySelector("#layer-anchors");
      return g ? g.children.length : -1;
    };
    const t = document.querySelector("#home-map #layer-labels text[data-state]");
    /* ★ 「现形」之判据取**当前可见者**，不取「所有 .base-map-breach 节点皆可见」——
     *   站内导航态下，先前视图（首页地图）之告随其视图隐去而仍在 DOM 内，
     *   以「皆可见」为判据者，量到的是上一视图之遗留，而非本页之告（本门第二次自撞，见门头【门内自撞·二】）。 */
    const shown = notes.filter(n => n.getClientRects().length > 0);
    return {
      breachCount: notes.length,
      breachText: notes.map(n => n.textContent).join(" | "),
      breachRole: notes.map(n => n.getAttribute("role")).join(","),
      breachShownCount: shown.length,
      breachShownText: shown.map(n => n.textContent).join(" | "),
      homeHot: document.querySelectorAll("#home-map .home-state").length,
      homeSvg: !!document.querySelector("#home-map svg"),
      labelFs: t ? t.getAttribute("font-size") : null,
      mapAnchors: anchorsIn("#map-canvas"),
      cmpAnchors: anchorsIn("#cmp-canvas"),
      footer: String((document.querySelector("#footer-stats") || {}).textContent || ""),
    };
  });
  await ctx.close();
  return Object.assign(m, { errs: errs, cerrs: cerrs, breach: breach });
}

(async () => {
  const { chromium } = require("playwright");

  /* ===== §一 源码实读：契写下来了，一约二处同文 ===== */
  head("§一 源码实读：「契之清册」与一约（机械实读，非口说）");
  const headBlock = NEW_APP.split("/* ---------- 设计配置")[0];
  const plainHead = headBlock.replace(/\*\*/g, "");
  ok(headBlock.indexOf("【契之清册】") >= 0, "【契·甲】清册在 `app.js` 头（「设计配置」之前）",
    "头段 " + headBlock.split("\n").length + " 行");
  const ITEMS = [
    ["外层 `<svg>`（三处注入）", "外层 `<svg>`"],
    ["`#layer-anchors`（二处）", "`#layer-anchors`"],
    ["`#layer-states`", "`#layer-states`"],
    ["`#layer-states-west`", "`#layer-states-west`"],
    ["`#layer-states-southeast`", "`#layer-states-southeast`"],
    ["`#layer-labels text[data-state]`（国名）", "`#layer-labels text[data-state]`"],
    ["`ellipse[data-state]`（色块／热区）", "ellipse[data-state]"],
    ["标注层子组之 `font-size` 属性", "`font-size` 属性"],
    ["`viewBox` 须 `0 0 1200 700`", "`0 0 1200 700`"],
    ["三处注入点各以何函数注入", "cmpBuildMap()"],
  ];
  ITEMS.forEach(function (pair) {
    ok(plainHead.indexOf(pair[1]) >= 0, "【契·乙】清册列明：" + pair[0]);
  });
  ok(plainHead.indexOf("（二处") >= 0, "【契·乙】`#layer-anchors` 明记「二处」（裁九十九③ 所命）");
  ok(/const BASE_MAP_NEEDS\s*=/.test(headBlock) && /function mountBaseMap\(/.test(headBlock),
    "【契·丙】`BASE_MAP_NEEDS` 与 `mountBaseMap()` 与清册同处（不变量与其门相邻）");
  const nMount = (NEW_APP.match(/mountBaseMap\(/g) || []).length;
  ok(nMount === 4, "【契·丁】三处注入点皆走 `mountBaseMap()`（1 定义＋3 调用）", "出现 " + nMount + " 次");
  ok(!/innerHTML = baseMapText;\s*\n\s*const svg = (box|canvas)\.querySelector\("svg"\)/.test(NEW_APP),
    "【契·戊】注入点已无「直取 svg」之旧式（静默之形已尽去）");
  /* ★ 量法订正（门头【门内自撞·一】）：取 `.innerHTML = baseMapText;` 之形（带点带分号＝代码），
   * 不取裸 `innerHTML = baseMapText`——后者连我写进清册之注文一并数去，首跑遂期三而得四。 */
  const nInject = (NEW_APP.match(/\.innerHTML = baseMapText;/g) || []).length;
  ok(nInject === 3, "【契·己】注入点仍恰三处（未新增、未漏改）", "计 " + nInject
    + "；裸 `innerHTML = baseMapText` 之计为 " + (NEW_APP.match(/innerHTML = baseMapText/g) || []).length
    + "（含清册注文一处，故不取之为量法）");
  ok(/boot\(\)\.catch\(/.test(OLD_APP) && OLD_APP.indexOf("加载失败：") >= 0 && OLD_APP.indexOf("csv_to_json.py") >= 0,
    "【契·庚】旧版吞错之处确在 `boot().catch`，其文确指数据管线（「请经 http 访问并确认已运行 tools/csv_to_json.py」）",
    "此即【实测反转·一】所据之源码证据——深链入站之告何以张冠李戴");

  const PACT_KEYS = ["凡动", "复读", "新依赖一个 id 者", "max-age=14400", "四小时内图不出"];
  PACT_KEYS.forEach(function (k) {
    ok(NEW_APP.indexOf(k) >= 0 && NEW_MAP.indexOf(k) >= 0, "【约·甲】一约二处同文，俱含「" + k + "」",
      "app.js " + (NEW_APP.indexOf(k) >= 0) + "／base_map.svg " + (NEW_MAP.indexOf(k) >= 0));
  });
  ok(stripComments(NEW_MAP) === stripComments(OLD_MAP),
    "【约·乙】`base_map.svg` 之改**只是注释**：剥去注释后与旧版逐字全等（结构一字未动）",
    "剥后新 " + stripComments(NEW_MAP).length + " 字 vs 旧 " + stripComments(OLD_MAP).length + " 字");

  ok(OLD_APP.indexOf("mountBaseMap") < 0 && OLD_APP.indexOf("BASE_MAP_NEEDS") < 0,
    "【锚·甲】旧版 `app.js`（" + OLD_REF + "）内 `mountBaseMap`／`BASE_MAP_NEEDS` 出现 0 次（锚定有效之正面证据）");
  ok(/const svg = canvas\.querySelector\("svg"\);\s*\n\s*mapState\.svg = svg;\s*\n\s*const anchors = svg\.querySelector\("#layer-anchors"\)/.test(OLD_APP),
    "【锚·乙】旧版确系「直取 svg 后径取 `#layer-anchors`」之静默之形（反证所对之物确在）");
  ok(/const svg = box\.querySelector\("svg"\);\s*\n\s*if \(!svg\) return;/.test(OLD_APP),
    "【锚·丙】旧版首页地图确系 `if (!svg) return;` 之静默 return（站长所拈之形确在）");
  /* ★ 此 15 之基线（照 §7「走查门之基线数」之律，注明其轮次与所由）：
   *   `base_map.svg` 末改于 **r28 `5713a9c`**（11 东部＋2 西部〔秦楚，r13〕＋2 东南〔吴 r27／越 r28〕）。
   *   ★ 其数**非写死而不可核**：同一跑内自 `base_map.svg` 复算一遍（N_STATE_*），
   *     且 §二 以之与页面实测之热区枚数对读——**底图日后增一国，此条即红，正是它该红的时候**。 */
  ok(N_STATE_ELLIPSE === 15 && N_STATE_LABEL === 15,
    "【数·甲】独立复算底图之物：`ellipse[data-state]` " + N_STATE_ELLIPSE + " 枚、`text[data-state]` " + N_STATE_LABEL + " 枚",
    "二者相等且＝15（11 东部＋2 西部＋2 东南；基线＝r28 `5713a9c`，其后 base_map.svg 未动）");

  /* ===== 跑 §二～§三 ===== */
  const br = await chromium.launch();
  const sNew = await srv(SITE, null);
  const sOld = await srv(SITE, { "/app.js": OLD_APP });
  const baseNew = "http://127.0.0.1:" + sNew.address().port;
  const baseOld = "http://127.0.0.1:" + sOld.address().port;

  const HASHES = [
    ["#/", "首页地图"],
    ["#/p/P_WENJIANG/map", "人物地图"],
    ["#compare=P_WENJIANG,P_QIXIANG", "并观地图"],
  ];
  const WIDTHS = [[W_WIDE, H_WIDE], [W_NARROW, H_NARROW]];

  for (const wh of WIDTHS) {
    const w = wh[0], h = wh[1];
    head("§二 常态（" + w + "px）：照旧出图、零告、零 pageerror；新旧两版所量之数相等");
    for (const hn of HASHES) {
      const hash = hn[0], name = hn[1];
      const a = await measure(br, baseNew, hash, w, h);
      const b = await measure(br, baseOld, hash, w, h);
      ok(a.breachCount === 0, w + "px " + name + "：无一枚告（常态不扰人）", "告 " + a.breachCount);
      ok(a.errs.length === 0 && a.cerrs.length === 0, w + "px " + name + "：零 pageerror（beacon 噪音已剔）",
        "pageerror " + a.errs.length + "／console " + a.cerrs.length + (a.errs.concat(a.cerrs).length ? "：" + a.errs.concat(a.cerrs).join(" ; ") : ""));
      if (hash === "#/") {
        ok(a.homeSvg && a.homeHot === N_STATE_ELLIPSE, w + "px 首页地图：热区 " + a.homeHot + " 枚＝独立复算之 " + N_STATE_ELLIPSE + " 枚");
        ok(a.labelFs === "26", w + "px 首页地图：国名已海报化（font-size=" + a.labelFs + "）");
        ok(a.homeHot === b.homeHot && a.labelFs === b.labelFs, w + "px 首页地图：新旧两版逐数相等（零影响）",
          "热区 " + a.homeHot + " vs " + b.homeHot + "；字号 " + a.labelFs + " vs " + b.labelFs);
      }
      if (hash === "#/p/P_WENJIANG/map") {
        ok(a.mapAnchors > 0, w + "px 人物地图：`#layer-anchors` 内 " + a.mapAnchors + " 子节点（轨迹／锚点已落）");
        ok(a.mapAnchors === b.mapAnchors, w + "px 人物地图：新旧两版锚点层子节点数相等（零影响）", a.mapAnchors + " vs " + b.mapAnchors);
      }
      if (hash.indexOf("#compare") === 0) {
        ok(a.cmpAnchors > 0, w + "px 并观地图：`#layer-anchors` 内 " + a.cmpAnchors + " 子节点");
        ok(a.cmpAnchors === b.cmpAnchors, w + "px 并观地图：新旧两版锚点层子节点数相等（零影响）", a.cmpAnchors + " vs " + b.cmpAnchors);
      }
    }
  }

  /* ===== §三 按类反证：三式变体 × 二途导航，逐式对位 ===== */
  /* ★ 每式之 `oldExpect` 系**实测所得**，非随手所期（见门头【实测反转·一】）：
   *   "swallowed" = 旧版错被 `boot().catch` 吞，pageerror 0 而页脚出一句指向数据管线之「加载失败」；
   *   "throws"    = 旧版抛未捕获之 TypeError；
   *   "mute"      = 旧版连错都不抛，全然无声。 */
  const CASES = [
    { key: "甲", mut: MUT_NO_ANCHORS, need: "#layer-anchors",
      who: [["#/p/P_WENJIANG/map", "人物地图"], ["#compare=P_WENJIANG,P_QIXIANG", "并观地图"]],
      oldExpect: { deeplink: "swallowed", insession: "throws" },
      why: "旧版 anchors 为 null，其后 append 即坏——深链态其错被 boot().catch 吞成一句页脚误告，站内导航态则抛未捕获之错" },
    { key: "乙", mut: MUT_NO_LABEL_STATE, need: "#layer-labels text[data-state]",
      who: [["#/", "首页地图"]],
      oldExpect: { deeplink: "mute", insession: "mute" },
      why: "旧版连错都不抛：国名静静地不海报化，无一字之告（坏而全然无声）" },
    { key: "丙", mut: MUT_VIEWBOX, need: "viewBox",
      who: [["#/", "首页地图"], ["#/p/P_WENJIANG/map", "人物地图"]],
      oldExpect: { deeplink: "mute", insession: "mute" },
      why: "旧版连错都不抛：一切落点整体偏移，无一字之告" },
  ];
  const NAVS = [["deeplink", "深链入站"], ["insession", "站内导航"]];
  const LOADFAIL = "加载失败：";

  for (const wh of WIDTHS) {
    const w = wh[0], h = wh[1];
    for (const c of CASES) {
      const ovN = {}; ovN[MUT_PATH] = c.mut;
      const ovO = {}; ovO[MUT_PATH] = c.mut; ovO["/app.js"] = OLD_APP;
      const mNew = await srv(SITE, ovN);
      const mOld = await srv(SITE, ovO);
      const bN = "http://127.0.0.1:" + mNew.address().port;
      const bO = "http://127.0.0.1:" + mOld.address().port;
      for (const nv of NAVS) {
        const nav = nv[0], navName = nv[1];
        head("§三 按类反证·" + c.key + "（" + w + "px ／" + navName + "）：变体底图缺「" + c.need + "」");
        for (const hn of c.who) {
          const hash = hn[0], name = hn[1];
          const a = await measure(br, bN, hash, w, h, nav);
          const b = await measure(br, bO, hash, w, h, nav);
          /* ——【新】其告须当场可见、记明所缺、不以抛错代之 —— */
          ok(a.breachCount >= 1, w + "px " + navName + " " + name + "【新】告当场可见：告 " + a.breachCount + " 枚", "role=" + a.breachRole);
          ok(a.breachShownCount >= 1, w + "px " + navName + " " + name + "【新】其告确在页面上现形（非 display:none 之死节点）",
            "可见者 " + a.breachShownCount + " 枚／共 " + a.breachCount + " 枚");
          ok(a.breachShownText.indexOf(c.need) >= 0, w + "px " + navName + " " + name + "【新】**可见之**告内记明所缺之 id／契",
            "含「" + c.need + "」：" + (a.breachShownText.indexOf(c.need) >= 0));
          ok(a.breach.length >= 1, w + "px " + navName + " " + name + "【新】另有一路 console.error 之记（`[base_map 契]`）", "计 " + a.breach.length);
          ok(a.errs.length === 0, w + "px " + navName + " " + name + "【新】虽告而**不抛错**：pageerror 0（有声不等于崩）",
            a.errs.length ? a.errs.join(" ; ") : "0");
          ok(a.footer.indexOf(LOADFAIL) < 0, w + "px " + navName + " " + name + "【新】页脚未被污（不冒充「加载失败」之误告）",
            "页脚＝「" + a.footer.slice(0, 60) + "…」");
          /* ——【旧】对位：图之处无一字之告，而其坏各依其态 —— */
          ok(b.breachCount === 0 && b.breach.length === 0, w + "px " + navName + " " + name + "【旧】图之处无一字之告（坏而不声，裁九十九所指之病）",
            "页内告 " + b.breachCount + "／console 告 " + b.breach.length);
          const exp = c.oldExpect[nav];
          if (exp === "throws") {
            ok(b.errs.length >= 1 && /appendChild/.test(b.errs.join(" ")),
              w + "px " + navName + " " + name + "【旧】抛未捕获之 TypeError（appendChild of null），页内仍无一告",
              "pageerror " + b.errs.length + (b.errs.length ? "：" + oneLine(b.errs[0]).slice(0, 110) : ""));
          } else if (exp === "swallowed") {
            ok(b.errs.length === 0, w + "px " + navName + " " + name + "【旧】其错被 `boot().catch` 吞：pageerror 0", "pageerror " + b.errs.length);
            ok(b.footer.indexOf(LOADFAIL) >= 0 && b.footer.indexOf("csv_to_json.py") >= 0,
              w + "px " + navName + " " + name + "【旧】★ 其唯一之声在**页脚**，且**张冠李戴**（指数据管线／http，而病在底图）",
              "页脚＝「" + b.footer.slice(0, 110) + "…」");
            ok(b.footer.indexOf("layer-anchors") < 0 && b.footer.indexOf("底图") < 0,
              w + "px " + navName + " " + name + "【旧】★ 那句告内**不提底图、不提所缺之 id**——读者无从知其何故",
              "此即「坏而不声」更坏一层：不只不声，还指错方向");
          } else {
            ok(b.errs.length === 0 && b.footer.indexOf(LOADFAIL) < 0,
              w + "px " + navName + " " + name + "【旧】连错都不抛、页脚亦无一字（全然无声）",
              "pageerror " + b.errs.length + "｜页脚＝「" + b.footer.slice(0, 50) + "…」");
          }
        }
      }
      await new Promise(r => mNew.close(r));
      await new Promise(r => mOld.close(r));
    }
  }

  await br.close();
  await new Promise(r => sNew.close(r));
  await new Promise(r => sOld.close(r));

  head("—— 共 " + checks + " 条，" + (fails ? "✗ 红 " + fails + " 条" : "✓ 全绿"));
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
