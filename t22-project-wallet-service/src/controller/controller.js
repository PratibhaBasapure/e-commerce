const joi = require('joi')
const Service = require('../service/service.js')
const dotenv = require('dotenv')

dotenv.config()

const awsLambdaPath = process.env.awsLambdaPath || ''

// Schema
const userWalletSchema = joi.object().keys({
    userId: joi.number().positive().required(),
    amount: joi.number().positive().required(),
    name: joi.string().required(),
    email: joi.string().email().required()

});

const partOrderSchema = joi.object().keys({
    jobName: joi.string().required(),
    partId: joi.number().positive().required(),
    userId: joi.number().positive().required(),
    qty: joi.number().positive().required(),
});

// Controller class for handling user wallet operation
class WalletController {


    constructor() {
    }

    async getUserWalletData(request, response) {
        try {
            let partService = new Service()
            let responseObj = await partService.getWallet(request.query.userId);

            if (request.header('Accept').includes('application/json')) {
                response.send(responseObj);
            } else {
                response.render('list', { wallet: responseObj });
            }

        } catch (e) {
            console.error(e);
            response.render('error', { error: e.error });
        }
    }

    async addUserWallet(request, response) {

        try {
            // validating the user wallet body against the schema
            joi.validate(request.body, userWalletSchema, async (err, value) => {

                //If schema validation fails, send error response
                if (err) {
                    console.log(err)
                    var message = err;
                    response.render('error', { error: message });
                }
            })

            // If schema validation passes, proceed with the service call.
            let userWallet = {
                userId: request.body.userId,
                amount: request.body.amount,
                email: request.body.email,
                name: request.body.name
            }

            console.log(`Calling service method for creating the user wallet: ${userWallet.userId}`)

            let walletService = new Service()
            let responseObj = await walletService.createUserWallet(userWallet);

            if (request.header('Accept').includes('application/json')) {
                response.send(responseObj);
            }
            else {
                var message = responseObj.info + 'Please click on below button to add more user wallet.'
                response.render('success', { success: message });
            }

        } catch (e) {

            if (request.header('Accept').includes('application/json')) {
                response.status(500).send({ error: e.error });
            }

            console.error(e);
            response.render('error', { error: e.error });
        }
    }

    async editWallet(request, response) {
        try {
            response.render('edit', { userId: request.body.userId });
        } catch (e) {
            console.error(e);
            response.render('error', { error: e.error });
        }
    }

    async edit(request, response) {
        try {
            let walletService = new Service()
            let responseObj = await walletService.updateWallet(request.body.userId, request.body.amount);
            return response.redirect(awsLambdaPath + '/wallet');
        } catch (e) {
            console.error(e);
            response.render('error', { error: e.error });
        }
    }


    async deductAmount(request, response) {
        try {
            let walletService = new Service()

            // Call User wallet balance eligibility AWS Lambda function
            let isUserWalletSufficient = await walletService.checkWalletBalanceForEligibility(request.body.userId, request.body.amount)

            if(isUserWalletSufficient!=undefined && isUserWalletSufficient.eligibility){
                let responseObj = await walletService.deductAmountFromWallet(request.body.userId, request.body.amount, request.body.globalTransactionId);
                response.send({message:'successfully prepared wallet transaction', data: responseObj});
            }
            else{
                response.status(409).send({error: 'User has insufficient funds in the wallet to process the order.'});
            }


        } catch (e) {
            console.error(e);
            response.status(500).send({error: e});
        }
    }


    async commitDeductAmount(request, response) {
        try {
            let walletService = new Service()
            let responseObj = await walletService.commitWalletTransaction(request.body.globalTransactionId);
            response.send({message:'successfully committed wallet transaction', data: responseObj});
        } catch (e) {
            console.error(e);
            response.status(500).send('error', { error: e.error });
        }
    }

    async rollbackDeductAmount(request, response) {
        try {
            let walletService = new Service()
            let responseObj = await walletService.rollbackWalletTransaction(request.body.globalTransactionId);
            response.send({message:'successfully rollbacked wallet transaction', data: responseObj});
        } catch (e) {
            console.error(e);
            response.status(500).send('error', { error: e.error });
        }
    }


}
module.exports = WalletController
