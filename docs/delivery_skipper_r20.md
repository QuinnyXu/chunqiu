# delivery_skipper_r20.md —— round20b（管仲升格）合入 ＋ E041/E155 拆分

任务书：【任务 For Skipper】round20b 备料合入（管仲 `P_GUANZHONG` 升格为主角＋挂链梳理）；E041 复合事件拆分（领队裁定）。

## 一、round20b 合入内容（主库行修正 2 项 ＋ 5 个增量文件）

1. **`people.csv` 行 `P_GUANZHONG` 修正**：
   - `is_protagonist`：`0` → `1`（升格主角）。
   - `short_bio`：由空补为 CHANGES.md 一·2 给出的文本（鲁囚归齐…孔子许其功句）。
   - 其余字段（`xing/shi/ming/zi/state/alt_names/active_years_bce/death_year_bce`）核对无误，未改动。
2. **新增事件 E154**「鲁囚管仲，槛车归齐」（-685，L_QUFU，Z024;G002;S008，high，其他，importance 2，sort_key 45）。
3. **event_people 新增 4 行**：E154×2（管仲/鲍叔牙，均亲至）、E044 管仲（补挂，相关）、E071 管仲（补挂，相关）。
4. **passages 新增 7 条 Q170–Q176**：国语齐语制国细则×2（挂 E046）、管鲍分财轶事（S008，挂 E046）、论语孔子评管仲×4（T003，挂 E046/E068/E071×2）。
5. **sources 新增 2 条**：S008《史记·管晏列传》、T003《论语》。
6. **relations 新增 1 条 R202**：鲍叔牙→管仲「让相荐贤」，与既有 R036（管仲→鲍叔牙，师友）方向/rel_type 不同，不判重。

ID 网段（events E154 起、passages Q170 起、relations R202、sources S008/T003）与主表实际最大号（events 至 E153、passages 至 Q169、relations 至 R201、sources S 至 S007/T 至 T002）核对无冲突，未触发 §2.1 撞号重编流程。

CHANGES.md §7 提请的「E041 place_id=L_JU 地理语义有偏」问题，本包未擅改，留待任务书第2条裁定处理（见下）。

## 二、E041 拆分（领队裁定，任务书第2条）

按复合事件拆分通则（E005/E006 先例：全量退役再拆分），但本次采用**收窄+新立**的第二种落地形态——E041 本体不退役，仅收窄叙事范围：

| 项目 | E041（收窄后） | E155（新立） |
|---|---|---|
| title | 齐襄公无常，小白奔莒 | 公子纠与管仲、召忽奔鲁 |
| summary | 鲍叔牙见襄公政令无常、虑乱将作，奉公子小白出奔莒。 | 冬乱作（无知弑襄公），管夷吾、召忽奉公子纠来奔鲁。 |
| place_id | L_JU（莒，不变） | **L_QUFU**（曲阜/鲁，与 E154「鲁」同一地点 ID，按任务书指定） |
| year_bce / lu_reign | -686 / 鲁庄公八年（不变） | -686 / 鲁庄公八年（同 E041） |
| source_ids | Z012;S001（不变） | Z012;S001（沿用 E041，按任务书指定） |
| reliability / category / importance | high / 出奔 / 1（不变） | high / 出奔 / 1（机械重排，不新增可靠度判断） |
| sort_key | 30（不变） | 40（-686 年内原有 10/20/30 已占用，40 唯一不冲突） |

**event_people 迁链**：`P_GUANZHONG`、`P_SHAOHU`、`P_ZIJIU` 三行的 `event_id` 由 `E041` 改为 `E155`，`role_in_event`/`directness`/`presence`（均亲至）原样迁移；`P_QIHUAN`（出奔莒，亲至）、`P_BAOSHUYA`（预判乱作、奉小白出奔，亲至）、`P_QIXIANG`（政令无常之乱源，相关）三行留在 E041 不动——`P_QIXIANG` 之所以留在 E041，是因其 role「政令无常之乱源」对应的正是小白早奔莒的诱因，与子纠一方「无知弑襄公」乱作后再奔鲁的诱因不同，机械对应到窄化后的 E041 语境，未随三人一并迁移。

**已发现但未处理事项（上报，未擅自裁量）**：既有 passage `Q037`（Z012 原文「鲍叔牙曰……乱作，管夷吾、召忽奉公子纠来奔」）引文本身横跨 E041 与 E155 两段情节，任务书仅要求迁移 events 与 event_people、未提及 passages，故本轮 **未新建/未迁移 Q037**，原样留在 E041 下。若领队认为 E155 也应有一条直接引文佐证（哪怕内容重复 Q037），请指示，可回补一条新 passage（如 Q177）挂 E155，不影响本轮已合入内容。

## 三、conventions 更新（升号 v1.15 → v1.16）

任务书要求"如需记录评价层体例，升下一号"。CHANGES.md §5 中 Sophia 对"孔子论管仲（T 层）挂靠既有事件、管鲍分财轶事（S 层、无系年）挂靠既有事件"的处理说明，是可复用的通用规则而非一次性判断，遂在 `docs/conventions.md` §7「私有层与叙事分层」新增一条：

- **无系年评价/轶事材料挂靠通例（v1.16）**：将 §2「T 层不单独立事件」纪律的适用范围，从 T 层显式延伸到 S 层同类"无系年"材料（判据相同：系年阙如），`T` 层 `quote_type` 标"经义异闻"、`S` 层标"后出叙事"，均须在 `sources.notes`/`passage.modern_note` 注明分层。先例引用本轮 Q172–Q176。

版本头（`docs/conventions.md` 第 3 行）已记录本次改动摘要与 E041/E155 拆分说明。

## 四、validate / 生成 / 提交 / 部署核验

- `python tools/validate.py`：合入后、conventions 改动后各跑一次，均 **OK：全部校验通过**。
- `python tools/csv_to_json.py` 重新生成，`site/data/meta.json`：
  ```
  events=153  people=97  event_people=387  passages=177  sources=106  places=72  relations=202
  ```
  （events +2 = E154+E155；people 行数不变，仅 P_GUANZHONG 字段修正；passages +7；sources +2；relations +1；event_people 净 +4，迁移 3 行不改变总数）
- **管仲轨迹复核**（`python` 脚本读 `site/data/*.json`）：
  - `is_protagonist=1` 计 **21**（含管仲）。
  - `P_GUANZHONG` 挂链事件：E043/E044/E045/E046/E062/E068/E071/E072/E073/E154/E155，共 11 条，`E041` 不在其中。
  - `E041` 人物：`P_QIHUAN`（亲至）、`P_BAOSHUYA`（亲至）、`P_QIXIANG`（相关）——齐桓公莒起点不受影响。
  - `E155` 人物：`P_GUANZHONG`/`P_SHAOHU`/`P_ZIJIU`（均亲至），落点 L_QUFU（鲁）。
- **grep 全仓残留检查**：`grep -rn "E041,P_GUANZHONG\|E041,P_SHAOHU\|E041,P_ZIJIU" data/csv/ site/data/` 零命中。
- `data/incoming/round20b/` 已清空删除。

**git 提交与部署**：commit `<见下方回填>`，已 `git push origin main`。

**GitHub Actions**：`<见下方回填>`。

**线上带参复验**（`?v=<timestamp>` 强制绕过缓存）：`<见下方回填>`。

## 五、已知问题 / 交接备注

1. **Q037 是否需为 E155 补一条引文**：见二·「已发现但未处理事项」，未擅自新建，等待领队/Sophia 裁夺。
2. E041 拆分未触及 `data/csv/places.csv`（未新增地点，L_JU/L_QUFU 均为库内既有点），无坐标改动。
3. 一次性合入脚本（读写六张 CSV 表，机械执行 people 字段改写／events 行改写＋追加／event_people 迁移＋追加／passages·sources·relations 追加）已在核验通过后删除，不遗留在仓库；如需复核合入逻辑，可参考本文件表格重建。
