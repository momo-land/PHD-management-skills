---
name: phd-experiment
description: Design testable research experiments, record actual runs and results, and maintain baselines and evidence paths. Use for experimental plans, pilot reviews, result logging, blockers or Update experiment progress. Generating a plan does not mean an experiment has run.
---

# Experimental design and results

Read the [local workflow](../phd-manager/references/local-workflow.en.md), then list projects, papers and experiments to obtain existing records and association IDs. Reply in English to English requests and preserve original research content unless a change or translation is requested.

## Design

Derive a falsifiable hypothesis, manipulated/compared factors, control or baseline, sample/data source, primary metric, evaluation conditions and failure criteria from the research question. Decide whether power analysis, repeated measurements, randomization, blinding, data splits or ablations apply to the discipline; do not impose a computational template on every study.

Put the executable plan in `hypothesis`, `method`, `metric` and `baseline`. Save longer plans as files and record their `artifactPath`. Mark unspecified budgets, sample sizes and expected effects as unresolved. A new AI-proposed plan uses `status: "planned"` and `origin: "ai"`; planned tasks can reference its `experimentId`.

## Runs and records

- A planned run stays `planned`. Use `running` only when the user explicitly reports a run or a tool has actually started it. Execution needs authorization, an available environment and an actual entry point. Invoking the skill does not start a background experiment.
- Before recording existing results, read supplied files, logs or explicit user statements. Preserve units, dataset/sample scope, baseline, settings, actual time and known anomalies. Do not claim to verify a missing or unreadable file.
- Put supported observations in `result` and their location and verification scope in `evidence`. Use `completed` only when actual results and evidence are both present. User-reported results can be labeled as not independently checked; never claim to have performed the run yourself.
- Failed startup, missing resources or a pending dependency can be `blocked`; describe the cause and next release condition in notes. Failures and negative results are valid records, not entries to remove for a better outcome.
- Charts, statistics and comparisons must follow the original data and actual calculations, with processing methods retained. Do not claim statistical significance without a test.

## Finish

Save through the CLI and read back. Report the plan/result location, what actually ran, the evidence supporting the conclusion and outstanding checks. Preserve existing entries when updating a paper's `experimentIds`. Completing an experiment does not automatically complete its paper or every associated task.

## Imported upstream resources

When the task benefits from the original methods or bundled tools, use the [GitHub integration](../github-experimental-design/SKILL.en.md) and read its complete upstream instructions. Check its requirements and scope; tool output does not replace the local record workflow.
