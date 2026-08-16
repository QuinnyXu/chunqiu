# Skipper r32 交付说明——出土文献层护栏同步 + conventions 升号 + fix31_xinian 合入

日期：2026-08-15　执行者：Skipper

## 一、护栏同步（`tools/validate.py`，2 处各 1 行）

1. `ID_PATTERNS["sources"]` 正则（第 75 行附近）：`^[ZSGAPBYLT]\d{3}$` → `^[ZSGAPBYLTJ]\d{3}$`（阻断级，补 `J` 字母）。
2. `SOFT_CHECK_TIERS`（第 51–59 行附近）：补 `"出土文献": True,`（随立即开软检，裁定 6 所令）。

**复跑结果（自行实测，非依 Sophia 报告推断）**：

- 护栏改动前（主表未动，基线）：`python tools/validate.py` → `OK：全部校验通过`，exit 0，警告 0 条。
- 护栏改动后、数据尚未合入：`python tools/validate.py` → `OK：全部校验通过`，exit 0，警告 0 条（两处改动向下兼容，不影响既有九前缀数据）。
- 护栏改动后、数据全部合入：`python tools/validate.py` → `OK：全部校验通过`，exit 0，**警告 0 条**。裁定 6 所期「开档即净」实测成立（与 Sophia 模拟结论一致）。

未另加 `sources.category`／`passages.quote_type` 的枚举校验——复核确认 `validate.py` 全文对 `category` 无枚举、对 `quote_type` 亦无枚举（仅软检查表），两个新值不触发报错，Sophia 的实测判断成立，本轮未做护栏增强。

## 二、合入逐行结果

| 表 | 动作 | id | 结果 |
|---|---|---|---|
| sources | 新增 | `J001` | append 成功，`category=出土文献`，`notes` 四项标目俱全 |
| passages | 新增 | `Q442` | append 成功，`event_id=E146`／`source_id=J001`／`quote_type=出土文献` |
| passages | 整行覆盖 | `Q161` | `quote_original` 逐字核对与覆盖前**全等**；`modern_note` 追加反向互指句 |
| events | 整行覆盖 | `E146` | `summary` 追加句；`source_ids` 由 `Z025` 改为 **`Z025;J001`**（领队裁定保留）；`reliability=high` 不变 |
| events | 整行覆盖 | `E147` | `summary` 追加句；`source_ids` **维持 `Z027`**（领队裁定删去来件所加 `;J001`）；`reliability=high` 不变 |
| people | 整行覆盖 | `P_XIHOU` | `notes` 追加段；`death_year_bce`／`birth_year_bce` 均维持留空 |

**领队三项裁定核实**：

1. `E146.source_ids` 加挂 `J001` 已保留（`Z025;J001`）；`E147` 的 `;J001` 已删去（维持 `Z027`）。核对 `E147.summary` 增句原文——「《系年》所记与此有异，见引文对读（清华简《系年》第五章，J001；引文挂于 E146 之 Q442）……」——**已含指向 `E146`／`Q442`（引文对读）的指路**，`E147` 一侧读者可达性由此句独立承担，无需另补。
2. 归档命名采用 `docs/changes/r32_xinian.md`（`data/incoming/fix31_xinian/` 目录名照旧不改）。
3. `docs/kaoding_chutuwenxian.md` 已随本轮 `git add` 一并提交入库。

## 三、validate 与软检警告数

合入后：`python tools/validate.py` → `OK：全部校验通过`，**exit 0，软检警告 0 条**。

## 四、conventions 新版本号与九条落点

新版本号：**v1.30**（`docs/conventions.md`，2026-08-15）。九条落点：

| # | 落点 | 状态 |
|---|---|---|
| 1 | §2 ID 规范表补 `J###`，前缀计数九→十 | 已落 |
| 2 | §2 新节「`J###` 前缀分层纪律」（独立见证层、单独支撑默认 medium、四条尺度、入藏简性质固定著录） | 已落 |
| 3 | §2 同节内「金文归 J（预防性裁定）」 | 已落 |
| 4 | §7 新通例「出土文献与经传异文，并陈不裁」（灵魂句、三例外、并陈双向义务） | 已落 |
| 5 | §7 判例「异之性质」框架三层细分（措辞层／行动层／次第层） | 已落 |
| 6 | §7 口径句「转录本可证有无某事、次第如何，不可证某字作某」 | 已落 |
| 7 | §7 软检分档方针段落追记「出土文献」档随立即开 | 已落（`tools/validate.py` 同步） |
| 8 | §2「`sources.category` 新值『出土文献』」＋ J 层批次区分不加栏 | 已落 |
| 9 | §11 登记试点排程（下一试点第六章；越 −464 截断规则入待议池） | 已落 |

## 五、行数实测

| 表 | 合入前 | 合入后 | 变化 |
|---|---|---|---|
| sources | 173 | **174** | +1（`J001`） |
| passages | 424 | **425** | +1（`Q442`） |
| events | 235 | 235 | 不变 |
| people | 153 | 153 | 不变 |
| places | 91 | 91 | 不变 |

`site/data/*.json` 已随 `python tools/csv_to_json.py` 重新生成，行数与上表一致（`meta.json` 年份跨度维持 -773..-472）。全库 `grep -n '〔页码待补〕' data/csv/*.csv site/data/*.json` 实测 **0 处**。

## 六、`J001.url` 实测结果

Sophia 备料环境与本次 Skipper 会话内 `WebFetch` 工具均报 `zh.wikisource.org` 域名解析失败；改用 `curl` 直连该域名实测 **HTTP 200**，页面 `<title>` 与 `firstHeading` 均为「**清華大學藏戰國竹簡/系年**」——**页名确系简体「系年」，非「繫年」**；正文含「蔡哀侯」「弗訓」「蔡哀侯妻之」等 `Q442` 引文关键词，内容与本库转录一致。故 `J001.url` 本轮**实测可达、内容属实**，此前"网络不可达"应理解为特定工具（`WebFetch`）的域名解析限制，非该维基文库页面本身不可达；已回告：页名为「系年」。

## 七、归档与 incoming 清空状态

- `docs/changes/r32_xinian.md` 已建立，与 `data/incoming/fix31_xinian/CHANGES.md` 逐字比对**完全一致**（原样归档，未重排未摘要）。
- `data/incoming/fix31_xinian/` 已清空删除，`data/incoming/` 目录仅余 `.gitkeep` 占位。

## 八、生产带参复验（三条断言，追记，2026-08-16）

提交推送后 GitHub Actions 部署运行成功（见 §九），随后直连生产 `https://chunqiu.timechorus.com/data/*.json` 实测（`curl`，非依赖前端渲染截图），三条断言结论如下：

1. **息妫页两支记载同台**——生产 `passages.json` 中 `Q161`（`quote_type=原文`）与 `Q442`（`quote_type=出土文献`）的 `event_id` 均为 `E146`；`site/app.js` 第 921 行事件详情渲染逻辑为 `DATA.passages.filter(p => p.event_id === evt.id)`，按 `event_id` 分组逐条渲染引文区块，故两条引文必在同一事目（`E146`「莘之役」）详情页内并列渲染。**断言成立。**
2. **层标可辨**——`Q442.modern_note` 以 `【出土文献层，与《左传》系统并陈不裁、二说不合一；不作史实骨架用，亦不据以改易经传骨架】` 开头（编者层标，`.q-caveat` 渲染）；`app.js` 第 929–934 行逻辑「`quote_type` 非空且非"原文"即追加 `.q-layer` 徽标、文本取 `quote_type` 原值」对 `Q442`（`quote_type=出土文献`）成立，徽标文本即显示"出土文献"；`Q161`（`quote_type=原文`）依同一逻辑**不生成徽标**。故 `Q442` 徽标之"有"与 `Q161` 徽标之"无"构成页面上的直接视觉区分。**断言成立**，但留一处上报项（见下）。
3. **`Q161` 双向互指**——生产 `Q161.modern_note` 含 `J001` 与 `Q442` 两处指称（"另按：清华简《系年》第五章于此作『蔡哀侯妻之』……见 `J001` 及其 `passage`（`Q442`）"）；`Q442.modern_note` 含"与《左传·庄公十年》（本事目 `Q161`）逐节对读"一句，明写 `Q161` 之号。两侧互指均在生产数据中实测存在。**断言成立。**

**其余不变量实测**：生产 `meta.json` — `sources=174`／`passages=425`／`events=235`／`people=153`（`places`/`relations`/`event_people`/`background`/`archaeology` 未在本轮改动范围内，未见于本次校验但合入前后行数比对已在 §五 核对）；`year_range_bce` 为 `[-773, -472]`（不变）；`E146`／`E147.reliability` 均为 `high`；`J001.url` 内容与页名见 §六。`Q161.quote_original` 与合入前逐字全等（见 §二表，本轮 diff 仅命中 `modern_note` 一栏）。`〔页码待补〕` 全库仍为 0（生产 JSON 复核同上）。

**上报项（不阻塞，供 Vision 参考）**：`Q442` 的 `.q-layer` 徽标目前**无专属配色**——`QLAYER_CLASS`（`app.js` 第 881 行起）尚未收录「出土文献」档，故该徽标沿用 `.quote` 基类默认样式（边框 `currentColor`、朱色左线与经传骨架 `原文` 同色），与既有「言论/评论」（淡墨）、「后出叙事」（灰虚线）、「诗歌」（菉色）、「经义异闻」（乌梅紫）五档专属色系不一致。断言 2 的"视觉可区分"以"有徽标 vs 无徽标"这一最低阈值成立，但风格上未比照既有五档配色体例。此项属前端视觉范畴，非本轮 Skipper 任务书范围，登记供下一轮 Vision 任务参考，不影响本次数据交付。

## 九、提交与部署（追记）

- 提交哈希：`51f91366ca5fcb00f05e3a142c87ea5a0ea3fa70`（`51f9136`）
- 提交信息首行：`feat(skipper r32 出土文献层): J 前缀落地——护栏同步＋conventions 升 v1.30＋fix31_xinian 合入`
- 推送：`git push origin main` 成功，`787443d..51f9136 main -> main`
- GitHub Actions 运行：`Deploy site to GitHub Pages`，run id `31919857345`，https://github.com/QuinnyXu/chunqiu/actions/runs/31919857345 ，`status=completed`，`conclusion=success`
- 生产直连复验：`https://chunqiu.timechorus.com/data/*.json` 均 200，内容与本地合入结果逐项核对一致（见 §八）

## 十、异常

无阻断性异常。合入过程与 Sophia 备料模拟结论完全一致（护栏改动结果、行数变化、软检警告数、`〔页码待补〕` 归零均实测吻合）。两处非阻断性记录：

1. `J001.url` 网络可达性——`WebFetch` 工具与 `gh` CLI 在本会话环境下均报域名/API 解析失败，但改用 `curl` 直连均证实可达（`zh.wikisource.org` HTTP 200、`api.github.com` HTTP 200）；判断为特定工具的网络路径限制，非目标站点本身不可达。已回告：`J001` 页名为简体「**系年**」，非「繫年」。
2. `Q442` 引文徽标暂无专属配色（见 §八上报项），已登记供 Vision 参考，不影响本轮数据交付的完整性与三条带参断言的实测通过。
