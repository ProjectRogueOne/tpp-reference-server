# Sample TPP Server

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

To deploy to heroku for the first time from a Mac:

```sh
brew install heroku

heroku login

heroku create --region eu <newname>

heroku addons:create redistogo # or any other redis add-on

heroku config:set ASPSP_READWRITE_HOST=example.com
heroku config:set AUTHORIZATION=<mock-token>
heroku config:set X_FAPI_FINANCIAL_ID=<mock-id>
heroku config:set DEBUG=error,log

git push heroku master
```

Edit `./Procfile` to change what command should be executed to start the app.
