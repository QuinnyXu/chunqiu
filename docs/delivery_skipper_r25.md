# delivery_skipper_r25.md —— round25 合入交付说明

任务书：【任务 For Skipper · 第 25 轮合入件】。合入 `data/incoming/round25a/`（两件：晏婴《左传》本传线 + 《晏子春秋》T 层示范批）与 `data/incoming/round25b/`（叔向线 + 13 条无主角挂链事件审计），均按各自 `CHANGES.md`（唯一权威）逐条执行。

---

## 一、做了什么

### 1. 数据合入（`data/csv/`）

严格按两件 CHANGES.md 规定的执行顺序（events 先行，25a 两件在前、25b 在后）：

| 步骤 | 动作 |
|---|---|
| 1 | `events_new.csv`（25a 第一件，E207–E214，8 条）append |
| 2 | `people_new.csv`（`P_QIJING`）append；`fixes_people.csv` 按 id 整行替换 `P_YANYING`（升格：主角 27→28） |
| 3 | `sources_new.csv`（Z093–Z096，4 条）append |
| 4 | `event_people_new.csv`（16 行）／`passages_new.csv`（Q286–Q300，15 条）／`relations_new.csv`（R257–R259，3 条）append |
| 5 | `sources_new_b.csv`（25a 第二件，T006–T007）append |
| 6 | `fixes_events_b.csv` 按 id 整行替换 `E210`／`E214`（补 `source_ids`／`summary`） |
| 7 | `passages_new_b.csv`（Q301–Q304，4 条）append；`event_people_new_b.csv`（E210 叔向补挂 1 行）append |
| 8 | `events_new.csv`（25b，E219–E221，3 条）append |
| 9 | `people_new.csv`（25b，`P_QIXIDAFU`／`P_HANQI`／`P_YANGSHIWO`，3 条）append；`fixes_people.csv` 按 id 整行替换 `P_SHUXIANG`（升格：主角 28→29） |
| 10 | `sources_new.csv`（25b，Z097／Z098／G009，3 条）append |
| 11 | `event_people_new.csv`（6 行）／`passages_new.csv`（Q311–Q325，15 条）／`relations_new.csv`（R260–R264，5 条）append |
| 12 | **审计补挂（领队裁定 h：照准）**：`audit_event_people_new.csv`（E081←`P_MUJI`，1 行）／`audit_passages_new.csv`（Q326，1 条）append |
| 13 | **领队裁定 i**：`events.csv` 中 `E188`／`E212`／`E220` 三条 `category` 由「其他」改「论对」（`E196` 暂不动，列观察） |

`python tools/validate.py` → `python tools/csv_to_json.py` 重生成 `site/data/*.json` → 再跑一次 `validate.py`，**均通过，0 错误、0 软检警告**。

### 2. conventions.md 升号 v1.22 → v1.23

版本历史新增条目（`docs/conventions.md` 顶部），落实领队裁定 e/h/i：

- **§2**：新增「T 层不立 `people` 行、不织 `relations` 边」通例（Sophia 原文义"同一道防线的两侧"照录），先例出 round25a 第二件（使楚章之楚王、二桃杀三士三士均未立人物行/关系边）。
- **§2**：新增「同音撞名取传世称谓」判例——`P_QIXIDAFU`（祁奚，与既有 `P_QIXI`〔齐僖公〕拼音全同撞号）取《左传》本文称谓「大夫」为辨识后缀，是 `GONG` 后缀通则精神的类推适用。
- **§3**：事件分类枚举 16→**17** 类，新增「论对」（以谏诤/问对/贺辞等记言为事目本体、无独立行动骨架者）；`E188`／`E212`／`E220` 三条迁归（原均「其他」，「政论记言」观察项积三达门槛后转正）；`E196` 暂不动，列观察；图标缺口登记 r26 Vision 待办（与「政制」图标缺口合批）。`tools/validate.py` 的 `CATEGORIES` 集合同步更新。
- **§7**：「死者不作亲至」通例补限定语「**仅适用于史文明书其已卒者**」——不得反向援引本通例去推定或默认某人已卒；案例出 `E221`（叔向存殁经传无文，`death_year_bce` 留空，presence 仍从严标「相关」但不援引本通例，径依 §6「相关＝史文无其在场明文」定级）。

### 3. 归档与清空

- `data/incoming/round25a/CHANGES.md` → `docs/changes/r25a_yanying.md`（原样复制，`diff` 核对逐字一致）
- `data/incoming/round25b/CHANGES.md` → `docs/changes/r25b_shuxiang.md`（原样复制，`diff` 核对逐字一致）
- `data/incoming/round25a/`、`data/incoming/round25b/` 已清空（仅余 `.gitkeep`）

---

## 二、计数核验（含一处自我更正）

**本轮过程中我曾在中途报告里把 `wc -l`（含表头）行数误当数据行数直接报出**（people/passages/event_people/sources/relations 五张表各多算 1），已用 Python 精确重数更正。**以下为更正后的最终数字，是本轮唯一权威计数：**

| 表 | 合入前 | 合入后 | 增量 |
|---|---|---|---|
| events | 190 | **201** | +11（25a 首件 +8，25a 第二件净 0，25b +3） |
| people | 123 | **127** | +4（配角 P_QIJING/P_QIXIDAFU/P_HANQI/P_YANGSHIWO） |
| passages | 280 | **315** | +35 |
| event_people | 493 | **517** | +24 |
| sources | 133 | **142** | +9（含新启 T006/T007《晏子春秋》、G009《国语·晋语八》） |
| relations | 239 | **247** | +8 |
| places | 78 | 78 | 0（两批均无新增，理由见各自 CHANGES §7/§8） |

主角计数：**27 → 29**（晏婴・齐・第28位，叔向・晋・第29位）。年份跨度下延至 **前773–前514**（仍在 `[-800,-480]` 范围内）。

### 流程观察项：「预期 events≈225」与实测/CHANGES 自报数不符

任务书验收项写"预期 events≈225，出入较大即停并上报"。我按两件 CHANGES.md 合入后实测为 **201**，遂停机上报（未擅自判断 225/201 孰是），经领队核实：**本轮只有 1a（含第二件）、1b 两批，无第三批未下发增量，225 为任务书预期数字本身有误，201 为本轮正确结果**。

值得记录的是：**两件 CHANGES.md 自身的"合并模拟"验收表早已各自算出 201**（round25a §8.4／round25b §9.6），与我的独立合入结果完全吻合——这不是合入过程的偏差，是任务书预期数与备料方已交付的自证数字从一开始就没对上。**建议**：下轮任务书的预期计数直接由备料件 CHANGES 的"合并模拟"数回填，而非另行估算，可省一次同类核对空转。

---

## 三、验收实证：晏婴入齐组第 7 人 · 国色制零色彩工作

任务书要求"实证之，贴证据，不空言"，逐条核验如下：

**1. 色彩机制本就不在数据层，而在前端按国实时解析**（`site/app.js` 第 42–68 行）：

```
const STATE_FAMILY_VAR = { "齐": "--state-qi", "鲁": "--state-lu", ... };
function resolveProtoColors() {
  // 按人物所属国从 styles.css :root 读入国色，无个人色字段
}
```

`data/csv/people.csv` 全表**无 `color` 列**（已用 `grep color` 核实零命中）——「国色制」（r24a 裁定）下，人物色彩从不是数据管线要维护的东西。

**2. `P_YANYING.state = 齐`，属既有九国色家族之一，`--state-qi` 变量本轮零改动**：

```
$ git diff --stat -- site/styles.css site/app.js
（空，两文件本轮零改动）
```

`site/styles.css` 第 30 行 `--state-qi: #A5322A;` 一字未动。

**3. 「第 7 人」的计数依据**：`site/styles.css` 该行注记现存"（6 人）"，核对 `site/app.js` 的 `PROTAGONISTS` 数组中 `home`/首国取值为「齐」者，恰为 6 人（文姜、齐襄公、齐桓公、管仲、鲍叔牙、齐僖公）——与该注记完全吻合。晏婴 `state=齐`、无需 `home` 覆盖，即为该分组第 **7** 人；`PROTAGONISTS` 数组本身的新增（含徽记 `badge_yanying.svg` 等美术资产）是 Vision 前端层的工作，不在本轮 Skipper 任务范围内，本轮只保证数据层"晏婴入齐组"这一事实成立且不产生任何色彩相关改动。

**结论**：数据层新增一位齐国主角，前端色彩配置文件（`styles.css`／`app.js`）改动行数为 **0**——这正是"国色制"设计的意图所在（新增主角只需一枚徽记，不需要取色）。

---

## 四、验收对照表

| 验收项 | 结果 |
|---|---|
| `validate.py` 通过 | ✔ 0 错误、0 软检警告（合入全程跑了两次，均通过） |
| 线上主角 29 | 待 push 后生产复验，见下节 |
| 使楚条 T 层可查，且楚王无指实 | ✔ `Q301`／`Q302` 挂 `E210`，来源 `T006`；`modern_note` 明写"后世指为楚灵王系附会之说，本库不采" |
| 叔向—夏姬女姻亲边在 ego 数据中 | ✔ `R263`（`P_SHUXIANG`–`P_XIAJI`，其他/婿，medium） |
| conventions 新通例（e/h/i 三项）在案 | ✔ 见上"一、2" |
| 晏婴入齐组第 7 人·国色制零色彩工作 | ✔ 见上"三" |
| events≈225 出入过大即停并上报 | ✔ 已停机上报，领队裁定 201 为正确结果，不回改数据 |

---

## 五、r26 待办与复核清单（集中登记，勿散落）

1. **晋都新田 `L_XINTIAN` 专项迁点**（领队 r25 裁定 g）：立新地点行＋前585 后诸条（`E190`／`E194`／`E201`／`E210`／`E219`／`E220`／`E221` 等）迁点清单，由 Sophia 出料、Skipper 合入。本轮 `L_JIANG` 坐标/`description` 未动。
2. **史料复核缺口**（据实申报，需联网/ctext 环境复扫）：
   - `E213`／`E214`（昭公二十六年禳彗/路寝）年内叙次未获原文复核，`sort_key` 依传文暂定；
   - 晏婴卒年（`-500`）的《史记·十二诸侯年表》篇目定位未逐字复核；
   - `E220`（叔向贺贫，前535）系年推定的旁证（韩起于赵武卒后为晋执政）未复核；
   - round25a 第一件《左传·襄公十七年》《襄公二十八年》《昭公三年》《昭公二十六年》四篇、round25b 《左传·襄公二十一年》《僖公五年》两篇，仅"检索文本比对"层级，未达逐字复核，需复扫用字异文。
3. **`passages` 表无 `reliability` 列的结构缺口**（观察项，不动 schema）：门槛——T 层 `passages` 逾 20 条时重估是否加列。
4. **「政论记言」→「论对」新类落地后续**：`E196` 是否迁入留观察；「论对」类图标补齐（与「政制」缺口合批，登记 Vision 待办，本轮未实现）。
5. **可选修正建议（未采纳，留待裁定）**：`R255`（晏婴—崔杼）`rel_type` 由「其他」改「敌对」——领队本轮已裁定**维持「其他」不改**（晏婴之妙在"不死不亡而不与"，label 是文眼），此项已了结，非待办，仅存档说明不再另议。
6. **候补池**（各 CHANGES.md 已注明，非遗漏）：《左传·昭公十年》晏子劝陈桓子致邑于公；《国语·晋语八》叔向责行人子朱、与赵文子游于九原两章；《左传·襄公三年》祁奚荐仇荐子；《左传·昭公十四年》叔向论叔鱼与仲尼评语；《晏子春秋》晏子使吴/辞千金之聘等篇；羊舌虎/魏献子等人物行（前置以下两条未织边）。
7. **未织之边（上报，未自行裁量）**：齐景公—齐庄公兄弟边（经传无明文，领队裁定不织）；叔向—羊舌虎（亲属-同辈，需先立 `P_YANGSHEHU`）；韩起—魏献子（需先立魏献子人物行）；可选补挂 `E206`←`P_HANQI`（有明文可依，未做因配额已满）。
8. **流程观察项**：任务书"预期 events≈225"与两件 CHANGES 自报数（201）不符一事，已记入 `docs/conventions.md` v1.23 历史条目；建议下轮任务书预期计数改由备料件"合并模拟"数回填。

---

## 六、已知问题

- 无数据层遗留问题；`validate.py` 全绿。
- `E196` 是否迁入「论对」类留观察（§五第 4 点），本轮未动其分类。
- 晋都新田口径问题贯穿本轮多条事目（`E210`/`E219`/`E220`/`E221` 落点均沿用既有 `L_JIANG`），已登记 r26 专项，本轮未处理。

## 七、交接备注

- 下一步合入者/Vision：`P_YANYING`／`P_SHUXIANG` 及三名新配角尚未进入 `site/app.js` 的 `PROTAGONISTS` 数组（需配徽记 SVG 资产），前端选人页/时间线暂不可见二人卡片，属正常的数据先行、前端后随节奏，非缺陷。
- r26 待办清单已全部集中于本文件"五"节，请后续任务书据此排期，勿另起散落记录。
