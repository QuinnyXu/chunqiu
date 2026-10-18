# -*- coding: utf-8 -*-
"""r62-T 合入断言（Skipper，2026-10-17；本脚本不属数据）。
用法（仓库根，合入后）：python data/incoming/r62_beiliao/sim_merge_z059.py [链模拟副本 data/csv 目录]
断：
 1. Z059.notes = 库值(HEAD) + N 追加句 + Q 追加句（N 先 Q 后），后者含前者之追加；
 2. 五件 fixes_* 以首二栏比，同一行为二件所替者，唯 Z059 一处，且逐处后者须含前者之追加（notes 类）；
 3. 若给副本目录：合入后诸表与全链 sim 副本逐表字节同（行集同）。
"""
import csv, io, os, subprocess, sys, collections
sys.stdout.reconfigure(encoding="utf-8"); csv.field_size_limit(10**7)
B = "data/incoming/r62_beiliao"; ok = True
def rd(p): return list(csv.DictReader(open(p, encoding="utf-8", newline="")))
def head(t): return list(csv.DictReader(io.StringIO(subprocess.check_output(["git","show",f"HEAD:data/csv/{t}.csv"]).decode("utf-8"), newline="")))
def key(t, r): return (r["event_id"], r["person_id"]) if t == "event_people" else r["id"]
def chk(c, m):
    global ok
    print(("PASS " if c else "FAIL ") + m); ok = ok and c
base = {r["id"]: r for r in head("sources")}["Z059"]["notes"]
n = {r["id"]: r for r in rd(f"{B}/N/fixes_sources.csv")}["Z059"]["notes"]
q = {r["id"]: r for r in rd(f"{B}/Q/fixes_sources.csv")}["Z059"]["notes"]
ns, qs = n[len(base):], q[len(base):]
chk(n.startswith(base) and q.startswith(base) and ns and qs, "N、Q 之 Z059 俱为库值纯追加")
cur = {r["id"]: r for r in rd("data/csv/sources.csv")}["Z059"]["notes"]
chk(cur == base + ns + qs, "合后 Z059 = 库值＋N 句＋Q 句")
chk(ns in cur and qs in cur and cur.index(ns) < cur.index(qs), "后者(Q)含前者(N)之追加，序 N→Q")
seen = collections.defaultdict(list)
for d in "NOPQR":
    for t in ["events","event_people","passages","people","sources","relations","places"]:
        fp = f"{B}/{d}/fixes_{t}.csv"
        if os.path.exists(fp):
            for r in rd(fp): seen[(t, key(t, r))].append((d, r))
multi = {k: v for k, v in seen.items() if len(v) > 1}
chk(list(multi) == [("sources", "Z059")], f"五件 fixes 同键重替唯 Z059（实：{list(multi)}）")
if len(sys.argv) > 1:
    for t in ["events","passages","sources","people","event_people","relations","places"]:
        a = open(f"data/csv/{t}.csv", encoding="utf-8", newline="").read().replace("\r\n", "\n")
        b = open(os.path.join(sys.argv[1], f"{t}.csv"), encoding="utf-8", newline="").read().replace("\r\n", "\n")
        if t == "sources":  # 链 sim 以最后者(Q)整行替换 Z059，我之合并二句，此行除外
            a = "\n".join(l for l in a.split("\n") if not l.startswith("Z059,")); b = "\n".join(l for l in b.split("\n") if not l.startswith("Z059,"))
        chk(a == b, f"{t}.csv 与全链 sim 副本同")
sys.exit(0 if ok else 1)
