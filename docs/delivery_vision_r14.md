# 交付说明 · Vision · r14

Xiangtao 反馈第二批落地：人物卡简介两行＋全文浮层、滚动复位、事件卡「可点」暗示、首访三步引导。
前置：无（数据零改动；史料文案零改动）。本轮起 localStorage 解禁（领队备案 3），仅用于首访标记。

## 一、改动清单（全部在 site/）

- `site/index.html`
  - 新增 `#card-pop`（人物卡简介全文浮层）与首访引导蒙层 `#tour`（hole＋pop＋跳过/下一步）。
  - 关于页版本条 → v0.10，加「重看引导」按钮 `#tour-replay`，补 v0.10 更新条目。
- `site/styles.css`
  - 人物卡简介：`p` 从单行改 `-webkit-line-clamp:2`（含 `@supports` max-height 回退）；
    窄屏 media 解除截断、`display:block` 完整显示，卡高随内容微调。新增 `.card-pop` 浮层样式。
  - 事件卡：summary 加 `flex-wrap`、`.evt-hint`（自成一行落右下角，CSS 依 `has-quote`/`[open]` 切
    「原文 ▾ / 详情 ▾ / 收起 ▴」）；`.event:hover` 微浮阴影、`summary:hover/:active` 底色加深。
  - 首访引导样式：`.tour`（通栏底板拦点击）、`.tour-hole`（`box-shadow 0 0 0 100vmax` 铺暗＋暖赭描边）、
    `.tour-pop`/`.tour-step`/`.tour-text`/`.tour-actions`、`.tour-replay`。
- `site/app.js`
  - 人物卡：`personCardLi` 于桌面简介截断时 hover/focus 弹 `#card-pop`（`showCardPop` 仅当
    `scrollHeight>clientHeight` 才弹——手机端不截断故自动不弹）；`hideCardPop` 于 render、scroll 时清。
  - 事件卡：`det` 依有无 passages 加 `has-quote` 类；summary 追加 `.evt-hint` 空 span（文案走 CSS）。
  - 滚动复位：`history.scrollRestoration='manual'`＋`scrollMem`（hash→离开时滚动位）；render 末尾
    前向导航回顶、popstate（后退/前进）按 scrollMem 恢复；搜索直达本视图不动，交 consume* 定位。
  - 首访引导：`startTour/showTourStep/placeTour/drawTourHole/tourNext/endTour/repositionTour`；
    boot 末仅在「未看过且落首页」时启动；`TOUR_KEY='chunqiu_tour_v1'`；Esc 跳过、Tab 圈定跳过/下一步、
    Enter 由聚焦的「下一步」原生触发；resize/scroll 重定位高亮孔。

## 二、滚动复位根因（写进交付，Xiangtao 反馈 2）

**真凶＝Chrome 的自动 scroll restoration。** CDP 实测：视图切换时 render 已把 scrollY 置 0
（`scrollTo(0,0)` 生效、读回为 0），但浏览器在 hash 导航后**异步（约 120ms 后）把旧滚动位置补回来**——
即「切视图仍停在原处」。逐一排除：`overflow-anchor:none` 无效、`scroll-behavior` 临时置 auto 无效、
同步/rAF/setTimeout 三段回顶均被其覆盖。**根治＝`history.scrollRestoration='manual'` 自管**：前向导航
回顶，后退/前进按自存的 `scrollMem` 恢复（用户可见结果与「浏览器自然恢复」一致，仅实现方式改为自管）。

## 三、四档自查结论（CDP headless 实测，判据 body.scrollWidth 与 documentElement 双查）

- **360 / 390 / 414 / 680px** × 全视图（首页两模式、时间线、地图、ego、全景、资料库、关于）
  ＋关系全屏＋资料库点卡：全部 `scrollWidth ≤ innerWidth`，**全站无横向滚动**（沿用第 10 轮硬指标）。
- 人物卡两行截断（桌面 `-webkit-line-clamp=2`）；桌面 hover/focus 弹全文浮层（截断卡才弹）；
  手机端简介 `line-clamp:none`、完整显示、未截断。
- 事件卡 `.evt-hint`：有原文 = 「原文 ▾」、展开 = 「收起 ▴」（实测切换）。
- 滚动复位：前向切视图/切人 scrollY→0；后退恢复原滚动（实测 back→600）；person 切换→0。
- 首访引导：清 localStorage 后 full reload 弹步一「点一个国，选一个人」并高亮齐国；下一步→步二（文姜
  时间线首卡**实际展开**，firstOpen=true）；步三高亮子导航「三面看一个人」、按钮转「开始探索」；
  完成后 `chunqiu_tour_v1='1'`、再刷不弹；关于页「重看引导」重放；Esc 跳过。
- 桌面 1280：八视图无溢出、资料库「返回列表」`display:none`、双栏不变——桌面零变化保持（r13 起）。
- R13 功能回归全绿：关系全屏缩放、内嵌图不拦滚动、搜索、分享卡、时间线展开、旧链接改写。

## 四、约束核对

零依赖、相对路径、680px 可用、键盘可达（引导 Esc/Enter/Tab；卡片 focus 同 hover 效）；
localStorage 仅存 `chunqiu_tour_v1` 首访标记，**不存任何用户数据**；数据与史料文案零改动。

## 五、验收偏差上报

无。桌面 hover 见全文、手机卡内完整简介、进人物从时间线顶部起、事件卡「原文 ▾」常驻、
清 localStorage 刷新出三步引导、跳过后不再弹、关于页可重看——均已实测达标。

## 六、遗留与建议（不改，仅记录）

- `scrollMem` 以 hash 为键，同一 hash 在不同时刻的滚动位会相互覆盖（近似）；本站视图有限，实测无碍。
- 首访引导仅在「落首页」触发；深链入站者不打扰（设计如此），如需对深链也引导可后续再议。
