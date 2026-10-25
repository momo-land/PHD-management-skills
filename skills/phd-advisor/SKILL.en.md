---
name: phd-advisor
description: Summarize genuine advisor meetings and feedback, extract actionable follow-up, or provide clearly identified AI research advice. Use for Summarize advisor feedback, group-meeting notes, action tracking and simulated guidance while keeping real feedback separate from model judgments.
---

# Advisor feedback and AI guidance

Read the [local workflow](../phd-manager/references/local-workflow.en.md), then list the project and relevant papers, experiments, tasks, meetings and suggestions. Reply in English to English requests. Keep actual advisor quotations and research source text in their original language unless translation is requested.

## Genuine advisor feedback

When the user supplies actual meeting information, notes, a transcript or written feedback:

1. Preserve meaning and distinguish explicit requests, possible directions under discussion and the note-taker's own interpretation. Leave unknown names, attendees or dates empty; do not invent a meeting.
2. Store `date`, `attendees`, `summary`, `feedback` and `nextSteps` in `meetings`. Use `origin: "user"` for the user's account or `origin: "import"` for supplied files, noting the source path and provenance.
3. When follow-up is requested, turn confirmed actions into `tasks` with the actual `meetingId`, plus paper/experiment IDs where applicable. Preserve the original feedback and give each task an actionable deliverable.
4. Update an existing matching meeting rather than duplicating it. Do not assign deadlines on the advisor's behalf; clearly identify any suggested dates as suggestions in the notes.

## AI research advice

When asked to advise like a supervisor, assess the project or suggest next steps:

1. Read the current objective, key evidence, blockers and existing suggestions to identify the decision at hand.
2. Assess options by clarity, testability, evidence strength, effort and the user's goals. Do not assume the real advisor's preferences or promise a review outcome.
3. Offer a small number of reasoned priorities, dependencies, applicability limits and verifiable next steps. State the limits of the assessment when essential material is missing.
4. When the user requests saving advice or the task is ongoing research management, save it in `reviews`: guidance topic in `focus`, judgment in `assessment`, advice in `recommendations` and basis in `evidence`. Use `origin: "ai"`. **Do not save AI-only advice in meetings.**
5. Turn advice into tasks only when the user asks to plan work, using `origin: "ai"`. Suggestions are not automatically confirmed commitments.

After saving and reading back, distinguish recorded genuine feedback, confirmed actions and AI advice. Make provenance clear enough for another client to continue the work.
