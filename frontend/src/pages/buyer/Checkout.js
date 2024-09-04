import React from 'react'
import axios from "axios"
import { useSearchParams } from 'react-router-dom'
import { enqueueSnackbar } from "notistack";
import { FaPaypal } from "react-icons/fa";
import { BsStripe } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';

import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

function Checkout() {

  const token = localStorage.getItem("token");
  const [searchParams] = useSearchParams();

  const [items, setItems] = React.useState(null);
  const [summary, setSummary] = React.useState({ paidByBuyer: { totalSalesPrice: 0, totalShipping: 0, subtotal: 0, tax: 0, total: 0, promoDiscount: 0 } });

  const [serviceItem, setServiceItem] = React.useState(null);
  const [serviceSummary, setServiceSummary] = React.useState({
    paidByBuyer: { salesPrice: 0, tax: 0, total: 0, promoDiscount: 0 },
    sellerToGet: { salesPrice: 0, tax: 0, total: 0 }
  });

  const [customItem, setCustomItem] = React.useState(null);

  const [paymentMethod, setPaymentMethod] = React.useState("stripe");

  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = React.useState(false);

  const navigate = useNavigate();

  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState(null);

  const [billingInfo, setBillingInfo] = React.useState({
    firstName: "",
    lastName: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    email: "",
    phoneNumber: "",
    note: ""
  });

  const [feesObj, setFeesObj] = React.useState({
    seller: { product: 0, service: 0 },
    paidSeller: { product: 0, service: 0 },
    buyer: { product: 0, service: 0 }
  });

  React.useEffect(() => {

    axios.get("http://localhost:5000/api/v1/settings/admin/feesAndMembership")
      .then(response => {
        if (response.data.success)
          setFeesObj(response.data.fees);
      })
      .catch(e => {
        console.log(e);
        enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
      })

  }, [])

  React.useEffect(() => {

    const fromCart = searchParams.get("cart") === "true";
    const productId = searchParams.get("p");
    const serviceId = searchParams.get("s");
    const messageId = searchParams.get("c");

    if (fromCart) {
      axios.get("http://localhost:5000/api/v1/carts", { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          if (response.data.success) {
            setItems(response.data.cart.products);
            updateSummary(response.data.cart.products);
          }
        })
        .catch(e => {
          console.log(e);
          enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" });
        })
    }
    else if (productId) {

      const id = productId.split("_")[0];
      const count = productId.split("_")[1];

      axios.get(`http://localhost:5000/api/v1/products/product/${id}`)
        .then(response => {
          if (response.data.success) {
            const item = {
              product: response.data.product,
              count: count
            }
            setItems([item]);
            updateSummary([item]);
          }
        })

        .catch(e => {
          console.log(e);
          enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
        })
    }
    else if (serviceId) {

      const pkgIndex = serviceId.split("_")[0];
      const id = serviceId.split("_")[1];

      axios.get(`http://localhost:5000/api/v1/services/service/${id}`)
        .then(response => {
          if (response.data.success) {
            const service = { service: response.data.service, pkgIndex: Number(pkgIndex) };
            setServiceItem(service);
            updateServiceSummary(service);
          }
        })
        .catch(e => {
          console.log(e);
          enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
        })
    }
    else if (messageId) {
      axios.get(`http://localhost:5000/api/v1/chats/offer/details/${messageId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          if (response.data.success) {
            const offer = response.data.offer;
            if (offer.quoteType === "product")
              updateCustomSummary(offer);
            else
              updateServiceCustomSummary(offer);
            setCustomItem(offer);
          }
        })
        .catch(e => {
          console.log(e);
          enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, token, feesObj]);

  const updateSummary = (products, couponDiscount) => {

    let paidByBuyer = { totalSalesPrice: 0, totalShipping: 0, subtotal: 0, tax: 0, total: 0, promoDiscount: 0 };

    products.forEach(item => {

      const myItem = item.product;
      const count = item.count;

      paidByBuyer.totalSalesPrice += myItem.salesPrice * count;

      paidByBuyer.totalShipping += parseFloat(myItem.shippingFees);
    });

    if (couponDiscount) {
      paidByBuyer.totalSalesPrice -= (paidByBuyer.totalSalesPrice * Number(couponDiscount || appliedCoupon.discount) / 100)
      paidByBuyer.promoDiscount = couponDiscount || appliedCoupon.discount;
    }

    paidByBuyer.subtotal = paidByBuyer.totalSalesPrice + paidByBuyer.totalShipping;

    paidByBuyer.tax = paidByBuyer.subtotal * (Number(feesObj.buyer.product) / 100);

    paidByBuyer.total = paidByBuyer.subtotal + paidByBuyer.tax;

    setSummary({ paidByBuyer });
  };

  const updateServiceSummary = (serviceItem, couponDiscount) => {

    const pkg = serviceItem.service.packages[serviceItem.pkgIndex];

    let paidByBuyer = { salesPrice: 0, tax: 0, total: 0 };
    let sellerToGet = { salesPrice: 0, tax: 0, total: 0 }

    paidByBuyer.salesPrice = pkg.salesPrice;
    sellerToGet.salesPrice = pkg.salesPrice;

    if (couponDiscount) {
      paidByBuyer.salesPrice -= (paidByBuyer.salesPrice * Number(couponDiscount || appliedCoupon.discount) / 100)
      paidByBuyer.promoDiscount = couponDiscount || appliedCoupon.discount;
    }

    paidByBuyer.tax = paidByBuyer.salesPrice * (Number(feesObj?.buyer?.service) / 100);
    sellerToGet.tax = sellerToGet.salesPrice * (serviceItem.service.sellerId?.sellerType === "Free" ? (Number(feesObj?.seller?.service) / 100) : (Number(feesObj?.paidSeller?.service) / 100));

    paidByBuyer.total = paidByBuyer.salesPrice + paidByBuyer.tax;
    sellerToGet.total = sellerToGet.salesPrice - sellerToGet.tax;

    setServiceSummary({ paidByBuyer, sellerToGet });
  }

  const updateCustomSummary = (offer, couponDiscount) => {

    let paidByBuyer = { totalSalesPrice: 0, totalShipping: 0, subtotal: 0, tax: 0, total: 0, promoDiscount: 0 };

    paidByBuyer.totalSalesPrice = offer.offerAmount;

    if (couponDiscount) {
      paidByBuyer.totalSalesPrice -= (paidByBuyer.totalSalesPrice * Number(couponDiscount || appliedCoupon.discount) / 100)
      paidByBuyer.promoDiscount = couponDiscount || appliedCoupon.discount;
    }

    paidByBuyer.totalShipping += parseFloat(offer.shippingFee);

    paidByBuyer.subtotal = paidByBuyer.totalSalesPrice + paidByBuyer.totalShipping;
    paidByBuyer.tax = paidByBuyer.subtotal * (Number(feesObj?.buyer?.product) / 100);
    paidByBuyer.total = paidByBuyer.subtotal + paidByBuyer.tax;

    setSummary({ paidByBuyer });
  };

  const updateServiceCustomSummary = (offer, couponDiscount) => {

    let paidByBuyer = { salesPrice: 0, tax: 0, total: 0 };
    let sellerToGet = { salesPrice: 0, tax: 0, total: 0 }

    paidByBuyer.salesPrice = offer.offerAmount;
    sellerToGet.salesPrice = offer.offerAmount;

    if (couponDiscount) {
      paidByBuyer.salesPrice -= (paidByBuyer.salesPrice * Number(couponDiscount || appliedCoupon.discount) / 100)
      paidByBuyer.promoDiscount = couponDiscount || appliedCoupon.discount;
    }

    paidByBuyer.tax = paidByBuyer.salesPrice * (Number(feesObj?.buyer?.service) / 100);
    sellerToGet.tax = sellerToGet.salesPrice * (offer.serviceId.sellerId?.sellerType === "Free" ? (Number(feesObj?.seller?.service) / 100) : (Number(feesObj?.paidSeller?.service) / 100));

    paidByBuyer.total = paidByBuyer.salesPrice + paidByBuyer.tax;
    sellerToGet.total = sellerToGet.salesPrice - sellerToGet.tax;

    setServiceSummary({ paidByBuyer, sellerToGet });
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardNumberElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
      setLoading(false);
      return;
    }

    let convertedItem = null;
    if (customItem) {
      if (customItem.quoteType === "product") {
        convertedItem = [{
          product: customItem.productId,
          count: customItem.quantity
        }]
        convertedItem[0].product.salesPrice = summary.paidByBuyer.totalSalesPrice;
        convertedItem[0].product.shippingFees = summary.paidByBuyer.totalShipping;
      }
      else if (customItem.quoteType === "service") {
        convertedItem = {
          pkg: {
            name: "CUSTOM",
            title: customItem.title,
            description: customItem.description,
            deliveryDays: customItem.duration
          },
          service: customItem.serviceId,
        }
      }
    }

    const orderData = {
      items: items || serviceItem || convertedItem,
      summary: (items || (customItem && customItem.quoteType === "product")) ? summary : serviceSummary,
      paymentMethod: 'stripe',
      billingInfo
    };

    try {
      const { data } = await axios.post(`http://localhost:5000/api/v1/orders/${(items || (customItem && customItem.quoteType === "product")) ? "product" : "service"}/order`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const clientSecret = data.clientSecret;

      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id
      });

      if (stripeError) {
        enqueueSnackbar(stripeError.message, { variant: 'error' });
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        enqueueSnackbar("Order placed successfully!", { variant: 'success' });
        navigate(`${(items || (customItem && customItem.quoteType === "product")) ? "/orders" : "/requirements/" + data.order._id}`)
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: 'error' });
      setLoading(false);
    }
  };

  const handlePayPalPayment = async (details) => {
    const { id } = details;
    const orderData = {
      items: items || serviceItem || customItem,
      summary: (items || (customItem && customItem.quoteType === "product")) ? summary : serviceSummary,
      paymentMethod: 'paypal',
      billingInfo,
      paypalOrderId: id,
    };

    try {
      const { data } = await axios.post(`http://localhost:5000/api/v1/orders/${(items || (customItem && customItem.quoteType === "product")) ? "product" : "service"}/order`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      enqueueSnackbar("Order placed successfully!", { variant: 'success' });
      navigate(`${(items || (customItem && customItem.quoteType === "product")) ? "/orders" : "/requirements/" + data.order._id}`);
      setLoading(false);
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: 'error' });
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setBillingInfo({ ...billingInfo, [e.target.name]: e.target.value });
  }

  const handleCouponClick = () => {

    if (appliedCoupon) {
      setAppliedCoupon(null);
      setCouponCode('');

      if (items)
        updateSummary(items);
      else if (serviceItem)
        updateServiceSummary(serviceItem);
      else if (customItem) {
        if (customItem.quoteType === "product")
          updateCustomSummary(customItem);
        else if (customItem.quoteType === "service")
          updateServiceCustomSummary(customItem);
      }

      enqueueSnackbar("Coupon removed!", { variant: "info" });
    }
    else {
      axios.post("http://localhost:5000/api/v1/coupons/apply", { code: couponCode }, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          if (response.data.success) {
            const coupon = response.data.coupon;
            setAppliedCoupon(coupon);

            if (items)
              updateSummary(items, coupon.discount);
            else if (serviceItem)
              updateServiceSummary(serviceItem, coupon.discount);
            else if (customItem) {
              if (customItem.quoteType === "product")
                updateCustomSummary(customItem, coupon.discount);
              else if (customItem.quoteType === "service")
                updateServiceCustomSummary(customItem, coupon.discount);
            }

            enqueueSnackbar("Coupon Applied!", { variant: "success" });
          }
        })
        .catch(e => {
          enqueueSnackbar(e.response.data.error || "Invalid coupon code!", { variant: "error" });
        });
    }
  };

  const itemElems = items ? items.map((item, index) => {

    let myItem = item.product;
    let count = item.count;

    return <div key={index} className="item">
      <div className="imgDiv">
        <img src={`http://localhost:5000/${myItem.productImages ? myItem.productImages[0] : ""}`} alt="Error" />
      </div>
      <div className="itemContent">
        <p className='singleLineText'>{myItem.title}</p>
        <p className='price'>{count} x ${myItem.salesPrice}</p>
      </div>
    </div>
  }) : "Nothing to show here"

  const serviceElem = serviceItem ? <div className="item">
    <div className="imgDiv">
      <img src={`http://localhost:5000/${serviceItem.service?.serviceImages[0]}`} alt="Error" />
    </div>
    <div className="itemContent">
      <p className='singleLineText'>{serviceItem.service.title}</p>
      <p className='price'>{serviceItem.service.packages[serviceItem.pkgIndex].name} - ${serviceItem.service.packages[serviceItem.pkgIndex].salesPrice}</p>
    </div>
  </div>
    : "Nothing to show here"

  const customElem = customItem ? <div className="item">
    <div className="imgDiv">
      <img src={`http://localhost:5000/${customItem.productId ? customItem.productId.productImages[0] : customItem.serviceId.serviceImages[0]}`} alt="Error" />
    </div>
    <div className="itemContent">
      <p className='singleLineText'>{customItem.title}</p>
      {customItem.quoteType === "product" && <p className='price'>Quantity: {customItem.quantity}</p>}
      {customItem.quoteType === "service" && <p className='price'>CUSTOM - ${customItem.offerAmount}</p>}
    </div>
  </div>
    : "Nothing to show here"


  if (!items && !serviceItem && !customItem) return <div>Loading...</div>

  return (
    <div className='checkoutDiv'>
      <section className="section">
        <div className="checkoutContent">

          <div className="billingInfo form">

            <h2 className="secondaryHeading"><span>{(items || (customItem && customItem.quoteType === "product")) ? "Billing" : "Buyer"}</span> Info</h2>

            <div className="inputDiv">
              <div className="inputInnerDiv">
                <label>First Name</label>
                <input type="text" className='inputField' placeholder='Enter First Name' name="firstName" onChange={handleChange} />
              </div>
              <div className="inputInnerDiv">
                <label>Last Name</label>
                <input type="text" className='inputField' placeholder='Enter Last Name' name="lastName" onChange={handleChange} />
              </div>
            </div>

            <div className="inputDiv">
              <div className="inputInnerDiv">
                <label>Country</label>
                <input type="text" className='inputField' placeholder='Enter your Country Name' name="country" onChange={handleChange} />
              </div>
              <div className="inputInnerDiv">
                <label>City</label>
                <input type="text" className='inputField' placeholder='Enter your City' name="city" onChange={handleChange} />
              </div>
            </div>

            {(items || (customItem && customItem.quoteType === "product")) && <><div className="inputDiv">
              <label>Address</label>
              <textarea className='inputField' placeholder='Enter Address' name="address" onChange={handleChange} />
            </div>

              <div className="inputDiv">
                <div className="inputInnerDiv">
                  <label>Region/State</label>
                  <input type="text" className='inputField' placeholder='Enter State' name="state" onChange={handleChange} />
                </div>
                <div className="inputInnerDiv">
                  <label>Zip Code</label>
                  <input type="Number" className='inputField' placeholder='Enter Zip Code' name="zipCode" onChange={handleChange} />
                </div>
              </div></>}

            <div className="inputDiv">
              <div className="inputInnerDiv">
                <label>Email</label>
                <input type="email" className='inputField' placeholder='Enter Email' name="email" onChange={handleChange} />
              </div>
              <div className="inputInnerDiv">
                <label>Phone Number</label>
                <input type="Number" className='inputField' placeholder='Enter Phone Number' name="phoneNumber" onChange={handleChange} />
              </div>
            </div>


            <div className="horizontalLine"></div>

            <div className="paymentMethodsDiv">
              <h2 className="secondaryHeading">Choose <span>Payment</span> Method</h2>

              <div className="paymentOptions">
                <div className={`stripe paymentOption ${paymentMethod === 'stripe' ? 'selected' : ''}`} onClick={() => setPaymentMethod('stripe')}><BsStripe className='icon' /><div>Stripe</div></div>
                <div className={`paypal paymentOption ${paymentMethod === 'paypal' ? 'selected' : ''}`} onClick={() => enqueueSnackbar("Paypal is not available at the moment!", {variant: "info"})}><FaPaypal className='icon' /><div>Paypal</div></div>
              </div>

              {paymentMethod === "stripe" && <form className='form'>

                <div className="inputDiv">
                  <label>Card Number</label>
                  <CardNumberElement className="inputField" />
                </div>

                <div className="inputDiv">

                  <div className="inputInnerDiv">
                    <label>Expiry Date</label>
                    <CardExpiryElement className="inputField" />
                  </div>

                  <div className="inputInnerDiv">
                    <label>CVC</label>
                    <CardCvcElement className="inputField" />
                  </div>

                </div>

              </form>}

              {paymentMethod === 'paypal' && (
                <PayPalScriptProvider options={{ "client-id": "AWZnBAn9Ac3p_uN6xbz3ZHLJQWRe_aVSF5HDiL8dWcyLUIANoHzeLAX0H4jtBgpsUB_ErVioR4ROJe6C" }}>
                  <PayPalButtons
                    style={{ layout: 'vertical' }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [{
                          amount: {
                            value: summary.paidByBuyer.total.toString()
                          }
                        }]
                      });
                    }}
                    onApprove={(data, actions) => {
                      return actions.order.capture().then(handlePayPalPayment);
                    }}
                  />
                </PayPalScriptProvider>
              )}

            </div>

            {(items || (customItem && customItem.quoteType === "product")) && <><div className="horizontalLine"></div>

              <div className="inputDiv">
                <label>Any Special Note? (optional)</label>
                <textarea className='inputField' placeholder='Enter note for delivery' name="note" onChange={handleChange} />
              </div></>}
          </div>

          <div className="orderSummary">

            <h2 className="secondaryHeading"><span>Order</span> Summary</h2>

            <div className="horizontalLine"></div>

            {items ? itemElems : serviceItem ? serviceElem : customElem}

            <div className="horizontalLine"></div>

            <div className='row'>
              <p>Sales Price</p>
              <strong>${(items || (customItem && customItem.quoteType === "product")) ? summary.paidByBuyer.totalSalesPrice.toFixed(2) : serviceSummary.paidByBuyer.salesPrice.toFixed(2)}</strong>
            </div>

            <div className="inputDiv promoCodeBox">
              <input
                type="text"
                className='inputField'
                placeholder='Enter Promo Code'
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={appliedCoupon}
              />
              <button className='secondaryBtn' disabled={!couponCode} onClick={handleCouponClick}>{appliedCoupon ? "Remove" : "Apply"}</button>
            </div>

            {appliedCoupon && <div className='row'>
              <p>Coupon Applied</p>
              <strong>{appliedCoupon.discount}% Discount</strong>
            </div>}

            <div className="horizontalLine"></div>

            <div className='row'>
              <p>{(items || (customItem && customItem.quoteType === "product")) ? "Shipping Fee" : `Tax (${feesObj?.buyer?.service}%)`}</p>
              <strong>${(items || (customItem && customItem.quoteType === "product")) ? summary.paidByBuyer.totalShipping.toFixed(2) : serviceSummary.paidByBuyer.tax.toFixed(2)}</strong>
            </div>

            {(items || (customItem && customItem.quoteType === "product")) && <> <div className='row'>
              <p>SubTotal</p>
              <strong>${summary.paidByBuyer.subtotal.toFixed(2)}</strong>
            </div>

              <div className='row'>
                <p>Tax ({feesObj?.buyer?.product}%)</p>
                <strong>${summary.paidByBuyer.tax.toFixed(2)}</strong>
              </div></>}

            <div className="horizontalLine"></div>

            <div className='row'>
              <p>Total</p>
              <strong className='subTotal'>${(items || (customItem && customItem.quoteType === "product")) ? summary.paidByBuyer.total.toFixed(2) : serviceSummary.paidByBuyer.total.toFixed(2)}</strong>
            </div>

            {!(items || (customItem && customItem.quoteType === "product")) && <div className='row'>
              <p>Delivery Time</p>
              <strong>{serviceItem ? serviceItem.service.packages[serviceItem.pkgIndex].deliveryDays : customItem.duration} days</strong>
            </div>}

            <button className='primaryBtn' disabled={!stripe || loading} type="submit" onClick={handlePlaceOrder}>
              {loading ? "Processing..." : `Pay $${(items || (customItem && customItem.quoteType === "product")) ? summary.paidByBuyer.total.toFixed(2) : serviceSummary.paidByBuyer.total.toFixed(2)}`}
            </button>

            <p>By placing an order, you agree to our Terms and Conditions</p>

          </div>

        </div>
      </section>
    </div>
  )
}

export default Checkout