# -*- coding: utf-8 -*-
"""
r51b_chuwu 合并模拟 —— 楚武王立行与回挂（r51-B，Sophia 备料，裁三）

用法（仓库根目录执行）：
    python data/incoming/r51b_chuwu/sim_chuwu.py

做什么：
  1. 把 data/csv/ 全表复制到临时专用子目录 mergesim_chuwu/；
  2. append `people_new.csv`（1 行）与 `event_people_new.csv`（2 行）；
  3. 依 `fixes_people.csv` 作**按 id 整行替换**（`P_CHUWEN` 一行，只动 `relations` 一栏）；
  4. 于该副本上跑 tools/validate.py；
  5. 跑本件全部机器断言（行数、ID、外键、`events` 一字未动之反证、presence 逐条、
     替换件之定点比对与「纯追加」之反证、⚑B 只结一项之反证、卫生）。

体例照 `docs/changes/r49_kongzi_sim.py`。临时目录可用环境变量 CHUNQIU_SIM_TMP 覆写。
本脚本不属数据，不入 data/csv/。
"""
import csv, os, re, shutil, subprocess, sys, tempfile

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
csv.field_size_limit(10 ** 7)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
CSV = os.path.join(ROOT, "data", "csv")
TMP = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_chuwu")

TABLES = ["events", "passages", "sources", "people", "event_people",
          "relations", "places", "archaeology", "background"]
NEW = {"people": "people_new.csv", "event_people": "event_people_new.csv"}
FIX = {"people": "fixes_people.csv"}

# 合入前基线（2026-09-20 实读 HEAD bf4242c）
BEFORE = {"events": 265, "passages": 506, "sources": 195, "people": 166,
          "event_people": 673, "relations": 289, "places": 104,
          "archaeology": 8, "background": 11}
ADD = {"events": 0, "passages": 0, "sources": 0, "people": 1,
       "event_people": 2, "relations": 0, "places": 0,
       "archaeology": 0, "background": 0}
REPL = {"people": ["P_CHUWEN"]}

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
for t, fn in list(NEW.items()) + list(FIX.items()):
    h_main, h_new = hdr(os.path.join(CSV, t + ".csv")), hdr(os.path.join(HERE, fn))
    ck(h_main == h_new, f"{t} 表头不同：{h_main} / {h_new}")
    ck(not any(c.lower().startswith("novel") for c in h_new), f"{fn} 含 novel* 列")
    for r in rd(os.path.join(HERE, fn)):
        key = list(r.values())[0]
        for k, v in r.items():
            ck(v is not None and "\n" not in v, f"{fn} {key} 栏 {k} 含嵌入换行")
            ck(v is not None and "\t" not in v, f"{fn} {key} 栏 {k} 含制表符")

# ---------- 1. 合并模拟 ----------
sec("1. 合并模拟（append 新增 → 按 id 整行替换）")
if os.path.isdir(TMP):
    shutil.rmtree(TMP)
os.makedirs(TMP)
simcsv = os.path.join(TMP, "data", "csv")
os.makedirs(simcsv)
for t in TABLES:
    shutil.copy(os.path.join(CSV, t + ".csv"), os.path.join(simcsv, t + ".csv"))
for t, fn in NEW.items():
    h = hdr(os.path.join(simcsv, t + ".csv"))
    with open(os.path.join(simcsv, t + ".csv"), "a", encoding="utf-8", newline="") as f:
        csv.DictWriter(f, fieldnames=h, lineterminator="\n").writerows(rd(os.path.join(HERE, fn)))
for t, fn in FIX.items():
    h = hdr(os.path.join(simcsv, t + ".csv"))
    repl = {r["id"]: r for r in rd(os.path.join(HERE, fn))}
    cur = rd(os.path.join(simcsv, t + ".csv"))
    hit = 0
    for i, r in enumerate(cur):
        if r["id"] in repl:
            cur[i] = repl[r["id"]]
            hit += 1
    ck(hit == len(repl), f"{fn} 替换命中 {hit} != {len(repl)}")
    with open(os.path.join(simcsv, t + ".csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=h, lineterminator="\n")
        w.writeheader()
        w.writerows(cur)
shutil.copytree(os.path.join(ROOT, "tools"), os.path.join(TMP, "tools"))
print("   临时副本：" + TMP)

# ---------- 2. 逐表行数 ----------
sec("2. 逐表行数（合入后实测）")
merged = {t: rd(os.path.join(simcsv, t + ".csv")) for t in TABLES}
print("   {:<14}{:>8}{:>8}{:>8}".format("表", "合入前", "合入后", "预期"))
for t in TABLES:
    before, after, exp = BEFORE[t], len(merged[t]), BEFORE[t] + ADD[t]
    print("   {:<14}{:>8}{:>8}{:>8}  {}".format(t, before, after, exp,
                                                "相符" if after == exp else "**不符**"))
    ck(after == exp, f"{t} 合入后 {after} != 预期 {exp}")
    ck(len(rd(os.path.join(CSV, t + ".csv"))) == before, f"{t} 主表基线 != {before}")

# ---------- 3. events 一字未动 ----------
sec("3. events 一字未动之反证（任务书二之二 4）")
with open(os.path.join(CSV, "events.csv"), encoding="utf-8") as f:
    a = f.read()
with open(os.path.join(simcsv, "events.csv"), encoding="utf-8") as f:
    b = f.read()
ck(a == b, "events.csv 在模拟中被改动（本件该表一字不动）")
for fn in ("events_new.csv", "fixes_events.csv", "sources_new.csv", "fixes_sources.csv",
           "places_new.csv", "fixes_places.csv", "relations_new.csv", "passages_new.csv"):
    ck(not os.path.exists(os.path.join(HERE, fn)), f"本件出现 {fn}（逾本件之界）")

# ---------- 4. ID / 撞号 / 外键 ----------
sec("4. ID / 撞号 / 外键")
for t in TABLES:
    if merged[t] and "id" in merged[t][0]:
        ids = [r["id"] for r in merged[t]]
        ck(len(ids) == len(set(ids)), f"{t}.id 有重复：{[i for i in ids if ids.count(i) > 1][:5]}")
newP = [r["id"] for r in rd(os.path.join(HERE, "people_new.csv"))]
ck(newP == ["P_CHUWU"], f"people 新 ID != ['P_CHUWU']：{newP}")
ck(re.fullmatch(r"P_[A-Z]+", newP[0]) is not None, "P_CHUWU 不合 ^P_[A-Z]+$")
oldPID = {r["id"] for r in rd(os.path.join(CSV, "people.csv"))}
ck("P_CHUWU" not in oldPID, "P_CHUWU 与库内既有行撞号")
# 楚君六行之形一致：P_CHU+谥，无 GONG 后缀
chu = sorted(r["id"] for r in merged["people"] if r["id"].startswith("P_CHU"))
ck(chu == ["P_CHUCHENG", "P_CHULONG", "P_CHUPING", "P_CHUWEN", "P_CHUWU", "P_CHUZHAO", "P_CHUZHUANG"],
   f"P_CHU* 之集与所报不符：{chu}")
ck(not any(i.endswith("GONG") for i in chu), "楚君行带 GONG 后缀（与库内五行之成例不一致）")
PID = {r["id"] for r in merged["people"]}
EID = {r["id"] for r in merged["events"]}
for r in rd(os.path.join(HERE, "event_people_new.csv")):
    ck(r["event_id"] in EID, f"event_people {r['event_id']} 无此事目")
    ck(r["person_id"] in PID, f"event_people {r['person_id']} 无此人")
epk = [(r["event_id"], r["person_id"]) for r in merged["event_people"]]
ck(len(epk) == len(set(epk)), f"event_people 有重复：{[k for k in epk if epk.count(k) > 1][:5]}")
old_ep = rd(os.path.join(CSV, "event_people.csv"))
ck(merged["event_people"][:len(old_ep)] == old_ep, "既有 event_people 行被改动（本件只 append）")

# ---------- 5. presence 逐条 ----------
sec("5. presence 从严·逐条（裁九同型：逐目核明文，不因以其人为题径判亲至）")
EXP = {("E294", "P_CHUWU"): ("direct", "相关"),
       ("E295", "P_CHUWU"): ("direct", "相关")}
got = {(r["event_id"], r["person_id"]): (r["directness"], r["presence"])
       for r in rd(os.path.join(HERE, "event_people_new.csv"))}
ck(set(got) == set(EXP), f"挂链集合与所报不符：{sorted(got)}")
for k, v in EXP.items():
    ck(got.get(k) == v, f"{k} 实测 {got.get(k)} != 所报 {v}")
    ck(v[1] in {"亲至", "相关", "不在"}, f"{k} presence 非三值")
    ck(v[0] in {"direct", "indirect"}, f"{k} directness 非二值")
# 两目原挂链二人照旧，且楚武王此前不在其中
for e in ("E294", "E295"):
    old_two = sorted(r["person_id"] for r in old_ep if r["event_id"] == e)
    ck(old_two == ["P_JILIANG", "P_SUISHAOSHI"], f"{e} 既有挂链非季梁／少师二人：{old_two}")
    now = sorted(r["person_id"] for r in merged["event_people"] if r["event_id"] == e)
    ck(now == ["P_CHUWU", "P_JILIANG", "P_SUISHAOSHI"], f"{e} 合入后挂链非三人：{now}")
# 每条挂链注须写明其判之据
for r in rd(os.path.join(HERE, "event_people_new.csv")):
    ck("从严标「相关」" in r["role_in_event"], f"{r['event_id']} 挂链注未写明从严之判")
    ck("本目落点" in r["role_in_event"], f"{r['event_id']} 挂链注未写明落点与明文之别")

# ---------- 6. P_CHUWU 行之栏（判据三之落实） ----------
sec("6. P_CHUWU 行之栏")
w = next(r for r in merged["people"] if r["id"] == "P_CHUWU")
ck(w["is_protagonist"] == "0", "P_CHUWU.is_protagonist != 0")
ck(w["death_year_bce"] == "-690", f"death_year_bce != -690：{w['death_year_bce']}")
ck(-800 <= int(w["death_year_bce"]) <= -464, "death_year_bce 逾 [-800,-464]")
ck(w["birth_year_bce"] == "", "birth_year_bce 非空（经传无文，当从阙）")
ck(w["ming"] == "", "ming 非空——「熊通」出《史记》（S 层），依判据三当从阙")
ck("熊通" not in w["alt_names"], "alt_names 收了《左传》零命中之「熊通」")
ck(w["alt_names"] == "武王", f"alt_names != 武王：{w['alt_names']}")
ck("楚子" not in w["alt_names"].split(";"), "alt_names 收了光板「楚子」（全帙兼指诸君）")
ck(w["state"] == "楚", f"state != 楚：{w['state']}")
ck(w["xing"] == "芈" and w["shi"] == "熊", "xing／shi 与库内楚君五行不一致")
for fld in ("xing", "shi", "ming", "zi"):
    ck(w[fld].upper() not in {"NULL", "N/A", "NA"}, f"{fld} 写了 NULL/N/A")
    ck("," not in w[fld], f"{fld} 含 ASCII 逗号")
ck(w["notes"].startswith("【本件之源·⚑B"), "notes 未以 ⚑B 之源开篇")
for kw in ("判据", "S 层", "⚑B"):
    ck(kw in w["notes"], f"notes 缺应有之著录：{kw}")
# ⚑B 只结楚武王一项：余五人不得入 people 表
for b in ("随侯", "隨侯", "鬬伯比", "鬥伯比", "薳章", "鬬丹", "鬥丹", "熊率且比"):
    for r in merged["people"]:
        ck(r["name"] != b and b not in r["alt_names"].split(";"),
           f"people 表出现 ⚑B 余五人之名 '{b}'（{r['id']}，本件只结楚武王一项）")

# ---------- 7. P_CHUWEN 整行替换·定点比对（只动 relations，且纯追加） ----------
sec("7. P_CHUWEN 整行替换·定点比对")
oldW = next(r for r in rd(os.path.join(CSV, "people.csv")) if r["id"] == "P_CHUWEN")
newW = next(r for r in merged["people"] if r["id"] == "P_CHUWEN")
for k in oldW:
    if k == "relations":
        ck(oldW[k] != newW[k], "P_CHUWEN.relations 未变（替换无意义）")
    else:
        ck(oldW[k] == newW[k], f"P_CHUWEN.{k} 被改动（本件只应动 relations）")
ck("父楚武王（未入库）" in newW["relations"], "原句「父楚武王（未入库）」被删（§7 v1.29 原句照留）")
ck("r51-B 勘注" in newW["relations"], "未落 r51-B 勘注")
ck("P_CHUWU" in newW["relations"], "勘注未指向 P_CHUWU")
ck(len(newW["relations"]) > len(oldW["relations"]), "relations 非纯追加式之加注")
# 原文各段照留（只在「（未入库）」之后插注，其余逐字不动）
for seg in ("弟令尹子元", "夫人息妫（灭息所纳）", "子堵敖、成王（息妫生）", "败蔡于莘、灭息、入蔡"):
    ck(seg in newW["relations"], f"P_CHUWEN.relations 原有段落 '{seg}' 遗失")

# ---------- 8. 本件不织 relations 边（任务书 §五所列本件动表不含 relations） ----------
sec("8. relations 一字未动之反证")
with open(os.path.join(CSV, "relations.csv"), encoding="utf-8") as f:
    a = f.read()
with open(os.path.join(simcsv, "relations.csv"), encoding="utf-8") as f:
    b = f.read()
ck(a == b, "relations.csv 被改动（本件不织边，父子边之议已列 CHANGES 上报）")

# ---------- 9. validate.py ----------
sec("9. tools/validate.py（于副本上跑）")
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
