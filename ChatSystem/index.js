const express = require("express");
const app = express();
var bodyParser = require('body-parser')
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
    credentials: true
  }
));

app.use(function(req, res, next) {
  res.header('Content-Type', 'application/json;charset=UTF-8')
  res.header('Access-Control-Allow-Credentials', true)
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
});

app.use(bodyParser.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let activeAgents = [];//this will store all the active agents in a perticular time
let assignList = [];//this will store if a agent gets assigned to chat with any specific customer

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("Agent", (data) => {
    //if the request is comming from an agent passing it into the activeAgnets list
    activeAgents.push({...data, id: socket.id});
  })

  socket.on("join_room", (data) => {
    io.sockets.emit("broadcast", data);//broadcasting so the all active rooms get updated for all users

    socket.join(data);

    assignList = assignList.filter((i) => {
      return i.room !== data
    });
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("reassign", (data) => {
    io.sockets.emit("broadcast", data);//broadcasting so the all active rooms get updated for all users
    socket.leave(data.room);
    assignList.push({room: data.room, agent: data.agent, assignedBy: data.assignedBy});
  })

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    //if a avtive agent got Disconnected removing it from the active agents list
    activeAgents = activeAgents.filter((agent) => {
      return agent.id !== socket.id
    });
  });
});

app.get("/active_rooms", async (req, res) => {

    const arr = Array.from(io.sockets.adapter.rooms);

    let filtered = arr.filter(room => !room[1].has(room[0]))

    //checking if some agent is already in the room
    filtered = filtered.filter((i) => {
      return Array.from(i[1]).length === 1
    })

    const rooms = filtered.map(i => i[0]);

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

app.post("/assign_agent", (req, res) => {
  const {room, agent, assignedBy} = req.body;

  assignList.push({room, agent, assignedBy});
  io.sockets.emit("broadcast", {});

  res.status(200).send("Assigned");
})

app.get("/assigned", (req, res) => {
  res.status(200).json({assignList})
});

app.post("/del_room", async (req, res) => {

  const {room} = req.body;

  const arr = Array.from(io.sockets.adapter.rooms);

  const filtered = arr.filter(room => !room[1].has(room[0]));
  let clientsList = [];
  for(i of filtered) {
    if(i[0] === room){
      clientsList = Array.from(i[1]);
      break;
    }
  };

  console.log(clientsList);
  await clientsList.forEach(client => io.sockets.sockets[client].leave(room));

  res.status(200).send("Room Deleted");
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
