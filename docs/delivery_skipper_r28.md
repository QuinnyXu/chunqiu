# Skipper r28 交付说明——夫差入库＋勾践升格（春秋终章·C2）

日期：2026-08-13　执行：Skipper　依据：`docs/conventions.md` v1.27（本轮由 v1.26 升至）

## 一、任务范围

按任务书【任务 For Skipper】任务 2（round28_prompts.md），前置 1a（`data/incoming/round28a/` 夫差件）、1b（`data/incoming/round28b/` 勾践件＋随批清账）均已备料完成：

1. 严格按 **28a → 28b → 三补丁件** 顺序合入，events 先行、共用事件核对无重立；
2. 落地领队 2026-08-12 针对 28b 十项上报的**六项裁定**（a–f）；
3. 随批清账两项：Z078/Z098 并源、《汉志》吴条 S 行补建；
4. conventions 升号，另记 sources.url 体例、同音撞名判例类推 places 表两条；
5. validate → 重生成 JSON → 归档 → 清空 → push → 确认 Actions 绿 → 带参生产复验四项。

站长纸本核对件本轮未到（`data/incoming/` 内除 round28a/28b 外无其他目录），故无需"先小件后大批择序"的排队处理，径按 28a→28b 顺序执行。

## 二、合入内容

### 2.1 合并顺序与方式

用脚本化合并（append + 整行替换），避免手工转录出错，过程可复现：

1. 拷贝当前 `data/csv/*.csv` 到内存；
2. 依次 append `round28a/*_new.csv` 七张表；
3. 依次 append `round28b/*_new.csv` 七张表；
4. 依 `id` 定位，整行替换 `round28b/fixes_events.csv`（`E223`）、`fixes_passages.csv`（`Q336`）、`fixes_people.csv`（`P_GOUJIAN`、`P_HANQI`）；
5. 落地领队六项裁定（见 §2.2）；
6. 落地随批清账两项（见 §2.3）；
7. 写回 `data/csv/*.csv`。

`data/csv/` 主表全程未被手改，改动均来自脚本执行，逐行可追溯至 CHANGES.md 条目或本交付说明所记裁定。

### 2.2 领队六项裁定落地

| 项 | 内容 | 落地方式 |
|---|---|---|
| a | 年份下限照实 -472（`E267`）；`Q419`／`Q420` 留空不回填 | 无需改动——`E267` 已随 28b 合入，`Q419`／`Q420` 两号本就未出现在任一批次，保持空号 |
| b | `P_WENZHONG` 照阖庐先例：`name=大夫种`，`alt_names` 收「文种」，「文」氏出 T 层之由入 notes | `people.csv` 行改：`name` 由「文种」改「大夫种」，`alt_names` 由「大夫种;种」改「文种;种」；`notes` 首段由「保留异议并上报」改写为「依领队裁定改定」，理由链保留 |
| c | `presence` 增第三值「不在」（史文明书其不在事发地）；validate 枚举扩一值；前端显示暂同「相关」；不回溯扫库；`E266` 文种守国为首用例 | `tools/validate.py` 的 `PRESENCE` 常量由 `{亲至,相关}` 扩为 `{亲至,相关,不在}`；`event_people.csv` 中 `E266`／`P_WENZHONG` 一行 `presence` 由「相关」改「不在」，`role_in_event` 同步改写注明首用；**全库仅此一行取值「不在」**（已核，见 §五生产复验） |
| d | `E135` 判据补写按 Sophia 建议文本落地（"会师列名之君的群体证据"替代句式论，经作"楚人"并注） | `events.csv` `E135.summary` 末句由「传书『楚子及诸侯围宋』（经作『楚人』），楚成王亲围宋都，故亲至」改写为 Sophia round28b CHANGES §9.2 第3项建议文本，结论（亲至）不变，仅判据表述更严谨 |
| e | 新判据用语（与"详载中之无"配对，庆忌案样本）入 conventions，定名由 Sophia 定稿 | 已通过 SendMessage 向 Sophia（agentId `acba758ac74422e9e`）索取定名，Sophia 回复定名**「异处之抵牾」**（非 CHANGES 行文中的随手说法「异处之有」），已按其提供的完整判例文本落入 `conventions.md` §7（v1.27），并与既有「详载中之无」互相加了交叉引用 |
| f | `E242` 修正建议撤回照准；西施不录、徐州之会降 S 层、历聘守恒诸处置全部核可 | 均为「维持 round28a/28b 既定处置、不再改动」——未对任何 CSV 行做额外改动，仅在 conventions 版本头记录核可结论 |

### 2.3 随批清账两项

1. **`Z078`／`Z098` 并源**：两条同引《春秋左传·昭公二十八年》一篇。保留 `Z078`，`notes` 字段追加合并 `Z098` 原文（保留【并源说明】标记以便追溯）；`Z098` 从 `sources.csv` 中移除、计入 conventions §2「ID 退役」名单。引用迁引：`events.csv` 中 `E221.source_ids` 由 `Z098;G009` 改 `Z078;G009`；`passages.csv` 中 `Q321`–`Q324` 四行 `source_id` 由 `Z098` 改 `Z078`。`validate.py` 复核确认迁引后无悬引。
2. **《汉志》吴条 S 行补建**：`L_WUDU.description` 中「《汉书·地理志下》会稽郡『吳，故國，周太伯所邑』」一句转为正式来源行，新建 **`S014`**（沿用 `S` 前缀 v1.25 广义化「秦汉正史层」语义），`L_WUDU.source_ids` 追加 `S014`；`description` 原文保留不动（正式来源行与行文引述并存）。**`S014.url` 本轮网络环境不可达，未能实测校验**，已在 `notes` 中如实登记为复核项，不作断言（同时是新增 `sources.url` 体例从实通例落地的示范案例）。

### 2.4 conventions 升号（v1.26→v1.27）

新增/改动条目：
- 版本头新增 v1.27 记录本轮全部改动（见 §一至§三所述各项）；
- §2「ID 退役」名单新增 `Z098`；
- §2「`S###` 前缀广义化」段落更新，注明 `S014` 已补建；
- §2「同音撞名取传世称谓判例」新增一段，类推适用于 `places` 表，首例 `L_XUGUO`（round28a 已按此判例精神径取，本轮正式写入判例范围）；
- §6 `event_people.presence` 枚举定义补写第三值「不在」的语义、判据强度与不回溯扫库的适用边界；
- §7 新增判例「异处之抵牾」（v1.27，Sophia 定稿），并在既有「详载中之无」（v1.25）条末加互指；
- §7 新增通例「`sources.url` 体例从实」（v1.27），说明填写标准、既有条目不回改、无法确认时如实登记。

## 三、各表实际计数（合入前 → 合入后）

| 表 | 合入前（r27c 后） | +28a | +28b | 最终 | 与两件 CHANGES 合并模拟对照 |
|---|---|---|---|---|---|
| events | 214 | 227 | 235 | **235** | 一致 |
| people | 143 | 149 | 153 | **153**（主角 31→**33**） | 一致 |
| places | 81 | 89 | 91 | **91** | 一致 |
| sources | 162 | 169 | 173 | **173**（另净变动：+`S014`、-`Z098`，随批清账后总数不变） | 一致 |
| passages | 364 | 403 | 424 | **424** | 一致 |
| event_people | 557 | 585 | 609 | **609** | 一致 |
| relations | 268 | 275 | 282 | **282** | 一致 |
| archaeology | 8 | 8 | 8 | **8**（不变） | 一致 |
| 年份跨度 | 前773–前496 | 前773–前473 | 前773–**前472** | **前773–前472** | 一致（领队裁定 a 照实采纳 -472） |

`sources` 表随批清账后总行数仍为 173（`S014` 新建 +1、`Z098` 退役 -1，抵消），与两件 CHANGES 合并模拟数一致（该模拟未预见清账动作，本项为合入者按任务书新增执行，计数口径已在本表注明）。

## 四、validate 与生成物

```
OK：全部校验通过
```

exit 0，软检警告 0 条。`python tools/csv_to_json.py` 已重跑：`events.json` 235 行、`people.json` 153 行、`places.json` 91 行、`sources.json` 173 行、`relations.json` 282 行、`passages.json` 424 行、`event_people.json` 609 行、`archaeology.json` 8 行，`meta.json` 年份跨度 `-773..-472`。

## 五、归档、提交与部署

- `data/incoming/round28a/CHANGES.md` 已原样归档至 `docs/changes/r28a_fucha.md`；`data/incoming/round28b/CHANGES.md` 已原样归档至 `docs/changes/r28b_goujian.md`（`diff` 校验两对文件逐字一致，归档在先）。
- `data/incoming/round28a/`、`data/incoming/round28b/` 两目录已清空删除（清空在后，符合 §10.1 归档纪律顺序）。
- 提交哈希：`588a508`（"data(r28合入): 夫差入库＋勾践升格第33位主角，越国第11国开分区"）。
- 已 push 至 `origin main`（`d4aaf25..588a508`）。
- GitHub Actions（`Deploy site to GitHub Pages`，run `31762858379`）：**completed / success**（本次会话内 `gh run view` 直接取得，非编造）。

## 六、带参生产复验（四项，均取自 `https://quinnyxu.github.io/chunqiu/data/*.json`，非本地文件）

> 说明：`chunqiu.timechorus.com` 自定义域名在本次会话网络环境下 DNS 解析失败（`getaddrinfo ENOTFOUND`），改用 GitHub Pages 原生域名 `quinnyxu.github.io/chunqiu` 直接核验部署产物（`gh api repos/.../pages` 确认为同一部署来源），数据层面等价，如实记录此替代路径。

1. **甬东坐标留空的显示**：`places.json` 中 `L_YONGDONG` 的 `lat`／`lng`／`coord_certainty` 均为 `null`，`certainty="medium"`，`coord_basis` 首句即「【坐标留空，非地望无考】」并写明超投影东界 0.11° 之由。✅
2. **卧薪尝胆注文**：`passages.json` 中 `Q427`（`quote_type=后出叙事`）`modern_note` 首句「【★《史记》后出叙事层·「尝胆」出此，而「卧薪」不出此——本批分层招牌案例（领队 r28 裁定 2）】」，正文核实"卧"字全篇只一见且与"卧薪"无涉。✅
3. **属镂三节层标**：`Q395`（`原文`，树檟，《左传》）／`Q396`（`言论`，《国语》申胥当面责对）／`Q397`（`原文`，悬门，《国语》）／`Q398`／`Q399`（均 `后出叙事`，抉目，《史记》两篇互异）五条层标清晰可辨、逐条注明三节分属 Z/G/S 三层。✅
4. **presence 三值生效**：`event_people.json` 中 `E266`／`P_WENZHONG` 一行 `presence="不在"`，全库统计仅此 1 行取该值（`不回溯扫库` 裁定生效核验）。✅

（顺带核验：`sources.json` 中 `Z098` 已不存在、`S014` 已存在，共 173 行；`people.json` 中主角计数 33，`P_WENZHONG.name="大夫种"`、`alt_names="文种;种"`；`meta.json` 年份跨度 `-773..-472`——均与本地生成物一致。）

## 七、已知问题 / 交接备注

- **`S014.url` 未验证**：本轮会话网络环境无法访问 `zh.wikisource.org`（DNS 解析失败），`url` 依团队既有《史记》/《汉书》维基文库页面命名惯例填列，未能实测该链接是否可达/是否对应正确卷次，已在 `notes` 中如实登记为复核项，请下轮有网络访问权限时核验或由站长顺手核对。
- **纸本核对候选清单汇总**（供站长后续排期）：
  - 地望：`L_JIFU`（鸡父，两系相距约90km，round28a §10.5 标最优先）、`L_FUJIAO`（夫椒，四说跨吴越两境）、`L_CHANGAN`（长岸，杜预自书「闕」）；
  - 底本异文：`Q394`「壤地同面」疑「同，而」之讹、`Q418`「鍾吳子」疑「鍾吾子」之讹（round28a §8）；`E135` 所据底本「楚人入居于申」vs 通行本「楚子入居于申」（round28b §4.2 结论三）。
- **人物配额登记**（未立而有明文者，分量较重、建议后续补立）：赵鞅（黄池呼司马寅）、子贡（艾陵代对）、赵武／魏舒（季札所说三族之二）。
- **候补事目**（越霸一线，经传有明文，本轮未立）：越人执邾子而立公子何（哀二十四，前471）、鲁哀公如越（哀二十四）、越皋如／后庸帅师会鲁叔孙舒纳卫侯（哀二十六，前469）。
- **`L_DIQIU` 缺独立来源行**：立点依据《春秋·僖公三十一年》，本库无该年来源行，暂借用 `Z101`；如后续补建僖公三十一年来源行，可回填。
- **`E251`（笠泽之战）配额内自主增收**：round28a §1 自报为「自主增收，已列 §10 请复核」，本轮任务书六项裁定未单独提及此条，按整批合入原则一并纳入，**未获领队就此条单独明示核可**，如实记录、留待领队后续确认。
- **round28a §10 其余观察项**（presence 判据边界、季札历聘个别措辞等）均已随两件 CHANGES.md 原样归档，无遗失。

---
Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
