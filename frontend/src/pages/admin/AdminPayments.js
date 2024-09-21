import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { BsStripe } from "react-icons/bs";
import { IoIosCloseCircleOutline } from 'react-icons/io';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { formatDate } from '../../utils/utilFuncs';

// const AdminPayments = () => {

//     const [stripePublishableKey, setStripePublishableKey] = useState('');
//     const [stripeSecretKey, setStripeSecretKey] = useState('');
//     const [showAddStripeModel, setShowAddStripeModel] = useState(false);
//     const { enqueueSnackbar } = useSnackbar();
//     const token = localStorage.getItem("adminToken");
//     const [withdrawalRequests, setWithdrawalRequests] = useState([]);
//     const [paymentDate, setPaymentDate] = useState('');
//     const [comment, setComment] = useState('');
//     const [showMarkPaidModel, setShowMarkPaidModel] = useState(false);

//     const [value, setValue] = React.useState(0);

//     const handleChange = (event, newValue) => {
//         setValue(newValue);
//     };

//     useEffect(() => {

//         const fetchStripeKey = async () => {
//             try {
//                 const response = await axios.get('http://localhost:5000/api/v1/settings/admin/stripe_keys', { headers: { Authorization: `Admin ${token}` } });
//                 if (response.data.success) {
//                     setStripePublishableKey(response.data.stripePublishableKey)
//                     setStripeSecretKey(response.data.stripeSecretKey)
//                 }
//             } catch (error) {
//                 console.error("Error fetching Stripe keys:", error);
//             }
//         };

//         const fetchWithdrawalRequests = async () => {
//             try {
//                 const response = await axios.get('http://localhost:5000/api/v1/payments/withdrawal-requests', {
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 if (response.data.success) {
//                     setWithdrawalRequests(response.data.withdrawalRequests);
//                 }
//             } catch (error) {
//                 console.error("Error fetching withdrawal requests:", error);
//             }
//         };

//         fetchStripeKey();
//         fetchWithdrawalRequests();

//     }, [token]);


//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!stripePublishableKey || !stripeSecretKey) {
//             enqueueSnackbar('Please fill in both fields', { variant: 'error' });
//             return;
//         }

//         try {
//             const response = await axios.post('http://localhost:5000/api/v1/settings/admin/stripe_keys',
//                 { stripePublishableKey, stripeSecretKey },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             if (response.data.success)
//                 enqueueSnackbar('Stripe account details saved successfully!', { variant: 'success' });

//         } catch (error) {
//             enqueueSnackbar('Failed to save Stripe account details', { variant: 'error' });
//             console.error(error);
//         }
//     };

//     const handleSelectRequest = (requestId, setSelectedRequests) => {
//         setSelectedRequests(prev =>
//             prev.includes(requestId)
//                 ? prev.filter(id => id !== requestId)
//                 : [...prev, requestId]
//         );
//     };

//     const handleSelectAll = (setSelectedRequests, requests, areAllSelected) => {
//         if (areAllSelected)
//             setSelectedRequests([]);
//         else {
//             const allRequestIds = requests.map(request => request._id);
//             setSelectedRequests(allRequestIds);
//         }
//     };

//     const markPaidManually = async (selectedRequests, setSelectedRequests) => {

//         if (!paymentDate || !comment) {
//             enqueueSnackbar('Please provide payment date and comment', { variant: 'error' });
//             return;
//         }

//         try {
//             const response = await axios.post('http://localhost:5000/api/v1/payments/mark-paid', {
//                 requestIds: selectedRequests,
//                 paidOn: paymentDate,
//                 comment,
//             }, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             if (response.data.success) {
//                 enqueueSnackbar(`${selectedRequests} payment${selectedRequests.length > 1 && "s"} marked as Paid!`, { variant: 'success' });
//                 setWithdrawalRequests(prev => prev.filter(req => !selectedRequests.includes(req._id)));
//                 setSelectedRequests([]);
//             }

//         } catch (error) {
//             console.error(error);
//             enqueueSnackbar('Something went wrong!', { variant: 'error' });
//         }
//     }

//     return (
//         <div className="adminPaymentsDiv">
//             <div className="adminPaymentsContent">

//                 <div className='paymentMethodsDiv'>
//                     <h2 className='secondaryHeading'><span>Payment</span> Methods</h2>

//                     <div className="paymentMethods">
//                         <div className="method">
//                             <BsStripe />
//                             Stripe
//                         </div>
//                         <button className="secondaryBtn" onClick={() => setShowAddStripeModel(true)}>Manage</button>
//                     </div>
//                 </div>

//                 <div className="paymentsDetails">
//                     <Box sx={{ width: '100%' }}>
//                         <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//                             <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
//                                 <Tab label="Pending Payments" {...a11yProps(0)} />
//                                 <Tab label="Completed Payments" {...a11yProps(1)} />
//                                 <Tab label="Pending Refunds" {...a11yProps(2)} />
//                                 <Tab label="Completed Refunds" {...a11yProps(3)} />
//                             </Tabs>
//                         </Box>
//                         <CustomTabPanel value={value} index={0}>
//                             <PendingPayments requests={withdrawalRequests} handleSelectRequest={handleSelectRequest} handleSelectAll={handleSelectAll} markPaidManually={markPaidManually} />
//                         </CustomTabPanel>
//                         <CustomTabPanel value={value} index={1}>
//                             Item Two
//                         </CustomTabPanel>
//                         <CustomTabPanel value={value} index={2}>
//                             Item Three
//                         </CustomTabPanel>
//                         <CustomTabPanel value={value} index={3}>
//                             Item Four
//                         </CustomTabPanel>
//                     </Box>
//                 </div>

//             </div>

//             {showAddStripeModel && (
//                 <div className="popupDiv">

//                     <div className="popupContent">

//                         <div className='form'>
//                             <div className='inputDiv'>
//                                 <label>Stripe Publishable Key <span>*</span></label>
//                                 <input
//                                     type="text"
//                                     value={stripePublishableKey}
//                                     onChange={(e) => setStripePublishableKey(e.target.value)}
//                                     placeholder="Enter your Stripe Publishable Key"
//                                     className='inputField'
//                                 />
//                             </div>
//                             <div className='inputDiv'>
//                                 <label>Stripe Secret Key <span>*</span></label>
//                                 <input
//                                     type="text"
//                                     value={stripeSecretKey}
//                                     onChange={(e) => setStripeSecretKey(e.target.value)}
//                                     placeholder="Enter your Stripe Secret Key"
//                                     className='inputField'
//                                 />
//                             </div>
//                         </div>

//                         <div className="buttonsDiv" style={{ marginTop: "20px" }}>
//                             <button type="submit" className='primaryBtn' onClick={handleSubmit}>Save Stripe Details</button>
//                             <button className="secondaryBtn" type="button" onClick={() => setShowAddStripeModel(false)}>Close</button>
//                         </div>

//                     </div>

//                     <div className="popupCloseBtn">
//                         <IoIosCloseCircleOutline className="icon" onClick={() => setShowAddStripeModel(false)} />
//                     </div>

//                 </div>
//             )}

//             {showMarkPaidModel && (
//                 <div className="popupDiv">

//                     <div className="popupContent">

//                         <div className="form">
//                             <div className="inputDiv">
//                                 <label>Payment Date <span>*</span></label>
//                                 <input
//                                     type="date"
//                                     value={paymentDate}
//                                     onChange={(e) => setPaymentDate(e.target.value)}
//                                     className='inputField'
//                                 />
//                             </div>
//                             <div className="inputDiv">
//                                 <label>Comment <span>*</span></label>
//                                 <textarea
//                                     value={comment}
//                                     onChange={(e) => setComment(e.target.value)}
//                                     placeholder="Enter your comment"
//                                     className='inputField'
//                                 />
//                             </div>
//                         </div>

//                         <div className="buttonsDiv">
//                             <button type="submit" className='primaryBtn' onClick={markPaidManually}>Mark Paid</button>
//                             <button className="secondaryBtn" onClick={() => setShowMarkPaidModel(false)}>Close</button>
//                         </div>

//                     </div>

//                     <div className="popupCloseBtn">
//                         <IoIosCloseCircleOutline className="icon" onClick={() => setShowMarkPaidModel(false)} />
//                     </div>

//                 </div>
//             )}

//         </div>
//     );
// };

// export default AdminPayments;




// function PendingPayments({ requests, handleSelectRequest, handleSelectAll, markPaidManually }) {

//     const [selectedRequests, setSelectedRequests] = useState([]);

//     const areAllSelected = selectedRequests.length === requests.length;

//     const paymentElems = requests.length > 0 ? requests.map((request, index) => (
//         <div key={index}>
//             <div className="requestRow row">
//                 <div><input
//                     type="checkbox"
//                     checked={selectedRequests.includes(request._id, setSelectedRequests)}
//                     onChange={() => handleSelectRequest(request._id, setSelectedRequests)}
//                 />
//                 </div>
//                 <p className="dateField field">{formatDate(request?.createdAt)}</p>
//                 <p className="userField field">{request?.userId?.username}</p>
//                 <p className="priceField field">${request?.amount}</p>
//                 <p className="actionsField field">{request?.amount}</p>
//             </div>
//             {requests.length > 1 && requests.length - 1 !== index && <div className="horizontalLine"></div>}
//         </div>
//     ))
//         : <div className="row">Nothing to show here...</div>;

//     return (
//         <div className="tableDiv">
//             <div className="tableContent">
//                 <div className="upper">
//                     <h2 className="secondaryHeading"><span>Pending</span> Withdrawal requests from Sellers</h2>
//                     <div className="upperRight">
//                         <button className="secondaryBtn" disabled={selectedRequests.length < 1} onClick={markPaidManually}>Mark Paid</button>
//                         <button className="secondaryBtn" disabled={selectedRequests.length < 1}>Release Payment</button>
//                     </div>
//                 </div>
//                 <div className="header">
//                     <div><input
//                         type="checkbox"
//                         checked={areAllSelected}
//                         onChange={() => handleSelectAll(setSelectedRequests, requests, areAllSelected)}
//                     />
//                     </div>
//                     <p>Date</p>
//                     <p>Seller</p>
//                     <p>Amount</p>
//                     <p>Actions</p>
//                 </div>
//                 <div className="rows">{paymentElems}</div>
//             </div>
//         </div>
//     )
// }




// function CustomTabPanel(props) {
//     const { children, value, index, ...other } = props;

//     return (
//         <div
//             role="tabpanel"
//             hidden={value !== index}
//             id={`simple-tabpanel-${index}`}
//             aria-labelledby={`simple-tab-${index}`}
//             {...other}
//         >
//             {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
//         </div>
//     );
// }

// CustomTabPanel.propTypes = {
//     children: PropTypes.node,
//     index: PropTypes.number.isRequired,
//     value: PropTypes.number.isRequired,
// };

// function a11yProps(index) {
//     return {
//         id: `simple-tab-${index}`,
//         'aria-controls': `simple-tabpanel-${index}`,
//     };
// }





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

    const [selectedRequests, setSelectedRequests] = useState([]); // Lifted state
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
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

        const fetchWithdrawalRequests = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/v1/payments/withdrawal-requests', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setWithdrawalRequests(response.data.withdrawalRequests);
                }
            } catch (error) {
                console.error("Error fetching withdrawal requests:", error);
            }
        };

        fetchStripeKey();
        fetchWithdrawalRequests();

    }, [token]);


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
            const response = await axios.post('http://localhost:5000/api/v1/payments/mark-paid', {
                requestIds: selectedRequests,
                paidOn: paymentDate,
                comment,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                enqueueSnackbar(`${selectedRequests.length} payment${selectedRequests.length > 1 ? "s" : ""} marked as Paid!`, { variant: 'success' });
                setWithdrawalRequests(prev => prev.filter(req => !selectedRequests.includes(req._id)));
                setSelectedRequests([]); // Clear selected requests after marking as paid
            }

        } catch (error) {
            console.error(error);
            enqueueSnackbar('Something went wrong!', { variant: 'error' });
        }
    }

    return (
        <div className="adminPaymentsDiv">
            <div className="adminPaymentsContent">

                <div className='paymentMethodsDiv'>
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
                                setShowMarkPaidModel = {setShowMarkPaidModel}
                            />
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={1}>
                            Item Two
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

        </div>
    );
};

export default AdminPayments;




function PendingPayments({ requests, selectedRequests, handleSelectRequest, handleSelectAll, setShowMarkPaidModel }) {

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
                <p className="userField field">{request?.userId?.username}</p>
                <p className="priceField field">${request?.amount}</p>
                <p className="actionsField field">{request?.amount}</p>
            </div>
            {requests.length > 1 && requests.length - 1 !== index && <div className="horizontalLine"></div>}
        </div>
    ))
        : <div className="row">Nothing to show here...</div>;

    return (
        <div className="tableDiv">
            <div className="tableContent">
                <div className="upper">
                    <h2 className="secondaryHeading"><span>Pending</span> Withdrawal requests from Sellers</h2>
                    <div className="upperRight">
                        <button className="secondaryBtn" disabled={selectedRequests.length < 1} onClick={()=>setShowMarkPaidModel(true)}>Mark Paid</button>
                        <button className="secondaryBtn" disabled={selectedRequests.length < 1}>Release Payment</button>
                    </div>
                </div>
                <div className="header">
                    <div><input
                        type="checkbox"
                        checked={areAllSelected}
                        onChange={() => handleSelectAll(requests, areAllSelected)}
                    />
                    </div>
                    <p>Date</p>
                    <p>Seller</p>
                    <p>Amount</p>
                    <p>Actions</p>
                </div>
                <div className="rows">{paymentElems}</div>
            </div>
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