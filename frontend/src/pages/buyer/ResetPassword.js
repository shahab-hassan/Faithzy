import React from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { hostNameBack } from '../../utils/constants';

function ResetPassword() {
    const [password, setPassword] = React.useState("");
    const [confirmPass, setConfirmPass] = React.useState("");
    const { token } = useParams();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const resetPassword = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${hostNameBack}/api/v1/auth/resetPassword/${token}`, { password, confirmPass });
            enqueueSnackbar("Password reset successful", { variant: "success" });
            navigate("/login");
        } catch (e) {
            if (e.response.data.error)
                enqueueSnackbar(e.response.data.error, { variant: "error" });
            else {
                console.log(e)
                enqueueSnackbar("Can't Reset Password... Something went wrong", { variant: "error" });
            }

        }
    };

    return (
        <div className='resetPasswordDiv' style={{ margin: "50px 0px" }}>
            <section className='section'>

                <form onSubmit={resetPassword} className='form'>
                    <div className='inputDiv'>
                        <div className="inputInnerDiv">
                            <label htmlFor="password">New Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder='Enter new password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className='inputField'
                            />
                        </div>
                        <div className='inputInnerDiv'>
                            <label htmlFor="confirmPass">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPass"
                                placeholder='Confirm new password'
                                value={confirmPass}
                                onChange={(e) => setConfirmPass(e.target.value)}
                                className='inputField'
                            />
                        </div>
                    </div>
                    <div>
                        <input type="submit" value="Reset Password" className='primaryBtn ' />
                    </div>
                </form>

            </section>
        </div>
    );
}

export default ResetPassword;