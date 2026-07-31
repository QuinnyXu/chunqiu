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
