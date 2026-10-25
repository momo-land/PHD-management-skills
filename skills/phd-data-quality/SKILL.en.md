---
name: phd-data-quality
description: Inspect research data for missing values, duplicates, units, leakage and anomalies; produce a traceable quality report.
---

# Data quality

## Workflow

1. Establish the row grain, independent sampling unit, keys, date range, units, groups and outcome from the question and dictionary. Mark unresolved meanings rather than guessing from column names.
2. Preserve originals and analyze a copy. Record source path, size, reader, dimensions and checksums when useful. State sampling limits if not all rows are read.
3. Separate exact duplicates, legitimate repeated measurements and conflicting keys. Inspect missing codes, types, units, ranges and join cardinality. Report denominators and affected keys/rows without exposing unrelated personal data.
4. Compare groups, time periods and splits. Check subjects spanning training and test data, target leakage and preprocessing fitted before splitting. Investigate anomalies before removing them; unfavorable significance is not a cleaning rule.
5. Propose rules with rationale, affected counts and reversibility. If cleaning is requested, write a new file plus a change log. Do not silently fill with zero, impute or deduplicate.

## Deliverable

Provide a data profile, prioritized issue table, reproducible examples, suggested rules and unexamined areas. Report counts only from executed checks; without data, deliver a plan. If readers are unavailable, explain the missing capability and complete the readable portion.

## Saving and workspace updates

Read the [local workflow](../phd-manager/references/local-workflow.en.md). Save artifacts to the requested location or repository `outputs/` without overwriting source material. Only when recording/updating is requested, use `node cli.mjs` to read current records and versions, validate required batches, save and read back; preserve `PHD_DATA_DIR`. Label AI plans with `origin: "ai"` and retain external provenance. Creating an artifact does not automatically increase paper progress or complete experiments.
