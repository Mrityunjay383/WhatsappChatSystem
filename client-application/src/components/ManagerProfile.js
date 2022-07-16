import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from "axios";

import "./managerProfile.css";

import Sidebar from "./uiComponent/Sidebar";
import TopCon from "./uiComponent/TopCon";

import ManagerMultiline from "./charts/ManagerMultiline"

import PlaceHolderImg from "../images/managerPicPH.jpg";


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

          <div className="managerProfileCon">
            <div className="perDetCon">
              <img className="ProfilePic" src={PlaceHolderImg} />
              <div>
                <p className="ProfileName">{manager.firstName+" "+manager.lastName}</p>
                <p>{manager.email}</p>
              </div>
            </div>

            <div className="whaDelCon">
              <p>{manager.assignedNumber}</p>
              <p>{manager.appName}</p>
              <p>{manager.apiKey}</p>
            </div>

            <div className="sysDelCon">

              <div className="selCon">
                <select onChange={(e) => {
                  filterData(e.target.value)
                }}>
                  <option value="all">All Time</option>
                  <option value="7">Past 7 Days</option>
                  <option value="30">Past 30 Days</option>
                </select>
              </div>

              <div className="filterCon">
                <p className="manEsc">Escalations: {totalNoOfEscalations}</p>
                <p className="manTemp">Template Created: {totalNoOfTemplates}</p>
                <p className="manComChats">Completed Chats: {totalNoOfCompletedChats}</p>
              </div>

              <div className className="manProChartCon">
                <ManagerMultiline
                  totalEscalations={totalEscalations}
                  totalTemplates={templates}
                  totalCompletedChats={totalCompletedChats}
                />
              </div>


            </div>

            <div className="agentsCon">
              <h3>Agents ({totalNoOfAgents})</h3>
              <div className="agentPopulateCon">
                {agents.map((agent, index) => {
                  return <div key={index}>
                    <p>{agent.firstName+" "+agent.lastName}</p>
                    <p>{agent.email}</p>
                    <p></p>
                  </div>
                })}
              </div>

            </div>

            <div className="tempProfileCon">
              <h3>Templates ({totalNoOfTemplates})</h3>

              <div className="tempProfilePopulateCon">
                {templates.map((template, index) => {
                  return <div key={index}>
                    <p>{template.name}</p>
                    <p>{template.format}</p>
                    <p>{template.sample}</p>
                    <span className={`tempStatus ${template.status}`}></span>
                  </div>
                })}
              </div>

            </div>
          </div>

        </div>
      </div>
    )
}

export default ManagerProfile;
