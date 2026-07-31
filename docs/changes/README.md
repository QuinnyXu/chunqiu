# docs/changes/ —— CHANGES.md 归档目录

本目录自 conventions v1.17（2026-07-31）起立规，规则见 `docs/conventions.md` §10.1「CHANGES.md 归档纪律」。

用途：合入者（Skipper）在清空 `data/incoming/round<N>/` **之前**，把该目录下各件 `CHANGES.md` **原样**（不重排、不摘要、不改写）复制归档至本目录，命名 `rXX_<批名>.md`，随合入提交一并入库。目的是保留史料研究员（Sophia）在 CHANGES.md 中留下的考据取舍、presence 判据、待复核项等论证过程——这些内容合入后无法从 `data/csv/` 最终结果反推。

## 已知缺口：r21（补办说明）

r21（宋襄公升格线 + 夏姬线，两件并行备料）合入后，`data/incoming/round21/` 在本规则成文前即被清空，两件 `CHANGES.md` 从未提交入库，git 历史中也无任何记录，故本目录**没有** `r21_songxiang.md` / `r21_xiaji.md` 可原样归档。处理方式：

- **夏姬件**：Sophia 在合入后独立补记论证（含 presence 逐点核订、书法反证），落盘为 `docs/delivery_sophia_r21.md`（若该文件尚未出现，说明补记仍在进行中，不代写、不催更）。
- **宋襄件**：执行合入的会话上下文已不可得，无法原样重构或凭印象补写，缺口如实记录于 `docs/delivery_skipper_r21b.md`（本轮交付说明），不补造内容。

本规则生效后的所有轮次（r22 起）一律先归档、后清空，不再出现同类缺口。
