import React from 'react'

import Sidebar from "../uiComponent/Sidebar";

function AdminDb({baseURL}) {

    return (
        <div className="rootCon">
          <Sidebar/>
          <div>
            <h1>Admin Dashboard</h1>
            <a href="/agents">Agnets</a><br/>
            <a href="/managers">Managers</a><br/>
            <a href="/create_new_user">Create new User</a>
          </div>
        </div>
    )
}

export default AdminDb;
