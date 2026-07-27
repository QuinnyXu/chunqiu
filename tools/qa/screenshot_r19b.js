#!/usr/bin/env node
/* r19b 视觉自查：卫分区、五徽记、降级提示、ego 图、诗经徽标、关系全景。
 * 用法：node tools/qa/screenshot_r19b.js （自起本地静态服务器指向 site/）。
 * 输出：tools/qa/screenshots/r19b-*.png（.gitignore，不入库）。 */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const SITE_DIR = path.resolve(__dirname, "..", "..", "site");
const OUT_DIR = path.resolve(__dirname, "screenshots");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
      if (urlPath === "/") urlPath = "/index.html";
      const filePath = path.join(rootDir, urlPath);
      if (!filePath.startsWith(rootDir)) { res.writeHead(403); res.end(); return; }
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end("404"); return; }
        res.writeHead(200, { "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
        res.end(data);
      });
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}
async function main() {
  const playwright = require("playwright");
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const server = await startStaticServer(SITE_DIR);
  const origin = `http://127.0.0.1:${server.address().port}`;
  console.log("服务器：" + origin);
  const browser = await playwright.chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await ctx.newPage();
  page.on("pageerror", e => console.log("!! pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error" || m.type() === "warning") console.log("  [" + m.type() + "] " + m.text()); });

  // 徽记画廊：直接嵌入五枚新徽记，各着其国色
  const badges = [
    ["badge_zhuangjiang", "庄姜", "#3A6693"], ["badge_xuanjiang", "宣姜", "#2A4A70"],
    ["badge_xigui", "息妫", "#9E5B7C"], ["badge_liji", "骊姬", "#9B4E38"],
    ["badge_muji", "穆姬", "#6E6560"],
  ];
  let gal = "<div style='background:#F4EDDF;padding:30px;display:flex;gap:26px;font-family:serif'>";
  for (const [f, n, c] of badges) {
    const svg = fs.readFileSync(path.join(SITE_DIR, "assets/icons", f + ".svg"), "utf-8");
    gal += `<figure style='text-align:center;margin:0;color:${c}'><div style='width:72px;height:72px'>${svg}</div><figcaption style='color:${c};font-size:18px;margin-top:8px'>${n}</figcaption></figure>`;
  }
  gal += "</div>";
  await page.setContent(gal);
  await page.screenshot({ path: path.join(OUT_DIR, "r19b-badges.png") });
  console.log("✓ r19b-badges.png");

  const shots = [
    ["r19b-home-map", "#/", "#home-map svg"],
    ["r19b-zhuangjiang-map", "#/p/P_ZHUANGJIANG/map", "#btn-play, #play-degrade"],
    ["r19b-muji-map", "#/p/P_MUJI/map", "#play-degrade"],
    ["r19b-chucheng-map", "#/p/P_CHUCHENG/map", "#btn-play"],
    ["r19b-xigui-ego", "#/p/P_XIGUI/relations", "#rel-canvas svg"],
    ["r19b-xuanjiang-ego", "#/p/P_XUANJIANG/relations", "#rel-canvas svg"],
    ["r19b-zhuangjiang-timeline", "#/p/P_ZHUANGJIANG/timeline", "#view-timeline"],
    ["r19b-pano", "#/relations", "#rel-canvas svg"],
  ];
  for (const [name, hash, sel] of shots) {
    try {
      await page.goto(origin + "/" + hash, { waitUntil: "load" });
      await page.waitForSelector(sel.split(",")[0].trim(), { state: "visible", timeout: 12000 });
      await page.waitForTimeout(700);
      await page.screenshot({ path: path.join(OUT_DIR, name + ".png"), fullPage: false });
      console.log("✓ " + name + ".png");
    } catch (e) { console.log("✗ " + name + " : " + e.message); }
  }

  // 打印几处关键状态供核验
  await page.goto(origin + "/#/p/P_ZHUANGJIANG/map", { waitUntil: "load" });
  await page.waitForTimeout(900);
  const st1 = await page.evaluate(() => ({
    playHidden: document.querySelector("#btn-play").hidden,
    degradeHidden: document.querySelector("#play-degrade").hidden,
    degradeText: document.querySelector("#play-degrade").textContent,
    status: document.querySelector("#map-status").textContent,
  }));
  console.log("庄姜地图:", JSON.stringify(st1));
  await page.goto(origin + "/#/p/P_CHUCHENG/map", { waitUntil: "load" });
  await page.waitForTimeout(900);
  const st2 = await page.evaluate(() => ({
    playHidden: document.querySelector("#btn-play").hidden,
    playDisabled: document.querySelector("#btn-play").disabled,
    status: document.querySelector("#map-status").textContent,
  }));
  console.log("楚成王地图:", JSON.stringify(st2));

  await browser.close();
  server.close();
}
main().catch(e => { console.error(e); process.exit(1); });
