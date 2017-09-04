const express = require('express');
const router = express.Router();
const request = require('request');

const mainApp = require('../app/index.js');

router.get('/', function (req, res, next) {
  res.render('index', {title: 'Express'});
});

// router.get('/proxy/:name', mainApp.proxy);
router.get('/proxy/', mainApp.proxy);
router.post('/login/', mainApp.login);
router.get('/session/', mainApp.session);

module.exports = router;
