import React from 'react'

import Sidebar from "../uiComponent/Sidebar";
import TopCon from "../uiComponent/TopCon";

function AdminDb({baseURL, setIsLogedin, userName, noOfPendingTemplates}) {

    return (
        <div className="rootCon ">
          <Sidebar role = "Admin" baseURL={baseURL} setIsLogedin={setIsLogedin} page="overview" noOfPendingTemplates={noOfPendingTemplates}/>
          <div className="dataCon">
            <TopCon userName={userName} page="Overview"/>
          </div>
        </div>
    )
}

export default AdminDb;
