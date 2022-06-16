import React from 'react'

import Sidebar from "../uiComponent/Sidebar";

function ManagerDb() {
    return (
        <div className="rootCon">
          <Sidebar/>
          <div>
            <h1>Manager Dashboard</h1>
            <a href="/agents">Agnets</a><br/>
            <a href="/asign_agent">Assign Agnets</a><br/>
            <a href="/create_new_user">Create new User</a>
          </div>
        </div>
    )
}

export default ManagerDb;
