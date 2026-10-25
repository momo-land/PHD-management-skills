---
name: phd-progress
description: Execute Update progress, Update paper progress or Update experiment progress using genuine research updates from the visible chat, user reports and batches of material. Match existing records, validate and save changes, then read them back so the website can refresh. Exclude development work, examples and unconfirmed plans from research accomplishments.
---

# Update research progress

Read the [local workflow](../phd-manager/references/local-workflow.en.md) and run commands in the user's repository. The repository's `docs/IMPLEMENTATION_CONTRACT.md` defines fields and allowed values.

**Update progress / 一键更新**, **Update paper progress / 更新论文进度** and **Update experiment progress / 更新实验进度** execute this workflow directly. **Import progress** routes to [phd-import](../phd-import/SKILL.en.md). For **Summarize advisor feedback** or **Generate weekly report**, follow the [manager shortcuts](../phd-manager/SKILL.en.md) and complete the action. Do not require a repeated skill prefix. Reply in English to English requests and preserve existing research content in its original language unless translation is requested.

## Material and authorization

- **Update progress** means use and save the genuine research updates already supplied in the visible conversation. Do not ask the user to repeat context, operate a website button or authorize the same clear local update again.
- Requests to organize this chat or sync the preceding discussion use the material currently visible. Do not invent content from earlier chats that has not been provided. A preview-only request stops at the preview.
- Combine multiple updates using the [batch workflow](../phd-manager/references/batch-workflow.en.md). For Markdown, CSV, file lists or initial structured intake, read [phd-import](../phd-import/SKILL.en.md) and continue the same task.
- Website development, skill changes, demonstrations and unconfirmed AI plans are not research accomplishments. If no new genuine material is available or everything is already recorded, report that no update is needed. Do not submit an empty batch, modify demo data or write duplicates to generate activity.

## Workflow

1. Identify the project from explicit conversation context, record IDs and existing real projects. List projects, tasks and the relevant papers, experiments or meetings to obtain current IDs and versions. Do not infer the webpage's selection; ask only about unresolved candidates.
2. Separate completed facts, work in progress, blockers and future plans, keeping the user's statement or material location as evidence. Reuse existing tasks based on project, associations and deliverable; similar titles alone are insufficient. Do not repeatedly append the same fact or source.
3. Mark a task `done` when the user explicitly reports completion, and record the outcome or confirmation in `notes` or `evidence`. Starting soon or planning completion is not completion. Preserve the reason for a delay and use only a supported new date; otherwise leave the date empty.
4. For blockers, state the missing dependency and a concrete next step. Register proposed tasks only when the user requests follow-up planning, and label them `origin: "ai"`.
5. Treat paper stage and percentage separately. A completed first draft can support a stage change but does not imply 80% progress. Save `progress` only when the user provides an estimate. Check experimental completion through the experiment workflow's result and evidence requirements.
6. Build the necessary increments using the [batch workflow](../phd-manager/references/batch-workflow.en.md). Run `node cli.mjs batch --file <json-file> --dry-run`, then apply the same file after successful validation and read back the records. Ask only about unresolved factual conflicts; independent, unambiguous items may proceed. Preserve existing notes, arrays and user estimates.
7. Report created, updated and skipped counts, key changes and pending questions. Say an update was saved only after successful application and readback. The open website reads the shared data automatically; no source-code edit or website rebuild is required.

## Field choices

- `tasks`: `status` is `todo / in_progress / done / blocked`; `priority` is `high / medium / low`. Use actual `paperId`, `experimentId` or `meetingId` when applicable.
- `papers`: `status` is `idea / outline / drafting / revising / submitted / accepted`; `progress` is an integer from 0 to 100. Section statuses are `todo / drafting / done`; preserve unchanged sections when replacing the array.
- `projects`: the overall status is `active / paused / completed`. Completing one paper does not complete the whole PhD project.

Writing outputs and experimental results are different deliverables. Do not mark unverified experiments, reviewer responses or submission actions complete to make the dashboard look better.
