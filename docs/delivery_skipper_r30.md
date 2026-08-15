# 交付说明 · Skipper r30（Sophia 页码回填小件合入）

任务书：【微任务 For Skipper】合入 Sophia 页码回填小件（r30）。
来件：`data/incoming/fix30_pagefill/`（`CHANGES.md` ＋ `fixes_places.csv`／`fixes_passages.csv`／`fixes_sources.csv`），交付文档 `docs/delivery_sophia_r30.md`。

---

## 一、做了什么

依 `CHANGES.md` 逐条执行，7 行整行覆盖（以 ID 为键，非 append）：

| 表 | ID | 字段 | 处置 |
|---|---|---|---|
| `places.csv` | `L_BOJU` | `coord_basis` | 补页 29–30（谭图）＋页 1534（杨注定四），两占位清空 |
| `places.csv` | `L_ZUILI` | `coord_basis` | 补页 29–30（谭图）＋页 1593（杨注定十四），两占位清空 |
| `places.csv` | `L_WUDU` | `coord_basis` | 补页 29–30（谭图），唯一占位清空 |
| `places.csv` | `L_YU` | `coord_basis` | 补页 389（杨注僖廿一）；谭图该幅占位**原样保留**（依据链②对不上给定页码，Sophia 未猜配） |
| `passages.csv` | `Q347` | `modern_note` | 补页 1509（杨注昭卅），占位清空 |
| `passages.csv` | `Q379` | `modern_note` | 补页 1163（杨注襄廿九），占位清空；**《秦》段末句定案**（见下） |
| `sources.csv` | `Z101` | `notes` | 补页 1163（杨注襄廿九），占位清空；**同步同一定案** |

**`Q379`《秦》段末句定案**：杨本页 1163 作「大之至也，其周之舊乎」，与本库所据《春秋左传正义》十三经注疏本逐字相合。`quote_original` 正文**维持不改**；ctext／维基文库两整理本异读「大之至乎，其周之舊也」降为异文注入 `modern_note`（体例同 conventions v1.24 之 Q316 判例）；`Z101.notes` 同步同一处理。**r27c 待核清单 B 项关闭**。

合入使用 Python `csv` 模块按 ID 精确匹配整行替换（保留原文件 CRLF 行结尾、无引号包裹的既有格式），替换前逐条断言主表恰有一行同 ID、且新旧行确有差异，全部通过。

---

## 二、逐行结果与占位计数实测

`git diff --stat data/csv/`：

```
data/csv/passages.csv | 4 ++--
data/csv/places.csv   | 8 ++++----
data/csv/sources.csv  | 2 +-
```

各表恰好对应替换行数（places 4 行、passages 2 行、sources 1 行，每行一增一删）。

**占位计数实测**（验收口径：领队已放行，本次应归 **1**，非任务书原写的 0）：

```
$ grep -c 〔页码待补〕 data/csv/*.csv
places.csv:1  （其余 8 张表均为 0）
$ grep -o 〔页码待补〕 data/csv/*.csv | wc -l
1
```

命中的唯一 1 处落在 `places.csv` 第 70 行 `L_YU` 行、`coord_basis` 字段内（谭图该幅占位，第②处依据链，与任务书说明一致）——**与验收口径完全吻合**。

---

## 三、不变量复验

- **行数**：`places` 91、`passages` 424、`sources` 173（含表头分别为 92/425/174 行，`wc -l` 实测一致），三表行数较合入前**无增减**。
- **坐标**：`L_BOJU`(31.18,115.02)、`L_ZUILI`(30.75,120.75)、`L_WUDU`(31.30,120.62)、`L_YU`(34.45,115.05) 均未动。
- **两个 `certainty`**：四行 `certainty`／`coord_certainty` 逐一核对（`L_BOJU`=medium/medium、`L_ZUILI`=medium/medium、`L_WUDU`=medium/low、`L_YU`=medium/low）与合入前一致，未被本次页码回填触动。
- **`source_ids`**：四行 `source_ids` 逐一核对（`L_BOJU`=Z105、`L_ZUILI`=Z107、`L_WUDU`=Z077;S011;T008;A005;A006;S014、`L_YU`=Z068）未动。
- **`quote_original` 与 `url`**：`Q347`／`Q379` 正文一字未动（`quote_type` 均仍为「原文」）；`Z101.url` 仍为 `https://ctext.org/chun-qiu-zuo-zhuan/xiang-gong-er-shi-jiu-nian/zh`，未动。
- **`Q379.modern_note` 首字符**：实测为「《」，非 CHANGES.md／delivery_sophia_r30.md 所述的「【」——经比对 `git show HEAD:data/csv/passages.csv` 确认此为**合入前既有状态**（非本轮改动引入），且该行 `quote_type=原文`，层标结构式软检（`tools/validate.py`）本就只对 `quote_type≠原文` 的行生效，故此项软检本不适用于 `Q379`，不影响 `validate.py` 结果。此处如实记录为 Sophia 自查文本与实际数据的一处不一致，供领队与 Sophia 知悉，不阻塞本次合入。

---

## 四、validate.py 与生产流程

```
$ python tools/validate.py
OK：全部校验通过
```

exit 0，无新增/清除警告，与合入前主表基线一致。

`python tools/csv_to_json.py` 重新生成，`site/data/places.json`／`passages.json`／`sources.json`／`meta.json` 随之更新（`meta.json` 仅 `generated_at` 时间戳变动，九表计数不变：`places=91`／`passages=424`／`sources=173`，其余六表计数亦不变）。

---

## 五、归档与 incoming 清空

- `data/incoming/fix30_pagefill/CHANGES.md` 已原样归档至 `docs/changes/r30_pagefill.md`（依 conventions §10.1，先归档后清空）。
- `data/incoming/fix30_pagefill/` 目录已清空。

---

## 六、conventions.md 升号

随本轮升至 **v1.28**：

1. 版本历史头部记录本轮合入内容（7 行整行覆盖、9 处页码回填、占位 10→1、`Q379`《秦》段末句定案与 r27c 待核清单 B 项关闭）。
2. §11「待决事项跟踪」由「现无」改为登记 **4 条待裁定事项**（照 Sophia CHANGES.md §5 上报事项与 delivery_sophia_r30.md §三逐条移入）：
   - `L_YU` 谭图页码待补（待站长补给「收今河南睢县一带的那一幅」之页码）；
   - 页码引注串尾「，页码 2026-08-13 补核」九字去留；
   - 页码写法体例「页 N」（本次口径）与 r27c §7「第 N 页」不同形，待领队确认后再升号正式记入（**本轮未将其写为正式约定**，仅陈述本次已采写法）；
   - r27c 待核清单尚余 A1／C／D 三组与本轮定公四年页 1534 同区，可顺手清账。

`docs/changes/r27c_zhiben.md`、`docs/delivery_skipper_r27c.md` 两份归档历史文书按 §10.1 纪律**未回改**，待核清单 B 项关闭的正式落点仅在 `Q379`／`Z101` 数据两处注文与 conventions v1.28 版本记录。

---

## 七、提交与生产复验

- **提交哈希**：`9722dae`（`d4ba22f..9722dae`，`git push origin main`）。
- **Actions 运行号**：`31912640996`（`Deploy site to GitHub Pages`，push 触发，`completed / success`）。
- **生产带参复验（实测，`curl -sS "...?_=r30check"` 带缓存破坏参数）**：
  - `meta.json.generated_at = 2026-08-15T22:35:25+00:00`，与本地 `csv_to_json.py` 重生成时间戳一致，确认部署产物即本次提交内容；九表计数 `places=91`／`passages=424`／`sources=173` 与预期一致。
  - `places.json`：`L_BOJU`／`L_ZUILI`／`L_WUDU`／`L_YU` 四行 `coord_basis` 中「〔页码待补〕」（含书名号完整形态）计数逐行核对，全库合计 **1**，且落在 `L_YU.coord_basis` 唯一一处，与验收口径吻合；`L_BOJU` 含「1534」「页 29–30」、`L_ZUILI` 含「1593」「页 29–30」、`L_WUDU` 含「页 29–30」，均已生效。
  - `passages.json`／`sources.json`：占位「〔页码待补〕」合计 **0**（Q347、Q379 占位已清空）。
  - `Q379.quote_original` 仍含「大之至也，其周之舊乎」（末句未动）；`Q379.modern_note` 含「1163」与「已定案」字样，首字符为「《」（与本地不变量复验一致，非本轮改动）；`quote_type` 仍为「原文」。
  - `Z101.notes` 含「已定案」字样，`Z101.url` 仍为 `https://ctext.org/chun-qiu-zuo-zhuan/xiang-gong-er-shi-jiu-nian/zh`，未动。
  - **结论：生产环境与本次合入内容完全一致，实测通过，非揣测结论。**

---

## 八、异常与已知问题

- 唯一异常为上述「三、不变量复验」中 `Q379.modern_note` 首字符与 Sophia 自查文本不符的一处，已核实为合入前既有状态、不影响本轮合入结果，如实记录，不重写 Sophia 的历史交付文档。
- 其余四项待领队裁定事项已列入 conventions §11，非本轮阻塞项，本次合入照常完成。
