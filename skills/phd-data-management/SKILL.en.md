---
name: phd-data-management
description: Organize research files, dictionaries, versions and backup plans while preserving provenance and links without unrequested deletion or upload.
---

# Research data management

## Workflow

1. Restrict inspection to the designated project and material. Identify raw/derived data, code, results, manuscripts and external sources without scanning unrelated private directories.
2. Produce an inventory and proposed structure first. Use content/checksums for duplicate candidates; distinguish same-name versions from true duplicates and do not automatically delete them.
3. Document fields, types, units, missing codes, sampling unit, collection provenance, licenses/access limits and known quality issues. Mark unknowns explicitly.
4. For requested reorganization, prefer reversible copies or logged moves. Check code, manuscript and workspace references to old paths, preserve mappings and verify destinations so entry points keep working.
5. Plan backups and recovery from size, update frequency and sensitivity. Export consistent research-record snapshots with `node cli.mjs export --file <backup-path>`; these exclude AI conversations. Back up attachments separately rather than copying a live SQLite file as a snapshot. Check actual files/checksums and optionally test recovery in a temporary data directory. File integrity alone does not verify database recovery; a plan is not a completed backup.
6. Publishing/uploading is a separate action; organizing files does not grant release permission. Prepare shareable copies only within actual licenses and user authorization.

## Deliverable

Deliver the inventory, dictionary, provenance/version notes, actual move/backup log and unresolved path dependencies. Label a backup verified only after checking it.

## Saving and workspace updates

Read the [local workflow](../phd-manager/references/local-workflow.en.md). Save artifacts to the requested location or repository `outputs/` without overwriting source material. Only when recording/updating is requested, use `node cli.mjs` to read current records and versions, validate required batches, save and read back; preserve `PHD_DATA_DIR`. Label AI plans with `origin: "ai"` and retain external provenance. Creating an artifact does not automatically increase paper progress or complete experiments.
