# -*- coding: utf-8 -*-
"""
round46_jiliang 合并模拟 —— 季梁（随）点将件（Sophia r46 点将件备料）

用法（仓库根目录执行）：
    python data/incoming/round46_jiliang/sim_jiliang.py

做什么：
  1. 把 data/csv/ 全表复制到临时专用子目录 mergesim_jiliang/；
  2. 将本件七张 *_new.csv 逐表 append 于表尾（纯新增，无整行替换、无删除）；
  3. 于该副本上跑 tools/validate.py，报实测退出码与输出；
  4. 跑本件全部机器断言（基线、行数、ID 段、外键、枚举、分层、presence、
     引文与两底本逐字相符、地望留痕、既有行零改动、孤事目、卫生）。

临时目录由 tempfile.gettempdir() 推得，可用环境变量 CHUNQIU_SIM_TMP 覆写，不写死。
本脚本不属数据，不入 data/csv/。
"""
import csv, os, re, shutil, subprocess, sys, tempfile

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
CSV = os.path.join(ROOT, "data", "csv")
TMP = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_jiliang")

TABLES = ["events", "passages", "sources", "people", "event_people",
          "relations", "places", "archaeology", "background"]
NEW = {"events": "events_new.csv", "passages": "passages_new.csv", "sources": "sources_new.csv",
       "people": "people_new.csv", "event_people": "event_people_new.csv",
       "relations": "relations_new.csv", "places": "places_new.csv"}

# 合入前基线（实读 2026-09-02 21:24，工作树含批甲 round46_gugan 已合入、尚未提交；
# 其时 HEAD 为 13391c8。批甲于本件备料期间合入完毕并归档 docs/changes/r46_gugan.md，
# data/incoming/round46_gugan/ 已清空。）
BEFORE = {"events": 256, "passages": 471, "sources": 192, "people": 164,
          "event_people": 645, "relations": 285, "places": 95,
          "archaeology": 8, "background": 11}
ADD = {"events": 2, "passages": 6, "sources": 1, "people": 2,
       "event_people": 4, "relations": 1, "places": 1,
       "archaeology": 0, "background": 0}

# 本件所占 ID（起讫写死，撞号即红）
NEW_IDS = {
    "events": ["E294", "E295"],
    "passages": ["Q489", "Q490", "Q491", "Q492", "Q493", "Q494"],
    "sources": ["Z132"],
    "people": ["P_JILIANG", "P_SUISHAOSHI"],
    "relations": ["R303"],
    "places": ["L_SUIGUO"],
}

# 引文逐字对照（去标点后）。两底本 2026-09-02 实取：
#   ctext        https://ctext.org/chun-qiu-zuo-zhuan/huan-gong-{liu,ba}-nian/zh
#   维基文库      《春秋左氏傳/桓公》 action=raw
# 本库正文取 ctext 之形（氏字作「鬥」）；将「鬥」→「鬬」即得维基文库之形，余字全同。
HUAN6_CT = (
    "楚武王侵隨使薳章求成焉軍於瑕以待之隨人使少師董成鬥伯比言于楚子曰吾不得志於漢東也我則使然我張吾三軍而被吾甲兵"
    "以武臨之彼則懼而協以謀我故難間也漢東之國隨為大隨張必棄小國小國離楚之利也少師侈請羸師以張之熊率且比曰季梁在何益"
    "鬥伯比曰以為後圖少師得其君王毀軍而納少師少師歸請追楚師隨侯將許之季梁止之曰天方授楚楚之羸其誘我也君何急焉"
    "臣聞小之能敵大也小道大淫所謂道忠於民而信於神也上思利民忠也祝史正辭信也今民餒而君逞欲祝史矯舉以祭臣不知其可也"
    "公曰吾牲牷肥腯粢盛豐備何則不信對曰夫民神之主也是以聖王先成民而後致力於神故奉牲以告曰博碩肥腯謂民力之普存也"
    "謂其畜之碩大蕃滋也謂其不疾瘯蠡也謂其備腯咸有也奉盛以告曰絜粢豐盛謂其三時不害而民和年豐也奉酒醴以告曰嘉栗旨酒"
    "謂其上下皆有嘉德而無違心也所謂馨香無讒慝也故務其三時脩其五教親其九族以致其禋祀於是乎民和而神降之福故動則有成"
    "今民各有心而鬼神乏主君雖獨豐其何福之有君姑脩政而親兄弟之國庶免於難隨侯懼而脩政楚不敢伐"
)
HUAN8_CT = (
    "隨少師有寵楚鬥伯比曰可矣讎有釁不可失也夏楚子合諸侯于沈鹿黃隨不會使薳章讓黃楚子伐隨軍於漢淮之間季梁請下之"
    "弗許而後戰所以怒我而怠寇也少師謂隨侯曰必速戰不然將失楚師隨侯禦之望楚師季梁曰楚人上左君必左無與王遇且攻其右"
    "右無良焉必敗偏敗眾乃攜矣少師曰不當王非敵也弗從戰于速杞隨師敗績隨侯逸鬥丹獲其戎車與其戎右少師秋隨及楚平"
    "楚子將不許鬥伯比曰天去其疾矣隨未可克也乃盟而還"
)
PUNC = "，。：；「」『』？！、（）　 \n《》"
def strip_punc(s):
    return "".join(c for c in s if c not in PUNC)

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

def raw_rows(path):
    """整行文本（含表头）——用于「既有行零改动」之逐行比对。"""
    with open(path, encoding="utf-8", newline="") as f:
        return f.read().split("\n")

# ---------- 0. 表头逐字全同 ＋ 文件卫生 ----------
sec("0. 表头与文件卫生")
for t, fn in NEW.items():
    h_main, h_new = hdr(os.path.join(CSV, t + ".csv")), hdr(os.path.join(HERE, fn))
    ck(h_main == h_new, f"{t} 表头不同：主表 {h_main} / 增量 {h_new}")
    ck(not any(c.strip().lower().startswith("novel") for c in h_new),
       f"{fn} 含 novel* 列（红线 5／§7 私有层护栏）")
    raw = open(os.path.join(HERE, fn), encoding="utf-8").read()
    ck(not raw.startswith("﻿"), f"{fn} 带 BOM")
    ck("\r" not in raw, f"{fn} 含 CR（应为 LF）")
    ck(raw.endswith("\n"), f"{fn} 未以换行结尾")

# ---------- 1. 基线实读 ----------
sec("1. 基线（合入前实读）")
base = {t: rd(os.path.join(CSV, t + ".csv")) for t in TABLES}
for t in TABLES:
    ck(len(base[t]) == BEFORE[t],
       f"基线 {t} 实读 {len(base[t])} ≠ 预期 {BEFORE[t]}"
       f"（若批甲 round46_gugan 之合入状态与本件备料时不同，此处必红——请照实上报，勿改数据）")

# ---------- 2. 建合并副本 ----------
if os.path.isdir(TMP):
    shutil.rmtree(TMP)
simcsv = os.path.join(TMP, "data", "csv")
os.makedirs(simcsv)
for t in TABLES:
    shutil.copy(os.path.join(CSV, t + ".csv"), os.path.join(simcsv, t + ".csv"))
for t, fn in NEW.items():
    src = os.path.join(HERE, fn)
    rows = rd(src)
    h = hdr(src)
    with open(os.path.join(simcsv, t + ".csv"), "a", encoding="utf-8", newline="") as f:
        w = csv.writer(f, lineterminator="\n")
        for r in rows:
            w.writerow([r[c] for c in h])
os.makedirs(os.path.join(TMP, "tools"))
shutil.copy(os.path.join(ROOT, "tools", "validate.py"), os.path.join(TMP, "tools", "validate.py"))

merged = {t: rd(os.path.join(simcsv, t + ".csv")) for t in TABLES}

# ---------- 3. 行数 ----------
sec("3. 行数（基线＋增量）")
for t in TABLES:
    ck(len(merged[t]) == BEFORE[t] + ADD[t],
       f"{t} 合并后 {len(merged[t])} ≠ {BEFORE[t]}+{ADD[t]}={BEFORE[t]+ADD[t]}")
ck(sum(ADD.values()) == 17, f"本件新增合计 {sum(ADD.values())} ≠ 17")

# ---------- 4. 既有行零改动（纯新增之证） ----------
sec("4. 既有行零改动（纯新增）")
for t in TABLES:
    a = raw_rows(os.path.join(CSV, t + ".csv"))
    b = raw_rows(os.path.join(simcsv, t + ".csv"))
    n = len(a) if a[-1] != "" else len(a) - 1
    ck(b[:n] == a[:n], f"{t}：合并副本前 {n} 行与主表不全同——本件当为纯新增，出现改动即红")

# ---------- 5. ID 段：起讫、不撞号、连续、余号未占 ----------
sec("5. ID 段与撞号")
for t, ids in NEW_IDS.items():
    old = {r["id"] for r in base[t]}
    for i in ids:
        ck(i not in old, f"{t}：新 ID {i} 与主表既有 ID 撞号")
    newids = [r["id"] for r in merged[t]][-len(ids):]
    ck(newids == ids, f"{t}：表尾新增 ID {newids} ≠ 预期 {ids}")
    ck(len({r["id"] for r in merged[t]}) == len(merged[t]), f"{t}：合并后 id 有重复")
# 网段：接批甲实际尾号之后
ck(max(r["id"] for r in base["events"] if re.match(r"^E\d+$", r["id"])) == "E293",
   "批甲 events 实际尾号非 E293——网段前提已变，请复核")
ck(max(r["id"] for r in base["passages"] if re.match(r"^Q\d+$", r["id"])) == "Q488",
   "批甲 passages 实际尾号非 Q488——网段前提已变，请复核")
ck(max(r["id"] for r in base["relations"]) == "R302", "relations 台账尾号非 R302")
zs = sorted(int(r["id"][1:]) for r in base["sources"] if r["id"].startswith("Z"))
ck(zs[-1] == 131, f"sources Z 台账尾号非 Z131（实测 Z{zs[-1]:03d}）")
# 批甲网段内未占之号，本件亦不得越占
allev = {r["id"] for r in merged["events"]}
ck("E296" not in allev, "E296 被占——批甲网段内余号，本件只取 E294–E295")
allq = {r["id"] for r in merged["passages"]}
ck("Q495" not in allq, "Q495 被占——本件只取 Q489–Q494")
# 退役 ID 不得复用
for dead in ("E005", "E006", "Z098"):
    ck(dead not in {r["id"] for r in merged["events"]} | {r["id"] for r in merged["sources"]}
       or dead in {r["id"] for r in base["events"]} | {r["id"] for r in base["sources"]},
       f"退役 ID {dead} 被本件复用")

# ---------- 6. 外键 ----------
sec("6. 外键（合并后全库）")
ev = {r["id"] for r in merged["events"]}
pp = {r["id"] for r in merged["people"]}
pl = {r["id"] for r in merged["places"]}
sr = {r["id"] for r in merged["sources"]}
for r in merged["passages"]:
    ck(r["event_id"] in ev, f"passages {r['id']}.event_id={r['event_id']} 悬引")
    ck(r["source_id"] in sr, f"passages {r['id']}.source_id={r['source_id']} 悬引")
for r in merged["events"]:
    ck(r["place_id"] == "" or r["place_id"] in pl, f"events {r['id']}.place_id={r['place_id']} 悬引")
    for s in filter(None, r["source_ids"].split(";")):
        ck(s in sr, f"events {r['id']}.source_ids 含悬引 {s}")
for r in merged["event_people"]:
    ck(r["event_id"] in ev, f"event_people {r['event_id']} 悬引")
    ck(r["person_id"] in pp, f"event_people {r['event_id']}/{r['person_id']} 人物悬引")
for r in merged["relations"]:
    ck(r["person_a"] in pp and r["person_b"] in pp, f"relations {r['id']} 人物悬引")
for r in merged["places"]:
    for s in filter(None, r["source_ids"].split(";")):
        ck(s in sr, f"places {r['id']}.source_ids 含悬引 {s}")
# 正向包含：passage 之源须见于其所挂事目之 source_ids（§7 v1.21 判例）
evsrc = {r["id"]: set(filter(None, r["source_ids"].split(";"))) for r in merged["events"]}
for r in merged["passages"]:
    if r["id"] in NEW_IDS["passages"]:
        ck(r["source_id"] in evsrc[r["event_id"]],
           f"{r['id']} 之源 {r['source_id']} 不在 {r['event_id']}.source_ids 中（§7 v1.21）")

# ---------- 7. 枚举与字段规约 ----------
sec("7. 枚举与字段规约")
CATS = {"即位","战争","会盟","相会","婚嫁","生育","出奔","弑杀","薨卒","丧葬",
        "外交","内乱","灾异","礼俗","政制","论对","其他"}
newev = [r for r in merged["events"] if r["id"] in NEW_IDS["events"]]
for r in newev:
    ck(r["category"] in CATS, f"{r['id']} category={r['category']} 非法")
    ck(r["reliability"] == "high", f"{r['id']} reliability={r['reliability']} ≠ high")
    ck(r["importance"] in {"1","2","3"}, f"{r['id']} importance 非法")
    ck(-800 <= int(r["year_bce"]) <= -464, f"{r['id']} year_bce 越界")
    ck(r["place_id"] == "L_SUIGUO", f"{r['id']} place_id={r['place_id']} ≠ L_SUIGUO")
ck([r["category"] for r in newev] == ["战争", "战争"], "两新事目分类应俱为「战争」")
ck([r["year_bce"] for r in newev] == ["-706", "-704"], "两新事目年份应为 -706／-704")
ck([r["importance"] for r in newev] == ["1", "2"], "importance 应为 E294=1、E295=2")
ck([r["sort_key"] for r in newev] == ["5", "10"], "sort_key 应为 E294=5、E295=10")
ck(newev[1]["season_month"] == "夏、秋", "E295.season_month 应作「夏、秋」两季并书")
# 同年内 sort_key 不重复（全库复检）
byyear = {}
for r in merged["events"]:
    if r["sort_key"]:
        byyear.setdefault(r["year_bce"], []).append(r["sort_key"])
for y, ks in byyear.items():
    ck(len(ks) == len(set(ks)), f"{y} 年内 sort_key 重复：{ks}")
for r in merged["passages"]:
    if r["id"] in NEW_IDS["passages"]:
        ck(r["quote_type"] == "原文", f"{r['id']} quote_type={r['quote_type']} ≠ 原文")
newep = [r for r in merged["event_people"] if r["event_id"] in NEW_IDS["events"]]
for r in newep:
    ck(r["presence"] in {"亲至", "相关", "不在"}, f"{r['event_id']}/{r['person_id']} presence 非法")
    ck(r["directness"] in {"direct", "indirect"}, f"{r['event_id']}/{r['person_id']} directness 非法")
ck(len(newep) == 4, f"新挂链应 4 条，实 {len(newep)}")
newrel = [r for r in merged["relations"] if r["id"] == "R303"][0]
ck(newrel["rel_type"] == "其他", "R303 rel_type 应取「其他」（不取「敌对」，判据见 source_note）")
ck(newrel["reliability"] == "high", "R303 reliability 应为 high")

# ---------- 8. presence 逐人逐目（从严） ----------
sec("8. presence 逐人逐目")
want = {("E294", "P_JILIANG"): "亲至", ("E294", "P_SUISHAOSHI"): "亲至",
        ("E295", "P_JILIANG"): "亲至", ("E295", "P_SUISHAOSHI"): "亲至"}
got = {(r["event_id"], r["person_id"]): r["presence"] for r in newep}
ck(got == want, f"presence 实测 {got} ≠ 预期 {want}")
for r in newep:
    ck(r["directness"] == "direct", f"{r['event_id']}/{r['person_id']} directness 应为 direct")
    ck(len(r["role_in_event"]) > 20, f"{r['event_id']}/{r['person_id']} role_in_event 过简，应载明文")
# 「亲至」须有明文——逐条断言其 role_in_event 内引有经传原句
def rie(e, p):
    return [r["role_in_event"] for r in newep if r["event_id"] == e and r["person_id"] == p][0]
ck("季梁止之曰" in rie("E294", "P_JILIANG"), "E294/季梁 未引在场明文")
ck("少師歸，請追楚師" in rie("E294", "P_SUISHAOSHI"), "E294/少师 未引在场明文")
ck("季梁請下之" in rie("E295", "P_JILIANG"), "E295/季梁 未引在场明文")
ck("與其戎右少師" in rie("E295", "P_SUISHAOSHI"), "E295/少师 未引在场明文")
ck("秋「隨及楚平」一节传不书季梁" in rie("E295", "P_JILIANG"), "E295/季梁 未载秋盟无明文之自限")

# ---------- 9. 引文与两底本逐字相符 ----------
sec("9. 引文与两底本逐字相符")
pq = {r["id"]: r for r in merged["passages"] if r["id"] in NEW_IDS["passages"]}
h6 = "".join(strip_punc(pq[i]["quote_original"]) for i in ("Q489", "Q490", "Q491"))
h8 = "".join(strip_punc(pq[i]["quote_original"]) for i in ("Q492", "Q493", "Q494"))
ck(len(h6) == 419, f"桓六三条拼接去标点 {len(h6)} 字 ≠ 419")
ck(len(h8) == 179, f"桓八三条拼接去标点 {len(h8)} 字 ≠ 179")
ck(h6 == HUAN6_CT, "桓六引文与 ctext 底本不逐字相符")
ck(h8 == HUAN8_CT, "桓八引文与 ctext 底本不逐字相符")
ck(h6.replace("鬥", "鬬") == HUAN6_CT.replace("鬥", "鬬"), "桓六：鬥→鬬 代换后不等于维基文库之形")
ck(h8.replace("鬥", "鬬") == HUAN8_CT.replace("鬥", "鬬"), "桓八：鬥→鬬 代换后不等于维基文库之形")
ck(h6.count("鬥") == 2 and h8.count("鬥") == 3, "氏字「鬥」计数应为桓六 2、桓八 3（合 5）")
for i in NEW_IDS["passages"]:
    ck("鬬" not in pq[i]["quote_original"] and "鬭" not in pq[i]["quote_original"],
       f"{i}.quote_original 出现「鬬」／「鬭」——正文当一律取底本之形「鬥」")
# 本件之眼与任务书点收之句，逐句实读
ck("夫民，神之主也" in pq["Q491"]["quote_original"], "Q491 无「夫民，神之主也」")
ck("是以聖王先成民，而後致力於神" in pq["Q491"]["quote_original"], "Q491 无「先成民而后致力于神」")
ck("君姑脩政而親兄弟之國" in pq["Q491"]["quote_original"], "Q491 无「修政而亲兄弟之国」（任务书点收）")
ck("隨侯懼而脩政，楚不敢伐" in pq["Q491"]["quote_original"], "Q491 无谏效之结句")
ck("季梁在，何益？" in pq["Q489"]["quote_original"], "Q489 无「季梁在，何益？」")
ck("天去其疾矣" in pq["Q494"]["quote_original"], "Q494 无「天去其疾矣」")
ck("戰于速杞，隨師敗績" in pq["Q493"]["quote_original"], "Q493 无「战于速杞，随师败绩」")
ck("隨侯逸" in pq["Q493"]["quote_original"], "Q493 无「随侯逸」")
# 「随之见伐，不量力也」不入引文（酌收之界）——只著录于 L_SUIGUO.description
for r in merged["passages"]:
    ck("隨之見伐" not in r["quote_original"], f"{r['id']}：「隨之見伐」不当入 quote_original（本件不收）")
lsg = [r for r in merged["places"] if r["id"] == "L_SUIGUO"][0]
ck("隨之見伐，不量力也" in lsg["description"], "L_SUIGUO.description 未著录「随之见伐，不量力也」")
# 双本比对声明须逐条在案（§7 v1.26 核对状态通例）
# 简体行文层：本库此氏一律作「鬬」，从无作「斗」者（实测主表 0 处），本件新行照此
for t_ in ("events", "passages", "people", "places", "relations", "event_people", "sources"):
    for r in merged[t_]:
        key = r.get("id") or r.get("event_id")
        if key in (NEW_IDS.get(t_, []) + ["E294", "E295"]):
            blob = "".join(v for v in r.values())
            for ch in "辛巢怀伯克廉丹祁":
                ck("斗" + ch not in blob, f"{t_}/{key}：简体行文出现「斗{ch}」，本库此氏一律作「鬬」")
for i in NEW_IDS["passages"]:
    ck("双本比对" in pq[i]["modern_note"], f"{i}.modern_note 无双本比对声明")
    ck("标点系本库所加" in pq[i]["modern_note"], f"{i}.modern_note 无标点声明")

# ---------- 10. 人物：从严四栏、立行判据、升格待裁 ----------
sec("10. 人物字段从严")
ppl = {r["id"]: r for r in merged["people"] if r["id"] in NEW_IDS["people"]}
for pid in NEW_IDS["people"]:
    r = ppl[pid]
    for col in ("xing", "shi", "ming", "zi"):
        ck(r[col] == "", f"{pid}.{col} 应留空（任务书：xing/shi 诸栏从严，经传明文为限）")
    ck(r["birth_year_bce"] == "" and r["death_year_bce"] == "", f"{pid} 生卒应从阙")
    ck(r["is_protagonist"] == "0", f"{pid}.is_protagonist 应为 0（升格待裁，本件不自行升格）")
    ck(r["state"] == "随", f"{pid}.state 应为「随」")
ck(ppl["P_JILIANG"]["name"] == "季梁", "P_JILIANG.name 应为「季梁」")
ck(ppl["P_SUISHAOSHI"]["name"] == "随少师", "P_SUISHAOSHI.name 应为「随少师」")
ck(ppl["P_SUISHAOSHI"]["alt_names"] == "少师", "P_SUISHAOSHI.alt_names 应存「少师」")
ck("官称经传无文" in ppl["P_JILIANG"]["role"], "P_JILIANG.role 未自注官称无文")
ck("零命中" in ppl["P_JILIANG"]["notes"] and "零命中" in ppl["P_SUISHAOSHI"]["notes"],
   "两人物 notes 应载《国语》零命中之穷检结果")
ck("4 见" in ppl["P_JILIANG"]["notes"], "P_JILIANG.notes 未载《左传》4 见之实数")
ck("9 见" in ppl["P_SUISHAOSHI"]["notes"], "P_SUISHAOSHI.notes 未载随之少师 9 见之实数")
ck("升格" in ppl["P_JILIANG"]["notes"], "P_JILIANG.notes 未载升格待裁")
# 主角计数不因本件而变
ck(sum(1 for r in merged["people"] if r["is_protagonist"] == "1")
   == sum(1 for r in base["people"] if r["is_protagonist"] == "1") == 33,
   "主角数应仍为 33（本件不升格）")

# ---------- 11. 地望留痕（L_SUIGUO） ----------
sec("11. 地望留痕")
ck(lsg["lat"] == "" and lsg["lng"] == "" and lsg["coord_certainty"] == "",
   "L_SUIGUO 坐标三栏应一并留空")
ck(lsg["certainty"] == "low", "L_SUIGUO.certainty 应为 low")
ck("本轮无从核" in lsg["modern_location"], "L_SUIGUO.modern_location 未标「本轮无从核」")
ck("本轮无从核" in lsg["coord_basis"], "coord_basis 未标「本轮无从核」")
ck("查无落点" in lsg["coord_basis"], "coord_basis 未载「不得读作『查无落点』」之自限")
ck("幅界存疑" in lsg["coord_basis"], "coord_basis 未留「幅界存疑」之痕")
ck("楚吴越" in lsg["coord_basis"] and "郑宋卫" in lsg["coord_basis"],
   "coord_basis 未逐幅指名（郑宋卫幅／楚吴越幅）")
ck("线索" in lsg["coord_basis"] and "不据以定点" in lsg["coord_basis"],
   "coord_basis 未行「线索与出处分离」")
ck(lsg["source_ids"] == "Z002;Z132", f"L_SUIGUO.source_ids={lsg['source_ids']} ≠ Z002;Z132")
# 既有 L_SUI（遂）一字未动
old_sui = [r for r in base["places"] if r["id"] == "L_SUI"][0]
new_sui = [r for r in merged["places"] if r["id"] == "L_SUI"][0]
ck(old_sui == new_sui, "既有 L_SUI（遂）被改动——本件不得动之")
ck(new_sui["ancient_name"] == "遂", "L_SUI 应仍为「遂」")
ck("同音撞名" in lsg["description"], "L_SUIGUO.description 未载撞名之判据")

# ---------- 12. 楚线衔接（既有三行未动，衔接已标） ----------
sec("12. 楚线衔接")
# 【实测与任务书措辞之差，如实立断言】任务书作「楚武王现库 3 见处」——
# 按**人物行**计实为 3 行（P_QUWAN／P_ZIYUAN／P_CHUWEN），按**单元格**计实为 4 处
# （P_CHUWEN 之 relations 与 notes 两栏各一）。两数皆实测，措辞取「3 行 4 处」。
wu_base = [r for r in base["people"] if "楚武王" in (r["notes"] + r["relations"])]
ck({r["id"] for r in wu_base} == {"P_QUWAN", "P_ZIYUAN", "P_CHUWEN"},
   f"合入前「楚武王」见处应为三行，实测 {[r['id'] for r in wu_base]}")
wu_cells = sum(1 for r in base["people"] for k in ("notes", "relations") if "楚武王" in r[k])
ck(wu_cells == 4, f"合入前「楚武王」单元格数应为 4，实测 {wu_cells}")
wu_merged = [r["id"] for r in merged["people"] if "楚武王" in (r["notes"] + r["relations"])]
ck(set(wu_merged) == {"P_QUWAN", "P_ZIYUAN", "P_CHUWEN", "P_JILIANG"},
   f"合入后「楚武王」见处应为旧三行＋本件 P_JILIANG，实测 {wu_merged}")
for pid in ("P_QUWAN", "P_ZIYUAN", "P_CHUWEN"):
    a = [r for r in base["people"] if r["id"] == pid][0]
    b = [r for r in merged["people"] if r["id"] == pid][0]
    ck(a == b, f"{pid} 被本件改动——楚线三行本件一字不动")
e294 = [r for r in merged["events"] if r["id"] == "E294"][0]
ck("P_CHUWEN" in e294["summary"] and "楚线衔接" in e294["summary"], "E294.summary 未标楚线衔接")
ck("首次以行动主体出现于事目" in e294["summary"], "E294.summary 未标楚武王入事目之首例")

# ---------- 13. 孤事目与分层卫生 ----------
sec("13. 孤事目与分层卫生")
linked = {r["event_id"] for r in merged["event_people"]}
orph = [r["id"] for r in merged["events"] if r["id"] not in linked]
ck(orph == [], f"合并后出现孤事目（无 event_people 挂链）：{orph}——本库既有 0 条，本件不开此例")
for r in merged["passages"]:
    if r["id"] in NEW_IDS["passages"]:
        ck(not r["modern_note"].startswith("【"),
           f"{r['id']}：quote_type=原文 者不加层标（§7 结构式软检天然豁免）")
        ck("《左传·桓公" in r["modern_note"], f"{r['id']}.modern_note 未标所出篇章")

# ---------- 14. validate.py（于合并副本上跑） ----------
sec("14. validate.py（于合并副本上跑）")
p = subprocess.run([sys.executable, os.path.join("tools", "validate.py")],
                   cwd=TMP, capture_output=True, text=True, encoding="utf-8", errors="replace")
print((p.stdout or "").rstrip())
if p.stderr:
    print("--- stderr ---")
    print(p.stderr.rstrip())
ck(p.returncode == 0, f"validate.py 退出码 {p.returncode}")
ck("软检警告" not in (p.stderr or ""), "validate.py 报软检警告（本件应零告警）")

# ---------- 汇总 ----------
print()
print("断言分布（实测）：")
for k in DIST:
    print("  %-28s %d" % (k, DIST[k]))
print()
print("合计 %d 条断言：%d PASS / %d FAIL" % (PASS + FAIL, PASS, FAIL))
print("合并副本：%s" % TMP)
sys.exit(1 if FAIL else 0)
