# -*- coding: utf-8 -*-
"""r53-4 备料件之合并模拟与自查（孔子 19 行 `role_in_event` 首句改写）。

用法（仓库根目录）：
    python data/incoming/r53_kongzi_role/sim_r53_kongzi_role.py

本脚本**只读** `data/csv/`（`event_people.csv` ＋ `passages.csv`）与 `site/app.js`，一字不写回；合并模拟在系统临时目录内做。
每项断言随书其**求法**、**所期之果**、**读法**（r53 体例第 6 条）。

★ **切点之测，两层并跑**：`roleParts()` 系显示层之函数，r53-3（Vision）正在改它。
  故本脚本把**两层俱移植**（r52 已合入之本、r53 在制之本），逐层各测一遍，**须两层俱过**。
  并于跑时自 `site/app.js` 实读该函数之 sha256，与下列所钉之二值比：
  **对不上即断言〇乙当场红**——那时本脚本之切点数一概不足信，须先把量具与前端对齐。
  「先验量具，后量物」（`team/round52_prompts.md` §一之十六之训）。

★ **r53-8 增断言十二（甲乙丙丁）：摘引之量器**（依 `team/round53_prompts.md` §六 **裁六十一**）。
  裁六十一既裁「摘引之标点从其语境、不必与底账逐字同」，**量具随之改为「去标点后比」**；
  其闸在**十二丙**：二式并跑，只许异转合，**一处合转异即停下上报**。
  ★ 「剔星号」一步**另立、不入标点集**——其可否入引尚无文（见该段之加注）。
  ★ **十二丁系其按类反证**：去标点之宽若宽到连一字之增损也合，则十二乙之绿一概不算。
"""
import csv
import hashlib
import io
import os
import re
import shutil
import subprocess
import sys
import tempfile

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
LIVE = os.path.join(ROOT, "data", "csv", "event_people.csv")
PASSAGES = os.path.join(ROOT, "data", "csv", "passages.csv")
APPJS = os.path.join(ROOT, "site", "app.js")
FIXES = os.path.join(HERE, "fixes_event_people.csv")
FIELDS = ["event_id", "person_id", "role_in_event", "directness", "presence"]

# ------------------------------------------------------------ 显示层之移植（两层）
# 甲·`r52`：`site/app.js` `roleParts()` 之已合入本（截点只避成对星号）。
# 乙·`r53`：Vision r53-3 在制之本（截点兼避 code span，反引号优先；退位成环，上限 64 圈）。
# 二层之别只在「截点退位」一段；`ROLE_CHIP_MAX`／句读集合二者相同。
# 所钉之 sha256 系 `const ROLE_CHIP_MAX` 起至 `roleParts()` 之闭括号止一段之哈希。
LAYER_SHA = {
    "r52": "ba2cf3edcaaeed24aeab686e495630afc83b5a56a15b589990316ab35194f6bc",
    "r53": "80bc48246e6c9c5b0c85df6228c1ec110e7da3bfbe250e8c10b16c8a41def925",
}
LAYERS = ("r52", "r53")
ROLE_CHIP_MAX = 60
_SENT = re.compile(r"[。；！？]")
_STAR = re.compile(r"\*+")
_ACCT = re.compile(r"^(记事账|评语账|语-|记-|评-)")

# ------------------------------------------------------ 摘引之量器（r53-8，裁六十一）
# 裁六十一（`team/round53_prompts.md` §六，2026-09-26 Co站长）：
#   「凡注文栏内摘引 `quote_original` 之文，其字不得增损一字；**其标点从摘引之语境，
#     不必与底账逐字同——因标点系本库所加**。」
#   并命「配一具量器：『引文与底账相合』之校验，**一律去标点后比**」。
# ★ 故本量器**二式并跑**：旧式（不去标点，即 r53-4 初测之判据）与新式（去标点，裁六十一之
#   判据）。二式之差即本次量具之改所动者；**由合转异者须为 0**——若非 0，即去标点之法伤了
#   别处，不是量具之改而是量具之坏（r53-8 件第 2 条之闸）。
#
# ★★ **一层须明书，不得默然带过**（r53-8 领队加注第 5 条）：
#   `E297`／`Q500` 之异**实为三层**——㈠ 冒号降逗号；㈡ 剔内层直角引号；㈢ **星号入引**
#   （库行作 `**仲尼聞之…**`，`Q500` 原文无 `**`）。**裁六十一所裁者只 ㈠㈡ 之标点一层**；
#   ㈢ 之星号**非标点**，其可否入引尚未有文（领队已呈站长，`团队 round53` 领队之三·二.2，
#   领队倾向「不可」）。
#   故本量器**把「剔 markdown 记法」另立一步（`MD_MARKS`），明不入下之标点集（`PUNCT` 内
#   无 `*`、无反引号）**——二者不相混，日后若裁「星号不得入引」，改的是库行，不是本量器。
#   ★ 且其一步**系载力所在**：本脚本跑时列「若不剔星号则不合者」之数（今实测 23 处，含
#   `E290`／`E297` 本次转合之二处）——**那 23 处若裁为不合，须改库行**。
MD_MARKS = "*`"                     # ★ markdown 记法，非标点；另立一步
PUNCT = set("。，、；：？！…—～·‧「」『』（）〔〕【】《》〈〉“”‘’〖〗"
            + ",.;:?!'\"()[]{}<>-–—/／\\|~+=_^&#@$%　 \t\r\n"
            + "0123456789０１２３４５６７８９")
_HAN = re.compile(r"[㐀-䶿一-鿿]")
_QREF = re.compile(r"`(Q\d+)`")
_SEGSPLIT = re.compile(r"…+|／|/")   # 省略号表省文、斜杠表并举，皆非连续之文，故各段分计
QUOTE_MIN_HAN = 4                    # 长不及四字者不足以判其为传文之引（如「聞」「訪」「下」）

# ★ 新式下仍不合之二处，**逐处有名有由**（非白名单，系断言之所期：多一处、少一处俱红）
REGISTERED_MISS = {
    ("E290", "使問之仲尼"):
        "《国语·鲁语下》季桓子穿井获羊一节，全库 passages 无落点——**非引之误，系库内缺其文**；"
        "裁六十二已裁补录为新 `Q`、排 r54（CHANGES.md §六 上报二）",
    ("E302", "生卒于其地"):
        "**非传文之引**，系编者之语（其六字偶俱古今同形，故入本筛）——筛之伪阳，登记不治",
}


def strip_md(s):
    """剔 markdown 记法（星号、反引号）。★ 另立一步：裁六十一未裁其可否，见上之加注。"""
    return "".join(c for c in s if c not in MD_MARKS)


def norm_quote(s, depunct):
    """摘引之归一。depunct=False 即旧式（只剔记法与结构引号）；True 即新式（兼去标点）。"""
    t = strip_md(s)
    if depunct:
        return "".join(c for c in t if c not in PUNCT)
    return "".join(c for c in t if c not in "「」『』")


def quote_cands(rows, charset):
    """自诸行取「传文之引」之候选。

    求法：① 取其内每一对最内层直角引号所括者；② 以省略号／斜杠切段；③ 判其字数与字表时
    先剔记法；④ 须其汉字数 ≥ 4；⑤ **须其字俱见于全库 `quote_original` 之字表**——一字不在，
    即知其为今字之语（术语之引「相关」「亲至」、裁定之引、账号之指），不入本测。
    ★ 此⑤即 r53-4 初测「凡直角引号内者皆传文之引」之伪判（得 76 处伪未命中）之更正。
    ★ 所存者系**原字（记法未剔）**——剔记法一步系另立之步，其载力须另计（见上之加注）。
    """
    out = []
    for r in rows:
        qids = _QREF.findall(r["role_in_event"])
        for span in re.findall(r"「([^「」]*)」", r["role_in_event"]):
            for seg in _SEGSPLIT.split(span):
                hans = _HAN.findall(strip_md(seg))
                if len(hans) < QUOTE_MIN_HAN or any(c not in charset for c in hans):
                    continue
                out.append((r["event_id"], tuple(qids), seg))
    return out


def in_base(seg, qids, qmap, depunct):
    """判摘引是否底账之子串：先以本行所指之 Q 核，不中则全库（记「跨行互指」）。"""
    n = norm_quote(seg, depunct)
    for q in qids:
        if q in qmap and n in norm_quote(qmap[q], depunct):
            return ("本行", q)
    for q in sorted(qmap):
        if n in norm_quote(qmap[q], depunct):
            return ("跨行", q)
    return (None, None)


def appjs_roleparts_sha():
    """自 `site/app.js` 取 `roleParts()` 一段之 sha256；取不到则返 None。"""
    try:
        s = io.open(APPJS, encoding="utf-8").read()
    except OSError:
        return None, None
    i = s.find("const ROLE_CHIP_MAX")
    j = s.find("\n}\n", s.find("function roleParts"))
    if i < 0 or j < 0:
        return None, None
    seg = s[i:j + 3]
    return hashlib.sha256(seg.encode("utf-8")).hexdigest(), len(seg)


def md_code_marks(s):
    marks = [i for i, c in enumerate(s) if c == "`"]
    if len(marks) % 2:
        marks.pop()
    return marks


def md_star_marks(s, code=None):
    """r52：径取长度恰为 2 之星号游程。r53：落于 code span 之内者不入（反引号优先）。"""
    def in_code(i):
        for k in range(0, len(code), 2):
            if code[k] < i < code[k + 1]:
                return True
        return False
    stars = [m.start() for m in _STAR.finditer(s)
             if len(m.group(0)) == 2 and (code is None or not in_code(m.start()))]
    if len(stars) % 2:
        stars.pop()
    return stars


def role_parts(raw, layer):
    s = "" if raw is None else str(raw)
    if len(s) <= ROLE_CHIP_MAX:
        return {"head": s, "full": s, "clipped": False}
    cut = ROLE_CHIP_MAX
    for m in _SENT.finditer(s):
        if m.start() >= ROLE_CHIP_MAX:
            break
        if m.start() > 0:
            cut = m.start()
            break
    if layer == "r52":
        stars = md_star_marks(s)
        for k in range(0, len(stars), 2):
            if stars[k] < cut < stars[k + 1] + 2:
                cut = stars[k]
                break
    else:
        code = md_code_marks(s)
        stars = md_star_marks(s, code)
        for _ in range(64):
            moved = False
            for k in range(0, len(stars), 2):
                if stars[k] < cut < stars[k + 1] + 2:
                    cut, moved = stars[k], True
                    break
            if not moved:
                for k in range(0, len(code), 2):
                    if code[k] < cut <= code[k + 1]:
                        cut, moved = code[k], True
                        break
            if not moved:
                break
    head = re.sub(r"[\s。，、；：—…·]+$", "", s[:cut])
    return {"head": (head or s[:ROLE_CHIP_MAX]) + "…", "full": s, "clipped": True}


def first_sent(v):
    return re.split(r"[。；！？]", v)[0]


def balanced(s):
    return s.count("「") == s.count("」") and s.count("（") == s.count("）")


FAIL = []


def check(no, name, ok, expect, got, how):
    print("[%s] 断言%s · %s" % ("PASS" if ok else "FAIL", no, name))
    print("       求法：%s" % how)
    print("       所期：%s" % expect)
    print("       实测：%s" % got)
    if not ok:
        FAIL.append(no)


def rows_of(path):
    with io.open(path, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def main():
    live = rows_of(LIVE)
    fixes = rows_of(FIXES)

    # 断言〇甲·移植之校验（两层各一遍）
    got = []
    ok = True
    for L in LAYERS:
        c = sum(1 for r in live if role_parts(r["role_in_event"], L)["clipped"])
        got.append("%s 层 694／%d／%d" % (L, c, len(live) - c))
        ok = ok and c == 103 and len(live) - c == 591
    check("〇甲", "roleParts() 之移植与前端同判（两层各测）",
          ok,
          "两层俱得 694 行分者 103、不分 591（conventions v1.45 §7 之实测）",
          "；".join(got),
          "以两层之移植 role_parts() 各施于 data/csv/event_people.csv 全 694 行，数其 clipped")

    # 断言〇乙·量具与前端对齐（★ 对不上，下文切点之数一概不足信）
    sha, seglen = appjs_roleparts_sha()
    matched = [L for L, v in LAYER_SHA.items() if v == sha]
    check("〇乙", "量具与 site/app.js 现行之 roleParts() 对齐",
          bool(matched),
          "现行之 roleParts() 一段，其 sha256 须为所钉二层之一（r52 已合入本／r53 在制本）",
          "site/app.js 实读 sha256 %s…（%s 字节）→ %s"
          % ((sha or "取不到")[:16], seglen,
             ("即 %s 层" % matched[0]) if matched
             else "★ 二层俱不符——切点之数须重对量具，勿据下文"),
          "自 site/app.js 取 `const ROLE_CHIP_MAX` 至 roleParts() 闭括号一段作 sha256，"
          "与本脚本所钉之 LAYER_SHA 比")

    # 断言一·病之求法复现
    hit = [r for r in live
           if r["person_id"] == "P_KONGZI" and _ACCT.match(first_sent(r["role_in_event"]))]
    check("一", "病之求法复现",
          len(hit) == 19,
          "19 行（任务书〇节之所期）",
          "%d 行：%s" % (len(hit), " ".join(r["event_id"] for r in hit)),
          "取 event_people.csv 中 person_id=P_KONGZI 之 role_in_event，以 [。；！？] 切其首句，"
          "首句匹配 ^(记事账|评语账|语-|记-|评-) 者")

    # 断言二·改件之键俱存、无重、与病之集合全等
    keys_fix = [(r["event_id"], r["person_id"]) for r in fixes]
    keys_live = {(r["event_id"], r["person_id"]) for r in live}
    keys_hit = {(r["event_id"], "P_KONGZI") for r in hit}
    check("二", "改件之键：19 枚、无重、俱存于现库、与病之集合全等",
          len(fixes) == 19 and len(set(keys_fix)) == 19
          and set(keys_fix) <= keys_live and set(keys_fix) == keys_hit,
          "19 枚、去重后仍 19、俱为现库之键、与断言一所得之集合全等",
          "改件 %d 行，去重 %d，现库缺 %d，与病集之差 %s"
          % (len(fixes), len(set(keys_fix)),
             len(set(keys_fix) - keys_live), sorted(set(keys_fix) ^ keys_hit)),
          "以 (event_id, person_id) 为键作集合比对")

    old_by_key = {(r["event_id"], r["person_id"]): r for r in live}

    def old_of(r):
        return old_by_key[(r["event_id"], r["person_id"])]["role_in_event"]

    # 断言三·一字不删：旧值系新值之精确后缀
    bad = [r["event_id"] for r in fixes
           if not r["role_in_event"].endswith(old_of(r))
           or len(r["role_in_event"]) <= len(old_of(r))]
    check("三", "一字不删：旧值系新值之精确后缀",
          not bad,
          "19 行俱然（改法系纯前置，旧值整体后移、一字不动）",
          "不合者 %d 行%s" % (len(bad), ("：" + " ".join(bad)) if bad else ""),
          "判 new.endswith(old) 且 len(new) > len(old)")

    # 断言四·所前置者只一短语＋一句读「。」，且洁净、不逾 40 字
    bad = []
    for r in fixes:
        new, old = r["role_in_event"], old_of(r)
        pre = new[:len(new) - len(old)]
        if (not pre.endswith("。") or _SENT.search(pre[:-1]) or len(pre) - 1 > 40
                or any(c in pre for c in "「」`*")):
            bad.append("%s(%d字:%s)" % (r["event_id"], len(pre) - 1, pre))
    check("四", "所前置者只一短语＋一句读「。」，不逾 40 字，且不含引号／反引号／星号",
          not bad,
          "19 行俱然（不逾 conventions v1.45 §7 ②款「约四十字内」之幅；不引原文一字，"
          "故无「引文之内增损」之可能，亦不给 ⚑H 添一处新裸记号）",
          "不合者 %d 行%s" % (len(bad), ("：" + "；".join(bad)) if bad else ""),
          "取 new 去其 old 后之前缀 pre，判其末字为「。」、其内更无 [。；！？]、其长 ≤41、"
          "且不含 「 」 ` * 四者")

    # 断言五·账号不得删，只得移
    bad = []
    for r in fixes:
        new, old = r["role_in_event"], old_of(r)
        acct = first_sent(old)
        i, j = new.find(acct), new.find("。")
        if acct not in new or not (0 <= j < i):
            bad.append(r["event_id"])
    check("五", "账号不得删、只得移：旧首句原字仍在，且已落第一句之后",
          not bad,
          "19 行俱然（`记-7`／`评-16` 之属系真账之指针，不抹其指）",
          "不合者 %d 行%s" % (len(bad), ("：" + " ".join(bad)) if bad else ""),
          "判旧首句为新值之子串，且其起点在新值第一个「。」之后")

    # 断言六·新首句已非内部账号
    bad = [r["event_id"] for r in fixes if _ACCT.match(first_sent(r["role_in_event"]))]
    check("六", "新首句已非内部账号",
          not bad,
          "0 行（同断言一之判据，施于改后之值须一行不中）",
          "仍中者 %d 行%s" % (len(bad), ("：" + " ".join(bad)) if bad else ""),
          "以断言一之同一正则施于改后之首句")

    # 断言七·切点实测（两层各一遍）：胶囊首句＝所加之短语，括引成对
    bad, heads = [], {}
    for L in LAYERS:
        heads[L] = []
        for r in fixes:
            new, old = r["role_in_event"], old_of(r)
            pre = new[:len(new) - len(old)]
            h = role_parts(new, L)["head"]
            heads[L].append((r["event_id"], h))
            if h != pre[:-1] + "…" or not balanced(h):
                bad.append("%s/%s→%s" % (L, r["event_id"], h))
    check("七", "切点落在所加之句读上，胶囊首句即其役之短语，括引成对（两层各测）",
          not bad,
          "两层各 19 行之 head 俱＝所加之短语＋「…」，且括引俱成对（无腰斩）",
          "不合者 %d 例%s" % (len(bad), ("：" + "；".join(bad)) if bad else ""),
          "以两层之 role_parts() 各取改后之 head，与所前置之短语逐字比，并数其「」（）之开合")
    same = heads["r52"] == heads["r53"]
    print("       两层之 head 是否逐字相同：%s" % ("是" if same else "否"))
    print("       逐行之 head（读法：此即读者于胶囊上所见者；两层同）：")
    for eid, h in heads["r52"]:
        print("         %s  %s" % (eid, h))

    # 断言八·按类反证：同一量法施于**改前**之值，须当场测出 E276／E286 之腰斩
    got, ok = [], True
    for L in LAYERS:
        orph = sorted(r["event_id"] for r in hit
                      if not balanced(role_parts(r["role_in_event"], L)["head"]))
        got.append("%s 层 %s" % (L, orph))
        ok = ok and orph == ["E276", "E286"]
    check("八", "按类反证——同一量法施于改前之值须当场红（两层各测）",
          ok,
          "两层俱得 ['E276', 'E286']（任务书§二所指之二行，切点落进引文、传文腰斩）",
          "；".join(got),
          "以两层之 role_parts() 各施于改前 19 行，取其 head 内括引不成对者")

    # 断言九·机器反证：其余 675 行一字未动
    fix_by_key = {(r["event_id"], r["person_id"]): r for r in fixes}
    merged, untouched_old, untouched_new, touched = [], [], [], 0
    for r in live:
        k = (r["event_id"], r["person_id"])
        if k in fix_by_key:
            merged.append({f: fix_by_key[k][f] for f in FIELDS})
            touched += 1
        else:
            merged.append({f: r[f] for f in FIELDS})
            untouched_old.append([r[f] for f in FIELDS])
            untouched_new.append([merged[-1][f] for f in FIELDS])
    h_old = hashlib.sha256(repr(untouched_old).encode("utf-8")).hexdigest()
    h_new = hashlib.sha256(repr(untouched_new).encode("utf-8")).hexdigest()
    check("九", "机器反证：其余 675 行一字未动",
          len(merged) == 694 and touched == 19
          and len(untouched_old) == 675 and h_old == h_new,
          "合并后 694 行、所动 19 行、未动 675 行，且未动之 675 行五栏之 sha256 两两相同",
          "合并 %d 行，所动 %d，未动 %d，sha256 %s %s %s"
          % (len(merged), touched, len(untouched_old), h_old[:16],
             "==" if h_old == h_new else "!=", h_new[:16]),
          "逐行按键分流，未动者取其五栏之值列表作 sha256，改前改后两取而比")

    # 断言十·渲染零影响：未动之 675 行，其胶囊首句与改前逐字相同（两层各一遍）
    got, ok = [], True
    for L in LAYERS:
        d = [i for i, (a, b) in enumerate(zip(untouched_old, untouched_new))
             if role_parts(a[2], L)["head"] != role_parts(b[2], L)["head"]]
        got.append("%s 层 %d 行有异" % (L, len(d)))
        ok = ok and not d
    check("十", "渲染零影响：未动之 675 行，胶囊首句逐字未变（两层各测）",
          ok, "两层俱 0 行有异", "；".join(got),
          "对未动之 675 行，同一层内改前改后各取 role_parts()['head'] 逐字比")

    # 断言十一·合并之本过质量门
    tmp = tempfile.mkdtemp(prefix="r53_kongzi_sim_")
    try:
        shutil.copytree(os.path.join(ROOT, "data", "csv"), os.path.join(tmp, "data", "csv"))
        os.makedirs(os.path.join(tmp, "tools"))
        shutil.copy2(os.path.join(ROOT, "tools", "validate.py"),
                     os.path.join(tmp, "tools", "validate.py"))
        with io.open(os.path.join(tmp, "data", "csv", "event_people.csv"),
                     "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=FIELDS, lineterminator="\n")
            w.writeheader()
            w.writerows(merged)
        p = subprocess.run([sys.executable, os.path.join(tmp, "tools", "validate.py")],
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
        out = ((p.stdout or "") + (p.stderr or "")).strip().splitlines()
        check("十一", "合并之本过质量门 validate.py",
              p.returncode == 0,
              "exit 0（红线一：任何数据合入前必过）",
              "exit %d；末行「%s」" % (p.returncode, out[-1] if out else ""),
              "将 data/csv/ 全表复制至临时树，只以合并之本替 event_people.csv，"
              "于该树跑 tools/validate.py（本仓 data/csv/ 一字未动）")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    # 断言十二·摘引之量器（r53-8，裁六十一）：去标点后比
    ps = rows_of(PASSAGES)
    qmap = {p["id"]: p["quote_original"] for p in ps}
    charset = set("".join(qmap.values()))
    fixes_by_eid = {r["event_id"]: r for r in fixes}
    post = [fixes_by_eid[r["event_id"]] for r in hit]      # 改后之同 19 行，序同改前
    c_pre, c_post = quote_cands(hit, charset), quote_cands(post, charset)

    # 十二甲·改件不动引文一字：改前改后所取之候选逐字相同
    check("十二甲", "改件不动引文一字：改前改后所取之摘引候选逐字相同",
          c_pre == c_post,
          "两侧候选之列（行、所指之 Q、其文）逐字全等——改法系纯前置，引文不在其内",
          "改前 %d 处、改后 %d 处，%s"
          % (len(c_pre), len(c_post), "逐字全等" if c_pre == c_post else "★ 有异"),
          "以 quote_cands() 分取改前（现库 19 行）与改后（fixes 19 行）之摘引候选而逐项比")

    judged = [(eid, seg, in_base(seg, qids, qmap, False), in_base(seg, qids, qmap, True))
              for eid, qids, seg in c_pre]
    old_ok = [(e, s) for e, s, a, b in judged if a[0]]
    new_ok = [(e, s) for e, s, a, b in judged if b[0]]
    new_bad = [(e, strip_md(s)) for e, s, a, b in judged if not b[0]]
    to_合 = [(e, s) for e, s, a, b in judged if not a[0] and b[0]]
    to_异 = [(e, s) for e, s, a, b in judged if a[0] and not b[0]]
    cross = [(e, s, b[1]) for e, s, a, b in judged if b[0] == "跨行"]

    # 十二乙·新式（去标点）之果：不合者恰为所登记之二处
    check("十二乙", "去标点后比：不合者恰为所登记之二处（各有名有由）",
          sorted(new_bad) == sorted(REGISTERED_MISS),
          "%d 处候选中，命中 %d、不合恰 %s 二处（《国语》无落点者、编者之语之伪阳）"
          % (len(judged), len(judged) - len(REGISTERED_MISS), sorted(REGISTERED_MISS)),
          "候选 %d 处；旧式命中 %d／不合 %d，新式命中 %d／不合 %d %s"
          % (len(judged), len(old_ok), len(judged) - len(old_ok),
             len(new_ok), len(new_bad), sorted(new_bad)),
          "取每一候选，以 norm_quote(depunct=True) 归一后判其为本行所指之 Q（不中则全库）"
          "之 quote_original 同法归一后之子串")

    # 十二丙·★ 本件之闸：二式之差只许「异转合」，不许一处「合转异」
    check("十二丙", "★ 量具之改，只许异转合、不许一处合转异",
          sorted(e for e, _ in to_合) == ["E290", "E297"] and not to_异,
          "由异转合恰 `E290`／`E297` 二处（裁六十一之二首例）；**由合转异 0 处**",
          "异转合 %d 处 %s；合转异 %d 处 %s"
          % (len(to_合), [e for e, _ in to_合], len(to_异), [e for e, _ in to_异]),
          "同一候选之集，以旧式（不去标点）与新式（去标点）各判一过而取其差。"
          "★ 读法：合转异若非 0，即去标点之法伤了别处——停下上报，勿改数以就之")
    for e, s in to_合:
        print("       异转合：%s  %s" % (e, s[:46]))
    print("       跨行互指（新式，其文在他 `Q` 内，非误）：%s"
          % ["%s %s→%s" % (e, s, q) for e, s, q in cross])

    # 断言十二丁·★ 按类反证：「去标点」之宽，只许宽于标点，不许宽于一字之增损
    #   （若无此一项，「四十四处俱合」之绿可以只是因为量具已宽到什么都合——
    #    照 r52 门之例：同一量法须当场测出一个真病，测不出则其「过」俱不算）
    probe = [(e, q, s) for e, q, s in c_pre if e == "E297" and "郯子而學之" in s]
    ok_d, got_d = bool(probe), ["★ 取不到 E297 之摘引，反证无从施"]
    if probe:
        _e, _q, _s = probe[0]
        r_zi = in_base(_s.replace("郯子", "邾子"), _q, qmap, True)[0]      # ① 易一字
        r_pun = in_base(_s.replace("，", "：").replace("。", "；"), _q, qmap, True)[0]  # ② 只易标点
        ok_d = (r_zi is None) and (r_pun is not None)
        got_d = ["① 易一字（郯→邾）→ %s" % (r_zi or "不合（★ 量具筛得住）"),
                 "② 只易标点（，→：、。→；）→ %s" % (r_pun or "不合")]
    check("十二丁", "按类反证：去标点之宽只宽于标点，不宽于一字之增损",
          ok_d,
          "① 易一字者**当场不合**（裁六十一未松「其字不得增损一字」一条）；"
          "② 只易标点者**仍合**（裁六十一之所裁）",
          "；".join(got_d),
          "取 `E297` 之摘引（裁六十一之首例），一本易其一字、一本只易其标点，"
          "各以新式判之。★ 读法：①若判为合，即量具已宽到无用，其余之绿俱不算")

    # ★ 附记（非断言，列果以备裁）：「剔星号」一步之载力——其步非裁六十一所裁
    def hit_without_star_strip(seg):
        """不剔星号（只剔反引号）而去标点，仍为底账之子串否。"""
        n = "".join(c for c in seg.replace("`", "") if c not in PUNCT)
        return any(n in norm_quote(v, True) for v in qmap.values())

    star_dep = [(e, s) for e, s, a, b in judged
                if b[0] and not hit_without_star_strip(s)]
    print("       ★ 附记·「剔星号」一步之载力：新式命中之 %d 处中，**%d 处赖此一步方合**"
          % (len(new_ok), len(star_dep)))
    print("         其步非裁六十一所裁（裁者只标点一层），星号可否入引尚无文——领队已呈站长。")
    print("         读法：若裁「星号不得入引」，则此 %d 处**须改库行**，非改本量器。" % len(star_dep))
    print("         逐处：%s" % [e for e, _ in star_dep])

    print()
    if FAIL:
        print("FAIL：%d 项不符——%s" % (len(FAIL), "、".join("断言" + n for n in FAIL)))
        return 1
    print("OK：十七项断言全过（断言〇甲、〇乙、一至十一、十二甲乙丙丁）。本仓 data/csv/ 与 site/ 一字未动。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
