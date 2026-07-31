# delivery_skipper_r21c.md —— 落库四处失效 CHANGES 引用替换

任务书：【微任务 For Skipper】落库 Sophia 备妥的四处失效 `CHANGES` 引用替换（`data/csv/` 未动，Sophia 已在临时副本试跑通过）。

## 一、四处落库确认

| # | 文件 | 定位 | 原文 | 新文 |
|---|---|---|---|---|
| ① | `data/csv/events.csv` | `E107.summary` 末段 | `（择内乱，见CHANGES）。` | `：祭仲之谏立于先王之制（「都城過百雉，國之害也。先王之制：大都不過參國之一」，Q108），有礼制一面；然本条主线归属在武姜—庄公—共叔段一线（其结局即上文所系之 E024），故依 conventions §3「复合事件取对主线叙事最核心的一面」择内乱。` |
| ② | `data/csv/events.csv` | `E172.summary` 末句 | `presence 判据与其张力见 CHANGES.md 三。` | `presence 判据与其张力见 docs/changes/r21_songxiang.md 三。` |
| ③ | `data/csv/event_people.csv` | `event_id=E172, person_id=P_SONGXIANG` 的 `role_in_event` | `判据见 CHANGES 三` | `判据见 docs/changes/r21_songxiang.md 三` |
| ④ | `data/csv/passages.csv` | `Q204.modern_note` 末句 | `两处书法之张力与本库 presence 判据见 CHANGES.md 三。` | `两处书法之张力与本库 presence 判据见 docs/changes/r21_songxiang.md 三。` |

落库前逐一用 Grep 核对四处原文串在各自文件中均**唯一出现 1 次**，落库后逐一读回确认新文本字符级一致（含①的传统字体引文「過／國／參」照 Q108 原文用字，与同段其余简体正文并存，为刻意保留原文用字，非笔误）。四处均按整串替换执行，未改动同字段内其余文字。

## 二、E107 处替换的性质澄清（必办事项 1，如实记录）

**本处新文本是「r21 后补陈述」，不是 round9 原论证的复原，两者性质不同：**

- Sophia 溯源结论：round9 的 `CHANGES.md` 完好保存在 git 历史（提交 `e7a126d`），`git log -S` 核实该提交起 `events.csv` 中即已是「（择内乱，见CHANGES）。」，但**该提交及其后历史中 round9 CHANGES.md 全文通篇无「礼俗」二字**——即当年写 summary 时预告"将在 CHANGES 中说明"，但 CHANGES 里实际从未写出对应说明。这是**引用从一开始就落空（作者预告未兑现）**，而**不是**"文件曾存在完整论证、后来随某次清空而佚失"（后者是 r21 归档缺口的性质，两者不可混同）。
- 新文本的构成方式：依据现存的两项证据——`Q108`（祭仲谏语原文摘录）与本条 summary 前段已明书的「为 E024 克段于鄢之远端」——**重新给出**"为何 category 内乱／礼俗两可、而最终择内乱"的判定理由，并显式援引 `conventions §3`"复合事件取对主线叙事最核心的一面"作为规则依据。这是**本次（r21 收尾）新写的陈述**，不代表、也不冒充 round9 作者当年的真实想法或论证过程。
- 本条不产生新的"归档缺口"问题：round9 CHANGES.md 本身完整保存在 git 历史 `e7a126d`，无需归档到 `docs/changes/`（`docs/changes/` 机制针对的是"合入后即清空、从未入库"的备料件，round9 件不属此类）。

## 三、`CHANGES` 字样复扫结果

| 范围 | 落库前 | 落库＋重新生成后 |
|---|---|---|
| `data/csv/` | 4 处命中（E107/E172×2/Q204） | **0** |
| `tools/` | 0（本无命中） | **0** |
| `site/data/`（生成物镜像） | 3 个文件命中（events.json/event_people.json/passages.json，与 `data/csv/` 的 4 处对应，Q204 与 E172 落在同一 events.json 记录内） | 重跑 `csv_to_json.py` 后 **0**（生成物自动消解，未手改） |

全库（`data/csv/`＋`site/data/`＋`tools/`）`grep -rn "CHANGES"` 复扫**归零**。

## 四、validate / csv_to_json 结果

- 落库后 `python tools/validate.py` → **OK：全部校验通过**。
- `python tools/csv_to_json.py` 重新生成，行数与落库前一致（Sophia 临时副本试跑已预告"三表行数不变"，本次实测吻合）：`events=168`、`event_people=443`、`passages=209`（9 张表全量重生成，`meta.json` 仅 `generated_at` 时间戳变化，年份范围 `-773..-584` 不变）。

## 五、`docs/changes/README.md` 补记（必办事项 3）

已在文末新增一段：**本目录文件已被 `data/csv/` 直接引用，路径与文件名不得再改**——列出三处引用点（`events.csv` E172.summary、`event_people.csv` E172/P_SONGXIANG.role_in_event、`passages.csv` Q204.modern_note），并注明这四处指向此前已失效过一次（原「见 CHANGES.md 三」随 incoming 清空落空），若 `docs/changes/` 下文件路径/文件名再变动，须同步更新这三处引用，否则需要再走一次溯源（Sophia 提请记录）。

## 六、提交范围与验证

`git status` 核对本次改动范围，仅：`data/csv/event_people.csv`、`data/csv/events.csv`、`data/csv/passages.csv`（3 张 csv）＋ `site/data/event_people.json`、`site/data/events.json`、`site/data/meta.json`、`site/data/passages.json`（4 处生成物镜像，含 meta.json 时间戳）＋ `docs/changes/README.md` ＋ 本交付文档，未使用 `git add -A`，未夹带其他文件。

## 七、已知问题 / 交接备注

无新增缺口。E107 处的判定理由属本轮新写陈述（见「二」），不构成对 round9 原始论证的复原声明，如后续有人质疑该处"为何现在能写出理由"，请指向本文件与提交记录说明其性质。
