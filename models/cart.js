module.exports = function Cart(currentCart) {

    // console.log("currentCart :\t" +  currentCart);

    this.items = currentCart.items || {};
    this.totalPrice = currentCart.totalPrice || 0;

    this.add = function(item, id){
        console.log("Item SKU:\t" +  id);
        var storedItem = this.items[id];

        // None of this item in the cart
        if (!storedItem) {
            storedItem = this.items[id] = { item: item};
            this.totalPrice += storedItem.item.price;
        }
        // this.totalPrice += storedItem.item.price;
        console.log("Total Price:\t" + this.totalPrice);
    }

    this.generateArray = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    }
};