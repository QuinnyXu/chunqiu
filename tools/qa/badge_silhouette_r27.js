/* 经纬春秋 · r27 徽记撞形实测（Vision）
 *
 * 沿用 r26b 立下的口径（design_notes §2.5.1），一字未改，只把名录扩到 31 枚、
 * NEW 换成本轮两枚（阖庐·鱼中之剑／伍员·耒）：
 *  ① **剥去外圈**（48×48 的 <circle r="21"> 是各枚共有的框，留着会把「都有个圆框」读成「像」）；
 *  ② **双尺度、各按其真实呈现线宽**：24px 取源文件 stroke-width=2；22px 取 PANO_BADGE_SW=2.6。
 * 判据取**相对现库分布**、不设绝对阈值：新枚在任一尺度的最紧对，不得紧于现库同尺度的最紧对；
 * 并报出「现库尚有几对比它更紧」以定位其在分布中的位置。
 *
 * 跑法：node tools/qa/badge_silhouette_r27.js
 */
const fs = require("fs"), path = require("path");
const ICONS = path.resolve(__dirname, "..", "..", "site", "assets", "icons");
const OUT = path.resolve(__dirname, "screenshots");

const NEW = ["badge_helu", "badge_wuyuan"];
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
  badge_helu: "阖庐·鱼中之剑（新）", badge_wuyuan: "伍员·耒（新）",
};
/* 24px 类别图标一并入表——跨尺度关系是第二位判据（design_notes §4），只留痕报数。 */
const CATS = ["lundui", "zhengzhi", "qita", "waijiao", "zaiyi", "xianghui", "huimeng", "zhanzheng", "shisha", "chuben"];

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

    /* 点名逐对：
     *  阖庐×鲁隐公「鱼纹」——本批最须交代的一对（同取鱼形，仅国色不同、形必须自证可分）；
     *  阖庐×晋文公「济河之舟」——同为「一物浮于下、一竖立于上」的构图；
     *  伍员×叔向「昧旦」／武姜「掘地及泉」——同有一道横地线；
     *  伍员×曹刿「辙」——同为地面上的直线器物；
     *  伍员×秦穆公「崤函之险」——同为长斜线主导。 */
    const NAMED = [["badge_helu", "badge_luyin"], ["badge_helu", "badge_jinwen"],
                   ["badge_wuyuan", "badge_shuxiang"], ["badge_wuyuan", "badge_wujiang"],
                   ["badge_wuyuan", "badge_caogui"], ["badge_wuyuan", "badge_qinmu"],
                   ["badge_helu", "badge_wuyuan"]];
    console.log("\n  —— 点名逐对 ——");
    for (const [a, b] of NAMED) {
      const v = iou(masks[a], masks[b]);
      console.log("   " + NAMES[a] + " × " + NAMES[b] + " IoU " + v.toFixed(3) +
                  "（相对现库最紧 " + base.v.toFixed(3) + "：" + (v > base.v ? "⚠ 更紧" : "松") + "）");
    }
    /* 同弧邻座（同国者同色，撞形代价最高）：齐 7、晋 4、鲁 4、郑 5、楚 3、吴 2 */
    const GRP = {
      "齐组 7 人": ["badge_wenjiang", "badge_qixiang", "badge_qihuan", "badge_guanzhong", "badge_baoshuya", "badge_qixi", "badge_yanying"],
      "鲁组 4 人": ["badge_luyin", "badge_luhuan", "badge_luzhuang", "badge_caogui"],
      "郑组 5 人": ["badge_zhengzhuang", "badge_zhengzhao", "badge_wujiang", "badge_jizhong", "badge_zichan"],
      "晋组 4 人": ["badge_jinwen", "badge_jiezhitui", "badge_liji", "badge_shuxiang"],
      "楚组 3 人": ["badge_chucheng", "badge_chuzhuang", "badge_xigui"],
      "吴组 2 人（本轮新立）": ["badge_helu", "badge_wuyuan"],
    };
    for (const [nm, grp] of Object.entries(GRP)) {
      let w = { v: -1 };
      for (let i = 0; i < grp.length; i++) for (let j = i + 1; j < grp.length; j++) {
        const v = iou(masks[grp[i]], masks[grp[j]]);
        if (v > w.v) w = { v, a: grp[i], b: grp[j] };
      }
      console.log("   " + nm + " 组内最紧：" + NAMES[w.a] + " × " + NAMES[w.b] + " IoU " + w.v.toFixed(3));
    }
  }

  console.log("\n=============== 跨尺度留痕：新徽记 × 24px 类别图标 ===============");
  const m24 = {};
  for (const b of [...NEW, ...CATS]) m24[b] = await mask(files[b], 24, 2, true);
  for (const n of NEW) {
    const rows = CATS.map(c => ({ c, v: iou(m24[n], m24[c]) })).sort((x, y) => y.v - x.v);
    console.log("【" + NAMES[n] + "】" + rows.map(r => r.c + " " + r.v.toFixed(3)).join("  "));
  }

  for (const sc of SCALES) {
    const cells = badges.map(b => ({ b, name: NAMES[b] }));
    await p.setViewportSize({ width: 1180, height: 620 });
    await p.setContent(`<body style="margin:0;background:#F4EDDF;font:12px/1.6 system-ui,sans-serif;color:#2E2A24">
      <div style="padding:14px 16px;font-size:14px">徽记 silhouette 对照 · ${sc.label} · 剥外圈 · r27（31 枚）</div>
      <div style="display:flex;flex-wrap:wrap;gap:14px;padding:0 16px 16px">
      ${cells.map(c => `<div style="width:98px;text-align:center">
        <div style="height:${sc.size + 8}px;display:flex;align-items:center;justify-content:center;color:${NEW.includes(c.b) ? "#BC4433" : "#2E2A24"}">
          ${files[c.b].replace(/<circle cx="24" cy="24" r="21"\s*\/>/, "").replace(/stroke-width="2"/, 'stroke-width="' + sc.sw + '"').replace("<svg ", `<svg width="${sc.size}" height="${sc.size}" `)}
        </div>
        <div style="font-size:10px;color:#7A7166">${c.name}</div></div>`).join("")}
      </div></body>`);
    await p.screenshot({ path: path.join(OUT, "r27_badges_" + sc.size + "px.png"), fullPage: true });
  }
  console.log("\n对照图：screenshots/r27_badges_24px.png、r27_badges_22px.png");
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
