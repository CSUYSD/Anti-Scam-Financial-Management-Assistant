-- 清理现有表
DROP TABLE IF EXISTS financial_report;
DROP TABLE IF EXISTS transaction_record;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS transaction_users;
DROP TABLE IF EXISTS user_roles;

-- 创建 user_roles 表
CREATE TABLE user_roles (
                            role_id INTEGER PRIMARY KEY,
                            role VARCHAR(50) NOT NULL
);

-- 插入基础角色
INSERT INTO user_roles (role_id, role) VALUES
                                           (1, 'ROLE_ADMIN'),
                                           (2, 'ROLE_USER');

-- 创建用户表
CREATE TABLE transaction_users (
                                   id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                   username VARCHAR(255) NOT NULL,
                                   password VARCHAR(255) NOT NULL,
                                   email VARCHAR(255) NOT NULL,
                                   phone VARCHAR(20),
                                   dob DATE,
                                   role_id INTEGER,
                                   avatar VARCHAR(255),
                                   FOREIGN KEY (role_id) REFERENCES user_roles(role_id)
);

-- 创建账户表
CREATE TABLE account (
                         id BIGINT PRIMARY KEY AUTO_INCREMENT,
                         account_name VARCHAR(255) NOT NULL,
                         total_income DECIMAL(10, 2) DEFAULT 0.00,
                         total_expense DECIMAL(10, 2) DEFAULT 0.00,
                         transaction_user_id BIGINT,
                         FOREIGN KEY (transaction_user_id) REFERENCES transaction_users(id) ON DELETE CASCADE
);

-- 创建交易记录表
CREATE TABLE transaction_record (
                                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                    type VARCHAR(50) NOT NULL,
                                    category VARCHAR(255) NOT NULL,
                                    amount DECIMAL(10, 2) NOT NULL,
                                    transaction_method VARCHAR(255),
                                    transaction_time TIMESTAMP NOT NULL,
                                    transaction_description VARCHAR(255),
                                    account_id BIGINT,
                                    user_id BIGINT,
                                    FOREIGN KEY (user_id) REFERENCES transaction_users(id) ON DELETE CASCADE,
                                    FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE
);

-- 创建财务报告表
CREATE TABLE financial_report (
                                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                  user_id BIGINT,
                                  content CLOB,
                                  FOREIGN KEY (user_id) REFERENCES transaction_users(id) ON DELETE CASCADE
);

-- 插入测试用户
INSERT INTO transaction_users (id, username, password, email, role_id)
VALUES
    (1, 'testuser1', 'password123', 'test1@example.com', 2),
    (2, 'testuser2', 'password456', 'test2@example.com', 2);

-- 插入测试账户
INSERT INTO account (id, account_name, total_income, total_expense, transaction_user_id)
VALUES
    (1, 'Test Account 1', 1000.00, 500.00, 1),
    (2, 'Test Account 2', 2000.00, 1000.00, 1),
    (3, 'Test Account 3', 3000.00, 1500.00, 2);

-- 插入测试交易记录
INSERT INTO transaction_record (id, type, category, amount, transaction_method, transaction_time, transaction_description, account_id, user_id)
VALUES
    (1, 'INCOME', 'Salary', 1000.00, 'Bank Transfer', '2024-01-01 10:00:00', 'Monthly salary', 1, 1),
    (2, 'EXPENSE', 'Food', 50.00, 'Cash', '2024-01-02 12:00:00', 'Lunch', 1, 1),
    (3, 'INCOME', 'Investment', 500.00, 'Bank Transfer', '2024-01-03 15:00:00', 'Stock dividend', 2, 1),
    (4, 'EXPENSE', 'Shopping', 200.00, 'Credit Card', '2024-01-04 14:00:00', 'Groceries', 2, 1);