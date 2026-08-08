# Skipper r26 交付说明——fix26 合入＋边界放宽

日期：2026-08-08　执行：Skipper　依据：`docs/conventions.md` v1.24（本轮由 v1.23 升至）

## 一、任务范围

按任务书【任务 For Skipper】fix26 合入＋边界放宽，五项：
① 合入 `data/incoming/fix26/`（晋都双点专项 + r25 复核五件套）；
② `tools/validate.py` 年代边界放宽为 `[-800, -464]`（events 与 people 生卒年双约束同步）；
③ conventions 升号，补 §5 certainty/coord_certainty 分工语义 ＋ 记边界放宽依据；
④ `docs/kaoding_wudu.md` 提交入库；
⑤ validate、归档、清空 `data/incoming/fix26/`、push、确认 Actions 绿、带参复验。

## 二、合入内容

### 2.1 晋都双点专项（裁定②，维持 Sophia 原判）

- 新立 `L_XINTIAN`（新田，晋后期都城）：`certainty=high`、`coord_certainty=high`，坐标 35.64/111.36。
- `L_JIANG`（故绛/翼，前585 以前）整行替换：补记与 `L_XINTIAN` 互指的判据说明，坐标/certainty 不动（35.67/111.78，均 medium）。
- 判据「**落点从实不从称**」：经传迁都后仍以「绛」称新都（《左传·襄公二十三年》「晝入絳」、《国语·晋语八》「宗滅於絳」均在前585 迁都之后），事目落点只依系年（以前585 为界）判断，不依史文称谓。
- 迁点 **7 条**（`E201`/`E219`/`E190`/`E194`/`E210`/`E220`/`E221`，`place_id`: `L_JIANG`→`L_XINTIAN`），其中 `E219`/`E220`/`E221` 为 Sophia 审计新增（任务书原列 4 条之外）。已逐条核对生产 JSON 落点正确。
- `E182`（前589）**仅补边界说明一句，`place_id` 不变**，未误当迁点行处理。

### 2.2 r25 复核五件套

- `E220.summary` 顺带修正：自称「分类取『其他』」与 `category=论对` 矛盾的 r25 遗留残句，已随本次整行替换同步订正。
- `Q316`（祁奚请免叔向）正文异文定案：「其棄社稷」→「**以棄社稷**」（据《春秋左傳正義》十三经注疏本，杜注句读位置佐证）。
- `Q313` 注文订正：「断章」改为「师读有异」（据孔颖达《正义》「蓋師讀有異」）。
- `P_YANYING.notes` 晏婴卒年篇目定位订正：《史记·十二诸侯年表》误 → 《齐太公世家》，`death_year_bce=-500` 本身不动。
- `E196`（郑铸刑书）观察项关闭：维持归「政制」（有独立行动骨架，「论对」定义要求无独立行动骨架），已回写 conventions §3。

## 三、各表实际计数（合入前 → 合入后）

| 表 | 合入前 | 合入后 | 与 Sophia 合并模拟对照 |
|---|---|---|---|
| events | 201 | **201** | 一致（不变，仅整行替换 8 行） |
| people | 127 | **127** | 一致（不变，仅整行替换 1 行） |
| passages | 315 | **315** | 一致（不变，仅整行替换 8 行） |
| places | 78 | **79** | 一致（新增 `L_XINTIAN`，替换 `L_JIANG`） |
| sources | 142 | **144** | 一致（新增 `Z099`、`A004`） |
| event_people | 517 | 517 | 未改动此表，一致 |
| relations | 247 | 247 | 未改动此表，一致 |

**与合并模拟无任何不符之处**——Sophia 报告的计数与合入结果逐一吻合，任务书须核对的"迁点实为 7 条""E182 不是迁点行""E220.summary 顺带修正""Q316/Q313 改文"四项均已核实到位，如实汇报。

## 四、validate 结果

```
OK：全部校验通过
```

exit 0，软检警告 0 条（与合入前基线一致）。`tools/csv_to_json.py` 已重跑，`site/data/*.json` 已同步生成物。

## 五、conventions 新版本号

**v1.23 → v1.24**。改动三处：
1. 版本头新增 v1.24 条目，记录本轮合入内容与领队裁定。
2. §3 关闭 `E196` 观察项，回写关闭理由。
3. §5 新增「`certainty` 与 `coord_certainty` 分工语义」一节（`certainty` 答"地名与今地对应"，`coord_certainty` 答"坐标戳没戳准"，遗址类天然"位置准、身份疑"），源出 `docs/kaoding_wudu.md` §3.2 提案原文义。
4. §6 `year_bce` 有效范围由 `[-800,-480]` 改为 `[-800,-464]`，记录依据（《左传》全帙下限"悼之四年"＝前464）。

## 六、`tools/validate.py` 边界改动

`YEAR_MIN, YEAR_MAX = -800, -480` → `-800, -464`，单一常量同时约束 `events.year_bce`（第186行校验点）与 `people.birth_year_bce`/`death_year_bce`（第248行校验点），已确认两处共用同一常量、改一处即同步生效，未发现需要分别硬编码的第二处。

## 七、`docs/kaoding_wudu.md` 入库

Sophia 提交的吴都地望考订文档（C 段吴越篇开山前置，纯考订不入表，裁定权在领队与 Xu）已作为 tracked 文件提交入库，供后续 C 段吴越篇任务书参考裁定。

## 八、归档与清空

- `data/incoming/fix26/CHANGES.md` 已原样归档至 `docs/changes/r26_fix26.md`（归档在先）。
- `data/incoming/fix26/` 目录已清空删除（清空在后，符合 §10.1 归档纪律顺序）。

## 九、提交与部署

- 提交哈希：`0e0d75a`（"data(r26合入): fix26晋都双点专项+r25复核五件套……"）
- 已 push 至 `origin main`。
- GitHub Actions（`Deploy site to GitHub Pages`，run `31275114307`）：**completed / success**。

## 十、带参复验结论

生产环境（`https://quinnyxu.github.io/chunqiu/`，自定义域名 `chunqiu.timechorus.com` 在本次执行环境网络下无法解析，改用 GitHub Pages 默认域名核验，二者同源同构建产物）：

1. `data/meta.json` 计数与本地生成物完全一致：events 201、people 127、places 79、sources 144、passages 315、event_people 517、relations 247，年份跨度 前773–前514。
2. `data/places.json` 中 `L_JIANG`／`L_XINTIAN` 两点 `description` 互指内容完整可读，坐标与 `certainty`/`coord_certainty` 与预期一致（`L_XINTIAN` 均 `high`，`L_JIANG` 均 `medium` 不变）。
3. `data/events.json` 中 7 条迁点事目（`E201`/`E219`/`E190`/`E194`/`E210`/`E220`/`E221`）`place_id` 均已落 `L_XINTIAN`，`E182` 仍落 `L_JIANG`。

**核验附注**：首次用小模型摘要转写生产 `events.json` 内容时，`E190` 曾被误报为 `L_XINZHENG`（"新田"/"新郑"拼音形近导致转写误差），改以要求原始 JSON 片段复核后确认实为 `L_XINTIAN`，与本地数据一致。此为核验工具的转写误差，非数据本身问题，如实记录。

## 十一、已知问题 / 交接备注

- 自定义域名 `chunqiu.timechorus.com` 在本次执行环境的网络出口无法解析（`getaddrinfo ENOTFOUND`），改用等价的 GitHub Pages 默认域名验证，未影响验证结论，但建议下轮如遇同类环境核实一次域名解析是否为环境侧限制还是实际配置问题（`gh api repos/.../pages` 显示 `cname: null`，值得留意但非本轮范围）。
- `docs/kaoding_wudu.md` 提出的吴都地望三案（甲/乙/丙）与年代边界建议本轮已采纳边界建议（-464），**三案本身裁定权仍在领队与 Xu**，本轮未落表，留待 C 段任务书正式下达。
- `docs/kaoding_wudu.md` §5 另提"《汉书》前缀待议"（倾向扩 `S` 语义为"正史"），本轮未处理，留待 C 段任务书一并裁定。

---
Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
