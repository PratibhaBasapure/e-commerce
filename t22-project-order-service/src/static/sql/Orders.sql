create table Orders (
    orderID int PRIMARY KEY AUTO_INCREMENT, 
    date DATETIME not null, 
    userID int not null, 
    amount long not null, 
    status varchar(200) NOT NULL DEFAULT 'PROCESSING'
    );
create table Order_Item(
    orderID int NOT NULL, 
    itemID int, 
    qty long, 
    name VARCHAR(200),
    FOREIGN KEY (orderID) REFERENCES Orders(orderID)
);

create table order_transaction(
    orderID int NOT NULL, 
    transactionId VARCHAR(200),
    FOREIGN KEY (orderID) REFERENCES Orders(orderID)
);
