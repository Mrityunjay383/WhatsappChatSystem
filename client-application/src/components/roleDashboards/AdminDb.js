import React from 'react'

import Sidebar from "../uiComponent/Sidebar";

function AdminDb({baseURL}) {

    return (
        <div className="rootCon ">
          <Sidebar/>
          <div>
            <h1>Admin Dashboard</h1>
          </div>
        </div>
    )
}

export default AdminDb;
