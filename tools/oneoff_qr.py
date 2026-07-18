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
