# -*- coding: utf-8 -*-
"""
r62-Q（鲁之备料：季文子、臧文仲、叔孙豹、穆姜、哀姜）合并模拟 —— Sophia 备料，team/round61_prompts.md「Task for Sophia · r62-N／O／P／Q／R」Q 行。
来源标记：Sophia·r62-Q，2026-10-17 EDT；开工所读之 HEAD 81d3d53，续行时 77e27e3（见 CHANGES §〇）。本脚本以 r62-O 之 sim 之式为模。

用法（仓库根目录；★ 须在本件合入之前跑——以 data/csv/ 为「改前」）：
    python data/incoming/r62_beiliao/Q/sim_r62q_lu_beiliao.py

做什么：
  0. 表头与文件卫生（与主表同表头、无换行／制表符、无 novel* 列）；
  1. 复制 data/csv/ 与 tools/（去 qa、node_modules、__pycache__）至临时目录（改前、改后两份）；
     改后者 append 七个 *_new.csv，三个 fixes_*.csv 按 id 整行替换——逐栏只许「纯追加」；
  2. 两份副本上各跑 tools/validate.py、tools/csv_to_json.py、tools/build_kaodui_index.py；改后之 validate 须 exit 0，kaodui「抽不出」不得增；
  3. 本件断言：号段、ids_used.txt、共用号簿（_ledger.csv）、引文为底本子串、私用区字、presence 分布、从严三则、role 首句、行数；
  4. 三数（挂链／涉年／可落图亲至地，照 tools/validate.py protagonist_counts 之读法）改前改后；
  5. ★ 按类反证（裁一百一十四）：逐类注入同型之错，须当场红；任一反证未红 → exit 2。
  若主表已含本件之号（即已合入），号段断言必红——属量具之设，非脚本之误。

退出码：0 全过；1 有 FAIL；2 反证未红。临时目录可用环境变量 CHUNQIU_SIM_TMP 覆写。本脚本不属数据。
"""
import csv, os, re, shutil, subprocess, sys, tempfile, copy
from collections import Counter

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
csv.field_size_limit(10 ** 7)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
CSV = os.path.join(ROOT, "data", "csv")
LEDGER = os.path.join(HERE, "..", "_ledger.csv")
TMPBASE = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_r62q")

TABLES = ["events", "passages", "sources", "people", "event_people", "relations", "places",
          "archaeology", "background", "office_tenures"]
NEW = {"events": "events_new.csv", "passages": "passages_new.csv", "sources": "sources_new.csv", "people": "people_new.csv",
       "event_people": "event_people_new.csv", "relations": "relations_new.csv", "places": "places_new.csv"}
FIX = {"people": "fixes_people.csv", "sources": "fixes_sources.csv", "events": "fixes_events.csv"}
RANGES = {"E": (402, 431), "Q": (746, 805), "R": (425, 449), "Z": (181, 190)}
RETIRED = {"E005", "E006", "Z098"}
WHO = "Sophia·r62-Q"
PERSONS = ["P_JIWENZI", "P_ZANGWENZHONG", "P_SHUSUNBAO", "P_MUJIANG", "P_AIJIANG", "P_SHUSUNQIAORU", "P_SHUNIU",
           "P_LUCHENGGONG", "P_KONGZI", "P_LUZHUANG", "P_QINGFU", "P_JIYOU", "P_ZHAOWU", "P_SHIGAI", "P_SHIXIE", "P_XICHOU",
           "P_JINDAOGONG", "P_HANJUE"]
EXPECT_PRESENCE = {"亲至": 19, "相关": 25}
PLACE_WHITELIST = {("E404", "P_AIJIANG"): "经「薨于夷」、传「殺之于夷」（甲①）",
                   ("E410", "P_MUJIANG"): "「出于房」（宫室之名）＋再拜",
                   ("E412", "P_JIWENZI"): "「執季文子于苕丘」「舍之于苕丘」（甲①）",
                   ("E413", "P_SHUSUNBAO"): "「如晉」＋「晉侯享之」（行在君所，受享）",
                   ("E415", "P_SHUSUNBAO"): "地承上「來聘」＋趨進、對面之言",
                   ("E416", "P_MUJIANG"): "「薨於東宮」（宫室之名，甲①）",
                   ("E418", "P_SHUSUNBAO"): "经「會……于虢」（甲①）",
                   ("E418", "P_ZHAOWU"): "经「會晉趙武……于虢」（甲①）"}
PENDING_RELATED = {("E410", "P_JIWENZI"), ("E410", "P_LUCHENGGONG"), ("E413", "P_JINDAOGONG"), ("E315", "P_SHUSUNBAO")}
PUA = re.compile("[-]")

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.join(HERE, "_method"))
import hujiao_q as hujiao  # noqa: E402

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

print("== 0. 表头与文件卫生 ==")
for t, fn in list(NEW.items()) + list(FIX.items()):
    ck(hdr(os.path.join(CSV, t + ".csv")) == hdr(os.path.join(HERE, fn)), f"{fn} 表头与主表不同")
    for r in rd(os.path.join(HERE, fn)):
        for k, v in r.items():
            ck(v is not None and "\n" not in v and "\t" not in v, f"{fn} {k} 含换行／制表符")
            ck(not k.lower().startswith("novel"), f"{fn} 含 novel* 列")

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
                    for k in r: ck(new[k] == r[k] or new[k].startswith(r[k]), f"{t}.{r['id']}.{k} 非纯追加")
                m[t][i] = dict(new); hit += 1
        if report: ck(hit == len(repl), f"fixes {t} 命中 {hit} != {len(repl)}")
    for t, rows in newrows.items(): m[t].extend(dict(r) for r in rows)
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

print("== 2. 副本上跑 validate／csv_to_json／kaodui ==")
vB, cB, kB, uB = run_tools(dB); vA, cA, kA, uA = run_tools(dA)
last = lambda p: ((p.stdout + p.stderr).strip().splitlines() or [""])[-1]
print(f"   改前 validate exit {vB.returncode}：{last(vB)}")
print(f"   改后 validate exit {vA.returncode}：{last(vA)}")
VALIDATE_EXIT = vA.returncode
ck(vA.returncode == 0, "改后 validate 非 0：\n" + vA.stdout[-3000:] + vA.stderr[-3000:])
ck(cA.returncode == 0, "改后 csv_to_json 失败：" + cA.stderr[-800:])
ck(kA.returncode == 0, "改后 build_kaodui_index 失败：" + kA.stderr[-800:])
print(f"   kaodui 抽不出：改前 {uB}｜改后 {uA}"); ck(uA <= uB, f"kaodui 抽不出增：{uB}→{uA}")
wB = len(re.findall(r"^\s+! ", vB.stderr, re.M)); wA = len(re.findall(r"^\s+! ", vA.stderr, re.M))
print(f"   validate 软检警告：改前 {wB}｜改后 {wA}"); ck(wA <= wB, "软检警告增")

print("== 3. 本件断言 ==")
def check_ids(newrows, ids_used, main):
    v = []; exist = {t: {r["id"] for r in main[t] if "id" in r} for t in TABLES}; allnew = set()
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
            elif t in ("events", "passages", "relations"): v.append(f"{t} {i} 非本件号段之形")
    if allnew != ids_used: v.append(f"ids_used.txt 与新号不合：多 {sorted(ids_used - allnew)}；少 {sorted(allnew - ids_used)}")
    return v
ids_used = set()
for line in open(os.path.join(HERE, "ids_used.txt"), encoding="utf-8"):
    if line.strip() and not line.startswith("#"):
        a, b = line.rstrip("\n").split("\t"); ids_used.add((a, b))
v = check_ids(newrows, ids_used, main); ck(not v, "号段／ids_used：" + "；".join(v))

led = rd(LEDGER)
mine_ids = {r["id"] for t in ("people", "places") for r in newrows[t]} | {r["id"] for r in newrows["sources"] if not r["id"].startswith("Z")}
for i_ in sorted(mine_ids):
    mine = [i for i, x in enumerate(led) if x["拟ID"] == i_ and x["登记者"] == WHO and x["状态"] != "撤"]
    ck(len(mine) >= 1, f"号簿无己登之 {i_}")
    if mine:
        earlier = [x for x in led[:mine[0]] if x["拟ID"] == i_ and x["登记者"] != WHO and x["状态"] != "撤"]
        ck(not earlier, f"号簿 {i_} 有在先之他件之登：{earlier}")
for x in led:
    if x["登记者"] != WHO: ck(x["拟ID"] not in mine_ids, f"他件已登 {x['拟ID']} 而本件又立")
ck(any(x["拟ID"] == "E415" and x["登记者"] == WHO for x in led), "共用之目 E415 未登簿")
for r in newrows["event_people"]:  # 涉件（R）之人不由本件挂
    ck(r["person_id"] not in ("P_SUNLINFU", "P_WEIXIANGONG"), f"本件挂了涉件之人 {r['person_id']}")

bad = hujiao.check(newrows["passages"]); ck(not bad, f"引文非底本子串：{bad}")
def pua_hits(tabs):
    return [(t, r.get("id", r.get("event_id")), k) for t, rows_ in tabs.items() for r in rows_ for k, v in r.items() if v and PUA.search(v)]
ck(not pua_hits(newrows) and not pua_hits(fixrows), f"本件诸表含私用区字：{pua_hits(newrows) + pua_hits(fixrows)}")
ck(not pua_hits(merged), f"合入后之库含私用区字：{pua_hits(merged)[:5]}")

pc = Counter(r["presence"] for r in newrows["event_people"])
print("   本件挂链 presence：", dict(pc)); ck(dict(pc) == EXPECT_PRESENCE, f"presence 分布 {dict(pc)} != {EXPECT_PRESENCE}")
def strict_rules(eprows, evs):
    v = []; ev = {e["id"]: e for e in evs}
    for r in eprows:
        e = ev.get(r["event_id"]); key = (r["event_id"], r["person_id"])
        if r["presence"] in ("亲至", "") and e and e["place_id"] and key not in PLACE_WHITELIST:
            v.append(f"{key} 有落点之目标亲至而不在白名单（v1.42：须其地之文）")
        if key in PENDING_RELATED and r["presence"] != "相关": v.append(f"{key} 呈裁未定而改其值")
        if r["presence"] not in ("亲至", "相关", "不在"): v.append(f"{key} presence 值不合")
    return v
v = strict_rules(newrows["event_people"], main["events"] + newrows["events"]); ck(not v, "从严三则：" + "；".join(v))
def role_long(eprows): return [(r["event_id"], r["person_id"]) for r in eprows if len(re.split(r"[。；]", r["role_in_event"])[0]) > 40]
ck(not role_long(newrows["event_people"]), f"role 首句逾四十字：{role_long(newrows['event_people'])}")
plids = {p["id"] for p in merged["places"]}
for e in newrows["events"]: ck(not e["place_id"] or e["place_id"] in plids, f"{e['id']} 落点 {e['place_id']} 未立")
for t in TABLES:
    exp = len(main[t]) + len(newrows.get(t, []))
    print(f"   {t:<15}{len(main[t]):>6}{len(merged[t]):>6}"); ck(len(merged[t]) == exp, f"{t} 行数 {len(merged[t])} != {exp}")
for t in ("archaeology", "background", "office_tenures"): ck(merged[t] == main[t], f"{t} 被改动")
pa = Counter(r["presence"] for r in merged["event_people"]); pm = Counter(r["presence"] for r in main["event_people"])
print(f"   event_people 全表 presence：改前 {dict(pm)}｜改后 {dict(pa)}")

print("== 4. 三数（挂链／涉年／可落图亲至地），改前→改后 ==")
def counts(data, pid):
    ev = {e["id"]: e for e in data["events"]}; pl = {x["id"]: x for x in data["places"]}
    rows = [r for r in data["event_people"] if r["person_id"] == pid]; years, places = set(), set()
    for r in rows:
        e = ev.get(r["event_id"])
        if not e: continue
        years.add(e["year_bce"])
        if r["presence"] in ("亲至", ""):
            q = pl.get(e["place_id"])
            if q and q["lat"].strip() and q["lng"].strip(): places.add(q["id"])
    return len(rows), len(years), len(places)
pname = {p["id"]: p["name"] for p in merged["people"]}; mainp = {p["id"] for p in main["people"]}
for pid in PERSONS:
    b = counts(main, pid) if pid in mainp else ("—",) * 3; a = counts(merged, pid)
    print(f"   {pname.get(pid, pid)}（{pid}）：{'/'.join(map(str, b))} → {'/'.join(map(str, a))}")

print("== 5. 按类反证（须红）==")
UNRED = 0
def must_red(name, violations):
    global UNRED
    if violations: print(f"   红 ✓ {name}")
    else: UNRED += 1; print(f"   ★ 未红 {name}")
q2 = copy.deepcopy(newrows["passages"]); q2[0]["quote_original"] = q2[0]["quote_original"].replace("臧文仲", "臧文忠", 1)
must_red("引文改一字（臧文仲→臧文忠）", hujiao.check(q2))
n2 = copy.deepcopy(newrows); n2["events"][0]["id"] = "E432"; must_red("事目号出 Q 之号段（E432）", check_ids(n2, ids_used, main))
n3 = copy.deepcopy(newrows); n3["events"][0]["id"] = "E351"; must_red("事目号撞主表（E351）", check_ids(n3, ids_used, main))
for key, label in ((("E403", "P_AIJIANG"), "武闱之目哀姜改亲至（无其地之文）"), (("E406", "P_ZANGWENZHONG"), "大庙之目臧文仲改亲至"),
                   (("E410", "P_JIWENZI"), "成九之季文子改亲至（呈裁未定）"), (("E315", "P_SHUSUNBAO"), "E315 穆叔改亲至（呈裁未定）")):
    e2 = copy.deepcopy(newrows["event_people"])
    for r in e2:
        if (r["event_id"], r["person_id"]) == key: r["presence"] = "亲至"
    must_red(label, strict_rules(e2, main["events"] + newrows["events"]))
bad_m = copy.deepcopy(merged); bad_m["events"].append(dict(newrows["events"][0]))
dX = make_copy("counter_dupid", bad_m)
vx = subprocess.run([sys.executable, os.path.join(dX, "tools", "validate.py")], capture_output=True, text=True, encoding="utf-8", env=env)
must_red("副本 validate：事目 id 重复", vx.returncode != 0 and "重复" in (vx.stdout + vx.stderr))
bad_p = copy.deepcopy(merged); bad_p["events"] = [dict(e, place_id="L_NOWHERE") if e["id"] == "E404" else e for e in bad_p["events"]]
dY = make_copy("counter_place", bad_p)
vy = subprocess.run([sys.executable, os.path.join(dY, "tools", "validate.py")], capture_output=True, text=True, encoding="utf-8", env=env)
must_red("副本 validate：落点用未立之地（L_NOWHERE）", vy.returncode != 0)
print("   （下列一行 FAIL 为本类反证注入之预期输出，不计入结）")
f2 = copy.deepcopy(fixrows); f2["sources"][0]["notes"] = "改写" + f2["sources"][0]["notes"]
before_fail = FAIL; merge(main, newrows, f2, report=True); red = FAIL > before_fail; FAIL = before_fail
must_red("fixes 之 notes 前置改写（非纯追加）", red)
n6 = copy.deepcopy(newrows); n6["passages"][0]["quote_original"] += chr(0xF6E3); must_red("引文含私用区字", pua_hits(n6))
e7 = copy.deepcopy(newrows["event_people"]); e7[0]["role_in_event"] = "甲" * 41 + "。" + e7[0]["role_in_event"]
must_red("role 首句逾四十字", role_long(e7))

print(f"\n== 结 ==\n   PASS {PASS}｜FAIL {FAIL}｜反证未红 {UNRED}｜改后 validate exit {VALIDATE_EXIT}")
sys.exit(2 if UNRED else (1 if FAIL else 0))
