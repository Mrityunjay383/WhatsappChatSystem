import React, {useState, useEffect} from 'react'
import axios from "axios";

import Sidebar from "./uiComponent/Sidebar";
import TopCon from "./uiComponent/TopCon";

function Profile({baseURL, setIsLogedin, userData, setUserData, noOfPendingTemplates}) {

    const [newDel, setNewDel] = useState({
      firstName: userData.name.split(" ")[0],
      lastName: userData.name.split(" ")[1],
      email: userData.email,
      assignedNumber: "",
      appName: "",
      apiKey: ""
    });

    const [newPassword, setNewPassword] = useState({
      password: "",
      email: userData.email
    })

    const [userDelByPost, setUserDelByPost] = useState({})

    const getManagerDetails = async (managerUID) => {
      axios.post(`${baseURL}/indi_user`, {userId: managerUID}, {validateStatus: false, withCredentials: true}).then((response) => {
        if(response.status === 200){
          // console.log(response.data.foundUser);
          setUserDelByPost(response.data.foundUser);
          setNewDel((curr) => {
            return {...curr,
              assignedNumber: response.data.foundUser.assignedNumber,
              appName: response.data.foundUser.appName,
              apiKey: response.data.foundUser.apiKey
            }
          })
        }
      });
    }



    const changeName = async () => {
      axios.post(`${baseURL}/change_name`, newDel, {validateStatus: false, withCredentials: true}).then((response) => {
        if(response.status === 200){
          setUserData((curr) => {
            return {...curr, name: response.data.newDel}
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

    useEffect(() => {
      // console.log(userData.user_id);
      getManagerDetails(userData.user_id);
    }, [])

    return (
        <div className="rootCon">
          <Sidebar role={userData.role} baseURL={baseURL} setIsLogedin={setIsLogedin} page="profile" noOfPendingTemplates={noOfPendingTemplates}/>

          <div className="dataCon">
            <TopCon userName={userData.name} page="Profile"/>

            <div className="changeCon">

              <div className="changeNameCon">

                <h4>Update Name:</h4>
                <div className="form-group">
                  <label>First Name:</label>
                  <input type="text" className="form-control" defaultValue={userDelByPost.firstName} placeholder="First name" onChange={(e) => {
                    setNewDel((currObj) => {
                      return {...currObj, firstName: e.target.value}
                    });
                  }}/>
                </div>

                <div className="form-group">
                  <label>Last Name:</label>
                  <input type="text" className="form-control" defaultValue={userDelByPost.lastName} placeholder="Last name" onChange={(e) => {
                    setNewDel((currObj) => {
                      return {...currObj, lastName: e.target.value}
                    });
                  }}/>
                </div>

                {userData.role === "Manager" ? (
                  <div>
                    <div className="form-group">
                      <label>Assigned Number:</label>
                      <input type="text" className="form-control" defaultValue={userDelByPost.assignedNumber} placeholder="Last name" onChange={(e) => {
                        setNewDel((currObj) => {
                          return {...currObj, assignedNumber: e.target.value}
                        });
                      }}/>
                    </div>

                    <div className="form-group">
                      <label>App Name:</label>
                      <input type="text" className="form-control" defaultValue={userDelByPost.appName} placeholder="Last name" onChange={(e) => {
                        setNewDel((currObj) => {
                          return {...currObj, appName: e.target.value}
                        });
                      }}/>
                    </div>

                    <div className="form-group">
                      <label>API key:</label>
                      <input type="text" className="form-control" defaultValue={userDelByPost.apiKey} placeholder="Last name" onChange={(e) => {
                        setNewDel((currObj) => {
                          return {...currObj, apiKey: e.target.value}
                        });
                      }}/>
                    </div>
                  </div>

                ): (
                  <></>
                )}


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
