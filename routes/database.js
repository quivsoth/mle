const Product = require("../models/product");
const User = require("../models/user");
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
    getProductByProductId : async(productId) => {
        var query = { productId: productId };
        return await Product.findOne(query);
    },
    resetPassword : async(authToken, password, cb) => {
        User.findOne({'authToken': authToken}, function (err, user) {
            if (err) { return cb(err) }
            if (!user) { return cb('Invalid Authentication Token') } 
            else {
                if(password == "") return cb("Cannot use a blank password.");
                if(password.length < 6) return cb("Password length must be atleast 6 characters");
                if(password.length > 15) return cb("Password length must not exceed 15 characters");
                user.password = user.encryptPassword(password);
                user.save();
                return cb("OK");
            }
        });
    },
    search : async(searchText) => {
        return await Product.find({ $text: { $search: searchText } });
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