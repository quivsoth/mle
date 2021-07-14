module.exports = function Cart(currentCart) {
    this.items = currentCart.items || {};
    this.totalPrice = currentCart.totalPrice || 0;

    this.add = function(item, id){
        var storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = { item: item, price: 0};
        }
        storedItem.price = storedItem.item.price
        this.totalPrice += storedItem.item.price;
    }

    this.generateArray = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    }
};