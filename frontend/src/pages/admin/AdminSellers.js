import React, { useState, useEffect } from 'react'
import Dropdown from '../../components/common/Dropdown';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { FaLock, FaLockOpen } from "react-icons/fa";
import { MdChat } from "react-icons/md";
import { useNavigate } from "react-router-dom"
import { hostNameBack } from '../../utils/constants';

function AdminSellers() {

    const [sellers, setSellers] = useState([]);
    const [filterType, setFilterType] = useState('All');
    const [isUpdated, setIsUpdated] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchSellers = () => {
            const token = localStorage.getItem('adminToken');
            axios.get(`${hostNameBack}/api/v1/sellers/all/`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { filterType }
            })
                .then((response) => {
                    if (response.data.success) {
                        const sortedSellers = response.data.allSellers.sort((a, b) => new Date(b.userId.updatedAt) - new Date(a.userId.updatedAt));
                        setSellers(sortedSellers);
                    }
                })
                .catch((e) => {
                    enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
                });
        };

        fetchSellers();
    }, [filterType, isUpdated]);


    const handleBlockUser = async (userId, isBlocked) => {

        if (!window.confirm(isBlocked ? "Are you sure you want to unblock this user?" : `You are blocking user... Are you sure you want to block?`))
            return;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.put(
                `${hostNameBack}/api/v1/auth/block/`,
                { userId, isBlocked },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setIsUpdated(prev => !prev)
                enqueueSnackbar(isBlocked ? "User has been UnBlocked!" : 'User has been blocked!', { variant: 'success' });
            }
        } catch (e) {
            console.log(e);
            enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
        }
    };


    const sellerElems = sellers.length > 0 ? sellers.map((item, index) => (
        <div key={index}>
            <div className="requestRow row">
                <div className="titleField field">
                    <p className="title">{item.userId?.email}</p>
                </div>
                <p className="usernameField field">{item.userId?.username}</p>
                <p className="typeField field">{item.sellerType}</p>
                <p className="statusField field">{item?.userId?.userStatus}</p>
                <p className="joinField field">{new Date(item?.createdAt).toLocaleDateString()}</p>
                <div className="actionsField field">
                    <MdChat className="icon" onClick={() => navigate(`/ftzy-admin/chats/?p=${item.userId?._id}`)} />
                    {item.userId.userStatus === 'Blocked' ?
                        <FaLockOpen style={{ color: "var(--success)" }} className="icon" onClick={() => handleBlockUser(item.userId._id, true)} />
                        :
                        <FaLock style={{ color: "var(--danger)" }} className="icon" onClick={() => handleBlockUser(item.userId._id, false)} />
                    }
                    <MdKeyboardArrowRight className="icon arrowRight" onClick={() => navigate(`${item._id}`)} />
                </div>
            </div>
            {sellers.length > 1 && sellers.length - 1 !== index && <div className="horizontalLine"></div>}
        </div >
    ))
        : <div className="row">Nothing to show here...</div>;



    return (
        <div className='adminSellersDiv'>
            <div className="adminSellersContent">

                <div className="tableDiv">
                    <div className="tableContent">
                        <div className="upper">
                            <h2 className="secondaryHeading">
                                <span>{filterType} </span>Sellers
                                <span className="totalRows">- {(sellers.length < 10 && '0') + sellers.length}</span>
                            </h2>
                            <div className="upperRight">
                                <Dropdown options={["All", "Active", "Blocked", "Paid", "Free"]} onSelect={setFilterType} selected={filterType} />
                            </div>
                        </div>
                        <div className="header">
                            <p className="title">Email</p>
                            <p>Username</p>
                            <p>Seller Type</p>
                            <p>Status</p>
                            <p>Seller Since</p>
                            <p>Actions</p>
                        </div>
                        <div className="rows">{sellerElems}</div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AdminSellers