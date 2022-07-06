import React from 'react'
import "./AlertBox.css"

function AlertBox({setShowAlert, alertData}) {
    return (
        <div className="popUpCon">
          <div className="popUp">
            <h3>Alert: New Template Request</h3>
            <div>
              <span>Template Name: {alertData.name}</span>
              <span>Requested by: {alertData.requestByName}</span>
            </div>
            <button onClick={() => {
              setShowAlert(false);
            }}>Okay</button>
          </div>
        </div>
    )
}

export default AlertBox;
