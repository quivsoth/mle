var express = require('express');
var router = express.Router();

// Security
const {deserializeUser} = require('passport');
var csrf = require('csurf');
var csrfProtection = csrf();
// router.use(csrfProtection);


/* View for HOME page.                           */
router.get('/', function (req, res, next) {
    var messages = req.flash('info');
    res.render('site/index', {
        title: 'Baja La Bruja - Fighting Fast Fashion',
        messages: messages,
        hasMessages: messages.length > 0
    });
});

/* View for La Bruja page.                      */
router.get('/labruja', function (req, res, next) {
    var messages = req.flash('info');
    res.render('site/labruja', {
        title: 'Baja La Bruja - F#ck Fast Fashion',
        messages: messages,
        hasMessages: messages.length > 0
    });
});

/* View for F#ck fast fashion page.             */
router.get('/fff', function (req, res, next) {
    var messages = req.flash('info');
    res.render('site/fff', {
        title: 'Baja La Bruja - F#$ck Fast Fashion',
        messages: messages,
        hasMessages: messages.length > 0
    });
});

/* View for Mixed Media page                     */
router.get('/mixedmedia', function (req, res, next) {
    var messages = req.flash('info');
    res.render('site/mixedmedia', {
        title: 'Baja La Bruja - Mixed Media',
        messages: messages,
        hasMessages: messages.length > 0
    });
});


/* View for Contact page                        */
router.get('/contacts', function (req, res, next) {
    var messages = req.flash('info');
    res.render('site/contacts', {
        title: 'Baja La Bruja - Contact Us',
        messages: messages,
        hasMessages: messages.length > 0
    });
});


module.exports = router;