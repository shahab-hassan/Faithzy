import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { enqueueSnackbar } from "notistack";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { hostNameBack } from '../../utils/constants';

function AdminTerms() {
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
                enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
            });
    }, []);

    const handleSave = () => {
        const token = localStorage.getItem('adminToken');
        axios.post(`${hostNameBack}/api/v1/settings/admin/terms`, { content: terms }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (res.data.success) {
                    enqueueSnackbar('Terms & conditions updated successfully!', { variant: "success" });
                }
            })
            .catch(e => {
                console.error(e);
                enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
            });
    };

    return (
        <div className='adminTermsDiv'>
            <div className="adminTermsContent">
                <div className="form">
                    <h2 className='secondaryHeading'><span>Terms</span> & <span>Conditions</span></h2>
                    <div className="horizontalLine"></div>
                    <ReactQuill
                        value={terms}
                        onChange={(value) => setTerms(value)}
                        theme="snow"
                        className='reactQuill'
                    />
                    <button className='primaryBtn' onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
}

export default AdminTerms;
