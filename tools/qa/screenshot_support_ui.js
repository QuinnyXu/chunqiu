#!/usr/bin/env node
/*
 * 经纬春秋 · QA 截图脚本——「支持本站」打赏入口与收款码弹层（r18，Xu 裁定支付宝单通道）。
 * 出图对象：
 *   support-footer-desktop.png  首页底部分享行「支持本站」主入口（桌面，突出一档）
 *   support-dialog-desktop.png  点击后桌面居中收款码弹层（收款码＋配句「感恩支持，庭燎之光，以待君子」）
 *   support-drawer-mobile.png   手机点击后底部抽屉（复用 openDrawer）
 *   support-about-secondary.png 关于页安静一行次级入口
 *
 * 定位同 screenshot_playback_ui.js：QA 专用开发依赖，不属站点运行时（红线6 不受影响），
 * 依赖与产物限定在 tools/qa/ 内。用法：cd tools/qa && node screenshot_support_ui.js
 */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const SITE_DIR = path.resolve(__dirname, "..", "..", "site");
const OUT_DIR = path.resolve(__dirname, "screenshots");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json" };

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
  let playwright;
  try { playwright = require("playwright"); }
  catch (e) { console.error("找不到 playwright——请先在 tools/qa/ 下执行 `npm install`。\n" + e.message); process.exitCode = 1; return; }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const baseURL = process.env.QA_BASE_URL || null;
  let server = null, origin = baseURL;
  if (!origin) { server = await startStaticServer(SITE_DIR); origin = `http://127.0.0.1:${server.address().port}`;
    console.log(`本地静态服务器已起：${origin}`); }
  else console.log(`使用外部 QA_BASE_URL：${origin}`);

  const browser = await playwright.chromium.launch();
  // 预置首访引导已看过（chunqiu_tour_v1），免其蒙层拦截首页/关于页的点击
  const newCtx = async (opts) => {
    const ctx = await browser.newContext(opts);
    await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) {} });
    return ctx;
  };
  const results = [];
  const shot = async (name, label, fn) => {
    let status = "OK";
    try { await fn(name); console.log(`[${label}] 截图完成：${path.join(OUT_DIR, name + ".png")}`); }
    catch (err) { status = "FAIL: " + err.message; console.error(`[${label}] 失败：${err.message}`); }
    results.push({ name, label, status });
  };
  try {
    // 1. 桌面·首页底部主入口
    await shot("support-footer-desktop", "首页底部主入口·桌面", async (name) => {
      const ctx = await newCtx({ viewport: { width: 1280, height: 860 } });
      const page = await ctx.newPage();
      await page.goto(`${origin}/#/`, { waitUntil: "load" });
      const btn = await page.waitForSelector("#btn-support", { state: "visible", timeout: 15000 });
      const box = await btn.boundingBox();
      console.log(`  #btn-support 位置=(${Math.round(box.x)},${Math.round(box.y)}) 尺寸=${Math.round(box.width)}x${Math.round(box.height)}`);
      await btn.scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(OUT_DIR, name + ".png") });
      await ctx.close();
    });
    // 2. 桌面·收款码居中弹层
    await shot("support-dialog-desktop", "收款码弹层·桌面居中", async (name) => {
      const ctx = await newCtx({ viewport: { width: 1280, height: 860 } });
      const page = await ctx.newPage();
      await page.goto(`${origin}/#/`, { waitUntil: "load" });
      await page.waitForSelector("#btn-support", { state: "visible", timeout: 15000 });
      await page.click("#btn-support");
      await page.waitForSelector("#support-overlay:not([hidden])", { timeout: 8000 });
      await page.waitForSelector(".support-qr", { state: "visible", timeout: 8000 });
      const phrase = await page.textContent(".support-blessing");
      console.log(`  配句读到：「${phrase}」`);
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(OUT_DIR, name + ".png") });
      await ctx.close();
    });
    // 3. 手机·底部抽屉
    await shot("support-drawer-mobile", "收款码底部抽屉·手机", async (name) => {
      const ctx = await newCtx({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      const page = await ctx.newPage();
      await page.goto(`${origin}/#/`, { waitUntil: "load" });
      await page.waitForSelector("#btn-support", { state: "visible", timeout: 15000 });
      await page.click("#btn-support");
      await page.waitForSelector("#place-drawer.open", { timeout: 8000 });
      await page.waitForSelector("#place-drawer .support-qr", { state: "visible", timeout: 8000 });
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(OUT_DIR, name + ".png") });
      await ctx.close();
    });
    // 4. 关于页次级入口
    await shot("support-about-secondary", "关于页次级入口", async (name) => {
      const ctx = await newCtx({ viewport: { width: 1280, height: 860 } });
      const page = await ctx.newPage();
      await page.goto(`${origin}/#/about`, { waitUntil: "load" });
      const link = await page.waitForSelector("#support-link", { state: "visible", timeout: 15000 });
      await link.scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      await page.screenshot({ path: path.join(OUT_DIR, name + ".png") });
      await ctx.close();
    });
  } finally {
    await browser.close();
    if (server) server.close();
  }

  console.log("\n==== 汇总 ====");
  for (const r of results) console.log(`${r.status === "OK" ? "✓" : "✗"} ${r.label}（${r.name}）— ${r.status}`);
  if (results.some(r => r.status !== "OK")) process.exitCode = 1;
}
main().catch(err => { console.error("脚本异常终止：", err); process.exitCode = 1; });
