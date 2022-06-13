import React, { useState, useEffect } from "react";
import "./ChatPage.css";
import axios from "axios";

import Chat from "./Chat";

import {socket} from "../chatComponents/socket";


function ChatPage({userData, baseURL}) {

    const [activeRooms, setActiveRooms] = useState([]);//store all active romms exist
    const [assignedRooms, setAssignedRooms] = useState([]);//store assigned rooms to agents

    const [currChats, setCurrChats] = useState([]);

    //Getting all active rooms exist currently
    const getRooms = async () => {
      await axios.get(`${baseURL}/active_rooms`, { validateStatus: false, withCredentials: true }).then((response) => {
        setActiveRooms(response.data.rooms);
      });
    }

    //Getting all assigned rooms to this agent
    const getAssignedRooms = async () => {
      await axios.get(`${baseURL}/assigned`, { validateStatus: false, withCredentials: true }).then((response) => {
        //Filtering assigned rooms for this perticular agent
        setAssignedRooms(() => {
          return response.data.assignList.filter((assined) => {
            return assined.agent.email === userData.email
          });
        })
      });
    }

    const joinRoom = (room) => {
      if (room !== "") {
        socket.emit("join_room", `${room}`);
        setCurrChats((curr) => {
          return [...curr, <Chat socket={socket} username="Agent" room={room}/>]
        })

      }
    };

    // const delRoom = () => {
    //   console.log(toBeJoinedRoom);
    //   axios.post(`${baseURL}/del_room`, {room: toBeJoinedRoom}, {validateStatus: false, withCredentials: true}).then((response) => {
    //     if(response.status === 200 && response.data.success){
    //       setToBeJoinedRoom("");
    //       setShowChat(false);
    //     }else{
    //       console.log("Failed");
    //     }
    //   });
    // }

    useEffect(() => {
      getRooms();
      getAssignedRooms();
    }, [])

    useEffect(() => {
      socket.emit("Agent", {email: userData.email, name: userData.name});
    }, [])

    return (
        <div className="">
          <h1>Customers Requests</h1>

            <div>

              <div>
                <h3>Assigned Chat:</h3>

                {assignedRooms.map((room, index) => {
                  return (
                    <div key={index}>
                      {room.room}
                      <button onClick={(e) => {
                        joinRoom(room.room)
                        e.target.innerText = "Joined"
                      }}>Join</button>
                      <span>Assigned by: {room.assignedBy}</span>
                    </div>
                  )
                })}
              </div>


              <div>
                <h3>Available Chat:</h3>

                {activeRooms.map((room, index) => {
                  return (
                    <div key={index}>
                      {room}
                      <button onClick={(e) => {
                        joinRoom(room)
                        e.target.innerText = "Joined"
                      }}>Join</button>
                    </div>)
                })}
              </div>

            </div>

            <div className="Chats">
              {currChats.map((chat, index) => {
                return chat
              })}
            </div>

        </div>
    )
}

export default ChatPage;
