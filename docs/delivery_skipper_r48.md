# Skipper 交付 r48 —— round46_jiliang 季梁点将件合入执行记录

任务书：`team/round46_prompts.md` 任务 2b【任务 For Skipper · 季梁件合入】（2026-09-03 领队发件，⚑A–⚑F 六项裁毕）。
备料件：`data/incoming/round46_jiliang/`（Sophia，17 行，`CHANGES.md` 371 行）。

---

## 一、改动清单

`data/csv/` 七表纯 **append 17 行**，无整行替换、无删除、无既有 ID 变动、无既有行任何字段变动：

| 表 | 新增 | ID |
|---|---|---|
| `events` | 2 | `E294`（桓六 楚武王侵随）／`E295`（桓八 速杞之战） |
| `passages` | 6 | `Q489`（`Z002`）＋新开段 `Q490`–`Q494`（`Q490`／`Q491` 属 `Z002`，`Q492`–`Q494` 属 `Z132`） |
| `sources` | 1 | `Z132`《春秋左传·桓公八年》（**桓六复用既有 `Z002`，未新建**） |
| `people` | 2 | `P_JILIANG`（季梁，`is_protagonist=0`）／`P_SUISHAOSHI`（随少师） |
| `event_people` | 4 | `E294`×2、`E295`×2，presence 一律「亲至」／directness 一律「direct」 |
| `relations` | 1 | `R303`（季梁—少师，`rel_type=其他`） |
| `places` | 1 | `L_SUIGUO`（随，坐标三栏留空） |

`conventions.md` 本轮**未升号**（v1.41 沿用）——CHANGES §14.8 明言本件未提出条文新增，任务书任务 2b 执行块亦未令升号，与批甲轮升号（v1.40→v1.41）为两回事。

---

## 二、合入后九表实际行数与新 ID 段用量

`wc -l data/csv/*.csv`（减表头 1）实测：

| 表 | 合入前 | 合入后 | 预期 |
|---|---|---|---|
| events | 256 | **258** | 258 |
| passages | 471 | **477** | 477 |
| sources | 192 | **193** | 193 |
| people | 164 | **166** | 166 |
| event_people | 645 | **649** | 649 |
| relations | 285 | **286** | 286 |
| places | 95 | **96** | 96 |
| archaeology | 8 | 8（不变） | 8 |
| background | 11 | 11（不变） | 11 |

九表逐一相符，无一处偏差。新 ID 段：`events E294–E295`（批甲网段余号内，`E296` 仍未占）、`passages Q489`＋新开段 `Q490–Q494`、`sources Z132`（接台账尾号）、`relations R303`（接台账尾号）、`people P_JILIANG`／`P_SUISHAOSHI`、`places L_SUIGUO`。退役 ID（`E005`／`E006`／`Z098`）未涉及。

---

## 三、质量门实测

**预合入态**（仓库根执行 `python data/incoming/round46_jiliang/sim_jiliang.py`）：

```
合计 4348 条断言：4348 PASS / 0 FAIL
exit 0
```

基线九数护栏首节全绿，说明本地基线（`ebfccdd`，256/471/192/164/645/285/95/8/11）与 CHANGES.md §0 所记收工基线一致，未再移动——无需照"照实上报、勿改数据"分支处理。

**合入后**：

```
python tools/validate.py
OK：全部校验通过
```

`exit 0`，无告警。

**`csv_to_json.py` 重生成**：九张 `site/data/*.json` 与 `meta.json` 逐表行数核对，与上表完全一致（258/477/193/166/649/286/96/8/11）。

---

## 四、QA 脚本改动前后对照与实跑结论

### 4.1 预期内联动（按任务书指示逐条同步）

| 文件 | 改动前 | 改动后 |
|---|---|---|
| `tools/qa/r43_prod_check.js:68–71` | `sources=192／places=95／passages=471／events=256` | `sources=193／places=96／passages=477／events=258` |
| `tools/qa/vision_r46.js:343` | 检索引文组总量 `471` | `477` |

### 4.2 `r44_prod_check.js`／`r45_prod_check.js` 核实结果

两文件逐一 `grep` 核实 `meta.tables`／固定数字断言：**均只在 `console.log(JSON.stringify(meta.tables))` 处引用 `meta.tables`，无任何与九表行数绑定的断言**，故**未改**——不凭推定动手，与上批（r47）核实 `r44` 无此类断言而未改同办。

### 4.3 走查门实跑（本地 `python -m http.server 8791` 服务 `site/`）

| 脚本 | 结论 |
|---|---|
| `vision_r46.js` | **82/82 全过**（检索引文组总量断言实测 477，「＝」限域、无障碍树等其余 81 项无回归） |
| `vision_r32.js` | **29/29，失败 0 项**（J 层色矩阵与移动端徽标复验，与本批数据无涉，无回归） |
| `vision_r28.js` | **合计 FAIL 0 条**（768/390px 七视图无横向溢出、无页面错误，截图产出自检全过） |
| `badge_silhouette_r28.js` | 全部"通过"，无回归（徽记撞形分布分析，与本批无涉） |
| `quote_layer_color_r32.js` | 全部达标（六档色矩阵对比度与色觉模拟复验，与本批无涉） |
| `regress20.js` | 17 人物轨迹回放全部渲染正常，**页面错误：无** |

**一处自我发现并已清理的副作用**：首次跑 `vision_r46.js` 时误在 `tools/qa/tools/qa/screenshots/` 下产出两张嵌套路径截图（脚本内部相对路径在 `tools/qa` 目录下执行时的已知行为，非数据改动所致），已 `rm -rf` 清理，`git status` 复核确认无残留。

### 4.4 生产带参复验（`?v=`，直连 `chunqiu.timechorus.com`）

| 脚本 | 结论 |
|---|---|
| `r43_prod_check.js` | **21/21 PASS**（含新四条不变量 `sources=193／places=96／passages=477／events=258`） |
| `r44_prod_check.js` | **24/24 PASS** |
| `r45_prod_check.js` | **21/21 PASS** |

**沙盒 DNS 说明**：首次调用 `r43_prod_check.js` 时 Node 内置 `https` 模块报 `getaddrinfo ENOTFOUND chunqiu.timechorus.com`；随即以 `nslookup`（正常返回 4 条 A/AAAA 记录）与 `curl -m 8`（`HTTP 200`）及裸 `node -e "dns.lookup(...)"`（正常返回 IP）复测均可达，判为**瞬时解析噪声**（与 r44/r45/r45b/r46 既往"沙盒 DNS 限制非站点不可达"同类现象），**未改动 `dangerouslyDisableSandbox`** 即可复测通过，故未采用 r45b 式"下载响应体本地复算"的迂回路径。复验路径：Node 内置 `https` 直连 `https://chunqiu.timechorus.com/data/*.json?v=<timestamp>`。

**任务书第 10 步五项逐条实测**（临时定向脚本，用后即删，未入库——与 r47"E274 挂链／19 事目抽验／L_CHENGFU-CHENGPU 不混"一类临时脚本同一处置）：

1. **季梁与随少师两人物页可读**：`P_JILIANG`、`P_SUISHAOSHI` 两行生产实测存在，`P_JILIANG.name=季梁`。
2. **两事目引文六条分层可读**：`E294` 挂 `Q489–Q491`（`source_id=Z002`）、`E295` 挂 `Q492–Q494`（`source_id=Z132`），六条 `quote_type` 均为「原文」、`quote_original` 均非空，id 恰为 `Q489–Q494`。
3. **`L_SUIGUO` 显示未定位**：`lat`／`lng`／`coord_certainty` 三栏生产实测均为 `null`，`certainty=low`；连带核对 `L_SUI`（遂）`ancient_name=遂` 一字未动。
4. **`P_JILIANG.is_protagonist=0` 之实证**：生产实测为 `0`；主角总数仍为 **33**（未因本件升格）。
5. **`P_SUISHAOSHI` name**：生产实测为**「随少师」（简体）**——全库 `people.name` 栏一律取简体，任务书所书「隨少師」（繁体）系引经传本文以指认该条记录的取字依据，非要求栏内字面从繁；`P_XIHOU`／`P_JIETUIMU`／`P_FEIWUJI` 等既有无名者立行先例同为简体存储，本件与库内惯例一致。
6. **附**：`P_CHUWEN.relations` 生产实测仍含「未入库」，三行楚线注文一字未动。

**共 39/39 PASS，0 FAIL**。

**两处脚本自查并已修正（如实记录，QA 诚实优先）**：临时脚本首跑出 2 条 FAIL——① 断言字段误写 `places.name`（该表实际字段名为 `ancient_name`），改字段名后通过；② 断言字面误比对繁体「隨少師」而实际字段（及全库惯例）为简体「随少师」，改断言预期值为简体后通过。**两处均系脚本断言之误，非数据之误**，已在脚本内直接改正，反面数字（33、39/39）已复核为真实结果。

---

## 五、⚑A 两条明书之落点

依领队指令，⚑A 之两条明书**入本交付文档，不入公开数据表**：

1. **此格站长一言可改**：`is_protagonist` 一格站长随时可改，改一格之成本随时付得起；读者反响若聚于季梁，即为升格之据——点将机制的完整回路本就该由读者反响闭合。
2. **「点单到上线」之诺已践**：人入库、两论（「夫民，神之主也」之谏与「不當王，非敵也」之言）俱在事目页、检索可得；升格与否是主角线之别，非在库与否之别。

同时归档于 `docs/changes/r46_jiliang.md`（即 CHANGES.md §13 ⚑A 原样）。

---

## 六、回补义务与候补池两项登记落点

- **⚑B 回补义务**（楚武王最要紧）：楚武王、随侯、鬬伯比、薳章、鬬丹、熊率且比五人（六名，楚武王居首）判据三条俱满足而本批不立行——`P_CHUWEN.relations` 已自陈「父楚武王（未入库）」本轮仍属实。**登记**：他日立 `P_CHUWU` 行后须回挂 `E294`／`E295` 二目（依明文定 presence），随其所属批次任务书带出。落点：`docs/changes/r46_jiliang.md` §4.5／§13 ⚑B（原样归档），本交付文档第六节复述登记。
- **⚑F 候补池**：僖公二十年「随之见伐，不量力也」一句（去季梁之世六十六年，传中与季梁无一字相涉）不另立事目，注中线索照留于 `L_SUIGUO.description`，**入候补池登记**（随线扩编时再议）。落点：同上，`docs/changes/r46_jiliang.md` §8.2／§13 ⚑F。

---

## 七、提交、push、Actions

| 项 | 值 |
|---|---|
| 提交哈希 | `b5f1299d0a17e979b59b3ba3d34c1986b97c94e6` |
| 提交信息标题 | `feat(skipper r48 合入): round46_jiliang 季梁点将件——随线两目落库+⚑A/⚑F站长二裁` |
| push | `ebfccdd..b5f1299 main -> main`，成功 |
| Actions 运行号 | `33759254023`（"Deploy site to GitHub Pages"，push 触发） |
| Actions 结论 | **success**（`gh run watch --exit-status` 实测） |

---

## 八、归档与目录状态

- `docs/changes/r46_jiliang.md`（`CHANGES.md` 原样）＋ `docs/changes/r46_jiliang_sim.py`（`sim_jiliang.py` 原样）先提交入库，`data/incoming/round46_jiliang/` 随后清空——顺序符合 §10.1 归档纪律。
- `team/yema_backfill_r46_jiliang.md`（回填表）**未单独另存**：其地望三问、用字一问之实质内容已见于 `docs/changes/r46_jiliang.md` §9／§10／§13（幅界存疑、汉志随县线索、鬥/鬬/鬭三形双本比对与站长核校请求），仅表格呈现格式不同，无信息损失——与 r47 处置 `yema_backfill_r46.md` 同一体例。
- `git status --short` 复核：干净（仅本轮提交内容，无残留 `??`）。

---

## 九、仍开放的待裁事项

- **⚑B 楚武王等五人回补义务**（第六节已登记，随所属批次任务书带出）。
- **⚑F 僖二十候补池**（第六节已登记，随线扩编时再议）。
- **随君 ID 取号另裁**：随侯经传不名、无谥，不适用 v1.41「国＋谥＋`GONG`」式，取号规则待领队另裁（`CHANGES.md` §4.5 附问）。
- **地望回填表甲-1**（`L_SUIGUO` 坐标三问：谭图幅界／落点方位／杨注页码）与**乙-1**（楚鬬氏「鬥／鬬／鬭」三形纸本页码，低阶备核级、不阻合入）——交站长翻阅纸本后回填。
- 沿自上批仍开放：`E290` 薄链、鄀点未立、批丙回补 `P_YANGHU`→`E278–E281` 义务、⚑G／⚑H／⚑I／⚑J、fix44c ⚑3–⚑6、fix44b ⚑2–⚑8、⚑D、⚑E（俱不属本件范围，本件未代裁）。

---

## 十、交接备注

- 本轮无新增交接常例；延续 r47 已立"派件前先核交付轮次号尾号"之例，本件取 r48 前已由领队核实。
- 临时定向复验脚本（本节第 4.4 节所述五项＋楚线核对，共 39 项）**未入库、用后即删**，与 r47 同类脚本处置一致；结果已逐项写入本交付文档，供后续核查。
