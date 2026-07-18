# 春秋人物志

面向大众的春秋早期历史科普站：以文姜、鲁桓公、齐襄公、郑昭公、郑庄公、鲁隐公、鲁庄公、齐桓公、晋文公九条人物线为骨架，提供可考订的事件时间线、活动地图与史料摘录。数据以 CSV 为唯一数据源，经脚本生成 JSON 供静态站使用。

## 访问地址

- **主站**：<https://chunqiu.timechorus.com>（Cloudflare Pages，绑定自定义域名，2026-07-18 起为主入口）
- **镜像**：<https://quinnyxu.github.io/chunqiu/>（GitHub Pages，由 `.github/workflows/pages.yml` 自动部署，继续保留作为镜像/构建产物自检用途）

两端部署的都是同一个 `site/` 目录，内容一致；分享、og 卡等对外链接一律使用主站地址，GitHub Pages 地址仅用于内部验证与兜底访问。Cloudflare Pages 部署配置见 [docs/deploy_cloudflare.md](docs/deploy_cloudflare.md)。

## 目录

```
data/csv/          唯一数据源（8 张表：sources / people / places / events /
                   event_people / passages / background / archaeology）
data/incoming/     待复核合入的增量数据
tools/             csv_to_json.py（生成 JSON）、validate.py（数据校验）
site/              静态站根目录；site/data/ 为生成的 JSON，禁止手改
docs/              conventions.md（项目约定，改数据前必读）、design/
```

## 管线

只依赖 Python 标准库（Python 3.8+）。在仓库根目录：

```bash
# 1. 校验数据（失败会非零退出并列出问题）
python tools/validate.py

# 2. 由 data/csv/ 生成 site/data/*.json 与 meta.json
python tools/csv_to_json.py
```

改动 `data/csv/` 后按上述顺序重跑，并把 CSV 与生成的 JSON 一起提交。

## 本地预览

```bash
python -m http.server
```

然后浏览器打开 <http://localhost:8000/site/>（JSON 通过 fetch 加载，须经 http 访问，直接双击 file:// 打不开数据）。

## 规范

ID 规范、事件分类枚举（14 类）、地图投影公式、reliability/certainty 三级标注等，见 [docs/conventions.md](docs/conventions.md)。
