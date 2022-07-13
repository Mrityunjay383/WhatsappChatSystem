import React, {useState, useEffect} from 'react';
import axios from "axios";

import Sidebar from "../uiComponent/Sidebar";
import TopCon from "../uiComponent/TopCon";

function AdminDb({baseUserSystemURL, baseChatSystemURL, setIsLogedin, userData, noOfPendingTemplates}) {

    const [totalNoOfAgents, setTotalNoOfAgents] = useState(0);
    const [totalNoOfManagers, setTotalNoOfManagers] = useState(0);
    const [totalNoOfCompletedChats, setTotalNoOfCompletedChats] = useState(0);

    const getAgents = async () => {
      await axios.get(`${baseUserSystemURL}/agents`, { validateStatus: false, withCredentials: true }).then((response) => {
        const allAgents = response.data.agents;

        setTotalNoOfAgents(allAgents.length);
      });
    }

    const getManagers = async () => {
      await axios.get(`${baseUserSystemURL}/managers`, { validateStatus: false, withCredentials: true }).then((response) => {
        const allManagers = response.data.managers;

        setTotalNoOfManagers(allManagers.length);
      });
    }

    const getCompletedChats = async () => {
      await axios.post(`${baseChatSystemURL}/completedChats`, {},{ validateStatus: false, withCredentials: true }).then((response) => {
        setTotalNoOfCompletedChats(response.data.chats.length);
      });
    }

    useEffect(() => {
      getAgents();
      getManagers();
      getCompletedChats();
    })

    return (
        <div className="rootCon ">
          <Sidebar role = "Admin" baseURL={baseUserSystemURL} setIsLogedin={setIsLogedin} page="overview" noOfPendingTemplates={noOfPendingTemplates}/>
          <div className="dataCon">
            <TopCon userName={userData.name} page="Overview"/>

            <div className="dashBoard">
              <div>
                Total Managers: {totalNoOfManagers}
              </div>
              <div>
                Total Agents: {totalNoOfAgents}
              </div>
              <div>
                Total Number of Completed Chats: {totalNoOfCompletedChats}
              </div>

            </div>
          </div>
        </div>
    )
}

export default AdminDb;
