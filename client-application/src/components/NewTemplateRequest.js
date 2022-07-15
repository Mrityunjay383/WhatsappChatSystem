import React, {useState, useEffect} from 'react'
import axios from "axios";

import Sidebar from "./uiComponent/Sidebar";
import TopCon from "./uiComponent/TopCon";

import AddNewTemp from "./uiComponent/AddNewTemp";

function NewTemplateRequest({baseBulkMessagingURL, baseChatSystemURL, baseUserSystemURL, userName, userID, setIsLogedin, noOfRequestedChats}) {

    const [showAddCom, setShowAddComp] = useState(false);

    const [allTemplates, setAllTemplates] = useState([]);

    const getTemplates = async () => {
      axios.post(`${baseChatSystemURL}/allTemplatesByManager`, {managerID: userID}, {validateStatus: false, withCredentials: true}).then((response) => {
        setAllTemplates(response.data.templates);
      });
    }

    useEffect(() => {
      getTemplates();
    }, [])

    return (
        <div className="rootCon">
          <Sidebar role="Manager" baseURL={baseUserSystemURL} setIsLogedin={setIsLogedin} page="newTemplateRequest" noOfRequestedChats={noOfRequestedChats}/>

          <div className="dataCon">
            <TopCon userName={userName} page="Your Templates"/>

            <div>
              <button onClick={(e) => {
                setShowAddComp((curr) => {
                  if(!curr){
                    e.target.innerText = "Close";
                  }else{
                    e.target.innerText = "Add More";
                  }
                  return !curr
                });
              }}>Add More</button>

              {showAddCom ? (
                <AddNewTemp baseURL={baseChatSystemURL} userName={userName} userID={userID}/>
              ) : (
                <></>
              )}

              <div className="allTempCon">
                {allTemplates.map((temp, index) => {
                  return (
                    <div className="populateTempCon" key={index}>
                      <span>{temp.name}</span>
                      <span>{temp.format}</span>
                      <span>{temp.sample}</span>
                      <span>{temp.status}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
    )
}

export default NewTemplateRequest;
