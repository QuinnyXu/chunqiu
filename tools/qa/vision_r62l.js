/* 经纬春秋 · r62-L 可重跑之验：「视野」钮——无可落图之地者，钮书「视野：全图」、不可切
 * （任务书 team/round61_prompts.md「Task for Vision · r62-L」；所据 §六十四 裁二百三十九 三）
 *
 * 用法（自 tools/qa/ 起跑，playwright 在此处 node_modules 内）：  node vision_r62l.js
 * 【退出码】
 *   0 ＝ 全过；
 *   1 ＝ 有判红（某条断言未过）；
 *   2 ＝ 本门自身出错（浏览器取不到、反证不红即判据空转、页面抛错、所需之有地之一级之集为空）。
 *
 * 其病：庄姜、宣姜之页（可落图亲至地 0），图本即全图，旧码之钮仍依 mode 书「视野：活动范围」——钮所言不实。
 * 站之改（site/app.js updateScopeBtn／cmpUpdateScope）：fit 之点为空者，钮书「视野：全图」、disabled、title「无可落图之地，只示全图」；
 *   有点者一切照旧。
 *
 * 期值一律自 site/data/*.json 另路求之（Node 端，不读 app.js）：
 *   · 「可落图亲至地 0 之一级」照 tools/validate.py protagonist_counts 之读法：is_protagonist=1 者，其 presence ∈ {亲至, 空} 之挂链
 *     所系之事其地有 lat、lng 者去重计之，为 0 者入集 Z；
 *   · 单人图之 fit 之点＝其人一切挂链之事（不论 presence）其地有坐标者（app.js 之锚点「related」之口径）——Z 中之人若另有
 *     相关之地可落图，其 fit 非空，钮照旧可切（本门照实断之，并印其名）；
 *   · 交会图之 fit 之点＝二人亲至可落图之地（轨迹）与交会之地——二人俱在 Z 则 fit 空。
 * 验：
 *   §一 Z 中 fit 空者：单人图钮文「视野：全图」、disabled、title 书其由；点之不改视图。Z 为空 → 印「本项无对象」，只跑有地之断。
 *   §二 有地之一级（按 id 序取首个亲至地 ≥1 者）：钮可切，初书「视野：活动范围」、aria-pressed＝true，点一下书「视野：全图」，再点复回。
 *   §三 交会图：Z 中二人之并观——钮「视野：全图」且 disabled；有地之二人之并观——可切、文随 mode 变。Z 不足二人 → 前者印「本项无对象」。
 *   §四 按类反证：于 0 地之页把钮复为旧式（依 mode 书「活动范围」、可切），§一之判须当场红；无 0 地之人则于有地之页令其 fitEmpty 而钮不改，
 *       同判须红。不红即 exit 2。
 *   §五 〔r62-L 续命，裁二百四十一 二1〕图中无落于 (0,0) 之可见元素：0 地之单人图、0 地二人之并观（全图）、有地二人之并观切至全图
 *       （原点入镜）三处，逐一量 svg 内凡可见之图元其 getBBox 落于原点者（x、y ≤ 1，宽高 < 40）——须无。
 *       其物：并观之二播放标记（甲圆 r8、乙方 14×14）建于取景之时、未播即带 hidden，而 SVG 元素不认 HTML 之 hidden，遂现于 (0,0)；
 *       站以样式 `.cmp-marker[hidden], #play-marker[hidden] { display: none }` 承其义。
 *       反证：页内注样式令 `.cmp-marker[hidden]` 复显，同判须当场红；不红即 exit 2。0 地二人之并观若无（Z 不足二人）则印「本项无对象」，
 *       余二处照跑。
 */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { requireBrowser } = require("./require_browser.js");
const ROOT = path.resolve(__dirname, "..", ".."), SITE = path.join(ROOT, "site");
const J = (n) => JSON.parse(fs.readFileSync(path.join(SITE, "data", n + ".json"), "utf8"));

let fails = 0, gateErrs = 0;
const ok = (c, l, d) => { if (!c) fails++; console.log("  " + (c ? "✓" : "✗") + " " + l + (d ? "  —— " + d : "")); };
const selfcheck = (c, l, d) => { if (!c) gateErrs++; console.log("  " + (c ? "✓" : "⚠") + " 〔门自检〕" + l + (d ? "  —— " + d : "")); };

const PPL = J("people"), EP = J("event_people"), EVS = J("events"), PLS = J("places");
const EV = new Map(EVS.map(e => [e.id, e])), PL = new Map(PLS.map(p => [p.id, p]));
const hasCoord = (pl) => pl && pl.lat != null && pl.lng != null && pl.lat !== "" && pl.lng !== "";
const PROTO = PPL.filter(p => Number(p.is_protagonist) === 1).sort((a, b) => a.id.localeCompare(b.id));
const visitPlaces = (pid) => new Set(EP.filter(l => l.person_id === pid && ["亲至", ""].includes(l.presence || ""))
  .map(l => EV.get(l.event_id)).filter(e => e && hasCoord(PL.get(e.place_id))).map(e => e.place_id));
const anyPlaces = (pid) => new Set(EP.filter(l => l.person_id === pid).map(l => EV.get(l.event_id))
  .filter(e => e && hasCoord(PL.get(e.place_id))).map(e => e.place_id));
const Z = PROTO.filter(p => visitPlaces(p.id).size === 0);
const ZE = Z.filter(p => anyPlaces(p.id).size === 0);          // 0 亲至地而 fit 亦空者
const HAS = PROTO.filter(p => visitPlaces(p.id).size >= 1);
const TIP = "无可落图之地，只示全图";

function srv() {
  const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" };
  return new Promise((res, rej) => {
    const s = http.createServer((rq, rs) => {
      let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]); if (u === "/") u = "/index.html";
      const fp = path.join(SITE, u); if (!fp.startsWith(SITE)) { rs.writeHead(403); rs.end(); return; }
      fs.readFile(fp, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(u)] || "application/octet-stream" }); rs.end(d); });
    });
    s.on("error", rej); s.listen(0, "127.0.0.1", () => res(s));
  });
}
/* 钮之量与判（正验与反证共用） */
const readBtn = (pg, sel) => pg.evaluate((sel) => { const b = document.querySelector(sel); const svg = document.querySelector(sel === "#btn-scope" ? "#map-canvas svg" : "#cmp-canvas svg, #view-compare svg");
  return { text: b.textContent, disabled: b.disabled, title: b.getAttribute("title"), pressed: b.getAttribute("aria-pressed"), vb: svg ? svg.getAttribute("viewBox") : null }; }, sel);
/* (0,0) 之可见图元（正验与反证共用） */
const readOrigin = (pg, sel) => pg.evaluate((sel) => {
  const svg = document.querySelector(sel); if (!svg) return { err: "无 svg" };
  const out = [];
  for (const el of svg.querySelectorAll("*")) {
    if (!(el instanceof SVGGraphicsElement) || el.tagName === "g" || el.tagName === "svg") continue;
    let bb; try { bb = el.getBBox(); } catch (e) { continue; }
    let vis = true; for (let n = el; n && n !== svg; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") { vis = false; break; } }
    if (!vis || !(bb.width > 0 || bb.height > 0)) continue;
    if (bb.x <= 1 && bb.y <= 1 && bb.x + bb.width < 40 && bb.y + bb.height < 40) out.push(el.tagName + "." + (el.getAttribute("class") || "") + "@" + [bb.x, bb.y, bb.width, bb.height].map(v => Math.round(v)).join(","));
  }
  return { at: out, vb: svg.getAttribute("viewBox") };
}, sel);
const judgeOrigin = (r) => r.err ? [r.err] : r.at;
function judgeEmpty(b) {
  const e = [];
  if (b.text !== "视野：全图") e.push("钮文「" + b.text + "」应「视野：全图」");
  if (!b.disabled) e.push("钮可切（应 disabled）");
  if (b.title !== TIP) e.push("title「" + b.title + "」应「" + TIP + "」");
  return e;
}

(async () => {
  console.log("经纬春秋 · r62-L 视野钮之验");
  console.log("  可落图亲至地 0 之一级（protagonist_counts 之读法）：" + (Z.map(p => p.name + "〔" + p.id + "〕").join("、") || "无") +
    "；其中 fit 亦空者：" + (ZE.map(p => p.name).join("、") || "无"));
  for (const p of Z.filter(x => !ZE.includes(x))) console.log("  · " + p.name + " 亲至地 0 而另有相关之地可落图，fit 非空——钮照旧可切");
  selfcheck(HAS.length >= 2, "有地之一级至少二人（§二、§三之样本）", HAS.length + " 人");
  if (gateErrs) process.exit(2);
  const H1 = HAS[0], H2 = HAS[1];

  const { browser, executablePath, browserVersion } = await requireBrowser();
  console.log("  浏览器：" + executablePath + "  " + browserVersion);
  const s = await srv(); const base = "http://127.0.0.1:" + s.address().port + "/";
  const errs = [];
  const shotDir = path.join(ROOT, "team", "r62L_shots");
  try { fs.mkdirSync(shotDir, { recursive: true }); } catch { /* 无妨 */ }
  const mk = async (w, h) => { const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", JSON.stringify({ v: 1, step: -1, done: true })); } catch (e) { } });
    const pg = await ctx.newPage(); pg.on("pageerror", e => errs.push(String(e))); return pg; };
  const go = async (pg, h, sel) => { await pg.goto("about:blank"); await pg.goto(base + h, { waitUntil: "networkidle" }); if (sel) await pg.waitForSelector(sel); await pg.waitForTimeout(300); };

  for (const [w, h, tag] of [[1440, 900, "desk"], [375, 812, "mobile"]]) {
    const pg = await mk(w, h);
    console.log("\n=== " + w + "px ===");
    /* §一 */
    console.log("§一 可落图之地 0 者之单人图");
    if (!ZE.length) console.log("  本项无对象（今无亲至地 0 且 fit 空之一级）");
    for (const p of ZE) {
      await go(pg, "#/p/" + p.id + "/map", "#map-canvas svg");
      const b0 = await readBtn(pg, "#btn-scope"), e0 = judgeEmpty(b0);
      ok(!e0.length, w + "px " + p.name + "：钮书「视野：全图」、disabled、title「" + TIP + "」", e0.join("；") || JSON.stringify(b0));
      await pg.click("#btn-scope", { force: true }).catch(() => {});
      const b1 = await readBtn(pg, "#btn-scope");
      ok(b1.text === b0.text && b1.vb === b0.vb && b1.vb === "0 0 1200 700", w + "px " + p.name + "：点之不切——钮文、视图不变，视图为全图", "viewBox " + b1.vb);
    }
    for (const p of Z.filter(x => !ZE.includes(x))) {
      await go(pg, "#/p/" + p.id + "/map", "#map-canvas svg");
      const b = await readBtn(pg, "#btn-scope");
      ok(!b.disabled && b.text === "视野：活动范围", w + "px " + p.name + "（亲至地 0 而 fit 非空）：钮照旧可切", JSON.stringify(b));
    }
    /* §二 */
    console.log("§二 有地之一级（" + H1.name + "）");
    await go(pg, "#/p/" + H1.id + "/map", "#map-canvas svg");
    const a0 = await readBtn(pg, "#btn-scope");
    await pg.click("#btn-scope"); await pg.waitForTimeout(150);
    const a1 = await readBtn(pg, "#btn-scope");
    await pg.click("#btn-scope"); await pg.waitForTimeout(150);
    const a2 = await readBtn(pg, "#btn-scope");
    ok(!a0.disabled && a0.text === "视野：活动范围" && a0.pressed === "true" && a0.title === null &&
       a1.text === "视野：全图" && a1.pressed === "false" && a1.vb === "0 0 1200 700" && a2.text === "视野：活动范围" && a2.vb === a0.vb,
       w + "px " + H1.name + "：钮可切，文随 mode 变（活动范围→全图→活动范围），无 title、视图随之", [a0, a1, a2].map(x => x.text + "/" + x.vb).join(" → "));
    /* §三 */
    console.log("§三 交会图");
    if (ZE.length >= 2) {
      await go(pg, "#compare=" + ZE[0].id + "," + ZE[1].id, "#cmp-scope");
      const c0 = await readBtn(pg, "#cmp-scope"), ce = judgeEmpty(c0);
      ok(!ce.length, w + "px 并观 " + ZE[0].name + "×" + ZE[1].name + "：钮书「视野：全图」、disabled、title 书其由", ce.join("；") || c0.text);
      await pg.screenshot({ path: path.join(shotDir, "r62l_" + tag + "_compare_" + ZE[0].id + "_" + ZE[1].id + ".png"), fullPage: tag === "mobile" });
    } else console.log("  本项无对象（亲至地 0 且 fit 空者不足二人，无「二人俱无地」之并观）");
    await go(pg, "#compare=" + H1.id + "," + H2.id, "#cmp-scope");
    const d0 = await readBtn(pg, "#cmp-scope");
    await pg.click("#cmp-scope"); await pg.waitForTimeout(150);
    const d1 = await readBtn(pg, "#cmp-scope");
    await pg.click("#cmp-scope"); await pg.waitForTimeout(150);
    const d2 = await readBtn(pg, "#cmp-scope");
    ok(!d0.disabled && d0.title === null && d0.text === "视野：活动范围" && d1.text === "视野：全图" && d2.text === "视野：活动范围",
       w + "px 并观 " + H1.name + "×" + H2.name + "：钮可切，文随 mode 变", [d0, d1, d2].map(x => x.text).join(" → "));
    await pg.screenshot({ path: path.join(shotDir, "r62l_" + tag + "_compare_" + H1.id + "_" + H2.id + ".png"), fullPage: tag === "mobile" });
    /* §五 (0,0) 无可见图元 */
    console.log("§五 图中无落于 (0,0) 之可见元素");
    for (const p of ZE) {
      await go(pg, "#/p/" + p.id + "/map", "#map-canvas svg");
      const o = await readOrigin(pg, "#map-canvas svg"), e = judgeOrigin(o);
      ok(!e.length, w + "px " + p.name + " 单人图（全图）：原点无可见图元", e.join("；") || "viewBox " + o.vb);
    }
    if (ZE.length >= 2) {
      await go(pg, "#compare=" + ZE[0].id + "," + ZE[1].id, "#cmp-canvas svg");
      const o = await readOrigin(pg, "#cmp-canvas svg"), e = judgeOrigin(o);
      ok(!e.length, w + "px 并观 " + ZE[0].name + "×" + ZE[1].name + "（全图）：原点无可见图元", e.join("；") || "viewBox " + o.vb);
      await pg.screenshot({ path: path.join(shotDir, "r62l_after_" + tag + "_compare_" + ZE[0].id + "_" + ZE[1].id + ".png"), fullPage: tag === "mobile" });
    } else console.log("  本项无对象（0 地二人之并观）");
    await go(pg, "#compare=" + H1.id + "," + H2.id, "#cmp-scope");
    await pg.click("#cmp-scope"); await pg.waitForTimeout(150);   // 切至全图，原点入镜
    { const o = await readOrigin(pg, "#cmp-canvas svg"), e = judgeOrigin(o);
      ok(!e.length && o.vb === "0 0 1200 700", w + "px 并观 " + H1.name + "×" + H2.name + " 切至全图：原点无可见图元", e.join("；") || "viewBox " + o.vb);
      if (tag === "desk") {   // 按类反证：令 .cmp-marker[hidden] 复显（旧式），同判须红在其因上
        await pg.addStyleTag({ content: ".cmp-marker[hidden] { display: inline !important; }" });
        const r = judgeOrigin(await readOrigin(pg, "#cmp-canvas svg"));
        selfcheck(r.some(x => /cmp-marker/.test(x)), "〔反证〕令 .cmp-marker[hidden] 复显 → 原点之判当场红，红在播放标记", r.join("；") || "★ 不红");
      } }
    /* §四 按类反证（只于桌面跑一回） */
    if (tag === "desk") {
      console.log("§四 按类反证");
      const victim = ZE[0];
      if (victim) await go(pg, "#/p/" + victim.id + "/map", "#map-canvas svg");
      else await go(pg, "#/p/" + H1.id + "/map", "#map-canvas svg");
      await pg.evaluate((hasVictim) => {   // 钮复为旧式：只依 mode 书其文、可切、无 title；无 0 地之人则令其 fitEmpty 而钮仍走旧式
        if (!hasVictim) mapState.fitEmpty = true;
        const b = document.querySelector("#btn-scope");
        b.disabled = false; b.removeAttribute("title");
        b.textContent = mapState.mode === "fit" ? "视野：活动范围" : "视野：全图";
      }, !!victim);
      const r = judgeEmpty(await readBtn(pg, "#btn-scope"));
      selfcheck(r.length > 0, "〔反证〕" + (victim ? victim.name + " 之页" : "有地之页令其 fitEmpty") + " 钮复为旧式（「视野：活动范围」、可切）→ §一之判当场红", r[0] || "★ 不红");
    }
    for (const p of ["P_ZHUANGJIANG", "P_XUANJIANG", "P_GUANZHONG", "P_KONGZI"].filter(id => PPL.some(x => x.id === id))) {
      await go(pg, "#/p/" + p + "/map", "#map-canvas svg");
      await pg.screenshot({ path: path.join(shotDir, "r62l_" + tag + "_" + p + "_map.png"), fullPage: tag === "mobile" });
    }
    await pg.context().close();
  }
  selfcheck(errs.length === 0, "页面无抛错", errs.slice(0, 3).join(" | "));
  await browser.close(); s.close();
  console.log("\n判红 " + fails + "；门自检出错 " + gateErrs);
  process.exit(gateErrs ? 2 : fails ? 1 : 0);
})().catch(e => { console.error("门自身出错：", e); process.exit(2); });
