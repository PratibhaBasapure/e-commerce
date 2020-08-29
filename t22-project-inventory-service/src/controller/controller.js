const joi  = require('joi')
const Service  = require('../service/service.js')
const dotenv  = require('dotenv')

dotenv.config()
const awsLambdaPath = process.env.awsLambdaPath || ''

// Schema
const userItemsSchema = joi.object().keys({
    // itemName is required
    // itemName must be a valid string
    itemName: joi.string().required(),

    // qty is required
    // and must be a positive number
    qty: joi.number().positive().required(),

    price: joi.number().positive().required(),
});

// const partOrderSchema = joi.object().keys({
//     jobName: joi.string().required(),
//     partId: joi.number().positive().required(),
//     userId: joi.number().positive().required(),
//     qty: joi.number().positive().required(),
// });

// Controller class for handling user operation
class Controller {

    constructor() {
        global.itemService = new Service();
    }

    async addProcess(request, response) {
        try {
            response.render('add');
        } catch (e) {
            console.error(e)
            response.render('error', { error: e.error });
        }
    }

    async add(request, response) {
        try {
            // validating the user registration body against the schema
            joi.validate(request.body, userItemsSchema, async (err, value) => {

                //If schema validation fails, send error response
                if (err) {
                    console.log(err)
                    var message = err;
                    response.render('error', { error: message });
                }
            })

            // If schema validation passes, proceed with the service call.
            let itemObj = {
                itemName: request.body.itemName,
                qty: request.body.qty,
                price: request.body.price
            }

            console.log(`Requesting service method for creation of the item: ${itemObj.itemName}`)

            let itemService = new Service()
            let responseObj = await itemService.createItem(itemObj)

            console.log(`responseObj from service:`, responseObj)
            var message = responseObj.info + 'Please click on below button to add more items.'
            response.render('success', { success: message });
        } catch (e) {
            console.error(e)
            response.render('error', { error: e.error });
        }
    }

    async editProcess(request, response) {
        try {
            response.render('edit', { itemName: request.body.itemName, itemId: request.body.itemId });
        } catch (e) {
            console.error(e);
            response.render('error', { error: e.error });
        }
    }

    async edit(request, response) {

        let itemName = request.body.itemName;
        let itemId = request.body.itemId;
        let qty = request.body.quantity;
        let price = request.body.price;
        console.log(itemName, itemId, qty, price);
        try {
            let responseObj = await global.itemService
                .updateItem(itemId, itemName, qty, price);
            return response.redirect('/');
        } catch (e) {
            console.error(e);
            response.render('error', { error: e.error });
        }
    }

    async delete(request, response) {
        try {
            console.log(request.body.itemId, request.body.itemName)
            let responseObj = await global.itemService.
            deleteItem(request.body.itemId, request.body.itemName);
            return response.redirect('/');
        } catch (e) {
            console.error(e);
            response.render('error', { error: e.error });
        }
    }

    async getItemsList(request, response) {

        try {
            
            let responseObj = await global.itemService.getItemsListByID(request.query.itemId)

            console.log(`responseObj from service:`, responseObj)

            if (request.header('Accept').includes('application/json')) {
                response.send(responseObj);
            } else {
                response.render('list', { items: responseObj });
            }

        } catch (e) {
            console.error(e)
            response.render('error', { error: e.error });
        }
    }

    // controller method for getting specific job
    async getItem(request, response) {

        try {

            let itemId = request.query.itemId;

            console.log(`Requesting service method for fetching item with itemId : ${itemId}`)

            // calling the service class method
            let itemService = new Service()
            let responseObj = await itemService.getItem(itemId)
            console.log(`responseObj from service:`, responseObj)

            if (responseObj === undefined || responseObj.length == 0) {
                let message = `No Item with itemId : ${itemId} found`
                console.error(message)
                response.status(404).send({
                    message: message
                });
            }
            else {
                response.send(responseObj);
            }

        } catch (e) {
            console.error(e)
            response.status(500).send({
                message: e
            });
        }
    }


    async prepareUpdateItemTransaction(request, response) {

        let transactionId = request.body.transactionId
        let itemId = request.body.itemId;
        let quantity = request.body.quantity;
        console.log(transactionId, itemId, quantity);
        try {

            let itemService = new Service()
            let isItemQtySufficient = await itemService.checkItemQuantityForEligibility(request.body.itemId, request.body.quantity)
            if(isItemQtySufficient!=undefined && isItemQtySufficient.eligibility){
                let responseObj = await global.itemService.prepareUpdateItemTransaction(transactionId, itemId, quantity);
                console.log(responseObj);
                let resp = {}
                if(responseObj.protocol41 === true){
                    resp = {
                        messsage: `Transaction prepared successfully`,
                        transactionId: transactionId,
                        success: true
                    };
                }
                else{
                    resp = {
                        messsage: `Transaction preparation failed`,
                        transactionId: transactionId,
                        success: false
                    };
                }
            
                response.send(resp);
            }
            else{
                response.status(409).send({error: 'Transaction cannot be prepared due to insufficient item quantity.'});
            }
           
            
            
        } catch (e) {
            console.error(e);
            response.status(500).send({
                message: e
            });
        }
    }

    async rollbackTransaction(request, response) {

        let transactionId = request.body.transactionId

        console.log(transactionId);
        try {
            let responseObj = await global.itemService
                .rollbackTransaction(transactionId);
            let resp = {}
            if(responseObj.protocol41 === true){
                resp = {
                    messsage: `Transaction rollbacked successfully`,
                    transactionId: transactionId,
                    success: true
                };
            }
            else{
                resp = {
                    messsage: `Transaction rollback failed`,
                    transactionId: transactionId,
                    success: false
                };
            }

            response.send(resp);
            
        } catch (e) {
            console.error(e);
            response.status(500).send({
                message: e
            });
        }
    }

    async commitTransaction(request, response) {

        let transactionId = request.body.transactionId

        console.log(transactionId);
        try {
            let responseObj = await global.itemService
                .commitTransaction(transactionId);
            let resp = {}
            if(responseObj.protocol41 === true){
                resp = {
                    messsage: `Transaction commited successfully`,
                    transactionId: transactionId,
                    success: true
                };
            }
            else{
                resp = {
                    messsage: `Transaction commit failed`,
                    transactionId: transactionId,
                    success: false
                };
            }
            response.send(resp);

        } catch (e) {
            console.error(e);
            response.status(500).send({
                message: e
            });
        }
    }
 

}
module.exports = Controller
