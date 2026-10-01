# -*- coding: utf-8 -*-
"""把 data/csv/*.csv 转成 site/data/ 下同名 .json，并生成 meta.json。

用法（在仓库根目录）：
    python tools/csv_to_json.py

- 输出 UTF-8 JSON，每表为「数组 of 对象」。
- 纯数字字段自动转 int/float，空字符串转 null。
- site/data/ 下的文件是生成物，禁止手改（见 docs/conventions.md）。
- 本脚本于其末 import tools/build_kaodui_index.py 之抽取器，以**同一次抽取之果**
  另写出 site/data/kaodui.json 与 site/data/kaodui_notice.json，并于 meta.json 之
  tables 增一键 kaodui（r54-5；team/round54_prompts.md §三 裁七十七取甲-ii）。
  ★ site/data/ 之**写者进程仍只本文件一个**——抽取器一份、在原处，本文件只调其果，
  不另抽一次（CLAUDE.md 红线二与 docs/conventions.md 之数据流一字不须改）。
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

    # ---------------------------------------------------------------- 考据索引之台账
    # r54-5（裁七十七取甲-ii）：于其末 import 同一抽取器，一跑即出全部生成物，无忘跑之窗。
    # ★ 只改其输出之路，**不改其所抽之物**——build_records()／extract_*／STATUS_PATTERNS 一字未动。
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import build_kaodui_index as kaodui  # noqa: E402（置于此处，非置于文件头：其料须俟诸表写毕）

    kd_records, kd_stats = kaodui.build_records()
    for fname, payload in (
        ("kaodui.json", kaodui.public_records(kd_records)),
        ("kaodui_notice.json", kaodui.public_notice(kd_records, kd_stats)),
    ):
        with (OUT_DIR / fname).open("w", encoding="utf-8", newline="\n") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
            f.write("\n")
    tables["kaodui"] = len(kd_records)

    # ★ md 与 json **同源而不同跑**：md 由 tools/build_kaodui_index.py 写。
    #   故 data/csv/ 一改而只跑本脚本，docs/kaodui_index.md 即落后——**此系只报，不是门**；
    #   其当否升为红（宜入 tools/validate.py）系 r54-5 之候裁事，见 docs/delivery_skipper_r54.md。
    md_path = ROOT / "docs" / "kaodui_index.md"
    if md_path.exists():
        with md_path.open(encoding="utf-8", newline="") as f:
            cur_md = f.read().replace("\r\n", "\n")
        synced = (cur_md == kaodui.render(kd_records, kd_stats))
    else:
        synced = False
    print(f"kaodui -> site/data/kaodui.json（{len(kd_records)} 条）＋ kaodui_notice.json"
          + ("；docs/kaodui_index.md 同步" if synced
             else "；★ docs/kaodui_index.md 与重生成之果不符——请跑 python tools/build_kaodui_index.py"))

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
