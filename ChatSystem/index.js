require("dotenv").config();//for using environment variables
require("./config/database").connect();//Setting up the database connection

const express = require("express");//For creating server
const app = express();
var bodyParser = require('body-parser')//for reading json from form data
const http = require("http");
const cors = require("cors");//for enabling api requuest from external source
const { Server } = require("socket.io");//framework to use web sockets

const axios = require("axios").default;
const { URLSearchParams } = require('url');

const PORT = process.env.PORT || 3001

const Chat = require("./model/chat");

const activeSocketRooms = require("./helpers/activeSocketRooms");
const {otpedinUser} = require("./helpers/checkUserOptedin");
const {sendMessage} = require("./helpers/sendMessage");

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

//creating http server for uing it for socket.io
const server = http.createServer(app);

//creating a new socket server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(function(req, res, next) {
    req.io = io;
    next();
});

let activeChats = [];//store all the current active chats
let activeAgents = [];//store all the active agents in a perticular time
let assignList = [];//store if a agent gets assigned to chat with any specific customer


io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("Agent", async (data) => {
    //if the request is comming from an agent passing it into the activeAgnets list
    await activeAgents.push({...data});
  })

  //adding the agent in the Socket room
  socket.on("join_room", (data) => {
    io.sockets.emit("broadcast", data);//broadcasting so the all active rooms get updated for all users

    socket.join(data.room);

    //Getting message sent before agent joined the room
    for(i = 0; i < activeChats.length; i++){
      if(activeChats[i].room === data.room){
        socket.emit("room_joined", activeChats[i]);
        activeChats.splice(i, 1);
        break;
      }
    }

    //if an agent joined the room assigned room, removing it from assignList
    assignList = assignList.filter((i) => {
      return i.room !== data
    });

    // console.log(`User with ID: ${socket.id} joined room: ${data.room}`);
  });


  //listener when a new message will be send from client side
  socket.on("send_message", async (messageData) => {

    //Sending message
    await sendMessage(messageData.message, messageData.phoneNo);
  });

  //listener for disconnecting connection between customer and chat
  socket.on("disconnect_chat", async (data) => {
    io.sockets.emit("broadcast", {});//broadcasting so the all active rooms get updated for all users

    const {chat, agentName} = data;

    //getting the latest time for the chat
    const lastInteractionTime = chat.messageList[chat.messageList.length-1].time;

    const lastInteraction = `${lastInteractionTime} ${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`

    //Creating a new Chat Document
    const newChat = await Chat.create({
      customerName: chat.room,
      userPhoneNo: chat.phoneNo,
      messageList: chat.messageList,
      agentName,
      lastInteraction
    });

    //Removing agent from the room
    socket.leave(data.room);
  })

  //listener for reassigning the chat to another agent
  socket.on("reassign", (data) => {
    io.sockets.emit("broadcast", data);//broadcasting so the all active rooms get updated for all users
    assignList.push({room: data.room, agent: data.agent, assignedBy: data.assignedBy});

    //When a chat is reassign creating a new element in activeChats so that chat can be restored when a new agent joins the room
    activeChats.push({
      room: data.room,
      messages: [],
      phoneNo: data.phoneNo
    })

    //removing the current agent from h=the room, so that a new agent can join
    socket.leave(data.room);
  })

  socket.on("disconnect", async () => {
    console.log("User Disconnected", socket.id);
    io.sockets.emit("broadcast", {});

    //if a avtive agent got Disconnected removing it from the active agents list
    activeAgents = await activeAgents.filter((agent) => {
      return agent.id !== socket.id
    });
  });
});

app.post("/hook", async (req, res) => {
  console.log(req.body);
  const {type, payload} = req.body


  //Checking the request is an incoming message form whatsapp
  if(type === 'message'){

    await otpedinUser(payload.sender.dial_code, payload.sender.phone);

    //Checking if an agent is alreday joined the room
    const roomsWhichHaveAgent = await activeSocketRooms(req);

    const roomIndex = roomsWhichHaveAgent.indexOf(payload.sender.name);

    //If an agent is in the room
    if(roomIndex !== -1){
      const messageData = {
        room: payload.sender.name,
        author: payload.sender.name,
        message: payload.payload.text,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await io.to(payload.sender.name).emit("receive_message", messageData);

    }else{

      // Checking if this chat already in the activeChats
      for(let i=0; i<activeChats.length; i++){
        if(activeChats[i].room === payload.sender.name){
          activeChats[i].messages.push(payload.payload.text);
          return res.status(200).end();
        }
      }

      //if chat didn't exist then creating a new one
      activeChats.push({
        room: payload.sender.name,
        messages: [payload.payload.text],
        phoneNo: payload.sender.phone
      })
      io.sockets.emit("broadcast", {});

    }

  }
  return res.status(200).end();
})

//route for getting all the active rooms exist
app.get("/active_rooms", async (req, res) => {

    // storing active chat names in chats array
    const chats = activeChats.map(i => i.room);

    //checking if the room didnt already exist in the assignList
    for(i = 0; i < assignList.length; i++){

      const roomIndex = chats.indexOf(assignList[i].room)
      if(roomIndex !== -1){
        //if room exist in both arrays, this will remove that room from rooms array
        chats.splice(roomIndex, 1);
      }else{
        //if room didnt exist in both arrays, this will remove that room from assignList array
        assignList.splice(i, 1);
      }
    }
    res.json({rooms: chats});
})

app.get("/active_agents", (req, res) => {
  res.status(200).json({activeAgents});
});

//assign agent route used by manager to assign chats to different agents
app.post("/assign_agent", (req, res) => {
  const {room, agent, assignedBy} = req.body;

  assignList.push({room, agent, assignedBy});
  io.sockets.emit("broadcast", {});

  res.status(200).send("Assigned");
})

//route to get all the chats which are assigned by the manager
app.get("/assigned", (req, res) => {
  res.status(200).json({assignList})
});


server.listen(PORT, () => {
  console.log(`Chat Server Running on Port ${PORT}`);
});
