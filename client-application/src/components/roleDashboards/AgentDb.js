import React from 'react'
import Sidebar from "../uiComponent/Sidebar";


function AgentDb({baseURL, setIsLogedin}) {
    return (
        <div className="rootCon">
          <Sidebar role="Agent" baseURL={baseURL} setIsLogedin={setIsLogedin} />
          <div>
            <h1>Agent Dashboard</h1>

          </div>
        </div>
    )
}

export default AgentDb;
