const Product = require("../models/product");
const fs = require('fs');

module.exports = {
    getCollections: async(active) => {
        let c = require('../data/collections.json');

        if(!active) return c;
        if(active) {
            return c.filter(function(item) { return item.active == true }).sort(function(a, b){ return a.sortIndex - b.sortIndex; });
        }
    },
    getProducts : async(active) => {
        if(!active) return await Product.find();
        if(active) {
            var products =  await Product.find();//.sort('sortIndex','ascending');
            return products.filter(function(item) { return item.active == true; }).sort(function(a, b){ return a.sortIndex - b.sortIndex; });
        }
    },
    getProductsByCollectionId : async(collectionId)  => {
        var query = { collectionId: collectionId };
        var product = await Product.find(query).sort('sortIndex');
        return product.filter(function(item) {
            return item.active == true;
        });
    },    
    getProductByProductId : async(productId) => {
        var query = { productId: productId };
        return await Product.findOne(query);
    },
    updateProduct : async(product) => {
        var query = { productId: product.productId };
        await Product.findOneAndUpdate(query, product);
    },
    updateProducts : async(products) => {
        for (let i = 0; i < products.length; i++){ 
            var query = { productId: products[i].productId };
            await Product.findOneAndUpdate(query, products[i]);
        }
    },
};