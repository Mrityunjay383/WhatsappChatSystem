import React, { useState, useEffect } from 'react'
import "./App.css";
import axios from "axios";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

import {socket} from "./components/chatComponents/socket";

import Profile from "./components/Profile";

import AllUsers from "./components/AllUsers";
import CreateNewUser from "./components/CreateNewUser";
import Login from "./components/Login";

import AdminDb from "./components/roleDashboards/AdminDb";
import ManagerDb from "./components/roleDashboards/ManagerDb";
import AgentDb from "./components/roleDashboards/AgentDb";

// import ManagerAssignPage from "./components/ManagerAssignPage";
import Broadcasting from "./components/Broadcasting";

import NewTemplateRequest from "./components/NewTemplateRequest";
import TemplateRequests from "./components/TemplateRequests";
import AlertBox from "./components/uiComponent/AlertBox";

import ManagerChat from "./components/chatComponents/ManagerChat";

import ManagerProfile from "./components/ManagerProfile";

//Importing as lazy so that socket only runs when user is agent or customer
const ChatPage = React.lazy(() => import('./components/chatComponents/ChatPage'));
const ManagerAssign = React.lazy(() => import('./components/ManagerAssignPage'));


const baseUserSystemURL = "http://localhost:3002";
const baseChatSystemURL = "http://localhost:3001";
const baseBulkMessagingURL = "http://localhost:3003";


let userId;
function App() {

  const [isLogedin, setIsLogedin] = useState(false);
  const [userData, setUserData] = useState({});

  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({});
  const [noOfPendingTemplates, setNoOfPendingTemplates] = useState(0);

  const [noOfRequestedChats, setNoOfRequestedChats] = useState(0);


  const ChatPageRender = () => {
    return (
      <>
        <React.Suspense fallback={<></>}>
          {(userData.role === "Agent") && <ChatPage socket={socket} baseUserSystemURL={baseUserSystemURL} baseChatSystemURL={baseChatSystemURL} userData={userData} setIsLogedin={setIsLogedin} />}
        </React.Suspense>
      </>
    )
  }


  const ManagerAssignPage = () => {
    return (
      <>
        <React.Suspense fallback={<></>}>
          {(userData.role === "Manager") && <ManagerAssign socket={socket} baseURL={baseChatSystemURL} userName={userData.name} userId={userData.user_id} setIsLogedin={setIsLogedin} noOfRequestedChats={noOfRequestedChats}/>}
        </React.Suspense>
      </>
    )
  }

  //function for checking the JWT from backend API
  const valToken = async () => {
    await axios.get(baseUserSystemURL, { validateStatus: false, withCredentials: true }).then((response) => {
      if(response.status === 404 || response.status === 401){
        setIsLogedin(false);
      }else{
        setUserData(response.data.user);
        setIsLogedin(true);
        getAssignedChats(response.data.user.user_id);
        userId = response.data.user.user_id
        // console.log(response.data.user);
      }
    });
  }

  //Getting all assigned rooms to this agent
  const getAssignedChats = async (user_id) => {

    await axios.get(`${baseChatSystemURL}/assigned`, { validateStatus: false, withCredentials: true }).then((response) => {
      //Filtering assigned rooms for this perticular agent
      const filteredChats = response.data.assignList.filter((assined) => {
        return assined.managerID === user_id
      });
      setNoOfRequestedChats(filteredChats.length);
    });
  }

  const getNoOfPendingTemplates = async () => {
    await axios.get(`${baseChatSystemURL}/noOfPendingTemplates `, { validateStatus: false, withCredentials: true }).then((response) => {
      setNoOfPendingTemplates(response.data.noOfPendingTemplates);
    });
  }

  const changeLoginState = (user) => {//Function for changing the State after successFull Login
    setUserData(user);
    setIsLogedin(true);
  }

  useEffect(() => {
    socket.on("new_temp", (data) => {
      setNoOfPendingTemplates(data.noOfPendingTemplates)
      setShowAlert(true);
      setAlertData(data);
    })

    if(userData.role === "Manager"){
      socket.on("broadcast", (data) => {
        setTimeout(() => {
          getAssignedChats(userId);
        }, 500);
      });
    }
  }, [socket]);

  useEffect(() => {//validating JWT on every time the component mount
    valToken();
    getNoOfPendingTemplates();
  }, []);

  //Rendring dashboard based on the role of the user
  const Dashboard = ({role}) => {
    if(role === "Admin"){
      return <AdminDb baseUserSystemURL={baseUserSystemURL} baseChatSystemURL={baseChatSystemURL} baseBulkMessagingURL={baseBulkMessagingURL} setIsLogedin={setIsLogedin} userData={userData} noOfPendingTemplates={noOfPendingTemplates}/>
    }else if(role === "Manager"){
      return <ManagerDb baseUserSystemURL={baseUserSystemURL} baseChatSystemURL={baseChatSystemURL} setIsLogedin={setIsLogedin} userData={userData}  noOfRequestedChats={noOfRequestedChats} socket={socket}/>
    }else if(role === "Agent"){
      return <AgentDb baseUserSystemURL={baseUserSystemURL} baseChatSystemURL={baseChatSystemURL} setIsLogedin={setIsLogedin} userData={userData} socket={socket}/>
    }
  };

  return (
    <Router>
      <div className="App">
        {isLogedin ? (
          <Routes>

            //Home Route have Dashboard
            <Route path="/" element={
              <div>
                {userData.role === "Admin" && showAlert && <AlertBox setShowAlert={setShowAlert} alertData={alertData}/>}
                <Dashboard role={userData.role} />
              </div>
            } />

            <Route path="/profile" element={
              <div>
                {userData.role === "Admin" && showAlert && <AlertBox setShowAlert={setShowAlert} alertData={alertData}/>}
                <Profile baseURL={baseUserSystemURL} setIsLogedin={setIsLogedin} userData={userData} setUserData={setUserData} noOfPendingTemplates={noOfPendingTemplates}/>
              </div>
            } />

            //agents Route have AllUsers with role agents
            <Route path="/agents" element={
              userData.role === "Agent" ? ( //Agents didnt have Access to allAgents page
                <h1>Access Denied!!</h1>
              ) : (
                <AllUsers
                  baseURL={baseUserSystemURL}
                  userRole={userData.role}
                  userName={userData.name}
                  getRole="agents"
                  userID={userData.user_id}
                  setIsLogedin={setIsLogedin}
                  noOfRequestedChats={noOfRequestedChats}
                />
              )
            } />

            //managers Route have AllUsers with role managers
            <Route path="/managers" element={
              userData.role === "Agent" || userData.role === "Manager" ? (//Agents and Managers didnt have Access to allManagers page
                <h1>Access Denied!!</h1>
              ) : (
                <div>
                  {userData.role === "Admin" && showAlert && <AlertBox setShowAlert={setShowAlert} alertData={alertData}/>}
                  <AllUsers
                    baseURL={baseUserSystemURL}
                    getRole="managers"
                    setIsLogedin={setIsLogedin}
                    userRole={userData.role}
                    userName={userData.name}
                    userID={userData.user_id}
                    noOfPendingTemplates={noOfPendingTemplates}
                  />
                </div>
              )
            } />

            //Broadcasting Rote
            <Route path="/broadcast" element={
              userData.role === "Manager" ? (//Only Managers have Access to Broadcasting page
                <Broadcasting
                  baseBulkMessagingURL={baseBulkMessagingURL}
                  baseUserSystemURL={baseUserSystemURL}
                  getRole="managers"
                  setIsLogedin={setIsLogedin}
                  userId={userData.user_id}
                  userName={userData.name}
                  noOfRequestedChats={noOfRequestedChats}
                />
              ) : (
                <h1>Access Denied!!</h1>
              )
            } />

            //Managers route for submiting new template request to admin
            <Route path="/new_template_request" element={
              userData.role === "Agent" && userData.role === "Admin" ? ( //Admin & Agents didnt have Access to this page
                <h1>Access Denied!!</h1>
              ) : (
                <NewTemplateRequest
                  baseBulkMessagingURL={baseBulkMessagingURL}
                  baseChatSystemURL={baseChatSystemURL}
                  baseUserSystemURL={baseUserSystemURL}
                  userName={userData.name}
                  userID={userData.user_id}
                  setIsLogedin={setIsLogedin}
                  noOfRequestedChats={noOfRequestedChats}
                />
              )
            } />

            //Admin route for accessing new template request from manager
            <Route path="/template_requests" element={
              userData.role === "Agent" && userData.role === "Manager" ? ( //Managers & Agents didnt have Access to this page
                <h1>Access Denied!!</h1>
              ) : (

                <div>
                  {userData.role === "Admin" && showAlert && <AlertBox setShowAlert={setShowAlert} alertData={alertData}/>}
                  <TemplateRequests
                    baseBulkMessagingURL={baseBulkMessagingURL}
                    baseUserSystemURL={baseUserSystemURL}
                    userName={userData.name}
                    setIsLogedin={setIsLogedin}
                    noOfPendingTemplates={noOfPendingTemplates}
                    setNoOfPendingTemplates={setNoOfPendingTemplates}
                  />
                </div>

              )
            } />

            <Route path="/chat_requests" element={
              userData.role === "Manager" ? (
                <ManagerChat socket={socket} baseURL={baseChatSystemURL} userData={userData} setIsLogedin={setIsLogedin} noOfRequestedChats={noOfRequestedChats}/>
              ) : (
                <h1>Access Denied!!</h1>
              )
            } />

            <Route path="/create_new_user" element={
              userData.role === "Agent" ? (//Agents and Managers didnt have Access to allManagers page
                <h1>Access Denied!!</h1>
              ) : (

                <div>
                  {userData.role === "Admin" && showAlert && <AlertBox setShowAlert={setShowAlert} alertData={alertData}/>}
                  <CreateNewUser baseURL={baseUserSystemURL} userData={userData} setIsLogedin={setIsLogedin} noOfPendingTemplates={noOfPendingTemplates} noOfRequestedChats={noOfRequestedChats}/>
                </div>
              )
            } />

            <Route path="/chat" element={
              userData.role === "Agent" ? (
                <ChatPageRender />
              ) : (
                <h1>Access Denied!!</h1>
              )
            } />

            <Route path="/asign_agent" element={
              userData.role === "Manager" ? ( //Agents didnt have Access to allAgents page
                <ManagerAssignPage />
              ) : (
                <h1>Access Denied!!</h1>
              )
            } />

            <Route path="/manager/:id" element={
              userData.role === "Admin" ? ( //Agents didnt have Access to allAgents page
                <div>
                  {userData.role === "Admin" && showAlert && <AlertBox setShowAlert={setShowAlert} alertData={alertData}/>}

                  <ManagerProfile
                    baseURL={baseUserSystemURL}
                    baseChatSystemURL={baseChatSystemURL}
                    userData={userData}
                    setIsLogedin={setIsLogedin}
                    noOfPendingTemplates={noOfPendingTemplates}
                  />
                </div>
              ) : (
                <h1>Access Denied!!</h1>
              )
            } />

          </Routes>
        ) : (
          //if the token is not found, placing the Login component
          <Login baseURL={baseUserSystemURL} changeLogin={changeLoginState} />
        )}
      </div>
    </Router>
  );
}

export default App;
