var express = require("express");
var router = express.Router();
var Cart = require('../models/cart');
// var Clothing = require("../models/collection");
var Collection = require("../models/collection");
const mongoose = require('mongoose');
const {MongoClient} = require('mongodb');
const uri = process.env.MONGO_DB;
const _ = require('lodash');


/*    Description: View for Viedo page.
      Method: GET                     */
router.get('/video', function (req, res, next) {
    var messages = req.flash('info');
    res.render('site/video', {title: 'Baja La Bruja - Fighting Fast Fashion'});
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


/*      Description: Update item in collection
        Method: PUT                           */
router.put('/updateProduct/:collection/:id', function (req, res) {
    (async function () {
        console.log("Update Product");
        let itemId = parseInt(req.params.id);
        let collectionId = parseInt(req.params.collection);
        await updateItem(itemId, collectionId, req.body.productName, req.body.description, req.body.price, req.body.size);
        req.flash('info', 'Item # ' + itemId + 'has been updated');
        res.redirect('/item_admin?itemId=' + itemId + "&collectionId=" + collectionId);
    })();
});

/*      Description: Delete Thumb in collection
        Method: PUT                           */
router.get('/deleteThumb/:collection/:productId/:thumb', async (req, res)=> {
    (async function () {

        let collectionId = req.params.collection;
        let productId = req.params.productId;
        let thumb = req.params.thumb;

        await deleteThumb(productId, collectionId, thumb);
        // req.flash('info', 'Item # ' + itemId + 'has been updated');
        // res.redirect('/item_admin?itemId=' + itemId + "&collectionId=" + collectionId);
        //res.send("Push");
    })();
});

/*    Description: View for lifestyle page.
      Method: GET                     */
      router.get('/apitester', function (req, res, next) {
        (async function () {
            let itemId = 21534;
            let collectionId = 5;
            // if(req.session.cart.items[itemId]) inCart = true;
            var result = await getItem2(itemId, collectionId);

            //todo render json
            //res.render()

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

// TEMP FUNCTION THIS IS USING MONGOOSE _ THIS WILL REPLACE IT ALL
async function getItem2(productId, collectionId) {
    var query = { collectionId: collectionId };
    var p;
    Collection.findOne(query, function (err, result) {
        if (err) {
            console.log(err);
        }
        p = result.products.filter(function (item) {
            return item.productId === productId;
        }).pop();
    });
    return p;
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

async function deleteThumb(productId, collectionId, thumb) {
    var query = { collectionId: collectionId, "products.productId": productId };

    console.log("collectionId : " + collectionId);
    console.log("productId : " + productId);
    console.log("thumb : " + thumb);

    Collection.findOne(query, function (err, result) {
        if (err) { console.log(err); }
        console.log(result);
    });

    /*
    Clothing.findOne(query, (err, result) => {
        if (err) { console.log(err); }
        // console.log(result);
        
    //    const items = category.products; //the array of items
    // console.log(items); //gives an array back
        const item = _.find(result, { productId: productId });
        console.log(item); //gives the value of 'undefined' for whatever reason

    //     var g;
    //     console.log(category);
    //    var p = category.products.filter(function (item) {
    //         return item.productId === productId;
    //     }).pop();

    //     console.log(p);
    });
    */
}