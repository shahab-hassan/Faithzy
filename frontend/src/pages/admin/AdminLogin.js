import React, { useContext } from 'react'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../utils/AuthContext";
import { hostNameBack } from '../../utils/constants';

function AdminLogin() {

  let [email, setEmail] = React.useState("");
  let [password, setPassword] = React.useState("");
  let [passwordHidden, setPasswordHidden] = React.useState(true);
  const navigate = useNavigate();
  const { adminLogin } = useContext(AuthContext);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${hostNameBack}/api/v1/admins/admin/login`, { email, password })
      if (response.data.success) {
        adminLogin(response.data.token)
        navigate("/ftzy-admin/dashboard")
        enqueueSnackbar("LoggedIn Successfully!", { variant: "success" })
      }
      else
        enqueueSnackbar("Something went wrong!", { variant: "error" })
    }
    catch (e) {
      enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" })
    }
  }

  return (
    <div className='adminLoginDiv'>
      <div className='adminLoginContent'>

        <form className="form" onSubmit={handleFormSubmit}>

          <h2 className="primaryHeading">LogIn to <span>Admin</span> Panel</h2>
          <div className="horizontalLine"></div>

          <div className='inputDiv'>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name='email'
              className='inputField'
              placeholder='Enter Email Address'
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
            {/* <Link className='forgotPasswordBtn'>Forgot Password?</Link> */}
          </div>

          <button type='submit' className='primaryBtn'>Login</button>

        </form>

      </div>
    </div>
  )
}

export default AdminLogin