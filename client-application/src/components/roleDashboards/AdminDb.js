import React from 'react'

import Sidebar from "../uiComponent/Sidebar";

function AdminDb({baseURL, setIsLogedin}) {

    return (
        <div className="rootCon ">
          <Sidebar role = "Admin" baseURL={baseURL} setIsLogedin={setIsLogedin} page="overview"/>
          <div>
            <h1>Admin Dashboard</h1>
          </div>
        </div>
    )
}

export default AdminDb;
