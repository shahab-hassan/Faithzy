import React, { useContext } from 'react';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import {Link} from "react-router-dom"

import { fetchCartUtil, removeFromCartUtil, updateCartUtil } from '../../utils/utilFuncs';
import {AuthContext} from "../../utils/AuthContext"

function Cart() {

  const [products, setProducts] = React.useState([]);
  const [summary, setSummary] = React.useState({ price: 0, discount: 0, total: 0, shipping: 0, subtotal: 0 });
  const [isCartUpdated, setIsCartUpdated] = React.useState(false);
  const {user} = useContext(AuthContext);

  React.useEffect(() => {
    
    async function checkCart(){
      const cart = await fetchCartUtil(user);
      if(cart){
        setProducts(cart.products);
        updateSummary(cart.products);
      }
    }

    checkCart();

  }, [isCartUpdated, user]);

  const updateSummary = (products) => {
    let price = 0, discount = 0, total = 0, shipping = 0;
    products.forEach(item => {
      price += item.product.price * item.count;
      discount += Number(item.product.discountPercent) !== 0 ? (item.product.price - item.product.salesPrice) * item.count : 0;
      total += item.product.salesPrice * item.count;
      shipping += parseFloat(item.product.shippingFees);
    });
    const subtotal = (price - discount) + shipping;
    setSummary({ price, discount, total, shipping, subtotal });
  };

  const handleCountChange = async (e, productId, count, crrCount) => {
    if(count === -1 && crrCount === 1 )
      return;
    await updateCartUtil(e, productId, count, user);
    setIsCartUpdated(prev => !prev);
  };
  
  const handleRemoveProduct = async (e, productId, count) => {
    await removeFromCartUtil(e, productId, count, user);
    setIsCartUpdated(prev => !prev);
  };

  const cartElems = products.map((item, index) => {
    const product = item.product;
    return (
      <div key={index}>

        <div className="cartElem">
          <div className="imgDiv">
            <img src={`http://localhost:5000/${product.productImages? product.productImages[0]:""}`} alt="Error" />
          </div>
          <div className="cartElemContent">
            <div className="cartElemTop">
              <p className='title'>{product.title}</p>
              <IoIosCloseCircleOutline className='icon' onClick={(e) => handleRemoveProduct(e, product._id, item.count, user)} />
            </div>
            {Number(product.shippingFees) === 0 ?
              <p className='shippingFee'><span>Free</span> Shipping</p> :
              <p className='shippingFee'><span>${product.shippingFees}</span> Shipping Fee</p>
            }
            <div className="cartElemBottom">
              <div className="cartCountBtn">
                <p className="minus" onClick={(e) => handleCountChange(e, product._id, -1, item.count)}>-</p>
                <p>{(item.count<10 && "0") + item.count}</p>
                <p className="plus" onClick={(e) => handleCountChange(e, product._id, +1, item.count)}>+</p>
              </div>
              <div className="price">
                {Number(product.discountPercent) !== 0 && <span>${product.price}</span>}
                ${product.salesPrice}
              </div>
            </div>
          </div>
        </div>

        {(products.length > 1 && products.length - 1 !== index) && <div className="horizontalLine"></div>}

      </div>
    );
  });

  // const estimatedDeliveryDate = new Date();
  // estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7);
  // const formattedDeliveryDate = estimatedDeliveryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className='cartDiv'>
      <div className="cartContent">
        <section className="section">

          <div className="left">

            <h2 className="secondaryHeading">Your <span>Cart</span><span className='totalItems'>- {(products && products.length>0)? (products.length<10 && "0") + products.length : "00" }</span></h2>

            <div className="horizontalLine"></div>

            <div className="cartProducts">
              {products.length>0? cartElems : "Nothing to show here..."}
            </div>

          </div>

          <div className="right summary">

            <h2 className='secondaryHeading'>Summary</h2>

            <div className="summaryContent">

              <div className='row'>
                <p>Price</p>
                <strong>${summary.price.toFixed(2)}</strong>
              </div>

              <div className='row'>
                <p>Discount</p>
                <strong>-${summary.discount.toFixed(2)}</strong>
              </div>

              <div className="horizontalLine"></div>
              
              <div className='row'>
                <p>Sale Price</p>
                <strong>${summary.total.toFixed(2)}</strong>
              </div>

              <div className='row'>
                <p>Shipping Fee</p>
                <strong>${summary.shipping.toFixed(2)}</strong>
              </div>

              <div className="horizontalLine"></div>

              <div className='row'>
                <p>Total</p>
                <strong className='subTotal'>${summary.subtotal.toFixed(2)}</strong>
              </div>

              <Link to={`/checkout?cart=true`} className="primaryBtn">Proceed to Checkout</Link>

            </div>

          </div>

        </section>
      </div>
    </div>
  );
}

export default Cart;
