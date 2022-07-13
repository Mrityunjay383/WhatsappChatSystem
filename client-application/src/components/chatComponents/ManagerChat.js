import React, { useState, useEffect } from "react";
import "./ChatPage.css";
import axios from "axios";

import Chat from "./Chat";
import Sidebar from "../uiComponent/Sidebar";
import TopCon from "../uiComponent/TopCon";


function ManagerChat({socket, userData, baseURL, setIsLogedin, noOfRequestedChats}) {

    const [assignedChats, setAssignedChats] = useState([]);//store assigned rooms to agents

    const [currJoinedChats, setCurrJoinedChats] = useState([]);
    const [currActiveChat, setCurrActiveChat] = useState({
      room: "",
      phoneNo: "",
      messageList: []
    });



    //Getting all assigned rooms to this agent
    const getAssignedChats = async () => {

      await axios.get(`${baseURL}/assigned`, { validateStatus: false, withCredentials: true }).then((response) => {
        //Filtering assigned rooms for this perticular agent
        // console.log(response.data.assignList);
        setAssignedChats(() => {
          return response.data.assignList.filter((assined) => {
            return assined.managerID === userData.user_id
          });
        });

      });
    }

    const disconnect = async (room) => {

      await socket.emit("disconnect_chat", {chat: currActiveChat, agentName: userData.name, managerID: userData.user_id});

      currJoinedChats.forEach((chat, index) => {
        if(chat.room === room){
          setCurrJoinedChats((curr) => {
            curr.splice(index, 1);
            return [...curr]
          })
        }
      })

      if(currJoinedChats.length > 0){
        setCurrActiveChat(currJoinedChats[0]);
      }else{
        setCurrActiveChat({
          room: "",
          messageList: [],
          phoneNo: "",
        });
      }

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
      getAssignedChats();

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
        setTimeout(() => {
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

          <Sidebar role="Manager" baseURL={baseURL} setIsLogedin={setIsLogedin} page="chat" noOfRequestedChats={noOfRequestedChats}/>


          <div className="dataCon">
            <TopCon userName={userData.name} page="Chat Requests"/>

              <div className="activeChatsCon">
                <div>
                  <h3>Requested Chats</h3>

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

                        <button className="rmBtn disBtn" onClick={(e) => {
                          disconnect(currActiveChat.room);
                        }}>Disconnect</button>
                      </div>
                      <Chat
                        socket={socket}
                        username="Manager"
                        uID={userData.user_id}
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

export default ManagerChat;
