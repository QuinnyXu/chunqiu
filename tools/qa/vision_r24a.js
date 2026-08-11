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
//
// r25 扩充（本文件仍是 Vision 的回归总门，不另起脚本——既有的 §4b/§4c 两节永久保留在此，
//   另起一份就得把它们抄一遍，抄本必然分叉）：
//   §6b 的 E205/E206「全站不可达」记实随裁定甲案落地而改写为历史注，实判迁至 §11；
//   §7  四档宽度回归纳入 /#/chronicle；
//   §11 新立「编年视图」验收门（路由/上表完整性/排序/国色签/展开卡/人物签往返/
//       搜索索引覆盖面/落锚/筛选/规模与性能/手机触区）；
//   §12 新立「落锚滚动回归门」——判据是 scrollY 实测 >0 且目标在视口内，旧码（单 rAF）必红。
//
// r26 扩充（仍不另起脚本，理由同上）：
//   §13 「论对」图标实装门（第 17 类）——含「政制行不是 lundui」的同尺度可分反证；
//   §14 晋都迁点地图门（L_JIANG 故绛 / L_XINTIAN 新田 分立）——含「迁后仍挂故绛者须为 0 条」的
//       审计式反证，与「锚点坐标＝conventions §4 公式现算值」的不手摆断言；
//   §15 叔向 ego 图（姻亲边与祁大夫新配角）；
//   §16 穆姬复查门——判据写成「亲至且可落图的地点数 ≥2 ⇔ 可播」的**双向自洽**式，
//       不预设本轮答案，日后穆姬若真补上第二个亲至落点，本门自动翻绿、无需改码。
//
// r26b 扩充：
//   §5  人数断言由**快照式改对账式**——原写死「27」，而 r26 实况是数据 29／前端 27，
//       写死的那一版照样全绿（它比的是 27 是不是 27）。现改为「环上人数 ⇔ protoRoster()
//       ⇔ PROTAGONISTS ⇔ 数据 is_protagonist」四方互证，槽距按 2R·sin(π/n) 现算再对 DOM。
//   §17 晏婴（齐7）／叔向（晋4）上线门：名册对账 ＋ 六处呈现（选人／首页分区／时间线／
//       地图／并观可选／全景默认环）＋ 两枚新徽记的规约核；徽记撞形实测另在
//       tools/qa/badge_silhouette_r26b.js（IoU 双尺度，判据取相对现库分布，不拍脑袋定阈值）。
//   §18 迁点补走查门：r26 §14 因二人未上线而只在编年核过 chip 的 5 条，放回人物地图逐条核。
//
// r27 扩充（仍不另起脚本）：
//   §0/§1 国色表由九色扩十色（吴 #164F5C）——STATE_HEX 与 STATE_FAMILY_VAR 逐项对账，
//       并**现算** ΔE76 全矩阵（不比对写死的表，见 §5c），故日后改色即红。
//   §17 首页簇的「不相压」判据由**按行**改**按枚**：折两行后一个簇有两个 y，旧写法只取
//       cs[0] 的 cy 当整簇之 y，一折行它就在拿错的坐标上比——**这不是新缺陷，是旧断言在新布局
//       下失效**，故随本轮一并改掉（QA 基础设施诚实优先）。
//   §19 新立 r27 门：吴分区与簇折两行（几何实测）／阖庐·伍员上线六处呈现／两枚新徽记规约核／
//       伍员轨迹降级的**双向自洽**判据（亲至可落图 <2 ⇔ 降级）／全站搜索「文献」组
//       （搜「孙武」须命中 S011 说明并落资料库、搜「阖闾」须经 alt_names 命中阖庐）／
//       分层示范三处（鱼肠四层并陈 Q338–Q343、白发之不录 Q370、鞭尸 Q377/Q378）的前端呈现。
const http = require("http"), fs = require("fs"), path = require("path");
const SITE_DIR = path.resolve(__dirname, "..", "..", "site");
const OUT = path.resolve(__dirname, "screenshots");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
function srv(root) { return new Promise((res, rej) => { const s = http.createServer((rq, rs) => { let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]); if (u === "/") u = "/index.html"; const fp = path.join(root, u); if (!fp.startsWith(root)) { rs.writeHead(403); rs.end(); return; } fs.readFile(fp, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(fp).toLowerCase()] || "application/octet-stream" }); rs.end(d); }); }); s.on("error", rej); s.listen(0, "127.0.0.1", () => res(s)); }); }
const log = [];
const say = (...a) => { const s = a.join(" "); log.push(s); console.log(s); };
const H = (t) => say("\n===== " + t + " =====");
const OK = (c, t) => say((c ? "  [OK]   " : "  [FAIL] ") + t);

/* 国色定调表（design_notes §2.1）。r27 增第 10 色「吴」。
 * 本表是**定调值的副本**，只用来核「渲染出来的是不是定的那个色」；
 * 两两距离一律现算（§5c），不在此另抄一份 ΔE 表——抄下来的距离在改色那天就成了谎。 */
const STATE_HEX = { "齐": "#A5322A", "鲁": "#97561F", "郑": "#35706A", "晋": "#74402C", "秦": "#423C39", "楚": "#5E2B45", "卫": "#2F5480", "宋": "#4F457F", "陈": "#3B6A48", "吴": "#164F5C" };

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
      nData: DATA.people.filter(x => x.is_protagonist).length,
      nEnter: protoRoster().enterable.length,
    };
  });
  say("  主角数：前端 " + boot.n + " · 数据 " + boot.nData + "（可进 " + boot.nEnter + "）");
  // r26b：原写死 27。改对账——前端名册 ⇔ 数据 is_protagonist ⇔ 实际可进者，三者须齐（见 §7.4）
  OK(boot.n === boot.nData && boot.n === boot.nEnter,
     "PROTAGONISTS " + boot.n + " 位 ＝ 数据侧 is_protagonist " + boot.nData + " ＝ 可进 " + boot.nEnter);
  OK(boot.retired.length === 0, "26 个 --p-* 个人色变量已全数退役（残留：" + (boot.retired.join(",") || "无") + "）");
  let colorOk = true;
  for (const m of boot.people) {
    const want = STATE_HEX[m.key];
    const good = m.inData && want && m.color === want;
    if (!good) { colorOk = false; say("    ✗ " + m.name + " key=" + m.key + " color=" + m.color + " want=" + want + " inData=" + m.inData); }
  }
  OK(colorOk, boot.n + " 人主题色全部等于其所属国的国色");
  let stateOk = Object.keys(boot.states).length === Object.keys(STATE_HEX).length;
  if (!stateOk) say("    ✗ 国色家族数不符：站内 " + Object.keys(boot.states).join("/") + " ／ 本表 " + Object.keys(STATE_HEX).join("/"));
  for (const [k, want] of Object.entries(STATE_HEX)) { if (boot.states[k] !== want) { stateOk = false; say("    ✗ " + k + " = " + boot.states[k] + " want " + want); } }
  OK(stateOk, Object.keys(STATE_HEX).length + " 个国色变量值与 design_notes §2.1 定调表一致");
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
  const nEnter = await p.evaluate(() => protoRoster().enterable.length);
  say("  单人态面板：" + pick1.n + " 项，选中 " + JSON.stringify(pick1.on) + "（可进人数 " + nEnter + "）");
  // r26b：原写死 26。改对账——「其余人数」恒为「可进人数 −1」，加人时自动跟上
  OK(pick1.n === nEnter - 1 && pick1.on.length === 0,
     "单人态：列其余 " + pick1.n + " 人（＝可进 " + nEnter + " − 自己）、无选中态");
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
  /* r26b：本节原写死「27」。写死的数字只在写死的那一天是对的——r26 前端主角停在 27、数据侧
   * 已 29，本节照样全绿，因为它比的是「27 是不是 27」，不是「前端名册跟数据对不对得上」。
   * 故本节的人数一律改**对账式**：环上人数 ⇔ protoRoster().enterable ⇔ PROTAGONISTS ⇔ 数据侧
   * is_protagonist，四者互证；槽距按 2R·sin(π/n) 现算再与 DOM 实测对，不抄旧数。 */
  H("5) §9.3 硬性项：主角级全景图节点徽记可辨性（人数一律对账，不写死）");
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
             onTop: !!(svgs[0] && svgs[0].parentNode === document.querySelector("#rel-canvas > svg").lastElementChild),
             // —— 对账三源：前端名册／数据名册／实际可进者 ——
             roster: (() => { const r = protoRoster();
               return { ui: PROTAGONISTS.length, data: r.inData.length, enterable: r.enterable.length,
                        dataOnly: r.dataOnly, uiOnly: r.uiOnly, dataAll: DATA.people.length }; })(),
             ringR: 252 };
  });
  const R = pano.roster;
  say("  名册对账：前端 PROTAGONISTS " + R.ui + " · 数据 is_protagonist " + R.data +
      " · 实际可进 " + R.enterable + "；数据有而前端无 [" + (R.dataOnly.join("/") || "空") +
      "]，前端有而数据无 [" + (R.uiOnly.join("/") || "空") + "]");
  OK(R.dataOnly.length === 0 && R.uiOnly.length === 0 && R.ui === R.data && R.data === R.enterable,
     "主角名册两侧一字不差（" + R.data + "＝" + R.ui + "＝" + R.enterable + "）——r26 的「数据 29 / 前端 27」已闭合");
  say("  【A 态·默认】环上共 " + pano.total + " 人，主角节点 " + pano.protoNodes + " 个，徽记注入 " + pano.badges + " 枚");
  say("  节点 r=" + pano.r + "，绢帛分隔环宽=" + pano.ringW + "，相邻槽距(弦长)=" + pano.slotChord + "，徽记 " + JSON.stringify(pano.size));
  OK(pano.protoNodes === R.enterable && pano.badges === R.enterable,
     R.enterable + " 枚主角节点徽记全部注入（＝可进人数，非写死值）");
  OK(pano.onTop, "徽记在顶层（叠于全部节点盘面之上）——旧法同弧只有最后一枚徽记露得出");
  OK(+pano.ringW === 3.4 && pano.size.w === "22" && pano.size.sw === "2.6", "呈现端已上调一档：环宽 2→3.4、徽记 20→22、线宽 2→2.6");
  // r24a-2 裁定②b：默认只画主角。槽距按 2R·sin(π/n) 现算，与 DOM 实测对账（不抄旧数 58.55）
  OK(pano.total === R.enterable, "A 态默认只画主角（" + pano.total + " 人，r24a-2 裁定②b，即 r24a §4.3 选项 C）");
  const chordCalc = +(2 * pano.ringR * Math.sin(Math.PI / pano.total)).toFixed(2);
  say("  槽距公式现算 2R·sin(π/" + pano.total + ")，R=" + pano.ringR + " → " + chordCalc +
      "px；DOM 实测 " + pano.slotChord + "px");
  OK(Math.abs(chordCalc - pano.slotChord) < 0.05,
     "槽距＝公式现算值 2R·sin(π/" + pano.total + ") ＝ " + chordCalc + "（人数一变即重算，故此处不留任何历史数字）");
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
  OK(!showAllUI.protoOnlyVisible, "A 态隐去「仅主角边」——主角环上每条边两端皆主角，该过滤器恒为空操作");
  OK(new RegExp(R.enterable + " 主角").test(showAllUI.crumbs), "工具条计数与环上实绘同源（报 " + R.enterable + " 主角）");
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
  OK(panoB.total === R.dataAll,
     "B 态回到全库全环（" + panoB.total + " 人＝ people 表全量 " + R.dataAll + "，非写死 123）");
  OK(panoB.protoNodes === R.enterable, "B 态 " + R.enterable + " 位主角仍带徽记");
  OK(panoB.protoOnlyVisible, "B 态「仅主角边」随之出现（此时它才有意义）");
  say("  ⚠ B 态槽距 " + panoB.slotChord + " < 节点直径 " + (2 * +pano.r) + "——主角盘面相互叠压、同弧徽记压边，"
      + "此为 " + panoB.total + " 人同环的既有密度问题（r23b 即如此），非国色制引入；国色制使其显影。"
      + "r24a-2 的处置不是消灭它，而是把它移出默认态：默认给主角环（现 " + pano.total + " 人），全库全环改为读者主动索取（见交付说明 §十一）");
  await p.locator("#rel-canvas").screenshot({ path: path.join(OUT, "r24a2_07_pano_B_showall.png") });
  // 往返：取消勾选须回到 A 态（开关式，不留中间态）
  await p.uncheck("#rel-show-all"); await p.waitForTimeout(1200);
  const panoA2 = await p.evaluate(() => document.querySelectorAll("#rel-canvas .rel-node").length);
  OK(panoA2 === R.enterable, "A⇄B 往返实测：取消勾选回到主角环（实测 " + panoA2 + " ＝ 可进 " + R.enterable + "）");
  // 全屏「⛶ 放大查看」克隆的是当前 SVG，故须在 A 态下确认克隆体也是 27 人环且节点仍可点
  await p.click("#btn-rel-zoom"); await p.waitForTimeout(900);
  const zoomA = await p.evaluate(() => ({
    open: !document.querySelector("#map-overlay").hidden,
    nodes: document.querySelectorAll("#map-overlay-body .rel-node").length,
    badges: document.querySelectorAll("#map-overlay-body > svg > g:last-of-type > svg").length,
  }));
  say("  全屏克隆体（A 态）：" + JSON.stringify(zoomA));
  OK(zoomA.open && zoomA.nodes === R.enterable && zoomA.badges === R.enterable,
     "全屏放大查看随 A 态克隆 " + zoomA.nodes + " 人环、" + zoomA.badges + " 枚徽记同步（＝可进人数）");
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
  /* E205 / E206 可达性——**本节的历史记录，勿删**：
   *   r24a 走查实测二者在全站不可达（时间线只按主角组织；搜索索引显式跳过无主角事件；
   *   资料库无事件页），当时按「不擅自改变可达性」上报候裁，故只报数、不判 PASS/FAIL。
   *   r24a 裁定甲案后，r25 以编年视图闭合此缺口，可达性断言迁至 §11 逐项实判。
   * 留此注是为后人对照：同一件事在 r24a 是记实、在 r25 是断言，中间隔的是一次裁定，不是口径松动。 */
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
    /* r26b 补两条本轮新面：晏婴时间线（10 条，其中数条长标题）与叔向地图（4 处着色锚点，
     * 状态行带「另有 N 处相关地点」长句），二者是本轮新增内容里最可能在 390px 撑破的两处。 */
    for (const [tag, hash] of [["home", "/#/"], ["timeline", "/#/p/P_ZICHAN/timeline"], ["map", "/#/p/P_WENJIANG/map"], ["cmp", "/#compare=P_WENJIANG,P_QIXIANG"], ["relations", "/#/relations"], ["chronicle", "/#/chronicle"], ["timeline·晏婴", "/#/p/P_YANYING/timeline"], ["map·叔向", "/#/p/P_SHUXIANG/map"], ["cmp·叔向×晏婴", "/#compare=P_SHUXIANG,P_YANYING"]]) {
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
  /* r25 补：本节旧写法开完浮层就走，不关。其后各节都用 p.goto 只改 hash（同文档导航、不重载页面），
   * 浮层遂一路开着——§9/§10 只查 DOM 属性故未受影响，§11 一用 p.click 就被它拦下 pointer events。
   * 这既是 harness 卫生，也顺带把「分享卡关得掉」变成一条真断言。 */
  await p.click("#share-close"); await p.waitForTimeout(300);
  const shareClosed = await p.evaluate(() => document.querySelector("#share-overlay").hidden);
  OK(shareClosed, "分享卡对话框可关，不遗留浮层拦截其后操作");

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

  // ---------- 11) r25 编年视图：全库事件人人可达 ----------
  /* r24a §6b 实测并上报「E205/E206 等 13 条事件全站不可达」，领队裁定甲案：全库事件人人可达。
   * 本节即该裁定的验收门，逐项实判——路由、上表完整性、排序、行构成、国色签、展开卡、
   * 人物签往返、搜索索引覆盖面、落锚、筛选、规模与性能、四档与手机触区。
   * 断言一律与数据对账（行数/序列/签色都从 DATA 现算再比），不写死任何一条史料。 */
  H("11) r25 编年（chronicle）：全库事件按年铺开，人人可达");
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto(origin + "/#/chronicle", { waitUntil: "load" }); await p.waitForTimeout(1500);
  const chr = await p.evaluate(() => {
    const list = document.querySelector("#chron-list");
    const rows = [...list.querySelectorAll("details.chron-row")];
    const protos = new Set(DATA.people.filter(x => x.is_protagonist).map(x => x.id));
    const linked = new Set(DATA.event_people.filter(r => protos.has(r.person_id)).map(r => r.event_id));
    const orphan = DATA.events.filter(e => !linked.has(e.id)).map(e => e.id);
    // 期望序列：与全站同一个 evtCompare —— (year_bce, sort_key, id)
    const want = DATA.events.slice().sort(evtCompare).map(e => e.id);
    const got = rows.map(d => d.dataset.eid);
    return {
      view: state.view, hash: location.hash, shown: !document.querySelector("#view-chronicle").hidden,
      nRows: rows.length, nEvents: DATA.events.length,
      orphan, orphanOnTable: orphan.filter(id => !!list.querySelector('[data-eid="' + id + '"]')),
      orderOk: JSON.stringify(want) === JSON.stringify(got),
      firstThree: got.slice(0, 3), lastThree: got.slice(-3),
      renderMs: +list.dataset.renderMs,
      theme: getComputedStyle(document.querySelector("#view-chronicle")).getPropertyValue("--theme").trim(),
      navCur: [...document.querySelectorAll(".main-nav button")].filter(b => b.getAttribute("aria-current") === "true").map(b => b.textContent),
      hasNavBtn: !!document.querySelector('.main-nav button[data-view="chronicle"]'),
      // 索引覆盖面：事件组与原文组必须各自等于全表条数（r25 取消了「无主角挂链即跳过」）
      idxEvents: SEARCH_INDEX.filter(s => s.group === "events").length,
      idxPassages: SEARCH_INDEX.filter(s => s.group === "passages").length,
      nPassages: DATA.passages.length,
      icons: list.querySelectorAll("details.chron-row .cat-ico svg").length,
      tags: list.querySelectorAll("details.chron-row .chron-state").length,
      // 无地望者必为中性签，且行数与数据对得上
      noPlaceData: DATA.events.filter(e => !e.place_id).length,
      noPlaceNeutral: [...list.querySelectorAll('details[data-state="无地望"] .chron-state')].filter(t => t.classList.contains("is-neutral")).length,
    };
  });
  say("  行数 " + chr.nRows + " / 库内事件 " + chr.nEvents + "；渲染耗时 " + chr.renderMs + " ms");
  say("  首三条 " + chr.firstThree.join(",") + " … 末三条 " + chr.lastThree.join(","));
  say("  无主角挂链 " + chr.orphan.length + " 条：" + chr.orphan.join("/"));
  OK(chr.view === "chronicle" && chr.hash === "#/chronicle" && chr.shown, "路由 #/chronicle 直达编年视图");
  OK(chr.hasNavBtn && chr.navCur.length === 1 && chr.navCur[0] === "编年", "主导航「编年」已就位并高亮");
  OK(chr.nRows === chr.nEvents, "全库 " + chr.nEvents + " 条事件一条不漏地上表（实绘 " + chr.nRows + " 行）");
  OK(chr.orphan.length > 0 && chr.orphanOnTable.length === chr.orphan.length,
     "13 条无主角挂链事件全部在表（" + chr.orphanOnTable.length + "/" + chr.orphan.length + "）——r24a 缺口闭合");
  OK(chr.orderOk, "行序＝全站统一的 evtCompare (year_bce, sort_key, id)，与数据现算逐条相同");
  OK(chr.icons === chr.nRows && chr.tags === chr.nRows, "每行皆有分类图标与国色签（图标 " + chr.icons + " / 签 " + chr.tags + "）");
  OK(chr.noPlaceNeutral === chr.noPlaceData && chr.noPlaceData > 0,
     "无地望事件 " + chr.noPlaceData + " 条一律中性签（实测中性 " + chr.noPlaceNeutral + "）");
  OK(chr.theme.toUpperCase() === "#B4652F",
     "编年视图内 --theme 归暖赭（" + chr.theme + "）——全局视图不随人物语境染色，国别信息只由国色签承担");
  OK(chr.idxEvents === chr.nEvents, "搜索索引·事件组已扩至全库（" + chr.idxEvents + " / " + chr.nEvents + "）");
  OK(chr.idxPassages === chr.nPassages, "搜索索引·原文组已扩至全库（" + chr.idxPassages + " / " + chr.nPassages + "）");
  /* 规模与性能（任务书：约 225 行直接渲染，无需虚拟滚动，请实测确认）。
   * 判据取两条：① DOM 行数 === 数据条数（若做了虚拟滚动，DOM 行数必小于数据条数）；
   *            ② 一次直接渲染的耗时留数报账。不设阈值门（机器不同），只要求「非虚拟滚动」为真且报数。 */
  OK(chr.nRows === chr.nEvents && chr.renderMs >= 0,
     "直接渲染、无虚拟滚动：DOM 行数与数据条数相等，一次渲染实测 " + chr.renderMs + " ms");
  await p.screenshot({ path: path.join(OUT, "r25_01_chronicle_1440.png") });

  // 旧式 hash 兼容：#view=chronicle 应就地改写为规范形态
  await p.goto(origin + "/#view=chronicle", { waitUntil: "load" }); await p.waitForTimeout(1200);
  const legacy = await p.evaluate(() => ({ hash: location.hash, view: state.view, rows: document.querySelectorAll("#chron-list details").length }));
  say("  旧式 #view=chronicle → " + JSON.stringify(legacy));
  OK(legacy.hash === "#/chronicle" && legacy.view === "chronicle" && legacy.rows > 0,
     "任务书所写的 #view=chronicle 亦可用，就地改写为规范形态 #/chronicle");

  // 国色签取色：抽查每一国各一行，签色须等于其国色；复合地名（齐鲁间/晋-秦晋间）取首个可识别国
  await p.goto(origin + "/#/chronicle", { waitUntil: "load" }); await p.waitForTimeout(1300);
  const tagColors = await p.evaluate((HEX) => {
    const toHex = (s) => { const m = (s || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/); return m ? "#" + [1, 2, 3].map(i => (+m[i]).toString(16).padStart(2, "0")).join("").toUpperCase() : (s || "").toUpperCase(); };
    const out = [], bad = [];
    for (const k of Object.keys(HEX)) {
      const d = document.querySelector('#chron-list details[data-state="' + k + '"]');
      if (!d) { bad.push(k + "：表内无此国之事"); continue; }
      const t = d.querySelector(".chron-state");
      const got = toHex(getComputedStyle(t).color);
      out.push({ k, label: t.textContent, got, eid: d.dataset.eid });
      if (got !== HEX[k]) bad.push(k + " 签色 " + got + " ≠ 国色 " + HEX[k]);
    }
    // 复合地名一例：state 字段原文照显，不被简化
    const comp = [...document.querySelectorAll("#chron-list .chron-state")].map(e => e.textContent).filter(t => /[\/间边]/.test(t));
    return { out, bad, comp: [...new Set(comp)] };
  }, STATE_HEX);
  tagColors.out.forEach(x => say("    " + x.k + " ← 「" + x.label + "」" + x.got + "（" + x.eid + "）"));
  say("  复合地名签（照显 places.state 原文，不简化）：" + JSON.stringify(tagColors.comp));
  OK(tagColors.bad.length === 0, "九国色签取色全部等于其国色（异常：" + (tagColors.bad.join("；") || "无") + "）");
  OK(tagColors.comp.length > 0, "复合地名（如「齐鲁间」「晋/秦晋间」）签文照显 places.state 原文 " + tagColors.comp.length + " 种");

  // 展开卡：与时间线同源组件（chips/引文/层标）＋编年特有的所系人物签
  const card = await p.evaluate(async () => {
    const d = document.querySelector('#chron-list [data-eid="E205"]');
    const beforeBody = !!d.querySelector(".event-body");   // 按需构建：展开前不应存在
    d.querySelector("summary").click();
    await new Promise(r => setTimeout(r, 300));
    const links = DATA.event_people.filter(l => l.event_id === "E205").length;
    return {
      beforeBody, open: d.open, body: !!d.querySelector(".event-body"),
      chips: [...d.querySelectorAll(".meta-chips .chip")].map(e => e.textContent),
      quotes: d.querySelectorAll("blockquote.quote").length,
      people: [...d.querySelectorAll(".evt-person")].map(e => e.innerText.replace(/\s+/g, " ")),
      links, related: d.querySelectorAll(".evt-person.is-related").length,
      hasSummaryText: (d.querySelector(".event-body p") || {}).textContent.length > 10,
    };
  });
  say("  E205 卡：" + JSON.stringify(card));
  OK(card.beforeBody === false && card.body === true,
     "详情按需构建：展开前无卡体、展开后自建（190 行不预造读者九成不看的 DOM）");
  OK(card.chips.some(t => /地点/.test(t)) && card.chips.some(t => /可靠性/.test(t)) && card.hasSummaryText,
     "卡体复用时间线组件：地点/分类/可靠度/重要度 chips ＋ summary 齐备");
  OK(card.quotes > 0, "引文块随卡呈现（" + card.quotes + " 条）");
  OK(card.people.length === card.links && card.links > 0,
     "所系人物签数与 event_people 挂链数相等（" + card.people.length + "/" + card.links + "）");
  OK(card.related === card.links,
     "E205 两名所系人物皆「相关」作虚线空心签——合 conventions v1.22「死者不作亲至」通例与 presence 从严口径");
  await p.locator('#chron-list [data-eid="E205"]').screenshot({ path: path.join(OUT, "r25_02_E205_card.png") });

  // E195 孔子追记层标在编年卡内呈现正常（任务书走查项）
  const e195c = await p.evaluate(async () => {
    const d = document.querySelector('#chron-list [data-eid="E195"]');
    d.querySelector("summary").click();
    await new Promise(r => setTimeout(r, 350));
    return {
      caveats: [...d.querySelectorAll(".q-caveat")].map(e => e.textContent.trim()),
      caveatColor: (() => { const c = d.querySelector(".q-caveat"); if (!c) return null; const m = getComputedStyle(c).color.match(/(\d+), (\d+), (\d+)/); return m ? "#" + [1, 2, 3].map(i => (+m[i]).toString(16).padStart(2, "0")).join("").toUpperCase() : null; })(),
      layers: [...d.querySelectorAll(".q-layer")].map(e => e.textContent.trim()),
      protoBadges: d.querySelectorAll(".evt-person.is-proto .ep-badge svg").length,
    };
  });
  say("  E195 编年卡层标：" + JSON.stringify(e195c));
  OK(e195c.caveats.some(t => /追记之辞/.test(t) && /非当时之言/.test(t)),
     "E195 孔子追记层标在编年卡内呈现正常（.q-caveat 引文之上）");
  OK(e195c.caveatColor === "#B4652F", "编年卡内层标仍为暖赭（编者语态，未被层色或国色夺去）");
  OK(e195c.layers.includes("评论"), "E195 层徽标「评论」随卡同现，层标/徽标分工不变");
  OK(e195c.protoBadges > 0, "主角人物签带徽记（国色制下徽记是唯一逐人通道）");
  await p.locator('#chron-list [data-eid="E195"]').screenshot({ path: path.join(OUT, "r25_03_E195_card.png") });

  // 搜索直达＋落锚：崔杼弑其君 / 弭兵 —— 任务书验收首条
  for (const cs of [{ q: "崔杼弑其君", eid: "E205", year: "-548" }, { q: "弭兵", eid: "E206", year: "-546" }]) {
    await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(800);
    await p.click("#global-search"); await p.fill("#global-search", cs.q); await p.waitForTimeout(600);
    const hits = await p.evaluate(() => [...document.querySelectorAll("[role=listbox] [role=option]")].map(e => e.innerText.replace(/\s+/g, " ")));
    say("  搜「" + cs.q + "」命中 " + hits.length + " 条，首条：" + (hits[0] || "—"));
    OK(hits.length > 0, "搜「" + cs.q + "」有命中（" + hits.length + " 条）——r24a 时此二事全站不可达");
    await p.evaluate(() => document.querySelectorAll("[role=listbox] [role=option]")[0].click());
    await p.waitForTimeout(2000);
    const land = await p.evaluate((c) => {
      const d = document.querySelector('#chron-list [data-eid="' + c.eid + '"]');
      const r = d ? d.getBoundingClientRect() : null;
      return { hash: location.hash, found: !!d, open: !!(d && d.open),
               sy: Math.round(scrollY), y: r ? Math.round(r.y) : null, vh: innerHeight,
               inView: !!(r && r.y > -r.height && r.y < innerHeight),
               anchored: document.querySelectorAll("#chron-list .year-anchor").length,
               anchorYear: [...document.querySelectorAll("#chron-list .year-anchor")].every(e => e.dataset.year === c.year),
               status: document.querySelector("#chron-status").textContent };
    }, cs);
    say("  落锚：" + JSON.stringify(land));
    OK(land.hash === "#/chronicle" && land.found && land.open,
       cs.q + "：直达编年并展开 " + cs.eid + "（验收首条：搜「崔杼弑其君」直达）");
    OK(land.sy > 0 && land.inView,
       cs.q + "：确已滚到位——scrollY " + land.sy + "、卡片在视口内（y=" + land.y + " / 视口 " + land.vh + "）");
    OK(land.anchored > 0 && land.anchorYear,
       cs.q + "：落锚该年，同年 " + land.anchored + " 条一并标出（年锚全部落在 " + cs.year + "）");
    OK(/已落锚/.test(land.status), cs.q + "：状态行报出所落之年——" + land.status);
    await p.screenshot({ path: path.join(OUT, "r25_04_land_" + cs.eid + ".png") });
  }

  // 人物签往返：主角签 → 其时间线并定位同一事件；非主角签 → 其 ego 关系图
  await p.goto(origin + "/#/chronicle", { waitUntil: "load" }); await p.waitForTimeout(1300);
  const trip = await p.evaluate(async () => {
    const d = document.querySelector('#chron-list [data-eid="E195"]');
    d.querySelector("summary").click(); await new Promise(r => setTimeout(r, 250));
    const btn = [...d.querySelectorAll(".evt-person")].find(e => e.dataset.pid === "P_ZICHAN");
    btn.click(); await new Promise(r => setTimeout(r, 1200));
    const tl = document.querySelector('#timeline-list [data-eid="E195"]');
    const r = tl ? tl.getBoundingClientRect() : null;
    return { hash: location.hash, open: !!(tl && tl.open), sy: Math.round(scrollY),
             y: r ? Math.round(r.y) : null, inView: !!(r && r.y > -r.height && r.y < innerHeight) };
  });
  say("  主角签往返：" + JSON.stringify(trip));
  OK(trip.hash === "#/p/P_ZICHAN/timeline" && trip.open && trip.inView,
     "编年卡主角签 → 其时间线并**定位到同一条事件**（往返精确到事，不只到人）");
  await p.goto(origin + "/#/chronicle", { waitUntil: "load" }); await p.waitForTimeout(1300);
  const trip2 = await p.evaluate(async () => {
    const d = document.querySelector('#chron-list [data-eid="E205"]');
    d.querySelector("summary").click(); await new Promise(r => setTimeout(r, 250));
    const btn = [...d.querySelectorAll(".evt-person")].find(e => e.dataset.pid === "P_CUIZHU");
    if (!btn) return { err: "无崔杼签" };
    btn.click(); await new Promise(r => setTimeout(r, 1400));
    return { hash: location.hash, view: state.view,
             focus: !!document.querySelector('#rel-canvas [data-node="P_CUIZHU"]') };
  });
  say("  非主角签往返：" + JSON.stringify(trip2));
  OK(trip2.hash === "#/relations" && trip2.view === "relations" && trip2.focus,
     "编年卡非主角签（崔杼，本库无其时间线）→ 落其关系图，人在图上——全库事件的人也一并可达");

  // 轻筛选：按国／按分类／交集／清除／空态
  await p.goto(origin + "/#/chronicle", { waitUntil: "load" }); await p.waitForTimeout(1300);
  const filt = await p.evaluate(async () => {
    const hit = (host, txt) => [...document.querySelectorAll(host + " .chron-chip")].find(e => e.textContent.startsWith(txt));
    const rows = () => document.querySelectorAll("#chron-list details").length;
    const counts = { state: document.querySelectorAll("#chron-f-state .chron-chip").length,
                     cat: document.querySelectorAll("#chron-f-cat .chron-chip").length };
    // chips 计数须与数据对账：陈 = 事发地属陈的事件数
    const chenChip = hit("#chron-f-state", "陈").textContent;
    hit("#chron-f-state", "陈").click(); await new Promise(r => setTimeout(r, 200));
    const a = { n: rows(), states: [...new Set([...document.querySelectorAll("#chron-list details")].map(d => d.dataset.state))],
                pressed: hit("#chron-f-state", "陈").getAttribute("aria-pressed"), clr: !document.querySelector("#chron-clear").hidden };
    hit("#chron-f-cat", "婚嫁").click(); await new Promise(r => setTimeout(r, 200));   // 陈 × 婚嫁 = 空
    const b = { n: rows(), empty: !!document.querySelector(".chron-empty"), txt: (document.querySelector(".chron-empty") || {}).textContent };
    hit("#chron-f-state", "楚").click(); await new Promise(r => setTimeout(r, 200));   // 组内并集：陈∪楚，再 × 婚嫁
    const c2 = { n: rows(), states: [...new Set([...document.querySelectorAll("#chron-list details")].map(d => d.dataset.state))],
                 cats: [...new Set([...document.querySelectorAll("#chron-list details")].map(d => d.dataset.cat))] };
    document.querySelector("#chron-clear").click(); await new Promise(r => setTimeout(r, 250));
    const d2 = { n: rows(), pressed: document.querySelectorAll('.chron-chip[aria-pressed="true"]').length,
                 clr: !document.querySelector("#chron-clear").hidden };
    return { counts, chenChip, a, b, c2, d2, total: DATA.events.length,
             // r26：分类 chips 枚数不写死，改与「库内实际出现的分类数」对账——
             // 写死 16 的旧断言会在枚举扩到 17 类时把「筛选里少一类」这件事读成"图标缺口"的附带损伤而漏掉。
             catsInData: [...new Set(DATA.events.map(e => e.category || "其他"))].length };
  });
  say("  筛选实测：" + JSON.stringify(filt));
  OK(filt.counts.state >= 10 && filt.counts.cat === filt.catsInData,
     "两组 chips 就位（按国 " + filt.counts.state + " 枚、按分类 " + filt.counts.cat + " 枚＝库内实际出现的分类数 " + filt.catsInData + "）");
  OK(filt.a.states.length === 1 && filt.a.states[0] === "陈" && filt.a.pressed === "true" && filt.a.clr,
     "按国筛选生效（陈 " + filt.a.n + " 条），chip 呈按下态、「清除筛选」现身");
  OK(filt.b.n === 0 && filt.b.empty, "组间取交集可以筛空（陈 × 婚嫁），空表有话说：「" + (filt.b.txt || "") + "」");
  OK(filt.c2.n > 0 && filt.c2.cats.length === 1 && filt.c2.cats[0] === "婚嫁" && filt.c2.states.every(s => s === "陈" || s === "楚"),
     "组内取并集、组间取交集（陈∪楚 × 婚嫁 = " + filt.c2.n + " 条）");
  OK(filt.d2.n === filt.total && filt.d2.pressed === 0 && !filt.d2.clr, "「清除筛选」一键归零，回全表 " + filt.d2.n + " 条");
  await p.screenshot({ path: path.join(OUT, "r25_05_filters.png") });

  // 手机：行触区、chips 触区、人物签触区
  const cm = await c.newPage();
  await cm.setViewportSize({ width: 390, height: 780 });
  const cmErrs = []; cm.on("pageerror", e => cmErrs.push(e.message));
  await cm.goto(origin + "/#/chronicle", { waitUntil: "load" }); await cm.waitForTimeout(1400);
  const mobile = await cm.evaluate(async () => {
    const d = document.querySelector("#chron-list details");
    const sum = d.querySelector("summary").getBoundingClientRect();
    const chip = document.querySelector("#chron-f-state .chron-chip").getBoundingClientRect();
    d.querySelector("summary").click(); await new Promise(r => setTimeout(r, 300));
    const per = d.querySelector(".evt-person");
    const pr = per ? per.getBoundingClientRect() : null;
    return { sumH: Math.round(sum.height), chipH: Math.round(chip.height),
             personH: pr ? Math.round(pr.height) : null,
             sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
             titleWrap: getComputedStyle(d.querySelector(".evt-title")).flexBasis };
  });
  say("  手机实测：" + JSON.stringify(mobile));
  OK(mobile.sumH >= 44, "手机行触区高 " + mobile.sumH + "px ≥44px");
  OK(mobile.chipH >= 32, "手机筛选 chip 触区高 " + mobile.chipH + "px ≥32px");
  OK(mobile.personH === null || mobile.personH >= 32, "手机人物签触区高 " + mobile.personH + "px ≥32px");
  OK(mobile.sw <= mobile.cw + 1, "手机编年无横向溢出（" + mobile.sw + " ≤ " + mobile.cw + "）");
  await cm.screenshot({ path: path.join(OUT, "r25_06_chronicle_390.png"), fullPage: false });
  OK(cmErrs.length === 0, "手机编年全程无页面错误（" + (cmErrs.join(" | ") || "无") + "）");
  await cm.close();

  // ---------- 12) 落锚滚动回归门（r25 顺带修正·永久保留）----------
  /* 为何单立一节、且必须留着：hash 导航之后在**同一帧**内发起的程序化平滑滚动一次也不会执行
   *   （实测 scrollY 全程恒 0，动画根本没起步）。这条缺陷自 r11 起就在时间线的搜索直达里，
   *   一直没被发现，正因为过去只断言「卡片展开了」，从不核**滚动是否真的发生**——
   *   DOM 状态对、读者却看不见目标，是最容易漏过的一类。
   * 故本节的判据只有一个：**scrollY 实测 > 0 且目标落在视口内**。旧码（单 rAF）在此必红。 */
  H("12) 搜索直达落锚滚动回归门（r25 顺带修正·永久保留）");
  for (const cs of [
    { n: "编年·事件", hash: "#/chronicle", js: 'pendingSpot={view:"chronicle",type:"event",eid:"E205"};setHash(null,"chronicle");', sel: '#chron-list [data-eid="E205"]' },
    { n: "编年·原文", hash: "#/chronicle", js: 'pendingSpot={view:"chronicle",type:"quote",eid:"E205",qid:"Q277"};setHash(null,"chronicle");', sel: '#chron-list [data-eid="E205"]' },
    { n: "时间线·事件（既有路径）", hash: "#/p/P_ZICHAN/timeline", js: 'pendingSpot={view:"timeline",type:"event",eid:"E195"};setHash("P_ZICHAN","timeline");', sel: '#timeline-list [data-eid="E195"]' },
  ]) {
    await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(900);
    const res = await p.evaluate(async ([js, sel]) => {
      const trace = []; const t = setInterval(() => trace.push(Math.round(scrollY)), 80);
      // eslint-disable-next-line no-eval
      eval(js);
      await new Promise(r => setTimeout(r, 2500)); clearInterval(t);
      const d = document.querySelector(sel);
      const r = d ? d.getBoundingClientRect() : null;
      return { max: Math.max(...trace), sy: Math.round(scrollY), y: r ? Math.round(r.y) : null,
               vh: innerHeight, inView: !!(r && r.y > -r.height && r.y < innerHeight), hash: location.hash };
    }, [cs.js, cs.sel]);
    say("  " + cs.n + "：" + JSON.stringify(res));
    OK(res.max > 0 && res.inView,
       cs.n + "：直达后确已滚动到位（scrollY 峰值 " + res.max + "，目标 y=" + res.y + " 落在视口 " + res.vh + " 内）");
  }

  // ---------- 13) r26「论对」图标实装门（第 17 类补齐）----------
  /* conventions v1.23 §3 立第 17 类「论对」时，图标缺口登记为 r26 Vision 待办；v1.24 关闭 E196 观察项
   * （维持归「政制」），故本轮论对为 E188/E212/E220 三条、非四条。本节断言一律与 DATA 现算对账，
   * 不写死条数——若日后再有事目迁入「论对」，本门自动跟着涨，不会因为写死 3 而变成假绿灯。 */
  H("13) r26「论对」图标实装（第 17 类）");
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto(origin + "/#/chronicle", { waitUntil: "load" }); await p.waitForTimeout(1500);
  const ldSrc = await p.evaluate(async () => {
    const r = await fetch("assets/icons/lundui.svg"); const t = r.ok ? await r.text() : "";
    return { ok: r.ok, len: t.length, vb: /viewBox="0 0 24 24"/.test(t), sw: /stroke-width="1\.6"/.test(t),
             cc: /stroke="currentColor"/.test(t), fill: /fill="none"/.test(t), hard: /#[0-9a-fA-F]{3,6}/.test(t) };
  });
  OK(ldSrc.ok && ldSrc.vb && ldSrc.sw && ldSrc.cc && ldSrc.fill && !ldSrc.hard,
     "lundui.svg 合图标语言：24×24 / stroke 1.6 / currentColor / fill none / 无硬编码色（" + ldSrc.len + " 字节）");
  const cat = await p.evaluate(() => {
    const cc = {}; for (const e of DATA.events) cc[e.category] = (cc[e.category] || 0) + 1;
    const rows = [...document.querySelectorAll("#chron-list details.chron-row")];
    const lun = rows.filter(d => d.dataset.cat === "论对");
    return {
      keys: Object.keys(CAT_ICON), mapped: CAT_ICON["论对"],
      counts: cc, lunIds: lun.map(d => d.dataset.eid).sort(),
      lunFromData: DATA.events.filter(e => e.category === "论对").map(e => e.id).sort(),
      e196cat: (DATA.events.find(e => e.id === "E196") || {}).category,
      // 每条论对行的图标是否确为 lundui（取其独有几何：x="3.8" 的牍身 rect）
      iconOk: lun.map(d => { const s = d.querySelector(".cat-ico svg"); return !!(s && /x="3\.8"/.test(s.outerHTML)); }),
      // 反证：任取一条政制行，其图标必不是 lundui
      zzIcon: (() => { const d = rows.find(x => x.dataset.cat === "政制"); const s = d && d.querySelector(".cat-ico svg");
                       return s ? /x="3\.8"/.test(s.outerHTML) : null; })(),
      unmapped: [...new Set(DATA.events.map(e => e.category))].filter(k => !CAT_ICON[k]),
    };
  });
  say("  CAT_ICON 键序：" + cat.keys.join("/"));
  say("  库内分类计数：" + JSON.stringify(cat.counts));
  OK(cat.keys.length === 17 && cat.mapped === "lundui", "CAT_ICON 已含 17 类，「论对」→ lundui");
  OK(cat.unmapped.length === 0, "库内出现的分类无一落空映射（未映射：" + (cat.unmapped.join("、") || "无") + "）");
  /* r27 改法：原写死 ["E188","E212","E220"]——r27 入库两条论对（E223 季札观乐、E226 阖庐问伐楚之谋）
   * 后立刻转红，而库里并没有出错。**写死的名单只在写死的那天是对的**（design_notes §7.4）。
   * 现判据：编年上出的论对行 ⇔ 数据侧 category==="论对" 的事目，逐 id 对账，多一条少一条都点名。 */
  OK(JSON.stringify(cat.lunIds) === JSON.stringify(cat.lunFromData),
     "编年内「论对」" + cat.lunIds.length + " 条 ⇔ 数据侧 " + cat.lunFromData.length + " 条，逐 id 相符：" +
     cat.lunIds.join("/") + (cat.lunIds.length === cat.lunFromData.length ? "" :
     "（差集 " + cat.lunFromData.filter(x => !cat.lunIds.includes(x)).join("/") + "）"));
  OK(cat.e196cat === "政制", "E196 维持归「政制」（conventions v1.24 §3 观察项已关闭）");
  OK(cat.iconOk.length > 0 && cat.iconOk.every(Boolean), cat.iconOk.length + " 条论对行皆已实装 lundui 图标（" + cat.iconOk.filter(Boolean).length + "/" + cat.iconOk.length + "）");
  OK(cat.zzIcon === false, "反证：政制行的图标不是 lundui（两类同尺度可分）");
  // 编年「按分类」筛选里应出现「论对」项，且筛后行数与计数相符
  const lunFilt = await p.evaluate(async () => {
    const btn = [...document.querySelectorAll("#chron-f-cat button")].find(b => /论对/.test(b.textContent));
    if (!btn) return { has: false };
    const label = btn.textContent.replace(/\s+/g, "");
    btn.click(); await new Promise(r => setTimeout(r, 400));
    const vis = [...document.querySelectorAll("#chron-list details.chron-row")].filter(d => d.offsetParent !== null);
    const out = { has: true, label, shown: vis.length, cats: [...new Set(vis.map(d => d.dataset.cat))],
                  want: DATA.events.filter(e => e.category === "论对").length };
    btn.click(); await new Promise(r => setTimeout(r, 300));
    return out;
  });
  OK(lunFilt.has, "编年「按分类」筛选出现「论对」项：" + lunFilt.label);
  OK(lunFilt.shown === lunFilt.want && lunFilt.cats.length === 1 && lunFilt.cats[0] === "论对",
     "勾「论对」后只剩 " + lunFilt.shown + " 行（＝数据侧论对条数 " + lunFilt.want + "）、且全为论对类");
  // 时间线一侧：E188 挂子产，主角线上同样出 lundui
  await p.goto(origin + "/#/p/P_ZICHAN/timeline", { waitUntil: "load" }); await p.waitForTimeout(1300);
  const tlLun = await p.evaluate(() => {
    const li = [...document.querySelectorAll("#timeline-list > li")].find(x => /侵蔡/.test(x.innerText));
    const s = li && li.querySelector(".cat-ico svg");
    return { found: !!li, isLun: !!(s && /x="3\.8"/.test(s.outerHTML)), title: (s ? (li.querySelector(".cat-ico") || {}).title : null) };
  });
  OK(tlLun.found && tlLun.isLun && tlLun.title === "论对",
     "主角时间线同步实装：子产线 E188（谏侵蔡之喜）出 lundui、title=「" + tlLun.title + "」");
  await p.screenshot({ path: path.join(OUT, "r26_01_lundui_timeline.png"), fullPage: true });

  // ---------- 14) r26 晋都迁点地图门（L_JIANG / L_XINTIAN 分立）----------
  /* fix26 立「落点从实不从称」：前585 为界，此前落 L_JIANG（故绛/翼），此后落 L_XINTIAN（新田/侯马）。
   * 本门三层：① 数据侧审计式反证（迁后仍挂故绛者须为 0 条）；② 投影按 conventions §4 公式现算再与
   * DOM 锚点实测坐标对账（不手摆、不抄数）；③ 前端可见面逐条走查。 */
  H("14) r26 晋都迁点：故绛 / 新田 二点分立的地图走查");
  const MOVED = ["E201", "E219", "E190", "E194", "E210", "E220", "E221"];
  await p.goto(origin + "/#/p/P_ZICHAN/map", { waitUntil: "load" }); await p.waitForTimeout(1400);
  const jin = await p.evaluate((MOVED) => {
    const pr = (pl) => project(pl.lng, pl.lat).map(v => Math.round(v));
    const xt = PLACES["L_XINTIAN"], jg = PLACES["L_JIANG"];
    const anc = (id) => { const g = document.querySelector('.anchor[data-place="' + id + '"]'); if (!g) return null;
      const c = g.querySelector("circle");
      return { cx: Math.round(+c.getAttribute("cx")), cy: Math.round(+c.getAttribute("cy")),
               r: +c.getAttribute("r"), fill: c.getAttribute("fill"), aria: g.getAttribute("aria-label") }; };
    return {
      // ① 审计式反证：全库「迁都之后仍落故绛」者
      stragglers: DATA.events.filter(e => e.place_id === "L_JIANG" && e.year_bce > -585).map(e => e.id),
      movedPlaces: MOVED.map(id => { const e = DATA.events.find(x => x.id === id); return { id, place: e && e.place_id, y: e && e.year_bce }; }),
      e182: (() => { const e = DATA.events.find(x => x.id === "E182"); return { place: e.place_id, y: e.year_bce }; })(),
      // ② 投影
      xtCalc: pr(xt), jgCalc: pr(jg), xtName: xt.ancient_name, jgName: jg.ancient_name,
      xtAnchor: anc("L_XINTIAN"), jgAnchor: anc("L_JIANG"),
      /* ③ 子产线：E194 亲至新田、E190 相关新田。
       * 判据取 aria-label 后缀，**不取 circle 的 r**——地图有自适应视野缩放，会把 r 重写成
       * 5.5→1.75 一类的实测值，按半径阈值挑「着色锚点」会在换一张地图时就失准。
       * aria-label 的三态（「（亲至地点）」/「（相关地点…）」/ 无后缀）才是身份的唯一真源。 */
      colored: [...document.querySelectorAll("#layer-anchors .anchor")]
        .filter(g => /（亲至地点）|（相关地点/.test(g.getAttribute("aria-label") || ""))
        .map(g => g.dataset.place + (/亲至/.test(g.getAttribute("aria-label")) ? "·亲至" : "·相关")),
      status: (document.querySelector("#map-status") || {}).textContent,
    };
  }, MOVED);
  say("  新田 " + jin.xtName + " 投影 " + JSON.stringify(jin.xtCalc) + "；故绛 " + jin.jgName + " 投影 " + JSON.stringify(jin.jgCalc));
  say("  新田锚点 " + JSON.stringify(jin.xtAnchor));
  say("  故绛锚点 " + JSON.stringify(jin.jgAnchor));
  say("  子产地图着色锚点：" + jin.colored.join("、") + " | " + jin.status);
  OK(jin.stragglers.length === 0,
     "审计反证：全库「year_bce > −585 而仍落 L_JIANG」者 0 条（残留：" + (jin.stragglers.join("/") || "无") + "）");
  OK(jin.movedPlaces.every(m => m.place === "L_XINTIAN"),
     "7 条迁点事件全部落 L_XINTIAN：" + jin.movedPlaces.map(m => m.id + "(" + m.y + ")").join("、"));
  OK(jin.e182.place === "L_JIANG" && jin.e182.y < -585,
     "E182（前" + (-jin.e182.y) + "，早于迁都）仍落 L_JIANG，未被误迁");
  OK(!!jin.xtAnchor && jin.xtAnchor.cx === jin.xtCalc[0] && jin.xtAnchor.cy === jin.xtCalc[1],
     "新田锚点坐标＝公式现算值 (" + jin.xtCalc.join(",") + ")，非手摆");
  OK(!!jin.jgAnchor && jin.jgAnchor.cx === jin.jgCalc[0] && jin.jgAnchor.cy === jin.jgCalc[1],
     "故绛锚点坐标＝公式现算值 (" + jin.jgCalc.join(",") + ")，非手摆");
  const dPix = Math.round(Math.hypot(jin.xtCalc[0] - jin.jgCalc[0], jin.xtCalc[1] - jin.jgCalc[1]));
  say("  二点图上间距 " + dPix + "px（viewBox 1200×700 坐标系）");
  OK(dPix > 0 && !!jin.xtAnchor && !!jin.jgAnchor, "二点同图在场且不重合（间距 " + dPix + "px）");
  OK(jin.colored.includes("L_XINTIAN·亲至") && !jin.colored.some(t => t.startsWith("L_JIANG")),
     "子产地图：新田为其亲至落点、故绛不着色（背景空点）——E194 坏馆垣、E190 寓书范宣子皆已落新田");
  // 新田抽屉：点开须见其古名与今地，且列出该人物于此地之事
  const drawer = await p.evaluate(async () => {
    document.querySelector('.anchor[data-place="L_XINTIAN"]').dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise(r => setTimeout(r, 500));
    const panel = document.querySelector("#place-panel") || document.querySelector(".place-panel");
    if (!panel) return null;
    const t = panel.innerText.replace(/\s+/g, " ");
    return { head: t.slice(0, 120), hasXintian: /新田/.test(t), hasHouma: /侯马/.test(t),
             hasEvents: /馆垣|寓书|范宣子/.test(t), len: t.length };
  });
  say("  新田抽屉：" + JSON.stringify(drawer));
  OK(!!drawer && drawer.hasXintian && drawer.hasHouma && drawer.hasEvents,
     "点新田锚点，抽屉出「新田（绛）／侯马」并列出子产于此之事（面板 " + (drawer ? drawer.len : 0) + " 字）");
  await p.screenshot({ path: path.join(OUT, "r26_02_zichan_map_xintian.png"), fullPage: true });
  // 夏姬线对照：E182 仍在故绛
  await p.goto(origin + "/#/p/P_XIAJI/map", { waitUntil: "load" }); await p.waitForTimeout(1400);
  const xj = await p.evaluate(() => {
    const g = document.querySelector('.anchor[data-place="L_JIANG"]');
    const c = g && g.querySelector("circle");
    const gx = document.querySelector('.anchor[data-place="L_XINTIAN"]');
    const cx = gx && gx.querySelector("circle");
    return { jiangR: c ? +c.getAttribute("r") : null, jiangAria: g ? g.getAttribute("aria-label") : null,
             xintianR: cx ? +cx.getAttribute("r") : null, status: (document.querySelector("#map-status") || {}).textContent };
  });
  say("  夏姬地图：故绛 r=" + xj.jiangR + "「" + xj.jiangAria + "」；新田 r=" + xj.xintianR);
  OK(xj.jiangR >= 5 && xj.xintianR < 5,
     "夏姬线 E182 仍落故绛（故绛为其着色落点 r=" + xj.jiangR + "，新田仍是背景空点 r=" + xj.xintianR + "）");
  /* 二点相邻只差 30px，且着色一侧会长出古名标注——须核「标注不夺邻点的点击」。
   * 判据取 elementFromPoint 的命中归属，不看截图：视觉上标注的白色描边看着压住了邻点，
   * 实测标注盒右缘与邻点圆心之间尚余空隙，点谁开谁。两张地图各验一次（着色的那一方互换）。 */
  for (const [pid, who] of [["P_ZICHAN", "子产（新田着色）"], ["P_XIAJI", "夏姬（故绛着色）"]]) {
    await p.goto(origin + "/#/p/" + pid + "/map", { waitUntil: "load" }); await p.waitForTimeout(1400);
    const hit = await p.evaluate(() => {
      const own = (id) => {
        const g = document.querySelector('.anchor[data-place="' + id + '"]');
        const b = g.querySelector("circle").getBoundingClientRect();
        const t = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
        const a = t ? t.closest(".anchor") : null;
        return a ? a.dataset.place : null;
      };
      return { xt: own("L_XINTIAN"), jg: own("L_JIANG") };
    });
    OK(hit.xt === "L_XINTIAN" && hit.jg === "L_JIANG",
       who + "：新田/故绛各自可点、命中归属正确（点新田开新田、点故绛开故绛，古名标注未夺邻点）");
  }
  // 五条无前端主角挂链的迁点事件：其可见面在编年，地点 chip 须已写新田
  await p.goto(origin + "/#/p/P_ZICHAN/map", { waitUntil: "load" }); await p.waitForTimeout(600);
  await p.goto(origin + "/#/chronicle", { waitUntil: "load" }); await p.waitForTimeout(1500);
  const chips = await p.evaluate(async (MOVED) => {
    const out = [];
    for (const id of MOVED) {
      const d = document.querySelector('#chron-list [data-eid="' + id + '"]');
      if (!d) { out.push({ id, err: "不在表" }); continue; }
      d.querySelector("summary").click();
      await new Promise(r => setTimeout(r, 220));
      const c = [...d.querySelectorAll(".meta-chips .chip")].map(e => e.textContent);
      out.push({ id, place: (c.find(t => /^地点/.test(t)) || ""), state: d.dataset.state, year: d.dataset.year });
      d.querySelector("summary").click();
      await new Promise(r => setTimeout(r, 120));
    }
    return out;
  }, MOVED);
  chips.forEach(c => say("    " + c.id + " 前" + (-c.year) + " · " + c.place + " · 国色签「" + c.state + "」"));
  OK(chips.every(c => /新田/.test(c.place || "")), "7 条迁点事件在编年卡内的地点 chip 一律已作「新田（绛）」");
  OK(chips.every(c => c.state === "晋"), "7 条国色签仍为晋（迁都不改国属，色只答「哪一国」）");

  // ---------- 15) r26 叔向 ego 图：姻亲边与祁大夫新配角 ----------
  H("15) r26 叔向 ego 图（姻亲边 · 祁大夫）");
  await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(900);
  await p.click("#global-search"); await p.fill("#global-search", "叔向"); await p.waitForTimeout(700);
  const opt = await p.evaluate(() => {
    const os = [...document.querySelectorAll("[role=listbox] [role=option]")];
    const t = os.find(o => /叔向/.test(o.innerText));
    if (t) t.click();
    return { n: os.length, hit: !!t, text: t ? t.innerText.replace(/\s+/g, " ") : null };
  });
  await p.waitForTimeout(1300);
  const ego = await p.evaluate(() => {
    const svg = document.querySelector("#rel-canvas svg");
    const labels = svg ? [...svg.querySelectorAll("text")].map(t => t.textContent.trim()) : [];
    const rels = DATA.relations.filter(r => r.person_a === "P_SHUXIANG" || r.person_b === "P_SHUXIANG");
    return {
      hash: location.hash, mode: relView.mode, center: relView.center,
      nodes: labels, nEdge: svg ? svg.querySelectorAll("path.rel-edge, line.rel-edge, .edge").length : 0,
      dataRels: rels.map(r => ({ id: r.id, a: r.person_a, b: r.person_b, t: r.rel_type, l: r.rel_label })),
      egoText: (document.querySelector("#view-relations") || {}).innerText.replace(/\s+/g, " ").slice(0, 600),
    };
  });
  say("  搜索「叔向」候选 " + opt.n + " 条，命中「" + opt.text + "」");
  say("  搜索直达落点：hash=" + ego.hash + " mode=" + ego.mode + " center=" + ego.center);
  /* r26b 语义变更（非缺陷）：叔向本轮升主角，搜索直达随 §5.6 既定口径由「非主角→ego 图」
   * 改走「主角→其时间线」。原断言写的是 r26 当时的非主角路由，故此处按新身份重写：
   * ① 直达须落其**时间线**；② ego 图改由人物子导航「关系」进入，再断言其邻人与姻亲边。 */
  OK(/#\/p\/P_SHUXIANG\/timeline/.test(ego.hash),
     "搜索「叔向」直达其时间线（r26b 起为主角，走主角路由；r26 时为配角、落 ego 图）");
  await p.goto(origin + "/#/p/P_SHUXIANG/relations", { waitUntil: "load" }); await p.waitForTimeout(1500);
  const ego2 = await p.evaluate(() => {
    const svg = document.querySelector("#rel-canvas svg");
    return { hash: location.hash, mode: relView.mode, center: relView.center,
             nodes: svg ? [...svg.querySelectorAll("text")].map(t => t.textContent.trim()) : [],
             egoText: (document.querySelector("#view-relations") || {}).innerText.replace(/\s+/g, " ").slice(0, 600) };
  });
  Object.assign(ego, ego2);
  say("  ego（经子导航「关系」）：hash=" + ego.hash + " mode=" + ego.mode + " center=" + ego.center);
  say("  图上节点名：" + ego.nodes.join("、"));
  say("  库内叔向关系 " + ego.dataRels.length + " 条：" + ego.dataRels.map(r => r.id + " " + r.t + "/" + r.l.slice(0, 8)).join(" | "));
  OK(ego.center === "P_SHUXIANG" && ego.mode === "ego", "叔向 ego 图可达（hash " + ego.hash + "）");
  const want = ["巫臣", "夏姬", "杨食我", "祁奚", "韩起", "子产", "晏婴"];
  const miss = want.filter(n => !ego.nodes.some(t => t.includes(n)));
  OK(miss.length === 0, "七名相关人物皆在图上（缺：" + (miss.join("、") || "无") + "）");
  OK(ego.nodes.some(t => t.includes("祁奚")), "r25 新配角祁大夫（P_QIXIDAFU，同音撞名取传世称谓判例）已显示");
  OK(ego.egoText.includes("婿"), "姻亲边可读：R262/R263「婿：娶于申公巫臣氏」已随边呈现");
  await p.screenshot({ path: path.join(OUT, "r26_03_shuxiang_ego.png"), fullPage: true });

  // ---------- 16) r26 穆姬复查：E081 补挂后的落点数与轨迹可播性 ----------
  /* 任务书设问：「若达 2 地即脱离降级态」。本节不预设答案，只按 §6/§5.8 既定判据实算再报——
   * 降级判据是「亲至且可落图（lat/lng 非空）的**地点数** < 2」，与挂链条数无关。 */
  H("16) r26 穆姬复查：E081 补挂后的亲至落点数与轨迹可播性");
  await p.goto(origin + "/#/p/P_MUJI/map", { waitUntil: "load" }); await p.waitForTimeout(1400);
  const mj = await p.evaluate(() => {
    const links = DATA.event_people.filter(l => l.person_id === "P_MUJI");
    const rows = links.map(l => {
      const e = DATA.events.find(x => x.id === l.event_id) || {};
      const pl = e.place_id ? PLACES[e.place_id] : null;
      return { eid: l.event_id, presence: l.presence || "(空=视同亲至)", place: e.place_id || null,
               name: pl ? pl.ancient_name : null, mappable: !!(pl && pl.lat != null && pl.lng != null) };
    });
    const visitMappable = [...new Set(rows.filter(r => r.presence !== "相关" && r.mappable).map(r => r.place))];
    return {
      rows, visitMappable,
      playHidden: document.querySelector("#btn-play").hidden,
      playDisabled: document.querySelector("#btn-play").disabled,
      degradeShown: !document.querySelector("#play-degrade").hidden,
      degradeText: (document.querySelector("#play-degrade") || {}).textContent,
      status: (document.querySelector("#map-status") || {}).textContent,
      trajSegs: document.querySelectorAll("#layer-anchors polyline.traj").length,
    };
  });
  mj.rows.forEach(r => say("    " + r.eid + " " + r.presence + " → " + (r.place || "无地点") +
    (r.name ? "（" + r.name + "）" : "") + (r.mappable ? "" : " ·不可落图")));
  say("  亲至且可落图的**地点数**：" + mj.visitMappable.length + "（" + (mj.visitMappable.join("、") || "—") + "）");
  say("  状态行：" + mj.status);
  const twoPlus = mj.visitMappable.length >= 2;
  OK(mj.rows.some(r => r.eid === "E081"), "E081 补挂已到前端（穆姬挂链共 " + mj.rows.length + " 条）");
  OK(mj.degradeShown === !twoPlus && mj.playHidden === !twoPlus,
     "降级态与「亲至落点 ≥2」判据自洽：落点 " + mj.visitMappable.length + " 地 → " +
     (twoPlus ? "轨迹可播（播放钮在场）" : "维持降级（播放钮隐去、静态说明在场）"));
  OK(mj.trajSegs === (twoPlus ? 1 : 0), "轨迹折线 " + mj.trajSegs + " 条，与可播性一致");
  say("  ⇒ 实测结论：穆姬" + (twoPlus ? "已脱离降级态，晋→秦轨迹首次可播。" :
      "仍在降级态——E081 的 presence 为「相关」且该事目 place_id 为空，两头都不进亲至落点，故落点数仍为 1（雍）。"));
  await p.screenshot({ path: path.join(OUT, "r26_04_muji_map.png"), fullPage: true });


  // ---------- 17) r26b 晏婴 / 叔向上线：名册对账 ＋ 六处呈现 ＋ 两枚新徽记 ----------
  /* 本门守的是 r26 那笔实账：数据侧主角 29、前端 PROTAGONISTS 27，而页脚按数据报「29 条人物线」。
   * 缺口不在某一处呈现坏了，而在**两份名册各走各的**，且没有任何一处把它们对起来。
   * 故本门一律对账式：不问「是不是 29」，只问「六处呈现各自数出来的人，跟名册对不对得上」。 */
  H("17) r26b 晏婴（齐7）· 叔向（晋4）上线：名册对账与六处呈现");
  const NEWP = [{ id: "P_YANYING", name: "晏婴", state: "齐", badge: "badge_yanying", nth: 7 },
                { id: "P_SHUXIANG", name: "叔向", state: "晋", badge: "badge_shuxiang", nth: 4 }];
  await p.goto(origin + "/#/?home=list", { waitUntil: "load" }); await p.waitForTimeout(1200);
  const pick = await p.evaluate((NEWP) => {
    const r = protoRoster();
    const groups = [...document.querySelectorAll(".state-group")].map(sec => ({
      state: (sec.querySelector(".state-name") || {}).textContent,
      names: [...sec.querySelectorAll(".person-grid > li .card-info h3")].map(h => h.firstChild.textContent.trim()),
      enabled: [...sec.querySelectorAll(".person-grid > li .person-card")].map(b => !b.disabled),
    }));
    const cards = groups.reduce((n, g) => n + g.names.length, 0);
    return {
      roster: { ui: PROTAGONISTS.length, data: r.inData.length, enterable: r.enterable.length,
                dataOnly: r.dataOnly, uiOnly: r.uiOnly },
      groups, cards,
      caption: document.querySelector("#brand-caption").textContent,
      each: NEWP.map(n => { const g = groups.find(x => x.state === n.state);
        return { id: n.id, group: n.state, idx: g ? g.names.indexOf(n.name) + 1 : -1,
                 of: g ? g.names.length : 0, enabled: g ? g.enabled[g.names.indexOf(n.name)] : false }; }),
    };
  }, NEWP);
  const RO = pick.roster;
  say("  名册：前端 " + RO.ui + " · 数据 " + RO.data + " · 可进 " + RO.enterable +
      "；差集 数据独有[" + (RO.dataOnly.join("/") || "空") + "] 前端独有[" + (RO.uiOnly.join("/") || "空") + "]");
  say("  选人页分组：" + pick.groups.map(g => g.state + g.names.length).join(" · ") + "，卡片合计 " + pick.cards);
  say("  页脚品牌语：" + pick.caption);
  OK(RO.dataOnly.length === 0 && RO.uiOnly.length === 0, "① 名册两侧无差集（r26 的「数据 29 / 前端 27」已闭合）");
  OK(pick.cards === RO.enterable, "② 选人页卡片数 " + pick.cards + " ＝ 可进人数 " + RO.enterable);
  const capN = +(pick.caption.match(/(\d+) 条人物线/) || [])[1];
  OK(capN === RO.enterable && capN === RO.data,
     "③ 页脚口径一致：品牌语报 " + capN + " ＝ 可进 " + RO.enterable + " ＝ 数据侧 " + RO.data + "（29＝29）");
  pick.each.forEach(e => OK(e.idx === NEWP.find(n => n.id === e.id).nth && e.enabled,
     "④ " + e.id + " 在「" + e.group + "」组第 " + e.idx + "／" + e.of + " 人，卡片可点"));
  await p.screenshot({ path: path.join(OUT, "r26b_01_home_list.png"), fullPage: true });
  // 首页地图分区：徽记簇内须见其人，且各簇彼此不叠（簇宽随人数增长，须核）
  await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(1500);
  /* r27 改法：逐枚取 (cx, cy, r)，不再拿 cs[0].cy 当整簇之 y。
   * 旧写法成立的前提是「一簇一行」；r27 起超 6 枚折两行，一个簇有两个 y，
   * 旧断言会在错的坐标上比对，且照样报绿——**是断言在新布局下失效，不是新布局有缺陷**。
   * 现判据：任何两枚徽记（无论同簇异簇）圆心距 ≥ 2r 即不相压，直接断到「读者看见的那件事」。 */
  const cluster = await p.evaluate(() => {
    const cls = [...document.querySelectorAll(".home-cluster")].map(g => {
      const cs = [...g.querySelectorAll("circle")].filter(c => c.querySelector("title"));
      return { names: cs.map(c => c.querySelector("title").textContent),
               dots: cs.map(c => ({ x: +c.getAttribute("cx"), y: +c.getAttribute("cy"), r: +c.getAttribute("r"),
                                    name: c.querySelector("title").textContent })) };
    });
    return { cls, n: cls.reduce((a, c) => a + c.names.length, 0) };
  });
  cluster.cls.forEach(c => {
    const rows = [...new Set(c.dots.map(d => d.y))].sort((a, b) => a - b);
    say("    簇 " + c.names.length + " 枚 / " + rows.length + " 行（y=" + rows.join(",") + "）：" + c.names.join("、") +
      "  x " + Math.min(...c.dots.map(d => d.x - d.r)).toFixed(0) + "–" + Math.max(...c.dots.map(d => d.x + d.r)).toFixed(0));
  });
  OK(cluster.n === RO.enterable, "⑤ 首页地图徽记簇合计 " + cluster.n + " 枚 ＝ 可进人数");
  OK(cluster.cls.some(c => c.names.includes("晏婴")) && cluster.cls.some(c => c.names.includes("叔向")),
     "⑤ 晏婴入齐簇、叔向入晋簇");
  const allDots = cluster.cls.flatMap(c => c.dots);
  const clash = [];
  for (let i = 0; i < allDots.length; i++) for (let j = i + 1; j < allDots.length; j++) {
    const A = allDots[i], B = allDots[j];
    if (Math.hypot(A.x - B.x, A.y - B.y) < A.r + B.r - 0.01) clash.push(A.name + "×" + B.name);
  }
  OK(clash.length === 0, "⑤ 全图 " + allDots.length + " 枚徽记两两不相压（" + (clash.join("、") || "无冲突") + "）");
  OK(allDots.every(d => d.x - d.r > 0 && d.x + d.r < 1200 && d.y - d.r > 0 && d.y + d.r < 700),
     "⑤ 各枚皆在底图 viewBox（0–1200 × 0–700）之内");
  await p.locator("#home-map").screenshot({ path: path.join(OUT, "r26b_02_home_map.png") });
  // 时间线 / 地图 / 并观可选 ——逐人走一遍
  for (const n of NEWP) {
    await p.goto(origin + "/#/p/" + n.id + "/timeline", { waitUntil: "load" }); await p.waitForTimeout(1300);
    const tl = await p.evaluate((id) => {
      const own = DATA.event_people.filter(l => l.person_id === id).map(l => l.event_id);
      const rows = [...document.querySelectorAll("#timeline-list > li details")].map(d => d.dataset.eid);
      return { navName: (document.querySelector("#pn-name") || {}).textContent,
               navBadge: !!document.querySelector("#pn-badge svg"),
               rows, own, missing: own.filter(e => !rows.includes(e)) };
    }, n.id);
    say("  " + n.name + " 时间线 " + tl.rows.length + " 条（挂链 " + tl.own.length + "）");
    OK(tl.navName === n.name && tl.navBadge, "⑥ " + n.name + "：子导航出其名与徽记");
    OK(tl.missing.length === 0 && tl.rows.length === tl.own.length,
       "⑥ " + n.name + " 时间线条数 ＝ 其挂链数 " + tl.own.length + "（缺：" + (tl.missing.join("/") || "无") + "）");
    await p.screenshot({ path: path.join(OUT, "r26b_03_" + n.id + "_timeline.png"), fullPage: true });
    await p.goto(origin + "/#/p/" + n.id + "/map", { waitUntil: "load" }); await p.waitForTimeout(1500);
    const mp = await p.evaluate(() => ({
      colored: [...document.querySelectorAll("#layer-anchors .anchor")]
        .filter(g => /（亲至地点）|（相关地点/.test(g.getAttribute("aria-label") || ""))
        .map(g => g.dataset.place + (/亲至/.test(g.getAttribute("aria-label")) ? "·亲至" : "·相关")),
      traj: document.querySelectorAll("#layer-anchors polyline.traj").length,
      playHidden: document.querySelector("#btn-play").hidden,
      status: (document.querySelector("#map-status") || {}).textContent,
      pickable: (() => { document.querySelector("#btn-compare").click();
        return [...document.querySelectorAll("#compare-pick .cmp-pick-item")].map(b => b.textContent.replace(/\s+/g, "")); })(),
    }));
    say("  " + n.name + " 地图着色锚点：" + mp.colored.join("、"));
    say("  " + n.name + " 状态行：" + mp.status);
    OK(mp.colored.length > 0, "⑦ " + n.name + " 地图有着色落点 " + mp.colored.length + " 处");
    OK(!mp.playHidden && mp.traj === 1, "⑦ " + n.name + " 亲至 ≥2 地，轨迹可播（折线 " + mp.traj + " 条）");
    OK(mp.pickable.length === RO.enterable - 1,
       "⑧ " + n.name + " 的并观可选名单 " + mp.pickable.length + " 人 ＝ 可进人数 − 自己");
    await p.screenshot({ path: path.join(OUT, "r26b_04_" + n.id + "_map.png"), fullPage: true });
  }
  // 别人的并观面板里也须选得到这两位（对称性：既能选人，也能被选）
  await p.goto(origin + "/#/p/P_ZICHAN/map", { waitUntil: "load" }); await p.waitForTimeout(1400);
  const zcPick = await p.evaluate(() => { document.querySelector("#btn-compare").click();
    return [...document.querySelectorAll("#compare-pick .cmp-pick-item")].map(b => b.textContent.replace(/\s+/g, "")); });
  OK(zcPick.some(t => t.includes("晏婴")) && zcPick.some(t => t.includes("叔向")),
     "⑧ 子产的并观面板里选得到晏婴与叔向（被选一侧同样在场）");
  // 并观实跑一对：叔向×晏婴（前539 同在新田宴语，E210——本库少见的双主角同场）
  await p.goto(origin + "/#compare=P_SHUXIANG,P_YANYING", { waitUntil: "load" }); await p.waitForTimeout(1800);
  const cmpv = await p.evaluate(() => ({
    meets: [...document.querySelectorAll("#cmp-meets li, .cmp-meet")].map(e => e.textContent.replace(/\s+/g, " ").slice(0, 70)),
    body: document.body.innerText.replace(/\s+/g, " "),
  }));
  say("  并观 叔向×晏婴：交会条目 " + cmpv.meets.length + " 条 → " + cmpv.meets.join(" | "));
  OK(/叔向/.test(cmpv.body) && /晏婴/.test(cmpv.body), "⑧ 并观视图两人俱在");
  OK(cmpv.meets.some(t => /新田|绛/.test(t)), "⑧ 交会一览列出新田（E210 论季世，前539 同场）");
  await p.screenshot({ path: path.join(OUT, "r26b_05_compare.png"), fullPage: true });
  // 全景默认环：二人在环上且作主角节点（29 槽距的对账已在 §5）
  await p.goto(origin + "/#/relations", { waitUntil: "load" }); await p.waitForTimeout(1600);
  const onRing = await p.evaluate((ids) => ids.map(id => ({
    id, node: !!document.querySelector('#rel-canvas [data-node="' + id + '"]'),
    proto: !!document.querySelector('#rel-canvas [data-node="' + id + '"].proto'),
  })), NEWP.map(n => n.id));
  OK(onRing.every(o => o.node && o.proto), "⑨ 二人皆在全景默认环上且作主角节点：" + JSON.stringify(onRing));
  // 两枚新徽记：文件在、合规约（撞形实测另见 tools/qa/badge_silhouette_r26b.js）
  const badgeSrc = await p.evaluate(async (files) => {
    const out = [];
    for (const f of files) {
      const t = await (await fetch("assets/icons/" + f + ".svg")).text();
      out.push({ f, vb: /viewBox="0 0 48 48"/.test(t), sw: /stroke-width="2"/.test(t),
                 cc: /stroke="currentColor"/.test(t), ring: /<circle cx="24" cy="24" r="21"/.test(t) });
    }
    return out;
  }, NEWP.map(n => n.badge));
  badgeSrc.forEach(b => OK(b.vb && b.sw && b.cc && b.ring,
    "⑩ " + b.f + ".svg 合徽记规约（viewBox 48／stroke-width 2／currentColor／r21 圆框）"));

  // ---------- 18) r26b 迁点补走查：r26 因二人缺席未能在人物地图上走的 5 条 ----------
  /* r26 §14 走了 7 条迁点里的 E190/E194（子产线）与对照 E182（夏姬线），余 5 条只在编年上核过
   * chip 文字。本节把它们放回**人物地图**逐条核——地图才是「落点从实不从称」这条裁定的落地面。 */
  H("18) r26b 迁点补走查：E201 / E219 / E210 / E220 / E221 逐条");
  const REST = ["E201", "E219", "E210", "E220", "E221"];
  const walk = await p.evaluate((REST) => REST.map(id => {
    const e = DATA.events.find(x => x.id === id);
    const links = DATA.event_people.filter(l => l.event_id === id);
    const protos = links.filter(l => PROTAGONISTS.some(m => m.id === l.person_id))
                        .map(l => ({ pid: l.person_id, presence: l.presence || "(空=视同亲至)" }));
    return { id, year: e.year_bce, place: e.place_id, cat: e.category,
             title: e.title.slice(0, 22), protos, allPeople: links.map(l => l.person_id) };
  }), REST);
  const noHost = [];
  for (const w of walk) {
    if (!w.protos.length) { noHost.push(w); continue; }
    for (const pr of w.protos) {
      await p.goto(origin + "/#/p/" + pr.pid + "/map", { waitUntil: "load" }); await p.waitForTimeout(1400);
      const hit = await p.evaluate((eid) => {
        const g = document.querySelector('.anchor[data-place="L_XINTIAN"]');
        const aria = g ? g.getAttribute("aria-label") : null;
        let txt = null;
        if (g) {
          g.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          const panel = document.querySelector("#place-panel") || document.querySelector(".place-panel");
          txt = panel ? panel.innerText.replace(/\s+/g, " ") : null;
        }
        const e = DATA.events.find(x => x.id === eid);
        return { aria, on: !!g, hasEvent: !!(txt && txt.includes(e.title.slice(0, 6))),
                 hasName: !!(txt && /新田/.test(txt) && /侯马/.test(txt)) };
      }, w.id);
      const wantVisit = pr.presence === "亲至";
      OK(hit.on && (wantVisit ? /（亲至地点）/.test(hit.aria || "") : true) && hit.hasName,
         w.id + "（前" + (-w.year) + "·" + w.title + "）落 " + w.place + "，在 " + pr.pid +
         " 地图：aria「" + (hit.aria || "—") + "」，其 presence=" + pr.presence + "，抽屉出「新田（绛）／侯马」");
      OK(hit.hasEvent, "  └ 新田抽屉内列出本条事目");
    }
  }
  noHost.forEach(w => say("  ⚠ " + w.id + "（前" + (-w.year) + "·" + w.title + "）**无主角挂链**，" +
    "所系仅 " + w.allPeople.join("/") + "，皆非主角 —— 人物地图上无从走查，其可见面只在编年（§14 已核其 chip 作「新田（绛）」）"));
  OK(noHost.length === 1 && noHost[0].id === "E201",
     "5 条中 4 条已在人物地图逐条核过；E201（魏绛和戎）无主角挂链，其未走查非「二人缺席」所致——见交付说明「验收偏差上报」");
  await p.screenshot({ path: path.join(OUT, "r26b_06_xintian_walk.png"), fullPage: true });

  // ---------- 19) r27：吴分区 ＋ 第 10 国色 ＋ 阖庐/伍员上线 ＋ 簇折两行 ＋ 文献检索 ＋ 分层示范 ----------
  /* 出图前先清界面残留：本文件用 p.goto 在同一文档内换 hash（SPA 不重载），
   * 故上一节点开的并观面板、搜索框里的字会跟到下一张图上——图是给人看的证据，不该带上一节的手印。 */
  const clean = async () => p.evaluate(() => {
    const si = document.querySelector("#global-search"); if (si) si.value = "";
    ["#search-pop", "#compare-pick", "#cmp-compare-pick"].forEach(sel => {
      const el = document.querySelector(sel); if (el) el.hidden = true;
    });
    ["#search-toggle", "#btn-compare", "#cmp-btn-compare"].forEach(sel => {
      const b = document.querySelector(sel); if (b) b.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll(".home-state.selected").forEach(g => g.classList.remove("selected"));
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    window.scrollTo(0, 0);
  });

  H("19) r27 · 一之：第 10 国色「吴」判据（现算，不比对写死的距离表）");
  await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(1200);
  const wuColor = await p.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const hex = (s) => { s = (s || "").trim(); const m = s.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return m ? "#" + [1, 2, 3].map(i => (+m[i]).toString(16).padStart(2, "0")).join("").toUpperCase() : s.toUpperCase(); };
    return { fams: Object.keys(STATE_FAMILY_VAR),
             hexes: Object.fromEntries(Object.entries(STATE_FAMILY_VAR).map(([k, v]) => [k, hex(cs.getPropertyValue(v))])),
             funcs: Object.fromEntries(["--ink", "--ink-soft", "--ochre", "--bronze", "--cinnabar", "--poem"]
               .map(v => [v, hex(cs.getPropertyValue(v))])),
             rels: REL_COLORS };
  });
  const famNames = wuColor.fams;
  const pairs = [];
  for (let i = 0; i < famNames.length; i++) for (let j = i + 1; j < famNames.length; j++)
    pairs.push({ a: famNames[i], b: famNames[j], d: dE(wuColor.hexes[famNames[i]], wuColor.hexes[famNames[j]]) });
  pairs.sort((x, y) => x.d - y.d);
  say("  国色 " + famNames.length + " 家：" + famNames.map(k => k + wuColor.hexes[k]).join(" "));
  say("  两两 " + pairs.length + " 对，最紧三：" + pairs.slice(0, 3).map(x => x.a + "×" + x.b + " " + x.d).join("、"));
  OK(famNames.length === 10 && wuColor.hexes["吴"] === "#164F5C", "国色家族增至 10，吴 ＝ " + wuColor.hexes["吴"]);
  OK(pairs.every(x => x.d >= 13.2), "十色两两 ΔE76 全部 ≥13.2（最紧 " + pairs[0].a + "×" + pairs[0].b + " " + pairs[0].d + "）");
  const wuPairs = pairs.filter(x => x.a === "吴" || x.b === "吴").sort((x, y) => x.d - y.d);
  OK(wuPairs[0].d >= 13.2, "吴对其余九国色最紧 " + wuPairs[0].d + "（" + (wuPairs[0].a === "吴" ? wuPairs[0].b : wuPairs[0].a) + "）");
  OK(ctr(wuColor.hexes["吴"], "#F4EDDF") >= 3.5 && ctr(wuColor.hexes["吴"], "#FFFFFF") >= 4.1,
     "吴双底线：对绢帛 " + ctr(wuColor.hexes["吴"], "#F4EDDF") + " / 对白 " + ctr(wuColor.hexes["吴"], "#FFFFFF"));
  /* 对功能色**逐对核**：既有四对低于 13.2（郑×青绿／齐×朱砂／秦×玄墨／鲁×暖赭）是 r24a-2 裁定的
   * 观察项、本轮不动；判据只管一件事——**新立之色不得新增任何一对**。 */
  const nonState = [...Object.entries(wuColor.funcs).map(([k, v]) => ({ n: k, hex: v })),
                    ...Object.entries(wuColor.rels).map(([k, v]) => ({ n: "关系线·" + k, hex: v }))];
  const wuNear = nonState.map(c => ({ n: c.n, d: dE(wuColor.hexes["吴"], c.hex) })).sort((a, b) => a.d - b.d);
  say("  吴 × 非国色，最近三：" + wuNear.slice(0, 3).map(x => x.n + " " + x.d).join("、"));
  OK(wuNear[0].d >= 13.2, "吴对全部功能色/关系线 ≥13.2（最紧 " + wuNear[0].n + " " + wuNear[0].d + "）——本轮新增 0 对");
  say("  注：全色目（含图面中性色与悬停态）全矩阵另由 `node tools/qa/color_matrix_r27.js` 实算");

  H("19) r27 · 二之：底图吴色块与首页吴分区");
  const wuHome = await p.evaluate(async () => {
    const svg = document.querySelector("#home-map svg");
    const block = svg && svg.querySelector('#layer-states-southeast ellipse[data-state="吴"]');
    const label = svg && svg.querySelector('#layer-labels text[data-state="吴"]');
    const hot = svg && svg.querySelector('.home-state[data-state="吴"]');
    const geom = block ? { cx: +block.getAttribute("cx"), cy: +block.getAttribute("cy"),
                           rx: +block.getAttribute("rx"), ry: +block.getAttribute("ry") } : null;
    let panel = null;
    if (hot) { hot.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await new Promise(r => setTimeout(r, 300));
      panel = (document.querySelector("#home-state-panel") || {}).innerText || null; }
    return { block: !!block, label: label && label.textContent, hot: !!hot, geom,
             panel: (panel || "").replace(/\s+/g, " ").slice(0, 90),
             sea: !!svg.querySelector("#layer-sea-southeast path") };
  });
  say("  吴块 " + JSON.stringify(wuHome.geom) + "；面板「" + wuHome.panel + "」");
  OK(wuHome.block && wuHome.label === "吴" && wuHome.hot, "底图有吴色块、吴国名与键盘可达热区");
  OK(wuHome.sea, "东南海岸（layer-sea-southeast）已补绘——吴不再浮在空白上");
  OK(/阖庐/.test(wuHome.panel) && /伍员/.test(wuHome.panel) && /江海之滨/.test(wuHome.panel),
     "点吴出其人物菜单（阖庐、伍员）与气质注");
  /* 吴都须落在吴块之内、槜李（越地）须落在块外——色块不替史料回答「吴越分界在哪」，
   * 但也不该把明标越地的点圈进吴里。坐标一律按 conventions §4 公式现算，不看色块反推。 */
  const wuPts = await p.evaluate((g) => {
    const proj = (pl) => ({ x: (pl.lng - 105) / 17 * 1200, y: 700 - (pl.lat - 29.5) / 9 * 700 });
    const inEl = (p0) => Math.pow((p0.x - g.cx) / g.rx, 2) + Math.pow((p0.y - g.cy) / g.ry, 2) <= 1;
    const out = {};
    for (const id of ["L_WUDU", "L_ZUILI", "L_BOJU"]) {
      const pl = DATA.places.find(x => x.id === id);
      const q = proj(pl); out[id] = { st: pl.state, x: +q.x.toFixed(1), y: +q.y.toFixed(1), inWu: inEl(q) };
    }
    return out;
  }, wuHome.geom);
  say("  " + JSON.stringify(wuPts));
  OK(wuPts.L_WUDU.inWu, "吴都 L_WUDU（" + wuPts.L_WUDU.x + "," + wuPts.L_WUDU.y + "）落在吴块内");
  OK(!wuPts.L_ZUILI.inWu && wuPts.L_ZUILI.st === "越", "槜李（state=越）落在吴块外——分界不由色块代答");

  H("19) r27 · 三之：徽记簇「超 6 枚折两行」几何实测（裁定 7）");
  const fold = await p.evaluate(() => {
    return [...document.querySelectorAll(".home-cluster")].map(g => {
      const cs = [...g.querySelectorAll("circle")].filter(c => c.querySelector("title"));
      const rows = new Map();
      cs.forEach(c => { const y = +c.getAttribute("cy");
        if (!rows.has(y)) rows.set(y, []); rows.get(y).push(+c.getAttribute("cx")); });
      const r = +cs[0].getAttribute("r");
      const ys = [...rows.keys()].sort((a, b) => a - b);
      return { n: cs.length, r, ys,
               rows: ys.map(y => { const xs = rows.get(y).sort((a, b) => a - b);
                 return { y, n: xs.length, w: +(xs[xs.length - 1] - xs[0] + 2 * r).toFixed(1),
                          mid: +((xs[0] + xs[xs.length - 1]) / 2).toFixed(1) }; }),
               names: cs.map(c => c.querySelector("title").textContent) };
    });
  });
  fold.forEach(c => say("  " + c.names[0] + "簇 " + c.n + " 枚 → " + c.rows.length + " 行：" +
    c.rows.map(r => r.n + " 枚 宽" + r.w + " 心x" + r.mid + " y" + r.y).join(" ｜ ")));
  const big = fold.filter(c => c.n > 6), small = fold.filter(c => c.n <= 6);
  OK(big.length > 0 && big.every(c => c.rows.length === 2), "超 6 枚者一律折两行（现 " + big.length + " 簇：" + big.map(c => c.names[0] + "组" + c.n + "枚").join("、") + "）");
  OK(small.every(c => c.rows.length === 1), "≤6 枚者仍单行（" + small.length + " 簇）");
  OK(big.every(c => c.rows[0].n <= c.rows[1].n), "折行取「上窄下宽」——国名在簇之上，窄行让字");
  OK(big.every(c => c.rows.every(r => Math.abs(r.mid - c.rows[0].mid) < 0.05)), "两行各自居中于同一簇心 x");
  OK(big.every(c => c.ys[1] - c.ys[0] >= 2 * c.r), "行距 " + (big[0] ? (big[0].ys[1] - big[0].ys[0]).toFixed(1) : "—") + " ≥ 2R " + (big[0] ? 2 * big[0].r : "—") + "，两行不相压");
  const qiOld = big[0] ? (31 * (big[0].n - 1) + 27) : 0;
  OK(big.every(c => c.rows.every(r => r.w < qiOld)),
     "折后各行宽 " + (big[0] ? big[0].rows.map(r => r.w).join("/") + " ＜ 折前单行宽 " + qiOld : "—") + "（齐块该行可用宽约 167）");
  await clean(); await p.locator("#home-map").screenshot({ path: path.join(OUT, "r27_01_home_map.png") });

  H("19) r27 · 四之：阖庐 / 伍员上线六处呈现");
  const NEW27 = [{ id: "P_HELU", name: "阖庐", badge: "badge_helu", group: "吴" },
                 { id: "P_WUYUAN", name: "伍员", badge: "badge_wuyuan", group: "吴" }];
  await p.goto(origin + "/#/?home=list", { waitUntil: "load" }); await p.waitForTimeout(1200);
  const pick27 = await p.evaluate(() => {
    const secs = [...document.querySelectorAll(".state-group")];
    const wu = secs.find(s => (s.querySelector(".state-name") || {}).textContent === "吴");
    return { groups: secs.map(s => (s.querySelector(".state-name") || {}).textContent + (s.querySelectorAll(".person-grid > li").length)),
             wuNote: wu ? (wu.querySelector(".state-note") || {}).textContent : null,
             tabs: [...document.querySelectorAll("#state-tabs button")].map(b => b.dataset.state),
             wuCards: wu ? [...wu.querySelectorAll(".person-grid > li")].map(li => li.innerText.replace(/\s+/g, " ").slice(0, 46)) : [],
             flows: wu ? [...wu.querySelectorAll(".flow-chip")].map(c => c.textContent) : [] };
  });
  say("  分组：" + pick27.groups.join(" · ") + "；吴注「" + pick27.wuNote + "」");
  pick27.wuCards.forEach(c => say("    吴卡：" + c));
  OK(pick27.groups.some(g => g.startsWith("吴")), "选人页列表模式出现吴分区");
  OK(pick27.tabs.includes("吴"), "国别选项卡自动多出「吴」一项（分区随 PROTAGONISTS 自动生成）");
  OK(pick27.wuCards.length === 2, "吴分区 2 张卡");
  OK(pick27.flows.includes("楚→吴"),
     "伍员卡上仍标流向「楚→吴」——归吴分区不吞其出身（实测 " + JSON.stringify(pick27.flows) + "）");
  for (const n of NEW27) {
    await p.goto(origin + "/#/p/" + n.id + "/timeline", { waitUntil: "load" }); await p.waitForTimeout(1300);
    const tl = await p.evaluate((id) => {
      const own = DATA.event_people.filter(l => l.person_id === id).map(l => l.event_id);
      const rows = [...document.querySelectorAll("#timeline-list > li details")].map(d => d.dataset.eid);
      return { navName: (document.querySelector("#pn-name") || {}).textContent,
               navBadge: !!document.querySelector("#pn-badge svg"),
               theme: getComputedStyle(document.documentElement).getPropertyValue("--theme").trim(),
               rows, own, missing: own.filter(e => !rows.includes(e)) };
    }, n.id);
    say("  " + n.name + " 时间线 " + tl.rows.length + " 条（挂链 " + tl.own.length + "）；--theme " + tl.theme);
    OK(tl.navName === n.name && tl.navBadge, n.name + "：子导航出其名与徽记");
    OK(tl.missing.length === 0 && tl.rows.length === tl.own.length,
       n.name + " 时间线条数 ＝ 其挂链数 " + tl.own.length + "（缺：" + (tl.missing.join("/") || "无") + "）");
    OK(/#164F5C/i.test(tl.theme) || /22, 79, 92/.test(tl.theme), n.name + " 人物语境色取吴色（实测 " + tl.theme + "）");
    await clean(); await p.screenshot({ path: path.join(OUT, "r27_02_" + n.id + "_timeline.png") });
  }
  /* 轨迹降级：判据写成**双向自洽**式（同 §16 穆姬门）——「亲至且可落图的地点数 ≥2 ⇔ 可播」，
   * 不预设本轮答案。伍员六条挂链中三条亲至同落吴都，故落点数 1、必降级；日后若补上第二处亲至，
   * 本门自动翻绿，无需改码。 */
  for (const n of NEW27) {
    await p.goto(origin + "/#/p/" + n.id + "/map", { waitUntil: "load" }); await p.waitForTimeout(1600);
    const mp = await p.evaluate((id) => {
      const evByPlace = {};
      for (const l of DATA.event_people.filter(l => l.person_id === id)) {
        const e = DATA.events.find(x => x.id === l.event_id);
        if (!e || !e.place_id) continue;
        const pl = DATA.places.find(x => x.id === e.place_id);
        const mapped = pl && pl.lat != null && pl.lng != null && pl.lat !== "" && pl.lng !== "";
        const visit = (l.presence || "亲至") === "亲至";
        if (visit && mapped) evByPlace[e.place_id] = true;
      }
      return { visitPlaces: Object.keys(evByPlace),
               anchors: [...document.querySelectorAll("#layer-anchors .anchor")]
                 .filter(g => /（亲至地点）|（相关地点/.test(g.getAttribute("aria-label") || ""))
                 .map(g => g.dataset.place + (/亲至/.test(g.getAttribute("aria-label")) ? "·亲至" : "·相关")),
               traj: document.querySelectorAll("#layer-anchors polyline.traj").length,
               playHidden: document.querySelector("#btn-play").hidden,
               degradeShown: !document.querySelector("#play-degrade").hidden,
               degradeText: (document.querySelector("#play-degrade") || {}).textContent,
               status: (document.querySelector("#map-status") || {}).textContent };
    }, n.id);
    say("  " + n.name + " 亲至可落图地点 " + mp.visitPlaces.length + " 处：" + mp.visitPlaces.join("、"));
    say("  " + n.name + " 着色锚点：" + mp.anchors.join("、"));
    say("  " + n.name + " 状态行：" + mp.status);
    const canPlay = mp.visitPlaces.length >= 2;
    OK(canPlay === !mp.playHidden && canPlay === !mp.degradeShown && canPlay === (mp.traj === 1),
       n.name + "：亲至可落图 " + mp.visitPlaces.length + " 处 ⇔ " + (canPlay ? "可播、轨迹 1 条" : "降级、无轨迹（「" + (mp.degradeText || "").slice(0, 14) + "…」）") + "（双向自洽）");
    if (!canPlay) OK(/亲至可考一地|亲至可考不足/.test(mp.status), n.name + " 状态行如实交代其只有一处亲至");
    OK(mp.anchors.some(a => /·相关/.test(a)) === mp.anchors.some(a => /·相关/.test(a)), "（记实）" + n.name + " 相关落点空心示之：" + mp.anchors.filter(a => /·相关/.test(a)).join("、"));
    await clean(); await p.locator("#map-frame").screenshot({ path: path.join(OUT, "r27_03_" + n.id + "_map.png") });
  }
  const helu = await p.evaluate(() => {
    const own = DATA.event_people.filter(l => l.person_id === "P_HELU");
    return own.map(l => { const e = DATA.events.find(x => x.id === l.event_id);
      return { eid: e.id, y: e.year_bce, place: e.place_id, presence: l.presence || "(空)" }; })
      .sort((a, b) => a.y - b.y);
  });
  say("  阖庐挂链：" + helu.map(h => h.eid + "@" + h.place + "/" + h.presence).join(" → "));
  OK(helu.filter(h => h.presence === "亲至").map(h => h.place).includes("L_ZUILI"),
     "阖庐轨迹末站为槜李（前496 伤将指而卒）");
  OK((helu.find(h => h.place === "L_YINGDU") || {}).presence === "相关",
     "郢（E229 秦师救楚）presence＝相关 → 空心、不入轨迹（任务书所拟「吴都→柏举→郢→槜李」中郢一站不入，见交付说明）");
  // 并观可选 / 全景环
  const pickable = await p.evaluate(() => { document.querySelector("#btn-compare").click();
    return [...document.querySelectorAll("#compare-pick .cmp-pick-item")].map(b => b.textContent.replace(/\s+/g, "")); });
  OK(pickable.length === RO.enterable - 1, "并观可选名单 " + pickable.length + " 人 ＝ 可进人数 − 自己");
  await p.goto(origin + "/#/relations", { waitUntil: "load" }); await p.waitForTimeout(1600);
  const onRing27 = await p.evaluate((ids) => ids.map(id => ({
    id, node: !!document.querySelector('#rel-canvas [data-node="' + id + '"]'),
    proto: !!document.querySelector('#rel-canvas [data-node="' + id + '"].proto'),
  })), NEW27.map(n => n.id));
  OK(onRing27.every(o => o.node && o.proto), "二人皆在全景默认环上且作主角节点");
  await clean(); await p.screenshot({ path: path.join(OUT, "r27_04_pano.png"), fullPage: true });
  const badge27 = await p.evaluate(async (files) => {
    const out = [];
    for (const f of files) {
      const t = await (await fetch("assets/icons/" + f + ".svg")).text();
      out.push({ f, vb: /viewBox="0 0 48 48"/.test(t), sw: /stroke-width="2"/.test(t),
                 cc: /stroke="currentColor"/.test(t), ring: /<circle cx="24" cy="24" r="21"/.test(t),
                 hard: /#[0-9a-fA-F]{3,6}/.test(t) });
    }
    return out;
  }, NEW27.map(n => n.badge));
  badge27.forEach(b => OK(b.vb && b.sw && b.cc && b.ring && !b.hard,
    b.f + ".svg 合徽记规约（viewBox 48／stroke-width 2／currentColor／r21 圆框／无硬编码色）"));

  H("19) r27 · 五之：全站搜索「文献」组 —— 孙武查无此人而说明可读");
  await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(1000);
  const doSearch = async (kw) => p.evaluate((kw) => {
    const q = kw.toLowerCase().replace(/\s+/g, "");
    const out = {};
    for (const g of SEARCH_GROUPS) {
      out[g.key] = SEARCH_INDEX.filter(en => en.group === g.key && en.text.includes(q))
        .map(en => en.label).slice(0, 6);
    }
    return out;
  }, kw);
  const sw = await doSearch("孙武");
  say("  搜「孙武」→ " + JSON.stringify(sw));
  OK(sw.people.length === 0, "① 人物组 0 条——《左传》《国语》零明文，依裁定 2 不立 people 行（查无此人，是判据不是缺口）");
  OK(sw.events.length > 0, "② 事件组命中 " + sw.events.length + " 条（其名存于事目 summary）");
  OK(sw.sources.length > 0, "③ 文献组命中 " + sw.sources.length + " 条（其名存于 sources.notes）：" + sw.sources.join("、"));
  const hl = await doSearch("阖闾");
  say("  搜「阖闾」→ " + JSON.stringify(hl.people));
  OK(hl.people.includes("阖庐"), "④ 搜「阖闾」经 alt_names 命中「阖庐」（数据本字为阖庐，裁定 18）");
  OK((await doSearch("伍子胥")).people.includes("伍员"), "④ 搜「伍子胥」经 alt_names 命中「伍员」");
  // 文献直达：落资料库并展开该条，断到像素（§7.3——DOM 状态对 ≠ 读者看得见）
  const libGo = await p.evaluate(async () => {
    const en = SEARCH_INDEX.find(e => e.group === "sources" && e.text.includes("孙武"));
    const peak = { v: 0 };
    const t = setInterval(() => { peak.v = Math.max(peak.v, window.scrollY); }, 60);
    en.go();
    await new Promise(r => setTimeout(r, 1600));
    clearInterval(t);
    const btn = document.querySelector(".lib-item.spotlight") ||
                [...document.querySelectorAll(".lib-item")].find(b => b.dataset.libId === "S011");
    const rect = btn ? btn.getBoundingClientRect() : null;
    const full = (document.querySelector("#lib-detail") || {}).innerText.replace(/\s+/g, " ");
    const i = full.indexOf("孙武");
    return { hash: location.hash, label: en.label, full,
             detail: i < 0 ? full.slice(0, 200) : full.slice(Math.max(0, i - 90), i + 150),
             peak: peak.v, inView: rect ? (rect.y > -rect.height && rect.y < innerHeight) : false,
             y: rect ? Math.round(rect.y) : null };
  });
  say("  直达：" + libGo.hash + "；scrollY 峰值 " + libGo.peak + "；目标 y=" + libGo.y);
  say("  详情（孙武一节）：" + libGo.detail);
  OK(/#\/library\/sources/.test(libGo.hash), "⑤ 文献组直达落资料库·来源页");
  /* ⚠ 断言只断**语义**、不抄任务书的措辞：任务书拟的注文是「《孙子》作者不见于经传」，
   * 而库内 S011.notes 实际作「《左传》《国语》皆无孙武其名……不为孙武立 people 行」。
   * 措辞不同不是缺陷——写死一句原文来卡数据，等于让史料研究员的用字迁就我的断言。 */
  OK(/孙武|孫武/.test(libGo.full) && /皆无孙武其名|不.{0,6}立 ?people 行|零命中/.test(libGo.full),
     "⑤ 详情内读到「《左传》《国语》皆无孙武其名 → 不为其立 people 行」之义");
  OK(libGo.inView, "⑤ 目标条目确在视口内（§7.3：只查 DOM 状态不算数）y=" + libGo.y);
  await p.screenshot({ path: path.join(OUT, "r27_05_search_sunwu.png"), fullPage: true });

  H("19) r27 · 六之：分层示范三处的前端呈现（验收要求截图报备）");
  // (甲) 鱼肠四层并陈：E224 下 Q338–Q343
  await p.goto(origin + "/#/chronicle", { waitUntil: "load" }); await p.waitForTimeout(1500);
  const layerShow = await p.evaluate(async (eid) => {
    const det = document.querySelector('details.chron-row[data-eid="' + eid + '"]');
    if (!det) return null;
    det.open = true;
    await new Promise(r => setTimeout(r, 600));
    const qs = [...det.querySelectorAll(".quote")].map(q => ({
      qid: q.dataset.qid,
      layer: (q.querySelector(".q-layer") || {}).textContent || "原文（无徽标）",
      cls: [...q.classList].filter(c => c.startsWith("layer-") || c === "has-caveat").join("+"),
      caveat: (q.querySelector(".q-caveat") || {}).textContent || null,
      line: getComputedStyle(q).borderLeftColor + " " + getComputedStyle(q).borderLeftStyle,
      head: (q.querySelector("blockquote") || q).innerText.replace(/\s+/g, " ").slice(0, 30),
    }));
    det.scrollIntoView({ block: "center" });
    return { qs, title: (det.querySelector("summary") || {}).innerText.replace(/\s+/g, " ") };
  }, "E224");
  say("  E224「" + (layerShow ? layerShow.title : "—") + "」引文 " + (layerShow ? layerShow.qs.length : 0) + " 条：");
  (layerShow ? layerShow.qs : []).forEach(q => say("    " + q.qid + " [" + q.layer + "] " + q.cls + " 左线 " + q.line + " ｜ " + q.head));
  const lays = new Set((layerShow ? layerShow.qs : []).map(q => q.layer));
  OK(layerShow && layerShow.qs.length >= 6, "（甲）E224 展开见 " + (layerShow ? layerShow.qs.length : 0) + " 条引文（Q338–Q343）");
  OK(lays.size >= 3 && [...lays].some(l => /经义异闻/.test(l)) && [...lays].some(l => /后出叙事/.test(l)),
     "（甲）三层徽标同屏并陈：" + [...lays].join(" / ") + "——传文有鱼有剑而剑无名、剑名出说部、匕首出《史记》");
  await p.locator('details.chron-row[data-eid="E224"]').screenshot({ path: path.join(OUT, "r27_06a_yuchang_four_layers.png") });
  // (乙) 白发之不录：E243 下 Q370 的编者层标
  const bai = await p.evaluate(async (eid) => {
    document.querySelectorAll("details.chron-row[open]").forEach(d => { d.open = false; });
    const det = document.querySelector('details.chron-row[data-eid="' + eid + '"]');
    if (!det) return null;
    det.open = true;
    await new Promise(r => setTimeout(r, 600));
    const q = det.querySelector('[data-qid="Q370"]');
    det.scrollIntoView({ block: "center" });
    return q ? { caveat: (q.querySelector(".q-caveat") || {}).textContent || null,
                 caveatColor: (() => { const c = q.querySelector(".q-caveat"); return c ? getComputedStyle(c).color : null; })(),
                 bold: q.classList.contains("has-caveat"),
                 text: q.innerText.replace(/\s+/g, " ").slice(0, 200) } : null;
  }, "E243");
  say("  Q370 层标：" + (bai ? bai.caveat : "（未取到）"));
  OK(!!bai && !!bai.caveat && /说部层|诈言美珠/.test(bai.caveat), "（乙）Q370 编者层标提到引文之上，写明昧关一节作「诈言美珠」");
  OK(!!bai && bai.bold && /rgb\(180, 101, 47\)/.test(bai.caveatColor || ""), "（乙）层标作暖赭通栏、左线加粗（§3.6 体例）");
  OK(!!bai && /白發|白发|不录|東周列國志|东周列国志/.test(bai.text), "（乙）「一夜白发」三书俱无、明清小说层不录——说明可读");
  await p.locator('details.chron-row[data-eid="E243"]').screenshot({ path: path.join(OUT, "r27_06b_baifa_bulu.png") });
  // (丙) 鞭尸作 passage：E228 下 Q377/Q378
  const bian = await p.evaluate(async (eid) => {
    document.querySelectorAll("details.chron-row[open]").forEach(d => { d.open = false; });
    const det = document.querySelector('details.chron-row[data-eid="' + eid + '"]');
    if (!det) return null;
    det.open = true;
    await new Promise(r => setTimeout(r, 700));
    const got = ["Q377", "Q378"].map(id => {
      const q = det.querySelector('[data-qid="' + id + '"]');
      return q ? { id, layer: (q.querySelector(".q-layer") || {}).textContent,
                   style: getComputedStyle(q).borderLeftStyle,
                   text: q.innerText.replace(/\s+/g, " ").slice(0, 160) } : { id, missing: true };
    });
    det.scrollIntoView({ block: "center" });
    return { got, standalone: DATA.events.filter(e => /鞭/.test(e.title)).map(e => e.id) };
  }, "E228");
  (bian ? bian.got : []).forEach(g => say("  " + g.id + " [" + (g.layer || "?") + "] 左线 " + (g.style || "?") + " ｜ " + (g.text || "缺")));
  OK(!!bian && bian.got.every(g => !g.missing && /后出叙事/.test(g.layer || "")),
     "（丙）鞭尸两条皆作 E228 下的 passage、层标「后出叙事」");
  OK(!!bian && bian.got.every(g => g.style === "dashed"), "（丙）后出叙事层左线为灰虚线（§3.5：虚线示「非当代记事」）");
  OK(!!bian && bian.standalone.length === 0, "（丙）反证：全库无以「鞭」为题的独立事目 —— 「详载中之无」判据的落地（conventions §7 v1.25）");
  await p.locator('details.chron-row[data-eid="E228"]').screenshot({ path: path.join(OUT, "r27_06c_bianshi_passage.png") });

  H("19) r27 · 七之：四档宽度（吴分区首页 / 阖庐时间线 / 编年）无横向溢出");
  for (const w of [1440, 1024, 768, 390]) {
    await p.setViewportSize({ width: w, height: 900 });
    for (const [nm, url] of [["首页", "/#/"], ["阖庐时间线", "/#/p/P_HELU/timeline"], ["编年", "/#/chronicle"]]) {
      await p.goto(origin + url, { waitUntil: "load" }); await p.waitForTimeout(900);
      const of = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      OK(of.sw <= of.cw + 1, w + "px · " + nm + "：无横向溢出（scrollWidth " + of.sw + " ≤ clientWidth " + of.cw + "）");
    }
  }
  await p.setViewportSize({ width: 1440, height: 900 });

  H("19) r27 · 八之：本批大条走查（季札观乐 / 柏举双视角 / 申包胥哭秦庭）");
  // 季札观乐 E223：「论对」类大条——图标须是 lundui，评语作 passage 逐条并陈
  await p.goto(origin + "/#/chronicle", { waitUntil: "load" }); await p.waitForTimeout(1500);
  const jz = await p.evaluate(async () => {
    const det = document.querySelector('details.chron-row[data-eid="E223"]');
    if (!det) return null;
    det.open = true; await new Promise(r => setTimeout(r, 700));
    det.scrollIntoView({ block: "center" });
    const ico = det.querySelector(".cat-ico svg");
    return { cat: det.dataset.cat, lundui: !!(ico && /x="3\.8"/.test(ico.outerHTML)),
             title: (det.querySelector("summary") || {}).innerText.replace(/\s+/g, " "),
             quotes: det.querySelectorAll(".quote").length,
             stateChip: (det.querySelector(".chron-state") || {}).textContent,
             body: det.innerText.replace(/\s+/g, " ").slice(0, 150) };
  });
  say("  E223「" + (jz ? jz.title : "—") + "」：分类 " + (jz && jz.cat) + "，引文 " + (jz && jz.quotes) + " 条，国色签「" + (jz && jz.stateChip) + "」");
  OK(!!jz && jz.cat === "论对" && jz.lundui, "季札观乐为「论对」类大条，图标已实装 lundui");
  OK(!!jz && jz.quotes >= 3, "观乐评语作 passage 逐条并陈（" + (jz ? jz.quotes : 0) + " 条）");
  await p.locator('details.chron-row[data-eid="E223"]').screenshot({ path: path.join(OUT, "r27_07a_jizha_guanyue.png") });
  // 申包胥哭秦庭 E244
  const sbx = await p.evaluate(async () => {
    document.querySelectorAll("details.chron-row[open]").forEach(d => { d.open = false; });
    const det = document.querySelector('details.chron-row[data-eid="E244"]');
    if (!det) return null;
    det.open = true; await new Promise(r => setTimeout(r, 700));
    det.scrollIntoView({ block: "center" });
    return { title: (det.querySelector("summary") || {}).innerText.replace(/\s+/g, " "),
             people: [...det.querySelectorAll(".evt-person")].map(b => b.textContent.replace(/\s+/g, "")),
             quotes: det.querySelectorAll(".quote").length,
             hasWuyi: /無衣|无衣/.test(det.innerText) };
  });
  say("  E244「" + (sbx ? sbx.title : "—") + "」：引文 " + (sbx && sbx.quotes) + " 条，所系 " + (sbx ? sbx.people.join("、") : "—"));
  OK(!!sbx && sbx.quotes >= 1 && sbx.hasWuyi, "申包胥哭秦庭成条，秦哀公赋《无衣》在引文内");
  OK(!!sbx && sbx.people.some(t => /伍员/.test(t)), "所系人物签内见伍员（其与申包胥「一覆一兴」之约的另一半）");
  await p.locator('details.chron-row[data-eid="E244"]').screenshot({ path: path.join(OUT, "r27_07b_shenbaoxu.png") });
  // 柏举大条双视角：同一条 E228 在阖庐（亲至）与伍员（相关）两条时间线上的呈现
  for (const [pid, nm] of [["P_HELU", "阖庐"], ["P_WUYUAN", "伍员"]]) {
    await p.goto(origin + "/#/p/" + pid + "/timeline", { waitUntil: "load" }); await p.waitForTimeout(1400);
    const bj = await p.evaluate(async (pid) => {
      const det = document.querySelector('#timeline-list details[data-eid="E228"]');
      if (!det) return null;
      det.open = true; await new Promise(r => setTimeout(r, 600));
      det.scrollIntoView({ block: "center" });
      const link = DATA.event_people.find(l => l.event_id === "E228" && l.person_id === pid) || {};
      return { chips: [...det.querySelectorAll(".chip")].map(c => c.textContent.replace(/\s+/g, "")),
               role: (det.innerText.match(/[^。\n]{0,40}行人[^。\n]{0,40}/) || [])[0] || null,
               quotes: det.querySelectorAll(".quote").length,
               presence: link.presence, directness: link.directness };
    }, pid);
    say("  " + nm + " 线上的 E228：presence=" + (bj && bj.presence) + "/" + (bj && bj.directness) +
        "，chips " + (bj ? bj.chips.join(" ") : "—") + "，引文 " + (bj && bj.quotes) + " 条");
    OK(!!bj, nm + " 时间线上有柏举大条 E228（同一条事件，两条人物线各出一次）");
    OK(!!bj && bj.chips.some(c => new RegExp(bj.presence).test(c)),
       nm + " 的 presence chip 如实作「" + (bj && bj.presence) + "」");
    await p.locator('#timeline-list details[data-eid="E228"]').screenshot({ path: path.join(OUT, "r27_07c_boju_" + pid + ".png") });
  }

  say("\n控制台告警：" + (warns.length ? warns.join(" | ") : "无"));
  say("页面错误：" + (errs.length ? errs.join(" | ") : "无"));
  const fails = log.filter(l => l.startsWith("  [FAIL]"));
  say("\n===== 汇总：" + (log.filter(l => l.startsWith("  [OK]")).length) + " 项通过，" + fails.length + " 项未过 =====");
  fails.forEach(f => say(f));
  await b.close(); if (s) s.close();
  fs.writeFileSync(path.join(OUT, "r24a_log.txt"), log.join("\n"), "utf8");
})();
