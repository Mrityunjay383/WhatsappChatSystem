import React, { useState, useEffect } from "react";
import "./ChatPage.css";
import axios from "axios";

import Chat from "./Chat";

const baseURL = "http://localhost:3001";

function ChatPage({socket}) {

    const [activeRooms, setActiveRooms] = useState([]);

    const [showChat, setShowChat] = useState(false);
    const [toBeJoinedRoom, setToBeJoinedRoom] = useState("");

    const getRooms = async () => {
      await axios.get(`${baseURL}/active_rooms`, { validateStatus: false, withCredentials: true }).then((response) => {
        setActiveRooms(response.data.rooms);
        console.log(activeRooms);
      });
    }

    const joinRoom = (room) => {
      if (room !== "") {
        socket.emit("join_room", `${room}`);
        setToBeJoinedRoom(room);
        setShowChat(true);
      }
    };

    const delRoom = () => {
      console.log(toBeJoinedRoom);
      axios.post(`${baseURL}/del_room`, {room: toBeJoinedRoom}, {validateStatus: false, withCredentials: true}).then((response) => {
        if(response.status === 200 && response.data.success){
          setToBeJoinedRoom("");
          setShowChat(false);
        }else{
          console.log("Failed");
        }
      });
    }

    useEffect(() => {
      getRooms();
    }, [])

    return (
        <div className="">
          <h1>Customers Requests</h1>

          {!showChat ? (
            <div>
              {activeRooms.map((room, index) => {
                return (
                  <div key={index}>
                    {room}
                    <button onClick={() => {
                      joinRoom(room)
                    }}>Join</button>
                  </div>)
              })}
            </div>
          ) : (
            <div>
              <Chat socket={socket} username="Agent" room={toBeJoinedRoom}/>
              <button onClick={delRoom}>Disconnect</button>
            </div>

          )}


        </div>
    )
}

export default ChatPage;
