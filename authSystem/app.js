require("dotenv").config();
require("./config/database").connect();

const express = require('express');

// Routers
const indexRouter = require("./route/index");
const authRouter = require("./route/auth");

const app = express();
app.use(express.json());

// Using Routes
app.use("/", indexRouter);
app.use("/auth", authRouter);


app.get("/dashboard", (req, res) => {
  res.send("This is secret information");
});

module.exports = app;
