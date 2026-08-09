/* 经纬春秋 · r26b 徽记撞形实测（Vision）
 *
 * 为什么要有这个脚本：国色制（design_notes §2.0）下徽记是「个人身份的唯一色外锚点」，
 * 撞形的代价比旧制高一个量级；而 r24a 立子产徽记时否决「刑鼎」用的判据是**实测 silhouette**，
 * 不是观感。本脚本把那次的手工比对固化下来——此后每加一枚徽记，跑它一次即可。
 *
 * 口径（两处刻意不含糊）：
 *  ① **剥去外圈**。48×48 的 `<circle r="21">` 是 27+ 枚共有的框，留着它 IoU 会被统一抬高，
 *     把「都有个圆框」读成「像」。本脚本先移除外圈，只比**纹样**——那才是逐人通道所在。
 *  ② **双尺度、且各按其真实呈现线宽**：
 *     24px 取源文件 stroke-width=2（选人卡/子导航/时间线一带的小尺度呈现）；
 *     22px 取 PANO_BADGE_SW=2.6（全景环内嵌徽记的呈现端覆盖值，见 app.js）。
 *     线宽不同则墨量不同，同一对徽记在两尺度上的相似度可以不同向，故两档都报。
 *
 * 指标：IoU（交并比，二值墨迹）。另报「墨量比」以便看出是不是一方几乎盖住另一方。
 * 判据（本轮自定，写入 design_notes 备后续沿用）：
 *   任一尺度 IoU ≥ 0.55 → 撞形，须改形；0.45–0.55 → 存疑，逐对肉眼复核并记录；< 0.45 → 通过。
 *   基线由现库 27 枚两两实测给出（见输出的「现库最紧对」），新枚不得比现库最紧对更紧。
 *
 * 跑法：node tools/qa/badge_silhouette_r26b.js
 */
const fs = require("fs"), path = require("path");
const ICONS = path.resolve(__dirname, "..", "..", "site", "assets", "icons");
const OUT = path.resolve(__dirname, "screenshots");

const NEW = ["badge_yanying", "badge_shuxiang"];
const NAMES = {
  badge_wenjiang: "文姜·涡纹", badge_qixiang: "齐襄公·雷纹", badge_qihuan: "齐桓公·连环三盟",
  badge_guanzhong: "管仲·衡轻重", badge_baoshuya: "鲍叔牙·税械", badge_qixi: "齐僖公·载书入坎",
  badge_yanying: "晏婴·幅（新）",
  badge_luyin: "鲁隐公·鱼纹", badge_luhuan: "鲁桓公·圭璧", badge_luzhuang: "鲁庄公·鼓纹",
  badge_caogui: "曹刿·辙", badge_zhengzhuang: "郑庄公·蟠虺", badge_zhengzhao: "郑昭公·翎矢",
  badge_wujiang: "武姜·掘地及泉", badge_jizhong: "祭仲·执圭秉政", badge_zichan: "子产·壞館之垣",
  badge_jinwen: "晋文公·济河之舟", badge_jiezhitui: "介之推·文之渐隐", badge_liji: "骊姬·觚鸩",
  badge_shuxiang: "叔向·昧旦（新）",
  badge_qinmu: "秦穆公·崤函之险", badge_muji: "穆姬·薪火", badge_chucheng: "楚成王·凤纹",
  badge_chuzhuang: "楚庄王·问鼎", badge_xigui: "息妫·桃花", badge_zhuangjiang: "庄姜·双燕",
  badge_xuanjiang: "宣姜·新台临河", badge_songxiang: "宋襄公·泓上之旆", badge_xiaji: "夏姬·四徙之途",
};
/* 24px 类别图标一并入表——徽记与类别图标不同尺度、不同语境，跨尺度关系是第二位的
 * （design_notes §4），但「论对＝牍」「政制＝矩绳」两枚新近才立，仍值得报数留痕。 */
const CATS = ["lundui", "zhengzhi", "qita", "waijiao", "zaiyi", "xianghui", "huimeng"];

(async () => {
  const { chromium } = require("playwright");
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: { width: 400, height: 200 } });

  const badges = Object.keys(NAMES);
  const files = {};
  for (const b of [...badges, ...CATS]) {
    const fp = path.join(ICONS, b + ".svg");
    if (!fs.existsSync(fp)) { console.log("缺文件：" + b); continue; }
    files[b] = fs.readFileSync(fp, "utf8");
  }

  /* 渲染一枚：剥去外圈 <circle …r="21">，覆盖 stroke-width，画到 size×size 的 canvas，
   * 回传二值墨迹（alpha>32 视为有墨）。用 canvas 而非截图，避免页面缩放/DPR 干扰。 */
  async function mask(svgText, size, sw, stripRing) {
    return p.evaluate(async ({ svgText, size, sw, stripRing }) => {
      let s = svgText;
      if (stripRing) s = s.replace(/<circle cx="24" cy="24" r="21"\s*\/>/, "");
      s = s.replace(/stroke-width="2"/, 'stroke-width="' + sw + '"');
      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
      const c = document.createElement("canvas");
      c.width = size; c.height = size;
      const g = c.getContext("2d");
      g.clearRect(0, 0, size, size);
      g.drawImage(img, 0, 0, size, size);
      const d = g.getImageData(0, 0, size, size).data;
      const m = [];
      for (let i = 0; i < size * size; i++) m.push(d[i * 4 + 3] > 32 ? 1 : 0);
      return m;
    }, { svgText, size, sw, stripRing });
  }
  const iou = (a, b) => {
    let inter = 0, uni = 0;
    for (let i = 0; i < a.length; i++) { if (a[i] || b[i]) uni++; if (a[i] && b[i]) inter++; }
    return uni ? inter / uni : 0;
  };
  const ink = (a) => a.reduce((s, v) => s + v, 0);

  const SCALES = [
    { size: 24, sw: 2, label: "24px（源线宽 2 · 选人/时间线一带）" },
    { size: 22, sw: 2.6, label: "22px（PANO_BADGE_SW 2.6 · 全景环）" },
  ];

  const report = {};
  for (const sc of SCALES) {
    console.log("\n=============== " + sc.label + " ===============");
    const masks = {};
    for (const b of badges) masks[b] = await mask(files[b], sc.size, sc.sw, true);

    /* 现库基线：27 枚旧徽记两两 IoU 的**全分布**，不只取最紧一对。
     * 只报绝对阈值会失真——22px×2.6 是重墨区，人人都糊，现库自己的最紧对就到 0.60；
     * 拿一条固定线去卡新枚，等于用一个在本尺度上无人达标的标准判它不合格。
     * 故判据改「相对现库」：新枚最紧对须 ≤ 现库最紧对，并报出「现库有几对比它更紧」。 */
    const old = badges.filter(b => !NEW.includes(b));
    const oldPairs = [];
    for (let i = 0; i < old.length; i++) for (let j = i + 1; j < old.length; j++)
      oldPairs.push({ v: iou(masks[old[i]], masks[old[j]]), a: old[i], b: old[j] });
    oldPairs.sort((x, y) => y.v - x.v);
    const base = oldPairs[0];
    const q = (f) => oldPairs[Math.floor(oldPairs.length * f)].v;
    console.log("现库 " + old.length + " 枚 " + oldPairs.length + " 对：最紧 " +
                NAMES[base.a] + " × " + NAMES[base.b] + " " + base.v.toFixed(3) +
                "；P90 " + q(0.10).toFixed(3) + "；中位 " + q(0.50).toFixed(3) + "   ← 基线分布");
    const tighter = (v) => oldPairs.filter(o => o.v > v).length;

    for (const n of NEW) {
      const rows = badges.filter(b => b !== n)
        .map(b => ({ b, v: iou(masks[n], masks[b]) }))
        .sort((x, y) => y.v - x.v);
      console.log("\n【" + NAMES[n] + "】墨量 " + ink(masks[n]) + "px；最近 6 枚：");
      rows.slice(0, 6).forEach(r => console.log(
        "   " + r.v.toFixed(3) + "  " + NAMES[r.b] + "（墨量 " + ink(masks[r.b]) + "）"));
      const worst = rows[0];
      const nT = tighter(worst.v);
      const verdict = worst.v > base.v ? "⚠ 紧于现库最紧对·须改形"
        : nT >= oldPairs.length * 0.02 ? "通过（现库尚有 " + nT + " 对比它更紧）"
        : "通过·但已进现库最紧 2%（现库仅 " + nT + " 对比它更紧），记观察";
      console.log("   → 最紧 " + worst.v.toFixed(3) + "（" + NAMES[worst.b] + "）：" + verdict);
      report[n + "@" + sc.size] = { worst: worst.v, with: NAMES[worst.b], base: base.v, tighter: nT, verdict };
    }

    // 任务书点名的两对，无论排名第几都单列报数
    /* 任务书点名两对，＋ 一对由本脚本自己揪出来、值得单列的：叔向「昧旦」×武姜「掘地及泉」
     * ——二者同为「一横线＋一半圆」，只差半圆在线上还是线下，是本批最该交代的形近关系。 */
    const NAMED = [["badge_shuxiang", "badge_zichan"], ["badge_yanying", "badge_guanzhong"],
                   ["badge_shuxiang", "badge_wujiang"], ["badge_yanying", "badge_qixiang"]];
    console.log("\n  —— 点名逐对 ——");
    for (const [a, b] of NAMED) {
      const v = iou(masks[a], masks[b]);
      console.log("   " + NAMES[a] + " × " + NAMES[b] + " IoU " + v.toFixed(3) +
                  "（" + (v < 0.45 ? "通过" : v < 0.55 ? "存疑" : "撞形") + "）");
      report["named:" + a + "×" + b + "@" + sc.size] = v;
    }
    // 同弧邻座（同国者同色，撞形代价最高）：齐 7 人、晋 4 人组内两两
    const QI = ["badge_wenjiang", "badge_qixiang", "badge_qihuan", "badge_guanzhong", "badge_baoshuya", "badge_qixi", "badge_yanying"];
    const JIN = ["badge_jinwen", "badge_jiezhitui", "badge_liji", "badge_shuxiang"];
    for (const [nm, grp] of [["齐组 7 人", QI], ["晋组 4 人", JIN]]) {
      let w = { v: -1 };
      for (let i = 0; i < grp.length; i++) for (let j = i + 1; j < grp.length; j++) {
        const v = iou(masks[grp[i]], masks[grp[j]]);
        if (v > w.v) w = { v, a: grp[i], b: grp[j] };
      }
      console.log("   " + nm + "（同国同色，撞形代价最高）组内最紧：" +
                  NAMES[w.a] + " × " + NAMES[w.b] + " IoU " + w.v.toFixed(3));
      report["grp:" + nm + "@" + sc.size] = w.v;
    }
  }

  // 24px 与类别图标的跨尺度报数（第二位判据，只留痕）
  console.log("\n=============== 跨尺度留痕：新徽记 × 24px 类别图标 ===============");
  const m24 = {};
  for (const b of [...NEW, ...CATS]) m24[b] = await mask(files[b], 24, 2, true);
  for (const n of NEW) {
    const rows = CATS.map(c => ({ c, v: iou(m24[n], m24[c]) })).sort((x, y) => y.v - x.v);
    console.log("【" + NAMES[n] + "】" + rows.map(r => r.c + " " + r.v.toFixed(3)).join("  "));
  }

  // 出图：两档对照网格（含新枚与其最近邻），供人眼复核
  for (const sc of SCALES) {
    const cells = badges.map(b => ({ b, name: NAMES[b] }));
    await p.setViewportSize({ width: 1180, height: 560 });
    await p.setContent(`<body style="margin:0;background:#F4EDDF;font:12px/1.6 system-ui,sans-serif;color:#2E2A24">
      <div style="padding:14px 16px;font-size:14px">徽记 silhouette 对照 · ${sc.label} · 剥外圈</div>
      <div style="display:flex;flex-wrap:wrap;gap:14px;padding:0 16px 16px">
      ${cells.map(c => `<div style="width:98px;text-align:center">
        <div style="height:${sc.size + 8}px;display:flex;align-items:center;justify-content:center;color:${NEW.includes(c.b) ? "#BC4433" : "#2E2A24"}">
          ${files[c.b].replace(/<circle cx="24" cy="24" r="21"\s*\/>/, "").replace(/stroke-width="2"/, 'stroke-width="' + sc.sw + '"').replace("<svg ", `<svg width="${sc.size}" height="${sc.size}" `)}
        </div>
        <div style="font-size:10px;color:#7A7166">${c.name}</div></div>`).join("")}
      </div></body>`);
    await p.screenshot({ path: path.join(OUT, "r26b_badges_" + sc.size + "px.png"), fullPage: true });
  }
  console.log("\n对照图：screenshots/r26b_badges_24px.png、r26b_badges_22px.png");
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
