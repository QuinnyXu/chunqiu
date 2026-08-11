"use strict";
/* og 分享协议图生成器（r24a 重出，design_notes §4.1）
 *
 * 产物：site/assets/og/og-card.png（1200×630，预生成静态资源，conventions §9.2 例外清单第 1 项）。
 * 依赖：仅 tools/qa 内的 Playwright（§9.3 QA 工具链例外，非站点运行时依赖）；站点不引用本脚本。
 * 跑法：node tools/qa/make_og_card.js
 *
 * 构图沿用旧版（r15 立）：绢帛底＋青铜双线框＋左侧涡纹徽记＋站名大字＋副题＋下方一行色点。
 * r24a 的实质改动：色带由 15 枚旧个人色签改为国色圆点，与分享卡 §5.7、首页分区、
 * 关系全景阵营底晕同源同序。增长源随「国色家族数」而非「主角数」，故新增主角不需重出此图，
 * 唯新立一个国色家族才需要——r27 新立第 10 色「吴」，故本轮重出（9 → 10 枚点）。
 *
 * 色值必须与 site/styles.css :root 的九个 --state-* 一致；本脚本从 styles.css 实读，不另抄一份，
 * 避免日后改色时两处脱节（读不到即报错退出，不静默用兜底色）。
 */
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..", "..");
const CSS = path.join(ROOT, "site", "styles.css");
const OUT = path.join(ROOT, "site", "assets", "og", "og-card.png");

/* 色带序与 app.js STATE_FAMILY_VAR 同源：本表**从 app.js 实读**，不在此另抄一份国名——
 * 抄一份的代价 r27 已经现成摆着：新立吴色时若忘了改这里，og 图会安静地少一枚点。 */
const APPJS = fs.readFileSync(path.join(ROOT, "site", "app.js"), "utf8");
const STATES = (() => {
  const blk = /const STATE_FAMILY_VAR = \{([\s\S]*?)\};/.exec(APPJS);
  if (!blk) { console.error("app.js 中读不到 STATE_FAMILY_VAR，中止"); process.exit(1); }
  const out = []; const re = /"([^"]+)":\s*"(--[a-z-]+)"/g; let m;
  while ((m = re.exec(blk[1]))) out.push([m[1], m[2]]);
  return out;
})();

const css = fs.readFileSync(CSS, "utf8");
const colors = STATES.map(([name, v]) => {
  const m = css.match(new RegExp(v.replace(/-/g, "\\-") + "\\s*:\\s*(#[0-9A-Fa-f]{6})"));
  if (!m) { console.error("styles.css 中读不到 " + v + "，中止（不使用兜底色）"); process.exit(1); }
  return { name, hex: m[1] };
});
console.log(colors.length + " 国色（名录实读自 app.js、色值实读自 styles.css）：" + colors.map(c => c.name + c.hex).join("  "));

const dotR = 10, gap = 48, bandCx = 700, bandY = 498; // 色带与站名同轴（x=700）
const bandW = (colors.length - 1) * gap;
const dots = colors.map((c, i) => {
  const cx = bandCx - bandW / 2 + i * gap;
  return `<circle cx="${cx}" cy="${bandY}" r="${dotR}" fill="${c.hex}"/>`;
}).join("");
// 色点之间的虚线牵引（沿用旧版观感：一串「印珠」由一道细虚线串起）
const rule = `<line x1="${bandCx - bandW / 2 - 28}" y1="${bandY}" x2="${bandCx + bandW / 2 + 28}" y2="${bandY}"
  stroke="#B4652F" stroke-width="1.6" stroke-dasharray="3 5" opacity="0.75"/>`;

const html = `<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;background:#F4EDDF;}
  body{width:1200px;height:630px;overflow:hidden;}
  .serif{font-family:"Songti SC","Noto Serif CJK SC","STSong","SimSun",serif;}
</style>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#F4EDDF"/>
  <!-- 青铜双线框 -->
  <rect x="16" y="16" width="1168" height="598" fill="none" stroke="#44766B" stroke-width="2.4" opacity="0.9"/>
  <rect x="28" y="28" width="1144" height="574" fill="none" stroke="#44766B" stroke-width="1" opacity="0.75"/>
  <!-- 涡纹徽记（与 favicon / 站头 / 分享卡同一形：外弧 r20、内弧 r10、心点，顺时针 270°） -->
  <g transform="translate(212,300) scale(2.6)" fill="none" stroke="#B4652F" stroke-width="5" stroke-linecap="round">
    <path d="M0 -20A20 20 0 1 1 -20 0"/>
    <path d="M0 -10A10 10 0 1 1 -10 0"/>
    <circle cx="0" cy="0" r="2.6" fill="#B4652F" stroke="none"/>
  </g>
  <!-- 站名与副题 -->
  <text class="serif" x="700" y="322" text-anchor="middle" font-size="112" font-weight="700"
        fill="#2E2A24" letter-spacing="12">经纬春秋</text>
  <text class="serif" x="700" y="392" text-anchor="middle" font-size="34"
        fill="#7A7166" letter-spacing="7">左传为经，诸书为纬，牵系有据</text>
  <!-- 九枚国色圆点（同源同序于 STATE_FAMILY_VAR；增长源＝国色家族数，非主角数） -->
  ${rule}${dots}
</svg>`;

(async () => {
  const pw = require("playwright");
  const b = await pw.chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: "load" });
  await p.waitForTimeout(400);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await p.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await b.close();
  const st = fs.statSync(OUT);
  console.log("已写出 " + path.relative(ROOT, OUT) + "（1200×630，" + st.size + " 字节）");
})();
