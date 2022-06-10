import React from 'react'

import AdminDb from "./roleDashboards/AdminDb";
import ManagerDb from "./roleDashboards/ManagerDb";
import AgentDb from "./roleDashboards/AgentDb";


function Dashboard({baseURL, userData}) {

    const AdminPage = ({role}) => {
      if(role === "Admin"){
        return <AdminDb baseURL={baseURL}/>
      }else if(role === "Manager"){
        return <ManagerDb />
      }else{
        return <AgentDb />
      }
    };

    return (
        <div>
          <AdminPage role={userData.role} />
        </div>
    )
}

export default Dashboard;
