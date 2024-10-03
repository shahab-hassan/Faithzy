import React from 'react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import RequestDetails from '../../components/common/RequestDetails';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { hostNameBack } from '../../utils/constants';

function Tradelead() {
    const [buyerRequests, setBuyerRequests] = React.useState([]);
    const [showDetailsModel, setShowDetailsModel] = React.useState(null);
    const [showMakeOfferModel, setShowMakeOfferModel] = React.useState(null);
    const [sellerOffers, setSellerOffers] = React.useState([]);

    const fetchBuyerRequests = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(`${hostNameBack}/api/v1/tradeleads/requests/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBuyerRequests(response.data.requests);
        } catch (e) {
            enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" });
        }
    };

    const fetchSellerOffers = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(`${hostNameBack}/api/v1/tradeleads/myOffers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSellerOffers(response.data.offers);
        } catch (e) {
            enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" });
        }
    };

    React.useEffect(() => {
        fetchBuyerRequests();
        fetchSellerOffers();
    }, []);

    const handleMakeOfferClick = (request) => {
        const existingOffer = sellerOffers.find(offer => offer.requestId === request._id);
        if (existingOffer) {
            setShowMakeOfferModel({ ...request, offer: existingOffer });
        } else {
            setShowMakeOfferModel(request);
        }
    };

    const requestElems = buyerRequests.length > 0 ? buyerRequests.map((request, index) => {
        const existingOffer = sellerOffers.find(offer => offer.requestId === request._id);
        return (
            <div key={index}>
                <div className="row">
                    <div className="field titleField"><p className='title'>{request.title}</p></div>
                    <p className="field priceField">${request.budget}</p>
                    <p className="field durationField">{request.duration} days</p>
                    <p className="field postedAtField">{new Date(request.createdAt).toLocaleDateString()}</p>
                    <p className="field expiringAtField">{new Date(request.expiryDate).toLocaleDateString()}</p>
                    <div className="field actionsField">
                        <button className="secondaryBtn" onClick={() => handleMakeOfferClick(request)}>
                            {existingOffer ? "Edit Offer" : "Make Offer"}
                        </button>
                        <button className="secondaryBtn" onClick={() => setShowDetailsModel(request)}>{"Details >"}</button>
                    </div>
                </div>
                {(buyerRequests.length > 1 && buyerRequests.length - 1 !== index) && <div className="horizontalLine"></div>}
            </div>
        );
    }) : <div className="row">Nothing to show here...</div>;

    return (
        <div className='tradeleadDiv tableDiv'>
            <section className="section">
                <div className="tradeleadContent tableContent">
                    <div className="upper">
                        <h2 className="secondaryHeading">Buyer <span>Requests</span></h2>
                    </div>
                    <div className="header">
                        <p className='title'>Request</p>
                        <p>Budget</p>
                        <p>Duration</p>
                        <p>Posted At</p>
                        <p>Expiring At</p>
                        <p>Actions</p>
                    </div>
                    <div className="tradeleadRows rows">{requestElems}</div>
                </div>
            </section>
            {showDetailsModel && <RequestDetails showDetailsModel={showDetailsModel} setShowDetailsModel={setShowDetailsModel} />}
            {showMakeOfferModel && <MakeOfferModel showMakeOfferModel={showMakeOfferModel} setShowMakeOfferModel={setShowMakeOfferModel} fetchSellerOffers={fetchSellerOffers} />}
        </div>
    );
}

export default Tradelead;

function MakeOfferModel({ showMakeOfferModel, setShowMakeOfferModel, fetchSellerOffers }) {
    const { _id: requestId, offer } = showMakeOfferModel || {};
    const [formData, setFormData] = React.useState({
        coverLetter: "",
        price: 0,
        duration: 0
    });
    const token = localStorage.getItem("token");

    React.useEffect(() => {
        if (offer) {
            setFormData(offer);
        }
    }, [showMakeOfferModel, offer]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const url = offer
            ? `${hostNameBack}/api/v1/tradeleads/offer/${requestId}/${offer._id}`
            : `${hostNameBack}/api/v1/tradeleads/offer/${requestId}`;
        const method = offer ? 'put' : 'post';
        await axios[method](url, formData, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => {
                enqueueSnackbar(response.data.message, { variant: 'success' });
                setShowMakeOfferModel(null);
                fetchSellerOffers(); // Refresh seller offers after making/updating an offer
            })
            .catch(error => {
                enqueueSnackbar(error.response.data.error || "Something went wrong!", { variant: 'error' });
            });
    };

    const handleWithdrawOffer = async () => {
        await axios.delete(`${hostNameBack}/api/v1/tradeleads/offer/${requestId}/${offer._id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => {
                enqueueSnackbar(response.data.message, { variant: 'success' });
                setShowMakeOfferModel(null);
                fetchSellerOffers(); // Refresh seller offers after deleting an offer
            })
            .catch(error => {
                enqueueSnackbar(error.response.data.error || "Something went wrong!", { variant: 'error' });
            });
    };

    return (
        <div className='makeOfferModelDiv popupDiv'>
            <div className="makeOfferModelContent popupContent">
                <form className="form" onSubmit={handleFormSubmit}>
                    <h2 className="secondaryHeading"><span>{offer? "Edit": "Make"}</span> Offer</h2>
                    <div className="horizontalLine"></div>
                    <div className="inputDiv">
                        <label>Cover Letter</label>
                        <textarea className='inputField' name='coverLetter' placeholder='Enter your offer details' value={formData.coverLetter} onChange={handleInputChange} />
                    </div>
                    <div className="inputDiv">
                        <label>Price ($)</label>
                        <input type='Number' className='inputField' name='price' placeholder='Enter your price offer' value={formData.price} onChange={handleInputChange} />
                    </div>
                    <div className="inputDiv">
                        <label>Duration (in days)</label>
                        <input type='Number' className='inputField' name='duration' placeholder='Enter Duration' value={formData.duration} onChange={handleInputChange} />
                    </div>
                    <div className="buttonsDiv">
                        <button type='submit' className='primaryBtn'>{offer ? 'Update' : 'Send'}</button>
                        {offer && <button type='button' className='dangerBtn' onClick={handleWithdrawOffer}>Withdraw Offer</button>}
                        <button className='secondaryBtn' onClick={() => setShowMakeOfferModel(null)}>Close</button>
                    </div>
                </form>
            </div>
            <div className="popupCloseBtn">
                <IoIosCloseCircleOutline className='icon' onClick={() => setShowMakeOfferModel(null)} />
            </div>
        </div>
    );
}