# -*- coding: utf-8 -*-
"""r62-N（秦之备料：蹇叔、怀嬴）合并模拟。
来源标记：Sophia 子代理，2026-10-17，所读 HEAD 81d3d53。本脚本不属数据。

用法（仓库根，★ 须于本件合入之前跑；以 data/csv/ 为改前）：
    python data/incoming/r62_beiliao/N/sim_r62_n.py
做什么：
  1. 复制 data/csv/ 与 tools/ 至临时目录；append 五个 *_new.csv；fixes_*.csv 按 id 整行替换（只许纯追加）；
  2. 副本上实跑 tools/validate.py（须 exit 0）、tools/csv_to_json.py（须 exit 0）；
  3. 本件断言：号段、撞号、退役 ID、外键、表头、引文比字（去标点后为 diben 之子串）、presence 之域、三数改前改后；
  4. 按类反证：注入同型之错，断言须当场红；任一反证不红 → exit 2。
退出码：0 全过；1 有 FAIL；2 反证未红。临时目录可以环境变量 CHUNQIU_SIM_TMP 覆写。
★ 本件与 O／P／Q／R 并行：合入序 N→O→P→Q→R，本 sim 只叠本件；他件先合则本 sim 之「改前」随之变，属量具之设。
"""
import copy, csv, os, re, shutil, subprocess, sys, tempfile

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
CSV = os.path.join(ROOT, "data", "csv")
TMP = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_r62n")
TABLES = ["events", "passages", "sources", "people", "event_people", "relations",
          "places", "archaeology", "background", "office_tenures"]
NEW = {"events": "events_new.csv", "passages": "passages_new.csv", "people": "people_new.csv",
       "event_people": "event_people_new.csv", "relations": "relations_new.csv"}
FIX = {"people": "fixes_people.csv", "sources": "fixes_sources.csv"}
SEG = {"E": (352, 361), "Q": (646, 665), "R": (387, 394), "Z": (161, 165)}
RETIRED = {"E005", "E006", "Z098"}
TARGET = ["P_JIANSHU", "P_HUAIYING"]
EXPECT_AFTER = {"P_JIANSHU": (4, 3, 1), "P_HUAIYING": (3, 3, 1)}
SRC_DIBEN = {"Z046": "zuo_xigong_raw.txt", "Z047": "zuo_xigong_raw.txt", "Z051": "zuo_xigong_raw.txt",
             "Z059": "zuo_wengong_raw.txt", "G007": "guoyu_juan10_raw.txt"}
PASS = FAIL = 0


def ck(cond, msg):
    global PASS, FAIL
    if cond:
        PASS += 1
    else:
        FAIL += 1
        print("  FAIL: " + msg)
    return cond


def rd(p):
    with open(p, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def hdr(p):
    with open(p, encoding="utf-8", newline="") as f:
        return next(csv.reader(f))


def norm(s):
    s = s.replace("**", "").replace("`", "")
    return re.sub(r"[\s，。：；、？！「」『』（）《》〈〉…,.;:!?()\-—·]", "", s)


def diben():
    out = {}
    for fn in set(SRC_DIBEN.values()):
        t = open(os.path.join(HERE, "_method", "diben", fn), encoding="utf-8").read()
        t = re.sub(r"-\{(.*?)\}-", r"\1", t)
        t = re.sub(r"\{\{\*\|[^{}]*\}\}", "", t)
        out[fn] = norm(t)
    return out


DB = diben()


def counts(ep, ev, pl, pid):
    evd = {e["id"]: e for e in ev}
    pld = {p["id"]: p for p in pl}
    rows = [r for r in ep if r["person_id"] == pid]
    yrs, plc = set(), set()
    for r in rows:
        e = evd.get(r["event_id"])
        if not e:
            continue
        yrs.add(e["year_bce"])
        if r["presence"] in ("亲至", ""):
            q = pld.get(e["place_id"])
            if q and q["lat"].strip() and q["lng"].strip():
                plc.add(q["id"])
    return (len(rows), len(yrs), len(plc))


# ---------- 断言集（可施于任一组 new 数据，供反证复用） ----------
def check_all(main, new, merged, quiet=False):
    v = []
    allid = {t: {r.get("id") for r in main[t]} for t in TABLES if t != "event_people"}
    # 号段
    for t in ("events", "passages", "relations"):
        for r in new[t]:
            m = re.fullmatch(r"([EQR])(\d{3})", r["id"])
            if not m or not (SEG[m.group(1)][0] <= int(m.group(2)) <= SEG[m.group(1)][1]):
                v.append(f"{t} {r['id']} 出号段")
            if r["id"] in allid[t] or r["id"] in RETIRED:
                v.append(f"{t} {r['id']} 撞号或退役")
    for r in new["people"]:
        if r["id"] in allid["people"]:
            v.append(f"people {r['id']} 撞号")
        if r["is_protagonist"] != "0":
            v.append(f"people {r['id']} is_protagonist 非 0")
    # 外键
    ev = {r["id"] for r in merged["events"]}
    pp = {r["id"] for r in merged["people"]}
    ss = {r["id"] for r in merged["sources"]}
    for r in new["passages"]:
        if r["event_id"] not in ev or r["source_id"] not in ss:
            v.append(f"passage {r['id']} 外键不存")
    for r in new["event_people"]:
        if r["event_id"] not in ev or r["person_id"] not in pp:
            v.append(f"ep {r['event_id']}/{r['person_id']} 外键不存")
        if r["presence"] not in ("亲至", "相关", "不在"):
            v.append(f"ep {r['event_id']}/{r['person_id']} presence 域外")
    keys = [(r["event_id"], r["person_id"]) for r in merged["event_people"]]
    if len(keys) != len(set(keys)):
        v.append("event_people 有重键")
    for r in new["relations"]:
        if r["person_a"] not in pp or r["person_b"] not in pp:
            v.append(f"relation {r['id']} 外键不存")
    # 新事目落点：本件不以都代填，从阙者 place_id 空
    for r in new["events"]:
        if r["place_id"]:
            v.append(f"event {r['id']} 立落点（本件之目俱从阙）")
    # 引文比字
    for r in new["passages"]:
        fn = SRC_DIBEN.get(r["source_id"])
        if not fn:
            v.append(f"passage {r['id']} 来源 {r['source_id']} 无底本")
            continue
        for seg in r["quote_original"].split("……"):
            if norm(seg) and norm(seg) not in DB[fn]:
                v.append(f"passage {r['id']} 引文段不合底本：{seg[:20]}")
    # 后出层不立 presence（本件新挂链之事目来源须含经传）
    for r in new["event_people"]:
        e = next(x for x in merged["events"] if x["id"] == r["event_id"])
        if r["presence"] == "亲至" and not re.search(r"(^|;)[ZG]\d{3}", e["source_ids"]):
            v.append(f"ep {r['event_id']}/{r['person_id']} 亲至而事目无经传之源")
    # 使令、只被言及之行不立亲至
    for r in new["event_people"]:
        if r["presence"] == "亲至" and re.search(r"只被言及|使令", r["role_in_event"]):
            v.append(f"ep {r['event_id']}/{r['person_id']} 其据为言及／使令而标亲至")
    # role 首句 ≤ 40 字
    for r in new["event_people"]:
        first = re.split(r"[。；！？]", r["role_in_event"])[0]
        if len(first) > 40:
            v.append(f"ep {r['event_id']}/{r['person_id']} role 首句逾四十字")
    # novel 护栏
    for t in new:
        for r in new[t]:
            for k in r:
                if k.lower().startswith("novel"):
                    v.append(f"{t} 含 novel* 列")
    return v


print("== 0. 表头与卫生 ==")
for t, fn in list(NEW.items()) + list(FIX.items()):
    ck(hdr(os.path.join(CSV, t + ".csv")) == hdr(os.path.join(HERE, fn)), f"{fn} 表头与主表不同")
    for r in rd(os.path.join(HERE, fn)):
        for k, val in r.items():
            ck(val is not None and "\n" not in val and "\t" not in val, f"{fn} 栏 {k} 含换行／制表符")

print("== 1. 合并模拟 ==")
if os.path.isdir(TMP):
    shutil.rmtree(TMP)
simcsv = os.path.join(TMP, "data", "csv")
os.makedirs(simcsv)
for t in TABLES:
    shutil.copy(os.path.join(CSV, t + ".csv"), os.path.join(simcsv, t + ".csv"))
main = {t: rd(os.path.join(CSV, t + ".csv")) for t in TABLES}
new = {t: rd(os.path.join(HERE, fn)) for t, fn in NEW.items()}
for t, fn in NEW.items():
    with open(os.path.join(simcsv, t + ".csv"), "a", encoding="utf-8", newline="") as f:
        csv.DictWriter(f, fieldnames=hdr(os.path.join(CSV, t + ".csv")), lineterminator="\n").writerows(new[t])
for t, fn in FIX.items():
    repl = {r["id"]: r for r in rd(os.path.join(HERE, fn))}
    cur = rd(os.path.join(simcsv, t + ".csv"))
    hit = 0
    for i, r in enumerate(cur):
        if r["id"] in repl:
            for k in r:
                ck(repl[r["id"]][k] == r[k] or repl[r["id"]][k].startswith(r[k]), f"{fn} {r['id']}.{k} 非纯追加")
            cur[i] = repl[r["id"]]
            hit += 1
    ck(hit == len(repl), f"{fn} 替换命中 {hit} != {len(repl)}")
    with open(os.path.join(simcsv, t + ".csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=hdr(os.path.join(CSV, t + ".csv")), lineterminator="\n")
        w.writeheader(); w.writerows(cur)
shutil.copytree(os.path.join(ROOT, "tools"), os.path.join(TMP, "tools"), ignore=shutil.ignore_patterns("node_modules", "__pycache__"))
os.makedirs(os.path.join(TMP, "site", "data")); os.makedirs(os.path.join(TMP, "docs"))
merged = {t: rd(os.path.join(simcsv, t + ".csv")) for t in TABLES}
print("   临时副本：" + TMP)

print("== 2. 逐表行数 ==")
for t in TABLES:
    exp = len(main[t]) + len(new.get(t, []))
    print(f"   {t:<15}{len(main[t]):>6}{len(merged[t]):>6}")
    ck(len(merged[t]) == exp, f"{t} 合入后 {len(merged[t])} != {exp}")
for t in ("places", "archaeology", "background", "office_tenures"):
    ck(merged[t] == main[t], f"{t} 被改动（本件不动）")
for t in ("events", "passages", "event_people", "relations"):
    ck(merged[t][:len(main[t])] == main[t], f"既有 {t} 行被改动")

print("== 3. 副本上跑 validate／csv_to_json ==")
env = dict(os.environ, PYTHONIOENCODING="utf-8")
vv = subprocess.run([sys.executable, os.path.join(TMP, "tools", "validate.py")], capture_output=True, text=True, encoding="utf-8", env=env, cwd=TMP)
out = (vv.stdout + vv.stderr).strip().splitlines()
print("   validate exit", vv.returncode, "：", out[-1] if out else "")
ck(vv.returncode == 0, "副本 validate 非 0：\n" + vv.stdout[-3000:] + vv.stderr[-2000:])
cc = subprocess.run([sys.executable, os.path.join(TMP, "tools", "csv_to_json.py")], capture_output=True, text=True, encoding="utf-8", env=env, cwd=TMP)
print("   csv_to_json exit", cc.returncode)
ck(cc.returncode == 0, "副本 csv_to_json 失败：" + cc.stderr[-800:])

print("== 4. 本件断言 ==")
vio = check_all(main, new, merged)
for x in vio:
    print("  FAIL: " + x)
ck(not vio, f"本件断言违例 {len(vio)}")

print("== 5. 三数（挂链／涉年／可落图亲至地），改前 → 改后 ==")
for pid in TARGET:
    b = counts(main["event_people"], main["events"], main["places"], pid)
    a = counts(merged["event_people"], merged["events"], merged["places"], pid)
    print(f"   {pid}: {b} → {a}")
    ck(a == EXPECT_AFTER[pid], f"{pid} 改后三数 {a} != {EXPECT_AFTER[pid]}")
import collections
print("   本件挂链 presence：", dict(collections.Counter(r["presence"] for r in new["event_people"])))
print("   全表 presence 改前：", dict(collections.Counter(r["presence"] for r in main["event_people"])))
print("   全表 presence 改后：", dict(collections.Counter(r["presence"] for r in merged["event_people"])))

print("== 6. 按类反证（注入同型之错，须红） ==")
RED = 0
def counter(name, mutate):
    global RED
    n2 = copy.deepcopy(new)
    m2 = copy.deepcopy(merged)
    mutate(n2, m2)
    got = check_all(main, n2, m2)
    ok = bool(got)
    print(f"   [{'红' if ok else '未红'}] {name}" + (f"：{got[0]}" if ok else ""))
    if not ok:
        RED += 1

def m_seg(n, m): n["events"][0]["id"] = "E362"
counter("事目出号段（借 O 段 E362）", m_seg)
def m_dup(n, m): n["passages"][0]["id"] = "Q645"
counter("引文撞主表尾号 Q645", m_dup)
def m_quote(n, m): n["passages"][1]["quote_original"] = n["passages"][1]["quote_original"].replace("不敢從", "不肯從")
counter("引文改一字（不敢→不肯）", m_quote)
def m_place(n, m): n["events"][0]["place_id"] = "L_YONG"
counter("从阙之目以秦都代填", m_place)
def m_pres(n, m):
    for r in n["event_people"]:
        if r["event_id"] == "E118": r["presence"] = "亲至"
counter("只被言及之行标亲至", m_pres)
def m_prot(n, m): n["people"][0]["is_protagonist"] = "1"
counter("新人擅改 is_protagonist", m_prot)
def m_fk(n, m): n["relations"][0]["person_b"] = "P_NOSUCH"
counter("关系外键不存", m_fk)
def m_s(n, m):
    for e in m["events"]:
        if e["id"] == "E352": e["source_ids"] = "S004"
counter("后出层之目立亲至", m_s)
def m_role(n, m): n["event_people"][0]["role_in_event"] = "甲" * 41 + "。"
counter("role 首句逾四十字", m_role)

print(f"\n合计 PASS {PASS}  FAIL {FAIL}  反证未红 {RED}")
sys.exit(2 if RED else (1 if FAIL else 0))
