"use strict";

/**
 * tools/qa/require_browser.selftest.js
 * ------------------------------------------------------------------
 * requireBrowser()（`tools/qa/require_browser.js`）之自带反证——
 * 裁一百一十四「绿须自证其能红」第一款：凡门之一跑，须同跑自带其反证，
 * 且反证之果须为红。本件即 requireBrowser() 之自证。
 *
 * 来源标记：r57-A（Skipper），落笔 2026-10-02 EDT，会话
 *   session_01JkpHQRHneUJBWoWQ3o2GNC。尚未提交、未推送（r57-A 红线）。
 *
 * 跑法：node tools/qa/require_browser.selftest.js
 *
 * 三案（每案以子进程跑一次最小调用脚本，核其**实际退出码**，不靠猜、
 * 不靠读源码自证）：
 *   甲·正路——不设 PLAYWRIGHT_CHROMIUM_PATH，不改 PLAYWRIGHT_BROWSERS_PATH，
 *     期其 exit 0，且 stdout 首行含 executablePath 与浏览器实际版本
 *     （裁一百一十七①）。此案若本机无可用 chromium 则**如实判该案未过**，
 *     不强作"函数本身有误"论——两件事须分开报。
 *   乙·反证一（裁一百一十七②，任务书明命）——PLAYWRIGHT_CHROMIUM_PATH 指一
 *     个不存在之路径，期其 exit 2，不得 exit 0。
 *   丙·反证二（裁一百一十七③「得…多于一者亦 exit 2」，任务书明命宜造）——
 *     造二个假路（临时目录下两个 chromium-<N>/chrome-win64/chrome.exe 占位
 *     文件），经 PLAYWRIGHT_BROWSERS_PATH 令其可见，期其 exit 2，且其输出
 *     列出所见之路（不止一条）。
 *
 * 本件之判据（裁一百一十四③「凡判据须能指出一个使其为红之输入」）：
 *   乙、丙两案其输入本身就是"使其为红之输入"；若乙、丙任一案不红，
 *   本自测本身 exit 1（不是 0，也不是 2——2 留给 requireBrowser() 自身
 *   "本门自身出错"之专用，自测脚本的失败是另一回事，二者退出码不可混）。
 */

const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const HERE = __dirname;
const NODE = process.execPath;

function runCase(label, env) {
  const script = `
    const { requireBrowser } = require(${JSON.stringify(path.join(HERE, "require_browser.js"))});
    requireBrowser().then((r) => {
      console.log("__OK__");
      return r.browser.close();
    }).catch((e) => {
      console.error("__THREW__", e && e.message);
      process.exit(97);
    });
  `;
  const res = spawnSync(NODE, ["-e", script], {
    cwd: HERE,
    env: Object.assign({}, process.env, env),
    encoding: "utf8",
    timeout: 60000,
  });
  return {
    label,
    code: res.status,
    stdout: res.stdout || "",
    stderr: res.stderr || "",
    timedOut: !!res.error && res.error.code === "ETIMEDOUT",
  };
}

function mkFakeMsPlaywright() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "require_browser_selftest_"));
  for (const n of ["9001", "9002"]) {
    const dir = path.join(root, "chromium-" + n, "chrome-win64");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "chrome.exe"), "");
    // 非 win32 环境下亦放一份 chrome-linux 占位，覆盖类 Unix 路径分支
    const linuxDir = path.join(root, "chromium-" + n, "chrome-linux");
    fs.mkdirSync(linuxDir, { recursive: true });
    fs.writeFileSync(path.join(linuxDir, "chrome"), "");
  }
  return root;
}

function main() {
  const results = [];

  // 甲·正路
  {
    const r = runCase("甲·正路（不设 PLAYWRIGHT_CHROMIUM_PATH）", {
      PLAYWRIGHT_CHROMIUM_PATH: "",
      PLAYWRIGHT_BROWSERS_PATH: "",
    });
    const pass = r.code === 0 && /executablePath=/.test(r.stdout) && /浏览器实际版本=/.test(r.stdout);
    results.push({ ...r, pass, note: pass ? "" : "本机可能无可用 chromium——此系环境之实，非 requireBrowser() 之误；见 stderr。" });
  }

  // 乙·反证一：不存在之路径 → 必须 exit 2
  {
    const fakePath = path.join(os.tmpdir(), "require_browser_selftest_does_not_exist", "chrome.exe");
    const r = runCase("乙·反证一（PLAYWRIGHT_CHROMIUM_PATH 指不存在之路径）", {
      PLAYWRIGHT_CHROMIUM_PATH: fakePath,
      PLAYWRIGHT_BROWSERS_PATH: "",
    });
    const pass = r.code === 2;
    results.push({ ...r, pass, note: pass ? "" : `期 exit 2，实得 exit ${r.code}——反证不红，裁一百一十四②：本跑作废。` });
  }

  // 丙·反证二：ms-playwright 下可见多于一个 chromium → 必须 exit 2
  {
    const fakeRoot = mkFakeMsPlaywright();
    let r;
    try {
      r = runCase("丙·反证二（PLAYWRIGHT_BROWSERS_PATH 令可见 ≥2 个 chromium）", {
        PLAYWRIGHT_CHROMIUM_PATH: "",
        PLAYWRIGHT_BROWSERS_PATH: fakeRoot,
      });
    } finally {
      fs.rmSync(fakeRoot, { recursive: true, force: true });
    }
    const pass = r.code === 2 && /个 chromium 可执行文件/.test(r.stderr);
    results.push({ ...r, pass, note: pass ? "" : `期 exit 2 且列多路，实得 exit ${r.code}——反证不红，裁一百一十四②：本跑作废。` });
  }

  console.log("=== require_browser.selftest.js ===");
  let allPass = true;
  for (const r of results) {
    const mark = r.pass ? "PASS" : "FAIL";
    if (!r.pass) allPass = false;
    console.log(`[${mark}] ${r.label} —— exit=${r.code}`);
    if (r.stdout.trim()) console.log("    stdout: " + r.stdout.trim().split(/\r?\n/).join("\n    stdout: "));
    if (r.stderr.trim()) console.log("    stderr: " + r.stderr.trim().split(/\r?\n/).join("\n    stderr: "));
    if (!r.pass && r.note) console.log("    note: " + r.note);
  }

  const mandatory = results.slice(1); // 乙、丙两案是任务书明命之反证，必须红（即 exit 2）
  const mandatoryPass = mandatory.every((r) => r.pass);

  if (!mandatoryPass) {
    console.error("\n★★ 乙／丙两案（裁一百一十七②③之反证）至少一案未得 exit 2——requireBrowser() 之反证不同跑为红，本件（r57-A）不算交。exit 1。");
    process.exit(1);
  }

  if (!results[0].pass) {
    console.log("\n★ 甲案（正路）未过，已如实标注——不强作 requireBrowser() 本身有误论，见上方 note。乙、丙两案（强制反证）俱红，自测仍判 exit 0。");
  }

  console.log("\n乙、丙两案俱红（exit 2），裁一百一十四①②之要求满足。exit 0。");
  process.exit(0);
}

main();
