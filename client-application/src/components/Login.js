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
        <div className= "loginPage">
          <div className="loginCon">

            <div className="loginHead">
              <h1>Login to Dashboard</h1>
              <p>Enter your email and password below</p>
            </div>


            <div className="form-group">
              <label htmlFor="exampleInputEmail1">Email</label>
              <input type="email" className="form-control" placeholder="Enter email" onChange={(e) => {
                setEmail(e.target.value);
              }}/>
            </div>
            <div className="form-group">
              <label htmlFor="exampleInputPassword1">Password</label>
              <input type="password" className="form-control" placeholder="Enter password" onChange={(e) => {
                setPassword(e.target.value);
              }}/>
            </div>
            <button type="submit" className="colorBtn" onClick={login}>Login</button>
          </div>
        </div>
    );
}

export default Login;
