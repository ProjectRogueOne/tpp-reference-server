# Sample TPP Server

This application simulates a typical TPP backend server. Its primary function is to provide Open Banking processes to a client.

The implementation uses
[Node.js](https://nodejs.org/),
[express](https://github.com/expressjs/express),
and
[express-http-proxy](https://github.com/villadora/express-http-proxy).

## Use cases

__Work in progress__ - so far we provide,

* Authenticating with the server.
* List ASPSP Authorization and Resource Servers - actual & simulated based on ENVs.
* Proxy requests for upstream backend [ASPSP Read/Write APIs](https://www.openbanking.org.uk/read-write-apis/).

### Authenticating with the server.

#### Login

```sh
curl -X POST --data 'u=alice&p=wonderland' http://localhost:8003/login
```

This returns a session ID token as a `sid`. Use this for further authorized access.

This is an example.

```sh
{
  "sid": "896beb20-affc-11e7-a5e6-a941c8c37252"
}
```

#### Logout

Please __change__ the `Authorization` header to use the `sid` obtained after login.

This destroys the session established by the `sid` token obtained after login.

```sh
curl -X GET -H 'Authorization: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' http://localhost:8003/logout
```

### List ASPSP Authorisation and Resource Servers

Please __change__ the `Authorization` header to use the `sid` obtained after logging in.

```sh
curl -X GET -H 'Authorization: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' http://localhost:8003/account-payment-service-provider-authorisation-servers
```

Here's a sample list of test ASPSPs as requested from the Open Banking Directory.

```sh
[
  {
    "id": "https://banka.api-bank.co.uk",
    "logoUri": "",
    "name": "Dev-Auth-Server",
    "orgId": "XXXXXXXXXXXXXXXXXX"
  },
  {
    "id": "http://MyAuth.co.uk",
    "logoUri": "http://MyAuth.co.uk",
    "name": "MyAuthServer",
    "orgId": "XXXXXXXXXXXXXXXXXX"
  },
  ....
]
```

### Proxy requests for upstream backend ASPSP APIs

__NOTE:__ For this to work you need an ASPSP server installed and running. Details in The [Read/Write API Mock Server](https://github.com/OpenBankingUK/sample-tpp-server/tree/es_cdrw-664_select_bank_dynamic#the-readwrite-api-mock-server ) section.

#### Proxied API path

To interact with proxied Open Banking Read/Write APIs please use the path `/open-banking/[api_version]` in all requests.

For example `/open-banking/v1.1` gives access to the 1.1 Read write Apis.

#### GET Accounts for a user (Account and Transaction API)

We have a hardcoded demo user `alice` with bank `abcbank` setup in [Read/Write API mock server](https://github.com/OpenBankingUK/readwrite-api-mock-server). To access demo accounts for this user please setup the following `ENVS` (already configured in [`.env.sample`](https://github.com/OpenBankingUK/sample-tpp-server/blob/master/.env.sample)).

* `AUTHORIZATION=alice`.
* `X_FAPI_FINANCIAL_ID=abcbank`.

```sh
curl -X GET -H 'Authorization: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' -H 'Accept: application/json'  http://localhost:8003/open-banking/v1.1/accounts
```

A sample response looks like this:

```sh
{
  "Data": [
    {
      "AccountId": "22289",
      "Currency": "GBP",
      "Nickname": "bills",
      "Account": {
        "SchemeName": "BBAN",
        "Identification": "10203345",
        "Name": "Ms Liddell",
        "SecondaryIdentification": "341267"
      },
      "Servicer": {
        "SchemeName": "UKSortCode",
        "Identification": "SC802001"
      }
    }
  ],
  "Links": {
    "Self": "/accounts"
  },
  "Meta": {
    "TotalPages": 1
  }
}
```

#### GET Product associated with an account (Account and Transaction API)

Using the same demo account as above.

```sh
curl -X GET -H 'Authorization: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' -H 'Accept: application/json'  http://localhost:8003/open-banking/v1.1/accounts/22289/product
```

A sample response looks like this:

```sh
{
  "Data": {
    "Product": [
      {
        "AccountId": "22289",
        "ProductIdentifier": "CC",
        "ProductType": "PCA",
        "ProductName": "321"
      }
    ]
  },
  "Links": {
    "Self": "/accounts/22289/product"
  },
  "Meta": {
    "TotalPages": 1
  }
}
```

#### GET Balances associated with an account (Account and Transaction API)

Using the same demo account as above.

```sh
curl -X GET -H 'Authorization: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' -H 'Accept: application/json'  http://localhost:8003/open-banking/v1.1/accounts/22289/balances
```

A sample request looks like this:

```sh
{
  "Data": {
    "Balance": [
      {
        "AccountId": "22289",
        "Amount": {
          "Amount": "1230.00",
          "Currency": "GBP"
        },
        "CreditDebitIndicator": "Credit",
        "Type": "InterimAvailable",
        "DateTime": "2017-04-05T10:43:07+00:00",
        "CreditLine": {
          "Included": true,
          "Amount": {
            "Amount": "1000.00",
            "Currency": "GBP"
          },
          "Type": "Pre-Agreed"
        }
      }
    ]
  },
  "Links": {
    "Self": "/accounts/22289/balances"
  },
  "Meta": {
    "TotalPages": 1
  }
}
```

## Installation

### Dependencies

#### NodeJS

We assume [NodeJS](https://nodejs.org/en/) ver8.4+ is installed.

On Mac OSX, use instructions here [Installing Node.js Tutorial](https://nodesource.com/blog/installing-nodejs-tutorial-mac-os-x/).

On Linux, use instructions in [How To Install Node.js On Linux](https://www.ostechnix.com/install-node-js-linux/).

On Windows, use instructions provided here [Installing Node.js Tutorial: Windows](https://nodesource.com/blog/installing-nodejs-tutorial-windows/).

#### Redis

On Mac OSX, you can install via [homebrew](https://brew.sh). Then.

```sh
brew install redis
```

On Linux, use instructions in the [Redis Quick Start guide](https://redis.io/topics/quickstart).

On Windows, use instructions provided here [Installing Redis on a Windows Workstation](https://essenceofcode.com/2015/03/18/installing-redis-on-a-windows-workstation/).

Then set the environment variables `REDIS_PORT` and `REDIS_HOST` as per redis instance. Example in [`.env.sample`](https://github.com/OpenBankingUK/sample-tpp-server/blob/master/.env.sample)

#### MongoDB

On Mac OSX, you can install via [homebrew](https://brew.sh). Then

```sh
brew install mongodb
```

On Linux, use instructions in the [Install MongoDB Community Edition on Linux](https://docs.mongodb.com/manual/administration/install-on-linux/).

On Windows, use instructions provided here [Install MongoDB Community Edition on Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/).

Then set the environment variable `MONGODB_URI` as per your mongodb instance, e.g. `MONGODB_URI=mongodb://localhost:27017/sample-tpp-server`. Example in [`.env.sample`](https://github.com/OpenBankingUK/sample-tpp-server/blob/master/.env.sample)

#### The Read/Write API mock server

We have a [Read/Write API mock server](https://github.com/OpenBankingUK/readwrite-api-mock-server) that provides simulated endpoints to showcase what the Read/Write API can provide. Please install and run the server as per instructions on the [Github page](https://github.com/OpenBankingUK/readwrite-api-mock-server).

Then ensure you point to the above server by configuring the `ASPSP_READWRITE_HOST` endpoint either directly or using in the [`.env.sample`](https://github.com/OpenBankingUK/sample-tpp-server/blob/master/.env.sample) file. Find details in the [To run locally](https://github.com/OpenBankingUK/sample-tpp-server#to-run-locally) section.

__NOTE__: The [Read/Write API mock server](https://github.com/OpenBankingUK/readwrite-api-mock-server) uses a [Swagger](http://swagger.io) file that documents the spec. This is stored in the mock server's `SWAGGER` ENV. To obtain this you have to setup another repo [account-info-api-spec](https://github.com/OpenBankingUK/account-info-api-spec). That repo's [README](https://github.com/OpenBankingUK/account-info-api-spec/blob/master/README.md) contains setup necessary details.

### Server setup

Install npm packages:

```sh
npm install
```

## To run locally

To run using .env file, make a local .env, and run using foreman:

```sh
cp .env.sample .env
npm run foreman
# [OKAY] Loaded ENV .env File as KEY=VALUE Format
# web.1 | log App listening on port 8003 ...
```

Or run with environment variables set on the command line:

```sh
DEBUG=error,log \
  ASPSP_READWRITE_HOST=localhost:8001 \
  OB_DIRECTORY_HOST=http://localhost:8001 \
  OB_DIRECTORY_ACCESS_TOKEN=example-token \
  AUTHORIZATION=alice \
  X_FAPI_FINANCIAL_ID=abcbank \
  MONGODB_URI=mongodb://localhost:27017/sample-tpp-server \
  PORT=8003 \
  npm start
#   log  App listening on port 8003 ...
```

Set debug log levels using `DEBUG` env var.
Set API host using `ASPSP_READWRITE_HOST` env var.
Set hardcoded auth token using `AUTHORIZATION` env var.
Set OB Directory host using `OB_DIRECTORY_HOST` env var.
Set OB Directory access_token using `OB_DIRECTORY_ACCESS_TOKEN` env var.
Set hardcoded x-fapi-financial-id using `X_FAPI_FINANCIAL_ID` env var.
Set the environment variables `REDIS_PORT` and `REDIS_HOST`
as per your redis instance.

## Deploy to heroku

To deploy to heroku for the first time:

```sh
npm install -g heroku-cli
```

To verify your CLI installation use the heroku --version command.

```sh
heroku --version
```

Setup application.

```sh
heroku login

heroku create --region eu <newname>

heroku addons:create redistogo # or any other redis add-on
heroku addons:create mongolab:sandbox

heroku config:set ASPSP_READWRITE_HOST=example.com
heroku config:set AUTHORIZATION=<mock-token>
heroku config:set X_FAPI_FINANCIAL_ID=<mock-id>
heroku config:set DEBUG=error,log
heroku config:set OB_DIRECTORY_HOST=http://example.com

git push heroku master
```

Edit `./Procfile` to change what command should be executed to start the app.

## Testing

Run unit tests with:

```sh
npm run test
```

Run tests continuously on file changes in watch mode via:

```sh
npm run test:watch
```


Manual Testing  
Sending Form Data to login with POstman - use `x-www-form-urlencoded`


### eslint

Run eslint checks with:

```sh
npm run eslint
```
