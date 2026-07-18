# 交付说明 · Skipper r9（分享二维码 + 双端部署核查）

日期：2026-07-18。本轮无数据合入，任务范围：生成分享二维码、核查 Cloudflare Pages / GitHub Pages 双端同步、核查 `docs/deploy_cloudflare.md` 归档完整性。

## 1. 分享二维码

- 脚本：`tools/oneoff_qr.py`（一次性脚本，依赖第三方库 `segno`，脚本头部已注明"非运行时依赖、非构建必需，产物已入库"，不改动 `tools/csv_to_json.py`/`tools/validate.py` 管线，站点运行时也不依赖 segno）。
- 产物：`site/assets/share/qr.svg`、`site/assets/share/qr.png`（已入库）。
- 编码内容：`https://chunqiu.timechorus.com`（当前主站域名）。
- 纠错等级：M（约 15% 纠错，适配印刷/展示等中等容错场景）。
- 配色：前景 `#2E2A24`（站内墨色 `--ink`）、背景 `#F4EDDF`（站内绢帛色 `--silk`），取自 `site/styles.css` 第 3–6 行的变量定义，未用纯黑白。
- **解码验证**：用临时安装的 `opencv-python-headless`（仅本次会话验证用，非仓库依赖）对 `qr.png` 做 `QRCodeDetector().detectAndDecode()`，解码结果与目标 URL 字符串完全一致（`https://chunqiu.timechorus.com`）。`qr.svg` 与 `qr.png` 由同一个 segno QR 码对象（同一 matrix/scale/border/配色）导出，二者编码内容结构一致；另确认 SVG 内 path 颜色为 `#f4eddf`/`#2e2a24`（大小写不影响颜色值本身）。

## 2. 双端部署同步核查

以当前 HEAD（`a018ec8`，本轮开工前最新提交）为基准：

- GitHub Actions：`Deploy site to GitHub Pages` 工作流对 `a018ec8` 已 `completed / success`（run 29658516314）。
- **meta.json 一致性**（`generated_at` 字段）：
  - 本地 `site/data/meta.json`：`2026-07-18T15:59:23+00:00`
  - GitHub Pages（`https://quinnyxu.github.io/chunqiu/data/meta.json`，带 cache-bust 参数）：`2026-07-18T15:59:23+00:00` —— 一致
  - Cloudflare Pages（`https://chunqiu.timechorus.com/data/meta.json`，带 cache-bust 参数，经 WebFetch 核对，本地网络环境对该自定义域名直连 curl/PowerShell 解析受限，改用 WebFetch 验证）：`2026-07-18T15:59:23+00:00` —— 一致
- **index.html 字节级核对**：本地 `site/index.html` 与 GitHub Pages 抓取版本 SHA-256 完全一致（`40e542ec82302aa76abd4206eb710563cc88849874f7fb76e664f256c9ab9da8`）。
- **Cloudflare Pages 关键标记核对**：经 WebFetch 抓取 `https://chunqiu.timechorus.com/`，确认 `og:url`、`twitter:image` 等分享协议头均指向 `chunqiu.timechorus.com`（与 ce3aed8 域名切换提交一致），内容与本地/GitHub Pages 同步。

结论：双端（Cloudflare Pages 主站 + GitHub Pages 镜像）均已同步至最新提交，无滞后。

## 3. `docs/deploy_cloudflare.md` 归档完整性核查

复核已有文档（上轮 ce3aed8 建立），四项覆盖点均已具备，本轮无需补充：

- Pages 接入 GitHub 仓库（第 1 节）
- 构建设置——纯静态站，无构建命令，输出目录 `site`（第 1 节第 3 条）
- 自定义域 CNAME 绑定与代理状态（第 2 节）
- Email Routing 与 MX 现状（第 3 节，含本轮前一轮 `nslookup -type=mx` 复测结果与「mailto 占位仍保持注释未启用」的状态说明）

文档现状完整，未做修改。

## 已知问题 / 交接备注

- 本地 Bash/PowerShell 直连 `chunqiu.timechorus.com`（curl / `Invoke-WebRequest`）在当前工程环境下解析失败（`nslookup` 走系统 DNS 能正常解出 Cloudflare 边缘 IP，但 curl/PowerShell 走的网络路径解析不到该主机名，`cloudflare.com` 等其他域名连接正常），推测是当前会话网络沙箱对外部域名的许可范围限制，不代表该域名本身有解析问题。本轮改用 WebFetch 工具完成该域名的核对，之后如需对该域名做脚本化直连测试，建议在非沙箱环境或确认好网络出口策略后再进行。
- 本轮临时安装的 `segno`、`opencv-python-headless`、`cairosvg`（及其依赖）均只用于本机一次性生成/验证，未写入任何 requirements 文件或 CI 配置，不影响仓库依赖面；`cairosvg` 因本机缺 `libcairo` 动态库未能用于 SVG 光栅化复验，已改用「同一 segno 对象导出」的等价性论证替代，不影响验证结论。
- `tools/oneoff_qr.py` 保留在 `tools/` 目录作为可追溯脚本，非管线一部分，不参与 `csv_to_json.py`/`validate.py` 流程，无需在常规工作流中运行。
