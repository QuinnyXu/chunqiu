# delivery_skipper_r45 · 楚吴越幅名结案 ＋ round45_jiagu（夹谷之会单条试点）合入

任务书：`team/round44_prompts.md` 任务 4b（现行文本，含领队核库后账实更正段），本轮实读时点 2026-09-02。

---

## 一、本轮做了什么

1. **微件·楚吴越幅名结案**：`docs/conventions.md` §7 v1.35 段①自限句「楚吴越幅之幅名尚系沿用 r27c 以来之称谓，未照目录核」——站长照《中国历史地图集》第一册目录页 29–30 核实，正式幅名即"楚吴越"，与惯称相符，依此结案；原自限文字照留痕纪律**不删**，就地续记核对结论与出处。conventions 升号 **v1.36 → v1.37**。
   - **前半（两份考订文档入库）已于 r44b 办毕，本轮未重做**——`docs/kaoding_jiaoji.md`／`docs/kaoding_kongzi.md` 落笔前已用 `git ls-files` 复核，确认 tracked（提交 `6539446`、回填 `87b5d73`）。
2. **round45_jiagu 合入**：依 `data/incoming/round45_jiagu/CHANGES.md`（Sophia 备料，§9「交 Skipper 的合入要点」）纯 append 10 行，落地夹谷之会（`E274`）单条试点。

---

## 二、conventions 实升版本号与幅名半格结案条文实际文字

**版本号**：v1.36 → **v1.37**（`docs/conventions.md` 第 3 行头部记录）。

**§12.2 结案条文实际文字**（插入于原自限句之后、②两书版次基准之前）：

> 幅名以第一册目录为准（**郑宋卫幅之幅名已于 r43 由站长照目录核实；楚吴越幅之幅名尚系沿用 r27c 以来之称谓，未照目录核**——**此项已于 v1.37 结案，见下方续记**）。**楚吴越幅之幅名结案（v1.37 新增，2026-09-02 站长核）**：站长照《中国历史地图集》第一册目录页 29–30 核实，正式幅名即"楚吴越"，与惯称相符——依此结案；上文自限文字照留痕纪律不删，仅此续记核对结论与出处（目录页 29–30，2026-09-02 站长核）。

原自限句一字未删，只在其后加一句指向续记的短句，续记本身另起一句——与 `L_YU`（r31）、婢案回退条件关闭（r43）等既往"条件关闭之留痕"先例同一写法。

---

## 三、sim_jiagu.py 与 validate.py 实测输出

**一处执行插曲，如实记录**：首次尝试时，我先把 `_new.csv` 直接 append 进 `data/csv/` 主表，再跑 `sim_jiagu.py`——该脚本设计为"自行从当前 `data/csv/` 拷贝副本、在副本上再 append 一次 `_new.csv`"，由于主表已先被我手工合入，脚本在副本上又叠加了一次，导致 9 处重复 ID／`sort_key` 重复告警，`FAIL 57/75`。判明原因后：`git checkout -- data/csv/` 撤回手工合入，在**预合入的干净状态**下复跑一次，再正式合入主表。此为一次执行顺序之误、非数据之误，已改，未抹平。

**预合入状态复跑 `python data/incoming/round45_jiagu/sim_jiagu.py`**：

```
—— 75/75 通过
== 副本上跑 tools/validate.py ==
OK：全部校验通过
  PASS  validate.py exit 0 ＝ 0
  PASS  validate.py 无软检告警
```

**正式合入后，仓库根跑 `python tools/validate.py`**：

```
OK：全部校验通过
exit=0
```

---

## 四、合入后九表实际行数

| 表 | 合入前 | 合入后（实测） | CHANGES.md 预期 | 判 |
|---|---|---|---|---|
| `sources.csv` | 177 | **179** | 179 | 相符 |
| `places.csv` | 91 | **92** | 92 | 相符 |
| `events.csv` | 236 | **237** | 237 | 相符 |
| `passages.csv` | 436 | **440** | 440 | 相符 |
| `event_people.csv` | 612 | **614** | 614 | 相符 |
| `people.csv` | 153 | **153** | 153 | 全等 |
| `relations.csv` | 282 | **282** | 282 | 全等 |
| `archaeology.csv` | 8 | **8** | 8 | 全等 |
| `background.csv` | 11 | **11** | 11 | 全等 |

`site/data/`：`csv_to_json.py` 重生成后，仅 `events.json`／`places.json`／`passages.json`／`sources.json`／`event_people.json`／`meta.json` 六个文件变动，`people.json`／`relations.json`／`archaeology.json`／`background.json` 四表内容未变（与 CHANGES.md §9 第 4 点预期相符）。

**提醒事项已如实记下**：任务书提醒 fix44b 的合并模拟基于合入前行数所写，需在其复跑时以本表所列合入后实际行数为准复核——本轮只如实记录，未替 fix44b 复跑。

---

## 五、改动清单

| 提交 | 内容 |
|---|---|
| `b714f1a` | docs(skipper r45 微件): 楚吴越幅名结案——conventions升v1.37 |
| `63e71af` | feat(skipper r45 合入): 夹谷之会单条试点——孔子首条「亲至」+经传/S层四条分层 |

**63e71af 改动文件**（12 个）：`data/csv/{event_people,events,passages,places,sources}.csv`（各 append）、`site/data/{event_people,events,meta,passages,places,sources}.json`（重生成）、`docs/changes/r45_jiagu.md`（新增，CHANGES.md 原样归档）。

**归档先于清空**：`docs/changes/r45_jiagu.md` 归档提交完成后，方 `rm -rf data/incoming/round45_jiagu/`（含 `sim_jiagu.py`，依既往先例不入 `data/csv/`，随目录清空、不单独入库）。

---

## 六、提交哈希、push 结果、Actions 编号与结论

| 项 | 值 |
|---|---|
| 提交1（微件） | `b714f1a` |
| 提交2（jiagu 合入） | `63e71af` |
| push | 两提交合并一次 `git push origin main`，`87b5d73..63e71af main -> main`，成功 |
| Actions 运行号 | `33630223035` |
| Actions 结论 | `completed success`（`gh run view` 实测） |

（两提交同批 push，GitHub Actions 按 push 事件触发一次、取最新提交 `63e71af` 构建，故只有一个运行号，覆盖两提交的合并结果。）

---

## 七、生产带参复验三条逐条实测结论

**DNS 可解析**（与 r44 不同，本次沙盒环境可解析 `chunqiu.timechorus.com`，`nslookup` 返回多个 A/AAAA 记录，`curl` 探测 200）。复验方式：直连生产 `data/*.json?v=<时间戳>` 接口（数据层核对，与 r43/r44 既往先例 `tools/qa/r43_prod_check.js`／`r44_prod_check.js` 同一体例；页面渲染层属 Vision 前端事，CHANGES.md §9 第 7 点已注明"若前端走查需要，请另立件"，本轮未做浏览器渲染层复验）。新增 `tools/qa/r45_prod_check.js` 已随本轮提交入库（见下方提交记录）。

**逐条实测**：

| # | 复验点 | 结论 | 依据 |
|---|---|---|---|
| 1 | 孔子页新增「亲至」事目 | **通过** | 生产 `event_people.json` 含 `E274`/`P_KONGZI`，`presence="亲至"`、`directness="direct"`；`P_QIJING` 同标「亲至」；晏婴（`P_YANYING`）不挂本条（反面断言通过） |
| 2 | 夹谷事目页四条引文分层（经/传二条/史记 S 层） | **通过** | 生产 `passages.json`：`Q454`（经，`quote_type="原文"`、`source_id="Z118"`）、`Q455`／`Q456`（传上下半，`原文`/`Z118`）、`Q457`（史记，`quote_type="后出叙事"`、`source_id="S015"`，`modern_note` 以【】层标起） |
| 3 | `L_JIAGU` 显示未定位 | **通过** | 生产 `places.json`：`L_JIAGU` 的 `lat`／`lng`／`coord_certainty` 三栏俱为 `null`，`certainty="low"`，`modern_location` 含"未定" |

**脚本实测输出**（`node tools/qa/r45_prod_check.js`，对生产环境运行）：

```
== meta ==
{"archaeology":8,"background":11,"event_people":614,"events":237,"passages":440,"people":153,"places":92,"relations":282,"sources":179}
共 21/21 PASS，0 FAIL
```

生产 `meta.json` 九表行数与本轮实测合入后行数（见上表四）逐项相符。

---

## 八、回补义务与待议池两项登记落点

1. **回补义务**（登记，本轮不办，随骨干批带出）：鲁定公未立 `people` 行，`E274` 挂链现只二人（`P_KONGZI`／`P_QIJING`），会主鲁定公不在其中——非在场之判，是分批之形。骨干批立 `P_LUDINGGONG` 行后，须回挂 `E274`「亲至」，依据是经传明文「公會齊侯」。**落点**：本交付文档 §八第 1 条 ＋ `data/incoming/round45_jiagu/CHANGES.md` 原文 §2.1（已归档 `docs/changes/r45_jiagu.md`，可查）。
2. **待议池**（登记，本轮不办）：
   - `quote_type=后出叙事` 档软检现仍 `False`（未开档），`Q457` 已照体例写足层标，可作该档未来开档时的净样本一条；本件未改 `tools/validate.py`（红线 1，护栏归 Skipper／领队）。
   - 三邑（郓、讙、龟阴）＋夹谷共八点纸本清单：`夹谷、费、郈、成、大野`（`docs/kaoding_kongzi.md` §7.3 自限四已登记五点）＋本轮新加郓、讙、龟阴三点，合八点，待骨干批出回填表统一核对。
   - 修-A（`P_QIJING.active_years_bce` 前548-前516 → 前548-前490，齐景公卒年前490 有经传明文）：CHANGES.md §6 只报不改，本轮未办，随任一触及 `people` 的后续批次顺办。

---

## 九、已知问题 / 交接备注

1. **合并模拟脚本使用顺序须"先跑预合入态、再手工合入"**——本轮已踩过一次这个坑（见 §三），特此记录避免后续轮次重踏：`sim_*.py` 类脚本设计为"从当前 `data/csv/` 起拷贝并叠加"，若先手工合入主表再跑脚本会重复叠加导致假阳性 FAIL。
2. **conventions 本轮只升一次号（v1.37）**，仅记幅名半格一项；round45_jiagu 合入本身不涉 conventions 条文（CHANGES.md 已明示"未涉四题条文"），故未随之再升号，版本头已写明这一点。
3. **前端渲染层复验未做**（页面是否实际显示"未定位"字样、引文分层徽标颜色是否正确渲染），本轮只做数据层核对；若 Vision 走查发现渲染问题，依 CHANGES.md §9 第 7 点另立件处理。
4. **fix44b 尚未合入**——Sophia 正在备料 `data/incoming/fix44b/`，本轮未触碰该目录；其合并模拟断言需在其合入时以本文档 §四行数为准复跑（任务书已提醒，此处再次确认）。
5. 拿不准即停：本轮执行过程中未遇到需要上报裁定的史学疑点或任务书与实况不符之处，前置条件（考订文档已 tracked）核实无误后按现行文本顺利执行完毕。

---

**提交记录补充**：本交付文档本身连同 `tools/qa/r45_prod_check.js` 将作为独立提交提交入库；其提交哈希与 Actions 运行号将以"追记"形式回填于后续追记文档（依 §7 v1.31 实测口径通例，不预填）。

---

## 十、追记——回填本交付文档自身的提交哈希与 Actions 运行号

依 §7 v1.31「交付体例·实测口径」通例，动作实际发生后实测回填：

| 项 | 值 |
|---|---|
| 提交（含本文档 + `tools/qa/r45_prod_check.js`） | `0ebe231` |
| push | `63e71af..0ebe231 main -> main`，成功 |
| Actions 运行号 | `33630529339` |
| Actions 结论 | `completed success`（`gh run view` 实测） |

依 §7 v1.32「回填链截断于追记提交」边界，回填到此为止；本条以下若再有仅用于确认部署的收尾提交，其自身哈希与运行号不再入表，改口头上报领队。
