import React, {useState, useEffect} from 'react'
import axios from "axios";

function ManagerAsignPage({baseURL}) {

    const getRooms = async () => {
      await axios.get(`${baseURL}/active_rooms`, { validateStatus: false, withCredentials: true }).then((response) => {
        console.log(response.data.rooms);
      });
    }

    const getactiveAgents = async () => {
      await axios.get(`${baseURL}/active_agents`, { validateStatus: false, withCredentials: true }).then((response) => {
        console.log(response.data.activeAgents);
      });
    }

    useEffect(() => {
      getRooms();
      getactiveAgents();
    }, [])

    return (
        <div>
          <h1>Asign Agents</h1>
        </div>
    )
}

export default ManagerAsignPage;
