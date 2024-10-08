import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { enqueueSnackbar, useSnackbar } from 'notistack';
import { BsStripe } from "react-icons/bs";
import { IoIosCloseCircleOutline } from 'react-icons/io';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { formatDate } from '../../utils/utilFuncs';
import { Link } from 'react-router-dom';
import { FaEye } from "react-icons/fa";
import { CSVLink } from 'react-csv';
import { SiPayoneer } from 'react-icons/si';
import { hostNameBack } from '../../utils/constants';


const AdminPayments = () => {

    const [stripePublishableKey, setStripePublishableKey] = useState('');
    const [stripeSecretKey, setStripeSecretKey] = useState('');
    const [showAddStripeModel, setShowAddStripeModel] = useState(false);
    const [payoneerAccountId, setPayoneerAccountId] = useState('');
    const [payoneerClientId, setPayoneerClientId] = useState('');
    const [payoneerClientSecret, setPayoneerClientSecret] = useState('');
    const [showAddPayoneerModel, setShowAddPayoneerModel] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const token = localStorage.getItem("adminToken");
    const [withdrawalRequests, setWithdrawalRequests] = useState([]);
    const [paymentDate, setPaymentDate] = useState('');
    const [comment, setComment] = useState('');
    const [showMarkPaidModel, setShowMarkPaidModel] = useState(null);
    const [showReleaseModel, setShowReleaseModel] = useState(null);
    const [releaseLoading, setReleaseLoading] = useState(false);

    const [selectedRequests, setSelectedRequests] = useState([]);
    const [value, setValue] = React.useState(0);

    const today = new Date().toISOString().split('T')[0];

    const handleChange = (event, newValue) => {
        setValue(newValue);
        setSelectedRequests([]);
    };

    useEffect(() => {

        const fetchStripeKey = async () => {
            try {
                const response = await axios.get(`${hostNameBack}/api/v1/settings/admin/keys`, { headers: { Authorization: `Admin ${token}` } });
                if (response.data.success) {
                    setStripePublishableKey(response.data.stripePublishableKey)
                    setStripeSecretKey(response.data.stripeSecretKey)
                    setPayoneerAccountId(response.data.payoneerAccountId);
                    setPayoneerClientId(response.data.payoneerClientId);
                    setPayoneerClientSecret(response.data.payoneerClientSecret);
                }
            } catch (error) {
                console.error("Error fetching Stripe keys:", error);
            }
        };

        const fetchWithdrawalRequests = async (type) => {
            try {
                const response = await axios.get(`${hostNameBack}/api/v1/payments/withdrawal-requests?type=${type}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    setWithdrawalRequests(response.data.withdrawalRequests);
                }
            } catch (error) {
                console.error("Error fetching withdrawal requests:", error);
            }
        };

        if (value === 0) fetchWithdrawalRequests("pendingPayments");
        if (value === 1) fetchWithdrawalRequests("completedPayments");
        if (value === 2) fetchWithdrawalRequests("pendingRefunds");
        if (value === 3) fetchWithdrawalRequests("completedRefunds");
        if (value === 4) fetchWithdrawalRequests("pendingPayoneerPayments");
        if (value === 5) fetchWithdrawalRequests("completedPayoneerPayments");
        fetchStripeKey();

    }, [token, value]);


    const handleStripeDetailsSubmit = async (e) => {
        e.preventDefault();

        if (!stripePublishableKey || !stripeSecretKey) {
            enqueueSnackbar('Please fill in both fields', { variant: 'error' });
            return;
        }

        try {
            const response = await axios.post(`${hostNameBack}/api/v1/settings/admin/stripe_keys`,
                { stripePublishableKey, stripeSecretKey },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success){
                enqueueSnackbar('Stripe account details saved successfully!', { variant: 'success' });
                setShowAddStripeModel(false);
            }

        } catch (error) {
            enqueueSnackbar('Failed to save Stripe account details', { variant: 'error' });
            console.error(error);
        }
    };
    
    const handlePayoneerDetailsSubmit = async (e) => {
        e.preventDefault();
    
        if (!payoneerAccountId || !payoneerClientId || !payoneerClientSecret) {
            enqueueSnackbar('All fields are Required!', { variant: 'error' });
            return;
        }
    
        try {
            const response = await axios.post(`${hostNameBack}/api/v1/settings/admin/payoneer_keys`,
                { payoneerAccountId, payoneerClientId, payoneerClientSecret },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success){
                enqueueSnackbar('Payoneer account details saved successfully!', { variant: 'success' });
                setShowAddPayoneerModel(false);
            }
        } catch (error) {
            enqueueSnackbar('Failed to save Payoneer account details', { variant: 'error' });
            console.error(error);
        }
    };

    const handleSelectRequest = (requestId) => {
        setSelectedRequests(prev =>
            prev.includes(requestId)
                ? prev.filter(id => id !== requestId)
                : [...prev, requestId]
        );
    };

    const handleSelectAll = () => {
        if (selectedRequests.length === withdrawalRequests.length)
            setSelectedRequests([]);
        else {
            const allRequestIds = withdrawalRequests.map(request => request._id);
            setSelectedRequests(allRequestIds);
        }
    };

    const markPaidManually = async () => {

        if (!paymentDate || !comment) {
            enqueueSnackbar('Please provide payment date and comment', { variant: 'error' });
            return;
        }

        try {
            const response = await axios.put(`${hostNameBack}/api/v1/payments/mark-paid`, {
                requestIds: selectedRequests,
                paidOn: paymentDate,
                comment,
                isRelease: showMarkPaidModel === "Release" ? true : false
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                enqueueSnackbar(`${selectedRequests.length} payment${selectedRequests.length > 1 ? "s" : ""} marked as Paid!`, { variant: 'success' });
                setWithdrawalRequests(prev => prev.filter(req => !selectedRequests.includes(req._id)));
                setSelectedRequests([]);
                setShowMarkPaidModel(null);
            }

        } catch (error) {
            console.error(error);
            enqueueSnackbar('Something went wrong!', { variant: 'error' });
        }
    }

    const releasePayments = async () => {

        setReleaseLoading(true);

        try {
            const response = await axios.put(`${hostNameBack}/api/v1/payments/release-payment` + (value === 4 && "/payoneer"), {
                requestIds: selectedRequests
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                enqueueSnackbar(`${selectedRequests.length} payment${selectedRequests.length > 1 ? "s" : ""} released successfully!`, { variant: 'success' });
                setWithdrawalRequests(prev => prev.filter(req => !selectedRequests.includes(req._id)));
                setSelectedRequests([]);
                setShowReleaseModel(false);
            }
            setReleaseLoading(false);
        } catch (error) {
            console.error(error);
            enqueueSnackbar(error.reponse?.data?.error || 'Something went wrong!', { variant: 'error' });
            setReleaseLoading(false);
        }
    }

    const refundPayments = async () => {

        setReleaseLoading(true);

        try {
            const response = await axios.put(`${hostNameBack}/api/v1/payments/refund-payment`, {
                requestIds: selectedRequests
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                enqueueSnackbar(`${selectedRequests.length} payment${selectedRequests.length > 1 ? "s" : ""} refunded successfully!`, { variant: 'success' });
                setWithdrawalRequests(prev => prev.filter(req => !selectedRequests.includes(req._id)));
                setSelectedRequests([]);
                setShowReleaseModel(null);
            }
            setReleaseLoading(false);
        } catch (error) {
            console.error(error);
            enqueueSnackbar(error.response?.data?.error || 'Something went wrong!', { variant: 'error' });
            setReleaseLoading(false);
        }
    }

    const moveToPending = async (type) => {

        try {
            const response = await axios.put(`${hostNameBack}/api/v1/payments/move-to-pending`, { requestIds: selectedRequests, isRefund: type === "Refund" ? true : false }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                enqueueSnackbar(`${selectedRequests.length} payment${selectedRequests.length > 1 ? "s" : ""} moved to Pending Tab!`, { variant: 'success' });
                setWithdrawalRequests(prev => prev.filter(req => !selectedRequests.includes(req._id)));
                setSelectedRequests([]);
            }

        } catch (error) {
            console.error(error);
            enqueueSnackbar('Something went wrong!', { variant: 'error' });
        }
    }

    const calculateTotalAmount = () => {
        return withdrawalRequests
            .filter(req => selectedRequests.includes(req._id))
            .reduce((total, req) => total + req.amount, 0);
    };

    return (
        <div className="adminPaymentsDiv">
            <div className="adminPaymentsContent">

                <div className='adminPaymentMethodsDiv'>
                    <h2 className='secondaryHeading'><span>Payment</span> Methods</h2>
                    <div className="paymentMethods">
                        <div className="method"><BsStripe />Stripe</div>
                        <button className="secondaryBtn" onClick={() => setShowAddStripeModel(true)}>Manage</button>
                    </div>
                    <div className="paymentMethods">
                        <div className="method"><SiPayoneer />Payoneer</div>
                        <button className="secondaryBtn" onClick={() => setShowAddPayoneerModel(true)}>Manage</button>
                    </div>
                </div>

                <div className="paymentsDetails">
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                <Tab sx={{ fontSize: "12px" }} label="Pending Payments" {...a11yProps(0)} />
                                <Tab sx={{ fontSize: "12px" }} label="Completed Payments" {...a11yProps(1)} />
                                <Tab sx={{ fontSize: "12px" }} label="Pending Refunds" {...a11yProps(2)} />
                                <Tab sx={{ fontSize: "12px" }} label="Completed Refunds" {...a11yProps(3)} />
                                <Tab sx={{ fontSize: "12px" }} label="Pending Payoneer Payments" {...a11yProps(4)} />
                                <Tab sx={{ fontSize: "12px" }} label="Completed Payoneer Payments" {...a11yProps(5)} />
                            </Tabs>
                        </Box>
                        <CustomTabPanel value={value} index={0}>
                            <PendingPayments
                                requests={withdrawalRequests}
                                selectedRequests={selectedRequests}
                                handleSelectRequest={handleSelectRequest}
                                handleSelectAll={handleSelectAll}
                                setShowMarkPaidModel={setShowMarkPaidModel}
                                setShowReleaseModel={setShowReleaseModel}
                                isStripe={true}
                            />
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={1}>
                            <CompletedPayments
                                requests={withdrawalRequests}
                                selectedRequests={selectedRequests}
                                handleSelectRequest={handleSelectRequest}
                                handleSelectAll={handleSelectAll}
                                moveToPending={moveToPending}
                                isStripe={true}
                            />
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={2}>
                            <PendingRefunds
                                requests={withdrawalRequests}
                                selectedRequests={selectedRequests}
                                handleSelectRequest={handleSelectRequest}
                                handleSelectAll={handleSelectAll}
                                setShowMarkPaidModel={setShowMarkPaidModel}
                                setShowReleaseModel={setShowReleaseModel}
                            />
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={3}>
                            <CompletedRefunds
                                requests={withdrawalRequests}
                                selectedRequests={selectedRequests}
                                handleSelectRequest={handleSelectRequest}
                                handleSelectAll={handleSelectAll}
                                moveToPending={moveToPending}
                            />
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={4}>
                            <PendingPayments
                                requests={withdrawalRequests}
                                selectedRequests={selectedRequests}
                                handleSelectRequest={handleSelectRequest}
                                handleSelectAll={handleSelectAll}
                                setShowMarkPaidModel={setShowMarkPaidModel}
                                setShowReleaseModel={setShowReleaseModel}
                                isStripe={false}
                            />
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={5}>
                            <CompletedPayments
                                requests={withdrawalRequests}
                                selectedRequests={selectedRequests}
                                handleSelectRequest={handleSelectRequest}
                                handleSelectAll={handleSelectAll}
                                moveToPending={moveToPending}
                                isStripe={false}
                            />
                        </CustomTabPanel>
                    </Box>
                </div>

            </div>

            {showAddStripeModel && (
                <div className="popupDiv">

                    <div className="popupContent">

                        <div className='form'>
                            <h2 className="secondaryHeading">Add <span>Stripe</span> Details</h2>
                            <div className="horizontalLine"></div>
                            <div className='inputDiv'>
                                <label>Stripe Publishable Key <span>*</span></label>
                                <input
                                    type="text"
                                    value={stripePublishableKey}
                                    onChange={(e) => setStripePublishableKey(e.target.value)}
                                    placeholder="Enter your Stripe Publishable Key"
                                    className='inputField'
                                />
                            </div>
                            <div className='inputDiv'>
                                <label>Stripe Secret Key <span>*</span></label>
                                <input
                                    type="text"
                                    value={stripeSecretKey}
                                    onChange={(e) => setStripeSecretKey(e.target.value)}
                                    placeholder="Enter your Stripe Secret Key"
                                    className='inputField'
                                />
                            </div>
                        </div>

                        <div className="buttonsDiv" style={{ marginTop: "20px" }}>
                            <button type="submit" className='primaryBtn' onClick={handleStripeDetailsSubmit}>Save Stripe Details</button>
                            <button className="secondaryBtn" type="button" onClick={() => setShowAddStripeModel(false)}>Close</button>
                        </div>

                    </div>

                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className="icon" onClick={() => setShowAddStripeModel(false)} />
                    </div>

                </div>
            )}

            {showAddPayoneerModel && (
                <div className="popupDiv">

                    <div className="popupContent">

                        <div className='form'>
                            <h2 className="secondaryHeading">Add <span>Payoneer</span> Details</h2>
                            <div className="horizontalLine"></div>
                            <div className='inputDiv'>
                                <label>Payoneer Account ID <span>*</span></label>
                                <input
                                    type="text"
                                    value={payoneerAccountId}
                                    onChange={(e) => setPayoneerAccountId(e.target.value)}
                                    placeholder="Enter your Payoneer Account ID"
                                    className="inputField"
                                />
                            </div>
                            <div className='inputDiv'>
                                <label>Payoneer Client ID <span>*</span></label>
                                <input
                                    type="text"
                                    value={payoneerClientId}
                                    onChange={(e) => setPayoneerClientId(e.target.value)}
                                    placeholder="Enter your Payoneer Client ID"
                                    className="inputField"
                                />
                            </div>
                            <div className='inputDiv'>
                                <label>Payoneer Client Secret <span>*</span></label>
                                <input
                                    type="text"
                                    value={payoneerClientSecret}
                                    onChange={(e) => setPayoneerClientSecret(e.target.value)}
                                    placeholder="Enter your Payoneer Client Secret"
                                    className="inputField"
                                />
                            </div>
                        </div>

                        <div className="buttonsDiv" style={{ marginTop: "20px" }}>
                            <button type="submit" className='primaryBtn' onClick={handlePayoneerDetailsSubmit}>Save Payoneer Details</button>
                            <button className="secondaryBtn" type="button" onClick={() => setShowAddPayoneerModel(false)}>Close</button>
                        </div>

                    </div>

                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className="icon" onClick={() => setShowAddPayoneerModel(false)} />
                    </div>

                </div>
            )}

            {showMarkPaidModel && (
                <div className="popupDiv">

                    <div className="popupContent">

                        <div className="form">
                            <div className="inputDiv">
                                <label>Payment Date <span>*</span></label>
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className='inputField'
                                    max={today}
                                />
                            </div>
                            <div className="inputDiv">
                                <label>Comment <span>*</span></label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Enter a comment"
                                    className='inputField'
                                />
                            </div>
                        </div>

                        <div className="buttonsDiv" style={{ marginTop: "20px" }}>
                            <button className="primaryBtn" onClick={markPaidManually}>Mark Paid</button>
                            <button className="secondaryBtn" onClick={() => setShowMarkPaidModel(null)}>Cancel</button>
                        </div>

                    </div>

                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className="icon" onClick={() => setShowMarkPaidModel(null)} />
                    </div>

                </div>
            )}

            {showReleaseModel && (
                <div className="popupDiv">
                    <div className="popupContent releasePopupContent">
                        <div className="form">
                            <h2 className="secondaryHeading">Confirm <span>{showReleaseModel === "Release" ? "Releasing" : "Refunding"}</span> Payments - <span>{value === 4? "Payoneer":"Stripe"}</span></h2>
                            <div className="horizontalLine"></div>
                            <p>You are about to release a total of <strong>${calculateTotalAmount().toFixed(2)}</strong> to the {showReleaseModel === "Release" ? "sellers" : "buyers"}. Please ensure you have sufficient funds in your your linked {value === 4? "Payoneer":"Stripe"} account!</p>
                        </div>

                        <div className="buttonsDiv" style={{ marginTop: "20px" }}>
                            <button className="primaryBtn" onClick={showReleaseModel === "Release" ? releasePayments : refundPayments} disabled={releaseLoading}>{showReleaseModel === "Release" ? "Release" : "Refund"} ${calculateTotalAmount().toFixed(2)}</button>
                            <button className="secondaryBtn" onClick={() => setShowReleaseModel(null)}>Cancel</button>
                        </div>
                    </div>

                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className="icon" onClick={() => setShowReleaseModel(null)} />
                    </div>
                </div>
            )}


        </div>
    );
};

export default AdminPayments;




function PendingPayments({ requests, selectedRequests, handleSelectRequest, handleSelectAll, setShowMarkPaidModel, setShowReleaseModel, isStripe }) {

    const areAllSelected = selectedRequests.length === requests.length;
    const [showSellerDetailsModel, setShowSellerDetailsModel] = useState(false);
    const [history, setHistory] = useState([]);
    const [earnings, setEarnings] = useState({
        availableBalance: 0,
        totalEarnings: 0,
        paidBalance: 0,
        requestedForWithdrawal: 0,
        productsSold: 0,
        servicesDone: 0,
    });

    const token = localStorage.getItem("adminToken");

    const showSellerDetails = (sellerId) => {

        setShowSellerDetailsModel(true);

        axios.get(`${hostNameBack}/api/v1/payments/seller/${sellerId}`, {
            headers: { Authorization: `Admin ${token}` }
        })
            .then(response => {
                if (response.data.success)
                    setHistory(response.data.history);
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar("Something went wrong with payments", { variant: 'error' });
            });

        axios.get(`${hostNameBack}/api/v1/payments/seller/${sellerId}/earnings`, {
            headers: { Authorization: `Admin ${token}` }
        })
            .then(response => {
                if (response.data.success)
                    setEarnings(response.data.earnings);
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar("Something went wrong with earnings", { variant: 'error' });
            });
    };

    const paymentElems = requests.length > 0 ? requests.map((request, index) => (
        <div key={index}>
            <div className="requestRow row">
                <div><input
                    type="checkbox"
                    checked={selectedRequests.includes(request._id)}
                    onChange={() => handleSelectRequest(request._id)}
                />
                </div>
                <p className="dateField field">{formatDate(request?.createdAt)}</p>
                <Link to={`/ftzy-admin/sellers/${request?.userId?.sellerId}`} className="userField field">{request?.userId?.username + " >"}</Link>
                <p className="priceField field">${request?.amount}</p>
                <div className="actionsField field">
                    <FaEye className='icon' onClick={() => showSellerDetails(request?.userId?.sellerId)} />
                </div>
            </div>
            {requests.length > 1 && requests.length - 1 !== index && <div className="horizontalLine"></div>}
        </div>
    ))
        : <div className="row">Nothing to show here...</div>;

    const historyElems = history.length > 0 ? history.map((item, index) => (
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

    const csvData = requests.map(request => ({
        "Requested On": formatDate(request?.createdAt),
        "Seller": request?.userId?.username,
        "Seller ID": request?.userId?._id,
        "Amount": request?.amount
    }));

    const headers = [
        { label: "Requested On", key: "Requested On" },
        { label: "Seller", key: "Seller" },
        { label: "Seller ID", key: "Seller ID" },
        { label: "Amount", key: "Amount" }
    ];

    return (
        <div className="pendingPaymentsDiv tableDiv">
            <div className="tableContent">
                <div className="upper">
                    <h2 className="secondaryHeading"><span>Pending {isStripe ? "Stripe" : "Payoneer"}</span> Withdrawal requests from Sellers</h2>
                    <div className="upperRight">
                        <CSVLink data={csvData} headers={headers} filename={`${isStripe? "pending_payments":"pending_payoneer_payments"}.csv`} className="secondaryBtn">Export CSV</CSVLink>
                        <button className="secondaryBtn" disabled={selectedRequests.length < 1} onClick={() => setShowMarkPaidModel("Release")}>Mark Paid</button>
                        <button className="secondaryBtn" disabled={selectedRequests.length < 1} onClick={() => setShowReleaseModel("Release")}>Release Payment</button>
                    </div>
                </div>
                <div className="header">
                    {requests.length > 0 && <div><input
                        type="checkbox"
                        checked={areAllSelected}
                        onChange={() => handleSelectAll(requests, areAllSelected)}
                    />
                    </div>}
                    <p>Date</p>
                    <p>Seller</p>
                    <p>Amount</p>
                    <p>Actions</p>
                </div>
                <div className="rows">{paymentElems}</div>
            </div>
            {showSellerDetailsModel && (
                <div className="popupDiv">

                    <div className="popupContent">

                        <div className='sellerDetails form'>

                            <h2 className="secondaryHeading"><span>Seller</span> Details</h2>
                            <div className="horizontalLine"></div>

                            <div className="sellerEarnings form rowsParent">
                                <h4 className='fw600'>Earnings</h4>
                                <div className="row">
                                    <p>Total Earnings</p>
                                    <div className="fw600">${earnings.totalEarnings.toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <p>Available Balance</p>
                                    <div className="fw600">${earnings.availableBalance.toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <p>Paid Balance</p>
                                    <div className="fw600">${earnings.paidBalance.toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <p>Requested for Withdrawal</p>
                                    <div className="fw600">${earnings.requestedForWithdrawal.toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <p>Products Sold</p>
                                    <div className="fw600">{earnings.productsSold}</div>
                                </div>
                                <div className="row">
                                    <p>Services Done</p>
                                    <div className="fw600">{earnings.servicesDone}</div>
                                </div>
                            </div>

                            <div className="horizontalLine"></div>

                            <div className="sellerHistory tableDiv">
                                <h4 className='fw600'>History</h4>
                                <div className="tableContent">
                                    <div className="header">
                                        <p className="title">Activity</p>
                                        <p>Date</p>
                                        <p>Buyer</p>
                                        <p>Item Type</p>
                                        <p>Amount</p>
                                    </div>
                                    <div className="rows">{historyElems}</div>
                                </div>
                            </div>

                        </div>

                        <div className="buttonsDiv" style={{ marginTop: "20px" }}>
                            {/* <button type="submit" className='primaryBtn' onClick={handleSubmit}>Save Stripe Details</button> */}
                            <button className="secondaryBtn" type="button" onClick={() => setShowSellerDetailsModel(false)}>Close</button>
                        </div>

                    </div>

                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className="icon" onClick={() => setShowSellerDetailsModel(false)} />
                    </div>

                </div>
            )}
        </div>
    )
}


function PendingRefunds({ requests, selectedRequests, handleSelectRequest, handleSelectAll, setShowMarkPaidModel, setShowReleaseModel }) {

    const areAllSelected = selectedRequests.length === requests.length;

    // const token = localStorage.getItem("adminToken");

    const paymentElems = requests.length > 0 ? requests.map((request, index) => (
        <div key={index}>
            <div className="requestRow row">
                <div><input
                    type="checkbox"
                    checked={selectedRequests.includes(request._id)}
                    onChange={() => handleSelectRequest(request._id)}
                />
                </div>
                <p className="dateField field">{formatDate(request?.createdAt)}</p>
                <p className="userField field">{request?.userId?.username}</p>
                <p className="priceField field">${request?.amount}</p>
                {/* <div className="actionsField field">
                    <FaEye className='icon' onClick={() => showSellerDetails(request?.userId?.sellerId)} />
                </div> */}
            </div>
            {requests.length > 1 && requests.length - 1 !== index && <div className="horizontalLine"></div>}
        </div>
    ))
        : <div className="row">Nothing to show here...</div>;

    const csvData = requests.map(request => ({
        "Date": formatDate(request?.createdAt),
        "Buyer": request?.userId?.username,
        "Buyer ID": request?.userId?._id,
        "Amount": request?.amount,
    }));

    const headers = [
        { label: "Date", key: "Date" },
        { label: "Buyer", key: "Buyer" },
        { label: "Buyer ID", key: "Buyer ID" },
        { label: "Amount", key: "Amount" }
    ];

    return (
        <div className="pendingPaymentsDiv tableDiv">
            <div className="tableContent">
                <div className="upper">
                    <h2 className="secondaryHeading"><span>Pending</span> Refunds to Buyers</h2>
                    <div className="upperRight">
                        <CSVLink data={csvData} headers={headers} filename={"pending_refunds.csv"} className="secondaryBtn">Export CSV</CSVLink>
                        <button className="secondaryBtn" disabled={selectedRequests.length < 1} onClick={() => setShowMarkPaidModel("Refund")}>Mark Paid</button>
                        <button className="secondaryBtn" disabled={selectedRequests.length < 1} onClick={() => setShowReleaseModel("Refund")}>Refund Payment</button>
                    </div>
                </div>
                <div className="header">
                    {requests.length > 0 && <div><input
                        type="checkbox"
                        checked={areAllSelected}
                        onChange={() => handleSelectAll(requests, areAllSelected)}
                    />
                    </div>}
                    <p>Date</p>
                    <p>Buyer</p>
                    <p>Amount</p>
                    {/* <p>Actions</p> */}
                </div>
                <div className="rows">{paymentElems}</div>
            </div>
        </div>
    )
}



function CompletedPayments({ requests, selectedRequests, handleSelectRequest, handleSelectAll, moveToPending, isStripe }) {

    const [showPaymentDetailsModel, setShowPaymentDetailsModel] = useState(null);
    const areAllSelected = selectedRequests.length === requests.length;

    const paymentElems = requests.length > 0 ? requests.map((request, index) => (
        <div key={index}>
            <div className="requestRow row">
                <div><input
                    type="checkbox"
                    checked={selectedRequests.includes(request._id)}
                    onChange={() => handleSelectRequest(request._id)}
                />
                </div>
                <p className="dateField field">{formatDate(request?.createdAt)}</p>
                <p className="dateField field">{formatDate(request?.paidOn)}</p>
                <Link to={`/ftzy-admin/sellers/${request?.userId?.sellerId}`} className="userField field">{request?.userId?.username + " >"}</Link>
                <p className="typeField field">{request?.paymentType}</p>
                <p className="priceField field">${request?.amount}</p>
                <div className="actionsField field">
                    <FaEye className='icon' onClick={() => setShowPaymentDetailsModel(request)} />
                </div>
            </div>
            {requests.length > 1 && requests.length - 1 !== index && <div className="horizontalLine"></div>}
        </div>
    ))
        : <div className="row">Nothing to show here...</div>;

    const csvData = requests.map(request => ({
        "Requested On": formatDate(request?.createdAt),
        "Paid On": formatDate(request?.paidOn),
        "Seller": request?.userId?.username,
        "Seller ID": request?.userId?.sellerId,
        "Amount": request?.amount,
        "Payment Approach": request?.paymentType,
        "Comment": request?.comment || "-",
    }));

    const headers = [
        { label: "Requested On", key: "Requested On" },
        { label: "Paid On", key: "Paid On" },
        { label: "Seller", key: "Seller" },
        { label: "Seller ID", key: "Seller ID" },
        { label: "Amount", key: "Amount" },
        { label: "Payment Approach", key: "Payment Approach" },
        { label: "Comment", key: "Comment" },
    ];

    return (
        <div className="tableDiv">
            <div className="tableContent">
                <div className="upper">
                    <h2 className="secondaryHeading"><span>Completed {isStripe ? "Stripe" : "Payoneer"}</span> Withdrawal requests</h2>
                    <div className="upperRight">
                        <CSVLink data={csvData} headers={headers} filename={`${isStripe? "completed_payments":"completed_payoneer_payments"}.csv`} className="secondaryBtn">Export CSV</CSVLink>
                        <button className="secondaryBtn" disabled={selectedRequests.length < 1} onClick={() => moveToPending("Payment")}>Move to Pending</button>
                    </div>
                </div>
                <div className="header">
                    {requests.length > 0 && <div><input
                        type="checkbox"
                        checked={areAllSelected}
                        onChange={() => handleSelectAll(requests, areAllSelected)}
                    />
                    </div>}
                    <p>Requested On</p>
                    <p>Paid On</p>
                    <p>Seller</p>
                    <p>Payed By</p>
                    <p>Amount</p>
                    <p>Actions</p>
                </div>
                <div className="rows">{paymentElems}</div>
            </div>
            {showPaymentDetailsModel && (
                <div className="popupDiv">

                    <div className="popupContent">

                        <div className='sellerDetails form'>

                            <h2 className="secondaryHeading"><span>Payment</span> Details</h2>
                            <div className="horizontalLine"></div>

                            <div className="rowsParent">
                                <div className="row">
                                    <p>Request Made On</p>
                                    <div className="fw600">{formatDate(showPaymentDetailsModel?.createdAt)}</div>
                                </div>
                                <div className="row">
                                    <p>Payment Paid On</p>
                                    <div className="fw600">{formatDate(showPaymentDetailsModel?.paidOn)}</div>
                                </div>
                                <div className="row">
                                    <p>Requested By</p>
                                    <div className="fw600">{showPaymentDetailsModel?.userId?.username}</div>
                                </div>
                                <div className="row">
                                    <p>Amount</p>
                                    <div className="fw600">${showPaymentDetailsModel?.amount}</div>
                                </div>
                                <div className="row">
                                    <p>Payment Approach</p>
                                    <div className="fw600">{showPaymentDetailsModel?.paymentType}</div>
                                </div>
                                {showPaymentDetailsModel?.paymentType === "Manual" && <div className="row">
                                    <p>Comment</p>
                                    <div className="fw600">{showPaymentDetailsModel?.comment}</div>
                                </div>}
                            </div>

                        </div>

                        <div className="buttonsDiv" style={{ marginTop: "20px" }}>
                            <button className="secondaryBtn" type="button" onClick={() => setShowPaymentDetailsModel(null)}>Close</button>
                        </div>

                    </div>

                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className="icon" onClick={() => setShowPaymentDetailsModel(null)} />
                    </div>

                </div>
            )}
        </div>
    )
}



function CompletedRefunds({ requests, selectedRequests, handleSelectRequest, handleSelectAll, moveToPending }) {

    const [showPaymentDetailsModel, setShowPaymentDetailsModel] = useState(null);
    const areAllSelected = selectedRequests.length === requests.length;

    const paymentElems = requests.length > 0 ? requests.map((request, index) => (
        <div key={index}>
            <div className="requestRow row">
                <div><input
                    type="checkbox"
                    checked={selectedRequests.includes(request._id)}
                    onChange={() => handleSelectRequest(request._id)}
                />
                </div>
                <p className="dateField field">{formatDate(request?.createdAt)}</p>
                <p className="dateField field">{formatDate(request?.paidOn)}</p>
                <p className="userField field">{request?.userId?.username}</p>
                <p className="typeField field">{request?.paymentType}</p>
                <p className="priceField field">${request?.amount}</p>
                <div className="actionsField field">
                    <FaEye className='icon' onClick={() => setShowPaymentDetailsModel(request)} />
                </div>
            </div>
            {requests.length > 1 && requests.length - 1 !== index && <div className="horizontalLine"></div>}
        </div>
    ))
        : <div className="row">Nothing to show here...</div>;

    const csvData = requests.map(request => ({
        "Order Cancellation Date": formatDate(request?.createdAt),
        "Paid On": formatDate(request?.paidOn),
        "Buyer": request?.userId?.username,
        "Buyer ID": request?.userId?._id,
        "Amount": request?.amount,
        "Payment Approach": request?.paymentType,
        "Comment": request?.comment || "-",
    }));

    const headers = [
        { label: "Order Cancellation Date", key: "Order Cancellation Date" },
        { label: "Paid On", key: "Paid On" },
        { label: "Buyer", key: "Buyer" },
        { label: "Buyer ID", key: "Buyer ID" },
        { label: "Amount", key: "Amount" },
        { label: "Payment Approach", key: "Payment Approach" },
        { label: "Comment", key: "Comment" }
    ];

    return (
        <div className="tableDiv">
            <div className="tableContent">
                <div className="upper">
                    <h2 className="secondaryHeading"><span>Paid</span> Refunds</h2>
                    <div className="upperRight">
                        <CSVLink data={csvData} headers={headers} filename={"completed_refunds.csv"} className="secondaryBtn">Export CSV</CSVLink>
                        <button className="secondaryBtn" disabled={selectedRequests.length < 1} onClick={() => moveToPending("Refund")}>Move to Pending</button>
                        {/* <button className="secondaryBtn" disabled={selectedRequests.length < 1}>Release Payment</button> */}
                    </div>
                </div>
                <div className="header">
                    {requests.length > 0 && <div><input
                        type="checkbox"
                        checked={areAllSelected}
                        onChange={() => handleSelectAll(requests, areAllSelected)}
                    />
                    </div>}
                    <p>Date</p>
                    <p>Paid On</p>
                    <p>Buyer</p>
                    <p>Payed By</p>
                    <p>Amount</p>
                    <p>Actions</p>
                </div>
                <div className="rows">{paymentElems}</div>
            </div>
            {showPaymentDetailsModel && (
                <div className="popupDiv">

                    <div className="popupContent">

                        <div className='sellerDetails form'>

                            <h2 className="secondaryHeading"><span>Payment</span> Details</h2>
                            <div className="horizontalLine"></div>

                            <div className="rowsParent">
                                <div className="row">
                                    <p>Order Cancelled On</p>
                                    <div className="fw600">{formatDate(showPaymentDetailsModel?.createdAt)}</div>
                                </div>
                                <div className="row">
                                    <p>Refund Paid On</p>
                                    <div className="fw600">{formatDate(showPaymentDetailsModel?.paidOn)}</div>
                                </div>
                                <div className="row">
                                    <p>Buyer</p>
                                    <div className="fw600">{showPaymentDetailsModel?.userId?.username}</div>
                                </div>
                                <div className="row">
                                    <p>Amount</p>
                                    <div className="fw600">${showPaymentDetailsModel?.amount}</div>
                                </div>
                                <div className="row">
                                    <p>Payment Approach</p>
                                    <div className="fw600">{showPaymentDetailsModel?.paymentType}</div>
                                </div>
                                {showPaymentDetailsModel?.paymentType === "Manual" && <div className="row">
                                    <p>Comment</p>
                                    <div className="fw600">{showPaymentDetailsModel?.comment}</div>
                                </div>}
                            </div>

                        </div>

                        <div className="buttonsDiv" style={{ marginTop: "20px" }}>
                            <button className="secondaryBtn" type="button" onClick={() => setShowPaymentDetailsModel(null)}>Close</button>
                        </div>

                    </div>

                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className="icon" onClick={() => setShowPaymentDetailsModel(null)} />
                    </div>

                </div>
            )}
        </div>
    )
}



function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}