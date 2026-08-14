/* 经纬春秋 · r28：第 11 国色「越」判据全矩阵实算
 *
 * 用途：越国色新立后，对「十一国色 ＋ 全部功能色」做 ΔE76 全矩阵复验，
 *       并实测双底线（对绢帛 #F4EDDF ≥3.5、对白 #FFFFFF ≥4.1）、对功能色逐对核。
 *
 * 口径与 design_notes §2.1 / §2.4 / qi_palette_expansion.md §1.1 一字不差（沿用
 * tools/qa/color_matrix_r24a2.js → r27 的同一套色彩数学，本脚本只扩色目与判据报表）：
 *   - ΔE76 = CIE Lab（D65/2°）欧氏距离；
 *   - 对比度 = WCAG 2.x 相对亮度比 (L1+0.05)/(L2+0.05)；
 *   - 灰阶 = sRGB→线性→WCAG Y→回伽马 ×255。
 * 判据（裁定 3，r27 九→十，r28 十→十一）：国色两两 ΔE76 ≥13.2；对绢帛 ≥3.5；对白 ≥4.1。
 * 对功能色：**逐对核并报数**——既有 11 对（齐/郑/秦/鲁四国所涉）系 r24a-2 裁定的观察项，
 * 本轮不动；**新立之色不得新增任何一对低于 13.2**。
 *
 * 色值一律**从 site/styles.css 与 site/app.js 实读**，脚本内不另抄一份。
 *
 * 用法：
 *   node tools/qa/color_matrix_r28.js            全矩阵复验（默认）
 *   node tools/qa/color_matrix_r28.js --search   第 11 色候选搜索（取色时用）
 *   node tools/qa/color_matrix_r28.js --search '#2E6B3A'  附带指定色逐一体检
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
const gray = (h) => {
  const y = relLum(hex2rgb(h));
  return Math.round(255 * (y <= 0.0031308 ? y * 12.92 : 1.055 * Math.pow(y, 1 / 2.4) - 0.055));
};
function rgb2lab(hex) {
  const [r, g, b] = hex2rgb(hex).map(lin);
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
function hueDeg(hex) {
  const [, a, b] = rgb2lab(hex);
  let d = Math.atan2(b, a) * 180 / Math.PI;
  return (d + 360) % 360;
}
/* 三型色觉模拟（Viénot-Brettel-Mollon 1999 线性 sRGB 矩阵，同 design_notes §2.2） */
const CVD = {
  protan: [[0.11238, 0.88762, 0], [0.07276, 0.92724, 0], [0.00399, -0.00399, 1]],
  deutan: [[0.29275, 0.70725, 0], [0.34557, 0.65443, 0], [-0.02020, 0.02020, 1]],
  tritan: [[1, 0.14461, -0.14461], [0, 0.85924, 0.14076], [0, 0.25164, -0.25164]],
};
function simulate(hex, type) {
  const [r, g, b] = hex2rgb(hex).map(lin);
  const M = CVD[type];
  const out = M.map(row => row[0] * r + row[1] * g + row[2] * b)
    .map(v => Math.max(0, Math.min(1, v)))
    .map(v => 255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));
  return rgb2hex(out);
}

/* ---------- 从源文件实读色值 ---------- */
function cssVar(name, optional) {
  const m = new RegExp("--" + name + "\\s*:\\s*(#[0-9A-Fa-f]{6})").exec(CSS);
  if (!m) {
    if (optional) return null;
    throw new Error("styles.css 中读不到 --" + name + "，请检查变量名（脚本不设兜底色）");
  }
  return m[1];
}
function cssRule(re, label) {
  const m = re.exec(CSS);
  if (!m) throw new Error("styles.css 中读不到「" + label + "」的色值（脚本不设兜底色）");
  return m[1];
}

/* 国色名录与 app.js 的 STATE_FAMILY_VAR 实读对账——两处不同步即报错，不容默默漏一国 */
const FAMILY_FROM_APP = (() => {
  const blk = /const STATE_FAMILY_VAR = \{([\s\S]*?)\};/.exec(APP);
  if (!blk) throw new Error("app.js 中读不到 STATE_FAMILY_VAR");
  const out = [];
  const re = /"([^"]+)":\s*"--([a-z-]+)"/g;
  let m;
  while ((m = re.exec(blk[1]))) out.push([m[1], m[2]]);
  return out;
})();

const STATES = FAMILY_FROM_APP.map(([n, v]) => ({ group: "国色", name: n, hex: cssVar(v) }));

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

const REL = (() => {
  const blk = /const REL_COLORS = \{([\s\S]*?)\};/.exec(APP);
  if (!blk) throw new Error("app.js 中读不到 REL_COLORS");
  const out = [];
  const re = /"([^"]+)":\s*"(#[0-9A-Fa-f]{6})"/g;
  let m;
  while ((m = re.exec(blk[1]))) out.push({ group: "关系线", name: m[1], hex: m[2] });
  return out;
})();

const MISC = [
  { group: "图面中性", name: "层名注记 #4E4338", hex: "#4E4338" },
  { group: "图面中性", name: "年轴刻度 #B8AC90", hex: "#B8AC90" },
  { group: "图面中性", name: "未生/已卒灰 #9A9081", hex: "#9A9081" },
  { group: "图面中性", name: "无类关系 #8A8072", hex: "#8A8072" },
];

const SILK = cssVar("silk"), SILK_PANEL = cssVar("silk-panel"), WHITE = "#FFFFFF";
const NON_STATE = [...FUNCS, ...REL, ...MISC];
const ALL = [...STATES, ...NON_STATE];

/* r24a-2 已裁定的既有观察项（本轮不动）——用于把「既有」与「本轮新增」分开报数 */
const KNOWN_WATCH = new Set(["齐", "郑", "秦", "鲁"]);

const T_DE = 13.2, T_SILK = 3.5, T_WHITE = 4.1;
const fmt = (n, w = 6) => n.toFixed(2).padStart(w);

function report() {
  console.log("=== r28 第 11 国色·越 判据全矩阵（判据：两两 ΔE76 ≥" + T_DE +
              "；对绢帛 ≥" + T_SILK + "；对白 ≥" + T_WHITE + "）===\n");

  console.log("【一】国色清单（" + STATES.length + " 色，名录取 app.js STATE_FAMILY_VAR、色值取 styles.css）");
  console.log("  国   变量色值   灰阶  相角    对绢帛  对白");
  for (const s of STATES) {
    console.log("  " + s.name.padEnd(3) + " " + s.hex + "  " + String(gray(s.hex)).padStart(4) + " " +
      fmt(hueDeg(s.hex), 7) + " " + fmt(contrast(s.hex, SILK)) + " " + fmt(contrast(s.hex, WHITE)));
  }

  console.log("\n【二】国色两两 ΔE76 全矩阵（" + (STATES.length * (STATES.length - 1) / 2) + " 对）");
  const head = "        " + STATES.map(s => s.name.padStart(7)).join("");
  console.log(head);
  for (const a of STATES) {
    let line = "  " + a.name.padEnd(4) + "  ";
    for (const b of STATES) line += (a === b ? "—" : dE76(a.hex, b.hex).toFixed(2)).padStart(7);
    console.log(line);
  }
  const pairs = [];
  for (let i = 0; i < STATES.length; i++) for (let j = i + 1; j < STATES.length; j++) {
    pairs.push({ a: STATES[i].name, b: STATES[j].name, d: dE76(STATES[i].hex, STATES[j].hex) });
  }
  pairs.sort((x, y) => x.d - y.d);
  const fail = pairs.filter(p => p.d < T_DE);
  console.log("\n  最紧三对：" + pairs.slice(0, 3).map(p => p.a + "×" + p.b + " " + p.d.toFixed(2)).join("、"));
  console.log("  低于判据 " + T_DE + " 者：" + fail.length + " 对" +
    (fail.length ? "（" + fail.map(p => p.a + "×" + p.b + " " + p.d.toFixed(2)).join("、") + "）" : "") +
    (fail.length ? "  ✗" : "  ✓"));

  console.log("\n【三】双底线逐色实测（判据 对绢帛 ≥" + T_SILK + "、对白 ≥" + T_WHITE + "）");
  let minSilk = { v: Infinity }, minWhite = { v: Infinity };
  for (const s of STATES) {
    const cs = contrast(s.hex, SILK), cw = contrast(s.hex, WHITE);
    if (cs < minSilk.v) minSilk = { v: cs, n: s.name };
    if (cw < minWhite.v) minWhite = { v: cw, n: s.name };
    const bad = (cs < T_SILK || cw < T_WHITE) ? " ✗" : "";
    console.log("  " + s.name.padEnd(3) + " 对绢帛 " + fmt(cs) + " 对白 " + fmt(cw) +
      " 对绢帛面板 " + fmt(contrast(s.hex, SILK_PANEL)) + bad);
  }
  console.log("  → 最低 对绢帛 " + fmt(minSilk.v) + "（" + minSilk.n + "）、对白 " +
    fmt(minWhite.v) + "（" + minWhite.n + "）");

  console.log("\n【四】国色 × 全部非国色 " + NON_STATE.length + " 项，逐对核（只列 < " + T_DE + " 者，并注既有/新增）");
  const under = [];
  for (const s of STATES) {
    for (const c of NON_STATE) {
      const d = dE76(s.hex, c.hex);
      if (d < T_DE) under.push({ s: s.name, c, d });
    }
  }
  under.sort((a, b) => a.d - b.d);
  for (const u of under) {
    const tag = KNOWN_WATCH.has(u.s) ? "既有观察项（r24a-2 裁定不动）" : "★本轮新增——不可接受";
    console.log("  " + u.s + " × " + u.c.name + "（" + u.c.group + "） ΔE " + fmt(u.d) + "  " + tag);
  }
  const fresh = under.filter(u => !KNOWN_WATCH.has(u.s));
  console.log("  → 共 " + under.length + " 对低于 " + T_DE + "，其中本轮新立之国所涉 " + fresh.length + " 对" +
    (fresh.length ? "  ✗" : "  ✓"));

  const NEW = STATES[STATES.length - 1];
  console.log("\n【五】新立之色 " + NEW.name + " " + NEW.hex + " 对全体 " + (ALL.length - 1) + " 项，最近十项");
  const near = ALL.filter(c => c !== NEW).map(c => ({ c, d: dE76(NEW.hex, c.hex) })).sort((a, b) => a.d - b.d);
  for (const r of near.slice(0, 10)) {
    console.log("  " + (r.d >= T_DE ? "✓" : "✗") + " " + r.c.group.padEnd(9) + " " +
      r.c.name.padEnd(22) + " " + r.c.hex + " ΔE " + fmt(r.d));
  }

  console.log("\n【六】旁通道记实（三型色觉模拟与灰度轴，非判据，见 design_notes §2.2 物理不可能证明）");
  for (const type of ["protan", "deutan", "tritan"]) {
    const ps = [];
    for (let i = 0; i < STATES.length; i++) for (let j = i + 1; j < STATES.length; j++) {
      ps.push({ a: STATES[i].name, b: STATES[j].name, d: dE76(simulate(STATES[i].hex, type), simulate(STATES[j].hex, type)) });
    }
    ps.sort((x, y) => x.d - y.d);
    const NEWN = STATES[STATES.length - 1].name;
    const mine = ps.filter(p => p.d < T_DE && (p.a === NEWN || p.b === NEWN));
    console.log("  " + type.padEnd(7) + " 低于 " + T_DE + " 者 " + ps.filter(p => p.d < T_DE).length + "/" + ps.length +
      "；最紧三对 " + ps.slice(0, 3).map(p => p.a + "×" + p.b + " " + p.d.toFixed(2)).join("、") +
      "；其中涉新立之「" + NEWN + "」者 " + mine.length + " 对" +
      (mine.length ? "（" + mine.map(p => p.a + "×" + p.b + " " + p.d.toFixed(2)).join("、") + "）" : ""));
  }
  const grays = STATES.map(s => ({ n: s.name, g: gray(s.hex) })).sort((a, b) => a.g - b.g);
  console.log("  灰阶序列：" + grays.map(x => x.n + x.g).join(" / "));
}

/* ---------- 第 11 色候选搜索 ----------
 * r28 增三个可选参数，用于在**意象已定**（会稽山水＝绿相带）之后于该带内精搜，
 * 而非只看「全域最优」——全域最优往往落在观感不可用处（如 R 通道近 0 的荧光青、
 * 或灰阶贴 45 下限的近黑绿）。三参数皆只**收紧**筛选，不放宽任何硬判据：
 *   --band=lo,hi   只留相角落在 [lo,hi] 者（度）
 *   --gray=lo,hi   只留灰阶落在 [lo,hi] 者（须为 [45,125] 的子区间）
 *   --floor=N      三通道下限（r27 取 R=22 换回观感之例的一般化，默认 8）
 *   --step=N       网格步长（默认 3；精搜取 1）
 *   --chroma=lo,hi 彩度带（默认 12,46；收紧上限即避开「艳到不像帛书」的高饱和解）
 */
function argVal(name) {
  const a = process.argv.find(x => x.startsWith("--" + name + "="));
  return a ? a.slice(name.length + 3) : null;
}
function search() {
  const base = STATES.filter(s => s.name !== "越");
  const targets = [...base, ...NON_STATE];
  const band = (argVal("band") || "").split(",").map(Number);
  const gband = (argVal("gray") || "").split(",").map(Number);
  const FLOOR = Number(argVal("floor") || 8);
  const STEP = Number(argVal("step") || 3);
  const GLO = gband.length === 2 && !isNaN(gband[0]) ? Math.max(45, gband[0]) : 45;
  const GHI = gband.length === 2 && !isNaN(gband[1]) ? Math.min(125, gband[1]) : 125;
  const cband = (argVal("chroma") || "").split(",").map(Number);
  const CLO = cband.length === 2 && !isNaN(cband[0]) ? Math.max(12, cband[0]) : 12;
  const CHI = cband.length === 2 && !isNaN(cband[1]) ? Math.min(46, cband[1]) : 46;
  const cand = [];
  for (let r = FLOOR; r <= 210; r += STEP) for (let g = FLOOR; g <= 210; g += STEP) for (let b = FLOOR; b <= 210; b += STEP) {
    const hex = rgb2hex([r, g, b]);
    if (contrast(hex, SILK) < T_SILK || contrast(hex, WHITE) < T_WHITE) continue;
    const gy = gray(hex);
    if (gy < GLO || gy > GHI) continue;            // §2.2 可用灰阶带 [45,125]（可再收紧）
    if (band.length === 2 && !isNaN(band[0])) {
      const h = hueDeg(hex);
      if (h < band[0] || h > band[1]) continue;
    }
    let minState = Infinity, whoState = "";
    for (const t of base) {
      const d = dE76(hex, t.hex);
      if (d < minState) { minState = d; whoState = t.name; }
      if (minState < T_DE) break;
    }
    if (minState < T_DE) continue;                 // 硬判据：对既有十国色
    let minAll = minState, whoAll = whoState;
    for (const t of NON_STATE) {
      const d = dE76(hex, t.hex);
      if (d < minAll) { minAll = d; whoAll = t.name; }
    }
    const [L, A, B] = rgb2lab(hex);
    const chroma = Math.hypot(A, B);
    if (chroma < CLO || chroma > CHI) continue;    // 克制的中彩度带
    cand.push({ hex, minState, whoState, minAll, whoAll, hue: hueDeg(hex), L, chroma, gy });
  }
  cand.sort((a, b) => b.minAll - a.minAll);
  console.log("=== 第 11 国色候选搜索（硬判据：对既有十国色 ΔE76 ≥" + T_DE +
              "；双底线；灰阶 [45,125]；彩度 12–46；3 步长网格）===");
  console.log("共 " + cand.length + " 个候选。\n");
  const clear = cand.filter(c => c.minAll >= T_DE);
  console.log("其中「对全部非国色亦 ≥" + T_DE + "」者 " + clear.length + " 个。按对全体最紧距离降序取前 30：\n");
  console.log("  色值      对国色最紧   最近国  对全体最紧  最近者                 相角    L*     C*   灰阶");
  for (const c of clear.slice(0, 30)) {
    console.log("  " + c.hex + " " + fmt(c.minState) + "  " + c.whoState.padEnd(5) + " " +
      fmt(c.minAll) + "  " + c.whoAll.padEnd(22) + fmt(c.hue) + " " + fmt(c.L) + " " + fmt(c.chroma) +
      String(c.gy).padStart(5));
  }
  const buckets = new Map();
  for (const c of clear) {
    const k = Math.floor(c.hue / 15) * 15;
    if (!buckets.has(k) || buckets.get(k).minAll < c.minAll) buckets.set(k, c);
  }
  console.log("\n可用色相区间（每 15° 一桶，列该桶内对全体最紧距离最大者）：");
  for (const k of [...buckets.keys()].sort((a, b) => a - b)) {
    const c = buckets.get(k);
    console.log("  " + String(k).padStart(3) + "°–" + String(k + 15).padStart(3) + "°  " + c.hex +
      "  对全体最紧 " + fmt(c.minAll) + "（" + c.whoAll + "） 灰阶 " + String(c.gy).padStart(3));
  }
  const probe = process.argv.filter(a => /^#?[0-9a-fA-F]{6}$/.test(a));
  if (probe.length) {
    console.log("\n指定色逐一体检：");
    for (const p0 of probe) {
      const hex = rgb2hex(hex2rgb(p0));
      const near = targets.map(t => ({ t, d: dE76(hex, t.hex) })).sort((a, b) => a.d - b.d);
      console.log("  " + hex + " 灰阶 " + gray(hex) + " 相角 " + fmt(hueDeg(hex)) +
        " 对绢帛 " + fmt(contrast(hex, SILK)) + " 对白 " + fmt(contrast(hex, WHITE)));
      for (const r of near.slice(0, 6)) {
        console.log("      " + (r.d >= T_DE ? "✓" : "✗") + " " + r.t.name.padEnd(22) + " ΔE " + fmt(r.d));
      }
    }
  }
}

if (process.argv.includes("--search")) search();
else report();
