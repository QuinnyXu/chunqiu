# 交付 · Skipper r47 —— round46_gugan（定哀骨干批甲）合入

任务：`team/round46_prompts.md` 任务 1b〔任务 For Skipper · r46 批甲合入〕，前置〔2026-09-02 领队裁定 · 批甲备料审毕〕五条（三项 ID/体例裁定在内）。

**轮次编号说明**：任务书原文称本件为"r46 批甲合入"，但团队轮次编号（`docs/delivery_skipper_r<N>.md`）之 `r46` 此前已被 Vision 的通行字视图推送占用（`docs/delivery_vision_r46.md`／`docs/delivery_skipper_r46.md`，与 `round46_gugan`（数据批次目录名）恰为同一"46"而非同一计数——前者是团队交付轮次序号，后者是任务书批次代号，两套计数并行推进、本轮恰好撞了数字）。依任务指示 14"轮次编号按仓库既有体例，与既有 r44/r44b/r44c/r44d/r45/r45b/r46 不撞"，本件交付文档取下一空号 **r47**；提交信息与 `conventions.md` 版本历史沿用同一编号。

## 一、落笔前实读

实读 `data/incoming/round46_gugan/CHANGES.md` 全文（440 行）与 `team/round46_prompts.md`〔2026-09-02 领队裁定 · 批甲备料审毕〕五条全文；`docs/conventions.md` 当时为 v1.40。基线核实：HEAD `13391c8`，`git status --short` 仅一条 `??  data/incoming/round46_gugan/`；九表行数实读 events 237／passages 440／sources 179／people 153／event_people 614／relations 282／places 93／archaeology 8／background 11，与 CHANGES 基线声明相符。

## 二、质量门（先预合入态，后正式合入）

1. **预合入态**：仓库根跑 `python data/incoming/round46_gugan/sim_gugan.py`——**1378 PASS，0 FAIL，exit code 0**（含第 11 节双本比对，网络可达，52 段全过）。
2. **正式合入**：写脚本纯 append 七张 `*_new.csv` 于 `data/csv/` 表尾（无整行替换、无删除、无既有 ID 变动）；`L_CHENGFU` 一行按裁定 2 追加防混句（见下）。合入后逐表行数：

   | 表 | 合入前 | 合入后 | CHANGES 预期 | 判 |
   |---|---|---|---|---|
   | events | 237 | **256** | 256 | 相符 |
   | passages | 440 | **471** | 471 | 相符 |
   | sources | 179 | **192** | 192 | 相符 |
   | people | 153 | **164** | 164 | 相符 |
   | event_people | 614 | **645** | 645 | 相符 |
   | relations | 282 | **285** | 285 | 相符 |
   | places | 93 | **95** | 95 | 相符 |
   | archaeology | 8 | 8 | 8 | 不变 |
   | background | 11 | 11 | 11 | 不变 |

3. **新 ID 段实际用量**：events `E275`–`E293`（19 个，网段 `E275`–`E296` 内，余 `E294`–`E296` 三号未占）；passages `Q458`–`Q488`（31 个，网段 `Q458`–`Q489` 内，余 `Q489` 一号未占）；sources `Z119`–`Z131`（13 个，接台账尾号）；relations `R300`–`R302`（3 个，接台账尾号）——均在网段内、未逾界。
4. `python tools/csv_to_json.py` 重生成：九表 JSON 逐一核对行数与预期一致，`archaeology.json`／`background.json` 内容未变。
5. `python tools/validate.py` → `OK：全部校验通过`，exit 0，无告警。

**顺手规整一处**：合并脚本用 `csv.DictWriter` 追加的 19 行（`events.csv`）默认写入 `\r\n`，与文件其余行的 `\n` 不一致（`git status` 报 CRLF 警告）；`.gitattributes` 本会在 `git add` 时自动规整为 LF，但为免工作树本身留有不一致行结尾，已直接对七张主表文件做 CRLF→LF 规整，规整后重新验证 `validate.py` 仍 OK、`csv_to_json.py` 重新生成结果不变。

## 三、三项 ID/体例裁定的落地（逐条实核）

1. **`L_CHENGFU` 照立不加后缀，追加防混句**：CHANGES 原稿 `description` 已详记与既有 `L_CHENGPU`（城濮）拼音仅差一字母之登记与不加后缀之判据，但**未含裁定 2 明文要求的那一句「与 L_CHENGPU（城濮）非一地」**——此句由本次合入时补写落地（`【与 L_CHENGPU（城濮）非一地】`，追加于 `description` 末尾），既有 `L_CHENGPU` 行一字未动（生产实测其 `ancient_name`／`state`／坐标俱与合入前相同）。
2. **四国君 `GONG` 后缀式照准**：`P_LUZHAOGONG`／`P_LUDINGGONG`／`P_LUAIGONG`／`P_QIJIANGONG` 四行照 CHANGES 原样入库，`conventions.md` §2 补写放宽通则一句（见下节）。
3. **阳虎从严不立照准**：`people_new.csv` 十一人中确无阳虎，生产实测 `P_YANGHU` 不存在；`E278`–`E281` 四目以其人为题而不入挂链，批丙回补义务已在 `docs/changes/r46_gugan.md` §10 与 §4.1 登记在案，本件不代立。

## 四、`docs/kaoding_kongzi.md` §2.2 合计句更正（裁定 1 落地）

原文：`**合计：必 12 条、宜 2 条、候 1 条**（甲-4、甲-10 各含数节，落表时或须再分，实际条数以合并模拟为准）。`

更正后：`**合计：必 13 条、宜 2 条、候 1 条**（甲-4、甲-10 各含数节，落表时或须再分，实际条数以合并模拟为准）。【勘误：原作必 12，2026-09-02 勘：实 13，甲-16 后补入表而合计未随改（批甲备料穷检所出）】`

**只改此一处合计句**，`kaoding_kongzi.md` 其余文字一字未动（已用 `git diff` 核实，本文件本次 diff 仅此一行 `-`/`+`）。注文照录裁定 1 原文，未增删一字。

## 五、`conventions.md` v1.40 → v1.41（二句落点）

版本历史条目（`docs/conventions.md:3`）已写入本轮合入全貌（表数变动、三项 ID 裁定、义务件回挂、QA 脚本联动、归档路径等），旧 v1.40 条目原样移至"历史"行，未回改一字。

- **正条一句**（§7，紧接"判定反转须如实记录，不得抹平"通例之后，`docs/conventions.md` 约第 276 行）：新增通例「**判定史留原貌，事实错就地勘正加注**」——区分⚑7"考订件原文不动"所护之**判定史陈迹**与本次所遇之**事实性计数错**，两分即为正条；首例即上节 `kaoding_kongzi.md` §2.2 之更正。
- **GONG 式放宽之由一句**（§2，紧接"谥号形近加 GONG 后缀通则（v1.9）"段落之后）：新增"通则放宽·国君行一律套用，不问是否撞号"——国君行命名取"国＋谥＋GONG"式，无撞号亦用，为类内一致；理由与首例（本批四国君）俱写入。

`conventions.md` 本轮共增二句，与任务书"conventions 升下一号二句"逐字对应。

## 六、既有 QA 脚本核实与更新（含前端走查门）

**先如实自纠任务书前置的一处不确**：任务指示称"`r43_prod_check.js`、`r44_prod_check.js` 之全库不变量四条本批必然过时"——**实核 `r44_prod_check.js` 全文并无 `sources=`/`places=`/`passages=`/`events=` 一类全库不变量断言**（该文件三段断言均是 `Q073`/`Q443`/`Q161`/`Q442` 互指与释文形貌，与全库行数无涉），只有 `r43_prod_check.js:68–71` 四行是真的全库不变量。故本轮**只改 `r43_prod_check.js` 一处**，`r44_prod_check.js` 一字未动——这是任务书假设与实况不符、照例改措辞不改数据之一例。

- `tools/qa/r43_prod_check.js:68–71`：四条断言值由 `179/93/440/237` 改为 **`192/95/471/256`**，注释同步改为"r47 round46_gugan 批甲合入后基线，本批扩表所致之预期内联动，非本次改动所致"。生产实跑 **21/21 PASS**（含四条新不变量）。
- `tools/qa/r44_prod_check.js`：不改，生产实跑 **24/24 PASS**（既有互指/释文断言不受影响）。
- `tools/qa/r45_prod_check.js`：不改（无全库不变量），生产实跑 **21/21 PASS**。
- `tools/qa/vision_r46.js:343`：检索引文组总量断言由 `440` 改为 **`471`**（同类数据链接更新），本地起 `python -m http.server 8791` 服务 `site/` 后实跑：**82/82 全过**，其中 §1"限域实证"逐条核实全库 471 行 `quote_original` 中含全角括注者仍只 `Q167`/`Q442`/`Q448` 三行、含"＝"者仍只 `Q442`、实际发生转换者仍恰二行（`Q442`/`Q448`）——**新增 31 条 passages 逐一核对均不含全角括注或"＝"，未被误转换**，直接兑现任务指示 11 的这一具体担忧；§7"全库其余引文"逐行核对 471 条渲染文本与 `quote_original` 逐字相等、零副作用。
- 附带跑 `tools/qa/regress20.js`（人物播放轨迹回归）：本地服务器起后逐人物核对轨迹与降级清单，**页面错误：无**。

## 七、生产带参复验（`?v=` 时间戳，沙盒 DNS 本轮可解析，直连实测）

`https://chunqiu.timechorus.com/data/meta.json?v=<timestamp>` 实测九表：`sources 192／places 95／passages 471／events 256／people 164／event_people 645／relations 285／archaeology 8／background 11`，与合入后本地实读一致。

针对性复验脚本（临时，未入库）核对结果 **30/30 PASS**：

- **E274 挂链 2→3（定公亲至）**：生产实测 `event_people` 中 `E274` 挂链数 =3，含 `P_LUDINGGONG`（`presence=亲至`／`directness=direct`），原 `P_KONGZI`／`P_QIJING` 两行仍在。
- **新 19 事目抽验**：19 条全部存在；甲-4 拆出四目（`E278`-505／`E279`-504／`E280`-502／`E281`-501，`E281.place_id` 为空）；甲-16 拆出二目（`E289` 丧葬／`E290` 灾异，均 -483）；`E293`（白公胜之乱，-479）`place_id` 为空、未取 `L_YINGDU` 充数；19 事目 `summary` 一律含批次帽原文；`P_KONGZI.is_protagonist` 仍 `0`、`active_years_bce` 未动；`P_YANGHU` 不存在。
- **`L_CHENGFU`／`L_CHENGPU` 两点不混**：`L_CHENGFU`（城父，楚，坐标三栏为 `null`，`description` 含防混句）与 `L_CHENGPU`（城濮，卫，坐标 35.40/115.40 未变、`description` 未被追加防混句）逐字段核对无误。
- **`L_SHUZHOU`**：存在，state=齐，坐标三栏为 `null`。

## 八、归档与清空

`docs/changes/r46_gugan.md`（`CHANGES.md` 原样，`diff` 核实逐字相同）与 `docs/changes/r46_gugan_sim.py`（`sim_gugan.py` 原样）先提交入库，`data/incoming/round46_gugan/` 随后清空——顺序符合 §10.1 归档纪律。`yema_backfill_r46.md`（八点回填表）未单独另存：其内容与 `CHANGES.md` §7.2 逐字相同（CHANGES 原文已注明"内容同 §7.2"），已随 `docs/changes/r46_gugan.md` 完整归档，无信息损失。

## 九、提交、推送、Actions

- 提交哈希：**`df0ade0ecbd577e71381c8207a64a88ac94ba5c1`**
- 推送：`git push origin main` 成功，`13391c8..df0ade0 main -> main`
- GitHub Actions（Deploy site to GitHub Pages）：运行号 **`33703762529`**，实测 `status=completed conclusion=success`

## 十、仍开放的待裁/登记事项（本件不代裁不代改，逐条移交领队／站长）

以下均已列于 `docs/changes/r46_gugan.md` §10，本件只复述条目、不重复论证：

1. `E290`（冬十二月螽）薄链——只挂在位之君一条"相关"，为不新开"零挂链事目"之例，请核可；若以为宁留零挂链，请示下。
2. 是否为"鄀"立点（`E293` 落点所需，同须纸本核）——本批不代立。
3. 两条呼之欲出而依判据不织的 `relations`：鲁定公—鲁哀公（父子）、鲁昭公—鲁定公（兄弟），二者《左传》无明文、出《史记》，依判据三与分层纪律不据以织边；若宜降 `reliability` 补记，请示下。
4. r45 上报项 4（"地望未定之点是否宜先占 ID"）仍未裁，本批据此取保守之枝（只为落点所必需者立点）。
5. 三节待补材料（`Z120` 蔡史墨论范氏中行氏之亡、`Z122` 孟孙谓范献子语、`Z128` 齐陈乞逐高国立悼公杀安孺子荼一节）——配额之择，非分层之判，宜排入后批。
6. `P_YEGONG.shi`（沈，medium）与 `P_BAIGONGSHENG`"王孙胜"一称（旁称，待核）两处标注状态待后续核实。
7. **批丙回补义务登记**：`P_YANGHU` 立行后须回挂 `E278`–`E281` 四目（presence 依各目明文）。

## 改动文件清单（均为仓库内绝对可定位路径）

- `data/csv/{events,passages,sources,people,event_people,relations,places}.csv`（各 append，行数见上表）
- `site/data/{events,passages,sources,people,event_people,relations,places,meta}.json`（`csv_to_json.py` 重生成）
- `docs/conventions.md`（v1.40→v1.41，§2/§7 各增一句，版本历史新增一段）
- `docs/kaoding_kongzi.md`（§2.2 合计句就地更正加注）
- `tools/qa/r43_prod_check.js`（:68–71 四条不变量更新）
- `tools/qa/vision_r46.js`（:343 检索总量更新）
- `docs/changes/r46_gugan.md`（新增，CHANGES 原样归档）
- `docs/changes/r46_gugan_sim.py`（新增，sim_gugan.py 原样归档）
- `docs/delivery_skipper_r47.md`（本件）

提交哈希 `df0ade0ecbd577e71381c8207a64a88ac94ba5c1`；Actions 运行 `33703762529`（success）。
