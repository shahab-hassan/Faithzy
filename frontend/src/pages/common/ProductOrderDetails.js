import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { enqueueSnackbar } from "notistack"
import { FaBasketShopping, FaShop } from "react-icons/fa6";
import { TbTruckDelivery } from "react-icons/tb";
import { FaUserCircle } from "react-icons/fa";
import {MdKeyboardArrowDown, MdKeyboardArrowUp} from "react-icons/md"
import { IoIosCloseCircleOutline } from "react-icons/io";

const ProductOrderDetails = ({ isBuyer }) => {

  const { id } = useParams();
  const { subOrderId } = useParams();
  const token = localStorage.getItem("token");
  const [order, setOrder] = useState(null);
  const [subOrder, setSubOrder] = useState(null);
  const [showStatusDetails, setShowStatusDetails] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showCancellationModel, setShowCancellationModel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    if (localStorage.getItem('statusUpdated')) {
      enqueueSnackbar("Status Updated Successfully!", { variant: "success" });
      localStorage.removeItem('statusUpdated');
    }
    else if (localStorage.getItem('orderCancelled')) {
      enqueueSnackbar("Order has been Cancelled!", { variant: "success" });
      localStorage.removeItem('orderCancelled');
    }
  }, []);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/v1/orders/${isBuyer ? 'buyer' : 'seller'}/product/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      if(response.data.success){
        const order = response.data.order; 
        setOrder(order);
        if(!isBuyer && subOrderId){
          const foundSubOrder = order.products.find(subOrder => subOrder._id.toString() === subOrderId.toString());
          setSubOrder(foundSubOrder);
        }
      }
    })
    .catch(e => {
      console.error(e);
      enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", {variant: "error"});
    });
  }, [id, subOrderId, token, isBuyer]);


  const handleStatusChange = async () => {
    try {
      const response = await axios.put('http://localhost:5000/api/v1/orders/product/status', {
        orderId: order._id,
        productId: subOrder._id,
        newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        localStorage.setItem('statusUpdated', 'true');
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
    }
  };

  const handleCancelOrder = async (productId) => {
    setShowCancellationModel(null)
    try {
      const response = await axios.put('http://localhost:5000/api/v1/orders/product/cancel', {
        orderId: order._id,
        productId,
        cancellationReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        localStorage.setItem('orderCancelled', 'true');
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
    }
  }

  const orderStatusDetailsSeller = order && !isBuyer && subOrder && showStatusDetails && (
    <div className='orderStatusDetails'>

      <h2 className="secondaryHeading"><span>Order</span> Status</h2>

      {subOrder.status.map((status, index) => (
        <div className='trackOrderRow' key={index}>
          <span>{new Date(status.createdAt).toLocaleString()} - </span>
          <strong>{status.name === "Active" ? "Order Placed" : status.name}</strong>
          {(subOrder.cancellationReason && status.name === "Cancelled") && <span> - (<strong>Reason: </strong> {showStatusDetails.cancellationReason})</span>}
        </div>
      ))}

      {subOrder.status[subOrder.status.length - 1].name !== 'Delivered' && 
      subOrder.status[subOrder.status.length - 1].name !== 'Cancelled'
       && (

        <div className="inputDiv">

          <select className='dropdownPlus' onChange={(e) => setNewStatus(e.target.value)} value={newStatus}>
            <option value="">Select Status</option>
            {subOrder.status[subOrder.status.length - 1].name === 'Active' && <option value="Shipped">Shipped</option>}
            <option value="Delivered">Delivered</option>
          </select>

          <div className='actions'>
            <button onClick={handleStatusChange} disabled={!newStatus} className='secondaryBtn'>Update Status</button>
            <div>
              <button className='dangerBtn' onClick={()=>setShowCancellationModel(subOrder._id)}>Cancel Order</button>
            </div>
          </div>

        </div>

      )}
    </div>
  );

  const orderStatusDetailsBuyer = order && isBuyer && showStatusDetails && (
    <div className='orderStatusDetails'>

      <h2 className="secondaryHeading"><span>Track</span> Order</h2>

      {showStatusDetails.status.map((status, index) => (
        <div className='trackOrderRow' key={index}>
          <span>{new Date(status.createdAt).toLocaleString()} - </span>
          <strong>{status.name === "Active" ? "Order Placed" : status.name}</strong>
          {(showStatusDetails.cancellationReason && status.name === "Cancelled") && <span> - (<strong>Reason: </strong> {showStatusDetails.cancellationReason})</span>}
        </div>
      ))}

      <div className="actionsB">
        <Link to={`/chat?p=${showStatusDetails?.productId?.sellerId?.userId?._id}`} className='primaryBtn'>Contact Seller</Link>
        <button className='secondaryBtn' 
                disabled={showStatusDetails.status[showStatusDetails.status.length-1].name === "InDispute"}>
          Start Dispute
        </button>
        <button className='dangerBtn' 
                disabled={showStatusDetails.status[showStatusDetails.status.length-1].name === "Delivered" || 
                          showStatusDetails.status[showStatusDetails.status.length-1].name === "Cancelled" || 
                          showStatusDetails.status[showStatusDetails.status.length-1].name === "InDispute"} 
                onClick={()=>setShowCancellationModel(showStatusDetails._id)}>
          Cancel Order
        </button>
      </div>

    </div>
  );


  const SellerProductOrder = order && !isBuyer && <div className="sellerProductOrderCard sellerProductOrderDetailsCard">

        <div>

          <div className="order">

            <div className="left">
              <div className="leftLeft">

                <div className="imgDiv">
                  <img src={`http://localhost:5000/${subOrder.productId?.productImages[0]}`} alt="Error" />
                </div>

                <div className="productInfo">
                  <p className='singleLineText'>{subOrder.productId.title}</p>
                  <p className='category'>{subOrder.productId.category}</p>
                </div>

              </div>
              <div className="leftRight">
                <div className="column">
                  <p><FaUserCircle className='icon' /></p>
                  <p>{order.userId?.username}</p>
                </div>
                <div className="column">
                <p><FaBasketShopping className='icon'/></p>
                  <div>{(subOrder.count < 10 && "0") + subOrder.count}</div>
                </div>
                <div className="column">
                  <p><TbTruckDelivery className='icon'/></p>
                  <div>{subOrder.status[subOrder.status.length-1].name}</div>
                </div>
              </div>
            </div>

          </div>

          <div className='horizontalLine'></div>

        </div>

        <div className='actionsDiv'>
          <div onClick={()=> setShowStatusDetails(showStatusDetails?._id === subOrder._id? null : subOrder)}>
            Order Status {showStatusDetails? <MdKeyboardArrowUp className='icon' /> : <MdKeyboardArrowDown className='icon' />}
          </div>
        </div>

        {showStatusDetails && orderStatusDetailsSeller}

    </div>

  const BuyerProductOrder = order && isBuyer && 
      <div className='buyerProductOrderDetailsCard'>
        {order.products.map((product, i) => (
          <div key={i} className='buyerProductOrderCard'>
            <div className="order">
              <div className="left">
                <div className="leftLeft">
                  <div className="imgDiv">
                    <img src={`http://localhost:5000/${product.productId?.productImages[0]}`} alt="Error" />
                  </div>
                  <div className="productInfo">
                    <p className='singleLineText'>{product.productId.title}</p>
                    <p className='category'>{product.productId.category}</p>
                  </div>
                </div>
                <div className="leftRight">
                  <div className="column">
                    <p><FaShop className='icon' /></p>
                    <Link to={`/profile/${product?.productId?.sellerId?._id}`}>{product.productId.sellerId.userId?.username + " >"}</Link>
                  </div>
                  <div className="column">
                    <p><FaBasketShopping className='icon' /></p>
                    <div>{product.count < 10 ? "0" + product.count : product.count}</div>
                  </div>
                  <div className="column">
                    <p><TbTruckDelivery className='icon' /></p>
                    <div>{product.status[product.status.length - 1].name}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className='horizontalLine'></div>
            <div className='actionsDiv'>
              <div onClick={()=> setShowStatusDetails(showStatusDetails?._id === product._id? null : product)}>
                Order Status {showStatusDetails? <MdKeyboardArrowUp className='icon' /> : <MdKeyboardArrowDown className='icon' />}
              </div>
            </div>
            {(showStatusDetails?._id === product._id) && orderStatusDetailsBuyer}
          </div>
        ))}
      </div>

  if (!order || (!isBuyer && !subOrder)) return <p>Loading...</p>;

  return (
    <div className='orderDetailsDiv'>
      <section className="section">
        <div className="orderDetailsContent">

          <div className="orders">

            <div className="upper">
              <div className="upperLeft">
                <div className="orderId">#{id}</div>
                <div>
                  {isBuyer && <span>{(order.products.length<10 && "0") + order.products.length} Product{order.products.length>1 && "s"} - </span>}
                  <span>Order Placed on: {new Date(order.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="upperRight">${isBuyer? order.summary.price : (subOrder.salesPrice)}</div>
            </div>

            <div className="lower">
              {isBuyer? BuyerProductOrder : SellerProductOrder}
            </div>

          </div>

          {!isBuyer && <div className="billingInfo">
            <h2 className="secondaryHeading"><span>Billing</span> Info</h2>
            <div className="horizontalLine"></div>
            <div className="buyerDetails">
              <div className="row">
                <strong>Name</strong>
                <p>{order.billingInfo.firstName + " " + order.billingInfo.lastName}</p>
              </div>
              <div className="row">
                <strong>Address</strong>
                <p>{order.billingInfo.address}</p>
              </div>
              <div className="row">
                <strong>Country</strong>
                <p>{order.billingInfo.country}</p>
              </div>
              <div className="row">
                <strong>State</strong>
                <p>{order.billingInfo.state}</p>
              </div>
              <div className="row">
                <strong>City</strong>
                <p>{order.billingInfo.city}</p>
              </div>
              <div className="row">
                <strong>Email</strong>
                <p>{order.billingInfo.email}</p>
              </div>
              <div className="row">
                <strong>Phone Number</strong>
                <p>{order.billingInfo.phoneNumber}</p>
              </div>
              {order.billingInfo.note !== "" && <div className="row">
                <strong>Special Note</strong>
                <p>{order.billingInfo.note}</p>
              </div>}
            </div>
          </div>}

          <div className="paymentSummary billingInfo">
            <h2 className="secondaryHeading"><span>Payment</span> Summary</h2>
            <div className="horizontalLine"></div>
            <div className="summary buyerDetails">
              <div className="row">
                <strong>Payed By</strong>
                <p>{order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}</p>
              </div>
              <div className="row">
                <strong>Price</strong>
                <p>${isBuyer? order.summary.price : subOrder.salesPrice}</p>
              </div>
              <div className="row">
                <strong>Shipping Fees</strong>
                <p>${isBuyer? order.summary.shipping : subOrder.shippingFees}</p>
              </div>
              <div className="row">
                <strong>SubTotal</strong>
                <p>${isBuyer? order.summary.total : subOrder.salesPrice + subOrder.shippingFees}</p>
              </div>
              <div className="row">
                <strong>Tax (9%)</strong>
                <p>{isBuyer? "$"+order.summary.tax : "-$"+((subOrder.salesPrice + subOrder.shippingFees)*0.09).toFixed(2)}</p>
              </div>
              <div className="horizontalLine"></div>
              <div className="row">
                <strong>{isBuyer? "You Paid":"You will Get"}</strong>
                <p>${isBuyer? order.summary.subtotal : (subOrder.salesPrice + subOrder.shippingFees - (subOrder.salesPrice + subOrder.shippingFees)*0.09).toFixed(2)}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {showCancellationModel && 
        <div className="popupDiv">
          <div className="popupContent">

            <form className="form">

              <h2 className="secondaryHeading"><span>Cancel</span> Order</h2>

              <div className="horizontalLine"></div>

              <div className="inputDiv">
                <label>Reason of Cancellation</label>
                <textarea type="text" className='inputField' value={cancellationReason} onChange={(e)=>setCancellationReason(e.target.value)} placeholder='Enter Reason' />
              </div>

              <div className="buttonsDiv">
                <button className='dangerBtn' onClick={()=>handleCancelOrder(showCancellationModel)}>Confirm Cancellation</button>
                <button className='secondaryBtn' onClick={()=>setShowCancellationModel(null)}>Close</button>
              </div>

            </form>

            <div className="popupCloseBtn">
              <IoIosCloseCircleOutline className='icon' onClick={() => setShowCancellationModel(null)} />
            </div>

          </div>
        </div>
      }

    </div>
  );
};

export default ProductOrderDetails;