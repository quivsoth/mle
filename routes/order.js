var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var request = require('request');
var Order = require("../models/order");
var Cart = require('../models/cart');
var ParcelSize = require('../models/parcelSize');

// Security
const {deserializeUser} = require('passport');
// var csrf = require('csurf');
// var csrfProtection = csrf();
// router.use(csrfProtection);

/*    Description: Checkout Step 1.
      Method: GET                     */
router.get('/checkout', function (req, res, next) {
    var messages = req.flash('info');
    res.render('cart/checkout', {
        title: 'Baja La Bruja - Checkout Step 1',
        messages: messages,
        hasMessages: messages.length > 0
    });
});

/*    Description: Checkout Step 2.
      Method: POST                     */
router.post('/checkout-options', function (req, res, next) {
    (async function () {
        var messages = req.flash('info');
        var ObjectID = mongo.ObjectId;
        var cart = new Cart(req.session.cart);
        var shippingAddress = {
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            shippingCity: req.body.shippingCity,
            shippingState: req.body.shippingState,
            shippingZipcode: req.body.shippingZipcode
        }
        var billingAddress = Object.create(Object);

        if(req.body.isBilling) {
            //Copy the shipping details to the billing
            billingAddress.billingAddress1 = req.body.shippingAddress1;
            billingAddress.billingAddress2 = req.body.shippingAddress2;
            billingAddress.billingCity = req.body.shippingCity;
            billingAddress.billingState = req.body.shippingState;
            billingAddress.billingZipcode = req.body.shippingZipcode;
        } else {
            billingAddress.billingAddress1 = req.body.billingAddress1;
            billingAddress.billingAddress2 = req.body.billingAddress2;
            billingAddress.billingCity = req.body.billingCity;
            billingAddress.billingState = req.body.billingState;
            billingAddress.billingZipcode = req.body.billingZipcode;
        }

        var order = {
            user: new ObjectID(),
            firstName: req.body.inputFirstName,
            lastName: req.body.inputLastName,
            phone: req.body.inputMobilePhone,
            email: req.body.inputEmail,
            billingAddress : billingAddress,
            shippingAddress: shippingAddress
        };
        req.session.order = order;

        //CALCULATE SHIPPING
        var packageSizer = JSON.parse(new ParcelSize().parcelSize.M); //you need to get the size here
        const australiaPostAPI = new URL(process.env.AP_API);
        australiaPostAPI.searchParams.append("length", packageSizer.length);
        australiaPostAPI.searchParams.append("width", packageSizer.width);
        australiaPostAPI.searchParams.append("height", packageSizer.height);
        australiaPostAPI.searchParams.append("weight", packageSizer.weight);
        australiaPostAPI.searchParams.append("from_postcode", process.env.HQ_ZIPCODE);
        australiaPostAPI.searchParams.append("to_postcode", shippingAddress.shippingZipcode);
        australiaPostAPI.searchParams.append("service_code", process.env.AP_SERVICE_CODE);
        var options = {
            'method': 'POST',
            'url': australiaPostAPI.href,
            'headers': { 'AUTH-KEY': process.env.AP_AUTHKEY },
            followAllRedirects: true
        };
        request(options, function (error, response) {
            if (error) { throw new Error(error); }
            var result = JSON.parse("{\"postage_result\":{\"service\":\"Parcel Post\",\"delivery_time\":\"Delivered in Temporary delays\",\"total_cost\":\"15.95\",\"costs\":{\"cost\":{\"item\":\"Parcel Post\",\"cost\":\"15.95\"}}}}");
            // return response.body;
            res.render('cart/checkout-options', {
                title: 'Baja La Bruja - Checkout Step 2',
                messages: messages,
                hasMessages: messages.length > 0,
                totalPrice: cart.totalPrice,
                shippingPrice: result.postage_result.total_cost,
                qty: cart.qty,
                finalPrice: parseInt(cart.totalPrice) + parseInt(result.postage_result.total_cost),
                product: cart.generateArray()
            });
        }); 
    })();
});

/*    Description: Checkout Step 3.
      Method: POST                     */
router.post('/checkout-payment', function (req, res, next) {
    var messages = req.flash('info');
    var cart = new Cart(req.session.cart);

    res.render('cart/checkout-options', {
        title: 'Baja La Bruja - Checkout Step 2',
        product: cart.generateArray(),
        messages: messages,
        hasMessages: messages.length > 0
    });
});

router.get('/shippingCalculator', function (req, res, next) {
    (async function () {
        var request = require('request');

        var length = req.body.length;
        var width = req.body.width;
        var height = req.body.height;
        var weight = req.body.weight;
        var postCodeFrom = process.env.HQ_ZIPCODE;
        var postCodeTo = req.body.postCodeTo;

        var service_code = process.env.AP_SERVICE_CODE;
        const australiaPostAPI = new URL(process.env.AP_API);

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
            'headers': { 'AUTH-KEY': process.env.AP_AUTHKEY },
            followAllRedirects: true
        };
        
        request(options, function (error, response) {
            if (error) { throw new Error(error); }
            res.setHeader('Content-Type', 'application/json');
            res.json(response.body);
        });
    })();
});

router.get('/tester', function (req, res, next) { 
    
    var s = JSON.parse("{\"postage_result\":{\"service\":\"Parcel Post\",\"delivery_time\":\"Delivered in Temporary delays\",\"total_cost\":\"15.95\",\"costs\":{\"cost\":{\"item\":\"Parcel Post\",\"cost\":\"15.95\"}}}}");
    console.log(s.postage_result);
    // console.log(new parcelSize().parcelSize.L);
});

module.exports = router;