# delivery_skipper_r22.md —— 三贤（鲍叔牙／曹刿／介之推）升格合入

任务书：【任务 For Skipper】round22 备料合入——三线升格修正（含 E154 presence 降级、Q096 异体字订正）＋ E185/E186 新增事件；领队裁定 2a（介之推 state 单"晋"）、2b（E186 维持单立，E185/E095 一体拆分照收）、2c（鲍叔牙 state 改回单"齐"）落地；conventions 升号（§6.6/§7 补判例、§11 穀梁 L 前缀回写已启用）；v1.18 §10.1 归档纪律首次实践。

## 一、合入计数与合入后水位

| 表 | 本轮追加/替换 | 合入后水位 |
|---|---|---|
| sources | +4（Y002/L001/T004/T005） | 119 |
| people | +1（P_JIETUIMU）；fixes 整行替换 3（P_BAOSHUYA/P_CAOGUI/P_JIEZHITUI，`is_protagonist` 0→1） | 111（**主角 26**） |
| events | +2（E185/E186）；fixes 整行替换 4（E046/E052/E073/E095） | 170 |
| event_people | +8；fixes 按 `event_id+person_id` 整行替换 2（E154+P_BAOSHUYA、E052+P_CAOGUI） | 451 |
| passages | +16（Q212–Q227）；fixes 整行替换 3（Q042/Q110 落点归位至 E186、Q096 校订） | 225 |
| relations | +3（R242–R244） | 227 |
| places | 无变动 | 78 |

年份范围不变：-773 ~ -584。合入顺序按外键依赖（sources → people → events → event_people/passages/relations），`fixes_passages.csv`（Q042/Q110 迁 E186）在 E186 入表之后执行，与 CHANGES.md 要求一致。

**合入方法**：一次性 Python 脚本（`csv.reader`/`csv.writer` 精确读写，避免手工文本编辑对含逗号/引号字段的破坏），先在临时目录跑通合并模拟并过 `validate.py`，确认无误后对 `data/csv/` 执行同一脚本；脚本核验通过后未留在仓库。

## 二、三条裁定落地情况

### 2a. 介之推 state 取单"晋"

`data/csv/people.csv` 现值 `P_JIEZHITUI.state=晋`（Sophia 备料 `fixes_people.csv` 本已按此裁定口径提交，非本轮改写），未按晋文公流亡诸国全链填写。grep 复核：

```
P_JIEZHITUI,晋
```

### 2b. E186 维持单立；E185/E095 一体拆分照收

**对照结论**：E186（桓公使鲍叔为宰、鲍叔辞相让贤，《国语·齐语》，reliability medium，落点 L_LINZI）核对任务书判据"经传有系年且行动有落点者可立"——

- **系年**：《国语》原文不自带系年，但紧邻《左传》庄公九年"夏，桓公自莒先入即位"一句可推定，CHANGES.md 已注明推算依据、reliability 相应标 medium（不虚标 high），符合判据；
- **落点**：事件落于临淄，`event_people` 中桓公、鲍叔牙均标"亲至"（面对面问对，在场明文俱全，非空判语录）。

两条件同时成立，**判定合格，维持单立**，未撤回、Q212/Q213 未改挂 E046。

E185（晋侯求之不获，以绵上为之田）与 E095 收窄（去除封田句、扩写母子问对）系一体拆分（先例：E041 收窄+E155 新立），已同进同退全部落地；Q096 同步两处校订（末句迁 E185 之 Q225、"汝"订正为"女"）。校验：

```
grep 与 event_people 核对——
P_JIEZHITUI: E093(亲至) / E095(亲至) / E185(相关)   三线成线 ✔
```

### 2c. 鲍叔牙 state 由"齐/莒/齐"改回单"齐"

Sophia 备料的 `fixes_people.csv` 原值为 `齐/莒/齐`（往返全链），按裁定"往返不入流向"覆盖为单一"齐"；`P_QIHUAN`、`P_GUANZHONG` 两行现值均未受影响（本就是"齐"，未被 Sophia 备料触碰，本轮也未改动）。grep 复核：

```
P_BAOSHUYA,齐
P_QIHUAN,齐
P_GUANZHONG,齐
```

## 三、conventions 升号（v1.18 → v1.19）

版本号头已更新，三处新判例落地：

1. **§6.6 判例一·全链仅限各站有其人明文**：介之推不按晋文公流亡全程代填 state，理由是从亡起讫经传未书其人经停何国，用主君行程代填从者行程与"presence 从严禁止以身份推定在场"同类，仅取"晋"单国。
2. **§6.6 判例二·流向只记政治身份迁转，往返避难型出奔复归不入**：鲍叔奔莒是为避国乱临时出亡、事定即随小白反齐复位，齐国身份自始未变，故不写作"齐/莒/齐"，`state` 只记身份迁转型人物线（如夏姬郑→陈→楚→晋），往返避难型仍取单一本国。
3. **§7 判例·有系年（可推定）且有行动落点的对话/荐举类记言材料可单独立事件**：以 E186 为例，明确本条原"无系年评价/轶事材料挂靠通例"不适用于"系年可由紧邻骨架推定＋有独立行动落点（含亲至人物）"的记言材料，两条件缺一不可。
4. **§11 已关闭事项回写**：穀梁 `L` 前缀由"规则已立、暂未启用"改为"已启用（L001，柯之盟《穀梁传》"曹刿之盟"一句，三传内部支持刿沫同一人说的直接证据）"。

## 四、归档首考结果（v1.18 §10.1 新规首次实践）

严格按新规定顺序执行：合入 `data/csv/` → `csv_to_json.py` 重新生成 → `validate.py` 通过 → **归档 CHANGES.md 至 `docs/changes/r22_sanxian.md`** → 清空 `data/incoming/round22/` → 一并提交。

- 归档文件 `docs/changes/r22_sanxian.md` 与源文件 `diff` 结果为空（**逐字节原样**，未重排、未摘要、未改写）。
- 归档动作在清空 `data/incoming/round22/` **之前**完成，未重蹈 r21 先清空后追悔的覆辙。
- 归档文件已随本轮提交 `git add`，非事后补交。

**首考结论：流程走对，无缺口。**

## 五、r23 修缮小包待办（本轮未做，按任务书第4项登记）

以下 D–G 既有欠账本轮明确不处理，登记留待 r23：

1. **11 处既有 passage 来源未列入事件 `source_ids`**：Q133(E117/Y001)、Q144(E128/T002)、Q153(E138/P007)、Q155(E141/P008)、Q156(E142/P009)、Q158(E143/P010)、Q174(E068/T003)、Q175/Q176(E071/T003)、Q180(E176/P011)、Q189(E128/Z076)，全部既有行、不涉本轮三线，是否统一"事件 source_ids 须涵盖其 passages"待领队定口径。
2. **3 条 importance=1 但无原文摘录的既有事件**：E002、E007、E012（早期郑/鲁线，非本轮三线）。
3. **E046 引文错位**：Q067/Q068/Q170/Q171（管仲政制原文）挂靠 E046（堂阜脱囚），但内容实为管仲相齐后在临淄推行的制度，地点/时序不贴，属管仲线问题，建议后续管仲线细化时另立"管仲相齐、作内政寄军令"事件承接。
4. **焚山/E130 展示位问题**：round22 裁定焚山（Q227）不单立事件，与既有 E130「绝缨之宴」去留（conventions §11 待决）同属"著名但仅见说部的情节是否需要更强展示位"一类问题，建议合并裁定，不单开例外。

## 六、validate 与 JSON 重生成结果

- `python tools/validate.py` → **OK：全部校验通过**（合入前模拟一次、合入后实跑一次，两次均 exit 0）。
- `python tools/csv_to_json.py` 重新生成，`site/data/meta.json`：
  ```
  events=170  people=111  event_people=451  passages=225  sources=119  places=78  relations=227
  年份范围 -773..-584
  ```
- 主角计数：`is_protagonist=1` 计 **26**。

## 七、提交与 Actions 状态

两次提交（数据/生成物一次，conventions/归档一次，分主题）：

- `cb27e6a` `data(r22): 合入三贤（鲍叔牙/曹刿/介之推）升格线（E185-E186，主角计26）`
- `bfa55d6` `docs(convention): r22 收尾——conventions 升 v1.19，归档 CHANGES 至 docs/changes/`

`git push origin main`：`51cb815..bfa55d6 main -> main`，成功。

**GitHub Actions**：`Deploy site to GitHub Pages` 触发后 `completed / success`（run `30675571167`）。

## 八、线上带参复验（四项验收）

带 `nocache` 参数直接请求生产 JSON（首次请求命中 CDN 缓存仍显示部署前旧值，约 15 秒后刷新即为新值，非部署失败）：

| 验收项 | 结果 |
|---|---|
| `meta.json` 计数 | events=170、people=111、event_people=451、passages=225、sources=119、places=78、relations=227，年份 -773~-584，与本地生成完全一致 |
| 主角计 26 | `people.json` 中 `is_protagonist=1` 计 **26** |
| 介之推 state=晋 | `P_JIEZHITUI.state = 晋` |
| 鲍叔牙 state=齐 | `P_BAOSHUYA.state = 齐`（`P_QIHUAN`/`P_GUANZHONG` 现值同为「齐」，未受本轮影响） |

四项验收全部通过，线上生产环境核验闭环。
