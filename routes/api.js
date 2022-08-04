var express = require("express");
var router = express.Router();
const db = require("./database");

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
    res.json(await db.getProductByProductId(productId));
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