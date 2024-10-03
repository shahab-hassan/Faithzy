import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { MdFavoriteBorder, MdFavorite } from "react-icons/md";

import SampleProvisions from "../../components/buyer/SampleProvisions";
import { AuthContext } from '../../utils/AuthContext';
import { addToWishlistUtil, removeFromWishlistUtil, fetchWishlistUtil, formatDate } from '../../utils/utilFuncs';
import { addToCartUtil, removeFromCartUtil, fetchCartUtil } from '../../utils/utilFuncs';
import Reviews from '../../components/common/Reviews';
import { hostNameBack } from '../../utils/constants';

function ProductDetails() {

  const [product, setProduct] = useState({});
  const { id } = useParams();
  const { user, isLogin } = useContext(AuthContext);
  const [productThumbnail, setProductThumbnail] = useState("");
  const [cartCount, setCartCount] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isShowDescription, setIsShowDescription] = useState(true);

  useEffect(() => {
    axios.get(`${hostNameBack}/api/v1/products/product/${id}`)
      .then(response => {
        setProduct(response.data.product)
        setProductThumbnail(response.data.product.productImages[0]);
      })
      .catch(console.log);

    if (isLogin) {
      const token = localStorage.getItem('token');
      axios.post(`${hostNameBack}/api/v1/products/user/recentlyViewed/`,
        { productId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .catch(console.log);
    }

    async function checkWishlist() {
      const wishlist = await fetchWishlistUtil(user);
      if (wishlist) {
        let isProductInWishlist = false;
        wishlist.products.forEach(product => {
          if (product._id === id) isProductInWishlist = true;
        });
        setIsInWishlist(isProductInWishlist);
      }
    }
    async function checkCart() {
      const cart = await fetchCartUtil(user);
      if (cart) {
        let isProductInCart = false;
        cart.products.forEach(item => {
          if (item.product._id === id) {
            isProductInCart = true;
            setCartCount(item.count);
          }
        });
        setIsInCart(isProductInCart);
      }
    }
    checkCart();
    checkWishlist();

  }, [id, isLogin, user]);

  const handleWishlistClick = async (e) => {
    if (isInWishlist) {
      await removeFromWishlistUtil(e, id, "product", user);
      setIsInWishlist(false);
    } else {
      await addToWishlistUtil(e, id, "product", user);
      setIsInWishlist(true);
    }
  };

  const handleCartClick = async (e) => {
    if (isInCart) {
      await removeFromCartUtil(e, id, cartCount, user);
      setIsInCart(false);
    } else {
      await addToCartUtil(e, id, cartCount, user);
      setIsInCart(true);
    }
  }

  const galleryImages = product.productImages ? product.productImages.map((image, index) => {
    return <img
      key={index}
      src={`${hostNameBack}/${image}`}
      alt="Error"
      onClick={() => setProductThumbnail(image)}
      style={productThumbnail === image ? { borderColor: "var(--primaryCopper)" } : { borderColor: "transparent" }}
    />
  })
    : <p>Loading...</p>;

  return (
    <div className='productDetailsDiv'>
      <section className="section">
        <div className="productDetailsContent">

          <div className="upper">

            <div className="upperLeft">

              {product.productImages && <img className='productThumbnail' src={`${hostNameBack}/${productThumbnail}`} alt="Error" />}

              <div className="productGalleryDiv">
                {galleryImages}
              </div>

            </div>

            <div className="upperRight">

              <div className='ratingsDiv'>
                <FaStar className='starIconFilled' />
                <span>{`${product?.rating?.toFixed(1)} (${product.noOfReviews} users feedback)`}</span>
              </div>

              <p className="productTitle">{product.title}</p>

              <div className="sellerInfo">
                <img src={product.sellerId && `${hostNameBack}/${product.sellerId.profileImage}`} alt="Error" />
                <Link to={`/profile/${product?.sellerId?._id}`}>{product && product.sellerId && product.sellerId.userId.username + " >"}</Link>
              </div>

              <div className="productInfo">
                <p>Units Sold: <strong>{product.sold}</strong></p>
                <p>Stock Available: {product.stock > 0 ? <strong style={{ color: "var(--success)" }}>{product.stock}</strong>
                  : <strong style={{ color: "var(--danger)" }}>{product.stock}</strong>}</p>
                <p>Category: <strong>{product.category}</strong></p>
                <p>Shipping Fee: <strong>{"$" + product.shippingFees}</strong></p>
              </div>

              <div className="productPrice">
                <strong className='salesPrice'>${product.salesPrice}</strong>
                {Number(product.discountPercent) !== 0 && <>
                  <p className='price'>${product.price}</p>
                  <p className='off'>{`${product.discountPercent}% OFF`}</p>
                </>}
              </div>

              <div className="horizontalLine"></div>

              {Number(product.discountPercent) !== 0 && <div className="discountEndsOn">
                <span>Discount ending on - </span><strong>{formatDate(product.discountExpiryDate)}</strong>
              </div>}

              {Number(product.discountPercent) !== 0 && <div className="horizontalLine"></div>}


              <div className="productActions">
                <div className="cartCountBtn">
                  <p className='minus' onClick={() => setCartCount(prev => cartCount > 1 ? --prev : prev)}>-</p>
                  <p>{cartCount}</p>
                  <p className='plus' onClick={() => setCartCount(prev => ++prev)}>+</p>
                </div>
                <div className="addToCartBtn primaryBtn" onClick={handleCartClick}>
                  <p>{isInCart ? "REMOVE FROM CART" : "ADD TO CART"}</p>
                  <i className="fa-solid fa-cart-shopping"></i>
                </div>
                <Link to={`/chat?p=${product?.sellerId?.userId?._id}`} className="contactSellerBtn primaryBtn2">CONTACT SELLER</Link>
              </div>

              <div className="addToWishlistBtn" onClick={(e) => handleWishlistClick(e)}>
                {isInWishlist ? <MdFavorite /> : <MdFavoriteBorder />}
                <p>{isInWishlist ? "REMOVE FROM WISHLIST" : "ADD TO WISHLIST"}</p>
              </div>

              <Link to={`/checkout?p=${id}_${cartCount}`} className='buyNowBtn primaryBtn'>
                <p>BUY NOW</p>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>

            </div>

          </div>

          <div className="lower">

            <div className="upper">
              <p className={`${isShowDescription && "active"}`} onClick={() => setIsShowDescription(true)}>DESCRIPTION</p>
              <p className={`${!isShowDescription && "active"}`} onClick={() => setIsShowDescription(false)}>REVIEWS</p>
            </div>

            <div className="horizontalLine"></div>

            {isShowDescription && <div className="innerLower productDescription">
              <h2 className="secondaryHeading">Description</h2>
              <p>{product.description}</p>
            </div>}

            {!isShowDescription && <div className="productReviews">
              <Reviews type="product" id={id} />
            </div>}

          </div>

          <SampleProvisions pre="related" openedProduct={product} />
        </div>
      </section>
    </div>
  );
}

export default ProductDetails;
