var express = require("express");
var router = express.Router();
var Collection = require("../models/collection");
var SibApiV3Sdk = require("sib-api-v3-sdk");

const {MongoClient} = require('mongodb');
const uri = process.env.MONGO_DB;




/*    Description: Get a Product Item
      Method: GET                     */
router.get('/getItem', function (req, res, next) {
    (async function () {
        let itemId = req.query.itemId;
        let collectionId = req.query.collectionId;
        const item = await getItem(itemId, collectionId);
        res.json(item);
    })();
});

router.get('/sendEmail', function (req, res, next) {
    (async function () { // Configure API key authorization: api-key
        var defaultClient = SibApiV3Sdk.ApiClient.instance;
        var apiKey = defaultClient.authentications["api-key"];
        apiKey.apiKey = process.env.smtp_key;

        var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
        sendSmtpEmail = {
            sender: {
                email: "billing@bajalabruja.org"
            },
            to: [
                {
                    email: "pksubscriber@gmail.com",
                    name: "Phillip Knezevich"
                },
            ],
            subject: "Test Email",
            textContent: "Test Email Content"
        };
        apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
            console.log("API called successfully. Returned data: " + data);
        }, function (error) {
            console.error(error);
        });
    })();
});

// /*    Description: Delete Product Thumb
//       Method: PUT                     */
// router.put('/deleteThumb/:collection/:productId/:thumb', function (req, res, next) {
//     (async function () {
//         let itemId = req.params.productId;
//         let collectionId = req.params.collection;
//         let thumb = req.params.thumb;
//         const item = await deleteThumb(itemId, collectionId, thumb);
//         console.log(item);
//         res.send(item);
//     })();
// });


/*      Description: Update item in collection
        Method: PUT                           */
router.put('/updateProduct/:collection/:id', function (req, res) {
    (async function () {
        console.log("Update Product");
        let itemId = parseInt(req.params.id);
        let collectionId = parseInt(req.params.collection);
        await updateItem(itemId, collectionId, req.body.productName, req.body.description, req.body.price, req.body.size, req.body.measurements, req.body.parcel);
        req.flash('info', 'Item # ' + itemId + 'has been updated');
        res.redirect('/item_admin?itemId=' + itemId + "&collectionId=" + collectionId);
    })();
});


module.exports = router;

// -*-*-*-*-*-*-*-*-*-*-*-*-* DB FUNCTIONS -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*//

async function getItem(productId, collectionId) {
    const client = new MongoClient(uri, {useUnifiedTopology: true});
    try {
        await client.connect();
        var result = {};
        const cursor = await client.db("shop").collection("bruja").findOne({"collectionId": parseInt(collectionId)});
        result.collectioName = cursor.collectionName;
        let item = cursor.products.find(product => product.productId == productId);
        result.item = item;
        return result;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function updateItem(productId, collectionId, productName, description, price, size, measurements, ausPostParcel) {
    var query = {
        collectionId: collectionId
    };
    Collection.findOne(query, function (err, result) {
        if (err) {
            console.log(err);
        }
        var p = result.products.filter(function (item) {
            return item.productId === productId;
        }).pop();
        p.productName = productName;
        p.description = description;
        p.price = price;
        p.size = size;
        p.measurements = measurements;
        p.ausPostParcel = ausPostParcel;
        result.save();
    });
}
