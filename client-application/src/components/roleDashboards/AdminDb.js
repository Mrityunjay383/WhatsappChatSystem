import React from 'react'

function AdminDb({baseURL}) {

    return (
        <div>
          <h1>Admin Dashboard</h1>
          <a href="/agents">Agnets</a><br/>
          <a href="/managers">Managers</a><br/>
          <a href="/create_new_user">Create new User</a>
        </div>
    )
}

export default AdminDb;
