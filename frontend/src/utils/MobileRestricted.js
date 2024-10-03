import React from 'react'
import { Link } from 'react-router-dom'

function MobileRestricted() {
    return (
        <div className='notFoundDiv'>
            <div className="notFoundImgDiv">
                <img src="/assets/images/notFound.png" alt="Error" />
            </div>
            <p>Please use Desktop to access this Resource!</p>
            <Link to="/" className="primaryBtn">Back To Home</Link>
        </div>
    )
}

export default MobileRestricted