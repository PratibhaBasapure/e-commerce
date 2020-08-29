create database if not exists csci5409;
USE csci5409;

CREATE TABLE user (
                      user_id BIGINT NOT NULL AUTO_INCREMENT,
                      name varchar (255) NOT NULL,
                      email varchar (255) NOT NULL UNIQUE,
                      password varchar (255) NOT NULL,
                      securityQ varchar (255) NOT NULL,
                      securityA varchar (255) NOT NULL,
                      userState boolean,
                      PRIMARY KEY (user_id)
);

CREATE INDEX email_index ON user (email);


INSERT INTO user values (1, 'admin', 'admin' , 'cloud@dal.ca', 'password');


CREATE TABLE job_search_history (
jobName VARCHAR(45),
searchedAt TIMESTAMP

);
