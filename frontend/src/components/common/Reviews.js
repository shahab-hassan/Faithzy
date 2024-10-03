import React, { useState } from 'react'
import { FaStar } from "react-icons/fa";
import axios from 'axios';
import { hostNameBack } from '../../utils/constants';

function Reviews({ type, id }) {


    const token = localStorage.getItem("token");
    const [rating, setRating] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);


    React.useEffect(() => {
        axios.get(`${hostNameBack}/api/v1/reviews/${type}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then((response) => {
                if (response.data.success) {
                    setRating(response.data.rating)
                    setReviews(response.data.reviews)
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.error('Error fetching review:', error);
                setLoading(false);
            });
    }, [token, type, id]);


    const formatDateTime = (date) => {
        const options = { month: 'short', day: 'numeric', year: "numeric" };
        return new Date(date).toLocaleDateString(undefined, options);
    };
    

    if (loading) return <div>Loading reviews...</div>;

    return (
        <div className='reviewDiv'>
            {reviews.length>0? <div className="reviewsContent">

                <div className="ratings">
                    <div>
                        <FaStar size={35} color='#ffc107' />
                        <h1>{rating?.toFixed(1)}</h1>
                    </div>
                    <span>{(reviews.length < 10 && "0") + reviews.length} Review{reviews.length > 1 && "s"}</span>
                </div>

                <div className="userReviews">
                    {reviews.map((review, index) => (
                        <><div className="userReview" key={review._id}>
                            <div className="upper">
                                <div className="aboutUser">
                                    <div className="userProfileImgDiv">
                                        <img src={review?.userId?.sellerId?.profileImage? `${hostNameBack}/${review?.userId?.sellerId?.profileImage}` : "/assets/images/seller.png"} alt="Error" />
                                    </div>
                                    <div className='userInfo'>
                                        <div className='fw600'>{review.userId.username}</div>
                                        <div className="starsDiv">
                                            {[...Array(5)].map((_, index) => (
                                                <FaStar
                                                    key={index}
                                                    size={15}
                                                    color={index + 1 <= review.rating ? '#ffc107' : '#e4e5e9'}
                                                    className='star'
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="date">{formatDateTime(review.createdAt)}</div>
                            </div>
                            <div className="userComment">{review.comment}</div>
                            {review.reply && (
                                <div className="sellerResponse">
                                    <h2 className='secondaryHeading'>Seller <span>Response</span></h2>
                                    <p>{review.reply}</p>
                                </div>
                            )}
                        </div>
                            {reviews.length > 1 && (index !== reviews.length - 1) && <div className="horizontalLine"></div>}
                        </>
                    ))}
                </div>
            </div> : <div>No Reviews yet!</div>}
        </div>
    )
}

export default Reviews