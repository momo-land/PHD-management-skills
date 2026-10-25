---
name: phd-weekly
description: Generate an evidence-based PhD weekly report from local research records, actual activity and user-provided updates. Distinguish changes in the reporting period from the current cumulative state. Use for Generate weekly report, group-meeting updates, advisor reports and recent research reviews.
---

# Research weekly report

Read the [local workflow](../phd-manager/references/local-workflow.en.md) and identify the repository and current project. This skill reads records and writes a report; it does not change research status to improve the narrative. Reply in English to English requests and preserve source content in its original language unless translation is requested.

## Generate

1. Run `node cli.mjs list projects` to get the project ID, then `node cli.mjs report --project <id> --lang en` and `node cli.mjs state --project <id>`. Omit `--project` for all projects. The language option translates the report's interface text while preserving recorded research content.
2. The CLI reporting period is the last seven calendar days ending today. If the user specifies another period, filter the available records and activity explicitly. Activity does not contain complete historical snapshots, so the current state cannot stand in for an arbitrary past state.
3. Use the deterministic report as the factual starting point, distinguishing period changes from current state. A completed task without evidence of completion in this period belongs only in the cumulative status, not this week's accomplishments.
4. Check supplied logs, manuscripts, results and meeting records. Include only supported statements. If period evidence is insufficient, say so; do not invent results or numbers from task titles.
5. Organize the report around the research objective, period evidence and progress, current paper/experiment status, blockers and open decisions, and suggestions for the next period. Distinguish suggestions from confirmed plans and cite record titles and necessary source/file locations.
6. Save to the requested path when a file is wanted. Otherwise use `outputs/weekly-<projectId>-YYYY-MM-DD.md`, substituting `all` for an all-project report. Check for an existing file and use an unused suffix such as `-v2` or `-v3` unless the user explicitly requests an update to the same report. Include the reporting period and generation date. Invoke an update skill only if the user also asks to save new facts, then regenerate the factual starting point.

## Check

- Each claim of completion, improvement or validation must map to an actual record or explicit user confirmation. An experimental plan is not a result.
- Percentages are user estimates and counts reflect recorded state. Do not confuse current counts with completions during the period.
- Preserve metrics, baselines and conditions. Do not claim statistical significance without a test result.
- Genuine advisor statements come from `meetings`; model judgments and possible solutions are labeled AI suggestions.
- Do not automatically send the report to an advisor or schedule future runs. Deliver the complete report and its saved location when a usable report is requested.
