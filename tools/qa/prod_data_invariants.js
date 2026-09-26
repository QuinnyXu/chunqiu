/* 经纬春秋 · 生产数据不变量合本（r53 裁四十九立；旧四本合一）
 * ============================================================================
 *
 * 【名之所以不从轮次】
 *   所并之四本 —— `r43_prod_check.js`／`r44_prod_check.js`／`r45_prod_check.js`／
 *   `r43_prod_render_check.js` —— 名各从其轮，故每轮另起一本，四本之后是第五本。
 *   本本名从其所锁之物：**生产所服之数据**。日后逐条增，不再每轮另起。
 *
 * 【与门之界（裁四十九①，硬界）】
 *   `tools/qa/prod_render_invariants.js`（r52 裁十六立之**渲染不变量门**）**一字不动、不并入**。
 *   门锁「**不随数据变者**」（CSS 与 DOM 之性质），一条数据断言不得入其内——数据断言一入，
 *   它即不能常设。本本锁「**数据之内容**」与「**本次所推之本与生产所服之本是否同一本**」。
 *   ★ 二者所答之问不同，故并立而不相并。凡欲把本本之断言搬进门者，先读裁四十九①。
 *
 * 【本本之三层】
 *   §一 · **部署完整性（同一本）**——裁四十九③所治之根。
 *        旧四本之债不在「有四个文件」，在「**每次扩表须回改 N 处写死之数**」
 *        （`r43_prod_check.js` 一本即写死四表之行数，r50／r51 两轮各回改一次）。
 *        故本层**不写死任何表之行数**：所期一律取本仓 `site/data/meta.json` 之 `tables`，
 *        与生产所供各 `*.json` 之**实际行数**逐表相比，并与生产 `meta.json` 之 `tables` 逐键相比。
 *        ★ **数据扩表时本文件一个字也不必回改。**
 *        ★ 此层有机器自证（§四），并有逐表对位之反证（§三）。
 *   §二 · **内容断言**——旧四本之真断言，逐条留其所出之轮。
 *        判去留之尺（裁四十九③）：锁「**数据之内容**」者留（某 id 某值、某串在否、某行有无），
 *        锁「**数据之多少**」者归入 §一之机制。**不得一并抹去。**
 *        ★ 一值之内某字符之数（如 `Q442` 简上三处「＝」全录）**不是**「数据之多少」——
 *          它锁的是一个值之形貌，扩表不动它一分，故属内容之锁，留。
 *        ★ 断言之所期皆落在 `SPECS` 之内（料），不落在比较之码内（法）——故 §三之反证
 *          可逐条自动派生其对照，不须为每条手写一个反证。
 *   §三 · **按类反证**（裁四十九⑤）——本本既以断言责生产，不可不自证其量得住：
 *        · §一之机制：逐表扰动其所期／逐表截其实际行数／逐表撤其 meta 之键，**逐表须当场红**；
 *          并以 git 内一个**真旧本** `meta.json` 对今日之生产（领队所举之例），红处须与其差处逐表相符。
 *        · §二之断言：**逐条**派生一个「已知当红」之对照（去其所含之串／植其所禁之串／改其值／
 *          撤其行／补其行），**一条不红即抛错中止**，退出码 2。
 *        ★ 「跑绿了事」是本项目再三所戒；量不到而绿，比红更坏。
 *   §四 · **自证**——本本读自己的源码，证「表之行数一处也没写死」（机器扫描，非自述），
 *        并配其反证（以跑时之表名与真实行数拼出写死之形，须当场红）。
 *
 * 【就绪闸（裁四十九④）】
 *   旧 `r43_prod_render_check.js :45` 以 `waitForTimeout(800)` 之固定等待充凭（裁三十一所记），
 *   网络稍慢则数据未到而仍往下量。今照门之就绪闸之式：**候数据可迭代且非空、视图已挂**，
 *   超时**抛错中止、不默然放行**，并把当场探得之状况一并报出。
 *   ★ 其分寸同门：闸**只判形与非空，不判量**——不与任何数字相比、不写任何行 id，
 *     故数据扩表、缩表、改行，俱不须回改本闸一个字。
 *
 * 【跑法】
 *   node tools/qa/prod_data_invariants.js
 *     · 不设 QA_BASE_URL          → 生产站 https://chunqiu.timechorus.com（本本之常法）
 *     · QA_BASE_URL=local         → 自起一个静态源端供出本仓 `site/`
 *       ★ 本模式下 §一「同一本」之问**自明而无力**（以本仓比本仓），本本会当场声明，不冒充已验。
 *     · QA_BASE_URL=http://...    → 指向任意源端
 *     · QA_SKIP_RENDER=1          → 跳过 §二之渲染层复核（无 `playwright` 之机；**跳过即声明，不算绿**）
 *   一律带参破缓存（`?v=<随机>`）。
 *   退出码：0 全过；1 有断言红；2 本本自身出错、**反证失效**或依赖缺而未明示跳过（后者尤须当回事）。
 *
 * 【本门无重试（裁五十七，2026-09-26；★ 有意为之，勿补）】
 *   **本门不设重试：一次网络失败即退出码 2，不自行复跑。**
 *   **其由**——一次 `getaddrinfo ENOTFOUND chunqiu.timechorus.com` **复跑即通**
 *   （r53-5 实测：首跑一次抖断，其后五跑俱通），**其代价只是重跑一次**；
 *   而**加重试之代价是把真的 DNS 故障也变成绿**——一个会自己把故障熬成通过的门，
 *   与没有门无异（同旧训「间歇红之门终将被当成噪音关掉」之反面：默然重试是把红熬没了，更坏）。
 *   **宁可多跑一次。**
 *   ★ **故此处之「无重试」是有意之分寸，不是漏。** 后人见偶发 exit 2，**请复跑，勿补重试**；
 *     他日若以为不妥，改之须先读裁五十七（`team/round53_prompts.md` §六），
 *     并连本段一并改——**不得只加码而留此段之文**。
 */
"use strict";

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..", "..");
const SITE = path.join(ROOT, "site");
const SITE_DATA = path.join(SITE, "data");
const PROD = "https://chunqiu.timechorus.com";
const BUST = String(Date.now()) + "-" + Math.random().toString(36).slice(2, 8);
const READY_MS = 30000;          /* 同门之 READY_MS（r52 裁三十：宁长勿短，超时取短者会把「网络慢」变成「见红」） */
const PROJ_TOL_PX = 5;           /* 投影回校之容差，沿旧本 `r43_prod_render_check.js :54` 之数，非数据 */

let fails = 0;
let checks = 0;
function ok(cond, label, detail) {
  checks++;
  if (!cond) fails++;
  console.log("  " + (cond ? "✓" : "✗") + " " + label + (detail ? "  —— " + detail : ""));
  return !!cond;
}
function head(s) { console.log("\n" + s); }
function note(s) { console.log("    " + s); }

/* ---------------- 取物 ---------------- */

/* ★ `setEncoding("utf8")` 一行系本合本所补（顺带修正，交付文档已声明、可回退）：
 *   旧四本作 `res.on("data", d => data += d)` 而未设编码，Buffer 逐块 `toString()` 拼接，
 *   一个多字节字符若恰跨两块即坏一字——其病不常现（块大而字小），现则成假红。
 *   设编码之后由 StringDecoder 接管块界，此形之坏字不复可能。 */
function fetchJson(u) {
  const mod = u.indexOf("https:") === 0 ? https : http;
  return new Promise((resolve, reject) => {
    mod.get(u, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        if (res.statusCode !== 200) return reject(new Error(u + " -> HTTP " + res.statusCode));
        try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(u + " 之 JSON 解析失败：" + e.message)); }
      });
    }).on("error", reject);
  });
}

/* 本地源端（QA_BASE_URL=local 时用；同门与 `vision_r52.js` 之式） */
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json", ".txt": "text/plain; charset=utf-8",
};
function localServer(root) {
  return new Promise((res, rej) => {
    const s = http.createServer((rq, rs) => {
      let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]);
      if (u === "/") u = "/index.html";
      const fp = path.join(root, u);
      if (!fp.startsWith(root)) { rs.writeHead(403); rs.end(); return; }
      fs.readFile(fp, (e, d) => {
        if (e) { rs.writeHead(404); rs.end(); return; }
        rs.writeHead(200, { "Content-Type": MIME[path.extname(u).toLowerCase()] || "application/octet-stream" });
        rs.end(d);
      });
    });
    s.on("error", rej);
    s.listen(0, "127.0.0.1", () => res(s));
  });
}

function readLocalJson(name) {
  return JSON.parse(fs.readFileSync(path.join(SITE_DATA, name), "utf8"));
}

/* 表名一律跑时求得：自本仓 `site/data/meta.json` 之 `tables` 取其键。
 * ★ 本文件内不枚举一个表名（自证之乙判即扫此事）。 */
function tableNames(localMetaTables) {
  return Object.keys(localMetaTables).sort();
}

/* ============================================================================
 * §一之法 · 「同一本」之比较器
 * ----------------------------------------------------------------------------
 * 输入三物，输出病之列（空列即同一本）：
 *   expected     —— 所期：本仓 `site/data/meta.json` 之 `tables`（表名 → 行数）
 *   prodMeta     —— 生产 `meta.json` 之 `tables`
 *   prodRowCount —— 生产各 `<表>.json` 之**实际行数**（缺表者 null）
 * ★ 一处数字字面量也没有：所期全数由入参带入。故扩表不必回改本函数一个字。
 * ★ §三之反证以**同一个**本函数施于已知不同步之对照——反证与正验不是两套码。
 * ========================================================================== */
function versionDiff(expected, prodMeta, prodRowCount) {
  const bad = [];
  for (const t of Object.keys(expected).sort()) {
    const want = expected[t];
    const rows = prodRowCount[t];
    if (rows === null || rows === undefined) {
      bad.push(t + "：生产未供其表（或取不到）");
    } else if (rows !== want) {
      bad.push(t + "：生产实际 " + rows + " 行，本仓所期 " + want + " 行");
    }
    const m = prodMeta ? prodMeta[t] : undefined;
    if (m === undefined) bad.push(t + "：生产 meta 之 tables 内无此键");
    else if (m !== want) bad.push(t + "：生产 meta 记 " + m + "，本仓所期 " + want);
  }
  for (const t of Object.keys(prodMeta || {})) {
    if (!(t in expected)) bad.push(t + "：生产有而本仓 meta 无此表");
  }
  return bad;
}

/* ============================================================================
 * §二之料 · 内容断言（旧四本之真断言，逐条署其所出之轮）
 * ----------------------------------------------------------------------------
 * 一条一物，`op` 是其判法，`v`／`n`／`match` 是其所期。所期落在料内、不落在码内，
 * 故 §三 可逐条自动派生其对照（见 `mutate()`）。
 *
 * 【逐条判其去留（裁四十九③），其判之由分三类，各以记号别之】
 *   （留）  锁数据之内容者，原样留。
 *   （并）  锁数据之多少者，撤出本节、归 §一之机制——共四条，俱出 `r43_prod_check.js`
 *           之「附加：全库不变量」（`sources`／`places`／`passages`／`events` 四表之行数）。
 *           ★ 撤者非抹：其所问「生产是否与本仓同数」正是 §一逐表所问，且由四表扩至全表。
 *   （并之二）`r43_prod_render_check.js` 之投影断言旧写死 x≈708／y≈198——
 *           今改为**跑时自本仓 `places.json` 取其经纬、照 conventions §4 公式回校**，
 *           其数不复写死；所锁者是「投影之法仍在位」，改点亦不必回改本文件。
 *   （合）  同一事两处重出者合为一条，并记其所出之两轮（`E084.summary` 含「简 34」一条，
 *           r43 断言三与断言四各书一次；`Q073`／`Q443` 之「存在」r43 与 r44 各书一次）。
 *   （简）  `includes("`Q443`") || includes("Q443")` 之形——前项是后项之子串，
 *           其或运算恒等于后项，故只留其实者。**判之所及一字未减。**
 *   （勘）  其所锁之状已被后轮之裁推翻者——见 `L_JIAGU` 四条，逐条书其勘由；
 *           原所期照录于 `sup`，跑时一并打印。**不抹其错误史**（conventions §7 v1.29）。
 * ========================================================================== */
const SPECS = [
  /* ---- r43 断言 1：婢／嬖并陈可读 ---- */
  { r: "r43", g: "婢／嬖并陈可读", t: "passages", id: "Q443", f: "modern_note", op: "has", v: "婢" },
  { r: "r43", g: "婢／嬖并陈可读", t: "passages", id: "Q443", f: "modern_note", op: "has", v: "嬖" },
  { r: "r43＋r44", g: "婢／嬖并陈可读", t: "passages", id: "Q073", op: "exists", why: "（合）r43「存在且非空」之前半与 r44「Q073 存在」同一事" },
  { r: "r43", g: "婢／嬖并陈可读", t: "passages", id: "Q073", f: "modern_note", op: "nonEmpty", why: "r43「存在且非空」之后半" },
  { r: "r43", g: "婢／嬖并陈可读", t: "events", id: "E076", op: "exists" },

  /* ---- r43 断言 2：五鹿新点落图（数据面；其渲染面在 §二之二） ---- */
  { r: "r43", g: "五鹿新点", t: "places", id: "L_WULU", f: "lat", op: "num", v: 35.95 },
  { r: "r43", g: "五鹿新点", t: "places", id: "L_WULU", f: "lng", op: "num", v: 115.03 },
  { r: "r43", g: "五鹿新点", t: "places", id: "L_WULU", f: "certainty", op: "eq", v: "low" },
  { r: "r43", g: "五鹿新点", t: "places", id: "L_WULU", f: "coord_certainty", op: "eq", v: "low" },

  /* ---- r43 断言 3／4：E084 正读 ＋ 简 34 著录三处可见 ---- */
  { r: "r43", g: "E084 正读", t: "events", id: "E084", f: "summary", op: "has", v: "與" },
  { r: "r43", g: "简 34 著录三处", t: "events", id: "E084", f: "summary", op: "has", v: "简 34", why: "（合）r43 断言三与断言四各书一次，同一判" },
  { r: "r43", g: "简 34 著录三处", t: "passages", id: "Q448", f: "modern_note", op: "has", v: "简 34" },
  { r: "r43", g: "简 34 著录三处", t: "passages", id: "Q448", f: "quote_original", op: "has", v: "与（與）", why: "r44 校记落地：锁「与（與）」" },
  { r: "r43", g: "简 34 著录三处", t: "passages", id: "Q448", f: "quote_original", op: "hasNot", v: "牙", why: "同上之后半：不锁牙" },
  { r: "r43", g: "简 34 著录三处", t: "sources", id: "J002", f: "notes", op: "has", v: "简 34" },

  /* ---- r43 附加：书目二条与 B002 之不挂（此三条锁内容，非锁多少，故留） ---- */
  { r: "r43", g: "书目与不挂", t: "sources", id: "B002", op: "exists" },
  { r: "r43", g: "书目与不挂", t: "sources", id: "B003", op: "exists" },
  { r: "r43", g: "书目与不挂", t: "events", f: "source_ids", op: "absentInColumn", v: "B002", sep: ";", why: "（逐表对位）旧本一条断言横跨两表，今分为二，一表一条" },
  { r: "r43", g: "书目与不挂", t: "places", f: "source_ids", op: "absentInColumn", v: "B002", sep: ";" },

  /* ---- r44 断言 1：骊姬页 Q073/Q443 两侧互指 ---- */
  { r: "r44", g: "婢案互指", t: "passages", id: "Q443", op: "exists", why: "（合）r43 断言一亦含此判" },
  { r: "r44", g: "婢案互指", t: "passages", id: "Q073", f: "modern_note", op: "has", v: "【r44 互指补·婢案" },
  { r: "r44", g: "婢案互指", t: "passages", id: "Q073", f: "modern_note", op: "has", v: "Q443", why: "（简）旧式带反引号之项是本项之子串，或运算恒等于本项" },
  { r: "r44", g: "婢案互指", t: "passages", id: "Q443", f: "modern_note", op: "has", v: "Q073", why: "（简）同上" },
  { r: "r44", g: "婢案互指", t: "passages", id: "Q073", f: "modern_note", op: "has", v: "转录本破读作嬖" },
  { r: "r44", g: "婢案互指", t: "passages", id: "Q443", f: "modern_note", op: "has", v: "转录本破读作嬖" },

  /* ---- r44 断言 2：息妫页 Q161/Q442 两侧互指 ---- */
  { r: "r44", g: "莘案互指", t: "passages", id: "Q161", op: "exists" },
  { r: "r44", g: "莘案互指", t: "passages", id: "Q442", op: "exists" },
  { r: "r44", g: "莘案互指", t: "passages", id: "Q161", f: "modern_note", op: "has", v: "【r44 互指补·莘案" },
  { r: "r44", g: "莘案互指", t: "passages", id: "Q161", f: "modern_note", op: "has", v: "Q442", why: "（简）" },
  { r: "r44", g: "莘案互指", t: "passages", id: "Q442", f: "modern_note", op: "has", v: "互指补·莘案（「异消解」处之双向互指）" },
  { r: "r44", g: "莘案互指", t: "passages", id: "Q442", f: "modern_note", op: "has", v: "Q161", why: "（简）" },
  { r: "r44", g: "莘案互指", t: "passages", id: "Q161", f: "modern_note", op: "has", v: "转录本破读作嬖" },
  { r: "r44", g: "莘案互指", t: "passages", id: "Q442", f: "modern_note", op: "has", v: "转录本破读作嬖" },

  /* ---- r44 断言 3：Q442 释文形貌落定（r44d 支①） ---- */
  { r: "r44", g: "Q442 释文形貌", t: "passages", id: "Q442", f: "quote_original", op: "has", v: "郶（蔡）" },
  { r: "r44", g: "Q442 释文形貌", t: "passages", id: "Q442", f: "quote_original", op: "has", v: "賽＝（息）侯" },
  { r: "r44", g: "Q442 释文形貌", t: "passages", id: "Q442", f: "quote_original", op: "has", v: "是賽＝爲＝（息媯）" },
  {
    r: "r44", g: "Q442 释文形貌", t: "passages", id: "Q442", f: "quote_original", op: "countChar", ch: "＝", n: 3,
    why: "★ 一值之内某字符之数，非表之行数——扩表不动它一分，故属内容之锁（裁四十九③之界）"
  },
  { r: "r44", g: "Q442 释文形貌", t: "passages", id: "Q442", f: "quote_original", op: "hasNot", v: "蔡哀侯娶妻", why: "娶→取甲档回改已落" },
  { r: "r44", g: "Q442 释文形貌", t: "passages", id: "Q442", f: "quote_original", op: "hasNot", v: "娶" },
  { r: "r44", g: "Q442 释文形貌", t: "passages", id: "Q442", f: "quote_original", op: "hasNot", v: "〔二〕", why: "不录注释号" },
  { r: "r44", g: "Q442 释文形貌", t: "passages", id: "Q442", f: "quote_original", op: "has", v: "訓（順）", why: "丙档旧判仍立" },
  { r: "r44", g: "Q442 释文形貌", t: "passages", id: "Q442", f: "modern_note", op: "has", v: "【★r44d 支①执行·就地注记" },

  /* ---- r45 断言 1：孔子页夹谷事目之挂链（event_people 无 id 栏，故以两栏定位） ---- */
  { r: "r45", g: "夹谷挂链", t: "events", id: "E274", op: "exists" },
  { r: "r45", g: "夹谷挂链", t: "event_people", match: { event_id: "E274", person_id: "P_KONGZI" }, op: "presentRow" },
  { r: "r45", g: "夹谷挂链", t: "event_people", match: { event_id: "E274", person_id: "P_KONGZI" }, f: "presence", op: "eq", v: "亲至" },
  { r: "r45", g: "夹谷挂链", t: "event_people", match: { event_id: "E274", person_id: "P_KONGZI" }, f: "directness", op: "eq", v: "direct" },
  { r: "r45", g: "夹谷挂链", t: "event_people", match: { event_id: "E274", person_id: "P_QIJING" }, f: "presence", op: "eq", v: "亲至" },
  { r: "r45", g: "夹谷挂链", t: "event_people", match: { event_id: "E274", person_id: "P_YANYING" }, op: "absentRow", why: "反面断言：晏婴不挂 E274" },

  /* ---- r45 断言 2：夹谷事目页四条引文分层（经／传二条／史记 S 层） ---- */
  { r: "r45", g: "四引文分层", t: "passages", id: "Q454", op: "exists" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q454", f: "event_id", op: "eq", v: "E274" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q454", f: "quote_type", op: "eq", v: "原文" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q454", f: "source_id", op: "eq", v: "Z118" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q455", op: "exists" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q455", f: "event_id", op: "eq", v: "E274" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q455", f: "quote_type", op: "eq", v: "原文" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q455", f: "source_id", op: "eq", v: "Z118" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q456", op: "exists" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q456", f: "event_id", op: "eq", v: "E274" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q456", f: "quote_type", op: "eq", v: "原文" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q456", f: "source_id", op: "eq", v: "Z118" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q457", op: "exists" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q457", f: "event_id", op: "eq", v: "E274" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q457", f: "quote_type", op: "eq", v: "后出叙事" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q457", f: "source_id", op: "eq", v: "S015" },
  { r: "r45", g: "四引文分层", t: "passages", id: "Q457", f: "modern_note", op: "startsWith", v: "【", why: "以层标起" },

  /* ---- r45 断言 3：L_JIAGU（★ 四条已勘，其由逐条书于 `sup`） ---- */
  { r: "r45", g: "L_JIAGU 地望", t: "places", id: "L_JIAGU", op: "exists" },
  { r: "r45", g: "L_JIAGU 地望", t: "places", id: "L_JIAGU", f: "certainty", op: "eq", v: "low", why: "r45 原判，r50 裁十明书「维持 low，不升」——原样留" },
  {
    r: "r45→r50", g: "L_JIAGU 地望", t: "places", id: "L_JIAGU", f: "lat", op: "num", v: 36.1,
    sup: "r45 原所期「lat 为空」——已被 r50 自限解除（2026-09-19 站长纸本核杨注页 1576／谭图齐鲁幅页 26–27）推翻；所变者是「材料不在手」之状态，非当日之判为误"
  },
  {
    r: "r45→r50", g: "L_JIAGU 地望", t: "places", id: "L_JIAGU", f: "lng", op: "num", v: 117.8,
    sup: "r45 原所期「lng 为空」——同上；lat／lng 取「莱芜县东南」之概位，其偏移量系本库自拟（coord_basis 已自限）"
  },
  {
    r: "r45→r50", g: "L_JIAGU 地望", t: "places", id: "L_JIAGU", f: "coord_certainty", op: "eq", v: "low",
    sup: "r45 原所期「coord_certainty 为空」——r50 由留空改填 low：留空与 low 之别在「有没有取点」，今既取点，自当填值"
  },
  {
    r: "r45→r50", g: "L_JIAGU 地望", t: "places", id: "L_JIAGU", f: "modern_location", op: "has", v: "莱芜",
    sup: "r45 原所期「modern_location 含『未定』」——r50 落定莱芜说之今地，「未定」二字已不在其内；今改锁其所落之今地"
  },
];

/* ---------------- §二之法：判与派生对照 ---------------- */

function rowsOf(D, t) {
  const v = D[t];
  if (!Array.isArray(v)) throw new Error("取不到表 " + t + " 之行（生产所供者非数组）——本本无从判，中止。");
  return v;
}
function matchOf(row, m) { return Object.keys(m).every((k) => row[k] === m[k]); }
function rowOf(D, s) {
  const rows = rowsOf(D, s.t);
  return s.match ? rows.find((r) => matchOf(r, s.match)) : rows.find((r) => r.id === s.id);
}
function label(s) {
  const who = s.match ? JSON.stringify(s.match) : (s.id ? s.id : "（全表逐行）");
  const f = s.f ? "." + s.f : "";
  const what = s.op === "countChar" ? "「" + s.ch + "」计 " + s.n
    : s.op === "exists" || s.op === "presentRow" ? "存在"
      : s.op === "absentRow" ? "不存在"
        : s.op === "nonEmpty" ? "非空"
          : s.op === "absentInColumn" ? "不含「" + s.v + "」"
            : "「" + s.v + "」";
  return "[" + s.r + "] " + s.t + " " + who + f + " " + s.op + " " + what;
}

/* 判一条：真即在位，假即红。取不到其行／其栏者亦算红（并报其状），不默然放过。 */
function judge(s, D) {
  if (s.op === "absentInColumn") {
    const hit = rowsOf(D, s.t).filter((r) => String(r[s.f] === null || r[s.f] === undefined ? "" : r[s.f]).split(s.sep).indexOf(s.v) >= 0);
    return { pass: hit.length === 0, got: hit.length ? "命中行：" + hit.map((r) => r.id).join("／") : "零命中" };
  }
  const row = rowOf(D, s);
  if (s.op === "absentRow") return { pass: !row, got: row ? "该行在" : "该行不在" };
  if (!row) return { pass: false, got: "取不到其行" };
  if (s.op === "exists" || s.op === "presentRow") return { pass: true, got: "在" };
  const raw = row[s.f];
  const str = raw === null || raw === undefined ? "" : String(raw);
  switch (s.op) {
    case "nonEmpty": return { pass: str.trim() !== "", got: "长 " + str.length };
    case "has": return { pass: str.indexOf(s.v) >= 0, got: str.indexOf(s.v) >= 0 ? "在" : "不在（栏值首 40 字：" + str.slice(0, 40) + "）" };
    case "hasNot": return { pass: str.indexOf(s.v) < 0, got: str.indexOf(s.v) < 0 ? "不在" : "★ 在（不当在）" };
    case "eq": return { pass: str === s.v, got: JSON.stringify(raw) };
    case "num": return { pass: raw === s.v || Number(raw) === s.v, got: JSON.stringify(raw) };
    case "startsWith": return { pass: str.indexOf(s.v) === 0, got: "首字 " + JSON.stringify(str.slice(0, 1)) };
    case "countChar": {
      const m = str.split(s.ch);
      const c = m.length - 1;
      return { pass: c === s.n, got: "实计 " + c };
    }
    default: throw new Error("未识之 op：" + s.op + "——本本不猜其意，中止。");
  }
}

/* 派生一条之对照：**已知当红**之最小改动。只浅复其所涉之表，不深复全库（省时，且足用）。 */
function mutate(s, D) {
  const D2 = Object.assign({}, D);
  const rows = rowsOf(D, s.t).map((r) => Object.assign({}, r));
  D2[s.t] = rows;
  const idxOf = () => rows.findIndex((r) => (s.match ? matchOf(r, s.match) : r.id === s.id));
  if (s.op === "absentInColumn") {
    rows[0][s.f] = String(rows[0][s.f] === null || rows[0][s.f] === undefined ? "" : rows[0][s.f]) + s.sep + s.v;
    return { D: D2, how: "于 " + s.t + " 首行之 " + s.f + " 末补一枚「" + s.v + "」" };
  }
  if (s.op === "absentRow") {
    rows.push(Object.assign({}, rows[0], s.match));
    return { D: D2, how: "以首行为坯、改其定位两栏，补出一枚当不在之行" };
  }
  const i = idxOf();
  if (i < 0) throw new Error("派生对照失败：" + label(s) + " 之行本就取不到，反证无从施，中止。");
  if (s.op === "exists" || s.op === "presentRow") {
    rows.splice(i, 1);
    return { D: D2, how: "撤其行" };
  }
  const raw = rows[i][s.f];
  const str = raw === null || raw === undefined ? "" : String(raw);
  switch (s.op) {
    case "nonEmpty": rows[i][s.f] = ""; return { D: D2, how: "空其栏" };
    case "has": rows[i][s.f] = str.split(s.v).join(""); return { D: D2, how: "尽去其栏内之「" + s.v + "」" };
    case "hasNot": rows[i][s.f] = str + s.v; return { D: D2, how: "于其栏末植一枚所禁之「" + s.v + "」" };
    case "eq": rows[i][s.f] = str + "·反证"; return { D: D2, how: "缀其值" };
    case "num": rows[i][s.f] = Number(s.v) + Number(s.v); return { D: D2, how: "倍其值" };
    case "startsWith": rows[i][s.f] = "反证" + str; return { D: D2, how: "于其首植二字" };
    case "countChar": {
      const parts = str.split(s.ch);
      rows[i][s.f] = parts.slice(0, -1).join(s.ch) + parts[parts.length - 1];
      return { D: D2, how: "去其栏内末一枚「" + s.ch + "」" };
    }
    default: throw new Error("未识之 op（派生对照）：" + s.op);
  }
}

/* ============================================================================
 * §四 · 自证：本本读自己的源码，证「表之行数一处也没写死」
 * ----------------------------------------------------------------------------
 * 两条机器判据（非自述，可复核之扫描；表名与行数一律跑时实读求得，本文件内不枚举）：
 *   甲 · 源码内不得有「**表名与数字字面量相比**」之形（「某表之键与某数相等」之属）。
 *   乙 · 源码内不得有「`.length` 与非零数字字面量相比」之形（「某物之长与某数相等」之属）。
 *        ★ 与零相比者在禁外（`bad.length === 0` 是「零不符」之判，非数据之量）。
 * 并逐条打印源码内**全部**数字比较，供人眼复核（不只报「过了」）。
 *
 * 【二判之网有二形之漏——漏写在明处】（同门之自述，本本不假装没有）
 *   其一：行数先落于变量而后比较（长度先存入一个变量，比较之左遂不带 `.length`）；
 *   其二：累加器之属（其名既不带表名、亦不带 `.length`），二判之网够不着。
 *   此二形恃下文之逐条打印兜之。他日若欲补，补在正则，不在此注。
 *   ★ 而所期之料一律取自 `meta.json`（`versionDiff` 之入参），并无一处「所期之数」落在码内，
 *     故此二漏于本本之实际形势下无处落脚——**此是形势之实，不是网之密**，两者不可混。
 *
 * 【本节之反证】见 `selfAuditCounterProof()`：以跑时之**真实表名与真实行数**拼出写死之形，
 *   逐形须当场红；一形不红即抛错中止（退出码 2）。
 *   ★ 分寸：反证之料一律跑时取、跑时拼——拼串之式其表名落在引号之内、其数落在变量之内，
 *     不合二判之形，故植入对照**不会**使本本自己的二判见红。
 * ========================================================================== */
function auditRes(names) {
  const alt = names.slice().sort((a, b) => b.length - a.length || (a < b ? -1 : 1)).join("|");
  return {
    TAB_CMP: new RegExp("\\b(?:" + alt + ")\\b[^\\n]{0,40}(?:===|!==|==|>=|<=|>|<)\\s*\\d+"),
    LEN_CMP: /\.length\s*(?:===|!==|==|>=|<=|>|<)\s*[1-9]\d*/,
    ANY_CMP: /(?:===|!==|==|>=|<=|>|<)\s*-?\d+(?:\.\d+)?/,
  };
}

function selfAuditCounterProof(re, names, counts) {
  head("【四之二】自证之反证：以跑时之真实表名与真实行数拼出写死之形，逐形须当场红");
  note("★ 本本既以反证责生产，不可独免其身（照门 r52 裁二十三之式）。");
  const t = names[0], n = counts[t];
  const mk = (lhs, op, num) => "ok(" + lhs + " " + op + " " + num + ", \"（反证之对照，跑时拼成）\");";
  const shapes = [
    { why: "表名与行数相比（`meta.tables` 之形）", line: mk("meta.tables." + t, "===", n), re: "TAB_CMP" },
    { why: "表名与行数相比（`DATA` 之形）", line: mk("DATA." + t + ".rows", ">=", n), re: "TAB_CMP" },
    { why: "`.length` 与非零数相比", line: mk("rows.length", "===", n), re: "LEN_CMP" },
    { why: "`.length` 与非零数相比（不等式）", line: mk("prodRows.length", ">", n), re: "LEN_CMP" },
  ];
  const dead = [];
  for (const s of shapes) {
    const red = re[s.re].test(s.line);
    if (!red) dead.push(s.why);
    note("· " + (red ? "当场红" : "✗ 未红") + "（" + s.re + "）：" + s.why + " → " + s.line);
  }
  if (dead.length) {
    throw new Error("自证之反证失效：以下形之写死喂入而二判不红——二判量不到这些形，"
      + "其「零处」之绿于此数形是空的，中止：" + dead.join("、"));
  }
  ok(true, "自证之反证：" + shapes.length + " 形写死（跑时以真实表名与真实行数拼成）**逐形当场红**", "一形不红即中止");
  const zero = mk("bad.length", "===", 0);
  ok(!re.LEN_CMP.test(zero), "乙判之不误红：与零相比之式不入其网（「零不符」之判本在禁外）", zero);
  const plain = names.filter((x) => re.TAB_CMP.test(x));
  ok(plain.length === 0, "甲判之不误红：表名单出而无数字比较者不入其网——证其非恒真", plain.length ? plain.join("、") : "零误红");
}

function selfAudit(names, counts) {
  const src = fs.readFileSync(__filename, "utf8");
  const lines = src.split(/\r?\n/);
  const re = auditRes(names);
  const badTab = [], badLen = [], allCmp = [];
  lines.forEach((ln, i) => {
    const n = i + 1;
    if (re.TAB_CMP.test(ln)) badTab.push(n + ": " + ln.trim());
    if (re.LEN_CMP.test(ln)) badLen.push(n + ": " + ln.trim());
    if (re.ANY_CMP.test(ln)) allCmp.push(n + ": " + ln.trim());
  });
  head("【四之一】自证：本本读自己的源码，证其内无「写死之表行数」（机器扫描，非自述）");
  note("表名集跑时自本仓 meta 之 tables 键求得（" + names.length + " 表）：" + re.TAB_CMP.source);
  note("源码内全部「与数字字面量之比较」逐条列出（供人眼复核，共 " + allCmp.length + " 处）：");
  for (const c of allCmp) note("  · " + c);
  ok(badTab.length === 0, "甲：无「表名与数字字面量相比」之形", badTab.length ? badTab.join(" | ") : "零处");
  ok(badLen.length === 0, "乙：无「`.length` 与非零数字面量相比」之形", badLen.length ? badLen.join(" | ") : "零处");
  note("★ 二者俱零，故 §一之绿不因数据涨落而变；**数据扩表时无须回改本文件一个字**。");
  selfAuditCounterProof(re, names, counts);
}

/* ---------------- §三之四：自 git 取一个真旧本 meta（领队所举之例） ---------------- */
function oldMetaFromGit(nowTables) {
  let hashes;
  try {
    hashes = execFileSync("git", ["-C", ROOT, "rev-list", "-n", "40", "HEAD", "--", "site/data/meta.json"],
      { encoding: "utf8" }).split(/\r?\n/).filter((x) => x.trim() !== "");
  } catch (e) {
    return { err: "取不到 git 历史（" + e.message.split(/\r?\n/)[0] + "）" };
  }
  for (const h of hashes) {
    let tb;
    try {
      tb = JSON.parse(execFileSync("git", ["-C", ROOT, "show", h + ":site/data/meta.json"],
        { encoding: "utf8", maxBuffer: 1 << 22 })).tables;
    } catch (e) { continue; }
    const diff = Object.keys(nowTables).filter((t) => tb[t] !== nowTables[t]);
    const miss = Object.keys(tb).filter((t) => !(t in nowTables));
    if (diff.length || miss.length) return { hash: h, tables: tb, diff: diff, miss: miss };
  }
  return { err: "近 " + hashes.length + " 版 meta 之 tables 与今本无一相异（无真旧本可取）" };
}

/* ============================================================================
 * 主
 * ========================================================================== */
(async () => {
  const raw = (process.env.QA_BASE_URL || "").trim();
  let server = null, base, mode;
  if (!raw) { base = PROD; mode = "生产"; }
  else if (raw === "local" || raw === "site") {
    server = await localServer(SITE);
    base = "http://127.0.0.1:" + server.address().port;
    mode = "本地源端";
  } else { base = raw.replace(/\/+$/, ""); mode = "QA_BASE_URL 所指"; }

  console.log("=== 生产数据不变量合本（r53 裁四十九立；r43／r44／r45／r43_render 四本合一）===");
  console.log("  源端：" + base + "（" + mode + "）");
  console.log("  破缓存参：v=" + BUST);
  console.log("  ★ 渲染不变量门 tools/qa/prod_render_invariants.js 与本本并立而不相并（裁四十九①）");

  /* ---- 所期之料：本仓 site/data/meta.json 之 tables（**一个数也不写死**） ---- */
  const localMeta = readLocalJson("meta.json");
  const expected = localMeta.tables;
  const names = tableNames(expected);
  head("【〇】所期之料（跑时实读本仓，非写死）");
  note("本仓 site/data/meta.json 之 generated_at：" + localMeta.generated_at);
  note("本仓所期之 tables（" + names.length + " 表）：" + JSON.stringify(expected));
  for (const t of names) {
    const fp = path.join(SITE_DATA, t + ".json");
    if (!fs.existsSync(fp)) {
      throw new Error("本仓 meta 记有表 " + t + " 而 site/data/" + t + ".json 不在——所期之料自身有缺，"
        + "此时之绿是空的，中止。");
    }
  }
  ok(true, "所期之料自洽：meta 之 tables 每一表皆有其 site/data/<表>.json", names.length + " 表俱在");
  if (server) {
    note("★★ 本地源端模式：§一「本次所推之本与生产所服之本是否同一本」之问**以本仓比本仓，自明而无力**；");
    note("    此模式只宜用以试本本自身与 §二之断言，不得以其绿充「生产已核」。");
  }

  /* ---- §四 自证（先自证，后责人；所需之行数取自本仓，非入断言） ---- */
  selfAudit(names, expected);

  /* ---- 取生产之物 ---- */
  head("【一之一】取生产所供之各表（逐表实取，行数当场数）");
  const prodMeta = await fetchJson(base + "/data/meta.json?v=" + BUST);
  const prodRows = {};
  const prodCount = {};
  for (const t of names) {
    try {
      const rows = await fetchJson(base + "/data/" + t + ".json?v=" + BUST);
      prodRows[t] = rows;
      prodCount[t] = Array.isArray(rows) ? rows.length : null;
    } catch (e) {
      prodRows[t] = null;
      prodCount[t] = null;
      note("· " + t + "：取不到（" + e.message + "）");
    }
  }
  note("生产 meta 之 generated_at：" + prodMeta.generated_at);
  note("生产 meta 之 tables：" + JSON.stringify(prodMeta.tables));
  note("生产各表实数（当场数其行）：" + JSON.stringify(prodCount));
  note("★ generated_at 之异同**只报不判**：其戳重生成即变，与「数据之同异」不是一事"
    + "（同数据重生成亦换戳），故不入断言。今：本仓 " + localMeta.generated_at + " ／生产 " + prodMeta.generated_at
    + "（" + (localMeta.generated_at === prodMeta.generated_at ? "同" : "异") + "）");

  /* ---- §一 部署完整性 ---- */
  head("【一之二】部署完整性：生产所服之本，与本次所推之本，是否同一本（所期不写死，取自本仓 meta）");
  const bad = versionDiff(expected, prodMeta.tables, prodCount);
  for (const b of bad) note("· " + b);
  ok(bad.length === 0, "逐表同数：生产实际行数、生产 meta 之记、本仓 meta 之期，三者逐表相符",
    bad.length ? bad.length + " 处不符" : names.length + " 表俱符（含 meta 之记与实数两重比对）");

  /* ---- §三之一 §一之按类反证（逐表对位） ---- */
  head("【三之一】§一之按类反证：逐表对位，一表不红即中止（裁四十九⑤）");
  note("★ 反证与正验走的是**同一个** versionDiff()，不是两套码。");
  const mentions = (list, t) => list.some((x) => x.indexOf(t + "：") === 0);
  const notRed = { "扰其所期": [], "截其实数": [], "撤其 meta 之键": [] };
  for (const t of names) {
    const e2 = Object.assign({}, expected); e2[t] = expected[t] + 1;
    if (!mentions(versionDiff(e2, prodMeta.tables, prodCount), t)) notRed["扰其所期"].push(t);
    const c2 = Object.assign({}, prodCount); c2[t] = prodCount[t] === null ? null : prodCount[t] - 1;
    if (!mentions(versionDiff(expected, prodMeta.tables, c2), t)) notRed["截其实数"].push(t);
    const m2 = Object.assign({}, prodMeta.tables); delete m2[t];
    if (!mentions(versionDiff(expected, m2, prodCount), t)) notRed["撤其 meta 之键"].push(t);
  }
  for (const k of Object.keys(notRed)) {
    if (notRed[k].length) {
      throw new Error("反证失效（§一 · " + k + "）：以下表之对照喂入而比较器不红——它量不到这些表，"
        + "上文之绿于此数表是空的，中止：" + notRed[k].join("、"));
    }
    ok(true, "· " + k + "：" + names.length + " 表**逐表当场红**", "一表不红即中止");
  }

  head("【三之二】§一之按类反证（其二）：以 git 内一个**真旧本** meta 对今日之生产（领队所举之例）");
  const oldM = oldMetaFromGit(expected);
  if (oldM.err) {
    note("★ 未得真旧本：" + oldM.err + "——本条不以绿计，其位由【三之一】之逐表扰动代之（已逐表红）。");
    ok(true, "（声明）真旧本之对照本轮未得，不冒充已验", oldM.err);
  } else {
    const list = versionDiff(oldM.tables, prodMeta.tables, prodCount);
    const shouldRed = oldM.diff.concat(oldM.miss);
    const dead = shouldRed.filter((t) => !mentions(list, t));
    const falseRed = names.filter((t) => shouldRed.indexOf(t) < 0 && mentions(list, t));
    note("真旧本：" + oldM.hash.slice(0, 7) + "，其 tables：" + JSON.stringify(oldM.tables));
    note("其与今本相异之表：" + (shouldRed.join("／") || "（无）") + "；比较器所报：" + list.length + " 处");
    for (const b of list) note("· " + b);
    if (dead.length) {
      throw new Error("反证失效（§一 · 真旧本）：以下已知不同步之表喂入而比较器不红，中止：" + dead.join("、"));
    }
    ok(true, "真旧本之对照：其 " + shouldRed.length + " 处已知不同步**逐表当场红**", oldM.hash.slice(0, 7));
    ok(falseRed.length === 0, "且其相同之表**一处不误红**——证其红非泛红", falseRed.length ? falseRed.join("、") : "零误红");
  }

  /* ---- §二之一 内容断言（数据层） ---- */
  const D = prodRows;
  head("【二之一】内容断言（旧四本之真断言，共 " + SPECS.length + " 条；逐条署其所出之轮）");
  let g = "";
  for (const s of SPECS) {
    if (s.g !== g) { g = s.g; console.log("  —— " + g + " ——"); }
    const r = judge(s, D);
    ok(r.pass, label(s), r.got + (s.why ? "；" + s.why : ""));
    if (s.sup) note("  ★ 勘：" + s.sup);
  }

  /* ---- §三之三 §二之逐条反证 ---- */
  head("【三之三】§二之逐条反证：每一条各派生一个**已知当红**之对照，一条不红即中止（裁二十四「不得以集合之性质代其成员之性质」）");
  const cpDead = [];
  for (const s of SPECS) {
    let red, how;
    try {
      const m = mutate(s, D);
      how = m.how;
      red = !judge(s, m.D).pass;
    } catch (e) {
      cpDead.push(label(s) + "（派生对照本身出错：" + e.message + "）");
      continue;
    }
    if (!red) cpDead.push(label(s) + "（对照之法：" + how + "）");
  }
  if (cpDead.length) {
    throw new Error("反证失效（§二 · 逐条）：以下断言之对照喂入而其判不红——该判量不到它自称在量的东西，中止：\n    · "
      + cpDead.join("\n    · "));
  }
  ok(true, SPECS.length + " 条内容断言**逐条各有一个当场红之对照**", "一条不红即中止；对照之法自其 op 派生，非手写");

  /* ---- §二之二 渲染层复核 ---- */
  head("【二之二】内容断言之渲染层复核（旧 r43_prod_render_check.js 之 6 判，分属其自题之四题；就绪闸代其固定等待，裁四十九④）");
  if (process.env.QA_SKIP_RENDER === "1") {
    note("★★ QA_SKIP_RENDER=1：渲染层**未跑**。其 6 判之绿本轮不成立——跳过是声明，不是绿。");
    ok(true, "（声明）渲染层本轮按令跳过", "去掉 QA_SKIP_RENDER=1 即复跑");
  } else {
    let pw;
    try { pw = require("playwright"); }
    catch (e) {
      throw new Error("渲染层所需之 playwright 取不到（" + e.message.split(/\r?\n/)[0] + "）。"
        + "★ 本本不默然跳过——若确欲只跑数据层，请明示 QA_SKIP_RENDER=1，其跳过会记在报里。");
    }
    const browser = await pw.chromium.launch();
    const errs = [];
    const origin = new URL(base).origin;
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) { } });
    await ctx.route("**/*", (route) => {
      const req = route.request();
      let u;
      try { u = new URL(req.url()); } catch (e) { return route.continue(); }
      if (u.origin !== origin || req.resourceType() === "document") return route.continue();
      u.searchParams.set("v", BUST);
      return route.continue({ url: u.toString() });
    });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errs.push(e.message));

    /* 就绪闸（裁四十九④）：候数据可迭代且非空、主角表就位。只判形与非空，不判量。 */
    const ready = async (where) => {
      const t0 = Date.now();
      try {
        await page.waitForFunction(() => {
          if (typeof DATA !== "object" || !DATA) return false;
          const ep = DATA.event_people;
          if (!ep || typeof ep[Symbol.iterator] !== "function") return false;
          let epAny = false;
          for (const row of ep) { epAny = true; break; }
          if (!epAny) return false;
          if (typeof PROTAGONISTS === "undefined" || !Array.isArray(PROTAGONISTS)) return false;
          let prAny = false;
          for (const x of PROTAGONISTS) { prAny = true; break; }
          return prAny;
        }, null, { timeout: READY_MS, polling: 120 });
      } catch (e) {
        let probe = "（探测亦失败）";
        try {
          probe = JSON.stringify(await page.evaluate(() => ({
            data: typeof DATA,
            ep: typeof DATA === "object" && DATA ? typeof DATA.event_people : "-",
            epIterable: typeof DATA === "object" && DATA && DATA.event_people
              ? typeof DATA.event_people[Symbol.iterator] === "function" : false,
            protos: typeof PROTAGONISTS,
            ready: document.readyState,
          })));
        } catch (e2) { }
        throw new Error("就绪闸未过（" + where + "）：候 DATA 之 event_people 可迭代且非空、PROTAGONISTS 就位，"
          + READY_MS + "ms 内未至，**本本就此中止，不往下跑**。当场探得：" + probe + "；原由：" + e.message);
      }
      note("就绪闸过（" + where + "）：数据可迭代且非空、主角表就位，候时 " + (Date.now() - t0) + "ms");
    };
    const goPerson = async (pid, view) => {
      await page.goto(base + "/?v=" + BUST + "#/p/" + pid + "/" + view, { waitUntil: "load", timeout: 45000 });
      await ready(pid + "/" + view);
    };

    /* 断言 1：晋文公时间线，E076 展开后婢／嬖并陈可读 */
    await goPerson("P_JINWEN", "timeline");
    await page.waitForSelector("details.event", { timeout: 30000 });
    const e076 = page.locator('details[data-eid="E076"]');
    await e076.waitFor({ timeout: 30000 });
    await e076.locator("summary").click();
    await e076.locator(".evt-body, .quote, .evt-role-note").first().waitFor({ timeout: 30000 }).catch(() => { });
    const e076Text = await e076.innerText();
    ok(e076Text.indexOf("婢") >= 0, "[r43渲] 生产渲染 E076 展开后含「婢」");
    ok(e076Text.indexOf("嬖") >= 0, "[r43渲] 生产渲染 E076 展开后含「嬖」");
    const e086 = page.locator('details[data-eid="E086"]');
    if (await e086.count()) {
      await e086.scrollIntoViewIfNeeded();
      note("印记（非断言）· E086（五鹿事件）标题行：" + (await e086.innerText()).split("\n")[0]);
    }

    /* 断言 2：秦穆公时间线，E084 展开后含與／简 34 */
    await goPerson("P_QINMU", "timeline");
    await page.waitForSelector("details.event", { timeout: 30000 });
    const e084 = page.locator('details[data-eid="E084"]');
    await e084.waitFor({ timeout: 30000 });
    await e084.scrollIntoViewIfNeeded();
    await e084.locator("summary").click();
    await e084.locator(".evt-body, .quote, .evt-role-note").first().waitFor({ timeout: 30000 }).catch(() => { });
    const e084Text = await e084.innerText();
    ok(e084Text.indexOf("與") >= 0, "[r43渲] 生产渲染 E084（秦穆公页）展开后含「與」");
    ok(e084Text.indexOf("简 34") >= 0, "[r43渲] 生产渲染 E084（秦穆公页）展开后含「简 34」");

    /* 断言 3／4：地图视图，五鹿落图且其投影合 §4 公式
     * ★ 旧本此处作 waitForTimeout(800)（裁三十一所记之同型固定等待），今改就绪闸：
     *   候 DATA 就绪 ＋ 地图 svg 已挂 ＋ 锚层非空。闸只判形与非空，不判量。
     * ★ 所期之 x／y 不再写死（旧本作 x≈708／y≈198）：跑时自本仓 places.json 取其经纬，
     *   照 conventions §4 公式回校。改点亦不必回改本文件——所锁者是投影之法在位。 */
    await goPerson("P_JINWEN", "map");
    try {
      await page.waitForFunction(() => {
        const svg = document.querySelector("#map-canvas svg");
        if (!svg) return false;
        const layer = svg.querySelector("#layer-anchors");
        if (!layer) return false;
        let any = false;
        for (const el of layer.querySelectorAll(".anchor")) { any = true; break; }
        return any;
      }, null, { timeout: READY_MS, polling: 120 });
      note("就绪闸过（P_JINWEN/map）：地图 svg 已挂、锚层非空");
    } catch (e) {
      throw new Error("就绪闸未过（P_JINWEN/map）：候 #map-canvas svg 已挂且 #layer-anchors 非空，"
        + READY_MS + "ms 内未至，**本本就此中止，不往下跑**。原由：" + e.message);
    }
    const wuluRow = readLocalJson("places.json").find((r) => r.id === "L_WULU");
    if (!wuluRow) throw new Error("本仓 places.json 内取不到 L_WULU——投影之所期无从算，中止。");
    const expX = (Number(wuluRow.lng) - 105.0) / 17.0 * 1200;
    const expY = 700 - (Number(wuluRow.lat) - 29.5) / 9.0 * 700;
    note("投影之所期（跑时算，照 conventions §4）：lng " + wuluRow.lng + "／lat " + wuluRow.lat
      + " → x≈" + expX.toFixed(1) + "／y≈" + expY.toFixed(1) + "（容差 " + PROJ_TOL_PX + "px）");
    const wuluCount = await page.locator('[data-place="L_WULU"]').count();
    ok(wuluCount > 0, "[r43渲] 生产地图渲染含五鹿标记（[data-place=L_WULU]）", "count=" + wuluCount);
    if (wuluCount > 0) {
      const dot = page.locator('[data-place="L_WULU"] circle.dot').first();
      const cx = Number(await dot.getAttribute("cx"));
      const cy = Number(await dot.getAttribute("cy"));
      ok(Math.abs(cx - expX) < PROJ_TOL_PX && Math.abs(cy - expY) < PROJ_TOL_PX,
        "[r43渲] 五鹿标记之投影合 §4 公式（所期跑时算，非写死）", "cx=" + cx + " cy=" + cy);
    } else {
      ok(false, "[r43渲] 五鹿标记之投影合 §4 公式", "标记不在，无从量");
    }

    ok(errs.length === 0, "渲染层三页无页面错误", errs.length ? errs.join(" | ") : "零");
    await browser.close();
  }

  if (server) server.close();
  head("=== " + (checks - fails) + " 过 / " + fails + " 红（共 " + checks + " 判）===");
  if (!fails) console.log("★ 全过。§一之绿意谓「生产所服之本与本仓所推之本逐表同数」；§二之绿意谓「其内容逐条在位」。");
  process.exit(fails ? 1 : 0);
})().catch((e) => {
  console.error("\n【本本自身出错 / 反证失效 / 依赖缺而未明示跳过】" + (e && e.message ? e.message : e));
  if (e && e.stack) console.error(e.stack.split(/\r?\n/).slice(1, 5).join("\n"));
  process.exit(2);
});
