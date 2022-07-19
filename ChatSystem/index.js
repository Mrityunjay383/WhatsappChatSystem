require("dotenv").config(); //for using environment variables
require("./config/database").connect(); //Setting up the database connection

const express = require("express"); //For creating server
const app = express();
var bodyParser = require('body-parser') //for reading json from form data
const http = require("http");
const cors = require("cors"); //for enabling api requuest from external source
const {
  Server
} = require("socket.io"); //framework to use web sockets

const axios = require("axios").default;
const {
  URLSearchParams
} = require('url');

const PORT = process.env.PORT || 3001
const baseUserSystemURL = "http://localhost:3002";

const Chat = require("./model/chat");

const activeSocketRooms = require("./helpers/activeSocketRooms");
const {
  sendMessage
} = require("./helpers/sendMessage");

//middleware using cors with options
app.use(cors({
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true
}));

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

//passing the io to all routes
app.use(function(req, res, next) {
  req.io = io;
  next();
});

//router
const indexRouter = require("./route/route");


let activeChats = []; //store all the current active chats
let activeAgents = []; //store all the active agents in a perticular time
let assignList = []; //store if a agent gets assigned to chat with any specific customer


io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("Agent", async (data) => {
    //if the request is comming from an agent passing it into the activeAgnets list
    if(activeAgents.some(agent => agent.email === data.email)){
      console.log("Agent Already In");
    }else{
      await activeAgents.push({
        ...data
      });
    }

  })

  //adding the agent in the Socket room
  socket.on("join_room", async (data) => {
    io.sockets.emit("broadcast", data); //broadcasting so the all active rooms get updated for all users

    //getting all the current active socket rooms
    const roomsWhichHaveAgent = await activeSocketRooms(io);

    //checking if data.room already exist in the active rooms
    const roomIndex = roomsWhichHaveAgent.indexOf(data.room);

    //if data.room didn't exist in the active room genrating the new room
    if (roomIndex === -1) {

      //checking if the chat is from assig list
      if (assignList.length > 0) {
        for (i = 0; i < assignList.length; i++) {
          if (assignList[i].room === data.room) {
            socket.emit("room_joined", assignList[i]);
            assignList.splice(i, 1);
            break;
          }
        }
      }

      // Getting message sent before agent joined the room
      for (i = 0; i < activeChats.length; i++) {
        if (activeChats[i].room === data.room) {
          socket.emit("room_joined", activeChats[i]);
          activeChats.splice(i, 1);
          break;
        }
      }

      socket.join(data.room);
    }
    // console.log(`User with ID: ${socket.id} joined room: ${data.room}`);
  });


  //listener when a new message will be send from client side
  socket.on("send_message", async (messageData) => {

    let userId, managerDel;

    if(messageData.creatorUID){
      userId = messageData.creatorUID
    }else{
      userId = messageData.uID;
    }

    await axios.post(`${baseUserSystemURL}/indi_user`, {
      userId
    }, {
      validateStatus: false,
      withCredentials: true
    }).then((response) => {
      if (response.status === 200) {
        managerDel = response.data.foundUser;
      }
    });

    //Sending message
    await sendMessage(messageData.message, messageData.phoneNo, managerDel.assignedNumber, managerDel.appName, managerDel.apiKey);
  });

  //listener for disconnecting connection between customer and chat
  socket.on("disconnect_chat", async (data) => {

    //broadcasting so the all active rooms get updated for all users
    io.sockets.emit("broadcast", {});
    const {
      chat,
      agentName,
      managerID
    } = data;

    let lastInteraction = new Date().getTime();

    //Creating a new Chat Document
    const newChat = await Chat.create({
      customerName: chat.room,
      userPhoneNo: chat.phoneNo,
      messageList: chat.messageList,
      agentName,
      managerID,
      lastInteraction
    });

    //Removing agent from the room
    socket.leave(chat.room);
  })

  //listener for reassigning the chat to another agent
  socket.on("reassign", (data) => {
    io.sockets.emit("broadcast", data); //broadcasting so the all active rooms get updated for all users

    assignList.push({
      room: data.room,
      agentEmail: data.agentEmail,
      managerID: data.managerID,
      assignedBy: data.assignedBy,
      messages: [],
      phoneNo: data.phoneNo
    });

    //removing the current agent from the room, so that a new agent can join
    socket.leave(data.room);
  })

  socket.on("disconnect", async () => {
    console.log("User Disconnected", socket.id);
    io.sockets.emit("broadcast", {});

    //if a avtive agent got Disconnected removing it from the active agents list
    activeAgents = await activeAgents.filter((agent) => {
      return agent.socket_id !== socket.id
    });
  });
});

// Using Routes
app.use("/", indexRouter);

server.listen(PORT, () => {
  console.log(`Chat Server Running on Port ${PORT}`);
});
