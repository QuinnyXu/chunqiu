#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""考据核对台账索引之抽取器（r52 裁七立；★ **r55-D 起为「被调之库」，不写任何文件**）。

从 data/csv/ 现有字段抽取核对台账之料与其文；其写出者别为二处（见下「本文件之地位」）。

【本文件之地位（2026-10-01 EDT r55-D 定；据 team/round54_prompts.md §十 裁一百一十一 取甲，
  并 §九 裁一百〇六 三条件之②「其地位须同件定」）】
  ★ **本文件是被调之库，不是写手**：其所有者是抽取之法（build_records()／extract_*／STATUS_PATTERNS／
    render()／public_records()／public_notice()），**而无一写权**。
  ★ **其果之写者只一个进程**：tools/csv_to_json.py——
      · site/data/kaodui.json、site/data/kaodui_notice.json（r54-5 起，裁七十七取甲-ii）；
      · docs/kaodui_index.md（**r55-D 起**，裁一百〇六准其写 docs/、裁一百一十一取甲）。
  〔2026-10-10 EDT 就地加注·r60-M（只加注，不改上文一字，不动一行码；据 team/round59_prompts.md §四十三 裁二百一十二 二④）：
    上列「site/data/kaodui.json、kaodui_notice.json」二写与本文件下文凡述「二 json」「读者页」「共用一源」者
    （含 r54-5 就地加注、FANLI 诸常量与 STATUS_ORDER 之注、source_fingerprints 之注），皆系其时（r54-5 至 r60-I）之实：
    读者页（考据索引屏）已于 r60-I 去，csv_to_json.py 已于 r60-J 去二 json 之写与 meta.tables 之 kaodui 键，今所写者只
    docs/kaodui_index.md 与 site/data/verify_marks.json。★ public_records()／public_notice() 二函数原专为二 json 而设，
    今已成孤——全仓无调用者（可复跑：grep -rnE "public_records|public_notice" tools site --include=*.py --include=*.js
    仅得其定义与本注）；其注所云「site/data/…之形」「读者页」今无所指。依裁一百九十六 三① 取甲「留其器」，码不删；
    择「并入器头之说明」而不逐函数改注，由：二函数之注同属上述其时之述，一处总说胜过两处各改，且不动函数体与其文档串。〕
  ★ **其由**：「两个写手一个文件」正是 r53 立「单一写手」所禁（裁一百〇六之二）。
    r55-D 之前，本文件与 csv_to_json.py **俱能据同一 render() 之果去动 docs/kaodui_index.md**，
    虽实际只本文件写之，其形已是二写手；今去本文件之写权，形与实同归一。
  ★ **旧语之留痕**：上「生成器」一名与「生成 docs/kaodui_index.md」一语系 r52 至 2026-10-01 之文，
    **其时为真**；今随地位之改而改，原字记于此行与本注，不抹（docs/conventions.md §7 v1.41）。

原题与原句（r52 立，照留）：「考据核对台账索引生成器（r52 裁七）。／从 data/csv/ 现有字段抽取核对台账，
  生成 docs/kaodui_index.md。」

设计红线（team/round52_prompts.md §二 口径七条）：
  1. 只抽不断——本脚本不作任何史学判断；抽不出者一律书「未标」，
     不以上下文推断补齐。宁少勿假。
  2. 「未核」「本轮无从核」「未见」三者分书，不归并。
  3. 每条带源栏定位（表、行 id、栏名、字符偏移、首四十字），可径回原文。
  4. 只读 data/csv/，一字不改；不写 site/data/。
     〔2026-10-01（EDT）就地加注（r55-D；裁一百一十一 取甲，**上句一字不删**）：上句之「不写 site/data/」
      **今日仍真**，且其面已推及全库——**本文件自 r55-D 起不写任何文件**（docs/ 亦不写）。
      ★ 其反证：单跑 `python tools/build_kaodui_index.py`，docs/kaodui_index.md 之 mtime 不变
      （裁一百一十一 明命此证；★ `grep open(..., "w")` 是读码所得，不是实证）。〕
     〔2026-09-28 就地加注（r54-5；**旧文一字不删**）：上句今日仍真——**本文件自身仍不写
      site/data/**；惟其所本之 r52 裁八「公开与否本轮不定」**已非现行之判**。站长 2026-09-26
      命「护城河之索引读者页须排进来」，team/round54_prompts.md §三 裁七十七明许越裁八与
      裁十五②，取甲-ii：由 tools/csv_to_json.py 于其末 import 本文件之 build_records()，
      以**同一次抽取之果**写出 site/data/kaodui.json（台账逐条）与
      site/data/kaodui_notice.json（凡例与档序）。故 site/data/ 之写者进程仍只
      tools/csv_to_json.py 一个，CLAUDE.md 红线二与 docs/conventions.md 之数据流一字不须改。〕

用法（★ **三式俱只读不写**；欲生成 docs/kaodui_index.md 请跑 `python tools/csv_to_json.py`）：
        python tools/build_kaodui_index.py            # 只印不写：印其地位、条数与逐表之统
        python tools/build_kaodui_index.py --check    # 只验不写（退出码 1 表示与现文件不符）
        python tools/build_kaodui_index.py --stdout   # 打印到标准输出
  〔2026-10-01（EDT）就地加注（r55-D）：第一式原书「# 生成 docs/kaodui_index.md」，
   **其语自 r52 至 2026-10-01 为真**；今其写权已去，故改书「只印不写」。原字记此，不抹。〕
"""

import csv
import hashlib
import os
import re
import sys

# Windows 控制台默认编码可能不是 UTF-8，中文报告会打印失败（照 tools/validate.py 之例）
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        _stream.reconfigure(encoding="utf-8", errors="replace")

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_DIR = os.path.join(REPO, "data", "csv")
# ★ 2026-10-01 EDT r55-D（裁一百一十一 取甲）：此常量原名 `OUT_PATH`，今改名 `MD_PATH`。
#   其由：本文件已无写权，而「OUT」一名宣其为本文件之输出——**宣与实不符比越界更坏**（裁一百〇六之一）。
#   今其用只二：① 本文件 --check 之**读**；② tools/csv_to_json.py 取其路以**写**（单一写手在彼）。
MD_PATH = os.path.join(REPO, "docs", "kaodui_index.md")

# ---------------------------------------------------------------- 源栏
# (表名, 文件名, 行 id 栏, 抽取之源栏)
SOURCES = [
    ("places", "places.csv", "id", "coord_basis"),
    ("sources", "sources.csv", "id", "notes"),
    ("passages", "passages.csv", "id", "modern_note"),
    ("people", "people.csv", "id", "notes"),
    ("events", "events.csv", "id", "summary"),
]

# ---------------------------------------------------------------- 词表
# 核对状态：模式自具体至宽泛，重叠时取先列者（见 pick_nonoverlap）。
# 每一档皆本库现行写法之实见形，canonical 名一律取本库自用之语，不新造。
STATUS_PATTERNS = [
    ("本轮无从核", r"本轮[^，。；）】]{0,10}无从核|无从核|本轮无一处取得纸本"
                   r"|本轮均系[^，。；]{0,10}不可得而\*{0,2}未核"),
    ("未核待补", r"未核待补"),
    ("须纸本核", r"[须須][^，。；）】]{0,8}纸本核"),
    ("未取纸本", r"未取[^，。；）】]{0,12}纸本[^，。；）】]{0,6}核对"
                 r"|本轮未取得[^，。；）】]{0,8}纸本|纸本[^，。；）】]{0,6}未取得|未取纸本"),
    ("未取原文核对", r"未[取與与][^，。；）】]{0,20}原[文書书][^，。；）】]{0,8}(核对|核實|核实|复核)"),
    ("非纸本核对", r"非纸本核对"),
    ("待纸本", r"纸本待核|待纸本"),
    ("留痕待核", r"如实留痕待核|留痕待核"),
    ("未标核对状态", r"未标核对状态|未著核对状态"),
    ("扫描本已核", r"纸本扫描本[^，。；）】]{0,12}已核|扫描本[^，。；）】]{0,8}已核"
                   r"|已核[^，。；）】]{0,4}（?纸本扫描本"),
    ("扫描本", r"纸本扫描本|扫描本"),
    ("纸本已核", r"纸本[，、]\s*站长(核对|复核|核)"
                 r"|站长[^，。；）】]{0,4}纸本(核实|实核|实翻|实见|逐字核|核)"
                 r"|纸本(实核|核实|实见|实翻)"
                 r"|纸本[，、][^，。；）】]{0,6}(核对|复核)"),
    ("电子本逐字核对·否定性结果",
     r"(ctext|电子本|电子转录本|电子文本|维基文库)[^。；]{0,80}逐字核[对對]"
     r"[^。；]{0,30}[无無][^。；]{0,28}之(文|語|语|說|说|字)"),
    ("电子本已核", r"电子(转录)?本已核|电子转录本已核|电子本[^，。；）】]{0,6}已核"),
    ("电子本转引", r"电子本转引|电子本[^，。；）】]{0,6}转引"),
    ("电子本", r"电子转录本|电子本|电子文本"),
    ("转引", r"转引"),
    ("未见", r"未见(原书|原文|原图|图|实测|告|该[^，。；）】]{0,8})|报中未见|未见"),
    ("未核", r"未核"),
    ("待核", r"待核"),
    ("已核", r"已核"),
]
STATUS_COMPILED = [(name, re.compile(pat)) for name, pat in STATUS_PATTERNS]

# 否定／引述语境：命中之状态词其前后若见此类语，加注记号，不径删亦不径信。
NEG_BEFORE = re.compile(r"(不因|不得|不当|不作|不以|不与|不称|须与|免其与|非|亦非|既非|勿|无从|不是|不读作)"
                        r"[^，。；]{0,14}$")
NEG_AFTER = re.compile(r"^[^，。；]{0,10}(之谓|一类断言|相混|区分|有别|不同|之别|是两件事)")

# 核者：仅取与核字语相邻者。
ACTOR_FWD = re.compile(r"(站长|领队|Sophia|本库)[^，。；）】]{0,6}"
                       r"(核对|复核|核实|实核|实翻|实读|实见|纸本|回填|回告|未核|已核|核字|核)")
ACTOR_BWD = re.compile(r"(核对|复核|已核|实核|核字|核)[，、]\s*\*{0,2}(站长|领队|Sophia|本库)")

# 所据之书：书名号内之全称，加本库通用之简称定式。简称一律照原文留字，不代展全名。
BOOK_RE = re.compile(r"《[^《》]{1,48}》|杨注|谭图|杜注|孔疏|阮刻十三经注疏|整理者注释|整理本|维基文库")

# 页：「页 N」「页 N–M」「N–M 页」「第三五二页」四式。「页码」二字不入（其后无数）。
PAGE_RE = re.compile(r"页\s*[0-9]+(?:\s*[–—\-]\s*[0-9]+)?"
                     r"|[0-9]+(?:\s*[–—\-]\s*[0-9]+)?\s*页"
                     r"|第[〇○零一二三四五六七八九十百]+页")

DATE_RE = re.compile(r"20[0-9]{2}-[0-9]{2}-[0-9]{2}")

# 裁定出处：规范节次、版本号、轮次、裁定号、归档件路径。
REF_RE = re.compile(r"§\s?[0-9]+(?:\.[0-9]+)*"
                    r"|v1\.[0-9]+"
                    r"|裁定\s?[0-9]+"
                    r"|裁[定]?[一二三四五六七八九十]+"
                    r"|r[0-9]{1,2}[a-d]?(?=[ 　、，。；）】之]|$)"
                    r"|(?:team|docs)/[0-9A-Za-z_./-]+\.md")

# 段之首：【…】节标。节标即本条「所核之项」之所出。
HEAD_RE = re.compile(r"【([^【】]{1,80})】")

# 广义核对信号（用于定「候选行」：行内有此类痕迹而抽不出者，方是真问题）
SIGNAL_RE = re.compile(r"纸本|扫描本|电子本|电子转录本|转引|未核|无从核|未见|已核|核对|核实|实翻"
                       r"|核字|待核|核对状态|" + DATE_RE.pattern
                       + r"|" + PAGE_RE.pattern)

MAX_BOOKS = 8          # 书／页两栏之列举上限
MAX_CONCL = 220        # 结论摘之字数上限
MAX_REFS = 10

# ---------------------------------------------------------------- 凡例之文（单一来源）
# 〔2026-09-28 r54-5 立：以下诸文原系 render() 内逐行硬写之字，今提为模块级常量，由
#  docs/kaodui_index.md 与 site/data/kaodui_notice.json **共用一源**——读者页之凡例
#  不得手抄（team/round54_prompts.md §三 裁七十七：「页首凡例之文不得手抄，须与 md
#  同出一源」）。**其字一字未改**，md 之输出逐字不变（以 --check 实证）。〕
FANLI_T_ZHICHOU = "只抽不断"
FANLI_ZHICHOU = ("**★ " + FANLI_T_ZHICHOU + "**：抽取器不作任何史学判断。凡抽不出者一律书「未标」，"
                 "**不以上下文推断补齐**（如：段内无日期而邻段有，不代填）。宁少勿假。")

FANLI_T_SANTAI = "三态分书，不归并"
FANLI_SANTAI_LEAD = ("「未核」「本轮无从核」「未见」在本库是**三种不同之证据状态**"
                     "（§7 否定性核字自限、§10.2 有界扫描留痕）：")
FANLI_SANTAI_ITEMS = [
    "- **未核**——未曾核（状态之泛称，多为「某书本条未核」）。",
    "- **未核待补**——已登记为待补之项。",
    "- **本轮无从核**——材料不在手，消极的没查到；"
    "**不得读作「查无」**（查无是积极之否定结论，本库两者严分）。"
    "凡「本轮……无从核」「均无从核」之语俱归此档。",
    "- **未见**——某物（原书／原图／扫描图／报中之某项）未曾目验。",
]

FANLI_T_ZHILUPAI = "索引是指路牌，不是替代品"
FANLI_ZHILUPAI = ("**" + FANLI_T_ZHILUPAI + "。** 每条俱带源栏定位（表·行 id·栏名·字符偏移·首四十字），"
                  "凡须凭以论断者，**一律回原栏读全文**。")

# 页首三句凡例（键·题·文）——其序照 r54-3 所拟。
FANLI = [
    ("zhichou_buduan", FANLI_T_ZHICHOU, FANLI_ZHICHOU),
    ("santai_fenshu", FANLI_T_SANTAI,
     "\n".join([FANLI_SANTAI_LEAD] + FANLI_SANTAI_ITEMS)),
    ("zhilupai", FANLI_T_ZHILUPAI, FANLI_ZHILUPAI),
]

# 否定／引述语境之记号：正表用全文之记，速查用短记。**去之即成粉饰**，故一并予读者页。
NEG_MARK = "〔否定／引述语境，须回原文〕"
NEG_MARK_SHORT = "〔否定／引述语境〕"
NEG_MARK_NOTE = ("**" + NEG_MARK + "** 之记号：状态词之前后见「不因…径称」「非」「须与…区分」之类语时加此记，"
                 "示此处之状态词**可能系否定句或引述**（如「不因惯称相符而径称已核」），"
                 "抽取器不代判其正反，**既不径删、亦不径信**，留待读者回原文。")

# 速查之档序（**21 档，一档不并**）——md §三 与 site/data/kaodui_notice.json 共用此一序。
STATUS_ORDER = ["本轮无从核", "未见", "未核待补", "未核", "待核",
                "未取原文核对", "未取纸本", "非纸本核对",
                "须纸本核", "待纸本", "留痕待核", "未标核对状态",
                "电子本逐字核对·否定性结果",
                "纸本已核", "扫描本已核", "扫描本", "电子本已核", "电子本转引",
                "电子本", "转引", "已核"]


def strip_marks(s):
    """去成对星号与换行，使之可入表格；竖线转义。"""
    s = s.replace("**", "").replace("\r", " ").replace("\n", " ")
    s = s.replace("|", "｜")
    return re.sub(r"\s+", " ", s).strip()


def pick_nonoverlap(spans):
    """spans: [(start, end, payload, prio)]；重叠时取起点靠前者，同起点取更长者，
    再同则取优先级数小者（即词表中更具体之档）。"""
    spans = sorted(spans, key=lambda x: (x[0], -(x[1] - x[0]), x[3]))
    out, last = [], -1
    for s, e, payload, prio in spans:
        if s >= last:
            out.append((s, e, payload))
            last = e
    return out


def extract_status(text):
    """返回 [(状态名, 是否否定／引述语境)]，按首见次序，去重。"""
    spans = []
    for prio, (name, rx) in enumerate(STATUS_COMPILED):
        for m in rx.finditer(text):
            spans.append((m.start(), m.end(), name, prio))
    picked = pick_nonoverlap(spans)
    seen, out = set(), []
    for s, e, name in picked:
        negated = bool(NEG_BEFORE.search(text[max(0, s - 16):s])) or \
                  bool(NEG_AFTER.match(text[e:e + 14]))
        key = (name, negated)
        if key not in seen:
            seen.add(key)
            out.append(key)
    return out


def extract_books_pages(text):
    """书与页按「就近后随」机械配对：一书之后、下一书之前所见之页，归其名下；
    书前之页归「未标」之首槽。此系机械规则，非判断；原文定位俱在，读者可回核。"""
    books = [(m.start(), m.group(0)) for m in BOOK_RE.finditer(text)]
    pages = [(m.start(), re.sub(r"\s+", "", m.group(0))) for m in PAGE_RE.finditer(text)]
    slots = []  # [(书, [页...])]
    if not books:
        if pages:
            slots.append(("未标", [p for _, p in pages]))
        return slots
    bounds = [b[0] for b in books] + [len(text) + 1]
    lead = [p for pos, p in pages if pos < bounds[0]]
    if lead:
        slots.append(("未标", lead))
    for i, (pos, name) in enumerate(books):
        own = [p for ppos, p in pages if bounds[i] <= ppos < bounds[i + 1]]
        slots.append((name, own))
    # 同名合并（保序）
    merged = []
    for name, pgs in slots:
        for m in merged:
            if m[0] == name:
                for p in pgs:
                    if p not in m[1]:
                        m[1].append(p)
                break
        else:
            merged.append([name, list(dict.fromkeys(pgs))])
    return [(n, p) for n, p in merged]


def extract_actors(text):
    out = []
    for m in ACTOR_FWD.finditer(text):
        if m.group(1) not in out:
            out.append(m.group(1))
    for m in ACTOR_BWD.finditer(text):
        if m.group(2) not in out:
            out.append(m.group(2))
    return out


def extract_conclusion(text):
    """结论摘：取段内之着重段（成对星号之内），去其纯引注者（含书名号或纯页码），
    此系本库行文之实况——着重段即其所欲立之断语。摘而不断，过长则截。"""
    runs = []
    for m in re.finditer(r"\*\*(.+?)\*\*", text, re.S):
        v = strip_marks(m.group(1))
        if len(v) < 3:
            continue
        if "《" in v or PAGE_RE.fullmatch(v.replace(" ", "")):
            continue
        if v not in runs:
            runs.append(v)
    s = "／".join(runs)
    if len(s) > MAX_CONCL:
        s = s[:MAX_CONCL] + "…〔截，全文见源栏〕"
    return s


def extract_refs(text):
    out = []
    for m in REF_RE.finditer(text):
        v = m.group(0).strip()
        if v not in out:
            out.append(v)
    if len(out) > MAX_REFS:
        out = out[:MAX_REFS] + ["…"]
    return out


def segment(text):
    """按【…】节标切段；首个节标之前之文自为一段（所核之项作「未标」）。
    返回 [(起点, 止点, 节标或 None)]。"""
    heads = [(m.start(), m.end(), m.group(1)) for m in HEAD_RE.finditer(text)]
    if not heads:
        return [(0, len(text), None)]
    segs = []
    if heads[0][0] > 0:
        segs.append((0, heads[0][0], None))
    for i, (s, e, title) in enumerate(heads):
        end = heads[i + 1][0] if i + 1 < len(heads) else len(text)
        segs.append((s, end, title))
    return segs


def build_records():
    records = []     # 已抽出之条
    stats = []       # 各源栏自查
    for table, fname, idcol, col in SOURCES:
        path = os.path.join(CSV_DIR, fname)
        with open(path, encoding="utf-8", newline="") as f:
            rows = list(csv.DictReader(f))
        total = len(rows)
        nonempty = 0
        candidates, extracted = [], []
        skipped_segs = 0
        for row in rows:
            raw = row.get(col) or ""
            if raw.strip():
                nonempty += 1
            has_signal = bool(SIGNAL_RE.search(raw))
            if has_signal:
                candidates.append(row[idcol])
            got = False
            for s, e, title in segment(raw):
                seg = raw[s:e]
                if not seg.strip():
                    continue
                status = extract_status(seg)
                slots = extract_books_pages(seg)
                actors = extract_actors(seg)
                dates = DATE_RE.findall(seg)
                pages_any = any(p for _, p in slots)
                # 节标自书「核对状态」「底本」者，虽无状态词亦收——其本即核对之著录，
                # 收之而状态书「未标」，正可见「立了节而未书状态」之实况。
                is_kaodui_head = bool(title and re.search(r"核对状态|底本", title))
                if not (status or dates or pages_any or actors or is_kaodui_head):
                    skipped_segs += 1
                    continue
                rec = {
                    "table": table,
                    "row_id": row[idcol],
                    "col": col,
                    "offset": s,
                    "head40": strip_marks(seg[:40]),
                    "item": strip_marks(title) if title else "未标",
                    "books": slots[:MAX_BOOKS],
                    "books_more": max(0, len(slots) - MAX_BOOKS),
                    "status": status,
                    "actors": actors,
                    "dates": list(dict.fromkeys(dates)),
                    "concl": extract_conclusion(seg),
                    "refs": extract_refs(seg),
                }
                records.append(rec)
                got = True
            if got:
                extracted.append(row[idcol])
        missed = [i for i in candidates if i not in set(extracted)]
        extra = [i for i in extracted if i not in set(candidates)]
        stats.append({
            "table": table, "col": col, "total": total, "nonempty": nonempty,
            "candidates": candidates, "extracted": extracted, "missed": missed,
            "extra": extra,
            "skipped_segs": skipped_segs,
            "records": len([r for r in records if r["table"] == table]),
        })
    return records, stats


def fmt_books(rec):
    if not rec["books"]:
        return "未标", "未标"
    names, pages = [], []
    for name, pgs in rec["books"]:
        names.append(name)
        pages.append("＋".join(pgs) if pgs else "未标")
    if rec["books_more"]:
        names.append("…等 %d 项" % rec["books_more"])
        pages.append("…")
    return "／".join(names), "／".join(pages)


def fmt_status(rec):
    if not rec["status"]:
        return "未标"
    out = []
    for name, negated in rec["status"]:
        out.append(name + (NEG_MARK if negated else ""))
    return "／".join(out)


def source_fingerprints(stats):
    """各源栏之指纹与行数。md §〇 与 site/data/kaodui_notice.json 共用此一求法。"""
    out = []
    for table, fname, idcol, col in SOURCES:
        path = os.path.join(CSV_DIR, fname)
        s = next(x for x in stats if x["table"] == table)
        out.append({
            "table": table,
            "file": fname,
            "id_col": idcol,
            "col": col,
            "rows": s["total"],
            "records": s["records"],
            "sha256_12": hashlib.sha256(open(path, "rb").read()).hexdigest()[:12],
        })
    return out


# 〔r60-M 注：本函数今已成孤、无调用者，其注所述「site/data/…」「读者页」今无所指，详见文件头 r60-M 就地加注；留器不删。〕
def public_records(records):
    """把内部之条成 `site/data/kaodui.json` 之形。

    ★ **只改输出之形，不改所抽之物**（r54-5 件之 4）：本式不触 build_records()／
      extract_*／STATUS_PATTERNS 一字，只把已抽之果由元组之形改为具名之形，
      并补一目 `event_id`（引文回库所需，取自 passages.csv 之同 id 行，**不作任何推断**）。
    """
    ev = {}
    with open(os.path.join(CSV_DIR, "passages.csv"), encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            ev[row["id"]] = (row.get("event_id") or "").strip() or None
    out = []
    for r in records:
        out.append({
            "key": "%s.%s.%s@%d" % (r["table"], r["row_id"], r["col"], r["offset"]),
            "table": r["table"],
            "row_id": r["row_id"],
            "col": r["col"],
            "offset": r["offset"],
            "head40": r["head40"],
            "item": r["item"],
            "books": [{"name": n, "pages": list(pgs)} for n, pgs in r["books"]],
            "books_more": r["books_more"],
            "status": [{"name": n, "negated": bool(g)} for n, g in r["status"]],
            "actors": list(r["actors"]),
            "dates": list(r["dates"]),
            "concl": r["concl"],
            "refs": list(r["refs"]),
            "event_id": ev.get(r["row_id"]) if r["table"] == "passages" else None,
        })
    return out


# 〔r60-M 注：本函数今已成孤、无调用者，其注所述「site/data/…」「读者页」今无所指，详见文件头 r60-M 就地加注；留器不删。〕
def public_notice(records, stats):
    """`site/data/kaodui_notice.json` 之形：凡例、档序、记号、源栏指纹。

    ★ 其文与 `docs/kaodui_index.md` **同出一源**（模块级常量），读者页不得手抄。
    ★ 本式**不取墙钟时间**——其果只系于输入，故两跑逐字相同。
    """
    return {
        "_": "生成物，勿手改。由 tools/csv_to_json.py 写出；其料与其文出 tools/build_kaodui_index.py，"
             "与 docs/kaodui_index.md 同出一源。",
        "generator": "tools/build_kaodui_index.py",
        "writer": "tools/csv_to_json.py",
        "index_doc": "docs/kaodui_index.md",
        "records": len(records),
        "fanli": [{"key": k, "title": t, "text": x} for k, t, x in FANLI],
        "status_order": list(STATUS_ORDER),
        "neg_mark": NEG_MARK,
        "neg_mark_short": NEG_MARK_SHORT,
        "neg_mark_note": NEG_MARK_NOTE,
        "concl_max": MAX_CONCL,
        "books_max": MAX_BOOKS,
        "sources": source_fingerprints(stats),
    }


def render(records, stats):
    L = []
    W = L.append
    W("# 考据核对台账索引（kaodui index）")
    W("")
    W("> **本文件由 `tools/csv_to_json.py` 生成，勿手改。**"
      "改动请改抽取器 `tools/build_kaodui_index.py`（其料与其文之所出，"
      "**r55-D 起为被调之库，不写本文件**）或改 `data/csv/` 源栏，"
      "再跑 `python tools/csv_to_json.py` 重新生成。")
    W("")
    W("〔**2026-10-01（EDT）就地加注·上句之改**（r55-D；据 `team/round54_prompts.md` "
      "§十 **裁一百一十一** 取甲、§九 **裁一百〇六** 三条件之①）："
      "上句原书「**本文件由 `tools/build_kaodui_index.py` 生成，勿手改。**"
      "改动请改抽取器或改 `data/csv/` 源栏，再重新生成。」"
      "——**其语自 r52 立至 2026-10-01 为真**；今裁一百一十一 取甲，"
      "`tools/build_kaodui_index.py` **去其写权、定为被调之库**，"
      "本文件之写者改为 `tools/csv_to_json.py`（与 `site/data/kaodui.json`、"
      "`site/data/kaodui_notice.json` **同一跑**），故上句随之改。"
      "★ **宣与实不符比越界更坏**（裁一百〇六 之一），故宣随实改，原字记此不抹。〕")
    W("")
    W("本索引系 r52 裁七之产物——**病根不是记录缺失，是记录不可检索**。"
      "历轮之核对记录本以散文埋在 `coord_basis`／`notes`／`modern_note`／`summary` 诸长栏中，"
      "本文件把其中可机器辨认之痕迹一次性浮出，使「此事何时核过、核在何处、据何书何页、谁核的」**一检即得**。")
    W("")
    W(FANLI_ZHILUPAI)
    W("")
    W("## 〇、源数据指纹")
    W("")
    W("| 源文件 | 行数 | sha256（前 12 位） |")
    W("|---|---:|---|")
    for fp in source_fingerprints(stats):
        W("| `data/csv/%s` | %d | `%s` |" % (fp["file"], fp["rows"], fp["sha256_12"]))
    W("")
    W("指纹相同则本文件可逐字重现（生成器不取墙钟时间，输出只系于输入）。")
    W("")
    W("## 一、凡例（读之前先读此节）")
    W("")
    W("### 1. 抽取之单位")
    W("**段**——源栏之文以 `【…】` 节标切段，节标即本条之「所核之项」；"
      "首个节标之前之文自为一段，其「所核之项」书「未标」。"
      "**一段之内有数证者（①②③ 之属）不再细切**，其书与页并列于一条之内，"
      "使「三证同指一地」之类结论与其三证同见一行。")
    W("")
    W("### 2. 八目之出处与其限")
    W("")
    W("| 目 | 何以得之 | 抽不出时 |")
    W("|---|---|---|")
    W("| 标的 | 表名·行 id·栏名（机械） | 恒有 |")
    W("| 所核之项 | 段之 `【…】` 节标原文 | 「未标」 |")
    W("| 所据之书 | 段内 `《…》` 全称，及本库通用简称（杨注／谭图／杜注／孔疏／阮刻十三经注疏／整理者注释／整理本／维基文库）**照原字留，不代展全名** | 「未标」 |")
    W("| 页 | 「页 N」「页 N–M」「N–M 页」「第三五二页」四式；与书按**就近后随**配对（一书之后、下一书之前所见之页归其名下） | 「未标」 |")
    W("| 核对状态 | 词表匹配（见下 3） | 「未标」 |")
    W("| 核者 | 与核字语相邻之「站长／领队／Sophia／本库」 | 「未标」 |")
    W("| 日期 | `YYYY-MM-DD` | 「未标」 |")
    W("| 结论与其裁定出处 | 段内**着重段**（成对星号之内）去其纯引注者，＋ `§N`／`v1.N`／`rNN`／`裁定 N`／归档件路径 | 空 |")
    W("")
    W(FANLI_ZHICHOU)
    W("")
    W("### 3. 核对状态之词表（**" + FANLI_T_SANTAI + "**）")
    W("")
    W(FANLI_SANTAI_LEAD)
    W("")
    for _item in FANLI_SANTAI_ITEMS:
        W(_item)
    W("")
    W("**r52 新立二档**（2026-09-21 领队裁十一、裁十二）：")
    W("")
    W("- **未取原文核对**——**知其书之所在、而未取其文以核**（本轮择不取）。"
      "与上三态俱不同：「本轮无从核」是**不能**（书不可得）、「未见」是**查而未得**、"
      "「未核」是**未及**；此档是**已知何处可核而未为之**。"
      "「不能」与「未为」是两件事，归并即毁此分辨。与 §7 v1.26「二手引述须标核对状态」同族。")
    W("- **电子本逐字核对·否定性结果**——**核字已做**（电子本、全篇、逐字）、"
      "**结论为否定**（「无某文」）。此即 §7 v1.34 ③「否定性核字结果之效力自限」之实，"
      "本库久有其实而未有其名，r52 予其名。**纸本所核者另书「纸本逐字核对·否定性结果」**。"
      "★ 此档与「本轮无从核」严分：**「我们查过而它不在」不是「我们没查到」**。")
    W("")
    W("其余诸档：**待核**（泛记其待核）／**未取纸本**（某本未取而未核）／"
      "**非纸本核对**（明书其非纸本所核）／**须纸本核**（明书此项须纸本方可核）／"
      "**待纸本**（挂「待纸本」之标）／**留痕待核**（如实留痕待核）／"
      "**未标核对状态**（源文明书其未标）／纸本已核／扫描本已核／扫描本／"
      "电子本已核／电子本转引／电子本／转引／已核。"
      "**各档一律照本库自用之语命名，不新造名目、不并档**——本库分辨之细即其命脉，"
      "并档省事而毁证据状态之别。")
    W("")
    W("**一段见数档者并列**（以「／」相连）：一段之内本可兼记数事"
      "（如「页码纸本实见，而幅名未照目录核」），抽取器**不代择其一**。")
    W("")
    W(NEG_MARK_NOTE)
    W("")
    W("### 4. 字面之处置")
    W("成对星号（`**`）于本表一律去除（表格内难以对读），源栏原文不动；"
      "竖线 `|` 转为全角 `｜`；结论摘逾 %d 字者截，标「〔截，全文见源栏〕」。" % MAX_CONCL)
    W("")
    W("### 5. 本索引不收者")
    W("段内于「核对状态／页／核者／日期」四项**一项皆无**者不入表"
      "（如纯释义、纯行文之段；只见书名而无此四者亦不入）——其非核对记录，收之徒增噪声。"
      "其数见自查表之「略过之段」。**一例外**：节标自书「核对状态」「底本」者虽四项皆无亦收，"
      "其状态栏书「未标」——**立了节而未书状态，正是要看见的实况**。")
    W("")
    W("### 6. 如何检（三式）")
    W("")
    W("```sh")
    W("# ① 按地名／人名／篇名检 —— 答「此事核过没有、核在何处」")
    W("grep -n '梁城\\|解梁城' docs/kaodui_index.md")
    W("")
    W("# ② 按书与幅检 —— 答「此书此幅之页码与核对状态」")
    W("grep -n '齐鲁幅' docs/kaodui_index.md")
    W("")
    W("# ③ 按证据状态检 —— 答「哪些还没核、哪些是本轮无从核」")
    W("sed -n '/^### 本轮无从核/,/^### /p' docs/kaodui_index.md")
    W("```")
    W("")
    W("检得之后**回源栏读全文**：条内 `表.行id.栏 @N` 即其定位，`N` 为字符偏移。")
    W("")

    # ---- 自查表
    W("## 二、自查表（抽取率，如实报）")
    W("")
    W("| 源栏 | 表行数 | 非空 | 候选行 | 候选中抽出 | **抽不出者** | 无信号而抽出 | 条数 | 略过之段 |")
    W("|---|---:|---:|---:|---:|---:|---:|---:|---:|")
    for s in stats:
        W("| `%s.%s` | %d | %d | %d | %d | **%d** | %d | %d | %d |" % (
            s["table"], s["col"], s["total"], s["nonempty"],
            len(s["candidates"]), len(s["extracted"]) - len(s["extra"]),
            len(s["missed"]), len(s["extra"]),
            s["records"], s["skipped_segs"]))
    W("| **合计** | %d | %d | **%d** | **%d** | **%d** | %d | **%d** | %d |" % (
        sum(s["total"] for s in stats), sum(s["nonempty"] for s in stats),
        sum(len(s["candidates"]) for s in stats),
        sum(len(s["extracted"]) - len(s["extra"]) for s in stats),
        sum(len(s["missed"]) for s in stats),
        sum(len(s["extra"]) for s in stats),
        len(records), sum(s["skipped_segs"] for s in stats)))
    W("")
    W("- **候选行**＝源栏内见广义核对信号者（纸本／扫描本／电子本／电子转录本／转引／未核／无从核／未见／已核／核对／核实／实翻／核字／待核／核对状态／`YYYY-MM-DD`／页 N）。"
      "人名（站长／领队／Sophia）**不作信号**——其散见于裁定之引，不专属核对。")
    W("- **候选中抽出**＝候选行中至少出一条台账者。")
    W("- **抽不出者**＝**有信号而一条不出者**——其写法逸出现行体例，**是真问题**，全列于下，供领队判。")
    W("- **无信号而抽出**＝不含上列信号、而因段内有书＋页（或日期）得出条者；非问题，列出以免合计对不上。")
    W("")
    W("### 抽不出者之行 id（全列，不省）")
    W("")
    for s in stats:
        W("**`%s.%s`**（%d 行）：" % (s["table"], s["col"], len(s["missed"])))
        if s["missed"]:
            W("")
            W("```")
            for i in range(0, len(s["missed"]), 8):
                W("  ".join(s["missed"][i:i + 8]))
            W("```")
        else:
            W("")
            W("（无）")
        W("")

    # ---- 状态速查
    W("## 三、速查·按核对状态")
    W("")
    W("**三态分书**：下列三组**不得互代**。行 id 后括号内为其段之首四十字（截）。")
    W("")
    order = STATUS_ORDER
    by_status = {}
    for r in records:
        for name, negated in r["status"]:
            by_status.setdefault(name, []).append((r, negated))
    for name in order:
        items = by_status.get(name, [])
        W("### %s（%d 条）" % (name, len(items)))
        W("")
        if not items:
            W("（无）")
            W("")
            continue
        for r, negated in items:
            mark = (" " + NEG_MARK_SHORT) if negated else ""
            W("- `%s.%s.%s` @%d%s — %s" % (
                r["table"], r["row_id"], r["col"], r["offset"], mark, r["head40"]))
        W("")

    # ---- 正表
    W("## 四、台账正表")
    W("")
    W("一条一行，便于 `grep`／Ctrl-F。`@N` 为该段于源栏中之**字符偏移**。")
    W("")
    for table, fname, idcol, col in SOURCES:
        rs = [r for r in records if r["table"] == table]
        W("### `%s.%s`（%d 条）" % (table, col, len(rs)))
        W("")
        W("| 标的 | 定位（首四十字） | 所核之项 | 所据之书 | 页 | 核对状态 | 核者 | 日期 | 结论与其裁定出处 |")
        W("|---|---|---|---|---|---|---|---|---|")
        for r in rs:
            books, pages = fmt_books(r)
            refs = "；".join(r["refs"])
            concl = r["concl"]
            tail = concl + ("　〔出处：%s〕" % refs if refs else "")
            if not tail.strip():
                tail = "未标"
            W("| `%s.%s.%s` @%d | %s | %s | %s | %s | %s | %s | %s | %s |" % (
                r["table"], r["row_id"], r["col"], r["offset"],
                r["head40"] or "（空）",
                r["item"], books, pages, fmt_status(r),
                "／".join(r["actors"]) if r["actors"] else "未标",
                "／".join(r["dates"]) if r["dates"] else "未标",
                tail))
        W("")
    W("---")
    W("")
    W("生成器：`tools/build_kaodui_index.py`（r52 裁七）。本文件不入 `site/data/`"
      "（裁八：公开与否本轮不定）。")
    W("")
    W("〔**2026-09-28 就地加注**（r54-5；**上段旧文一字不删**）：上段「本文件不入 `site/data/`」"
      "之语**今日仍真**——本 md 自身仍不入 `site/data/`；惟其括号内所据之 **r52 裁八**"
      "「公开与否本轮不定」**已非现行之判**。站长 2026-09-26 命「护城河之索引读者页须排进来」，"
      "`team/round54_prompts.md` §三 **裁七十七**明许越**裁八**与**裁十五②**，取**甲-ii**："
      "同一个 `build_records()` 之果今另成二物——`site/data/kaodui.json`（台账逐条）与 "
      "`site/data/kaodui_notice.json`（凡例、档序与源栏指纹），**由 `tools/csv_to_json.py` 写**，"
      "故 `site/data/` 之写者进程仍只其一个。"
      "★ **二者同源而不同跑**：本 md 由本脚本写、二 json 由 `tools/csv_to_json.py` 写，"
      "故 `data/csv/` 一改，**二者须各跑一过方同步**；"
      "`python tools/build_kaodui_index.py --check` 可当场验本 md 是否已同步。〕")
    W("")
    W("〔**2026-10-01（EDT）就地加注·上二段之勘**（r55-D；据 `team/round54_prompts.md` "
      "§十 **裁一百一十一** 取甲、§九 **裁一百〇六**；**上二段旧文一字不删**）："
      "① 上段「生成器：`tools/build_kaodui_index.py`」**今当改读 `tools/csv_to_json.py`**"
      "——后者是本文件之**写者**，前者是其**料与其文之所出**"
      "（**被调之库，不写任何文件**）。"
      "② 上段（2026-09-28 之注）末「**二者同源而不同跑**……『须各跑一过方同步』……"
      "`python tools/build_kaodui_index.py --check` 可当场验本 md 是否已同步」之语，"
      "**自 2026-10-01（EDT）起不复真**：md 与二 json **同源亦同跑**——"
      "`python tools/csv_to_json.py` 一跑即出三物，**无『各跑一过』之窗**；"
      "`--check` 一式仍在（**只读不写**），然其所验者今是「本文件与重生成之果相符否」，"
      "非「二跑之间是否落后」。"
      "★ **二者原字照留，不抹**——其为 r52／2026-09-28 当日之实，系判定史"
      "（`docs/conventions.md` §7 v1.29）；**今之实以本注为准**。〕")
    return "\n".join(L) + "\n"


def main():
    args = sys.argv[1:]
    records, stats = build_records()
    text = render(records, stats)
    if "--stdout" in args:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stdout.write(text)
        return 0
    if "--check" in args:
        if not os.path.exists(MD_PATH):
            print("docs/kaodui_index.md 不存在")
            return 1
        cur = open(MD_PATH, encoding="utf-8", newline="").read().replace("\r\n", "\n")
        if cur != text:
            # ★ r55-D：此指引之语原书「docs/kaodui_index.md 与重新生成之结果不符——请重新生成」，
            #   今随写者之改而改指其新写者（原字记此，不抹）。
            print("docs/kaodui_index.md 与重新生成之结果不符"
                  "——请跑 python tools/csv_to_json.py（r55-D 起其写者在彼）")
            return 1
        print("一致：%d 条" % len(records))
        return 0
    # ----------------------------------------------------------------
    # ★ 2026-10-01 EDT r55-D（裁一百一十一 取甲）：此处原有「写 OUT_PATH」一路，**今删**。
    #   原码（照留以见其改，不复可执行）：
    #       with open(OUT_PATH, "w", encoding="utf-8", newline="\n") as f:
    #           f.write(text)
    #       print("已生成 %s：%d 条" % (os.path.relpath(OUT_PATH, REPO), len(records)))
    #   （★ 照留者系**删前之原字**，故其内仍作 `OUT_PATH`——改名与删写同件，见上方其赋值处之注。）
    #   今其默认一式改为**只印不写**：本文件是被调之库（见文件头「本文件之地位」）。
    #   ★ 其判取 0 不取非零：**不写不是错**，是本文件今日之本分；其所印之语已明指写者何在。
    print("本文件自 r55-D 起是**被调之库，不写任何文件**（裁一百一十一 取甲）。")
    print("docs/kaodui_index.md 之写者是 tools/csv_to_json.py——请跑：python tools/csv_to_json.py")
    print("本跑只印不写：抽出 %d 条（欲见其文请加 --stdout；欲验现文件请加 --check）。" % len(records))
    for s in stats:
        print("  %-9s %-12s 候选 %3d ／ 抽出 %3d ／ 抽不出 %3d ／ 条 %4d" % (
            s["table"], s["col"], len(s["candidates"]),
            len(s["extracted"]), len(s["missed"]), s["records"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
