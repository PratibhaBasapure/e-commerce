const ItemController = require('../controller/controller.js')
const joi = require('joi')

const routes = (app) => {

    app.route('/status').get(async (request, response) => {
        response.send('UP');
    });

    app.route('/api/item/checkItemQuantityForOrder').post(async (request, response) => {
        var controller = new ItemController();
        controller.checkItemQuantityForOrder(request, response)
    });

}
module.exports = routes
