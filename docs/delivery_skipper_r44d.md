# Skipper 交付说明 · r44d（fix44c 回补件合入：五行页码分书＋牙城形貌间接落定＋梁城取点收紧＋术语勘正）

任务书：【任务 For Skipper】`team/round44_prompts.md` 任务 7（fix44c 合入），前置为〔2026-09-02 领队裁定 · fix44c 审毕〕节照准。

备料件：`data/incoming/fix44c/CHANGES.md`（Sophia，依 2026-09-02 站长回填四答〔附扫描图〕＋术语勘正备料），领队已审毕照准，可发合入。

**轮次编号说明**：本轮所合入之备料件目录名为 `fix44c`，与仓库既有轮次 `r44c`（对应 fix44b 之合入，见 `docs/delivery_skipper_r44c.md`）恰同形而非同事——目录名是 Sophia 一侧的备料序号，轮次号是 Skipper 一侧的交付序号，两套编号并不对齐。为免与既有 `r44`／`r44b`／`r44c`／`r45` 撞号，本轮交付文档、条文引注一律取 **r44d**。

## 一、改动清单

依 `CHANGES.md` §12 合入要点执行，无偏离：

1. **整行替换 8 行**（依 `id` 整行替换，无新增无删除）：
   - `passages.csv`：`Q442`／`Q443`／`Q446`／`Q447`／`Q448`（5 行，**各只动 `modern_note`**，纯追加）
   - `sources.csv`：`J001`／`J002`（2 行，**各只动 `notes`**，纯追加）
   - `places.csv`：`L_JIELIANGCHENG`（1 行，动 `lat`／`lng`／`modern_location`／`coord_basis`；前三者改写，`coord_basis` 纯追加）
2. `quote_original`／`quote_type`／`certainty`／`coord_certainty` 四栏**一律未动**（逐字段核对，见「二」）。
3. conventions 升 **v1.39**（见「三」）。
4. `tools/qa/*.js` **一行未改**（按 CHANGES §9 结论，见「四」实测核实）。
5. 归档 `docs/changes/r44_jiaoji_bu.md`（`CHANGES.md` 原样），清空 `data/incoming/fix44c/`。

**未执行、按令登记不办**：CHANGES §7 所载 `Q442` 照录范围再扩之判「暂缓，全句一体持有」——`quote_original` 本轮一字未动，两支预登记（① 简上之形全句照录含「＝」；② 编者排印符号则录括注不录「＝」）**只登记，不代裁不代执行**；Vision 实渲一项系条件件（俟「＝」定档若落支①方办），本件同样只登记不派不做。

## 二、逐字段核对（合入后实测）

`passages` 五行：除 `modern_note` 外五栏（`event_id`／`source_id`／`quote_original`／`quote_type`，及 `id`）全等；`modern_note` 均为纯追加（`new.startswith(old)` 且更长）。
`sources` 两行：除 `notes` 外七栏全等；`notes` 纯追加。
`places` 一行：除 `lat`／`lng`／`modern_location`／`coord_basis` 外八栏全等；`coord_basis` 纯追加；`certainty`／`coord_certainty` 实测仍为 `medium`／`medium`，未动。

`L_JIELIANGCHENG` 新值：`lat=34.95`、`lng=110.60`、`modern_location=`今山西省永济市东北（伍姓湖东北）、运城解州以西。

`Q442.quote_original` 实测未含全角「＝」，仍为「……息侯**弗訓（順）**……」原文——确认再扩之判未被误代执行。

## 三、九表行数（实测）

| 表 | 合入前 | 合入后（实测） | 判 |
|---|---|---|---|
| `sources.csv` | 179 | **179** | 全等 |
| `places.csv` | 93 | **93** | 全等 |
| `passages.csv` | 440 | **440** | 全等 |
| `events.csv` | 237 | **237** | 全等 |
| `people.csv` | 153 | **153** | 全等 |
| `event_people.csv` | 614 | **614** | 全等 |
| `relations.csv` | 282 | **282** | 全等 |
| `archaeology.csv` | 8 | **8** | 全等 |
| `background.csv` | 11 | **11** | 全等 |

与 `CHANGES.md` §2 预期（179/93/440/237/153/614/282/8/11）逐项相符，九表行数全等，无出入。

## 四、质量门实测

### 4.1 **一处如实上报**：`sim_fix44c.py` 未随附，改以 Skipper 自撰等效脚本预合入态验证

`CHANGES.md` §10.1 记 Sophia 已跑 `sim_fix44c.py`（139 PASS / 0 FAIL），任务书执行要点 6 亦令「先在预合入态跑 `python data/incoming/fix44c/sim_fix44c.py`」。**实读 `data/incoming/fix44c/` 目录，只含 `CHANGES.md`＋3 份 `fixes_*.csv`，未见 `sim_fix44c.py` 本体**——与上一轮 fix44b（`sim_fix44b.py` 随附于 `data/incoming/fix44b/`，见 `docs/delivery_skipper_r44c.md` §5.1）不同例。本轮无法「复跑」一个不存在的脚本，故**自撰等效预合入验证脚本**（覆盖 `CHANGES.md` §10.1 所述断言类别：行数不变、逐字段除目标栏外全等、目标栏纯追加、`certainty`／`coord_certainty` 不变），先于预合入态只读跑一遍确认无误，再执行实际合入；过程记此不抹平，如实报告，**请转告 Sophia 此后备料随附 `sim_*.py` 本体（同 fix44b 之例），或在 `CHANGES.md` §1 产出文件清单中一并列出**。

预合入态（未写 `data/csv/` 一字）：
```
=== PRECHECK 模式 ===
44 PASS / 0 FAIL
```
实际合入执行：
```
=== APPLY 模式 ===
44 PASS / 0 FAIL
已写入 data/csv/passages.csv, sources.csv, places.csv
```

### 4.2 合入后：`tools/validate.py`

```
$ python tools/validate.py
OK：全部校验通过
```
exit 0。

### 4.3 `csv_to_json.py` 重生成

```
$ python tools/csv_to_json.py
archaeology.csv -> site/data/archaeology.json (8 行)
background.csv -> site/data/background.json (11 行)
event_people.csv -> site/data/event_people.json (614 行)
events.csv -> site/data/events.json (237 行)
passages.csv -> site/data/passages.json (440 行)
people.csv -> site/data/people.json (153 行)
places.csv -> site/data/places.json (93 行)
relations.csv -> site/data/relations.json (282 行)
sources.csv -> site/data/sources.json (179 行)
meta.json 已生成（9 张表，年份 -773..-472）
```
exit 0，九张 JSON 行数与 CSV 一致。

## 五、conventions 升 v1.39

**实升版本号：v1.39**（`docs/conventions.md:3`）。

- **就地勘正 `docs/conventions.md:243`**（§7 v1.38 四档判据表丙档栏）：「二者并为释文正文」→「二者并为**释文**」，只此四字改二字，同行其余不动。
- **新增条文一条**：紧随 v1.38 四档判据条之后（`docs/conventions.md:258`），标题为「**体例（v1.39 新增，r44c 立，据 2026-09-02 站长术语勘正）·竹简书不称「正文」：称谓正名，兼为乙丙两档之分野**」——条文全文取自 `CHANGES.md` §6.2 拟文，逐字落笔，未删改一句。**条文标题沿用 CHANGES 拟文原句「r44c 立」（备料件立于当日之称，非本轮交付轮次号 r44d，二者不同层，一并说明）**。
- **余 25 处术语「释文正文」照留不改**（`data/csv` 9、`docs`／`team` 16），依 §10.1 承而不改；本条已在新增条文正文中明书此界。
- **版本记录**：顶部「版本：」段按体例照录本次八行改动、五行页码分书结论、`Q446` 形貌间接落定与预登记不兑现之留痕、`Q447` 维持未核、梁城取点收紧、术语正名一条、`Q442` 再扩暂缓之判与两支预登记，并注明轮次号取 r44d 以避与既有 r44c 撞号；旧 v1.38 记录整段移入「历史：」（`docs/conventions.md:4`），其余历史记录逐条依次下移，未改一字。

## 六、`tools/qa/*` 实跑核实（CHANGES §9 结论：无须改动一行）

按任务书要求，两脚本合入后各实跑一遍，核实结论是否相符：

### 6.1 `r43_prod_check.js`（生产）

```
== 21 PASS / 0 FAIL ==
```
含婢／嬖并陈可读、五鹿新点落图、`E084` 正读、简 34 著录三处可见、全库不变量（179/93/440/237）等全部 PASS，与 CHANGES §9.1「本件无须改动该脚本一行」结论相符。

### 6.2 `r44_prod_check.js`（生产）

```
== 共 15/15 PASS，0 FAIL ==
```
骊姬页 `Q073`／`Q443` 互指、息妫页 `Q161`／`Q442` 互指等既有 `includes` 断言全数继续成立，与 CHANGES §9.1「六条全施于 `modern_note` 之 `includes`，无须改」结论相符。

**结论：两脚本实测结果与 CHANGES §9 结论一致，未见不符，无须停下上报。** 一并转达 CHANGES §9.1 之自纠——任务书前置「`r43_prod_check.js` 现锁 Q442/Q448」一语与实况不符，`r43` 只锁 `Q448`（`:63`），`Q442` 之六条断言在 `r44_prod_check.js:50–56`；领队已核可 Sophia 之自纠，本轮不再重复处置，仅如实转述。

## 七、提交与部署

| 项 | 值 |
|---|---|
| 提交哈希 | `29c5410`（`29c54107f8890090d924beeb84935e33d56af102`，实测 `git log`） |
| push 结果 | 成功，`origin/main` `4de9aa6..29c5410` |
| Actions 运行号 | `33649452694`（"Deploy site to GitHub Pages"，push 触发） |
| Actions 结论 | **success**（实测 `gh run view` 回填） |

## 八、生产带参复验（须带 `?v=`，逐条实测）

**沙盒 DNS 本轮可解析 `chunqiu.timechorus.com`**，全部经 Node.js `https` 模块直连 `https://chunqiu.timechorus.com/data/*.json?v=<timestamp>`，非本地 `site/data/`。

自撰复验脚本（覆盖任务书执行要点 8 五项复验点）实跑：

```
== 复验点 1：五行【校】③ 页码著录可读 ==
PASS Q442 第五章释文页 147，逐处直答
PASS Q448 简 34 释文页 150 直答之著录
PASS Q447 两级并书（简34页150直答／简33章级）
PASS Q446 章级（释文页150、注释页151）
PASS Q443 章级（释文页150）
== 复验点 2：Q446 落档与「间接」判据之级可读 ==
PASS Q446 判据间接字样可见
PASS Q446 已核·无括注字样可见
PASS Q446.quote_original 未动（无＝符）
== 复验点 3：Q447 梁城维持未核可读 ==
PASS Q447 含「未核」字样
PASS Q447 含「维持」字样
== 复验点 4：L_JIELIANGCHENG 新坐标与双 medium 可读 ==
PASS L_JIELIANGCHENG lat=34.95
PASS L_JIELIANGCHENG lng=110.6/110.60
PASS L_JIELIANGCHENG certainty=medium
PASS L_JIELIANGCHENG coord_certainty=medium
PASS L_JIELIANGCHENG modern_location 含伍姓湖东北
== 附加：Q442 再扩暂缓——quote_original 一字未动（不含全角＝） ==
PASS Q442.quote_original 不含全角＝（支①尚未执行）
PASS Q442.quote_original 仍为「息侯弗訓（順）」原文

== 17 PASS / 0 FAIL ==
```

五项复验点逐条实测可读，**Q442.quote_original 一字未动**（不含全角「＝」）在生产环境上二次确认，与 CHANGES §7 之判相符。

## 九、仍开放的待裁 / 登记事项（本件不代裁不代改）

依 `CHANGES.md` §13，原样转呈：

- **⚑1（要项）** 「＝」之性质须一次核定——领队已交站长翻图版一问，`team/round44_prompts.md` 该节其后另有〔2026-09-02 站长再答〕与〔2026-09-02 站长二裁落定〕两段（支①落定＋显示取甲案·分层显示），**属任务 8〔任务 For Sophia · Q442 支①执行件〕之范围，非本轮任务**，本轮不预判不代改，如实记明该后续进展已见于任务书、静候后续轮次专件执行。
- **⚑2** 照录范围之则是否宜增第⑤款「形貌虽全而含性质未定之符号者全句持有」——本件不代裁。
- **⚑3** 术语勘正落地范围请核可——本件只改 conventions 一处活条文＋立承接条，已入库 CSV 25 处、归档文书 12 处一概不回改。
- **⚑4** `Q446`「无括注」系间接判据，若领队认为不足以由「未核」改「已核」，可退回维持「未核」——本件已如实标级，听裁。
- **⚑5** 解梁城取点移动（34.94／110.53 → 34.95／110.60）系据两个未经纸本核之坐标物所推，若站长以为宜守旧点、只在 `coord_basis` 记新方位而不动数，本库无异议。
- **⚑6** fix44b 遗留之 ⚑2–⚑8 七项仍开放，本件未代裁未代改。
- **Vision 实渲一项**（条件件）：俟「＝」定档若落支①，`quote_original` 首见「＝」须浏览器实渲＋窄屏换行实测；括注（）现网已由 r44c 复验覆盖，不重验。本件只登记不派不做。

## 十、已知问题 / 交接备注

- **`sim_fix44c.py` 未随附**（详「四.1」）：本轮以自撰等效脚本替代预合入验证，覆盖同类断言但条数少于 Sophia 原称之 139 条（44 条，覆盖行数／字段/纯追加/certainty 四类核心断言，未逐句核对 §4 投影回校、CAVEAT_RE 未污染等细项——此类细项已由合入后 `validate.py` 通过间接覆盖）。请领队与 Sophia 知悉此处流程缺口，供下一轮备料参考。
- `docs/changes/r44_jiaoji_bu.md` 与既有 `docs/changes/r44_jiaoji.md`（fix44b 归档件）不撞名，两文件并存，各自对应不同批次。
- 本轮提交未涉及其他待合入目录，`git status` 合入前后逐一核对，未见误碰。
- `Q442` 照录范围再扩（支①「郶（蔡）哀侯取妻於陳，賽＝（息）侯亦取妻於陳，是賽＝爲＝（息媯）」）之执行属后续任务（team/round44_prompts.md 任务 8，Sophia），本轮未涉及，`quote_original` 确认一字未动。

---

交付人：Skipper　日期：2026-09-02
