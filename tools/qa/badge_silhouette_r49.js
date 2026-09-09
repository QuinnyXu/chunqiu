/* 经纬春秋 · r49 徽记撞形实测（Vision）——孔子·胡簋定稿复跑
 *
 * 口径一字照 design_notes §2.5.1（v2.10 现行本），只把名录扩到 34 枚、NEW 换成本轮一枚：
 *  ① **剥去外圈**（48×48 的 <circle r="21"> 是各枚共有的框，留着会把「都有个圆框」读成「像」）；
 *  ② **三尺度、各按其真实呈现线宽**（v2.10 站长二裁补第三档）：
 *     24px 取源文件 stroke-width=2（选人卡／子导航／时间线一带）；
 *     22px 取 PANO_BADGE_SW=2.6（全景环）；
 *     18px 取源文件 2（首页地图国色块徽记簇，全站唯一无逐人姓名之场所，线宽未覆盖）。
 * 判据取**相对现库分布**、不设绝对阈值：新枚在任一尺度的最紧对，不得紧于现库同尺度的最紧对；
 * 并报出「现库尚有几对比它更紧」以定位其在分布中的位置。
 * 本轮另有一条自证（r26b/r27 惯例，r49 任务 1 指名）：**新枚不得抬高任何一族组内最紧对**，
 * 鲁弧（孔子所入之弧）逐档前后对比单列。
 *
 * 定稿 SVG 已随 r49 任务 7 升位件入库 site/assets/icons/badge_kongzi.svg（领队裁定三 过裁）。
 * 故 KONGZI_SRC 即取 ICONS 目录，与其余 33 枚同源。
 *
 * 跑法：cd tools/qa && node badge_silhouette_r49.js
 */
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..", "..");
const ICONS = path.join(ROOT, "site", "assets", "icons");
const KONGZI_SRC = path.join(ICONS, "badge_kongzi.svg");
const OUT = path.resolve(__dirname, "screenshots");

const NEW = ["badge_kongzi"];
const NAMES = {
  badge_wenjiang: "文姜·涡纹", badge_qixiang: "齐襄公·雷纹", badge_qihuan: "齐桓公·连环三盟",
  badge_guanzhong: "管仲·衡轻重", badge_baoshuya: "鲍叔牙·税械", badge_qixi: "齐僖公·载书入坎",
  badge_yanying: "晏婴·幅",
  badge_luyin: "鲁隐公·鱼纹", badge_luhuan: "鲁桓公·圭璧", badge_luzhuang: "鲁庄公·鼓纹",
  badge_caogui: "曹刿·辙", badge_zhengzhuang: "郑庄公·蟠虺", badge_zhengzhao: "郑昭公·翎矢",
  badge_wujiang: "武姜·掘地及泉", badge_jizhong: "祭仲·执圭秉政", badge_zichan: "子产·壞館之垣",
  badge_jinwen: "晋文公·济河之舟", badge_jiezhitui: "介之推·文之渐隐", badge_liji: "骊姬·觚鸩",
  badge_shuxiang: "叔向·昧旦",
  badge_qinmu: "秦穆公·崤函之险", badge_muji: "穆姬·薪火", badge_chucheng: "楚成王·凤纹",
  badge_chuzhuang: "楚庄王·问鼎", badge_xigui: "息妫·桃花", badge_zhuangjiang: "庄姜·双燕",
  badge_xuanjiang: "宣姜·新台临河", badge_songxiang: "宋襄公·泓上之旆", badge_xiaji: "夏姬·四徙之途",
  badge_helu: "阖庐·鱼中之剑", badge_wuyuan: "伍员·耒",
  badge_fucha: "夫差·庭中之表", badge_goujian: "勾践·甲楯",
  badge_kongzi: "孔子·胡簋（新）",
};
/* 24px 类别图标一并入表——跨尺度关系是第二位判据（design_notes §4），只留痕报数。
   本轮尤须留痕者：huimeng（会盟＝鼎），与新枚同为礼器同尺度。 */
const CATS = ["lundui", "zhengzhi", "qita", "waijiao", "zaiyi", "xianghui", "huimeng", "zhanzheng", "shisha", "chuben"];
/* 同弧邻座（同国者同色，撞形代价最高）。孔子入鲁弧为第 5 人。 */
const GRP = {
  "齐组 7 人": ["badge_wenjiang", "badge_qixiang", "badge_qihuan", "badge_guanzhong", "badge_baoshuya", "badge_qixi", "badge_yanying"],
  "鲁组 4→5 人": ["badge_luyin", "badge_luhuan", "badge_luzhuang", "badge_caogui"],
  "郑组 5 人": ["badge_zhengzhuang", "badge_zhengzhao", "badge_wujiang", "badge_jizhong", "badge_zichan"],
  "晋组 4 人": ["badge_jinwen", "badge_jiezhitui", "badge_liji", "badge_shuxiang"],
  "楚组 3 人": ["badge_chucheng", "badge_chuzhuang", "badge_xigui"],
  "吴组 3 人": ["badge_helu", "badge_wuyuan", "badge_fucha"],
};
const LU = GRP["鲁组 4→5 人"];

(async () => {
  const { chromium } = require("playwright");
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: { width: 400, height: 200 } });

  const badges = Object.keys(NAMES);
  const files = {};
  for (const b of [...badges, ...CATS]) {
    const fp = b === "badge_kongzi" ? KONGZI_SRC : path.join(ICONS, b + ".svg");
    if (!fs.existsSync(fp)) { console.log("缺文件：" + b); continue; }
    files[b] = fs.readFileSync(fp, "utf8");
  }

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
    { size: 24, sw: 2, label: "24px（源线宽 2 · 选人/子导航/时间线一带）" },
    { size: 22, sw: 2.6, label: "22px（PANO_BADGE_SW 2.6 · 全景环）" },
    { size: 18, sw: 2, label: "18px（源线宽 2 · 首页地图徽记簇，v2.10 补立第三档）" },
  ];

  for (const sc of SCALES) {
    console.log("\n=============== " + sc.label + " ===============");
    const masks = {};
    for (const b of badges) masks[b] = await mask(files[b], sc.size, sc.sw, true);

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
    }

    /* 点名逐对（r49 本枚最须自证可分的几组）：
     *  孔子×问鼎——本枚立案时唯一被点名的撞形风险（簋与鼎同为双耳礼器）；
     *  孔子×鲁弧四枚——同国同色，撞形代价最高，且此弧是任务 1 测出的真瓶颈；
     *  孔子×齐襄公「雷纹」／宣姜「新台临河」——探针阶段之近邻，定稿须复看；
     *  孔子×鲁桓公「圭璧」——同为「上有器、下有座」的纵向构图；
     *  孔子×管仲「衡轻重」／介之推「文之渐隐」／息妫「桃花」——三档中曾入最近 6 枚者。 */
    const NAMED = [["badge_kongzi", "badge_chuzhuang"],
                   ["badge_kongzi", "badge_luyin"], ["badge_kongzi", "badge_luhuan"],
                   ["badge_kongzi", "badge_luzhuang"], ["badge_kongzi", "badge_caogui"],
                   ["badge_kongzi", "badge_qixiang"], ["badge_kongzi", "badge_xuanjiang"],
                   ["badge_kongzi", "badge_guanzhong"], ["badge_kongzi", "badge_jiezhitui"],
                   ["badge_kongzi", "badge_xigui"]];
    console.log("\n  —— 点名逐对 ——");
    for (const [a, b] of NAMED) {
      const v = iou(masks[a], masks[b]);
      console.log("   " + NAMES[a] + " × " + NAMES[b] + " IoU " + v.toFixed(3) +
                  "（相对现库最紧 " + base.v.toFixed(3) + "：" + (v > base.v ? "⚠ 更紧" : "松") + "）");
    }

    /* 各族组内最紧：逐组报「加入新枚前／后」，自证未使任何一族可辨性变差 */
    console.log("\n  —— 各族组内最紧（前 → 后）——");
    const worstOf = (grp) => {
      let w = { v: -1 };
      for (let i = 0; i < grp.length; i++) for (let j = i + 1; j < grp.length; j++) {
        const v = iou(masks[grp[i]], masks[grp[j]]);
        if (v > w.v) w = { v, a: grp[i], b: grp[j] };
      }
      return w;
    };
    for (const [nm, grp] of Object.entries(GRP)) {
      const before = worstOf(grp);
      const after = grp === LU ? worstOf([...grp, "badge_kongzi"]) : before;
      const tag = grp === LU
        ? (after.v > before.v + 1e-9
            ? "⚠ 被抬高 " + before.v.toFixed(3) + " → " + after.v.toFixed(3)
            : "不抬高（仍 " + after.v.toFixed(3) + "）")
        : "（新枚不入本弧，不变）";
      console.log("   " + nm + "：" + NAMES[before.a] + " × " + NAMES[before.b] + " " +
                  before.v.toFixed(3) + "  → " + tag +
                  (grp === LU ? "；含新枚后最紧对＝" + NAMES[after.a] + " × " + NAMES[after.b] : ""));
    }
  }

  console.log("\n=============== 跨尺度留痕：新徽记 × 24px 类别图标 ===============");
  const m24 = {};
  for (const b of [...NEW, ...CATS]) m24[b] = await mask(files[b], 24, 2, true);
  for (const n of NEW) {
    const rows = CATS.map(c => ({ c, v: iou(m24[n], m24[c]) })).sort((x, y) => y.v - x.v);
    console.log("【" + NAMES[n] + "】" + rows.map(r => r.c + " " + r.v.toFixed(3)).join("  "));
  }
  const mDing = await mask(files["badge_chuzhuang"], 24, 2, true);
  console.log("（对照：问鼎 × huimeng 会盟鼎 " + iou(mDing, m24["huimeng"]).toFixed(3) + "）");

  for (const sc of SCALES) {
    const cells = badges.map(b => ({ b, name: NAMES[b] }));
    await p.setViewportSize({ width: 1180, height: 620 });
    await p.setContent(`<body style="margin:0;background:#F4EDDF;font:12px/1.6 system-ui,sans-serif;color:#2E2A24">
      <div style="padding:14px 16px;font-size:14px">徽记 silhouette 对照 · ${sc.label} · 剥外圈 · r49（34 枚）</div>
      <div style="display:flex;flex-wrap:wrap;gap:14px;padding:0 16px 16px">
      ${cells.map(c => `<div style="width:98px;text-align:center">
        <div style="height:${sc.size + 8}px;display:flex;align-items:center;justify-content:center;color:${NEW.includes(c.b) ? "#BC4433" : "#2E2A24"}">
          ${files[c.b].replace(/<circle cx="24" cy="24" r="21"\s*\/>/, "").replace(/stroke-width="2"/, 'stroke-width="' + sc.sw + '"').replace("<svg ", `<svg width="${sc.size}" height="${sc.size}" `)}
        </div>
        <div style="font-size:10px;color:#7A7166">${c.name}</div></div>`).join("")}
      </div></body>`);
    await p.screenshot({ path: path.join(OUT, "r49_badges_" + sc.size + "px.png"), fullPage: true });
  }
  console.log("\n对照图：screenshots/r49_badges_24px.png、r49_badges_22px.png、r49_badges_18px.png");
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
