#!/bin/bash
# 开发启动脚本：切换到项目目录并清除会干扰 electron 的环境变量
cd "$(dirname "$0")"
unset ELECTRON_RUN_AS_NODE
npm run dev
