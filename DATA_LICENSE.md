# 数据许可（Data License）

本文件是仓库内**史料数据集**的许可条款；仓库内**程序代码**的许可另见根目录 [`LICENSE`](LICENSE)（MIT）。

## 适用范围

| 范围 | 是否适用本许可 |
|---|---|
| `data/csv/*.csv`（唯一数据源，8 张表：events / people / places / sources / passages / event_people / background / archaeology，及 relations） | ✅ 适用 |
| `site/data/*.json`（由上述 CSV 经 `tools/csv_to_json.py` 生成的发布物，含 `meta.json`） | ✅ 适用 |
| `site/` 下的程序代码、样式、美术资源（SVG、PNG 等，如底图、图标）（**本站标识除外**，详见下行） | ❌ 不适用，见 [`LICENSE`](LICENSE)（MIT） |
| `site/assets/icons/favicon.svg`、`site/assets/og/og-card.png`（本站标识：本站徽记，及徽记与站名合成的分享图） | ❌ 不适用本许可，亦不适用 [`LICENSE`](LICENSE)（MIT）；保留一切权利。标识的使用见 [`README.md`](README.md) §许可「标识保留」一节。此二者是同一枚徽记的两身，其设计稿为 `docs/design/logo_r15/mark_jia.svg`。**本次修订并将上一行之枚举扩及 PNG**（其原枚举为「SVG 美术资源」，**不及 PNG**）——此系与 [`README.md`](README.md) §许可 「`tools/`、`site/` 下除 `site/data/` 外的所有文件」之既有表述**对齐而补，非新授**；其一广，`site/assets/og/og-card.png` 即落入上一行之域，而当场为该行之「本站标识除外」所摘出，本行对此二身之摘出，自此不复只系于 [`README.md`](README.md) 一处。**本行只向后生效，不追既往**：在本次修订之前，本项目的许可文本对此二者所涵**并不相同**——`favicon.svg` 为**二处所涵**（本文件上一行**在本次修订前**作「`site/` 下的程序代码、样式、SVG 美术资源（底图、图标等）」，及 [`README.md`](README.md) §许可 的「`tools/`、`site/` 下除 `site/data/` 外的所有文件」）；`og-card.png` 系 PNG，**只为后一处所涵**——本文件上一行**在本次修订前**所枚举者为「SVG 美术资源」，**不及 PNG**。此处所引二段俱系**本次修订之前**之文，非修订后之文；二处文本自 2026-07-20 起如此。凡在此之前依当时文本取得副本者，其许可不因本次修订而失效。 |
| `tools/`（数据生成、校验与 QA 的程序） | ❌ 不适用，见 [`LICENSE`](LICENSE)（MIT）。本行是与 [`README.md`](README.md) §许可 的既有表述对齐而补，非新授。 |
| `docs/kaodui_index.md` | ✅ 适用（CC BY 4.0）。自 `data/csv/` 机械生成的派生物，与 `site/data/*.json` 同型，其许可从其源。 |
| `docs/conventions.md`、`docs/design/design_notes.md` | ✅ 适用（CC BY 4.0）。本数据集的凡例与规范；本文件与 [`README.md`](README.md) 俱指 `docs/conventions.md` 为数据凡例之权威，若数据适用本许可而其凡例不适用，则署名链断于本文件自身，故一并适用。 |
| `docs/kaodui_*.md`（考订件）、`docs/changes/*.md`（归档件）、`docs/delivery_*.md`（交付文档） | ❌ 不适用本许可，保留一切权利（另议）。本项目的考订与编辑成果之文字，非数据亦非代码；CC BY 不可撤回，未许可者他日可许可，故其许可另议，暂不发布任何公开许可。 |
| `docs/changes/*_sim.py`（8 个合并模拟自查脚本） | ❌ 不适用本许可，见 [`LICENSE`](LICENSE)（MIT）。归档的自查脚本，性属代码，与 `tools/` 同类。本行是**新予其明文**——`docs/` 下之物此前不在本文件与 [`README.md`](README.md) 的许可条款明文之内，不是承其旧。 |
| `docs/design/logo_r15/`（`mark_jia.svg`、`mark_yi.svg`、`logo_samples.html`，3 个） | ❌ 不适用本许可，亦不适用 [`LICENSE`](LICENSE)（MIT）；保留一切权利（另议）。本站标识的设计稿（甲版即今之站标），与上「本站标识」一行同其取向。 |
| `data/incoming/`（未合入的增量草稿，含未定稿的史料判断） | ⚠️ 同一许可条款，但内容随时改动、可能包含尚未复核定稿的材料，引用前请留意版本 |
| `private/`、`team/`、`.claude/` | ❌ 不公开发布，不适用任何公开许可 |
| 项目名、域名与本站标识的使用 | 见 [`README.md`](README.md) §许可「标识保留」一节。 |

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

> 经纬春秋 · chunqiu.timechorus.com

英文场景可用：

> chunqiu.timechorus.com — a sourced database of Chunqiu-era (Chinese Spring and Autumn period, 8th–5th c. BCE) historical figures

若引用具体条目，建议同时保留原始来源编号（如 `Z056`《左传·僖公三十三年》）与本库的 `coord_certainty`/`reliability` 等标注，以便读者判断史料可靠度层级——本数据集本身是对《左传》《国语》《史记》等传世文献的**结构化整理与考订标注**，不改变原始文献本身的公有领域地位；CC BY 4.0 约束的是**本项目的整理、编年、坐标考订、分层标注等编辑成果**。

## 免责声明

本数据集为科普与研究整理用途，标注了 `reliability`（可靠度：high / medium / low）与"后出叙事"等分层，但**不保证学术级别的完整性或准确性**；直接引用于学术写作前建议核对原始出处。详见 [`docs/conventions.md`](docs/conventions.md) 中的数据凡例。

---

代码许可见 [`LICENSE`](LICENSE)（MIT）；项目数据凡例、编码规范见 [`docs/conventions.md`](docs/conventions.md)；项目总览见 [`README.md`](README.md)。
