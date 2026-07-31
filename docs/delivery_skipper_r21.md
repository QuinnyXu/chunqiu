# delivery_skipper_r21.md —— 宋襄公升格线 ＋ 夏姬线（第23位主角）合入

任务书：【任务 For Skipper】round21 两件备料合入——宋襄公升格线（`data/incoming/round21/*_new.csv`）与夏姬线（`data/incoming/round21/*_xiaji_new.csv`），领队裁定 2a（E179 presence 从严）、2b（三条分类核对）落地。

## 一、合入内容与计数

两件增量（互不依赖、无 ID 撞号，一并合入）：

| 表 | 宋襄公件 | 夏姬件 | 合计追加 |
|---|---|---|---|
| events | 6（E170–E175） | 9（E176–E184） | 15 |
| people | 3（P_MUYI/P_SONGHUAN/P_QIXIAOGONG） | 10（P_XIAJI 等） | 13 |
| places | 3（L_YANQI/L_CAONAN/L_LUSHANG） | 3（L_WANQIU/L_ZHULIN/L_WUDU） | 6 |
| sources | 2（Z073/S009） | 7（Z074–Z078/S010/P011） | 9 |
| passages | 12（Q200–Q211） | 19（Q178–Q196） | 31 |
| relations | 8（R220–R227） | 14（R228–R241） | 22 |
| event_people | 17 | 39 | 56 |

另有 `fixes_people.csv`（P_SONGXIANG 整行替换，`is_protagonist` 0→1）与 `fixes_people_xiaji.csv`（P_CHUZHUANG/P_ZICHONG/P_ZIFAN 整行替换，追加本轮相关事迹，原文一字未删）已按整行替换方式落入 `data/csv/people.csv`。

**合入后主表水位**（与 Sophia CHANGES.md 预告的两件合并模拟结果逐项核对一致）：events 168、people 110（主角计 **23**）、places 78、sources 115、passages 209、relations 224、event_people 443；年份范围 **-773 ~ -584**。

## 二、领队裁定落地情况

### 2a. E179（楚庄王议纳夏姬）presence 亲至 → 相关

Sophia 原备料把 `P_CHUZHUANG`／`P_WUCHEN`／`P_ZIFAN` 三行标「亲至」，CHANGES.md 已自陈这是本件唯一有张力的判定并提请裁量。按领队裁定（谏语条目统一从严，比照弦高先例——弦高犒师时人虽在场，仍因非战地明文标「相关"），本轮已将三行 presence 改为「相关」，并在 `role_in_event` 中补入「当面谏止」以保留"当场对辩"这一事实（不是使者代行，而是当面而无独立在场明文）：

- `E179,P_CHUZHUANG,议纳夏姬，经巫臣当面谏止而以予连尹襄老之楚君,direct,相关`
- `E179,P_WUCHEN,两谏（当面谏止庄王、当面谏止子反）,direct,相关`
- `E179,P_ZIFAN,欲取之，经巫臣当面谏止而止,direct,相关`

同时改写了 `events.csv` E179 summary 末句，把原来"presence 判据与其张力见 CHANGES.md 三"（该文件合入后即被清空、引用会失效）替换为直接陈述最终判定："楚庄王、巫臣、子反三人问对虽属当面对辩，然其地无独立明文佐证，presence 从严标「相关」（谏语条目统一从严，比照弦高先例，领队裁定）。"

E179 的另外两行（P_XIANGLAO、P_XIAJI）本就是「相关」，未受影响。

### 2b. 分类三条核对——**第三条与 Sophia 实际标题不合，按红线停止自行裁量，未改动，报告如下**

任务书给出的套用规则：

| 任务书规则 | 核对结论 |
|---|---|
| E173 题为「曹南之盟」则会盟 | Sophia 标题「曹南之盟；使邾文公用鄫子于次睢之社，子鱼谏」，主语确为曹南之盟，现分类已是**会盟**，**无需改动**（Sophia 自己也在 CHANGES.md 中把"用鄫子"一面列为待复核，本次按任务书规则确认维持会盟） |
| E179 →婚嫁（所谏之事） | 现分类已是**婚嫁**，**无需改动** |
| E181 题为「携姬奔晋」则出奔 | **不合**：E181 实际标题是「楚王遣夏姬归郑；巫臣聘诸郑」（归郑、聘诸郑，现分类婚嫁），内容与"携姬奔晋"无关；真正标题含"遂奔晋"的是 **E182**（「巫臣奉使聘齐，及郑以夏姬行，遂奔晋」），且 E182 现分类**已经是出奔**。判断这是任务书里的事件号引用错位（应指 E182 而误写 E181），但按红线「与 Sophia 实际标题不合即停，不自行裁量」，**本轮对 E181、E182 的分类均未做任何改动**，请领队确认此条究竟是指 E182（已达标、无需动作）还是确有意重新界定 E181（如有意，请明示新分类与理由）。 |

其余合入内容（含既有事件补挂 E071/E074/E111/E134、E128/E133）均按 CHANGES.md 逐条落实，无出入。

## 三、年份边界

`tools/validate.py` 第30行核实现行 `YEAR_MIN, YEAR_MAX = -800, -480`（v1.11 已放宽），本轮两件事件最晚前584，均在界内。领队裁定2（如仍限旧值则放宽至-560）本轮**无需执行**（Sophia 已在「五·2」核对到同一结论），`conventions.md` 未作变更、未升版本号。

## 四、validate / 生成 / 提交 / 部署核验

- 合入后 `python tools/validate.py` → **OK：全部校验通过**。
- `python tools/csv_to_json.py` 重新生成，`site/data/meta.json`：
  ```
  events=168  people=110  event_people=443  passages=209  sources=115  places=78  relations=224
  年份范围 -773..-584
  ```
  与两件 CHANGES.md 预告的"合并模拟"结果逐项一致。
- `data/incoming/round21/` 已清空删除（两件文件此前未提交入库，无历史记录需保留）。

**git 提交与部署**：commit `b0ae7d1`（`data(r21): 合入宋襄公升格线（E170-E175）＋夏姬线（E176-E184，第23位主角）`），已 `git push origin main`。

**GitHub Actions**：`Deploy site to GitHub Pages` 触发后 `completed / success`（run `30631171722`）。

**线上带参复验**（直接请求生产 JSON，逐项核对）：

| 验收项 | 结果 |
|---|---|
| `meta.json` | events=168、people=110、event_people=443、passages=209、sources=115、places=78、relations=224，年份 -773~-584，与本地生成完全一致 |
| 主角计 23 | `people.json` 中 `is_protagonist=1` 计 **23**，含 `P_SONGXIANG`、`P_XIAJI` |
| 最晚事件前584 | `meta.json.year_range_bce.max = -584` |
| E184 通吴条可查 | `events.json` 中 E184 标题「巫臣使吴，通吴于晋，教吴乘车战陈——吴国登场」，summary 含"通吴"，分类外交 |
| E179 三人为相关 | `event_people.json` 中 E179 五行（P_CHUZHUANG/P_WUCHEN/P_ZIFAN/P_XIANGLAO/P_XIAJI）presence **全为「相关」** |

四项验收全部通过，线上生产环境核验闭环。

## 五、已知问题 / 交接备注

1. **分类裁定第三条（E181/E182）指代不明，请领队确认**：详见「二·2b」表格，本轮未做任何分类改动，等待明示。
2. **两处结构缺口沿用 Sophia 原报告**：郑穆公（夏姬之父）与黑要/狐庸/御叔受配角配额所限未单立人物行，relations 中对应两条关系（夏姬—郑穆公、夏姬—黑要）暂缺，Sophia 已建议后续轮次补人物行后回补，本轮未处理（非本轮任务范围）。
3. **鄫子未立人物行**：同上，Sophia 已建议后续轮次补立，本轮未处理。
4. 一次性合入脚本（读写七张 CSV 表：people 整行替换 + 六表追加）已在核验通过后删除，不遗留在仓库；如需复核合入逻辑，可参考本文件与 commit `b0ae7d1` diff 重建。
