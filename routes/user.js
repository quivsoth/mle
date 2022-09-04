var express = require("express");
var router = express.Router();
const uri = process.env.MONGO_DB;
var csrf = require("csurf");
var passport = require("passport");
var User = require("../models/user");
var Subscriber = require("../models/subscriber");


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
    // res.render('user/signup', {csrfToken: req.csrfToken()});
    res.render("user/signup", {title: 'Baja La Bruja Signup',});
});

router.post("/signup", passport.authenticate("local.signup", {
    successRedirect: "/user/profile",
    failureRedirect: "/user/signup",
    failureFlash: true
}));

router.get("/signin", function (req, res, next) {
    res.render("user/signin", {title: 'Baja La Bruja - Fighting Fast Fashion',
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
        try {
            var emailAddress = req.body.email;
            const doc = new Subscriber({email: emailAddress});
            await doc.save();
            res.json("SUCCESS");
        } catch (error) {
            res.json("ERROR: " + error);
        }  
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