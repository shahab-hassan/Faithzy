import React, { useContext, useState, useEffect } from 'react'
import axios from "axios"
import { enqueueSnackbar } from 'notistack';
import { AuthContext } from "../../utils/AuthContext"
import Dropdown from '../../components/common/Dropdown';

function Earnings() {
    const [payments, setPayments] = useState([]);
    const { user } = useContext(AuthContext);
    const [earnings, setEarnings] = useState({
        totalEarnings: 0,
        pendingBalance: 0,
        earningsInCurrentMonth: 0,
        productsSold: 0,
        servicesDone: 0,
    });
    const [itemTypeFilter, setItemTypeFilter] = useState("- Item Type -");
    const [statusTypeFilter, setStatusTypeFilter] = useState("- Status -");

    useEffect(() => {

        if(!user) return;

        const token = localStorage.getItem('token');

        axios.get(`http://localhost:5000/api/v1/payments/seller/${user?.sellerId?._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                if (response.data.success)
                    setPayments(response.data.payments);
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar("Something went wrong with payments", { variant: 'error' });
            });

        axios.get(`http://localhost:5000/api/v1/payments/seller/${user?.sellerId?._id}/earnings`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                if (response.data.success)
                    setEarnings(response.data);
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar("Something went wrong with earnings", { variant: 'error' });
            });

    }, [user]);

    const paymentElems = payments.length > 0 ? payments
        .filter(payment => {
            return (itemTypeFilter === "- Item Type -" || payment.itemType === itemTypeFilter) &&
                (statusTypeFilter === "- Status -" || payment.status === statusTypeFilter);
        })
        .map((item, index) => (
            <div key={index}>
                <div className="requestRow row">
                    <div className="titleField field">
                        <p className="title">#{item._id}</p>
                    </div>
                    <p className="buyerField field">{item?.buyerId?.username}</p>
                    <p className="priceField field">${item?.amount.toFixed(2)}</p>
                    <p className="typeField field">{item?.itemType}</p>
                    <p className="statusField field">{item?.status}</p>
                    <p className="dateField field">{new Date(item?.createdAt).toLocaleDateString()}</p>
                </div>
                {payments.length > 1 && payments.length - 1 !== index && <div className="horizontalLine"></div>}
            </div>
        ))
        : <div className="row">Nothing to show here...</div>;

    return (
        <div className='earningsDiv'>
            <section className='section'>
                <div className="earningsContent">

                    <div className="earningsOverview">
                        <div className="overviewBox">
                            <h2 className="secondaryHeading">Total Earnings</h2>
                            <div className="value">${earnings.totalEarnings.toFixed(2)}</div>
                        </div>
                        <div className="overviewBox">
                            <h2 className="secondaryHeading">Pending Balance</h2>
                            <div className="value">${earnings.pendingBalance.toFixed(2)}</div>
                        </div>
                        <div className="overviewBox">
                            <h2 className="secondaryHeading">Earned in {new Date().toLocaleString('default', { month: 'long' })}</h2>
                            <div className="value">${earnings.earningsInCurrentMonth.toFixed(2)}</div>
                        </div>
                        <div className="overviewBox">
                            <h2 className="secondaryHeading">Products Sold</h2>
                            <div className="value">{(earnings.productsSold<10 && "0") + earnings.productsSold}</div>
                        </div>
                        <div className="overviewBox">
                            <h2 className="secondaryHeading">Services Done</h2>
                            <div className="value">{(earnings.servicesDone<10 && "0") + earnings.servicesDone}</div>
                        </div>
                    </div>

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
                                </div>
                            </div>
                            <div className="header">
                                <p className="title">Payment ID</p>
                                <p>Buyer</p>
                                <p>Amount</p>
                                <p>Item Type</p>
                                <p>Status</p>
                                <p>Date</p>
                            </div>
                            <div className="rows">{paymentElems}</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Earnings;
