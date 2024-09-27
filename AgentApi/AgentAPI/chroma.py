import chromadb
from chromadb.config import Settings

# 连接到Docker中运行的ChromaDB
# 假设ChromaDB在Docker中暴露的端口是8000
client = chromadb.HttpClient(host="localhost", port=8000)

# 创建一个新的collection
collection = client.create_collection("my_collection")
client.get
