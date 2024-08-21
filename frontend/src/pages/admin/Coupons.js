import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { enqueueSnackbar } from 'notistack';
import Dropdown from '../../components/common/Dropdown';
import { IoIosCloseCircleOutline } from 'react-icons/io';

function Coupons() {

    const today = new Date().toISOString().split('T')[0];

    const [coupons, setCoupons] = useState([]);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [showAddNewModal, setShowAddNewModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discount: '',
        minToApply: '',
        expiry: '',
        isSchedule: false,
        scheduledDate: '',
        status: 'Active'
    });
    const [filterType, setFilterType] = useState('All');

    useEffect(() => {
        const fetchCoupons = () => {
            const token = localStorage.getItem('adminToken');
            let url = 'http://localhost:5000/api/v1/coupons/';
            if (filterType === 'Active') {
                url = 'http://localhost:5000/api/v1/coupons/active';
            } else if (filterType === 'Expired') {
                url = 'http://localhost:5000/api/v1/coupons/expired';
            } else if (filterType === 'Scheduled') {
                url = 'http://localhost:5000/api/v1/coupons/scheduled';
            }
            axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then((response) => {
                    if (response.data.success) setCoupons(response.data.coupons);
                })
                .catch((e) => {
                    enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
                });
        };

        fetchCoupons();
    }, [filterType]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewCoupon({ ...newCoupon, [name]: type === 'checkbox' ? checked : value });
    };

    const handleAddNewCoupon = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        axios.post('http://localhost:5000/api/v1/coupons/new', newCoupon, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((response) => {
                if (response.data.success) {
                    setCoupons([response.data.coupon, ...coupons]);
                    enqueueSnackbar('Coupon added successfully!', { variant: 'success' });
                    setShowAddNewModal(false);
                }
            })
            .catch((e) => {
                console.log(e);
                enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
            });
    };

    const handleEditCoupon = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        axios.put(`http://localhost:5000/api/v1/coupons/${selectedCoupon._id}`, newCoupon, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((response) => {
                if (response.data.success) {
                    const updatedCoupon = response.data.coupon;
                    const otherCoupons = coupons.filter(c => c._id !== selectedCoupon._id);
                    otherCoupons.unshift(updatedCoupon);
                    setCoupons(otherCoupons);
                    enqueueSnackbar('Coupon updated successfully!', { variant: 'success' });
                    setShowAddNewModal(false);
                    setIsEditing(false);
                }
            })
            .catch((e) => {
                enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
            });
    };

    const handleDeleteCoupon = (couponId) => {
        if (!window.confirm("Are you sure you want to delete this Coupon?")) return;
        const token = localStorage.getItem('adminToken');
        axios.delete(`http://localhost:5000/api/v1/coupons/${couponId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((response) => {
                if (response.data.success) {
                    setCoupons(coupons.filter(c => c._id !== couponId));
                    enqueueSnackbar('Coupon deleted successfully!', { variant: 'success' });
                }
            })
            .catch((e) => {
                enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
            });
    };

    const openEditModal = (coupon) => {
        setSelectedCoupon(coupon);
        setNewCoupon({
            code: coupon.code,
            discount: coupon.discount,
            minToApply: coupon.minToApply,
            expiry: new Date(coupon.expiry).toISOString().split('T')[0],
            isSchedule: coupon.isSchedule,
            scheduledDate: new Date(coupon.scheduledDate).toISOString().split('T')[0],
            status: coupon.status
        });
        setIsEditing(true);
        setShowAddNewModal(true);
    };

    const openAddNewModal = () => {
        setNewCoupon({
            code: '',
            discount: '',
            minToApply: '',
            expiry: '',
            isSchedule: false,
            scheduledDate: '',
            status: 'Active'
        });
        setIsEditing(false);
        setShowAddNewModal(true);
    };

    const openDetailsModal = (coupon) => {
        setSelectedCoupon(coupon);
        setShowDetailsModal(true);
    };

    const couponElems = coupons.length > 0 ? coupons.map((item, index) => (
        <div key={index}>
            <div className="requestRow row">
                <div className="titleField field">
                    <p className="title">{item.code}</p>
                </div>
                <p className="discountField field">{item.discount}%</p>
                <p className="idField minToApplyField field">${item.minToApply}</p>
                <p className="expiryField field">{new Date(item.expiry).toLocaleDateString()}</p>
                <p className="statusField field">{item.status}</p>
                <div className="actionsField field">
                    <FaEye className="icon" onClick={() => openDetailsModal(item)} />
                    <FaEdit className="icon" onClick={() => openEditModal(item)} />
                    <FaTrash className="icon" onClick={() => handleDeleteCoupon(item._id)} />
                </div>
            </div>
            {coupons.length > 1 && coupons.length - 1 !== index && <div className="horizontalLine"></div>}
        </div>
    ))
        : <div className="row">Nothing to show here...</div>;

    const getMinScheduledDate = () => {
        console.log(newCoupon.expiry);
        if (!newCoupon.expiry) return today; // Return today's date if expiry is not set

        const expiryDate = new Date(newCoupon.expiry);
        if (isNaN(expiryDate.getTime())) return today; // Return today's date if expiryDate is invalid

        expiryDate.setDate(expiryDate.getDate() - 1);
        return expiryDate.toISOString().split('T')[0];
    };

    return (
        <div className='adminCouponsDiv'>
            <div className="adminCouponsContent">
                <div className="tableDiv">
                    <div className="tableContent">
                        <div className="upper">
                            <h2 className="secondaryHeading">
                                <span>{filterType} </span>Coupons
                                <span className="totalRows">- {(coupons.length < 10 && '0') + coupons.length}</span>
                            </h2>
                            <div className="upperRight">
                                <Dropdown options={["All", "Active", "Expired", "Scheduled"]} onSelect={setFilterType} selected={filterType} />
                                <button className="primaryBtn2" onClick={openAddNewModal}>Add Coupon</button>
                            </div>
                        </div>
                        <div className="header">
                            <p className="title">Coupon Code</p>
                            <p>Discount %</p>
                            <p className='id'>Minimum Price to Apply</p>
                            <p>Expiry Date</p>
                            <p>Status</p>
                            <p>Actions</p>
                        </div>
                        <div className="rows">{couponElems}</div>
                    </div>
                </div>
            </div>

            {showAddNewModal && (
                <div className="popupDiv addNewModelDiv">
                    <div className="popupContent">
                        <form className="form" onSubmit={isEditing ? handleEditCoupon : handleAddNewCoupon}>
                            <div className="inputDiv">
                                <label>Coupon Code <span>*</span></label>
                                <input
                                    type="text"
                                    className="inputField"
                                    name="code"
                                    value={newCoupon.code}
                                    onChange={handleInputChange}
                                    placeholder="Enter Coupon Code"
                                    required
                                />
                            </div>
                            <div className="inputDiv">
                                <label>Discount (%) <span>*</span></label>
                                <input
                                    type="number"
                                    className="inputField"
                                    name="discount"
                                    value={newCoupon.discount}
                                    onChange={handleInputChange}
                                    placeholder="Enter Discount Percentage"
                                    required
                                />
                            </div>
                            <div className="inputDiv">
                                <label>Minimum Price to Apply <span>*</span></label>
                                <input
                                    type="number"
                                    className="inputField"
                                    name="minToApply"
                                    value={newCoupon.minToApply}
                                    onChange={handleInputChange}
                                    placeholder="Enter Minimum Price"
                                    required
                                />
                            </div>
                            <div className="inputDiv">
                                <label>Expiry Date <span>*</span></label>
                                <input
                                    type="date"
                                    className="inputField"
                                    name="expiry"
                                    value={newCoupon.expiry}
                                    min={today}
                                    onChange={handleInputChange}
                                    placeholder="Select Expiry Date"
                                    required
                                />
                            </div>
                            <div className="checkboxDiv">
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    id="isSchedule"
                                    name="isSchedule"
                                    checked={newCoupon.isSchedule}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="isSchedule">Schedule Coupon to Active Later</label>
                            </div>
                            {newCoupon.isSchedule && <div className="inputDiv">
                                <label>Scheduled Date</label>
                                <input
                                    type="date"
                                    className="inputField"
                                    name="scheduledDate"
                                    value={newCoupon.scheduledDate}
                                    min={today}
                                    max={getMinScheduledDate()}
                                    onChange={handleInputChange}
                                    placeholder="Select Scheduled Date"
                                />
                            </div>}
                            <div className="buttonsDiv">
                                <button className="primaryBtn" type="submit">{isEditing ? 'Save Changes' : 'Add Coupon'}</button>
                                <button className="secondaryBtn" type="button" onClick={() => setShowAddNewModal(false)}>Cancel</button>
                            </div>
                        </form>
                        <div className="popupCloseBtn">
                            <IoIosCloseCircleOutline className="icon" onClick={() => setShowAddNewModal(false)} />
                        </div>
                    </div>
                </div>
            )}

            {showDetailsModal && selectedCoupon && (
                <div className="popupDiv detailsModelDiv">
                    <div className="popupContent">
                        <div className="details form">
                            <h2 className='secondaryHeading'>Code: <span>{selectedCoupon.code}</span></h2>
                            <div className="horizontalLine"></div>
                            <div className='row'>
                                <div>Discount:</div>
                                <div className="fw600">{selectedCoupon.discount}%</div>
                            </div>
                            <div className='row'>
                                <div>Minimum Price to Apply:</div>
                                <div className="fw600">${selectedCoupon.minToApply}</div>
                            </div>
                            <div className='row'>
                                <div>Expiry Date:</div>
                                <div className="fw600">{new Date(selectedCoupon.expiry).toLocaleDateString()}</div>
                            </div>
                            <div className='row'>
                                <div>Status:</div>
                                <div className="fw600">{selectedCoupon.status}</div>
                            </div>
                            {selectedCoupon.isSchedule && <div className='row'><div>Scheduled Date:</div> <div className='fw600'>{new Date(selectedCoupon.scheduledDate).toLocaleDateString()}</div></div>}
                            <div className='row'><div>Coupon Creation Date:</div> <div className='fw600'>{new Date(selectedCoupon.createdAt).toLocaleDateString()}</div></div>
                            <div className='row'><div>Last Updated On:</div> <div className='fw600'>{new Date(selectedCoupon.updatedAt).toLocaleDateString()}</div></div>
                        </div>
                        <div className="buttonsDiv">
                            <button className="secondaryBtn" type="button" onClick={() => setShowDetailsModal(false)}>Close</button>
                        </div>
                        <div className="popupCloseBtn">
                            <IoIosCloseCircleOutline className="icon" onClick={() => setShowDetailsModal(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Coupons;