const WalletController = require('../controller/controller.js')
const joi = require('joi')

const routes = (app) => {

    app.route('/status').get(async (request, response) => {
        response.send('UP');
    });

    app.route('/api/wallet/checkWalletBalanceForOrder').post(async (request, response) => {
        var controller = new WalletController();
        controller.checkUserWalletForOrder(request, response)
    });

}
module.exports = routes
