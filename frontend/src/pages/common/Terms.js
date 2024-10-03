import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { enqueueSnackbar } from "notistack";
import { hostNameBack } from '../../utils/constants';

function Terms() {
    const [terms, setTerms] = useState("");

    useEffect(() => {
        axios.get(`${hostNameBack}/api/v1/settings/admin/terms`)
            .then(res => {
                if (res.data.success) {
                    setTerms(res.data?.terms || "");
                }
            })
            .catch(e => {
                console.error(e);
                enqueueSnackbar(e?.reponse?.data?.error || "Something went wrong!", { variant: "error" });
            });
    }, []);

    return (
        <div className='termsDiv'>
            <div className="termsContent">
                <h2 className='primaryHeading'><span>Terms</span> & <span>Conditions</span></h2>
                <div className="horizontalLine"></div>
                <div>
                    <div dangerouslySetInnerHTML={{ __html: terms }} />
                </div>
            </div>
        </div>
    );
}

export default Terms;
