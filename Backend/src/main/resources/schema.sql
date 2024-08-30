DROP TAble if exists transaction_users ;
DROP TAble if exists account ;
CREATE TABLE transaction_users (
                                   id SERIAL PRIMARY KEY,
                                   username VARCHAR(255) NOT NULL,
                                   password VARCHAR(255) NOT NULL,
                                   email VARCHAR(255) NOT NULL,
                                   phone VARCHAR(20),
                                   dob DATE,
                                   full_name VARCHAR(255)
);

CREATE TABLE account (
                         id SERIAL PRIMARY KEY,
                         username VARCHAR(255) NOT NULL,
                         account_name VARCHAR(255),
                         transaction_users_id INTEGER,
                         FOREIGN KEY (transaction_users_id) REFERENCES transaction_users(id)
);

INSERT INTO  transaction_users (username, password, email, phone, dob, full_name) VALUES
                                                                                      ('johndoe', 'password123', 'johndoe@example.com', '1234567890', '1990-01-15', 'John Doe'),
                                                                                      ('janedoe', 'securepassword', 'janedoe@example.com', '0987654321', '1992-02-25', 'Jane Doe'),
                                                                                      ('alice', 'alicepassword', 'alice@example.com', '1112223333', '1988-03-10', 'Alice Johnson'),
                                                                                      ('bobsmith', 'bobbypass', 'bobsmith@example.com', '4445556666', '1985-04-05', 'Bob Smith'),
                                                                                      ('charlie', 'charliepass', 'charlie@example.com', '7778889999', '1995-05-20', 'Charlie Brown');


INSERT INTO account (username, account_name, transaction_users_id) VALUES
                                                                       ('johndoe', 'Account 1', 1),
                                                                       ('janedoe', 'Account 2', 2),
                                                                       ('alice', 'Account 3', 3),
                                                                       ('alice', 'Account 4', 3),
                                                                       ('alice', 'Account 5', 3);

DROP TABLE IF EXISTS transaction_record;
CREATE TABLE transaction_record (
                                    id SERIAL PRIMARY KEY,
                                    income_or_expense INTEGER NOT NULL,
                                    transaction_type VARCHAR(255) NOT NULL,
                                    amount DOUBLE PRECISION NOT NULL,
                                    transaction_method VARCHAR(255),
                                    transaction_time TIMESTAMP,
                                    transaction_description TEXT,
                                    account_id INTEGER,
                                    FOREIGN KEY (account_id) REFERENCES account(id)
);


INSERT INTO transaction_record (income_or_expense, transaction_type, amount, transaction_method, transaction_time, transaction_description, account_id)
VALUES
    ('0', '工资', 1000.00, '银行转账', '2023-08-01 09:00:00', '月工资收入', 1),
    ('1', '购物', 200.00, '信用卡', '2023-08-02 14:30:00', '超市购物', 1);