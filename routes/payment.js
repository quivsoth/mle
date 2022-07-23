var express = require('express');
var router = express.Router();
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

/*    Description: Square Payment     */
router.get('/pay', async (req, res, next) => {
    var messages = req.flash('info');
    let locations = await getLocations();

    res.render('cart/pay', {
        title: 'Baja La Bruja - Pay for Items and Checkout',
        messages: messages,
        hasMessages: messages.length > 0
    });
});

router.post('/payment', async(req, res) => {
  try {
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
        amount: '100',
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

/*    Description: Square Payment   */
router.post('/payment1', async (req, res, next) => {
  console.log("createPayment2 /payment going to async");


    const appId = 'sandbox-sq0idb-i20LMvpR3vpW8yTtZPb_LQ';
    const locationId = 'LHVG8FJDDEFK7';

    await createPayment(req, res);


    // const payments = Square.payments(appId, locationId);
    
    // let locations = await getLocations();

    // res.render('cart/square', {
    //     title: 'Baja La Bruja - Paypal Braintree',
    //     messages: messages,
    //     hasMessages: messages.length > 0
    // });
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

async function createPayment(req, res) {
  
  console.log("PAYLOAD");

  const payload = req.body;

  // const payload = await json(req);
  console.log("PAYLOAD : " + payload);
  // logger.debug(JSON.stringify(payload));
  // We validate the payload for specific fields. You may disable this feature
  // if you would prefer to handle payload validation on your own.
  // if (!validatePaymentPayload(payload)) {
  //   throw createError(400, 'Bad Request');
  // }
  await retry(async (bail, attempt) => {
    try {
      // logger.debug('Creating payment', { attempt });

      const idempotencyKey = payload.idempotencyKey || nanoid();
      const payment = {
        idempotencyKey,
        locationId: payload.locationId,
        sourceId: payload.sourceId,
        // While it's tempting to pass this data from the client
        // Doing so allows bad actor to modify these values
        // Instead, leverage Orders to create an order on the server
        // and pass the Order ID to createPayment rather than raw amounts
        // See Orders documentation: https://developer.squareup.com/docs/orders-api/what-it-does
        amountMoney: {
          // the expected amount is in cents, meaning this is $1.00.
          amount: '100',
          // If you are a non-US account, you must change the currency to match the country in which
          // you are accepting the payment.
          currency: 'AUD',
        },
      };

      if (payload.customerId) {
        payment.customerId = payload.customerId;
      }

      // VerificationDetails is part of Secure Card Authentication.
      // This part of the payload is highly recommended (and required for some countries)
      // for 'unauthenticated' payment methods like Cards.
      // if (payload.verificationToken) {
      //   payment.verificationToken = payload.verificationToken;
      // }

      const { result, statusCode } = await client.paymentsApi.createPayment(
        payment
      );

      // logger.info('Payment succeeded!', { result, statusCode });

      send(res, statusCode, {
        success: true,
        payment: {
          id: result.payment.id,
          status: result.payment.status,
          receiptUrl: result.payment.receiptUrl,
          orderId: result.payment.orderId,
        },
      });
    } catch (ex) {
      if (ex instanceof ApiError) {
        // likely an error in the request. don't retry
        logger.error(ex.errors);
        bail(ex);
      } else {
        // IDEA: send to error reporting service
        logger.error(`Error creating payment on attempt ${attempt}: ${ex}`);
        throw ex; // to attempt retry
      }
    }
  });
}