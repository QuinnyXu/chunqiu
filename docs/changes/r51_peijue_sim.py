# -*- coding: utf-8 -*-
"""
round51_peijue 合并模拟 —— 孔门与鲁政配角七人（批丙，Sophia r51 备料）

用法（仓库根目录执行）：
    python data/incoming/round51_peijue/sim_peijue.py

做什么：
  1. 把 data/csv/ 全表复制到临时专用子目录 mergesim_peijue/；
  2. 将本件四张 *_new.csv 逐表 append 于表尾（**纯新增，无整行替换、无删除**）；
  3. 于该副本上跑 tools/validate.py，报实测退出码与输出；
  4. 跑本件全部机器断言（行数、ID 段、外键、正向包含、表头、分层纪律、presence 逐条、
     `events` 一字未动之反证、织边之界、卫生）。

体例照 `docs/changes/r49_kongzi_sim.py` 与 `r50_diwang_sim.py`。
临时目录由 tempfile.gettempdir() 推得，可用环境变量 CHUNQIU_SIM_TMP 覆写，不写死。
本脚本不属数据，不入 data/csv/。
"""
import csv, os, re, shutil, subprocess, sys, tempfile

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
csv.field_size_limit(10 ** 7)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
CSV = os.path.join(ROOT, "data", "csv")
TMP = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_peijue")

TABLES = ["events", "passages", "sources", "people", "event_people",
          "relations", "places", "archaeology", "background"]
NEW = {"people": "people_new.csv", "event_people": "event_people_new.csv",
       "relations": "relations_new.csv", "passages": "passages_new.csv"}

# 合入前基线（2026-09-20 实读 HEAD bf4242c；与 site/data/meta.json generated_at 2026-09-20T03:16:49+00:00 相符）
BEFORE = {"events": 265, "passages": 506, "sources": 195, "people": 166,
          "event_people": 673, "relations": 289, "places": 104,
          "archaeology": 8, "background": 11}
ADD = {"events": 0, "passages": 3, "sources": 0, "people": 7,
       "event_people": 19, "relations": 20, "places": 0,
       "archaeology": 0, "background": 0}

SEVEN = ["P_ZILU", "P_ZIGONG", "P_RANYOU", "P_YANGHU",
         "P_JIHUANZI", "P_JIKANGZI", "P_ZIFUJINGBO"]

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


def rd(path):
    with open(path, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def hdr(path):
    with open(path, encoding="utf-8", newline="") as f:
        return next(csv.reader(f))


# ---------- 0. 表头逐字全同 ＋ 文件卫生 ----------
sec("0. 表头与文件卫生")
for t, fn in NEW.items():
    h_main, h_new = hdr(os.path.join(CSV, t + ".csv")), hdr(os.path.join(HERE, fn))
    ck(h_main == h_new, f"{t} 表头不同：主表 {h_main} / 增量 {h_new}")
    ck(not any(c.lower().startswith("novel") for c in h_new),
       f"{fn} 含 novel* 列（§7 私有层护栏、CLAUDE.md 红线 5）")
    for r in rd(os.path.join(HERE, fn)):
        key = list(r.values())[0]
        for k, v in r.items():
            ck(v is not None and "\n" not in v, f"{fn} {key} 栏 {k} 含嵌入换行")
            ck(v is not None and "\t" not in v, f"{fn} {key} 栏 {k} 含制表符")

# ---------- 1. 合并模拟 ----------
sec("1. 合并模拟（复制主表 → append 新增；本件无整行替换）")
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
    ck(len(rd(os.path.join(CSV, t + ".csv"))) == before,
       f"{t} 主表基线 != {before}（基线已变，须重核）")

# ---------- 3. `events` 一字未动（裁七、裁九、§五）----------
sec("3. events 一字未动之反证")
with open(os.path.join(CSV, "events.csv"), encoding="utf-8") as f:
    ev_before = f.read()
with open(os.path.join(simcsv, "events.csv"), encoding="utf-8") as f:
    ev_after = f.read()
ck(ev_before == ev_after, "events.csv 在模拟中被改动（本轮该表全程一字不动）")
ck(ADD["events"] == 0 and not os.path.exists(os.path.join(HERE, "events_new.csv")),
   "本件出现 events_new.csv（新立事目须先上报过裁）")
ck(not os.path.exists(os.path.join(HERE, "fixes_events.csv")),
   "本件出现 fixes_events.csv（events 一字不动）")
for fx in ("fixes_people.csv", "fixes_relations.csv", "fixes_passages.csv",
           "fixes_event_people.csv", "fixes_places.csv", "fixes_sources.csv"):
    ck(not os.path.exists(os.path.join(HERE, fx)),
       f"本件出现 {fx}（本批纯新增，修正一律走 CHANGES.md 修正建议节）")
# E281.place_id 仍留空（r50 裁七在案）
E281 = next(r for r in merged["events"] if r["id"] == "E281")
ck(E281["place_id"].strip() == "", "E281.place_id 非空（r50 裁七：不挂）")

# ---------- 4. ID 唯一 / 接号 / 网段 ----------
sec("4. ID 唯一 / 接号 / 网段")
for t in TABLES:
    if merged[t] and "id" in merged[t][0]:
        ids = [r["id"] for r in merged[t]]
        ck(len(ids) == len(set(ids)),
           f"{t}.id 有重复：{[i for i in ids if ids.count(i) > 1][:5]}")

newP = [r["id"] for r in rd(os.path.join(HERE, "people_new.csv"))]
newQ = [r["id"] for r in rd(os.path.join(HERE, "passages_new.csv"))]
newR = [r["id"] for r in rd(os.path.join(HERE, "relations_new.csv"))]
ck(newP == SEVEN, f"people 新 ID 与所报七人不符：{newP}")
ck(all(re.fullmatch(r"P_[A-Z]+", i) for i in newP), f"people 新 ID 不合 ^P_[A-Z]+$：{newP}")
ck(newQ == ["Q524", "Q525", "Q526"], f"passages 新号非 Q524–Q526 连号：{newQ}")
ck(newR == ["R%03d" % n for n in range(307, 327)], f"relations 新号非 R307–R326 连号：{newR}")
# 网段（裁七）：passages 自 Q524 起；relations 只接台账尾号
ck(all(int(i[1:]) >= 524 for i in newQ), "passages 新号低于网段起点 Q524")
old_q = max(int(r["id"][1:]) for r in rd(os.path.join(CSV, "passages.csv"))
            if re.fullmatch(r"Q\d+", r["id"]))
old_r = max(int(r["id"][1:]) for r in rd(os.path.join(CSV, "relations.csv")))
ck(old_q == 523, f"主表 passages 尾号非 Q523（实测 Q{old_q}，基线已变，须重核网段）")
ck(old_r == 306, f"主表 relations 尾号非 R306（实测 R{old_r}，基线已变，须重接尾号）")
# 撞名撞音：新 ID 不得与库内既有 ID 相同
oldPID = {r["id"] for r in rd(os.path.join(CSV, "people.csv"))}
for i in newP:
    ck(i not in oldPID, f"people 新 ID {i} 与库内既有行撞号")
# 退役 ID 不得复用
for dead in ("E005", "E006", "Z098"):
    ck(dead not in newP + newQ + newR, f"用到退役 ID {dead}")

# ---------- 5. 外键 ＋ 正向包含（§7 v1.21） ----------
sec("5. 外键与正向包含")
EID = {r["id"] for r in merged["events"]}
PID = {r["id"] for r in merged["people"]}
SID = {r["id"] for r in merged["sources"]}
EVMAP = {r["id"]: r for r in merged["events"]}
for r in rd(os.path.join(HERE, "passages_new.csv")):
    ck(r["event_id"] in EID, f"{r['id']}.event_id {r['event_id']} 无此事目")
    ck(r["source_id"] in SID, f"{r['id']}.source_id {r['source_id']} 无此源")
    ck(r["source_id"] in EVMAP[r["event_id"]]["source_ids"].split(";"),
       f"{r['id']} 之源 {r['source_id']} 不在 {r['event_id']}.source_ids（正向包含失败，§7 v1.21）")
for r in rd(os.path.join(HERE, "event_people_new.csv")):
    ck(r["event_id"] in EID, f"event_people {r['event_id']} 无此事目")
    ck(r["person_id"] in PID, f"event_people {r['person_id']} 无此人")
for r in rd(os.path.join(HERE, "relations_new.csv")):
    ck(r["person_a"] in PID and r["person_b"] in PID, f"{r['id']} 之人物 id 无此人")
    ck(r["person_a"] != r["person_b"], f"{r['id']} person_a 与 person_b 相同")
# 挂链无重（同一 event+person 只一行）——append 不覆盖之护栏
epk = [(r["event_id"], r["person_id"]) for r in merged["event_people"]]
ck(len(epk) == len(set(epk)),
   f"event_people 有重复 (event,person)：{[k for k in epk if epk.count(k) > 1][:5]}")
# 既有 event_people 行一字未动（append 不覆盖）
old_ep = rd(os.path.join(CSV, "event_people.csv"))
ck(merged["event_people"][:len(old_ep)] == old_ep, "既有 event_people 行被改动（本批只 append）")
old_pe = rd(os.path.join(CSV, "people.csv"))
ck(merged["people"][:len(old_pe)] == old_pe, "既有 people 行被改动（本批只 append）")

# ---------- 6. 枚举与数值 ----------
sec("6. 枚举与数值")
for r in rd(os.path.join(HERE, "event_people_new.csv")):
    ck(r["presence"] in {"亲至", "相关", "不在"},
       f"{r['event_id']}/{r['person_id']} presence '{r['presence']}' 非三值")
    ck(r["directness"] in {"direct", "indirect"},
       f"{r['event_id']}/{r['person_id']} directness 非二值")
    ck(r["role_in_event"].strip() != "", f"{r['event_id']}/{r['person_id']} role_in_event 空")
REL_TYPES = {"亲属-直系", "亲属-同辈", "婚姻", "君臣", "拥立", "敌对", "师友", "其他"}
for r in rd(os.path.join(HERE, "relations_new.csv")):
    ck(r["rel_type"] in REL_TYPES, f"{r['id']}.rel_type '{r['rel_type']}' 不在八类")
    ck(r["reliability"] in {"high", "medium", "low"}, f"{r['id']}.reliability 非三级")
    ck(r["rel_label"].strip() != "", f"{r['id']}.rel_label 空")
    ck(r["source_note"].strip() != "", f"{r['id']}.source_note 空（relations 无 notes 栏，据落此栏）")
for r in rd(os.path.join(HERE, "people_new.csv")):
    ck(r["is_protagonist"] == "0", f"{r['id']}.is_protagonist != 0（口径五：七人全部不升主角）")
    for fld in ("birth_year_bce", "death_year_bce"):
        v = r[fld].strip()
        ck(v == "" or (re.fullmatch(r"-\d+", v) and -800 <= int(v) <= -464),
           f"{r['id']}.{fld} '{v}' 非负整数或逾 [-800,-464]")
    for fld in ("xing", "shi", "ming", "zi"):
        ck(r[fld].upper() not in {"NULL", "N/A", "NA"}, f"{r['id']}.{fld} 写了 NULL/N/A")
        ck("," not in r[fld], f"{r['id']}.{fld} 含 ASCII 逗号")
    ck(r["name"].strip() != "" and r["notes"].strip() != "" and r["short_bio"].strip() != "",
       f"{r['id']} name/notes/short_bio 有空栏")
# 主角数不变（七人全 0）
ck(sum(1 for r in merged["people"] if r["is_protagonist"] == "1") == 34,
   "合入后主角数 != 34（本批不升主角，前端 PROTAGONISTS 不须动）")

# ---------- 7. 分层纪律与批次帽 ----------
sec("7. 分层纪律与批次帽")
QT = {"原文", "言论", "后出叙事", "经义异闻", "诗歌", "评论", "出土文献"}
SOFT = {"诗歌", "经义异闻", "评论", "出土文献"}
for r in rd(os.path.join(HERE, "passages_new.csv")):
    ck(r["quote_type"] in QT, f"{r['id']}.quote_type '{r['quote_type']}' 不在枚举")
    if r["quote_type"] in SOFT:
        ck(re.match(r"^【[^】]+】", r["modern_note"]) is not None,
           f"{r['id']} quote_type={r['quote_type']} 而 modern_note 不以【层标】开头（软检）")
    ck(r["quote_original"].strip() != "" and r["modern_note"].strip() != "",
       f"{r['id']} quote_original／modern_note 有空栏")
    ck("．" not in r["quote_original"], f"{r['id']} quote_original 残留底本句读「．」（未转本库标点）")
    ck("{{" not in r["quote_original"] and "==" not in r["quote_original"],
       f"{r['id']} quote_original 残留 wiki 标记")
# 本批不新增 T 层来源、不挂 T 层引文（《论语》材料一律不入骨架）
Tids = {r["id"] for r in merged["sources"] if r["id"].startswith("T")}
ck(not any(r["source_id"] in Tids for r in rd(os.path.join(HERE, "passages_new.csv"))),
   "本批有 passage 挂 T 层来源（《论语》材料不入骨架）")
ck(not os.path.exists(os.path.join(HERE, "sources_new.csv")),
   "本件出现 sources_new.csv（本批不新增来源行，四源 Z106/Z112/Z123/Z131 俱在库）")
# 批次帽落每一行 notes
for r in rd(os.path.join(HERE, "people_new.csv")):
    ck(r["notes"].startswith("【批次帽】本批为孔门与鲁政配角"),
       f"{r['id']}.notes 未以批次帽开头（口径十）")
    ck("判据" in r["notes"], f"{r['id']}.notes 未著立行之据")
# 不立行之十六人不得入 people 表
BANNED = ["颜回", "顏回", "宰予", "曾参", "曾參", "子夏", "卜商", "言偃", "顓孫",
          "仲弓", "冉雍", "闵子骞", "閔子騫", "公西华", "原宪", "原憲", "漆雕",
          "公冶长", "巫马期", "有若", "澹台", "澹臺", "琴张", "琴張", "司马牛", "司馬牛",
          "子羔", "高柴", "樊迟", "樊遲", "孟懿子", "南宫敬叔", "南宮敬叔"]
for r in merged["people"]:
    for b in BANNED:
        ck(r["name"] != b and b not in r["alt_names"].split(";"),
           f"people 表出现不立行之名 '{b}'（{r['id']}，口径二／裁十）")

# ---------- 8. presence 从严·逐条比对本件所报之判 ----------
sec("8. presence 从严·逐条")
EXP = {
    # 回挂义务一·阳虎（裁九，逐目定）
    ("E278", "P_YANGHU"): ("direct", "亲至"),
    ("E279", "P_YANGHU"): ("direct", "亲至"),
    ("E280", "P_YANGHU"): ("direct", "亲至"),
    ("E281", "P_YANGHU"): ("direct", "亲至"),
    # 回挂义务二·七人于既有事目
    ("E282", "P_ZILU"): ("direct", "相关"),
    ("E292", "P_ZILU"): ("direct", "亲至"),
    ("E283", "P_ZIGONG"): ("direct", "亲至"),
    ("E284", "P_ZIGONG"): ("indirect", "相关"),
    ("E247", "P_ZIGONG"): ("direct", "亲至"),
    ("E302", "P_ZIGONG"): ("indirect", "相关"),
    ("E287", "P_RANYOU"): ("direct", "亲至"),
    ("E299", "P_RANYOU"): ("direct", "亲至"),
    ("E299", "P_JIKANGZI"): ("indirect", "相关"),
    ("E278", "P_JIHUANZI"): ("direct", "亲至"),
    ("E280", "P_JIHUANZI"): ("direct", "亲至"),
    ("E282", "P_JIHUANZI"): ("direct", "相关"),
    ("E285", "P_JIHUANZI"): ("direct", "亲至"),
    ("E285", "P_ZIFUJINGBO"): ("direct", "亲至"),
    ("E249", "P_ZIFUJINGBO"): ("direct", "亲至"),
}
got = {(r["event_id"], r["person_id"]): (r["directness"], r["presence"])
       for r in rd(os.path.join(HERE, "event_people_new.csv"))}
ck(len(got) == 19, f"本批挂链 {len(got)} 条 != 所报 19")
ck(set(got) == set(EXP),
   f"挂链集合与所报不符：多 {sorted(set(got) - set(EXP))} 少 {sorted(set(EXP) - set(got))}")
for k, v in EXP.items():
    ck(got.get(k) == v, f"{k} 实测 {got.get(k)} != 所报 {v}")
n_qin = sum(1 for v in got.values() if v[1] == "亲至")
n_xg = sum(1 for v in got.values() if v[1] == "相关")
n_bz = sum(1 for v in got.values() if v[1] == "不在")
print(f"   presence 三值实测：亲至 {n_qin}／相关 {n_xg}／不在 {n_bz}（合 {len(got)}）")
ck((n_qin, n_xg, n_bz) == (14, 5, 0), f"presence 三值实测 {(n_qin, n_xg, n_bz)} != 所报 (14,5,0)")
# 阳虎四目回挂之清偿（裁九）
yh = sorted(k[0] for k in got if k[1] == "P_YANGHU")
ck(yh == ["E278", "E279", "E280", "E281"], f"阳虎回挂之四目不全：{yh}")
old_ep_keys = {(r["event_id"], r["person_id"]) for r in old_ep}
for e in ("E278", "E279", "E280", "E281"):
    ck(("%s" % e, "P_YANGHU") not in old_ep_keys, f"{e} 既有挂链中已有 P_YANGHU（基线与任务书不符）")
# 七人逐人挂链数
BYP = {}
for k in got:
    BYP[k[1]] = BYP.get(k[1], 0) + 1
EXP_BYP = {"P_YANGHU": 4, "P_ZILU": 2, "P_ZIGONG": 4, "P_RANYOU": 2,
           "P_JIHUANZI": 4, "P_JIKANGZI": 1, "P_ZIFUJINGBO": 2}
print("   逐人挂链实测：" + "／".join("%s %d" % (p, BYP.get(p, 0)) for p in SEVEN))
ck(BYP == EXP_BYP, f"逐人挂链实测 {BYP} != 所报 {EXP_BYP}")

# ---------- 9. 织边之界（口径九） ----------
sec("9. 织边之界·师弟不织")
newrel = rd(os.path.join(HERE, "relations_new.csv"))
ck(not any(r["rel_type"] == "师友" for r in newrel),
   "本批织了「师友」类边（口径九：师弟关系《左传》《国语》无明文，只入注不织边）")
kz = [r for r in newrel if "P_KONGZI" in (r["person_a"], r["person_b"])]
ck(len(kz) == 3, f"孔子边实测 {len(kz)} 条 != 所报 3（R324／R325／R326）")
for r in kz:
    ck(r["rel_type"] == "其他", f"{r['id']} 孔子边之 rel_type 非「其他」：{r['rel_type']}")
    ck("师弟之属本库不立" in r["source_note"], f"{r['id']} source_note 未写明师弟之属不立")
# 同对同类不重（含反向）——validate 亦校，此处先自检
seen = {}
for r in merged["relations"]:
    key = (frozenset((r["person_a"], r["person_b"])), r["rel_type"])
    ck(key not in seen, f"{r['id']} 与 {seen.get(key)} 同对同类重复（含反向）")
    seen[key] = r["id"]
# 七人之间与七人对既有人物之边，两端必有其一在七人之内（本批不织无关之边）
for r in newrel:
    ck(r["person_a"] in SEVEN or r["person_b"] in SEVEN,
       f"{r['id']} 两端俱不在本批七人之内（越界织边）")

# ---------- 10. tools/validate.py ----------
sec("10. tools/validate.py（于副本上跑）")
p = subprocess.run([sys.executable, os.path.join(TMP, "tools", "validate.py")],
                   cwd=TMP, capture_output=True, text=True, encoding="utf-8", errors="replace")
print((p.stdout or "").rstrip())
if (p.stderr or "").strip():
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
