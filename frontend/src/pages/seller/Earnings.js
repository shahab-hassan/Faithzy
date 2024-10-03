import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from "../../utils/AuthContext"
import { enqueueSnackbar } from 'notistack';
import { BsStripe } from "react-icons/bs";
import { formatDate } from '../../utils/utilFuncs';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { SiPayoneer } from "react-icons/si";
import { Switch } from '@mui/material';
import { hostNameBack } from '../../utils/constants';

const SellerEarnings = () => {

    const [loading, setLoading] = useState(false);
    const [showWithdrawalModel, setShowWithdrawalModel] = useState(false);
    const [showAddPayoneerModel, setShowAddPayoneerModel] = useState(false);
    const [payoneerAccountId, setPayoneerAccountId] = useState("");
    const [stripeActive, setStripeActive] = useState(false);
    const [payoneerActive, setPayoneerActive] = useState(false);
    const { user, fetchUserData } = useContext(AuthContext);

    const [history, setHistory] = useState([]);
    const [earnings, setEarnings] = useState({
        availableBalance: 0,
        totalEarnings: 0,
        paidBalance: 0,
        requestedForWithdrawal: 0,
        productsSold: 0,
        servicesDone: 0,
    });

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (localStorage.getItem('requestSubmitted')) {
            enqueueSnackbar("Withdrawal request submitted!", { variant: "success" })
            localStorage.removeItem('requestSubmitted');
        }
    }, []);


    useEffect(() => {

        if (!user) return;

        setStripeActive(user?.sellerId?.activePaymentMethod === "Stripe");
        setPayoneerActive(user?.sellerId?.activePaymentMethod === "Payoneer");

        if (user?.sellerId?.payoneerAccountId) setPayoneerAccountId(user?.sellerId?.payoneerAccountId);

        axios.get(`${hostNameBack}/api/v1/payments/seller/${user?.sellerId?._id}`, {
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

        axios.get(`${hostNameBack}/api/v1/payments/seller/${user?.sellerId?._id}/earnings`, {
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
            const response = await axios.post(`${hostNameBack}/api/v1/payments/seller/connect-stripe`, { sellerId: user?.sellerId?._id }, { headers: { Authorization: `Bearer ${token}` } });
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
            const response = await axios.post(`${hostNameBack}/api/v1/payments/seller/request-withdrawal`, { userId: user?._id, sellerId: user?.sellerId?._id, amount: earnings.availableBalance, stripeActive }, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                localStorage.setItem('requestSubmitted', 'true');
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Something went wrong!", { variant: "error" })
        }
    };


    const addPayoneer = async () => {

        if (!payoneerAccountId) {
            enqueueSnackbar("Please enter Account ID!", { variant: "error" });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${hostNameBack}/api/v1/payments/seller/add-payoneer`,
                { sellerId: user?.sellerId?._id, payoneerAccountId },
                { headers: { Authorization: `Bearer ${token}` } });

            if (response.data.success) {
                enqueueSnackbar("Payoneer account added successfully!", { variant: "success" });
                setShowAddPayoneerModel(false);
                await fetchUserData();
                setPayoneerActive(true);
                setStripeActive(false);
            }

            setLoading(false);
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Something went wrong!", { variant: "error" });
            setLoading(false);
        }
    };


    const handleToggle = (method) => {
        if (window.confirm(`Are you sure you want to turn off ${method}?`)) {
            updateActivePaymentMethod(null);
        }
    };

    const handleStripeToggle = () => {
        if (stripeActive) {
            handleToggle("Stripe");
        } else {
            updateActivePaymentMethod("Stripe");
        }
    };
    const handlePayoneerToggle = () => {
        if (payoneerActive) {
            handleToggle("Payoneer");
        } else {
            updateActivePaymentMethod("Payoneer");
        }
    };
    const updateActivePaymentMethod = async (method) => {
        try {
            const response = await axios.post(`${hostNameBack}/api/v1/payments/seller/update-active-payment-method`,
                { sellerId: user?.sellerId?._id, activePaymentMethod: method },
                { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                enqueueSnackbar(`Active payment method updated!`, { variant: "success" });
                setStripeActive(method === "Stripe");
                setPayoneerActive(method === "Payoneer");
                await fetchUserData();
            }
        } catch (error) {
            enqueueSnackbar("Failed to update active payment method", { variant: "error" });
        }
    };


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

                    <div className='sellerPaymentMethodsDiv'>
                        <h2 className='secondaryHeading'><span>Payment</span> Methods</h2>
                        <div className="paymentMethods">
                            <div className="method"><BsStripe className='methodLogo' /><span>Stripe</span></div>
                            <div className='buttonsDiv'>
                                <Switch
                                    checked={stripeActive}
                                    onChange={handleStripeToggle}
                                    color="primary"
                                    inputProps={{ 'aria-label': 'Stripe switch' }}
                                    disabled={!user?.sellerId?.stripeAccountId}
                                />
                                <button className='secondaryBtn' onClick={connectStripe} disabled={loading || user?.sellerId?.stripeAccountId}>
                                    {user?.sellerId?.stripeAccountId ? "Connected" : loading ? "Loading..." : "Connect"}
                                </button>
                            </div>
                        </div>
                        <div className="paymentMethods">
                            <div className="method"><SiPayoneer className='methodLogo' /><span>Payoneer</span></div>
                            <div className='buttonsDiv'>
                                <Switch
                                    checked={payoneerActive}
                                    onChange={handlePayoneerToggle}
                                    color="primary"
                                    inputProps={{ 'aria-label': 'Payoneer switch' }}
                                    disabled={!user?.sellerId?.payoneerAccountId}
                                />
                                <button className="secondaryBtn" onClick={() => setShowAddPayoneerModel(true)} disabled={loading}>
                                    {user?.sellerId?.payoneerAccountId ? "Edit Details" : "Add Payoneer"}
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="earningsOverview">
                        <div className="overviewBox">
                            <h2 className="secondaryHeading">Available Balance</h2>
                            <div className="value">${earnings.availableBalance.toFixed(2)}</div>
                            <button className="secondaryBtn" disabled={Math.floor(earnings.availableBalance) === 0} onClick={() => setShowWithdrawalModel(true)}>Withdraw</button>
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
                        <section className="section">
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
                                    <p>Order Type</p>
                                    <p>Amount</p>
                                </div>
                                <div className="rows">{paymentElems}</div>
                            </div>
                        </section>
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
                                {(stripeActive && user?.sellerId?.stripeAccountId) ? earnings.availableBalance >= 30 ?
                                    <div className='form'><div>Active Method: <span className='fw500'>Stripe</span></div><p>You are about to withdraw ${earnings.availableBalance}. The amount will be transferred to your connected Stripe account. You will receive your funds within a few days.</p></div>
                                    :
                                    <p>Your available balance is less than $30. You need at least $30 to request a withdrawal.</p>
                                    :
                                    (payoneerActive && user?.sellerId?.payoneerAccountId) ? earnings.availableBalance >= 30 ?
                                        <div className='form'><div>Active Method: <span className='fw500'>Payoneer</span></div><p>You are about to withdraw ${earnings.availableBalance}. The amount will be transferred to your connected Payoneer account. You will receive your funds within a few days.</p></div>
                                        :
                                        <p>Your available balance is less than $30. You need at least $30 to request a withdrawal.</p> :
                                        <p>It looks like you haven't connected/active a payment method. Please add Payment Method to request a withdrawal.</p>
                                }
                            </div>

                            <div className="buttonsDiv">
                                <button className="primaryBtn" type="button" disabled={(!user?.sellerId?.stripeAccountId && !user?.sellerId?.payoneerAccountId) || (earnings.availableBalance <= 30) || (!stripeActive && !payoneerActive)} onClick={requestedWithdrawal}>Withdraw ${earnings.availableBalance}</button>
                                <button className="secondaryBtn" type="button" onClick={() => setShowWithdrawalModel(false)}>Close</button>
                            </div>
                        </div>

                    </div>
                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className="icon" onClick={() => setShowWithdrawalModel(false)} />
                    </div>
                </div>
            )}


            {showAddPayoneerModel && (
                <div className="popupDiv">
                    <div className="popupContent">

                        <div className="form">

                            <h2 className="secondaryHeading">Add <span>Payoneer</span></h2>
                            <div className="horizontalLine"></div>

                            <div className="inputDiv">
                                <label>Payoneer Account ID</label>
                                <input
                                    type="text"
                                    value={payoneerAccountId}
                                    onChange={(e) => setPayoneerAccountId(e.target.value)}
                                    className='inputField'
                                    placeholder="Enter your Payoneer Account ID"
                                />
                            </div>
                            <p>Make sure you enter correct Account ID, otherwise you may not receive your funds!</p>

                            <div className="buttonsDiv">
                                <button className="primaryBtn" type="button" onClick={addPayoneer}>Save</button>
                                <button className="secondaryBtn" type="button" onClick={() => setShowAddPayoneerModel(false)}>Close</button>
                            </div>
                        </div>

                    </div>
                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className="icon" onClick={() => setShowAddPayoneerModel(false)} />
                    </div>
                </div>
            )}


        </div>
    );
};

export default SellerEarnings;
