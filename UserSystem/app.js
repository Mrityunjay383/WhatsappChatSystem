require("dotenv").config();
require("./config/database").connect();

const express = require('express');
const cookieParser = require("cookie-parser");

// Routers
const dashboardRouter = require("./route/dashboard");
const authRouter = require("./route/auth");

const app = express();
app.use(express.json());

app.use(cookieParser());

// Using Routes
app.use("/", dashboardRouter);
app.use("/auth", authRouter);


module.exports = app;
