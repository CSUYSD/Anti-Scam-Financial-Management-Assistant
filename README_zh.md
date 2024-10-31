# Fin_care
Fin_care是一个允许用户通过多个AI驱动功能来管理其财务数据和洞察的Web应用程序。

# English README
[README.md](README.md)

## 技术栈

### 前端
![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white&style=flat)
![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white&style=flat)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white&style=flat)

### 后端
![Spring Boot](https://img.shields.io/badge/-Spring%20Boot-6DB33F?logo=spring-boot&logoColor=white&style=flat)

### 消息队列
![RabbitMQ](https://img.shields.io/badge/-RabbitMQ-FF6600?logo=rabbitmq&logoColor=white&style=flat)

### 通信协议
![WebSocket](https://img.shields.io/badge/-WebSocket-4A90E2?logo=websocket&logoColor=white&style=flat)
![RESTful API](https://img.shields.io/badge/-RESTful-000000?logo=api&logoColor=white&style=flat)

### 外部API
![OpenAI API](https://img.shields.io/badge/-OpenAI-412991?logo=openai&logoColor=white&style=flat)
![AlphaVantage API](https://img.shields.io/badge/-AlphaVantage-3498DB?style=flat)
![Google Maps API](https://img.shields.io/badge/-Google%20Maps-4285F4?logo=google-maps&logoColor=white&style=flat)
![Wise Flow API](https://img.shields.io/badge/-Wise%20Flow-4A90E2?style=flat)
![AWS (S3, Lambda)](https://img.shields.io/badge/-AWS%20S3/Lambda-FF9900?logo=amazon-aws&logoColor=white&style=flat)

### 数据库
![ChromaDB](https://img.shields.io/badge/-ChromaDB-4A90E2?style=flat)
![H2 (Embedded)](https://img.shields.io/badge/-H2%20Database-4479A1?style=flat)
![Elasticsearch](https://img.shields.io/badge/-Elasticsearch-005571?logo=elasticsearch&logoColor=white&style=flat)
![Redis](https://img.shields.io/badge/-Redis-DC382D?logo=redis&logoColor=white&style=flat)
![PocketBase](https://img.shields.io/badge/-PocketBase-4A90E2?style=flat)

## 架构
RESTful API和事件驱动架构

## 开始使用！(目前支持MacOS和Linux)
### 1. 克隆仓库
```bash
git clone https://github.com/CSUYSD/Anti-Scam-Financial-Management-Assistant.git
```

### 2. 安装依赖并启动服务
```bash
cd Anti-Scam-Financial-Management-Assistant/Backend
./setup.sh
cd ../Frontend
npm install
```

### 3. 配置环境变量
3.1 API密钥
在IDEA运行配置中按以下格式添加你的API密钥
OPENAI_API_KEY="你的openai api密钥"
ALPHA_VANTAGE_API_KEY="你的alpha vantage api密钥"
![IntelliJ IDEA环境配置](image.png)

### 4. 文件持久化(可选)
如果你想启用AWS S3进行文件持久化，请按以下步骤操作：
1. 配置你的AWS凭证
2. 创建存储桶
3. 在`Backend/src/main/resources/application.properties`中替换为你自己的存储桶名称和区域(参考下图)
![替换文本](image-1.png)

### 5. AI网络爬虫(可选)

![替换文本](image-2.png)
运行以下命令克隆wiseflow仓库：
```bash
git clone https://github.com/TeamWiseFlow/wiseflow.git
cd wiseflow
cp .env.example .env
nvim .env
```
然后你将看到下图，用你自己的wise flow api密钥替换文本
注意：如果你发现你的.env文件中有任何图片中没有的变量，请删除它。
![wise flow .env文件](image-3.png)
到这一步，你还没有pocketbase数据库账号，所以你需要创建一个，运行
```bash
docker compose up
```
注意：首次运行容器会遇到预期的错误，因为你还没有为pb仓库创建管理员账号。
请保持容器运行，在浏览器中打开http://127.0.0.1:8090/_/，并根据提示创建管理员账号(必须使用邮箱)，然后将管理员邮箱和密码填入.env文件，并重启容器。
![创建管理员账号](image-4.png)

### 6. 启动应用
```bash
cd ../Backend
./start.sh
cd ../Frontend
npm start
```

## 功能特性
### AI驱动功能
### **多功能代理集群**

一个由三个多功能代理组成的集群—**RecordRetriever**、**StockAnalyzer**和**WeatherAnalyzer**—与聊天机器人集成，使用**三级决策树**根据用户提示自主选择功能。以下是决策流程概述：

- **第一级：代理选择**  
  聊天机器人最初根据用户查询类型选择相关代理。每个代理（如StockAnalyzer、RecordRetriever）根据其定义的能力被选择。

- **第二级：代理内功能选择**  
  选定的代理然后根据用户的提示识别具体功能。例如，如果激活了StockAnalyzer，它将确定请求是否与股票数据、公司详情或历史趋势相关。

- **第三级：响应验证和优化**  
  代理生成的响应经过验证以确保符合用户查询。如有必要，进一步应用优化来完善输出。

### **反诈交易代理**

**反诈交易代理**是一个设计用于检测上传交易中可疑活动的实时监控工具。它利用**RabbitMQ**进行消息队列、**WebSocket**进行实时警报和**Spring AI**进行行为分析，提供高效的实时处理。

- **实现逻辑**  
  该代理通过**事件驱动**方式运作。当客户端通过**POST请求**提交交易时，系统异步通过**RabbitMQ**将交易数据发送给分析代理。代理审查最近10天的交易历史作为上下文，使用**Spring AI**中预配置的行为模型评估当前交易。

- **可疑活动检测**  
  如果识别出可疑行为，代理会生成**警告消息**（前缀为"WARNING"）并通过**WebSocket**即时发送到前端。前端然后决定如何管理这些警告，确保灵活处理。

### **具有RAG和上下文记忆的聊天机器人**

这个**聊天机器人组件**将**Spring AI**与**Chroma向量数据库**集成，提供先进的对话体验，通过**检索增强生成(RAG)**和上下文记忆得到增强。

- **文件向量化和存储**  
  上传的文件自动向量化并存储在**向量数据库**中，实现对话过程中的高效检索和知识增强。

- **RAG增强响应**  
  当在客户端请求中启用RAG时，聊天机器人利用向量化内容生成丰富的、基于知识的响应。

- **上下文记忆管理**  
  系统采用**ChatMemory**和**MessageChatMemoryAdvisor**来维护上下文，为每个聊天会话使用唯一的**conversationIds**。这确保了不同会话线程的隔离上下文和聊天记忆。

### **高度自定义的个人财务报告**

此功能包括一个独立的界面，从用户的数据库记录中检索最新的**20条交易**。通过**高度自定义的提示管理器**，这些交易被转换为**LLM**（大型语言模型）的详细提示。然后LLM参考存储在**向量数据库**中的文档作为上下文，为用户生成个性化的近期**财务状况报告**。

### **AI驱动的网络爬虫**

该模块允许用户使用**Wiseflow引擎**自定义和检索特定的网络内容。它提供**投资主题**和**文章**的完整管理、显示和同步。

- **功能特性**  
  用户可以添加、编辑或删除主题和文章。每个主题包括**名称**和**描述**，而每篇文章存储**标题**、**URL**、**摘要**和**内容**。数据通过**数据库接口**获取并在页面初始化时显示。

- **软删除和实时同步**  
  主题可以通过将其状态标记为false来软删除，便于恢复。该模块支持**实时同步和搜索**，订阅数据变更并自动刷新页面以显示最新的主题和文章。还支持关键词过滤，使用户能够快速找到特定内容。

### 其他功能
1. 股票价格
- 由AlphaVantage API驱动的实时股票价格
2. 聊天历史
- 支持用户查看他们的聊天历史
3. 文件持久化
- 支持用户将其财务数据和文件上传到AWS S3

### 性能
- 使用Redis缓存频繁访问的数据
- 使用异步处理提升性能

### 可扩展性
- 低耦合和高复用性代码

### 安全性
- AWS S3中存储的私人文件（如银行对账单）受ACL保护
- 使用Spring Security 6（集成JWT）进行用户认证和授权

### 用户体验
- 使用Tailwind CSS实现响应式设计
- 使用WebSocket和RabbitMQ的事件驱动架构实现流畅的用户体验
- 直观的UI/UX
- 用于基于位置服务的Google地图API
- 由AlphaVantage API驱动的实时股票价格

### 基础CRUD
- 用户管理
- 交易管理
- 文件管理
- 聊天历史管理

### 未来工作
- 实现移动应用程序
- 在TiDB上实现分布式存储系统
- 聊天机器人记忆管理
