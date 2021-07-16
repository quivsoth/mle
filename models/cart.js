module.exports = function Cart(currentCart) {
    this.items = currentCart.items || {};
    this.totalPrice = currentCart.totalPrice || 0;
    this.qty = currentCart.qty || 0;

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