/* 经纬春秋 · r46 走查门：通行字视图（站长「显示分层甲案」）实测
 *
 * 本门是「浏览器实测」四字的兑现——fix44c §7.1 乙所留之界（Sophia／Skipper 两侧皆
 * 数据侧静态实测、未启浏览器）至此销掉：「＝」（U+FF1D）与全角括注（U+FF08/FF09）
 * 之字形覆盖、行内对齐、窄屏断行，一律取**渲染后的实测值**，不看源码反推。
 *
 * 覆盖：
 *   §1 限域实证——全库遍历真数据，只 Q442／Q448 入转换域；Q167 一字未动（试金石）
 *   §2 真 DOM 三行逐行——默认呈通行字、按钮切换后逐字等于 quote_original
 *   §3 可复制性——选区实测：所见之形即所得之形（两态各取一次 selection.toString()）
 *   §4 字形覆盖——CDP getPlatformFontsForNode 实测「＝」「（）」落在哪一支字体、有无 .notdef
 *   §5 窄屏断行——320/360/390/680px 下可换段是否被拆行（含「不加 nowrap 会怎样」之对照实测）
 *   §6 交互可达——悬停单段就地换形、按钮键盘可达与触摸目标尺寸
 *   §7 无副作用——全库其余引文 DOM 与旧版同形（无 .q-seg、无切换钮）
 *   §8/§9/§10 人物视图复用同形、检索现况、地图卡片——任务书点名之三处回归面
 *
 * 用法：node tools/qa/vision_r46.js [baseURL]   默认 http://127.0.0.1:8791
 */
"use strict";
const { chromium } = require("playwright");
const BASE = process.argv[2] || "http://127.0.0.1:8791";
const BUST = "?v=" + Date.now();

let checks = 0, fails = 0;
function ok(cond, label, detail) {
  checks++;
  if (!cond) fails++;
  console.log("  " + (cond ? "✓" : "✗") + " " + label + (detail ? "  —— " + detail : ""));
}
/* 悬停实测须自己把鼠标放准：locator.boundingBox() 给的是**页面坐标**，
 * page.mouse.move() 收的是**视口坐标**——二者在滚动位不为 0 时相差一个 scrollY，
 * 首跑之所以时过时不过，正是栽在这里（走查脚本自己的毛病，不是站点的）。
 * 故一律：先滚进视口 → 取 getBoundingClientRect（视口坐标）→ 移鼠标 → 断言 :hover 真的落上。 */
async function hoverSeg(page, seg) {
  await seg.scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  const r = await seg.evaluate(el => el.getBoundingClientRect().toJSON());
  await page.mouse.move(r.left + r.width / 2, r.top + r.height / 2);
  await page.waitForTimeout(180);
  return seg.evaluate(el => el.matches(":hover"));
}
const EXPECT = {
  Q167: { scope: false },
  Q442: { scope: true, modern: "蔡哀侯取妻於陳，息侯亦取妻於陳，是息媯。息媯將歸于息，過蔡，蔡哀侯命止之，曰：「以同姓之故，必入。」息媯乃入于蔡，蔡哀侯妻之。息侯弗順，乃使人于楚文王曰：「君來伐我，我將求救於蔡，君焉敗之。」" },
  Q448: { scope: true, modern: "立六年，秦公率師與惠公戰于韓，止惠公以歸。惠公焉以其子懷公為執于秦，秦穆公以其子妻之。" },
};
const EID = { Q167: "E082", Q442: "E146", Q448: "E084" };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + "/index.html" + BUST + "#/chronicle", { waitUntil: "networkidle" });
  await page.waitForSelector("details[data-eid='E146']", { timeout: 15000 });

  /* ---------- §1 限域实证（全库真数据，跑站点自己的函数，不另抄一份规则） ---------- */
  const nPass = await page.evaluate(() => DATA.passages.length);
  console.log("\n§1 限域实证 —— 全库 " + nPass + " 行 quote_original");
  const scan = await page.evaluate(() => {
    const CAV = /^【([^】]+)】\s*/;
    const out = { inScope: [], withParen: [], withEq: [], changed: [], surrogate: [] };
    for (const q of DATA.passages) {
      const m = CAV.exec(q.modern_note || "");
      const cav = m ? m[1] : "";
      const t = q.quote_original || "";
      if (t.indexOf("（") >= 0) out.withParen.push(q.id);
      if (t.indexOf("＝") >= 0) out.withEq.push(q.id);
      if (/[\uD800-\uDBFF]/.test(t)) out.surrogate.push(q.id);
      const inS = cav.indexOf(DIPLO_SCOPE_MARK) >= 0;
      if (inS) out.inScope.push(q.id);
      const parts = inS ? diploParts(t) : null;
      if (parts && parts.some(x => x.diplo)) {
        out.changed.push({
          id: q.id,
          modern: parts.map(x => (x.plain !== undefined ? x.plain : x.modern)).join(""),
          roundtrip: parts.map(x => (x.plain !== undefined ? x.plain : x.diplo)).join("") === t,
          nEq: (t.match(/＝/g) || []).length,
        });
      }
    }
    return out;
  });
  ok(scan.withParen.join(",") === "Q167,Q442,Q448", "全库含全角括注者仍是三行", scan.withParen.join(" "));
  ok(scan.withEq.join(",") === "Q442", "全库含「＝」者仅 Q442", scan.withEq.join(" "));
  ok(scan.inScope.join(",") === "Q442,Q448", "入转换域者只 Q442/Q448（判据＝层标）", scan.inScope.join(" "));
  ok(scan.inScope.indexOf("Q167") < 0, "★ Q167 不在转换域（层标无「丙档·照录括注式」）");
  ok(scan.changed.length === 2, "实际发生转换者恰二行", scan.changed.map(c => c.id).join(" "));
  for (const c of scan.changed) {
    ok(c.modern === EXPECT[c.id].modern, c.id + " 通行字与 Sophia 数据侧实测全等");
    ok(c.roundtrip, c.id + " 原貌回拼逐字等于 quote_original（无一字丢失）");
    if (c.id === "Q442") ok(c.nEq === 3, "Q442 释文原貌仍含三「＝」", String(c.nEq));
  }
  ok(scan.surrogate.length === 0, "全库无 BMP 外汉字（代理对）——[㐀-鿿] 之界现网未触",
    scan.surrogate.length ? scan.surrogate.join(" ") : "0 行");

  /* ---------- §2/§3/§6 真 DOM 逐行 ---------- */
  console.log("\n§2 真 DOM 三行逐行 ＋ §3 可复制性 ＋ §6 交互可达");
  for (const qid of ["Q167", "Q442", "Q448"]) {
    const det = page.locator("details[data-eid='" + EID[qid] + "']");
    await det.locator("summary").click();
    await page.waitForTimeout(250);
    const bq = det.locator("blockquote[data-qid='" + qid + "']");
    const orig = await page.evaluate(id => DATA.passages.find(p => p.id === id).quote_original, qid);
    const segCount = await bq.locator(".q-seg").count();
    const btnCount = await bq.locator(".q-diplo-toggle").count();
    const shown = () => bq.locator("p.q-text").innerText();

    if (!EXPECT[qid].scope) {
      const t = await shown();
      ok(segCount === 0 && btnCount === 0, "★ " + qid + " 未被转换：无可换段、无切换钮", "seg=" + segCount + " btn=" + btnCount);
      ok(t === orig, "★ " + qid + " 渲染文本逐字等于 quote_original");
      ok(t.indexOf("殺悼子（卓子）") >= 0, "★ Q167「殺悼子（卓子）」括注完好，未压成「悼卓子」", t.slice(10, 26));
      continue;
    }
    ok(segCount > 0 && btnCount === 1, qid + " 有可换段与切换钮", "seg=" + segCount);
    ok((await shown()) === EXPECT[qid].modern, qid + " 默认态呈通行字");
    const sel1 = await bq.locator("p.q-text").evaluate(el => {
      const r = document.createRange(); r.selectNodeContents(el);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      const t = s.toString(); s.removeAllRanges(); return t;
    });
    ok(sel1 === EXPECT[qid].modern, qid + " 默认态选中所得＝通行字（display:none 不入选区）");

    await bq.locator(".q-diplo-toggle").focus();
    const focused = await page.evaluate(() => document.activeElement && document.activeElement.className);
    ok(String(focused).indexOf("q-diplo-toggle") >= 0, qid + " 切换钮可获焦点（键盘可达）", String(focused));
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    ok((await shown()) === orig, "★ " + qid + " 切至释文原貌后逐字等于 quote_original");
    const sel2 = await bq.locator("p.q-text").evaluate(el => {
      const r = document.createRange(); r.selectNodeContents(el);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      const t = s.toString(); s.removeAllRanges(); return t;
    });
    ok(sel2 === orig, "★ " + qid + " 原貌态选中所得＝释文原貌（可复制，非只可看）");
    ok((await bq.locator(".q-diplo-toggle").getAttribute("aria-pressed")) === "true", qid + " aria-pressed 随态更新");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    ok((await shown()) === EXPECT[qid].modern, qid + " 再按切回通行字（可逆）");

    const seg0 = bq.locator(".q-seg").first();
    const before = await seg0.innerText();
    const landed = await hoverSeg(page, seg0);
    const after = await seg0.innerText();
    ok(landed, qid + " 悬停确已落在可换段上（:hover 实测）");
    ok(before !== after && after.indexOf("（") >= 0, qid + " 悬停单段就地见其释文原貌", before + " → " + after);
    /* 换形会让该段变宽（1 字 → 4 字），须确认鼠标不因此掉出元素而抖动：
     * 停留半秒后仍是原貌，即无「张开→丢焦→收回→再张开」之循环。 */
    await page.waitForTimeout(500);
    ok((await seg0.innerText()) === after && (await seg0.evaluate(el => el.matches(":hover"))),
      qid + " 悬停态稳定不抖（换形致宽后鼠标仍在段内）");
    await page.mouse.move(0, 0);
    await page.waitForTimeout(150);
    ok((await seg0.innerText()) === before, qid + " 移开后复归通行字（悬停为预览、不粘连）");

    const box = await bq.locator(".q-diplo-toggle").boundingBox();
    ok(box.height >= 24 && box.width >= 56, qid + " 切换钮触摸目标 " + Math.round(box.width) + "×" + Math.round(box.height) + "px");
  }

  /* ---------- §4 字形覆盖（CDP 实测真实落地字体，非猜） ---------- */
  console.log("\n§4 字形覆盖 —— CDP getPlatformFontsForNode 实测");
  const client = await page.context().newCDPSession(page);
  await client.send("DOM.enable");
  await client.send("CSS.enable");
  await page.evaluate(() => {
    const p = document.querySelector("blockquote[data-qid='Q442'] p.q-text");
    const mk = (id, txt) => { const s = document.createElement("span"); s.id = id; s.textContent = txt; p.appendChild(s); };
    mk("__t_eq", "＝＝＝"); mk("__t_paren", "（（（）））"); mk("__t_han", "息息息"); mk("__t_tofu", "￾￾￾");
  });
  const doc = await client.send("DOM.getDocument", { depth: -1 });
  async function fontsOf(sel) {
    const n = await client.send("DOM.querySelector", { nodeId: doc.root.nodeId, selector: sel });
    const r = await client.send("CSS.getPlatformFontsForNode", { nodeId: n.nodeId });
    return r.fonts.map(f => f.familyName + "×" + f.glyphCount);
  }
  const fEq = await fontsOf("#__t_eq"), fPar = await fontsOf("#__t_paren"),
    fHan = await fontsOf("#__t_han"), fTofu = await fontsOf("#__t_tofu");
  console.log("    ＝(U+FF1D) → " + (fEq.join(" | ") || "(空)"));
  console.log("    （）(U+FF08/09) → " + (fPar.join(" | ") || "(空)"));
  console.log("    汉字「息」对照 → " + (fHan.join(" | ") || "(空)"));
  console.log("    必缺字 U+FFFE 对照 → " + (fTofu.join(" | ") || "(空)"));
  const fam = s => s.map(x => x.split("×")[0]);
  ok(fEq.length > 0 && fam(fEq)[0] === fam(fHan)[0], "「＝」与汉字同落一支字体（未回退到别的字体）", fam(fEq)[0] || "-");
  ok(fPar.length > 0 && fam(fPar)[0] === fam(fHan)[0], "全角括注与汉字同落一支字体", fam(fPar)[0] || "-");

  const geom = await page.evaluate(() => {
    const p = document.querySelector("blockquote[data-qid='Q442'] p.q-text");
    const w = id => {
      const el = document.getElementById(id);
      const r = el.getBoundingClientRect();
      return { w: r.width / el.textContent.length, top: r.top, h: r.height };
    };
    return { eq: w("__t_eq"), par: w("__t_paren"), han: w("__t_han"), tofu: w("__t_tofu"),
      font: getComputedStyle(p).fontFamily, size: getComputedStyle(p).fontSize, ls: getComputedStyle(p).letterSpacing };
  });
  console.log("    实测字体栈: " + geom.font + "  " + geom.size + "  字距 " + geom.ls);
  console.log("    单字推进宽  ＝:" + geom.eq.w.toFixed(2) + "px  （）:" + geom.par.w.toFixed(2) +
    "px  息:" + geom.han.w.toFixed(2) + "px  U+FFFE(豆腐):" + geom.tofu.w.toFixed(2) + "px");
  ok(Math.abs(geom.eq.w - geom.han.w) < 1.2, "「＝」为全角推进宽、与汉字等宽（未落半角形）");
  ok(Math.abs(geom.par.w - geom.han.w) < 1.2, "全角括注为全角推进宽、与汉字等宽");
  /* 推进宽在 CJK 字体里辨不出豆腐——SimSun 的 .notdef 方框亦是全角，与汉字同宽（首跑实测：
   * ＝/（）/息/U+FFFE 四者推进宽俱为 14.72px，且 CDP 连 U+FFFE 都报作 SimSun）。
   * 故豆腐之判改取**位图实证**：同字体同字号栅格化后比对墨迹签名——
   * 「＝」若真落 .notdef，其位图当与 U+FFFE 之空心方框一模一样。 */
  const ink = await page.evaluate(fontFam => {
    const sig = ch => {
      const c = document.createElement("canvas"); c.width = 64; c.height = 64;
      const x = c.getContext("2d");
      x.clearRect(0, 0, 64, 64);
      x.font = "40px " + fontFam;
      x.textBaseline = "top"; x.fillStyle = "#000";
      x.fillText(ch, 8, 8);
      const d = x.getImageData(0, 0, 64, 64).data;
      let n = 0, h = 2166136261;
      for (let i = 3; i < d.length; i += 4) {
        const on = d[i] > 16 ? 1 : 0;
        if (on) n++;
        h = ((h ^ (on ? (i >> 2) & 255 : 0)) * 16777619) >>> 0;
      }
      return { n, h };
    };
    return { eq: sig("＝"), lp: sig("（"), rp: sig("）"), han: sig("息"), tofu: sig("￾"), blank: sig(" ") };
  }, geom.font);
  console.log("    位图墨迹（40px 栅格化，墨点数/签名）  ＝:" + ink.eq.n + "/" + ink.eq.h +
    "  （:" + ink.lp.n + "/" + ink.lp.h + "  ）:" + ink.rp.n + "/" + ink.rp.h +
    "  息:" + ink.han.n + "/" + ink.han.h + "  U+FFFE:" + ink.tofu.n + "/" + ink.tofu.h + "  空格:" + ink.blank.n);
  ok(ink.eq.n > 0 && ink.eq.h !== ink.tofu.h, "★「＝」位图非 .notdef 方框（真有字形，非豆腐）", ink.eq.n + " 墨点");
  ok(ink.lp.n > 0 && ink.lp.h !== ink.tofu.h && ink.rp.n > 0 && ink.rp.h !== ink.tofu.h, "★ 全角括注位图非 .notdef 方框");
  ok(ink.eq.h !== ink.lp.h && ink.eq.h !== ink.han.h, "三者位图互异（未被同一兜底字形冒充）");
  ok(Math.abs(geom.eq.top - geom.han.top) < 0.6 && Math.abs(geom.eq.h - geom.han.h) < 1.2, "「＝」与汉字同行、行高未被撑开");
  await page.evaluate(() => ["__t_eq", "__t_paren", "__t_han", "__t_tofu"].forEach(i => { const e = document.getElementById(i); if (e) e.remove(); }));

  /* ---------- §5 窄屏断行 ---------- */
  console.log("\n§5 窄屏断行实测");
  for (const W of [320, 360, 390, 680]) {
    await page.setViewportSize({ width: W, height: 900 });
    await page.waitForTimeout(300);
    const det = page.locator("details[data-eid='E146']");
    if ((await det.locator("blockquote").count()) === 0) { await det.locator("summary").click(); await page.waitForTimeout(250); }
    const r = await page.evaluate(() => {
      const segs = [...document.querySelectorAll("blockquote[data-qid='Q442'] .q-seg")];
      const split = segs.filter(s => s.getClientRects().length > 1).map(s => s.innerText);
      const wo = [];
      for (const s of segs) { s.style.whiteSpace = "normal"; if (s.getClientRects().length > 1) wo.push(s.innerText); s.style.whiteSpace = ""; }
      return { n: segs.length, split, wo, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
    });
    ok(r.split.length === 0, W + "px：可换段无一被拆行（共 " + r.n + " 段）", r.split.join(" / ") || "0 处");
    ok(r.sw <= r.cw + 1, W + "px：页面无横向溢出", r.sw + " ≤ " + r.cw);
    console.log("    〔对照〕" + W + "px 若去掉 nowrap，会被拆行者：" + (r.wo.length ? r.wo.join(" / ") : "无"));

    await page.locator("blockquote[data-qid='Q442'] .q-diplo-toggle").click();
    await page.waitForTimeout(200);
    const r2 = await page.evaluate(() => {
      const segs = [...document.querySelectorAll("blockquote[data-qid='Q442'] .q-seg")];
      return { split: segs.filter(s => s.getClientRects().length > 1).map(s => s.innerText),
        wo: (() => { const o = []; for (const s of segs) { s.style.whiteSpace = "normal"; if (s.getClientRects().length > 1) o.push(s.innerText); s.style.whiteSpace = ""; } return o; })(),
        sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
    });
    ok(r2.split.length === 0 && r2.sw <= r2.cw + 1, W + "px 原貌态：不拆行、不溢出", (r2.split.join(" / ") || "0 处") + "，" + r2.sw + "≤" + r2.cw);
    console.log("    〔对照〕" + W + "px 原貌态若去掉 nowrap，会被拆行者：" + (r2.wo.length ? r2.wo.join(" / ") : "无"));
    await page.locator("blockquote[data-qid='Q442'] .q-diplo-toggle").click();
    await page.waitForTimeout(150);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.locator("blockquote[data-qid='Q442']").scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await page.screenshot({ path: "tools/qa/screenshots/r46_q442_390_modern.png", clip: await page.locator("blockquote[data-qid='Q442']").boundingBox() });
  await page.locator("blockquote[data-qid='Q442'] .q-diplo-toggle").click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: "tools/qa/screenshots/r46_q442_390_diplo.png", clip: await page.locator("blockquote[data-qid='Q442']").boundingBox() });
  await page.locator("blockquote[data-qid='Q442'] .q-diplo-toggle").click();
  console.log("    截图：tools/qa/screenshots/r46_q442_390_{modern,diplo}.png");

  /* ---------- §7 无副作用：全库其余引文同形 ---------- */
  console.log("\n§7 无副作用 —— 全库其余引文");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(200);
  await page.evaluate(() => { document.querySelectorAll("details[data-eid]").forEach(d => { d.open = true; }); });
  await page.waitForTimeout(1500);
  const all = await page.evaluate(() => {
    const out = { total: 0, withSeg: [], withBtn: [], mismatch: [] };
    const byId = {};
    for (const q of DATA.passages) byId[q.id] = q;
    for (const bq of document.querySelectorAll("blockquote[data-qid]")) {
      out.total++;
      const id = bq.dataset.qid;
      if (bq.querySelector(".q-seg")) out.withSeg.push(id);
      if (bq.querySelector(".q-diplo-toggle")) out.withBtn.push(id);
      else {
        const t = bq.querySelector("p.q-text").innerText;
        if (t !== byId[id].quote_original) out.mismatch.push(id);
      }
    }
    return out;
  });
  console.log("    编年视图全展开，实渲 blockquote " + all.total + " 条");
  ok([...new Set(all.withSeg)].sort().join(",") === "Q442,Q448", "带可换段者只 Q442/Q448", [...new Set(all.withSeg)].join(" ") || "-");
  ok([...new Set(all.withBtn)].sort().join(",") === "Q442,Q448", "带切换钮者只 Q442/Q448", [...new Set(all.withBtn)].join(" ") || "-");
  ok(all.mismatch.length === 0, "其余引文渲染文本逐字等于 quote_original（零影响）", all.mismatch.slice(0, 5).join(" ") || "0 处");

  /* ---------- §8 人物视图同形（引文块两处复用，不得分叉） ---------- */
  console.log("\n§8 人物视图复用同形");
  await page.goto(BASE + "/index.html" + BUST + "#/p/P_XIGUI/timeline", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  /* 息妫线上 E146 出现两次（时间线主条＋「远因」条），故一律取 .first()——
   * 严格模式撞见二元素是走查脚本自己的事，不是站点的事。 */
  const hasE146 = await page.locator("details[data-eid='E146']").count();
  if (hasE146) {
    await page.locator("details[data-eid='E146'] summary").first().click();
    await page.waitForTimeout(400);
    const bq = page.locator("blockquote[data-qid='Q442']").first();
    const t = await bq.locator("p.q-text").innerText();
    ok(t === EXPECT.Q442.modern, "人物视图 Q442 默认亦呈通行字（两处同形）", t.slice(0, 12) + "…");
    await bq.locator(".q-diplo-toggle").click();
    await page.waitForTimeout(250);
    const t2 = await bq.locator("p.q-text").innerText();
    const orig = await page.evaluate(() => DATA.passages.find(p => p.id === "Q442").quote_original);
    ok(t2 === orig, "人物视图 Q442 切换后逐字等于 quote_original");
    ok((await page.locator("blockquote[data-qid='Q167']").count()) === 0 || true, "（Q167 不在本人物线，见 §2）");
    checks--;  // 上一条只是记事，不计分
  } else {
    console.log("    （该人物线未挂 E146，跳过——非失败）");
  }

  /* ---------- §9 检索回归（本件未动检索，只把现况量下来） ---------- */
  console.log("\n§9 检索回归");
  await page.goto(BASE + "/index.html" + BUST + "#/chronicle", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const sq = await page.evaluate(() => {
    const norm = typeof searchNorm === "function" ? searchNorm : (x => x);
    const hits = k => SEARCH_INDEX.filter(r => r.group === "passages" && r.text.indexOf(norm(k)) >= 0).length;
    const q442row = SEARCH_INDEX.find(r => r.group === "passages" && r.label.indexOf("郶") >= 0);
    return {
      total: SEARCH_INDEX.filter(r => r.group === "passages").length,
      xiGui: hits("息媯"), xiHou: hits("息侯"), saiXi: hits("賽息"), han: hits("戰于韓"),
      label: q442row ? q442row.label : null,
    };
  });
  console.log("    检索索引引文组 " + sq.total + " 条；命中数 息媯:" + sq.xiGui + " 息侯:" + sq.xiHou +
    " 賽息:" + sq.saiXi + " 戰于韓:" + sq.han);
  console.log("    Q442 下拉摘要仍作释文原貌：「" + sq.label + "」");
  ok(sq.total === 440, "检索引文组仍收全库 440 条（未因本件增减）", String(sq.total));
  ok(sq.xiGui > 0 && sq.han > 0, "检索照常可用（「息媯」「戰于韓」俱有命中）");
  ok(sq.saiXi === 0, "「賽息」不命中——丙档既有代价，非本件所生（任务书明记不必修）");
  ok(sq.label !== null && sq.label.indexOf("郶（蔡）") === 0, "★ 检索下拉摘要未改，仍取 quote_original 首 24 字（留作待裁）", sq.label);
  const sbox = page.locator("#global-search");
  await sbox.fill("息媯");
  await page.waitForTimeout(600);
  const uiRes = await page.evaluate(() => {
    const pop = document.querySelector("#search-pop");
    return { hidden: pop.hidden, n: pop.querySelectorAll("[role='option'], li, button").length, first: (pop.textContent || "").slice(0, 40) };
  });
  ok(!uiRes.hidden && uiRes.n > 0, "检索框实敲「息媯」有结果落下", uiRes.n + " 项：" + uiRes.first);
  await sbox.fill("");

  /* ---------- §10 地图卡片回归 ---------- */
  console.log("\n§10 地图卡片回归");
  await page.goto(BASE + "/index.html" + BUST + "#/p/P_XIGUI/map", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  /* 各屏是并存的 <section hidden>，DOM 不销毁——故统计须**限在 #view-map 之内**，
   * 否则数到的是隔壁时间线屏里那几条（首跑即如此：全页 bq=5，限域后 0）。 */
  const mp = await page.evaluate(() => {
    const v = document.querySelector("#view-map");
    return {
      shown: !v.hidden,
      svg: !!v.querySelector("#map-canvas svg"),
      anchors: v.querySelectorAll("#layer-anchors *").length,
      bq: v.querySelectorAll("blockquote").length,
      seg: v.querySelectorAll(".q-seg").length,
      btn: v.querySelectorAll(".q-diplo-toggle").length,
      pagewide: document.querySelectorAll("blockquote").length,
    };
  });
  ok(mp.shown && mp.svg && mp.anchors > 0, "息妫地图仍正常出图", "锚点节点 " + mp.anchors + " 个");
  ok(mp.bq === 0 && mp.seg === 0 && mp.btn === 0, "地图屏内本就不呈引文，故与本件无涉（实测零 blockquote）",
    "#view-map 内 bq=" + mp.bq + "（全页含隐藏屏 " + mp.pagewide + "）");
  const placePanel = await page.evaluate(() => {
    const b = document.querySelector("#layer-anchors circle, #layer-anchors [data-pid]");
    if (b) b.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
  });
  await page.waitForTimeout(500);
  const mp2 = await page.evaluate(() => {
    const v = document.querySelector("#view-map");
    return { txt: (v.querySelector(".place-panel, [class*='place']") || {}).textContent || "",
      bq: v.querySelectorAll("blockquote").length };
  });
  ok(placePanel && mp2.bq === 0, "点开地点卡片后地图屏仍无引文块（卡片走的是另一路渲染）",
    "卡片文字 " + (mp2.txt.slice(0, 20) || "(空)"));

  /* ---------- §11 无障碍树实测（「原貌始终可达」这条硬承诺，须量不须猜） ----------
   * 用 CDP Accessibility 域取**平台无障碍树**，不用 page.accessibility——
   * 后者在本仓所锁的 Playwright 1.62 已移除（首跑即 TypeError，走查脚本自己的事）。 */
  console.log("\n§11 无障碍树实测");
  await page.goto(BASE + "/index.html" + BUST + "#/chronicle", { waitUntil: "networkidle" });
  await page.waitForSelector("#view-chronicle details[data-eid='E146']", { timeout: 15000 });
  await page.locator("#view-chronicle details[data-eid='E146'] summary").click();
  await page.waitForTimeout(500);
  const ax = await page.context().newCDPSession(page);
  await ax.send("DOM.enable");
  await ax.send("Accessibility.enable");
  async function axOf(sel) {
    const d = await ax.send("DOM.getDocument", { depth: -1 });
    const n = await ax.send("DOM.querySelector", { nodeId: d.root.nodeId, selector: sel });
    if (!n.nodeId) return null;
    const r = await ax.send("Accessibility.getPartialAXTree", { nodeId: n.nodeId, fetchRelatives: false });
    const node = r.nodes && r.nodes[0];
    if (!node) return null;
    const prop = k => { const pp = (node.properties || []).find(x => x.name === k); return pp ? pp.value.value : undefined; };
    return { role: node.role && node.role.value, name: node.name && node.name.value, pressed: prop("pressed") };
  }
  const BTN = "#view-chronicle blockquote[data-qid='Q442'] .q-diplo-toggle";
  const TXT = "#view-chronicle blockquote[data-qid='Q442'] p.q-text";
  const axBefore = await axOf(BTN);
  console.log("    切换钮（默认态）role=" + (axBefore && axBefore.role) + " name=「" + (axBefore && axBefore.name) + "」 pressed=" + (axBefore && axBefore.pressed));
  ok(!!axBefore && axBefore.role === "button", "切换钮以 button 角色出现在无障碍树", axBefore && axBefore.role);
  ok(!!axBefore && String(axBefore.pressed) === "false", "默认态 aria-pressed=false 已被暴露", String(axBefore && axBefore.pressed));
  ok(!!axBefore && axBefore.name === "释文原貌视图（整理本括注式，含重文符「＝」）", "切换钮可读之名取自 aria-label", axBefore && axBefore.name);

  const axTxt1 = await page.evaluate(sel => document.querySelector(sel).innerText, TXT);
  ok(axTxt1.indexOf("賽") < 0 && axTxt1.indexOf("＝") < 0, "默认态可及文本为通行字（无「賽」无「＝」）");

  await page.locator(BTN).click();
  await page.waitForTimeout(400);
  const axAfter = await axOf(BTN);
  console.log("    切换钮（原貌态）name=「" + (axAfter && axAfter.name) + "」 pressed=" + (axAfter && axAfter.pressed));
  ok(!!axAfter && String(axAfter.pressed) === "true", "按下后 aria-pressed=true 已被暴露", String(axAfter && axAfter.pressed));
  ok(!!axAfter && axAfter.name === axBefore.name, "两态可读之名一致（读屏者不会听成两个控件）");
  const axTxt2 = await page.evaluate(sel => document.querySelector(sel).innerText, TXT);
  ok(axTxt2.indexOf("賽") >= 0 && axTxt2.indexOf("＝") >= 0,
    "★ 原貌态下释文原貌（含「賽」与「＝」）确已可及——读屏者亦取得到原貌", axTxt2.slice(0, 24) + "…");
  await page.locator(BTN).click();
  await page.waitForTimeout(300);

  const tabStops = await page.evaluate(() => {
    const bq = document.querySelector("#view-chronicle blockquote[data-qid='Q442']");
    return { segTabbable: bq.querySelectorAll(".q-seg[tabindex]").length,
      focusables: bq.querySelectorAll("button, [href], input, [tabindex]:not([tabindex='-1'])").length,
      segTitled: bq.querySelectorAll(".q-seg[title]").length };
  });
  ok(tabStops.segTabbable === 0 && tabStops.focusables === 1,
    "整条引文只占 1 个 Tab 位（即切换钮），可换段不各占一位", JSON.stringify(tabStops));
  ok(tabStops.segTitled === 4, "四处可换段各带 title 原生浮字（鼠标一路之补充）", String(tabStops.segTitled));

  await browser.close();
  console.log("\n合计 " + checks + " 项，" + (fails ? fails + " 项未过" : "全过") + "\n");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
