#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""经纬春秋 · 资产指纹之戳（r54-6 立，2026-09-26）

===============================================================================
【立此物之由（`team/round54_prompts.md` §三 裁七十六「取甲-1」）】
  r54-2 实测：生产之主脚本／样式表之引法**无版本参、无内容哈希**，而其 `max-age` 远大于零
  ——**回访之读者遂可能在窗内持旧本**（其窗之长与其头出自 Cloudflare 一事，见
  `tools/qa/prod_freshness.js` 门头与 `docs/delivery_skipper_r54.md` §一）。
  裁七十六取**甲-1（提交前戳）**，其四由：① 不动任何部署配置，且 CF Pages 与 GH Pages 二管线
  俱受其益（乙只治 Cloudflare 一侧）；② 不须控制台之权，其果入库可复核；③ 指纹化之后
  `max-age` 之长短不再是病；④ 乙之效未经本站实测，**拿未验之机制治已验之病，不可**。

【本物所办者，一句】
  自 `site/` 内**被 `index.html` 所引之每一个本地 `.js`／`.css` 之内容**算短哈希（SHA-256 前 8 位），
  改写其引法为 `app.js?v=<hash8>`／`styles.css?v=<hash8>`。**幂等**：二跑其果逐字节相同。

【★ 其所短者，与其门（同件同落，裁七十六明命）】
  甲-1 自带一个**账外之病**：**忘跑即静默失效**——文已改而参未换，读者仍在窗内拿旧本，
  而库内看不出任何异状。故 `tools/qa/asset_stamp_gate.py` 与本物**同件同落**，其判取**红**。
  ★ **勿只留本物而弃其门**：其时甲-1 之利仍在，而其病无人看得见。

【★ 不写死资产之名（承 `prod_freshness.js` §一之式）】
  所戳者**不是一张写死的名单**，是「`index.html` 之内**实际引到**之本地 `.js`／`.css`」——
  跑时自该文档正则求得。故日后若新增一个样式表或拆出一个脚本，**本物与其门自随之**，
  不须回改一个字。★ 此亦是其门反证之四（新增一引而不戳，门须当场红且指名其物）。

【★ 所戳之范围：只 `.js`／`.css` 二类（★ 有意为之，非遗漏）】
  `index.html` 内另有 `assets/` 下之 `.svg`／`.png`（图标、og 卡、收款码）——**本件不戳**，其由二：
  ① 裁七十六所治之病是「**旧码遇新数据**」一类，图之旧新不与码相冲；
  ② 图之改动频次与耦合俱低。★ **此系范围之界，不是漏**——欲扩其类，改 `ASSET_EXT` 一处即可，
  其门自随之（门与本物共用同一解析器，见下）。**登记，本轮不办。**

【★ 裁八十五・裁九十一之勘：戳之范围当作**二问**，不作一问（2026-09-29 r54-6 重戳件就地加注；上节旧文一字不删）】
  上节（2026-09-26 落笔）以「后缀」划其界。**Co站长两裁改之，照录其判与其由：**

  · **裁八十五（2026-09-27）——其由（二者危害不同级，故其治可不同期）**：
      `.js`／`.css` 之旧本配新 `index.html` 会**坏**（行为不一致）——是**正确性**之事；
      纯展示之图（icons、og-card）之旧本只是**旧**（图还是图）——是**新鲜度**之事。
      ★ 并勘上节：**界不当以「后缀」划，当以「是否被程序读其结构」划。**

  · **裁九十一（2026-09-28）——再勘其界：当作二问，二问俱「是」方入戳**：
      **一问：其旧本是否会「坏」（被程序读其结构，非只是旧）？**
      **二问：其旧本之窗是否非零（缓存之策许其旧）？**
      · `.js`／`.css`：二问俱是 → **入戳**（即本物今所戳者）。
      · `site/data/*.json`（**含 `kaodui.json`**）：一问**是**（`prod_data_invariants.js` 即 fetch 而读其结构）、
        二问**否** → **不入戳**。★ 裁九十一原命书此于本头，照录其字：
        「`data/*.json` 今不戳，其由是实测 `max-age=0`、`DYNAMIC`（日期）；**此据若变，须重裁。**」
        ★ **其日与其复验**：裁九十一所据系 2026-09-28 之实测；r54-6 重戳之日（**2026-09-29 11:07 -0400**）复测
        `https://chunqiu.timechorus.com/data/meta.json`，得 `cache-control: public, max-age=0, must-revalidate`、
        `cf-cache-status: DYNAMIC`——**其据今日仍立**。**戳所治者是窗；窗为零，戳无所治。**
        ★ **读法**：此 `max-age=0` 系 **Cloudflare 侧今日之策，非我们所控之约**；其策一改，此判即翻。

  · **`assets/map/base_map.svg`：二问俱「是」，而本轮**未入戳**——其由是一**结构之碍**，非疏漏（登记候排、候裁）**：
      · **一问「是」**：其由 `site/app.js` 内 `fetch("assets/map/base_map.svg")` 取入而后**解析其结构**。
        （裁八十五书其位为 `app.js:5721`——★ **2026-09-29 实读为 `app.js:6265`**，本轮 `app.js` 已增长；
         **行号易变，以其文定位，勿以行号**。）
      · **二问「是」**（★ 裁九十一命「**俟实测**」，**今补测之**，2026-09-29 11:07 -0400）：
        `https://chunqiu.timechorus.com/assets/map/base_map.svg` → `cache-control: public, max-age=14400, must-revalidate`、
        `cf-cache-status: REVALIDATED`——**与同刻之 `/app.js`（`max-age=14400`、`MISS`）同族**，非 `data/*.json` 之族。
      · ★ **故照裁九十一之界其当入戳；而本物今戳不着它**：
        本物所改者只是 **`site/index.html` 之引**，而 `base_map.svg` **不由 `index.html` 所引**，
        是 `app.js` 内一个**写死之 fetch 路径**。**故上节所书「改 `ASSET_EXT` 一处即可」于此物不成立**
        ——入戳须**另立机制**（本物须能改 `app.js` 内之字面，或另立一 manifest 由 `app.js` 读），
        **是新机制，非扩其类**。
      · ★ **且其一入戳即生一二阶之序**：戳改 `app.js` → `app.js` 之内容哈希随之变 →
        `index.html` 之参须**再戳一过**。**戳之序遂由一阶成二阶，须先定其序方可落。**
      · **故本轮只记其状、不落其实，停下上报**（r54-6 重戳件之界明命「只改 `index.html` 之二参」）。
      ★ **明记于此，不使其落在上节「`.svg` 不在内」一句之下被一并放过**（裁八十五明命）。
      · 〔**2026-09-30 r55-A 加注·其裁已下，本物之判定矣（上文一字不删，只记其裁）**〕
        ★ **`base_map.svg` 定为「不入戳」，本物 `ASSET_EXT` 一字不改**——照 `team/round54_prompts.md`
        **`## §八 · 裁九十九至一百〇四`** 之 **裁九十九**①（原字）：「`base_map.svg` **不入 `ASSET_EXT`**，
        `tools/stamp_assets.py` **一字不改**」；并 **`## §九 · 裁一百〇五至一百〇九`** 之 **裁一百〇五**①：
        「**不建二阶之戳**」。★ **故上文所记之「候排、候裁」今已裁毕**：其治不在戳，在 `site/app.js` 之
        **载时自验**（裁九十九②③④：注入后验 `#layer-anchors` 之契须**有声**、契之清册入 `app.js` 头、
        并一约钉在那个文件上——**归 Vision，r55-B**）。
        ★ **且裁一百〇五②明其前置**（原字）：「**若日后要戳 base_map，其前置不是写二阶之序，是先裁
        `assets/icons/<name>.svg` 52 物之款属**——否则交出来的是一个覆盖 1 物、漏 51 物而通体报绿的门。」
        ★ **其据系新实测**：`site/app.js` 内取资产者**二路**——`fetch("assets/map/base_map.svg")` 系**字面**之路（一物）、
        `fetch("assets/icons/" + name + ".svg")`（`SVG_CACHE`）系**以变量拼成**之路（52 物）；
        **凡以「扫 `.js` 内之字面资产路」为法之戳，必戳着一物而漏五十一物，且报绿**。
        ★ **一个扫不全却报绿的门，比没有门坏**（裁九十九①原语）——**此即本物不扩其类之由，非疏。**

  · **`assets/share/qr.png` 与 `assets/support/alipay-qr.png`：一问否、二问是 → 不入戳**
    〔**2026-10-01（EDT）r55-E 加注**（上节旧文一字不删）；据 `team/round54_prompts.md` §十 **裁一百一十三**②
     与 **`## 领队之二十二`** ·三之 4，照**裁九十一之二问**求之〕
      · **一问「否」**（其旧本只是旧，**不会坏**）：**本件实核其引法三处，无一读其结构**——
        `site/app.js` 之 `im.src = "assets/share/qr.png"`（分享卡，载入后绘入 canvas，只取其像素）、
        `site/index.html` 之 `<img class="support-qr" src="assets/support/alipay-qr.png" …>`、
        `site/app.js` 之 `img.src = "assets/support/alipay-qr.png"`（打赏弹层）。
        ★ **三处俱 `<img>`／`Image` 之属**；**旧本只是旧，不会坏**（裁一百一十三② 先答，本件实核以证之）。
      · **二问「是」**（其窗**非零**）——★ **实测于 2026-10-01 08:4x -0400**（＝`2026-10-01 12:4x UTC`；其跑在本件 `date` 实读 `2026-10-01 08:49 -0400` 之前数分内。★ **其确切之分未另录**，故只书其界——**照实书，不补一个没有记下来的数**），
        求法 `curl -sI https://chunqiu.timechorus.com<path>`：
          `/assets/share/qr.png`        → `cache-control: public, max-age=14400, must-revalidate`、
                                          `cf-cache-status: MISS`（`200`、`image/png`、496 字节）
          `/assets/support/alipay-qr.png` → `cache-control: public, max-age=14400, must-revalidate`、
                                          `cf-cache-status: REVALIDATED`（`200`、`image/png`、88209 字节）
          （对照同刻 `/app.js` → `public, max-age=14400, must-revalidate`、`EXPIRED`）
        ★ **其窗＝14400 秒＝4 小时**；带 `must-revalidate`，故**逾期之后不得再服旧本，须回源验**，
        **其窗之上界即此 4 小时**。
        ★ **`cf-cache-status` 二值之异（MISS／REVALIDATED）不是策之异**，只是**此刻边缘之态**；
        **二者之 `cache-control` 逐字相同**，故其窗同为 4 小时——★ **与 `/app.js` 同族，非 `data/*.json` 之族。**
      · ★ **合判（裁九十一之界：二问俱「是」方入戳）**：**一问否、二问是 → 不入戳**；
        **且其治之急低**（旧本只是旧，不会坏——纵其窗 4 小时，读者所见只是一张旧二维码之像素，其所编之 URL 未改）。
      · ★ **把判之所据写下来，判才能被后人翻**（裁九十一之例，领队之二十二·三之 4 准其照此办）：
        **此 4 小时之窗系 Cloudflare 一侧今日之策，非我们所控之约**；★ **其策若改，此判即翻**
        （与上款 `data/*.json` 之 `max-age=0` 同理，**二者俱系「实测之据」而非「我们之约」**）。
        ★ **并记其一问之变数**：**一问之「否」系于其引法仍是 `<img>`／`Image`**；
        **若日后有人改以 `fetch` 取之而读其字节（如自绘、或验其所编之 URL），一问即转「是」，本判须重裁。**
      · ★ **并记一物之不测，不使其混入本款**：`assets/share/qr.svg` **不在本款之内**——
        **其至今无一处引之**（备而未用，裁一百一十三①；其史与其求法见 `tools/oneoff_qr.py` 头），
        **故其窗无所施，本件不测之**。★ **其不测是裁定之果，非漏测。**

【★ 哈希取何本：**工作区之字节**（其前提已实测，随书于此）】
  本物所算者是**工作区文件之字节**。其与所部署者同字节之前提是 `.gitattributes` 已锁 `eol=lf`
  （`* text=auto` ＋ `*.js/*.css/*.html text eol=lf`），故 `core.autocrlf=true` 之下工作区亦不换行尾。
  ★ **落笔之日实测**（2026-09-26）：`git check-attr text eol -- site/app.js` 得 `text: set`／`eol: lf`；
  并取二个**未改之已跟踪文件**对位——`tools/validate.py`／`site/data/meta.json` 之
  「工作区 sha256 前 16 位」与「`git show :<path>` 之同」**逐位相同**（`d0707e22c1d8e863`／`d79b243161c7d096`）。
  ★ **读法**：若日后有人去掉 `.gitattributes` 之 `eol=lf`，本前提即破——其时库内之参会与所部署者不符，
  **而其门量不到此事**（门亦读工作区）。**此系本物与其门共同之界，明书于此。**

【跑法】
  python tools/stamp_assets.py            # 戳（幂等）
  python tools/stamp_assets.py --dry-run  # 只报其将改者，不写一字
  python tools/stamp_assets.py --site <dir> --doc <name>   # 指向任意副本（其门之反证即用此）

【退出码】
  0 ＝ 已戳（或本已相符，无所改）
  2 ＝ **本物之量不成立**，决不默然放行：文档或所引之物不存在／一个本地 `.js`／`.css` 也引不到／
       某引已带一个**非 `v=<8位十六进制>`** 之查询串（其意不明，**停下上报，不自行覆之**）。
  ★ 本物**无退出码 1**：其职在「改」，不在「判」；判之职在其门。

【与合入之序（★ 交接备注）】
  甲-1 之名为「**提交前戳**」：其序为 **改 `site/app.js`／`styles.css` → 跑本物 → 跑其门 → 方提交**。
  ★ 戳须戳在**定稿**上：所戳者若其后再改一字，其戳当场失效（此即领队排 r54-4 先于 r54-6 之由）。
===============================================================================
"""

from __future__ import annotations

import argparse
import hashlib
import re
import sys
from pathlib import Path

# 终端编码：照 `validate.py`／`csv_to_json.py`／`build_kaodui_index.py` 之式
# （Windows 控制台默认 cp1252，不改则本文之中文一印即抛 UnicodeEncodeError）
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        _stream.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
HASH_LEN = 8
ASSET_EXT = (".js", ".css")
DOC_NAME = "index.html"

#: `src="…"` 与 `href="…"` 二式（本库之 `index.html` 一律双引号，落笔之日实读为证）
ATTR_RE = re.compile(r'\b(?P<attr>src|href)\s*=\s*"(?P<val>[^"]*)"')
#: 合法之参：`v=` ＋ 恰 `HASH_LEN` 位十六进制小写
PARAM_RE = re.compile(r"^v=([0-9a-f]{%d})$" % HASH_LEN)


class StampError(Exception):
    """本物之量不成立（退出码 2）——非「不相符」，是「量不得」。"""


def sha8(data: bytes) -> str:
    """内容哈希之短式：SHA-256 十六进制之前 HASH_LEN 位。"""
    return hashlib.sha256(data).hexdigest()[:HASH_LEN]


def is_local_asset(val: str) -> bool:
    """其引是否为**本地**之 `.js`／`.css`。

    所去者：外链（`://`／`//`）、锚（`#`）、`mailto:`／`data:` 之属、以及非 `.js`／`.css` 之扩展名。
    """
    if not val or val.startswith(("#", "//", "?")):
        return False
    if "://" in val or val.startswith(("mailto:", "data:", "javascript:")):
        return False
    path_part = val.split("?", 1)[0].split("#", 1)[0]
    return path_part.lower().endswith(ASSET_EXT)


def discover(html: str, site: Path, strict_query: bool = True) -> list[dict]:
    """自文档之文求其所引之本地资产，逐个带其位、其参、其文件与其**所期之参**。

    ★ 此函数即**门与本物共用之解析器**（承裁七十七甲-ii「`import` 同一抽取器」之式）：
      免二本各自解析而日久相漂。★ 其代价亦明书：解析器若有病，二者同病——
      故其门另置一条**解析器之反证**（新增一引而不戳，须当场红且指名其物），以责此一处。

    `strict_query` ★ **本物与其门于此一处分**，其由明书：
      · 本物（戳者）取 `True`——遇一个形不合之参即**停下上报**，不自行覆之（其意不明，覆之即掩）。
      · 其门取 `False`——**形不合之参是「不符」，当归其门判之红**，不当化为「本门量不成立」之 exit 2；
        不然改一位十六进制成非法之形，反倒比改成另一个合法之值更轻。
    """
    out: list[dict] = []
    for m in ATTR_RE.finditer(html):
        val = m.group("val")
        if not is_local_asset(val):
            continue
        path_part, _, query = val.partition("?")
        f = site / path_part
        if not f.is_file():
            raise StampError(
                "文档引到一个不存在之本地资产：%r（所求之路 %s）" % (val, f)
            )
        if strict_query and query and not PARAM_RE.match(query):
            raise StampError(
                "引 %r 已带一个非 `v=<%d位十六进制>` 之查询串 %r——其意不明，"
                "本物不自行覆之，停下上报。" % (val, HASH_LEN, query)
            )
        out.append(
            {
                "span": m.span("val"),
                "attr": m.group("attr"),
                "raw": val,
                "path": path_part,
                "query": query,
                "well_formed": bool(PARAM_RE.match(query)),
                "file": f,
                "expect": "v=" + sha8(f.read_bytes()),
            }
        )
    return out


def stamp_text(html: str, site: Path) -> tuple[str, list[dict]]:
    """返回（改后之文，逐引之记）。未改者亦入其记，`changed` 为假。"""
    recs = discover(html, site)
    if not recs:
        raise StampError(
            "文档之内一个本地 %s 也引不到——本物无所戳，决不默然放行。"
            % "／".join(ASSET_EXT)
        )
    new = html
    # 自后而前改，免前改移了后者之位
    for r in sorted(recs, key=lambda r: r["span"][0], reverse=True):
        r["changed"] = r["query"] != r["expect"]
        val = r["path"] + "?" + r["expect"]
        a, b = r["span"]
        new = new[:a] + val + new[b:]
    return new, recs


def run(site: Path, doc_name: str = DOC_NAME, dry_run: bool = False,
        echo=print) -> tuple[bool, list[dict]]:
    """戳一过。返回（是否写了文档，逐引之记）。"""
    doc = site / doc_name
    if not doc.is_file():
        raise StampError("文档不存在：%s" % doc)
    old_bytes = doc.read_bytes()
    new_text, recs = stamp_text(old_bytes.decode("utf-8"), site)
    new_bytes = new_text.encode("utf-8")
    changed = new_bytes != old_bytes
    for r in sorted(recs, key=lambda r: r["span"][0]):
        echo("  %-7s %-14s %s → %s%s" % (
            r["attr"], r["path"], r["query"] or "（无参）", r["expect"],
            "" if r["changed"] else "  （本已相符）"))
    if changed and not dry_run:
        # 以字节写出：行尾一律照旧（本库 `.gitattributes` 锁 `eol=lf`），不经文本层之转写
        doc.write_bytes(new_bytes)
    return (changed and not dry_run), recs


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="以内容哈希戳 index.html 之资产引法（幂等）")
    ap.add_argument("--site", default=str(ROOT / "site"), help="站点目录（默认 <repo>/site）")
    ap.add_argument("--doc", default=DOC_NAME, help="文档之名（默认 index.html）")
    ap.add_argument("--dry-run", action="store_true", help="只报，不写一字")
    args = ap.parse_args(argv)
    site = Path(args.site).resolve()
    print("经纬春秋 · 资产指纹之戳  —— 站点目录 %s／文档 %s%s"
          % (site, args.doc, "（--dry-run：不写）" if args.dry_run else ""))
    try:
        wrote, recs = run(site, args.doc, args.dry_run)
    except StampError as e:
        print("\n✗ 本物之量不成立（退出码 2）：%s" % e, file=sys.stderr)
        return 2
    n_ch = sum(1 for r in recs if r["changed"])
    print("\n共 %d 引，其中须改 %d；文档%s" % (len(recs), n_ch,
          "已写" if wrote else ("未写（--dry-run）" if args.dry_run and n_ch else "未动（本已相符）")))
    return 0


if __name__ == "__main__":
    sys.exit(main())
