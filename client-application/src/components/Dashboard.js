import React, { useState, useEffect } from 'react'
import axios from "axios";

import Login from "./Login";
import AdminDb from "./roleDashboards/AdminDb";
import ManagerDb from "./roleDashboards/ManagerDb";
import AgentDb from "./roleDashboards/AgentDb";


function Dashboard({baseURL}) {

    const [isLogedin, setIsLogedin] = useState(false);
    const [userData, setUserData] = useState({});

    const valToken = async () => {
      await axios.get(baseURL, { validateStatus: false, withCredentials: true }).then((response) => {
        if(response.status === 404 || response.status === 401){
          setIsLogedin(false);
        }else{
          setIsLogedin(true);
          setUserData(response.data.user);
        }
      });
    }

    const changeLoginState = (user) => {
      setUserData(user);
      setIsLogedin(true);
    }

    useEffect(() => {
      valToken();
    }, []);

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
          {isLogedin ? (
            <AdminPage role={userData.role} />
          ) : (
            <Login baseURL={baseURL} changeLogin={changeLoginState} />
          )}
        </div>
    )
}

export default Dashboard;
