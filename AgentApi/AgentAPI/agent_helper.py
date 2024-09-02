# flake8: noqa: E501
from langchain_core.messages import (
    BaseMessage,
    HumanMessage,
    ToolMessage,
)
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from langgraph.graph import END, StateGraph, START
from typing import Annotated
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.tools import tool
from langchain_experimental.utilities import PythonREPL
from dotenv import load_dotenv
import os
print("============agent initializing============")

load_dotenv("../.env")
tavily_api_key = os.environ["TAVILY_API_KEY"]
openai_api_key = os.environ["OPENAI_API_KEY"]
langsmith_api_key = os.environ["LANGCHAIN_API_KEY"]
langsmith_endpoint = os.environ["LANGCHAIN_ENDPOINT"]
langsmith_tracing_v2 = os.environ["LANGCHAIN_TRACING_V2"]

# 创建一个代理
def create_agent(llm, tools, system_message: str):
    """Create an agent."""
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a helpful AI assistant, collaborating with other assistants."
                " Use the provided tools to progress towards answering the question."
                " If you are unable to fully answer, that's OK, another assistant with different tools "
                " will help where you left off. Execute what you can to make progress."
                " If you or any of the other assistants have the final answer or deliverable,"
                " prefix your response with FINAL ANSWER so the team knows to stop."
                " You have access to the following tools: {tool_names}.\n{system_message}",
            ),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )
    prompt = prompt.partial(system_message=system_message)
    prompt = prompt.partial(tool_names=", ".join([tool.name for tool in tools]))
    return prompt | llm.bind_tools(tools)

# 创建agent工具
# 创建一个用于全科医生(GP)的Tavily搜索工具
gp_tools = TavilySearchResults(
    api_key=tavily_api_key, 
    max_results=5, 
    search_depth="advanced",
    exclude_domains=["wikipedia.org"],
    k=3,
    include_domains=["mayoclinic.org", "medlineplus.gov", "nhs.uk"],
    include_raw_content=True,
    filter_language="en",
)

# 创建一个用于内科医生的Tavily搜索工具
internal_specialist_tools = TavilySearchResults(
    api_key=tavily_api_key,
    max_results=7,
    search_depth="advanced",
    exclude_domains=["wikipedia.org"],
    k=5,
    include_domains=["nejm.org", "thelancet.com", "jamanetwork.com", "bmj.com"],
    include_raw_content=True,
    filter_language="en",
)

# 创建一个用于心理医生的Tavily搜索工具
psychologist_tools = TavilySearchResults(
    api_key=tavily_api_key,
    max_results=6,
    search_depth="advanced",
    exclude_domains=["wikipedia.org"],
    k=4,
    include_domains=["psychologytoday.com", "apa.org"],
    include_raw_content=True,
    filter_language="en",
)
