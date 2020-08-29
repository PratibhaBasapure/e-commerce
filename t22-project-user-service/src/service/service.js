const axios = require('axios')
const dotenv = require('dotenv')
const moment = require('moment')
const mysqlConnection = require('../connection/db-connection.js')
dotenv.config()

// Service class
class Service {

    constructor() {
    }

    async getAllItems() {
        let getInventoryUrl = process.env.inventorySvcUrl
        getInventoryUrl = getInventoryUrl + '/api/items/'

        return new Promise(function (resolve, reject) {
            try {
                axios.get(getInventoryUrl, {
                    headers: {
                        Accept: 'application/json'
                    }
                })
                    .then(response => {
                        console.log("This is in getAllItems: ");
                        // console.log(response.data)
                        // Check if the incoming data is JSON
                        var responseData = response.data
                        var isJSON
                        responseData = typeof responseData !== "string" ? JSON.stringify(responseData) : responseData;
                        try {
                            responseData = JSON.parse(responseData);
                        } catch (e) {
                            isJSON = false;
                        }
                        if (typeof responseData === "object" && responseData !== null) {
                            isJSON = true;
                        }
                        console.log(isJSON)
                        if(isJSON)
                            resolve(response.data)
                        else
                        {
                            let err_response = {
                                error: "Your previous order is not Accepted or Rejected"
                            };
                            reject(err_response)
                        }
                    })
                    .catch(error => {
                        console.log("This is in getAllItems error: ");
                        console.log(error);
                        let err_response = {
                            error: error
                        };
                        reject(err_response)
                    });
            }
            catch (e) {
                console.error(e)
                throw Error(e)
            }
        })
    }

    async getItemDetailsByID(itemId) {
        let getInventoryUrl = process.env.inventorySvcUrl
        getInventoryUrl = getInventoryUrl + `/api/items/getItem?itemId=${itemId}`

        return new Promise(function (resolve, reject) {
            try {
                axios.get(getInventoryUrl, {
                    headers: {
                        Accept: 'application/json'
                    }
                })
                    .then(response => {
                        console.log("service"+JSON.stringify(response.data));
                        resolve(response.data)
                    })
                    .catch(error => {
                        console.log(error);
                        let err_response = {
                            error: error
                        };
                        reject(err_response)
                    });
            }
            catch (e) {
                console.error(e)
                throw Error(e)
            }
        })
    }

    async getWalletBalance(userId) {
        // let getwalletUrl =  `http://wallet-svc.us-east-1.elasticbeanstalk.com/wallet?userId=${userId}`;
        let walletSvcUrl = process.env.walletSvcUrl
        walletSvcUrl = walletSvcUrl + `?userId=${userId}`
        return new Promise(function (resolve, reject) {
            try {
                axios.get(walletSvcUrl, {
                    headers: {
                        Accept: 'application/json'
                    }
                })
                    .then(response => {
                        // console.log(response.data);
                        // Check if the incoming data is JSON
                        var responseData = response.data
                        var isJSON
                        responseData = typeof responseData !== "string" ? JSON.stringify(responseData) : responseData;
                        try {
                            responseData = JSON.parse(responseData);
                        } catch (e) {
                            isJSON = false;
                        }
                        if (typeof responseData === "object" && responseData !== null) {
                            isJSON = true;
                        }
                        console.log(isJSON)
                        if(isJSON)
                            resolve(response.data)
                        else
                        {
                            let err_response = {
                                error: "As your previous order is under process," +
                                    "\nwe can not show you the updated balance."
                            };
                            reject(err_response)
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        let err_response = {
                            error: error
                        };
                        reject(err_response)
                    });
            }
            catch (e) {
                console.error(e)
                throw Error(e)
            }
        })
    }

    async buy(data)     {
        let orderSvcUrl = process.env.orderSvcUrl
        orderSvcUrl = orderSvcUrl + `/add`
        return new Promise(function (resolve, reject) {
            try {
                axios.post(orderSvcUrl, data, {
                    headers: {
                        Accept: 'application/json'
                    }
                })
                    .then(response => {
                        console.log(response.data);
                        resolve(response.data)
                    })
                    .catch(error => {
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

    async getOrderHistory(userId) {
        let orderSvcUrl = process.env.orderSvcUrl
        orderSvcUrl = orderSvcUrl + `/getOrders?user_id=${userId}`
        return new Promise(function (resolve, reject) {
            try {
                axios.get(orderSvcUrl, {
                    headers: {
                        Accept: 'application/json'
                    }
                })
                    .then(response => {
                        console.log("In getOrderHistory: " + response.data);
                        resolve(response.data)
                    })
                    .catch(error => {
                        console.log(error);
                        let err_response = {
                            error: error
                        };
                        reject(err_response)
                    });
            }
            catch (e) {
                console.error(e)
                throw Error(e)
            }
        })
    }

}
module.exports = Service
