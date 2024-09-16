import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
    return (
        <div className='notFoundDiv'>
            <div className="notFoundImgDiv">
                <img src="/assets/images/notFound.png" alt="Error" />
            </div>
            <p>Oops! Page Not Found</p>
            <Link to="/" className="primaryBtn">Back To Home</Link>
        </div>
    )
}

export default NotFound