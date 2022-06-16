import React from 'react'
import Sidebar from "../uiComponent/Sidebar";


function AgentDb() {
    return (
        <div className="rootCon">
          <Sidebar/>
          <div>
          <h1>Agent Dashboard</h1>
          <a href="/chat">Chat Requests</a>
          </div>
        </div>
    )
}

export default AgentDb;
