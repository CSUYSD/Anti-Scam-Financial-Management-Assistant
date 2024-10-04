# flake8: noqa
from chat_agent import create_chain
from mq_handler import mq_handler
from fastapi import FastAPI
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel
import pika
import json
import threading


app = FastAPI()
# agent 初始化
chain = create_chain()


def chat_agent_callback(ch, method, properties, body):
    message = json.loads(body)
    print(f"user_message: {message}")
    # 这里可以添加处理新用户的逻辑
    response = chain.invoke(message)
    print(f"agent_response: {response}")

#调用mq_handler创建特定channel
agent_channel = mq_handler.create_channel('message_queue', chat_agent_callback)
print('chat agent is waiting message. press CTRL+C to exit')

#后台线程启动chat agent
mq_thread = threading.Thread(target=mq_handler.start_consuming, args=(agent_channel,))
mq_thread.start()

# FastAPI 测试接口
@app.post("/agent")
async def run_agent(string: str):
    response = chain.invoke(str)
    return {"response": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)