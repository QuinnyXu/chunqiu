"use strict";
// r24a Vision 自验：国色制换血（九国色定调／个人色退役）＋并观线型与交互重构
// ＋全屏控件移位＋§9.3 全景徽记可辨性＋政制图标＋子产首秀＋27 主角回归
const http = require("http"), fs = require("fs"), path = require("path");
const SITE_DIR = path.resolve(__dirname, "..", "..", "site");
const OUT = path.resolve(__dirname, "screenshots");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
function srv(root) { return new Promise((res, rej) => { const s = http.createServer((rq, rs) => { let u = decodeURIComponent(rq.url.split("?")[0].split("#")[0]); if (u === "/") u = "/index.html"; const fp = path.join(root, u); if (!fp.startsWith(root)) { rs.writeHead(403); rs.end(); return; } fs.readFile(fp, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(fp).toLowerCase()] || "application/octet-stream" }); rs.end(d); }); }); s.on("error", rej); s.listen(0, "127.0.0.1", () => res(s)); }); }
const log = [];
const say = (...a) => { const s = a.join(" "); log.push(s); console.log(s); };
const H = (t) => say("\n===== " + t + " =====");
const OK = (c, t) => say((c ? "  [OK]   " : "  [FAIL] ") + t);

const STATE_HEX = { "齐": "#A5322A", "鲁": "#97561F", "郑": "#35706A", "晋": "#74402C", "秦": "#423C39", "楚": "#5E2B45", "卫": "#2F5480", "宋": "#4F457F", "陈": "#3B6A48" };

(async () => {
  const pw = require("playwright");
  const baseURL = process.env.QA_BASE_URL || null;
  let s = null, origin = baseURL;
  if (!origin) { s = await srv(SITE_DIR); origin = `http://127.0.0.1:${s.address().port}`; say("本地服务器：" + origin); }
  else say("真机 QA_BASE_URL：" + origin);
  const b = await pw.chromium.launch();
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2,
    extraHTTPHeaders: { "Cache-Control": "no-cache", "Pragma": "no-cache" } });
  await c.route("**/*.{js,css,json,svg}", r => r.continue({ headers: { ...r.request().headers(), "Cache-Control": "no-cache" } }));
  await c.addInitScript(() => { try { localStorage.setItem("chunqiu_tour_v1", "1"); } catch (e) { } });
  const p = await c.newPage(); const errs = [];
  p.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
  const warns = [];
  p.on("console", m => { if (m.type() === "warning" || m.type() === "error") warns.push(m.type() + ": " + m.text()); });

  // ---------- 0) 启动：27 主角注册、九国色读入、个人色变量确已消失 ----------
  H("0) 国色制启动自检（27 主角 / 九国色 / --p-* 已退役）");
  await p.goto(origin + "/#/", { waitUntil: "load" }); await p.waitForTimeout(1000);
  const boot = await p.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const hex = (s) => { s = (s || "").trim(); const m = s.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/); return m ? "#" + [1, 2, 3].map(i => (+m[i]).toString(16).padStart(2, "0")).join("").toUpperCase() : s.toUpperCase(); };
    return {
      n: PROTAGONISTS.length,
      people: PROTAGONISTS.map(m => ({ id: m.id, name: (PEOPLE[m.id] || {}).name || m.fallback,
        state: (PEOPLE[m.id] || {}).state, key: PEOPLE[m.id] ? panoStateKey(PEOPLE[m.id]) : null,
        color: hex(m.color), badge: m.badge, inData: !!PEOPLE[m.id] })),
      // 26 个退役个人色变量必须全部读不到值
      retired: ["wenjiang", "qixiang", "qihuan", "qixi", "guanzhong", "baoshuya", "luyin", "luhuan",
        "luzhuang", "caogui", "zhengzhuang", "zhengzhao", "wujiang", "jizhong", "jinwen", "liji",
        "jiezhitui", "qinmu", "muji", "chucheng", "chuzhuang", "xigui", "zhuangjiang", "xuanjiang",
        "songxiang", "xiaji"].filter(k => cs.getPropertyValue("--p-" + k).trim() !== ""),
      states: Object.fromEntries(Object.entries(STATE_FAMILY_VAR).map(([k, v]) => [k, hex(cs.getPropertyValue(v))])),
    };
  });
  say("  主角数：" + boot.n);
  OK(boot.n === 27, "PROTAGONISTS 共 27 位（r23b 子产已入册）");
  OK(boot.retired.length === 0, "26 个 --p-* 个人色变量已全数退役（残留：" + (boot.retired.join(",") || "无") + "）");
  let colorOk = true;
  for (const m of boot.people) {
    const want = STATE_HEX[m.key];
    const good = m.inData && want && m.color === want;
    if (!good) { colorOk = false; say("    ✗ " + m.name + " key=" + m.key + " color=" + m.color + " want=" + want + " inData=" + m.inData); }
  }
  OK(colorOk, "27 人主题色全部等于其所属国的国色");
  let stateOk = true;
  for (const [k, want] of Object.entries(STATE_HEX)) { if (boot.states[k] !== want) { stateOk = false; say("    ✗ " + k + " = " + boot.states[k] + " want " + want); } }
  OK(stateOk, "九国色变量值与 design_notes §2.1 定调表一致");
  const zichan = boot.people.find(x => x.id === "P_ZICHAN");
  OK(!!zichan && zichan.inData && zichan.color === "#35706A", "子产在册、有数据、着郑色 #35706A");

  // 每国抽一人，记录其国色分布
  const byState = {};
  for (const m of boot.people) { (byState[m.key] = byState[m.key] || []).push(m.name); }
  for (const k of Object.keys(STATE_HEX)) say("  " + k + "（" + STATE_HEX[k] + "，" + (byState[k] || []).length + " 人）：" + (byState[k] || []).join("、"));

  fs.writeFileSync(path.join(OUT, "r24a_log.txt"), log.join("\n"), "utf8");
  say("\n控制台告警：" + (warns.length ? warns.join(" | ") : "无"));
  say("页面错误：" + (errs.length ? errs.join(" | ") : "无"));
  await b.close(); if (s) s.close();
  fs.writeFileSync(path.join(OUT, "r24a_log.txt"), log.join("\n"), "utf8");
})();
