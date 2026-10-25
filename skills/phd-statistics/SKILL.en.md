---
name: phd-statistics
description: Choose methods from the study design, check assumptions, effect sizes and uncertainty, and separate planned from executed analysis.
---

# Statistical analysis

## Workflow

1. Establish the question, estimand, outcome, independent unit, groups, pairing/repeated measures, sample size and prespecified primary/secondary analyses. Repeated measurements are not independent participants.
2. Inspect missingness, coding and distributions; use [data quality](../phd-data-quality/SKILL.en.md) when needed. Distinguish description, association, prediction and causal inference. Significance does not establish causation in observational data.
3. Choose methods from design and variable types, explaining assumptions, confounding and limitations. For sample-size planning, state effect, baseline rate, sidedness, power and attrition assumptions. Use labeled scenarios for unknowns, not invented prior results.
4. Save scripts, input versions, seeds, software versions and filtering rules. Explain missing-data and outlier handling. Identify multiplicity and exploratory analyses; do not select tests for favorable outcomes.
5. Run only when actual computation is requested and real data and tools are available; a plan-only request does not call for statistical tests. Report analyzed sample size, estimates, effect sizes, intervals and applicable statistics/p-values. Leave uncomputed numbers unfilled. Check diagnostics, convergence, sensitivity and multiple comparisons.
6. Match conclusions to the estimand and uncertainty. Nonsignificance is not equivalence; predictive accuracy is not causal evidence.

## Deliverable

Provide the plan or executed scripts, result tables, diagnostics and methods/results draft, with execution status. If software is missing, deliver runnable code and requirements without claiming the analysis passed.

## Saving and workspace updates

Read the [local workflow](../phd-manager/references/local-workflow.en.md). Save artifacts to the requested location or repository `outputs/` without overwriting source material. Only when recording/updating is requested, use `node cli.mjs` to read current records and versions, validate required batches, save and read back; preserve `PHD_DATA_DIR`. Label AI plans with `origin: "ai"` and retain external provenance. Creating an artifact does not automatically increase paper progress or complete experiments.

## Imported upstream resources

When the task benefits from the original methods or bundled tools, use the [GitHub integration](../github-statistical-analysis/SKILL.en.md) and read its complete upstream instructions. Check its requirements and scope; tool output does not replace the local record workflow.
