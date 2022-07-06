import React, {useState, useEffect} from 'react'
import axios from "axios";

import Sidebar from "./uiComponent/Sidebar";
import TopCon from "./uiComponent/TopCon";

function Profile({baseURL, setIsLogedin, userData, setUserData, noOfPendingTemplates}) {

    const [newName, setNewName] = useState({
      firstName: userData.name.split(" ")[0],
      lastName: userData.name.split(" ")[1],
      email: userData.email
    });

    const [newPassword, setNewPassword] = useState({
      password: "",
      email: userData.email
    })

    const changeName = async () => {
      axios.post(`${baseURL}/change_name`, newName, {validateStatus: false, withCredentials: true}).then((response) => {
        if(response.status === 200){
          setUserData((curr) => {
            return {...curr, name: response.data.newName}
          });
          window.location = "/";
        }
      });
    }

    const changePassword = async () => {
      axios.post(`${baseURL}/change_password`, newPassword, {validateStatus: false, withCredentials: true}).then((response) => {
        if(response.status === 200){
          // console.log(response.data);
          window.location = "/";
        }
      });
    }

    return (
        <div className="rootCon">
          <Sidebar role={userData.role} baseURL={baseURL} setIsLogedin={setIsLogedin} page="profile" noOfPendingTemplates={noOfPendingTemplates}/>

          <div className="dataCon">
            <TopCon userName={userData.name} page="Profile"/>

            <div className="changeCon">

              <div className="changeNameCon">

                <h4>Update Name</h4>
                <div className="form-group">
                  <label>First Name:</label>
                  <input type="text" className="form-control" defaultValue={userData.name.split(" ")[0]} placeholder="First name" onChange={(e) => {
                    setNewName((currObj) => {
                      return {...currObj, firstName: e.target.value}
                    });
                  }}/>
                </div>

                <div className="form-group">
                  <label>Last Name:</label>
                  <input type="text" className="form-control" defaultValue={userData.name.split(" ")[1]} placeholder="Last name" onChange={(e) => {
                    setNewName((currObj) => {
                      return {...currObj, lastName: e.target.value}
                    });
                  }}/>
                </div>

                <button onClick={changeName}>Update</button>

              </div>


              <div className="changePasswordCon">
                <h4>Update Password</h4>
                <div className="form-group">
                  <label>Password:</label>
                  <input type="text" className="form-control" placeholder="New Password" onChange={(e) => {
                    setNewPassword((currObj) => {
                      return {...currObj, password: e.target.value}
                    });
                  }}/>
                </div>

                <button onClick={changePassword}>Update</button>

              </div>

            </div>
          </div>

        </div>
    )
}

export default Profile;
