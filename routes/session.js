module.exports = function Session(currentSession) {

    this.data = currentSession;
    // this.items = currentCart.items || {};
    // this.totalPrice = currentCart.totalPrice || 0;
    // this.qty = currentCart.qty || 0;
    const db = require("./database");

    this.generate = async() => {
        this.data = await db.getCollections();
    },
    this.getCollections = (active) => {
        if (active) { 
            return this.data.filter(function(coll) {
                return coll.active === active;
            });
        } else return this.data;
    },
    this.getCollectionById = (collectionId) => {
        var result = this.data.filter(function(coll) {
            return coll.collectionId === collectionId;
        });
        return result[0];
        //return await Collection.findOne(query).lean();
        // var item = collection.products.filter(function (item) {
        //     return item.productId === itemId;
        // }).pop();
    }

};