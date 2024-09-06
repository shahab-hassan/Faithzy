import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { MdFavoriteBorder, MdFavorite } from "react-icons/md";

import SampleProvisions from '../../components/buyer/SampleProvisions';
import { AuthContext } from '../../utils/AuthContext';
import { addToWishlistUtil, removeFromWishlistUtil, fetchWishlistUtil } from '../../utils/utilFuncs';

function ServiceDetails() {

    const [service, setService] = useState({});
    const { id } = useParams();
    const { user, isLogin } = useContext(AuthContext);
    const [serviceThumbnail, setServiceThumbnail] = useState("");
    const [isInWishlist, setIsInWishlist] = React.useState(false);
    const packagesRef = useRef(null);
    const [joined, setJoined] = useState("");

    useEffect(() => {
        axios.get(`http://localhost:5000/api/v1/services/service/${id}`)
          .then(response => {
            const service = response.data.service;
            setService(service)
            setServiceThumbnail(service.serviceImages[0]);
            const date = new Date(service.sellerId.createdAt);
            const monthName = date.toLocaleString('default', { month: 'long' });
            setJoined(`${monthName}, ${date.getFullYear()}`);
          })
          .catch(console.log);
    
        if (isLogin) {
          const token = localStorage.getItem('token');
          axios.post('http://localhost:5000/api/v1/services/user/recentlyViewed/', 
            { serviceId: id }, 
            { headers: { Authorization: `Bearer ${token}` } }
          )
            .catch(console.log);
        }
    
        async function checkWishlist() {
          const wishlist = await fetchWishlistUtil(user);
          if (wishlist) {
            let isServiceInWishlist = false;
            wishlist.services.forEach(service => {
              if (service._id === id) isServiceInWishlist = true;
            });
            setIsInWishlist(isServiceInWishlist);
          }
        }
        checkWishlist();
    
      }, [id, isLogin, user]);

    const handleWishlistClick = async (e) => {
        if (isInWishlist) {
          await removeFromWishlistUtil(e, id, "service", user);
          setIsInWishlist(false);
        } else {
          await addToWishlistUtil(e, id, "service", user);
          setIsInWishlist(true);
        }
    };

    const handleCheckPackagesClick = () => {
        packagesRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    const galleryImages = service.serviceImages? service.serviceImages.map((image, index)=> {
        return <img 
                  key={index} 
                  src={`http://localhost:5000/${image}`} 
                  alt="Error" 
                  onClick={()=>setServiceThumbnail(image)}
                  style={serviceThumbnail === image? {borderColor: "var(--primaryCopper)"} : {borderColor: "transparent"}}
                />
      }) 
      : <p>Loading...</p>;

    const packageElems = service && service.packages && service.packages.map((name, index)=>{
        const crrPackage = service.packages[index];
        return <div className="packageBox" key={index}>
            <div className={"upper " + name.name}>{name.name}</div>
            <div className="horizontalLine"></div>
            <div className="lower">
                <div className="title">{crrPackage.title}</div>
                <div className="description">{crrPackage.description}</div>
                <div className="info">
                    <p>{crrPackage.deliveryDays} days Delivery</p>
                    <div className="priceDetails">
                        {Number(service.discountPercent) !== 0 && <div className="discount">${crrPackage.price}</div>}
                        <div className="price">${crrPackage.salesPrice}</div>
                    </div>
                </div>
                <Link to={`/checkout?s=${index}_${service._id}`} className="primaryBtn">{"Continue >"}</Link>
            </div>
        </div>
    })

    if(!service || !service.packages)
        return <div>Loading...</div> ;

  return (
    <div className='serviceDetailsDiv'>
        <section className="section">
            <div className="serviceDetailsContent">

                <div className="serviceInfo">

                    <div className="serviceImages">
                        {<img className='serviceThumbnail' src={`http://localhost:5000/${serviceThumbnail}`} alt="Error" />}
                        <div className="serviceGalleryDiv">
                            {galleryImages}
                        </div>
                    </div>

                    <div className="info">

                        <div className='ratingsDiv'>
                            <FaStar className='starIconFilled' />
                            <span>{`${service.rating.toFixed(1)} (${service.noOfReviews} users feedback)`}</span>
                        </div>

                        <p className="title">{service.title}</p>

                        <div className="sellerInfo">
                            <img src={service.sellerId && `http://localhost:5000/${service.sellerId.profileImage}`} alt="Error" />
                            <Link to={`/profile/${service?.sellerId?._id}`}>{service && service.sellerId && service.sellerId.userId?.username + " >"}</Link>
                        </div>

                        <Link to={`/services/${service.category}`} className='category'>{service.category + " >"}</Link>                        

                        <div className="servicePrice">
                            <p>From</p>
                            <strong className='salesPrice'>${service.packages[0].salesPrice}</strong>
                            {Number(service.discountPercent) !== 0 && <>
                                <p className='price'>${service.packages[0].price}</p>
                                <p className='off'>{`${service.discountPercent}% OFF`}</p>
                            </>}
                        </div>

                        <div className="serviceActions">
                            <div className="addToWishlistBtn" onClick={(e) => handleWishlistClick(e)}>
                                {isInWishlist ? <MdFavorite /> : <MdFavoriteBorder />}
                                <p>{isInWishlist ? "REMOVE FROM WISHLIST" : "ADD TO WISHLIST"}</p>
                            </div>
                            <div className='moreActions'>
                                <button className="contactSellerBtn primaryBtn2" onClick={handleCheckPackagesClick}>Check Packages</button>
                                <Link className='buyNowBtn primaryBtn' to={`/chat?p=${service.sellerId.userId._id}`}>
                                    <p>{"Contact Me >"}</p>
                                    {/* <i className="fa-solid fa-arrow-right"></i> */}
                                </Link>
                            </div>
                        </div>

                    </div>

                </div>

                <div className="packages" ref={packagesRef}>
                    {packageElems}
                </div>

                <div className="aboutService">
                    <h1 className="primaryHeading"><span>About</span> Service</h1>
                    <div className="horizontalLine"></div>
                    <p className='about'>{service.description}</p>
                </div>

                <div className="aboutSeller">

                    <div className="upper">
                        <div className="sellerProfile">
                            <div className="imgDiv">
                                <img src={`http://localhost:5000/${service.sellerId.profileImage}`} alt="Error" />
                            </div>
                            <div className="profileInfo">
                                <h4>{service.sellerId.fullName}</h4>
                                <div className='ratingsDiv'>
                                    <FaStar className='starIconFilled' />
                                    <span>{`${"4.7"} (${"178"})`}</span>
                                </div>
                                <Link to={`/profile/${service?.sellerId?._id}`} className='username'>@{service.sellerId.userId.username + " >"}</Link>
                            </div>
                        </div>
                        <div className="sellerInfo">
                            <div className="col">
                                <p>Country</p>
                                <h4>{service.sellerId.country}</h4>
                            </div>
                            <div className="col">
                                <p>Joined</p>
                                <h4>{joined}</h4>
                            </div>
                            <div className="col">
                                <p>Orders Completed</p>
                                <h4>0</h4>
                            </div>
                            <div className="col">
                                <p>Languages</p>
                                <h4>{service.sellerId.languages}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="horizontalLine"></div>

                    <p className='about'>{service.sellerId.description}</p>

                </div>

                <SampleProvisions pre="related" openedService={service} />
                        
            </div>
        </section>
    </div>
  )
}

export default ServiceDetails