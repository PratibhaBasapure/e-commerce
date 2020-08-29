const mysql = require('mysql')
const dotenv = require('dotenv')
dotenv.config()

var mysqlConnection = mysql.createConnection({
    host: process.env.host || 'localhost',
    user: process.env.user || 'root',
    password: process.env.password || 'password',
    database: process.env.database || 'csci5409',
    multipleStatements: true
});

mysqlConnection.connect(function (err) {
    if (err) {
        console.log('Customer Portal cannot connect to MySQL database');
        throw err;
    }
    else {
        console.log(`Customer Portal is successfully connected to the database`);
    }
});
module.exports = mysqlConnection
