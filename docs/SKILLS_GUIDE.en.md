# Research skills: catalog and use

[中文](../技能目录.md) · [README](../README.en.md) · [Skills Center](http://127.0.0.1:4318/#skills)

Updated October 25, 2026. The project includes **39 skill entries and 75 commands**: 29 original project workflows plus 10 imported GitHub skills. All entries and commands have Chinese/English versions; upstream source text stays in its original language. See the [imported skill list](THIRD_PARTY_SKILLS.en.md) for files, pinned versions and requirements.

## Start with a task

Activate `phd-manager` in Codex, Claude Code or WorkBuddy with this project open. Then ask naturally:

```text
Read this paper closely: /path/to/paper.pdf
Check my dataset, then propose an analysis for my study design.
Prepare responses to these real reviewer comments; mark unfinished experiments as pending.
Prepare a 10-minute lab-meeting presentation from my existing research.
Update progress using the facts I just confirmed.
```

To select a specific skill in Codex, use `$phd-statistics`, for example. If discovery fails, ask the client to read `AGENTS.md` and `skills/phd-manager/SKILL.en.md`. `npm run skills:install` adds project-level entries for the three clients without changing global settings. Reload the project or skill list if needed.

On the website, refresh and open **Skills Center**, search for a task, copy a command and send it in **AI Assistant** or your local AI chat. Clear an old selected quick action before sending a different workflow. Copying does not execute anything. File paths require actual client access; the website's text import still accepts only `.txt`, `.md` and `.csv`.

## Capabilities and requirements

Text-based planning, outlines, translation, rebuttals and mock defense questions can use supplied material. New literature searches, DOI checks and current venue requirements require network access. PDF/OCR, statistics, figures, LaTeX, editable presentations and reproduction need corresponding client tools or software. The workflow should check availability and report incomplete steps; an outline is not a PPTX, and code is not an executed result.

The workspace still has no production package dependencies or model API-key requirement. AI-client access, ChatGPT account usage and external-service requirements are separate. Cloud training, private libraries and some transcription/search services may require accounts or payment; they are not installed by this expansion.

Artifacts go to the requested folder or project `outputs/`. Record updates use the shared CLI, current versions, validation and read-back only when requested. Producing a draft or plan does not automatically increase paper progress or complete an experiment. Preserve stored research content in its original language unless translation is requested.

## Included skills

| Skill | Commands | Instructions |
| --- | --- | --- |
| Research workspace | Update progress · Import progress · View research status | [phd-manager](../skills/phd-manager/SKILL.en.md) |
| Progress and tasks | Update progress · Import research material · Update multiple records | [phd-progress](../skills/phd-progress/SKILL.en.md) |
| Import progress | Import progress · Import files · Merge updated material | [phd-import](../skills/phd-import/SKILL.en.md) |
| Weekly report | Generate weekly report · Prepare a group update | [phd-weekly](../skills/phd-weekly/SKILL.en.md) |
| Paper writing | Draft a paper section · Revise a paper · Update paper progress | [phd-paper](../skills/phd-paper/SKILL.en.md) |
| Experiments and results | Design an experiment · Record experiment results · Update experiment progress | [phd-experiment](../skills/phd-experiment/SKILL.en.md) |
| Advisor guidance | Summarize advisor feedback · Get AI research advice · Track advisor actions | [phd-advisor](../skills/phd-advisor/SKILL.en.md) |
| Literature and evidence | Add literature · Organize reading notes · Link paper evidence | [phd-literature](../skills/phd-literature/SKILL.en.md) |
| Critical paper review | Review a paper · Prioritize revisions | [phd-review](../skills/phd-review/SKILL.en.md) |
| Research ideas and hypotheses | Explore research ideas · Challenge a hypothesis | [phd-ideation](../skills/phd-ideation/SKILL.en.md) |
| Research proposal | Draft a proposal · Review feasibility | [phd-proposal](../skills/phd-proposal/SKILL.en.md) |
| Systematic review workflow | Plan a systematic search · Screen supplied literature | [phd-systematic-review](../skills/phd-systematic-review/SKILL.en.md) |
| Close reading of papers | Read this paper closely · Prepare a paper discussion | [phd-paper-reading](../skills/phd-paper-reading/SKILL.en.md) |
| Citation and reference audit | Audit manuscript citations · Clean a bibliography | [phd-citation-audit](../skills/phd-citation-audit/SKILL.en.md) |
| Academic translation and editing | Translate academic text · Polish academic language | [phd-academic-translation](../skills/phd-academic-translation/SKILL.en.md) |
| Reviewer response and revision | Plan a revision · Draft point-by-point responses | [phd-rebuttal](../skills/phd-rebuttal/SKILL.en.md) |
| Submission preparation | Compare venues · Check submission materials | [phd-submission](../skills/phd-submission/SKILL.en.md) |
| Thesis integration | Plan a thesis · Check thesis consistency | [phd-thesis](../skills/phd-thesis/SKILL.en.md) |
| Defense preparation | Prepare defense questions · Start a defense rehearsal | [phd-defense](../skills/phd-defense/SKILL.en.md) |
| Data quality | Audit data quality · Plan data cleaning | [phd-data-quality](../skills/phd-data-quality/SKILL.en.md) |
| Statistical analysis | Plan an analysis · Analyze real data | [phd-statistics](../skills/phd-statistics/SKILL.en.md) |
| Scientific figures | Create a scientific figure · Review a figure | [phd-visualization](../skills/phd-visualization/SKILL.en.md) |
| Paper reproduction | Plan reproduction · Compare reproduction results | [phd-reproduce](../skills/phd-reproduce/SKILL.en.md) |
| Research code review | Review experiment code · Fix a research-code issue | [phd-research-code](../skills/phd-research-code/SKILL.en.md) |
| LaTeX preparation | Repair a LaTeX build · Prepare paper layout | [phd-latex](../skills/phd-latex/SKILL.en.md) |
| Research presentations | Create lab-meeting slides · Create a conference talk | [phd-slides](../skills/phd-slides/SKILL.en.md) |
| Academic posters | Create an academic poster · Check a poster for delivery | [phd-poster](../skills/phd-poster/SKILL.en.md) |
| Research data management | Organize research files · Create a data dictionary | [phd-data-management](../skills/phd-data-management/SKILL.en.md) |
| Research PDF extraction | Extract paper evidence · Extract research tables | [phd-pdf](../skills/phd-pdf/SKILL.en.md) |
| GitHub · Literature review | Use Literature review | [github-literature-review](../skills/github-literature-review/SKILL.en.md) |
| GitHub · Citation management | Use Citation management | [github-citation-management](../skills/github-citation-management/SKILL.en.md) |
| GitHub · Statistical analysis | Use Statistical analysis | [github-statistical-analysis](../skills/github-statistical-analysis/SKILL.en.md) |
| GitHub · Scientific visualization | Use Scientific visualization | [github-scientific-visualization](../skills/github-scientific-visualization/SKILL.en.md) |
| GitHub · Peer review | Use Peer review | [github-peer-review](../skills/github-peer-review/SKILL.en.md) |
| GitHub · Experimental design | Use Experimental design | [github-experimental-design](../skills/github-experimental-design/SKILL.en.md) |
| GitHub · HF Papers | Use HF Papers | [github-huggingface-papers](../skills/github-huggingface-papers/SKILL.en.md) |
| GitHub · Trackio experiment logs | Use Trackio experiment logs | [github-huggingface-trackio](../skills/github-huggingface-trackio/SKILL.en.md) |
| GitHub · Natural prose editing | Use Natural prose editing | [github-humanizer](../skills/github-humanizer/SKILL.en.md) |
| GitHub · Research ideation | Use Research ideation | [github-brainstorming-research-ideas](../skills/github-brainstorming-research-ideas/SKILL.en.md) |

## Optional external sources

The [official/maintainer inventory](SKILL_SOURCES_OFFICIAL.md) describes 32 concrete candidates from OpenAI, Anthropic and Hugging Face. The [community inventory](SKILL_SOURCES_COMMUNITY.md) covers 11 repositories, including K-Dense, Orchestra Research and Humanizer. These inventories overlap; do not add their counts as unique projects. Their detailed research notes are in Chinese, with direct primary-source links.

Start with [K-Dense](https://github.com/K-Dense-AI/scientific-agent-skills) for broad research workflows, [Orchestra Research](https://github.com/Orchestra-Research/AI-Research-SKILLs) for ML work, [Hugging Face](https://github.com/huggingface/skills) for datasets/models/logging, or [OpenAI Plugins](https://github.com/openai/plugins) for current official integrations such as Zotero and data analysis. Check the linked inventory for exact paths, licenses and dependencies.

The `phd-*` workflows are original project instructions. The separately marked `github-*` entries load actual vendored upstream files with preserved licenses and fixed commits. Only the imported subset is installed; other inventory entries remain candidates. External tools and services have not all been execution-tested.
