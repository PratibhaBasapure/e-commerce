const Controller = require('../controller/controller.js')
const dotenv = require('dotenv')
dotenv.config()

const routes = (app) => {

    app.route('/')
        .get(async (request, response) => {
            var controller = new Controller()
            controller.getOrders(request, response)
        })

    app.route('/add')
        .post((request, response) => {
            var controller = new Controller()
            controller.add(request, response)
        })

    app.route('/delete/:id')
        .get(async (request, response) => {
            var controller = new Controller()
            controller.delete(request, response)
        });
    app.route('/getOrders').get(async (request,response)=>{
        var controller = new Controller()
            controller.getOrders(request, response)
    });

    app.route('/acceptOrder')
    .post((request, response) => {
        var controller = new Controller()
        controller.acceptOrder(request, response)
    })

    app.route('/rejectOrder')
    .post((request, response) => {
        var controller = new Controller()
        controller.rejectOrder(request, response)
    })

}
module.exports = routes
