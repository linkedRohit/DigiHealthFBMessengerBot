var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Welcome to our digiHealth Bot API.');
});

router.post('/try', function(req, res, next) {
  res.send('Welcome to our digiHealth Bot API.');
});

router.get('/privacy', function(req, res, next) {
  res.send('Your data is secure with us and trust us we are not sharing it with anybody.');
});

module.exports = router;