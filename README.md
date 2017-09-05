# Sample TPP Server

Sample TPP server implemented using
[Node.js](https://nodejs.org/) and
[express](https://github.com/expressjs/express).

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
heroku config:set X_FAPI_FINANICAL_ID=<mock-id>
heroku config:set DEBUG=error,log

git push heroku master
```

Edit `./Procfile` to change what command should be executed to start the app.
