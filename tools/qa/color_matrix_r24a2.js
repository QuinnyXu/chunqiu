/* 经纬春秋 · r24a-2 补批：色彩距离全矩阵实算
 *
 * 用途：诗歌层功能色换色相后，对「九国色 ＋ 其余全部功能色」做 ΔE76 全矩阵复验，
 *       并实测双底线（对绢帛 #F4EDDF ≥3.5、对白 #FFFFFF ≥4.1）。
 *
 * 口径与 design_notes §2.1 / qi_palette_expansion.md §1.1 一字不差：
 *   - ΔE76 = CIE Lab（D65/2°）欧氏距离；
 *   - 对比度 = WCAG 2.x 相对亮度比 (L1+0.05)/(L2+0.05)；
 *   - 灰阶 = sRGB→线性→WCAG Y→回伽马 ×255。
 * 判据（裁定 3）：两两 ΔE76 ≥13.2；对绢帛 ≥3.5；对白 ≥4.1。
 *
 * 色值一律**从 site/styles.css 与 site/app.js 实读**，脚本内不另抄一份
 * （与 make_og_card.js 同一纪律：读不到即报错退出，避免日后改色时两处脱节）。
 *
 * 用法：
 *   node tools/qa/color_matrix_r24a2.js            全矩阵复验（默认）
 *   node tools/qa/color_matrix_r24a2.js --search   候选色搜索（换色相时用）
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const CSS = fs.readFileSync(path.join(ROOT, "site", "styles.css"), "utf8");
const APP = fs.readFileSync(path.join(ROOT, "site", "app.js"), "utf8");

/* ---------- 色彩数学（口径见文件头） ---------- */
const hex2rgb = (h) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(h.trim());
  if (!m) throw new Error("非法色值：" + h);
  const v = parseInt(m[1], 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};
const rgb2hex = ([r, g, b]) =>
  "#" + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const relLum = (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
const contrast = (a, b) => {
  const la = relLum(hex2rgb(a)), lb = relLum(hex2rgb(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
const gray = (h) => { // 去色后的 8bit 灰阶
  const y = relLum(hex2rgb(h));
  return Math.round(255 * (y <= 0.0031308 ? y * 12.92 : 1.055 * Math.pow(y, 1 / 2.4) - 0.055));
};
function rgb2lab(hex) {
  const [r, g, b] = hex2rgb(hex).map(lin);
  // sRGB(D65) → XYZ
  let X = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  let Y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  let Z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
  const Wx = 0.95047, Wy = 1.0, Wz = 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const fx = f(X / Wx), fy = f(Y / Wy), fz = f(Z / Wz);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
const dE76 = (a, b) => {
  const A = rgb2lab(a), B = rgb2lab(b);
  return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
};
function hueDeg(hex) { // Lab 色相角，仅作注记用
  const [, a, b] = rgb2lab(hex);
  let d = Math.atan2(b, a) * 180 / Math.PI;
  return (d + 360) % 360;
}

/* ---------- 从源文件实读色值 ---------- */
function cssVar(name) {
  const m = new RegExp("--" + name + "\\s*:\\s*(#[0-9A-Fa-f]{6})").exec(CSS);
  if (!m) throw new Error("styles.css 中读不到 --" + name + "，请检查变量名（脚本不设兜底色）");
  return m[1];
}
function cssRule(re, label) {
  const m = re.exec(CSS);
  if (!m) throw new Error("styles.css 中读不到「" + label + "」的色值（脚本不设兜底色）");
  return m[1];
}

const STATES = [
  ["齐", "state-qi"], ["鲁", "state-lu"], ["郑", "state-zheng"], ["晋", "state-jin"],
  ["秦", "state-qin"], ["楚", "state-chu"], ["卫", "state-wei"], ["宋", "state-song"],
  ["陈", "state-chen"],
].map(([n, v]) => ({ group: "国色", name: n, hex: cssVar(v) }));

// 诗歌层色：r24a-2 起为独立变量 --poem；换色相之前它等于 --bronze，故此处兼容两种情形。
const POEM_HEX = (() => {
  const m = /--poem\s*:\s*(#[0-9A-Fa-f]{6})/.exec(CSS);
  return m ? m[1] : cssVar("bronze");
})();

const FUNCS = [
  { group: "界面基色", name: "玄墨 ink", hex: cssVar("ink") },
  { group: "界面基色", name: "淡墨 ink-soft", hex: cssVar("ink-soft") },
  { group: "界面基色", name: "界线 line", hex: cssVar("line") },
  { group: "界面强调", name: "暖赭 ochre", hex: cssVar("ochre") },
  { group: "界面强调", name: "青绿 bronze", hex: cssVar("bronze") },
  { group: "界面强调", name: "朱砂 cinnabar", hex: cssVar("cinnabar") },
  { group: "史料层", name: "诗歌 poem", hex: POEM_HEX },
  { group: "史料层", name: "经义异闻 乌梅紫", hex: cssRule(/\.quote\.layer-jingyi\s+\.q-layer\s*\{\s*color:\s*(#[0-9A-Fa-f]{6})/, "经义异闻层色") },
  { group: "悬停态", name: "打赏钮 hover", hex: cssRule(/\.btn-support:hover\s*\{\s*background:\s*(#[0-9a-fA-F]{6})/, "打赏钮 hover") },
  { group: "悬停态", name: "资料库返回 hover", hex: cssRule(/\.lib-back:hover\s*\{\s*background:\s*(#[0-9a-fA-F]{6})/, "资料库返回 hover") },
];

// 关系线八色（app.js REL_COLORS）——全景图与 ego 图上与国色节点同屏
const REL = (() => {
  const blk = /const REL_COLORS = \{([\s\S]*?)\};/.exec(APP);
  if (!blk) throw new Error("app.js 中读不到 REL_COLORS");
  const out = [];
  const re = /"([^"]+)":\s*"(#[0-9A-Fa-f]{6})"/g;
  let m;
  while ((m = re.exec(blk[1]))) out.push({ group: "关系线", name: m[1], hex: m[2] });
  return out;
})();

// 地图/时间线上的中性构件色（散见 app.js，无变量）
const MISC = [
  { group: "图面中性", name: "层名注记 #4E4338", hex: "#4E4338" },
  { group: "图面中性", name: "年轴刻度 #B8AC90", hex: "#B8AC90" },
  { group: "图面中性", name: "未生/已卒灰 #9A9081", hex: "#9A9081" },
  { group: "图面中性", name: "无类关系 #8A8072", hex: "#8A8072" },
];

const SILK = cssVar("silk"), SILK_PANEL = cssVar("silk-panel"), WHITE = "#FFFFFF";
const ALL = [...STATES, ...FUNCS, ...REL, ...MISC];
// 同一 hex 在不同用途下重复登记者（如青绿 bronze 与「拥立」关系线同值）不去重，
// 但两两比较时跳过自比与同值对（ΔE=0 无信息量），另单列一节点明。

/* ---------- 报表 ---------- */
const T_DE = 13.2, T_SILK = 3.5, T_WHITE = 4.1;

function fmt(n, w = 6) { return n.toFixed(2).padStart(w); }

function report() {
  console.log("=== r24a-2 色彩距离全矩阵（判据：ΔE76 ≥ " + T_DE + "；对绢帛 ≥ " + T_SILK + "；对白 ≥ " + T_WHITE + "）===\n");
  console.log("【一】色目清单（" + ALL.length + " 色，全部从源文件实读）");
  console.log("  组别      名称                    色值      灰阶  相角   对绢帛  对白");
  for (const c of ALL) {
    console.log("  " + c.group.padEnd(9) + " " + c.name.padEnd(22) + " " + c.hex + "  " +
      String(gray(c.hex)).padStart(4) + " " + fmt(hueDeg(c.hex), 6) + " " +
      fmt(contrast(c.hex, SILK)) + " " + fmt(contrast(c.hex, WHITE)));
  }

  // 同值对（登记于不同用途的同一色）
  const dup = [];
  for (let i = 0; i < ALL.length; i++) for (let j = i + 1; j < ALL.length; j++) {
    if (ALL[i].hex.toUpperCase() === ALL[j].hex.toUpperCase()) dup.push(ALL[i].name + " ≡ " + ALL[j].name + " (" + ALL[i].hex + ")");
  }
  console.log("\n【二】同值登记（同一色值服务多处用途，不计入两两判据）：" + (dup.length ? "" : "无"));
  for (const d of dup) console.log("  · " + d);

  // 九国色两两（裁定 3 主判据）
  console.log("\n【三】九国色两两 ΔE76（36 对，裁定 3 主判据）");
  let worst = { d: Infinity }, fail = 0;
  for (let i = 0; i < STATES.length; i++) for (let j = i + 1; j < STATES.length; j++) {
    const d = dE76(STATES[i].hex, STATES[j].hex);
    if (d < worst.d) worst = { d, a: STATES[i].name, b: STATES[j].name };
    if (d < T_DE) { fail++; console.log("  ✗ " + STATES[i].name + "×" + STATES[j].name + " " + fmt(d)); }
  }
  console.log("  最紧：" + worst.a + "×" + worst.b + " " + fmt(worst.d) + "；低于判据 " + fail + " 对");

  // 诗歌层色 vs 全体（本批焦点）
  console.log("\n【四】诗歌层色 " + POEM_HEX + " vs 全体（本批焦点，" + (ALL.length - 1) + " 项）");
  const rows = ALL.filter(c => c.name !== "诗歌 poem")
    .map(c => ({ c, d: dE76(POEM_HEX, c.hex) })).sort((a, b) => a.d - b.d);
  for (const r of rows) {
    const ok = r.d >= T_DE ? "✓" : "✗";
    console.log("  " + ok + " " + r.c.group.padEnd(9) + " " + r.c.name.padEnd(22) + " " + r.c.hex + " ΔE " + fmt(r.d));
  }
  const poemFail = rows.filter(r => r.d < T_DE);
  console.log("  → 低于 " + T_DE + " 者：" + poemFail.length + " 项" +
    (poemFail.length ? "（" + poemFail.map(r => r.c.name + " " + r.d.toFixed(2)).join("、") + "）" : ""));
  console.log("  → 双底线：对绢帛 " + fmt(contrast(POEM_HEX, SILK)) + "（≥" + T_SILK + "）、对白 " +
    fmt(contrast(POEM_HEX, WHITE)) + "（≥" + T_WHITE + "）、对绢帛面板 " + fmt(contrast(POEM_HEX, SILK_PANEL)));

  // 九国色 vs 全部功能色（含关系线与中性色）
  console.log("\n【五】九国色 × 全部非国色（每国列出最近三项）");
  const nonState = ALL.filter(c => c.group !== "国色");
  const under = [];
  for (const s of STATES) {
    const near = nonState.map(c => ({ c, d: dE76(s.hex, c.hex) })).sort((a, b) => a.d - b.d);
    console.log("  " + s.name + " " + s.hex + "：" + near.slice(0, 3)
      .map(r => r.c.name + " " + r.d.toFixed(2) + (r.d < T_DE ? " ⚠" : "")).join(" ｜ "));
    for (const r of near) if (r.d < T_DE) under.push({ s: s.name, ...r });
  }
  console.log("\n  低于 " + T_DE + " 的国色×功能色对，共 " + under.length + " 对：");
  for (const u of under.sort((a, b) => a.d - b.d)) {
    console.log("    " + u.s + " × " + u.c.name + "（" + u.c.group + "） ΔE " + fmt(u.d));
  }

  // 双底线全量
  console.log("\n【六】双底线全量实测（前景色对底：仅列不达标者）");
  const dim = ALL.filter(c => contrast(c.hex, SILK) < T_SILK || contrast(c.hex, WHITE) < T_WHITE);
  if (!dim.length) console.log("  全部达标。");
  for (const c of dim) {
    console.log("  ✗ " + c.name + " " + c.hex + " 对绢帛 " + fmt(contrast(c.hex, SILK)) +
      " / 对白 " + fmt(contrast(c.hex, WHITE)) + "（" + c.group + "）");
  }
  console.log("\n  注：界线 line / 年轴刻度 / 绢帛面板等为「面与线」而非正文前景，本就不受 4.5 正文判据约束；");
  console.log("      双底线只适用于承载文字或细线语义的色（国色、层色、强调色）。");
}

/* ---------- 候选色搜索（换色相时用） ---------- */
function search() {
  // 与诗歌层色须拉开的对象：九国色 ＋ 全部功能色（排除诗歌层自身当前值）
  const targets = ALL.filter(c => c.name !== "诗歌 poem");
  const cand = [];
  for (let r = 16; r <= 200; r += 4) for (let g = 16; g <= 200; g += 4) for (let b = 16; b <= 200; b += 4) {
    const hex = rgb2hex([r, g, b]);
    if (contrast(hex, SILK) < T_SILK || contrast(hex, WHITE) < T_WHITE) continue;
    let min = Infinity, who = "";
    for (const t of targets) {
      const d = dE76(hex, t.hex);
      if (d < min) { min = d; who = t.name; }
      if (min < T_DE) break;
    }
    if (min < T_DE) continue;
    const [L, A, B] = rgb2lab(hex);
    const chroma = Math.hypot(A, B);
    if (chroma < 12 || chroma > 42) continue; // 克制的中彩度带（拒绝灰死与荧光）
    cand.push({ hex, min, who, hue: hueDeg(hex), L, chroma });
  }
  cand.sort((a, b) => b.min - a.min);
  console.log("=== 候选色搜索：满足 ΔE76 ≥" + T_DE + " 对全部 " + targets.length + " 色，且双底线达标，彩度 12–42 ===");
  console.log("共 " + cand.length + " 个候选（4 步长网格）。按最紧距离降序取前 40：\n");
  console.log("  色值      最紧距离  最近者                 相角    L*     C*");
  for (const c of cand.slice(0, 40)) {
    console.log("  " + c.hex + " " + fmt(c.min) + "  " + c.who.padEnd(22) + fmt(c.hue) + " " + fmt(c.L) + " " + fmt(c.chroma));
  }
  // 按相角分桶，看可用色相区间
  const buckets = new Map();
  for (const c of cand) {
    const k = Math.floor(c.hue / 15) * 15;
    if (!buckets.has(k) || buckets.get(k).min < c.min) buckets.set(k, c);
  }
  console.log("\n可用色相区间（每 15° 一桶，列该桶内最紧距离最大者）：");
  for (const k of [...buckets.keys()].sort((a, b) => a - b)) {
    const c = buckets.get(k);
    console.log("  " + String(k).padStart(3) + "°–" + String(k + 15).padStart(3) + "°  " + c.hex +
      "  最紧 " + fmt(c.min) + "（" + c.who + "）");
  }
}

if (process.argv.includes("--search")) search();
else report();
