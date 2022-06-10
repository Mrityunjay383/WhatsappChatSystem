import React, {useState, useEffect} from 'react';
import axios from "axios";

function CreateNewUser({baseURL, userRole}) {

    const [newUserData, setNewUserData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "Agent"
    });

    const regNewUser = () => {

      axios.post(`${baseURL}/auth/register`, newUserData, {validateStatus: false, withCredentials: true}).then((response) => {
        if(response.status === 201){
          window.location = '/';
        }else{
          console.log("Registration Failed");
        }
      });

    }


    return (
        <div>
          <h1>Create a New User</h1>

          <div>

          <input type="text" placeholder="First Name" onChange={(e) => {
            setNewUserData((currObj) => {
              return {...currObj, firstName: e.target.value}
            });
          }}/>

          <input type="text" placeholder="Last Name" onChange={(e) => {
            setNewUserData((currObj) => {
              return {...currObj, lastName: e.target.value}
            });
          }}/>

          <input type="email" placeholder="Email" onChange={(e) => {
            setNewUserData((currObj) => {
              return {...currObj, email: e.target.value}
            });
          }}/>

          <input type="password" placeholder="Password" onChange={(e) => {
            setNewUserData((currObj) => {
              return {...currObj, password: e.target.value}
            });
          }}/>

          <select onChange={(e) => {
            setNewUserData((currObj) => {
              return {...currObj, role: e.target.value}
            });
          }}>
            {userRole === "Admin" ? (
              <option value="Manager">Manager</option>
            ) : (
              <option value="Agent">Agent</option>
            )}

          </select>

          <button onClick={regNewUser}>Submit</button>

          </div>
        </div>
    )
}

export default CreateNewUser;
