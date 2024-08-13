import React from 'react';

function PriceFilter({ priceRange, setPriceRange }) {

    const ranges = [
        { min: 0, max: 25, label: "Upto $25" },
        { min: 25, max: 100, label: "$25 to $100" },
        { min: 100, max: 300, label: "$100 to $300" },
        { min: 300, max: 500, label: "$300 to $500" },
        { min: 500, max: 1000, label: "$500 to $1000" },
        { min: 1000, max: 1000000, label: "$1000 and above" }
    ];

    return (
        <div className="priceFilter filter">
            <h2 className="secondaryHeading">PRICE</h2>

            {ranges.map((range, index) => (
                <label 
                    key={index} 
                    className={`row ${priceRange.min === range.min && priceRange.max === range.max ? 'active' : ''}`}
                    onClick={() => setPriceRange(range)}
                >
                    <input 
                        type="radio" 
                        name="price"
                        checked={priceRange.min === range.min && priceRange.max === range.max}
                        readOnly
                    /> 
                    {range.label}
                </label>
            ))}

        </div>
    );
}

export default PriceFilter;
