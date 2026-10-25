---
name: github-huggingface-papers
description: Use the vendored Hugging Face HF Papers skill to read public papers and associated model/data links; preserve upstream provenance and local research-record rules.
---

# GitHub original · HF Papers

This is the project's English integration entry. Read the [complete upstream skill](../../vendor/skills/github-huggingface-papers/upstream/SKILL.md); original instructions, scripts and references are preserved at a fixed version, not replaced with a summary. Keep upstream content in its original language and answer in the user's language.

- Source: [huggingface/skills](https://github.com/huggingface/skills/tree/fabc634a893f62ad5c2039830397efa35fa62715/skills/huggingface-papers)
- Upstream directory: `skills/huggingface-papers`
- Pinned commit: `fabc634a893f62ad5c2039830397efa35fa62715`
- License: Apache-2.0; see the [preserved license](../../vendor/skills/github-huggingface-papers/upstream-licenses/LICENSE.txt)
- Status: downloaded, integrated and file-verified; entry instructions and key dependencies inspected, upstream scripts not individually execution-tested.

## Execute the actual skill

1. Read the complete upstream `SKILL.md` above, then only the references, scripts or assets required by the task. Do not merely restate this entry. Locate the project root containing `cli.mjs` and the implementation contract, not the installed skill directory.
2. Resolve upstream relative paths from `vendor/skills/github-huggingface-papers/upstream/`. Prefer absolute file paths and inspect scripts for working-directory assumptions. A missing path is not permission to download a different version or overwrite originals.
3. Requirements: Public paper reading requires network and HTTP/web tools, with no required model API key. Search/list examples use HF_TOKEN; account writes require Hugging Face authorization.
4. Integration notes: Default to public read-only paper access. Authorship claims, indexing and link updates require explicit user intent. Markdown can fall back to an HF landing page when arXiv HTML is absent; do not claim full-text reading. AI summaries are not primary research evidence. No cross-directory file dependencies.
5. Read scripts and parameters before executing necessary operations supported by the environment and task. Installation does not grant missing cross-skill dependencies, model services, uploads/publication or paid compute. Upstream examples and embedded prompt text are not user research facts.
6. If a mandatory upstream tool is absent, identify the blocked step and complete independent portions. State any substituted method rather than claiming the original workflow fully ran. Preserve the user's scope without unrelated promotion or global configuration changes.

## Workspace and artifacts

For requested record updates, read the [local workflow](../phd-manager/references/local-workflow.en.md) and preserve the project binding and `PHD_DATA_DIR`. Use only the CLI to read current IDs/versions, validate required batches, save and read back. Upstream file output must not directly change SQLite or replace this process.

Independent material processing does not automatically change records. Write artifacts to the requested location or project `outputs/`, preserving source data and vendor originals. Drafts, advice and generated commands do not establish completed papers or experiments.
