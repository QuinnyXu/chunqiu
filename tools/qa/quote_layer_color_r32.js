/* 经纬春秋 · r32：史料层徽标色全矩阵复验（第 6 档「出土文献」新立）
 *
 * 用途：J 层（出土文献，`J###` 前缀，conventions v1.30 §2）新开一档引文分层徽标，
 *       为其取专属色并做全矩阵复验。既有五档见 design_notes §3.5。
 *
 * 口径与 design_notes §2.1/§2.2、tools/qa/color_matrix_r24a2.js → r27 → r28 一字不差：
 *   - ΔE76 = CIE Lab（D65/2°）欧氏距离；
 *   - 对比度 = WCAG 2.x 相对亮度比 (L1+0.05)/(L2+0.05)；
 *   - 灰阶 = sRGB→线性→WCAG Y→回伽马 ×255；
 *   - 色相/彩度 = Lab 极坐标（hue = atan2(b*,a*)，C* = hypot(a*,b*)）。
 *
 * 判据分两层，本脚本都报数：
 *   ① 全站既有硬判据（r24a-2 为 --poem 换色相时所用，见 design_notes §2.4.1）：
 *      新层色对「全部国色 ＋ 全部功能色」ΔE76 ≥13.2，且不得新增任何一对低于 13.2；
 *      对绢帛 ≥3.5、对白 ≥4.1（双底线）。
 *   ② 本件任务书所加「六档并置可辨」：与既有五档**色相与明度都可区分**——
 *      本脚本以实测报数（Δhue、ΔL*、Δ灰阶、ΔE76），并与**既有五档彼此的现状余量**对读，
 *      即「新色不得比现有任何一对更紧」，不另立拍脑袋阈值。
 *
 * 色值一律从 site/styles.css 与 site/app.js 实读，脚本内不另抄一份。
 *
 * 用法：
 *   node tools/qa/quote_layer_color_r32.js              全矩阵复验（默认）
 *   node tools/qa/quote_layer_color_r32.js --search     第 6 档候选搜索（取色时用）
 *      可选 --band=lo,hi  --gray=lo,hi  --chroma=lo,hi  --step=N  --floor=N
 *   node tools/qa/quote_layer_color_r32.js --search '#6B4A22' '#8C7A3E'   附带指定色逐一体检
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const CSS = fs.readFileSync(path.join(ROOT, "site", "styles.css"), "utf8");
const APP = fs.readFileSync(path.join(ROOT, "site", "app.js"), "utf8");

/* ---------- 色彩数学（口径见文件头，与 r28 脚本逐字同源） ---------- */
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
const gray = (h) => {
  const y = relLum(hex2rgb(h));
  return Math.round(255 * (y <= 0.0031308 ? y * 12.92 : 1.055 * Math.pow(y, 1 / 2.4) - 0.055));
};
function rgb2lab(hex) {
  const [r, g, b] = hex2rgb(hex).map(lin);
  const X = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const Y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  const Z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
  const Wx = 0.95047, Wy = 1.0, Wz = 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const fx = f(X / Wx), fy = f(Y / Wy), fz = f(Z / Wz);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
const dE76 = (a, b) => {
  const A = rgb2lab(a), B = rgb2lab(b);
  return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
};
const hueDeg = (hex) => { const [, a, b] = rgb2lab(hex); return (Math.atan2(b, a) * 180 / Math.PI + 360) % 360; };
const chroma = (hex) => { const [, a, b] = rgb2lab(hex); return Math.hypot(a, b); };
const Lstar = (hex) => rgb2lab(hex)[0];
const dHue = (a, b) => { const d = Math.abs(hueDeg(a) - hueDeg(b)); return d > 180 ? 360 - d : d; };
/* alpha 合成：前景色以 alpha 叠在底色上（引文淡底就是这么来的） */
function over(fg, bg, alpha) {
  const F = hex2rgb(fg), B = hex2rgb(bg);
  return rgb2hex([0, 1, 2].map(i => F[i] * alpha + B[i] * (1 - alpha)));
}
/* 三型色觉模拟（Viénot-Brettel-Mollon 1999，同 design_notes §2.2） */
const CVD = {
  protan: [[0.11238, 0.88762, 0], [0.07276, 0.92724, 0], [0.00399, -0.00399, 1]],
  deutan: [[0.29275, 0.70725, 0], [0.34557, 0.65443, 0], [-0.02020, 0.02020, 1]],
  tritan: [[1, 0.14461, -0.14461], [0, 0.85924, 0.14076], [0, 0.25164, -0.25164]],
};
function simulate(hex, type) {
  const [r, g, b] = hex2rgb(hex).map(lin);
  const M = CVD[type];
  return rgb2hex(M.map(row => row[0] * r + row[1] * g + row[2] * b)
    .map(v => Math.max(0, Math.min(1, v)))
    .map(v => 255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)));
}

/* ---------- 从源文件实读色值 ---------- */
function cssVar(name, optional) {
  const m = new RegExp("--" + name + "\\s*:\\s*(#[0-9A-Fa-f]{6})").exec(CSS);
  if (!m) { if (optional) return null; throw new Error("styles.css 中读不到 --" + name); }
  return m[1];
}
function cssRule(re, label, optional) {
  const m = re.exec(CSS);
  if (!m) { if (optional) return null; throw new Error("styles.css 中读不到「" + label + "」的色值"); }
  return m[1];
}
const FAMILY_FROM_APP = (() => {
  const blk = /const STATE_FAMILY_VAR = \{([\s\S]*?)\};/.exec(APP);
  if (!blk) throw new Error("app.js 中读不到 STATE_FAMILY_VAR");
  const out = []; const re = /"([^"]+)":\s*"--([a-z-]+)"/g; let m;
  while ((m = re.exec(blk[1]))) out.push([m[1], m[2]]);
  return out;
})();
const STATES = FAMILY_FROM_APP.map(([n, v]) => ({ group: "国色", name: n, hex: cssVar(v) }));

const SILK = cssVar("silk"), SILK_PANEL = cssVar("silk-panel"), WHITE = "#FFFFFF";
const INK = cssVar("ink"), INK_SOFT = cssVar("ink-soft"), OCHRE = cssVar("ochre");
const CINNABAR = cssVar("cinnabar"), POEM = cssVar("poem");
const JINGYI = cssRule(/\.quote\.layer-jingyi\s+\.q-layer\s*\{\s*color:\s*(#[0-9A-Fa-f]{6})/, "经义异闻层色");
/* 第 6 档：落地后从 CSS 实读 --excav；取色阶段（尚未落 CSS）由 --probe 指定。
 * 同时对账：.quote.layer-chutu 两条规则须都指向 --excav，写死色值即报错——
 * 单点管理是 --poem 的既定纪律（见其注「此后只认 --poem」），新档照办。 */
const CHUTU_CSS = (() => {
  const v = cssVar("excav", true);
  if (!v) return null;
  const line = /\.quote\.layer-chutu\s*\{[^}]*\}/.exec(CSS);
  const badge = /\.quote\.layer-chutu\s+\.q-layer\s*\{[^}]*\}/.exec(CSS);
  if (!line || !badge) throw new Error("styles.css 中读不到 .quote.layer-chutu 的两条规则");
  if (!/var\(--excav\)/.test(line[0]) || !/var\(--excav\)/.test(badge[0]))
    throw new Error("layer-chutu 规则里出现了写死色值——层色须单点管理，只认 var(--excav)");
  return v;
})();
const probeArg = process.argv.find(a => a.startsWith("--probe="));
const CHUTU = probeArg ? rgb2hex(hex2rgb(probeArg.slice(8))) : CHUTU_CSS;

/* 引文分层徽标六档（§3.5）——「原文」与「言论/评论」左线仍朱，故朱砂在此表内一并参评 */
const TIERS = [
  { name: "原文 朱砂", hex: CINNABAR, note: "经传骨架，无徽标；左线与淡底" },
  { name: "言论/评论 淡墨", hex: INK_SOFT, note: "徽标淡墨，左线仍朱" },
  { name: "后出叙事 淡墨", hex: INK_SOFT, note: "同上色，左线灰虚线（形冗余）" },
  { name: "诗歌 菉", hex: POEM, note: "r24a-2 换色相" },
  { name: "经义异闻 乌梅紫", hex: JINGYI, note: "公羊/穀梁异说" },
];
if (CHUTU) TIERS.push({ name: "出土文献 ★新", hex: CHUTU, note: "r32 新立（J 层）" });
/* 同屏必然并置的第三方：编者层标 .q-caveat 暖赭（Q442 正带层标，两者同卡同屏） */
const COEXIST = [{ group: "编者层标", name: "编者层标 暖赭", hex: OCHRE }];

const FUNCS = [
  { group: "界面基色", name: "玄墨 ink", hex: INK },
  { group: "界面基色", name: "淡墨 ink-soft", hex: INK_SOFT },
  { group: "界面基色", name: "界线 line", hex: cssVar("line") },
  { group: "界面强调", name: "暖赭 ochre", hex: OCHRE },
  { group: "界面强调", name: "青绿 bronze", hex: cssVar("bronze") },
  { group: "界面强调", name: "朱砂 cinnabar", hex: CINNABAR },
  { group: "史料层", name: "诗歌 poem", hex: POEM },
  { group: "史料层", name: "经义异闻 乌梅紫", hex: JINGYI },
  { group: "悬停态", name: "打赏钮 hover", hex: cssRule(/\.btn-support:hover\s*\{\s*background:\s*(#[0-9a-fA-F]{6})/, "打赏钮 hover") },
  { group: "悬停态", name: "资料库返回 hover", hex: cssRule(/\.lib-back:hover\s*\{\s*background:\s*(#[0-9a-fA-F]{6})/, "资料库返回 hover") },
];
const REL = (() => {
  const blk = /const REL_COLORS = \{([\s\S]*?)\};/.exec(APP);
  if (!blk) throw new Error("app.js 中读不到 REL_COLORS");
  const out = []; const re = /"([^"]+)":\s*"(#[0-9A-Fa-f]{6})"/g; let m;
  while ((m = re.exec(blk[1]))) out.push({ group: "关系线", name: m[1], hex: m[2] });
  return out;
})();
const MISC = [
  { group: "图面中性", name: "层名注记 #4E4338", hex: "#4E4338" },
  { group: "图面中性", name: "年轴刻度 #B8AC90", hex: "#B8AC90" },
  { group: "图面中性", name: "未生/已卒灰 #9A9081", hex: "#9A9081" },
  { group: "图面中性", name: "无类关系 #8A8072", hex: "#8A8072" },
];
const NON_STATE = [...FUNCS, ...REL, ...MISC];
const ALL = [...STATES, ...NON_STATE];

const T_DE = 13.2, T_SILK = 3.5, T_WHITE = 4.1;
const fmt = (n, w = 6) => n.toFixed(2).padStart(w);

/* 引文徽标实际可能落身的底色（站内无暗色模式，实测枚举而非假设）：
 * 引文块只在两处渲染——人物线时间线与编年（app.js eventBodyNode 单一实现），
 * 二者的引文块都坐在 .event 卡（--silk-panel）之上，卡外是页底 --silk。
 * 引文自身另有 6–7% 同色淡底，故徽标文字实际压在「淡底叠卡面」的合成色上。 */
function backgrounds(hex) {
  return [
    { name: "绢帛底 --silk", bg: SILK },
    { name: "卡面 --silk-panel（.event）", bg: SILK_PANEL },
    { name: "引文淡底 6% 叠卡面", bg: over(hex, SILK_PANEL, 0.06) },
    { name: "引文淡底 7% 叠卡面", bg: over(hex, SILK_PANEL, 0.07) },
    { name: "卡头 hover 5% 暖赭叠卡面", bg: over(OCHRE, SILK_PANEL, 0.05) },
    { name: "卡头 active 10% 暖赭叠卡面", bg: over(OCHRE, SILK_PANEL, 0.10) },
    { name: "纯白（判据基线）", bg: WHITE },
    { name: "〔压力项〕玄墨底 --ink", bg: INK },
  ];
}

function report() {
  if (!CHUTU) { console.log("！styles.css 尚无 .quote.layer-chutu 层色，且未给 --probe=；先用 --search 取色。"); return; }
  console.log("=== r32 史料层徽标色全矩阵复验（第 6 档「出土文献」= " + CHUTU + "）===");
  console.log("（色值实读自 site/styles.css 与 site/app.js；口径同 design_notes §2.1/§2.2）\n");

  console.log("【一】六档清单");
  console.log("  档                色值      L*     C*    Lab相角   灰阶  对绢帛 对卡面 对白");
  for (const t of TIERS) {
    console.log("  " + t.name.padEnd(16) + " " + t.hex + " " + fmt(Lstar(t.hex)) + " " +
      fmt(chroma(t.hex)) + " " + fmt(hueDeg(t.hex), 8) + " " + String(gray(t.hex)).padStart(5) + " " +
      fmt(contrast(t.hex, SILK)) + " " + fmt(contrast(t.hex, SILK_PANEL)) + " " + fmt(contrast(t.hex, WHITE)));
  }

  console.log("\n【二】六档两两并置实测（ΔE76 / Δ色相° / ΔL* / Δ灰阶）");
  console.log("  「言论/评论」与「后出叙事」同色（淡墨），二者之分由**左线线型**承担（实线朱 vs 灰虚线），非由色承担——");
  console.log("  故色的判据只对**去重后的 5 个色**（新色计入即 5 个）算，下表已去重。");
  const uniq = [];
  for (const t of TIERS) if (!uniq.some(u => u.hex === t.hex)) uniq.push(t);
  const pairs = [];
  for (let i = 0; i < uniq.length; i++) for (let j = i + 1; j < uniq.length; j++) {
    const a = uniq[i], b = uniq[j];
    pairs.push({
      a: a.name, b: b.name, de: dE76(a.hex, b.hex), dh: dHue(a.hex, b.hex),
      dl: Math.abs(Lstar(a.hex) - Lstar(b.hex)), dg: Math.abs(gray(a.hex) - gray(b.hex)),
      isNew: a.hex === CHUTU || b.hex === CHUTU,
    });
  }
  pairs.sort((x, y) => x.de - y.de);
  console.log("  " + "对".padEnd(34) + "  ΔE76   Δ色相   ΔL*   Δ灰阶  新/既有");
  for (const p of pairs) {
    console.log("  " + (p.a + " × " + p.b).padEnd(34) + fmt(p.de) + fmt(p.dh, 8) + fmt(p.dl, 7) +
      String(p.dg).padStart(6) + "   " + (p.isNew ? "★本轮新增" : "既有"));
  }
  const old = pairs.filter(p => !p.isNew), fresh = pairs.filter(p => p.isNew);
  const minBy = (arr, k) => arr.reduce((m, x) => (x[k] < m[k] ? x : m));
  if (old.length) {
    const oe = minBy(old, "de"), oh = minBy(old, "dh"), ol = minBy(old, "dl");
    console.log("\n  既有各对的现状余量（新色须不紧于此，方称「不是近邻色」）：");
    console.log("    最紧 ΔE76  " + fmt(oe.de) + "（" + oe.a + " × " + oe.b + "）");
    console.log("    最紧 Δ色相 " + fmt(oh.dh) + "°（" + oh.a + " × " + oh.b + "）");
    console.log("    最紧 ΔL*   " + fmt(ol.dl) + "（" + ol.a + " × " + ol.b + "）");
  }
  if (fresh.length) {
    const ne = minBy(fresh, "de"), nh = minBy(fresh, "dh"), nl = minBy(fresh, "dl");
    console.log("\n  新色对既有各档的最紧值：");
    console.log("    最紧 ΔE76  " + fmt(ne.de) + "（对 " + (ne.a === TIERS[TIERS.length - 1].name ? ne.b : ne.a) + "）" +
      (ne.de >= T_DE ? "  ✓ ≥" + T_DE : "  ✗"));
    console.log("    最紧 Δ色相 " + fmt(nh.dh) + "°（对 " + (nh.a === TIERS[TIERS.length - 1].name ? nh.b : nh.a) + "）");
    console.log("    最紧 ΔL*   " + fmt(nl.dl) + "（对 " + (nl.a === TIERS[TIERS.length - 1].name ? nl.b : nl.a) + "）");
  }

  console.log("\n【三】同屏必然并置的第三方：编者层标暖赭（Q442 正带层标，见 §3.6）");
  for (const c of COEXIST) {
    const d = dE76(CHUTU, c.hex);
    console.log("  新色 × " + c.name + "  ΔE76 " + fmt(d) + " Δ色相 " + fmt(dHue(CHUTU, c.hex), 7) +
      "° ΔL* " + fmt(Math.abs(Lstar(CHUTU) - Lstar(c.hex)), 6) + (d >= T_DE ? "  ✓" : "  ✗"));
  }

  console.log("\n【四】新色对「全部国色 " + STATES.length + " ＋ 全部功能色 " + NON_STATE.length +
              "」逐对核（判据 ≥" + T_DE + "，且不得新增任何一对低于线）");
  const near = ALL.map(c => ({ c, d: dE76(CHUTU, c.hex) })).sort((a, b) => a.d - b.d);
  const under = near.filter(r => r.d < T_DE);
  for (const r of near.slice(0, 10)) {
    console.log("  " + (r.d >= T_DE ? "✓" : "✗") + " " + r.c.group.padEnd(9) + " " +
      r.c.name.padEnd(22) + " " + r.c.hex + " ΔE " + fmt(r.d));
  }
  console.log("  → 低于 " + T_DE + " 者 " + under.length + " 对" + (under.length ? "  ✗" : "  ✓（本轮新增 0 对）"));

  console.log("\n【五】新色在各实际底色上的 WCAG 对比度（徽标为 0.66rem 小字，故一并对 4.5 报数）");
  console.log("  底色                              合成值    对比度  ≥3.5  ≥4.1  ≥4.5(AA小字)");
  for (const b of backgrounds(CHUTU)) {
    const c = contrast(CHUTU, b.bg);
    console.log("  " + b.name.padEnd(32) + " " + b.bg + " " + fmt(c) + "   " +
      (c >= T_SILK ? "✓" : "✗") + "     " + (c >= T_WHITE ? "✓" : "✗") + "     " + (c >= 4.5 ? "✓" : "✗"));
  }

  console.log("\n【六】旁通道记实（三型色觉模拟，非判据，见 design_notes §2.2）——六档去重后两两");
  for (const type of ["protan", "deutan", "tritan"]) {
    const ps = [];
    for (let i = 0; i < uniq.length; i++) for (let j = i + 1; j < uniq.length; j++) {
      ps.push({ a: uniq[i], b: uniq[j], d: dE76(simulate(uniq[i].hex, type), simulate(uniq[j].hex, type)) });
    }
    ps.sort((x, y) => x.d - y.d);
    const mine = ps.filter(p => p.d < T_DE && (p.a.hex === CHUTU || p.b.hex === CHUTU));
    console.log("  " + type.padEnd(7) + " 低于 " + T_DE + " 者 " + ps.filter(p => p.d < T_DE).length + "/" + ps.length +
      "；最紧 " + ps[0].a.name + "×" + ps[0].b.name + " " + ps[0].d.toFixed(2) +
      "；涉新色者 " + mine.length + " 对" +
      (mine.length ? "（" + mine.map(p => p.a.name + "×" + p.b.name + " " + p.d.toFixed(2)).join("、") + "）" : ""));
  }
  console.log("  灰阶序列（去重五色）：" + uniq.map(t => ({ n: t.name, g: gray(t.hex) }))
    .sort((a, b) => a.g - b.g).map(x => x.n + " " + x.g).join(" / "));
}

/* ---------- 第 6 档候选搜索 ---------- */
function argVal(name) {
  const a = process.argv.find(x => x.startsWith("--" + name + "="));
  return a ? a.slice(name.length + 3) : null;
}
function search() {
  const base = TIERS.filter(t => t.hex !== CHUTU);
  const targets = [...base.map(t => ({ group: "史料层档", name: t.name, hex: t.hex })), ...COEXIST, ...STATES, ...NON_STATE];
  const band = (argVal("band") || "").split(",").map(Number);
  const gband = (argVal("gray") || "").split(",").map(Number);
  const cband = (argVal("chroma") || "").split(",").map(Number);
  const FLOOR = Number(argVal("floor") || 8);
  const STEP = Number(argVal("step") || 3);
  const GLO = gband.length === 2 && !isNaN(gband[0]) ? Math.max(45, gband[0]) : 45;
  const GHI = gband.length === 2 && !isNaN(gband[1]) ? Math.min(125, gband[1]) : 125;
  const CLO = cband.length === 2 && !isNaN(cband[0]) ? cband[0] : 12;
  const CHI = cband.length === 2 && !isNaN(cband[1]) ? cband[1] : 46;
  const cand = [];
  for (let r = FLOOR; r <= 210; r += STEP) for (let g = FLOOR; g <= 210; g += STEP) for (let b = FLOOR; b <= 210; b += STEP) {
    const hex = rgb2hex([r, g, b]);
    if (contrast(hex, SILK) < T_SILK || contrast(hex, WHITE) < T_WHITE) continue;
    const gy = gray(hex);
    if (gy < GLO || gy > GHI) continue;
    if (band.length === 2 && !isNaN(band[0])) { const h = hueDeg(hex); if (h < band[0] || h > band[1]) continue; }
    const C = chroma(hex);
    if (C < CLO || C > CHI) continue;
    let minTier = Infinity, whoTier = "";
    for (const t of base) { const d = dE76(hex, t.hex); if (d < minTier) { minTier = d; whoTier = t.name; } }
    if (minTier < T_DE) continue;
    let minAll = minTier, whoAll = whoTier;
    for (const t of targets) { const d = dE76(hex, t.hex); if (d < minAll) { minAll = d; whoAll = t.name; } }
    if (minAll < T_DE) continue;
    /* 「色相与明度都可区分」——对既有各档取最紧 Δhue（仅对彩度 ≥15 的有相之色算）与最紧 ΔL* */
    let minH = Infinity, minL = Infinity;
    for (const t of base) {
      if (chroma(t.hex) >= 15) minH = Math.min(minH, dHue(hex, t.hex));
      minL = Math.min(minL, Math.abs(Lstar(hex) - Lstar(t.hex)));
    }
    cand.push({ hex, minTier, whoTier, minAll, whoAll, minH, minL, hue: hueDeg(hex), L: Lstar(hex), C, gy });
  }
  /* --by=tier 改按「对既有五档最紧」降序——「六档并置可辨」是本件的主判据，
   * 而默认的 --by=all（对全体最紧）是全站既有硬判据。两个排序看的是两件事，都要看。 */
  const BY = argVal("by") || "all";
  const key = (c) => (BY === "tier" ? c.minTier : BY === "worst" ? Math.min(c.minTier, c.minAll) : c.minAll);
  cand.sort((a, b) => key(b) - key(a));
  console.log("=== r32 第 6 档（出土文献）候选搜索（排序：对" + (BY === "tier" ? "既有五档" : "全体") + "最紧 降序）===");
  console.log("硬判据：对既有五档 ΔE76 ≥" + T_DE + "；对编者层标暖赭、全部国色、全部功能色亦 ≥" + T_DE +
              "；双底线；灰阶 [" + GLO + "," + GHI + "]；彩度 [" + CLO + "," + CHI + "]；步长 " + STEP +
              (band.length === 2 && !isNaN(band[0]) ? "；相角带 [" + band[0] + "," + band[1] + "]" : "") + "\n");
  console.log("共 " + cand.length + " 个候选，按「对全体最紧距离」降序取前 30：\n");
  console.log("  色值      对档最紧 最近档            对全体最紧 最近者               相角    L*    C*  灰阶 最紧Δ相 最紧ΔL*");
  for (const c of cand.slice(0, 30)) {
    console.log("  " + c.hex + " " + fmt(c.minTier) + " " + c.whoTier.padEnd(16) + " " +
      fmt(c.minAll) + "  " + c.whoAll.padEnd(20) + fmt(c.hue) + " " + fmt(c.L) + " " + fmt(c.C) +
      String(c.gy).padStart(5) + fmt(c.minH, 8) + fmt(c.minL, 8));
  }
  /* 每桶取「两个最紧值中较小者」最大的一个——即桶内的木桶短板最优解，
   * 免得按单一维度挑出「对档很松但对国色贴线」这类看着漂亮、落地即冲突的候选。 */
  const worst = (c) => Math.min(c.minTier, c.minAll);
  const buckets = new Map();
  for (const c of cand) {
    const k = Math.floor(c.hue / 15) * 15;
    if (!buckets.has(k) || worst(buckets.get(k)) < worst(c)) buckets.set(k, c);
  }
  console.log("\n可用色相区间（每 15° 一桶，列桶内「对档最紧与对全体最紧二者之小者」最大的一个）：");
  for (const k of [...buckets.keys()].sort((a, b) => a - b)) {
    const c = buckets.get(k);
    console.log("  " + String(k).padStart(3) + "°–" + String(k + 15).padStart(3) + "°  " + c.hex +
      "  对档最紧 " + fmt(c.minTier) + "（" + c.whoTier + "）  对全体最紧 " + fmt(c.minAll) + "（" + c.whoAll +
      "） 灰阶 " + String(c.gy).padStart(3) + " 最紧Δ相 " + fmt(c.minH) + " 最紧ΔL* " + fmt(c.minL));
  }
  const probe = process.argv.filter(a => /^#?[0-9a-fA-F]{6}$/.test(a));
  if (probe.length) {
    console.log("\n指定色逐一体检（含**不达标者**，取色留痕用）：");
    for (const p0 of probe) {
      const hex = rgb2hex(hex2rgb(p0));
      console.log("\n  " + hex + " 灰阶 " + gray(hex) + " L* " + fmt(Lstar(hex)) + " C* " + fmt(chroma(hex)) +
        " 相角 " + fmt(hueDeg(hex)) + " 对绢帛 " + fmt(contrast(hex, SILK)) + " 对卡面 " +
        fmt(contrast(hex, SILK_PANEL)) + " 对白 " + fmt(contrast(hex, WHITE)));
      const near = targets.map(t => ({ t, d: dE76(hex, t.hex) })).sort((a, b) => a.d - b.d);
      for (const r of near.slice(0, 8)) {
        console.log("      " + (r.d >= T_DE ? "✓" : "✗") + " " + r.t.name.padEnd(22) + " ΔE " + fmt(r.d) +
          "  Δ相 " + fmt(dHue(hex, r.t.hex), 7) + "°  ΔL* " + fmt(Math.abs(Lstar(hex) - Lstar(r.t.hex)), 6));
      }
    }
  }
}

if (process.argv.includes("--search")) search(); else report();
