/* 经纬春秋 · r32 走查门：J 层（出土文献）徽标专属色落地实测
 *
 * 判据一律取**渲染后的实测值**（getComputedStyle / elementFromPoint），不看截图反推、
 * 不与源码里的字面量对读——源码写对而落地未生效（选择器被覆盖、类没挂上）正是本门要抓的。
 *
 * 覆盖：
 *   §1 Q442 徽标确已换装：layer-chutu 类挂上、徽标色 == --excav、左线同色且为实线、淡底非默认朱底
 *   §2 同页并置可辨：同页《左传》条目（原文/言论）徽标与左线与 J 条对读，ΔE76 逐对报数
 *   §3 六档全档并置（合成页外的真实页面里凑不齐六档，故此节在编年视图内跨条目取样）
 *   §4 移动端 390px：徽标不换行、不溢出、不被 float 挤出卡外；字号与几何与桌面同
 *   §5 事件卡三态（常态／summary hover／summary active）下徽标色与其底色对比度实测
 *   §6 单点管理对账：站内出现的层色字面量只能来自 CSS 变量（页面上不得出现写死的 #544614 以外来源）
 *
 * 用法：node tools/qa/vision_r32.js [baseURL]   默认 http://127.0.0.1:8791
 */
"use strict";
const { chromium } = require("playwright");

const BASE = process.argv[2] || "http://127.0.0.1:8791";
let fails = 0, checks = 0;
function ok(cond, label, detail) {
  checks++;
  if (!cond) fails++;
  console.log("  " + (cond ? "✓" : "✗") + " " + label + (detail ? "  —— " + detail : ""));
}

/* 色彩数学（与 tools/qa/quote_layer_color_r32.js 同源口径） */
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
function parseRGB(s) {
  const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/.exec(s);
  if (!m) throw new Error("解析不了颜色：" + s);
  return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
}
const hex = ([r, g, b]) => "#" + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
function lab(rgb) {
  const [r, g, b] = rgb.slice(0, 3).map(lin);
  const X = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const Y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  const Z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const fx = f(X / 0.95047), fy = f(Y), fz = f(Z / 1.08883);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
const dE = (a, b) => { const A = lab(a), B = lab(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };
const relLum = (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
const contrast = (a, b) => {
  const la = relLum(a), lb = relLum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
const over = (f, b) => [0, 1, 2].map(i => f[i] * f[3] + b[i] * (1 - f[3]));

/* 在页面里把某事件卡展开，并取回其引文块的实测样式 */
const PROBE = `(qid) => {
  const bq = document.querySelector('blockquote.quote[data-qid="' + qid + '"]');
  if (!bq) return null;
  const badge = bq.querySelector('.q-layer');
  const cs = getComputedStyle(bq);
  const r = bq.getBoundingClientRect();
  const card = bq.closest('.event');
  const out = {
    cls: bq.className,
    borderLeftColor: cs.borderLeftColor,
    borderLeftStyle: cs.borderLeftStyle,
    borderLeftWidth: cs.borderLeftWidth,
    background: cs.backgroundColor,
    cardBg: card ? getComputedStyle(card).backgroundColor : null,
    badge: null,
    caveat: null,
  };
  if (badge) {
    const bs = getComputedStyle(badge);
    // elementFromPoint 用的是**视口坐标**：徽标若滚出视口则恒返回 null，
    // 那是取样点没落在屏上，不是徽标被压住。故先把徽标本身滚进视口再取点。
    badge.scrollIntoView({ block: "center" });
    const br = badge.getBoundingClientRect();
    out.badge = {
      text: badge.textContent, color: bs.color, borderColor: bs.borderTopColor,
      fontSize: bs.fontSize, w: br.width, h: br.height,
      right: br.right, top: br.top,
      // 徽标中心是否真的命中徽标自身（float 溢出／被压住都会在此暴露）
      hit: (() => { const el = document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2); return el === badge || badge.contains(el); })(),
      insideCard: card ? (br.right <= card.getBoundingClientRect().right + 0.5 && br.left >= card.getBoundingClientRect().left - 0.5) : null,
      lines: Math.round(br.height / parseFloat(bs.lineHeight || bs.fontSize)),
    };
  }
  const cv = bq.querySelector('.q-caveat');
  if (cv) { const s = getComputedStyle(cv); out.caveat = { color: s.color, text: cv.textContent.slice(0, 24) }; }
  return out;
}`;

/* 首访三步引导（.tour）是覆盖全页的浮层——它盖住取样点会让 elementFromPoint 命中引导层，
 * 那是「引导没关」而不是「徽标被压住」。故取点类断言之前一律先关引导，且**先断言它确已消失**，
 * 免得关不掉时把假阳性读成通过。 */
async function dismissTour(page) {
  /* #tour 恒在 DOM 里、以 hidden 属性开合，故判据取**是否真的显示**（有布局盒），
   * 不取「节点是否存在」——后者恒真，会把一个永远为真的检查伪装成通过。 */
  const shown = () => page.evaluate(() => {
    const t = document.getElementById("tour");
    return !!t && !t.hidden && !!t.getClientRects().length;
  });
  if (!(await shown())) return true;
  await page.click("#tour-skip").catch(() => {});
  await page.waitForTimeout(250);
  const still = await shown();
  if (still) console.log("  ！首访引导未能关闭，取点类断言会失真");
  return !still;
}

/* 先在首页把引导关掉再进人物页：「跳过」按站点设计会**回到首页**（v0.11 起如此），
 * 在人物页上关它等于被弹回首页，后续等待必然超时。故顺序是 首页→关引导→进人物页。 */
async function enter(page) {
  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  await page.waitForTimeout(500);
  await dismissTour(page);
}

async function openPersonEvent(page, personId, eventId) {
  await enter(page);
  await page.goto(BASE + "/index.html#/p/" + personId + "/timeline", { waitUntil: "load" });
  await page.waitForSelector(".event", { timeout: 15000 });
  await page.waitForTimeout(300);
  const opened = await page.evaluate((eid) => {
    const d = document.querySelector('details.event[data-eid="' + eid + '"]') ||
      [...document.querySelectorAll("details.event")].find(x => x.dataset.eid === eid || x.id === eid);
    if (!d) return false;
    d.open = true;
    d.scrollIntoView({ block: "center" });
    return true;
  }, eventId);
  await page.waitForTimeout(250);
  return opened;
}

(async () => {
  const browser = await chromium.launch();
  console.log("=== r32 走查门：出土文献层徽标专属色（base " + BASE + "）===\n");

  /* ---- 先取 CSS 变量的权威值，全门断言一律与它对读，不与硬编码字面量对读 ---- */
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(BASE + "/index.html", { waitUntil: "load" });
  const EXCAV = parseRGB(await page.evaluate(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--excav").trim();
    const d = document.createElement("div"); d.style.color = v; document.body.appendChild(d);
    const c = getComputedStyle(d).color; d.remove(); return c;
  }));
  console.log("【0】--excav 实测值 = " + hex(EXCAV));
  if (hex(EXCAV) === "#000000") { console.log("  ✗ --excav 未定义或解析失败，后续断言无意义"); process.exit(1); }

  console.log("\n【一】息妫页 E146 · Q442（清华简《系年》）徽标换装实测");
  const opened = await openPersonEvent(page, "P_XIGUI", "E146");
  ok(opened, "E146 事件卡在息妫时间线上找到并展开");
  const q442 = await page.evaluate(eval("(" + PROBE + ")"), "Q442");
  ok(!!q442, "Q442 引文块已渲染");
  if (q442) {
    ok(/layer-chutu/.test(q442.cls), "挂上 layer-chutu 档", q442.cls);
    ok(!!q442.badge && q442.badge.text === "出土文献", "徽标文字为「出土文献」", q442.badge && q442.badge.text);
    const bc = parseRGB(q442.badge.color);
    ok(dE(bc, EXCAV) < 0.5, "徽标色 == --excav", hex(bc) + " vs " + hex(EXCAV));
    const blc = parseRGB(q442.borderLeftColor);
    ok(dE(blc, EXCAV) < 0.5, "左线同色", hex(blc));
    ok(q442.borderLeftStyle === "solid", "左线为实线（非后出叙事的虚线）", q442.borderLeftStyle);
    ok(parseFloat(q442.borderLeftWidth) >= 5, "带编者层标故左线加粗一档（§3.6）", q442.borderLeftWidth);
    // 淡底：合成后须明显偏离「默认朱底」
    const cardBg = parseRGB(q442.cardBg);
    const tint = over(parseRGB(q442.background), cardBg);
    const cinnabarTint = over([188, 68, 51, 0.05], cardBg);
    ok(dE(tint, cinnabarTint) >= 1.5, "淡底已非默认朱底", "本档 " + hex(tint) + " vs 朱底 " + hex(cinnabarTint) + " ΔE " + dE(tint, cinnabarTint).toFixed(2));
    const cAgainstTint = contrast(EXCAV, tint);
    ok(cAgainstTint >= 4.5, "徽标对自身淡底对比度 ≥4.5（AA 小字）", cAgainstTint.toFixed(2));
    ok(!!q442.caveat, "编者层标同卡呈现（§3.6）", q442.caveat && q442.caveat.text);
    if (q442.caveat) {
      const cvc = parseRGB(q442.caveat.color);
      ok(dE(cvc, EXCAV) >= 13.2, "层徽标与编者层标可分（编者语态不被层色吞掉）", "ΔE " + dE(cvc, EXCAV).toFixed(2));
    }
    ok(q442.badge.hit, "徽标中心 elementFromPoint 命中徽标自身（未被压住/未溢出）");
    ok(q442.badge.insideCard !== false, "徽标未溢出事件卡左右边界");
  }

  console.log("\n【二】同页并置：Q442 与同页《左传》各条徽标/左线逐对实测");
  const sameCard = await page.evaluate(() => {
    const out = [];
    for (const bq of document.querySelectorAll("blockquote.quote")) {
      const badge = bq.querySelector(".q-layer");
      out.push({
        qid: bq.dataset.qid,
        layer: (bq.className.match(/layer-[a-z]+/) || ["（默认·原文）"])[0],
        line: getComputedStyle(bq).borderLeftColor,
        badge: badge ? getComputedStyle(badge).color : null,
        badgeText: badge ? badge.textContent : "（无徽标）",
      });
    }
    return out;
  });
  console.log("  同页引文 " + sameCard.length + " 条：");
  let minPair = { d: Infinity };
  for (const q of sameCard) {
    const line = parseRGB(q.line);
    const d = dE(line, EXCAV);
    if (q.qid !== "Q442" && d < minPair.d) minPair = { d, qid: q.qid, layer: q.layer };
    console.log("    " + String(q.qid).padEnd(7) + q.layer.padEnd(16) + " 左线 " + hex(line).padEnd(9) +
      " 徽标 " + (q.badge ? hex(parseRGB(q.badge)) : "  —      ") + " 「" + q.badgeText + "」" +
      (q.qid === "Q442" ? "  ← 本轮新色" : "  对 J 层 ΔE " + d.toFixed(2)));
  }
  ok(minPair.d >= 13.2, "同页最紧一对（J 层 × " + minPair.qid + " " + minPair.layer + "）ΔE76 ≥13.2", minPair.d.toFixed(2));

  console.log("\n【三】事件卡三态下，徽标对其实际底色的对比度（常态／hover／active）");
  const states = await page.evaluate(() => {
    const d = [...document.querySelectorAll("details.event")].find(x => x.querySelector('blockquote[data-qid="Q442"]'));
    const bq = d.querySelector('blockquote[data-qid="Q442"]');
    const card = getComputedStyle(d).backgroundColor;
    return { card, quoteBg: getComputedStyle(bq).backgroundColor };
  });
  {
    const cardBg = parseRGB(states.card);
    const tint = over(parseRGB(states.quoteBg), cardBg);
    /* hover/active 只作用于 summary（引文在 details 体内，不受其底色影响）——
     * 故此处把两种 hover 底也算一遍作压力项：即便日后底色策略改变，数值也已在案。 */
    const rows = [
      ["常态（引文淡底叠卡面）", tint],
      ["〔压力项〕卡头 hover 底 5% 暖赭", over([180, 101, 47, 0.05], cardBg)],
      ["〔压力项〕卡头 active 底 10% 暖赭", over([180, 101, 47, 0.10], cardBg)],
    ];
    for (const [n, bg] of rows) {
      const c = contrast(EXCAV, bg);
      ok(c >= 4.5, n.padEnd(28) + " 对比度 " + c.toFixed(2) + " ≥4.5");
    }
  }
  await page.close();

  console.log("\n【四】编年视图内六档跨条目并置（真实页面里凑齐各档只能在此）");
  const cpage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await enter(cpage);
  await cpage.goto(BASE + "/index.html#/chronicle", { waitUntil: "load" });
  await cpage.waitForSelector(".chron-row", { timeout: 15000 });
  /* 编年卡体是**按 toggle 事件幂等构建**的（app.js §7 体例二：DOM 可弃、用时重建），
   * 与时间线的即时构建不同——程序化置 open=true 后须让出一帧，引文才进 DOM。
   * 不让这一帧，本节会读到 0 条引文而误报「编年未换装」。 */
  await cpage.evaluate(() => { for (const d of document.querySelectorAll("details.event")) d.open = true; });
  await cpage.waitForFunction(() => document.querySelectorAll("blockquote.quote").length > 0, null, { timeout: 15000 });
  await cpage.waitForTimeout(400);
  const tiers = await cpage.evaluate(() => {
    const seen = new Map();
    for (const bq of document.querySelectorAll("blockquote.quote")) {
      const key = (bq.className.match(/layer-[a-z]+/) || ["default"])[0];
      if (seen.has(key)) continue;
      const badge = bq.querySelector(".q-layer");
      seen.set(key, {
        key, qid: bq.dataset.qid, text: badge ? badge.textContent : "（原文·无徽标）",
        color: badge ? getComputedStyle(badge).color : getComputedStyle(bq).borderLeftColor,
      });
    }
    return [...seen.values()];
  });
  console.log("  编年全表内出现的档共 " + tiers.length + " 种：");
  const seenColors = [];
  for (const t of tiers) {
    const c = parseRGB(t.color);
    console.log("    " + t.key.padEnd(16) + " " + hex(c) + "  「" + t.text + "」（" + t.qid + "）");
    seenColors.push({ key: t.key, c });
  }
  ok(tiers.some(t => t.key === "layer-chutu"), "出土文献档在编年视图内亦已换装（同源组件，不该只对一处生效）");
  let worst = { d: Infinity };
  for (let i = 0; i < seenColors.length; i++) for (let j = i + 1; j < seenColors.length; j++) {
    const d = dE(seenColors[i].c, seenColors[j].c);
    if (d < worst.d && seenColors[i].key !== seenColors[j].key) worst = { d, a: seenColors[i].key, b: seenColors[j].key };
  }
  console.log("  跨档最紧一对：" + worst.a + " × " + worst.b + " ΔE76 " + worst.d.toFixed(2));
  ok(worst.d >= 13.2 || /yanlun|pinglun|houchu/.test(worst.a + worst.b),
    "跨档最紧对 ≥13.2（言论/评论/后出叙事三者本就同色、由线型相分，属例外）", worst.d.toFixed(2));
  await cpage.close();

  console.log("\n【五】移动端 390px 实测（徽标几何与命中）");
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await openPersonEvent(m, "P_XIGUI", "E146");
  const mq = await m.evaluate(eval("(" + PROBE + ")"), "Q442");
  ok(!!mq && !!mq.badge, "390px 下 Q442 徽标仍渲染");
  if (mq && mq.badge) {
    ok(mq.badge.lines === 1, "徽标单行不折（「出土文献」四字，与既有最长的「后出叙事」等长）", "行数 " + mq.badge.lines + "，高 " + mq.badge.h.toFixed(1) + "px");
    ok(mq.badge.hit, "徽标中心 elementFromPoint 命中自身");
    ok(mq.badge.insideCard !== false, "徽标未溢出卡片左右边界");
    const dm = await m.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    ok(dm.sw <= dm.cw + 1, "页面无横向溢出", dm.sw + " / " + dm.cw);
    const bc = parseRGB(mq.badge.color);
    ok(dE(bc, EXCAV) < 0.5, "移动端徽标色与桌面同（未被媒体查询改写）", hex(bc));
    ok(Math.abs(parseFloat(mq.badge.fontSize) - 0.66 * 16) < 0.6, "字号仍 0.66rem", mq.badge.fontSize);
  }
  await m.close();

  console.log("\n【六】单点管理对账：站内该层色只经 --excav 一处");
  const p2 = await browser.newPage();
  await p2.goto(BASE + "/styles.css", { waitUntil: "load" });
  const css = await p2.evaluate(() => document.body.innerText);
  const literals = (css.match(/#544614/gi) || []).length;
  const rgbaLit = (css.match(/rgba\(\s*84\s*,\s*70\s*,\s*20/gi) || []).length;
  ok(literals === 1, "层色 hex 字面量在 styles.css 中仅出现 1 次（即 --excav 定义处）", "出现 " + literals + " 次");
  ok(rgbaLit === 1, "淡底 rgba 字面量仅 1 次（CSS 变量无法参与 rgba 拆分，同 --poem 之例）", "出现 " + rgbaLit + " 次");
  await p2.close();

  await browser.close();
  console.log("\n=== 合计 " + checks + " 项，失败 " + fails + " 项 ===");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error("走查门异常：", e); process.exit(2); });
