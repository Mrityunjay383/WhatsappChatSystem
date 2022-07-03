import React, {useState, useEffect} from 'react'
import axios from "axios";

import Sidebar from "./uiComponent/Sidebar";
import TopCon from "./uiComponent/TopCon";

function Profile({baseURL, setIsLogedin, userData, setUserData}) {

    const [newName, setNewName] = useState({
      firstName: userData.name.split(" ")[0],
      lastName: userData.name.split(" ")[1],
      email: userData.email
    });

    const changeName = async () => {
      axios.post(`${baseURL}/change_name`, newName, {validateStatus: false, withCredentials: true}).then((response) => {
        if(response.status === 200){
          setUserData((curr) => {
            return {...curr, name: response.data.newName}
          })
        }
      });
    }

    return (
        <div className="rootCon">
          <Sidebar role="Manager" baseURL={baseURL} setIsLogedin={setIsLogedin} page="profile" />

          <div className="dataCon">
            <TopCon userName={userData.name} page="Profile"/>

            <div>

              <div className="ChangeNameCon">

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



            </div>
          </div>

        </div>
    )
}

export default Profile;
