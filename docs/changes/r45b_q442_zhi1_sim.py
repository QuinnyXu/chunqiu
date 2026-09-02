# -*- coding: utf-8 -*-
"""fix44d 合并模拟（沙盒，绝不触仓库）。

用法（仓库根）：
    python data/incoming/fix44d/sim_fix44d.py

作用：把 data/incoming/fix44d/fixes_*.csv 整行替换进 data/csv/ 之副本（沙盒），
逐项断言后在沙盒内跑 tools/validate.py 与 tools/csv_to_json.py。
仓库任何一行都不改动。全部通过 exit 0，有一条 FAIL 即 exit 1。
"""
import csv
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8", errors="replace")

csv.field_size_limit(10 ** 9)

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent.parent          # data/incoming/fix44d -> 仓库根
CSV_DIR = ROOT / "data" / "csv"

BASELINE = {                               # conventions v1.39 基线（r44d 合入后）
    "sources": 179, "places": 93, "passages": 440, "events": 237,
    "people": 153, "event_people": 614, "relations": 282,
    "archaeology": 8, "background": 11,
}

OLD_PREFIX = "蔡哀侯娶妻於陳，息侯亦娶妻於陳，是息媯。"
NEW_PREFIX = "郶（蔡）哀侯取妻於陳，賽＝（息）侯亦取妻於陳，是賽＝爲＝（息媯）。"
TAIL = ("息媯將歸于息，過蔡，蔡哀侯命止之，曰：「以同姓之故，必入。」息媯乃入于蔡，"
        "蔡哀侯妻之。息侯弗訓（順），乃使人于楚文王曰：「君來伐我，我將求救於蔡，君焉敗之。」")

CAVEAT = re.compile(r"^【[^】]+】")

_pass = 0
_fail = 0


def ok(name, cond, detail=""):
    global _pass, _fail
    if cond:
        _pass += 1
        print("PASS", name, detail)
    else:
        _fail += 1
        print("FAIL", name, detail)


def read(path):
    with open(path, encoding="utf-8", newline="") as f:
        r = csv.DictReader(f)
        return r.fieldnames, list(r)


def main():
    # ---- 0. 合入前九表基线 ----
    base = {}
    for t in BASELINE:
        h, rows = read(CSV_DIR / (t + ".csv"))
        base[t] = (h, rows)
        ok("基线 %s=%d" % (t, BASELINE[t]), len(rows) == BASELINE[t], "实测 %d" % len(rows))

    # ---- 1. 增量文件之形 ----
    fixes = {"passages": HERE / "fixes_passages.csv", "sources": HERE / "fixes_sources.csv"}
    expect_ids = {"passages": {"Q442"}, "sources": {"J001"}}
    newrows = {}
    for t, p in fixes.items():
        ok("增量文件存在 %s" % p.name, p.exists())
        h, rows = read(p)
        ok("%s 表头与目标表一致" % p.name, h == base[t][0])
        ids = set(r["id"] for r in rows)
        ok("%s id 集合符合预期" % p.name, ids == expect_ids[t], str(sorted(ids)))
        cur = set(r["id"] for r in base[t][1])
        ok("%s 全数命中现行行（无新增行）" % p.name, ids <= cur)
        ok("%s 无重复 id" % p.name, len(ids) == len(rows))
        newrows[t] = dict((r["id"], r) for r in rows)

    # ---- 2. 逐字段断言 ----
    oldq = dict((r["id"], r) for r in base["passages"][1])["Q442"]
    newq = newrows["passages"]["Q442"]
    for col in ("id", "event_id", "source_id", "quote_type"):
        ok("Q442.%s 未动" % col, oldq[col] == newq[col], repr(newq[col]))
    ok("Q442.quote_original 已改（本件唯一之 quote_original 改动）",
       oldq["quote_original"] != newq["quote_original"])
    ok("Q442.quote_original 全文与预期一致", newq["quote_original"] == NEW_PREFIX + TAIL)
    ok("Q442.quote_original 首句已录三「＝」", newq["quote_original"].count("＝") == 3)
    for frag in ("郶（蔡）", "賽＝（息）侯", "是賽＝爲＝（息媯）", "訓（順）"):
        ok("Q442.quote_original 含 %s" % frag, frag in newq["quote_original"])
    ok("Q442.quote_original 已无「娶」（甲档回改随全句执行）", "娶" not in newq["quote_original"])
    ok("Q442.quote_original 不录注释号〔二〕", "〔二〕" not in newq["quote_original"])
    ok("Q442.quote_original 不录简号【】", "【" not in newq["quote_original"])
    ok("Q442 首句以下一字未动（合成文之界）",
       newq["quote_original"][len(NEW_PREFIX):] == oldq["quote_original"][len(OLD_PREFIX):])
    ok("Q442 旧首句已不存", OLD_PREFIX not in newq["quote_original"])
    ok("Q442.modern_note 纯追加",
       newq["modern_note"].startswith(oldq["modern_note"])
       and len(newq["modern_note"]) > len(oldq["modern_note"]),
       "+%d" % (len(newq["modern_note"]) - len(oldq["modern_note"])))
    ok("Q442.modern_note 含 r44d 节名", "【★r44d 支①执行·就地注记" in newq["modern_note"])
    ok("Q442.modern_note 记中间态之解除", "因本轮「＝」归属核定而解除" in newq["modern_note"])
    ok("Q442.modern_note 保留 r44c 原文（不抹平）", "本轮**不录「＝」**" in newq["modern_note"])
    ok("Q442.modern_note 保留旧「未告，不代填」原文（不抹平）",
       "释文正文所在之页站长未告，不代填" in newq["modern_note"])
    ok("Q442.modern_note 著录释文页 147", "第五章释文在页 147" in newq["modern_note"])
    m = CAVEAT.match(newq["modern_note"])
    ok("Q442 层标仍可被 CAVEAT_RE 取出", bool(m))
    ok("Q442 层标内不含「【校】」全形（v1.38 之禁未破）",
       bool(m) and "【校】" not in m.group(0))

    oldj = dict((r["id"], r) for r in base["sources"][1])["J001"]
    newj = newrows["sources"]["J001"]
    for col in ("id", "title", "work", "section", "category", "source_type", "url"):
        ok("J001.%s 未动" % col, oldj[col] == newj[col])
    ok("J001.notes 纯追加",
       newj["notes"].startswith(oldj["notes"]) and len(newj["notes"]) > len(oldj["notes"]),
       "+%d" % (len(newj["notes"]) - len(oldj["notes"])))
    ok("J001.notes 含 r44d 节名", "【★r44d 就地注记" in newj["notes"])
    ok("J001.notes 保留旧「一字不动」原文（不抹平）",
       "`quote_original` 一字不动" in newj["notes"])

    # ---- 3. 沙盒合入 ----
    sand = Path(tempfile.mkdtemp(prefix="sim_fix44d_"))
    (sand / "tools").mkdir(parents=True)
    (sand / "data" / "csv").mkdir(parents=True)
    (sand / "site" / "data").mkdir(parents=True)
    for f in ("validate.py", "csv_to_json.py"):
        shutil.copy2(ROOT / "tools" / f, sand / "tools" / f)
    for t in BASELINE:
        shutil.copy2(CSV_DIR / (t + ".csv"), sand / "data" / "csv" / (t + ".csv"))

    for t, repl in newrows.items():
        h, rows = read(sand / "data" / "csv" / (t + ".csv"))
        hit = 0
        out = []
        for r in rows:
            if r["id"] in repl:
                out.append(repl[r["id"]])
                hit += 1
            else:
                out.append(r)
        ok("%s 替换命中 %d 行" % (t, len(repl)), hit == len(repl), "实测 %d" % hit)
        with open(sand / "data" / "csv" / (t + ".csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=h, lineterminator="\n")
            w.writeheader()
            for r in out:
                w.writerow(r)

    # ---- 4. 合入后 ----
    for t in BASELINE:
        h, rows = read(sand / "data" / "csv" / (t + ".csv"))
        ok("合入后 %s=%d（全等）" % (t, BASELINE[t]), len(rows) == BASELINE[t], "实测 %d" % len(rows))

    h, prows = read(sand / "data" / "csv" / "passages.csv")
    P = dict((r["id"], r) for r in prows)
    ok("CSV 往返一字不差·quote_original（「＝」无须转义）",
       P["Q442"]["quote_original"] == NEW_PREFIX + TAIL)
    ok("CSV 往返一字不差·modern_note", P["Q442"]["modern_note"] == newq["modern_note"])
    untouched = [r for r in prows if r["id"] != "Q442"]
    oldother = [r for r in base["passages"][1] if r["id"] != "Q442"]
    ok("passages 其余 439 行一字未动", untouched == oldother, "%d 行" % len(untouched))
    h2, srows = read(sand / "data" / "csv" / "sources.csv")
    ok("sources 其余 178 行一字未动",
       [r for r in srows if r["id"] != "J001"] == [r for r in base["sources"][1] if r["id"] != "J001"])
    for t in ("places", "events", "people", "event_people", "relations", "archaeology", "background"):
        ok("%s 整表未动" % t, read(sand / "data" / "csv" / (t + ".csv"))[1] == base[t][1])

    # ---- 5. 全库「＝」与括注之分布 ----
    eq_rows = [r["id"] for r in prows if "＝" in r["quote_original"]]
    ok("quote_original 含「＝」者唯 Q442 一行（首例）", eq_rows == ["Q442"], str(eq_rows))
    par_rows = sorted(r["id"] for r in prows if "（" in r["quote_original"])
    ok("quote_original 含全角括注者三行（Q167/Q442/Q448）",
       par_rows == ["Q167", "Q442", "Q448"], str(par_rows))

    # ---- 6. 通行字转换规则之探针（供 Vision 任务 9；只测规则，不改数据）----
    rule = re.compile(r"(?:[㐀-鿿]＝)*[㐀-鿿]?（([^）]+)）")

    def conv(s):
        return rule.sub(lambda mm: mm.group(1), s)

    ok("规则施于 Q442 首句得通行字",
       conv(P["Q442"]["quote_original"]).startswith("蔡哀侯取妻於陳，息侯亦取妻於陳，是息媯。"),
       conv(P["Q442"]["quote_original"])[:24])
    ok("规则施于 Q442「弗訓（順）」得「弗順」",
       "息侯弗順，乃使人于楚文王" in conv(P["Q442"]["quote_original"]))
    ok("规则施于 Q448 得通行字",
       conv(P["Q448"]["quote_original"]).startswith("立六年，秦公率師與惠公戰于韓"),
       conv(P["Q448"]["quote_original"])[:16])
    naive = re.compile(r"[㐀-鿿]?（([^）]+)）")
    ok("反证·任务书所述之朴素式（一字＋括注）于双叠「賽＝爲＝（息媯）」不成立，留下游离「＝」",
       "＝" in naive.sub(lambda mm: mm.group(1), P["Q442"]["quote_original"]),
       naive.sub(lambda mm: mm.group(1), P["Q442"]["quote_original"])[:24])
    ok("反证·规则若不限域则破坏 Q167「悼子（卓子）」（传世层之异名括注非丙档括注式）",
       "悼子" not in conv(P["Q167"]["quote_original"]) and "卓子" in conv(P["Q167"]["quote_original"]),
       conv(P["Q167"]["quote_original"]))

    # ---- 7. 沙盒内质量门 ----
    env = dict(os.environ, PYTHONIOENCODING="utf-8")
    r1 = subprocess.run([sys.executable, str(sand / "tools" / "validate.py")],
                        capture_output=True, text=True, encoding="utf-8",
                        cwd=str(sand), env=env)
    tail1 = (r1.stdout or "").strip().splitlines()
    ok("沙盒 validate.py exit 0", r1.returncode == 0, tail1[-1] if tail1 else (r1.stderr or "")[:200])
    ok("沙盒 validate.py 输出 OK", "OK" in (r1.stdout or ""))
    r2 = subprocess.run([sys.executable, str(sand / "tools" / "csv_to_json.py")],
                        capture_output=True, text=True, encoding="utf-8",
                        cwd=str(sand), env=env)
    ok("沙盒 csv_to_json.py exit 0", r2.returncode == 0, (r2.stderr or "")[:200])
    jp = json.loads((sand / "site" / "data" / "passages.json").read_text(encoding="utf-8"))
    J = dict((r["id"], r) for r in jp)
    ok("JSON passages 行数 440", len(jp) == 440, str(len(jp)))
    ok("JSON 回读 Q442.quote_original 与 CSV 一字不差",
       J["Q442"]["quote_original"] == NEW_PREFIX + TAIL)
    ok("JSON 回读 Q442.modern_note 与 CSV 一字不差", J["Q442"]["modern_note"] == newq["modern_note"])
    js = json.loads((sand / "site" / "data" / "sources.json").read_text(encoding="utf-8"))
    ok("JSON 回读 J001.notes 与 CSV 一字不差",
       dict((r["id"], r) for r in js)["J001"]["notes"] == newj["notes"])
    meta = json.loads((sand / "site" / "data" / "meta.json").read_text(encoding="utf-8"))
    ok("meta.tables 九表与基线全等", meta["tables"] == BASELINE,
       json.dumps(meta["tables"], ensure_ascii=False))

    shutil.rmtree(sand, ignore_errors=True)
    print("\n== %d PASS / %d FAIL ==" % (_pass, _fail))
    return 1 if _fail else 0


if __name__ == "__main__":
    sys.exit(main())
