# 官方与主要维护方 Skills 来源核验

核验日期：**2026-10-25（Asia/Shanghai）**。本文是供 PHD-management-skills 选用的来源目录，列出 **32 个具体技能**；收录不表示已经安装、在本机运行通过或接入网页按钮。优先选取科研常用的文献、文档、数据、实验与代码工作流。

后续已引入其中经过筛选的子集，详见 [实际引入清单](THIRD_PARTY_SKILLS.md)。下文的“未安装/未执行”描述属于首次来源核验阶段；当前哪些文件已安装以该清单和 `skills/upstream-lock.json` 为准，其他候选仍未安装。

## 先看这几个结论

- **常规科研优先**：PDF 阅读与校对、可复现实验 Notebook、数据集体检、统计图、Zotero 引用管理、Word/PPT/表格交付。这些能补足现有论文和实验管理流程。
- **机器学习研究再选**：Hugging Face 数据集、模型本地运行、评测、Trackio、训练技能。训练和托管所需环境、账户及费用与本网站分开。
- **OpenAI 来源已迁移**：[openai/skills](https://github.com/openai/skills) 当前 README 标为 deprecated，推荐转向 [openai/plugins](https://github.com/openai/plugins)。旧 `.curated` 目录仍可读取，不能把旧清单当成当前首选入口；`.experimental` 本次返回 404。
- **Anthropic 文档套件不等于可自由再分发**：[官方说明](https://github.com/anthropics/skills) 把 `docx`、`pdf`、`pptx`、`xlsx` 标为 source-available，技能文件标明 Proprietary。目录仅提供原站链接，不把它们复制成项目自有技能。
- **“不填模型 API Key”是本工作台连接已登录 Codex 的能力**，不是所有外部技能的承诺。例如 OpenAI `transcribe` 明确要求 `OPENAI_API_KEY`；HF 云训练要求自己的账户、令牌及付费计划。

## 怎么选与项目如何配合

“建议”是针对本项目的适配判断，不是供应商质量认证。外部技能负责处理材料或运行工具；科研进度仍由项目的 `phd-progress` / `phd-import` 经 `node cli.mjs` 保存、回读。生成方案不能登记为实验成功，生成文档不能登记为论文已投稿。

| 场景 | 推荐起点 | 在本工作台内的配合方式 |
| --- | --- | --- |
| 读论文与核查引用 | PDF、Zotero、HF papers | 保留页码、DOI、阅读范围，交给 `phd-literature` 整理 |
| 清理实验表格 | XLSX / 数据质量工作流 | 先报告缺失、重复、单位和异常，再保存真实结论 |
| 做实验与比较结果 | Notebook、HF evaluations、Trackio | 保存版本、随机种子、命令、输出证据和失败记录 |
| 写论文与组会 | DOCX、PPTX、图表技能 | 使用真实结果与引用，完成后再更新论文进度 |
| 维护研究代码 | GitHub CI、代码审阅、安全检查 | 修复代码属于开发活动，不能自动冒充科研结果 |

## A. OpenAI 旧 curated 目录：6 项具体候选

以下路径及 `SKILL.md` 已核对，来源库已停止作为当前推荐入口。许可证按每个技能的 `LICENSE.txt` 判断；本次完整读取的 `pdf/LICENSE.txt` 为 Apache-2.0，**不把这一结论自动推广给未读的许可证**。

| 技能及原始文件 | 适合做什么 | 环境、账户与使用界限 | 本项目建议 |
| --- | --- | --- | --- |
| [pdf](https://github.com/openai/skills/blob/main/skills/.curated/pdf/SKILL.md) | 提取论文内容、制作 PDF、检查版式 | Python；`reportlab`、`pdfplumber`、`pypdf`；视觉核查需 Poppler；这些本地处理步骤不要求模型 API Key | 优先提供 PDF 阅读和交付检查流程；执行时检测实际工具 |
| [jupyter-notebook](https://github.com/openai/skills/blob/main/skills/.curated/jupyter-notebook/SKILL.md) | 实验、探索、教程 Notebook | Python；模板脚本；运行单元格需 Jupyter / ipykernel 与实验自身依赖 | 适合新增“整理可复现实验”指令 |
| [gh-fix-ci](https://github.com/openai/skills/blob/main/skills/.curated/gh-fix-ci/SKILL.md) | 检查并修复 GitHub Actions 失败 | Git、`gh`、GitHub 登录及仓库权限；外部 CI 不在其范围 | 可选研究代码维护；本项目当前不必为它引入 GitHub 依赖 |
| [gh-address-comments](https://github.com/openai/skills/blob/main/skills/.curated/gh-address-comments/SKILL.md) | 整理并处理代码 PR 评论 | `gh` 与 GitHub 权限；代码 PR 评论与论文审稿意见不同 | 保留在开发工具分类 |
| [security-best-practices](https://github.com/openai/skills/blob/main/skills/.curated/security-best-practices/SKILL.md) | Python、JS/TS、Go 安全实践审阅 | 需读取真实代码及对应参考文件；不是所有语言的通用扫描器 | 适合用户明确要求安全审阅时调用 |
| [transcribe](https://github.com/openai/skills/blob/main/skills/.curated/transcribe/SKILL.md) | 会议音频转写、可选说话人区分 | Python、OpenAI SDK、`OPENAI_API_KEY`、网络与对应调用费用；录音会交给外部服务 | 仅作为可选转写来源，不能标为免 Key；转写后交给 `phd-advisor` |

[PDF 许可证](https://github.com/openai/skills/blob/main/skills/.curated/pdf/LICENSE.txt)。旧目录的语音生成、截图、部署、Figma、Notion 等技能虽存在，但不是本地科研核心能力，因此不默认加入。

## B. OpenAI 当前插件来源：3 项已读候选

[openai/plugins](https://github.com/openai/plugins) 是当前官方示例来源。插件可能同时依赖 skills、脚本、MCP 或特定宿主能力，**不能只复制一个 SKILL.md 就宣称完整可用**。本次目录树未在下列对应插件内发现统一 `LICENSE` 文件，亦未完成其所有资源授权审查；采用官方插件入口或保留来源链接，不默认再分发其源码。

| 技能及原始文件 | 适合做什么 | 环境、账户与使用界限 | 本项目建议 |
| --- | --- | --- | --- |
| [zotero](https://github.com/openai/plugins/blob/main/plugins/zotero/skills/zotero/SKILL.md) | 查询本地文献库、导出 BibTeX、插入引用、导入 BibTeX/RIS | Zotero Desktop、本机 API（通常 23119）、Python 标准库 helper；写入文献库与读取附件范围应对应用户任务 | 很适合作为 `phd-literature` 的可选文献入口，先检查连接状态 |
| [visualize-data](https://github.com/openai/plugins/blob/main/plugins/data-analytics/skills/visualize-data/SKILL.md) | 定量图表、解释与质量检查 | 含宿主特定可视化路由；静态图可走 Python / Matplotlib，连接云数据另需权限 | 吸收“图能否支持结论”的审查要求；论文输出优先独立图文件 |
| [statistical-and-uncertainty-visualization](https://github.com/openai/plugins/blob/main/plugins/build-web-data-visualization/skills/statistical-and-uncertainty-visualization/SKILL.md) | 分布、置信区间、缺失、样本量与聚合偏差的展示 | 主要为设计工作流，执行依赖选定绘图库；依赖该插件的共享参考文件 | 适合“科研绘图”与“统计分析”流程；先判断不确定性再选图 |

另外已核对到 `plugins/data-analytics/skills/analyze-data-quality`、`jupyter-notebooks`、`validate-data`、`build-report`，以及 `plugins/life-science-research` 和 `plugins/ngs-analysis` 的技能目录。本次未逐个完成正文、依赖和许可审查，因此仅作为下一轮来源，不计入上面的已读候选数。

## C. Anthropic：10 项具体候选

[anthropics/skills](https://github.com/anthropics/skills) 是原维护方来源。下面四种文件处理技能应通过符合其服务协议的方式使用；不要因为 GitHub 可访问，就把它们重新打包到本仓库。[文档技能许可证示例](https://github.com/anthropics/skills/blob/main/skills/pdf/LICENSE.txt) 包含复制、派生及分发限制。`frontend-design` 的独立许可证本次核对为 Apache-2.0；其余普通技能应继续检查各自许可证，不以仓库介绍代替逐项确认。

| 技能及原始文件 | 适合做什么 | 环境、账户与使用界限 | 本项目建议 |
| --- | --- | --- | --- |
| [docx](https://github.com/anthropics/skills/blob/main/skills/docx/SKILL.md) | Word 论文、报告、修订与批注 | **Proprietary**；Node `docx`，部分流程 Python、Pandoc、LibreOffice、Poppler；上游“已预装”不代表本机已预装 | 作为兼容客户端的可选文档能力；本项目另写自己的证据与交付流程 |
| [pdf](https://github.com/anthropics/skills/blob/main/skills/pdf/SKILL.md) | 提取、合并、表单、OCR | **Proprietary**；Python PDF 库、Poppler；OCR 另需 Tesseract 等 | 仅链接来源；本地可优先选择许可明确的替代实现 |
| [pptx](https://github.com/anthropics/skills/blob/main/skills/pptx/SKILL.md) | 组会、开题、答辩幻灯片 | **Proprietary**；`pptxgenjs`、Python、LibreOffice/Poppler；字体影响跨平台版式 | 适合组会交付能力，需实际渲染检查 |
| [xlsx](https://github.com/anthropics/skills/blob/main/skills/xlsx/SKILL.md) | 结果表、数据清理、公式及图表 | **Proprietary**；Python `openpyxl`、`pandas` 等，公式重算可能需 LibreOffice；写公式不等于已经计算 | 适合实验结果表；保存重算、缺失值及单位检查结论 |
| [doc-coauthoring](https://github.com/anthropics/skills/blob/main/skills/doc-coauthoring/SKILL.md) | 协作写作、提案、文档读者检查 | 主要为文字流程；连接共享文档另需对应权限；该目录本次未发现独立 LICENSE.txt | 可作为工作流参考链接；不直接复制整段说明 |
| [skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) | 创建与改进技能、评估触发及输出 | 使用其评估脚本需 Python / 客户端环境；具体执行与许可证需按包检查 | 本项目新增技能时补触发例、反例及结果检查 |
| [mcp-builder](https://github.com/anthropics/skills/blob/main/skills/mcp-builder/SKILL.md) | 封装工具服务、整理工具接口 | Python 或 Node/TypeScript、相应 MCP SDK；服务账号取决于连接对象 | 以后接文献库或仪器数据时可选；不需要为普通进度更新引入 MCP |
| [webapp-testing](https://github.com/anthropics/skills/blob/main/skills/webapp-testing/SKILL.md) | 本地网页交互测试 | Python Playwright、已安装浏览器、可访问的本地服务；不能越过当前环境限制 | 开发维护工具，需独立安装与本机验证 |
| [frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | 网页排版、视觉表达与实现 | [独立 Apache-2.0 许可证](https://github.com/anthropics/skills/blob/main/skills/frontend-design/LICENSE.txt)；运行依赖由具体前端方案决定 | 适合界面维护，不作为科研成果技能 |
| [theme-factory](https://github.com/anthropics/skills/blob/main/skills/theme-factory/SKILL.md) | 统一文档、幻灯片及网页视觉主题 | 使用包内主题、字体等资源需继续检查各自许可和可用性 | 用于组会/答辩视觉一致性，保留用户原模板优先 |

## D. Hugging Face：13 项具体候选

[Hugging Face Skills](https://github.com/huggingface/skills) 由生态维护方提供，仓库根 [LICENSE](https://github.com/huggingface/skills/blob/main/LICENSE) 为 Apache-2.0。模型、数据集、字体及第三方依赖各自的许可证仍需单独检查，技能许可不替代数据与模型许可。当前官方推荐先用 `hf-cli` 了解本机 CLI，再按需发现技能；README 写明 Claude Code、Codex、Gemini CLI、Cursor 适配，**并未据此证明 WorkBuddy 已完成兼容测试**。

| 技能及原始文件 | 适合做什么 | 环境、账户与使用界限 | 本项目建议 |
| --- | --- | --- | --- |
| [hf-cli](https://github.com/huggingface/skills/blob/main/skills/hf-cli/SKILL.md) | 搜索、下载、管理 Hub 模型与数据资源 | `hf` CLI、网络；写入与私有资源通常需要账户令牌；上游还包含同步、删除、部署等动作 | 先用于只读发现，不能把整套 CLI 操作都自动开放 |
| [huggingface-datasets](https://github.com/huggingface/skills/blob/main/skills/huggingface-datasets/SKILL.md) | 查看 split、分页、过滤、统计、Parquet 地址 | Dataset Viewer HTTP API；受限/私有数据需 `HF_TOKEN`；上传另需权限 | 数据集登记与质量检查的优先候选；标明只看过样本还是全量 |
| [huggingface-papers](https://github.com/huggingface/skills/blob/main/skills/huggingface-papers/SKILL.md) | 读取 HF 论文页与作者、模型、数据链接 | 网络；面向 HF/arXiv 的 AI/计算机论文；账户写操作与阅读分开 | 与 `phd-literature` 配合，不充当全学科或完整系统综述数据库 |
| [huggingface-community-evals](https://github.com/huggingface/skills/blob/main/skills/huggingface-community-evals/SKILL.md) | `inspect-ai` / `lighteval` 本地模型评测 | Python/uv、评测框架、模型运行环境；GPU、受限模型令牌按任务需要；provider 模式可能收费 | 新增“评测模型”流程时记录基准版本、样本量和运行证据 |
| [huggingface-trackio](https://github.com/huggingface/skills/blob/main/skills/huggingface-trackio/SKILL.md) | 训练指标日志与查询、图表 | Python Trackio；同步到 HF Space 或 webhook 时需网络与对应配置 | 先接已有本地日志；云同步与外部通知不自动启用 |
| [huggingface-gradio](https://github.com/huggingface/skills/blob/main/skills/huggingface-gradio/SKILL.md) | Python 模型演示界面 | Python、Gradio、模型自身依赖；远端私有 Space 需令牌 | 适合单独实验演示；保留主工作台无生产依赖设计 |
| [huggingface-local-models](https://github.com/huggingface/skills/blob/main/skills/huggingface-local-models/SKILL.md) | GGUF 模型筛选、量化选择与本地推理 | llama.cpp、足够磁盘/内存或 GPU；下载需网络，受限模型可能需账户许可 | 帮用户判断机器能否运行模型；与驱动已登录 Codex 是两种不同模式 |
| [huggingface-llm-trainer](https://github.com/huggingface/skills/blob/main/skills/huggingface-llm-trainer/SKILL.md) | TRL/Unsloth 微调与训练 | HF Jobs、付费计划、`HF_TOKEN`、GPU 费用；结果需持久保存 | 可选高级功能；先估算成本与数据条件，不能当免费本地训练 |
| [huggingface-vision-trainer](https://github.com/huggingface/skills/blob/main/skills/huggingface-vision-trainer/SKILL.md) | 检测、分类、分割模型训练 | HF Jobs 云 GPU、付费账户、写令牌、数据格式及框架依赖 | 适合计算机视觉课题，须有真实训练和评测输出后更新进度 |
| [train-sentence-transformers](https://github.com/huggingface/skills/blob/main/skills/train-sentence-transformers/SKILL.md) | 嵌入、重排序、稀疏和多向量检索训练 | Python、sentence-transformers、对应训练硬件；数据与模型下载/发布权限按需 | 适合文献检索/RAG研究；使用配套参考和模板，不能只读取入口就完成训练 |
| [huggingface-paper-publisher](https://github.com/huggingface/skills/blob/main/skills/huggingface-paper-publisher/SKILL.md) | HF 论文页、模型与数据关联 | Python/uv、HF 写令牌；可能公开内容、认领作者；不是期刊投稿或 arXiv 审核通道 | 保存可选发布入口，用户明确要求发布后才执行 |
| [huggingface-tool-builder](https://github.com/huggingface/skills/blob/main/skills/huggingface-tool-builder/SKILL.md) | 编写重复使用的 Hub 查询工具 | 目录与技能说明已核对；网络、Python/JS 依赖随工具方案确定，私有资源需权限 | 可用于整理模型/数据快照；本次未完整验证配套脚本 |
| [hf-mem](https://github.com/huggingface/skills/blob/main/skills/hf-mem/SKILL.md) | 估算加载 Safetensors/GGUF 权重的内存需求 | 目录及官方 README 能力说明已核对；需 HF CLI/元数据访问，估算不等于实测峰值显存 | 训练前准备的补充；本次未读取全部实现与验证运行 |

最后两项核验深度为“目录 + 官方 README 能力说明”，其余上述 HF 项已读取入口 `SKILL.md`。HF 某些入口还引用 `hugging-face-jobs` 等旧名称或外部路径；当前 `skills/` 目录里未发现同名目录，不能假设依赖会自动补齐。执行前应根据当前 `hf --help`、官方文档与实际安装包重新确认。

## 为什么不一次装完

1. **按任务发现**：公开标准 [Agent Skills specification](https://agentskills.io/specification) 定义了必需的 `name` / `description` 与可选兼容信息。一个文件能被读懂，并不代表其工具、账户和脚本都能在每种客户端中运行。
2. **保留不同层级**：本项目自有技能用于可靠的数据写入；外部技能目录提供选用入口；需要安装/账户/GPU的能力标为可选。
3. **不覆盖本项目约定**：外部技能文本、文献、模型卡只是参考。自动上传、云部署、后台监控、覆盖原始数据与删除记录不能从“推荐技能”推导出授权。
4. **以结果证明可用**：文件处理验收要检查输出；实验验收要有真实日志、指标与证据。来源活跃、关注量高或被官方收录，都不等于已在本机验收。

## 本次核验记录与局限

- 已进行网页搜索并打开主要维护方页面、Agent Skills 规范和相关源文件；目录使用 GitHub 只读 Contents / Git Trees API 复核，没有安装外部技能、运行其脚本或改动全局技能目录。
- 按本机 `skill-installer` 尝试运行只读清单 helper，但系统 `python3` 因 Xcode 许可尚未接受而退出；未接受系统许可或安装工具，改用 Node 读取同一 GitHub API。后续 GitHub API 部分请求返回 403，改以已取得目录快照和 GitHub 网页核查；未把未读的文件标成已验收。
- 当前 `openai/skills/skills/.curated` 有 **39** 个目录；`.experimental` 返回 **404**。`anthropics/skills/skills` 有 **19** 个目录；`huggingface/skills/skills` 有 **25** 个目录，仓库另有 `hf-mcp/skills/hf-mcp`。这些是当天目录数量，不是推荐安装数量。
- 首次检索快照标识（实际引入提交已另行核验并写入 `skills/upstream-lock.json`）：OpenAI Skills `49f948faa9258a0c61caceaf225e179651397431`；OpenAI Plugins `0722921d5542fc593105c27bd52630babd8b8c2a`；Anthropic Skills `dbd4588f9e1033efb41dad4bef2f7947c8993d44`；HF Skills `fabc634a893f62ad5c2039830397efa35fa62715`。链接使用上游 `main`，后续名称、内容及条款可能变化。
- 此处是公开来源、依赖与适配判断，未穷尽所有社区技能，也未对上游脚本逐行安全审计、实测各客户端、验证付费资源或检验每项许可证。导入任一外部包前，应针对选择的那一项完成这些检查。
