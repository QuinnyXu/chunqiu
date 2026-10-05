# -*- coding: utf-8 -*-
"""
r59_jin_zhizheng 合并模拟 —— 晋之执政（中军将）序列备料（r59-D 立，r59-E、r59-E2、r59-E3、r59-E4 改；Sophia 备料，裁一百三十八、一百三十九、一百四十二、一百四十三至一百五十二）

用法（仓库根目录执行，★ 须在合入之前跑——本脚本以 data/csv/ 为「改前」）：
    python docs/changes/r59_jin_zhizheng_sim.py

做什么：
  1. 把 data/csv/ 全表复制到临时目录 mergesim_r59d/；
  2. append 五个 *_new.csv；依 fixes_people.csv 按 id 整行替换（P_SHIHUI、P_HANQI），
     依 fixes_places.csv 按 id 整行替换（L_WEN，只 description 纯追加；r59-E）；
  3. 于副本上跑 tools/validate.py；
  4. 跑本件机器断言：行数、ID 接续与不用退役号、外键、presence 三值与亲至之据、
     「三事俱备」逐人、替换件定点比对、不动之表一字未动；
  5. ★ 裁一百三十八三之判据（中军将一时一人、任期不得相叠）于合并后之副本上正测，
     并同跑反证（注入二人任期相叠之形、注入无任期之「中军将」）——反证不红即 exit 2（裁一百一十四）；
  6. r59-E：title_evidence 三值逐任断言、亲至「以职推在场」之按类断言、三处照实之断言，各带反证（不红即 exit 2）。
  7. r59-E2：#11 荀罃 title_evidence「推」及其 start_basis 二支与强弱；#13–#16 certainty 别立「未证」之值；
     门 (a) 挂钩由「role 含中军将」改为「role 含中军将 ⟺ title_evidence＝將中軍」，role 不得书「系推」；各带反证。
  8. r59-E3：#11 start_basis 改为独立之源二支（子囊同句之「佐中軍」并入支一，士匄自述 Q541 为支二）；
     任期表新栏 title_certainty 专承「职之推之验」三值（裁一百四十九），certainty 还原为起止之定度；
     title_evidence 为「推」者 role 不得书执政／为政／中军将（裁一百五十）；各带反证。
  9. r59-E4：title_certainty 之非明文二值须明书其域（裁一百五十一；域写入值本身），域可被量具检
     （任期须在其域内、二域相接而覆全表、「有／无『將中軍』之文可撞」与登记之文年相符）；
     role「（执政）」三人改「晋中军将」、荀罃 role 作「晋卿」并 short_bio／relations 同治、
     「执政」入 role 须有其明文之登记（裁一百五十二）；E306 不得留指向不存在之物之指路牌；各带反证。
  10. r59-E5：后域之值改作「前559–前509」（裁一百五十三：二域相接，界年归一，不取「界年二域共之」之读）；
     域之量检随字面改为闭区间、不相叠（前域止 N、后域起 N 之次年）；裁一百五十一 原字（后域前560 起）入反证须红。
     E4 顺带修正二条（E313／P_XUNYING.role_in_event、P_XUNYAN.relations 及其 notes 一句）俟领队准（裁一百五十四）：
     其还原补丁 revert_e4_sidefix_people.csv／revert_e4_sidefix_event_people.csv 于默认模式下只验其形（键、所涉之栏、原字）；
     设环境变量 CHUNQIU_SIM_REVERT_E4_SIDEFIX=1 则于合并副本上施还原补丁而跑全门（「余件合入、二条还原」之形）。
  11. 〔r59-E6 改〕ZJJ_TEXT_YEARS 重跑全文检索（裁一百五十八）：其定义处书求法、底本与取日、所覆篇卷、重跑日，
     并立 ZJJ_TEXT_YEARS_META 为其量（元数＝count、字段非空；status「已定」时全集＝现元，「待裁」时差须恰为所记）；各带反证。
     ★ 本次重跑与原 13 元不等（多前633、前619）；〔r59-F 续，裁一百六十一〕站长裁 ZJJ_TEXT_YEARS 作 15 元，
     META.status 改「已定」（断言升为 set(ZJJ_TEXT_YEARS)＝set(rerun_years)），diff_extra／diff_missing 留作历史之差。
     〔r59-F 续〕本脚本之入库副本（docs/changes/r59_jin_zhizheng_sim.py）：数据件读 data/incoming/r59_jin_zhizheng/
     （合入毕、俟 r59-G 后其目录删，则本脚本不可再整跑——同 r46_jiliang_sim.py 之例）；且本脚本以 data/csv/ 为「改前」，
     须在合入之前之库上跑（已合入之库上整跑必撞 ID 而红，非脚本之误）。其 ZJJ_TEXT_YEARS 定义处为本文件。

退出码：0 全过；1 有 FAIL；2 反证未红（量具不能自证其能红）。
本脚本不属数据，不入 data/csv/。临时目录可用环境变量 CHUNQIU_SIM_TMP 覆写。
"""
import csv, os, re, shutil, subprocess, sys, tempfile

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
csv.field_size_limit(10 ** 7)

# 〔r59-F 续〕入库副本在 docs/changes/，ROOT 上溯二级；数据件仍在 data/incoming/r59_jin_zhizheng/（HERE 指向之）
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
HERE = os.path.join(ROOT, "data", "incoming", "r59_jin_zhizheng")
CSV = os.path.join(ROOT, "data", "csv")
TMP = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_r59d")

TABLES = ["events", "passages", "sources", "people", "event_people",
          "relations", "places", "archaeology", "background"]
NEW = {"people": "people_new.csv", "events": "events_new.csv", "passages": "passages_new.csv",
       "sources": "sources_new.csv", "event_people": "event_people_new.csv"}
FIX = {"people": "fixes_people.csv", "places": "fixes_places.csv"}
REN = "zhongjunjiang_ren.csv"
# r59-E5（裁一百五十四）：E4 顺带修正二条之还原补丁——按键整行替换（people 以 id；event_people 以 event_id+person_id）
REVERT = {"people": "revert_e4_sidefix_people.csv", "event_people": "revert_e4_sidefix_event_people.csv"}
REVERT_MODE = os.environ.get("CHUNQIU_SIM_REVERT_E4_SIDEFIX") == "1"
# 二条之原字（r59-E4 改前，取自会话备份 r59E4_backup，逐字）与新字（r59-E4 所改）
SIDEFIX_XUNYAN_REL_OLD = "鄢陵之战为上军佐（E200）；继荀罃将中军（E313）；卒而范宣子为政（E314）"
SIDEFIX_XUNYAN_REL_NEW = "鄢陵之战为上军佐（E200）；荀罃卒，同年受命将中军（E313）；卒而范宣子为政（E314）"
SIDEFIX_XUNYAN_NOTE = "relations 不书「继荀罃」：荀罃之职名传无明文，二人之相继系任期表之推（第 11、12 任）。"
SIDEFIX_E313_OLD = "卒，其中军将之职由荀偃继。已卒之人非行动主体，依「死者不作亲至」通例标「相关」"
SIDEFIX_E313_NEW = "卒；同年荀偃受命将中军（荀罃之职名传无明文，二人之相继系任期表之推）。已卒之人非行动主体，依「死者不作亲至」通例标「相关」"


def rkey(t, r):
    return r["id"] if t == "people" else (r["event_id"], r["person_id"])

# 合入前基线（2026-10-04 实读 HEAD c882870）
BEFORE = {"events": 265, "passages": 509, "sources": 195, "people": 174,
          "event_people": 694, "relations": 309, "places": 104,
          "archaeology": 8, "background": 11}
ADD = {"events": 16, "passages": 22, "sources": 16, "people": 12,
       "event_people": 41, "relations": 0, "places": 0, "archaeology": 0, "background": 0}
RETIRED = {"E005", "E006", "Z098"}

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
for t, fn in list(NEW.items()) + list(FIX.items()) + list(REVERT.items()):
    h_main, h_new = hdr(os.path.join(CSV, t + ".csv")), hdr(os.path.join(HERE, fn))
    ck(h_main == h_new, f"{t} 表头不同：{h_main} / {h_new}")
for fn in list(NEW.values()) + list(FIX.values()) + list(REVERT.values()) + [REN]:
    ck(not any(c.lower().startswith("novel") for c in hdr(os.path.join(HERE, fn))), f"{fn} 含 novel* 列")
    for r in rd(os.path.join(HERE, fn)):
        key = list(r.values())[0]
        for k, v in r.items():
            ck(v is not None and "\n" not in v and "\t" not in v, f"{fn} {key} 栏 {k} 含换行／制表符")
            ck(v is not None and v.upper() not in {"NULL", "N/A"}, f"{fn} {key} 栏 {k} 写了 NULL/N/A")

# ---------- 1. 合并模拟 ----------
sec("1. 合并模拟（append 新增 → 按 id 整行替换）")
if os.path.isdir(TMP):
    shutil.rmtree(TMP)
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
# r59-E5：还原模式——于副本上按键整行施还原补丁（「余件合入、二条还原」之形）
if REVERT_MODE:
    print("   ★ 还原模式：施 E4 顺带修正二条之还原补丁")
    for t, fn in REVERT.items():
        h = hdr(os.path.join(simcsv, t + ".csv"))
        repl = {rkey(t, r): r for r in rd(os.path.join(HERE, fn))}
        cur = rd(os.path.join(simcsv, t + ".csv"))
        hit = 0
        for i, r in enumerate(cur):
            if rkey(t, r) in repl:
                cur[i] = repl[rkey(t, r)]
                hit += 1
        ck(hit == len(repl), f"{fn} 还原命中 {hit} != {len(repl)}")
        with open(os.path.join(simcsv, t + ".csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=h, lineterminator="\n")
            w.writeheader()
            w.writerows(cur)
# tools/qa/node_modules 路径过深（Windows 下逾 260 字符即报错），validate.py 不需之，略去
shutil.copytree(os.path.join(ROOT, "tools"), os.path.join(TMP, "tools"),
                ignore=shutil.ignore_patterns("node_modules"))
print("   临时副本：" + TMP)

# ---------- 2. 逐表行数 ----------
sec("2. 逐表行数（合入后实测）")
merged = {t: rd(os.path.join(simcsv, t + ".csv")) for t in TABLES}
main = {t: rd(os.path.join(CSV, t + ".csv")) for t in TABLES}
print("   {:<14}{:>8}{:>8}{:>8}".format("表", "合入前", "合入后", "预期"))
for t in TABLES:
    before, after, exp = BEFORE[t], len(merged[t]), BEFORE[t] + ADD[t]
    print("   {:<14}{:>8}{:>8}{:>8}  {}".format(t, before, after, exp, "相符" if after == exp else "**不符**"))
    ck(after == exp, f"{t} 合入后 {after} != 预期 {exp}")
    ck(len(main[t]) == before, f"{t} 主表基线 {len(main[t])} != {before}（本脚本须在合入前跑）")

# ---------- 3. 不动之表 ----------
sec("3. relations／archaeology／background 一字未动；places 只 L_WEN.description 纯追加")
for t in ("relations", "archaeology", "background"):
    with open(os.path.join(CSV, t + ".csv"), encoding="utf-8") as f:
        a = f.read()
    with open(os.path.join(simcsv, t + ".csv"), encoding="utf-8") as f:
        b = f.read()
    ck(a == b, f"{t}.csv 在模拟中被改动（本件不动此表）")
# places：r59-E 只许 L_WEN 一行之 description 纯追加（裁一百四十二⑥），余行余栏一字不动
_pmain = rd(os.path.join(CSV, "places.csv"))
_psim = rd(os.path.join(simcsv, "places.csv"))
ck(len(_pmain) == len(_psim), "places 行数被改动")
for a, b in zip(_pmain, _psim):
    for k in a:
        if a["id"] == "L_WEN" and k == "description":
            ck(b[k] != a[k] and b[k].startswith(a[k]), "L_WEN.description 非纯追加或未改")
            ck("昭公元年" in b[k] and "已属晋" in b[k], "L_WEN.description 未补「昭元时温已属晋」")
        else:
            ck(a[k] == b[k], f"places {a['id']}.{k} 被改动（本件只改 L_WEN.description）")
for fn in ("relations_new.csv", "places_new.csv", "fixes_events.csv", "fixes_event_people.csv",
           "fixes_passages.csv", "fixes_sources.csv"):
    ck(not os.path.exists(os.path.join(HERE, fn)), f"本件出现 {fn}（逾本件之界）")
for t in ("events", "passages", "sources", "event_people"):
    ck(merged[t][:len(main[t])] == main[t], f"既有 {t} 行被改动（本件于此表只 append）")

# ---------- 4. ID ----------
sec("4. ID：接续、不撞、不用退役号、外键")
for t in TABLES:
    if merged[t] and "id" in merged[t][0]:
        ids = [r["id"] for r in merged[t]]
        ck(len(ids) == len(set(ids)), f"{t}.id 有重复")
newE = [r["id"] for r in rd(os.path.join(HERE, NEW["events"]))]
newQ = [r["id"] for r in rd(os.path.join(HERE, NEW["passages"]))]
newS = [r["id"] for r in rd(os.path.join(HERE, NEW["sources"]))]
newP = [r["id"] for r in rd(os.path.join(HERE, NEW["people"]))]
ck(newE == ["E%03d" % i for i in range(303, 319)], f"events 新号非 E303–E318 连号：{newE}")
ck(newQ == ["Q%03d" % i for i in range(527, 549)], f"passages 新号非 Q527–Q548 连号：{newQ}")
ck(newS == ["Z%03d" % i for i in range(134, 148)] + ["G014", "G015"], f"sources 新号不符：{newS}")
mx = lambda ids, pre: max(int(re.match(pre + r"(\d+)", i).group(1)) for i in ids if re.match(pre + r"\d+", i))
ck(mx([r["id"] for r in main["events"]], "E") == 302, "events 主表尾号已非 E302（基线漂移）")
ck(mx([r["id"] for r in main["passages"]], "Q") == 526, "passages 主表尾号已非 Q526")
ck(mx([r["id"] for r in main["sources"] if r["id"][0] == "Z"], "Z") == 133, "Z 尾号已非 Z133")
ck(mx([r["id"] for r in main["sources"] if r["id"][0] == "G"], "G") == 13, "G 尾号已非 G013")
for i in newE + newQ + newS:
    ck(i not in RETIRED, f"使用了退役 ID {i}")
oldP = {r["id"] for r in main["people"]}
for p in newP:
    ck(re.fullmatch(r"P_[A-Z]+", p) is not None, f"{p} 不合 ^P_[A-Z]+$")
    ck(p not in oldP, f"{p} 与既有人物撞号")
PID = {r["id"] for r in merged["people"]}
EID = {r["id"] for r in merged["events"]}
SID = {r["id"] for r in merged["sources"]}
LID = {r["id"] for r in merged["places"]}
for r in rd(os.path.join(HERE, NEW["event_people"])):
    ck(r["event_id"] in EID and r["person_id"] in PID, f"event_people 外键断：{r['event_id']}/{r['person_id']}")
for r in rd(os.path.join(HERE, NEW["passages"])):
    ck(r["event_id"] in EID and r["source_id"] in SID, f"passages 外键断：{r['id']}")
    ck(r["quote_type"] in {"原文", "言论"}, f"{r['id']} quote_type 非原文／言论")
for r in rd(os.path.join(HERE, NEW["events"])):
    for s in r["source_ids"].split(";"):
        ck(s in SID, f"{r['id']} source_ids 含不存在之 {s}")
    ck(r["place_id"] == "" or r["place_id"] in LID, f"{r['id']} place_id 不存在")
    ck(r["reliability"] == "high", f"{r['id']} reliability != high（本件事目俱经传明文）")
epk = [(r["event_id"], r["person_id"]) for r in merged["event_people"]]
ck(len(epk) == len(set(epk)), "event_people 有重复挂链")

# ---------- 5. presence ----------
sec("5. presence 三值与从严")
NEP = rd(os.path.join(HERE, NEW["event_people"]))
if REVERT_MODE:
    _rv = {rkey("event_people", r): r for r in rd(os.path.join(HERE, REVERT["event_people"]))}
    NEP = [_rv.get(rkey("event_people", r), r) for r in NEP]
for r in NEP:
    ck(r["presence"] in {"亲至", "相关", "不在"}, f"{r['event_id']}/{r['person_id']} presence 非三值")
    ck(r["directness"] in {"direct", "indirect"}, f"{r['event_id']}/{r['person_id']} directness 非二值")
    if r["presence"] == "亲至":
        ck("传书" in r["role_in_event"] or "传明书" in r["role_in_event"],
           f"{r['event_id']}/{r['person_id']} 标亲至而挂链注未引其在事之明文")
    if r["presence"] == "相关":
        ck("相关" in r["role_in_event"], f"{r['event_id']}/{r['person_id']} 标相关而未写明其判")
    if "已卒" in r["role_in_event"]:
        ck(r["presence"] == "相关" and r["directness"] == "indirect",
           f"{r['event_id']}/{r['person_id']} 死者未依通例标相关／indirect")
cnt = {}
for r in NEP:
    cnt[r["presence"]] = cnt.get(r["presence"], 0) + 1
print("   presence 分布：", cnt)
ck(cnt == {"相关": 28, "亲至": 12, "不在": 1}, f"presence 分布与 CHANGES 所报不符：{cnt}")

# ---------- 5b. r59-E 按类断言：亲至不得以职推在场（裁一百四十二④「职可推其与事相关，不可推其身在何地」）----------
# 职名之形：「將／佐（中上下新）軍」「為政」「以為政」「為元帥」之类；凡亲至行之所引，须至少一条不是纯职名之明文
OFFICE_ONLY = re.compile(r"^[\u4e00-\u9fff]{0,6}?((將|佐)(新)?[中上下新]?軍|以?為政|為元帥)$")
QUOTE = re.compile(r"「([^「」]+)」")
PRES_WORDS = {"亲至", "相关", "不在"}


def norm(q):
    return re.sub(r"[^\u4e00-\u9fff]", "", q)


def presence_by_office(rows):
    """返回违例：标亲至而其所引之明文全是职名者（或一条明文都未引）。"""
    bad = []
    for r in rows:
        if r["presence"] != "亲至":
            continue
        # 「亲至」「相关」「不在」是判语之自引，非史文，不计
        qs = [norm(q) for q in QUOTE.findall(r["role_in_event"]) if norm(q) and norm(q) not in PRES_WORDS]
        acts = [q for q in qs if not OFFICE_ONLY.match(q)]
        if not acts:
            bad.append(f"{r['event_id']}/{r['person_id']} 标亲至而所引只是职名（{qs}）")
    return bad


# 亲至行之在场明文逐条登记（r59-E 逐条复核；新增亲至行须入此表方过，防漏审）
PRESENT = {
    ("E314", "P_SHIGAI"): "宣子盥而撫之", ("E317", "P_HANQI"): "晉侯使韓宣子來聘",
    ("E128", "P_XIKE"): "郤獻子曰", ("E128", "P_LUANSHU"): "欒武子曰", ("E128", "P_HANJUE"): "韓獻子謂桓子曰",
    ("E128", "P_XUNYING"): "楚熊負羈囚知罃", ("E200", "P_LUANSHU"): "欒書將載晉侯",
    ("E200", "P_HANJUE"): "晉韓厥從鄭伯", ("E200", "P_SHIGAI"): "范匄趨進",
    ("E206", "P_ZHAOWU"): "晉趙武至於宋", ("E271", "P_ZHAOWU"): "適晉，說趙文子", ("E271", "P_WEISHU"): "適晉，說趙文子",
}
qin = {(r["event_id"], r["person_id"]): r for r in NEP if r["presence"] == "亲至"}
ck(set(qin) == set(PRESENT), f"亲至行与登记表不一致：多 {sorted(set(qin) - set(PRESENT))} 少 {sorted(set(PRESENT) - set(qin))}")
for k, q in PRESENT.items():
    if k in qin:
        ck(norm(q) in norm(qin[k]["role_in_event"]), f"{k} 挂链注未引其在场明文「{q}」")
        ck(not OFFICE_ONLY.match(norm(q)), f"{k} 登记之在场明文「{q}」是纯职名")
v_po = presence_by_office(NEP)
for x in v_po:
    print("   违例：" + x)
ck(v_po == [], f"亲至以职推在场 {len(v_po)} 条")
for k in (("E304", "P_XIANQIEJU"), ("E309", "P_LUANSHU")):
    r = next(x for x in NEP if (x["event_id"], x["person_id"]) == k)
    ck(r["presence"] == "相关" and "r59-E 由亲至降" in r["role_in_event"], f"{k} 未依裁一百四十二④降为相关")
ck(any(r["event_id"] == "E200" and r["person_id"] == "P_XUNYING" and r["presence"] == "不在" for r in NEP),
   "E200／P_XUNYING 未标「不在」（传明书「荀罃居守」）")

# ---------- 6. 三事俱备 ----------
sec("6. 凡入库者三事俱备（裁一百三十八 二③）")
ren = rd(os.path.join(HERE, REN))
renP = {r["person_id"] for r in ren}
EV = {r["id"]: r for r in merged["events"]}
QS = merged["passages"]
for p in newP:
    ck(p in renP, f"{p} 不在任期表（其职之明文无著）")
    evs = [r["event_id"] for r in merged["event_people"] if r["person_id"] == p]
    good = False
    for e in evs:
        srcs = [s for s in EV[e]["source_ids"].split(";") if s[0] in "ZG"]
        if srcs and any(q["event_id"] == e and q["source_id"] in srcs for q in QS):
            good = True
    ck(good, f"{p} 无一条带 Z／G 出处且有 passage 之事目")
for r in ren:
    ck(r["zhi_wen"] and r["start_basis"] and r["end_basis"], f"任期表第 {r['seq']} 任依据栏空")
    ck(r["start_kind"] in {"明文", "推"} and r["end_kind"] in {"明文", "推"}, f"第 {r['seq']} 任 kind 非明文／推")
    for k in ("start", "end"):
        if r[k + "_kind"] == "推":
            ck(r[k + "_basis"].startswith("推"), f"第 {r['seq']} 任 {k} 系推而未书推法")

# r59-E3（裁一百四十九）：certainty 专承起止之定度（与 start_kind／end_kind 同族），不再兼「职之推之验」；
# r59-E2 并入之「未证：……」还原为定度之值（#13 medium、#14–#16 high，即 r59-E2 前之值），其义移入新栏 title_certainty
CERT_EXPECT = {1: "high", 2: "medium", 3: "high", 4: "medium", 5: "medium", 6: "medium", 7: "high", 8: "medium",
               9: "high", 10: "high", 11: "medium", 12: "high", 13: "medium", 14: "high", 15: "high", 16: "high"}


def cert_check(rows):
    bad = []
    for r in rows:
        s, c = int(r["seq"]), r["certainty"]
        if c not in {"high", "medium", "low"}:
            bad.append(f"第 {s} 任 certainty「{c}」非定度之值（一栏不得兼二义）")
            continue
        if c != CERT_EXPECT[s]:
            bad.append(f"第 {s} 任 certainty「{c}」与所报「{CERT_EXPECT[s]}」不符")
        # 起止与定度同族：两端俱明文者 high；有一端系推者不得 high（#9 栾书止「推（年无疑）」除外）
        both = r["start_kind"] == "明文" and r["end_kind"] == "明文"
        if both and c != "high":
            bad.append(f"第 {s} 任两端俱明文而 certainty 为「{c}」")
        if not both and c == "high" and not r["end_basis"].startswith("推（年无疑）"):
            bad.append(f"第 {s} 任有一端系推而 certainty 为 high")
    return bad


v_ct = cert_check(ren)
for x in v_ct:
    print("   违例：" + x)
ck(v_ct == [], f"certainty 违例 {len(v_ct)} 条")

# ---------- 6b. r59-E：title_evidence 三值逐任（裁一百三十九 三：其值不得归并）----------
TE_EXPECT = {1: "將中軍", 2: "將中軍", 3: "將中軍", 4: "將中軍", 5: "為政", 6: "將中軍", 7: "將中軍",
             8: "將中軍", 9: "將中軍", 10: "為政", 11: "推", 12: "將中軍", 13: "為政", 14: "為政",
             15: "為政", 16: "為政"}


def te_check(rows):
    bad = []
    for r in rows:
        te, zw = r.get("title_evidence", ""), r["zhi_wen"]
        if te not in {"將中軍", "為政", "推"}:
            bad.append(f"第 {r['seq']} 任 title_evidence「{te}」非三值")
        if te == "將中軍" and "將中軍" not in zw:
            bad.append(f"第 {r['seq']} 任书將中軍而 zhi_wen 无其字")
        if te == "為政" and ("為政" not in zw or "將中軍" in zw):
            bad.append(f"第 {r['seq']} 任书為政而 zhi_wen 无「為政」或已有「將中軍」（当为將中軍）")
        # r59-E2：「推」者 zhi_wen 须以「无」起首明书其无晋之职名明文（可引他国人之语与同句之佐，不得有「將中軍」）
        if te == "推" and (not zw.startswith("无") or "將中軍" in zw):
            bad.append(f"第 {r['seq']} 任书推而 zhi_wen 未明书「无晋之职名明文」或有「將中軍」")
        if "系推" in zw:
            bad.append(f"第 {r['seq']} 任 zhi_wen 以「系推」别之（裁一百三十九 三：不得同列一栏而以三字别之）")
    return bad


ck("title_evidence" in hdr(os.path.join(HERE, REN)), "任期表无 title_evidence 栏")
for r in ren:
    ck(r.get("title_evidence") == TE_EXPECT[int(r["seq"])],
       f"第 {r['seq']} 任 title_evidence「{r.get('title_evidence')}」与所报不符")
v_te = te_check(ren)
for x in v_te:
    print("   违例：" + x)
ck(v_te == [], f"title_evidence 违例 {len(v_te)} 条")
te_cnt = {}
for r in ren:
    te_cnt[r["title_evidence"]] = te_cnt.get(r["title_evidence"], 0) + 1
print("   title_evidence 分布：", te_cnt)
ck(te_cnt == {"將中軍": 9, "為政": 6, "推": 1}, f"title_evidence 分布与 CHANGES 所报不符：{te_cnt}")


# r59-E3（裁一百四十九）：新栏 title_certainty 专承「职之推之验」，三值不并
# r59-E4（裁一百五十一）：取「段」读，非明文二值须明书其域——域写入值本身（一字照裁文），量具自值中解析其域而检之
TC_D1 = "反例已求·未见（域：前632–前560 全段；该段有「將中軍」之文可撞）"
# r59-E5（裁一百五十三）：后域改作「前559–前509」——界年前560 只归前域；裁一百五十一 原字「前560–前509」入反证三十一
TC_D2 = "反例无从求·无判别力（域：前559–前509 全段；该段无「將中軍」之文可撞）"
TC_VALUES = ("明文", TC_D1, TC_D2)
TC_EXPECT = {k: "明文" for k in (1, 2, 3, 4, 6, 7, 8, 9, 12)}
TC_EXPECT.update({5: TC_D1, 10: TC_D1, 11: TC_D1, 13: TC_D2, 14: TC_D2, 15: TC_D2, 16: TC_D2})
TC_RE = re.compile(r"^(反例已求·未见|反例无从求·无判别力)（域：前(\d+)–前(\d+) 全段；该段(有|无)「將中軍」之文可撞）$")
# 晋人「將中軍」之文所在之年（登记；据 CHANGES §十 二 title_evidence 表「其据」栏所列之传文篇年，鲁公纪年换算）：
# 僖28 前632、僖33 前627、文2 前625、文6 前621、文7 前620、文12 前615、宣12 前597、宣16 前593、
# 成2 前589、成4 前587、成13 前578、成16 前575、襄13 前560。★ 前560 之后无（§十 一 辅查一）。
# 〔r59-F 续，裁一百六十一：上列原注（13 元）一字照留；今 ZJJ_TEXT_YEARS 作 15 元，多 前633、前619，见下重跑注。〕
# ★★ 〔裁一百五十九 ②：本集之限〕本集只收晋之「將中軍」之文。他国之同文不入——其于所问之事（晋之職名之推：
#   「為政」(晋国) ⟹ 「將中軍」(晋)）无判别力：一条他国之「將中軍」，既不能作该推之反例（反例须是晋人為政而非中军将），
#   亦不能告晋之職名如何。门（tc_domain_check）所撞之文年，限 state 含「晋」（裁一百四十）。
# ★★ 〔裁一百五十九 ③、一百六十 ②：已求、不入、其所以不入——照录，不得只是不收〕
#   齐：哀11「齊國書將中軍」（前484，艾陵之役；库内 events E247／people P_GUOSHU 俱见）——已求得，限晋而不入。
#   楚：event_people.csv 内 E098／P_ZIYU「楚令尹将中军」（HEAD 时在第 304 行）、E200／P_ZIFAN「楚司马将中军」（第 481 行）——
#   已求得，限晋而不入。（行号系 2026-10-05 HEAD 实读；行号会随增删而移，以 event_id／person_id 为准。）
#   齐、楚二者俱实：裁一百四十 曾书「所举之例错」，裁一百六十 ① 勘为误（当日 grep 截以 head -4，样本非全集）。
#   其由：不入之判是「限晋」之界，非其例之有无。
# 〔r59-E6 改（裁一百五十八）：以下为本次重跑之所书。〕
# 求法：全文检索。底本＝维基文库整理本《春秋左氏傳》十二公页、《國語》卷01–卷21 页，MediaWiki action=raw 重取，
#   取于 2026-10-05T03:05Z（＝2026-10-04 23:05 EDT）；主页所嵌子页（{{:春秋左氏傳/莊公/十八年}}、{{:春秋左氏傳/襄公/廿五年}}）
#   以其 <onlyinclude> 之文代入。剥：{{*|…}}（《国语》韦昭注及校记）、{{annotate|…}}、<ref>…</ref>、页眉页脚模板；
#   展：{{+|X}}→X、{{!|字|…}}→字、{{YL|年|…}}→年。
# ★ 求法之可重跑（裁一百五十九 ④）：脚本与语料留 scratchpad 不入仓，故其跑不可由仓内复现；今以下列文字补足——
#   底本与取法见「求法」，所剥所展见同条，式见下条，所覆篇卷见「所覆」，截日见「重跑日」；
#   取各页 action=raw 全文后，按「剥／展」清其注，以核式逐页 re.findall，得一切命中；广式命中之句逐条判其为晋人与否、是否「將中軍」。
#   全集之数以命中总数 | 计数（wc -l／len）出之，不以截断之输出（head／tail／cut）为全集（v1.51）。
# 式：核式 [將将]中[軍军]（入全集者）；广式 中[軍军]（凡含「中軍」之句俱出而逐条判，邻式「佐中軍」「中軍大夫／尉／司馬」
#   「將新中軍」「以中軍」「元帥」等俱列而不入，其由见 CHANGES §十五）。限晋人（楚、齐之「將中軍」俱列而不入）。
#   年＝该文所在之传之篇年（鲁公纪年换算）；《国语》以其事系于《左传》之年。
# 所覆：《左传》隐1–11、桓1–18、庄1–32、闵1–2、僖1–33、文1–18、宣1–18、成1–18、襄1–31、昭1–32、定1–15、哀1–27（297 年俱全）；
#   《国语》周语上中下、鲁语上下、齐语、晋语一至九、郑语、楚语上下、吴语、越语上下（21 卷俱全）。
# 重跑日：2026-10-04（EDT）。重跑所得晋人「將中軍」之文年 15 元（见 ZJJ_TEXT_YEARS_META["rerun_years"]）：
#   比上方 13 元多 前633（僖27 被廬之蒐「乃使郤縠將中軍」；国语·晋语四「使郤縠將中軍，以為大政」同事）、
#   前619（文8「夷之蒐，晉侯將登箕鄭父、先都，而使士縠、梁益耳將中軍」——追叙前621 之议，先克谏而未行）；缺 0 元；
#   末元同为 前560（襄13）；前560 之后晋人「將中軍」之文 0 条（前560 后唯 哀11「齊國書將中軍」，齐人，不入）。
# 量：ZJJ_TEXT_YEARS_META 之 status 今为「已定」（r59-F 续，裁一百六十一）——断言 set(ZJJ_TEXT_YEARS)＝set(rerun_years)，元数＝count（15）、各字段非空；
#   （「待裁」时则断言差恰为所记之差，该支留作量具之全貌；）
#   不等即红。
ZJJ_TEXT_YEARS = [-633, -632, -627, -625, -621, -620, -619, -615, -597, -593, -589, -587, -578, -575, -560]
ZJJ_TEXT_YEARS_META = {
    "status": "已定",
    "method": "全文检索：核式 [將将]中[軍军] 限晋人，广式 中[軍军] 逐条判；年取该文所在传之篇年",
    "corpus": "维基文库整理本《春秋左氏傳》十二公页＋子页二（莊公/十八年、襄公/廿五年），《國語》卷01–卷21；action=raw；剥韦注等",
    "retrieved": "2026-10-05T03:05Z（2026-10-04 23:05 EDT）",
    "scope": "左傳 隱1–哀27 共 297 年；國語 21 卷（周語上至越語下）",
    "rerun_date": "2026-10-04",
    "count": 15,
    "rerun_years": [-633, -632, -627, -625, -621, -620, -619, -615, -597, -593, -589, -587, -578, -575, -560],
    "rerun_count": 15,
    "diff_extra": [-633, -619],
    "diff_missing": [],
}


def zjj_meta_check(years, meta):
    """r59-E6（裁一百五十八 ③）：ZJJ_TEXT_YEARS 之完备性系于一条量。"""
    bad = []
    for k in ("status", "method", "corpus", "retrieved", "scope", "rerun_date", "count", "rerun_years", "rerun_count"):
        if meta.get(k) in (None, "", []):
            bad.append(f"META.{k} 为空")
    if len(years) != meta.get("count"):
        bad.append(f"ZJJ_TEXT_YEARS 元数 {len(years)} != META.count {meta.get('count')}")
    rr = meta.get("rerun_years") or []
    if len(rr) != meta.get("rerun_count"):
        bad.append(f"rerun_years 元数 {len(rr)} != rerun_count {meta.get('rerun_count')}")
    extra, missing = sorted(set(rr) - set(years)), sorted(set(years) - set(rr))
    if meta.get("status") == "已定":
        if set(years) != set(rr):
            bad.append(f"全集≠现元：多 {extra}、缺 {missing}")
    elif meta.get("status") == "待裁":
        if extra != sorted(meta.get("diff_extra", [])) or missing != sorted(meta.get("diff_missing", [])):
            bad.append(f"重跑集与现集之差 多 {extra}／缺 {missing} 与所记之差不符")
    else:
        bad.append(f"META.status「{meta.get('status')}」非「已定／待裁」")
    return bad


def tc_domain(tc):
    """解析 title_certainty 之域；返回 (前缀, 起, 止, 有无) 或 None。年取负数（公元前）。"""
    m = TC_RE.match(tc)
    if not m:
        return None
    return m.group(1), -int(m.group(2)), -int(m.group(3)), m.group(4)


def tc_domain_check(rows, text_years):
    """域之量检（裁一百五十一：值须明书其域，域须可被量具检）。
       规约（r59-E5 改，裁一百五十三）：年粒度，域为闭区间、按字面读；二域相接而不相叠——前域止于 N，后域起于 N 之次年
       （不取「界年二域共之」之读）。故「该段有『將中軍』之文」指域内（含两端）至少一条，「该段无」指域内（含两端）无一条。
       〔r59-E4 原规约：界年二域共之；「无」只检界年之后——照裁一百五十三 废，原字存于 CHANGES §十三 一 3。〕"""
    bad = []
    doms = {}
    for r in rows:
        tc = r.get("title_certainty", "")
        if tc == "明文":
            continue
        d = tc_domain(tc)
        s = int(r["seq"])
        if d is None:
            bad.append(f"第 {s} 任 title_certainty「{tc}」未明书其域或其域不可解析")
            continue
        pre, a, b, yn = d
        if (pre == "反例已求·未见") != (yn == "有"):
            bad.append(f"第 {s} 任 title_certainty 前缀「{pre}」与「该段{yn}」不相应")
        if not (a <= int(r["start_bce"]) and int(r["end_bce"]) <= b):
            bad.append(f"第 {s} 任 [{r['start_bce']},{r['end_bce']}] 不在其域 [{a},{b}] 之内")
        inside = [y for y in text_years if a <= y <= b]
        if yn == "有" and not inside:
            bad.append(f"第 {s} 任之域 [{a},{b}] 书「有『將中軍』之文可撞」而登记之文年无一落其内")
        if yn == "无" and inside:
            bad.append(f"第 {s} 任之域 [{a},{b}] 书「无『將中軍』之文可撞」而登记之文年 {inside} 落其内")
        doms.setdefault(tc, (a, b))
    # 同一值即同一域；二域相接而不相叠（前域止 N，后域起 N 之次年；r59-E5 改，裁一百五十三）而合覆全表
    if len(doms) == 2:
        (a1, b1), (a2, b2) = sorted(doms.values())
        lo = min(int(r["start_bce"]) for r in rows)
        hi = max(int(r["end_bce"]) for r in rows)
        if a2 <= b1:
            bad.append(f"二域相叠（界年不归一）：[{a1},{b1}] 与 [{a2},{b2}]")
        elif a2 != b1 + 1:
            bad.append(f"二域不相接：[{a1},{b1}] 与 [{a2},{b2}]")
        if a1 != lo or b2 != hi:
            bad.append(f"二域之合 [{a1},{b2}] 不覆全表 [{lo},{hi}]")
    else:
        bad.append(f"非明文之域数 {len(doms)} != 2")
    return bad


def tc_check(rows):
    bad = []
    for r in rows:
        s, tc, te = int(r["seq"]), r.get("title_certainty", ""), r["title_evidence"]
        if tc not in TC_VALUES:
            bad.append(f"第 {s} 任 title_certainty「{tc}」非三值")
            continue
        # 明文 ⟺ title_evidence＝將中軍（不须验）
        if (tc == "明文") != (te == "將中軍"):
            bad.append(f"第 {s} 任 title_certainty「{tc}」与 title_evidence「{te}」不相应")
        # 前560 以后（#13–#16）此段无「將中軍」之文可撞，其验只能是第三值；前段之验不得书第三值
        late = s >= 13
        if te != "將中軍" and late and tc != TC_D2:
            bad.append(f"第 {s} 任在前560 以后而 title_certainty 书「{tc}」（此段之求无判别力）")
        if te != "將中軍" and not late and tc != TC_D1:
            bad.append(f"第 {s} 任在前段而 title_certainty 书「{tc}」")
        if tc != TC_EXPECT[s]:
            bad.append(f"第 {s} 任 title_certainty「{tc}」与所报「{TC_EXPECT[s]}」不符")
    return bad


_hren = hdr(os.path.join(HERE, REN))
ck("title_certainty" in _hren, "任期表无 title_certainty 栏")
ck(_hren.index("title_certainty") == _hren.index("title_evidence") + 1
   and _hren.index("certainty") == _hren.index("title_certainty") + 1,
   f"title_certainty 栏不在 title_evidence 与 certainty 之间：{_hren}")
v_tc = tc_check(ren)
for x in v_tc:
    print("   违例：" + x)
ck(v_tc == [], f"title_certainty 违例 {len(v_tc)} 条")
ck(not any("未证" in r["certainty"] or "判别力" in r["certainty"] for r in ren), "certainty 仍兼「职之推之验」之义")
tc_cnt = {}
for r in ren:
    tc_cnt[r["title_certainty"]] = tc_cnt.get(r["title_certainty"], 0) + 1
print("   title_certainty 分布：", tc_cnt)
ck(tc_cnt == {"明文": 9, TC_D1: 3, TC_D2: 4}, f"title_certainty 分布不符：{tc_cnt}")
v_td = tc_domain_check(ren, ZJJ_TEXT_YEARS)
for x in v_td:
    print("   违例：" + x)
ck(v_td == [], f"title_certainty 之域违例 {len(v_td)} 条")
# 〔r59-E6 改（裁一百五十八 ③）〕ZJJ_TEXT_YEARS 之量
v_zm = zjj_meta_check(ZJJ_TEXT_YEARS, ZJJ_TEXT_YEARS_META)
for x in v_zm:
    print("   违例：" + x)
ck(v_zm == [], f"ZJJ_TEXT_YEARS_META 违例 {len(v_zm)} 条")
if ZJJ_TEXT_YEARS_META["status"] == "待裁":  # 今为已定，本支不入
    print("   ★ ZJJ_TEXT_YEARS 待裁：重跑全集 %d 元，现元 %d；多 %s、缺 %s；末元 重跑 %d／现 %d"
          % (ZJJ_TEXT_YEARS_META["rerun_count"], len(ZJJ_TEXT_YEARS), ZJJ_TEXT_YEARS_META["diff_extra"],
             ZJJ_TEXT_YEARS_META["diff_missing"], max(ZJJ_TEXT_YEARS_META["rerun_years"]), max(ZJJ_TEXT_YEARS)))
# 只报不改：以重跑集代入域检，看其判是否有异（仅供裁者参考；现门仍以 ZJJ_TEXT_YEARS 为据）
v_td_rr = tc_domain_check(ren, ZJJ_TEXT_YEARS_META["rerun_years"])
print("   以重跑集代入域检之违例：%d 条 %s" % (len(v_td_rr), v_td_rr[:2]))
ck(max(ZJJ_TEXT_YEARS_META["rerun_years"]) == max(ZJJ_TEXT_YEARS), "重跑集之末元与现元之末元不同（界年之地基有变）")
ck(not any("本段无判别力" in r["title_certainty"] for r in ren), "title_certainty 仍书「本段」（其域未明书）")


# r59-E2（裁一百四十四）立；r59-E3（裁一百四十七）改：#11 荀罃书「推」，start_basis 须书独立之源二支、各明其源并明其强弱
def n11_check(rows):
    bad = []
    r = next(x for x in rows if int(x["seq"]) == 11)
    sb = r["start_basis"]
    if r["title_evidence"] != "推":
        bad.append(f"第 11 任 title_evidence「{r['title_evidence']}」非「推」（他国人之言不当晋之职名明文）")
    for need in ("支一〔他国之称述〕", "楚令尹子囊之口", "以為政", "同出子囊一口，不另计一支，并入支一",
                 "支二〔本国之自述〕", "晋人士匄之口", "昔臣習於知伯，是以佐之", "Q541",
                 "支二（本国、自述、独立于子囊之口）＞支一"):
        if need not in sb:
            bad.append(f"第 11 任 start_basis 缺「{need}」（二支须明其源与强弱）")
    # 同句同口之「佐中軍」不得再计为独立一支，亦不得再称其强于称述（裁一百四十七）
    for bad_phrase in ("结构之推", "佐有明文则将有其位"):
        if bad_phrase in sb:
            bad.append(f"第 11 任 start_basis 仍有「{bad_phrase}」（同口之语计为二证）")
    if not sb.startswith("推"):
        bad.append("第 11 任 start_basis 未以「推」起首")
    return bad


v_11 = n11_check(ren)
for x in v_11:
    print("   违例：" + x)
ck(v_11 == [], f"第 11 任之推违例 {len(v_11)} 条")

# ---------- 6c. r59-E：三处照实（裁一百四十二⑤⑥⑧）----------
_all_inc = ""
for fn in os.listdir(HERE):
    if fn.endswith(".csv"):
        with open(os.path.join(HERE, fn), encoding="utf-8") as f:
            _all_inc += f.read()
ck("纸本已核" not in _all_inc, "备料内出现「纸本已核」（本件未取纸本）")
for r in rd(os.path.join(HERE, NEW["sources"])):
    ck("核对状态属电子本" in r["notes"] and "未能双本互校" in r["notes"],
       f"{r['id']} 核对状态未书电子本之属／未能双本互校")
e313 = next(r for r in rd(os.path.join(HERE, NEW["events"])) if r["id"] == "E313")
ck(e313["place_id"] == "" and "L_MIANSHANG" in e313["summary"] and "未核（2026-10-04" in e313["summary"],
   "E313 未就地书 L_MIANSHANG「未核」（带其时其核者）或竟已挂之")
q531 = next(r for r in rd(os.path.join(HERE, NEW["passages"])) if r["id"] == "Q531")
ck(q531["event_id"] == "E305" and "前620" in q531["modern_note"] and "前621" in q531["modern_note"]
   and "不同年" in q531["modern_note"], "Q531 未就地书其跨年之实（引文前620／事目前621）")

q540 = next(r for r in rd(os.path.join(HERE, NEW["passages"])) if r["id"] == "Q540")
ck("则知罃即中军之将" not in q540["modern_note"] and "不作二证" in q540["modern_note"],
   "Q540 仍以子囊同句之「佐中軍」断知罃即中军之将（同口二证）")
# r59-E4（裁一百五十二 二、三）：P_XUNYING 三栏同治——role 只「晋卿」；short_bio／relations 不书「执政」，
# 书「为政」者须随书其为子囊之称述；「继韩厥」不入三栏而入 notes，书其为推并明其源
def xy_check(people_rows, ep_rows):
    bad = []
    x = next(r for r in people_rows if r["id"] == "P_XUNYING")
    if x["role"] != "晋卿":
        bad.append(f"P_XUNYING.role「{x['role']}」非「晋卿」")
    for k in ("role", "short_bio", "relations"):
        v = x[k]
        if "执政" in v:
            bad.append(f"P_XUNYING.{k} 书「执政」")
        if ("为政" in v or "為政" in v) and "子囊" not in v:
            bad.append(f"P_XUNYING.{k} 书为政而未随书其为子囊之称述")
        if "继韩厥" in v:
            bad.append(f"P_XUNYING.{k} 书「继韩厥」（其据只在子囊一口，系推）")
        if "荀偃继之" in v or "其时为政者即其人" in v:
            bad.append(f"P_XUNYING.{k} 以「荀偃继之／即其人」断其职")
    for need in ("【继韩厥】系推", "子囊一口", "Q540", "他国之称述", "不言其继韩厥"):
        if need not in x["notes"]:
            bad.append(f"P_XUNYING.notes 缺「{need}」")
    # 同病他处：以荀罃为中军将之断（荀罃 title_evidence＝推）——r59-E4 顺带修正二条之断，俟领队准（裁一百五十四）；
    # 还原模式下此二断不施（二条复其原字，由 revert_check 与合并副本之定值断言验之）
    if not REVERT_MODE:
        for r in people_rows:
            if "继荀罃" in r["relations"]:
                bad.append(f"{r['id']}.relations 书「继荀罃」")
        for r in ep_rows:
            if r["person_id"] == "P_XUNYING" and "中军将之职由荀偃继" in r["role_in_event"]:
                bad.append(f"{r['event_id']}／P_XUNYING.role_in_event 断其中军将之职由荀偃继")
    return bad


# r59-E5（裁一百五十四）：还原补丁之形——键在备料、只涉所报之栏、其值即 r59-E4 改前之原字；余栏与备料行一字不差
def revert_check(new_people, new_ep, rv_people, rv_ep):
    bad = []
    NPp = {r["id"]: r for r in new_people}
    NEe = {(r["event_id"], r["person_id"]): r for r in new_ep}
    if [r["id"] for r in rv_people] != ["P_XUNYAN"]:
        bad.append(f"还原补丁 people 之键 {[r['id'] for r in rv_people]} 非 [P_XUNYAN]")
    if [(r["event_id"], r["person_id"]) for r in rv_ep] != [("E313", "P_XUNYING")]:
        bad.append("还原补丁 event_people 之键非 [E313/P_XUNYING]")
    for r in rv_people:
        n = NPp.get(r["id"])
        if n is None:
            bad.append(f"还原补丁之 {r['id']} 不在 people_new.csv")
            continue
        diff = {k for k in r if r[k] != n[k]}
        if diff != {"relations", "notes"}:
            bad.append(f"P_XUNYAN 还原所涉之栏 {sorted(diff)} 非 [notes, relations]")
        if r["relations"] != SIDEFIX_XUNYAN_REL_OLD or n["relations"] != SIDEFIX_XUNYAN_REL_NEW:
            bad.append("P_XUNYAN.relations 之还原值或现值与所报原字／新字不符")
        if SIDEFIX_XUNYAN_NOTE not in n["notes"] or n["notes"].replace(SIDEFIX_XUNYAN_NOTE, "") != r["notes"]:
            bad.append("P_XUNYAN.notes 之还原非「删去顺带修正一句、余字不动」")
        if r["role"] != "晋中军将":
            bad.append("P_XUNYAN.role 于还原补丁内被动（role 系裁一百五十二 所令，不在还原之列）")
    for r in rv_ep:
        n = NEe.get((r["event_id"], r["person_id"]))
        if n is None:
            bad.append("还原补丁之 E313/P_XUNYING 不在 event_people_new.csv")
            continue
        diff = {k for k in r if r[k] != n[k]}
        if diff != {"role_in_event"}:
            bad.append(f"E313/P_XUNYING 还原所涉之栏 {sorted(diff)} 非 [role_in_event]")
        if r["role_in_event"] != SIDEFIX_E313_OLD or n["role_in_event"] != SIDEFIX_E313_NEW:
            bad.append("E313/P_XUNYING.role_in_event 之还原值或现值与所报原字／新字不符")
    return bad


v_xy = xy_check(merged["people"], NEP)
for x in v_xy:
    print("   违例：" + x)
ck(v_xy == [], f"P_XUNYING 三栏同治违例 {len(v_xy)} 条")
_rvP = rd(os.path.join(HERE, REVERT["people"]))
_rvE = rd(os.path.join(HERE, REVERT["event_people"]))
v_rv = revert_check(rd(os.path.join(HERE, NEW["people"])), rd(os.path.join(HERE, NEW["event_people"])), _rvP, _rvE)
for x in v_rv:
    print("   违例：" + x)
ck(v_rv == [], f"还原补丁之形违例 {len(v_rv)} 条")
_mp0 = {r["id"]: r for r in merged["people"]}
_me0 = {(r["event_id"], r["person_id"]): r for r in merged["event_people"]}
if REVERT_MODE:
    ck(_mp0["P_XUNYAN"]["relations"] == SIDEFIX_XUNYAN_REL_OLD and SIDEFIX_XUNYAN_NOTE not in _mp0["P_XUNYAN"]["notes"]
       and _me0[("E313", "P_XUNYING")]["role_in_event"] == SIDEFIX_E313_OLD, "还原模式下合并副本之二条未复原字")
else:
    ck(_mp0["P_XUNYAN"]["relations"] == SIDEFIX_XUNYAN_REL_NEW and SIDEFIX_XUNYAN_NOTE in _mp0["P_XUNYAN"]["notes"]
       and _me0[("E313", "P_XUNYING")]["role_in_event"] == SIDEFIX_E313_NEW, "默认模式下合并副本之二条非 r59-E4 新字")
_mp = {r["id"]: r for r in merged["people"]}
for pid, want in (("P_XIANQIEJU", "晋中军将"), ("P_XUNYAN", "晋中军将"), ("P_SHIHUI", "晋中军将；邲之战时为上军将")):
    ck(_mp[pid]["role"] == want, f"{pid}.role「{_mp[pid]['role']}」非「{want}」（裁一百五十二 一）")


# r59-E4（任务书 §七「其余三事」④）：不得留指向不存在之物之指路牌——E306 之「例见 zhongjunjiang_ren.csv 凡例」删其指
def pointer_check(events_rows, ren_hdr):
    bad = []
    for r in events_rows:
        if "凡例" in r["summary"] and "凡例" not in ren_hdr:
            bad.append(f"{r['id']}.summary 指「凡例」而任期表无其物")
    return bad


v_pt = pointer_check(rd(os.path.join(HERE, NEW["events"])), ",".join(hdr(os.path.join(HERE, REN))))
ck(v_pt == [], f"指向不存在之物之指路牌 {len(v_pt)} 处：{v_pt}")
ck("凡例" not in _all_inc, "备料 CSV 内仍有「凡例」之指（任期表无凡例）")

# ---------- 7. 替换件 ----------
sec("7. fixes_people 定点比对（P_SHIHUI／P_HANQI）")
# r59-E2：P_HANQI.role 复原不改（「中军将系推」不入 role，裁一百四十六③），故其 role 不在所改之栏
ALLOW = {"P_SHIHUI": {"role", "relations", "notes"}, "P_HANQI": {"relations", "notes", "active_years_bce"}}
for pid, allow in ALLOW.items():
    o = next(r for r in main["people"] if r["id"] == pid)
    n = next(r for r in merged["people"] if r["id"] == pid)
    for k in o:
        if k in allow:
            ck(o[k] != n[k], f"{pid}.{k} 未变（替换无意义）")
        else:
            ck(o[k] == n[k], f"{pid}.{k} 被改动（不在所报之栏）")
    for k in ("notes", "relations"):
        ck(n[k].startswith(o[k]), f"{pid}.{k} 非纯追加（原文被改）")
    ck("r59-D 勘注" in n["notes"], f"{pid}.notes 未落 r59-D 勘注")

# ---------- 8. 判据：中军将一时一人 ----------
# r59-E4：title_evidence＝將中軍而 role 兼书「执政」者，须另有其「执政」之明文（非由將中軍推得），逐人登记
EXEC_OK = {
    "P_ZHAODUN": "文公六年「宣子於是乎始為國政」",
    "P_XIKE": "宣公十七年「郤獻子為政」",
    "P_LUANSHU": "成公六年或人谓栾武子「子為大政」（晋人之言，非职名）",
}
def gate(people_rows, ren_rows):
    """返回违例列表。判据：
       (a) 〔r59-E2 改挂钩，裁一百四十六③〕任期表之人须在库且 state 含「晋」；
           凡 state 含「晋」且 role 含「中军将」者，须于任期表有其行，且其 title_evidence 为「將中軍」；
           任期表 title_evidence 为「將中軍」者 role 须含「中军将」，非「將中軍」者 role 不得含「中军将」；
           凡人之 role 不得含「系推」（推之属由任期表 title_evidence 承之，不以三字附于 role）；
       (b) 任二任之 [start,end] 不得相叠——相叠者，max(start) < min(end)（只共交接之一年者不为叠）；
       (c) 以 seq 为序，后任之 start 不得早于前任之 end；
       (d) 任期表所书之人若有 death_year_bce，其 end 不得晚于卒年。"""
    bad = []
    P = {r["id"]: r for r in people_rows}
    jzj = {r["id"] for r in people_rows if "晋" in r["state"] and "中军将" in r["role"]}
    te = {r["person_id"]: r["title_evidence"] for r in ren_rows}
    tp = set(te)
    for p in sorted(tp):
        if p not in P or "晋" not in P[p]["state"]:
            bad.append(f"(a) {p} 有任期而不在库或非晋人")
    for p in sorted(jzj - tp):
        bad.append(f"(a) {p} 书中军将而无任期")
    for p in sorted(jzj & tp):
        if te[p] != "將中軍":
            bad.append(f"(a) {p} role 书中军将而其 title_evidence 为「{te[p]}」（无职名明文者不得于 role 书中军将）")
    for p in sorted(tp - jzj):
        if te[p] == "將中軍" and p in P:
            bad.append(f"(a) {p} title_evidence 为將中軍而 role 不书中军将")
    for r in people_rows:
        if "系推" in r["role"]:
            bad.append(f"(a) {r['id']} role 以「系推」别之")
    # r59-E3（裁一百五十）：title_evidence 为「推」者，role 只容可断之物，不得书执政／为政／中军将
    # r59-E4（裁一百五十二 三）：亦不得书「继」某人（相继之断系推）
    for p in sorted(tp):
        if te[p] == "推" and p in P and any(w in P[p]["role"] for w in ("执政", "为政", "為政", "中军将", "继")):
            bad.append(f"(a) {p} 其职系推而 role 书「{P[p]['role']}」（role 只容可断之物）")
    # r59-E4（裁一百五十二 一）：「执政」入 role，须 title_evidence＝為政，或于 EXEC_OK 登记其「执政」之明文；
    # 將中軍 ⟹ 执政 之推未验，不得以將中軍一文书执政
    for p in sorted(tp):
        if p in P and ("执政" in P[p]["role"] or "为政" in P[p]["role"]) and te[p] != "為政" and p not in EXEC_OK:
            bad.append(f"(a) {p} title_evidence 为「{te[p]}」而 role 书「{P[p]['role']}」（执政无其明文之登记）")
    iv = [(int(r["start_bce"]), int(r["end_bce"]), r["person_id"], int(r["seq"])) for r in ren_rows]
    for s, e, p, _ in iv:
        if s > e:
            bad.append(f"(b) {p} start {s} 晚于 end {e}")
    for i in range(len(iv)):
        for j in range(i + 1, len(iv)):
            a, b = iv[i], iv[j]
            if max(a[0], b[0]) < min(a[1], b[1]):
                bad.append(f"(b) {a[2]} [{a[0]},{a[1]}] 与 {b[2]} [{b[0]},{b[1]}] 相叠")
    sq = sorted(iv, key=lambda x: x[3])
    for x, y in zip(sq, sq[1:]):
        if y[0] < x[1]:
            bad.append(f"(c) 第 {y[3]} 任 start {y[0]} 早于第 {x[3]} 任 end {x[1]}")
    for s, e, p, _ in iv:
        d = (P.get(p) or {}).get("death_year_bce", "")
        if d and e > int(d):
            bad.append(f"(d) {p} 任止 {e} 晚于卒年 {d}")
    return bad


sec("8. 判据正测：合并后之 people × 任期表（裁一百三十八 三）")
v = gate(merged["people"], ren)
for x in v:
    print("   违例：" + x)
ck(v == [], f"判据于合并后之数据报违例 {len(v)} 条")
ck(len(ren) == 16, f"任期表任数 {len(ren)} != 16")
ck([int(r["seq"]) for r in ren] == list(range(1, 17)), "任期表 seq 非 1–16 连号")
# 齐之国书 role 书「将中军」，不得为判据所误伤
ck(not any("国书" in x or "P_GUOSHU" in x for x in v), "判据误伤齐国书（P_GUOSHU）")

sec("9. 判据反证（裁一百一十四：反证须同跑，不红即 exit 2）")
REDS = []
# 反证一：二人任期相叠之形——赵盾之止推后至前597，与郤缺 [-601,-597] 相叠
r1 = [dict(r) for r in ren]
next(r for r in r1 if r["person_id"] == "P_ZHAODUN")["end_bce"] = "-597"
REDS.append(("赵盾任止推后至前597（与郤缺相叠）", gate(merged["people"], r1)))
# 反证二：荀罃之止误作卒后二年（-558），与荀偃 [-560,-554] 相叠，且晚于其卒年
r2 = [dict(r) for r in ren]
next(r for r in r2 if r["person_id"] == "P_XUNYING")["end_bce"] = "-558"
REDS.append(("荀罃任止误作前558（与荀偃相叠、逾卒年）", gate(merged["people"], r2)))
# 反证三：晋人书「中军将」而无任期（先縠 role 误书为「晋中军将」）
p3 = [dict(r) for r in merged["people"]]
next(r for r in p3 if r["id"] == "P_XIANGU")["role"] = "晋中军将"
REDS.append(("先縠 role 误书中军将而无任期", gate(p3, ren)))
# 反证四：本件未立之先且居与先轸同年同任（先轸之止推后一年）
r4 = [dict(r) for r in ren]
next(r for r in r4 if r["person_id"] == "P_XIANZHEN")["end_bce"] = "-626"
REDS.append(("先轸任止推后至前626（与先且居相叠）", gate(merged["people"], r4)))
# 反证五（r59-E）：先且居 E304 复标亲至、只引「先且居將中軍」——以职推在场之形，须红
n5 = [dict(r) for r in NEP]
x5 = next(r for r in n5 if (r["event_id"], r["person_id"]) == ("E304", "P_XIANQIEJU"))
x5["presence"] = "亲至"
x5["role_in_event"] = "将中军御秦。传明书「先且居將中軍」而及秦师战于彭衙，标「亲至」"
REDS.append(("E304 先且居以「將中軍」复标亲至", presence_by_office(n5)))
# 反证六（r59-E）：E200 栾书之注只留军序「欒書將中軍」——须红
n6 = [dict(r) for r in NEP]
next(r for r in n6 if (r["event_id"], r["person_id"]) == ("E200", "P_LUANSHU"))["role_in_event"] = "中军将。传书「欒書將中軍」，标「亲至」"
REDS.append(("E200 栾书只以军序标亲至", presence_by_office(n6)))
# 反证七（r59-E）：郤缺之 title_evidence 归并为「將中軍」——须红
r7 = [dict(r) for r in ren]
next(r for r in r7 if r["person_id"] == "P_XIQUE")["title_evidence"] = "將中軍"
REDS.append(("郤缺 title_evidence 误并为將中軍", te_check(r7)))
# 反证八（r59-E）：韩厥之 zhi_wen 复写「——将中军系推」——须红
r8 = [dict(r) for r in ren]
next(r for r in r8 if r["person_id"] == "P_HANJUE")["zhi_wen"] = "為政（成公十八年）——将中军系推"
REDS.append(("韩厥 zhi_wen 复以「系推」别之", te_check(r8)))
# 反证九（r59-E）：title_evidence 填三值之外之「为政系推」——须红
r9 = [dict(r) for r in ren]
next(r for r in r9 if r["person_id"] == "P_ZHAOWU")["title_evidence"] = "为政系推"
REDS.append(("赵武 title_evidence 填三值之外", te_check(r9)))
# 反证十（r59-E2）：郤缺 role 复书「晋执政（为政；中军将系推）」——须红（门之新挂钩）
p10 = [dict(r) for r in merged["people"]]
next(r for r in p10 if r["id"] == "P_XIQUE")["role"] = "晋执政（为政；中军将系推）"
REDS.append(("郤缺 role 复书「中军将系推」", gate(p10, ren)))
# 反证十一（r59-E2）：赵武 role 书「晋中军将（执政）」而其 title_evidence 只是為政——须红
p11 = [dict(r) for r in merged["people"]]
next(r for r in p11 if r["id"] == "P_ZHAOWU")["role"] = "晋中军将（执政）"
REDS.append(("赵武 role 无职名明文而书中军将", gate(p11, ren)))
# 反证十二（r59-E2 立；r59-E3 改其载体）：士匄之验并入前段之「反例已求·未见」——须红
# （r59-E2 原注入「certainty＝medium」；r59-E3 certainty 还原后 medium 即其正值，故改注于新栏）
r12 = [dict(r) for r in ren]
next(r for r in r12 if r["person_id"] == "P_SHIGAI")["title_certainty"] = TC_D1  # r59-E4：注入带域之前段值
REDS.append(("士匄 title_certainty 与前段同列", tc_check(r12)))
# 反证十三（r59-E2 立；r59-E3 改其句）：荀罃 start_basis 删去强弱之句——须红
r13 = [dict(r) for r in ren]
x13 = next(r for r in r13 if r["person_id"] == "P_XUNYING")
x13["start_basis"] = x13["start_basis"].replace("★ 其推之强弱：支二（本国、自述、独立于子囊之口）＞支一（他国之称述，其同句之旁亦同口）。", "")
REDS.append(("荀罃 start_basis 删其强弱", n11_check(r13)))
# 反证十四（r59-E2）：荀罃 title_evidence 复作「為政」——te_check 不能捉（其 zhi_wen 含「為政」），须由 n11_check 捉
r14 = [dict(r) for r in ren]
next(r for r in r14 if r["person_id"] == "P_XUNYING")["title_evidence"] = "為政"
REDS.append(("荀罃 title_evidence 复作為政", n11_check(r14)))
# 反证十五（r59-E3）：荀罃 start_basis 复作 r59-E2 之文（同句同口之「佐中軍」计为第二支）——须红
R59E2_SB = ("推：其任之推有二支——㈠ 他国人之称述：襄公九年（前564）楚子囊言「韓厥老矣，知罃稟焉以為政」，"
            "是对晋政之描述，非晋之职名；㈡ 结构之推：同句明书「范匄少於中行偃而上之，使佐中軍」，"
            "佐有明文则将有其位，而同句居佐之上者即知罃。★ 其推之强弱：结构之推（佐有明文）＞他国人之称述。"
            "其起之年：韩厥于襄公七年（前566）冬告老，继任者当年无明文，至襄公九年始见上文；取前566（落在前566—前564）")
r15 = [dict(r) for r in ren]
next(r for r in r15 if r["person_id"] == "P_XUNYING")["start_basis"] = R59E2_SB
REDS.append(("荀罃 start_basis 复以同口二语为二支", n11_check(r15)))
# 反证十六（r59-E3）：赵武 certainty 复兼「未证：……」——须红（一栏不得兼二义）
r16 = [dict(r) for r in ren]
next(r for r in r16 if r["person_id"] == "P_ZHAOWU")["certainty"] = "未证：其辅查于本段无判别力（此段无「將中軍」之文可撞）"
REDS.append(("赵武 certainty 复兼职之推之验", cert_check(r16)))
# 反证十七（r59-E3）：郤缺 title_certainty 书「明文」而其 title_evidence 只是為政——须红
r17 = [dict(r) for r in ren]
next(r for r in r17 if r["person_id"] == "P_XIQUE")["title_certainty"] = "明文"
REDS.append(("郤缺 title_certainty 冒作明文", tc_check(r17)))
# 反证十八（r59-E3）：魏舒 title_certainty 并入前段之值——须红
r18 = [dict(r) for r in ren]
next(r for r in r18 if r["person_id"] == "P_WEISHU")["title_certainty"] = TC_D1  # r59-E4：注入带域之前段值
REDS.append(("魏舒 title_certainty 与前段同列", tc_check(r18)))
# 反证十九（r59-E3）：荀罃 role 复作「晋执政（继韩厥）」——须红（裁一百五十：其职系推，role 不书执政）
p19 = [dict(r) for r in merged["people"]]
next(r for r in p19 if r["id"] == "P_XUNYING")["role"] = "晋执政（继韩厥）"
REDS.append(("荀罃 role 复书执政", gate(p19, ren)))
# ---- r59-E4 反证（裁一百五十一、一百五十二）----
# 反证二十：先且居 role 复作「晋中军将（执政）」——將中軍 ⟹ 执政 之推未验，须红
p20 = [dict(r) for r in merged["people"]]
next(r for r in p20 if r["id"] == "P_XIANQIEJU")["role"] = "晋中军将（执政）"
REDS.append(("先且居 role 复书（执政）", gate(p20, ren)))
# 反证二十一：士会 role 复作 r59-E3 之「晋中军将（执政）；邲之战时为上军将」——须红
p21 = [dict(r) for r in merged["people"]]
next(r for r in p21 if r["id"] == "P_SHIHUI")["role"] = "晋中军将（执政）；邲之战时为上军将"
REDS.append(("士会 role 复书（执政）", gate(p21, ren)))
# 反证二十二：荀罃 role 复作「晋卿（继韩厥）」——须红（门与 xy_check 各当捉）
p22 = [dict(r) for r in merged["people"]]
next(r for r in p22 if r["id"] == "P_XUNYING")["role"] = "晋卿（继韩厥）"
REDS.append(("荀罃 role 复书继韩厥（门）", gate(p22, ren)))
REDS.append(("荀罃 role 复书继韩厥（三栏）", xy_check(p22, NEP)))
# 反证二十三：荀罃 short_bio 复作 r59-E3 原文——须红
p23 = [dict(r) for r in merged["people"]]
next(r for r in p23 if r["id"] == "P_XUNYING")["short_bio"] = ("邲之战被囚于楚，九年后以连尹襄老之尸易归；悼公之世继韩厥执政，"
                                                                "楚子囊谓晋「君明臣忠，上讓下競」，其时为政者即其人。")
REDS.append(("荀罃 short_bio 复书继韩厥执政", xy_check(p23, NEP)))
# 反证二十四：荀罃 relations 复作 r59-E3 原文——须红
p24 = [dict(r) for r in merged["people"]]
next(r for r in p24 if r["id"] == "P_XUNYING")["relations"] = "邲之战见囚于楚（E128）；鄢陵之战居守（E200）；继韩厥为政（E312）；卒而荀偃继之（E313）"
REDS.append(("荀罃 relations 复书继韩厥为政", xy_check(p24, NEP)))
# 反证二十五：E313／P_XUNYING 之挂链注复作「其中军将之职由荀偃继」——须红
n25 = [dict(r) for r in NEP]
next(r for r in n25 if (r["event_id"], r["person_id"]) == ("E313", "P_XUNYING"))["role_in_event"] = "卒，其中军将之职由荀偃继。已卒之人非行动主体"
if not REVERT_MODE:  # 还原模式下此断不施（二条俟领队准），本反证随之不跑
    REDS.append(("E313 荀罃复断其中军将之职由荀偃继", xy_check(merged["people"], n25)))
# 反证二十六：郤缺 title_certainty 去其域（复作 r59-E3 之光板「反例已求·未见」）——须红
r26 = [dict(r) for r in ren]
next(r for r in r26 if r["person_id"] == "P_XIQUE")["title_certainty"] = "反例已求·未见"
REDS.append(("郤缺 title_certainty 去其域", tc_domain_check(r26, ZJJ_TEXT_YEARS)))
# 反证二十七：#13–#16 之域误书为「前554–前509」——不与前段之域相接，须红
r27 = [dict(r) for r in ren]
for r in r27:
    if r["title_certainty"] == TC_D2:
        r["title_certainty"] = TC_D2.replace("前559–前509", "前554–前509")
REDS.append(("后段之域与前段不相接", tc_domain_check(r27, ZJJ_TEXT_YEARS)))
# 反证二十八：登记之文年注入一条前550 之「將中軍」——「该段无可撞之文」之断须红（证其检能红）
REDS.append(("后段注入一条將中軍之文年", tc_domain_check(ren, ZJJ_TEXT_YEARS + [-550])))
# 反证二十九：荀罃之任止误入后段（止于前558）——出其域，须红
r29 = [dict(r) for r in ren]
next(r for r in r29 if r["person_id"] == "P_XUNYING")["end_bce"] = "-558"
REDS.append(("荀罃任止出其域", tc_domain_check(r29, ZJJ_TEXT_YEARS)))
# 反证三十：E306 复留「例见 zhongjunjiang_ren.csv 凡例」之指——须红
e30 = [dict(r) for r in rd(os.path.join(HERE, NEW["events"]))]
x30 = next(r for r in e30 if r["id"] == "E306")
x30["summary"] = x30["summary"].replace("两语互见之例推之，", "两语互见之例推之（例见 `zhongjunjiang_ren.csv` 凡例），")
REDS.append(("E306 复留指向不存在之凡例", pointer_check(e30, ",".join(hdr(os.path.join(HERE, REN))))))
# 反证三十一（r59-E5）：后域复作裁一百五十一 原字「前560–前509」（界年二域共之）——须红（二域相叠；且前560 之「將中軍」落后域）
r31 = [dict(r) for r in ren]
for r in r31:
    if r["title_certainty"] == TC_D2:
        r["title_certainty"] = TC_D2.replace("前559–前509", "前560–前509")
REDS.append(("后域复作「前560–前509」（界年二域共之）", tc_domain_check(r31, ZJJ_TEXT_YEARS)))
# 反证三十二（r59-E5）：还原补丁之 P_XUNYAN 误连 role 一并复作「晋中军将（执政）」——须红（role 系裁一百五十二 所令，不在还原之列）
rv32 = [dict(r) for r in _rvP]
rv32[0]["role"] = "晋中军将（执政）"
REDS.append(("还原补丁误复 P_XUNYAN.role", revert_check(rd(os.path.join(HERE, NEW["people"])),
                                                     rd(os.path.join(HERE, NEW["event_people"])), rv32, _rvE)))
# 反证三十三（r59-E5）：还原补丁之 E313 挂链注只复半句（漏后半）——须红
rv33 = [dict(r) for r in _rvE]
rv33[0]["role_in_event"] = "卒，其中军将之职由荀偃继。"
REDS.append(("还原补丁 E313 只复半句", revert_check(rd(os.path.join(HERE, NEW["people"])),
                                                rd(os.path.join(HERE, NEW["event_people"])), _rvP, rv33)))
# 〔r59-E6 改（裁一百五十八 ③）〕ZJJ_TEXT_YEARS 之量——三反证
# 反证三十四：已定之下，现元缺前633、前619（退回 13 元）而重跑集仍 15——须红（「全集＝现元」之断能红）
REDS.append(("META 已定而现元退回 13（全集≠现元）", zjj_meta_check([y for y in ZJJ_TEXT_YEARS if y not in (-633, -619)], ZJJ_TEXT_YEARS_META)))
# 反证三十五：META 之 retrieved 抹空（「未重跑而无人知其未重跑」之形）——须红
m35 = dict(ZJJ_TEXT_YEARS_META, retrieved="")
REDS.append(("META.retrieved 为空", zjj_meta_check(ZJJ_TEXT_YEARS, m35)))
# 反证三十六：重跑集注入一条前550（前560 后另有一条）而所记之差未随——须红
m36 = dict(ZJJ_TEXT_YEARS_META, rerun_years=ZJJ_TEXT_YEARS_META["rerun_years"] + [-550], rerun_count=16)
REDS.append(("重跑集多出前550 而所记之差未随", zjj_meta_check(ZJJ_TEXT_YEARS, m36)))
counter_ok = True
for name, res in REDS:
    red = len(res) > 0
    print("   反证「%s」：%s %s" % (name, "红" if red else "**未红**", res[:2]))
    counter_ok = counter_ok and red

# ---------- 10. validate ----------
sec("10. tools/validate.py（于副本上跑）")
p = subprocess.run([sys.executable, os.path.join(TMP, "tools", "validate.py")],
                   cwd=TMP, capture_output=True, text=True, encoding="utf-8", errors="replace")
print((p.stdout or "").rstrip())
if (p.stderr or "").strip():
    print("   stderr: " + p.stderr.strip())
print("   exit code = %d" % p.returncode)
ck(p.returncode == 0, "validate.py 退出码非 0")

print()
print("== 断言分布（实测） ==")
for k, n in DIST.items():
    print("   %-52s %4d" % (k, n))
print()
code = 0 if FAIL == 0 else 1
if not counter_ok:
    code = 2
print("%d PASS  %d FAIL  反证 %d 条%s  exit %d%s" % (PASS, FAIL, len(REDS), "俱红" if counter_ok else "有未红者", code,
                                               "（还原模式）" if REVERT_MODE else ""))
sys.exit(code)
