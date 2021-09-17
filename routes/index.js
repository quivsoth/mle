const { registerHelper } = require('hbs');
const {MongoClient} = require('mongodb');
const uri = process.env.DB_HOST;

var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');


var mongoose = require("mongoose");
var Collection = require("../models/collection");
var Product = require("../models/collection");
const { findOneAndUpdate } = require('../models/collection');



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

/*      Description: Add item to Shopping Cart.
        Method: GET                            */
router.get('/addCart', function(req, res, next) {
  (async function() {
    // var productId = req.params.id;
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
    console.log("delete cart");
    // var productId = req.params.id;
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
router.put('/updateProduct/:id', function(req, res) {



  (async function() {
    let itemId = req.params.id;
    // let collectionId = 1;
    await updateItem(itemId, 1);
    // console.log(item);



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



async function updateItem(productId, collectionId){
  console.log("Calling Update Item");

  var query = { collectionId : 1 };


  var collections = Collection.findOne(query, function(err, result) {
    if(err) { console.log(err); }
    console.log("\n\n\n\n-------");
    objIndex = result.products.findIndex((obj => obj.productId == 8192));

    var product = result.products[objIndex].productId;
    const update = { description: "Larry" };

    Collection.findOneAndUpdate(product, update);


  });


  // var c = Collection.findOneAndUpdate(
  // { query },
  //   function(err, result) {
  //     if(err) { console.log(err); }
  //     console.log("result | " + result);
  // });




//   Folder.findOneAndUpdate(
//     { "_id": folderId, "permissions._id": permission._id },
//     {
//         "$set": {
//             "permissions.$.role": permission.role
//         }
//     },
//     function(err,doc) {
//     }
// );



  // var collections = Collection.find(query, function(err, result) {
  //   if(err) {console.log(err);}
  //   var product = result.map(function (result) { return result.products });
  //   Product.find({product: {$in: product}}, function (err, items) {
  //     if(err) {console.log(err);}

  //     result.forEach(function (user) {
  //       result.items = items.filter(function (item) {
  //         // return item.user_id === user._id;
  //       });
  //     });

  //   });
  // });



  // console.log(collections);

  // var c = new Collection({
  //   collectionId: 999,
  //   collectionName: "Not a real collection",
  //   image: "image.jpg",
  //   description: "dummy description",
  //   active: false,
  //   products: []
  // })

  // c.save(function(err, result){
  //   if (err) throw err;
  //   console.log("1 document updated : " + result);
  // });






  // const client = new MongoClient(uri, { useUnifiedTopology: true });
  // try {
  //     await client.connect();

  //     var query = { collectionId : collectionId };
  //     var newvalues = { $set: { description : "Mickey"} };

  //     await client.db("shop").collection("bruja").updateOne(query, newvalues, function(err, res) {
  //          if (err) throw err;
  //          console.log(res);
  //          console.log("1 document updated");
  //       });

  //     // var result = {};
  //     // const cursor = await client.db("shop").collection("bruja").findOne({"collectionId": parseInt(collectionId)});
  //     // // result.collectioName = cursor.collectionName;
  //     // let item = cursor.products.find(product => product.productId == productId);



  //     // await cursor.updateOne(query, newvalues, function(err, res) {
  //     //   if (err) throw err;
  //     //   console.log("1 document updated");
  //     // });
  //     // console.log(item);

  //     // result.item = item;
  //     // return result;
  // } catch (e) { console.error(e); }
  // finally { await client.close(); }
}

// async function updateItem(productId){
//   console.log("Async Update Item called : " + productId);
//   const client = new MongoClient(uri, { useUnifiedTopology: true });
//   try {
//       await client.connect();

//       var match = {
//         // $unwind : "$products",
//         $match: { "collectionId": 1 },
//         $group: {
//         "collectionId": "$collectionId"
//         }
//       }
//       // const pipeline = [{
//       //     "$unwind" : "$products",
//       //     "$match": { "products.productId": 35537 },
//       //     "$project" : {"_id" : 0,
//       //       "id" : "$products.productId",
//       //       "name" : "$products.productName",
//       //       "description" : "$products.description"}
//       //   }];

//       var query = { collectionId: 10, "$products.productId" : 35537 };
//       await client.db("shop").collection("bruja").find(query).toArray(function(err, res) {
//         if (err) throw err;
//         console.log(res);
//       });

//       var myquery = { collectionId : 10 };
//       var newvalues = { $set: { description : "Mickey"} };

//       // const result = await collection.updateOne(filter, updateDocument);
//       // await client.db("shop").collection("bruja").updateOne(pipeline, newvalues, function(err, res) {
//       //   if (err) throw err;
//       //   console.log("1 document updated");
//       // });

//       // const cursor = await client.db("shop").collection("bruja").aggregate(match).toArray();
//       // console.log(cursor[0]);
//       // for await (const doc of cursor) {
//       //      console.log(doc);
//       //  }

//       // return cursor;

//   } catch (e) {
//     console.log("there was an error with this request: " + e);
//     console.error(e);
//   }
//   finally {
//     // await client.close();
//   }
// }