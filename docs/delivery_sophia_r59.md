# delivery · Sophia · r59（r59-C：r53 备料之合入）

**轮次**：第 59 轮 r59-C
**任务书**：`team/round59_prompts.md`「## Task for Sophia · r59-C —— r53 备料之合入」（2026-10-04 EDT 站长派，领队入文）
**备料目录**：`data/incoming/r53_kongzi_role/`（入库于 `a189d00`，「本轮待合入」）
**日期**：2026-10-04（本机时区 EDT）
**状态**：**已合入、其目录已删**；本地提交三笔，**未推送**（任务书「不提交推送口令」）。

---

## 一、所读之节

| 文件 | 节 | 要点 |
|---|---|---|
| `team/round59_prompts.md` | `## Task for Sophia · r59-C`（:376–394） | 五条；回报合入之逐表增减、sim 之果、二提交之 sha |
| `team/round59_prompts.md` | `## §三` 裁一百三十八之四「其序」（:366–372） | r59-C → r59-D，一次一料，其删一次一提交 |
| `team/round53_prompts.md` | `### 裁五十九`（:930） | 合入之日重跑 `sim_r53_kongzi_role.py` 一过（断言〇乙钉住切点） |
| `team/round53_prompts.md` | `### 裁七十`（:1180）及 `Task for Skipper · r53-11`（:1225） | 三附则：自书「本轮待合入」／合入之时删之，**其删自成一提交**／`CHANGES.md` 随件入库 |
| `team/round54_prompts.md` | `## 二、次件与承接` 乙·6（:2869） | 转引裁五十九、裁七十 |
| `data/incoming/r53_kongzi_role/CHANGES.md` | §〇、§一、§二、§四末、§五、§六、§七（含 r53-8 加注）、§八 | 合入法（整行替换 19 行、键 `(event_id, person_id)`、无增删）；sim 之判据（断言〇乙红即停） |

★ **一处出处之差（不影响执行，照实记）**：任务书书「`team/round54_prompts.md` 裁五十九、裁七十」，实核二裁之**裁文在 `team/round53_prompts.md`**（:930、:1180）；`round54` 只于 :2869 转引其名。今依 `round53` 之裁文执行。

---

## 二、前置实读（2026-10-04，合入前）

- `HEAD` `a6998f6`，工作区 clean；`data/incoming/` 下只 `r53_kongzi_role/` 一目、其内 3 物，三物俱已跟踪（`git ls-files`），入库提交 `a189d00`。
- `data/csv/event_people.csv` sha256 `53ff60927c71de53…`（694 行）——**与 `CHANGES.md` §〇 所记逐值相符**；其末次改动之提交仍是 `5f87d39`（r51 合入），r53 备料以来未被他件动过。
- `fixes_event_people.csv` sha256 `6562883e1f00a843…`（19 行）——与 `CHANGES.md` 抬头 r53-8 追记所记相符。
- 二表表头同（`event_id,person_id,role_in_event,directness,presence`），俱 UTF-8 无 BOM、LF 行尾，每记录一物理行。
- **19 行逐行核**：键俱存、唯一；`directness`／`presence` 与现库逐行相同；现库旧值俱为改件新值之**精确后缀**（纯前置之形），前缀即 `CHANGES.md` §三所列之 19 短语。**目标行现状与 `CHANGES.md` 相符，无须停。**

---

## 三、合入

- **所动**：只 `data/csv/event_people.csv` 之 19 行 `role_in_event`（P_KONGZI：`E221 E276 E277 E281 E282 E284 E285 E286 E287 E289 E290 E292 E296 E297 E298 E299 E300 E301 E302`）。其法：按键以改件之原行逐字替换现库之原行（不经重序列化），`git diff --numstat` 得 **19／19**。
- **合入后**：`event_people.csv` sha256 `3c71137e8911f7fd…`；与「以 `a6998f6` 之现库为底、按 sim 之 `csv.DictWriter(lineterminator="\n")` 合并模型所出之本」**逐字节相等**。
- 生成物：`python tools/csv_to_json.py` → `site/data/event_people.json`（19／19）、`site/data/meta.json`（只 `generated_at` 一栏变）；`kaodui.json`／`kaodui_notice.json`／`docs/kaodui_index.md` 重生成后**无差**。

---

## 四、sim 之果（合入之日重跑；★ 二跑并书）

**跑甲 · 合入前，于本仓**：`python data/incoming/r53_kongzi_role/sim_r53_kongzi_role.py` → **exit 0，十七项全过**：

| 断言 | 实测 |
|---|---|
| 〇甲 | r52 层 694／103／591；r53 层 694／103／591 |
| 〇乙（量具闸） | `site/app.js` `roleParts()` 段 sha256 `80bc48246e6c9c5b…`（1709 字节）→ **即 r53 层**，前端自 r53 以来此段未动 |
| 一 | 19 行，即病集 |
| 二 | 改件 19 键、无重、现库缺 0、与病集差 `[]` |
| 三 | 旧值非新值精确后缀者 0 |
| 四 | 所前置之短语不合者 0 |
| 五 | 账号只移不删，不合者 0 |
| 六 | 新首句仍是账号者 0 |
| 七 | 两层 19 行 head 俱＝短语＋「…」、括引成对；两层逐字同 |
| 八（按类反证） | 改前之值两层俱红出 `['E276','E286']` |
| 九 | 合并 694、动 19、未动 675，sha256 `73da91f83e416f40` 两取相同 |
| 十 | 未动 675 行之胶囊首句，两层俱 0 行有异 |
| 十一 | 合并之本跑 `validate.py` exit 0 |
| 十二甲 | 摘引候选改前 44、改后 44，逐字全等 |
| 十二乙 | 新式命中 42／不合恰 `E290「使問之仲尼」`、`E302「生卒于其地」` 二处（登记之所期） |
| 十二丙（闸） | 异转合 2（`E290`／`E297`），合转异 0 |
| 十二丁（按类反证） | 易一字（郯→邾）不合；只易标点仍合；附记「剔星号」载力 23 处 |

**跑乙 · 合入后，于本仓**：同命令 → **exit 1**，〇甲、〇乙、六、九、十、十一、十二甲 7 项过，**一、二、三、四、五、七、八、十二乙、十二丙、十二丁 10 项红**。
★ **其红系脚本之构造使然，非合入有误**：脚本以 `data/csv/event_people.csv` 之**现值为「改前」**（`LIVE`），合入后现值已是新值——病集变为 0 行（断言一），旧值成了新值自身（三、四、五），改前之腰斩已消（八），候选随病集而空（十二甲 0／0、十二乙丙丁随之）。此正是 `CHANGES.md` §四末「合入之日，仍须重跑一过」之所指须在**合入前**跑之由。照实列之，不以改脚本就绿。

**跑丙 · 合入后，以合入前之底复验**：于 scratchpad 立一暂存树（`git archive a6998f6 data/csv` ＋ 现行 `site/app.js` ＋ `tools/validate.py` ＋ 备料三物），跑同一脚本 → **exit 0，十七项全过**（逐项之果与跑甲同）；并核本仓合入之本与该底之合并模型逐字节相等（见三）。**故合入之物即 sim 所验之物。**

---

## 五、质量门与九表

`python tools/csv_to_json.py` exit 0；`python tools/validate.py` → 「OK：全部校验通过」，**exit 0**（合入提交后、删目录提交后各跑一次，俱然）。

| 表 | 基数 | 合入后 | 增减 |
|---|---:|---:|---:|
| people | 174 | 174 | 0 |
| events | 265 | 265 | 0 |
| passages | 509 | 509 | 0 |
| event_people | 694 | 694 | **0**（改 19 行之 `role_in_event`，无增删） |
| relations | 309 | 309 | 0 |
| sources | 195 | 195 | 0 |
| places | 104 | 104 | 0 |
| archaeology | 8 | 8 | 0 |
| background | 11 | 11 | 0 |
| kaodui | 463 | 463 | 0（`docs/kaodui_index.md` 重生成无差） |

数法：前九表以 `csv.DictReader` 数 `data/csv/<表>.csv` 之数据行，与 `csv_to_json.py` 之输出逐表相同；kaodui 取 `csv_to_json.py` 之输出「463 条」。

---

## 六、提交（本地，未推送）

| # | sha | 内容 |
|---|---|---|
| 1 | `1ac9892` | 合入：`data/csv/event_people.csv`＋`site/data/event_people.json`＋`site/data/meta.json` |
| 2 | `c008647` | 删 `data/incoming/r53_kongzi_role/`（`git rm -r`，未报「Operation not permitted」；裁七十附则②） |
| 3 | 本文件之提交 | 交付文档单独一笔——因其须书前二笔之 sha，并入第 1 笔则自引不得 |

删后 `data/incoming/` 只余 `.gitkeep`；三物可以 `git show a189d00:data/incoming/r53_kongzi_role/<文件>` 取回。

---

## 七、上报事项（★ 只报不办）

1. **`docs/conventions.md` v1.46 历史条（:10）之回填**：其文书「本轮三件之合入（…Sophia r53-8 之备料）…合入之提交哈希与其日**俟实际发生后由合入者照实回填，本件不预填**」。今合入已发生（`1ac9892`，2026-10-04）。★ 本件任务书未命改 `conventions`，且其改涉一轮一号（r59 已是 v1.51）之归属，**故不代落，候领队排**。
2. **sim 之「合入后即红」系其构造**（见四·跑乙）：此后若有他件援用此脚本之例，宜书明「合入前跑」或改以 git 底为「改前」。**只登记，不改**（脚本已随目录删）。
3. **出处之差**：任务书所指裁五十九、裁七十之所在（`round54`）与裁文实所在（`round53`）不同，见一。
4. `CHANGES.md` 内既有之候裁二事今仍悬（与本件合入无涉，照登记带过）：「星号可否入引」（载力 23 处）、`E290` 穿井获羊补录新 `Q`（裁六十二，次件乙·7）。

**附注区·写作向备注**：无。
