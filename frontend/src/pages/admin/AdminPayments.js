import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { BsStripe } from "react-icons/bs";
import { IoIosCloseCircleOutline } from 'react-icons/io';

const AdminPayments = () => {

    const [stripePublishableKey, setStripePublishableKey] = useState('');
    const [stripeSecretKey, setStripeSecretKey] = useState('');
    const [showAddStripeModel, setShowAddStripeModel] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const token = localStorage.getItem("adminToken");


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

        fetchStripeKey();
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


    return (
        <div className="adminPaymentsDiv">
            <div className="adminPaymentsContent">

                <h2 className='secondaryHeading'><span>Payment</span> Methods</h2>

                <div className="paymentMethods">
                    <div className="method">
                        <BsStripe />
                        Stripe
                    </div>
                    <button className="secondaryBtn" onClick={() => setShowAddStripeModel(true)}>Manage</button>
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

        </div>
    );
};

export default AdminPayments;
