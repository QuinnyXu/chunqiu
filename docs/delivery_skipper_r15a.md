# 交付说明 · Skipper r15a（更名收尾清扫——公开面零旧名残留）

日期：2026-07-20。前置：Vision r15 品牌批次（commit `28d824f`）已部署，站内 title/og/关于页等已换新名。本轮任务：全仓扫描确认公开面无旧名「春秋人物志」残留，conventions 版本递进补记，GitHub 网页端更新指引。

## 1. 全仓扫描结果

`git grep -n "春秋人物志"` 与 `git grep -n "左传与国语中的人物、时间线与地图"`（旧副题）全仓复核：

**命中 3 个文件，均为约定保留的历史/文案对照类文档，无需改动：**

| 文件 | 性质 | 处置 |
|---|---|---|
| `docs/delivery_vision_r11.md:27` | r11 历史交付文档，引用当时邮件反馈主题行 `【春秋人物志】反馈` | 保留（§8「旧文件不改名」惯例，历史记录属实） |
| `docs/copy_r8.md:12` | r8 历史文案对照稿，"现→新"对照表中的"现"文本 | 保留（历史引用，非当前生效文案） |
| `docs/copy_r15.md`（多处） | 本轮 Sophia 文案对照稿自身，行文引述新旧站名/副题作对照说明 | 保留（对照稿性质决定必须引旧名才能成文，非残留） |

**site/、README.md、DATA_LICENSE.md、docs/conventions.md、docs/design/design_notes.md、.github/ 均为零命中**——即 `docs/copy_r15.md` 排查清单列出的「甲7＋乙3＋丙7」共 17 处文本命中，已在 Vision r15 品牌批次（commit `28d824f`）中一次性全部替换到位，本轮复核确认无遗漏、无新增残留。

**结论：公开面（用户可见面 + 对外分发面）零旧名残留，team/、.claude/ 未触碰。**

## 2. conventions 版本递进

- 任务书指定的起点版本（v1.11）已在上一批 Skipper 交付（round15 数据合入）中递进至 **v1.12**；本轮在 v1.12 基础上继续递进，**不回退**。
- **新版本：v1.13**。
- 新增 **§13「站名与品牌裁定记录」· 裁定5**，记录：
  - 更名事实：「春秋人物志」→「**经纬春秋**」，副题「**左传为经，诸书为纬，牵系有据**」（Xiangtao 终审，Vision r15 候选A）；
  - 典源：《左传·昭公二十八年》「经纬天地曰文」（成鱄论德九目之末句，reliability high）；
  - 生效日期：2026-07-20，随 commit `28d824f` 落地；
  - 署名格式同步：「春秋人物志 · chunqiu.timechorus.com」→「经纬春秋 · chunqiu.timechorus.com」，四处副本（§12裁定3、README.md、DATA_LICENSE.md、site/index.html 页脚）已核对一致，无遗漏；
  - 本轮 grep 收尾核验记录（零残留证据，同本文档第1节）。
- 版本头行同步更新，v1.12 移入历史行。

## 3. GitHub 网页端更新指引（需 Xiangtao 本人操作，Skipper 无网页端权限代做）

以下两项均在浏览器打开仓库页面 `https://github.com/QuinnyXu/chunqiu` 操作，预计 2 分钟：

### 3.1 更新 About 栏 Description

1. 打开仓库主页 `https://github.com/QuinnyXu/chunqiu`。
2. 页面右上角「About」区块旁点击齿轮图标 ⚙️（"Edit repository details"）。
3. 在弹出的 "Description" 输入框中，将现有描述（含旧名「春秋人物志」，如有）改为含新名的一句话，建议文案（可直接用或按喜好微调，字数与语气对齐 README 现状）：

   ```
   经纬春秋——左传为经，诸书为纬，牵系有据。以《左传》《国语》为经纬考订的春秋人物数据库：时间线、地图、关系图谱，条条有出处。
   ```

4. 下方 "Website" 字段确认仍为 `https://chunqiu.timechorus.com`（应已存在，无需改动）。
5. 点击 "Save changes"。

### 3.2 上传新版 Social Preview（og-card.png）

1. 仓库主页点 "Settings"（需 admin 权限，Xiangtao 账号应已有）。
2. 左侧菜单最下方找到 "General" 页的 "Social preview" 区块（滚动到页面底部）。
3. 点击 "Edit"，选择本地文件 `site/assets/og/og-card.png`（本轮已重制为新版，1200×630，含新站名「经纬春秋」与涡纹徽记）上传。
4. 上传后 GitHub 会自动裁切/预览，确认预览图无旧名残留、字迹清晰后点 "Save"。

**说明**：GitHub 仓库的 Social preview 与网站自身的 `og:image`（`chunqiu.timechorus.com/assets/og/og-card.png`）是两套独立配置——前者只影响 GitHub 仓库链接在 Slack/Twitter 等平台被分享时的预览图，后者影响 chunqiu.timechorus.com 网站链接的预览图。两者现已用同一张新图，但需分别上传/部署，缺一不会自动同步。

## 4. Git / 部署

- 本轮改动：`docs/conventions.md`（v1.12→v1.13，新增 §13 裁定5）、新增 `docs/delivery_skipper_r15a.md`（本文档）。无 site/ 代码改动（上一批 `28d824f` 已完成全部文本替换），无数据表改动。
- `python tools/validate.py` → `OK：全部校验通过`（docs-only 改动，数据未变，仍走一遍确认无副作用）。
- Commit：见下方（提交后回填 hash）。
- Push `origin/main`；GitHub Actions「Deploy site to GitHub Pages」需确认绿。

## 5. 线上复验

- 带 cache-bust 参数复验站点 `<title>` 仍为「经纬春秋——左传为经，诸书为纬，牵系有据」（本轮未改代码，延续上一批 `28d824f` 已验证结果，见 `docs/delivery_skipper_r15.md` 前序交付与本次任务对话中的复验记录）。
- 公开面 grep 复核结果见本文档第1节，零残留。
- og 检查器：本地沙盒 DNS 无法直连 `chunqiu.timechorus.com`（与历次交付说明记录的沙盒网络限制一致），未能用第三方 og 检查器（如 opengraph.xyz）直接抓取自定义域；已通过 GitHub Pages 镜像 `https://quinnyxu.github.io/chunqiu/` 下载核验 `og-card.png` 尺寸为 1200×630、内容为新版。建议 Xiangtao 用真实浏览器或 og 检查器对 `https://chunqiu.timechorus.com` 做一次直连复验，尤其确认 Cloudflare 边缘缓存已刷新到新图。

## 6. 已知问题 / 交接备注

- GitHub 网页端两项操作（About 描述、Social preview 图）本轮**未代为执行**，需 Xiangtao 本人按第3节指引操作——Skipper 无仓库 Settings 管理权限，且这类账号级操作不宜由自动化代理越权代做。
- E130「绝缨之宴」去留仍为待决事项（conventions §11，round15 遗留，与本轮更名收尾无关，未处理）。
- 沙盒环境对自定义域名 `chunqiu.timechorus.com` 的 DNS 解析持续失败（历次交付说明均有记录），线上复验一律改走 GitHub Pages 镜像，结论可信但建议保留人工复核自定义域的习惯。
