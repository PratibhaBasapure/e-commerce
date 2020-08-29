const Service = require('../service/service.js')
const joi = require('joi')
const dotenv = require('dotenv')

dotenv.config()


// Schema
const itemQuantitySchema = joi.object().keys({
    itemId: joi.number().positive().required(),

    quantity: joi.number().positive().required(),

});

// Controller class for handling user wallet operation
class ItemController {


    constructor() {
    }

    async checkItemQuantityForOrder(request, response) {
        try {


            // validating the user wallet body against the schema
            joi.validate(request.body, itemQuantitySchema, async (err, value) => {

                //If schema validation fails, send error response
                if (err) {
                    console.log(err)
                    var message = err;
                    response.status(409).send(message);
                }
            })

            let itemService = new Service()
            let res = await itemService.getItem(request.body.itemId, request.body.quantity);

            let responseObj = {
                "eligibility": res
            }
            response.send(responseObj);
        } catch (e) {
            console.error(e);
            response.status(500).send(e);
        }
    }


}
module.exports = ItemController
