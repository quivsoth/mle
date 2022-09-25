var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var addressSchema = new Schema({
    streetName: { type:String, required:true },
    city: { type:String, required:true },
    state: { type:String, required:true },
    postcode: { type:Number, required:true },
    specialNotes: { type:String, required:false },
    active: { type:Boolean, required:true }
},
{ collection : 'users' });

var userSchema = new Schema({
    firstName: {type:String, required:true },
    lastName: {type:String, required:true },    
    email: {type:String, required:true },
    password: {type:String, required:true},
    billingAddress: { type:Object, required:false },
    shippingAddress: { type:Object, required:false },
    phoneNumber: {type:Number, required:false },
    failedAttempts: {type:Number, required:false },
    verified: {type:Boolean, required:true},
    active: {type:Boolean, required:true},
    authToken: {type:String, required:true}
},
{ collection : 'users' });

userSchema.methods.encryptPassword = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Address', addressSchema);
module.exports = mongoose.model('User', userSchema);