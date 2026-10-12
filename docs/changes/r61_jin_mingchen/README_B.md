# r61-B · 晋名臣四大事备料 —— 四线总览

> 来源标记：Sophia（史料研究员），2026-10-11 EDT，会话 `session_01QhJ4hbubq1BVsxd8kjBSRA`；目的：`team/round61_prompts.md`「Task for Sophia · r61-B」四线收束（主会话拆为四件，拆件非任务书原文）。
> 不自合入、不提交、不推送；`data/csv/` 未动。各线详情以其 `CHANGES.md` 为准。

## 一、四线之子目录与 ID 区间

| 线 | 子目录 | 事 | events | passages | sources（新） | relations | 新人 |
|---|---|---|---|---|---|---|---:|
| B1 | `b1_zhaodun/` | 赵盾弑晋灵公、董狐直笔（前607，宣公二年） | E319–E324 | Q549–Q566 | Z154、S016 | R327–R334 | 7 |
| B2 | `b2_an/` | 鞌之战（前589，成公二年） | E325–E333 | Q567–Q589 | Y003 | R335–R348 | 14 |
| B3 | `b3_xiagong/` | 下宫之难（前583，成公八年；前因前586） | E334–E338 | Q590–Q606 | Z155–Z156、S017、G016–G017 | R349–R361 | 4 |
| B4 | `b4_luanshu/` | 栾书、中行偃使程滑弑晋厉公（前574–前573，成公十七、十八年） | E339–E347 | Q607–Q637 | Z157、L002 | R362–R382 | 11 |

四线 ID 机读清单各在其 `ids_used.txt`；四清单合计 220 条，去重亦 220（无撞号）。

## 二、合入次序（依赖）

**B1 → B2 → B3 → B4**，不可乱序。其由：后线之 `fixes_*.csv` 以前线新立或替换之行为底再纯追加（如 `S004` 四线递加；`P_HANJUE` B2→B3→B4；`P_JINJINGGONG` B2 立、B3→B4 加；`G016` B3 立、B4 加；`S016` B1 立、B3 加）。各线之 sim 须于四线俱未合入前跑（自叠前线）；任一线合入后再跑前线 sim 必红，属量具之设。叠满四线后预期 verify_marks 494 → 572。

## 三、共用之行及其首立线

| 行 | 首立 | 其后追加之线 |
|---|---|---|
| `P_JINJINGGONG`（晋景公） | B2 新立 | B3、B4 |
| `P_SHIXIE`（士燮） | B2 新立 | B4 |
| `P_HANJUE`（韩厥） | 主表 | B2、B3、B4 |
| `P_LUANSHU`（栾书） | 主表 | B2、B4 |
| `P_SHIHUI`（士会） | 主表 | B1、B2 |
| `S004`（《史记·晋世家》） | 主表 | B1、B2、B3、B4 |
| `G014`（《国语·晋语五》） | 主表 | B1、B2 |
| `S016`（《史记·赵世家》） | B1 新立 | B3 |
| `G016`（《国语·晋语六》） | B3 新立 | B4 |

## 四、四线合计（命令数出，非各线报告相加）

| 项 | B1 | B2 | B3 | B4 | 合计 |
|---|---:|---:|---:|---:|---:|
| 事目（events_new） | 6 | 9 | 5 | 9 | **29** |
| 引文（passages_new） | 18 | 23 | 17 | 31 | **89** |
| 来源·新立（sources_new） | 2 | 1 | 5 | 2 | **10** |
| 挂链（event_people_new） | 20 | 41 | 21 | 45 | **127** |
| 关系（relations_new） | 8 | 14 | 13 | 21 | **56** |
| 新人（people_new） | 7 | 14 | 4 | 11 | **36** |
| 来源·替换行（fixes_sources） | 2 | 4 | 3 | 3 | 12 行（涉 8 个 id） |
| 人物·替换行（fixes_people） | 2 | 4 | 5 | 7 | 18 行（涉 13 个 id） |
| ids_used.txt 条数 | 41 | 61 | 44 | 74 | **220** |
| 挂链·亲至（r61-I 补后） | 13 | 29 | 5 | 19 | **66** |
| 挂链·相关（r61-I 补后） | 6 | 12 | 16 | 26 | **60** |
| 挂链·不在 | 1 | 0 | 0 | 0 | **1** |

所用命令（于本目录跑）：

```
python -c "import csv;L=['b1_zhaodun','b2_an','b3_xiagong','b4_luanshu'];T=['events_new','passages_new','sources_new','event_people_new','relations_new','people_new','fixes_sources','fixes_people'];[print(d,[len(list(csv.DictReader(open(f'{d}/{t}.csv',encoding='utf-8')))) for t in T],len([l for l in open(f'{d}/ids_used.txt',encoding='utf-8') if l.strip() and not l.startswith('#')])) for d in L]"
```

（合计列由上式各列相加；ids_used 去重以 `len(set(...))` 复核得 220。）

presence 三行之命令（r61-D，2026-10-11 EDT，于本目录跑）：

```
python -c "import csv,collections;L=['b1_zhaodun','b2_an','b3_xiagong','b4_luanshu'];[print(d,dict(collections.Counter(r['presence'] for r in csv.DictReader(open(f'{d}/event_people_new.csv',encoding='utf-8'))))) for d in L];print('合计',dict(collections.Counter(r['presence'] for d in L for r in csv.DictReader(open(f'{d}/event_people_new.csv',encoding='utf-8')))))"
```

〔r61-D 复判前为 亲至 63／相关 63／不在 1（B1 12／7／1，B2 26／15，B3 4／17，B4 21／24）。复判依 `team/round61_prompts.md` §三 裁二百一十六；改值 18 行（B1 3、B2 7、B3 1、B4 7），理据句改而值不变 7 行（B2 1、B3 1、B4 5）；逐行见各线 `CHANGES.md`「依裁二百一十六复判」节。与 Co站长之量（17 行；亲至 63→66）差 1 行、亲至少 1：B2 `E325` 季文子（帅师会之，无地之文）改相关，在其量外，列 B2 呈裁 r61D-1。叠满四线之副本：`event_people` 全表 亲至 551／相关 307／不在 4（主表 486／246／3 ＋ 本四线 65／61／1）。〕

〔**r61-I 补（2026-10-11 EDT，Sophia，会话 `session_01QhJ4hbubq1BVsxd8kjBSRA`）**：依 `team/round61_prompts.md` §九 裁二百二十 一②，B4 `E344`／`P_LUANSHU` 相关→亲至（`Q623` 栾书答中行偃之议，同场对面之言）；`P_XUNYAN` 值不变，理据句改。上表 B4 由 18／27 改 19／26，合计由 亲至 65／相关 61／不在 1 改 **66／60／1**＝127；命令同上（presence 三行之命令），本次实跑输出：B1 13／6／1，B2 29／12，B3 5／16，B4 19／26，合计 66／60／1。叠满四线之副本（B4 sim 临时副本实数）：`event_people` 全表 亲至 **552**／相关 **306**／不在 4＝862（主表 486／246／3 ＋ 本四线 66／60／1）。逐行见 `b4_luanshu/CHANGES.md` §十三；B2 `E325` 季文子之裁（准，型20）记于 `b2_an/CHANGES.md` 呈裁 r61D-1 下。〕

## 五、四线俱守之体例（摘）

新人俱二级（`is_protagonist=0`）；后出层（S／Y／L）只挂靠、不单立事目，层标与 quote_type 分层；亲至从严（职、使令、受事不致亲至；〔r61-D 就地加注：今依裁二百一十六——亲至须有其人之文：①地之明文或②同场之身行；职、使令、处置／兵事之词单用、受事而无其人之文、将然之辞俱不立〕）；引文俱由脚本自 `diben/` 切出、sim 逐条比字；核对状态俱为电子本（维基文库一本），未能双本互校，纸本未核。四线之呈裁各在其 `CHANGES.md` 末节；亲至同型判例之汇表在 `b4_luanshu/CHANGES.md` §五。
