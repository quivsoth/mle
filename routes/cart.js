var express = require("express");
var router = express.Router();
var Cart = require('../models/cart');
const db = require("./database");

/* Add item to Shopping Cart.                           */ 
router.get('/addCart/:collection/:item', function (req, res, next) {
    (async function () {
        let productId = parseInt(req.params.item);
        let collectionId = parseInt(req.params.collection);
        var cart = new Cart(req.session.cart ? req.session.cart : {});
        const collection = await db.getCollections(collectionId);
        var item = collection.products.filter(function (item) {
            return item.productId === productId;
        }).pop();

       //const item = await db.getItem(productId, collectionId);
        cart.add(item, item.productId);
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

module.exports = router;