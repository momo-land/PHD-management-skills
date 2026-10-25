---
name: phd-paper-reading
description: Read accessible papers closely, reconstruct methods and evidence, and produce source-located notes and reproduction gaps for understanding or discussion.
---

# Close reading of papers

## Establish readable material

Identify the version, the user's questions and accessible content. Determine whether it is full text, an abstract, an excerpt or OCR text, and keep that scope in the deliverable.
Pages, tables and results can differ between versions; retain the filename, version or source link in the notes.

## Follow the evidence chain

1. Restate the question, central claim and validation approach in plain language.
2. Separate the authors' explicit statements, interpretations supported by the material and open questions. Do not attribute your interpretation to the authors.
3. Reconstruct method inputs, outputs, assumptions, variables and steps. Explain equation notation, dimensions and conditions while preserving original numbering.
4. Read axes, units, sample/repeat counts, error-bar definitions and comparison conditions for key figures and tables. Do not invent precise numbers from appearance.
5. Build a claim–experiment/derivation–result location–limitation table, identifying evidence gaps or support for a narrower claim.
6. Connect baselines, ablations, data splits and evaluation to the argument. Unreported details are not proof that work was never done.
7. Separate known reproduction information from missing details and distinguish comprehension gaps from reproduction gaps.
8. Explain useful ideas and applicability to the user's topic without treating results from other conditions as expected results for this project.

## Deliver traceable notes

Provide the central claim, method reconstruction, evidence table, limitations, questions and relevance to the current research.
Locate important explanations with sections, pages, equations or figure/table numbers; use section headings and identifiable passages when pages are unstable.
For a group-meeting explanation, add a question-to-result narrative and label AI interpretations.

## Reading limits and next steps

- If PDF extraction/OCR is unavailable, work from readable text supplied by the user. List missing material rather than claiming a complete reading.
- Report mathematical or code verification only when actually performed. A manual explanation is not an executed reproduction.
- Use [literature verification](../phd-literature/SKILL.en.md) for metadata and [critical review](../phd-review/SKILL.en.md) for manuscript assessment.
- If asked to update the reading ledger, base status and evidence on actual coverage; an abstract-only reading is not a completed full-text reading.

## Workspace synchronization (only when requested)

Read the [local workflow](../phd-manager/references/local-workflow.en.md), locate the actual repository and project, and preserve the current PHD_DATA_DIR.
Discussion, translation, drafts and suggestions do not automatically change research state. Deliver requested files to the selected directory, or outputs/ when unspecified.
For requested saves, use the CLI to read the target and current version; preserve notes, relations and user-estimated percentages rather than editing the database directly.
Use user for user facts, import for external material and ai for AI plans/assessments, preserving provenance and actual verification scope.
Validate a batch before applying multiple changes and read back successful writes before reporting them as saved. Add no fields outside the contract.
