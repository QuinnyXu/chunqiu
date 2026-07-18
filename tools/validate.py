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
    "薨卒", "丧葬", "外交", "内乱", "灾异", "礼俗", "其他",
}
HML = {"high", "medium", "low"}
IMPORTANCE = {"1", "2", "3"}
PRESENCE = {"亲至", "相关"}  # event_people.presence；空视同亲至
YEAR_MIN, YEAR_MAX = -800, -600
LNG_MIN, LNG_MAX = 110.0, 122.0
LAT_MIN, LAT_MAX = 32.0, 38.5

REL_TYPES = {"亲属-直系", "亲属-同辈", "婚姻", "君臣", "拥立", "敌对", "师友", "其他"}

ID_PATTERNS = {
    "events": re.compile(r"^E\d{3}[A-Z]?$"),
    "people": re.compile(r"^P_[A-Z]+$"),
    "places": re.compile(r"^L_[A-Z]+$"),
    "relations": re.compile(r"^R\d{3}$"),
    # Z=左传 S=史记 G=国语 A=考古；P=诗经、B=现代研究为旧库沿用前缀
    "sources": re.compile(r"^[ZSGAPB]\d{3}$"),
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


if __name__ == "__main__":
    sys.exit(main())
