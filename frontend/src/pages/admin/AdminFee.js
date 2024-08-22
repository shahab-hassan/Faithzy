import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

function AdminFee() {
    const [fees, setFees] = useState({
        seller: { product: 0, service: 0 },
        paidSeller: { product: 0, service: 0 },
        buyer: { product: 0, service: 0 }
    });
    const [membership, setMembership] = useState({
        threeMonths: 0,
        sixMonths: 0,
        nineMonths: 0,
        offerDiscount: false,
        discountType: 'onAllPlans',
        discounts: {
            allPlans: { discount: 0, expiryDate: '' },
            threeMonths: { discount: 0, expiryDate: '' },
            sixMonths: { discount: 0, expiryDate: '' },
            nineMonths: { discount: 0, expiryDate: '' }
        }
    });
    const [editMode, setEditMode] = useState({
        seller: false,
        paidSeller: false,
        buyer: false,
        membership: false
    });

    const [originalFees, setOriginalFees] = useState({ ...fees });
    const [originalMembership, setOriginalMembership] = useState({ ...membership });


    useEffect(() => {
        axios.get('http://localhost:5000/api/v1/settings/admin/feesAndMembership')
            .then(response => {
                if (response.data.success) {
                    if (response.data.fees) {
                        setFees(response.data.fees);
                        setOriginalFees(response.data.fees);
                    }
                    if (response.data.membership) {
                        const membershipData = response.data.membership;

                        const convertDate = (date) => date ? new Date(date).toISOString().split('T')[0] : '';

                        if (membershipData.discounts) {
                            membershipData.discounts.allPlans.expiryDate = convertDate(membershipData.discounts.allPlans.expiryDate);
                            membershipData.discounts.threeMonths.expiryDate = convertDate(membershipData.discounts.threeMonths.expiryDate);
                            membershipData.discounts.sixMonths.expiryDate = convertDate(membershipData.discounts.sixMonths.expiryDate);
                            membershipData.discounts.nineMonths.expiryDate = convertDate(membershipData.discounts.nineMonths.expiryDate);
                        }

                        setMembership(membershipData);
                        setOriginalMembership(membershipData);
                    }
                }
            })
            .catch(e => {
                console.log(e);
                enqueueSnackbar(e?.response?.data?.error || 'Failed to fetch admin fee data.', { variant: 'error' });
            });
    }, []);

    const handleFeeChange = (e, type, feeType) => {
        setFees({
            ...fees,
            [type]: {
                ...fees[type],
                [feeType]: e.target.value
            }
        });
    };

    const handleMembershipChange = (e) => {
        const { name, value, type, checked } = e.target;
        setMembership({
            ...membership,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleDiscountChange = (e, plan) => {
        const { name, value } = e.target;
        setMembership({
            ...membership,
            discounts: {
                ...membership.discounts,
                [plan]: {
                    ...membership.discounts[plan],
                    [name]: value
                }
            }
        });
    };

    const handleFeeSubmit = (type) => {

        if (!editMode[type]) {
            setEditMode({ ...editMode, [type]: true });
            return;
        }

        const token = localStorage.getItem('adminToken');
        // const updatedFees = { ...fees, [type]: fees[type] };

        axios.post('http://localhost:5000/api/v1/settings/admin/update/fees', { fees: fees }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => {
                enqueueSnackbar(`Fee Updated!`, { variant: 'success' });
                setEditMode({ ...editMode, [type]: false });
            })
            .catch((e) => {
                console.log(e);
                enqueueSnackbar(e?.response?.data?.error || 'Failed to Update Fee!', { variant: 'error' });
            });
    };

    const handleMembershipSubmit = () => {

        if (!editMode.membership) {
            setEditMode({ ...editMode, membership: true });
            return;
        }

        const token = localStorage.getItem('adminToken');

        axios.post('http://localhost:5000/api/v1/settings/admin/update/membership', { membership }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => {
                enqueueSnackbar(`Membership Updated!`, { variant: 'success' });
                setEditMode({ ...editMode, membership: false });
            })
            .catch((e) => {
                console.log(e);
                enqueueSnackbar(e?.response?.data?.error || 'Failed to Update Membership!', { variant: 'error' });
            });
    };

    const renderDiscountFields = () => {
        if (!membership.offerDiscount) return null;

        if (membership.discountType === 'onAllPlans') {
            return (
                <div className="inputDiv">
                    <div className="inputInnerDiv">
                        <label>Discount on all Plans (%)</label>
                        <input
                            type="number"
                            name="discount"
                            value={membership.discounts.allPlans.discount}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 3 && value <= 100)
                                    handleDiscountChange(e, 'allPlans')
                            }}
                            className='inputField'
                            placeholder='Enter Discount (%)'
                            disabled={!editMode.membership}
                        />
                    </div>
                    <div className="inputInnerDiv">
                        <label>Expiry Date</label>
                        <input
                            type="date"
                            name="expiryDate"
                            value={membership.discounts.allPlans.expiryDate}
                            onChange={(e) => handleDiscountChange(e, 'allPlans')}
                            className='inputField'
                            disabled={!editMode.membership}
                        />
                    </div>
                </div>
            );
        } else {
            return ['threeMonths', 'sixMonths', 'nineMonths'].map((plan, index) => (
                <div className="inputDiv" key={index}>
                    <div className="inputInnerDiv">
                        <label>Discount on {(index + 1) * 3} Months Plan (%)</label>
                        <input
                            type="number"
                            name="discount"
                            value={membership.discounts[plan].discount}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 3 && value <= 100)
                                    handleDiscountChange(e, plan)
                            }}
                            className='inputField'
                            placeholder='Enter Discount (%)'
                            disabled={!editMode.membership}
                        />
                    </div>
                    <div className="inputInnerDiv">
                        <label>Expiry Date</label>
                        <input
                            type="date"
                            name="expiryDate"
                            value={membership.discounts[plan].expiryDate}
                            onChange={(e) => handleDiscountChange(e, plan)}
                            className='inputField'
                            disabled={!editMode.membership}
                        />
                    </div>
                </div>
            ));
        }
    };

    const handleCancel = (type) => {
        setFees({
            ...fees,
            [type]: originalFees[type]
        });
        setEditMode({ ...editMode, [type]: false });
    };

    const handleMembershipCancel = () => {
        setMembership(originalMembership);
        setEditMode({ ...editMode, membership: false });
    };

    return (
        <div className='adminFeeDiv'>
            <h1 className="primaryHeading"><span>Fee</span> Management</h1>
            <div className="adminFeeContent">

                <div className="left">
                    {['seller', 'paidSeller', 'buyer'].map((type, index) => (
                        <div className="box" key={index}>
                            <div className="upper">
                                <h2 className="secondaryHeading">Fee for <span>{type === "paidSeller" ? "Paid Seller" : type.charAt(0).toUpperCase() + type.slice(1)}</span></h2>
                            </div>
                            <div className="lower form">
                                <div className="inputDiv">
                                    <label>Product {index === 2 ? "Purchase" : "Sale"} (%)</label>
                                    <input
                                        type="number"
                                        name="product"
                                        value={fees[type].product}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.length <= 3 && value <= 100)
                                                handleFeeChange(e, type, 'product');
                                        }}
                                        className='inputField'
                                        placeholder='Enter Fee (%)'
                                        disabled={!editMode[type]}
                                    />
                                </div>
                                <div className="inputDiv">
                                    <label>Service Fee (%)</label>
                                    <input
                                        type="number"
                                        name="service"
                                        value={fees[type].service}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.length <= 3 && value <= 100)
                                                handleFeeChange(e, type, 'service');
                                        }}
                                        className='inputField'
                                        placeholder='Enter Fee (%)'
                                        disabled={!editMode[type]}
                                    />
                                </div>
                                <div className="buttonsDiv">
                                    <button className="secondaryBtn" onClick={() => handleFeeSubmit(type)}>
                                        {editMode[type] ? 'Update' : 'Edit'}
                                    </button>
                                    <button className='secondaryBtn' disabled={!editMode[type]} onClick={() => handleCancel(type)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="right box">
                    <div className="upper">
                        <h2 className="secondaryHeading"><span>Paid</span> Membership</h2>
                    </div>
                    <div className="lower form">
                        <div className="inputDiv">
                            <label>3 Months ($)</label>
                            <input
                                type="number"
                                name="threeMonths"
                                value={membership.threeMonths}
                                onChange={handleMembershipChange}
                                className='inputField'
                                placeholder='Enter Price ($)'
                                disabled={!editMode.membership}
                            />
                        </div>
                        <div className="inputDiv">
                            <label>6 Months ($)</label>
                            <input
                                type="number"
                                name="sixMonths"
                                value={membership.sixMonths}
                                onChange={handleMembershipChange}
                                className='inputField'
                                placeholder='Enter Price ($)'
                                disabled={!editMode.membership}
                            />
                        </div>
                        <div className="inputDiv">
                            <label>9 Months ($)</label>
                            <input
                                type="number"
                                name="nineMonths"
                                value={membership.nineMonths}
                                onChange={handleMembershipChange}
                                className='inputField'
                                placeholder='Enter Price ($)'
                                disabled={!editMode.membership}
                            />
                        </div>
                        <div className="checkboxDiv">
                            <input
                                type="checkbox"
                                className="checkbox"
                                id="offerDiscount"
                                name="offerDiscount"
                                checked={membership.offerDiscount}
                                onChange={handleMembershipChange}
                                disabled={!editMode.membership}
                            />
                            <label htmlFor="offerDiscount">Offer Discount</label>
                        </div>

                        {membership.offerDiscount && (
                            <>
                                <div className="discountType inputDiv">
                                    <div className="radioBtn">
                                        <input
                                            type="radio"
                                            name="discountType"
                                            id="onAllPlans"
                                            value="onAllPlans"
                                            checked={membership.discountType === 'onAllPlans'}
                                            onChange={handleMembershipChange}
                                            disabled={!editMode.membership}
                                        />
                                        <label htmlFor="onAllPlans">On All Plans</label>
                                    </div>
                                    <div className="radioBtn">
                                        <input
                                            type="radio"
                                            name="discountType"
                                            id="individualDiscount"
                                            value="individualDiscount"
                                            checked={membership.discountType === 'individualDiscount'}
                                            onChange={handleMembershipChange}
                                            disabled={!editMode.membership}
                                        />
                                        <label htmlFor="individualDiscount">Individual Discount</label>
                                    </div>
                                </div>
                                <div className="horizontalLine"></div>
                                {renderDiscountFields()}
                            </>
                        )}

                        <div className="buttonsDiv">
                            <button className="secondaryBtn" onClick={handleMembershipSubmit}>
                                {editMode.membership ? 'Update' : 'Edit'}
                            </button>
                            <button className='secondaryBtn' disabled={!editMode.membership} onClick={handleMembershipCancel}>Cancel</button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminFee;
