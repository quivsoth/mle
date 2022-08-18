var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
    productId: { type:Number, required:true },
    productName: { type:String, required:true },
    description: { type:String, required:false },
    collectionId: { type:Number, required:false },
    price: { type:Number, required:true },
    size: { type:String, required:true },
    measurements: { type:String, required:false },
    ausPostParcel: { type:String, required:false },
    isSold: { type:Boolean, required:true },
    active: { type:Boolean, required:true },
    sortIndex: { type:Number, required: false},
    productThumbs: { type:[String], required: true} 
},
{ collection : 'products' });
productSchema.index({description: 'text', productName: 'text', productId: 'text'});

module.exports = mongoose.model('Product', productSchema);