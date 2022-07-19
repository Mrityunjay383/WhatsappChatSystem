const express = require("express");
const router = express.Router();

const Customer = require("../model/customer");
const Template = require("../model/template");
const Chat = require("../model/chat");

const activeSocketRooms = require("../helpers/activeSocketRooms");
const { otpedinUser } = require("./helpers/checkUserOptedin");
const { sendMessage } = require("./helpers/sendMessage");


router.post("/hook", async (req, res) => {
  const {
    type,
    payload
  } = req.body

  //Checking the request is an incoming message form whatsapp
  if (type === 'message') {

    let managerDel;
    await axios.post(`${baseUserSystemURL}/indi_user`, {
      appName: req.body.app
    }, {
      validateStatus: false,
      withCredentials: true
    }).then((response) => {
      if (response.status === 200) {
        managerDel = response.data.foundUser;
      }
    });

    //storing a new user in the database if already not exist
    const user = await Customer.findOne({
      userPhoneNo: payload.source
    });

    if (!user) {
      const newCustomer = Customer.create({
        userName: payload.sender.name,
        userPhoneNo: payload.source
      })
    }


    await otpedinUser(payload.sender.dial_code, payload.sender.phone, managerDel);

    //Checking if an agent is alreday joined the room
    const roomsWhichHaveAgent = await activeSocketRooms(req.io);

    const roomIndex = roomsWhichHaveAgent.indexOf(payload.sender.name);
    //If an agent is in the room
    if (roomIndex !== -1) {
      const messageData = {
        room: payload.sender.name,
        author: payload.sender.name,
        message: payload.payload.text,
        time: new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await req.io.to(payload.sender.name).emit("receive_message", messageData);

    } else {
      req.io.sockets.emit("broadcast", {});
      // Checking if this chat already in the activeChats

      for (let i = 0; i < activeChats.length; i++) {
        if (activeChats[i].room === payload.sender.name) {
          activeChats[i].messages.push(payload.payload.text);
          return res.status(200).end();
        }
      }

      for (let i = 0; i < assignList.length; i++) {
        if (assignList[i].room === payload.sender.name) {
          assignList[i].messages.push(payload.payload.text);
          return res.status(200).end();
        }
      }

      //if chat didn't exist then creating a new one
      activeChats.push({
        room: payload.sender.name,
        messages: [payload.payload.text],
        phoneNo: payload.sender.phone,
        managerID: managerDel._id
      });
    }

  }

  return res.status(200).end();
})

//route for getting all the active rooms exist
router.get("/active_rooms", async (req, res) => {

  // storing active chat names in chats array
  const chats = activeChats;

  //checking if the room didnt already exist in the assignList
  for (i = 0; i < assignList.length; i++) {
    let isExist = false;
    for (j = 0; i < chats.length; j++) {
      if (chats[j].room === assignList[i].room) {
        chats.splice(j, 1);
        isExist = true;
        break;
      }
    }

  }

  res.json({
    chats
  });
})

router.get("/active_agents", (req, res) => {
  res.status(200).json({
    activeAgents
  });
});

//assign agent route used by manager to assign chats to different agents
router.post("/assign_agent", (req, res) => {
  req.io.sockets.emit("broadcast", {});

  const {
    room,
    agent,
    assignedBy
  } = req.body;

  let phoMessObj = {};
  for (let chat of activeChats) {
    if (chat.room === room) {
      phoMessObj.messages = chat.messages;
      phoMessObj.phoneNo = chat.phoneNo
    }
  }

  assignList.push({
    room,
    agentEmail: agent.email,
    assignedBy,
    ...phoMessObj
  });

  res.status(200).send("Assigned");

})

//route to get all the chats which are assigned by the manager
router.get("/assigned", (req, res) => {

  res.status(200).json({
    assignList
  });

});

router.post("/completedChats", async (req, res) => {
  const {managerID} = req.body;

  let foundChats;
  if(managerID){
    foundChats = await Chat.find({managerID});
  }else{
    foundChats = await Chat.find({});
  }

  res.status(200).json({chats: foundChats});
})

// Template functionalities

router.get("/noOfPendingTemplates", async (req, res) => {
  const pendingTemplates = await Template.find({
    status: "Pending"
  });
  const noOfPendingTemplates = pendingTemplates.length;

  res.status(200).json({
    noOfPendingTemplates
  });
})

router.post("/allTemplatesByManager", async (req, res) => {
  const {managerID} = req.body;

  const foundTemplates = await Template.find({requestByUID: managerID});

  res.status(200).json({templates: foundTemplates});
});

router.post("/add_new_template", async (req, res) => {
  const {
    name,
    format,
    sample,
    requestByName,
    requestByUID
  } = req.body;

  sendMessage(`A new template (${name}) is requested by ${requestByName}.`, process.env.ADMIN_NUMBER, process.env.GUPSHUP_TEMP_NOTICATION_NUM, process.env.GUPSHUP_APP_NAME, process.env.GUPSHUP_API_KEY);

  const currentDate = new Date().getTime();

  await Template.create({
    name,
    format,
    sample,
    requestByName,
    requestByUID,
    status: "Pending",
    creationDate: currentDate
  });

  const pendingTemplates = await Template.find({
    status: "Pending"
  });
  const noOfPendingTemplates = pendingTemplates.length;

  await req.io.emit("new_temp", {
    name,
    requestByName,
    noOfPendingTemplates
  });

  res.status(200).send("Done");

});

module.exports = router
