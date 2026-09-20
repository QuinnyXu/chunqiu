# 交付说明 · Skipper r51（批丙＋r51-B 楚武王＋fix51 五项修正·合入，不含推送）

**执行者**：Skipper（合入、管线、提交、部署）
**日期**：2026-09-20
**任务书**：`team/round51_prompts.md` §四【任务 For Skipper】r51 合入（不含推送）＋ §四之二（conventions 五条拟文）＋ §四之三（分发块），现行文本实读，逐节核过 §一之三（裁十二至裁二十四）与 §六之二（勘注三至勘注十二）
**备料**：Sophia 三件——`data/incoming/round51_peijue/`（批丙孔门鲁政配角七人）、`data/incoming/r51b_chuwu/`（楚武王 ⚑B）、`data/incoming/fix51/`（五项修正返工本）＋ `docs/delivery_sophia_r51.md`；Vision 一件——⚑H 丙案（`site/app.js`／`site/styles.css`／`docs/design/design_notes.md`）＋ `docs/delivery_vision_r51.md`＋ `tools/qa/vision_r51.js`。四件俱经领队 2026-09-20 审定核可（裁十二至裁十八对 Sophia 三件、裁十九至裁二十一对 Vision 件）。
**基线**：合入前 `main` = `bf4242c`，与 `git ls-remote --heads origin main` 实查所得 `bf4242cf9e2546b8706f8d978bd4ab2c6489d48c` 同哈希；工作区含 Vision ⚑H 件未提交改动＋六项未跟踪产物（三 `incoming` 目录、两份交付文档、`tools/qa/vision_r51.js`），逐一核实与任务书 §四之三〇所列相符。

---

## 一、做了什么

**三件依次合入**（每次以最新主表为基，三件数据面不相交，`events` 一表全程一字未动）：

1. **① `round51_peijue`（批丙）**：`people` append **+7**（`P_ZILU` 子路、`P_ZIGONG` 子贡、`P_RANYOU` 冉有、`P_YANGHU` 阳虎、`P_JIHUANZI` 季桓子、`P_JIKANGZI` 季康子、`P_ZIFUJINGBO` 子服景伯，`is_protagonist` 一律 `0`）；`event_people` append **+19**（阳虎回挂 `E278`–`E281` 清偿裁九登记之回补义务，presence 逐目定，非因「四目以其人为题」径判亲至；七人于既有事目补挂 15 条）；`relations` append **+20**（`R307`–`R326`：孔子—子路／子贡／冉有三条取「其他」类边，**师弟边零条**——《左传》《国语》全帙无一处书三人师事孔子，昭七「孟懿子與南宮敬叔師事仲尼」明文不及三人；季桓子—季康子取「其他·继立」`high`，不取「亲属-直系·父」）；`passages` append **+3**（`Q524`–`Q526`）。
2. **② `r51b_chuwu`（⚑B 楚武王）**：`people` append **+1**（`P_CHUWU`，`ming` 从阙——「熊通」经传零命中，出《史记》S 层，依判据三从阙）；`event_people` append **+2**（`E294`／`E295` 楚武王俱判**「相关」**——presence 逐目核，传书「侵隨」「合諸侯于沈鹿」「伐隨」皆无「亲在事发地」之明文，同 `E245` 夫差之判，非因「以其人为题」径判亲至）；`people` 整行替换 **1** 行（`P_CHUWEN`，只动 `relations` 一栏，就地插注「父楚武王（未入库）」已不实，原句照留不删）。
3. **③ `fix51`（返工本，磁盘现存即返工之本，非首交本）**：`places` 整行替换 **1** 行（`L_HUAN`：`certainty` low→medium、`lat`／`lng` 35.85／116.70→35.88／116.78、`modern_location` 收窄「肥城」、**`coord_certainty` low→medium**〔裁十四，据「点之校」非「证之增」，未闭之端——新点距宁阳县治约 27 里、略短于杨注「三十余里」，坐标本轮不再微调〕，`coord_basis` 纯追加二段留痕）；`sources` 整行替换 **2** 行（`Z018`／`Z125` 之 `notes` 纯追加，原文零删除，`Z125` 追加段并记子路句「批次之界所限」之状态已由批丙解除，裁十七）。

**conventions 升一号（v1.43→v1.44），实落四条**（站长裁二十二核可三项通例＋领队裁二十三改定 ⚑H 止血条；批丙 `round51_peijue/CHANGES.md` §8.6 明记「本件未新造任何规范……不要求 conventions 升号」，故五条中第②条〔批丙新通例〕未产生，实落四条，已在 conventions.md 版本头如实注明）：
- **① ⚑H 止血条**：新增 §7 通例「注文之 markdown 标记」（取领队裁二十三改定本，即 §四之二拟文六，**不取** `docs/delivery_vision_r51.md` §八之②款——该款所据「不实渲之栏 1234 处」系领队伪数，全库实测 2798 处一处不落尽在实渲之栏）；
- **③ 走查门之基线数**：新增 §7「交付体例·实测口径」节末一条（拟文三原文落笔）；
- **④ `_to_delete/` 之位**：新增 §10.3（拟文四原文落笔），**同改 `CLAUDE.md` 红线四附则①**（:30，原句照留、就地补其位）；
- **⑤ 今译语不可代传文**：新增 §7 通例（拟文五＋裁二十四补层，原文落笔），与 v1.26／v1.30 互指。

拟文五条俱**照文落笔，未自行改写**；落笔时逐条核对现行条文体例，无相抵之处，未触发上报。

**`site/data/` 重生成**（`python tools/csv_to_json.py`）：九表悉数重写，`meta.json` 行数以实读为准（见下节）。

**QA 不变量改数十处**（任务书 §六所列，逐处核语义后照实改数，非一律替换）：`r43_prod_check.js` :70（`passages=506→509`）、`vision_r46.js` :351（`sq.total 506→509`）、`vision_r51.js` :136／:257／:283 三处活断言（`env.n`／两版渲卡数／`sameCnt+diffCnt`，俱 506→509）、`vision_r51.js` :5／:94／:226／:244（消息内之数，条件 `bad.length===0` 未动）／:286 五处文字，**十处俱补基线与所由**，照 r49 成例。

**顺带发现并修正一处（三步范式：修正＋声明＋可回退）**：`node vision_r51.js` 改数后首次复跑，红 4 项——`vision_r51.js` :246／:247／:284／:374 四处断言（层标／页脚落点之「143 落点 1217 处」「134 行 1197 处」「含星号之卡 134 张」「粗体段总数 1217」）系 Vision 于**数据合入前**对 506 行 `passages` 表所作之精确普查，未预见批丙新增之 `Q524`／`Q525`／`Q526` 三行 `modern_note` 亦各含成对 `**`（分别 1／1／2 对，共 +4 处，+3 行）。经实读核实（`python` 脚本逐行统计 `modern_note.count("**")`，三行皆不以【】层标起首，故只落于「页脚外」一路，不影响层标 9 行 20 处一项）确系批丙扩表所致之预期内联动、非 Vision 原断言有误，遂将四处基线由 143/1217、134/1197、134、1217 照实改为 146/1221、137/1201、137、1221，并逐处补基线与所由；**声明**：此四处不在任务书 §六原列「十处」之内，属合入时依 §四之二拟文三「同轮由合入者一并照实改数、须逐处核语义」之通例延伸发现并处置，**已如实记于此，未静默改动**；**可回退**：`git diff` 可见改动只涉数字与注释，逻辑分支未动，若领队认为不宜由合入者顺手处置，可整段回退，不影响其余 93 项断言。修正后复跑 `node vision_r51.js`：**97 项全过，0 红，exit 0**。

**归档先于清空**：`round51_peijue/CHANGES.md`→`docs/changes/r51_peijue.md`、`r51b_chuwu/CHANGES.md`→`docs/changes/r51b_chuwu.md`、`fix51/CHANGES.md`→`docs/changes/r51_fix51.md`，三份 `sim_*.py` 一并归档（`r51_peijue_sim.py`／`r51b_chuwu_sim.py`／`r51_fix51_sim.py`，原样未改一字），归档提交完成后三目录随同一提交清空（`ls data/incoming/` 实测空）。

**一并提交 Vision ⚑H 件与其未跟踪产物**（领队补充纪律 1）：`site/app.js`／`site/styles.css`／`docs/design/design_notes.md`（升 v2.12）四项已跟踪改动、`tools/qa/vision_r51.js`（改数后）、`docs/delivery_sophia_r51.md`／`docs/delivery_vision_r51.md` 两份交付文档，随本轮合入本体同一提交入库。`team/_to_delete_20260920_vision_r51/` 在 `team/` 下、`.gitignore` 内，**不入仓、本轮不清**（待裁，照领队补充纪律 1）。

---

## 二、逐表行数（合入后，`csv.DictReader` 实读，不含表头）

| 表 | 合入前 | 合入后 | 判 |
|---|---|---|---|
| `people` | 166 | **174** | +7（批丙）+1（⚑B）；`P_CHUWEN` 整行替换不改行数 |
| `event_people` | 673 | **694** | +19（批丙）+2（⚑B）；既有 673 行一字未动（机器反证） |
| `relations` | 289 | **309** | +20（批丙，`R307`–`R326`）；`fix51`／⚑B 均不动本表 |
| `passages` | 506 | **509** | +3（批丙，`Q524`–`Q526`） |
| `places` | 104 | **104** | 全等（`fix51` 整行替换 `L_HUAN` 不改行数） |
| `sources` | 195 | **195** | 全等（`fix51` 整行替换 `Z018`／`Z125` 不改行数） |
| `events` | 265 | **265** | 全等——全程一字未动，三件机器反证（合并前后全文逐字全等） |
| `archaeology` | 8 | 8 | 全等 |
| `background` | 11 | 11 | 全等 |

主角数 **34 不变**（十人俱 `is_protagonist=0`）。尾号：`passages` 止于 `Q526`、`relations` 止于 `R326`，接续无跳号无撞号（`Q524`–`Q526`、`R307`–`R326` 逐位核对）。与任务书 §四之三〔二〕所列预期数逐项相符。

---

## 三、验证记录（每步实测，不凭复述）

| 步骤 | 结果 |
|---|---|
| 合入前独立复跑 `sim_peijue.py` | **7206 PASS, 0 FAIL, exit 0**（与 Sophia、领队所报一致） |
| 合入前独立复跑 `sim_chuwu.py` | **1536 PASS, 0 FAIL, exit 0** |
| 合入前独立复跑 `sim_fix51.py`（返工本） | **487 PASS, 0 FAIL, exit 0**（`coord_certainty=medium`、`Z125` 子路句在位） |
| ① `round51_peijue` 合入后 `python tools/validate.py` | 「OK：全部校验通过」，**exit 0** |
| ② `r51b_chuwu` 合入后 `python tools/validate.py` | 「OK：全部校验通过」，**exit 0** |
| ③ `fix51` 合入后 `python tools/validate.py` | 「OK：全部校验通过」，**exit 0** |
| `python tools/csv_to_json.py` | 九表全部重生成，`meta.json` 九表行数与上表逐位相符（实读，非预估） |
| `cd tools/qa && node regress20.js` | **exit 0**，页面错误：无 |
| `node vision_r51.js`（改数并处置四处顺带发现后复跑） | **97 项全过，0 红，exit 0** |
| `node vision_r24a.js`（非本轮回归义务，顺带复核既有 ⚑J 状态） | **[FAIL] 1 条**：「无地望事件 11 条一律中性签（实测中性 12）」，与任务书裁二十勘正值一致，**未触碰其断言** |

合入手法逐步核对（与三件 `CHANGES.md` §8「交 Skipper 的合入要点」逐条对照）：append 均以 `csv.DictWriter(fieldnames=主表表头, lineterminator="\n")` 追加于表尾，主表原有字节不动；整行替换（`P_CHUWEN`／`L_HUAN`／`Z018`／`Z125`）均以「按 `id` 匹配、命中数核对、其余行原样写回」之法执行，与 `sim_chuwu.py`／`sim_fix51.py` 内部合并模拟同一手法（`shutil.copy` 基线＋`DictWriter` 覆写），非另创合并逻辑。

---

## 四、conventions 与 CLAUDE.md 落笔细节

**conventions 新版本号：`v1.44`**（`docs/conventions.md` 文件头）。原 `v1.43` 版本行原样下移为「历史」条目，未回改一字；新版本行摘述本轮三件合入要点与四条通例。

`docs/conventions.md` 具体改动三处：
1. **§7 新增两条**（紧接既有 v1.42 T 层条目之后、「交付体例」小节之前）：⚑H 止血条（含①已由显示层承担、②尚未承担之八栏 1581 处、③扩施欠账登记、④渲染须经 `mdBoldFrag()` 一路四款）与「今译语不可代传文」（含裁二十四补层二例）；
2. **§7「交付体例·实测口径」节末新增一条**：走查门之基线数通例（拟文三原文，含首例 `vision_r51.js` 四断言＋四文字硬写 506 一事）；
3. **§10 新增 10.3 节**：「`_to_delete/` 之位」（拟文四原文，含 `team/_to_delete_20260918/`／`team/_to_delete_20260920_vision_r51/` 两处实例）。

`CLAUDE.md` 红线四附则①（:30）**原句照留、就地补其位**：句末增「该目录一律置于 `team/` 下，不得置于仓库根」，理由句落 conventions §10.3。

---

## 五、L-45 §2 义务——本轮触碰 `site/app.js` 之所触行

Vision ⚑H 件新增两纯函数、改两落点，位于合入后仓库现状（`site/app.js`）：

| 内容 | 行号 |
|---|---|
| `const MD_STAR_RUN = /\*+/g;` | :945 |
| `function mdBoldMarks(s)` | :947–953 |
| `function mdBoldFrag(text)` | :955–968 |
| `cv.appendChild(mdBoldFrag(caveat))`（层标 `p.q-caveat` 落点，取代原 `cv.textContent = caveat`） | :1094 |
| `ft.appendChild(mdBoldFrag(rest))`（页脚 `ft` 落点，仅 `rest` 段走新函数，源题与分隔符照旧写死） | :1130–1136 |

`site/styles.css` 新增 `.quote p.q-caveat strong, .quote footer strong { font-weight: 600; }`（:803–819 一并含取值实测注释）。两文件与 `timechorus-engine` 之差据此可枚举：**新增依赖只在本仓 `site/app.js`／`site/styles.css` 内部，未新增任何外部脚本或样式引用**（红线六：站点零运行时依赖，未破）。

---

## 六、归档与清空

- `round51_peijue/CHANGES.md` → `docs/changes/r51_peijue.md`；`sim_peijue.py` → `docs/changes/r51_peijue_sim.py`
- `r51b_chuwu/CHANGES.md` → `docs/changes/r51b_chuwu.md`；`sim_chuwu.py` → `docs/changes/r51b_chuwu_sim.py`
- `fix51/CHANGES.md` → `docs/changes/r51_fix51.md`；`sim_fix51.py` → `docs/changes/r51_fix51_sim.py`
- 三份均原样归档，未改一字；归档与合入本体、清空同一提交。`ls data/incoming/` 实测**空**，无残留。

---

## 七、已停下上报、未自决之项

**本轮无待我自决而停下之项**——三件 Sophia 上报（批丙六条、⚑B 四条、`fix51` 三条）与 Vision 三条上报俱已由领队 2026-09-20 裁定完毕（裁十二至裁二十一），合入前不复有待裁之项。conventions 五条拟文照文落笔，未自行改写，落笔时逐条核对现行体例无相抵，未触发上报。

顺带发现并处置一处（见 §一「顺带发现并修正一处」一段），已按三步范式记明，**未视为自决**——四处数字系纯粹依已合入之批丙数据重新实测所得，与判据无涉，且已在此详述可回退之据。

**承接登记照旧**（详见 `team/round51_prompts.md` §七，非本轮待办）：⚑H 余二栏（`events.summary`／`people.notes`）扩施、`L_HUAN.coord_certainty` 之连带（已随裁十四结清）、候补三人（子羔、樊迟、孟懿子）、⚑B 余五人（随侯、鬬伯比、薳章、鬬丹、熊率且比）、四处「已失时效」自陈句、楚武王—楚文王「父」边未织、待裁池诸项（⚑G／⚑I／⚑J）。

---

## 八、停在推送之前（裁四，本件不含推送口令）

**本轮不推送**。合入本体提交哈希、九表实读行数、`validate.py` 与 QA 结果已如上详列，现报领队、转呈站长；**得口令方推 `main`**。

| 项 | 实值 |
|---|---|
| 合入前基线 | `bf4242c`（与 `origin/main` 同哈希，2026-09-20 实测） |
| 合入本体提交哈希 | `5f87d399879b0b574eced3a463ed6516826fa664` |
| 提交信息首行 | `feat(skipper r51 合入): 批丙孔门鲁政配角七人＋r51-B楚武王＋fix51五项修正——people 166→174，relations 289→309，passages 506→509，conventions 升 v1.44` |
| `git status` | 干净，无残留改动（本文件之提交见下方追记） |

推送后照例带参复验（`https://chunqiu.timechorus.com/data/meta.json?v=<随机>` 之 `generated_at` 与仓库一致）、`gh run list` 核 Actions，俟站长口令下达后另行追记。

---

## 附：本轮涉及提交一览

| 提交 | 说明 |
|---|---|
| `5f87d39` | `feat(skipper r51 合入)`：三件数据合入＋conventions 升 v1.44＋CLAUDE.md 附则①补位＋Vision ⚑H 件随件提交＋`site/data/` 重生成＋QA 十处改数＋顺带发现四处一并处置＋归档＋清空（本文件所述合入本体） |

本文件自身之提交哈希，俟提交后由后续追记回填（§7 v1.31／v1.32：哈希一律实测回填、不得预填）。
