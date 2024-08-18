import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { enqueueSnackbar } from "notistack"

function AdminTerms() {

    const [terms, setTerms] = useState("");

    useEffect(() => {
        axios.get('http://localhost:5000/api/v1/settings/admin/terms')
            .then(res => {
                if (res.data.success)
                    setTerms(res.data?.terms || "");
            })
            .catch(e => {
                console.error(e);
                enqueueSnackbar(e?.reponse?.data?.error || "Something went wrong!", { variant: "error" })
            });
    }, []);

    const handleSave = () => {
        const token = localStorage.getItem('adminToken');
        axios.post('http://localhost:5000/api/v1/settings/admin/terms', { content: terms }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            if (res.data.success)
                enqueueSnackbar('Terms & conditions updated successfully!', { variant: "success" });
        })
        .catch(e => {
            console.error(e);
            enqueueSnackbar(e?.reponse?.data?.error || "Something went wrong!", { variant: "error" })
        });
    };

    return (
        <div className='adminTermsDiv'>
            <div className="adminTermsContent">

                <div className="form">
                    <h2 className='secondaryHeading'><span>Terms</span> & <span>Conditions</span></h2>
                    <div className="horizontalLine"></div>
                    <div className='inputDiv'>
                        <textarea
                            value={terms}
                            onChange={(e) => setTerms(e.target.value)}
                            rows="20"
                        />
                        <button className='primaryBtn' onClick={handleSave}>Save</button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminTerms;
