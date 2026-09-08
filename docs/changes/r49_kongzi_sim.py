# -*- coding: utf-8 -*-
"""
round49_kongzi 合并模拟 —— 孔子线批乙（Sophia r49 备料）

用法（仓库根目录执行）：
    python data/incoming/round49_kongzi/sim_kongzi.py

做什么：
  1. 把 data/csv/ 全表复制到临时专用子目录 mergesim_kongzi/；
  2. 将本件六张 *_new.csv 逐表 append 于表尾（纯新增）；
  3. 依 fixes_people.csv（P_KONGZI）、fixes_events.csv（E265／E285）作**按 id 整行替换**；
  4. 于该副本上跑 tools/validate.py，报实测退出码与输出；
  5. 跑本件全部机器断言（行数、ID 段、外键、正向包含、表头、分层纪律、presence、替换件之定点比对、卫生）。

临时目录由 tempfile.gettempdir() 推得，可用环境变量 CHUNQIU_SIM_TMP 覆写，不写死。
本脚本不属数据，不入 data/csv/。
"""
import csv, os, re, shutil, subprocess, sys, tempfile

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
csv.field_size_limit(10 ** 7)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
CSV = os.path.join(ROOT, "data", "csv")
TMP = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_kongzi")

TABLES = ["events", "passages", "sources", "people", "event_people",
          "relations", "places", "archaeology", "background"]
NEW = {"events": "events_new.csv", "passages": "passages_new.csv", "sources": "sources_new.csv",
       "event_people": "event_people_new.csv", "relations": "relations_new.csv",
       "places": "places_new.csv"}
FIX = {"people": "fixes_people.csv", "events": "fixes_events.csv"}

# 合入前基线（实读 HEAD ba02a9c，2026-09-07）
BEFORE = {"events": 258, "passages": 477, "sources": 193, "people": 166,
          "event_people": 649, "relations": 286, "places": 96,
          "archaeology": 8, "background": 11}
ADD = {"events": 7, "passages": 29, "sources": 2, "people": 0,
       "event_people": 23, "relations": 3, "places": 1,
       "archaeology": 0, "background": 0}
# 整行替换（不改行数）
REPL = {"people": ["P_KONGZI"], "events": ["E265", "E285"]}

PASS = FAIL = 0
SEC = "(未分节)"
DIST = {}


def sec(name):
    """分节：兼作标题打印与断言分布计数——分布须实测，不得凭估。"""
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


def rd(path):
    with open(path, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def hdr(path):
    with open(path, encoding="utf-8", newline="") as f:
        return next(csv.reader(f))


# ---------- 0. 表头逐字全同 ＋ 文件卫生 ----------
sec("0. 表头与文件卫生")
for t, fn in list(NEW.items()) + list(FIX.items()):
    h_main, h_new = hdr(os.path.join(CSV, t + ".csv")), hdr(os.path.join(HERE, fn))
    ck(h_main == h_new, f"{t} 表头不同：主表 {h_main} / 增量 {h_new}")
    ck(not any(c.startswith("novel") for c in h_new), f"{fn} 含 novel* 列（§7 私有层护栏）")
    for r in rd(os.path.join(HERE, fn)):
        for k, v in r.items():
            ck(v is None or "\n" not in (v or ""), f"{fn} {list(r.values())[0]} 栏 {k} 含嵌入换行")
            ck(v is None or "\t" not in (v or ""), f"{fn} {list(r.values())[0]} 栏 {k} 含制表符")

# ---------- 1. 合并模拟 ----------
sec("1. 合并模拟（复制主表 → append 新增 → 按 id 整行替换）")
if os.path.isdir(TMP):
    shutil.rmtree(TMP)
os.makedirs(TMP)
simcsv = os.path.join(TMP, "data", "csv")
os.makedirs(simcsv)
for t in TABLES:
    shutil.copy(os.path.join(CSV, t + ".csv"), os.path.join(simcsv, t + ".csv"))
for t, fn in NEW.items():
    rows = rd(os.path.join(HERE, fn))
    h = hdr(os.path.join(simcsv, t + ".csv"))
    with open(os.path.join(simcsv, t + ".csv"), "a", encoding="utf-8", newline="") as f:
        csv.DictWriter(f, fieldnames=h, lineterminator="\n").writerows(rows)
for t, fn in FIX.items():
    h = hdr(os.path.join(simcsv, t + ".csv"))
    repl = {r["id"]: r for r in rd(os.path.join(HERE, fn))}
    cur = rd(os.path.join(simcsv, t + ".csv"))
    hit = 0
    for i, r in enumerate(cur):
        if r["id"] in repl:
            cur[i] = repl[r["id"]]
            hit += 1
    ck(hit == len(repl), f"{fn} 替换命中 {hit} != {len(repl)}（有 id 在主表中不存在）")
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
    print("   {:<14}{:>8}{:>8}{:>8}  {}".format(t, before, after, exp, "相符" if after == exp else "**不符**"))
    ck(after == exp, f"{t} 合入后 {after} != 预期 {exp}")
    ck(len(rd(os.path.join(CSV, t + ".csv"))) == before, f"{t} 主表基线 != {before}（基线已变，须重核）")

# ---------- 3. ID 唯一 / 接号 / 网段 ----------
sec("3. ID 唯一 / 接号 / 网段")
for t in TABLES:
    if merged[t] and "id" in merged[t][0]:
        ids = [r["id"] for r in merged[t]]
        ck(len(ids) == len(set(ids)), f"{t}.id 有重复：{[i for i in ids if ids.count(i) > 1][:5]}")

newE = [r["id"] for r in rd(os.path.join(HERE, "events_new.csv"))]
newQ = [r["id"] for r in rd(os.path.join(HERE, "passages_new.csv"))]
newZG = [r["id"] for r in rd(os.path.join(HERE, "sources_new.csv"))]
newR = [r["id"] for r in rd(os.path.join(HERE, "relations_new.csv"))]
newL = [r["id"] for r in rd(os.path.join(HERE, "places_new.csv"))]
ck(newE == [f"E{n}" for n in range(296, 303)], f"events 新号非 E296–E302 连号：{newE}")
ck(newQ == [f"Q{n}" for n in range(495, 524)], f"passages 新号非 Q495–Q523 连号：{newQ}")
# 网段（2026-09-03 领队裁定备案 1）：events E296–E315、passages Q495–Q560
ck(all(296 <= int(i[1:]) <= 315 for i in newE), "events 新号逾网段 E296–E315")
ck(all(495 <= int(i[1:]) <= 560 for i in newQ), "passages 新号逾网段 Q495–Q560")
ck(newZG == ["Z133", "G013"], f"sources 新号非接台账尾号 Z133／G013：{newZG}")
ck(newR == ["R304", "R305", "R306"], f"relations 新号非接台账尾号 R304–R306：{newR}")
ck(newL == ["L_DAYE"], f"places 新号非 L_DAYE：{newL}")
# 退役 ID 不得复用
for dead in ("E005", "E006", "Z098"):
    ck(dead not in newE + newQ + newZG, f"用到退役 ID {dead}")
# 主表尾号未被本件占用之前即为 E295/Q494/Z132/R303
ck(max(int(r["id"][1:]) for r in rd(os.path.join(CSV, "events.csv")) if re.fullmatch(r"E\d+", r["id"])) == 295,
   "主表 events 尾号非 E295（基线已变）")
ck(max(int(r["id"][1:]) for r in rd(os.path.join(CSV, "passages.csv")) if re.fullmatch(r"Q\d+", r["id"])) == 494,
   "主表 passages 尾号非 Q494（基线已变）")

# ---------- 4. 外键 ＋ 正向包含（§7 v1.21） ----------
sec("4. 外键与正向包含")
EID = {r["id"] for r in merged["events"]}
PID = {r["id"] for r in merged["people"]}
SID = {r["id"] for r in merged["sources"]}
LID = {r["id"] for r in merged["places"]}
EVMAP = {r["id"]: r for r in merged["events"]}
for r in rd(os.path.join(HERE, "passages_new.csv")):
    ck(r["event_id"] in EID, f"{r['id']}.event_id {r['event_id']} 无此事目")
    ck(r["source_id"] in SID, f"{r['id']}.source_id {r['source_id']} 无此源")
    ck(r["source_id"] in EVMAP[r["event_id"]]["source_ids"].split(";"),
       f"{r['id']} 之源 {r['source_id']} 不在 {r['event_id']}.source_ids（正向包含失败，§7 v1.21）")
for r in rd(os.path.join(HERE, "events_new.csv")):
    ck(r["place_id"] == "" or r["place_id"] in LID, f"{r['id']}.place_id {r['place_id']} 无此点")
    for s in r["source_ids"].split(";"):
        ck(s in SID, f"{r['id']}.source_ids 之 {s} 无此源")
for r in rd(os.path.join(HERE, "event_people_new.csv")):
    ck(r["event_id"] in EID, f"event_people {r['event_id']} 无此事目")
    ck(r["person_id"] in PID, f"event_people {r['person_id']} 无此人")
for r in rd(os.path.join(HERE, "relations_new.csv")):
    ck(r["person_a"] in PID and r["person_b"] in PID, f"{r['id']} 之人物 id 无此人")
for r in rd(os.path.join(HERE, "places_new.csv")):
    for s in r["source_ids"].split(";"):
        ck(s in SID, f"{r['id']}.source_ids 之 {s} 无此源")
# 挂链无重（同一 event+person 只一行）
epk = [(r["event_id"], r["person_id"]) for r in merged["event_people"]]
ck(len(epk) == len(set(epk)), f"event_people 有重复 (event,person)：{[k for k in epk if epk.count(k) > 1][:5]}")
# 新事目一律有挂链（不新开零挂链事目）
for e in newE:
    ck(any(r["event_id"] == e for r in merged["event_people"]), f"{e} 无任何挂链（零挂链事目）")

# ---------- 5. 枚举与数值 ----------
sec("5. 枚举与数值")
CATS = {"即位", "战争", "会盟", "相会", "婚嫁", "生育", "出奔", "弑杀", "薨卒", "丧葬",
        "外交", "内乱", "灾异", "礼俗", "政制", "论对", "其他"}
for r in rd(os.path.join(HERE, "events_new.csv")):
    ck(r["category"] in CATS, f"{r['id']}.category '{r['category']}' 不在 17 类枚举")
    ck(r["reliability"] in {"high", "medium", "low"}, f"{r['id']}.reliability 非三级")
    ck(r["importance"] in {"1", "2", "3"}, f"{r['id']}.importance 非 1/2/3")
    ck(-800 <= int(r["year_bce"]) <= -464, f"{r['id']}.year_bce 逾 [-800,-464]")
for r in rd(os.path.join(HERE, "event_people_new.csv")):
    ck(r["presence"] in {"亲至", "相关", "不在"}, f"{r['event_id']}/{r['person_id']} presence 非三值")
    ck(r["directness"] in {"direct", "indirect"}, f"{r['event_id']}/{r['person_id']} directness 非二值")
for r in rd(os.path.join(HERE, "relations_new.csv")):
    ck(r["rel_type"] in {"亲属-直系", "亲属-同辈", "婚姻", "君臣", "拥立", "敌对", "师友", "其他"},
       f"{r['id']}.rel_type 不在八类")
    ck(r["reliability"] in {"high", "medium", "low"}, f"{r['id']}.reliability 非三级")
for r in rd(os.path.join(HERE, "places_new.csv")):
    ck(r["certainty"] in {"high", "medium", "low"}, f"{r['id']}.certainty 非三级")
    ck(r["lat"] == "" and r["lng"] == "" and r["coord_certainty"] == "",
       f"{r['id']} 坐标三栏非全空（本批从严留空）")

# ---------- 6. 同年 sort_key 不重 ----------
sec("6. 同年 sort_key 不重")
byyear = {}
for r in merged["events"]:
    if r["sort_key"].strip():
        byyear.setdefault(r["year_bce"], []).append((r["sort_key"], r["id"]))
for y, lst in byyear.items():
    ks = [k for k, _ in lst]
    ck(len(ks) == len(set(ks)), f"{y} 年 sort_key 重复：{sorted(lst)}")

# ---------- 7. 分层纪律与层标 ----------
sec("7. 分层纪律与层标")
SOFT = {"诗歌", "经义异闻", "评论", "出土文献"}
QT = {"原文", "言论", "后出叙事", "经义异闻", "诗歌", "评论", "出土文献"}
for r in rd(os.path.join(HERE, "passages_new.csv")):
    ck(r["quote_type"] in QT, f"{r['id']}.quote_type '{r['quote_type']}' 不在枚举")
    if r["quote_type"] in SOFT:
        ck(re.match(r"^【[^】]+】", r["modern_note"]) is not None,
           f"{r['id']} quote_type={r['quote_type']} 而 modern_note 不以【…】层标开头（软检）")
    # 层标不得只复述类型名（§7 v1.20）
    m = re.match(r"^【([^】]+)】", r["modern_note"])
    if m:
        ck(m.group(1) not in QT, f"{r['id']} 层标『{m.group(1)}』只复述 quote_type，属空标签（§7 v1.20）")
# 本批不新增 T 层来源、不新增 T 层引文（《论语》材料一律不入骨架，永久帽即其法）
ck(not any(i.startswith("T") for i in newZG), "本批新增了 T 层来源行（与永久帽不符）")
Tids = {r["id"] for r in merged["sources"] if r["id"].startswith("T")}
ck(not any(r["source_id"] in Tids for r in rd(os.path.join(HERE, "passages_new.csv"))),
   "本批有 passage 挂 T 层来源（本批不收《论语》材料）")

# ---------- 8. presence 从严·逐条比对本件所报之判 ----------
sec("8. presence 从严·逐条")
EXP = {
    ("E206", "P_KONGZI"): ("indirect", "相关"), ("E221", "P_KONGZI"): ("indirect", "相关"),
    ("E276", "P_KONGZI"): ("indirect", "相关"), ("E277", "P_KONGZI"): ("indirect", "相关"),
    ("E281", "P_KONGZI"): ("indirect", "相关"), ("E282", "P_KONGZI"): ("direct", "亲至"),
    ("E284", "P_KONGZI"): ("indirect", "相关"), ("E285", "P_KONGZI"): ("indirect", "不在"),
    ("E286", "P_KONGZI"): ("indirect", "相关"), ("E287", "P_KONGZI"): ("indirect", "相关"),
    ("E289", "P_KONGZI"): ("direct", "亲至"), ("E290", "P_KONGZI"): ("indirect", "相关"),
    ("E292", "P_KONGZI"): ("indirect", "相关"), ("E296", "P_KONGZI"): ("indirect", "相关"),
    ("E297", "P_KONGZI"): ("direct", "亲至"), ("E297", "P_LUZHAOGONG"): ("direct", "亲至"),
    ("E298", "P_KONGZI"): ("direct", "亲至"), ("E299", "P_KONGZI"): ("direct", "亲至"),
    ("E300", "P_KONGZI"): ("direct", "亲至"), ("E301", "P_KONGZI"): ("direct", "亲至"),
    ("E301", "P_LUAIGONG"): ("direct", "亲至"), ("E302", "P_KONGZI"): ("indirect", "相关"),
    ("E302", "P_LUAIGONG"): ("indirect", "相关"),
}
got = {(r["event_id"], r["person_id"]): (r["directness"], r["presence"])
       for r in rd(os.path.join(HERE, "event_people_new.csv"))}
ck(set(got) == set(EXP), f"挂链集合与所报不符：多 {sorted(set(got)-set(EXP))} 少 {sorted(set(EXP)-set(got))}")
for k, v in EXP.items():
    ck(got.get(k) == v, f"{k} 实测 {got.get(k)} != 所报 {v}")
n_qin = sum(1 for v in got.values() if v[1] == "亲至")
n_xg = sum(1 for v in got.values() if v[1] == "相关")
n_bz = sum(1 for v in got.values() if v[1] == "不在")
print(f"   presence 三值实测：亲至 {n_qin}／相关 {n_xg}／不在 {n_bz}（合 {len(got)}）")
ck((n_qin, n_xg, n_bz) == (9, 13, 1), f"presence 三值实测 {(n_qin, n_xg, n_bz)} != 所报 (9,13,1)")
# 其中 P_KONGZI 一人：亲至 7／相关 12／不在 1（合 20）
k_qin = sum(1 for k, v in got.items() if k[1] == "P_KONGZI" and v[1] == "亲至")
k_xg = sum(1 for k, v in got.items() if k[1] == "P_KONGZI" and v[1] == "相关")
k_bz = sum(1 for k, v in got.items() if k[1] == "P_KONGZI" and v[1] == "不在")
print(f"   其中 P_KONGZI：亲至 {k_qin}／相关 {k_xg}／不在 {k_bz}（合 {k_qin + k_xg + k_bz}）")
ck((k_qin, k_xg, k_bz) == (7, 12, 1), f"P_KONGZI presence 实测 {(k_qin, k_xg, k_bz)} != 所报 (7,12,1)")
# 合入后 P_KONGZI 全库挂链数：既有 4（E195／E198／E199 三条「相关」＋ r45 试点所立 E274「亲至」）
# ＋ 本批 20 ＝ 24；三值合计 亲至 8／相关 15／不在 1
kall = [r for r in merged["event_people"] if r["person_id"] == "P_KONGZI"]
ck(len(kall) == 24, f"合入后 P_KONGZI 挂链 {len(kall)} 条（所报 24＝既有 4 ＋ 本批 20）")
kold = [r for r in rd(os.path.join(CSV, "event_people.csv")) if r["person_id"] == "P_KONGZI"]
ck(sorted(r["event_id"] for r in kold) == ["E195", "E198", "E199", "E274"],
   f"既有 P_KONGZI 挂链非 E195／E198／E199／E274：{sorted(r['event_id'] for r in kold)}")
ka = sum(1 for r in kall if r["presence"] == "亲至")
kx = sum(1 for r in kall if r["presence"] == "相关")
kb = sum(1 for r in kall if r["presence"] == "不在")
print(f"   合入后 P_KONGZI 全库：亲至 {ka}／相关 {kx}／不在 {kb}（合 {len(kall)}）")
ck((ka, kx, kb) == (8, 15, 1), f"合入后 P_KONGZI 全库三值 {(ka, kx, kb)} != 所报 (8,15,1)")
# 「不在」全库用例数（合入后）
allbz = [(r["event_id"], r["person_id"]) for r in merged["event_people"] if r["presence"] == "不在"]
ck(len(allbz) == 2, f"合入后全库「不在」用例 {len(allbz)} 条（所报 2）：{allbz}")

# ---------- 9. P_KONGZI 整行替换之定点比对 ----------
sec("9. P_KONGZI 整行替换·定点比对")
old = next(r for r in rd(os.path.join(CSV, "people.csv")) if r["id"] == "P_KONGZI")
new = next(r for r in merged["people"] if r["id"] == "P_KONGZI")
ck(old["is_protagonist"] == "0" and new["is_protagonist"] == "1", "is_protagonist 未由 0 改 1")
ck(new["alt_names"] == "仲尼;孔丘;丘;尼父", f"alt_names 未增「尼父」：{new['alt_names']}")
ck(new["active_years_bce"] == "前525-前479", f"active_years_bce 未改：{new['active_years_bce']}")
ck(new["role"] != old["role"] and "司寇" in new["role"], f"role 未改经传明文之职：{new['role']}")
ck("三次" not in new["short_bio"], "short_bio 仍留「三次」（修-2 未落实）")
for keep in ("以《左传》明文事件的配角身份入库，不升主角",   # round23 裁定 3 原文
             "姓氏之说本《史记·孔子世家》",                 # 姓氏自限句
             "经传不书"):                                    # 甲式永久帽
    ck(keep in new["notes"], f"notes 缺应照留之文：{keep}")
ck("round23" in new["notes"] and "推翻" in new["notes"], "notes 未记判定反转之过程（§7 v1.29）")
for same in ("id", "name", "xing", "shi", "ming", "zi", "state", "birth_year_bce", "death_year_bce"):
    ck(old[same] == new[same], f"P_KONGZI.{same} 被改动（本批不应动）：{old[same]} -> {new[same]}")
ck(new["state"] == "鲁", f"state 非单一「鲁」：{new['state']}")
# 主角数
ck(sum(1 for r in merged["people"] if r["is_protagonist"] == "1") == 34,
   "合入后主角数 != 34（前端 PROTAGONISTS 须同步，见 CHANGES §12）")

# ---------- 10. fixes_events 定点比对（只动 source_ids 一栏） ----------
sec("10. fixes_events 定点比对")
oldE = {r["id"]: r for r in rd(os.path.join(CSV, "events.csv"))}
for r in rd(os.path.join(HERE, "fixes_events.csv")):
    o = oldE[r["id"]]
    for k in o:
        if k == "source_ids":
            ck(o[k] != r[k], f"{r['id']}.source_ids 未变（替换无意义）")
            ck(r[k] == o[k] + ";G013", f"{r['id']}.source_ids 非仅追加 G013：{o[k]} -> {r[k]}")
        else:
            ck(o[k] == r[k], f"{r['id']}.{k} 被改动（本件只应动 source_ids）")

# ---------- 11. 摘录卫生 ----------
sec("11. 摘录卫生")
for r in rd(os.path.join(HERE, "passages_new.csv")):
    ck(r["quote_original"].strip() != "", f"{r['id']} quote_original 空")
    ck(r["modern_note"].strip() != "", f"{r['id']} modern_note 空")
    ck("．" not in r["quote_original"], f"{r['id']} quote_original 残留底本句读「．」（未转本库标点）")
    ck("{{" not in r["quote_original"], f"{r['id']} quote_original 残留 wiki 标记")

# ---------- 12. validate.py ----------
sec("12. tools/validate.py（于副本上跑）")
p = subprocess.run([sys.executable, os.path.join(TMP, "tools", "validate.py")],
                   cwd=TMP, capture_output=True, text=True, encoding="utf-8", errors="replace")
print((p.stdout or "").rstrip())
if p.stderr.strip():
    print("   stderr: " + p.stderr.strip())
print("   exit code = %d" % p.returncode)
ck(p.returncode == 0, "validate.py 退出码非 0")

# ---------- 汇总 ----------
print()
print("== 断言分布（实测） ==")
for k, v in DIST.items():
    print("   %-42s %4d" % (k, v))
print()
print("%d PASS  %d FAIL  exit %d" % (PASS, FAIL, 0 if FAIL == 0 else 1))
sys.exit(0 if FAIL == 0 else 1)
