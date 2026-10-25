# 对话更新与材料导入的批量写入

遵循 [本地操作约定](local-workflow.md)。批次内容由当前 AI 根据用户授权和实际材料生成，不依赖模型 API 或某个客户端专属指令。

## 操作协议

```text
node cli.mjs batch --file <json-file> --dry-run
node cli.mjs batch --file <json-file>
```

`--file -` 可接收标准输入。顶层对象仅需 `operations`，含 1–100 个顺序执行的操作：

```json
{
  "operations": [
    {
      "action": "create",
      "collection": "tasks",
      "data": {
        "id": "new-task-id",
        "projectId": "existing-project-id",
        "title": "用户明确要求登记的任务",
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

示例中的 ID/version 必须替换为真实上下文。先 list 定位已有记录，移除无变化操作，合并同一记录的多次改动为一次 update，保留原 notes、关联数组及未变字段。不得把已有记录作为 create 再导入。

- 支持 `create` 和 `update`，不含删除。create 的 `data.id` 可省略；后项要引用新记录时，应先生成合法、未占用的稳定 ID，显式写入前项 `data.id`。
- 仅可引用已有记录或当前批次前面已创建的记录，不支持前向引用。新建项目、会议等父记录排在关联记录之前；论文和实验需要双向关联时先建论文，再建实验，再以 version 1 更新该新论文的关联。
- update 的 `id` 是操作级字段，`data.version` 是刚读取的版本；同批 create 初始 version 为 1。不要把版本当作能任意递增的冲突绕过手段。
- 一次批次的数据库变更整体成功或全部回滚，包括活动日志；事务不包含稿件等文件操作。若候选超过 100 项，可按依赖拆成多批，但多批之间不是一个事务；保存前备份，逐批回读并报告准确完成范围，不能宣称全部材料原子导入。

## 预检不是提交

预检成功返回 `{ok:true,dryRun:true,applied:0,results:[...]}`；正式成功返回 `dryRun:false` 及实际 `applied` 数。`results` 含每项 index/action/collection/record。预检回滚所有写入，临时生成的随机 ID 和时间不会保留，因此不要拿预检自动分配的 ID 去构建后项或向用户报告“已保存”。

用户已要求一键更新/导入时，事实明确部分在预检通过后直接正式执行，无需重复批准。版本在正式执行时仍会重新检查；遇冲突先回读并判断变化，不能把预检成功视为无条件提交许可。错误会说明失败项，整批均未保存。

正式成功后，通过 list/state 回读核对变化、来源和关联。回读失败时说明提交返回的结果与当前核验限制，勿直接重试 create；先查明已有落地情况。网页已打开时会自动刷新共享状态，CLI 无需等待服务器运行。
