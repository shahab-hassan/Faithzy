import React, {useContext} from 'react'
import axios from 'axios';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

import {AuthContext} from "../../utils/AuthContext"
import BecomeSeller from "../../pages/seller/BecomeSeller"
import { enqueueSnackbar } from 'notistack';

function Settings() {

  const {user, isLogin} = useContext(AuthContext);
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [showPassInputs, setShowPassInputs] = React.useState(false);

  React.useEffect(()=>{
    setEmail(user? user.email:"");
    setUsername(user? user.username:"");
  }, [user])

  const updateGeneralSettings = async (e)=>{
    e.preventDefault();
    const token = localStorage.getItem("token");
    await axios.put(`http://localhost:5000/api/v1/auth/updateUser/${user._id}`, {email, username}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      if(response.data.success)
        enqueueSnackbar(response.data.message, {variant: "success"});
      else
        enqueueSnackbar("Something went wrong!", {variant: "error"})
    })
    .catch(e => {
      console.log(e)
      enqueueSnackbar(e.response.data.error || "Something went wrong!", {variant: "error"})
    })
  }

  const updatePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(`http://localhost:5000/api/v1/auth/updatePassword/${user._id}`, { oldPassword, newPassword, confirmNewPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success)
        enqueueSnackbar(response.data.message, { variant: "success" });
      else
        enqueueSnackbar("Something went wrong!", { variant: "error" });
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || "Something went wrong!", { variant: "error" });
    }
  };

  return (
    <div className='settingsDiv'>
        <section className="section">
            <div className="settingsContent">

                {/* <h1 className="primaryHeading"><span>Settings</span></h1> */}

                <form className="generalSettings form" onSubmit={updateGeneralSettings}>

                  <h1 className="primaryHeading"><span>General</span> Settings</h1>

                  {isLogin? <> 
                  <div className="inputDiv">
                    <label>Email</label>
                    <input type="email" name='email' className='inputField' value={email} onChange={(e)=>setEmail(e.target.value)} placeholder='Enter new email' />
                  </div>

                  <div className="inputDiv">
                      <label>Username</label>
                      <input type="text" name='username' className='inputField' value={username} onChange={(e)=> setUsername(e.target.value)} placeholder='Enter new username' />
                  </div>

                  <input type='submit' className="primaryBtn" value="Update" />

                  <div className="changePassDiv">

                    <div className="upper" onClick={()=> setShowPassInputs(prev => !prev)}>
                      <p>Change Password</p>
                      {showPassInputs? <MdKeyboardArrowUp className='icon' /> : <MdKeyboardArrowDown className='icon' />}
                    </div>

                    {showPassInputs && <div className="lower">

                      <div className="inputDiv">
                        <input type="password" placeholder='Enter old password' className='inputField' value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                      </div>

                      <div className="inputDiv">
                        <div className='inputInnerDiv'>
                          <input type="password" placeholder='Enter new password' className='inputField' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </div>
                        <div className='inputInnerDiv'>
                          <input type="password" placeholder='Confirm new password' className='inputField' value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                        </div>
                      </div>

                      <button className="secondaryBtn" onClick={updatePassword}>Change</button>

                    </div>}
                    

                  </div>

                  </>
                  : <div>Please login to access this section</div>}

                </form>

                <div className="horizontalLine"></div>

                <div className="sellerSettings">

                  <h1 className='primaryHeading'><span>Seller</span> Settings</h1>

                  {isLogin? user.role === "seller"? 
                    <BecomeSeller sellerId={user? user.sellerId._id : null} /> 
                    : <div>Please create seller account to access this page</div>
                    : <div>Please login to access this section</div> }

                </div>

            </div>
        </section>
    </div>
  )
}

export default Settings