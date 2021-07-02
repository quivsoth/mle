var express = require('express');
var router = express.Router();
const {MongoClient} = require('mongodb');
const uri = `mongodb://192.168.1.3:27017`;

/* GET home page. */
router.get('/s', function(req, res, next) {
  res.render('s', { title: 'da tank'});
});

router.get('/', function(req, res, next) {
  res.render('shop/index', { title: 'Baja La Bruja - Fighting Fast Fashion'});
});

router.get('/lifestyle', function(req, res, next) {
  res.render('shop/lifestyle', { title: 'Baja La Bruja - F#$ck Fast Fashion'});
});

router.get('/gifts', function(req, res, next) {
  res.render('shop/gifts', { title: 'Baja La Bruja - Gifts'});
});

router.get('/contacts', function(req, res, next) {
  res.render('shop/contacts', { title: 'Baja La Bruja - Contact Us'});
});

/* GET Collections page. */
router.get('/collections', function(req, res, next) {
  (async function() {
    const collections = await getCollections();
    var productChunks = [];
    var chunkSize = 5;
    for (let i = 0; i < collections.length; i+= chunkSize) {
      productChunks.push(collections.slice(i, i + chunkSize));
    }
    res.render('shop/collections', { title: 'Baja La Bruja - Collections', collections: productChunks });
  })();
});

/* GET Products in Collection page. */
router.get('/products', function(req, res, next) {
  (async function() {
    let collectionId = req.query.collectionId;
    const products = await getProducts(collectionId);

    var activeProducts = [];
    for (let i = 0; i < products.products.length; i++) {
      if(products.products[i].active === true) activeProducts.push(products.products[i]);
    }

    var productChunks = [];
    var chunkSize = 5;
    for (let i = 0; i < activeProducts.length; i+= chunkSize) {
      productChunks.push(activeProducts.slice(i, i + chunkSize));
    }
    res.render('shop/products', { title: 'Baja La Bruja - Products', products: productChunks, breadCrumb: products.collectionName });
  })();
});

/* GET Product Detail page. */
router.get('/item', function(req, res, next) {
  (async function() {
    let itemId = req.query.itemId;
    const item = await getItem(itemId);
    res.render('shop/item', { title: 'Baja La Bruja - Items', item: item});
  })();
});


//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*


async function getCollections(){
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
      await client.connect();
      const cursor = client.db("shop").collection("bruja").find({active: true}).sort({collectionId:1});
      const results = await cursor.toArray();
      return results;
  } catch (e) { console.error(e); }
  finally { await client.close(); }
}

async function getProducts(collectionId){
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
      await client.connect();
      const cursor = await client.db("shop").collection("bruja").findOne({collectionId: Number(collectionId), active: true});
      // const results = await cursor.toArray();
      // console.log("results: " + JSON.stringify(cursor));
      return cursor;
  } catch (e) { console.error(e); }
  finally { await client.close(); }
}

async function getItem(productId){
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
      await client.connect();
      const cursor = await client.db("shop").collection("products").findOne({productId: Number(productId), active: true});
      return cursor;
  } catch (e) { console.error(e); }
  finally { await client.close(); }
}

module.exports = router;