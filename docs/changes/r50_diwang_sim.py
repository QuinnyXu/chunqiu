# -*- coding: utf-8 -*-
"""r50 地望回填件 · 合并模拟＋实读断言（Sophia 备料自查，供 Skipper 合入前复跑）

用法（仓库根目录执行）：
    python data/incoming/round50_diwang/sim_diwang.py

动作：把 data/csv/ 与 tools/ 复制到临时根 → 依本件 places_new.csv（追加 7 行）
与 fixes_places.csv（整行替换 4 行）合并 → 在临时根跑 tools/validate.py → 逐条实读断言。
**不属数据，不入 data/csv/。** 临时副本落专用子目录 mergesim_diwang/，
路径由 tempfile.gettempdir() 推得、可用 CHUNQIU_SIM_TMP 覆写，不写死（照 r43b／r45／r46 之例）。
"""
import csv, os, re, shutil, subprocess, sys, tempfile
from pathlib import Path

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent.parent.parent   # 仓库根
INC = Path(__file__).resolve().parent
TMP = Path(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir()) / "mergesim_diwang"

PASS = FAIL = 0
def ck(cond, msg):
    global PASS, FAIL
    if cond:
        PASS += 1
    else:
        FAIL += 1
        print("FAIL:", msg)

def read(p):
    with open(p, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))

def header(p):
    with open(p, encoding="utf-8", newline="") as f:
        return next(csv.reader(f))

TABLES = ["sources","places","passages","events","people",
          "event_people","relations","archaeology","background"]
BASE_EXPECT = {"sources":195,"places":97,"passages":506,"events":265,"people":166,
               "event_people":673,"relations":289,"archaeology":8,"background":11}
AFTER_EXPECT = dict(BASE_EXPECT); AFTER_EXPECT["places"] = 104

NEW_IDS = ["L_FEIJISHI","L_FEIBO","L_HOU","L_CHENGYI","L_YUN","L_GUIYIN","L_YANGGUAN"]
FIX_IDS = ["L_JIAGU","L_DAYE","L_CHENGFU","L_HUAN"]

# ---------- 0. 基线实读 ----------
base = {t: read(ROOT/"data/csv"/f"{t}.csv") for t in TABLES}
for t in TABLES:
    ck(len(base[t]) == BASE_EXPECT[t], f"基线行数 {t}: 实读 {len(base[t])}，预期 {BASE_EXPECT[t]}")

# ---------- 1. 文件卫生 ----------
ph = header(ROOT/"data/csv/places.csv")
for fn in ("places_new.csv","fixes_places.csv"):
    h = header(INC/fn)
    ck(h == ph, f"{fn} 表头与主表逐字全同")
    ck(not any(c.lower().startswith("novel") for c in h), f"{fn} 无 novel* 列（红线 5）")
    for i, row in enumerate(read(INC/fn), start=2):
        for k, v in row.items():
            ck("\n" not in (v or "") and "\r" not in (v or ""), f"{fn} 第{i}行 {k} 无嵌入换行")

new_rows = read(INC/"places_new.csv")
fix_rows = read(INC/"fixes_places.csv")
ck(len(new_rows) == 7, f"places_new.csv 实为 {len(new_rows)} 行，预期 7")
ck(len(fix_rows) == 4, f"fixes_places.csv 实为 {len(fix_rows)} 行，预期 4")
ck([r["id"] for r in new_rows] == NEW_IDS, "places_new.csv 之 id 与清单逐一相符")
ck([r["id"] for r in fix_rows] == FIX_IDS, "fixes_places.csv 之 id 与清单逐一相符")

# ---------- 2. ID 规范与不撞号 ----------
base_pids = {r["id"] for r in base["places"]}
for pid in NEW_IDS:
    ck(re.fullmatch(r"L_[A-Z]+", pid) is not None, f"{pid} 合 places ID 正则 ^L_[A-Z]+$")
    ck(pid not in base_pids, f"{pid} 不与主表既有 id 撞号")
for pid in FIX_IDS:
    ck(pid in base_pids, f"{pid} 系主表既有行（整行替换，非新增）")
ck(len(set(NEW_IDS)) == 7, "新立七点 id 互不重复")
ck("L_CHENG" in base_pids and "L_CHENG" not in NEW_IDS + FIX_IDS,
   "既有 L_CHENG（郕）一字不动（成/郕 之同异上报待裁）")
ck("L_SHUZHOU" not in NEW_IDS + FIX_IDS, "L_SHUZHOU 一字不动（裁五，Y2 待裁）")

# ---------- 3. 两费分立·互见双向可寻（裁三、口径五） ----------
d = {r["id"]: r for r in new_rows}
ck(d["L_FEIJISHI"]["ancient_name"] != d["L_FEIBO"]["ancient_name"], "两费 ancient_name 可分")
ck("L_FEIBO" in d["L_FEIJISHI"]["description"], "季氏之费 → 费伯之费 互见")
ck("L_FEIJISHI" in d["L_FEIBO"]["description"], "费伯之费 → 季氏之费 互见（双向）")
ck("两书方位相合" in d["L_FEIJISHI"]["coord_basis"], "季氏之费 coord_basis 写「两书方位相合」")
ck("谭图标为季氏之费" not in d["L_FEIJISHI"]["coord_basis"].replace("非谓「谭图标为季氏之费」",""),
   "季氏之费 coord_basis 未作「谭图标为季氏之费」之断言（除其自诫句外）")
ck("为与 `L_FEIJISHI`（季氏之费）相区分而存" in d["L_FEIBO"]["description"],
   "费伯之费 立点之由入 description（口径五）")

# ---------- 4. 坐标：两位小数、投影范围、回校 ----------
def project(lng, lat):
    return round((lng-105.0)/17.0*1200), round(700-(lat-29.5)/9.0*700)
EXPECT_XY = {"L_FEIJISHI":(911,247),"L_FEIBO":(808,274),"L_HOU":(821,209),
             "L_CHENGYI":(836,211),"L_YUN":(779,226),"L_GUIYIN":(882,210),
             "L_YANGGUAN":(856,197),"L_JIAGU":(904,187),"L_DAYE":(787,226),
             "L_CHENGFU":(584,360)}
for r in new_rows + fix_rows:
    if r["id"] == "L_HUAN":
        continue
    lat, lng = r["lat"], r["lng"]
    ck(re.fullmatch(r"-?\d+\.\d{2}", lat) and re.fullmatch(r"-?\d+\.\d{2}", lng),
       f"{r['id']} 坐标取两位小数（实为 {lat}／{lng}）")
    la, ln = float(lat), float(lng)
    ck(29.5 <= la <= 38.5 and 105.0 <= ln <= 122.0, f"{r['id']} 坐标在投影覆盖范围内")
    ck(project(ln, la) == EXPECT_XY[r["id"]],
       f"{r['id']} 回校 x,y={project(ln,la)}，coord_basis 所书为 {EXPECT_XY[r['id']]}")
    ck(f"x={EXPECT_XY[r['id']][0]}、y={EXPECT_XY[r['id']][1]}" in r["coord_basis"],
       f"{r['id']} coord_basis 内所书之回校值与实算相符")
    ck("不据谭图图面目测量点冒充实测" in r["coord_basis"] or "目测量点" in r["coord_basis"],
       f"{r['id']} coord_basis 明书不据图面目测量点（口径二）")

# ---------- 5. 必填栏与枚举 ----------
for r in new_rows:
    ck(r["state"].strip() != "", f"{r['id']} state 栏必填（口径七）")
    ck(r["certainty"] in {"high","medium","low"}, f"{r['id']} certainty 枚举")
    ck(r["coord_certainty"] in {"high","medium","low"}, f"{r['id']} coord_certainty 枚举")
    ck(r["source_ids"].strip() != "", f"{r['id']} source_ids 非空")
base_states = {r["state"] for r in base["places"]}
for r in new_rows:
    ck(r["state"] in base_states, f"{r['id']} state 「{r['state']}」系既有写法，非臆造（口径七）")
jg = {r["id"]: r for r in fix_rows}["L_JIAGU"]
ck(jg["state"] == "", "L_JIAGU state 留空不动（r45 之判，有明文之由）")

# ---------- 6. source_ids 外键 ----------
sids = {r["id"] for r in base["sources"]}
for r in new_rows:
    for s in r["source_ids"].split(";"):
        ck(s in sids, f"{r['id']} source_ids 之 {s} 在 sources 表内")

# ---------- 7. 两栏不连坐（口径一）——样本断言 ----------
ck(d["L_GUIYIN"]["certainty"] == "medium" and d["L_GUIYIN"]["coord_certainty"] == "low",
   "龟阴：certainty medium／coord_certainty low（两栏不连坐之样本）")
ck("两书方位略异" in d["L_GUIYIN"]["coord_basis"] and "新泰" in d["L_GUIYIN"]["coord_basis"],
   "龟阴 coord_basis 如实记两书方位之异（口径二）")
ck("新泰**西南**" in d["L_GUIYIN"]["coord_basis"] and "新泰**西**" in d["L_GUIYIN"]["coord_basis"],
   "龟阴 coord_basis 两说之文俱在，不择一而讳其余")

# ---------- 8. 留痕不抹平（口径四）：原句仍在，且系纯追加 ----------
basep = {r["id"]: r for r in base["places"]}
for r in fix_rows:
    old = basep[r["id"]]["coord_basis"]
    ck(r["coord_basis"].startswith(old), f"{r['id']} coord_basis 系纯追加（原文逐字在前，一字未删）")
    # certainty 于 L_DAYE／L_CHENGFU 二行依裁十升档，故不入本组「一字未动」之锁；其转移另设断言于下
    cols = ["id","ancient_name","state","place_type","description","source_ids"]
    if r["id"] not in ("L_DAYE","L_CHENGFU"):
        cols.append("certainty")
    for col in cols:
        ck(r[col] == basep[r["id"]][col], f"{r['id']} {col} 栏一字未动")

# ---- 8.1 裁十（2026-09-19 领队续裁）：certainty 之升与维持，逐行实读 ----
fixmap0 = {r["id"]: r for r in fix_rows}
ck(basep["L_DAYE"]["certainty"] == "low" and fixmap0["L_DAYE"]["certainty"] == "medium",
   "裁十：L_DAYE.certainty low → medium")
ck(basep["L_CHENGFU"]["certainty"] == "low" and fixmap0["L_CHENGFU"]["certainty"] == "medium",
   "裁十：L_CHENGFU.certainty low → medium")
ck(fixmap0["L_JIAGU"]["certainty"] == "low", "裁十：L_JIAGU.certainty 维持 low")
ck(fixmap0["L_HUAN"]["coord_certainty"] == "low", "裁十：L_HUAN.coord_certainty 维持 low")
for pid in ("L_DAYE","L_CHENGFU"):
    cb = fixmap0[pid]["coord_basis"]
    ck("取 `low` 之前提已消" in cb, f"{pid} 升档之判据（取 low 之前提已消）写入 coord_basis")
    ck("不升 `high`" in cb, f"{pid} 明书不升 high 之由（判据链末端未闭）")
    ck("2026-09-19" in cb and "升档之日" in cb, f"{pid} 记明升档之故与日期（留痕纪律）")
    ck("照留不删" in cb, f"{pid} 原「维持 low·本件不改该栏」一节照留不删")
# 二行之 coord_certainty 不因 certainty 之升而连坐
ck(fixmap0["L_DAYE"]["coord_certainty"] == "low", "L_DAYE：certainty 升而 coord_certainty 仍 low（两栏不连坐）")

# ---- 8.2 裁六（2026-09-19 站长续裁）：郕与成两点分立、互见、只落一侧 ----
cy = d["L_CHENGYI"]["description"]
ck("裁六" in cy, "L_CHENGYI 记裁六之裁")
ck("是否一地，经传无明文，本轮未核" in cy, "L_CHENGYI 著录裁六所令之互见语")
ck("`L_CHENG`" in cy, "L_CHENGYI 指向 L_CHENG（互见之一侧）")
ck("只落于本行一侧" in cy and "此系裁定所限，非遗漏" in cy,
   "L_CHENGYI 如实记互见只落一侧及其由")
ck("与裁二（讙）之判同型而结论相反" in cy and "有无明文" in cy,
   "L_CHENGYI 记裁六与裁二之别在有无明文")
ck("不入本批所拟之「同名异地，两点分立」通例之用例" in cy,
   "L_CHENGYI 明书本例与两费不同型、不入拟文二之用例")
ck("上报待裁" in cy, "L_CHENGYI 交件当日之「上报待裁」原句照留不删")
ck(basep["L_CHENG"]["certainty"] == "low" and basep["L_CHENG"]["lat"] == "35.75",
   "L_CHENG 本行一字不动（实读其原值仍在）")
KEEP = {
 "L_JIAGU": ["本轮无从核", "幅界存疑", "不得读作", "三栏留空是判断"],
 "L_DAYE":  ["本轮无从核", "三栏留空是判断，不是遗漏", "幅界存疑·一并留痕待核"],
 "L_CHENGFU":["本轮无从核", "三栏留空是判断，不是遗漏"],
 "L_HUAN":  ["宁阳西北说，异说多"],
}
for pid, keys in KEEP.items():
    row = {r["id"]: r for r in fix_rows}[pid]
    for k in keys:
        if k in basep[pid]["coord_basis"]:
            ck(k in row["coord_basis"], f"{pid} 原自限句「{k}」照留未删")
    ck("解除" in row["coord_basis"] or "r50" in row["coord_basis"],
       f"{pid} 记其解除之由与日期")
    ck("2026-09-19" in row["coord_basis"], f"{pid} 著录核对日期 2026-09-19")
    # 「一直如此」之自诫只施于三处**自限解除**之行；L_HUAN 系补页码、无自限可解，不在其内
    # （首版断言四行一律要求，误把 L_HUAN 也算作解除之行 —— 错的是断言不是数据，见 CHANGES §9.1）
    if pid in ("L_JIAGU", "L_DAYE", "L_CHENGFU"):
        ck("一直如此" in row["coord_basis"], f"{pid} 明书不得改写成「一直如此」之自诫")

# ---------- 9. 引注统一式与幅名留痕（裁四、口径三） ----------
for r in new_rows + fix_rows:
    cb = r["coord_basis"]
    # 判据取「齐鲁幅（页 26–27）」而非单「齐鲁幅」二字——L_CHENGFU 之注内有一句
    # 「与本轮新用之齐鲁幅不同，勿相混」，其所引之幅实为楚吴越幅；首版断言以二字为钥，
    # 误把该自辨句当作引注而报 FAIL —— 错的是断言不是数据，见 CHANGES §9.1
    if "齐鲁幅（页 26–27）" in cb:
        ck("《中国历史地图集》第一册·春秋·齐鲁幅（页 26–27）" in cb,
           f"{r['id']} 谭图引注取统一式")
        ck("未照《中国历史地图集》第一册目录核" in cb or "未照目录核" in cb,
           f"{r['id']} 附幅名未照目录核之留痕")
        ck("《春秋历史地图集" not in cb or "站长原填作" in cb or "站长纸本所填之称" in cb,
           f"{r['id']} 站长原填之形只作留痕、不作正式引注")
    if "杨伯峻《春秋左传注》" in cb:
        ck("纸本，站长核对" in cb, f"{r['id']} 杨注引注标核对状态（§7 v1.26）")
        ck("页码同次核" in cb, f"{r['id']} 页码末缀取「页码同次核」（§7 v1.29 二式之一）")
ck("楚吴越幅（页 29–30）" in {r["id"]: r for r in fix_rows}["L_CHENGFU"]["coord_basis"],
   "L_CHENGFU 引楚吴越幅（已于 v1.37 照目录核，与齐鲁幅不同）")

# ---------- 10. events 一字不动（口径六） ----------
ev = {r["id"]: r for r in base["events"]}
ck(ev["E281"]["place_id"] == "", "E281.place_id 仍为空（本件不挂，上报待裁）")
ck(ev["E282"]["place_id"] == "L_QUFU", "E282.place_id 仍为 L_QUFU")
ck(ev["E274"]["place_id"] == "L_JIAGU", "E274.place_id 仍为 L_JIAGU")
ck(not (INC/"events_new.csv").exists() and not (INC/"fixes_events.csv").exists(),
   "本件无 events 增量文件")

# ---------- 11. 合并模拟 ----------
if TMP.exists():
    shutil.rmtree(TMP)
(TMP/"data").mkdir(parents=True)
shutil.copytree(ROOT/"data/csv", TMP/"data/csv")
shutil.copytree(ROOT/"tools", TMP/"tools")

merged = list(base["places"])
fixmap = {r["id"]: r for r in fix_rows}
merged = [fixmap.get(r["id"], r) for r in merged]
merged += new_rows
with open(TMP/"data/csv/places.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=ph, lineterminator="\n")
    w.writeheader()
    for r in merged:
        w.writerow(r)

after = {t: read(TMP/"data/csv"/f"{t}.csv") for t in TABLES}
for t in TABLES:
    ck(len(after[t]) == AFTER_EXPECT[t], f"合入后行数 {t}: 实读 {len(after[t])}，预期 {AFTER_EXPECT[t]}")
ck(len({r["id"] for r in after["places"]}) == 104, "合入后 places id 唯一且为 104")

# 孤点数：合入前 10 → 合入后 17（新立 7 点俱为孤点，E281 不挂）
used = {r["place_id"] for r in after["events"] if r["place_id"].strip()}
orphan_before = [r["id"] for r in base["places"] if r["id"] not in used]
orphan_after = [r["id"] for r in after["places"] if r["id"] not in used]
ck(len(orphan_before) == 10, f"合入前孤点实读 {len(orphan_before)}，预期 10")
ck(len(orphan_after) == 17, f"合入后孤点实读 {len(orphan_after)}，预期 17")
# 地图出点数：凡 lat/lng 非空者即出锚点（site/app.js :1605）
mapped_before = sum(1 for r in base["places"] if r["lat"].strip() and r["lng"].strip())
mapped_after = sum(1 for r in after["places"] if r["lat"].strip() and r["lng"].strip())
ck(mapped_after - mapped_before == 10, f"上图之点增 {mapped_after-mapped_before}，预期 +10（新 7＋补 3）")

# ---------- 12. 质量门 ----------
p = subprocess.run([sys.executable, str(TMP/"tools/validate.py")],
                   capture_output=True, text=True, encoding="utf-8", errors="replace")
print("--- validate.py（临时根）---")
print((p.stdout or "").strip())
if p.stderr.strip():
    print(p.stderr.strip())
ck(p.returncode == 0, f"validate.py 退出码 {p.returncode}，预期 0")
ck("OK" in (p.stdout or ""), "validate.py 输出 OK")

print()
print(f"{PASS} PASS, {FAIL} FAIL")
sys.exit(1 if FAIL else 0)
