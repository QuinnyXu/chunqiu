/* 春秋人物志 · 四屏原型（原生 JS，无外部依赖）
 * 史料文本一律来自 site/data/*.json；本文件只含界面文案与设计配置。 */
"use strict";

/* ---------- 设计配置（见 docs/design/design_notes.md） ---------- */
const PROTAGONISTS = [
  { id: "P_WENJIANG",    color: "#B23A2F", badge: "badge_wenjiang",    fallback: "文姜" },
  { id: "P_LUHUAN",      color: "#A9622B", badge: "badge_luhuan",      fallback: "鲁桓公" },
  { id: "P_QIXIANG",     color: "#35302A", badge: "badge_qixiang",     fallback: "齐襄公" },
  { id: "P_ZHENGZHAO",   color: "#3F7A6C", badge: "badge_zhengzhao",   fallback: "郑昭公" },
  { id: "P_ZHENGZHUANG", color: "#5C4632", badge: "badge_zhengzhuang", fallback: "郑庄公" },
  { id: "P_LUYIN",       color: "#56707E", badge: "badge_luyin",       fallback: "鲁隐公" },
  { id: "P_LUZHUANG",    color: "#55603A", badge: "badge_luzhuang",    fallback: "鲁庄公" },
  { id: "P_QIHUAN",      color: "#8A6D1F", badge: "badge_qihuan",      fallback: "齐桓公" },
];
const CAT_ICON = {
  "即位": "jiwei", "战争": "zhanzheng", "会盟": "huimeng", "相会": "xianghui",
  "婚嫁": "hunjia", "生育": "shengyu", "出奔": "chuben", "弑杀": "shisha",
  "薨卒": "hongzu", "丧葬": "sangzang", "外交": "waijiao", "内乱": "neiluan",
  "灾异": "zaiyi", "礼俗": "lisu", "其他": "qita",
};
const REL_LABEL = { high: "可靠性 高", medium: "可靠性 中", low: "可靠性 低" };
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

/* ---------- 状态（URL hash 即状态） ---------- */
function parseHash() {
  const st = { view: "home", person: null, tab: "background", q: "" };
  const h = location.hash.replace(/^#/, "");
  for (const kv of h.split("&")) {
    const [k, v] = kv.split("=");
    if (k === "view" && ["home", "timeline", "map", "library", "relations", "about"].includes(v)) st.view = v;
    if (k === "person" && PROTAGONISTS.some(p => p.id === v)) st.person = v;
    if (k === "tab" && ["background", "archaeology", "sources"].includes(v)) st.tab = v;
    if (k === "q" && v) { try { st.q = decodeURIComponent(v); } catch { st.q = v; } }
  }
  if ((st.view === "timeline" || st.view === "map") && !st.person) st.view = "home";
  return st;
}
function buildHash(person, view, tab, q) {
  const parts = [];
  if (person) parts.push("person=" + person);
  if (view && view !== "home") parts.push("view=" + view);
  if (view === "library") {
    if (tab && tab !== "background") parts.push("tab=" + tab);
    if (q) parts.push("q=" + encodeURIComponent(q));
  }
  return "#" + parts.join("&");
}
function setHash(person, view, tab, q) {
  const next = buildHash(person, view, tab, q);
  if (next === location.hash || (next === "#" && !location.hash)) render();
  else location.hash = next;
}

/* ---------- 数据检索 ---------- */
const byId = (rows) => Object.fromEntries(rows.map(r => [r.id, r]));
let PEOPLE, PLACES, SOURCES;

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

/* ---------- 渲染骨架 ---------- */
const $ = (sel) => document.querySelector(sel);
let state = { view: "home", person: null, tab: "background", q: "" };

function render() {
  state = parseHash();
  closeOverlay();
  closeDrawer();
  const meta = PROTAGONISTS.find(p => p.id === state.person);
  document.documentElement.style.setProperty("--theme", meta ? meta.color : "#B4652F");

  const person = state.person ? PEOPLE[state.person] : null;
  $("#person-flag").textContent = person ? person.name : "";

  document.querySelectorAll(".main-nav button").forEach(btn => {
    btn.setAttribute("aria-current", String(btn.dataset.view === state.view));
    if (btn.dataset.view === "timeline" || btn.dataset.view === "map") {
      btn.disabled = !state.person;
    }
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

/* ---------- 屏1 选人 ---------- */
function renderHome() {
  const grid = $("#person-grid");
  grid.textContent = "";
  for (const meta of PROTAGONISTS) {
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
    const h3 = document.createElement("h3");
    h3.textContent = ready ? person.name : meta.fallback;
    info.appendChild(h3);
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
    grid.appendChild(li);
  }
}

/* ---------- 屏2 时间线 ---------- */
function renderTimeline() {
  const events = personEvents(state.person);
  renderRuler(events);
  const list = $("#timeline-list");
  list.textContent = "";
  for (const evt of events) {
    const li = document.createElement("li");
    const det = document.createElement("details");
    det.className = "event" + (evt.importance === 1 ? " major" : "");

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
}
function updateScopeBtn() {
  const b = $("#btn-scope");
  b.textContent = mapState.mode === "fit" ? "视野：活动范围" : "视野：全图";
  b.setAttribute("aria-pressed", String(mapState.mode === "fit"));
}

/* ---------- 地点详情：桌面侧栏 / 移动端与全屏态底部抽屉 ---------- */
const drawer = { open: false, lastFocus: null, dragY: null };
function useDrawer() {
  return mapState.overlay || window.matchMedia("(max-width: 680px)").matches;
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
  }
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
  svg.addEventListener("pointerdown", (e) => {
    if (!mapState.overlay) return;
    svg.setPointerCapture(e.pointerId);
    mapState.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    mapState.panDist = 0;
    if (mapState.pointers.size === 1) {
      mapState.panStart = { box: { ...mapState.box }, x: e.clientX, y: e.clientY };
      mapState.pinch = null;
    } else if (mapState.pointers.size === 2) {
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
  document.body.classList.add("no-scroll");
  $("#btn-overlay-close").focus();
}
function closeOverlay() {
  if (!mapState.overlay) return;
  const overlay = $("#map-overlay");
  overlay.hidden = true;
  document.body.classList.remove("no-scroll");
  if (mapState.svg) $("#map-canvas").appendChild(mapState.svg);
  mapState.overlay = false;
  mapState.pointers.clear();
  mapState.pinch = null;
  mapState.panStart = null;
  applyView(mapState.mode === "fit" ? mapState.fitBox : { x: 0, y: 0, w: MAP_W, h: MAP_H });
}

/* ---------- 轨迹播放：分段缓动，全程≤8秒，可暂停 ---------- */
const play = { raf: null, paused: false, startTs: 0, elapsed: 0, traj: null,
               marker: null, segs: null, dur: 0, lastStation: -1 };
const easeInOut = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

function togglePlayback(traj, anchors, theme) {
  const btn = $("#btn-play");
  if (play.raf) { // 播放中 → 暂停
    cancelAnimationFrame(play.raf);
    play.raf = null;
    play.paused = true;
    btn.textContent = "▶ 继续播放";
    return;
  }
  if (play.paused && play.marker) { // 续播
    play.paused = false;
    play.startTs = performance.now() - play.elapsed;
    btn.textContent = "⏸ 暂停";
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
  const t = play.traj[idx];
  $("#map-status").textContent =
    "第 " + (idx + 1) + "/" + play.traj.length + " 站 · " + t.placeNames.join("/") + " · " +
    t.events.map(e => yearLabel(e.year_bce) + " " + e.title).join("；");
  // 抽屉模式下播放不逐站弹抽屉（避免打断），状态行播报即可
  if (!useDrawer()) showPlace(t.place, t.events);
}
function finishPlayback() {
  if (play.raf) cancelAnimationFrame(play.raf);
  play.raf = null;
  play.paused = false;
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
    b.addEventListener("click", () => showLibDetail(r));
    li.appendChild(b);
    list.appendChild(li);
  }
}
function showLibDetail(r) {
  const panel = $("#lib-detail");
  panel.textContent = "";
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
}

/* ---------- 屏5 关系图谱（分组环形布局，零依赖） ---------- */
const REL_COLORS = {
  "亲属-直系": "#A9622B", "亲属-同辈": "#C79E7E", "婚姻": "#BC4433", "君臣": "#56707E",
  "拥立": "#44766B", "敌对": "#35302A", "师友": "#8A6D1F", "其他": "#8A8072",
};
const STATE_ORDER = ["齐", "鲁", "郑", "周", "卫", "楚", "许", "申", "宋"];
const relView = { nodes: new Map(), edges: [], focus: null };

function renderRelations() {
  buildRelLegend();
  drawRelGraph();
  const want = state.person && relView.nodes.has(state.person) ? state.person : relView.focus;
  if (want && relView.nodes.has(want)) focusRelNode(want);
  else resetRelFocus();
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
  dash.textContent = "虚线＝可靠度中/低";
  box.appendChild(dash);
}
function drawRelGraph() {
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
  for (const rel of DATA.relations) {
    const A = relView.nodes.get(rel.person_a), B = relView.nodes.get(rel.person_b);
    if (!A || !B) continue;
    const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
    const cx = mx + (CX - mx) * 0.45, cy = my + (CY - my) * 0.45;
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", "M" + A.x + " " + A.y + " Q" + cx + " " + cy + " " + B.x + " " + B.y);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", REL_COLORS[rel.rel_type] || "#8A8072");
    path.setAttribute("stroke-width", "1.6");
    path.setAttribute("class", "rel-edge");
    if (rel.reliability !== "high") path.setAttribute("stroke-dasharray", "5 4");
    const tip = document.createElementNS(NS, "title");
    tip.textContent = personName(rel.person_a) + " · " + rel.rel_label + " · " + personName(rel.person_b) +
      (rel.source_note ? "（" + rel.source_note + "）" : "");
    path.appendChild(tip);
    path.addEventListener("click", () => showRelDetail([rel], null));
    edgeLayer.appendChild(path);
    relView.edges.push({ rel, el: path });
  }

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
}
const personName = (id) => (PEOPLE[id] ? PEOPLE[id].name : id);

function focusRelNode(pid) {
  relView.focus = pid;
  const neighbors = new Set([pid]);
  const mine = [];
  for (const { rel, el } of relView.edges) {
    const hit = rel.person_a === pid || rel.person_b === pid;
    el.style.opacity = hit ? "0.95" : "0.06";
    el.setAttribute("stroke-width", hit ? "2.6" : "1.2");
    if (hit) {
      mine.push(rel);
      neighbors.add(rel.person_a);
      neighbors.add(rel.person_b);
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
  for (const { el } of relView.edges) {
    el.style.opacity = "";
    el.setAttribute("stroke-width", "1.6");
  }
  for (const node of relView.nodes.values()) {
    node.el.style.opacity = "";
    node.el.classList.remove("focused");
  }
  const panel = $("#rel-panel");
  panel.textContent = "";
  const h3 = document.createElement("h3");
  h3.textContent = "关系详情";
  panel.appendChild(h3);
  const p = document.createElement("p");
  p.className = "map-status";
  p.textContent = "点击人物节点高亮其一度关系；点击连线查看出处。";
  panel.appendChild(p);
}
function showRelDetail(rels, pid) {
  const panel = $("#rel-panel");
  panel.textContent = "";
  const h3 = document.createElement("h3");
  h3.textContent = pid ? personName(pid) + " 的一度关系（" + rels.length + "）" : "这条关系";
  panel.appendChild(h3);
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
  const acts = document.createElement("p");
  acts.className = "rel-actions";
  if (pid && PROTAGONISTS.some(m => m.id === pid)) {
    const go = document.createElement("button");
    go.type = "button";
    go.textContent = "查看 " + personName(pid) + " 的时间线 →";
    go.addEventListener("click", () => setHash(pid, "timeline"));
    acts.appendChild(go);
  }
  const clear = document.createElement("button");
  clear.type = "button";
  clear.textContent = "清除高亮";
  clear.addEventListener("click", resetRelFocus);
  acts.appendChild(clear);
  panel.appendChild(acts);
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
  const mapResp = await fetch("assets/map/base_map.svg");
  baseMapText = await mapResp.text();

  document.querySelectorAll(".main-nav button").forEach(btn => {
    btn.addEventListener("click", () => setHash(state.person, btn.dataset.view, state.tab, state.q));
  });
  document.querySelectorAll(".lib-tabs button").forEach(btn => {
    btn.addEventListener("click", () => setHash(state.person, "library", btn.dataset.tab, state.q));
  });
  $("#lib-search").addEventListener("input", (e) => {
    state.q = e.target.value;
    history.replaceState(null, "", buildHash(state.person, "library", state.tab, state.q));
    renderLibList();
  });
  $("#home-library-entry").addEventListener("click", () => setHash(state.person, "library", state.tab, state.q));
  $("#home-relations-entry").addEventListener("click", () => setHash(state.person, "relations"));
  $("#home-about-entry").addEventListener("click", () => setHash(state.person, "about"));
  $("#timeline-relations-entry").addEventListener("click", () => setHash(state.person, "relations"));
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
    if (drawer.open) closeDrawer();
    else if (mapState.overlay) closeOverlay();
  });
  window.addEventListener("hashchange", render);

  const m = DATA.meta;
  $("#site-footer").textContent =
    "数据 " + m.generated_at + " 生成 · 事件 " + m.tables.events + " · 人物 " + m.tables.people +
    " · 地点 " + m.tables.places + " · 摘录 " + m.tables.passages +
    " · 背景 " + m.tables.background + " · 考古 " + m.tables.archaeology +
    " · 年代 " + yearLabel(m.year_range_bce.min) + "—" + yearLabel(m.year_range_bce.max);
  render();
}
boot().catch(err => {
  $("#site-footer").textContent = "加载失败：" + err.message + "（请经 http 访问并确认已运行 tools/csv_to_json.py）";
});
