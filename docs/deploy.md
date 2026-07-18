# GitHub Pages 部署指引（for Xiangtao）

站点为纯静态（`site/` 目录），部署走 GitHub Actions（工作流已备好：`.github/workflows/pages.yml`，自动发布 `site/`，每次推 main 自动重新部署，部署前会先跑数据校验）。

## 1. 建仓并推送

1. 在 GitHub 网页上新建仓库：建议名 `chunqiu-figures`（或自定，**名字影响最终网址**）。选 Private/Public 均可（Private 需付费版才能开 Pages，个人免费账户请选 Public）。不要勾选任何初始化文件（README/.gitignore/license 都不要）。
2. 本地仓库根目录（`chunqiu/`）执行：

```bash
git remote add origin https://github.com/<你的用户名>/chunqiu-figures.git
git push -u origin main
```

如提示需要登录，按 GitHub 提示用浏览器完成认证即可。

## 2. 开启 Pages

1. 打开仓库页面 → **Settings** → 左栏 **Pages**。
2. **Source** 下拉选 **GitHub Actions**（不是 "Deploy from a branch"）。
3. 回到仓库 **Actions** 标签页：应能看到 "Deploy site to GitHub Pages" 工作流。若首次推送时它因 Pages 未开启而失败，点进该工作流 → 右上 **Re-run all jobs** 重跑一次。
4. 运行成功后，工作流页面和 Settings→Pages 都会显示线上地址，形如：
   `https://<你的用户名>.github.io/chunqiu-figures/`

## 3. 首次部署验证清单

打开线上地址，依次确认：

- [ ] 选人屏：六张主角卡都有徽记、颜色、生卒年与简介；页脚显示数据生成时间与各表行数（说明 JSON fetch 正常）。
- [ ] 点「文姜」进时间线：顶部年份刻度尺可见；事件条目带分类图标；点开任意一条能看到摘要与朱线引文及出处。
- [ ] 切到「地图」：底图有水系/国名；文姜的地点以红色实心点高亮并有虚线轨迹；点「临淄」弹出详情（含今地与坐标依据）；点「▶ 轨迹按时间播放」能逐站移动。
- [ ] 浏览器地址栏出现 `#person=P_WENJIANG&view=map` 这类 hash；刷新页面后状态保持。
- [ ] 换其余五位主角各点一遍时间线与地图。
- [ ] 手机上（或窗口缩到 680px 以下）再看一遍：单列卡片、地图可横向滑动。

任何一步失败：先看仓库 Actions 里最新一次运行是否绿色；再确认 Settings→Pages 的 Source 是 GitHub Actions。数据报错会让工作流在 "Validate data" 一步变红，此时先在本地跑 `python tools/validate.py` 修数据再推。

## 4. 日常更新流程

改数据 → `python tools/validate.py` → `python tools/csv_to_json.py` → 提交并 push main → Actions 自动重新部署（约 1 分钟）。

## 5. 本地预览（与线上等价）

```bash
python -m http.server
# 浏览器打开 http://localhost:8000/site/
```

站内全部引用为相对路径，本地子路径与线上 `/chunqiu-figures/` 子路径行为一致。
