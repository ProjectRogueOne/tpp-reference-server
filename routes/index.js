const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.sendStatus(204);
});

module.exports = router;
