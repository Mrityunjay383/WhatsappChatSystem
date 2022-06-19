import React from 'react'
import Sidebar from "../uiComponent/Sidebar";

import TopCon from "../uiComponent/TopCon";


function AgentDb({baseURL, setIsLogedin, userName}) {
    return (
        <div className="rootCon">
          <Sidebar role="Agent" baseURL={baseURL} setIsLogedin={setIsLogedin} page="overview" />
          <div className="dataCon">
            <TopCon userName={userName} page="Overview"/>

          </div>
        </div>
    )
}

export default AgentDb;
