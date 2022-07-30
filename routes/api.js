var express = require("express");
var router = express.Router();
const db = require("./database");

/* Item/Product Detail View. JSON Object        */
router.post('/item/:collection/:item', async function (req, res, next) {
    let collectionId = parseInt(req.params.collection);
    let itemId = parseInt(req.params.item);
    // const item = await db.getItem(itemId, collectionId);
    const collection = await db.getCollections(collectionId);
    var item = collection.products.filter(function (item) {
        return item.productId === itemId;
    }).pop();
    res.json(item);
});

/* get collections (all)    JSON RESULT             */
router.get('/collections', async function (req, res, next) {
    const collections = await db.getCollections();    
    res.json(collections);
});

module.exports = router;