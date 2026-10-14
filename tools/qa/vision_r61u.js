/* 经纬春秋 · r61-U 可重跑之验：presence 三值之显——「不在」不作「在场」
 * （任务书 team/round61_prompts.md「Task for Vision · r61-U」；所据 §二十一 裁二百二十八 二；
 *   conventions §6 v1.27 c、§7 presence 从严通例）
 *
 * 用法（自 tools/qa/ 起跑，playwright 在此处 node_modules 内）：  node vision_r61u.js
 * 【退出码】
 *   0 ＝ 全过；
 *   1 ＝ 有判红（某条断言未过）；
 *   2 ＝ 本门自身出错（浏览器取不到、前提不成、反证未红即判据空转、页面抛错）。
 *
 * ★ 期值一律自 site/data/*.json 独立复算（「不在」之全集、在场之谓词、轨迹之站列、投影公式），
 *   不读 app.js 之索引与谓词；页内函数（buildTraj、personParts、detectMeetings）只作**被验之物**，不作期值之源。
 * ★ 在场之谓词（裁二百二十八 二）：在场＝presence ∈ {亲至, 空}；「相关」「不在」俱非在场。
 *
 * 验：「不在」全集（今 4 行，不写死）逐行——
 *  §一 编年卡「所系人物」签：字＝「不在」、样式虚（is-related）、提示书「不在」不书「亲至」；居一切在场者之后。
 *  §二 （一级）时间线：personal 签字＝「不在」、rel-low 非 rel-high；身份胶囊尾书「 · 不在」。
 *  §三 （一级）地图：轨迹站列＝独立复算（只取在场之行；投影照 conventions §4）；状态行站数同；
 *      其事不入任一站（页内 buildTraj 亦验）；其地之锚：其人于其地无他在场之事者作空心、不书「亲至地点」；
 *      点其锚，抽屉事列于此事书「（不在）」。
 *  §四 并观：personParts 不含其事；构造交会——页内为另一主角补一「亲至」行于同事，detectMeetings 不得出该事之同场。
 *  §五 （二级）关系详情「所系之事」：签字＝「不在」、rel-low。
 *  §六 孔子之地图（任务书点名）：前492 无曲阜之站——站列逐项对独立期值，且无一站含 E285。
 *  §七 按类反证（design_notes §7.2、§7.10）：页内把全站谓词换回旧之二分（「非相关即在场」），
 *      §一至§四 之判据须当场红；任一不红 → exit 2。
 */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { requireBrowser } = require("./require_browser.js");
const ROOT = path.resolve(__dirname, "..", ".."), SITE = path.join(ROOT, "site");
const J = (n) => JSON.parse(fs.readFileSync(path.join(SITE, "data", n + ".json"), "utf8"));

let fails = 0, gateErrs = 0, asserts = 0;
const ok = (c, l, d) => { asserts++; if (!c) fails++; console.log("  " + (c ? "✓" : "✗") + " " + l + (d ? "  —— " + d : "")); };
const selfcheck = (c, l, d) => { if (!c) gateErrs++; console.log("  " + (c ? "✓" : "⚠") + " 〔门自检〕" + l + (d ? "  —— " + d : "")); };

const PPL = J("people"), EP = J("event_people"), EVS = J("events"), PLS = J("places");
const EV = new Map(EVS.map(e => [e.id, e])), PL = new Map(PLS.map(p => [p.id, p])), PP = new Map(PPL.map(p => [p.id, p]));
const PROTO = new Set(PPL.filter(p => Number(p.is_protagonist) === 1).map(p => p.id));
/* 在场之谓词（独立书之，不取 app.js）：空视同亲至（conventions §6） */
const present = (v) => (v || "亲至") === "亲至";
const ABSENT = EP.filter(l => l.presence === "不在" && EV.has(l.event_id) && PP.has(l.person_id));
const evCmp = (a, b) => (a.year_bce - b.year_bce) || ((a.sort_key ?? 9999) - (b.sort_key ?? 9999)) || a.id.localeCompare(b.id);
const proj = (lng, lat) => [(lng - 105.0) / 17.0 * 1200, 700 - (lat - 29.5) / 9.0 * 700];   // conventions §4
/* 某人地图轨迹之期值：在场之行、有坐标、按 (year, sort_key, id)；连续同地或投影距 < 0.5 者并为一站（与地图之聚站口径同） */
function expectTraj(pid, extra) {
  const byE = new Map();
  for (const l of EP.concat(extra || [])) if (l.person_id === pid && EV.has(l.event_id) && !byE.has(l.event_id)) byE.set(l.event_id, l);
  const evs = [...byE.values()].map(l => ({ ...EV.get(l.event_id), presence: l.presence || "亲至" })).sort(evCmp);
  const st = [];
  for (const e of evs) {
    if (!present(e.presence)) continue;
    const pl = e.place_id ? PL.get(e.place_id) : null;
    if (!pl || pl.lat == null || pl.lng == null) continue;
    const [x, y] = proj(pl.lng, pl.lat), last = st[st.length - 1];
    if (last && (last.pid === pl.id || Math.hypot(x - last.x, y - last.y) < 0.5)) { last.eids.push(e.id); continue; }
    st.push({ pid: pl.id, name: pl.ancient_name, x, y, year: e.year_bce, eids: [e.id] });
  }
  return st;
}
const stLine = (st) => st.map(s => "前" + (-s.year) + s.name).join(" → ");

function srv() {
  const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" };
  return new Promise((res, rej) => {
    const s = http.createServer((rq, rs) => {
      let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]); if (u === "/") u = "/index.html";
      const fp = path.join(SITE, u); if (!fp.startsWith(SITE)) { rs.writeHead(403); rs.end(); return; }
      fs.readFile(fp, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(u)] || "application/octet-stream" }); rs.end(d); });
    });
    s.on("error", rej); s.listen(0, "127.0.0.1", () => res(s));
  });
}

/* ---------- 页上之量（皆返回纯数据，供正验与反证共用同一判函数） ---------- */
/* 编年卡之人签：展开其卡（卡体按需构建），读全部人签 */
async function readChronPeople(pg, eid) {
  return pg.evaluate(async (id) => {
    const d = document.querySelector('#chron-list details[data-eid="' + id + '"]'); if (!d) return null;
    d.querySelectorAll(".event-body").forEach(n => n.remove());   // 幂等重建：反证时须以新谓词重出
    d.open = false; d.open = true; chronEnsureBody(d);
    await new Promise(r => setTimeout(r, 30));
    return [...d.querySelectorAll(".evt-person")].map(b => ({ pid: b.dataset.pid,
      word: (b.querySelector("small") || {}).textContent, related: b.classList.contains("is-related"), tip: b.title }));
  }, eid);
}
function judgeChron(got, row) {
  const errs = [];
  if (!got) return ["编年卡 " + row.event_id + " 不在页上"];
  const me = got.find(g => g.pid === row.person_id);
  if (!me) return ["编年卡 " + row.event_id + " 无其人签 " + row.person_id];
  if (me.word !== "不在") errs.push("签字「" + me.word + "」应「不在」");
  if (!me.related) errs.push("样式非虚（缺 is-related）");
  // 提示之句：其人之 role_in_event 文中或自含「不在」字（如 E322），故断其 presence 之括注本身，不以泛搜「不在」了之
  if (!me.tip.includes("（不在：") || me.tip.includes("（亲至：")) errs.push("提示之括注不合「" + me.tip.slice(-40) + "」");
  const k = got.indexOf(me);
  const presAfter = got.slice(k + 1).filter(g => g.word === "亲至");
  if (presAfter.length) errs.push("其后尚有亲至者 " + presAfter.map(g => g.pid).join(","));
  return errs;
}
/* 一级时间线：该卡之 personal 签与身份胶囊 */
async function readTimeline(pg, eid) {
  return pg.evaluate((id) => {
    // 只取时间线之卡：同一页内编年之卡（#chron-list）亦带同一 data-eid，不得混取
    const d = document.querySelector('#timeline-list details[data-eid="' + id + '"]'); if (!d) return null;
    const chip = [...d.querySelectorAll(".meta-chips .chip")].find(c => /^(亲至|相关|不在)$/.test(c.textContent));
    const role = d.querySelector(".role-chip");
    return { chip: chip ? chip.textContent : null, low: chip ? chip.classList.contains("rel-low") : null,
      high: chip ? chip.classList.contains("rel-high") : null, tip: chip ? chip.title : "", role: role ? role.textContent : null };
  }, eid);
}
function judgeTimeline(got, row) {
  const errs = [];
  if (!got) return ["时间线无卡 " + row.event_id];
  if (got.chip !== "不在") errs.push("签字「" + got.chip + "」应「不在」");
  if (!got.low || got.high) errs.push("样式应 rel-low（low=" + got.low + " high=" + got.high + "）");
  if ((row.role_in_event || "") && !(got.role || "").endsWith(" · 不在")) errs.push("身份胶囊「" + got.role + "」尾不书「 · 不在」");
  return errs;
}
/* 一级地图：polyline 之站、状态行、锚 */
async function readMap(pg, pid, placeId) {
  return pg.evaluate(({ pid, placeId }) => {
    const pl = document.querySelector("#layer-anchors polyline.traj");
    const pts = pl ? pl.getAttribute("points").trim().split(/\s+/).map(s => s.split(",").map(Number)) : [];
    const a = placeId ? document.querySelector('#layer-anchors g.anchor[data-place="' + placeId + '"]') : null;
    const dot = a ? a.querySelector("circle.dot") : null;
    let bt = null; try { bt = buildTraj(pid).map(t => ({ place: t.place.id, eids: t.events.map(e => e.id) })); } catch (e) { bt = String(e); }
    return { pts, status: (document.querySelector("#map-status") || {}).textContent || "",
      anchor: a ? { label: a.getAttribute("aria-label"), fill: dot.getAttribute("fill") } : null, bt };
  }, { pid, placeId });
}
function judgeMap(got, row, want, otherPresentHere) {
  const errs = [];
  const n = want.length;
  // 页上 polyline 只于 ≥2 站时出；1 站时状态行书「亲至可考一地」
  if (n >= 2) {
    if (got.pts.length !== n) errs.push("轨迹 " + got.pts.length + " 站，应 " + n);
    else for (let i = 0; i < n; i++) if (Math.abs(got.pts[i][0] - want[i].x) > 1e-6 || Math.abs(got.pts[i][1] - want[i].y) > 1e-6) { errs.push("第 " + (i + 1) + " 站坐标不合（应 " + want[i].name + "）"); break; }
    if (!got.status.includes("亲至轨迹共 " + n + " 站")) errs.push("状态行「" + got.status.slice(0, 30) + "」站数不合 " + n);
  } else if (got.pts.length) errs.push("应无轨迹线，页上有 " + got.pts.length + " 点");
  if (Array.isArray(got.bt)) { if (got.bt.some(t => t.eids.includes(row.event_id))) errs.push("buildTraj 有站含 " + row.event_id); }
  else errs.push("buildTraj 出错：" + got.bt);
  if (got.anchor && !otherPresentHere) {
    if (got.anchor.fill !== "#F4EDDF") errs.push("其地之锚作实心（fill " + got.anchor.fill + "）");
    if (/亲至地点/.test(got.anchor.label)) errs.push("其地之锚书「" + got.anchor.label + "」");
  }
  return errs;
}

(async () => {
  console.log("经纬春秋 · r61-U presence 三值之显之验");
  selfcheck(EP.length > 0 && EVS.length > 0, "event_people／events 非空", EP.length + "／" + EVS.length);
  selfcheck(ABSENT.length > 0, "库中有 presence「不在」之行（另路自 event_people.json 取，不写死其数）", ABSENT.length + " 行");
  console.log("  「不在」全集：" + ABSENT.map(l => l.event_id + "／" + l.person_id + "（" + PP.get(l.person_id).name + (PROTO.has(l.person_id) ? "·一级" : "·二级") + "，" + (EV.get(l.event_id).place_id ? PL.get(EV.get(l.event_id).place_id).ancient_name : "无落点") + "）").join("；"));
  const absProto = ABSENT.filter(l => PROTO.has(l.person_id)), absSec = ABSENT.filter(l => !PROTO.has(l.person_id));
  selfcheck(absProto.length > 0, "「不在」之行中有一级者（时间线／地图／并观之判不空转）", absProto.length + " 行");
  const KZ = ABSENT.find(l => l.person_id === "P_KONGZI" && l.event_id === "E285");
  selfcheck(!!KZ, "任务书点名之 E285／P_KONGZI「不在」行在库（若改，本门须改择，不得默然少一例）");
  if (gateErrs) { console.log("门自身出错（前提不成）"); process.exit(2); }

  const { browser, executablePath, browserVersion } = await requireBrowser();
  console.log("  浏览器：" + executablePath + "  " + browserVersion);
  const s = await srv(); const base = "http://127.0.0.1:" + s.address().port + "/";
  const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", JSON.stringify({ v: 1, step: -1, done: true })); } catch (e) { /* 无妨 */ } });
  const pg = await ctx.newPage(); pg.on("pageerror", e => errs.push(String(e)));
  const shotDir = path.join(__dirname, "screenshots");
  try { fs.mkdirSync(shotDir, { recursive: true }); } catch { /* 无妨 */ }
  const go = async (h, sel) => { await pg.goto(base + h, { waitUntil: "networkidle" }); if (sel) await pg.waitForSelector(sel); };

  /* 地图之判所需：其人于其地另有在场之事否（有则锚本当实心，不判空心） */
  const otherPresentAt = (row) => { const pid = EV.get(row.event_id).place_id; return !!pid && EP.some(l => l.person_id === row.person_id && l.event_id !== row.event_id && present(l.presence) && EV.has(l.event_id) && EV.get(l.event_id).place_id === pid); };

  /* ================= §一 编年卡人签 ================= */
  console.log("\n§一 编年卡「所系人物」签（全集 " + ABSENT.length + " 行）");
  await go("#/chronicle", "#chron-list details");
  for (const row of ABSENT) {
    const e = judgeChron(await readChronPeople(pg, row.event_id), row);
    ok(!e.length, row.event_id + "／" + PP.get(row.person_id).name + "：签字「不在」、样式虚、提示书不在、居在场者之后", e.join(" | "));
  }
  const e322 = ABSENT.find(l => l.event_id === "E322");
  if (e322) {
    await pg.waitForTimeout(500);   // 截其卡本身（整页截图于平滑滚动中取景不稳）
    await pg.locator('#chron-list details[data-eid="E322"]').screenshot({ path: path.join(shotDir, "r61u_chron_E322.png") });
  }

  /* ================= §二 一级时间线 ================= */
  console.log("\n§二 一级时间线之 presence 签（" + absProto.length + " 行）");
  for (const row of absProto) {
    await go("#/p/" + row.person_id + "/timeline", '#timeline-list details[data-eid="' + row.event_id + '"]');
    const e = judgeTimeline(await readTimeline(pg, row.event_id), row);
    ok(!e.length, row.event_id + "／" + PP.get(row.person_id).name + "：时间线签字「不在」、rel-low、身份胶囊书「 · 不在」", e.join(" | "));
    if (row.event_id === "E322") {
      await pg.evaluate(() => { document.querySelector('#timeline-list details[data-eid="E322"]').open = true; });
      await pg.waitForTimeout(500);
      await pg.locator('#timeline-list details[data-eid="E322"]').screenshot({ path: path.join(shotDir, "r61u_timeline_E322_zhaodun.png") });
    }
  }

  /* ================= §三 一级地图 ================= */
  console.log("\n§三 一级地图：轨迹、状态行、锚、抽屉");
  for (const row of absProto) {
    const want = expectTraj(row.person_id), placeId = EV.get(row.event_id).place_id || null;
    await go("#/p/" + row.person_id + "/map", "#layer-anchors g.anchor");
    const got = await readMap(pg, row.person_id, placeId);
    const e = judgeMap(got, row, want, otherPresentAt(row));
    ok(!e.length, row.event_id + "／" + PP.get(row.person_id).name + "：轨迹 " + want.length + " 站＝独立复算、其事不入站、其地之锚合" + (placeId ? "" : "（本行无落点）"), e.join(" | "));
    if (placeId && got.anchor) {
      // 点其锚 → 抽屉事列于此事书「（不在）」
      await pg.evaluate((p) => { document.querySelector('#layer-anchors g.anchor[data-place="' + p + '"]').dispatchEvent(new MouseEvent("click", { bubbles: true })); }, placeId);
      await pg.waitForTimeout(350);
      const lis = await pg.$$eval("#place-panel li, #drawer-content li", a => a.map(x => x.textContent));
      const t = EV.get(row.event_id).title;
      const li = lis.find(x => x.includes(t));
      ok(!!li && li.endsWith("（不在）"), row.event_id + "：地点抽屉之事列书「（不在）」", li || "（未见其事）");
      if (row.event_id === "E285") await pg.screenshot({ path: path.join(shotDir, "r61u_map_kongzi_drawer.png") });
    }
  }

  /* §三之构造：地图自建之轨（renderMap，与 buildTraj 二路）——页内为孔子补一「不在」行于异地之事，重渲，轨迹须不变 */
  const kzSt = expectTraj("P_KONGZI");
  const synEv = EVS.filter(e => e.place_id && PL.get(e.place_id) && PL.get(e.place_id).lat != null && !EP.some(l => l.event_id === e.id && l.person_id === "P_KONGZI"))
    .filter(e => { const [x, y] = proj(PL.get(e.place_id).lng, PL.get(e.place_id).lat); return kzSt.every(st => st.pid !== e.place_id && Math.hypot(st.x - x, st.y - y) >= 0.5); })
    .filter(e => e.year_bce > kzSt[0].year && e.year_bce < kzSt[kzSt.length - 1].year).sort(evCmp)[0];
  const synRow = synEv && { event_id: synEv.id, person_id: "P_KONGZI", presence: "不在", role_in_event: "〔门之构造〕" };
  const synMap = async (pgx) => {
    await pgx.evaluate((r) => { DATA.event_people.push(r); renderMap(); }, synRow);
    const got = await readMap(pgx, "P_KONGZI", null);
    await pgx.evaluate(() => { DATA.event_people.pop(); renderMap(); });
    return judgeMap(got, synRow, expectTraj("P_KONGZI", [synRow]), true);
  };
  if (synRow) {
    await go("#/p/P_KONGZI/map", "#layer-anchors polyline.traj");
    const e = await synMap(pg);
    ok(!e.length, "构造：孔子补「不在」于 " + synEv.id + "（" + PL.get(synEv.place_id).ancient_name + "，前" + (-synEv.year_bce) + "）→ 地图自建之轨仍 " + kzSt.length + " 站", e.join(" | "));
  } else selfcheck(false, "地图构造之样本可得");

  /* ================= §四 并观 ================= */
  console.log("\n§四 并观：personParts 与交会");
  await go("#/", null);
  for (const row of absProto) {
    const inParts = await pg.evaluate(({ pid, eid }) => personParts(pid).some(e => e.id === eid), { pid: row.person_id, eid: row.event_id });
    ok(!inParts, row.event_id + "／" + PP.get(row.person_id).name + "：不入「亲至且在世」（personParts）");
  }
  /* 构造交会：取一「不在」且有落点之一级行，页内为另一主角补一「亲至」行于同事；正确之谓词下不得出该事之同场 */
  const cRow = absProto.find(l => EV.get(l.event_id).place_id);
  const partner = cRow && [...PROTO].sort().find(q => q !== cRow.person_id && !EP.some(l => l.person_id === q && l.event_id === cRow.event_id));
  const meetProbe = (pgx) => pgx.evaluate(({ a, b, eid }) => {
    DATA.event_people.push({ event_id: eid, person_id: b, presence: "亲至", role_in_event: "〔门之构造〕" });
    try { return detectMeetings(a, b).filter(m => m.level === "a" && m.ea.id === eid).length; }
    finally { DATA.event_people.pop(); }
  }, { a: cRow.person_id, b: partner, eid: cRow.event_id });
  if (cRow && partner) ok(await meetProbe(pg) === 0, "构造：" + PP.get(partner).name + " 亲至 " + cRow.event_id + " → 与「不在」之 " + PP.get(cRow.person_id).name + " 不出同场");
  else selfcheck(false, "构造交会之样本可得");

  /* ================= §五 二级关系详情 ================= */
  console.log("\n§五 二级关系详情「所系之事」（" + absSec.length + " 行）");
  for (const row of absSec) {
    await go("#/library/people", "#lib-list li");
    await pg.click('#lib-list button.lib-person[data-lib-id="' + row.person_id + '"]');
    await pg.waitForSelector("#rel-panel .rel-evts");
    const c = await pg.evaluate((id) => { const b = document.querySelector('#rel-panel .rel-evt[data-eid="' + id + '"] .chip'); return b ? { t: b.textContent, low: b.classList.contains("rel-low"), tip: b.title } : null; }, row.event_id);
    ok(!!c && c.t === "不在" && c.low && /不在/.test(c.tip), row.event_id + "／" + PP.get(row.person_id).name + "：抽屉签字「不在」、rel-low", JSON.stringify(c));
    if (row.person_id === "P_WENZHONG") {
      await pg.evaluate(() => document.querySelector("#rel-panel .rel-evts").scrollIntoView({ block: "center" }));
      await pg.waitForTimeout(200);
      await pg.screenshot({ path: path.join(shotDir, "r61u_drawer_wenzhong.png") });
    }
  }

  /* ================= §六 孔子之地图 ================= */
  console.log("\n§六 孔子之地图：前492 无曲阜之站");
  {
    const want = expectTraj("P_KONGZI");
    await go("#/p/P_KONGZI/map", "#layer-anchors polyline.traj");
    const got = await readMap(pg, "P_KONGZI", "L_QUFU");
    console.log("  期值站列（" + want.length + "）：" + stLine(want));
    ok(!want.some(s => s.eids.includes("E285")), "期值站列无含 E285 者（自证期值之源合谓词）");
    const e = judgeMap(got, KZ, want, true);
    ok(!e.length, "页上轨迹 " + got.pts.length + " 站＝期值 " + want.length + " 站（逐站坐标合）", e.join(" | "));
    const y492 = want.filter(s => s.year === -492 || s.eids.some(id => EV.get(id).year_bce === -492));
    ok(!y492.some(s => s.pid === "L_QUFU" && s.eids.some(id => EV.get(id).year_bce === -492)), "前492 无曲阜之站", y492.map(s => s.name).join("、") || "前492 无站");
    await pg.screenshot({ path: path.join(shotDir, "r61u_map_kongzi.png") });
  }

  /* ================= §七 按类反证 ================= */
  console.log("\n§七 按类反证：页内把全站谓词换回旧之二分（非相关即在场），判据须当场红");
  {
    const OLD = "(p) => (p || '亲至') !== '相关'";
    const inject = (pgx) => pgx.evaluate((src) => { window.isPresent = eval(src); }, OLD);
    const row = KZ, rowT = absProto.find(l => l.event_id === "E322") || absProto[0];
    // ① 编年人签
    await go("#/chronicle", "#chron-list details"); await inject(pg);
    const r1 = judgeChron(await readChronPeople(pg, rowT.event_id), rowT);
    selfcheck(r1.length > 0, "反证① 编年卡 " + rowT.event_id + " 人签之判当场红", r1[0] || "（未红）");
    // ② 时间线
    await go("#/p/" + rowT.person_id + "/timeline", '#timeline-list details[data-eid="' + rowT.event_id + '"]');
    await inject(pg); await pg.evaluate(() => renderTimeline());
    const r2 = judgeTimeline(await readTimeline(pg, rowT.event_id), rowT);
    selfcheck(r2.length > 0, "反证② 时间线 " + rowT.event_id + " 签之判当场红", r2[0] || "（未红）");
    // ③ 地图（孔子）
    await go("#/p/P_KONGZI/map", "#layer-anchors polyline.traj");
    await inject(pg); await pg.evaluate(() => renderMap());
    await pg.waitForSelector("#layer-anchors polyline.traj");
    const r3 = judgeMap(await readMap(pg, "P_KONGZI", "L_QUFU"), row, expectTraj("P_KONGZI"), true);
    selfcheck(r3.length > 0, "反证③ 孔子地图之判当场红", r3[0] || "（未红）");
    if (synRow) {
      await go("#/p/P_KONGZI/map", "#layer-anchors polyline.traj"); await inject(pg);
      const r3b = await synMap(pg);
      selfcheck(r3b.some(x => /站/.test(x) && !/buildTraj/.test(x)), "反证③b 构造之「不在」行入地图自建之轨 → 站数之判当场红", r3b.find(x => !/buildTraj/.test(x)) || "（未红）");
    }
    // ④ 并观
    await go("#/", null); await inject(pg);
    const r4a = await pg.evaluate(({ pid, eid }) => personParts(pid).some(e => e.id === eid), { pid: row.person_id, eid: row.event_id });
    selfcheck(r4a === true, "反证④ personParts 当场含 E285（不入之判当场红）");
    if (cRow && partner) selfcheck(await meetProbe(pg) > 0, "反证④ 构造交会当场出同场（交会之判当场红）");
  }

  selfcheck(errs.length === 0, "页面无抛错", errs.slice(0, 3).join(" | "));
  await browser.close(); s.close();
  console.log("\n合计断言 " + asserts + " 条，判红 " + fails + "；门自检出错 " + gateErrs);
  process.exit(gateErrs ? 2 : fails ? 1 : 0);
})().catch(e => { console.error("门自身出错：", e); process.exit(2); });
