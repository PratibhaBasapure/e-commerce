const Controller  = require('../controller/controller.js')
const joi  = require('joi')
const dotenv  = require('dotenv')
dotenv.config()

const routes = (app) => {
    app.route('/')
        .get((request, response) => {
            const controller = new Controller()
            controller.getItemsList(request, response)
        })

    app.route('/specificItem')
        .get((request, response) => {
            const controller = new Controller()
            controller.getItemsList(request, response)
        })

    app.route('/add')
        .get((request, response) => {
            var controller = new Controller();
            controller.addProcess(request, response);
        })

    app.route('/add')
        .post(async (request, response) => {
            const controller = new Controller()
            controller.add(request, response)
        });

    app.route('/items/editProcess').post(async (request, response) => {
        var controller = new Controller();
        controller.editProcess(request, response);
    });

    app.route('/edit')
        .post(async (request, response) => {
            const controller = new Controller()
            controller.edit(request, response)
        });

    app.route('/api/items/')
        .get((request, response) => {
            const controller = new Controller()
            controller.getItemsList(request, response)
        })

    app.route('/items/delete').post(async (request, response) => {
        var controller = new Controller();
        controller.delete(request, response);
    });

    app.route('/api/items/getItem')
        .get((request, response) => {
            var controller = new Controller()
            controller.getItem(request, response)
        })

    app.route('/api/prepareUpdateItemTransaction')
        .post((request, response) => {
            var controller = new Controller()
            controller.prepareUpdateItemTransaction(request, response)
        })

    app.route('/api/rollbackTransaction')
        .post((request, response) => {
            var controller = new Controller()
            controller.rollbackTransaction(request, response)
        })

    app.route('/api/commitTransaction')
        .post((request, response) => {
            var controller = new Controller()
            controller.commitTransaction(request, response)
        })

}
module.exports = routes
