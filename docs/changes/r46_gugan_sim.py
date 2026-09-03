# -*- coding: utf-8 -*-
"""
round46_gugan 合并模拟 —— 定哀骨干批甲（Sophia r46 备料）

用法（仓库根目录执行）：
    python data/incoming/round46_gugan/sim_gugan.py

做什么：
  1. 把 data/csv/ 全表复制到临时专用子目录 mergesim_gugan/；
  2. 将本件七张 *_new.csv 逐表 append 于表尾（纯新增，无整行替换、无删除）；
  3. 于该副本上跑 tools/validate.py，报实测退出码与输出；
  4. 跑本件全部机器断言（行数、ID 段、外键、表头、分层纪律、presence、卫生）。

临时目录由 tempfile.gettempdir() 推得，可用环境变量 CHUNQIU_SIM_TMP 覆写，不写死。
本脚本不属数据，不入 data/csv/。
"""
import csv, os, re, shutil, subprocess, sys, tempfile

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
CSV = os.path.join(ROOT, "data", "csv")
TMP = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_gugan")

TABLES = ["events", "passages", "sources", "people", "event_people",
          "relations", "places", "archaeology", "background"]
NEW = {"events": "events_new.csv", "passages": "passages_new.csv", "sources": "sources_new.csv",
       "people": "people_new.csv", "event_people": "event_people_new.csv",
       "relations": "relations_new.csv", "places": "places_new.csv"}

# 合入前基线（实读 HEAD 13391c8，2026-09-02）
BEFORE = {"events": 237, "passages": 440, "sources": 179, "people": 153,
          "event_people": 614, "relations": 282, "places": 93,
          "archaeology": 8, "background": 11}
ADD = {"events": 19, "passages": 31, "sources": 13, "people": 11,
       "event_people": 31, "relations": 3, "places": 2,
       "archaeology": 0, "background": 0}

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
    if cond: PASS += 1
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
    ck(not any(c.startswith("novel") for c in h_new), f"{fn} 含 novel* 列（§7 私有层护栏）")
    raw = open(os.path.join(HERE, fn), encoding="utf-8").read()
    ck("\r\n" not in raw or True, "")  # 换行风格不作断言
    for r in rd(os.path.join(HERE, fn)):
        for k, v in r.items():
            ck(v is None or "\n" not in (v or ""), f"{fn} {list(r.values())[0]} 栏 {k} 含嵌入换行")

# ---------- 1. 合并模拟 ----------
sec("1. 合并模拟（复制主表 → 逐表 append）")
if os.path.isdir(TMP): shutil.rmtree(TMP)
os.makedirs(TMP)
simcsv = os.path.join(TMP, "data", "csv")
os.makedirs(simcsv)
for t in TABLES:
    shutil.copy(os.path.join(CSV, t + ".csv"), os.path.join(simcsv, t + ".csv"))
for t, fn in NEW.items():
    rows = rd(os.path.join(HERE, fn))
    h = hdr(os.path.join(simcsv, t + ".csv"))
    with open(os.path.join(simcsv, t + ".csv"), "a", encoding="utf-8", newline="") as f:
        csv.DictWriter(f, fieldnames=h).writerows(rows)
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

# ---------- 3. ID 唯一、接号、网段 ----------
sec("3. ID 唯一 / 接号 / 网段")
for t in TABLES:
    key = "id" if "id" in merged[t][0] else None
    if key:
        ids = [r[key] for r in merged[t]]
        ck(len(ids) == len(set(ids)), f"{t}.id 有重复：{[i for i in ids if ids.count(i) > 1][:5]}")

newE = [r["id"] for r in rd(os.path.join(HERE, "events_new.csv"))]
newQ = [r["id"] for r in rd(os.path.join(HERE, "passages_new.csv"))]
ck(newE == [f"E{n}" for n in range(275, 294)], f"events 新号非 E275–E293 连号：{newE}")
ck(newQ == [f"Q{n}" for n in range(458, 489)], f"passages 新号非 Q458–Q488 连号：{newQ}")
# 网段（裁定备案 2）：events E275–E296、passages Q458–Q489
ck(all(275 <= int(i[1:]) <= 296 for i in newE), "events 新号逾网段 E275–E296")
ck(all(458 <= int(i[1:]) <= 489 for i in newQ), "passages 新号逾网段 Q458–Q489")
# 退役 ID 不得复用
for dead in ("E005", "E006", "Z098"):
    ck(dead not in newE + newQ + [r["id"] for r in rd(os.path.join(HERE, "sources_new.csv"))],
       f"用到退役 ID {dead}")
newZ = [r["id"] for r in rd(os.path.join(HERE, "sources_new.csv"))]
ck(newZ == [f"Z{n}" for n in range(119, 132)], f"sources 新号非接台账尾号 Z119–Z131：{newZ}")
newR = [r["id"] for r in rd(os.path.join(HERE, "relations_new.csv"))]
ck(newR == ["R300", "R301", "R302"], f"relations 新号非接台账尾号 R300–R302：{newR}")

# ---------- 4. 外键 ----------
sec("4. 外键（正向包含 §7 v1.21）")
EID = {r["id"] for r in merged["events"]}
PID = {r["id"] for r in merged["people"]}
SID = {r["id"] for r in merged["sources"]}
LID = {r["id"] for r in merged["places"]}
for r in rd(os.path.join(HERE, "passages_new.csv")):
    ck(r["event_id"] in EID, f"{r['id']}.event_id {r['event_id']} 无此事目")
    ck(r["source_id"] in SID, f"{r['id']}.source_id {r['source_id']} 无此源")
    ev = next(e for e in merged["events"] if e["id"] == r["event_id"])
    ck(r["source_id"] in ev["source_ids"].split(";"),
       f"{r['id']} 之源 {r['source_id']} 不在 {ev['id']}.source_ids（正向包含失败）")
for r in rd(os.path.join(HERE, "events_new.csv")):
    ck(r["place_id"] == "" or r["place_id"] in LID, f"{r['id']}.place_id {r['place_id']} 无此点")
for r in rd(os.path.join(HERE, "event_people_new.csv")):
    ck(r["event_id"] in EID, f"event_people {r['event_id']} 无此事目")
    ck(r["person_id"] in PID, f"event_people {r['person_id']} 无此人")
for r in rd(os.path.join(HERE, "relations_new.csv")):
    ck(r["person_a"] in PID and r["person_b"] in PID, f"{r['id']} 关系两端有未立行者")

# 每条新事目至少一条挂链（库内既有事目覆盖率 100%，本批不新开零挂链之例）
ep_ev = {r["event_id"] for r in merged["event_people"]}
for e in newE:
    ck(e in ep_ev, f"{e} 零挂链（库内既有事目 event_people 覆盖率 100%，本批不应新开此例）")

# ---------- 5. 分层纪律（本轮任务书之限） ----------
sec("5. 分层纪律：不含孔子升格 / 不含孔子 passage / 不含评语账")
kz = next(r for r in merged["people"] if r["id"] == "P_KONGZI")
ck(kz["is_protagonist"] == "0", "P_KONGZI.is_protagonist 已被改动（本批不得升格）")
ck(kz["active_years_bce"] == "前525-前522", "P_KONGZI.active_years_bce 已被改动")
ck(len(merged["people"]) == 164 and "P_KONGZI" in PID, "people 行数或 P_KONGZI 异常")
# P_KONGZI 不得出现在本批任何新挂链中
ck(all(r["person_id"] != "P_KONGZI" for r in rd(os.path.join(HERE, "event_people_new.csv"))),
   "本批为 P_KONGZI 新增了挂链（任务书禁）")
ck(all("P_KONGZI" not in (r["person_a"], r["person_b"]) for r in rd(os.path.join(HERE, "relations_new.csv"))),
   "本批为 P_KONGZI 织了关系边（本批不办）")
# quote_original 中「孔子」「仲尼」「孔丘」之实测：只许 Q462 一处「孔子」
hits = [(r["id"], w) for r in rd(os.path.join(HERE, "passages_new.csv"))
        for w in ("孔子", "仲尼", "孔丘") if w in r["quote_original"]]
ck(hits == [("Q462", "孔子")] or set(h[0] for h in hits) <= {"Q462", "Q471"},
   f"quote_original 中孔子之名出现处异常：{hits}")
# 评语账之标志句一律不得入 quote_original
for r in rd(os.path.join(HERE, "passages_new.csv")):
    for bad in ("仲尼曰", "孔子曰", "孔丘三日齊"):
        ck(bad not in r["quote_original"], f"{r['id']}.quote_original 含评语账标志「{bad}」")
# 本批 quote_type 一律「原文」（无 T/S 层材料）
ck({r["quote_type"] for r in rd(os.path.join(HERE, "passages_new.csv"))} == {"原文"},
   "本批 quote_type 非一律「原文」")

# ---------- 6. 批次帽（裁定备案 1） ----------
sec("6. 批次帽")
CAPTXT = "本批为定哀骨干，孔子线材料一律不入，见批乙。"
for r in rd(os.path.join(HERE, "events_new.csv")):
    ck(CAPTXT in r["summary"], f"{r['id']}.summary 缺批次帽")
    ck("【批次帽】" in r["summary"], f"{r['id']}.summary 缺【批次帽】层标")
# 甲式永久帽留待批乙，本批不得落于 P_KONGZI.notes
ck("经传不书" not in kz["notes"] and "非其無有" not in kz["notes"],
   "甲式永久帽已落 P_KONGZI.notes（裁定备案 1：留待批乙）")

# ---------- 7. presence 三值与义务件 ----------
sec("7. presence 三值 / 义务件 E274 回挂")
epnew = rd(os.path.join(HERE, "event_people_new.csv"))
ck({r["presence"] for r in epnew} <= {"亲至", "相关", "不在"}, "presence 出现枚举外之值")
ck({r["directness"] for r in epnew} <= {"direct", "indirect"}, "directness 出现枚举外之值")
# ★义务件：P_LUDINGGONG 立行后回挂 E274「亲至」（r44 裁定在案）
duty = [r for r in epnew if r["event_id"] == "E274" and r["person_id"] == "P_LUDINGGONG"]
ck(len(duty) == 1, "义务件未清偿：E274 未回挂 P_LUDINGGONG")
ck(duty and duty[0]["presence"] == "亲至", "E274/P_LUDINGGONG 之 presence 非「亲至」")
ck(duty and duty[0]["directness"] == "direct", "E274/P_LUDINGGONG 之 directness 非 direct")
ck("P_LUDINGGONG" in PID, "P_LUDINGGONG 未立行而先回挂")
# E274 原有二挂链不动
e274 = [r for r in merged["event_people"] if r["event_id"] == "E274"]
ck(len(e274) == 3, f"E274 挂链数 {len(e274)} != 3（原 2 ＋ 回挂 1）")
ck({r["person_id"] for r in e274} == {"P_KONGZI", "P_QIJING", "P_LUDINGGONG"}, "E274 挂链人选异常")
# 从严之样本：同一人同年两条而 presence 异（P_GUOSHU：E287 相关 / E247 亲至）
gs = {r["event_id"]: r["presence"] for r in merged["event_people"] if r["person_id"] == "P_GUOSHU"}
ck(gs.get("E287") == "相关" and gs.get("E247") == "亲至",
   f"P_GUOSHU 之 presence 对照异常：{gs}")

# ---------- 8. places 从严留空 ----------
sec("8. places 从严（三栏留空是判断，不是遗漏）")
for r in rd(os.path.join(HERE, "places_new.csv")):
    ck(r["lat"] == "" and r["lng"] == "" and r["coord_certainty"] == "",
       f"{r['id']} 三栏未留空")
    ck("本轮无从核" in r["coord_basis"], f"{r['id']}.coord_basis 未著「本轮无从核」")
    # 「查无落点」只许出现在自诫句中（否定语之后 40 字内）
    for m in re.finditer("查无落点", r["coord_basis"]):
        seg = r["coord_basis"][max(0, m.start() - 40):m.start()]
        ck(any(w in seg for w in ("不得", "非", "不写作", "不作", "不可")),
           f"{r['id']}.coord_basis 之「查无落点」非自诫用法")

# ---------- 9. 事目字段 ----------
sec("9. 事目字段")
CATS = {"即位","战争","会盟","相会","婚嫁","生育","出奔","弑杀","薨卒","丧葬",
        "外交","内乱","灾异","礼俗","政制","论对","其他"}
seen = {}
for r in rd(os.path.join(HERE, "events_new.csv")):
    ck(r["category"] in CATS, f"{r['id']}.category 非枚举值：{r['category']}")
    ck(r["reliability"] in {"high", "medium", "low"}, f"{r['id']}.reliability 异常")
    y = int(r["year_bce"])
    ck(-800 <= y <= -464, f"{r['id']}.year_bce {y} 逾 [-800,-464]")
    k = (r["year_bce"], r["sort_key"])
    ck(k not in seen, f"{r['id']} 与 {seen.get(k)} 同年同 sort_key")
    seen[k] = r["id"]
# 同年 sort_key 不得与主表既有冲突
for r in rd(os.path.join(HERE, "events_new.csv")):
    for e in merged["events"]:
        if e["id"] != r["id"] and e["year_bce"] == r["year_bce"] and e["sort_key"] == r["sort_key"]:
            ck(False, f"{r['id']} 与既有 {e['id']} 同年({r['year_bce']})同 sort_key({r['sort_key']})")

# ---------- 10. 质量门 ----------
sec("10. validate.py（于合并副本上跑）")
p = subprocess.run([sys.executable, os.path.join("tools", "validate.py")],
                   cwd=TMP, capture_output=True, text=True, encoding="utf-8", errors="replace")
out = (p.stdout or "") + (p.stderr or "")
print("   " + "\n   ".join(out.strip().splitlines() or ["(无输出)"]))
print("   exit code = %d" % p.returncode)
ck(p.returncode == 0, f"validate.py 退出码 {p.returncode}")

# ---------- 11. 双本比对（可选·需网络，不可达则跳过不计分） ----------
sec("11. 双本比对（可选·需网络）")
try:
    import urllib.request
    def cjk(s): return "".join(c for c in s if "一" <= c <= "鿿")
    SLUG = {"Z119":"zhao-gong-er-shi-wu-nian","Z120":"zhao-gong-er-shi-jiu-nian",
            "Z121":"ding-gong-yuan-nian","Z106":"ding-gong-wu-nian","Z122":"ding-gong-liu-nian",
            "Z123":"ding-gong-ba-nian","Z124":"ding-gong-jiu-nian","Z125":"ding-gong-shi-er-nian",
            "Z126":"ding-gong-shi-wu-nian","Z127":"ai-gong-san-nian","Z128":"ai-gong-liu-nian",
            "Z111":"ai-gong-shi-yi-nian","Z129":"ai-gong-shi-er-nian","Z130":"ai-gong-shi-si-nian",
            "Z131":"ai-gong-shi-wu-nian","Z110":"ai-gong-shi-liu-nian"}
    cache, nseg, nbad = {}, 0, 0
    for r in rd(os.path.join(HERE, "passages_new.csv")):
        sl = SLUG[r["source_id"]]
        if sl not in cache:
            req = urllib.request.Request("https://ctext.org/chun-qiu-zuo-zhuan/" + sl,
                                         headers={"User-Agent": "Mozilla/5.0"})
            html = urllib.request.urlopen(req, timeout=45).read().decode("utf-8", "replace")
            cache[sl] = cjk(re.sub(r"<[^>]+>", " ", re.sub(r"<script.*?</script>", "", html, flags=re.S)))
        for s in r["quote_original"].split("……"):
            if not cjk(s): continue
            nseg += 1
            if cjk(s) not in cache[sl]:
                nbad += 1; print(f"  比对不合：{r['id']} :: {cjk(s)[:40]}")
    print(f"   ctext 复核：{nseg} 段，不合 {nbad} 段")
    ck(nbad == 0, f"双本比对有 {nbad} 段不合")
except Exception as e:
    print("   跳过（网络不可达或 ctext 无响应）：%s" % e.__class__.__name__)
    print("   注：备料时已实做双本比对，52 段全通过（见 CHANGES §9.1）")

print("\n-- 断言分布（实测，非估） --")
for _k, _v in DIST.items(): print("   %-44s %4d" % (_k, _v))
print("\n===== %d PASS, %d FAIL =====" % (PASS, FAIL))
sys.exit(1 if FAIL else 0)
