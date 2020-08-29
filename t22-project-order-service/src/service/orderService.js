const axios = require('axios')
const dotenv = require('dotenv')
const moment = require('moment')
const conn = require('../connection/db-connection.js')
dotenv.config()

class Service {
  async add(request) {
    let newOrder = {
      date: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
      userID: request.userID,
      amount: request.amount
    }

    return new Promise(function (resolve, reject) {
      try {
        let insertQuery = 'INSERT INTO Orders SET ?';

        conn.query(insertQuery, newOrder, async function (err, rows) {
          if (err) {
            console.error('row: ' + rows)
            console.error(err)
            let err_response = {
              error: `Error while creating order`,
              messsage: err.sqlMessage
            };
            reject(err_response)
          } else {


            console.log(`orderId: ${rows.insertId}`)

            for (var i = 0; i < request['items'].length; i++) {
              let insertOrderItemQuery = 'INSERT INTO Order_Item SET ?';
              let newOrderItem = {
                orderID: rows.insertId,
                itemID: request['items'][i].itemID,
                qty: request['items'][i].qty,
                name: request['items'][i].name
              }

              conn.query(insertOrderItemQuery, newOrderItem, async function (err, rows) {
                if (err) {
                  console.error('row: ' + rows)
                  console.error(err)
                  let err_response = {
                    error: `Error while creating Order_Item`,
                    messsage: err.sqlMessage
                  };
                  reject(err_response)
                } else {
                  let response = {
                    messsage: `Successfully created the order`,
                    data: newOrderItem
                  };
                  resolve(response)
                }
              })
            }
          }
        })
      }
      catch (e) {
        console.error(e)
        throw Error(e)
      }
    })
  }

  async delete(orderID) {
    return new Promise(function (resolve, reject) {
      try {
        let deleteOrderItemQuery = 'DELETE FROM Order_Item WHERE orderID=?';
        conn.query(deleteOrderItemQuery, [orderID], async function (err, rows) {
          if (err) {
            console.error('row: ' + rows)
            console.error(err)
            let err_response = {
              error: `Error while deleting order`,
              messsage: err.sqlMessage
            };
            reject(err_response)
          } else {
            let deleteQuery = 'DELETE FROM Orders WHERE orderID=?';
            conn.query(deleteQuery, [orderID], async function (err, rows) {
              if (err) {
                console.error('row: ' + rows)
                console.error(err)
                let err_response = {
                  error: `Error while deleting Order_Item`,
                  messsage: err.sqlMessage
                };
                reject(err_response)
              } else {
                let response = {
                  messsage: `Successfully deleted the order`
                };
                resolve(response)
              }
            })
          }
        })
      }
      catch (e) {
        console.error(e)
        throw Error(e)
      }
    })
  }
  async getOrders(user_id) {
    return new Promise(function (resolve, reject) {
      try {

        if (user_id != undefined) {
          var selectQuery = 'SELECT * FROM Orders as t,Order_Item as f where f.orderID = t.orderID and t.userID=' + user_id;
          console.log(`Requesting retrieval of the order with userID : ${user_id}`)
        }
        else {
          var selectQuery = 'SELECT * FROM Orders as t,Order_Item as f where f.orderID = t.orderID'
          console.log(`Requesting retrieval of all the order`)
        }

        // MySQL query execution
        let orderList = conn.query(selectQuery, async function (err, rows) {
          if (err) {
            console.error('row: ' + rows)
            console.error(err)
            let err_response = {
              error: `No record exist`,
              messsage: err.sqlMessage
            };

            reject(err_response)
          } else {
            let orderList = [];
            let orderListObject = []
            let eachOrder = {}
            let eachItems = []
            let count = 0

            resolve(rows)

            // if (rows === undefined || rows.length == 0) {
            //   resolve(orderListObject)
            // }

            // for (var i in rows) {
            //   console.log(rows[i])
            //   if (orderList.includes(rows[i].insertId)) {
            //     eachItems.push({ "itemID": rows[i].itemID, "qty": rows[i].qty })
            //     eachOrder['items'] = eachItems
            //   }
            //   else {
            //     console.log('b')
            //     if (count > 0) {
            //       orderListObject.push(eachOrder)
            //     }
            //     eachOrder = {}
            //     eachItems = []
            //     orderList.push(rows[i].insertId)
            //     eachOrder['OrderID'] = rows[i].insertId
            //     eachOrder['amount'] = rows[i].amount
            //     eachItems.push({ "itemID": rows[i].itemID, "qty": rows[i].qty })
            //     eachOrder['items'] = eachItems
            //     count++;
            //   }
            // }
            // orderListObject.push(eachOrder)
            // console.log(`responseObj in service class`, orderListObject)
            // resolve(orderListObject)
          }
        })
      }
      catch (e) {
        console.error(`Error in retrieval of the order with userID : ${user_id}`)
        console.error(e)
        throw Error(e)
      }
    })
  }


  async getTransactionForOrder(orderId) {
    return new Promise(function (resolve, reject) {
      try {

        var selectQuery = 'SELECT * FROM order_transaction where orderID='+orderId

        // MySQL query execution
        let orderList = conn.query(selectQuery, async function (err, rows) {
          if (err) {
            console.error('row: ' + rows)
            console.error(err)
            let err_response = {
              error: `No record exist`,
              messsage: err.sqlMessage
            };

            reject(err_response)
          } else {
            resolve(rows)
          }
        })
      }
      catch (e) {
        console.error(`Error in retrieval of the transaction with orderID : ${orderId}`)
        console.error(e)
        throw Error(e)
      }
    })
  }

  async updateStatusForOrder(orderId, status) {
    return new Promise(function (resolve, reject) {
      try {

        var selectQuery = 'UPDATE Orders SET status = ? WHERE orderID = ?'

        // MySQL query execution
        let orderList = conn.query(selectQuery, [status, orderId], async function (err, rows) {
          if (err) {
            console.error('row: ' + rows)
            console.error(err)
            let err_response = {
              error: `No record exist`,
              messsage: err.sqlMessage
            };

            reject(err_response)
          } else {
            resolve(rows)
          }
        })
      }
      catch (e) {
        console.error(`Error in updating the orderID : ${orderId}`)
        console.error(e)
        throw Error(e)
      }
    })
  }

}

module.exports = Service
