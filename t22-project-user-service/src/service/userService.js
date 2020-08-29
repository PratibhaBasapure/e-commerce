const mysqlConnection = require('../connection/db-connection.js')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs")
const axios = require('axios')
// Service class for handling user functions
class LoginService {

    constructor() {
    }

    async fetchUserWithEmail(userObj) {
        return new Promise(function (resolve, reject) {
            try {
                console.log(`Retrieving the user: ${userObj.email}`)

                // MySQL DB query
                let userQuery = 'SELECT * FROM user WHERE email = ?';

                // query execution
                mysqlConnection.query(userQuery, [userObj.email], async function (err, rows) {
                    if (err) {
                        console.error(err)
                        let err_response = {
                            error: `Error in finding the user email: ${userObj.email}. Please try again`,
                            messsage: err.sqlMessage
                        };

                        reject(err_response)
                    } else {

                        if (rows.length > 0) {
                            console.log(`User with email : ${userObj.email} is retrieved successfully.`)
                            console.log(rows[0])

                            const user = rows[0];
                            resolve(user)
                        }
                        else {
                            const error = {
                                message: `User: ${userObj.email} does not exists in the system.`
                            };
                            console.log(error)
                            reject(error)
                        }
                    }
                })
            }
            catch (e) {
                console.error(`Error in fetching the user: ${userObj.email}`)
                console.error(e)
                throw Error(e)
            }
        })
    }

    async isUserExist(userObj) {
        return new Promise(function (resolve, reject) {
            try {
                console.log(`Retrieving the user: ${userObj.email}`)

                // MySQL DB query
                let userQuery = 'SELECT * FROM user WHERE email = ?';

                // query execution
                mysqlConnection.query(userQuery, [userObj.email], async function (err, rows) {
                    if (err) {
                        console.error(err)
                        let err_response = {
                            error: `Error in finding the user email: ${userObj.email}. Please try again`,
                            messsage: err.sqlMessage
                        };

                        reject(err_response)
                    } else {

                        if (rows.length > 0) {
                            const error = {
                                message: `User: ${userObj.email} already exists in the system.`
                            };
                            console.log(rows[0])
                            const user = rows[0];
                            reject(error)
                        }
                        else {
                            console.log(`User: ${userObj.email} does not exists in the system.`)
                            resolve(true)
                        }
                    }
                })
            }
            catch (e) {
                console.error(`Error in fetching the user: ${userObj.email}`)
                console.error(e)
                throw Error(e)
            }
        })
    }

    async validateEmail(userObj) {
        var isEmailValid = false;
        var errorMessage = " Email id is not valid";
        if (userObj.email.length === 0)
            isEmailValid = false;
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userObj.email))
            isEmailValid = true;

        return new Promise(function (resolve, reject) {
            if (isEmailValid) {
                console.log(`${userObj.email} is a valid email`)
                resolve(true)
            }
            else {
                var error = {
                    message : errorMessage
                }
                console.log(error)
                reject(error)
            }
        })
    }

    async isPasswordvalid(password) {
        var isPasswordValid = false;
        var errorMessage = ""
        if (/(?=.{6,})/.test(password) === false) {
            isPasswordValid = false;
            errorMessage += "Password must be at least 6 characters long."
        }
        else if (/(?=.*[a-z])/.test(password) === false) {
            isPasswordValid = false;
            errorMessage += "\nPassword must contain at least 1 lowercase character."
        }
        else if (/(?=.*[A-Z])/.test(password) === false) {
            isPasswordValid = false;
            errorMessage += "\nPassword must contain at least 1 uppercase character."
        }
        else if (/(?=.*[!@#\$%\^&\*])/.test(password) === false) {
            isPasswordValid = false;
            errorMessage += "\nPassword must contain at least one special character."
        }
        else {
            isPasswordValid = true;
        }

        return new Promise(function (resolve, reject) {
            if (isPasswordValid) {
                console.log(`Password is valid`)
                resolve(true)
            }
            else {
                var error = {
                    message : errorMessage
                }
                console.log(error)
                reject(error)
            }
        })
    }

    async isConfirmPasswordValid(password, confirmPassword) {
        var isPassMatched = password === confirmPassword

        return new Promise(function (resolve, reject) {
            if (isPassMatched) {
                console.log(`Password matched!`)
                resolve(true)
            }
            else {
                var error = {
                    message : `Passwords do not match`
                }
                console.log(error)
                reject(error)
            }
        })
    }

    async registerUser(userObj) {
        var userId
        // MySQL DB query
        let sqlInsert = "INSERT INTO user SET ?";
        return new Promise(function (resolve, reject) {
            let unHashesPassword = userObj.password;
            bcrypt.hash(unHashesPassword, 10, function (err, hash) {
                let values = {
                    name: userObj.name,
                    email: userObj.email,
                    password: hash,
                    securityQ: userObj.securityQuestion,
                    securityA: userObj.securityAnswer,
                    userState: false,
                }
                mysqlConnection.query(sqlInsert, values, async function (err, rows) {
                    if (err) {
                        console.error(err)
                        let err_response = {
                            error: `Error in registering the user`,
                            messsage: err.sqlMessage
                        };
                        reject(err_response)
                    } else {
                        console.log(`User: ${userObj.email} successfully registered.`)
                        resolve(rows)
                    }
                });
            });
        })
    }

    async getUserByEmail (email)  {
        return new Promise(function (resolve, reject) {
            let where = "email = ?";
            let sqlSelect = "SELECT * FROM user WHERE " + where;
            mysqlConnection.query(sqlSelect, email, async function (err, result) {
                if (err) {
                    console.log(err);
                    let err_response = {
                        error: `Error in getting the user`,
                        messsage: err.sqlMessage
                    };
                    reject(err_response)
                } else if (result.length === 0) {
                    console.log("Email Id is not registered");
                    let err_response = {
                        error: `User not found`,
                    };
                    reject(err_response)
                } else {
                    console.log(result);
                    let userId = result[0].user_id;
                    console.log("This is userid: " + userId);
                    resolve(userId);
                }
            });
        })
    }

    async createWallet(walletObj) {
        // let createWalletURL =  "http://wallet-svc.us-east-1.elasticbeanstalk.com/wallet/add";
        let walletSvcUrl = process.env.walletSvcUrl
        walletSvcUrl = walletSvcUrl + `/add`
        return new Promise(function (resolve, reject) {
            try {
                axios.post(walletSvcUrl, walletObj, {
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

    async validatePassword(request, user) {
        return new Promise(function (resolve, reject) {
            // Check the password using the bcrypt unhashing
            bcrypt.compare(request.password, user.password).then((isMatch) => {
                if (isMatch) {
                    console.log("matched!");
                    console.log(`User with email : ${request.email} password matches in the system`)
                    resolve(true)
                } else {
                    console.log("lol");
                    var error = {
                        message : `EmailID or password is incorrect. Please try again.`
                    }
                    console.log(error)
                    reject(error)
                }
            });
        })
    }

    async validateSecurityQ(request, user) {
        return new Promise(function (resolve, reject) {
            console.log(request.securityQ)
            console.log(user.securityQ)
            const isSQValid = request.securityQ === user.securityQ;
            if (isSQValid) {
                console.log("matched!");
                resolve(true)
            } else {
                console.log("Invalid Security Question");
                var error = {
                    message : `Invalid Security Question. Please try again.`
                }
                console.log(error)
                reject(error)
            }
        })
    }

    async validateSecurityA(request, user) {
        return new Promise(function (resolve, reject) {
            console.log(request.securityA)
            console.log(user.securityA)

            const isSAValid = request.securityA === user.securityA;
            if (isSAValid) {
                console.log("matched!");
                resolve(true)
            } else {
                console.log("Invalid Security Answer");
                const error = {
                    message: `Invalid Security Answer. Please try again.`
                };
                console.log(error)
                reject(error)
            }
        })
    }

    async generateJWTToken(user) {
        return new Promise(function (resolve, reject) {
            try {
                // generate JWT TokenSecret
                const tokenSecret = user.password;
                console.log('tokenSecret: ' + tokenSecret)

                // generating the JWT token
                const accessToken = jwt.sign({ username: user.email }, tokenSecret)
                console.log('accessToken: ' + accessToken)

                var res = {
                    'message': 'Login successfull! Please click on the button to continue.',
                    'user_id': user.email,
                    'token': accessToken
                }
                resolve(res)
            } catch (e) {
                console.error(`Error in generating the user token`)
                console.error(e)
                throw Error(e)
            }
        })

    }
}
module.exports = LoginService
