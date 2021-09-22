var express = require("express");
var router = express.Router();
const uri = `mongodb://192.168.1.3:27017`;
var csrf = require("csurf");
var passport = require("passport");

// var csrfProtection = csrf();
// router.use(csrfProtection);

router.get("/profile", isLoggedIn, function (req, res, next) {
    if(isLoggedIn) res.render("user/profile");
    else res.render("user/signin");
  });

router.use("/", notLoggedIn, function (req, res, next) {
  next();
});

router.get("/signup", function (req, res, next) {
  let messages = req.flash("error");
  // res.render('user/signup', {csrfToken: req.csrfToken()});
  res.render("user/signup", {
    messages: messages,
    hasErrors: messages.length > 0,
  });
});

router.post(
  "/signup",
  passport.authenticate("local.signup", {
    successRedirect: "/user/profile",
    failureRedirect: "/user/signup",
    failureFlash: true,
  })
);

router.get("/signin", function (req, res, next) {
  let messages = req.flash("error");
  res.render("user/signin", {
    messages: messages,
    hasErrors: messages.length > 0,
  });
});

router.post(
  "/signin",
  passport.authenticate("local.signin", {
    successRedirect: "/user/profile",
    failureRedirect: "/user/signin",
    failureFlash: true,
  })
);

router.get("/logout", function (req, res, next) {
  req.logout();
  res.redirect("/");
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
