-- 先删除 user_roles 表（如果存在）
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS transaction_users;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS transaction_records;
-- 创建 user_roles 表
CREATE TABLE user_roles (
    role_id INTEGER PRIMARY KEY,
    role VARCHAR(50) NOT NULL
);

INSERT INTO user_roles (role_id, role) VALUES
(1, 'ROLE_ADMIN'),
(2, 'ROLE_USER');

-- 然后创建 transaction_users 表
DROP TABLE IF EXISTS transaction_users;
CREATE TABLE transaction_users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    dob DATE,
    role_id INTEGER,
    avatar VARCHAR(255),
    CONSTRAINT fk_role
        FOREIGN KEY (role_id)
        REFERENCES user_roles(role_id)
);


    

INSERT INTO transaction_users (username, password, email, phone, dob, role_id, avatar) VALUES
('johndoe', 'password123', 'johndoe@example.com', '1234567890', '1990-01-15', 1, null),
('janedoe', 'securepassword', 'janedoe@example.com', '0987654321', '1992-02-25', 2, null),
('alice', 'alicepassword', 'alice@example.com', '1112223333', '1988-03-10', 2, null),
('bobsmith', 'bobbypass', 'bobsmith@example.com', '4445556666', '1985-04-05', 2, null),
('charlie', 'charliepass', 'charlie@example.com', '7778889999', '1995-05-20', 2, null);


-- @Entity
-- @Data
-- public class Account {
--     @Id
--     @GeneratedValue(strategy = GenerationType.IDENTITY)
--     private Long id;
--     private String accountName;
--     private double balance;
--     @ManyToOne
--     @JoinColumn(name = "transaction_user_id")
--     private TransactionUser transactionUser;
    
--     @OneToMany(mappedBy = "account", cascade = CascadeType.ALL)
--     private List<TransactionRecord> transactionRecords;
-- }
CREATE TABLE accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_name VARCHAR(255) NOT NULL,
    balance DECIMAL(10, 2) NOT NULL,
    transaction_user_id BIGINT,
    FOREIGN KEY (transaction_user_id) REFERENCES transaction_users(id)
);

-- @Entity
-- @Data
-- public class TransactionRecord {
--     @Id
--     @GeneratedValue(strategy = GenerationType.IDENTITY)
--     private long id;
--     @Enumerated(EnumType.STRING)
--     private IncomeExpense incomeOrExpense;  // 收/支
--     private String transactionType;    //交易类型
--     private double amount;           // 金额（元）
--     private String TransactionMethod;    // 支付方式
--     private ZonedDateTime transactionTime; // 交易时间
--     private String transactionDescription; // 交易描述
--     @ManyToOne
--     @JoinColumn(name = "account_id")
--     private Account account; // 一个账户对应多个交易记录
-- }

CREATE TABLE transaction_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    income_or_expense VARCHAR(20) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_method VARCHAR(20),
    transaction_time TIMESTAMP NOT NULL,
    transaction_description VARCHAR(255),
    account_id BIGINT,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);
