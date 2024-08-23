# flake8: noqa
import os
from fastapi import FastAPI
from dotenv import load_dotenv
from langchain import hub
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain.tools import Tool
from langchain_core.output_parsers import StrOutputParser
from langchain.memory import ConversationBufferMemory
from pydantic import BaseModel
import pika
import json

load_dotenv(dotenv_path='.env')

app = FastAPI()

# 从环境变量获取API密钥
api_key = os.environ["OPENAI_API_KEY"]

print(api_key)
# 初始化ChatOpenAI LLM
def create_chain():      
    llm = ChatOpenAI(model="gpt-4", api_key=api_key)
    memory = InMemoryChatMessageHistory(session_id="test-session")
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You are a financial assistant"),
            ("human", "{input}"),
            # Placeholders fill up a **list** of messages
            ("placeholder", "{agent_scratchpad}"),
        ]
    )
    response_only_parser = StrOutputParser()
    return prompt | llm | response_only_parser


def search_tool(query: str) -> str:
    return f"搜索结果: {query}"


def calculator_tool(expression: str) -> str:
    return f"计算结果: {eval(expression)}"


tools = [
    Tool(name="搜索", func=search_tool, description="用于搜索信息的工具"),
    Tool(name="计算器", func=calculator_tool, description="用于进行数学计算的工具")
]

# 用户内存字典
user_memories = {}

