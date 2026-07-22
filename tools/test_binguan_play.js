/* 并观播放·状态机测试（r17b 新增，弥补「测了检测器没测动画」的盲区）
 * ------------------------------------------------------------------
 * 用合成时间步（伪 Δt 序列）驱动 site/app.js 里的【真】统一播放引擎（player/playerFrame），
 * 在每个交会锚（beat）触发帧断言两标记当前位置＝交会地坐标——即「主钟到交会刻 ⇔ 两人到交会地」。
 * 基准组合：文姜 P_WENJIANG × 齐襄公 P_QIXIANG（五处交会锚：泺·临淄·禚·祝丘·防）。
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
    style: {},
    hidden: false,
    _text: "",
    get textContent() { return this._text; },
    set textContent(v) { this._text = v; },
    setAttribute(k, v) { attrs[k] = String(v); },
    getAttribute(k) { return k in attrs ? attrs[k] : null; },
    removeAttribute(k) { delete attrs[k]; },
    hasAttribute(k) { return k in attrs; },
    classList: {
      add: (c) => classes.add(c),
      remove: (...cs) => cs.forEach(c => classes.delete(c)),
      contains: (c) => classes.has(c),
    },
    querySelector: () => fakeEl(),
    _attrs: attrs,
  };
}
const elCache = {};
const el = (key) => (elCache[key] || (elCache[key] = fakeEl()));
global.document = {
  querySelector: (sel) => el(sel),
  getElementById: (id) => el("#" + id),
};
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

// 交会地期望坐标（由投影公式独立算出，与引擎的 sync.x/y 对照）
function expectXY(placeId) {
  const pl = placeById[placeId];
  const [x, y] = app.project(pl.lng, pl.lat);
  return { x, y, name: pl.ancient_name };
}

// 装配两枚假标记（圆 A / 方 B），接引擎写入
cmp.markerA = fakeEl();
cmp.markerB = fakeEl(); cmp.markerB.setAttribute("width", "14");
cmp.svg = { querySelector: () => fakeEl() };
function markerCenter(elm, isRect) {
  if (isRect) { const s = parseFloat(elm.getAttribute("width")) || 14;
    return { x: parseFloat(elm.getAttribute("x")) + s / 2, y: parseFloat(elm.getAttribute("y")) + s / 2 }; }
  return { x: parseFloat(elm.getAttribute("cx")), y: parseFloat(elm.getAttribute("cy")) };
}

console.log("== 并观状态机测试：" + A + " × " + B + " ==");
console.log("交会锚（syncs，按 sc 序）：");
cmp.syncs.forEach(s => console.log("  sc=" + s.idx + "  " + (placeById[s.place].ancient_name) +
  "(" + s.place + ")  锚年=前" + (-s.year) + "  含" +
  (s.meetings.some(m => m.level === "a") ? "同场" : "") +
  (s.meetings.some(m => m.level === "b") ? "·相邻记载" : "")));

// ---- 用合成 Δt 驱动真引擎 ----
const cfg = app.comparePlayCfg();
// 包裹每个 beat.fire 记录「本帧触发了哪个 sync」
let firedThisFrame = null;
cfg.beats.forEach(b => { const orig = b.fire; b.fire = () => { firedThisFrame = b.key; orig(); }; });

app.playerStart(cfg);          // 内部 render(0) + requestAnimationFrame(no-op)
const player = app.player;

const EPS = 0.5;               // 像素容差
let ts = 1000;                 // 合成时钟起点
const DT = 40;                 // 伪 Δt（ms/帧）——不均匀也可，此处等步长足矣
let frames = 0;
const results = [];            // 每个 beat 帧的断言结果
const firedOrder = [];
let pass = true;

while (true) {
  firedThisFrame = null;
  app.playerFrame(ts);              // 手动喂合成 ts；引擎内 requestAnimationFrame 为 no-op
  frames++;
  if (firedThisFrame != null) {     // 本帧命中某交会锚（beat）→ 断言两标记落位
    const sync = cmp.syncs.find(s => s.idx === firedThisFrame);
    const exp = expectXY(sync.place);
    const cA = markerCenter(cmp.markerA, false);
    const cB = markerCenter(cmp.markerB, true);
    const okA = Math.abs(cA.x - exp.x) < EPS && Math.abs(cA.y - exp.y) < EPS;
    const okB = Math.abs(cB.x - exp.x) < EPS && Math.abs(cB.y - exp.y) < EPS;
    results.push({ sc: sync.idx, place: sync.place, name: exp.name, year: app.cmpClockYearAt(sync.idx),
                   okA, okB, cA, cB, exp });
    firedOrder.push(sync.idx);
  }
  if (player.raf === null) break;   // playerFinish 已运行（引擎收尾），播放结束
  ts += DT;
  if (frames > 5000) { console.log("!! 帧数超限，疑似未收敛"); pass = false; break; }
}

// ---- 汇总断言 ----
console.log("\n驱动帧数=" + frames + "，触发交会锚序=" + firedOrder.join("→"));
console.log("\n交会锚触发帧断言（两标记须同在交会地）：");
for (const r of results) {
  const tag = (r.okA && r.okB) ? "✓" : "✗";
  if (!(r.okA && r.okB)) pass = false;
  console.log("  " + tag + " sc=" + r.sc + " " + r.name + " 前" + (-Math.round(r.year)) +
    " | 甲(" + r.cA.x.toFixed(1) + "," + r.cA.y.toFixed(1) + ")" + (r.okA ? "在" : "不在") + "交会地" +
    " | 乙(" + r.cB.x.toFixed(1) + "," + r.cB.y.toFixed(1) + ")" + (r.okB ? "在" : "不在") + "交会地" +
    " | 交会地(" + r.exp.x.toFixed(1) + "," + r.exp.y.toFixed(1) + ")");
}

// 五处交会锚必须全部触发且全部断言通过
const expectedSyncs = cmp.syncs.map(s => s.idx);
const allFired = expectedSyncs.every(i => firedOrder.includes(i));
if (!allFired) { pass = false; console.log("\n✗ 有交会锚未触发：期望 " + expectedSyncs.join(",") + " 实到 " + firedOrder.join(",")); }
if (results.length !== cmp.syncs.length) { pass = false; console.log("\n✗ 触发锚数 " + results.length + " ≠ 交会锚数 " + cmp.syncs.length); }

console.log("\n结论：" + cmp.syncs.length + " 处交会锚，触发 " + results.length + " 处，" +
  "断言全过=" + (pass ? "是" : "否"));
console.log(pass ? "TEST PASS" : "TEST FAIL");
process.exit(pass ? 0 : 1);
