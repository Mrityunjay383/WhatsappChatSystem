import React from 'react';
import "./Sidebar.css";
import axios from "axios";

const OverviewIcon = () => {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5232 8.94116H8.54412L13.1921 13.5891C13.3697 13.7667 13.6621 13.7812 13.8447 13.6091C14.9829 12.5367 15.7659 11.0912 15.9956 9.46616C16.035 9.18793 15.8041 8.94116 15.5232 8.94116ZM15.0576 7.03528C14.8153 3.52176 12.0076 0.714119 8.49412 0.471767C8.22589 0.453237 8 0.679413 8 0.948236V7.5294H14.5815C14.8503 7.5294 15.0762 7.30352 15.0576 7.03528ZM6.58824 8.94116V1.96206C6.58824 1.68118 6.34147 1.45029 6.06353 1.48971C2.55853 1.985 -0.120585 5.04705 0.00412089 8.71675C0.132356 12.4856 3.37736 15.5761 7.14794 15.5288C8.6303 15.5103 10 15.0326 11.1262 14.2338C11.3585 14.0691 11.3738 13.727 11.1724 13.5256L6.58824 8.94116Z" fill="#3751FF"/>
  </svg>
}

const NewUserIcon = () => {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.4 7.19999C3.2825 7.19999 4 6.48249 4 5.59999C4 4.71749 3.2825 3.99999 2.4 3.99999C1.5175 3.99999 0.8 4.71749 0.8 5.59999C0.8 6.48249 1.5175 7.19999 2.4 7.19999ZM13.6 7.19999C14.4825 7.19999 15.2 6.48249 15.2 5.59999C15.2 4.71749 14.4825 3.99999 13.6 3.99999C12.7175 3.99999 12 4.71749 12 5.59999C12 6.48249 12.7175 7.19999 13.6 7.19999ZM14.4 7.99999H12.8C12.36 7.99999 11.9625 8.17749 11.6725 8.46499C12.68 9.01749 13.395 10.015 13.55 11.2H15.2C15.6425 11.2 16 10.8425 16 10.4V9.59999C16 8.71749 15.2825 7.99999 14.4 7.99999ZM8 7.99999C9.5475 7.99999 10.8 6.74749 10.8 5.19999C10.8 3.65249 9.5475 2.39999 8 2.39999C6.4525 2.39999 5.2 3.65249 5.2 5.19999C5.2 6.74749 6.4525 7.99999 8 7.99999ZM9.92 8.79999H9.7125C9.1925 9.04999 8.615 9.19999 8 9.19999C7.385 9.19999 6.81 9.04999 6.2875 8.79999H6.08C4.49 8.79999 3.2 10.09 3.2 11.68V12.4C3.2 13.0625 3.7375 13.6 4.4 13.6H11.6C12.2625 13.6 12.8 13.0625 12.8 12.4V11.68C12.8 10.09 11.51 8.79999 9.92 8.79999ZM4.3275 8.46499C4.0375 8.17749 3.64 7.99999 3.2 7.99999H1.6C0.7175 7.99999 0 8.71749 0 9.59999V10.4C0 10.8425 0.3575 11.2 0.8 11.2H2.4475C2.605 10.015 3.32 9.01749 4.3275 8.46499Z" fill="#3751FF"/>
  </svg>

}

const AgentIcon = () => {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 8C10.2094 8 12 6.20937 12 4C12 1.79063 10.2094 0 8 0C5.79063 0 4 1.79063 4 4C4 6.20937 5.79063 8 8 8ZM10.9937 9.01875L9.5 15L8.5 10.75L9.5 9H6.5L7.5 10.75L6.5 15L5.00625 9.01875C2.77812 9.125 1 10.9469 1 13.2V14.5C1 15.3281 1.67188 16 2.5 16H13.5C14.3281 16 15 15.3281 15 14.5V13.2C15 10.9469 13.2219 9.125 10.9937 9.01875Z" fill="#3751FF"/>
  </svg>
}

function Sidebar({role, baseURL, setIsLogedin, page}) {
    const logOut = async () => {
      await axios.get(`${baseURL}/auth/logout`, { validateStatus: false, withCredentials: true }).then((response) => {
        setIsLogedin(false);
      });
    }


    const Links = () => {
      if(role === "Admin"){
        return <div className="links">
          <a href="/" className={page === "overview" ? "active" : "nonActive"}>
            <OverviewIcon />
            <span>Overview</span>
          </a>

          <a href="/agents">
            <AgentIcon />
            <span>Agnets</span>
          </a>

          <a href="/managers">
            <AgentIcon />
            <span>Managers</span>
          </a>

          <a href="/create_new_user" className={page === "createNewUser" ? "active" : "nonActive"}>
            <NewUserIcon />
            <span>Create new User</span>
          </a>

        </div>;
      }else if(role === "Agent"){
        return <div className="links">
          <a href="/chat">Chat Requests</a>
        </div>;
      }else{
        return <div className="links">
        <a href="/agents">Agnets</a><br/>
        <a href="/asign_agent">Assign Agnets</a><br/>
        <a href="/create_new_user">Create new User</a>
        </div>;
      }

    }


    return (
        <div className="sidebar">
          <h1>Logo</h1>


          <Links />
          <button onClick={logOut}>LogOut</button>
        </div>
    )
}

export default Sidebar;
