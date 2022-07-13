import React, {useState, useEffect} from 'react';
import axios from "axios";

import Sidebar from "../uiComponent/Sidebar";
import TopCon from "../uiComponent/TopCon";


function AgentDb({baseUserSystemURL, baseChatSystemURL, setIsLogedin, userData, socket}) {

    const [totalNoOfOpenChats, setTotalNoOfOpenChats] = useState(0);
    const [totalNoOfCompletedChats, setTotalNoOfCompletedChats] = useState(0);
    const [noOfAssignedChats, setNoOfAssignedChats] = useState(0);
    const [totalNoOfCustomerHandled, setTotalNoOfCustomerHandled] = useState(0);

    //Getting all active rooms exist currently
    const getRooms = async () => {

      await axios.get(`${baseChatSystemURL}/active_rooms`, { validateStatus: false, withCredentials: true }).then((response) => {
        const rooms = response.data.chats;
        for(let i=0; i < rooms.length; i++){
          if(rooms[i].managerID !== userData.creatorUID){
            rooms.splice(i, 1);
          }
        }
        setTotalNoOfOpenChats(rooms.length);
      });
    }

    const getCompletedChats = async () => {
      await axios.post(`${baseChatSystemURL}/completedChats`, {managerID: userData.creatorUID},{ validateStatus: false, withCredentials: true }).then((response) => {
        const chatsByThisAgent = response.data.chats.filter((chat) => {
          return chat.agentName === userData.name
        })

        getNoOfUniqueConstomerhandled(chatsByThisAgent);

        setTotalNoOfCompletedChats(chatsByThisAgent.length);
      });
    }

    //Getting all assigned rooms to this agent
    const getAssignedChats = async () => {

      await axios.get(`${baseChatSystemURL}/assigned`, { validateStatus: false, withCredentials: true }).then((response) => {

        const assignedChats = response.data.assignList.filter((assined) => {
          return assined.agent.email === userData.email
        });

        setNoOfAssignedChats(assignedChats.length);
      });
    }

    //For getting the number of unique customers handled by this perticular agent
    const getNoOfUniqueConstomerhandled = async (chatList) => {

      chatList = chatList.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.userPhoneNo === value.userPhoneNo
        ))
      )
      setTotalNoOfCustomerHandled(chatList.length);
    }

    useEffect(() => {
      getRooms();
      getCompletedChats();
      getAssignedChats();
    }, []);

    useEffect(() => {
      socket.on("broadcast", (data) => {
        getRooms();
        getCompletedChats();
        getAssignedChats();
        // setTimeout(() => {
        //
        // }, 500);
      });
    }, [socket])

    return (
        <div className="rootCon">
          <Sidebar role="Agent" baseURL={baseUserSystemURL} setIsLogedin={setIsLogedin} page="overview" />
          <div className="dataCon">
            <TopCon userName={userData.name} page="Overview"/>

            <div className="dashBoard">
              <div>
                Number of Pending Chats: {totalNoOfOpenChats}
              </div>
              <div>
                 Number of Completed Chats: {totalNoOfCompletedChats}
              </div>
              <div>
                 Number of Assigned Chats: {noOfAssignedChats}
              </div>
              <div>
                Total Number of Contacts handled: {totalNoOfCustomerHandled}
              </div>

            </div>
          </div>
        </div>
    )
}

export default AgentDb;
