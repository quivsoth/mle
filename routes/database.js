// const mongoose = require('mongoose');
const {MongoClient} = require('mongodb');
const uri = process.env.MONGO_DB;
var Collection = require("../models/collection");

module.exports = {
    getCollections: async() => {
        const client = new MongoClient(uri, {useUnifiedTopology: true});
        try {
            await client.connect();
            const cursor = client.db("shop").collection("bruja").find({active: true}).sort({collectionId: 1});
            const results = await cursor.toArray();

            results.sort((a, b) => parseFloat(a.sortOrder) - parseFloat(b.sortOrder));

            return results;
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    },
    getProducts : async(collectionId) => {
        const client = new MongoClient(uri, {useUnifiedTopology: true});
        try {
            await client.connect();
            const cursor = await client.db("shop").collection("bruja").findOne({collectionId: Number(collectionId), active: true});
            return cursor;
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    },
    getItem : async(productId, collectionId) => {
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
    },
    updateItem : async(productId, collectionId, productName, description, price, size, measurements, ausPostParcel, isActive) => {
        var query = { collectionId: collectionId };
        Collection.findOne(query, function (err, result) {
            if (err) { console.log(err); }
            var p = result.products.filter(function (item) {
                return item.productId === productId;
            }).pop();
            p.productName = productName;
            p.description = description;
            p.price = price;
            p.size = size;
            p.measurements = measurements;
            p.ausPostParcel = ausPostParcel;
            p.active = isActive;
            result.save();
        });
    },
    updateProduct : async(product, collectionId) => {
        var query = { collectionId: collectionId };
        Collection.findOne(query, function (err, result) {
            if (err) { console.log(err); }
            var p = result.products.filter(function (item) {
                return item.productId === parseInt(product.item.productId);
            }).pop();
         
            p.productName = product.item.productName;
            p.description = product.item.description;
            p.price = product.item.price;
            p.size = product.item.size;
            p.measurements = product.item.measurements;
            p.ausPostParcel = product.item.ausPostParcel;
            p.active = product.item.active === "on" ? true : false;
            p.productThumbs = product.item.productThumbs;
            result.save();
        });
    },
    updateThumbs : async(productId, collectionId, thumbs) => {
        var query = { collectionId: collectionId };
        Collection.findOne(query, function (err, result) {

            if (err) { console.log(err); }
            var p = result.products.filter(function (item) {
                return item.productId === parseInt(productId);
            }).pop();
            p.productThumbs = thumbs;
            result.save();
        });
    },
};





// NOT WORKING _ NEED TO FIX _ TEMP FUNCTION THIS IS USING MONGOOSE _ THIS WILL REPLACE IT ALL
async function getItem2(productId, collectionId) {
    var query = { collectionId: collectionId };
    var p;
    Collection.findOne(query, function (err, result) {
        if (err) { console.log(err); }
        p = result.products.filter(function (item) {
            return item.productId === productId;
        }).pop();
    });
    return p;
}



async function deleteThumb(productId, collectionId, thumb) {
    var query = { collectionId: collectionId, "products.productId": productId };

    console.log("collectionId : " + collectionId);
    console.log("productId : " + productId);
    console.log("thumb : " + thumb);

    Collection.findOne(query, function (err, result) {
        if (err) { console.log(err); }
        console.log(result);
    });

    /*
    Clothing.findOne(query, (err, result) => {
        if (err) { console.log(err); }
        // console.log(result);
        
    //    const items = category.products; //the array of items
    // console.log(items); //gives an array back
        const item = _.find(result, { productId: productId });
        console.log(item); //gives the value of 'undefined' for whatever reason

    //     var g;
    //     console.log(category);
    //    var p = category.products.filter(function (item) {
    //         return item.productId === productId;
    //     }).pop();

    //     console.log(p);
    });
    */
}