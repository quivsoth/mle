const {createServer} = require('livereload');
const https = require('https');
const request = require('request');
const {registerHelper} = require('hbs');
const {MongoClient} = require('mongodb');
const uri = process.env.MONGO_DB;

var express = require('express');
var router = express.Router();

var Cart = require('../models/cart');
var Collection = require("../models/collection");
var Subscriber = require("../models/subscriber");

const {deserializeUser} = require('passport');


// var csrf = require('csurf');
// var csrfProtection = csrf();
// router.use(csrfProtection);


router.get('/sp', function (req, res, next) {
    res.render("site/scratchpad");
});


/*    Description: View for HOME page.
      Method: GET                     */
router.get('/', function (req, res, next) {
  var messages = req.flash('info');
  res.render('site/index', {title: 'Baja La Bruja - Fighting Fast Fashion', 
    messages: messages,
    hasMessages: messages.length > 0});
});

/*    Description: Shipping Home Page
      Method: GET                     */
router.get('/shipping', function (req, res, next) {
var messages = req.flash('info');
res.render('site/shipping', {title: 'Baja La Bruja - Shipping', 
    messages: messages,
    hasMessages: messages.length > 0});
});

/*    Description: Shipping Calculator
      Method: GET                     */
router.get('/calculator', function (req, res, next) {
    (async function () {
        var messages = req.flash('info');
        var request = require('request');
        var cost = 0, deliveryTime, service;
        var length, width, height, weight, postCodeFrom, postCodeTo;
        var service_code = "AUS_PARCEL_REGULAR";

        length = req.body.length;
        width = req.body.width;
        height = req.body.height;
        weight =req.body.weight;
        postCodeFrom = req.body.postCodeFrom
        postCodeTo = req.body.postCodeTo;

        const australiaPostAPI = new URL("http://digitalapi.auspost.com.au/postage/parcel/domestic/calculate.json");
        australiaPostAPI.searchParams.append("length", length);
        australiaPostAPI.searchParams.append("width", width);
        australiaPostAPI.searchParams.append("height", height);
        australiaPostAPI.searchParams.append("weight", weight);
        australiaPostAPI.searchParams.append("from_postcode", postCodeFrom);
        australiaPostAPI.searchParams.append("to_postcode", postCodeTo);
        australiaPostAPI.searchParams.append("service_code", service_code);

        var options = {
            'method': 'POST',
            'url': australiaPostAPI.href,
            'headers': {
                'AUTH-KEY': 'e093c2e3-d6c1-4cc7-ad2f-a85147dc3d05'
            },
            followAllRedirects: true
        };

        request(options, function (error, response) {
            if (error) throw new Error(error);
            var g = JSON.parse(response.body, (key, value) => {
                if(key == 'total_cost') { cost = value }
                if(key == 'delivery_time') { deliveryTime = value }
                if(key == 'service') { service = value }
                // console.log(key); // log the current property name, the last is "".
                return value;     // return the unchanged property value.
            });

            res.render('site/shipping', {title: 'Baja La Bruja - Shipping', 
                messages: messages,
                cost: cost,
                deliveryTime: deliveryTime,
                service: service,
                postCodeFrom: postCodeFrom,
                postCodeTo: postCodeTo,
                hasCost: cost.length > 0,
                hasMessages: messages.length > 0
            });
        });
    })();
});



/*    Description: View for lifestyle page.
      Method: GET                     */
router.get('/lifestyle', function (req, res, next) {
    var messages = req.flash('info');  
    res.render('site/lifestyle', {title: 'Baja La Bruja - F#$ck Fast Fashion', messages: messages,
    hasMessages: messages.length > 0});
});

/*    Description: View for mixed media page.
      Method: GET                     */
router.get('/mixedmedia', function (req, res, next) {
  var messages = req.flash('info');  
  res.render('site/mixedmedia', {title: 'Baja La Bruja - Mixed Media', messages: messages,
    hasMessages: messages.length > 0});
});

/*    Description: View for Gift page.
      Method: GET                     */
router.get('/gifts', function (req, res, next) {
  var messages = req.flash('info');
  res.render('site/gifts', {title: 'Baja La Bruja - Gifts', messages: messages,
  hasMessages: messages.length > 0});
});

/*    Description: View for La Bruja page.
      Method: GET                     */
router.get('/labruja', function (req, res, next) {
    var messages = req.flash('info');
    res.render('site/labruja', {title: 'Baja La Bruja - La Bruja', messages: messages,
    hasMessages: messages.length > 0});
});

/*    Description: View for heritage page.
      Method: GET                     */
router.get('/heritage', function (req, res, next) {
  var messages = req.flash('info');
    res.render('site/heritage', {title: 'Baja La Bruja - La Bruja', messages: messages,
    hasMessages: messages.length > 0});
});

/*    Description: View for Contact page.
      Method: GET                     */
router.get('/contacts', function (req, res, next) {
  var messages = req.flash('info');
    res.render('site/contacts', {title: 'Baja La Bruja - Contact Us', messages: messages,
    hasMessages: messages.length > 0});
});

/*    Description: View for Collections page.
      Method: GET                     */
router.get('/collections', function (req, res, next) {
    (async function () {
      var messages = req.flash('info');
        const collections = await getCollections();
        var productChunks = [];
        var chunkSize = 5;
        for (let i = 0; i < collections.length; i += chunkSize) {
            productChunks.push(collections.slice(i, i + chunkSize));
        }
        res.render('shop/collections', {
            title: 'Baja La Bruja - Collections',
            collections: productChunks,
            messages: messages,
            hasMessages: messages.length > 0
        });
    })();
});

/*      Description: Products in Collection page.
        Method: GET                    */
router.get('/products', function (req, res, next) {
    (async function () {
      var messages = req.flash('info');
        let collectionId = req.query.collectionId;
        const products = await getProducts(collectionId);

        var activeProducts = [];
        for (let i = 0; i < products.products.length; i++) {
            if (products.products[i].active === true) 
                activeProducts.push(products.products[i]);            
        }

        var productChunks = [];
        var chunkSize = 5;
        for (let i = 0; i < activeProducts.length; i += chunkSize) {
            productChunks.push(activeProducts.slice(i, i + chunkSize));
        }
        res.render('shop/products', {
            title: 'Baja La Bruja - Products',
            products: productChunks,
            breadCrumb: products.collectionName,
            collectionId: collectionId,
            messages: messages,
            hasMessages: messages.length > 0
        });
    })();
});

/*      Description: Item/Product Detail View.
        Method: GET                     */
router.get('/item', function (req, res, next) {
    (async function () {
      var messages = req.flash('info');
        let itemId = req.query.itemId;
        let collectionId = req.query.collectionId;
        let inCart = false;
        if (req.session.hasOwnProperty('cart') && req.session.cart.items[itemId]) {
            inCart = true;
        }
        // if(req.session.cart.items[itemId]) inCart = true;
        const item = await getItem(itemId, collectionId);
        res.render('shop/item', {
            title: 'Baja La Bruja - Items',
            item: item.item,
            collectionId: collectionId,
            collectionName: item.collectioName,
            inCart: inCart,
            messages: messages,
            hasMessages: messages.length > 0 
        });
    })();
});

/*      Description: Item/Product Detail View.
        Method: GET                     */
router.get('/item_admin', function (req, res, next) {
    (async function () {
      var messages = req.flash('info');
        let itemId = req.query.itemId;
        let collectionId = req.query.collectionId;
        let inCart = false;
        if (req.session.hasOwnProperty('cart') && req.session.cart.items[itemId]) {
            inCart = true;
        }
        const item = await getItem(itemId, collectionId);
        var messages = req.flash('info');
        res.render('shop/item_admin', {
            title: 'Baja La Bruja - Items',
            item: item.item,
            collectionId: collectionId,
            collectionName: item.collectioName,
            inCart: inCart,
            messages: messages,
            hasMessages: messages.length > 0
        });
    })();
});

/*      Description: Add item to Shopping Cart.
        Method: GET                            */
router.get('/addCart', function (req, res, next) {
    (async function () {
        let productId = req.query.productId;
        let collectionId = req.query.collectionId;
        var cart = new Cart(req.session.cart ? req.session.cart : {});
        const item = await getItem(productId, collectionId);
        cart.add(item.item, item.item.productId);
        req.session.cart = cart;
        res.redirect('/item?itemId=' + productId + "&collectionId=" + collectionId);
    })();
});

/*      Description: Delete item in Shopping Cart.
        Method: GET                           */
router.get('/deleteCart', function (req, res, next) {
    (async function () {
      let productId = req.query.productId;
      var cart = new Cart(req.session.cart);
      cart.delete(productId);
      req.session.cart = cart;
      res.redirect('/shopping-cart',);
    })();
});

/*      Description: View Shopping Cart.
        Method: GET                           */
router.get('/shopping-cart', function (req, res, next) {
    (async function () {
      var messages = req.flash('info');
        if (! req.session.cart) {
            return res.render('shop/shopping-cart', {products: null});
        }
        var cart = new Cart(req.session.cart);
        console.log(req.session.cart);
        res.render('shop/shopping-cart', {
            products: cart.generateArray(),
            totalPrice: cart.totalPrice,
            messages: messages,
            hasMessages: messages.length > 0
        });
    })();
});

/*      Description: Checkout of Shopping Cart.
        Method: GET                           */
router.get('/checkout', function (req, res, next) {
    (async function () {
        if (! req.session.cart) {
            return res.render('shop/checkout', {products: null});
        }
        var cart = new Cart(req.session.cart);
        var messages = req.flash('info');
        res.render('shop/checkout', {
            products: cart.generateArray(),
            totalPrice: cart.totalPrice,
            messages: messages,
            hasMessages: messages.length > 0
        });
    })();
});

/*      Description: Checkout of Shopping Cart.
        Method: GET                           */
        router.get('/subscribers', function (req, res, next) {
          (async function () {
            const all = await Subscriber.find();
            var emails = [];
            for (let i = 0; i < all.length; i++) {
              emails.push(all[i].email);            
            }
            res.render('site/subscribers', {subscribers: emails});
          })();
      });
      

/*      Description: Update item in collection
        Method: PUT                           */
router.put('/updateProduct/:collection/:id', function (req, res) {
    (async function () {
        let itemId = parseInt(req.params.id);
        let collectionId = parseInt(req.params.collection);
        await updateItem(itemId, collectionId, req.body.productName, req.body.description, req.body.price, req.body.size);
        req.flash('info', 'Item # ' + itemId + 'has been updated');
        res.redirect('/item_admin?itemId=' + itemId + "&collectionId=" + collectionId);
    })();
});

/*      Description: Add email to subscription list
        Method: PUT                           */
router.put('/emailSubscribe', function (req, res) {
  (async function () {
    var emailAddress = req.body.email;    
    const doc = new Subscriber({
      email: emailAddress
    });

    await doc.save();
  
    req.flash('info', 'Thank you for subscribing!');
    var referrer = req.headers['referer'];
    res.redirect(referrer);
  })();
});

module.exports = router;

// -*-*-*-*-*-*-*-*-*-*-*-*-* DB FUNCTIONS -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*//
async function getCollections() {
    const client = new MongoClient(uri, {useUnifiedTopology: true});
    try {
        await client.connect();
        const cursor = client.db("shop").collection("bruja").find({active: true}).sort({collectionId: 1});
        const results = await cursor.toArray();
        return results;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function getProducts(collectionId) {
    const client = new MongoClient(uri, {useUnifiedTopology: true});
    try {
        await client.connect();
        const cursor = await client.db("shop").collection("bruja").findOne({collectionId: Number(collectionId), active: true});
        return cursor;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function getItem(productId, collectionId) {
    const client = new MongoClient(uri, {useUnifiedTopology: true});
    try {
        await client.connect();
        var result = {};
        const cursor = await client.db("shop").collection("bruja").findOne({"collectionId": parseInt(collectionId)});
        result.collectioName = cursor.collectionName;
        let item = cursor.products.find(product => product.productId == productId);
        result.item = item;
        return result;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function updateItem(productId, collectionId, productName, description, price, size) {
    var query = {
        collectionId: collectionId
    };
    Collection.findOne(query, function (err, result) {
        if (err) {
            console.log(err);
        }
        var p = result.products.filter(function (item) {
            return item.productId === productId;
        }).pop();
        p.productName = productName;
        p.description = description;
        p.price = price;
        p.size = size;
        result.save();
    });
}