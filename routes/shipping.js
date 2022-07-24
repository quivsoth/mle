var express = require("express");
var router = express.Router();

/* Shipping Home Page                           */
router.get('/shipping', function (req, res, next) {
    var messages = req.flash('info');
    res.render('site/shipping', {
        title: 'Baja La Bruja - Shipping',
        messages: messages,
        hasMessages: messages.length > 0
    });
});

/* Shipping Calculator                         */
router.get('/calculator', function (req, res, next) {
    (async function () {

        var request = require('request');
        var cost = 0,
            deliveryTime,
            service;
        var length,
            width,
            height,
            weight,
            postCodeFrom,
            postCodeTo;
        var service_code = "AUS_PARCEL_REGULAR";

        length = req.body.length;
        width = req.body.width;
        height = req.body.height;
        weight = req.body.weight;
        postCodeFrom = req.body.postCodeFrom
        postCodeTo = req.body.postCodeTo;

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
            'headers': {
                'AUTH-KEY': 'e093c2e3-d6c1-4cc7-ad2f-a85147dc3d05'
            },
            followAllRedirects: true
        };
        console.log(australiaPostAPI.href);
        request(options, function (error, response) {
            if (error) 
                throw new Error(error);
            
            var g = JSON.parse(response.body, (key, value) => {
                if (key == 'total_cost') {
                    cost = value
                }
                if (key == 'delivery_time') {
                    deliveryTime = value
                }
                if (key == 'service') {
                    service = value
                }
                console.log("key  : " + key); // log the current property name, the last is "".
                return value; // return the unchanged property value.
            });

            res.render('site/shipping', {
                title: 'Baja La Bruja - Shipping',
                cost: cost,
                deliveryTime: deliveryTime,
                service: service,
                postCodeFrom: postCodeFrom,
                postCodeTo: postCodeTo,
                hasCost: cost.length > 0
            });
        });
    })();
});

module.exports = router;