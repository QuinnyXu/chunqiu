# -*- coding: utf-8 -*-
"""
fix51 合并模拟 —— 五项修正（修-D／修-E／修-F／修-G／修-H，Sophia r51 备料，裁八）

用法（仓库根目录执行）：
    python data/incoming/fix51/sim_fix51.py

做什么：
  1. 把 data/csv/ 全表复制到临时专用子目录 mergesim_fix51/；
  2. 依 `fixes_places.csv`（`L_HUAN` 一行）、`fixes_sources.csv`（`Z018`／`Z125` 两行）
     作**按 id 整行替换**——**纯替换，零新增、零删除，九表行数全不变**；
  3. 于该副本上跑 tools/validate.py；
  4. 跑本件全部机器断言（行数全等、逐栏定点比对、两源 notes「纯追加」之逐字反证、
     坐标按 conventions §4 公式实算回校、`coord_certainty` 一字未动之反证、卫生）。

体例照 `docs/changes/r50_diwang_sim.py`。临时目录可用环境变量 CHUNQIU_SIM_TMP 覆写。
本脚本不属数据，不入 data/csv/。
"""
import csv, os, math, shutil, subprocess, sys, tempfile

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
csv.field_size_limit(10 ** 7)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
CSV = os.path.join(ROOT, "data", "csv")
TMP = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_fix51")

TABLES = ["events", "passages", "sources", "people", "event_people",
          "relations", "places", "archaeology", "background"]
FIX = {"places": "fixes_places.csv", "sources": "fixes_sources.csv"}

# 合入前基线（2026-09-20 实读 HEAD bf4242c）——本件纯替换，合入后九表全等
BEFORE = {"events": 265, "passages": 506, "sources": 195, "people": 166,
          "event_people": 673, "relations": 289, "places": 104,
          "archaeology": 8, "background": 11}

PASS = FAIL = 0
SEC = "(未分节)"
DIST = {}


def sec(name):
    global SEC
    SEC = name
    print("== %s ==" % name)


def ck(cond, msg):
    global PASS, FAIL
    DIST[SEC] = DIST.get(SEC, 0) + 1
    if cond:
        PASS += 1
    else:
        FAIL += 1
        print("  FAIL: " + msg)


def rd(p):
    with open(p, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def hdr(p):
    with open(p, encoding="utf-8", newline="") as f:
        return next(csv.reader(f))


# ---------- 0. 表头与卫生 ----------
sec("0. 表头与文件卫生")
for t, fn in FIX.items():
    h_main, h_new = hdr(os.path.join(CSV, t + ".csv")), hdr(os.path.join(HERE, fn))
    ck(h_main == h_new, f"{t} 表头不同：{h_main} / {h_new}")
    ck(not any(c.lower().startswith("novel") for c in h_new), f"{fn} 含 novel* 列")
    for r in rd(os.path.join(HERE, fn)):
        for k, v in r.items():
            ck(v is not None and "\n" not in v, f"{fn} {r['id']} 栏 {k} 含嵌入换行")
            ck(v is not None and "\t" not in v, f"{fn} {r['id']} 栏 {k} 含制表符")
# 本件纯替换：不得有任何 *_new.csv
for fn in ("places_new.csv", "sources_new.csv", "people_new.csv", "events_new.csv",
           "passages_new.csv", "relations_new.csv", "event_people_new.csv",
           "fixes_events.csv", "fixes_people.csv"):
    ck(not os.path.exists(os.path.join(HERE, fn)), f"本件出现 {fn}（逾本件之界：只动三行，纯替换）")

# ---------- 1. 合并模拟 ----------
sec("1. 合并模拟（按 id 整行替换，零新增零删除）")
if os.path.isdir(TMP):
    shutil.rmtree(TMP)
os.makedirs(TMP)
simcsv = os.path.join(TMP, "data", "csv")
os.makedirs(simcsv)
for t in TABLES:
    shutil.copy(os.path.join(CSV, t + ".csv"), os.path.join(simcsv, t + ".csv"))
for t, fn in FIX.items():
    h = hdr(os.path.join(simcsv, t + ".csv"))
    repl = {r["id"]: r for r in rd(os.path.join(HERE, fn))}
    cur = rd(os.path.join(simcsv, t + ".csv"))
    hit = 0
    for i, r in enumerate(cur):
        if r["id"] in repl:
            cur[i] = repl[r["id"]]
            hit += 1
    ck(hit == len(repl), f"{fn} 替换命中 {hit} != {len(repl)}（有 id 在主表中不存在）")
    with open(os.path.join(simcsv, t + ".csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=h, lineterminator="\n")
        w.writeheader()
        w.writerows(cur)
shutil.copytree(os.path.join(ROOT, "tools"), os.path.join(TMP, "tools"))
print("   临时副本：" + TMP)

# ---------- 2. 逐表行数（全等） ----------
sec("2. 逐表行数（本件纯替换，合入后九表全等）")
merged = {t: rd(os.path.join(simcsv, t + ".csv")) for t in TABLES}
print("   {:<14}{:>8}{:>8}".format("表", "合入前", "合入后"))
for t in TABLES:
    before, after = BEFORE[t], len(merged[t])
    print("   {:<14}{:>8}{:>8}  {}".format(t, before, after, "相符" if after == before else "**不符**"))
    ck(after == before, f"{t} 行数由 {before} 变 {after}（本件不得增删任何行）")
    ck(len(rd(os.path.join(CSV, t + ".csv"))) == before, f"{t} 主表基线 != {before}")

# ---------- 3. 六表一字未动之反证 ----------
sec("3. 六表一字未动之反证")
for t in ("events", "passages", "people", "event_people", "relations", "archaeology", "background"):
    with open(os.path.join(CSV, t + ".csv"), encoding="utf-8") as f:
        a = f.read()
    with open(os.path.join(simcsv, t + ".csv"), encoding="utf-8") as f:
        b = f.read()
    ck(a == b, f"{t}.csv 被改动（本件只动 places 一行、sources 两行）")
# places／sources 之其余各行逐字未动
for t, ids in (("places", {"L_HUAN"}), ("sources", {"Z018", "Z125"})):
    o = {r["id"]: r for r in rd(os.path.join(CSV, t + ".csv"))}
    n = {r["id"]: r for r in merged[t]}
    ck(set(o) == set(n), f"{t} 之 id 集合有变（本件不得增删行）")
    for i in o:
        if i not in ids:
            ck(o[i] == n[i], f"{t}.{i} 被改动（本件只应动 {sorted(ids)}）")

# ---------- 4. L_HUAN 逐栏定点比对（修-D／修-E／修-F） ----------
sec("4. L_HUAN 逐栏定点比对")
o = next(r for r in rd(os.path.join(CSV, "places.csv")) if r["id"] == "L_HUAN")
n = next(r for r in merged["places"] if r["id"] == "L_HUAN")
# 返工件（裁十八）之后所动者六栏：首交之本四栏（修-D／修-E／修-F）＋ 返工所加两栏（coord_certainty／coord_basis）
CHANGED = {"certainty", "lat", "lng", "modern_location", "coord_certainty", "coord_basis"}
for k in o:
    if k in CHANGED:
        ck(o[k] != n[k], f"L_HUAN.{k} 未变（本件应改之栏）")
    else:
        ck(o[k] == n[k], f"L_HUAN.{k} 被改动（本件不应动之栏）：{o[k][:30]} -> {n[k][:30]}")
# 修-D
ck(o["certainty"] == "low" and n["certainty"] == "medium",
   f"修-D 未落实：certainty {o['certainty']} -> {n['certainty']}")
# 修-E：值与公式回校
ck((o["lat"], o["lng"]) == ("35.85", "116.70"), f"修-E 之原值与所报不符：{o['lat']}／{o['lng']}")
ck((n["lat"], n["lng"]) == ("35.88", "116.78"), f"修-E 未落实：{n['lat']}／{n['lng']}")
x = round((float(n["lng"]) - 105.0) / 17.0 * 1200)
y = round(700 - (float(n["lat"]) - 29.5) / 9.0 * 700)
print(f"   新点 {n['lat']}／{n['lng']} 按 conventions §4 公式回校 → x={x}、y={y}（拟文所报 x=832、y=204）")
ck((x, y) == (832, 204), f"修-E 回校 x={x}、y={y} 与拟文所报 (832,204) 不符")
ck(105.0 <= float(n["lng"]) <= 122.0 and 29.5 <= float(n["lat"]) <= 38.5, "新点逾投影覆盖范围")
# 方位实算：新点须在宁阳县治（约 35.76／116.81）之「北而稍西」，且北向位移大于西向
dN = (float(n["lat"]) - 35.76) * 111.0
dE = (float(n["lng"]) - 116.81) * 111.0 * math.cos(math.radians(35.8))
print(f"   新点较宁阳县治：北 {dN:.1f} km、{'西' if dE < 0 else '东'} {abs(dE):.1f} km")
ck(dN > 0 and dE < 0, "新点非在县治之西北向")
ck(dN > abs(dE) * 2, f"新点之北向位移未显著大于西向（北 {dN:.1f}／西 {abs(dE):.1f}），与「北而稍西」不合")
oN = (float(o["lat"]) - 35.76) * 111.0
oE = (float(o["lng"]) - 116.81) * 111.0 * math.cos(math.radians(35.8))
print(f"   旧点较宁阳县治：北 {oN:.1f} km、西 {abs(oE):.1f} km（其形为正西北，即 r50 判『点未校』之由）")
ck(abs(oN - abs(oE)) < 2.0, f"旧点之形与 r50 所报「正西北」不符（北 {oN:.1f}／西 {abs(oE):.1f}）")
# 修-F
ck(o["modern_location"] == "约在今山东宁阳/肥城一带，异说", f"修-F 之原值与所报不符：{o['modern_location']}")
ck("肥城" not in n["modern_location"], f"修-F 未落实：新值仍含「肥城」：{n['modern_location']}")
ck("宁阳" in n["modern_location"], "修-F 新值失「宁阳」")
# ★返工增一（裁十四）：coord_certainty 由 low 升 medium
ck(o["coord_certainty"] == "low", f"coord_certainty 之原值非 low：{o['coord_certainty']}")
ck(n["coord_certainty"] == "medium",
   f"裁十四未落实：coord_certainty {o['coord_certainty']} -> {n['coord_certainty']}（应为 medium）")
ck(n["coord_certainty"] in {"high", "medium", "low"}, "coord_certainty 非三级")
ck(n["certainty"] == n["coord_certainty"] == "medium", "两栏本轮同取 medium（各自判据使然，非连坐），实测不符")
# coord_basis 纯追加（原文逐字照留；返工件之第二段亦系纯追加于首交之本之后）
ck(n["coord_basis"].startswith(o["coord_basis"]), "coord_basis 非纯追加（原文被改）")
ck(len(n["coord_basis"]) > len(o["coord_basis"]), "coord_basis 未追加")
_add = n["coord_basis"][len(o["coord_basis"]):]
for kw in ("修-D", "修-E", "修-F", "x=832、y=204", "coord_certainty", "宁降不虚"):
    ck(kw in _add, f"coord_basis 追加段（首交）缺应有之著录：{kw}")
# ★返工段之四事（裁十四所命，逐事设断言）
ck("返工件" in _add and "裁十四" in _add, "coord_basis 未记返工之裁与其出处")
ck("2026-09-20" in _add, "coord_basis 返工段未记裁定之日")
for kw in ("「点之校」，不是「证之增」", "前提遂消", "得其正用"):
    ck(kw in _add, f"coord_basis 返工段未写明升档之据（「点之校」非「证之增」）：缺 {kw}")
for kw in ("不升 `high`", "县域级概位", "判据链末端未闭"):
    ck(kw in _add, f"coord_basis 返工段未写明不升 high 之由：缺 {kw}")
for kw in ("13.6 公里", "27 里", "三十餘里", "0.02° ≈ 2.2 公里", "今折本身未经考订", "坐标本轮不再微调"):
    ck(kw in _add, f"coord_basis 返工段未如实记一处未闭之端：缺 {kw}")
# 首交之本已核可之四栏，返工件一字不动（其值须仍为首交之值）
ck((n["certainty"], n["lat"], n["lng"]) == ("medium", "35.88", "116.78"),
   "首交之本已核可之三栏被返工件改动")
ck(n["modern_location"] == "约在今山东省宁阳县北而稍西三十余里一带", "modern_location 被返工件改动")

# ---------- 5. 两源 notes「纯追加」之逐字反证（修-G／修-H） ----------
sec("5. sources 两行 notes 纯追加之反证")
oS = {r["id"]: r for r in rd(os.path.join(CSV, "sources.csv"))}
nS = {r["id"]: r for r in merged["sources"]}
for sid, kw in (("Z018", "費伯帥師城郎"), ("Z125", "郈 `L_HOU`")):
    a, b = oS[sid], nS[sid]
    for k in a:
        if k == "notes":
            ck(a[k] != b[k], f"{sid}.notes 未变")
            ck(b[k].startswith(a[k]), f"{sid}.notes 非纯追加（原文被改或被删）")
            ck(len(b[k]) > len(a[k]), f"{sid}.notes 未追加")
        else:
            ck(a[k] == b[k], f"{sid}.{k} 被改动（本件只应动 notes）")
    ck(kw in b["notes"][len(a["notes"]):], f"{sid} 追加段缺关键语：{kw}")
# 追加之文须与 r50 §10 拟文逐字相同（不自行改写，口径一）
Z018_ADD = ("——本篇另载「費伯帥師城郎，不書，非公命也」一节，系 r50 所立 `L_FEIBO`（费伯之费）之据"
            "（杨注·隐公元年页 10）；该点与 `L_FEIJISHI`（季氏之费）同名异地，两存而互见，判据链见二行之 `description`。")
Z125_ADD = ("——此语所记之状态已由 r50 解除：三邑经站长 2026-09-19 纸本核，俱已立点"
            "（郈 `L_HOU`、费 `L_FEIJISHI`、成 `L_CHENGYI`）；原文照留不删（conventions §7 v1.29），"
            "所解者是「材料不在手」之状态，非当日之判为误。")
ck(nS["Z018"]["notes"][len(oS["Z018"]["notes"]):] == Z018_ADD, "Z018 追加之文与 r50 §10 修-G 拟文不逐字相同")
# Z125 之追加段＝修-H 拟文（逐字）＋ 返工件所补之子路一句（裁十七）
_z125add = nS["Z125"]["notes"][len(oS["Z125"]["notes"]):]
ck(_z125add.startswith(Z125_ADD), "Z125 追加段之首不是 r50 §10 修-H 拟文之逐字原文")
# ★返工增二（裁十七）：子路句之加注，且原句仍在
_zi = _z125add[len(Z125_ADD):]
ck(_zi != "", "裁十七未落实：Z125 追加段未补子路一句")
# 【harness 之订正·留痕不抹平】本断言初稿把任务书二之二〔二〕所引之「**本批不立行、不挂链**」
# 连同其 markdown 强调一并写死，首跑即 1 FAIL；**实读本栏原字并无星号**（任务书之 `**` 系其行文之强调，
# 非数据之字）。**错的是断言不是数据**，故改断言取原字，并于 CHANGES §9.1 留痕。
_ZILU_ORIG = "子路（仲由）属孔门配角批（批丙）所议立行之人，本批不立行、不挂链"
ck(_ZILU_ORIG in oS["Z125"]["notes"], "基线有变：Z125 原 notes 已无子路一句（返工之前提须重核）")
ck(_ZILU_ORIG in nS["Z125"]["notes"], "Z125 之子路原句被删（§7 v1.29 原句照留）")
ck("**本批不立行、不挂链**" not in oS["Z125"]["notes"],
   "基线有变：Z125 原句已带 markdown 强调（则上条断言之订正须重核）")
ck(_ZILU_ORIG + "」" in _zi, "返工所补之句引用原句时未照本栏原字（不得把任务书之强调标记引入）")
for kw in ("`P_ZILU`", "已立行", "`E282`", "裁十七", "「批次之界所限」之状态，非当日之判为误"):
    ck(kw in _zi, f"Z125 返工所补之句缺应有之著录：{kw}")
ck("`Q471`" in _zi, "Z125 返工所补之句未指其回挂所据之引文 Q471")
# 本件只动 notes 一栏，Z018 一行不受返工牵动（裁十八）
ck(nS["Z018"]["notes"] == oS["Z018"]["notes"] + Z018_ADD, "Z018 被返工件改动（裁十八：一字不动）")
# 两源所指之点确在库中（追加之文所称不得落空）
LID = {r["id"] for r in merged["places"]}
for lid in ("L_FEIBO", "L_FEIJISHI", "L_HOU", "L_CHENGYI"):
    ck(lid in LID, f"追加之文所称之点 {lid} 不在库中")
ck("Z018" in (next(r for r in merged["places"] if r["id"] == "L_FEIBO")["source_ids"].split(";")),
   "L_FEIBO.source_ids 未挂 Z018（修-G 之前提不成立）")

# ---------- 6. validate.py ----------
sec("6. tools/validate.py（于副本上跑）")
p = subprocess.run([sys.executable, os.path.join(TMP, "tools", "validate.py")],
                   cwd=TMP, capture_output=True, text=True, encoding="utf-8", errors="replace")
print((p.stdout or "").rstrip())
if (p.stderr or "").strip():
    print("   stderr: " + p.stderr.strip())
print("   exit code = %d" % p.returncode)
ck(p.returncode == 0, "validate.py 退出码非 0")

print()
print("== 断言分布（实测） ==")
for k, v in DIST.items():
    print("   %-46s %4d" % (k, v))
print()
print("%d PASS  %d FAIL  exit %d" % (PASS, FAIL, 0 if FAIL == 0 else 1))
sys.exit(0 if FAIL == 0 else 1)
