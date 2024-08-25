# flake8: noqa
import operator
import functools
import os
import json
import agent_helper
from typing import Annotated, Sequence, TypedDict, Literal
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage, ToolMessage
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langgraph.prebuilt import ToolNode
from langgraph.graph import END, StateGraph, START



# This defines the object that is passed between each node
# in the graph. We will create different nodes for each agent and tool
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    sender: str



# Helper function to create a node for a given agent
def agent_node(state, agent, name):
    result = agent.invoke(state)
    messages_to_add = []
    # We convert the agent output into a format that is suitable to append to the global state
    if isinstance(result, ToolMessage) and result.additional_kwargs.get("tool_calls"):
        # 处理工具调用
        for tool_call in result.additional_kwargs["tool_calls"]:
            tool_name = tool_call["function"]["name"]
            tool_args = json.loads(tool_call["function"]["arguments"])
            # 执行工具调用
            tool_result = tool_node.invoke({"name": tool_name, "arguments": tool_args})
            # 创建工具响应消息
            tool_message = ToolMessage(
                tool_call_id=tool_call["id"],
                content=str(tool_result),  # 将工具结果转换为字符串
                name=tool_name
            )
            messages_to_add.append(tool_message)
        
        # 再次调用代理处理工具响应
        follow_up = agent.invoke({**state, "messages": state["messages"] + messages_to_add})
        messages_to_add.append(follow_up)

    else:
        messages_to_add = [result]

    return {
        "messages": messages_to_add,
        "sender": name,
    }
load_dotenv(dotenv_path='.env')
openai_api_key = os.environ["OPENAI_API_KEY"]

llm = ChatOpenAI(model="gpt-4-1106-preview", api_key=openai_api_key)

#创建Node
# Node01.gp_agent
gp_agent = agent_helper.create_agent(
    llm,
    [agent_helper.gp_tools],
    system_message="you are a GP, summerize the patient's condition to the internal_specialist.",
)
gp_node = functools.partial(agent_node, agent=gp_agent, name="GP")

# Node02.internal_specialist_agent
internal_specialist_agent = agent_helper.create_agent(
    llm,
    [agent_helper.internal_specialist_tools],
    system_message="you are a internal specialist, once you receive the condition report from the GP, you should provide a detailed diagnosis and treatment plan start with words 'FINAL ANSWER'.",
)
internal_specialist_node = functools.partial(agent_node, agent=internal_specialist_agent, name="internal_specialist")

# Node03.psychologist_agent
psychologist_agent = agent_helper.create_agent(
    llm,
    [agent_helper.psychologist_tools],
    system_message="you are a psychologist, you should only provide professional emotional support.",
)
psychologist_node = functools.partial(agent_node, agent=psychologist_agent, name="psychologist")

# Node04.tool_node
tools = [agent_helper.internal_specialist_tools, agent_helper.gp_tools, agent_helper.psychologist_tools]
tool_node = ToolNode(tools)


# 边的逻辑（重要），node在什么情况下调用工具，什么情况下结束，什么情况下继续
sentitive_words = ["dead", "suicide"]
emotional_words = ["sad", "depressed", "anxious", "stress", "unhappy"]
def router(state) -> Literal["call_tool", "__end__", "continue", "emotional_support"]:
    # This is the router
    messages = state["messages"]
    last_message = messages[-1]
    
    if any(word in last_message.content.lower() for word in emotional_words):
        return "emotional_support"
    
    if last_message.tool_calls:
        # The previous agent is invoking a tool
        return "continue"
    
    if "FINAL ANSWER" in last_message.content:
        # Any agent decided the work is done
        return "__end__"
    
    if any(word in last_message.content.lower() for word in sentitive_words):
        return "__end__"

    return "continue"

# Graph生成！！！
workflow = StateGraph(AgentState)
workflow.add_node("GP", gp_node)
workflow.add_node("internal_specialist", internal_specialist_node)
workflow.add_node("psychologist", psychologist_node)

workflow.add_conditional_edges(
    "GP",
    router,
    {
        "continue": "internal_specialist",
        "__end__": END,
        "emotional_support": "psychologist"
    },)

workflow.add_conditional_edges(
    "internal_specialist",
    router,
    {
        "continue": END,
        "__end__": END,
    },
)

workflow.add_conditional_edges(
    "psychologist",
    router,
    {
        "continue": END,
        "__end__": END,
    },
)


workflow.add_edge(START, "GP")
graph = workflow.compile()

event = graph.stream(
    {"messages": [HumanMessage(content="发烧，")]},
    {"recursion_limit": 5}
)
print(">>>>>>>>>>multi-agent workflow running<<<<<<<<<<")
for chunk in event:
    print(chunk)
    print("-------------------------------------------------")
