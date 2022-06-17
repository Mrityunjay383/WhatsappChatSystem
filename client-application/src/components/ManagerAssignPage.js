import React, {useState, useEffect} from 'react'
import axios from "axios";

import {socket} from "./chatComponents/socket";


function ManagerAsignPage({baseURL, userName}) {


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
          // e.target.innerText = "Assigned";
          // setTimeout(() => {
          //   setActiveRooms((curr) => {
          //     return curr.filter((r) => {
          //       return r !== room
          //     })
          //   })
          // }, 2000);
        }else{
          console.log("Failed");
        }
      });
    }

    const getRooms = async () => {
      await axios.get(`${baseURL}/active_rooms`, { validateStatus: false, withCredentials: true }).then((response) => {
        setActiveRooms(response.data.rooms);
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
        <div>
          <h1>Assign Agents</h1>

          {activeRooms.map((room, index) => {
            return (
              <div>
              <span>{room}</span>
                <select className="agentSelect">
                  {activeAgents.map((agent, index) => {
                      return (
                        <option value={agent.email}>{agent.name}</option>
                      )
                  })}
                </select>
                <button onClick={assign}>Asign</button>
              </div>
            )
          })}
        </div>
      )
}

export default ManagerAsignPage;
