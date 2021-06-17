var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('shop/index', { title: 'Baja La Bruja - ' });
});


/* GET home page. */
router.get('/collections', function(req, res, next) {
  res.render('shop/collections', { title: 'Baja La Bruja - Collections' });
});



module.exports = router;