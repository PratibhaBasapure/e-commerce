const express  = require('express')
const routes  = require('./src/route/route.js')
const bodyParser  = require('body-parser')
const dotenv  = require('dotenv')

dotenv.config()

const app = express()
const SERVER_PORT = process.env.PORT || 8080;

app.listen(SERVER_PORT, () => {
    console.log(`Everything looks good. The parts application has started on port ${SERVER_PORT}`)
})

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type: application/json
app.use(bodyParser.json());
routes(app)


module.exports = app