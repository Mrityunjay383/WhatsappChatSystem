import React from 'react'

import Sidebar from "../uiComponent/Sidebar";

function ManagerDb({baseURL, setIsLogedin}) {
    return (
        <div className="rootCon">
          <Sidebar role="Manager" baseURL={baseURL} setIsLogedin={setIsLogedin} />
          <div>
            <h1>Manager Dashboard</h1>

          </div>
        </div>
    )
}

export default ManagerDb;
