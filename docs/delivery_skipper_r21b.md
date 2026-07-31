# delivery_skipper_r21b.md —— 合入归档流程立规（docs/changes/ + conventions v1.17）

任务书：【微任务 For Skipper】合入流程立规——新建 `docs/changes/` 目录，今后清空 incoming 前将各件 `CHANGES.md` 原样归档至 `docs/changes/rXX_<批名>.md`，conventions 升下一号记录此规（含 r21 教训：两件 CHANGES.md 未入 git 即被清空，论证靠会话追回）。

## 一、起因复述

r21（宋襄公升格线＋夏姬线）合入时（见 `docs/delivery_skipper_r21.md`），`data/incoming/round21/` 在合入核验通过后被直接清空删除，两件 `CHANGES.md` 从未提交入库，git 历史中也无任何记录。其中 Sophia 在夏姬件 `CHANGES.md` §0.7 所写的 presence 逐点核订论证（含书法反证）随之丢失，只能靠续接 Sophia 的会话追回部分内容。本次任务即为此立规补救。

## 二、本轮改动

1. **新建 `docs/changes/` 目录**，含 `docs/changes/README.md`：说明目录用途（归档各轮 `CHANGES.md`，命名 `rXX_<批名>.md`）与 r21 已知缺口的处置方式。
2. **`docs/conventions.md` 升版至 v1.17**：
   - 顶部版本行改写，历史行下移（v1.16 → 历史）。
   - §1 目录结构树增补 `docs/changes/` 一行。
   - §10「协作节奏：备料与合入分离」新增 **§10.1「CHANGES.md 归档纪律」**，条文含：
     - 归档时机——清空 `data/incoming/round<N>/` **之前**必须先归档，顺序固定为「合入 → 生成 → 校验 → 归档 CHANGES.md → 清空 incoming → 一并提交」；
     - 命名规则——`docs/changes/rXX_<批名>.md`，并行多批各自归档、不合并改写为综述；
     - 本次教训原文记录（r21 缺口起因、丢失内容范围、追回方式）。
3. **未改动**：`data/csv/`、`tools/`、`site/data/` 均未触碰，`python tools/validate.py` 复核仍 **OK：全部校验通过**（本轮为纯文档/目录改动，无需重跑 `csv_to_json.py`）。

## 三、r21 归档缺口的处置结论

- **补入 Sophia 落盘件**：任务书告知 Sophia 正在后台把核订论证落盘为 `docs/delivery_sophia_r21.md`（她只写文件、不提交）。本次工作期间**该文件始终未出现**（多次检查 `docs/` 目录确认），按任务书指示"不要等待、不要代写"，本次提交**未纳入**该文件；`docs/changes/README.md` 中已注明"若尚未出现，说明补记仍在进行中，不代写、不催更"，待其后续出现由下一次提交纳入即可，不影响本次立规生效。
- **宋襄件的核订论证——如实报告缺口，未补写**：本次执行任务的会话是全新会话，未曾读取过 r21 两件原始 `CHANGES.md`（那是执行 r21 合入的另一次会话的上下文，与本次会话无继承关系）。因此宋襄件的逐点核订论证**不在本次会话上下文中**，无法凭印象重构或补写。已在 `docs/changes/README.md` 与 `conventions.md` §10.1 中如实记录此缺口：宋襄件的原始论证暂缺档案，仅 `docs/delivery_skipper_r21.md`（合入者事后总结，非 Sophia 原始逐点论证）可作间接参考。**这是本次任务的已知缺口，非"已处置完毕"，如领队需要该论证的完整还原，需另行确认是否还有其他渠道（如 Sophia 一侧是否留有该会话的独立记录）。**

## 四、验证

- `python tools/validate.py` → `OK：全部校验通过`（数据层未改动，纯确认无副作用）。
- `git status` 核对本次改动范围：仅 `docs/conventions.md`（改动）、`docs/changes/README.md`（新增）、本文件（新增）。

## 五、已知问题 / 交接备注

1. **`docs/delivery_sophia_r21.md` 尚未落盘**：本轮未等待、未代写；出现后请下一轮次提交时一并纳入 `docs/changes/` 体系的说明（该文件本身不需要移动位置，仍留在 `docs/` 下，`docs/changes/README.md` 中已建立指向）。
2. **宋襄件核订论证缺口未回补**：如前所述，本次会话无法访问原始内容，缺口如实挂账，不自行裁量补写，等待领队/Xu 指示是否有其他渠道可追回（例如是否还能续接当时执行合入的会话）。
3. 本次为纯规则与文档层改动，未涉及 `data/csv/`、`site/data/`、`tools/`，因此不涉及 GitHub Pages 部署内容变化；仍按惯例 push 后核对 Actions 状态（见提交记录），确保仓库整体绿灯。
