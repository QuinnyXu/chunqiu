# delivery_skipper_r23.md —— fix23 合入：管仲政制正位（新立 E187）＋ 政制新类＋收尾判例

任务书：【任务 For Skipper】合入 `data/incoming/fix23/`（Sophia r23 备料，含 §11 追加正位补丁），并落地领队追加裁定（新立「管仲为政」事件、新增「政制」分类、conventions 升号收尾）。

## 一、做了什么

### 1. 数据合入（`data/csv/`，按 CHANGES.md 顺序：先 events_new 后 patch 后 append）

| 动作 | 内容 |
|---|---|
| 新增 events | `E187`「管仲为政：叁国伍鄙，作内政而寄军令」，`-685`·鲁庄公九年·`L_LINZI`·`G002`·`reliability=medium`·`sort_key=60`·**`category=政制`**（领队裁定 b，覆盖 Sophia 备料草稿的 `其他`，见下 §三.2） |
| events.source_ids 补全 | 12 处（含 E068/E071/E117/E128/E138/E141/E142/E143/E176 九条 CHANGES 正文批次 ＋ E003/E013/E016 三条齐风诗归位连带批次） |
| events.summary 改写 | E176（陈灵公事，因 P011《株林》入 source_ids 口径已定，同步改写） |
| **E046 手工收窄**（领队裁定 a） | title「堂阜脱囚，管仲相齐」→「**堂阜脱囚**」；summary 删去"桓公释射钩之怨以为相"一句，语义迁入 E187；`source_ids` 由 `Z024;G002;S001;S008;T003` 删去 `G002`（源随文走——四条政制引文尽迁后 E046 名下已无 G002 引文，且narrowed summary 不再断言《齐语》内容） |
| **E131 归类**（领队裁定 b） | `category`：礼俗 → **政制** |
| passages.event_id 归位 | 8 条：Q067/Q068/Q170/Q171 → E187（四条政制引文尽迁，纲目不再拆散）；Q017→E013、Q018→E003、Q019→E016（三首齐风诗补落点，全库无落点 passage 3→0）；Q146→E128（迁邲之战，与同段 Q140/Q141 归一处） |
| passages.modern_note 替换 | 19 条（诗歌7＋经义异闻4＋政制引文4＋评论4） |
| 新增 passages | 8 条 Q228–Q235（E002/E007/E012 各补两条原文＋书法评断；Q234 为 E187 的 presence 在场明文；Q235 为 E131 顺带补配的左传层佐证） |
| 新增 event_people | 2 条：E187 挂 P_GUANZHONG／P_QIHUAN，均 presence=亲至（判据 Q234「桓公親逆之於郊，而與之坐而問焉」） |
| **event_people 手工改写**（随 E046 收窄连带） | E046 下 P_QIHUAN 的 `role_in_event` 由「释怨拜相（拜相在齐都，未至堂阜）」改为「从谏拜相（拜相在齐都，未至堂阜；「释怨」语义见 E187）」——"释怨"语义随 summary 一并迁出，presence 不变（相关） |

行数核对：`events` 170→**171**、`passages` 225→**233**、`event_people` 451→**453**，与 CHANGES.md §11.7 预期完全一致；`people`/`sources`/`places`/`relations` 未动。

### 2. `tools/validate.py`

- `CATEGORIES` 由 15 类增至 16 类，新增 `政制`。
- `SOFT_CHECK_TIERS["评论"]`：`False → True`（4 条缺口 Q002/Q011/Q025/Q049 已随件清零，符合 conventions §7 v1.20 判例"开档以缺口已核定为前提"）。

### 3. `docs/conventions.md` 升号 v1.20 → **v1.21**，改动五处（含任务书要求的三处＋领队追加裁定的政制类＋源纪律判例）

1. §3 事件分类枚举 15→16 类，新增「政制」，并写明 E187/E131 归类理由、与「礼俗」的区分标准；图标补齐登记为 **r24 Vision 配套待办**（未实现，仅登记）——已核实前端 `CAT_ICON[evt.category] || "qita"` 有兜底，`政制` 类事件在图标补齐前会自动落到「其他」通用图标，不会报错或空白（`site/app.js:837, 117-122`）。
2. §7 新增判例：**`source_ids` 语义判例**（"本条所引全部来源"是结构性字段，只要求正向包含，不得据此单独推断某源为事件史实骨架——反面提醒配 E176/P011《株林》案例）。
3. §7 新增判例：**注家之说不当经传明文用**（源出 Q235 补配取舍——"蒍艾猎即孙叔敖"系杜预注、另有异说，径不取；改用经传本文可径证的"蒍敖"一节）。
4. §7 软检分档判例更新：记录 `评论` 档已开、`言论` 档缺口由 27 降至 23（政制引文顺带补层标，不增新账）。
5. §11：关闭「E130『绝缨之宴』去留」待决项，与 `docs/delivery_skipper_r22.md` §四第 4 点「焚山/E130 展示位」问题一并裁定——**不为"著名但仅见说部层"的情节开单独展示位例外**，E130 维持不回补，Q227（焚山）与 Q144（绝缨宴）均维持仅作既有骨架事件（E095、E128）下的 passage。§11 待决清零。

### 4. 归档与清理

- `data/incoming/fix23/CHANGES.md`（561 行，含 §11 追加补丁）原样复制至 `docs/changes/r23_fix23.md`（行数核对一致，逐字未改）。
- 清空 `data/incoming/fix23/`，仅留 `data/incoming/.gitkeep`。

## 二、怎么验证

```
python tools/validate.py     → OK：全部校验通过（exit 0），无软检警告
python tools/csv_to_json.py  → 9 张表全部重生成，行数与预期完全一致
```

| 验收项 | 合入前 | 合入后 |
|---|---|---|
| `validate.py` | exit 0 | exit **0**，`OK：全部校验通过` |
| 软检警告（诗歌／经义异闻／评论三档，均已开） | 11（诗歌7＋经义异闻4；评论未开不计） | **0**（三档全清，"软检警告"整节消失） |
| 言论档缺口（未开，仅供参考） | 27 | 23（四条政制引文顺带补层标） |
| passage 之源不在事件 source_ids | 11 | 0 |
| importance=1 无 passage 的事件 | 3 | 0 |
| 无 event_id 的 passage | 3 | 0 |
| A 类落点错位（Q170/Q171、Q146） | 2 组 | 0 |
| `events` / `passages` / `event_people` 行数 | 170 / 225 / 451 | **171 / 233 / 453** |

另手工核对（脚本断言 + 抽样人工读值）：
- E046/E187/E131 三条 events 行全字段核对无误（title/summary/source_ids/category 均落实裁定）。
- E046/E187 下 event_people 挂链核对：presence、role_in_event 文本与裁定一致。
- Q067/Q068/Q170/Q171/Q017/Q018/Q019/Q146/Q234/Q235/Q228/Q229 十二条 passages 逐条核对 event_id/source_id/quote_type/modern_note 首字符。
- 合入前发现原 CSV（`events.csv`/`passages.csv`/`event_people.csv`）行尾为 LF，而我用 `csv.writer` 首次落库时按模块默认写出了 CRLF——已发现并改正为 LF（三个文件均已用二进制方式转回 `\r\n`→`\n`），`git diff --stat` 不再出现"CRLF will be replaced by LF"警告，避免整份文件因换行符被判"全文改动"。

## 三、待裁定 / 上报事项（未自行裁量）

沿用 Sophia CHANGES.md §11.8 六项待裁清单，本轮已处理 4 项（E046 收窄、E187 category、评论档开档、Q235 保留），余 2 项照录：

1. **`events.source_ids` 语义判例**——首批 §6(4)/追加 §11.8.3 提请，本轮**已采纳并成文**（conventions §7 新判例，见上）。
2. **C 类七条观察项**（`docs/changes/r23_fix23.md` §7 C1–C7：Q203/Q083/Q033/Q113/Q085/Q087/Q057）——**本轮未涉，维持不改**，已随 CHANGES.md 原样归档，未来若需处理可直接从归档文件按 ID 取用，不会遗失论证。

## 四、已知问题 / 交接备注

1. **「政制」分类图标缺失**：`site/assets/icons/` 下暂无 `zhengzhi.svg`（或同名图标），`site/app.js` 的 `CAT_ICON` 映射表也未加 `"政制"` 键；前端已有兜底（`|| "qita"`），E187/E131 当前会显示通用「其他」图标，不会报错。**登记为 r24 Vision 配套待办**：需新增图标文件＋在 `CAT_ICON` 补一行 `"政制": "zhengzhi"`（或领队/Vision 定的实际文件名）。本轮按任务书要求只登记，未实现。
2. **E046 收窄后与既有 passage 措辞的轻微不严丝合缝**：E046 下 Q172/Q214/Q173 三条既有 passage 的 `modern_note` 中仍以"管仲相齐条"称呼 E046（如 Q173"挂靠管仲相齐条"）。E046 现仍保留"使相可也，桓公从之"的任命结局（Zuo 原文），称"管仲相齐"广义上仍不算错，但严格讲任命过程的细节已分散到 E186/E187。本轮未改动这三条 passage 的措辞（不在任务书范围，且改动需重新核对是否引入新的层标缺口），如实记录，供后续批次参考。
3. **`docs/changes/` 归档文件命名**：任务书原文写"归档 CHANGES 至 `docs/changes/fix23.md`"，但 conventions §10.1 约定命名格式为 `rXX_<批名>.md`，且 Sophia 交付文档（`docs/delivery_sophia_r23.md`）自身已多处交叉引用 `docs/changes/r23_fix23.md`（非 `fix23.md`）。为保持与既有归档文件（`r21_songxiang.md`、`r22_sanxian.md`）及 Sophia 已写死的引用路径一致，本轮按**约定命名**执行，落盘为 `docs/changes/r23_fix23.md`，未按任务书字面的 `fix23.md`。如实记录此处偏离，供领队核对；如认为应按任务书字面命名，可另行指示改名（属机械重命名，不涉及数据本身）。
4. **`docs/delivery_sophia_r23.md` 随本次一并提交**：该文件此前未入 git（Sophia 备料按惯例只本地产出、由 Skipper 合入时一并提交），本轮连同数据改动一起提交，不单独成一条提交。

## 五、提交与部署

提交按主题拆分为三条：

| commit | 内容 |
|---|---|
| `1ff7461` | `data(r23 fix23合入)`：E187 新立、E046 收窄、四条政制引文归位、三诗归位、Q146 迁挂、层标补齐、validate.py 政制类＋评论档开关 |
| `ae5a2ef` | `docs(convention)`：conventions 升 v1.21，政制类＋两条判例＋关闭 E130 |
| `ae57786` | `docs(delivery)`：归档 `r23_fix23.md`＋Sophia/Skipper 交付说明，清空 `data/incoming/fix23/` |

`git push origin main`（`a06d94c..ae57786`）后 GitHub Actions（`pages.yml`，run `30709763820`）**跑绿**（`completed success`）。

**线上带参复验**（`nocache` 时间戳参数绕开 CDN 边缘缓存，首次请求仍命中旧值、约 10 余秒后刷新为新值，同 r22 系列做法）：

```
meta.json: generated_at=2026-08-01T17:05:22+00:00, events=171, passages=233, event_people=453
（与本地 csv_to_json.py 重生成结果逐字段一致）

E187: 管仲为政：叁国伍鄙，作内政而寄军令 | category=政制 | reliability=medium
E046: 堂阜脱囚 | source_ids=Z024;S001;S008;T003（G002 已移出）
E131 category: 政制

E187 挂载 passages: Q067, Q068, Q170, Q171, Q234（四条政制引文＋在场明文原文，同处一卡）
E187 event_people: P_GUANZHONG=亲至, P_QIHUAN=亲至
```

四项验收点（管仲时间线新增「为政」条、四条政制引文同处一卡、E046 收窄为单一「堂阜脱囚」卡、E131/E187 归类「政制」）线上数据全部核验通过，与本地 `data/csv/` 结果一致，闭环。
