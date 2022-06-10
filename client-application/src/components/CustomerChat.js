import React, { useState, useEffect } from 'react'

import Chat from "./Chat";

function CustomerChat({socket}) {

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
              <Chat socket={socket} username={username} room={username}/>
            )}
        </div>
    )
}

export default CustomerChat
