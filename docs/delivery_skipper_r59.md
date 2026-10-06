# delivery · Skipper · r59（r59-F7 终件：二备料目录之删之账）

**轮次**：第 59 轮 r59-F7（终件）
**任务书**：站长令（经领队下达）；其据为 `team/round59_prompts.md` 裁一百八十四（:1652 起，「空提交之取舍：取乙（交付文档）」）。该文 gitignored，故其由在此补记。
**备料目录**：`data/incoming/r59_jin_zhizheng/`、`data/incoming/r59_f2_tenure_sources/`（二目录俱**从未入 git**，今俱已删）
**日期**：2026-10-05（本机时区 EDT；本文所列命令之实跑俱在此日傍晚至夜间）
**状态**：二目录已删；归档件在库；本轮提交俱在本地，**未推送**（推送口令属站长）。

---

## 一、★★ 本件无 `git show` 之路

**二备料目录从未入 git。** 以下三命令于 2026-10-05 本文落笔前实跑：

| 命令 | 输出 |
|---|---|
| `git ls-files data/incoming/` | 仅 `data/incoming/.gitkeep` 一行（共 1 件） |
| `git ls-files data/incoming/r59_jin_zhizheng data/incoming/r59_f2_tenure_sources \| wc -l` | **0** |
| `git log --all --oneline -- data/incoming/r59_jin_zhizheng data/incoming/r59_f2_tenure_sources \| wc -l` | **0**（全部引用、全部史，二路径俱无一笔提交） |

故其删**无物可提交**，亦**无 `git show <sha>:路径` 可取回**：二目录内之物，今日能在库中找到的，只有归档件（见二、四）。**归档是唯一之路。**

★ **不得以 `r53_kongzi_role`（`c008647`）之例类推。** 实读 `git show --stat c008647`：该提交删 `data/incoming/r53_kongzi_role/` 内 3 物（`CHANGES.md` 483 行、`fixes_event_people.csv` 20 行、`sim_r53_kongzi_role.py` 530 行，共 1033 行删），**其三物本在 git 之内**（入库于 `a189d00`），故其提交信息自书「可以 `git show a189d00:data/incoming/r53_kongzi_role/<文件>` 取回」，且其 diff 为三笔 `D`、非空。该例有二路（`git show`／归档件）；**本件只有一路。** 后人见 r53 之例而以为本件亦可 `git show` 取回，则错——本件取不回。

★ **归档之覆盖面，据实分书**（不一概而论）：

| 目录 | 归档于库者 | 备注 |
|---|---|---|
| `r59_f2_tenure_sources` | `docs/changes/r59_f2_tenure_sources.md`（CHANGES.md）＋ 子目录 `docs/changes/r59_f2_tenure_sources/` 之四件（`duiwei.csv`、`fixes_office_tenures.csv`、`sources_new.csv`、`sim_r59_f2_tenure_sources.py`） | 共五件，见四；其 sim 今仍可整跑，见三 |
| `r59_jin_zhizheng` | `docs/changes/r59_jin_zhizheng.md`（CHANGES.md，`67a974e`）＋ `docs/changes/r59_jin_zhizheng_sim.py`（`1985062`） | 只二件；其备料数据件**不在归档内**（今库中无之，亦无 git 史）；其 sim 读 `data/incoming/r59_jin_zhizheng/`（`r59_jin_zhizheng_sim.py:36、48–50`），**目录已删，今不能整跑**（未实跑；据代码所读路径推断，其读路径指向已删目录）。**不自改 sim，列候裁（见九）。** |

---

## 二、归档之形与可行之算

**形**：同深子目录 `docs/changes/r59_f2_tenure_sources/`。其因：`duiwei.csv` 记逐句对位，入库后不可自 `data/csv` 反推，目录一删即永失（§10.1 之辖之隙）；sim 之数据件读 `HERE`，须使 `HERE` 仍指向存有数据件之目录。

**深度之核**（据实数路径分量）：

| 路径 | 分量 | 深度 |
|---|---|---|
| `data/incoming/r59_f2_tenure_sources` | `data`／`incoming`／`r59_f2_tenure_sources` | **3** |
| `docs/changes/r59_f2_tenure_sources` | `docs`／`changes`／`r59_f2_tenure_sources` | **3** |

**算**：二路径深度俱为 3，则 sim 原字 `HERE = os.path.dirname(os.path.abspath(__file__))`、`ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))`（脚本 :35–36）于归档子目录内**自正**——`HERE` 即本子目录（数据件在焉），`ROOT` 上溯三级即仓库根。无须改此二行（`cb4258a` 即复其原字；`r59-F4` 之改二行重件 `docs/changes/r59_f2_tenure_sources_sim.py`，因 ROOT 只上溯二级、HERE 仍指向 incoming，目录一删即死，故在 `cb4258a` 中被取代而删）。

---

## 三、★ 「改形即活」之验：子目录内 sim 整跑（本人复跑）

**命令**：`python docs/changes/r59_f2_tenure_sources/sim_r59_f2_tenure_sources.py`（2026-10-05 夜，**`data/incoming/r59_f2_tenure_sources/` 已删之后**）

**实得**：**exit 0**；末行「合计：**387 PASS，0 FAIL**；反证 18 条，**未红 0**」。与站长转述之数（exit 0／387／0／18／0）**逐项相符**。

**所读何处（目录已删，须复核其可达）**：
- 数据件：`HERE`（＝归档子目录）之 `sources_new.csv`、`fixes_office_tenures.csv`、`duiwei.csv`（:314、:338–339、:373）——**在库，可达**；
- 「改前」之底：`git show 817b21e:data/csv/<表>.csv`（:106、:310）——**取自 git 对象，可达**；
- `tools/`：`shutil.copytree(ROOT/tools, …)`（:331）——读**今日**之 `tools/`（含今日 `validate.py` 与 `tenure_gate`）；
- 不读 `data/incoming/` 任何路径（已删，而整跑仍过，即其证）。

★ **诚实之注**：上轮（r59-F5）于归档子目录实跑 387 PASS 时 `data/incoming/r59_f2_tenure_sources/` 尚在，彼时不能证「目录删后仍可跑」；**今日之跑在目录删后**，故此一验始为「改形即活」之实证。又：sim 读今日 `tools/`，若后日 `tools/validate.py`／`tenure_gate` 改而与基线 `817b21e` 之数据不合，则整跑或随之红——属 sim 之固有依赖，非本件所致；今日未红。

---

## 四、五件归档之对照与其提交

**★ 先明其时**：目录今已删，**「一字不差」之比今无源件可比**。下表「一字不差」一栏，系**删前（F7 当时）之实核**，其结果取自 F7 回报与提交 `cb4258a` 之提交信息、`ee1a416` 之提交信息；**非今日复比**。今日可再核者，仅归档件在库之对象与其内容特征（下表「库中 blob」「CR 数」「字节」三栏，2026-10-05 夜实测）。

| # | 归档件 | 一字不差否（删前之核，据 F7／提交信息） | 入 git 否 | 提交 | 库中 blob（git hash-object，今测） | 字节／CR 数（今测） |
|---|---|---|---|---|---|---|
| 1 | `docs/changes/r59_f2_tenure_sources.md`（CHANGES.md） | 与源 `cmp` 一字不差（`cb4258a` 信息自书「已与源 cmp 一字不差，不动不重复」）；★ 入库对象依 `.gitattributes`（`*.md text eol=lf`）由 CRLF 规整为 LF，同先例（`ee1a416` 信息） | 是 | `ee1a416` | `eea29c4473bc…` | 43461／0 |
| 2 | `…/duiwei.csv` | 原名原样（`cb4258a` 信息） | 是 | `cb4258a` | `f216768f8b94…` | 9734／0 |
| 3 | `…/fixes_office_tenures.csv` | 同上 | 是 | `cb4258a` | `86320771dbbe…` | 4516／0 |
| 4 | `…/sources_new.csv` | 同上 | 是 | `cb4258a` | `075139aa762a…` | 9972／0 |
| 5 | `…/sim_r59_f2_tenure_sources.py` | **非逐字**：基线 `817b21e`，ROOT／HERE 二行复原件原字（深度同为 3），并**改入库注一段**；除注外不改一字 | 是 | `cb4258a` | `e3506f37a3de…` | 29357／0 |

**sim 之异 5 行＝入库注**：实读 `git diff --numstat -M ee1a416 cb4258a`，sim 一件相对 r59-F4 之改二行重件为 +7／−8。其中新「入库注」恰 **5 行**（`〔r59-F5 入库注〕` 起，至「除本注外不改一字」止），即裁一百七十六③所许之异；余者为 ROOT／HERE 二行之复原件原字（重件之「〔r59-F4 入库改〕」注行与其 ROOT／HERE 三行删去、复为原二行）及旧注之删。★ 「入库注之外之异，唯 ROOT／HERE 二行之复原」一语，其所比之『原稿』今已无源件（目录已删），**据 `cb4258a` 提交信息自书（『除注外不改一字』）与上述 numstat，非今日对原稿之复比**。

**三证体例（照前报）**：①`cb4258a` 提交信息之自书（除注外不改一字）；②今测归档件在库 blob 之 sha（上表）；③CHANGES.md 之 CRLF→LF 规整（今库中该件 CR 数为 0；规整发生于入库对象，工作区字节与源同——此语据 `ee1a416` 信息，原件已删，今不可复比）。

---

## 五、删之账

| 核 | 命令 | 实测（2026-10-05 夜，本文提交前） |
|---|---|---|
| 目录已删 | `ls -a data/incoming/` | `.`、`..`、`.gitkeep`（**只余 `.gitkeep`**，二备料目录俱无） |
| 库内 | `git ls-files data/incoming/` | 仅 `data/incoming/.gitkeep`（1 件） |
| 工作区 | `git status --short` | 空（clean） |
| 本地领先远端 | `git rev-list --count origin/main..HEAD` | **本文提交前 15；本文提交后 16**（本文自成一提交，故 +1）。`origin/main` 在 `a6998f6`。 |

★ **更正前报之一语**：前报曾书「`data/incoming/` 现已空」，**不确**——`.gitkeep` 在（`ls -a` 与 `git ls-files` 二核俱示之）。应书「只余 `.gitkeep`」。此语此后以本表为准。

★ **「删」之无提交**：二目录从未入 git，其删不产生 git 提交（`git log --all` 对此二路径＝0）。故裁一百八十四所取之法：**不空提交，本文即其记**。

---

## 六、本轮提交清单（自 `c882870` 起，据 `git log` 实读）

| # | sha | 日时（EDT，10-04／10-05） | 所办 |
|---|---|---|---|
| 1 | `c882870` | 10-04 00:15 | Sophia r59-C 交付文档（r53 备料合入 `1ac9892`、其删 `c008647` 之账） |
| 2 | `a08f1ec` | 10-05 08:14 | r59-F 合入 `r59_jin_zhizheng`（晋之执政序列备料） |
| 3 | `1985062` | 10-05 08:23 | 入库 `r59_jin_zhizheng_sim.py`（ZJJ_TEXT_YEARS 作 15 元） |
| 4 | `67a974e` | 10-05 11:06 | 归档 `r59_jin_zhizheng` 之 CHANGES.md 至 `docs/changes/`（§10.1） |
| 5 | `d992224` | 10-05 11:16 | r59-G 九表变十表，立任期表 `office_tenures`（16 任）及其门 |
| 6 | `9055f72` | 10-05 11:16 | README 目录结构表数 9→10 |
| 7 | `817b21e` | 10-05 11:44 | r59-H conventions 并入 v1.51 补 office_tenures／TEN###／tenure_gate 立门说明（未升号）；DATA_LICENSE.md:9 去表数 |
| 8 | `753effe` | 10-05 16:35 | r59-F4 合入 `r59_f2_tenure_sources`：sources 加 Z148–Z153（6 行）、office_tenures 替换 8 行 |
| 9 | `ee1a416` | 10-05 16:35 | r59-F4 归档 f2 之 CHANGES.md 与 sim 至 `docs/changes/` |
| 10 | `cd63572` | 10-05 17:46 | r59-F5 TEN013.end_basis 加「推（年有据，人之卒年未定）：」前缀（裁一百七十五） |
| 11 | `cb4258a` | 10-05 17:47 | r59-F5 补归档 `duiwei.csv`／`fixes_office_tenures.csv`／`sources_new.csv` 与 sim 至同深子目录 |
| 12 | `ae55dc9` | 10-05 17:49 | r59-F5 conventions 并入 v1.51 补七款（未升号）；tenure_gate 门头【一】加勘注 |
| 13 | `68240dc` | 10-05 20:58 | r59-F6 conventions 并入 v1.51 四款（未升号）；752 款不入 |
| 14 | 本文件之提交 | — | docs(delivery)：本文（因须书前十三笔之 sha，并入前笔则自引不得） |

注：本表自 `c882870` 起算；`origin/main` 在 `a6998f6`，其与 `c882870` 之间尚有 r59-C 之二笔——`1ac9892`（合入 `r53_kongzi_role`，孔子 19 行 role_in_event 首句改写）、`c008647`（删 `data/incoming/r53_kongzi_role/`，三物在 git 之内）。故本文提交前领先数 15＝上表 #1–#13 ＋ 此二笔；本文提交后 16。

---

## 七、质量门与五门（本文提交前，2026-10-05 夜实跑；逐门 exit code 与模式）

| 门 | 命令（于 `tools/qa/` 或仓根） | 模式 | exit | 结果 |
|---|---|---|---|---|
| `tools/validate.py` | `python tools/validate.py` | 本地 | **0** | 「OK：全部校验通过」 |
| `asset_stamp_gate.py` | `python asset_stamp_gate.py` | 本地（读 `site/`） | **0** | 2 引俱相符 |
| `prod_data_invariants.js` | `node prod_data_invariants.js` | **生产**（默认） | **1** | ★ **红：89 过／2 红（共 91 判）** |
| `prod_data_invariants.js` | `QA_BASE_URL=local node …` | 本地源端 | **0** | 91 过／0 红 |
| `prod_freshness.js` | `node prod_freshness.js` | 生产 | **0** | 判红 0、只报 1（窗 4 小时，只报不红） |
| `prod_render_invariants.js` | `QA_BASE_URL=local node …` | 本地源端 | **0** | 48 项，FAIL 0 |
| `prod_render_invariants.js` | `node …` | 生产 | **0** | 48 项，FAIL 0 |
| `vision_r56.js` | `node vision_r56.js` | 生产（`QA_BASE_URL` 默认 PROD；取史本比对） | **0** | 99 条全绿，反证俱红 |

★ **prod_data_invariants 生产模式之红，照实报，不放宽、不绕过**：2 红为「逐表同数」（14 处不符）及其所连之「按类反证·一处不误红」。14 处不符之实：生产落后于本仓所期——`people` 174／186、`events` 265／281、`passages` 509／531、`event_people` 694／735、`sources` 195／217、`kaodui` 463／494（生产实际＝生产 meta 之记，本仓所期更大），`office_tenures`：生产**未供其表**（亦无 meta 键）。其因：**本地 15 笔未推送，生产仍是旧本**。同一门于本地源端（`QA_BASE_URL=local`）91／0 全过，可见红在「生产落后」，非本仓数据之误。**此系推送前之预期状态，不得写成「全绿」。** 推送后须重跑此门（生产模式）至绿，其绿方可作「生产已同」之据。

未跑者：无（六门各一至二模式俱已实跑）。

---

## 八、推送口令

推送属站长，今不推。本地领先远端：本文提交前 15 笔、提交后 16 笔。生产站落后，故 `prod_data_invariants` 生产模式之 2 红为推送前之预期。

---

## 九、候裁清单

1. **`r59_jin_zhizheng` 之 sim 今已不能整跑**，且其备料数据件未入归档（见一表二行）：其 `docs/changes/r59_jin_zhizheng_sim.py` 读 `data/incoming/r59_jin_zhizheng/`。同 `r59_f2_tenure_sources` 之例，若须使其「不死」，须另件补归档其数据件并改其 ROOT／HERE；其深度亦须核（`docs/changes/` 为深 2，须入同深三级子目录方可自正）。**本人不自改 sim、不自补归档，候领队与站长裁。**（该件之数据件已删，**今无源可补**：若裁补，须自 `data/csv` 与 CHANGES.md 重构，非原样复得；此点宜裁前明之。）
2. **任务书所称「5(a)(b) 就地加注之落点」**：本任务书（我所领之抬头）未载其具体所指，我据 `team/round59_prompts.md` 检得二处就地加注之事——① :678 附近之「Sophia r59-E2『其任内辅查有判别力』已就地加注」；② :1513「752 款之『并入 conventions v1.51』一语须就地加注作废」（裁一百七十八③）。**我不确知其是否即所指之 (a)(b)，亦未于今日核二处加注已否落于所指之文件**——候领队指明其落点并核之，此处不替落笔。
3. **F7「空提交」**：站长令「不空提交」，**结案**——本文即其记（裁一百八十四③乙）。
4. **前报「`data/incoming/` 现已空」之误**（见五）：以本文为准，不必另件更正。
5. **`delivery_skipper_r56.md`／`r57.md` 二缺**：裁一百八十四登记 r60，另件，不在本轮。
6. **`sim_r59_f2_tenure_sources.py` 之固有依赖今日 `tools/`**（见三）：登记，不改。

**附注区·写作向备注**：无。
