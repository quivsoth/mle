var express = require("express");
var router = express.Router();
const uri = process.env.MONGO_DB;
var csrf = require("csurf");
var passport = require("passport");
var User = require("../models/user");

// var csrfProtection = csrf();
// router.use(csrfProtection);

router.get("/profile", isLoggedIn, function (req, res, next) {
    if (isLoggedIn) 
        res.render("user/profile");
     else 
        res.render("user/signin");
    

});

router.use("/", notLoggedIn, function (req, res, next) {
    next();
});

router.get("/signup", function (req, res, next) {
    let messages = req.flash("error");
    // res.render('user/signup', {csrfToken: req.csrfToken()});
    res.render("user/signup", {
        messages: messages,
        hasErrors: messages.length > 0
    });
});

router.post("/signup", passport.authenticate("local.signup", {
    successRedirect: "/user/profile",
    failureRedirect: "/user/signup",
    failureFlash: true
}));

router.get("/signin", function (req, res, next) {
    let messages = req.flash("error");
    res.render("user/signin", {
        messages: messages,
        hasErrors: messages.length > 0
    });
});

router.post("/signin", passport.authenticate("local.signin", {
    successRedirect: "/user/profile",
    failureRedirect: "/user/signin",
    failureFlash: true
}));

router.get("/logout", function (req, res, next) {
    req.logout();
    res.redirect("/");
});

/*      Description: Checkout of Shopping Cart.
        Method: GET                           */
router.get('/checkout1', function (req, res, next) {
    (async function () {
        res.render('cart/checkout', {});
    })();
});


var Subscriber = require("../models/subscriber");
/*    Description: View for HOME page.
      Method: GET                     */
router.get('/', function (req, res, next) {
    var messages = req.flash('info');
    res.render('site/index', {
        title: 'Baja La Bruja - Fighting Fast Fashion',
        messages: messages,
        hasMessages: messages.length > 0
    });
});

/*      Description: Checkout of Shopping Cart.
        Method: GET                           */
router.get('/subscribers', function (req, res, next) {
    (async function () {
        const all = await Subscriber.find();
        var emails = [];
        for (let i = 0; i < all.length; i++) {
            emails.push(all[i].email);
        }
        res.render('site/subscribers', {subscribers: emails});
    })();
});

/*      Description: Add email to subscription list
        Method: PUT                           */
router.put('/emailSubscribe', function (req, res) {
    (async function () {
        var emailAddress = req.body.email;
        const doc = new Subscriber({email: emailAddress});

        await doc.save();

        req.flash('info', 'Thank you for subscribing!');
        var referrer = req.headers['referer'];
        res.redirect(referrer);
    })();
});

/*      Description: Add email to subscription list
        Method: PUT                           */
router.put('/newUser', function (req, res) {
    (async function () {
        console.log("New User Functionality");

        var address = {
            streetName: "21 Highview Grove", 
            city: "Burwood East",
            state:  "VIC",
            postcode: "3151",
            specialNotes: "deliver at garage",
            active: true
        };

        var person = new User({
            firstName: "First",
            lastName: "Person",
            phoneNumber: "98036705",
            email: "james.jogn@gmail.com",
            password: "$r3#b4t434!!@",
            billingAddress: address,
            shippingAddress: address
        });
        await person.save();
        res.send(person);

    })();
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}

function notLoggedIn(req, res, next) {
    if (! req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}