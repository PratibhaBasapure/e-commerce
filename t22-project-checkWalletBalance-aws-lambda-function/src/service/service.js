const mysqlConnection = require('../connection/db-connection.js')

let tempTransactionId = null

// Service class for handling user operation
class Service {

    constructor() {
    }


    async getWallet(userId, amount) {
        return new Promise(function (resolve, reject) {
            try {

                let selectQuery = 'SELECT * FROM wallet WHERE userId=' + userId;

                let walletRecords = mysqlConnection.query(selectQuery, async function (err, rows) {
                    if (err) {
                        console.error('row: ' + rows);
                        console.error(err);
                        let err_response = {
                            error: `Error in fetching user wallet`,
                            messsage: err.sqlMessage
                        };
                        reject(err_response)
                    } else {
                        console.log(`responseObj in edit service`, rows)
                        if (rows === undefined || rows.length == 0) {
                            console.log('no user wallet found')
                        }
                        else {
                            console.log(rows[0])
                            let walletBalance = rows[0].amount
                            console.log(walletBalance)

                            if (amount > walletBalance) {
                                console.log('Insufficient fund in user wallet to purchase the item')

                            }
                            else {
                                console.log('Sufficient fund in user wallet')
                                resolve(true)
                            }
                        }

                        resolve(false)
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
