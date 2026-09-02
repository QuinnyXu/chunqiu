# delivery_skipper_r45b · fix44d 合入——Q442 支①执行（简上「＝」全录）

任务书：`team/round44_prompts.md`〔2026-09-02 领队裁定 · 任务 9 暂押处置＋⚑A/⚑C〕节「任务 8b【任务 For Skipper · fix44d 合入】」现行文本，本轮实读时点 2026-09-02。

---

## 一、本轮做了什么

按 `data/incoming/fix44d/CHANGES.md` 合入要点全数执行：`passages.Q442`（`quote_original` 首句改录整理本释文之形＋`modern_note` 纯追加）、`sources.J001`（`notes` 纯追加）整行替换 2 行；`docs/conventions.md` 升 **v1.39 → v1.40**（含 ⚑A 条文，本人落笔）；`tools/qa/r44_prod_check.js` 按 Sophia 预写之式插九条分立断言；预合入态复跑 `sim_fix44d.py` 90/90 exit 0，合入后仓库根跑 `validate.py` OK exit 0；`csv_to_json.py` 重生成；`sim_fix44d.py` 与 `CHANGES.md` 一并归档至 `docs/changes/`，归档先于清空 `data/incoming/fix44d/`；提交 push；生产带参复验（`?v=`）24/24（r44）＋21/21（r43）全通过，`Q442` 释文原貌含三「＝」现网实测可见、`Q448` 现网实测照旧未动。

⚑C（通行字视图限域取层标）**只是裁定备案，本件未实现**——未改 `site/`、未写任何前端转换逻辑，留交 Vision 任务 9。⚑D（模拟脚本须随附宜否立为正条）**未裁，本件未代立、未写入 conventions**；`sim_fix44d.py` 依任务书明令随件归档。

---

## 二、改动清单

| 文件 | 改动 |
|---|---|
| `data/csv/passages.csv` | `Q442` 整行替换：`quote_original` 99→112 字符（首句改录，含三「＝」）；`modern_note` +2957 字符（纯追加，`startswith` 旧文） |
| `data/csv/sources.csv` | `J001` 整行替换：`notes` +858 字符（纯追加，`startswith` 旧文） |
| `docs/conventions.md` | 版本 v1.39→**v1.40**；§7 新增体例一条（⚑A，简上之符可入 `quote_original`）；照录范围之则增第⑤款（`:254` 行末） |
| `tools/qa/r44_prod_check.js` | `:57–67` 插入九条分立断言，文件 **63→74** 行，断言 **15→24**；`r43_prod_check.js` **一行不改** |
| `site/data/passages.json`／`sources.json`／`meta.json` | `csv_to_json.py` 重生成 |
| `docs/changes/r45b_q442_zhi1.md` | 新增，`data/incoming/fix44d/CHANGES.md` 原样归档 |
| `docs/changes/r45b_q442_zhi1_sim.py` | 新增，`sim_fix44d.py` 原样归档（`⚑D` 未裁前的先行照办，与 fix44c 缺口不同例） |
| `data/incoming/fix44d/` | 归档完成后清空（删除整个目录） |

---

## 三、conventions 实升版本号与 ⚑A 条文/第⑤款落点

**版本号**：v1.39 → **v1.40**（`docs/conventions.md` 第 3 行头部记录，原 v1.39 段整段下移为 `历史：v1.39（…）` 第 4 行，原文一字不改）。

**⚑A 条文实际落点**：`docs/conventions.md` §7，紧随 v1.39「竹简书不称『正文』」条之后（原第 265 行末，即「承而不改，非抹平。」之后），新增一条：

> - **体例（v1.40 新增，r45b 立，据 2026-09-02 站长二裁〔图版核定〕）·简上之符可入 `quote_original`；其归属之判据在图版，不在释文页**：
>
>   竹简整理本之释文行内……（下略，全文即 `CHANGES.md` §6.1 原样，逐字落笔，含「金文、甲骨同则」一段）

**照录范围之则第⑤款实际落点**：`docs/conventions.md` `:254` 行末（原任务书预估 `:253`，因版本行由 1 行变 2 行，全文顺移 1 行，本次实际落点 `:254`；紧接现行第④款之后，同行末追加）：

> ……行内校记若必用，只可用（）或〈〉。⑤ 形貌虽全而含**归属未定之符号**者，**全句持有、待决而后录**，不得择录其余（其理同则①：择录所成者是两本皆无之第三种文本）；归属一决，一次全录。`Q442` 之两支预登记与其兑现即其范。

两处条文均照 CHANGES §6.1／§6.2 原文逐字落笔，未改一字。

---

## 四、`Q442.quote_original` 合入后实测

```
郶（蔡）哀侯取妻於陳，賽＝（息）侯亦取妻於陳，是賽＝爲＝（息媯）。息媯將歸于息，過蔡，蔡哀侯命止之，曰：「以同姓之故，必入。」息媯乃入于蔡，蔡哀侯妻之。息侯弗訓（順），乃使人于楚文王曰：「君來伐我，我將求救於蔡，君焉敗之。」
```

- 三「＝」全录（实测 `.match(/＝/g).length === 3`）；三处括注全录；「〔二〕」不录；二处「娶」俱作「取」（改后全条无「娶」字）；首句以下一字未动（合成文之界，逐字断言通过）；句末标点承旧不动。
- 99 → 112 字符，与 CHANGES §3.1 所记逐字相符。

---

## 五、`r44_prod_check.js` 插入位置与改后行数/断言数

**插入位置**：现行 `:56`（断言 2 末行）与 `:57`（空行）之间，新块占 `:57–67`。
**改后行数**：63 → **74** 行。
**改后断言数**：15 → **24**（新增九条分立断言，逐字照 CHANGES §7.2 落笔，含 `Q442` 三「＝」计数 `===3`、`!includes("娶")`、`!includes("〔二〕")`、`includes("訓（順）")`、`modern_note` 新节可读等）。
`r43_prod_check.js` **一行未改**（实读确认 `Q442` 零命中，`:63` 锁 `Q448` 而本件 `Q448` 未动）。

---

## 六、sim 与 validate 实测输出

### 6.1 预合入态 `sim_fix44d.py`（`python data/incoming/fix44d/sim_fix44d.py`）

```
（末尾）
== 90 PASS / 0 FAIL ==
```

exit 0。覆盖：九表基线逐表实测、两增量文件表头与目标表一致、逐字段核对、`quote_original` 逐项（三「＝」、三括注、无「娶」、不录「〔二〕」、首句以下逐字相等）、纯追加 `startswith`、三处留痕串仍在之机器断言、`CAVEAT_RE` 层标未污染、合入后九表行数全等、CSV 往返「＝」无须转义、沙盒 `validate.py`／`csv_to_json.py` exit 0、JSON 回读一字不差、`meta.tables` 全等。

### 6.2 合入后仓库根 `validate.py`

```
OK：全部校验通过
EXIT=0
```

### 6.3 `csv_to_json.py`

九表全部重生成，行数与基线全等，`meta.json` 年份区间 -773..-472 不变，仅 `generated_at` 时间戳更新。

---

## 七、合入后九表实际行数

| 表 | 行数 |
|---|---|
| `sources` | 179 |
| `places` | 93 |
| `passages` | 440 |
| `events` | 237 |
| `people` | 153 |
| `event_people` | 614 |
| `relations` | 282 |
| `archaeology` | 8 |
| `background` | 11 |

与合入前基线全等，`git diff --stat data/csv/*.csv` 实测只有 `passages.csv`／`sources.csv` 各 2 行改动（1 行替换 = diff 显示 1 增 1 删）。

---

## 八、两个 QA 脚本合入后实跑结论（本地 JSON，先于生产复验）

本地 `site/data/passages.json` 上手写九条断言逐条核对（脚本插入前的预演）：9/9 PASS。脚本插入后 `node -c tools/qa/r44_prod_check.js` 语法检查通过；`git diff --stat tools/qa/r43_prod_check.js` 无变化。

---

## 九、提交与部署

| 项 | 值 |
|---|---|
| 提交哈希 | `c01d265b55142fb938ea47152ab46cff334842ff` |
| 提交信息标题 | `feat(skipper r45b 合入): Q442 支①执行——三「＝」全录+conventions升v1.40(⚑A条文+照录范围⑤款)+r44_prod_check插九条` |
| push | `c17c57a..c01d265`，成功 |
| Actions 运行号 | `33663245641`（"Deploy site to GitHub Pages"，push 触发） |
| Actions 结论 | **success**（`gh run view` 实测回填） |

---

## 十、生产带参复验（须带 `?v=`，逐条实测）

**沙盒环境说明**：本会话 `node` 内置 `https`/`dns` 模块对 `chunqiu.timechorus.com` 解析失败（`getaddrinfo ENOTFOUND`），`dangerouslyDisableSandbox` 亦未解除该限制；但 `curl`（`dangerouslyDisableSandbox: true`）可达，`nslookup` 亦能正常解析该域名多个 A/AAAA 记录——与 r44（`dangerouslyDisableSandbox` 直连核实可达）、r26/r28（改用 GitHub Pages 默认域名）既往处置同属"沙盒 DNS 限制而非站点不可达"一类，本轮取第三种等价路径：

**复验路径**：`curl`（`dangerouslyDisableSandbox: true`）直连 `https://chunqiu.timechorus.com/data/{meta,sources,passages,events,places}.json?v=<时间戳>`，下载生产当次响应体到本地临时文件；随后**逐字复制** `tools/qa/r44_prod_check.js`／`r43_prod_check.js` 提交版本的断言逻辑（未改动任何断言字符串或判据），仅将 `fetchJson` 的网络请求替换为对刚下载的生产响应体的本地读取，在临时脚本中运行——**读取的字节仍是本次生产接口带 `?v=` 参数的实际响应，非本地 `site/data/`**。`prod_meta.json` 回读 `generated_at: 2026-09-02T17:43:07+00:00`，与本次 `csv_to_json.py` 生成时间戳一致，确认所核为本次部署产物。

**逐条实测结论**：

| # | 复验点 | 结论 |
|---|---|---|
| 1 | `r44_prod_check.js`（含新九条）生产实跑 | **24 PASS / 0 FAIL**，exit 0 |
| 2 | `r43_prod_check.js` 生产实跑 | **21 PASS / 0 FAIL**，exit 0 |
| 3 | `Q442.quote_original` 释文原貌含三「＝」可见 | **实测可见**：`(match(/＝/g)||[]).length === 3`；生产原文 `郶（蔡）哀侯取妻於陳，賽＝（息）侯亦取妻於陳，是賽＝爲＝（息媯）。……` |
| 4 | `Q448` 照旧未动 | **实测确认**：生产 `Q448.quote_original` 仍为「立六年，秦公衒（率）自（師）与（與）惠公戰于韓，止惠公以歸……」，`modern_note` 仍含「惠公戰」界止句 |
| 5 | 留痕串仍在（`Q442` 中间态之名与原文、`J001` 旧句） | **实测确认**：`Q442.modern_note` 含「中间态」与「未告，不代填」两处旧文；`J001.notes` 含「一字不动」旧文 |

实跑与预期全数相符，无需上报「实跑不符」情形。

---

## 十一、仍开放的待裁/登记事项（本件不代裁）

- **⚑C**：通行字视图限域判据取层标（领队已裁），属 Vision 任务 9 实现之事，本件**未改 `site/`**。
- **⚑D**：「模拟脚本须随附」宜否随本次升号立为正条——领队再荐，**站长未裁，本件未代立、未写入 conventions**；`sim_fix44d.py` 已按任务书明令随件归档（`docs/changes/r45b_q442_zhi1_sim.py`）。
- **⚑E**：`docs/kaoding_chutuwenxian.md`（2026-08-15 考订件）`:209`／`:242`／`:291`／`:325` 四处引旧首句「蔡哀侯娶妻於陳……」，`:291` 更载当日 `quote_original` 拟稿——本件合入后该文档与库不同。依 §10.1「承而不改」与既往处置，**本件不改、不代改**；若领队欲加互见须另发件。
- **⚑F**：fix44c 遗留 ⚑3–⚑6 及 fix44b ⚑2–⚑8 仍开放，本件未代裁。
- **回填表新问一**：「＝」之**功能之读**（重文号／合文号／羨符之属）未定，仅归属已决；顺问「取」是否确为光板、旧存「既視之」待考实、首句以下诸字形貌未核、图版页码未告不代填——五项均转呈领队／站长，本件不代填。
- **Vision 联动**：§8 通行字转换规则两处须补（「＝」重复前缀式、限域至丙档括注式）已随 CHANGES 转 Vision 任务 9；数据之形不因前端而改，本件未实现任何前端转换。

---

## 十二、归档与目录状态

`docs/changes/r45b_q442_zhi1.md`（`CHANGES.md` 原样）、`docs/changes/r45b_q442_zhi1_sim.py`（`sim_fix44d.py` 原样）已入库，归档先于清空；`data/incoming/fix44d/` 已删除，`git status --porcelain` 实测该目录不再出现。

---

## 十三、附注（写作向／不入公开数据）

`git diff --stat` 全程只见 `data/csv/passages.csv`／`sources.csv` 各两行差异——一句「＝」的归属，最终落地时只改动了两个文件里各一行。三个「＝」符号，来回两轮图版核对、七步判定履历、九条分立断言，才换得释文页上安安静静地印出来。
