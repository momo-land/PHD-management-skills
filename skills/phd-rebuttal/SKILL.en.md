---
name: phd-rebuttal
description: Turn actual reviewer comments into traceable revision actions and point-by-point responses; use for rebuttals, revision plans and change verification.
---

# Reviewer response and revision

## Identify comment sources and versions

Read the actual reviewer comments, decision letter, submitted version and current draft, reusing the supplied paper context.
Ask only when missing comments or versions prevent alignment. AI-simulated comments must remain labeled AI rather than attributed to real reviewers.

## Turn comments into evidenced responses

1. Assign stable comment IDs, preserving reviewer attribution and meaning. Split compound comments while retaining their parent and source location.
2. Classify clarification, text revision, analysis, experiment, supplementary material and conflicts between comments.
3. Check which changes exist, which are planned and which cannot be addressed. Link completed work to actual files or result locations.
4. Design the smallest revision that answers the concern, including dependencies and affected scope. Unrun experiments remain pending.
5. Draft point-by-point responses stating the concern, action, evidence and manuscript location. Use completed-action wording only for actual changes.
6. Support justified disagreement with evidence and limits. Courtesy must not conceal unresolved scientific issues or promise nonexistent data.
7. Check pages, lines, figures and tables against the delivered version. Use section names and mark locations provisional if pagination is unsettled.
8. Reconcile every comment's status with the letter, manuscript, supplement and analysis results; remove obsolete values left in older replies.

## Deliver the revision package

Provide a comment–action–status–evidence–location matrix and the requested response letter or manuscript edits.
Use explicit pending wording for unfinished work. A response draft must not imply that the revision is complete.
Highlight changes affecting conclusions and unresolved issues rather than reporting only language edits.

## Tool and record boundaries

- Without a readable manuscript, prepare the comment matrix and plan without inventing change locations.
- State separately when analysis, experiments, tracked edits or layout validation could not be performed; provide supported text suggestions.
- Use [paper writing](../phd-paper/SKILL.en.md) for requested edits and [experiments](../phd-experiment/SKILL.en.md) for execution and evidence requirements.
- Update tasks/papers only when requested. Preserve the provenance of real comments, label AI response suggestions and never create a fictional advisor meeting.

## Workspace synchronization (only when requested)

Read the [local workflow](../phd-manager/references/local-workflow.en.md), locate the actual repository and project, and preserve the current PHD_DATA_DIR.
Discussion, translation, drafts and suggestions do not automatically change research state. Deliver requested files to the selected directory, or outputs/ when unspecified.
For requested saves, use the CLI to read the target and current version; preserve notes, relations and user-estimated percentages rather than editing the database directly.
Use user for user facts, import for external material and ai for AI plans/assessments, preserving provenance and actual verification scope.
Validate a batch before applying multiple changes and read back successful writes before reporting them as saved. Add no fields outside the contract.
