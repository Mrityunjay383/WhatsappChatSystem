import React, { useState, useEffect } from 'react'
import "./App.css";
import axios from "axios";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

import ChatPage from "./components/ChatPage";
import Dashboard from "./components/Dashboard";
import AllUsers from "./components/AllUsers";

import Login from "./components/Login";

const baseUserSystemURL = "http://localhost:3002";

function App() {

  const [isLogedin, setIsLogedin] = useState(false);
  const [userData, setUserData] = useState({});

  const valToken = async () => {//function for checking the JWT from backend API
    await axios.get(baseUserSystemURL, { validateStatus: false, withCredentials: true }).then((response) => {
      if(response.status === 404 || response.status === 401){
        setIsLogedin(false);
      }else{
        setIsLogedin(true);
        setUserData(response.data.user);
      }
    });
  }

  const changeLoginState = (user) => {
    setUserData(user);
    setIsLogedin(true);
  }

  useEffect(() => {//validating JWT on every time the component mount
    valToken();
  }, []);

  return (
    <Router>
      <div className="App">
        {isLogedin ? (
          <Routes>
            //Home Route have Dashboard
            <Route path="/" element={
              <Dashboard baseURL={baseUserSystemURL} userData={userData} changeLoginState={changeLoginState}/>
            } />

            //agents Route have AllUsers with role agents
            <Route path="/agents" element={
              userData.role === "Agent" ? (//Agents didnt have Access to allAgents page
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
                <AllUsers baseURL={baseUserSystemURL} requestedRole="managers"/>
              )
            } />

          </Routes>
        ) : (
          <Login baseURL={baseUserSystemURL} changeLogin={changeLoginState} />
        )}
      </div>
    </Router>
  );
}

export default App;
