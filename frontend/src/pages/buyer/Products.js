import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../../components/buyer/ProductCard';
import PriceFilter from '../../components/buyer/Filters/PriceFilter';
import RatingFilter from '../../components/buyer/Filters/RatingFilter';
import Pagination from '../../components/common/Pagination';
import CategoryFilter from '../../components/buyer/Filters/CategoryFilter';
import ActiveFilters from '../../components/buyer/Filters/ActiveFilters';

function Products() {

    const { categoryName } = useParams();
    const [products, setProducts] = useState([]);

    const defaultPriceRange = {min: 0, max: 1000000};
    const [priceRange, setPriceRange] = useState(defaultPriceRange);
    const [rating, setRating] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    useEffect(() => {
        
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/v1/products/category/all/${categoryName}`, {
                    params: {
                        minPrice: priceRange.min,
                        maxPrice: priceRange.max,
                        rating,
                        page,
                    },
                });
                if (response.data.success) {
                    setProducts(response.data.products);
                    setTotalPages(response.data.totalPages);
                    setTotalProducts(response.data.totalProducts)
                } 
                else
                    enqueueSnackbar("Something went wrong!", { variant: "error" });
            } catch (e) {
                console.log(e);
                enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" });
            }
        };


        fetchProducts();
    }, [categoryName, rating, page, priceRange]);

    let productElems = products.map(product => <ProductCard key={product._id} item={product} />);

    return (
        <div className='productsDiv'>
            <section className="section">
                <div className="productsContent">

                    <div className="left filters">

                        <CategoryFilter isProduct={true} categoryName={categoryName} />

                        <div className="horizontalLine"></div>

                        <PriceFilter priceRange={priceRange} setPriceRange={setPriceRange} />

                        <div className="horizontalLine"></div>
                        
                        <RatingFilter rating={rating} setRating={setRating} />

                    </div>

                    <div className="right">

                        {!((priceRange.min === defaultPriceRange.min && priceRange.max === defaultPriceRange.max) && rating === null) && 

                            <>
                                <ActiveFilters priceRange={priceRange} setPriceRange={setPriceRange} defaultPriceRange={defaultPriceRange} rating={rating} setRating={setRating} />
                                
                                <div className="horizontalLine"></div>
                            </>
                        }


                        <p className='resultsFound'><span>{totalProducts}</span> results found</p>

                        <div className="horizontalLine"></div>

                        <div className="products">
                            {productElems.length > 0 ? productElems : "Nothing to show here!"}
                        </div>

                        {totalProducts>0 && <Pagination pages={totalPages} crrPage={page} setCrrPage={setPage} />}
                        
                    </div>

                </div>
            </section>
        </div>
    );
}

export default Products;
