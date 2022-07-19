var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var request = require('request');
var braintree = require('braintree');
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
            
            var result = JSON.parse(response.body);
            var finalPrice = parseFloat(result.postage_result.total_cost) + parseFloat(cart.totalPrice);

            var viewable = false;
            if(order.user != '' && cart.generateArray().length > 0) viewable = true;

            res.render('cart/checkout-options', {
                title: 'Baja La Bruja - Checkout Step 2',
                messages: messages,
                hasMessages: messages.length > 0,
                order: order,
                totalPrice: cart.totalPrice,
                shippingPrice: result.postage_result.total_cost,
                qty: cart.qty,
                finalPrice: finalPrice.toFixed(2),
                product: cart.generateArray(),
                viewable: viewable,

            });
        }); 
    })();
});

/*    Description: Checkout Step 3.
      Method: POST                     */
router.post('/checkout-payment', function (req, res, next) {
    var messages = req.flash('info');
    var cart = new Cart(req.session.cart);

    var order = req.session.order = order;
    if(req.body.giftMessage != '') order.giftMessage = req.body.giftMessage;
    
    res.render('cart/checkout-payment', {
        title: 'Baja La Bruja - Checkout Final Step',
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


/*    Description: Braintree Drop In.
      Method: GET                     */
router.get('/cardDetails', function (req, res, next) {
    var messages = req.flash('info');
    res.render('cart/cardDetails', {
        title: 'Baja La Bruja - Paypal Braintree',
        messages: messages,
        hasMessages: messages.length > 0
    });
});

/*    Description: Braintree Drop In.
      Method: POST                     */
router.post('/cardSubmit', function (req, res, next) {
    var messages = req.flash('info');

    const gateway = new braintree.BraintreeGateway({
        environment: braintree.Environment.Sandbox,
        // Use your own credentials from the sandbox Control Panel here
        merchantId: 'vjv27yn66fsvnpnm',
        publicKey: '4ptc6ftc54hzdfcy',
        privateKey: '2a7a374115893d9dcae4e77314d65272'
    });

    // Use the payment method nonce here
    const nonceFromTheClient = req.body.paymentMethodNonce;
    console.log(nonceFromTheClient);
  
    // Create a new transaction for $10
    const newTransaction = gateway.transaction.sale({
        amount: '10.00',
        paymentMethodNonce: nonceFromTheClient,
        options: {
            // This option requests the funds from the transaction
            // once it has been authorized successfully
            submitForSettlement: true
        }
    }, (error, result) => {
        if (result) {
            res.send(result);
        } else {
            console.log(error);
            res.status(500).send(error);
        }
    });
});

/*    Description: Post payment activities.
      Method: POST                     */
// router.post('/cardSuccess', function (req, res, next) {
//     var messages = req.flash('info');
//     res.send("success");
// });

router.post("/cardSuccess", (req, res) => {
    // clear the cart
    // send email
    // send order receipt number
    // save order to database
    res.status(200).send({ cityID: '123' });
});

module.exports = router;