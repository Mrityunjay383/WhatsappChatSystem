require("dotenv").config();//for using environment variables
const express = require("express");//For creating server
const app = express();
var bodyParser = require('body-parser')//for reading json from form data
const http = require("http");
const cors = require("cors");//for enabling api requuest from external source
const { Server } = require("socket.io");//framework to use web sockets

const axios = require("axios").default;
const { URLSearchParams } = require('url');

const PORT = process.env.PORT || 3001

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

let activeChats = [];//store all the current active chats
let activeAgents = [];//store all the active agents in a perticular time
let assignList = [];//store if a agent gets assigned to chat with any specific customer

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("Agent", async (data) => {
    //if the request is comming from an agent passing it into the activeAgnets list
    await activeAgents.push({...data, id: socket.id});
  })

  //adding the user in the Socket room
  socket.on("join_room", (data) => {
    io.sockets.emit("broadcast", data);//broadcasting so the all active rooms get updated for all users

    socket.join(data);

    //if an agent joined the room assigned room, removing it from assignList
    assignList = assignList.filter((i) => {
      return i.room !== data
    });


    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  //listener when a new message will be send from client side
  socket.on("send_message", (data) => {
    //sending the message to the perticular room
    socket.to(data.room).emit("receive_message", data);
  });

  //listener for reassigning the chat to another agent
  socket.on("reassign", (data) => {
    io.sockets.emit("broadcast", data);//broadcasting so the all active rooms get updated for all users
    socket.leave(data.room);
    assignList.push({room: data.room, agent: data.agent, assignedBy: data.assignedBy});
  })

  socket.on("disconnect", async () => {
    console.log("User Disconnected", socket.id);
    io.sockets.emit("broadcast", {});
    //if a avtive agent got Disconnected removing it from the active agents list
    activeAgents = activeAgents.filter((agent) => {
      return agent.id !== socket.id
    });
  });
});

app.post("/hook", async (req, res) => {
  console.log(req.body);
  const {type, payload} = req.body

  //Checking the request is an incoming message form whatsapp
  if(type === 'message'){

    //Checking if this chat already in the activeChats
    for(let i=0; i<activeChats.length; i++){
      if(activeChats[i].room === payload.sender.name){
        activeChats[i].messages.push(payload.payload.text);

        return res.status(200).end();
      }
    }

    //if chat didn't exist the creating a new one
    activeChats.push({
      room: payload.sender.name,
      messages: [payload.payload.text]
    })

    return res.status(200).end();
  }
})

app.post("/send_message", (req, res) => {

  const {destination, message} = req.body;

  const encodedParams = new URLSearchParams();
  encodedParams.set('message', `{"text": "${message}","type":"text"}`);
  encodedParams.set('channel', 'whatsapp');
  encodedParams.set('source', '917834811114');
  encodedParams.set('destination', destination);
  encodedParams.set('src.name', 'cberotaryuptown');
  encodedParams.set('disablePreview', 'false');

  const options = {
    method: 'POST',
    url: 'https://api.gupshup.io/sm/api/v1/msg',
    headers: {
      Accept: 'application/json',
      apikey: process.env.GUPSHUP_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: encodedParams,
  };

  axios.request(options).then(function (response) {
    res.status(200).json({data: response.data});
  }).catch(function (error) {
    console.error(error);
  });
})

//route for getting all the active rooms exist
app.get("/active_rooms", async (req, res) => {

    const arr = Array.from(io.sockets.adapter.rooms);//getting map of current active rooms from socket

    let filtered = arr.filter(room => !room[1].has(room[0]))

    //checking if some agent is already in the room
    filtered = filtered.filter((i) => {
      return Array.from(i[1]).length === 1
    })

    //storing room names in rooms array
    const rooms = filtered.map(i => i[0]);

    //checking if the room didnt already exist in the assignList
    for(i = 0; i < assignList.length; i++){

      const roomIndex = rooms.indexOf(assignList[i].room)
      if(roomIndex !== -1){
        //if room exist in both arrays, this will remove that room from rooms array
        rooms.splice(roomIndex, 1);
      }else{
        //if room didnt exist in both arrays, this will remove that room from assignList array
        assignList.splice(i, 1);
      }
    }

    res.json({rooms});
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

// app.post("/del_room", async (req, res) => {
//
//   const {room} = req.body;
//
//   const arr = Array.from(io.sockets.adapter.rooms);
//
//   const filtered = arr.filter(room => !room[1].has(room[0]));
//   let clientsList = [];
//   for(i of filtered) {
//     if(i[0] === room){
//       clientsList = Array.from(i[1]);
//       break;
//     }
//   };
//
//   console.log(clientsList);
//   await clientsList.forEach(client => io.sockets.sockets[client].leave(room));
//
//   res.status(200).send("Room Deleted");
// });

server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
