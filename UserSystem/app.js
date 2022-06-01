require("dotenv").config();
require("./config/database").connect();

const express = require('express');
const cookieParser = require("cookie-parser");

// Routers
const indexRouter = require("./route/index");
const authRouter = require("./route/auth");

const app = express();
app.use(express.json());

app.use(cookieParser());

// Using Routes
app.use("/", indexRouter);
app.use("/auth", authRouter);


module.exports = app;
