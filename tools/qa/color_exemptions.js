/* 经纬春秋 · 色阶诸门之豁免清单与判法（r61-X 立；所据 team/round61_prompts.md §三十 裁二百三十一 二2）
 *
 * 用于 color_matrix_r24a2.js／color_matrix_r27.js／color_matrix_r28.js／quote_layer_color_r32.js 四门。
 * 此前四门印 ✗ 而恒 exit 0——只报，新撞无人知；r62 列国将增国色，此数门守的正是「新色与旧色是否相撞」。
 *
 * ★ 豁免之法（裁二百三十一 二2）：
 *   · 每一豁免书「对（谁×谁）、所量之值、所据」；**比值而非比名**——以二色之**色值**（hex）定其对，以两位小数之实测值定其量，
 *     值一变（任一色改了值，或量法变了）即不再相合 → 判红，须回此清单改其值并书其由；
 *   · 清单外凡越线者红；清单内之条若在其门之色目中**两色俱在而未见其越线**（值已变、或已不越线）亦红——清单不得默然过时；
 *   · 旧码 r27／r28 以「国名在 KNOWN_WATCH 之集」判既有（比名：齐国日后新增一撞亦被放过），自本件起废，改由此清单比值。
 *
 * ★ 同一色值服务多处用途者（青绿 bronze ≡「拥立」关系线 #44766B；朱砂 ≡「婚姻」#BC4433；「其他」关系线 ≡ 无类关系 #8A8072），
 *   其撞乃同一对色值之撞，故清单按色值对去重；`uses` 列其诸用途，只作注记。
 */
"use strict";

/* 一、国色 × 非国色 ΔE76 < 13.2 之豁免（量表之记实：r24a-2 裁定「本批不改」，记为观察项）
 *   所据：design_notes §2.4（裁定 3 之判据只管国色两两与双底线，不含功能色）、§2.4.2「观察项（本批不改，留痕待日后合并处理）」表，
 *        r27／r28 二轮复核（§2.1.1／§2.1.2 :169／:189「全部是 §2.4.2 已登记的既有观察项」）。 */
const EXEMPT_DE = [
  { a: "#A5322A", an: "齐", b: "#A63A2B", uses: "打赏钮 hover（悬停态）", value: "3.54", basis: "design_notes §2.4.2 观察项（不同屏，噪声项）" },
  { a: "#35706A", an: "郑", b: "#44766B", uses: "青绿 bronze（界面强调）／「拥立」关系线", value: "4.39", basis: "design_notes §2.4、§2.4.1（r24a-2 裁定：动诗歌层一色、不动国色）、§2.4.2 观察项" },
  { a: "#35706A", an: "郑", b: "#3A685D", uses: "资料库返回 hover（悬停态）", value: "5.18", basis: "design_notes §2.4.2 观察项（不同屏，噪声项）" },
  { a: "#97561F", an: "鲁", b: "#A9622B", uses: "「亲属-直系」关系线", value: "5.71", basis: "design_notes §2.4.2 观察项（关系线八色 vs 国色，须重排全套，另一改动面）" },
  { a: "#423C39", an: "秦", b: "#35302A", uses: "「敌对」关系线", value: "6.01", basis: "design_notes §2.4.2 观察项（同上）" },
  { a: "#423C39", an: "秦", b: "#4E4338", uses: "层名注记（图面中性）", value: "6.61", basis: "design_notes §2.4.2 观察项" },
  { a: "#A5322A", an: "齐", b: "#BC4433", uses: "朱砂 cinnabar（界面强调）／「婚姻」关系线", value: "8.14", basis: "design_notes §2.4 表、§2.4.2 观察项（r24a 已报）" },
  { a: "#423C39", an: "秦", b: "#2E2A24", uses: "玄墨 ink（界面基色）", value: "8.83", basis: "design_notes §2.4 表、§2.4.2 观察项（r24a 已报）" },
  { a: "#97561F", an: "鲁", b: "#B4652F", uses: "暖赭 ochre（界面强调）", value: "9.21", basis: "design_notes §2.4 表、§2.4.2 观察项（r24a 已报）" },
];

/* 二、双底线（对绢帛 ≥3.5、对白 ≥4.1）不达之豁免（量表之记实：其色不在裁定 3 双底线之域）
 *   所据：design_notes §2.1 :102 裁定 3——双底线所系者是「国色底白字」（`.person-nav button[aria-current]`），其域为国色；
 *        §2.4「裁定 3 的三条判据只管九国色两两与两条对比底线，不含站内功能色」；
 *        color_matrix_r24a2 原注「界线／年轴刻度等为『面与线』而非正文前景」。
 *   ★ 下列五色俱非国色、非层色、非承字之强调色；其中关系线二色（亲属-同辈、其他）系关系图之边色，
 *     其可辨由线型与图例承担——是否另立「关系线判据」，属 §2.4.2 所记之另一改动面，非本清单所能定。 */
const EXEMPT_CONTRAST = [
  { hex: "#DCD2BC", uses: "界线 line（界面基色，帛书栏线）", silk: "1.29", white: "1.50", basis: "design_notes §2.1 :102 裁定 3 双底线之域只及国色；界线为面与线之构件（§2 色板表「帛书栏线」）" },
  { hex: "#C79E7E", uses: "「亲属-同辈」关系线", silk: "2.09", white: "2.44", basis: "design_notes §2.4 裁定 3 不含功能色；§2.4.2 关系线另为一改动面" },
  { hex: "#8A8072", uses: "「其他」关系线／无类关系（图面中性）", silk: "3.33", white: "3.88", basis: "同上" },
  { hex: "#B8AC90", uses: "年轴刻度（图面中性）", silk: "1.93", white: "2.25", basis: "design_notes §2.1 :102 裁定 3 之域只及国色；刻度为面与线之构件" },
  { hex: "#9A9081", uses: "未生/已卒灰（图面中性）", silk: "2.70", white: "3.14", basis: "同上（时间线／地图之灰显构件，非正文前景）" },
];

const U = (h) => h.toUpperCase();
const f2 = (n) => n.toFixed(2);
const pairKey = (x, y) => [U(x), U(y)].sort().join("|");

/* ΔE 越线之判。under：[{aHex, aName, bHex, bName, d}]（门自量之越线者，可含同值重复）；present：门之色目所含之 hex 集。
 * 返回 { exempt, red, stale }：exempt＝与清单相合（色值对同、两位小数之值同）者；red＝清单外越线者（或其值与清单不合）；
 * stale＝清单之条两色俱在门之色目而未见其越线、或其值已变者。 */
function judgeDE(under, present) {
  const P = new Set([...present].map(U));
  const seen = new Map();
  for (const u of under) {
    const k = pairKey(u.aHex, u.bHex);
    if (!seen.has(k)) seen.set(k, { ...u, names: [u.bName] }); else seen.get(k).names.push(u.bName);
  }
  const exempt = [], red = [], stale = [];
  for (const [k, u] of seen) {
    const e = EXEMPT_DE.find(x => pairKey(x.a, x.b) === k);
    if (e && e.value === f2(u.d)) exempt.push({ e, u });
    else red.push({ u, why: e ? "清单值 " + e.value + "，实测 " + f2(u.d) + "（值已变）" : "清单外" });
  }
  for (const e of EXEMPT_DE) {
    if (!P.has(U(e.a)) || !P.has(U(e.b))) continue;   // 本门之色目不含此对，不适用
    const u = seen.get(pairKey(e.a, e.b));
    if (!u || f2(u.d) !== e.value) stale.push({ e, got: u ? f2(u.d) : "不越线" });
  }
  return { exempt, red, stale };
}

/* 双底线不达之判。dim：[{hex, name, silk, white}]（门自量之不达者，实数）；present：门之色目所含之 hex 集。 */
function judgeContrast(dim, present) {
  const P = new Set([...present].map(U));
  const seen = new Map();
  for (const c of dim) { const k = U(c.hex); if (!seen.has(k)) seen.set(k, c); }
  const exempt = [], red = [], stale = [];
  for (const [k, c] of seen) {
    const e = EXEMPT_CONTRAST.find(x => U(x.hex) === k);
    if (e && e.silk === f2(c.silk) && e.white === f2(c.white)) exempt.push({ e, c });
    else red.push({ c, why: e ? "清单值 " + e.silk + "／" + e.white + "，实测 " + f2(c.silk) + "／" + f2(c.white) + "（值已变）" : "清单外" });
  }
  for (const e of EXEMPT_CONTRAST) {
    if (!P.has(U(e.hex))) continue;
    const c = seen.get(U(e.hex));
    if (!c || f2(c.silk) !== e.silk || f2(c.white) !== e.white) stale.push({ e, got: c ? f2(c.silk) + "／" + f2(c.white) : "已达标" });
  }
  return { exempt, red, stale };
}

/* 计数与退出（0 全过／1 判红／2 本门自身出错：压测不红、或抛错） */
function makeTally() {
  const t = { fails: 0, gateErrs: 0 };
  t.judge = (cond, label) => { if (!cond) t.fails++; console.log("  " + (cond ? "【判·过】" : "【判·红】") + label); return cond; };
  t.pressure = (isRed, label) => {   // 有意之压测（r56 款）：须红，红计为过；不红 → 门自身出错
    if (!isRed) t.gateErrs++;
    console.log("  " + (isRed ? "【压测·如期而红，计为过】" : "【压测·★ 不红：门自身出错】") + label);
  };
  t.exit = () => {
    console.log("\n—— 判红 " + t.fails + "；门自身出错 " + t.gateErrs + " ——");
    process.exit(t.gateErrs ? 2 : t.fails ? 1 : 0);
  };
  return t;
}

function printDE(res, tally, label) {
  for (const x of res.exempt) console.log("    · 豁免 " + x.e.an + " × " + x.e.uses + " ΔE " + x.e.value + "（据 " + x.e.basis + "）");
  for (const x of res.red) console.log("    ✗ " + x.u.aName + " × " + x.u.names.join("／") + " ΔE " + f2(x.u.d) + " —— " + x.why);
  for (const x of res.stale) console.log("    ✗ 清单之条 " + x.e.an + " × " + x.e.uses + " 清单值 " + x.e.value + "，今 " + x.got + " —— 清单已过时，须改其值并书其由");
  tally.judge(res.red.length === 0 && res.stale.length === 0,
    label + "：越线 " + (res.exempt.length + res.red.length) + " 对（按色值对去重），清单内相合 " + res.exempt.length + "、清单外或值变 " + res.red.length + "、清单过时 " + res.stale.length);
}
function printContrast(res, tally, label) {
  for (const x of res.exempt) console.log("    · 豁免 " + x.e.uses + " " + x.e.hex + " 对绢帛 " + x.e.silk + "／对白 " + x.e.white + "（据 " + x.e.basis + "）");
  for (const x of res.red) console.log("    ✗ " + x.c.name + " " + x.c.hex + " 对绢帛 " + f2(x.c.silk) + "／对白 " + f2(x.c.white) + " —— " + x.why);
  for (const x of res.stale) console.log("    ✗ 清单之条 " + x.e.uses + " " + x.e.hex + " 清单值 " + x.e.silk + "／" + x.e.white + "，今 " + x.got + " —— 清单已过时");
  tally.judge(res.red.length === 0 && res.stale.length === 0,
    label + "：不达 " + (res.exempt.length + res.red.length) + " 色（按色值去重），清单内相合 " + res.exempt.length + "、清单外或值变 " + res.red.length + "、清单过时 " + res.stale.length);
}

module.exports = { EXEMPT_DE, EXEMPT_CONTRAST, judgeDE, judgeContrast, makeTally, printDE, printContrast };
