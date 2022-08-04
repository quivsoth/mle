const Product = require("../models/product");

module.exports = {
    getCollections: async(active) => {
        let c = require('../data/collections.json');
        if(!active) return c;
        if(active) {
            return c.filter(function(item) {
                return item.active == true;
              });
        }
    },
    updateProduct : async(product) => {
        var query = { productId: product.productId };
        await Product.findOneAndUpdate(query, product);
    },
    getProductsByCollectionId : async(collectionId)  => {
        var query = { collectionId: collectionId };
        var product = await Product.find(query);
        return product.filter(function(item) {
            return item.active == true;
        });
    },
    getProducts : async(active) => {
        if(!active) return await Product.find();
        if(active) {
            var products =  await Product.find()
            return products.filter(function(item) {
                return item.active == true;
              });
        }
    },
    getProductByProductId : async(productId) => {
        var query = { productId: productId };
        return await Product.findOne(query);
    }
};