# 交付说明 · Vision · r12

首页地图化改造 + 三新主角（武姜/祭仲/齐僖公）配套 + 人物子导航升格。
前置：round9 已合入部署（33e2ac9），线上主角 12 人、people 59、events 106、relations 122。

## 设计小记

- 新增：`docs/design/home_map_notes.md`（首页地图导航布局与交互定稿）。
- 更新：`docs/design/design_notes.md` → v1.4（十二主角主题色表补三色；三徽记条目；
  hash 结构补 `#/?home=list`；新增 §5.8 首页地图导航、§6 子导航升格）。

## 改动清单

代码/资源（全部在 site/）：
- `site/index.html`：首页 section 增地图导航容器（`#home-hero`＝底图＋列国人物面板，
  `#home-list-block`＝分组列表）与「列表/地图模式」切换按钮；关于页版本条 → v0.9。
- `site/app.js`：
  - PROTAGONISTS 增齐僖公/武姜/祭仲三条（主题色＋徽记；武姜 `home:"郑"` 覆盖分区）；
  - STATE_EPITHET 补齐底图七个无主角国的气质注；新增 HOME_BADGE_POS 徽记簇布局锚点；
  - hash 层：首页模式参数 `home=map|list`（parseHash/buildHash，记忆走 hash，**不用 Web Storage**）；
  - renderHome 分模式；新增 buildHomeMap（海报化底图＋国家热区＋徽记簇）、pickHomeState、
    resetHomePanel；personCardLi 信息列加 `card-info` 类（统一截断）；
  - 分享卡色签注释由「九主角」改「主角（数量自适应）」——canvas 已按 PROTAGONISTS 循环，自动扩为 12 签。
- `site/styles.css`：首页地图导航样式（`.home-hero/.home-map/.home-state/.home-cluster` 等，
  桌面地图模式隐列表、窄屏两者纵排）；人物卡统一尺寸（min-height 8.5rem＋各行单行截断）；
  人物子导航升格（人物名 1.08rem 主题色粗体、徽记 24px、未激活标签用正文玄墨、bar 留白加大）。
- `site/assets/map/base_map.svg`：色块与国名加 `data-state`（供热区绑定）；新增**晋**色块＋
  国名（核心区按投影落 x≈147–172）与**汾水**（北来南折入河，走向合真实地理）。
- 新徽记（48×48 线描、currentColor，同旧九枚语言）：`badge_wujiang.svg`（掘地及泉）、
  `badge_jizhong.svg`（执圭秉政）、`badge_qixi.svg`（载书入坎）。

无数据改动（未动 data/、site/data/、tools/）；validate.py 通过（数据合入是 Skipper 职责）。

## 各验收项实测（本地 python http.server + Chrome headless 实拍）

- **首页地图可点国进人**：桌面点国 → 右侧面板列该国统一人物卡 → 点卡进时间线；
  无主角国点出「国名 · 气质注——人物线整理中」。四国徽记簇（齐4/鲁3/郑4/晋1）落位无碰撞。✔
- **列表模式可切换**：标题行按钮切 map/list，hash 落 `#/?home=list`，刷新保持；旧链接 `#/`、
  `#person=…` 行为不变（Node 路由harness 12 例全 PASS，含 legacy 改写）。✔
- **卡片全站统一尺寸**：列表视图 12 卡等高，缺生卒的武姜不塌高；简介/姓名行单行截断。✔
- **子导航对比度达标**：人物名主题色加粗放大，未激活标签由淡墨 `#7A7166` 深至玄墨
  `#2E2A24`（红圈问题消除），激活态深底白字不变。✔
- **三新主角全流程**：齐僖公（8 事件，时间线/地图 4 站轨迹/ego 皆可用）；祭仲（ego 图见
  拥立[郑昭公/郑厉公]与敌对/被谋[郑厉公 badge2、雍纠]两类边，关系卡列全 7 条）；武姜（时间线
  4 条——数据侧现状，非前端问题；ego 见夫/子/子三边）。三色对绢帛底实测 5.7–7.5:1、配白字 ≥6.6:1。✔
- **搜索含三新主角**：三人 is_protagonist=1，自动入搜索索引，命中直达其时间线（沿用 r11 逻辑，
  仅索引源扩容）。✔
- **手机端同屏纵排**：390px 下底图在上（横滚，SVG min-width 640）、国别选项卡＋分组列表在下，
  同屏纵排；点无主角国走底图下状态行提示。✔
- **分享卡/关于/资料库无退化**：分享卡色签自适应为 12；关于版本条更新；资料库、地图页底图
  参数未变（海报化仅作用于首页 buildHomeMap）。✔

## 已知问题 / 验收偏差上报

1. **og-card.png 仍显九色签**：`site/assets/og/og-card.png` 为预生成静态社交缩略图（含旧九主角
   色阶），本轮未重生成——仓库内无 og-card 生成脚本（tools/ 下仅 csv_to_json/validate/oneoff_qr），
   且约定「预生成静态资源」由专门流程产出。页面内的品牌卡图注、分享卡 canvas 均已动态含 12 人；
   仅此张静态图待后续以生成流程刷新。不影响站内功能。
2. **武姜时间线 4 条**：属数据侧现状（任务书已言明，非前端问题），前端如实渲染。
3. 首页地图徽记簇位置为美术布局锚点（HOME_BADGE_POS），非史料落点；史料地点仍一律走
   conventions 投影公式（人物地图不受影响）。

## 部署

提交并 push 后确认 Actions 全绿（含 validate 守卫与部署后 meta.json 自检）。
- 提交：`9babe2b`（main）。
- Actions run 29667381076：**success**，含 validate 守卫、部署、部署后 meta.json 自检全过。
  （唯一注记为 runner 侧 Node 20 弃用提示，属 GitHub 基础设施层，与本站无关。）
