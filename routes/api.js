var express = require("express");
var router = express.Router();
const db = require("./database");
const fs = require('fs');

/* get Collections (active only)                                */
router.get('/collections', async function (req, res, next) {
    res.json(await db.getCollections(true));
});

/* get Products (by collection ID)                               */
router.get('/products/:collectionId', async function (req, res, next) {
    let collectionId = parseInt(req.params.collectionId);
    const products = await db.getProductsByCollectionId(collectionId);    
    res.json(products);
});

/* get Products (by Product ID)                                            */
router.get('/product/:productId', async function (req, res, next) {
    let productId = parseInt(req.params.productId);
    console.log("productId : " + productId);
    res.json(await db.getProductByProductId(productId));
});

/* Search                                           */
router.get('/search/:searchText', async function (req, res, next) {
    let searchText = req.params.searchText;
    db.search(searchText).then((value) => { res.json(value) }); 
});


/* Reset Password                                                       */
router.put("/resetPassword/:authToken", async function (req, res, next) {
    let authToken = req.params.authToken;
    let password = req.body.a;
    let validate = (message) => { res.json(message) }
    const resetPassword =  await db.resetPassword(authToken, password, validate);
});

router.put('/updateCollections', function (req, res, next) {
    (async function () {
        var d = new Date(); 
        const dateStamp = d.getMonth() + "-" + d.getDate() + "-" + d.getFullYear() + "@" + d.getHours() + "." + d.getMinutes() + "." + d.getSeconds();
        try {
            fs.writeFile('data/backup/collections-' + dateStamp + '.json', JSON.stringify(req.body), function (err) {if (err) return console.log(err);});
            fs.writeFile('data/collections.json', JSON.stringify(req.body), function (err) {if (err) return console.log(err);});
            res.json("SUCCESS");
        } catch (error) {
            res.json("ERROR: " + error);
        }
    })();
});

//-- TEST FUNCTIONS

/* get Collections (all)                                        */
router.get('/allCollections', async function (req, res, next) {
    res.json(await db.getCollections(false));
});

/* get Products (active)                                            */
router.get('/products', async function (req, res, next) {
    res.json(await db.getProducts(true));
});

/* get Products (all)                                            */
router.get('/allProducts', async function (req, res, next) {
    res.json(await db.getProducts(false));
});

module.exports = router;