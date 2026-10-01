#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""经纬春秋 · 资产指纹之门（r54-6 立，2026-09-26；★ `tools/stamp_assets.py` 之配门，**同件同落**）

===============================================================================
【立门之由（裁七十六；Skipper r54-2 §7 问二自陈）】
  甲-1（提交前戳）自带一个**账外之病**：**忘跑即静默失效**——`site/app.js`／`styles.css` 之文已改，
  而 `index.html` 之 `?v=` 仍是旧值，**读者在其窗内继续拿旧本**，而库内看不出任何异状。
  裁七十六遂命：**其门与戳同件同落，不得分期**。本门即此门，所量者一句：
  **`index.html` 之参，与其所引文件之实际内容哈希，相符否。**

【★ 其判取「红」——并其与 `prod_freshness.js` 之判之别（裁七十六与领队之四·二第 2 条明命书此）】
  本门判**红**（exit 1）。`tools/qa/prod_freshness.js` 判**只报不红**（其门无 exit 1）。
  〔**2026-10-01（EDT）r55-D 就地加注·上句之勘**（据 `team/round54_prompts.md` §十 **裁一百一十二**；
    ★ **上句原字照留，一字不删**——其系 r54-6 落笔之日（**2026-09-26**）之实，属判定史，照 `docs/conventions.md`
    §7 v1.29「判定史留原貌」／v1.41「事实错就地勘正加注」。）
    ★ **上句何日为真、何日起为假**：**自 2026-09-26（本门立）至 2026-09-29 为真**；
      **自 2026-09-30（r55-A 落笔之日；裁一百「甲案已落笔且已推上生产」）起为假。**
    ★ **今当读作**：**`prod_freshness.js` 之判自 r55-A 起分二**——
      ① **引法之指纹**（其 §三之一「有无版本参／哈希」）→ **判红，其门今有 exit 1**；
      ② **其余**（`max-age` 大于零等「窗之量」）→ **仍只报**，其由**乙案（缩 TTL）未落**，且其头在 Cloudflare 一侧。
    ★ **故下文「故其职在『记』不在『拦』」一语今只适其第二类**——其第一类已在「拦」。
      ★ **惟其分之所以然一字不须改**：「所量之物有无常态」仍是二判之分野；
      **变者是「窗有常态」只管得住②，而①（本仓自身引法之指纹）本无常态可言，故其亦当红。**
    ★ **同病之第二处已勘**：`docs/conventions.md` §9.3 之同语已于 **2026-09-30** 由领队就地加注（v1.48）。
      **二处今俱已勘**，故 `tools/qa/prod_freshness.js` 门头内之临时记号（「以本门之实为准」一句）**同件去之**
      （裁一百一十二③：**债清则记号须去，否则记号自己变成下一个假话**）。〕
  ★ **二判不相悖，其分在「所量之物有无常态」**：
    · `prod_freshness.js` 量**边缘所服之本与读者之窗之长**——**其窗有常态**：一次部署之后，
      边缘与浏览器俱可能在一段时间内持旧本；一律红则每逢部署后必红，**长红之门等于没有门**
      （裁五十五；r52「间歇红之门终将被当成噪音关掉」）。故其职在「记」不在「拦」。
    · **本门量本仓自身之一致**——`index.html` 之参与其所引之内容哈希相符否。
      **此事无常态可言：不符即是错**，无「须等它自己过去」之窗。故其判取红。
  ★ 后人见二门判法不同而疑其一者，请读此段：**不是一门宽一门严，是所量之物不同类。**
  ★ 并记裁八十之收窄：本门之红**不是假红，是真红**——文确已改而未重戳，**其红是它在做它该做的事**。
    真正之害在「**大家都知道为什么红、且都知道不必管**」之红（其教人忽略比假红更快）——
    故 r54-6 押在 `site/` 定稿之后方落笔，**不让一条新门的第一次亮相就是一次该被忽略的红**。

【本门之四节】
  §一 · **正验**——读 `site/index.html`，逐个本地 `.js`／`.css` 之引，验其参＝该文件之 SHA-256 前 8 位。
        ★ **不写死资产之名**：其名跑时自该文档求得（与戳者共用一个解析器，见 §〇之共用之辨）。
  §二 · **前提之量（★ 记，不入退出码）**——本门与戳者俱取**工作区之字节**；其与所部署者同字节之
        前提是 `.gitattributes` 之 `eol=lf`。跑时以 `git check-attr` 自核并印其果。
        ★ **其判取「记」不取「红」，并书其由**：此非「参与内容不符」，是**本门量法之前提**；
        且其破法（有人去掉 `eol=lf`）之下**本门与戳者同病、二者俱量不到**——
        **一个自己都量不到的事，不该由自己判红**。**明书于此，不掩。**
  §三 · **按类反证（裁四十九⑤、裁二十四；俱于临时副本上行之，本仓一字不动）**——四类（其条数随所引之物而定，跑时自数并印）：
        ① **改文不重戳**：改副本之一资产一字节而不重戳 → 须**恰报该一物**不符；
        ② **去其参**：去副本文档之一参 → 须报该物缺参；
        ③ **换其参一字**：改一位十六进制（含改成非法之形）→ 须报该物不符；
        ④ **新增一引**：副本内新立一物并于文档引之而不戳 → 须报**且指名该新物**。
        ★ ④ 即「不写死资产之名」与「解析器」二事之反证：门若写死名单，新物即量不着。
        ★ **任一条测不出，即抛错中止（exit 2）**——量不住而报绿，比红更坏。
  §四 · **自证不写死**——读本门与 `tools/stamp_assets.py` 之源码，证其内**无任何现行之 8 位哈希字面**；
        并配其反证（当场于源文之副本内注入一个，须命中）。

【跑法】
  python tools/qa/asset_stamp_gate.py
  python tools/qa/asset_stamp_gate.py --site <dir>   # 指向任意副本（本门之反证内部即用此）
  ★ 本门**无第三方依赖、无网络、无浏览器**（纯 Python 标准库）——其由：所量者是**仓内二物之一致**，
    不须取物于生产、不须真机渲染。故其虽居 `tools/qa/`，与该目录诸 node 门**不同类**
    （`docs/conventions.md` §9.3 已随本轮照实著录）。

【退出码】
  0 ＝ 逐引相符（§一 全绿；§二 之「记」不入退出码）
  1 ＝ **红**：有引之参与其所引之内容哈希不符（含缺参、参之形不合）。★ 其治：`python tools/stamp_assets.py`
  2 ＝ **本门自身之量不成立**：文档或资产缺、一个本地 `.js`／`.css` 也引不到、**反证失效**、
       或 `tools/stamp_assets.py` 引不到。**决不默然放行。**

【本门无重试（承裁五十七之式）】
  本门不取物于网，无可抖之处；其 exit 2 一律是**真错**，请读其文，勿复跑了事。
===============================================================================
"""

from __future__ import annotations

import argparse
import hashlib
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        _stream.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent.parent
SELF = Path(__file__).resolve()
STAMPER = ROOT / "tools" / "stamp_assets.py"

sys.path.insert(0, str(ROOT / "tools"))
try:
    import stamp_assets  # noqa: E402  ★ 共用其解析器，见门头
except Exception as e:  # pragma: no cover
    print("✗ 本门之量不成立：引不到 `tools/stamp_assets.py`（%s）" % e, file=sys.stderr)
    sys.exit(2)

HEX8 = re.compile(r"\b[0-9a-f]{8}\b")


class GateAbort(Exception):
    """本门自身之量不成立（exit 2）。"""


def sect(s: str) -> None:
    print("\n" + s)


def note(s: str) -> None:
    print("    " + s)


# ---------------------------------------------------------------- §一 正验之量具
def measure(site: Path, doc_name: str = "index.html") -> list[dict]:
    """量一过：返回逐引之记，每记带 `ok`／`why`。★ 其所期由本门**自算**（不取戳者所算之数）。

    ★ 共用之辨（明书其代价）：**解析**（哪些引须戳）取自 `stamp_assets.discover`——同一解析器，
      免二本相漂；**所期之哈希由本门自算一过**（`hashlib` 直读其字节），不引戳者之 `expect`。
      故戳者若把哈希算错，本门自会报之；★ 而**解析器若有病则二者同病**——此一处由 §三④ 责之。
    """
    doc = site / doc_name
    if not doc.is_file():
        raise GateAbort("文档不存在：%s" % doc)
    try:
        recs = stamp_assets.discover(doc.read_text(encoding="utf-8"), site, strict_query=False)
    except stamp_assets.StampError as e:
        raise GateAbort("解析文档之引时量不成立：%s" % e)
    if not recs:
        raise GateAbort("文档之内一个本地 .js／.css 也引不到——本门无所量，决不默然放行。")
    out = []
    for r in recs:
        actual = hashlib.sha256(r["file"].read_bytes()).hexdigest()[: stamp_assets.HASH_LEN]
        if not r["query"]:
            ok, why = False, "**缺参**（其引无 `?v=`）"
        elif not r["well_formed"]:
            ok, why = False, "其参之形不合（非 `v=<%d位十六进制>`）：%r" % (stamp_assets.HASH_LEN, r["query"])
        elif r["query"] != "v=" + actual:
            ok, why = False, "参 `%s` ≠ 实际内容哈希 `v=%s`" % (r["query"], actual)
        else:
            ok, why = True, "参与内容哈希相符（`v=%s`）" % actual
        out.append({"path": r["path"], "attr": r["attr"], "query": r["query"],
                    "actual": actual, "ok": ok, "why": why})
    return out


# ------------------------------------------------------------ §三 反证之副本工具
def clone_site(site: Path, dst: Path) -> Path:
    """把站点之文档与其所引之资产拷入临时目录（★ 只拷所需者，不搬 `site/data/` 之全量）。"""
    dst.mkdir(parents=True, exist_ok=True)
    shutil.copy2(site / "index.html", dst / "index.html")
    for r in stamp_assets.discover((site / "index.html").read_text(encoding="utf-8"),
                                   site, strict_query=False):
        tgt = dst / r["path"]
        tgt.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(r["file"], tgt)
    return dst


def reds(site: Path) -> list[dict]:
    return [m for m in measure(site) if not m["ok"]]


def snapshot(site: Path) -> dict:
    """取副本此刻之全部字节（文档与其所引者），以备复原。"""
    snap = {"index.html": (site / "index.html").read_bytes()}
    for m in measure(site):
        snap[m["path"]] = (site / m["path"]).read_bytes()
    return snap


def restore(site: Path, snap: dict) -> None:
    """★ 复原取**快照**，不取「重跑戳者」，其由（落笔当日实测所改，记此免后人复蹈）：

    反证③之一支把参改成**非法之形**（`v=zz…`）；而戳者遇非法之形**按其设计即停下上报**
    （`stamp_assets.discover(strict_query=True)` 抛 `StampError`）。**故以戳者复原者，
    到此一支必崩**——且其崩非病，是戳者在守「不自行覆一个意不明之参」那条。
    ★ 此处正是戳者与本门**判之分野**（门头 §〇 与 `stamp_assets.discover` 之 `strict_query`）
      在实地照见之一处：**门须判其为红，戳者须停**——二者不可共用一个复原之法。
    """
    for rel, data in snap.items():
        (site / rel).write_bytes(data)
    # 新增之物（反证④）不在快照内，须另去之，免残留而污下一条
    for extra in site.glob("qa_counterproof_*"):
        extra.unlink()


def counter_proofs(site: Path) -> int:
    """四类按类反证（其条数随所引之物而定）。任一条测不出即抛 GateAbort。返回所跑之条数。"""
    base = reds(site)
    if base:
        # 本仓此刻已红：反证仍可行（只须验「注入之错**另**被报出」），但须声明其底
        note("★ 本仓此刻已有 %d 项红——反证之底遂取「其红之集」，验注入之错**另**见于其集（其名逐一对位）"
             % len(base))
    base_names = {m["path"] for m in base}
    ran = 0

    with tempfile.TemporaryDirectory(prefix="stampgate_") as td:
        # 一个副本足矣：每条注入之后照快照复原（其法与其由见 `restore` 之注）
        c = clone_site(site, Path(td) / "c")
        stamp_assets.run(c, echo=lambda *a, **k: None)
        if reds(c):
            raise GateAbort("反证之底不成立：副本戳毕仍有红 %r" % [m["path"] for m in reds(c)])
        snap = snapshot(c)
        victims = [m["path"] for m in measure(c)]
        doc = c / "index.html"

        def hit_of(v: str):
            m = re.search(r'"' + re.escape(v) + r'\?v=([0-9a-f]+)"', doc.read_text(encoding="utf-8"))
            if not m:
                raise GateAbort("反证之底不成立：副本文档内寻不着 `%s?v=…` 之引" % v)
            return m

        # ① 改文不重戳 → 须恰报该一物
        for v in victims:
            f = c / v
            # 所加者即「一字」之实：一行注释（其内容不入判，判只问哈希之变）
            f.write_bytes(f.read_bytes() + "\n/* 反证①之一字 */\n".encode("utf-8"))
            got = {m["path"] for m in reds(c)}
            if got != {v}:
                raise GateAbort("反证①失效：改 %s 一字而不重戳，所期恰报其一，实得 %r" % (v, sorted(got)))
            note("① 改 `%s` 一字而不重戳 → 恰报其一见红 ✓" % v)
            restore(c, snap)
            ran += 1

        # ② 去其参 → 须恰报该一物，且其读法作「缺参」
        for v in victims:
            h = hit_of(v)
            txt = doc.read_text(encoding="utf-8")
            doc.write_text(txt[:h.start()] + '"' + v + '"' + txt[h.end():], encoding="utf-8")
            got = {m["path"] for m in reds(c)}
            if got != {v}:
                raise GateAbort("反证②失效：去 %s 之参，所期恰报其一，实得 %r" % (v, sorted(got)))
            whys = [m["why"] for m in reds(c)]
            if "缺参" not in "".join(whys):
                raise GateAbort("反证②之读法失效：其报未言「缺参」，实得 %r" % whys)
            note("② 去 `%s` 之参 → 恰报其一见红，且其读法作「缺参」 ✓" % v)
            restore(c, snap)
            ran += 1

        # ③ 换其参一字：一支其形仍合，一支其形不合
        for v, bad in ((victims[0], None), (victims[-1], "zz")):
            h = hit_of(v)
            old = h.group(1)
            if bad is None:
                new = ("1" if old[0] != "1" else "2") + old[1:]   # 改一位，仍合其形
                label = "改其参一位十六进制（其形仍合）"
            else:
                new = bad + old[2:]                               # 其形不合
                label = "改其参成非法之形（`v=zz…`）"
            txt = doc.read_text(encoding="utf-8")
            doc.write_text(txt[:h.start()] + '"%s?v=%s"' % (v, new) + txt[h.end():], encoding="utf-8")
            got = {m["path"] for m in reds(c)}
            if got != {v}:
                raise GateAbort("反证③失效：%s 于 %s，所期恰报其一，实得 %r" % (label, v, sorted(got)))
            note("③ %s（`%s`）→ 恰报其一见红 ✓" % (label, v))
            restore(c, snap)
            ran += 1

        # ④ 新增一引（★ 证「不写死资产之名」，并责共用之解析器）
        extra = "qa_counterproof_extra.css"
        (c / extra).write_text("/* 反证④之新物 */\n", encoding="utf-8")
        txt = doc.read_text(encoding="utf-8")
        anchor = "</head>"
        if anchor not in txt:
            raise GateAbort("反证④之底不成立：副本文档内无 `</head>`")
        doc.write_text(txt.replace(anchor, '<link rel="stylesheet" href="%s">\n%s' % (extra, anchor), 1),
                       encoding="utf-8")
        got = {m["path"] for m in reds(c)}
        if got != {extra}:
            raise GateAbort("反证④失效：新增一引而不戳，所期恰报 %r，实得 %r" % (extra, sorted(got)))
        note("④ 新增 `%s` 一引而不戳 → 恰报其一见红（★ 证资产之名非写死，且解析器随文档而动） ✓" % extra)
        restore(c, snap)
        ran += 1

        if reds(c):
            raise GateAbort("反证之收尾不成立：副本复原之后仍有红 %r" % [m["path"] for m in reds(c)])
        note("★ 收尾之自核：副本复原之后 %d 引俱绿（故上四类之红俱系注入所致，非残留）" % len(victims))

    if base_names:
        note("★ 反证之四类（共 %d 条）俱于**临时副本**上行之；本仓之红（%r）未因之而增减一项"
             % (ran, sorted(base_names)))
    return ran


# ------------------------------------------------------------ §四 自证不写死
def self_no_hardcode(actual_hashes: set[str]) -> None:
    for src in (SELF, STAMPER):
        txt = src.read_text(encoding="utf-8")
        hit = sorted({h for h in HEX8.findall(txt) if h in actual_hashes})
        if hit:
            raise GateAbort("%s 之源码内写死了现行哈希 %r——本门自此不再量得住「变」" % (src.name, hit))
        note("`%s` 源码内无任何现行哈希之 8 位字面 ✓（现行者 %d 个）" % (src.name, len(actual_hashes)))
    # 其反证：于副本之文内注入一个，须当场命中
    probe = next(iter(actual_hashes))
    if not [h for h in HEX8.findall("x = '%s'" % probe) if h in actual_hashes]:
        raise GateAbort("§四之反证失效：注入一个现行哈希 %r 而本法未命中" % probe)
    note("★ 其反证：当场注入一个现行哈希（`%s`）于同一量法，**命中** ✓" % probe)


# ------------------------------------------------------------ §二 前提之量（记）
def premise(site: Path, paths: list[str]) -> int:
    n = 0
    try:
        out = subprocess.run(["git", "check-attr", "eol", "--"] + ["site/" + p for p in paths],
                             cwd=str(ROOT), capture_output=True, text=True, timeout=20)
    except Exception as e:
        note("! 未验：`git check-attr` 跑不起来（%s）——★ 照实记为**未验**，不写成已知" % e)
        return 1
    if out.returncode != 0:
        note("! 未验：`git check-attr` 退出码 %d——★ 照实记为**未验**" % out.returncode)
        return 1
    for line in out.stdout.splitlines():
        note(line.strip())
        if not line.strip().endswith(": lf"):
            note("  ! 记：其 `eol` 非 `lf`——★ 其时工作区之字节可与所部署者不同，"
                 "而**本门与戳者俱读工作区，二者同病、俱量不到**（见门头 §二）")
            n += 1
    return n


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="验 index.html 之资产参与其内容哈希相符否（判红）")
    ap.add_argument("--site", default=str(ROOT / "site"))
    ap.add_argument("--skip-counter-proof", action="store_true",
                    help="★ 只为排障；跳过即声明，不算绿")
    args = ap.parse_args(argv)
    site = Path(args.site).resolve()
    print("经纬春秋 · 资产指纹之门（r54-6 立；判红）  —— 站点目录 %s" % site)

    try:
        sect("§一 · 正验：逐引验其参＝内容哈希")
        ms = measure(site)
        for m in ms:
            print("  %s %-7s %-14s %s" % ("✓" if m["ok"] else "✗", m["attr"], m["path"], m["why"]))
        red = [m for m in ms if not m["ok"]]

        sect("§二 · 前提之量（★ 记，不入退出码）：哈希取工作区之字节，其前提为 `.gitattributes` 之 `eol=lf`")
        n_note = premise(site, [m["path"] for m in ms])
        if n_note == 0:
            note("其所引者之 `eol` 俱为 `lf` ✓——工作区之字节＝仓内之字节（故＝所部署者）")

        sect("§三 · 按类反证（俱于临时副本上行之；任一条测不出即 exit 2）")
        if args.skip_counter_proof:
            note("! **已跳过**（`--skip-counter-proof`）——★ 跳过即声明，**不算绿**")
        else:
            n = counter_proofs(site)
            note("共 %d 条反证俱命中" % n)

        sect("§四 · 自证不写死")
        self_no_hardcode({m["actual"] for m in ms})
    except GateAbort as e:
        print("\n✗✗ 本门自身之量不成立（exit 2，决不默然放行）：%s" % e, file=sys.stderr)
        return 2

    sect("—— 判 ——")
    if red:
        print("  ✗ **红**：%d 项不符（共 %d 引）" % (len(red), len(ms)))
        for m in red:
            print("      · %s —— %s" % (m["path"], m["why"]))
        print("  ★ 其治：`python tools/stamp_assets.py`，而后复跑本门。")
        print("  ★ 其义：文已改而参未换，**读者在其窗内继续拿旧本**（裁七十六；此红是真红）。")
        return 1
    print("  ✓ %d 引俱相符（exit 0）" % len(ms))
    return 0


if __name__ == "__main__":
    sys.exit(main())
