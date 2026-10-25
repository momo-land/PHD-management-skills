---
name: phd-systematic-review
description: Plan and document transparent searches, deduplication, eligibility decisions and evidence extraction for systematic or scoping reviews.
---

# Systematic review workflow

## Establish the review scope

Use the supplied question and protocol to identify the review type, population/object, intervention or method, outcomes, date and language limits. Ask only about gaps that affect eligibility.
Follow an existing protocol and log amendments. A retrospective plan is not preregistration; registration identifiers require real sources.

## Keep a reproducible search and screening trail

1. Split the question into search concepts with synonyms, abbreviations and spelling variants, using each database's supported fields and logic.
2. For every platform actually used, record the query, execution date, limits, result count and export file. Unexecuted queries are proposals.
3. Preserve raw exports and deduplicate a working copy using DOI, identifiers, normalized titles and author/year checks. Keep uncertain matches pending and retain a merge map.
4. Apply stated criteria to title/abstract screening, then full-text screening. List unavailable full text separately rather than inventing full-text exclusions.
5. Retain each decision, reason, material level and evidence location. Mark uncertain cases for discussion; one AI must not impersonate two independent reviewers.
6. Extract study design, sample/data, method, comparison, outcome definition, limitations and source pages into a question-specific table. Mark missing information explicitly as “not reported”.
7. Distinguish multiple reports of one study from separate studies to prevent double-counting studies or participants.
8. Synthesize agreement, disagreement, heterogeneity and bias information. Pool effect estimates only when design, outcomes and available statistics justify it.

## Deliver a review work package

Provide the search protocol, actual search log, deduplication map, screening table and extraction table for the stages performed. Label remaining stages as pending.
Derive flow-diagram counts from traceable tables and reconcile them; do not invent counts from impressions.
State coverage, last search date, missing full text and human-review scope without claiming exhaustive coverage of all literature.

## Capabilities and factual limits

- Search databases only with available access. Otherwise provide executable search strings and process user exports without bypassing access restrictions.
- Without PDF/OCR capability, use readable full text or abstracts and state the reading scope; do not infer unread tables or supplements.
- Use [literature verification](../phd-literature/SKILL.en.md) for references. Ordinary narrative related work does not require the whole systematic-review process.
- Deliver files and screening tables as requested. Save literature records only when authorized; screened does not mean full-text read.

## Workspace synchronization (only when requested)

Read the [local workflow](../phd-manager/references/local-workflow.en.md), locate the actual repository and project, and preserve the current PHD_DATA_DIR.
Discussion, translation, drafts and suggestions do not automatically change research state. Deliver requested files to the selected directory, or outputs/ when unspecified.
For requested saves, use the CLI to read the target and current version; preserve notes, relations and user-estimated percentages rather than editing the database directly.
Use user for user facts, import for external material and ai for AI plans/assessments, preserving provenance and actual verification scope.
Validate a batch before applying multiple changes and read back successful writes before reporting them as saved. Add no fields outside the contract.

## Imported upstream resources

When the task benefits from the original methods or bundled tools, use the [GitHub integration](../github-literature-review/SKILL.en.md) and read its complete upstream instructions. Check its requirements and scope; tool output does not replace the local record workflow.
