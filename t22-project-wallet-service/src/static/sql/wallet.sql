create Table wallet  (
  walletId int AUTO_INCREMENT,
  userId int UNIQUE,
  email varchar(200) UNIQUE NOT NUll,
  name varchar(200) NOT NUll,
  amount float(10,2) NOT NULL DEFAULT 00.00,
  PRIMARY KEY (walletId, userId)
);