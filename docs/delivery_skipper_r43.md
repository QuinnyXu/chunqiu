# delivery_skipper_r43 · r43 合入交付说明

任务书：【任务 For Skipper · r43 合入】（领队转交）。执行者：Skipper。

## 一、合入次序与逐件计数（与合并模拟核对结果）

**次序**：annot 先、zhiben2 后，每次以最新主表为基（两件对 `sources.csv`／`passages.csv`／`events.csv` 均有写入，但 ID 交集为空，逐件确认互不覆盖）。

### 1.1 annot（`data/incoming/round41_xinian6_annot/`）

整行替换 **11 行**：`sources.J002`；`passages.Q073/Q080/Q443/Q446/Q447/Q448`；`events.E076/E082/E083/E084`。无新增、无删除、无新 ID。

实测合入结果：

```
覆盖 sources.csv:  J002        变动字段 = ['notes']
覆盖 passages.csv: Q073        变动字段 = ['modern_note']
覆盖 passages.csv: Q080        变动字段 = ['modern_note']
覆盖 passages.csv: Q443        变动字段 = ['modern_note']
覆盖 passages.csv: Q446        变动字段 = ['modern_note']
覆盖 passages.csv: Q447        变动字段 = ['modern_note']
覆盖 passages.csv: Q448        变动字段 = ['modern_note']
覆盖 events.csv:   E076        变动字段 = ['summary']
覆盖 events.csv:   E082        变动字段 = ['summary']
覆盖 events.csv:   E083        变动字段 = ['summary']
覆盖 events.csv:   E084        变动字段 = ['summary']
```

与其 CHANGES.md §11.4／§12.2 所列逐行落点**逐条相符**。

### 1.2 zhiben2（`data/incoming/round41_zhiben2/`）

新增 **2 行**（`sources.B002`／`B003`）＋整行替换 **36 行**：`places` 26 行（郑宋卫幅 21 点＋`L_SHOUZHI`＋`L_YU`／`L_WUDU`／`L_BOJU`／`L_ZUILI` 承接句）；`passages.Q344/Q347/Q372/Q373/Q379/Q442` 6 行；`sources.J001/Z101/Z102` 3 行；`events.E244` 1 行。

实测合入结果（节选，逐行变动字段与 CHANGES.md §11.4 五十八条断言底稿的合并动作清单**逐条相符**，此处从略，完整清单见该文件）。

### 1.3 计数核对（以合并模拟为准）

| 表 | 合入前 | annot 后 | zhiben2 后（最终） | 两件合并模拟预期 |
|---|---|---|---|---|
| sources | 175 | 175 | **177** | 177 ✓ |
| passages | 436 | 436 | 436 | 436 ✓ |
| events | 236 | 236 | 236 | 236 ✓ |
| places | 91 | 91 | 91 | 91 ✓ |
| people／event_people／relations／archaeology／background | 不变 | 不变 | 不变 | 不变 ✓ |

**逐表全等，与两件 CHANGES.md 的合并模拟预期完全相符。**

### 1.4 §A 套引注体例执行（annot 定稿后，Skipper 直接执行）

依 zhiben2 §A 承接句原样执行，**只声明版次基准，未改动未核状态**：

- `E273.summary` 末尾追加：「【r43 版本著录之承接（裁定 17）】……鄀与商密之地望，两书**仍均无从核**，`place_id` 仍从严留空……」
- `Q453.modern_note` 末尾追加：「【r43 版本著录之承接（裁定 17）】……杨注僖公二十五年**仍待纸本**，页码仍不填……」

实测：追加前后 `E273`／`Q453` 均只增补上述一段文字，其余字段与既有正文一字未动；合入后全库「页 N」引注共 **11 处**，`E273`／`Q453` 只承版次、不生页码。

## 二、conventions 升号

**v1.33 → v1.34**（2026-08-29）。新增六条正式收录（详见 §7）：

1. 纸本扫描本视同纸本核字，著录须带「扫描本」三字（源出裁定 18）。
2. 解悬之著录三要件（所核之字＋预登记去向＋回退条件）。
3. **否定性核字结果之效力自限**（追加裁定 23 明令必收；含与「未问不推」「隶定栏自限」三条同族分工表，及适用范围及于地望之说明）。
4. 名物用字之异核定后之状态词，与「同指一地」之分账。
5. 条件关闭之留痕，与判定反转之留痕同例。
6. 【原簡】隶定栏自限之两用之界（首证：判字则错、核号则准）。

**一项未收**：zhiben2 §12.2「谭图引注体例与两书版次基准」——任务书明示此条可选、拿不准即不收，Skipper 判定其内容与现行 §7 既有口径句（`sources.url` 体例从实、二手引述须标核对状态）有实质重叠、逾越现行必要性不明确，故按「不收」处理，转呈领队定夺（见下方待裁清单）。

旧 v1.33 全文已原样降为历史行（未删未改），置于 v1.34 之后。

## 三、归档路径

- `docs/changes/r43_xinian6_annot.md`（annot CHANGES.md 原样归档）
- `docs/changes/r43_zhiben2.md`（zhiben2 CHANGES.md 原样归档）
- `docs/changes/r40_xinian6.md` 末尾追加一句指路（**不改原文**），指向本轮 `r43_xinian6_annot.md` 承接其 §10 后续。
- `data/incoming/round41_xinian6_annot/`、`data/incoming/round41_zhiben2/` 已按 §10.1 归档纪律（先归档、后清空）清空删除。

## 四、validate 实测输出原文（Skipper 独立复跑，非沿用 Sophia 输出）

**第一次**（CSV 全量合入——annot 先、zhiben2 后依次写入同一份主表——之后）：

```
OK：全部校验通过
EXIT=0
```

**第二次**（`E273`／`Q453` 套引注体例追加之后）：

```
OK：全部校验通过
EXIT=0
```

`python tools/csv_to_json.py` 重新生成生成物，输出：

```
archaeology.csv -> site/data/archaeology.json (8 行)
background.csv -> site/data/background.json (11 行)
event_people.csv -> site/data/event_people.json (612 行)
events.csv -> site/data/events.json (236 行)
passages.csv -> site/data/passages.json (436 行)
people.csv -> site/data/people.json (153 行)
places.csv -> site/data/places.json (91 行)
relations.csv -> site/data/relations.json (282 行)
sources.csv -> site/data/sources.json (177 行)
meta.json 已生成（9 张表，年份 -773..-472）
```

**说明（如实更正一处措辞）**：conventions v1.34 版本记录首次写作时误将两次 `validate.py` 复跑描述为「annot 单独合入后一次、zhiben2 追加合入后一次」——实际执行是把 annot、zhiben2 两件依次直接写入同一份 `data/csv/` 主表（脚本内顺序执行，未在两件之间暂停单独跑一次 `validate.py`），第一次独立复跑发生在**两件全部写入之后**。已在 conventions.md 内更正此处措辞（改为「CSV 全量合入……后一次；套引注体例追加后再一次」），不影响验证结论本身（两次复跑均 exit 0、无告警，且合入顺序本身——annot 先写入、zhiben2 基于更新后的主表再写入——完全照办）。此项按「QA 基础设施诚实优先」自查自纠，随交付一并如实记录。

## 五、提交与 Actions

| 项 | 值 |
|---|---|
| 合入提交 | `14277b1` |
| 推送 | `e54ae63..14277b1 main -> main` |
| Actions 运行 | `33285029941`（Deploy site to GitHub Pages） |
| Actions 结论 | `status=completed`、`conclusion=success` |

## 六、四条带参生产复验（逐条实测证据）

方法：数据层用 Node 直连生产 `data/*.json`（`tools/qa/r43_prod_check.js`）；渲染层用 Playwright 无头浏览器实测生产站真实 DOM（`tools/qa/r43_prod_render_check.js`），带 `?v=<timestamp>` 绕开缓存。两脚本均已入库。

### 断言 1：婢／嬖并陈可读

- **数据层**：生产 `passages.json` 中 `Q443.modern_note` 同时含「婢」与「嬖」二字；`Q073`、`E076` 均存在且非空。首 120 字：「【出土文献层·与《左传》并陈不裁；本条**悬已解、异已成立、判已定案**……判定为「**异·措辞层·并存……」」
- **渲染层**：生产站 `#/p/P_JINWEN/timeline`，展开 `<details data-eid="E076">`，DOM 文本同时含「婢」「嬖」二字。**PASS。**
- 口径说明：库内「嬖」为入注备考（其出处经 Sophia 三度实测为《左传·庄二十八》本文「驪姬嬖」与 r40 通假说，与裁定 21 原记「维基文库『嬖』」出入已在 annot §12.3 留痕上报），本次验的是「两说在生产页面并陈且可读」，未据裁定原文改库内出处著录。

### 断言 2：五鹿新点落图

- **数据层**：生产 `places.json` 中 `L_WULU`：`lat=35.95`、`lng=115.03`、`certainty=low`、`coord_certainty=low`；`modern_location="河南省清丰县西北一带（一说濮阳县南）"`。
- **渲染层**：生产站 `#/p/P_JINWEN/map`，`[data-place="L_WULU"] circle.dot` 存在，投影坐标 `cx≈708.0`、`cy≈198.33`，与 CHANGES.md 所载回校值「x≈708、y≈198」相符。**PASS。**

### 断言 3：E084 正读

- **数据层**：生产 `events.json` 中 `E084.summary` 含「與」与「简 34」。
- **渲染层**：生产站 `#/p/P_QINMU/timeline`（`P_JINWEN` 未挂链 E084，改走秦穆公页），展开 `<details data-eid="E084">`，DOM 文本含「與」与「简 34」。**PASS。**

### 断言 4：简 34 著录三处可见

- **数据层**：`Q448.modern_note`、`E084.summary`、`J002.notes` 三处均含「简 34」；`Q448.quote_original` 实测仍为「立六年，秦公率師**牙**惠公戰于韓……」（含「牙」不含「與」，未回改）。**PASS，四处全部实读命中。**

### 附加不变量（生产实测）

`meta.json`：`sources=177`／`places=91`／`passages=436`／`events=236`（其余不变）；`B002`／`B003` 均存在，且未出现在任何行的 `source_ids` 中（脚本对 `events`／`places` 全表扫描确认）。

**生产复验汇总：数据层 21/21 PASS，渲染层 6/6 PASS，共 27/27 PASS，0 FAIL。**

## 七、需领队或 Xu 裁定的事项清单

1. **【最要紧，annot §12.3】裁定 21 所记「维基文库『嬖』」与实测不合**：裁定 21 令「维基文库『嬖』为转录破读，入注备考」，Sophia 三度实测该转录本页面第六章通行字正文与隶定栏均作「婢」、全页「嬖」三见俱在他章、该章「嬖」字零命中，据此**未按裁定原文著录出处**，改照实录（出处为《左传·庄二十八》本文「驪姬嬖」＋r40 通假说），出入已留痕上报、未据以入库。**本轮合入不受影响**（验的是「两说并陈可读」，不涉出处著录本身），但出处表述与裁定原文的出入仍需领队复核确认。
2. **`Q448.quote_original` 是否另立「校记」体例**：现状维持不回改（底本仍作「牙」，正读「與」只入注）。Sophia annot §12.4 提请，若领队愿另立「校记」体例（引文照录底本＋注内出校，一体施行全库 J 层），需另作裁定；现状不阻塞。
3. **梁城／解梁城是否同地**：用字已核定（《系年》确无「解」字），但地望之问（是否同指一地）谭图与杨注本轮均无从核，annot 未代裁、未立地点行，登记待考实。
4. **许田／許 二标混淆风险**：谭图同区另标「許」，距新点约 5.6 km，站长未言图上「許田」二字落于何处、与「許」是否并见，zhiben2 §13.2 待考实项，仍开。
5. **「莘案」与「婢案」互指**：Sophia 建议两件均定稿后补两案互指说明（性质有别——莘案是转录本改通行字、婢案是转录本破读），**任务书未点名，本轮未做**，登记待领队裁定是否需要及由谁执行。
6. **conventions §7 未收之 zhiben2 §12.2**（见上文「二」）：谭图引注体例与两书版次基准是否需另立一条 conventions 通例，请领队定夺；若需收录，草案文字已在 `docs/changes/r43_zhiben2.md` §12.2 备好，可直接采用。

## 八、其余登记（不阻塞合入，照录）

- D 组清账（杨本定公四年「我必復楚國」句下杜注与页码，与已核之页 1548 同区）——待站长下次翻书顺手清。
- 整理本「弗順」排印形貌、第五章「既視之」一处之读——待考实，未推及。
- 四条图面待考实线索（夷仪「陈仪」并标、曹南「曹县／南山」邻标、鹿上阮城村 20 km 出入、帝丘高城遗址参照物不一）——俟下次翻书顺手清。
- 楚吴越幅之幅名未照第一册目录核（郑宋卫幅已核）——体例缺口，登记待续。

## 九、CLAUDE.md 说明

`git status` 实测本轮开工前即有 ` M CLAUDE.md`（新增「任务书纪律（活文档原则）」五条），依任务书 B 项明示「不属本轮产出，不要回退、不要顺带提交」，本轮**未触碰该文件**，让其继续留在工作区。

## 十、涉及文件（供核）

- 数据：`data/csv/sources.csv`、`data/csv/passages.csv`、`data/csv/events.csv`、`data/csv/places.csv`
- 生成物：`site/data/sources.json`、`site/data/passages.json`、`site/data/events.json`、`site/data/places.json`、`site/data/meta.json`
- 规范：`docs/conventions.md`（v1.34）
- 归档：`docs/changes/r43_xinian6_annot.md`、`docs/changes/r43_zhiben2.md`、`docs/changes/r40_xinian6.md`（末尾追加指路句）
- QA 复验脚本：`tools/qa/r43_prod_check.js`（数据层）、`tools/qa/r43_prod_render_check.js`（渲染层）
- 本文件：`docs/delivery_skipper_r43.md`
