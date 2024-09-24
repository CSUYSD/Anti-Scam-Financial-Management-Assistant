# 初始化模块

# 导入必要的模块
from chat_agent import create_chain, tools, user_memories
from chat_agent_controllor import app, callback, channel

# 设置版本号
__version__ = "0.1.0"

# 初始化全局变量
chain = create_chain()

# 导出主要的类和函数
__all__ = [
    "create_chain",
    "tools",
    "user_memories",
    "app",
    "callback",
    "channel",
    "chain"
]

print("myenv 模块已初始化")

