/* 经纬春秋 · r62-W 可重跑之验：降者留页（介之推、齐僖公）
 * （任务书 team/round61_prompts.md「Task for Vision · r62-W」；所据 §一百十三 裁二百四十八 三）
 *
 * 用法（自 tools/qa/ 起跑，playwright 在此处 node_modules 内）：  node vision_r62w.js
 * 【退出码】 0 ＝ 全过；1 ＝ 有判红；2 ＝ 本门自身出错（浏览器取不到、前提不成、所求之集空、反证未红、页面抛错）。
 *
 * ★ 比值不比名：一级之集取 site/data/people.json 之 is_protagonist=1；留页之集取页内 RETAINED_PAGES（所验之物本身）；
 *   二级对照样本（不在留页单之二级）由数据另求。本门**不写死**介之推、齐僖公之 id——日后降人入单，本门自随之。
 *
 * 验：
 *  §一 名册三分（照裁二百四十八 三4）：
 *      一级：PROTAGONISTS 之 id 集 ＝ is_protagonist=1 之集（双向无差）；
 *      留页：单非空（底）、无重；每人在库、is_protagonist=0、其徽记文件（site/assets/icons/<badge>.svg）在、home 在其 state 链中；
 *      二者不交。
 *  §二 路由：留页每人 `#/p/<id>/timeline|map|relations` 解为其人其式；不在单之二级照旧落首页；
 *      `#compare=<留页>,<一级>` 不成并观（并观只一级）；一级之 `#/p/` 一字不变。
 *  §三 三式之页（1440、375 二宽）：子导航书其名、徽记即其留档之徽（逐 path 之 d 比对文件）、--theme ＝ 其国之国色；
 *      时间线：卡数＝其 event_people 之事数，次序照 (year_bce, sort_key, id)；
 *      地图：「视野」钮照 r62-L 之则（fit 点空者「视野：全图」且 disabled；有点者可切、文随 mode 变）；状态行之式合其亲至可落图之有无；
 *            「＋ 添加对照人物」藏（一级之图照旧在）；页无横溢；
 *      关系：ego 以其为中心。
 *  §四 首页不列：地图模式之徽记簇与列表模式之卡，俱无留页之人；簇与卡之人俱属一级。
 *  §五 入口（只及留页单中人）：资料库人物条下「时间线／地图」二链（址合、点之即至）；关系侧栏（内嵌右卡）同；
 *      全站搜索其名，出「· 时间线」「· 地图」二条（点之即至）；不在单之二级、一级，三处俱无此链。
 *  §六 反证（任一不红 → exit 2）：
 *      ① 混一一级入留页单 → §一 须红；② 混一不在库之 id 入留页单 → §一 须红；
 *      ③ parseHash 不认留页（pageMeta 换回只认 PROTAGONISTS）→ §二 须红；
 *      ④ 首页名册混入一留页之人（renderHome 前 push 入 PROTAGONISTS）→ §四 须红。
 *  截图：team/r62W_shots/（桌面、手机；二人三式、首页、资料库、关系侧栏、搜索）。
 */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { requireBrowser } = require("./require_browser.js");
const ROOT = path.resolve(__dirname, "..", ".."), SITE = path.join(ROOT, "site");
const J = (n) => JSON.parse(fs.readFileSync(path.join(SITE, "data", n + ".json"), "utf8"));

let fails = 0, gateErrs = 0, asserts = 0;
const ok = (c, l, d) => { asserts++; if (!c) fails++; console.log("  " + (c ? "✓" : "✗") + " " + l + (d ? "  —— " + d : "")); };
const selfcheck = (c, l, d) => { if (!c) gateErrs++; console.log("  " + (c ? "✓" : "⚠") + " 〔门自检〕" + l + (d ? "  —— " + d : "")); };

const PPL = J("people"), EP = J("event_people"), EV = J("events"), PLC = J("places");
const PP = new Map(PPL.map(p => [p.id, p]));
const EVM = new Map(EV.map(e => [e.id, e]));
const PLM = new Map(PLC.map(p => [p.id, p]));
const PROTO = new Set(PPL.filter(p => Number(p.is_protagonist) === 1).map(p => p.id));
/* 其人之事（以事去重，同 personEvents），次序 (year_bce, sort_key, id) */
const evtsOf = (pid) => {
  const m = new Map(); for (const l of EP) if (l.person_id === pid) m.set(l.event_id, l);
  return [...m.keys()].map(id => EVM.get(id)).filter(Boolean).sort((a, b) =>
    (a.year_bce - b.year_bce) || ((a.sort_key ?? 0) - (b.sort_key ?? 0)) || a.id.localeCompare(b.id));
};
const linkOf = (pid, eid) => EP.find(l => l.person_id === pid && l.event_id === eid);
const hasGeo = (e) => { const pl = e.place_id ? PLM.get(e.place_id) : null; return !!(pl && pl.lat != null && pl.lng != null); };
const badgeDs = (badge) => {
  const fp = path.join(SITE, "assets", "icons", badge + ".svg");
  if (!fs.existsSync(fp)) return null;
  return [...fs.readFileSync(fp, "utf8").matchAll(/\sd="([^"]+)"/g)].map(m => m[1].replace(/\s+/g, " ").trim());
};

/* ---------- §一 之判（正验与反证共用） ---------- */
function judgeRoster(uiIds, retained) {
  const errs = [];
  const ui = new Set(uiIds);
  const dataOnly = [...PROTO].filter(id => !ui.has(id)), uiOnly = uiIds.filter(id => !PROTO.has(id));
  if (dataOnly.length || uiOnly.length) errs.push("一级两侧有差：数据有而前端无〔" + dataOnly.join(",") + "〕；前端有而数据无〔" + uiOnly.join(",") + "〕");
  if (!retained.length) errs.push("留页单空");
  const seen = new Set();
  for (const r of retained) {
    if (seen.has(r.id)) errs.push("留页单重出 " + r.id); seen.add(r.id);
    const p = PP.get(r.id);
    if (!p) { errs.push("留页 " + r.id + " 不在库"); continue; }
    if (Number(p.is_protagonist) !== 0) errs.push("留页 " + r.id + " 之 is_protagonist=" + p.is_protagonist + "（须 0）");
    if (ui.has(r.id)) errs.push("留页 " + r.id + " 与一级相交");
    if (!r.badge || !fs.existsSync(path.join(SITE, "assets", "icons", r.badge + ".svg"))) errs.push("留页 " + r.id + " 之徽记文件缺：" + r.badge);
    if (!r.home || !(p.state || "").split("/").includes(r.home)) errs.push("留页 " + r.id + " 之 home「" + r.home + "」不在其 state「" + p.state + "」");
  }
  return errs;
}
/* §二 之量与判 */
async function readRoutes(pg, ids, secIds, protoIds) {
  return pg.evaluate(({ ids, secIds, protoIds }) => {
    const keep = location.hash, out = { ret: [], sec: [], proto: [], cmp: [] };
    const rd = (h) => { history.replaceState(null, "", h); const st = parseHash(); return { h, view: st.view, person: st.person }; };
    for (const id of ids) for (const v of ["timeline", "map", "relations"]) out.ret.push({ id, v, ...rd("#/p/" + id + "/" + v) });
    for (const id of secIds) out.sec.push({ id, ...rd("#/p/" + id + "/timeline") });
    for (const id of protoIds) out.proto.push({ id, ...rd("#/p/" + id + "/map") });
    for (const id of ids) { history.replaceState(null, "", "#compare=" + id + "," + protoIds[0]); const st = parseHash(); out.cmp.push({ id, view: st.view }); }
    history.replaceState(null, "", keep);
    return out;
  }, { ids, secIds, protoIds });
}
function judgeRoutes(got) {
  const errs = [];
  for (const r of got.ret) if (r.view !== r.v || r.person !== r.id) errs.push("留页 " + r.h + " 解得 " + JSON.stringify({ view: r.view, person: r.person }));
  for (const r of got.sec) if (r.view !== "home" || r.person) errs.push("不在单之二级 " + r.h + " 竟解得 " + JSON.stringify(r));
  for (const r of got.proto) if (r.view !== "map" || r.person !== r.id) errs.push("一级 " + r.h + " 之路由有变");
  for (const r of got.cmp) if (r.view === "compare") errs.push("留页 " + r.id + " 竟入并观");
  return errs;
}
/* §四 之量与判 */
async function readHome(pg) {
  return pg.evaluate(() => ({
    groups: [...homeGroups.values()].flat().map(m => m.id),
    cluster: [...document.querySelectorAll("#home-map .home-cluster circle title")].map(t => t.textContent),
    cards: [...document.querySelectorAll("#person-groups .person-card h3")].map(h => h.firstChild ? h.firstChild.textContent : ""),
  }));
}
function judgeHome(got, retIds) {
  const errs = [];
  const retNames = new Set(retIds.map(id => PP.get(id).name));
  const protoNames = new Set([...PROTO].map(id => PP.get(id).name));
  const g = got.groups.filter(id => retIds.includes(id) || !PROTO.has(id));
  if (g.length) errs.push("首页分组含非一级：" + g.join(","));
  const c = got.cluster.filter(n => retNames.has(n) || !protoNames.has(n));
  if (c.length) errs.push("首页地图之簇含非一级之徽：" + c.join("、"));
  const k = got.cards.filter(n => retNames.has(n) || !protoNames.has(n));
  if (k.length) errs.push("首页列表含非一级之卡：" + k.join("、"));
  if (!got.cards.length || !got.cluster.length) errs.push("首页之簇或卡为空（判据空转）");
  return errs;
}

function srv() {
  const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png" };
  return new Promise((res, rej) => {
    const s = http.createServer((rq, rs) => {
      let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]); if (u === "/") u = "/index.html";
      const fp = path.join(SITE, u); if (!fp.startsWith(SITE)) { rs.writeHead(403); rs.end(); return; }
      fs.readFile(fp, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(u)] || "application/octet-stream" }); rs.end(d); });
    });
    s.on("error", rej); s.listen(0, "127.0.0.1", () => res(s));
  });
}

(async () => {
  console.log("vision_r62w · 降者留页");
  const { browser, executablePath, browserVersion } = await requireBrowser();
  console.log("  浏览器：" + executablePath + "  " + browserVersion);
  const s = await srv(); const base = "http://127.0.0.1:" + s.address().port + "/";
  const errs = [];
  const mkPage = async (w, h) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", JSON.stringify({ v: 1, step: -1, done: true })); } catch (e) { /* 无妨 */ } });
    const pg = await ctx.newPage(); pg.on("pageerror", e => errs.push(String(e))); return pg;
  };
  const go = async (p, h, sel) => { await p.goto("about:blank"); await p.goto(base + h, { waitUntil: "networkidle" }); if (sel) await p.waitForSelector(sel, { state: "attached" }); await p.waitForTimeout(250); };
  const shotDir = path.join(ROOT, "team", "r62W_shots");
  try { fs.mkdirSync(shotDir, { recursive: true }); } catch { /* 无妨 */ }
  const shot = (p, n) => p.screenshot({ path: path.join(shotDir, n + ".png"), fullPage: false });

  const pg = await mkPage(1440, 900);
  await go(pg, "#/", "#person-groups .person-card");
  const reg = await pg.evaluate(() => ({ ui: PROTAGONISTS.map(m => m.id),
    ret: RETAINED_PAGES.map(m => ({ id: m.id, badge: m.badge, home: m.home })) }));
  const RET = reg.ret.map(r => r.id);
  /* 二级对照：不在留页单、有事之二级，id 序首个；一级对照：id 序首个有可落图之亲至者 */
  const sec = PPL.filter(p => !PROTO.has(p.id) && !RET.includes(p.id) && evtsOf(p.id).length).sort((a, b) => a.id.localeCompare(b.id));
  const protoGeo = [...PROTO].sort().find(id => evtsOf(id).some(e => hasGeo(e) && (linkOf(id, e.id).presence || "亲至") === "亲至"));
  selfcheck(RET.length > 0, "留页单非空（底）", RET.join("、"));
  selfcheck(sec.length > 0 && !!protoGeo, "对照样本可求（不在单之二级、有地之一级）", (sec[0] || {}).id + "／" + protoGeo);
  if (gateErrs) { console.log("门自身出错（前提不成）"); await browser.close(); s.close(); process.exit(2); }

  /* ================= §一 ================= */
  console.log("\n§一 名册三分（一级 " + PROTO.size + "／留页 " + RET.length + "／余 " + (PPL.length - PROTO.size - RET.length) + "）");
  const e1 = judgeRoster(reg.ui, reg.ret);
  ok(!e1.length, "一级＝is_protagonist=1（双向无差）；留页每人在库、is_protagonist=0、徽记文件在、home 合其 state；二者不交", e1.join(" | "));
  ok(PROTO.size + RET.length + (PPL.length - PROTO.size - RET.length) === PPL.length && RET.every(id => PP.has(id)), "三分之和＝全库 " + PPL.length + " 人");

  /* ================= §二 ================= */
  console.log("\n§二 路由");
  const rt = await readRoutes(pg, RET, sec.slice(0, 3).map(p => p.id), [protoGeo]);
  const e2 = judgeRoutes(rt);
  ok(!e2.length, "留页 " + RET.length + " 人三式解对；不在单之二级 " + rt.sec.length + " 人照旧落首页；一级不变；留页不入并观", e2.slice(0, 3).join(" | "));

  /* ================= §三 三式之页 ================= */
  for (const [w, h] of [[1440, 900], [375, 812]]) {
    console.log("\n§三 三式之页（" + w + "px）");
    const p = w === 1440 ? pg : await mkPage(w, h);
    for (const r of reg.ret) {
      const nm = PP.get(r.id).name, want = evtsOf(r.id), wantD = badgeDs(r.badge);
      // 时间线
      await go(p, "#/p/" + r.id + "/timeline", "#timeline-list li");
      await p.waitForFunction(() => document.querySelector("#pn-badge svg"), null, { timeout: 4000 }).catch(() => {});
      const tl = await p.evaluate(({ home }) => ({
        view: state.view, person: state.person, navShown: !document.querySelector("#person-nav").hidden,
        name: document.querySelector("#pn-name").textContent,
        ds: [...document.querySelectorAll("#pn-badge svg [d]")].map(e => e.getAttribute("d").replace(/\s+/g, " ").trim()),
        theme: getComputedStyle(document.documentElement).getPropertyValue("--theme").trim(),
        stateColor: getComputedStyle(document.documentElement).getPropertyValue(STATE_FAMILY_VAR[home]).trim(),
        eids: [...document.querySelectorAll("#timeline-list details[data-eid]")].map(d => d.dataset.eid),
        sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      }), { home: r.home });
      ok(tl.view === "timeline" && tl.person === r.id && tl.navShown && tl.name === nm, w + "px 「" + nm + "」时间线可至，子导航书其名", JSON.stringify({ v: tl.view, p: tl.person, n: tl.name }));
      ok(!!wantD && wantD.length > 0 && JSON.stringify(tl.ds) === JSON.stringify(wantD), w + "px 「" + nm + "」子导航之徽＝留档之徽 " + r.badge + "（" + (wantD || []).length + " 段 path 逐段同）");
      ok(!!tl.theme && tl.theme.toLowerCase() === tl.stateColor.toLowerCase(), w + "px 「" + nm + "」--theme ＝ 其国（" + r.home + "）之国色", tl.theme + "／" + tl.stateColor);
      ok(JSON.stringify(tl.eids) === JSON.stringify(want.map(e => e.id)), w + "px 「" + nm + "」时间线卡 " + tl.eids.length + " 张＝其事 " + want.length + "，次序照 (year_bce, sort_key, id)", tl.eids.join(","));
      ok(tl.sw <= tl.cw, w + "px 「" + nm + "」时间线页无横溢", tl.sw + "／" + tl.cw);
      await shot(p, "r62w_" + r.id + "_timeline_" + w);
      // 地图
      await go(p, "#/p/" + r.id + "/map", "#map-canvas svg");
      const fitEmpty = !want.some(hasGeo);
      const anyPresentGeo = want.some(e => hasGeo(e) && (linkOf(r.id, e.id).presence || "亲至") === "亲至");
      const mp = await p.evaluate(() => { const b = document.querySelector("#btn-scope"); const wrap = document.querySelector("#btn-compare").closest(".cmp-pick-wrap");
        return { view: state.view, person: state.person, txt: b.textContent, dis: b.disabled, title: b.getAttribute("title"), status: document.querySelector("#map-status").textContent,
          cmpHidden: !!wrap.hidden && getComputedStyle(wrap).display === "none", theme: getComputedStyle(document.documentElement).getPropertyValue("--theme").trim(),
          sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }; });
      ok(mp.view === "map" && mp.person === r.id, w + "px 「" + nm + "」地图可至");
      if (fitEmpty) {
        ok(mp.txt === "视野：全图" && mp.dis && mp.title === "无可落图之地，只示全图", w + "px 「" + nm + "」fit 点空：钮书「视野：全图」、disabled（r62-L）", JSON.stringify(mp));
      } else {
        const a = mp.txt;
        await p.click("#btn-scope");
        const b2 = await p.evaluate(() => document.querySelector("#btn-scope").textContent);
        await p.click("#btn-scope");
        const c3 = await p.evaluate(() => document.querySelector("#btn-scope").textContent);
        ok(!mp.dis && mp.title === null && a === "视野：活动范围" && b2 === "视野：全图" && c3 === "视野：活动范围", w + "px 「" + nm + "」有地：视野钮可切、文随 mode 变（r62-L）", [a, b2, c3].join("→"));
      }
      ok(anyPresentGeo ? /^亲至/.test(mp.status) : /^该人物暂无可落图的亲至地点/.test(mp.status), w + "px 「" + nm + "」状态行之式合其亲至可落图之" + (anyPresentGeo ? "有" : "无"), mp.status.slice(0, 40));
      ok(mp.cmpHidden, w + "px 「" + nm + "」地图页无「＋ 添加对照人物」（并观不及）");
      ok(mp.sw <= mp.cw, w + "px 「" + nm + "」地图页无横溢", mp.sw + "／" + mp.cw);
      await shot(p, "r62w_" + r.id + "_map_" + w);
      // 关系
      await go(p, "#/p/" + r.id + "/relations", "#rel-panel");
      const rl = await p.evaluate(() => ({ view: state.view, mode: relView.mode, center: relView.center, hash: location.hash,
        sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      ok(rl.view === "relations" && rl.mode === "ego" && rl.center === r.id && rl.hash === "#/p/" + r.id + "/relations", w + "px 「" + nm + "」关系页以其为中心、址不变", JSON.stringify(rl));
      ok(rl.sw <= rl.cw, w + "px 「" + nm + "」关系页无横溢", rl.sw + "／" + rl.cw);
      await shot(p, "r62w_" + r.id + "_relations_" + w);
    }
    // 一级之图：并观之钮照旧在
    await go(p, "#/p/" + protoGeo + "/map", "#map-canvas svg");
    const pv = await p.evaluate(() => { const wrap = document.querySelector("#btn-compare").closest(".cmp-pick-wrap"); return !wrap.hidden && getComputedStyle(wrap).display !== "none"; });
    ok(pv, w + "px 一级「" + PP.get(protoGeo).name + "」之图「＋ 添加对照人物」照旧在");

    /* ================= §四 首页 ================= */
    console.log("\n§四 首页不列（" + w + "px）");
    await go(p, "#/", "#person-groups .person-card");
    await p.waitForSelector("#home-map .home-cluster circle", { state: "attached", timeout: 4000 }).catch(() => {});
    const hm = await readHome(p);
    const e4 = judgeHome(hm, RET);
    ok(!e4.length, w + "px 首页地图之簇（" + hm.cluster.length + " 枚）与列表之卡（" + hm.cards.length + " 张）俱无留页之人、俱属一级", e4.join(" | "));
    await shot(p, "r62w_home_map_" + w);
    await go(p, "#/?home=list", "#person-groups .person-card");
    const hl = await readHome(p);
    const e4b = judgeHome({ ...hl, cluster: hm.cluster }, RET);
    ok(!e4b.length, w + "px 首页列表模式之卡俱无留页之人", e4b.join(" | "));

    /* ================= §五 入口 ================= */
    console.log("\n§五 入口（" + w + "px）");
    await go(p, "#/library/people", "#lib-list button.lib-person");
    const lib = await p.evaluate(() => [...document.querySelectorAll("#lib-list li")].map(li => {
      const b = li.querySelector("button.lib-person"); return b ? { id: b.dataset.libId,
        links: [...li.querySelectorAll(".lib-page-links a")].map(a => ({ v: a.dataset.pview, href: a.getAttribute("href"), t: a.textContent })) } : null; }).filter(Boolean));
    const libBad = lib.filter(x => RET.includes(x.id)
      ? JSON.stringify(x.links) !== JSON.stringify([{ v: "timeline", href: "#/p/" + x.id + "/timeline", t: "时间线" }, { v: "map", href: "#/p/" + x.id + "/map", t: "地图" }])
      : x.links.length > 0);
    ok(lib.length === PPL.length && !libBad.length, w + "px 资料库人物条：留页 " + RET.length + " 人有「时间线／地图」二链、址合；余 " + (lib.length - RET.length) + " 人无", libBad.slice(0, 3).map(x => x.id + ":" + JSON.stringify(x.links)).join(" | "));
    for (const r of reg.ret) {
      for (const v of ["timeline", "map"]) {
        await go(p, "#/library/people", "#lib-list button.lib-person");
        const a = await p.$('#lib-list button.lib-person[data-lib-id="' + r.id + '"]');
        await a.scrollIntoViewIfNeeded();
        await p.click('.lib-page-links[data-pid="' + r.id + '"] a[data-pview="' + v + '"]');
        await p.waitForFunction((h) => location.hash === h && state.view !== "library", "#/p/" + r.id + "/" + v, { timeout: 4000 }).catch(() => {});
        const st = await p.evaluate(() => ({ view: state.view, person: state.person }));
        ok(st.view === v && st.person === r.id, w + "px 资料库点「" + PP.get(r.id).name + "」之「" + (v === "map" ? "地图" : "时间线") + "」→ 至其页", JSON.stringify(st));
      }
      if (w === 1440 || r === reg.ret[0]) {
        await go(p, "#/library/people", "#lib-list button.lib-person");
        await (await p.$('#lib-list button.lib-person[data-lib-id="' + r.id + '"]')).scrollIntoViewIfNeeded();
        await shot(p, "r62w_library_" + r.id + "_" + w);
      }
    }
    // 关系侧栏
    const sideOf = async (pid) => { await go(p, "#/relations?ego=" + encodeURIComponent(pid), "#rel-panel h3");
      return p.evaluate(() => [...document.querySelectorAll("#rel-panel .rel-page-links a")].map(a => ({ v: a.dataset.pview, href: a.getAttribute("href") }))); };
    for (const r of reg.ret) {
      const L = await sideOf(r.id);
      ok(JSON.stringify(L) === JSON.stringify([{ v: "timeline", href: "#/p/" + r.id + "/timeline" }, { v: "map", href: "#/p/" + r.id + "/map" }]), w + "px 关系侧栏（以「" + PP.get(r.id).name + "」为中心）有「时间线／地图」二链", JSON.stringify(L));
      await (await p.$("#rel-panel")).screenshot({ path: path.join(shotDir, "r62w_relpanel_" + r.id + "_" + w + ".png") });   // 取侧栏之元素截图（窄屏侧栏在图下）
      await p.click('#rel-panel .rel-page-links a[data-pview="map"]');
      await p.waitForFunction((h) => location.hash === h, "#/p/" + r.id + "/map", { timeout: 4000 }).catch(() => {});
      await p.waitForTimeout(200);
      const st = await p.evaluate(() => ({ view: state.view, person: state.person }));
      ok(st.view === "map" && st.person === r.id, w + "px 关系侧栏点「地图」→ 至其页", JSON.stringify(st));
    }
    const Ls = await sideOf(sec[0].id), Lp = await sideOf(protoGeo);
    ok(Ls.length === 0 && Lp.length === 0, w + "px 关系侧栏：不在单之二级「" + sec[0].name + "」、一级「" + PP.get(protoGeo).name + "」俱无留页之链");
    // 搜索
    for (const r of reg.ret) {
      await go(p, "#/", "#person-groups .person-card");
      if (await p.isHidden("#global-search")) await p.click("#search-toggle");
      await p.fill("#global-search", PP.get(r.id).name);
      await p.waitForSelector("#search-pop .search-opt", { state: "attached", timeout: 4000 }).catch(() => {});
      await p.waitForTimeout(300);
      const opts = await p.evaluate((pid) => [...document.querySelectorAll('#search-pop .search-opt[data-pid="' + pid + '"]')].map(b => b.dataset.pview), r.id);
      ok(JSON.stringify(opts) === JSON.stringify(["timeline", "map"]), w + "px 搜「" + PP.get(r.id).name + "」出「· 时间线」「· 地图」二条", JSON.stringify(opts));
      await shot(p, "r62w_search_" + r.id + "_" + w);
      await p.click('#search-pop .search-opt[data-pid="' + r.id + '"][data-pview="timeline"]');
      await p.waitForFunction((h) => location.hash === h, "#/p/" + r.id + "/timeline", { timeout: 4000 }).catch(() => {});
      await p.waitForTimeout(200);
      const st = await p.evaluate(() => ({ view: state.view, person: state.person }));
      ok(st.view === "timeline" && st.person === r.id, w + "px 搜索点「· 时间线」→ 至其页", JSON.stringify(st));
    }
    {
      await go(p, "#/", "#person-groups .person-card");
      if (await p.isHidden("#global-search")) await p.click("#search-toggle");
      await p.fill("#global-search", sec[0].name);
      await p.waitForSelector("#search-pop .search-opt", { state: "attached", timeout: 4000 }).catch(() => {});
      await p.waitForTimeout(300);
      const n = await p.evaluate(() => document.querySelectorAll("#search-pop .search-opt[data-pview]").length);
      const retHit = RET.filter(id => PP.get(id).name.includes(sec[0].name) || sec[0].name.includes(PP.get(id).name));
      ok(n === 0 || retHit.length > 0, w + "px 搜不在单之二级「" + sec[0].name + "」，无留页之条", String(n));
    }
    if (p !== pg) await p.context().close();
  }

  /* ================= §六 反证 ================= */
  console.log("\n§六 反证（任一不红 → exit 2）");
  const anti = (red, label) => { if (red) console.log("  ✓ 【反证·如期而红】" + label); else { gateErrs++; console.log("  ⚠ 【反证·★ 不红：门自身出错】" + label); } };
  {
    const protoId = reg.ui.find(id => PROTO.has(id));
    const r1 = judgeRoster(reg.ui, [...reg.ret, { id: protoId, badge: (await pg.evaluate((id) => PROTAGONISTS.find(m => m.id === id).badge, protoId)), home: PP.get(protoId).state.split("/")[0] }]);
    anti(r1.some(x => x.includes(protoId)), "① 混一一级（" + protoId + "）入留页单 → §一 红：" + r1.filter(x => x.includes(protoId)).join("；"));
    // 页内实注：push 入 RETAINED_PAGES 后重读
    await go(pg, "#/", "#person-groups .person-card");
    const live = await pg.evaluate((pid) => { RETAINED_PAGES.push({ id: pid, color: "", badge: "badge_x", fallback: "x", home: "x" });
      return RETAINED_PAGES.map(m => ({ id: m.id, badge: m.badge, home: m.home })); }, "P__NO_SUCH__");
    const r2 = judgeRoster(reg.ui, live);
    anti(r2.some(x => x.includes("P__NO_SUCH__") && x.includes("不在库")), "② 页内混一不在库之 id（P__NO_SUCH__）入留页单 → §一 红：" + r2.filter(x => x.includes("P__NO_SUCH__")).join("；"));
  }
  {
    await go(pg, "#/", "#person-groups .person-card");
    await pg.evaluate(() => { pageMeta = (id) => PROTAGONISTS.find(m => m.id === id) || null; });   // eslint-disable-line no-global-assign
    const r3 = judgeRoutes(await readRoutes(pg, RET, [sec[0].id], [protoGeo]));
    anti(r3.some(x => x.startsWith("留页 #/p/")), "③ parseHash 不认留页 → §二 红：" + r3.slice(0, 2).join("；"));
  }
  {
    await go(pg, "#/", "#person-groups .person-card");
    await pg.evaluate(() => { PROTAGONISTS.push(RETAINED_PAGES[0]); renderHome(); });
    await pg.waitForTimeout(400);
    const r4 = judgeHome(await readHome(pg), RET);
    anti(r4.length > 0, "④ 首页名册混入留页之人 → §四 红：" + r4.slice(0, 2).join("；"));
  }

  await browser.close(); s.close();
  console.log("\n页面抛错：" + errs.length + (errs.length ? "  " + errs.slice(0, 3).join(" | ") : ""));
  if (errs.length) gateErrs++;
  console.log("\n结：断言 " + asserts + "，未过 " + fails + "；门自身出错 " + gateErrs);
  process.exit(gateErrs ? 2 : (fails ? 1 : 0));
})().catch(e => { console.error("门自身出错：", e); process.exit(2); });
