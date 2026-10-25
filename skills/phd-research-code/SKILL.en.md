---
name: phd-research-code
description: Review scientific code for leakage, metric correctness, randomness and reproducibility, verifying critical logic with small examples.
---

# Research code review

## Workflow

1. Read repository instructions, entry points, methods and the user's concern. Trace inputs, splits, processing/training, evaluation and outputs without unrelated refactoring.
2. Check training-only fitted preprocessing, subject separation, label/index alignment, metric direction and aggregation, and fair baseline conditions.
3. Inspect seeds, determinism limits, dependency versions, checkpoint recovery, configuration overrides, caching and retries for irreproducibility or silently reused results.
4. Verify critical metrics, splitting and boundary cases with hand-computable examples. Tests should detect substantive scientific errors, not mirror implementation. Findings need a location, trigger and impact on conclusions.
5. When repairs are requested, make focused changes and run relevant checks while preserving prior results. Identify historical results requiring reruns; fixing code does not validate the paper's conclusions.

## Deliverable

Provide prioritized findings, evidence and repair/validation results, distinguishing execution, static inspection and pending reruns. Complete static review when data or tools are missing without claiming tests passed.

## Saving and workspace updates

Read the [local workflow](../phd-manager/references/local-workflow.en.md). Save artifacts to the requested location or repository `outputs/` without overwriting source material. Only when recording/updating is requested, use `node cli.mjs` to read current records and versions, validate required batches, save and read back; preserve `PHD_DATA_DIR`. Label AI plans with `origin: "ai"` and retain external provenance. Creating an artifact does not automatically increase paper progress or complete experiments.
