import React from 'react'

import Sidebar from "../uiComponent/Sidebar";

function AdminDb({baseURL}) {

    return (
        <div className="rootCon ">
          <Sidebar role = "Admin"/>
          <div>
            <h1>Admin Dashboard</h1>
          </div>
        </div>
    )
}

export default AdminDb;
