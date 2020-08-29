const mysql = require('mysql')
const dotenv = require('dotenv')
dotenv.config()

var mysqlConnection = mysql.createConnection({
    host: process.env.host || 'localhost',
    user: process.env.user || 'root',
    password: process.env.password || 'root',
    database: process.env.database || 'local_program',
    // host: 'localhost',
    // user: 'root',
    // password: 'root',
    // database: 'local_program',
    multipleStatements: true
});

mysqlConnection.connect(function (err) {
    if (err) {
        console.log('Order service cannot connect to MySQL database');
        throw err;
    }
    else {
        console.log(`Order service is successfully connected to the database` + process.env.database );
    }
});
module.exports = mysqlConnection
