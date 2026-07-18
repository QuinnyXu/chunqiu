# Cloudflare Pages 部署指引（主站）

自 2026-07-18 起，`chunqiu.timechorus.com` 是本项目的主站，由 Cloudflare Pages 承载并绑定自定义域名（Xiangtao 已完成部署与绑定，本文档为归档记录 + 后续排障参考）。GitHub Pages（`https://quinnyxu.github.io/chunqiu/`）继续保留为镜像，详见 [docs/deploy.md](deploy.md)。

## 1. Cloudflare Pages 接入 GitHub 仓库

1. Cloudflare 控制台 → **Workers & Pages** → **创建应用程序** → **Pages** → **连接到 Git**。
2. 授权并选择仓库 `QuinnyXu/chunqiu`，生产分支选 `main`。
3. 构建设置（本仓库为纯静态站，不需要构建步骤）：
   - **框架预设**：无（None）
   - **构建命令**：留空
   - **输出目录**：`site`
   - 不需要设置根目录（root directory），除非 Cloudflare 界面要求，默认仓库根即可，因为输出目录已指向 `site/`。
4. 保存并部署。首次部署完成后，Cloudflare 会分配一个 `*.pages.dev` 预览域名，可先用它验证站点内容与 GitHub Pages 镜像一致。

## 2. 自定义域名绑定（chunqiu.timechorus.com）

1. Pages 项目 → **自定义域**（Custom domains）→ **设置自定义域**，输入 `chunqiu.timechorus.com`。
2. 若 `timechorus.com` 的 DNS 已托管在同一 Cloudflare 账号，Cloudflare 会自动创建/建议一条 **CNAME** 记录：

   ```
   类型   名称        目标
   CNAME  chunqiu     <项目名>.pages.dev
   ```

   代理状态（Proxy status）建议保持“已代理”（橙色云朵），走 Cloudflare CDN 与自动 HTTPS。
3. 等待 SSL/TLS 证书签发（通常几分钟内），状态变为“有效”后即可通过 `https://chunqiu.timechorus.com` 访问。
4. 每次 `main` 分支有新 push，Cloudflare Pages 会自动触发新的生产部署；部署状态与历史记录在 Cloudflare 控制台的该 Pages 项目下自行查看，**不经由本仓库的 GitHub Actions**（`.github/workflows/pages.yml` 只负责 GitHub Pages 镜像的构建与自检，两条部署管线相互独立）。

## 3. Email Routing（chunqiu@timechorus.com，用于站内邮件反馈占位）

站内导航与关于页留有 `mailto:chunqiu@timechorus.com` 的 HTML 注释占位（供未来邮件反馈入口使用），启用前提是该邮箱能实际收发。开通步骤：

1. Cloudflare 控制台 → 选中 `timechorus.com` → **Email** → **Email Routing**。
2. 按引导完成，Cloudflare 会自动写入所需的 **MX 记录**（通常为 `route1/2/3.mx.cloudflare.net`，不同优先级）以及一条用于 SPF 校验的 **TXT** 记录；如域名 DNS 未托管在 Cloudflare，则需手动把这些记录加到实际的 DNS 服务商。
3. 在 **路由规则**（Routing rules）里添加自定义地址 `chunqiu@timechorus.com`，设置转发目的邮箱（需先验证该目的邮箱的所有权，Cloudflare 会发验证邮件）。
4. 规则生效后可发测试邮件到 `chunqiu@timechorus.com` 确认能收到转发。

**截至本轮（2026-07-18）状态**：复测 `nslookup -type=mx timechorus.com` 已返回

```
timechorus.com  MX preference = 23, mail exchanger = route1.mx.cloudflare.net
timechorus.com  MX preference = 44, mail exchanger = route2.mx.cloudflare.net
timechorus.com  MX preference = 81, mail exchanger = route3.mx.cloudflare.net
```

即 MX 记录已指向 Cloudflare Email Routing，但**路由规则是否已配置、`chunqiu@timechorus.com` 是否已能实际收发尚未确认**。因此本轮仍保持 `site/index.html` 中 mailto 占位为注释状态、不启用；待 Xiangtao/领队确认转发规则生效并做过收发测试后，再取消注释启用（改动点：`site/index.html` 内两处 `<!-- 邮件反馈占位 -->` 注释块，注释文字已随本轮 MX 复测结果更新）。

## 4. 排障要点

- 若自定义域名一直显示“待处理”（Pending）：检查 DNS 记录是否确实生效（`nslookup chunqiu.timechorus.com` 应指向 Cloudflare 的边缘 IP 或能解析到 CNAME 目标），以及该域名的 DNS 是否确实由 Cloudflare 托管。
- 若页面内容与预期不符：先看 Cloudflare Pages 项目的部署历史，确认最新一次部署对应的 commit hash 与 `git log` 一致；必要时手动触发重新部署。
- 站点内所有页内资源引用均为相对路径，不受域名切换影响；仅 `site/index.html` 头部的分享协议字段（og:url / og:image / twitter:image / image_src / canonical）与 README 中的地址文本是绝对 URL，域名变更时需要一并更新（本轮已切换到 `chunqiu.timechorus.com`）。
