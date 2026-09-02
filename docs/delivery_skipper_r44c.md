# Skipper 交付说明 · r44c（fix44b 合入：校记落地〔丙档二首例〕＋梁城结案）

任务书：【任务 For Skipper】`team/round44_prompts.md` 任务 5b，站长派件（2026-09-02）——「Skipper 合入 fix44b，按其 CHANGES §12 九条执行（含 r43_prod_check.js 第 63 行改锁及四条过时全库不变量一并更新——r45 已移基线，此处过时非 fix44b 之误）」。

备料件：`data/incoming/fix44b/CHANGES.md`（Sophia，依丙案五项裁定〔2026-09-01〕＋2026-09-02 定档裁定＋2026-09-02 站长回填三答备料），只备料未合入。

## 一、改动清单

依 `CHANGES.md` §12 九条逐条执行，无偏离：

1. **整行替换 9 行**（依 `id` 整行替换）：
   - `passages.csv`：`Q442`／`Q443`／`Q446`／`Q447`／`Q448`（5 行，各只动 `modern_note`，`Q442`／`Q448` 另动 `quote_original`）
   - `sources.csv`：`J001`／`J002`（2 行，各只动 `notes`）
   - `events.csv`：`E083`／`E084`（2 行，各只动 `summary`）
2. **新增 1 行**（append）：`places.csv` → `L_JIELIANGCHENG`（解梁城）
3. `conventions` 升 **v1.38**（见「三」）
4. `tools/qa/r43_prod_check.js` 两处改（见「四」）
5. 归档 `docs/changes/r44_jiaoji.md`（`CHANGES.md` 原样），清空 `data/incoming/fix44b/`

**⚑1（E083／E084 是否纳入）**：站长令按 §12 全数执行，该二行既有陈述因本件改动当场变为不实，故随件同修，**未抽出**。

## 二、九表行数（实测）

| 表 | 合入前 | 合入后（实测） | 判 |
|---|---|---|---|
| `sources.csv` | 179 | **179** | 全等 |
| `places.csv` | 92 | **93** | **+1**（`L_JIELIANGCHENG`） |
| `passages.csv` | 440 | **440** | 全等 |
| `events.csv` | 237 | **237** | 全等 |
| `people.csv` | 153 | **153** | 全等 |
| `event_people.csv` | 614 | **614** | 全等 |
| `relations.csv` | 282 | **282** | 全等 |
| `archaeology.csv` | 8 | **8** | 全等 |
| `background.csv` | 11 | **11** | 全等 |

与 `CHANGES.md` §2 预期（同一基线：合入前 179/92/440/237）逐项相符，无出入。

## 三、conventions 升 v1.38

**实升版本号：v1.38**（`docs/conventions.md:3`）。

- **版本记录**（顶部「版本：」段）：按体例照录本次合入之九表改动、丙档二首例落定文字、梁城结案、§7 新体例摘要、`r43_prod_check.js` 两处改动说明、归档与待裁事项。旧 v1.37 记录整段移入「历史：」（`docs/conventions.md:4`），其余历史记录逐条依次下移，未改一字。
- **新条文落点**：`docs/conventions.md:234`，接于 v1.35「谭图引注体例与两书版次基准」条之后（依 CHANGES §6 所令落点），标题为「**体例（v1.38 新增，r44 立……）·出土文献层 `quote_original` 之用字四档判据与校记之立**」。
- **条文全文**取自 `CHANGES.md` §6 拟文，`升下一号` 全部替换为 `v1.38`，未写死于条文正文之外的引述处（仅版本记录段与本节标题处出现具体号，均据本次实升结果如实填写）。条文包含：
  - **判据一句**（看已核之字 Y 是否所升基准本正文之读）
  - **四档判据表**（甲乙丙丁；甲档补「Y＝X 则回改为空」）
  - **贯通义务**（甲乙丙三档校记强制）
  - **【校】固定节·六项定式**（⑤排印形貌之核对状态为四档之枢，「已核·无括注」与「未核」须分书）
  - **层标增句·两式**（甲丙式／乙丁式，偶合限定语，**【校】不入层标之禁**——记明 `site/app.js` 与 `tools/validate.py` 之 `CAVEAT_RE` 只吃到首个「】」之由）
  - **照录范围之则四款**（已核两侧俱见者全录、未核依丁档不动、残缺一侧不录、简号不入正文）
  - **基准本可升格**
  - **金文之前瞻**

条文格式沿用本文件既有惯例（如 v1.34「否定性核字自限」条内嵌 markdown 表格之先例），表格与既有排版风格一致，`git diff` 核对无格式破坏。

## 四、`tools/qa/r43_prod_check.js` 两处改动

### 4.1 `:63`（断言方向反转）

改前：
```js
assert("Q448.quote_original 仍作牙（未回改）", q448.quote_original.includes("牙") && !q448.quote_original.includes("與"));
```
改后：
```js
assert("Q448.quote_original 已回改括注式（r44 校记落地，锁与（與）不锁牙）", q448.quote_original.includes("与（與）") && !q448.quote_original.includes("牙"));
```
理由：本件合入后 `Q448.quote_original` 已落丙档改录整理本括注式，旧断言锁的是丁档现状，本件合入后旧断言必红；改法照 `CHANGES.md` §7 新锁（含「与（與）」全角括注式，不含孤「牙」字）。

### 4.2 `:68–71`（四条全库不变量）

改前：
```js
assert("sources=177", meta.tables.sources === 177);
assert("places=91", meta.tables.places === 91);
assert("passages=436", meta.tables.passages === 436);
assert("events=236", meta.tables.events === 236);
```
改后：
```js
assert("sources=179", meta.tables.sources === 179);
assert("places=93", meta.tables.places === 93);
assert("passages=440", meta.tables.passages === 440);
assert("events=237", meta.tables.events === 237);
```
**如实记明（站长明令）**：此四条不变量之所以过时，系 **r45 夹谷件合入时移动基线所致**（`sources` 177→179、`places` 91→92、`passages` 436→440、`events` 236→237，见 `docs/conventions.md` v1.37 历史记录），**今日改动值中的 `places` 93 一项才是 fix44b 本件所致**（92→93），其余三项之基数变动均在 r45 已经发生、非 fix44b 之误。此节亦已写入本次 conventions v1.38 版本记录，避免账目误记到本件头上。

### 4.3 改后实跑结论（生产环境）

```
node tools/qa/r43_prod_check.js
```
输出：**21 PASS / 0 FAIL**（详见「六」生产带参复验第 5 项）。

## 五、质量门实测

### 5.1 预合入态：`sim_fix44b.py`

```
$ python data/incoming/fix44b/sim_fix44b.py
...
===== 229 PASS / 0 FAIL =====
```

**先跑后合，未踩 r45 曾踩之坑**：本轮严格先在 `data/csv/` 主表原状态下跑 `sim_fix44b.py`（该脚本自行从当前 `data/csv/` 拷贝副本再叠加增量校验），确认 229/229 全通过、exit 0 后，方执行实际合入（Python 脚本按 `id` 整行替换／append），未出现假阳性重复 ID FAIL。

### 5.2 合入后：`tools/validate.py`

```
$ python tools/validate.py
OK：全部校验通过
EXIT=0
```

### 5.3 `csv_to_json.py` 重生成

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
EXIT=0
```

## 六、提交与部署

| 项 | 值 |
|---|---|
| 提交哈希 | `5a95937`（`5a9593775d8949881538fb417927e88d750831cf`，实测 `git log`） |
| push 结果 | 成功，`origin/main` `c0bd95f..5a95937` |
| Actions 运行号 | `33638152221`（"Deploy site to GitHub Pages"，push 触发） |
| Actions 结论 | **success**（实测 `gh run view` 回填） |

## 七、生产带参复验（须带 `?v=`，逐条实测）

**沙盒 DNS 本轮可解析 `chunqiu.timechorus.com`**（与 r44/r44b/r45 部分复验遇到的解析问题不同，本轮 `nslookup` 与 `curl -m 10` 均正常返回，直连生产验证）。

### 7.1 改后 `r43_prod_check.js` 生产实跑

```
$ node tools/qa/r43_prod_check.js
```
**21 PASS / 0 FAIL**（含改后 `:63` 括注式断言、`:68–71` 四条新不变量，逐条 PASS；meta 实测 `{"sources":179,"places":93,"passages":440,"events":237,...}`）。

### 7.2 Q448／Q442 正文括注式两侧可读

- `Q448.quote_original` 含「衒（率）」「自（師）」「与（與）」三处括注 —— **PASS ×3**
- `Q448.quote_original` 不含孤立「牙」字 —— **PASS**
- `Q442.quote_original` 含「弗訓（順）」—— **PASS**
- `Q442.quote_original` 不含「（息）」（从严自限之锁）—— **PASS**

### 7.3 五行【校】节俱见

`Q442`／`Q443`／`Q446`／`Q447`／`Q448` 五条 `modern_note` 均含「【校】」固定节字样 —— **五条全 PASS**（长度分别为 6233／4966／2120／3419／5262 字符，与 `CHANGES.md` §1 逐行变更清单预期长度一致）。

### 7.4 `L_JIELIANGCHENG` 坐标与双 medium 可读

`lat=34.94`／`lng=110.53`／`certainty=medium`／`coord_certainty=medium`／`source_ids=Z045;J002`，`coord_basis` 含「页 151」「页 352」「22」（三证页码全在）—— **九项全 PASS**。

### 7.5 E083／E084 改后陈述与数据相符

- E084：保留原句「引文正文不以正读回改」（留痕不抹平）＋含【★r44 就地注记】标记＋明书「自 2026-09-02 起不再是现状」＋含 `Q448` 落丙档改录括注式之说明 —— **四项 PASS**
- E083：保留原句「本轮均无从核」（留痕不抹平）＋含【★r44 就地注记】标记＋明书自限「已于 2026-09-02 解除」＋含 `L_JIELIANGCHENG` 新立说明＋`place_id` 仍作 `L_JIANG`（未挂新点）—— **五项 PASS**

**如实记一处自纠**：本节复验初稿曾写一条错误断言（误以为改后 `E084.summary` 应不再含旧句「引文正文不以正读回改」），实跑得 1 FAIL；核对 `CHANGES.md` §1「原文零删除」与 §7 v1.29「判定反转须如实记录，不得抹平」之要求后确认：**旧句原样保留＋另加【★r44 就地注记】说明其已过时，才是正确落地**，本库数据无误，错的是我方复验断言本身的预期。已重写断言并复跑，逐条转绿（本节即已呈现修正后的结果）；记此过程，不抹平，同「依据链留错误史」之例。

**复验路径**：全部经 Node.js `https` 模块直连 `https://chunqiu.timechorus.com/data/*.json?v=<timestamp>`，非本地 `site/data/`；本轮无需照 r44/r45 既往「沙盒 DNS 不能解析」之处置改走本地文件复验。

## 八、`L_JIELIANGCHENG` 判档核对（未代裁事项均照令执行，未代裁史料）

- `lat`／`lng`／`coord_certainty` 三栏均有值，**非留空件**；`certainty`／`coord_certainty` 双 `medium` 是判断而非保守值，未升未降，判档理由具在 `coord_basis`。
- **不挂任何 `events.place_id`**：`E083.place_id` 仍作 `L_JIANG`（本事目落点是绛，非赂地），同库内既有 9 个孤点之型，是判断不是遗漏，本轮未代挂。

## 九、仍开放的待裁 / 登记事项（本件不代裁不代改）

以下移交领队／站长裁定，本轮原样转呈：

- **⚑2** 层标增句「偶合」两变体是否收为正条之第三、第四式（本件 §6 拟文取「不收为正条，只在 conventions 写一句限定语」之处置，已如此落地，是否收为正条仍待裁）
- **⚑3** 回填表新问一条：整理本第五章「（息）」之前是否印有隶定字
- **⚑4** `Q446`／`Q447` 之排印形貌未核——回填表可顺问二条
- **⚑5** 《系年》整理本释文正文之页码仍缺（五行【校】③ 一律书「未告，不代填」）
- **⚑6** `L_JIELIANGCHENG` 之取点精度与异说未检
- **⚑7** `docs/kaoding_jiaoji.md` §6.4 断言清单之修法——**本件不动该文档**，未代裁其归档去向（补记「【r44 落地追记】」节抑或以 `docs/changes/r44_jiaoji.md` 为其去向载体两案均未裁）
- **⚑8** 软检不加（丙案裁定⑤）之复核——已照办，`tools/validate.py` 一字未动，重申登记

## 十、已知问题 / 交接备注

- 无新增数据缺陷；`sim_fix44b.py` 229/229、`validate.py` exit 0、生产带参复验（原有 21 项＋本轮补充 24 项）全数通过。
- `docs/changes/r44_jiaoji.md` 与既有 `docs/changes/r44_huzhi.md` 不撞名，两文件并存，各自对应不同批次（huzhi=莘婢互指小件，jiaoji=本次校记落地）。
- 本轮提交未涉及 `data/incoming/round45_jiagu/` 或任何其他待合入目录，`git status` 合入前后逐一核对，未见误碰。

---

交付人：Skipper　日期：2026-09-02
