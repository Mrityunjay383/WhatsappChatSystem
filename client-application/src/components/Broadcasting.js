import React, {useState, useEffect} from 'react'
import axios from "axios";


import Sidebar from "./uiComponent/Sidebar";
import TopCon from "./uiComponent/TopCon";

function Broadcasting({baseBulkMessagingURL, baseUserSystemURL, setIsLogedin, userName}) {

    const [templates, setTemplated] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState({});

    const [optedinUsers, setOptedinUsers] = useState([]);
    const [searchedOptedinUsers, setSearchedOptedinUsers] = useState([]);


    const [message, setMessage] = useState("");
    const [newNumbers, setNewNumbers] = useState("");

    const [selectedNos, setSelectedNos] = useState([]);

    const [populateMessage, setPopulateMessage] = useState("");

    const getTemplates = async () => {

      await axios.get(`${baseBulkMessagingURL}/aprovedTemplates`, { validateStatus: false, withCredentials: true }).then((response) => {
        //setting the templates with the response from the API
        setTemplated(response.data.templates);
        setSelectedTemplate({...response.data.templates[0], example: JSON.parse(response.data.templates[0].meta).example});
        setMessage(response.data.templates[0].data);
      });
    }

    const getOptedinUsers = async () => {

      let optedinUsers, storedUsers, toBePopulateUsers = [];
      await axios.get(`${baseBulkMessagingURL}/optedinUsers`, { validateStatus: false, withCredentials: true }).then((response) => {
        //setting the optedinUsers with the response from the API
        optedinUsers = response.data.users;
        // setOptedinUsers(response.data.users);
      });

      await axios.get(`${baseBulkMessagingURL}/storedCustomers`, { validateStatus: false, withCredentials: true }).then((response) => {
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
      setSearchedOptedinUsers(toBePopulateUsers);
    }

    const broadcast = async () => {
      // const checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
      //
      // let selectedPhoneNo = Array.from(checkboxes).map(i => i.value);

      let newNumbersArr = newNumbers.split(",");
      newNumbersArr = await newNumbersArr.map((i) => i.replace(" ", ""))

      const toBeBroadcastNo = [...selectedNos, ...newNumbersArr];

      if(toBeBroadcastNo.length > 1){
        axios.post(`${baseBulkMessagingURL}/broadcastMessage`, {message, toBeBroadcastNo}, {validateStatus: false, withCredentials: true}).then((response) => {
          console.log(response.data);
          setPopulateMessage("Broadcasting Successfull");
        });
      }else{
        console.log("No Number Selected");
        setPopulateMessage("No Number Selected");
      }

    }

    //searching functionality
    const sortOptedinNumbers = (e) => {
      const inp = e.target.value;

      setSearchedOptedinUsers(() => {
        return optedinUsers.filter((user) => {
          return user.phoneNo.includes(inp);
        })
      })
    }

    const listSelectedNos = async () => {
      const checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
      let selectedPhoneNo = Array.from(checkboxes).map(i => i.value);

      setSelectedNos(selectedPhoneNo);
    }

    const rmSelectedNo = (number) => {

      const checkboxes = Array.from(document.querySelectorAll('input[type=checkbox]:checked'));

      //Unchecking the checkboxes in the optedin list
      for(let checkbox of checkboxes){
        if(checkbox.value === number){
          checkbox.checked = false;
          break;
        }
      }

      //Removing number for selectedNos
      setSelectedNos((curr) => {
        curr = curr.filter((num) => {
          return num !== number
        });
        return curr;
      })
    }

    useEffect(() => {
      getTemplates();
      getOptedinUsers();
    }, []);

    useEffect(() => {
      setTimeout(() => {
        setPopulateMessage("");
      }, 1000)
    }, [populateMessage])

    return (
        <div className="rootCon">
          <Sidebar role="Manager" baseURL={baseUserSystemURL} setIsLogedin={setIsLogedin} page="broadcasting" />

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
                  <div>
                    <input type="number" onChange={sortOptedinNumbers}/>
                  </div>
                  <div className="numbersList">
                    {searchedOptedinUsers.map((user, index) => {
                      return (
                        <div key={index}>
                          <label onClick={listSelectedNos} className="checkboxCon">
                            <input type="checkbox" name={user.phoneNo} value={user.phoneNo} />
                            <span className="checkmark"></span>
                          </label>
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

              <div className="selectedNoCon">
                <h3>Selected Numbers: </h3>
                <div className="selectedNumbersList">
                  {selectedNos.length>0 ?
                    selectedNos.map((number, index) => {
                    return (
                      <div key={index}>
                        <span>{number}</span>
                        <button className="rmSelectedNoBtn" onClick={(() => {
                          rmSelectedNo(number);
                        })}>&#9587;</button>
                      </div>
                    )
                  }) :
                  <span>No Number Selected...</span>

                }
                </div>
              </div>


              <div className="brdBtnCon">
                <button className="joinbtn brdCsBtn" onClick={broadcast}>Broadcast</button>
                <span>{populateMessage}</span>
              </div>

            </div>

          </div>
        </div>
    )
}

export default Broadcasting;
