import React, { useContext } from 'react';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { BsFillCartPlusFill, BsFillCartCheckFill } from "react-icons/bs";
import { MdKeyboardArrowRight } from 'react-icons/md';
import { Link, useNavigate } from "react-router-dom";

import { removeFromWishlistUtil, fetchWishlistUtil, addToCartUtil, fetchCartUtil } from '../../utils/utilFuncs';
import { AuthContext } from '../../utils/AuthContext';
import Dropdown from "../../components/common/Dropdown";

function Wishlist() {
  const { user } = useContext(AuthContext);
  const [selectedType, setSelectedType] = React.useState("Products");
  const [wishlists, setWishlists] = React.useState([]);
  const [cartItems, setCartItems] = React.useState([]);
  const [isRemoved, setIsRemoved] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    setWishlists([]);
    async function checkWishlist() {
      const wishlist = await fetchWishlistUtil(user);
      if (wishlist) {
        if (selectedType === "Products") {
          setWishlists(wishlist.products);
        } else {
          setWishlists(wishlist.services);
        }
      }
    }
    checkWishlist();

    async function checkCart() {
      const cart = await fetchCartUtil(user);
      if (cart) {
        setCartItems(cart.products.map(product => product.product._id));
      }
    }
    checkCart();
  }, [selectedType, user, isRemoved]);

  const handleRemoveWishlist = async (e, itemId) => {
    await removeFromWishlistUtil(e, itemId, selectedType === "Products" ? "product" : "service", user);
    setIsRemoved(prev => !prev);
  };

  const handleAddToCart = async (e, productId) => {
    await addToCartUtil(e, productId, 1, user);
    setIsRemoved(true);
  };

  const wishlistElems = wishlists.length > 0 ? wishlists.map((wishlist, index) => {
    const isInCart = cartItems.includes(wishlist._id);
    return (
      <div key={index}>

        <div className="wishlistElem row">
          <div className="titleField field">
            <div className="imgDiv">
              <img src={`http://localhost:5000/${selectedType === "Products" ? wishlist.productImages ? wishlist.productImages[0] : "" : wishlist.serviceImages ? wishlist.serviceImages[0] : ""}`} alt="Error" />
            </div>
            <p className='title'>{wishlist.title}</p>
          </div>
          <Link to={`/${selectedType === "Products" ? "products" : "services"}/${wishlist.category}`} className="categoryField field">
            <p>{wishlist.category}</p>
            <MdKeyboardArrowRight />
          </Link>
          <div className="sellerField field">
            <Link to={`/profile/${wishlist?.sellerId?._id}`}>{wishlist.sellerId.userId.username}</Link>
            <MdKeyboardArrowRight />
          </div>
          <div className="priceField field">
            <p>${selectedType === "Services" ?
              wishlist.packages ? wishlist.packages[0].salesPrice + " - $" + wishlist.packages[2].salesPrice : ""
              :
              wishlist.salesPrice}</p>
          </div>
          <div className="actionsField field">
            {selectedType === "Products"? isInCart ? (
              <BsFillCartCheckFill className='icon cartCheck' />
            ) : (
              <BsFillCartPlusFill className='icon' onClick={(e) => handleAddToCart(e, wishlist._id)} />
            ): []}
            <IoIosCloseCircleOutline className='icon' onClick={(e) => handleRemoveWishlist(e, wishlist._id)} />
            <MdKeyboardArrowRight className='icon arrowRight' onClick={() => navigate(`/productDetails/${wishlist._id}`)} />
          </div>
        </div>

        {((wishlists.length > 1) && (wishlists.length - 1 !== index)) && <div className="horizontalLine"></div>}

      </div>
    )
  }) : <div className="rows"><div className="row">Nothing to show here...</div></div>;

  return (
    <div className='wishlistDiv tableDiv'>
      <section className="section">
        <div className="wishlistContent tableContent">

          <div className="upper">
            <h1 className="secondaryHeading"><span>{selectedType}</span> Wishlist</h1>
            <Dropdown options={["Products", "Services"]} selected={selectedType} onSelect={setSelectedType} />
          </div>

          <div className='header'>
            <p className='title'>{selectedType === "Products" ? "PRODUCT" : "SERVICE"}</p>
            <p>CATEGORY</p>
            <p>SELLER</p>
            <p>PRICE</p>
            <p>ACTIONS</p>
          </div>

          <div className="wishlistCols rows">
            {wishlistElems}
          </div>

        </div>
      </section>
    </div>
  )
}

export default Wishlist;
