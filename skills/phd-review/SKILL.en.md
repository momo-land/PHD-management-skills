---
name: phd-review
description: Critically review an actual manuscript or research plan using evidence, identifying issues in arguments, methods, baselines, reproducibility and limitations. Use for simulated peer review or a pre-submission check, clearly distinguishing AI suggestions from genuine reviewer feedback.
---

# Critical paper review

Read the [local workflow](../phd-manager/references/local-workflow.en.md). Identify the actual manuscript/plan and version, then read associated paper, experiment and literature records. Without a manuscript, explain that the review covers only the plan or metadata. Reply in English to English requests and preserve original research content unless revision or translation is requested.

## Review

1. State the central claim and chain of validation, checking alignment between the research question, contribution and evidence.
2. Where applicable, assess whether related work supports the claimed gap; methods and data support reproduction; baselines are comparable; splitting and analysis avoid leakage/bias; conclusions stay within results; and limitations address important assumptions.
3. For each finding, give a specific location or evidence, its effect on the conclusion, and a feasible correction or validation step. Prioritize by research validity and clarity, not a target number of findings.
4. Distinguish demonstrated problems, missing information and questions requiring further experiments. Do not declare an unread reference incorrect or treat an unreported parameter as proof an experiment never ran.
5. Verify external facts against actual sources when needed and state any unresolved checks. Assess novelty within the literature examined; do not promise exhaustive coverage or an acceptance probability.

## Save and deliver

- Clearly label the output **AI review suggestions**. When saving to the workspace, use `reviews` with `focus`, `assessment`, `recommendations`, `evidence` and `origin: "ai"`. Notes may include the manuscript path and associated paper title/ID; do not invent a `paperId` field on reviews.
- Preserve the manuscript unless revision is also requested. Continue with [phd-paper](../phd-paper/SKILL.en.md) when asked to implement changes. Register associated tasks when planning is requested, without marking them completed.
- Check the write result and read it back. Deliver the key issues, evidence locations and revision order. If there are no material findings supported by the evidence, say so and state the review's coverage.

## Imported upstream resources

When the task benefits from the original methods or bundled tools, use the [GitHub integration](../github-peer-review/SKILL.en.md) and read its complete upstream instructions. Check its requirements and scope; tool output does not replace the local record workflow.
