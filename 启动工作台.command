#!/bin/zsh
cd "$(dirname "$0")" || exit 1
PHD_NODE_BIN="$(command -v node)"
if [[ -z "$PHD_NODE_BIN" && -x "$HOME/.local/bin/node" ]]; then
  PHD_NODE_BIN="$HOME/.local/bin/node"
fi
if [[ -z "$PHD_NODE_BIN" ]]; then
  print "未找到 Node.js。请先安装 Node.js 24 或更新版本，然后重新打开本文件。"
  read "?按回车关闭窗口。"
  exit 1
fi
print "PHD-management-skills · 本地科研工作台"
print "启动后，请打开终端显示的本机网址。关闭本窗口会停止服务。"
"$PHD_NODE_BIN" server.mjs
PHD_EXIT_CODE=$?
if [[ $PHD_EXIT_CODE -ne 0 ]]; then
  read "?按回车关闭窗口。"
fi
exit $PHD_EXIT_CODE
