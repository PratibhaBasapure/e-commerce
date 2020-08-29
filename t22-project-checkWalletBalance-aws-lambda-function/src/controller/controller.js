const Service = require('../service/service.js')
const joi = require('joi')
const dotenv = require('dotenv')

dotenv.config()


// Schema
const userWalletSchema = joi.object().keys({
    // partID is required
    userId: joi.number().positive().required(),

    // partID is required
    amount: joi.number().positive().required(),

});

// Controller class for handling user wallet operation
class WalletController {


    constructor() {
    }

    async checkUserWalletForOrder(request, response) {
        try {


            // validating the user wallet body against the schema
            joi.validate(request.body, userWalletSchema, async (err, value) => {

                //If schema validation fails, send error response
                if (err) {
                    console.log(err)
                    var message = err;
                    response.status(409).send(message);
                }
            })

            let walletService = new Service()
            let res = await walletService.getWallet(request.body.userId, request.body.amount);

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
module.exports = WalletController
