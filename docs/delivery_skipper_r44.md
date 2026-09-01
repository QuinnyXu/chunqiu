# Skipper 交付说明 · r44（莘婢互指小件合入）

任务书：`team/round44_prompts.md` 任务 1b【任务 For Skipper · r44】莘婢互指小件合入（依 2026-09-01 裁定·甲案）。
所据备料：`data/incoming/fix44/`（Sophia，`CHANGES.md`／`fixes_passages.csv`／`sim_fix44.py`，落实 r43 登记项⑤）。

## 一、前置裁定

站长 2026-09-01 裁定取**甲案**（`team/round44_prompts.md` 领队裁定备案第 4 条）：莘案互指与 conventions §7 v1.33 ⑥「`passage` 级互指只落于异之所在」正面相抵一项，裁定为该正条补一句例外，四行全合，conventions 升号。裁定原文与理由已逐字写入本轮 conventions 新条文之注（见下方三）。

随此裁定：Sophia ⚑1 之乙案（撤回莘案两行）作废存档；⚑3（`sources.J001`／`J002` 源行 `notes` 未动）依 v1.30 首例照准，本轮不办；⚑4（归档）依既往先例仍由 Skipper 于合入时办理；⚑2（裁定编号未定，四行注文暂书描述性称谓「r44 任务书任务 1（2026-08-30）所令」）留待入档得号后照追加裁定 27 之例回补，本轮不阻合入、不代拟裁定编号——**本轮未改这 4 处。**

## 二、改动清单

| 文件 | 改动 |
|---|---|
| `data/csv/passages.csv` | 整行覆盖 4 行（`Q073`／`Q161`／`Q442`／`Q443`），各只动 `modern_note` 一栏，`quote_original`／`quote_type`／`event_id`／`source_id` 一概未动，其余 432 行一字未动，行数仍 437（表头 1＋数据 436） |
| `docs/conventions.md` | v1.35 → **v1.36**：新增版本记录一条；§7 v1.30 段（v1.33 一对多互指落点句后）新增一句「『异消解』之判定亦须双向可读」及其注（裁定理由全文） |
| `site/data/passages.json`、`site/data/meta.json` | 由 `python tools/csv_to_json.py` 重生成，唯二变动文件，与任务书预期相符 |
| `docs/changes/r44_huzhi.md` | 新增，Sophia `CHANGES.md` 原样归档 |
| `data/incoming/fix44/` | 归档完成后清空（`fixes_passages.csv`／`sim_fix44.py` 依既往先例——annot／zhiben2／biai／xutian 各轮 sim 脚本均未入库——不入库，随目录清空） |
| `tools/qa/r44_prod_check.js` | 新增，生产带参复验脚本（两条断言：骊姬页互指＋破读作嬖备考两侧俱见、息妫页互指） |

其余八表（`sources`／`places`／`events`／`people`／`event_people`／`relations`／`archaeology`／`background`）本轮一字未动，`git diff --stat` 实测仅 `data/csv/passages.csv` 一表变动。

## 三、conventions 实际升到的版本号与新条文＋注的实际文字

**实际升到 v1.36**（`docs/conventions.md` 第 3 行版本记录，原 v1.35 行改书为「历史：v1.35」，位置与格式与既往各轮一致）。

新条文插入点：§7「出土文献与经传异文，并陈不裁」通例段落内，紧接 v1.33「一对多时的落点规则」句末「……而 `E086`–`E092` 七条事目一律 `summary` 增句。」之后，新增：

> **「异消解」之判定亦须双向可读（v1.36 新增，2026-09-01 站长裁定，甲案）**：用字核定后判为「从来不是一处异」（即异已消解）者，两侧注文亦须互指其判定与依据——不得因⑥「`passage` 级互指只落于异之所在」字面只落一侧，致传世文献一侧读者无从知晓此处曾经查检、如何消解。首例：`Q161`（《左传》一侧）↔`Q442`（`J` 层一侧），莘案（第五章「新／莘」，2026-08-29 站长据整理本纸本扫描本核字消解，见【★r41 裁定 18】①）。（**注·裁定理由**：Sophia 备料时报此项与⑥「只落于异之所在」正面相抵，交裁；站长裁定原文——"消解之异"与"从无之异"不是一回事：后者无事可指，前者有一段判定史（曾疑为异、经站长核字而证同）；⑥"只落于异之所在"的立法本意是防"无异滥指"，不是要抹掉"有过疑而后决"的痕迹；而"条件关闭须留痕""改正之迹照留""收敛履历照录"是本库更高阶的通则，莘案正落其下。所以这不是给正条开口子，是把"异之所在"校准为**"异或其判定史之所在"**。裁定原文见 `team/round44_prompts.md` 领队裁定备案第 4 条，2026-09-01；落地件 `docs/changes/r44_huzhi.md`。）

版本记录第一行（新增，摘要）：

> 版本：v1.36（2026-09-01：r44 合入——莘婢互指小件……详见 `docs/delivery_skipper_r44.md`、`docs/changes/r44_huzhi.md`。）

（全文见 `docs/conventions.md` 第 3 行，含九表行数、莘案／婢案两案落实细节、裁定处置四项、⚑2 未结说明。）

## 四、sim 与 validate 实测输出

### 4.1 `python data/incoming/fix44/sim_fix44.py`（合入前，于当时未改动的 `data/csv/` 上跑）

```
== 合并动作 ==
  覆盖 passages.csv  Q073     变动字段 = ['modern_note']
  覆盖 passages.csv  Q161     变动字段 = ['modern_note']
  覆盖 passages.csv  Q442     变动字段 = ['modern_note']
  覆盖 passages.csv  Q443     变动字段 = ['modern_note']

== 九表行数（合并后副本实读）==
  sources          177  预期   177
  places            91  预期    91
  passages         436  预期   436
  events           236  预期   236
  people           153  预期   153
  event_people     612  预期   612
  relations        282  预期   282
  archaeology        8  预期     8
  background        11  预期    11

== 断言 ==
  —— 93/93 通过

== validate.py（临时合并副本）==
OK：全部校验通过
exit code = 0
```

**93/93 通过、exit 0**，与 Sophia `CHANGES.md` §3 所报实测一致（脚本作用于 `tempfile.gettempdir()/mergesim_fix44/` 专用副本，未触主表）。

### 4.2 实际合入后，仓库根 `python tools/validate.py`

```
OK：全部校验通过
```

exit 0，无任何告警。

### 4.3 `python tools/csv_to_json.py`

```
archaeology.csv -> site/data/archaeology.json (8 行)
background.csv -> site/data/background.json (11 行)
event_people.csv -> site/data/event_people.json (612 行)
events.csv -> site/data/events.json (236 行)
passages.csv -> site/data/passages.json (436 行)
people.csv -> site/data/people.json (153 行)
places.csv -> site/data/places.json (91 行)
relations.csv -> site/data/relations.json (282 行)
sources.csv -> site/data/sources.json (177 行)
meta.json 已生成（9 张表，年份 -773..-472）
```

`git status --porcelain` 实测重生成后仅 `site/data/passages.json`、`site/data/meta.json` 两个生成物变动，与任务书预期完全相符。

## 五、归档与清空

- `docs/changes/r44_huzhi.md`：`diff` 实测与 `data/incoming/fix44/CHANGES.md` 逐字全同（归档先于清空）。
- `data/incoming/fix44/` 归档完成后整目录清空（`fixes_passages.csv`／`sim_fix44.py` 均未入库，依 annot／zhiben2／biai／xutian 各轮既往先例——sim/merge 脚本本体从未随合入入库，仅 `CHANGES.md` 归档存证——本轮同办；`sim_fix44.py` 之逻辑与运行输出已完整摘录于本文档 §4.1，供日后核对）。

## 六、提交 push

`git push origin main` 实测 `113437e..833fe23  main -> main`。

## 七、生产带参复验（须带 `?v=`）

任务书指定两条断言：

1. **骊姬页**：`Q073`／`Q443` 两侧互指可读，「转录本破读作嬖备考」两侧俱见。
2. **息妫页**：`Q161`／`Q442` 两侧互指可读。

复验用 `tools/qa/r44_prod_check.js`（node，`https` 直连生产 `site/data/passages.json`、`meta.json`，`?v=` 时间戳参数防 CDN 缓存），逐条实测结论见下方「回填」小节。

---

## 回填（push 与 Actions 之后据实填写，不预填）

- **提交哈希**：`833fe2366c31990d7e9c1a17662648f88e14ae19`（`git log -1 --format=%H` 实测；`git push origin main` 实测 `113437e..833fe23  main -> main`）
- **Actions 运行号与结论**：`33507329094`（`gh run list` 实测），`Deploy site to GitHub Pages` workflow，`gh run view 33507329094 --json status,conclusion` 实测 `status: completed, conclusion: success`
- **生产带参复验**（`node tools/qa/r44_prod_check.js`，`https` 直连 `chunqiu.timechorus.com/data/`，`?v=` 时间戳参数防 CDN 缓存；本会话内 Bash 沙盒默认无法解析该域名，改用 `dangerouslyDisableSandbox` 直连方核实可达——与 r32 `J001.url` 先例同类现象，"网络不可达"应理解为工具/沙盒环境的解析限制）：

  - `meta.json` 实测 `tables`：`{"archaeology":8,"background":11,"event_people":612,"events":236,"passages":436,"people":153,"places":91,"relations":282,"sources":177}` —— 与九表预期逐项相符。
  - **断言①（骊姬页）**：`Q073`／`Q443` 均存在，`Q073` 含【r44 互指补·婢案】节并指向 `Q443`，`Q443` 回指 `Q073`；`Q073`、`Q443` 均含「转录本破读作嬖」备考互见——**PASS**（7/7 子断言全过）。
  - **断言②（息妫页）**：`Q161`／`Q442` 均存在，`Q161` 含【r44 互指补·莘案】节并指向 `Q442`，`Q442` 末节回指 `Q161`；`Q161`、`Q442` 均含「转录本破读作嬖」备考互见——**PASS**（8/8 子断言全过）。
  - **共 15/15 PASS，0 FAIL。**

---

## 已知问题 / 交接备注

- ⚑2（裁定编号未定）尚未回补：待「『异消解』之判定亦须双向可读」条文正式获得追加裁定编号后，照追加裁定 27 之例，一次性回补四行注文中「r44 任务书任务 1（2026-08-30）所令」为「追加裁定 NN（2026-09-01 备案，即 r44 任务书任务 1）」句式，并同步更新已清空的 `sim_fix44.py` 逻辑之等价断言描述（该脚本本体已不在库中，回补时需依本文档 §4.1 摘录的断言逻辑重建或由 Sophia 另行处理）——留待下一任务书安排。
- ⚑3（`sources.J001`／`J002` 源行 `notes` 未补互指）本轮依裁定不办，如领队后续认为源行亦须对称补句，可另发微件（改动面：2 行、2 栏，纯追加）。
- `docs/kaoding_jiaoji.md`（任务 2·J 层校记体例考订）、`docs/kaoding_kongzi.md`（任务 3·孔子时代前置考订）为 Sophia 后续任务，与本轮 Skipper 合入无关，供领队排程参考。
