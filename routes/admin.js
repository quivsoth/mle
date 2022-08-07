var express = require("express");
var router = express.Router();
var SibApiV3Sdk = require("sib-api-v3-sdk");
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

const db = require("./database");

/* Item/Product Detail Update.                        */
router.put('/updateProduct/', function (req, res, next) {
    (async function () {
        try {
            await db.updateProduct(req.body);
            req.flash('info', 'Item # ' + req.body.productId + 'has been updated');
            res.json("SUCCESS");
        } catch (error) {
            res.json("ERROR: " + error);
        }
    })();
});

/* Update Products.                        */
router.put('/updateProducts', function (req, res, next) {
    (async function () {
        try {
            await db.updateProducts(req.body);
            res.json("SUCCESS");
        } catch (error) {
            res.json("ERROR: " + error);
        }
    })();
});

/* Item/Product Detail View.                        */
router.get('/lookup/', function (req, res, next) {
    (async function () {
        var messages = req.flash('info');
        res.render('admin/lookup', {
            title: 'Baja La Bruja - Admin Page',
            messages: messages,
            hasMessages: messages.length > 0
        });
    })();
});

/* View for Item Edit page                        */
router.get('/productEditor/:productId', function (req, res, next) {
    var messages = req.flash('info');
    let collectionId = parseInt(req.params.collection);
    let productId = parseInt(req.params.productId);
    res.render('admin/productEditor', {
        title: 'Baja La Bruja - Item Editor Page',
        messages: messages,
        hasMessages: messages.length > 0,
        collectionId: collectionId,
        itemId: productId
    });
});

/* Sends an Email to the customer and billing       */
router.get('/sendEmail', function (req, res, next) {
    (async function () { // Configure API key authorization: api-key        
        
        var order = req.body.order;
        
        if(order!= undefined){
            console.log("There is an order here");
        }

        if(order == undefined){
            console.log("There is no order in session");
        }

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
                    email: "pksubscriber@gmail.com",
                    name: "Phillip Knezevich"
                },
            ],
            subject: "Thanks for your order!",
            htmlContent: EmailBody(order)
        };
        apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
            console.log("API called successfully. Returned data: " + data);
            res.sendStatus(200);
        }, function (error) {
            console.log(error);
            console.error(error);
        });
    })();
});

router.post('/profile', upload.single('avatar'), function (req, res, next) {
    console.log("heres");
    console.log(req);
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
  })

  /* Item/Product Detail View.                        */
router.get('/uploader', function (req, res, next) {
    (async function () {
        res.render('site/upload', {
            title: 'Baja La Bruja - Upload File',
        });
    })();
});

/* Item/Product Detail View.                        */
router.get('/admin', function (req, res, next) {
    (async function () {
        var messages = req.flash('info');
        res.render('admin/admin', {
            title: 'Baja La Bruja - Admin Page',
            messages: messages,
            hasMessages: messages.length > 0
        });
    })();
});


  /* Error 404                                  */
router.get('/error404', function (req, res, next) {
    res.render('site/error404', { title: 'Baja La Bruja - 404 NOT FOUND',});
});


module.exports = router;

// -*-*-*-*-*-*-*-*-*-*-*-*-* UTIL FUNCTIONS -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*//

// this is a bit lazy - just querying the session variables, would be better to pass this to a full template.
function EmailBody(order) {
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
                        <a><img src="https://baja.a2hosted.com/images/baja_logo_inverted.png" style="max-height: 7rem;" alt="Baja la Bruja Logo"/></a>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div style="color:white;margin-top:1.5rem">
                            <h2>Hello ${order.firstName}! Thank you! Your order was successfully processed.</h2>
                            <p>Your order number is:<strong>${order.orderNumber}.</strong></p>
                            <p>Once your package ships, we will send an email with tracking information. You can check the status of your order by signing into your account.</p>
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
                                <p style="line-height:0;color: #868484; padding-bottom: 1rem; padding-left: 2rem">${order.billingAddress.billingAddress1}</p>
                                <p style="line-height:0;color: #868484; padding-bottom: 1rem; padding-left: 2rem">${order.billingAddress.billingAddress2}</p>
                                <p style="line-height:0;color: #868484; padding-bottom: 1rem; padding-left: 2rem">${order.billingAddress.billingCity}</p>
                                <p style="line-height:0;color: #868484; padding-bottom: 1rem; padding-left: 2rem">${order.billingAddress.billingState},  ${order.billingAddress.billingZipcode}</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="margin-top:1rem;padding:1rem; background-color: #F2F2F3; color: #000; vertical-align: top;">
                                    <div style="color: #000; padding: 1rem;font-size:larger">Item(s)</div>
                                    <div style="color: #868484; padding-bottom: 1rem; padding-left: 1rem">Subtotal</div>
                                    <div style="color: #868484; padding-bottom: 1rem; padding-left: 1rem">GST</div>
                                    <div style="color: #868484; padding-bottom: 1rem; padding-left: 1rem">Shipping</div>
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
                                                <div style="color: #868484; padding-bottom: 1rem; padding-left: 1rem">$112</div>
                                                <div style="color: #868484; padding-bottom: 1rem; padding-left: 1rem">0$</div>
                                                <div style="color: #868484;padding-left: 1rem">$14</div>                                            
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
                                                <div style="color: #000; padding-bottom: 1rem; padding-left: 1rem">$126</div>
                                            </td>
                                        </tr>                                                       
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <!-- <h4>Item Summary</h4>
            <ul class="list-group">
                {{#each products  }}
                    <li class="list-group-item" style="border: 1px solid lightgrey;margin-top:0.2rem">
                        <img style="max-height: 6rem;border-radius:6rem" src="images/products/{{ this.item.productThumbs.[1] }}"/>
                        {{ this.item.productName }}
                        <span class="badge bg-primary"></span>
                    </li>
                {{/each}}
            </ul> -->
            <p>ABN: 95 226 808 594</p>
        </body>
    </html>    

    `
    return body;
}