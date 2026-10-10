# -*- coding: utf-8 -*-
"""把 data/csv/*.csv 转成 site/data/ 下同名 .json 与 meta.json，
并写出 docs/kaodui_index.md（考据核对台账索引，r55-D 起）。

★【2026-10-01 EDT r55-D·本脚本之宣何以改（裁一百〇六 条件③、裁一百一十一 取甲）】
  原宣（r9 立至 2026-10-01，照留不抹）：「把 data/csv/*.csv 转成 site/data/ 下同名 .json，
  并生成 meta.json。」——**其语自立至今日为真**，今所以改者：
  本脚本之写出之面**已逾 site/data/ 一处**，兼及 docs/kaodui_index.md（docs/ 之下）。
  · **其所据**：`team/round54_prompts.md` §九 **裁一百〇六**「`csv_to_json.py` 可否写 `docs/`：
    准，惟三条件」，并 §十 **裁一百一十一**「取甲：`build_kaodui_index.py` 去其写权，定为被调之库」。
  · **其由**（裁一百〇六 原文）：界之事之判准是「**将来谁会被这个界骗**」——其人二：
    读 `docs/` 者（以为其下皆人手之文）、改 `build_kaodui_index.py` 者（以为自己是那文件之唯一写手）。
    故三条件俱落在那两处留痕：① md 头之句改书其新生成者；② 抽取器之地位同件定为被调之库；
    ③ **本宣随之改并书其由**（即本段）。**三者今俱落。**
  · ★ **此非「生成物勿手改」之例外，而是其面之扩**：`docs/kaodui_index.md` 自 r52 即生成物
    （其头自书「勿手改」），本件所改者只「其写者是谁」一事，**不改其为生成物之身份**。
  · ★ **单一写手仍一个**：本脚本是 docs/kaodui_index.md（及 site/data/verify_marks.json）之唯一写手
    〔r60-J 前为 site/data/kaodui.json、kaodui_notice.json 与 docs/kaodui_index.md「三物」〕，抽取器只供其料与其文（CLAUDE.md 红线二与
    docs/conventions.md 之数据流，其「data/csv/ → csv_to_json.py → site/data/」一支一字不须改）。

用法（在仓库根目录）：
    python tools/csv_to_json.py

- 输出 UTF-8 JSON，每表为「数组 of 对象」。
- 纯数字字段自动转 int/float，空字符串转 null。
- site/data/ 下的文件是生成物，禁止手改（见 docs/conventions.md）。
- 本脚本于其末 import tools/build_kaodui_index.py 之抽取器，以**同一次抽取之果**
  写出 site/data/verify_marks.json 与 docs/kaodui_index.md。
  〔r60-J 注：r54-5 起本脚本另写 site/data/kaodui.json、kaodui_notice.json 并于 meta.tables 增键 kaodui
  （team/round54_prompts.md §三 裁七十七取甲-ii）；r60-I 去考据索引屏后，r60-J（裁一百九十六 二、三①）去其写与键。〕
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
    # 〔r60-J（裁一百九十六 二、三①）：此处原写 site/data/kaodui.json、kaodui_notice.json 并增 tables["kaodui"]，
    #   考据索引屏并其路由已于 r60-I 去，二物无读者，故去其写与 meta 键；kd_records 仍供下文 verify_marks 与 md。〕

    # ---------------------------------------------------------------- 核对记号（第四物）
    # r60-E（裁一百九十五 取甲；裁二百〇一 改数组形）：以**同一次抽取之果 kd_records** 另出
    # site/data/verify_marks.json——★ 不另实现抽取，不改 build_kaodui_index.py 一字，只就 kd_records 现有字段重排。
    # 形：顶层**数组**，一记号一元：{table,row_id,col,offset,status:[{name,negated}]}。
    #   ★ 顶层必为数组：prod_data_invariants 之 rowsOf 以 Array.isArray／.length 取行，本仓入 meta.tables 之件无一例外为数组；
    #     故说明不放文件内（任何哨兵元或包装对象都会使其破形或使元数失真），只书于此注与 conventions §2。
    #   ★ 一元＝一个 kd_record（偏离裁二百〇一三①字面之 state／neg 单值：一记录常有多个状态——601 个状态项分布于
    #     316 个有状态之记录，另 178 条无状态词；摊成单值则元数不复为 494，与裁文三⑥相抵）。
    #   ★ 一险（裁二百〇一三⑥）：本文件之元数 494 与 kaodui.json 之元数 494 一字不差，**非巧合**——
    #     一记号即一条 kaodui 记录，本是同一批物之二形；日后二数同，引时勿混为二物之相符。
    vm_payload = [
        {
            "table": r["table"],
            "row_id": r["row_id"],
            "col": r["col"],
            "offset": r["offset"],
            "status": [{"name": n, "negated": bool(g)} for n, g in r["status"]],
        }
        for r in kd_records
    ]
    with (OUT_DIR / "verify_marks.json").open("w", encoding="utf-8", newline="\n") as f:
        json.dump(vm_payload, f, ensure_ascii=False, indent=2)
        f.write("\n")
    tables["verify_marks"] = len(vm_payload)  # 数之义——记号数：verify_marks.json 之元数，一记号一元（非实体数、非行数）
    print(f"verify_marks -> site/data/verify_marks.json（{len(vm_payload)} 记号，同一次抽取之第四物）")

    # ---------------------------------------------------------------- 考据索引之 md
    # ★ 2026-10-01 EDT r55-D（裁一百〇六 三条件、裁一百一十一 取甲）：
    #   docs/kaodui_index.md 之**写者自此是本脚本**；抽取器已去写权（被调之库）。
    #   〔原码与原注照留以见其改（r54-5 所落，2026-09-28；**一字不删**）：
    #         # ★ md 与 json **同源而不同跑**：md 由 tools/build_kaodui_index.py 写。
    #         #   故 data/csv/ 一改而只跑本脚本，docs/kaodui_index.md 即落后——**此系只报，不是门**；
    #         #   其当否升为红（宜入 tools/validate.py）系 r54-5 之候裁事，见 docs/delivery_skipper_r54.md。
    #         md_path = ROOT / "docs" / "kaodui_index.md"
    #         if md_path.exists():
    #             with md_path.open(encoding="utf-8", newline="") as f:
    #                 cur_md = f.read().replace("\r\n", "\n")
    #             synced = (cur_md == kaodui.render(kd_records, kd_stats))
    #         else:
    #             synced = False
    #         print(f"kaodui -> site/data/kaodui.json（{len(kd_records)} 条）＋ kaodui_notice.json"
    #               + ("；docs/kaodui_index.md 同步" if synced
    #                  else "；★ docs/kaodui_index.md 与重生成之果不符——请跑 python tools/build_kaodui_index.py"))
    #   其「只报」之窗今已闭：md 与二 json **同源亦同跑**，一跑即出三物，
    #   既无「各跑一过」之窗，亦无可「落后」之物，故其只报之一行无所施而去之。
    #   ★ 其「当否升为红（宜入 tools/validate.py）」一问**随之消解**——
    #   **不是答了，是其所问之病不复存在**（无窗则无门可立）。〕
    md_path = Path(kaodui.MD_PATH)
    md_text = kaodui.render(kd_records, kd_stats)
    with md_path.open("w", encoding="utf-8", newline=chr(10)) as f:
        f.write(md_text)
    print(f"kaodui -> docs/kaodui_index.md（{len(kd_records)} 条；与 verify_marks.json 同源同跑，一跑二物）")

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
