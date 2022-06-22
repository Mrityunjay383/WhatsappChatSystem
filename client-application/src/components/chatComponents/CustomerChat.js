import React, { useState, useEffect } from 'react'

import CustomerChatCom from "./CustomerChatCom";
import "./ChatPage.css";
import {socket} from "./socket";

function CustomerChat() {

    const [username, setUsername] = useState("");
    const [showChat, setShowChat] = useState(false);

    const joinRoom = () => {
      if (username !== "") {
        socket.emit("join_room", `${username}`);
        setShowChat(true);
      }
    };

    return (
        <div>
          <h1>Chat Room</h1>
          {!showChat ? (
            <div>
              <input type="text" placeholder="Name" onChange={(e) => {
                setUsername(e.target.value)
              }}
              />
              <button onClick={joinRoom}>New Request</button>
            </div>
            ) : (
              <CustomerChatCom socket={socket} username={username} room={username}/>
            )}
        </div>
    )
}

export default CustomerChat
