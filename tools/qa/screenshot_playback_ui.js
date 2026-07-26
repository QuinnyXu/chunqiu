#!/usr/bin/env node
/*
 * 经纬春秋 · QA 截图脚本——四组合：单人/并观 × 桌面/手机，各进入地图全屏态截一张。
 * 重点验收对象：全屏浮层左下角 #overlay-controls / #ov-play（r17-r18 播放引擎合一后的
 * 统一播放/暂停控件），jsdom 只能证明其逻辑存在，证明不了真机可见/可点/不被遮挡——
 * 这正是本脚本要补的那块盲区（见 docs/delivery_vision_r18.md 勘误、docs/conventions.md §9.3）。
 *
 * 定位：QA 专用开发依赖，不属于站点运行时（红线6 不受影响）。依赖（playwright）与配置
 * 严格限定在 tools/qa/ 目录内，不污染站点根，不被任何站点产物引用。
 *
 * 用法：
 *   cd tools/qa
 *   npm install            # 首次，装 playwright（devDependency）
 *   npm run install-browser  # 首次，装 chromium 二进制（playwright install chromium）
 *   npm run shots           # 或 node screenshot_playback_ui.js
 *
 * 输出：tools/qa/screenshots/ 下 4 张 PNG（该目录内容已 .gitignore，属易变 QA 产物、不入库）：
 *   single-desktop.png  单人 · 桌面视口 · 地图全屏
 *   single-mobile.png   单人 · 手机视口 · 地图全屏
 *   dual-desktop.png    并观 · 桌面视口 · 地图全屏
 *   dual-mobile.png     并观 · 手机视口 · 地图全屏
 *
 * 环境变量：
 *   QA_BASE_URL   若已设置，跳过本地静态服务器，直接对该 URL 跑（如生产地址，
 *                 便于真机部署后复测）；不设置则脚本自起一个本地静态服务器指向 site/。
 */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const SITE_DIR = path.resolve(__dirname, "..", "..", "site");
const OUT_DIR = path.resolve(__dirname, "screenshots");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

/* 零依赖静态文件服务器，只服务 site/ 目录内容——避免 file:// 协议下 fetch()
 * 因 CORS 被拦（app.js 用 fetch 加载 site/data/*.json，file:// 下多数浏览器会拒绝）。 */
function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
      if (urlPath === "/") urlPath = "/index.html";
      const filePath = path.join(rootDir, urlPath);
      if (!filePath.startsWith(rootDir)) { res.writeHead(403); res.end(); return; }
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end("404"); return; }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        res.end(data);
      });
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

/* 四组合：并观取 P_WENJIANG × P_QIXIANG（binguan fixtures 同一对，5 处交会点，有播放轨迹可播）。 */
const COMBOS = [
  {
    name: "single-desktop",
    label: "单人 · 桌面",
    hash: "#/p/P_WENJIANG/map",
    zoomBtn: "#btn-zoom",
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "single-mobile",
    label: "单人 · 手机",
    hash: "#/p/P_WENJIANG/map",
    zoomBtn: "#btn-zoom",
    viewport: { width: 390, height: 844 }, // iPhone 12/13 视口
    isMobile: true,
  },
  {
    name: "dual-desktop",
    label: "并观 · 桌面",
    hash: "#compare=P_WENJIANG,P_QIXIANG",
    zoomBtn: "#cmp-zoom",
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "dual-mobile",
    label: "并观 · 手机",
    hash: "#compare=P_WENJIANG,P_QIXIANG",
    zoomBtn: "#cmp-zoom",
    viewport: { width: 390, height: 844 },
    isMobile: true,
  },
];

async function main() {
  let playwright;
  try {
    playwright = require("playwright");
  } catch (e) {
    console.error("找不到 playwright——请先在 tools/qa/ 下执行 `npm install`。");
    console.error("原始错误：" + e.message);
    process.exitCode = 1;
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const baseURL = process.env.QA_BASE_URL || null;
  let server = null;
  let origin = baseURL;
  if (!origin) {
    server = await startStaticServer(SITE_DIR);
    const addr = server.address();
    origin = `http://127.0.0.1:${addr.port}`;
    console.log(`本地静态服务器已起：${origin}（服务 ${SITE_DIR}）`);
  } else {
    console.log(`使用外部 QA_BASE_URL：${origin}`);
  }

  const browser = await playwright.chromium.launch();
  const results = [];
  try {
    for (const combo of COMBOS) {
      const context = await browser.newContext({
        viewport: combo.viewport,
        isMobile: !!combo.isMobile,
        hasTouch: !!combo.isMobile,
      });
      const page = await context.newPage();
      const outFile = path.join(OUT_DIR, `${combo.name}.png`);
      let status = "OK";
      try {
        await page.goto(`${origin}/${combo.hash}`, { waitUntil: "load" });
        // 等应用完成数据加载与首次渲染（地图/并观按钮出现即视为就绪）。
        await page.waitForSelector(combo.zoomBtn, { state: "visible", timeout: 15000 });
        await page.click(combo.zoomBtn);
        // 全屏浮层与播放悬浮控件出现
        await page.waitForSelector("#map-overlay:not([hidden])", { timeout: 10000 });
        const ovPlay = await page.waitForSelector("#ov-play", { state: "visible", timeout: 10000 });
        const box = await ovPlay.boundingBox();
        await page.screenshot({ path: outFile });
        console.log(
          `[${combo.label}] 截图完成：${outFile}` +
          (box ? `　#ov-play 位置=(${Math.round(box.x)},${Math.round(box.y)}) 尺寸=${Math.round(box.width)}x${Math.round(box.height)}` : "　⚠ 未取得 #ov-play 位置")
        );
      } catch (err) {
        status = "FAIL: " + err.message;
        console.error(`[${combo.label}] 截图失败：${err.message}`);
      } finally {
        results.push({ ...combo, status, outFile });
        await context.close();
      }
    }
  } finally {
    await browser.close();
    if (server) server.close();
  }

  console.log("\n==== 汇总 ====");
  for (const r of results) {
    console.log(`${r.status === "OK" ? "✓" : "✗"} ${r.label}（${r.name}）— ${r.status}`);
  }
  const failed = results.filter(r => r.status !== "OK");
  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error("脚本异常终止：", err);
  process.exitCode = 1;
});
