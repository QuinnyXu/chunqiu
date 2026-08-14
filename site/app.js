/* 经纬春秋 · 四屏原型（原生 JS，无外部依赖）
 * 史料文本一律来自 site/data/*.json；本文件只含界面文案与设计配置。 */
"use strict";

/* ---------- 设计配置（见 docs/design/design_notes.md） ---------- */
/* 顺序即选人页分区内顺序；分组按 people.state 首国自动生成，新国加入只增分区。
 * home：分区归属覆盖项（武姜 state「申/郑」，人物线全在郑，归郑分区，卡上仍标流向） */
/* 主题色 color 不在此写死：国色制（r24a 裁定）以 styles.css :root 的 --state-<国> 九个变量为单一源，
 * resolveProtoColors() 于启动时按人物所属国读入填充 meta.color
 * （「国色定色、徽记定人、纹理定轨」，见 design_notes v2.0 §2.0）。
 * 个人色 --p-<id> 已于 r24a 全数退役——新增主角不需要取色，只需一枚徽记（badge）。
 * home：分区归属覆盖项（武姜按 state 首国本为「申」，人物线全在郑，归郑分区，卡上仍标流向）。 */
const PROTAGONISTS = [
  { id: "P_WENJIANG",    color: "", badge: "badge_wenjiang",    fallback: "文姜" },
  { id: "P_QIXIANG",     color: "", badge: "badge_qixiang",     fallback: "齐襄公" },
  { id: "P_QIHUAN",      color: "", badge: "badge_qihuan",      fallback: "齐桓公" },
  { id: "P_GUANZHONG",   color: "", badge: "badge_guanzhong",   fallback: "管仲" },
  { id: "P_BAOSHUYA",    color: "", badge: "badge_baoshuya",    fallback: "鲍叔牙" },
  { id: "P_QIXI",        color: "", badge: "badge_qixi",        fallback: "齐僖公" },
  { id: "P_YANYING",     color: "", badge: "badge_yanying",     fallback: "晏婴" },
  { id: "P_LUYIN",       color: "", badge: "badge_luyin",       fallback: "鲁隐公" },
  { id: "P_LUHUAN",      color: "", badge: "badge_luhuan",      fallback: "鲁桓公" },
  { id: "P_LUZHUANG",    color: "", badge: "badge_luzhuang",    fallback: "鲁庄公" },
  { id: "P_CAOGUI",      color: "", badge: "badge_caogui",      fallback: "曹刿" },
  { id: "P_ZHENGZHUANG", color: "", badge: "badge_zhengzhuang", fallback: "郑庄公" },
  { id: "P_ZHENGZHAO",   color: "", badge: "badge_zhengzhao",   fallback: "郑昭公" },
  { id: "P_WUJIANG",     color: "", badge: "badge_wujiang",     fallback: "武姜", home: "郑" },
  { id: "P_JIZHONG",     color: "", badge: "badge_jizhong",     fallback: "祭仲" },
  { id: "P_ZICHAN",      color: "", badge: "badge_zichan",      fallback: "子产" },
  { id: "P_JINWEN",      color: "", badge: "badge_jinwen",      fallback: "晋文公" },
  { id: "P_JIEZHITUI",   color: "", badge: "badge_jiezhitui",   fallback: "介之推" },
  { id: "P_QINMU",       color: "", badge: "badge_qinmu",       fallback: "秦穆公" },
  { id: "P_CHUCHENG",    color: "", badge: "badge_chucheng",    fallback: "楚成王" },
  { id: "P_CHUZHUANG",   color: "", badge: "badge_chuzhuang",   fallback: "楚庄王" },
  { id: "P_XIGUI",       color: "", badge: "badge_xigui",       fallback: "息妫", home: "楚" },
  { id: "P_LIJI",        color: "", badge: "badge_liji",        fallback: "骊姬" },
  { id: "P_SHUXIANG",    color: "", badge: "badge_shuxiang",    fallback: "叔向" },
  { id: "P_MUJI",        color: "", badge: "badge_muji",        fallback: "穆姬", home: "秦" },
  { id: "P_ZHUANGJIANG", color: "", badge: "badge_zhuangjiang", fallback: "庄姜", home: "卫" },
  { id: "P_XUANJIANG",   color: "", badge: "badge_xuanjiang",   fallback: "宣姜", home: "卫" },
  { id: "P_SONGXIANG",   color: "", badge: "badge_songxiang",   fallback: "宋襄公" },
  { id: "P_XIAJI",       color: "", badge: "badge_xiaji",       fallback: "夏姬", home: "陈" },
  { id: "P_HELU",        color: "", badge: "badge_helu",        fallback: "阖庐" },
  /* 伍员 state「楚/吴」全链，首国为楚；其人物线主要发生国是吴——六条挂链中三条落吴都
   * （E243 奔吴、E226 问伐楚之谋、E227 为吴行人），且**全部三处「亲至」落点皆在吴**，
   * 楚（郢／柏举）与秦（雍）三条一律「相关」。故 home 覆盖为「吴」，同息妫（陈女而线在楚）之例；
   * 人物卡上仍以流向 chip 标「楚→吴」，出身不因分区归属而被吞掉。 */
  { id: "P_WUYUAN",      color: "", badge: "badge_wuyuan",      fallback: "伍员", home: "吴" },
  { id: "P_FUCHA",       color: "", badge: "badge_fucha",       fallback: "夫差" },
  /* 勾践为越国第一位、全库第 33 位主角（r28 裁定 1 升格）。其 state 只「越」一国，
   * 不需 home 覆盖；越亦自本轮起成为第 11 个国色家族（--state-yue）。 */
  { id: "P_GOUJIAN",     color: "", badge: "badge_goujian",     fallback: "勾践" },
];
/* 国色家族（styles.css :root 的单一源）。新增国色家族只改这一处，
 * 首页分区、关系全景阵营底晕、分享卡色带、编年国色签、人物着色五处同步扩展。
 * r27 新立第 10 色「吴」（--state-wu #164F5C，海滨苍青系），判据全矩阵见 design_notes §2.1。
 * r28 新立第 11 色「越」（--state-yue #1F3A1E，会稽山绿系），全矩阵见 §2.1.2。 */
const STATE_FAMILY_VAR = { "齐": "--state-qi", "鲁": "--state-lu", "郑": "--state-zheng",
                           "晋": "--state-jin", "秦": "--state-qin", "楚": "--state-chu",
                           "卫": "--state-wei", "宋": "--state-song", "陈": "--state-chen",
                           "吴": "--state-wu", "越": "--state-yue" };
/* 人物所属国（＝其国色的取值键，亦为关系全景的阵营键）：
 * 主角按「主要发生国」（meta.home 覆盖，否则 state 首国），非主角按 state 首国。
 * 使节点色与其在环上的阵营弧位一致（庄姜/宣姜归卫弧、息妫归楚弧、穆姬归秦弧、
 * 武姜归郑弧、夏姬归陈弧），修正旧「按纯首国排位致色位错置」（如武姜郑色却落申槽）。 */
function panoStateKey(p) {
  const m = PROTAGONISTS.find(x => x.id === p.id);
  if (m && m.home) return m.home;
  return (p.state || "").split("/")[0];
}
/* 国色制（r24a）：各主角色 = 其所属国的国色，不再有个人色。
 * 取键与 panoStateKey 同一函数，故「卡顶条/轨迹/节点的色」与「全景阵营弧位」永远同源，
 * 不会再出现旧制那种「色取 A 国、位落 B 国」的错置。缺失则退暖赭并告警。 */
function resolveProtoColors() {
  const cs = getComputedStyle(document.documentElement);
  for (const m of PROTAGONISTS) {
    const p = (typeof PEOPLE !== "undefined" && PEOPLE[m.id]) || { id: m.id, state: "" };
    const key = panoStateKey(p);
    const varName = STATE_FAMILY_VAR[key];
    const v = varName ? cs.getPropertyValue(varName).trim() : "";
    if (v) m.color = v;
    else { m.color = "#B4652F"; console.warn("国色变量缺失：" + m.id + " → 国「" + key + "」"); }
  }
}
/* 主角名册对账（r26b 新立）——两份名册必须一字不差。
 * 数据侧的 `people.is_protagonist` 与本文件的 `PROTAGONISTS` 是两份各自维护的名册：
 * 前者定「谁是主角」，后者定「谁进得去」（徽记、分区、时间线/地图/并观/全景皆挂在它上面）。
 * r26 出过一次实账：数据侧 29、前端 27（晏婴、叔向缺席），而页脚人数取的是数据侧，
 * 于是站内对读者报「29 条人物线」，其中两条点不进去——**多许的两条，读者是找不到的**。
 * 此后由本函数守住两件事：
 *   ① 页脚人数改取「**实际可进者**」（前端名册 ∩ 数据在库），宁可少报，永不多许；
 *   ② 两侧不一致即 console.warn 报出双向差集，使缺口在开发期就现形，不必等读者发现。
 * 回归门 §17 直接调它对账（见 tools/qa/vision_r24a.js），断言从此是对账式、不是快照式——
 * 写死一个 29 只会在下一次加人时重演本轮：数字对得上，名册却对不上。 */
function protoRoster() {
  const inData = DATA.people.filter(p => p.is_protagonist).map(p => p.id);
  const uiIds = PROTAGONISTS.map(m => m.id);
  const dataSet = new Set(inData);
  const roster = {
    enterable: uiIds.filter(id => PEOPLE[id]),          // 前端有配置且数据在库者＝真能进
    dataOnly: inData.filter(id => !uiIds.includes(id)), // 数据说是主角、前端进不去
    uiOnly: uiIds.filter(id => !dataSet.has(id)),       // 前端列了、数据不认
    inData,
  };
  if (roster.dataOnly.length || roster.uiOnly.length) {
    console.warn("主角名册不一致——数据有而前端无：" + (roster.dataOnly.join("、") || "无") +
                 "；前端有而数据无：" + (roster.uiOnly.join("、") || "无"));
  }
  return roster;
}
function familyColor(stateKey) {
  const v = STATE_FAMILY_VAR[stateKey];
  if (!v) return null;
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || null;
}
/* 各国一句话气质注（界面文案，非史料叙述；无注之国只显国名）。
 * r12 起首页地图上无主角之国也点得出此注（＋「整理中」提示），故补齐底图诸国 */
const STATE_EPITHET = {
  "齐": "山海鱼盐之国",
  "鲁": "周公之胤，秉礼之邦",
  "郑": "四战之地，新造之邦",
  "晋": "表里山河之国",
  "周": "天下共主，礼乐所自出",
  "卫": "河淇之间，殷墟故地",
  "宋": "殷商之后，公爵之国",
  "陈": "帝舜之后，妫姓之国",
  "蔡": "汝淮之间，姬姓之国",
  "纪": "海隅姜姓之国",
  "许": "姜姓四岳之后",
  "秦": "据崤函之固，西霸戎狄",
  "楚": "江汉之滨，南土大国",
  "吴": "江海之滨，骤兴之国",
  "越": "会稽山海之间，后起而终吴",
};
/* 首页地图（r12，docs/design/home_map_notes.md）：徽记簇簇心（底图坐标系）。
 * 属美术布局锚点，非史料落点——史料地点一律走 conventions 投影公式。
 * r13 西扩：随东部一并按仿射 x'=0.7058824x+352.9412、y'=0.7222222y 换算至新投影，与色块同步。 */
/* 秦/楚为 r13 西扩新增分区：徽记坐标按新投影 x=(lng-105)/17*1200、y=700-(lat-29.5)/9*700，
 * 落于各自色块（秦≈雍/关中、楚≈郢），与 layer-states-west 色块相称，不与既有徽记簇重叠。 */
/* r21 宋/陈两分区：底图既有色块（layer-states 内，同仿射）换算后——
 * 宋 中心(755.3,317.8) 半径(62.1,41.9)、陈 中心(698.8,380.6) 半径(40.9,30.3)；
 * 两块在 x 693–740 / y 350–360 一带相邻，故徽记分置对角（宋落国名右下、陈落国名右侧），
 * 各自在本块椭圆内（宋 0.34、陈 0.78 归一化半径），两簇心间距 53px＞两徽记直径 27px。 */
/* r27 吴分区：底图新增 layer-states-southeast 的吴色块（中心 1082,540 半径 80,52，按新投影落笔，
 * 覆太湖—江南一带），簇心落其块内偏下、避开「吴」国名（1044,528）与东南海岸线。
 * r27 齐簇改折两行（见下 BADGE_ROW），簇心随之下移 8（168→176），令上行不压放大后的「齐」国名。 */
/* r28 越分区（第 11 分区）：底图新增 layer-states-southeast 的越色块（中心 1094,660 半径 52,30，
 * 覆宁绍平原），簇心落其块内偏右下、避开「越」国名（1050,652）；与吴簇心（1086,556）相距 113px，
 * 远过两簇各自的直径，一南一北分属两块，不相犯。 */
const HOME_BADGE_POS = {
  "齐": [930, 176], "鲁": [847, 256], "郑": [635, 306], "晋": [474, 237],
  "秦": [152, 300], "楚": [510, 610], "卫": [692, 214],
  "宋": [770, 340], "陈": [732, 384], "吴": [1086, 556], "越": [1104, 668],
};
const HOME_PENDING = "人物线整理中";
/* 轨迹降级（r19b 通用机制）：亲至可落图地点不足两处者，无从连成轨迹，
 * 播放按钮以此静态说明替代（单点定位与事件仍正常显示）。并观配对同句降级。 */
const PLAY_DEGRADE_NOTE = "亲至可考不足两地，暂无轨迹可播——已知地点如图。";
/* 播放按钮文案（r24a 裁定 1b）：单人与并观两模式统一，同一个动作不该有两个名字。 */
const PLAY_LABEL = { idle: "▶ 轨迹按时间播放", pause: "⏸ 暂停", resume: "▶ 继续播放" };
/* 人物卡流向 chip 的语义说明（r21）：chip 列的是人物线所历之国，与「亲至轨迹」是两件事。
 * 措辞守 presence 分寸：「相关」＝史文无其在场明文，不得写成或暗示「其实不在场」。 */
const FLOW_CHIP_NOTE = "人物线所历之国（据 people.state 出身→归宿诸段），非亲至轨迹；" +
                       "何处为亲至、何处史文无在场明文，见其地图与时间线。";
/* 地图状态行补注（r21）：某人若另有「相关」落点，在轨迹句后交代一句，
 * 使「史文所系之地」与「亲至可考之地」在同一行里可分。 */
const RELATED_PLACE_NOTE = (n) => "另有 " + n + " 处相关地点（史文无其在场明文），空心示之、不入轨迹。";
/* 设置单人/并观播放控件的降级态：degraded=true 时隐藏播放按钮、改显静态说明，
 * 并令按钮 disabled（全屏浮层控件据此不建，见 mountOverlayControls）。 */
function setPlayDegrade(mode, degraded) {
  const btnSel = mode === "single" ? "#btn-play" : "#cmp-play";
  const noteSel = mode === "single" ? "#play-degrade" : "#cmp-play-degrade";
  const btn = $(btnSel), note = $(noteSel);
  if (btn) { btn.hidden = degraded; btn.disabled = degraded; }
  if (note) { note.hidden = !degraded; if (degraded) note.textContent = PLAY_DEGRADE_NOTE; }
}
/* r27：原句把有主角之国逐一列名（「齐、鲁、郑、晋、秦、楚」），自 r19b 卫、r21 宋陈、r27 吴
 * 陆续上线后它一直在悄悄变旧。改为不点名——文案不再随数据长，也就不会再过时。 */
const HOME_PENDING_HINT = "先看看图上落有徽记的那几处——那里已有人物线可入。";
const CAT_ICON = {
  "即位": "jiwei", "战争": "zhanzheng", "会盟": "huimeng", "相会": "xianghui",
  "婚嫁": "hunjia", "生育": "shengyu", "出奔": "chuben", "弑杀": "shisha",
  "薨卒": "hongzu", "丧葬": "sangzang", "外交": "waijiao", "内乱": "neiluan",
  "灾异": "zaiyi", "礼俗": "lisu", "政制": "zhengzhi", "论对": "lundui", "其他": "qita",
};
const REL_LABEL = { high: "可靠性 高", medium: "可靠性 中", low: "可靠性 低" };
/* 分享卡文案（copy_r8 终审 N2–N5，r11 起用于分享卡生成器与复制链接） */
const SHARE_COPY = {
  invite: "观人物行迹，知天下春秋——处处有据。", // N2 分享图邀请语
  makeCard: "生成分享卡",                        // N3 按钮
  copyLink: "复制链接",                          // N4 按钮
  copied: "链接已复制，去分享给同好",            // N5 toast
};
/* 分享用主站绝对 URL（约定的相对路径例外仅限分享面：协议头与分享功能） */
const SITE_URL = "https://chunqiu.timechorus.com/";
const SITE_DOMAIN = "chunqiu.timechorus.com";
/* 搜索无结果提示：copy_r8 无对应项（交付说明报备），自拟一句合基调 */
const SEARCH_EMPTY = "库中未见此语——换一个词，或减一二字试试。";
const SRC_PREFIX = { Z: "左传", S: "史记", G: "国语", P: "诗经", A: "考古", B: "现代研究",
                     Y: "公羊传", L: "穀梁传", T: "诸子/说部" };
const MAP_W = 1200, MAP_H = 700;

/* ---------- 投影（docs/conventions.md 第4节；v1.8 起东经105–122/北纬29.5–38.5，第13轮第①批西扩） ---------- */
function project(lng, lat) {
  return [(lng - 105.0) / 17.0 * MAP_W, MAP_H - (lat - 29.5) / 9.0 * MAP_H];
}
console.assert(Math.round(project(118.31, 36.83)[0]) === 940 &&
               Math.round(project(118.31, 36.83)[1]) === 130, "投影校验失败：临淄");
console.assert(Math.round(project(112.2, 30.35)[0]) === 508 &&
               Math.round(project(112.2, 30.35)[1]) === 634, "投影校验失败：郢");

/* ---------- 数据与资源 ---------- */
const DATA = {};
const SVG_CACHE = {};
let baseMapText = "";

async function fetchJSON(name) {
  const r = await fetch("data/" + name + ".json");
  if (!r.ok) throw new Error(name + " 加载失败 (" + r.status + ")");
  return r.json();
}
async function fetchSVG(name) {
  if (SVG_CACHE[name]) return SVG_CACHE[name];
  const r = await fetch("assets/icons/" + name + ".svg");
  SVG_CACHE[name] = r.ok ? await r.text() : "";
  return SVG_CACHE[name];
}

/* ---------- 状态（URL hash 即状态） ----------
 * 新结构（r10 导航分层）：
 *   #/                        选人（首页）
 *   #/p/<PID>/timeline|map|relations   人物视图（relations=以其为中心的 ego 图）
 *   #/relations               全景关系图谱（56 人）
 *   #/chronicle               编年（全库事件大事年表，r25）
 *   #/library[/<tab>][?q=…]   资料库
 *   #/about                   关于
 * 旧格式（#person=X&view=…）由 legacyToNewHash 就地改写重定向，外部旧链接不失效。
 * r25 注：任务书写作 `#view=chronicle`，那是 r10 之前的旧 hash 形态；本站自 r10 起
 * 一律 `#/<view>`（见 legacyToNewHash）。故规范形态定为 `#/chronicle`，
 * 同时把 chronicle 并入旧格式白名单——`#view=chronicle` 照旧可用，会被就地改写为 `#/chronicle`，
 * 两种写法都通，站内链接与分享一律用规范形态。 */
const PERSON_VIEWS = ["timeline", "map", "relations"];
const LIB_TABS = ["background", "archaeology", "sources"];

function legacyToNewHash(h) {
  const o = {};
  for (const kv of h.split("&")) {
    const [k, v] = kv.split("=");
    if (k && v !== undefined) o[k] = v;
  }
  const person = PROTAGONISTS.some(p => p.id === o.person) ? o.person : null;
  let view = ["home", "timeline", "map", "library", "relations", "about", "chronicle"].includes(o.view) ? o.view : null;
  if (person && (!view || view === "home")) view = "timeline"; // 旧 #person=X 落其时间线
  if (person && PERSON_VIEWS.includes(view)) return buildHash(person, view);
  // 库/关于/全景等全局视图：旧链接中的 person 语境不再入 hash
  if (view === "library") {
    let q = "";
    if (o.q) { try { q = decodeURIComponent(o.q); } catch { q = o.q; } }
    return buildHash(null, "library", LIB_TABS.includes(o.tab) ? o.tab : "background", q);
  }
  if (view === "relations" || view === "about" || view === "chronicle") return buildHash(null, view);
  return "#/";
}

function parseHash() {
  let raw = location.hash.replace(/^#/, "");
  // 并观（compare）：hash 形如 #compare=P_A,P_B（r16）。须在旧格式重定向之前拦截，
  // 否则会被 legacyToNewHash 当作 #person=… 旧链接误改写。
  if (raw.startsWith("compare=")) {
    let body = raw.slice("compare=".length);
    try { body = decodeURIComponent(body); } catch { /* 原样 */ }
    const ids = body.split(",").map(s => s.trim());
    const a = ids[0], b = ids[1];
    const st = { view: "home", person: null, tab: "background", q: "", home: "map", pair: null };
    if (a && b && a !== b &&
        PROTAGONISTS.some(p => p.id === a) && PROTAGONISTS.some(p => p.id === b)) {
      st.view = "compare";
      st.pair = [a, b];
    }
    return st;
  }
  if (raw && !raw.startsWith("/") && raw.includes("=")) {
    const next = legacyToNewHash(raw);
    history.replaceState(null, "", next); // 就地改写，不增历史条目
    raw = next.replace(/^#/, "");
  }
  const st = { view: "home", person: null, tab: "background", q: "", home: "map" };
  const [pathPart, queryPart] = raw.split("?");
  const segs = pathPart.split("/").filter(Boolean);
  const params = {};
  for (const kv of (queryPart || "").split("&")) {
    const [k, v] = kv.split("=");
    if (k && v !== undefined) params[k] = v;
  }
  if (!segs.length) {
    // 首页模式记忆走 hash 参数（不用 Web Storage）：#/ = 地图，#/?home=list = 列表
    if (params.home === "list") st.home = "list";
    return st;
  }
  if (segs[0] === "p") {
    if (PROTAGONISTS.some(p => p.id === segs[1])) {
      st.person = segs[1];
      st.view = PERSON_VIEWS.includes(segs[2]) ? segs[2] : "timeline";
    }
    return st;
  }
  if (segs[0] === "relations" || segs[0] === "about" || segs[0] === "chronicle") { st.view = segs[0]; return st; }
  if (segs[0] === "library") {
    st.view = "library";
    if (LIB_TABS.includes(segs[1])) st.tab = segs[1];
    if (params.q) { try { st.q = decodeURIComponent(params.q); } catch { st.q = params.q; } }
  }
  return st;
}
/* 首页模式（map|list）：内存值随 hash 同步，回首页时沿用（选择记忆即 hash 本身） */
let homeMode = "map";
function buildHash(person, view, tab, q) {
  if (person && PERSON_VIEWS.includes(view)) return "#/p/" + person + "/" + view;
  if (view === "relations" || view === "about" || view === "chronicle") return "#/" + view;
  if (view === "library") {
    let h = "#/library";
    if (tab && tab !== "background") h += "/" + tab;
    if (q) h += "?q=" + encodeURIComponent(q);
    return h;
  }
  return homeMode === "list" ? "#/?home=list" : "#/";
}
function setHash(person, view, tab, q) {
  const next = buildHash(person, view, tab, q);
  if (next === location.hash || (next === "#/" && !location.hash)) render();
  else location.hash = next;
}

/* ---------- 数据检索 ---------- */
const byId = (rows) => Object.fromEntries(rows.map(r => [r.id, r]));
let PEOPLE, PLACES, SOURCES, EVENTS;

// 统一排序：(year_bce, sort_key, id)
function evtCompare(a, b) {
  return (a.year_bce - b.year_bce) ||
         ((a.sort_key ?? 9999) - (b.sort_key ?? 9999)) ||
         a.id.localeCompare(b.id);
}
function personEvents(pid) {
  const roles = {};
  for (const l of DATA.event_people) {
    if (l.person_id === pid) roles[l.event_id] = l;
  }
  return DATA.events
    .filter(e => roles[e.id])
    .map(e => ({
      ...e,
      role: roles[e.id].role_in_event,
      directness: roles[e.id].directness,
      presence: roles[e.id].presence || "亲至",
    }))
    .sort(evtCompare);
}
const yearLabel = (y) => (y == null ? "—" : "前" + (-y));

/* ---------- 姓名行拼装（docs/display_rules_naming.md）----------
 * 姓/氏/名/字任一可空（空＝无考，直接省略该段）；「X姓Y氏」黏排，再以「，」连「名…」「字…」。 */
function nameLineText(p, full) {
  if (!p) return "";
  const X = p.xing || "", S = p.shi || "", M = p.ming || "", Z = p.zi || "";
  const seg = X && S ? X + "姓" + S + "氏" : (X ? X + "姓" : (S ? S + "氏" : ""));
  const parts = [];
  if (seg) parts.push(seg);
  if (M) parts.push("名" + M);
  if (Z) parts.push("字" + Z);
  if (!parts.length) return full ? "姓名无考" : "";
  let line = parts.join("，");
  // 「（名无考）」括注仅用于名、字皆缺者（如文姜），且只在完整形式（详情/时间线头部）显示
  if (full && seg && !M && !Z) line += "（名无考）";
  return line;
}
/* 「姓氏有别」一句科普（文案取自 docs/display_rules_naming.md 的核心区分） */
const XSNOTE = "先秦「姓」与「氏」有别：姓别婚姻，故女子系姓（文姜之「姜」即姓）；氏别贵贱，故男子称氏不称姓。空缺处即史无可考，从省不显。";
let xsSeq = 0;
function xsInfoNode() {
  const wrap = document.createElement("span");
  wrap.className = "xs-wrap";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "xs-info";
  btn.textContent = "姓氏有别？";
  btn.title = XSNOTE;
  btn.setAttribute("aria-expanded", "false");
  const note = document.createElement("span");
  note.className = "xs-note";
  note.id = "xs-note-" + (++xsSeq);
  note.hidden = true;
  note.textContent = XSNOTE;
  btn.setAttribute("aria-controls", note.id);
  btn.addEventListener("click", () => {
    note.hidden = !note.hidden;
    btn.setAttribute("aria-expanded", String(!note.hidden));
  });
  wrap.appendChild(btn);
  wrap.appendChild(note);
  return wrap;
}
function nameLineNode(p, cls) {
  const t = nameLineText(p, true);
  if (!t) return null;
  const el = document.createElement("p");
  el.className = "person-nameline" + (cls ? " " + cls : "");
  el.appendChild(document.createTextNode(t));
  el.appendChild(xsInfoNode());
  return el;
}

/* ---------- 渲染骨架 ---------- */
const $ = (sel) => document.querySelector(sel);
let state = { view: "home", person: null, tab: "background", q: "" };
/* 人物语境：进过人物视图后记住，逛资料库/关于时子导航仍在，可一键回其时间线；
 * 「✕ 换人」清除。全局视图的 hash 不含人物（分享库/关于链接不携带人物语境）。 */
let personCtx = null;
/* 搜索直达的落点动作：点结果后设置，目标视图渲染完毕即消费（视图不符则作废） */
let pendingSpot = null; // { view, type: "event"|"quote"|"place"|"ego", ... }

/* 滚动复位（r14，Xiangtao 反馈 2）：Chrome 的自动 scroll restoration 会在 hash 导航后异步
 * 把旧滚动位置补回来（即「切视图仍停在原滚动处」的 bug）。故改 history.scrollRestoration='manual'
 * 自管：前向导航回顶、后退/前进按 scrollMem 恢复（等效浏览器自然恢复，用户可见结果一致）。 */
let navByPop = false;          // 由 popstate 置位（先于 hashchange）
const scrollMem = new Map();   // hash → 离开该视图时的滚动位置
let prevHash = null;

function render() {
  // 记下离开当前视图时的滚动位置（供其被 back/forward 回访时恢复）
  if (prevHash !== null) scrollMem.set(prevHash, window.scrollY);
  state = parseHash();
  if (state.view === "home") homeMode = state.home;
  if (state.person) personCtx = state.person;
  if (pendingSpot && pendingSpot.view !== state.view) pendingSpot = null;
  const spotForThisView = !!pendingSpot; // 搜索直达本视图：自有定位，回顶让路
  closeOverlay();
  closeDrawer();
  hideCardPop();
  const ctxMeta = PROTAGONISTS.find(p => p.id === personCtx);
  document.documentElement.style.setProperty("--theme", ctxMeta ? ctxMeta.color : "#B4652F");

  renderPersonNav(ctxMeta);
  // 主导航高亮：人物视图（时间线/地图）由子导航高亮，主导航不标当前；
  // 关系视图无论 ego/全景皆归「关系」。
  const navCur = state.person && state.view !== "relations" ? null : state.view;
  document.querySelectorAll(".main-nav button").forEach(btn => {
    btn.setAttribute("aria-current", String(btn.dataset.view === navCur));
  });
  for (const v of ["home", "timeline", "map", "library", "relations", "about", "compare", "chronicle"]) {
    $("#view-" + v).hidden = (state.view !== v);
  }
  $("#timeline-relations-entry").hidden = !state.person;
  if (state.view !== "compare") {
    document.body.classList.remove("cmp-sheet-open");
    const st = $("#cmp-sheet-toggle"); if (st) st.hidden = true;
  }
  playerStop(); // 统一引擎：无论单轨/双轨，导航切换一律停播并清理（承接旧 stopPlayback+cmpStop）
  if (state.view === "home") renderHome();
  if (state.view === "timeline") renderTimeline();
  if (state.view === "map") renderMap();
  if (state.view === "library") renderLibrary();
  if (state.view === "relations") renderRelations();
  if (state.view === "compare") renderCompare();
  if (state.view === "chronicle") renderChronicle();

  // 滚动复位（r14，Xiangtao 反馈 2）：凡前向导航（点卡/切人/切视图/关于页内链/搜索直达）一律回顶，
  // 时间线从最早一张卡开始；唯浏览器前进/后退（popstate 先于 hashchange 置位 navByPop）不干预，
  // 交 history 自然恢复。搜索直达的事件定位在 consume* 里经 rAF 于此之后执行，不受影响。
  // 后退/前进：恢复该历史项滚动位（等效浏览器自然恢复）；前向导航：回顶（时间线从最早卡起）；
  // 搜索直达本视图不动，交 consume* 的 scrollIntoView 定位。rAF 兜一帧，防被当帧布局变化覆盖。
  if (navByPop) {
    navByPop = false;
    const y = scrollMem.get(location.hash) || 0;
    scrollToY(y);
    requestAnimationFrame(() => scrollToY(y));
  } else if (!spotForThisView) {
    scrollToY(0);
    requestAnimationFrame(() => scrollToY(0));
  }
  prevHash = location.hash;
}
/* 即时滚动到 y：临时关平滑，强制回流保证新视图布局已生效 */
function scrollToY(y) {
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  void html.offsetHeight;
  window.scrollTo(0, y);
  html.style.scrollBehavior = prev;
}

/* 人物子导航（次级条）：〔人物名〕· 时间线 | 地图 | 关系 | ✕ 换人 */
function renderPersonNav(ctxMeta) {
  const nav = $("#person-nav");
  const person = personCtx ? PEOPLE[personCtx] : null;
  nav.hidden = !person;
  if (!person) return;
  $("#pn-name").textContent = person.name;
  const badge = $("#pn-badge");
  if (badge.dataset.for !== personCtx && ctxMeta) {
    badge.dataset.for = personCtx;
    fetchSVG(ctxMeta.badge).then(t => { badge.innerHTML = t; });
  }
  nav.querySelectorAll("button[data-pview]").forEach(btn => {
    btn.setAttribute("aria-current", String(!!state.person && btn.dataset.pview === state.view));
  });
}

/* ---------- 屏1 选人：地图导航（r12 默认）＋分组列表（列表模式/窄屏下方） ---------- */
let homeGroupEls = new Map(); // 分区 state → section 元素（首页地图点国滚动定位用）
let homeGroups = new Map();   // 分区 state → metas

function renderHome() {
  const view = $("#view-home");
  const mapMode = state.home !== "list";
  view.classList.toggle("home-map-mode", mapMode);
  const toggle = $("#home-mode-toggle");
  toggle.textContent = mapMode ? "☷ 列表模式" : "◎ 地图模式";
  toggle.setAttribute("aria-pressed", String(!mapMode));

  const tabsBox = $("#state-tabs");
  const groupsBox = $("#person-groups");
  tabsBox.textContent = "";
  groupsBox.textContent = "";

  // 分组：按 people.state 首国（跨国者归首国，卡上另标流向；meta.home 可覆盖，如武姜归郑）；
  // 组序随 PROTAGONISTS 配置
  const groups = [];
  const byState = new Map();
  homeGroups = new Map();
  homeGroupEls = new Map();
  for (const meta of PROTAGONISTS) {
    const person = PEOPLE[meta.id];
    const st = meta.home || ((person && person.state) || "").split("/")[0] || "其他";
    if (!byState.has(st)) {
      const g = { state: st, metas: [] };
      byState.set(st, g);
      groups.push(g);
    }
    byState.get(st).metas.push(meta);
  }
  for (const g of groups) homeGroups.set(g.state, g.metas);

  const setActive = (label) => {
    tabsBox.querySelectorAll("button").forEach(b =>
      b.setAttribute("aria-current", String(b.dataset.state === label)));
  };
  const mkTab = (label, onGo) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.state = label;
    b.textContent = label;
    b.setAttribute("aria-current", "false");
    b.addEventListener("click", () => { setActive(label); onGo(); });
    tabsBox.appendChild(b);
    return b;
  };
  mkTab("全部", () => $("#home-title").scrollIntoView({ block: "start" }))
    .setAttribute("aria-current", "true");

  groups.forEach((g, i) => {
    const sec = document.createElement("section");
    sec.className = "state-group";
    sec.id = "state-group-" + i;
    sec.setAttribute("aria-label", g.state + " 国人物");
    const head = document.createElement("h3");
    head.className = "state-head";
    const nm = document.createElement("span");
    nm.className = "state-name";
    nm.textContent = g.state;
    head.appendChild(nm);
    if (STATE_EPITHET[g.state]) {
      const note = document.createElement("span");
      note.className = "state-note";
      note.textContent = STATE_EPITHET[g.state];
      head.appendChild(note);
    }
    sec.appendChild(head);
    const ul = document.createElement("ul");
    ul.className = "person-grid";
    for (const meta of g.metas) ul.appendChild(personCardLi(meta));
    sec.appendChild(ul);
    groupsBox.appendChild(sec);
    homeGroupEls.set(g.state, sec);
    mkTab(g.state, () => sec.scrollIntoView({ block: "start" }));
  });

  if (mapMode) buildHomeMap();
}

/* ----- 首页地图导航（r12，docs/design/home_map_notes.md）：
 * 底图海报化（色块饱和提档、国名放大），每国一个键盘可达热区；
 * 有主角之国落主题色徽记簇，无主角之国点出一句气质注＋「整理中」。 ----- */
/* 取椭圆在最终 viewBox 坐标系下的中心与半径：读其父组的合并变换（东部 layer-states 有仿射矩阵、
 * 西部 layer-states-west 无变换即单位阵），故东西两套色块统一换算，热区与色块严丝合缝。 */
function ellipseFinalGeom(el) {
  const cx = parseFloat(el.getAttribute("cx")), cy = parseFloat(el.getAttribute("cy"));
  const rx = parseFloat(el.getAttribute("rx")), ry = parseFloat(el.getAttribute("ry"));
  const list = el.parentNode.transform.baseVal;
  const m = list.numberOfItems ? list.consolidate().matrix : null;
  if (!m) return { cx, cy, rx, ry };
  return {
    cx: m.a * cx + m.c * cy + m.e,
    cy: m.b * cx + m.d * cy + m.f,
    rx: rx * Math.hypot(m.a, m.b),
    ry: ry * Math.hypot(m.c, m.d),
  };
}
/* 徽记簇排布（r27 立「超 6 枚折两行」，design_notes §5.8 v2.3 所记「候后议」项，裁定 7）。
 *
 * 何以要折：簇是「单行、间距 gap、居簇心」，行宽 ＝ gap×(n−1)+2R，随主角数线性增长——
 * 齐组 7 枚时行宽 186px 已越出齐色块在该行的可用宽度（约 167px），最左一枚落到块外海面上；
 * 8 枚时将达 217px。折两行把增长从「线性」压成「每两人加一格」，是换掉增长源、不是挪一挪位置。
 *
 * 两条取舍写明，免得后人当成随手之作：
 *  ① **阈值取 6**（≤6 仍单行）：现库除齐外最多者郑组 5 枚（行宽 151），折之无益反而多占一行高；
 *     6 枚行宽 182 尚在多数色块的可用宽度边缘，故门槛定在「超 6」，即第 7 枚起折。
 *  ② **上行取 floor(n/2)、下行取 ceil(n/2)**——即较宽的一行在下。国名标注一律在簇之上
 *     （首页地图国名放大至 26px），把窄行放在上方可少压字；两行各自居中于簇心 x。
 * 行距 rowGap 须 ≥ 2R（27）方不相压，取 29 留 2px。 */
function clusterSlots(metas, pos, gap, rowGap, fold) {
  const n = metas.length;
  const rows = n > fold ? [metas.slice(0, Math.floor(n / 2)), metas.slice(Math.floor(n / 2))]
                        : [metas];
  const out = [];
  rows.forEach((row, ri) => {
    const cy = pos[1] + (rows.length === 1 ? 0 : (ri - (rows.length - 1) / 2) * rowGap);
    const x0 = pos[0] - ((row.length - 1) * gap) / 2;
    row.forEach((meta, i) => out.push({ meta, cx: x0 + i * gap, cy }));
  });
  return out;
}
function buildHomeMap() {
  const box = $("#home-map");
  box.innerHTML = baseMapText;
  const svg = box.querySelector("svg");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  svg.setAttribute("aria-label", "春秋列国示意图：点国入其人物线");

  // 海报化：色块饱和提一档、国名放大加深（人物地图用原参数，两处共用同一底图文件）
  // r13 西扩：东部与西部色块（layer-states / layer-states-west）一并提档；r27 东南（吴）同办
  svg.querySelectorAll("#layer-states, #layer-states-west, #layer-states-southeast")
     .forEach(g => g.setAttribute("fill-opacity", "0.5"));
  svg.querySelectorAll("#layer-labels text[data-state]").forEach(t => {
    t.setAttribute("font-size", "26");
    t.setAttribute("fill", "#4E4338");
  });

  // 每国热区：色块椭圆外扩 18；hover/focus/选中显暖赭虚线环；Tab 可达、Enter/空格触发。
  // r13 西扩：东部色块在仿射变换组内、西部在根坐标系，故按各自「父组变换」换算到最终 viewBox 坐标，
  // 落于无变换的 hotLayer，两者热区皆与色块对齐（秦/楚亦成键盘可达热区，无主角→「整理中」）。
  const hotLayer = document.createElementNS(NS, "g");
  svg.appendChild(hotLayer);
  svg.querySelectorAll("#layer-states ellipse[data-state], #layer-states-west ellipse[data-state], #layer-states-southeast ellipse[data-state]").forEach(el => {
    const st = el.dataset.state;
    const metas = homeGroups.get(st);
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "home-state");
    g.dataset.state = st;
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", st + "：" + (metas
      ? metas.map(m => (PEOPLE[m.id] ? PEOPLE[m.id].name : m.fallback)).join("、")
      : HOME_PENDING));
    const gm = ellipseFinalGeom(el);
    const mk = (cls, dr) => {
      const e = document.createElementNS(NS, "ellipse");
      e.setAttribute("class", cls);
      e.setAttribute("cx", gm.cx); e.setAttribute("cy", gm.cy);
      e.setAttribute("rx", gm.rx + dr);
      e.setAttribute("ry", gm.ry + dr);
      g.appendChild(e);
      return e;
    };
    mk("hs-ring", 6);
    mk("hs-hit", 18);
    g.addEventListener("click", () => pickHomeState(st));
    g.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pickHomeState(st); }
    });
    hotLayer.appendChild(g);
  });

  // 主角徽记簇：主题色圆底＋白线徽记，排布于簇心（HOME_BADGE_POS，美术布局锚点）
  const BADGE_R = 13.5, BADGE_GAP = 31, BADGE_ROW = 29, BADGE_FOLD = 6;
  const clusterLayer = document.createElementNS(NS, "g");
  clusterLayer.setAttribute("aria-hidden", "true"); // 与热区同义，读屏只走热区
  svg.appendChild(clusterLayer);
  for (const [st, metas] of homeGroups) {
    const pos = HOME_BADGE_POS[st];
    if (!pos) continue;
    const cl = document.createElementNS(NS, "g");
    cl.setAttribute("class", "home-cluster");
    for (const { meta, cx, cy } of clusterSlots(metas, pos, BADGE_GAP, BADGE_ROW, BADGE_FOLD)) {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", cx); c.setAttribute("cy", cy); c.setAttribute("r", BADGE_R);
      c.setAttribute("fill", meta.color);
      c.setAttribute("stroke", "#F4EDDF");
      c.setAttribute("stroke-width", "1.6");
      const tip = document.createElementNS(NS, "title");
      tip.textContent = PEOPLE[meta.id] ? PEOPLE[meta.id].name : meta.fallback;
      c.appendChild(tip);
      cl.appendChild(c);
      fetchSVG(meta.badge).then(t => {
        if (!t) return;
        const doc = new DOMParser().parseFromString(t, "image/svg+xml");
        const b = document.importNode(doc.documentElement, true);
        b.setAttribute("x", cx - 9); b.setAttribute("y", cy - 9);
        b.setAttribute("width", 18); b.setAttribute("height", 18);
        b.style.color = "#FBF7EC";
        b.style.pointerEvents = "none";
        cl.appendChild(b);
      });
    }
    cl.addEventListener("click", () => pickHomeState(st));
    clusterLayer.appendChild(cl);
  }

  resetHomePanel();
  $("#home-map-status").textContent = "点地图上的国名或色块，入其人物线；列国色块皆示意，非考据疆界。";
}

function pickHomeState(st) {
  const svg = $("#home-map").querySelector("svg");
  if (svg) svg.querySelectorAll(".home-state").forEach(g =>
    g.classList.toggle("selected", g.dataset.state === st));
  const metas = homeGroups.get(st) || null;
  // 窄屏：面板隐藏，分组列表就在图下——有主角滚到分组，无主角状态行给一句提示
  if (window.matchMedia("(max-width: 680px)").matches) {
    if (metas && homeGroupEls.has(st)) {
      homeGroupEls.get(st).scrollIntoView({ block: "start", behavior: "smooth" });
    } else {
      $("#home-map-status").textContent =
        st + (STATE_EPITHET[st] ? " · " + STATE_EPITHET[st] : "") + "——" + HOME_PENDING + "。";
    }
    return;
  }
  const panel = $("#home-state-panel");
  panel.textContent = "";
  const h3 = document.createElement("h3");
  h3.textContent = st;
  panel.appendChild(h3);
  if (STATE_EPITHET[st]) {
    const note = document.createElement("p");
    note.className = "state-note";
    note.textContent = STATE_EPITHET[st];
    panel.appendChild(note);
  }
  if (metas) {
    const ul = document.createElement("ul");
    ul.className = "person-grid";
    for (const meta of metas) ul.appendChild(personCardLi(meta));
    panel.appendChild(ul);
  } else {
    const p = document.createElement("p");
    p.className = "home-pending";
    p.textContent = HOME_PENDING + "——" + HOME_PENDING_HINT;
    panel.appendChild(p);
  }
}
function resetHomePanel() {
  const panel = $("#home-state-panel");
  panel.textContent = "";
  const h3 = document.createElement("h3");
  h3.textContent = "列国人物";
  panel.appendChild(h3);
  const p = document.createElement("p");
  p.className = "map-status";
  p.textContent = "点左侧地图上任一国。";
  panel.appendChild(p);
}

function personCardLi(meta) {
  const person = PEOPLE[meta.id];
  const ready = !!person;
  const li = document.createElement("li");
  const card = document.createElement("button");
  card.type = "button";
  card.className = "person-card";
  card.style.setProperty("--card-color", meta.color);
  card.disabled = !ready;

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.setAttribute("aria-hidden", "true");
  fetchSVG(meta.badge).then(t => { badge.innerHTML = t; });
  card.appendChild(badge);

  const info = document.createElement("span");
  info.className = "card-info"; // 统一卡式（r12）：信息列 min-width:0，各行单行截断
  const h3 = document.createElement("h3");
  h3.textContent = ready ? person.name : meta.fallback;
  /* 跨国人物标注流向：列 people.state 全链（conventions §6.6「出身→归宿」诸段）。
   * r21 由 r19b 的「只取首末国」升级为全链——夏姬 state「郑/陈/楚/晋」按旧规则显作「郑→晋」，
   * 恰好吞掉陈、楚两段，而这两段正是其人物线之主体；息妫随之由「陈→楚」改「陈→息→楚」。
   * 语义须与地图轨迹分清：本 chip 是「人物线所历之国」（据 state），不是亲至轨迹——
   * 亲至与否一律以地图实心/空心与时间线 presence 标签为准，故加 title 明说。 */
  if (ready && (person.state || "").includes("/")) {
    const segs = person.state.split("/").filter(Boolean);
    const flow = document.createElement("span");
    flow.className = "flow-chip";
    flow.textContent = segs.join("→");
    flow.title = FLOW_CHIP_NOTE;
    h3.appendChild(flow);
  }
  info.appendChild(h3);
  // 姓名行小字（压缩形式：无考段直接省略，不加括注；科普全文见时间线头部）
  if (ready) {
    const nl = nameLineText(person, false);
    if (nl) {
      const d = document.createElement("div");
      d.className = "name-line";
      d.textContent = nl;
      d.title = XSNOTE;
      info.appendChild(d);
    }
  }
  const yrs = document.createElement("div");
  yrs.className = "years";
  if (ready) {
    const b = person.birth_year_bce, d = person.death_year_bce;
    yrs.textContent = (b ? yearLabel(b) : "生年不详") + " — " + (d ? yearLabel(d) : "卒年不详") +
      (person.active_years_bce ? " · " + person.active_years_bce : "");
  } else {
    yrs.textContent = "——";
  }
  info.appendChild(yrs);
  const p = document.createElement("p");
  if (ready && person.short_bio) p.textContent = person.short_bio;
  else if (ready) p.textContent = person.notes || "";
  else {
    const s = document.createElement("span");
    s.className = "pending";
    s.textContent = "资料整理中";
    p.appendChild(s);
  }
  info.appendChild(p);
  card.appendChild(info);

  if (ready) {
    card.setAttribute("aria-label", person.name + "：进入时间线");
    card.addEventListener("click", () => setHash(meta.id, "timeline"));
    // 桌面简介截两行后仍溢出者，hover/focus 出全文浮层（手机端简介不截断→不触发）
    if (person.short_bio) {
      const show = () => showCardPop(card, p, person.short_bio, meta.color);
      card.addEventListener("mouseenter", show);
      card.addEventListener("focus", show);
      card.addEventListener("mouseleave", hideCardPop);
      card.addEventListener("blur", hideCardPop);
    }
  }
  li.appendChild(card);
  return li;
}
/* 人物卡简介全文浮层：仅当简介被截断（scrollHeight>clientHeight）才显示，故手机端完整显示时自动不弹 */
function showCardPop(card, bioEl, text, color) {
  if (bioEl.scrollHeight <= bioEl.clientHeight + 1) return;
  const pop = $("#card-pop");
  pop.textContent = text;
  if (color) pop.style.setProperty("--card-pop-color", color);
  pop.hidden = false;
  pop.setAttribute("aria-hidden", "false");
  const r = card.getBoundingClientRect();
  pop.style.width = Math.round(r.width) + "px";
  pop.style.left = Math.round(Math.max(6, Math.min(r.left, window.innerWidth - r.width - 6))) + "px";
  const ph = pop.offsetHeight;
  let top = r.bottom + 6;
  if (top + ph > window.innerHeight - 6) top = Math.max(6, r.top - ph - 6);
  pop.style.top = Math.round(top) + "px";
}
function hideCardPop() {
  const pop = $("#card-pop");
  pop.hidden = true;
  pop.setAttribute("aria-hidden", "true");
}

/* 引文分层徽标类映射（r13）：quote_type → CSS 档。原文无徽标（经传骨架基准）。
 * 经义异闻＝公羊/穀梁传注异说层，专属紫徽标，与后出叙事（灰）、诗歌（菉色 --poem）并列、风格一致。 */
const QLAYER_CLASS = {
  "言论": "layer-yanlun",
  "评论": "layer-pinglun",
  "后出叙事": "layer-houchu",
  "诗歌": "layer-shige",
  "经义异闻": "layer-jingyi",
};
/* 编者层标（r21）：史料研究员在 modern_note 开头以【…】标出的本库分层处置说明，
 * 如【归罪话术层·非事实判断】（巫臣两谏、叔向之母之评）、【P 层舆论材料·不作史实用】（《陈风·株林》）。
 * 旧渲染把整条 modern_note 拼进 footer 小字，层标遂夹在长今译中间、位于原文之下——
 * 归罪话术以正文体量呈现、免责标注以脚注体量呈现，主次恰好倒置。此处改为提到引文之前独立成条。
 * 视觉上用暖赭（界面/编者语态），与史料层色（朱=经传、菉=诗歌、紫=经义异闻、灰=后出叙事）区分：
 * 层徽标答「这段引文属哪一层」，编者层标答「本库对该层如何处置」。文字一字不改，只挪位置、去外层【】。 */
const CAVEAT_RE = /^【([^】]+)】\s*/;
function splitCaveat(note) {
  const m = CAVEAT_RE.exec(note || "");
  return m ? { caveat: m[1], rest: note.slice(m[0].length) } : { caveat: "", rest: note || "" };
}

/* ---------- 事件卡组件（时间线与编年共用，r25 抽出） ----------
 * 同一事件在两处呈现必须完全同形：meta chips、summary、引文（层徽标＋编者层标＋出处脚注）
 * 一律走这三个函数，不得各写一份——两份实现必然分叉，分叉之后「哪个才是规格」就没人答得上来。
 * 视图差异只有两处，由 opts 显式传入，函数内不猜自己身在何视图：
 *   personal —— 人物视图特有的「亲至／相关」chip。presence 是「此人与此事」的关系，
 *               不是事件自身的属性，故编年（无人物语境）不出此 chip，改由挂链人物签逐人标注。
 *   people   —— 编年特有的挂链人物徽记签（见 eventPeopleNode）。 */
function eventChipsNode(evt, opts) {
  const chips = document.createElement("div");
  chips.className = "meta-chips";
  const place = evt.place_id ? PLACES[evt.place_id] : null;
  if (place) addChip(chips, "地点 · " + place.ancient_name, "");
  if (evt.category) addChip(chips, evt.category, "");
  if (evt.reliability) addChip(chips, REL_LABEL[evt.reliability] || evt.reliability, "rel-" + evt.reliability);
  if (evt.importance) addChip(chips, "重要度 " + evt.importance, "");
  if (opts && opts.personal) addChip(chips, evt.presence, evt.presence === "相关" ? "rel-low" : "rel-high");
  return chips;
}
/* 引文块：分层徽标（r13）＋编者层标（r21）＋出处脚注，一字不改地沿用时间线旧渲染 */
function eventQuotesFrag(evt) {
  const frag = document.createDocumentFragment();
  for (const q of DATA.passages.filter(p => p.event_id === evt.id)) {
    const bq = document.createElement("blockquote");
    // 引文分层徽标（r13）：原文＝经传骨架（无徽标）；其余各层给专属色徽标——
    // 经义异闻（公羊/穀梁传注异说）、后出叙事（史记等晚出戏剧化）、诗歌（诗经舆论层）、言论、评论。
    const layer = QLAYER_CLASS[q.quote_type] || "";
    const { caveat, rest } = splitCaveat(q.modern_note);
    bq.className = "quote" + (layer ? " " + layer : "") + (caveat ? " has-caveat" : "");
    bq.dataset.qid = q.id;
    if (q.quote_type && q.quote_type !== "原文") {
      const tag = document.createElement("span");
      tag.className = "q-layer";
      tag.textContent = q.quote_type;
      bq.appendChild(tag);
    }
    // 编者层标：置于原文之前（读到话术之前先见其分层处置），文字取自 modern_note 首段【…】
    if (caveat) {
      const cv = document.createElement("p");
      cv.className = "q-caveat";
      cv.setAttribute("role", "note");
      cv.textContent = caveat;
      bq.appendChild(cv);
    }
    const qp = document.createElement("p");
    qp.textContent = q.quote_original;
    bq.appendChild(qp);
    const ft = document.createElement("footer");
    const src = SOURCES[q.source_id];
    // 类型已进徽标、层标已前置，脚注不再重复
    ft.textContent = "—— " + (src ? src.title : q.source_id) + (rest ? " · " + rest : "");
    bq.appendChild(ft);
    frag.appendChild(bq);
  }
  return frag;
}
function eventBodyNode(evt, opts) {
  const body = document.createElement("div");
  body.className = "event-body";
  body.appendChild(eventChipsNode(evt, opts));
  const sm = document.createElement("p");
  sm.textContent = evt.summary || "";
  sm.style.margin = "0";
  body.appendChild(sm);
  if (opts && opts.people) body.appendChild(eventPeopleNode(evt));
  body.appendChild(eventQuotesFrag(evt));
  return body;
}
/* 挂链人物徽记签（r25，编年专用）：编年按年铺开、没有人物语境，故每张卡须自己交代「事系何人」，
 * 并由此把读者送回人物线——这也是编年与人物视图之间的往返通道。
 * 主角带徽记：国色制下徽记是个人身份的唯一色外锚点（design_notes §2.0/§2.5），签色取其国色；
 * 配角无徽记（本库只为主角作徽记），出名字即可，点开落其 ego 关系图。
 * presence 措辞守 §6/§7 从严口径：「相关」＝**史文无其在场明文**，作虚线空心签，
 * 一律不得写成或暗示「其人不在场」。 */
function eventPeopleNode(evt) {
  const wrap = document.createElement("div");
  wrap.className = "evt-people";
  const links = DATA.event_people.filter(l => l.event_id === evt.id && PEOPLE[l.person_id]);
  if (!links.length) return wrap;
  const lab = document.createElement("span");
  lab.className = "evt-people-label";
  lab.textContent = "所系人物";
  wrap.appendChild(lab);
  // 亲至在前、主角在前，其余按 id——与全站「排序须可复算」的口径一致，不靠数据行序
  links.sort((a, b) =>
    (((a.presence || "亲至") === "相关") - ((b.presence || "亲至") === "相关")) ||
    (protoRank(a.person_id) - protoRank(b.person_id)) ||
    a.person_id.localeCompare(b.person_id));
  for (const l of links) {
    const p = PEOPLE[l.person_id];
    const meta = PROTAGONISTS.find(m => m.id === l.person_id);
    const related = (l.presence || "亲至") === "相关";
    const b = document.createElement("button");
    b.type = "button";
    b.className = "evt-person" + (meta ? " is-proto" : "") + (related ? " is-related" : "");
    b.dataset.pid = l.person_id;
    if (meta) {
      b.style.setProperty("--tag", meta.color || "var(--ochre)");
      const bd = document.createElement("span");
      bd.className = "ep-badge";
      bd.setAttribute("aria-hidden", "true");
      fetchSVG(meta.badge).then(t => { bd.innerHTML = t; });
      b.appendChild(bd);
    }
    const nm = document.createElement("span");
    nm.className = "ep-name";
    nm.textContent = p.name;
    b.appendChild(nm);
    const pr = document.createElement("small");
    pr.textContent = related ? "相关" : "亲至";
    b.appendChild(pr);
    b.title = p.name + (l.role_in_event ? " · " + l.role_in_event : "") +
      (related ? "（相关：史文无其在场明文）" : "（亲至：史文明书其在事发地）") +
      " —— 点开" + (meta ? "其时间线并定位此事" : "其关系图");
    b.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();   // 勿连带切换所在 <details> 的开合
      goEventPerson(l.person_id, evt.id);
    });
    wrap.appendChild(b);
  }
  return wrap;
}

/* ---------- 屏2 时间线 ---------- */
function renderTimeline() {
  // 头部姓名行：完整形式（姓/氏/名/字可考部分）＋「姓氏有别」科普
  const nlBox = $("#timeline-nameline");
  nlBox.textContent = "";
  nlBox.hidden = true;
  const person = PEOPLE[state.person];
  if (person) {
    const nl = nameLineNode(person);
    if (nl) {
      while (nl.firstChild) nlBox.appendChild(nl.firstChild);
      nlBox.hidden = false;
    }
  }
  const events = personEvents(state.person);
  renderRuler(events);
  const list = $("#timeline-list");
  list.textContent = "";
  for (const evt of events) {
    const li = document.createElement("li");
    const det = document.createElement("details");
    const hasQuote = DATA.passages.some(pp => pp.event_id === evt.id);
    det.className = "event" + (evt.importance === 1 ? " major" : "") + (hasQuote ? " has-quote" : "");
    det.dataset.eid = evt.id;

    const sum = document.createElement("summary");
    const ico = document.createElement("span");
    ico.className = "cat-ico";
    ico.title = evt.category || "其他";
    fetchSVG(CAT_ICON[evt.category] || "qita").then(t => { ico.innerHTML = t; });
    sum.appendChild(ico);

    const when = document.createElement("span");
    when.className = "when";
    when.textContent = yearLabel(evt.year_bce);
    const small = document.createElement("small");
    small.textContent = [evt.lu_reign, evt.season_month].filter(Boolean).join(" · ");
    when.appendChild(small);
    sum.appendChild(when);

    const title = document.createElement("span");
    title.className = "evt-title";
    title.textContent = evt.title;
    sum.appendChild(title);

    if (evt.role) {
      const role = document.createElement("span");
      role.className = "role-chip";
      role.textContent = evt.role + (evt.presence === "相关" ? " · 相关" : "");
      sum.appendChild(role);
    }
    // 可点暗示：右下角常驻「原文 ▾ / 详情 ▾」，展开转「收起 ▴」（文案由 CSS 依 has-quote/open 切换）
    const hint = document.createElement("span");
    hint.className = "evt-hint";
    hint.setAttribute("aria-hidden", "true");
    sum.appendChild(hint);
    det.appendChild(sum);

    // 人物视图：带 presence chip、不带挂链人物签（此页本就只讲这一个人）
    det.appendChild(eventBodyNode(evt, { personal: true }));
    li.appendChild(det);
    list.appendChild(li);
  }
  consumeTimelineSpot(list);
}
/* 搜索直达：展开目标事件并滚动定位（原文命中再定位到具体引文块） */
function consumeTimelineSpot(list) {
  if (!pendingSpot || (pendingSpot.type !== "event" && pendingSpot.type !== "quote")) return;
  const spot = pendingSpot;
  pendingSpot = null;
  const det = list.querySelector('details[data-eid="' + spot.eid + '"]');
  if (!det) return;
  det.open = true;
  const target = spot.type === "quote"
    ? det.querySelector('[data-qid="' + spot.qid + '"]') || det
    : det;
  det.classList.add("spotlight");
  setTimeout(() => det.classList.remove("spotlight"), 2400);
  spotScrollInto(target, det.querySelector("summary"));
}
/* 搜索直达的落点滚动（r25 顺带修正，实测见 delivery_vision_r25 §顺带修正）。
 * 现象：hash 导航（setHash → hashchange → render）之后，在**同一帧**内发起的程序化平滑滚动
 *   一次也不会执行——实测 scrollY 全程恒 0，即滚动动画根本没起步，而非中途被打断
 *   （对照：同一份代码在无 hash 导航时手动触发，scrollY 从 5 一路涨到 18806，完全正常）。
 *   成因是导航自身的「滚动到片段/回顶」与我们的程序化滚动撞在同一帧，后者被吞掉。
 * 后果：搜「乡校」直达 E195，卡片确实展开了、spotlight 也确实闪了，但它停在 y=1034——
 *   视口只有 900，读者看到的仍是页顶。**DOM 状态对 ≠ 读者看得见**（见 design_notes §7.3）。
 * 影响面：自 r11 起既有，非本轮引入；未被发现是因为过去的断言只查 open/类名，一条都不查像素。
 * 修法：让出一帧再滚（双 rAF）。回归门见 tools/qa/vision_r24a.js §12，退回单 rAF 即全红。 */
function spotScrollInto(target, focusEl) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    target.scrollIntoView({ block: "center", behavior: "smooth" });
    if (focusEl) focusEl.focus({ preventScroll: true });
  }));
}
function addChip(parent, text, extra) {
  const c = document.createElement("span");
  c.className = "chip" + (extra ? " " + extra : "");
  c.textContent = text;
  parent.appendChild(c);
}

function renderRuler(events) {
  const box = $("#ruler");
  box.textContent = "";
  if (!events.length) return;
  const years = events.map(e => e.year_bce).filter(y => y != null);
  const min = Math.min(...years), max = Math.max(...years);
  const lo = Math.floor(min / 10) * 10, hi = Math.ceil(max / 10) * 10;
  const W = 1000, H = 48, PAD = 30;
  const x = (y) => PAD + (y - lo) / Math.max(hi - lo, 1) * (W - PAD * 2);
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "年份刻度尺：" + yearLabel(min) + " 至 " + yearLabel(max));
  const axis = document.createElementNS(NS, "line");
  axis.setAttribute("x1", PAD); axis.setAttribute("x2", W - PAD);
  axis.setAttribute("y1", 24); axis.setAttribute("y2", 24);
  axis.setAttribute("stroke", "#DCD2BC"); axis.setAttribute("stroke-width", "2");
  svg.appendChild(axis);
  for (let y = lo; y <= hi; y += 10) {
    const t = document.createElementNS(NS, "line");
    t.setAttribute("x1", x(y)); t.setAttribute("x2", x(y));
    t.setAttribute("y1", 18); t.setAttribute("y2", 30);
    t.setAttribute("stroke", "#B8AC90");
    svg.appendChild(t);
    const lbl = document.createElementNS(NS, "text");
    lbl.setAttribute("x", x(y)); lbl.setAttribute("y", 44);
    lbl.setAttribute("text-anchor", "middle");
    lbl.setAttribute("font-size", "11");
    lbl.setAttribute("fill", "#7A7166");
    lbl.textContent = yearLabel(y);
    svg.appendChild(lbl);
  }
  const theme = getComputedStyle(document.documentElement).getPropertyValue("--theme").trim();
  for (const e of events) {
    const dot = document.createElementNS(NS, "circle");
    dot.setAttribute("cx", x(e.year_bce)); dot.setAttribute("cy", 24);
    dot.setAttribute("r", e.importance === 1 ? 5 : 3.2);
    dot.setAttribute("fill", e.importance === 1 ? theme : "#F4EDDF");
    dot.setAttribute("stroke", theme); dot.setAttribute("stroke-width", "1.6");
    const tip = document.createElementNS(NS, "title");
    tip.textContent = yearLabel(e.year_bce) + " " + e.title;
    dot.appendChild(tip);
    svg.appendChild(dot);
  }
  box.appendChild(svg);
}

/* ---------- 屏7 编年（r25）：全库事件按年铺开的大事年表 ----------
 * 立此视图的根由：在此之前「事件只经主角时间线呈现」，故 13 条无主角挂链的事件
 * （E205 齐太史书「崔杼弑其君」、E206 弭兵之会等）在全站三条通路上全部关闭——
 * r24a 走查实测并上报，领队裁定甲案：**全库事件从此人人可达**。编年即其落点。
 *
 * 本视图完全数据驱动：事件、年份、鲁君纪年、分类、地望、引文、挂链人物，一律读 site/data/*.json，
 * 代码里不写死任何一条史料；新事件入库即自动上表，前端不需再动一行（B2 合入后编年自动长大）。
 * 排序一律走全站同一个 evtCompare —— (year_bce, sort_key, id)，不另立口径。 */
const chronView = { states: new Set(), cats: new Set() };
const CHRON_NO_PLACE = "无地望";     // 事件无 place_id
const CHRON_OTHER = "其他";          // 有地望，但其国未立国色家族
/* 事件的国色签：色取事件**地点所属国**（places.state）的国色，签文一律显示 state 字段原文。
 * places.state 存在复合写法（「齐鲁间」「晋/秦晋间」「周畿内」「申/楚」「郑/鲁」），
 * 故按字符序取首个可识别的国色家族名作**色键**——只用于着色与筛选归组，
 * 不改写、不简化、不替史料决定「这地究竟属谁」：签文照显原文，读者见「齐鲁间」即知其为边地。
 * 无地望者中性签；有地望而其国未立国色家族者（周/曹/邢/蔡/莒…）亦中性，但签文照显其国名——
 * 中性只表「本站未为其立色」，不表「不知其国」。 */
function chronStateOf(evt, pal) {
  const pl = evt.place_id ? PLACES[evt.place_id] : null;
  const raw = pl ? (pl.state || "") : "";
  if (!raw) return { key: null, group: CHRON_NO_PLACE, label: CHRON_NO_PLACE, color: null };
  let key = null;
  for (const ch of raw) { if (STATE_FAMILY_VAR[ch]) { key = ch; break; } }
  return { key, group: key || CHRON_OTHER, label: raw,
           color: key ? (pal ? pal[key] : familyColor(key)) : null };
}
const chronFiltered = () => chronView.states.size > 0 || chronView.cats.size > 0;

function renderChronicle() {
  const list = $("#chron-list");
  // 九国色一次读入，避免每行各调一次 getComputedStyle（190 行 × 一次强制取样没有必要）
  const pal = Object.fromEntries(Object.keys(STATE_FAMILY_VAR).map(k => [k, familyColor(k)]));
  /* 搜索直达优先于筛选：落锚是导航动作，筛选是浏览态。若不清筛选，
   * 搜来的事件可能恰好被当前筛选挡在表外，读者只会看到一张空表。 */
  if (pendingSpot && pendingSpot.view === "chronicle") { chronView.states.clear(); chronView.cats.clear(); }
  const rows = DATA.events.slice().sort(evtCompare).map(e => ({ e, st: chronStateOf(e, pal) }));
  renderChronFilters(rows);
  const shown = rows.filter(r =>
    (!chronView.states.size || chronView.states.has(r.st.group)) &&
    (!chronView.cats.size || chronView.cats.has(r.e.category || CHRON_OTHER)));

  const t0 = (typeof performance !== "undefined" ? performance.now() : 0);
  list.textContent = "";
  const frag = document.createDocumentFragment();
  let prevYear = null;
  for (const r of shown) {
    frag.appendChild(chronRow(r, prevYear));
    prevYear = r.e.year_bce;
  }
  if (!shown.length) {   // 两组筛选取交集，可以筛空（如「陈 × 婚嫁」）；空表须自己说话，不留白屏
    const em = document.createElement("li");
    em.className = "chron-empty";
    em.textContent = "此组合下库中无事件——松开一两个条件试试。";
    frag.appendChild(em);
  }
  list.appendChild(frag);
  /* 规模实测留痕（r25 任务书「约 225 行直接渲染，无需虚拟滚动，请实测确认」）：
   * 直接渲染全部行、不做虚拟滚动，条目详情按需展开（chronEnsureBody）。
   * 实测数值由 tools/qa/vision_r24a.js §11 读此字段报数。 */
  list.dataset.renderMs = String(Math.round(((typeof performance !== "undefined" ? performance.now() : 0) - t0) * 100) / 100);
  list.dataset.rows = String(shown.length);

  const nOrphan = rows.filter(r => !DATA.event_people.some(l =>
    l.event_id === r.e.id && isProto(l.person_id))).length;
  $("#chron-intro").textContent =
    "全库 " + rows.length + " 条事件按年铺开，同年之内依经传季月次第（sort_key）排列；" +
    "其中 " + nOrphan + " 条未系于任何主角，只此一处可见。点任一行，展开其出处、可靠度与所系人物。";
  $("#chron-status").textContent = chronFiltered()
    ? "筛选中：现列 " + shown.length + " / " + rows.length + " 条。"
    : "现列 " + shown.length + " 条（全库）。";
  consumeChronicleSpot(list);
}

function chronRow(r, prevYear) {
  const e = r.e;
  const li = document.createElement("li");
  const det = document.createElement("details");
  const hasQuote = DATA.passages.some(pp => pp.event_id === e.id);
  const sameYear = prevYear !== null && prevYear === e.year_bce;
  det.className = "event chron-row" + (e.importance === 1 ? " major" : "") +
                  (hasQuote ? " has-quote" : "") +
                  (sameYear ? " same-year" : (prevYear !== null ? " year-start" : ""));
  det.dataset.eid = e.id;
  det.dataset.year = String(e.year_bce);
  det.dataset.state = r.st.group;
  det.dataset.cat = e.category || CHRON_OTHER;

  const sum = document.createElement("summary");
  const ico = document.createElement("span");
  ico.className = "cat-ico";
  ico.title = e.category || CHRON_OTHER;
  fetchSVG(CAT_ICON[e.category] || "qita").then(t => { ico.innerHTML = t; });
  sum.appendChild(ico);

  const when = document.createElement("span");
  when.className = "when";
  when.textContent = yearLabel(e.year_bce);
  const small = document.createElement("small");
  small.textContent = [e.lu_reign, e.season_month].filter(Boolean).join(" · ");
  when.appendChild(small);
  sum.appendChild(when);

  const tag = document.createElement("span");
  tag.className = "chron-state" + (r.st.color ? "" : " is-neutral");
  if (r.st.color) tag.style.setProperty("--tag", r.st.color);
  const dot = document.createElement("i");
  dot.setAttribute("aria-hidden", "true");
  tag.appendChild(dot);
  tag.appendChild(document.createTextNode(r.st.label));
  tag.title = r.st.group === CHRON_NO_PLACE
    ? "本条无地望（事不系于一地，或地望无考）"
    : "事发地属「" + r.st.label + "」" + (r.st.color ? "，签色即其国色" : "（该国未立国色，作中性签）");
  sum.appendChild(tag);

  const title = document.createElement("span");
  title.className = "evt-title";
  title.textContent = e.title;
  sum.appendChild(title);

  const hint = document.createElement("span");
  hint.className = "evt-hint";
  hint.setAttribute("aria-hidden", "true");
  sum.appendChild(hint);
  det.appendChild(sum);

  /* 详情按需构建：190 行若全量预建卡体（含 280 条引文与近 500 枚人物签），
   * 首屏要白白造出读者九成不会展开的 DOM。展开即建、幂等可重入（见 chronEnsureBody）。 */
  det.addEventListener("toggle", () => { if (det.open) chronEnsureBody(det); });
  li.appendChild(det);
  return li;
}
/* 幂等构建卡体（§7 体例二/三：DOM 可弃、用时重建，节点身份取自 data-eid 而非闭包记忆）。
 * 已有卡体即返回；节点若被换掉，下次展开照样自建，不存在「一定还在」的假定。 */
function chronEnsureBody(det) {
  if (det.querySelector(".event-body")) return;
  const evt = EVENTS[det.dataset.eid];
  if (!evt) return;
  det.appendChild(eventBodyNode(evt, { people: true }));
}

/* 轻筛选（一期从简，不做年段滑块）：按国、按分类各一组 chips，组内多选取并集、组间取交集。
 * 计数一律按全库算（非按当前筛选结果），使读者一眼见得全局分布，选中后也不会看到计数跳变。 */
function renderChronFilters(rows) {
  const mk = (host, label, items, sel) => {
    host.textContent = "";
    const lb = document.createElement("span");
    lb.className = "chron-flabel";
    lb.textContent = label;
    host.appendChild(lb);
    for (const it of items) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip chron-chip";
      b.dataset.key = it.key;
      b.setAttribute("aria-pressed", String(sel.has(it.key)));
      if (it.color) {
        b.style.setProperty("--tag", it.color);
        const d = document.createElement("i");
        d.className = "cc-dot";
        d.setAttribute("aria-hidden", "true");
        b.appendChild(d);
      }
      b.appendChild(document.createTextNode(it.key + " " + it.n));
      b.addEventListener("click", () => {
        if (sel.has(it.key)) sel.delete(it.key); else sel.add(it.key);
        renderChronicle();
      });
      host.appendChild(b);
    }
  };
  const pal = Object.fromEntries(Object.keys(STATE_FAMILY_VAR).map(k => [k, familyColor(k)]));
  const cnt = (fn) => rows.reduce((m, r) => { const k = fn(r); m[k] = (m[k] || 0) + 1; return m; }, {});
  const sc = cnt(r => r.st.group);
  const stateItems = [...Object.keys(STATE_FAMILY_VAR), CHRON_OTHER, CHRON_NO_PLACE]
    .filter(k => sc[k]).map(k => ({ key: k, n: sc[k], color: pal[k] || null }));
  const cc = cnt(r => r.e.category || CHRON_OTHER);
  const catItems = Object.keys(CAT_ICON).filter(k => cc[k]).map(k => ({ key: k, n: cc[k], color: null }));
  mk($("#chron-f-state"), "按国", stateItems, chronView.states);
  mk($("#chron-f-cat"), "按分类", catItems, chronView.cats);
  const clr = $("#chron-clear");
  clr.hidden = !chronFiltered();
}

/* 搜索直达编年：展开目标事件、落锚其年（同年诸条一并标出），原文命中再定位到具体引文块 */
function consumeChronicleSpot(list) {
  if (!pendingSpot || pendingSpot.view !== "chronicle") return;
  const spot = pendingSpot;
  pendingSpot = null;
  const det = list.querySelector('details[data-eid="' + spot.eid + '"]');
  if (!det) return;
  chronEnsureBody(det);
  det.open = true;
  const target = spot.type === "quote"
    ? det.querySelector('[data-qid="' + spot.qid + '"]') || det
    : det;
  det.classList.add("spotlight");
  setTimeout(() => det.classList.remove("spotlight"), 2400);
  // 落锚该年：同年诸行一并加锚标（同年多事时，一眼见其左右邻）
  const y = det.dataset.year;
  const sameYear = list.querySelectorAll('details[data-year="' + y + '"]');
  sameYear.forEach(d => d.classList.add("year-anchor"));
  const evt = EVENTS[spot.eid];
  $("#chron-status").textContent =
    "已落锚 " + yearLabel(+y) + (evt && evt.lu_reign ? " · " + evt.lu_reign : "") +
    "（该年 " + sameYear.length + " 条）。" + $("#chron-status").textContent;
  spotScrollInto(target, det.querySelector("summary"));
}

/* ---------- 屏3 地图 ---------- */
const mapState = {
  svg: null,          // 当前注入的地图 svg 节点
  mode: "fit",        // fit=活动范围 | full=全图
  fitBox: null,
  box: null,          // 当前 viewBox
  overlay: false,
  panDist: 0,
  pointers: new Map(),
  pinch: null,
  panStart: null,
};

function computeFitBox(points) {
  const FULL = { x: 0, y: 0, w: MAP_W, h: MAP_H };
  if (!points.length) return FULL;
  let minX = Math.min(...points.map(p => p[0])), maxX = Math.max(...points.map(p => p[0]));
  let minY = Math.min(...points.map(p => p[1])), maxY = Math.max(...points.map(p => p[1]));
  const mx = (maxX - minX) * 0.15 + 25, my = (maxY - minY) * 0.15 + 25;
  minX -= mx; maxX += mx; minY -= my; maxY += my;
  let w = maxX - minX, h = maxY - minY;
  const MIN_SPAN = 250;
  if (w < MIN_SPAN) { const c = (minX + maxX) / 2; w = MIN_SPAN; minX = c - w / 2; }
  if (h < MIN_SPAN * MAP_H / MAP_W) { const c = (minY + maxY) / 2; h = MIN_SPAN * MAP_H / MAP_W; minY = c - h / 2; }
  // 撑到全图纵横比，避免留边不均
  if (w / h > MAP_W / MAP_H) { const c = minY + h / 2; h = w * MAP_H / MAP_W; minY = c - h / 2; }
  else { const c = minX + w / 2; w = h * MAP_W / MAP_H; minX = c - w / 2; }
  w = Math.min(w, MAP_W); h = Math.min(h, MAP_H);
  minX = Math.max(0, Math.min(minX, MAP_W - w));
  minY = Math.max(0, Math.min(minY, MAP_H - h));
  return { x: minX, y: minY, w, h };
}

function applyView(box) {
  const svg = mapState.svg;
  if (!svg) return;
  mapState.box = box;
  svg.setAttribute("viewBox", box.x + " " + box.y + " " + box.w + " " + box.h);
  const s = box.w / MAP_W; // 缩放补偿：放大后点不变大、字不变大
  svg.querySelectorAll("[data-r]").forEach(el => {
    el.setAttribute("r", parseFloat(el.dataset.r) * Math.max(s, 0.25));
  });
  svg.querySelectorAll("[data-fs]").forEach(el => {
    el.style.fontSize = (parseFloat(el.dataset.fs) * Math.max(s, 0.25)) + "px";
  });
}

function renderMap() {
  resetPlacePanel();
  const canvas = $("#map-canvas");
  canvas.innerHTML = baseMapText;
  mountCaption("single");   // 内嵌图框内的字幕条同为派生物（静态节点已移除，见 mountCaption 注释）
  const svg = canvas.querySelector("svg");
  mapState.svg = svg;
  const anchors = svg.querySelector("#layer-anchors");
  const NS = "http://www.w3.org/2000/svg";
  const theme = getComputedStyle(document.documentElement).getPropertyValue("--theme").trim();

  // 线宽不随缩放变粗
  svg.querySelectorAll("path, polyline, line, circle, ellipse").forEach(el => {
    el.setAttribute("vector-effect", "non-scaling-stroke");
  });
  // 底图标注参与缩放补偿
  svg.querySelectorAll("#layer-labels g").forEach(g => {
    g.dataset.fs = g.getAttribute("font-size") || "14";
    g.style.fontSize = g.dataset.fs + "px";
  });

  const events = personEvents(state.person);
  const related = new Map();
  for (const e of events) {
    if (!e.place_id) continue;
    if (!related.has(e.place_id)) related.set(e.place_id, { events: [], hasVisit: false });
    const slot = related.get(e.place_id);
    slot.events.push(e);
    if (e.presence !== "相关") slot.hasVisit = true;
  }

  // 轨迹：仅亲至；连续同地或同坐标聚合为一站（杜绝零长度段）
  const traj = [];
  for (const e of events) {
    if (e.presence === "相关") continue;
    const pl = e.place_id ? PLACES[e.place_id] : null;
    if (!pl || pl.lat == null || pl.lng == null) continue;
    const [px, py] = project(pl.lng, pl.lat);
    const last = traj[traj.length - 1];
    if (last && (last.place.id === pl.id || Math.hypot(px - last.x, py - last.y) < 0.5)) {
      last.events.push(e);
      if (!last.placeNames.includes(pl.ancient_name)) last.placeNames.push(pl.ancient_name);
      continue;
    }
    traj.push({ place: pl, placeNames: [pl.ancient_name], x: px, y: py, events: [e] });
  }
  if (traj.length > 1) {
    const path = document.createElementNS(NS, "polyline");
    path.setAttribute("points", traj.map(t => t.x + "," + t.y).join(" "));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", theme);
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-dasharray", "6 5");
    path.setAttribute("opacity", "0.75");
    path.setAttribute("class", "traj");
    path.setAttribute("vector-effect", "non-scaling-stroke");
    anchors.appendChild(path);
  }

  // 锚点
  const fitPoints = [];
  for (const pl of DATA.places) {
    if (pl.lat == null || pl.lng == null) continue;
    const [px, py] = project(pl.lng, pl.lat);
    const slot = related.get(pl.id);
    if (slot) fitPoints.push([px, py]);
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "anchor");
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.dataset.place = pl.id;
    const dot = document.createElementNS(NS, "circle");
    dot.setAttribute("class", "dot");
    dot.setAttribute("cx", px); dot.setAttribute("cy", py);
    dot.setAttribute("vector-effect", "non-scaling-stroke");
    let baseR;
    if (slot && slot.hasVisit) {
      baseR = slot.events.some(e => e.importance === 1) ? 7 : 5.5;
      dot.setAttribute("fill", theme);
      dot.setAttribute("stroke", "#F4EDDF");
      dot.setAttribute("stroke-width", "1.6");
      g.setAttribute("aria-label", pl.ancient_name + "（亲至地点）");
    } else if (slot) {
      baseR = 5.5;
      dot.setAttribute("fill", "#F4EDDF");
      dot.setAttribute("stroke", theme);
      dot.setAttribute("stroke-width", "2.2");
      // presence 措辞分寸（r21）：「相关」＝史文无其在场明文，非「史文书其不在场」，不得写成断言
      g.setAttribute("aria-label", pl.ancient_name + "（相关地点，史文无其在场明文）");
    } else {
      baseR = 3.5;
      dot.setAttribute("fill", "#F4EDDF");
      dot.setAttribute("stroke", "#8A8072");
      dot.setAttribute("stroke-width", "1.2");
      g.setAttribute("opacity", "0.65");
      g.setAttribute("aria-label", pl.ancient_name);
    }
    dot.dataset.r = baseR;
    dot.setAttribute("r", baseR);
    g.appendChild(dot);
    if (slot) {
      const label = document.createElementNS(NS, "text");
      label.setAttribute("x", px + 9); label.setAttribute("y", py + 4);
      label.dataset.fs = 13;
      label.textContent = pl.ancient_name;
      g.appendChild(label);
    }
    const open = () => {
      if (mapState.panDist > 6) return; // 拖移后误触不算点击
      if (player.raf) return; // 播放期间不展开卡片/抽屉，画面聚焦地图；暂停或播完后恢复
      showPlace(pl, slot ? slot.events : []);
    };
    g.addEventListener("click", open);
    g.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); open(); }
    });
    anchors.appendChild(g);
  }

  // 轨迹序号
  traj.forEach((t, i) => {
    const n = document.createElementNS(NS, "text");
    n.setAttribute("x", t.x - 12); n.setAttribute("y", t.y - 8);
    n.dataset.fs = 10;
    n.setAttribute("fill", theme);
    n.setAttribute("class", "traj");
    n.textContent = String(i + 1);
    anchors.appendChild(n);
  });

  // 未定位地点侧栏
  const noCoord = [...related.keys()]
    .map(id => PLACES[id])
    .filter(pl => pl && (pl.lat == null || pl.lng == null));
  $("#nocoord-panel").hidden = noCoord.length === 0;
  const nl = $("#nocoord-list");
  nl.textContent = "";
  for (const pl of noCoord) {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = pl.ancient_name + "（" + (pl.modern_location || "地望不详") + "）";
    b.addEventListener("click", () => showPlace(pl, related.get(pl.id).events));
    li.appendChild(b);
    nl.appendChild(li);
  }

  // 无地望事件计数
  const noGeo = events.filter(e => {
    const pl = e.place_id ? PLACES[e.place_id] : null;
    return !pl || pl.lat == null || pl.lng == null;
  });
  const ngBox = $("#map-nogeo");
  ngBox.hidden = noGeo.length === 0;
  ngBox.open = false;
  $("#map-nogeo-summary").textContent = noGeo.length + " 条事件无地望，未入轨迹";
  ngBox.title = noGeo.map(e => yearLabel(e.year_bce) + " " + e.title).join("；");
  const ngList = $("#map-nogeo-list");
  ngList.textContent = "";
  for (const e of noGeo) {
    const li = document.createElement("li");
    li.textContent = yearLabel(e.year_bce) + " " + e.title;
    ngList.appendChild(li);
  }

  // 取景
  mapState.fitBox = computeFitBox(fitPoints);
  applyView(mapState.mode === "fit" ? mapState.fitBox : { x: 0, y: 0, w: MAP_W, h: MAP_H });
  updateScopeBtn();

  /* 状态行：轨迹句 ＋（若另有「相关」落点）一句补注，令「史文所系之地」与「亲至可考之地」同行可分。
   * 相关落点数＝有事件、无任一亲至、且有坐标的地点数（与锚点空心口径一致）。 */
  let relOnly = 0;
  for (const [pid, slot] of related) {
    const pl = PLACES[pid];
    if (!slot.hasVisit && pl && pl.lat != null && pl.lng != null) relOnly++;
  }
  $("#map-status").textContent = (traj.length >= 2
    ? "亲至轨迹共 " + traj.length + " 站，" + yearLabel(traj[0].events[0].year_bce) + " 起。"
    : traj.length === 1
      ? "亲至可考一地：" + traj[0].placeNames.join("、") + "。"
      : "该人物暂无可落图的亲至地点。") + (relOnly ? RELATED_PLACE_NOTE(relOnly) : "");
  const btn = $("#btn-play");
  setPlayDegrade("single", traj.length < 2); // 落点<2：播放按钮替换为静态降级说明
  btn.onclick = () => toggleSinglePlay(traj, anchors, theme);

  $("#btn-scope").onclick = () => {
    mapState.mode = mapState.mode === "fit" ? "full" : "fit";
    applyView(mapState.mode === "fit" ? mapState.fitBox : { x: 0, y: 0, w: MAP_W, h: MAP_H });
    updateScopeBtn();
  };
  $("#btn-zoom").onclick = openOverlay;

  bindPanZoom(svg);

  const disBtn = $("#btn-disclaimer");
  const pop = $("#disclaimer-pop");
  pop.hidden = true;
  disBtn.setAttribute("aria-expanded", "false");
  disBtn.onclick = () => {
    pop.hidden = !pop.hidden;
    disBtn.setAttribute("aria-expanded", String(!pop.hidden));
  };

  // 搜索直达：打开目标地点详情并保证锚点入镜（活动范围外则切全图视野）
  if (pendingSpot && pendingSpot.type === "place") {
    const pl = PLACES[pendingSpot.placeId];
    pendingSpot = null;
    if (pl) {
      if (pl.lat != null && pl.lng != null) {
        const [px, py] = project(pl.lng, pl.lat);
        const b = mapState.box;
        if (b && (px < b.x || px > b.x + b.w || py < b.y || py > b.y + b.h)) {
          mapState.mode = "full";
          applyView({ x: 0, y: 0, w: MAP_W, h: MAP_H });
          updateScopeBtn();
        }
      }
      const slot = related.get(pl.id);
      showPlace(pl, slot ? slot.events : []);
    }
  }
}
function updateScopeBtn() {
  const b = $("#btn-scope");
  b.textContent = mapState.mode === "fit" ? "视野：活动范围" : "视野：全图";
  b.setAttribute("aria-pressed", String(mapState.mode === "fit"));
}

/* ---------- 地点详情：内嵌态（含窄屏）走地图下方文档流卡片 / 仅全屏态走底部抽屉 ----------
 * 窄屏内嵌视图曾用 fixed 抽屉，与页面缩放冲突（只露一角），round6 回归文档流卡片。 */
const drawer = { open: false, lastFocus: null, dragY: null };
function useDrawer() {
  return mapState.overlay;
}
function showPlace(pl, evts) {
  const title = pl.ancient_name + (pl.state ? "（" + pl.state + "）" : "");
  const content = buildPlaceContent(pl, evts);
  markSelectedAnchor(pl.id);
  if (useDrawer()) {
    openDrawer(title, content);
    if (pl.lat != null && pl.lng != null) {
      const [px, py] = project(pl.lng, pl.lat);
      ensureVisiblePoint(px, py);
    }
  } else {
    const panel = $("#place-panel");
    panel.textContent = "";
    const h3 = document.createElement("h3");
    h3.textContent = title;
    panel.appendChild(h3);
    panel.appendChild(content);
    // 窄屏内嵌视图：卡片位于地图下方，轻滚使其进入视野（block:nearest 只做最小滚动，
    // 不与用户的页面缩放状态冲突；地图与选中点尽量保持可见）
    if (window.matchMedia("(max-width: 680px)").matches) {
      panel.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }
}
function resetPlacePanel() {
  const panel = $("#place-panel");
  panel.textContent = "";
  const h3 = document.createElement("h3");
  h3.textContent = "地点详情";
  panel.appendChild(h3);
  const p = document.createElement("p");
  p.className = "map-status";
  p.textContent = "点地图上任一地点，看古名、今地与相关事件。";
  panel.appendChild(p);
}
function markSelectedAnchor(placeId) {
  document.querySelectorAll(".anchor.selected").forEach(g => g.classList.remove("selected"));
  const g = document.querySelector('.anchor[data-place="' + placeId + '"]');
  if (g) g.classList.add("selected");
}
function clearAnchorSelection() {
  document.querySelectorAll(".anchor.selected").forEach(g => g.classList.remove("selected"));
}
function ensureVisiblePoint(px, py) {
  const b = mapState.box;
  if (!b) return;
  // 抽屉约占视口下方45%，把选中点收进上半可见区
  if (py > b.y + b.h * 0.5 || py < b.y + b.h * 0.06) {
    const ny = Math.max(0, Math.min(py - b.h * 0.28, MAP_H - b.h));
    applyView({ x: b.x, y: ny, w: b.w, h: b.h });
  }
}
function openDrawer(title, contentNode) {
  const d = $("#place-drawer"), bd = $("#drawer-backdrop");
  $("#drawer-title").textContent = title;
  const c = $("#drawer-content");
  c.textContent = "";
  c.appendChild(contentNode);
  c.scrollTop = 0;
  if (!drawer.open) drawer.lastFocus = document.activeElement;
  bd.hidden = false;
  d.hidden = false;
  requestAnimationFrame(() => { d.classList.add("open"); bd.classList.add("open"); });
  drawer.open = true;
  $("#drawer-close").focus();
}
function closeDrawer() {
  if (!drawer.open) return;
  const d = $("#place-drawer"), bd = $("#drawer-backdrop");
  d.classList.remove("open");
  bd.classList.remove("open");
  drawer.open = false;
  setTimeout(() => {
    if (!drawer.open) { d.hidden = true; bd.hidden = true; }
  }, 250);
  clearAnchorSelection();
  if (drawer.lastFocus && drawer.lastFocus.isConnected) drawer.lastFocus.focus();
}
function buildPlaceContent(pl, evts) {
  const dl = document.createElement("dl");
  const row = (dt, dd) => {
    if (!dd) return;
    const t = document.createElement("dt"); t.textContent = dt;
    const d = document.createElement("dd"); d.textContent = dd;
    dl.appendChild(t); dl.appendChild(d);
  };
  row("今地", pl.modern_location);
  row("地望确定性", pl.certainty);
  row("坐标", pl.lat != null ? pl.lat + ", " + pl.lng + "（" + (pl.coord_certainty || "?") + "）" : "未定位");
  row("坐标依据", pl.coord_basis);
  row("说明", pl.description);
  if (evts && evts.length) {
    const t = document.createElement("dt"); t.textContent = "相关事件";
    dl.appendChild(t);
    const ul = document.createElement("ul");
    for (const e of evts) {
      const li = document.createElement("li");
      li.textContent = yearLabel(e.year_bce) + " " + e.title + (e.presence === "相关" ? "（相关）" : "");
      ul.appendChild(li);
    }
    const d = document.createElement("dd"); d.appendChild(ul); dl.appendChild(d);
  }
  return dl;
}

/* ---------- 全屏查看：拖移 + 滚轮/双指缩放 ---------- */
function clampBox(b) {
  let w = Math.max(120, Math.min(b.w, MAP_W));
  let h = w * MAP_H / MAP_W;
  let x = Math.max(0, Math.min(b.x, MAP_W - w));
  let y = Math.max(0, Math.min(b.y, MAP_H - h));
  return { x, y, w, h };
}
function svgPoint(svg, clientX, clientY) {
  const rect = svg.getBoundingClientRect();
  const b = mapState.box;
  return [b.x + (clientX - rect.left) / rect.width * b.w,
          b.y + (clientY - rect.top) / rect.height * b.h];
}
function bindPanZoom(svg) {
  /* 指针捕获延迟到「确认拖移/捏合」才设置：pointerdown 即捕获会把桌面鼠标的 click
   * 重定向到 svg 本身，锚点 click 永不触发——即「桌面全屏点地点无反应」bug（r10 修复）。
   * 触屏的 click 由触摸序列合成、不受指针捕获影响，故此前仅手机端幸免。 */
  const capture = (id) => { try { svg.setPointerCapture(id); } catch { /* 指针已释放 */ } };
  svg.addEventListener("pointerdown", (e) => {
    if (!mapState.overlay) return;
    mapState.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    mapState.panDist = 0;
    if (mapState.pointers.size === 1) {
      mapState.panStart = { box: { ...mapState.box }, x: e.clientX, y: e.clientY };
      mapState.pinch = null;
    } else if (mapState.pointers.size === 2) {
      for (const id of mapState.pointers.keys()) capture(id); // 双指=明确的捏合意图
      const pts = [...mapState.pointers.values()];
      mapState.pinch = {
        box: { ...mapState.box },
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        mid: svgPoint(svg, (pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2),
      };
      mapState.panStart = null;
    }
  });
  svg.addEventListener("pointermove", (e) => {
    if (!mapState.overlay || !mapState.pointers.has(e.pointerId)) return;
    mapState.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    // 单指移动超过阈值＝确认拖移，此时才捕获指针（出画布仍可继续拖）
    if (mapState.panStart && !svg.hasPointerCapture(e.pointerId)) {
      const moved = Math.hypot(e.clientX - mapState.panStart.x, e.clientY - mapState.panStart.y);
      if (moved > 4) capture(e.pointerId);
    }
    const rect = svg.getBoundingClientRect();
    if (mapState.pointers.size === 2 && mapState.pinch) {
      const pts = [...mapState.pointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (dist < 10) return;
      const k = mapState.pinch.dist / dist; // 捏合放大 → k<1
      let w = mapState.pinch.box.w * k;
      w = Math.max(120, Math.min(w, MAP_W));
      const h = w * MAP_H / MAP_W;
      const midClient = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const x = mapState.pinch.mid[0] - (midClient.x - rect.left) / rect.width * w;
      const y = mapState.pinch.mid[1] - (midClient.y - rect.top) / rect.height * h;
      mapState.panDist = 99;
      applyView(clampBox({ x, y, w, h }));
    } else if (mapState.panStart) {
      const dx = e.clientX - mapState.panStart.x;
      const dy = e.clientY - mapState.panStart.y;
      mapState.panDist = Math.max(mapState.panDist, Math.hypot(dx, dy));
      const b = mapState.panStart.box;
      applyView(clampBox({
        x: b.x - dx / rect.width * b.w,
        y: b.y - dy / rect.height * b.h,
        w: b.w, h: b.h,
      }));
    }
  });
  const lift = (e) => {
    mapState.pointers.delete(e.pointerId);
    if (mapState.pointers.size < 2) mapState.pinch = null;
    if (mapState.pointers.size === 0) {
      mapState.panStart = null;
      setTimeout(() => { mapState.panDist = 0; }, 50);
    }
  };
  svg.addEventListener("pointerup", lift);
  svg.addEventListener("pointercancel", lift);
  svg.addEventListener("wheel", (e) => {
    if (!mapState.overlay) return;
    e.preventDefault();
    const k = e.deltaY < 0 ? 0.85 : 1 / 0.85;
    const b = mapState.box;
    let w = Math.max(120, Math.min(b.w * k, MAP_W));
    const h = w * MAP_H / MAP_W;
    const [sx, sy] = svgPoint(svg, e.clientX, e.clientY);
    const rect = svg.getBoundingClientRect();
    const x = sx - (e.clientX - rect.left) / rect.width * w;
    const y = sy - (e.clientY - rect.top) / rect.height * h;
    applyView(clampBox({ x, y, w, h }));
  }, { passive: false });
}
function openOverlay() {
  if (!mapState.svg) return;
  const overlay = $("#map-overlay");
  overlay.hidden = false;
  $("#map-overlay-body").appendChild(mapState.svg);
  mapState.overlay = true;
  mountCaption("single");  // 字幕条派生式重挂入全屏容器（须在 mapState.overlay 置位之后——容器由它派生）
  document.body.classList.add("no-scroll");
  mountOverlayControls("single");
  $("#btn-overlay-close").focus();
}
/* 全屏浮层播放悬浮控件（r17b 引入·r18 定稿为仅「播放/暂停」·r24a 移位左上·r24a-fix 改幂等重建）：
 * 单人/并观、桌面/手机四组合同用。播放/暂停委托主工具条按钮（复用其 onclick 闭包与播放状态）；
 * 文案由 setPlayBtnText 主/浮层同写，故全屏内外播放状态无缝双向同步（全屏中暂停→退出仍暂停；反之亦然）。
 *
 * 【为何每次重建而非静态单例】控件挂在 #map-overlay-body 内（r24a 移位所致），而浮层的三处入口
 *   ——openRelOverlay / closeRelOverlay / openCmpOverlay——都以 `body.textContent = ""` 清空容器再挂
 *   自己的内容，静态单例节点被连带销毁后永不回来：此后 `$("#overlay-controls")` 恒为 null，旧
 *   setupOverlayControls 的 `if (!box) return` 只是静默空转，于是单人全屏也一并没了控件，须整页刷新才复原
 *   （r24a 生产实测：单人全屏→并观全屏→单人全屏，控件消失）。同源于 r16「克隆体丢失事件绑定」一族问题
 *   （此处旧注误记为 r17b，r24a-fix2 收尾据 delivery_vision_r16 §根因① 与下方 openRelOverlay 注释订正为 r16）：
 *   凡跨浮层存活的节点/绑定都靠不住。断根之道是 DOM 可弃、状态派生——每次开浮层先清残留再新建，
 *   显隐与文案一律从主工具条按钮当场读出，不依赖任何跨浮层存活的节点。
 *   本条即 design_notes §7.1「同族三相」之相三（无重建路径），正解＝派生式重挂；改动本函数前请先读该节。 */
function mountOverlayControls(mode) {
  unmountOverlayControls();                    // 幂等：先清残留（含被 body 清空后遗留的引用），再重建
  const body = $("#map-overlay-body");
  if (!body) return null;
  const mainPlay = mode === "single" ? "#btn-play" : "#cmp-play";
  const mp = $(mainPlay);
  if (!mp || mp.disabled) return null;         // 无轨迹不可播则不建控件（等价于旧的 box.hidden）
  const box = document.createElement("div");
  box.className = "overlay-controls";
  box.id = "overlay-controls";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = "ov-play";
  btn.textContent = mp.textContent;            // 状态派生：开全屏即同步当前播放/暂停态
  btn.onclick = () => { const b = $(mainPlay); if (b) b.click(); }; // 委托：复用主按钮 onclick 闭包
  box.appendChild(btn);
  body.appendChild(box);                       // 末位挂载 → 叠于地图 svg 之上（另有 z-index:8 兜底）
  return box;
}
function unmountOverlayControls() {
  const box = $("#overlay-controls");
  if (box) box.remove();
}
function closeOverlay() {
  if (cmpZoom.active) { closeCmpOverlay(); return; }
  if (relZoom.active) { closeRelOverlay(); return; }
  if (!mapState.overlay) return;
  if (drawer.open) closeDrawer(); // 全屏关闭时一并收起底部抽屉，避免其孤悬
  const overlay = $("#map-overlay");
  overlay.hidden = true;
  document.body.classList.remove("no-scroll");
  unmountOverlayControls();
  if (mapState.svg) $("#map-canvas").appendChild(mapState.svg);
  mapState.overlay = false;
  mountCaption("single");  // 字幕条派生式重挂回内嵌图框（须在 mapState.overlay 清零之后）
  mapState.pointers.clear();
  mapState.pinch = null;
  mapState.panStart = null;
  applyView(mapState.mode === "fit" ? mapState.fitBox : { x: 0, y: 0, w: MAP_W, h: MAP_H });
}

/* ---------- 关系图「放大查看」：复用地图全屏浮层与手势机制（r13 起；r16 修复点边/点节点无反应＋手机取景过小）。
 * 关系图内嵌态为纯静态、不拦截页面滚动；细看时把当前图克隆入全屏浮层，拖移/滚轮/双指缩放皆与地图一致。
 * 克隆而非移动：内嵌图保持原位、其 recenter/看连线交互不受影响。
 * r16 两处修复见 openRelOverlay：①克隆丢失事件绑定→按 data-detail/data-node 在克隆体上重绑，
 * 且全屏内点边/点节点一律走底部抽屉（对齐地图全屏，而非内嵌右侧卡片）；②取景改 fit-to-container，
 * 按容器实测宽高定 viewBox 比例，竖屏 cover、横屏 contain，令手机进入全屏即明显放大。
 * 【规范】①即 design_notes §7.1「同族三相」的最早一例（绑定版）：cloneNode(true) 不复制 addEventListener
 *   注册的处理器，克隆体成哑元素；正解＝按身份（data-detail/data-node）派生式重绑，不指望绑定跨容器存活。 ---------- */
const relZoom = {
  active: false, svg: null, vbW: 0, vbH: 0, minFrac: 0.2, box: null, aspect: 0,
  pointers: new Map(), pinch: null, panStart: null, panDist: 0,
};
/* aspect＝取景盒的宽高比，进入全屏时按「浮层容器实测宽高」定死（fit-to-container），
 * 之后拖移/缩放全程沿用同一比例，使 viewBox 与容器等比、preserveAspectRatio meet 恰好填满、
 * 无上下留白——这是「手机全屏内容偏小」的取景侧修复关键（详见 relZoomInitView）。 */
function zClamp(box, vbW, vbH, minFrac, aspect) {
  aspect = aspect || (vbW / vbH);
  let w = Math.min(vbW, Math.max(vbW * minFrac, box.w));
  let h = w / aspect;
  if (h > vbH) { h = vbH; w = Math.min(vbW, h * aspect); } // 竖屏比例算出的高越界时以高为准回算
  const x = Math.max(0, Math.min(box.x, vbW - w));
  const y = Math.max(0, Math.min(box.y, vbH - h));
  return { x, y, w, h };
}
function zSvgPoint(svg, box, cx, cy) {
  const rect = svg.getBoundingClientRect();
  return [box.x + (cx - rect.left) / rect.width * box.w,
          box.y + (cy - rect.top) / rect.height * box.h];
}
/* 通用捏合/拖移/滚轮手势绑定：与地图 bindPanZoom 同逻辑，作用于任意带 viewBox 的 svg */
function bindZoomGesture(svg, Z) {
  const capture = (id) => { try { svg.setPointerCapture(id); } catch { /* 指针已释放 */ } };
  const apply = (box) => {
    Z.box = box;
    svg.setAttribute("viewBox", box.x + " " + box.y + " " + box.w + " " + box.h);
  };
  Z.apply = apply;
  svg.addEventListener("pointerdown", (e) => {
    if (!Z.active) return;
    Z.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    Z.panDist = 0;
    if (Z.pointers.size === 1) {
      Z.panStart = { box: { ...Z.box }, x: e.clientX, y: e.clientY };
      Z.pinch = null;
    } else if (Z.pointers.size === 2) {
      for (const id of Z.pointers.keys()) capture(id);
      const pts = [...Z.pointers.values()];
      Z.pinch = {
        box: { ...Z.box },
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        mid: zSvgPoint(svg, Z.box, (pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2),
      };
      Z.panStart = null;
    }
  });
  svg.addEventListener("pointermove", (e) => {
    if (!Z.active || !Z.pointers.has(e.pointerId)) return;
    Z.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (Z.panStart && !svg.hasPointerCapture(e.pointerId)) {
      if (Math.hypot(e.clientX - Z.panStart.x, e.clientY - Z.panStart.y) > 4) capture(e.pointerId);
    }
    const rect = svg.getBoundingClientRect();
    if (Z.pointers.size === 2 && Z.pinch) {
      const pts = [...Z.pointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (dist < 10) return;
      const k = Z.pinch.dist / dist;
      const w = Math.max(Z.vbW * Z.minFrac, Math.min(Z.pinch.box.w * k, Z.vbW));
      const h = w / (Z.aspect || Z.vbW / Z.vbH);
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const x = Z.pinch.mid[0] - (mid.x - rect.left) / rect.width * w;
      const y = Z.pinch.mid[1] - (mid.y - rect.top) / rect.height * h;
      Z.panDist = 99;
      apply(zClamp({ x, y, w, h }, Z.vbW, Z.vbH, Z.minFrac, Z.aspect));
    } else if (Z.panStart) {
      const dx = e.clientX - Z.panStart.x, dy = e.clientY - Z.panStart.y;
      Z.panDist = Math.max(Z.panDist, Math.hypot(dx, dy));
      const b = Z.panStart.box;
      apply(zClamp({ x: b.x - dx / rect.width * b.w, y: b.y - dy / rect.height * b.h, w: b.w, h: b.h },
        Z.vbW, Z.vbH, Z.minFrac, Z.aspect));
    }
  });
  const lift = (e) => {
    Z.pointers.delete(e.pointerId);
    if (Z.pointers.size < 2) Z.pinch = null;
    if (Z.pointers.size === 0) { Z.panStart = null; setTimeout(() => { Z.panDist = 0; }, 50); }
  };
  svg.addEventListener("pointerup", lift);
  svg.addEventListener("pointercancel", lift);
  svg.addEventListener("wheel", (e) => {
    if (!Z.active) return;
    e.preventDefault();
    const k = e.deltaY < 0 ? 0.85 : 1 / 0.85;
    const w = Math.max(Z.vbW * Z.minFrac, Math.min(Z.box.w * k, Z.vbW));
    const h = w / (Z.aspect || Z.vbW / Z.vbH);
    const [sx, sy] = zSvgPoint(svg, Z.box, e.clientX, e.clientY);
    const rect = svg.getBoundingClientRect();
    const x = sx - (e.clientX - rect.left) / rect.width * w;
    const y = sy - (e.clientY - rect.top) / rect.height * h;
    apply(zClamp({ x, y, w, h }, Z.vbW, Z.vbH, Z.minFrac, Z.aspect));
  }, { passive: false });
}
function openRelOverlay() {
  const src = $("#rel-canvas").querySelector("svg");
  if (!src) return;
  const vb = (src.getAttribute("viewBox") || "0 0 1000 680").split(/\s+/).map(Number);
  const clone = src.cloneNode(true);
  const overlay = $("#map-overlay");
  overlay.setAttribute("aria-label", "关系图全屏查看");
  $("#map-overlay-hint").textContent = "拖移平移 · 滚轮/双指缩放 · 点连线/节点看关系";
  const body = $("#map-overlay-body");
  body.textContent = "";
  unmountOverlayControls(); // 关系图无轨迹播放，本浮层不挂控件（body 已清空，此处显式声明意图）
  body.appendChild(clone);
  overlay.hidden = false; // 先显示再量 bbox / 容器尺寸（display:none 下 getBBox 与 clientW/H 归零）
  document.body.classList.add("no-scroll");
  relZoom.active = true;
  relZoom.svg = clone;
  relZoom.vbW = vb[2] || 1000;
  relZoom.vbH = vb[3] || 680;
  relZoom.minFrac = 0.2;
  relZoom.aspect = 0;
  relZoom.pointers = new Map();
  relZoom.pinch = null;
  relZoom.panStart = null;
  relZoom.panDist = 0;
  bindZoomGesture(clone, relZoom);
  // 关键修复①（事件绑定）：cloneNode(true) 只复制 DOM 与属性、不复制 addEventListener 绑定的处理器，
  // 故克隆出的点边/节点在全屏内「点了没反应」。这里按 data-detail / data-node 标记在克隆体上重新绑定，
  // 且全屏内一律走底部抽屉（与地图全屏一致），而非内嵌态的右侧卡片。
  rebindRelClone(clone);
  // 关键修复②（取景）：按容器实测宽高做 fit-to-container 取景（见 relZoomInitView）。
  relZoomInitView();
  // 容器尺寸在本帧尚为 0（极端布局时序）时，下一帧再量一次补正，避免 fit 落到「全 viewBox 缩得极小」。
  if (!(body.clientWidth > 0 && body.clientHeight > 0)) requestAnimationFrame(relZoomInitView);
  $("#btn-overlay-close").focus();
}
/* fit-to-container 取景：viewBox 纵横比取「浮层容器实测宽高」，preserveAspectRatio meet 便恰好填满容器。
 * 竖屏容器（手机全屏，高>宽）用 cover 取景——填满容器、裁掉过宽两侧，拖移浏览，令进入全屏即明显放大；
 * 横屏/桌面容器用 contain 取景——整图可见，维持既有桌面观感。 */
function relZoomInitView() {
  const svg = relZoom.svg;
  if (!svg) return;
  const vbW = relZoom.vbW, vbH = relZoom.vbH, minFrac = relZoom.minFrac;
  const body = $("#map-overlay-body");
  const cw = body.clientWidth, ch = body.clientHeight;
  // 竖屏容器（手机全屏）取容器比例做 cover 放大；横屏/桌面/容器未就绪取图自身比例做 contain（整图可见、不裁切、维持既有桌面观感）
  relZoom.aspect = (cw > 0 && ch > 0 && ch > cw) ? cw / ch : vbW / vbH;
  const aspect = relZoom.aspect;
  let box = zClamp({ x: 0, y: 0, w: vbW, h: vbW / aspect }, vbW, vbH, minFrac, aspect);
  let bb = null;
  try { bb = svg.getBBox(); } catch { bb = null; }
  if (bb && bb.width > 1 && bb.height > 1) {
    const pad = 1.08;
    const bw = bb.width * pad, bh = bb.height * pad;
    const cxc = bb.x + bb.width / 2, cyc = bb.y + bb.height / 2;
    // 竖屏：cover（取内容宽与「内容高×比例」之较小者→填满、裁宽）；横屏：contain（较大者→整图可见）
    const boxW = (ch > cw) ? Math.min(bw, bh * aspect) : Math.max(bw, bh * aspect);
    const boxH = boxW / aspect;
    box = zClamp({ x: cxc - boxW / 2, y: cyc - boxH / 2, w: boxW, h: boxH }, vbW, vbH, minFrac, aspect);
  }
  relZoom.box = box;
  svg.setAttribute("viewBox", box.x + " " + box.y + " " + box.w + " " + box.h);
}
/* 在克隆体上重建交互：点边/点节点 → 底部抽屉；拖移后的误触由 panDist 守卫（与地图锚点同规则） */
function rebindRelClone(clone) {
  const guarded = (fn) => () => { if (relZoom.panDist > 6) return; fn(); };
  clone.querySelectorAll("[data-detail]").forEach(el => {
    const rels = relView.detailReg[+el.dataset.detail];
    if (!rels) return;
    el.style.cursor = "pointer";
    el.addEventListener("click", guarded(() => showRelDetailDrawer(rels, null)));
  });
  clone.querySelectorAll("[data-node]").forEach(el => {
    const pid = el.dataset.node;
    el.style.cursor = "pointer";
    el.addEventListener("click", guarded(() => showRelDetailDrawer(relsTouching(pid), pid)));
  });
}
function closeRelOverlay() {
  if (drawer.open) closeDrawer(); // 全屏关闭时一并收起底部抽屉，避免其孤悬
  const overlay = $("#map-overlay");
  overlay.hidden = true;
  overlay.setAttribute("aria-label", "地图全屏查看");
  $("#map-overlay-hint").textContent = "拖移平移 · 滚轮/双指缩放 · 点击地点看详情";
  document.body.classList.remove("no-scroll");
  $("#map-overlay-body").textContent = "";
  relZoom.active = false;
  relZoom.svg = null;
  relZoom.aspect = 0;
  relZoom.panDist = 0;
  relZoom.pointers.clear();
  relZoom.pinch = null;
  relZoom.panStart = null;
}

/* ================================================================== *
 * 统一轨迹播放引擎 player（r17 引擎合一，清偿 TD-r16-01；r18 简化）
 * ------------------------------------------------------------------
 * 单人（单轨）与并观（双轨）共用同一状态机与主钟；差异只在注入的 cfg：
 *   · 单人 = 单轨模式：主钟归一化进度 → 单标记沿单轨按「段长（几何距离）」推进，逐段 easeInOut；
 *   · 并观 = 双轨模式：主钟归一化进度 → 故事进度 sc，两标记各沿己轨按 sc 插值，逐段 easeInOut；
 *          交会锚（a 同场／b 同年同地同权）作为 beats——经过即点亮该交会地并常亮，行进不打断。
 * 主钟采用「增量累加」：每帧 elapsed += min(Δt,100ms) × 0.5（r18 速度定稿：唯一速度 0.5×）。
 *   - 暂停冻结主钟（不推进 elapsed），续播不追赶（lastTs 归零，首帧 Δt=0）；
 *   - Δt 上限 100ms → 切后台/长帧回来不突进。
 * r18 裁定：移除自动停拍（holdUntil 退役）与速度档；beat 命中只「点亮交会点」，不暂停、不闪烁。
 * ================================================================== */
const easeInOut = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
const PLAY_NS = "http://www.w3.org/2000/svg";
const PLAY_SPEED = 0.5;             // r18 唯一速度（0.5×），单人与并观同速

const player = { raf: null, paused: false, lastTs: 0, elapsed: 0, dur: 0,
                 cfg: null, firedBeats: null };

function playerFrame(ts) {
  const p = player;
  const dt = p.lastTs ? Math.min(ts - p.lastTs, 100) : 0; // 首帧/续播 Δt=0；上限 100ms 防突进
  p.lastTs = ts;
  const prev = p.elapsed;
  p.elapsed = Math.min(p.elapsed + dt * PLAY_SPEED, p.dur);
  // beats（交会锚）跨越检测：命中即精确落位到该刻、点亮该交会点并常亮；不暂停、不闪烁、不打断行进
  const beats = p.cfg.beats;
  if (beats) {
    for (const b of beats) {
      if (p.firedBeats.has(b.key)) continue;
      if (b.at > prev && b.at <= p.elapsed) {
        p.firedBeats.add(b.key);
        p.elapsed = b.at;               // 精确落位交会刻（两标记确在交会地——供状态机断言）
        p.cfg.render(p.elapsed);
        b.fire();                       // 点亮该交会地（常亮），无停拍
        p.raf = requestAnimationFrame(playerFrame);
        return;                         // 同帧多锚顺次于相邻帧点亮，自然连续、不打断
      }
    }
  }
  p.cfg.render(p.elapsed);
  if (p.elapsed >= p.dur) { playerFinish(); return; }
  p.raf = requestAnimationFrame(playerFrame);
}
function playerStart(cfg) {
  playerStop();
  player.cfg = cfg;
  player.dur = cfg.dur;
  player.elapsed = 0;
  player.lastTs = 0;
  player.paused = false;
  player.firedBeats = new Set();
  if (cfg.onStart) cfg.onStart();
  cfg.render(0);
  if (cfg.dur <= 0) { playerFinish(); return; }
  player.raf = requestAnimationFrame(playerFrame);
}
function playerPause() {
  if (player.raf) cancelAnimationFrame(player.raf);
  player.raf = null; player.paused = true; player.lastTs = 0;
  if (player.cfg && player.cfg.onPause) player.cfg.onPause();
}
function playerResume() {
  if (!player.cfg || !player.paused) return;
  player.paused = false; player.lastTs = 0; // 续播不追赶
  if (player.cfg.onResume) player.cfg.onResume();
  player.raf = requestAnimationFrame(playerFrame);
}
function playerFinish() {
  if (player.raf) cancelAnimationFrame(player.raf);
  player.raf = null; player.paused = false;
  const cfg = player.cfg;
  if (cfg) { cfg.render(cfg.dur); if (cfg.onFinish) cfg.onFinish(); } // 终点归位：显式落位到末刻
}
function playerStop() {
  if (player.raf) cancelAnimationFrame(player.raf);
  player.raf = null; player.paused = false; player.lastTs = 0;
  const cfg = player.cfg;
  player.cfg = null;
  if (cfg && cfg.onStop) cfg.onStop();
}
/* 播放/暂停按钮文案同步：主工具条 + 全屏浮层悬浮控件（#ov-play）同写，两处状态一致
 * （全屏内外播放状态无缝同步的关键——任何切换 play/pause 都写到两处按钮）。 */
function setPlayBtnText(mode, txt) {
  const main = mode === "single" ? "#btn-play" : "#cmp-play";
  [main, "#ov-play"].forEach(id => { const b = $(id); if (b) b.textContent = txt; });
}

/* ---------- 播放字幕条（单人 #play-caption / 并观 #cmp-caption）· r24a-fix2 断根为派生式重挂 ----------
 * 【为何不再是静态单例】与 mountOverlayControls 同源（详见其上方注释）：字幕条须随图进出全屏，
 *   旧法是「开浮层 move 进 #map-overlay-body、关浮层 move 回内嵌图框」——节点跨浮层存活。
 *   现行三处入口（openRelOverlay / closeRelOverlay / openCmpOverlay）都以 `body.textContent=""`
 *   清空容器，只要有哪一次退出没走到 move-back（或将来再添一处清空型入口），节点即被连带销毁且
 *   永不回来：此后 $("#play-caption") 恒 null，showCaption/cmpCaption 静默空转（字幕永久消失），
 *   closeOverlay 还会在 appendChild(null) 上抛错。
 *   ⚠ 记实：r24a-fix2 走查实测（探针逐帧监视两节点的 document.contains），现行入口下**尚无可达的
 *   销毁路径**——captions 与 #overlay-controls 的差别正在于每次退出都被 move 出容器。故本次是断隐患、
 *   不是修活 bug；断的是「跨浮层存活的单例」这一类，而非某一条已发生的路径。
 * 【断根之道】文本与显隐存于 captionState（唯一真源），DOM 只是它的投影：归属容器由当前浮层状态
 *   当场派生（captionHost），节点随时可弃、用时重建（captionEl 自愈）。静态节点已自 index.html
 *   移除，此处是其唯一出处。
 * 【规范】本条即 design_notes §7.1「同族三相」之相二（被 move 的单例），正解＝状态为唯一真源；
 *   captionHost 按 id 取图框（#map-frame／#cmp-frame）则是相一（靠文档顺序认亲）的正解＝身份取代位置。
 *   mountCaption 的调用点须排在浮层状态位（mapState.overlay／cmpZoom.active）改写之后——容器由状态派生。
 *   自验口径见 design_notes §7.2（按类反证＋交叉验证）与 tools/qa/vision_r24a.js §4b／§4c。 */
const captionState = { single: { text: "", show: false }, dual: { text: "", show: false } };
const CAPTION_SEL = { single: "#play-caption", dual: "#cmp-caption" };
/* 字幕条该挂在哪：浮层开着＝全屏容器，否则＝各自内嵌图框。当场从浮层状态读出，不记忆、不缓存。 */
function captionHost(mode) {
  if (mode === "single") return mapState.overlay ? $("#map-overlay-body") : $("#map-frame");
  return cmpZoom.active ? $("#map-overlay-body") : $("#cmp-frame");
}
function unmountCaption(mode) { const el = $(CAPTION_SEL[mode]); if (el) el.remove(); }
/* 幂等重建：先清残留再新建；文本与显隐当场从 captionState 读出。
 * 重挂不做淡入（换容器应是瞬时的），故 .show 直接随创建写死，不走 rAF。 */
function mountCaption(mode) {
  unmountCaption(mode);
  const host = captionHost(mode);
  if (!host) return null;
  const st = captionState[mode];
  const el = document.createElement("p");
  el.className = "play-caption" + (st.show ? " show" : "");
  el.id = CAPTION_SEL[mode].slice(1);
  el.setAttribute("aria-live", "polite");
  el.textContent = st.text;
  el.hidden = !st.show;
  host.appendChild(el);   // 先填内容后入 DOM：重挂不触发 aria-live 播报（同一句话不重念一遍）
  return el;
}
/* 取当前字幕条；若不存在、或不在其应属容器内（浮层刚开、容器被清空过），就地重建后再返回 */
function captionEl(mode) {
  const el = $(CAPTION_SEL[mode]);
  const host = captionHost(mode);
  if (!host) return null;
  return (el && el.parentNode === host) ? el : mountCaption(mode);
}
/* 播放引擎唯一的写入口：先写状态，再投影到当前节点（淡入照旧走 rAF＋.show） */
function setCaption(mode, text) {
  const st = captionState[mode];
  st.text = text; st.show = true;
  const el = captionEl(mode);
  if (!el) return;
  el.textContent = text;
  el.hidden = false;
  requestAnimationFrame(() => { if (captionState[mode].show) el.classList.add("show"); });
}
function clearCaption(mode, immediate) {
  const st = captionState[mode];
  st.show = false;
  if (immediate) st.text = "";
  const el = $(CAPTION_SEL[mode]);
  if (!el) return;
  el.classList.remove("show");
  if (immediate) { el.hidden = true; el.textContent = ""; return; }
  setTimeout(() => {                       // 淡出后再收起；期间若被重挂，按 id 重取当前节点
    const e2 = $(CAPTION_SEL[mode]);
    if (e2 && !e2.classList.contains("show")) e2.hidden = true;
  }, 300);
}
/* ---------- 单人地图字幕（到站播报，aria-live=polite） ---------- */
function showCaption(text) { setCaption("single", text); }
function hideCaption(immediate) { clearCaption("single", immediate); }

/* ---------- 单轨模式 cfg：单标记沿单轨按段长推进，逐段 easeInOut，到站播报（无 beat 暂停） ---------- */
function singlePlayCfg(traj, anchors, theme) {
  let marker = anchors.querySelector("#play-marker");
  if (!marker) {
    marker = document.createElementNS(PLAY_NS, "circle");
    marker.setAttribute("id", "play-marker");
    marker.dataset.r = 9;
    marker.setAttribute("r", 9 * (mapState.box ? mapState.box.w / MAP_W : 1));
    marker.setAttribute("fill", "none");
    marker.setAttribute("stroke", theme);
    marker.setAttribute("stroke-width", "3");
    marker.setAttribute("vector-effect", "non-scaling-stroke");
    marker.setAttribute("class", "traj");
    anchors.appendChild(marker);
  }
  // 分段：按段长（几何距离）分配时长（1× 基准），零长段时长为 0（同点聚合已在建轨时完成）
  const lens = []; let total = 0;
  for (let i = 1; i < traj.length; i++) {
    const L = Math.hypot(traj[i].x - traj[i - 1].x, traj[i].y - traj[i - 1].y);
    lens.push(L); total += L;
  }
  const base = total > 0 ? Math.max(2000, Math.min(8000, 1200 * (traj.length - 1))) : 0;
  const segs = []; let t0 = 0;
  for (const L of lens) { const d = total > 0 ? base * (L / total) : 0; segs.push({ start: t0, dur: d }); t0 += d; }
  const captionText = (idx) => {
    const t = traj[idx];
    return "第" + (idx + 1) + "/" + traj.length + "站 " + t.placeNames.join("/") +
      " · " + yearLabel(t.events[0].year_bce) + " · " + t.events.map(e => e.title).join("；");
  };
  let lastStation = -1;
  const announce = (idx) => { if (idx !== lastStation) { lastStation = idx; showCaption(captionText(idx)); } };
  return {
    mode: "single", dur: base, beats: null,
    onStart() { marker.removeAttribute("hidden"); },
    render(el) {
      if (base <= 0 || el >= base) { const last = traj[traj.length - 1]; // 末刻/同点：像素级落位末站
        marker.setAttribute("cx", last.x); marker.setAttribute("cy", last.y);
        announce(traj.length - 1); return; }
      let i = segs.length - 1;
      for (let s = 0; s < segs.length; s++) { if (el < segs[s].start + segs[s].dur) { i = s; break; } }
      const seg = segs[i];
      const u = seg.dur > 0 ? Math.min((el - seg.start) / seg.dur, 1) : 1;
      const e = easeInOut(u);
      marker.setAttribute("cx", traj[i].x + (traj[i + 1].x - traj[i].x) * e);
      marker.setAttribute("cy", traj[i].y + (traj[i + 1].y - traj[i].y) * e);
      announce((u >= 1) ? i + 1 : i);
    },
    onPause() { hideCaption(); },
    onResume() { if (lastStation >= 0) showCaption(captionText(lastStation)); },
    onFinish() { hideCaption(); setPlayBtnText("single", PLAY_LABEL.idle); },
    onStop() {
      hideCaption(true);
      setPlayBtnText("single", PLAY_LABEL.idle);
      const m = document.querySelector("#play-marker"); if (m) m.setAttribute("hidden", "");
    },
  };
}
function toggleSinglePlay(traj, anchors, theme) {
  if (player.cfg && player.cfg.mode === "single" && player.raf && !player.paused) {
    playerPause(); setPlayBtnText("single", PLAY_LABEL.resume); return;
  }
  if (player.cfg && player.cfg.mode === "single" && player.paused) {
    playerResume(); setPlayBtnText("single", PLAY_LABEL.pause); return;
  }
  if (traj.length < 2) return;
  playerStart(singlePlayCfg(traj, anchors, theme));
  setPlayBtnText("single", PLAY_LABEL.pause);
}

/* ==================================================================
 * 双人并观（compare）· r16
 * 入口：关系图两人关系卡「并观其迹」／人物地图「添加对照人物」；hash=#compare=P_A,P_B。
 * 交会检测严格对齐 docs/binguan_fixtures.md 的三条护栏与分级；免责句一字不差引用 B3。
 * 播放为「按绝对年推进」：复用 easeInOut 缓动与 RAF/字幕/暂停语义，两标记各沿己轨行进，
 * 生卒之外灰置；命中 b 级年自动暂停一拍。现有单人播放引擎（play/*）不动。
 * ================================================================== */

/* B3 免责样板句（fixtures §附注·前端引用；一字不差）—常驻交会侧栏顶部、交会弹卡内亦重复 */
const BINGUAN_DISCLAIMER = "同城未必同时，不能仅据同年同地断定相遇。";

/* 两人是否皆为主角（并观仅在十五主角间可用） */
function bothProto(a, b) {
  return a && b && a !== b &&
    PROTAGONISTS.some(m => m.id === a) && PROTAGONISTS.some(m => m.id === b);
}
function compareHash(a, b) { return "#compare=" + a + "," + b; }
function goCompare(a, b) {
  if (!bothProto(a, b)) return;
  document.body.classList.remove("cmp-sheet-open");
  const h = compareHash(a, b);
  if (location.hash === h) render(); else location.hash = h;
}

/* 「＋ 添加对照人物」开关式选人面板（r24a 裁定 1b 重构）。
 * 两视图各挂一份（单人地图 #btn-compare／并观 #cmp-btn-compare），按钮文案与形态两处一致、常驻不变形。
 * 开关语义（面板每次打开按当前 hash 重建，故实时反映当前组合）：
 *   单人态点某人      → 加入并观（甲＝当前页主人物，乙＝所点者）
 *   并观态点「当前乙」→ 移出，自动回单人模式（落回甲的地图视图）
 *   并观态点「另一人」→ 直接换乙，甲不变
 * 「⇄ 对调」按钮已随本轮退役：想以对方为主，自其人物页进入并观即可，
 * hash #compare=甲,乙 的语义（甲＝当前页主）不变，角色随入口自明。 */
function comparePickerCtx() {
  // 甲＝当前页主人物；并观视图取 state.pair[0]，单人视图取 state.person
  if (state.view === "compare" && state.pair && state.pair.length === 2) {
    return { host: state.pair[0], partner: state.pair[1] };
  }
  return { host: state.person, partner: null };
}
function initComparePicker(btnSel, pickSel) {
  const btn = $(btnSel);
  const pick = $(pickSel);
  if (!btn || !pick) return;
  const close = () => { pick.hidden = true; btn.setAttribute("aria-expanded", "false"); };
  const build = () => {
    pick.textContent = "";
    const { host, partner } = comparePickerCtx();
    if (!host) return;
    PROTAGONISTS.forEach(m => {
      if (m.id === host) return;
      if (!PEOPLE[m.id]) return;
      const on = m.id === partner;
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "menuitemcheckbox");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.className = "cmp-pick-item" + (on ? " on" : "");
      const dot = document.createElement("i");
      dot.style.background = m.color || "#B4652F";
      b.appendChild(dot);
      b.appendChild(document.createTextNode(personName(m.id)));
      if (on) {
        const tick = document.createElement("span");
        tick.className = "cmp-pick-tick";
        tick.textContent = "✓";
        tick.setAttribute("aria-hidden", "true");
        b.appendChild(tick);
        b.title = "再点一次移出并观，回到单人地图";
      }
      b.addEventListener("click", () => {
        close();
        if (on) setHash(host, "map");        // 再点当前乙 → 移出，自动回单人
        else goCompare(host, m.id);          // 加入并观 / 直接换乙
      });
      pick.appendChild(b);
    });
  };
  btn.addEventListener("click", () => {
    if (!comparePickerCtx().host) return;
    if (pick.hidden) { build(); pick.hidden = false; btn.setAttribute("aria-expanded", "true"); }
    else close();
  });
  document.addEventListener("pointerdown", (e) => {
    if (pick.hidden) return;
    if (!pick.contains(e.target) && e.target !== btn) close();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !pick.hidden) close(); });
}

/* 某人「亲至且在世」的事件（供检测与轨迹）：presence≠相关；并按 person 生卒年做生死过滤
 * ——护栏①：生死过滤以 person 生卒年为准（子文卒后被追叙者，death_year 之后的记载不计）。 */
function personParts(pid) {
  const p = PEOPLE[pid] || {};
  const d = p.death_year_bce, b = p.birth_year_bce;
  return personEvents(pid).filter(e => {
    if (e.presence === "相关") return false;
    if (d != null && e.year_bce > d) return false; // 已卒之后：追叙，不在场
    if (b != null && e.year_bce < b) return false; // 未生
    return true;
  });
}

/* 亲至轨迹（有坐标者，连续同地聚合为一站）：与地图 renderMap 建轨口径一致 */
function buildTraj(pid) {
  const traj = [];
  for (const e of personParts(pid)) {
    const pl = e.place_id ? PLACES[e.place_id] : null;
    if (!pl || pl.lat == null || pl.lng == null) continue;
    const [px, py] = project(pl.lng, pl.lat);
    const last = traj[traj.length - 1];
    if (last && (last.place.id === pl.id || Math.hypot(px - last.x, py - last.y) < 0.5)) {
      last.events.push(e);
      if (!last.placeNames.includes(pl.ancient_name)) last.placeNames.push(pl.ancient_name);
      if (e.year_bce < last.year) last.year = e.year_bce; // 站代表年取最早
      continue;
    }
    traj.push({ place: pl, placeNames: [pl.ancient_name], x: px, y: py, year: e.year_bce, events: [e] });
  }
  return traj;
}

/* 交会检测器（严格对齐 fixtures）：
 *  a 级＝同一 event_id、双方皆亲至、事件有落点 →「同场（同一记载）」；
 *  b 级＝不同 event_id、同 place_id、|Δyear|≤1（护栏②：跨年事件容忍±1）、双方皆亲至。
 *    护栏③：b 级若两事同链（相邻 event_id 或共享 source_id）→「相邻记载」，否则「可能相遇」。 */
function srcSet(e) { return new Set((e.source_ids || "").split(";").filter(Boolean)); }
function evNum(id) { const m = (id || "").match(/\d+/); return m ? +m[0] : null; }
function sameChain(ea, eb) {
  const sa = srcSet(ea), sb = srcSet(eb);
  for (const s of sa) if (sb.has(s)) return true;   // 共享出处＝同一叙事骨架
  const na = evNum(ea.id), nb = evNum(eb.id);
  return na != null && nb != null && Math.abs(na - nb) === 1; // 相邻 event_id
}
function detectMeetings(A, B) {
  const pa = personParts(A), pb = personParts(B);
  const ib = new Map(pb.map(e => [e.id, e]));
  const out = [];
  // a 级
  for (const e of pa) {
    const be = ib.get(e.id);
    if (be && e.place_id) out.push({ level: "a", year: e.year_bce, place: e.place_id, ea: e, eb: be });
  }
  // b 级
  const seen = new Set();
  for (const ea of pa) for (const eb of pb) {
    if (ea.id === eb.id) continue;
    if (!ea.place_id || !eb.place_id || ea.place_id !== eb.place_id) continue;
    const dy = Math.abs(ea.year_bce - eb.year_bce);
    if (dy > 1) continue;
    const key = [ea.id, eb.id].sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ level: "b", year: ea.year_bce, year2: eb.year_bce, place: ea.place_id,
               ea, eb, chain: sameChain(ea, eb), tol: dy === 1 });
  }
  out.sort((x, y) => (x.year - y.year) || x.place.localeCompare(y.place) ||
                     (x.level === y.level ? 0 : (x.level === "a" ? -1 : 1)));
  return out;
}

/* 生卒/活跃跨度：优先结构化 birth/death，缺则以 active_years_bce 文本中的「前N」与其事件年兜底。
 * 用于年轴生卒刻度与「未生/已卒」灰置。 */
function parseFrontYears(s) {
  return [...String(s || "").matchAll(/前(\d+)/g)].map(m => -(+m[1]));
}
function lifeSpan(pid, traj) {
  const p = PEOPLE[pid] || {};
  const act = parseFrontYears(p.active_years_bce);
  const evY = (traj || []).map(t => t.year).filter(y => y != null);
  const loCands = [], hiCands = [];
  if (p.birth_year_bce != null) loCands.push(p.birth_year_bce);
  if (act.length) loCands.push(Math.min(...act));
  if (evY.length) loCands.push(Math.min(...evY));
  if (p.death_year_bce != null) hiCands.push(p.death_year_bce);
  if (act.length) hiCands.push(Math.max(...act));
  if (evY.length) hiCands.push(Math.max(...evY));
  const lo = loCands.length ? Math.min(...loCands) : null;
  const hi = hiCands.length ? Math.max(...hiCands) : null;
  return { lo, hi, birth: p.birth_year_bce, death: p.death_year_bce,
           actLo: act.length ? Math.min(...act) : null,
           actHi: act.length ? Math.max(...act) : null };
}

/* 相对亮度（sRGB）：判两主题色是否「深浅相近难辨」，近则给副轨叠点划线纹理保证可辨 */
function relLum(hex) {
  const h = (hex || "").replace("#", "");
  if (h.length < 6) return 0.5;
  const f = (i) => { const c = parseInt(h.substr(i, 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(0) + 0.7152 * f(2) + 0.0722 * f(4);
}

/* ---- 并观状态 ---- */
const cmp = { A: null, B: null, metaA: null, metaB: null, colorA: "", colorB: "",
              trajA: null, trajB: null, lifeA: null, lifeB: null,
              meetings: [], axisMin: 0, axisMax: 0, svg: null, anchors: null,
              markerA: null, markerB: null, similar: false, box: null,
              // r17b 年位同步：故事进度 sc 主钟
              syncs: [], waypointsA: [], waypointsB: [], scMin: 0, scMax: 0, clockCtrl: [] };
const NSVG = "http://www.w3.org/2000/svg";

function cmpAxisPct(year) {
  const span = cmp.axisMax - cmp.axisMin;
  if (span <= 0) return 0;
  return Math.max(0, Math.min(100, (year - cmp.axisMin) / span * 100));
}
/* 缩放补偿（点/字不随 viewBox 放大而变大），与地图 applyView 同法，但作用于并观自有 svg */
function cmpApplyView(box) {
  const svg = cmp.svg;
  if (!svg) return;
  cmp.box = box;
  svg.setAttribute("viewBox", box.x + " " + box.y + " " + box.w + " " + box.h);
  const s = Math.max(box.w / MAP_W, 0.25);
  svg.querySelectorAll("[data-r]").forEach(el => el.setAttribute("r", parseFloat(el.dataset.r) * s));
  svg.querySelectorAll("[data-fs]").forEach(el => el.style.fontSize = (parseFloat(el.dataset.fs) * s) + "px");
}

/* ============================================================ *
 * 年位同步（r17b 根修）——双轨模式的「主钟唯一量」是故事进度 sc，不是纯年。
 *   起因：buildTraj 对同地相邻事件聚合，且一人同年可有多个不同地点的交会
 *   （文姜×齐襄公前694 既在泺又在临淄）——纯 clockYear 函数在「同年多交会地」处
 *   多对一塌缩，无法同时保证「钟到泺⇔人到泺」与「钟到临淄⇔人到临淄」。
 *   解法：以「交会为锚的故事进度 sc」为主钟唯一量。每个交会地＝一个整数 sc 锚点，
 *   两人在该 sc 均被钉到交会地（从构造上保证 钟到交会刻 ⇔ 两人到交会地）；
 *   clockYear 是 sc 的单调函数（年严格段内 sc↔year 一一对应，故等价于「年的纯函数」）；
 *   同年多交会地由 sc 细分区分。缓动只作用于 sc 段内视觉插值，不改「某 sc 在某段」的映射。
 * ============================================================ */

/* 交会锚点（syncs）：交会涉及的不同地点，各对应两人共有的一站；按 trajA 站序定序、编号即 sc。
 * 一人同年多交会地（泺694、临淄694）自然成相继两锚点，解决纯年塌缩。 */
function cmpBuildSyncs(trajA, meetings) {
  const meetPlaces = new Set(meetings.map(m => m.place));
  const syncs = [];
  const seen = new Set();
  for (const st of trajA) {
    const pid = st.place.id;
    if (!meetPlaces.has(pid) || seen.has(pid)) continue;
    seen.add(pid);
    const [x, y] = project(st.place.lng, st.place.lat);
    syncs.push({ idx: syncs.length, place: pid, year: st.year, x, y,
                 meetings: meetings.filter(m => m.place === pid) });
  }
  return syncs;
}

/* 某人轨迹 → 按 sc 排布的路点 [{sc,x,y}]。交会站钉到整数 sc（|站年−锚年|≤1 即匹配，
 * 容纳 b 级±1 与聚合站取最早年）；非交会站在相邻锚间按序均分小数 sc（不与整数锚碰撞）。 */
function cmpBuildWaypoints(traj, syncs) {
  if (!traj.length) return [{ sc: 0, x: 0, y: 0 }];
  const ann = traj.map(st => {
    let sc = null;
    for (const s of syncs) if (s.place === st.place.id && Math.abs(st.year - s.year) <= 1) { sc = s.idx; break; }
    return { x: st.x, y: st.y, sc };
  });
  const wps = [];
  for (let i = 0; i < ann.length; i++) {
    let sc = ann[i].sc;
    if (sc == null) {
      let p = i - 1; while (p >= 0 && ann[p].sc == null) p--;
      let n = i + 1; while (n < ann.length && ann[n].sc == null) n++;
      const prevSc = p >= 0 ? ann[p].sc : null;
      const nextSc = n < ann.length ? ann[n].sc : null;
      if (prevSc != null && nextSc != null) {
        const gap = n - p;               // 该无锚段的站数（含端点间隔）
        sc = prevSc + (nextSc - prevSc) * ((i - p) / gap);
      } else if (prevSc != null) {       // 尾部：逐站 +1
        sc = prevSc + (i - p);
      } else if (nextSc != null) {       // 首部：逐站 −1
        sc = nextSc - (n - i);
      } else {
        sc = i;                          // 无任何交会：退化为站序
      }
    }
    wps.push({ sc, x: ann[i].x, y: ann[i].y });
  }
  wps.sort((a, b) => a.sc - b.sc);
  return wps;
}

/* 标记位置 = sc 的纯函数：在 sc 落入的路点段内按段内比例插值，缓动只作视觉平滑。
 * sc 恰为某交会锚整数时，返回该锚路点＝交会地（从构造上「钟到交会刻⇔人到交会地」）。 */
function cmpPositionAt(wps, sc) {
  if (!wps.length) return { x: 0, y: 0 };
  if (sc <= wps[0].sc) return { x: wps[0].x, y: wps[0].y };
  const last = wps[wps.length - 1];
  if (sc >= last.sc) return { x: last.x, y: last.y };
  for (let i = 0; i < wps.length - 1; i++) {
    if (sc >= wps[i].sc && sc <= wps[i + 1].sc) {
      const d = wps[i + 1].sc - wps[i].sc;
      if (d <= 0) return { x: wps[i + 1].x, y: wps[i + 1].y };
      const e = easeInOut((sc - wps[i].sc) / d);
      return { x: wps[i].x + (wps[i + 1].x - wps[i].x) * e,
               y: wps[i].y + (wps[i + 1].y - wps[i].y) * e };
    }
  }
  return { x: last.x, y: last.y };
}

/* clockYear = sc 的单调函数：控制点＝(scMin,axisMin)+各交会锚(sc=idx,锚年)+(scMax,axisMax)，
 * 分段线性。交会锚整数 sc 处恰得锚年（钟到交会年）；两端伸到年轴边界，年读数随进度平滑。 */
function cmpClockYearAt(sc) {
  const c = cmp.clockCtrl;
  if (!c || !c.length) return cmp.axisMin;
  if (sc <= c[0].sc) return c[0].year;
  if (sc >= c[c.length - 1].sc) return c[c.length - 1].year;
  for (let i = 0; i < c.length - 1; i++) {
    if (sc >= c[i].sc && sc <= c[i + 1].sc) {
      const d = c[i + 1].sc - c[i].sc;
      if (d <= 0) return c[i + 1].year;
      return c[i].year + (c[i + 1].year - c[i].year) * ((sc - c[i].sc) / d);
    }
  }
  return c[c.length - 1].year;
}

/* 并观数据模型（纯计算，无 DOM）：填充 cmp 的轨迹/生卒/交会/同色判定/年轴，
 * 及 r17b 新增的 syncs/waypointsA-B/scMin-scMax/clockCtrl。renderCompare 与状态机测试共用。 */
function cmpComputeModel(A, B) {
  cmp.A = A; cmp.B = B;
  cmp.metaA = PROTAGONISTS.find(m => m.id === A);
  cmp.metaB = PROTAGONISTS.find(m => m.id === B);
  cmp.colorA = (cmp.metaA && cmp.metaA.color) || "#B4652F";
  cmp.colorB = (cmp.metaB && cmp.metaB.color) || "#44766B";
  cmp.trajA = buildTraj(A);
  cmp.trajB = buildTraj(B);
  cmp.lifeA = lifeSpan(A, cmp.trajA);
  cmp.lifeB = lifeSpan(B, cmp.trajB);
  cmp.meetings = detectMeetings(A, B);
  /* r24a 国色制：同国即同色，故 similar 由旧的「同国且明暗相近」改为直接判「双方同色」。
   * 它已不再决定线型（乙轨珠点线为无条件，见 CMP_DASH），只用于图例文案提示。 */
  cmp.similar = cmp.colorA.toLowerCase() === cmp.colorB.toLowerCase();

  const los = [cmp.lifeA.lo, cmp.lifeB.lo].filter(v => v != null);
  const his = [cmp.lifeA.hi, cmp.lifeB.hi].filter(v => v != null);
  cmp.axisMin = (los.length ? Math.min(...los) : -700) - 1;
  cmp.axisMax = (his.length ? Math.max(...his) : -600) + 1;

  // r17b 根修：故事进度 sc 主钟
  cmp.syncs = cmpBuildSyncs(cmp.trajA, cmp.meetings);
  cmp.waypointsA = cmpBuildWaypoints(cmp.trajA, cmp.syncs);
  cmp.waypointsB = cmpBuildWaypoints(cmp.trajB, cmp.syncs);
  const scAll = cmp.waypointsA.concat(cmp.waypointsB).map(w => w.sc);
  cmp.scMin = scAll.length ? Math.min(...scAll) : 0;
  cmp.scMax = scAll.length ? Math.max(...scAll) : 0;
  const ctrl = [{ sc: cmp.scMin, year: cmp.axisMin }];
  cmp.syncs.forEach(s => ctrl.push({ sc: s.idx, year: s.year }));
  ctrl.push({ sc: cmp.scMax, year: cmp.axisMax });
  ctrl.sort((a, b) => a.sc - b.sc);
  cmp.clockCtrl = ctrl;
}

function renderCompare() {
  const [A, B] = state.pair || [];
  if (!bothProto(A, B)) { setHash(null, "home"); return; }
  cmpComputeModel(A, B);

  $("#cmp-title").textContent = personName(A) + " × " + personName(B) + " · 并观其迹";
  $("#cmp-legend-a").textContent = personName(A);
  $("#cmp-legend-b").textContent = personName(B);
  const st = $("#cmp-sheet-toggle");
  if (st) { st.hidden = false; st.setAttribute("aria-expanded", "false"); st.textContent = "交会一览 ▲"; }
  document.body.classList.remove("cmp-sheet-open");
  $("#cmp-detail").hidden = true;
  cmpBuildMap();
  cmpBuildAxis();
  cmpBuildLegend();
  cmpBuildSidebar();

  // 工具条：两人皆亲至落点<2（无从连成任一轨迹）时同句降级，否则至少一轨可动即可播
  const playBtn = $("#cmp-play");
  playBtn.textContent = PLAY_LABEL.idle; // r24a：两模式文案统一
  setPlayDegrade("compare", cmp.trajA.length < 2 && cmp.trajB.length < 2);
  playBtn.onclick = toggleComparePlay;
  $("#cmp-scope").onclick = () => {
    cmp.mode = cmp.mode === "fit" ? "full" : "fit";
    cmpApplyView(cmp.mode === "fit" ? cmp.fitBox : { x: 0, y: 0, w: MAP_W, h: MAP_H });
    $("#cmp-scope").textContent = cmp.mode === "fit" ? "视野：活动范围" : "视野：全图";
  };
  $("#cmp-zoom").onclick = openCmpOverlay;
  // r24a：「⇄ 对调」按钮退役——以对方为主请自其人物页进入并观（hash 甲＝当前页主，语义不变）
  $("#cmp-status").textContent =
    "交会共 " + cmp.meetings.length + " 处（同场 " +
    cmp.meetings.filter(m => m.level === "a").length + " · 同年同地 " +
    cmp.meetings.filter(m => m.level === "b").length + "）。";
}

/* 并观双轨线型（r24a 裁定 1a，国色制下由色彩移交纹理承担区分）：
 * 甲＝当前页主人物，用长划虚线——与单人地图轨迹「6 5」完全同式，单人样式一律不动；
 * 乙＝添加的对照人物，用珠点线——近零段长＋圆线帽，渲染为一串圆珠。
 * 两式皆配 vector-effect="non-scaling-stroke"，故 dasharray 在屏幕坐标下求值，
 * 珠径珠距在任意缩放级别恒定（放大不拉成长划、缩小不糊成实线）。
 * 段长取 0.5 而非 0：部分渲染器会丢弃零长段，0.5 配圆帽仍是一枚正圆珠。 */
const CMP_DASH = { A: "6 5", B: "0.5 8" };
const CMP_DASH_W = { A: "2", B: "2.6" }; // 珠点略加粗，使珠身与长划等重
/* 绘制并观地图：底图＋两人亲至轨迹（甲长划／乙珠点）＋交会点＋两枚行进标记 */
function cmpBuildMap() {
  const canvas = $("#cmp-canvas");
  canvas.innerHTML = baseMapText;
  mountCaption("dual");     // 同上：内嵌并观图框的字幕条亦为派生物
  const svg = canvas.querySelector("svg");
  cmp.svg = svg;
  const anchors = svg.querySelector("#layer-anchors");
  cmp.anchors = anchors;
  svg.querySelectorAll("path, polyline, line, circle, ellipse")
     .forEach(el => el.setAttribute("vector-effect", "non-scaling-stroke"));
  svg.querySelectorAll("#layer-labels g").forEach(g => {
    g.dataset.fs = g.getAttribute("font-size") || "14";
    g.style.fontSize = g.dataset.fs + "px";
  });

  const fitPoints = [];
  const drawTraj = (traj, color, key) => {
    if (traj.length > 1) {
      const pl = document.createElementNS(NSVG, "polyline");
      pl.setAttribute("points", traj.map(t => t.x + "," + t.y).join(" "));
      pl.setAttribute("fill", "none");
      pl.setAttribute("stroke", color);
      pl.setAttribute("stroke-width", CMP_DASH_W[key]);
      pl.setAttribute("stroke-dasharray", CMP_DASH[key]); // 甲长划／乙珠点（无条件）
      if (key === "B") pl.setAttribute("stroke-linecap", "round"); // 圆帽：段长 0.5 渲染为圆珠
      pl.setAttribute("opacity", "0.72");
      pl.setAttribute("vector-effect", "non-scaling-stroke");
      anchors.appendChild(pl);
    }
    traj.forEach((t, i) => {
      fitPoints.push([t.x, t.y]);
      const dot = document.createElementNS(NSVG, key === "A" ? "circle" : "rect");
      if (key === "A") {
        dot.setAttribute("cx", t.x); dot.setAttribute("cy", t.y);
        dot.dataset.r = 4; dot.setAttribute("r", 4);
      } else {
        const s = 7; // 方点（形状冗余：A 圆 · B 方，色盲/灰度可辨）
        dot.setAttribute("x", t.x - s / 2); dot.setAttribute("y", t.y - s / 2);
        dot.setAttribute("width", s); dot.setAttribute("height", s);
        dot.dataset.sq = s;
      }
      dot.setAttribute("fill", color);
      dot.setAttribute("stroke", "#F4EDDF");
      dot.setAttribute("stroke-width", "1");
      dot.setAttribute("vector-effect", "non-scaling-stroke");
      anchors.appendChild(dot);
    });
  };
  drawTraj(cmp.trajA, cmp.colorA, "A");
  drawTraj(cmp.trajB, cmp.colorB, "B");

  // 交会点：a 级金环「同场」、b 级高亮环；点击→交会详情（并定位）
  const placed = new Map(); // place_id → {x,y, list}
  cmp.meetings.forEach((m, idx) => {
    const pl = PLACES[m.place];
    if (!pl || pl.lat == null || pl.lng == null) return;
    const [px, py] = project(pl.lng, pl.lat);
    if (!placed.has(m.place)) placed.set(m.place, { x: px, y: py, list: [] });
    placed.get(m.place).list.push(m);
    fitPoints.push([px, py]);
  });
  placed.forEach((slot, placeId) => {
    const hasA = slot.list.some(m => m.level === "a");
    const g = document.createElementNS(NSVG, "g");
    g.setAttribute("class", "cmp-meet");
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.dataset.place = placeId;
    g.setAttribute("aria-label", (PLACES[placeId].ancient_name || placeId) + " 交会点");
    const ring = document.createElementNS(NSVG, "circle");
    ring.setAttribute("cx", slot.x); ring.setAttribute("cy", slot.y);
    ring.dataset.r = 9; ring.setAttribute("r", 9);
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", hasA ? "#B4652F" : "#BC4433");
    ring.setAttribute("stroke-width", "2.4");
    if (!hasA) ring.setAttribute("stroke-dasharray", "3 3");
    ring.setAttribute("vector-effect", "non-scaling-stroke");
    g.appendChild(ring);
    const core = document.createElementNS(NSVG, "circle");
    core.setAttribute("cx", slot.x); core.setAttribute("cy", slot.y);
    core.dataset.r = 2.4; core.setAttribute("r", 2.4);
    core.setAttribute("fill", hasA ? "#B4652F" : "#BC4433");
    core.setAttribute("vector-effect", "non-scaling-stroke");
    g.appendChild(core);
    const label = document.createElementNS(NSVG, "text");
    label.setAttribute("x", slot.x + 11); label.setAttribute("y", slot.y + 4);
    label.dataset.fs = 12; label.setAttribute("class", "cmp-meet-label");
    label.textContent = PLACES[placeId].ancient_name || placeId;
    g.appendChild(label);
    const open = () => { if (!player.raf) cmpShowMeetings(placeId, slot.list); };
    g.addEventListener("click", open);
    g.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); open(); } });
    anchors.appendChild(g);
  });

  // 两枚行进标记（初始隐藏，播放/拖轴时显现）
  const mkMarker = (color, key) => {
    let el;
    if (key === "A") {
      el = document.createElementNS(NSVG, "circle");
      el.dataset.r = 8; el.setAttribute("r", 8);
    } else {
      el = document.createElementNS(NSVG, "rect");
      el.dataset.sq = 14;
      el.setAttribute("width", 14); el.setAttribute("height", 14);
    }
    el.setAttribute("fill", "none");
    el.setAttribute("stroke", color);
    el.setAttribute("stroke-width", "3");
    el.setAttribute("vector-effect", "non-scaling-stroke");
    el.setAttribute("class", "cmp-marker");
    el.setAttribute("hidden", "");
    anchors.appendChild(el);
    return el;
  };
  cmp.markerA = mkMarker(cmp.colorA, "A");
  cmp.markerB = mkMarker(cmp.colorB, "B");

  cmp.fitBox = computeFitBox(fitPoints);
  cmp.mode = "fit";
  cmpApplyView(cmp.fitBox);
  $("#cmp-scope").textContent = "视野：活动范围";
  // 全屏手势绑定到本帧新建的 svg（每次 render 皆为新节点，故每帧重绑；非激活态下 handler 自守卫）
  bindZoomGesture(svg, cmpZoom);
}

/* （r17b 移除旧 cmpMarkerPos/placeMarker：纯年插值在同年多交会地处塌缩，已由
 *   sc 主钟的 cmpPositionAt/setMarkerXY 取代，见「年位同步根修」注。） */

/* 年轴：两人生卒条＋生卒刻度＋交会标记＋播放游标 */
function cmpBuildAxis() {
  const axis = $("#cmp-axis");
  axis.textContent = "";
  const track = document.createElement("div");
  track.className = "cmp-axis-track";
  axis.appendChild(track);

  const lifeBar = (life, color, top, dashed) => {
    if (life.lo == null || life.hi == null) return;
    const l = cmpAxisPct(life.lo), r = cmpAxisPct(life.hi);
    const bar = document.createElement("div");
    bar.className = "cmp-life" + (dashed ? " dashed" : "");
    bar.style.left = l + "%";
    bar.style.width = Math.max(0.6, r - l) + "%";
    bar.style.top = top;
    if (dashed) bar.style.backgroundImage =
      "repeating-linear-gradient(90deg, " + color + " 0 5px, transparent 5px 9px)"; // 副轨点划纹
    else bar.style.background = color;
    axis.appendChild(bar);
    // 生卒刻度：结构化 birth/death 标「生/卒」，否则以活跃端标「活跃起/止」
    const tick = (year, txt, side) => {
      if (year == null) return;
      const t = document.createElement("span");
      t.className = "cmp-tick " + side;
      t.style.left = cmpAxisPct(year) + "%";
      t.style.color = color;
      t.innerHTML = '<i style="background:' + color + '"></i><b>' + txt + "</b>";
      axis.appendChild(t);
    };
    tick(life.birth != null ? life.birth : life.lo,
         (life.birth != null ? "生 " : "活跃自 ") + yearLabel(life.birth != null ? life.birth : life.lo), "lo");
    tick(life.death != null ? life.death : life.hi,
         (life.death != null ? "卒 " : "活跃止 ") + yearLabel(life.death != null ? life.death : life.hi), "hi");
  };
  lifeBar(cmp.lifeA, cmp.colorA, "26%", false);
  lifeBar(cmp.lifeB, cmp.colorB, "58%", true); // 乙条恒作虚式，与其珠点轨迹呼应（r24a）

  // 交会标记（三角）
  const byYear = new Map();
  cmp.meetings.forEach(m => {
    if (!byYear.has(m.year)) byYear.set(m.year, []);
    byYear.get(m.year).push(m);
  });
  byYear.forEach((list, year) => {
    const hasA = list.some(m => m.level === "a");
    const mk = document.createElement("span");
    mk.className = "cmp-axis-meet " + (hasA ? "lv-a" : "lv-b");
    mk.style.left = cmpAxisPct(year) + "%";
    mk.title = yearLabel(year) + "：" + (hasA ? "同场" : "同年同地");
    axis.appendChild(mk);
  });

  // 端点年标
  const endLabel = (year, side) => {
    const s = document.createElement("span");
    s.className = "cmp-axis-end " + side;
    s.textContent = yearLabel(year);
    axis.appendChild(s);
  };
  endLabel(cmp.axisMin, "left");
  endLabel(cmp.axisMax, "right");

  // 播放游标＋当前年读数
  const head = document.createElement("div");
  head.className = "cmp-playhead";
  head.id = "cmp-playhead";
  head.hidden = true;
  const yr = document.createElement("span");
  yr.className = "cmp-playyear";
  yr.id = "cmp-playyear";
  head.appendChild(yr);
  axis.appendChild(head);
}

/* 并观图例（r24a 裁定 1a·c）：每轨一行「线样＋端点形＋姓名」，线样与图上实绘同一 dasharray，
 * 使「甲·长划／乙·珠点」两式在图例里就能对上。国色制下同国两人同色，
 * 故图例的辨识信息全在线样与端点形，不依赖色彩（灰度截图下仍可读）。 */
function cmpLineSwatch(color, key) {
  const w = 34, h = 12;
  return '<svg class="cmp-lg-line" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h +
    '" aria-hidden="true"><line x1="1" y1="6" x2="' + (w - 1) + '" y2="6" stroke="' + color +
    '" stroke-width="' + CMP_DASH_W[key] + '" stroke-dasharray="' + CMP_DASH[key] + '"' +
    (key === "B" ? ' stroke-linecap="round"' : "") + "/></svg>";
}
function cmpBuildLegend() {
  const lg = $("#cmp-legend");
  lg.textContent = "";
  const item = (color, key, name, styleName) => {
    const s = document.createElement("span");
    s.className = "cmp-lg-track";
    const dot = key === "A"
      ? '<i class="cmp-lg-ci" style="border-color:' + color + '"></i>'
      : '<i class="cmp-lg-sq" style="border-color:' + color + '"></i>';
    s.innerHTML = cmpLineSwatch(color, key) + dot +
      "<b style='color:" + color + "'>" + name + "</b>" +
      '<em class="cmp-lg-style">' + styleName + "</em>";
    lg.appendChild(s);
  };
  item(cmp.colorA, "A", personName(cmp.A), "甲 · 长划");
  item(cmp.colorB, "B", personName(cmp.B), "乙 · 珠点");
  const a = document.createElement("span");
  a.innerHTML = '<i class="cmp-lg-ring lv-a"></i>同场';
  lg.appendChild(a);
  const b = document.createElement("span");
  b.innerHTML = '<i class="cmp-lg-ring lv-b"></i>同年同地';
  lg.appendChild(b);
  if (cmp.similar) {                       // 同国同色：明说区分靠线型与端点形，不靠颜色
    const n = document.createElement("span");
    n.className = "cmp-lg-note";
    n.textContent = "同国同色，以线型与端点形相分";
    lg.appendChild(n);
  }
}

/* 交会侧栏：免责句常驻顶部＋逐条交会（年份·地点·两侧事件·级别徽标）；点击→定位并展开 */
function cmpBuildSidebar() {
  const panel = $("#cmp-meetings");
  panel.textContent = "";
  const dis = document.createElement("p");
  dis.className = "cmp-disclaimer";
  dis.textContent = BINGUAN_DISCLAIMER;
  panel.appendChild(dis);

  if (!cmp.meetings.length) {
    const p = document.createElement("p");
    p.className = "map-status";
    p.textContent = "两人在现库中暂无同场或同年同地的亲至交会。";
    panel.appendChild(p);
    $("#cmp-meet-count").textContent = "0";
    return;
  }
  $("#cmp-meet-count").textContent = String(cmp.meetings.length);
  const ul = document.createElement("ul");
  ul.className = "cmp-meet-list";
  cmp.meetings.forEach(m => ul.appendChild(cmpMeetingRow(m)));
  panel.appendChild(ul);
}

/* 单条交会行 */
function cmpMeetingRow(m) {
  const li = document.createElement("li");
  li.className = "cmp-meet-row lv-" + m.level;
  li.tabIndex = 0;
  li.setAttribute("role", "button");
  const pl = PLACES[m.place];
  const head = document.createElement("div");
  head.className = "cmp-meet-head";
  const badge = document.createElement("span");
  badge.className = "cmp-badge lv-" + m.level;
  badge.textContent = m.level === "a" ? "同场" : (m.chain ? "相邻记载" : "可能相遇");
  head.appendChild(badge);
  const yl = document.createElement("span");
  yl.className = "cmp-meet-year";
  yl.textContent = yearLabel(m.year) + " · " + (pl ? pl.ancient_name : m.place);
  head.appendChild(yl);
  li.appendChild(head);

  const lineA = document.createElement("div");
  lineA.className = "cmp-meet-ev";
  lineA.innerHTML = '<i style="background:' + cmp.colorA + '"></i>' +
    personName(cmp.A) + "：" + m.ea.title;
  li.appendChild(lineA);
  const lineB = document.createElement("div");
  lineB.className = "cmp-meet-ev";
  lineB.innerHTML = '<i style="background:' + cmp.colorB + '"></i>' +
    personName(cmp.B) + "：" + m.eb.title;
  li.appendChild(lineB);

  const note = document.createElement("div");
  note.className = "cmp-meet-note";
  if (m.level === "a") {
    note.textContent = "同一记载：二人同事件、同地、皆亲至。";
  } else {
    let t = m.chain
      ? "同年同地、异事件，且两事同属一条叙事链（相邻记载）——相遇与否仍须看时序。"
      : "同年同地、异事件——" + BINGUAN_DISCLAIMER;
    if (m.tol) t += "（跨年事件，在场判断已容忍 ±1 年：" +
      yearLabel(m.year) + " / " + yearLabel(m.year2) + "）";
    note.textContent = t;
  }
  li.appendChild(note);

  const go = () => cmpShowMeetings(m.place, cmp.meetings.filter(x => x.place === m.place));
  li.addEventListener("click", go);
  li.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); go(); } });
  return li;
}

/* 交会弹卡（点地图交会点或侧栏行）：定位地图到该地，展开两侧事件摘要，重复 B3 免责句 */
function cmpShowMeetings(placeId, list) {
  const pl = PLACES[placeId];
  if (pl && pl.lat != null && pl.lng != null) {
    const [px, py] = project(pl.lng, pl.lat);
    const b = cmp.box;
    if (b && (px < b.x || px > b.x + b.w || py < b.y || py > b.y + b.h)) {
      cmp.mode = "full";
      cmpApplyView({ x: 0, y: 0, w: MAP_W, h: MAP_H });
      $("#cmp-scope").textContent = "视野：全图";
    }
  }
  document.querySelectorAll(".cmp-meet.selected").forEach(g => g.classList.remove("selected"));
  const g = cmp.svg && cmp.svg.querySelector('.cmp-meet[data-place="' + placeId + '"]');
  if (g) g.classList.add("selected");

  const wrap = document.createElement("div");
  wrap.className = "cmp-meet-detail";
  list.forEach(m => {
    const box = document.createElement("div");
    box.className = "cmp-meet-detail-item lv-" + m.level;
    const h = document.createElement("h4");
    const badge = m.level === "a" ? "同场（同一记载）" : (m.chain ? "同年同地 · 相邻记载" : "同年同地 · 可能相遇");
    h.textContent = yearLabel(m.year) + " · " + badge;
    box.appendChild(h);
    const evA = document.createElement("p");
    evA.className = "cmp-meet-detail-ev";
    evA.innerHTML = '<i style="background:' + cmp.colorA + '"></i><b>' + personName(cmp.A) + "</b> · " +
      m.ea.title + "<br><span>" + (m.ea.summary || "") + "</span>";
    box.appendChild(evA);
    const evB = document.createElement("p");
    evB.className = "cmp-meet-detail-ev";
    evB.innerHTML = '<i style="background:' + cmp.colorB + '"></i><b>' + personName(cmp.B) + "</b> · " +
      m.eb.title + "<br><span>" + (m.eb.summary || "") + "</span>";
    box.appendChild(evB);
    if (m.level === "b" && m.tol) {
      const t = document.createElement("p");
      t.className = "cmp-meet-detail-tol";
      t.textContent = "跨年事件，在场判断已容忍 ±1 年（" + yearLabel(m.year) + " / " + yearLabel(m.year2) + "）。";
      box.appendChild(t);
    }
    box.appendChild(cmpEventPassages(m.ea));
    if (m.eb.id !== m.ea.id) box.appendChild(cmpEventPassages(m.eb));
    wrap.appendChild(box);
  });
  const dis = document.createElement("p");
  dis.className = "cmp-disclaimer in-card";
  dis.textContent = BINGUAN_DISCLAIMER;
  wrap.appendChild(dis);

  const title = (pl ? pl.ancient_name : placeId) + " · 交会（" + list.length + "）";
  // 手机端走底部抽屉；桌面走侧栏顶部内嵌卡
  if (window.matchMedia("(max-width: 680px)").matches || cmpZoom.active) {
    // 收起「交会一览」底部条，避免与详情抽屉在手机上叠底
    document.body.classList.remove("cmp-sheet-open");
    const st = $("#cmp-sheet-toggle");
    if (st) { st.setAttribute("aria-expanded", "false"); st.textContent = "交会一览 ▲"; }
    openDrawer(title, wrap);
  } else {
    cmpShowInlineDetail(title, wrap);
  }
}
function cmpEventPassages(e) {
  const frag = document.createDocumentFragment();
  const src = (e.source_ids || "").split(";").filter(Boolean)
    .map(id => (SRC_PREFIX[id[0]] || "") + (SOURCES[id] ? "·" + (SOURCES[id].title || id) : "")).filter(Boolean);
  if (src.length) {
    const p = document.createElement("p");
    p.className = "cmp-meet-src";
    p.textContent = "出处：" + src.join("；");
    frag.appendChild(p);
  }
  return frag;
}
function cmpShowInlineDetail(title, node) {
  const panel = $("#cmp-detail");
  panel.hidden = false;
  panel.textContent = "";
  const bar = document.createElement("div");
  bar.className = "cmp-detail-bar";
  const h3 = document.createElement("h3");
  h3.textContent = title;
  bar.appendChild(h3);
  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "✕";
  close.setAttribute("aria-label", "关闭交会详情");
  close.addEventListener("click", () => {
    panel.hidden = true;
    document.querySelectorAll(".cmp-meet.selected").forEach(g => g.classList.remove("selected"));
  });
  bar.appendChild(close);
  panel.appendChild(bar);
  panel.appendChild(node);
  if (window.matchMedia("(max-width: 900px)").matches) panel.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

/* ---- 并观播放：双轨模式，接入统一引擎 player（r17；r17b 主钟改故事进度 sc；r18 交会常亮）。
 * 主钟 elapsed 线性映射到故事进度 sc（[scMin,scMax]）；两标记位置＝sc 的纯函数
 * cmpPositionAt(waypoints, sc)；交会锚整数 sc 作 beats——主钟精确落位交会刻即两人到交会地
 * （从构造上保证「钟到交会年 ⇔ 人到交会地」）。r18：经过即点亮该交会地并常亮至结束/重置，
 * 未经过者保持待亮态；不暂停、不闪烁、不打断行进。 */
function setMarkerXY(el, pos, alive, isRect, color) {
  if (!el) return;
  el.removeAttribute("hidden");
  if (isRect) {
    const s = parseFloat(el.getAttribute("width")) || 14;
    el.setAttribute("x", pos.x - s / 2); el.setAttribute("y", pos.y - s / 2);
  } else {
    el.setAttribute("cx", pos.x); el.setAttribute("cy", pos.y);
  }
  el.setAttribute("opacity", alive ? "1" : "0.28");        // 未生/已卒灰置
  el.setAttribute("stroke", alive ? color : "#9A9081");
}
function cmpRenderAtSc(sc) {
  const year = cmpClockYearAt(sc);
  const posA = cmpPositionAt(cmp.waypointsA, sc);
  const posB = cmpPositionAt(cmp.waypointsB, sc);
  const aliveA = (cmp.lifeA.lo == null || year >= cmp.lifeA.lo) && (cmp.lifeA.hi == null || year <= cmp.lifeA.hi);
  const aliveB = (cmp.lifeB.lo == null || year >= cmp.lifeB.lo) && (cmp.lifeB.hi == null || year <= cmp.lifeB.hi);
  setMarkerXY(cmp.markerA, posA, aliveA, false, cmp.colorA);
  setMarkerXY(cmp.markerB, posB, aliveB, true, cmp.colorB);
  const head = $("#cmp-playhead");
  if (head) {
    head.hidden = false;
    head.style.left = cmpAxisPct(year) + "%";
    const yr = $("#cmp-playyear");
    if (yr) yr.textContent = yearLabel(Math.round(year));
  }
  cmpCaption(year);
}
function cmpCaption(year) {
  const st = (life) => (life.lo != null && year < life.lo) ? "未生"
    : (life.hi != null && year > life.hi) ? "已卒" : "在世";
  setCaption("dual", yearLabel(Math.round(year)) + " · " +
    personName(cmp.A) + "（" + st(cmp.lifeA) + "） / " +
    personName(cmp.B) + "（" + st(cmp.lifeB) + "）");
}
/* 交会锚被标记经过：点亮该交会地（加 .lit → 常亮至结束/重置），不闪烁、不暂停、不打断行进。
 * 侧栏—地图一一对应、免责句、相邻记载分辨全部保留（在侧栏与弹卡内，见 cmpBuildSidebar/cmpShowMeetings）。 */
function cmpFireMeetingBeat(sync) {
  const g = cmp.svg && cmp.svg.querySelector('.cmp-meet[data-place="' + sync.place + '"]');
  if (g) g.classList.add("lit");        // 常亮留痕，无 setTimeout 清除、无脉冲
}
/* 播放开始/重置：进入「播放态」，全部交会点回到待亮态（清除上一轮 .lit） */
function cmpResetLit() {
  if (!cmp.svg) return;
  cmp.svg.classList.add("cmp-play-active");
  cmp.svg.querySelectorAll(".cmp-meet.lit").forEach(g => g.classList.remove("lit"));
}
function comparePlayCfg() {
  const scMin = cmp.scMin, scSpan = (cmp.scMax - cmp.scMin) || 1;
  const dur = Math.max(4000, Math.min(14000, scSpan * 900)); // 内容时长（1× 基准），唯一速度 0.5× 由引擎缩放；按 sc 跨度定时长
  const e2sc = (el) => scMin + (dur > 0 ? el / dur : 1) * scSpan;
  const sc2e = (sc) => (sc - scMin) / scSpan * dur;
  const beats = cmp.syncs.map(s => ({ key: s.idx, at: sc2e(s.idx), fire: () => cmpFireMeetingBeat(s) }));
  return {
    mode: "dual", dur, beats,
    onStart() { cmp.markerA.removeAttribute("hidden"); cmp.markerB.removeAttribute("hidden"); cmpResetLit(); },
    render(el) { cmpRenderAtSc(e2sc(el)); },
    onFinish() { setPlayBtnText("dual", PLAY_LABEL.idle); cmpCaptionFade(); }, // 结束保留 .lit（常亮留痕）
    onStop() { cmpCleanup(); },
  };
}
function cmpCaptionFade() { clearCaption("dual", false); }
function cmpCleanup() {
  clearCaption("dual", true);
  setPlayBtnText("dual", PLAY_LABEL.idle);
  const head = document.querySelector("#cmp-playhead"); if (head) head.hidden = true;
  if (cmp.svg) { cmp.svg.classList.remove("cmp-play-active"); // 退出播放态：交会点回常态（非待亮）
    cmp.svg.querySelectorAll(".cmp-meet.lit").forEach(g => g.classList.remove("lit")); }
}
function toggleComparePlay() {
  if (player.cfg && player.cfg.mode === "dual" && player.raf && !player.paused) {
    playerPause(); setPlayBtnText("dual", PLAY_LABEL.resume); return;
  }
  if (player.cfg && player.cfg.mode === "dual" && player.paused) {
    playerResume(); setPlayBtnText("dual", PLAY_LABEL.pause); return;
  }
  playerStart(comparePlayCfg());
  setPlayBtnText("dual", PLAY_LABEL.pause);
}

/* 并观全屏：复用 #map-overlay 容器与 bindZoomGesture（容器统一律，与地图/关系图全屏同机制）。
 * 移动（非克隆）并观 svg，使播放标记保持在同一活节点上继续行进。 */
const cmpZoom = { active: false, svg: null, vbW: MAP_W, vbH: MAP_H, minFrac: 0.2,
                  aspect: 0, box: null, pointers: new Map(), pinch: null, panStart: null, panDist: 0 };
function openCmpOverlay() {
  if (!cmp.svg) return;
  const overlay = $("#map-overlay");
  overlay.setAttribute("aria-label", "并观地图全屏查看");
  $("#map-overlay-hint").textContent = "拖移平移 · 滚轮/双指缩放 · 点交会点看详情";
  const body = $("#map-overlay-body");
  body.textContent = "";
  body.appendChild(cmp.svg);
  overlay.hidden = false;
  document.body.classList.add("no-scroll");
  cmpZoom.active = true;
  mountCaption("dual");  // 字幕条派生式重挂入全屏容器（须在 body 清空与 cmpZoom.active 置位之后）
  cmpZoom.svg = cmp.svg;
  cmpZoom.vbW = MAP_W; cmpZoom.vbH = MAP_H; cmpZoom.aspect = 0;
  cmpZoom.pointers = new Map(); cmpZoom.pinch = null; cmpZoom.panStart = null; cmpZoom.panDist = 0;
  const start = cmp.mode === "fit" ? cmp.fitBox : { x: 0, y: 0, w: MAP_W, h: MAP_H };
  cmpZoom.box = { ...start };
  cmp.svg.setAttribute("viewBox", start.x + " " + start.y + " " + start.w + " " + start.h);
  mountOverlayControls("dual");   // 须在上面 body.textContent="" 之后（重建即在新容器内挂新节点）
  $("#btn-overlay-close").focus();
}
function closeCmpOverlay() {
  if (drawer.open) closeDrawer();
  const overlay = $("#map-overlay");
  overlay.hidden = true;
  overlay.setAttribute("aria-label", "地图全屏查看");
  $("#map-overlay-hint").textContent = "拖移平移 · 滚轮/双指缩放 · 点击地点看详情";
  document.body.classList.remove("no-scroll");
  unmountOverlayControls();
  cmpZoom.active = false;
  if (cmp.svg) $("#cmp-canvas").appendChild(cmp.svg);
  mountCaption("dual");  // 字幕条派生式重挂回内嵌图框（须在 cmpZoom.active 清零之后）
  cmpApplyView(cmp.mode === "fit" ? cmp.fitBox : { x: 0, y: 0, w: MAP_W, h: MAP_H });
}

/* ---------- 屏4 资料库 ---------- */
function renderLibrary() {
  document.querySelectorAll(".lib-tabs button").forEach(btn => {
    btn.setAttribute("aria-selected", String(btn.dataset.tab === state.tab));
  });
  const input = $("#lib-search");
  if (input.value !== state.q) input.value = state.q;
  renderLibList();
}
function libRows() {
  const q = state.q.trim().toLowerCase();
  const rows = DATA[state.tab] || [];
  if (!q) return rows;
  return rows.filter(r =>
    Object.values(r).filter(v => typeof v === "string").join(" ").toLowerCase().includes(q));
}
function srcTypeOf(id) {
  return SRC_PREFIX[(id || "")[0]] || "其他";
}
function renderLibList() {
  const list = $("#lib-list");
  list.textContent = "";
  const rows = libRows();
  if (!rows.length) {
    const li = document.createElement("li");
    li.className = "lib-empty";
    li.textContent = "没有匹配的条目。";
    list.appendChild(li);
    return;
  }
  for (const r of rows) {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.className = "lib-item";
    const title = document.createElement("strong");
    const sub = document.createElement("span");
    sub.className = "lib-sub";
    if (state.tab === "background") {
      title.textContent = r.item;
      sub.textContent = [r.category, r.certainty].filter(Boolean).join(" · ");
    } else if (state.tab === "archaeology") {
      title.textContent = r.site;
      sub.textContent = [r.related_state, r.period, r.certainty].filter(Boolean).join(" · ");
    } else {
      title.textContent = r.title;
      sub.textContent = [srcTypeOf(r.id), r.section].filter(Boolean).join(" · ");
    }
    b.appendChild(title);
    b.appendChild(sub);
    b.dataset.libId = r.id;               // 身份标记：供搜索落锚按 id 取节点（design_notes §7.1 相一）
    b.addEventListener("click", () => showLibDetail(r, b));
    li.appendChild(b);
    list.appendChild(li);
  }
  consumeLibSpot(list, rows);
}
/* 全站搜索「文献」组的落锚（r27）：展开该条详情、闪一下、滚到可见。
 * 断言口径守 design_notes §7.3——落点类功能必须断到像素，故此处走 spotScrollInto（双 rAF），
 * 与时间线/编年两处落锚同一条路径，不另写一份。 */
function consumeLibSpot(list, rows) {
  if (!pendingSpot || pendingSpot.view !== "library" || pendingSpot.type !== "source") return;
  const sid = pendingSpot.sid;
  const btn = list.querySelector('[data-lib-id="' + sid + '"]');
  const row = rows.find(r => r.id === sid);
  if (!btn || !row) return;               // 不在当前页签/被筛掉：留着 pendingSpot 由 render 清
  pendingSpot = null;
  const mobile = window.matchMedia("(max-width: 680px)").matches;
  showLibDetail(row, btn);
  btn.classList.add("spotlight");
  setTimeout(() => btn.classList.remove("spotlight"), 2400);
  /* 窄屏详情在列表之下（单栏纵排），故落锚取详情面板；桌面双栏取列表内的那一行。
   * showLibDetail 自带的窄屏滚动是单 rAF——那条路径原本只由「读者点击」触发（无 hash 导航，
   * 不受 §7.3 那一帧之争影响），本处却是导航之后，故此处一律另走双 rAF 的 spotScrollInto。 */
  spotScrollInto(mobile ? $("#lib-detail") : btn, btn);
}
function showLibDetail(r, srcCard) {
  const panel = $("#lib-detail");
  panel.textContent = "";
  // 手机端（<680px）单栏纵排：点卡后详情在列表下方，给醒目「返回列表」并滚动直达（Xiangtao 反馈 4）。
  // 桌面双栏此按钮 display:none，布局零变化。
  const mobile = window.matchMedia("(max-width: 680px)").matches;
  if (mobile && srcCard) {
    const back = document.createElement("button");
    back.type = "button";
    back.className = "lib-back";
    back.textContent = "× 返回列表";
    back.addEventListener("click", () => {
      // 列表未重绘，其滚动位置天然保留；滚回原卡片并聚焦
      srcCard.scrollIntoView({ block: "center", behavior: "smooth" });
      srcCard.focus({ preventScroll: true });
    });
    panel.appendChild(back);
  }
  const h3 = document.createElement("h3");
  const dl = document.createElement("dl");
  const row = (dt, dd) => {
    if (!dd) return;
    const t = document.createElement("dt"); t.textContent = dt;
    const d = document.createElement("dd"); d.textContent = dd;
    dl.appendChild(t); dl.appendChild(d);
  };
  const srcNames = (ids) => (ids || "").split(";").map(s => s.trim()).filter(Boolean)
    .map(id => (SOURCES[id] ? SOURCES[id].title : id)).join("；");
  if (state.tab === "background") {
    h3.textContent = r.item;
    row("类别", r.category);
    row("概要", r.summary);
    row("证据", r.evidence);
    row("确定性", r.certainty);
    row("来源", srcNames(r.source_ids));
  } else if (state.tab === "archaeology") {
    h3.textContent = r.site;
    row("相关国", r.related_state);
    row("时期", r.period);
    row("位置", r.location);
    row("概要", r.summary);
    row("确定性", r.certainty);
    row("来源", srcNames(r.source_ids));
  } else {
    h3.textContent = r.title;
    row("类型", srcTypeOf(r.id) + "（前缀 " + (r.id || "")[0] + "）");
    row("篇章", [r.work, r.section].filter(Boolean).join(" · "));
    row("性质", [r.category, r.source_type].filter(Boolean).join(" · "));
    row("说明", r.notes);
  }
  panel.appendChild(h3);
  panel.appendChild(dl);
  if (state.tab === "sources" && r.url) {
    const a = document.createElement("a");
    a.href = r.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "查看原文（外部链接）";
    panel.appendChild(a);
  }
  // 手机端：平滑滚动至详情并轻微高亮渐隐，让读者确认「这就是响应」
  if (mobile && srcCard) {
    panel.classList.remove("flash");
    void panel.offsetWidth; // 重启动画
    panel.classList.add("flash");
    requestAnimationFrame(() => panel.scrollIntoView({ block: "start", behavior: "smooth" }));
  }
}

/* ---------- 屏5 关系图谱：默认「以人为中心」ego 视图，可沿关系网游走；
 * 40 人全景保留为次级入口（分组环形布局），加「仅主角边」过滤。零依赖。 ---------- */
const REL_COLORS = {
  "亲属-直系": "#A9622B", "亲属-同辈": "#C79E7E", "婚姻": "#BC4433", "君臣": "#56707E",
  "拥立": "#44766B", "敌对": "#35302A", "师友": "#8A6D1F", "其他": "#8A8072",
};
/* 全景环形排位序：同国节点连续成弧，有主角之国另铺国色底晕。
 * r21 增「陈」（宋已在列）——宋、陈相邻置末，与首页分区末两位一致。
 * r27 增「吴」「越」置末：吴为该轮新立之国色家族（铺底晕），越其时尚无主角、只为使其人不落
 * 「未列之国」的末槽而与吴分离——吴越比邻，环上亦令其相接。未列之国仍按原规则排在最后。
 * r28 越亦立国色家族并有主角（勾践），此序不动即已就位——**当初为它留的槽，正是它现在的槽**。 */
const STATE_ORDER = ["齐", "鲁", "郑", "晋", "周", "卫", "楚", "秦", "曹", "许", "申", "宋", "陈", "吴", "越"];
const SIDE_TYPES = ["君臣", "拥立", "敌对", "师友", "其他"];
const isProto = (pid) => PROTAGONISTS.some(m => m.id === pid);

/* ----- 同对人物并线（r10）：一对人物只画一条边；多重关系加数字徽记，
 * 关系卡按类型列出全部关系。可靠度虚线：该对全部关系皆非 high 才虚线（规则详注入卡内）。 ----- */
const REL_TYPE_ORDER = Object.keys(REL_COLORS);
function relTypeRank(t) {
  const i = REL_TYPE_ORDER.indexOf(t);
  return i < 0 ? REL_TYPE_ORDER.length : i;
}
function sortRelsByType(rels) {
  return [...rels].sort((a, b) => relTypeRank(a.rel_type) - relTypeRank(b.rel_type) || a.id.localeCompare(b.id));
}
/* 过滤条件下把 relations 归组为 [{a, b, rels}]，rels 已按类型排序（首条定边色） */
function groupRelPairs(filter) {
  const pairs = new Map();
  for (const rel of DATA.relations) {
    if (filter && !filter(rel)) continue;
    const key = [rel.person_a, rel.person_b].sort().join("|");
    if (!pairs.has(key)) pairs.set(key, { a: rel.person_a, b: rel.person_b, rels: [] });
    pairs.get(key).rels.push(rel);
  }
  for (const p of pairs.values()) p.rels = sortRelsByType(p.rels);
  return [...pairs.values()];
}
/* 某人的全部一度关系（两端皆在库中）——全屏点节点时供抽屉列出，口径同 ego 侧栏 */
const relsTouching = (pid) => DATA.relations.filter(r =>
  (r.person_a === pid || r.person_b === pid) && PEOPLE[r.person_a] && PEOPLE[r.person_b]);
const pairDashed = (rels) => !rels.some(r => r.reliability === "high");
const pairTip = (rels) => rels.map(r =>
  personName(r.person_a) + " ·" + r.rel_label + "· " + personName(r.person_b) +
  (r.source_note ? "（" + r.source_note + "）" : "")).join("\n");
/* 多重关系数字徽记（置于边中点，点击同边） */
function edgeBadgeEl(x, y, n, color, onOpen) {
  const NS = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(NS, "g");
  g.setAttribute("class", "edge-multi");
  const c = document.createElementNS(NS, "circle");
  c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 7.2);
  c.setAttribute("fill", "#FBF7EC");
  c.setAttribute("stroke", color);
  c.setAttribute("stroke-width", "1.3");
  g.appendChild(c);
  const t = document.createElementNS(NS, "text");
  t.setAttribute("x", x); t.setAttribute("y", y + 3.2);
  t.setAttribute("text-anchor", "middle");
  t.textContent = String(n);
  g.appendChild(t);
  g.addEventListener("click", onOpen);
  return g;
}
const relView = {
  mode: "ego",           // ego=以人为中心 | pano=全景
  center: null,          // 当前中心人物
  stack: [],             // 游走历史（面包屑）
  collapsed: new Set(),  // ego 两侧折叠的分组（窄屏默认全折叠）
  collapsedInit: false,
  protoOnly: false,      // 全景「仅主角边」
  showAll: false,        // 全景「显示全部」：false=只画主角（默认，现 29），true=全库（现 127）（r24a-2 裁定②b）
  nodes: new Map(), edges: [], focus: null, isolated: new Set(), // 全景态
  detailReg: [],         // 每次绘图重建：边索引→该并线的 rels，供全屏克隆体按 data-detail 重绑抽屉
};

function renderRelations() {
  buildRelLegend();
  if (!relView.collapsedInit) {
    relView.collapsedInit = true;
    if (window.matchMedia("(max-width: 680px)").matches) {
      for (const t of SIDE_TYPES) relView.collapsed.add(t);
    }
  }
  // 路由即语义：#/p/X/relations → 以 X 为中心 ego；#/relations → 全景（带「仅主角边」过滤器）
  if (state.person) { relView.mode = "ego"; relView.center = state.person; relView.stack = []; }
  else relView.mode = "pano";
  // 搜索直达：非主角人物落其 ego 图（hash 保持全景 #/relations，语义同「以人为中心」游走态）
  if (pendingSpot && pendingSpot.type === "ego") {
    if (PEOPLE[pendingSpot.pid]) {
      relView.mode = "ego";
      relView.center = pendingSpot.pid;
      relView.stack = [];
    }
    pendingSpot = null;
  }
  drawRel();
}
function drawRel() {
  if (relView.mode === "ego" && !relView.center) relView.mode = "pano";
  updateRelToolbar();
  if (relView.mode === "ego") drawEgoGraph(relView.center);
  else drawPanoGraph();
}
function relRecenter(pid) {
  if (!PEOPLE[pid]) return;
  if (relView.mode === "ego" && pid === relView.center) return;
  if (relView.mode === "ego" && relView.center) {
    relView.stack.push(relView.center);
    if (relView.stack.length > 30) relView.stack.shift();
  }
  relView.center = pid;
  relView.mode = "ego";
  drawRel();
}
function updateRelToolbar() {
  const ego = relView.mode === "ego";
  $("#btn-rel-back").hidden = !(ego && relView.stack.length);
  /* 「仅主角边」只在「显示全部」时有意义——默认主角环上每条边两端皆主角，
   * 该过滤器恒为空操作，故一并隐去，不给读者一个点了没反应的勾选框（r24a-2）。 */
  $("#rel-filter-label").hidden = ego || !relView.showAll;
  const showAllLabel = $("#rel-showall-label");
  showAllLabel.hidden = ego;
  $("#rel-showall-text").textContent = "显示全部 " + DATA.people.length + " 人";
  $("#rel-show-all").checked = relView.showAll;
  const modeBtn = $("#btn-rel-mode");
  const panoN = panoPeople().length;
  modeBtn.textContent = ego ? "全景 " + panoN + (relView.showAll ? " 人" : " 主角") : "◎ 以人为中心";
  modeBtn.setAttribute("aria-pressed", String(!ego));
  const crumbs = $("#rel-crumbs");
  crumbs.textContent = "";
  if (!ego) {
    const s = document.createElement("span");
    s.className = "crumb-cur";
    /* 关系计数随「显示全部」与「仅主角边」双重过滤动态变化。
     * 口径与绘图一致：两端皆须在**环上**（r24a-2 起环上未必是全库，见 panoPeople），
     * 旧版只判「两端皆在库中」，主角默认态下会报出画不出来的边。 */
    const shown = new Set(panoPeople().map(p => p.id));
    const nEdges = DATA.relations.filter(r =>
      shown.has(r.person_a) && shown.has(r.person_b) &&
      (!relView.protoOnly || isProto(r.person_a) || isProto(r.person_b))).length;
    s.textContent = "全景 · " + shown.size + (relView.showAll ? " 人 · " : " 主角 · ") +
      nEdges + " 条关系" +
      (relView.protoOnly ? "（仅主角边）" : "") +
      (relView.showAll ? "" : "（默认只列主角，勾「显示全部」见全库）");
    crumbs.appendChild(s);
    return;
  }
  const trail = [...relView.stack, relView.center];
  const shown = trail.slice(-5);
  const base = trail.length - shown.length;
  const sep = (txt) => {
    const e = document.createElement("span");
    e.className = "crumb-sep";
    e.textContent = txt;
    return e;
  };
  if (base > 0) crumbs.appendChild(sep("… ›"));
  shown.forEach((pid, i) => {
    if (i) crumbs.appendChild(sep("›"));
    if (i === shown.length - 1) {
      const cur = document.createElement("span");
      cur.className = "crumb-cur";
      cur.setAttribute("aria-current", "true");
      cur.textContent = personName(pid);
      crumbs.appendChild(cur);
    } else {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = personName(pid);
      const k = base + i;
      b.addEventListener("click", () => {
        relView.stack = trail.slice(0, k);
        relView.center = trail[k];
        relView.mode = "ego";
        drawRel();
      });
      crumbs.appendChild(b);
    }
  });
}
function buildRelLegend() {
  const box = $("#rel-legend");
  box.textContent = "";
  for (const [type, color] of Object.entries(REL_COLORS)) {
    const s = document.createElement("span");
    const i = document.createElement("i");
    i.style.borderTopColor = color;
    s.appendChild(i);
    s.appendChild(document.createTextNode(type));
    box.appendChild(s);
  }
  const dash = document.createElement("span");
  dash.className = "rel-legend-dash";
  dash.textContent = "虚线＝可靠度中/低 · 数字＝多重关系（点开看）";
  box.appendChild(dash);
}
/* ----- ego 视图：中轴纵向家系 + 两侧按类型分组的其余一度关系 ----- */
function egoModel(pid) {
  const edges = DATA.relations.filter(r =>
    (r.person_a === pid || r.person_b === pid) && PEOPLE[r.person_a] && PEOPLE[r.person_b]);
  const fam = { grandparents: [], parents: [], siblings: [], spouses: [], children: [], grandchildren: [] };
  const side = new Map();         // rel_type -> Map(person -> rels)
  const sideHome = new Map();     // person -> 首见分组的 rels（同人多类型边并入一个节点，如周桓王之于郑庄公）
  const pushU = (arr, id) => { if (id !== pid && !arr.includes(id)) arr.push(id); };
  for (const r of edges) {
    const other = r.person_a === pid ? r.person_b : r.person_a;
    const otherIsSubject = r.person_a === other; // 约定：person_a 是 rel_label 的主语
    if (r.rel_type === "亲属-直系" && (r.rel_label === "父" || r.rel_label === "母")) {
      pushU(otherIsSubject ? fam.parents : fam.children, other);
    } else if (r.rel_type === "亲属-直系" && (r.rel_label === "祖父" || r.rel_label === "祖母")) {
      pushU(otherIsSubject ? fam.grandparents : fam.grandchildren, other);
    } else if (r.rel_type === "亲属-同辈") {
      pushU(fam.siblings, other);
    } else if (r.rel_type === "婚姻") {
      pushU(fam.spouses, other);
    } else {
      if (sideHome.has(other)) { sideHome.get(other).push(r); continue; }
      const t = SIDE_TYPES.includes(r.rel_type) ? r.rel_type : "其他";
      if (!side.has(t)) side.set(t, new Map());
      const m = side.get(t);
      if (!m.has(other)) m.set(other, []);
      m.get(other).push(r);
      sideHome.set(other, m.get(other));
    }
  }
  // 沿家系再推一代：父母之父母＝祖辈，子女之子女＝孙辈（连边本身在库中，照常绘出）
  for (const r of DATA.relations) {
    if (r.rel_type !== "亲属-直系" || (r.rel_label !== "父" && r.rel_label !== "母")) continue;
    if (!PEOPLE[r.person_a] || !PEOPLE[r.person_b]) continue;
    if (fam.parents.includes(r.person_b)) pushU(fam.grandparents, r.person_a);
    if (fam.children.includes(r.person_a)) pushU(fam.grandchildren, r.person_b);
  }
  // 家系已占位者不再入侧组（其非家系边直接画到家系节点上，如襄公·私通·文姜）
  const famSet = new Set([pid, ...fam.grandparents, ...fam.parents, ...fam.siblings,
                          ...fam.spouses, ...fam.children, ...fam.grandchildren]);
  for (const [t, m] of [...side]) {
    for (const id of [...m.keys()]) if (famSet.has(id)) m.delete(id);
    if (!m.size) side.delete(t);
  }
  return { edges, fam, side };
}

/* 返回 {d, mx, my}：d 为路径，(mx,my) 为路径中点（二次曲线 t=.5 处），供多重徽记落位 */
function quadPath(x1, y1, cx, cy, x2, y2) {
  return {
    d: "M" + x1 + " " + y1 + " Q" + cx + " " + cy + " " + x2 + " " + y2,
    mx: 0.25 * x1 + 0.5 * cx + 0.25 * x2,
    my: 0.25 * y1 + 0.5 * cy + 0.25 * y2,
  };
}
function relEdgePath(x1, y1, x2, y2, famArc) {
  // 同排/近水平边走弧线（家系弧向上、其余向下），避免横穿同排节点
  if (Math.abs(y2 - y1) < (famArc ? 8 : 34)) {
    const off = 44 + Math.abs(x2 - x1) * 0.06;
    return quadPath(x1, y1, (x1 + x2) / 2, (y1 + y2) / 2 + (famArc ? -off : off), x2, y2);
  }
  return { d: "M" + x1 + " " + y1 + " L" + x2 + " " + y2, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
}

function drawEgoGraph(pid) {
  const NS = "http://www.w3.org/2000/svg";
  relView.detailReg = []; // 本次绘图的边→rels 注册表（供全屏克隆体重绑）
  const { edges, fam, side } = egoModel(pid);

  // 侧组分列：按固定类型序贪心放入较矮一侧
  const sideCols = { left: [], right: [] };
  const colH = { left: 0, right: 0 };
  for (const t of SIDE_TYPES) {
    if (!side.has(t)) continue;
    const collapsed = relView.collapsed.has(t);
    const h = 40 + (collapsed ? 0 : side.get(t).size * 44) + 14;
    const col = colH.left <= colH.right ? "left" : "right";
    sideCols[col].push({ type: t, entries: side.get(t), collapsed });
    colH[col] += h;
  }
  const hasSide = sideCols.left.length + sideCols.right.length > 0;
  const anyExpanded = [...sideCols.left, ...sideCols.right].some(g => !g.collapsed);

  // 画布宽度按内容自适应（窄屏折叠侧组后中轴占满可视宽）
  const nSib = fam.siblings.length, nSp = fam.spouses.length;
  const egoHalf = Math.max(
    150 + Math.max(0, nSib - 1) * 104 + (nSib ? 60 : 0),
    150 + Math.max(0, nSp - 1) * 132 + (nSp ? 60 : 0));
  let rowHalf = 0;
  for (const row of [fam.grandparents, fam.parents, fam.children, fam.grandchildren]) {
    if (row.length) rowHalf = Math.max(rowHalf, (row.length - 1) / 2 * 168 + 60);
  }
  const centerHalf = Math.max(230, egoHalf, rowHalf);
  const sideW = anyExpanded ? 250 : (hasSide ? 130 : 40);
  const W = Math.min(1500, 2 * (centerHalf + sideW));
  const CX = W / 2;
  const LX = anyExpanded ? 100 : 70;
  const RX = W - LX;

  // 家系行（只保留出现的世代，中轴纵向）
  const rows = [];
  if (fam.grandparents.length) rows.push({ ids: fam.grandparents, kind: "gp" });
  if (fam.parents.length) rows.push({ ids: fam.parents, kind: "parents" });
  rows.push({ ids: [...fam.siblings, pid, ...fam.spouses], kind: "ego" });
  if (fam.children.length) rows.push({ ids: fam.children, kind: "children" });
  if (fam.grandchildren.length) rows.push({ ids: fam.grandchildren, kind: "gc" });
  let y0 = 96;
  const STEP = 118;
  const egoIdx = rows.findIndex(r => r.kind === "ego");
  if (hasSide && y0 + egoIdx * STEP < 205) y0 += 205 - (y0 + egoIdx * STEP);

  const placed = new Map(); // pid -> {x, y, side?, col?, rels?}
  rows.forEach((row, ri) => {
    const y = y0 + ri * STEP;
    if (row.kind === "ego") {
      placed.set(pid, { x: CX, y });
      fam.siblings.forEach((id, i) => placed.set(id, { x: CX - 150 - i * 104, y }));
      fam.spouses.forEach((id, i) => placed.set(id, { x: CX + 150 + i * 132, y }));
    } else {
      const x0 = CX - 168 * (row.ids.length - 1) / 2;
      row.ids.forEach((id, i) => placed.set(id, { x: x0 + i * 168, y }));
    }
  });

  // 侧组节点与表头位置
  const sideMeta = [];
  for (const col of ["left", "right"]) {
    let y = 92;
    const x = col === "left" ? LX : RX;
    for (const g of sideCols[col]) {
      sideMeta.push({ type: g.type, entries: g.entries, collapsed: g.collapsed, x, headY: y, col });
      y += 40;
      if (!g.collapsed) {
        for (const [id, rels] of g.entries) {
          placed.set(id, { x, y, side: true, col, rels });
          y += 44;
        }
      }
      y += 14;
    }
  }
  const H = Math.max(y0 + (rows.length - 1) * STEP + 96,
                     92 + Math.max(colH.left, colH.right) + 30, 430);

  const canvas = $("#rel-canvas");
  canvas.textContent = "";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  canvas.appendChild(svg);
  const edgeLayer = document.createElementNS(NS, "g");
  const nodeLayer = document.createElementNS(NS, "g");
  svg.appendChild(edgeLayer);
  svg.appendChild(nodeLayer);

  // 边：库中任意一对、两端都已落位者皆画（家系内部与两侧人物间的边一并呈现）；
  // 同对人物并为一线，多重关系加数字徽记（r10）
  const badgeLayer = document.createElementNS(NS, "g");
  for (const pair of groupRelPairs()) {
    const A = placed.get(pair.a), B = placed.get(pair.b);
    if (!A || !B) continue;
    const first = pair.rels[0];
    const famArc = ["亲属-直系", "亲属-同辈", "婚姻"].includes(first.rel_type);
    const touches = pair.a === pid || pair.b === pid;
    let seg;
    if ((A.side ? 1 : 0) + (B.side ? 1 : 0) === 1) {
      // 侧组边：弧线向外侧让开家系行，避免横穿同排节点与名签
      const S = A.side ? A : B, T = A.side ? B : A;
      const bow = Math.max(24, Math.abs(T.x - S.x) * 0.12);
      seg = quadPath(S.x, S.y, (S.x + T.x) / 2, S.y + (S.y <= T.y ? -bow : bow), T.x, T.y);
    } else {
      seg = relEdgePath(A.x, A.y, B.x, B.y, famArc);
    }
    const color = REL_COLORS[first.rel_type] || "#8A8072";
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", seg.d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", touches ? "2.4" : "1.4");
    path.style.opacity = touches ? "0.9" : "0.4";
    path.setAttribute("class", "rel-edge");
    if (pairDashed(pair.rels)) path.setAttribute("stroke-dasharray", "5 4");
    const tip = document.createElementNS(NS, "title");
    tip.textContent = pairTip(pair.rels);
    path.appendChild(tip);
    const di = relView.detailReg.push(pair.rels) - 1;
    path.dataset.detail = di;
    const open = () => showRelDetail(pair.rels, null);
    path.addEventListener("click", open);
    edgeLayer.appendChild(path);
    if (pair.rels.length > 1) {
      const badge = edgeBadgeEl(seg.mx, seg.my, pair.rels.length, color, open);
      badge.dataset.detail = di;
      const btip = document.createElementNS(NS, "title");
      btip.textContent = pairTip(pair.rels);
      badge.appendChild(btip);
      if (!touches) badge.style.opacity = "0.55";
      badgeLayer.appendChild(badge);
    }
  }
  edgeLayer.appendChild(badgeLayer); // 徽记压在边之上、节点之下

  // 节点
  for (const [id, pos] of placed) {
    nodeLayer.appendChild(egoNodeEl(id, pos, id === pid));
  }

  // 分组表头（点击/回车折叠展开）
  for (const g of sideMeta) {
    const gh = document.createElementNS(NS, "g");
    gh.setAttribute("class", "rel-ghead");
    gh.setAttribute("tabindex", "0");
    gh.setAttribute("role", "button");
    gh.setAttribute("aria-expanded", String(!g.collapsed));
    gh.setAttribute("aria-label", g.type + " 关系分组，" + g.entries.size + " 人，点击" + (g.collapsed ? "展开" : "折叠"));
    const bar = document.createElementNS(NS, "rect");
    bar.setAttribute("x", g.col === "left" ? g.x - 2 : g.x - 16);
    bar.setAttribute("y", g.headY - 10);
    bar.setAttribute("width", 18); bar.setAttribute("height", 3);
    bar.setAttribute("fill", REL_COLORS[g.type] || "#8A8072");
    gh.appendChild(bar);
    const t = document.createElementNS(NS, "text");
    t.setAttribute("x", g.x);
    t.setAttribute("y", g.headY + 8);
    t.setAttribute("text-anchor", g.col === "left" ? "start" : "end");
    t.textContent = (g.collapsed ? "▸ " : "▾ ") + g.type + " " + g.entries.size;
    gh.appendChild(t);
    const toggle = () => {
      if (relView.collapsed.has(g.type)) relView.collapsed.delete(g.type);
      else relView.collapsed.add(g.type);
      drawRel();
    };
    gh.addEventListener("click", toggle);
    gh.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
    nodeLayer.appendChild(gh);
  }

  showRelDetail(edges, pid);
}

function egoNodeEl(id, pos, isEgo) {
  const NS = "http://www.w3.org/2000/svg";
  const proto = PROTAGONISTS.find(m => m.id === id) || null;
  const g = document.createElementNS(NS, "g");
  g.setAttribute("class", "rel-node" + (proto ? " proto" : "") + (isEgo ? " ego" : ""));
  g.dataset.node = id; // 供全屏克隆体重绑：点节点→抽屉列其一度关系（含中心/家系/侧组节点）
  const r = isEgo ? (proto ? 17 : 12) : (pos.side ? 5.5 : (proto ? 12 : 7));
  if (isEgo) { // 中心人物：朱砂细环标记
    const ring = document.createElementNS(NS, "circle");
    ring.setAttribute("cx", pos.x); ring.setAttribute("cy", pos.y);
    ring.setAttribute("r", r + 4.5);
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", "#BC4433");
    ring.setAttribute("stroke-width", "1.4");
    g.appendChild(ring);
  }
  const c = document.createElementNS(NS, "circle");
  c.setAttribute("cx", pos.x); c.setAttribute("cy", pos.y); c.setAttribute("r", r);
  if (proto) {
    c.setAttribute("fill", proto.color);
    c.setAttribute("stroke", "#F4EDDF");
    c.setAttribute("stroke-width", isEgo ? 2.4 : 2);
  } else {
    c.setAttribute("fill", "#FBF7EC");
    c.setAttribute("stroke", isEgo ? "#2E2A24" : "#7A7166");
    c.setAttribute("stroke-width", isEgo ? 2.2 : 1.4);
  }
  g.appendChild(c);
  if (proto && !pos.side) {
    const bs = isEgo ? 22 : 15;
    fetchSVG(proto.badge).then(t => {
      if (!t) return;
      const doc = new DOMParser().parseFromString(t, "image/svg+xml");
      const b = document.importNode(doc.documentElement, true);
      b.setAttribute("x", pos.x - bs / 2); b.setAttribute("y", pos.y - bs / 2);
      b.setAttribute("width", bs); b.setAttribute("height", bs);
      b.style.color = "#F4EDDF";
      b.style.pointerEvents = "none";
      g.appendChild(b);
    });
  }
  const label = document.createElementNS(NS, "text");
  if (pos.side) {
    label.setAttribute("x", pos.col === "left" ? pos.x + 10 : pos.x - 10);
    label.setAttribute("y", pos.y + 4.5);
    label.setAttribute("text-anchor", pos.col === "left" ? "start" : "end");
    label.textContent = personName(id);
    const labels = [...new Set(pos.rels.map(r2 => r2.rel_label))].join("／");
    const sub = document.createElementNS(NS, "tspan");
    sub.setAttribute("class", "sublabel");
    sub.setAttribute("dx", "6");
    sub.textContent = labels.length > 9 ? labels.slice(0, 8) + "…" : labels;
    label.appendChild(sub);
  } else {
    label.setAttribute("x", pos.x);
    label.setAttribute("y", pos.y + r + 17);
    label.setAttribute("text-anchor", "middle");
    label.textContent = personName(id);
  }
  g.appendChild(label);
  if (isEgo) {
    g.setAttribute("aria-current", "true");
    g.setAttribute("aria-label", personName(id) + "：当前中心");
  } else {
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", personName(id) + "：以其为中心重绘");
    if (pos.rels) {
      const tip = document.createElementNS(NS, "title");
      tip.textContent = pos.rels.map(r2 =>
        personName(r2.person_a) + " ·" + r2.rel_label + "· " + personName(r2.person_b) +
        (r2.source_note ? "（" + r2.source_note + "）" : "")).join("\n");
      g.appendChild(tip);
    }
    g.addEventListener("click", () => relRecenter(id));
    g.addEventListener("dblclick", () => { if (proto) setHash(id, "timeline"); });
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); relRecenter(id); }
    });
  }
  return g;
}

/* 国别底晕（r14，裁定1·4）：为六主角国各铺一段极淡国色环弧，强化阵营分区。
 * 节点按 STATE_ORDER 首国连续排布，故同国节点占一段连续角；取该段首末节点角±半槽为弧幅，
 * 画环形扇（内 R-46、外 R+28），fill-opacity 0.10 只作底晕、不抢节点与连线。 */
function drawStateHalos(layer, people, CX, CY, R, NS) {
  const n = people.length;
  if (!n) return;
  const slot = (Math.PI * 2) / n;
  const angAt = (i) => (i / n) * Math.PI * 2 - Math.PI / 2;
  const spans = new Map(); // stateKey → [minIdx, maxIdx]
  people.forEach((p, i) => {
    const st = panoStateKey(p);
    if (!STATE_FAMILY_VAR[st]) return; // 仅有主角国（七家族）铺底晕
    const s = spans.get(st);
    if (!s) spans.set(st, [i, i]);
    else { s[0] = Math.min(s[0], i); s[1] = Math.max(s[1], i); }
  });
  const ri = R - 46, ro = R + 28;
  for (const [st, [lo, hi]] of spans) {
    const col = familyColor(st);
    if (!col) continue;
    const a0 = angAt(lo) - slot * 0.5, a1 = angAt(hi) + slot * 0.5;
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    const P = (r, a) => (CX + r * Math.cos(a)) + " " + (CY + r * Math.sin(a));
    const d = "M" + P(ro, a0) + " A" + ro + " " + ro + " 0 " + large + " 1 " + P(ro, a1) +
              " L" + P(ri, a1) + " A" + ri + " " + ri + " 0 " + large + " 0 " + P(ri, a0) + " Z";
    const wedge = document.createElementNS(NS, "path");
    wedge.setAttribute("d", d);
    wedge.setAttribute("fill", col);
    wedge.setAttribute("fill-opacity", "0.1");
    wedge.setAttribute("stroke", "none");
    wedge.setAttribute("class", "rel-halo");
    layer.appendChild(wedge);
  }
}

/* 全景节点呈现参数（r24a §9.3 硬性项实测后上调一档，实测对照见 delivery_vision_r24a §四）：
 * PANO_RING_W  主角节点的绢帛分隔描边宽（2 → 3.4）——国色制下同国同色，靠它划出盘缘；
 * PANO_BADGE   节点内嵌徽记边长（20 → 22）；
 * PANO_BADGE_SW 徽记线宽（源文件 2 → 呈现 2.6），以 CSS 覆盖 SVG 呈现属性，源文件不改。
 * 三者与「徽记源文件一律 stroke-width=2」的规约不冲突：改的只是呈现端。 */
const PANO_RING_W = 3.4, PANO_BADGE = 22, PANO_BADGE_SW = "2.6";
/* 全景环上的人物集合（r24a-2 裁定 ②b，即 r24a §4.3 三选项之 C）：
 * **默认只画主角**（现 29），勾「显示全部」才回到全库（现 127）。
 *
 * 根据（实测，非观感）：环半径 R=252 固定，相邻槽距＝2R·sin(π/n)。
 *   n=127 → 12.46px，**小于主角节点直径 30**，故主角盘面本就相互叠压，
 *           国色制下同国同色更并作一块色团，同弧徽记必然互相压边（r24a §四）；
 *   n=29  → 54.49px（r26b 复核，27 人时为 58.55），**仍大于节点直径 30、大于徽记边长 22**，
 *           同弧徽记两两不相接——加两人后余量由 28.55 收到 24.49，尚宽裕；
 *           按此式，槽距跌破节点直径 30 要到 n=53，跌破徽记 22 要到 n=72。
 * 这是 r24a 三条 costed 选项中唯一不改环几何、不改视觉性格即可根治的一条：
 * A（不等角槽）要把 viewBox 由 680 扩到约 800、图整体变大；B（双环错排）把「清爽单环」
 * 改成双环，属观感取向变更；C 只改「默认画谁」，且被改掉的信息量由一个开关原样取回。
 *
 * 单一来源：绘图与工具条计数取同一函数，故「环上几人」与「工具条报几人」不会脱节。
 * 排序键与旧版一字不差（STATE_ORDER 首国 → 主角优先 → id），故同国仍连续成弧。 */
function panoPeople() {
  return [...DATA.people]
    .filter(p => relView.showAll || isProto(p.id))
    .sort((a, b) => {
      const sa = STATE_ORDER.indexOf(panoStateKey(a));
      const sb = STATE_ORDER.indexOf(panoStateKey(b));
      return ((sa < 0 ? 99 : sa) - (sb < 0 ? 99 : sb)) ||
             ((b.is_protagonist || 0) - (a.is_protagonist || 0)) ||
             a.id.localeCompare(b.id);
    });
}
/* ----- 全景视图（分组环形布局，round6 原样保留；本轮加过滤器与国别底晕） ----- */
function drawPanoGraph() {
  const NS = "http://www.w3.org/2000/svg";
  relView.detailReg = []; // 本次绘图的边→rels 注册表（供全屏克隆体重绑）
  const W = 1000, H = 680, CX = 500, CY = 330, R = 252;
  const canvas = $("#rel-canvas");
  canvas.textContent = "";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  canvas.appendChild(svg);
  const haloLayer = document.createElementNS(NS, "g"); // 国别底晕（最底层）
  const edgeLayer = document.createElementNS(NS, "g");
  const nodeLayer = document.createElementNS(NS, "g");
  const badgeTop = document.createElementNS(NS, "g"); // 徽记顶层（r24a，见节点绘制处注释）
  svg.appendChild(haloLayer);
  svg.appendChild(edgeLayer);
  svg.appendChild(nodeLayer);

  const people = panoPeople();
  relView.nodes.clear();
  people.forEach((p, i) => {
    const ang = (i / people.length) * Math.PI * 2 - Math.PI / 2;
    relView.nodes.set(p.id, {
      p, x: CX + R * Math.cos(ang), y: CY + R * Math.sin(ang), ang,
      proto: PROTAGONISTS.find(m => m.id === p.id) || null, el: null, badgeEl: null,
    });
  });

  // 国别底晕（裁定1·4）：六主角国各占一段环弧，极淡国色扇形铺底，使齐鲁郑晋秦楚阵营一眼可辨。
  // 节点已按 STATE_ORDER 连续排布，同国节点成弧；仅为有主角之国着色，配角国不铺（避免喧闹）。
  drawStateHalos(haloLayer, people, CX, CY, R, NS);

  relView.edges = [];
  const badgeLayer = document.createElementNS(NS, "g");
  const pairs = groupRelPairs(rel =>
    !relView.protoOnly || isProto(rel.person_a) || isProto(rel.person_b)); // 仅主角边
  for (const pair of pairs) {
    const A = relView.nodes.get(pair.a), B = relView.nodes.get(pair.b);
    if (!A || !B) continue;
    const first = pair.rels[0];
    const color = REL_COLORS[first.rel_type] || "#8A8072";
    const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
    const seg = quadPath(A.x, A.y, mx + (CX - mx) * 0.45, my + (CY - my) * 0.45, B.x, B.y);
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", seg.d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", "1.6");
    path.setAttribute("class", "rel-edge");
    if (pairDashed(pair.rels)) path.setAttribute("stroke-dasharray", "5 4");
    const tip = document.createElementNS(NS, "title");
    tip.textContent = pairTip(pair.rels);
    path.appendChild(tip);
    const di = relView.detailReg.push(pair.rels) - 1;
    path.dataset.detail = di;
    const open = () => showRelDetail(pair.rels, null);
    path.addEventListener("click", open);
    edgeLayer.appendChild(path);
    let badge = null;
    if (pair.rels.length > 1) {
      badge = edgeBadgeEl(seg.mx, seg.my, pair.rels.length, color, open);
      badge.dataset.detail = di;
      const btip = document.createElementNS(NS, "title");
      btip.textContent = pairTip(pair.rels);
      badge.appendChild(btip);
      badgeLayer.appendChild(badge);
    }
    relView.edges.push({ a: pair.a, b: pair.b, rels: pair.rels, el: path, badge });
  }
  edgeLayer.appendChild(badgeLayer);

  for (const node of relView.nodes.values()) {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "rel-node" + (node.proto ? " proto" : ""));
    g.dataset.node = node.p.id; // 供全屏克隆体重绑：点节点→抽屉列其一度关系
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", node.p.name + "：查看其关系");
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", node.x); c.setAttribute("cy", node.y);
    c.setAttribute("r", node.proto ? 15 : 8);
    c.setAttribute("fill", node.proto ? node.proto.color : "#FBF7EC");
    c.setAttribute("stroke", node.proto ? "#F4EDDF" : "#7A7166");
    /* 主角节点的绢帛描边由 2 上调至 PANO_RING_W（r24a §9.3）：
     * 全库全环时槽距仅 12 余 px，主角节点 r=15 故盘面本就相互叠压；旧制靠同族深浅不同
     * 尚能看出盘缘，国色制下同国同色，一段弧遂并作一块色团（实测对照截图见交付说明 §四）。
     * 绢帛色描边是与填充色无关的分隔线——加宽它即可在同色相邻处重新划出盘缘。 */
    c.setAttribute("stroke-width", node.proto ? PANO_RING_W : 1.4);
    g.appendChild(c);
    if (node.proto) {
      fetchSVG(node.proto.badge).then(t => {
        const doc = new DOMParser().parseFromString(t, "image/svg+xml");
        const b = document.importNode(doc.documentElement, true);
        const h = PANO_BADGE / 2;
        b.setAttribute("x", node.x - h); b.setAttribute("y", node.y - h);
        b.setAttribute("width", PANO_BADGE); b.setAttribute("height", PANO_BADGE);
        b.style.color = "#F4EDDF";
        b.style.strokeWidth = PANO_BADGE_SW; // CSS 胜过 SVG 呈现属性，故整枚线宽同步上调
        b.style.pointerEvents = "none";
        /* 徽记入独立顶层：旧法把徽记塞进各自节点的 <g>，而 <g> 按环序依次追加，
         * 于是后一节点的盘面正好盖住前一节点的徽记——同弧六人只有最后一枚徽记露得出来。
         * 提到 badgeTop 层后，27 枚徽记一律叠在所有盘面之上。 */
        badgeTop.appendChild(b);
        node.badgeEl = b;
        if (relView.focus) b.style.opacity = node.el && node.el.style.opacity || "";
      });
    }
    const label = document.createElementNS(NS, "text");
    const out = node.proto ? 24 : 15;
    label.setAttribute("x", node.x + Math.cos(node.ang) * out);
    label.setAttribute("y", node.y + Math.sin(node.ang) * out + 4);
    label.setAttribute("text-anchor", Math.cos(node.ang) > 0.25 ? "start" : (Math.cos(node.ang) < -0.25 ? "end" : "middle"));
    label.textContent = node.p.name;
    g.appendChild(label);
    g.addEventListener("click", () => focusRelNode(node.p.id));
    g.addEventListener("dblclick", () => { if (node.proto) setHash(node.p.id, "timeline"); });
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); focusRelNode(node.p.id); }
    });
    nodeLayer.appendChild(g);
    node.el = g;
  }
  svg.appendChild(badgeTop); // 徽记顶层：置于全部节点盘面之上（见上方注释）

  // 「仅主角边」下无边可挂的配角淡出
  relView.isolated.clear();
  if (relView.protoOnly) {
    const linked = new Set();
    for (const e of relView.edges) { linked.add(e.a); linked.add(e.b); }
    for (const node of relView.nodes.values()) {
      if (!linked.has(node.p.id) && !node.proto) relView.isolated.add(node.p.id);
    }
  }

  if (relView.focus && relView.nodes.has(relView.focus)) focusRelNode(relView.focus);
  else resetRelFocus();
}
const personName = (id) => (PEOPLE[id] ? PEOPLE[id].name : id);

function focusRelNode(pid) {
  relView.focus = pid;
  const neighbors = new Set([pid]);
  const mine = [];
  for (const edge of relView.edges) {
    const hit = edge.a === pid || edge.b === pid;
    edge.el.style.opacity = hit ? "0.95" : "0.06";
    edge.el.setAttribute("stroke-width", hit ? "2.6" : "1.2");
    if (edge.badge) edge.badge.style.opacity = hit ? "1" : "0.08";
    if (hit) {
      mine.push(...edge.rels);
      neighbors.add(edge.a);
      neighbors.add(edge.b);
    }
  }
  for (const node of relView.nodes.values()) {
    const op = neighbors.has(node.p.id) ? "1" : "0.22";
    node.el.style.opacity = op;
    if (node.badgeEl) node.badgeEl.style.opacity = op; // 徽记已移出 <g>，须同步淡出（r24a）
    node.el.classList.toggle("focused", node.p.id === pid);
  }
  showRelDetail(mine, pid);
}
function resetRelFocus() {
  relView.focus = null;
  for (const edge of relView.edges) {
    edge.el.style.opacity = "";
    edge.el.setAttribute("stroke-width", "1.6");
    if (edge.badge) edge.badge.style.opacity = "";
  }
  for (const node of relView.nodes.values()) {
    const op = relView.isolated.has(node.p.id) ? "0.25" : "";
    node.el.style.opacity = op;
    if (node.badgeEl) node.badgeEl.style.opacity = op; // 同上
    node.el.classList.remove("focused");
  }
  const panel = $("#rel-panel");
  panel.textContent = "";
  const h3 = document.createElement("h3");
  h3.textContent = "关系详情";
  panel.appendChild(h3);
  const p = document.createElement("p");
  p.className = "map-status";
  p.textContent = "点人物节点，高亮其一度关系；点连线看出处。";
  panel.appendChild(p);
}
function relDetailTitle(rels, pid) {
  if (pid) return personName(pid) + " 的一度关系（" + rels.length + "）";
  if (rels.length > 1) return personName(rels[0].person_a) + " — " + personName(rels[0].person_b) +
    "（" + rels.length + " 重关系）";
  return "这条关系";
}
/* 关系详情正文（姓名行＋小传＋关系列表＋并线说明），不含标题与操作按钮。
 * 内嵌右侧卡片（#rel-panel）与全屏底部抽屉共用此函数，确保两处内容严格一致：
 * 多重关系全部列出、rel_label、可靠度、依据（source_note）。 */
function relDetailBody(rels, pid) {
  const frag = document.createDocumentFragment();
  if (pid && PEOPLE[pid]) {
    // 人物详情姓名行：完整形式（如 管仲 → 姬姓管氏，名夷吾，字仲）
    const nl = nameLineNode(PEOPLE[pid], "small");
    if (nl) frag.appendChild(nl);
  }
  if (pid && PEOPLE[pid] && PEOPLE[pid].short_bio) {
    const bio = document.createElement("p");
    bio.className = "rel-bio";
    bio.textContent = PEOPLE[pid].short_bio;
    frag.appendChild(bio);
  }
  const ul = document.createElement("ul");
  ul.className = "rel-list";
  for (const rel of rels) {
    const li = document.createElement("li");
    const line = document.createElement("div");
    line.textContent = personName(rel.person_a) + " ·" + rel.rel_label + "· " + personName(rel.person_b);
    li.appendChild(line);
    const meta = document.createElement("div");
    meta.className = "rel-meta";
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.style.borderColor = REL_COLORS[rel.rel_type];
    chip.style.color = REL_COLORS[rel.rel_type];
    chip.textContent = rel.rel_type;
    meta.appendChild(chip);
    addChip(meta, "可靠度 " + rel.reliability, "rel-" + rel.reliability);
    if (rel.source_note) {
      const note = document.createElement("span");
      note.className = "rel-note";
      note.textContent = rel.source_note;
      meta.appendChild(note);
    }
    li.appendChild(meta);
    ul.appendChild(li);
  }
  frag.appendChild(ul);
  if (!pid && rels.length > 1) {
    // 并线规则随卡注明：同对人物合并为一线，虚线含义在此交代（图例只留提示）
    const note = document.createElement("p");
    note.className = "rel-pair-note";
    note.textContent = "两人的多重关系在图上并为一线、以数字徽记标记；连线虚线表示所列关系可靠度皆为中/低，实线表示至少一条为 high。";
    frag.appendChild(note);
  }
  return frag;
}
function showRelDetail(rels, pid) {
  rels = sortRelsByType(rels);
  const panel = $("#rel-panel");
  panel.textContent = "";
  const h3 = document.createElement("h3");
  h3.textContent = relDetailTitle(rels, pid);
  panel.appendChild(h3);
  panel.appendChild(relDetailBody(rels, pid));
  const acts = document.createElement("p");
  acts.className = "rel-actions";
  // 并观入口（r16）：两人关系卡（pid 为空的成对卡）、且二人皆主角 → 「并观其迹」
  if (!pid && rels.length && bothProto(rels[0].person_a, rels[0].person_b)) {
    const cbtn = document.createElement("button");
    cbtn.type = "button";
    cbtn.className = "cmp-enter";
    cbtn.textContent = "并观其迹 →";
    cbtn.addEventListener("click", () => goCompare(rels[0].person_a, rels[0].person_b));
    acts.appendChild(cbtn);
  }
  if (pid && relView.mode === "pano") {
    const center = document.createElement("button");
    center.type = "button";
    center.textContent = "◎ 以 " + personName(pid) + " 为中心";
    center.addEventListener("click", () => relRecenter(pid));
    acts.appendChild(center);
  }
  if (pid && PROTAGONISTS.some(m => m.id === pid)) {
    const go = document.createElement("button");
    go.type = "button";
    go.textContent = "查看 " + personName(pid) + " 的时间线 →";
    go.addEventListener("click", () => setHash(pid, "timeline"));
    acts.appendChild(go);
  }
  if (relView.mode === "pano") {
    const clear = document.createElement("button");
    clear.type = "button";
    clear.textContent = "清除高亮";
    clear.addEventListener("click", resetRelFocus);
    acts.appendChild(clear);
  }
  panel.appendChild(acts);
}
/* 全屏放大态：点边/点节点 → 底部抽屉（复用地图抽屉的开合/下滑/遮罩/ESC 三件套）。
 * 内容与内嵌右侧卡片一致；仅保留「查看时间线」这一不与全屏冲突的操作（先退出全屏再跳转）。 */
function showRelDetailDrawer(rels, pid) {
  rels = sortRelsByType(rels);
  const wrap = document.createElement("div");
  wrap.appendChild(relDetailBody(rels, pid));
  const acts = document.createElement("p");
  acts.className = "rel-actions";
  // 并观入口（r16）：全屏抽屉内的成对卡同样提供「并观其迹」（先退出全屏再进并观）
  if (!pid && rels.length && bothProto(rels[0].person_a, rels[0].person_b)) {
    const cbtn = document.createElement("button");
    cbtn.type = "button";
    cbtn.className = "cmp-enter";
    cbtn.textContent = "并观其迹 →";
    cbtn.addEventListener("click", () => { closeDrawer(); closeRelOverlay(); goCompare(rels[0].person_a, rels[0].person_b); });
    acts.appendChild(cbtn);
  }
  if (pid && PROTAGONISTS.some(m => m.id === pid)) {
    const go = document.createElement("button");
    go.type = "button";
    go.textContent = "查看 " + personName(pid) + " 的时间线 →";
    go.addEventListener("click", () => { closeDrawer(); closeRelOverlay(); setHash(pid, "timeline"); });
    acts.appendChild(go);
  }
  if (acts.childNodes.length) wrap.appendChild(acts);
  openDrawer(relDetailTitle(rels, pid), wrap);
}

/* ---------- 全站搜索（r11）：一框检索人物/地点/事件/原文/文献，纯前端包含匹配 ----------
 * 匹配口径：小写化＋去空格的包含匹配；字段间以「|」隔断，避免跨字段误连。
 * 直达语义：人物（主角）→时间线，人物（非主角）→其 ego 关系图；地点→地图并高亮；
 * 事件→编年定位展开；原文→编年卡内定位到引文块；**文献→资料库·来源页并展开该条**。
 *
 * 第五组「文献」（r27 补入）——起因是一个可检验的缺口：**孙武**。《左传》《国语》零明文，
 * 依 conventions §2 T 层通例不立 `people` 行（r27 裁定 2），其名只存于 `E228.summary` 与
 * `S011.notes`；而全站搜索此前四组里没有一组覆盖 `sources`，于是 `notes` 里那句
 * 「《孙子》作者不见于经传」搜不到——**本库特意写下的那条分层说明，读者只能靠翻资料库撞见**。
 * 资料库自己的搜索框（libRows）本就逐字段查、包含 notes，缺的只是全站这一框，故补一组即可。 */
const searchNorm = (s) => (s || "").toLowerCase().replace(/\s+/g, "");
const SEARCH_GROUPS = [
  { key: "people", name: "人物" },
  { key: "places", name: "地点" },
  { key: "events", name: "事件" },
  { key: "passages", name: "原文" },
  { key: "sources", name: "文献" },
];
const SEARCH_LIMIT = 8; // 每组先显 8 条，「更多」展开
let SEARCH_INDEX = [];
let PLACE_PROTOS = new Map(); // place_id → 在此地有事件的主角（按主角序）
const search = { opts: [], active: -1, expanded: new Set(), timer: 0 };

const protoRank = (pid) => {
  const i = PROTAGONISTS.findIndex(m => m.id === pid);
  return i < 0 ? 99 : i;
};
/* ⚠ 旧函数 `protoForEvent(eid)`（「这条事件该归哪位主角的时间线」）已于 r25 随事件落点改制退役：
 * 它存在的唯一理由是「事件没有自己的落点，须临时挑一位主角当宿主」，而挑法本身只能是猜——
 * 当前人物语境优先、否则主角序中首个亲至者。编年视图给出全库事件的正式落点后，这道猜测不再需要。
 * 由编年卡的挂链人物签回人物线时，人是读者点的，不必替他挑（见 goEventPerson）。 */

/* 编年卡「所系人物」签的落点：主角 → 其时间线**并定位到同一条事件**（往返精确到事，不只到人）；
 * 非主角无时间线，落其 ego 关系图（同 goSearchPerson 的既有语义）。 */
function goEventPerson(pid, eid) {
  if (!(isProto(pid) && PEOPLE[pid])) { goSearchPerson(pid); return; }
  pendingSpot = { view: "timeline", type: "event", eid };
  setHash(pid, "timeline");
}

function buildSearchIndex() {
  PLACE_PROTOS = new Map();
  const evPlace = Object.fromEntries(DATA.events.map(e => [e.id, e.place_id]));
  for (const l of DATA.event_people) {
    if (!isProto(l.person_id) || !PEOPLE[l.person_id]) continue;
    const plid = evPlace[l.event_id];
    if (!plid) continue;
    if (!PLACE_PROTOS.has(plid)) PLACE_PROTOS.set(plid, []);
    const arr = PLACE_PROTOS.get(plid);
    if (!arr.includes(l.person_id)) arr.push(l.person_id);
  }
  for (const arr of PLACE_PROTOS.values()) arr.sort((a, b) => protoRank(a) - protoRank(b));

  SEARCH_INDEX = [];
  for (const p of DATA.people) {
    SEARCH_INDEX.push({
      group: "people",
      text: searchNorm([p.name, p.alt_names, p.xing, p.shi, p.ming, p.zi].filter(Boolean).join("|")),
      label: p.name,
      sub: [nameLineText(p, false), p.state, isProto(p.id) ? "主角" : ""].filter(Boolean).join(" · "),
      go: () => goSearchPerson(p.id),
    });
  }
  for (const pl of DATA.places) {
    SEARCH_INDEX.push({
      group: "places",
      text: searchNorm([pl.ancient_name, pl.modern_location].filter(Boolean).join("|")),
      label: pl.ancient_name,
      sub: [pl.state, pl.modern_location || "地望不详"].filter(Boolean).join(" · "),
      go: () => goSearchPlace(pl.id),
    });
  }
  /* r25：**全库事件一律入索引**，不再要求有主角挂链。
   * 旧码此处有一行 `if (!protoForEvent(e.id)) continue;`——因为当时事件唯一的落点是主角时间线，
   * 无主角挂链者搜出来也无处可去，故索引干脆跳过它们；r24a 走查实测这使 13 条事件全站不可达
   * （E021/E059/E077/E078/E081/E184/E200–E206，含 E205 齐太史书「崔杼弑其君」、E206 弭兵之会），
   * 上报后领队裁定甲案。r25 编年视图既已给出全库事件的落点，此处的过滤便随之取消。 */
  for (const e of DATA.events) {
    const pl = e.place_id ? PLACES[e.place_id] : null;
    SEARCH_INDEX.push({
      group: "events",
      // 事发地古名/今地一并入检索文本：搜「临淄」应见发生于临淄之事
      text: searchNorm([e.title, e.summary, pl && pl.ancient_name, pl && pl.modern_location]
        .filter(Boolean).join("|")),
      label: e.title,
      sub: [yearLabel(e.year_bce), e.lu_reign, e.category, pl && pl.ancient_name]
        .filter(Boolean).join(" · "),
      go: () => goSearchEvent(e.id, null),
    });
  }
  for (const q of DATA.passages) {   // 同上：引文亦不再按「其事有无主角」筛，落点同为编年
    const src = SOURCES[q.source_id];
    const evt = EVENTS[q.event_id];
    const snippet = q.quote_original.length > 24 ? q.quote_original.slice(0, 24) + "…" : q.quote_original;
    SEARCH_INDEX.push({
      group: "passages",
      text: searchNorm([q.quote_original, q.modern_note].filter(Boolean).join("|")),
      label: snippet,
      sub: [(src ? src.title : q.source_id) + (q.quote_type && q.quote_type !== "原文" ? "（" + q.quote_type + "）" : ""),
            evt ? yearLabel(evt.year_bce) + " " + evt.title : ""].filter(Boolean).join(" · "),
      go: () => goSearchEvent(q.event_id, q.id),
    });
  }
  /* 文献组：来源行的书名/篇章/性质/**说明**一并入检索文本。
   * `notes` 是本库对该源之分层与用法的编者说明（如 S011 注明「《孙子》作者不见于经传」），
   * 是「查无此人而有说明可读」这一路读者动线的唯一落点，故不可漏。 */
  for (const s of DATA.sources) {
    SEARCH_INDEX.push({
      group: "sources",
      text: searchNorm([s.title, s.work, s.section, s.author, s.category, s.source_type, s.notes]
        .filter(Boolean).join("|")),
      label: s.title,
      sub: [srcTypeOf(s.id), s.section, s.category].filter(Boolean).join(" · "),
      go: () => goSearchSource(s.id),
    });
  }
}

/* 文献直达：落资料库「来源」页并展开该条（不预填资料库自己的检索框——
 * 预填会把列表筛成一行，读者反而看不见它在全部文献中的位置）。落锚由 consumeLibSpot 完成。 */
function goSearchSource(sid) {
  pendingSpot = { view: "library", type: "source", sid };
  setHash(null, "library", "sources", "");
}
function goSearchPerson(pid) {
  if (isProto(pid) && PEOPLE[pid]) { setHash(pid, "timeline"); return; }
  pendingSpot = { view: "relations", type: "ego", pid };
  setHash(null, "relations");
}
function goSearchPlace(plid) {
  const cands = PLACE_PROTOS.get(plid) || [];
  const pid = (personCtx && cands.includes(personCtx) ? personCtx : cands[0]) ||
              personCtx || (PROTAGONISTS.find(m => PEOPLE[m.id]) || {}).id;
  if (!pid) return;
  pendingSpot = { view: "map", type: "place", placeId: plid };
  setHash(pid, "map");
}
/* 事件／原文命中一律落编年（r25）。
 * 旧行为是落「某位主角的时间线」，须先由 protoForEvent 猜一位主角作宿主——那本是权宜：
 * 事件当时没有自己的落点。编年既已是全库事件的正式落点，语义就该统一：
 * **事件属于编年，人物线是它的一个视角**。挂链人物由卡内徽记签给出，一点即回其人物线，
 * 通路未失、且不再有「这条事件归谁」的猜测。 */
function goSearchEvent(eid, qid) {
  if (!EVENTS[eid]) return;
  pendingSpot = qid
    ? { view: "chronicle", type: "quote", eid, qid }
    : { view: "chronicle", type: "event", eid };
  setHash(null, "chronicle");
}

function initSearch() {
  buildSearchIndex();
  const box = $("#site-search");
  const input = $("#global-search");
  const pop = $("#search-pop");
  const toggle = $("#search-toggle");
  const isNarrow = () => window.matchMedia("(max-width: 680px)").matches;

  const openPop = () => {
    pop.hidden = false;
    input.setAttribute("aria-expanded", "true");
  };
  const closePop = () => {
    pop.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    search.opts = [];
    search.active = -1;
  };
  const collapseNarrow = () => {
    if (isNarrow()) {
      box.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  };

  toggle.addEventListener("click", () => {
    const open = box.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    if (open) input.focus();
    else closePop();
  });

  const markActive = () => {
    search.opts.forEach((el, i) => {
      el.classList.toggle("active", i === search.active);
      el.setAttribute("aria-selected", String(i === search.active));
    });
    const cur = search.opts[search.active];
    if (cur) {
      input.setAttribute("aria-activedescendant", cur.id);
      cur.scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  };
  const choose = (go) => {
    closePop();
    collapseNarrow();
    input.blur();
    go();
  };

  function runSearch(raw) {
    const q = searchNorm(raw);
    if (!q) { closePop(); return; }
    pop.textContent = "";
    search.opts = [];
    search.active = -1;
    let optSeq = 0, total = 0;
    for (const g of SEARCH_GROUPS) {
      const hits = SEARCH_INDEX.filter(en => en.group === g.key && en.text.includes(q));
      if (!hits.length) continue;
      total += hits.length;
      const head = document.createElement("div");
      head.className = "search-ghead";
      head.setAttribute("role", "presentation");
      head.textContent = g.name + " · " + hits.length;
      pop.appendChild(head);
      const showAll = search.expanded.has(g.key);
      for (const en of (showAll ? hits : hits.slice(0, SEARCH_LIMIT))) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "search-opt";
        b.id = "sr-opt-" + (optSeq++);
        b.setAttribute("role", "option");
        b.setAttribute("aria-selected", "false");
        const lab = document.createElement("strong");
        lab.textContent = en.label;
        b.appendChild(lab);
        if (en.sub) {
          const sub = document.createElement("span");
          sub.className = "search-sub";
          sub.textContent = en.sub;
          b.appendChild(sub);
        }
        b.addEventListener("click", () => choose(en.go));
        pop.appendChild(b);
        search.opts.push(b);
      }
      if (!showAll && hits.length > SEARCH_LIMIT) {
        const more = document.createElement("button");
        more.type = "button";
        more.className = "search-opt search-more";
        more.id = "sr-opt-" + (optSeq++);
        more.setAttribute("role", "option");
        more.setAttribute("aria-selected", "false");
        more.textContent = "更多（还有 " + (hits.length - SEARCH_LIMIT) + " 条）→";
        more.addEventListener("click", () => {
          const keep = search.opts.indexOf(more);
          search.expanded.add(g.key);
          runSearch(raw);
          search.active = Math.min(keep, search.opts.length - 1);
          markActive();
          input.focus();
        });
        pop.appendChild(more);
        search.opts.push(more);
      }
    }
    if (!total) {
      const em = document.createElement("div");
      em.className = "search-empty";
      em.textContent = SEARCH_EMPTY;
      pop.appendChild(em);
    }
    openPop();
  }

  input.addEventListener("input", () => {
    clearTimeout(search.timer);
    search.timer = setTimeout(() => {
      search.expanded.clear();
      runSearch(input.value);
    }, 200); // 输入防抖 200ms
  });
  input.addEventListener("focus", () => {
    if (searchNorm(input.value)) runSearch(input.value);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closePop();
      collapseNarrow();
      return;
    }
    if (pop.hidden || !search.opts.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = search.opts.length;
      search.active = e.key === "ArrowDown"
        ? (search.active + 1) % n
        : (search.active - 1 + n) % n;
      markActive();
    } else if (e.key === "Enter") {
      e.preventDefault();
      (search.opts[Math.max(search.active, 0)] || search.opts[0]).click();
    }
  });
  document.addEventListener("pointerdown", (e) => {
    if (box.contains(e.target)) return;
    closePop();
    if (isNarrow() && !searchNorm(input.value)) collapseNarrow();
  });
}

/* ---------- 分享卡生成器（r11）：canvas 运行时合成，零依赖 ----------
 * 构图：青铜双线框＋回纹带（几何抽象，非纹理贴图）＋站名＋主角色签＋
 * 邀请语（SHARE_COPY.invite）＋站点二维码（assets/share/qr.png）＋域名。
 * 两版尺寸：1080×1440（3:4 竖图）与 1080×1080（方图）。 */
const SHARE_SERIF = '"Songti SC","Noto Serif CJK SC","STSong","SimSun",serif';
const SHARE_SANS = 'system-ui,"PingFang SC","Microsoft YaHei",sans-serif';
const shareView = { w: 1080, h: 1440, qr: null, qrFailed: false };
const shareDialog = { close: () => {}, isOpen: () => false };

function showToast(el, msg) {
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._toastTimer);
  el._toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}
async function copySiteLink(toastEl) {
  let ok = true;
  try {
    await navigator.clipboard.writeText(SITE_URL);
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = SITE_URL;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      ok = document.execCommand("copy");
      ta.remove();
    } catch { ok = false; }
  }
  showToast(toastEl, ok ? SHARE_COPY.copied : "复制未成——链接是 " + SITE_URL);
}

function loadShareQR() {
  return new Promise((resolve) => {
    if (shareView.qr || shareView.qrFailed) return resolve(shareView.qr);
    const im = new Image();
    im.onload = () => { shareView.qr = im; resolve(im); };
    im.onerror = () => { shareView.qrFailed = true; resolve(null); };
    im.src = "assets/share/qr.png";
  });
}
/* 手动字距逐字绘制（canvas letterSpacing 兼容性不齐），居中于 cx */
function drawSpacedLine(ctx, text, cx, y, spacing) {
  const chars = [...text];
  const widths = chars.map(ch => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let x = cx - total / 2;
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x, y);
    x += widths[i] + spacing;
  });
}
/* 中文换行：超宽即断，标点不落行首 */
function wrapCJK(ctx, text, maxW) {
  const NO_HEAD = "，。、；：？！——…»」』）·";
  const lines = [];
  let cur = "";
  for (const ch of text) {
    if (cur && ctx.measureText(cur + ch).width > maxW && !NO_HEAD.includes(ch)) {
      lines.push(cur);
      cur = ch;
    } else cur += ch;
  }
  if (cur) lines.push(cur);
  return lines;
}
/* 涡纹徽记（甲版 brand mark，与 favicon.svg / 站头同一形）——零依赖几何绘制。
 * 双同心 3/4 弧＋中心点，box 为 64 视口映射后的边长（px），居中于 (cx,cy)。 */
function drawSpiralMark(ctx, cx, cy, box, color) {
  const s = box / 64;                 // 64 视口 → box px
  const TOP = -Math.PI / 2, LEFT = Math.PI; // 顶点起、左点止，顺时针 270°
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = 5 * s;
  ctx.beginPath();
  ctx.arc(cx, cy, 20 * s, TOP, LEFT, false); // 外弧 r=20
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 10 * s, TOP, LEFT, false); // 内弧 r=10
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(cx, cy, 2.6 * s, 0, Math.PI * 2); // 中心点
  ctx.fill();
  ctx.restore();
}
/* 回纹带（雷纹钥匙纹）——「青铜的线」，单元几何绘制 */
function drawMeanderBand(ctx, cx, y, width, u, color) {
  const step = u * 1.5;
  const n = Math.max(1, Math.floor(width / step));
  let x = cx - (n * step - (step - u)) / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, u / 8);
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y + u);
    ctx.lineTo(x, y);
    ctx.lineTo(x + u, y);
    ctx.lineTo(x + u, y + u * 0.7);
    ctx.lineTo(x + u * 0.32, y + u * 0.7);
    ctx.lineTo(x + u * 0.32, y + u * 0.36);
    ctx.lineTo(x + u * 0.64, y + u * 0.36);
    ctx.stroke();
    x += step;
  }
  ctx.restore();
}

function drawShareCard() {
  const canvas = $("#share-canvas");
  const W = shareView.w, H = shareView.h;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const square = H <= W;

  // 绢帛底＋青铜双线框
  ctx.fillStyle = "#F4EDDF";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(68, 118, 107, 0.9)";
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, W - 60, H - 60);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(44, 44, W - 88, H - 88);

  const L = square
    ? { band: 88, mark: 150, markBox: 60, title: 268, titleSize: 104, ticks: 320, invite: 428, inviteSize: 40, qrTop: 500, qrBox: 380, domain: 944, bandBottom: H - 92 }
    : { band: 118, mark: 200, markBox: 76, title: 356, titleSize: 122, ticks: 424, invite: 556, inviteSize: 50, qrTop: 716, qrBox: 430, domain: 1240, bandBottom: H - 156 };

  drawMeanderBand(ctx, W / 2, L.band, W * 0.5, 26, "rgba(68, 118, 107, 0.6)");
  drawMeanderBand(ctx, W / 2, L.bandBottom, W * 0.5, 26, "rgba(68, 118, 107, 0.6)");

  // 涡纹徽记（甲版 brand mark，居站名之上，暖赭；与 favicon / 站头 / og-card 同一形）
  drawSpiralMark(ctx, W / 2, L.mark, L.markBox, "#B4652F");

  // 站名
  ctx.fillStyle = "#2E2A24";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "700 " + L.titleSize + "px " + SHARE_SERIF;
  drawSpacedLine(ctx, "经纬春秋", W / 2, L.title, L.titleSize * 0.16);

  /* 国色家族色点一行（r22 由「每主角一枚色签」改为「每国色家族一枚色点」）。
   * 改动理由是构图承重、非排版微调，勿改回按人计：旧法一行宽 = 40×主角数 − 14，随主角数线性增长——
   * 23 主角时 906px（距内框净宽 992px 仅余 43px），26 主角时 1026px，起点 x=27 已越出外框 x=30。
   * 按国色家族计数后，增长源由「主角数」变为「国色家族数」：新增主角不再加宽，唯新立国色家族才 +1 枚，
   * 而家族数增长远慢于主角数（现九族 26 人）。九族一行仅 372px，余量充裕。
   * 色序与色值同源 STATE_FAMILY_VAR / familyColor()——与首页九分区、关系全景阵营底晕共用同一份，不另写。 */
  const fams = Object.keys(STATE_FAMILY_VAR);
  const dotR = 10, dotGap = 44;
  let tx = W / 2 - ((fams.length - 1) * dotGap) / 2;
  for (const st of fams) {
    ctx.fillStyle = familyColor(st) || "#B4652F";
    ctx.beginPath();
    ctx.arc(tx, L.ticks + 4, dotR, 0, Math.PI * 2);
    ctx.fill();
    tx += dotGap;
  }

  // 邀请语（N2）：一行放不下时优先在「——」处分行，再退一般换行
  ctx.fillStyle = "#2E2A24";
  ctx.font = "400 " + L.inviteSize + "px " + SHARE_SERIF;
  const invite = SHARE_COPY.invite;
  const maxW = W - 240;
  const spacing = L.inviteSize * 0.1;
  const fits = (t) => ctx.measureText(t).width + spacing * Math.max(0, [...t].length - 1) <= maxW;
  let lines;
  if (fits(invite)) lines = [invite];
  else if (invite.includes("——")) {
    const cut = invite.indexOf("——") + 2;
    lines = [invite.slice(0, cut), invite.slice(cut)];
    if (!lines.every(fits)) lines = wrapCJK(ctx, invite, maxW);
  } else lines = wrapCJK(ctx, invite, maxW);
  lines.forEach((ln, i) => {
    drawSpacedLine(ctx, ln, W / 2, L.invite + i * L.inviteSize * 1.62, spacing);
  });

  // 二维码：生绢衬块＋整数倍缩放绘制（关平滑，保模块锐利可扫）
  const box = L.qrBox;
  const bx = W / 2 - box / 2, by = L.qrTop;
  ctx.fillStyle = "#FBF7EC";
  ctx.fillRect(bx, by, box, box);
  ctx.strokeStyle = "#DCD2BC";
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, box, box);
  if (shareView.qr) {
    const im = shareView.qr;
    const scale = Math.max(1, Math.floor((box - 48) / im.width));
    const qs = im.width * scale;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(im, Math.round(W / 2 - qs / 2), Math.round(by + box / 2 - qs / 2), qs, qs);
    ctx.imageSmoothingEnabled = true;
  } else {
    ctx.fillStyle = "#7A7166";
    ctx.font = "400 32px " + SHARE_SANS;
    ctx.textAlign = "center";
    ctx.fillText("扫码请访问 " + SITE_DOMAIN, W / 2, by + box / 2);
    ctx.textAlign = "left";
  }

  // 域名
  ctx.fillStyle = "#7A7166";
  ctx.font = "400 " + (square ? 32 : 36) + "px " + SHARE_SANS;
  drawSpacedLine(ctx, SITE_DOMAIN, W / 2, L.domain, 2);
}

/* 支持本站·收款码弹层（r18，Xu 裁定：仅支付宝单通道）。
 * 主入口＝首页底部分享行首位「支持本站」；次级入口＝关于页安静一行。同一弹层：
 * 桌面居中 #support-overlay、手机复用底部抽屉 openDrawer；卡内为收款码＋配句（一字不改）。
 * 收款码为本地资产（assets/support/alipay-qr.png），非外链，遵站点零运行时依赖红线。 */
const SUPPORT_BLESSING = "感恩支持，庭燎之光，以待君子"; // 配句一字不改，不另加任何说明文字
const supportDialog = { close: () => {}, isOpen: () => false };
function supportContentNode() {
  const wrap = document.createElement("div");
  wrap.className = "support-body";
  const img = document.createElement("img");
  img.className = "support-qr";
  img.src = "assets/support/alipay-qr.png";
  img.alt = "支付宝收款码·经纬春秋";
  img.width = 240; img.height = 240;
  const p = document.createElement("p");
  p.className = "support-blessing";
  p.textContent = SUPPORT_BLESSING;
  wrap.appendChild(img); wrap.appendChild(p);
  return wrap;
}
function initSupport() {
  const overlay = $("#support-overlay");
  const closeBtn = $("#support-close");
  if (!overlay || !closeBtn) return;
  let lastFocus = null;
  const openDesktop = () => {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("no-scroll");
    closeBtn.focus();
  };
  const closeDesktop = () => {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocus && lastFocus.isConnected) lastFocus.focus();
  };
  supportDialog.close = closeDesktop;
  supportDialog.isOpen = () => !overlay.hidden;
  const open = () => {
    if (window.matchMedia("(max-width: 680px)").matches) openDrawer("支持本站·支付宝扫一扫", supportContentNode());
    else openDesktop();
  };
  $("#btn-support").addEventListener("click", open);
  const sl = $("#support-link"); if (sl) sl.addEventListener("click", open);
  closeBtn.addEventListener("click", closeDesktop);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeDesktop(); });
  overlay.addEventListener("keydown", (e) => { if (e.key === "Tab") { e.preventDefault(); closeBtn.focus(); } });
}
function initShare() {
  const overlay = $("#share-overlay");
  const closeBtn = $("#share-close");
  let lastFocus = null;

  const hasShareAPI = typeof navigator.share === "function";
  if (hasShareAPI) {
    $("#btn-web-share").hidden = false;
    $("#btn-share-native").hidden = false;
  }

  const openShare = async () => {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("no-scroll");
    await loadShareQR();
    drawShareCard();
    closeBtn.focus();
  };
  const closeShare = () => {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocus && lastFocus.isConnected) lastFocus.focus();
  };
  shareDialog.close = closeShare;
  shareDialog.isOpen = () => !overlay.hidden;

  $("#btn-share-card").addEventListener("click", openShare);
  closeBtn.addEventListener("click", closeShare);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeShare(); });
  // 简易焦点圈定（对话框内 Tab 循环）
  overlay.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const f = overlay.querySelectorAll("button:not([hidden])");
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  document.querySelectorAll(".share-sizes button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".share-sizes button").forEach(b =>
        b.setAttribute("aria-pressed", String(b === btn)));
      const [w, h] = btn.dataset.size.split("x").map(Number);
      shareView.w = w;
      shareView.h = h;
      drawShareCard();
    });
  });

  $("#btn-share-download").addEventListener("click", () => {
    const name = "chunqiu-share-" + shareView.w + "x" + shareView.h + ".png";
    $("#share-canvas").toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showToast($("#share-toast"), "分享卡已下载");
    }, "image/png");
  });
  $("#btn-share-copy").addEventListener("click", () => copySiteLink($("#share-toast")));
  $("#btn-copy-link").addEventListener("click", () => copySiteLink($("#footer-toast")));

  const nativeShare = (withImage) => async () => {
    const data = { title: "经纬春秋", text: SHARE_COPY.invite, url: SITE_URL };
    try {
      if (withImage) {
        const blob = await new Promise(res => $("#share-canvas").toBlob(res, "image/png"));
        if (blob) {
          const file = new File([blob], "chunqiu-share.png", { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: data.title, text: data.text });
            return;
          }
        }
      }
      await navigator.share(data);
    } catch { /* 用户取消或环境受限：静默 */ }
  };
  if (hasShareAPI) {
    $("#btn-share-native").addEventListener("click", nativeShare(true));
    $("#btn-web-share").addEventListener("click", nativeShare(false));
  }
}

/* ---------- 启动 ---------- */
/* ---------- 首访三步引导（r14，Xiangtao 反馈四）：一次性 spotlight，localStorage 记忆 ----------
 * 步骤：①首页高亮齐国「点一个国，选一个人」；②文姜时间线实际展开首卡「每张卡都能点开」；
 * ③高亮人物子导航「三面看一个人」。跳过/开始探索后记 localStorage，关于页可重看。 */
const TOUR_KEY = "chunqiu_tour_v1";
const tour = { active: false, i: 0, steps: null, prevFocus: null };
function tourSeen() { try { return !!localStorage.getItem(TOUR_KEY); } catch { return true; } }
function tourMarkSeen() { try { localStorage.setItem(TOUR_KEY, "1"); } catch { /* 隐私模式：本会话内不复弹 */ } }
function tourStepDefs() {
  return [
    // 第一步强制首页地图模式（用户可能停在列表模式，此处显式归位再取位）
    { go: () => { homeMode = "map"; setHash(null, "home"); },
      find: () => document.querySelector('.home-state[data-state="齐"]'),
      label: "第一步 / 三", text: "择一国，选一人" },
    { go: () => setHash("P_WENJIANG", "timeline"),
      prep: () => { const d = $("#timeline-list").querySelector("details"); if (d) d.open = true; },
      find: () => $("#timeline-list").querySelector("details"),
      label: "第二步 / 三", text: "点每张卡，出处、可靠度均可呈现" },
    { go: () => setHash("P_WENJIANG", "timeline"),
      find: () => $("#person-nav"),
      label: "第三步 / 三", text: "时间线、地图、关系，三面看一人" },
  ];
}
function startTour() {
  tour.active = true;
  tour.i = 0;
  tour.steps = tourStepDefs();
  tour.prevFocus = document.activeElement;
  showTourStep();
}
function showTourStep() {
  const step = tour.steps[tour.i];
  step.go(); // 导航到该步视图（幂等：已在则原地 render）
  // render 或异步 hashchange 后目标才出现，rAF 轮询直至就绪
  waitForEl(step.find, () => {
    if (step.prep) step.prep();
    requestAnimationFrame(() => placeTour(step));
  });
}
/* 「已布局」＝元素存在且有真实盒（非 display:none）。目标视图仍隐藏时其子元素虽在 DOM
 * 但 getBoundingClientRect() 为 0×0，据此把「已渲染出真实位置」与「仅存在于隐藏视图」区分开。 */
function elLaidOut(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}
function waitForEl(find, cb, tries) {
  tries = tries == null ? 60 : tries;
  // 根因：切视图经 setHash→location.hash→hashchange→render 为异步，且旧视图子元素仍留在 DOM。
  // 仅判「元素存在」会命中隐藏视图里的残留元素（rect 0×0）→定位落到左上角。故须等其真正布局出盒。
  if (elLaidOut(find()) || tries <= 0) { cb(); return; }
  requestAnimationFrame(() => waitForEl(find, cb, tries - 1));
}
function placeTour(step) {
  const overlay = $("#tour");
  overlay.hidden = false;
  const last = tour.i === tour.steps.length - 1;
  $("#tour-step").textContent = step.label;
  $("#tour-text").textContent = step.text;
  $("#tour-next").textContent = last ? "开始探索" : "下一步";
  const el = step.find();
  const hole = $("#tour-hole");
  const pop = $("#tour-pop");
  if (!elLaidOut(el)) {           // 元素缺席或仍无真实盒（超时兜底）：居中显示，不落左上角
    hole.style.display = "none";
    pop.style.left = "50%"; pop.style.top = "50%"; pop.style.transform = "translate(-50%,-50%)";
    $("#tour-next").focus();
    return;
  }
  pop.style.transform = "";
  el.scrollIntoView({ block: "center", behavior: "instant" });
  requestAnimationFrame(() => { drawTourHole(el); $("#tour-next").focus(); });
}
function drawTourHole(el) {
  const r = el.getBoundingClientRect();
  const pad = 6;
  const hole = $("#tour-hole");
  hole.style.display = "block";
  hole.style.top = Math.max(2, r.top - pad) + "px";
  hole.style.left = Math.max(2, r.left - pad) + "px";
  hole.style.width = Math.min(r.width + pad * 2, window.innerWidth - 6) + "px";
  hole.style.height = (r.height + pad * 2) + "px";
  const pop = $("#tour-pop");
  const pw = pop.offsetWidth, ph = pop.offsetHeight;
  let top = r.bottom + 12;
  if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 12);
  const left = Math.min(Math.max(8, r.left), window.innerWidth - pw - 8);
  pop.style.top = Math.round(top) + "px";
  pop.style.left = Math.round(left) + "px";
}
function tourNext() {
  if (!tour.active) return;
  if (tour.i >= tour.steps.length - 1) { endTour(); return; }
  tour.i++;
  showTourStep();
}
function endTour() {
  tour.active = false;
  $("#tour").hidden = true;
  tourMarkSeen();
  // 完成或跳过后一律返回首页默认态（清人物语境，收起子导航），并轻提示「选一个人开始」。
  // 重看引导（关于页入口）走同一路径，落点一致。
  personCtx = null;
  setHash(null, "home");
  showEndTip();
}
/* 收尾轻提示：底部居中安静一行，约 3.4 秒后淡出（role=status 供读屏播报） */
function showEndTip() {
  const tip = $("#tour-endtip");
  if (!tip) return;
  tip.hidden = false;
  requestAnimationFrame(() => tip.classList.add("show"));
  clearTimeout(tip._timer);
  tip._timer = setTimeout(() => {
    tip.classList.remove("show");
    setTimeout(() => { if (!tip.classList.contains("show")) tip.hidden = true; }, 320);
  }, 3400);
}
function repositionTour() {
  if (!tour.active) return;
  const step = tour.steps[tour.i];
  const el = step && step.find();
  if (el) drawTourHole(el);
}

async function boot() {
  try { localStorage.removeItem("cq_play_speed"); } catch { /* r18 速度定稿：清理旧速度档记忆键 */ }
  const names = ["people", "events", "event_people", "places", "passages", "sources",
                 "background", "archaeology", "relations", "meta"];
  const results = await Promise.all(names.map(fetchJSON));
  names.forEach((n, i) => { DATA[n] = results[i]; });
  PEOPLE = byId(DATA.people);
  PLACES = byId(DATA.places);
  SOURCES = byId(DATA.sources);
  EVENTS = byId(DATA.events);
  resolveProtoColors(); // 国色制：按人物所属国从 styles.css :root 读入国色（须在 PEOPLE 赋值之后）
  const mapResp = await fetch("assets/map/base_map.svg");
  baseMapText = await mapResp.text();

  document.querySelectorAll(".main-nav button").forEach(btn => {
    btn.addEventListener("click", () => {
      const v = btn.dataset.view;
      if (v === "relations") setHash(personCtx, "relations"); // 已选人→其 ego 图，未选人→全景
      else if (v === "chronicle") setHash(null, "chronicle");  // 编年是全局视图，不带人物语境
      else if (v === "library") setHash(null, "library", state.tab, state.q);
      else if (v === "about") setHash(null, "about");
      else setHash(null, "home");
    });
  });
  // 首页 地图/列表 模式切换：记忆走 hash（#/?home=list），不用 Web Storage
  $("#home-mode-toggle").addEventListener("click", () => {
    homeMode = homeMode === "list" ? "map" : "list";
    setHash(null, "home");
  });
  // 人物子导航：时间线 | 地图 | 关系 | ✕ 换人
  document.querySelectorAll("#person-nav button[data-pview]").forEach(btn => {
    btn.addEventListener("click", () => { if (personCtx) setHash(personCtx, btn.dataset.pview); });
  });
  $("#pn-exit").addEventListener("click", () => {
    personCtx = null; // 清人物语境，回选人页
    setHash(null, "home");
  });
  // 编年「清除筛选」：两组 chips 一并归零（筛选是内存浏览态，不入 hash——分享链接一律给全表）
  $("#chron-clear").addEventListener("click", () => {
    chronView.states.clear();
    chronView.cats.clear();
    renderChronicle();
  });
  document.querySelectorAll(".lib-tabs button").forEach(btn => {
    btn.addEventListener("click", () => setHash(null, "library", btn.dataset.tab, state.q));
  });
  $("#lib-search").addEventListener("input", (e) => {
    state.q = e.target.value;
    history.replaceState(null, "", buildHash(null, "library", state.tab, state.q));
    renderLibList();
  });
  $("#home-library-entry").addEventListener("click", () => setHash(null, "library", state.tab, state.q));
  // 全景入口：人数动态注入（R13 + 规模数字动态化）
  $("#home-relations-entry").textContent = "全景关系图谱 · " + DATA.meta.tables.people + " 人 →";
  $("#home-relations-entry").addEventListener("click", () => setHash(null, "relations")); // 该入口明确指向全景
  $("#home-about-entry").addEventListener("click", () => setHash(null, "about"));
  $("#home-guide-entry").addEventListener("click", () => { // 关于页「初识春秋」小节
    const go = () => { const s = $("#guide-start"); if (s) s.scrollIntoView({ block: "start" }); };
    if (state.view === "about") { go(); return; }
    window.addEventListener("hashchange", () => requestAnimationFrame(go), { once: true });
    setHash(null, "about");
  });
  $("#timeline-relations-entry").addEventListener("click", () => setHash(state.person, "relations"));
  // 关系图工具条
  $("#btn-rel-back").addEventListener("click", () => {
    if (relView.stack.length) {
      relView.center = relView.stack.pop();
      relView.mode = "ego";
      drawRel();
    }
  });
  $("#btn-rel-mode").addEventListener("click", () => {
    if (relView.mode === "ego") relView.mode = "pano";
    else {
      if (!relView.center) {
        const m = PROTAGONISTS.find(mm => mm.id === state.person) ||
                  PROTAGONISTS.find(mm => PEOPLE[mm.id]);
        relView.center = m ? m.id : null;
      }
      relView.mode = relView.center ? "ego" : "pano";
    }
    drawRel();
  });
  $("#rel-proto-only").addEventListener("change", (e) => {
    relView.protoOnly = e.target.checked;
    if (relView.mode === "pano") drawRel();
  });
  /* 「显示全部」：主角环 ⇄ 全库全环（r24a-2 裁定 ②b）。
   * 切换后焦点若已不在环上，drawPanoGraph 末尾的 nodes.has(focus) 判断会自动回落到无焦点态。 */
  $("#rel-show-all").addEventListener("change", (e) => {
    relView.showAll = e.target.checked;
    if (relView.mode === "pano") drawRel();
  });
  $("#btn-rel-zoom").addEventListener("click", openRelOverlay);
  $("#btn-overlay-close").addEventListener("click", closeOverlay);
  // 并观入口「＋ 添加对照人物」：单人地图与并观两视图各一份，开关式（r24a 裁定 1b）
  initComparePicker("#btn-compare", "#compare-pick");
  initComparePicker("#cmp-btn-compare", "#cmp-compare-pick");
  $("#home-compare-link").addEventListener("click", () => goCompare("P_WENJIANG", "P_QIXIANG"));
  $("#cmp-sheet-toggle").addEventListener("click", () => {
    const on = document.body.classList.toggle("cmp-sheet-open");
    $("#cmp-sheet-toggle").setAttribute("aria-expanded", String(on));
    $("#cmp-sheet-toggle").textContent = on ? "收起交会 ▼" : "交会一览 ▲";
  });
  // 抽屉：X / 点外区域 / 下滑手势 / ESC
  $("#drawer-close").addEventListener("click", closeDrawer);
  $("#drawer-backdrop").addEventListener("click", closeDrawer);
  const grip = $("#place-drawer");
  grip.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".drawer-content")) return; // 内容区滚动优先
    drawer.dragY = e.clientY;
  });
  grip.addEventListener("pointermove", (e) => {
    if (drawer.dragY == null) return;
    const dy = e.clientY - drawer.dragY;
    grip.style.transform = dy > 0 ? "translateY(" + dy + "px)" : "";
  });
  const endDrag = (e) => {
    if (drawer.dragY == null) return;
    const dy = e.clientY - drawer.dragY;
    drawer.dragY = null;
    grip.style.transform = "";
    if (dy > 60) closeDrawer();
  };
  grip.addEventListener("pointerup", endDrag);
  grip.addEventListener("pointercancel", endDrag);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (tour.active) { endTour(); return; }        // 引导优先：Esc 跳过
      if (supportDialog.isOpen()) supportDialog.close();
      else if (shareDialog.isOpen()) shareDialog.close();
      else if (drawer.open) closeDrawer();
      else if (mapState.overlay || relZoom.active || cmpZoom.active) closeOverlay();
      return;
    }
    // 引导蒙层焦点圈定：Tab 在 跳过/下一步 间循环（Enter 由聚焦按钮原生触发→下一步）
    if (tour.active && e.key === "Tab") {
      const f = [$("#tour-skip"), $("#tour-next")];
      const idx = f.indexOf(document.activeElement);
      e.preventDefault();
      const to = e.shiftKey ? (idx <= 0 ? f.length - 1 : idx - 1) : (idx >= f.length - 1 ? 0 : idx + 1);
      f[to].focus();
    }
  });
  // 首访引导：按钮 + 关于页重看入口 + 视口变化时重定位高亮孔
  $("#tour-next").addEventListener("click", tourNext);
  $("#tour-skip").addEventListener("click", endTour);
  $("#tour-replay").addEventListener("click", () => {
    try { localStorage.removeItem(TOUR_KEY); } catch { /* 隐私模式 */ }
    startTour();
  });
  window.addEventListener("resize", repositionTour);
  window.addEventListener("scroll", () => { hideCardPop(); repositionTour(); }, { passive: true });
  // 自管滚动复位：关掉浏览器自动 restoration（其异步补回旧位置正是「切视图不回顶」的 bug 源）
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  // popstate 先于 hashchange 派发：标记本次 render 为历史回溯，按 scrollMem 恢复
  window.addEventListener("popstate", () => { navByPop = true; });
  window.addEventListener("hashchange", render);

  initSearch();
  initShare();
  initSupport();

  const m = DATA.meta;
  $("#footer-stats").textContent =
    "数据 " + m.generated_at + " 生成 · 事件 " + m.tables.events + " · 人物 " + m.tables.people +
    " · 地点 " + m.tables.places + " · 摘录 " + m.tables.passages +
    " · 背景 " + m.tables.background + " · 考古 " + m.tables.archaeology +
    " · 年代 " + yearLabel(m.year_range_bce.min) + "—" + yearLabel(m.year_range_bce.max);
  // 头部时间双标·进度标（考订前沿）：取 year_range_bce.max 经 yearLabel() 格式化，HTML 内不写死。
  // 「春秋 · 前770—前476」为纪年时段定义（静态），此处只注入随数据推进的「已考订至前XXX」。
  $("#site-frontier").textContent = "已考订至" + yearLabel(m.year_range_bce.max);
  /* 页脚品牌语的人数：取「实际可进者」而非数据侧主角数，见 protoRoster() 注释。
   * 两侧一致时二者本就相等（现 29＝29）；不一致时本行只肯报小的那个，多的由 warn 报账。 */
  const roster = protoRoster();
  $("#brand-caption").textContent = "分享给同好——" + roster.enterable.length + " 条人物线，择一而入。";
  render();
  // 首访三步引导：仅首次、且落在首页视图（深链入站者不打扰）
  if (!tourSeen() && state.view === "home") startTour();
}
// 浏览器内自启动；Node（无 document，供 tools/test_binguan_play.js 脱离浏览器驱动引擎）不自启
if (typeof document !== "undefined" && typeof document.querySelector === "function") {
  boot().catch(err => {
    $("#footer-stats").textContent = "加载失败：" + err.message + "（请经 http 访问并确认已运行 tools/csv_to_json.py）";
  });
}

/* 测试钩子（r17b）：仅 Node 下暴露引擎与映射，供 tools/test_binguan_play.js 用合成 Δt 驱动状态机、
 * 断言交会锚触发帧两标记确在交会地。不影响浏览器运行（浏览器无 module）。 */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    loadData(d) { Object.assign(DATA, d); PEOPLE = byId(d.people); PLACES = byId(d.places);
      SOURCES = byId(d.sources); EVENTS = byId(d.events); },
    project, buildTraj, detectMeetings, cmpComputeModel, cmpBuildSyncs, cmpBuildWaypoints,
    cmpPositionAt, cmpClockYearAt, comparePlayCfg, playerFrame, playerStart, playerStop,
    cmp, player, PLACESref: () => PLACES,
  };
}
