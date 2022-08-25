var express = require('express');
var router = express.Router();
var Session = require('./session');

// Security
const {deserializeUser} = require('passport');
var csrf = require('csurf');
var csrfProtection = csrf();
// router.use(csrfProtection);

/* View for HOME page.                           */
router.get('/', function (req, res, next) {    
    (async function () {
        res.render('site/index', {
            title: 'Baja La Bruja - Fighting Fast Fashion'
        });
    })();
});

/* View for La Bruja page.                      */
router.get('/labruja', function (req, res, next) {
    console.log(req.session.sessionData);
    res.render('site/labruja', {
        title: 'Baja La Bruja - F#ck Fast Fashion'
    });
});

/* View for F#ck fast fashion page.             */
router.get('/fff', function (req, res, next) {
    req.session.sessionData = null;
    res.render('site/fff', {
        title: 'Baja La Bruja - F#$ck Fast Fashion',
    });
});

/* View for Mixed Media page                     */
router.get('/mixedmedia', function (req, res, next) {
    console.log(req.session.sessionData);
    res.render('site/mixedmedia', {
        title: 'Baja La Bruja - Mixed Media'
    });
});


/* View for Contact page                        */
router.get('/contacts', function (req, res, next) {
    res.render('site/contacts', {
        title: 'Baja La Bruja - Contact Us',
    });
});


module.exports = router;