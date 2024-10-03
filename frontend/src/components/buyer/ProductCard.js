import React, { useContext, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { addToWishlistUtil, removeFromWishlistUtil, fetchWishlistUtil, fetchCartUtil, removeFromCartUtil, addToCartUtil } from '../../utils/utilFuncs';
import { AuthContext } from '../../utils/AuthContext';
import { MdFavoriteBorder, MdFavorite } from "react-icons/md";
import { BsCartPlus, BsFillCartCheckFill } from "react-icons/bs";
import { hostNameBack } from '../../utils/constants';

function ProductCard({ item }) {
  const { user, isLogin } = useContext(AuthContext);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {

    async function checkWishlist() {
      const wishlist = await fetchWishlistUtil(user);
      if (wishlist) {
        let isProductInWishlist = false;
        wishlist.products.forEach(product => {
            if(product._id === item._id)
                isProductInWishlist = true;
          });
        setIsInWishlist(isProductInWishlist);
      }
    }

    async function checkCart() {
      const cart = await fetchCartUtil(user);
      if (cart) {
        let isProductInCart = false;
        cart.products.forEach(p => {
            if(p.product._id === item._id)
                isProductInCart = true;
          });
        setIsInCart(isProductInCart);
      }
    }

    checkWishlist();
    checkCart();

  }, [user, item._id]);

  const handleWishlistClick = async (e) => {
    if (isInWishlist) {
      const success = await removeFromWishlistUtil(e, item._id, "product", user);
      if (success) setIsInWishlist(false);
    } else {
      const success = await addToWishlistUtil(e, item._id, "product", user);
      if (success) setIsInWishlist(true);
    }
  };

  const handleCartClick = async (e) => {
    if (isInCart) {
      const success = await removeFromCartUtil(e, item._id, 1, user);
      if (success) setIsInCart(false);
    } else {
      const success = await addToCartUtil(e, item._id, 1, user);
      if (success) setIsInCart(true);
    }
  };

  return (
    <Link 
      to={`/productDetails/${item._id}`}
      className="product"
    >
      <div className="productContent">
        <div className="productImgDiv">
          {item.productImages && <img src={`${hostNameBack}/${item.productImages[0]}`} alt="Error" />}
        </div>
        <h2 className='productTitle'>{item.title}</h2>
        <div className="productLower">
          <div className='productLowerTop'>
            <FaStar className='starIconFilled' />
            <p>{item?.rating?.toFixed(1)}</p><span>({item.noOfReviews})</span>
            <p>- {item.sold}</p><span>sold</span>
          </div>
          <div className="productLowerBottom">
            {item.discountPercent !== 0 && <p className='productDiscount'>{`$${item.price}`}</p>}
            <h1 className="productPrice">{`$${item.discountPercent === 0 ? item.price : item.salesPrice}`}</h1>
          </div>
        </div>
        {isLogin && <div className="hoverActions">
          <div className="cartIconDiv iconDiv" onClick={(e) => handleCartClick(e)}>
            {isInCart ? <BsFillCartCheckFill /> : <BsCartPlus />}
          </div>
          <div className="wishlistIconDiv iconDiv" onClick={(e)=> handleWishlistClick(e)}>
            {isInWishlist ? <MdFavorite /> : <MdFavoriteBorder />}
          </div>
        </div>}
      </div>
    </Link>
  );
}

export default ProductCard;
