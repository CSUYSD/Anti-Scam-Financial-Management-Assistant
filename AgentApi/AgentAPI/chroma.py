import chromadb
from chromadb.config import Settings


client  = chromadb.HttpClient(
    host="localhost",
    port=8000
)

collection = client.get_or_create_collection("test")
print(client.list_collections())