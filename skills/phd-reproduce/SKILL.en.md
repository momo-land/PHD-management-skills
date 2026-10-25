---
name: phd-reproduce
description: Compare a paper with its code, establish reproducibility conditions, run scoped reproductions and explain measured discrepancies.
---

# Paper reproduction

## Workflow

1. Fix the paper version, target figure/metric, repository commit, dataset version and authorized scope. Distinguish rerunning authors' code, independent implementation and inspecting reported results.
2. Map paper claims to code, configurations, splits and metric implementations. Check preprocessing, seeds, repeats, hyperparameters, checkpoints and evaluation data.
3. Inspect setup scripts before necessary authorized execution. Check available tools and compute; state expected resources and stopping conditions. With no budget, begin with a small verification rather than long training or huge downloads.
4. Save commands, versions, logs, exit status and raw metrics in isolated output directories. Validate data and a minimal example before full runs within budget; retain failed logs.
5. Compare identical units and estimands, reporting absolute/relative differences, variability and comparability. Label possible causes as hypotheses until tested.
6. Record completion through [experiments](../phd-experiment/SKILL.en.md) only with genuine results and evidence. Installation, generated code, launched processes and small smoke tests are not a complete reproduction.

## Deliverable

Provide a conditions matrix, run evidence, result comparison and next diagnostic step. Identify missing code, data, tools or budget precisely and complete feasible portions without inventing agreement.

## Saving and workspace updates

Read the [local workflow](../phd-manager/references/local-workflow.en.md). Save artifacts to the requested location or repository `outputs/` without overwriting source material. Only when recording/updating is requested, use `node cli.mjs` to read current records and versions, validate required batches, save and read back; preserve `PHD_DATA_DIR`. Label AI plans with `origin: "ai"` and retain external provenance. Creating an artifact does not automatically increase paper progress or complete experiments.
