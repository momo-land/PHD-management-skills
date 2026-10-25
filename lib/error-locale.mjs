// Translate only known system messages. Captured record titles, IDs and field names
// remain verbatim; unknown messages fall back to their original wording.
const fixed = new Map([
  ['INVALID_LOCALE', '语言必须为 zh 或 en。', 'Language must be zh or en.'],
  ['NOT_FOUND', '未知的数据类型。', 'Unknown collection.'],
  ['NOT_FOUND', '记录不存在，可能已经被删除。', 'The record does not exist or has already been deleted.'],
  ['NOT_FOUND', '科研项目不存在。', 'The research project does not exist.'],
  ['NOT_FOUND', '文件不存在。', 'The file does not exist.'],
  ['NOT_FOUND', '技能不存在。', 'The skill does not exist.'],
  ['NOT_FOUND', 'API 路径或请求方法不存在。', 'The API path or request method does not exist.'],
  ['VERSION_CONFLICT', '记录已被其他操作更新，请刷新后重试。', 'The record has changed. Refresh and review the latest version before retrying.'],
  ['DUPLICATE_ID', '该 ID 的记录已存在。', 'A record with this ID already exists.'],
  ['AUDIT_CONFLICT', '导入的活动历史与已有的同 ID 记录冲突，未修改任何数据。', 'Imported activity conflicts with an existing entry with the same ID. No data was changed.'],
  ['SCHEMA_VERSION', '数据库版本不受支持，请先备份。', 'This database version is not supported. Back it up before making changes.'],
  ['CLOSED', '数据库已关闭。', 'The database is closed.'],
  ['JSON_REQUIRED', '请求必须使用 application/json。', 'The request must use application/json.'],
  ['INVALID_JSON', '请求包含无效的 JSON。', 'The request contains invalid JSON.'],
  ['BODY_TOO_LARGE', '请求内容不能超过 2 MB。', 'The request body must not exceed 2 MB.'],
  ['INVALID_REQUEST', '请求读取中断。', 'The request body could not be read completely.'],
  ['BAD_ORIGIN', '仅允许通过本机地址访问。', 'Access is allowed only through a local loopback address.'],
  ['BAD_ORIGIN', '已阻止来自其他网站的写入请求。', 'The write request from another website was blocked.'],
  ['BAD_ORIGIN', '已阻止跨站写入请求。', 'The cross-site write request was blocked.'],
  ['SKILL_CATALOG', '技能目录格式错误。', 'The skill catalog has an invalid format.'],
  ['METHOD_NOT_ALLOWED', '请求方法不受支持。', 'This request method is not supported.'],
  ['INTERNAL_ERROR', '本地服务发生错误，请查看终端中的诊断信息。', 'The local service encountered an error. Check the terminal for diagnostic information.'],
  ['VALIDATION', '记录必须是 JSON 对象。', 'The record must be a JSON object.'],
  ['VALIDATION', 'id 只能包含英文字母、数字、下划线和连字符，长度为 1–128。', 'id must contain 1–128 letters, digits, underscores or hyphens.'],
  ['VALIDATION', '标题不能为空，且不能超过 500 个字符。', 'The title is required and must not exceed 500 characters.'],
  ['VALIDATION', 'origin 必须为 user、ai、import 或 demo。', 'origin must be user, ai, import or demo.'],
  ['VALIDATION', 'version 必须为正整数。', 'version must be a positive integer.'],
  ['VALIDATION', '记录时间必须是有效的 UTC ISO 时间。', 'Record timestamps must be valid UTC ISO timestamps.'],
  ['VALIDATION', '请选择有效的科研项目（projectId）。', 'Select a valid research project (projectId).'],
  ['VALIDATION', '论文自估进度必须是 0–100 的整数。', 'The paper progress estimate must be an integer from 0 to 100.'],
  ['VALIDATION', 'sections 必须为数组，最多 200 项。', 'sections must be an array with no more than 200 entries.'],
  ['VALIDATION', '章节必须包含有效的 name 和 status（todo、drafting、done）。', 'Each section must have a valid name and status (todo, drafting or done).'],
  ['VALIDATION', '任务优先级必须为 high、medium 或 low。', 'Task priority must be high, medium or low.'],
  ['VALIDATION', '文献年份必须为 1–9999 的整数或 null。', 'The publication year must be an integer from 1 to 9999, or null.'],
  ['VALIDATION', '文献 URL 必须为有效的 http 或 https 地址。', 'The literature URL must be a valid http or https address.'],
  ['VALIDATION', '文献 URL 仅支持 http 和 https。', 'The literature URL supports only http and https.'],
  ['VALIDATION', '完成实验必须填写结果（result）和证据（evidence）。', 'A completed experiment requires both result and evidence.'],
  ['VALIDATION', 'PHD_TIMEZONE 必须为有效的时区名称，例如 Asia/Shanghai。', 'PHD_TIMEZONE must be a valid time zone name, such as Asia/Shanghai.'],
  ['VALIDATION', '不能在已有事务中嵌套批量预览。', 'A batch preview cannot be nested inside an existing transaction.'],
  ['VALIDATION', '请提供当前记录的 version 正整数。', 'Provide the current record version as a positive integer.'],
  ['VALIDATION', '批量请求仅接受 {operations: 操作数组}。', 'A batch request accepts only {operations: an array of operations}.'],
  ['VALIDATION', 'operations 必须为包含 1–100 项的数组。', 'operations must be an array containing 1–100 entries.'],
  ['VALIDATION', '批量选项仅接受布尔值 dryRun。', 'Batch options accept only the boolean dryRun flag.'],
  ['VALIDATION', '每项操作的 action 必须为 create 或 update；批量操作不支持删除。', 'Each operation action must be create or update. Batch deletion is not supported.'],
  ['VALIDATION', '操作包含未知字段；新建记录的显式 ID 应填写在 data.id。', 'The operation contains unknown fields. Put an explicit ID for a new record in data.id.'],
  ['VALIDATION', '更新操作必须提供有效的记录 id。', 'An update operation requires a valid record id.'],
  ['VALIDATION', '导入文件必须使用 schemaVersion: 1。', 'The import must use schemaVersion: 1.'],
  ['VALIDATION', '快照 updatedAt 无效。', 'The snapshot updatedAt timestamp is invalid.'],
  ['VALIDATION', 'activity 必须为数组。', 'activity must be an array.'],
  ['VALIDATION', '导入文件包含无效的 activity 元数据。', 'The import contains invalid activity metadata.'],
  ['VALIDATION', '已有记录的 createdAt 不能改变。', 'createdAt cannot be changed for an existing record.'],
  ['VALIDATION', '请提供 {operations: 操作数组, dryRun?: 布尔值}。', 'Provide {operations: an array of operations, dryRun?: boolean}.'],
  ['VALIDATION', '请提供 {data: 快照对象}。', 'Provide {data: a snapshot object}.'],
  ['VALIDATION', '清除示例的请求体应为 {}。', 'The clear-demo request body must be {}.'],
  ['VALIDATION', '删除操作仅接受 {version: 当前版本}。', 'Deletion accepts only {version: the current version}.'],
  ['VALIDATION', '无效的文件路径。', 'Invalid file path.'],
  ['VALIDATION', '端口必须为 0–65535 的整数。', 'The port must be an integer from 0 to 65535.'],
].map(([code, message, translation]) => [JSON.stringify([code, message]), translation]));

const recordTypes = { '科研项目': 'project', '论文': 'paper', '实验': 'experiment', '任务': 'task', '导师会议': 'supervisor meeting', '文献': 'literature record', 'AI 研究建议': 'AI research advice record' };
const rules = [
  ['VALIDATION', /^不支持的字段：([\s\S]*)。$/, ([, field]) => `Unsupported field: ${field}.`],
  ['VALIDATION', /^(createdAt|updatedAt|version) 由系统生成。$/, ([, field]) => `${field} is generated by the system.`],
  ['VALIDATION', /^不能修改 (id|createdAt|updatedAt)。$/, ([, field]) => `${field} cannot be changed.`],
  ['VALIDATION', /^无效的状态；可选：([a-z_、]+)。$/, ([, statuses]) => `Invalid status. Allowed values: ${statuses.split('、').join(', ')}.`],
  ['VALIDATION', /^([A-Za-z][A-Za-z0-9]*) 必须是文本，且不能超过 200000 个字符。$/, ([, field]) => `${field} must be text with no more than 200000 characters.`],
  ['VALIDATION', /^(date|dueDate|targetDate) 必须是有效的 YYYY-MM-DD 日期或空字符串。$/, ([, field]) => `${field} must be a valid YYYY-MM-DD date or an empty string.`],
  ['VALIDATION', /^(experimentIds|literatureIds) 必须为不重复的有效 ID 数组。$/, ([, field]) => `${field} must be an array of unique valid IDs.`],
  ['VALIDATION', /^“([\s\S]*)” 引用了不存在的(科研项目|论文|实验|任务|导师会议|文献|AI 研究建议)：([\s\S]*)。$/, ([, title, type, id]) => `“${title}” references a missing ${recordTypes[type]}: ${id}.`],
  ['VALIDATION', /^“([\s\S]*)” 的关联记录必须属于同一个科研项目。$/, ([, title]) => `Linked records for “${title}” must belong to the same research project.`],
  ['DEPENDENCY_CONFLICT', /^“([\s\S]*)” 仍引用待删除记录，请先解除关联或删除依赖记录。$/, ([, title]) => `“${title}” still references a record being deleted. Remove the link or the dependent record first.`],
  ['VALIDATION', /^不支持的快照字段：([\s\S]*)。$/, ([, field]) => `Unsupported snapshot field: ${field}.`],
  ['VALIDATION', /^(projects|papers|experiments|tasks|meetings|literature|reviews) 必须为数组。$/, ([, collection]) => `${collection} must be an array.`],
  ['VALIDATION', /^导入的(科研项目|论文|实验|任务|导师会议|文献|AI 研究建议)必须包含有效 id。$/, ([, type]) => `An imported ${recordTypes[type]} must have a valid id.`],
  ['VALIDATION', /^(projects|papers|experiments|tasks|meetings|literature|reviews) 中包含重复 ID：([A-Za-z0-9_-]+)。$/, ([, collection, id]) => `${collection} contains a duplicate ID: ${id}.`],
];

export function requestLocale(acceptLanguage = '') {
  if (typeof acceptLanguage !== 'string') return 'zh';
  const supported = acceptLanguage.split(',').map((part, index) => {
    const [tag, ...parameters] = part.trim().toLowerCase().split(';');
    const language = tag.split('-')[0];
    const quality = parameters.find(parameter => parameter.trim().startsWith('q='));
    const weight = quality === undefined ? 1 : Number(quality.trim().slice(2));
    return { language, weight, index };
  }).filter(({ language, weight }) => ['en', 'zh'].includes(language) && weight > 0 && weight <= 1)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  return supported[0]?.language || 'zh';
}

export function localizeError(error, locale = 'zh') {
  const message = error.message;
  if (locale !== 'en') return message;
  const batch = /^第 ([1-9]\d{0,2}) 项操作失败，整批未写入：([\s\S]+)$/.exec(message);
  if (batch && Number(batch[1]) <= 100) {
    const detail = localizeError({ code: error.code, message: batch[2] }, locale);
    if (detail !== batch[2]) return `Operation ${batch[1]} failed; no changes in this batch were saved: ${detail}`;
    return message;
  }
  const translation = fixed.get(JSON.stringify([error.code, message]));
  if (translation !== undefined) return translation;
  for (const [code, pattern, render] of rules) {
    if (error.code !== code) continue;
    const match = pattern.exec(message);
    if (match) return render(match);
  }
  return message;
}
