var express = require("express");
var router = express.Router();
const db = require("./database");
var Cart = require('../models/cart');

/* Collections Page.                                    */
router.get('/collections', function (req, res, next) {
    (async function () {
        const collectionsAll = await db.getCollections(true);

        //filter active collections only
        var collections = collectionsAll.filter((function (item) {
            return item.active === true;
        }));

        var productChunks = [];
        var chunkSize = 5;
        for (let i = 0; i < collections.length; i += chunkSize) {
            productChunks.push(collections.slice(i, i + chunkSize));
        }

        res.render('shop/collections', {
            title: 'Baja La Bruja - Collections',
            collections: productChunks
        });
    })();
});

/* Products in Collection page.                         */        
router.get('/products/:collectionId', function (req, res, next) {
    (async function () {
        let collectionId = parseInt(req.params.collectionId);
        let currentCollection = await db.getCollections(true);
        let selectedCollection = currentCollection.filter((current) => {
            return current.collectionId == collectionId;
        });
        const c = await db.getProductsByCollectionId(collectionId);
        var collection = [];
        c.forEach((item) => { collection.push(JSON.parse(JSON.stringify(item)))});
        var productRows = [];
        var productColumns = 5;
        for (let i = 0; i < collection.length; i += productColumns) {
            productRows.push(collection.slice(i, i + productColumns));
        }

        res.render('shop/products', {
            title: 'Baja La Bruja - Products',
            products: productRows,
            collectionName: selectedCollection[0].collectionName,
        });
    })();
});

/* Item/Product Detail View.                            */
router.get('/product/:productId', function (req, res, next) {
    (async function () {
        let productId = parseInt(req.params.productId);
        const product = await db.getProductByProductId(productId);

        let currentCollection = await db.getCollections(true);
        let selectedCollection = currentCollection.filter((current) => {
            return current.collectionId == product.collectionId;
        });
      
        let inCart = false;
        
        //console.log("CART items : " + req.session.cart.items);
        if (req.session.hasOwnProperty('cart') && req.session.cart.items[productId]) {
            inCart = true;
        }

        //if(req.session.cart.items[itemId]) inCart = true; 
        //var collection = req.session.sessionData ? collection = req.session.sessionData : collection = await db.getCollections(collectionId);



        res.render('shop/product', {
            title: 'Baja La Bruja - Items',
            product: JSON.parse(JSON.stringify(product)),
            collection: selectedCollection[0],
            inCart: inCart
        });
    })();
});

router.get('/bag', function(req, res, next) {
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    res.json(cart.generateArray());
});

module.exports = router;