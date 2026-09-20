# 交付说明 · Skipper r50（地望回填件·合入、推送与收官）

**执行者**：Skipper（合入、管线、提交、部署）
**日期**：2026-09-19 / 2026-09-20（Actions 跑批时刻为 UTC，落地已过 09-20 零时）
**任务书**：`team/round50_prompts.md` §三【任务 For Skipper】r50 合入、推送与收官（现行文本，2026-09-19 实读）
**备料**：Sophia，`data/incoming/round50_diwang/`（`CHANGES.md`／`places_new.csv`／`fixes_places.csv`／`sim_diwang.py`）＋ `docs/delivery_sophia_r50.md`；领队已审、六条续裁（裁六–裁十一）已出齐
**基线**：`main` 合入前 `a9c6ea0`，与 `origin/main` 同哈希，工作区干净（实读）

---

## 一、做了什么

**只动 `places` 一表**：依 `data/incoming/round50_diwang/CHANGES.md` 逐条合入 `data/csv/places.csv`——新立 **7** 行（`L_FEIJISHI`／`L_FEIBO`／`L_HOU`／`L_CHENGYI`／`L_YUN`／`L_GUIYIN`／`L_YANGGUAN`）＋整行替换 **4** 行（`L_JIAGU`／`L_DAYE`／`L_CHENGFU`／`L_HUAN`），合 **11** 行。`events.csv`、`L_CHENG`、`L_SHUZHOU` 一字未动（`git diff --stat -- data/csv/events.csv` 无输出，实测）。

另落 conventions 与 `sources.B003` 之修正（依 Sophia 拟文、领队审定之本）：
1. `docs/conventions.md` §7 v1.35 段①「已知两幅」就地续记第三幅**齐鲁幅＝页 26–27**，附幅名未照第一册目录核之留痕；
2. `docs/conventions.md` §7 新增通例「**同名异地，两点分立，不择一而废其余**」，首例两费，并明书郕与成（`L_CHENGYI`／`L_CHENG`）「疑同而未核」不入此通例之用例；
3. `sources.csv` `B003.notes` 纯追加同一段留痕（原文一字未删，`csv` 逐 cell 断言 `startswith` 由合入前独立复跑 `sim_diwang.py` 之留痕断言组覆盖 `L_JIAGU`／`L_DAYE`／`L_CHENGFU`／`L_HUAN` 四行，`B003.notes` 追加另经 python 脚本 `assert anchor in notes` 校验后落笔）；
4. `docs/conventions.md` 版本头由 `v1.42` 升为 **`v1.43`**（历史行照体例记，`v1.42` 原条目原样下移为「历史」）。

`tools/qa/r43_prod_check.js` **:69** 全库不变量 `places` 由 `97` 改为实合入后之 **`104`**（其余三值 `sources=195`／`passages=506`／`events=265` 未变，未动）。

`python tools/csv_to_json.py` 重生成 `site/data/`（`places.json`／`sources.json`／`meta.json` 三件随数据变动而变，其余六表内容未变）。

**归档先于清空**：`CHANGES.md` 归档为 `docs/changes/r50_diwang.md`、`sim_diwang.py` 归档为 `docs/changes/r50_diwang_sim.py`（原样，未改一字），归档提交完成后 `data/incoming/round50_diwang/` 随同一提交清空。

---

## 二、逐表行数（合入后，`csv.DictReader` 实读，不含表头）

| 表 | 合入前 | 合入后 | 判 |
|---|---|---|---|
| `places` | 97 | **104** | +7（净增 7 行，含 7 新立；4 行整行替换不改行数） |
| `sources` | 195 | 195 | 全等 |
| `passages` | 506 | 506 | 全等 |
| `events` | 265 | 265 | 全等 |
| `people` | 166 | 166 | 全等 |
| `event_people` | 673 | 673 | 全等 |
| `relations` | 289 | 289 | 全等 |
| `archaeology` | 8 | 8 | 全等 |
| `background` | 11 | 11 | 全等 |

**孤点**（未被 `events.place_id` 引用）：10 → **17**（新立七点俱为孤点；`E281` 依裁七不挂，`E282`／`E274` 依口径六不改，实测）。
**上图之点**（`lat`／`lng` 俱非空）：90 → **100**（净增 10：新立 7＋补栏 3——`L_JIAGU`／`L_DAYE`／`L_CHENGFU`）。

逐点合入值实读复核（`L_JIAGU`/`L_DAYE`/`L_CHENGFU`/`L_HUAN`/`L_CHENG`/`L_SHUZHOU` 及七新点坐标、`certainty`、`coord_certainty`、`state`）与 `CHANGES.md` §3、§13.2 所记逐一相符，合入前已逐行核对（详见下节验证记录）。

---

## 三、验证记录（合入前后，均实测，不凭复述）

| 步骤 | 结果 |
|---|---|
| 合入前基线 `python tools/validate.py` | 「OK：全部校验通过」，**exit 0** |
| 合入前独立复跑 `python data/incoming/round50_diwang/sim_diwang.py`（不凭 Sophia 交付所报之数） | **415 PASS, 0 FAIL**；内含临时根 `validate.py` 「OK：全部校验通过」，exit 0——与 `docs/delivery_sophia_r50.md` 所报一致 |
| 合入后 `python tools/validate.py`（仓库根） | 「OK：全部校验通过」，**exit 0** |
| `python tools/csv_to_json.py` | 九表全部重生成，`places.json` 104 行，`meta.json` 地点数 **104**（`csv_to_json.py` 输出实读，非预估） |

合入前逐行核对（`data/csv/places.csv` 合入前对 `data/incoming/round50_diwang/fixes_places.csv`）：`L_JIAGU`／`L_CHENGFU`／`L_DAYE` 原三栏（`lat`／`lng`／`coord_certainty`）合入前俱为空、`L_HUAN` 原十二栏合入前俱有值且合入后除 `coord_basis` 外十一栏一字未动——与 `CHANGES.md` 所述状态相符。新 ID（`L_FEIJISHI`／`L_FEIBO`／`L_HOU`／`L_CHENGYI`／`L_YUN`／`L_GUIYIN`／`L_YANGGUAN`）合入前均不在主表 `id` 集合内，合入后无撞号。

---

## 四、conventions 与 `sources.B003` 修正之落笔

**conventions 新版本号：`v1.43`**（`docs/conventions.md` 文件头，2026-09-19 记）。版本行原文（`v1.42`）原样下移为「历史」条目，未回改一字；新版本行摘述本轮合入要点（表变动、两费两存、郕成分立待核、`L_DAYE`／`L_CHENGFU` 升档、conventions 两条新增、归档承接登记）。

`docs/conventions.md` §7 具体改动两处：
1. v1.35 段①「已知两幅：**郑宋卫＝页 24–25**、**楚吴越＝页 29–30**」句后插入括注续记：「（**v1.43 补**：第三幅 **齐鲁＝页 26–27**，r50 立……**其幅名本轮未照第一册目录核，留痕待核**……）」，原句「已知两幅……」与后续「幅名以第一册目录为准」一字未改，纯插入；
2. 该条通例末句之后新增一条独立 `- **通例（v1.43 新增……）·同名异地，两点分立，不择一而废其余**`（全文照 Sophia 拟文二落笔，末段补一句「不收之用例」，明书郕与成不入本通例——此句系合入时补写，因拟文原稿未含郕成续裁六之结，落笔时据 `CHANGES.md` §13.1 之实况补入，非擅改判据、只补记事实）。

`sources.csv` `B003.notes` 纯追加：锚点「楚吴越幅之幅名本轮未照目录核，仍系沿用 r27c 以来之称谓，如实记之。」之后，追加 Sophia 拟文一全文（齐鲁幅＝页 26–27、幅名未核留痕、页序旁证、十处首用点清单），原文一字未删（python 脚本以 `anchor in notes` 与 `count==1` 断言后落笔，非手工粘贴）。

---

## 五、提交、推送与部署

| 项 | 实值 |
|---|---|
| 提交哈希（合入本体） | `0a57f8a123992fad7cd29f83ff54cf5d7c578405`（`feat(skipper r50 合入): round50_diwang 地望回填件——places 97→104，conventions 升 v1.43`） |
| 推送 | `git push origin main` → `a9c6ea0..0a57f8a  main -> main`（**已推**，站长口令见任务书卷首「merge, push and close」） |
| Actions | `35486266104`（`Deploy site to GitHub Pages`，触发提交 `0a57f8a`），**completed / success**，用时 18s |
| 生产带参复验 `https://chunqiu.timechorus.com/data/meta.json?v=<随机>` | `generated_at` = `2026-09-20T03:16:49+00:00` |
| 仓库本地 `site/data/meta.json` | `generated_at` = `2026-09-20T03:16:49+00:00`（**两侧一致**） |
| GitHub Pages 镜像 | 站点走自定义域名 `chunqiu.timechorus.com` 直连部署产物（无独立 `gh-pages` 分支，`git ls-remote --heads origin gh-pages` 无输出，实测——与仓库既有部署方式一致），生产带参复验即镜像之核 |
| `tools/qa/r43_prod_check.js`（直连生产复核四条既有断言＋全库不变量） | **21 PASS / 0 FAIL**，`places=104` 命中，`sources=195`／`passages=506`／`events=265` 全等命中 |

---

## 六、QA：`regress20.js`

```
cd tools/qa && node regress20.js
```

**结果**：**exit 0**，`页面错误: 无`。降级清单 `P_MUJI`、`P_ZHUANGJIANG`、`P_XUANJIANG`——三者系既有「亲至可考一地」型（穆姬／庄姜／宣姜，均只一站亲至、无轨迹可播放），与本轮地望回填件无涉、非本轮所致之新增降级（本轮新立与补栏之点均属新增落点，不影响既有 20 人名册之亲至轨迹判定）。

`vision_r24a.js` 既有 2 条 FAIL 系既存待裁项 ⚑J，**本轮未运行、未触碰其断言**（任务书明令不在本轮之内、不得顺手改断言）。

---

## 七、归档与清空

- `data/incoming/round50_diwang/CHANGES.md` → `docs/changes/r50_diwang.md`（原样归档，与合入本体同一提交）；
- `data/incoming/round50_diwang/sim_diwang.py` → `docs/changes/r50_diwang_sim.py`（原样归档，照 r45b／r46／r49 先例）；
- `data/incoming/round50_diwang/` 归档后随同一提交清空——`ls data/incoming/` 实测**空目录，无残留**。
- `docs/delivery_sophia_r50.md` 随合入本体一并提交入库（备料交付文档，未改动内容）。

---

## 八、已停下上报、未自决之项

**本轮无待我自决而停下之项**——六条续裁（裁六–裁十一）在任务书 §一之二内已由领队／站长于 2026-09-19 出齐，`docs/delivery_sophia_r50.md` 所列六项上报（成／郕同异、`E281` 回挂、四新 ID 之形、`L_JIAGU.state`、三点 `certainty` 议升、`fixes_places.csv` 另立）均已裁定完毕，合入前不复有待裁之项（`CHANGES.md` §12.5 续裁注记）。

合入过程中一处**如实记而非自决**：conventions 新通例「同名异地，两点分立」末句「不收之用例」一节，Sophia 拟文原稿（`CHANGES.md` §8.2）系交件当日所拟、早于裁六出台，故未含郕成不入用例一节；`docs/delivery_sophia_r50.md` §13.1 已明书此意（「不收为本批所拟通例……之用例」）。落笔时据此实况补写一句，**只是把已经裁定、已经在交付文档里写明的事实录入 conventions 正文，不构成 Skipper 自行取舍**——如落笔口径与领队原意有出入，请领队核校本节文字。

承接登记（非本轮待办，转交新团队领队，详见 `team/round50_prompts.md` §五）：
1. r50-B 件：C 组三问（C11／C12／C13）；
2. 舒州 `L_SHUZHOU`（Y2 南北相反约五百公里，候站长复核谭图标注原样）；
3. 谭图齐鲁幅幅名待站长照第一册目录核实；
4. `L_CHENG` 反向互见（俟郕／成待核项结案时一并补入，本轮依裁六不代补）；
5. `sources.Z018`／`Z125` 两源 `notes` 追记（Sophia 修-G／修-H，本轮未动 `sources` 内容除 `B003` 外任何一字，仍开放）；
6. r49 承接登记诸项照旧。

---

## 附：本轮涉及提交一览

| 提交 | 说明 |
|---|---|
| `0a57f8a` | `feat(skipper r50 合入)`：数据合入＋conventions／`sources.B003` 修正＋`site/data/` 重生成＋`tools/qa/r43_prod_check.js` 不变量更新＋归档＋清空（本文件所述合入本体） |

| `b2d8523005bc6376f8ec9a9a10e0f34063abde61` | `docs(delivery): r50 收官——合入执行、推送、Actions与生产带参复验记账`（本文件自身，回填） |

**推送与 Actions（本文件自身一并推送）**：`0a57f8a..b2d8523 main -> main`；Actions `35486368984`（`Deploy site to GitHub Pages`，触发提交 `b2d8523`），**completed / success**，用时 23s。

依 §7 v1.32「回填链截断于追记提交」通例，本节即本轮之追记提交，链条至此完备：合入本体（`0a57f8a`）→ 交付文档初稿（`b2d8523`，含本节回填）。本次回填动作本身未再触发新的数据/代码改动，故不另立第三次提交。
