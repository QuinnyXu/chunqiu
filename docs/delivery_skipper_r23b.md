# delivery_skipper_r23b.md —— r23b 合入：子产线 12 条 ＋ 时代骨干 7 条

任务书：【任务 For Skipper】r23b 合入（Sophia round23 备料两件：子产线 12 条＋时代骨干 7 条），备料在 `data/incoming/round23/`（`CHANGES.md` 唯一权威），Sophia 交付说明 `docs/delivery_sophia_r23b.md`。

## 一、做了什么

### 1. 数据合入（`data/csv/`，按 CHANGES.md 指定顺序：先 sources/people，再 events，最后 event_people/passages/relations）

| 表 | 合入前 | 合入后 | 新增 |
|---|---|---|---|
| events | 171 | **190** | 19 条（E188–E206） |
| people | 111 | **123** | 12 行（子产为新主角，郑第 27 位；叔向/然明/裨灶/子皮/子大叔/孔子/崔杼/晏婴/齐庄公/向戌/魏绛 11 名配角） |
| event_people | 453 | **493** | 40 行 |
| passages | 233 | **280** | 47 条 |
| sources | 119 | **133** | 14 条（Z079–Z092；另复用既有 `Z082`《春秋左传·襄公二十五年》，未重建同书同篇第二行） |
| relations | 227 | **239** | 12 条 |
| places | 78 | 78（不变） | 0 新增，1 处修正（见下） |

年份跨度由 `[-773, -565]`（旧库）扩至 **`[-773, -522]`**（`meta.json` 实测）；主角计仍为 **27**（本轮唯一新主角是子产）。

### 2. 两条修正建议落地（CHANGES.md §六·5，Skipper 合入时一次改定）

- **`places.csv` · `L_YAN`**：`description` 追加「又为成公十六年晋楚鄢陵之战地——鄢陵即郑之鄢，一地之古今名。」；`source_ids` 由 `Z018` 改为 `Z018;Z089`。坐标、`coord_certainty`、`place_type` 等字段一律未动。
- **`people.csv` · `P_SHUXIANG`**：`active_years_bce` 由「前543-前536」扩为「**前546-前536**」，覆盖第二件 E206（弭兵之会，前546）。合入时在 append 前于内存中直接改写该行，未先落库旧值再改。

### 3. 孔子入库口径（按领队裁定 3 精神执行，非字面）

- `is_protagonist=0`，配角入库，三处挂链均《左传》明文：E195（评不毁乡校）、E198（评宽猛相济）、E199（闻卒出涕）。
- **编年顺序上的首条实为 E195**（襄公三十一年，前542）而非裁定 3 字面所指的 E199（前522）——按孔子生于前551 计，前542 时其年仅十岁，此评断只能是《左传》成书时的追记，非当时之言。落地处置：记事（Q251）与仲尼评语（Q252）分条并置，`modern_note` 层标写明"追记之辞、非当时之言"，`presence` 从严「相关」、`directness` 取 `indirect`，年龄核算写入 `E195.summary` 与 `P_KONGZI.notes` 两处。
- `death_year_bce` 留空（孔子卒于前479，超出本库年代边界 `[-800,-480]`），卒年记入 `notes`。此为已知边界问题，Sophia 已列为待决建议、未自行改动 schema，本轮维持现状（任务书明示「年份边界 -480 不动」）。

### 4. `tools/validate.py`

无改动——`CATEGORIES`（16 类，含"其他"）、`PRESENCE` 枚举、`SOFT_CHECK_TIERS` 均无需调整，本轮增量全部落在既有规则内。

### 5. `docs/conventions.md` 升号 v1.21 → **v1.22**

1. 版本历史条目：记录本轮合入概况（events 190 条、年份跨度前773–前522、两条修正建议落地、孔子入库口径）。
2. §3 新增**枚举注记备考（v1.22）**：`E205`（齐太史书「崔杼弑其君」）分类取「其他」，现行 16 类无「史职/书法」一目，注记"史笔类暂归其他，积三再议"——待此类事目积够三条（现仅 E205 一条）再评估是否单立一类，不因孤例扩枚举。
3. §7 新增**判例（v1.22）·「死者不作亲至」通例**：`presence` 是为"其人在场"这一行动事实而设，死者非行动主体，即便史文明书其尸身在事发地也不构成"亲至"，一律从严标「相关」+`indirect`。案例：E203（晏婴哭齐庄公之尸，「枕尸股而哭」）、E205（太史所书之「其君」）。经领队核可，立为通例，此后遇同类场景一体适用，不再逐案上报。

### 6. 归档与清理

- `data/incoming/round23/CHANGES.md`（523 行，含两件全部论证）原样复制至 `docs/changes/r23b_zichan_shidai.md`，`diff` 核对逐字一致。
- 清空 `data/incoming/round23/`，仅留 `data/incoming/.gitkeep`。
- `docs/delivery_sophia_r23b.md`（Sophia 备料交付说明，此前未入 git）随本轮一并提交。

## 二、怎么验证

```
python tools/validate.py     → 合入前后均 exit 0，OK：全部校验通过，软检警告 0 条（无变化）
python tools/csv_to_json.py  → 9 张表全部重生成
```

| 验收项 | 合入前 | 合入后 |
|---|---|---|
| `validate.py` | exit 0，警告 0 | exit **0**，警告 **0**（无新增软检缺口） |
| events / passages / event_people / people / sources / relations 行数 | 171/233/453/111/119/227 | **190/280/493/123/133/239** |
| 年份跨度（`meta.json`） | -773 ~ -565 | **-773 ~ -522** |
| 主角计 | 26 | **27**（+子产） |
| `Z082` 撞号检查 | — | 崔杼一节四条事目（E202–E205）全部指向第一件建立的 `Z082`，未新建同书同篇第二行 ✓ |
| ID 撞号 | — | 五表对旧主表 **0 撞号**，逐段连续无跳号 |

合入过程中的一处工程细节：首次合入脚本因 `print` 语句在 Windows cp1252 控制台编码下抛 `UnicodeEncodeError`，中断于 `sources.csv` 写入之后、`people.csv` 写入之前——发现后先 `git checkout` 还原被部分写入的 `sources.csv`，修复脚本编码问题（`stdout.reconfigure(encoding="utf-8")`）后完整重跑，未产生残留脏数据（跑前已用 `wc -l` 核对各表行数确认未受影响）。合入脚本本身为临时脚本，跑完即删，未入库。

## 三、待裁定 / 上报事项（未自行裁量，照录归档）

以下事项 CHANGES.md 已详列论证，本轮按任务书要求"照录归档，本轮不动"：

1. **向戌—赵武／屈建两条关系未织**：配角配额已由崔杼/晏婴/齐庄公/向戌/魏绛用满，赵武、屈建未立人物行。CHANGES.md §六·2.1 给出两条候选处置（追加名额补立 / 留待后续晋系批次回补），交裁示。
2. **E197 两年合一事目**（前525 裨灶之请 + 前524 火作与拒禳）是否应拆为两条编年事目——号段有余，可选改排建议。
3. **E200（鄢陵之战）是否拆子条**（吕锜梦射月、子反之死单立如 E200A）——号段有余，可选改排建议。
4. **`P_WEIJIANG`（魏绛）与卫国诸君 ID 拼音撞车**（同为 WEI）是否需套用 v1.9 GONG 后缀通则——Sophia 判断不必要（差异在整个后缀），已在 `notes` 内写明晋大夫非卫君，本轮维持现状。
5. **鄢陵是否拆战场/城邑两点**（`L_YAN` 与假设的 `L_YANLING`）——本轮复用 `L_YAN`，如认为应分点呈现，可选改排建议。
6. **孔子卒年边界（-479 超出 [-800,-480]）**——任务书明示本轮年份边界不动，`death_year_bce` 留空、卒年入 `notes` 的现状维持。

以上事项均已随 `docs/changes/r23b_zichan_shidai.md` 原样归档，未来处理时可直接按 ID 取用论证，不会遗失。

## 四、已知问题 / 交接备注

1. **叔向 B2 升格前置已就位**：`P_SHUXIANG` 现为配角，跨两件出现（E194/E196/E206），`active_years_bce` 已按本轮修正扩为「前546-前536」；升格时需一并核对是否需要进一步外扩（Sophia CHANGES.md §六·1 已提示，本轮只是把现有跨度覆盖问题修正，不代表升格已完成）。
2. **晏婴 B2 升格前置已就位**：`P_YANYING` 现为配角，`active_years_bce` 只取本库所收范围（前548），《晏子春秋》材料一字未引，T 层分层决定完整留给 B2。
3. **「政制」「其他（史笔类）」两处图标/展示问题均为已登记待办**：政制类图标缺失是 r24 Vision 既有待办（v1.21 已登记）；E205 归类「其他」不产生新的展示位问题（本身即为既有通用图标）。
4. **齐系/郑系人物色彩容量**：本轮新增齐人 3 名（崔杼、晏婴、齐庄公）、郑人 5 名（子产、子皮、子大叔、然明、裨灶），CHANGES.md 已提示与 Vision 容量核查相关，供后续参考。

## 五、提交与部署

提交按主题拆分为三条：

| commit | 内容 |
|---|---|
| `b64128d` | `data(r23b合入)`：六表增量合入、L_YAN/叔向两条修正落地、孔子入库、JSON 重生成 |
| `2002f4d` | `docs(convention)`：conventions 升 v1.22，两条判例（死者不亲至/E205 归类备考） |
| `83b37c1` | `docs(delivery)`：归档 `r23b_zichan_shidai.md`＋Sophia/Skipper 交付说明，清空 `data/incoming/round23/` |

`git push origin main`（`cd5503a..83b37c1`）后 GitHub Actions（`pages.yml`，run `30748903795`）**跑绿**（`completed success`，`deploy` job 16s，含 `Validate data (guard)` 与 `Post-deploy self-check` 两步均通过）。

**线上带参复验**（`nocache` 时间戳参数绕开 CDN 边缘缓存）：本地 Bash 对 `chunqiu.timechorus.com`／`quinnyxu.github.io` 两个域名的直接 DNS 解析均失败（历次交付说明记录的沙箱网络限制，与 r15 一致），改用 `curl --resolve <域名>:443:<已知IP>` 固定域名到其真实 IP、保留 SNI/Host 的方式绕过，两个域名（自定义域 Cloudflare IP `104.21.80.55`、GitHub Pages IP `185.199.108.153`）请求结果一致：

```
meta.json: generated_at=2026-08-02T12:52:27+00:00（与本地 csv_to_json.py 重生成结果逐字段一致）
tables: events=190, passages=280, people=123, event_people=493, sources=133, relations=239
year_range_bce: {min: -773, max: -522}

people.json: is_protagonist=1 共 27 条
events.json: E205 独立一行，category=其他，未并入 E202
passages.json: Q252.modern_note 首段【《左传》系于事末之评断层·追记之辞，非当时之言】
```

**四项复验点对照**（任务书 §【验收】要求，全部线上实测通过）：

| 复验点 | 结果 |
|---|---|
| 主角计 27 位 | 线上 `people.json` 实测 `is_protagonist=1` 共 **27** 条 ✓ |
| 年份跨度 -773 ～ -522 | 线上 `meta.json` 实测 `year_range_bce={min:-773, max:-522}` ✓ |
| E205 独立在列 | 线上 `events.json` 独立一行，`category=其他`，未并入 E202 ✓ |
| E195 孔子追记层标可查 | 线上 `passages.json` `Q252.modern_note` 首段【《左传》系于事末之评断层·追记之辞，非当时之言】✓ |
