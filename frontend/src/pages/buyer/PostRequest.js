import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { MdKeyboardArrowRight } from "react-icons/md";
import { FaEye } from "react-icons/fa6";
import RequestDetails from '../../components/common/RequestDetails';
import { MdMessage } from "react-icons/md";
import { Link } from 'react-router-dom';
import { hostNameBack } from '../../utils/constants';

function PostRequest() {
    const [buyerRequests, setBuyerRequests] = useState([]);
    const [showPostRequestModel, setShowPostRequestModel] = useState(false);
    const [showDetailsModel, setShowDetailsModel] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showOffersModal, setShowOffersModal] = useState(false);
    const [offers, setOffers] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios
            .get(`${hostNameBack}/api/v1/tradeleads/requests/user`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((response) => {
                if (response.data.success) {
                    setBuyerRequests(response.data.requests);
                } else {
                    enqueueSnackbar('Something went wrong!', { variant: 'error' });
                }
            })
            .catch((e) => {
                enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
            });
    }, [showPostRequestModel]);

    const handleEditRequest = (request) => {
        setSelectedRequest(request);
        setShowPostRequestModel(true);
    };

    const handleDeleteRequest = async (requestId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${hostNameBack}/api/v1/tradeleads/request/${requestId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setBuyerRequests(buyerRequests.filter(req => req._id !== requestId));
                enqueueSnackbar('Request deleted successfully', { variant: 'success' });
            } else {
                enqueueSnackbar('Something went wrong!', { variant: 'error' });
            }
        } catch (e) {
            enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
        }
    };

    const handleViewOffers = async (requestId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${hostNameBack}/api/v1/tradeleads/offers/${requestId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setOffers(response.data.offers);
                setShowOffersModal(true);
            } else {
                enqueueSnackbar('Something went wrong!', { variant: 'error' });
            }
        } catch (e) {
            enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
        }
    };

    const requestElems = buyerRequests.length > 0 ? buyerRequests.map((request, index) => (
        <div key={index}>
            <div className="requestRow row">
                <div className="titleField field"><p className='title'>{request.title}</p></div>
                <p className="priceField field">${request.budget}</p>
                <p className="durationField field">{request.duration} days</p>
                <p className="expiryField field">{new Date(request.expiryDate).toLocaleDateString()}</p>
                <p className="offersField field" onClick={() => handleViewOffers(request._id)}>
                    {(request.offers.length < 10 && "0") + request.offers.length}
                    <MdKeyboardArrowRight />
                </p>
                <div className="actionsField field">
                    <FaEye className='icon' onClick={() => setShowDetailsModel(request)} />
                    <FaEdit className='icon' onClick={() => handleEditRequest(request)} />
                    <FaTrash className='icon' onClick={() => handleDeleteRequest(request._id)} />
                </div>
            </div>
            {buyerRequests.length > 1 && buyerRequests.length - 1 !== index && <div className="horizontalLine"></div>}
        </div>
    )) : <div className="row">Nothing to show here...</div>;

    const offerElems = offers.length > 0 ? offers.map((offer, index) => {
        return <div key={index} className='tableContent'>
            <div className="header">
                <p className='title'>Cover Letter</p>
                <p>Price</p>
                <p>Duration</p>
                <p className='seller'>Seller</p>
                <p>Actions</p>
            </div>
            <div className="rows">
                <div className="row">
                    <div className="titleField field">{offer.coverLetter}</div>
                    <p className="field priceField">${offer.price}</p>
                    <p className="field">{offer.duration} days</p>
                    <Link to={`/profile/${offer?.sellerId?.sellerId}`} className="field sellerField">{offer.sellerId.username + " >"}</Link>
                    <Link to={`/chat?p=${offer?.sellerId?._id}`} className="field"><MdMessage className='icon' /></Link>
                </div>
            </div>
        </div>
    }) : "Nothing to show here..."

    return (
        <div className="postRequestDiv tableDiv">
            <section className="section">
                <div className="postRequestContent tableContent">

                    <div className="upper">
                        <h2 className="secondaryHeading">Your <span>Tradeleads</span></h2>
                        <button className="primaryBtn" onClick={() => setShowPostRequestModel(true)}>Post new Request</button>
                    </div>

                    <div className="header">
                        <p className="title">Request</p>
                        <p>Budget</p>
                        <p>Duration</p>
                        <p>Expiry</p>
                        <p>Offers</p>
                        <p>Actions</p>
                    </div>

                    <div className="postRequestRows rows">{requestElems}</div>

                </div>
            </section>
            {showPostRequestModel && (
                <PostNewRequest setShowPostRequestModel={setShowPostRequestModel} selectedRequest={selectedRequest} setSelectedRequest={setSelectedRequest} />
            )}
            {showOffersModal && (
                <div className="offersModalDiv popupDiv">
                    <div className="offersModelContent popupContent">

                        <h2 className='secondaryHeading'>Received <span>Offers</span></h2>

                        <div className="horizontalLine"></div>

                        <div className="offersRows">{offerElems}</div>

                        <div className="buttonsDiv">
                            <button className='secondaryBtn' onClick={() => setShowOffersModal(false)}>Close</button>
                        </div>

                    </div>

                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className='icon' onClick={() => setShowOffersModal(false)} />
                    </div>

                </div>
            )}
            {showDetailsModel && <RequestDetails showDetailsModel={showDetailsModel} setShowDetailsModel={setShowDetailsModel} />}
        </div>
    );
}

export default PostRequest;




function PostNewRequest({ setShowPostRequestModel, selectedRequest, setSelectedRequest }) {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        budget: '',
        duration: '',
        expiryDate: ''
    });

    useEffect(() => {
        axios.get(`${hostNameBack}/api/v1/categories/service/all`)
            .then(response => {
                if (response.data.success) {
                    const categories = response.data.categories;
                    setCategories(categories);
                    setFormData(prev => ({
                        ...prev,
                        category: categories[0].name
                    }))
                }
                else
                    enqueueSnackbar('Something went wrong!', { variant: 'error' });
            })
            .catch((e) => {
                enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
            });

        if (selectedRequest) {
            setFormData({
                title: selectedRequest.title,
                description: selectedRequest.description,
                category: selectedRequest.category,
                budget: selectedRequest.budget,
                duration: selectedRequest.duration,
                expiryDate: selectedRequest.expiryDate.split('T')[0]
            });
        }
    }, [selectedRequest]);

    const catElems = categories.length > 0 ? categories.map((category, index) => {
        return <option key={index} value={category.name}>{category.name}</option>
    }) : [];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddOrUpdateRequest = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = selectedRequest
            ? `${hostNameBack}/api/v1/tradeleads/request/${selectedRequest._id}`
            : `${hostNameBack}/api/v1/tradeleads/request`;
        const method = selectedRequest ? 'put' : 'post';

        try {
            const response = await axios[method](
                url,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                enqueueSnackbar(`Request ${selectedRequest ? 'updated' : 'posted'} successfully`, { variant: 'success' });
                setShowPostRequestModel(false);
                setFormData({
                    title: '',
                    description: '',
                    category: '',
                    budget: '',
                    duration: '',
                    expiryDate: ''
                });
            } else {
                enqueueSnackbar('Something went wrong!', { variant: 'error' });
            }
        } catch (e) {
            enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
        }
        setSelectedRequest(null);
    };

    return (
        <div className="postNewRequestDiv popupDiv">
            <div className="postNewRequestContent popupContent">
                <form className="form" onSubmit={handleAddOrUpdateRequest}>
                    <div className="inputDiv">
                        <label>Title</label>
                        <input
                            type="text"
                            className="inputField"
                            name="title"
                            placeholder='Give your Tradelead, a brief title'
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="inputDiv">
                        <label>Description</label>
                        <textarea
                            type="text"
                            className="inputField"
                            name="description"
                            placeholder='Describe what you are looking for'
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="inputDiv">
                        <label>Category</label>
                        <select
                            className="inputField"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                        >
                            {catElems}
                        </select>
                    </div>
                    <div className="inputDiv">
                        <label>Budget ($)</label>
                        <input
                            type="number"
                            className="inputField"
                            name="budget"
                            placeholder='Proposed budget for the work'
                            value={formData.budget}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="inputDiv">
                        <div className="inputInnerDiv">
                            <label>Duration (in days)</label>
                            <input
                                type="number"
                                className="inputField"
                                name="duration"
                                placeholder='Proposed duration to complete the work'
                                value={formData.duration}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="inputInnerDiv">
                            <label>Expiry Date</label>
                            <input
                                type="date"
                                className="inputField"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="buttonsDiv">
                        <button className="primaryBtn" type="submit">
                            {selectedRequest ? 'Update Request' : 'Post Request'}
                        </button>
                        <button
                            className="secondaryBtn"
                            onClick={() => { setShowPostRequestModel(false); setSelectedRequest(null) }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
            <div className="closeBtn popupCloseBtn">
                <IoIosCloseCircleOutline className='icon' onClick={() => { setShowPostRequestModel(false); setSelectedRequest(null) }} />
            </div>
        </div>
    );
}