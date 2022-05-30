require("dotenv").config();
const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');

const port = process.env.PORT || 3001;

// Routers
const indexRouter = require("./Route/index");

const app = express();
app.use(express.json());

app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true});

// Using Routes
app.use("/", indexRouter);


app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
