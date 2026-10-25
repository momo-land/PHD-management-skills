---
name: phd-visualization
description: Create reproducible scientific figures from real data with checked axes, units, uncertainty, grouping and captions.
---

# Scientific figures

## Workflow

1. Identify the claim, audience, data source and target dimensions. Inspect both an existing figure and its data before revising; decorative images do not establish exact values.
2. Match chart type to the relationship: retain sample information for distributions, consistent time scales for time series and denominators for comparisons. Avoid dual axes implying unsupported relationships.
3. Define uncertainty bars as SD, SE, CI or another measure. Compute them from genuine replicates and the correct unit; missing or unmeasured conditions are not zero.
4. Save plotting source and transformations using available plotting libraries. Prefer standard plotting tools for precise data figures; distinguish conceptual illustrations from observations.
5. Use legible typography, distinguishable marks, accessible colors and contrast. Bars normally begin at zero; clearly mark necessary truncation. Supply units, sample sizes/groups and sensible precision.
6. Export requested vector or high-resolution formats and inspect rendered labels, clipping, legends and readability at final size. If rendering is unavailable, state that only source inspection was possible.

## Deliverable

Deliver the figure, script, provenance, caption and inspection scope. Without real data, supply clearly labeled schematics or code; random demonstration values are not experimental results.

## Saving and workspace updates

Read the [local workflow](../phd-manager/references/local-workflow.en.md). Save artifacts to the requested location or repository `outputs/` without overwriting source material. Only when recording/updating is requested, use `node cli.mjs` to read current records and versions, validate required batches, save and read back; preserve `PHD_DATA_DIR`. Label AI plans with `origin: "ai"` and retain external provenance. Creating an artifact does not automatically increase paper progress or complete experiments.

## Imported upstream resources

When the task benefits from the original methods or bundled tools, use the [GitHub integration](../github-scientific-visualization/SKILL.en.md) and read its complete upstream instructions. Check its requirements and scope; tool output does not replace the local record workflow.
