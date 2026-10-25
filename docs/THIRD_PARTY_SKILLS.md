# 已引入的 GitHub 原版技能

[English](THIRD_PARTY_SKILLS.en.md) · [技能目录](../技能目录.md)

已将 **10 个上游技能**实际引入本项目，保留原版说明和所选技能目录中的配套文件，固定到提交版本并保存许可证与 SHA-256 校验值。这里列的是已下载接入的内容。

## 怎么使用

刷新 Skills 中心，搜索 **GitHub** 即可找到。也可在已激活 `phd-manager` 的对话中说“用 GitHub 原版文献综述技能处理这些材料”等。中英文入口会读取完整原版和需要的参考资料；原版正文保持原语言，不冒称已经完整翻译。新入口可在下一轮对话使用；客户端未识别时刷新项目或技能列表。

已安装的是技能文件；Python 科学计算库、本地软件、远程账户与付费服务没有一并安装或开通。每项实际运行前检查下表条件。

| 项目入口 | 原版来源与版本 | 许可 | 使用条件 |
| --- | --- | --- | --- |
| [文献综述](../skills/github-literature-review/SKILL.md) | [K-Dense-AI/scientific-agent-skills@593377bb](https://github.com/K-Dense-AI/scientific-agent-skills/tree/593377bb048752abb0152deab9fbb1083a6087df/skills/literature-review) | [MIT](../vendor/skills/github-literature-review/upstream-licenses/LICENSE.txt) | 方法指导可直接阅读；DOI检查需 Python 3.10+、requests、网络。PDF导出另需 Pandoc/XeLaTeX；Parallel检索与OpenRouter示意图是可选账号/API功能。 |
| [引文管理](../skills/github-citation-management/SKILL.md) | [K-Dense-AI/scientific-agent-skills@593377bb](https://github.com/K-Dense-AI/scientific-agent-skills/tree/593377bb048752abb0152deab9fbb1083a6087df/skills/citation-management) | [MIT](../vendor/skills/github-citation-management/upstream-licenses/LICENSE.txt) | Python 3.9+；BibTeX格式化仅标准库；校验与检索需requests；Google Scholar补充检索需scholarly并可能被限流。基础检索无模型API密钥要求，NCBI/OpenAlex账号密钥可选。 |
| [统计方法](../skills/github-statistical-analysis/SKILL.md) | [K-Dense-AI/scientific-agent-skills@593377bb](https://github.com/K-Dense-AI/scientific-agent-skills/tree/593377bb048752abb0152deab9fbb1083a6087df/skills/statistical-analysis) | [MIT](../vendor/skills/github-statistical-analysis/upstream-licenses/LICENSE.txt) | Python 3.12+；实际计算需NumPy/pandas/SciPy/Matplotlib，按分析选择Pingouin、statsmodels；贝叶斯另需PyMC/ArviZ。依赖使用隔离环境，需检查实际版本兼容性。 |
| [论文绘图工具](../skills/github-scientific-visualization/SKILL.md) | [K-Dense-AI/scientific-agent-skills@593377bb](https://github.com/K-Dense-AI/scientific-agent-skills/tree/593377bb048752abb0152deab9fbb1083a6087df/skills/scientific-visualization) | [MIT](../vendor/skills/github-scientific-visualization/upstream-licenses/LICENSE.txt) | Python 3.11+；配色和导出规划部分用标准库。作图需Matplotlib，图像检查需Pillow，PDF检查需pypdf；Seaborn/Plotly按需，Plotly静态导出另需Kaleido与Chrome/Chromium。 |
| [论文自查](../skills/github-peer-review/SKILL.md) | [K-Dense-AI/scientific-agent-skills@593377bb](https://github.com/K-Dense-AI/scientific-agent-skills/tree/593377bb048752abb0152deab9fbb1083a6087df/skills/peer-review) | [MIT](../vendor/skills/github-peer-review/upstream-licenses/LICENSE.txt) | Python 3.11+标准库；附带本地JSON/CSV/Markdown校验器，无模型API、外部账号或联网要求。 |
| [实验设计工具](../skills/github-experimental-design/SKILL.md) | [K-Dense-AI/scientific-agent-skills@593377bb](https://github.com/K-Dense-AI/scientific-agent-skills/tree/593377bb048752abb0152deab9fbb1083a6087df/skills/experimental-design) | [MIT](../vendor/skills/github-experimental-design/upstream-licenses/LICENSE.txt) | Python 3.12+与NumPy/pandas；生成DOE矩阵另需pydoe 1.5.0。仅安装依赖时需要网络，不需要API密钥。 |
| [HF 论文查询](../skills/github-huggingface-papers/SKILL.md) | [huggingface/skills@fabc634a](https://github.com/huggingface/skills/tree/fabc634a893f62ad5c2039830397efa35fa62715/skills/huggingface-papers) | [Apache-2.0](../vendor/skills/github-huggingface-papers/upstream-licenses/LICENSE.txt) | 公开论文页面读取需要联网及 HTTP/网页读取能力，无必需模型 API 密钥。搜索/列表示例使用 HF_TOKEN；账号写操作需要 Hugging Face 授权。 |
| [本地实验日志](../skills/github-huggingface-trackio/SKILL.md) | [huggingface/skills@fabc634a](https://github.com/huggingface/skills/tree/fabc634a893f62ad5c2039830397efa35fa62715/skills/huggingface-trackio) | [Apache-2.0](../vendor/skills/github-huggingface-trackio/upstream-licenses/LICENSE.txt) | 运行指标读写需另有 Python 和 trackio 包；本地模式无需模型 API 密钥。HF Space 同步需联网与账号授权，云资源费用取决于用户选用服务。 |
| [自然表达润色](../skills/github-humanizer/SKILL.md) | [blader/humanizer@8c307f36](https://github.com/blader/humanizer/tree/8c307f367c91bd974002f10f2be2965d642c13df) | [MIT](../vendor/skills/github-humanizer/upstream-licenses/LICENSE.txt) | 纯文本编辑工作流无需额外软件包、账号或模型 API 密钥；由当前 AI 客户端读取用户提供的文本。 |
| [研究选题构思](../skills/github-brainstorming-research-ideas/SKILL.md) | [Orchestra-Research/AI-Research-SKILLs@773a5294](https://github.com/Orchestra-Research/AI-Research-SKILLs/tree/773a52944ba4747a18bd4ae9ade53fff041adcbc/21-research-ideation/brainstorming-research-ideas) | [MIT](../vendor/skills/github-brainstorming-research-ideas/upstream-licenses/LICENSE.txt) | 纯文本选题工作流，无额外运行包、账号或模型 API 密钥要求；核查新颖性和现有工作需要可用检索工具。 |

## 接入说明

- **文献综述**：仅接入检索、筛选、证据综合和本地文档路径。示意图明确可选；不自动运行两个generate_schematic脚本，不扫描.env，不安装Parallel或调用付费API。公开检索可使用当前可用工具。 本入口不运行 scripts/generate_schematic.py、scripts/generate_schematic_ai.py，这些原文件只作为完整来源保留。 原文要求对有实质贡献的Scientific Agent Skills论文进行引用；本项目保留该说明，但科研引用仍应基于实际使用与核验，不自动插入无关引用。
- **引文管理**：可优先使用本地BibTeX格式化或公共文献元数据检索；源文件保留，改写输出到新文件。不得把DOI存在等同于引用支持论点。仅按请求查询公开书目信息，不传未发表稿件。 原文要求对有实质贡献的Scientific Agent Skills论文进行引用；本项目保留该说明，但科研引用仍应基于实际使用与核验，不自动插入无关引用。
- **统计方法**：可先选方法、核对假设与报告格式；只有完成真实计算才能输出数值结果。上游版本示例是指定快照，不代表本机已安装。无需模型API密钥。 原文要求对有实质贡献的Scientific Agent Skills论文进行引用；本项目保留该说明，但科研引用仍应基于实际使用与核验，不自动插入无关引用。
- **论文绘图工具**：优先本地Matplotlib/静态图，不引入网站浏览器依赖。需要查看实际成图后才声称已完成视觉检查。期刊规格是日期快照，投稿前重新核验。 原文要求对有实质贡献的Scientific Agent Skills论文进行引用；本项目保留该说明，但科研引用仍应基于实际使用与核验，不自动插入无关引用。
- **论文自查**：适合自查或已授权材料审读；上游有严格授权/期刊政策入口。本人稿件已有审查授权时沿用，不重复索取。建议仍标为AI草稿，不代表真实评审或编辑决定；不根据上游留存建议擅自删文件。 原文要求对有实质贡献的Scientific Agent Skills论文进行引用；本项目保留该说明，但科研引用仍应基于实际使用与核验，不自动插入无关引用。
- **实验设计工具**：用于真实采集前的随机化、分块、因子设计和批次规划；计划不能标为已执行。样本量或模型细节引用未收录的statistical-power/statsmodels/pymc时，使用本机可用工具并说明能力范围。 原文要求对有实质贡献的Scientific Agent Skills论文进行引用；本项目保留该说明，但科研引用仍应基于实际使用与核验，不自动插入无关引用。
- **HF 论文查询**：默认仅读取公开论文；作者认领、索引和链接修改需用户明确要求。Markdown 端点在没有 arXiv HTML 时可能仅返回 HF 页面，不能当作已阅读全文。API 返回的 AI 摘要不能作为原始研究证据。无跨目录文件依赖。
- **本地实验日志**：仅处理用户指定的本地实验日志；默认不云同步、不设置 webhook、不自动改参重跑或持续监控。HF 自动创建 Space 可能默认公开。其 references/retrieving_metrics.md 尾部 docs/source/cli_commands.md 和 docs/source/api_mcp_server.md 不在技能包或本仓库中，是外部 Trackio 项目文档引用；如需要应查官方 Trackio 文档而非假定本地存在。
- **自然表达润色**：用于清晰自然的表达，不承诺规避 AI 检测；学术使用须保留科学含义、限定条件、引文和真实作者信息。完整根目录已保留；附带 validate-package.py 为静态包校验脚本，已审读、未运行。嵌套 AGENTS.md 仅描述上游包维护，不覆盖项目约定。
- **研究选题构思**：原创上游完整单文件，未改原文；选题方案是 AI 建议，不能作为已完成实验或已核实创新。提及的 scientific-skills:literature-review 是其他技能推荐，不是已安装依赖；本项目可路由到已有文献综述技能。无脚本或跨目录文件依赖。

## 文件保存在哪里

- `skills/github-*/`：我们编写的中英文接入说明与客户端展示信息。
- `vendor/skills/<id>/upstream/`：保留字节内容的原版文件，放在客户端技能发现目录之外。
- `vendor/skills/<id>/upstream-licenses/`：适用的仓库许可证；技能目录内原有许可证同样保留。
- `skills/upstream-lock.json`：来源、提交版本、使用条件和每个文件的校验值。

执行 `npm run check` 或 `node scripts/check-upstream-skills.mjs` 可检查原件是否完整，不会执行上游代码。校验可以发现缺失、修改和额外文件，不能代替代码审查或证明科研结论可靠。

保留 vendor 原件不变。需要更新时，先把新提交下载到独立位置，对照差异和许可，再一起替换选定技能及其校验清单；没有自动后台更新。

科研台账仍通过本项目 CLI 保存并回读。生成文档或处理日志不会自动增加论文进度。引入技能不等于授权上传、公开发布、通知、收集私人聊天或付费计算。

## 本次检查范围

已核对路径、提交证据、许可证，审读入口和关键脚本/依赖；原件与固定版本下载内容比对后记录校验值。没有逐一执行科学分析脚本或外部服务，实际完成的验证见 [验收记录](VALIDATION.md)。

首批未引入包含原始客户端会话采集示例的 HF datasets，也未引入额外服务依赖较多的 K-Dense slides。之前的来源目录仍是更广的候选清单；收录候选不代表已安装。

ML 论文写作整包也未引入：会议模板有独立再分发条件且所需配套源文件缺失。改选的 Orchestra 选题技能不包含该模板包。
