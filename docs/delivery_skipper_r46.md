# 交付 · Skipper r46 —— Vision r46（通行字视图）推送与生产复验

任务：`team/round44_prompts.md` 任务 10〔任务 For Skipper · 任务 9 前端推送〕，前置站长裁〔2026-09-02 站长裁定 · 任务 9 推送与 ⚑G〕：「先推送，⚑G 另件」。

本件只做「合入执行」——数据与规则的裁量在 Vision r46（`docs/delivery_vision_r46.md`），本件不重复其论证，只记推送与生产实测。

## 一、改动面实核（落笔前 `git status`）

推送前实测 `git status`：

```
modified:   site/app.js
modified:   site/styles.css
modified:   tools/qa/vision_r32.js
Untracked:  docs/delivery_vision_r46.md
Untracked:  tools/qa/vision_r46.js
```

与任务书所列改动面**逐项相符**：`site/app.js`（`906–981` 通行字视图模块、`1027–1054` 引文正文改走 `quoteTextNode` 并加切换钮）、`site/styles.css`（`807–851`）、`tools/qa/vision_r32.js`（顺带修一行）、`tools/qa/vision_r46.js`（新增）、`docs/delivery_vision_r46.md`（新增）。`data/`、`docs/conventions.md` 一字未动（`git diff --stat` 对二者为空）。

**截图两张未随提交入库**：`tools/qa/screenshots/*.png` 全部落在 `.gitignore:32` 排除范围内（仅留 `.gitkeep`），核查 `git log --all -- tools/qa/screenshots/` 全库历史无一张 png 曾入库（r18 只引入截图渠道本身），`docs/delivery_vision_r28.md` 等既往交付文档皆只在文中引用截图路径、不将 png 提交——此为既有仓库体例，非本轮新issue。故未用 `-f` 强行破例，截图仍留本地供随文引用。

## 二、红线 6 复核

`git diff -U0 site/app.js site/styles.css tools/qa/vision_r32.js | grep -iE 'http|fetch|import|require|cdn'` 对新增行**零命中**。`tools/qa/vision_r46.js` 中含 `require("playwright")`／`http://127.0.0.1:8791` 默认值等，但该文件是 QA 测试脚本（`tools/qa/`），非站点运行时代码，与既有 `vision_r32.js` 等脚本同例，不受红线 6 约束（红线 6 管的是 `site/` 运行时零依赖）。**复核结论：红线 6 未破。**

## 三、本地走查门逐项实跑（本地 `python -m http.server 8791`）

| 走查门 | 结果 |
|---|---|
| `vision_r46.js` | **82/82 全过** |
| `vision_r32.js` | **29/29 全过**（含顺带修一行后重跑） |
| `vision_r28.js` | exit 0，`合计 [FAIL] 0 条` |
| `badge_silhouette_r28.js` | exit 0，无异常项 |
| `quote_layer_color_r32.js` | exit 0，新色对全部国色/功能色逐对 ΔE76 ≥13.2，0 对低于线 |
| `regress20.js` | exit 0，`页面错误: 无` |
| `python tools/validate.py` | `OK：全部校验通过`，exit 0 |

**顺带修声明**（三步范式）：`tools/qa/vision_r32.js:83` `scrollIntoView` 加 `behavior:"instant"`——因 `site/styles.css:93` 之 `scroll-behavior:smooth` 使该门在同一 tick 内 `scrollIntoView` 后即读 rect、读到动画中途（Vision 报告改前 HEAD 基线连跑四遍四遍皆红，属既有 flaky 非本件所致）；一行、可回退。本轮改后重跑 `vision_r32.js` 确认 29/29。

## 四、提交与推送

提交 `bf3c3b6`：

```
feat(vision r46 推送): 通行字视图＋「＝」全角括注浏览器实渲，走查门82/82与29/29
```

5 files changed, 749 insertions(+), 3 deletions(-)。`git push origin main`：`dcbe1ec..bf3c3b6 main -> main`。

**Actions**：`33694963125`（Deploy site to GitHub Pages）—— **success**。

## 五、生产带参复验（`?v=`）

沙盒说明：本轮 `node` 内置 `dns.resolve4()` 对生产域名解析失败（`ECONNREFUSED`），但 `curl` 与 `playwright`/Chromium 均可正常访问 `https://chunqiu.timechorus.com`（HTTP 200）——与 r44/r45/r45b 处置一致，`node` 内置解析器与浏览器/`curl` 走的系统解析路径不同。本轮走查脚本本就基于 Playwright（真浏览器），故**直接对生产域名跑通全部三个既有走查/复验脚本**，未采用 r45b 式的"下载响应体本地复算"迂回路径。

`tools/qa/vision_r46.js` 内建 `?v=` 时间戳防缓存（脚本 `BUST` 变量）。

### `node tools/qa/vision_r46.js https://chunqiu.timechorus.com`：**82/82 全过**，逐条与本地一致，尤其：

- **`Q167` 未被转换**（限域试金石）：`.q-seg` 与切换钮计数俱 0；渲染 `innerText` 与 `quote_original` 全等；串内实含「殺悼子（卓子）」，**未压成「悼卓子」**。
- **`Q442`**：4 处可换段，默认呈通行字（「蔡哀侯取妻於陳，息侯亦取妻於陳，是息媯……」），切换后逐字等于 `quote_original`，**三「＝」仍在**（「賽＝（息）」「是賽＝爲＝（息媯）」），原貌可选可复制。
- **`Q448`**：3 处可换段，默认通行字（「立六年，秦公率師與惠公戰于韓……」），切换后逐字等于 `quote_original`。
- **窄屏 320/360/390/680px**：可换段（含「賽＝（息）」「賽＝爲＝（息媯）」）**不被拆行、不溢出**；对照项证实「若无 `nowrap` 会在 320px/390px 原貌态拆行」，本轮加的 `white-space: nowrap` 确已兜住。
- 字形覆盖：「＝」与全角括注同落 SimSun、全角推进宽、位图墨迹非 `.notdef` 方框（真有字形）。
- 全库 440 条 blockquote 遍历：带可换段/切换钮者只 `Q442`／`Q448`，其余 438 条渲染文本逐字等于 `quote_original`，零影响。
- 检索、地图卡片、人物视图复用、无障碍树各节俱通过。

### `node tools/qa/r43_prod_check.js https://chunqiu.timechorus.com`：**21/21 PASS 0 FAIL**（婢／嬖并陈、五鹿新点、E084 正读、简 34 著录三处、九表基线全等）。

### `node tools/qa/r44_prod_check.js https://chunqiu.timechorus.com`：**24/24 PASS 0 FAIL**（骊姬页/息妫页两侧互指、`Q442` 释文形貌落定含三「＝」全录）。

## 六、仍开放（照转，不代裁）

⚑G（检索下拉摘要仍作释文原貌，与卡片默认所见不一致）另件处置，站长定「检索该搜何形」后再发；⚑H（编者层标 markdown 星号逐字渲染，9/128 条）未碰；⚑I（「＝」功能仍未定读）；⚑J（`vision_r24a` 既有 FAIL，与本件无涉）未修不碰。

## 七、结论

Vision r46 全部产出已合入生产，Actions 绿，本地与生产两侧走查门、既有回归门、`validate.py` 全数通过；`Q167` 限域未转换与窄屏不拆两项试金石均已实测确认。
