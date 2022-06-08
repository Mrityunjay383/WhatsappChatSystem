import React, {useState} from 'react';
import axios from "axios";


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
        <div>
          <h1>Login Page</h1>
          <input type="email" placeholder="Enter Email" onChange={(e) => {
            setEmail(e.target.value);
          }}/>
          <input type="password" placeholder="Choose Password" onChange={(e) => {
            setPassword(e.target.value);
          }}/>
          <button onClick={login}>Login</button>
        </div>
    );
}

export default Login;
