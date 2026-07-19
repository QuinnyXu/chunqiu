/* 春秋人物志 · 四屏原型（原生 JS，无外部依赖）
 * 史料文本一律来自 site/data/*.json；本文件只含界面文案与设计配置。 */
"use strict";

/* ---------- 设计配置（见 docs/design/design_notes.md） ---------- */
/* 顺序即选人页分区内顺序；分组按 people.state 首国自动生成，新国加入只增分区。
 * home：分区归属覆盖项（武姜 state「申/郑」，人物线全在郑，归郑分区，卡上仍标流向） */
const PROTAGONISTS = [
  { id: "P_WENJIANG",    color: "#B23A2F", badge: "badge_wenjiang",    fallback: "文姜" },
  { id: "P_QIXIANG",     color: "#35302A", badge: "badge_qixiang",     fallback: "齐襄公" },
  { id: "P_QIHUAN",      color: "#8A6D1F", badge: "badge_qihuan",      fallback: "齐桓公" },
  { id: "P_QIXI",        color: "#2D6470", badge: "badge_qixi",        fallback: "齐僖公" },
  { id: "P_LUYIN",       color: "#56707E", badge: "badge_luyin",       fallback: "鲁隐公" },
  { id: "P_LUHUAN",      color: "#A9622B", badge: "badge_luhuan",      fallback: "鲁桓公" },
  { id: "P_LUZHUANG",    color: "#55603A", badge: "badge_luzhuang",    fallback: "鲁庄公" },
  { id: "P_ZHENGZHUANG", color: "#5C4632", badge: "badge_zhengzhuang", fallback: "郑庄公" },
  { id: "P_ZHENGZHAO",   color: "#3F7A6C", badge: "badge_zhengzhao",   fallback: "郑昭公" },
  { id: "P_WUJIANG",     color: "#5E4B6B", badge: "badge_wujiang",     fallback: "武姜", home: "郑" },
  { id: "P_JIZHONG",     color: "#3D4C63", badge: "badge_jizhong",     fallback: "祭仲" },
  { id: "P_JINWEN",      color: "#8C3041", badge: "badge_jinwen",      fallback: "晋文公" },
];
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
};
/* 首页地图（r12，docs/design/home_map_notes.md）：徽记簇簇心（底图坐标系）。
 * 属美术布局锚点，非史料落点——史料地点一律走 conventions 投影公式 */
const HOME_BADGE_POS = { "齐": [818, 232], "鲁": [700, 354], "郑": [400, 424], "晋": [172, 328] };
const HOME_PENDING = "人物线整理中";
const HOME_PENDING_HINT = "先看看有主角的国家——齐、鲁、郑、晋。";
const CAT_ICON = {
  "即位": "jiwei", "战争": "zhanzheng", "会盟": "huimeng", "相会": "xianghui",
  "婚嫁": "hunjia", "生育": "shengyu", "出奔": "chuben", "弑杀": "shisha",
  "薨卒": "hongzu", "丧葬": "sangzang", "外交": "waijiao", "内乱": "neiluan",
  "灾异": "zaiyi", "礼俗": "lisu", "其他": "qita",
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
const SRC_PREFIX = { Z: "左传", S: "史记", G: "国语", P: "诗经", A: "考古", B: "现代研究" };
const MAP_W = 1200, MAP_H = 700;

/* ---------- 投影（docs/conventions.md 第4节） ---------- */
function project(lng, lat) {
  return [(lng - 110.0) / 12.0 * MAP_W, MAP_H - (lat - 32.0) / 6.5 * MAP_H];
}
console.assert(Math.round(project(118.31, 36.83)[0]) === 831 &&
               Math.round(project(118.31, 36.83)[1]) === 180, "投影校验失败：临淄");

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
 *   #/library[/<tab>][?q=…]   资料库
 *   #/about                   关于
 * 旧格式（#person=X&view=…）由 legacyToNewHash 就地改写重定向，外部旧链接不失效。 */
const PERSON_VIEWS = ["timeline", "map", "relations"];
const LIB_TABS = ["background", "archaeology", "sources"];

function legacyToNewHash(h) {
  const o = {};
  for (const kv of h.split("&")) {
    const [k, v] = kv.split("=");
    if (k && v !== undefined) o[k] = v;
  }
  const person = PROTAGONISTS.some(p => p.id === o.person) ? o.person : null;
  let view = ["home", "timeline", "map", "library", "relations", "about"].includes(o.view) ? o.view : null;
  if (person && (!view || view === "home")) view = "timeline"; // 旧 #person=X 落其时间线
  if (person && PERSON_VIEWS.includes(view)) return buildHash(person, view);
  // 库/关于/全景等全局视图：旧链接中的 person 语境不再入 hash
  if (view === "library") {
    let q = "";
    if (o.q) { try { q = decodeURIComponent(o.q); } catch { q = o.q; } }
    return buildHash(null, "library", LIB_TABS.includes(o.tab) ? o.tab : "background", q);
  }
  if (view === "relations" || view === "about") return buildHash(null, view);
  return "#/";
}

function parseHash() {
  let raw = location.hash.replace(/^#/, "");
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
  if (segs[0] === "relations" || segs[0] === "about") { st.view = segs[0]; return st; }
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
  if (view === "relations" || view === "about") return "#/" + view;
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

function render() {
  state = parseHash();
  if (state.view === "home") homeMode = state.home;
  if (state.person) personCtx = state.person;
  if (pendingSpot && pendingSpot.view !== state.view) pendingSpot = null;
  closeOverlay();
  closeDrawer();
  const ctxMeta = PROTAGONISTS.find(p => p.id === personCtx);
  document.documentElement.style.setProperty("--theme", ctxMeta ? ctxMeta.color : "#B4652F");

  renderPersonNav(ctxMeta);
  // 主导航高亮：人物视图（时间线/地图）由子导航高亮，主导航不标当前；
  // 关系视图无论 ego/全景皆归「关系」。
  const navCur = state.person && state.view !== "relations" ? null : state.view;
  document.querySelectorAll(".main-nav button").forEach(btn => {
    btn.setAttribute("aria-current", String(btn.dataset.view === navCur));
  });
  for (const v of ["home", "timeline", "map", "library", "relations", "about"]) {
    $("#view-" + v).hidden = (state.view !== v);
  }
  $("#timeline-relations-entry").hidden = !state.person;
  stopPlayback();
  if (state.view === "home") renderHome();
  if (state.view === "timeline") renderTimeline();
  if (state.view === "map") renderMap();
  if (state.view === "library") renderLibrary();
  if (state.view === "relations") renderRelations();
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
function buildHomeMap() {
  const box = $("#home-map");
  box.innerHTML = baseMapText;
  const svg = box.querySelector("svg");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  svg.setAttribute("aria-label", "春秋列国示意图：点国入其人物线");

  // 海报化：色块饱和提一档、国名放大加深（人物地图用原参数，两处共用同一底图文件）
  const states = svg.querySelector("#layer-states");
  if (states) states.setAttribute("fill-opacity", "0.5");
  svg.querySelectorAll("#layer-labels text[data-state]").forEach(t => {
    t.setAttribute("font-size", "26");
    t.setAttribute("fill", "#4E4338");
  });

  // 每国热区：色块椭圆外扩 18；hover/focus/选中显暖赭虚线环；Tab 可达、Enter/空格触发
  const hotLayer = document.createElementNS(NS, "g");
  svg.appendChild(hotLayer);
  svg.querySelectorAll("#layer-states ellipse[data-state]").forEach(el => {
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
    const geo = ["cx", "cy"].map(a => el.getAttribute(a));
    const mk = (cls, dr) => {
      const e = document.createElementNS(NS, "ellipse");
      e.setAttribute("class", cls);
      e.setAttribute("cx", geo[0]); e.setAttribute("cy", geo[1]);
      e.setAttribute("rx", parseFloat(el.getAttribute("rx")) + dr);
      e.setAttribute("ry", parseFloat(el.getAttribute("ry")) + dr);
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

  // 主角徽记簇：主题色圆底＋白线徽记，一行排布于簇心（HOME_BADGE_POS，美术布局锚点）
  const BADGE_R = 13.5, BADGE_GAP = 31;
  const clusterLayer = document.createElementNS(NS, "g");
  clusterLayer.setAttribute("aria-hidden", "true"); // 与热区同义，读屏只走热区
  svg.appendChild(clusterLayer);
  for (const [st, metas] of homeGroups) {
    const pos = HOME_BADGE_POS[st];
    if (!pos) continue;
    const cl = document.createElementNS(NS, "g");
    cl.setAttribute("class", "home-cluster");
    const x0 = pos[0] - ((metas.length - 1) * BADGE_GAP) / 2;
    metas.forEach((meta, i) => {
      const cx = x0 + i * BADGE_GAP;
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", cx); c.setAttribute("cy", pos[1]); c.setAttribute("r", BADGE_R);
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
        b.setAttribute("x", cx - 9); b.setAttribute("y", pos[1] - 9);
        b.setAttribute("width", 18); b.setAttribute("height", 18);
        b.style.color = "#FBF7EC";
        b.style.pointerEvents = "none";
        cl.appendChild(b);
      });
    });
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
  // 跨国人物标注流向（state 如「齐/鲁」→「齐→鲁」）
  if (ready && (person.state || "").includes("/")) {
    const flow = document.createElement("span");
    flow.className = "flow-chip";
    flow.textContent = person.state.split("/").join("→");
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
  }
  li.appendChild(card);
  return li;
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
    det.className = "event" + (evt.importance === 1 ? " major" : "");
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
    det.appendChild(sum);

    const body = document.createElement("div");
    body.className = "event-body";

    const chips = document.createElement("div");
    chips.className = "meta-chips";
    const place = evt.place_id ? PLACES[evt.place_id] : null;
    if (place) addChip(chips, "地点 · " + place.ancient_name, "");
    if (evt.category) addChip(chips, evt.category, "");
    if (evt.reliability) addChip(chips, REL_LABEL[evt.reliability] || evt.reliability, "rel-" + evt.reliability);
    if (evt.importance) addChip(chips, "重要度 " + evt.importance, "");
    addChip(chips, evt.presence, evt.presence === "相关" ? "rel-low" : "rel-high");
    body.appendChild(chips);

    const sm = document.createElement("p");
    sm.textContent = evt.summary || "";
    sm.style.margin = "0";
    body.appendChild(sm);

    for (const q of DATA.passages.filter(p => p.event_id === evt.id)) {
      const bq = document.createElement("blockquote");
      bq.className = "quote";
      bq.dataset.qid = q.id;
      const qp = document.createElement("p");
      qp.textContent = q.quote_original;
      bq.appendChild(qp);
      const ft = document.createElement("footer");
      const src = SOURCES[q.source_id];
      ft.textContent = "—— " + (src ? src.title : q.source_id) +
        (q.quote_type ? "（" + q.quote_type + "）" : "") +
        (q.modern_note ? " · " + q.modern_note : "");
      bq.appendChild(ft);
      body.appendChild(bq);
    }
    det.appendChild(body);
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
  requestAnimationFrame(() => {
    target.scrollIntoView({ block: "center", behavior: "smooth" });
    const sum = det.querySelector("summary");
    if (sum) sum.focus({ preventScroll: true });
  });
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
      g.setAttribute("aria-label", pl.ancient_name + "（相关地点，本人不在场）");
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
      if (play.raf) return; // 播放期间不展开卡片/抽屉，画面聚焦地图；暂停或播完后恢复
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

  $("#map-status").textContent = traj.length
    ? "亲至轨迹共 " + traj.length + " 站，" + yearLabel(traj[0].events[0].year_bce) + " 起。"
    : "该人物暂无可落图的亲至地点。";
  const btn = $("#btn-play");
  btn.disabled = traj.length < 2;
  btn.onclick = () => togglePlayback(traj, anchors, theme);

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
  $("#map-overlay-body").appendChild($("#play-caption")); // 字幕条随地图入全屏
  mapState.overlay = true;
  document.body.classList.add("no-scroll");
  $("#btn-overlay-close").focus();
}
function closeOverlay() {
  if (relZoom.active) { closeRelOverlay(); return; }
  if (!mapState.overlay) return;
  const overlay = $("#map-overlay");
  overlay.hidden = true;
  document.body.classList.remove("no-scroll");
  if (mapState.svg) $("#map-canvas").appendChild(mapState.svg);
  const frame = document.querySelector(".map-frame");
  if (frame) frame.appendChild($("#play-caption")); // 字幕条归位内嵌地图
  mapState.overlay = false;
  mapState.pointers.clear();
  mapState.pinch = null;
  mapState.panStart = null;
  applyView(mapState.mode === "fit" ? mapState.fitBox : { x: 0, y: 0, w: MAP_W, h: MAP_H });
}

/* ---------- 关系图「放大查看」：复用地图全屏浮层与手势机制（r13，Xiangtao 反馈 4）。
 * 关系图内嵌态为纯静态、不拦截页面滚动；细看时把当前图克隆入全屏浮层，拖移/滚轮/双指缩放皆与地图一致。
 * 克隆而非移动：内嵌图保持原位与其 recenter/看连线交互不受影响，全屏态只做取景细看。 ---------- */
const relZoom = {
  active: false, svg: null, vbW: 0, vbH: 0, minFrac: 0.2, box: null,
  pointers: new Map(), pinch: null, panStart: null, panDist: 0,
};
function zClamp(box, vbW, vbH, minFrac) {
  const w = Math.max(vbW * minFrac, Math.min(box.w, vbW));
  const h = w * vbH / vbW;
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
      const h = w * Z.vbH / Z.vbW;
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const x = Z.pinch.mid[0] - (mid.x - rect.left) / rect.width * w;
      const y = Z.pinch.mid[1] - (mid.y - rect.top) / rect.height * h;
      Z.panDist = 99;
      apply(zClamp({ x, y, w, h }, Z.vbW, Z.vbH, Z.minFrac));
    } else if (Z.panStart) {
      const dx = e.clientX - Z.panStart.x, dy = e.clientY - Z.panStart.y;
      Z.panDist = Math.max(Z.panDist, Math.hypot(dx, dy));
      const b = Z.panStart.box;
      apply(zClamp({ x: b.x - dx / rect.width * b.w, y: b.y - dy / rect.height * b.h, w: b.w, h: b.h },
        Z.vbW, Z.vbH, Z.minFrac));
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
    const h = w * Z.vbH / Z.vbW;
    const [sx, sy] = zSvgPoint(svg, Z.box, e.clientX, e.clientY);
    const rect = svg.getBoundingClientRect();
    const x = sx - (e.clientX - rect.left) / rect.width * w;
    const y = sy - (e.clientY - rect.top) / rect.height * h;
    apply(zClamp({ x, y, w, h }, Z.vbW, Z.vbH, Z.minFrac));
  }, { passive: false });
}
function openRelOverlay() {
  const src = $("#rel-canvas").querySelector("svg");
  if (!src) return;
  const vb = (src.getAttribute("viewBox") || "0 0 1000 680").split(/\s+/).map(Number);
  const clone = src.cloneNode(true);
  const overlay = $("#map-overlay");
  overlay.setAttribute("aria-label", "关系图全屏查看");
  $("#map-overlay-hint").textContent = "拖移平移 · 滚轮/双指缩放 · 连线悬停见关系名";
  const body = $("#map-overlay-body");
  body.textContent = "";
  body.appendChild(clone);
  overlay.hidden = false; // 先显示再量 bbox（display:none 下 getBBox 归零）
  document.body.classList.add("no-scroll");
  relZoom.active = true;
  relZoom.svg = clone;
  relZoom.vbW = vb[2] || 1000;
  relZoom.vbH = vb[3] || 680;
  relZoom.minFrac = 0.2;
  relZoom.pointers = new Map();
  relZoom.pinch = null;
  relZoom.panStart = null;
  relZoom.panDist = 0;
  // 初始取景：框到图形内容外接框（留白 10%），空白多的 ego 图开屏即见图而非全 viewBox 缩得极小
  let box = { x: vb[0] || 0, y: vb[1] || 0, w: relZoom.vbW, h: relZoom.vbH };
  try {
    const bb = clone.getBBox();
    if (bb.width > 1 && bb.height > 1) {
      const w = Math.min(relZoom.vbW, Math.max(bb.width, bb.height * relZoom.vbW / relZoom.vbH) * 1.1);
      const h = w * relZoom.vbH / relZoom.vbW;
      box = zClamp({ x: bb.x + bb.width / 2 - w / 2, y: bb.y + bb.height / 2 - h / 2, w, h },
        relZoom.vbW, relZoom.vbH, relZoom.minFrac);
    }
  } catch { /* getBBox 不可用则用全 viewBox */ }
  relZoom.box = box;
  clone.setAttribute("viewBox", box.x + " " + box.y + " " + box.w + " " + box.h);
  bindZoomGesture(clone, relZoom);
  $("#btn-overlay-close").focus();
}
function closeRelOverlay() {
  const overlay = $("#map-overlay");
  overlay.hidden = true;
  overlay.setAttribute("aria-label", "地图全屏查看");
  $("#map-overlay-hint").textContent = "拖移平移 · 滚轮/双指缩放 · 点击地点看详情";
  document.body.classList.remove("no-scroll");
  $("#map-overlay-body").textContent = "";
  relZoom.active = false;
  relZoom.svg = null;
  relZoom.pointers.clear();
  relZoom.pinch = null;
  relZoom.panStart = null;
}

/* ---------- 轨迹播放：分段缓动，全程≤8秒，可暂停 ----------
 * 播放期间画面聚焦地图：到站信息走地图内字幕条（#play-caption，aria-live=polite），
 * 不展开下方卡片/抽屉、不滚动页面；暂停或播完后字幕淡出，点击站点恢复正常展开。 */
const play = { raf: null, paused: false, startTs: 0, elapsed: 0, traj: null,
               marker: null, segs: null, dur: 0, lastStation: -1 };
const easeInOut = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

function showCaption(text) {
  const c = $("#play-caption");
  c.textContent = text;
  c.hidden = false;
  requestAnimationFrame(() => c.classList.add("show"));
}
function hideCaption(immediate) {
  const c = $("#play-caption");
  if (!c) return;
  c.classList.remove("show");
  if (immediate) { c.hidden = true; c.textContent = ""; }
  else setTimeout(() => { if (!c.classList.contains("show")) c.hidden = true; }, 300);
}
function captionText(idx) {
  const t = play.traj[idx];
  return "第" + (idx + 1) + "/" + play.traj.length + "站 " + t.placeNames.join("/") +
    " · " + yearLabel(t.events[0].year_bce) +
    " · " + t.events.map(e => e.title).join("；");
}

function togglePlayback(traj, anchors, theme) {
  const btn = $("#btn-play");
  if (play.raf) { // 播放中 → 暂停
    cancelAnimationFrame(play.raf);
    play.raf = null;
    play.paused = true;
    btn.textContent = "▶ 继续播放";
    hideCaption();
    return;
  }
  if (play.paused && play.marker) { // 续播
    play.paused = false;
    play.startTs = performance.now() - play.elapsed;
    btn.textContent = "⏸ 暂停";
    if (play.lastStation >= 0) showCaption(captionText(play.lastStation));
    play.raf = requestAnimationFrame(stepPlayback);
    return;
  }
  if (traj.length < 2) return;
  const NS = "http://www.w3.org/2000/svg";
  let marker = anchors.querySelector("#play-marker");
  if (!marker) {
    marker = document.createElementNS(NS, "circle");
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
  // 分段：按段长分配时长，零长段时长为 0（同点聚合已在建轨时完成，此处双保险）
  const lens = [];
  let total = 0;
  for (let i = 1; i < traj.length; i++) {
    const L = Math.hypot(traj[i].x - traj[i - 1].x, traj[i].y - traj[i - 1].y);
    lens.push(L);
    total += L;
  }
  const dur = Math.max(2000, Math.min(8000, 1200 * (traj.length - 1)));
  const segs = [];
  let t0 = 0;
  for (const L of lens) {
    const d = total > 0 ? dur * (L / total) : 0;
    segs.push({ start: t0, dur: d });
    t0 += d;
  }
  play.traj = traj;
  play.marker = marker;
  play.segs = segs;
  play.dur = total > 0 ? dur : 0;
  play.elapsed = 0;
  play.lastStation = -1;
  play.paused = false;
  play.startTs = performance.now();
  marker.removeAttribute("hidden");
  btn.textContent = "⏸ 暂停";
  if (play.dur === 0) { // 全部同点：直接宣告最后一站并归位
    announceStation(traj.length - 1);
    finishPlayback();
    return;
  }
  announceStation(0);
  play.raf = requestAnimationFrame(stepPlayback);
}
function stepPlayback(ts) {
  play.elapsed = Math.min(ts - play.startTs, play.dur);
  const { traj, segs } = play;
  let i = segs.length - 1;
  for (let s = 0; s < segs.length; s++) {
    if (play.elapsed < segs[s].start + segs[s].dur) { i = s; break; }
  }
  const seg = segs[i];
  const u = seg.dur > 0 ? Math.min((play.elapsed - seg.start) / seg.dur, 1) : 1;
  const e = easeInOut(u);
  const x = traj[i].x + (traj[i + 1].x - traj[i].x) * e;
  const y = traj[i].y + (traj[i + 1].y - traj[i].y) * e;
  play.marker.setAttribute("cx", x);
  play.marker.setAttribute("cy", y);
  const arrived = (u >= 1) ? i + 1 : i;
  if (arrived !== play.lastStation) announceStation(arrived);
  if (play.elapsed >= play.dur) { finishPlayback(); return; }
  play.raf = requestAnimationFrame(stepPlayback);
}
function announceStation(idx) {
  play.lastStation = idx;
  // 到站信息只走地图内字幕条：不开卡片/抽屉、不滚动页面（内嵌与全屏同规则）
  showCaption(captionText(idx));
}
function finishPlayback() {
  if (play.raf) cancelAnimationFrame(play.raf);
  play.raf = null;
  play.paused = false;
  hideCaption();
  if (play.traj && play.marker) { // 归位：停在末站，按钮复位可重播
    const last = play.traj[play.traj.length - 1];
    play.marker.setAttribute("cx", last.x);
    play.marker.setAttribute("cy", last.y);
  }
  play.marker = null;
  const btn = $("#btn-play");
  if (btn) btn.textContent = "▶ 轨迹按时间播放";
}
function stopPlayback() {
  if (play.raf) cancelAnimationFrame(play.raf);
  play.raf = null;
  play.paused = false;
  play.marker = null;
  play.traj = null;
  hideCaption(true);
  const btn = $("#btn-play");
  if (btn) btn.textContent = "▶ 轨迹按时间播放";
  const marker = document.querySelector("#play-marker");
  if (marker) marker.setAttribute("hidden", "");
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
    b.addEventListener("click", () => showLibDetail(r, b));
    li.appendChild(b);
    list.appendChild(li);
  }
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
const STATE_ORDER = ["齐", "鲁", "郑", "晋", "周", "卫", "楚", "秦", "曹", "许", "申", "宋"];
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
  nodes: new Map(), edges: [], focus: null, isolated: new Set(), // 全景态
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
  $("#rel-filter-label").hidden = ego;
  const modeBtn = $("#btn-rel-mode");
  modeBtn.textContent = ego ? "全景 " + DATA.people.length + " 人" : "◎ 以人为中心";
  modeBtn.setAttribute("aria-pressed", String(!ego));
  const crumbs = $("#rel-crumbs");
  crumbs.textContent = "";
  if (!ego) {
    const s = document.createElement("span");
    s.className = "crumb-cur";
    // 关系计数随「仅主角边」过滤动态变化（口径与绘图一致：两端皆在库中）
    const nEdges = DATA.relations.filter(r =>
      PEOPLE[r.person_a] && PEOPLE[r.person_b] &&
      (!relView.protoOnly || isProto(r.person_a) || isProto(r.person_b))).length;
    s.textContent = "全景 · " + DATA.people.length + " 人 · " + nEdges + " 条关系" +
      (relView.protoOnly ? "（仅主角边）" : "");
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
    const open = () => showRelDetail(pair.rels, null);
    path.addEventListener("click", open);
    edgeLayer.appendChild(path);
    if (pair.rels.length > 1) {
      const badge = edgeBadgeEl(seg.mx, seg.my, pair.rels.length, color, open);
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

/* ----- 全景视图（分组环形布局，round6 原样保留；本轮仅加过滤器） ----- */
function drawPanoGraph() {
  const NS = "http://www.w3.org/2000/svg";
  const W = 1000, H = 680, CX = 500, CY = 330, R = 252;
  const canvas = $("#rel-canvas");
  canvas.textContent = "";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  canvas.appendChild(svg);
  const edgeLayer = document.createElementNS(NS, "g");
  const nodeLayer = document.createElementNS(NS, "g");
  svg.appendChild(edgeLayer);
  svg.appendChild(nodeLayer);

  const people = [...DATA.people].sort((a, b) => {
    const sa = STATE_ORDER.indexOf((a.state || "").split("/")[0]);
    const sb = STATE_ORDER.indexOf((b.state || "").split("/")[0]);
    return ((sa < 0 ? 99 : sa) - (sb < 0 ? 99 : sb)) ||
           ((b.is_protagonist || 0) - (a.is_protagonist || 0)) ||
           a.id.localeCompare(b.id);
  });
  relView.nodes.clear();
  people.forEach((p, i) => {
    const ang = (i / people.length) * Math.PI * 2 - Math.PI / 2;
    relView.nodes.set(p.id, {
      p, x: CX + R * Math.cos(ang), y: CY + R * Math.sin(ang), ang,
      proto: PROTAGONISTS.find(m => m.id === p.id) || null, el: null,
    });
  });

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
    const open = () => showRelDetail(pair.rels, null);
    path.addEventListener("click", open);
    edgeLayer.appendChild(path);
    let badge = null;
    if (pair.rels.length > 1) {
      badge = edgeBadgeEl(seg.mx, seg.my, pair.rels.length, color, open);
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
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", node.p.name + "：查看其关系");
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", node.x); c.setAttribute("cy", node.y);
    c.setAttribute("r", node.proto ? 15 : 8);
    c.setAttribute("fill", node.proto ? node.proto.color : "#FBF7EC");
    c.setAttribute("stroke", node.proto ? "#F4EDDF" : "#7A7166");
    c.setAttribute("stroke-width", node.proto ? 2 : 1.4);
    g.appendChild(c);
    if (node.proto) {
      fetchSVG(node.proto.badge).then(t => {
        const doc = new DOMParser().parseFromString(t, "image/svg+xml");
        const b = document.importNode(doc.documentElement, true);
        b.setAttribute("x", node.x - 10); b.setAttribute("y", node.y - 10);
        b.setAttribute("width", 20); b.setAttribute("height", 20);
        b.style.color = "#F4EDDF";
        b.style.pointerEvents = "none";
        g.appendChild(b);
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
    node.el.style.opacity = neighbors.has(node.p.id) ? "1" : "0.22";
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
    node.el.style.opacity = relView.isolated.has(node.p.id) ? "0.25" : "";
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
function showRelDetail(rels, pid) {
  rels = sortRelsByType(rels);
  const panel = $("#rel-panel");
  panel.textContent = "";
  const h3 = document.createElement("h3");
  if (pid) h3.textContent = personName(pid) + " 的一度关系（" + rels.length + "）";
  else if (rels.length > 1) h3.textContent = personName(rels[0].person_a) + " — " + personName(rels[0].person_b) +
    "（" + rels.length + " 重关系）";
  else h3.textContent = "这条关系";
  panel.appendChild(h3);
  if (pid && PEOPLE[pid]) {
    // 人物详情姓名行：完整形式（如 管仲 → 姬姓管氏，名夷吾，字仲）
    const nl = nameLineNode(PEOPLE[pid], "small");
    if (nl) panel.appendChild(nl);
  }
  if (pid && PEOPLE[pid] && PEOPLE[pid].short_bio) {
    const bio = document.createElement("p");
    bio.className = "rel-bio";
    bio.textContent = PEOPLE[pid].short_bio;
    panel.appendChild(bio);
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
  panel.appendChild(ul);
  if (!pid && rels.length > 1) {
    // 并线规则随卡注明：同对人物合并为一线，虚线含义在此交代（图例只留提示）
    const note = document.createElement("p");
    note.className = "rel-pair-note";
    note.textContent = "两人的多重关系在图上并为一线、以数字徽记标记；连线虚线表示所列关系可靠度皆为中/低，实线表示至少一条为 high。";
    panel.appendChild(note);
  }
  const acts = document.createElement("p");
  acts.className = "rel-actions";
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

/* ---------- 全站搜索（r11）：一框检索人物/地点/事件/原文，纯前端包含匹配 ----------
 * 匹配口径：小写化＋去空格的包含匹配；字段间以「|」隔断，避免跨字段误连。
 * 直达语义：人物（主角）→时间线，人物（非主角）→其 ego 关系图；地点→地图并高亮；
 * 事件→所属主角时间线定位展开；原文→事件详情内定位到引文块。 */
const searchNorm = (s) => (s || "").toLowerCase().replace(/\s+/g, "");
const SEARCH_GROUPS = [
  { key: "people", name: "人物" },
  { key: "places", name: "地点" },
  { key: "events", name: "事件" },
  { key: "passages", name: "原文" },
];
const SEARCH_LIMIT = 8; // 每组先显 8 条，「更多」展开
let SEARCH_INDEX = [];
let PLACE_PROTOS = new Map(); // place_id → 在此地有事件的主角（按主角序）
const search = { opts: [], active: -1, expanded: new Set(), timer: 0 };

const protoRank = (pid) => {
  const i = PROTAGONISTS.findIndex(m => m.id === pid);
  return i < 0 ? 99 : i;
};
/* 事件归哪位主角的时间线：当前人物语境优先，其次主角序中首个亲至者，再次任一关联主角 */
function protoForEvent(eid) {
  const links = DATA.event_people.filter(l =>
    l.event_id === eid && isProto(l.person_id) && PEOPLE[l.person_id]);
  if (!links.length) return null;
  if (personCtx && links.some(l => l.person_id === personCtx)) return personCtx;
  links.sort((a, b) => protoRank(a.person_id) - protoRank(b.person_id));
  const visit = links.find(l => (l.presence || "亲至") !== "相关");
  return (visit || links[0]).person_id;
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
  for (const e of DATA.events) {
    if (!protoForEvent(e.id)) continue; // 无主角关联的事件无时间线落点（当前库为 0 条）
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
  for (const q of DATA.passages) {
    if (!protoForEvent(q.event_id)) continue;
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
function goSearchEvent(eid, qid) {
  const pid = protoForEvent(eid);
  if (!pid) return;
  pendingSpot = qid
    ? { view: "timeline", type: "quote", eid, qid }
    : { view: "timeline", type: "event", eid };
  setHash(pid, "timeline");
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
    ? { band: 88, title: 240, titleSize: 104, ticks: 320, invite: 428, inviteSize: 40, qrTop: 500, qrBox: 380, domain: 944, bandBottom: H - 92 }
    : { band: 118, title: 330, titleSize: 122, ticks: 424, invite: 556, inviteSize: 50, qrTop: 716, qrBox: 430, domain: 1240, bandBottom: H - 156 };

  drawMeanderBand(ctx, W / 2, L.band, W * 0.5, 26, "rgba(68, 118, 107, 0.6)");
  drawMeanderBand(ctx, W / 2, L.bandBottom, W * 0.5, 26, "rgba(68, 118, 107, 0.6)");

  // 站名
  ctx.fillStyle = "#2E2A24";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "700 " + L.titleSize + "px " + SHARE_SERIF;
  drawSpacedLine(ctx, "春秋人物志", W / 2, L.title, L.titleSize * 0.16);

  // 主角主题色签一行（品牌色阶，取自 PROTAGONISTS 设计配置，数量随主角数自适应）
  const tw = 26, gap = 14;
  let tx = W / 2 - (PROTAGONISTS.length * tw + (PROTAGONISTS.length - 1) * gap) / 2;
  for (const m of PROTAGONISTS) {
    ctx.fillStyle = m.color;
    ctx.fillRect(tx, L.ticks, tw, 8);
    tx += tw + gap;
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
    const data = { title: "春秋人物志", text: SHARE_COPY.invite, url: SITE_URL };
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
async function boot() {
  const names = ["people", "events", "event_people", "places", "passages", "sources",
                 "background", "archaeology", "relations", "meta"];
  const results = await Promise.all(names.map(fetchJSON));
  names.forEach((n, i) => { DATA[n] = results[i]; });
  PEOPLE = byId(DATA.people);
  PLACES = byId(DATA.places);
  SOURCES = byId(DATA.sources);
  EVENTS = byId(DATA.events);
  const mapResp = await fetch("assets/map/base_map.svg");
  baseMapText = await mapResp.text();

  document.querySelectorAll(".main-nav button").forEach(btn => {
    btn.addEventListener("click", () => {
      const v = btn.dataset.view;
      if (v === "relations") setHash(personCtx, "relations"); // 已选人→其 ego 图，未选人→全景
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
  $("#btn-rel-zoom").addEventListener("click", openRelOverlay);
  $("#btn-overlay-close").addEventListener("click", closeOverlay);
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
    if (e.key !== "Escape") return;
    if (shareDialog.isOpen()) shareDialog.close();
    else if (drawer.open) closeDrawer();
    else if (mapState.overlay || relZoom.active) closeOverlay();
  });
  window.addEventListener("hashchange", render);

  initSearch();
  initShare();

  const m = DATA.meta;
  $("#footer-stats").textContent =
    "数据 " + m.generated_at + " 生成 · 事件 " + m.tables.events + " · 人物 " + m.tables.people +
    " · 地点 " + m.tables.places + " · 摘录 " + m.tables.passages +
    " · 背景 " + m.tables.background + " · 考古 " + m.tables.archaeology +
    " · 年代 " + yearLabel(m.year_range_bce.min) + "—" + yearLabel(m.year_range_bce.max);
  // 规模数字一律动态注入（R15、站头年代范围），HTML 内不写死
  $("#site-range").textContent = yearLabel(m.year_range_bce.min) + " — " + yearLabel(m.year_range_bce.max);
  const nLines = DATA.people.filter(p => p.is_protagonist).length;
  $("#brand-caption").textContent = "分享给同好——" + nLines + " 条人物线，择一而入。";
  render();
}
boot().catch(err => {
  $("#footer-stats").textContent = "加载失败：" + err.message + "（请经 http 访问并确认已运行 tools/csv_to_json.py）";
});
