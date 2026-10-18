# -*- coding: utf-8 -*-
"""
r62-R（卫之备料：卫献公、孙林父、甯武子、定姜、蒯聩、许穆夫人；另办卫之修正）合并模拟。
来源标记：Sophia·r62-R，2026-10-17 EDT。本脚本不属数据。

用法（仓库根目录；须在本件合入之前跑——以 data/csv/ 为「改前」）：
    python data/incoming/r62_beiliao/R/sim_r62r_wei_beiliao.py            # 甲：本件单叠于 data/csv/（不含依 Q 之一行）
    python data/incoming/r62_beiliao/R/sim_r62r_wei_beiliao.py --chain    # 乙：依合入序 N→O→P→Q→R 先叠诸件，Q 有 E415 则并叠依 Q 之一行

做什么：
  0. 文件卫生：表头同主表、无换行／制表符、无私用区字（U+E000–U+F8FF，裁二百四十一 四7）、无 novel* 列；
  1. 复制 data/csv/ 与 tools/ 至临时目录（改前、改后二份）；改后 append 本件 *_new.csv，fixes_*.csv 按 id／键整行替换；
  2. 断言：号段（E432–E471｜Q806–Q885｜R450–R479｜Z191–Z200）、ids_used.txt、簿（_ledger.csv）登记、引文为底本（diben/zuo_used.json）之子串、
     fixes 只动所许之栏（notes／summary／modern_note 纯追加；所改之值与声明合）、新地点坐标三栏俱空、is_protagonist 未动；
  3. 二副本上各跑 tools/validate.py、tools/csv_to_json.py；改后 validate 须 exit 0；
  4. 印诸人三数（挂链／涉年／可落图亲至地，照 validate.protagonist_counts 之读法）改前改后；presence 全表分布；
  5. ★ 按类反证：逐类注入同型之错，须当场红；任一未红 → exit 2。
退出码：0 全过；1 有 FAIL；2 反证未红。临时目录可用环境变量 CHUNQIU_SIM_TMP 覆写。
"""
import csv, os, re, shutil, subprocess, sys, tempfile, importlib.util, json, collections

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
csv.field_size_limit(10 ** 7)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
CSV = os.path.join(ROOT, "data", "csv")
BEI = os.path.abspath(os.path.join(HERE, ".."))
CHAIN = "--chain" in sys.argv
TMPBASE = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_r62r" + ("_chain" if CHAIN else ""))
NEW = ["events", "passages", "sources", "people", "event_people", "relations", "places"]
FIXT = ["events", "event_people", "passages", "people", "sources", "relations", "places"]
RANGES = {"E": (432, 471), "Q": (806, 885), "R": (450, 479), "Z": (191, 200)}
PUA = re.compile("[-]")
FAILS, PASS = [], [0]

def ck(c, m):
    if c: PASS[0] += 1
    else: FAILS.append(m); print("   FAIL：" + m)
def rd(p):
    with open(p, encoding="utf-8", newline="") as f: return list(csv.DictReader(f))
def hdr(p):
    with open(p, encoding="utf-8", newline="") as f: return next(csv.reader(f))
def wr(p, rows, fn):
    with open(p, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fn, lineterminator="\n"); w.writeheader(); w.writerows(rows)
def key(t, r): return (r["event_id"], r["person_id"]) if t == "event_people" else r["id"]

def overlay(dcsv, d, dep=False):
    """append d/*_new.csv；fixes_*.csv 按键整行替换。返回 (append 数, 替换命中/应中)。"""
    for t in NEW:
        fp = os.path.join(d, f"{t}_new.csv")
        if os.path.exists(fp):
            cur = rd(os.path.join(dcsv, t + ".csv")); cur += rd(fp); wr(os.path.join(dcsv, t + ".csv"), cur, hdr(os.path.join(CSV, t + ".csv")))
    if dep:
        fp = os.path.join(d, "event_people_dep_Q.csv")
        cur = rd(os.path.join(dcsv, "event_people.csv")); cur += rd(fp); wr(os.path.join(dcsv, "event_people.csv"), cur, hdr(os.path.join(CSV, "event_people.csv")))
    for t in FIXT:
        fp = os.path.join(d, f"fixes_{t}.csv")
        if not os.path.exists(fp): continue
        rep = {key(t, r): r for r in rd(fp)}; cur = rd(os.path.join(dcsv, t + ".csv")); hit = 0
        for i, r in enumerate(cur):
            if key(t, r) in rep: cur[i] = rep[key(t, r)]; hit += 1
        ck(hit == len(rep), f"{os.path.basename(d)} fixes_{t} 命中 {hit}/{len(rep)}")
        wr(os.path.join(dcsv, t + ".csv"), cur, hdr(os.path.join(CSV, t + ".csv")))

def build(dst, layers):
    if os.path.isdir(dst): shutil.rmtree(dst)
    shutil.copytree(CSV, os.path.join(dst, "data", "csv"))
    shutil.copytree(os.path.join(ROOT, "tools"), os.path.join(dst, "tools"), ignore=shutil.ignore_patterns("node_modules", "__pycache__", "qa"))
    os.makedirs(os.path.join(dst, "site", "data")); shutil.copytree(os.path.join(ROOT, "docs"), os.path.join(dst, "docs"))
    for d, dep in layers: overlay(os.path.join(dst, "data", "csv"), d, dep)

def run(root, script):
    env = dict(os.environ, PYTHONIOENCODING="utf-8")
    return subprocess.run([sys.executable, "-B", os.path.join(root, "tools", script)], capture_output=True, text=True, encoding="utf-8", env=env, cwd=root)

def load_v(root):
    spec = importlib.util.spec_from_file_location("v_" + str(abs(hash(root))), os.path.join(root, "tools", "validate.py"))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

def tables(root): return {t: rd(os.path.join(root, "data", "csv", t + ".csv")) for t in ("people", "event_people", "events", "places")}

def counts(t, pid):
    ev = {e["id"]: e for e in t["events"]}; pl = {x["id"]: x for x in t["places"]}
    rows = [r for r in t["event_people"] if r["person_id"] == pid]; ys, cs = set(), set()
    for r in rows:
        e = ev.get(r["event_id"])
        if not e: continue
        ys.add(e["year_bce"])
        if r["presence"] in ("亲至", ""):
            q = pl.get(e["place_id"])
            if q and q["lat"].strip() and q["lng"].strip(): cs.add(q["id"])
    return len(rows), len(ys), len(cs)

# ---------- 0. 文件卫生 ----------
print("== 0. 文件卫生 ==")
MINE = {}
for f in sorted(os.listdir(HERE)):
    if not f.endswith(".csv"): continue
    t = re.sub(r"^fixes_|_new$|_dep_Q$", "", f[:-4])
    ck(hdr(os.path.join(HERE, f)) == hdr(os.path.join(CSV, t + ".csv")), f"{f} 表头与主表不同")
    rows = rd(os.path.join(HERE, f)); MINE[f] = rows
    for r in rows:
        for k, v in r.items():
            ck(v is not None and "\n" not in v and "\t" not in v, f"{f} {k} 含换行／制表符")
            ck(not PUA.search(v or ""), f"{f} {key(t, r) if t in ('event_people',) else r.get('id')} {k} 含私用区字")
    ck(not any(h.lower().startswith("novel") for h in hdr(os.path.join(HERE, f))), f"{f} 有 novel* 列")
print(f"   文件 {len(MINE)} 件")

# ---------- 2a. 号段、ids_used、簿 ----------
print("== 2a. 号段与簿 ==")
main_ids = {t: {r["id"] for r in rd(os.path.join(CSV, t + ".csv"))} for t in ("events", "passages", "sources", "relations", "people", "places")}
for f, t, pre in (("events_new.csv", "events", "E"), ("passages_new.csv", "passages", "Q"), ("relations_new.csv", "relations", "R"), ("sources_new.csv", "sources", "Z")):
    for r in MINE[f]:
        n = int(r["id"][1:]); lo, hi = RANGES[pre]
        ck(r["id"].startswith(pre) and lo <= n <= hi, f"{r['id']} 出号段")
        ck(r["id"] not in main_ids[t], f"{r['id']} 与主表撞号")
for f, t in (("people_new.csv", "people"), ("places_new.csv", "places")):
    for r in MINE[f]: ck(r["id"] not in main_ids[t], f"{r['id']} 与主表撞号")
ids = [tuple(l.rstrip("\n").split("\t")) for l in open(os.path.join(HERE, "ids_used.txt"), encoding="utf-8") if l.strip() and not l.startswith("#")]
mine_ids = [(t, r["id"]) for t, f in (("events", "events_new.csv"), ("passages", "passages_new.csv"), ("sources", "sources_new.csv"), ("people", "people_new.csv"), ("places", "places_new.csv"), ("relations", "relations_new.csv")) for r in MINE[f]]
ck(sorted(ids) == sorted(mine_ids) and len(set(ids)) == len(ids), "ids_used.txt 与 *_new 不合")
led = rd(os.path.join(BEI, "_ledger.csv"))
for r in MINE["people_new.csv"] + MINE["places_new.csv"]:
    mine = [x for x in led if x["拟ID"] == r["id"]]
    ck(mine and mine[0]["登记者"] == "Sophia·r62-R", f"{r['id']} 簿中未登或非先登")
for x in led:  # 他件之 P_／L_ 不得与本件同
    if x["登记者"] != "Sophia·r62-R": ck(x["拟ID"] not in {r["id"] for r in MINE["people_new.csv"] + MINE["places_new.csv"]}, f"{x['拟ID']} 他件已登")
ck(any(x["拟ID"].startswith("E415") and "Q" in x["主件"] for x in led), "簿无 Q 之 E415")
def coord_empty(r): return r["lat"] == r["lng"] == r["coord_certainty"] == ""
for r in MINE["places_new.csv"]:
    ck(coord_empty(r), f"{r['id']} 坐标三栏非空（裁二百四十一 五4：立行而坐标留空）")
for r in MINE["people_new.csv"]: ck(r["is_protagonist"] == "0", f"{r['id']} is_protagonist 非 0")
print(f"   ids_used {len(ids)} 条")

# ---------- 2b. 引文比字 ----------
print("== 2b. 引文为底本之子串 ==")
ZU = json.load(open(os.path.join(HERE, "_method", "diben", "zuo_used.json"), encoding="utf-8"))
keys = sorted(int(k) for k in ZU)
TXT = [ZU[str(k)]["text"] for k in keys] + [ZU[str(a)]["text"] + ZU[str(b)]["text"] for a, b in zip(keys, keys[1:]) if b == a + 1]
def quote_ok(q): return any(q in t for t in TXT)
for r in MINE["passages_new.csv"]:
    ck(quote_ok(r["quote_original"]), f"{r['id']} 引文非底本之子串")
print(f"   {len(MINE['passages_new.csv'])} 条俱比")

# ---------- 2c. fixes 只动所许 ----------
print("== 2c. fixes 之栏 ==")
APPEND_ONLY = {"events": {"summary"}, "passages": {"modern_note"}, "people": {"notes"}}
DECL = {("events", "E270"): {"place_id"}, ("events", "E060"): {"place_id"},
        ("event_people", ("E270", "P_QUBOYU")): {"presence", "role_in_event"}, ("event_people", ("E270", "P_JIZHA")): {"role_in_event"},
        ("event_people", ("E060", "P_ZHENGZHAO")): {"role_in_event"}, ("event_people", ("E086", "P_ZHAOCUI")): {"presence", "role_in_event"},
        ("event_people", ("E098", "P_HUYAN")): {"role_in_event"},
        ("people", "P_WEIWEN"): {"alt_names", "short_bio"}, ("people", "P_XUMU"): {"active_years_bce", "short_bio"},
        ("people", "P_WEIZHUANG"): {"alt_names", "active_years_bce", "short_bio"}, ("people", "P_WEIHUAN"): {"active_years_bce"},
        ("people", "P_ZHOUYU"): {"short_bio"}, ("people", "P_WEIXUAN"): {"short_bio"}, ("people", "P_JIZI"): {"alt_names", "short_bio"},
        ("people", "P_SHOUZI"): {"alt_names", "short_bio"}, ("people", "P_ZHAOBO"): {"alt_names", "active_years_bce"},
        ("people", "P_KUAIKUI"): {"active_years_bce", "death_year_bce", "relations"}, ("people", "P_QUBOYU"): {"relations"},
        ("people", "P_ZHUANGJIANG"): set(), ("people", "P_XUANJIANG"): set()}
PRES = {("E270", "P_QUBOYU"): ("亲至", "相关"), ("E086", "P_ZHAOCUI"): ("亲至", "相关")}
for t in ("events", "event_people", "passages", "people"):
    base = {key(t, r): r for r in rd(os.path.join(CSV, t + ".csv"))}
    for r in MINE[f"fixes_{t}.csv"]:
        k = key(t, r); b = base.get(k); ck(b is not None, f"fixes_{t} {k} 主表无")
        if not b: continue
        ch = {c for c in b if b[c] != r[c]}
        allow = DECL.get((t, k), set()) | APPEND_ONLY.get(t, set())
        ck(ch <= allow, f"fixes_{t} {k} 改及非许之栏 {ch - allow}")
        for c in APPEND_ONLY.get(t, set()) & ch: ck(r[c].startswith(b[c]), f"fixes_{t} {k} {c} 非纯追加")
        if t == "people" and "relations" in ch: ck(r["relations"].startswith(b["relations"]), f"{k} relations 非纯追加")
        if t == "people": ck(r["is_protagonist"] == b["is_protagonist"], f"{k} is_protagonist 变")
        if (t, k) in DECL: ck(DECL[(t, k)] <= ch or t == "people", f"fixes_{t} {k} 所声明之改未见")
        if t == "event_people" and k in PRES: ck((b["presence"], r["presence"]) == PRES[k], f"{k} presence 非 {PRES[k]}")
        if t == "events": ck(r["place_id"] == "", f"{k} place_id 未从阙")
ck(len(MINE["fixes_people.csv"]) == len({k for (t, k) in DECL if t == "people"}), "fixes_people 行数与声明不合")

# ---------- 1/3. 副本与 validate ----------
LAY = []
if CHAIN:
    for x in ("N", "O", "P", "Q"):
        d = os.path.join(BEI, x)
        if os.path.isdir(d) and os.path.exists(os.path.join(d, "events_new.csv")): LAY.append((d, False))
        else: print(f"   ★ 链：{x} 无 *_new 之件，跳过")
print("== 1. 合并模拟" + ("（链：" + "→".join(os.path.basename(d) for d, _ in LAY) + "→R）" if CHAIN else "（R 单叠）") + " ==")
BASE = TMPBASE + "_base"; MRG = TMPBASE
build(BASE, LAY)
evb = {r["id"] for r in rd(os.path.join(BASE, "data", "csv", "events.csv"))}
DEP = "E415" in evb
print("   依 Q 之 E415：" + ("在，并叠 event_people_dep_Q.csv" if DEP else "不在，不叠（只于 Q 合入后可叠）"))
build(MRG, LAY + [(HERE, DEP)])
rb, rm = run(BASE, "validate.py"), run(MRG, "validate.py")
print(f"   validate 改前 exit {rb.returncode}；改后 exit {rm.returncode}")
print("   ---- 改后 validate 输出（尾）----\n" + "\n".join("   " + l for l in (rm.stdout + rm.stderr).strip().splitlines()[-8:]))
ck(rm.returncode == 0, "改后 validate 非 0")
cj = run(MRG, "csv_to_json.py"); print(f"   csv_to_json exit {cj.returncode}"); ck(cj.returncode == 0, "csv_to_json 非 0")

# ---------- 4. 三数与 presence ----------
print("== 4. 三数（挂链／涉年／可落图亲至地）改前→改后 ==")
TB, TM = tables(BASE), tables(MRG)
WHO = [("P_WEIXIANGONG", "卫献公"), ("P_SUNLINFU", "孙林父"), ("P_NINGWUZI", "甯武子"), ("P_DINGJIANG", "定姜"), ("P_KUAIKUI", "蒯聩"), ("P_XUMU", "许穆夫人"),
       ("P_QUBOYU", "蘧瑗"), ("P_ZHAOCUI", "赵衰"), ("P_JIZHA", "季札"), ("P_ZHENGZHAO", "郑昭公"), ("P_ZHUANGJIANG", "庄姜"), ("P_XUANJIANG", "宣姜")]
C = {}
for pid, nm in WHO:
    a, b = counts(TB, pid), counts(TM, pid); C[pid] = b
    print(f"   {nm}（{pid}）：{a[0]}／{a[1]}／{a[2]} → {b[0]}／{b[1]}／{b[2]}")
pb = collections.Counter(r["presence"] for r in TB["event_people"]); pm = collections.Counter(r["presence"] for r in TM["event_people"])
print(f"   presence 全表：亲至 {pb['亲至']}／相关 {pb['相关']}／不在 {pb['不在']} → {pm['亲至']}／{pm['相关']}／{pm['不在']}")
pn = collections.Counter(r["presence"] for r in MINE["event_people_new.csv"])
print(f"   本件新挂链 {len(MINE['event_people_new.csv'])}：{dict(pn)}")
EXP = {"P_WEIXIANGONG": (11, 6, 3), "P_NINGWUZI": (5, 4, 1), "P_DINGJIANG": (4, 3, 0), "P_KUAIKUI": (5, 4, 1), "P_XUMU": (3, 2, 0)}
for pid, v in EXP.items(): ck(C[pid] == v, f"{pid} 三数 {C[pid]} != {v}")
ck(C["P_SUNLINFU"] == ((11, 7, 1) if DEP else (10, 6, 0)) or (DEP and C["P_SUNLINFU"][:2] == (11, 7)), f"P_SUNLINFU 三数 {C['P_SUNLINFU']}")

# ---------- 5. 按类反证 ----------
print("== 5. 按类反证（须红）==")
UNRED = []
def must_red(name, ok):
    print(f"   [{'红' if not ok else '未红'}] {name}")
    if ok: UNRED.append(name)
# 类一：引文改一字
q = MINE["passages_new.csv"][0]["quote_original"]; must_red("引文改一字 → 比字", quote_ok(q[:-2] + "曰" + q[-1:]))
# 类二：私用区字
must_red("注入 U+F6E3 → 私用区之断", not PUA.search("無" + ""))
# 类三：新地点误填坐标
must_red("新地点填坐标 → 坐标留空之断", coord_empty(dict(MINE["places_new.csv"][0], lat="35.1")))
# 类四：place_id 指不存之点 → validate 红
d4 = TMPBASE + "_neg4"; shutil.rmtree(d4, ignore_errors=True); shutil.copytree(MRG, d4)
p4 = os.path.join(d4, "data", "csv", "events.csv"); rows = rd(p4)
for r in rows:
    if r["id"] == "E453": r["place_id"] = "L_TIE_NOSUCH"
wr(p4, rows, hdr(p4)); must_red("E453 落点指不存之点 → validate", run(d4, "validate.py").returncode == 0)
# 类五：挂链之人不在 people → validate 红
d5 = TMPBASE + "_neg5"; shutil.rmtree(d5, ignore_errors=True); shutil.copytree(MRG, d5)
p5 = os.path.join(d5, "data", "csv", "people.csv"); rows = [r for r in rd(p5) if r["id"] != "P_DINGJIANG"]
wr(p5, rows, hdr(p5)); must_red("删 P_DINGJIANG 人物行 → validate", run(d5, "validate.py").returncode == 0)
# 类六：同年 sort_key 撞 → validate 红
d6 = TMPBASE + "_neg6"; shutil.rmtree(d6, ignore_errors=True); shutil.copytree(MRG, d6)
p6 = os.path.join(d6, "data", "csv", "events.csv"); rows = rd(p6)
for r in rows:
    if r["id"] == "E445": r["sort_key"] = "20"   # 与 E268 同年同 sort_key
wr(p6, rows, hdr(p6)); must_red("E445 sort_key 与 E268 相撞 → validate", run(d6, "validate.py").returncode == 0)
# 类七：fixes 之纯追加被破 → 本件之断
b = next(r for r in rd(os.path.join(CSV, "events.csv")) if r["id"] == "E270")["summary"]
must_red("summary 删旧文一字 → 纯追加之断", (b[1:] + "X").startswith(b))
for d in (d4, d5, d6): shutil.rmtree(d, ignore_errors=True)

print(f"\n== 结 == PASS {PASS[0]}  FAIL {len(FAILS)}  反证未红 {len(UNRED)}")
print("   副本：" + MRG)
sys.exit(2 if UNRED else (1 if FAILS else 0))
