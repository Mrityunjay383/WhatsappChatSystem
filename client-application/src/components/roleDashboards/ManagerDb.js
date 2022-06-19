import React from 'react'

import Sidebar from "../uiComponent/Sidebar";
import TopCon from "../uiComponent/TopCon";


function ManagerDb({baseURL, setIsLogedin, userName}) {
    return (
        <div className="rootCon">
          <Sidebar role="Manager" baseURL={baseURL} setIsLogedin={setIsLogedin} page="overview" />
          <div className="dataCon">
            <TopCon userName={userName} page="Overview"/>
          </div>
        </div>
    )
}

export default ManagerDb;
