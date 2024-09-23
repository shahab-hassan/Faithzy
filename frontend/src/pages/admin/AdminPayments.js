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


const AdminPayments = () => {

    const [stripePublishableKey, setStripePublishableKey] = useState('');
    const [stripeSecretKey, setStripeSecretKey] = useState('');
    const [showAddStripeModel, setShowAddStripeModel] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const token = localStorage.getItem("adminToken");
    const [withdrawalRequests, setWithdrawalRequests] = useState([]);
    const [paymentDate, setPaymentDate] = useState('');
    const [comment, setComment] = useState('');
    const [showMarkPaidModel, setShowMarkPaidModel] = useState(false);
    const [showReleaseModel, setShowReleaseModel] = useState(false);
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
                const response = await axios.get('http://localhost:5000/api/v1/settings/admin/stripe_keys', { headers: { Authorization: `Admin ${token}` } });
                if (response.data.success) {
                    setStripePublishableKey(response.data.stripePublishableKey)
                    setStripeSecretKey(response.data.stripeSecretKey)
                }
            } catch (error) {
                console.error("Error fetching Stripe keys:", error);
            }
        };

        const fetchWithdrawalRequests = async (type) => {
            try {
                const response = await axios.get(`http://localhost:5000/api/v1/payments/withdrawal-requests?type=${type}`, {
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
        fetchStripeKey();

    }, [token, value]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripePublishableKey || !stripeSecretKey) {
            enqueueSnackbar('Please fill in both fields', { variant: 'error' });
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/v1/settings/admin/stripe_keys',
                { stripePublishableKey, stripeSecretKey },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success)
                enqueueSnackbar('Stripe account details saved successfully!', { variant: 'success' });

        } catch (error) {
            enqueueSnackbar('Failed to save Stripe account details', { variant: 'error' });
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
            const response = await axios.put('http://localhost:5000/api/v1/payments/mark-paid', {
                requestIds: selectedRequests,
                paidOn: paymentDate,
                comment,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                enqueueSnackbar(`${selectedRequests.length} payment${selectedRequests.length > 1 ? "s" : ""} marked as Paid!`, { variant: 'success' });
                setWithdrawalRequests(prev => prev.filter(req => !selectedRequests.includes(req._id)));
                setSelectedRequests([]);
                setShowMarkPaidModel(false);
            }

        } catch (error) {
            console.error(error);
            enqueueSnackbar('Something went wrong!', { variant: 'error' });
        }
    }

    const releasePayments = async () => {

        setReleaseLoading(true);

        try {
            const response = await axios.put('http://localhost:5000/api/v1/payments/release-payment', {
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
            enqueueSnackbar('Something went wrong!', { variant: 'error' });
            setReleaseLoading(false);
        }
    }

    const moveToPending = async () => {

        try {
            const response = await axios.put('http://localhost:5000/api/v1/payments/move-to-pending', { requestIds: selectedRequests }, {
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
                        <div className="method">
                            <BsStripe />
                            Stripe
                        </div>
                        <button className="secondaryBtn" onClick={() => setShowAddStripeModel(true)}>Manage</button>
                    </div>
                </div>

                <div className="paymentsDetails">
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                <Tab label="Pending Payments" {...a11yProps(0)} />
                                <Tab label="Completed Payments" {...a11yProps(1)} />
                                <Tab label="Pending Refunds" {...a11yProps(2)} />
                                <Tab label="Completed Refunds" {...a11yProps(3)} />
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
                            />
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={1}>
                            <CompletedPayments
                                requests={withdrawalRequests}
                                selectedRequests={selectedRequests}
                                handleSelectRequest={handleSelectRequest}
                                handleSelectAll={handleSelectAll}
                                moveToPending={moveToPending}
                            />
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={2}>
                            Item Three
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={3}>
                            Item Four
                        </CustomTabPanel>
                    </Box>
                </div>

            </div>

            {showAddStripeModel && (
                <div className="popupDiv">

                    <div className="popupContent">

                        <div className='form'>
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
                            <button type="submit" className='primaryBtn' onClick={handleSubmit}>Save Stripe Details</button>
                            <button className="secondaryBtn" type="button" onClick={() => setShowAddStripeModel(false)}>Close</button>
                        </div>

                    </div>

                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className="icon" onClick={() => setShowAddStripeModel(false)} />
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
                            <button className="secondaryBtn" onClick={() => setShowMarkPaidModel(false)}>Cancel</button>
                        </div>

                    </div>

                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className="icon" onClick={() => setShowMarkPaidModel(false)} />
                    </div>

                </div>
            )}

            {showReleaseModel && (
                <div className="popupDiv">
                    <div className="popupContent releasePopupContent">
                        <div className="form">
                            <h2 className="secondaryHeading">Confirm <span>Releasing</span> Payments</h2>
                            <div className="horizontalLine"></div>
                            <p>You are about to release a total of <strong>${calculateTotalAmount().toFixed(2)}</strong> to the sellers. Please ensure you have sufficient funds in your your linked Stripe account!</p>
                        </div>

                        <div className="buttonsDiv" style={{ marginTop: "20px" }}>
                            <button className="primaryBtn" onClick={releasePayments} disabled={releaseLoading}>Release ${calculateTotalAmount().toFixed(2)}</button>
                            <button className="secondaryBtn" onClick={() => setShowReleaseModel(false)}>Cancel</button>
                        </div>
                    </div>

                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className="icon" onClick={() => setShowReleaseModel(false)} />
                    </div>
                </div>
            )}


        </div>
    );
};

export default AdminPayments;




function PendingPayments({ requests, selectedRequests, handleSelectRequest, handleSelectAll, setShowMarkPaidModel, setShowReleaseModel }) {

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

        axios.get(`http://localhost:5000/api/v1/payments/seller/${sellerId}`, {
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

        axios.get(`http://localhost:5000/api/v1/payments/seller/${sellerId}/earnings`, {
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

    return (
        <div className="pendingPaymentsDiv tableDiv">
            <div className="tableContent">
                <div className="upper">
                    <h2 className="secondaryHeading"><span>Pending</span> Withdrawal requests from Sellers</h2>
                    <div className="upperRight">
                        <button className="secondaryBtn" disabled={selectedRequests.length < 1} onClick={() => setShowMarkPaidModel(true)}>Mark Paid</button>
                        <button className="secondaryBtn" disabled={selectedRequests.length < 1} onClick={() => setShowReleaseModel(true)}>Release Payment</button>
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
                                    <div className="fw600">${earnings.totalEarnings}</div>
                                </div>
                                <div className="row">
                                    <p>Available Balance</p>
                                    <div className="fw600">${earnings.availableBalance}</div>
                                </div>
                                <div className="row">
                                    <p>Paid Balance</p>
                                    <div className="fw600">${earnings.paidBalance}</div>
                                </div>
                                <div className="row">
                                    <p>Requested for Withdrawal</p>
                                    <div className="fw600">${earnings.requestedForWithdrawal}</div>
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




function CompletedPayments({ requests, selectedRequests, handleSelectRequest, handleSelectAll, moveToPending }) {

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

    return (
        <div className="tableDiv">
            <div className="tableContent">
                <div className="upper">
                    <h2 className="secondaryHeading"><span>Completed</span> Withdrawal requests</h2>
                    <div className="upperRight">
                        <button className="secondaryBtn" disabled={selectedRequests.length < 1} onClick={moveToPending}>Move to Pending</button>
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