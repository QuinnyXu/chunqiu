# Skipper r43b 交付说明 —— r43 收官合入

任务书：`team/round40_41_prompts.md`「r43 收官件」节·任务 8【收官件 For Skipper · r43 收官合入】。
所据裁定：追加裁定 24（嬖字出处勘误）、25（许田案关闭）、26（§12.2 收录）、27（两路裁定编号回补）。
前置：Sophia 任务 7、7b 已交付（`data/incoming/round43_final_biai/`、`data/incoming/round43_final_xutian/`），两路 CHANGES.md 实读断言 46/46、24/24 通过，合并副本 validate exit 0 无告警，主表合入前一字未动。

## 一、合入次序与理由

**次序：biai 先、xutian 后。**

理由：两路数据面**不相交**（biai 只动 `passages.Q443`、`sources.J002`；xutian 只动 `places.L_XUTIAN`），故次序对结果无实质影响；取 biai 先、xutian 后，只是按其所据追加裁定的编号先后（追加裁定 24 早于 25）排列，与两路各自 CHANGES.md 的记账顺序一致，便于回溯核对。合入手法：以 `csv.reader`/`csv.writer` 按 `id` 整行替换，其余各表、各行**零改动**。

## 二、实读行数

合入后九表实读（`csv.DictReader` 计数，不含表头），与任务书预期逐表相符：

| 表 | 实读 | 预期 | 判 |
|---|---|---|---|
| sources | 177 | 177 | 全等 |
| places | 91 | 91 | 全等 |
| passages | 436 | 436 | 全等 |
| events | 236 | 236 | 全等 |
| people | 153 | 153 | 全等 |
| event_people | 612 | 612 | 全等 |
| relations | 282 | 282 | 全等 |
| archaeology | 8 | 8 | 全等 |
| background | 11 | 11 | 全等 |

无新增行、无删除行、无新 ID。三处字段变动均为整行替换、只落注文栏：

| 表 | ID | 栏 | 旧长 | 新长 |
|---|---|---|---|---|
| `passages` | `Q443` | `modern_note` | 2668 | 3174 |
| `sources` | `J002` | `notes` | 3314 | 3725 |
| `places` | `L_XUTIAN` | `coord_basis` | 778 | 2570 |

三处长度均以实读比对，与两路 CHANGES.md §2「九表行数断言」逐项相符。

`python tools/validate.py` 合入后复跑：`OK：全部校验通过`，exit 0，无告警。

## 三、归档与清空

先归档、后清空（按任务书第 1 项顺序执行）：

1. `cp data/incoming/round43_final_biai/CHANGES.md docs/changes/r43b_biai.md`
2. `cp data/incoming/round43_final_xutian/CHANGES.md docs/changes/r43b_xutian.md`
3. 确认两份归档文件存在后，`rm -rf data/incoming/round43_final_biai data/incoming/round43_final_xutian`

`data/incoming/` 现为空目录。`sim_biai.py`、`sim_xutian.py`、`fixes_*.csv` 等备料文件随目录一并清空（不属数据，两路 CHANGES.md 已明记其"合入时不入 data/csv/"）。

## 四、追加裁定 26 · §12.2 收录

`docs/changes/r43_zhiben2.md` §12.2「谭图引注体例与两书版次基准」五项拟文，收录入 `docs/conventions.md` §7，新增一条通例（v1.35，紧接既有「二手引述须标核对状态」一条之后，二者互指为"同一道防线之两层"）。收录时**保留了①之自限句**：郑宋卫幅之幅名已由站长照第一册目录核实；**楚吴越幅之幅名尚系沿用 r27c 以来之称谓、未照目录核**——原句一字未改。

`docs/conventions.md` v1.34 版本记录中「一项未收、登记待裁：zhiben2 §12.2……转呈领队定夺」一句**照留不删**，其后就地追加【已由追加裁定 26 收录（v1.35，r43b）】一段注记。

**一处实况核对（非阻塞，供记录）**：任务书原文写「conventions §11 中『一项未收、登记待裁』之 §12.2 条目」，落笔前查库核实——该句实际位于 v1.34 **版本记录本身**（conventions.md 第 3 行），并非 §11「待决事项跟踪」小节的独立条目（§11 现存待决事项仍是两条：越 −464 截断规则、r27c 待核 C／D 两组，均与 §12.2 无关）。已按任务书"原文不删、就地改注"的实际意图，在该句实际所在处（版本记录内）完成注记，不视为自行取舍——如与任务书文字表述有出入，一并在此上报。

## 五、conventions 新版本号

**v1.34 → v1.35**（本轮升号，2026-08-30）。新版本记录概述本轮两路合入、§12.2 收录、CLAUDE.md 两项配套；旧 v1.34 记录原样下移为历史条目，一字未动。

## 六、CLAUDE.md「任务书纪律（活文档原则）」节

该节此前已由领队写入 `CLAUDE.md`（工作目录未提交状态，`git status` 起始即显示 `M CLAUDE.md`），本轮随收官合入一并提交，提交信息注明「领队所置」。

## 七、Xu → 站长 实改处数

**实改 2 处**，与任务书所称"实测仅两处"相符（合入前已按红线复核，未发现新增）：

| 文件 | 行号 | 原文 | 改后 |
|---|---|---|---|
| `CLAUDE.md` | 12 | 排程与裁定权在领队与 Xu | 排程与裁定权在领队与站长 |
| `.claude/agents/skipper.md` | 24 | 历史重置类破坏性操作仅在领队与 Xu 明示批准时执行 | 历史重置类破坏性操作仅在领队与站长明示批准时执行 |

历史文档、`docs/changes/`、`docs/delivery_*.md`、`team/` 既有原文中的「Xu」照旧未动（那是史实，不是称谓）。

**留意**：`.claude/` 整目录属 `.gitignore` 锁定的私有层（内部材料，不入公开仓库），`skipper.md` 的改动是本地工作副本的改动，不会出现在 `git status`／提交历史中——这是仓库结构本身的既定行为，非本轮遗漏。

## 八、门与复验

### 8.1 校验与生成

- `python tools/validate.py` → `OK：全部校验通过`，exit 0，无告警。
- `python tools/csv_to_json.py` → 九表 JSON 与 `meta.json` 全部重生成，年份范围 -773..-472 不变。

### 8.2 提交与部署

（实测回填，见下方提交哈希与 Actions 表）

### 8.3 带参生产复验（`?v=` 防 CDN 缓存陷阱）

至少两条断言（任务书指定）：

1. **许田新点落图且注文可见"已关闭"与【编号回补】**——`site/data/places.json` 中 `L_XUTIAN.coord_basis` 实测含「已关闭」「编号回补」（生成物层面已核实为 True/True，见下方生产层复核）。
2. **骊姬页「嬖」出处可见《左传·庄公二十八年》与"追加裁定 24"新称**——`site/data/passages.json` 中 `Q443.modern_note` 实测含「庄公二十八年」「追加裁定 24」（生成物层面已核实为 True/True）。

生产带参复验的具体 URL、实测截图/响应结果与提交哈希、Actions 运行号，见下方「回填」小节——按 conventions §7「提交哈希与 Actions 运行号一律实测回填、不得预填」通例，将在 push 并确认 Actions 成功后据实填入，回填链截断于追记提交。

---

## 回填（push 与 Actions 之后据实填写，不预填）

- 提交哈希：`(待回填)`
- Actions 运行号与结论：`(待回填)`
- 生产带参复验 URL 与结果：`(待回填)`

---

## 交接注

站长易任，待裁三项——② J 层 `quote_original` 回改抑或另立校记体例、③ 梁城是否即解梁城、⑤ 莘案婢案互指——移交新任站长，倾向与全部背景见 `team/HANDOVER.md`。

本件所落之追加裁定 24–28 去向：

- **追加裁定 24**（嬖字出处勘误）：落于 `passages.Q443.modern_note`、`sources.J002.notes`，本轮随 biai 路合入正式落库。
- **追加裁定 25**（许田案关闭）：落于 `places.L_XUTIAN.coord_basis`，本轮随 xutian 路合入正式落库。
- **追加裁定 26**（§12.2 收录）：落于 `docs/conventions.md` §7 新通例（v1.35），并就地注记 v1.34 版本记录中「一项未收、登记待裁」句。
- **追加裁定 27**（两路裁定编号回补）：由 Sophia 任务 7b 已落地于两路 CHANGES.md 与注文正文（编号回补段），随本轮两路合入一并落库，本轮未另行处置。
- **追加裁定 28**（Sophia 断言自纠处置核可）：属 Sophia 侧 QA 装置修正事项（`sim_biai.py` 断言改措辞、不改数据），不涉主表内容，本轮合入未涉及该脚本本体（脚本随 incoming 目录清空，不入 `data/csv/`）。

## 已知问题

- Xu → 站长改动中，`.claude/agents/skipper.md` 因目录被 `.gitignore` 锁定，改动不会体现在本次提交历史中，供后续会话知悉。
- 任务书所称"§11 中"的 §12.2 待裁条目，实况核对后确认其实际位于 conventions.md 版本记录（非 §11 小节内），已按"原文不删、就地改注"的意图就地处置，并列于本文档"四、追加裁定 26 · §12.2 收录"节供核。
