import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from "axios";

import Sidebar from "./uiComponent/Sidebar";
import TopCon from "./uiComponent/TopCon";

function ManagerProfile({baseURL, baseChatSystemURL, userData, setIsLogedin, noOfPendingTemplates}) {

    const {id} = useParams();

    const [manager, setManager] = useState({});

    const [totalNoOfAgents, setTotalNoOfAgents] = useState(0);
    const [totalNoOfCompletedChats, setTotalNoOfCompletedChats] = useState(0);
    const [totalNoOfEscalations, setTotalNoOfEscalations] = useState(0);
    const [totalNoOfTemplates, setTotalNoOfTemplates] = useState(0);

    const [totalEscalations, setTotalEscalations] = useState([]);
    const [totalCompletedChats, setTotalCompletedChats] = useState([]);

    const [agents, setAgents] = useState([]);
    const [templates, setTemplates] = useState([]);

    const getManager = async () => {
      await axios.post(`${baseURL}/indi_user`, {userId: id}, { validateStatus: false, withCredentials: true }).then((response) => {
        const managerDel = response.data.foundUser;
        setTotalEscalations(managerDel.escalations);
        setTotalNoOfEscalations(managerDel.escalations.length);
        setManager(managerDel);
      });
    }

    const getAgents = async () => {
      await axios.get(`${baseURL}/agents`, { validateStatus: false, withCredentials: true }).then((response) => {
        const allAgents = response.data.agents;

        const allAgentsOfThisManager = allAgents.filter((agent) => {
          return agent.creatorUID === id
        })

        setAgents(allAgentsOfThisManager);
        setTotalNoOfAgents(allAgentsOfThisManager.length);
      });
    }

    const getCompletedChats = async () => {
      await axios.post(`${baseChatSystemURL}/completedChats`, {managerID: id},{ validateStatus: false, withCredentials: true }).then((response) => {
        setTotalCompletedChats(response.data.chats);
        setTotalNoOfCompletedChats(response.data.chats.length);
      });
    }

    const getTemplates = async() => {
      await axios.post(`${baseChatSystemURL}/allTemplatesByManager`, {managerID: id},{ validateStatus: false, withCredentials: true }).then((response) => {
        setTemplates(response.data.templates);
        setTotalNoOfTemplates(response.data.templates.length);
      });
    }

    const filterData = (selectedFilter) => {
      const currentDate = new Date().getTime();

      let noOfEscalations= 0, noOfTemplates = 0, noOfCompletedChats = 0;

      if(selectedFilter == "all"){

        noOfEscalations = totalEscalations.length;
        noOfTemplates = templates.length;
        noOfCompletedChats = totalCompletedChats.length;

      }else{
        let comparedDate;

        if(selectedFilter == 7){
          comparedDate = currentDate - 7*24*60*60*1000;
        }else if(selectedFilter == 30){
          comparedDate = currentDate - 30*24*60*60*1000;
        }

        for(let ecalation of totalEscalations){
          if(ecalation.date >= comparedDate){
            noOfEscalations++
          }
        }
        for(let template of templates){
          if(template.creationDate >= comparedDate){
            noOfTemplates++
          }
        }
        for(let chat of totalCompletedChats){
          if(chat.lastInteraction >= comparedDate){
            noOfCompletedChats++
          }
        }
      }

      setTotalNoOfEscalations(noOfEscalations);
      setTotalNoOfTemplates(noOfTemplates);
      setTotalNoOfCompletedChats(noOfCompletedChats);
    }

    useEffect(() => {
      getManager();
      getAgents();
      getCompletedChats();
      getTemplates();
    }, [])

    return (
      <div className="rootCon">
        <Sidebar role="Admin" baseURL={baseURL} setIsLogedin={setIsLogedin} page="managers" noOfPendingTemplates={noOfPendingTemplates}/>
        <div className="dataCon">
          <TopCon userName={userData.name} page={manager.firstName+"'s Profile"}/>

          <div>
            <div>
              <h3>Personal Details</h3>
              <p>Name: {manager.firstName+" "+manager.lastName}</p>
              <p>Email: {manager.email}</p>
            </div>

            <div>
              <h3>Whatsapp Details</h3>
              <p>Assigned Number: {manager.assignedNumber}</p>
              <p>App Name: {manager.appName}</p>
              <p>API Key: {manager.apiKey}</p>
            </div>

            <div>
              <h3>System Details</h3>
              <p>Total Number of Agents: {totalNoOfAgents}</p>

              <div>
                <select onChange={(e) => {
                  filterData(e.target.value)
                }}>
                  <option value="all">All Time</option>
                  <option value="7">Past 7 Days</option>
                  <option value="30">Past 30 Days</option>
                </select>
              </div>

              <p>Number of Completed Chats: {totalNoOfCompletedChats}</p>
              <p>Number of Escalations: {totalNoOfEscalations}</p>
              <p>Number of Template Created: {totalNoOfTemplates}</p>
            </div>

            <div>
              <h3>Agents</h3>
              {agents.map((agent) => {
                return <div>
                  <p>Name: {agent.firstName+" "+agent.lastName}</p>
                  <p>Email: {agent.email}</p>
                </div>
              })}
            </div>

            <div>
              <h3>Templates</h3>
              {templates.map((template) => {
                return <div>
                  <p>Name: {template.name}</p>
                  <p>Format: {template.format}</p>
                  <p>Status: {template.status}</p>
                </div>
              })}
            </div>
          </div>

        </div>
      </div>
    )
}

export default ManagerProfile;
