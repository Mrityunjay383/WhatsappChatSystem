import React from 'react';
import "./Sidebar.css";

function Sidebar() {
    return (
        <div className="sidebar">
          LOgo
          <a href="/agents">Agnets</a><br/>
          <a href="/managers">Managers</a><br/>
          <a href="/create_new_user">Create new User</a>

          <a href="/agents">Agnets</a><br/>
          <a href="/asign_agent">Assign Agnets</a><br/>
          <a href="/create_new_user">Create new User</a>

          <a href="/chat">Chat Requests</a>
        </div>
    )
}

export default Sidebar;
