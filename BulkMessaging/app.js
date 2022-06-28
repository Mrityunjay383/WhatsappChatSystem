require("dotenv").config();
const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require("cors");//for enabling api requuest from external source

const port = process.env.PORT || 3003;

const {allOtpedUsers, allAprovedTemplates} = require("./helpers/getUsersOrTemplate");


const app = express();

//middleware using cors with options
app.use(cors({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
    credentials: true
  }
));

//Defining headers for cors
app.use(function(req, res, next) {
  res.header('Content-Type', 'application/json;charset=UTF-8')
  res.header('Access-Control-Allow-Credentials', true)
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
});

//middleware using bodyParser
app.use(bodyParser.json());


app.get("/", (req, res) => {
  res.send("Bulk Messaging MicroService");
})

app.get("/optedinUsers", async (req, res) => {
  const users = await allOtpedUsers();

  res.status(200).json({users});
})

app.get("/aprovedTemplates", async (req, res) => {
  const templates = await allAprovedTemplates();

  res.status(200).json({templates});
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
