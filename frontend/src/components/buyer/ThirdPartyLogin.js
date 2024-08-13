import React from 'react'
import { Link } from 'react-router-dom'

function ThirdPartyLogin() {

  const googleLogin = () => {
    window.location.href = "http://localhost:5000/api/v1/auth/login/google";
  };
  const facebookLogin = () => {
    window.location.href = "http://localhost:5000/api/v1/auth/login/facebook";
  };

  return (
    <div className='thirdPartyLoginDiv'>
        <Link className="loginWithFacebook" onClick={facebookLogin}>
            <img src="./assets/icons/facebook.png" alt="Error" />
            <p>Continue with Facebook</p>
        </Link>
        <Link className="loginWithGoogle" onClick={googleLogin}>
            <img src="./assets/icons/google.png" alt="Error" />
            <p>Continue with Google</p>
        </Link>
    </div>
  )
}

export default ThirdPartyLogin