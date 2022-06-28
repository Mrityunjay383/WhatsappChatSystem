import React, {useState, useEffect} from 'react'
import axios from "axios";


import Sidebar from "./uiComponent/Sidebar";
import TopCon from "./uiComponent/TopCon";

function Broadcasting({baseURL, setIsLogedin, userName}) {

    const [templates, setTemplated] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState({});
    const [optedinUsers, setOptedinUsers] = useState([]);

    const getTemplates = async () => {

      await axios.get(`${baseURL}/aprovedTemplates`, { validateStatus: false, withCredentials: true }).then((response) => {
        //setting the templates with the response from the API
        setTemplated(response.data.templates);
        setSelectedTemplate(response.data.templates[0]);
      });
    }

    const getOptedinUsers = async () => {

      await axios.get(`${baseURL}/optedinUsers`, { validateStatus: false, withCredentials: true }).then((response) => {
        //setting the optedinUsers with the response from the API
        setOptedinUsers(response.data.users);
      });
    }


    useEffect(() => {
      getTemplates();
      getOptedinUsers();
    }, [])

    return (
        <div className="rootCon">
          <Sidebar role="Manager" baseURL={baseURL} setIsLogedin={setIsLogedin} page="broadcasting" />

          <div className="dataCon">
            <TopCon userName={userName} page="Broadcasting"/>

            <div>
              <label>Select Template: </label>
              <select onChange={(e) => {
                setSelectedTemplate(templates[e.target.selectedIndex]);
              }}>
                {templates.map((template, index) => {
                  return (
                    <option key={index}>{template.elementName}</option>
                  )
                })}
              </select>

              <div>
                <h3>Selected Templated: </h3>
                <span>{selectedTemplate.elementName}</span><br/>
                <span>{selectedTemplate.data}</span><br/>
                <span>{selectedTemplate.meta}</span><br/>
              </div>

              <div>
                <h3>Numbers: </h3>
                {optedinUsers.map((user, index) => {
                  return (
                    <span key={index}>{user.phoneCode} <br/></span>
                  )
                })}
              </div>

            </div>

          </div>
        </div>
    )
}

export default Broadcasting;
