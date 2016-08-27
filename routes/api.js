var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Welcome to our digiHealth Bot API.');
});

router.post('/try', function(req, res, next) {
  res.send('Welcome to our digiHealth Bot API.');
});

module.exports = router;