# Project Description

## Anti-fraud Financial Management Assistant

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
30.05.2024

---

## 1. Introduction

In China, the elderly in second-tier cities and rural areas are increasingly falling victim to financial telecommunications fraud due to their limited financial knowledge and property management capabilities. This vulnerable group faces heightened financial insecurity, compounded by the lack of adequate protective measures. In response to this pressing issue, we have developed a revolutionary financial management tool equipped with advanced AI Agent technology. This tool serves to empower the elderly by offering comprehensive anti-fraud features, helping them safeguard their finances and combat telecommunications fraud effectively, thereby providing them with much-needed financial security and peace of mind.

## 2. Background and Problem Statement

### 2.1 Elderly People at High Risk of Telecom Financial Fraud

In 2024, China's Ministry of Public Security reported that it “intercepted 3.7 billion scam calls and 2.98 billion scam-related messages to date,” highlighting the extensive prevalence of telecom fraud. The Xinhua News Agency stated in 2023 that the Chinese government has significantly intensified its efforts to combat telecommunications fraud, resulting in a 52% increase in the prosecution of suspects for such crimes in the first 10 months of 2023 compared to the previous year. Despite these efforts, Aw (2024) suggests an anticipated rise in telecom fraud cases in China, particularly impacting older individuals who are shown to be at higher risk of falling victim to fraudulent schemes, including misleading advertisements (Kircanski et al., 2018; Lee & Soberon-Ferrer, 1997).

### 2.2 Financial Management Difficulties Faced by the Elderly

Xing et al. (2020) examined the vulnerability to fraud among Chinese older adults, focusing on the impact of personality traits and loneliness, while MacLeod et al. (2017) highlighted the increasing need for resources to assist older adults in managing their financial and healthcare choices. However, money management is essential for helping older adults to age well. Among the elderly, a famous study showed that when faced with a small number of complex financial management decisions, the poorly educated elderly often have difficulty making the right decisions. (Scholnick et al., 2013) This group fits the profile of our target audience.

### 2.3 Information Security Issues

The main reason for the high prevalence of telecom fraud in China is the widespread leakage of residents' personal information on the Internet. Ng and Culver (2022) revealed that information of 1 billion people in China was leaked and stored online for over a year. This leaked information appears to be related to internet applications.

## 3. Problem Solving

### 3.1 Prevent Financial Fraud From the User End

Considering the irreversible nature of resident information leakage, preventing fraud from the resident end is pivotal. Despite the 2.6/5.0 rating on the Apple Store, the Chinese government's National Anti-Fraud Center app lacks popularity. Our financial management app will issue personalized warnings about suspicious income and expenditure records when users import their financial data using the langChain-based AI Agent. This approach aims to quickly build user trust and attract more core users, ultimately preventing financial fraud.

### 3.2 Financial Management

Transform your financial reporting with our cutting-edge products. Our Multi-Agent analysis ensures the generation of high-credibility financial reports by combining user-imported income and expenditure records. What's more, our AI Agent can provide personalized investment portfolios and real estate management suggestions based on your specific circumstances.

### 3.3 Strict Information Security

Our app prioritizes user information security. We utilize the Bcrypt algorithm to encrypt user passwords and the Spring Security 6 framework to enhance traditional security measures and prevent data leaks.

## 4. Functional Requirements

### 4.1 Transaction Information Acquisition 

The product requires analysis of the user's transaction records. Users will manually enter their individual transaction information on the client interface. The entered information will then be sent to the server through form data, written into the database, and saved in the transaction record corresponding to the user's account.

### 4.2 Get Transaction Information in Batches 

To help users upload their transaction records, they can directly upload a CSV file containing multiple transaction data on the client. Once the user uploads the file, the server will read the data and store it in the user's account transaction record in the database.

### 4.3 Transaction Information Modification 

The client is able to view the transaction records uploaded by the user, and the user can also modify these records. The user initiates an update request to modify a specific transaction record on the client, and the server can then make the necessary changes to the specified transaction information in the database.

### 4.4 Transaction Information Deletion 

If a user is not satisfied with the uploaded transaction records, they have the option to delete specific transaction records individually or in batches. The user initiates a delete request for the specified transaction record on the client, and the server will then remove the specified transaction information from the database.

### 4.5 Global Search 

To help users find specific transaction records in the client, we have added a search function based on transaction time and transaction name. Users can input the details of the transaction records they are looking for, and the server will search the database for the specified transaction records and send them back to the client.

### 4.6 Transaction Data Visualization 

Users are able to view a real-time visualization of their uploaded transaction records on the client's dashboard, which includes total income and expenditure, a line graph depicting daily consumption, and a pie chart classifying consumption types.

### 4.7 Suspicious Transaction Record Warning 

Whenever a user uploads a transaction record, our AI agent will automatically analyze the transaction information to detect any suspicious activity. The user's uploaded transaction information is sent to the server and then published to a message queue as a publisher. Subsequently, a multi-agent financial assistant constructed using Langgraph will receive and analyze these transaction records as a consumer. The results of the analysis will then be sent back to the client interface for display to the user.

### 4.8 Financial Assistant 

Users can engage in real-time conversations with the AI agent and multi-agent that we built using LangChain and LangGraph within the client's AI function interface. When a user requests financial advice or savings plans from the agent, the server will retrieve the specified transaction records from the database and transmit them to the agent. The agent will then analyze the transaction information and type before delivering it back to the client.

### 4.9 Login 

The login and registration functions are provided by default since functions other than login and registration require user identity authentication before they can be performed. The main logic of this function is implemented using spring security. Upon receiving the user's login request, the user's username and password are sent to the service layer. First, the user's username is checked in the mapper layer to verify whether it exists in the database. If it exists, the password is compared; otherwise, an exception will be thrown. Users whose usernames and passwords are both verified will have successful logins and will be allowed to access other functions.

### 4.10 Register

When users sign up with a username that is not already in the database, they need to provide their username, password, email address, and other details to send a registration request. After receiving the user's registration request, the system checks if the username already exists in the database. If the username already exists, an exception is returned. If the username does not exist, the user's details and encrypted password are stored in the database. Once registered, users will be redirected to the login interface and will be able to log in successfully.

### 4.11 Change Password 

When the user requests a password change, the system will first check the entered username and old password. If they match, the system will then delete the previous token from the redis database and allow the user to update their password. Once the new password is entered, it will be encrypted and stored in the TranscationUser table in the database. A new token will be generated and stored in the redis database.

### 4.12 User Authorization Authentication 

The admin can log in after verifying the username and password. In addition to regular login verification permissions, the admin can help users change passwords, receive users' login and registration requests, monitor users' login and registration status, and query databases.

### 4.13 Multi-account Management 

Users can create multiple accounts after successfully logging in. This feature is designed to accommodate users who have multiple stores and need to keep separate account records for each store, as well as users who need to distinguish between personal and company expenses. When a user requests to create an account, the service layer will perform a multi-table query at the mapper layer to check if the account name already exists under the userName. If the accountName does not exist, the account will be created, and information such as the accountName, userName, userID, and other details will be stored. The creation process will then be confirmed as successful. For users with multiple accounts, they can choose the account they want to import the records into and then proceed with importing or manually entering the records into the selected account. When a request is received, the system will first locate the accountName, then store the record along with the accountName and accountID in the TransactionRecord.

## 5. Non-functional Requirements

### 5.1 Security

**Password Encryption Operations** (Changhao Wang):  
For users with existing usernames in the database, the system will encrypt the passwords they send using the Bcrypt algorithm. It will then query the database using their usernames and compare the encrypted passwords.

**Token Encryption Operation** (Guocheng Song):  
When a user logs in with the correct username and password, a token is created with a specific expiration time. The token's payload, which contains the username and user ID but no private information like the password, is encrypted using HS256 to enhance security. The token's signature is encrypted using a designated key. The token is then stored in Redis for future comparison. For users without a token, only login and signup actions are allowed. Any attempts to access other functions will be blocked by the spring security interceptor.

### 5.2 Performance

**Use Cache Redis** (Wenbo Jia):  
Use Redis caching for registered users with non-expired tokens to improve performance by caching their tokens, commonly used URLs, and other information.

## 6. Database Design

### 6.1 Entity Relationship Diagram

![image](https://github.com/user-attachments/assets/35b6e149-74ff-4c1f-9a3b-cbae7b1eefb4)
- The database design revolves around the `TranscationUser`.
- There are five tables in the ERD: `TranscationUser`, `HistoryReport`, `Account`, `TranscationRecord`, and `TranscationCategory`.

## 7. Mockups
![image](https://github.com/user-attachments/assets/19ae8461-132b-4b5d-8ab0-25046423180e)

### 7.1 Display User Login/Registration Interface Design
![image](https://github.com/user-attachments/assets/029c5c1a-c864-45d0-afd2-3e67c167ce1f)

![image](https://github.com/user-attachments/assets/12d9d197-da14-4a89-b9ff-7e9fbd1655c8)

### 7.2 Display User Information Interface
![image](https://github.com/user-attachments/assets/75371133-3de7-4651-9d52-d95f97847c30)

### 7.3 Display the User's Account Interface
![image](https://github.com/user-attachments/assets/ee47dce1-f1fa-4a40-bad8-079d45df8663)

### 7.4 Main Function Interface of The Software

- Visual display of consumption information of user-specified accounts and AI-based early warning of transactions.
![image](https://github.com/user-attachments/assets/81dd4f7c-ae84-40db-a2b7-f069994a9c4f) 
- Users' transaction information and the ability to upload transaction records.
![4071724917072_ pic](https://github.com/user-attachments/assets/c7fe2dfd-85bb-4a19-99a6-7e231badaaa8)
- Real-time chat interface between users and AI financial management assistant.
![4081724917096_ pic](https://github.com/user-attachments/assets/83ffea9b-0e74-49b5-8d2d-00617d611adb)
