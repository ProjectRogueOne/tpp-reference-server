# Sample TPP Server

Sample TPP server implemented using
[Node.js](https://nodejs.org/) and
[express](https://github.com/expressjs/express).


## Testing

Run unit tests with:

```sh
npm run test
```

Run tests continuously on file changes in watch mode via:

```sh
npm run test:watch
```

### eslint

Run eslint checks with:

```sh
npm run eslint
```

## To configure

You need to set values for the environment variables in the
`.env.sample` file.

## To run

Install npm packages and run server as follows:

```sh
npm install
npm run start
```

## To test

To run eslint:

```sh
npm i -g eslint eslint-plugin-import eslint-config-airbnb-base
eslint .
```

## Deploy to heroku

To deploy to heroku for the first time from a Mac:

```sh
brew install heroku

heroku login

heroku create --region eu <newname>

heroku config:set ASPSP_READWRITE_HOST=example.com
heroku config:set AUTHORIZATION=<mock-token>
heroku config:set X_FAPI_FINANCIAL_ID=<mock-id>
heroku config:set DEBUG=error,log

git push heroku master
```

Edit `./Procfile` to change what command should be executed to start the app.
