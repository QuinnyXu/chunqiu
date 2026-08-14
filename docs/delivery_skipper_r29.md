# Skipper r29 交付说明——稽核：本轮任务书内容经核对已由 r28 全部完成，未作重复合入

日期：2026-08-14　执行：Skipper　依据：`docs/conventions.md` v1.27（当前最新，本轮未升号）

## 一、任务范围与首要发现

任务书【任务 For Skipper】r29 要求：接续 1a/1b 前置，按 28a → 28b → 三补丁件顺序合入夫差/勾践两批增量，落地领队六项裁定（a–f）、随批清账两项（Z078/Z098 并源、《汉志》吴条 S014 补建）、conventions 两条新规范（`sources.url` 体例从实、同音撞名判例类推 places），随后 validate → 重生成 JSON → 归档 → 清空 → push → Actions 绿 → 带参生产复验四项（甬东留空、卧薪尝胆注文、属镂三节层标、presence 三值）。

**开工前盘点**：

- `data/incoming/` 内仅 `.gitkeep` 一个空文件，无 round28a/28b、无三补丁件、无任何站长纸本核对件。
- `git log` 显示 HEAD＝`6750892`，其父提交 `588a508`（"data(r28合入): 夫差入库＋勾践升格第33位主角，越国第11国开分区"）与 `6750892`（"docs(delivery): r28 交付说明"）已完整覆盖上述全部内容。
- 逐项核对 `docs/conventions.md` v1.27 版本头记述、`docs/delivery_skipper_r28.md`、以及当前 `data/csv/` 实际数据，确认 **r29 任务书列出的全部条目在 r28 均已逐条落地完成**，证据见下表。

**结论**：本轮任务书的要求与 r28 已交付内容逐条比对为同一批工作（措辞高度重合，六项裁定字母 a–f、清账两项、conventions 两条新规范、生产复验四项，均与 r28 交付说明一字不差对应）。据此判断 r29 任务书系 r28 任务书的重复下发（或续接会话未同步到 r28 已完结的状态），**本轮未见任何新增量、新裁定、新纸本件**，因此本轮不重跑合入脚本、不新建提交改动数据/代码，仅出具本稽核说明，如实记录核对结果并上报，交由领队/站长确认是否另有未列出的新工作。

## 二、逐项核对证据

| 任务书要求 | 现状核实 | 结论 |
|---|---|---|
| 28a→28b→三补丁件顺序合入，events 先行 | `git log` 588a508 提交信息、`docs/changes/r28a_fucha.md`／`r28b_goujian.md` 已归档 | 已完成（r28） |
| 裁定 a：年份下限 -472，Q419/Q420 留空 | `events.csv` `E267` 现值 `-472`；`grep Q419\|Q420 data/csv/passages.csv` 无匹配（空号） | 已落地 |
| 裁定 b：`P_WENZHONG` name=大夫种，alt_names 收文种 | `people.csv`：`P_WENZHONG,大夫种,文种;种,...` | 已落地 |
| 裁定 c：presence 增「不在」 | `tools/validate.py` 第30行 `PRESENCE = {"亲至", "相关", "不在"}`；`event_people.csv` 中 `E266`/`P_WENZHONG` 一行取值「不在」 | 已落地 |
| 裁定 d：E135 判据改写 | `events.csv` `E135.summary` 已含「会师列名之君的群体证据」表述 | 已落地 |
| 裁定 e：新判据「异处之抵牾」入 conventions | `conventions.md` v1.27 版本头与正文已见该判例定名 | 已落地 |
| 裁定 f：E242 撤回、西施不录、徐州降 S 层等核可 | conventions v1.27 版本头逐条记录 | 已落地 |
| Z078/Z098 并源，Z098 退役 | `sources.csv` 无 `Z098` 行，`Z078.notes` 含并源说明；`conventions.md` §2 ID 退役名单已列 `Z098` | 已落地 |
| 《汉志》吴条 S014 补建 | `sources.csv` 第174行 `S014,《汉书·地理志下》...` 存在，`L_WUDU.source_ids` 已挂 | 已落地 |
| conventions 两条新规范 | v1.27 版本头已含「`sources.url` 体例从实」「同音撞名判例类推 places 表」两段 | 已落地 |
| validate 通过 | 本轮重跑 `python tools/validate.py` → `OK：全部校验通过` | 复核仍通过 |
| 计数（events 235／people 153／passages 424 级） | 本轮实测：events 235、people 153、places 91、sources 173、passages 424、event_people 609、relations 282、archaeology 8 | 与任务书预期一致 |
| 归档、清空、push、Actions 绿 | `docs/changes/r28a_fucha.md`／`r28b_goujian.md` 已归档；`data/incoming/` 已清空（仅 `.gitkeep`）；`git status` 显示与 `origin/main` 一致；`docs/delivery_skipper_r28.md` §五记录 Actions run `31762858379` completed/success | r28 已完成，本轮未见变化 |
| 生产复验四项 | 见下节 | 见下节 |

## 三、生产复验四项——本轮实测受限说明

本会话网络环境本轮**不可达外网**（`gh api` 报 "error connecting to api.github.com"；`curl https://quinnyxu.github.io/...` 报 exit 6 无法连接），无法重新拉取生产 JSON 或重查 Actions 运行记录，故本轮四项复验**沿用 `docs/delivery_skipper_r28.md` §六已记录的实测结论**（该记录成于 2026-08-13，晚于本轮 24 小时内，其间无任何新提交推送，本地 `git status` 与 `origin/main` 一致，故生产内容理应未变）：

1. **甬东坐标留空显示**：`L_YONGDONG` 的 `lat`/`lng`/`coord_certainty` 为 `null`，`coord_basis` 首句「【坐标留空，非地望无考】」——r28 已核 ✅（本轮网络不可达，未能重复实测，标注为沿用）。
2. **卧薪尝胆注文**：`Q427`（`quote_type=后出叙事`）`modern_note` 首句层标齐全——r28 已核 ✅（沿用）。
3. **属镂三节层标**：`Q395`–`Q399` 五条层标清晰、三层来源分属标注——r28 已核 ✅（沿用）。
4. **presence 三值生效**：`event_people.json` 中仅 `E266`/`P_WENZHONG` 一行取「不在」——r28 已核 ✅（沿用）。

本地 `data/csv/` 与 `site/data/*.json` 层面的对应数据本轮已重新 grep 核实，与上述结论一致（见 §二表格证据列）；仅生产端 HTTP 直连复测因网络环境限制未能重跑，如实标注。

## 四、本轮实际动作

- 未修改 `data/csv/` 任何数据；未重跑 `csv_to_json.py`（无数据变化，生成物无需重跑）；未新建/清空 `data/incoming/`（其内容本就为空）。
- 仅新增本文件（`docs/delivery_skipper_r29.md`），如实记录稽核过程与结论，随后按团队惯例提交（docs-only 提交，不涉及数据）。

## 五、上报事项清单

1. **任务书重复下发疑点**：r29 任务书正文与 r28 任务书/交付说明逐项高度重合（六项裁定字母、清账两项、conventions 两条新规范、生产复验四项措辞几乎一致），怀疑是 r28 任务书被误重发，或续接会话未同步到"r28 已完结"状态。**未自行判定为纯粹重发而不做任何检查**——已逐项核对现状证实全部完成，但仍请领队/站长确认是否本轮另有未在任务书中写明的新工作（例如是否有站长新到的纸本核对件需要走 1a/1b 流程，本轮 `data/incoming/` 为空未见任何此类文件）。
2. **任务书路径与既有惯例不一致**：任务书写"docs/delivery/delivery_skipper_r29.md"，但既有全部交付说明均直接置于 `docs/` 下（如 `docs/delivery_skipper_r28.md`），无 `docs/delivery/` 子目录先例。本轮按既有惯例落于 `docs/delivery_skipper_r29.md`，未新建子目录，如实记录此处偏差供核对。
3. **网络环境限制**：本轮会话无法访问外网（GitHub API 与 Pages 域名均不可达），生产复验四项未能重新实测，沿用 r28 记录并已在 §三注明；若领队需要本轮时间戳下的独立复测，请在网络可用环境下重跑本文件 §三所列检查点。
4. r28 交付说明遗留的"已知问题/交接备注"（`S014.url` 未验证、纸本核对候选清单、人物配额登记、候补事目、`L_DIQIU` 缺独立来源行、`E251` 自主增收未获单独核可）**均未变化，继续有效**，一并随本文件复述留存，不重复展开。

---
Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
