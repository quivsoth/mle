var express = require('express');
var router = express.Router();
var Collection = require('../models/collections');



/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('getting');
  Collection.find(function(err, docs) {
      console.log('found!  : ' + docs);

  });
  var collection101  = Collection.find();
  res.render('shop/index', { title: 'Baja La Bruja - ', collections: collection101 });
});


/* GET home page. */
router.get('/collections', function(req, res, next) {
  var collections = Collection.find();
  res.render('shop/collections', { title: 'Baja La Bruja - Collections', collections: collections });
});



module.exports = router;