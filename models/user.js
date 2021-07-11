var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
    email: {type:String, required:true },
    password: {type:String, required:true}
});

userSchema.methods.encryptPassword = function (password) {
    console.log("Encrypt: " + password);
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function (password) {
    console.log("Decrypt: " + password);
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('User', userSchema);