const express = require('express');
const router = express.Router();
// const request = require('request');

router.get('/', function (req, res, next) {
  res.send(204);
});

module.exports = router;