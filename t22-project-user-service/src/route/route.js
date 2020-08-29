const Controller = require('../controller/controller.js')
const UserController = require('../controller/userController.js')
const dotenv = require('dotenv')
dotenv.config()

const routes = (app) => {

    app.route('/')
        .get((request, response) => {
            response.render('home')
        })

    app.route('/login')
        .get((request, response) => {
            response.render('login')
        })

    app.route('/register')
        .get((request, response) => {
            response.render('register')
        })

    app.route('/placeOrder')
        .get((request, response) => {
            var controller = new Controller()
            controller.getItemsList(request, response)
        })

    app.route('/list')
        .get((request, response) => {
            var controller = new Controller()
            controller.getAllItemsList(request, response)
        })

    app.route('/buy')
        .post((request, response) => {
            console.log("inside buy");
            var controller = new Controller()
            controller.buy(request, response)
        })

    app.route('/myWallet')
        .get((request, response) => {
            var controller = new Controller()
            controller.getWalletBalance(request, response)
        })

    app.route('/login')
        .post(async (request, response) => {
            let userController = new UserController()
            userController.validateUser(request, response)
        })

    app.route('/register')
        .post(async (request, response) => {
            let userController = new UserController()
            userController.registerUser(request, response)
        })

    app.route('/logout')
        .get(async (request, response) => {
            let userController = new UserController()
            userController.logoutUser(request, response)
        })

    app.route('/orderHistory')
        .get(async (request, response) => {
            var controller = new Controller();
            controller.getOrderHistory(request, response)
        });
}
module.exports = routes
