import React, {useState, useEffect} from 'react'
import axios from "axios";

import Sidebar from "./uiComponent/Sidebar";
import TopCon from "./uiComponent/TopCon";

function TemplateRequests({baseBulkMessagingURL, baseUserSystemURL, setIsLogedin, userName, noOfPendingTemplates}) {

    const [allTemplates, setAllTemplates] = useState([]);

    const getTemplates = async () => {
      axios.get(`${baseBulkMessagingURL}/get_all_templates`, {validateStatus: false, withCredentials: true}).then((response) => {
        setAllTemplates(response.data.allTemplates);
      });
    }

    const updateStatus = async (tempID, status) => {
      axios.post(`${baseBulkMessagingURL}/updateTempStatus`, {tempID, status},{validateStatus: false, withCredentials: true}).then((response) => {
        getTemplates();
        console.log(response.data);
      });
    }

    const StatusBtn = ({temp}) => {
      if(temp.status === "Pending"){
        return (
          <button className="joinbtn statusBtn" onClick={() => {
            updateStatus(temp._id, "Submitted");
          }}>Submitted</button>
        )
      }else if(temp.status === "Submitted"){
        return (
          <button className="joinbtn statusBtn" onClick={() => {
            updateStatus(temp._id, "Approved");
          }}>Approved</button>
        )
      }else{
        return (<></>);
      }
    }

    useEffect(() => {
      getTemplates();
    }, [])

    return (
        <div className="rootCon">
          <Sidebar role="Admin" baseURL={baseUserSystemURL} setIsLogedin={setIsLogedin} page="templateRequests" noOfPendingTemplates={noOfPendingTemplates} />

          <div className="dataCon">
            <TopCon userName={userName} page="Template Requests"/>

            <div className="allTempCon">
              {allTemplates.map((temp, index) => {
                return (
                  <div className="populateTempCon" key={index}>

                    <div className="tempConDet">
                      <div>
                        <h4>{temp.name}</h4>
                        <span><b>Format: </b>{temp.format}</span><br/>
                        <span><b>Sample: </b>{temp.sample}</span>
                      </div>

                      <div className="tempRightCon">
                        <span>{temp.status}</span>
                        <span>{temp.requestByName}</span>
                      </div>
                    </div>


                    <StatusBtn temp={temp} />
                  </div>

                )
              })}
            </div>

          </div>
        </div>
    )
}

export default TemplateRequests;
