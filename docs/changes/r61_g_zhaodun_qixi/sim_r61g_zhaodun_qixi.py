# -*- coding: utf-8 -*-
"""
r61-G（赵盾补「有地之事」、祁奚补「举贤」）合并模拟 —— Sophia 备料，team/round61_prompts.md「Task for Sophia · r61-G」。
来源标记：Sophia，2026-10-11 EDT，会话 session_01QhJ4hbubq1BVsxd8kjBSRA。

用法（仓库根目录，★ 须在 r61-B 四线与本件俱未合入之前跑——以 data/csv/ 为「改前」，基线 HEAD c8b3b12）：
    python data/incoming/r61_g_zhaodun_qixi/sim_r61g_zhaodun_qixi.py

做什么：
  1. 复制 data/csv/ 与 tools/ 至临时目录；★ 依次叠 B1→B2→B3→B4（data/incoming/r61_jin_mingchen/b*/），再叠本件：
     各 *_new.csv append（本件另有 places_new.csv）；fixes_*.csv 按 id 整行替换，只许对「叠前一线之后之行」纯追加。
     本件之替换：Z135（主表行）；P_ZHAODUN（B1 替换行）、P_QIXIDAFU（B3 替换行）、P_JINDAOGONG（B4 新行）。
  2. 副本上跑 tools/validate.py、tools/csv_to_json.py、tools/build_kaodui_index.py（台账「抽不出」不得增）；
  3. 本件断言（check_all），正测须 0 违例；
  4. ★ 按类反证（裁一百一十四）：本批可能犯之错逐类注入副本，须当场红；任一未红 → exit 2；
  5. 引文比字：passages.quote_original 须为 diben/ 底本摘录（去繁简标记、剥高诱夹注；相连之行相接）之子串（「……」分段各比）；
     role_in_event、relations.source_note、events.summary、新人 notes 与替换行追加之文中「」内之片段，去标点后须见于底本。
  6. 末印赵盾、祁奚合入后之「挂链／涉年／可落图之亲至地（有坐标／坐标候回填）」。

所据：team/round61_prompts.md §三 裁二百一十六（亲至之准：事目有落点 → v1.42 全行适用；落点从阙 → 甲①②即足）、
      §七 裁二百一十九 ③⑤；docs/conventions.md §2 T 层纪律、§4／§5 地望与 coord_certainty、§7 从严通例与 v1.42 判例。

★ r61-I（2026-10-11 EDT，Sophia，会话 session_01QhJ4hbubq1BVsxd8kjBSRA）：依 team/round61_prompts.md §九 裁二百二十 三5、三6、三9——
  ① 新增 fixes_events.csv（E219 一行，只动 summary：「未立人物行」之列去伯华，书其今已立行）；断言逐栏比对只 summary 异、且其值即定稿之句；
  ② P_QIXIDAFU.active_years_bce 前552 → 前583-前552：本件 fixes_people 之「纯追加」唯此一栏例外（ALLOWED_REPLACE），值须恰为所定；
  ③ R386.source_note 书「晋侯即悼公，以在位之年定」，reliability 维持 high。三事俱有反证。

退出码：0 全过；1 有 FAIL；2 反证未红。临时目录可用环境变量 CHUNQIU_SIM_TMP 覆写。本脚本不属数据。
〔r61-E 入库注，Skipper，2026-10-11〕本脚本之入库副本（docs/changes/r61_g_zhaodun_qixi/，归档先于清空，吸取 r59_jin_zhizheng 之训）：HERE＝本脚本所在目录，其深度与 data/incoming/r61_g_zhaodun_qixi/ 同为 3，ROOT＝HERE/../../.. 即仓库根，原字自正。★ 但 BDIR（原字 ROOT/data/incoming/r61_jin_mingchen）指向 data/incoming/，该目录清空后即落空；复跑须先把 BDIR 一行改指 docs/changes/r61_jin_mingchen（只改此一行，不改断言），本注不代改，以守「除注外不改一字」。本脚本以 ROOT/data/csv/ 为改前（非 git 对象），欲复跑须令其为合入前之基线 c8b3b12（例：git archive c8b3b12 解出一份，再把 docs/changes/r61_jin_mingchen 与本目录放进其 docs/changes/ 下跑，exit 0）；于合入后之库上整跑，因所追加之 ID 已入主表而撞号、断言红，属其性质，非脚本之误。除本注外不改一字。
"""
import copy, csv, os, re, shutil, subprocess, sys, tempfile

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
csv.field_size_limit(10 ** 7)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
BDIR = os.path.join(ROOT, "data", "incoming", "r61_jin_mingchen")
PRIOR = [os.path.join(BDIR, d) for d in ("b1_zhaodun", "b2_an", "b3_xiagong", "b4_luanshu")]
CSV = os.path.join(ROOT, "data", "csv")
TMP = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_r61g")

TABLES = ["events", "passages", "sources", "people", "event_people", "relations",
          "places", "archaeology", "background", "office_tenures"]
NEW_B = {"events": "events_new.csv", "passages": "passages_new.csv", "sources": "sources_new.csv",
         "people": "people_new.csv", "event_people": "event_people_new.csv", "relations": "relations_new.csv"}
NEW = dict(NEW_B, places="places_new.csv")
FIX = {"sources": "fixes_sources.csv", "people": "fixes_people.csv"}
FIX_G = dict(FIX, events="fixes_events.csv")   # r61-I：本件另有 fixes_events.csv（B 四线无此文件）
# r61-I：替换行中「纯追加」之外许改之栏（只此一栏；裁二百二十 三9）
ALLOWED_REPLACE = {("people", "P_QIXIDAFU", "active_years_bce"): "前583-前552"}
# r61-I：fixes_events 之 E219 只动 summary（裁二百二十 三5）
E219_OLD = "范宣子（士匄）、乐王鲋、晋平公、羊舌虎、伯华（羊舌赤）、籍偃、叔向之母受本件配角配额所限未立人物行，其名见各引文。"
E219_NEW = "范宣子（士匄）、乐王鲋、晋平公、羊舌虎、籍偃、叔向之母受本件配角配额所限未立人物行，其名见各引文；伯华（羊舌赤）今已立人物行。"
R386_NOTE = "晋侯即悼公，以在位之年定"
BEFORE = {"events": 281, "passages": 531, "sources": 217, "people": 186, "event_people": 735,
          "relations": 309, "places": 104, "archaeology": 8, "background": 11, "office_tenures": 16}
ADD_B = {"events": 29, "passages": 89, "sources": 10, "people": 36, "event_people": 127, "relations": 56}   # README_B 四线合计
ADD_G = {"events": 4, "passages": 8, "sources": 4, "people": 3, "event_people": 9, "relations": 4, "places": 3}
TAIL = {"E": 347, "Q": 637, "R": 382, "Z": 157, "T": 10}   # 叠 B1–B4 之后
RETIRED = {"E005", "E006", "Z098"}
KAODUI_UNEXTRACTED_BEFORE = 1   # c8b3b12 实跑 1（Q427 旧账）；叠 B1–B4 后仍 1
PRESENCE_EXPECT = {"亲至": 5, "相关": 4}

# 人名之字（定「其人之文」）与地名之字（定「地之明文」）
NAME_TOK = {"P_ZHAODUN": ["趙盾", "趙孟", "宣子"], "P_QIXIDAFU": ["祁奚"], "P_JINDAOGONG": ["晉侯"],
            "P_QIWU": ["午"], "P_YANGSHECHI": ["赤", "伯華"], "P_XIEHU": ["解狐"]}
PLACE_TOK = {"L_HU": "扈", "L_HENGYONG": "衡雍", "L_XINCHENG": "新城"}
NEW_PLACES = set(PLACE_TOK)
# 受事者（被举、受任、被称、被囚）——不立亲至，除非入白名单（本件白名单空）
RECEIVERS = {("E351", "P_QIWU"), ("E351", "P_YANGSHECHI"), ("E351", "P_XIEHU"), ("E219", "P_YANGSHECHI")}
RECEIVER_OK = {}
DISP = re.compile(r"殺|弒|討|執|滅|伐|攻|立|逐|劫|帥|使|放|斬|戮|舉|稱")
BODY = re.compile(r"曰|對|問|拜|稽首|趨|射|奉|盥|撫|登|扶|觸|御|為右|以戈|搏|鬥|見|言於|言于|告|奔|朝于|朝於")
FUT = re.compile(r"[將欲](?:立|攻|斬|謀|殺|戮|救|伐|朝)[^。，、；．]*")
SHUI_RE = re.compile(r"外舉不避|內舉不避|不避讎|不避子")
EXEMPT = {"相关", "亲至", "不在"}

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
PUNCT = re.compile(r"[「」『』，。：；、？！\s（）‧．︰…]")
def norm(s): return PUNCT.sub("", s)

def diben():
    out = {}
    d = os.path.join(HERE, "diben")
    for fn in os.listdir(d):
        prev, parts = None, []
        for l in open(os.path.join(d, fn), encoding="utf-8").read().split("\n"):
            if not l.startswith("L"): continue
            n, s = l.split("\t", 1)
            n = int(n[1:])
            s = re.sub(r"-\{(.*?)\}-", r"\1", s)
            s = re.sub(r"\{\{\*\|[^}]*\}\}", "", s).replace("<br>", "")
            s = re.sub(r"\{\{SK anchor\|([^}]*)\}\}", r"\1", s)
            parts.append(("" if prev is not None and n == prev + 1 else "\n") + s)
            prev = n
        out[fn] = "".join(parts)
    return out
DIBEN = diben()
ALLN = norm("\n".join(DIBEN.values()))
SRC_DIBEN = {"Z135": "zuo_wengong.txt", "Z158": "zuo_wengong.txt", "Z159": "zuo_wengong.txt",
             "Z160": "zuo_xianggong.txt", "T011": "lscq_mengchun.txt"}

def quoted(s):
    return re.findall(r"「([^」]+)」", s)

# ---------- 0. 表头与卫生 ----------
print("== 0. 表头与文件卫生 ==")
for t, fn in list(NEW.items()) + list(FIX_G.items()):
    ck(hdr(os.path.join(CSV, t + ".csv")) == hdr(os.path.join(HERE, fn)), f"{fn} 表头与主表不同")
    for r in rd(os.path.join(HERE, fn)):
        for k, v in r.items():
            ck(v is not None and "\n" not in v and "\t" not in v, f"{fn} 栏 {k} 含换行／制表符")
            ck(not k.lower().startswith("novel"), f"{fn} 含 novel* 列")

# ---------- 1. 合并（B1 → B2 → B3 → B4 → G） ----------
print("== 1. 合并模拟（叠 B1 → B2 → B3 → B4 → r61-G） ==")
if os.path.isdir(TMP): shutil.rmtree(TMP)
simcsv = os.path.join(TMP, "data", "csv"); os.makedirs(simcsv)
for t in TABLES: shutil.copy(os.path.join(CSV, t + ".csv"), os.path.join(simcsv, t + ".csv"))
main = {t: rd(os.path.join(CSV, t + ".csv")) for t in TABLES}
FIX_BASE = {}
def apply(d, tag, new_map, fix_map=FIX):
    for t, fn in new_map.items():
        with open(os.path.join(simcsv, t + ".csv"), "a", encoding="utf-8", newline="") as f:
            csv.DictWriter(f, fieldnames=hdr(os.path.join(CSV, t + ".csv")), lineterminator="\n").writerows(rd(os.path.join(d, fn)))
    for t, fn in fix_map.items():
        repl = {r["id"]: r for r in rd(os.path.join(d, fn))}
        cur = rd(os.path.join(simcsv, t + ".csv")); hit = 0
        for i, r in enumerate(cur):
            if r["id"] in repl:
                new = repl[r["id"]]
                for k in r:
                    if t == "events": continue          # fixes_events 另验：只动 summary（见下 ck 与 check_all）
                    if tag == "G" and (t, r["id"], k) in ALLOWED_REPLACE:
                        ck(new[k] == ALLOWED_REPLACE[(t, r["id"], k)], f"{tag} {fn} {r['id']}.{k} 例外栏之值非所定：{new[k]}")
                        continue
                    ck(new[k] == r[k] or new[k].startswith(r[k]), f"{tag} {fn} {r['id']}.{k} 非纯追加")
                if tag == "G": FIX_BASE[r["id"]] = dict(r)
                cur[i] = new; hit += 1
        ck(hit == len(repl), f"{tag} {fn} 替换命中 {hit} != {len(repl)}")
        with open(os.path.join(simcsv, t + ".csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=hdr(os.path.join(CSV, t + ".csv")), lineterminator="\n")
            w.writeheader(); w.writerows(cur)
for d, tag in zip(PRIOR, ("B1", "B2", "B3", "B4")):
    apply(d, tag, NEW_B)
afterB = {t: rd(os.path.join(simcsv, t + ".csv")) for t in TABLES}
apply(HERE, "G", NEW, FIX_G)
shutil.copytree(os.path.join(ROOT, "tools"), os.path.join(TMP, "tools"), ignore=shutil.ignore_patterns("node_modules", "__pycache__"))
os.makedirs(os.path.join(TMP, "site", "data")); os.makedirs(os.path.join(TMP, "docs"))
merged = {t: rd(os.path.join(simcsv, t + ".csv")) for t in TABLES}
print("   临时副本：" + TMP)

# ---------- 2. 行数 ----------
print("== 2. 逐表行数（改前／叠B1–B4／叠G／应得） ==")
for t in TABLES:
    expB = BEFORE[t] + ADD_B.get(t, 0)
    exp = expB + ADD_G.get(t, 0)
    print(f"   {t:<15}{BEFORE[t]:>6}{len(afterB[t]):>6}{len(merged[t]):>6}{exp:>6}")
    ck(len(main[t]) == BEFORE[t], f"{t} 主表基线 {len(main[t])} != {BEFORE[t]}（须于 B1–B4、本件合入前跑）")
    ck(len(afterB[t]) == expB, f"{t} 叠 B1–B4 后 {len(afterB[t])} != {expB}")
    ck(len(merged[t]) == exp, f"{t} 合入后 {len(merged[t])} != {exp}")
for t in ("archaeology", "background", "office_tenures"):
    ck(merged[t] == main[t], f"{t} 被改动（本件不动）")
for t in ("passages", "event_people", "relations", "places"):
    ck(merged[t][:len(afterB[t])] == afterB[t], f"既有 {t} 行被改动（本件于此表只 append）")
# r61-I：events 既有行除 E219 外不动；E219 逐栏比对只 summary 异，且其值为定稿之句
for a, b in zip(afterB["events"], merged["events"][:len(afterB["events"])]):
    if a["id"] != "E219":
        ck(a == b, f"既有 events {a['id']} 被改动（本件于 events 只 append 及 E219.summary）")
    else:
        diff = [k for k in a if a[k] != b[k]]
        print("   E219 逐栏 diff：", diff)
        ck(diff == ["summary"], f"E219 所改之栏 {diff} != ['summary']")
        ck(a["summary"].count(E219_OLD) == 1 and b["summary"] == a["summary"].replace(E219_OLD, E219_NEW), "E219.summary 非定稿之句")
qx = next(r for r in merged["people"] if r["id"] == "P_QIXIDAFU")
ck(qx["active_years_bce"] == "前583-前552", f"P_QIXIDAFU.active_years_bce {qx['active_years_bce']}")
r386 = next(r for r in merged["relations"] if r["id"] == "R386")
ck(R386_NOTE in r386["source_note"] and r386["reliability"] == "high", f"R386 note／reliability：{r386['source_note']}／{r386['reliability']}")

# ---------- 3. 副本跑三工具 ----------
print("== 3. 副本上跑 validate／csv_to_json／kaodui ==")
env = dict(os.environ, PYTHONIOENCODING="utf-8")
v = subprocess.run([sys.executable, os.path.join(TMP, "tools", "validate.py")], capture_output=True, text=True, encoding="utf-8", env=env)
print("   validate:", (v.stdout + v.stderr).strip().splitlines()[-1] if (v.stdout + v.stderr).strip() else "")
ck(v.returncode == 0, "副本 validate 非 0：" + v.stdout + v.stderr)
c = subprocess.run([sys.executable, os.path.join(TMP, "tools", "csv_to_json.py")], capture_output=True, text=True, encoding="utf-8", env=env)
ck(c.returncode == 0, "副本 csv_to_json 失败：" + c.stderr[-500:])
for line in c.stdout.splitlines():
    if "verify_marks" in line or "kaodui" in line: print("   " + line)
k = subprocess.run([sys.executable, os.path.join(TMP, "tools", "build_kaodui_index.py")], capture_output=True, text=True, encoding="utf-8", env=env)
unex = sum(int(m) for m in re.findall(r"抽不出\s+(\d+)", k.stdout))
print("   kaodui 抽不出合计：", unex)
ck(unex == KAODUI_UNEXTRACTED_BEFORE, f"kaodui 抽不出 {unex} != 基线 {KAODUI_UNEXTRACTED_BEFORE}（新写法逸出 21 档词表）")

# ---------- 4. 本件断言 ----------
IDS_USED = {}
for line in open(os.path.join(HERE, "ids_used.txt"), encoding="utf-8"):
    if line.strip() and not line.startswith("#"):
        a, b = line.rstrip("\n").split("\t"); IDS_USED.setdefault(a, []).append(b)
PRIOR_IDS = set()
for d in PRIOR:
    for line in open(os.path.join(d, "ids_used.txt"), encoding="utf-8"):
        if line.strip() and not line.startswith("#"):
            PRIOR_IDS.add(line.rstrip("\n").split("\t")[1])

V_KEYS = ["ID接续", "退役号", "ids_used对账", "外键", "比字", "注中引文须见底本", "T层不作原文", "T层层标", "T层来源行自记",
          "T层不立事目", "新人须有经传立人之据", "外举不避讎不作左传原文", "亲至须引同目经传之文",
          "落点实有之亲至须有地之明文及其身", "落点从阙之亲至须有甲①②之文", "受事者不立亲至", "处置／兵事之词单用不立亲至",
          "将然之辞不立亲至", "新地坐标候纸本回填", "新地 coord_basis 自限", "新人二级", "不改既有一级", "每人俱挂其篇",
          "正向包含", "每事有经传骨架", "二叙相违须互指", "后出层之称不入 alt_names",
          "fixes_events 只动 summary", "替换行例外栏只此一处", "今状之述随改", "R386 以在位之年定"]

def check_all(T, N, FX):
    V = {kk: [] for kk in V_KEYS}
    def bad(name, msg): V.setdefault(name, []).append(msg)
    main_ids = {t: {r["id"] for r in afterB[t]} for t in ("events", "passages", "sources", "people", "relations", "places")}
    def seq(ids, pre, start):
        return [int(i[len(pre):]) for i in ids] == list(range(start + 1, start + 1 + len(ids)))
    if not seq([r["id"] for r in N["events"]], "E", TAIL["E"]): bad("ID接续", "events 非接 B4 尾号连号")
    if not seq([r["id"] for r in N["passages"]], "Q", TAIL["Q"]): bad("ID接续", "passages 非接 B4 尾号连号")
    if not seq([r["id"] for r in N["relations"]], "R", TAIL["R"]): bad("ID接续", "relations 非接 B4 尾号连号")
    for p in ("Z", "T"):
        if not seq([r["id"] for r in N["sources"] if r["id"][0] == p], p, TAIL[p]): bad("ID接续", f"sources {p} 非接尾号")
    for t in ("events", "passages", "sources", "people", "relations", "places"):
        for r in N[t]:
            if r["id"] in main_ids[t] or r["id"] in PRIOR_IDS: bad("ID接续", f"{t} {r['id']} 与既有或 B 线撞号")
            if r["id"] in RETIRED: bad("退役号", r["id"])
        if sorted(IDS_USED.get(t, [])) != sorted(r["id"] for r in N[t]): bad("ids_used对账", f"{t}：ids_used.txt 与实件不符")
    PID = {r["id"] for r in T["people"]}; EID = {r["id"] for r in T["events"]}; SID = {r["id"] for r in T["sources"]}
    LID = {r["id"] for r in T["places"]}
    ev = {r["id"]: r for r in T["events"]}
    for r in N["events"]:
        if r["place_id"] and r["place_id"] not in LID: bad("外键", f"{r['id']}.place_id {r['place_id']}")
    for r in N["event_people"]:
        if r["event_id"] not in EID or r["person_id"] not in PID: bad("外键", f"{r['event_id']}/{r['person_id']}")
    for r in N["relations"]:
        if r["person_a"] not in PID or r["person_b"] not in PID: bad("外键", r["id"])
    for r in N["passages"]:
        if r["event_id"] not in EID or r["source_id"] not in SID: bad("外键", r["id"]); continue
        fn = SRC_DIBEN.get(r["source_id"])
        if not fn: bad("比字", f"{r['id']} 来源无底本摘录")
        else:
            for seg in r["quote_original"].split("……"):
                if seg not in DIBEN[fn]: bad("比字", f"{r['id']} 引文与底本不合：{seg[:20]}…")
        if r["source_id"] not in ev[r["event_id"]]["source_ids"].split(";"): bad("正向包含", r["id"])
        if r["source_id"][0] == "T":
            if r["quote_type"] != "经义异闻": bad("T层不作原文", r["id"])
            if not r["modern_note"].startswith("【先秦诸子"): bad("T层层标", r["id"])
            if re.search(r"相抵|之异", r["modern_note"]) and r["id"] not in ev[r["event_id"]]["summary"]: bad("二叙相违须互指", r["id"])
        if r["source_id"][0] in "ZGSYL" and SHUI_RE.search(r["quote_original"]):
            bad("外举不避讎不作左传原文", f"{r['id']} 经传层引文含「不避」之语")
    for r in N["sources"]:
        if r["id"][0] == "T":
            if "【成书之世】" not in r["notes"] or "【去所记之事之距】" not in r["notes"]: bad("T层来源行自记", r["id"])
    # 叙述中以「外舉不避讎」为《左传》之文
    narr = [(r["id"], r["title"] + r["summary"]) for r in N["events"]] + [(r["id"], r["notes"] + r["short_bio"] + r["relations"]) for r in N["people"]] + \
           [(r["id"], r["notes"]) for r in N["sources"]] + [(r["id"], r["modern_note"]) for r in N["passages"]] + \
           [(r["id"], r["notes"][len(FIX_BASE.get(r["id"], {}).get("notes", "")):]) for r in FX["people"] + FX["sources"]]
    for i, s in narr:
        if re.search(r"《左传[^》]*》[^。；」]{0,6}「(外舉不避|內舉不避)", s) or re.search(r"左传[^。]{0,8}原文[^。]{0,6}「外舉不避", s):
            bad("外举不避讎不作左传原文", i)
    # 注中「」片段须见于底本
    pieces = [(f"{r['event_id']}/{r['person_id']}", r["role_in_event"]) for r in N["event_people"]] + \
             [(r["id"], r["source_note"]) for r in N["relations"]] + [(r["id"], r["summary"]) for r in N["events"]] + \
             [(r["id"], r["notes"]) for r in N["people"]] + [(r["id"], r["description"]) for r in N["places"]] + \
             [(r["id"], r[col][len(FIX_BASE.get(r["id"], {}).get(col, "")):]) for r in FX["people"] for col in ("notes", "relations")]
    for i, s in pieces:
        for f in quoted(s):
            if f in EXEMPT or len(norm(f)) < 2: continue
            if norm(f) not in ALLN: bad("注中引文须见底本", f"{i}「{f[:16]}」")
    # 每事有 Z 骨架；T 不单立
    for r in N["events"]:
        zs = [p for p in T["passages"] if p["event_id"] == r["id"] and p["source_id"][0] == "Z"]
        if not zs: bad("T层不立事目", r["id"]); bad("每事有经传骨架", r["id"])
        if r["reliability"] != "high": bad("每事有经传骨架", r["id"] + " reliability")
    for r in N["people"]:
        if "《左传" not in r["notes"]: bad("新人须有经传立人之据", r["id"])
        if r["is_protagonist"] != "0": bad("新人二级", r["id"])
        if not any(x["person_id"] == r["id"] for x in N["event_people"]): bad("每人俱挂其篇", r["id"])
    for r in FX["people"]:
        base = FIX_BASE.get(r["id"])
        if base and r["is_protagonist"] != base["is_protagonist"]: bad("不改既有一级", r["id"])
    for r in N["people"] + FX["people"]:
        if re.search(r"黃羊|黄羊", r["alt_names"]): bad("后出层之称不入 alt_names", r["id"])
    # r61-I（裁二百二十 三5、三6、三9）
    for r in FX.get("events", []):
        base = FIX_BASE.get(r["id"])
        if not base: bad("fixes_events 只动 summary", f"{r['id']} 无底行"); continue
        diff = [k for k in base if base[k] != r[k]]
        if diff != ["summary"]: bad("fixes_events 只动 summary", f"{r['id']} 所改之栏 {diff}")
        # 「未立人物行」之句，不得仍列已立行之羊舌赤（伯华）
        if any(x["id"] == "P_YANGSHECHI" for x in T["people"]):
            for sent in re.split(r"[。；]", r["summary"]):
                if "未立人物行" in sent and re.search(r"伯[华華]|羊舌赤", sent.split("未立人物行")[0]):
                    bad("今状之述随改", f"{r['id']}：已立行之伯华（羊舌赤）仍列未立")
    for t, rows in FX.items():
        for r in rows:
            base = FIX_BASE.get(r["id"])
            if not base or t == "events": continue
            for k in base:
                if r[k] != base[k] and not r[k].startswith(base[k]) and (t, r["id"], k) not in ALLOWED_REPLACE:
                    bad("替换行例外栏只此一处", f"{t} {r['id']}.{k}")
                if (t, r["id"], k) in ALLOWED_REPLACE and r[k] != ALLOWED_REPLACE[(t, r["id"], k)]:
                    bad("替换行例外栏只此一处", f"{t} {r['id']}.{k} 值 {r[k]}")
    for r in N["relations"]:
        if r["id"] == "R386" and (R386_NOTE not in r["source_note"] or r["reliability"] != "high"):
            bad("R386 以在位之年定", r["source_note"])
    # presence
    zpool = {}
    for p in T["passages"]:
        if p["source_id"][0] in "ZG": zpool.setdefault(p["event_id"], []).append(norm(p["quote_original"]))
    for r in N["event_people"]:
        k = (r["event_id"], r["person_id"]); e = ev[r["event_id"]]
        frags = [f for f in quoted(r["role_in_event"]) if len(norm(f)) >= 2]
        pool = zpool.get(r["event_id"], [])
        if r["presence"] not in ("亲至", ""): continue
        if not frags or not all(any(norm(f) in p for p in pool) for f in frags):
            bad("亲至须引同目经传之文", f"{k}")
        toks = NAME_TOK.get(r["person_id"], [])
        if e["place_id"]:
            ptok = PLACE_TOK.get(e["place_id"]) or next((x["ancient_name"][:1] for x in T["places"] if x["id"] == e["place_id"]), "")
            if not any(ptok and ptok in f and any(t in f for t in toks) and any(norm(f) in p for p in pool) for f in frags):
                bad("落点实有之亲至须有地之明文及其身", f"{k}（落点 {e['place_id']}）")
        else:
            if not any(BODY.search(f) for f in frags):
                bad("落点从阙之亲至须有甲①②之文", f"{k}")
        if k in RECEIVERS and k not in RECEIVER_OK: bad("受事者不立亲至", f"{k}")
        if any(DISP.search(f) for f in frags) and not any(BODY.search(f) or (e["place_id"] and PLACE_TOK.get(e["place_id"], "") in f) for f in frags):
            bad("处置／兵事之词单用不立亲至", f"{k}")
        if any(FUT.search(f) for f in frags):
            rest = [FUT.sub("", f) for f in frags]
            if not any(BODY.search(f) for f in rest if norm(f)): bad("将然之辞不立亲至", f"{k}")
    # 新地：坐标候纸本回填
    for r in N["places"]:
        if r["lat"] or r["lng"] or r["coord_certainty"]: bad("新地坐标候纸本回填", f"{r['id']} 坐标或 coord_certainty 非空")
        if "本轮无从核" not in r["coord_basis"] or "不据以取点" not in r["coord_basis"]: bad("新地 coord_basis 自限", r["id"])
        if r["certainty"] != "low": bad("新地 coord_basis 自限", f"{r['id']} certainty 非 low")
    return V

N0 = {t: rd(os.path.join(HERE, fn)) for t, fn in NEW.items()}
FX0 = {t: rd(os.path.join(HERE, fn)) for t, fn in FIX_G.items()}
print("== 4. 本件断言（正测） ==")
V0 = check_all(merged, N0, FX0)
for kk, vv in V0.items():
    ck(not vv, f"[{kk}] {vv}")
    print(f"   {kk:<26} 违例 {len(vv)}")
pres = {}
for r in N0["event_people"]: pres[r["presence"]] = pres.get(r["presence"], 0) + 1
print("   presence 分布：", pres)
ck(pres == PRESENCE_EXPECT, f"presence 分布变动：{pres}")

# ---------- 5. 按类反证 ----------
print("== 5. 按类反证（注入本批可能犯之错，须红） ==")
RED_FAIL = 0; NRED = 0
def inject(name, cls, fn):
    global RED_FAIL, NRED
    NRED += 1
    T = copy.deepcopy(merged); N = copy.deepcopy(N0); FX = copy.deepcopy(FX0)
    fn(T, N, FX)
    for t in N:
        key = (lambda r: (r["event_id"], r["person_id"])) if t == "event_people" else (lambda r: r["id"])
        nk = {key(r): r for r in N[t]}
        T[t] = [nk.get(key(r), r) for r in T[t]]
        have = {key(r) for r in T[t]}
        T[t] += [r for r in N[t] if key(r) not in have]
    for t in FX:
        fk = {r["id"]: r for r in FX[t]}
        T[t] = [fk.get(r["id"], r) for r in T[t]]
    V = check_all(T, N, FX)
    red = bool(V.get(cls))
    print(f"   {'红' if red else '★未红'}  {name}  → [{cls}] {V.get(cls, [])[:2]}")
    if not red: RED_FAIL += 1

def ep(N, e, p): return next(r for r in N["event_people"] if r["event_id"] == e and r["person_id"] == p)
def ps(N, i): return next(r for r in N["passages"] if r["id"] == i)
def evn(N, i): return next(r for r in N["events"] if r["id"] == i)
def pl(N, i): return next(r for r in N["places"] if r["id"] == i)
def so(N, i): return next(r for r in N["sources"] if r["id"] == i)

inject("以职推亲至：赵盾于扈之盟只书其职", "亲至须引同目经传之文",
       lambda T, N, FX: ep(N, "E348", "P_ZHAODUN").update(role_in_event="晋中军将，主盟"))
inject("落点实有而只引其名、无地之文（v1.42）：赵盾于新城只引「晉趙盾」", "落点实有之亲至须有地之明文及其身",
       lambda T, N, FX: ep(N, "E350", "P_ZHAODUN").update(role_in_event="「晉趙盾」与盟"))
inject("落点实有而只引地、无其人之文：赵盾于扈只引「盟于扈」", "落点实有之亲至须有地之明文及其身",
       lambda T, N, FX: ep(N, "E348", "P_ZHAODUN").update(role_in_event="「盟于扈」"))
inject("亲至改引他目之文：新城之目引衡雍之经", "亲至须引同目经传之文",
       lambda T, N, FX: ep(N, "E350", "P_ZHAODUN").update(role_in_event="「公子遂會晉趙盾，盟于衡雍」"))
inject("坐标凭印象补：扈填 34.90／113.60", "新地坐标候纸本回填",
       lambda T, N, FX: pl(N, "L_HU").update(lat="34.90", lng="113.60", coord_certainty="low"))
inject("坐标凭电子本补：衡雍只填 coord_certainty", "新地坐标候纸本回填",
       lambda T, N, FX: pl(N, "L_HENGYONG").update(coord_certainty="medium"))
inject("coord_basis 去其自限之语", "新地 coord_basis 自限",
       lambda T, N, FX: pl(N, "L_XINCHENG").update(coord_basis="据杜预《春秋释例》梁國榖熟縣西取点"))
inject("新地 certainty 虚升 medium", "新地 coord_basis 自限",
       lambda T, N, FX: pl(N, "L_HU").update(certainty="medium"))
inject("T 层作原文：Q645 quote_type 改「原文」", "T层不作原文",
       lambda T, N, FX: ps(N, "Q645").update(quote_type="原文"))
inject("T 层缺层标：Q645 去其【先秦诸子…】首段", "T层层标",
       lambda T, N, FX: ps(N, "Q645").update(modern_note=ps(N, "Q645")["modern_note"].split("】", 1)[1]))
inject("T 层来源行缺成书之世", "T层来源行自记",
       lambda T, N, FX: so(N, "T011").update(notes=so(N, "T011")["notes"].replace("【成书之世】", "【成书】")))
inject("「外舉不避讎」作《左传》原文：Q645 改挂 Z160", "外举不避讎不作左传原文",
       lambda T, N, FX: ps(N, "Q645").update(source_id="Z160"))
inject("叙述以「外舉不避讎」为《左传》之文：E351 summary 改书", "外举不避讎不作左传原文",
       lambda T, N, FX: evn(N, "E351").update(summary=evn(N, "E351")["summary"] + "《左传·襄公三年》「外舉不避讎，內舉不避子」。"))
inject("替换行追加以「外舉不避讎」为《左传》之文：P_QIXIDAFU notes", "外举不避讎不作左传原文",
       lambda T, N, FX: next(r for r in FX["people"] if r["id"] == "P_QIXIDAFU").update(
           notes=next(r for r in FX["people"] if r["id"] == "P_QIXIDAFU")["notes"] + "《左传》「外舉不避讎」。"))
inject("T 层单立事目：Q644 改挂 E350，E351 只余 T 层", "T层不立事目",
       lambda T, N, FX: ps(N, "Q644").update(event_id="E350"))
inject("T 层立人：新立祁黄羊一人，立人之据只《吕氏春秋》", "新人须有经传立人之据",
       lambda T, N, FX: (N["people"].append(dict(N["people"][0], id="P_QIHUANGYANG", name="祁黄羊", notes="《吕氏春秋·去私》晋平公问之")),
                         N["event_people"].append(dict(event_id="E351", person_id="P_QIHUANGYANG", role_in_event="后出层", directness="indirect", presence="相关"))))
inject("后出层之称入 alt_names：P_QIXIDAFU 加「祁黄羊」", "后出层之称不入 alt_names",
       lambda T, N, FX: next(r for r in FX["people"] if r["id"] == "P_QIXIDAFU").update(
           alt_names=next(r for r in FX["people"] if r["id"] == "P_QIXIDAFU")["alt_names"] + ";祁黄羊"))
inject("引文误字：Q644「讎」误作「仇」", "比字",
       lambda T, N, FX: ps(N, "Q644").update(quote_original=ps(N, "Q644")["quote_original"].replace("讎", "仇", 1)))
inject("引文混入高诱注：Q645 末补「黃羊，晉大夫祁奚之字。」", "比字",
       lambda T, N, FX: ps(N, "Q645").update(quote_original=ps(N, "Q645")["quote_original"] + "黃羊，晉大夫祁奚之字。"))
inject("注中引文不见底本：祁午 role 改引「祁午為中軍尉，佐中行」", "注中引文须见底本",
       lambda T, N, FX: ep(N, "E351", "P_QIWU").update(role_in_event="「祁午為中軍尉，佐中行」"))
inject("撞号：新事目改用 B4 之 E347", "ID接续",
       lambda T, N, FX: evn(N, "E348").update(id="E347"))
inject("用退役号：Z158 改 Z098", "退役号",
       lambda T, N, FX: so(N, "Z158").update(id="Z098"))
inject("ids_used.txt 漏登：新增一地而清单无之", "ids_used对账",
       lambda T, N, FX: N["places"].append(dict(N["places"][0], id="L_HUTING")))
inject("新人入一级：祁午 is_protagonist=1", "新人二级",
       lambda T, N, FX: next(r for r in N["people"] if r["id"] == "P_QIWU").update(is_protagonist="1"))
inject("越界改既有一级：P_QIXIDAFU 0→1（升降系 r61-H 之事）", "不改既有一级",
       lambda T, N, FX: next(r for r in FX["people"] if r["id"] == "P_QIXIDAFU").update(is_protagonist="1"))
inject("立人不挂篇：删解狐唯一挂链", "每人俱挂其篇",
       lambda T, N, FX: N.update(event_people=[r for r in N["event_people"] if r["person_id"] != "P_XIEHU"]))
inject("正向包含断：E351 source_ids 去 T011 而 Q645 仍挂之", "正向包含",
       lambda T, N, FX: evn(N, "E351").update(source_ids="Z160"))
inject("外键：E348 place_id 指不存在之地", "外键",
       lambda T, N, FX: evn(N, "E348").update(place_id="L_HUX"))
inject("二叙相违只注一侧：E351 summary 去其对 Q645 之指", "二叙相违须互指",
       lambda T, N, FX: evn(N, "E351").update(summary=evn(N, "E351")["summary"].replace("（`Q645`，先秦诸子说理层）", "")))
inject("受事者标亲至：祁午（被举、受任）改亲至", "受事者不立亲至",
       lambda T, N, FX: ep(N, "E351", "P_QIWU").update(presence="亲至"))
inject("处置之词单用立亲至：晋悼公只据「使祁午為中軍尉」", "处置／兵事之词单用不立亲至",
       lambda T, N, FX: ep(N, "E351", "P_JINDAOGONG").update(role_in_event="「使祁午為中軍尉」"))
inject("落点从阙之目只有请老、无对言：祁奚只引「祁奚請老」", "落点从阙之亲至须有甲①②之文",
       lambda T, N, FX: ep(N, "E351", "P_QIXIDAFU").update(role_in_event="「祁奚請老」"))
inject("将然之辞立亲至：解狐只据「將立之而卒」", "将然之辞不立亲至",
       lambda T, N, FX: ep(N, "E351", "P_XIEHU").update(presence="亲至", role_in_event="「將立之而卒」"))
# r61-I 反证
inject("fixes_events 越栏：E219 并改 place_id", "fixes_events 只动 summary",
       lambda T, N, FX: FX["events"][0].update(place_id="L_JIANG"))
inject("fixes_events 越栏：E219 并改 title", "fixes_events 只动 summary",
       lambda T, N, FX: FX["events"][0].update(title=FX["events"][0]["title"] + "（改）"))
inject("今状之述未随改：E219.summary 复列伯华（羊舌赤）于未立人物行", "今状之述随改",
       lambda T, N, FX: FX["events"][0].update(summary=FX["events"][0]["summary"].replace(E219_NEW, E219_OLD)))
inject("例外栏之值误：P_QIXIDAFU.active_years_bce 书「前583–前552」（分隔符异于库）", "替换行例外栏只此一处",
       lambda T, N, FX: next(r for r in FX["people"] if r["id"] == "P_QIXIDAFU").update(active_years_bce="前583–前552"))
inject("例外栏外再改：P_QIXIDAFU.role 换写（非纯追加）", "替换行例外栏只此一处",
       lambda T, N, FX: next(r for r in FX["people"] if r["id"] == "P_QIXIDAFU").update(role="晋大夫"))
inject("R386 复书「以年推」", "R386 以在位之年定",
       lambda T, N, FX: next(r for r in N["relations"] if r["id"] == "R386").update(source_note=next(r for r in N["relations"] if r["id"] == "R386")["source_note"].replace("晋侯即悼公，以在位之年定", "晋侯以年推为悼公")))
inject("R386 降 medium", "R386 以在位之年定",
       lambda T, N, FX: next(r for r in N["relations"] if r["id"] == "R386").update(reliability="medium"))

# ---------- 6. 赵盾、祁奚合入后三数 ----------
print("== 6. 合入后三数（挂链／涉年／可落图之亲至地：有坐标｜坐标候回填） ==")
EVM = {r["id"]: r for r in merged["events"]}; PLM = {r["id"]: r for r in merged["places"]}
def three(T_ep, pid):
    rows = [r for r in T_ep if r["person_id"] == pid]
    yrs = {EVM[r["event_id"]]["year_bce"] for r in rows}
    places = {EVM[r["event_id"]]["place_id"] for r in rows if r["presence"] in ("亲至", "") and EVM[r["event_id"]]["place_id"]}
    have = sorted(p for p in places if PLM[p]["lat"]); pend = sorted(p for p in places if not PLM[p]["lat"])
    return len(rows), len(yrs), have, pend
for tag, T_ep in (("叠 B1–B4", afterB["event_people"]), ("再叠 r61-G", merged["event_people"])):
    for pid in ("P_ZHAODUN", "P_QIXIDAFU"):
        n, y, h, p = three(T_ep, pid)
        print(f"   {tag:<10} {pid:<12} 挂链 {n}／涉年 {y}／地 有坐标 {len(h)} {h}｜候回填 {len(p)} {p}")
n, y, h, p = three(merged["event_people"], "P_ZHAODUN")
ck((n, y, len(h), len(p)) == (10, 5, 0, 3), f"赵盾三数变动：{(n, y, h, p)}")
n, y, h, p = three(merged["event_people"], "P_QIXIDAFU")
ck((n, y, len(h), len(p)) == (4, 3, 1, 0), f"祁奚三数变动：{(n, y, h, p)}")

print(f"\n合计：PASS {PASS}  FAIL {FAIL}  反证 {NRED} 条，未红 {RED_FAIL}")
if RED_FAIL: sys.exit(2)
sys.exit(1 if FAIL else 0)
