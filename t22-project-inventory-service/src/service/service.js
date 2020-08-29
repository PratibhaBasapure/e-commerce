const axios= require ('axios')
const mysqlConnection  = require('../connection/db-connection.js')

// Service class for handling user operation
class Service {

    constructor() {
    }

    async createItem(item) {

        return new Promise(function (resolve, reject) {
            try {
                let newItem = {
                    itemName: item.itemName,
                    qty: item.qty,
                    price: item.price
                }

                console.log(`Requesting creation of the user: ${newItem.itemName}`)

                // MySQL DB query
                let insertQuery = 'INSERT INTO items SET ?';

                // MySQL query execution
                mysqlConnection.query(insertQuery, newItem, async function (err, rows) {
                    if (err) {
                        console.error('row: ' + rows)
                        console.error(err)
                        let err_response = {
                            error: `An Item with Item Name : ${newItem.itemName} already exists. 
                            Please try with new Item Name `,
                            messsage: err.sqlMessage
                        };
                        if(err.code === 'ER_XAER_RMFAIL' || err.code ==='ER_LOCK_WAIT_TIMEOUT'){
                            err_response.error = 'Create operation cannot be performed as global transaction is in the  PREPARED state';
                        }
                        reject(err_response)
                    } else {
                        console.log(`Item with name : ${newItem.itemName} is created successfully.`)

                        let responseObj = {
                            info: `Item with item Name : ${newItem.itemName} is created successfully.`,
                            data: newItem
                        };

                        console.log(`responseObj in service class`, responseObj)
                        resolve(responseObj)
                    }
                })
            }
            catch (e) {
                console.error(e)
                throw Error(e)
            }
        })
    }

    async updateItem(itemId, itemName, quantity, price) {
        
        return new Promise(function (resolve, reject) {
            let qty = Number.parseInt(quantity);
            price = Number.parseInt(price);
            if (Number.isNaN(qty)) {
                console.log('Quantity is not number');
                let err_response = {
                    error: `Quantity must be a number`,
                }
                reject(err_response)
            }else if(Number.isNaN(price)){
                console.log('Price is not number');
                let err_response = {
                    error: `Price must be a number`,
                }
                reject(err_response)
            } else {
                try {
                    console.log(itemName, itemId, qty, price);
                    let updateQuery = 'UPDATE items SET qty=?,price=? WHERE itemId=? AND itemName=?';
                    mysqlConnection.query(updateQuery, [qty, price, itemId, itemName], async function (err, rows) {
                        if (err) {
                            console.error('row: ' + rows);
                            console.error(err);
                            
                            let err_response = {
                                error: `No record exist`,
                                messsage: err.sqlMessage
                            };
                            if(err.code === 'ER_XAER_RMFAIL' || err.code ==='ER_LOCK_WAIT_TIMEOUT'){
                                err_response.error = 'Update operation cannot be performed as global transaction is in the  PREPARED state';
                            }
                            reject(err_response)
                        } else {
                            console.log(`responseObj in edit service`, rows)
                            resolve(rows)
                        }
                    })
                } catch (e) {
                    console.error(e)
                    throw Error(e)
                }
            }
        })
    }

    async deleteItem(itemId, itemName) {
        return new Promise(function (resolve, reject) {
            console.log(itemId, itemName)
            try {
                let updateQuery = 'DELETE FROM items WHERE itemId=? AND itemName=?';
                mysqlConnection.query(updateQuery, [itemId, itemName], async function (err, rows) {
                    if (err) {
                        console.error('row: ' + rows);
                        console.error(err);
                        let err_response = {
                            error: `No record exist`,
                            messsage: err.sqlMessage
                        };
                        if(err.code === 'ER_XAER_RMFAIL' || err.code ==='ER_LOCK_WAIT_TIMEOUT'){
                            err_response.error = 'Delete operation cannot be performed as global transaction is in the  PREPARED state';
                        }
                        reject(err_response)
                    } else {
                        console.log(`responseObj in delete service`, rows)
                        resolve(rows)
                    }
                })
            }
            catch (e) {
                console.error(e)
                throw Error(e)
            }
        })
    }

    async getItemsListByID(itemId) {

        return new Promise(function (resolve, reject) {
            try {
                if (itemId != undefined) {
                    // MySQL DB query
                    var getQuery = `SELECT * from items WHERE itemId = '${itemId}' ;`;
                    console.log("This is query: " + getQuery);
                }
                else {
                    // MySQL DB query
                    var getQuery = 'SELECT * FROM items';
                }

                // MySQL query execution
                let itemsList = mysqlConnection.query(getQuery, async function (err, rows) {
                    if (err) {
                        console.error('row: ' + rows)
                        console.error(err)
                        let err_response = {
                            error: `No record exist`,
                            messsage: err.sqlMessage
                        };
                        if(err.code === 'ER_XAER_RMFAIL' || err.code ==='ER_LOCK_WAIT_TIMEOUT'){
                            err_response.error = 'Select operation cannot be performed as global transaction is in the  PREPARED state';
                        }
                        reject(err_response)
                    } else {
                        console.log(rows);
                        console.log(`responseObj in service class`, rows)
                        resolve(rows)
                    }
                })
            }
            catch (e) {
                console.error(e)
                throw Error(e)
            }
        })
    }

    // service method for fetching specific item
    async getItem(itemId) {
        return new Promise(function (resolve, reject) {
            try {
                console.log(`Requesting retrieval of the item with itemId : ${itemId}`)

                // MySQL DB query for fetching the itemrecord
                let get_item_query = 'SELECT * FROM items WHERE itemId = ?';

                // MySQL query execution
                let itemsList = mysqlConnection.query(get_item_query, itemId, async function (err, rows) {
                    if (err) {
                        console.error('row: ' + rows)
                        console.error(err)
                        let err_response = {
                            error: `No record exist`,
                            messsage: err.sqlMessage
                        };
                        if(err.code === 'ER_XAER_RMFAIL' || err.code ==='ER_LOCK_WAIT_TIMEOUT'){
                            err_response.error = 'Select operation cannot be performed as global transaction is in the  PREPARED state';
                        }
                        reject(err_response)
                    } else {
                        console.log(rows);
                        console.log(`responseObj in service class`, rows)
                        resolve(rows)
                    }
                })
            }
            catch (e) {
                console.error(`Error in retrieving the item with itemId : ${itemId}`)
                console.error(e)
                throw Error(e)
            }
        })
    }
    
    async prepareUpdateItemTransaction(transactionId, itemId, quantity) {
        
        return new Promise(function (resolve, reject) {
            let qty = Number.parseInt(quantity);
            if (Number.isNaN(qty)) {
                console.log('Quantity ordered is not number');
                let err_response = {
                    error: `Quantity ordered must be a number`,
                }
                reject(err_response)
            } else {

                try{
                    mysqlConnection.query('XA START ?',[transactionId], async function (err, rows) {
                        if (err) {
                            console.error('row: ' + rows);
                            console.error(err);
                            let err_response = {
                                error: `XA START failed`,
                                messsage: err.sqlMessage
                            };
                            reject(err_response)
                        } else {
                            console.log(`XA START responseObj in edit service`, rows)
                            let updateQuery = 'UPDATE items SET qty=qty-? WHERE itemId=?';
                            mysqlConnection.query(updateQuery,[qty, itemId], async function (err, rows) {
                                if (err) {
                                    console.error('row: ' + rows);
                                    console.error(err);
                                    let err_response = {
                                        error: `UPDATE items  set qty failed`,
                                        messsage: err.sqlMessage
                                    };
                                    reject(err_response)
                                } else {
                                    console.log(`updateQuery responseObj in edit service`, rows)
                                    mysqlConnection.query("XA END ?",[transactionId], async function (err, rows) {
                                        if (err) {
                                            console.error('row: ' + rows);
                                            console.error(err);
                                            let err_response = {
                                                error: `XA END failed`,
                                                messsage: err.sqlMessage
                                            };
                                            reject(err_response)
                                        } else {
                                            console.log(`XA END responseObj in edit service`, rows)
                                            mysqlConnection.query("XA PREPARE ?",[transactionId], async function (err, rows) {
                                                if (err) {
                                                    console.error('row: ' + rows);
                                                    console.error(err);
                                                    let err_response = {
                                                        error: `XA PREPARE  failed`,
                                                        messsage: err.sqlMessage
                                                    };
                                                    reject(err_response)
                                                } else {
                                                    console.log(`XA PREPARE responseObj in edit service`, rows)
                                                    resolve(rows)
                                                }
                                            })
                                            
                                        }
                                    })
                                    
                                }
                            })

                            
                        }
                    })
                    
                }catch(e){
                    console.error(e)
                    throw Error(e)
                }

            }
        })
    }

    async rollbackTransaction(transactionId) {
        
        return new Promise(function (resolve, reject) {
            
            try {
               
                let updateQuery = 'XA ROLLBACK ? ';
                mysqlConnection.query(updateQuery, [transactionId], async function (err, rows) {
                    if (err) {
                        console.error('row: ' + rows);
                        console.error(err);
                        let err_response = {
                            error: `XA ROLLBACK failed`,
                            messsage: err.sqlMessage
                        };
                        reject(err_response)
                    } else {
                        console.log(`responseObj in rollbackTransaction service`, rows)
                        resolve(rows)
                    }
                })
            } catch (e) {
                console.error(e)
                throw Error(e)
            }
            
        })
    }

    async commitTransaction(transactionId) {
        return new Promise(function (resolve, reject) {
            try {
                mysqlConnection.query("XA COMMIT ? ", [transactionId], async function (err, rows) {
                    if (err) {
                        console.error('row: ' + rows);
                        console.error(errd);
                        let err_response = {
                            error: `XA COMMIT failed`,
                            messsage: err.sqlMessage
                        };
                        reject(err_response)
                    } else {
                        console.log(`responseObj in commitTransaction service`, rows)
                        resolve(rows)
                    }
                })
            } catch (e) {
                console.error(e)
                throw Error(e)
            }
            
        })
    }


    async checkItemQuantityForEligibility(itemId, qty) {
        let awsLambdaItemQtyCheckUrl = process.env.awsLambdaWalletCheckSvc || 'https://ujs1u1gw69.execute-api.us-east-1.amazonaws.com/production'
        awsLambdaItemQtyCheckUrl = awsLambdaItemQtyCheckUrl + '/api/item/checkItemQuantityForOrder/'

        let body = {
            itemId: itemId,
            quantity: qty
        }

        return new Promise(function (resolve, reject) {
            try {
                axios.post(awsLambdaItemQtyCheckUrl, body, {
                    headers: {
                        Accept: 'application/json'
                    }
                })
                    .then(response => {
                        console.log(response.data);
                        resolve(response.data)
                    })
                    .catch(error => {
                        console.log(error);

                        if (error.response) {
                            console.log(error.response.data);
                            console.log(error.response.status);

                            let err_response = {
                                error: error.response.data
                            };
                            reject(err_response)
                        } else {
                            let err_response = {
                                error: error
                            };
                            reject(err_response)
                        }
                    });
                }
                catch (e) {
                    console.error(e)
                    throw Error(e)
                }
            })
        }    

}
module.exports=Service
