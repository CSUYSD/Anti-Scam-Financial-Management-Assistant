-- 先删除 user_roles 表（如果存在）
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS transaction_users;

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
    full_name VARCHAR(255),
    role_id INTEGER,
    CONSTRAINT fk_role
        FOREIGN KEY (role_id)
        REFERENCES user_roles(role_id)
);

INSERT INTO transaction_users (username, password, email, phone, dob, full_name, role_id) VALUES
('johndoe', 'password123', 'johndoe@example.com', '1234567890', '1990-01-15', 'John Doe', 1),
('janedoe', 'securepassword', 'janedoe@example.com', '0987654321', '1992-02-25', 'Jane Doe', 2),
('alice', 'alicepassword', 'alice@example.com', '1112223333', '1988-03-10', 'Alice Johnson', 2),
('bobsmith', 'bobbypass', 'bobsmith@example.com', '4445556666', '1985-04-05', 'Bob Smith', 2),
('charlie', 'charliepass', 'charlie@example.com', '7778889999', '1995-05-20', 'Charlie Brown', 2);
