import React, { useState, useEffect } from 'react'
import Dropdown from '../../components/common/Dropdown';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { FaEnvelope, FaLock, FaLockOpen } from 'react-icons/fa';
import { MdChat } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

function AdminBuyers() {

    const [buyers, setBuyers] = useState([]);
    const [filterType, setFilterType] = useState('All');
    const [isUpdated, setIsUpdated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBuyers = () => {
            const token = localStorage.getItem('adminToken');
            axios.get(`http://localhost:5000/api/v1/auth/all/`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { filterType }
            })
                .then((response) => {
                    if (response.data.success) setBuyers(response.data.allUsers);
                })
                .catch((e) => {
                    enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
                });
        };

        fetchBuyers();
    }, [filterType, isUpdated]);


    const handleBlockUser = async (userId, isBlocked) => {

        if (!window.confirm(isBlocked ? "Are you sure you want to unblock this user?" : `You are blocking user... Are you sure you want to block?`))
            return;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.put(
                `http://localhost:5000/api/v1/auth/block/`,
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


    const buyerElems = buyers.length > 0 ? buyers.map((item, index) => (
        <div key={index}>
            <div className="requestRow row">
                <div className="titleField field">
                    <p className="title">{item.email}</p>
                </div>
                <p className="usernameField field">{item.username}</p>
                <p className="statusField field">{item.userStatus}</p>
                <p className="joinField field">{new Date(item?.createdAt).toLocaleDateString()}</p>
                <div className="actionsField field">
                    <MdChat className="icon" />
                    <FaEnvelope className="icon" onClick={()=>navigate(`/ftzy-admin/email/send/${item?._id}`)} />
                    {item.userStatus === 'Blocked' ?
                        <FaLockOpen style={{ color: "var(--success)" }} className="icon" onClick={() => handleBlockUser(item._id, true)} />
                        :
                        <FaLock style={{ color: "var(--danger)" }} className="icon" onClick={() => handleBlockUser(item._id, false)} />
                    }
                </div>
            </div>
            {buyers.length > 1 && buyers.length - 1 !== index && <div className="horizontalLine"></div>}
        </div >
    ))
        : <div className="row">Nothing to show here...</div>;



    return (
        <div className='adminBuyersDiv'>
            <div className="adminBuyersContent">

                <div className="tableDiv">
                    <div className="tableContent">
                        <div className="upper">
                            <h2 className="secondaryHeading">
                                <span>{filterType} </span>Buyers
                                <span className="totalRows">- {(buyers.length < 10 && '0') + buyers.length}</span>
                            </h2>
                            <div className="upperRight">
                                <Dropdown options={["All", "Active", "Blocked"]} onSelect={setFilterType} selected={filterType} />
                            </div>
                        </div>
                        <div className="header">
                            <p className="title">Email</p>
                            <p>Username</p>
                            <p>Status</p>
                            <p>Member Since</p>
                            <p>Actions</p>
                        </div>
                        <div className="rows">{buyerElems}</div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AdminBuyers