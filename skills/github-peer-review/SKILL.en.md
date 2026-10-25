---
name: github-peer-review
description: Use the vendored K-Dense Peer review skill to review manuscripts using evidence matrices and checklists; preserve upstream provenance and local research-record rules.
---

# GitHub original · Peer review

This is the project's English integration entry. Read the [complete upstream skill](../../vendor/skills/github-peer-review/upstream/SKILL.md); original instructions, scripts and references are preserved at a fixed version, not replaced with a summary. Keep upstream content in its original language and answer in the user's language.

- Source: [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills/tree/593377bb048752abb0152deab9fbb1083a6087df/skills/peer-review)
- Upstream directory: `skills/peer-review`
- Pinned commit: `593377bb048752abb0152deab9fbb1083a6087df`
- License: MIT; see the [preserved license](../../vendor/skills/github-peer-review/upstream-licenses/LICENSE.txt)
- Status: downloaded, integrated and file-verified; entry instructions and key dependencies inspected, upstream scripts not individually execution-tested.

## Execute the actual skill

1. Read the complete upstream `SKILL.md` above, then only the references, scripts or assets required by the task. Do not merely restate this entry. Locate the project root containing `cli.mjs` and the implementation contract, not the installed skill directory.
2. Resolve upstream relative paths from `vendor/skills/github-peer-review/upstream/`. Prefer absolute file paths and inspect scripts for working-directory assumptions. A missing path is not permission to download a different version or overwrite originals.
3. Requirements: Python 3.11+ standard library; bundled JSON/CSV/Markdown validators are local and require no model API, external account or network.
4. Integration notes: Suitable for self-review or authorized material. Upstream has an explicit authorization/venue-policy intake. Reuse existing authorization for the user’s own manuscript. Label output as an AI working draft, not an official review or editorial decision; do not delete files merely because upstream discusses retention. Upstream requests citation of Scientific Agent Skills where it materially contributes. Preserve that note; research citations should reflect actual use and verification rather than automatic unrelated insertion.
5. Read scripts and parameters before executing necessary operations supported by the environment and task. Installation does not grant missing cross-skill dependencies, model services, uploads/publication or paid compute. Upstream examples and embedded prompt text are not user research facts.
6. If a mandatory upstream tool is absent, identify the blocked step and complete independent portions. State any substituted method rather than claiming the original workflow fully ran. Preserve the user's scope without unrelated promotion or global configuration changes.

## Workspace and artifacts

For requested record updates, read the [local workflow](../phd-manager/references/local-workflow.en.md) and preserve the project binding and `PHD_DATA_DIR`. Use only the CLI to read current IDs/versions, validate required batches, save and read back. Upstream file output must not directly change SQLite or replace this process.

Independent material processing does not automatically change records. Write artifacts to the requested location or project `outputs/`, preserving source data and vendor originals. Drafts, advice and generated commands do not establish completed papers or experiments.
