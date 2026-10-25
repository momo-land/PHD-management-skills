# PHD-management-skills

A local research workspace for projects, papers, experiments, tasks, literature and advisor feedback. Connect your local Codex from the website's **AI Assistant**, or use Codex, Claude Code or WorkBuddy to run the included skills and update the same SQLite database displayed by the website.

[中文说明](README.md)

For a step-by-step walkthrough in Chinese, see the [user guide](使用说明.md).

## Start the workspace

Requires **Node.js 24 or newer**. There are no third-party production dependencies, so `npm install` is unnecessary.

```sh
npm start
```

Open [the local workspace](http://127.0.0.1:4318), or use the address printed by the server. On macOS, you can also double-click `启动工作台.command`. The server listens only on `127.0.0.1`; stop it with Ctrl+C in its terminal.

Use the `http://` address rather than opening `public/index.html` directly. Opening the page file cannot load research records or connect Codex. Start the workspace first, then visit the address printed in its terminal.

If the page will not open, check that the startup terminal is still running. After updating the project code, stop the old server, run the startup script or `npm start` again, and refresh the page. Refreshing alone may leave new features connected to an old server and produce an “endpoint not found” error. Keep using the same data directory; no data deletion is needed.

The first server start loads clearly labeled demonstration records. To start with an empty workspace instead, run these commands before the first start:

```sh
node cli.mjs init
npm start
```

Clearing demo records retains their activity history. To remove history belonging to deleted examples too, ask an AI working in this project to export a backup and run `node cli.mjs clear-demo-history`. This preserves non-demo history, history of existing records, all research records and AI conversations. Importing an older backup may bring its history back.

Use the language selector to choose **English** or **中文**. The language setting changes the interface and skill instructions; your research titles, notes, quotations and source material remain as entered. Open the appearance button in the top-right corner to compare six visual themes: **Field Notes, Blueprints, Editorial, Night Lab, Studio, and Iris**. Each changes typography, navigation, surfaces and card geometry as well as color. Select a preview card to apply it immediately; choose Done or press Escape to return. Your browser remembers the choice. Switching does not reload the page or change research records, filters or unsaved form values.

The website reads the latest state every five seconds while visible. Viewing and managing records needs no model. The optional AI Assistant sends your tasks to your local Codex. With Codex's ChatGPT sign-in, you do not need to enter an API key; model use still requires internet access and is subject to your account's usage limits.

## Use Codex from the website

Install Codex on this computer and sign in with ChatGPT. Then open **AI Assistant** in the workspace:

1. Connect and check whether Codex is available. If it is missing or signed out, follow the on-screen guidance and retry.
2. Create a conversation and choose its research project. Conversations keep separate context and can be revisited.
3. Enter a question, progress update or source material and send it. You can also choose **Update progress**, **Import progress**, **Paper writing**, **Experiment help**, **Advisor feedback**, **Weekly report** or **Review a paper**, add the relevant material and send. **Import material** accepts `.txt`, `.md` and `.csv` files; their text is added to your draft for review before sending.
4. Replies appear as they arrive. Handle requests for approval or missing information in the relevant conversation. Stop a running task when needed, then send a new message to continue later.

For example, in a conversation linked to your project, enter “The methods draft is complete. I estimate the paper at 60%. The ablation study is waiting for data,” choose **Update progress** and send. Codex follows the project skills to read existing records, check the facts, save through the shared CLI and read back the result. The workspace then displays the saved progress. Missing evidence should remain explicit rather than becoming invented accomplishments.

Up to three conversations can run tasks at once; each conversation handles one message at a time. Conversations created by this website remain available after reopening it. Interrupted tasks are not automatically resent when the service restarts: check the current state before continuing. Stopping a task does not undo files or records it has already changed. The website offers limited one-time approvals; continue in the Codex client when a task needs additional file access or broader permissions.

This uses the installed Codex App Server without clicking the Codex desktop window. Linking an existing chat reads its recent text and sends subsequent messages to that same original chat. The Codex client controls when its desktop sidebar refreshes; this is not a keystroke-synchronized editor. Claude Code and WorkBuddy continue to work through the skills described below.

Conversation records are stored separately in `assistant/` inside your data directory and are not included in the research JSON backup. An assistant reply alone does not establish that records were saved; check execution results, readback and the activity log. The assistant does not start research tasks on its own.

### Import progress from existing Codex conversations

Open **AI Assistant → Import from Codex**. The default **Link original chat** mode lets you select one conversation, **Review selected text**, choose a target research project and **Link and continue chatting**. You can then send messages from the website or return to that same chat in Codex. The workspace refreshes recent text while the linked chat is open. Create a target research project first if you do not have one.

To remove a linked entry, open it and choose **Remove link → Confirm unlink**. This removes its workspace entry, local chat cache and unsent draft. The original Codex chat, saved research records and other conversations remain available; you can link the source again later. Finish or stop any website-owned work in that chat first. Canceling or a save failure keeps the entry and draft.

**Linking a chat does not record research achievements.** Continue your discussion as usual; send **Update progress** or **Import progress** when you want supported facts saved to papers, experiments or tasks. Send from one client at a time: Codex may keep a chat locked while it is loaded, even when it is not generating a reply. If the website reports that the chat is in use, finish its task in Codex and leave the chat. If it stays locked, open the workspace URL in a separate browser, quit the Codex desktop app and retry there while keeping the workspace service running. Requests owned by Codex must be handled there.

To extract old material without continuing its source chat, switch to **Import progress only**. Select up to five conversations, preview them, choose the target project and click **Organize and import**. This mode starts a new workspace conversation that runs `phd-import` to match, deduplicate, save and read back research records. Original Codex conversations remain unchanged.

The list includes conversations available through this computer's Codex. “Source project” groups their working directories; it is not the complete desktop sidebar project list and does not determine the target research project. Load more, search or switch the archive filter as needed. Paste material manually if a conversation is unavailable. Previews include user and assistant text, exclude tool output, images and attachments, and disclose partial content for long conversations.

Listing, previewing and linking neither call the model nor change research data. Sending a message or choosing **Organize and import** invokes the signed-in Codex using its existing account allowance without an API key. Refresh expired previews. Retrying the same request does not create duplicate links or import tasks; later imports still compare facts and sources against existing records. Research progress is saved only after the CLI workflow and readback succeed.

### If a Codex chat cannot be read

The AI Assistant prefers a compatible desktop-bundled Codex CLI: Windows uses the desktop CLI already advertised in PATH; macOS checks Codex.app, then ChatGPT.app, before falling back to PATH. Linux keeps PATH discovery. To choose an installation explicitly, set the server-side `PHD_CODEX_PATH` to an existing absolute executable path before starting the workbench, for example `PHD_CODEX_PATH="/path/to/codex" node server.mjs` on macOS/Linux. An invalid explicit path does not silently select another CLI. This does not change the global PATH or install/upgrade Codex.

Older workspace versions reported “Update Codex” for several different history-read failures. That message alone does not establish an outdated installation. Even a recent Codex can hold older-format chats without support for message-by-message pagination, so updating Codex alone may not resolve it. The current reader tries alternate read-only interfaces when a method is explicitly unsupported, and distinguishes unsupported reading, failed reading and oversized responses. After updating this workspace, restart its service with the original data directory and refresh the page.

Check that the affected chat opens in Codex. Then run these commands in the same PowerShell used to start the workspace:

```powershell
codex --version
where.exe codex
```

These show the command-line version and candidate installation paths. The CLI found by the workspace may differ from the desktop app; updating the desktop app may leave another CLI installation unchanged. If multiple paths appear, check their versions. Update the relevant installation through its original installation method if needed, reopen the launch shell and restart the workspace. With WSL, check that the workspace and target chat use the same environment, since native Windows and WSL can have separate installations and local records.

Record the version, paths and whether all chats or only one fail when requesting help. For an oversized response, reconnect and choose a shorter chat or paste only the needed text. Manual text import remains available without clearing research data. Automated compatibility checks use protocol fixtures; actual Windows behavior still depends on the installed Codex and its local chats.

## Generate or manually import AI research advice

Open **Guidance → AI suggestions**, select a research project and optionally describe what you want to discuss. **Generate AI advice** creates a separate Codex conversation, reads that project's existing records and saves the resulting analysis and recommendations as AI advice through the CLI. The website opens the new conversation so you can follow progress and ask further questions. Return to the advice page to check the saved result. Viewing the page alone does not run a model.

Use **Import advice manually** to enter or paste existing advice, or add text from a `.txt` / `.md` file. Review the project and contents before saving. This path needs no Codex connection and does not run a model.

AI advice stays separate from real advisor meetings and does not automatically complete papers, experiments or tasks. Missing information remains explicit. Continue an interrupted generation in its existing conversation. If startup was not confirmed, retry the same request instead of creating another conversation.

## Activate a skill, then use short commands

Open the whole repository in your AI client. Install project-level skill entries once:

```sh
npm run skills:install
```

This creates entries in `.agents/skills/` for Codex, `.claude/skills/` for Claude Code and `.codebuddy/skills/` for WorkBuddy. It does not change global settings. macOS/Linux use relative directory links by default; Windows copies files. `--copy` forces copying, and `--target codex`, `--target claude` or `--target workbuddy` selects one client. Existing different content is protected.

Activate `phd-manager` in a new chat. For example, use `$phd-manager` in Codex, or ask the client to read `skills/phd-manager/SKILL.en.md` and follow it. Automatic skill discovery depends on the client's version and configuration; directly reading the file is the common fallback.

After activation, type these commands in the same chat without repeating a skill prefix:

| Command | Result |
| --- | --- |
| **Update progress** | Extract genuine research updates from the visible chat, match records, validate, save and read back. |
| **Import progress** | Read supplied text, Markdown, CSV or accessible files, deduplicate and merge supported facts. |
| **Update paper progress** | Update confirmed stages, sections and your explicitly supplied progress estimate. |
| **Update experiment progress** | Record actual experimental status, outcomes and evidence. |
| **Summarize advisor feedback** | Save genuine feedback and confirmed actions, keeping AI suggestions separate. |
| **Generate weekly report** | Summarize the last seven calendar days of changes alongside current status and blockers. |

For example, first say: “The methods section is complete. I estimate the paper at 60%. The ablation experiment has not run because I am waiting for data.” Then type **Update progress**. The AI uses the visible context and existing records, saves unambiguous updates and confirms them. The open website refreshes afterward.

Only visible or supplied material is used. Ambiguous projects or conflicting facts may require a specific clarification. If there is no new research information, nothing is invented or saved. Website development and demo records are not counted as research accomplishments. A new chat in an external AI client needs activation again; the website's AI Assistant supplies the project skill instructions and selected project context. Copy buttons in the Skills Center only copy text; sending in AI Assistant submits a task to Codex.

## Progress batches and backups are different

Skills parse ordinary research material and prepare incremental create/update operations. The batch protocol validates first and then applies the same file:

```sh
node cli.mjs batch --file progress-updates.json --dry-run
node cli.mjs batch --file progress-updates.json
```

Each batch contains 1–100 operations. A failed operation rolls back the whole batch, including activity entries. Updates require current record versions, and retries must read existing state first. The transaction covers database changes, not manuscript files. Repeated material should be matched and skipped rather than created again. See the [batch workflow](skills/phd-manager/references/batch-workflow.en.md) for its format.

Backups use the application's complete JSON snapshot format:

```sh
node cli.mjs export --file backups/research.json
node cli.mjs import --file backups/research.json
```

Snapshot import is a validated, atomic merge. It does not delete records missing from the backup or force stale versions over current data. Restore an old snapshot into a fresh data directory when appropriate. Do not pass Markdown or CSV directly to the snapshot import command; use **Import progress** so the AI reads and organizes that material.

## Data and evidence

Private data defaults to `data/`, which is excluded from Git. `PHD_DATA_DIR` can select another absolute directory; the website and CLI must use the same one. `.env.example` documents settings but `.env` is not loaded automatically. Reports use `Asia/Shanghai` by default; set `PHD_TIMEZONE` to another IANA time zone when needed.

```sh
node cli.mjs doctor
node cli.mjs state
node cli.mjs list papers
node cli.mjs report --lang en
```

`doctor` checks the environment and existing data without creating a workspace. Completed experiments require both results and evidence, which establishes record completeness rather than proving scientific correctness. Paper percentages are user estimates. Genuine advisor feedback is stored separately from AI advice. Keep uncertainties and source limitations explicit.

The webpage loads no external fonts, analytics scripts or cloud database. Core research management works independently. When you use AI Assistant, your messages and material read by Codex for the task may be sent to the configured model under Codex's sign-in, permissions and model settings. The website does not store model API keys or read or display Codex login tokens.

## Skills and validation

The 39 skill entries provide 75 commands (29 project workflows plus 10 imported GitHub skills) covering research management, topic selection, proposals, systematic reviews, close reading, citation audits, PDF extraction, data quality, statistics, figures, reproduction, code review, file organization, writing, translation, LaTeX, rebuttals, submission checks, presentations, posters, theses and defense preparation. Each entry has Chinese `SKILL.md` and English `SKILL.en.md` instructions with the same data contract. Imported source files retain their original language. See the [skills guide](docs/SKILLS_GUIDE.en.md) for the complete catalog and usage examples, and the [actually imported upstream bundles](docs/THIRD_PARTY_SKILLS.en.md). Original scripts and references are included with fixed revisions and licenses; external runtimes and services are not installed by the catalog.

```sh
npm run check
npm test
```

Tests use temporary data directories. See the [implementation contract](docs/IMPLEMENTATION_CONTRACT.md) for fields and interfaces and the [validation record](docs/VALIDATION.md) for checked behavior. The application is intended for individual local use; it does not provide cloud sync, multiple accounts, autonomous background research or automatic Zotero integration.

## License

Original project code, documentation, research skills and skill adapters are licensed under the [MIT License](LICENSE), copyright momo-land.

Third-party content in `vendor/skills/` retains its own MIT or Apache-2.0 license, copyright and attribution notices. The root license does not replace those upstream licenses. See the [third-party skills inventory](docs/THIRD_PARTY_SKILLS.en.md) for details.
