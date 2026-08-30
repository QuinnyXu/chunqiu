// r43 生产带参复验·渲染层：Playwright 实测生产站真实 DOM
const { chromium } = require("playwright");

const BASE = "https://chunqiu.timechorus.com/";
const V = Date.now();

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let pass = 0, fail = 0;
  const assert = (name, cond, detail) => {
    if (cond) { pass++; console.log("PASS", name, detail || ""); }
    else { fail++; console.log("FAIL", name, detail || ""); }
  };

  // ---- 断言 1/3/4：晋文公时间线页，展开 E076、E084 ----
  await page.goto(BASE + "?v=" + V + "#/p/P_JINWEN/timeline", { waitUntil: "networkidle" });
  await page.waitForSelector('details[data-eid="E076"]', { timeout: 15000 });

  const e076 = page.locator('details[data-eid="E076"]');
  await e076.locator("summary").click();
  await page.waitForTimeout(300);
  const e076Text = await e076.innerText();
  assert("生产渲染 E076 展开后含「婢」", e076Text.includes("婢"));
  assert("生产渲染 E076 展开后含「嬖」", e076Text.includes("嬖"));

  const e086 = page.locator('details[data-eid="E086"]');
  await e086.scrollIntoViewIfNeeded();
  const e086Text = await e086.innerText();
  console.log("E086（五鹿事件）标题行:", e086Text.split("\n")[0]);

  // E084（韩原之战，晋文公未挂链，改走秦穆公时间线）
  await page.goto(BASE + "?v=" + V + "#/p/P_QINMU/timeline", { waitUntil: "networkidle" });
  await page.waitForSelector('details[data-eid="E084"]', { timeout: 15000 });
  const e084 = page.locator('details[data-eid="E084"]');
  await e084.scrollIntoViewIfNeeded();
  await e084.locator("summary").click();
  await page.waitForTimeout(300);
  const e084Text = await e084.innerText();
  assert("生产渲染 E084（秦穆公页）展开后含「與」", e084Text.includes("與"));
  assert("生产渲染 E084（秦穆公页）展开后含「简 34」", e084Text.includes("简 34"));

  // ---- 断言 2：地图视图，五鹿新点落图 ----
  await page.goto(BASE + "?v=" + V + "#/p/P_JINWEN/map", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const wuluCount = await page.locator('[data-place="L_WULU"]').count();
  let cx = null, cy = null;
  if (wuluCount > 0) {
    const dot = page.locator('[data-place="L_WULU"] circle.dot').first();
    cx = await dot.getAttribute("cx");
    cy = await dot.getAttribute("cy");
  }
  assert("生产地图渲染含五鹿标记（[data-place=L_WULU]）", wuluCount > 0, "count=" + wuluCount);
  assert("五鹿标记投影坐标符合 x≈708/y≈198", Math.abs(cx - 708) < 5 && Math.abs(cy - 198) < 5, "cx=" + cx + " cy=" + cy);

  await browser.close();
  console.log("\n==", pass, "PASS /", fail, "FAIL ==");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("ERROR", e); process.exit(2); });
