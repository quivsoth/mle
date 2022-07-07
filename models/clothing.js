var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var clothingSchema = new Schema({
    productId: { type:Number, required:true },
    productName: { type:String, required:true },
    description: { type:String, required:true },
    productThumbs: {type: [String], required: true},
    price: { type:Number, required:true },
    size: { type:Number, required:true },
    active: { type:Boolean, required:true }
},
{ collection : 'clothes' });

module.exports = mongoose.model('Clothing', clothingSchema);