import React from 'react'

function ActiveFilters({priceRange,setPriceRange, defaultPriceRange, rating, setRating}) {

    const handleClearFilter = (filterType) => {
        if (filterType === 'price')
            setPriceRange(defaultPriceRange);
        else if (filterType === 'rating')
            setRating(null);
    };

  return (
    <div className="activeFilters">

        <p>Active Filters: </p>

        {priceRange.min !== defaultPriceRange.min || priceRange.max !== defaultPriceRange.max ? (
            <div className="filterTag">
                <span>${priceRange.min} {priceRange.max === defaultPriceRange.max? "& above" : "- $"+priceRange.max}</span>
                <button onClick={() => handleClearFilter('price')}>×</button>
            </div>
        ) : null}

        {rating !== null ? (
            <div className="filterTag">
                <span>{rating === 0? "Not Rated" : `${rating>0 && rating} stars ${rating===5? "" : "& up"}`}</span>
                <button onClick={() => handleClearFilter('rating')}>×</button>
            </div>
        ) : null}
        
    </div>
  )
}

export default ActiveFilters