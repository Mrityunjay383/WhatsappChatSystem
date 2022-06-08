import "./App.css";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

import ChatPage from "./components/ChatPage";
import Dashboard from "./components/Dashboard";
import AllUsers from "./components/AllUsers";

const baseUserSystemURL = "http://localhost:3002";

function App() {

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <Dashboard baseURL={baseUserSystemURL}/>
          } />
          <Route path="/agents" element={
            <AllUsers baseURL={baseUserSystemURL} role="agents"/>
          } />
          <Route path="/managers" element={
            <AllUsers baseURL={baseUserSystemURL} role="managers"/>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
