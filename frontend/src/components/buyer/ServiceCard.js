import React from 'react'
import { Link } from "react-router-dom"
import { FaStar } from "react-icons/fa";
import { addToWishlistUtil, removeFromWishlistUtil, fetchWishlistUtil } from '../../utils/utilFuncs';
import { AuthContext } from '../../utils/AuthContext';
import { MdFavoriteBorder, MdFavorite } from "react-icons/md";

function ServiceCard({ item }) {

    const { user, isLogin } = React.useContext(AuthContext);
    const [isInWishlist, setIsInWishlist] = React.useState(false);

    React.useEffect(() => {
        async function checkWishlist() {
            const wishlist = await fetchWishlistUtil(user);
            if (wishlist) {
                let isServiceInWishlist = false;
                wishlist.services.forEach(service => {
                    if (service._id === item._id)
                        isServiceInWishlist = true;
                });
                setIsInWishlist(isServiceInWishlist);
            }
        }
        checkWishlist();
    }, [user, item._id]);

    const handleWishlistClick = async (e) => {
        if (isInWishlist) {
            await removeFromWishlistUtil(e, item._id, "service", user);
            setIsInWishlist(false);
        } else {
            await addToWishlistUtil(e, item._id, "service", user);
            setIsInWishlist(true);
        }
    };

    return (
        <Link
            to={`/postingDetails/${item._id}`}
            className="service"
        >
            <div className="serviceContent">
                <div className="serviceImgDiv">
                    {item.serviceImages && <img src={`http://localhost:5000/${item.serviceImages[0]}`} alt="Error" />}
                </div>
                <h2 className='serviceTitle'>{item.title}</h2>
                <div className="serviceLower">
                    <div className='serviceLowerTop'>
                        <FaStar className='starIconFilled' />
                        <p>{item.rating.toFixed(1)}</p><span>({item.noOfReviews})</span>
                    </div>
                    <div className="serviceLowerBottom">
                        {/* {item.discountPercent !== 0 && <p className='serviceDiscount'>{`$${item.price}`}</p>} */}
                        <p>From</p>
                        {item.packages && <h1 className="servicePrice">{`$${item.discountPercent === 0 ? item.packages[0].price : item.packages[0].salesPrice}`}</h1>}
                    </div>
                </div>
                {isLogin && <div className="hoverActions">
                    <div className="iconDiv" onClick={(e) => handleWishlistClick(e)}>
                        {isInWishlist ? <MdFavorite /> : <MdFavoriteBorder />}
                    </div>
                </div>}
            </div>
        </Link>
    )
}

export default ServiceCard