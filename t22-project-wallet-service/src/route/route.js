const WalletController = require('../controller/controller.js')
const joi = require('joi')

const routes = (app) => {

    app.route('/').get((request, response) => {
        var controller = new WalletController();
        controller.getUserWalletData(request, response);
    });

    app.route('/wallet').get((request, response) => {
        var controller = new WalletController();
        controller.getUserWalletData(request, response);
    });

    app.route('/wallet/add').get((request, response) => {
        response.render('add');
    });

    app.route('/wallet/add').post(async (request, response) => {
        var controller = new WalletController();
        controller.addUserWallet(request, response);
    });

    app.route('/wallet/addMoney').post(async (request, response) => {
        var controller = new WalletController();
        controller.editWallet(request, response);
    });

    app.route('/wallet/edit').post(async (request, response) => {
        var controller = new WalletController();
        controller.edit(request, response);
    });

    app.route('/wallet/deductAmount').post(async (request, response) => {
        var controller = new WalletController();
        controller.deductAmount(request, response)
    });

    app.route('/wallet/commitDeductAmount').post(async (request, response) => {
        var controller = new WalletController();
        controller.commitDeductAmount(request, response)
    });

    app.route('/wallet/rollbackDeductAmount').post(async (request, response) => {
        var controller = new WalletController();
        controller.rollbackDeductAmount(request, response)
    });

}
module.exports = routes
