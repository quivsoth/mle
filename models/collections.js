var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    collectionName: {type: String, required: true},
    image: {type: String, required: true},
    active: {type: Boolean, required: true},
    orderIndex: {type: Number, required: true}
});

module.exports = mongoose.model('Collections', schema);