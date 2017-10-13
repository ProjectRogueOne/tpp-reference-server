# Sample TPP Server

This application simulates a typical TPP backend server. Its primary function is to provide Open Banking processes to a client.

## Use cases

__Work in progress__ - so far we provide use cases for:

* Authenticating with the server.
* List ASPSP Authorization and Resource Servers - actual & simulated based on ENVs.
* Transform client requests into backend ASPSP API requests.

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

Sample TPP server implemented using
[Node.js](https://nodejs.org/),
[express](https://github.com/expressjs/express),
and
[express-http-proxy](https://github.com/villadora/express-http-proxy).

## Installation

Install npm packages:

```sh
npm install
```

Install [redis](https://redis.io). On Mac OSX you can install via [homebrew](https://brew.sh):

```sh
brew install redis
```

If not installing via homebrew, you can get Redis
running on your host machine by using a docker instance
of it.  This works cross platform (e.g. Windows / Mac).
You'll need to have Docker installed and running; for the latest version go to https://www.docker.com/products/docker-toolbox

Once Docker is installed you can install the Docker Redis Instance through the [Kitematic](https://kitematic.com)
interface and set it to run.

Then set the environment variables `REDIS_PORT` and `REDIS_HOST` as per docker redis instance.

Install [mongodb](https://docs.mongodb.com/manual/). On Mac OSX you can install via
[homebrew](https://brew.sh):

```sh
brew install mongodb
```

Then set the environment variable `MONGODB_URI` as per your mongodb instance, e.g. `MONGODB_URI=mongodb://localhost:27017/sample-tpp-server`.

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
