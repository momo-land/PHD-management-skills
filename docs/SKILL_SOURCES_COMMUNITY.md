# 科研 Skills 社区来源与选用说明

核验日期：**2026-10-25（Asia/Shanghai）**。

后续已引入其中经过筛选的子集，详见 [实际引入清单](THIRD_PARTY_SKILLS.md)。下文的“未安装/未执行”描述属于首次来源核验阶段；当前哪些文件已安装以该清单和 `skills/upstream-lock.json` 为准，其他候选仍未安装。

本清单面向博士科研：找文献、读论文、设计实验、分析数据、写作、复现、汇报与投稿。共查到 **11 个真实来源仓库**，其中 9 个已核对明确的仓库或单项许可，另 2 个因未找到明确许可仅列观察来源。它不是“全网所有技能”或效果排行榜；按任务覆盖、依赖透明度、证据习惯和许可情况选择，不用 star 数代替质量判断。

**这里是来源索引，不代表这些第三方技能已经安装或通过运行测试。** 项目内置 `phd-*` 技能负责本工作台的数据约定；第三方技能不能直接覆盖本项目的 CLI、真实证据和保存规则。

## 从哪里开始

| 你想完成什么 | 优先看哪个来源 | 适用说明 |
| --- | --- | --- |
| 文献综述、引用整理、统计与科研绘图 | K-Dense Scientific Agent Skills | 科研覆盖较广，但要逐项检查环境与账号 |
| 基于真实材料写论文、检查声明和证据 | K-Dense Scientific Writer 的单项技能 | 单项写作指令可以独立使用；整套应用有额外服务依赖 |
| ML/AI 论文、模型评估、实验跟踪 | Orchestra Research | 更适合计算机与机器学习课题 |
| Hugging Face 数据、训练日志、模型实验 | Hugging Face Skills | 区分本地操作、Hub 写入与付费云训练 |
| 笔记本实验、可复现分析 | OpenAI Skills 的 Jupyter Notebook（旧入口） | 模板生成轻量；新选型优先核对当前官方 Plugins，详见官方来源目录 |
| 把文字写得清楚、自然 | Humanizer | 用于语言编辑；不替代事实核验、学术规范或 AI 使用披露 |
| 精读材料与复现附件组织 | VincenzoImp Academic Research Skills | 目录约定明确；部分流程强依赖指定 MCP |
| 了解多阶段论文写作与返修流程 | Imbad0202 Academic Research Skills | 非商业许可，先按自己的用途检查条款 |
| 学习技能制作、文档协作方法 | Anthropic Skills | 官方来源，但不同子目录的许可差异很大 |

## 9 个已核对许可的来源

### 1. K-Dense Scientific Agent Skills

[仓库](https://github.com/K-Dense-AI/scientific-agent-skills)；旧地址 `K-Dense-AI/claude-scientific-skills` 目前重定向到这里。当前目录为 `skills/`。仓库声明 MIT，同时明确要求检查每个 `SKILL.md` 的独立许可。[仓库许可说明](https://github.com/K-Dense-AI/scientific-agent-skills#-license)

已阅读以下技能正文的元数据和主要流程，未执行所附脚本：

| 具体路径与链接 | 可以借助它做什么 | 依赖与边界 |
| --- | --- | --- |
| [`skills/literature-review/SKILL.md`](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/literature-review/SKILL.md) | 检索、筛选、证据整理和综述 | 单项 MIT；Python 3.10+、requests、联网检索；PDF 另需 Pandoc/XeLaTeX；可选示意图需要 OpenRouter；不自带完整元分析引擎 |
| [`skills/statistical-analysis/SKILL.md`](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/statistical-analysis/SKILL.md) | 选择检验、检查假设、效应量与不确定性 | 单项 MIT；Python 3.12+，需独立科学计算环境；结果仍需研究设计支持 |
| [`skills/pyzotero/SKILL.md`](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/pyzotero/SKILL.md) | Zotero 文献读取与管理 | 单项 MIT；Python、pyzotero；私有远程读取/写入需要 Zotero 授权；本地读取需启用本地 API，写入要求另查当前版本 |
| [`skills/research-lookup/SKILL.md`](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/skills/research-lookup/SKILL.md) | 整理论文所需的外部证据包 | 单项 MIT；默认使用 Parallel CLI 及登录/服务；部分可选路径需 API Key；不能标为“无需任何账号” |

目录树还核实了这些候选路径的存在，但本轮未逐项审阅完整内容或独立许可：`skills/citation-management/`、`skills/experimental-design/`、`skills/statistical-power/`、`skills/exploratory-data-analysis/`、`skills/scientific-visualization/`、`skills/peer-review/`、`skills/research-grants/`、`skills/scientific-slides/`、`skills/venue-templates/`、`skills/uncertainty-and-units/`。按实际学科另选生物、化学、材料、地学等工具，避免把所有运行环境一起装入工作台。

### 2. K-Dense Scientific Writer

[仓库](https://github.com/K-Dense-AI/claude-scientific-writer)；[独立写作技能](https://github.com/K-Dense-AI/claude-scientific-writer/blob/main/skills/scientific-writing/SKILL.md)。仓库 MIT，抽查的 `skills/scientific-writing/SKILL.md` 也明确为 MIT；其核心流程不绑定模型服务，可选本地检查工具要求 Python 3.11+。

要区分“读取某个技能”与“运行完整 Scientific Writer 应用”：整套应用的 README 要求 Anthropic API Key、Parallel 身份验证，PDF 另需 LaTeX；可选 AI 制图需 OpenRouter。`pyproject.toml` 也声明了 Claude Agent SDK 等依赖。因此，不能把整套应用介绍成当前本地 Codex 连接的无密钥替代品。[应用前提](https://github.com/K-Dense-AI/claude-scientific-writer#prerequisites) · [依赖文件](https://github.com/K-Dense-AI/claude-scientific-writer/blob/main/pyproject.toml)

候选目录：`skills/citation-management/`、`skills/peer-review/`、`skills/scientific-slides/`、`skills/venue-templates/`。仓库还包含文档处理技能的独立 `LICENSE.txt`，不能由仓库 MIT 推断所有子项许可相同。

### 3. Orchestra Research AI Research Skills

[仓库](https://github.com/Orchestra-Research/AI-Research-SKILLs)；[MIT 许可](https://github.com/Orchestra-Research/AI-Research-SKILLs/blob/main/LICENSE)。抽查正文：

- [`20-ml-paper-writing/ml-paper-writing/SKILL.md`](https://github.com/Orchestra-Research/AI-Research-SKILLs/blob/main/20-ml-paper-writing/ml-paper-writing/SKILL.md)：ML 论文结构、引用核验与会议准备；单项 MIT，列出 semanticscholar、arxiv、habanero、requests，文献访问及 LaTeX 输出按需准备。
- [`13-mlops/mlflow/SKILL.md`](https://github.com/Orchestra-Research/AI-Research-SKILLs/blob/main/13-mlops/mlflow/SKILL.md)：实验参数、指标和产物记录；单项 MIT，列出 mlflow、sqlalchemy、boto3。云端集成需要相应服务配置，本地日志不应自动上传。

另核实候选目录：`11-evaluation/lm-evaluation-harness/`、`20-ml-paper-writing/academic-plotting/`、`20-ml-paper-writing/presenting-conference-talks/`、`21-research-ideation/brainstorming-research-ideas/`、`22-agent-native-research-artifact/rigor-reviewer/`。训练与评测通常需要额外 Python 包、数据、算力和模型许可；技能包本身不会提供这些资源。

### 4. Hugging Face Skills

[官方仓库](https://github.com/huggingface/skills)；[仓库 Apache-2.0 许可](https://github.com/huggingface/skills/blob/main/LICENSE)。抽查正文：

- [`skills/huggingface-trackio/SKILL.md`](https://github.com/huggingface/skills/blob/main/skills/huggingface-trackio/SKILL.md)：训练指标与运行日志；需要 Trackio。其文档包含同步到 Spaces 的路径，自动创建的 Space 可能公开，采用时应先明确本地/私有/公开范围。
- [`skills/huggingface-llm-trainer/SKILL.md`](https://github.com/huggingface/skills/blob/main/skills/huggingface-llm-trainer/SKILL.md)：云 GPU 训练；文档列出付费计划、HF 登录、写入令牌和算力前提。其许可字段指向 `LICENSE.txt`，本轮目录树未发现该同目录文件；分发前需进一步核对，不能只凭仓库许可消除这个不一致。

候选路径已核实：`skills/huggingface-datasets/`、`skills/huggingface-community-evals/`、`skills/huggingface-papers/`、`skills/train-sentence-transformers/`、`skills/huggingface-local-models/`。读取论文、数据检索、训练与发布的授权要求不同，不应把“科研技能”按钮自动变成付费训练或公开上传。

### 5. OpenAI Skills

[官方仓库](https://github.com/openai/skills)。不假设整个仓库只有一种许可，按子目录检查。

该仓库当前已标记 deprecated，推荐迁移到 [openai/plugins](https://github.com/openai/plugins)。这里保留已核验的旧 Notebook 入口作为参考，当前官方入口和详细条件见 [官方来源目录](SKILL_SOURCES_OFFICIAL.md)。两个来源目录有重叠，不应把条目数量相加当作不同项目总数。

已阅读 [`skills/.curated/jupyter-notebook/SKILL.md`](https://github.com/openai/skills/blob/main/skills/.curated/jupyter-notebook/SKILL.md)：适合实验与教学笔记本，要求记录环境并验证从头运行。脚手架使用 Python 标准库；执行实验时另需内核和实际科学计算包。[该技能许可](https://github.com/openai/skills/blob/main/skills/.curated/jupyter-notebook/LICENSE.txt)已核对为 Apache-2.0。

还核实了 `skills/.curated/pdf/` 与 `skills/.system/skill-creator/` 目录。本轮未完整审阅它们的附属脚本；本机已有同类能力时优先复用，避免重复安装与同名冲突。

### 6. Humanizer

[仓库](https://github.com/blader/humanizer)；确切入口是根目录 [`SKILL.md`](https://github.com/blader/humanizer/blob/main/SKILL.md)，不要误写成不存在的普通目录层级。仓库和技能元数据均为 [MIT](https://github.com/blader/humanizer/blob/main/LICENSE)。已阅读指令正文；作为 Markdown 编辑指引，没有独立模型服务账号要求。

推荐用于减少套话、简化句子、保持作者口吻。项目适配应保留术语、数字、引用、限定条件和作者原意；不承诺通过 AI 检测，不用于隐瞒期刊或学校要求披露的 AI 使用。

### 7. VincenzoImp Academic Research Skills

[仓库](https://github.com/VincenzoImp/academic-research-skills)；[MIT 许可](https://github.com/VincenzoImp/academic-research-skills/blob/main/LICENSE)。仓库规模较小，作为结构明确的工作流参考，不据此承诺成熟度。

- [`skills/digest-paper/SKILL.md`](https://github.com/VincenzoImp/academic-research-skills/blob/main/skills/digest-paper/SKILL.md)：论文归档与证据整理；单项 MIT。原流程硬性要求 arXiv 全文 MCP 及至少一个书目 MCP，缺失时不能声称原版可运行。
- [`skills/package-artifacts/SKILL.md`](https://github.com/VincenzoImp/academic-research-skills/blob/main/skills/package-artifacts/SKILL.md)：复现附件、清单和独立验证；单项 MIT。需真实论文、代码、数据及其环境，不是生成一个 README 就算复现完成。

其他已核实路径：`skills/explore-sota/`、`skills/write-survey/`、`skills/adversarial-review/`、`skills/manage-submission/`。若改成当前项目的普通搜索/文件流程，要标为原创适配，不宣称完全执行了上游要求的 MCP 流程。

### 8. Imbad0202 Academic Research Skills

[仓库](https://github.com/Imbad0202/academic-research-skills)；已读 [`academic-paper/SKILL.md`](https://github.com/Imbad0202/academic-research-skills/blob/main/academic-paper/SKILL.md) 的入口与模式说明。目录包含 `academic-paper-reviewer/`、`academic-pipeline/`、`deep-research/`、`sr-screener/`。

当前 [`LICENSE`](https://github.com/Imbad0202/academic-research-skills/blob/main/LICENSE)明确为 **CC BY-NC 4.0**。本索引仅链接供了解论文写作、返修与引用审查流程，不直接纳入可商用的技能分发包。它描述了多代理、LaTeX、经 Pandoc 输出 DOCX/PDF 等能力；本轮未运行整条流水线，也未验证每个客户端能否提供所需工具。

### 9. Anthropic Skills

[官方仓库](https://github.com/anthropics/skills)。抽查 [`skills/doc-coauthoring/SKILL.md`](https://github.com/anthropics/skills/blob/main/skills/doc-coauthoring/SKILL.md) 的协作文档流程，以及两类许可：

- [`skills/skill-creator/LICENSE.txt`](https://github.com/anthropics/skills/blob/main/skills/skill-creator/LICENSE.txt) 是 Apache-2.0。
- [`skills/pdf/LICENSE.txt`](https://github.com/anthropics/skills/blob/main/skills/pdf/LICENSE.txt) 是 Anthropic 服务条款下的专有许可，附有复制、衍生和分发限制，**不能作为普通开源技能复制到本项目**。

`skills/docx/`、`skills/pptx/`、`skills/xlsx/` 也有独立许可文件，本轮只确认路径，未逐一作完整许可判断。文档处理通常还涉及 Python、Office 渲染或 PDF 工具；按实际技能检查，不将“官方来源”理解为无依赖或任意转载。

## 2 个仅观察的来源

以下仓库、技能正文和目录真实可访问，但在本轮目录树中未找到明确许可文件，技能元数据也未提供可直接采用的授权。**仅保留链接，不复制分发。**

| 来源 | 确切路径 | 可关注之处 | 尚未核验 |
| --- | --- | --- | --- |
| [Zsun79/LitReviewSkill](https://github.com/Zsun79/LitReviewSkill) | [`skills/write-literature-review/SKILL.md`](https://github.com/Zsun79/LitReviewSkill/blob/main/skills/write-literature-review/SKILL.md) | 种子文献、前后向引用扩展、筛选记录 | 未核实运行脚本与 OpenAlex 当前账户/限额要求；迭代停止不等于穷尽所有文献 |
| [199-biotechnologies/claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill) | [`SKILL.md`](https://github.com/199-biotechnologies/claude-deep-research-skill/blob/main/SKILL.md) | 多来源报告、证据留存与逐条声明核验 | 未运行 Python 依赖或验证仓库中的效果比较；营销表述不视为实测证据 |

## 最值得为本工作台新增的 10 个工作流

下列是针对本项目的原创产品建议，名称是建议口令，不表示已安装对应第三方包。实现时可研究上面的来源，但应重新写成符合本项目契约的短流程。

| 建议口令 | 用户提供什么 | 应得到什么 | 保存与真实性要求 |
| --- | --- | --- | --- |
| **精读这篇论文** | PDF、DOI 或可访问链接 | 问题、方法、证据、局限、与课题关系 | 标注读到了全文、摘要还是局部；不把摘要当全文 |
| **整理文献综述** | 研究问题、范围、已有文献 | 可复查检索记录、筛选表、证据矩阵与综述草稿 | 记录检索时间和覆盖范围，未获取全文单列 |
| **核验参考文献** | BibTeX 或参考文献列表 | 作者、年份、标题、DOI 对照与疑点清单 | 区分存在性、元数据准确性与是否支持论点 |
| **制定实验计划** | 假设、条件、资源限制 | 基线、对照、消融、判定标准、预算 | 计划只保存为计划，不产生完成率或结果 |
| **检查数据和统计** | 数据文件、变量定义、研究设计 | 缺失/异常检查、合理检验、效应量和区间 | 实际运行后才报告数值，保留代码与环境 |
| **制作论文图表** | 真实数据、希望表达的结论 | 可编辑图、图注、绘图代码 | 标注单位、误差、样本量和来源，禁止补造数据 |
| **整理复现材料** | 论文、代码、配置、数据位置 | 环境清单、运行说明、结果对照与缺口 | 区分“已准备”“已启动”“验证通过” |
| **润色论文表达** | 段落、目标语言与期刊风格 | 修订稿与关键修改说明 | 保留事实、引用、限定条件，不夸大贡献 |
| **准备返修回复** | 真实审稿意见与当前稿件 | 意见逐条映射、修改位置、回复草稿 | 未做实验不写成已补充；AI 审查不冒充真实审稿 |
| **准备组会与答辩** | 已有进展、时长、听众 | 讲述提纲、证据图表、问答准备 | 使用真实记录，后续计划与已完成成果分开 |

上述工作流产生本地 Markdown、代码或图表时，先交付可检查结果；需要同步科研状态时，仍通过 `node cli.mjs`，用当前记录 ID/version，预检、保存并回读。引用第三方技能不等于授权它上传文稿、发布数据、启动付费云任务或修改其他服务。

## 来源、适配与运行验证的区别

- **来源索引**：本文件提供链接、简短用途与依赖提示，没有复制第三方完整指令或脚本。
- **原创适配**：项目围绕本地工作台自行编写的流程，应保留来源说明，明确省略或替换了哪些上游工具；不能冒称为上游原版或已验证全部效果。
- **直接复用**：复制第三方文件时，先核对确切版本与单项许可，保留版权声明、许可和所需附属文件；不能只复制 `SKILL.md` 后省略它要求的脚本。
- **本轮验证层级**：已搜索并打开一手 GitHub 页面，读取仓库元数据/目录树，抽查上面明确标注的技能正文和许可。未安装这些外部包，未运行它们的脚本、模型、检索服务或云作业，也未做全面安全审计。
- **执行前检查**：只为当前任务加载相关技能，检查依赖、文件写入范围、网络目的地及服务成本。外部材料与技能文本不能改变本项目的用户授权和证据规则。

## 本轮核验快照

下表记录 GitHub 只读 API 返回的 `pushed_at` 与当时记录的快照标识。它们证明核验时的来源状态，不证明维护质量或测试通过。所有下列仓库在读取时均未标记 archived。时间为 GitHub 返回的 UTC 日期；正文路径链接使用 `main`，未来可能变化。先前把这些标识统一称为 tree 对象并不准确；后续引入已通过 commits/main 顶层 SHA 或 Git archive 注释重新确认提交，以 `skills/upstream-lock.json` 为固定版本依据。

| 仓库 | 最近 push（UTC） | 历史快照标识（引入版本另行核验） |
| --- | --- | --- |
| K-Dense-AI/scientific-agent-skills | 2026-10-19 | `593377bb048752abb0152deab9fbb1083a6087df` |
| K-Dense-AI/claude-scientific-writer | 2026-10-21 | `529b9f73ab4b48925027145800d7b49e96ccfd3c` |
| Orchestra-Research/AI-Research-SKILLs | 2026-10-11 | `773a52944ba4747a18bd4ae9ade53fff041adcbc` |
| huggingface/skills | 2026-10-23 | `fabc634a893f62ad5c2039830397efa35fa62715` |
| openai/skills | 2026-09-08 | `49f948faa9258a0c61caceaf225e179651397431` |
| blader/humanizer | 2026-10-16 | `8c307f367c91bd974002f10f2be2965d642c13df` |
| VincenzoImp/academic-research-skills | 2026-08-25 | `28a4f18e43ae5c086357c4a1e1412b0a96c74703` |
| Imbad0202/academic-research-skills | 2026-10-25 | `77e77e871aeccf5b5740a3086903f914e58c4204` |
| anthropics/skills | 2026-10-09 | `dbd4588f9e1033efb41dad4bef2f7947c8993d44` |
| Zsun79/LitReviewSkill | 2026-06-08 | `a53cd419352e4dd05958f67340fde3642d84abc3` |
| 199-biotechnologies/claude-deep-research-skill | 2026-04-11 | `f2f2c0fa4e7617ca84c86b63f4bb40f77a746933` |

后续扩展时应持续补充领域专用来源，而非默认把所有候选装进一个目录。优先补足真正缺失的科研环节，并用真实但非敏感的示例验证输入、产物与错误提示。
