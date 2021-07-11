var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    User.findOne({'email': email}, function (err, user) {
        if (err) {
            console.log( 'Error found.');
            return done(err);
        }
        if (user) {
            console.log( 'Exists found.');
            return done(null, false, {message: 'Email is already in user.'});
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err, result) {
            if(err) {
                return done(err);
            }
            return done(null, newUser);
        })
    });
}));











// // const {MongoClient} = require('mongodb');
// var bcrypt = require('bcrypt-nodejs');
// const uri = `mongodb://192.168.1.3:27017`;


// function encryptPassword (password) {
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
// }

// function validPassword (password) {
//     return bcrypt.compareSync(password, this.passport, null);
// }


// passport.serializeUser(function(user, done) {
//     done(null, user.id);
// });

// passport.deserializeUser(function(id, done){
//     //user find by id    //call back
//     done(err, user);
// });


// passport.use('local.signup', new LocalStrategy({
//     usernameField: 'email',
//     passwordField: 'password',
//     passReqToCallback: true
// }, function (req, email, password, done){
//     //user findone ({email})
//     getUser(email);
//     // if theres a user then the account exists
//     return done(null, false, {message: 'Email is already is use.'});


// }));



// async function getUser(emailAddress){
//     const client = new MongoClient(uri, { useUnifiedTopology: true });
//     try {
//         await client.connect();
//         const person = await client.db("shop").collection("user").findOne({email: emailAddress});
//         return person;
//     } catch (e) { console.error(e); }
//     finally { await client.close(); }
// }