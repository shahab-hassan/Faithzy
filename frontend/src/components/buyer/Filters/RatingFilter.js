import React from 'react';
import { FaStar, FaRegStar } from "react-icons/fa";

function RatingFilter({ rating, setRating }) {

    const ratings = [5, 4, 3, 2, 1, 0];

    const filledStars = (stars)=>{
        return [...Array(stars)].map((_, index) => <FaStar key={index} className='starIconFilled' />);
    }
    const unFilledStars = (stars)=>{
        return [...Array(5 - stars)].map((_, index) => <FaRegStar key={index} className='starIcon' />)
    }

    return (
        <div className="ratingFilter filter">
            <h2 className="secondaryHeading">RATINGS</h2>

            {ratings.map((stars, index) => (
                <label 
                    key={index} 
                    className={`rating row ${rating === stars ? 'active' : ''}`}
                    onClick={() => setRating(stars)}
                >
                    <input 
                        type="radio" 
                        name="rating" 
                        checked={rating === stars}
                        readOnly
                    /> 
                    {stars>0 && filledStars(stars)} 
                    {stars>0 && unFilledStars(stars)} 
                    {stars>0 && <p className='up'>{stars < 5 && '& up'}</p>}
                    {stars === 0 && "Not Rated"}
                </label>
            ))}

        </div>
    );
}

export default RatingFilter;
