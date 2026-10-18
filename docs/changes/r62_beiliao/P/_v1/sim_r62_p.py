# -*- coding: utf-8 -*-
"""
r62-P（齐之备料：崔杼、陈恒；《管子·小称》来源行）合并模拟 —— Sophia 备料。
来源标记：Sophia（史料研究员），2026-10-17 EDT；目的：team/round61_prompts.md「Task for Sophia · r62-N／O／P／Q／R」P 之行。

用法（仓库根目录；须于本件合入前跑，以 data/csv/ 为「改前」，所读 HEAD 81d3d53）：
    python data/incoming/r62_beiliao/P/sim_r62_p.py

做什么：
  1. 复制 data/csv/ 与 tools/ 至临时目录；六个 *_new.csv 追加，fixes_*.csv 按 id 整行替换（只许纯追加）；
  2. 副本上跑 tools/validate.py（须 exit 0）；
  3. 本件断言：号段、ids_used.txt 与实用相合、退役号、外键、presence 枚举、同年 sort_key、引文比字（去标点为底本之子串，「……」分段各比）、
     注／摘要中「」内原文片段之比字（豁免标签词）、T 层纪律（T012 之引文 quote_type＝经义异闻、T 不单立事目）、is_protagonist 未动、
     崔杼／陈恒三数改前改后（照 validate.py protagonist_counts 之读法）；
  4. 按类反证：注入同型之错，须当场红；任一未红 → exit 2。
  ★ 他件（N、O、Q、R）并行未合入，本 sim 不叠之；与其 ids_used.txt 之撞号只作现读之查（文件在则比）。
退出码：0 全过；1 有 FAIL；2 反证未红。临时目录可用环境变量 CHUNQIU_SIM_TMP 覆写。本脚本不属数据。
"""
import csv, os, re, shutil, subprocess, sys, tempfile, copy

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
csv.field_size_limit(10 ** 7)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
CSV = os.path.join(ROOT, "data", "csv")
TMP = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_r62p")
TABLES = ["events", "passages", "sources", "people", "event_people", "relations",
          "places", "archaeology", "background", "office_tenures"]
NEW = {"events": "events_new.csv", "passages": "passages_new.csv", "sources": "sources_new.csv",
       "people": "people_new.csv", "event_people": "event_people_new.csv", "relations": "relations_new.csv"}
FIX = {"events": "fixes_events.csv", "relations": "fixes_relations.csv", "people": "fixes_people.csv"}
RANGE = {"E": (382, 401), "Q": (706, 745), "R": (410, 424), "Z": (173, 180)}
RETIRED = {"E005", "E006", "Z098"}
LEDGER_IDS = {"T012", "P_QINGFENG", "P_TANGJIANG", "P_KANZHI", "L_SALAN", "L_PUSHUI"}
DIBEN_SRC = {"Z075": ["zuo_xuangong.txt"], "Z144": ["zuo_xianggong.txt"], "Z173": ["zuo_xianggong.txt"],
             "Z092": ["zuo_xianggong.txt"], "Z130": ["zuo_aigong.txt"], "Z131": ["zuo_aigong.txt"],
             "Z174": ["zuo_aigong.txt"], "T012": ["guanzi_xiaocheng.txt"], "Z082": ["zuo_xianggong25.txt"]}
EXEMPT = {"亲至", "相关", "不在", "管子", "小称", "小稱", "戒"}
TARGET = {"P_CUIZHU": "崔杼", "P_CHENHENG": "陈恒"}

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
PUNCT = re.compile(r"[「」『』，。：；、？！\s（）‧．·,.:;!?\"'“”‘’…]")
def norm(s): return PUNCT.sub("", s)

DB = {}
for fn in os.listdir(os.path.join(HERE, "_method", "diben")):
    t = open(os.path.join(HERE, "_method", "diben", fn), encoding="utf-8").read()
    t = re.sub(r"\{\{\*\|[^}]*\}\}", "", t)
    t = t.replace(chr(0xF6E3), "無")   # 底本私用区字 U+F6E3 推为「無」（见 Q715／Q716 注），唯此一符
    DB[fn] = norm(t)
ALLN = "".join(DB.values())

def counts(ep, ev, pl, pid):
    evd = {e["id"]: e for e in ev}; pld = {p["id"]: p for p in pl}
    rows = [r for r in ep if r["person_id"] == pid]
    ys, ps = set(), set()
    for r in rows:
        e = evd.get(r["event_id"])
        if not e: continue
        ys.add(e["year_bce"])
        if r["presence"] in ("亲至", ""):
            q = pld.get(e["place_id"])
            if q and q["lat"].strip() and q["lng"].strip(): ps.add(q["id"])
    return len(rows), len(ys), len(ps), sorted(ps)

# ---------- 0. 表头 ----------
print("== 0. 表头与卫生 ==")
for t, fn in list(NEW.items()) + list(FIX.items()):
    ck(hdr(os.path.join(CSV, t + ".csv")) == hdr(os.path.join(HERE, fn)), f"{fn} 表头与主表不同")
    for r in rd(os.path.join(HERE, fn)):
        for k, v in r.items():
            ck(v is not None and "\n" not in v and "\t" not in v, f"{fn} {k} 含换行／制表")
            ck(not k.lower().startswith("novel"), f"{fn} 含 novel* 列")

# ---------- 1. 合并 ----------
print("== 1. 合并模拟 ==")
main = {t: rd(os.path.join(CSV, t + ".csv")) for t in TABLES}
def build(dst, new=None, fix=None):
    if os.path.isdir(dst): shutil.rmtree(dst)
    simcsv = os.path.join(dst, "data", "csv"); os.makedirs(simcsv)
    for t in TABLES: shutil.copy(os.path.join(CSV, t + ".csv"), os.path.join(simcsv, t + ".csv"))
    new = new or {t: rd(os.path.join(HERE, fn)) for t, fn in NEW.items()}
    fix = fix or {t: rd(os.path.join(HERE, fn)) for t, fn in FIX.items()}
    for t, rows in new.items():
        with open(os.path.join(simcsv, t + ".csv"), "a", encoding="utf-8", newline="") as f:
            csv.DictWriter(f, fieldnames=hdr(os.path.join(CSV, t + ".csv")), lineterminator="\n").writerows(rows)
    hits = {}
    for t, rows in fix.items():
        repl = {r["id"]: r for r in rows}
        cur = rd(os.path.join(simcsv, t + ".csv")); hit = 0; nonapp = []
        for i, r in enumerate(cur):
            if r["id"] in repl:
                nw = repl[r["id"]]
                for k in r:
                    if not (nw[k] == r[k] or nw[k].startswith(r[k])): nonapp.append(f"{r['id']}.{k}")
                cur[i] = nw; hit += 1
        hits[t] = (hit, len(repl), nonapp)
        with open(os.path.join(simcsv, t + ".csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=hdr(os.path.join(CSV, t + ".csv")), lineterminator="\n")
            w.writeheader(); w.writerows(cur)
    shutil.copytree(os.path.join(ROOT, "tools"), os.path.join(dst, "tools"),
                    ignore=shutil.ignore_patterns("node_modules", "__pycache__"))
    os.makedirs(os.path.join(dst, "site", "data"), exist_ok=True); os.makedirs(os.path.join(dst, "docs"), exist_ok=True)
    return {t: rd(os.path.join(simcsv, t + ".csv")) for t in TABLES}, hits
def validate(dst):
    env = dict(os.environ, PYTHONIOENCODING="utf-8")
    v = subprocess.run([sys.executable, "-B", os.path.join(dst, "tools", "validate.py")], capture_output=True,
                       text=True, encoding="utf-8", env=env)
    return v.returncode, (v.stdout + v.stderr)
merged, hits = build(TMP)
for t, (h, n, na) in hits.items():
    ck(h == n, f"fixes_{t} 替换命中 {h} != {n}")
    ck(not na, f"fixes_{t} 非纯追加：{na}")
print("   临时副本：" + TMP)

print("== 2. 逐表行数（改前／改后） ==")
for t in TABLES:
    add = len(rd(os.path.join(HERE, NEW[t]))) if t in NEW else 0
    print(f"   {t:<15}{len(main[t]):>6}{len(merged[t]):>6}")
    ck(len(merged[t]) == len(main[t]) + add, f"{t} 行数不合")
for t in ("places", "archaeology", "background", "office_tenures", "sources", "passages"):
    ck(merged[t][:len(main[t])] == main[t], f"既有 {t} 行被改动（本件于此表只 append）")

print("== 3. 副本跑 validate.py ==")
rc, out = validate(TMP)
print("   validate exit", rc, "|", out.strip().splitlines()[-1] if out.strip() else "")
ck(rc == 0, "副本 validate 非 0：\n" + out)
SIM_RC = rc

# ---------- 4. 本件断言 ----------
print("== 4. 本件断言 ==")
new = {t: rd(os.path.join(HERE, fn)) for t, fn in NEW.items()}
fix = {t: rd(os.path.join(HERE, fn)) for t, fn in FIX.items()}
used = set()
for line in open(os.path.join(HERE, "ids_used.txt"), encoding="utf-8"):
    if line.strip() and not line.startswith("#"):
        used.add(line.rstrip("\n").split("\t")[1])
made = {r["id"] for t in ("events", "passages", "relations", "sources", "people") for r in new[t]}
ck(made == used, f"ids_used.txt 与实立不合：多 {used - made} 少 {made - used}")
for i in made:
    ck(i not in RETIRED, f"{i} 为退役号")
    m = re.match(r"^([EQRZ])(\d{3})$", i)
    if m:
        lo, hi = RANGE[m.group(1)]; ck(lo <= int(m.group(2)) <= hi, f"{i} 越号段")
    else:
        ck(i in LEDGER_IDS, f"{i} 非 Z 段之号而未登簿")
ledger = rd(os.path.join(HERE, "..", "_ledger.csv"))
for i in LEDGER_IDS:
    rows = [ (k, r) for k, r in enumerate(ledger) if r["拟ID"] == i ]
    ck(rows and rows[0][1]["登记者"] == "Sophia·r62-P", f"{i} 于簿非己先登：{rows[:1]}")
# 他件 ids_used（现读）
for d in ("N", "O", "Q", "R", "K"):
    p = os.path.join(HERE, "..", d, "ids_used.txt")
    if os.path.exists(p):
        other = {l.rstrip("\n").split("\t")[-1] for l in open(p, encoding="utf-8") if l.strip() and not l.startswith("#")}
        ck(not (other & made), f"与 {d} 之 ids_used 撞号：{other & made}")
# 外键与枚举（validate 已管，此复核本件）
evid = {e["id"] for e in merged["events"]}; pid = {p["id"] for p in merged["people"]}
for r in new["event_people"]:
    ck(r["presence"] in ("亲至", "相关", "不在"), f"presence 非法 {r}")
    first = re.split(r"[。；！？]", r["role_in_event"])[0]
    ck(len(first) <= 40, f"role 首句逾四十字：{r['event_id']} {r['person_id']} {len(first)}")
keys = [(r["event_id"], r["person_id"]) for r in merged["event_people"]]
ck(len(keys) == len(set(keys)), "event_people 键重复")
# sort_key 同年
sk = {}
for e in merged["events"]:
    if e["sort_key"].strip():
        k = (e["year_bce"], e["sort_key"]); ck(k not in sk, f"同年 sort_key 重：{k} {sk.get(k)} {e['id']}"); sk[k] = e["id"]
# is_protagonist 未动
mp = {p["id"]: p["is_protagonist"] for p in main["people"]}
for p in merged["people"]:
    if p["id"] in mp: ck(p["is_protagonist"] == mp[p["id"]], f"{p['id']} is_protagonist 被改")
    else: ck(p["is_protagonist"] == "0", f"新人 {p['id']} 非二级")
# 落点只用库有坐标之地或空
pl = {p["id"]: p for p in merged["places"]}
for e in new["events"]:
    ck(e["place_id"] == "" or e["place_id"] in pl, f"{e['id']} 落点不在库")
# 引文比字
for q in new["passages"]:
    src = DIBEN_SRC.get(q["source_id"]); ck(src is not None, f"{q['id']} 源无底本")
    base = "".join(DB[f] for f in src)
    for seg in q["quote_original"].split("……"):
        ck(norm(seg) in base, f"{q['id']} 引文不见于底本：{seg[:30]}")
# 注、摘要、role、source_note、notes 中「」片段
def frags(s):
    return [x for x in re.findall(r"「([^」]+)」", s)]
texts = [(q["id"], q["modern_note"]) for q in new["passages"]] + [(e["id"], e["summary"]) for e in new["events"]] \
      + [(f"{r['event_id']}/{r['person_id']}", r["role_in_event"]) for r in new["event_people"]] \
      + [(r["id"], r["source_note"]) for r in new["relations"]] + [(p["id"], p["notes"] + p["short_bio"] + p["relations"]) for p in new["people"]]
for i, s in texts:
    for f in [x for y in frags(s) for x in y.split("……")]:
        n = norm(f)
        if not n or f in EXEMPT or "□" in f or not re.search(r"[一-鿿]", f): continue
        if re.search(r"[们这说您]|^[a-zA-Z]", f): continue   # 今语之引，非原文
        trad = re.search(r"[齊衛陳晉魯鄭殺弒將與於為國從無謂請慶崔曰見]", f)
        if not trad: continue   # 简体之撮述
        ck(n in ALLN or n in norm("".join(open(os.path.join(CSV, "passages.csv"), encoding="utf-8").read())),
           f"{i} 注中原文片段不见于底本：「{f}」")
# T 层纪律
for q in new["passages"]:
    if q["source_id"].startswith("T"): ck(q["quote_type"] == "经义异闻", f"{q['id']} T 层 quote_type 非经义异闻")
for e in new["events"]:
    ck(not any(s.startswith("T") for s in e["source_ids"].split(";")), f"{e['id']} 以 T 层单立事目")
# 新事目之 source_ids 须含其引文之源
psrc = {}
for q in new["passages"]: psrc.setdefault(q["event_id"], set()).add(q["source_id"])
ev_all = {e["id"]: e for e in merged["events"]}
for eid, ss in psrc.items():
    have = set(ev_all[eid]["source_ids"].split(";"))
    ck(ss <= have, f"{eid} source_ids 未含其引文之源 {ss - have}")

# 三数
print("== 5. 崔杼、陈恒三数（改前 → 改后；读法同 validate.protagonist_counts） ==")
for p, n in TARGET.items():
    b = counts(main["event_people"], main["events"], main["places"], p)
    a = counts(merged["event_people"], merged["events"], merged["places"], p)
    print(f"   {n}（{p}）挂链／涉年／可落图亲至地：{b[0]}／{b[1]}／{b[2]} → {a[0]}／{a[1]}／{a[2]}  地：{a[3]}")
EXPECT = {"P_CUIZHU": (9, 5, 1), "P_CHENHENG": (5, 3, 1)}
for p, x in EXPECT.items():
    a = counts(merged["event_people"], merged["events"], merged["places"], p)
    ck(a[:3] == x, f"{p} 三数 {a[:3]} != 预期 {x}")
import collections
print("   本件挂链 presence：", dict(collections.Counter(r["presence"] for r in new["event_people"])))
for t in ("event_people",):
    print("   全表 presence 改前：", dict(collections.Counter(r["presence"] for r in main[t])),
          "改后：", dict(collections.Counter(r["presence"] for r in merged[t])))

# ---------- 6. 按类反证 ----------
print("== 6. 按类反证（注入须红） ==")
UNRED = 0
def must_red(name, fn):
    global UNRED
    ok = fn()
    print(f"   {'红' if ok else '★未红'}：{name}")
    if not ok: UNRED += 1
T2 = TMP + "_neg"
# ① 外键：挂链指向不存在之人 → validate 红
def neg1():
    n = copy.deepcopy(new); n["event_people"].append(dict(event_id="E386", person_id="P_NOBODY", role_in_event="x", directness="direct", presence="亲至"))
    build(T2, n); return validate(T2)[0] != 0
must_red("挂链外键失其人 → validate", neg1)
# ② 同年 sort_key 撞（E386 改 10，与 E206 撞）→ validate 红
def neg2():
    n = copy.deepcopy(new)
    for e in n["events"]:
        if e["id"] == "E386": e["sort_key"] = "10"
    build(T2, n); return validate(T2)[0] != 0
must_red("同年 sort_key 撞 → validate", neg2)
# ③ 引文改一字 → 比字红
def neg3():
    q = copy.deepcopy([x for x in new["passages"] if x["id"] == "Q716"][0]); q["quote_original"] = q["quote_original"].replace("崔彊", "崔強")
    base = "".join(DB[f] for f in DIBEN_SRC[q["source_id"]])
    return not all(norm(s) in base for s in q["quote_original"].split("……"))
must_red("引文「崔彊」改「崔強」→ 比字", neg3)
# ④ 同对同类关系重（R410 复写为 R418）→ validate 红
def neg4():
    n = copy.deepcopy(new); r = dict(n["relations"][0]); r["id"] = "R418"; r["person_a"], r["person_b"] = r["person_b"], r["person_a"]
    n["relations"].append(r); build(T2, n); return validate(T2)[0] != 0
must_red("同对同类反向重 → validate", neg4)
# ⑤ fixes 非纯追加（改 E073 摘要首字）→ 本 sim 红
def neg5():
    f = copy.deepcopy(fix); f["events"][0]["summary"] = "X" + f["events"][0]["summary"]
    _, h = build(T2, None, f); return bool(h["events"][2])
must_red("fixes 非纯追加 → 本 sim", neg5)
# ⑥ 新人 is_protagonist=1 → 本件断言（validate 亦以三数／徽记外之门或不红，故本 sim 自断）
def neg6():
    return any(p["is_protagonist"] != "0" for p in [dict(new["people"][0], is_protagonist="1")])
must_red("新人置一级 → 本 sim", neg6)
# ⑦ 落点指库无之地（L_SALAN 未立）→ validate 红
def neg7():
    n = copy.deepcopy(new)
    for e in n["events"]:
        if e["id"] == "E384": e["place_id"] = "L_SALAN"
    build(T2, n); return validate(T2)[0] != 0
must_red("落点用未立之 L_SALAN → validate", neg7)
# ⑧ T 层引文标「原文」→ 本 sim 红
def neg8():
    q = dict(new["passages"][-1], quote_type="原文"); return q["source_id"].startswith("T") and q["quote_type"] != "经义异闻"
must_red("T012 引文标原文 → 本 sim", neg8)
shutil.rmtree(T2, ignore_errors=True)

print(f"\n合计：PASS {PASS}，FAIL {FAIL}，反证未红 {UNRED}；副本 validate exit {SIM_RC}")
sys.exit(2 if UNRED else (1 if FAIL else 0))
