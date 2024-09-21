import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from "../../utils/AuthContext"
import { enqueueSnackbar } from 'notistack';
import { BsStripe } from "react-icons/bs";
// import Dropdown from '../../components/common/Dropdown';
import { formatDate } from '../../utils/utilFuncs';
import { IoIosCloseCircleOutline } from 'react-icons/io';

const SellerEarnings = () => {

    // const [stripeUrl, setStripeUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [showWithdrawalModel, setShowWithdrawalModel] = useState(false);
    const { user } = useContext(AuthContext);

    const [history, setHistory] = useState([]);
    const [earnings, setEarnings] = useState({
        availableBalance: 0,
        totalEarnings: 0,
        paidBalance: 0,
        requestedForWithdrawal: 0,
        productsSold: 0,
        servicesDone: 0,
    });

    // const [itemTypeFilter, setItemTypeFilter] = useState("- Item Type -");
    // const [statusTypeFilter, setStatusTypeFilter] = useState("- Status -");

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (localStorage.getItem('requestSubmitted')) {
            enqueueSnackbar("Withdrawal request submitted!", { variant: "success" })
            localStorage.removeItem('requestSubmitted');
        }
    }, []);


    useEffect(() => {
        if (!user) return;
        axios.get(`http://localhost:5000/api/v1/payments/seller/${user?.sellerId?._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                if (response.data.success)
                    setHistory(response.data.history);
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
                    setEarnings(response.data.earnings);
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar("Something went wrong with earnings", { variant: 'error' });
            });

    }, [user, token]);


    const connectStripe = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/v1/payments/seller/connect-stripe', { sellerId: user?.sellerId?._id }, { headers: { Authorization: `Bearer ${token}` } });
            // setStripeUrl(response.data.url);
            window.location.href = response.data.url;
            setLoading(false);
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Something went wrong!", { variant: "error" })
            setLoading(false);
        }
    };


    const requestedWithdrawal = async () => {
        setShowWithdrawalModel(false);
        try {
            const response = await axios.post('http://localhost:5000/api/v1/payments/seller/request-withdrawal', { userId: user?._id, sellerId: user?.sellerId?._id, amount: earnings.availableBalance }, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                localStorage.setItem('requestSubmitted', 'true');
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Something went wrong!", { variant: "error" })
        }
    };


    // .filter(payment => {
    //     return (itemTypeFilter === "- Item Type -" || payment.itemType === itemTypeFilter) &&
    //         (statusTypeFilter === "- Status -" || payment.status === statusTypeFilter);
    // })
    const paymentElems = history.length > 0 ? history.map((item, index) => (
            <div key={index}>
                <div className="requestRow row">
                    <div className="titleField field">
                        <p className="title">{item?.description}</p>
                    </div>
                    <p className="dateField field">{formatDate(item?.date)}</p>
                    <p className="buyerField field">{item?.buyerUsername || "-"}</p>
                    <p className="typeField field">{item?.itemType || "-"}</p>
                    <p className="priceField field">${item?.amount}</p>
                </div>
                {history.length > 1 && history.length - 1 !== index && <div className="horizontalLine"></div>}
            </div>
        ))
        : <div className="row">Nothing to show here...</div>;



    return (
        <div className='earningsDiv'>
            <section className='section'>
                <div className="earningsContent">

                    <div>
                        <h2 className='secondaryHeading'><span>Payment</span> Methods</h2>
                        <div className="paymentMethods">
                            <div className="method"><BsStripe />Stripe</div>
                            <button className='secondaryBtn' onClick={connectStripe} disabled={loading || user?.sellerId?.stripeAccountId}>{user?.sellerId?.stripeAccountId ? "Connected" : loading ? "Loading..." : "Connect"}</button>
                        </div>
                    </div>

                    <div className="earningsOverview">
                        <div className="overviewBox">
                            <h2 className="secondaryHeading">Available Balance</h2>
                            <div className="value">${earnings.availableBalance.toFixed(2)}</div>
                            <button className="secondaryBtn" disabled={earnings.availableBalance === 0} onClick={() => setShowWithdrawalModel(true)}>Withdraw</button>
                        </div>
                        <div className="overviewBox">
                            <h2 className="secondaryHeading">Total Earnings</h2>
                            <div className="value">${earnings.totalEarnings.toFixed(2)}</div>
                        </div>
                        <div className="overviewBox">
                            <h2 className="secondaryHeading">Paid Balance</h2>
                            <div className="value">${earnings.paidBalance.toFixed(2)}</div>
                        </div>
                        <div className="overviewBox">
                            <h2 className="secondaryHeading">Requested for Withdrawal</h2>
                            <div className="value">${earnings.requestedForWithdrawal.toFixed(2)}</div>
                        </div>
                        {/* <div className="overviewBox">
                            <h2 className="secondaryHeading">Earned in {new Date().toLocaleString('default', { month: 'long' })}</h2>
                            <div className="value">${earnings.earningsInCurrentMonth.toFixed(2)}</div>
                        </div> */}
                        <div className="overviewBox">
                            <h2 className="secondaryHeading">Products Sold</h2>
                            <div className="value">{(earnings.productsSold < 10 && "0") + earnings.productsSold}</div>
                        </div>
                        <div className="overviewBox">
                            <h2 className="secondaryHeading">Services Done</h2>
                            <div className="value">{(earnings.servicesDone < 10 && "0") + earnings.servicesDone}</div>
                        </div>
                    </div>

                    <div className="tableDiv">
                        <div className="tableContent">
                            <div className="upper">
                                <h2 className="secondaryHeading">Payments <span>History</span></h2>
                                {/* <div className="upperRight">
                                    <Dropdown options={["- Item Type -", "Product", "Service"]} onSelect={setItemTypeFilter} selected={itemTypeFilter} />
                                    <Dropdown options={["- Status -", "Pending", "Paid"]} onSelect={setStatusTypeFilter} selected={statusTypeFilter} />
                                </div> */}
                            </div>
                            <div className="header">
                                <p className="title">Activity</p>
                                <p>Date</p>
                                <p>Buyer</p>
                                <p>Item Type</p>
                                <p>Amount</p>
                            </div>
                            <div className="rows">{paymentElems}</div>
                        </div>
                    </div>

                </div>
            </section>


            {showWithdrawalModel && (
                <div className="popupDiv">
                    <div className="popupContent">

                        <div className="form">

                            <h2 className="secondaryHeading"><span>Withdraw</span> Payment</h2>
                            <div className="horizontalLine"></div>

                            <div className="description">
                                {user?.sellerId?.stripeAccountId ? earnings.availableBalance >= 30 ?
                                    <p>You are about to withdraw ${earnings.availableBalance}. The amount will be transferred to your connected Stripe account. You will receive your funds within a few days.</p>
                                    :
                                    <p>Your available balance is less than $30. You need at least $30 to request a withdrawal.</p>
                                    :
                                    <p>It looks like you haven't connected a payment method yet. Please connect your Stripe account to request a withdrawal.</p>
                                }
                            </div>

                            <div className="buttonsDiv">
                                <button className="primaryBtn" type="button" disabled={!user?.sellerId?.stripeAccountId || earnings.availableBalance <= 30} onClick={requestedWithdrawal}>Withdraw ${earnings.availableBalance}</button>
                                <button className="secondaryBtn" type="button" onClick={() => setShowWithdrawalModel(false)}>Close</button>
                            </div>
                        </div>

                    </div>
                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className="icon" onClick={() => setShowWithdrawalModel(false)} />
                    </div>
                </div>
            )}


        </div>
    );
};

export default SellerEarnings;
