# Skipper r27c 交付说明——纸本核对成果合入（修正件）

日期：2026-08-11　执行：Skipper　依据：`docs/conventions.md` v1.26（本轮由 v1.25 升至）

> **命名说明**：本件另立 `docs/delivery_skipper_r27c.md`，不并入 `docs/delivery_skipper_r27.md`——理由是 r27c 是独立于 r27a/27b 数据合入、r27 视觉件推送之外的第三次动作（站长纸本核对成果的合入），与 Sophia 侧 `delivery_sophia_r27a/b/c.md` 三件分立的既有命名惯例对齐，避免 `delivery_skipper_r27.md` 无限增长、不同性质的动作混在一节里不易追溯。

## 一、任务范围

按任务书【任务 For Skipper】r27c 合入，四项：
① 按 `data/incoming/round27c/CHANGES.md` 合入（Q379 新增 ＋ 16 行整行改写，`〔页码待补〕` 标记照留）；
② 追加裁定 23 两项一并落地（`L_BOJU.certainty` 亦升 medium；`Q373` 正字改「薦」）；
③ conventions 升号，§7 新增二手引述通例（追加裁定 22）；
④ validate、重生成 JSON、CHANGES 归档、清空、push、确认 Actions 绿、带参复验。

## 二、合入内容

### 2.1 Sophia 交付件按 CHANGES 逐条合入

`data/incoming/round27c/`（8 个文件）为**修正件**：无新增事目/人物/来源，唯一新增为 **1 条 passage（`Q379`）**，其余 **16 行**皆整行改写。合入顺序：append `passages_new.csv`（`Q379`）→ 依次整行替换 `places`（`L_BOJU`/`L_ZUILI`/`L_WUDU`/`L_YU`）、`passages`（`Q333`/`Q340`/`Q344`/`Q347`/`Q368`/`Q372`）、`sources`（`Z101`/`Z102`）、`events`（`E244`）、`people`（`P_WUYUAN`/`P_SHENBAOXU`）、`relations`（`R276`）。

**要点**：
- `Q379`：季札观乐留白名段补录（豳、秦、魏、唐、陈及郐以下），观乐评语四条至此完整无留白（`Q333`→`Q379`→`Q334`→`Q335`）；校勘三则写入层标，含"渢渢非渢楓""断句从杨本""《史记》『儉』与杜注所定正字暗合"三点。
- `L_BOJU`/`L_ZUILI`：`coord_certainty` 由 `low` 升 `medium`（谭图纸本＋杨注纸本＋江永/杜注三家合流）。
- `L_WUDU`：坐标与两 `certainty` 一概不动（甲案不动），`coord_basis` 补谭图纸本实证并加"谭图有落点，不等于学界已有定说"一句防误升。
- `L_YU`：两字段维持不升级（谭图该幅未标"盂"，优先序第一位无落点，负的证据分量更重于杨注所引方志）。
- `Q347`：异文定案（杨本作"以肄焉"，正文维持两整理本一致之"之"），并自我登记 r27a 当时未标核对状态之疏失。
- `Q340`：断句订正一处（"王使甲坐於道，及其門"→"王使甲坐於道及其門"，依杜注连读，只改标点不改字）。
- `Q344`：登记一处实质异文待核（注疏本正文"覆命哭墓"而其杜注作"復"，两整理本作"復"，维持"復命"不动，列杨本待核清单）。
- `Q372`/`E244`/`R276`：三处自纠一处引注失实——r27b 原写杜预训"復，**報復**也"，经《春秋左传正义》核出杜注原文实为"**復，報也**"（多记一"復"字），已订正、两说并存、结论（本库照录传文本字"復"）不变。
- `Q368`：为"州于"即王僚之说补标核对状态（该条杜注因不在本轮已取卷次内，仍待核，结论不受影响）。
- `Z101`/`Z102`：`notes` 同步补写三本比对经过与依据链。

**页码待补标记**：全库统一标记 `〔页码待补〕`，`grep -n '〔页码待补〕' data/csv/*.csv` 实测 **10 处**（`places.csv` 4 行×共 7 处、`passages.csv` 2 行各 1 处、`sources.csv` 1 行 1 处），与 Sophia 清单逐一吻合。**照留、不清理、不代填。**

### 2.2 追加裁定 23 两项（Sophia 只报不改，本轮由 Skipper 落地）

1. **`L_BOJU.certainty` 由 `low` 升 `medium`**：`coord_basis` 同步改写，说明"谭图与杨注同主麻城，汉川说退为地方性异说，随 `coord_certainty` 一并上调，未至 `high` 因所定仍是县域概位"。
2. **`Q373` 正字改「薦」**：`quote_original` 中"以荐食上國"→"以**薦**食上國"（《春秋左传正义》十三经注疏本、杜注"薦，數也"、《经典释文》三证），`modern_note` 补一段校勘说明并注明两整理本原作简化字形"荐"。

裁定 23 另两项（`Q344` 復／覆入七组纸本清单待 Xu 杨本裁断；`docs/kaoding_wudu.md` §0.3 经 Xu 复查已落实、关闭）**均不涉本轮数据改动**，前者已在 `Q344.modern_note` 中登记待核、后者本轮确认**不重改**（详见 §四）。

### 2.3 conventions 升号（v1.25→v1.26）

新增 §7 通例"**二手引述须标核对状态**"（追加裁定 22）：注文中引杨注/杜注/谭图等二手文献，须标核对状态（纸本已核／电子本转引／未核待补），未核者不得作断言语气。样本案例 `Q347`（r27a 曾未标核对状态径断"杨伯峻作『以肄焉』"，本轮据此规范补正）已记入判例正文。版本头同步新增 v1.26 条目，记录本轮全部改动。

## 三、各表实际计数（合入前 → 合入后）

| 表 | 合入前 | 合入后 | 与 Sophia 合并模拟对照 |
|---|---|---|---|
| events | 214 | **214** | 一致（仅整行替换 `E244` 1 行） |
| people | 143 | **143** | 一致（仅整行替换 2 行） |
| places | 81 | **81** | 一致（仅整行替换 4 行） |
| sources | 162 | **162** | 一致（仅整行替换 2 行） |
| passages | 363 | **364** | 一致（新增 `Q379`，另整行替换 6 行） |
| relations | 268 | **268** | 一致（仅整行替换 1 行） |
| event_people | 557 | 557 | 未改动此表 |
| archaeology | 8 | 8 | 未改动此表 |
| 主角 | 31 | **31** | 一致，未变 |
| 年份跨度 | 前773–前496 | 前773–前496 | 一致，未变 |

**与 Sophia 合并模拟自报数字逐一吻合，无出入。**

## 四、注意两点的核实

- **`docs/kaoding_wudu.md` §0.3 措辞收窄**：Sophia 在 `delivery_sophia_r27c.md` §四·6 中报"尚未落实"，系其读取的是**合入 r27（round27a/27b）之前的旧状态**——实际该项已在本 Skipper 于 r27 合入时（`docs/delivery_skipper_r27.md` §3.3）落实，现行 `docs/kaoding_wudu.md` §0.3 已含"同一种沉默，无争议之国无害、四说相争之国致命"与"吴入郢／於越入吴"正面旁证两处改法。**本轮已核实现状、未再改动该文件**，仅 `L_WUDU.description` 随 round27c 增补一句按语（与 kaoding_wudu.md 附记同步，见 §二·1 `L_WUDU` 处置），文件正文本身未触碰。
- **取证纪律**：本轮未使用 Monitor 监视任何陈旧日志文件；`gh run list`/`gh run view` 均为本轮即时取得的结果（见 §六），未取到之项如实标注，不编造 run 号，不以他人自测结果冒充复验。

## 五、validate 与生成物

```
OK：全部校验通过
```

exit 0，软检警告 0 条。`python tools/csv_to_json.py` 已重跑：`events.json` 214 行、`people.json` 143 行、`places.json` 81 行、`sources.json` 162 行、`relations.json` 268 行、`passages.json` **364** 行、`event_people.json` 557 行、`archaeology.json` 8 行，`meta.json` 年份跨度 -773..-496。

## 六、归档、提交与部署

- `data/incoming/round27c/CHANGES.md` 已原样归档至 `docs/changes/r27c_zhiben.md`（归档在先）。
- `data/incoming/round27c/` 目录已清空删除（清空在后，符合 §10.1 归档纪律顺序）。
- 提交哈希：`77eab6d`（"data(r27c合入): 纸本核对成果修正件——柏举/槜李双medium、Q379观乐补齐、conventions v1.26"）。
- 已 push 至 `origin main`（`f4df75f..77eab6d`）。
- GitHub Actions（`Deploy site to GitHub Pages`，run `31555798694`）：**completed / success**（本次会话内 `gh run view` 直接取得）。
- 生产环境（`https://quinnyxu.github.io/chunqiu/`）核验：`data/meta.json` 中 `passages=364`，其余各表计数与年份跨度与本地生成物一致；`data/places.json` 中 `L_BOJU`/`L_ZUILI` 均 `certainty=medium`／`coord_certainty=medium`，`L_YU` 维持 `certainty=medium`／`coord_certainty=low`（未升级）——均已远端复核通过。

## 七、带参复验

1. **Q379 观乐四条完整**：`events.json` 中 `E223` 挂载的 `passages` 序列 `Q333`→`Q379`→`Q334`→`Q335` 四条 `quote_type` 均为「原文」，`Q379.quote_original` 含"渢渢乎"（已订正"渢楓"之讹），字数 176 字，观乐评语（周南召南至齐 / 豳秦魏唐陈及郐以下 / 二雅与颂 / 六舞与观止矣）四段无留白。
2. **柏举双 medium**：`places.json` 中 `L_BOJU.certainty=medium`、`coord_certainty=medium`；`L_ZUILI.certainty=medium`、`coord_certainty=medium`；对照组 `L_YU.certainty=medium`（不变）、`coord_certainty=low`（未升级，核对内容为负）。
3. **`Q373` 正字**：`quote_original` 含"薦"字、不含"荐"字，订正生效。
4. **页码待补标记**：`data/csv/*.csv` 内 `〔页码待补〕` 计 10 处，与 Sophia 清单吻合，本轮未清理、未代填。

## 八、已知问题 / 交接备注

- **`Q344`「復／覆」实质异文待杨本裁断**：注疏本正文作"覆命哭墓"而其自身杜注作"復"，两整理本作"復"；本库维持"復命"不动，已列入七组纸本待核清单（`Q344` 待核项，随 `L_BOJU`/`L_ZUILI`/`L_WUDU`/`L_YU` 依据链的页码待补一并留待站长后续核对）。
- **`Q368`「州于」即王僚之杜注**：因该卷（昭公二十年）不在本轮已取十三经注疏本卷次（卷三十九／五十二／五十四）之内，杜注原文仍待核；结论不受影响（本库依 conventions §7「注家之说不当经传明文用」判例，本就不据此注扩 `P_WULIAO.active_years_bce`）。
- **`P_WUYUAN.notes`「伍氏之姓杨注是否果无定说」**：仍属待核断言，已加保留语；`xing` 从阙之处置本就不依赖此断言（经传三书本身无一字可据，已足以定阙），不受该项待核影响。
- **`Z101`「评《秦》末句『也』『乎』互易」**：`Q379` 暂从注疏本（依 v1.24 `Q316` 判例），未在本次纸本核对范围，已列待核清单。
- **C 段吴越篇后续（C2）预告**：不变，见 `docs/delivery_skipper_r27.md` §九。

---
Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
