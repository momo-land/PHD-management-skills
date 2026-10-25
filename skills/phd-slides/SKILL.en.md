---
name: phd-slides
description: Turn real research material into lab-meeting or conference presentations with timing, claims, figures and speaker notes.
---

# Research presentations

## Workflow

1. Establish audience, purpose, duration, language and required template from available context. Mark unsupported result slides as missing rather than inventing findings.
2. Build a narrative around the question, gap, method, evidence, limitations and requested feedback. Lab meetings may emphasize blockers and decisions; conference talks emphasize contributions and evidence.
3. Give each slide one main message with a specific claim/question title. Label figure sources, units and scope; distinguish plans and AI advice from results.
4. Use the supplied template and available presentation tools for editable output. If only Markdown is possible, deliver a storyboard and notes labeled as an outline, not a renamed PPTX.
5. Add notes, transitions, approximate timing and evidence for likely questions. Fit content to duration instead of enforcing a fixed slide count.
6. Inspect actual rendered slides for small text, overflow, image quality and projected contrast. Review pacing where possible; disclose unavailable rendering.

## Deliverable

Provide the presentation or explicitly labeled outline, notes, sources and missing materials. Creating slides does not establish that a real meeting occurred.

## Saving and workspace updates

Read the [local workflow](../phd-manager/references/local-workflow.en.md). Save artifacts to the requested location or repository `outputs/` without overwriting source material. Only when recording/updating is requested, use `node cli.mjs` to read current records and versions, validate required batches, save and read back; preserve `PHD_DATA_DIR`. Label AI plans with `origin: "ai"` and retain external provenance. Creating an artifact does not automatically increase paper progress or complete experiments.
