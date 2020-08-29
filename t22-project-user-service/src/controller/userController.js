const joi = require('joi')
const UserService = require('../service/userService.js')
const Service = require('../service/service.js')
const jwt = require('jsonwebtoken')

// Schema for user login
const userLoginSchema = joi.object().keys({

    // email is required
    email: joi.string().email().required(),

    // password is required
    password: joi.string().required(),

    // Security Question is required
    securityQuestion: joi.string().required(),

    // Security Answer is required
    securityAnswer: joi.string().required(),
});

// Schema for user login
const userRegisterSchema = joi.object().keys({

    // name is required
    name: joi.string().required(),

    // email is required
    email: joi.string().email().required(),

    // password is required
    password: joi.string().required(),

    // confirm password is required
    confirmPassword: joi.string().required(),

    // Security Question is required
    securityQuestion: joi.string().required(),

    // Security Answer is required
    securityAnswer: joi.string().required(),

});
// Controller class for handling user operation
class UserController {
    constructor() {
    }

    async validateUser(request, response) {
        try {
            // validating the user login body against the schema
            joi.validate(request.body, userLoginSchema, async (err, value) => {

                //If schema validation fails, send error response
                if (err) {
                    console.log(err)
                    var message = err;
                    response.render('error', { error: message });
                }
            });

            //If schema validation passes, proceed with the service call.

            let userObj = {
                email: request.body.email,
                password: request.body.password,
                securityQ: request.body.securityQuestion,
                securityA:  request.body.securityAnswer
            }

            let userService = new UserService()

            // Fetching the user
            let userDBObj = await userService.fetchUserWithEmail(userObj)

            if (!userDBObj) {
                throw Error(`Error in fetching the user: ${request.body.email}`)
            }

            console.log(`Performing first factor authentication for: ${userObj.email}`)
            // Validate password
            let isPasswordValid = await userService.validatePassword(userObj, userDBObj)
            if (!isPasswordValid)
                throw Error(`Cannot authenticate the username and password for: ${userObj.email}`)

            console.log(`Performing second factor authentication for: ${userObj.email}`)
            // Validate security question
            let isSecurityQValid = await userService.validateSecurityQ(userObj, userDBObj)
            if (!isSecurityQValid) {
                throw Error(`Invalid Security Question for: ${userObj.email}`)
            }
            // Validate security answer
            let isSecurityAValid = await userService.validateSecurityA(userObj, userDBObj)
            if (!isSecurityAValid) {
                throw Error(`Invalid Security Answer for: ${userObj.email}`)
            }

            // Get userId
            let userId = await userService.getUserByEmail(userObj.email)

            // Step - 3
            // store the user data in cookies
            response.clearCookie('email');
            response.clearCookie('userId');
            response.cookie('email', userObj.email);
            response.cookie('userId', userId);
            console.log('In validate user Cookies: ', request.cookies);

            let userSession = await userService.generateJWTToken(userDBObj)

            if (userSession) {
                console.log(`User: ${request.body.email} has been authenticated successfully. Redirecting the user.`)
                // console.log("This is userSession: " + userSession)

                // adding the JWT token in the cookie
                response.cookie('token', userSession.token, {
                    maxAge: 5*60*1000, // Lifetime
                })

                let itemService = new Service()
                let responseObj = await itemService.getAllItems()
                response.render('list', { items: responseObj });
            }
        } catch (e) {
            console.error(`Error in authenticating the user: ${request.body.email}`)
            console.error(e)
            response.render('error', { error: e });
        }
    }

    async registerUser(request, response) {

        try {
            // validating the user login body against the schema
            joi.validate(request.body, userRegisterSchema, async (err, value) => {

                //If schema validation fails, send error response
                if (err) {
                    console.log(err)
                    var message = err;
                    response.render('error', { error: message });
                }
            });

            //If schema validation passes, proceed with the service call.

            let userObj = {
                name: request.body.name,
                email: request.body.email,
                password: request.body.password,
                confirmPassword: request.body.confirmPassword,
                securityQuestion: request.body.securityQuestion,
                securityAnswer: request.body.securityAnswer,
            }

            let userService = new UserService()

            // Check if user already exist
            let userDBObj = await userService.isUserExist(userObj)

            if (!userDBObj) {
                throw Error(`User with email: ${request.body.email} already exist.\n
                Please try with a new email.`)
            }

            // Validate email
            let isEmailValid = await userService.validateEmail(userObj)
            if (!isEmailValid) {
                throw Error(`Email is not valid: ${request.body.email}`)
            }

            // Validate password
            let isPasswordValid = await userService.isPasswordvalid(userObj.password)
            if (!isPasswordValid) {
                throw Error(`Password is not valid`)
            }

            // Compare password
            let isConfirmPasswordValid = await userService
                .isConfirmPasswordValid(userObj.password, userObj.confirmPassword)
            if (!isConfirmPasswordValid) {
                throw Error(`Passwords do not match`)
            }

            // Register user
            let isRegistered = await userService
                .registerUser(userObj)

            // Get User Id
            let userId = await userService
                .getUserByEmail(userObj.email)

            let walletObj = {
                name: request.body.name,
                email: request.body.email,
                userId: userId,
                amount: 100
            }

            // Create user Wallet
            let isWalletCreated = await userService
                .createWallet(walletObj)


            response.render('registerSuccess', { success: request.body.name });
            // // Step - 3
            // // generate and manage the stored session
            // let userSession = await userService.generateJWTToken(userDBObj)

            // if (userSession) {
            //     console.log(`User: ${request.body.email} has been authenticated successfully. Redirecting the user.`)
            //     console.log(userSession)
            //
            //     // adding the JWT token in the cookie
            //     response.cookie('token', userSession.token, {
            //         maxAge: 5*60*1000, // Lifetime
            //     })
            //
            //     response.render('home', { success: request.body.email });
            // }
        } catch (e) {
            console.error(`Error in authenticating the user: ${request.body.email}`)
            console.error(e)
            response.render('error', { error: e });
        }
    }

    async logoutUser(request, response) {
        console.log('In logoutUser Cookies: ', request.cookies);
        response.clearCookie('email');
        response.clearCookie('userId');
        response.render('login', { success: `User has been logged out successfully.` });

        // try {
        //
        //     let userObj = {
        //         email: request.query.email,
        //     }
        //
        //     console.log(`Requesting service method logout for the user: ${userObj.email}`)
        //
        //     let authService = new UserService()
        //
        //     // Step -1           password: request.body.password
        //     // Fetch user with email id
        //     let userFromDB = await authService.fetchUserWithEmail(userObj)
        //
        //     if (!userFromDB) {
        //         throw Error(`Error in fetching the user: ${userObj.email}`)
        //     }
        //
        //     // Step -2
        //     // updating the user_session
        //     let invalidateUser = await authService.invalidateSession(userFromDB)
        //
        //     if (!invalidateUser) {
        //         throw Error(`Cannot logout the user ${userObj.email}`)
        //     }
        //     else {
        //
        //         // clearing the token in the cookie
        //         response.clearCookie('token')
        //         console.log(`User: ${userObj.email} has been logged out successfully. Redirecting the user.`)
        //         response.render('login', { success: invalidateUser });
        //     }
        // } catch (e) {
        //     console.error(`Error in logout for the user: ${request.body.email}`)
        //     console.error(e)
        //     response.render('error', { error: e });
        // }
    }
}

module.exports = UserController
