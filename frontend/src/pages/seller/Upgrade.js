import React, { useContext, useState, useEffect } from 'react';
import { FaRegCircleCheck } from "react-icons/fa6";
import { IoCloseCircleOutline } from "react-icons/io5";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { AuthContext } from "../../utils/AuthContext";

function Upgrade() {

    const { user } = useContext(AuthContext);
    const [membership, setMembership] = useState({});
    const [currentPlan, setCurrentPlan] = useState(null);
    const [selectedMonths, setSelectedMonths] = useState(3);
    const [discountedPrice, setDiscountedPrice] = useState(0);
    const [discountPercent, setDiscountPercent] = useState(null);
    const [discountExpiry, setDiscountExpiry] = useState(null);

    const token = localStorage.getItem("token");

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

    }, [user]);

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

    const handlePlanPurchase = () => {
        const planData = {
            months: selectedMonths,
            price: discountedPrice,
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + selectedMonths))
        };

        axios.put(`http://localhost:5000/api/v1/sellers/plan/upgrade/${user?.sellerId?._id}`, { plan: planData }, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => {
                if (response.data.success) {
                    setCurrentPlan(planData);
                    enqueueSnackbar("Plan purchased successfully!", { variant: "success" });
                }
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
            });
    };

    const handleCancelPlan = () => {
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

    return (
        <div className='upgradeDiv'>
            <section className="section">
                <div className="upgradeContent">

                    <h1 className="primaryHeading"><span>UPGRADE</span> YOUR ACCOUNT</h1>

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
                                <button className='primaryBtn2' onClick={handlePlanPurchase} disabled={currentPlan}>{currentPlan? "Already Using" : "Buy Now"}</button>
                                {currentPlan && <button className='dangerBtn' onClick={handleCancelPlan}>Cancel Membership</button>}
                            </div>
                            {discountExpiry && <div className="discountExpiry">Discount Ending On - <span>{formatDateTime(discountExpiry)}</span></div>}
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}

export default Upgrade;