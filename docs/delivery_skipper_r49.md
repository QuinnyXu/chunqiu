# 交付 · Skipper r49 —— round49_kongzi（孔子线批乙）合入与诸裁落笔

任务：`team/round49_prompts.md` 任务 4〔任务 For Skipper · r49 合入〕，前置〔领队裁定 · r49 批乙与引擎支线（2026-09-08）〕、〔2026-09-07 领队裁定·二项事实更正〕、〔2026-09-07 站长裁定 · 任务 1 报告二裁〕三节。轮次编号已核 `docs/delivery_skipper_r48.md` 为现有最高号，本件取 **r49**（未被占用）。

## 〇、开工前实读与分支处置

工作区开工时停在 `engine-split` 分支（引擎支线遗留，HEAD `429fa81`），`data/incoming/round49_kongzi/` 为未跟踪目录。第一动作切回 `main`（`ba02a9c`），`site/engine/`、`site/config.json`、`site/strings/`、`site/index.html` 的改载随分支切换消失（它们只提交在 `engine-split` 上，非本件所属，未触碰、未合并、未推送）。`engine-split` 分支本轮一字未动。

实读 `data/incoming/round49_kongzi/CHANGES.md`（400 行）全文与 `team/round49_prompts.md`〔领队裁定 · r49 批乙与引擎支线（2026-09-08）〕一.1–一.8＋二、〔2026-09-07 领队裁定·二项事实更正〕、〔2026-09-07 站长裁定 · 任务 1 报告二裁〕全文。基线核实：HEAD `ba02a9c`，`docs/conventions.md` 当时为 v1.41；九表行数实读 `events 258／passages 477／sources 193／people 166／event_people 649／relations 286／places 96／archaeology 8／background 11`，与 CHANGES 基线声明相符。

Sophia 自查复验：`python data/incoming/round49_kongzi/sim_kongzi.py` 在本次实际合入前重跑一遍，**1590 PASS 0 FAIL exit 0**，与 CHANGES §13 所录结果一致（Skipper 独立复验，非转述）。

## 一、批乙数据合入（`CHANGES.md` §12 要点）

写脚本对七张主表执行：六表纯 append（`events_new.csv`／`passages_new.csv`／`sources_new.csv`／`event_people_new.csv`／`relations_new.csv`／`places_new.csv`），两表定点整行替换（`fixes_people.csv` 之 `P_KONGZI`、`fixes_events.csv` 之 `E265`／`E285`），另加一处修正建议三之手工新增行（`E176` 补挂 `P_KONGZI`）。合入后逐表行数：

| 表 | 合入前 | 合入后 | CHANGES 预期 | 判 |
|---|---|---|---|---|
| events | 258 | **265** | 265 | 相符（+7，append `E296`–`E302`；另 `E265`／`E285` 整行替换，不改行数） |
| passages | 477 | **506** | 506 | 相符（+29，append `Q495`–`Q523`） |
| sources | 193 | **195** | 195 | 相符（+2，append `Z133`／`G013`） |
| people | 166 | **166** | 166 | 相符（`P_KONGZI` 整行替换，不新增） |
| event_people | 649 | **673** | 672＋1 | 相符——CHANGES 预期 672 系批乙 23 条挂链之数；本件另按修正建议三追加 `E176`／`P_KONGZI` 一行（相关／`indirect`），672+1=**673** |
| relations | 286 | **289** | 289 | 相符（+3，`R304`–`R306`，皆以 `P_KONGZI` 为 `person_a`） |
| places | 96 | **97** | 97 | 相符（+1，`L_DAYE` 大野，坐标三栏俱留空） |
| archaeology | 8 | 8 | 8 | 不变 |
| background | 11 | 11 | 11 | 不变 |

**新 ID 段实际用量**：events `E296`–`E302`（7 个，网段 `E296`–`E315` 内，余 `E303`–`E315` 未占）；passages `Q495`–`Q523`（29 个，网段 `Q495`–`Q560` 内，余 `Q524`–`Q560` 未占）；sources `Z133`（接台账尾号，前一 `Z132`）／`G013`（接台账尾号，前一 `G012`）；relations `R304`–`R306`（接台账尾号，前一 `R303`）——均在网段内、未逾界、无缺号。

**`fixes_events.csv` 定点比对**：`git diff` 逐字段核实 `E265`／`E285` 两行**只 `source_ids` 一栏变化**（各追加 `;G013`），其余十一栏逐字不动，与 CHANGES §3.3 声明一致。

**`P_KONGZI` 升格逐栏核实**：`is_protagonist` 0→**1**（数据侧主角 33→**34**）；`alt_names` 增「尼父」；`role` 改「鲁司寇；夹谷之会相礼，自称从大夫之后」；`active_years_bce` 改「前525-前479」；`id`／`name`／`xing`／`shi`／`ming`／`zi`／`state`／`birth_year_bce`／`death_year_bce` 九栏逐字未动（核对与 CHANGES §4.1 声明一致）。

## 二、E300（西狩获麟）presence 改判——依领队裁定一.8 落笔，四处自限文字转理据

Sophia 备料原判 `E300`／`P_KONGZI` presence 为「亲至」（观、取二事俱其亲身之行），领队裁定一.8：**「亲至」之据须落在事发地之明文（或如 `E282`「下」字之史文地理含义），而观麟之地传不书，行动明文而无地者不得当亲至，此判一体贯彻**，改判「相关」。本件按此意见落笔，**四处自限文字照留、转为「相关」之理据**（不删 Sophia 原写的自限句，只调整其推出的结论）：

1. `events.E300.summary`——追加一段裁定说明，presence 结论落在此。
2. `passages.Q510.modern_note`——【presence】节标题由「亲至，及其一处自限」改「相关，及其一处自限」，正文改写为：行动明文俱在而事发地无明文，故从严标「相关」。
3. `event_people`（`E300`／`P_KONGZI`）——`directness` 由 `direct` 改 `indirect`，`presence` 由 `亲至` 改 `相关`，`role_in_event` 改写理据。
4. `places.L_DAYE.coord_basis`——末段「presence 虽标『亲至』」改「presence 从严标『相关』」，理据同上。

**presence 通例增判例一句**（引 `E300` 为例）已入 `docs/conventions.md` §7（详见下节）。

**presence 三值最终实测**（本批 23 条挂链，含改判）：**亲至 8／相关 14／不在 1**（原 Sophia 备料 9／13／1，`E300` 一条由亲至转相关后 8／14／1）。合入后 `P_KONGZI` 全库挂链实测（`grep ,P_KONGZI, data/csv/event_people.csv`）：**亲至 7／相关 17／不在 1，合 25**（含既有 4 条 `E195`／`E198`／`E199`／`E274`、批乙 20 条、`E176` 修正建议三 1 条）。

## 三、诸裁落笔（`docs/conventions.md` v1.41 → v1.42）

版本历史条目（`docs/conventions.md:3`）已写入本轮合入全貌，旧 v1.41 条目原样移至「历史」行，未回改一字。§7 新增三处：

1. **拟文一·预叙／追叙／逆叙三器各立其名**（判例，引 `E296`／`E277`·`Q462` 为首例），照 Sophia 拟文逐字落笔，仅将「升下一号」替换为「v1.42」。
2. **拟文二·`T` 层来源行须著录材料层年代与去事之距**（通例，据裁定备案 2·丙案），照 Sophia 拟文逐字落笔，仅版本号替换。
3. **presence 从严通例增判例一句**（引 `E300` 为例，据领队裁定一.8）——紧接既有 presence 从严通例之后，说明「亲至」须落在事发地明文、行动明文不足以代之，此判一体贯彻不为个案开口。

`conventions.md` 本轮共增三条判例／通例，与任务书「拟文一、二入 §7」「presence 通例增判例一句」逐字对应。

**修正建议一至四落笔**：

- **修正建议一**（`Z130.notes` 追记）：原句「……本批不摘录，留待批乙挂靠本骨架」照留不删，末尾追加【r49 追记】一段，说明批乙实行为单立 `E301` 而非挂靠 `Z130` 所系之骨架、及其理由。
- **修正建议二**（`Z110.notes` 追记）：原句「……是否据本篇回填由领队另裁（本件不动）」照留不删，末尾追加【r49 追记·事实错就地勘正】一段，说明该句系 r27b 备料当时之状态、`death_year_bce` 已于 r27 回填、句已失实。
- **修正建议三**（`E176` 补挂 `P_KONGZI`）：新增一行 `event_people`（`role_in_event`＝「《左传》系其评语：『民之多辟，無自立辟，其洩冶之謂乎』（追记之断）」，`directness=indirect`，`presence=相关`），照拟文落笔。
- **修正建议四**（`T003.notes` 重写）：照 Sophia 拟文整段替换，补著录《论语》成书之世与去所记之事之距（§7 v1.42 丙案条文②之落实首例）。

## 四、站长二裁三处落笔——`design_notes.md`／`kaoding_kongzi.md`，皆就地勘正加注、原文照留

**`docs/design/design_notes.md`（v2.9 → v2.10）**：

1. **§2.5 徽记条增「胡簋定档·腹带明确不取·不向心内收」**——新增一段（非改写既有徽记条目），记孔子上线徽记（第 34 主角）定甲案（簋）、两条限制及其理据、定稿候 r49 任务 5。
2. **§2.5.1 双尺度补第三档 18px**——新增一段，说明首页地图国色块徽记簇（呈现边长 18）为唯一无姓名场所、判据反最严，条二措辞由「双尺度」改「三尺度」。
3. **§2.0「唯一逐人通道」措辞据实收窄**——原表格与原文一字不改，紧接其后新增一段加注，区分首页簇（一处无名，辨识全压徽记形）与其余五处（子导航、选人卡、时间线人物 chip、ego 图节点、全景环节点，徽记为姓名之外的第二通道）。

三处均标注出处（`team/round49_prompts.md` r49 任务 1 报告与随后的站长裁定），`site/` 一字未动（本件不代绘徽记 SVG，候任务 5）。

**`docs/kaoding_kongzi.md`（无版本号体例，⚑7「考订件原文不动」自限，故用就地加注法，不设版本行）**：

1. **§3.2 ④「鲁组现 5 主角」勘正为实 4**——表格原文照留，其后新增加注：孔子上线为鲁组第 5 人（非「第六人」），源出误将文姜计入鲁组（文姜首国为齐，两处口径均归齐弧）。
2. **§3.2 ③「≈46.50px」勘正为「46.50 viewBox 单位」**——表格原文照留，其后新增加注：46.50 系 SVG viewBox 内部单位而非 CSS px，附屏上换算（1440 宽 40.16px、375 宽 16.16px），并说明原判「几何上无碍」不因量纲之误而变。

## 五、QA 计数同步（`CHANGES.md` §12.2）

- `tools/qa/r43_prod_check.js:68–71` 四条全库不变量由 `sources=193/places=96/passages=477/events=258` 改为 **`195/97/506/265`**，注释同步改「r49 round49_kongzi 孔子线批乙合入后基线」。
- `tools/qa/vision_r46.js:343` 检索引文组总量断言由 `477` 改为 **`506`**，说明文字同步。

**本轮未执行**：两文件均为**生产**/**本地服务器**带参复验脚本（`r43_prod_check.js` 硬编码 `BASE = https://chunqiu.timechorus.com/`；`vision_r46.js` 默认打 `http://127.0.0.1:8791` 但依赖 Playwright）。本仓库运行环境未装 `playwright`（`node -e "require.resolve('playwright')"` 报 `MODULE_NOT_FOUND`），且**本件依令不推 main**，生产站点仍是 r48 前基线，此刻对生产跑该脚本只会得到与本件无关的失败。**如实报告：本轮只完成断言文本与说明文字的同步，两脚本之实际执行（本地 Playwright 走查、生产带参复验）候站长口令推送后另行执行并追记**，与 `docs/delivery_skipper_r48.md`「回填交付文档自身提交哈希」一类追记先例同一处置。

## 六、验证门

1. **仓库根 `python tools/validate.py`**（合入前）：`OK：全部校验通过`。
2. **正式合入**（写脚本 append＋整行替换＋修正建议三新增行，见上）。
3. **仓库根 `python tools/csv_to_json.py`** 重生成：九表 JSON 逐一核对行数与预期一致（`events 265／passages 506／sources 195／people 166／event_people 673／places 97／relations 289／archaeology 8／background 11`），`meta.json` 同步。
4. **仓库根 `python tools/validate.py`**（合入后）：`OK：全部校验通过`，exit 0，无告警。

**顺手规整一处**：`Edit` 工具改写 `docs/design/design_notes.md` 后，该文件工作树整体被写成 CRLF 行尾（930/930 行，`git diff` 报 CRLF 警告；`.gitattributes` 已锁 `*.md text eol=lf`，`git add` 时本会自动规整），为免工作树留有不一致行结尾，已直接对该文件做 CRLF→LF 规整（照 r47 先例），规整后 `git diff --stat` 内容行数不变，`validate.py` 复验仍 OK。`data/csv/` 七张主表本轮合并脚本全程以 `lineterminator="\n"` 写入，逐一实测确认全部 LF-only，未触发同类问题。

## 七、归档与清空

`docs/changes/r49_kongzi.md`（`CHANGES.md` 原样，`diff` 核实逐字相同）与 `docs/changes/r49_kongzi_sim.py`（`sim_kongzi.py` 原样，`diff` 核实逐字相同）先提交入库，`data/incoming/round49_kongzi/` 随后清空（仅剩 `data/incoming/.gitkeep`）——顺序符合 §10.1 归档纪律。

**写作向备注转存**：`CHANGES.md` 附注区五行（`people/P_KONGZI`、`events/E300`、`events/E302`、`events/E298`、`passages/Q511`）已转存 `private/writing_notes.csv`（该文件属 `.gitignore` 锁定的私有层，转存动作不会出现在 `git status`／提交历史中，这是仓库结构本身的既定行为）。

## 八、roster 缺口（数据 34／前端 33）——照裁明记

`P_KONGZI.is_protagonist` 升格后，数据侧主角数 33→**34**；`site/app.js` 之 `PROTAGONISTS` 名册**本件未动，仍 33**（实测 `PROTAGONISTS` 数组条目数 33，未见 `P_KONGZI` 字样）。此为**领队裁定〔r49 批乙与引擎支线〕三·合入排期**「取先合数据之路」的直接结果：现库本有「数据 29／前端 27」一类既容态先例（r26 实账，`app.js:88–89` 注释所记），roster 缺口属既有行为之新实例、非新缺陷类，65 行已验之料不为图待画而押；补齐候 **r49 任务 5**（Vision，胡簋定稿与三档复测，过裁后另出「34 席升位件」加 `PROTAGONISTS`、接徽记、首页簇 4→5）。**存续期间实际表现**：前端 `protoRoster()` 会 `console.warn` 报出数据侧与前端侧不一致，此为**预期行为、不作报警处理**（领队裁定明文）；本轮未起本地服务器逐屏走查，`site/app.js` 一字未动，故该 warn 的实际触发未在本轮以浏览器复核，留待任务 5 或下一轮前端走查时一并核验。

## 九、承接登记与待裁池（本件不代裁不代改）

领队裁定〔r49 批乙与引擎支线〕一.1–一.7 已就 `CHANGES.md` §10 上报一至七逐条采纳（评-16 挂 `E221`、语-6 挂 `E265` 且孔子不立挂链、`E285` 取「不在」、`E290` 取「相关」、单立 `E301`、`fixes_events.csv` 二行整行替换、`state` 维持单一「鲁」），已随本件数据落地，不再另行登记为待裁。以下承接项列 `docs/changes/r49_kongzi.md` §10「另二项非本件可决而须登记者」及任务书〔承接登记〕节，本件原样移交：

1. **记-5（昭二十卫齐豹之乱语琴张）presence 裁定「相关」在案而骨架未立**——俟卫齐豹之乱骨架入库时适用，建议列入下一骨干批「必」目。
2. **评语账中段（僖至昭）骨架缺口十一处**——十一条评语无骨架可挂，其中九条属僖至昭之世，非定哀年段；分批之形所致，登记待排。
3. **《国语·鲁语下》五章报缺**（语-1 季桓子穿井获羊、语-2 至语-5 敬姜四章）——无骨架可挂，如实报缺不造骨架；语-2 至语-5 是《左传》《国语》两书中孔子称许女性之全部（四处），登记免其日后被读作「本库不收」。
4. **`Q179` 之 `quote_type`「言论／评论」档待议**——与本批八条评语档不一致，登记待议，不随本件（改档牵动软检口径，俟评语账整批清点时并议）。
5. **`P_KONGZI.state` 从严维持单一「鲁」，与「主角线宜见其行迹」之直觉相反**——已登记（§4.5／§10 上报七），本轮数据据此落笔，不另裁。
6. **前端 34 席升位**——候 r49 任务 5 过裁后另件（`PROTAGONISTS` 加 `P_KONGZI`、徽记接线、首页簇 4→5）。
7. **胡簋定稿 SVG**——候 r49 任务 5，定稿画出后须按 design_notes §2.5.1 三档原样重跑一次。
8. 引擎支线（任务 3／6）与本件并行无碍、独立分支、独立交付（`delivery_skipper_r49_engine.md`），本件不涉及、`engine-split` 分支一字未动，特此在交付文档中写明其在另一枝。

## 十、不推 main，待站长口令

依任务书第 5 项「不推 main 待站长之word——站长口令后推」，本件**只提交，不 `git push`**。`engine-split` 分支同样不推送（本轮未触碰该分支）。

## 改动文件清单

- `data/csv/{events,passages,sources,people,event_people,relations,places}.csv`（append／整行替换，行数见上表）
- `site/data/{events,passages,sources,people,event_people,relations,places,meta}.json`（`csv_to_json.py` 重生成）
- `docs/conventions.md`（v1.41→v1.42，§7 新增三条判例／通例，版本历史新增一段）
- `docs/design/design_notes.md`（v2.9→v2.10，§2.0／§2.5／§2.5.1 各增一段加注，版本历史新增一段）
- `docs/kaoding_kongzi.md`（§3.2 ④／③两处就地勘正加注，原文照留）
- `tools/qa/r43_prod_check.js`（:68–71 四条不变量更新）
- `tools/qa/vision_r46.js`（:343 检索总量更新）
- `docs/changes/r49_kongzi.md`（新增，CHANGES 原样归档）
- `docs/changes/r49_kongzi_sim.py`（新增，`sim_kongzi.py` 原样归档）
- `docs/delivery_skipper_r49.md`（本件）
- `private/writing_notes.csv`（私有层，转存五行写作向备注，不入公开仓库）

## 提交

| 项 | 值 |
|---|---|
| 提交哈希（合入本体） | `7eb4bb00ffb4a86d293ae5a5341c59c98eecf71c`（`feat(skipper r49 合入): round49_kongzi 批乙……`，回填） |
| 提交哈希（本交付文档追记，回填合入本体哈希） | `d3dd7e2`（`docs(delivery): r49 追记——回填交付文档自身提交哈希 7eb4bb0`，见下方追记段） |
| push | **未执行**——依任务书第 5 项「不推 main 待站长之word」，本件只提交不推送 |
| Actions | 不适用（未推送，无触发） |

**本件依令不推 main**，`engine-split` 分支同样不推送（本轮未触碰该分支）。推送、Actions 运行号与生产带参复验，候站长口令后另行执行并追记。

---

### 追记（提交哈希回填说明）

提交哈希按上表实测回填，非预填（照 `docs/conventions.md` §7「交付体例·实测口径」通例：动作完成后方回填，动作未发生前不预填）。回填分两层，与 `docs/delivery_skipper_r48.md` 处置同例：① 合入本体提交（`7eb4bb0...`）完成后，其哈希实测回填入本文件，此即本节上表第一行，该回填动作本身构成第二次提交（`d3dd7e2`）；② 依 §7 v1.32「回填链截断于追记提交」通例，`d3dd7e2` 即本轮之「追记提交」，其自身哈希已如实记入上表第二行，链条至此完备——本轮未推送，故无「确认部署成功之收尾提交」一环，此环留待站长口令后的推送轮次另行处置。
