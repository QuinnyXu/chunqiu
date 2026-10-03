"use strict";

/**
 * tools/qa/require_browser.js
 * ------------------------------------------------------------------
 * 共用之 requireBrowser()——裁一百一十七（team/round54_prompts.md §十一，
 * "playwright：二者皆是；且其治在门之码，不在门头之散文"）。
 *
 * 来源标记：r57-A（Skipper），落笔 2026-10-02 EDT，会话
 *   session_01JkpHQRHneUJBWoWQ3o2GNC，r57-A 立，于 r58-E 提交。
 *   〔2026-10-03 EDT 就地勘正，据裁一百三十一〕原句「尚未提交、未推送（r57-A 红线）」
 *   照留不删，录于此：那句话写下时为真且有用（告读者「此物未上线，勿当已部署」），
 *   错不在其假，错在把「此刻之状」写进一个会被长期读的文件头——其保质期就是写下它的那一刻。
 *
 * ★ 〔2026-10-02 EDT 补记·裁一百一十九② 所命之「同勘」，领队办而不勘，其由书此〕
 *   裁一百一十九② 命「门头所承之同一句同勘」——而本门头**并无那一句**：
 *   裁文原书「node 包**不在**任何 resolve 路径」（不实），而本门头书「**未必**在」——**其所书为真**，
 *   故**不勘**（为一个没错的句加勘注记号，记号自己就成了下一个假话）。
 *   ★ 惟补其实，使后人读此条即见其所指：node 包**在 `tools/qa/node_modules/`**，
 *   自 `tools/qa/` 求之得着，**自仓根求之 `Cannot find module`**——
 *   故「未必在」之「未必」，其实即**系于自何处跑**（裁一百一十九④，其报已落于下）。
 *
 * 其事之由：浏览器在（`ms-playwright/chromium-<N>`），node 包未必在任何
 * resolve 路径；而「门跑不起来」与「门跑了而全绿」在今日各门的输出里几乎
 * 一样——此即裁一百一十四「绿须自证其能红」之同形。故治法不落在门头一句
 * 散文式的"请先装好 xxx"，而落在门的代码本身：门一跑，就得自证其具实在，
 * 取不到就 exit 2，绝不默然放行。
 *
 * 契（裁一百一十七 四款，原字）：
 *   ① 报其所得之 executablePath 与浏览器之实际版本于输出之首；
 *   ② 取不到则 exit 2（本门自身出错），绝不 exit 0；
 *   ③ 其路取环境变量 PLAYWRIGHT_CHROMIUM_PATH；不设则自 ms-playwright/ 下求
 *      之，得零或多于一者亦 exit 2 并列其所见——不猜；
 *   ④ 不写死任何版本号：`-1243`／`-1234` 之不符正是 playwright-core 与浏览
 *      器之版本耦合；写死即把今日这台机器写进仓里。
 *
 * 用法：
 *   const { requireBrowser } = require("./require_browser.js");
 *   const { pw, browser, executablePath, browserVersion } = await requireBrowser();
 *   // ... 用毕 await browser.close();
 *
 * 失败路径一律 process.exit(2)，不抛给调用者挑——
 * 这是"本门自身出错"，不是调用门的数据判据之红，二者在退出码上须可分
 * （裁一百一十四 四款之同一道理）。
 *
 * ★ 本模块自身即受裁一百一十四之治：其反证须同跑，见文末
 *   `tools/qa/require_browser.selftest.js`（同一来源标记、同会话落笔）。
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

/** ms-playwright 缓存根——依平台取 playwright 官方惯用之默认位置；
 *  PLAYWRIGHT_BROWSERS_PATH 若设，优先取之（playwright 自身亦认此变量）。 */
function msPlaywrightRoots() {
  const roots = [];
  if (process.env.PLAYWRIGHT_BROWSERS_PATH) {
    roots.push(process.env.PLAYWRIGHT_BROWSERS_PATH);
  }
  if (process.platform === "win32") {
    if (process.env.LOCALAPPDATA) roots.push(path.join(process.env.LOCALAPPDATA, "ms-playwright"));
  } else if (process.platform === "darwin") {
    roots.push(path.join(os.homedir(), "Library", "Caches", "ms-playwright"));
  } else {
    if (process.env.XDG_CACHE_HOME) roots.push(path.join(process.env.XDG_CACHE_HOME, "ms-playwright"));
    roots.push(path.join(os.homedir(), ".cache", "ms-playwright"));
  }
  return roots;
}

/** 给定一个 `chromium-<N>` 目录，求其下 chrome 可执行文件——
 *  不写死版本号，只按平台惯用之子目录名逐一探。 */
function findExecutableUnder(chromiumDir) {
  const candidates = [
    path.join(chromiumDir, "chrome-win64", "chrome.exe"),
    path.join(chromiumDir, "chrome-win", "chrome.exe"),
    path.join(chromiumDir, "chrome-linux", "chrome"),
    path.join(chromiumDir, "chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"),
    path.join(chromiumDir, "chrome-mac-arm64", "Chromium.app", "Contents", "MacOS", "Chromium"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/** 自 ms-playwright/ 下求所有 chromium 可执行文件——不问其版本号，只问其名
 *  是否正合 `chromium-<数字>`（**不**含 `chromium_headless_shell-<N>` 等近似
 *  目录，那是另一产物，不是本函数所求的常规 chromium）。 */
function findMsPlaywrightCandidates() {
  const found = [];
  for (const root of msPlaywrightRoots()) {
    let entries;
    try {
      entries = fs.readdirSync(root, { withFileTypes: true });
    } catch (e) {
      continue; // 该根不存在或不可读，跳过，不算错——多根之一落空是常态
    }
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      if (!/^chromium-\d+$/.test(ent.name)) continue;
      const exe = findExecutableUnder(path.join(root, ent.name));
      if (exe) found.push(exe);
    }
  }
  return found;
}

/**
 * requireBrowser()
 * 返回 { pw, browser, executablePath, browserVersion }；
 * 任一步失败即打印其所见、process.exit(2)，不返回。
 */
async function requireBrowser() {
  let pw;
  try {
    pw = require("playwright");
  } catch (e) {
    console.error("requireBrowser(): playwright 本体取不到（" + String(e.message || e).split(/\r?\n/)[0] + "）。");
    /* ★ 裁一百一十九④：此处尤须报 cwd——「取不到」与「自不对的地方去取」在今日之输出里一模一样。 */
    console.error("  cwd=" + process.cwd() + "　★ 诸门之 resolve 自其所在之目录起；若此 cwd 非门之所在，先换地方再论其有无。");
    console.error("exit 2。");
    process.exit(2);
  }

  let executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
  let pathSource = "环境变量 PLAYWRIGHT_CHROMIUM_PATH";

  if (!executablePath) {
    const candidates = findMsPlaywrightCandidates();
    if (candidates.length === 0) {
      console.error(
        "requireBrowser(): 未设 PLAYWRIGHT_CHROMIUM_PATH，且 ms-playwright/ 下（"
        + msPlaywrightRoots().join("；") + "）未求得任何 chromium-<N> 可执行文件。exit 2。"
      );
      process.exit(2);
    }
    if (candidates.length > 1) {
      console.error(
        "requireBrowser(): 未设 PLAYWRIGHT_CHROMIUM_PATH，而 ms-playwright/ 下求得 "
        + candidates.length + " 个 chromium 可执行文件，不猜，所见俱列：\n"
        + candidates.map((c) => "    · " + c).join("\n")
        + "\nexit 2。"
      );
      process.exit(2);
    }
    executablePath = candidates[0];
    pathSource = "ms-playwright/ 自动求得（未设 PLAYWRIGHT_CHROMIUM_PATH）";
  }

  if (!fs.existsSync(executablePath)) {
    console.error(
      "requireBrowser(): executablePath 所指之文件不存在（" + executablePath
      + "，源：" + pathSource + "）。exit 2。"
    );
    process.exit(2);
  }

  let browser;
  try {
    browser = await pw.chromium.launch({ executablePath });
  } catch (e) {
    console.error(
      "requireBrowser(): chromium.launch({ executablePath: " + executablePath
      + " }) 失败（" + String(e.message || e).split(/\r?\n/)[0] + "）。exit 2。"
    );
    process.exit(2);
  }

  const browserVersion = browser.version();
  // 契①：报其所得之 executablePath 与浏览器之实际版本于输出之首。
  console.log(
    "requireBrowser(): executablePath=" + executablePath
    + "（源：" + pathSource + "）；浏览器实际版本=" + browserVersion
  );
  /* ★ 裁一百一十九④ 所加之一款：并报 `process.cwd()` 与 playwright 之 resolve 实得路径。
   *   其由是一笔实账：领队于**仓根**求 `require("playwright")` 得 MODULE_NOT_FOUND，
   *   遂断「诸门跑不起来」并上报，而诸门在 `tools/qa/` 下、其 resolve 自所在目录起，本跑得起来。
   *   ★ 诸门之 resolve 自其所在之目录起，故「**自何处跑**」本身即是一个须报之事实。
   *   ★ 我们这一笔的全部教训，就在这两个值上。 */
  let resolved;
  try { resolved = require.resolve("playwright"); } catch (e) { resolved = "（resolve 不得：" + String(e.code || e.message || e) + "）"; }
  console.log("requireBrowser(): cwd=" + process.cwd() + "；playwright 之 resolve 实得=" + resolved);

  return { pw, browser, executablePath, browserVersion };
}

module.exports = { requireBrowser, findMsPlaywrightCandidates, msPlaywrightRoots, findExecutableUnder };
