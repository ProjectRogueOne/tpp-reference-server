# Sample TPP Server

Sample TPP server implemented using
[Node.js](https://nodejs.org/) and
[express](https://github.com/expressjs/express).

## To run

Install npm packages and run server as follows:

```sh
npm install
npm run start
```

## Deploy to heroku

To deploy to heroku for the first time from a Mac:

```sh
brew install heroku

heroku login

heroku create --region eu <newname>

git push heroku master
```

Edit `./Procfile` to change what command should be executed to start the app.
