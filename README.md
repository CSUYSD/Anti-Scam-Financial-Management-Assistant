# Fin_care
Fin_care is a web application that allows users to manage their financial data and insights by multiple AI driven functionalities.
# 中文README
[README_zh.md](README_zh.md)

## Tech Stack
### Frontend
- React
- Node.js
- Tailwind CSS
### Backend
- Spring Boot

### Message Queue
- RabbitMQ

### Communication Protocol
- Websocket
- RESTful

### External API
- OpenAI API
- AlphaVantage API
- Google Maps API
- Wise Flow API
- AWS(S3, Lambda)

### Database
- ChromaDB
- H2(embedded)
- Elasticsearch
- Redis
- PocketBase

## Architecture
RESTful API and event-driven architecture

## Features
### AI-driven functionalities
1. Financial status and insights generation
-support user to upload their financial data to vector database(e.g. salary slip, bank statement)
-generate user's current financial status and predict future based on historical data driven by pre-trained LLM

2. RAG-based AI-driven chatbot
-Chat with memory
-Chat with RAG-based query on financial data and uploaded files

3. Scam-warning generation
-Auto generate scam-warning based on user's transaction data driven by LLM

4. AI Web Crawler
- Implement a web crawler to crawl financial news integrated with Wise Flow API and AI API

### Other functionalities
1. Stock Price
- Real-time Stock Price driven by AlphaVantage API
2. Chat History
- Support user to view their chat history
3. File Persistence
- Support user to upload their financial data and files to the AWS S3

### Performance
- Use Redis to cache frequently accessed data
- Use async processing to improve performance

### Scalability
- Low coupling and high reusability code.

### Security
- Private files(e.g. bank statement) stored in AWS S3 are protected by ACL
- User authentication and authorization by using Spring Security 6(integrated with JWT)


### User Experience
- Responsive design by using Tailwind CSS
- event-driven architecture for smooth user experience by using WebSocket and RabbitMQ
- Intuitive UI/UX
- Google map API for location-based service
- Real-time Stock Price driven by AlphaVantage API

### Basic CRUD
- User management
- Transaction management
- File management
- Chat history management

### Future Work
- Implement a mobile application
- Implement a distributed storage system on TiDB
- Chatbot memory management

## Let's Get Started! (Currently support MacOS and linux)
### 1. Clone the repository
```bash
git clone https://github.com/CSUYSD/Anti-Scam-Financial-Management-Assistant.git
```

### 2. Install dependencies and start services
```bash
cd Anti-Scam-Financial-Management-Assistant/Backend
./setup.sh
cd ../Frontend
npm install
```

### 3. Configure environment variables
3.1 API keys
Put your api key in the following format in IDEA run configuration
OPENAI_API_KEY="your openai api key"
ALPHA_VANTAGE_API_KEY="your alpha vantage api key"
![IntelliJ IDEA environment configuration](image.png)

### 4. File Persistence(optional)
if you want enable AWS S3 for file persistence, follow these steps:
1. Configure your own aws credentials
2. create a bucket
3. replace the text in `Backend/src/main/resources/application.properties` with your own bucket name and region(see the following picture)
![replace the text](image-1.png)

### 5. Ai web crawler(optional)

![replace the text](image-2.png)
run the following command to clone the wiseflow repository
```bash
git clone https://github.com/TeamWiseFlow/wiseflow.git
cd wiseflow
cp .env.example .env
nvim .env
```
then you will see the following picture, replace the text with your own wise flow api key
notice: If you find your .env file has any variable that not present in the picture, delete it.
![wise flow .env file](image-3.png)
till this step, you don't have pocketbase db account yet, so you need to create one, run
```bash
docker compose up
```
notice: first time running the container will encounter an expected error, because you haven't created an admin account for the pb repository yet.
please keep the container running, open http://127.0.0.1:8090/_/ in your browser, and create an admin account according to the prompt(you must use email), then fill the admin email and password into the .env file, and restart the container.
![create admin account](image-4.png)


### 6. Start the application
```bash
cd ../Backend
./start.sh
cd ../Frontend
npm start
```








