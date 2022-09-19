const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const db = require('./config/connection');
const session = require('express-session')
const nocache = require('nocache')


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  helpers: {
    inc: function (value, options) { return parseInt(value) + 1; },
    skip: function(allProducts){return allProducts.slice(0,8)}
  },
  extname: 'hbs', defaultLayout: 'user-layout', layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials/'
}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: "key", cookie: { maxAge: 600000 } }))

db.connect((err) => {
  if (err)
    console.log("Connection Error" + err);
  else console.log("Database Connected to port27017");
})
app.use(nocache())

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
