module.exports = function Cart(currentCart) {
    
    if(currentCart === undefined) {
        this.items = {};
        this.totalPrice = 0;
        this.qty = 0;
    } else {
        this.items = currentCart.items;
        this.totalPrice = 0;
        this.qty = currentCart.qty;
    }
    

    this.add = function(item, id) {
        console.log("Item SKU:\t" +  id);
        var storedItem = this.items[id];

        // None of this item in the cart
        if (!storedItem) {
            storedItem = this.items[id] = { item: item};
            this.totalPrice += storedItem.item.price;
            this.qty++;
        }
    }

    this.delete = function(productId) {
        var storedItem = this.items[productId];
        delete this.items[productId];
        this.totalPrice -= storedItem.item.price;
        this.qty--;
    }

    this.generateArray = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    }
};