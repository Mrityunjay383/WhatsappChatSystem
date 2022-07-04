import React, { useState, useEffect } from 'react'
import "./App.css";
import axios from "axios";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

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

//Importing as lazy so that socket only runs when user is agent or customer
const ChatPage = React.lazy(() => import('./components/chatComponents/ChatPage'));
const ManagerAssign = React.lazy(() => import('./components/ManagerAssignPage'));


const baseUserSystemURL = "http://localhost:3002";
const baseChatSystemURL = "http://localhost:3001";
const baseBulkMessagingURL = "http://localhost:3003";

function App() {

  const [isLogedin, setIsLogedin] = useState(false);
  const [userData, setUserData] = useState({});

  const ChatPageRender = () => {
    return (
      <>
        <React.Suspense fallback={<></>}>
          {(userData.role === "Agent") && <ChatPage baseURL={baseChatSystemURL} userData={userData} setIsLogedin={setIsLogedin} />}
        </React.Suspense>
      </>
    )
  }


  const ManagerAssignPage = () => {
    return (
      <>
        <React.Suspense fallback={<></>}>
          {(userData.role === "Manager") && <ManagerAssign baseURL={baseChatSystemURL} userName={userData.name} setIsLogedin={setIsLogedin}/>}
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
        // console.log(response.data.user);
      }
    });
  }

  const changeLoginState = (user) => {//Function for changing the State after successFull Login
    setUserData(user);
    setIsLogedin(true);
  }

  useEffect(() => {//validating JWT on every time the component mount
    valToken();
  }, []);

  //Rendring dashboard based on the role of the user
  const Dashboard = ({role}) => {
    if(role === "Admin"){
      return <AdminDb baseURL={baseUserSystemURL} setIsLogedin={setIsLogedin} userName={userData.name} />
    }else if(role === "Manager"){
      return <ManagerDb baseURL={baseUserSystemURL} setIsLogedin={setIsLogedin} userName={userData.name} />
    }else if(role === "Agent"){
      return <AgentDb baseURL={baseUserSystemURL} setIsLogedin={setIsLogedin} userName={userData.name} />
    }
  };

  return (
    <Router>
      <div className="App">
        {isLogedin ? (
          <Routes>
            //Home Route have Dashboard
            <Route path="/" element={
              <Dashboard role={userData.role} />
            } />

            <Route path="/profile" element={
              <Profile baseURL={baseUserSystemURL} setIsLogedin={setIsLogedin} userData={userData} setUserData={setUserData}/>
            } />

            //agents Route have AllUsers with role agents
            <Route path="/agents" element={
              userData.role === "Agent" ? ( //Agents didnt have Access to allAgents page
                <h1>Access Denied!!</h1>
              ) : (
                <AllUsers baseURL={baseUserSystemURL} userRole={userData.role} userName={userData.name}  getRole="agents" userID={userData.user_id} setIsLogedin={setIsLogedin} />
              )
            } />

            //managers Route have AllUsers with role managers
            <Route path="/managers" element={
              userData.role === "Agent" || userData.role === "Manager" ? (//Agents and Managers didnt have Access to allManagers page
                <h1>Access Denied!!</h1>
              ) : (
                <AllUsers baseURL={baseUserSystemURL} getRole="managers" setIsLogedin={setIsLogedin} userRole={userData.role} userName={userData.name} userID={userData.user_id}/>
              )
            } />

            //Broadcasting Rote
            <Route path="/broadcast" element={
              userData.role === "Manager" ? (//Only Managers have Access to Broadcasting page
                <Broadcasting baseBulkMessagingURL={baseBulkMessagingURL} baseUserSystemURL={baseUserSystemURL} getRole="managers" setIsLogedin={setIsLogedin} userRole={userData.role} userName={userData.name} />
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
                  baseUserSystemURL={baseUserSystemURL}
                  userName={userData.name}
                  userID={userData.user_id}
                  setIsLogedin={setIsLogedin} />
              )
            } />

            //Admin route for accessing new template request from manager
            <Route path="/template_requests" element={
              userData.role === "Agent" && userData.role === "Manager" ? ( //Managers & Agents didnt have Access to this page
                <h1>Access Denied!!</h1>
              ) : (
                <TemplateRequests
                  baseBulkMessagingURL={baseBulkMessagingURL}
                  baseUserSystemURL={baseUserSystemURL}
                  userName={userData.name}
                  userID={userData.user_id}
                  setIsLogedin={setIsLogedin} />
              )
            } />

            <Route path="/create_new_user" element={
              userData.role === "Agent" ? (//Agents and Managers didnt have Access to allManagers page
                <h1>Access Denied!!</h1>
              ) : (
                <CreateNewUser baseURL={baseUserSystemURL} userData={userData} setIsLogedin={setIsLogedin}/>
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
