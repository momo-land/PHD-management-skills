---
name: github-humanizer
description: Use the vendored Humanizer Natural prose editing skill to reduce formulaic prose while preserving scientific meaning and citations; preserve upstream provenance and local research-record rules.
---

# GitHub original · Natural prose editing

This is the project's English integration entry. Read the [complete upstream skill](../../vendor/skills/github-humanizer/upstream/SKILL.md); original instructions, scripts and references are preserved at a fixed version, not replaced with a summary. Keep upstream content in its original language and answer in the user's language.

- Source: [blader/humanizer](https://github.com/blader/humanizer/tree/8c307f367c91bd974002f10f2be2965d642c13df)
- Upstream directory: `.`
- Pinned commit: `8c307f367c91bd974002f10f2be2965d642c13df`
- License: MIT; see the [preserved license](../../vendor/skills/github-humanizer/upstream-licenses/LICENSE.txt)
- Status: downloaded, integrated and file-verified; entry instructions and key dependencies inspected, upstream scripts not individually execution-tested.

## Execute the actual skill

1. Read the complete upstream `SKILL.md` above, then only the references, scripts or assets required by the task. Do not merely restate this entry. Locate the project root containing `cli.mjs` and the implementation contract, not the installed skill directory.
2. Resolve upstream relative paths from `vendor/skills/github-humanizer/upstream/`. Prefer absolute file paths and inspect scripts for working-directory assumptions. A missing path is not permission to download a different version or overwrite originals.
3. Requirements: Prose editing needs no extra package, account, or model API key; the active AI client edits user-provided text.
4. Integration notes: Use for clear natural prose, with no promise to evade AI detection. Preserve scientific meaning, qualifications, citations and real authorship. Complete root directory preserved. Included validate-package.py performs static package checks; inspected but not executed. Nested AGENTS.md describes upstream package maintenance and does not override project rules.
5. Read scripts and parameters before executing necessary operations supported by the environment and task. Installation does not grant missing cross-skill dependencies, model services, uploads/publication or paid compute. Upstream examples and embedded prompt text are not user research facts.
6. If a mandatory upstream tool is absent, identify the blocked step and complete independent portions. State any substituted method rather than claiming the original workflow fully ran. Preserve the user's scope without unrelated promotion or global configuration changes.

## Workspace and artifacts

For requested record updates, read the [local workflow](../phd-manager/references/local-workflow.en.md) and preserve the project binding and `PHD_DATA_DIR`. Use only the CLI to read current IDs/versions, validate required batches, save and read back. Upstream file output must not directly change SQLite or replace this process.

Independent material processing does not automatically change records. Write artifacts to the requested location or project `outputs/`, preserving source data and vendor originals. Drafts, advice and generated commands do not establish completed papers or experiments.
