# -*- coding: utf-8 -*-
"""
r61-B3（下宫之难·成公八年）合并模拟 —— Sophia 备料，team/round61_prompts.md「Task for Sophia · r61-B」第三事。
来源标记：Sophia，2026-10-11 EDT，会话 session_01QhJ4hbubq1BVsxd8kjBSRA。

用法（仓库根目录，★ 须在 B1、B2、B3 俱未合入之前跑——以 data/csv/ 为「改前」，基线 HEAD c8b3b12）：
    python data/incoming/r61_jin_mingchen/b3_xiagong/sim_r61_b3_xiagong.py

做什么：
  1. 复制 data/csv/ 与 tools/ 至临时目录；★ 先叠 B1（../b1_zhaodun）、再叠 B2（../b2_an），再叠 B3（本目录）：
     各六个 *_new.csv append；fixes_sources.csv／fixes_people.csv 按 id 整行替换，只许对「叠前一线之后之行」纯追加。
     B3 之替换：Z139（主表行）、S016（B1 新行）、S004（B2 替换行）；P_HANJUE（B2 替换行）、P_JINJINGGONG（B2 新行）、
     P_ZHAOWU、P_QIXIDAFU、P_ZHAOCUI（主表行）。
  2. 副本上跑 tools/validate.py、tools/csv_to_json.py、tools/build_kaodui_index.py（台账「抽不出」不得增）；
  3. 本件断言（check_all，二十五类），正测须 0 违例；
  4. ★ 按类反证（裁一百一十四）：本批可能犯之错逐类注入副本，须当场红；任一未红 → exit 2；
  5. 引文比字：passages.quote_original 须为 diben/ 底本摘录（国语剥韦注；史记去繁简转换标记）之子串（「……」分段各比）；
     人物 notes、relations.source_note、events.summary、role_in_event 中「」内之原文片段亦须见于底本（标签词豁免，见 EXEMPT）。

★ r61-D（2026-10-11 EDT，Sophia，会话 session_01QhJ4hbubq1BVsxd8kjBSRA）：依 team/round61_prompts.md §三 裁二百一十六 复判 presence；
  增三断言「受事者之亲至须有甲①之文」（白名单逐行书其途与引文）「处置／兵事之词单用不立亲至」「将然之辞不立亲至」，
  presence 分布断言随新数，按类反证随增（见文末 r61-D 段）。

退出码：0 全过；1 有 FAIL；2 反证未红。临时目录可用环境变量 CHUNQIU_SIM_TMP 覆写。本脚本不属数据。
〔r61-E 入库注，Skipper，2026-10-11〕本脚本之入库副本（docs/changes/r61_jin_mingchen/b3_xiagong/，归档先于清空，吸取 r59_jin_zhizheng 之训）：HERE＝本脚本所在目录，其深度与 data/incoming/r61_jin_mingchen/b3_xiagong/ 同为 4，ROOT＝HERE/../../../.. 即仓库根，原字自正；叠前线之料取同级兄弟目录（../b1_zhaodun、../b2_an）。本脚本以 ROOT/data/csv/ 为改前（非 git 对象），故欲复跑须令 ROOT/data/csv/ 为合入前之基线 c8b3b12（例：git archive c8b3b12 解出一份，再把本目录放进其 docs/changes/ 下跑，exit 0）；于合入后之仓上整跑，因所追加之 ID 已入主表而撞号、断言红，属其性质，非脚本之误（r61 合入于 c8b3b12 之上）。除本注外不改一字。
"""
import copy, csv, os, re, shutil, subprocess, sys, tempfile

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
csv.field_size_limit(10 ** 7)
HERE = os.path.dirname(os.path.abspath(__file__))
B1DIR = os.path.join(HERE, "..", "b1_zhaodun")
B2DIR = os.path.join(HERE, "..", "b2_an")
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
CSV = os.path.join(ROOT, "data", "csv")
TMP = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_r61b3")

TABLES = ["events", "passages", "sources", "people", "event_people", "relations",
          "places", "archaeology", "background", "office_tenures"]
NEW = {"events": "events_new.csv", "passages": "passages_new.csv", "sources": "sources_new.csv",
       "people": "people_new.csv", "event_people": "event_people_new.csv", "relations": "relations_new.csv"}
FIX = {"sources": "fixes_sources.csv", "people": "fixes_people.csv"}
BEFORE = {"events": 281, "passages": 531, "sources": 217, "people": 186, "event_people": 735,
          "relations": 309, "places": 104, "archaeology": 8, "background": 11, "office_tenures": 16}
ADD_B1 = {"events": 6, "passages": 18, "sources": 2, "people": 7, "event_people": 20, "relations": 8}
ADD_B2 = {"events": 9, "passages": 23, "sources": 1, "people": 14, "event_people": 41, "relations": 14}
ADD_B3 = {"events": 5, "passages": 17, "sources": 5, "people": 4, "event_people": 21, "relations": 13}
TAIL = {"E": 333, "Q": 589, "R": 348, "Z": 154, "S": 16, "G": 15, "Y": 3}   # 叠 B1、B2 之后
RETIRED = {"E005", "E006", "Z098"}
KAODUI_UNEXTRACTED_BEFORE = 1   # c8b3b12 实跑 1（Q427 旧账）；叠 B1、B2 后仍 1
PRESENCE_EXPECT = {"亲至": 5, "相关": 16}   # r61-D 复判后（原 4／17）
OFFICE_RE = re.compile(r"將[中上下]軍|為司馬|佐[中上下]軍|為卿|大夫")
# 卒年之据（须为经传本文，见于本件底本）
DEATH_EVIDENCE = {"P_ZHAOTONG": "晉殺其大夫趙同趙括", "P_ZHAOKUO": "晉殺其大夫趙同趙括"}
LATE_NAMES = {"趙孤", "赵孤", "趙氏孤兒", "赵氏孤儿", "趙朔妻", "赵朔妻", "朔婦", "成公姊", "趙庶子武", "赵庶子武"}
LATE_IN_BIO = ["屠岸", "程婴", "程嬰", "杵臼", "孤儿", "孤兒", "成公姊", "遗腹", "遺腹", "下宫", "下宮", "庶子"]
LATE_PERSONS = ["屠岸贾", "屠岸賈", "程婴", "程嬰", "公孙杵臼", "公孫杵臼", "赵朔", "趙朔"]
GONGWEI_RE = re.compile(r"通于|通於|私通|淫|宣淫|烝")
# 受事者不立亲至：亲至之行，其引文须有其人之名作行为者（名前不得紧接受事之动词）
AGENT_TOKENS = {"P_ZHAOTONG": ["趙同", "原屏", "原同"], "P_ZHAOKUO": ["趙括", "原屏", "屏括"],
                "P_ZHAOYINGQI": ["趙嬰", "嬰"], "P_ZHAOZHUANGJI": ["莊姬", "姬氏"], "P_ZHAOWU": ["武"],
                "P_HANJUE": ["韓厥"], "P_JINJINGGONG": ["晉侯", "公"], "P_QIXIDAFU": ["祁奚"]}
PATIENT_BEFORE = re.compile(r"(討|殺|譖之于|譖之於|放|立|言於|言于|與|從)[^。]{0,2}$")
EXEMPT = {"相关", "亲至", "不在", "晉侯", "公", "後出叙事", "討", "殺", "譖", "反其田", "乃立武", "君姬氏"}

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
PUNCT = re.compile(r"[「」『』，。：；、？！\s（）‧]")
def norm(s): return PUNCT.sub("", s)

def diben():
    out = {}
    d = os.path.join(HERE, "diben")
    for fn in os.listdir(d):
        t = open(os.path.join(d, fn), encoding="utf-8").read()
        s = "\n".join(l.split("\t", 1)[1] for l in t.split("\n") if l.startswith("L"))
        if fn.startswith("guoyu"):
            s = re.sub(r"\{\{\*\|[^}]*\}\}", "", s)
        s = re.sub(r"-\{(.*?)\}-", r"\1", s)
        out[fn] = s
    return out
DIBEN = diben()
ALLN = norm("\n".join(DIBEN.values()))
def _raw_all():   # 注中引文之比对另含韦昭注等夹注原文（注中引韦注者须书其为注家之说）
    out = []
    d = os.path.join(HERE, "diben")
    for fn in os.listdir(d):
        t = open(os.path.join(d, fn), encoding="utf-8").read()
        out.append(re.sub(r"-\{(.*?)\}-", r"\1", "\n".join(l.split("\t", 1)[1] for l in t.split("\n") if l.startswith("L"))))
    return norm("\n".join(out))
ALLN_RAW = ALLN + _raw_all()
ZG_N = norm("\n".join(v for k, v in DIBEN.items() if k.startswith(("zuo", "guoyu"))))
SRC_DIBEN = {"Z139": "zuo_chenggong.txt", "Z155": "zuo_chenggong.txt", "Z156": "zuo_chenggong.txt",
             "G016": "guoyu_juan12.txt", "G017": "guoyu_juan15.txt",
             "S004": "shiji_juan039.txt", "S016": "shiji_juan043.txt", "S017": "shiji_juan045.txt"}
LATE = ("S", "Y")

# ---------- 0. 表头与卫生 ----------
print("== 0. 表头与文件卫生 ==")
for t, fn in list(NEW.items()) + list(FIX.items()):
    ck(hdr(os.path.join(CSV, t + ".csv")) == hdr(os.path.join(HERE, fn)), f"{fn} 表头与主表不同")
    for r in rd(os.path.join(HERE, fn)):
        for k, v in r.items():
            ck(v is not None and "\n" not in v and "\t" not in v, f"{fn} 栏 {k} 含换行／制表符")
            ck(not k.lower().startswith("novel"), f"{fn} 含 novel* 列")

# ---------- 1. 合并（B1 → B2 → B3） ----------
print("== 1. 合并模拟（叠 B1 → 叠 B2 → 叠 B3） ==")
if os.path.isdir(TMP): shutil.rmtree(TMP)
simcsv = os.path.join(TMP, "data", "csv"); os.makedirs(simcsv)
for t in TABLES: shutil.copy(os.path.join(CSV, t + ".csv"), os.path.join(simcsv, t + ".csv"))
main = {t: rd(os.path.join(CSV, t + ".csv")) for t in TABLES}
def apply(d, tag):
    for t, fn in NEW.items():
        with open(os.path.join(simcsv, t + ".csv"), "a", encoding="utf-8", newline="") as f:
            csv.DictWriter(f, fieldnames=hdr(os.path.join(CSV, t + ".csv")), lineterminator="\n").writerows(rd(os.path.join(d, fn)))
    for t, fn in FIX.items():
        repl = {r["id"]: r for r in rd(os.path.join(d, fn))}
        cur = rd(os.path.join(simcsv, t + ".csv")); hit = 0
        for i, r in enumerate(cur):
            if r["id"] in repl:
                new = repl[r["id"]]
                for k in r:
                    ck(new[k] == r[k] or new[k].startswith(r[k]), f"{tag} {fn} {r['id']}.{k} 非纯追加")
                cur[i] = new; hit += 1
        ck(hit == len(repl), f"{tag} {fn} 替换命中 {hit} != {len(repl)}")
        with open(os.path.join(simcsv, t + ".csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=hdr(os.path.join(CSV, t + ".csv")), lineterminator="\n")
            w.writeheader(); w.writerows(cur)
apply(B1DIR, "B1")
afterB1 = {t: rd(os.path.join(simcsv, t + ".csv")) for t in TABLES}
apply(B2DIR, "B2")
afterB2 = {t: rd(os.path.join(simcsv, t + ".csv")) for t in TABLES}
apply(HERE, "B3")
shutil.copytree(os.path.join(ROOT, "tools"), os.path.join(TMP, "tools"), ignore=shutil.ignore_patterns("node_modules", "__pycache__"))
os.makedirs(os.path.join(TMP, "site", "data")); os.makedirs(os.path.join(TMP, "docs"))
merged = {t: rd(os.path.join(simcsv, t + ".csv")) for t in TABLES}
print("   临时副本：" + TMP)

# ---------- 2. 行数 ----------
print("== 2. 逐表行数（改前／叠B1／叠B2／叠B3／应得） ==")
for t in TABLES:
    exp = BEFORE[t] + ADD_B1.get(t, 0) + ADD_B2.get(t, 0) + ADD_B3.get(t, 0)
    print(f"   {t:<15}{BEFORE[t]:>6}{len(afterB1[t]):>6}{len(afterB2[t]):>6}{len(merged[t]):>6}{exp:>6}")
    ck(len(main[t]) == BEFORE[t], f"{t} 主表基线 {len(main[t])} != {BEFORE[t]}（须于 B1、B2、B3 合入前跑）")
    ck(len(merged[t]) == exp, f"{t} 合入后 {len(merged[t])} != {exp}")
for t in ("places", "archaeology", "background", "office_tenures"):
    ck(merged[t] == main[t], f"{t} 被改动（本件不动）")
for t in ("events", "passages", "event_people", "relations"):
    ck(merged[t][:len(afterB2[t])] == afterB2[t], f"既有 {t} 行被改动（本件于此表只 append）")

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
def ids_file(d):
    out = {}
    for line in open(os.path.join(d, "ids_used.txt"), encoding="utf-8"):
        if line.strip() and not line.startswith("#"):
            a, b = line.rstrip("\n").split("\t"); out.setdefault(a, []).append(b)
    return out
IDS_USED = ids_file(HERE)
PRIOR_LINES = {x for d in (B1DIR, B2DIR) for v in ids_file(d).values() for x in v}

def quoted(s):
    return re.findall(r"「([^」]+)」", s)


# r61-D 配置（B3）：受事之判沿用本件 AGENT_TOKENS／PATIENT_BEFORE 之启发（名前紧接受事之动词者为受事）
R61D_TOKS = AGENT_TOKENS
R61D_PATIENT = PATIENT_BEFORE
R61D_HEUR = True
# 本线受事者之行（被放、被谮、受谮、被讨、所从、受田、受言、被立）——与启发并用
R61D_RECEIVERS = {("E334", "P_ZHAOYINGQI"), ("E335", "P_JINJINGGONG"), ("E335", "P_ZHAOTONG"), ("E335", "P_ZHAOKUO"),
                  ("E336", "P_ZHAOTONG"), ("E336", "P_ZHAOKUO"), ("E337", "P_ZHAOZHUANGJI"), ("E337", "P_QIXIDAFU"),
                  ("E338", "P_JINJINGGONG"), ("E338", "P_ZHAOWU"), ("E338", "P_QIXIDAFU")}
R61D_RECEIVER_OK = {
    ("E334", "P_ZHAOYINGQI"): ("②", "嬰曰。我在"),        # 被放者自有对面之言（型5 同理）
    ("E337", "P_ZHAOZHUANGJI"): ("①", "從姬氏畜于公宮"),   # 所从者与从者偕，型19
}

# ---------- r61-D（裁二百一十六 亲至之准）三断言 —— Sophia，2026-10-11 EDT，会话 session_01QhJ4hbubq1BVsxd8kjBSRA ----------
# 所据：team/round61_prompts.md §三 裁二百一十六 二（甲）（乙）、四表；本线事目落点俱阙 → （乙）只用其第二支：（甲）之①或②即足。
# ① 「受事者之亲至，须有甲①之文」：受事者（被杀、被攻、被从、被逆立……）标亲至者，须入 R61D_RECEIVER_OK 白名单，
#    逐行书其途与引文片段，片段须见于其 role_in_event 与同目经传（Z／G）引文。
#    ★ 白名单中书「②」者：裁二百一十六 二（甲）原字为「受事者而无其人之文……须有①之文方立」，有其人自为主语之②文者
#      （型5「被杀者有其身行」、型11「被劫者答拜」）不在此限——任务书 r61-D 一·3 之「须有甲①之文」是其省文，此处照裁文全句。
# ② 「处置／兵事之词单用不立亲至」：亲至行之引文，凡其人作主语之句只有杀／放／讨／执／灭／伐／攻／弑／立／逐／劫／帅／使／斩／戮，
#    而通行无一身行（甲②）之词、亦无及于其身之地（甲①，其人为所及者）——红。「以甲」「帅甲」之甲是他人之身，仍在此列。
# ③ 「将然之辞不立亲至」：引文含 将／欲＋动词 者，去其将然之句段后，余文须有甲①②之文，否则红。
R61D_DISP = re.compile(r"殺|弒|討|執|滅|伐|攻|立|逐|劫|帥|使|放|斬|戮")
R61D_BODY = re.compile(r"曰|對|拜|稽首|趨|射|奉|盥|撫|登|扶|觸|御|為右|以戈|搏|鬥|鼓|馳|見|言於|言于|告|譖之|遊于|聘于|奔|朝于|朝於|盟|戰于|"
                       r"如晉|還於|往|坐|假寐|嗾|禦|投|乘|縶|易位|呼|致賂|反自|入|求|畜于|祈死|田|主郤|道之|會[^。]{0,6}[于於]|傷於矢|并轡|援枹|飲|視之|問其故")
R61D_PLACE = re.compile(r"[于於]|焉")
R61D_FUT = re.compile(r"[將欲](?:攻|斬|謀|殺|戮|救|伐|朝|為亂|改|諫)[^。，、；]*")

def r61d_quoted(s):
    return re.findall(r"「([^」]+)」", s)

def r61d_subj_disp(f, toks, patient_re):
    for m in R61D_DISP.finditer(f):
        pre, post = f[:m.start()], f[m.end():]
        hits = [t for t in toks if t in pre]
        if hits:
            for t in hits:
                k = pre.rfind(t)
                if not patient_re.search(pre[:k]): return True
        elif not any(t in post for t in toks):
            return True          # 主语不书而句中亦无其名：视同其人为主语
    return False

def r61d_good(f, toks, patient_re):
    return bool(R61D_BODY.search(f)) or (bool(R61D_PLACE.search(f)) and not r61d_subj_disp(f, toks, patient_re))

def r61d_check(N, zg_pool, bad, toks_map, patient_re, receivers_static, receiver_ok, heuristic):
    for r in N["event_people"]:
        if r["presence"] not in ("亲至", ""): continue
        k = (r["event_id"], r["person_id"])
        toks = toks_map.get(r["person_id"], [])
        frags = [f for f in r61d_quoted(r["role_in_event"]) if len(norm(f)) >= 3]
        pool = zg_pool.get(r["event_id"], [])
        # ① 受事者
        is_recv = k in receivers_static
        if heuristic and toks:
            agent = False
            for f in frags:
                for t in toks:
                    for m in re.finditer(re.escape(t), f):
                        if not patient_re.search(f[:m.start()]): agent = True
            if not agent: is_recv = True
        if is_recv:
            ok = receiver_ok.get(k)
            if not ok:
                bad("受事者之亲至须有甲①之文", f"{k[0]}/{k[1]} 不在白名单")
            else:
                frag = norm(ok[1])
                if frag not in norm(r["role_in_event"]) or not any(frag in p for p in pool):
                    bad("受事者之亲至须有甲①之文", f"{k[0]}/{k[1]} 白名单之文（{ok[0]}「{ok[1]}」）不见于其 role 或同目经传")
        # ② 处置／兵事之词单用
        if any(r61d_subj_disp(f, toks, patient_re) for f in frags) and not any(r61d_good(f, toks, patient_re) for f in frags):
            bad("处置／兵事之词单用不立亲至", f"{k[0]}/{k[1]}")
        # ③ 将然之辞
        if any(R61D_FUT.search(f) for f in frags):
            rest = [R61D_FUT.sub("", f) for f in frags]
            if not any(r61d_good(f, toks, patient_re) for f in rest if norm(f)):
                bad("将然之辞不立亲至", f"{k[0]}/{k[1]}")
# ---------- r61-D 块终 ----------

def check_all(T, N):
    V_KEYS = ["ID接续", "退役号", "ids_used对账", "外键", "比字", "后出层不作原文", "后出层层标",
              "亲至须引同目经传身行明文", "后出层不立亲至", "以职立亲至", "受事者之亲至须有甲①之文", "处置／兵事之词单用不立亲至", "将然之辞不立亲至", "新人二级", "每人俱挂其篇", "正向包含",
              "每事有经传骨架", "二叙相违须互指", "边须经传明文", "卒年须经传明文", "后出层异名不入alt_names",
              "后出层所增不入人物小传", "后出层人物不立people行", "注家之说不织亲属边", "谮辞不作叙述",
              "宫闱只记不叙", "注中引文须见底本"]
    V = {kk: [] for kk in V_KEYS}
    def bad(name, msg): V[name].append(msg)
    prior = {t: {r["id"] for r in afterB2[t]} for t in ("events", "passages", "sources", "people", "relations")}
    def seq(ids, pre, start):
        nums = [int(i[len(pre):]) for i in ids]
        return nums == list(range(start + 1, start + 1 + len(nums)))
    if not seq([r["id"] for r in N["events"]], "E", TAIL["E"]): bad("ID接续", "events 非接 B2 尾连号")
    if not seq([r["id"] for r in N["passages"]], "Q", TAIL["Q"]): bad("ID接续", "passages 非接 B2 尾连号")
    if not seq([r["id"] for r in N["relations"]], "R", TAIL["R"]): bad("ID接续", "relations 非接 B2 尾连号")
    by_pre = {}
    for r in N["sources"]: by_pre.setdefault(r["id"][0], []).append(r["id"])
    for p, ids in by_pre.items():
        if p not in TAIL or not seq(ids, p, TAIL[p]): bad("ID接续", f"sources {p} 前缀非接尾连号：{ids}")
    for t in ("events", "passages", "sources", "people", "relations"):
        for r in N[t]:
            if r["id"] in prior[t] or r["id"] in PRIOR_LINES: bad("ID接续", f"{t} {r['id']} 与既有或 B1／B2 撞号")
            if r["id"] in RETIRED: bad("退役号", r["id"])
        if sorted(IDS_USED.get(t, [])) != sorted(r["id"] for r in N[t]):
            bad("ids_used对账", f"{t}：ids_used.txt 与实件不符")
    PID = {r["id"] for r in T["people"]}; EID = {r["id"] for r in T["events"]}; SID = {r["id"] for r in T["sources"]}
    ev = {r["id"]: r for r in T["events"]}
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
        layer = r["source_id"][0]
        if layer in LATE:
            if r["quote_type"] != "后出叙事": bad("后出层不作原文", r["id"])
            if not r["modern_note"].startswith("【后出叙事"): bad("后出层层标", r["id"])
            if re.search(r"相抵|之异", r["modern_note"]) and r["id"] not in ev[r["event_id"]]["summary"]:
                bad("二叙相违须互指", r["id"])
        if r["source_id"] not in ev[r["event_id"]]["source_ids"].split(";"): bad("正向包含", r["id"])
    zg, late = {}, {}
    for r in T["passages"]:
        (zg if r["source_id"][0] in "ZG" else late).setdefault(r["event_id"], []).append(norm(r["quote_original"]))
    for r in N["event_people"]:
        raw_frags = [f for f in quoted(r["role_in_event"]) if len(norm(f)) >= 3]
        frags = [norm(f) for f in raw_frags]
        pool = zg.get(r["event_id"], [])
        if r["presence"] in ("亲至", ""):
            if not frags or not all(any(f in p for p in pool) for f in frags):
                bad("亲至须引同目经传身行明文", f"{r['event_id']}/{r['person_id']}")
            if any(any(f in p for p in late.get(r["event_id"], [])) and not any(f in p for p in pool) for f in frags):
                bad("后出层不立亲至", f"{r['event_id']}/{r['person_id']}")
            if frags and all(OFFICE_RE.search(f) for f in frags):
                bad("以职立亲至", f"{r['event_id']}/{r['person_id']}")
            # 「受事者不立亲至」旧断言已由 r61-D「受事者之亲至须有甲①之文」代之（见 r61d_check）
        if r["presence"] == "不在":
            if not frags or not all(any(f in p for p in pool) for f in frags):
                bad("亲至须引同目经传身行明文", f"不在无明文 {r['event_id']}/{r['person_id']}")
    for r in N["people"]:
        if r["is_protagonist"] != "0": bad("新人二级", r["id"])
        if not any(x["person_id"] == r["id"] for x in N["event_people"]): bad("每人俱挂其篇", r["id"])
        if r["death_year_bce"]:
            fr = DEATH_EVIDENCE.get(r["id"])
            if not fr or fr not in ZG_N or fr not in norm(r["notes"]): bad("卒年须经传明文", r["id"])
        for a in r["alt_names"].split(";"):
            if a and a in LATE_NAMES: bad("后出层异名不入alt_names", f"{r['id']}:{a}")
        for w in LATE_IN_BIO:
            if w in r["short_bio"]: bad("后出层所增不入人物小传", f"{r['id']}:{w}")
        for nm in LATE_PERSONS:
            if r["name"] == nm or nm in r["alt_names"].split(";"): bad("后出层人物不立people行", f"{r['id']}:{nm}")
        for fld in ("short_bio", "relations"):
            if GONGWEI_RE.search(r[fld]): bad("宫闱只记不叙", f"{r['id']}.{fld}")
    for r in N["events"]:
        if not any(p["event_id"] == r["id"] and p["source_id"][0] == "Z" for p in N["passages"]): bad("每事有经传骨架", r["id"])
        if r["reliability"] != "high": bad("每事有经传骨架", r["id"] + " reliability")
        for fld in ("title", "summary"):
            if GONGWEI_RE.search(r[fld]): bad("宫闱只记不叙", f"{r['id']}.{fld}")
        for sent in re.split(r"[。；]", r["summary"]):
            if re.search(r"将为乱|將為亂", sent) and not re.search(r"谮|譖|辞|辭|指控|文本立场", sent):
                bad("谮辞不作叙述", f"{r['id']}：{sent[:20]}")
    PNAME = {r["id"]: r["name"] for r in T["people"]}
    for r in N["relations"]:
        segs = [norm(x) for f in quoted(r["source_note"]) for x in f.split("……")]
        if not ("《左传" in r["source_note"]) or not any(len(x) >= 3 and x in ZG_N for x in segs):
            bad("边须经传明文", r["id"])
        if {r["person_a"], r["person_b"]} == {"P_ZHAOZHUANGJI", "P_ZHAOWU"} and r["rel_type"].startswith(("亲属", "婚姻")):
            bad("注家之说不织亲属边", r["id"])
        if any(PNAME.get(x, "") in ("赵朔",) for x in (r["person_a"], r["person_b"])):
            bad("注家之说不织亲属边", r["id"] + "（赵朔）")
        if GONGWEI_RE.search(r["rel_label"]): bad("宫闱只记不叙", r["id"])
    texts = [("people.notes " + r["id"], r["notes"]) for r in N["people"]] + \
            [("relations " + r["id"], r["source_note"]) for r in N["relations"]] + \
            [("events " + r["id"], r["summary"]) for r in N["events"]] + \
            [("ep " + r["event_id"] + "/" + r["person_id"], r["role_in_event"]) for r in N["event_people"]]
    for name, s in texts:
        for f in quoted(s):
            for seg in f.split("……"):
                n = norm(seg)
                if len(n) < 2 or seg in EXEMPT or n in EXEMPT: continue
                if n not in ALLN_RAW: bad("注中引文须见底本", f"{name}：「{seg[:16]}」")
    r61d_check(N, zg, bad, R61D_TOKS, R61D_PATIENT, R61D_RECEIVERS, R61D_RECEIVER_OK, R61D_HEUR)
    return V

N0 = {t: rd(os.path.join(HERE, fn)) for t, fn in NEW.items()}
print("== 4. 本件断言（正测） ==")
V0 = check_all(merged, N0)
for kk, vv in V0.items():
    ck(not vv, f"[{kk}] {vv}")
    print(f"   {kk:<22} 违例 {len(vv)}")
pres = {}
for r in N0["event_people"]: pres[r["presence"]] = pres.get(r["presence"], 0) + 1
print("   presence 分布：", pres)
ck(pres == PRESENCE_EXPECT, f"presence 分布变动：{pres}")

# ---------- 5. 按类反证 ----------
print("== 5. 按类反证（注入本批可能犯之错，须红） ==")
RED_FAIL = 0; NINJ = 0
def inject(name, cls, fn):
    global RED_FAIL, NINJ
    NINJ += 1
    T = copy.deepcopy(merged); N = copy.deepcopy(N0)
    fn(T, N)
    for t in N:
        key = (lambda r: (r["event_id"], r["person_id"])) if t == "event_people" else (lambda r: r["id"])
        nk = {key(r): r for r in N[t]}
        T[t] = [nk.get(key(r), r) for r in T[t]]
        have = {key(r) for r in T[t]}
        T[t] += [r for r in N[t] if key(r) not in have]
    V = check_all(T, N)
    red = bool(V.get(cls))
    print(f"   {'红' if red else '★未红'}  {name}  → [{cls}] {V.get(cls, [])[:2]}")
    if not red: RED_FAIL += 1
def ep(N, e, p): return next(r for r in N["event_people"] if r["event_id"] == e and r["person_id"] == p)
def ps(N, i): return next(r for r in N["passages"] if r["id"] == i)
def evn(N, i): return next(r for r in N["events"] if r["id"] == i)
def pe(N, i): return next(r for r in N["people"] if r["id"] == i)
def re_(N, i): return next(r for r in N["relations"] if r["id"] == i)

inject("受事者立亲至：赵同于晋讨事目改亲至，所据「晉討趙同。趙括」（被讨非身行）", "受事者之亲至须有甲①之文",
       lambda T, N: ep(N, "E336", "P_ZHAOTONG").update(presence="亲至", role_in_event="「晉討趙同。趙括」"))
inject("受事者立亲至：晋景公于韩厥进言事目改亲至，所据「韓厥言於晉侯曰」（受言非身行）", "受事者之亲至须有甲①之文",
       lambda T, N: ep(N, "E338", "P_JINJINGGONG").update(presence="亲至", role_in_event="「韓厥言於晉侯曰」"))
# r61-D：赵庄姬于畜公宫事目依裁二百一十六 型19 已改亲至（甲①），原反证改为「白名单之地之文被删」
inject("受事者之亲至去其地之文：赵庄姬于畜公宫事目 role 只留「武從姬氏」", "受事者之亲至须有甲①之文",
       lambda T, N: ep(N, "E337", "P_ZHAOZHUANGJI").update(role_in_event="「武從姬氏」之姬氏"))
inject("以职立亲至：赵括于晋讨事目改亲至，所据只「皆為卿」", "以职立亲至",
       lambda T, N: ep(N, "E336", "P_ZHAOKUO").update(presence="亲至", role_in_event="「皆為卿」"))
inject("以后出层立亲至：韩厥于晋讨事目改亲至，引赵世家「韓厥告趙朔趣亡」", "后出层不立亲至",
       lambda T, N: ep(N, "E336", "P_HANJUE").update(presence="亲至", role_in_event="「韓厥告趙朔趣亡」"))
inject("跨目借证：赵武于韩厥进言事目标亲至而引畜于公宫之文", "亲至须引同目经传身行明文",
       lambda T, N: ep(N, "E338", "P_ZHAOWU").update(presence="亲至", role_in_event="「武從姬氏畜于公宮」"))
inject("出亡作卒：赵婴齐 death_year 填 -586（据「祭之之明日而亡」）", "卒年须经传明文",
       lambda T, N: pe(N, "P_ZHAOYINGQI").update(death_year_bce="-586"))
inject("后出层卒年：赵婴齐 death_year 填 -597（据赵世家屠岸贾之难）", "卒年须经传明文",
       lambda T, N: pe(N, "P_ZHAOYINGQI").update(death_year_bce="-597"))
inject("后出层异名入 alt_names：赵庄姬 alt 加「趙朔妻」", "后出层异名不入alt_names",
       lambda T, N: pe(N, "P_ZHAOZHUANGJI").update(alt_names="赵孟姬;趙朔妻"))
inject("后出层所增入小传：赵婴齐小传书景公三年为屠岸贾所杀", "后出层所增不入人物小传",
       lambda T, N: pe(N, "P_ZHAOYINGQI").update(short_bio=pe(N, "P_ZHAOYINGQI")["short_bio"] + "景公三年为屠岸贾所杀。"))
inject("后出层所增入小传：赵庄姬小传书成公姊、遗腹", "后出层所增不入人物小传",
       lambda T, N: pe(N, "P_ZHAOZHUANGJI").update(short_bio=pe(N, "P_ZHAOZHUANGJI")["short_bio"] + "成公姊，有遗腹。"))
inject("后出层人物立 people 行：新立屠岸贾", "后出层人物不立people行",
       lambda T, N: N["people"].append(dict(N["people"][0], id="P_TUANGU", name="屠岸贾", alt_names="", death_year_bce="")))
inject("后出层人物立 people 行：新立程婴", "后出层人物不立people行",
       lambda T, N: N["people"].append(dict(N["people"][0], id="P_CHENGYING", name="程婴", alt_names="", death_year_bce="")))
inject("后出层织边：庄姬—赵同之边改据赵世家", "边须经传明文",
       lambda T, N: re_(N, "R357").update(source_note="《史记·赵世家》「賈不請而擅與諸將攻趙氏於下宮」"))
inject("注家之说织亲属边：赵武—赵庄姬改「亲属-直系·母」", "注家之说不织亲属边",
       lambda T, N: re_(N, "R361").update(rel_type="亲属-直系", rel_label="母"))
inject("后出层混同经传：赵世家 Q598 quote_type 改「原文」", "后出层不作原文",
       lambda T, N: ps(N, "Q598").update(quote_type="原文"))
inject("后出层混同经传：韩世家 Q606 quote_type 改「原文」", "后出层不作原文",
       lambda T, N: ps(N, "Q606").update(quote_type="原文"))
inject("后出层缺层标：赵世家 Q602 去其【后出叙事】层标", "后出层层标",
       lambda T, N: ps(N, "Q602").update(modern_note=ps(N, "Q602")["modern_note"].split("】", 1)[1]))
inject("引文与底本不合：Q603「反其田」误录为「復其田」", "比字",
       lambda T, N: ps(N, "Q603").update(quote_original=ps(N, "Q603")["quote_original"].replace("反其田", "復其田")))
inject("引文以他本改字：Q602「卽女也」径改「即女也」", "比字",
       lambda T, N: ps(N, "Q602").update(quote_original=ps(N, "Q602")["quote_original"].replace("卽女也", "即女也")))
inject("引文混入韦注：Q596 末补「卒存趙武」", "比字",
       lambda T, N: ps(N, "Q596").update(quote_original=ps(N, "Q596")["quote_original"] + "卒存趙武。"))
inject("底本改断句：Q591「原屏放諸齊」改「原、屏放諸齊」", "比字",
       lambda T, N: ps(N, "Q591").update(quote_original=ps(N, "Q591")["quote_original"].replace("原屏放諸齊", "原、屏放諸齊")))
inject("注中凭记忆引文：赵婴齐 notes 引「樓嬰」为《左传》字（底本作摟）", "注中引文须见底本",
       lambda T, N: pe(N, "P_ZHAOYINGQI").update(notes=pe(N, "P_ZHAOYINGQI")["notes"] + "《左传》作「趙衰生樓嬰」。"))
inject("谮辞作叙述：E336 summary 增「原、屏将为乱，晋讨之」", "谮辞不作叙述",
       lambda T, N: evn(N, "E336").update(summary=evn(N, "E336")["summary"] + "原、屏将为乱，晋讨之。"))
inject("宫闱细节入小传：赵庄姬小传书其私通", "宫闱只记不叙",
       lambda T, N: pe(N, "P_ZHAOZHUANGJI").update(short_bio=pe(N, "P_ZHAOZHUANGJI")["short_bio"] + "与赵婴私通。"))
inject("宫闱细节入事目：E334 summary 照搬「通于」", "宫闱只记不叙",
       lambda T, N: evn(N, "E334").update(summary=evn(N, "E334")["summary"] + "赵婴通于赵庄姬。"))
inject("撞 B2 号：新事目改用 B2 之 E333", "ID接续",
       lambda T, N: evn(N, "E334").update(id="E333"))
inject("撞 B2 号：新关系改用 B2 之 R348", "ID接续",
       lambda T, N: re_(N, "R349").update(id="R348"))
inject("撞 B1 号：新 S 源改用 B1 之 S016", "ID接续",
       lambda T, N: next(r for r in N["sources"] if r["id"] == "S017").update(id="S016"))
inject("用退役号：Z155 改 Z098", "退役号",
       lambda T, N: next(r for r in N["sources"] if r["id"] == "Z155").update(id="Z098"))
inject("ids_used.txt 漏登：新增一人而清单无之", "ids_used对账",
       lambda T, N: N["people"].append(dict(N["people"][0], id="P_ZHAOJI2", name="赵姬", alt_names="", death_year_bce="")))
inject("新人入一级：赵庄姬 is_protagonist=1", "新人二级",
       lambda T, N: pe(N, "P_ZHAOZHUANGJI").update(is_protagonist="1"))
inject("立人不挂篇：删赵婴齐全部挂链", "每人俱挂其篇",
       lambda T, N: N.update(event_people=[r for r in N["event_people"] if r["person_id"] != "P_ZHAOYINGQI"]))
inject("正向包含断：E336 source_ids 去 S017 而 Q599 仍挂之", "正向包含",
       lambda T, N: evn(N, "E336").update(source_ids="Z156;G016;S004;S016"))
inject("以后出层单立事目：E337 之 Z 层引文改挂 E336", "每事有经传骨架",
       lambda T, N: ps(N, "Q600").update(event_id="E336"))
inject("二叙相违只注一侧：E337 summary 去其对 Q602 之指", "二叙相违须互指",
       lambda T, N: evn(N, "E337").update(summary=evn(N, "E337")["summary"].replace("（`Q602`）", "")))

# ---------- r61-D 反证（裁二百一十六） ----------
inject("处置／兵事之词单用立亲至：赵同于放婴事目改亲至，所据只「原屏放諸齊」", "处置／兵事之词单用不立亲至",
       lambda T, N: ep(N, "E334", "P_ZHAOTONG").update(presence="亲至"))
inject("将然之辞立亲至：赵括于谮事目改亲至，所据「原屏將為亂」", "将然之辞不立亲至",
       lambda T, N: ep(N, "E335", "P_ZHAOKUO").update(presence="亲至", role_in_event="「原屏將為亂」"))

print(f"\n合计：PASS {PASS}  FAIL {FAIL}  反证未红 {RED_FAIL}（反证 {NINJ} 条）")
if RED_FAIL: sys.exit(2)
sys.exit(1 if FAIL else 0)
