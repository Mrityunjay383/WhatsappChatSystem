import React from 'react'

function AdminDb({baseURL}) {

    return (
        <div>
          <h1>Admin Dashboard</h1>
          <a href="/agents">Agnets</a>
          <a href="/managers">Managers</a>
        </div>
    )
}

export default AdminDb;
