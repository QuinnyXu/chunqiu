# Skipper r27 交付说明——round27a/27b 合入（吴越篇启幕：阖庐＋伍子胥）

日期：2026-08-10　执行：Skipper　依据：`docs/conventions.md` v1.25（本轮由 v1.24 升至）

## 一、任务范围

按任务书【任务 For Skipper】第 27 轮任务 2，五项：
① 合入顺序 27a→27b、events 先行、共用事件（柏举等）核对无重立；
② 裁定落地：孔子 `death_year_bce=-479` 回填、E242/E243 白发注、`docs/kaoding_wudu.md` 正文收窄；
③ conventions 升号：`S` 前缀广义化、"详载中之无"判据、relations/sources 网段规则修正；
④ validate、重生成 JSON、CHANGES 归档、清空、push、确认 Actions 绿、带参复验。

## 二、合入内容

### 2.1 合入顺序与共用事件核对

严格按 27a→27b 顺序合入（`docs/changes/r27a_helu.md`、`docs/changes/r27b_wuzixu.md` 逐条比对执行）：

1. **round27a**（阖闾件＋吴都甲案落表）：append events（+9，E222–E230）、people（+9，含主角阖庐 `P_HELU`，第 **30** 位）、places（+2，`L_BOJU`/`L_ZUILI`）、archaeology（+2，`ARC007`/`ARC008`）、sources（+15）、passages（+30，Q331–Q360）、event_people（+20）、relations（+10，R265–R274）；随后整行替换 `places.L_WUDU`（吴都甲案，四说并录）。
2. **round27b**（伍子胥件）：append events（+4，E241–E244）、people（+7，含主角伍员 `P_WUYUAN`，第 **31** 位）、sources（+3）、passages（+18，Q361–Q378）、event_people（+20，含挂靠 27a 事目 E226/E227/E228/E229 共 5 行）、relations（+11，R275–R285）；随后整行替换 `archaeology.ARC008`（木渎坐标核实结果，坐标维持约值不动）。
3. **共用事件核对**：柏举之战（`E228`）、秦师救楚（`E229`）、阖庐问伐楚之谋（`E226`）、伍员为行人（`E227`）均由 27a 首立，27b 只挂链未重立；`Z102`/`Z105`/`Z106`/`S011`/`T009` 五个来源亦由 27a 首建，27b 径引未重建；27b 另主动核出 `Z088`（昭公二十年，r23b 已建）为库内既有，径引不新建。逐条核对与 CHANGES.md 记述一致，无重立、无漏挂。

### 2.2 各表实际计数（合入前 → 27a 后 → 27a+27b 后）

| 表 | 合入前 | 27a 后 | 27a+27b 后 | 与合并模拟对照 |
|---|---|---|---|---|
| events | 201 | 210 | **214** | 一致 |
| people | 127 | 136 | **143**（主角 29→**31**） | 一致 |
| places | 79 | 81 | **81** | 一致（27b 无新增） |
| archaeology | 6 | 8 | **8** | 一致 |
| sources | 144 | 159 | **162** | 一致 |
| passages | 315 | 345 | **363** | 一致 |
| event_people | 517 | 537 | **557** | 一致 |
| relations | 247 | 257 | **268** | 一致 |
| 年份跨度 | 前773–前514 | 前773–前496 | 前773–**前496** | 一致 |

**与两件 CHANGES.md 各自"合并模拟"自报的数字逐一吻合，无出入**。

## 三、裁定落地

### 3.1 孔子 `death_year_bce` 回填（裁定15）

`P_KONGZI.death_year_bce` 由留空改填 **-479**（《左传·哀公十六年》"夏，四月，己丑，孔丘卒"经传明文，high）。`notes` 末句同步改写：删去"超出本库年代边界 [-800,-480]……边界是否放宽已列 CHANGES 待裁"一段（该边界已随 v1.24/fix26 放宽至 `[-800,-464]`，回填已无 validate 障碍），改注明确切出处与此前留空之由，供读者可溯。

### 3.2 E242/E243「白发注一句」（裁定9）

**上报一处 ID 交接问题**：裁定9 原文写"E242 的 modern_note 可加一句……"，但经核对，"过昭关一夜白发"这条分层示范的实际落点是 **`E243`**（伍员奔吴），不是 `E242`（费无极谗成、伍奢伍尚之死）——两事在传文中虽同系昭公二十年，但内容各不相涉，`E242` 全条与"昭关""白发"均无关联。Sophia 在 `E243.summary`、`Q370.modern_note`（`event_id=E243`）与 `P_WUYUAN.notes` 三处已写就远超"一句"的完整成文：逐字核对《吴越春秋》该篇全文，指出"一夜白发"三书（左传/史记/吴越春秋）俱无，其情节要素实出明代小说《东周列国志》一系，明确本库九前缀（含 `T`）无一适用，故不建源、不作 passage。此内容已在合并模拟阶段随 27b 一并入库，本轮判定**裁定9 之要求已实质满足**（且远超"一句"之量），未再向 `E242`（内容不相关的事件）另行添注——避免把与"白发"无关的一条事件强行挂上一句离题的编者按语。此项作为交接口径问题上报领队核对，若领队原意确指他处，请指正后续补。

### 3.3 `docs/kaoding_wudu.md` §0.3 收窄（裁定16）

按 round27b 附记附-3 所出改法，重写 §0.3 判据段：
- 明确"不名吴都"穷检**已完成**（维基文库十二公卷离线穷检，候选专名零命中），不再是"待另指一人复核"的未定项；
- 弃"根本差别"一语（穷检证实齐鲁郑陈蔡诸国之都同样不以专名书之），改立"**同一沉默，无争议之国无害、四说相争之国致命**"；
- 采入附-4 正面旁证（"吴入郢"／"於越入吴"同书相邻两年、同一句式，对楚都专名可书之旁证）入正文；
- §6.1 不确定项列表第 1、2 条同步更新为"已完成""已尝试核实、维持约值"的现状描述，不再挂"待复核"未决态。

## 四、conventions 新版本号

**v1.24 → v1.25**。改动四处：

1. 版本头新增 v1.25 条目，记录本轮合入内容与三项领队裁定。
2. §2 sources 表 `S###` 释义由"史记"改为"秦汉正史层（史记／汉书等）"，新增「`S###` 前缀广义化」说明段（裁定12，起因见 `docs/kaoding_wudu.md` §五《汉书·地理志》前缀待议项；`tools/validate.py` 正则 `^[ZSGAPBYLT]\d{3}$` **不变**，字母集合本已含 `S`，只是语义扩展，无需改代码）；《汉书》来源行本轮未建，随后续小包补建。
3. §7 新增判例"**详载中之无**"（裁定13），源出 round27b 鞭平王尸处置（`E228`/`Q377`/`Q378`）：《左传·定公四年》于同处密集详载入郢后十余节而独缺鞭尸一节，其分量重于一般"传所不载"，与内部互异的《史记》两说合观，判定鞭尸属传闻层，不单立事件、只挂靠既有骨架事件。
4. §2.1 网段预分配规则修正（裁定10）：新增"relations／sources 不预写具体号，只写接台账尾号"一条，起因是 R264 撞号（1a 预分配"R264 起"时，主表实际尾号已因 r25b 推进至 R264，一写即撞，1a 改从 R265 起编、1b 顺延至 R275）；events／passages 因跨件切分需要连续区间，继续预分配具体区间，但下达前须核实际尾号。

## 五、validate 结果

```
OK：全部校验通过
```

exit 0，软检警告 0 条。`tools/csv_to_json.py` 已重跑，`site/data/*.json` 与 `meta.json` 已同步生成。

## 六、归档与清空

- `data/incoming/round27a/CHANGES.md` → `docs/changes/r27a_helu.md`（原样归档）。
- `data/incoming/round27b/CHANGES.md` → `docs/changes/r27b_wuzixu.md`（原样归档）。
- 归档完成后，`data/incoming/round27a/`、`data/incoming/round27b/` 两目录已清空（仅保留 `data/incoming/.gitkeep`），顺序符合 §10.1 归档纪律（归档在先、清空在后）。

## 七、带参复验（生成物本地核验）

`site/data/meta.json`：`events=214`、`people=143`、`places=81`、`archaeology=8`、`sources=162`、`passages=363`、`event_people=557`、`relations=268`，`year_range_bce={min:-773, max:-496}`——与任务书验收项"主角 31、年份 -773 ~ -496"完全一致。

1. **主角计数**：`people.json` 中 `is_protagonist=1` 者 **31** 人。
2. **孔子卒年**：`P_KONGZI.death_year_bce = -479`。
3. **吴都四说并录**：`L_WUDU.certainty=medium`、`coord_certainty=low`（不动），`description` 含甲/乙/丙/丁四说与"本库不作论定"字样。
4. **柏举大条**：`E228`（"柏举之战与吴入郢"，`category=战争`，`place_id=L_BOJU`）在库；`P_WUYUAN` 于 `E228` 之 `event_people` 行 `presence=相关`、`directness=indirect`，`role_in_event` 写实"通篇无其名……本库不据以补其在场"。
5. **季札观乐**：`E223`（"季札聘鲁观周乐：「观止矣」"，`category=论对`，`importance=1`）在库。
6. **鱼肠四层并陈**：`E224` 下 `Q338`–`Q340`（原文，传不书剑名）、`Q341`/`Q342`（经义异闻，T008/T009，"鱼肠"始见）、`Q343`（后出叙事，S011，匕首）六条 passage 层次分明。
7. **白发之不录**：`Q370`（`event_id=E243`，`quote_type=经义异闻`）`modern_note` 含"东皋公""明代小说"字样，明确本库九前缀无一适用、不建源不作 passage。
8. **鞭尸 passage**：`Q377`/`Q378`（均 `event_id=E228`，`quote_type=后出叙事`）在库，均未单立专条。

## 八、提交与部署

- 提交哈希：`d0299d4`（"data(r27合入): round27a/27b 吴越篇启幕——阖庐/伍子胥入库，31主角＋conventions v1.25"）
- 已 push 至 `origin main`。
- GitHub Actions（`Deploy site to GitHub Pages`，run `31451349073`）：**completed / success**。
- 生产环境（`https://quinnyxu.github.io/chunqiu/`）核验：`data/meta.json` 与本地生成物逐字段一致（events 214、people 143、places 81、archaeology 8、sources 162、passages 363、event_people 557、relations 268，年份跨度 前773–前496）；`people.json` 主角数 31、`P_KONGZI.death_year_bce=-479`、`L_WUDU.description` 四说并录、`events.json` 含 `E228` 均已远端复核通过。

## 九、已知问题 / 交接备注

- **E242/E243 交接口径**（详见 §3.2）：裁定9 字面写"E242"，实际内容在 `E243`；本轮判定裁定9 精神已由 `E243.summary`/`Q370` 满足，未改动 `E242`，已如实上报，若领队原意另有所指，请指正后续补一句。
- **《汉书》来源行未建**：`S` 前缀已广义化为"秦汉正史层"（涵《史记》《汉书》），但《汉书·地理志》吴条本身尚未建 `sources` 行（`L_WUDU.description` 仍以文字引述），随后续小包补建，任务书原文亦如此安排（"《汉志》吴条来源行随后续小包补建"）。
- **两件 CHANGES.md 累计上报事项共 29 项**（27a 十五项＋27b 十四项，多为地望核对（谭图/杨注）、双本互校、可增补事目建议等史学层面的待复核请求），均已随本轮归档至 `docs/changes/`，不在本次合入范围内处理，留待领队按节奏排期后续批次。其中较关键者：`L_BOJU`/`L_ZUILI` 两点未及核对谭其骧《中国历史地图集》与杨伯峻《春秋左传注》原文；伍尚（`P_WUSHANG`）等因配角配额已满未立人物行，建议候补池处理；勾践升格与夫差入库时点留待 C2 裁定。
- **木渎坐标（`ARC008`）仍为约值**：round27b 两度尝试核实简报原文（`kaogu.cssn.cn`、`szmuseum.com`）均因 DNS 不可达未能取得，本轮维持约值不动（不为"完成核实"而改出更不准的点），待后续批次能访问相应简报者复核。
- **C 段吴越篇后续（C2）预告**：夫差、勾践、卧薪尝胆、属镂之死、黄池与姑苏留待 C2；`P_WUYUAN.notes`、`P_GOUJIAN.notes` 均已预注留白处置。

## 十、Vision r27 视觉件推送与生产复验（追记，2026-08-11）

领队批准后，将 Vision 落在 main 上但未 push 的四笔提交（第 10 国色·吴、首页吴分区、簇折两行、两枚新徽记、搜索「文献」组等）推送至生产，逐项复核如下。

### 10.1 提交核对

四笔提交内容：`3fc76ad`（feat(icons): 两枚新徽记＋撞形与十色判据实测脚本）、`7d96734`（feat(site): 吴国上线——第10国色·首页吴分区·簇折两行·搜索「文献」组）、`02cf374`（test(qa): 回归门新立 §19＋三处快照式断言改对账式）、`adf788a`（docs(design): design_notes 升 v2.4＋交付说明）。

- **数据零改动**：`git diff --stat f089cb1..adf788a -- data site/data` 输出为空；push 前 `git status --porcelain -- data site/data` 亦为空——四笔提交确未触碰 `data/csv/`、`site/data/` 任何一字。
- **私有目录未混入**：`git diff --name-status f089cb1..adf788a` 全量文件清单核对，均属 `docs/`、`site/`（非 `site/data/`）、`tools/qa/` 三类；`grep` 全量改动文件名未命中 `^private/`、`^team/`、`^\.claude/`、`tools/qa/screenshots/`；`tools/qa/screenshots/` 目录本次仅 `.gitkeep` 在库（无 PNG 混入）；`.gitignore` 本身未被这四笔改动。
- `python tools/validate.py` 复跑：**OK：全部校验通过**（数据未动，例行复核）。

### 10.2 push 与部署

- `git push origin main` 结果：`f089cb1..adf788a  main -> main`，推送成功；push 后 `HEAD` 与 `origin/main` 同为 `adf788a`（ahead/behind 0/0）。
- GitHub Actions（`Deploy site to GitHub Pages`）：本次推送触发 run **`31552916881`**，轮询至 **completed / success**（`gh run view 31552916881` 直接取得，非转述）。

### 10.3 生产端复验（逐项列实测证据，未测项如实标注）

| 项 | 结果 | 证据 |
|---|---|---|
| 吴色 `#164F5C` 上线 | ✅ 已实测 | `curl` 生产 `styles.css`：`--state-wu: #164F5C; /* 吴 · 海滨苍青系 …（2 人，r27 新立） */` |
| 两枚徽记可见 | ✅ 已实测 | `curl -o /dev/null -w "%{http_code}"` 生产 `assets/icons/badge_helu.svg`／`badge_wuyuan.svg`，均 **200** |
| 底图吴分区两图层 | ✅ 已实测 | `curl` 生产 `assets/map/base_map.svg`，`layer-states-southeast`、`layer-sea-southeast` 各命中 1 处 |
| og 图 10 枚点 | ✅ 已实测 | 下载生产 `assets/og/og-card.png`（**42510 字节**，与提交 diff 所记新文件字节数一致），用 Read 工具直接查看图像，色带肉眼计数为 **10 个圆点**（原九色＋吴苍青） |
| 检索「孙武」（人物组0／事件组1／文献组1） | ✅ 已实测，有逐字日志 | 针对生产地址（`QA_BASE_URL=https://quinnyxu.github.io/chunqiu`）跑 `node tools/qa/vision_r24a.js` 至完成，日志实录：`搜「孙武」→ {"people":[],"places":[],"events":["柏举之战与吴入郢"],"passages":[],"sources":["《史记·吴太伯世家》"]}`，脚本自判 `[OK]` 人物组0／事件组1／文献组1 三条 |
| 检索「阖闾」经 `alt_names` 命中阖庐 | ✅ 已实测，有逐字日志 | 同一生产回归日志：`搜「阖闾」→ ["阖庐"]`，`[OK]` 经 alt_names 命中「阖庐」；同批 `[OK]` 搜「伍子胥」命中「伍员」 |
| 「超 6 枚折两行」（齐组两行）几何实测 | ⚠️ **仅有汇总层面证据，无法逐字摘录该项断言原文** | 同一生产回归运行以 **「497 项通过，0 项未过」** 收尾（该计数含全部 §19 断言，逻辑上覆盖本项），但受本会话后台输出捕获只保留运行尾部约 100 行所限，§19 三之「徽记簇『超 6 枚折两行』几何实测」这一条的具体断言文本未能保留摘录；之后为取得逐字证据另起一次生产回归，被领队叫停未跑完。**如实标注为"未取得该项的逐条日志原文，仅有汇总计数佐证"，不以此冒充逐项复核。** |

### 10.4 与领队直接核验结果的对照

领队在主会话独立复核所得结论（commit 顺序、`git status --porcelain` 仅见 `data/incoming/round27c/`【Sophia 另一件在跑的纸本备料，与本次推送无关，未纳入本次改动范围】、`styles.css`/两枚徽记 200）与本节 10.1–10.3 一致，无出入。领队复核时 `gh run list` 一度因 `api.github.com` 网络不可达未能取证——此为**领队复核当次**的网络状况；本节 §10.2 所记 run `31552916881` / success 为 **Skipper 本次 push 后即时轮询所得**，两次取证时点不同，结果不矛盾。

### 10.5 结论

四笔提交已确认 push 至 `origin main`（`adf788a`），部署 Actions 成功（run `31552916881`），数据零改动与私有目录隔离均复核通过，`validate.py` 通过。生产端六项复验中五项（国色、两枚徽记、og 图、搜「孙武」、搜「阖闾」）**已实测且有可回溯证据**；「簇折两行」一项**仅有汇总层面的间接佐证（0 未过），未取得该条断言的逐字日志**，如需该项的直接证据，需后续再跑一次针对生产地址的回归并完整保留输出。

---
Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
