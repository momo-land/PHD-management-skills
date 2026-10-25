# Batch writes for progress updates and material imports

Follow the [local workflow](local-workflow.en.md). The current AI prepares a batch from the user's authorization and actual material; no model API or client-specific command syntax is required.

## Protocol

```text
node cli.mjs batch --file <json-file> --dry-run
node cli.mjs batch --file <json-file>
```

`--file -` accepts standard input. The top-level object contains `operations`, with 1–100 sequential operations:

```json
{
  "operations": [
    {
      "action": "create",
      "collection": "tasks",
      "data": {
        "id": "new-task-id",
        "projectId": "existing-project-id",
        "title": "Task the user explicitly asked to record",
        "status": "todo",
        "origin": "user"
      }
    },
    {
      "action": "update",
      "collection": "papers",
      "id": "existing-paper-id",
      "data": { "version": 3, "status": "revising" }
    }
  ]
}
```

Replace example IDs and versions with actual values. List existing records first, omit unchanged operations, consolidate repeated changes to one record into one update, and preserve notes, association arrays and untouched fields. Do not reimport an existing record as a create.

- Supported actions are `create` and `update`, not deletion. A create may omit `data.id`; when a later operation must reference it, generate a valid, unused stable ID and include it explicitly.
- References can point to existing records or records created earlier in the same batch, not forward references. Put parents before dependents. For a paper and experiment requiring links in both directions, create the paper, create the experiment, then update the new paper's association using version 1.
- Update `id` is an operation-level field; `data.version` is the version just read. A new record starts at version 1. Versions are not numbers to increase arbitrarily to bypass conflicts.
- All database changes in one batch, including activity logs, succeed together or roll back together. Manuscript and other file operations are outside this transaction. More than 100 candidates may be split by dependencies into separate batches, but those batches are not one transaction. Back up first, verify each batch and report the exact completed scope; do not claim an atomic import of all material.

## A dry run is not a save

A successful preview returns `{ok:true,dryRun:true,applied:0,results:[...]}`. Application returns `dryRun:false` and the actual `applied` count. Results contain each operation's index/action/collection/record. A preview rolls back every write, and generated IDs or timestamps are not retained. Do not reuse preview-assigned random IDs for later operations or claim that a preview saved anything.

When the user has asked to update or import progress, apply the clear, authorized changes after validation without requesting duplicate approval. Application checks versions again. After a conflict, read and assess the new state rather than treating the successful preview as unconditional permission to overwrite. Errors identify the failed item; no items in that batch are saved.

After success, list/read state to verify changes, sources and associations. If readback fails, state the application result and the verification limitation; do not blindly retry creates before checking what was saved. An open webpage refreshes the shared state automatically, while the CLI also works without a running server.
