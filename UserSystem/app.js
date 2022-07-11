require("dotenv").config();//for using environment variables
require("./config/database").connect();//Setting up the database connection

const express = require('express');//for creating server
const cookieParser = require("cookie-parser");//for storing cookies
const cors = require("cors");//for enabling api requuest from external source

// Routers
const dashboardRouter = require("./route/dashboard");
const authRouter = require("./route/auth");

const app = express();

//middleware using json from express
app.use(express.json());

//middleware using cors with options
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    optionsSuccessStatus: 200,
    credentials: true
  }
));

//middleware using cookieParser
app.use(cookieParser());

//Defining headers for cors
app.use(function(req, res, next) {
  res.header('Content-Type', 'application/json;charset=UTF-8')
  res.header('Access-Control-Allow-Credentials', true)
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

// Using Routes
app.use("/", dashboardRouter);
app.use("/auth", authRouter);


module.exports = app;
