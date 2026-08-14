# -*- coding: utf-8 -*-
"""校验 data/csv/ 数据的引用完整性、枚举、数值范围与 ID 规范。

用法（在仓库根目录）：
    python tools/validate.py

任何一条校验失败都会打印可读报错并以非零码退出；全部通过打印 OK。
规范定义见 docs/conventions.md。
"""
import csv
import re
import sys
from pathlib import Path

# Windows 控制台默认编码可能不是 UTF-8，中文报错会打印失败
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
CSV_DIR = ROOT / "data" / "csv"

CATEGORIES = {
    "即位", "战争", "会盟", "相会", "婚嫁", "生育", "出奔", "弑杀",
    "薨卒", "丧葬", "外交", "内乱", "灾异", "礼俗", "政制", "论对", "其他",
}  # 17 类，v1.21 新增「政制」（制度/治绩类事件，如管仲为政 E187、孙叔敖为相 E131）；
  # v1.23 新增「论对」（以谏诤/问对/贺辞等记言为事目本体、无独立行动骨架者，如 E188/E212/E220）
HML = {"high", "medium", "low"}
IMPORTANCE = {"1", "2", "3"}
PRESENCE = {"亲至", "相关", "不在"}  # event_people.presence；空视同亲至
  # v1.27（r28 裁定c）新增「不在」：史文明书其人不在事发地（正面证据），与「相关」
  # （史文未书其在场，消极证据）区分强度；前端展示暂同「相关」处理，不回溯扫库，
  # 首用例 E266/P_WENZHONG（大夫种守国）
YEAR_MIN, YEAR_MAX = -800, -464  # v1.24（fix26）放宽至《左传》全帙下限——哀公二十七年传末「悼之四年」
  # （晋荀瑶帅师围郑，鲁悼公四年＝前464），为 C 段吴越篇入库前置；同时约束 events.year_bce（第186行）
  # 与 people 生卒年字段（第248行）——两处共用本常量，改一处即同步，勿分别硬编码
  # 原 v1.11 值 -480 已不敷《左传》记事下限（前468）与勾践卒（前465，见 docs/kaoding_wudu.md §4.1）
LNG_MIN, LNG_MAX = 105.0, 122.0
LAT_MIN, LAT_MAX = 29.5, 38.5

REL_TYPES = {"亲属-直系", "亲属-同辈", "婚姻", "君臣", "拥立", "敌对", "师友", "其他"}

# ---- 层标软检（v1.20 新增，结构式，非关键词式）----
# 判据：quote_type != "原文" 且 modern_note 不以【…】开头 → 警告，不阻断（exit 仍为 0）。
# 「原文」是经传骨架本体，天然豁免——不应被要求加层标（避免误伤如 Q192 这类原文条目
# 只是行文中带有"话术"一类词、被关键词式误抓）。
# 结构式判据本身不区分 quote_type 档位；是否真的体检某一档，由下表 SOFT_CHECK_TIERS
# 逐档开关控制，见 conventions.md §7「软检分档启用与修缮同步」方针——
# 只有该档位的历史缺口已核定并有序推进修缮时才开启，避免开一档、警出一片无人认领的旧账。
CAVEAT_RE = re.compile(r"^【[^】]+】")
SOFT_CHECK_TIERS = {
    # quote_type 档位: 是否纳入本轮软检
    "诗歌": True,       # v1.20 首批启用（r22 收尾，P 层舆论材料最易被误当史实）
    "经义异闻": True,   # v1.20 首批启用（r22 收尾，T 层寓言/说理材料同上）
    "言论": False,      # 暂缓——留待后续批次核订、逐档开启
    "后出叙事": False,  # 暂缓
    "评论": True,       # v1.21 开启（r23 fix23，4 条缺口已随件清零，见 conventions.md §7）
    # "原文" 不列入本表：结构式判据已在上方直接豁免，不受此开关影响
}

warnings = []


def warn(msg):
    warnings.append(msg)

ID_PATTERNS = {
    "events": re.compile(r"^E\d{3}[A-Z]?$"),
    "people": re.compile(r"^P_[A-Z]+$"),
    "places": re.compile(r"^L_[A-Z]+$"),
    "relations": re.compile(r"^R\d{3}$"),
    # Z=左传 S=史记 G=国语 A=考古；P=诗经、B=现代研究为旧库沿用前缀；Y=公羊传、L=穀梁传（v1.9 启用）；
    # T=先秦诸子及秦汉说部层（v1.10 启用，分层纪律见 conventions.md §2）
    # 注：sources 的 L### 与 places 的 L_XXX 正则相异（前者 L+三位数字、后者 L+下划线+字母），命名空间不冲突
    "sources": re.compile(r"^[ZSGAPBYLT]\d{3}$"),
    "passages": re.compile(r"^Q\d{3}[A-Z]?$"),
    "background": re.compile(r"^BKG\d{3}$"),
    "archaeology": re.compile(r"^ARC\d{3}$"),
}

errors = []


def err(msg):
    errors.append(msg)


def load(name):
    path = CSV_DIR / f"{name}.csv"
    if not path.exists():
        err(f"{name}.csv 不存在于 {CSV_DIR}")
        return []
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def check_ids(name, rows):
    """ID 唯一性 + 前缀规范。返回 ID 集合。"""
    pattern = ID_PATTERNS[name]
    seen = set()
    for i, row in enumerate(rows, start=2):
        rid = (row.get("id") or "").strip()
        if not rid:
            err(f"{name}.csv 第{i}行：缺少 id")
            continue
        if not pattern.match(rid):
            err(f"{name}.csv 第{i}行：id '{rid}' 不符合规范 {pattern.pattern}")
        if rid in seen:
            err(f"{name}.csv 第{i}行：id '{rid}' 重复")
        seen.add(rid)
    return seen


def check_ref(table, line, field, value, valid_ids, target):
    """单值引用检查（允许空）。"""
    if value and value not in valid_ids:
        err(f"{table} 第{line}行：{field} '{value}' 在 {target} 中不存在")


def check_multi_ref(table, line, field, value, valid_ids, target):
    """分号分隔的多值引用检查（允许空）。"""
    if not value:
        return
    for ref in value.split(";"):
        ref = ref.strip()
        if ref and ref not in valid_ids:
            err(f"{table} 第{line}行：{field} 含 '{ref}'，在 {target} 中不存在")


def check_enum(table, line, field, value, allowed, required=True):
    if not value:
        if required:
            err(f"{table} 第{line}行：{field} 为空（必填）")
        return
    if value not in allowed:
        shown = ",".join(sorted(allowed))
        err(f"{table} 第{line}行：{field} '{value}' 不在合法枚举 {{{shown}}} 中")


def check_no_writing_columns():
    """护栏：公开数据不得出现写作向列（以 novel 开头的列名）。"""
    for path in sorted(CSV_DIR.glob("*.csv")):
        with path.open(encoding="utf-8-sig", newline="") as f:
            header = next(csv.reader(f), [])
        for col in header:
            if col.strip().lower().startswith("novel"):
                err(f"{path.name}: 表头含写作向列 '{col}'（以 novel 开头）——"
                    f"该类列不得进入公开数据，应存 private/writing_notes.csv（conventions v1.4）")


def main():
    check_no_writing_columns()
    tables = {
        name: load(name)
        for name in ("sources", "people", "places", "events",
                     "event_people", "passages", "background", "archaeology",
                     "relations")
    }
    if errors:
        report()
        return 1

    ids = {
        name: check_ids(name, rows)
        for name, rows in tables.items()
        if name != "event_people"  # 关系表无自身 id
    }

    # ---- events ----
    sort_keys_by_year = {}
    for i, row in enumerate(tables["events"], start=2):
        sk = (row.get("sort_key") or "").strip()
        if sk:
            if not re.match(r"^-?\d+$", sk):
                err(f"events.csv 第{i}行：sort_key '{sk}' 必须是整数或留空")
            else:
                year = (row.get("year_bce") or "").strip()
                seen_sk = sort_keys_by_year.setdefault(year, {})
                if sk in seen_sk:
                    err(f"events.csv 第{i}行：sort_key {sk} 与第{seen_sk[sk]}行在同年 {year} 内重复")
                seen_sk[sk] = i
        check_ref("events.csv", i, "place_id", (row.get("place_id") or "").strip(),
                  ids["places"], "places")
        check_multi_ref("events.csv", i, "source_ids", (row.get("source_ids") or "").strip(),
                        ids["sources"], "sources")
        check_enum("events.csv", i, "category", (row.get("category") or "").strip(), CATEGORIES)
        check_enum("events.csv", i, "importance", (row.get("importance") or "").strip(), IMPORTANCE)
        check_enum("events.csv", i, "reliability", (row.get("reliability") or "").strip(), HML)
        year = (row.get("year_bce") or "").strip()
        if not re.match(r"^-\d+$", year):
            err(f"events.csv 第{i}行：year_bce '{year}' 必须是负整数（公元前，如 -694）")
        elif not (YEAR_MIN <= int(year) <= YEAR_MAX):
            err(f"events.csv 第{i}行：year_bce {year} 超出范围 [{YEAR_MIN}, {YEAR_MAX}]")

    # ---- places ----
    for i, row in enumerate(tables["places"], start=2):
        check_enum("places.csv", i, "certainty", (row.get("certainty") or "").strip(), HML)
        check_enum("places.csv", i, "coord_certainty",
                   (row.get("coord_certainty") or "").strip(), HML, required=False)
        check_multi_ref("places.csv", i, "source_ids", (row.get("source_ids") or "").strip(),
                        ids["sources"], "sources")
        lat, lng = (row.get("lat") or "").strip(), (row.get("lng") or "").strip()
        for field, val, lo, hi in (("lat", lat, LAT_MIN, LAT_MAX),
                                   ("lng", lng, LNG_MIN, LNG_MAX)):
            if not val:
                continue
            try:
                num = float(val)
            except ValueError:
                err(f"places.csv 第{i}行：{field} '{val}' 不是数字")
                continue
            if not (lo <= num <= hi):
                err(f"places.csv 第{i}行：{field} {num} 超出投影覆盖范围 [{lo}, {hi}]")
        if bool(lat) != bool(lng):
            err(f"places.csv 第{i}行：lat/lng 必须同时填写或同时留空")

    # ---- event_people ----
    for i, row in enumerate(tables["event_people"], start=2):
        eid = (row.get("event_id") or "").strip()
        pid = (row.get("person_id") or "").strip()
        if not eid or not pid:
            err(f"event_people.csv 第{i}行：event_id/person_id 不得为空")
        check_ref("event_people.csv", i, "event_id", eid, ids["events"], "events")
        check_ref("event_people.csv", i, "person_id", pid, ids["people"], "people")
        check_enum("event_people.csv", i, "presence", (row.get("presence") or "").strip(),
                   PRESENCE, required=False)

    # ---- passages ----
    for i, row in enumerate(tables["passages"], start=2):
        sid = (row.get("source_id") or "").strip()
        if not sid:
            err(f"passages.csv 第{i}行：source_id 不得为空")
        check_ref("passages.csv", i, "source_id", sid, ids["sources"], "sources")
        check_ref("passages.csv", i, "event_id", (row.get("event_id") or "").strip(),
                  ids["events"], "events")
        qtype = (row.get("quote_type") or "").strip()
        if qtype != "原文" and SOFT_CHECK_TIERS.get(qtype, False):
            note = row.get("modern_note") or ""
            if not CAVEAT_RE.match(note):
                warn(f"passages.csv 第{i}行：id={row.get('id')} quote_type='{qtype}' 但 "
                     f"modern_note 未以【层标】开头（结构式软检，不阻断，见 conventions.md §7）")

    # ---- people ----
    for i, row in enumerate(tables["people"], start=2):
        flag = (row.get("is_protagonist") or "").strip()
        if flag not in {"", "0", "1"}:
            err(f"people.csv 第{i}行：is_protagonist '{flag}' 必须是 0 或 1（或留空）")
        for field in ("birth_year_bce", "death_year_bce"):
            val = (row.get(field) or "").strip()
            if not val:
                continue
            if not re.match(r"^-\d+$", val):
                err(f"people.csv 第{i}行：{field} '{val}' 必须是负整数")
            elif not (YEAR_MIN <= int(val) <= YEAR_MAX):
                err(f"people.csv 第{i}行：{field} {val} 超出范围 [{YEAR_MIN}, {YEAR_MAX}]")
        # xing/shi/ming/zi（姓氏名字，fix7）：宽校验，不设枚举——非空时须为合规字符串
        for field in ("xing", "shi", "ming", "zi"):
            val = (row.get(field) or "").strip()
            if not val:
                continue
            if val.upper() in {"NULL", "N/A", "NA"}:
                err(f"people.csv 第{i}行：{field} 不得写 '{val}'，留空理由请写入 notes、字段本身留空字符串（conventions §6）")
            if "," in val:
                err(f"people.csv 第{i}行：{field} 含 ASCII 逗号 '{val}'，与 CSV 分隔符冲突")

    # ---- relations ----
    seen_rel = {}
    for i, row in enumerate(tables["relations"], start=2):
        pa = (row.get("person_a") or "").strip()
        pb = (row.get("person_b") or "").strip()
        check_ref("relations.csv", i, "person_a", pa, ids["people"], "people")
        check_ref("relations.csv", i, "person_b", pb, ids["people"], "people")
        if not pa or not pb:
            err(f"relations.csv 第{i}行：person_a/person_b 不得为空")
        if pa and pa == pb:
            err(f"relations.csv 第{i}行：person_a 与 person_b 相同")
        check_enum("relations.csv", i, "rel_type", (row.get("rel_type") or "").strip(), REL_TYPES)
        check_enum("relations.csv", i, "reliability", (row.get("reliability") or "").strip(), HML)
        if not (row.get("rel_label") or "").strip():
            err(f"relations.csv 第{i}行：rel_label 不得为空")
        key = (frozenset((pa, pb)), (row.get("rel_type") or "").strip())
        if key in seen_rel:
            err(f"relations.csv 第{i}行：与第{seen_rel[key]}行同对同类重复（含反向重复）")
        seen_rel[key] = i

    # ---- background / archaeology ----
    for name in ("background", "archaeology"):
        for i, row in enumerate(tables[name], start=2):
            check_enum(f"{name}.csv", i, "certainty", (row.get("certainty") or "").strip(), HML)
            check_multi_ref(f"{name}.csv", i, "source_ids",
                            (row.get("source_ids") or "").strip(), ids["sources"], "sources")

    report()
    return 1 if errors else 0


def report():
    if errors:
        print(f"校验失败，共 {len(errors)} 处问题：", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
    else:
        print("OK：全部校验通过")
    if warnings:
        print(f"\n软检警告（不阻断，共 {len(warnings)} 条）：", file=sys.stderr)
        for w in warnings:
            print(f"  ! {w}", file=sys.stderr)


if __name__ == "__main__":
    sys.exit(main())
