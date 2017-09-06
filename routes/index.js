const express = require('express');

const router = express.Router();
// const request = require('request');

router.get('/', (req, res) => {
  res.send(204);
});

module.exports = router;
