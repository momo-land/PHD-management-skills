#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COLLECTIONS, createStore, StoreError } from './lib/store.mjs';

const HELP = `PHD-management-skills 本地科研管理

node cli.mjs init [--demo]                     初始化（默认空数据）
node cli.mjs state [--project <id>]             查看状态
node cli.mjs list <collection> [--project <id>] 列出记录
node cli.mjs add <collection> --file <path|->   新增 JSON 记录
node cli.mjs update <collection> <id> --file <path|->
                                              更新（JSON 必须含 version）
node cli.mjs batch --file <path|-> [--dry-run]  原子批量更新；可先校验预览
node cli.mjs remove <collection> <id> --version <n>
node cli.mjs report [--project <id>] [--lang zh|en]
                                              输出 Markdown 周报（默认中文）
node cli.mjs export --file <path>              导出完整快照
node cli.mjs import --file <path|->             原子合并导入
node cli.mjs clear-demo                        清除示例记录
node cli.mjs clear-demo-history                仅清除已删除示例的活动历史；保留现存记录、真实历史和 AI 对话
node cli.mjs doctor                            检查运行环境

数据类型：${COLLECTIONS.join(', ')}
PHD_DATA_DIR 可指定数据目录；无需启动网站。`;

function parseArgs(args) {
  const positional = []; const flags = {};
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument.startsWith('--')) {
      const name = argument.slice(2);
      if (!['demo', 'file', 'project', 'version', 'help', 'dry-run', 'lang'].includes(name) || name in flags) throw new StoreError(`未知或重复的选项：${argument}。`);
      if (['demo', 'help', 'dry-run'].includes(name)) flags[name] = true;
      else {
        const value = args[++index];
        if (!value || value.startsWith('--')) throw new StoreError(`${argument} 需要一个值。`);
        flags[name] = value;
      }
    } else positional.push(argument);
  }
  return { positional, flags };
}
async function readJson(path) {
  if (!path) throw new StoreError('需要 --file <JSON 文件路径>；使用 - 可从标准输入读取。');
  let content;
  if (path === '-') { const chunks = []; for await (const chunk of process.stdin) chunks.push(chunk); content = Buffer.concat(chunks).toString('utf8'); }
  else content = await readFile(resolve(path), 'utf8');
  try { return JSON.parse(content); } catch { throw new StoreError('文件包含无效的 JSON。', 'INVALID_JSON'); }
}
function scopedState(snapshot, projectId) {
  if (!projectId) return snapshot;
  if (!snapshot.projects.some(record => record.id === projectId)) throw new StoreError('科研项目不存在。', 'NOT_FOUND', 404);
  const scoped = { ...snapshot };
  for (const collection of COLLECTIONS) scoped[collection] = snapshot[collection].filter(record => collection === 'projects' ? record.id === projectId : record.projectId === projectId);
  const ids = new Set(COLLECTIONS.flatMap(collection => scoped[collection].map(record => `${collection}:${record.id}`)));
  scoped.activity = snapshot.activity.filter(entry => ids.has(`${entry.collection}:${entry.recordId}`));
  return scoped;
}

function diagnose() {
  const dataDir = resolve(process.env.PHD_DATA_DIR || fileURLToPath(new URL('./data', import.meta.url)));
  const databasePath = resolve(dataDir, 'research.sqlite');
  const timeZone = process.env.PHD_TIMEZONE || 'Asia/Shanghai';
  try { new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date()); }
  catch { throw new StoreError('PHD_TIMEZONE 必须是有效的时区名称。'); }
  const initialized = existsSync(databasePath);
  const database = new DatabaseSync(initialized ? databasePath : ':memory:', initialized ? { readOnly: true } : {});
  try {
    const sqliteVersion = database.prepare('SELECT sqlite_version() AS version').get().version;
    const schemaVersion = initialized ? Number(database.prepare("SELECT value FROM metadata WHERE key='schemaVersion'").get()?.value) : 1;
    if (schemaVersion !== 1) throw new StoreError('数据库版本不受支持，请先备份。', 'SCHEMA_VERSION');
    const records = initialized ? database.prepare('SELECT count(*) AS count FROM records').get().count : 0;
    return { ok: true, node: process.version, sqlite: true, sqliteVersion, schemaVersion, initialized, dataDir, timeZone, records, network: 'local-only', database: 'research.sqlite' };
  } finally { database.close(); }
}

let store;
try {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const [command, collection, id] = positional;
  if (!command || command === 'help' || flags.help) console.log(HELP);
  else {
    const specifications = { init: [1, ['demo']], state: [1, ['project']], list: [2, ['project']], add: [2, ['file']], update: [3, ['file']], batch: [1, ['file', 'dry-run']], remove: [3, ['version']], report: [1, ['project', 'lang']], export: [1, ['file']], import: [1, ['file']], 'clear-demo': [1, []], 'clear-demo-history': [1, []], doctor: [1, []] };
    const specification = specifications[command];
    if (!specification) throw new StoreError(`未知命令：${command}。使用 help 查看帮助。`);
    if (positional.length !== specification[0] || Object.keys(flags).some(flag => !specification[1].includes(flag))) throw new StoreError('命令参数不正确，请使用 help 查看用法。');
    if (['list', 'add', 'update', 'remove'].includes(command) && !COLLECTIONS.includes(collection)) throw new StoreError('未知的数据类型。', 'NOT_FOUND', 404);
    if (command !== 'doctor') store = createStore({ demo: command === 'init' && Boolean(flags.demo) });
    let result;
    switch (command) {
      case 'init': {
        const snapshot = store.state();
        result = { ok: true, demo: COLLECTIONS.some(name => snapshot[name].some(record => record.origin === 'demo')), counts: Object.fromEntries(COLLECTIONS.map(name => [name, snapshot[name].length])) }; break;
      }
      case 'state': result = scopedState(store.state(), flags.project); break;
      case 'list': result = scopedState(store.state(), flags.project)[collection]; break;
      case 'add': result = store.create(collection, await readJson(flags.file)); break;
      case 'update': result = store.update(collection, id, await readJson(flags.file)); break;
      case 'batch': result = store.batch(await readJson(flags.file), { dryRun: Boolean(flags['dry-run']) }); break;
      case 'remove': result = store.remove(collection, id, Number(flags.version)); break;
      case 'report': console.log(store.report(flags.project, flags.lang).markdown); break;
      case 'export':
        if (!flags.file || flags.file === '-') throw new StoreError('导出需要 --file <目标文件路径>。');
        await mkdir(dirname(resolve(flags.file)), { recursive: true, mode: 0o700 });
        await writeFile(resolve(flags.file), `${JSON.stringify(store.state(), null, 2)}\n`, { mode: 0o600 });
        result = { ok: true, file: resolve(flags.file) }; break;
      case 'import': result = store.importSnapshot(await readJson(flags.file)); break;
      case 'clear-demo': result = store.clearDemo(); break;
      case 'clear-demo-history': result = store.clearDemoHistory(); break;
      case 'doctor': {
        result = diagnose();
        break;
      }
    }
    if (result !== undefined) console.log(JSON.stringify(result, null, 2));
  }
} catch (error) {
  const message = error instanceof StoreError ? error.message : ['ENOENT', 'EACCES', 'EPERM'].includes(error.code) ? `无法访问文件或数据目录：${error.message}` : error.message;
  console.error(JSON.stringify({ error: message, code: error.code || 'INTERNAL_ERROR' })); process.exitCode = 1;
} finally { store?.close(); }
