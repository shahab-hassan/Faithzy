import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ServiceCard from '../../components/buyer/ServiceCard';
import PriceFilter from '../../components/buyer/Filters/PriceFilter';
import RatingFilter from '../../components/buyer/Filters/RatingFilter';
import Pagination from '../../components/common/Pagination';
import CategoryFilter from '../../components/buyer/Filters/CategoryFilter';
import ActiveFilters from '../../components/buyer/Filters/ActiveFilters';

function Services() {

    const [searchParams] = useSearchParams();
    const categoryName = searchParams.get('category') || '';
    const [services, setServices] = useState([]);

    const defaultPriceRange = {min: 0, max: 1000000};
    const [priceRange, setPriceRange] = useState(defaultPriceRange);
    const [rating, setRating] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalServices, setTotalServices] = useState(0);

    const searchQuery = searchParams.get('search') || '';

    // useEffect(() => {
        
    //     const fetchServices = async () => {
    //         try {
    //             const response = await axios.get(`http://localhost:5000/api/v1/services/category/all/${categoryName}`, {
    //                 params: {
    //                     minPrice: priceRange.min,
    //                     maxPrice: priceRange.max,
    //                     rating,
    //                     page,
    //                 },
    //             });
    //             if (response.data.success) {
    //                 setServices(response.data.services);
    //                 setTotalPages(response.data.totalPages);
    //                 setTotalServices(response.data.totalServices)
    //             } 
    //             else
    //                 enqueueSnackbar("Something went wrong!", { variant: "error" });
    //         } catch (e) {
    //             console.log(e);
    //             enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" });
    //         }
    //     };


    //     fetchServices();
    // }, [categoryName, rating, page, priceRange]);


    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/v1/services/results/all/`, {
                    params: {
                        category: categoryName,
                        search: searchQuery,
                        minPrice: priceRange.min,
                        maxPrice: priceRange.max,
                        rating,
                        page,
                    },
                });

                if (response.data.success) {
                    setServices(response.data.services);
                    setTotalPages(response.data.totalPages);
                    setTotalServices(response.data.totalServices);
                } else {
                    enqueueSnackbar("Something went wrong!", { variant: "error" });
                }
            } catch (e) {
                console.log(e);
                enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" });
            }
        };

        fetchServices();
    }, [categoryName, rating, page, priceRange, searchQuery]);


    let serviceElems = services.map(service => <ServiceCard key={service._id} item={service} />);



    return (
        <div className='servicesDiv'>
            <section className="section">
                <div className="servicesContent">

                    <div className="left filters">

                        <CategoryFilter isProduct={false} categoryName={categoryName} />

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


                        <p className='resultsFound'><span>{totalServices}</span> results found</p>

                        <div className="horizontalLine"></div>

                        <div className="services">
                            {serviceElems.length > 0 ? serviceElems : "Nothing to show here!"}
                        </div>

                        {totalServices>0 && <Pagination pages={totalPages} crrPage={page} setCrrPage={setPage} />}
                        
                    </div>
                    

                </div>
            </section>
        </div>
    );
}

export default Services;
