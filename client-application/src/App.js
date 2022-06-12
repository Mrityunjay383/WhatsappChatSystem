import React, { useState, useEffect } from 'react'
import "./App.css";
import axios from "axios";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

import AllUsers from "./components/AllUsers";
import CreateNewUser from "./components/CreateNewUser";
import Login from "./components/Login";

import AdminDb from "./components/roleDashboards/AdminDb";
import ManagerDb from "./components/roleDashboards/ManagerDb";
import AgentDb from "./components/roleDashboards/AgentDb";

import ManagerAsignPage from "./components/ManagerAsignPage";

//Importing as lazy so that socket only runs when user is agent or customer
const ChatPage = React.lazy(() => import('./components/chatComponents/ChatPage'));
const CustomerChat = React.lazy(() => import('./components/chatComponents/CustomerChat'));


const baseUserSystemURL = "http://localhost:3002";
const baseChatSystemURL = "http://localhost:3001";

function App() {

  const [isLogedin, setIsLogedin] = useState(false);
  const [userData, setUserData] = useState({});

  const ChatPageRender = () => {
    return (
      <>
        <React.Suspense fallback={<></>}>
          {(userData.role === "Agent") && <ChatPage baseURL={baseChatSystemURL} userData={userData}/>}
        </React.Suspense>
      </>
    )
  }

  const CustomerChatRender = () => {
    return (
      <>
        <React.Suspense fallback={<></>}>
          {(userData.role === "Customer") && <CustomerChat />}
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
        setIsLogedin(true);
        setUserData(response.data.user);
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
      return <AdminDb baseURL={baseUserSystemURL}/>
    }else if(role === "Manager"){
      return <ManagerDb />
    }else if(role === "Agent"){
      return <AgentDb />
    }else{
      return <CustomerChatRender />
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

            //agents Route have AllUsers with role agents
            <Route path="/agents" element={
              userData.role === "Agent" ? ( //Agents didnt have Access to allAgents page
                <h1>Access Denied!!</h1>
              ) : (
                <AllUsers baseURL={baseUserSystemURL} role="agents" />
              )
            } />

            //managers Route have AllUsers with role managers
            <Route path="/managers" element={
              userData.role === "Agent" || userData.role === "Manager" ? (//Agents and Managers didnt have Access to allManagers page
                <h1>Access Denied!!</h1>
              ) : (
                <AllUsers baseURL={baseUserSystemURL} role="managers"/>
              )
            } />

            <Route path="/create_new_user" element={
              userData.role === "Agent" ? (//Agents and Managers didnt have Access to allManagers page
                <h1>Access Denied!!</h1>
              ) : (
                <CreateNewUser baseURL={baseUserSystemURL} userRole={userData.role}/>
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
                <ManagerAsignPage baseURL={baseChatSystemURL} />
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
