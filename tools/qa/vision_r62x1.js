/* 经纬春秋 · r62-X1 可重跑之验：关系全景「名签两两不相交」
 * （任务书 team/round61_prompts.md §一百二十一 裁二百五十 二；§一百二十二 领队之发 1）
 *
 * 用法（自 tools/qa/ 起跑，playwright 在此处 node_modules 内）：  node vision_r62x1.js
 * 【退出码】 0 ＝ 全过；1 ＝ 有判红；2 ＝ 本门自身出错（浏览器取不到、前提不成、所量之集空、反证未红、页面抛错）。
 *
 * ★ 不写死人数：环上之人数由 DOM 实数，另路与 site/data/people.json 之 is_protagonist=1 对账（默认视图只主角）。
 * ★ 名签之框＝各 `.rel-node text` 之 getBoundingClientRect（DOM 实量，含字体于该宽之实际排印）；
 *   两框之交以开区间判（贴边不算交）。
 *
 * 验（1440×900、375×812 二宽；375 另以 DPR 3 复量一次，近真机）：
 *  §一 前提：路由 #/relations 落全景、只主角（showAll=false）；环上节点数 ＝ is_protagonist=1 之数（另路）＞0。
 *  §二 错落之形：顶、底二弧（text-anchor=middle 者）按角度连排，相邻者之名签径向距其节点一近一远、
 *      相差 ≥ 一框之高的 0.9 倍（「约一行之高」）；左右二弧（start／end）之径向距一律同近（不动）。
 *  §三 主判：全景诸名签之框两两不相交。所交之对分二类书之——
 *      甲、二人俱在顶底二弧（本笔所治）；乙、涉左右二弧者（本笔不动之区）。二类俱计入判红。
 *  §四 反证：页内令 panoStaggerSet 恒返空集（＝取消错落，回改前之形）、重绘——§三 须红，且红在甲类；不红即 exit 2。
 *  ★ 首落（2026-10-18）实况：甲类 0（1440、375、375x3）；**乙类改前即有、本笔未治**——1440：韩厥×晋文公；
 *    375：另加 管仲×齐桓公、郤克×赵盾、夫差×阖庐、阖庐×伍员（俱在 0.25＜|cos θ|＜0.5 之过渡带，相邻二名同侧对齐、
 *    纵距 slot·|cos θ| 小于框高）。任务书定「左右二弧不动」而门定「诸名签两两不相交」，二者于此相抵——
 *    已呈「验收偏差上报」候裁；本门照门之本文计乙类入判红，**不为求绿而缩其量**。
 *  截图：team/r62X1_shots/（after_*＝本笔；anti_*＝反证态＝取消错落；before_* 由改前之码另跑，见 _SOURCE.txt）。
 */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { requireBrowser } = require("./require_browser.js");
const ROOT = path.resolve(__dirname, "..", "..");
const SITE = process.env.QA_SITE_DIR ? path.resolve(process.env.QA_SITE_DIR) : path.join(ROOT, "site");
const SHOT_PREFIX = process.env.QA_SHOT_PREFIX || "";       // 改前之码另跑时书 before_
const J = (n) => JSON.parse(fs.readFileSync(path.join(SITE, "data", n + ".json"), "utf8"));
const PROTO_N = J("people").filter(p => Number(p.is_protagonist) === 1).length;

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

/* 量（正验与反证共用）：诸名签之框、其锚、其节点心、其径向距；单位一律换回 viewBox（除以缩放），便于跨宽比较 */
async function measure(pg) {
  return pg.evaluate(() => {
    const svg = document.querySelector("#rel-canvas svg");
    const sb = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, k = sb.width / vb.width;
    const ls = [...document.querySelectorAll("#rel-canvas .rel-node")].map(g => {
      const t = g.querySelector("text"), c = g.querySelector("circle"), b = t.getBoundingClientRect();
      const cx = +c.getAttribute("cx"), cy = +c.getAttribute("cy");
      const tx = +t.getAttribute("x"), ty = +t.getAttribute("y");
      return { id: g.dataset.node, name: t.textContent, anchor: t.getAttribute("text-anchor"),
        ang: Math.atan2(cy - 330, cx - 500), radial: Math.hypot(tx - cx, ty - 4 - cy),
        x0: b.left, y0: b.top, x1: b.right, y1: b.bottom, h: b.height / k };
    });
    return { mode: relView.mode, showAll: relView.showAll, k, ls };
  });
}
function judgeOverlap(m) {
  const hits = [];
  const L = m.ls;
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
    const A = L[i], B = L[j];
    if (A.x0 < B.x1 && B.x0 < A.x1 && A.y0 < B.y1 && B.y0 < A.y1) {
      const cls = (A.anchor === "middle" && B.anchor === "middle") ? "甲" : "乙";
      hits.push({ cls, s: A.name + "×" + B.name + "（交 " + ((Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0)) / m.k).toFixed(1) + "×" +
        ((Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0)) / m.k).toFixed(1) + "）" });
    }
  }
  return hits;
}
function judgeStagger(m) {
  const errs = [], hMax = Math.max(...m.ls.map(l => l.h));
  for (const top of [true, false]) {
    const arc = m.ls.filter(l => l.anchor === "middle" && (Math.sin(l.ang) < 0) === top)
      .map(l => ({ l, a: top && l.ang > Math.PI / 2 ? l.ang - 2 * Math.PI : l.ang })).sort((u, v) => u.a - v.a);
    for (let i = 1; i < arc.length; i++) {
      const d = Math.abs(arc[i].l.radial - arc[i - 1].l.radial);
      if (d < 0.9 * hMax) errs.push((top ? "顶" : "底") + "弧 " + arc[i - 1].l.name + "／" + arc[i].l.name + " 径向差 " + d.toFixed(1) + " ＜ 0.9×框高 " + hMax.toFixed(1));
    }
  }
  const side = m.ls.filter(l => l.anchor !== "middle");
  /* 左右二弧：主角 24、配角 15，此外无他值（不动） */
  const odd = side.filter(l => Math.abs(l.radial - 24) > 0.05 && Math.abs(l.radial - 15) > 0.05);
  if (odd.length) errs.push("左右二弧名签径向距有异：" + odd.map(l => l.name + " " + l.radial.toFixed(1)).join("、"));
  return { errs };
}

(async () => {
  console.log("vision_r62x1 · 关系全景名签两两不相交" + (process.env.QA_SITE_DIR ? "（站根：" + SITE + "）" : ""));
  const { browser, executablePath, browserVersion } = await requireBrowser();
  console.log("  浏览器：" + executablePath + "  " + browserVersion);
  const s = await srv(); const base = "http://127.0.0.1:" + s.address().port + "/";
  const errs = [];
  const shotDir = path.join(ROOT, "team", "r62X1_shots");
  try { fs.mkdirSync(shotDir, { recursive: true }); } catch { /* 无妨 */ }
  /* 环顶、环底之截：viewBox y∈[0,150]、[530,680]，x∈[150,850] */
  const clipShots = async (pg, tag) => {
    const r = await pg.evaluate(() => { const b = document.querySelector("#rel-canvas svg").getBoundingClientRect(); return { x: b.left + window.scrollX, y: b.top + window.scrollY, w: b.width }; });
    const k = r.w / 1000;
    await pg.screenshot({ path: path.join(shotDir, tag + "_top.png"), fullPage: true, clip: { x: r.x + 150 * k, y: r.y, width: 700 * k, height: 150 * k } });
    await pg.screenshot({ path: path.join(shotDir, tag + "_bottom.png"), fullPage: true, clip: { x: r.x + 150 * k, y: r.y + 530 * k, width: 700 * k, height: 150 * k } });
    await pg.screenshot({ path: path.join(shotDir, tag + "_ring.png"), fullPage: true, clip: { x: r.x, y: r.y, width: r.w, height: 680 * k } });
  };

  for (const [w, h, dpr] of [[1440, 900, 1], [375, 812, 1], [375, 812, 3]]) {
    const tag = w + (dpr > 1 ? "x" + dpr : "");
    console.log("\n=== " + tag + " ===");
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
    await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", JSON.stringify({ v: 1, step: -1, done: true })); } catch (e) { /* 无妨 */ } });
    const pg = await ctx.newPage(); pg.on("pageerror", e => errs.push(String(e)));
    await pg.goto(base + "#/relations", { waitUntil: "networkidle" });
    await pg.waitForSelector("#rel-canvas .rel-node text", { state: "attached" });
    await pg.waitForTimeout(600);

    const m = await measure(pg);
    selfcheck(m.mode === "pano" && m.showAll === false, "默认视图为全景、只主角", JSON.stringify({ mode: m.mode, showAll: m.showAll }));
    selfcheck(m.ls.length > 0 && m.ls.length === PROTO_N, "环上 " + m.ls.length + " 人 ＝ is_protagonist=1 之 " + PROTO_N + " 人（另路）");
    const mids = m.ls.filter(l => l.anchor === "middle").length;
    selfcheck(mids >= 2, "顶底二弧有名签可量（" + mids + "）");
    if (!SHOT_PREFIX) {
      const st = judgeStagger(m);
      ok(st.errs.length === 0, "§二 错落之形：顶底二弧相邻一近一远、左右二弧不动", st.errs.slice(0, 4).join("；"));
    }
    const hits = judgeOverlap(m);
    const ja = hits.filter(x => x.cls === "甲"), yi = hits.filter(x => x.cls === "乙");
    ok(ja.length === 0, "§三 甲 顶底二弧名签两两不相交（" + m.ls.length + " 签）", ja.map(x => x.s).join("；"));
    ok(yi.length === 0, "§三 乙 涉左右二弧之名签两两不相交", yi.map(x => x.s).join("；"));
    await clipShots(pg, (SHOT_PREFIX || "after_") + tag);

    if (!SHOT_PREFIX) {
      await pg.evaluate(() => { panoStaggerSet = () => new Set(); drawRel(); });   // eslint-disable-line no-global-assign
      await pg.waitForTimeout(500);
      const ma = await measure(pg);
      const ha = judgeOverlap(ma).filter(x => x.cls === "甲");
      if (ha.length) console.log("  ✓ 【反证·如期而红】取消错落 → §三 甲 红：" + ha.map(x => x.s).join("；"));
      else { gateErrs++; console.log("  ⚠ 【反证·★ 不红：门自身出错】取消错落而 §三 甲 不红"); }
      await clipShots(pg, "anti_" + tag);
    }
    await ctx.close();
  }

  await browser.close(); s.close();
  console.log("\n页面抛错：" + errs.length + (errs.length ? "  " + errs.slice(0, 3).join(" | ") : ""));
  if (errs.length) gateErrs++;
  console.log("\n结：断言 " + asserts + "，未过 " + fails + "；门自身出错 " + gateErrs);
  process.exit(gateErrs ? 2 : (fails ? 1 : 0));
})().catch(e => { console.error("门自身出错：", e); process.exit(2); });
