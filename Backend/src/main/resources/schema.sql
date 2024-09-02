DROP TAble if exists transaction_users ;
CREATE TABLE transaction_users (
                                   id SERIAL PRIMARY KEY,
                                   username VARCHAR(255) NOT NULL,
                                   password VARCHAR(255) NOT NULL,
                                   email VARCHAR(255) NOT NULL,
                                   phone VARCHAR(20),
                                   dob DATE,
                                   full_name VARCHAR(255)
);

INSERT INTO  transaction_users (username, password, email, phone, dob, full_name) VALUES
 ('johndoe', 'password123', 'johndoe@example.com', '1234567890', '1990-01-15', 'John Doe'),
 ('janedoe', 'securepassword', 'janedoe@example.com', '0987654321', '1992-02-25', 'Jane Doe'),
 ('alice', 'alicepassword', 'alice@example.com', '1112223333', '1988-03-10', 'Alice Johnson'),
 ('bobsmith', 'bobbypass', 'bobsmith@example.com', '4445556666', '1985-04-05', 'Bob Smith'),
 ('charlie', 'charliepass', 'charlie@example.com', '7778889999', '1995-05-20', 'Charlie Brown');

CREATE TABLE user_roles (
                            id SERIAL PRIMARY KEY,
                            role_id INTEGER NOT NULL,
                            role VARCHAR(50) NOT NULL UNIQUE
);


