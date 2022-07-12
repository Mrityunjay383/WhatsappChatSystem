import React, {useState, useEffect} from 'react'
import axios from "axios";

import Sidebar from "./uiComponent/Sidebar";
import TopCon from "./uiComponent/TopCon";


function ManagerAsignPage({socket, baseURL, userName, setIsLogedin, noOfRequestedChats}) {


    const [activeRooms, setActiveRooms] = useState([]);
    const [activeAgents, setActiveAgents] = useState([]);

    //This is for assigning Agets to chat with specific customer
    const assign = async (e) => {
      const room = e.target.parentElement.firstChild.innerText;

      const agentSelect = e.target.parentElement.querySelector(".agentSelect");
      const agent = activeAgents[agentSelect.selectedIndex];

      await axios.post(`${baseURL}/assign_agent`, {room, agent, assignedBy: userName}, {validateStatus: false, withCredentials: true}).then((response) => {
        if(response.status === 200){
          console.log("Assignment Done");

        }else{
          console.log("Failed");
        }
      });
    }

    const getRooms = async () => {
      await axios.get(`${baseURL}/active_rooms`, { validateStatus: false, withCredentials: true }).then((response) => {
        console.log(response.data.chats);
        setActiveRooms(response.data.chats);
      });
    }

    const getActiveAgents = async () => {
      await axios.get(`${baseURL}/active_agents`, { validateStatus: false, withCredentials: true }).then((response) => {
        setActiveAgents(response.data.activeAgents);
      });
    }

    useEffect(() => {
      getRooms();
      getActiveAgents();
    }, []);

    useEffect(() => {
      socket.on("broadcast", (data) => {
        getRooms();
        setTimeout(getActiveAgents, 500);
      });
    }, [socket])

    return (
        <div className="rootCon">
        <Sidebar role = "Manager" baseURL={baseURL} setIsLogedin={setIsLogedin} page="assignAgents" noOfRequestedChats={noOfRequestedChats}/>

          <div className="dataCon">
            <TopCon userName={userName} page="Assign Agents"/>

            <div className="userCon">
              {activeRooms.map((room, index) => {
                return (
                  <div className="userCard assignCard">
                    <span className="roomTitle">{room.room}</span>
                    <select className="agentSelect">
                      {activeAgents.map((agent, index) => {
                          return (
                            <option value={agent.email}>{agent.name}</option>
                          )
                      })}
                    </select>
                    <button className="rmBtn assignBtn" onClick={assign}>Assign</button>
                  </div>
                )
              })}
            </div>

          </div>

        </div>
      )
}

export default ManagerAsignPage;
