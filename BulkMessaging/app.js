require("dotenv").config();//for using environment variables
require("./config/database").connect();//Setting up the database connection

const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require("cors");//for enabling api requuest from external source

const PORT = process.env.PORT || 3003;

const app = express();

const {allOtpedUsers, allAprovedTemplates} = require("./helpers/getUsersOrTemplate");
const {sendMessage} = require("./helpers/sendMessage");
const Customer = require("./model/customer");

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
});

app.post("/broadcastMessage", async (req, res) => {

  const {message, toBeBroadcastNo} = req.body;

  for(let phoneNo of toBeBroadcastNo){
      await sendMessage(message, phoneNo);
  }
  res.send("Broadcasting Done");
})

//route for getting all the stored customers
app.get("/storedCustomers", async (req, res) => {
  const allCustomers = await Customer.find();
  if(allCustomers){
    res.status(200).json({users: allCustomers});
  }else{
    console.log("Some Error!!!");
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
