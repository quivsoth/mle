var express = require("express");
var router = express.Router();
const db = require("./database");

/* Collections Page.                                    */
router.get('/collections', function (req, res, next) {
    (async function () {
        var messages = req.flash('info');
        const collections = await db.getCollections();
        var productChunks = [];
        var chunkSize = 5;
        for (let i = 0; i < collections.length; i += chunkSize) {
            productChunks.push(collections.slice(i, i + chunkSize));
        }
        res.render('shop/collections', {
            title: 'Baja La Bruja - Collections',
            collections: productChunks,
            messages: messages,
            hasMessages: messages.length > 0
        });
    })();
});

/* Products in Collection page.                         */        
router.get('/collections/:collectionId', function (req, res, next) {
    (async function () {
        var messages = req.flash('info');
        let collectionId = parseInt(req.params.collectionId);
        const collection = await db.getCollections(collectionId);

        var activeProducts = [];
        for (let i = 0; i < collection.products.length; i++) {
            if (collection.products[i].active === true) 
                activeProducts.push(collection.products[i]);
        }

        var productChunks = [];
        var chunkSize = 5;
        for (let i = 0; i < activeProducts.length; i += chunkSize) {
            productChunks.push(activeProducts.slice(i, i + chunkSize));
        }
        res.render('shop/products', {
            title: 'Baja La Bruja - Products',
            products: productChunks,
            breadCrumb: collection.collectionName,
            collectionId: collectionId,
            messages: messages,
            hasMessages: messages.length > 0
        });
    })();
});

/* Item/Product Detail View.                            */
router.get('/item/:collection/:itemId', function (req, res, next) {
    (async function () {
        var messages = req.flash('info');
        let collectionId = parseInt(req.params.collection);
        let itemId = parseInt(req.params.itemId);
 
        let inCart = false;
        if (req.session.hasOwnProperty('cart') && req.session.cart.items[itemId]) {
            inCart = true;
        }
        // if(req.session.cart.items[itemId]) inCart = true;
        
        const collection = await db.getCollections(collectionId);

        var item = collection.products.filter(function (item) {
            return item.productId === itemId;
        }).pop();
        
        res.render('shop/item', {
            title: 'Baja La Bruja - Items',
            item: item,
            collectionId: collectionId,
            collectionName: item.collectioName,
            inCart: inCart,
            messages: messages,
            hasMessages: messages.length > 0
        });
    })();
});

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

module.exports = router;