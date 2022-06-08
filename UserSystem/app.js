require("dotenv").config();
require("./config/database").connect();

const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Routers
const dashboardRouter = require("./route/dashboard");
const authRouter = require("./route/auth");

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
    credentials: true
  }
));
app.use(cookieParser());

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
