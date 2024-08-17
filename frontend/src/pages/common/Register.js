import React from 'react'
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { useSnackbar } from "notistack"

import ThirdPartyLogin from "../../components/buyer/ThirdPartyLogin"

function Register() {

  let [username, setUsername] = React.useState("");
  let [email, setEmail] = React.useState("");
  let [password, setPassword] = React.useState("");
  let [confirmPass, setConfirmPass] = React.useState("");
  let [passwordHidden, setPasswordHidden] = React.useState(true);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const registerUser = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5000/api/v1/auth/register", { username, email, password, confirmPass }).then(() => {
      enqueueSnackbar("Registered Successfully!", { variant: "success" })
      navigate("/login")
    }).catch((e) => {
      enqueueSnackbar(e.response.data.error, { variant: "error" })
    })
  }

  return (
    <div className='registerDiv'>
      <section className='section'>
        <div className="registerContent">

          {/* <div className="registerLeft">
            <div className="registerImgDiv">
              <img src="./assets/images/signup.png" alt="Image can't be load" />
            </div>
          </div> */}

          <form className="registerRight form" onSubmit={registerUser}>
            <h1 className='primaryHeading signUpHeading'>Sign<span>Up</span></h1>
            <ThirdPartyLogin />
            <div className="orLine">OR</div>
            <div className="registerRightLower">
              <h3 className='secondaryHeading'>Sign up with your email address</h3>
              <div className='inputDiv'>
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  name='username'
                  className='inputField'
                  placeholder='Enter your username'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
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
                <p className='passInstructions'>Use 8 or more characters with a mix of letters, numbers & symbols</p>
              </div>
              <div className='inputDiv'>
                <label htmlFor="confirmPass">Confirm Password</label>
                <input
                  type={passwordHidden? "password": "text"}
                  name='confirmPass'
                  className='inputField'
                  placeholder='Re-write Password'
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                />
              </div>
              <div className='inputDiv'>
                <input
                  type="submit"
                  className='primaryBtn'
                  value="Sign Up"
                />
              </div>
              <div className="loginInsteadDiv">Already have an account? <Link to="/login">Login!</Link></div>

            </div>
          </form>

        </div>
      </section>
    </div>
  )
}

export default Register