import React from 'react'

function TopCon({userName, page}) {
    return (
        <div className="topCon">
          <span className="pageHead">{page}</span>
          <span>{userName}</span>
        </div>
    )
}

export default TopCon;
