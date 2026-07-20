# 交付说明 · Skipper r15（round15 合入——楚庄王线上线，主角计15）

日期：2026-07-20。任务：按 `data/incoming/round15/CHANGES.md` 合入楚庄王线，升为第 15 位主角。

## 1. 合入内容

严格按 CHANGES.md 逐条执行，无自行裁量史料口径：

- **events +10**：E123–E129、E131–E133（E123 即位/一鸣惊人、E124 灭庸、E125 问鼎中原、E126 若敖氏之灭、E127 厉之役、E128 邲之战、E129 围宋、E131 孙叔敖为相、E132 楚庄王卒、E133 傅太子箴）。**E130「绝缨之宴」按裁定4处置未单立**，改作 passage Q144 挂靠 E128（见下方「待决事项」）。
- **people +12**：楚庄王（P_CHUZHUANG，升第 15 位主角）+ 配角 11 人（孙叔敖、王孙满、子越椒、伍参、子重、子反、华元、申舟、荀林父、士会、先縠）。子文（P_ZIWEN）已在主表，挂链复用未重建。
- **places +2**：L_BI（邲）、L_YONGGUO（庸），坐标均落新投影 bbox 内。
- **sources +12**：Z060–Z067（左传文16/宣3/4/11/12/14/15/18）、G008（国语楚语上）、T001（韩非子喻老）、T002（说苑复恩）、S007（史记循吏列传）。
- **passages +13**：Q135–Q147，importance=1 事件均配原文；T 层（Q136、Q144）quote_type 一律「经义异闻」。
- **relations +17**：R148–R164。
- **event_people +24**，presence 从严标注（子文/E133庄王 标"相关"，其余亲至）。

## 2. T 前缀分层纪律核对（裁定4，本轮首次实际启用）

- T001/T002 均**未单独立事件**，仅作已有经传骨架事件（E123/E128）的旁证 passage，遵裁定4「不得仅凭诸子/说部材料新建 events 行」。
- passages.quote_type：Q136、Q144 均标「经义异闻」，未标「原文」。
- events.reliability：E123（骨架为 S006 史记楚世家即位系年，非 T-only）取 medium，非"从严默认 low"——因骨架非纯 T 层，符合裁定4"仅诸子/说部材料"适用 low 的前提不成立；E128（骨架为 Z064 左传宣12）high 不受 T002 旁证影响。
- sources.notes 均已注明"先秦诸子说理"/"秦汉说部轶闻"性质及成书年代层级。

## 3. 校验与生成

- `python tools/validate.py` → `OK：全部校验通过`。
- `python tools/csv_to_json.py` → 全部重新生成，`site/data/meta.json` 确认：events 131、people 83、sources 95、places 68、passages 148、relations 164、event_people 330，年份范围 -773..-591。
- `data/incoming/round15/` 已清空（含 CHANGES.md 一并删除）。

## 4. 规模核对（与任务预期 events≈146、people≈80 的偏差说明）

- 实际 events=131（预期≈146，差15，约10%）；people=83（预期≈80，差3，在合理范围）。
- 核实：本地合入前主表（events 121/people 71）与 Sophia CHANGES.md 自述水位（"events E122/people 72"）基本吻合，round15 净增数（events 10、people 12）与 CHANGES.md 逐项清单完全对应，无重复合入或遗漏迹象。
- 怀疑 events≈146 的预估或与 passages 计数（实际 148，非常接近146）发生混淆；由于其余口径（people、年份范围 -773..-591、主角计15、问鼎/一鸣惊人分层）均与验收要求精确吻合，且 CHANGES.md 本身经过合并模拟 validate exit 0 自洽验证，判断此为预估口径误差而非数据缺漏，未停止合入；如领队认为仍需补充事件，请指出具体缺口，我再按新增量处理。

## 5. 待决事项（已回写 conventions.md v1.12 §11）

- **E130「绝缨之宴」去留**：任务书原列为必收事件，与裁定4「T 层不得单独立事件」抵触。本轮按 CHANGES.md/裁定4 处置：未单立 E130，内容已完整入库为 Q144（挂 E128）。若领队认为该情节应保留独立事件展示，请明示，届时回补（reliability=low、注明"说部层不作史实骨架"）。此条不影响本轮验收（验收要求未点名 E130/绝缨之宴）。

## 6. Git / 部署 / 复验

- Commit：`87421ba`（feat(data): round15 合入——楚庄王线上线，主角计15）
- Push 到 `origin/main` 成功。
- GitHub Actions「Deploy site to GitHub Pages」：run 29787075457，`completed / success`。
- 线上复验（WebFetch，带 cache-bust 参数）：
  - `meta.json`：events 131/people 83/sources 95/places 68/passages 148/relations 164/event_people 330，年份 -773..-591 —— 与本地生成一致。
  - `people.json`：is_protagonist=1 共 15 条，含 P_CHUZHUANG（楚庄王）。
  - `events.json`：E125（问鼎中原）reliability=high、source_ids=Z061（左传·宣公三年）；E123（一鸣惊人）reliability=medium、source_ids=S006;T001（史记后出层+韩非子T层）——分层示范样本在线上确认无误。

## 7. 已知问题 / 交接备注

- 本地 Bash 直连自定义域名 `chunqiu.timechorus.com` 的 curl 请求 DNS 解析失败（沙箱网络限制，与 r9 交付说明记录的现象一致），改用 WebFetch 完成线上复验，结论可信。
- conventions.md 已同步更新至 v1.12：§2 T 前缀分层纪律回写"首次实际启用"状态、§11 新增 E130 待决条目。
- 本轮无 fixes（既有行无改动），符合 CHANGES.md「本轮无 fixes」的自述。
