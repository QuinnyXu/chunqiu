# 交付说明 · Skipper r18（合入＋QA 渠道）

日期：2026-07-26。任务：合入 `r17-play-engine-merge` 分支（领队裁定该分支严格优于当前 main，立即上线）＋配置无头浏览器 QA 截图渠道。数据零改动，未涉及 `data/csv/` 或 `site/data/`。

## 1. 合入前置质量门（三项全过，未强行合入）

在分支 `r17-play-engine-merge`（提交 `d38b5a1`/`9b01dfe`/`b0b79d7`/`3e4cf43`）上执行：

- `python tools/validate.py` → `OK：全部校验通过`
- `node --check site/app.js` → exit 0（语法通过）
- `node tools/test_binguan_play.js` → `TEST PASS`，exit 0。5 处交会点（泺/临淄/禚/祝丘/防）逐点亮起断言全过，结束后全部常亮=是，无停拍、相邻帧最大年跳=0.333（有界）。

三项皆过，按裁定合入。

## 2. 时序协调（Vision r18 台账勘误）

领队同步：Vision 已将 r18 台账勘误自行提交到 `r17-play-engine-merge` 分支，提交 `3e4cf43`（docs-only，`docs/delivery_vision_r18.md`，订正"r17 任务书是否含全屏控件项"的事实描述，不改主因结论）。该提交已在分支四提交之列，随合入一并纳入 main，**未丢失**，无需另行联系 Vision 补带。

## 3. 合入 main

- 分支切回 `main`，`git merge --no-ff r17-play-engine-merge` → 合并提交 `bd818ea`（保留 r17/r17b/r18/勘误四轮提交脉络，未压缩历史）。
- 变更内容：`site/app.js`（播放引擎合一，单人/并观唯一 player；年位同步改交会锚故事进度 sc 为主钟；交会点常亮不打断；速度定稿 0.5×）、`site/index.html` + `site/styles.css`（全屏播放悬浮控件 `#overlay-controls`/`#ov-play`）、`tools/test_binguan_play.js`（状态机测试）、`docs/delivery_vision_r17.md`/`docs/delivery_vision_r18.md`（新增）、`docs/design/design_notes.md`。
- 顺带提交领队 CLAUDE.md 改动（提交 `9dcf2ec`）：第 12 行称谓 Xiangtao→Xu，「排程与裁定权在领队与 Xu」，与合入一并入库。

## 4. 部署 GitHub Pages

- Push `main`（`da883ca..9dcf2ec`）触发 GitHub Actions「Deploy site to GitHub Pages」，run `30212893937`，`completed / success`。
- 部署内含前置 `validate.py` guard（workflow 自带）与部署后 `meta.json.generated_at` 一致性自检，均通过：本地 `generated_at=2026-07-21T12:31:04+00:00`，线上（带 cache-bust）比对一致，`OK：线上 meta.json 与仓库一致，部署已生效`。
- 生产 URL（供 Xu 真机复测）：
  - **`https://chunqiu.timechorus.com/`**（自定义域名，curl 已验证 200 OK 且 `meta.json` 内容一致）
  - `https://quinnyxu.github.io/chunqiu/`（GitHub Pages 默认地址，workflow `page_url` 输出同一部署）
- 复测入口建议：单人 `#/p/P_WENJIANG/map` → 点「⛶ 放大查看」进全屏 → 播放；并观 `#compare=P_WENJIANG,P_QIXIANG` → 同样进全屏 → 观察左下角播放控件与交会点常亮。

## 5. QA 渠道：Playwright 无头浏览器截图

- **定位**：`tools/qa/` 下的 QA 专用开发依赖，严格隔离——依赖/配置只在该目录（自带 `package.json`/`package-lock.json`），不进入站点根或 `tools/` Python 管线声明；`site/` 部署产物不引用、不依赖它；红线6「站点零运行时依赖」未受影响。
- **依赖隔离落位**：`tools/qa/node_modules/`、`tools/qa/screenshots/*.png` 已加入根 `.gitignore`（前者为可重装第三方包，后者为可重跑的易变截图产物），仅 `tools/qa/screenshots/.gitkeep` 入库占位。
- **conventions.md 升版至 v1.14**，新增 §9.3「QA 工具链例外」，与 §9.2 三项外部资源例外（og 图、CF Analytics beacon、打赏链接）并列，原文明确：

  > **非构建必需、非运行时依赖，仅 QA 截图自验用**：`site/` 部署产物不引用、不依赖 `tools/qa/` 下任何文件；`csv_to_json.py`/`validate.py` 等数据管线与站点加载路径均不经过它。

  并新增通例：「此后视觉/触达类验收项一律附本脚本截图（或同类无头浏览器截图），jsdom 单元测试只作逻辑层自验，不再单独作为视觉类项目的"已验收"依据。」

- **四组合截图脚本**：`tools/qa/screenshot_playback_ui.js`
  - 组合：单人（`#/p/P_WENJIANG/map`）/并观（`#compare=P_WENJIANG,P_QIXIANG`，binguan fixtures 同一对）× 桌面（1440×900）/手机（390×844，iPhone 12/13 视口，`isMobile`/`hasTouch`）。
  - 各组合进入地图全屏态（点击 `#btn-zoom` 或 `#cmp-zoom`）后截图，终端同时打印 `#ov-play` 播放控件的真实渲染坐标与尺寸（`boundingBox()`），供逐项核验"可见、不被遮挡"。
  - 脚本自起本地零依赖静态服务器指向 `site/`（避免 `file://` 协议下 `fetch()` 加载 `site/data/*.json` 被 CORS 拦截）；也支持 `QA_BASE_URL` 环境变量指向已部署生产地址直接跑真机复测。
  - 用法：
    ```
    cd tools/qa
    npm install                 # 首次，装 playwright（devDependency）
    npm run install-browser     # 首次，装 chromium 二进制
    node screenshot_playback_ui.js   # 或 npm run shots
    ```

### 首跑结果（本环境实测，非待办申报）

本环境具备联网条件，`npm install` 与 `playwright install chromium`（chromium 151.0.7922.34，约 192MB）均成功，脚本首跑**四组合全过**：

```
✓ 单人 · 桌面（single-desktop）— OK   #ov-play 位置=(14,842) 尺寸=166x44
✓ 单人 · 手机（single-mobile）— OK    #ov-play 位置=(10,790) 尺寸=166x44
✓ 并观 · 桌面（dual-desktop）— OK     #ov-play 位置=(14,842) 尺寸=118x44
✓ 并观 · 手机（dual-mobile）— OK      #ov-play 位置=(10,790) 尺寸=118x44
```

四张截图目视核对：全屏浮层地图正常渲染，左下角播放控件（单人"▶ 轨迹按时间播放"/并观"▶ 按年并观"）在桌面与手机视口下均完整可见、未被裁切或遮挡，坐标落在视口内、贴近底部但不越界。截图产物在 `tools/qa/screenshots/`（本地保留，未入库，可随时重跑复现）。

## 6. 补记：打赏入口「支持本站」合入（2026-07-26 晚，续 r18）

领队追加裁定：Xu 已放行打赏入口，立即合入。Vision 提交 `6f83f2b`（首页底部主入口 `#btn-support` + 关于页次级入口 `#support-link` + 支付宝单通道收款码弹层，本地资产 `site/assets/support/alipay-qr.png`）落地时直接提交在本地 `main` 分支之上（父提交为本轮 `3bbce6f`），非任务书所述的 `r17-play-engine-merge` 分支——核实为 Vision 侧描述与实际提交位置的偏差，**内容本身与任务书描述一致、无遗漏**，故未要求 Vision 改提交位置重来，直接在 main 上继续核验合入流程。

**质量门**（三项，未强行合入）：
- `python tools/validate.py` → `OK：全部校验通过`（数据零改动确认）
- `node --check site/app.js` → exit 0
- `tools/qa/screenshot_support_ui.js`（Vision 留的打赏 UI 截图脚本，复用既有 Playwright 渠道）→ 四组合全过，配句回读「感恩支持，庭燎之光，以待君子」无误：
  ```
  ✓ 首页底部主入口·桌面（support-footer-desktop）— OK   #btn-support 位置=(485,1093) 尺寸=99x33
  ✓ 收款码弹层·桌面居中（support-dialog-desktop）— OK
  ✓ 收款码底部抽屉·手机（support-drawer-mobile）— OK
  ✓ 关于页次级入口（support-about-secondary）— OK
  ```
  目视核对四张截图：桌面弹层居中、手机走底部抽屉，收款码图与配句显示正常，关闭三件套（点外/✕/ESC）UI 到位，全站其余页面未见散落的打赏元素。

**合入方式**：提交已直接落在本地 `main`（`3bbce6f..6f83f2b`，线性历史，无需 `--no-ff` 合并）。

**部署**：`git push origin main` → GitHub Actions「Deploy site to GitHub Pages」run `30229112509`，headSha `6f83f2b`，**status=completed / conclusion=success**。

**部署后自检**（workflow 自带 + 手工复核）：
- `meta.json.generated_at` 一致性：本地 `2026-07-21T12:31:04+00:00`，线上（cache-bust）同值，`OK：线上 meta.json 与仓库一致，部署已生效`（数据零改动，此值本轮不应变，核实无误）。
- `curl -I https://chunqiu.timechorus.com/` → `200 OK`。
- 收款码资源生产可达性：`curl -I https://chunqiu.timechorus.com/assets/support/alipay-qr.png` → `200 OK`，`Content-Length: 136844`；实际下载比对字节数与仓库内 `site/assets/support/alipay-qr.png` 完全一致（136844 字节），非降级/损坏资源。
- 生产 URL：`https://chunqiu.timechorus.com/`（自定义域名） / `https://quinnyxu.github.io/chunqiu/`（GitHub Pages 默认地址，workflow `page_url` 输出）。

**交接**：Xu 后续将在生产站实扫一笔最小额完成最终验收（收款码本身的可扫性/收款到账不在本轮工程侧验证范围内，工程侧仅确认资源可达、字节完整、UI 三形态渲染正确）。

## 7. 补记：支持弹层标题小改合入（2026-07-26 深夜，续 r18）

领队追加裁定：Xu 放行标题小改，立即合入。Vision 提交 `bb3491f`（支持弹层标题「支持本站」→「支持本站·支付宝扫一扫」，桌面弹层 `#support-title` ＋手机抽屉 `openDrawer` 标题两处同步；配句一字未改、图片未碰、结构未动）。

**分支位置核实**：`git log`/`git branch --all --contains bb3491f` 确认 `bb3491f` 父提交为 `5da301a`、仅存在于本地 `main`，与上一轮（`6f83f2b`）同样的偏差——Vision 报告的落地分支（`r17-play-engine-merge`）与实际提交位置不符，**该分支自我上轮合入后未再收到新提交**（tip 仍是 `3e4cf43`）。核实为线性历史，无需 `--no-ff` 合并，直接 push 即可。

**质量门**（两项，未强行合入）：
- `python tools/validate.py` → `OK：全部校验通过`
- `node --check site/app.js` → exit 0

**部署**：`git push origin main`（`5da301a..bb3491f`）→ GitHub Actions「Deploy site to GitHub Pages」**run `30230150229`，headSha `bb3491f`，status=completed / conclusion=success**。

**部署后自检**：`meta.json.generated_at` 本地/线上一致（`2026-07-21T12:31:04+00:00`）；`curl -I https://chunqiu.timechorus.com/` → `200 OK`。本轮为纯文案改动，无新增资源，未额外做资源可达性核验（任务书已注明无需要）。

### ⚠ 需 Xu/领队裁定的异常：工作区存在未提交的收款码图片改动

在核对 `bb3491f` 期间，`git status` 发现 `site/assets/support/alipay-qr.png` 存在**未提交的工作区改动**（`git diff --stat` 显示 `Bin 136844 -> 88209 bytes`），且**不属于 `bb3491f` 提交内容**——`bb3491f` 提交信息明确写「图片未碰」，`git show bb3491f --stat` 也确认该提交未触及此文件。

- 已提交版本（`main` HEAD，136844 字节）：完整收款码卡片，含「你敢收 我敢随」头图、收款人昵称文字（形如"喜欢摄影(**斌)"）、二维码本体、"设置金额/保存图片/更多设置"按钮行。
- 工作区当前版本（未提交，88209 字节）：**内容不同**——仅二维码本体＋通用灰色人形头像占位符（无昵称文字、无头图、无按钮行），像是被替换成了另一张更简化/脱敏的二维码图。
- 文件 mtime（2026-07-26 21:28:33 -0400）落在 `5da301a`（21:11:10）与 `bb3491f`（21:30:53）两次提交之间，推断是 Vision（或其他并发写入方）在该窗口期本地改动了此文件，但**未纳入 `bb3491f` 提交、也未单独提交**，与其"图片未碰"的自述矛盾。

**本轮处置**：此改动**未随 `bb3491f` 推送到 main**（该提交本就不含此文件，push 的是已提交的 `bb3491f` 本身，不影响此项）。我未擅自提交或丢弃这处工作区改动——图片内容变化涉及"收款码是否为同一收款账户"的实质问题，非纯前端文案范畴，超出本次任务书授权范围，按"疑点记录上报、不自行裁量"处理，改动原样保留在工作区，留待 Xu/Vision 核实：是这张新图才是应上线的正确版本（例如出于隐私脱敏考虑替换昵称），还是误操作/测试残留。**在明确裁定前，未改变 main 上任何已部署的收款码图片**，生产站当前收款码仍是 `6f83f2b` 提交的原图（已在上轮核验字节数与 `alipay-qr.png` 136844 字节一致）。

## 8. 已知问题 / 交接备注

- 本轮数据零改动，`data/csv/`、`site/data/*.json` 均未触碰，`tools/csv_to_json.py` 未重跑（无需要）。
- `tools/qa/package-lock.json` 已入库以固定 Playwright 版本（`^1.47.0` 声明对应本次实测锁定版本），后续如需升级请连带更新 lock 文件重跑首验。
- Playwright 首次使用需下载 chromium 二进制（约 192MB，需联网），CI/无网环境如需跑 QA 截图，需提前在有网环境执行 `npm run install-browser` 或改造为可离线复用的二进制缓存路径，本轮未做该项，如后续 CI 要接入截图门禁，需另行评估。
- CLAUDE.md 称谓改动（Xiangtao→Xu）范围仅第 12 行「排程与裁定权在领队与 Xu」一处，未见文中其他位置残留旧称谓（已 grep 复核）。
- 打赏入口 `6f83f2b` 实际提交位置（直接在本地 `main` 之上）与任务书所述（`r17-play-engine-merge` 分支）不符，已在 §6 记录核实结论（内容无遗漏，仅描述偏差），供留痕，不影响本轮验收。
- 收款码图片 `site/assets/support/alipay-qr.png` 属 Vision 提交内的本地资产，非外链，符合红线6「零运行时依赖」；生产可达性与字节完整性已核验（见 §6），图中收款人昵称/收款码本身的真实性与到账由 Xu 实扫验收，非工程侧核验范围。
- **⚠ 待裁定**：工作区存在未纳入任何提交的 `alipay-qr.png` 改动（136844→88209 字节，内容不同，疑为脱敏或误操作），详见 §7 末尾，未推送、未影响生产，待 Xu/Vision 核实后再处置。
