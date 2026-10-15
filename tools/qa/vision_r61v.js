/* 经纬春秋 · r61-V 可重跑之验：关系页带其人之址；地图图例恒列「相关」「不在」
 * （任务书 team/round61_prompts.md「Task for Vision · r61-V」（含 2026-10-14 续命 ⑤⑥）；
 *   所据 §二十一 裁二百二十八 三、§二十四 裁二百二十九 二③）
 *
 * 用法（自 tools/qa/ 起跑，playwright 在此处 node_modules 内）：  node vision_r61v.js
 * 【退出码】
 *   0 ＝ 全过；
 *   1 ＝ 有判红（某条断言未过）；
 *   2 ＝ 本门自身出错（浏览器取不到、前提不成、反证未红即判据空转、页面抛错）。
 *
 * 址之式：`#/relations?ego=<PID>`（一级二级同式）；`#/p/<一级>/relations` 一字不变；`#/p/<二级>/…` 之落法不动。
 * ★ 期值之址由本门另路书之（"#/relations?ego=" + encodeURIComponent(pid)），不取 app.js 之 buildHash；
 *   样本与人名、邻人俱自 site/data/*.json 择，不写死其现数。
 *
 * 验：
 *  §一 往返：全库每人 buildHash → 期值之址；置址 → parseHash 得 {view: relations, ego: 其人, person: 无} → buildHash 回同址。
 *      并验四式不动：`#/p/<一级>/relations` 之出入、`#/relations` 无 ego、不识之 ego 不设、`#/p/<二级>/timeline` 仍落首页。
 *  §二 直开：二级三人、一级一人直开其址即见其人（ego 中心、面包屑、中心节点、址不变）；不识之 ego 落全景且址就地改为 `#/relations`；
 *      `#/p/<一级>/relations` 直开照旧；`#/p/<二级（介之推）>/timeline` 照旧静默落首页、址不变（站长不取第 4 项，不动）。
 *  §三 后退：资料库点二级 → 其址 → 点「所系之事」落编年 → 后退回其人（三人）；编年人签 → 其址 → 后退回编年；
 *      页内游走（点邻人）记址 → 后退回前一人 → 前进复至；`#/p/<一级>/relations` 游走 → 后退回一级之路由；
 *      全景⇄以人为中心之钮记址、后退复其态；游走后点事落编年 → 后退回游走所至之人。
 *  §四 地图图例：「相关」「不在」二行恒在（一级之图有「不在」行者、无者各一，并 375 宽），俱空心锚，
 *      其语：「相关」书「无其在场明文」且不含「不在」；「不在」书「明书其不在」；图例不出图框、页无横溢。
 *      375 宽另立二断（裁二百三十 二4）：图框不出视口（scrollWidth ≤ clientWidth）；「无地望」计数之盒与图例之盒不相交。
 *  §五 按类反证：① buildHash 换回不记 ego → 往返红；② 游走不记址（relSyncHash 空转）→ 后退红；
 *      ③ parseHash 丢 ego → 直开红；④ goSearchPerson 换回旧式 → 资料库点入之址红；⑤ 删「不在」一行 → 图例恒在红；
 *      ⑥ 「相关」之释改作「不在场」→ 图例措辞红；⑦ 375 宽图例复 max-content 宽 → 出框红。任一不红 → exit 2。
 */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { requireBrowser } = require("./require_browser.js");
const ROOT = path.resolve(__dirname, "..", ".."), SITE = path.join(ROOT, "site");
const J = (n) => JSON.parse(fs.readFileSync(path.join(SITE, "data", n + ".json"), "utf8"));

let fails = 0, gateErrs = 0, asserts = 0;
const ok = (c, l, d) => { asserts++; if (!c) fails++; console.log("  " + (c ? "✓" : "✗") + " " + l + (d ? "  —— " + d : "")); };
const selfcheck = (c, l, d) => { if (!c) gateErrs++; console.log("  " + (c ? "✓" : "⚠") + " 〔门自检〕" + l + (d ? "  —— " + d : "")); };

const PPL = J("people"), EP = J("event_people"), REL = J("relations");
const PP = new Map(PPL.map(p => [p.id, p]));
const PROTO = new Set(PPL.filter(p => Number(p.is_protagonist) === 1).map(p => p.id));
const rowsOf = (pid) => EP.filter(l => l.person_id === pid);
const egoHash = (pid) => "#/relations?ego=" + encodeURIComponent(pid);   // 期值之址（另路书之）
const neighbors = (pid) => [...new Set(REL.filter(r => (r.person_a === pid || r.person_b === pid) && PP.has(r.person_a) && PP.has(r.person_b))
  .map(r => r.person_a === pid ? r.person_b : r.person_a))].filter(x => x !== pid).sort();

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

/* ---------- 页上之量与判（正验与反证共用同一判函数） ---------- */
/* §一 往返：页内对全库每人跑 buildHash／parseHash；返回纯数据 */
async function readRoundTrip(pg, ids, protoIds, jiezhitui) {
  return pg.evaluate(({ ids, protoIds, jz }) => {
    const keep = location.hash, out = { ego: [], proto: [], misc: {} };
    for (const id of ids) {
      const h = buildHash(null, "relations", null, null, id);
      history.replaceState(null, "", h);
      const st = parseHash();
      out.ego.push({ id, h, view: st.view, ego: st.ego || null, person: st.person, back: buildHash(st.person, st.view, null, null, st.ego) });
    }
    for (const id of protoIds) {
      const h = buildHash(id, "relations");
      history.replaceState(null, "", h);
      const st = parseHash();
      out.proto.push({ id, h, view: st.view, person: st.person, ego: st.ego || null });
    }
    history.replaceState(null, "", "#/relations"); { const st = parseHash(); out.misc.pano = { view: st.view, ego: st.ego || null }; }
    history.replaceState(null, "", "#/relations?ego=P__NO_SUCH__"); { const st = parseHash(); out.misc.bad = { view: st.view, ego: st.ego || null }; }
    if (jz) { history.replaceState(null, "", "#/p/" + jz + "/timeline"); const st = parseHash(); out.misc.jz = { view: st.view, person: st.person, hash: location.hash }; }
    history.replaceState(null, "", keep);
    return out;
  }, { ids, protoIds, jz: jiezhitui });
}
function judgeRoundTrip(got, jiezhitui) {
  const errs = [];
  for (const r of got.ego) {
    if (r.h !== egoHash(r.id)) errs.push(r.id + " 之址「" + r.h + "」应「" + egoHash(r.id) + "」");
    else if (r.view !== "relations" || r.ego !== r.id || r.person) errs.push(r.id + " 解址得 " + JSON.stringify({ view: r.view, ego: r.ego, person: r.person }));
    else if (r.back !== r.h) errs.push(r.id + " 回建「" + r.back + "」≠「" + r.h + "」");
  }
  for (const r of got.proto) {
    if (r.h !== "#/p/" + r.id + "/relations" || r.view !== "relations" || r.person !== r.id || r.ego) errs.push("一级 " + r.id + " 之路由有变：" + JSON.stringify(r));
  }
  if (got.misc.pano.view !== "relations" || got.misc.pano.ego) errs.push("#/relations 解出 ego：" + JSON.stringify(got.misc.pano));
  if (got.misc.bad.view !== "relations" || got.misc.bad.ego) errs.push("不识之 ego 竟设：" + JSON.stringify(got.misc.bad));
  if (jiezhitui && (!got.misc.jz || got.misc.jz.view !== "home" || got.misc.jz.person)) errs.push("#/p/<二级>/timeline 之落法有变：" + JSON.stringify(got.misc.jz));
  return errs;
}
/* 关系页之态 */
async function readRel(pg) {
  return pg.evaluate(() => ({ hash: location.hash, view: state.view, person: state.person, mode: relView.mode, center: relView.center,
    stack: relView.stack.slice(), shown: !document.querySelector("#view-relations").hidden,
    crumb: (document.querySelector("#rel-crumbs .crumb-cur") || {}).textContent || "",
    node: !!document.querySelector('#rel-canvas [aria-current="true"][data-node="' + relView.center + '"]') }));
}
function judgeEgo(got, pid, wantHash) {
  const errs = [];
  if (got.hash !== wantHash) errs.push("址「" + got.hash + "」应「" + wantHash + "」");
  if (got.view !== "relations" || !got.shown) errs.push("不在关系页（view=" + got.view + "）");
  if (got.mode !== "ego" || got.center !== pid) errs.push("所示非以 " + pid + " 为中心（mode=" + got.mode + " center=" + got.center + "）");
  if (got.crumb !== PP.get(pid).name) errs.push("面包屑「" + got.crumb + "」应「" + PP.get(pid).name + "」");
  if (!got.node) errs.push("图上无其中心节点");
  return errs;
}
function judgePano(got) {
  const errs = [];
  if (got.hash !== "#/relations") errs.push("址「" + got.hash + "」应「#/relations」");
  if (got.view !== "relations" || got.mode !== "pano") errs.push("非全景（mode=" + got.mode + "）");
  return errs;
}
/* 地图图例 */
async function readLegend(pg) {
  return pg.evaluate(() => {
    const lg = document.querySelector("#map-legend"), fr = document.querySelector("#map-frame");
    const one = (k) => { const s = lg && lg.querySelector('[data-presence="' + k + '"]'); if (!s) return null;
      const r = s.getBoundingClientRect(), d = s.querySelector(".lg-dot");
      return { text: s.textContent, vis: r.width > 0 && r.height > 0 && getComputedStyle(s).visibility !== "hidden",
        hollow: !!(d && d.classList.contains("lg-hollow") && !d.classList.contains("lg-solid")) }; };
    const lr = lg ? lg.getBoundingClientRect() : null, frr = fr.getBoundingClientRect();
    return { rel: one("相关"), abs: one("不在"), qin: one("亲至"),
      // 图例之框与其每一行俱须在图框之内、且在视口之内（窄屏图例 static，曾以其 max-content 宽撑大图框而溢出视口——故兼判视口）
      inFrame: !!lr && lr.left >= frr.left - 0.5 && lr.right <= frr.right + 0.5 &&
        frr.right <= document.documentElement.clientWidth + 0.5 &&
        [...lg.children].every(c => { const r = c.getBoundingClientRect(); return r.right <= Math.min(lr.right, document.documentElement.clientWidth) + 0.5; }),
      // 图例不为图框内他物所压（「无地望」计数、示意底图钮；图例 pointer-events:none，故以矩形相交量之，不用 elementFromPoint）
      covered: ["#map-nogeo", "#btn-disclaimer"].filter(sel => { const o = document.querySelector(sel); if (!o || o.hidden || !lr) return false;
        const r = o.getBoundingClientRect(); if (!r.width || !r.height) return false;
        return r.left < lr.right - 0.5 && r.right > lr.left + 0.5 && r.top < lr.bottom - 0.5 && r.bottom > lr.top + 0.5; }),
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
  });
}
/* 窄屏二断之量（裁二百三十 二4） */
async function readNarrow(pg) {
  return pg.evaluate(() => {
    const f = document.querySelector("#map-frame"), lg = document.querySelector("#map-legend"), ng = document.querySelector("#map-nogeo");
    const fr = f.getBoundingClientRect(), lr = lg.getBoundingClientRect();
    const nr = ng && !ng.hidden ? ng.getBoundingClientRect() : null;
    const box = (r) => r && [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)];
    return { frameSW: f.scrollWidth, frameCW: f.clientWidth, frameRight: fr.right, vw: document.documentElement.clientWidth,
      docSW: document.documentElement.scrollWidth, docCW: document.documentElement.clientWidth,
      nogeoShown: !!(nr && nr.width && nr.height), lg: box(lr), ng: box(nr),
      overlap: !!(nr && nr.left < lr.right && nr.right > lr.left && nr.top < lr.bottom && nr.bottom > lr.top) };
  });
}
function judgeNarrow(m) {
  const errs = [];
  if (!(m.frameSW <= m.frameCW && m.frameRight <= m.vw + 0.5 && m.docSW <= m.docCW)) errs.push("图框出视口（框 sw " + m.frameSW + "／cw " + m.frameCW + "；框右 " + Math.round(m.frameRight) + "／视口 " + m.vw + "）");
  if (m.nogeoShown && m.overlap) errs.push("「无地望」计数与图例相交");
  return errs;
}
function judgeLegend(got) {
  const errs = [];
  if (!got.rel) errs.push("缺「相关」一行"); if (!got.abs) errs.push("缺「不在」一行");
  for (const [k, x] of [["相关", got.rel], ["不在", got.abs]]) if (x) {
    if (!x.vis) errs.push("「" + k + "」一行不可见");
    if (!x.hollow) errs.push("「" + k + "」之锚非空心");
    if (!x.text.startsWith(k)) errs.push("「" + k + "」一行之名「" + x.text + "」");
  }
  if (got.rel && (!/无其在场明文/.test(got.rel.text) || /不在/.test(got.rel.text))) errs.push("「相关」之语失分寸「" + got.rel.text + "」（须书无其在场明文、不得书不在）");
  if (got.abs && !/明书其不在/.test(got.abs.text)) errs.push("「不在」之语「" + got.abs.text + "」不书明书其不在");
  if (!got.inFrame) errs.push("图例出图框");
  if (got.covered && got.covered.length) errs.push("图例为 " + got.covered.join("、") + " 所压");
  if (got.sw > got.cw) errs.push("页有横溢 " + got.sw + ">" + got.cw);
  return errs;
}

(async () => {
  console.log("经纬春秋 · r61-V 关系页之址、地图图例之验");
  /* ---------- 样本（自数据择） ---------- */
  const sec = PPL.filter(p => !PROTO.has(p.id));
  const female = PP.get("P_ZHAOZHUANGJI");
  const withBuzai = sec.find(p => rowsOf(p.id).some(l => l.presence === "不在"));
  const most = [...sec].sort((a, b) => rowsOf(b.id).length - rowsOf(a.id).length || a.id.localeCompare(b.id))[0];
  const SEC = [female, withBuzai, most].filter(Boolean);
  const protoSample = PPL.find(p => PROTO.has(p.id) && neighbors(p.id).length > 0);
  const jz = PP.get("P_JIEZHITUI");
  const kongzi = PP.get("P_KONGZI");
  const protoNoAbs = PPL.find(p => PROTO.has(p.id) && !rowsOf(p.id).some(l => l.presence === "不在") && rowsOf(p.id).length > 0);
  const protoAbs = PPL.find(p => PROTO.has(p.id) && rowsOf(p.id).some(l => l.presence === "不在"));
  selfcheck(PPL.length > 0 && REL.length > 0, "people／relations 非空", PPL.length + "／" + REL.length);
  selfcheck(!!female && !PROTO.has(female.id), "女性二级样本赵庄姬在库且为二级");
  selfcheck(new Set(SEC.map(p => p.id)).size === 3 && SEC.every(p => !PROTO.has(p.id) && rowsOf(p.id).length > 0 && neighbors(p.id).length > 0),
    "二级三样本互异、俱有挂链与邻人", SEC.map(p => p.name).join("、"));
  selfcheck(!!protoSample, "有邻人之一级样本", protoSample && protoSample.name);
  selfcheck(!!jz && !PROTO.has(jz.id), "介之推在库且为二级（`#/p/<二级>/…` 落法之样本）");
  selfcheck(!!protoAbs && !!protoNoAbs, "一级之图：有「不在」行者、无者各一（图例恒在之判不空转）", (protoAbs && protoAbs.name) + "／" + (protoNoAbs && protoNoAbs.name));
  if (gateErrs) { console.log("门自身出错（前提不成）"); process.exit(2); }

  const { browser, executablePath, browserVersion } = await requireBrowser();
  console.log("  浏览器：" + executablePath + "  " + browserVersion);
  const s = await srv(); const base = "http://127.0.0.1:" + s.address().port + "/";
  const errs = [];
  const mkPage = async (w, h) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", JSON.stringify({ v: 1, step: -1, done: true })); } catch (e) { /* 无妨 */ } });
    const pg = await ctx.newPage(); pg.on("pageerror", e => errs.push(String(e))); return pg;
  };
  const shotDir = path.join(ROOT, "team", "r61V_shots");
  try { fs.mkdirSync(shotDir, { recursive: true }); } catch { /* 无妨 */ }
  const pg = await mkPage(1440, 900);
  // 每次皆整页新载：同页只换 hash 之 goto 是同文档导航（不重载），前一反证之页内注入会漏入下一验——先落 about:blank 断之
  const go = async (p, h, sel) => { await p.goto("about:blank"); await p.goto(base + h, { waitUntil: "networkidle" }); if (sel) await p.waitForSelector(sel); };
  /* r61-T：候「render 已据此址跑完」，不只候「址已变」——setHash 之 hash 同步即变，hashchange→render 在其后之一任务；
   *   render 末置 `prevHash = location.hash`（relSyncHash 之 pushState 亦置之），故以二者相等为其完成之号（同 r61n §三 之治）。 */
  const waitHash = (p, h) => p.waitForFunction((x) => location.hash === x && prevHash === x, h, { timeout: 4000 }).then(() => true, () => false);
  const settle = (p) => p.waitForTimeout(250);
  const clickNode = (p, pid) => p.evaluate((id) => {
    const n = document.querySelector('#rel-canvas [data-node="' + id + '"]'); if (!n) return false;
    n.dispatchEvent(new MouseEvent("click", { bubbles: true })); return true; }, pid);
  const counts = { rt: 0, open: 0, back: 0 };

  /* ================= §一 往返 ================= */
  console.log("\n§一 往返（全库 " + PPL.length + " 人）");
  await go(pg, "#/relations", "#rel-canvas svg");
  const rt = await readRoundTrip(pg, PPL.map(p => p.id), [...PROTO], jz.id);
  const e1 = judgeRoundTrip(rt, jz.id);
  counts.rt = rt.ego.length;
  ok(!e1.length && rt.ego.length === PPL.length && rt.proto.length === PROTO.size,
    "全库 " + rt.ego.length + " 人之址往返（期值另路书之）＋一级 " + rt.proto.length + " 人之 `#/p/<id>/relations` 不变＋全景／不识之 ego／`#/p/<二级>/timeline` 三式不变", e1.slice(0, 3).join(" | "));

  /* ================= §二 直开 ================= */
  console.log("\n§二 直开");
  for (const p of [...SEC, protoSample]) {
    const px = await mkPage(1440, 900);
    await go(px, egoHash(p.id), "#rel-canvas svg"); await settle(px);
    const g = await readRel(px), e = judgeEgo(g, p.id, egoHash(p.id));
    ok(!e.length, "直开 " + egoHash(p.id) + "（" + p.name + (PROTO.has(p.id) ? "，一级" : "，二级") + "）即见其人", e.join(" | "));
    if (!e.length) counts.open++;
    if (p === female) await px.screenshot({ path: path.join(shotDir, "r61v_direct_" + p.id + ".png") });
    await px.context().close();
  }
  {
    await go(pg, "#/relations?ego=P__NO_SUCH__", "#rel-canvas svg"); await settle(pg);
    const e = judgePano(await readRel(pg));
    ok(!e.length, "直开不识之 ego → 落全景，址就地改为 #/relations", e.join(" | "));
    if (!e.length) counts.open++;
    await go(pg, "#/p/" + protoSample.id + "/relations", "#rel-canvas svg"); await settle(pg);
    const g = await readRel(pg), e2 = judgeEgo(g, protoSample.id, "#/p/" + protoSample.id + "/relations");
    ok(!e2.length && g.person === protoSample.id, "直开 #/p/" + protoSample.id + "/relations（一级之路由）照旧", e2.join(" | "));
    if (!e2.length) counts.open++;
    await go(pg, "#/p/" + jz.id + "/timeline", null); await settle(pg);
    const j = await pg.evaluate(() => ({ hash: location.hash, view: state.view, home: !document.querySelector("#view-home").hidden }));
    ok(j.hash === "#/p/" + jz.id + "/timeline" && j.view === "home" && j.home, "直开 #/p/" + jz.id + "/timeline（二级）照旧静默落首页、址不变（第 4 项不取，不动）", JSON.stringify(j));
  }

  /* ================= §三 后退 ================= */
  console.log("\n§三 后退");
  // ① 资料库点二级 → 其址 → 点「所系之事」→ 编年 → 后退回其人
  for (const p of SEC) {
    await go(pg, "#/library/people", "#lib-list li");
    await pg.click('#lib-list button.lib-person[data-lib-id="' + p.id + '"]');
    const landed = await waitHash(pg, egoHash(p.id));
    await pg.waitForSelector("#rel-panel .rel-evts").catch(() => {});
    const g0 = await readRel(pg), e0 = judgeEgo(g0, p.id, egoHash(p.id));
    ok(landed && !e0.length, "资料库点「" + p.name + "」→ " + egoHash(p.id), e0.join(" | "));
    const eid = await pg.evaluate(() => { const b = document.querySelector("#rel-panel .rel-evt"); return b ? b.dataset.eid : null; });
    await pg.click('#rel-panel .rel-evt[data-eid="' + eid + '"]');
    await waitHash(pg, "#/chronicle");
    await pg.goBack(); await waitHash(pg, egoHash(p.id)); await settle(pg);
    const g = await readRel(pg), e = judgeEgo(g, p.id, egoHash(p.id));
    ok(!e.length, "自编年（" + eid + "）后退 → 回「" + p.name + "」之关系页", e.join(" | "));
    if (!e.length) counts.back++;
    if (p === withBuzai) await pg.screenshot({ path: path.join(shotDir, "r61v_back_" + p.id + ".png") });
  }
  // ② 编年人签（二级）→ 其址 → 后退回编年
  {
    const p = most, eid = rowsOf(p.id).map(l => l.event_id).sort()[0];
    await go(pg, "#/chronicle", '#chron-list details[data-eid="' + eid + '"]');
    await pg.evaluate((id) => { const d = document.querySelector('#chron-list details[data-eid="' + id + '"]'); d.open = true; chronEnsureBody(d); }, eid);
    await pg.click('#chron-list details[data-eid="' + eid + '"] .evt-person[data-pid="' + p.id + '"]');
    const landed = await waitHash(pg, egoHash(p.id)); await settle(pg);
    const e0 = judgeEgo(await readRel(pg), p.id, egoHash(p.id));
    ok(landed && !e0.length, "编年 " + eid + " 之人签「" + p.name + "」→ " + egoHash(p.id), e0.join(" | "));
    await pg.goBack(); const b = await waitHash(pg, "#/chronicle");
    ok(b, "自其关系页后退 → 回 #/chronicle");
    if (b) counts.back++;
  }
  // ③ 页内游走：点邻人 → 记址；后退回前一人；前进复至；游走所至之人点事 → 编年 → 后退回游走所至之人
  {
    const p = female, y = neighbors(p.id)[0];
    await go(pg, egoHash(p.id), "#rel-canvas svg"); await settle(pg);
    selfcheck(await clickNode(pg, y), "邻人节点在图（" + PP.get(y).name + "）");
    await settle(pg);
    const g1 = await readRel(pg), e1x = judgeEgo(g1, y, egoHash(y));
    ok(!e1x.length && g1.stack.join() === p.id, "游走「" + p.name + "」→「" + PP.get(y).name + "」记址 " + egoHash(y) + "，面包屑承前", e1x.join(" | ") + " stack=" + g1.stack.join());
    await pg.goBack(); await waitHash(pg, egoHash(p.id)); await settle(pg);
    const e2x = judgeEgo(await readRel(pg), p.id, egoHash(p.id));
    ok(!e2x.length, "后退 → 回「" + p.name + "」", e2x.join(" | "));
    if (!e2x.length) counts.back++;
    await pg.goForward(); await waitHash(pg, egoHash(y)); await settle(pg);
    const e3x = judgeEgo(await readRel(pg), y, egoHash(y));
    ok(!e3x.length, "前进 → 复至「" + PP.get(y).name + "」", e3x.join(" | "));
    const evOfY = await pg.evaluate(() => { const b = document.querySelector("#rel-panel .rel-evt"); return b ? b.dataset.eid : null; });
    if (evOfY) {
      await pg.click('#rel-panel .rel-evt[data-eid="' + evOfY + '"]'); await waitHash(pg, "#/chronicle");
      await pg.goBack(); await waitHash(pg, egoHash(y)); await settle(pg);
      const e4x = judgeEgo(await readRel(pg), y, egoHash(y));
      ok(!e4x.length, "游走所至之「" + PP.get(y).name + "」点事（" + evOfY + "）落编年 → 后退回其人", e4x.join(" | "));
      if (!e4x.length) counts.back++;
    } else ok(PROTO.has(y), "游走所至之一级「" + PP.get(y).name + "」不列事（N 之体例），此验略之");
  }
  // ④ 一级之路由内游走 → 后退回一级之路由
  {
    const p = protoSample, y = neighbors(p.id)[0];
    await go(pg, "#/p/" + p.id + "/relations", "#rel-canvas svg"); await settle(pg);
    await clickNode(pg, y); await settle(pg);
    const e1x = judgeEgo(await readRel(pg), y, egoHash(y));
    ok(!e1x.length, "自 #/p/" + p.id + "/relations 游走至「" + PP.get(y).name + "」→ " + egoHash(y), e1x.join(" | "));
    await pg.goBack(); await waitHash(pg, "#/p/" + p.id + "/relations"); await settle(pg);
    const g = await readRel(pg), e = judgeEgo(g, p.id, "#/p/" + p.id + "/relations");
    ok(!e.length && g.person === p.id, "后退 → 回 #/p/" + p.id + "/relations（一级之路由）", e.join(" | "));
    if (!e.length) counts.back++;
  }
  // ⑤ 全景 ⇄ 以人为中心
  {
    await go(pg, "#/relations", "#rel-canvas svg"); await settle(pg);
    await pg.click("#btn-rel-mode"); await settle(pg);
    const g1 = await readRel(pg);
    const e1x = g1.center ? judgeEgo(g1, g1.center, egoHash(g1.center)) : ["无中心"];
    ok(!e1x.length, "全景点「以人为中心」→ 记其中心之址（" + g1.hash + "）", e1x.join(" | "));
    await pg.click("#btn-rel-mode"); await settle(pg);
    const e2x = judgePano(await readRel(pg));
    ok(!e2x.length, "再点「全景」→ 址回 #/relations", e2x.join(" | "));
    await pg.goBack(); await waitHash(pg, egoHash(g1.center)); await settle(pg);
    const e3x = judgeEgo(await readRel(pg), g1.center, egoHash(g1.center));
    await pg.goBack(); await waitHash(pg, "#/relations"); await settle(pg);
    const e4x = judgePano(await readRel(pg));
    ok(!e3x.length && !e4x.length, "后退二次 → 复以人为中心、复全景", e3x.concat(e4x).join(" | "));
    if (!e3x.length && !e4x.length) counts.back++;
  }

  /* ================= §四 地图图例 ================= */
  console.log("\n§四 地图图例（「相关」「不在」恒列）");
  for (const [w, h, p] of [[1440, 900, protoAbs], [1440, 900, protoNoAbs], [375, 812, kongzi || protoAbs], [375, 812, protoNoAbs]]) {
    const px = await mkPage(w, h);
    await go(px, "#/p/" + p.id + "/map", "#map-canvas svg"); await settle(px);
    const g = await readLegend(px), e = judgeLegend(g);
    const nAbs = rowsOf(p.id).filter(l => l.presence === "不在").length;
    ok(!e.length, w + "px " + p.name + "（「不在」行 " + nAbs + "）之图例：「相关」「不在」俱在、空心、其语合分寸、不出框",
      e.join(" | ") || (g.rel.text + "／" + g.abs.text));
    if (w === 375) {
      // 裁二百三十 二4：窄屏二处之改须有门守之——二断，各自成条
      const m = await readNarrow(px);
      ok(m.frameSW <= m.frameCW && m.frameRight <= m.vw + 0.5 && m.docSW <= m.docCW,
        w + "px " + p.name + " 图框不出视口（#map-frame scrollWidth " + m.frameSW + " ≤ clientWidth " + m.frameCW + "；框右 " + Math.round(m.frameRight) + " ≤ 视口 " + m.vw + "；页 " + m.docSW + " ≤ " + m.docCW + "）");
      if (m.nogeoShown) ok(!m.overlap, w + "px " + p.name + " 「无地望」计数之盒与图例之盒不相交", JSON.stringify({ lg: m.lg, ng: m.ng }));
      else ok(true, w + "px " + p.name + " 无「无地望」计数（此图无无地望之事），相交之断于此图不适用");
      if (p === (kongzi || protoAbs)) selfcheck(m.nogeoShown, "375 宽相交之断至少一图有「无地望」计数（判据不空转）", p.name);
    }
    if (w === 1440 && p === protoAbs) await px.locator("#map-frame").screenshot({ path: path.join(shotDir, "r61v_legend_" + p.id + "_1440.png") });
    if (w === 375) await px.locator("#map-legend").screenshot({ path: path.join(shotDir, "r61v_legend_" + p.id + "_375.png") });
    await px.context().close();
  }

  /* ================= §五 按类反证 ================= */
  console.log("\n§五 按类反证：判据须当场红");
  {
    // ① buildHash 不记 ego
    await go(pg, "#/relations", "#rel-canvas svg");
    await pg.evaluate(() => { const orig = buildHash; window.buildHash = (a, b, c, d) => orig(a, b, c, d); });
    const r1 = judgeRoundTrip(await readRoundTrip(pg, SEC.map(p => p.id), [], null), null);
    selfcheck(r1.length > 0, "反证① buildHash 不记 ego → 往返之判当场红", r1[0] || "（未红）");
    // ② 游走不记址
    const p = female, y = neighbors(p.id)[0];
    await go(pg, egoHash(p.id), "#rel-canvas svg"); await settle(pg);
    await pg.evaluate(() => { window.relSyncHash = () => {}; });
    await clickNode(pg, y); await settle(pg);
    const evOfY = await pg.evaluate(() => { const b = document.querySelector("#rel-panel .rel-evt"); return b ? b.dataset.eid : null; });
    let r2;
    if (evOfY) {
      await pg.click('#rel-panel .rel-evt[data-eid="' + evOfY + '"]'); await waitHash(pg, "#/chronicle");
      await pg.goBack(); await pg.waitForTimeout(600);
      r2 = judgeEgo(await readRel(pg), y, egoHash(y));
    } else r2 = judgeEgo(await readRel(pg), y, egoHash(y));
    selfcheck(r2.length > 0, "反证② 游走不记址 → 后退之判当场红", r2[0] || "（未红）");
    // ③ parseHash 丢 ego
    await go(pg, "#/relations", "#rel-canvas svg");
    await pg.evaluate(() => { const orig = parseHash; window.parseHash = () => { const st = orig(); delete st.ego; return st; }; });
    await pg.evaluate((h) => { location.hash = h; }, egoHash(p.id)); await pg.waitForTimeout(600);
    const r3 = judgeEgo(await readRel(pg), p.id, egoHash(p.id));
    selfcheck(r3.length > 0, "反证③ parseHash 丢 ego → 直开之判当场红", r3[0] || "（未红）");
    // ④ goSearchPerson 换回旧式
    await go(pg, "#/library/people", "#lib-list li");
    await pg.evaluate(() => { window.goSearchPerson = (pid) => { if (isProto(pid) && PEOPLE[pid]) { setHash(pid, "timeline"); return; }
      pendingSpot = { view: "relations", type: "ego", pid }; setHash(null, "relations"); }; });
    await pg.click('#lib-list button.lib-person[data-lib-id="' + p.id + '"]'); await pg.waitForTimeout(600);
    const r4 = judgeEgo(await readRel(pg), p.id, egoHash(p.id));
    selfcheck(r4.length > 0, "反证④ goSearchPerson 换回旧式 → 资料库点入之判当场红", r4[0] || "（未红）");
    // ⑤⑥ 图例
    await go(pg, "#/p/" + protoNoAbs.id + "/map", "#map-canvas svg");
    await pg.evaluate(() => document.querySelector('#map-legend [data-presence="不在"]').remove());
    const r5 = judgeLegend(await readLegend(pg));
    selfcheck(r5.length > 0, "反证⑤ 无「不在」之图删其一行 → 恒在之判当场红", r5[0] || "（未红）");
    await go(pg, "#/p/" + protoNoAbs.id + "/map", "#map-canvas svg");
    await pg.evaluate(() => { document.querySelector('#map-legend [data-presence="相关"] .lg-gloss').textContent = "（史文明书其不在场）"; });
    const r6 = judgeLegend(await readLegend(pg));
    selfcheck(r6.length > 0, "反证⑥ 「相关」之释改作「不在场」→ 措辞之判当场红", r6[0] || "（未红）");
    // ⑦ 窄屏图例复其 max-content 宽（本件初稿之形，375 宽实测撑框出视口）→ 出框之判当场红
    const p7 = await mkPage(375, 812);
    await go(p7, "#/p/" + protoNoAbs.id + "/map", "#map-canvas svg");
    await p7.addStyleTag({ content: ".map-legend { width: max-content !important; }" }); await settle(p7);
    const r7 = judgeLegend(await readLegend(p7));
    selfcheck(r7.length > 0, "反证⑦ 375 宽图例复 max-content 宽 → 出框之判当场红", r7[0] || "（未红）");
    const r7b = judgeNarrow(await readNarrow(p7));
    selfcheck(r7b.some(x => /出视口/.test(x)), "反证⑦b 同一注入 → 「图框不出视口」之断当场红", r7b[0] || "（未红）");
    await p7.context().close();
    // ⑧ 窄屏「无地望」计数复其绝对定位（改前之形）→ 相压之判当场红（须择有无地望事件之一级，孔子今有）
    const p8 = await mkPage(375, 812);
    await go(p8, "#/p/" + (kongzi || protoAbs).id + "/map", "#map-canvas svg");
    await p8.addStyleTag({ content: ".map-nogeo { position: absolute !important; width: auto !important; }" }); await settle(p8);
    const g8 = await readLegend(p8), r8 = judgeLegend(g8);
    selfcheck(r8.some(x => /所压/.test(x)), "反证⑧ 375 宽「无地望」计数复绝对定位 → 相压之判当场红", r8.find(x => /所压/.test(x)) || "（未红）");
    const r8b = judgeNarrow(await readNarrow(p8));
    selfcheck(r8b.some(x => /相交/.test(x)), "反证⑧b 同一注入 → 「无地望与图例之盒不相交」之断当场红", r8b.find(x => /相交/.test(x)) || "（未红）");
    await p8.context().close();
  }

  selfcheck(errs.length === 0, "页面无抛错", errs.slice(0, 3).join(" | "));
  await browser.close(); s.close();
  console.log("\n三验之数：往返 " + counts.rt + " 人；直开 " + counts.open + " 式；后退 " + counts.back + " 程");
  console.log("合计断言 " + asserts + " 条，判红 " + fails + "；门自检出错 " + gateErrs);
  process.exit(gateErrs ? 2 : fails ? 1 : 0);
})().catch(e => { console.error("门自身出错：", e); process.exit(2); });
