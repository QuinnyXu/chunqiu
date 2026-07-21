# 经纬春秋 · chunqiu

**A sourced, structured database of Chunqiu-era (Chinese Spring and Autumn period, 8th–5th c. BCE) historical
figures — timelines, maps, and relationship graphs woven from *Zuo Zhuan*, *Guoyu*, and *Shiji*, with every
event traceable to a primary source.** Static site, no backend, no build step. Code is MIT-licensed; the
underlying dataset is CC BY 4.0 — see [License](#许可) below.

以《左传》《国语》《史记》为经纬，缀连春秋人物的时间、行迹与关系——可考订的时间线、活动地图与关系图谱，条条有出处。

[![许可：代码 MIT](https://img.shields.io/badge/code%20license-MIT-blue)](LICENSE)
[![许可：数据 CC BY 4.0](https://img.shields.io/badge/data%20license-CC%20BY%204.0-lightgrey)](DATA_LICENSE.md)

<p align="center">
  <img src="site/assets/og/og-card.png" alt="经纬春秋——左传为经，诸书为纬，牵系有据" width="600">
</p>

## 访问地址

- **主站**：<https://chunqiu.timechorus.com>（Cloudflare Pages，绑定自定义域名，2026-07-18 起为主入口）
- **镜像**：<https://quinnyxu.github.io/chunqiu/>（GitHub Pages，`.github/workflows/pages.yml` 自动部署，作为镜像与构建产物自检用途）

两端部署的是同一个 `site/` 目录，内容一致；分享卡、og 图等对外链接一律用主站地址，GitHub Pages 地址仅作内部验证与兜底访问。Cloudflare Pages 部署配置见 [docs/deploy_cloudflare.md](docs/deploy_cloudflare.md)。

## 这是什么

一个面向大众的春秋早期历史科普站：目前以**十四条人物线**为骨架（文姜、齐襄公、齐桓公、齐僖公、鲁隐公、鲁桓公、鲁庄公、郑庄公、郑昭公、武姜、祭仲、晋文公、秦穆公、楚成王），提供可考订的事件时间线、活动地图、人物关系图谱与史料摘录，持续增补中。数据以 CSV 为唯一数据源（source of truth），经脚本生成 JSON 供静态站直接读取——没有数据库、没有后端、没有构建步骤。

## 功能一览

- **人物线时间线**：按年编排的事件卡，标可靠度（high/medium/low）、亲至/相关判定，点开见原文摘录与出处。
- **活动地图**：按经纬度投影落点的历史地图，实心点＝亲至、空心点＝相关而未到场，轨迹只连亲至；列国底色为艺术化示意，非考据疆界。
- **人物关系图谱**：以任一人物为中心的 ego 图，或全景关系网络，标亲属/婚姻/君臣/敌对等八类关系。
- **资料库**：背景知识、考古条目、史料来源三个分表，可独立检索浏览。
- **全站搜索**：一框检索人物、地点、事件、原文摘录，键盘可达。
- **分享卡生成器**：为任一人物线生成可分享的图卡（两种尺寸），支持扫码直达、复制链接、原生分享。
- **首访引导**、深色模式、移动端适配、无障碍（键盘导航、ARIA 标注）。

## 数据方法论（摘要）

完整规范见 [docs/conventions.md](docs/conventions.md)，这里摘要四条贯穿全库的编辑纪律：

1. **可靠度三级标注**（`reliability`/`certainty`）：`high` 可作骨架直接使用；`medium` 宜复核后使用（多为追叙、纪年推算或异说并存）；`low` 只作线索，不可直接当事实。
2. **亲至与相关从严判定**（`event_people.presence`）：只有史文明书其人身在事发地（会、盟、战、朝、奔、生卒于其地）才标"亲至"；师行而君不亲、使者代行、称疾不往等一律标"相关"——宁严不滥。
3. **坐标考订三级依据**：谭其骧《中国历史地图集》通说 → 杨伯峻《春秋左传注》→ 其他历史地理著作，逐级降级并注明所据；确址无考者宁愿坐标留空（"宁降不虚"），不为凑图而臆造。
4. **多源分层**：《左传》经传原文与《史记》等更晚文献的戏剧化情节（如"射钩佯死""匹马只轮无反者"）严格分层标注（原文 / 言论 / 评论 / 诗歌 / 后出叙事 / 经义异闻），不与当代记事混写；来源前缀区分左传（Z）、史记（S）、国语（G）、考古（A）、诗经（P）、现代研究（B）、公羊传（Y）、穀梁传（L）等，条条可溯源。

## 数据规模

以下数字取自最近一次生成的 [`site/data/meta.json`](site/data/meta.json)，**随各轮史料合入持续增长**，请以该文件的实时内容为准：

| 表 | 行数 |
|---|---|
| events（事件） | 121 |
| people（人物） | 71（其中 14 位主角线） |
| places（地点） | 66 |
| sources（史料来源） | 83 |
| passages（原文摘录） | 135 |
| relations（人物关系） | 147 |
| background（背景知识） | 11 |
| archaeology（考古条目） | 6 |

年代覆盖：**前 773 — 前 621**（鲁隐公前至秦穆公/楚成王卒年一带，仍在扩展）。

## 本地运行

只依赖 Python 标准库（3.8+），无需安装任何依赖：

```bash
python tools/validate.py       # 1. 校验数据（失败会非零退出并列出问题）
python tools/csv_to_json.py    # 2. 由 data/csv/ 生成 site/data/*.json
python -m http.server          # 3. 本地起服务，浏览器打开 http://localhost:8000/site/
```

（JSON 通过 `fetch` 加载，须经 http(s) 访问；直接双击 `site/index.html` 走 `file://` 协议会因跨域限制读不到数据。）

## 目录结构

```
data/csv/          唯一数据源（9 张表：sources / people / places / events /
                   event_people / passages / background / archaeology / relations）
data/incoming/     待复核合入的增量数据（各轮次子目录，合入后清空）
tools/             csv_to_json.py（生成 JSON）、validate.py（数据校验，仅标准库）
site/              静态站根目录；site/data/ 为生成的 JSON，禁止手改
docs/              conventions.md（项目约定，改数据/代码前必读）、design/、各轮交付说明
```

## 反馈

发现史实错误、地望存疑、或有功能建议，欢迎：

- **GitHub Issues**：<https://github.com/QuinnyXu/chunqiu/issues>
- **邮箱**：chunqiu@timechorus.com（史实纠错请附出处）

## 许可

本仓库采用**双许可**：

- **代码**（`tools/`、`site/` 下除 `site/data/` 外的所有文件）—— [MIT License](LICENSE)
- **数据**（`data/csv/`、`site/data/*.json`）—— [CC BY 4.0](DATA_LICENSE.md)（署名建议格式："经纬春秋 · chunqiu.timechorus.com"）

两份许可的适用范围与详细条款分别见对应文件；`private/`、`team/`、`.claude/` 等内部协作目录不公开发布，不适用任何公开许可。

## 致谢与主要参考

- 《春秋左传》《国语》《史记》《诗经》《公羊传》（原文外链 [ctext.org](https://ctext.org)）
- 杨伯峻《春秋左传注》
- 谭其骧主编《中国历史地图集》
- 韩茂莉等历史地理著作；曲阜鲁国故城、临淄齐国故城、郑韩故城等考古资料

本项目由多位协作者（含 AI 协作者）以角色分工方式持续维护：史料考订、工程与数据管线、可视化与前端。各轮工作详见 `docs/delivery_*.md` 交付说明。
