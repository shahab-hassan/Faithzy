import React, {useContext} from 'react'
import axios from "axios"
import {useNavigate, Link} from "react-router-dom"
import {useSnackbar} from "notistack"

import ThirdPartyLogin from "../../components/buyer/ThirdPartyLogin"
import { AuthContext } from "../../utils/AuthContext";

function Login() {

  let [email, setEmail] = React.useState("");
  let [password, setPassword] = React.useState("");
  let [passwordHidden, setPasswordHidden] = React.useState(true);

  const navigate = useNavigate();
  const {enqueueSnackbar} = useSnackbar();
  const { login } = useContext(AuthContext);

  const loginUser = async (e)=>{
    e.preventDefault();
    try{
      const response = await axios.post("http://localhost:5000/api/v1/auth/login", {email, password})
      if(response.data.success){
        login(response.data.token)
        navigate("/")
        enqueueSnackbar("LoggedIn Successfully!", {variant: "success"})
      }
      else
        enqueueSnackbar("Something went wrong!", {variant: "error"})
    }
    catch(e){
      enqueueSnackbar(e.response.data.error, {variant: "error"})
    }
  }

  return (
    <div className='loginDiv'>
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
                    onClick={()=>setPasswordHidden((oldValue)=> !oldValue)}
                  >
                    <i className={passwordHidden? "fa-solid fa-eye-slash":"fa-solid fa-eye"}></i>
                  </div>
                </div>
                <input
                  type={passwordHidden? "password": "text"}
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