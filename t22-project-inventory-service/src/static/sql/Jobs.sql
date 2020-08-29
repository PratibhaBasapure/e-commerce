create database if not exists InventoryDb;
USE InventoryDb;
CREATE TABLE `items` (
  `itemId` int NOT NULL AUTO_INCREMENT,
  `itemName` varchar(255) NOT NULL,
  `price` int DEFAULT NULL,
  `qty` int DEFAULT NULL,
  PRIMARY KEY (`itemId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

