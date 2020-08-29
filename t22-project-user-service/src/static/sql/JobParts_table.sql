create database if not exists csci5409;
USE csci5409;

CREATE TABLE JobParts (
partId int NOT NULL,
jobName varchar (255) NOT NULL,
userId BIGINT NOT NULL,
qty int NOT NULL,
createdDatetime DATETIME NOT NULL,
result BOOLEAN NOT NULL,
PRIMARY KEY (partId, jobName, userId)
);