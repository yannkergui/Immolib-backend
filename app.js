require("dotenv").config() // .env Link 
require("./models/connection") // DB Connection link
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var prosRouter = require('./routes/pros');


var app = express();
const cors = require("cors") // Cors installation
app.use(cors()) // Cors installation

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('pros',prosRouter)

module.exports = app;
