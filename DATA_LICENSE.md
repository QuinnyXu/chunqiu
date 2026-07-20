# 数据许可（Data License）

本文件是仓库内**史料数据集**的许可条款；仓库内**程序代码**的许可另见根目录 [`LICENSE`](LICENSE)（MIT）。

## 适用范围

| 范围 | 是否适用本许可 |
|---|---|
| `data/csv/*.csv`（唯一数据源，8 张表：events / people / places / sources / passages / event_people / background / archaeology，及 relations） | ✅ 适用 |
| `site/data/*.json`（由上述 CSV 经 `tools/csv_to_json.py` 生成的发布物，含 `meta.json`） | ✅ 适用 |
| `site/` 下的程序代码、样式、SVG 美术资源（底图、图标等） | ❌ 不适用，见 [`LICENSE`](LICENSE)（MIT） |
| `data/incoming/`（未合入的增量草稿，含未定稿的史料判断） | ⚠️ 同一许可条款，但内容随时改动、可能包含尚未复核定稿的材料，引用前请留意版本 |
| `private/`、`team/`、`.claude/` | ❌ 不公开发布，不适用任何公开许可 |

## 许可协议：CC BY 4.0（署名 4.0 国际）

本数据集依据 **Creative Commons Attribution 4.0 International（CC BY 4.0）** 协议发布。

官方协议原文（英文，Creative Commons 授权可自由转载其协议摘要文本）：

> **You are free to:**
> - **Share** — copy and redistribute the material in any medium or format for any purpose, even commercially.
> - **Adapt** — remix, transform, and build upon the material for any purpose, even commercially.
>
> The licensor cannot revoke these freedoms as long as you follow the license terms.
>
> **Under the following terms:**
> - **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
> - **No additional restrictions** — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.
>
> **Notices:**
> You do not have to comply with the license for elements of the material in the public domain or where your use is permitted by an applicable exception or limitation. No warranties are given. The license may not give you all of the permissions necessary for your intended use. For example, other rights such as publicity, privacy, or moral rights may limit how you use the material.

中文摘要（非官方译文，以上方英文原文与下方法律全文为准）：

> 你可以自由地：**分享**（以任何媒介或格式复制、再散布本数据，包括商业用途）、**改编**（remix、转换、基于本数据进行再创作，包括商业用途）。惟须遵守：**署名**（须给出适当的署名、提供指向本许可的链接、并指明是否做了改动，方式不得暗示许可人为你或你的使用背书）；**不得额外限制**（不得设置法律条款或技术措施限制他人行使本许可准予的权利）。

- 协议摘要页（Deed）：<https://creativecommons.org/licenses/by/4.0/>
- 完整法律文本（Legal Code）：<https://creativecommons.org/licenses/by/4.0/legalcode>

## 署名建议格式

引用、转载或基于本数据集做二次开发时，建议使用以下署名：

> 春秋人物志 · chunqiu.timechorus.com

英文场景可用：

> chunqiu.timechorus.com — a sourced database of Chunqiu-era (Chinese Spring and Autumn period, 8th–5th c. BCE) historical figures

若引用具体条目，建议同时保留原始来源编号（如 `Z056`《左传·僖公三十三年》）与本库的 `coord_certainty`/`reliability` 等标注，以便读者判断史料可靠度层级——本数据集本身是对《左传》《国语》《史记》等传世文献的**结构化整理与考订标注**，不改变原始文献本身的公有领域地位；CC BY 4.0 约束的是**本项目的整理、编年、坐标考订、分层标注等编辑成果**。

## 免责声明

本数据集为科普与研究整理用途，标注了 `reliability`（可靠度：high / medium / low）与"后出叙事"等分层，但**不保证学术级别的完整性或准确性**；直接引用于学术写作前建议核对原始出处。详见 [`docs/conventions.md`](docs/conventions.md) 中的数据凡例。

---

代码许可见 [`LICENSE`](LICENSE)（MIT）；项目数据凡例、编码规范见 [`docs/conventions.md`](docs/conventions.md)；项目总览见 [`README.md`](README.md)。
