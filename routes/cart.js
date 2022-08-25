var express = require("express");
var router = express.Router();
var Cart = require('../models/cart');
const db = require("./database");

/* Add item to Shopping Cart.                           */ 
router.put('/addCart/:product', function (req, res, next) {
    (async function () {
        let productId = parseInt(req.params.product);
        var cart = new Cart(req.session.cart ? req.session.cart : {});
        const product = await db.getProductByProductId(productId);
        cart.add(product, product.productId);
        req.session.cart = cart;
        res.json(cart.generateArray());
    })();
});

/* Delete item in Shopping Cart                         */
router.delete('/deleteCart', function (req, res, next) {
    (async function () {
        try {
            let productId = req.body.productId;
            var cart = new Cart(req.session.cart);
            cart.delete(productId);
            req.session.cart = cart;
            res.json(cart.generateArray());
        }
        catch(error) {
            console.log(error);
            res.json("ERROR: " + error);
        }
    })();
});

/* View Shopping Cart                                   */
router.get('/shopping-cart', function (req, res, next) {
    (async function () {

        if (! req.session.cart) {
            return res.render('shop/shopping-cart', {products: null});
        }
        var cart = new Cart(req.session.cart);
        res.render('shop/shopping-cart', {
            products: cart.generateArray(),
            totalPrice: cart.totalPrice,
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
        res.render('cart/checkout', {
            products: cart.generateArray(),
            totalPrice: cart.totalPrice,
        });
    })();
});

module.exports = router;