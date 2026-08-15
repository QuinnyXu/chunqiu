# 交付说明 · Skipper r31

任务：【微任务 For Skipper】合入 Sophia r31 反转件（`L_YU` 判定反转＋首止补证＋A1 清账＋conventions 升号收束）。

---

## 一、合入 4 行逐行结果

以 `id` 为键整行覆盖主表同 ID 行（脚本按 `csv` 模块严格比对表头一致后覆盖，非手工拼接）：

| # | 表 | ID | 实际变动字段 | 结果 |
|---|---|---|---|---|
| 1 | `places.csv` | `L_YU` | `lat`／`lng`／`coord_certainty`／`coord_basis` | `lat/lng` 34.45/115.05 → **34.50/115.02**；`coord_certainty` `low` → **`medium`**；`certainty` **维持 `medium`**（未变动，Sophia 判断已写入行内）；`coord_basis` 整段改写（负证改正证＋反转过程如实记录＋页 24–25 回填） |
| 2 | `places.csv` | `L_SHOUZHI` | `coord_basis` | 补谭图页据（页 24–25）＋既有杨注引述补标核对状态；`certainty`／`coord_certainty` **维持 `low`／`low`**（未变动） |
| 3 | `passages.csv` | `Q344` | `modern_note` | 「待纸本核定」改写为「已定案（r31）」，注疏本「覆」降为异文注；`quote_original` **一字未动**（脚本断言，见下） |
| 4 | `sources.csv` | `Z102` | `notes` | ③ 段同步改写为已定案，末段追记 A1 已闭、A3／A4 仍待 |

与 Sophia 合并模拟自查（CHANGES §8）预期的变动字段列表逐一核对，**完全一致**。

**关于 `Q344` 定案方向的 ⚠ 确认项**：任务书已载明领队裁定——按任务书文义（`Q379` 同一手法先例＋「异读降为异文注」语义＋页码序列自洽三条内证），定案方向为「**復**」，正文不改。本轮据此直接合入 `Q344`／`Z102` 两行，**不再回问站长**；已在本条与 conventions v1.29 版本记录中注明「此系领队按任务书文义所裁、非站长逐字明写」，供日后回溯——若此读有误，因 `quote_original` 未动，只需退回注文一段，不污染原文层。

**关于核对日期 2026-08-15**：任务书已确认此日期正确（即任务书下达日、今日），本轮四处（`L_YU`／`L_SHOUZHI`／`Q344`／`Z102`）不作订正。

---

## 二、validate 结果

- 合入前主表基线：`python tools/validate.py` → `OK：全部校验通过`
- 合入后（4 行覆盖 + `csv_to_json.py` 重新生成 `site/data/*.json`）：`python tools/validate.py` → **`OK：全部校验通过`**，无新增警告

---

## 三、占位计数实测

```
grep -c 〔页码待补〕 data/csv/*.csv   → 全部为 0（合入前 places.csv 为 1，其余表原本即为 0）
grep -c 页码待补 site/data/*.json    → 全部为 0
```

**归零达成**（本地 csv 与生产 json 均实测为 0，非推断）。

---

## 四、不变量复验

| 项 | 结果 |
|---|---|
| 行数 | `places` 91／`passages` 424／`sources` 173／`events` 235／`people` 153 —— **一律不变**（实测） |
| ID／外键 | 无新增、无退役、无悬引（validate 通过即含此项校验） |
| `Q344.quote_original` | 与合入前逐字相同（合并脚本按字段逐一比对差异，仅 `modern_note` 一栏出现在变动字段列表中，`quote_original` 不在其中） |
| `L_YU.coord` | 实测 `lat=34.50 lng=115.02` |
| `L_YU.coord_certainty` | 实测 `medium` |
| `L_YU.certainty` | 实测 **`medium`**（维持不升，未代为调整） |
| `L_SHOUZHI.certainty`／`coord_certainty` | 实测均为 **`low`**（维持不升，未代为调整） |

---

## 五、conventions 新版本号与四条落点

**升号：v1.28 → v1.29**（2026-08-15，r31 合入）。

| # | 内容 | 落点 |
|---|---|---|
| 1 | 「页码引注写法」正式约定——「页 N」（连页 `–`，不作「第 N 页」）；末缀二式：另次补入「，页码 YYYY-MM-DD 补核」／同次核对「，页码同次核」 | §7，附于 v1.26「二手引述须标核对状态」条末；关闭 §11 待决「页码写法体例确认」「尾缀去留」两项 |
| 2 | 新立通例「判定反转须如实记录，不得抹平」（首例 `L_YU`），并更正 v1.26 通例之**举例**——`L_YU` 已不能再作「核对到无落点」之例（通例本身仍立） | §7，紧接第 1 条之后；关闭 §11 待决「`L_YU` 谭图页码待补」项 |
| 3 | 新增 **§10.2「有界扫描的留痕纪律」**——查而未动者逐条留痕；无纸本者记「本轮无从核」，不得以推理代核对、不得写「查无落点」；范围边界不明标「幅界存疑」 | §10（备料与合入分离）之下新增 10.2 小节 |
| 4 | §11 第 4 条改写为「尚余 C／D 两组」（A1 已随本轮关闭），并将已关闭的三项（`L_YU` 谭图页码待补／尾缀去留/页码写法体例确认）移入「已关闭」 | §11，待决事项由 4 条收窄至 **1 条** |

版本记录同步写入 `docs/conventions.md` 第 3 行（新 v1.29 条目），原 v1.28 条目降为「历史：v1.28」保留不动。

---

## 六、提交哈希与 Actions 运行号

- 提交哈希：`1a8845d`（`feat(skipper r31): 合入 Sophia r31 反转件……`，push 至 `origin/main`，`42a644f..1a8845d`）
- GitHub Actions（Deploy site to GitHub Pages）：运行号 `31915229829`，`status=completed`，`conclusion=success`

---

## 七、生产带参复验实测结论

Actions 部署完成后，实测拉取 `https://chunqiu.timechorus.com/data/*.json`（10 个生成文件全量），结果如下：

| 文件 | 实测字节数 | `页码待补` 计数 |
|---|---|---|
| `places.json` | 98,490 | **0** |
| `passages.json` | 404,519 | **0** |
| `sources.json` | 103,534 | **0** |
| `events.json` | 241,270 | **0** |
| `people.json` | 190,944 | **0** |
| `relations.json` | 85,761 | **0** |
| `event_people.json` | 117,565 | **0** |
| `archaeology.json` | 7,522 | **0** |
| `background.json` | 4,526 | **0** |
| `meta.json` | 316 | **0** |

字段级实测（拉取生产 `places.json`／`passages.json`／`sources.json` 逐行核对，非推断）：

- `L_YU`：`lat=34.5`／`lng=115.02`／`certainty=medium`／`coord_certainty=medium` —— 与预期一致。
- `L_SHOUZHI`：`lat=34.43`／`lng=115.1`／`certainty=low`／`coord_certainty=low` —— 维持不升，与预期一致。
- `Q344.modern_note`：含「已定案（r31）」「定案从「復」」字样 —— 已生效。
- `Z102.notes`：含「已定案（r31）」字样 —— 已生效。
- `Q344.quote_original`：生产版本与本地 `site/data/passages.json` 逐字比对**完全一致**，且含「復命哭墓」——正文未被本轮改动污染。

**结论：本轮生产带参复验四项（占位归零、L_YU 坐标与两级 certainty、Q344/Z102 定案文案、quote_original 未动）均为当日实测结果，非「应当如此」的推断。**

---

## 八、归档与 incoming 清空状态

- `docs/changes/r31_luyu.md` 已原样归档（`CHANGES.md` 全文，未重排、未摘要、未改写）。
- `data/incoming/fix31_luyu/` 已清空，`data/incoming/` 目录下仅剩 `.gitkeep`。
- 归档在先、清空在后，顺序符合 §10.1。

---

## 九、异常

无。本轮任务书已明确给出两项领队裁定（`Q344` 定案方向、核对日期），未产生需要回问的新分歧。Sophia 上报的其余事项（幅名核对、`L_SHOUZHI` 方位待补、C／D 两组未清账、`L_YU.modern_location` 收窄建议、21 点郑宋卫幅待核清单、「页码同次核」式核可）均为**登记性上报、不阻塞本轮合入**，已随 conventions 升号一并处理（末缀式已核可写入正文）或保留在 §11 待续，未自行裁量史料问题。
