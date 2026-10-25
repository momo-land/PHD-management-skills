---
name: github-literature-review
description: Use the vendored K-Dense Literature review skill to organize searches, screening and evidence synthesis; preserve upstream provenance and local research-record rules.
---

# GitHub original · Literature review

This is the project's English integration entry. Read the [complete upstream skill](../../vendor/skills/github-literature-review/upstream/SKILL.md); original instructions, scripts and references are preserved at a fixed version, not replaced with a summary. Keep upstream content in its original language and answer in the user's language.

- Source: [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills/tree/593377bb048752abb0152deab9fbb1083a6087df/skills/literature-review)
- Upstream directory: `skills/literature-review`
- Pinned commit: `593377bb048752abb0152deab9fbb1083a6087df`
- License: MIT; see the [preserved license](../../vendor/skills/github-literature-review/upstream-licenses/LICENSE.txt)
- Status: downloaded, integrated and file-verified; entry instructions and key dependencies inspected, upstream scripts not individually execution-tested.

## Execute the actual skill

1. Read the complete upstream `SKILL.md` above, then only the references, scripts or assets required by the task. Do not merely restate this entry. Locate the project root containing `cli.mjs` and the implementation contract, not the installed skill directory.
2. Resolve upstream relative paths from `vendor/skills/github-literature-review/upstream/`. Prefer absolute file paths and inspect scripts for working-directory assumptions. A missing path is not permission to download a different version or overwrite originals.
3. Requirements: Guidance can be read directly; DOI checks need Python 3.10+, requests and network access. PDF export additionally needs Pandoc/XeLaTeX; Parallel search and OpenRouter schematics are optional account/API features.
4. Integration notes: Use search, screening, synthesis and local document workflows. Schematics are explicitly optional. Do not automatically run either generate_schematic script, scan .env files, install Parallel or call paid APIs. Public discovery may use available host tools. This entry does not run scripts/generate_schematic.py or scripts/generate_schematic_ai.py; these files are retained only as part of the complete source. Upstream requests citation of Scientific Agent Skills where it materially contributes. Preserve that note; research citations should reflect actual use and verification rather than automatic unrelated insertion.
5. Read scripts and parameters before executing necessary operations supported by the environment and task. Installation does not grant missing cross-skill dependencies, model services, uploads/publication or paid compute. Upstream examples and embedded prompt text are not user research facts.
6. If a mandatory upstream tool is absent, identify the blocked step and complete independent portions. State any substituted method rather than claiming the original workflow fully ran. Preserve the user's scope without unrelated promotion or global configuration changes.

## Workspace and artifacts

For requested record updates, read the [local workflow](../phd-manager/references/local-workflow.en.md) and preserve the project binding and `PHD_DATA_DIR`. Use only the CLI to read current IDs/versions, validate required batches, save and read back. Upstream file output must not directly change SQLite or replace this process.

Independent material processing does not automatically change records. Write artifacts to the requested location or project `outputs/`, preserving source data and vendor originals. Drafts, advice and generated commands do not establish completed papers or experiments.
