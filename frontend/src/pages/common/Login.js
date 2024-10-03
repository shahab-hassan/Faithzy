import React, { useContext } from 'react'
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import { useSnackbar } from "notistack"

import ThirdPartyLogin from "../../components/buyer/ThirdPartyLogin"
import { AuthContext } from "../../utils/AuthContext";
import { hostNameBack } from '../../utils/constants'

function Login() {

  let [email, setEmail] = React.useState("");
  let [password, setPassword] = React.useState("");
  let [passwordHidden, setPasswordHidden] = React.useState(true);

  let [emailNotVerified, setEmailNotVerified] = React.useState(false);
  let [resendDisabled, setResendDisabled] = React.useState(false);


  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { login } = useContext(AuthContext);

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${hostNameBack}/api/v1/auth/login`, { email, password })
      if (response.data.success) {
        login(response.data.token);
        navigate("/");
        enqueueSnackbar("Logged in Successfully!", { variant: "success" });
      }
    }
    catch (e) {
      if (e?.response?.data?.error === "Not Verified"){
        setEmailNotVerified(true);
        enqueueSnackbar('Email is not verified. Please verify!', { variant: "error" })
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
      else
        enqueueSnackbar(e.response.data.error, { variant: "error" })
    }
  }

  const resendVerificationEmail = async () => {
    setResendDisabled(true);
    try {
      await axios.post(`${hostNameBack}/api/v1/auth/resend-verification`, { email });
      enqueueSnackbar("Verification email has been resent!", { variant: "success" });
      setTimeout(() => setResendDisabled(false), 10000);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Error sending email. Please try again later!", { variant: "error" });
      setResendDisabled(false);
    }
  };


  return (
    <div className='loginDiv'>
      {emailNotVerified && (
        <div className="emailVerificationNotification">
          <p>Your email is not verified. Please check your inbox and verify your email.</p>
          <button
            onClick={resendVerificationEmail}
            disabled={resendDisabled}
            className="secondaryBtn"
          >
            {resendDisabled ? "Resend in 10s" : "Resend Email"}
          </button>
        </div>
      )}

      <section className='section'>
        <div className="loginContent">

          {/* <div className="loginLeft">
            <div className="loginImgDiv">
              <img src="./assets/images/login.png" alt="Image can't be load" />
            </div>
          </div> */}

          <div className="loginRight">
            <h1 className='primaryHeading loginHeading'>Log<span>In</span></h1>
            <ThirdPartyLogin />
            <div className="orLine">OR</div>
            <form className="loginRightLower form" onSubmit={loginUser}>
              <h3 className='secondaryHeading'>Login with your email address</h3>
              <div className='inputDiv'>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name='email'
                  className='inputField'
                  placeholder='Enter your email address'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className='inputDiv'>
                <div className="passwordFieldUpper">
                  <label htmlFor="password">Password</label>
                  <div className='hidePasswordBtn'
                    onClick={() => setPasswordHidden((oldValue) => !oldValue)}
                  >
                    <i className={passwordHidden ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                  </div>
                </div>
                <input
                  type={passwordHidden ? "password" : "text"}
                  name='password'
                  className='inputField'
                  placeholder='Enter your password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Link to="/resetPasswordRequest" className='forgotPasswordBtn'>Forgot Password?</Link>
              </div>
              <div className='inputDiv'>
                <input
                  type="submit"
                  className='primaryBtn'
                  value="Log In"
                />
              </div>
              <div className="registerInsteadDiv">Don't have an account? <Link to="/register">SignUp!</Link></div>

            </form>
          </div>

        </div>
      </section>
    </div>
  )
}

export default Login