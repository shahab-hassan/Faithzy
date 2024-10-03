import React from 'react'
import { Link } from 'react-router-dom'
import { hostNameBack } from '../../utils/constants';

function ThirdPartyLogin() {

  const googleLogin = () => {
    window.location.href = `${hostNameBack}/api/v1/auth/login/google`;
  };
  const facebookLogin = () => {
    window.location.href = `${hostNameBack}/api/v1/auth/login/facebook`;
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