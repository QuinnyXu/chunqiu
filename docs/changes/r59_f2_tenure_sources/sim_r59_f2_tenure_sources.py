# -*- coding: utf-8 -*-
"""r59-F2 合并模拟（裁一百六十五：四篇之 sources 行）。Sophia，2026-10-05 EDT。
〔r59-F3 改〕（裁一百七十至一百七十二，2026-10-05 EDT）：基线改取 817b21e（9055f72→817b21e 间 data/csv 无变，
  `git diff --stat 9055f72 817b21e` 只 DATA_LICENSE.md 与 docs/conventions.md）；sources 追加 4→6 行（加 Z152 文公十二年、
  Z153 成公十三年）；office_tenures 替换 4→8 行，所改之栏逐行登记（ALLOWED_COLS）；杜注由「停报之例外」改为「推之环」；
  TEN015 襄三十一 由不挂改挂（对位而不为据）；职名栏入对位表，其缺口清单由 5 处改为空；加文字之锁与反证 R13–R18。
  下「所验」各条之 4 行、4 行、例外 3 条诸数系 r59-F2 之原文，照留；现行之数见上。

改前之基线取自 git 对象（不读工作区之 data/csv/），故合入之前、之后俱可重跑而不因「改前已变」报红
（承 r59-C 所报「sim 以 data/csv 为改前、合入后必红」之教训）。

所验：
  0. 文件卫生（表头同主表、无 novel* 列、无换行／NULL）
  1. 合并模拟：sources 追加 4 行；office_tenures 按 id 整行替换 4 行（只 source_ids 一栏变）
  2. 逐表行数；新 id 接尾号不重号、不用退役号
  3. source_ids 全指向存在之 sources
  4. 对位：各任起止所引之篇，机械抽取与对位表（duiwei.csv）全等；凡「据」俱有 sources 行且挂于其任之 source_ids；
     例外只许对位表所登记者（杜注 1、非据之引 3），逐条列出
  5. 层：新行俱 Z（左传正文）；无一行承杜注；杜注之定层上报（十源无其位）——Z148.notes 书其不承杜注
  6. 核对状态：俱书「电子本」之属与「未能双本互校」，无「纸本已核」「电子本已核」
  7. 副本上跑 tools/validate.py（含 tenure_gate）与 tools/csv_to_json.py；台账（kaodui）数与改前副本比
  8. 反证：注入同型之误，须红；不红即 exit 2（裁一百一十四）
〔r59-F5 入库注，Skipper，2026-10-05〕本脚本之入库副本（docs/changes/r59_f2_tenure_sources/，裁一百七十六）：基线 817b21e（取自 git 对象）；
  数据件读本子目录（HERE＝本脚本所在目录，其深度与 data/incoming/r59_f2_tenure_sources/ 同为 3，ROOT＝HERE/../../.. 即仓库根，二行原字自正），
  故归档而不死；合入后之库上整跑，因 Z148–Z153 已入而「sources 追加」类断言或撞 ID 而红，非脚本之误。
  合入时 TEN013.end_basis 照裁一百七十四 改书、复照裁一百七十五 加「推（年有据，人之卒年未定）：」前缀，与本件 fixes 原文不同，本脚本未随改。
  除本注外不改一字。
退出码：0 全过；1 有 FAIL；2 反证未红。临时目录可用环境变量 CHUNQIU_SIM_TMP 覆写。
"""
import csv, io, os, re, shutil, subprocess, sys, tempfile

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
csv.field_size_limit(10 ** 7)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
BASE_SHA = "817b21e"  # 〔r59-F3 改〕原 9055f72
TMP = os.path.join(os.environ.get("CHUNQIU_SIM_TMP") or tempfile.gettempdir(), "mergesim_r59f2")
TABLES = ["events", "passages", "sources", "people", "event_people", "relations",
          "places", "archaeology", "background", "office_tenures"]
BEFORE = {"events": 281, "passages": 531, "sources": 211, "people": 186, "event_people": 735,
          "relations": 309, "places": 104, "archaeology": 8, "background": 11, "office_tenures": 16}
ADD = {"sources": 6}  # 〔r59-F3 改〕原 4
RETIRED = {"E005", "E006", "Z098"}
NEW_IDS = ["Z148", "Z149", "Z150", "Z151", "Z152", "Z153"]  # 〔r59-F3 改〕加 Z152、Z153
NEW_PIAN = {"Z148": "文公五年", "Z149": "宣公元年", "Z150": "宣公六年", "Z151": "成公三年",
            "Z152": "文公十二年", "Z153": "成公十三年"}
# 〔r59-F3〕替换行所许改之栏（余栏须与基线一字不差）
ALLOWED_COLS = {
    "TEN002": {"end_basis", "source_ids"}, "TEN004": {"source_ids"}, "TEN005": {"source_ids"},
    "TEN006": {"start_basis"}, "TEN008": {"source_ids"}, "TEN009": {"source_ids"},
    "TEN013": {"source_ids"}, "TEN015": {"start_basis", "source_ids"},
}
# 对位表所登记之例外（不挂之引）：(ten_id, pian) → 其由
EXEMPT_EXPECT = {
    ("TEN002", "文公五年·杜注"): "推之环（杜注之说，照录于 end_basis，不立行；裁一百七十）",  # 〔r59-F3 改〕原「杜注」（停报）
    ("TEN006", "（不名篇）"): "隐引（basis 明书「隐引、不名篇，故不挂」）",
    ("TEN015", "（不名篇）"): "隐引（basis 明书「隐引、不名篇，故不挂」）",
}
# 〔r59-F3 改〕原登记 ("TEN015", "襄公三十一年"): "非据"——今挂 Z084（对位而不为据，裁一百七十一 ④），出例外之集
# 职名之文栏（title_text）所引之篇之缺口（只报不挂；本件不立行，见 CHANGES §四）——钉其清单，变则红
# 〔r59-F3 改〕原钉五处（文公十二年、成公十三年无行；Z089／Z081／Z143 有行未挂）；五处实核俱「有明文而未填」，本轮补，清单归空
TITLE_GAPS_F2 = {
    ("TEN004", "文公十二年", "无行"), ("TEN009", "成公十三年", "无行"),
    ("TEN009", "成公十六年", "Z089"), ("TEN013", "襄公二十四年", "Z081"), ("TEN013", "襄公十三年", "Z143"),
}
TITLE_GAPS_EXPECT = set()
# 〔r59-F3〕文字之锁：(id, 栏, 须含之字)；推之标识不得因加环文而掉
TEXT_MUST = [
    ("TEN002", "end_basis", "推："), ("TEN002", "end_basis", "据杜注"), ("TEN002", "end_basis", "环一（明文）"),
    ("TEN002", "end_basis", "环二（推）"), ("TEN002", "end_basis", "推之环不立出处行"),
    ("TEN002", "end_basis", "《春秋左傳正義》卷18"), ("TEN002", "end_basis", "《春秋經傳集解》卷第八"),
    ("TEN002", "end_basis", "电子录文"), ("TEN002", "end_basis", "纸本未核"),
    ("TEN006", "start_basis", "隐引、不名篇，故不挂"),
    ("TEN015", "start_basis", "隐引、不名篇，故不挂"), ("TEN015", "start_basis", "不作系年之据"),
    ("TEN015", "start_basis", "对位而不为据"),
]
TEXT_BAN = [("TEN002", "end_basis", "已核")]

PASS = FAIL = 0


def ck(cond, msg):
    global PASS, FAIL
    if cond:
        PASS += 1
    else:
        FAIL += 1
        print("  FAIL: " + msg)


def parse(text):
    return list(csv.DictReader(io.StringIO(text)))


def rd(p):
    with open(p, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def hdr_text(text):
    return next(csv.reader(io.StringIO(text)))


def git_show(path):
    return subprocess.run(["git", "-C", ROOT, "show", f"{BASE_SHA}:{path}"], capture_output=True,
                          check=True).stdout.decode("utf-8")


def write(p, h, rows):
    with open(p, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=h, lineterminator="\n")
        w.writeheader()
        w.writerows(rows)


DUKE = "隐桓庄闵僖文宣成襄昭定哀"
NUM = "元一二三四五六七八九十"
PIAN_RE = re.compile(r"([%s])公([%s]+)年" % (DUKE, NUM))


def pians_in(text):
    return {m.group(1) + "公" + m.group(2) + "年" for m in PIAN_RE.finditer(text)}


def title_pians(text):
    """title_text 之篇：除「X公N年」外，承前「X公」之「、N年」「；N年」省称亦计。"""
    out, duke = set(), None
    for m in re.finditer(r"([%s])公([%s]+)年|[、；]([%s]+)年" % (DUKE, NUM, NUM), text):
        if m.group(1):
            duke = m.group(1)
            out.add(duke + "公" + m.group(2) + "年")
        elif duke:
            out.add(duke + "公" + m.group(3) + "年")
    return out


# ---------------- 检之函数（正测与反证共用） ----------------
def check_ids(sources_rows, base_sources):
    bad = []
    base_ids = {r["id"] for r in base_sources}
    zs = sorted(int(i[1:]) for i in base_ids if i.startswith("Z"))
    new = [r["id"] for r in sources_rows if r["id"] not in base_ids]
    for i in new:
        if i in RETIRED:
            bad.append(f"{i} 为退役号")
        if not re.match(r"^[ZSGAPBYLTJ]\d{3}$", i):
            bad.append(f"{i} 不合 sources 前缀")
    ids = [r["id"] for r in sources_rows]
    if len(ids) != len(set(ids)):
        bad.append("sources 有重号")
    want = ["Z%03d" % n for n in range(zs[-1] + 1, zs[-1] + 1 + len(new))]
    if sorted(new) != want:
        bad.append(f"新号 {sorted(new)} 不接 Z 尾号（应 {want}）")
    return bad


def check_refs(ten_rows, sources_rows):
    ids = {r["id"] for r in sources_rows}
    bad = []
    for r in ten_rows:
        sids = [s for s in r["source_ids"].split(";") if s]
        if not sids:
            bad.append(f"{r['id']} source_ids 空")
        for s in sids:
            if s not in ids:
                bad.append(f"{r['id']} 引 {s} 不存在")
    return bad


def check_duiwei(ten_rows, sources_rows, duiwei):
    """对位：机械抽取之篇与对位表全等；凡据俱有行且挂；例外只许登记者。"""
    bad = []
    sec2id = {}
    for r in sources_rows:
        if r["work"] == "春秋左传":
            sec2id.setdefault(r["section"], r["id"])
    T = {r["id"]: r for r in ten_rows}
    # (i) 机械抽取 vs 对位表（以「篇」计，不名篇与杜注另验）
    for tid, r in T.items():
        for jie, col in (("起", "start_basis"), ("止", "end_basis")):
            mech = pians_in(r[col])
            reg = {d["pian"] for d in duiwei if d["ten_id"] == tid and d["jie"] == jie
                   and PIAN_RE.fullmatch(d["pian"])}
            if mech != reg:
                bad.append(f"{tid}{jie} 机械抽取 {sorted(mech)} ≠ 对位表 {sorted(reg)}")
            if "杜注" in r[col] and jie == "止":
                if not any(d["ten_id"] == tid and d["jie"] == jie and "杜注" in d["pian"] for d in duiwei):
                    bad.append(f"{tid}{jie} 书杜注而对位表无其行")
        # 〔r59-F3〕职名栏亦入对位表
        mech = title_pians(r["title_text"])
        reg = {d["pian"] for d in duiwei if d["ten_id"] == tid and d["jie"] == "职名"}
        if mech != reg:
            bad.append(f"{tid}职名 机械抽取 {sorted(mech)} ≠ 对位表 {sorted(reg)}")
    # (ii) 逐条对位
    exempt = {}
    for d in duiwei:
        tid, pian, sid = d["ten_id"], d["pian"], d["source_id"]
        sids = [s for s in T[tid]["source_ids"].split(";") if s]
        key = (tid, pian)
        if key in EXEMPT_EXPECT:
            exempt[key] = d
            if d["after_linked"] != "否":
                bad.append(f"{tid} {pian} 登记为例外而对位表书已挂")
            continue
        if PIAN_RE.fullmatch(pian):
            want = sec2id.get(pian)
            if not want:
                bad.append(f"{tid} {d['jie']} 所引 {pian} 无 sources 行")
            elif sid != want:
                bad.append(f"{tid} {pian} 对位表书 {sid} 而 sources 之行为 {want}")
            if sid not in sids:
                bad.append(f"{tid} {d['jie']} 所引 {pian}（{sid}）不在其 source_ids {sids}")
        else:
            bad.append(f"{tid} {pian} 非篇名而未登记为例外")
    if set(exempt) != set(EXEMPT_EXPECT):
        bad.append(f"例外之集 {sorted(exempt)} ≠ 登记 {sorted(EXEMPT_EXPECT)}")
    return bad


def check_layer(sources_rows, base_ids):
    bad = []
    for r in sources_rows:
        if r["id"] in base_ids:
            continue
        if not r["id"].startswith("Z") or r["work"] != "春秋左传" or r["category"] != "传世文献":
            bad.append(f"{r['id']} 非左传正文之层（{r['work']}）")
        if any(w in r["title"] + r["work"] + r["section"] for w in ("杜", "集解", "正義", "正义", "注疏")):
            bad.append(f"{r['id']} 以注家之书立行（杜注之层未定，不得立）")
        if NEW_PIAN.get(r["id"]) != r["section"]:
            bad.append(f"{r['id']} section「{r['section']}」与预期篇不符")
    z148 = next((r for r in sources_rows if r["id"] == "Z148"), None)
    if not z148 or "本行不承之" not in z148["notes"] or "杜預注" not in z148["notes"] and "杜预注" not in z148["notes"]:
        bad.append("Z148.notes 未书其不承杜注")
    # 〔r59-F3〕杜注之文须明书其为杜注之文（裁一百七十一 ⑥）
    elif "出杜预注，非传文，不入本行所承之据" not in z148["notes"] or "「霍伯，先且居，中軍帥也」" not in z148["notes"]:
        bad.append("Z148.notes 录杜注而未明书其出杜预注、非传文、不入本行所承之据")
    return bad


def check_status(sources_rows, base_ids):
    bad = []
    for r in sources_rows:
        if r["id"] in base_ids:
            continue
        n = r["notes"]
        for must in ("【底本与核对状态】", "核对状态属电子本", "未能双本互校", "纸本未核", "2026-10-05 实取"):
            if must not in n:
                bad.append(f"{r['id']} notes 缺「{must}」")
        for ban in ("纸本已核", "电子本已核"):
            if ban in n:
                bad.append(f"{r['id']} notes 书「{ban}」")
    return bad


def check_fix_only_sourceids(fix_rows, base_ten):
    """〔r59-F3 改〕原只许改 source_ids；今逐行只许 ALLOWED_COLS 所登记之栏，且所登记之栏须真有改。"""
    bad = []
    B = {r["id"]: r for r in base_ten}
    if {r["id"] for r in fix_rows} != set(ALLOWED_COLS):
        bad.append(f"替换行之集 {sorted(r['id'] for r in fix_rows)} ≠ 登记 {sorted(ALLOWED_COLS)}")
    for r in fix_rows:
        b = B.get(r["id"])
        if not b:
            bad.append(f"{r['id']} 不在主表")
            continue
        allow = ALLOWED_COLS.get(r["id"], set())
        for k in r:
            if k not in allow and r[k] != b[k]:
                bad.append(f"{r['id']} 栏 {k} 被改（只许改 {sorted(allow)}）")
            if k in allow and r[k] == b[k]:
                bad.append(f"{r['id']} 栏 {k} 登记为改而未改")
        old = [s for s in b["source_ids"].split(";") if s]
        new = [s for s in r["source_ids"].split(";") if s]
        if not set(old) <= set(new):
            bad.append(f"{r['id']} source_ids 删去既有 {sorted(set(old) - set(new))}")
    return bad


def check_texts(ten_rows):
    """〔r59-F3〕文字之锁：推之标识、环之分、隐引之书、对位而不为据之书，俱不得掉。"""
    T = {r["id"]: r for r in ten_rows}
    bad = [f"{i}.{c} 缺「{w}」" for i, c, w in TEXT_MUST if w not in T[i][c]]
    bad += [f"{i}.{c} 书「{w}」" for i, c, w in TEXT_BAN if w in T[i][c]]
    if not T["TEN002"]["end_basis"].startswith("推："):
        bad.append("TEN002.end_basis 不以「推：」起")
    if T["TEN002"]["end_basis_type"] != "推":
        bad.append("TEN002.end_basis_type 非「推」")
    if "Z084" not in T["TEN015"]["source_ids"].split(";"):
        bad.append("TEN015 未挂 Z084（襄三十一，对位）")
    return bad


def check_title_gaps(ten_rows, sources_rows):
    sec2id = {r["section"]: r["id"] for r in sources_rows if r["work"] == "春秋左传"}
    gaps = set()
    for r in ten_rows:
        sids = r["source_ids"].split(";")
        for p in title_pians(r["title_text"]):
            sid = sec2id.get(p)
            if sid is None:
                gaps.add((r["id"], p, "无行"))
            elif sid not in sids:
                gaps.add((r["id"], p, sid))
    return gaps


# ================= 0. 文件卫生 =================
print("== 0. 文件卫生 ==")
base = {t: git_show(f"data/csv/{t}.csv") for t in TABLES}
NEWF = {"sources": "sources_new.csv"}
FIXF = {"office_tenures": "fixes_office_tenures.csv"}
for t, fn in list(NEWF.items()) + list(FIXF.items()):
    with open(os.path.join(HERE, fn), encoding="utf-8", newline="") as f:
        txt = f.read()
    ck(hdr_text(txt) == hdr_text(base[t]), f"{fn} 表头与主表不同")
    ck(not any(c.lower().startswith("novel") for c in hdr_text(txt)), f"{fn} 含 novel* 列")
    for r in parse(txt):
        for k, v in r.items():
            ck(v is not None and "\n" not in v and "\t" not in v, f"{fn} {r['id']} {k} 含换行／制表符")
            ck(v is not None and v.upper() not in {"NULL", "N/A"}, f"{fn} {r['id']} {k} 书 NULL/N/A")

# ================= 1. 合并模拟 =================
print("== 1. 合并模拟（基线 git %s） ==" % BASE_SHA)
if os.path.isdir(TMP):
    shutil.rmtree(TMP)
for sub in ("merged", "base"):
    os.makedirs(os.path.join(TMP, sub, "data", "csv"))
    os.makedirs(os.path.join(TMP, sub, "site", "data"))
    os.makedirs(os.path.join(TMP, sub, "docs"))
    shutil.copytree(os.path.join(ROOT, "tools"), os.path.join(TMP, sub, "tools"),
                    ignore=shutil.ignore_patterns("node_modules", "__pycache__"))
    for t in TABLES:
        with open(os.path.join(TMP, sub, "data", "csv", t + ".csv"), "w", encoding="utf-8", newline="") as f:
            f.write(base[t])
M = os.path.join(TMP, "merged", "data", "csv")
base_rows = {t: parse(base[t]) for t in TABLES}
new_src = rd(os.path.join(HERE, "sources_new.csv"))
fix_ten = rd(os.path.join(HERE, "fixes_office_tenures.csv"))
merged_src = base_rows["sources"] + new_src
write(os.path.join(M, "sources.csv"), hdr_text(base["sources"]), merged_src)
repl = {r["id"]: r for r in fix_ten}
merged_ten, hit = [], 0
for r in base_rows["office_tenures"]:
    if r["id"] in repl:
        merged_ten.append(repl[r["id"]]); hit += 1
    else:
        merged_ten.append(r)
ck(hit == len(repl) == 8, f"office_tenures 替换命中 {hit}／{len(repl)}")  # 〔r59-F3 改〕原 4（本轮 8：TEN002／004／005／006／008／009／013／015）
write(os.path.join(M, "office_tenures.csv"), hdr_text(base["office_tenures"]), merged_ten)
print("   副本：" + TMP)

# ================= 2. 行数与 id =================
print("== 2. 逐表行数；新 id ==")
for t in TABLES:
    n0 = len(base_rows[t]); n1 = len(rd(os.path.join(M, t + ".csv")))
    ck(n0 == BEFORE[t], f"{t} 基线 {n0} ≠ {BEFORE[t]}")
    ck(n1 == BEFORE[t] + ADD.get(t, 0), f"{t} 合并后 {n1} ≠ {BEFORE[t] + ADD.get(t, 0)}")
    print("   %-15s %4d → %4d" % (t, n0, n1))
for v in check_ids(merged_src, base_rows["sources"]):
    ck(False, v)
ck([r["id"] for r in new_src] == NEW_IDS, f"新 id {[r['id'] for r in new_src]} ≠ {NEW_IDS}")
for v in check_fix_only_sourceids(fix_ten, base_rows["office_tenures"]):
    ck(False, v)

# ================= 3. 引用 =================
print("== 3. source_ids 全指向存在之 sources ==")
for v in check_refs(merged_ten, merged_src):
    ck(False, v)

# ================= 4. 对位 =================
print("== 4. 各任起止所引之篇 ↔ sources 对位 ==")
duiwei = rd(os.path.join(HERE, "duiwei.csv"))
for v in check_duiwei(merged_ten, merged_src, duiwei):
    ck(False, v)
before_unlinked = [(d["ten_id"], d["jie"], d["pian"]) for d in duiwei if d["before_linked"] == "否"]
print("   改前未对位之界引 %d 条：%s" % (len(before_unlinked), before_unlinked))
print("   改后仍不挂者（登记之例外）：")
for k, why in EXEMPT_EXPECT.items():
    print("     %s %s —— %s" % (k[0], k[1], why))
# 改前之实况：四篇之数（无 sources 行者）
sec_base = {r["section"] for r in base_rows["sources"] if r["work"] == "春秋左传"}
no_row_jie = sorted({p for r in base_rows["office_tenures"] for c in ("start_basis", "end_basis")
                     for p in pians_in(r[c]) if p not in sec_base})
print("   改前：起止所引而 sources 无其行之篇（机械）：%s" % no_row_jie)
ck(no_row_jie == sorted(["文公五年", "宣公六年", "成公三年"]), f"改前起止之缺 {no_row_jie} 与本件所报三篇不符")
ck(check_title_gaps(base_rows["office_tenures"], base_rows["sources"]) == TITLE_GAPS_F2 | {("TEN004", "宣公元年", "无行")},
   "改前职名栏之缺口与 r59-F2 所报（五处＋宣元）不符")
no_row_title = sorted({p for r in base_rows["office_tenures"] for p in title_pians(r["title_text"]) if p not in sec_base})
print("   改前：title_text 所引而 sources 无其行之篇（机械）：%s" % no_row_title)
ck(no_row_title == sorted(["文公十二年", "宣公元年", "成公十三年"]), f"改前职名栏之缺 {no_row_title} 与本件所报不符")
gaps = check_title_gaps(merged_ten, merged_src)
print("   改后 title_text 之缺口（只报不挂）：%s" % sorted(gaps))
ck(gaps == TITLE_GAPS_EXPECT, f"title_text 缺口 {sorted(gaps)} ≠ 登记 {sorted(TITLE_GAPS_EXPECT)}")

print("== 4b. 文字之锁（〔r59-F3〕） ==")
for v in check_texts(merged_ten):
    ck(False, v)

# ================= 5. 层 =================
print("== 5. 层（新行俱 Z；不立杜注之行） ==")
base_ids = {r["id"] for r in base_rows["sources"]}
for v in check_layer(merged_src, base_ids):
    ck(False, v)

# ================= 6. 核对状态 =================
print("== 6. 核对状态（电子本之属） ==")
for v in check_status(merged_src, base_ids):
    ck(False, v)

# ================= 7. 副本上跑 validate／csv_to_json =================
print("== 7. 副本上跑 tools/validate.py 与 tools/csv_to_json.py ==")
res = {}
for sub in ("base", "merged"):
    p = subprocess.run([sys.executable, os.path.join(TMP, sub, "tools", "validate.py")],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    ok = p.returncode == 0 and "OK" in p.stdout
    ck(ok, f"{sub} validate 不过：rc={p.returncode} {p.stdout[-400:]} {p.stderr[-400:]}")
    print("   %s validate：rc=%d %s" % (sub, p.returncode, p.stdout.strip().splitlines()[-1] if p.stdout.strip() else ""))
    q = subprocess.run([sys.executable, os.path.join(TMP, sub, "tools", "csv_to_json.py")],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    ck(q.returncode == 0, f"{sub} csv_to_json 不过：{q.stderr[-400:]}")
    m = re.search(r"kaodui.*?（(\d+) 条）", q.stdout)
    res[sub] = int(m.group(1)) if m else None
    md = os.path.join(TMP, sub, "docs", "kaodui_index.md")
    dist = {}
    if os.path.exists(md):
        for mm in re.finditer(r"^### (.+?)（(\d+) 条）$", open(md, encoding="utf-8").read(), re.M):
            if not mm.group(1).startswith("`"):
                dist[mm.group(1)] = int(mm.group(2))
    res[sub + "_dist"] = dist
print("   kaodui：改前 %s → 改后 %s" % (res["base"], res["merged"]))
d0, d1 = res["base_dist"], res["merged_dist"]
for k in sorted(set(d0) | set(d1), key=lambda x: (list(d1).index(x) if x in d1 else 999)):
    if d0.get(k) != d1.get(k):
        print("     档「%s」%s → %s" % (k, d0.get(k), d1.get(k)))
ck(res["base"] is not None and res["merged"] is not None, "kaodui 数抽不出")

# ================= 8. 反证 =================
print("== 8. 反证（须红） ==")
cp = lambda rows: [dict(r) for r in rows]
counter = []
# R1 TEN002 去 Z148（文公五年传文不挂）——即改前之形
t = cp(merged_ten); next(r for r in t if r["id"] == "TEN002")["source_ids"] = "Z056;Z134;Z059"
counter.append(("R1 TEN002 不挂文公五年（改前之形）", check_duiwei(t, merged_src, duiwei)))
# R2 TEN004 去 Z150（宣公六年经文不挂）
t = cp(merged_ten); next(r for r in t if r["id"] == "TEN004")["source_ids"] = "Z059;Z135;Z152;Z149;Z136"
counter.append(("R2 TEN004 不挂宣公六年", check_duiwei(t, merged_src, duiwei)))
# R3 TEN005 去 Z063（四篇之外之一挂撤回）——对位须红，示其撤回须同改对位表
t = cp(merged_ten); next(r for r in t if r["id"] == "TEN005")["source_ids"] = "Z136;Z064"
counter.append(("R3 TEN005 撤 Z063 而对位表不改", check_duiwei(t, merged_src, duiwei)))
# R4 杜注硬塞入 Z：立 Z154「春秋經傳集解·文公五年」并挂 TEN002（〔r59-F3 改〕号由 Z152 改 Z154，Z152 今为文公十二年）
s = cp(merged_src) + [dict(merged_src[-1], id="Z154", title="《春秋經傳集解·文公五年》杜预注", work="春秋經傳集解",
                           section="文公五年·杜注")]
counter.append(("R4 杜注硬塞入 Z（Z154）", check_layer(s, base_ids)))
# R5 用退役号 Z098 立文公五年
I148 = next(i for i, r in enumerate(merged_src) if r["id"] == "Z148")  # 〔r59-F3 改〕原以 s[-4] 取 Z148
s = cp(merged_src); s[I148] = dict(s[I148], id="Z098")
counter.append(("R5 新行用退役号 Z098", check_ids(s, base_rows["sources"])))
# R6 source_ids 指向不存在之 Z154（〔r59-F3 改〕原 Z152）
t = cp(merged_ten); next(r for r in t if r["id"] == "TEN008")["source_ids"] += ";Z154"
counter.append(("R6 source_ids 指向不存在之行", check_refs(t, merged_src)))
# R7 核对状态书「纸本已核」
s = cp(merged_src); s[-1] = dict(s[-1], notes=s[-1]["notes"] + "（纸本已核）")  # 只加不删，使其红只因「纸本已核」
counter.append(("R7 核对状态书纸本已核", check_status(s, base_ids)))
# R8 Z148 notes 去「本行不承之」（杜注混入正文行之形）
s = cp(merged_src); s[I148] = dict(s[I148], notes=s[I148]["notes"].replace("本行不承之", ""))
counter.append(("R8 Z148 不书其不承杜注", check_layer(s, base_ids)))
# R9 fixes 顺手改他栏（certainty；〔r59-F3 改〕取 TEN006，其登记之栏只 start_basis）
f = cp(fix_ten); i6 = next(i for i, r in enumerate(f) if r["id"] == "TEN006"); f[i6] = dict(f[i6], certainty="high")
counter.append(("R9 替换行改 source_ids 以外之栏", check_fix_only_sourceids(f, base_rows["office_tenures"])))
# R10 对位表漏登一条界引（删 TEN013 止 襄公二十五年）——机械抽取须撞出
dw = [d for d in duiwei if not (d["ten_id"] == "TEN013" and d["pian"] == "襄公二十五年")]
counter.append(("R10 对位表漏登一界引", check_duiwei(merged_ten, merged_src, dw)))
# R11 TEN013 撤 Z081 —— 职名栏缺口复现，须红（〔r59-F3 改〕原为「再挂 Z081」，今清单归空，反其向）
t = cp(merged_ten); r13 = next(r for r in t if r["id"] == "TEN013")
r13["source_ids"] = ";".join(x for x in r13["source_ids"].split(";") if x != "Z081")
counter.append(("R11 title_text 缺口清单变动", ["变"] if check_title_gaps(t, merged_src) != TITLE_GAPS_EXPECT else []))
# 〔r59-F3〕R13 TEN002 end_basis 加环文而掉「据杜注」——推之标识掉落，须红
t = cp(merged_ten); r2 = next(r for r in t if r["id"] == "TEN002"); r2["end_basis"] = r2["end_basis"].replace("（据杜注）", "")
counter.append(("R13 TEN002 掉「据杜注」", check_texts(t)))
# R14 TEN002 end_basis 去「推：」而书「已核」——明文冒推之位，须红
t = cp(merged_ten); r2 = next(r for r in t if r["id"] == "TEN002"); r2["end_basis"] = r2["end_basis"].replace("推：", "").replace("纸本未核", "已核")
counter.append(("R14 TEN002 去「推：」书「已核」", check_texts(t)))
# R15 TEN015 挂 Z084 而删「不作系年之据」——对位冒作据，须红
t = cp(merged_ten); r15 = next(r for r in t if r["id"] == "TEN015"); r15["start_basis"] = r15["start_basis"].replace("，不作系年之据", "")
counter.append(("R15 TEN015 挂 Z084 而删「不作系年之据」", check_texts(t)))
# R16 TEN006 只不挂而不书其由（隐引之书删去）——须红
t = cp(merged_ten); r6 = next(r for r in t if r["id"] == "TEN006"); r6["start_basis"] = r6["start_basis"].replace("，隐引、不名篇，故不挂", "")
counter.append(("R16 TEN006 隐引不书其由", check_texts(t)))
# R17 Z148.notes 录杜注而不书其出杜预注（读者以为本文）——须红
s = cp(merged_src); s[I148] = dict(s[I148], notes=s[I148]["notes"].replace("出杜预注，非传文，不入本行所承之据", "见于此"))
counter.append(("R17 Z148 录杜注而不明书其为注", check_layer(s, base_ids)))
# R18 TEN009 不挂 Z153（成公十三年职名之文复空）——须红（对位表之职名行撞出）
t = cp(merged_ten); next(r for r in t if r["id"] == "TEN009")["source_ids"] = "Z139;Z089;Z140"
counter.append(("R18 TEN009 不挂成公十三年（职名）", check_duiwei(t, merged_src, duiwei)))
# R12 tenure_gate 经 validate 同跑：副本中 office_tenures 之 TEN002 source_ids 置空，validate 须拒
bad_dir = os.path.join(TMP, "merged_bad")
shutil.copytree(os.path.join(TMP, "merged"), bad_dir)
t = cp(merged_ten); next(r for r in t if r["id"] == "TEN002")["source_ids"] = ""
write(os.path.join(bad_dir, "data", "csv", "office_tenures.csv"), hdr_text(base["office_tenures"]), t)
p = subprocess.run([sys.executable, os.path.join(bad_dir, "tools", "validate.py")], capture_output=True, text=True,
                   encoding="utf-8", errors="replace")
hit12 = [l for l in (p.stdout + p.stderr).splitlines() if "source_ids 不得为空" in l]
counter.append(("R12 validate 拒 source_ids 空（副本）", hit12 if p.returncode != 0 else []))

not_red = 0
for name, v in counter:
    red = bool(v)
    print("   %s：%s" % (name, "红" if red else "★未红"))
    if red:
        print("       └ " + str(v[0])[:160])
    else:
        not_red += 1

print("\n合计：%d PASS，%d FAIL；反证 %d 条，未红 %d" % (PASS, FAIL, len(counter), not_red))
if not_red:
    sys.exit(2)
sys.exit(1 if FAIL else 0)
