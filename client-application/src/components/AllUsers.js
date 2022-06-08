import React, {useState, useEffect} from 'react'
import axios from "axios";


function AllUsers({baseURL, role}) {

    const [usersList, setusersList] = useState([]);

    const getUsers = async () => {
      await axios.get(`${baseURL}/${role}`, { validateStatus: false, withCredentials: true }).then((response) => {
        setusersList(response.data[`${role}`]);
      });
    }

    useEffect(() => {
      getUsers();
    }, []);

    const UserCard = ({user}) => {
      return (
        <div className="auserCard">
          <h3>Name: {user.firstName} {user.lastName}</h3>
          <p>Username: {user.email}</p>
          <hr/>
        </div>
      )
    }

    return (
        <div>
            <h1>{role} Page</h1>
            <div className="userCon">
              {usersList.map((user, index) => {
                return <UserCard key={index} user={user} />
              })}
            </div>
        </div>
    )
}

export default AllUsers;
