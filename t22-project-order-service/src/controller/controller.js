
const Service = require('../service/orderService.js')
const TransactionService = require('../service/transactionService.js')


class Controller {

  async add(request, response) {


    let transactionId = Math.random().toString(36).slice(2)

    try {



      // Step -1
      // Trigger wallet transaction API
      let walletTransactionRequest = {
        userId: request.body.userID,
        amount: request.body.amount,
        globalTransactionId: transactionId
      }

      let transactionService = new TransactionService();

      let walletTransactionResponse = await transactionService.triggerWalletTransaction(walletTransactionRequest);
      console.log(`walletTransactionResponse:`, walletTransactionResponse)

      //Step-2
      // Trigger inventory transaction API

      let inventoryItems = request.body.items[0];

      let inventoryTransactionRequest = {

        itemId: inventoryItems.itemID,
        quantity: inventoryItems.qty,
        transactionId: transactionId
      }
      let inventoryTransactionResponse = await transactionService.triggerInventoryTransaction(inventoryTransactionRequest);
      console.log(`inventoryTransactionResponse:`, inventoryTransactionResponse)


      //Step-3
      // call create order service call
      if (walletTransactionResponse != undefined && inventoryTransactionResponse != undefined) {
        let orderService = new Service()
        let orderServiceResponse = await orderService.add(request.body)

        if (orderServiceResponse != undefined) {
          console.log(`orderServiceResponse:`, orderServiceResponse)
          let transactionResponse = await transactionService.createTransaction(orderServiceResponse.data.orderID, transactionId);

          console.log(`transactionResponse:`, transactionResponse)

          if (transactionResponse != null) {
            console.log(`transactionResponse:`, transactionResponse)
            response.json(orderServiceResponse);
          }
        }
        else {
          response.status(409).send({ error: "error in creating the order. Please try again" })
        }

      }
      else {
        response.status(409).send({ error: "Error in creating the order. Please approve/reject the previous order." })
      }

    } catch (e) {
      console.error(e)

      //    response.status(500).send(e)

      let walletTransactionRequest = {
        globalTransactionId: transactionId,
      }

      let inventoryTransactionRequest = {
        transactionId: transactionId
      }

      let transactionService = new TransactionService();

      let walletRollback = transactionService.rejectWalletTransaction(walletTransactionRequest);
      let inventoryRollback = transactionService.rejectInventoryTransaction(inventoryTransactionRequest);


      if (e != undefined && e.error != undefined && e.error.error != undefined) {
        if (e.error.error === "Error in starting the transaction") {
          response.status(409).send({ error: "Error in creating the order. Please approve or reject the previous order." })
        } else {
          response.status(500).send(e)
        }
      }
      else {
        response.status(500).send(e)
      }

    }
  }

  async delete(request, response) {
    try {
      let orderService = new Service()
      let responseObj = await orderService.delete(request.params.id)
      console.log(`responseObj from service:`, responseObj)
      response.json(responseObj);
    } catch (e) {
      console.error(e)
      response.json({
        status: 500,
        error: "Error while deleting the order"
      });
    }
  }
  async getOrders(request, response) {

    try {
      let orderService = new Service()
      let responseObj = await orderService.getOrders(request.query.user_id)
      console.log(`responseObj from service:`, responseObj)

      if (request.header('Accept').includes('application/json')) {
        response.send(responseObj);
      }
      else {
        response.render('successList', { orders: responseObj });
      }

    } catch (e) {
      console.error(e)
      response.json({
        status: 500,
        error: "Error while getting Order"
      });
    }
  }



  async acceptOrder(request, response) {
    try {

      console.log(`request orderid`)
      console.log(request.body)


      // Step -1
      // fetch transaction id for order id
      let orderService = new Service()
      let transactionObj = await orderService.getTransactionForOrder(request.body.orderID)

      console.log(`transactionObj: ${transactionObj}`)
      console.log(transactionObj)

      if (transactionObj != undefined) {
        let transactionId = transactionObj[0].transactionId

        let walletTransactionRequest = {
          globalTransactionId: transactionId
        }


        // Step - 2
        // trigger commit API of wallet service
        let transactionService = new TransactionService();
        let walletCommitResponse = await transactionService.acceptWalletTransaction(walletTransactionRequest)

        console.log(`walletCommitResponse:`, walletCommitResponse)


        // Step - 3
        // trigger commit API of inventory service
        let inventoryTransactionRequest = {
          transactionId: transactionId
        }
        let inventoryCommitResponse = await transactionService.acceptInventoryTransaction(inventoryTransactionRequest)

        console.log(`inventoryCommitResponse:`, inventoryCommitResponse)


        // Step - 4
        // change order status
        let updateResponse = await orderService.updateStatusForOrder(request.body.orderID, 'ACCEPTED')

        //  response.json(walletCommitResponse);
        response.render('success', { success: walletCommitResponse.message });
      }
      else {
        response.status(409).send({ error: "error in accepting the order. Please try again" })
      }

    } catch (e) {
      console.error(e)


      if (e.error.error === "Error in starting the transaction") {
        response.status(409).send({ error: "Error in accepting the order. Please approve or reject the previous order." })
      } else {
        response.status(500).send(e)
      }


    }
  }


  async rejectOrder(request, response) {
    try {

      console.log(`request orderid`)
      console.log(request.body)


      // Step -1
      // fetch transaction id for order id
      let orderService = new Service()
      let transactionObj = await orderService.getTransactionForOrder(request.body.orderID)

      console.log(`transactionObj: ${transactionObj}`)
      console.log(transactionObj)

      if (transactionObj != undefined) {
        let transactionId = transactionObj[0].transactionId

        let walletTransactionRequest = {
          globalTransactionId: transactionId
        }


        // Step - 2
        // trigger rollback API of wallet service
        let transactionService = new TransactionService();
        let walletRollbackResponse = await transactionService.rejectWalletTransaction(walletTransactionRequest)

        console.log(`walletCommitResponse:`, walletRollbackResponse)

        // Step - 3
        // trigger rollback API of inventory service
        let inventoryTransactionRequest = {
          transactionId: transactionId
        }
        let inventoryRollbackResponse = await transactionService.rejectInventoryTransaction(inventoryTransactionRequest)

        console.log(`inventoryRollbackResponse:`, inventoryRollbackResponse)

        // Step - 4
        // change order status
        let updateResponse = await orderService.updateStatusForOrder(request.body.orderID, 'CANCELLED')

        //  response.json(walletCommitResponse);
        response.render('success', { success: walletRollbackResponse.message });
      }
      else {
        response.status(409).send({ error: "error in cancelling the order. Please try again" })
      }

    } catch (e) {
      console.error(e)


      if (e.error.error === "Error in cancelling the transaction") {
        response.status(409).send({ error: "Error in creating the order. Please approve or reject the previous order." })
      } else {
        response.status(500).send(e)
      }


    }
  }

}
module.exports = Controller
