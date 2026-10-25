import { createServer as createHttpServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { COLLECTIONS, createStore, StoreError, validateLocale } from './lib/store.mjs';
import { localizeError, requestLocale } from './lib/error-locale.mjs';
import { createAssistantRoutes } from './lib/assistant-routes.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(ROOT, 'public');
const SKILLS = resolve(ROOT, 'skills');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const MAX_BODY = 2 * 1024 * 1024;

function sendJson(response, status, value, extra = {}) {
  response.writeHead(status, { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store', ...extra });
  response.end(JSON.stringify(value));
}
async function jsonBody(request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers['content-type'] || '')) throw new StoreError('请求必须使用 application/json。', 'JSON_REQUIRED');
  if (Number(request.headers['content-length']) > MAX_BODY) { request.resume(); throw new StoreError('请求内容不能超过 2 MB。', 'BODY_TOO_LARGE', 413); }
  const content = await new Promise((resolveBody, reject) => {
    let size = 0; const chunks = []; let rejected = false;
    request.on('data', chunk => {
      if (rejected) return;
      size += chunk.length;
      if (size > MAX_BODY) { rejected = true; chunks.length = 0; reject(new StoreError('请求内容不能超过 2 MB。', 'BODY_TOO_LARGE', 413)); return; }
      chunks.push(chunk);
    });
    request.on('end', () => { if (!rejected) resolveBody(Buffer.concat(chunks).toString('utf8')); });
    request.on('error', () => reject(new StoreError('请求读取中断。', 'INVALID_REQUEST')));
    request.on('aborted', () => reject(new StoreError('请求读取中断。', 'INVALID_REQUEST')));
  });
  try { return JSON.parse(content); }
  catch { throw new StoreError('请求包含无效的 JSON。', 'INVALID_JSON'); }
}
function checkLocalRequest(request) {
  const port = request.socket.localPort;
  const hosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
  if (port === 80) { hosts.add('localhost'); hosts.add('127.0.0.1'); }
  if (!hosts.has((request.headers.host || '').toLowerCase())) throw new StoreError('仅允许通过本机地址访问。', 'BAD_ORIGIN', 403);
  const origin = request.headers.origin;
  if (origin !== undefined && ![...hosts].some(host => origin === `http://${host}`)) throw new StoreError('已阻止来自其他网站的写入请求。', 'BAD_ORIGIN', 403);
  if (request.headers['sec-fetch-site'] === 'cross-site') throw new StoreError('已阻止跨站写入请求。', 'BAD_ORIGIN', 403);
}
async function skillCatalog() {
  const parsed = JSON.parse(await readFile(resolve(SKILLS, 'catalog.json'), 'utf8'));
  if (!Array.isArray(parsed)) throw new StoreError('技能目录格式错误。', 'SKILL_CATALOG', 500);
  return parsed;
}
async function safeFile(base, relative) {
  const path = resolve(base, relative);
  if (!path.startsWith(`${base}${sep}`)) throw new StoreError('文件不存在。', 'NOT_FOUND', 404);
  let actual;
  try { actual = await realpath(path); }
  catch (error) { if (['ENOENT', 'ENOTDIR'].includes(error.code)) throw new StoreError('文件不存在。', 'NOT_FOUND', 404); throw error; }
  if (!actual.startsWith(`${base}${sep}`)) throw new StoreError('文件不存在。', 'NOT_FOUND', 404);
  return readFile(actual);
}

export function createServer({ dataDir, demo = true, store: suppliedStore, assistantOptions = {} } = {}) {
  const store = suppliedStore || createStore({ dataDir, demo });
  const assistant = createAssistantRoutes({root:ROOT,dataDir:resolve(dataDir || process.env.PHD_DATA_DIR || resolve(ROOT,'data')),store,...assistantOptions});
  const server = createHttpServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    try {
      const url = new URL(request.url, 'http://127.0.0.1');
      const path = url.pathname;
      const method = request.method;
      if (path.startsWith('/api/')) {
        checkLocalRequest(request);
        if (path.startsWith('/api/assistant/')) { await assistant.handle(request,response,url); return; }
        if (method === 'GET' && path === '/api/health') return sendJson(response, 200, { ok: true });
        if (method === 'GET' && path === '/api/state') return sendJson(response, 200, store.state());
        if (method === 'GET' && path === '/api/export') return sendJson(response, 200, store.state(), { 'Content-Disposition': 'attachment; filename="phd-management-backup.json"' });
        if (method === 'GET' && path === '/api/report') return sendJson(response, 200, store.report(url.searchParams.get('projectId') || undefined, url.searchParams.get('lang') ?? 'zh'));
        if (method === 'GET' && path === '/api/skills') return sendJson(response, 200, await skillCatalog());
        const skillMatch = path.match(/^\/api\/skills\/([a-z0-9_-]+)$/);
        if (method === 'GET' && skillMatch) {
          const id = skillMatch[1];
          const locale = validateLocale(url.searchParams.get('lang') ?? 'zh');
          if (!(await skillCatalog()).some(skill => skill.id === id)) throw new StoreError('技能不存在。', 'NOT_FOUND', 404);
          return sendJson(response, 200, { id, content: (await safeFile(SKILLS, `${id}/${locale === 'en' ? 'SKILL.en.md' : 'SKILL.md'}`)).toString('utf8') });
        }
        if (method === 'POST' && path === '/api/batch') {
          const body = await jsonBody(request);
          if (!body || typeof body !== 'object' || Array.isArray(body)) throw new StoreError('请提供 {operations: 操作数组, dryRun?: 布尔值}。');
          const { dryRun = false, ...payload } = body;
          return sendJson(response, 200, store.batch(payload, { dryRun }));
        }
        if (method === 'POST' && path === '/api/import') {
          const body = await jsonBody(request);
          if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(field => field !== 'data') || !body.data) throw new StoreError('请提供 {data: 快照对象}。');
          return sendJson(response, 200, store.importSnapshot(body.data));
        }
        if (method === 'POST' && path === '/api/demo/clear') {
          const body = await jsonBody(request);
          if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length) throw new StoreError('清除示例的请求体应为 {}。');
          return sendJson(response, 200, store.clearDemo());
        }
        const match = path.match(/^\/api\/([a-z]+)(?:\/([A-Za-z0-9_-]{1,128}))?$/);
        if (match && COLLECTIONS.includes(match[1])) {
          const [, collection, id] = match;
          if (method === 'POST' && !id) return sendJson(response, 201, store.create(collection, await jsonBody(request)));
          if (method === 'PATCH' && id) return sendJson(response, 200, store.update(collection, id, await jsonBody(request)));
          if (method === 'DELETE' && id) {
            const body = await jsonBody(request);
            if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(field => field !== 'version')) throw new StoreError('删除操作仅接受 {version: 当前版本}。');
            return sendJson(response, 200, store.remove(collection, id, body.version));
          }
        }
        throw new StoreError('API 路径或请求方法不存在。', 'NOT_FOUND', 404);
      }
      if (!['GET', 'HEAD'].includes(method)) throw new StoreError('请求方法不受支持。', 'METHOD_NOT_ALLOWED', 405);
      let relative;
      try { relative = decodeURIComponent(path).replace(/^\/+/, '') || 'index.html'; }
      catch { throw new StoreError('无效的文件路径。'); }
      if (relative.split('/').some(segment => segment.startsWith('.')) || relative.includes('\\') || relative.includes('\0')) throw new StoreError('文件不存在。', 'NOT_FOUND', 404);
      const mime = MIME[extname(relative).toLowerCase()];
      if (!mime) throw new StoreError('文件不存在。', 'NOT_FOUND', 404);
      const content = await safeFile(PUBLIC, relative);
      response.writeHead(200, { 'Content-Type': mime, 'Content-Length': content.length, 'Cache-Control': 'no-cache' });
      response.end(method === 'HEAD' ? undefined : content);
    } catch (error) {
      if (response.writableEnded || response.destroyed) return;
      const locale = requestLocale(request.headers['accept-language']);
      if (error instanceof StoreError) sendJson(response, error.status, { error: localizeError(error, locale), code: error.code });
      else {
        console.error('[Research Desk]', error.message);
        const message = '本地服务发生错误，请查看终端中的诊断信息。';
        sendJson(response, 500, { error: localizeError({ message, code: 'INTERNAL_ERROR' }, locale), code: 'INTERNAL_ERROR' });
      }
    }
  });
  server.store = store;
  server.assistant = assistant;
  server.on('close', () => assistant.close());
  if (!suppliedStore) server.on('close', () => store.close());
  return server;
}

export async function startServer({ port = Number(process.env.PORT || 4318), ...options } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new StoreError('端口必须为 0–65535 的整数。');
  const server = createServer(options);
  try {
    await new Promise((resolvePromise, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', () => { server.removeListener('error', reject); resolvePromise(); });
    });
  } catch (error) { if (!options.store) server.store.close(); throw error; }
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  startServer().then(server => {
    console.log(`Research Desk 已启动：http://127.0.0.1:${server.address().port}`);
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close(() => process.exit(0)));
  }).catch(error => { console.error(`启动失败：${error.code === 'EADDRINUSE' ? '端口已被占用，请关闭已有服务或设置 PORT。' : error.message}`); process.exitCode = 1; });
}
