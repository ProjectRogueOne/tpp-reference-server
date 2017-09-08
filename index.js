const port = process.env.PORT || 8003;
const { app } = require('./app');

app.listen(port);

console.log(' App listening on port ' + port);
