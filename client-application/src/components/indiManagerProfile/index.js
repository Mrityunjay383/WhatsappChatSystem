import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import "./index.scss";

import Sidebar from "../uiComponent/sidebar/index";
import TopCon from "../uiComponent/TopCon";

import ManagerBar from "../charts/ManagerBar"
import ManagerLine from "../charts/ManagerLine"

import PlaceHolderImg from "../../images/managerPicPH.png";
import { callagents, callcompletedchats, callindiuser, calltemplatesbymanager } from '../../Services/Api';

const ManagerProfile = ({userData, setIsLogedin, noOfPendingTemplates}) => {

      const {id} = useParams();//getting is of the manager form the URL

      //defining state variables
      const [manager, setManager] = useState({});

      const [totalNoOfAgents, setTotalNoOfAgents] = useState(0);
      const [totalNoOfCompletedChats, setTotalNoOfCompletedChats] = useState(0);
      const [totalNoOfEscalations, setTotalNoOfEscalations] = useState(0);
      const [totalNoOfTemplates, setTotalNoOfTemplates] = useState(0);

      const [totalEscalations, setTotalEscalations] = useState([]);
      const [totalCompletedChats, setTotalCompletedChats] = useState([]);

      const [agents, setAgents] = useState([]);
      const [templates, setTemplates] = useState([]);

      const [showBar, setShowBar] = useState(true);

      //Getting details on this perticular manager
      const getManager = async () => {
        const managerDel = await callindiuser(id);
        setTotalEscalations(managerDel.escalations);
        setTotalNoOfEscalations(managerDel.escalations.length);
        setManager(managerDel);
      }

      //getting all the agents in the database
      const getAgents = async () => {

        const allAgents=await callagents()
          //filtering out the agents which are not created by this manager
          const allAgentsOfThisManager = allAgents.filter((agent) => {
            return agent.creatorUID === id
          })

          setAgents(allAgentsOfThisManager);
          setTotalNoOfAgents(allAgentsOfThisManager.length);

      }

      //function for getting all the completed chats from the database
      const getCompletedChats = async () => {
       const chats=await callcompletedchats(id);
       setTotalCompletedChats(chats);
      setTotalNoOfCompletedChats(chats.length);
      }

      //function for getting all the templates from the database
      const getTemplates = async() => {
        const templates=await calltemplatesbymanager(id);
        setTemplates(templates);
        setTotalNoOfTemplates(templates.length);
      }

      //filtering data based on time
      const filterData = (selectedFilter) => {
        const currentDate = new Date().getTime();

        let noOfEscalations= 0, noOfTemplates = 0, noOfCompletedChats = 0;

        if(selectedFilter === "all"){

          noOfEscalations = totalEscalations.length;
          noOfTemplates = templates.length;
          noOfCompletedChats = totalCompletedChats.length;

        }else{
          let comparedDate;

          if(selectedFilter === 7){
            comparedDate = currentDate - 7*24*60*60*1000;
          }else if(selectedFilter === 30){
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
        <div className="rootCon" id='rootCon'>
          <Sidebar role={process.env.REACT_APP_AdminRole} setIsLogedin={setIsLogedin} page="managers" noOfPendingTemplates={noOfPendingTemplates}/>
          <div className="dataCon" id='dataCon'>
            <TopCon userName={userData.name} page={manager.firstName+"'s Profile"}/>

            <div className="managerProfileCon" id='managerProfileCon'>
              <div className="perDetCon" id='perDetCon'>
                <img className="ProfilePic" id='ProfilePic' src={PlaceHolderImg} alt="profile pic"/>
                <div>
                  <p className="ProfileName" id='ProfileName'>{manager.firstName+" "+manager.lastName}</p>
                  <p>{manager.email}</p>
                </div>
              </div>

              <div className="whaDelCon" id='whaDelCon'>
                <p>{manager.assignedNumber}</p>
                <p>{manager.appName}</p>
                <p>{manager.apiKey}</p>
              </div>

              <div className="sysDelCon" id='sysDelCon'>

                <div className="selCon" id='selCon'>
                  <select onChange={(e) => {
                    filterData(e.target.value)
                  }}>
                    <option value="all">All Time</option>
                    <option value="7">Past 7 Days</option>
                    <option value="30">Past 30 Days</option>
                  </select>
                </div>

                <div className="filterCon" id='filterCon'>
                  <p className="manEsc" id='manEsc'>Escalations: {totalNoOfEscalations}</p>
                  <p className="manTemp" id='manTemp'>Template Created: {totalNoOfTemplates}</p>
                  <p className="manComChats" id='manComChats'>Completed Chats: {totalNoOfCompletedChats}</p>
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
                <div  className="manProChartCon" id='manProChartCon'>
                {showBar ? (
                  <ManagerBar
                    totalEscalations={totalEscalations}
                    totalTemplates={templates}
                    totalCompletedChats={totalCompletedChats}
                  />
                ): (
                  <ManagerLine
                    totalEscalations={totalEscalations}
                    totalTemplates={templates}
                    totalCompletedChats={totalCompletedChats}
                  />
                )}
                </div>


              </div>

              <div className="agentsCon" id='agentsCon'>
                <h3>Agents ({totalNoOfAgents})</h3>
                <div className="agentPopulateCon" id='agentPopulateCon'>
                  {agents.map((agent, index) => {
                    return <div key={index}>
                      <p>{agent.firstName+" "+agent.lastName}</p>
                      <p>{agent.email}</p>
                      <p></p>
                    </div>
                  })}
                </div>

              </div>

              <div className="tempProfileCon" id='tempProfileCon'>
                <h3>Templates ({totalNoOfTemplates})</h3>

                <div className="tempProfilePopulateCon" id='tempProfilePopulateCon'>
                  {templates.map((template, index) => {
                    return <div key={index}>
                      <p>{template.name}</p>
                      <p>{template.format}</p>
                      <p>{template.sample}</p>
                      <span className={`tempStatus ${template.status}`} id={`tempStatus ${template.status}`}></span>
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
