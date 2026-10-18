# -*- coding: utf-8 -*-
"""
r62-O（楚之备料：申包胥、子文、邓曼）合并模拟 —— Sophia 备料，team/round61_prompts.md「Task for Sophia · r62-N／O／P／Q／R」O 行。
来源标记：Sophia·r62-O，2026-10-17 EDT；所读之 HEAD 81d3d53。

用法（仓库根目录；★ 须在本件合入之前跑——以 data/csv/ 为「改前」）：
    python data/incoming/r62_beiliao/O/sim_r62o_chu_beiliao.py

做什么：
  0. 表头与文件卫生（与主表同表头、无换行／制表符、无 novel* 列）；
  1. 复制 data/csv/ 与 tools/（去 qa、node_modules、__pycache__）至临时目录（两份：改前、改后）；
     改后者 append 七个 *_new.csv，四个 fixes_*.csv 按 id 整行替换——逐栏只许「纯追加」或本脚本 DECLARED 所列之改值；
  2. 两份副本上各跑 tools/validate.py、tools/csv_to_json.py、tools/build_kaodui_index.py；改后之 validate 须 exit 0，
     kaodui「抽不出」不得增；
  3. 本件断言：号段、ids_used.txt、共用号簿（_ledger.csv）、引文为底本子串、presence 分布、从严三则、行数；
  4. 三数（挂链／涉年／可落图亲至地，照 tools/validate.py protagonist_counts 之读法，施于所涉诸人）改前改后；
  5. ★ 按类反证（裁一百一十四）：逐类注入同型之错于数据副本，须当场红；任一反证未红 → exit 2。
  若主表已含本件之号（即已合入），号段断言必红——属量具之设，非脚本之误。

退出码：0 全过；1 有 FAIL；2 反证未红。临时目录可用环境变量 CHUNQIU_SIM_TMP 覆写。本脚本不属数据。
"""
import csv, os, re, shutil, subprocess, sys, tempfile, importlib.util, copy

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
csv.field_size_limit(10 ** 7)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
CSV = os.path.join(ROOT, "data", "csv")
LEDGER = os.path.join(HERE, "..", "_ledger.csv")
TMPBASE = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_r62o")

TABLES = ["events", "passages", "sources", "people", "event_people", "relations", "places",
          "archaeology", "background", "office_tenures"]
NEW = {"events": "events_new.csv", "passages": "passages_new.csv", "sources": "sources_new.csv", "people": "people_new.csv",
       "event_people": "event_people_new.csv", "relations": "relations_new.csv", "places": "places_new.csv"}
FIX = {"people": "fixes_people.csv", "sources": "fixes_sources.csv", "relations": "fixes_relations.csv", "places": "fixes_places.csv"}
# 改值（非纯追加）之声明：(表, id, 栏)
DECLARED = {("people", "P_ZIWEN", "active_years_bce"), ("people", "P_ZIWEN", "death_year_bce"),
            ("people", "P_SHENBAOXU", "alt_names"), ("people", "P_SHENBAOXU", "active_years_bce")}
RANGES = {"E": (362, 381), "Q": (666, 705), "R": (395, 409), "Z": (166, 172)}
RETIRED = {"E005", "E006", "Z098"}
WHO = "Sophia·r62-O"
PERSONS = ["P_SHENBAOXU", "P_ZIWEN", "P_DENGMAN", "P_CHUWU", "P_QINAIGONG", "P_DOUBOBI", "P_QUXIA",
           "P_GOUJIAN", "P_ZIYU", "P_ZIYUAN"]
EXPECT_PRESENCE = {"亲至": 9, "相关": 8}
# 有落点之目而标亲至者之白名单：(event, person) → 其地之文
PLACE_WHITELIST = {("E369", "P_SHENBAOXU"): "使於越（只国名之文，行在君所，裁二百三十五 四1）",
                   ("E369", "P_GOUJIAN"): "地承上「使於越」＋对面之言",
                   ("E244", "P_QINAIGONG"): "地承上「立依於庭牆」（宫室门庭之名）＋对面之言（赋诗）"}
BINGSHI = re.compile(r"「(滅|帥師伐|伐)」")   # 兵事之词单用之标记（role 中以「」引之者）
PENDING_RELATED = {("E368", "P_ZIWEN")}       # 呈裁待定、暂从严相关之行

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.join(HERE, "_method"))
import hujiao  # noqa: E402

PASS = FAIL = 0
def ck(cond, msg):
    global PASS, FAIL
    if cond: PASS += 1
    else:
        FAIL += 1; print("  FAIL: " + msg)

def rd(p):
    with open(p, encoding="utf-8", newline="") as f: return list(csv.DictReader(f))
def hdr(p):
    with open(p, encoding="utf-8", newline="") as f: return next(csv.reader(f))
def wr(p, h, rows):
    with open(p, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=h, lineterminator="\n"); w.writeheader(); w.writerows(rows)

# ---------- 0 ----------
print("== 0. 表头与文件卫生 ==")
for t, fn in list(NEW.items()) + list(FIX.items()):
    ck(hdr(os.path.join(CSV, t + ".csv")) == hdr(os.path.join(HERE, fn)), f"{fn} 表头与主表不同")
    for r in rd(os.path.join(HERE, fn)):
        for k, v in r.items():
            ck(v is not None and "\n" not in v and "\t" not in v, f"{fn} {k} 含换行／制表符")
            ck(not k.lower().startswith("novel"), f"{fn} 含 novel* 列")

# ---------- 1 ----------
print("== 1. 合并模拟 ==")
main = {t: rd(os.path.join(CSV, t + ".csv")) for t in TABLES}
newrows = {t: rd(os.path.join(HERE, fn)) for t, fn in NEW.items()}
fixrows = {t: rd(os.path.join(HERE, fn)) for t, fn in FIX.items()}

def merge(main, newrows, fixrows, report=True):
    m = {t: [dict(r) for r in main[t]] for t in TABLES}
    for t, rows in fixrows.items():
        repl = {r["id"]: r for r in rows}; hit = 0
        for i, r in enumerate(m[t]):
            if r["id"] in repl:
                new = repl[r["id"]]
                if report:
                    for k in r:
                        if (t, r["id"], k) in DECLARED:
                            print(f"   改值（声明）{t}.{r['id']}.{k}：「{r[k]}」→「{new[k]}」")
                        else:
                            ck(new[k] == r[k] or new[k].startswith(r[k]), f"{t}.{r['id']}.{k} 非纯追加且未声明")
                m[t][i] = dict(new); hit += 1
        if report: ck(hit == len(repl), f"fixes {t} 命中 {hit} != {len(repl)}")
    for t, rows in newrows.items():
        m[t].extend(dict(r) for r in rows)
    return m

merged = merge(main, newrows, fixrows)

def make_copy(name, data):
    d = os.path.join(TMPBASE, name)
    if os.path.isdir(d): shutil.rmtree(d)
    os.makedirs(os.path.join(d, "data", "csv")); os.makedirs(os.path.join(d, "site", "data")); os.makedirs(os.path.join(d, "docs"))
    for t in TABLES: wr(os.path.join(d, "data", "csv", t + ".csv"), hdr(os.path.join(CSV, t + ".csv")), data[t])
    shutil.copytree(os.path.join(ROOT, "tools"), os.path.join(d, "tools"), ignore=shutil.ignore_patterns("qa", "node_modules", "__pycache__"))
    return d

env = dict(os.environ, PYTHONIOENCODING="utf-8")
def run_tools(d):
    v = subprocess.run([sys.executable, os.path.join(d, "tools", "validate.py")], capture_output=True, text=True, encoding="utf-8", env=env)
    c = subprocess.run([sys.executable, os.path.join(d, "tools", "csv_to_json.py")], capture_output=True, text=True, encoding="utf-8", env=env)
    k = subprocess.run([sys.executable, os.path.join(d, "tools", "build_kaodui_index.py")], capture_output=True, text=True, encoding="utf-8", env=env)
    unex = sum(int(x) for x in re.findall(r"抽不出\D{0,6}?(\d+)", k.stdout))
    return v, c, k, unex

dB = make_copy("before", main); dA = make_copy("after", merged)
print("   临时副本：", dB, "｜", dA)

# ---------- 2 ----------
print("== 2. 副本上跑 validate／csv_to_json／kaodui ==")
vB, cB, kB, uB = run_tools(dB)
vA, cA, kA, uA = run_tools(dA)
last = lambda p: ((p.stdout + p.stderr).strip().splitlines() or [""])[-1]
print(f"   改前 validate exit {vB.returncode}：{last(vB)}")
print(f"   改后 validate exit {vA.returncode}：{last(vA)}")
VALIDATE_EXIT = vA.returncode
ck(vA.returncode == 0, "改后 validate 非 0：\n" + vA.stdout[-3000:] + vA.stderr[-3000:])
ck(cA.returncode == 0, "改后 csv_to_json 失败：" + cA.stderr[-800:])
ck(kA.returncode == 0, "改后 build_kaodui_index 失败：" + kA.stderr[-800:])
print(f"   kaodui 抽不出（stdout 所列之和）：改前 {uB}｜改后 {uA}")
ck(uA <= uB, f"kaodui 抽不出增：{uB}→{uA}")
wB = len(re.findall(r"^\s+! ", vB.stderr, re.M)); wA = len(re.findall(r"^\s+! ", vA.stderr, re.M))
print(f"   validate 软检警告：改前 {wB}｜改后 {wA}")
ck(wA <= wB, "软检警告增")

# ---------- 3 ----------
print("== 3. 本件断言 ==")
def check_ids(newrows, ids_used, main):
    v = []
    exist = {t: {r["id"] for r in main[t] if "id" in r} for t in TABLES}
    allnew = set()
    for t, rows in newrows.items():
        if t == "event_people": continue
        for r in rows:
            i = r["id"]; allnew.add((t, i))
            if i in exist[t]: v.append(f"{t} {i} 与主表撞号")
            if i in RETIRED: v.append(f"{i} 为退役号")
            m = re.fullmatch(r"([EQRZ])(\d{3})", i)
            if m:
                lo, hi = RANGES[m.group(1)]
                if not lo <= int(m.group(2)) <= hi: v.append(f"{i} 出号段 {m.group(1)}{lo}–{hi}")
            elif t in ("events", "passages", "relations", "sources"):
                v.append(f"{t} {i} 非本件号段之形")
    if allnew != ids_used: v.append(f"ids_used.txt 与新号不合：多 {sorted(ids_used - allnew)}；少 {sorted(allnew - ids_used)}")
    return v

ids_used = set()
for line in open(os.path.join(HERE, "ids_used.txt"), encoding="utf-8"):
    if line.strip() and not line.startswith("#"):
        a, b = line.rstrip("\n").split("\t"); ids_used.add((a, b))
v = check_ids(newrows, ids_used, main); ck(not v, "号段／ids_used：" + "；".join(v))

# 共用号簿
led = rd(LEDGER)
for t in ("people", "places"):
    for r in newrows[t]:
        mine = [i for i, x in enumerate(led) if x["拟ID"] == r["id"] and x["登记者"] == WHO and x["状态"] != "撤"]
        ck(len(mine) >= 1, f"号簿无己登之 {r['id']}")  # 首行为「登」，交时另追加「终态」行
        if mine:
            earlier = [x for x in led[:mine[0]] if x["拟ID"] == r["id"] and x["状态"] != "撤"]
            ck(not earlier, f"号簿 {r['id']} 有在先之登：{earlier}")
for i, x in enumerate(led):  # 他件已登而本件又立者
    if x["登记者"] != WHO and x["状态"] != "撤":
        ck(x["拟ID"] not in {r["id"] for t in ("people", "places", "sources") for r in newrows[t]}, f"他件已登 {x['拟ID']} 而本件又立")

# 引文
bad, diffs = hujiao.check(newrows["passages"]); ck(not bad, f"引文非底本子串：{bad}")

# presence
from collections import Counter
pc = Counter(r["presence"] for r in newrows["event_people"])
print("   本件挂链 presence：", dict(pc))
ck(dict(pc) == EXPECT_PRESENCE, f"presence 分布 {dict(pc)} != {EXPECT_PRESENCE}")

def strict_rules(eprows, evs):
    v = []
    ev = {e["id"]: e for e in evs}
    for r in eprows:
        e = ev.get(r["event_id"]); key = (r["event_id"], r["person_id"])
        if r["presence"] in ("亲至", "") and e and e["place_id"] and key not in PLACE_WHITELIST:
            v.append(f"{key} 有落点之目标亲至而不在白名单（v1.42：须其地之文）")
        if BINGSHI.search(r["role_in_event"].split("。")[1] if "。" in r["role_in_event"] else "") and r["presence"] == "亲至":
            v.append(f"{key} 兵事之词单用而标亲至")
        if key in PENDING_RELATED and r["presence"] != "相关":
            v.append(f"{key} 呈裁未定而改其值")
        if r["presence"] not in ("亲至", "相关", "不在"):
            v.append(f"{key} presence 值不合")
    return v
v = strict_rules(newrows["event_people"], main["events"] + newrows["events"]); ck(not v, "从严三则：" + "；".join(v))

# role 首句（裁六③：约四十字内可独立成短语）
for r in newrows["event_people"]:
    first = re.split(r"[。；]", r["role_in_event"])[0]
    ck(len(first) <= 40, f"{r['event_id']}/{r['person_id']} role 首句 {len(first)} 字逾四十")

# 行数
for t in TABLES:
    exp = len(main[t]) + len(newrows.get(t, []))
    print(f"   {t:<15}{len(main[t]):>6}{len(merged[t]):>6}")
    ck(len(merged[t]) == exp, f"{t} 行数 {len(merged[t])} != {exp}")
for t in ("archaeology", "background", "office_tenures"):
    ck(merged[t] == main[t], f"{t} 被改动")

# ---------- 4 ----------
print("== 4. 三数（挂链／涉年／可落图亲至地），改前→改后 ==")
def counts(data, pid):
    ev = {e["id"]: e for e in data["events"]}; pl = {x["id"]: x for x in data["places"]}
    rows = [r for r in data["event_people"] if r["person_id"] == pid]
    years, places = set(), set()
    for r in rows:
        e = ev.get(r["event_id"])
        if not e: continue
        years.add(e["year_bce"])
        if r["presence"] in ("亲至", ""):
            q = pl.get(e["place_id"])
            if q and q["lat"].strip() and q["lng"].strip(): places.add(q["id"])
    return len(rows), len(years), len(places)
pname = {p["id"]: p["name"] for p in merged["people"]}
for pid in PERSONS:
    b = counts(main, pid) if pid in {p["id"] for p in main["people"]} else ("—",) * 3
    a = counts(merged, pid)
    print(f"   {pname.get(pid, pid)}（{pid}）：{'/'.join(map(str, b))} → {'/'.join(map(str, a))}")

# ---------- 5 ----------
print("== 5. 按类反证（须红）==")
UNRED = 0
def must_red(name, violations):
    global UNRED
    if violations: print(f"   红 ✓ {name}")
    else: UNRED += 1; print(f"   ★ 未红 {name}")
# 类一：引文改一字
q2 = copy.deepcopy(newrows["passages"]); q2[0]["quote_original"] = q2[0]["quote_original"].replace("鄧曼", "鄧蔓", 1)
must_red("引文改一字（鄧曼→鄧蔓）", hujiao.check(q2)[0])
# 类二：号出号段／撞主表
n2 = copy.deepcopy(newrows); n2["events"][0]["id"] = "E382"
must_red("事目号出 O 之号段（E382）", check_ids(n2, ids_used, main))
n3 = copy.deepcopy(newrows); n3["events"][0]["id"] = "E351"
must_red("事目号撞主表（E351）", check_ids(n3, ids_used, main))
# 类三：有落点之目亲至而无地之文；兵事之词单用标亲至；呈裁之行改值
for key, label in ((("E365", "P_ZIWEN"), "灭弦之子文改亲至"), (("E366", "P_ZIWEN"), "伐随之子文改亲至"),
                   (("E368", "P_ZIWEN"), "治兵于睽之子文改亲至（呈裁未定）"), (("E368", "P_ZIYU"), "治兵于蒍之子玉改亲至")):
    e2 = copy.deepcopy(newrows["event_people"])
    for r in e2:
        if (r["event_id"], r["person_id"]) == key: r["presence"] = "亲至"
    must_red(label, strict_rules(e2, main["events"] + newrows["events"]))
# 类四：validate 于副本须红——同 id 重复之事目
bad_m = copy.deepcopy(merged); bad_m["events"].append(dict(newrows["events"][0]))
dX = make_copy("counter_dupid", bad_m)
vx = subprocess.run([sys.executable, os.path.join(dX, "tools", "validate.py")], capture_output=True, text=True, encoding="utf-8", env=env)
must_red("副本 validate：事目 id 重复", vx.returncode != 0 and "重复" in (vx.stdout + vx.stderr))
# 类五：fixes 非纯追加而未声明
print("   （下列「改值（声明）」四行与一行 FAIL 为本类反证注入之预期输出，不计入结）")
f2 = copy.deepcopy(fixrows); f2["sources"][0]["notes"] = "改写" + f2["sources"][0]["notes"]
before_fail = FAIL; merge(main, newrows, f2, report=True); red = FAIL > before_fail; FAIL = before_fail
must_red("fixes 之 notes 前置改写（非纯追加）", red)

print(f"\n== 结 ==\n   PASS {PASS}｜FAIL {FAIL}｜反证未红 {UNRED}｜改后 validate exit {VALIDATE_EXIT}")
sys.exit(2 if UNRED else (1 if FAIL else 0))
