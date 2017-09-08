# Sample TPP Server

Sample TPP server implemented using
[Node.js](https://nodejs.org/) and
[express](https://github.com/expressjs/express).


## Testing

To run the tests run `npm run test`  
The cookie test will fail unless you set localhost in you hosts file to an example domain (cookies need at least two ..s in the domain name to work) 
I've used *app.localhost.example*

### eslint

To run `eslint` locally make sure you have both eslint and 
eslint-config-airbnb installed globally  
`npm install -g eslint`  
`npm install -g eslint-config-airbnb`
`npm install -g eslint-config-airbnb-base` 
`npm install -g eslint-plugin-import` 

There are still issues getting eslint to work - airbnb cbase commented out for 
the moment as it produces a dependency hell 



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
