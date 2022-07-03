import React, {useState, useEffect} from 'react'
import axios from "axios";


import Sidebar from "./uiComponent/Sidebar";
import TopCon from "./uiComponent/TopCon";

function Broadcasting({baseURL, setIsLogedin, userName}) {

    const [templates, setTemplated] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState({});
    const [optedinUsers, setOptedinUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [newNumbers, setNewNumbers] = useState("");

    const getTemplates = async () => {

      await axios.get(`${baseURL}/aprovedTemplates`, { validateStatus: false, withCredentials: true }).then((response) => {
        //setting the templates with the response from the API
        setTemplated(response.data.templates);
        setSelectedTemplate({...response.data.templates[0], example: JSON.parse(response.data.templates[0].meta).example});
        setMessage(response.data.templates[0].data);
      });
    }

    const getOptedinUsers = async () => {

      let optedinUsers, storedUsers, toBePopulateUsers = [];
      await axios.get(`${baseURL}/optedinUsers`, { validateStatus: false, withCredentials: true }).then((response) => {
        //setting the optedinUsers with the response from the API
        optedinUsers = response.data.users;
        // setOptedinUsers(response.data.users);
      });

      await axios.get(`${baseURL}/storedCustomers`, { validateStatus: false, withCredentials: true }).then((response) => {
        //getting the stored users from the response from the API
        storedUsers = response.data.users;
        // setOptedinUsers(response.data.users);
      });

      //gettig name of the customers from the stored users
      for(let i = 0; i < optedinUsers.length; i++){
        const optUserFullPhoneNo = optedinUsers[i].countryCode+optedinUsers[i].phoneCode;
        for(let j = 0; j < storedUsers.length; j++){
          if(storedUsers[j].userPhoneNo === optUserFullPhoneNo){
            toBePopulateUsers.push({phoneNo: optUserFullPhoneNo, userName: storedUsers[j].userName});
          }else{
            toBePopulateUsers.push({phoneNo: optUserFullPhoneNo, userName: "{Name}"});
          }
        }
      }
      setOptedinUsers(toBePopulateUsers);
    }

    const broadcast = async () => {
      const checkboxes = document.querySelectorAll('input[type=checkbox]:checked');

      let selectedPhoneNo = Array.from(checkboxes).map(i => i.value);

      let newNumbersArr = newNumbers.split(",");
      newNumbersArr = await newNumbersArr.map((i) => i.replace(" ", ""))

      const toBeBroadcastNo = [...selectedPhoneNo, ...newNumbersArr];

      axios.post(`${baseURL}/broadcastMessage`, {message, toBeBroadcastNo}, {validateStatus: false, withCredentials: true}).then((response) => {
        console.log(response.data);
      });
    }

    useEffect(() => {
      getTemplates();
      getOptedinUsers();
    }, []);

    return (
        <div className="rootCon">
          <Sidebar role="Manager" baseURL={baseURL} setIsLogedin={setIsLogedin} page="broadcasting" />

          <div className="dataCon">
            <TopCon userName={userName} page="Broadcast"/>

            <div className="broadcastCon">

              <div className="selTempCon">
                <label>Select a Template: </label>
                <select onChange={(e) => {
                  setSelectedTemplate({...templates[e.target.selectedIndex], example: JSON.parse(templates[e.target.selectedIndex].meta).example});
                  setMessage(templates[e.target.selectedIndex].data);
                }}>
                  {templates.map((template, index) => {
                    return (
                      <option key={index}>{template.elementName}</option>
                    )
                  })}
                </select>
              </div>

              <div className="selectedTempCon">

                <div className="det">
                  <span className="tempName">{selectedTemplate.elementName}</span>
                  <span><b>Example</b>: {selectedTemplate.example}</span>
                </div>
                <div className="val">
                  <textarea onChange={(e) => {
                    setMessage(e.target.value);
                  }} value={message}></textarea>
                </div>
              </div>

              <div className="InpNoCon">

                <div className="optinNoCon">
                  <h3>Otped In Numbers: </h3>
                  <div className="numbersList">
                    {optedinUsers.map((user, index) => {
                      return (
                        <div key={index}>
                          <input type="checkbox" name={user.phoneNo} value={user.phoneNo} />
                          <label htmlFor={user.phoneNo}>{user.phoneNo}</label>
                          <span>{user.userName}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="newNoCon">
                  <h3>Input New Numbers: </h3>
                  <span>Enter comma(,) seperated numbers</span><br/>
                  <textarea onChange={(e) => {
                    setNewNumbers(e.target.value);
                  }} value={newNumbers}></textarea><br/>
                </div>

              </div>

              <div className="brdBtnCon">
                <button className="joinbtn brdCsBtn" onClick={broadcast}>Broadcast</button>
              </div>

            </div>

          </div>
        </div>
    )
}

export default Broadcasting;
