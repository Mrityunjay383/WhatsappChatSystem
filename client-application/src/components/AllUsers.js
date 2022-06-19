import React, {useState, useEffect} from 'react'
import axios from "axios";

import Sidebar from "./uiComponent/Sidebar";


function AllUsers({baseURL, getRole, setIsLogedin, userRole}) {
    console.log(userRole);
    const [usersList, setusersList] = useState([]);

    const getUsers = async () => {
      await axios.get(`${baseURL}/${getRole}`, { validateStatus: false, withCredentials: true }).then((response) => {
        setusersList(response.data[`${getRole}`]);
      });
    }

    const delUser = async (userID) => {
      let url;

      if(getRole === "agents"){
        url = `${baseURL}/del_agent`;
      }else{
        url = `${baseURL}/del_manager`;
      }

      await axios.post(url, {userID} , { validateStatus: false, withCredentials: true }).then((response) => {
        console.log(response);
        setusersList((list) => {
          return list.filter((listEle) =>  listEle._id !== userID )
        })
      });
    }

    useEffect(() => {
      getUsers();
    }, []);

    const UserCard = ({user}) => {
      return (
        <div className="auserCard">
          <h3>Name: {user.firstName} {user.lastName}</h3>
          <p>Username: {user.email}</p>
          <button value={user._id} onClick={(e) => {
            delUser(e.target.value);
          }}>Remove</button>
          <hr/>
        </div>
      )
    }

    return (
        <div className="rootCon">
            <Sidebar role = {userRole} baseURL={baseURL} setIsLogedin={setIsLogedin} page={getRole}/>
            <div>
              <h1>{getRole} Page</h1>
              <div className="userCon">
                {usersList.map((user, index) => {
                  return <UserCard key={index} user={user} />
                })}
              </div>
            </div>

        </div>
    )
}

export default AllUsers;
