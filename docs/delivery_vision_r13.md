# 交付说明 · Vision · r13

发布后第一轮真实读者反馈（Xiangtao）落地：容器统一律 + 关系图放大查看 + 手机资料库点卡即达详情。
前置：无（数据零改动；文案零改动）。改动面限于布局与交互层。

## 一、真凶定位（写在最前）

Xiangtao 反馈 1/2/3「视图撑破容器 / 横向滚动」的根因不是 SVG，而是 **CSS 网格轨道 blowout**：
窄屏人物卡网格用 `grid-template-columns: 1fr`，而 `1fr = minmax(auto, 1fr)`，其 `auto` 下限取
网格项的 **min-content**；r12 起人物卡各行改单行截断（`white-space:nowrap`）后，min-content = 整段不折行文本
（实测单卡被撑到 **1135px**，把整个 `<main>` 顶宽、全站横向溢出）。`overflow-x` 只能藏滚动条、藏不住
内容溢出（`document.body.scrollWidth` 仍 1303）。**根治 = `minmax(0, 1fr)`**（轨道下限归零）。
三处 `min-width:640px` 的 SVG 强撑＋横滚是第二层问题（逼读者手动缩放），一并移除改 fit-to-width。

## 二、改动清单（全部在 site/）

- `site/styles.css`
  - **容器统一律**：`:root` 新增 `--content-max:1240px`、`--content-pad:1.2rem`（窄屏 0.8rem）；
    页眉 / 人物子导航 / `<main>` / 页脚一律用 `--content-pad` 作左右留白，移动端左右边界对齐；
    `<html>` 与 `<body>` 加 `overflow-x: clip`（clip 不建立滚动容器，国别选项卡 `sticky` 仍生效）。
  - **网格根治**：三处单列网格 `1fr` → `minmax(0, 1fr)`（窄屏 `.person-grid`、`.home-state-panel .person-grid`）；
    桌面基准列 `minmax(280px,1fr)` → `minmax(min(280px,100%),1fr)`（容器窄于 280 时列宽退让）。
  - **SVG fit-to-width**：删除窄屏 `.home-map / .map-canvas / .rel-canvas` 的 `min-width:640px` 与
    `overflow-x:auto`；首页地图 `svg { max-height:60vh }`（载入即按容器宽取景，高度封顶）。
  - 硬化两处地图浮层宽度 `max-width: min(300px|320px, calc(100vw-3rem))`（免责说明、无地望计数）。
  - 资料库手机端详情「× 返回列表」条（吸顶青绿条幅，桌面 `display:none`）＋详情加载高亮渐隐
    `@keyframes lib-detail-flash`。
- `site/index.html`
  - 关系图工具条增「⛶ 放大查看」按钮 `#btn-rel-zoom`；全屏浮层提示条加 `id=map-overlay-hint`（供关系态改文案）。
- `site/app.js`
  - **关系图放大查看**：新增通用手势绑定 `bindZoomGesture(svg, state)`（拖移/滚轮/双指缩放，与地图
    `bindPanZoom` 同逻辑）＋ `zClamp/zSvgPoint`；`openRelOverlay/closeRelOverlay` 复用地图全屏浮层
    `#map-overlay`。关系图为**克隆**入浮层（内嵌图原位不动、recenter/看连线交互不受影响，全屏态纯取景细看），
    开屏用 `getBBox` 框到图形内容外接框。`closeOverlay()` 统一分发，ESC 一并关闭。
  - 资料库：`lib-item` 点击回传源卡片；`showLibDetail(r, srcCard)` 在窄屏加「返回列表」（滚回原卡并聚焦，
    列表未重绘故滚动位置天然保留）＋平滑滚动至详情＋高亮渐隐。桌面双栏分支不变。

## 三、六档自查结论（CDP 实测，Chrome headless）

判据比验收更严：同时校验 `documentElement.scrollWidth` 与 `body.scrollWidth`（后者能穿透 `overflow-x:clip`
看见真实内容溢出）均 ≤ `innerWidth`。

- **360 / 390 / 414 / 680px** × 全视图（首页地图模式、首页列表模式、时间线、人物地图、ego 关系、
  全景关系、资料库、关于）：全部 `scrollWidth == body.scrollWidth == innerWidth`，**全站无横向滚动**。
- 四档 × 关系图开「放大查看」全屏浮层：无溢出、浮层正常打开。
- 四档 × 手机资料库点卡：无溢出，「返回列表」`display:block`（可见）。
- 标题栏为常规文档流、恒在页顶；任何操作后仍在屏内。
- 桌面 1280px：八视图 `body.scrollWidth 1265 ≤ 1280`，**资料库「返回列表」`display:none`、双栏 `flex-direction:row` 不变**——桌面零变化确认。

功能回归（390 手机口径 + 1280 桌面，均实测通过）：
- 首页地图 fit-to-width：容器 362 == svg 362、内部横滚 0（免手动缩放）✔
- 关系图全屏：滚轮缩放实测 viewBox 由 `0 0 1128 546` → `84.6 40.9 958.8 464.1`（缩放生效）；ESC 关闭 ✔
- 内嵌关系图 `touch-action:auto`（不拦截页面滚动）✔
- 全站搜索（「临淄」得 11 条）✔ / 分享卡对话框开启无溢出 ✔ / 时间线事件展开无溢出 ✔
- 旧链接 `#person=P_WENJIANG&view=timeline` → `#/p/P_WENJIANG/timeline` 就地改写 ✔

## 四、约束核对

零依赖、相对路径、键盘可达（新增按钮均为原生 `<button>`，ESC/Tab 可达）、不用 localStorage、
数据与文案零改动。设计定稿 `design_notes.md` 未涉结构性新元素，本轮不改版本（沿用 v1.4）。

## 五、验收偏差上报

无。四档全站无横向滚动、首页地图载入即适配、关系图可全屏细看、手机资料库点卡即达并可返回、桌面零变化，均已实测达标。

## 六、遗留与建议（不改，仅记录）

- ego 关系图侧组多时纵向 viewBox 偏高，全屏开屏虽已按内容外接框取景，顶部仍留白（图形集中于下半）；
  可细看无碍，若日后要更贴合可在 ego 布局阶段裁掉空行——属布局算法调优，非本轮范围。
