import React, { useState, useEffect } from 'react'
import axios from "axios"
import { enqueueSnackbar } from 'notistack';
import Dropdown from '../../components/common/Dropdown';
import { FaCheck, FaEye } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { IoIosCloseCircleOutline } from 'react-icons/io';

function AdminPayments() {

    const [payments, setPayments] = useState([]);
    const [itemTypeFilter, setItemTypeFilter] = useState("- Item Type -");
    const [statusTypeFilter, setStatusTypeFilter] = useState("- Status -");
    const [paymentToFilter, setPaymentToFilter] = useState("- Payment To -");
    const [showDetailsModal, setShowDetailsModal] = useState(null);

    const adminToken = localStorage.getItem('adminToken');


    useEffect(() => {

        axios.get(`http://localhost:5000/api/v1/payments/all/`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        })
            .then(response => {
                if (response.data.success)
                    setPayments(response.data.payments);
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar("Something went wrong with payments", { variant: 'error' });
            });

    }, [adminToken]);


    const handleMarkAsPaid = (paymentId, status) => {

        if(status === "Paid")
            return;

        if (!window.confirm("You are marking this payment as 'Paid'... Are you sure you want to continue? (Note: You can't undo it later)"))
            return;

        axios.put(`http://localhost:5000/api/v1/payments/markPaid/`, { paymentId }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        })
            .then(response => {
                if (response.data.success){
                    setPayments(prev => {
                        return prev.map((payment)=>{
                            if(payment._id === paymentId)
                                payment.status = "Paid";
                            return payment;
                        })
                    })
                    enqueueSnackbar("Payment Status Updated!", { variant: 'success' });
                }
                    
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar("Something went wrong with payments", { variant: 'error' });
            });

    }


    const paymentElems = payments.length > 0 ? payments
        .filter(payment => {
            return (itemTypeFilter === "- Item Type -" || payment.itemType === itemTypeFilter) &&
                (statusTypeFilter === "- Status -" || payment.status === statusTypeFilter) &&
                (paymentToFilter === "- Payment To -" || payment.to === paymentToFilter);
        })
        .map((item, index) => (
            <div key={index}>
                <div className="requestRow row">
                    <p className="buyerField field">{item?.buyerId?.username}</p>
                    <Link to={`/ftzy-admin/sellers/${item?.sellerId?._id}`} className="sellerField field">{item?.sellerId?.userId?.username + " >"}</Link>
                    <p className="priceField field">${item?.amount.toFixed(2)}</p>
                    <p className="toField field">{item?.to}</p>
                    <p className="statusField field">{item?.status}</p>
                    <p className="dateField field">{new Date(item?.createdAt).toLocaleDateString()}</p>
                    <div className="actionsField field">
                        <FaEye className="icon" onClick={() => setShowDetailsModal(item)} />
                        <FaCheck className={`markAsPaid ${item.status === "Paid" && "paid"}`} onClick={() => handleMarkAsPaid(item?._id, item?.status)} />
                    </div>
                </div>
                {payments.length > 1 && payments.length - 1 !== index && <div className="horizontalLine"></div>}
            </div>
        ))
        : <div className="row">Nothing to show here...</div>;

    return (
        <div className='adminPaymentsDiv'>
            <div className="adminPaymentsContent">

                <div className="tableDiv">
                    <div className="tableContent">
                        <div className="upper">
                            <h2 className="secondaryHeading">
                                Your <span>Payments</span>
                                <span className="totalRows">- {payments.length}</span>
                            </h2>
                            <div className="upperRight">
                                <Dropdown options={["- Item Type -", "Product", "Service"]} onSelect={setItemTypeFilter} selected={itemTypeFilter} />
                                <Dropdown options={["- Status -", "Pending", "Paid"]} onSelect={setStatusTypeFilter} selected={statusTypeFilter} />
                                <Dropdown options={["- Payment To -", "Buyer", "Seller"]} onSelect={setPaymentToFilter} selected={paymentToFilter} />
                            </div>
                        </div>
                        <div className="header">
                            <p>Buyer</p>
                            <p>Seller</p>
                            <p>Amount</p>
                            <p>Payment To</p>
                            <p>Status</p>
                            <p>Date</p>
                            <p>Actions</p>
                        </div>
                        <div className="rows">{paymentElems}</div>
                    </div>
                </div>

            </div>

            {showDetailsModal && (
                <div className="popupDiv detailsModelDiv">
                    <div className="popupContent">

                        <div className="details form">
                            <h2 className='secondaryHeading'><span>#{showDetailsModal._id}</span></h2>
                            <div className="horizontalLine"></div>
                            <div className='row'>
                                <div>Buyer</div>
                                <div className="fw600">{showDetailsModal.buyerId.username}</div>
                            </div>
                            <div className='row'>
                                <div>Seller</div>
                                <div className="fw600">{showDetailsModal.sellerId.userId.username}</div>
                            </div>
                            <div className='row'>
                                <div>Payment To</div>
                                <div className="fw600">{showDetailsModal.to}</div>
                            </div>
                            <div className='row'>
                                <div>Amount</div>
                                <div className="fw600">${showDetailsModal.amount}</div>
                            </div>
                            <div className='row'>
                                <div>Item Type</div>
                                <div className="fw600">{showDetailsModal.itemType}</div>
                            </div>
                            <div className='row'>
                                <div>Status</div>
                                <div className="fw600">{showDetailsModal.status}</div>
                            </div>
                            <div className='row'>
                                <div>Date</div>
                                <div className="fw600">{new Date(showDetailsModal.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="buttonsDiv">
                            <button className="secondaryBtn" type="button" onClick={() => setShowDetailsModal(null)}>Close</button>
                        </div>
                        <div className="popupCloseBtn">
                            <IoIosCloseCircleOutline className="icon" onClick={() => setShowDetailsModal(null)} />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminPayments;
