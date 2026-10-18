# r62_beiliao —— r62 五国备料（N 秦、O 楚、P 齐、Q 鲁、R 卫）归档

> 归档者：Skipper，2026-10-18；依据 team/round61_prompts.md §一百〇一（裁二百四十六）；照 r61 93e8d8f 之例。
> 备料者：Sophia 子代理（r62-N／O／P／Q／R）。合入见 f77633e（r62-T）。

## 内容
- N／O／P／Q／R 各国备料全件：*_new.csv、fixes_*.csv、ids_used.txt、CHANGES.md、sim 脚本、_method（出表脚本与底本）、_v1（续命前旧件）。
- 顶层：_ledger.csv（共用号簿）、sim_merge_z059.py（合入断言）、_SOURCE.txt。
- 字节级复制自 data/incoming/r62_beiliao/，仅二处例外（见下），数据件未改一字。

## 例外与未入
1. **ctext 九页未入**：O/diben/ctext/ 之九件为 ctext.org 页面存本，其站条款未核，不公开转存；原件移至本机 team/_archive/r62_beiliao_ctext/（gitignored）。重取之址见 O/_method/_SOURCE.txt（本归档于其末附记）。O/_method/hujiao.py 导入时读该目录，归档副本不可直接复跑，须先放回。
2. __pycache__、*.pyc 不入（Q/_method、Q/_v1/_method 下各一）。
3. 二件 _SOURCE.txt（顶层、O/_method）末尾追加「归档附记」，为本归档所加，余皆原文。

## 底本中的维基文库造字（照存不改；数据件无之）
底本含维基文库私用区造字若干，如实照存（改字即非底本）：
| 码 | 所在（底本文件） |
|---|---|
| U+E7B0 | O/diben/zhengyi/春秋左傳正義_卷07.txt（1 处） |
| U+F6E3 | Q/diben/春秋左氏傳__襄公.txt、P/_method/diben/zuo_xianggong.txt（各 4 处，襄公二十七年「無咎」之「無」）；派生件 P/_method/zz_p.json（4）、P/_method/cui_paras.txt（3） |
| U+F6B2、U+F6B3 | Q/diben/春秋左氏傳__昭公.txt、P/_method/diben/zuo_zhaogong.txt（各 U+F6B2 一处、U+F6B3 二处）；派生件 P/_method/zz_p.json |

守卫脚本中检私用区之正则字面量（U+E000–U+F8FF 范围）及所注之字，非数据，亦照存：P/sim_r62_p.py、Q/sim_r62q_lu_beiliao.py、Q/_method/hujiao_q.py、Q/_v1 同名件、R/sim_r62r_wei_beiliao.py（并注 U+F6E3）。
data/csv、site/data 及备料诸 *.csv 已核无私用区字。

## 外库之查
除维基文库之本与本站自生件外，无他：不含辞典、现代注本、受版权之整理本。维基文库之本授权 CC BY-SA，各页 URL 见 _SOURCE.txt 附记。杜注、韦昭注、正义，俱维基文库电子本转引。
