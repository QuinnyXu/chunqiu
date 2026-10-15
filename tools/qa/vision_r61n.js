/* 经纬春秋 · r61-N 可重跑之验：二级之展示——资料库「人物」签、关系页抽屉「所系之事」
 * （任务书 team/round61_prompts.md「Task for Vision · r61-N」；所据 §十二 裁二百二十二 ①、§八）
 *
 * 用法（自 tools/qa/ 起跑，playwright 在此处 node_modules 内）：  node vision_r61n.js
 * 【退出码】
 *   0 ＝ 全过；
 *   1 ＝ 有判红（某条断言未过）；
 *   2 ＝ 本门自身出错（浏览器取不到、前提不成、反证未红即判据空转、页面抛错）。
 *
 * 验四事（期值一律自 site/data/*.json 独立复算，不读 app.js 之索引与函数）：
 *  §一 资料库「人物」签：行数＝people 总数；行之 id 集＝people id 集；「一级」之标恰落 is_protagonist=1 者；
 *      每行所书事数＝其 event_people 行数；以国名检（「晋」）之所余＝独立复算之集；1440／375 二宽俱无横溢。
 *      点入：一级 → `#/p/<id>/timeline`；二级 → `#/relations?ego=<id>` 且其 ego 以其人为中心
 *      （r61-V 校基线：原期 `#/relations`，二级之关系页今带其人之址）。
 *  §二 关系页抽屉「所系之事」：取三位二级（★ 名册外择：赵盾今已一级，故样本自不含之；其一为女性
 *      赵庄姬；其一含 presence「不在」之行；其一为二级中挂链最多者）——内嵌右卡与全屏抽屉二处，
 *      事数＝其 event_people 行数、次序＝(year_bce, sort_key, id)、年与题逐条对读、presence 之签逐条对读；
 *      「相关」之签其文与提示俱不含「不在」二字（守 §6／§7：相关＝史文无其在场明文，非史文书其不在）；
 *      点一事 → `#/chronicle` 且该卡展开。一级之人：抽屉示其事数并指其时间线，不列（其由见 design_notes §6.12）。
 *  §三 hash 往返：`#/library/people`、带检索词者、旧式 `#view=library&tab=people`、点签所写之 hash。
 *  §四 按类反证（design_notes §7.2、§7.10）：于页内删某二级一行挂链、重渲，本门之事数判据须当场报其差；
 *      于页内把某「相关」行之签文改作「不在场」，措辞判据须当场报之。反证不红 → exit 2。
 */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { requireBrowser } = require("./require_browser.js");
const ROOT = path.resolve(__dirname, "..", ".."), SITE = path.join(ROOT, "site");
const J = (n) => JSON.parse(fs.readFileSync(path.join(SITE, "data", n + ".json"), "utf8"));

let fails = 0, gateErrs = 0, asserts = 0;
const ok = (c, l, d) => { asserts++; if (!c) fails++; console.log("  " + (c ? "✓" : "✗") + " " + l + (d ? "  —— " + d : "")); };
const selfcheck = (c, l, d) => { if (!c) gateErrs++; console.log("  " + (c ? "✓" : "⚠") + " 〔门自检〕" + l + (d ? "  —— " + d : "")); };

const PPL = J("people"), EP = J("event_people"), EVS = J("events");
const EV = new Map(EVS.map(e => [e.id, e]));
const PROTO = new Set(PPL.filter(p => Number(p.is_protagonist) === 1).map(p => p.id));
const rowsOf = (pid) => EP.filter(l => l.person_id === pid);
const evCmp = (a, b) => (a.year_bce - b.year_bce) || ((a.sort_key ?? 9999) - (b.sort_key ?? 9999)) || a.id.localeCompare(b.id);
const yl = (y) => (y == null ? "—" : "前" + (-y));
/* 期值：某人抽屉之事列（独立复算；presence 空视同亲至，conventions §6） */
const expectEvts = (pid) => rowsOf(pid).map(l => ({ ...EV.get(l.event_id), presence: l.presence || "亲至" })).sort(evCmp)
  .map(e => ({ eid: e.id, year: yl(e.year_bce), title: e.title, presence: e.presence }));
/* 以检索词筛人物签之期值：名、别名、国、身份四栏（与页上所书之检索面同） */
const expectFilter = (q) => new Set(PPL.filter(p => [p.name, p.alt_names, p.state, p.role].filter(Boolean).join(" ").toLowerCase().includes(q)).map(p => p.id));

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

/* 抽屉事列之判：返回差异之列（空＝合）。§二 正验与 §四 反证共用此一函数——反证所验者即此函数之能。 */
function judgeEvts(got, want) {
  const errs = [];
  if (got.length !== want.length) errs.push("事数 " + got.length + "，应 " + want.length);
  const n = Math.min(got.length, want.length);
  for (let i = 0; i < n; i++) {
    const g = got[i], w = want[i];
    if (g.eid !== w.eid) { errs.push("第 " + (i + 1) + " 条为 " + g.eid + "，应 " + w.eid); continue; }
    if (g.year !== w.year) errs.push(w.eid + " 年「" + g.year + "」应「" + w.year + "」");
    if (g.title !== w.title) errs.push(w.eid + " 题「" + g.title + "」应「" + w.title + "」");
    if (g.presence !== w.presence || g.chip !== w.presence) errs.push(w.eid + " presence 签「" + g.chip + "」(data " + g.presence + ") 应「" + w.presence + "」");
  }
  return errs;
}
/* 措辞之判：「相关」行之签文与提示不得含「不在」（守 §6／§7）；「不在」行另论（史文正面明书者）。 */
function judgeWording(got) {
  const errs = [];
  for (const g of got) if (g.presence === "相关" && (/不在/.test(g.chip) || /不在/.test(g.tip))) errs.push(g.eid + "：「相关」之签写作「" + g.chip + "」／提示「" + g.tip + "」");
  return errs;
}
/* 候某编年卡入视口（平滑滚动须时）；3 秒不至即返 false */
const inView = (pg, eid) => pg.waitForFunction((id) => {
  const d = document.querySelector('#chron-list details[data-eid="' + id + '"]'); if (!d) return false;
  const r = d.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight && r.bottom > 0;
}, eid, { timeout: 3000 }).then(() => true, () => false);
const readEvts = (root) => [...root.querySelectorAll(".rel-evts .rel-evt")].map(b => ({
  eid: b.dataset.eid, presence: b.dataset.presence,
  year: (b.querySelector(".rel-evt-year") || {}).textContent, title: (b.querySelector(".rel-evt-title") || {}).textContent,
  chip: (b.querySelector(".chip") || {}).textContent, tip: (b.querySelector(".chip") || {}).title || "" }));

(async () => {
  console.log("经纬春秋 · r61-N 二级之展示之验");
  /* ---------- 样本（自数据择，不写死其现数） ---------- */
  const sec = PPL.filter(p => !PROTO.has(p.id));
  const female = PPL.find(p => p.id === "P_ZHAOZHUANGJI");
  const withBuzai = sec.find(p => rowsOf(p.id).some(l => l.presence === "不在"));
  const most = [...sec].sort((a, b) => rowsOf(b.id).length - rowsOf(a.id).length || a.id.localeCompare(b.id))[0];
  const SAMPLES = [female, withBuzai, most].filter(Boolean);
  selfcheck(PPL.length > 0 && EP.length > 0, "people／event_people 非空", PPL.length + "／" + EP.length);
  selfcheck(PROTO.size > 0 && sec.length > 0, "一级、二级俱有其人", PROTO.size + "／" + sec.length);
  selfcheck(!!female && !PROTO.has(female.id), "女性二级样本赵庄姬在库且为二级（若其升一级或去库，本门须改择，不得默然少一例）");
  selfcheck(!!withBuzai, "库中有含 presence「不在」行之二级（三值俱验）", withBuzai && withBuzai.name);
  selfcheck(new Set(SAMPLES.map(p => p.id)).size === 3 && SAMPLES.every(p => p.id !== "P_ZHAODUN"), "三样本互异且俱非赵盾", SAMPLES.map(p => p.name).join("、"));
  selfcheck(SAMPLES.some(p => rowsOf(p.id).some(l => (l.presence || "亲至") === "相关")), "样本中有「相关」行（措辞判据不空转）");
  const protoSample = PPL.find(p => PROTO.has(p.id) && rowsOf(p.id).length > 0);
  selfcheck(!!protoSample, "有挂链之一级样本", protoSample && protoSample.name);
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
  const shotDir = path.join(__dirname, "screenshots");
  try { fs.mkdirSync(shotDir, { recursive: true }); } catch { /* 无妨 */ }
  const libLoad = async (pg, h) => { await pg.goto(base + h, { waitUntil: "networkidle" }); await pg.waitForSelector("#lib-list li"); };

  /* ================= §一 资料库「人物」签 ================= */
  console.log("\n§一 资料库「人物」签（1440、375 二宽）");
  for (const [w, h] of [[1440, 900], [375, 812]]) {
    const pg = await mkPage(w, h);
    await libLoad(pg, "#/library/people");
    const m = await pg.evaluate(() => ({
      sel: (document.querySelector('.lib-tabs button[aria-selected="true"]') || {}).dataset.tab,
      ids: [...document.querySelectorAll("#lib-list button.lib-person")].map(b => ({ id: b.dataset.libId, proto: b.dataset.proto,
        mark: !!b.querySelector(".lib-proto-mark"), sub: b.querySelector(".lib-sub").textContent, name: b.querySelector("strong").firstChild.textContent })),
      anyOther: document.querySelectorAll("#lib-list button.lib-item:not(.lib-person)").length,
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      tabsOver: (() => { const t = document.querySelector(".lib-tabs"); const r = t.getBoundingClientRect(); return r.right > document.documentElement.clientWidth + 0.5; })(),
      hint: document.querySelector("#lib-detail").textContent }));
    ok(m.sel === "people", w + "px 「人物」签已选中");
    ok(m.ids.length === PPL.length && m.anyOther === 0, w + "px 人物签行数＝people 总数", m.ids.length + "／" + PPL.length);
    const idSet = new Set(m.ids.map(x => x.id));
    ok(idSet.size === PPL.length && PPL.every(p => idSet.has(p.id)), w + "px 行之 id 集＝people 之 id 集（无重无漏）");
    const markBad = m.ids.filter(x => x.mark !== PROTO.has(x.id) || (x.proto === "1") !== PROTO.has(x.id));
    ok(markBad.length === 0, w + "px 「一级」之标恰落 is_protagonist=1 者（" + PROTO.size + " 人）", markBad.slice(0, 3).map(x => x.id).join(","));
    const nBad = m.ids.filter(x => !x.sub.endsWith("所系之事 " + rowsOf(x.id).length));
    ok(nBad.length === 0, w + "px 每行所书事数＝其 event_people 行数", nBad.slice(0, 3).map(x => x.id + ":" + x.sub).join(" | "));
    const pBy = new Map(PPL.map(p => [p.id, p]));
    const subBad = m.ids.filter(x => { const p = pBy.get(x.id); return x.name !== p.name || !x.sub.startsWith([p.state, p.role].filter(Boolean).join(" · ")); });
    ok(subBad.length === 0, w + "px 每行之名、国、身份＝people 之 name／state／role", subBad.slice(0, 3).map(x => x.id).join(","));
    ok(m.sw <= m.cw && !m.tabsOver, w + "px 无横溢（页 scrollWidth " + m.sw + " ≤ " + m.cw + "；页签不出右界）");
    ok(m.hint.includes("全库 " + PPL.length + " 人") && m.hint.includes("一级 " + PROTO.size) && m.hint.includes("二级 " + sec.length), w + "px 详情栏之说明其数＝独立复算", m.hint.slice(0, 60));
    await pg.screenshot({ path: path.join(shotDir, "r61n_library_people_" + w + ".png"), fullPage: false });
    if (w === 1440) {
      // 以国名检
      await pg.fill("#lib-search", "晋"); await pg.waitForTimeout(150);
      const got = new Set(await pg.$$eval("#lib-list button.lib-person", a => a.map(b => b.dataset.libId)));
      const want = expectFilter("晋");
      ok(got.size === want.size && [...want].every(x => got.has(x)), "检「晋」之所余＝独立复算（名／别名／国／身份四栏）", got.size + "／" + want.size);
      ok(decodeURIComponent(await pg.evaluate(() => location.hash)) === "#/library/people?q=晋", "检索词入 hash", await pg.evaluate(() => location.hash));
      await pg.fill("#lib-search", "");
      // 点入：一级 → 时间线
      await pg.click('#lib-list button.lib-person[data-lib-id="' + protoSample.id + '"]');
      await pg.waitForFunction(() => location.hash.startsWith("#/p/"));
      ok(await pg.evaluate(() => location.hash) === "#/p/" + protoSample.id + "/timeline", "点一级「" + protoSample.name + "」→ 其时间线");
      // 点入：二级 → 关系页 ego
      await libLoad(pg, "#/library/people");
      await pg.click('#lib-list button.lib-person[data-lib-id="' + female.id + '"]');
      // r61-V 校基线（裁二百二十八 三）：二级之关系页今带其人之址 `#/relations?ego=<pid>`，旧期 `#/relations` 随改——
      // 期值另路书之（不取 app.js 之 buildHash），且较旧断言更严：址须记其人，不只落关系页。
      const wantEgo = "#/relations?ego=" + encodeURIComponent(female.id);
      await pg.waitForFunction((h) => location.hash === h, wantEgo).catch(() => {});
      await pg.waitForSelector("#rel-panel .rel-evts");
      const ego = await pg.evaluate(() => ({ mode: relView.mode, center: relView.center, hash: location.hash }));
      ok(ego.mode === "ego" && ego.center === female.id && ego.hash === wantEgo, "点二级「" + female.name + "」→ " + wantEgo + "，ego 以其为中心", JSON.stringify(ego));
    }
  }

  /* ================= §二 抽屉「所系之事」 ================= */
  console.log("\n§二 关系页抽屉「所系之事」（三位二级：" + SAMPLES.map(p => p.name + "〔" + rowsOf(p.id).length + "〕").join("、") + "）");
  const pg = await mkPage(1440, 900);
  for (const p of SAMPLES) {
    const want = expectEvts(p.id);
    await libLoad(pg, "#/library/people");
    await pg.click('#lib-list button.lib-person[data-lib-id="' + p.id + '"]');
    await pg.waitForSelector("#rel-panel .rel-evts");
    const inl = await pg.evaluate((fn) => { const f = new Function("root", "return (" + fn + ")(root)"); return {
      evts: f(document.querySelector("#rel-panel")), head: document.querySelector("#rel-panel .rel-evts h4").textContent }; }, readEvts.toString());
    const e1 = judgeEvts(inl.evts, want), w1 = judgeWording(inl.evts);
    ok(!e1.length, "【内嵌右卡】" + p.name + " 事数 " + inl.evts.length + "＝event_people 行数 " + rowsOf(p.id).length + "，次序／年／题／presence 逐条合", e1.slice(0, 3).join(" | "));
    ok(inl.head === "所系之事（" + rowsOf(p.id).length + "）", "【内嵌右卡】" + p.name + " 节题书其数", inl.head);
    ok(!w1.length, "【内嵌右卡】" + p.name + " 「相关」之签不写作、不暗示不在场", w1.join(" | "));
    // 全屏抽屉：真开全屏、真点其节点
    await pg.click("#btn-rel-zoom").catch(() => {});
    const opened = await pg.evaluate(async (pid) => {
      const ov = document.querySelector("#map-overlay"); if (!ov || ov.hidden) return "noOverlay";
      const n = ov.querySelector('[data-node="' + pid + '"]'); if (!n) return "noNode";
      n.dispatchEvent(new MouseEvent("click", { bubbles: true })); await new Promise(r => setTimeout(r, 350));
      return document.querySelector("#place-drawer").hidden ? "noDrawer" : "ok";
    }, p.id);
    selfcheck(opened === "ok", "全屏关系图可开、其节点可点、抽屉可开（" + p.name + "）", opened);
    if (opened === "ok") {
      const dr = await pg.evaluate((fn) => new Function("root", "return (" + fn + ")(root)")(document.querySelector("#drawer-content")), readEvts.toString());
      const e2 = judgeEvts(dr, want);
      ok(!e2.length && JSON.stringify(dr) === JSON.stringify(inl.evts), "【全屏抽屉】" + p.name + " 事列与内嵌右卡逐项同、与期值合", e2.slice(0, 3).join(" | "));
      if (p === female) await pg.screenshot({ path: path.join(shotDir, "r61n_drawer_fullscreen_" + p.id + ".png") });
      // 抽屉内点一事 → 编年该卡（先退全屏）
      const tgt = want[want.length - 1].eid;
      await pg.click('#drawer-content .rel-evt[data-eid="' + tgt + '"]');
      await pg.waitForFunction(() => location.hash === "#/chronicle");
      await pg.waitForSelector('#chron-list details[data-eid="' + tgt + '"][open]');
      await inView(pg, tgt);   // 落锚走 spotScrollInto 之平滑滚动，须候其停
      const st = await pg.evaluate((id) => ({ ov: document.querySelector("#map-overlay").hidden, dr: document.querySelector("#place-drawer").hidden,
        vis: (() => { const r = document.querySelector('#chron-list details[data-eid="' + id + '"]').getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; })() }), tgt);
      ok(st.ov && st.vis, "【全屏抽屉】点「" + tgt + "」→ 退全屏、落编年、该卡展开且在视口", JSON.stringify(st));
    }
    // 内嵌右卡点一事 → 编年该卡
    await libLoad(pg, "#/library/people");
    await pg.click('#lib-list button.lib-person[data-lib-id="' + p.id + '"]');
    await pg.waitForSelector("#rel-panel .rel-evts");
    await pg.screenshot({ path: path.join(shotDir, "r61n_drawer_" + p.id + ".png"), fullPage: false });
    await pg.evaluate(() => document.querySelector("#rel-panel").scrollIntoView());
    await pg.screenshot({ path: path.join(shotDir, "r61n_panel_" + p.id + ".png"), fullPage: false });
    const t0 = want[0].eid;
    await pg.click('#rel-panel .rel-evt[data-eid="' + t0 + '"]');
    await pg.waitForFunction(() => location.hash === "#/chronicle");
    await pg.waitForSelector('#chron-list details[data-eid="' + t0 + '"][open]');
    ok(await inView(pg, t0), "【内嵌右卡】点「" + t0 + "」→ 落编年、该卡展开且在视口");
  }
  // 一级之人：抽屉示其数、指其时间线，不列
  {
    await libLoad(pg, "#/library/people");
    await pg.evaluate((pid) => { relRecenter(pid); }, protoSample.id).catch(() => {});
    await pg.goto(base + "#/p/" + protoSample.id + "/relations", { waitUntil: "networkidle" });
    await pg.waitForSelector("#rel-panel .rel-evts");
    const pr = await pg.evaluate(() => ({ head: document.querySelector("#rel-panel .rel-evts h4").textContent,
      n: document.querySelectorAll("#rel-panel .rel-evt").length, note: (document.querySelector("#rel-panel .rel-evts-note") || {}).textContent || "",
      go: [...document.querySelectorAll("#rel-panel .rel-actions button")].some(b => /的时间线 →$/.test(b.textContent)) }));
    ok(pr.head === "所系之事（" + rowsOf(protoSample.id).length + "）" && pr.n === 0 && /时间线/.test(pr.note) && pr.go,
      "一级「" + protoSample.name + "」：节题书其数、不列事、指其时间线（钮在）", JSON.stringify(pr));
  }

  /* ================= §三 hash 往返 ================= */
  console.log("\n§三 hash 往返");
  {
    const p3 = await mkPage(1440, 900);
    await libLoad(p3, "#/library/people");
    const rt = await p3.evaluate(() => ({ st: state.tab, back: buildHash(null, "library", state.tab, state.q) }));
    ok(rt.st === "people" && rt.back === "#/library/people", "#/library/people → state.tab＝people → buildHash 回同一 hash", JSON.stringify(rt));
    await libLoad(p3, "#/library/people?q=" + encodeURIComponent("赵"));
    const rq = await p3.evaluate(() => ({ st: state.tab, q: state.q, back: buildHash(null, "library", state.tab, state.q), v: document.querySelector("#lib-search").value }));
    ok(rq.st === "people" && rq.q === "赵" && rq.v === "赵" && rq.back === "#/library/people?q=" + encodeURIComponent("赵"), "带检索词之 hash 往返（检索框回填）", JSON.stringify(rq));
    await p3.goto(base + "#view=library&tab=people", { waitUntil: "networkidle" }); await p3.waitForSelector("#lib-list li");
    ok(await p3.evaluate(() => location.hash) === "#/library/people", "旧式 #view=library&tab=people 就地改写为 #/library/people");
    await libLoad(p3, "#/library");
    await p3.click('.lib-tabs button[data-tab="people"]');
    await p3.waitForFunction(() => location.hash === "#/library/people");
    ok(await p3.$$eval("#lib-list button.lib-person", a => a.length) === PPL.length, "点「人物」签 → hash 写 #/library/people、列全库");
    await p3.click('.lib-tabs button[data-tab="background"]');
    await p3.waitForFunction(() => location.hash === "#/library");
    ok(await p3.$$eval("#lib-list button.lib-person", a => a.length) === 0, "回「历史背景」签 → hash 回 #/library、人物行俱去");
  }

  /* ================= §四 按类反证 ================= */
  console.log("\n§四 按类反证（判据须当场能红）");
  {
    const p = SAMPLES[2], want = expectEvts(p.id);
    await libLoad(pg, "#/library/people");
    await pg.click('#lib-list button.lib-person[data-lib-id="' + p.id + '"]');
    await pg.waitForSelector("#rel-panel .rel-evts");
    // ① 删其一行挂链于页内之 DATA，重渲右卡
    const inj = await pg.evaluate(({ pid, fn }) => {
      const k = DATA.event_people.findIndex(l => l.person_id === pid);
      const saved = DATA.event_people.splice(k, 1)[0];
      showRelDetail(relsTouching(pid), pid);
      const out = new Function("root", "return (" + fn + ")(root)")(document.querySelector("#rel-panel"));
      DATA.event_people.splice(k, 0, saved);
      showRelDetail(relsTouching(pid), pid);
      return out;
    }, { pid: p.id, fn: readEvts.toString() });
    const r1 = judgeEvts(inj, want);
    selfcheck(r1.length > 0, "反证① 删「" + p.name + "」一行挂链 → 事数判据当场红", r1[0] || "（未红）");
    // ② 把一「相关」行之签文改作「不在场」
    const rp = SAMPLES.find(x => rowsOf(x.id).some(l => (l.presence || "亲至") === "相关"));
    await libLoad(pg, "#/library/people");
    await pg.click('#lib-list button.lib-person[data-lib-id="' + rp.id + '"]');
    await pg.waitForSelector("#rel-panel .rel-evts");
    const inj2 = await pg.evaluate((fn) => {
      const b = document.querySelector('#rel-panel .rel-evt[data-presence="相关"] .chip'); b.textContent = "不在场";
      return new Function("root", "return (" + fn + ")(root)")(document.querySelector("#rel-panel"));
    }, readEvts.toString());
    const r2 = judgeWording(inj2);
    selfcheck(r2.length > 0, "反证② 「" + rp.name + "」一「相关」签改作「不在场」→ 措辞判据当场红", r2[0] || "（未红）");
    const r2b = judgeEvts(inj2, expectEvts(rp.id));
    selfcheck(r2b.length > 0, "反证② 同一注入 → presence 签对读之判据亦红", r2b[0] || "（未红）");
  }

  selfcheck(errs.length === 0, "页面无抛错", errs.slice(0, 3).join(" | "));
  await browser.close(); s.close();
  console.log("\n合计断言 " + asserts + " 条，判红 " + fails + "；门自检出错 " + gateErrs);
  process.exit(gateErrs ? 2 : fails ? 1 : 0);
})().catch(e => { console.error("门自身出错：", e); process.exit(2); });
