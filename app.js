require('dotenv').config();
var mongoose = require('mongoose');
var createError = require('http-errors');
var express = require('express');
var methodOverride = require('method-override');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs = require('express-handlebars');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');

var adminRouter = require('./routes/admin');
var cartRouter = require('./routes/cart');
var indexRouter = require('./routes/index');
var orderRouter = require('./routes/order');
var paymentRouter = require('./routes/payment');
var shippingRouter = require('./routes/shipping');
var shopRouter = require('./routes/shop');
var userRouter = require('./routes/user');

var app = express();
const uri = process.env.MONGO_DB;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

require('./config/passport');

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'bajasecurity',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: uri }),
  cookie: { maxAge: 180 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});

app.use('/', adminRouter);
app.use('/', cartRouter);
app.use('/', indexRouter);
app.use('/order', orderRouter);
app.use('/', paymentRouter);
app.use('/', shippingRouter);
app.use('/', shopRouter);
app.use('/user', userRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Handlebars custom handlers
var hbs = expressHbs.create({});

// register new function
hbs.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

module.exports = app;