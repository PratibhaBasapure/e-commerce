const mysqlConnection = require('../connection/db-connection.js')

let tempTransactionId = null

class Service {

    constructor() {
    }


    async getItem(itemId, qty) {
        return new Promise(function (resolve, reject) {
            try {

                let selectQuery = 'SELECT * FROM items WHERE itemId=' + itemId;

                let walletRecords = mysqlConnection.query(selectQuery, async function (err, rows) {
                    if (err) {
                        console.error('row: ' + rows);
                        console.error(err);
                        let err_response = {
                            error: `Error in fetching item qty`,
                            messsage: err.sqlMessage
                        };
                        reject(err_response)
                    } else {
                        console.log(`responseObj in edit service`, rows)
                        if (rows === undefined || rows.length == 0) {
                            console.log('no item found')
                        }
                        else {
                            console.log(rows[0])
                            let itemQty = rows[0].qty
                            console.log(itemQty)

                            if (qty > itemQty) {
                                console.log('Insufficient quantity of the item')

                            }
                            else {
                                console.log('Sufficient quantity of item is present')
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
