# User check wallet balance for order service.

This is a NodeJs application built using Express and EJS for managing user wallet.


## Installation

Import this project in any IDE.

Using [npm](https://www.npmjs.com/), install the depedencies by running following command:

```
npm install 
```

#### Adding environment variables
```
Add all the necessary env variables.
```

#### Running the project
```
npm start
```

## Usage

#### check wallet balance for order api


URI: /api/wallet/checkWalletBalanceForOrder

Method: POST

Request body:

```
{
    "userId":11,
    "amount": 502
}
```

response body:

```
{
{
    "eligibility": false || true
}
}
```
