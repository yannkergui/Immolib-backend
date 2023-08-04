require("dotenv").config(); // .env Link
require("./models/connection"); // DB Connection link
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: 'dnzrnfglq', 
    api_key: '171712511772765', 
    api_secret: 'nI7jg112udiMV97LUEVObvtfDfM' 
  });


var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var prosRouter = require("./routes/pros");
var biensRouter = require("./routes/bienImmo");
var disponibilitesRouter = require("./routes/disponibilites");
var visitesRouter = require("./routes/visites");

var app = express();
const cors = require("cors"); // Cors installation
app.use(cors()); // Cors installation

const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/pros", prosRouter);
app.use("/biens", biensRouter);
app.use("/disponibilites", disponibilitesRouter);
app.use("/visites", visitesRouter);

module.exports = app;
