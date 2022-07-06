import React, { useState, useEffect } from "react";
import "./ChatPage.css";
import axios from "axios";

import Chat from "./Chat";
import Sidebar from "../uiComponent/Sidebar";
import TopCon from "../uiComponent/TopCon";


function ChatPage({socket, userData, baseURL, setIsLogedin}) {

    const [activeRooms, setActiveRooms] = useState([]);//store all active romms exist
    const [assignedChats, setAssignedChats] = useState([]);//store assigned rooms to agents
    const [activeAgents, setActiveAgents] = useState([]);

    const [currJoinedChats, setCurrJoinedChats] = useState([]);
    const [currActiveChat, setCurrActiveChat] = useState({
      room: "",
      phoneNo: "",
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

    const disconnect = async (room) => {

      await socket.emit("disconnect_chat", {chat: currActiveChat, agentName: userData.name});

      currJoinedChats.forEach((chat, index) => {
        if(chat.room === room){
          setCurrJoinedChats((curr) => {
            console.log(curr.splice(index, 1));
            return [...curr]
          })
        }
      })

      if(currJoinedChats.length > 0){
        setCurrActiveChat(currJoinedChats[0]);
      }else{
        setCurrActiveChat({
          room: "",
          messageList: []
        });
      }

    }

    const reassign = async (e, room) => {
      const agentSelect = e.target.parentElement.querySelector(".agentSelect");
      const agent = activeAgents[agentSelect.selectedIndex];
      // e.target.parentElement.parentElement.parentElement.remove();

      if(agent != undefined){
        await socket.emit("reassign", {room, agent, phoneNo: currActiveChat.phoneNo, assignedBy: userData.name});
        await socket.emit("disconnect_chat", {chat: currActiveChat, agentName: userData.name});

        currJoinedChats.forEach((chat, index) => {
          if(chat.room === room){
            setCurrJoinedChats((curr) => {
              console.log(curr.splice(index, 1));
              return [...curr]
            })
          }
        })

        if(currJoinedChats.length > 0){
          setCurrActiveChat(currJoinedChats[0]);
        }else{
          setCurrActiveChat({
            room: "",
            messageList: []
          });
        }
      }else{
        console.log("No agent Selected");
      }
    }


    const ReassignCom = ({room}) => {
      return <div>
        <select className="agentSelect">
          {activeAgents.map((agent, index) => {
              return (
                <option key={index} value={agent.email}>{agent.name}</option>
              )
          })}
        </select>
        <button className="joinbtn" onClick={(e) => {
          reassign(e, `${room}`);
        }}>Reassign</button>
      </div>
    }

    const joinRoom = async (room) => {

      if (room !== "") {
        await socket.emit("join_room", {room, email: userData.email});
      }
    };

    const changeChat = async (room) => {

      for(let i = 0; i < currJoinedChats.length; i++){
        if(currJoinedChats[i].room === currActiveChat.room){

          await setCurrJoinedChats((curr) => {
            curr.splice(i, 1, currActiveChat);
            return [...curr]
          })
          break;
        }
      }


      await currJoinedChats.forEach((chat) => {
        if(chat.room === room){
          setCurrActiveChat((curr) => {
            return {...curr, room: chat.room, phoneNo: chat.phoneNo, messageList: chat.messageList}
          });
        }
      });

    }

    useEffect(() => {
      socket.emit("Agent", {email: userData.email, name: userData.name, id: socket.id});
      getRooms();
      getAssignedChats();
      getActiveAgents();

      // sessionStorage.removeItem('currJoinedChats');

      const chats = sessionStorage.getItem("currJoinedChats");
      if(chats != null){
        setCurrJoinedChats(JSON.parse(chats));
      }else{
        console.log("Chats not exist");
      }
    }, []);

    useEffect(() => {
      //broadcast is used for dynamiclly updating if there is any change in socket
      socket.on("broadcast", (data) => {
        getRooms();
        setTimeout(() => {
          getActiveAgents();
          getAssignedChats();
        }, 500);
      });

      //Populating message sent before agent joined room
      socket.on("room_joined", (data) => {

        const messageList = [];
        data.messages.forEach((message, index) => {

          const messageData = {
            room: data.room,
            author: data.room,
            message: message,
            time:
              new Date(Date.now()).getHours() +
              ":" +
              new Date(Date.now()).getMinutes(),
          };

          messageList.push(messageData);
        })

        setCurrJoinedChats((curr) => {
          return [...curr, {room: data.room, phoneNo: data.phoneNo, messageList}]
        })
        if(currActiveChat.room === ""){
          setCurrActiveChat({
            room: data.room,
            phoneNo: data.phoneNo,
            messageList
          })
        }

      })

    }, [socket]);

    useEffect(() => {

      sessionStorage.setItem("currJoinedChats", JSON.stringify(currJoinedChats));

      for(let chat of currJoinedChats){
        socket.emit("join_room", {room: chat.room, email: userData.email});
      }

      if(currActiveChat.room === "" && currJoinedChats[0]){
        setCurrActiveChat({
          room: currJoinedChats[0].room,
          phoneNo: currJoinedChats[0].phoneNo,
          messageList: currJoinedChats[0].messageList
        });
      }
    }, [currJoinedChats])

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
                  {currJoinedChats.map((chat, index) => {
                    return <div onClick={() => {
                      changeChat(chat.room);
                    }} key={index} className="chatsList">{chat.room}</div>
                  })}
                </div>

                <div className="chatsCon">
                  {currActiveChat.room !== "" ? (
                    <div className="chatCon">
                      <div className="chatTopCon">
                        <span>{currActiveChat.room}</span>
                        <ReassignCom room={currActiveChat.room} />
                        <button className="rmBtn disBtn" onClick={(e) => {
                          disconnect(currActiveChat.room);
                        }}>Disconnect</button>
                      </div>
                      <Chat
                        socket={socket}
                        username="Agent"
                        currActiveChat={currActiveChat}
                        setCurrActiveChat={setCurrActiveChat}
                        currJoinedChats={currJoinedChats}
                        setCurrJoinedChat={setCurrJoinedChats}
                      />
                    </div>
                  ) : (
                    <></>
                  )}

                </div>
              </div>
          </div>

        </div>
    )
}

export default ChatPage;
