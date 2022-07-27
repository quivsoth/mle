var express = require("express");
var router = express.Router();
var Cart = require('../models/cart');

const db = require("./database");

/* Collections Page.                                    */
router.get('/collections', function (req, res, next) {
    (async function () {
        var messages = req.flash('info');
        const collections = await db.getCollections();
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

/* Products in Collection page.                         */        
router.get('/products/:collection', function (req, res, next) {
    (async function () {
        var messages = req.flash('info');
        //let collectionId = req.query.collectionId;
        let collectionId = req.params.collection;
        const products = await db.getProducts(collectionId);

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

/* Item/Product Detail View.                            */
router.get('/item/:collection/:item', function (req, res, next) {
    (async function () {
        var messages = req.flash('info');
        let collectionId = req.params.collection;
        let itemId = req.params.item;
 
        let inCart = false;
        if (req.session.hasOwnProperty('cart') && req.session.cart.items[itemId]) {
            inCart = true;
        }
        // if(req.session.cart.items[itemId]) inCart = true;
        const item = await db.getItem(itemId, collectionId);
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

/* Item/Product Detail View. JSON Object        */
router.post('/item/:collection/:item', async function (req, res, next) {
    let collectionId = req.params.collection;
    let itemId = req.params.item;
    const item = await db.getItem(itemId, collectionId);
    res.json(item);
});


/* Update item in collection                            */
router.put('/updateProduct/:collection/:item', function (req, res) {
    (async function () {
        console.log("Update Product");
        let itemId = parseInt(req.params.item);
        let collectionId = parseInt(req.params.collection);
        await db.updateItem(itemId, collectionId, req.body.productName, req.body.description, req.body.price, req.body.size, req.body.measurements, req.body.parcel, req.body.isActive);
        req.flash('info', 'Item # ' + itemId + 'has been updated');
        res.redirect('/item_admin/' + collectionId + '/' + itemId);
    })();
});

/* Add item to Shopping Cart.                           */ 
router.get('/addCart/:collection/:item', function (req, res, next) {
    (async function () {
        let productId = parseInt(req.params.item);
        let collectionId = parseInt(req.params.collection);
        var cart = new Cart(req.session.cart ? req.session.cart : {});
        const item = await db.getItem(productId, collectionId);
        cart.add(item.item, item.item.productId);
        req.session.cart = cart;
        res.redirect('/item/' + collectionId + '/' + productId);
    })();
});

/* Delete item in Shopping Cart                         */
router.get('/deleteCart/:item', function (req, res, next) {
    (async function () {
        let productId = req.params.item;
        var cart = new Cart(req.session.cart);
        cart.delete(productId);
        req.session.cart = cart;
        res.redirect('/shopping-cart',);
    })();
});

/* View Shopping Cart                                   */
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

/* Checkout of Shopping Cart                             */
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

/* View for Video page                                   */
router.get('/video', function (req, res, next) {
    var messages = req.flash('info');
    res.render('site/video', {title: 'Baja La Bruja - Fighting Fast Fashion'});
});

module.exports = router;