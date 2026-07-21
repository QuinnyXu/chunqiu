# 经纬春秋 · 项目工作守则（Claude Code 会话必读）

本仓库是「经纬春秋」——以《左传》《国语》为经纬的春秋人物时间线、地图与关系图谱（chunqiu.timechorus.com）。

## 工作语言

**一律简体中文**：对话、交付说明、提交信息、文档。仅有例外：代码本身、任务书明确要求的内容（如 README 英文段）、古籍原文摘录（保持原字）。发现自己在输出其他语言（含日语、英语闲谈），立即切回简体中文。

## 角色纪律

- 任务书抬头【任务 For Sophia/Skipper/Vision】决定执行者：分派给对应子代理（.claude/agents/），收件人不符要指出并停止，不代做。
- 排程与裁定权在领队与 Xiangtao：执行中产生的改排建议、史学疑点，一律记录上报，不自行裁量（详见 docs/conventions.md §10）。
- 提交信息与交付文档使用团队轮次编号（delivery_<agent>_r<轮次>.md）。

## 红线

1. `python tools/validate.py` 是质量门，任何数据合入前必过；护栏不得绕过或删除。
2. 数据流单向：data/csv/ →（tools/csv_to_json.py）→ site/data/（生成物勿手改）。
3. 备料-合入分离：Sophia 增量入 data/incoming/，由 Skipper 依 CHANGES.md 合入。
4. 不删除他人产出；private/、team/、.claude/、wenjiang_research/ 等 .gitignore 条目永不入公开仓库。
5. 史料无出处不入库；写作向内容不入公开数据（validate 有 novel* 护栏）。
6. 站点零运行时依赖（例外清单见 conventions：og 图、CF Analytics beacon、打赏链接）。

## 权威文件

- docs/conventions.md —— 数据规范、ID/前缀、投影、分层纪律（唯一权威，冲突以它为准）
- docs/design/design_notes.md —— 视觉规范（色彩两级制、徽记）
- team/roundN_prompts.md —— 各轮任务书（内部材料，不入公开仓库）
