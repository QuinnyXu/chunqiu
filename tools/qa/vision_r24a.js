"use strict";
// r24a Vision 自验：国色制换血（九国色定调／个人色退役）＋并观线型与交互重构
// ＋全屏控件移位＋§9.3 全景徽记可辨性＋政制图标＋子产首秀＋27 主角回归
//
// r24a-2 补批扩充（本文件即 Vision 的回归总门，不另起脚本）：
//   §5  改为 A/B 两态实测——A＝默认 27 主角环、B＝勾「显示全部」回全库；
//       原「槽距 < 节点直径」的 ⚠ 记实随之改写为「B 态仍如此、A 态已解」。
//   §5b 新增：诗歌层菉色 --poem 的落地与**渲染后**色距实测（不只查源文件）。
//
// r24a-fix2 扩充：§4b 往返门加验字幕条（存在／归属容器／唯一／随播更新／退出归位），
//   §4c 新立「字幕条断根反证」——注入浮层容器清空后要求自愈重建（旧的静态单例必败）。
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
  // 沙箱内对生产域名 DNS 解析失败时，用 QA_HOST_RESOLVER 直接把域名映射到已知 IP，
  // 例：QA_HOST_RESOLVER="MAP chunqiu.timechorus.com 172.67.174.133"（不设则行为不变）
  const hostRule = process.env.QA_HOST_RESOLVER || null;
  if (hostRule) say("host-resolver-rules：" + hostRule);
  const b = await pw.chromium.launch(hostRule ? { args: ["--host-resolver-rules=" + hostRule] } : {});
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

  // ---------- 4b) r24a-fix 永久回归门：单↔双任意次往返，全屏控件恒在、恒可点、状态恒同步 ----------
  /* 起因（Xu 生产实测报障）：r24a 把控件从浮层根移入 #map-overlay-body 后，openRelOverlay /
   *   closeRelOverlay / openCmpOverlay 三处 `body.textContent=""` 会把这个静态单例节点连带销毁，
   *   此后 $("#overlay-controls") 恒 null、旧 setupOverlayControls 静默空转，单人全屏也一并没了控件，
   *   须整页刷新才复原。修法：mountOverlayControls() 每次开浮层幂等重建（DOM 可弃、状态派生）。
   * 本节**永久保留**：往返切视图全程不刷新（刷新会掩盖此 bug），每次开全屏都断言存在＋可点＋状态同步。
   * r24a-fix2 扩：同一往返里连字幕条（#play-caption / #cmp-caption）一并断言——它们与控件同型，
   *   过去也是「被 move 进浮层、退出再 move 回」的跨浮层单例，本轮同改派生式重挂。 */
  H("4b) 全屏控件＋字幕条往返回归门（r24a-fix／fix2·永久保留）");
  const ctlProbe = () => {
    const ov = document.querySelector("#overlay-controls"), btn = document.querySelector("#ov-play");
    if (!ov || !btn) return { exists: false };
    const r = btn.getBoundingClientRect();
    const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { exists: true, inBody: !!ov.closest("#map-overlay-body"), vis: !ov.hidden,
             w: Math.round(r.width), h: Math.round(r.height),
             hit: !!(top && (top === btn || btn.contains(top))),   // 顶层命中＝真可点、未被遮挡
             txt: btn.textContent };
  };
  /* 字幕条探针（r24a-fix2）：存在性、归属容器、唯一性（无残留重份）、可见性与文本 */
  const capProbe = (sel) => {
    const all = document.querySelectorAll(sel), e = all[0];
    if (!e) return { exists: false, dup: 0, text: "" };
    const r = e.getBoundingClientRect();
    return { exists: true, dup: all.length, inBody: !!e.closest("#map-overlay-body"),
             hidden: !!e.hidden, op: +getComputedStyle(e).opacity,
             w: Math.round(r.width), h: Math.round(r.height), text: (e.textContent || "").trim() };
  };
  // 四档宽度全跑（桌面 1440 / 窄桌面 1024 / 平板 768 / 手机 390）——控件位置与热区随断点变化，逐档实测
  for (const dev of [{ n: "1440桌面", w: 1440, h: 900 }, { n: "1024窄桌", w: 1024, h: 768 },
                     { n: "768平板", w: 768, h: 1024 }, { n: "390手机", w: 390, h: 780 }]) {
    const rp = await c.newPage();
    await rp.setViewportSize({ width: dev.w, height: dev.h });
    const rerrs = [];
    rp.on("pageerror", e => rerrs.push(e.message));
    await rp.goto(origin + "/#/p/P_WENJIANG/map", { waitUntil: "load" }); await rp.waitForTimeout(1200);
    const goHash = async (h) => { await rp.evaluate(x => { location.hash = x; }, h); await rp.waitForTimeout(900); };
    // 一次「开全屏 → 查控件 → 播/停各一次 → 关全屏」的完整核验
    const round = async (label, hash, zoomSel, mainSel, shot) => {
      await goHash(hash);
      await rp.click(zoomSel); await rp.waitForTimeout(500);
      const g = await rp.evaluate(ctlProbe);
      OK(g.exists && g.inBody && g.vis, dev.n + "·" + label + "：控件存在且在全屏容器内（" + JSON.stringify(g) + "）");
      OK(!!g.exists && g.hit && g.h >= 44, dev.n + "·" + label + "：按钮可点——顶层命中且热区高 " + (g.h || 0) + "px ≥44px");
      // r24a-fix2：字幕条须随图入全屏——存在、在浮层容器内、全站仅一份（浮层外不得留残份）
      const capSel = mainSel === "#btn-play" ? "#play-caption" : "#cmp-caption";
      const capMode = mainSel === "#btn-play" ? "single" : "dual";
      const c0 = await rp.evaluate(capProbe, capSel);
      OK(c0.exists && c0.inBody && c0.dup === 1,
         dev.n + "·" + label + "：字幕条随图入全屏（" + JSON.stringify(c0) + "）");
      if (g.exists) {
        const before = await rp.evaluate(s => document.querySelector(s).textContent, mainSel);
        await rp.click("#ov-play"); await rp.waitForTimeout(600);
        const playing = await rp.evaluate(s => ({ raf: !!(typeof player !== "undefined" && player.raf),
          ov: document.querySelector("#ov-play").textContent, main: document.querySelector(s).textContent }), mainSel);
        const cPlay = await rp.evaluate(capProbe, capSel);   // 实播采样：播放中字幕条须在浮层内显影且有文本
        OK(cPlay.exists && cPlay.inBody && !cPlay.hidden && cPlay.text.length > 0 && cPlay.op > 0.5,
           dev.n + "·" + label + "：播放中浮层内字幕条已显影「" + cPlay.text.slice(0, 24) +
           "」（opacity " + cPlay.op + "）");
        await rp.click("#ov-play"); await rp.waitForTimeout(500);
        const paused = await rp.evaluate(s => ({ raf: !!(typeof player !== "undefined" && player.raf),
          ov: document.querySelector("#ov-play").textContent, main: document.querySelector(s).textContent }), mainSel);
        OK(playing.raf && !paused.raf, dev.n + "·" + label + "：点控件真起播、再点真暂停（raf " +
           playing.raf + "→" + paused.raf + "）");
        OK(playing.ov === playing.main && paused.ov === paused.main && paused.ov !== playing.ov,
           dev.n + "·" + label + "：控件文案与主按钮同步（开前「" + before + "」→ 播「" + playing.ov +
           "」→ 停「" + paused.ov + "」）");
        /* 「随播更新」的确定性判据：直接调播放引擎的播报入口（showCaption / cmpCaption——两版皆有，
         * 不引入只存在于新码的 API），写出的话必须落在**浮层里的那个节点**上；
         * 若浮层内是残留/失联节点、真节点在别处，此项即报 FAIL。在暂停态做，免被播放帧覆写。 */
        const probeTxt = "QA·字幕探针" + Date.now();
        const cInj = await rp.evaluate(async ([sel, txt, mode]) => {
          if (mode === "single") showCaption(txt); else cmpCaption(-700);
          await new Promise(r => setTimeout(r, 120));
          const e = document.querySelector(sel);
          return e ? { inBody: !!e.closest("#map-overlay-body"), hidden: !!e.hidden,
                       text: (e.textContent || "").trim() } : { none: true };
        }, [capSel, probeTxt, capMode]);
        const want = capMode === "single" ? probeTxt : "前700";   // yearLabel(-700) → 「前700」，无「年」字
        OK(!!cInj && cInj.inBody && !cInj.hidden && (cInj.text || "").includes(want),
           dev.n + "·" + label + "：字幕条随播更新——引擎播报直落浮层内节点（实测「" +
           ((cInj && cInj.text) || "—").slice(0, 24) + "」）");
      }
      if (mainSel === "#cmp-play") {   // r24a-fix 顺带修正：全屏内「交会一览」浮条须收起，不压字幕条
        const st = await rp.evaluate(() => { const e = document.querySelector("#cmp-sheet-toggle");
          if (!e) return null; const r = e.getBoundingClientRect();
          return { disp: getComputedStyle(e).display, h: Math.round(r.height) }; });
        OK(!!st && (st.disp === "none" || st.h === 0),
           dev.n + "·" + label + "：「交会一览」浮条在全屏内已收起（display=" + (st && st.disp) + "）");
      }
      // 视觉留证：全屏尚开着时截一张（§9.3——触达类项目一律附无头浏览器截图，不以 DOM 断言代替眼见）
      if (shot) await rp.screenshot({ path: path.join(OUT, "r24a_fix_" + shot + "_" + dev.w + ".png") });
      await rp.click("#btn-overlay-close"); await rp.waitForTimeout(400);
      const cBack = await rp.evaluate(capProbe, capSel);   // 退出后须归位内嵌图框，且不留重份
      OK(cBack.exists && !cBack.inBody && cBack.dup === 1,
         dev.n + "·" + label + "：关全屏后字幕条归位内嵌图框（" + JSON.stringify(cBack) + "）");
    };
    // 单 → 双 → 单 → 双 → 单：两个整往返（Xu 复现路径即其首段），全程 hash 切换、绝不刷新
    await round("第1次·单人全屏", "#/p/P_WENJIANG/map", "#btn-zoom", "#btn-play");
    await round("第2次·并观全屏", "#compare=P_WENJIANG,P_QIXIANG", "#cmp-zoom", "#cmp-play");
    await round("第3次·单人全屏", "#/p/P_WENJIANG/map", "#btn-zoom", "#btn-play");
    await round("第4次·并观全屏", "#compare=P_WENJIANG,P_QIXIANG", "#cmp-zoom", "#cmp-play", "dual_fs");
    // 插入关系图全屏（同一 #map-overlay 容器、会清空 body）作为干扰，再回单人：控件仍须重建
    await goHash("#/relations");
    await rp.click("#btn-rel-zoom"); await rp.waitForTimeout(800);
    const relCtl = await rp.evaluate(ctlProbe);
    OK(!relCtl.exists, dev.n + "·图谱全屏：不挂播放控件（关系图无轨迹可播）");
    const relCap = await rp.evaluate(() => {
      const a = document.querySelector("#play-caption"), b = document.querySelector("#cmp-caption");
      return { a: !!a, b: !!b, aIn: !!(a && a.closest("#map-overlay-body")), bIn: !!(b && b.closest("#map-overlay-body")) };
    });
    OK(relCap.a && relCap.b && !relCap.aIn && !relCap.bIn,
       dev.n + "·图谱全屏：两条字幕条俱在、且都不在浮层容器内——不受图谱入口清空 body 的牵连（" +
       JSON.stringify(relCap) + "）");
    await rp.click("#btn-overlay-close"); await rp.waitForTimeout(400);
    await round("第5次·单人全屏（图谱全屏之后）", "#/p/P_WENJIANG/map", "#btn-zoom", "#btn-play", "single_fs");
    OK(rerrs.length === 0, dev.n + "·往返全程无页面错误（" + (rerrs.join(" | ") || "无") + "）");
    await rp.close();
  }

  // ---------- 4c) 字幕条断根反证（r24a-fix2·构造式：浮层容器被清空后须自愈）----------
  /* 为何是构造式、而非把 bug 复现出来：r24a-fix2 走查用探针逐帧监视两条字幕条是否仍在 document 内，
   *   把现行全部入口（单↔并观↔图谱全屏往返、Esc、后退/前进、播放中切视图、全屏内开抽屉…）跑了一遍，
   *   **没有**一条可达路径能销毁它们——因为 captions 与 #overlay-controls 不同，每次退出都被 move 出容器。
   *   故 r24a-fix2 断的是「跨浮层存活的单例」这一类隐患，而非某条已发生的路径（详见交付说明 §二十）。
   *   本节据此按类立断言：注入与那三处入口一模一样的 `#map-overlay-body.textContent=""`，
   *   此后播报须能自愈重建字幕条、往返归位不丢、关全屏不抛错。
   *   旧法（静态单例 move 进 move 出）在此必败：节点被连带销毁后 $("#play-caption") 恒 null、
   *   播报静默空转，closeOverlay 还会在 appendChild(null) 上抛 TypeError。本节即新断言的咬合力所在。 */
  H("4c) 字幕条断根反证（r24a-fix2·构造式：容器清空后自愈）");
  for (const dev of [{ n: "1440桌面", w: 1440, h: 900 }, { n: "390手机", w: 390, h: 780 }]) {
    for (const cs of [
      { mode: "single", label: "单人", hash: "#/p/P_WENJIANG/map", zoom: "#btn-zoom",
        sel: "#play-caption", frame: "#map-frame", want: "QA·断根探针" },
      { mode: "dual", label: "并观", hash: "#compare=P_WENJIANG,P_QIXIANG", zoom: "#cmp-zoom",
        sel: "#cmp-caption", frame: "#cmp-frame", want: "前700" }]) {
      const zp = await c.newPage();
      await zp.setViewportSize({ width: dev.w, height: dev.h });
      const zerrs = []; zp.on("pageerror", e => zerrs.push(e.message));
      await zp.goto(origin + "/" + cs.hash, { waitUntil: "load" }); await zp.waitForTimeout(1200);
      await zp.click(cs.zoom); await zp.waitForTimeout(500);
      await zp.click("#ov-play"); await zp.waitForTimeout(700);
      const cBefore = await zp.evaluate(capProbe, cs.sel);
      OK(cBefore.exists && cBefore.inBody,
         dev.n + "·" + cs.label + "：清空前字幕条在浮层内（「" + (cBefore.text || "").slice(0, 20) + "」）");
      await zp.click("#ov-play"); await zp.waitForTimeout(400);   // 先暂停：免播放帧覆写下面的探针文本
      // 注入与三处浮层入口同款的容器清空动作
      await zp.evaluate(() => { document.querySelector("#map-overlay-body").textContent = ""; });
      await zp.waitForTimeout(200);
      const healed = await zp.evaluate(async ([mode, sel]) => {
        if (mode === "single") showCaption("QA·断根探针"); else cmpCaption(-700);
        await new Promise(r => setTimeout(r, 150));
        const e = document.querySelector(sel);
        return e ? { exists: true, inBody: !!e.closest("#map-overlay-body"), hidden: !!e.hidden,
                     text: (e.textContent || "").trim() } : { exists: false };
      }, [cs.mode, cs.sel]);
      OK(healed.exists && healed.inBody && !healed.hidden && (healed.text || "").includes(cs.want),
         dev.n + "·" + cs.label + "：容器被清空后，播报仍能自愈重建字幕条于浮层内（" + JSON.stringify(healed) + "）");
      await zp.click("#btn-overlay-close"); await zp.waitForTimeout(500);
      const zBack = await zp.evaluate(([sel, fr]) => {
        const e = document.querySelector(sel);
        return { exists: !!e, inBody: !!(e && e.closest("#map-overlay-body")), inFrame: !!(e && e.closest(fr)),
                 dup: document.querySelectorAll(sel).length };
      }, [cs.sel, cs.frame]);
      OK(zBack.exists && !zBack.inBody && zBack.inFrame && zBack.dup === 1,
         dev.n + "·" + cs.label + "：清空过后关全屏，字幕条照样归位 " + cs.frame + "（" + JSON.stringify(zBack) + "）");
      await zp.click(cs.zoom); await zp.waitForTimeout(600);
      const zAgain = await zp.evaluate(capProbe, cs.sel);
      OK(zAgain.exists && zAgain.inBody && zAgain.dup === 1,
         dev.n + "·" + cs.label + "：再开全屏字幕条仍在、无重份（往返不丢）");
      await zp.screenshot({ path: path.join(OUT, "r24a_fix2_" + cs.mode + "_" + dev.w + ".png") });
      OK(zerrs.length === 0, dev.n + "·" + cs.label + "：断根反证全程无页面错误（" + (zerrs.join(" | ") || "无") + "）");
      await zp.close();
    }
  }

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
  say("  【A 态·默认】环上共 " + pano.total + " 人，主角节点 " + pano.protoNodes + " 个，徽记注入 " + pano.badges + " 枚");
  say("  节点 r=" + pano.r + "，绢帛分隔环宽=" + pano.ringW + "，相邻槽距(弦长)=" + pano.slotChord + "，徽记 " + JSON.stringify(pano.size));
  OK(pano.protoNodes === 27 && pano.badges === 27, "27 枚主角节点徽记全部注入");
  OK(pano.onTop, "徽记在顶层（叠于全部节点盘面之上）——旧法同弧只有最后一枚徽记露得出");
  OK(+pano.ringW === 3.4 && pano.size.w === "22" && pano.size.sw === "2.6", "呈现端已上调一档：环宽 2→3.4、徽记 20→22、线宽 2→2.6");
  // r24a-2 裁定②b：默认只画 27 主角，槽距因此由 12.87 升到 58.5+，大于节点直径 30 与徽记边长 22
  OK(pano.total === 27, "A 态默认只画 27 主角（r24a-2 裁定②b，即 r24a §4.3 选项 C）");
  OK(pano.slotChord > 2 * +pano.r, "A 态槽距 " + pano.slotChord + " > 节点直径 " + (2 * +pano.r) + "——盘面不再叠压");
  OK(pano.slotChord > +pano.size.w, "A 态槽距 " + pano.slotChord + " > 徽记边长 " + pano.size.w + "——同弧徽记不再压边（r24a 遗留的根本矛盾在 A 态解除）");
  const showAllUI = await p.evaluate(() => ({
    hasBox: !!document.querySelector("#rel-show-all"),
    showAllVisible: !document.querySelector("#rel-showall-label").hidden,
    protoOnlyVisible: !document.querySelector("#rel-filter-label").hidden,
    label: (document.querySelector("#rel-showall-text") || {}).textContent,
    crumbs: document.querySelector("#rel-crumbs").textContent.trim(),
  }));
  say("  A 态工具条：" + JSON.stringify(showAllUI));
  OK(showAllUI.hasBox && showAllUI.showAllVisible, "「显示全部」开关在全景态可见");
  OK(!showAllUI.protoOnlyVisible, "A 态隐去「仅主角边」——27 主角环上每条边两端皆主角，该过滤器恒为空操作");
  OK(/27 主角/.test(showAllUI.crumbs), "工具条计数与环上实绘同源（报 27 主角）");
  await p.screenshot({ path: path.join(OUT, "r24a_09_pano_full.png"), fullPage: false });
  await p.locator("#rel-canvas").screenshot({ path: path.join(OUT, "r24a2_06_pano_A_27proto.png") });

  // B 态：勾「显示全部」→ 回全库全环（r24a 记录的旧默认态，留作对照存档）
  await p.check("#rel-show-all"); await p.waitForTimeout(1400);
  const panoB = await p.evaluate(() => {
    const c1 = document.querySelector('#rel-canvas [data-node="P_WENJIANG"] circle');
    const c2 = document.querySelector('#rel-canvas [data-node="P_QIXIANG"] circle');
    return { total: document.querySelectorAll("#rel-canvas .rel-node").length,
             protoNodes: document.querySelectorAll("#rel-canvas .rel-node.proto").length,
             slotChord: c1 && c2 ? +Math.hypot(+c1.getAttribute("cx") - +c2.getAttribute("cx"), +c1.getAttribute("cy") - +c2.getAttribute("cy")).toFixed(2) : null,
             protoOnlyVisible: !document.querySelector("#rel-filter-label").hidden,
             crumbs: document.querySelector("#rel-crumbs").textContent.trim() };
  });
  say("  【B 态·显示全部】" + JSON.stringify(panoB));
  OK(panoB.total > 100 && panoB.protoNodes === 27, "B 态回到全库全环（" + panoB.total + " 人），27 主角仍带徽记");
  OK(panoB.protoOnlyVisible, "B 态「仅主角边」随之出现（此时它才有意义）");
  say("  ⚠ B 态槽距 " + panoB.slotChord + " < 节点直径 " + (2 * +pano.r) + "——主角盘面相互叠压、同弧徽记压边，"
      + "此为 " + panoB.total + " 人同环的既有密度问题（r23b 即如此），非国色制引入；国色制使其显影。"
      + "r24a-2 的处置不是消灭它，而是把它移出默认态：默认给 27 人环，全库全环改为读者主动索取（见交付说明 §十一）");
  await p.locator("#rel-canvas").screenshot({ path: path.join(OUT, "r24a2_07_pano_B_showall.png") });
  // 往返：取消勾选须回到 A 态（开关式，不留中间态）
  await p.uncheck("#rel-show-all"); await p.waitForTimeout(1200);
  const panoA2 = await p.evaluate(() => document.querySelectorAll("#rel-canvas .rel-node").length);
  OK(panoA2 === 27, "A⇄B 往返实测：取消勾选回到 27 主角环（实测 " + panoA2 + "）");
  // 全屏「⛶ 放大查看」克隆的是当前 SVG，故须在 A 态下确认克隆体也是 27 人环且节点仍可点
  await p.click("#btn-rel-zoom"); await p.waitForTimeout(900);
  const zoomA = await p.evaluate(() => ({
    open: !document.querySelector("#map-overlay").hidden,
    nodes: document.querySelectorAll("#map-overlay-body .rel-node").length,
    badges: document.querySelectorAll("#map-overlay-body > svg > g:last-of-type > svg").length,
  }));
  say("  全屏克隆体（A 态）：" + JSON.stringify(zoomA));
  OK(zoomA.open && zoomA.nodes === 27 && zoomA.badges === 27, "全屏放大查看随 A 态克隆 27 人环、27 枚徽记同步");
  await p.click("#btn-overlay-close"); await p.waitForTimeout(500);
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

  // ---------- 5b) r24a-2：诗歌层菉色 --poem（渲染后实测，非只查源文件） ----------
  H("5b) r24a-2 补批：诗歌层功能色换色相（菉 --poem）");
  await p.goto(origin + "/#/p/P_XIAJI/timeline", { waitUntil: "load" }); await p.waitForTimeout(1300);
  const poem = await p.evaluate(() => {
    document.querySelectorAll("details").forEach(d => (d.open = true));
    const toHex = (s) => { const m = (s || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/); return m ? "#" + [1, 2, 3].map(i => (+m[i]).toString(16).padStart(2, "0")).join("").toUpperCase() : (s || "").toUpperCase(); };
    const cs = getComputedStyle(document.documentElement);
    const q = document.querySelector(".quote.layer-shige");
    const tag = q && q.querySelector(".q-layer");
    return {
      poemVar: cs.getPropertyValue("--poem").trim().toUpperCase(),
      bronzeVar: cs.getPropertyValue("--bronze").trim().toUpperCase(),
      theme: toHex(cs.getPropertyValue("--theme")),
      leftLine: q ? toHex(getComputedStyle(q).borderLeftColor) : null,
      tagColor: tag ? toHex(getComputedStyle(tag).color) : null,
      bg: q ? getComputedStyle(q).backgroundColor : null,
      hasCaveat: !!(q && q.classList.contains("has-caveat")),
      caveatColor: (() => { const c = q && q.querySelector(".q-caveat"); return c ? toHex(getComputedStyle(c).color) : null; })(),
    };
  });
  // ΔE76（CIE Lab D65/2°）与 WCAG 对比度，口径同 tools/qa/color_matrix_r24a2.js 与 design_notes §2.1
  const _lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const _rgb = (h) => { const v = parseInt(h.replace("#", ""), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };
  const _lab = (h) => { const [r, g, bl] = _rgb(h).map(_lin);
    const X = r * .4124564 + g * .3575761 + bl * .1804375, Y = r * .2126729 + g * .7151522 + bl * .0721750, Z = r * .0193339 + g * .1191920 + bl * .9503041;
    const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
    const fx = f(X / .95047), fy = f(Y), fz = f(Z / 1.08883);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]; };
  const dE = (a, b) => { const A = _lab(a), B = _lab(b); return +Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]).toFixed(2); };
  const _lum = (h) => { const [r, g, bl] = _rgb(h).map(_lin); return .2126 * r + .7152 * g + .0722 * bl; };
  const ctr = (a, b) => +(((Math.max(_lum(a), _lum(b)) + .05) / (Math.min(_lum(a), _lum(b)) + .05))).toFixed(2);
  say("  渲染实测：" + JSON.stringify(poem));
  OK(poem.poemVar === "#63722F", "--poem 已立（菉 #63722F）");
  OK(poem.poemVar !== poem.bronzeVar, "--poem 与 --bronze 已分家（--bronze 仍服务次强调与「拥立」关系线）");
  OK(poem.leftLine === poem.poemVar && poem.tagColor === poem.poemVar,
     "诗歌层左线与徽标皆取 --poem（实测 " + poem.leftLine + " / " + poem.tagColor + "）");
  OK(/^rgba\(99, 114, 47/.test(poem.bg || ""), "诗歌层淡底同步换为菉色 0.06（实测 " + poem.bg + "）");
  const worst = Object.entries(STATE_HEX).map(([k, v]) => [k, dE(poem.poemVar, v)]).sort((a, b) => a[1] - b[1]);
  say("  菉色 × 九国色 ΔE76 最紧三：" + worst.slice(0, 3).map(x => x[0] + " " + x[1]).join("、"));
  OK(worst[0][1] >= 13.2, "菉色对九国色全部 ≥13.2（最紧 " + worst[0][0] + " " + worst[0][1] + "）");
  OK(dE(poem.poemVar, "#35706A") >= 13.2, "对郑（旧值仅 4.39）已拉开至 " + dE(poem.poemVar, "#35706A"));
  OK(ctr(poem.poemVar, "#F4EDDF") >= 3.5 && ctr(poem.poemVar, "#FFFFFF") >= 4.1,
     "双底线达标：对绢帛 " + ctr(poem.poemVar, "#F4EDDF") + " / 对白 " + ctr(poem.poemVar, "#FFFFFF"));
  OK(poem.hasCaveat && poem.caveatColor === "#B4652F",
     "《株林》条层标仍为暖赭、未被层色夺去（层标答「本库如何处置」、层色答「属哪一层」，分工不变）");
  say("  注：全站全色目 31 色的 ΔE76 全矩阵另由 `node tools/qa/color_matrix_r24a2.js` 实算（含关系线与图面中性色）");
  const shot = await p.$(".quote.layer-shige");
  if (shot) {
    const card = await p.evaluateHandle(e => e.closest("li,article,.tl-item") || e.parentElement, shot);
    await card.asElement().screenshot({ path: path.join(OUT, "r24a2_01_poem_xiaji_chen.png") });
    say("  《陈风·株林》条截图：r24a2_01_poem_xiaji_chen.png（陈国色 #3B6A48 与菉色同屏，旧青绿对陈仅 15.13）");
  }

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
    // r24a-2：关系全景纳入宽度回归——本批在其工具条新增了「显示全部」勾选框，须验窄屏不撑破
    for (const [tag, hash] of [["home", "/#/"], ["timeline", "/#/p/P_ZICHAN/timeline"], ["map", "/#/p/P_WENJIANG/map"], ["cmp", "/#compare=P_WENJIANG,P_QIXIANG"], ["relations", "/#/relations"]]) {
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
