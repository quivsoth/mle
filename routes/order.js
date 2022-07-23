var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var request = require('request');

var Admin = require('./admin');
var Order = require('../models/order');
var Cart = require('../models/cart');
var ParcelSize = require('../models/parcelSize');

var SibApiV3Sdk = require("sib-api-v3-sdk");

// Security
const {deserializeUser} = require('passport');
var csrf = require('csurf');
const { clearTimeout } = require('timers');
var csrfProtection = csrf();
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
            orderNumber: orderNumberGenerator(),
            firstName: req.body.inputFirstName,
            lastName: req.body.inputLastName,
            phone: req.body.inputMobilePhone,
            email: req.body.inputEmail,
            cart: cart,
            billingAddress : billingAddress,
            shippingAddress: shippingAddress,
            giftMessage : "",
            subtotal: parseFloat(cart.totalPrice).toFixed(2),
            shippingCost: 0,
            GST: 0, //TODO GST FIX
            finalPrice: 0
        };
        

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
            order.shippingCost = parseFloat(result.postage_result.total_cost);
            //TODO GST
            order.finalPrice = order.GST + order.shippingCost + cart.totalPrice;

            var viewable = false;
            if(order.user != '' && cart.generateArray().length > 0) viewable = true;

            req.session.order = order;

            res.render('cart/checkout-options', {
                title: 'Baja La Bruja - Checkout Step 2',
                messages: messages,
                hasMessages: messages.length > 0,
                order: order,
                subtotal: order.subtotal,
                shippingPrice: order.shippingCost.toFixed(2),
                qty: cart.qty,
                finalPrice: order.finalPrice.toFixed(2),
                product: cart.generateArray(),
                viewable: viewable,
            });
        }); 
    })();
});

/*    Description: Checkout Step 3.
      Method: POST                     */
router.post('/checkout-payment', async (req, res, next) => {
    var messages = req.flash('info');
    var cart = new Cart(req.session.cart);

    var order = req.session.order;
    order.giftMessage = req.body.giftMessage;
    
    SendEmail(order, cart.generateArray());  

    // res.render('cart/checkout-payment', {
    //     title: 'Baja La Bruja - Checkout Final Step',
    //     product: cart.generateArray(),
    //     messages: messages,
    //     hasMessages: messages.length > 0
    // });
});

/*    Description: Calculates the Shipping from Australia Post  */
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

/*    Description: Braintree Drop In.*/
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







/*    Description: Called when payment is successful */   
router.get("/success", (req, res) => {
    (async function () {
        var messages = req.flash('info');

        var successOrder = new Order({
            user: req.session.order.user,
            orderNumber: req.session.order.orderNumber,
            firstName: req.session.order.firstName,
            lastName: req.session.order.lastName,
            phone: req.session.order.phone,
            email: req.session.order.email,
            cart: req.session.cart,
            billingAddress: req.session.order.billingAddress,
            shippingAddress: req.session.order.shippingAddress,
            giftMessage: req.session.order.giftMessage
        });
        
        successOrder.save();
        delete req.session.cart;
        delete req.session.order;

        res.render('cart/success', {
            title: 'Baja La Bruja - Order Successful',
            messages: messages,
            hasMessages: messages.length > 0,
            orderNumber: successOrder.orderNumber,
        });
    });
});



//---------------- HELPER FUNCTIONS ----------------------

function orderNumberGenerator() {
    let now = Date.now().toString() // '1492341545873'
    // pad with extra random digit
    now += now + Math.floor(Math.random() * 10)
    // format
    return  [now.slice(0, 4), now.slice(4, 10), now.slice(10, 14)].join('-')
}



function SendEmail(order, cart) {
    (async function () { 
        if(order == undefined) throw new Error('There is no order here');
    
        var defaultClient = SibApiV3Sdk.ApiClient.instance;
        var apiKey = defaultClient.authentications["api-key"];
        apiKey.apiKey = process.env.SENDINBLUE_SMTP_KEY;
        console.log("Email Key: " + apiKey.apiKey);

        var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
        sendSmtpEmail = {
            sender: {
                email: "billing@bajalabruja.org",
                name: "bajalabruja.org"
            },
            to: [
                {
                    email: order.email,
                    name: order.firstName + " " + order.lastName
                },
            ],
            bcc: [
                {
                    email: 'phillip.knezevich@live.com',
                    name: "New Order for " + order.firstName + " " + order.lastName
                },
            ],
            subject: "Thanks for your order!",
            htmlContent: EmailBody(order, cart)
        };
        apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
            console.log("API called successfully. Returned data: " + data);
        }, function (error) {
            console.error(error);
        });
    })();
}

// this is a bit lazy - just querying the session variables, would be better to pass this to a full template.
function EmailBody(order, cart) {
    var items = "";

    cart.forEach(function(item) {
        var image = `<img src="https://baja.a2hosted.com/images/products/${item.item.productThumbs[0]}" style="max-height:50px" />`;
        var name = `<span>${item.item.productName}</span><br>`;
        var price = `<span>$${item.item.price}</span>`;        
        var line = `<tr><td vertical-align:top">Price: ${image}</td><td style="margin-left:5px;vertical-align:top"> ${name} ${price}</td></li>`
        items += line;
    });

    var body = `
    <!DOCTYPE html>
    <html>
        <head>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
            <link rel="stylesheet" href="https://baja.a2hosted.com/fonts/stylesheet.css">
            <style>
                table {
                    border-collapse: separate;
                    border-spacing: 0 1em;
                }
            </style>
        </head>
        <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#000; color:#FFF">
            <table style="width:100%;margin:10px" cellspacing="1">
                <tr>
                    <td>
                        <a><img src="https://baja.a2hosted.com/images/baja_logo.png" style="max-height: 7rem;" alt="Baja la Bruja Logo"/></a>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div style="color:white;margin-top:1.5rem">
                            <h2 style="color:#FFF">Hello ${order.firstName}! Your order was successfully processed. Thank You!</h2>
                            <p style="color:#FFF">Your order number is: <strong>${order.orderNumber}.</strong></p>
                            <p style="color:#FFF">Once your package ships, we will send an email with tracking information. You can check the status of your order by signing into your account.</p>
                            <hr>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table style="width:600px;">
                            <tr>
                                <td colspan="2">
                                    <h3>Order Details</h3>
                                </td>
                            </tr>
                            <tr class="spacer">
                                <td style="padding: 1rem;background-color: #F2F2F3; color: #000" colspan="2">
                                    <div style="color: #868484; padding: 1rem; font-size:larger">Order Number</div>
                                    <div style="color: #000; padding-bottom: 1rem; padding-left: 1rem">
                                        <strong>${order.orderNumber}</strong>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="margin-top: 1rem;padding: 1rem; background-color: #F2F2F3; color: #000">
                                    <p style="line-height:0;color: #000; padding: 1rem;font-size:larger">Shipping Address:</p>
                                    <p style="line-height:0;color: #868484; padding-bottom: 1rem; padding-left: 2rem">${order.shippingAddress.shippingAddress1}</p>
                                    <p style="line-height:0;color: #868484; padding-bottom: 1rem; padding-left: 2rem">${order.shippingAddress.shippingAddress2}</p>
                                    <p style="line-height:0;color: #868484; padding-bottom: 1rem; padding-left: 2rem">${order.shippingAddress.shippingCity}</p>
                                    <p style="line-height:0;color: #868484; padding-bottom: 1rem; padding-left: 2rem">${order.shippingAddress.shippingState},  ${order.shippingAddress.shippingZipcode}</p>
                                </td>
                                <td style="margin-top: 1rem;padding: 1rem; background-color: #F2F2F3; color: #000">
                                <p style="line-height:0;color: #000; padding: 1rem;font-size:larger">Billing Address:</p>
                                <p style="line-height:0;color: #868484; padding-bottom: 1rem; padding-left: 2rem">${order.billingAddress.billingAddress1}</p>
                                <p style="line-height:0;color: #868484; padding-bottom: 1rem; padding-left: 2rem">${order.billingAddress.billingAddress2}</p>
                                <p style="line-height:0;color: #868484; padding-bottom: 1rem; padding-left: 2rem">${order.billingAddress.billingCity}</p>
                                <p style="line-height:0;color: #868484; padding-bottom: 1rem; padding-left: 2rem">${order.billingAddress.billingState},  ${order.billingAddress.billingZipcode}</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="margin-top:1rem;padding:1rem; background-color: #F2F2F3; color: #000; vertical-align: top;">
                                    <table>
                                        <tr>
                                            <td>
                                                <div style="color: #000;font-size:larger;vertical-align: top;">Item(s): </div>
                                            </td>
                                        </tr>
                                        ${items}
                                    </table>
                                </td>
                                <td style="margin-top:1rem;padding:1rem; background-color: #F2F2F3; color: #000;vertical-align: top;">
                                    <table>
                                        <tr>
                                            <td>
                                                <div style="color: #000;font-size:larger;vertical-align: top;">Payment Summary:</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div style="color: #868484; padding-bottom: 1rem; padding-left: 1rem">Subtotal</div>
                                                <div style="color: #868484; padding-bottom: 1rem; padding-left: 1rem">GST</div>
                                                <div style="color: #868484;padding-left: 1rem">Shipping</div>                                            
                                            </td>
                                            <td>
                                                <div style="color: #868484; padding-bottom: 1rem; padding-left: 1rem">$${order.subtotal}</div>
                                                <div style="color: #868484; padding-bottom: 1rem; padding-left: 1rem">$0</div>
                                                <div style="color: #868484;padding-left: 1rem">$${order.shippingCost.toFixed(2)}</div>                                            
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan="2">
                                                <hr style="margin:0; padding:0; line-height: 0;">
                                            </td>
                                        </tr>  
                                        <tr>
                                            <td>
                                                <div style="color: #000; padding-bottom: 1rem; padding-left: 1rem">Order Total</div>
                                            </td>
                                            <td>
                                                <div style="color: #000; padding-bottom: 1rem; padding-left: 1rem">${order.finalPrice.toFixed(2)}</div>
                                            </td>
                                        </tr>                                                       
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <p>ABN: 95 226 808 594</p>
        </body>
    </html>    
    `
    return body;
}
module.exports = router;