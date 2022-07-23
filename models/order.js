var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderSchema = new Schema({
    user: { type:Schema.Types.ObjectId, ref: 'User' },
    orderNumber: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    phone: {type: Number, required: true},
    email: {type: String, required: true},
    cart: {type: Object, required: true},
    billingAddress: {type: Object, required: false},
    shippingAddress: {type: Object, required: true},
    giftMessage: {type: String, required: true},
    subtotal: {type: Number, required: true},
    shippingCost: {type: Number, required: true},
    GST: {type: Number, required: true},
    finalPrice: {type: Number, required: true},
},
{ collection : 'orders' });

module.exports = mongoose.model('Order', orderSchema);