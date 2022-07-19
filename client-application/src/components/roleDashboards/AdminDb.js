import React, {useState, useEffect} from 'react';
import axios from "axios";

import BarChart from "../charts/BarChart";
import AdminBar from "../charts/AdminBar";
import AdminLine from "../charts/AdminLine";


import Sidebar from "../uiComponent/Sidebar";
import TopCon from "../uiComponent/TopCon";

function AdminDb({baseUserSystemURL, baseChatSystemURL, baseBulkMessagingURL,setIsLogedin, userData, noOfPendingTemplates}) {

    const [totalNoOfAgents, setTotalNoOfAgents] = useState(0);
    const [totalNoOfManagers, setTotalNoOfManagers] = useState(0);
    const [totalNoOfTemplates, setTotalNoOfTemplates] = useState(0);

    const [totalNoOfCompletedChats, setTotalNoOfCompletedChats] = useState(0);

    const [totalCompletedChats, setTotalCompletedChats] = useState([]);

    const [showBar, setShowBar] = useState(true);

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

    const getTemplates = async() => {
      await axios.get(`${baseBulkMessagingURL}/get_all_templates`, { validateStatus: false, withCredentials: true }).then((response) => {
        setTotalNoOfTemplates(response.data.allTemplates.length);
      });
    }

    const getCompletedChats = async () => {
      await axios.post(`${baseChatSystemURL}/completedChats`, {},{ validateStatus: false, withCredentials: true }).then((response) => {
        setTotalCompletedChats(response.data.chats);
        setTotalNoOfCompletedChats(response.data.chats.length);
      });
    }

    const filterData = (selectedFilter) => {
      const currentDate = new Date().getTime();

      let noOfCompletedChats = 0;

      if(selectedFilter == "all"){

        noOfCompletedChats = totalCompletedChats.length;

      }else{
        let comparedDate;

        if(selectedFilter == 7){
          comparedDate = currentDate - 7*24*60*60*1000;
        }else if(selectedFilter == 30){
          comparedDate = currentDate - 30*24*60*60*1000;
        }

        for(let chat of totalCompletedChats){
          if(chat.lastInteraction >= comparedDate){
            noOfCompletedChats++
          }
        }
      }

      setTotalNoOfCompletedChats(noOfCompletedChats);
    }

    useEffect(() => {
      getAgents();
      getManagers();
      getCompletedChats();
      getTemplates();
    }, [])

    return (
        <div className="rootCon ">
          <Sidebar role = "Admin" baseURL={baseUserSystemURL} setIsLogedin={setIsLogedin} page="overview" noOfPendingTemplates={noOfPendingTemplates}/>
          <div className="dataCon">
            <TopCon userName={userData.name} page="Overview"/>

            <div className="dashBoard">

              <div className="firstCon">

                <div className="upCon">
                  <a href="/managers">
                    <div>
                      Managers <span>{totalNoOfManagers}</span>
                    </div>
                  </a>

                  <a href="/managers">
                    <div>
                      Agents <span>{totalNoOfAgents}</span>
                    </div>
                  </a>

                  <a href="/template_requests">
                    <div>
                      Templates <span>{totalNoOfTemplates}</span>
                    </div>
                  </a>

                  <p className="filterSelect">
                    <select onChange={(e) => {
                      filterData(e.target.value)
                    }}>
                      <option value="all">All Time</option>
                      <option value="7">Past 7 Days</option>
                      <option value="30">Past 30 Days</option>
                    </select>
                  </p>

                  <a href="/managers">
                    <div>
                      Completed Chats <span>{totalNoOfCompletedChats}</span>
                    </div>
                  </a>
                </div>

                <div className="chartsCon">

                  <div className="barChart">
                    <BarChart exData = {{
                      manager: totalNoOfManagers,
                      agent: totalNoOfAgents,
                      template: totalNoOfTemplates
                    }}/>
                  </div>

                  <select onChange={(e) => {
                    console.log(e.target.value);
                    if(e.target.value === "bar"){
                      setShowBar(true);
                    }else{
                      setShowBar(false);
                    }
                  }}>
                    <option value="bar">Bar</option>
                    <option value="line">Line</option>
                  </select>

                  <div className="managerLineChart">
                    {showBar ? (
                      <AdminBar totalCompletedChats={totalCompletedChats}/>
                    ): (
                      <AdminLine totalCompletedChats={totalCompletedChats}/>
                    )}
                  </div>
                </div>


              </div>

            </div>


          </div>
        </div>
    )
}

export default AdminDb;
