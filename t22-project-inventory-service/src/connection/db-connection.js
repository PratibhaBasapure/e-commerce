const mysql = require('mysql')
const dotenv = require('dotenv')
dotenv.config();


var mysqlConnection = mysql.createConnection({
    host: process.env.host || 'localhost',
    user: process.env.user || 'root',
    password: process.env.password || 'password',
    database: process.env.database || 'InventoryDb3',
    multipleStatements: true
});

mysqlConnection.connect(function (err) {
    if (err) {
        console.log('Application cannot connect to MySQL database');
        throw err;
    }
    else {
        console.log(`Application is successfully connected to the database`);
    }
});
module.exports=mysqlConnection

