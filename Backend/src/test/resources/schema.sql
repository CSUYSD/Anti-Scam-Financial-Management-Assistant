-- 首先删除所有外键约束
ALTER TABLE IF EXISTS transaction_users DROP CONSTRAINT IF EXISTS FK4OQGWFPQ67BNMXJSTR51SRGG5;
ALTER TABLE IF EXISTS account DROP CONSTRAINT IF EXISTS fk_account_transaction_users;
ALTER TABLE IF EXISTS transaction_record DROP CONSTRAINT IF EXISTS fk_transaction_record_account;

-- 然后删除表
DROP TABLE IF EXISTS transaction_record;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS transaction_users;
DROP TABLE IF EXISTS user_roles;

-- 创建 user_roles 表
CREATE TABLE user_roles (
                            role_id INTEGER PRIMARY KEY,
                            role VARCHAR(50) NOT NULL UNIQUE
);

-- 插入角色数据
INSERT INTO user_roles (role_id, role) VALUES
                                           (1, 'ROLE_ADMIN'),
                                           (2, 'ROLE_USER');

-- 创建 transaction_users 表
CREATE TABLE transaction_users (
                                   id INT AUTO_INCREMENT PRIMARY KEY,
                                   username VARCHAR(255) NOT NULL,
                                   password VARCHAR(255) NOT NULL,
                                   email VARCHAR(255) NOT NULL,
                                   phone VARCHAR(20),
                                   dob DATE,
                                   full_name VARCHAR(255),
                                   role_id INTEGER,
                                   CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES user_roles(role_id)
);

-- 插入用户数据
INSERT INTO transaction_users (username, password, email, phone, dob, full_name, role_id) VALUES
                                                                                              ('johndoe', 'password123', 'johndoe@example.com', '1234567890', '1990-01-15', 'John Doe', 1),
                                                                                              ('janedoe', 'securepassword', 'janedoe@example.com', '0987654321', '1992-02-25', 'Jane Doe', 2),
                                                                                              ('alice', 'alicepassword', 'alice@example.com', '1112223333', '1988-03-10', 'Alice Johnson', 2),
                                                                                              ('bobsmith', 'bobbypass', 'bobsmith@example.com', '4445556666', '1985-04-05', 'Bob Smith', 2),
                                                                                              ('charlie', 'charliepass', 'charlie@example.com', '7778889999', '1995-05-20', 'Charlie Brown', 2);
