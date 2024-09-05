import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

const LeaveReview = ({ subOrderId, productId, sellerId, isBuyer }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [comment, setComment] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [existingReview, setExistingReview] = useState(null);
    const [reply, setReply] = useState('');

    useEffect(() => {
        axios.get(`/api/review/${productId}/${sellerId}`)
            .then((response) => {
                if (response.data.review) {
                    setExistingReview(response.data.review);
                    setReviewSubmitted(true);
                }
            })
            .catch((error) => {
                console.error('Error fetching review:', error);
            });
    }, [productId, sellerId]);

    const handleRatingSubmit = () => {
        if (!rating || comment.trim().length < 1) {
            enqueueSnackbar('Please provide a rating and a comment!', { variant: 'error' });
            return;
        }

        const reviewData = {
            rating,
            comment,
            productId,
            sellerId,
            subOrderId
        };

        axios.post(`/api/review`, reviewData)
            .then((response) => {
                enqueueSnackbar('Review submitted successfully!', { variant: 'success' });
                setExistingReview(response.data.review);
                setReviewSubmitted(true);
            })
            .catch((error) => {
                enqueueSnackbar('Error submitting review', { variant: 'error' });
            });
    };

    const handleReplySubmit = () => {
        axios.put(`/api/review/reply/${existingReview._id}`, { reply })
            .then((response) => {
                enqueueSnackbar('Reply added successfully!', { variant: 'success' });
                setExistingReview(response.data.updatedReview);
            })
            .catch((error) => {
                enqueueSnackbar('Error submitting reply', { variant: 'error' });
            });
    };

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
                                    size={30}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(null)}
                                    onClick={() => setRating(ratingValue)}
                                    color={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
                                    className="star"
                                />
                            );
                        })}
                    </div>
                    <textarea
                        placeholder="Leave a comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <button onClick={handleRatingSubmit} className='primaryBtn'>
                        Submit
                    </button>

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
                                size={30}
                                color={index + 1 <= existingReview.rating ? '#ffc107' : '#e4e5e9'}
                            />
                        ))}
                    </div>
                    <p>{existingReview.comment}</p>

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
                                size={30}
                                color={index + 1 <= existingReview.rating ? '#ffc107' : '#e4e5e9'}
                            />
                        ))}
                    </div>
                    <p>{existingReview.comment}</p>

                    <h2>Reply to Review</h2>
                    <textarea
                        placeholder="Leave a reply"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                    />
                    <button onClick={handleReplySubmit} className='secondaryBtn'>
                        Submit Reply
                    </button>

                    <div className="horizontalLine"></div>

                </div>
            )}
        </div>
    );
};

export default LeaveReview;
