# 交付说明 · Skipper r58-推送件

**本件**：`r58-推送件` —— conventions 升 v1.50（四事）、推前七门、推送、推后逐项入账，并随件二事（round59 新书、round54 末尾指路）。

**所据**：`team/round54_prompts.md` `## Task for Skipper · r58-推送件` 全节（含其后「r58-E 所拆」「口令之记」二勘注）、§十九 裁一百三十三／一百三十四、§十七 裁一百三十、§十六 裁一百二十四／一百二十七、裁八十四。★ 站长口令已下（「Ready to push」），2026-10-03 EDT 领队落记后发件。

**落笔之日**：2026-10-03 EDT（`America/New_York`，照 §7 常条「账之日取 `America/New_York`」）。

**前置自核**：接件时 `git status --porcelain` 空（r58-E 已先办 §二，本地领先 `origin/main` 五笔：`117b356`／`b5fb556`／`4295f27`／`7bae4f6`／`96605a1`），分支 `main`。

---

## 一、conventions 升 v1.50（自成一提交，在推送之前）

落 §五① 现行文本所列四事，俱就地加注、旧文一字不删：

| 事 | 落点 | 所落之要 |
|---|---|---|
| ① 裁一百三十 四款（照原字） | `docs/conventions.md` §7 常条列末新增一条「系于现状之文，须系于一条量」 | 四款原字照录，并附其眼、与裁一百一十四之别、正身三例、首个活例（即②） |
| ② 了结 `_headers` 勘注内「其号候裁」一句 | §7「未验之说」勘注块内，原句（`:515` 附近）之后 | 原句**照留不删**，新加一行〔2026-10-03 EDT 勘注〕，记「候裁」之状已解、归 v1.50，并书其由（债清则记号须去，解法仍是就地加注、不改原字） |
| ③ 裁一百三十四「件号之连续」四款（主词为派件者 Co站长） | §10 新立 10.4「件号之连续」 | 四款原文照录（已据裁一百三十四所正，明书主词），并附互指（§14 归属行约执行者之提交，本节约派件者之编号，二者所约不同） |
| ④ 裁一百三十三 归属行之则 | 新立 §14「提交归属行裁定记录」 | 其由三句、定三事（含「既往照留不改，故其史必然是混的」一句须入条文）；258／67 二数书其谓词与核法，并标「截至 `96605a1`」（2026-10-03 EDT 实跑），不书活数 |

**版本行与历史行**：照既有体例——原 `版本：v1.49（…）` 整行原样下移，前缀改作 `历史：`，其上另立新的 `版本：v1.50（…）` 行，概述四事；旧 `历史：v1.48` 及更早各行**一字未动**。

**提交**：`47c2e11d969188b3b927d9bfd83728d760de08fd`（`docs(conventions): v1.50——四事随推送件落（裁一百三十／一百三十二至一百三十四）`）。`git diff --stat` 只 `docs/conventions.md` 一物（`+43/-1`），不涉 `site/app.js`／`site/styles.css`，故不须重戳。

---

## 二、推前七门，逐门单跑（v1.50 提交之后、推送之前；一门一跑，不串接）

| 门 | exit | 其要 |
|---|---|---|
| `python tools/qa/asset_stamp_gate.py` | **0** | 2 引俱相符；按类反证 7 条俱命中；**无 exit 1 复现**（领队所记之「八跑复现不得」一事本轮未再现） |
| `node tools/qa/prod_data_invariants.js` | **0** | 91 过／0 红 |
| `node tools/qa/prod_freshness.js` | **0** | 判红 0 条、只报 2 条（指纹判绿，窗之量只报）；本跑生产仍服旧 `app.js?v=d3a53669`（推送前应有之状——旧窗未关） |
| `node tools/qa/prod_render_invariants.js` | **0** | 合计 48 项，FAIL 0 |
| `node tools/qa/vision_r56.js` | **0** | 共 99 条，全绿；反证俱红、二法俱同 |
| `node tools/qa/vision_r55.js` | **0** | 共 253 条，全绿；反证俱如期而红 |
| `python tools/validate.py` | **0** | `OK：全部校验通过` |

七门俱 exit 0，符合「若一门非 0 即停下上报」之界外之态——不触发停报。

---

## 三、推送

`git push origin main`（不切分支、不 force）：

```
9e29564..47c2e11  main -> main
```

**远端新 HEAD**：`47c2e11d969188b3b927d9bfd83728d760de08fd`（与本地 `main`、`origin/main` 三者同哈希）。

**Actions**：`run id 37157569232`（`Deploy site to GitHub Pages`，trigger push，对应提交即 v1.50 之 `47c2e11`）——`gh run watch 37157569232 --exit-status` 报 **success**。

---

## 四、推后逐项入账（裁八十四；账式照领队之④：问「生产自己这一对成不成对」）

实测时刻：2026-10-03 约 18:12 -0400（EDT），Actions 完成之后。

| 项 | 实测 | 果 |
|---|---|---|
| 生产 `app.js` 实算 ＝ 生产 `index.html` 所书之参？ | 实算 `6c1ca025`（sha256 前 8 位，338925 字节）／`index.html` 所书 `v=6c1ca025` | **二值相符 ✓** |
| 生产 `styles.css` 实算 ＝ 生产 `index.html` 所书之参？ | 实算 `7f00e1a7`（100092 字节）／`index.html` 所书 `v=7f00e1a7` | **二值相符 ✓** |
| `prod_freshness.js` exit | **0** | §一 文档内引法已带新参 `app.js?v=6c1ca025`；§二 SHA-256 对位：**同一本**（文档新·脚本新，同步）；§三 窗仍存（14400s），只报不红 |
| `prod_data_invariants.js` exit（本轮未动 `data/`，须 0） | **0** | 91 过／0 红，与预期相符 |
| `prod_render_invariants.js` exit | **0** | 合计 48 项，FAIL 0 |
| `asset_stamp_gate.py` exit | **0** | 2 引俱相符；7 条反证俱命中；**无 exit 1** |
| `vision_r56.js` exit | **0** | 共 99 条全绿——**本跑未中 exit 2，故三义（反证不红／二法不等／史料已供此敌而门头未改）无一触发，不须择述** |

★ **Actions success 只证「推了」**：以上七项俱为推送之后**实测生产**所得，不以 Actions 之 success 代之；Actions 之 success 另记于 §三，二者并立不相代。

---

## 五、窗之辨（测持旧 `index.html` 之读者之窗）

照第二十六笔之勘：续验所验者是「持旧 `index.html` 之读者」，不是「`app.js` 新否」（后者之窗已被戳关掉）。推送之后，`index.html` 自身之 cache 头**现测**：

```
curl -sI https://chunqiu.timechorus.com/
Cache-Control: public, max-age=0, must-revalidate
cf-cache-status: DYNAMIC
```

**读法**：`index.html` 之 `max-age=0`，每访必回源校验——**该文档本身无缓存之窗**，故持旧 `index.html` 之读者一访即取得新文档（内引新参 `app.js?v=6c1ca025`），**今之余窗已随此次部署完成而清**。账上照命不复述 `app.js`／`styles.css` 之秒数（其策在 Cloudflare zone 侧，`site/_headers` 不存在，见 conventions §7「未验之说」）。

---

## 六、随件二事

### 1. `team/round59_prompts.md`（新立，只落盘、不提交，`team/` 不入公开仓）

**书头**：所承（自 r59 起，承 `round54_prompts.md` 所载 r54–r58）、与旧书之关系（续篇非替代，一书数轮满则另立不更名之由）、一行回指旧书（「r54–r58 见 `team/round54_prompts.md`；本书只载 r59 及其后」）。

### 2. `team/round54_prompts.md` 末加一行指路（只落盘、不提交）

```
r59 及其后见 round59_prompts.md；本书所载 r54–r58，其名不改，以存诸引用之所指。
```

---

## 七、git status 与 `origin/main...main` 末态（本节落笔前实测，v1.50 提交之后、本交付文档提交之前）

```
git status --porcelain       → （空）
git rev-parse HEAD            → 47c2e11d969188b3b927d9bfd83728d760de08fd
git rev-parse origin/main     → 47c2e11d969188b3b927d9bfd83728d760de08fd
git log origin/main...main    → （空，二者同一提交）
分支：main
```

★ **本交付文档之提交在推送之后**（照 r55 推送追记前例，本件须一并推送并书明）：追记提交之哈希与其 Actions 运行号，俟其实际发生后由本件之收尾一次回填（见下方「追记」）。

---

## 已知问题与交接备注

1. `asset_stamp_gate.py` 本轮推前、推后各跑一次，**俱 exit 0，未见 exit 1 复现**——领队所记之「一跑 exit 1 而八跑复现不得」一事，本轮未撞见；仍记此为未查清之事，交下一轮留意。
2. `vision_r56.js` 本轮推前、推后各跑一次，**俱 exit 0**（99 条全绿）——未触发 exit 2，故未演示「三义」之辨；交接者若日后撞见 exit 2，请照任务书 §三 之命择其所中之一义书之。
3. conventions v1.50 §14 所书「258／67」二数**系「截至 `96605a1`」之数，不是活数**——此后仓内提交数必增（v1.50 本身即令其增一），核对者请自跑 `git log --oneline | wc -l`／`git log --grep='Claude-Session' --oneline | wc -l` 取当下之数，不得援引本节或条文所书二数当作现状。
4. `team/round59_prompts.md` 今只有头、正文俟首件派发时续写；`team/round54_prompts.md` 末之指路一行与本件同落，均只落盘、未提交（`team/` 在 `.gitignore` 内）。

---

## 追记（本交付文档提交、推送之后回填；照 r55 推送追记前例）

（俟本文档提交并推送后，由本次会话或续接会话实测回填：本文档之提交哈希、对应 Actions 运行号与结论。回填前，上文「七」所记之 `origin/main...main` 末态只及 v1.50 为止，不预支本件自身提交之状态。）
