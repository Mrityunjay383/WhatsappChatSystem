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

io.on("connection", (socket) => {
  // console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

app.get("/active_rooms", async (req, res) => {

    const arr = Array.from(io.sockets.adapter.rooms);

    const filtered = arr.filter(room => !room[1].has(room[0]))

    const rooms = filtered.map(i => i[0]);
    res.json({rooms});
})

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
