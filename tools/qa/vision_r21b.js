"use strict";
// r21 补测：夏姬 2 站轨迹的播放实跑、并观回归、资料库新来源、宋襄公×楚成王并观
const http = require("http"), fs = require("fs"), path = require("path");
const SITE_DIR = path.resolve(__dirname, "..", "..", "site");
const OUT = path.resolve(__dirname, "screenshots");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
function srv(root) { return new Promise((res, rej) => { const s = http.createServer((rq, rs) => { let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]); if (u === "/") u = "/index.html"; const fp = path.join(root, u); if (!fp.startsWith(root)) { rs.writeHead(403); rs.end(); return; } fs.readFile(fp, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(fp).toLowerCase()] || "application/octet-stream" }); rs.end(d); }); }); s.on("error", rej); s.listen(0, "127.0.0.1", () => res(s)); }); }
(async () => {
  const pw = require("playwright");
  const s = await srv(SITE_DIR); const origin = `http://127.0.0.1:${s.address().port}`;
  const b = await pw.chromium.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  await c.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) { } });
  const p = await c.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message));

  // 1) 夏姬地图播放实跑（2 站是最小可播，须真的动起来并能收）
  await p.goto(origin + "/#/p/P_XIAJI/map", { waitUntil: "load" }); await p.waitForTimeout(700);
  const snap = () => p.evaluate(() => {
    const m = document.querySelector("#map-canvas .play-marker, #map-canvas circle.marker, #map-canvas .pm");
    const cap = document.querySelector("#play-caption");
    return { btn: (document.querySelector("#btn-play") || {}).textContent, marker: m ? m.getAttribute("cx") + "," + m.getAttribute("cy") : null, caption: cap && !cap.hidden ? cap.textContent : null };
  });
  const s0 = await snap();
  await p.click("#btn-play"); await p.waitForTimeout(1300);
  const s1 = await snap();
  await p.waitForTimeout(1800);
  const s2 = await snap();
  await p.screenshot({ path: path.join(OUT, "r21_xiaji_playing.png") });
  await p.click("#btn-play"); await p.waitForTimeout(300);
  const s3 = await snap();

  // 2) 并观：夏姬×楚庄王、宋襄公×楚成王
  const cmps = {};
  for (const [pair, tag] of [["P_XIAJI,P_CHUZHUANG", "xiaji_chuzhuang"], ["P_SONGXIANG,P_CHUCHENG", "songxiang_chucheng"]]) {
    await p.goto(origin + "/#compare=" + pair, { waitUntil: "load" }); await p.waitForTimeout(1100);
    cmps[pair] = await p.evaluate(() => ({
      title: (document.querySelector("#cmp-title") || {}).textContent || "",
      legendA: (document.querySelector("#cmp-legend-a") || {}).textContent,
      legendB: (document.querySelector("#cmp-legend-b") || {}).textContent,
      playHidden: document.querySelector("#cmp-play").hidden,
      degrade: !document.querySelector("#cmp-play-degrade").hidden,
      hasSvg: !!document.querySelector("#view-compare svg"),
      meetText: ([...document.querySelectorAll("#view-compare *")].map(e => e.childNodes.length === 1 && e.textContent || "").find(t => t && t.includes("交会")) || "").trim().slice(0, 60),
    }));
    await p.screenshot({ path: path.join(OUT, "r21_compare_" + tag + ".png") });
  }

  // 3) 资料库：新来源是否可检（P011 株林、Z074-Z078、S010）
  await p.goto(origin + "/#/library/sources", { waitUntil: "load" }); await p.waitForTimeout(800);
  const lib = await p.evaluate(() => {
    const t = document.body.textContent.replace(/\s+/g, " ");
    return {
      hasZhulin: t.includes("株林"), hasChenQi: t.includes("陈杞世家"),
      hasZhaogong28: t.includes("昭公二十八年"), hasChenggong2: t.includes("成公二年"),
      rows: document.querySelectorAll("#library-body tr, .lib-row, .src-item").length,
    };
  });
  await p.screenshot({ path: path.join(OUT, "r21_library_sources.png") });

  // 4) 关于页凡例措辞复核
  await p.goto(origin + "/#/about", { waitUntil: "load" }); await p.waitForTimeout(600);
  const about = await p.evaluate(() => {
    const t = document.body.textContent.replace(/\s+/g, " ");
    return {
      bad_benrenbuzai: t.includes("本人不在场"), bad_weidao: t.includes("本人未到"),
      good_wumingwen: t.includes("史文无其在场明文") || t.includes("史文无其在场"),
      good_fencun: t.includes("不是「史文说他不在」") || t.includes("不是\"史文说他不在\""),
    };
  });

  console.log("\n===== r21 补测 =====");
  console.log("[播放] 初=", JSON.stringify(s0), "\n       1.3s=", JSON.stringify(s1), "\n       3.1s=", JSON.stringify(s2), "\n       暂停后=", JSON.stringify(s3));
  console.log("[并观]", JSON.stringify(cmps, null, 1));
  console.log("[资料库]", JSON.stringify(lib));
  console.log("[关于页措辞]", JSON.stringify(about));
  console.log("页面错误：", errs.length ? errs.join(" | ") : "无");
  await b.close(); s.close();
})().catch(e => { console.error(e); process.exit(1); });
