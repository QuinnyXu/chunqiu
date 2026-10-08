/* 经纬春秋 · r60-B 可重跑之验：核对状态之记号（主语是「其据」）
 * （任务书 team/round59_prompts.md 裁一百九十四一、裁一百九十九、裁二百〇一、裁二百〇二；来源：Vision r60-B）
 *
 * 用法（自 tools/qa/ 起跑，playwright 在此处 node_modules 内）：  node vision_r60b.js
 * 退出码：0＝全过；1＝有判红；2＝本门自身出错（浏览器取不到、前提不成、判据空转）。
 *
 * 验五事（期值均自 site/data/*.json 独立复算，不读 app.js 之索引）：
 *  (1) 三态各一例真渲染：真开编年页、真展开其事、真点开记号，一句话与链接逐字对读；
 *  (2) 已核者零记号：库中全部引文逐条与独立复算之期值对读（期无则必无）；
 *  (3) negated 条零记号：仅有 negated 触发名之引文，渲染后无记号；
 *  (4)「无记号不等于已核」在屏，且与记号同屏（行内 .vs-foot 与记号同行可见；页首 .vs-ledger-note 常驻可见，
 *      并含独立复算之覆盖数）；
 *  (5) 反证：把一条已核之引文注入为未核，记号当现；注入 negated／8 档宽口／sources 表之条，记号不现。
 * 严口径：status.name ∈ {本轮无从核, 未见, 未核} 且 negated=false 触发。
 * 读者面三句在此独立再书一遍（若 app.js 改其字，本门当场红）。 */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { requireBrowser } = require("./require_browser.js");
const ROOT = path.resolve(__dirname, "..", ".."), SITE = path.join(ROOT, "site");
const J = (n) => JSON.parse(fs.readFileSync(path.join(SITE, "data", n + ".json"), "utf8"));

const SENT = { "本轮无从核": "本轮无从核（材料不在手，不等于查无）", "未见": "未见（某物未曾目验）", "未核": "未核" };
const TRIG = Object.keys(SENT);
const NOTVER = "无记号不等于已核";
let fails = 0, gateErrs = 0;
const ok = (c, l, d) => { if (!c) fails++; console.log("  " + (c ? "✓" : "✗") + " " + l + (d ? "  —— " + d : "")); };
const selfcheck = (c, l, d) => { if (!c) gateErrs++; console.log("  " + (c ? "✓" : "⚠") + " 〔门自检〕" + l + (d ? "  —— " + d : "")); };

const VM = J("verify_marks"), PASS = J("passages"), EVS = J("events"), PPL = J("people"), META = J("meta");
const expectedStates = (pid) => {
  const s = new Set();
  for (const e of VM) if (e.table === "passages" && e.row_id === pid)
    for (const st of e.status) if (TRIG.includes(st.name) && !st.negated) s.add(st.name);
  return s;
};

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

(async () => {
  console.log("经纬春秋 · r60-B 核对状态记号之验");
  const byPid = new Map(PASS.map(q => [q.id, q]));
  const allSt = (pid) => VM.filter(e => e.table === "passages" && e.row_id === pid);
  const VERIFIED = ["纸本已核", "已核", "电子本已核", "扫描本已核"];
  const WIDE = ["待纸本", "未取纸本", "待核", "未核待补", "留痕待核", "须纸本核", "未取原文核对", "转引"];
  const withState = (n) => PASS.filter(q => q.event_id && expectedStates(q.id).has(n)).sort((a, b) => expectedStates(a.id).size - expectedStates(b.id).size);   // 取该态者，单态者优先
  const verifiedOnly = PASS.filter(q => q.event_id && !expectedStates(q.id).size && allSt(q.id).some(e => e.status.some(s => VERIFIED.includes(s.name))));
  // 带 negated 触发名之引文：库中此类引文皆另有他态（无「仅 negated」者），故逐条断「negated 之名若无别条非 negated 支持，则不现」；纯 negated 之形由 §四 注入补证
const negOnly = PASS.filter(q => q.event_id && allSt(q.id).some(e => e.status.some(s => TRIG.includes(s.name) && s.negated)));
  const noEntry = PASS.filter(q => q.event_id && !allSt(q.id).length);
  const wide = PASS.filter(q => q.event_id && !expectedStates(q.id).size && allSt(q.id).some(e => e.status.some(s => WIDE.includes(s.name) && !s.negated)));
  for (const n of TRIG) selfcheck(withState(n).length > 0, "库中有含「" + n + "」态之引文可作真渲染之例", withState(n).length + " 条");
  selfcheck(verifiedOnly.length > 0, "库中有「已核而不触发」之引文", verifiedOnly.length + " 条");
  selfcheck(negOnly.length > 0, "库中有带 negated 触发名之引文（否则 (3) 空转）", negOnly.length + " 条");
  selfcheck(noEntry.length > 0, "库中有账本未涉之引文", noEntry.length + " 条");
  selfcheck(wide.length > 0, "库中有仅含 8 档宽口之引文", wide.length + " 条");
  if (gateErrs) { console.log("门自身出错（前提不成）"); process.exit(2); }

  const ppl = new Set(), evs = new Set();
  for (const e of VM) {
    if (e.table === "people") ppl.add(e.row_id);
    else if (e.table === "events") evs.add(e.row_id);
    else if (e.table === "passages" && byPid.get(e.row_id) && byPid.get(e.row_id).event_id) evs.add(byPid.get(e.row_id).event_id);
  }
  console.log("  〔覆盖现算〕people " + ppl.size + "／" + PPL.length + "，events " + evs.size + "／" + EVS.length);

  const { browser, executablePath, browserVersion } = await requireBrowser();
  console.log("  浏览器：" + executablePath + "  " + browserVersion);
  const s = await srv(); const base = "http://127.0.0.1:" + s.address().port + "/";
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", JSON.stringify({ v: 1, step: -1, done: true })); } catch (e) { /* 无妨 */ } });
  const pg = await ctx.newPage(); const errs = [];
  pg.on("pageerror", e => errs.push(String(e)));
  await pg.goto(base + "#/chronicle", { waitUntil: "networkidle" });
  await pg.waitForSelector("#chron-list details.event");

  console.log("\n§一 三态各一例真渲染（真展开编年之事、真点开记号）");
  const open = (eid) => pg.evaluate(async (id) => {
    const d = document.querySelector('#chron-list details[data-eid="' + id + '"]'); if (!d) return false;
    d.open = true; await new Promise(r => setTimeout(r, 80)); d.scrollIntoView(); return true;
  }, eid);
  for (const n of TRIG) {
    const q = withState(n)[0];
    ok(await open(q.event_id), "「" + n + "」例（引文 " + q.id + "，事 " + q.event_id + "）之事在编年页");
    const qsel = '#chron-list blockquote[data-qid="' + q.id + '"]';
    const m = await pg.$(qsel + ' .vs-mark[data-vs-state="' + n + '"]');
    ok(!!m, "  该引文上有「" + n + "」记号", "该引文记号总数＝" + await pg.$$eval(qsel + " .vs-mark", a => a.length));
    if (!m) continue;
    ok(await m.$eval("summary", e => e.textContent) === n, "  记号字面＝「" + n + "」");
    await m.$eval("summary", e => e.click());
    const pop = await m.$eval(".vs-pop", e => ({
      sent: e.querySelector(".vs-sent").textContent, vis: !!e.offsetParent,
      hrefs: [...e.querySelectorAll("a")].map(a => a.href), where: e.querySelector(".vs-where").textContent }));
    ok(pop.vis, "  点开后可见");
    ok(pop.sent === SENT[n], "  点开一句话逐字＝读者面三句", "「" + pop.sent + "」");
    ok(pop.hrefs.length >= 1 && pop.hrefs.every(h => h.startsWith("https://github.com/QuinnyXu/chunqiu/blob/main/data/csv/passages.csv")), "  链到仓库 data/csv/passages.csv", pop.hrefs[0]);
    ok(pop.where.includes("passages 表 " + q.id) && pop.where.includes("modern_note"), "  随带表／行／栏／偏移", pop.where.slice(0, 50));
    const near = await pg.evaluate((sel) => {
      const row = document.querySelector(sel + " .vs-row");
      const foot = row.querySelector(".vs-foot"), mk = row.querySelector(".vs-mark summary");
      const a = foot.getBoundingClientRect(), b = mk.getBoundingClientRect();
      return { vis: !!foot.offsetParent && getComputedStyle(foot).visibility === "visible", text: foot.textContent,
               dy: Math.abs(a.top - b.top), vh: innerHeight, inPop: !!foot.closest(".vs-pop") };
    }, qsel);
    ok(near.vis && !near.inPop && near.text.includes(NOTVER), "  「" + NOTVER + "」句与记号同行常驻（不在要点开的层内）", "「" + near.text + "」");
    ok(near.dy < near.vh, "  句与记号同屏（纵向距 " + Math.round(near.dy) + "px < 视口高 " + near.vh + "）");
  }

  console.log("\n§二 页首常驻之句与覆盖数（编年页、人物时间线页）");
  const expectCov = "人物 " + ppl.size + "／" + PPL.length + "、事件 " + evs.size + "／" + EVS.length;
  const day = META.generated_at.slice(0, 10);
  const note = await pg.$eval("#vs-note-chron", e => ({ t: e.textContent, vis: !!e.offsetParent }));
  ok(note.vis && note.t.includes(NOTVER), "编年页首有常驻可见之句，含「" + NOTVER + "」");
  ok(note.t.includes(expectCov), "  覆盖数＝独立复算之「" + expectCov + "」");
  ok(note.t.includes(day), "  随书其日＝meta.generated_at（" + day + "）");
  await pg.goto(base + "#/p/P_WENJIANG/timeline", { waitUntil: "networkidle" });
  const note2 = await pg.$eval("#vs-note-timeline", e => ({ t: e.textContent, vis: !!e.offsetParent }));
  ok(note2.vis && note2.t.includes(NOTVER) && note2.t.includes(expectCov), "人物时间线页首同有常驻之句与覆盖数");

  console.log("\n§三 全库引文逐条对读（期值独立复算；渲染走 eventQuotesFrag，即两视图共用之入口）");
  const rendered = await pg.evaluate(() => {
    const out = {};
    for (const q of DATA.passages) {
      if (!q.event_id || !EVENTS[q.event_id]) continue;
      for (const bq of eventQuotesFrag(EVENTS[q.event_id]).querySelectorAll("blockquote.quote"))
        out[bq.dataset.qid] = [...bq.querySelectorAll(".vs-mark")].map(m => m.dataset.vsState);
    }
    return out;
  });
  let bad = 0, nMark = 0;
  for (const q of PASS) {
    if (!q.event_id) continue;
    const exp = [...expectedStates(q.id)].sort().join("|"), got = (rendered[q.id] || []).slice().sort().join("|");
    if (got) nMark++;
    if (exp !== got) { bad++; if (bad <= 5) console.log("    差：" + q.id + " 期[" + exp + "] 得[" + got + "]"); }
  }
  ok(bad === 0, "逐条：渲染之记号集＝独立复算之期值（有记号 " + nMark + " 条，差 " + bad + "）");
  const none = (arr) => arr.every(q => !(rendered[q.id] || []).length);
  ok(none(verifiedOnly), "(2) 已核而不触发者（" + verifiedOnly.length + " 条）零记号");
  const negLeak = negOnly.filter(q => allSt(q.id).some(e => e.status.some(s => TRIG.includes(s.name) && s.negated && !expectedStates(q.id).has(s.name) && (rendered[q.id] || []).includes(s.name))));
  ok(negLeak.length === 0, "(3) 带 negated 触发名之引文（" + negOnly.length + " 条）：negated 之名无非 negated 之支持者，皆不现", "漏 " + negLeak.length);
  ok(none(noEntry), "    账本未涉者（" + noEntry.length + " 条）零记号");
  ok(none(wide), "    仅 8 档宽口者（" + wide.length + " 条）零记号，不归并为「未核」");
  ok(await pg.evaluate(() => !document.querySelector(".person-card .vs-mark, .event > summary .vs-mark")), "(主语) 人物卡、事件卡标题行上无记号");

  console.log("\n§四 反证（注入后重渲，记号当现／当隐；注入毕复原）");
  const probe = verifiedOnly[0];
  const inj = await pg.evaluate(({ pid, eid }) => {
    const run = () => { VS_IDX = null; return [...eventQuotesFrag(EVENTS[eid]).querySelectorAll('blockquote[data-qid="' + pid + '"] .vs-mark')].map(m => m.dataset.vsState); };
    const n0 = DATA.verify_marks.length, r = {};
    const put = (table, row, name, neg) => { DATA.verify_marks.length = n0; DATA.verify_marks.push({ table, row_id: row, col: "modern_note", offset: 0, status: [{ name, negated: neg }] }); return run(); };
    r.before = run();
    r.asUnchecked = put("passages", pid, "未核", false);
    r.asNoCheck = put("passages", pid, "本轮无从核", false);
    r.asNeg = put("passages", pid, "未核", true);
    r.asWide = put("passages", pid, "待核", false);
    r.asSrc = put("sources", pid, "未核", false);
    DATA.verify_marks.length = n0; r.after = run();
    return r;
  }, { pid: probe.id, eid: probe.event_id });
  ok(inj.before.length === 0, "注入前，已核之引文 " + probe.id + " 无记号");
  ok(inj.asUnchecked.join() === "未核", "把它注入为「未核」，记号当现", inj.asUnchecked.join());
  ok(inj.asNoCheck.join() === "本轮无从核", "注入为「本轮无从核」，记号当现");
  ok(inj.asNeg.length === 0, "注入为 negated 之「未核」，记号不现");
  ok(inj.asWide.length === 0, "注入为 8 档宽口之「待核」，记号不现");
  ok(inj.asSrc.length === 0, "注入 sources 表之条，引文上不现（sources／places 不纳）");
  ok(inj.after.length === 0, "复原后记号复隐");
  ok(errs.length === 0, "全程无 pageerror", errs.join(" | "));

  await browser.close(); s.close();
  if (gateErrs) { console.log("\n门自身出错 " + gateErrs + " 项（exit 2）"); process.exit(2); }
  console.log("\n—— 判 ——  " + (fails ? "✗ " + fails + " 项红（exit 1）" : "✓ 全过（exit 0）"));
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error("门自身出错：", e); process.exit(2); });
