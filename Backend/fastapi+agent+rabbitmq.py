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
from langchain.memory import ConversationBufferMemory
from pydantic import BaseModel
import pika
import json

load_dotenv()

app = FastAPI()

# 从环境变量获取API密钥
api_key = os.environ["OPENAI_API_KEY"]

# 初始化ChatOpenAI LLM
model = ChatOpenAI(model="gpt-4o", api_key=api_key)
memory = InMemoryChatMessageHistory(session_id="test-session")
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a financial assistant"),
        ("human", "{input}"),
        # Placeholders fill up a **list** of messages
        ("placeholder", "{agent_scratchpad}"),
    ]
)


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


# 全局agent初始化
agent = create_json_agent(
    tools,
    model,
    agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
    memory=ConversationBufferMemory(memory_key="chat_history", return_messages=True),
    verbose=True,
    max_iterations=10
)


class Query(BaseModel):
    text: str
    

@app.post("/agent")
async def run_agent(query: Query):
    response = agent.run(query.text)
    return {"response": response}

# RabbitMQ连接设置
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

channel.queue_declare(queue='message_queue')


def callback(ch, method, properties, body):
    message = json.loads(body)
    print(f"收到新用户: {message}")
    # 这里可以添加处理新用户的逻辑
    response = agent.run(message)
    print(f"ai_agent: {response}")


channel.basic_consume(
    queue='message_queue',
    on_message_callback=callback,
    auto_ack=True
)


print('等待消息。按CTRL+C退出')
channel.start_consuming()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)