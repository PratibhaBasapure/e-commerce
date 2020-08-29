const express = require('express')
const routes = require('./src/route/route.js')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser');
dotenv.config()

const app = express()
const SERVER_PORT = 8080;

app.listen(SERVER_PORT, () => {
    console.log(`Everything looks good. The customer portal has started on port ${SERVER_PORT}`)
})

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type: application/json
app.use(bodyParser.json());

app.use(express.static('public'));

app.use(cookieParser());

routes(app)

app.set('view engine', 'ejs');
module.exports = { app };
