var Collection = require("../models/collection");

module.exports = {
    getCollections: async(collectionId) => {
        try { 
            if(collectionId === undefined) { return await Collection.find().lean(); } 
            else {
                var query = { collectionId: collectionId };
                return await Collection.findOne(query).lean();
            }
        } catch (e) { console.error(e); }
    },
    updateProduct : async(product, collectionId) => {
        var query = { collectionId: collectionId };
        Collection.findOne(query, function (err, result) {
            if (err) { console.log(err); }
            var p = result.products.filter(function (item) {
                return item.productId === parseInt(product.productId);
            }).pop();
            p.productName = product.productName;
            p.description = product.description;
            p.price = product.price;
            p.size = product.size;
            p.measurements = product.measurements;
            p.ausPostParcel = product.ausPostParcel;
            p.isSold = product.isSold;
            p.active = product.active;
            p.productThumbs = product.productThumbs;
            result.save();
        });
    }
};
