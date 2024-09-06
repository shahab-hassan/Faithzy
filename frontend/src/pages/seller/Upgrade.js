import React, { useContext, useState, useEffect } from 'react';
import { FaRegCircleCheck } from "react-icons/fa6";
import { IoCloseCircleOutline } from "react-icons/io5";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { AuthContext } from "../../utils/AuthContext";
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { BsStripe } from "react-icons/bs";
import { FaPaypal } from "react-icons/fa";
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';

function Upgrade() {

    const { user } = useContext(AuthContext);
    const [membership, setMembership] = useState({});
    const [currentPlan, setCurrentPlan] = useState(null);
    const [selectedMonths, setSelectedMonths] = useState(3);
    const [discountedPrice, setDiscountedPrice] = useState(0);
    const [discountPercent, setDiscountPercent] = useState(null);
    const [discountExpiry, setDiscountExpiry] = useState(null);
    const [showCheckoutModel, setShowCheckoutModel] = useState(false);
    const [paymentMethod, setPaymentMethod] = React.useState("stripe");
    const token = localStorage.getItem("token");
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        if (!user) return;

        axios.get(`http://localhost:5000/api/v1/settings/admin/feesAndMembership`)
            .then(response => {
                if (response.data.success) {
                    setMembership(response.data.membership);
                    calculateDiscountedPrice(3, response.data.membership);
                }
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
            });

        axios.get(`http://localhost:5000/api/v1/sellers/seller/${user?.sellerId?._id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => {
                if (response.data.success)
                    setCurrentPlan(response.data.seller.plan);
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
            });

    }, [user, token]);

    const calculateDiscountedPrice = (months, membership) => {
        if (!membership) return;

        const plan = months === 3 ? "threeMonths" : months === 6 ? "sixMonths" : "twelveMonths";
        let price = membership[plan];

        if (membership.offerDiscount) {
            if (membership.discountType === 'onAllPlans') {
                price -= price * (membership.discounts.allPlans.discount / 100) || 0;
                setDiscountPercent(membership.discounts.allPlans.discount);
                setDiscountExpiry(membership.discounts.allPlans.expiryDate);
            } else if (membership.discountType === 'individualDiscount') {
                price -= price * (membership.discounts[plan].discount / 100) || 0;
                setDiscountPercent(membership.discounts[plan].discount);
                setDiscountExpiry(membership.discounts[plan].expiryDate);
            }
        }

        setDiscountedPrice(price);
    };

    const handlePlanChange = (months) => {
        setSelectedMonths(months);
        calculateDiscountedPrice(months, membership);
    };

    const handleCancelPlan = () => {

        if (!window.confirm("You are ending your Paid Membership... Are you sure you want to continue?"))
            return;

        axios.put(`http://localhost:5000/api/v1/sellers/plan/cancel/${user?.sellerId?._id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => {
                if (response.data.success) {
                    setCurrentPlan(null);
                    enqueueSnackbar("Plan cancelled successfully!", { variant: "success" });
                }
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
            });
    };

    const formatDateTime = (date) => {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    const handlePlanPurchase = async (e) => {

        e.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardNumberElement);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
            setLoading(false);
            return;
        }

        try {
            const planData = {
                months: selectedMonths,
                price: discountedPrice,
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + selectedMonths)),
                paymentMethod: 'stripe'
            };
            const { data } = await axios.put(`http://localhost:5000/api/v1/sellers/plan/upgrade/${user?.sellerId?._id}`, { plan: planData }, { headers: { Authorization: `Bearer ${token}` } })

            const clientSecret = data.clientSecret;

            const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: paymentMethod.id
            });

            if (stripeError) {
                enqueueSnackbar(stripeError.message, { variant: 'error' });
                setLoading(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                enqueueSnackbar("Premium Purchased Successfully!", { variant: 'success' });
                setLoading(false);
                setShowCheckoutModel(false);
                setCurrentPlan(planData);
            }
        } catch (e) {
            console.error(e);
            enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: 'error' });
            setLoading(false);
        }
    };

    return (
        <div className='upgradeDiv'>
            <section className="section">
                <div className="upgradeContent">

                    <h1 className="primaryHeading"><span>UPGRADE</span> YOUR ACCOUNT</h1>
                    {currentPlan && (
                        <h1 className="secondaryHeading">
                            You are already a <span>Paid Member</span>. Your <span>membership</span> expires on {formatDateTime(currentPlan.endDate)}.
                        </h1>
                    )}


                    <div className="timeLine">
                        <div>
                            <input type="radio" id="threeMonths" name='planTimeline' checked={selectedMonths === 3} onChange={() => handlePlanChange(3)} />
                            <label htmlFor="threeMonths">3 Months</label>
                        </div>
                        <div>
                            <input type="radio" id="sixMonths" name='planTimeline' checked={selectedMonths === 6} onChange={() => handlePlanChange(6)} />
                            <label htmlFor="sixMonths">6 Months</label>
                        </div>
                        <div>
                            <input type="radio" id="twelveMonths" name='planTimeline' checked={selectedMonths === 12} onChange={() => handlePlanChange(12)} />
                            <label htmlFor="twelveMonths">12 Months</label>
                        </div>
                    </div>

                    <div className="plans">
                        <div className="freePlan plan">
                            <h2 className="secondaryHeading">Basic</h2>
                            <div className="price">$0</div>
                            <div className="rows">
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Streamlined Business Tools</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Post Service Postings</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Post Product Listings</span>
                                </div>
                                <div className="row notIncluded">
                                    <IoCloseCircleOutline className='icon' />
                                    <span>Access to Tradelead Section</span>
                                </div>
                                <div className="row notIncluded">
                                    <IoCloseCircleOutline className='icon' />
                                    <span>Less Deduction on Service Orders</span>
                                </div>
                                <div className="row notIncluded">
                                    <IoCloseCircleOutline className='icon' />
                                    <span>Less Deduction on Product Sales</span>
                                </div>
                                <div className="row notIncluded">
                                    <IoCloseCircleOutline className='icon' />
                                    <span>Service Listing on Top of Pages</span>
                                </div>
                            </div>
                        </div>
                        <div className="premiumPlan plan">
                            <h2 className="secondaryHeading">Premium</h2>
                            <div className="price">${(discountedPrice / selectedMonths).toFixed(2)} <span>/ month</span></div>
                            {discountPercent && <div className="discountPercent">{discountPercent}% Discount</div>}
                            <div className="rows">
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Streamlined Business Tools</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Post Service Postings</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Post Product Listings</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Access to Tradelead Section</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Less Deduction on Service Orders</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Less Deduction on Product Sales</span>
                                </div>
                                <div className="row">
                                    <FaRegCircleCheck className='icon' />
                                    <span>Service Listing on Top of Pages</span>
                                </div>
                            </div>
                            <div className="buttonDiv">
                                <button className='primaryBtn2' onClick={() => setShowCheckoutModel(true)} disabled={currentPlan}>{currentPlan && (currentPlan.months === selectedMonths) ? "Already Using" : "Buy Now"}</button>
                                {currentPlan && <button className='dangerBtn' onClick={handleCancelPlan}>Cancel Membership</button>}
                            </div>
                            {discountExpiry && <div className="discountExpiry">Discount Ending On - <span>{formatDateTime(discountExpiry)}</span></div>}
                        </div>
                    </div>

                </div>
            </section>

            {showCheckoutModel && (
                <div className="popupDiv upgradeCheckoutModelDiv">
                    <div className="popupContent">
                        <div className="form">

                            <h2 className="secondaryHeading">Choose <span>Payment</span> Method</h2>

                            <div className="horizontalLine"></div>

                            <div className="paymentOptions">
                                <div className={`stripe paymentOption ${paymentMethod === 'stripe' ? 'selected' : ''}`} onClick={() => setPaymentMethod('stripe')}><BsStripe className='icon' /><div>Stripe</div></div>
                                {/* <div className={`paypal paymentOption ${paymentMethod === 'paypal' ? 'selected' : ''}`} onClick={() => enqueueSnackbar("Paypal is not available at the moment!", { variant: "info" })}><FaPaypal className='icon' /><div>Paypal</div></div> */}
                            </div>

                            {paymentMethod === "stripe" && <form className='form'>

                                <div className="inputDiv">
                                    <label>Card Number</label>
                                    <CardNumberElement className="inputField" />
                                </div>

                                <div className="inputDiv">

                                    <div className="inputInnerDiv">
                                        <label>Expiry Date</label>
                                        <CardExpiryElement className="inputField" />
                                    </div>

                                    <div className="inputInnerDiv">
                                        <label>CVC</label>
                                        <CardCvcElement className="inputField" />
                                    </div>

                                </div>

                            </form>}
                        </div>
                        <div className="buttonsDiv">
                            <button className="primaryBtn" type="submit" disabled={loading} onClick={handlePlanPurchase}>Pay ${discountedPrice}</button>
                            <button className="secondaryBtn" onClick={() => setShowCheckoutModel(false)}>Close</button>
                        </div>
                        <div className="popupCloseBtn">
                            <IoIosCloseCircleOutline className="icon" onClick={() => setShowCheckoutModel(false)} />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Upgrade;