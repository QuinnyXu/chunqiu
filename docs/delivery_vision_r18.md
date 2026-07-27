# 交付说明 · Vision r18（全屏播放控件定稿 · 交会常亮 · 速度定稿 · 状态机测试更新）

分支：`r17-play-engine-merge`（续 r17/r17b）。**数据零改动、不新增依赖**（新测试仅用 Node 标准库＋项目自身 app.js）。改动文件：`site/app.js`、`site/index.html`、`site/styles.css`、`tools/test_binguan_play.js`、`docs/design/design_notes.md`（v1.10→v1.11）、本文件。`node --check` 通过、`python tools/validate.py` 通过、`site/data/` 未动。

## 〇、连续两轮全屏控件未交付——真实根因（坦诚）

先坦白核实结果，不回避：

- **【r18 勘误，2026-07-26】** 本节初稿称「r17 首轮任务书未含此项」，**与存档不符，特此订正**：r17 任务书第三节**确含**全屏播放控件项（原文「随迁『播放/暂停』与速度档为悬浮控件」），台账以任务书原文为准。故事实是：**r17 该项在范围内但我未实现、也未进自验清单**（并非「不在范围」）；r17b 我才写入代码但只在 jsdom 自验。此订正**不改变主因结论**——连续两轮控件未真正落地的主因仍是下面两条的 jsdom 盲区（把「jsdom 绿灯」误当「真机可用」、视觉/触达类未列真机必验），与「r17 是否含此项」无关。
- **构建时点**：全屏「播放/暂停」悬浮控件 **r17 已在任务书范围内但我未实现、未列入自验**，直到 **r17b** 才写入代码（`#overlay-controls`＋`setupOverlayControls`）。
- **r17b 的真实问题**：我在 r17b 写了 `#overlay-controls`＋`setupOverlayControls` 并**只在 jsdom 里自验**（确认元素存在、点击委托、状态同步都通过），据此报「已交付」。但 **jsdom 不做真实布局、绘制与命中测试**——它能证明控件的**逻辑**，证明不了它在真机上**可见、可点、不被遮挡**。于是「控件在真机上到底出没出现、能不能按」这件事，**从未真正进入我的自验闭环**。领队的自查猜测——「全屏浮层只随迁字幕条，控件迁移从未进入你的自验清单」——**基本属实**：我把「字幕随迁」验到了，却把「控件的真机呈现」漏在闭环之外。
- **系统性根因一句话**：**我把「jsdom 绿灯」误当成「真机可用」**。凡是纯视觉/布局/触达类的要求（悬浮控件的可见性、热区、遮挡、层叠），jsdom 给不出证据，而我此前没有为这类要求单列「真机必验」项、也没有在无浏览器环境下用更接近渲染的手段去逼近它。这是我验证方法上的盲区，不是「忘了做」——r17b 代码在，但验收标准（真机可见可点）我没有对齐。
- **本轮整改**：① 把全屏控件列为头号项，按「单人/并观 × 桌面/手机」四组合逐项自验（见二）；② 明确区分「已用非浏览器手段证实的部分」与「必须真机确认的部分（可见性/热区/遮挡）」，后者写入真机清单不含糊；③ 控件定稿为最简（仅播放/暂停，速度按钮已按裁定删除），减少出错面。

## 一、全屏播放控件（定稿）

- 位置：`#map-overlay` 左下角 `#overlay-controls > #ov-play`（`site/index.html`）。速度定稿后**仅一枚「播放/暂停」按钮**。
- 落位与热区：`position:absolute; left/bottom:14px`（手机 10px）、`z-index:8`、`min-height:44px`、生绢底＋浮起投影；不遮轨迹与图例（图例在内嵌态，全屏浮层内不含图例）。
- **状态无缝双向同步的实现**：`#ov-play` 点击**委托**对应模式的主按钮（`$("#btn-play").click()`／`$("#cmp-play").click()`），复用其 onclick 闭包与播放状态；任何 play/pause 切换都经 `setPlayBtnText(mode,txt)` **同时写主按钮与 `#ov-play`**。故：全屏中暂停→退出后主按钮仍是暂停态；内嵌暂停→进全屏 `#ov-play` 显示暂停态。开全屏时 `setupOverlayControls` 先把 `#ov-play` 文案对齐当前主按钮，保证进入即同步。
- 显隐：`openOverlay`/`openCmpOverlay` 调 `setupOverlayControls(mode)` 显示并接线；`closeOverlay`/`closeCmpOverlay` 调 `hideOverlayControls()` 隐藏。无轨迹（主按钮 disabled）则控件不显。

## 二、四组合自验（缺一不收）——逐项结果

自验手段：`node --check`＋**jsdom 端到端**（真实 DOM 加载 app.js＋本地数据，切 `matchMedia` 模拟手机断点）。**说明真机限度**：jsdom 不渲染布局/绘制/命中，故以下四组合我证实的是「控件在该组合下**存在、显现（hidden=false）、点击委托生效、播放状态双向同步**」；**像素级可见性、44px 触达热区、左下角是否遮挡**属渲染层，jsdom 给不出，已单列真机项（见六）。

| 组合 | 控件显现 | 点击→播放 | 再点→暂停 | 状态双向同步 | jsdom 结论 |
|---|---|---|---|---|---|
| 单人 × 桌面 | hidden=false，`▶ 轨迹按时间播放` | ov-play/btn-play 同「⏸ 暂停」 | 同「▶ 继续播放」 | 退出全屏后主按钮仍暂停态 | **通过** |
| 单人 × 手机（matchMedia 680) | hidden=false | 同步为「⏸ 暂停」 | — | ov-play↔btn-play 同写 | **通过** |
| 并观 × 桌面 | hidden=false，`▶ 按年并观` | ov-play/cmp-play 同「⏸ 暂停」 | — | 主/浮层同写 | **通过** |
| 并观 × 手机 | hidden=false | 同步为「⏸ 暂停」 | — | 主/浮层同写 | **通过** |

（四组合 jsdom 实测日志见提交自验；均无运行期错误。）

## 三、交会表现层简化（裁定1）——常亮改造

- **移除**：`holdUntil` 自动停拍机制**整体退役**（`playerFrame`/`player` 状态/各 cfg 钩子内的 hold 全部删除）；`.cmp-meet.pulse` 脉冲动画与 `@keyframes cmpPulse` 移除。
- **常亮语义**：`comparePlayCfg.onStart` 调 `cmpResetLit()`——给并观 svg 加 `.cmp-play-active`（进入播放态）并清除上轮 `.lit`。beat 命中（`cmpFireMeetingBeat`）只给该交会点加 `.lit`（**常亮**，无 setTimeout 清除、无脉冲）。CSS：播放态下未点亮者 `opacity:0.34`＋隐标签（**待亮态**，视觉可区分）、已点亮者 `.lit` 恢复满不透明＋加重描边＋显标签。
- **不打断**：beat 只加类、不设 hold，主钟连续推进；同年多处交会（泺694、临淄694）在相邻帧顺次点亮，**自然连续、无停顿**（状态机实测相邻帧最大年跳 0.333 年，有界无冻结突进）。
- **留痕与重置**：播完（`onFinish`）保留 `.lit`（常亮留痕）；离开/重置（`onStop→cmpCleanup`）移除 `.cmp-play-active` 与 `.lit`，交会点回常态。
- **保留**：交会一览侧栏、点击跳转、免责句（B3）、「相邻记载 / 可能相遇」分辨全部原样保留（在侧栏 `cmpBuildSidebar` 与弹卡 `cmpShowMeetings`，未触碰）。

## 四、速度定稿（裁定2）——删改清单

- 删除 HTML 速度按钮：`#btn-speed`（单人工具条）、`#cmp-speed`（并观工具条）、`#ov-speed`（全屏浮层）。
- 删除 JS：`PLAY_SPEED_KEY`、`playSpeed()`、`setPlaySpeed()`、`speedLabel()`、`refreshSpeedBtns()`、`bindSpeedBtn()` 及其在 `renderMap`/`renderCompare`/`setupOverlayControls` 的三处调用；`player.speed` 字段移除。
- 引擎：新增常量 `PLAY_SPEED = 0.5`（唯一速度），`playerFrame` 内 `elapsed += min(Δt,100ms) × 0.5`；单人与并观同速。
- localStorage：`boot()` 增一次性 `localStorage.removeItem("cq_play_speed")` 清理旧用户的速度键（try/catch 包裹）。
- 复核：全仓 `grep` 无 `playSpeed/bindSpeedBtn/cq_play_speed/*-speed` 残留（除本删改说明与清理注释）。

## 五、状态机测试更新（tools/test_binguan_play.js）

断言改为 r18 语义：**每个交会点【点亮帧】，两标记所在段 place_id == 交会 place_id（即两标记确在交会地），且该交会点被点亮（`.lit`）**；并校验播完全部常亮、播放全程无停拍（相邻帧年跳有界）。合成 Δt 驱动【真】`playerFrame`（`requestAnimationFrame` 桩为 no-op）。输出（`node tools/test_binguan_play.js`，退出码 0）：

```
== 并观状态机测试（r18 常亮·无停拍）：P_WENJIANG × P_QIXIANG ==
交会点（按 sc 序）：
  sc=0  泺(L_LUO)  锚年=前694  含同场
  sc=1  临淄(L_LINZI)  锚年=前694  含同场·相邻记载
  sc=2  禚(L_ZHUO)  锚年=前692  含同场
  sc=3  祝丘(L_ZHUQIU)  锚年=前690  含同场
  sc=4  防(L_FANG)  锚年=前687  含同场

驱动帧数=316，点亮顺序=0→1→2→3→4，相邻帧最大年跳=0.333（无停拍→有界、无冻结突进）

各交会点【点亮帧】断言（两标记所在段 place_id == 交会 place_id 且该点点亮）：
  ✓ sc=0 泺 前694 | 甲(847.8,143.1)在交会地 | 乙(847.8,143.1)在交会地 | 点亮=是
  ✓ sc=1 临淄 前694 | 甲(939.5,129.9)在交会地 | 乙(939.5,129.9)在交会地 | 点亮=是
  ✓ sc=2 禚 前692 | 甲(829.4,151.7)在交会地 | 乙(829.4,151.7)在交会地 | 点亮=是
  ✓ sc=3 祝丘 前690 | 甲(945.9,272.2)在交会地 | 乙(945.9,272.2)在交会地 | 点亮=是
  ✓ sc=4 防 前687 | 甲(868.2,245.0)在交会地 | 乙(868.2,245.0)在交会地 | 点亮=是

结论：5 处交会点，点亮 5 处，结束后全部常亮=是，断言全过=是
TEST PASS
```

## 六、回归与真机待复测清单

**已自验（非浏览器手段）**：
- 单人（晋文公线）：jsdom 全屏内 `ov-play` 起播、标记行进、暂停/退出状态无缝；单人引擎逐段/终点归位不受本轮影响（r17 数学仿真仍适用）。
- 并观（文姜×齐襄公）：全程五点顺次常亮、无停拍、无脉冲、播完留痕（状态机测试＋jsdom 双证）。
- 内嵌↔全屏播放状态同步：四组合 jsdom 通过。
- 无速度按钮、`cq_play_speed` 已清、速度 0.5×：jsdom 实测。

**真机待复测（Xiangtao；均为 jsdom 给不出证据的渲染/触达层）**：
1. **全屏控件真机可见性**（头号）：四组合下 `#ov-play` 是否真的显示在左下角、是否被 SVG/图例遮挡、`z-index` 层叠是否如期。
2. **触达热区**：手机上 44px 热区是否够大、点按是否灵敏、是否误触地图拖移。
3. 交会常亮观感：待亮（淡）↔常亮（实）对比是否清晰可分；同年双点（泺→临淄）连续点亮的视觉节奏是否自然。
4. 单人晋文公线、并观文姜×齐襄公各真机全程一遍：0.5× 速度观感、无卡死、切后台回来不突进。
5. 四档宽度（窄手机/宽手机/平板/桌面）下工具条换行与全屏控件落位。

## 七、需上报领队的事项（只记录不裁量）

- **验证能力边界**：本环境无法真机渲染（Claude in Chrome 扩展未接入），凡「悬浮控件可见性/热区/遮挡」这类渲染层要求，我只能证到「逻辑与状态」层，真机确认必须由 Xiangtao 兜底。这是本次连续遗漏的根因，也是我后续对「视觉/触达类」要求的固定处置：**逻辑自验 + 真机项显式化**，不再以 jsdom 绿灯代替真机可用。若团队能提供一个可截图的真机/无头浏览器渠道，我可将此类项也纳入自验闭环。

---

# 交付说明续 · Vision r18（打赏入口：支持本站 · 支付宝单通道）

前置确认：`site/assets/support/alipay-qr.png` 已到位（Xu 放入，约 134KB）。Xu 裁定**仅支付宝单通道、不做 PayPal**，遵此实现。数据零改动；收款码为**本地资产、非外链**，站点零运行时依赖红线不破；`validate` 通过、`node --check` 通过。改动文件：`site/index.html`、`site/app.js`、`site/styles.css`、`site/assets/support/alipay-qr.png`（入库）、`tools/qa/screenshot_support_ui.js`（QA 截图脚本，新增）。

## 一、按钮落位与样式（主入口）
- 位置：首页底部分享行（`.footer-share`，站点全局底栏）的**首位**新增 `#btn-support`「支持本站」，其后为原「生成分享卡 / 复制链接 /（直接分享）」。
- 样式：较三个分享按钮**突出一档**——朱砂实底（`--cinnabar`）＋白字，前缀一枚生绢小圆点（`.btn-support-dot`，徽记小点意象）。**守气质**：不闪烁、不加角标、不做浮窗常驻；hover 仅加深底色。截图实测按钮尺寸约 99×33px。
- 全站其余页面**无打赏元素散落**：打赏元素仅三处——全局底栏主入口、关于页次级一行、模态弹层（默认 hidden）；任何内容视图（时间线/地图/关系/资料库）内均无打赏元素。

## 二、弹层 / 抽屉复用
- **桌面**：居中弹层 `#support-overlay`（镜像 `.share-overlay` 模式：`position:fixed` 居中、半透明遮罩、`width:min(20rem,100%)`）。
- **手机（≤680px）**：**复用既有底部抽屉** `openDrawer("支持本站", node)`（同地点详情/交会详情所用组件），内容节点由 `supportContentNode()` 现建。
- 分流：`openSupport`（`initSupport` 内）按 `matchMedia("(max-width:680px)")` 决定走抽屉或居中弹层。
- 关闭三路：点遮罩外部 / `✕` / `ESC`（桌面经新增 `supportDialog` 接入既有 ESC 链、置于 shareDialog 之前；手机经 `drawer.open` 既有 ESC 分支）。焦点：开时聚焦关闭钮、关时归还触发元素；桌面 Tab 圈定在关闭钮。
- 卡内内容：收款码图 `assets/support/alipay-qr.png`（`alt="支付宝收款码·经纬春秋"`）＋配句一行，**不另加任何说明文字**。

## 三、配句核对（一字不差）
卡内配句：**「感恩支持，庭燎之光，以待君子」**——`site/index.html`（`.support-blessing`）与 `site/app.js`（`SUPPORT_BLESSING` 常量，手机抽屉用）两处一致；QA 脚本运行时回读 `.support-blessing` 文本亦为该句，逐字核对无误、无多余文字。

## 四、关于页次级入口（保留）
原占位「支持链接（筹备中）」改为**安静一行次级入口**：`.support-line` 内 `#support-link`（`.support-link-btn`，内联文字按钮、朱砂字带下划线，气质低调不与主入口争显眼度），点击走**同一** `openSupport`。保留不删。

## 五、截图出图结果（复用 tools/qa Playwright 渠道）
新增 `tools/qa/screenshot_support_ui.js`（范式同 `screenshot_playback_ui.js`：本地零依赖静态服务器＋Playwright chromium；预置 `localStorage.chunqiu_tour_v1` 免首访引导蒙层拦截点击）。输出 4 张至 `tools/qa/screenshots/`（该目录 `.gitignore`，属易变 QA 产物、不入库）：

| 文件 | 内容 | 结果 |
|---|---|---|
| `support-footer-desktop.png` | 首页底部「支持本站」主入口（朱砂实底＋小点，首位） | ✓ |
| `support-dialog-desktop.png` | 桌面居中收款码弹层（收款码＋配句） | ✓ 配句回读「感恩支持，庭燎之光，以待君子」 |
| `support-drawer-mobile.png` | 手机底部抽屉（复用 openDrawer） | ✓ |
| `support-about-secondary.png` | 关于页安静一行次级入口 | ✓ |

四张均出图成功、视觉核验通过（收款码清晰、配句无误、按钮突出且守气质、抽屉复用无异）。重跑：`cd tools/qa && node screenshot_support_ui.js`（部署后可设 `QA_BASE_URL` 对生产地址复测）。

## 六、待 Xu 处置事项
- **实扫一笔最小额**（验收项，需真机/支付宝 App）：QA 截图能证收款码图片正确渲染，但「能否扫、扫出的是否 Xu 本人收款账户、金额是否到账」只有 Xu 实扫可验——请 Xu 用支付宝扫 `support-dialog-desktop.png`（或线上）确认一笔最小额。若二维码内容/账户有误，只需替换 `site/assets/support/alipay-qr.png` 同名文件即可，无需改代码。
- **底栏作用域**：站点底栏（含分享行与本支持按钮）为全局底栏，随所有 hash 视图常驻（既有设计，非本轮引入）；「主入口在首页底部」按此落在全局底栏首位。若 Xu/领队希望支持按钮仅首页可见，属底栏作用域调整，请明示，另起微调（本轮按既有底栏行为落位，不自行改动底栏显隐规则）。
