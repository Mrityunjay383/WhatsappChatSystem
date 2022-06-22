import React, { useState, useEffect } from "react";
import "./ChatPage.css";
import axios from "axios";

import Chat from "./Chat";
import Sidebar from "../uiComponent/Sidebar";
import TopCon from "../uiComponent/TopCon";



import {socket} from "../chatComponents/socket";


function ChatPage({userData, baseURL, setIsLogedin}) {

    const [activeRooms, setActiveRooms] = useState([]);//store all active romms exist
    const [assignedChats, setAssignedChats] = useState([]);//store assigned rooms to agents
    const [activeAgents, setActiveAgents] = useState([]);

    const [currJoinedChats, setCurrJoinedChats] = useState([]);
    const [currActiveChat, setCurrActiveChat] = useState({
      room: "",
      messageList: []
    });

    const getActiveAgents = async () => {
      await axios.get(`${baseURL}/active_agents`, { validateStatus: false, withCredentials: true }).then(async (response) => {
        await setActiveAgents( () => {
          return response.data.activeAgents.filter((agent) => {
            return agent.email !== userData.email
          })
        });
      });
    }

    //Getting all active rooms exist currently
    const getRooms = async () => {

      await axios.get(`${baseURL}/active_rooms`, { validateStatus: false, withCredentials: true }).then((response) => {
        setActiveRooms(response.data.rooms);
      });
    }

    //Getting all assigned rooms to this agent
    const getAssignedChats = async () => {

      await axios.get(`${baseURL}/assigned`, { validateStatus: false, withCredentials: true }).then((response) => {
        //Filtering assigned rooms for this perticular agent
        setAssignedChats(() => {
          return response.data.assignList.filter((assined) => {
            return assined.agent.email === userData.email
          });
        });

      });
    }

    const reassign = async (e, room) => {
      const agentSelect = e.target.parentElement.querySelector(".agentSelect");
      const agent = activeAgents[agentSelect.selectedIndex];
      e.target.parentElement.parentElement.remove();
      await socket.emit("reassign", {room, agent, assignedBy: userData.name});
    }

    const ReassignCom = ({room}) => {
      return <div>
        <select className="agentSelect">
          {activeAgents.map((agent, index) => {
              return (
                <option value={agent.email}>{agent.name}</option>
              )
          })}
        </select>
        <button onClick={(e) => {
          reassign(e, `${room}`);
        }}>Reassign</button>
      </div>
    }

    const joinRoom = async (room) => {

      if (room !== "") {
        await socket.emit("join_room", `${room}`);
        setCurrJoinedChats((curr) => {
          return [...curr, {room, messageList: []}]
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
      socket.emit("Agent", {email: userData.email, name: userData.name});
      getRooms();
      getAssignedChats();
      getActiveAgents();
    }, []);

    useEffect(() => {
      socket.on("broadcast", (data) => {
        getRooms();
        getAssignedChats();
        setTimeout(getActiveAgents, 500);
      });
    }, [socket]);

    return (
        <div className="rootCon">

        <Sidebar role="Agent" baseURL={baseURL} setIsLogedin={setIsLogedin} page="chat" />


          <div className="dataCon">
            <TopCon userName={userData.name} page="Chat Requests"/>

              <div className="activeChatsCon">
                <div>
                  <h3>Assigned Chats</h3>

                  <div className="chatList">
                    {assignedChats.map((chat, index) => {
                      return (
                        <div key={index}>
                          <span>{chat.room}</span>
                          <span>{chat.assignedBy}</span>
                          <button className="joinbtn" onClick={() => {
                            joinRoom(chat.room);
                          }}>Join</button>
                        </div>
                      )
                    })}
                  </div>

                </div>


                <div>
                  <h3>Available Chats</h3>

                  <div className="chatList">
                    {activeRooms.map((room, index) => {
                      return (
                        <div key={index}>
                          {room}
                          <button className="joinbtn" onClick={() => {
                            joinRoom(room)
                          }}>Join</button>
                        </div>)
                    })}
                  </div>

                </div>
              </div>

              <div className="Chats">
                <div className="chatsListCon">
                  {currJoinedChats.map((room, index) => {
                    return <div className="chatsList">{room}</div>
                  })}
                </div>

                <div className="chatsCon">
                    <div className="chatCon">
                      <div className="chatTopCon">
                        <span>{currActiveChat.room}</span>
                        <ReassignCom room={currActiveChat.room} />
                      </div>
                      <Chat socket={socket} username="Agent" room={currActiveChat.room} messageList={currActiveChat.messageList} setCurrActiveChat={setCurrActiveChat}/>
                    </div>
                </div>
              </div>
          </div>

        </div>
    )
}

export default ChatPage;
