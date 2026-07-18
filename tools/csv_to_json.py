# -*- coding: utf-8 -*-
"""把 data/csv/*.csv 转成 site/data/ 下同名 .json，并生成 meta.json。

用法（在仓库根目录）：
    python tools/csv_to_json.py

- 输出 UTF-8 JSON，每表为「数组 of 对象」。
- 纯数字字段自动转 int/float，空字符串转 null。
- site/data/ 下的文件是生成物，禁止手改（见 docs/conventions.md）。
"""
import csv
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

# Windows 控制台默认编码可能不是 UTF-8，中文输出会打印失败
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
CSV_DIR = ROOT / "data" / "csv"
OUT_DIR = ROOT / "site" / "data"

INT_RE = re.compile(r"^-?\d+$")
FLOAT_RE = re.compile(r"^-?\d+\.\d+$")


def convert(value):
    """空串→None；纯整数/小数字符串→数值；其余原样。"""
    if value is None or value == "":
        return None
    if INT_RE.match(value):
        return int(value)
    if FLOAT_RE.match(value):
        return float(value)
    return value


def main():
    csv_files = sorted(CSV_DIR.glob("*.csv"))
    if not csv_files:
        print(f"错误：{CSV_DIR} 下没有 CSV 文件", file=sys.stderr)
        return 1
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    tables = {}
    year_min = year_max = None
    for path in csv_files:
        with path.open(encoding="utf-8-sig", newline="") as f:
            rows = [
                {k: convert(v) for k, v in row.items()}
                for row in csv.DictReader(f)
            ]
        name = path.stem
        tables[name] = len(rows)
        out = OUT_DIR / f"{name}.json"
        with out.open("w", encoding="utf-8", newline="\n") as f:
            json.dump(rows, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"{name}.csv -> site/data/{name}.json ({len(rows)} 行)")
        if name == "events":
            years = [r["year_bce"] for r in rows if isinstance(r.get("year_bce"), int)]
            if years:
                year_min, year_max = min(years), max(years)

    meta = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "tables": tables,
        "year_range_bce": {"min": year_min, "max": year_max},
    }
    with (OUT_DIR / "meta.json").open("w", encoding="utf-8", newline="\n") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"meta.json 已生成（{len(tables)} 张表，年份 {year_min}..{year_max}）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
