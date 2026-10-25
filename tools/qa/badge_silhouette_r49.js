/* 【退出码】（r61-X 补，裁二百三十一 二4；照 prod_freshness.js 门头之式）
 *   0 ＝ 量成且无判红；1 ＝ 判红——本门之判据（相对现库：新枚任一尺度之最紧对不得紧于现库同尺度之最紧对）有不合者，
 *        即任一新枚之 verdict 为「⚠ 紧于现库最紧对·须改形」；
 *   2 ＝ 本门自身出错（浏览器起不来、徽记文件读不到等抛错，`.catch` 出）。
 *   ★ 余者（「通过·但已进现库最紧 2%…记观察」、点名逐对之 IoU 与「通过／存疑／撞形」或「更紧／松」之注、同弧组内最紧）俱为记实，不入退出码。
 *   ★ 此前本门「须改形」只印不判、恒 exit 0，抛错以 1 退——自 r61-X 起三分如上。
 */
/* 〔r62-U-丙 改〕名录 49→53：纳秦、晋、楚、鲁四人（NEW，裁二百六十三 四；站长「照荐」§一百七十六，俱取甲稿）——蹇叔·二陵（badge_jianshu，Q646）、
 * 怀嬴·沃盥（badge_huaiying，Q648／Q092）、申包胥·庭墙（badge_shenbaoxu，Q374）、哀姜·柩车（badge_aijiang，Q750／Q749）。
 * GRP 显式同步：秦组 2→3 自此入 GRP（显式书三枚）；晋组 8→9（加怀嬴）；楚组 4→5（加申包胥）；鲁组 8→9（加哀姜）。
 * 点名逐对改为四枚出稿时三尺度之近邻（阖庐、夏姬、息妫、韩厥、子产、宋襄公、齐桓公、鲁庄公、管仲、齐襄公·雷纹、鲍叔牙、定姜、赵盾）
 * 及秦组秦穆公、穆姬，楚组楚成王，鲁组季文子、曹刿，并孔子·胡簋（design_notes §2.5：鲁组增枚须复测）。判据、三尺度、线宽一字未动。
 * 鲁齐五人自此不再标「新」。出稿之量见 team/r62U_bing_drafts/silhouette_output.txt。
 *
 * 〔r62-U-乙 改〕名录 44→49：纳鲁齐五人（NEW，裁二百四十九 二；站长示可 §一百十七 二2，俱取甲稿）——季文子·马不食粟（badge_jiwenzi，Q777／Q778）、
 * 穆姜·艮（badge_mujiang，Q782）、叔孙豹·裂帛（badge_shusunbao，Q788）、崔杼·大宫（badge_cuizhu，Q276）、陈恒·鞭（badge_chenheng，Q720）。
 * GRP 显式同步：齐组 6→8（加崔杼、陈恒）；鲁组改书其实——旧键「鲁组 4→5 人」只列四枚（孔子 r49 入鲁弧而未入此单），今显式书 8 枚（含孔子），
 * 即出稿所量「鲁组 8 枚组内最紧」之同一集。点名逐对改为五枚出稿时三尺度之近邻（齐襄公·雷纹、宋襄公、息妫、鲍叔牙、庄姜、宣姜、管仲、伍员）
 * 及鲁组之鲁隐公、曹刿，并孔子·胡簋（design_notes §2.5：鲁组增枚须复测）。判据、三尺度、线宽一字未动。卫五人自此不再标「新」。
 * 出稿之量见 team/r62VU_yi_drafts/silhouette_output.txt。
 *
 * 〔r62-U-甲 改〕名录 39→44：纳卫五人（NEW，裁二百四十七 站长示可 §一百〇七）——甯武子·饘（badge_ningwuzi，Q838）、孙林父·并登（badge_sunlinfu，Q780）、
 * 定姜·释兆（badge_dingjiang，Q814）、卫献公·射鸿（badge_weixiangong，Q815）、蒯聩·戈（badge_kuaikui，Q852）；卫组 2→7 人，自此入 GRP（显式加之）。
 * 点名逐对改为五枚出稿时三尺度之近邻（息妫·桃花、鲁隐公、晋文公、楚庄王·问鼎、祁奚、子产、鲍叔牙、鲁庄公、齐襄公·雷纹）及卫组旧二枚，
 * 并孔子·胡簋（design_notes §2.5：卫组再增纵向闭合廓形之枚须复测）。判据、三尺度、线宽一字未动。许穆夫人自此不再标「新」。
 * 出稿之量见 team/r62U_jia_drafts/silhouette_output.txt。
 *
 * 〔r62-S 改〕名录 38→39：纳许穆夫人·册（badge_xumu，NEW，站长择定甲稿，§九十一；取 Q056「許穆夫人賦載馳」）；许组 1 人，无组内对，故不入 GRP
 * （GRP 之组内最紧须二枚以上）；点名逐对改为许穆夫人对出稿时三尺度之近邻（息妫·桃花、齐襄公·雷纹、鲁隐公、子产、郑庄公）及卫组二枚（其母国、其母）。
 * 判据、三尺度、线宽一字未动。楚昭王自此不再标「新」。出稿之量见 team/r62S_drafts/silhouette_output.txt。
 *
 * 〔r62-M 改〕名录 38→38：去齐僖公·载书入坎（降二级，badge_qixi.svg 留档不删，只解其挂）、纳楚昭王·望山（NEW，站长择定甲稿，裁二百四十三 三1）；
 * 齐组 7→6、楚组 3→4；点名逐对改为楚昭王对楚组其余三枚及同形近邻（秦穆公·崤函之险——同为山峰）。判据、三尺度、线宽一字未动。
 * 赵盾、郤克、栾书自此不再标「新」。
 *
 * 〔r61-M 改〕名录 35→38：纳赵盾·取橐（badge_zhaodun，r61F 备选「取橐」稿）、郤克·鼓与双枹、栾书·三军之营（NEW）；晋组改 8 人；
 * 点名逐对改为三枚对晋簇其余五枚及同形近邻；判据、三尺度、线宽一字未动。祁奚、韩厥自此不再标「新」。
 *
 * 〔r61-H 改〕名录 34→35：去介之推（降二级，徽记文件留档不删）、纳祁奚·一官三物与韩厥·觞承璧（NEW）；晋组改 5 人；点名逐对改为二枚对晋簇与同形近邻；
 * 判据、三尺度、线宽一字未动。下为 r49 原头注。
 *
 * 经纬春秋 · r49 徽记撞形实测（Vision）——孔子·胡簋定稿复跑
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

const NEW = ["badge_jianshu", "badge_huaiying", "badge_shenbaoxu", "badge_aijiang"];
const NAMES = {
  badge_wenjiang: "文姜·涡纹", badge_qixiang: "齐襄公·雷纹", badge_qihuan: "齐桓公·连环三盟",
  badge_guanzhong: "管仲·衡轻重", badge_baoshuya: "鲍叔牙·税械",
  badge_yanying: "晏婴·幅",
  badge_luyin: "鲁隐公·鱼纹", badge_luhuan: "鲁桓公·圭璧", badge_luzhuang: "鲁庄公·鼓纹",
  badge_caogui: "曹刿·辙", badge_zhengzhuang: "郑庄公·蟠虺", badge_zhengzhao: "郑昭公·翎矢",
  badge_wujiang: "武姜·掘地及泉", badge_jizhong: "祭仲·执圭秉政", badge_zichan: "子产·壞館之垣",
  badge_jinwen: "晋文公·济河之舟", badge_liji: "骊姬·觚鸩",
  badge_shuxiang: "叔向·昧旦",
  badge_qinmu: "秦穆公·崤函之险", badge_muji: "穆姬·薪火", badge_chucheng: "楚成王·凤纹",
  badge_chuzhuang: "楚庄王·问鼎", badge_chuzhao: "楚昭王·望山", badge_xigui: "息妫·桃花", badge_zhuangjiang: "庄姜·双燕",
  badge_xuanjiang: "宣姜·新台临河", badge_songxiang: "宋襄公·泓上之旆", badge_xiaji: "夏姬·四徙之途",
  badge_helu: "阖庐·鱼中之剑", badge_wuyuan: "伍员·耒",
  badge_fucha: "夫差·庭中之表", badge_goujian: "勾践·甲楯",
  badge_kongzi: "孔子·胡簋",
  badge_qixidafu: "祁奚·一官三物", badge_hanjue: "韩厥·觞承璧",
  badge_zhaodun: "赵盾·取橐", badge_xike: "郤克·鼓与双枹", badge_luanshu: "栾书·三军之营",
  badge_xumu: "许穆夫人·册",
  badge_ningwuzi: "甯武子·饘", badge_sunlinfu: "孙林父·并登", badge_dingjiang: "定姜·释兆",
  badge_weixiangong: "卫献公·射鸿", badge_kuaikui: "蒯聩·戈",
  badge_jiwenzi: "季文子·马不食粟", badge_mujiang: "穆姜·艮", badge_shusunbao: "叔孙豹·裂帛",
  badge_cuizhu: "崔杼·大宫", badge_chenheng: "陈恒·鞭",
  badge_jianshu: "蹇叔·二陵（新）", badge_huaiying: "怀嬴·沃盥（新）", badge_shenbaoxu: "申包胥·庭墙（新）", badge_aijiang: "哀姜·柩车（新）",
};
/* 24px 类别图标一并入表——跨尺度关系是第二位判据（design_notes §4），只留痕报数。
   本轮尤须留痕者：huimeng（会盟＝鼎），与新枚同为礼器同尺度。 */
const CATS = ["lundui", "zhengzhi", "qita", "waijiao", "zaiyi", "xianghui", "huimeng", "zhanzheng", "shisha", "chuben"];
/* 同弧邻座（同国者同色，撞形代价最高）。孔子入鲁弧为第 5 人。 */
const GRP = {
  "齐组 6→8 人": ["badge_wenjiang", "badge_qixiang", "badge_qihuan", "badge_guanzhong", "badge_baoshuya", "badge_cuizhu", "badge_yanying", "badge_chenheng"],   // r62-U-乙 显式加
  "鲁组 8→9 人": ["badge_luyin", "badge_luhuan", "badge_luzhuang", "badge_caogui", "badge_aijiang", "badge_jiwenzi", "badge_mujiang", "badge_shusunbao", "badge_kongzi"],   // r62-U-乙 显式书（含孔子）；r62-U-丙 加哀姜
  "郑组 5 人": ["badge_zhengzhuang", "badge_zhengzhao", "badge_wujiang", "badge_jizhong", "badge_zichan"],
  "晋组 8→9 人": ["badge_jinwen", "badge_liji", "badge_huaiying", "badge_shuxiang", "badge_qixidafu", "badge_hanjue", "badge_zhaodun", "badge_xike", "badge_luanshu"],
  "楚组 4→5 人": ["badge_chucheng", "badge_chuzhuang", "badge_shenbaoxu", "badge_xigui", "badge_chuzhao"],   // r62-U-丙 加申包胥
  "秦组 2→3 人": ["badge_qinmu", "badge_muji", "badge_jianshu"],   // r62-U-丙 显式入 GRP
  "吴组 3 人": ["badge_helu", "badge_wuyuan", "badge_fucha"],
  "卫组 2→7 人": ["badge_zhuangjiang", "badge_xuanjiang", "badge_ningwuzi", "badge_sunlinfu", "badge_dingjiang", "badge_weixiangong", "badge_kuaikui"],   // r62-U-甲 显式加
};
const LU = GRP["鲁组 8→9 人"];

let MUST_REDRAW = 0;   // r61-X：须改形之计
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
      if (worst.v > base.v) MUST_REDRAW++;   // r61-X：判据不合即判红（见门头【退出码】）
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
    const NAMED = [];
    const jin = ["badge_jinwen","badge_liji","badge_shuxiang","badge_qixidafu","badge_hanjue"];
    for (const n of NEW) for (const o of ["badge_helu","badge_xiaji","badge_xigui","badge_hanjue","badge_zichan","badge_songxiang","badge_qihuan","badge_luzhuang","badge_guanzhong","badge_qixiang","badge_baoshuya","badge_dingjiang","badge_zhaodun","badge_qinmu","badge_muji","badge_chucheng","badge_jiwenzi","badge_caogui","badge_kongzi"]) NAMED.push([n,o]);   // r62-U-丙：四枚出稿时之近邻＋秦组、楚组、鲁组诸邻＋孔子（§2.5 复测）
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
      const after = before; const tag = "";
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
      <div style="padding:14px 16px;font-size:14px">徽记 silhouette 对照 · ${sc.label} · 剥外圈 · r62-U-丙（53 枚）</div>
      <div style="display:flex;flex-wrap:wrap;gap:14px;padding:0 16px 16px">
      ${cells.map(c => `<div style="width:98px;text-align:center">
        <div style="height:${sc.size + 8}px;display:flex;align-items:center;justify-content:center;color:${NEW.includes(c.b) ? "#BC4433" : "#2E2A24"}">
          ${files[c.b].replace(/<circle cx="24" cy="24" r="21"\s*\/>/, "").replace(/stroke-width="2"/, 'stroke-width="' + sc.sw + '"').replace("<svg ", `<svg width="${sc.size}" height="${sc.size}" `)}
        </div>
        <div style="font-size:10px;color:#7A7166">${c.name}</div></div>`).join("")}
      </div></body>`);
    await p.screenshot({ path: path.join(OUT, "r61M_badges_" + sc.size + "px.png"), fullPage: true });
  }
  console.log("\n对照图：screenshots/r61M_badges_24px.png、r61M_badges_22px.png、r61M_badges_18px.png");
  await br.close();
  console.log("\n—— 判红（须改形）" + MUST_REDRAW + " ——");
  process.exit(MUST_REDRAW ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
