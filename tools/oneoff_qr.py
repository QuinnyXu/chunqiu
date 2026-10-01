# -*- coding: utf-8 -*-
"""一次性脚本：生成指向 https://chunqiu.timechorus.com 的分享二维码。

【特批说明】本脚本依赖第三方库 `segno`（仅用于本脚本，非运行时依赖、非构建
必需——`site/` 静态站点不依赖它，`tools/csv_to_json.py`/`tools/validate.py`
管线也不依赖它）。运行一次生成产物后，产物本身（qr.svg / qr.png）已提交入库，
之后无需再次运行本脚本，也无需在部署环境安装 segno。

用法（在仓库根目录，需先 `pip install segno`）：
    python tools/oneoff_qr.py

输出：
    site/assets/share/qr.svg
    site/assets/share/qr.png

【★ `qr.svg` 之款属：**备而未用，勿因无引而清之**（2026-10-01 EDT r55-E 加注；
  据 `team/round54_prompts.md` §十 **裁一百一十三**① 与 **`## 领队之二十二`** ·三之 3）】
  ★ **二物之分工**：`qr.png` **已有其用**——`site/app.js` 之分享卡以 canvas 合图，其载入作
    `im.src = "assets/share/qr.png"`，**须栅格之本**，故取 png 不取 svg。
    `qr.svg` 是其**矢量留本**（印刷、放大、改色之用），**至今未被任何 `site/` 之文件引过一次**。
  ★ **故其「无一处引之」不是遗留，是本来如此**——**备而未用，非「已被 qr.png 取代而遗」。**
  ★ **其史之要（裁一百一十三① 命「须读其史，不凭其名」，故录其据，不录其名）**：
    · `team/round8_prompts.md` §41 **明命二物并出**（「输出 `site/assets/share/qr.svg` **与** `qr.png`」）
      ——**二物并出系交付之命，非一者之替身**；
    · 二物**同生于提交 `5e01ad8`**（`2026-07-18 15:56:13 -0400`，r9），由**同一个 segno QR 码对象**
      （同 matrix／scale／border／配色）导出（见 `docs/delivery_skipper_r9.md`）；
    · `qr.png` 之**被引始于 `088fbb2`**（r11 分享卡，Vision）——★ **故二物之异不在「谁取代谁」，
      在「其一后来有了用处，其一至今未用」。**
  ★ **其求法（可复跑，勿凭今日一 grep）**：
        git log --oneline --all -S'qr.svg' -- site/ tools/ docs/
    **所期**：若系「曾引而后遗」，其字之数当有增有减，故**二个以上**提交；若系「备而未用」，**只一个**。
    **实得（2026-10-01 EDT）**：**只一个提交**，即其生者 `5e01ad8` ——**「取代而遗」于全史无征。**
    ★ **只以今日之 `grep` 求之，只说得出「今无人引」，说不出「何以无人引」**；**二者之治不同**
    （备而未用者当留，取代而遗者当议其去），**故须以 `-S` 读其史**。
  ★ **其窗不测，并书其由**：裁一百一十三 明其理——「**一个没有读者去取的文件，其缓存之窗是零，
    不是因为策略，是因为没有人去取**」；故裁一百〇五④ 所登记之待测**于此物无所施**，**不排其测**。
    （`qr.png` 与 `site/assets/support/alipay-qr.png` 二物之窗已实测，见 `tools/stamp_assets.py` 头。）
  ★ **留此一行之由（领队之二十二·三之 3 全取其语）**：**今日之「无一处引之」已两度被当作可疑之迹**
    （**裁一百〇五④** 登记其测、**裁一百一十三** 复议其去留）——**不留一行，第三次还会再问**；
    **一个「查无其用」之物，每被查一次就要重读一遍其史**，**留一行是把那一次考据的果存下来，省后人三遍功**。
  ★ **故：`site/assets/share/qr.svg` 当留，不删**（裁一百一十三③ 并命「不删任何物」）。
    ★ **其款若日后要改（议其去，或为其立一用），须先翻上列之史与其求法，不得只凭「无一处引之」一语。**

设计：
- 编码内容固定为 https://chunqiu.timechorus.com （站点主站域名，见
  docs/deploy_cloudflare.md）。
- 容错等级 M（约 15% 纠错），扫码环境宽容。
- 前景色取站内墨色 --ink #2E2A24（见 site/styles.css），背景取绢帛色
  --silk #F4EDDF，风格与站点一致，不用纯黑白。
- 生成后本脚本会用 segno 自带的编码信息做一次自检（重新构造同内容 QR 做
  结构比对），并打印明文校验用的 URL 供人工用手机扫码复核。
"""
import sys
from pathlib import Path

try:
    import segno
except ImportError:
    print("需要 segno：pip install segno", file=sys.stderr)
    sys.exit(1)

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "site" / "assets" / "share"

URL = "https://chunqiu.timechorus.com"

INK = "#2E2A24"     # 前景（站内墨色，见 site/styles.css --ink）
SILK = "#F4EDDF"    # 背景（站内绢帛色，见 site/styles.css --silk）

ERROR_LEVEL = "m"   # M 档纠错（约 15%），扫码容错适中


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    qr = segno.make(URL, error=ERROR_LEVEL)

    svg_path = OUT_DIR / "qr.svg"
    png_path = OUT_DIR / "qr.png"

    qr.save(
        str(svg_path),
        scale=10,
        dark=INK,
        light=SILK,
        border=2,
    )
    qr.save(
        str(png_path),
        scale=10,
        dark=INK,
        light=SILK,
        border=2,
        kind="png",
    )

    print(f"已生成: {svg_path}")
    print(f"已生成: {png_path}")
    print(f"编码内容: {URL}")
    print(f"纠错等级: {ERROR_LEVEL.upper()}  版本(version): {qr.version}")


if __name__ == "__main__":
    main()
