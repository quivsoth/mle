const { createServer } = require('livereload');
const { registerHelper } = require('hbs');
const {MongoClient} = require('mongodb');
var mongoose = require("mongoose");

const uri = process.env.MONGO_DB;

var express = require('express');
var router = express.Router();

var Cart = require('../models/cart');
var Collection = require("../models/collection");
const { deserializeUser } = require('passport');

// var csrf = require('csurf');
// var csrfProtection = csrf();
// router.use(csrfProtection);

/*    Description: View for HOME page.
      Method: GET                     */
router.get('/', function(req, res, next) {
  res.render('shop/index', { title: 'Baja La Bruja - Fighting Fast Fashion'});
});

/*    Description: View for lifestyle page.
      Method: GET                     */
router.get('/lifestyle', function(req, res, next) {
  res.render('shop/lifestyle', { title: 'Baja La Bruja - F#$ck Fast Fashion'});
});

/*    Description: View for Gift page.
      Method: GET                     */
router.get('/gifts', function(req, res, next) {
  res.render('shop/gifts', { title: 'Baja La Bruja - Gifts'});
});

/*    Description: View for Contact page.
      Method: GET                     */
router.get('/contacts', function(req, res, next) {
  res.render('shop/contacts', { title: 'Baja La Bruja - Contact Us'});
});

/*    Description: View for Collections page.
      Method: GET                     */
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

/*      Description: Products in Collection page.
        Method: GET                    */
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
    res.render('shop/products', { title: 'Baja La Bruja - Products', products: productChunks, breadCrumb: products.collectionName, collectionId: collectionId });
  })();
});

/*      Description: Item/Product Detail View.
        Method: GET                     */
router.get('/item', function(req, res, next) {
  (async function() {
    let itemId = req.query.itemId;
    let collectionId = req.query.collectionId;
    let inCart = false;
    if (req.session.hasOwnProperty('cart') && req.session.cart.items[itemId]) {
      inCart = true;
    }
    // if(req.session.cart.items[itemId]) inCart = true;
    const item = await getItem(itemId, collectionId);
    res.render('shop/item', { title: 'Baja La Bruja - Items', item: item.item, collectionId: collectionId, collectionName: item.collectioName, inCart: inCart});
  })();
});

/*      Description: Item/Product Detail View.
        Method: GET                     */
router.get('/item_admin', function(req, res, next) {
  (async function() {
    let itemId = req.query.itemId;
    let collectionId = req.query.collectionId;
    let inCart = false;
    if (req.session.hasOwnProperty('cart') && req.session.cart.items[itemId]) {
      inCart = true;
    }
    const item = await getItem(itemId, collectionId);
    var messages = req.flash('info');
    res.render('shop/item_admin', { title: 'Baja La Bruja - Items', item: item.item, collectionId: collectionId, collectionName: item.collectioName, inCart: inCart, messages: messages, hasMessages: messages.length > 0});
  })();
});

/*      Description: Add item to Shopping Cart.
        Method: GET                            */
router.get('/addCart', function(req, res, next) {
  (async function() {
    let productId = req.query.productId;
    let collectionId = req.query.collectionId;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    const item = await getItem(productId, collectionId);
    cart.add(item.item, item.item.productId);
    req.session.cart = cart;
    res.redirect('/item?itemId=' + productId + "&collectionId="+collectionId);
  })();
});

/*      Description: Delete item in Shopping Cart.
        Method: GET                           */
router.get('/deleteCart', function(req, res, next) {
  (async function() {
    let productId = req.query.productId;
    var cart = new Cart(req.session.cart);
    cart.delete(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart', );
  })();
});

/*      Description: View Shopping Cart.
        Method: GET                           */
router.get('/shopping-cart', function(req, res, next) {
  (async function() {
    if(!req.session.cart) {
      return res.render('shop/shopping-cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    console.log(req.session.cart);
    res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
  })();
});

/*      Description: Checkout of Shopping Cart.
        Method: GET                           */
router.get('/checkout', function(req, res, next) {
  (async function() {
    if(!req.session.cart) {
      return res.render('shop/checkout', {products: null});
    }
    var cart = new Cart(req.session.cart);

    res.render('shop/checkout', {products: cart.generateArray(), totalPrice: cart.totalPrice});
  })();
});

/*      Description: Update item in collection
        Method: PUT                           */
router.put('/updateProduct/:collection/:id', function(req, res) {
  (async function() {
    let itemId = parseInt(req.params.id);
    let collectionId = parseInt(req.params.collection);
    await updateItem(itemId, collectionId, req.body.productName, req.body.description, req.body.price, req.body.size);
    req.flash('info', 'Item # ' + itemId + 'has been updated');
    res.redirect('/item_admin?itemId=' + itemId + "&collectionId="+collectionId);
  })();
});

module.exports = router;




// -*-*-*-*-*-*-*-*-*-*-*-*-* DB FUNCTIONS -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*//
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

async function getProducts(collectionId) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
      await client.connect();
      const cursor = await client.db("shop").collection("bruja").findOne({collectionId: Number(collectionId), active: true});
      return cursor;
  } catch (e) { console.error(e); }
  finally { await client.close(); }
}

async function getItem(productId, collectionId){
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
      await client.connect();
      var result = {};
      const cursor = await client.db("shop").collection("bruja").findOne({"collectionId": parseInt(collectionId)});
      result.collectioName = cursor.collectionName;
      let item = cursor.products.find(product => product.productId == productId);
      result.item = item;
      return result;
  } catch (e) { console.error(e); }
  finally { await client.close(); }
}

async function updateItem(productId, collectionId, productName, description, price, size) {
  var query = { collectionId : collectionId }; 

  var cr = Collection.findOne(query, function (err, product) {
    var p = product.products.filter(function (item) {
      return item.productId === productId;
    }).pop();
    p.description = productName;
    p.description = description;
    p.price = price;
    p.size = size;
    product.save();
  });
}