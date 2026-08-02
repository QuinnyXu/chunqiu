"use strict";
// r24a Vision 自验：国色制换血（九国色定调／个人色退役）＋并观线型与交互重构
// ＋全屏控件移位＋§9.3 全景徽记可辨性＋政制图标＋子产首秀＋27 主角回归
const http = require("http"), fs = require("fs"), path = require("path");
const SITE_DIR = path.resolve(__dirname, "..", "..", "site");
const OUT = path.resolve(__dirname, "screenshots");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
function srv(root) { return new Promise((res, rej) => { const s = http.createServer((rq, rs) => { let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]); if (u === "/") u = "/index.html"; const fp = path.join(root, u); if (!fp.startsWith(root)) { rs.writeHead(403); rs.end(); return; } fs.readFile(fp, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(fp).toLowerCase()] || "application/octet-stream" }); rs.end(d); }); }); s.on("error", rej); s.listen(0, "127.0.0.1", () => res(s)); }); }
const log = [];
const say = (...a) => { const s = a.join(" "); log.push(s); console.log(s); };
const H = (t) => say("\n===== " + t + " =====");
const OK = (c, t) => say((c ? "  [OK]   " : "  [FAIL] ") + t);

const STATE_HEX = { "齐": "#A5322A", "鲁": "#97561F", "郑": "#35706A", "晋": "#74402C", "秦": "#423C39", "楚": "#5E2B45", "卫": "#2F5480", "宋": "#4F457F", "陈": "#3B6A48" };

(async () => {
  const pw = require("playwright");
  const baseURL = process.env.QA_BASE_URL || null;
  let s = null, origin = baseURL;
  if (!origin) { s = await srv(SITE_DIR); origin = `http://127.0.0.1:${s.address().port}`; say("本地服务器：" + origin); }
  else say("真机 QA_BASE_URL：" + origin);
  const b = await pw.chromium.launch();
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2,
    extraHTTPHeaders: { "Cache-Control": "no-cache", "Pragma": "no-cache" } });
  await c.route("**/*.{js,css,json,svg}", r => r.continue({ headers: { ...r.request().headers(), "Cache-Control": "no-cache" } }));
  await c.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) { } });
  const p = await c.newPage(); const errs = [];
  p.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
  const warns = [];
  p.on("console", m => { if (m.type() === "warning" || m.type() === "error") warns.push(m.type() + ": " + m.text()); });

  // ---------- 0) 启动：27 主角注册、九国色读入、个人色变量确已消失 ----------
  H("0) 国色制启动自检（27 主角 / 九国色 / --p-* 已退役）");
  await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(1000);
  const boot = await p.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const hex = (s) => { s = (s || "").trim(); const m = s.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/); return m ? "#" + [1, 2, 3].map(i => (+m[i]).toString(16).padStart(2, "0")).join("").toUpperCase() : s.toUpperCase(); };
    return {
      n: PROTAGONISTS.length,
      people: PROTAGONISTS.map(m => ({ id: m.id, name: (PEOPLE[m.id] || {}).name || m.fallback,
        state: (PEOPLE[m.id] || {}).state, key: PEOPLE[m.id] ? panoStateKey(PEOPLE[m.id]) : null,
        color: hex(m.color), badge: m.badge, inData: !!PEOPLE[m.id] })),
      // 26 个退役个人色变量必须全部读不到值
      retired: ["wenjiang", "qixiang", "qihuan", "qixi", "guanzhong", "baoshuya", "luyin", "luhuan",
        "luzhuang", "caogui", "zhengzhuang", "zhengzhao", "wujiang", "jizhong", "jinwen", "liji",
        "jiezhitui", "qinmu", "muji", "chucheng", "chuzhuang", "xigui", "zhuangjiang", "xuanjiang",
        "songxiang", "xiaji"].filter(k => cs.getPropertyValue("--p-" + k).trim() !== ""),
      states: Object.fromEntries(Object.entries(STATE_FAMILY_VAR).map(([k, v]) => [k, hex(cs.getPropertyValue(v))])),
    };
  });
  say("  主角数：" + boot.n);
  OK(boot.n === 27, "PROTAGONISTS 共 27 位（r23b 子产已入册）");
  OK(boot.retired.length === 0, "26 个 --p-* 个人色变量已全数退役（残留：" + (boot.retired.join(",") || "无") + "）");
  let colorOk = true;
  for (const m of boot.people) {
    const want = STATE_HEX[m.key];
    const good = m.inData && want && m.color === want;
    if (!good) { colorOk = false; say("    ✗ " + m.name + " key=" + m.key + " color=" + m.color + " want=" + want + " inData=" + m.inData); }
  }
  OK(colorOk, "27 人主题色全部等于其所属国的国色");
  let stateOk = true;
  for (const [k, want] of Object.entries(STATE_HEX)) { if (boot.states[k] !== want) { stateOk = false; say("    ✗ " + k + " = " + boot.states[k] + " want " + want); } }
  OK(stateOk, "九国色变量值与 design_notes §2.1 定调表一致");
  const zichan = boot.people.find(x => x.id === "P_ZICHAN");
  OK(!!zichan && zichan.inData && zichan.color === "#35706A", "子产在册、有数据、着郑色 #35706A");

  // 每国抽一人，记录其国色分布
  const byState = {};
  for (const m of boot.people) { (byState[m.key] = byState[m.key] || []).push(m.name); }
  for (const k of Object.keys(STATE_HEX)) say("  " + k + "（" + STATE_HEX[k] + "，" + (byState[k] || []).length + " 人）：" + (byState[k] || []).join("、"));

  // ---------- 1) 单人轨迹「一律不动」核验（裁定 1a 首条）----------
  H("1) 单人地图轨迹样式零改动（文姜）");
  await p.goto(origin + "/#/p/P_WENJIANG/map", { waitUntil: "load" }); await p.waitForTimeout(900);
  const solo = await p.evaluate(() => {
    const t = document.querySelector("#map-canvas polyline.traj");
    return t ? { dash: t.getAttribute("stroke-dasharray"), w: t.getAttribute("stroke-width"),
                 cap: t.getAttribute("stroke-linecap"), stroke: t.getAttribute("stroke") } : null;
  });
  say("  单人轨迹：" + JSON.stringify(solo));
  OK(solo && solo.dash === "6 5" && solo.w === "2" && !solo.cap, "单人轨迹仍为长划虚线 6 5 / 宽 2 / 无圆帽（与 r23b 一致）");
  await p.screenshot({ path: path.join(OUT, "r24a_01_solo_map.png") });

  // ---------- 2) 并观线型：同国对 文姜 × 齐襄公 ----------
  H("2) 并观双轨线型（同国对 文姜×齐襄公，裁定 1a）");
  await p.goto(origin + "/#compare=P_WENJIANG,P_QIXIANG", { waitUntil: "load" }); await p.waitForTimeout(1100);
  const duo = await p.evaluate(() => {
    const ls = [...document.querySelectorAll("#cmp-canvas polyline")];
    return {
      tracks: ls.map(l => ({ dash: l.getAttribute("stroke-dasharray"), w: l.getAttribute("stroke-width"),
                             cap: l.getAttribute("stroke-linecap"), stroke: l.getAttribute("stroke") })),
      sameColor: cmp.colorA === cmp.colorB, colorA: cmp.colorA, colorB: cmp.colorB,
      legend: document.querySelector("#cmp-legend").innerText.replace(/\s+/g, " "),
      legendLines: document.querySelectorAll("#cmp-legend svg.cmp-lg-line").length,
      note: document.querySelector("#view-compare .map-note").innerText.replace(/\s+/g, " "),
      playText: document.querySelector("#cmp-play").textContent,
      swapGone: !document.querySelector("#cmp-swap"),
      addBtn: (document.querySelector("#cmp-btn-compare") || {}).textContent,
    };
  });
  say("  甲轨：" + JSON.stringify(duo.tracks[0]));
  say("  乙轨：" + JSON.stringify(duo.tracks[1]));
  say("  图例：" + duo.legend);
  say("  图注：" + duo.note);
  OK(duo.sameColor, "同国对确为同色（" + duo.colorA + "），区分须由线型承担");
  OK(duo.tracks[0] && duo.tracks[0].dash === "6 5", "甲轨＝长划线 6 5（与单人同式）");
  OK(duo.tracks[1] && duo.tracks[1].dash === "0.5 8" && duo.tracks[1].cap === "round", "乙轨＝珠点线 0.5 8 ＋圆线帽");
  OK(duo.legendLines === 2, "图例含两枚线样（甲·长划／乙·珠点）");
  OK(/甲 · 长划/.test(duo.legend) && /乙 · 珠点/.test(duo.legend), "图例已标注两式名");
  OK(/长划线＋圆点/.test(duo.note) && /珠点线＋方点/.test(duo.note), "图注已改写为线型＋端点两重说明");
  OK(duo.playText === "▶ 轨迹按时间播放", "并观播放按钮文案与单人统一");
  OK(duo.swapGone, "「⇄ 对调」按钮已退役");
  OK(/添加对照人物/.test(duo.addBtn || ""), "并观工具条常驻「＋ 添加对照人物」");
  await p.screenshot({ path: path.join(OUT, "r24a_02_compare_color.png") });
  // 灰度截图（验收判据：灰度下双轨肉眼立辨）
  await p.evaluate(() => { document.documentElement.style.filter = "grayscale(1)"; });
  await p.waitForTimeout(250);
  await p.screenshot({ path: path.join(OUT, "r24a_03_compare_GRAY.png") });
  const clip = await p.evaluate(() => { const e = document.querySelector("#cmp-frame"); const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  await p.screenshot({ path: path.join(OUT, "r24a_04_compare_GRAY_map.png"), clip });
  await p.evaluate(() => { document.documentElement.style.filter = ""; });

  // ---------- 3) 开关式选人：加入 / 换人 / 移出回单人 ----------
  H("3) 开关式选人面板往返（裁定 1b）");
  await p.goto(origin + "/#/p/P_WENJIANG/map", { waitUntil: "load" }); await p.waitForTimeout(800);
  await p.click("#btn-compare"); await p.waitForTimeout(250);
  const pick1 = await p.evaluate(() => ({
    n: document.querySelectorAll("#compare-pick .cmp-pick-item").length,
    on: [...document.querySelectorAll("#compare-pick .cmp-pick-item.on")].map(e => e.innerText.trim()),
  }));
  say("  单人态面板：" + pick1.n + " 项，选中 " + JSON.stringify(pick1.on));
  OK(pick1.n === 26 && pick1.on.length === 0, "单人态：列其余 26 人、无选中态");
  await p.screenshot({ path: path.join(OUT, "r24a_05_picker_single.png") });
  // 点齐襄公 → 加入并观
  await p.evaluate(() => { [...document.querySelectorAll("#compare-pick .cmp-pick-item")].find(e => /齐襄公/.test(e.innerText)).click(); });
  await p.waitForTimeout(900);
  const afterAdd = await p.evaluate(() => ({ hash: location.hash, view: state.view }));
  say("  加入后：" + JSON.stringify(afterAdd));
  OK(afterAdd.hash === "#compare=P_WENJIANG,P_QIXIANG" && afterAdd.view === "compare", "点选即加入并观，甲＝当前页主人物");
  // 并观态开面板：当前乙应带选中态
  await p.click("#cmp-btn-compare"); await p.waitForTimeout(250);
  const pick2 = await p.evaluate(() => ({
    on: [...document.querySelectorAll("#cmp-compare-pick .cmp-pick-item.on")].map(e => e.innerText.trim()),
    checked: [...document.querySelectorAll("#cmp-compare-pick .cmp-pick-item")].filter(e => e.getAttribute("aria-checked") === "true").length,
  }));
  say("  并观态面板选中：" + JSON.stringify(pick2));
  OK(pick2.on.length === 1 && /齐襄公/.test(pick2.on[0]) && pick2.checked === 1, "并观态：当前乙带选中态（aria-checked=true）");
  await p.screenshot({ path: path.join(OUT, "r24a_06_picker_compare.png") });
  // 点另一人 → 直接换乙
  await p.evaluate(() => { [...document.querySelectorAll("#cmp-compare-pick .cmp-pick-item")].find(e => /齐桓公/.test(e.innerText)).click(); });
  await p.waitForTimeout(800);
  const afterSwitch = await p.evaluate(() => location.hash);
  say("  换乙后：" + afterSwitch);
  OK(afterSwitch === "#compare=P_WENJIANG,P_QIHUAN", "点另一人即换乙，甲不变");
  // 再点当前乙 → 移出、回单人
  await p.click("#cmp-btn-compare"); await p.waitForTimeout(250);
  await p.evaluate(() => { [...document.querySelectorAll("#cmp-compare-pick .cmp-pick-item.on")][0].click(); });
  await p.waitForTimeout(800);
  const afterOut = await p.evaluate(() => ({ hash: location.hash, view: state.view }));
  say("  移出后：" + JSON.stringify(afterOut));
  OK(afterOut.view === "map" && /P_WENJIANG/.test(afterOut.hash), "再点当前乙即移出，自动回单人地图");

  // ---------- 4) 全屏播放控件移位 + 站点卡零遮挡（手机）----------
  H("4) 全屏播放控件移位（左上·关闭钮之下）与站点卡遮挡实测");
  const mob = await c.newPage();
  await mob.setViewportSize({ width: 390, height: 780 });
  await mob.goto(origin + "/#/p/P_WENJIANG/map", { waitUntil: "load" }); await mob.waitForTimeout(900);
  await mob.click("#btn-zoom"); await mob.waitForTimeout(500);
  await mob.click("#ov-play"); await mob.waitForTimeout(700);
  const geo = await mob.evaluate(() => {
    const g = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), b: Math.round(r.bottom) }; };
    return { ov: g("#overlay-controls"), btn: g("#ov-play"), close: g("#btn-overlay-close"), bar: g(".map-overlay-bar"), vh: innerHeight, vw: innerWidth };
  });
  say("  控件盒：" + JSON.stringify(geo.ov) + "  按钮：" + JSON.stringify(geo.btn));
  say("  顶部条：" + JSON.stringify(geo.bar) + "  关闭钮：" + JSON.stringify(geo.close));
  OK(geo.btn && geo.btn.h >= 44, "播放按钮热区高 " + (geo.btn && geo.btn.h) + "px ≥44px");
  OK(geo.ov && geo.ov.y < geo.vh / 2, "控件已在上半屏（y=" + (geo.ov && geo.ov.y) + "，视口高 " + geo.vh + "）");
  OK(geo.ov && geo.bar && geo.ov.y >= geo.bar.b, "控件在顶部条（含关闭钮）之下，无重叠");
  await mob.screenshot({ path: path.join(OUT, "r24a_07_mobile_fs_play.png") });
  /* 站点卡遮挡实测。
   * ⚠ 先记一条实测事实：app.js 锚点 open() 内有 `if (player.raf) return;`——
   *   **播放进行中站点卡根本不会打开**（r18 起的既有行为：播放期间画面聚焦地图）。
   *   故任务书「手机全屏播放中弹出任意站点卡」的字面状态在现行产品行为下不可达；
   *   真正可达、也正是网友遇到遮挡的状态是「全屏播放态下按暂停 → 点站点卡」——
   *   控件在播放/暂停两态位置完全相同（.overlay-controls 的显隐只看按钮 disabled），
   *   故此处按可达状态测，并同时记录「播放中卡片不开」这一事实，不含糊过去。 */
  const anchorN = await mob.evaluate(() => document.querySelectorAll("#map-overlay-body g.anchor").length);
  const playingBlocks = await mob.evaluate(async () => {
    const a = document.querySelector("#map-overlay-body g.anchor");
    a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    await new Promise(r => setTimeout(r, 200));
    const d = document.querySelector("#place-drawer");
    return { playing: !!(typeof player !== "undefined" && player.raf), drawerOpen: !!(d && !d.hidden) };
  });
  say("  全屏内锚点数：" + anchorN + "；播放中点锚点：" + JSON.stringify(playingBlocks));
  OK(playingBlocks.playing && !playingBlocks.drawerOpen,
     "（记实）播放进行中站点卡不打开——app.js 既有行为 `if (player.raf) return`，非本轮改动");
  await mob.click("#ov-play"); await mob.waitForTimeout(400);   // 暂停：进入可开卡的可达状态
  const pausedState = await mob.evaluate(() => ({ raf: !!(player && player.raf), txt: document.querySelector("#ov-play").textContent }));
  say("  暂停后：" + JSON.stringify(pausedState));
  const opened = await mob.evaluate(async () => {
    const as = [...document.querySelectorAll("#map-overlay-body g.anchor")];
    for (const a of as) {                       // 逐个试，直到抽屉真开
      a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      await new Promise(r => setTimeout(r, 160));
      const d = document.querySelector("#place-drawer");
      if (d && !d.hidden) return { ok: true, title: (document.querySelector("#drawer-title") || {}).textContent };
    }
    return { ok: false, tried: as.length };
  });
  await mob.waitForTimeout(500);
  const overlapInfo = await mob.evaluate(() => {
    const g = (s) => { const e = document.querySelector(s); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: Math.round(r.width), h: Math.round(r.height), r: r.right, b: r.bottom }; };
    const ov = g("#overlay-controls"), dr = g("#place-drawer");
    if (!ov || !dr) return { ov, dr, overlap: null };
    const ox = Math.max(0, Math.min(ov.r, dr.r) - Math.max(ov.x, dr.x));
    const oy = Math.max(0, Math.min(ov.b, dr.b) - Math.max(ov.y, dr.y));
    return { ov, dr, overlap: Math.round(ox * oy), drTop: Math.round(dr.y), ovBottom: Math.round(ov.b) };
  });
  say("  站点卡：" + JSON.stringify(opened) + "；抽屉盒：" + JSON.stringify(overlapInfo.dr));
  OK(opened.ok, "全屏（播放态·暂停）确已弹出站点卡「" + (opened.title || "") + "」——本项不空过");
  OK(opened.ok && overlapInfo.overlap === 0,
     "站点卡与播放控件重叠面积 = " + overlapInfo.overlap + " px²（控件底 " + overlapInfo.ovBottom +
     " / 抽屉顶 " + overlapInfo.drTop + "）");
  await mob.screenshot({ path: path.join(OUT, "r24a_08_mobile_fs_drawer.png") });
  // 旧位（左下 bottom:14px）对照：若控件仍在左下，与抽屉的重叠面积是多少
  const oldPosOverlap = await mob.evaluate(() => {
    const ov = document.querySelector("#overlay-controls"), dr = document.querySelector("#place-drawer");
    if (!ov || !dr || dr.hidden) return null;
    const body = document.querySelector("#map-overlay-body").getBoundingClientRect();
    const r = ov.getBoundingClientRect(), d = dr.getBoundingClientRect();
    const y = body.bottom - 14 - r.height, b = body.bottom - 14;   // 旧位模拟
    const ox = Math.max(0, Math.min(r.right, d.right) - Math.max(r.x, d.x));
    const oy = Math.max(0, Math.min(b, d.bottom) - Math.max(y, d.y));
    return Math.round(ox * oy);
  });
  say("  【对照】控件若仍在旧位（左下 bottom:14px），与本次站点卡的重叠面积 = " + oldPosOverlap + " px²");
  await mob.close();

  // ---------- 5) §9.3 全景关系图节点徽记可辨性 ----------
  H("5) §9.3 硬性项：27 人级全景图节点徽记可辨性");
  await p.goto(origin + "/#/relations", { waitUntil: "load" }); await p.waitForTimeout(1600);
  const pano = await p.evaluate(() => {
    // r24a：徽记已移出各节点 <g>，改入顶层 badgeTop（svg 的最后一个 <g>）
    const svgs = [...document.querySelectorAll("#rel-canvas > svg > g:last-of-type > svg")];
    const c1 = document.querySelector('#rel-canvas [data-node="P_WENJIANG"] circle');
    const c2 = document.querySelector('#rel-canvas [data-node="P_QIXIANG"] circle');
    const chord = c1 && c2 ? Math.hypot(+c1.getAttribute("cx") - +c2.getAttribute("cx"), +c1.getAttribute("cy") - +c2.getAttribute("cy")) : null;
    return { protoNodes: document.querySelectorAll("#rel-canvas .rel-node.proto").length,
             badges: svgs.length, total: document.querySelectorAll("#rel-canvas .rel-node").length,
             size: svgs[0] ? { w: svgs[0].getAttribute("width"), sw: svgs[0].style.strokeWidth } : null,
             r: c1 ? c1.getAttribute("r") : null, ringW: c1 ? c1.getAttribute("stroke-width") : null,
             slotChord: chord ? +chord.toFixed(2) : null,
             onTop: !!(svgs[0] && svgs[0].parentNode === document.querySelector("#rel-canvas > svg").lastElementChild) };
  });
  say("  环上共 " + pano.total + " 人，主角节点 " + pano.protoNodes + " 个，徽记注入 " + pano.badges + " 枚");
  say("  节点 r=" + pano.r + "，绢帛分隔环宽=" + pano.ringW + "，相邻槽距(弦长)=" + pano.slotChord + "，徽记 " + JSON.stringify(pano.size));
  OK(pano.protoNodes === 27 && pano.badges === 27, "27 枚主角节点徽记全部注入");
  OK(pano.onTop, "徽记在顶层（叠于全部节点盘面之上）——旧法同弧只有最后一枚徽记露得出");
  OK(+pano.ringW === 3.4 && pano.size.w === "22" && pano.size.sw === "2.6", "呈现端已上调一档：环宽 2→3.4、徽记 20→22、线宽 2→2.6");
  say("  ⚠ 槽距 " + pano.slotChord + " < 节点直径 " + (2 * +pano.r) + "——主角盘面本就相互叠压，"
      + "此为 123 人同环的既有密度问题（r23b 即如此），非国色制引入；国色制使其显影（见交付说明 §四）");
  await p.screenshot({ path: path.join(OUT, "r24a_09_pano_full.png"), fullPage: false });
  // 齐（6 人同色）一段弧的局部放大——同色相邻节点只能靠徽记分辨
  const qiClip = await p.evaluate(() => {
    const qi = ["P_WENJIANG", "P_QIXIANG", "P_QIHUAN", "P_GUANZHONG", "P_BAOSHUYA", "P_QIXI"];
    const bs = qi.map(id => document.querySelector('#rel-canvas [data-node="' + id + '"]')).filter(Boolean).map(e => e.getBoundingClientRect());
    if (!bs.length) return null;
    const x = Math.min(...bs.map(b => b.x)) - 30, y = Math.min(...bs.map(b => b.y)) - 30;
    const r = Math.max(...bs.map(b => b.right)) + 30, bo = Math.max(...bs.map(b => b.bottom)) + 30;
    return { x: Math.max(0, x), y: Math.max(0, y), width: r - x, height: bo - y };
  });
  if (qiClip) { await p.screenshot({ path: path.join(OUT, "r24a_10_pano_qi_arc.png"), clip: qiClip }); say("  齐弧局部截图 clip=" + JSON.stringify(qiClip)); }

  // ---------- 6) 子产首秀 + 政制图标 ----------
  H("6) 子产时间线首秀与「政制」图标实装");
  await p.goto(origin + "/#/p/P_ZICHAN/timeline", { waitUntil: "load" }); await p.waitForTimeout(1200);
  const zc = await p.evaluate(() => {
    const items = [...document.querySelectorAll("#timeline-list > li")];
    return {
      n: items.length,
      theme: getComputedStyle(document.documentElement).getPropertyValue("--theme").trim(),
      navName: (document.querySelector(".person-nav") || {}).innerText,
      titles: items.map(i => (i.querySelector("summary") || i).innerText.replace(/\s+/g, " ").slice(0, 60)),
      zhengzhiIcons: document.querySelectorAll("#timeline-list svg").length,
    };
  });
  say("  子产事件 " + zc.n + " 条；--theme=" + zc.theme);
  zc.titles.forEach(t => say("    · " + t));
  OK(zc.n > 0, "子产时间线有事件");
  const acts = ["坏", "乡校", "刑书", "天道", "遗爱"];
  const hit = acts.filter(a => zc.titles.some(t => t.includes(a)));
  OK(hit.length >= 4, "五幕命中 " + hit.length + "/5：" + hit.join("、"));
  await p.screenshot({ path: path.join(OUT, "r24a_11_zichan_timeline.png"), fullPage: true });
  // 政制类事件的图标
  const zzi = await p.evaluate(async () => {
    const r = await fetch("assets/icons/zhengzhi.svg"); return { ok: r.ok, len: (await r.text()).length };
  });
  OK(zzi.ok, "zhengzhi.svg 可取（" + zzi.len + " 字节）");
  const catList = await p.evaluate(() => {
    const out = {};
    for (const e of DATA.events) out[e.category] = (out[e.category] || 0) + 1;
    return out;
  });
  say("  库内分类计数：" + JSON.stringify(catList));
  OK(!!catList["政制"], "库内有「政制」类事件 " + catList["政制"] + " 条");

  // ---------- 6b) B1 走查：E195 追记层标／E205 太史简／E206 弭兵之会 ----------
  H("6b) B1 前端走查：E195 追记层标（新层标形态）·E205·E206");
  await p.goto(origin + "/#/p/P_ZICHAN/timeline", { waitUntil: "load" }); await p.waitForTimeout(1100);
  const e195 = await p.evaluate(async () => {
    const li = [...document.querySelectorAll("#timeline-list > li")].find(x => /乡校/.test(x.innerText));
    if (!li) return { err: "未找到 E195 条目" };
    const d = li.querySelector("details") || li;
    if (d.tagName === "DETAILS") { d.open = true; d.dispatchEvent(new Event("toggle")); }
    await new Promise(r => setTimeout(r, 700));
    const cav = [...li.querySelectorAll(".q-caveat")].map(e => e.textContent.trim());
    const lay = [...li.querySelectorAll(".q-layer")].map(e => e.textContent.trim());
    const ico = li.querySelector("svg");
    return { caveats: cav, layers: lay, hasIcon: !!ico,
             y: Math.round(li.getBoundingClientRect().y), h: Math.round(li.getBoundingClientRect().height) };
  });
  say("  E195 层徽标：" + JSON.stringify(e195.layers));
  say("  E195 编者层标：" + JSON.stringify(e195.caveats));
  OK(!!(e195.caveats || []).some(t => /追记之辞/.test(t) && /非当时之言/.test(t)),
     "E195 孔子追记层标已按 .q-caveat 呈现（引文之上、暖赭告示条）");
  OK((e195.layers || []).includes("评论"), "E195 孔子评语的层徽标为「评论」，与层标分工不复述");
  await p.evaluate(() => {
    const li = [...document.querySelectorAll("#timeline-list > li")].find(x => /乡校/.test(x.innerText));
    if (li) li.scrollIntoView({ block: "center" });
  });
  await p.waitForTimeout(500);
  const e195box = await p.evaluate(() => {
    const li = [...document.querySelectorAll("#timeline-list > li")].find(x => /乡校/.test(x.innerText));
    if (!li) return null;
    const r = li.getBoundingClientRect();
    const x = Math.max(0, r.x - 10), y = Math.max(0, r.y - 10);
    return { x, y, width: Math.min(innerWidth - x, r.width + 20), height: Math.min(innerHeight - y, r.height + 20) };
  });
  if (e195box && e195box.height > 10 && e195box.width > 10) {
    await p.screenshot({ path: path.join(OUT, "r24a_14_E195_caveat.png"), clip: e195box });
    say("  E195 截图已出：r24a_14_E195_caveat.png  clip=" + JSON.stringify(e195box));
  } else say("  ⚠ E195 截图 clip 无效：" + JSON.stringify(e195box));
  /* E205 / E206 可达性实测。
   * 走查发现：二者皆无主角挂链，而全站三条通路对它们全部关闭——
   *   ① 时间线只按主角组织；② 全站搜索索引显式跳过无主角事件（app.js 建索引处）；
   *   ③ 资料库无事件页（LIB_TABS 仅 background/archaeology/sources）。
   * 故此处**不判 PASS/FAIL 于我方改动**，而是实测并报数，交领队裁定（见交付说明 §六之二）。 */
  const reach = await p.evaluate(() => {
    const ep = DATA.event_people, protos = new Set(DATA.people.filter(x => x.is_protagonist).map(x => x.id));
    const linked = new Set(ep.filter(r => protos.has(r.person_id)).map(r => r.event_id));
    const orphan = DATA.events.filter(e => !linked.has(e.id));
    return { total: DATA.events.length, orphan: orphan.map(e => e.id),
             inIndex: ["E205", "E206"].map(id => ({ id, hit: SEARCH_INDEX.some(s => s.group === "events" && s.label === (EVENTS[id] || {}).title) })),
             libTabs: LIB_TABS };
  });
  say("  库内事件 " + reach.total + " 条，其中无主角挂链 " + reach.orphan.length + " 条：" + reach.orphan.join("/"));
  say("  资料库页签：" + JSON.stringify(reach.libTabs) + "（无「事件」页）");
  say("  E205/E206 是否进入搜索索引：" + JSON.stringify(reach.inIndex));
  for (const q of ["崔杼弑其君", "弭兵"]) {
    await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(800);
    await p.click("#global-search"); await p.fill("#global-search", q); await p.waitForTimeout(600);
    const n = await p.evaluate(() => document.querySelectorAll("[role=listbox] [role=option]").length);
    say("  全站搜索「" + q + "」命中 " + n + " 条");
  }
  say("  ⚠ 结论：E205（太史简）与 E206（弭兵之会）在现行前端全站不可达——非本轮改动所致，"
      + "系 r23b 新入的时代骨干批与「事件只经主角时间线呈现」这一既有前端架构之间的缺口。"
      + "已上报候裁，本轮不擅自新增视图或改变可达性。");
  // 对照：有主角挂链的同批事件（E195）搜索直达正常
  await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(800);
  await p.click("#global-search"); await p.fill("#global-search", "乡校"); await p.waitForTimeout(600);
  const xx = await p.evaluate(() => document.querySelectorAll("[role=listbox] [role=option]").length);
  await p.screenshot({ path: path.join(OUT, "r24a_15_search_xiangxiao.png") });
  OK(xx > 0, "对照：有主角挂链者（E195 乡校）搜索命中 " + xx + " 条、直达正常");

  // ---------- 7) 四档宽度回归 ----------
  H("7) 四档宽度回归（1440 / 1024 / 768 / 390）");
  for (const [w, h] of [[1440, 900], [1024, 800], [768, 900], [390, 780]]) {
    await p.setViewportSize({ width: w, height: h });
    for (const [tag, hash] of [["home", "/#/"], ["timeline", "/#/p/P_ZICHAN/timeline"], ["map", "/#/p/P_WENJIANG/map"], ["cmp", "/#compare=P_WENJIANG,P_QIXIANG"]]) {
      await p.goto(origin + hash, { waitUntil: "load" }); await p.waitForTimeout(700);
      const ov = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      OK(ov.sw <= ov.cw + 1, w + "px · " + tag + " 无横向溢出（scrollWidth " + ov.sw + " ≤ clientWidth " + ov.cw + "）");
    }
    await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(600);
    await p.screenshot({ path: path.join(OUT, "r24a_12_w" + w + "_home.png") });
  }
  await p.setViewportSize({ width: 1440, height: 900 });

  // ---------- 8) 分享卡生成实测 ----------
  H("8) 分享卡生成（九国色带）");
  await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(800);
  const share = await p.evaluate(async () => {
    const btn = [...document.querySelectorAll("button")].find(b => /生成分享卡/.test(b.textContent));
    if (!btn) return { err: "无入口" };
    btn.click();
    await new Promise(r => setTimeout(r, 1200));
    const cv = document.querySelector("#share-canvas");
    return { w: cv && cv.width, h: cv && cv.height, open: !document.querySelector("#share-overlay").hidden };
  });
  say("  分享卡：" + JSON.stringify(share));
  OK(share.open && share.w > 0, "分享卡对话框可开、canvas 已绘（" + share.w + "×" + share.h + "）");
  await p.screenshot({ path: path.join(OUT, "r24a_13_sharecard.png") });

  // ---------- 9) 27 人全流程抽查（每国一人）----------
  H("9) 27 人回归抽查（每国一人 · 时间线/地图/ego 三视图）");
  const sample = [["齐", "P_GUANZHONG"], ["鲁", "P_CAOGUI"], ["郑", "P_ZICHAN"], ["晋", "P_JIEZHITUI"],
                  ["秦", "P_MUJI"], ["楚", "P_XIGUI"], ["卫", "P_ZHUANGJIANG"], ["宋", "P_SONGXIANG"], ["陈", "P_XIAJI"]];
  for (const [st, id] of sample) {
    let bad = [];
    for (const v of ["timeline", "map", "relations"]) {
      await p.goto(origin + "/#/p/" + id + "/" + v, { waitUntil: "load" }); await p.waitForTimeout(700);
      const r = await p.evaluate((vv) => ({
        theme: getComputedStyle(document.documentElement).getPropertyValue("--theme").trim(),
        shown: !document.querySelector("#view-" + (vv === "relations" ? "relations" : vv)).hidden,
      }), v);
      if (!r.shown) bad.push(v + "未显示");
    }
    const th = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--theme").trim());
    const hex = (x) => { const m = x.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/); return m ? "#" + [1, 2, 3].map(i => (+m[i]).toString(16).padStart(2, "0")).join("").toUpperCase() : x.toUpperCase(); };
    OK(bad.length === 0 && hex(th) === STATE_HEX[st], st + "·" + id + " 三视图正常，主题色 " + hex(th) + (bad.length ? " ／ " + bad.join(",") : ""));
  }

  // ---------- 10) 首访引导三步复核（含色相关步骤）----------
  H("10) 首访三步引导复核（第二/三步落在文姜＝齐色页面）");
  const tp = await c.newPage();
  await tp.addInitScript(() => { try { localStorage.removeItem("chunqiu_tour_v1"); } catch (e) { } });
  await tp.setViewportSize({ width: 1440, height: 900 });
  await tp.goto(origin + "/#/", { waitUntil: "load" }); await tp.waitForTimeout(1600);
  const steps = [];
  for (let i = 0; i < 3; i++) {
    const st = await tp.evaluate(() => {
      const pop = document.querySelector("#tour-pop"), hole = document.querySelector("#tour-hole");
      const hr = hole ? hole.getBoundingClientRect() : null;
      return { on: !!(pop && !pop.hidden), label: (document.querySelector("#tour-step") || {}).textContent,
               text: (document.querySelector("#tour-text") || {}).textContent,
               holeOk: !!(hr && hr.width > 0 && hr.height > 0 && (hr.x > 0 || hr.y > 0)),
               theme: getComputedStyle(document.documentElement).getPropertyValue("--theme").trim() };
    });
    steps.push(st);
    say("  " + (st.label || "?") + "：" + (st.text || "") + " ｜ 高亮框有效=" + st.holeOk + " ｜ --theme=" + st.theme);
    await tp.screenshot({ path: path.join(OUT, "r24a_17_tour" + (i + 1) + ".png") });
    if (i < 2) { await tp.click("#tour-next"); await tp.waitForTimeout(1300); }
  }
  OK(steps.every(s => s.on), "三步引导逐步弹出");
  OK(steps.every(s => s.holeOk), "三步高亮框皆落在真实元素上（非左上角 0,0 —— r15 旧 bug 未复发）");
  const hex2 = (x) => { const m = x.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/); return m ? "#" + [1, 2, 3].map(i => (+m[i]).toString(16).padStart(2, "0")).join("").toUpperCase() : x.toUpperCase(); };
  OK(hex2(steps[1].theme) === "#A5322A" && hex2(steps[2].theme) === "#A5322A",
     "第二/三步落在文姜页，主题色已是齐国色 #A5322A（旧为文姜个人色 #B23A2F）");
  await tp.click("#tour-next"); await tp.waitForTimeout(900);
  // endTour() 隐藏的是外层 #tour（遮罩容器），不是 #tour-pop；连带 personCtx=null、子导航收起
  const done = await tp.evaluate(() => ({ hidden: document.querySelector("#tour").hidden,
    navHidden: document.querySelector("#person-nav").hidden, hash: location.hash,
    views: ["home", "timeline"].filter(v => !document.querySelector("#view-" + v).hidden),
    seen: (() => { try { return localStorage.getItem("chunqiu_tour_v1"); } catch (e) { return null; } })() }));
  say("  收尾态：" + JSON.stringify(done));
  OK(done.hidden && done.views.includes("home") && done.navHidden,
     "「开始探索」收尾：遮罩收起、回首页、人物子导航清空");
  OK(done.seen === "1", "首访标记已写入 localStorage（不再复弹）");
  await tp.close();

  say("\n控制台告警：" + (warns.length ? warns.join(" | ") : "无"));
  say("页面错误：" + (errs.length ? errs.join(" | ") : "无"));
  const fails = log.filter(l => l.startsWith("  [FAIL]"));
  say("\n===== 汇总：" + (log.filter(l => l.startsWith("  [OK]")).length) + " 项通过，" + fails.length + " 项未过 =====");
  fails.forEach(f => say(f));
  await b.close(); if (s) s.close();
  fs.writeFileSync(path.join(OUT, "r24a_log.txt"), log.join("\n"), "utf8");
})();
