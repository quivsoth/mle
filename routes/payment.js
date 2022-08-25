var express = require('express');
var router = express.Router();
var dollarsToCents = require('dollars-to-cents');

const { Client, Environment, ApiError } = require('square');

// micro provides http helpers
const { createError, json, send } = require('micro');

// microrouter provides http server routing
const { microrouter, get, post } = require('microrouter');

// serve-handler serves static assets
const staticHandler = require('serve-handler');

// async-retry will retry failed API requests
const retry = require('async-retry');
const { nanoid } = require('nanoid');

const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
});

const { locationsApi, customersApi, ordersApi } = client;

// Security
const {deserializeUser} = require('passport');
var csrf = require('csurf');
var csrfProtection = csrf();
// router.use(csrfProtection);

/*    Description: Route for successful card pay     */
router.post('/pay', async (req, res, next) => {
  var order = req.session.order;
  if(order == undefined) { throw new Error("Order is Missing"); }

  req.body.giftMessage == '' ? req.session.order.giftMessage = 'No message.' : req.session.order.giftMessage = req.body.giftMessage;
  
  res.render('cart/pay', {
      title: 'Baja La Bruja - Pay for Items and Checkout',
      viewable: (order != undefined)
  });
});

/*    Description: Credit Card Processing             */
router.post('/payment', async(req, res) => {
  // let locations = await getLocations();  //not used but dont delete, quick way to get location info from square
  try {
    console.log(req.body.sourceId);
    var order = req.session.order;
    if(order == undefined) { throw new Error("Order is Missing"); }
    var finalPrice = dollarsToCents(order.finalPrice);
    const idempotencyKey = nanoid();
    const payment = {
      idempotencyKey,
      locationId: req.body.locationId,
      sourceId: req.body.sourceId,
      // While it's tempting to pass this data from the client
      // Doing so allows bad actor to modify these values
      // Instead, leverage Orders to create an order on the server
      // and pass the Order ID to createPayment rather than raw amounts
      // See Orders documentation: https://developer.squareup.com/docs/orders-api/what-it-does
      amountMoney: {
        // the expected amount is in cents, meaning this is $1.00.
        amount: BigInt(finalPrice),
        // If you are a non-US account, you must change the currency to match the country in which
        // you are accepting the payment.
        currency: 'AUD',
      },
    };

    const { result, statusCode } = await client.paymentsApi.createPayment(
      payment
    );

    send(res, statusCode, {
      success: true,
      payment: {
        id: result.payment.id,
        status: result.payment.status,
        receiptUrl: result.payment.receiptUrl,
        orderId: result.payment.orderId,
      },
    });
  } catch (error) {
    console.log(error)
  }
})

/*    Description: Route for successful card pay     */
router.get('/success', async (req, res, next) => {
  var order = req.session.order;
    if(order == undefined) { throw new Error("Order is Missing"); }

  //   var successOrder = new Order({
  //     user: req.session.order.user,
  //     orderNumber: req.session.order.orderNumber,
  //     firstName: req.session.order.firstName,
  //     lastName: req.session.order.lastName,
  //     phone: req.session.order.phone,
  //     email: req.session.order.email,
  //     cart: req.session.cart,
  //     billingAddress: req.session.order.billingAddress,
  //     shippingAddress: req.session.order.shippingAddress,
  //     giftMessage: req.session.order.giftMessage
  // });
  
  // successOrder.save();

  // SendEmail();
  
  delete req.session.cart;
  delete req.session.order;

  res.render('cart/success', {
      title: 'Baja La Bruja - Pay for Items and Checkout',
      orderNumber: order.orderNumber,
      viewable: (order != undefined),
  });
});



module.exports = router;

//---------------- HELPER FUNCTIONS ----------------------
async function getLocations() {
    try {
      let listLocationsResponse = await locationsApi.listLocations();
      let locations = listLocationsResponse.result.locations;
  
    //   locations.forEach(function (location) {
    //     console.log(
    //       location.id + ": " +
    //         location.name +", " +
    //         location.address.addressLine1 + ", " +
    //         location.address.locality
    //     );
    //   });

      return locations;
    } catch (error) {
      if (error instanceof ApiError) {
        error.result.errors.forEach(function (e) {
          console.log(e.category);
          console.log(e.code);
          console.log(e.detail);
        });
      } else {
        console.log("Unexpected error occurred: ", error);
      }
    }
  };