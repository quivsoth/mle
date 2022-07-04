var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Product = require("../models/collection");

var transactionSchema = new Schema({
    userId: {type:Number, required:true },
    TransactionDate: {type:Date},
    Products: { type:[Product], required:true },
},
{ collection : 'transactions' });

module.exports = mongoose.model('TransactionSchema', transactionSchema);