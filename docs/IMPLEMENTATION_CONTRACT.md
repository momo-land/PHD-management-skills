# Implementation contract

Shared contract for the local application. Node.js >=24, built-in node:sqlite, no production package dependencies. ESM throughout. Local host 127.0.0.1, default port 4318. SQLite path uses PHD_DATA_DIR or ./data. UI supports Chinese and English; product name PHD-management-skills / Research Desk. User-authored research content remains in its original language. Core record management requires no model. The optional AI Assistant uses an installed Codex App Server over private stdio; ChatGPT sign-in avoids a user-supplied API key but model use still requires connectivity and available account usage.

## Records

Collections: projects, papers, experiments, tasks, meetings, literature, reviews.
Every record: id (generated when omitted), title (required), notes (default ""), origin (user|ai|import|demo, default user), createdAt, updatedAt, version (integer, initial 1). All non-project records require a valid projectId. Strings are plain text, not trusted HTML. Dates YYYY-MM-DD or empty. Optional relation fields empty or a valid same-project ID.

- projects: description, field, goal, status(active|paused|completed), targetDate.
- papers: projectId, status(idea|outline|drafting|revising|submitted|accepted), venue, dueDate, progress(integer 0..100), sections(array of {name,status:todo|drafting|done}), experimentIds(array), literatureIds(array).
- experiments: projectId, paperId, status(planned|running|completed|blocked), hypothesis, method, metric, baseline, result, artifactPath, dueDate, evidence.
- tasks: projectId, paperId, experimentId, meetingId, status(todo|in_progress|done|blocked), priority(high|medium|low), dueDate, evidence.
- meetings: projectId, date, attendees, summary, feedback, nextSteps. Linked tasks point back via meetingId. Meeting records describe actual meeting notes; AI-only advice belongs in reviews.
- literature: projectId, authors, year(integer or null), url, doi, status(to_read|reading|read), relevance, takeaway, evidence.
- reviews: projectId, focus, assessment, recommendations, evidence, origin(default ai). These are labeled AI suggestions, not real supervisor feedback.

No generated claims of experiment execution. Completed experiment must contain result and evidence. A task marked done can omit evidence but the UI asks for outcome/notes. Paper progress is explicitly user-estimated, not computed scientific completeness.

## Store

Backend exports createStore({dataDir, demo=false}) returning {state(), create(collection,data), update(collection,id,patch), batch(payload,options?), remove(collection,id,version), importSnapshot(snapshot), clearDemo(), clearDemoHistory(), report(projectId?,locale='zh'), close()}. Initializer reads fixtures/demo.json only when demo requested and newly created DB; empty existing DB stays empty. Store actions use transactions, foreign-reference validation, optimistic version checking for update/delete, and an activity audit that is append-only except for the explicit deleted-demo cleanup below (actor from record origin is provenance, not authentication). Deletion with dependent records is rejected. Activity entries: id, at, action, collection, recordId, title, origin. state() contains schemaVersion:1, updatedAt, all collection arrays, activity (latest first). Mutations return record; remove returns {ok:true}; clearDemo and clearDemoHistory return {removed:number}. Failed validation must leave state unchanged.

`clearDemoHistory()` is an explicit, transactional cleanup for previously deleted demonstration records. It removes only activity entries whose `origin` is `demo` and whose `(collection, recordId)` no longer exists. It does not remove research records, activity for any currently existing record, non-demo history, or AI conversations. A nonempty cleanup updates snapshot `updatedAt`; it does not create another activity entry. An empty cleanup is a no-op, including metadata. `clearDemo()` retains its existing behavior of deleting demonstration records and recording their removal. The separate CLI cleanup requires a user request and should be preceded by a JSON export; importing an older backup can restore its history. There is no new HTTP cleanup endpoint.

`report(projectId, locale='zh')` returns `{markdown, generatedAt}`. The locale must be exactly `zh` or `en`; explicit empty, null, region tags such as `en-US`, and other values throw `INVALID_LOCALE` with status 400. The default remains Chinese for existing callers. English reports translate all report headings, system descriptions, statuses, action labels, empty states and disclaimers. Titles, results, evidence, meeting feedback and other research content are not translated or rewritten. Report generation does not mutate records or activity.

## Atomic batches

`store.batch({operations}, {dryRun:false})` accepts 1–100 operations. `dryRun` is optional and must be a boolean when supplied. The payload accepts only `operations`; each operation accepts only the fields shown below:

- Create: `{action:"create", collection:"tasks", data:{title:..., projectId:..., id?:...}}`. A chosen new ID belongs in `data.id`, not on the operation object. Omit it to generate an ID.
- Update: `{action:"update", collection:"tasks", id:"existing-id", data:{version:currentVersion, ...patch}}`. The patch uses exactly the same validation as a single update. No automatic retries, version increments on the caller's behalf, or conflict overrides.

Operations execute in order inside one transaction. Every step validates fields, evidence requirements, and current references. Later operations may reference a new record created earlier in the batch by its explicitly chosen `data.id`; forward references are rejected. An update must match the version visible at that step, including earlier updates in the same batch. Each successful create/update generates the normal activity entry. Delete, import, demo clearing, arbitrary commands, and nested batches are not supported.

Success returns `{ok:true, dryRun:boolean, applied:number, results:[{index:1, action:"create", collection:"tasks", record:{...}}]}`. `index` is one-based. Each result is the record immediately after that operation, so an earlier result may have an older version than a later result for the same record. Normal execution returns `applied` equal to the operation count. With `dryRun:true`, the same operations are validated and previewed, then the transaction rolls back; `applied` is 0 and no records, version changes, updatedAt changes, or activity entries persist. Normal first-time database initialization may still create the empty database schema. Generated IDs and timestamps in a preview are temporary and are not reserved for a later application.

Any failed operation rolls back the entire batch, including earlier changes and activity. Validation/version errors preserve their normal code and HTTP status; the readable error identifies the failed operation number. Preview success does not reserve a version or guarantee a later application will succeed. Read the latest state before applying; on conflict, reread and reconcile rather than blindly replaying. After a lost response, read back before retrying because a successfully committed batch is not automatically idempotent. This transaction covers database writes only, not generated manuscript files or external actions.

Example: after reading the existing project ID, replace `existing-project-id` with that real ID and choose unused IDs for the new records:

```json
{
  "operations": [
    {"action":"create","collection":"papers","data":{"id":"new-paper-id","projectId":"existing-project-id","title":"论文提纲","status":"outline","origin":"ai"}},
    {"action":"create","collection":"experiments","data":{"id":"new-experiment-id","projectId":"existing-project-id","paperId":"new-paper-id","title":"待执行的验证实验","status":"planned","origin":"ai"}},
    {"action":"update","collection":"papers","id":"new-paper-id","data":{"version":1,"experimentIds":["new-experiment-id"]}}
  ]
}
```

## HTTP

- GET /api/health -> {ok:true}
- GET /api/state -> snapshot
- GET /api/skills -> array from skills/catalog.json
- GET /api/skills/:id?lang=<zh|en> -> {id, content}. The default/zh returns the registered skill's SKILL.md; en returns its SKILL.en.md. Only these two fixed filenames are selectable. Invalid language values return 400 INVALID_LOCALE; an absent English file returns 404 rather than silently returning Chinese.
- POST /api/:collection -> created record, 201
- PATCH /api/:collection/:id -> updated record; body includes current version
- DELETE /api/:collection/:id -> {ok:true}; body includes current version
- POST /api/batch -> body {operations:[...], dryRun?:boolean}; same atomic batch contract above, returns the batch result with HTTP 200 for preview or application. Host/Origin, JSON content type and 2 MB limits apply.
- GET /api/export -> JSON snapshot download
- POST /api/import -> body {data:snapshot}, atomic validated MERGE (upsert IDs, incoming version must match current for changed existing records; no deletion; fresh imports retain references). Return {ok:true, imported:number}.
- POST /api/demo/clear -> {removed:number}; delete only origin=demo records; refuse if non-demo records depend on them.
- GET /api/report?projectId=<id or omit>&lang=<zh|en> -> {markdown, generatedAt}; deterministic summary based on actual state and activity (no model/API). Language defaults to zh and is strictly validated. Report period = last seven calendar days ending today; state tasks/deadlines clearly distinguished from changes in that period.
- Errors -> {error: readable message, code:string}, 400 validation / 404 / 409 conflict / 403 bad origin. The status and code are independent of display language.

For HTTP error messages, send `Accept-Language: en` for English or `Accept-Language: zh` for Chinese. Supported language tags such as `en-US` and `zh-CN` are normalized, with valid positive q weights respected; the fallback is zh. `lib/error-locale.mjs` translates only known error codes paired with known fixed messages or anchored message templates, including validation, missing references, dependencies, version conflicts and batch failure prefixes. Dynamic user titles, IDs and field names remain verbatim. Unknown future messages retain their original wording; this is not a general translation service. The report/skill content language is controlled separately by the explicit `lang` query parameter, not by `Accept-Language`. The same error JSON shape is retained for both languages.

Server binds loopback only. Check Host, Origin and cross-site fetch headers on every API request, including reads; JSON only and 2MB request limit on writes. No arbitrary file serving or arbitrary skill paths. Poll research state every 5 seconds in UI (pause when hidden); no external fonts/CDNs/analytics or browser-side model calls. Serve public/ only with safe paths and explicit MIME types. Frame embedding is denied by CSP and X-Frame-Options. Export includes research metadata; import accepts only known schemaVersion/collections/record fields. Assistant conversation metadata is separate from research snapshots.

## Local AI Assistant

`lib/assistant-bridge.mjs` launches the installed Codex executable with App Server over private stdio. It does not expose a TCP/WebSocket App Server, proxy arbitrary RPC methods, inspect login tokens, or automate the desktop UI. Connection uses Codex's existing account; only the `chatgpt` authentication mode is accepted for messages. Missing installation, missing sign-in, unsupported authentication, connection failure and unavailable usage produce localized guidance. Merely reading status or website-owned conversations does not start Codex or a model turn. Listing or previewing Codex sources may connect the local App Server but does not start a model turn.

Assistant endpoints are under `/api/assistant`. They use the existing local Host/Origin protection for every request; POST additionally requires the exact request origin when a browser Origin is present, same-origin Fetch Metadata, JSON and a 2 MB body limit. Unknown fields are rejected. Errors are `{error,code}` with Chinese or English wording selected by `Accept-Language`.

| Method and path | Body | Result |
| --- | --- | --- |
| `GET /status` | — | `{available, connected, loggedIn, authMode, runningCount, maxConcurrent, error?, code?}` |
| `POST /connect` | `{}` | Current status after starting the local connection and checking the account; account problems may appear as `code` and `error` in that status. |
| `GET /conversations` | — | `{conversations:[summary]}` ordered by latest update. |
| `POST /conversations` | `{language:"zh"\|"en", title?:string, projectId?:string\|null}` | `{conversation}` with HTTP 201. An optional project ID must refer to an existing project. |
| `GET /conversations/:id` | — | `{conversation}` including messages, activity and pending requests. |
| `POST /conversations/:id/messages` | `{text:string, action?:string}` | `{conversation}` after the turn is started; completion is asynchronous. Text is required and limited to 1 MB of UTF-8. |
| `POST /conversations/:id/stop` | `{}` | `{conversation}` after requesting interruption. |
| `POST /conversations/:id/requests/:requestId` | `{decision:"accept"\|"decline", answers?:object}` | `{conversation}` after answering the request. |
| `POST /sources/list` | `{cursor?:string, search?:string, archived?:boolean, cwd?:string}` | `{threads:[{id,title,cwd,updatedAt}],nextCursor,projects:[{cwd,title}],projectScope:"listedThreads"}`. Read-only source discovery. |
| `POST /sources/preview` | `{threadIds:[string]}` | `{preview:{id,sources,text,messageCount,truncated,expiresAt,limits}}` for 1–5 previously listed source IDs. |
| `POST /sources/import` | `{previewId:string,projectId:string,language:"zh"\|"en"}` | `{conversation}` for a newly created website-owned import conversation, or the same conversation when retrying a consumed preview. A target research project is required. |

Conversation summaries expose `{id,title,projectId,language,status,updatedAt,error?}`. Detail adds `messages:[{id,role,text,at}]`, `activity:[{label,status}]`, and `pendingRequests`. For the initial source-import message, the browser receives a readable summary of the target, selected chats and material count; the full reviewed source text and fixed import instructions remain in the stored message used by Codex. Conversation status is `idle`, `running`, `waiting`, `completed`, `interrupted` or `error`. Private thread IDs used to resume website-owned conversations and authentication details are not exposed to the browser. Source conversation IDs are exposed only by source discovery/preview for selection and provenance. Assistant messages are plain text, not trusted HTML. App Server deltas update the local conversation; the browser reads the latest conversation to display progress.

An `action` must be exactly `progress`, `import`, `paper`, `experiment`, `advisor`, `weekly` or `review`, selecting the corresponding project skill. A message without an action uses `phd-manager`. The server supplies the fixed repository root, current `PHD_DATA_DIR`, conversation language and bound project ID; conversation/message endpoints accept no working directory, arbitrary command, system prompt, model configuration or external thread ID. Source endpoints accept only the filters and previously listed source IDs described above; these do not change execution context. Unbound conversations must resolve the project from clear user context or ask about ambiguity. Project existence is checked again before sending. Binding is conversation-specific and is not silently changed by the dashboard's project filter.

Each conversation has at most one active turn. At most three conversations may have active turns, including turns waiting for input; additional sends return 409. Starting a send reserves its slot before asynchronous connection or thread operations. The server starts a fresh Codex thread for the first message and resumes only a thread stored for a conversation created by this website. Explicit source discovery/import is read-only with respect to original conversations; it never resumes them or sends them messages. Desktop sidebar synchronization is not guaranteed.

The connection uses `workspace-write`, `on-request` approvals and disabled shell network access. The server requests write roots for the repository and configured data directory. Research facts are written through `node cli.mjs` with validation, version checks and readback, not direct database or fixture edits. Model instructions mark imported material, record content and tool output as source data rather than authority; a generated claim is not proof that a record or experiment was completed.

Pending requests have an opaque local `id`, `kind` (`command`, `file`, or `input`), `title`, `description`, and optional `questions`. Answers to input questions have the shape `{questionId:{answers:["one response"]}}`; every question needs one nonempty response when accepting. Declining input sends empty answers. Requests are bound to the live conversation and turn; already answered, stopped or stale requests return 409. There are no session-wide approval buttons. Command retries requiring approval are limited to a plain invocation of the project's CLI with an allowlisted operation; shell composition, input to an existing terminal and arbitrary executable approvals are declined. File approvals require known changes within the project and show their paths and diffs. Unsupported permission expansion, secret-input requests and unknown server requests are declined. A request expires after ten minutes; a turn is interrupted after thirty minutes by default. The UI must show the requested action before accepting it.

Local conversation metadata is atomically saved to `<PHD_DATA_DIR>/assistant/conversations.json` (default `data/assistant/conversations.json`), separate from research SQLite and JSON exports. The directory and file request owner-only permissions on supported systems. The format has `version:1`, the repository root and at most 200 conversations, including private Codex thread IDs used for resumption. Import conversations also retain `sourceImport:{previewId,sourceIds,previewedAt,truncated,inputSubmitted,displayText}` for provenance, a readable browser summary and duplicate-submission recovery; this metadata is not exposed as conversation control fields. Credentials are never stored in this file. Invalid history is preserved and blocks new history writes rather than being replaced with an empty file.

On restart, saved running/waiting conversations become interrupted and old confirmation requests are discarded. A restart or reconnect never automatically resends the last user message. Stop cancels pending confirmations and interrupts the active turn; it does not roll back files or research records already changed. Connection loss preserves accumulated replies and marks active work interrupted. A user can reconnect and send a follow-up after checking the current state. This is an individual local tool, not a multi-user permission system or a background research scheduler.

### Selected Codex sources

Source discovery uses the local App Server's thread-list/read/item-list capabilities, not direct scans of client session files. Thread listing requests `useStateDbOnly:true`, source kinds `cli`, `vscode`, `appServer`, and `exec`, and pages of 30 sorted by latest update. The catalog is limited to what that local App Server returns; remote/cloud chats and the desktop's full project registry are not promised. `projects` groups `cwd` values from listed source threads (`projectScope:"listedThreads"`); source cwd is a filter/provenance label, never the target research project or an execution/write root. Searching, pagination and archive filtering do not read all conversation bodies. The user chooses 1–5 listed IDs before a preview reads text. Listed IDs and opaque paging cursors expire after thirty minutes, and a cursor is bound to its filters.

Preview metadata sources have `{id,title,cwd,updatedAt,messageCount,truncated,omittedKinds,scannedItems}`. Metadata reads request no turns; item pages of ten select recent content and retain only user/assistant text. Limits are `maxThreads:5`, `maxItemsPerThread:200`, `maxMessageChars:20000`, and `maxTextChars:160000`. At most twenty item pages are scanned per source, even when they contain only excluded tool items; only one preview can be read at a time. Character budgets apply to retained message text; source labels and import instructions add framing. The total JSON-encoded message budget is also capped at 800,000 bytes, with any further clipping performed before the preview; framing retains headroom below the assistant's 1 MB message limit. Tool output, reasoning and non-text content are excluded. `omittedKinds` and `truncated` disclose these omissions and clipping; preview scope must not be described as the entire history when material was omitted. Import material carries source/turn/message IDs and SHA-256 fingerprints of original message text for provenance and fact-level deduplication. Each retained message also has `startedAt` and `completedAt` as ISO timestamps or `null`, derived from the item's timestamps; the preview labels missing dates as unknown. A thread's update time is not an experiment, meeting or publication date and cannot replace a missing message date when interpreting “today” or “yesterday”.

Preview labels follow the request's `Accept-Language` (`en` or default Chinese); source titles, dates and message contents retain their original values and language. The preview request body remains `{threadIds}`.

Previews expire after ten minutes and are bound to the server-provided text. Source lists and unsubmitted previews are kept in memory, without writing source logs. The browser submits the preview ID, target project and language, not replacement text or execution settings. Listing and previewing neither invoke the model nor write research records. Import validates an existing target project, starts a new website-owned conversation with the fixed `import` action and includes the selected source text. The model uses `phd-import`, the bound research project and unchanged repository/data directory; records still require CLI validation, deduplication and readback. Source instructions are untrusted material, assistant claims alone are not completion evidence, and source language is preserved.

An import preview is consumed once; its token and initial source message are persisted together with the website conversation before any asynchronous model startup. Duplicate submissions return the same conversation instead of starting another turn, including after a server restart. Reusing that token for a different project or language is rejected; make a new preview. An empty preview cannot be imported. A failed initial start may return the new conversation with an error: continue only after checking its state and existing research records. Neither token consumption nor a model reply proves data was saved. Re-importing through a new preview still requires fact/source matching against existing records. Preview expiry or server restart requires re-previewing unsubmitted material. Imported source text becomes part of local website conversation history; it is excluded from research JSON backups, as with other assistant messages.

`inputSubmitted` starts false and becomes true only after a valid `turn/start` acknowledgement. If startup or submission was interrupted before that acknowledgement, an explicit user follow-up includes the stored initial message as quoted historical context, whether or not a Codex thread ID already exists. This does not resend the earlier RPC or automatically repeat the import: the current user request controls continuation, changes or cancellation, and continuation must read back and deduplicate possible earlier writes. A confirmed source submission is not appended again on later turns. Restart alone never starts a turn.

## CLI

node cli.mjs init [--demo]
node cli.mjs state [--project <id>]
node cli.mjs list <collection> [--project <id>]
node cli.mjs add <collection> --file <json-file> (also --file - stdin)
node cli.mjs update <collection> <id> --file <json-file> (patch includes version)
node cli.mjs batch --file <json-file|-> [--dry-run] (file/stdin contains {operations:[...]}; preview does not persist changes)
node cli.mjs remove <collection> <id> --version <n>
node cli.mjs report [--project <id>] [--lang zh|en] (Markdown to stdout; default zh)
node cli.mjs export --file <path>
node cli.mjs import --file <path>
node cli.mjs clear-demo
node cli.mjs clear-demo-history (only activity for deleted demo records; does not delete research records)
node cli.mjs doctor

CLI uses the same store directly; no running server required. JSON output except report/help; errors exit nonzero. `--lang` is available only for the report command and controls report content; CLI errors retain their existing wording. PHD_DATA_DIR is respected by all commands. Default server starts example data only for a new DB; normal CLI init starts empty unless --demo supplied. doctor is read-only and does not initialize a DB; init.demo reports the actual presence of demo records. Reports use PHD_TIMEZONE (default Asia/Shanghai). Snapshot import preserves activity with ID deduplication and rejects conflicting history atomically; state returns activity in descending timestamp order. Export creates missing parent directories.

## Skill catalog

skills/catalog.json is an array of {id,name,description,category,prompt,path,commands,en}. id equals skill directory name; path is skills/<id>/SKILL.md. Categories: 项目管理 / 论文写作 / 实验研究 / 导师指导. Each skill has 1–3 commands with {id,label,description,prompt,placeholder}; en supplies translated name, description, category, prompt and commands with the same action IDs and order. English category names are Project management / Paper writing / Experiments / Advisory. Both SKILL.md and SKILL.en.md are shipped for every registered skill.

The Skills Center shows/copies prompts and instructions; copying never executes them. The separate AI Assistant submits user messages and a fixed allowlist of skill actions to the local Codex connection. A message without a fixed action uses phd-manager, which routes additional research requests through its research-workflows reference. New catalog entries do not add HTTP actions, install external toolchains or expand execution permissions. It exposes no arbitrary shell-command or App Server RPC endpoint. Research writes performed by the assistant must follow the same CLI, evidence, batch validation and readback workflow as external AI clients. Artifact creation alone does not change progress. The source inventories under docs/ list optional upstream resources separately from the original project skills; listing is not installation or runtime verification.

## Vendored upstream skills

`skills/github-*/` contains bilingual project integration entries and client metadata; original third-party files are kept outside client discovery roots at `vendor/skills/<id>/upstream/`. The complete selected upstream directory is preserved byte-for-byte and its applicable repository license is retained at `vendor/skills/<id>/upstream-licenses/`. The adapter must read the original instructions and relevant resources, resolve relative paths from the vendor directory, and retain project CLI/evidence/authorization rules. Installing files does not install scientific runtimes, authorize external writes or verify every execution path.

`skills/upstream-lock.json` has `schemaVersion:1`, `installedAt:YYYY-MM-DD` and `entries`. Each entry records `id`, `repo`, a 40-character commit `revision`, `upstreamPath` (`.` for a repository-root skill), `sourceUrl`, `upstreamSkill`, `license:{spdx,files}`, bilingual `requirements`, `review:{level,notesZh,notesEn,...}` and `files:[{path,sha256,bytes}]`. Review level `source-inspected-not-executed` describes script execution status; additional review notes record dependencies, excluded script paths and commit evidence. These are source provenance, not executable settings.

`verifyUpstreamSkills({root,manifestPath})` in `scripts/check-upstream-skills.mjs` verifies originals and licenses without fetching or executing code. It returns `{skills,files,bytes}` and rejects missing/modified/unlisted files, duplicate entries, invalid metadata, unsafe paths and symlinks. `npm run check` runs this verification and confirms imported entries are in the catalog; vendor source is excluded from the application's JavaScript syntax scan. Upstream updates are explicit, reviewed replacements with a newly pinned commit and matching manifest, never silent downloads or automatic background updates. All source/script runtime use remains task-scoped.

## Ownership

Backend agent: lib/, server.mjs, cli.mjs. Frontend agent: public/. Skills agent: skills/, AGENTS.md, CLAUDE.md. Root: fixtures/, tests/, scripts/, package.json, README.md, remaining docs and integration changes.
