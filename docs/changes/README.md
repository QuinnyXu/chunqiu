# docs/changes/ —— CHANGES.md 归档目录

本目录自 conventions v1.17（2026-07-31）起立规，规则见 `docs/conventions.md` §10.1「CHANGES.md 归档纪律」。

用途：合入者（Skipper）在清空 `data/incoming/round<N>/` **之前**，把该目录下各件 `CHANGES.md` **原样**（不重排、不摘要、不改写）复制归档至本目录，命名 `rXX_<批名>.md`，随合入提交一并入库。目的是保留史料研究员（Sophia）在 CHANGES.md 中留下的考据取舍、presence 判据、待复核项等论证过程——这些内容合入后无法从 `data/csv/` 最终结果反推。

## r21 归档缺口——已回补

r21（宋襄公升格线 + 夏姬线，两件并行备料）合入后，`data/incoming/round21/` 在本规则成文前即被清空，两件 `CHANGES.md` 从未提交入库，git 历史中也无任何记录，本目录一度**没有** `r21_songxiang.md` / `r21_xiaji.md` 可原样归档（详见 `docs/delivery_skipper_r21b.md` 记录的当时判断）。此缺口后已回补：

- **夏姬件**：Sophia 独立补记论证（含 §0.7 presence 逐点核订、书法反证），落盘为 `docs/delivery_sophia_r21.md`（198 行，两线论证俱全，已入库）。
- **宋襄件**：`data/incoming/round21/CHANGES.md` 原文虽已不存，但**执行 r21 合入的那次 Skipper 会话**自身仍保有该文件的上下文，由该会话原样追回宋襄公升格线部分，落盘为本目录 `r21_songxiang.md`；该会话核对后明确报告「未发现已佚部分」，宋襄件 `CHANGES.md` 全部实质内容已逐字取出，非重构或凭印象补写。

**结论**：r21 两件 CHANGES.md 的论证内容现均已入库（夏姬件在 `docs/delivery_sophia_r21.md`，宋襄件在 `docs/changes/r21_songxiang.md`），此前记录的"缺口待回补"状态已解除，相应结论已同步回写 `docs/conventions.md` §10.1。

本规则生效后的所有轮次（r22 起）一律先归档、后清空，不再出现同类缺口。

**本目录文件已被 `data/csv/` 直接引用，路径与文件名不得再改**：`data/csv/events.csv`（E172.summary）、`data/csv/event_people.csv`（E172/P_SONGXIANG.role_in_event）、`data/csv/passages.csv`（Q204.modern_note）三处均以 `docs/changes/r21_songxiang.md 三` 作为 presence 判据出处指向（r21 落库回补，见提交记录）。这四处指向此前失效过一次（原文写「见 CHANGES.md 三」，`data/incoming/` 清空后引用落空），本目录文件的路径/文件名若再变动或被移动，须同步改这三处引用，否则会重蹈覆辙、需要再走一次溯源（Sophia 提请记录）。

## 备料可否取回——一条可复跑之判别（r59 收轮立，裁一百八十六）

本节记一桩事实与一条查法，**非约**（不入 conventions；归档之辖已在 §10.1）。

### 一、判别（命令）

```
git log --all --oneline -- 'data/incoming/<批名>/*' | wc -l
```

- **＝ 0**：该批备料**从未入 git**，其件永失，本目录之归档件是其唯一痕迹。
- **> 0**：曾入 git，可 `git show <sha>:<路径>` 取回。

注：`<批名>` 是 `data/incoming/` 下之目录名，**不等于**本目录归档件之名（如归档件 `r46_gugan.md` 对应之备料目录为 `round46_gugan`），查时先对名。

〔r59-收轮 勘注·2026-10-06 EDT，据 `team/round59_prompts.md` §二十三 裁一百八十九；v1.41 原字照留〕★★ 上列「＝ 0 ⇒ 永失」一支**不成立**：「＝ 0」对「物不在」与「名写错」给同一答案，对前者无判别力；本节原只验得正向一例（`r53_kongzi_role` ＝ 2）。判别改述如下，**分正反二向**：

1. **＞ 0** → 其件曾入 git，可 `git show <sha>:<路径>` 取回。★ 此向有力。
2. **＝ 0** → 只证「以此名求之不得」，★ **不证其件不在**——其名或本不如此。
3. 欲断其不在者，须先以一个记其名之物定其目录名（归档之 `CHANGES.md`／sim 之头注／交付文档之原文），并书其所据之出处；★ **不得以归档件名反推目录名，亦不得以己意拟之。** 例：归档件 `r46_gugan.md` ↔ 备料目录 `round46_gugan`——二名不同，以 `r46_gugan` 推之为 `round46` 即误。
4. ★ 其据：以「round46」「r51_peijue」求之得 0，而实有之名为 `round46_gugan` 之类——那个 0 出于名之误，不出于物之无。

### 二、其判别力之验（2026-10-06 EDT 实跑）

| 批（`data/incoming/` 目录名） | 输出 |
|---|---|
| `r53_kongzi_role` | **2** |
| `r59_jin_zhizheng` | **0** |
| `r59_f2_tenure_sources` | **0** |
| `round21` | **0** |
| `fix44d` | **0** |
| `round46` | **0** |
| `r51_peijue` | **0** |

即曾入 git 者（r53）得 2，从未入者俱得 0，判别能分二类。

〔r59-收轮 勘注·裁一百八十九〕★ 上句「判别能分二类」勘为过言：表中 `round46`、`r51_peijue` 二名系以归档件名拟之，非实有之目录名，其 0 是「以错名求之不得」之 0，非「物不在」之 0；其余各名是否实名，本节未逐一核（须依下列第 3 项以独立记名之物定之），未核者其 0 不得读为「未入 git」。表原字照留。

### 三、其数（同日实跑）

- `git log --all --diff-filter=A --name-only --format= -- 'data/incoming/*'` 取其第三段去重，**曾入 git 之 `data/incoming/` 目录全集 ＝ 7**：`.gitkeep`、`fix7`、`r53_kongzi_role`、`relations`、`round5`、`round7`、`round9`（含 `.gitkeep`，非批）。
- 本目录已归档之批（`r*.md`，不含本 README）＝ **34**。
- 故「备料可取回」是少数，不是常态；**凡引一轮之例以推他轮者，先跑上之判别。** 二数各自为计，其目录与归档件并非一一对应（如 `r53_kongzi_role` 未见归档件于本目录），故本节不以相减得「余者几批」，逐批之标须逐批跑判别（登记 r60，后人需时自跑）。

〔r59-收轮 勘注·裁一百八十八 ③，v1.41 原字照留〕★★ 上条「故『备料可取回』是少数，不是常态」**一语撤回**：其据即「34 − 6 ＝ 28」之减法，而该减法所减二集不对位（已归档之批／曾入 git 之目录，交为空），不成立；一个结论若只靠一个坏算法支撑，纵其或然为真，亦不得留。又按裁一百八十八 ②：二数（曾入 git 之目录 7，含 `.gitkeep`；已归档之批 34）**各自为计，不相减**，其余批之备料可否取回无从由此得。

### 四、因之一则

**凡本目录之 sim，其 `HERE` 指向 `data/incoming/` 而该批判别为 0 者，俱不可跑**——此非某一脚本之疾，是归档之形所致。裁一百七十六之「同深子目录」归档之形（数据件随 sim 入同深子目录，`HERE` 自正）**自 r59-F5 起行，其前诸批不可追补**（其料已不在）。

〔r59-收轮 勘注·裁一百九十 ②，v1.41 原字照留〕★★ 上段「俱不可跑」四字改作：**其一已验不可跑；其余九件未验**。实核（裁一百九十 §一）：本目录 sim 共 10 件，仅 `r59_jin_zhizheng_sim.py` 一件之 `HERE` 字面作 `os.path.join(ROOT, "data","incoming","r59_jin_zhizheng")`，其余九件俱作 `dirname(__file__)`／`Path(__file__).parent`（`r50_diwang_sim.py` 作 `INC`，同义）；「凡 `HERE` 指向 `data/incoming/` 者俱不可跑」所辖实只一件，不得以单例断一类。其余九件之逐一试跑登记 r60（低位，一件一 exit code、不改其字；值只在知其状，不在使其跑）。

实况（同日 grep）：现仅 `r59_jin_zhizheng_sim.py` 之 `HERE` 字面指向 `data/incoming/`（其头上已补注，见该件）；其余各 sim 之 `HERE` 为本脚本所在目录，其文档头仍载 `python data/incoming/<批>/sim_*.py` 之旧用法，其可否整跑未于本轮逐一验。
