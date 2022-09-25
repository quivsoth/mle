var passport = require('passport');
var User = require('../models/user');
var { nanoid } = require("nanoid");
var LocalStrategy = require('passport-local').Strategy;
var csrf = require('csurf');

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
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password - password must be 5 characters or more.').notEmpty().isLength({min:4});
    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done (null, false, req.flash('error', messages))
    }
    User.findOne({'email': email}, function (err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, {message: 'Email is already taken.'});
        }
        var newUser = new User();
        
        
        newUser.firstName = req.body.firstName;
        newUser.lastName = req.body.lastName;
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.billingAddress = null;
        newUser.shippingAddress = null;
        newUser.phoneNumber = null;
        newUser.failedAttempts = 0;
        newUser.verified = false;
        newUser.active = true;
        newUser.authToken = nanoid(64);

        newUser.save(function(err, result) {
            if(err) {
                return done(err);
            }
            return done(null, newUser);
        })
    });
}));


passport.use('local.signin', new LocalStrategy({
    usernameField: 'l',
    passwordField: 'p',
    passReqToCallback: true
}, function (req, email, password, done) {
    console.log("local.sign-in");

    req.checkBody('l', 'Invalid email').notEmpty().isEmail();
    req.checkBody('p', 'Invalid password').notEmpty();


    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done (null, false, req.flash('error', messages))
    }; 
    User.findOne({'email': email}, function (err, user) {
        if (err) {
            return done(err);
        }

        if (!user) {
            return done(null, false, {message: 'Sorry, we are unable to find to your user. Please check your email is typed in correctly?'});
        }
        
        if(!user.active) {
            return done(null, false, {message: 'Your account has been locked. You can unlock it by clicking on the \'Forgot Your Password\' option'});
        }
        
        if(!user.validPassword(password)) {
            user.failedAttempts += 1;
            user.save();
            if(user.failedAttempts >= 5) {
                user.active = false;
                user.save();
                return done(null, false, {message: 'Too many password attempts. Account locked. Please click on \'Forgot your password\' option below to reset your account.'});
            }
            return done(null, false, {message: 'Password is incorrect. Please try again.'});
        }

        if(user.active) {
            user.failedAttempts = 0;
            user.save();
            return done(null, user);
        }
    });
}));