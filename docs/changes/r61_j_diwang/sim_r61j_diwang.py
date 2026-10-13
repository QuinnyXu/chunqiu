# -*- coding: utf-8 -*-
"""
r61-J（赵盾三地扈、衡雍、新城之回填）合并模拟 —— Sophia 备料，team/round61_prompts.md「Task for Sophia · r61-J」。
来源标记：Sophia，2026-10-12 EDT，会话 session_01QhJ4hbubq1BVsxd8kjBSRA。

用法（仓库根目录，★ 须于本件合入之前跑——以 data/csv/ 为「改前」，基线 HEAD c787c70）：
    python data/incoming/r61_j_diwang/sim_r61j_diwang.py

做什么：
  1. 复制 data/csv/ 与 tools/ 至二临时目录（改前／改后）；改后者以 fixes_places.csv 按 id 整行替换三行。
  2. 二副本各跑 tools/validate.py、tools/csv_to_json.py、tools/build_kaodui_index.py：
     改后 validate 须 0；verify_marks 改前→改后之数（总数与三行各数）印出；kaodui「抽不出」不得增。
  3. 本件断言（check_all）：三行只动所令之栏；坐标值即所定、在覆盖范围内、x／y 回校与 coord_basis 所书相合；
     description／coord_basis 旧文为新文之前缀（照留之证）；state、certainty、coord_certainty 之值；
     加注之文须有回填之日、杨注页码、谭图幅页；「」内之片段须见于站长回填表、底本、任务书或库中旧文；
     places 以外八表一字不动（events、event_people 俱不动）。
  4. 按类反证：本件可能犯之错逐类注入，须当场红；任一未红 → exit 2。
  5. 印赵盾合入前后「挂链／涉年／可落图之亲至地（有坐标｜候回填）」，并断言合后为 10／5／3｜0。
  〔r61-O 增（2026-10-12，裁二百二十三 一2、一3 站长补）：改后者另以 fixes_events.csv 按 id 整行替换 E348–E350；
   断言三行只动 summary、「坐标候站长纸本回填」不复见而今状之句在、events 他行一字不动；
   衡雍 coord_basis「文公八年之注本件未核」不复见、页 565 与其文在，verify_marks 衡雍「未核」状态不复见。
   原「events 一字不动」之断言收窄为「events 除三行 summary 外一字不动」，余断言不放松。〕

所据：team/round61_prompts.md §十一 裁二百二十一（含「二之续」）；team/diwang_backfill_r61.md（站长所填原文）；
      docs/changes/r61_g_zhaodun_qixi/CHANGES.md §四；docs/conventions.md §4／§5／§7 v1.29／§10.2。
退出码：0 全过；1 有 FAIL；2 反证未红。临时目录可用环境变量 CHUNQIU_SIM_TMP 覆写。本脚本不属数据。
"""
import copy, csv, json, os, re, shutil, subprocess, sys, tempfile

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
csv.field_size_limit(10 ** 7)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
CSV = os.path.join(ROOT, "data", "csv")
TMPB = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_r61j_before")
TMPA = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_r61j_after")
TABLES = ["events", "passages", "sources", "people", "event_people", "relations",
          "places", "archaeology", "background", "office_tenures"]
IDS = ["L_HU", "L_HENGYONG", "L_XINCHENG"]
ALLOWED = {"lat", "lng", "modern_location", "state", "certainty", "coord_certainty", "coord_basis", "description"}
PREFIX_COLS = ("description", "coord_basis")
EXPECT = {  # id: (lat, lng, x, y, state, certainty, coord_certainty, 杨注页)
    "L_HU": ("35.10", "113.80", 621, 264, "郑", "medium", "low", "页 555"),
    "L_HENGYONG": ("35.07", "113.89", 628, 267, "郑", "medium", "low", "页 462"),
    "L_XINCHENG": ("34.30", "115.45", 738, 327, "宋", "medium", "low", "页 600"),
}
MUST_DESC = {"L_HU": ["判定反转", "庄公二十三年之扈与本点非一地"],
             "L_HENGYONG": [],
             "L_XINCHENG": ["站长取杜注宋地说", "王夫之", "且謀邾也", "納捷菑于邾", "无判定反转"]}
BEFORE_ROWS = {"events": 314, "passages": 628, "sources": 231, "people": 225, "event_people": 871,
               "relations": 369, "places": 107, "archaeology": 8, "background": 11, "office_tenures": 16}
VM_BEFORE = 586
# r61-O：events 三行 summary 之今状随改
EV_IDS = ["E348", "E349", "E350"]
EV_OLD = "坐标候站长纸本回填"
EV_NEW = "坐标已据站长纸本回填，其据见该地点行"
HY_OLD = "文公八年之注本件未核"
HY_NEW_TOKS = ["页 565", "「衡雍见僖二十八年传并注」", "同指一地"]
ZD_BEFORE = (10, 5, 0, 3); ZD_AFTER = (10, 5, 3, 0)

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
def raw(p):
    with open(p, encoding="utf-8") as f: return f.read()
PUNCT = re.compile(r"[「」『』‘’“”，。：；、？！\s（）()‧．︰…*`《》·]")
def norm(s): return PUNCT.sub("", s)
def xy(lat, lng): return round((lng - 105.0) / 17.0 * 1200), round(700 - (lat - 29.5) / 9.0 * 700)

# 「」引语之比对语料：站长回填表、r61-G 底本（左传文公）、任务书、库中 places 旧文
CORPUS = norm("\n".join([
    raw(os.path.join(ROOT, "team", "diwang_backfill_r61.md")),
    raw(os.path.join(ROOT, "team", "round61_prompts.md")),
    raw(os.path.join(ROOT, "docs", "changes", "r61_g_zhaodun_qixi", "diben", "zuo_wengong.txt")),
    raw(os.path.join(CSV, "places.csv")),
]))

# ---------- 0. 表头与卫生 ----------
print("== 0. 表头与文件卫生 ==")
FIXP = os.path.join(HERE, "fixes_places.csv")
ck(hdr(FIXP) == hdr(os.path.join(CSV, "places.csv")), "fixes_places.csv 表头与主表不同")
FIX = rd(FIXP)
for r in FIX:
    for k, v in r.items():
        ck(v is not None and "\n" not in v and "\t" not in v, f"fixes_places {r.get('id')} 栏 {k} 含换行／制表符")
        ck(not k.lower().startswith("novel"), "含 novel* 列")
ck([r["id"] for r in FIX] == IDS, f"fixes_places 之 id {[r['id'] for r in FIX]} != {IDS}")
FIXEP = os.path.join(HERE, "fixes_events.csv")
ck(hdr(FIXEP) == hdr(os.path.join(CSV, "events.csv")), "fixes_events.csv 表头与主表不同")
FIXE = rd(FIXEP)
for r in FIXE:
    for k, v in r.items():
        ck(v is not None and "\n" not in v and "\t" not in v, f"fixes_events {r.get('id')} 栏 {k} 含换行／制表符")
ck([r["id"] for r in FIXE] == EV_IDS, f"fixes_events 之 id {[r['id'] for r in FIXE]} != {EV_IDS}")

# ---------- 1. 合并 ----------
print("== 1. 合并模拟（按 id 整行替换 places 三行） ==")
main = {t: rd(os.path.join(CSV, t + ".csv")) for t in TABLES}
for t in TABLES:
    ck(len(main[t]) == BEFORE_ROWS[t], f"{t} 主表基线 {len(main[t])} != {BEFORE_ROWS[t]}（须于本件合入前跑）")
def build(tmp, fix_rows, fix_ev=None):
    if os.path.isdir(tmp): shutil.rmtree(tmp)
    sc = os.path.join(tmp, "data", "csv"); os.makedirs(sc)
    for t in TABLES: shutil.copy(os.path.join(CSV, t + ".csv"), os.path.join(sc, t + ".csv"))
    if fix_rows is not None:
        repl = {r["id"]: r for r in fix_rows}
        cur = rd(os.path.join(sc, "places.csv")); hit = 0
        for i, r in enumerate(cur):
            if r["id"] in repl: cur[i] = repl[r["id"]]; hit += 1
        ck(hit == len(repl), f"替换命中 {hit} != {len(repl)}")
        with open(os.path.join(sc, "places.csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=hdr(os.path.join(CSV, "places.csv")), lineterminator="\n")
            w.writeheader(); w.writerows(cur)
    if fix_ev is not None:
        repl = {r["id"]: r for r in fix_ev}
        cur = rd(os.path.join(sc, "events.csv")); hit = 0
        for i, r in enumerate(cur):
            if r["id"] in repl: cur[i] = repl[r["id"]]; hit += 1
        ck(hit == len(repl), f"events 替换命中 {hit} != {len(repl)}")
        with open(os.path.join(sc, "events.csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=hdr(os.path.join(CSV, "events.csv")), lineterminator="\n")
            w.writeheader(); w.writerows(cur)
    shutil.copytree(os.path.join(ROOT, "tools"), os.path.join(tmp, "tools"), ignore=shutil.ignore_patterns("node_modules", "__pycache__"))
    os.makedirs(os.path.join(tmp, "site", "data")); os.makedirs(os.path.join(tmp, "docs"))
    return {t: rd(os.path.join(sc, t + ".csv")) for t in TABLES}
build(TMPB, None)
merged = build(TMPA, FIX, FIXE)
print("   临时副本：改前 " + TMPB + "｜改后 " + TMPA)

# ---------- 2. 二副本跑三工具 ----------
print("== 2. 二副本跑 validate／csv_to_json／kaodui ==")
env = dict(os.environ, PYTHONIOENCODING="utf-8")
def tools(tmp):
    v = subprocess.run([sys.executable, os.path.join(tmp, "tools", "validate.py")], capture_output=True, text=True, encoding="utf-8", env=env)
    c = subprocess.run([sys.executable, os.path.join(tmp, "tools", "csv_to_json.py")], capture_output=True, text=True, encoding="utf-8", env=env)
    k = subprocess.run([sys.executable, os.path.join(tmp, "tools", "build_kaodui_index.py")], capture_output=True, text=True, encoding="utf-8", env=env)
    vm = json.load(open(os.path.join(tmp, "site", "data", "verify_marks.json"), encoding="utf-8")) if c.returncode == 0 else []
    unex = sum(int(m) for m in re.findall(r"抽不出\s+(\d+)", k.stdout))
    return v, c, vm, unex
vB, cB, vmB, unB = tools(TMPB)
vA, cA, vmA, unA = tools(TMPA)
print("   validate 改后：", (vA.stdout + vA.stderr).strip().splitlines()[-1] if (vA.stdout + vA.stderr).strip() else "", "｜exit", vA.returncode)
ck(vB.returncode == 0, "改前副本 validate 非 0")
ck(vA.returncode == 0, "改后副本 validate 非 0：" + vA.stdout + vA.stderr)
ck(cB.returncode == 0 and cA.returncode == 0, "副本 csv_to_json 失败：" + cA.stderr[-500:])
print(f"   verify_marks 改前 {len(vmB)} → 改后 {len(vmA)}")
ck(len(vmB) == VM_BEFORE, f"改前 verify_marks {len(vmB)} != {VM_BEFORE}")
for pid in IDS:
    for col in ("coord_basis", "description"):
        b = sum(1 for m in vmB if m["table"] == "places" and m["row_id"] == pid and m["col"] == col)
        a = sum(1 for m in vmA if m["table"] == "places" and m["row_id"] == pid and m["col"] == col)
        print(f"     {pid:<12}{col:<13} {b} → {a}")
others_B = sorted(json.dumps(m, ensure_ascii=False, sort_keys=True) for m in vmB if not (m["table"] == "places" and m["row_id"] in IDS))
others_A = sorted(json.dumps(m, ensure_ascii=False, sort_keys=True) for m in vmA if not (m["table"] == "places" and m["row_id"] in IDS))
ck(others_B == others_A, "三行以外之 verify_marks 记号有变")
hy_states = [s["name"] for m in vmA if m["table"] == "places" and m["row_id"] == "L_HENGYONG" for s in m.get("status", [])]
ck("未核" not in hy_states, f"verify_marks 衡雍「未核」状态仍在：{hy_states}")
ck(len(vmA) == 591, f"改后 verify_marks {len(vmA)} != 591（r61-J 586→591；r61-O 衡雍只销「未核」状态，记号数不变）")
print("   衡雍 coord_basis 记号（改后）：")
for m in vmA:
    if m["table"] == "places" and m["row_id"] == "L_HENGYONG":
        print("     ", {k: v for k, v in m.items() if k not in ("text", "context")})
print(f"   kaodui 抽不出：改前 {unB} → 改后 {unA}")
ck(unA <= unB, f"kaodui 抽不出增：{unB} → {unA}")

# ---------- 3. 本件断言 ----------
def check_all(M, FX):
    """M：合并后九表；FX：fixes 行。返回违例清单。"""
    V = []
    base = {r["id"]: r for r in main["places"]}
    fx = {r["id"]: r for r in FX}
    mp = {r["id"]: r for r in M["places"]}
    if [r["id"] for r in M["places"]] != [r["id"] for r in main["places"]]: V.append("places 行序／行数变")
    for r in main["places"]:
        if r["id"] not in IDS and mp.get(r["id"]) != r: V.append(f"places 他行 {r['id']} 被改")
    for t in TABLES:
        if t not in ("places", "events") and M[t] != main[t]: V.append(f"{t} 被改（本件只动 places 三行与 events 三行之 summary）")
    # r61-O：events 只许 E348–E350 之 summary 随改
    be = {r["id"]: r for r in main["events"]}; me = {r["id"]: r for r in M["events"]}
    if [r["id"] for r in M["events"]] != [r["id"] for r in main["events"]]: V.append("events 被改：行序／行数变")
    for r in main["events"]:
        if r["id"] not in EV_IDS and me.get(r["id"]) != r: V.append(f"events 被改：他行 {r['id']}")
    for eid in EV_IDS:
        o, n = be[eid], me.get(eid, {})
        for k in o:
            if k != "summary" and n.get(k) != o[k]: V.append(f"events 被改：{eid}.{k} 非 summary 而改")
        ns = n.get("summary", "")
        if EV_OLD in ns: V.append(f"{eid}.summary 改前之句仍在")
        if EV_NEW not in ns: V.append(f"{eid}.summary 改后之句不在")
        if ns.replace(EV_NEW, EV_OLD) != o["summary"]: V.append(f"{eid}.summary 今状句之外有改字")
    hb = fx.get("L_HENGYONG", {}).get("coord_basis", "")
    if HY_OLD in hb: V.append("衡雍 coord_basis「文公八年之注本件未核」仍在")
    for tok in HY_NEW_TOKS:
        if tok not in hb: V.append(f"衡雍 coord_basis 已核之述缺「{tok}」")
    for pid in IDS:
        if pid not in fx: V.append(f"{pid} 不在 fixes"); continue
        o, n = base[pid], fx[pid]
        if mp.get(pid) != n: V.append(f"{pid} 合并后非 fixes 行")
        for k in o:
            if k not in ALLOWED and n[k] != o[k]: V.append(f"{pid}.{k} 非所令之栏而改")
        for k in PREFIX_COLS:
            if not (n[k].startswith(o[k]) and len(n[k]) > len(o[k])): V.append(f"{pid}.{k} 旧文非新文之前缀（照留之证失）")
        lat, lng, x, y, st, ce, cc, ypage = EXPECT[pid]
        try:
            la, ln = float(n["lat"]), float(n["lng"])
            if not (29.5 <= la <= 38.5 and 105.0 <= ln <= 122.0): V.append(f"{pid} 坐标出覆盖范围")
            if (n["lat"], n["lng"]) != (lat, lng): V.append(f"{pid} 坐标 {n['lat']}／{n['lng']} 非所定")
            if xy(la, ln) != (x, y): V.append(f"{pid} 回校 {xy(la, ln)} != {(x, y)}")
            if f"x={xy(la, ln)[0]}、y={xy(la, ln)[1]}" not in n["coord_basis"]: V.append(f"{pid} coord_basis 所书 x／y 与公式回校不合")
        except ValueError:
            V.append(f"{pid} 坐标非数")
        if n["state"] != st: V.append(f"{pid}.state {n['state']} != {st}")
        if n["certainty"] != ce: V.append(f"{pid}.certainty {n['certainty']} != {ce}")
        if n["coord_certainty"] != cc: V.append(f"{pid}.coord_certainty {n['coord_certainty']} != {cc}")
        if not n["modern_location"] or "待纸本核" in n["modern_location"]: V.append(f"{pid}.modern_location 未改")
        addb = n["coord_basis"][len(o["coord_basis"]):]; addd = n["description"][len(o["description"]):]
        for tok in ("2026-10-12", ypage, "郑宋卫幅（页 24–25）", "B002", "B003", "自限解除", "推定之步", "非当日之判为误"):
            if tok not in addb: V.append(f"{pid}.coord_basis 加注缺「{tok}」")
        if "本轮无从核" not in n["coord_basis"]: V.append(f"{pid}.coord_basis 失「本轮无从核」原文")
        if "2026-10-12" not in addd or "§7 v1.29" not in addd: V.append(f"{pid}.description 加注缺日期或 §7 v1.29")
        for tok in MUST_DESC[pid]:
            if tok not in addd: V.append(f"{pid}.description 加注缺「{tok}」")
        for q in re.findall(r"「([^」]+)」", addb + addd):
            if norm(q) and norm(q) not in CORPUS: V.append(f"{pid} 引语「{q}」不见于回填表／底本／任务书／旧文")
    return V

print("== 3. 本件断言 ==")
V = check_all(merged, FIX)
for v in V: print("  违例：" + v)
ck(not V, f"本件断言违例 {len(V)} 条")

# ---------- 4. 按类反证 ----------
print("== 4. 按类反证（注入须红） ==")
NRED = RED_FAIL = 0
def inject(name, expect_sub, mut):
    global NRED, RED_FAIL
    M = copy.deepcopy(merged); FX = copy.deepcopy(FIX)
    mut(M, FX)
    fxm = {r["id"]: r for r in FX}
    M["places"] = [fxm.get(r["id"], r) if r["id"] in IDS else r for r in M["places"]]
    hits = [v for v in check_all(M, FX) if expect_sub in v]
    NRED += 1
    print(f"   [{'红' if hits else '未红'}] {name}")
    if not hits: RED_FAIL += 1
def fxr(FX, pid): return next(r for r in FX if r["id"] == pid)
inject("越栏改 ancient_name", "非所令之栏", lambda M, FX: fxr(FX, "L_HU").update(ancient_name="扈亭"))
inject("越栏改 source_ids", "非所令之栏", lambda M, FX: fxr(FX, "L_XINCHENG").update(source_ids="Z159;B003"))
inject("改动 description 旧文一字", "前缀", lambda M, FX: fxr(FX, "L_HU").update(description=fxr(FX, "L_HU")["description"].replace("經傳", "经传", 1).replace("经传无其属国之文", "经传无其属国之明文", 1)))
inject("删 coord_basis 旧文「本轮无从核」", "前缀", lambda M, FX: fxr(FX, "L_HENGYONG").update(coord_basis=fxr(FX, "L_HENGYONG")["coord_basis"].replace("**本轮无从核**——", "", 1)))
inject("坐标出覆盖范围", "覆盖范围", lambda M, FX: fxr(FX, "L_XINCHENG").update(lng="122.50"))
inject("坐标改而 coord_basis 之 x／y 未随", "回校", lambda M, FX: fxr(FX, "L_HU").update(lat="35.20"))
inject("新城 state 作郑（作废之取舍）", "state", lambda M, FX: fxr(FX, "L_XINCHENG").update(state="郑"))
inject("新城 certainty 升 high", "certainty", lambda M, FX: fxr(FX, "L_XINCHENG").update(certainty="high"))
inject("扈 coord_certainty 虚升 medium", "coord_certainty", lambda M, FX: fxr(FX, "L_HU").update(coord_certainty="medium"))
inject("杜撰引语", "引语", lambda M, FX: fxr(FX, "L_HENGYONG").update(description=fxr(FX, "L_HENGYONG")["description"] + "杨注又云「衡雍即今原阳县城」。"))
inject("扈失判定反转之注", "判定反转", lambda M, FX: fxr(FX, "L_HU").update(description=fxr(FX, "L_HU")["description"].replace("判定反转", "判定之改")))
inject("新城失「站长取杜注宋地说」", "站长取杜注宋地说", lambda M, FX: fxr(FX, "L_XINCHENG").update(description=fxr(FX, "L_XINCHENG")["description"].replace("站长取杜注宋地说", "站长取宋说")))
inject("加注缺杨注页码", "页 600", lambda M, FX: fxr(FX, "L_XINCHENG").update(coord_basis=fxr(FX, "L_XINCHENG")["coord_basis"].replace("页 600", "页六百")))
inject("误动 events（E350 落点）", "events 被改", lambda M, FX: next(r for r in M["events"] if r["id"] == "E350").update(place_id="L_QUWO"))
inject("误动 event_people（presence）", "event_people 被改", lambda M, FX: next(r for r in M["event_people"] if r["event_id"] == "E348").update(presence="相关"))
# r61-O 增反证
inject("E348 summary 留改前之句", "改前之句仍在", lambda M, FX: next(r for r in M["events"] if r["id"] == "E348").update(summary=next(r for r in main["events"] if r["id"] == "E348")["summary"]))
inject("E349 summary 今状句外多改一字", "今状句之外有改字", lambda M, FX: next(r for r in M["events"] if r["id"] == "E349").update(summary=next(r for r in M["events"] if r["id"] == "E349")["summary"].replace("盟于衡雍", "盟於衡雍", 1)))
inject("E350 越栏改 title", "非 summary 而改", lambda M, FX: next(r for r in M["events"] if r["id"] == "E350").update(title="同盟于新城"))
inject("误动 events 他行（E347）", "他行 E347", lambda M, FX: next(r for r in M["events"] if r["id"] == "E347").update(importance="5"))
inject("衡雍「未核」之句复留", "仍在", lambda M, FX: fxr(FX, "L_HENGYONG").update(coord_basis=fxr(FX, "L_HENGYONG")["coord_basis"] + "文公八年之注本件未核。"))
inject("衡雍已核之述缺页 565", "页 565", lambda M, FX: fxr(FX, "L_HENGYONG").update(coord_basis=fxr(FX, "L_HENGYONG")["coord_basis"].replace("页 565", "页五六五")))
inject("误动 places 他行（践土）", "他行", lambda M, FX: next(r for r in M["places"] if r["id"] == "L_JIANTU").update(lat="35.01"))

# ---------- 5. 赵盾三数 ----------
print("== 5. 赵盾三数（挂链／涉年／可落图之亲至地：有坐标｜候回填） ==")
def three(T, pid="P_ZHAODUN"):
    EVM = {r["id"]: r for r in T["events"]}; PLM = {r["id"]: r for r in T["places"]}
    rows = [r for r in T["event_people"] if r["person_id"] == pid]
    yrs = {EVM[r["event_id"]]["year_bce"] for r in rows}
    places = {EVM[r["event_id"]]["place_id"] for r in rows if r["presence"] in ("亲至", "") and EVM[r["event_id"]]["place_id"]}
    have = sorted(p for p in places if PLM[p]["lat"]); pend = sorted(p for p in places if not PLM[p]["lat"])
    return len(rows), len(yrs), have, pend
for tag, T in (("合入前", main), ("合入后", merged)):
    n, y, h, p = three(T)
    print(f"   {tag} P_ZHAODUN 挂链 {n}／涉年 {y}／地 有坐标 {len(h)} {h}｜候回填 {len(p)} {p}")
n, y, h, p = three(main); ck((n, y, len(h), len(p)) == ZD_BEFORE, f"合入前赵盾三数 {(n, y, h, p)} != {ZD_BEFORE}")
n, y, h, p = three(merged); ck((n, y, len(h), len(p)) == ZD_AFTER, f"合入后赵盾三数 {(n, y, h, p)} != {ZD_AFTER}")

print(f"\n合计：PASS {PASS}  FAIL {FAIL}  反证 {NRED} 条，未红 {RED_FAIL}")
if RED_FAIL: sys.exit(2)
sys.exit(1 if FAIL else 0)
