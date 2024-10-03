import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

const LeaveReview = ({ orderId, serviceId, sellerId, isBuyer }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [comment, setComment] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [existingReview, setExistingReview] = useState(null);
    const [reply, setReply] = useState('');
    const token = localStorage.getItem("token");

    useEffect(() => {
        axios.get(`http://localhost:5000/api/v1/reviews/order/service/${sellerId}/${orderId}`, { headers: { Authorization: `Bearer ${token}` } })
            .then((response) => {
                if (response.data.review) {
                    setExistingReview(response.data.review);
                    setReviewSubmitted(true);
                }
            })
            .catch((error) => {
                console.error('Error fetching review:', error);
            });
    }, [token, sellerId, orderId]);

    const handleRatingSubmit = () => {
        if (!rating || comment.trim().length < 1) {
            enqueueSnackbar('Please provide a rating and a comment!', { variant: 'error' });
            return;
        }

        const reviewData = {
            rating,
            comment,
            serviceId,
            sellerId,
            orderId
        };

        axios.post(`http://localhost:5000/api/v1/reviews/service/new`, reviewData, { headers: { Authorization: `Bearer ${token}` } })
            .then((response) => {
                enqueueSnackbar('Review submitted successfully!', { variant: 'success' });
                setExistingReview(response.data.review);
                setReviewSubmitted(true);
            })
            .catch((e) => {
                console.log(e);
                enqueueSnackbar('Error submitting review', { variant: 'error' });
            });
    };

    const handleReplySubmit = () => {
        axios.put(`http://localhost:5000/api/v1/reviews/review/service/reply/${orderId}`, { reply }, { headers: { Authorization: `Bearer ${token}` } })
            .then((response) => {
                enqueueSnackbar('Reply added successfully!', { variant: 'success' });
                setExistingReview(response.data.updatedReview);
            })
            .catch((e) => {
                console.log(e);
                enqueueSnackbar('Error submitting reply', { variant: 'error' });
            });
    };

    console.log()

    return (
        <div className="leaveReviewDiv">

            {isBuyer && !reviewSubmitted && (
                <div className="leaveReviewContent">

                    <h2 className="secondaryHeading">Leave a <span>Review</span></h2>
                    <div className="starsDiv">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <FaStar
                                    key={index}
                                    size={35}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(null)}
                                    onClick={() => setRating(ratingValue)}
                                    color={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
                                    style={{ cursor: "pointer" }}
                                    className="star"
                                />
                            );
                        })}
                    </div>
                    <div className="form">
                        <textarea
                            placeholder="Leave a comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className='inputField'
                        />
                        <button onClick={handleRatingSubmit} className='primaryBtn'>Submit</button>
                    </div>

                    <div className="horizontalLine"></div>

                </div>
            )}

            {isBuyer && reviewSubmitted && (
                <div className="leaveReviewContent">

                    <h2 className="secondaryHeading">Your <span>Review</span></h2>
                    <div className="starsDiv">
                        {[...Array(5)].map((_, index) => (
                            <FaStar
                                key={index}
                                size={35}
                                color={index + 1 <= existingReview.rating ? '#ffc107' : '#e4e5e9'}
                                className='star'
                            />
                        ))}
                    </div>
                    <p>{existingReview.comment}</p>
                    {existingReview.reply && <div className='sellerReply'>
                        <h2 className='secondaryHeading'>Seller <span>Response</span></h2>
                        <p>{existingReview.reply}</p>
                    </div>
                    }

                    <div className="horizontalLine"></div>

                </div>
            )}

            {!isBuyer && existingReview && (
                <div className="leaveReviewContent">

                    <h2 className="secondaryHeading">Buyer <span>Review</span></h2>
                    <div className="starsDiv">
                        {[...Array(5)].map((_, index) => (
                            <FaStar
                                key={index}
                                size={35}
                                color={index + 1 <= existingReview.rating ? '#ffc107' : '#e4e5e9'}
                                className='star'
                            />
                        ))}
                    </div>
                    <p>{existingReview.comment}</p>

                    {!existingReview.reply ? <div className='sellerReply form'> <h2 className='secondaryHeading'>Reply to <span>Review</span></h2>
                        <textarea
                            placeholder="Leave a reply"
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            className='inputField'
                        />
                        <button onClick={handleReplySubmit} className='secondaryBtn'>Submit Reply</button>
                    </div> :

                        <div className='sellerReply'> <h2 className='secondaryHeading'>Your <span>Reply</span></h2>
                            <p>{existingReview.reply}</p>
                        </div>
                    }

                    <div className="horizontalLine"></div>

                </div>
            )}

        </div>
    );
};

export default LeaveReview;