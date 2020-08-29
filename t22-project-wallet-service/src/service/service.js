const mysqlConnection = require('../connection/db-connection.js')
const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config()

let tempTransactionId = null

// Service class for handling user operation
class Service {

    constructor() {
    }

    async createUserWallet(userWallet) {

        return new Promise(function (resolve, reject) {

            try {
                let newWalletData = {
                    userId: userWallet.userId,
                    amount: userWallet.amount || 0.00,
                    email: userWallet.email,
                    name: userWallet.name
                }

                console.log(`Requesting wallet creation for the user: ${newWalletData.userId}`)

                // MySQL DB query
                let insertQuery = 'INSERT INTO wallet SET ?';

                // MySQL query execution
                mysqlConnection.query(insertQuery, newWalletData, async function (err, rows) {
                    if (err) {
                        console.error('row: ' + rows)
                        console.error(err)
                        let err_response = {
                            error: `Wallet data for the user : ${newWalletData.userId} already exists.`,
                            messsage: err.sqlMessage
                        };

                        reject(err_response)
                    } else {
                        console.log(`User : ${newWalletData.userId}  wallet is created successfully.`)

                        let responseObj = {
                            info: `User: ${newWalletData.userId}  wallet is created successfully.`,
                            data: newWalletData
                        };

                        console.log(`responseObj in create wallet service class`, responseObj)
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

    async updateWallet(id, quantity) {
        return new Promise(function (resolve, reject) {
            try {
                let updateQuery = 'UPDATE wallet SET amount=? WHERE userId=?';
                mysqlConnection.query(updateQuery, [quantity, id], async function (err, rows) {
                    if (err) {
                        console.error('row: ' + rows);
                        console.error(err);
                        let err_response = {
                            error: `No record exist`,
                            messsage: err.sqlMessage
                        };
                        reject(err_response)
                    } else {
                        console.log(`responseObj in edit service`, rows)
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

    async getWallet(userId) {
        return new Promise(function (resolve, reject) {
            try {
                if (userId != undefined) {
                    var selectQuery = 'SELECT * FROM wallet WHERE userId=' + userId;
                }
                else {
                    var selectQuery = 'SELECT * FROM wallet';
                }

                let walletRecords = mysqlConnection.query(selectQuery, async function (err, rows) {
                    if (err) {
                        console.error('row: ' + rows);
                        console.error(err);
                        let err_response = {
                            error: `No record exist`,
                            messsage: err.sqlMessage
                        };
                        reject(err_response)
                    } else {
                        console.log(`responseObj in edit service`, rows)
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


    async checkWalletBalanceForEligibility(userId, amount) {
        let awsLambdaWalletCheckUrl = process.env.awsLambdaWalletCheckSvc || 'https://aehwm51v7c.execute-api.us-east-1.amazonaws.com/production'
        awsLambdaWalletCheckUrl = awsLambdaWalletCheckUrl + '/api/wallet/checkWalletBalanceForOrder/'

        let body = {
            userId: userId,
            amount: amount
        }

        return new Promise(function (resolve, reject) {
            try {
                axios.post(awsLambdaWalletCheckUrl, body, {
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

    async deductAmountFromWallet(userId, amount, globalTransactionId) {
        return new Promise(function (resolve, reject) {
            try {

                console.log(`temp transactionId: ${globalTransactionId}`)


                let startTransaction = 'XA start ?'

                mysqlConnection.query(startTransaction, [globalTransactionId], async function (err, rows) {
                    if (err) {
                        console.error('row: ' + rows);
                        console.error(err);
                        let err_response = {
                            error: `Error in starting the transaction`,
                            messsage: err.sqlMessage
                        };
                        reject(err_response)
                    } else {
                        console.log(`responseObj in startTransaction`, rows)

                        let updateQuery = 'UPDATE wallet SET amount=amount-? WHERE userId=?';

                        mysqlConnection.query(updateQuery, [amount, userId], async function (err, rows) {
                            if (err) {
                                console.error('row: ' + rows);
                                console.error(err);
                                let err_response = {
                                    error: `Error in starting the transaction`,
                                    messsage: err.sqlMessage
                                };
                                reject(err_response)
                            } else {
                                console.log(`responseObj in updateQuery`, rows)


                                let endTransactionQuery = 'XA END ?'
                                mysqlConnection.query(endTransactionQuery, [globalTransactionId], async function (err, rows) {
                                    if (err) {
                                        console.error('row: ' + rows);
                                        console.error(err);
                                        let err_response = {
                                            error: `No record exist`,
                                            messsage: err.sqlMessage
                                        };
                                        reject(err_response)
                                    } else {
                                        console.log(`responseObj in endTransactionQuery`, rows)


                                        let prepareTransactionQuery = 'XA PREPARE ?'
                                        mysqlConnection.query(prepareTransactionQuery, [globalTransactionId], async function (err, rows) {
                                            if (err) {
                                                console.error('row: ' + rows);
                                                console.error(err);
                                                let err_response = {
                                                    error: `No record exist`,
                                                    messsage: err.sqlMessage
                                                };
                                                reject(err_response)
                                            } else {
                                                console.log(`deduct wallet prepareTransactionQuery success`, rows)

                                                resolve(rows)
                                            }

                                            //   resolve(rows)

                                        })
                                    }
                                    // resolve(rows)
                                })

                                // resolve(rows)
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


    async commitWalletTransaction(globalTransactionId) {
        return new Promise(function (resolve, reject) {
            try {

                let updateQuery = 'XA COMMIT ?'
                mysqlConnection.query(updateQuery, [globalTransactionId], async function (err, rows) {
                    if (err) {
                        console.error('row: ' + rows);
                        console.error(err);
                        let err_response = {
                            error: `Error in committing the transaction`,
                            messsage: err.sqlMessage
                        };
                        reject(err_response)
                    } else {
                        console.log(`responseObj in commit deduct wallet amount service`, rows)
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

    async rollbackWalletTransaction(globalTransactionId) {
        return new Promise(function (resolve, reject) {
            try {

                let updateQuery = 'XA ROLLBACK ?'
                mysqlConnection.query(updateQuery, [globalTransactionId], async function (err, rows) {
                    if (err) {
                        console.error('row: ' + rows);
                        console.error(err);
                        let err_response = {
                            error: `Error in committing the transaction`,
                            messsage: err.sqlMessage
                        };
                        reject(err_response)
                    } else {
                        console.log(`responseObj in rollback deduct wallet amount service`, rows)
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

}
module.exports = Service
