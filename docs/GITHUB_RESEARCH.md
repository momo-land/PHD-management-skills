# PHD-management-skills：GitHub 同类项目调研

调研日期：2026-10-22（Asia/Shanghai）。

本阶段完成 GitHub 检索、原始 README 与许可证核实、重点项目目录和关键源码抽查。没有安装、启动或测试第三方项目；下文的功能描述是仓库文档与源码证据，不代表运行验证。建议和缺口判断是本次调研的分析。

## 结论

已有高度相近的项目，可以为 PHD-management-skills 提供明确参考。最有价值的组合是：

- **OpenResearch / Research Pilot**：本地 AI 操作接口、持久科研状态和网页看板。
- **phd-agent**：研究阶段、模拟导师评审、实验检查与回退流程。
- **phd-planner**：博士科研管理的页面与业务模块。
- **Claude Scholar / Scientific Agent Skills**：持续科研工作流，以及论文、实验和分析技能。

本次审阅的项目中，尚未看到同时完整覆盖“Codex / Claude Code / WorkBuddy 共用技能、本地网站、博士总计划、多篇论文、实验台账、导师会议反馈闭环”的现成轻量方案。建议建立自己的统一数据模型和网站，按需借鉴上游，而不是直接合并多个大型框架。

截至本次检索，未发现名为 PHD-management-skills 的公开 GitHub 仓库。该结论仅限本次公开检索，不保证名称唯一，也不包含私有或未索引仓库。

## 重点项目

| 项目 | 已核实的形态与能力 | 适合借鉴 | 与目标的差距 | 根许可证 |
| --- | --- | --- | --- | --- |
| [alphaXiv/OpenResearch](https://github.com/alphaXiv/OpenResearch) | 有后端、网页前端、CLI、桌面端与 agent skills；本地数据库记录实验，支持现有 coding agents | AI 与数据分离、实验树、执行日志、代码和产物关联 | 偏自动科研和实验迭代；博士日程、毕业节点和导师会议不是核心 | [MIT](https://github.com/alphaXiv/OpenResearch/blob/main/LICENSE) |
| [QZhang2111/Research-Pilot](https://github.com/QZhang2111/Research-Pilot) | Codex 导向；AI 通过聊天维护本地项目记忆、来源、研究理解和实验；网页观察状态 | 本地数据库、研究证据、跨会话记忆、自然语言更新 | 网页定位为观察面板；还需补论文写作进度、博士计划和会议闭环 | [MIT](https://github.com/QZhang2111/Research-Pilot/blob/main/LICENSE) |
| [KellyGong0301/phd-agent](https://github.com/KellyGong0301/phd-agent) | Claude Code / OpenClaw 编排 skill；基础研究→预实验→完整实验→写作；包含导师评审与回退规则 | 阶段状态、导师意见日志、审查证据和进度页面协议 | 只有四个仓库文件，没有预置网页应用；要求 AI 在运行时生成看板脚本 | [MIT](https://github.com/KellyGong0301/phd-agent/blob/main/LICENSE) |
| [haseenanaji/phd-planner](https://github.com/haseenanaji/phd-planner) | Next.js 网站，含论文看板、文献、实验日志、截止日期、会议及周报等；使用 Supabase 与 Anthropic API | 博士管理页面、导航和业务模块 | 默认依赖云服务；AI 由网站直接调用，不是外部 AI 使用 skills 维护 | 未发现许可证文件；GitHub API license=null |
| [Galaxy-Dawn/claude-scholar](https://github.com/Galaxy-Dawn/claude-scholar) | 研究、代码实验、结果分析、写作和 rebuttal 工作流；Zotero / Obsidian 知识库 | 长期项目目录和 question→evidence→experiment→analysis→claim→writing 链路 | 主要是 CLI 与知识库，偏 CS/AI 和计算研究；无完整博士管理网站 | [MIT](https://github.com/Galaxy-Dawn/claude-scholar/blob/main/LICENSE) |
| [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) | 原名 claude-scientific-skills；覆盖科研写作、统计、绘图、科学工具和数据库 | 按需加载的技能包、参考资料、脚本和证据验证 | 是技能库；不承担博士总计划、会议和论文组合管理 | [根目录 MIT](https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/LICENSE.md)，单项技能可能不同 |
| [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) | 研究→写作→评审→修订→定稿，另有 Codex 兄弟仓库 | 论文阶段检查点、引导式追问、修订追踪 | 无长期管理网站；ARS 自身不运行实验；不能把文档检查当成实验真实性验证 | [CC BY-NC 4.0](https://github.com/Imbad0202/academic-research-skills/blob/main/LICENSE) |
| [scdenney/open-science-skills](https://github.com/scdenney/open-science-skills) | 面向计算社会科学与数字人文；Claude / Codex 两套技能 | 研究决策地图、设计追问、独立第二意见 | 领域偏向较强；advisor 是单个决策复核，不是长期导师管理 | [CC BY-NC 4.0](https://github.com/scdenney/open-science-skills/blob/main/LICENSE) |
| [SihengTao/phd-application-planner](https://github.com/SihengTao/phd-application-planner) | 共用 SKILL.md，附校验、构建、启动脚本和 marimo 本地仪表盘模板 | skill→结构化数据→校验→网站的交付模式，刷新时保留笔记和稳定 ID | 业务是博士申请与导师选择，需要重做科研管理模型 | [MIT](https://github.com/SihengTao/phd-application-planner/blob/main/LICENSE) |

许可证列只记录本次核实的仓库信息，不代表其依赖、模型、数据或所有子技能采用同一许可。尚未复制任何上游代码或技能内容。

## 三个最关键的实现区别

### OpenResearch：已有完整本地工作台

[README](https://github.com/alphaXiv/OpenResearch/blob/main/README.md) 明确支持 Claude Code、Codex、OpenCode、Cursor 和 Antigravity，CLI 可启动 `http://127.0.0.1:4791` 看板。

[SKILL.md](https://github.com/alphaXiv/OpenResearch/blob/main/SKILL.md) 给出项目、实验、状态、运行与 agent 操作命令。现有 coding agent 可以通过 CLI 使用它，工作台也能启动和编排 agent。因此，它是参考实现，不只是提示词集合。其领域模型重心是实验迭代，而非整个博士培养周期。本次未发现 WorkBuddy 的明确适配声明。

### Research Pilot：AI 维护本地研究记忆，网页展示

[README](https://github.com/QZhang2111/Research-Pilot/blob/main/README.md) 将聊天定位为主要交互入口，将 workspace 中的 `research-pilot.db` 定位为主要数据存储。仓库实际包含 Python 服务、数据库工具、dashboard 及 React 图视图构建配置。

文档将看板定义为只读观察界面，但[服务源码](https://github.com/QZhang2111/Research-Pilot/blob/main/tools/research_browser_server.py) 仍存在 graph-delta 的 POST 审查接口。因此这里的“只读”指产品界面定位，不能据此推断整个服务没有写入入口。另有部分文档仍描述旧读模型路径，复用前需要确认当前数据协议。

其最值得借鉴的地方是：AI 每次完成科研工作后，把变化写回持久项目记录，让下一次会话继续使用，而不是只保留聊天结果。

### phd-agent：高度贴近构想，但主要是编排指令

GitHub 文件清单只有 `.gitignore`、`LICENSE`、`README.md`、`SKILL.md`。

[SKILL.md §0.3](https://github.com/KellyGong0301/phd-agent/blob/main/SKILL.md) 要求 AI 自行编写 `update_dashboard.py`，读取 `state.json`、`advisor_log.jsonl` 和 `backtrack_log.jsonl`，生成自动刷新的 `dashboard.html`。它提供了详细流程协议，但没有附带已经实现的看板生成器。

PHD-management-skills 可以沿用这种数据与流程分工，但建议预先提供稳定的网站模板与更新脚本，使不同 AI 客户端更新同一套结构化数据。

## 跨客户端可行性

本次候选项目中的 Codex / Claude 支持方式各不相同，有共用 SKILL.md、独立分支、独立仓库和客户端专用工具。格式可读不代表所有工具调用和功能都一致，更不代表已经实测。

WorkBuddy 官方明确支持项目目录 `.codebuddy/skills/<技能名>/SKILL.md`，也支持 `AGENTS.md` 等项目配置。[项目文档](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Project)

官方还提供本地应用生成、运行、调试与持续升级案例，说明该方向具备基础能力。[本地应用案例](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Practice-Cases/Practice-Seven)

建议将“统一技能正文、结构化数据协议、稳定更新工具”作为核心，为各客户端提供轻量适配入口。WorkBuddy 的适配仍需要实际验收，不能由上述官方能力推导为这些第三方项目已经兼容。

这里的“本地”首先指网站、项目文件和执行过程在本机。模型推理是否联网由所选客户端和模型决定，不应默认承诺离线。

## PHD-management-skills 首版建议

以下为拟议方案，尚未实现。

**项目定位：由本地 AI 客户端操作、以本地网站呈现的博士科研管理系统与技能库。**

基本闭环：

1. 用户在 Codex、Claude Code 或 WorkBuddy 中描述进展、提供论文或实验材料。
2. AI 根据对应 skill 读取当前项目状态，提取变化并保留证据来源。
3. 统一工具校验并保存数据，追加变化记录。
4. 网站读取最新状态，展示进度、阻塞、反馈与下一步。

### 网站的六个主要模块

| 模块 | 首版内容 |
| --- | --- |
| 科研总览 | 研究目标、阶段里程碑、本周工作、截止日期、阻塞与待决事项 |
| 论文管理 | 多篇论文、章节状态、图表、引用、目标投稿、审稿与修改任务 |
| 实验台账 | 假设、设计、数据与代码版本、参数、运行状态、结果和产物路径 |
| 导师指导 | 真实导师会议纪要、反馈对应的任务、落实状态；单独标注 AI 建议 |
| 文献与证据 | 文献记录、阅读笔记、相关主张、支持或冲突证据、原始来源 |
| Skills 中心 | 技能说明、调用示例、输入输出、客户端适配情况与执行记录 |

### 首批技能

- 初始化项目、启动网站、导入现有科研材料。
- 更新科研进度，生成周报与下周计划。
- 更新论文及章节进度，管理投稿与返修任务。
- 规划实验、登记真实结果、关联代码和产物。
- 整理导师反馈，开展基于证据的 AI 研究评审。
- 文献综述、论文起草与修改、图表和统计检查。

### 优先确定的数据原则

- 项目、论文、实验、文献和反馈都有稳定 ID，并可相互引用。
- 事实记录、执行结果、人工意见与 AI 建议分别标注；不把“计划执行”写成“已经完成”。
- 数据保存后更新网页；日常更新不需要 AI 重写整个网站。
- 首版可用本地 SQLite 作为结构化状态的唯一来源，Markdown 保存长文本与材料；避免双份可编辑状态互相冲突。
- 写入走统一工具与校验，记录修改来源和时间，便于跨会话接续、备份和恢复。
- 通用科研管理先落地，再按学科增加实验方法、写作规范与专业工具。

建议首个验收场景：同一个示例项目先在一个客户端中登记进展，打开网站看到变化，再由另一个客户端读出相同状态并继续更新。随后逐项验收论文状态、实验结果与导师反馈，最后验证 WorkBuddy。

## 其他筛选结果

- [LARi-UQAC/ResearchTools](https://github.com/LARi-UQAC/ResearchTools) 有学术审查、本地模型和 agent 观察面板，适合作为进阶参考；[许可证](https://github.com/LARi-UQAC/ResearchTools/blob/main/LICENSE) 是 PolyForm Noncommercial 1.0.0，不能误标为 MIT。
- `mahdi1190/phd-dashboard` 在搜索索引中出现，但当前 GitHub 页面和 API 均返回 404，本次排除，未视为可获取的参考实现。
- phd-planner 的[AI 路由](https://github.com/haseenanaji/phd-planner/blob/main/app/api/ai/route.ts) 和 [Claude 封装](https://github.com/haseenanaji/phd-planner/blob/main/lib/claude.ts) 表明其 AI 是网站后端直接调用 API。可参考模块设计，代码复用需要先明确许可。
- Claude Scholar 的 README 声明 Codex 走 `codex` 分支，本次没有验证该分支运行情况。[中文说明](https://github.com/Galaxy-Dawn/claude-scholar/blob/main/README.zh-CN.md)
- ARS 的 [Codex 版本](https://github.com/Imbad0202/academic-research-skills-codex) 是独立仓库；其打包和完整性检查不能代替科研结果验证。[定位说明](https://github.com/Imbad0202/academic-research-skills/blob/main/POSITIONING.md)
