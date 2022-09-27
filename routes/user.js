var express = require("express");
var router = express.Router();
var SibApiV3Sdk = require("sib-api-v3-sdk");

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

router.post("/a", function(req, res, next) {    
    passport.authenticate("local.signin", function(err, user, info) {
        if (err) { return next(err);} 
        if (user === false) {
            res.status = 401;
            res.send(info.message);
        } else {
            res.json("OK");
        }
     })(req, res, next);
});

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

router.post('/emailTest', function (req, res) {
    console.log('email test');
    var defaultClient = SibApiV3Sdk.ApiClient.instance;
    var apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.SENDINBLUE_SMTP_KEY;
    var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    var emailAddress = req.body.emailAddress;
    console.log(emailAddress);
    User.findOne({'email': emailAddress}, function (err, user) {
        if(err) {
            console.log(err);
        }
        if (!user) {
            res.json('Unable to find user.')
            console.log('Unable to find user.');
        }
        if (user) {
            console.log(user);

            sendSmtpEmail = {
                sender: {
                    email: "donotreply@bajalabruja.org",
                    name: "bajalabruja.org"
                },
            to: [
                {
                    email: user.email,
                    name: user.firstName + " " + user.lastName
                },
            ],
            subject: "Password Reset",
            htmlContent: EmailForgotPassword(user)
            };
            apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
                console.log("API called successfully. Returned data: " + data);
                res.sendStatus(200);
            }, function (error) {
                console.log(error);
                console.error(error);
            });
            res.json(user);
        }
    });
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



function EmailForgotPassword(user) {
    var body = `
    <!DOCTYPE html>
    <html>
        <head>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
            <link rel="stylesheet" href="https://baja.a2hosted.com/fonts/stylesheet.css">
        </head>
        <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#000; color:#FFF; padding: 1rem;">
            <h1> <img src="https://baja.a2hosted.com/images/baja_logo.png" style="max-height: 7rem;" alt="Baja la Bruja Logo"/> </h1>            
            <h3>Forgot your password?</h3>
            <p>Hi ${user.firstName},</p>
            <p>Please use the following link to reset your password: <a style='color:white; font-size:larger' href="http://www.bajalabruja.org/user/passwordReset?refId=${user.authToken}">RESET MY PASSWORD</a></p>
            <p>Thank you, <br> Baja La Bruja Team</p>
        </body>
    </html>    
    `
    return body;
}