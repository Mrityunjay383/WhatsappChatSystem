import React, {useState, useEffect} from 'react';
import axios from "axios";

import Sidebar from "./uiComponent/Sidebar";
import TopCon from "./uiComponent/TopCon";



function CreateNewUser({baseURL, userData, setIsLogedin, noOfPendingTemplates}) {

    // console.log(userData.user_id);

    const [newUserData, setNewUserData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "",
      assignedNumber: "",
      appName: "",
      apiKey: ""
    });

    const regNewUser = () => {

      if(userData.role !== ""){
        if(userData.role === "Manager"){//is user is Manager then he/she should be creating a new agent user.
          newUserData.creatorUID = userData.user_id;
        }
        axios.post(`${baseURL}/auth/register`, newUserData, {validateStatus: false, withCredentials: true}).then((response) => {
          if(response.status === 201){
            window.location = '/';
          }else{
            console.log("Registration Failed");
          }
        });
      }


    }

    return (
        <div  className="rootCon ">

          <Sidebar role = {userData.role} baseURL={baseURL} setIsLogedin={setIsLogedin} page="createNewUser" noOfPendingTemplates={noOfPendingTemplates}/>

          <div className="dataCon">
            <TopCon userName={userData.name} page="Create New User" />

            <div className="regForm">

              <div className="form-group">
                <label>First Name:</label>
                <input type="text" className="form-control" placeholder="Enter First name" onChange={(e) => {
                  setNewUserData((currObj) => {
                    return {...currObj, firstName: e.target.value}
                  });
                }}/>
              </div>

              <div className="form-group">
                <label>Last Name:</label>
                <input type="text" className="form-control" placeholder="Enter Last name" onChange={(e) => {
                  setNewUserData((currObj) => {
                    return {...currObj, lastName: e.target.value}
                  });
                }}/>
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input type="email" className="form-control" placeholder="Enter email" onChange={(e) => {
                  setNewUserData((currObj) => {
                    return {...currObj, email: e.target.value}
                  });
                }}/>
              </div>

              <div className="form-group">
                <label>Password:</label>
                <input type="password" className="form-control" placeholder="Enter password" onChange={(e) => {
                  setNewUserData((currObj) => {
                    return {...currObj, password: e.target.value}
                  });
                }}/>
              </div>

              <div>
                <label>Role: </label>
                <select className="form-select form-select-sm roleSelect" onChange={(e) => {
                  setNewUserData((currObj) => {
                    return {...currObj, role: e.target.value}
                  });
                }}>
                  <option value=""></option>

                  {userData.role === "Admin" ? (
                    <option value="Manager">Manager</option>
                  ) : (
                    <option value="Agent">Agent</option>
                  )}

                </select>
              </div>
              <br />

              {userData.role === "Admin" ? (
                <div>
                  <div className="form-group">
                    <label>Assign Number:</label>
                    <input type="number" className="form-control" placeholder="Enter Number" onChange={(e) => {
                      setNewUserData((currObj) => {
                        return {...currObj, assignedNumber: e.target.value}
                      });
                    }}/>
                  </div>
                  <div className="form-group">
                    <label>App Name:</label>
                    <input type="text" className="form-control" placeholder="Enter App Name" onChange={(e) => {
                      setNewUserData((currObj) => {
                        return {...currObj, appName: e.target.value}
                      });
                    }}/>
                  </div>
                  <div className="form-group">
                    <label>API Key:</label>
                    <input type="text" className="form-control" placeholder="Enter API Key" onChange={(e) => {
                      setNewUserData((currObj) => {
                        return {...currObj, apiKey: e.target.value}
                      });
                    }}/>
                  </div>
                </div>
              ) : (
                <></>
              )}


              <button className="joinbtn subBtn" onClick={regNewUser}>Submit</button>

            </div>
          </div>

        </div>
    )
}

export default CreateNewUser;
