import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react'
import Dropdown from '../../components/common/Dropdown';
import {formatDate} from "../../utils/utilFuncs"
import { Link, useNavigate } from 'react-router-dom';

function AdminDisputes() {

    const [disputes, setDisputes] = useState([]);
    const [filterType, setFilterType] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDisputes = () => {
            const token = localStorage.getItem('adminToken');
            axios.get(`http://localhost:5000/api/v1/disputes/all/`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { filterType }
            })
                .then((response) => {
                    if (response.data.success) setDisputes(response.data.allDisputes);
                })
                .catch((e) => {
                    enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
                });
        };

        fetchDisputes();
    }, [filterType]);


    const disputeElems = disputes.length > 0 ? disputes.map((item, index) => (
        <div key={index}>
            <div className="requestRow row">
                {/* <div className="titleField field">
                    <p className="title">{item._id}</p>
                </div> */}
                <p className="startDateField field">{formatDate(item?.createdAt)}</p>
                <p className="buyerField field">{item.buyerId?.username}</p>
                <Link to={`/ftzy-admin/sellers/${item?.sellerId?._id}`} className="sellerField field">{item.sellerId?.userId?.username + " >"}</Link>
                <p className="priceField field">${item?.orderAmount}</p>
                <p className="statusField field">{item?.status}</p>
                <div className="actionsField field"><button className="secondaryBtn" onClick={()=> navigate(`${item._id}`)}>Manage</button></div>
            </div>
            {disputes.length > 1 && disputes.length - 1 !== index && <div className="horizontalLine"></div>}
        </div >
    ))
        : <div className="row">Nothing to show here...</div>;


    return (
        <div className='adminDisputesDiv'>
            <div className="adminDisputesContent">

                <div className="tableDiv">
                    <div className="tableContent">
                        <div className="upper">
                            <h2 className="secondaryHeading">
                                <span>{filterType} </span>Disputes
                                <span className="totalRows">- {(disputes.length < 10 && '0') + disputes.length}</span>
                            </h2>
                            <div className="upperRight">
                                <Dropdown options={["All", "InProgress", "Resolved"]} onSelect={setFilterType} selected={filterType} />
                            </div>
                        </div>
                        <div className="header">
                            {/* <p className="title">Dispute ID</p> */}
                            <p>Started On</p>
                            <p>Buyer</p>
                            <p>Seller</p>
                            <p>Order Amount</p>
                            <p>Status</p>
                            <p>Actions</p>
                        </div>
                        <div className="rows">{disputeElems}</div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AdminDisputes