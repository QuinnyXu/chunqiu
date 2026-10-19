/* 经纬春秋 · r62-X1 可重跑之验：关系全景「名签两两不相交」
 * （任务书 team/round61_prompts.md §一百二十一 裁二百五十 二；§一百二十二 领队之发 1）
 * ★★ 【r62-X2 改写，2026-10-18】（§一百二十一 裁二百五十 三 6「X1 之『名签两两不相交』之门沿用于力导向之图」；
 *   §一百二十四 裁二百五十一 三；§一百二十七 发 X2）：环退役，关系全景改为力导向图（锚甲）。本门于新图之上重立，
 *   **所断之主判一字之义不改**（诸名签之框两两不相交，DOM 实量，开区间），改者三处，俱照三法书之：
 *   ① §二「错落之形」（断环之顶底一近一远、带外径向距恰 24／15）——其所断之物（环、错落、PANO_STAGGER_COS）已随环退役，
 *      无可同步；**以「定形」代之**（裁二百五十 三2「同数据同图，二跑坐标同（门须断之）」）：同宽二新页、1440／375／375x3
 *      三宽之诸盘心坐标逐位全等。
 *   ② §三 原分甲（顶底二弧，以 text-anchor=middle 定）、乙（涉左右二弧）二类，二类俱入判——新图无弧，分类失其据；
 *      **今诸名签一类两两断之**（＝原甲乙之并，所断之对不少一对）。
 *   ③ §四 反证原为「令 panoStaggerSet 恒返空集＝取消错落」——今以「关名签相斥」代之：页内令 PANO_FORCE.LABEL＝false
 *      （后半程名签矩形相斥与收尾推开俱停）、清布局之存、重绘——须红；不红即 exit 2。
 *      ★ 实量：只主角 49 人之图关之亦 0 交（单靠斥力已不相压，名签相斥于此非承重），反证于此不能红；
 *        故 §三 加「显示全部」之图一断（严于原门：原门只断默认视图），反证施于其上（名签相斥于全库之图承重）；
 *        只主角之图关之之数另印备查。
 *   门自检随改：原对页内 PANO_STAGGER_COS，今对页内 PANO_FORCE.LABEL 为 true（正验之态是名签相斥开着之态）。
 *   以下为 X1 首落与续之原注，照留（其所述之形是环，今已不在）：
 *
 * 〔X1 原注〕
 * 用法（自 tools/qa/ 起跑，playwright 在此处 node_modules 内）：  node vision_r62x1.js
 * 【退出码】 0 ＝ 全过；1 ＝ 有判红；2 ＝ 本门自身出错（浏览器取不到、前提不成、所量之集空、反证未红、页面抛错）。
 *
 * ★ 不写死人数：环上之人数由 DOM 实数，另路与 site/data/people.json 之 is_protagonist=1 对账（默认视图只主角）。
 * ★ 名签之框＝各 `.rel-node text` 之 getBoundingClientRect（DOM 实量，含字体于该宽之实际排印）；
 *   两框之交以开区间判（贴边不算交）。
 *
 * 验（1440×900、375×812 二宽；375 另以 DPR 3 复量一次，近真机）：
 *  §一 前提：路由 #/relations 落全景、只主角（showAll=false）；环上节点数 ＝ is_protagonist=1 之数（另路）＞0。
 *  §二 错落之形：……（r62-X2 已以「定形」代之，见上 ①）
 *  §三 主判：全景诸名签之框两两不相交。所交之对分二类书之——
 *      甲、二人俱在顶底二弧（本笔所治）；乙、涉左右二弧者（本笔不动之区）。二类俱计入判红。（r62-X2：今一类，见上 ②）
 *  §四 反证：页内令 panoStaggerSet 恒返空集（＝取消错落，回改前之形）、重绘——§三 须红，且红在甲类；不红即 exit 2。
 *      （r62-X2：今关名签相斥，见上 ③）
 *  ★ 首落（2026-10-18）实况：甲类 0（1440、375、375x3）；乙类改前即有、本笔未治（韩厥×晋文公等）——已呈「验收偏差上报」候裁。
 *  ★ X1 续（2026-10-18；§一百二十四 裁二百五十一 二 取甲）：错落之带放宽至 |cos θ|＜0.5、远者外推 21。
 *
 * 截图：team/r62X2_shots/x1gate_*（r62-X2 起；X1 之旧图留 team/r62X1_shots/，不覆）。
 */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { requireBrowser } = require("./require_browser.js");
const ROOT = path.resolve(__dirname, "..", "..");
const SITE = process.env.QA_SITE_DIR ? path.resolve(process.env.QA_SITE_DIR) : path.join(ROOT, "site");
const J = (n) => JSON.parse(fs.readFileSync(path.join(SITE, "data", n + ".json"), "utf8"));
const PROTO_N = J("people").filter(p => Number(p.is_protagonist) === 1).length;
const J_PEOPLE_N = J("people").length;

let fails = 0, gateErrs = 0, asserts = 0;
const ok = (c, l, d) => { asserts++; if (!c) fails++; console.log("  " + (c ? "✓" : "✗") + " " + l + (d ? "  —— " + d : "")); };
const selfcheck = (c, l, d) => { if (!c) gateErrs++; console.log("  " + (c ? "✓" : "⚠") + " 〔门自检〕" + l + (d ? "  —— " + d : "")); };

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

/* 量（正验与反证共用）：诸名签之框（屏幕 px）、诸盘心之坐标（viewBox 单位，取 circle 之属性） */
async function measure(pg) {
  return pg.evaluate(() => {
    const svg = document.querySelector("#rel-canvas svg");
    const k = svg.getScreenCTM().a;
    const ls = [...document.querySelectorAll("#rel-canvas .rel-node")].map(g => {
      const t = g.querySelector("text"), c = g.querySelector("circle"), b = t.getBoundingClientRect();
      return { id: g.dataset.node, name: t.textContent, cx: c.getAttribute("cx"), cy: c.getAttribute("cy"),
        x0: b.left, y0: b.top, x1: b.right, y1: b.bottom };
    });
    return { mode: relView.mode, showAll: relView.showAll, k, ls,
      coords: ls.map(l => l.id + ":" + l.cx + "," + l.cy).sort().join(";"),
      label: typeof PANO_FORCE === "object" ? PANO_FORCE.LABEL : null };
  });
}
function judgeOverlap(m) {
  const hits = [], L = m.ls;
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
    const A = L[i], B = L[j];
    if (A.x0 < B.x1 && B.x0 < A.x1 && A.y0 < B.y1 && B.y0 < A.y1) {
      hits.push(A.name + "×" + B.name + "（交 " + ((Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0)) / m.k).toFixed(1) + "×" +
        ((Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0)) / m.k).toFixed(1) + "）");
    }
  }
  return hits;
}

(async () => {
  console.log("vision_r62x1 · 关系全景名签两两不相交（r62-X2 起：力导向图）" + (process.env.QA_SITE_DIR ? "（站根：" + SITE + "）" : ""));
  const { browser, executablePath, browserVersion } = await requireBrowser();
  console.log("  浏览器：" + executablePath + "  " + browserVersion);
  const s = await srv(); const base = "http://127.0.0.1:" + s.address().port + "/";
  const errs = [];
  const shotDir = path.join(ROOT, "team", "r62X2_shots");
  try { fs.mkdirSync(shotDir, { recursive: true }); } catch { /* 无妨 */ }
  const open = async (w, h, dpr) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
    await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", JSON.stringify({ v: 1, step: -1, done: true })); } catch (e) { /* 无妨 */ } });
    const pg = await ctx.newPage(); pg.on("pageerror", e => errs.push(String(e)));
    await pg.goto(base + "#/relations", { waitUntil: "networkidle" });
    await pg.waitForSelector("#rel-canvas .rel-node text", { state: "attached" });
    await pg.waitForTimeout(600);
    return { ctx, pg };
  };
  const coordsAt = {};

  for (const [w, h, dpr] of [[1440, 900, 1], [375, 812, 1], [375, 812, 3]]) {
    const tag = w + (dpr > 1 ? "x" + dpr : "");
    console.log("\n=== " + tag + " ===");
    const { ctx, pg } = await open(w, h, dpr);
    const m = await measure(pg);
    selfcheck(m.mode === "pano" && m.showAll === false, "默认视图为全景、只主角", JSON.stringify({ mode: m.mode, showAll: m.showAll }));
    selfcheck(m.ls.length > 0 && m.ls.length === PROTO_N, "图上 " + m.ls.length + " 人 ＝ is_protagonist=1 之 " + PROTO_N + " 人（另路）");
    selfcheck(m.label === true, "页内 PANO_FORCE.LABEL 为 true（正验之态＝名签相斥开着）", "页内 " + m.label);
    coordsAt[tag] = m.coords;
    /* §二 定形：同宽另开一新页，诸盘心坐标逐位全等 */
    const again = await open(w, h, dpr);
    const m2 = await measure(again.pg);
    await again.ctx.close();
    ok(m.coords === m2.coords && m.ls.length > 0, "§二 定形：同宽二新页，" + m.ls.length + " 盘心坐标逐位全等");
    if (tag !== "1440") ok(m.coords === coordsAt["1440"], "§二 定形：" + tag + " 之诸盘心坐标与 1440 逐位全等（布局不读屏宽）");
    /* §三 主判 */
    const hits = judgeOverlap(m);
    ok(hits.length === 0, "§三 全景诸名签之框两两不相交（" + m.ls.length + " 签，" + (m.ls.length * (m.ls.length - 1) / 2) + " 对）", hits.slice(0, 8).join("；"));
    await (await pg.$("#rel-canvas")).screenshot({ path: path.join(shotDir, "x1gate_after_" + tag + ".png") });

    /* §三 之二：「显示全部」之图（全库）亦断之——r62-X2 新增，严于原门（原门只断默认视图） */
    await pg.evaluate(() => { const c = document.querySelector("#rel-show-all"); c.checked = true; c.dispatchEvent(new Event("change")); });
    await pg.waitForTimeout(800);
    const mAll = await measure(pg);
    selfcheck(mAll.showAll === true && mAll.ls.length === J_PEOPLE_N, "「显示全部」之图 " + mAll.ls.length + " 人 ＝ people.json 全量 " + J_PEOPLE_N + "（另路）");
    const hitsAll = judgeOverlap(mAll);
    ok(hitsAll.length === 0, "§三 之二 「显示全部」诸名签之框两两不相交（" + mAll.ls.length + " 签）", hitsAll.slice(0, 8).join("；"));
    await (await pg.$("#rel-canvas")).screenshot({ path: path.join(shotDir, "x1gate_after_all_" + tag + ".png") });

    /* §四 反证：关名签相斥（后半程矩形相斥与收尾推开俱停），清布局之存、重绘。
     *   ★ 实况（2026-10-18 首跑）：只主角 49 人之图，关之亦 0 交——今之人数下单靠斥力已不相压，名签相斥于此图非承重；
     *     故反证取「显示全部」之图（名签相斥于此承重），只主角之数另印备查、不入判。不红即 exit 2。 */
    await pg.evaluate(() => { PANO_FORCE.LABEL = false; panoView.cache = null; drawRel(); });
    await pg.waitForTimeout(600);
    const ha = judgeOverlap(await measure(pg));
    if (ha.length) console.log("  ✓ 【反证·如期而红】「显示全部」关名签相斥 → §三 之二 红 " + ha.length + " 对：" + ha.slice(0, 6).join("；"));
    else { gateErrs++; console.log("  ⚠ 【反证·★ 不红：门自身出错】关名签相斥而 §三 之二 不红"); }
    await (await pg.$("#rel-canvas")).screenshot({ path: path.join(shotDir, "x1gate_anti_all_" + tag + ".png") });
    await pg.evaluate(() => { const c = document.querySelector("#rel-show-all"); c.checked = false; c.dispatchEvent(new Event("change")); });
    await pg.waitForTimeout(500);
    const hp = judgeOverlap(await measure(pg));
    console.log("    〔备查〕只主角之图关名签相斥：§三 交 " + hp.length + " 对" + (hp.length ? "：" + hp.slice(0, 4).join("；") : "（今之人数下名签相斥非承重）"));
    await pg.evaluate(() => { PANO_FORCE.LABEL = true; panoView.cache = null; });
    await ctx.close();
  }

  await browser.close(); s.close();
  console.log("\n页面抛错：" + errs.length + (errs.length ? "  " + errs.slice(0, 3).join(" | ") : ""));
  if (errs.length) gateErrs++;
  console.log("\n结：断言 " + asserts + "，未过 " + fails + "；门自身出错 " + gateErrs);
  process.exit(gateErrs ? 2 : (fails ? 1 : 0));
})().catch(e => { console.error("门自身出错：", e); process.exit(2); });
