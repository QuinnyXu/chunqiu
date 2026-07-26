/* 并观播放·状态机测试（r17b 起；r18 改为「交会常亮·无停拍」语义）
 * ------------------------------------------------------------------
 * 用合成时间步（伪 Δt 序列）驱动 site/app.js 里的【真】统一播放引擎（player/playerFrame），
 * 在每个交会点【点亮帧】断言：两标记当前所在段的 place_id == 交会 place_id（即两标记确在交会地），
 * 且该交会点被点亮（获 .lit）。播放全程不因交会而暂停（holdUntil 已退役）。
 * 基准组合：文姜 P_WENJIANG × 齐襄公 P_QIXIANG（五处交会点：泺·临淄·禚·祝丘·防）。
 *
 * 运行：node tools/test_binguan_play.js   （仅 Node 标准库 + 项目自身 app.js，无第三方依赖）
 * 退出码：全部断言通过=0，任一失败=1。
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "site", "data");

// ---- 极简 DOM 桩：仅够引擎的 render/fire 调用，不引入任何第三方依赖 ----
function fakeEl() {
  const attrs = {};
  const classes = new Set();
  return {
    style: {}, hidden: false, _text: "",
    get textContent() { return this._text; },
    set textContent(v) { this._text = v; },
    setAttribute(k, v) { attrs[k] = String(v); },
    getAttribute(k) { return k in attrs ? attrs[k] : null; },
    removeAttribute(k) { delete attrs[k]; },
    hasAttribute(k) { return k in attrs; },
    classList: { add: (c) => classes.add(c), remove: (...cs) => cs.forEach(c => classes.delete(c)), contains: (c) => classes.has(c) },
    querySelector: () => fakeEl(),
    querySelectorAll: () => [],
  };
}
const elCache = {};
const el = (key) => (elCache[key] || (elCache[key] = fakeEl()));
global.document = { querySelector: (sel) => el(sel), getElementById: (id) => el("#" + id) };
global.requestAnimationFrame = () => 0;   // 引擎自排帧改为本测试手动驱动
global.cancelAnimationFrame = () => {};

const app = require(path.join(ROOT, "site", "app.js"));

// ---- 载入数据 ----
const names = ["people", "events", "event_people", "places", "passages",
               "sources", "background", "archaeology", "relations", "meta"];
const data = {};
for (const n of names) data[n] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, n + ".json"), "utf-8"));
app.loadData(data);
const placeById = Object.fromEntries(data.places.map(p => [p.id, p]));

const A = "P_WENJIANG", B = "P_QIXIANG";
app.cmpComputeModel(A, B);
const cmp = app.cmp;

function expectXY(placeId) {
  const pl = placeById[placeId];
  const [x, y] = app.project(pl.lng, pl.lat);
  return { x, y, name: pl.ancient_name };
}

// 装配两枚假标记（圆 A / 方 B），及【按 place 持久】的假交会环（供 .lit 断言）
cmp.markerA = fakeEl();
cmp.markerB = fakeEl(); cmp.markerB.setAttribute("width", "14");
const ringByPlace = {};
cmp.syncs.forEach(s => { ringByPlace[s.place] = fakeEl(); ringByPlace[s.place].setAttribute("data-place", s.place); });
cmp.svg = {
  classList: { add: () => {}, remove: () => {}, contains: () => false },
  querySelector: (sel) => { const m = /data-place="([^"]+)"/.exec(sel); return m ? ringByPlace[m[1]] || null : null; },
  querySelectorAll: () => [],
};
function markerCenter(elm, isRect) {
  if (isRect) { const s = parseFloat(elm.getAttribute("width")) || 14;
    return { x: parseFloat(elm.getAttribute("x")) + s / 2, y: parseFloat(elm.getAttribute("y")) + s / 2 }; }
  return { x: parseFloat(elm.getAttribute("cx")), y: parseFloat(elm.getAttribute("cy")) };
}

console.log("== 并观状态机测试（r18 常亮·无停拍）：" + A + " × " + B + " ==");
console.log("交会点（按 sc 序）：");
cmp.syncs.forEach(s => console.log("  sc=" + s.idx + "  " + placeById[s.place].ancient_name +
  "(" + s.place + ")  锚年=前" + (-s.year) + "  含" +
  (s.meetings.some(m => m.level === "a") ? "同场" : "") +
  (s.meetings.some(m => m.level === "b") ? "·相邻记载" : "")));

// ---- 用合成 Δt 驱动真引擎 ----
const cfg = app.comparePlayCfg();
let firedThisFrame = null;
cfg.beats.forEach(b => { const orig = b.fire; b.fire = () => { firedThisFrame = b.key; orig(); }; });

app.playerStart(cfg);
const player = app.player;

const EPS = 0.5;
let ts = 1000;
const DT = 40;
let frames = 0, maxYearJump = 0, prevYearForJump = null;
const results = [];
const firedOrder = [];
let pass = true;
const e2sc = (elapsed) => cmp.scMin + (player.dur > 0 ? elapsed / player.dur : 1) * (cmp.scMax - cmp.scMin);

while (true) {
  firedThisFrame = null;
  app.playerFrame(ts);
  frames++;
  // 无停拍连续性：相邻帧年份跳跃应有界（不应出现长时间冻结后的突进）
  const yNow = app.cmpClockYearAt(e2sc(player.elapsed));
  if (prevYearForJump != null) maxYearJump = Math.max(maxYearJump, Math.abs(yNow - prevYearForJump));
  prevYearForJump = yNow;
  if (firedThisFrame != null) {
    const sync = cmp.syncs.find(s => s.idx === firedThisFrame);
    const exp = expectXY(sync.place);
    const cA = markerCenter(cmp.markerA, false);
    const cB = markerCenter(cmp.markerB, true);
    const okA = Math.abs(cA.x - exp.x) < EPS && Math.abs(cA.y - exp.y) < EPS;   // 甲所在段=交会地
    const okB = Math.abs(cB.x - exp.x) < EPS && Math.abs(cB.y - exp.y) < EPS;   // 乙所在段=交会地
    const litNow = ringByPlace[sync.place].classList.contains("lit");           // 该点已点亮
    results.push({ sc: sync.idx, place: sync.place, name: exp.name, year: app.cmpClockYearAt(sync.idx),
                   okA, okB, litNow, cA, cB, exp });
    firedOrder.push(sync.idx);
  }
  if (player.raf === null) break;   // playerFinish 已运行，播放结束
  ts += DT;
  if (frames > 5000) { console.log("!! 帧数超限，疑似未收敛"); pass = false; break; }
}

console.log("\n驱动帧数=" + frames + "，点亮顺序=" + firedOrder.join("→") +
  "，相邻帧最大年跳=" + maxYearJump.toFixed(3) + "（无停拍→有界、无冻结突进）");
console.log("\n各交会点【点亮帧】断言（两标记所在段 place_id == 交会 place_id 且该点点亮）：");
for (const r of results) {
  const ok = r.okA && r.okB && r.litNow;
  if (!ok) pass = false;
  console.log("  " + (ok ? "✓" : "✗") + " sc=" + r.sc + " " + r.name + " 前" + (-Math.round(r.year)) +
    " | 甲(" + r.cA.x.toFixed(1) + "," + r.cA.y.toFixed(1) + ")" + (r.okA ? "在" : "不在") + "交会地" +
    " | 乙(" + r.cB.x.toFixed(1) + "," + r.cB.y.toFixed(1) + ")" + (r.okB ? "在" : "不在") + "交会地" +
    " | 点亮=" + (r.litNow ? "是" : "否"));
}

// 五点必须全部点亮且断言全过；结束后 .lit 常亮留痕
const expectedSyncs = cmp.syncs.map(s => s.idx);
if (!expectedSyncs.every(i => firedOrder.includes(i))) { pass = false; console.log("\n✗ 有交会点未点亮：期望 " + expectedSyncs.join(",") + " 实到 " + firedOrder.join(",")); }
if (results.length !== cmp.syncs.length) { pass = false; console.log("\n✗ 点亮次数 " + results.length + " ≠ 交会点数 " + cmp.syncs.length); }
const allLitAtEnd = cmp.syncs.every(s => ringByPlace[s.place].classList.contains("lit"));
if (!allLitAtEnd) { pass = false; console.log("\n✗ 播放结束后并非全部交会点常亮"); }

console.log("\n结论：" + cmp.syncs.length + " 处交会点，点亮 " + results.length + " 处，" +
  "结束后全部常亮=" + (allLitAtEnd ? "是" : "否") + "，断言全过=" + (pass ? "是" : "否"));
console.log(pass ? "TEST PASS" : "TEST FAIL");
process.exit(pass ? 0 : 1);
