import React, {useState, useEffect} from 'react'
import axios from "axios";

import Sidebar from "./uiComponent/Sidebar";
import TopCon from "./uiComponent/TopCon";

function TemplateRequests({baseBulkMessagingURL, baseUserSystemURL, setIsLogedin, userName}) {

    const [allTemplates, setAllTemplates] = useState([]);

    const getTemplates = async () => {
      axios.get(`${baseBulkMessagingURL}/get_all_templates`, {validateStatus: false, withCredentials: true}).then((response) => {
        setAllTemplates(response.data.allTemplates);
      });
    }

    const updateStatus = async (tempID, status) => {
      axios.post(`${baseBulkMessagingURL}/get_all_templates`, {tempID, status},{validateStatus: false, withCredentials: true}).then((response) => {
        console.log(response.data);
      });
    }

    useEffect(() => {
      getTemplates();
    }, [])

    return (
        <div className="rootCon">
          <Sidebar role="Admin" baseURL={baseUserSystemURL} setIsLogedin={setIsLogedin} page="templateRequests" />

          <div className="dataCon">
            <TopCon userName={userName} page="Template Requests"/>

            <div className="allTempCon">
              {allTemplates.map((temp, index) => {
                return (
                  <div className="populateTempCon" key={index}>
                    <span>{temp.name}</span>
                    <span>{temp.format}</span>
                    <span>{temp.sample}</span>
                    <span>{temp.status}</span>
                    <span>{temp.requestByName}</span>

                  </div>

                )
              })}
            </div>

          </div>
        </div>
    )
}

export default TemplateRequests;
