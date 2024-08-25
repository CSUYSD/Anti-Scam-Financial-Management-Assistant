# flake8: noqa
import operator
import functools
import os
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
    # We convert the agent output into a format that is suitable to append to the global state
    if isinstance(result, ToolMessage):
        pass
    else:
        result = AIMessage(**result.dict(exclude={"type", "name"}), name=name)
    return {
        "messages": [result],
        # Since we have a strict workflow, we can
        # track the sender so we know who to pass to next.
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
