import React, {useState} from 'react';
import axios from "axios";
import "./Login.css"


function Login({baseURL, changeLogin}) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
      axios.post(`${baseURL}/auth/login`, {email, password}, {validateStatus: false, withCredentials: true}).then((response) => {
        if(response.status === 200 && response.data.success){
          console.log("User Logedin");
          changeLogin(response.data.user);
        }else{
          console.log("Login Failed");
        }
      });
    }

    return (
        <div className= "loginCon">
          <div>
            <h1>Login to Dashboard</h1>
            <div className="inpCon">
            <div>
              <label>Email:</label>
              <input type="email" placeholder="Enter Email" onChange={(e) => {
                setEmail(e.target.value);
              }}/>
            </div>
            <div>
              <label>Password:</label>
              <input type="password" placeholder="Choose Password" onChange={(e) => {
                setPassword(e.target.value);
              }}/>
            </div>
            <button onClick={login}>Login</button>
            </div>
          </div>

        </div>
    );
}

export default Login;
