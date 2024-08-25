#!/bin/bash

# 激活虚拟环境
source venv/bin/activate

# 切换到项目目录
cd AgentAPI

# 运行你的 Python 脚本
python3 chat_agent_controllor.py

# 可选：在脚本结束后停留在虚拟环境中
# 如果你想在脚本结束后自动退出虚拟环境，请注释掉下面这行
exec $SHELL