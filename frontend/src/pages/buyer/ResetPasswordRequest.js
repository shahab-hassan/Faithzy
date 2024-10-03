
import React from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { hostNameBack } from '../../utils/constants';

function ResetPasswordRequest() {
    const [email, setEmail] = React.useState("");
    const { enqueueSnackbar } = useSnackbar();

    const requestPasswordReset = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${hostNameBack}/api/v1/auth/resetPasswordRequest`, { email });
            if(response.data.success)
                enqueueSnackbar("Password reset link sent to your email", { variant: "success" });
            else
                enqueueSnackbar("Something went wrong", { variant: "success" });
        } catch (e) {
            if(e.response.data.error)
                enqueueSnackbar(e.response.data.error, { variant: "error" });
            else{
                console.log(e);
                enqueueSnackbar('Error Sending Email', { variant: "error" });
            }
        }
    };

    return (
        <div className='resetPasswordRequestDiv' style={{margin: "50px 0px"}}>
            <section className="section">

                <form onSubmit={requestPasswordReset} className='form'>
                    <div className='inputDiv'>
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder='Enter your email' 
                            value={email}
                            className='inputField'
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <input type="submit" value="Request Password Reset" className='primaryBtn' />
                    </div>
                </form>

            </section>
        </div>
    );
}

export default ResetPasswordRequest;
