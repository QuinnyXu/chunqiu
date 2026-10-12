# -*- coding: utf-8 -*-
"""
r61-B4（栾书事·成公十七、十八年）合并模拟 —— Sophia 备料，team/round61_prompts.md「Task for Sophia · r61-B」第四事。
来源标记：Sophia，2026-10-11 EDT，会话 session_01QhJ4hbubq1BVsxd8kjBSRA。

用法（仓库根目录，★ 须在 B1、B2、B3、B4 俱未合入之前跑——以 data/csv/ 为「改前」，基线 HEAD c8b3b12）：
    python data/incoming/r61_jin_mingchen/b4_luanshu/sim_r61_b4_luanshu.py

做什么：
  1. 复制 data/csv/ 与 tools/ 至临时目录；★ 依次叠 B1（../b1_zhaodun）、B2（../b2_an）、B3（../b3_xiagong），再叠 B4（本目录）：
     各六个 *_new.csv append；fixes_sources.csv／fixes_people.csv 按 id 整行替换，只许对「叠前一线之后之行」纯追加。
     B4 之替换：Z140（主表行）、G016（B3 新行）、S004（B3 替换行）；P_LUANSHU（B2 替换行）、P_HANJUE（B3 替换行）、
     P_JINJINGGONG（B3 替换行）、P_SHIXIE（B2 新行）、P_XUNYAN、P_SHIGAI、P_XUNYING（主表行）。
  2. 副本上跑 tools/validate.py、tools/csv_to_json.py、tools/build_kaodui_index.py（台账「抽不出」不得增）；
  3. 本件断言（check_all），正测须 0 违例；
  4. ★ 按类反证（裁一百一十四）：本批可能犯之错逐类注入副本，须当场红；任一未红 → exit 2；
  5. 引文比字：passages.quote_original 须为 diben/ 底本摘录（国语剥韦注；史记去繁简转换标记）之子串（「……」分段各比）；
     人物 notes、relations.source_note、events.summary、role_in_event 中「」内之原文片段亦须见于底本（标签词豁免，见 EXEMPT）。

★ r61-D（2026-10-11 EDT，Sophia，会话 session_01QhJ4hbubq1BVsxd8kjBSRA）：依 team/round61_prompts.md §三 裁二百一十六 复判 presence；
  增三断言「受事者之亲至须有甲①之文」（白名单逐行书其途与引文）「处置／兵事之词单用不立亲至」「将然之辞不立亲至」，
  presence 分布断言随新数，按类反证随增（见文末 r61-D 段）。
★ r61-I（2026-10-11 EDT，Sophia，会话 session_01QhJ4hbubq1BVsxd8kjBSRA）：依 §九 裁二百二十 一②，E344／P_LUANSHU 改亲至（Q623 同场对面之言）；
  分布断言 18／27 → 19／26；「栾书执公」反证改为只据「遂執公焉」注入（型4 仍红）；增「中行偃意欲之辞」反证一条。

退出码：0 全过；1 有 FAIL；2 反证未红。临时目录可用环境变量 CHUNQIU_SIM_TMP 覆写。本脚本不属数据。
〔r61-E 入库注，Skipper，2026-10-11〕本脚本之入库副本（docs/changes/r61_jin_mingchen/b4_luanshu/，归档先于清空，吸取 r59_jin_zhizheng 之训）：HERE＝本脚本所在目录，其深度与 data/incoming/r61_jin_mingchen/b4_luanshu/ 同为 4，ROOT＝HERE/../../../.. 即仓库根，原字自正；叠前线之料取同级兄弟目录（PRIOR＝HERE/../b1_zhaodun 等三线）。本脚本以 ROOT/data/csv/ 为改前（非 git 对象），故欲复跑须令 ROOT/data/csv/ 为合入前之基线 c8b3b12（例：git archive c8b3b12 解出一份，再把本目录放进其 docs/changes/ 下跑，exit 0）；于合入后之仓上整跑，因所追加之 ID 已入主表而撞号、断言红，属其性质，非脚本之误（r61 合入于 c8b3b12 之上）。除本注外不改一字。
"""
import copy, csv, os, re, shutil, subprocess, sys, tempfile

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
csv.field_size_limit(10 ** 7)
HERE = os.path.dirname(os.path.abspath(__file__))
PRIOR = [os.path.join(HERE, "..", d) for d in ("b1_zhaodun", "b2_an", "b3_xiagong")]
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
CSV = os.path.join(ROOT, "data", "csv")
TMP = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_r61b4")

TABLES = ["events", "passages", "sources", "people", "event_people", "relations",
          "places", "archaeology", "background", "office_tenures"]
NEW = {"events": "events_new.csv", "passages": "passages_new.csv", "sources": "sources_new.csv",
       "people": "people_new.csv", "event_people": "event_people_new.csv", "relations": "relations_new.csv"}
FIX = {"sources": "fixes_sources.csv", "people": "fixes_people.csv"}
BEFORE = {"events": 281, "passages": 531, "sources": 217, "people": 186, "event_people": 735,
          "relations": 309, "places": 104, "archaeology": 8, "background": 11, "office_tenures": 16}
ADD = [{"events": 6, "passages": 18, "sources": 2, "people": 7, "event_people": 20, "relations": 8},     # B1
       {"events": 9, "passages": 23, "sources": 1, "people": 14, "event_people": 41, "relations": 14},   # B2
       {"events": 5, "passages": 17, "sources": 5, "people": 4, "event_people": 21, "relations": 13}]    # B3
ADD_B4 = {"events": 9, "passages": 31, "sources": 2, "people": 11, "event_people": 45, "relations": 21}
TAIL = {"E": 338, "Q": 606, "R": 361, "Z": 156, "S": 17, "G": 17, "Y": 3, "L": 1}   # 叠 B1、B2、B3 之后
RETIRED = {"E005", "E006", "Z098"}
KAODUI_UNEXTRACTED_BEFORE = 1   # c8b3b12 实跑 1（Q427 旧账）；叠 B1–B3 后仍 1
PRESENCE_EXPECT = {"亲至": 19, "相关": 26}   # r61-I 依裁二百二十 一② E344 栾书改亲至（r61-D 18／27；原 21／24）
OFFICE_RE = re.compile(r"將[中上下新]軍|佐[中上下新]軍|為司馬|為卿|大夫$")
DEATH_EVIDENCE = {"P_JINLIGONG": "晉弒其君州蒲", "P_XIQI": "晉殺其大夫郤錡郤犨郤至", "P_XICHOU": "晉殺其大夫郤錡郤犨郤至",
                  "P_XIZHI": "晉殺其大夫郤錡郤犨郤至", "P_JINDAOGONG": "晉侯周卒", "P_SHIFANG": "荀罃士魴卒"}
LATE_NAMES = {"壽曼", "寿曼", "公子周", "郤鉤", "郤钩", "胥之昧", "郤州", "匠驪"}
LATE_IN_BIO = ["寵姬", "宠姬", "囚六日", "刑鷄", "刑鸡", "至絳", "至绛", "自殺", "自杀", "三月"]
LATE_PERSONS = ["胥之昧", "王子發鉤", "王子发钩", "發鉤", "发钩"]
BLAME_RE = re.compile(r"無道|无道|君惡|君恶|無德|无德|驕侈|骄侈|驕泰|骄泰|道君為亂|道君为乱|召寡君|欲為難|欲为难|欲作亂|欲作乱")
BLAME_OK = re.compile(r"谮|譖|辞|辭|之言|言者|文本立场|书法|書法|评|論|论")
SHI_OK = re.compile(r"经书|經書|传书|傳書|书法|書法|称国|稱國|照录|之辞|书「|書「")   # 归属之词；不以单字「书」（会误中「栾书」）
# 受事者不立亲至：亲至之行，其引文须有其人之名作行为者（名前不得紧接受事之动词）
AGENT_TOKENS = {"P_JINLIGONG": ["公", "厲公"], "P_LUANSHU": ["欒書", "書曰", "皆再拜稽首"], "P_XUNYAN": ["中行偃", "皆再拜稽首"],
                "P_XIZHI": ["郤至", "溫季"], "P_XIQI": ["郤錡", "駒伯"], "P_XICHOU": ["郤犨", "苦成叔"],
                "P_XUTONG": ["胥童"], "P_YIYANGWU": ["夷羊五", "夷陽五"], "P_CHANGYUJIAO": ["長魚矯", "矯"],
                "P_QINGFEITUI": ["清沸魋"], "P_CHENGHUA": ["程滑"], "P_JINDAOGONG": ["周子", "孫周"],
                "P_SHIXIE": ["范文子", "士燮"], "P_SHIGAI": ["士匄"], "P_HANJUE": ["韓厥"], "P_XUNYING": ["荀罃"], "P_SHIFANG": ["士魴"]}
PATIENT_BEFORE = re.compile(r"(劫|殺|弒|使|召|執|告|立|逆|從|怨|奪|與|見)[^。]{0,2}$")
# 处置之令不立亲至：所据片段俱为杀／放／讨／使之文，而无其他身行之词
DISPOSAL_RE = re.compile(r"殺|放|討|使")
BODY_RE = re.compile(r"曰|遊|劫|帥|趨|反自|聘|奉|射|再拜|執公焉|以戈|告|田|欲攻|奔|盟而入|朝于")
EXEMPT = {"相关", "亲至", "不在", "公", "後出叙事", "討", "殺", "弒", "譖", "侈", "為政"}

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
PUNCT = re.compile(r"[「」『』，。：；、？！\s（）‧．]")
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
def _raw_all():   # 注中引文之比对另含韦昭注夹注原文（注中引韦注者须书其为注家之说）
    out = []
    d = os.path.join(HERE, "diben")
    for fn in os.listdir(d):
        t = open(os.path.join(d, fn), encoding="utf-8").read()
        out.append(re.sub(r"-\{(.*?)\}-", r"\1", "\n".join(l.split("\t", 1)[1] for l in t.split("\n") if l.startswith("L"))))
    return norm("\n".join(out))
ALLN_RAW = ALLN + _raw_all()
ZG_N = norm("\n".join(v for k, v in DIBEN.items() if k.startswith(("zuo", "guoyu"))))
SRC_DIBEN = {"Z157": "zuo_chenggong.txt", "Z140": "zuo_chenggong.txt", "G016": "guoyu_juan12.txt",
             "S004": "shiji_juan039.txt", "L002": "guliang_chenggong.txt"}

# ---------- 0. 表头与卫生 ----------
print("== 0. 表头与文件卫生 ==")
for t, fn in list(NEW.items()) + list(FIX.items()):
    ck(hdr(os.path.join(CSV, t + ".csv")) == hdr(os.path.join(HERE, fn)), f"{fn} 表头与主表不同")
    for r in rd(os.path.join(HERE, fn)):
        for k, v in r.items():
            ck(v is not None and "\n" not in v and "\t" not in v, f"{fn} 栏 {k} 含换行／制表符")
            ck(not k.lower().startswith("novel"), f"{fn} 含 novel* 列")

# ---------- 1. 合并（B1 → B2 → B3 → B4） ----------
print("== 1. 合并模拟（叠 B1 → B2 → B3 → B4） ==")
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
stages = []
for d, tag in zip(PRIOR, ("B1", "B2", "B3")):
    apply(d, tag); stages.append({t: rd(os.path.join(simcsv, t + ".csv")) for t in TABLES})
afterB3 = stages[-1]
apply(HERE, "B4")
shutil.copytree(os.path.join(ROOT, "tools"), os.path.join(TMP, "tools"), ignore=shutil.ignore_patterns("node_modules", "__pycache__"))
os.makedirs(os.path.join(TMP, "site", "data")); os.makedirs(os.path.join(TMP, "docs"))
merged = {t: rd(os.path.join(simcsv, t + ".csv")) for t in TABLES}
print("   临时副本：" + TMP)

# ---------- 2. 行数 ----------
print("== 2. 逐表行数（改前／叠B1／叠B2／叠B3／叠B4／应得） ==")
for t in TABLES:
    exp = BEFORE[t] + sum(a.get(t, 0) for a in ADD) + ADD_B4.get(t, 0)
    print(f"   {t:<15}{BEFORE[t]:>6}" + "".join(f"{len(s[t]):>6}" for s in stages) + f"{len(merged[t]):>6}{exp:>6}")
    ck(len(main[t]) == BEFORE[t], f"{t} 主表基线 {len(main[t])} != {BEFORE[t]}（须于 B1–B4 合入前跑）")
    ck(len(merged[t]) == exp, f"{t} 合入后 {len(merged[t])} != {exp}")
for t in ("places", "archaeology", "background", "office_tenures"):
    ck(merged[t] == main[t], f"{t} 被改动（本件不动）")
for t in ("events", "passages", "event_people", "relations"):
    ck(merged[t][:len(afterB3[t])] == afterB3[t], f"既有 {t} 行被改动（本件于此表只 append）")

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
PRIOR_LINES = {x for d in PRIOR for v in ids_file(d).values() for x in v}

def quoted(s):
    return re.findall(r"「([^」]+)」", s)


# r61-D 配置（B4）：受事之判沿用本件 AGENT_TOKENS／PATIENT_BEFORE 之启发
R61D_TOKS = AGENT_TOKENS
R61D_PATIENT = PATIENT_BEFORE
R61D_HEUR = True
# 本线受事者之行（被谮、被杀、被劫、被执、被弑、受使）——与启发并用，启发漏者（如 role 只引其名）由此兜住
R61D_RECEIVERS = {("E340", "P_XIZHI"), ("E340", "P_JINDAOGONG"), ("E342", "P_XIQI"), ("E342", "P_XICHOU"), ("E342", "P_XIZHI"),
                  ("E342", "P_QINGFEITUI"), ("E343", "P_LUANSHU"), ("E343", "P_XUNYAN"), ("E344", "P_JINLIGONG"),
                  ("E345", "P_XUTONG"), ("E346", "P_JINLIGONG"), ("E346", "P_CHENGHUA"), ("E347", "P_XUNYING"), ("E347", "P_SHIFANG")}
R61D_RECEIVER_OK = {
    ("E340", "P_XIZHI"): ("①", "郤至聘于周"),            # 被谮者，其身在周有明文
    ("E342", "P_XIQI"): ("①", "殺駒伯苦成叔於其位"),    # 「V 某人於某地」，型6
    ("E342", "P_XICHOU"): ("①", "殺駒伯苦成叔於其位"),  # 同上
    ("E342", "P_XIZHI"): ("②", "溫季曰。逃威也。遂趨"),  # 被杀者有其身行，型5
    ("E343", "P_LUANSHU"): ("②", "皆再拜稽首曰"),        # 被劫者答拜，型11（且「劫……於朝」甲①）
    ("E343", "P_XUNYAN"): ("②", "皆再拜稽首曰"),         # 同上
    ("E344", "P_JINLIGONG"): ("①", "公遊于匠麗氏"),      # 被执者，「遊于匠麗氏」书其地（型4）
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
    V_KEYS = ["ID接续", "退役号", "ids_used对账", "外键", "比字", "后出层不作原文", "后出层层标", "传解层不作原文",
              "亲至须引同目经传身行明文", "后出层不立亲至", "以职立亲至", "受事者之亲至须有甲①之文", "处置／兵事之词单用不立亲至", "将然之辞不立亲至", "辞召不立亲至",
              "新人二级", "每人俱挂其篇", "正向包含", "每事有经传骨架", "二叙相违须互指", "边须经传明文", "卒年须经传明文",
              "后出层异名不入alt_names", "后出层所增不入人物小传", "他支异名人物不立people行", "注家之说不织亲属边",
              "归罪话术不作叙述", "弑字须归其书", "注中引文须见底本"]
    V = {kk: [] for kk in V_KEYS}
    def bad(name, msg): V[name].append(msg)
    prior = {t: {r["id"] for r in afterB3[t]} for t in ("events", "passages", "sources", "people", "relations")}
    def seq(ids, pre, start):
        nums = [int(i[len(pre):]) for i in ids]
        return nums == list(range(start + 1, start + 1 + len(nums)))
    if not seq([r["id"] for r in N["events"]], "E", TAIL["E"]): bad("ID接续", "events 非接 B3 尾连号")
    if not seq([r["id"] for r in N["passages"]], "Q", TAIL["Q"]): bad("ID接续", "passages 非接 B3 尾连号")
    if not seq([r["id"] for r in N["relations"]], "R", TAIL["R"]): bad("ID接续", "relations 非接 B3 尾连号")
    by_pre = {}
    for r in N["sources"]: by_pre.setdefault(r["id"][0], []).append(r["id"])
    for p, ids in by_pre.items():
        if p not in TAIL or not seq(ids, p, TAIL[p]): bad("ID接续", f"sources {p} 前缀非接尾连号：{ids}")
    for t in ("events", "passages", "sources", "people", "relations"):
        for r in N[t]:
            if r["id"] in prior[t] or r["id"] in PRIOR_LINES: bad("ID接续", f"{t} {r['id']} 与既有或 B1–B3 撞号")
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
        if layer == "S":
            if r["quote_type"] != "后出叙事": bad("后出层不作原文", r["id"])
            if not r["modern_note"].startswith("【后出叙事"): bad("后出层层标", r["id"])
        if layer in ("Y", "L"):
            if r["quote_type"] == "原文" or not r["modern_note"].startswith("【传解"): bad("传解层不作原文", r["id"])
        if layer in ("S", "G") and re.search(r"相抵|之异", r["modern_note"]) and r["id"] not in ev[r["event_id"]]["summary"]:
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
            if frags and all(OFFICE_RE.search(f) for f in raw_frags):
                bad("以职立亲至", f"{r['event_id']}/{r['person_id']}")
            # 「受事者不立亲至」「处置之令不立亲至」旧断言已由 r61-D 三断言代之（见 r61d_check）
            for f in raw_frags:
                for tok in AGENT_TOKENS.get(r["person_id"], []):
                    if re.search(re.escape(tok) + r"[。]?辭", f) and not re.search(r"[^辭]曰|遊|劫|帥|執", f.replace(tok + "辭。曰", "")):
                        bad("辞召不立亲至", f"{r['event_id']}/{r['person_id']}")
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
            if r["name"] == nm or nm in r["alt_names"].split(";"): bad("他支异名人物不立people行", f"{r['id']}:{nm}")
        if BLAME_RE.search(r["short_bio"]): bad("归罪话术不作叙述", f"{r['id']}.short_bio")
        if re.search(r"[弑弒]", re.sub(r"「[^」]*」", "", r["short_bio"])): bad("弑字须归其书", f"{r['id']}.short_bio 叙述用弑字")
    for r in N["events"]:
        if not any(p["event_id"] == r["id"] and p["source_id"][0] == "Z" for p in N["passages"]): bad("每事有经传骨架", r["id"])
        if r["reliability"] != "high": bad("每事有经传骨架", r["id"] + " reliability")
        for sent in re.split(r"[。；]", r["summary"]):
            if BLAME_RE.search(sent) and not BLAME_OK.search(sent):
                bad("归罪话术不作叙述", f"{r['id']}：{sent[:24]}")
            bare = re.sub(r"「[^」]*」", "", sent)
            if re.search(r"[弑弒]", bare) and not SHI_OK.search(bare):
                bad("弑字须归其书", f"{r['id']}：{sent[:24]}")
        tb = re.sub(r"「[^」]*」", "", r["title"])
        if re.search(r"[弑弒]", tb) and "经书" not in r["title"]:
            bad("弑字须归其书", f"{r['id']}.title")
    for r in N["relations"]:
        segs = [norm(x) for f in quoted(r["source_note"]) for x in f.split("……")]
        if not ("《左传" in r["source_note"]) or not any(len(x) >= 3 and x in ZG_N for x in segs):
            bad("边须经传明文", r["id"])
        pair = {r["person_a"], r["person_b"]}
        if r["rel_type"].startswith(("亲属", "婚姻")) and (pair & {"P_XIKE", "P_XUTONG", "P_JINDAOGONG"}) :
            bad("注家之说不织亲属边", r["id"])
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
def src(N, i): return next(r for r in N["sources"] if r["id"] == i)

inject("受使者立亲至：程滑于弑厉公事目改亲至，所据「使程滑弒厲公」（只见使令句）", "受事者之亲至须有甲①之文",
       lambda T, N: ep(N, "E346", "P_CHENGHUA").update(presence="亲至", role_in_event="「使程滑弒厲公」"))
inject("受使者立亲至：孙周于谮郤至事目改亲至，所据「欒書使孫周見之」", "受事者之亲至须有甲①之文",
       lambda T, N: ep(N, "E340", "P_JINDAOGONG").update(presence="亲至", role_in_event="「欒書使孫周見之」"))
inject("受使者立亲至：荀罃于逆立事目改亲至，所据「使荀罃。士魴。逆周子于京師」", "受事者之亲至须有甲①之文",
       lambda T, N: ep(N, "E347", "P_XUNYING").update(presence="亲至", role_in_event="「使荀罃。士魴。逆周子于京師而立之」"))
inject("被弑者立亲至：厉公于弑事目改亲至，所据「使程滑弒厲公」", "受事者之亲至须有甲①之文",
       lambda T, N: ep(N, "E346", "P_JINLIGONG").update(presence="亲至", role_in_event="「使程滑弒厲公」"))
inject("被杀者立亲至：胥童于闰月事目改亲至，所据「欒書中行偃殺胥童」", "受事者之亲至须有甲①之文",
       lambda T, N: ep(N, "E345", "P_XUTONG").update(presence="亲至", role_in_event="「欒書中行偃殺胥童」"))
inject("处置之令立亲至：栾书于杀胥童事目改亲至，所据只「欒書中行偃殺胥童」", "处置／兵事之词单用不立亲至",
       lambda T, N: ep(N, "E345", "P_LUANSHU").update(presence="亲至", role_in_event="「欒書中行偃殺胥童」"))
inject("使令立亲至：中行偃于弑事目改亲至，所据「晉欒書。中行偃。使程滑弒厲公」", "处置／兵事之词单用不立亲至",
       lambda T, N: ep(N, "E346", "P_XUNYAN").update(presence="亲至", role_in_event="「晉欒書。中行偃。使程滑弒厲公」"))
inject("使令立亲至：厉公于攻郤氏事目改亲至，所据「公使清沸魋助之」", "处置／兵事之词单用不立亲至",
       lambda T, N: ep(N, "E342", "P_JINLIGONG").update(presence="亲至", role_in_event="「公使清沸魋助之」"))
inject("辞召立亲至：韩厥于执公事目改亲至，所据「韓厥辭。曰」", "辞召不立亲至",
       lambda T, N: ep(N, "E344", "P_HANJUE").update(presence="亲至", role_in_event="「召韓厥。韓厥辭。曰」"))
inject("辞召立亲至：士匄于执公事目改亲至，所据「士匄辭」", "辞召不立亲至",
       lambda T, N: ep(N, "E344", "P_SHIGAI").update(presence="亲至", role_in_event="「召士匄。士匄辭」"))
inject("以职立亲至：胥童于劫二子事目只据「公使胥童為卿」", "以职立亲至",
       lambda T, N: ep(N, "E343", "P_XUTONG").update(presence="亲至", role_in_event="「公使胥童為卿」"))   # r61-D：其行已改相关，故注入时并标亲至
inject("以后出层立亲至：栾书于执公事目引晋世家「以其黨襲捕厲公」", "后出层不立亲至",
       lambda T, N: ep(N, "E344", "P_LUANSHU").update(presence="亲至", role_in_event="「欒書、中行偃以其黨襲捕厲公」"))   # r61-I：其行今为亲至（据 Q623），注入时换其 role 为后出层之文
inject("跨目借证：厉公于弑事目标亲至而引匠丽氏之文", "亲至须引同目经传身行明文",
       lambda T, N: ep(N, "E346", "P_JINLIGONG").update(presence="亲至", role_in_event="「公遊于匠麗氏」"))
inject("被杀者将然之辞立亲至而跨目：郤锜于攻郤氏事目引「郤錡欲攻公」（他目之文）", "亲至须引同目经传身行明文",
       lambda T, N: ep(N, "E342", "P_XIQI").update(presence="亲至", role_in_event="「郤錡欲攻公」"))
inject("经传系年相异者填卒年：胥童 death_year 填 -574", "卒年须经传明文",
       lambda T, N: pe(N, "P_XUTONG").update(death_year_bce="-574"))
inject("推算生卒入字段：悼公 death_year 删其据（notes 去「晉侯周卒」）", "卒年须经传明文",
       lambda T, N: pe(N, "P_JINDAOGONG").update(notes=pe(N, "P_JINDAOGONG")["notes"].replace("晉侯周卒", "晋侯卒")))
inject("后出层异名入 alt_names：晋厉公 alt 加「壽曼」", "后出层异名不入alt_names",
       lambda T, N: pe(N, "P_JINLIGONG").update(alt_names="州蒲;壽曼"))
inject("后出层异名入 alt_names：郤锜 alt 加「郤鉤」", "后出层异名不入alt_names",
       lambda T, N: pe(N, "P_XIQI").update(alt_names="驹伯;郤鉤"))
inject("注家等同之名入 alt_names：胥童 alt 加「胥之昧」", "后出层异名不入alt_names",
       lambda T, N: pe(N, "P_XUTONG").update(alt_names="胥之昧"))
inject("后出层所增入小传：胥童小传书宠姬之兄", "后出层所增不入人物小传",
       lambda T, N: pe(N, "P_XUTONG").update(short_bio=pe(N, "P_XUTONG")["short_bio"] + "厉公宠姬之兄。"))
inject("他支所增入小传：郤至小传书三郤自杀", "后出层所增不入人物小传",
       lambda T, N: pe(N, "P_XIZHI").update(short_bio=pe(N, "P_XIZHI")["short_bio"] + "三郤皆自杀。"))
inject("他支异名立 people 行：新立胥之昧", "他支异名人物不立people行",
       lambda T, N: N["people"].append(dict(N["people"][1], id="P_XUZHIMEI", name="胥之昧", alt_names="", death_year_bce="")))
inject("他支异名立 people 行：新立王子发钩", "他支异名人物不立people行",
       lambda T, N: N["people"].append(dict(N["people"][1], id="P_FAGOU", name="王子發鉤", alt_names="", death_year_bce="")))
inject("后出层织边：程滑—厉公之边改据晋世家", "边须经传明文",
       lambda T, N: re_(N, "R377").update(source_note="《史记·晋世家》「欒書、中行偃弒厲公」"))
inject("无明文织亲属边：郤克—郤锜织「亲属-直系·父」（传只书「先君之嗣卿」，不书其父）", "注家之说不织亲属边",
       lambda T, N: N["relations"].append(dict(re_(N, "R366"), id="R383", person_a="P_XIKE", person_b="P_XIQI", rel_type="亲属-直系", rel_label="父", source_note="《左传·成公十三年》「先君之嗣卿也」")))
inject("后出层混同经传：晋世家 Q634 quote_type 改「原文」", "后出层不作原文",
       lambda T, N: ps(N, "Q634").update(quote_type="原文"))
inject("后出层缺层标：晋世家 Q621 去其【后出叙事】层标", "后出层层标",
       lambda T, N: ps(N, "Q621").update(modern_note=ps(N, "Q621")["modern_note"].split("】", 1)[1]))
inject("传解层作原文：穀梁 Q630 quote_type 改「原文」", "传解层不作原文",
       lambda T, N: ps(N, "Q630").update(quote_type="原文"))
inject("引文与底本不合：Q629「使程滑弒厲公」误录为「使程滑殺厲公」", "比字",
       lambda T, N: ps(N, "Q629").update(quote_original=ps(N, "Q629")["quote_original"].replace("使程滑弒", "使程滑殺")))
inject("引文以异体改字：Q628「弒」径改「弑」", "比字",
       lambda T, N: ps(N, "Q628").update(quote_original=ps(N, "Q628")["quote_original"].replace("弒", "弑")))
inject("引文混入韦注：Q623 补「匠麗氏，嬖大夫家。」", "比字",
       lambda T, N: ps(N, "Q623").update(quote_original="匠麗氏，嬖大夫家。" + ps(N, "Q623")["quote_original"]))
inject("改底本断句：Q622「欒書。中行偃。」改「欒書、中行偃，」", "比字",
       lambda T, N: ps(N, "Q622").update(quote_original=ps(N, "Q622")["quote_original"].replace("欒書。中行偃。", "欒書、中行偃，")))
inject("注中凭记忆引文：栾书 notes 引「晉欒書弒其君州蒲」为经文", "注中引文须见底本",
       lambda T, N: N["people"].append(dict(N["people"][0], id="P_DUMMYA", name="甲", notes="经「晉欒書弒其君州蒲」。")) or
                    N["event_people"].append(dict(N["event_people"][0], person_id="P_DUMMYA")))
inject("归罪话术作叙述：E346 summary 增「厉公无道，国人恶之」", "归罪话术不作叙述",
       lambda T, N: evn(N, "E346").update(summary=evn(N, "E346")["summary"] + "厉公无道，国人恶之。"))
inject("谮辞作叙述：E340 summary 增「郤至实召楚师」作事实", "归罪话术不作叙述",
       lambda T, N: evn(N, "E340").update(summary=evn(N, "E340")["summary"] + "郤至欲为难，实召楚师。"))
inject("弑字作行动者之叙：E346 summary 增「栾书弑厉公」（不归其书）", "弑字须归其书",
       lambda T, N: evn(N, "E346").update(summary=evn(N, "E346")["summary"] + "栾书弑厉公于匠丽氏。"))
inject("弑字入事目题而不归经：E346 title 去「经书」", "弑字须归其书",
       lambda T, N: evn(N, "E346").update(title="栾书弑晋厉公"))
inject("弑字入人物小传作叙述：栾书式之叙入程滑小传", "弑字须归其书",
       lambda T, N: pe(N, "P_CHENGHUA").update(short_bio="晋人，弑厉公者。"))
inject("撞 B3 号：新事目改用 B3 之 E338", "ID接续",
       lambda T, N: evn(N, "E339").update(id="E338"))
inject("撞 B3 号：新关系改用 B3 之 R361", "ID接续",
       lambda T, N: re_(N, "R362").update(id="R361"))
inject("撞 B3 号：新 Z 源改用 B3 之 Z156", "ID接续",
       lambda T, N: src(N, "Z157").update(id="Z156"))
inject("用退役号：Z157 改 Z098", "退役号",
       lambda T, N: src(N, "Z157").update(id="Z098"))
inject("ids_used.txt 漏登：新增一人而清单无之", "ids_used对账",
       lambda T, N: N["people"].append(dict(N["people"][1], id="P_MENGZHANG", name="孟张", alt_names="", death_year_bce="")))
inject("新人入一级：晋悼公 is_protagonist=1", "新人二级",
       lambda T, N: pe(N, "P_JINDAOGONG").update(is_protagonist="1"))
inject("立人不挂篇：删程滑全部挂链", "每人俱挂其篇",
       lambda T, N: N.update(event_people=[r for r in N["event_people"] if r["person_id"] != "P_CHENGHUA"]))
inject("正向包含断：E346 source_ids 去 L002 而 Q630 仍挂之", "正向包含",
       lambda T, N: evn(N, "E346").update(source_ids="Z140;G016;S004"))
inject("以后出层／他支单立事目：E347 之 Z 层引文改挂 E346", "每事有经传骨架",
       lambda T, N: ps(N, "Q635").update(event_id="E346"))
inject("二叙相违只注一侧：E344 summary 去其对 Q624 之指", "二叙相违须互指",
       lambda T, N: evn(N, "E344").update(summary=evn(N, "E344")["summary"].replace("见 `Q624`", "见晋世家")))
inject("他支相抵只注一侧：E346 summary 去其对 Q633 之指", "二叙相违须互指",
       lambda T, N: evn(N, "E346").update(summary=evn(N, "E346")["summary"].replace("（`Q633`）", "")))

# ---------- r61-D 反证（裁二百一十六） ----------
inject("处置／兵事之词单用立亲至：胥童于攻郤氏事目复标亲至，所据「帥甲八百」", "处置／兵事之词单用不立亲至",
       lambda T, N: ep(N, "E342", "P_XUTONG").update(presence="亲至"))
inject("处置／兵事之词单用立亲至：胥童于劫二子事目复标亲至，所据「胥童以甲劫欒書中行偃於朝」", "处置／兵事之词单用不立亲至",
       lambda T, N: ep(N, "E343", "P_XUTONG").update(presence="亲至"))
inject("处置／兵事之词单用立亲至：栾书于执公事目只据「遂執公焉」（型4「执」单用仍不立；r61-I 改注入法：去其 Q623 之句）", "处置／兵事之词单用不立亲至",
       lambda T, N: ep(N, "E344", "P_LUANSHU").update(presence="亲至", role_in_event="「欒書。中行偃。遂執公焉」"))
inject("意欲之辞立亲至：中行偃于执公事目改亲至，所据只「中行偃欲伐之」（r61-I，裁二百二十 一②）", "将然之辞不立亲至",
       lambda T, N: ep(N, "E344", "P_XUNYAN").update(presence="亲至", role_in_event="《国语·晋语六》「中行偃欲伐之」"))
inject("将然之辞立亲至：郤锜于攻郤氏事目只据「三郤將謀於榭」", "将然之辞不立亲至",
       lambda T, N: ep(N, "E342", "P_XIQI").update(role_in_event="被杀者；「三郤將謀於榭」"))
inject("受事者之亲至去其地之文：郤犨于攻郤氏事目 role 去「於其位」之句", "受事者之亲至须有甲①之文",
       lambda T, N: ep(N, "E342", "P_XICHOU").update(role_in_event="被杀者（「苦成叔」）"))

print(f"\n合计：PASS {PASS}  FAIL {FAIL}  反证未红 {RED_FAIL}（反证 {NINJ} 条）")
if RED_FAIL: sys.exit(2)
sys.exit(1 if FAIL else 0)
