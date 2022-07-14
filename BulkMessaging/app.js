require("dotenv").config();//for using environment variables
require("./config/database").connect();//Setting up the database connection

const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require("cors");//for enabling api requuest from external source

const axios = require("axios").default;
const { URLSearchParams } = require('url');

const PORT = process.env.PORT || 3003;
const baseUserSystemURL = "http://localhost:3002";

const app = express();

const {allOtpedUsers, allAprovedTemplates} = require("./helpers/getUsersOrTemplate");
const {sendMessage} = require("./helpers/sendMessage");
const Customer = require("./model/customer");
const Template = require("./model/template");

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

app.post("/optedinUsers", async (req, res) => {
  const {userId} = req.body;

  let managerDel;
  await axios.post(`${baseUserSystemURL}/indi_user`, {userId}, {validateStatus: false, withCredentials: true}).then((response) => {
    if(response.status === 200){
      managerDel = response.data.foundUser;
    }
  });

  const users = await allOtpedUsers(managerDel.appName, managerDel.apiKey);

  res.status(200).json({users});
})

app.post("/aprovedTemplates", async (req, res) => {
  const {userId} = req.body;

  let managerDel;
  await axios.post(`${baseUserSystemURL}/indi_user`, {userId}, {validateStatus: false, withCredentials: true}).then((response) => {
    if(response.status === 200){
      managerDel = response.data.foundUser;
    }
  });

  const templates = await allAprovedTemplates(managerDel.appName, managerDel.apiKey);
  res.status(200).json({templates});
});

app.post("/broadcastMessage", async (req, res) => {

  const {message, toBeBroadcastNo, userId} = req.body;

  let managerDel;
  await axios.post(`${baseUserSystemURL}/indi_user`, {userId}, {validateStatus: false, withCredentials: true}).then((response) => {
    if(response.status === 200){
      managerDel = response.data.foundUser;
    }
  });

  for(let phoneNo of toBeBroadcastNo){
    if(phoneNo !== ""){
      await sendMessage(message, phoneNo, managerDel.assignedNumber, managerDel.appName, managerDel.apiKey);
    }
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

app.get("/get_all_templates", async (req, res) => {
  const allTemplates = await Template.find();

  if(allTemplates){

    let pendingAtTop = [];
    let pendingIndex = 0, submittedIndex = 0;
    for(let template of allTemplates){
      if(template.status === "Pending"){
        pendingAtTop.unshift(template);
        pendingIndex++;
      }else if(template.status === "Submitted"){
        pendingAtTop.splice(pendingIndex, 0, template);
        submittedIndex++;
      }else{
        pendingAtTop.splice(pendingIndex+submittedIndex, 0, template);
      }
    }

    return res.status(200).json({allTemplates: pendingAtTop});
  }
  return res.status(404).send("Templates not found");

});

app.post("/updateTempStatus", async (req, res) => {
  const {tempID, status} = req.body;

  const template = await Template.findOne({_id: tempID});

  if(template){
    template.status = status;
    template.save((err) => {
      if(!err){
        return res.status(200).send("Status Changed");
      }
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
