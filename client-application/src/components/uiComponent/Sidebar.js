import React from 'react';
import "./Sidebar.css";

function Sidebar({role}) {

    const Links = () => {
      if(role === "Admim"){
        return <div>
          <a href="/agents">Agnets</a><br/>
          <a href="/managers">Managers</a><br/>
          <a href="/create_new_user">Create new User</a>
        </div>;
      }else if(role === "Agent"){
        return <div>
          <a href="/chat">Chat Requests</a>
        </div>;
      }else{
        return <div>
        <a href="/agents">Agnets</a><br/>
        <a href="/asign_agent">Assign Agnets</a><br/>
        <a href="/create_new_user">Create new User</a>
        </div>;
      }

    }


    return (
        <div className="sidebar">
          LOgo

          <Links />

        </div>
    )
}

export default Sidebar;
