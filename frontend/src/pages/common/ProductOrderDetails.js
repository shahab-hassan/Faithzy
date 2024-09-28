import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { enqueueSnackbar } from "notistack"
import { FaBasketShopping, FaShop } from "react-icons/fa6";
import { TbTruckDelivery } from "react-icons/tb";
import { FaUserCircle } from "react-icons/fa";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md"
import { IoIosCloseCircleOutline } from "react-icons/io";
import LeaveProductReview from '../../components/common/LeaveProductReview';
import DisputeChatRoom from '../../components/common/DisputeChatRoom';

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
  const [showStartDisputeModel, setShowStartDisputeModel] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [dispute, setDispute] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('statusUpdated')) {
      enqueueSnackbar("Status Updated Successfully!", { variant: "success" });
      localStorage.removeItem('statusUpdated');
    }
    else if (localStorage.getItem('cancellationRequest')) {
      enqueueSnackbar("Cancellation request has been sent!", { variant: "success" });
      localStorage.removeItem('cancellationRequest');
    }
    else if (localStorage.getItem('disputeStarted')) {
      enqueueSnackbar("Dispute has been started!", { variant: "success" });
      localStorage.removeItem('disputeStarted');
    }
  }, []);

  useEffect(() => {

    axios.get(`http://localhost:5000/api/v1/orders/${isBuyer ? 'buyer' : 'seller'}/product/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        if (response.data.success) {
          const order = response.data.order;
          setOrder(order);
          if (!isBuyer && subOrderId) {
            const foundSubOrder = order.products.find(subOrder => subOrder._id.toString() === subOrderId.toString());
            setSubOrder(foundSubOrder);
          }
        }
      })
      .catch(e => {
        console.error(e);
        enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
      });

    axios.get(`http://localhost:5000/api/v1/disputes/dispute/${showStatusDetails?.disputeId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        if (response.data.success)
          setDispute(response.data.dispute);
      })
      .catch(e => {
        console.log(e);
      });

  }, [id, subOrderId, token, isBuyer, showStatusDetails]);


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

  const handleResponseToDelivery = async (productId, resp) => {
    try {
      const response = await axios.put('http://localhost:5000/api/v1/orders/product/delivery/response', {
        orderId: order._id,
        productId: productId,
        response: resp
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
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
        cancellationReason,
        cancellationFrom: isBuyer ? "Buyer" : "Seller"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        localStorage.setItem('cancellationRequest', 'true');
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
    }
  }

  const handleStartDispute = async (e, productId) => {
    e.preventDefault();
    setShowStartDisputeModel(null)
    if(!disputeReason || disputeReason === ""){
      enqueueSnackbar("Dispute reason is Required!", { variant: "error" });
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/v1/disputes/product/new', {
        orderId: order._id,
        productId,
        disputeReason,
        initiatedBy: isBuyer ? "Buyer" : "Seller"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        localStorage.setItem('disputeStarted', 'true');
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
    }
  }

  const handleResponseToCancellation = async (productId, resp) => {
    try {
      const response = await axios.put('http://localhost:5000/api/v1/orders/product/cancel/response', {
        orderId: order._id,
        productId: productId,
        response: resp
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
    }
  };

  const orderStatusDetailsSeller = order && !isBuyer && subOrder && showStatusDetails && (
    <div className='orderStatusDetails'>

      {(subOrder.status[subOrder.status.length - 1].name === 'Completed' || subOrder.status[subOrder.status.length - 1].name === 'Resolved') && <LeaveProductReview subOrderId={subOrder._id} productId={showStatusDetails.productId} sellerId={showStatusDetails.sellerId} isBuyer={isBuyer} />}

      <h2 className="secondaryHeading"><span>Order</span> Status</h2>

      {subOrder.status.map((status, index) => (
        <div className='trackOrderRow' key={index}>
          <span>{new Date(status.createdAt).toLocaleString()} - </span>
          <strong>{status.name === "Active" && index === 0 ? "Order Placed" : status.name}</strong>
          {(subOrder.cancellationReason && status.name === "Cancelled") && <span> - (<strong>Reason: </strong> {showStatusDetails.cancellationReason})</span>}
        </div>
      ))}

      {subOrder.status[subOrder.status.length - 1].name !== 'Delivered' &&
        subOrder.status[subOrder.status.length - 1].name !== 'Cancelled' &&
        subOrder.status[subOrder.status.length - 1].name !== 'Completed' &&
        subOrder.status[subOrder.status.length - 1].name !== 'Resolved' &&
        subOrder.status[subOrder.status.length - 1].name !== 'On Hold' &&
        subOrder.status[subOrder.status.length - 1].name !== 'InDispute'
        && (

          <div className="inputDiv">

            <select className='dropdownPlus' onChange={(e) => setNewStatus(e.target.value)} value={newStatus}>
              <option value="">Select Status</option>
              {subOrder.status[subOrder.status.length - 1].name === 'Active' && <option value="Shipped">Shipped</option>}
              <option value="Delivered">Delivered</option>
            </select>

            <div className='actions'>
              <button onClick={handleStatusChange} disabled={!newStatus} className='secondaryBtn'>Update Status</button>
              <div className='btnsDiv'>
                <button className='secondaryBtn' onClick={() => setShowStartDisputeModel(subOrder._id)}>Start Dispute</button>
                <button className='dangerBtn' onClick={() => setShowCancellationModel(subOrder._id)}>Cancel Order</button>
              </div>
            </div>

          </div>

        )}

      {(subOrder.status[subOrder.status.length - 1].name === "InDispute" || subOrder.status[subOrder.status.length - 1].name === "Resolved") && <div className="commonChatDiv productOrderDisputeChat">
        <div className="horizontalLine"></div>
        <div>
          {subOrder.status[subOrder.status.length - 1].name === "Resolved" ?
            <>
              <h2 className="secondaryHeading">The Dispute has been <span>Resolved</span> - Admin paid <span>${dispute?.amountToSeller}</span> to you</h2>
              <p>Dispute, which was initiated by {dispute?.initiatedBy === "Seller"? "you" : "Buyer"} has been marked as Resolved by Admin. You have earned ${dispute?.amountToSeller}!  </p>
            </>
            : <>
              <h2 className="secondaryHeading">Order in <span>Dispute</span> - Chat with <span>Admin</span></h2>
              <p>You are currently in a dispute chat involving the buyer, admin, and yourself. Continue the discussion to work towards a resolution!</p>
            </>}
        </div>
        <DisputeChatRoom disputeId={subOrder.disputeId} isSourceAdmin={false} />
      </div>}

    </div>
  );

  const orderStatusDetailsBuyer = order && isBuyer && showStatusDetails && (
    <div className='orderStatusDetails'>

      {(showStatusDetails.status[showStatusDetails.status.length - 1].name === 'Completed' || showStatusDetails.status[showStatusDetails.status.length - 1].name === 'Resolved') && <LeaveProductReview subOrderId={showStatusDetails._id} productId={showStatusDetails.productId} sellerId={showStatusDetails.sellerId} isBuyer={isBuyer} />}

      <h2 className="secondaryHeading"><span>Track</span> Order</h2>

      {showStatusDetails.status.map((status, index) => (
        <div className='trackOrderRow' key={index}>
          <span>{new Date(status.createdAt).toLocaleString()} - </span>
          <strong>{status.name === "Active" && index === 0 ? "Order Placed" : status.name}</strong>
          {(showStatusDetails.cancellationReason && status.name === "Cancelled") && <span> - (<strong>Reason: </strong> {showStatusDetails.cancellationReason})</span>}
        </div>
      ))}

      <div className="actionsB">
        <Link to={`/chat?p=${showStatusDetails?.productId?.sellerId?.userId?._id}`} className='primaryBtn'>Contact Seller</Link>
        <button className='secondaryBtn'
          disabled={showStatusDetails.status[showStatusDetails.status.length - 1].name === "InDispute" ||
            showStatusDetails.status[showStatusDetails.status.length - 1].name === "Cancelled" ||
            showStatusDetails.status[showStatusDetails.status.length - 1].name === "Completed" ||
            showStatusDetails.status[showStatusDetails.status.length - 1].name === "Resolved" ||
            showStatusDetails.status[showStatusDetails.status.length - 1].name === "Delivered"}

          onClick={() => setShowStartDisputeModel(showStatusDetails._id)}
        >
          Start Dispute
        </button>
        <button className='dangerBtn'
          disabled={showStatusDetails.status[showStatusDetails.status.length - 1].name === "Delivered" ||
            showStatusDetails.status[showStatusDetails.status.length - 1].name === "Cancelled" ||
            showStatusDetails.status[showStatusDetails.status.length - 1].name === "Completed" ||
            showStatusDetails.status[showStatusDetails.status.length - 1].name === "Resolved" ||
            showStatusDetails.status[showStatusDetails.status.length - 1].name === "On Hold" ||
            showStatusDetails.status[showStatusDetails.status.length - 1].name === "InDispute"}
          onClick={() => setShowCancellationModel(showStatusDetails._id)}>
          Cancel Order
        </button>
      </div>

      {(showStatusDetails.status[showStatusDetails.status.length - 1].name === "InDispute" || showStatusDetails.status[showStatusDetails.status.length - 1].name === "Resolved") && <div className="commonChatDiv productOrderDisputeChat">
        <div className="horizontalLine"></div>
        <div>
          {showStatusDetails.status[showStatusDetails.status.length - 1].name === "Resolved" ?
            <>
              <h2 className="secondaryHeading">The Dispute has been <span>Resolved</span> - Admin refunded <span>${dispute?.amountToBuyer}</span></h2>
              <p>Dispute, which was initiated by {dispute?.initiatedBy === "Buyer"? "you" : "Seller"} has been marked as Resolved by Admin. You got ${dispute?.amountToBuyer} refund!  </p>
            </>
            : <>
              <h2 className="secondaryHeading">Order in <span>Dispute</span> - Chat with <span>Admin</span></h2>
              <p>You are currently in a dispute chat involving the seller, admin, and yourself. Continue the discussion to work towards a resolution!</p>
            </>}
        </div>
        <DisputeChatRoom disputeId={showStatusDetails.disputeId} isSourceAdmin={false} />
      </div>}

    </div>
  );

  const SellerProductOrder = order && !isBuyer && <div className="sellerProductOrderCard sellerProductOrderDetailsCard">

    <div>

      {subOrder.status[subOrder.status.length - 1].name === "Delivered" && <div className="statusAction">
        <h2 className="secondaryHeading">You marked this order as <span>Delivered</span>. It will be marked as <span>Completed</span>, once approved by Buyer!</h2>
        <div className="horizontalLine"></div>
      </div>}

      {subOrder.status[subOrder.status.length - 1].name === "Completed" && <div className="statusAction">
        <h2 className="secondaryHeading"><span>Congratulations!</span> You have earned <span>${subOrder.sellerToGet.total}</span>! You will receive your funds within 12 Business days.</h2>
        <div className="horizontalLine"></div>
      </div>}

      {subOrder.status[subOrder.status.length - 1].name === "On Hold" &&
        (subOrder.cancellationFrom === "Buyer" && !isBuyer) &&
        <div className="statusAction">
          <h2 className="secondaryHeading">{order.userId?.username} wants to <span>Cancel the Order!</span></h2>
          <div><span className='fw600'>Reason: </span>{subOrder.cancellationReason}</div>
          <p>Note: Clicking "Ok, Cancel" will cancel the Order and payment will be returned to Buyer!</p>
          <div className="btns">
            <button className='primaryBtn' onClick={() => handleResponseToCancellation(subOrder._id, "yes")}>Ok, cancel</button>
            <button className='dangerBtn' onClick={() => handleResponseToCancellation(subOrder._id, "no")}>No, don't cancel</button>
          </div>
          <div className="horizontalLine"></div>
        </div>}

      {subOrder.status[subOrder.status.length - 1].name === "On Hold" &&
        (subOrder.cancellationFrom === "Seller" && !isBuyer) &&
        <div className="statusAction">
          <h2 className="secondaryHeading">Your <span>order cancellation</span> request has been sent to Buyer. Order will be <span>cancelled</span> once buyer accepts!</h2>
          <div className="horizontalLine"></div>
        </div>}

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
              <p><FaBasketShopping className='icon' /></p>
              <div>{(subOrder.count < 10 && "0") + subOrder.count}</div>
            </div>
            <div className="column">
              <p><TbTruckDelivery className='icon' /></p>
              <div>{subOrder.status[subOrder.status.length - 1].name}</div>
            </div>
          </div>
        </div>

      </div>

      <div className='horizontalLine'></div>

    </div>

    <div className='actionsDiv'>
      <div onClick={() => setShowStatusDetails(showStatusDetails?._id === subOrder._id ? null : subOrder)}>
        Order Status {showStatusDetails ? <MdKeyboardArrowUp className='icon' /> : <MdKeyboardArrowDown className='icon' />}
      </div>
    </div>

    {showStatusDetails && orderStatusDetailsSeller}

  </div>

  const BuyerProductOrder = order && isBuyer && <div className='buyerProductOrderDetailsCard'>
    {order.products.map((product, i) => (
      <div key={i} className='buyerProductOrderCard'>

        {product.status[product.status.length - 1].name === "Delivered" && <div className="statusAction">
          <h2 className="secondaryHeading">Your order has been <span>delivered!</span> Have you received your item?</h2>
          <p>Note: Clicking "Yes, Received" will mark this order as Complete!</p>
          <div className="btns">
            <button className='primaryBtn' onClick={() => handleResponseToDelivery(product._id, "yes")}>Yes, Received</button>
            <button className='dangerBtn' onClick={() => handleResponseToDelivery(product._id, "no")}>Not Received</button>
          </div>
          <div className="horizontalLine"></div>
        </div>}

        {product.status[product.status.length - 1].name === "On Hold" &&
          (product.cancellationFrom === "Seller" && isBuyer) &&
          <div className="statusAction">
            <h2 className="secondaryHeading">{product.productId.sellerId.userId?.username} wants to <span>Cancel the Order!</span></h2>
            <div><span className='fw600'>Reason: </span>{product.cancellationReason}</div>
            <p>Note: Clicking "Ok, Cancel" will cancel the Order and payment will be returned to Buyer!</p>
            <div className="btns">
              <button className='primaryBtn' onClick={() => handleResponseToCancellation(product._id, "yes")}>Ok, cancel</button>
              <button className='dangerBtn' onClick={() => handleResponseToCancellation(product._id, "no")}>No, don't cancel</button>
            </div>
            <div className="horizontalLine"></div>
          </div>}

        {product.status[product.status.length - 1].name === "On Hold" &&
          (product.cancellationFrom === "Buyer" && isBuyer) &&
          <div className="statusAction">
            <h2 className="secondaryHeading">Your <span>order cancellation</span> request has been sent to Seller. Order will be <span>cancelled</span> once seller accepts!</h2>
            <div className="horizontalLine"></div>
          </div>}

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
          <div onClick={() => setShowStatusDetails(showStatusDetails?._id === product._id ? null : product)}>
            Order Status {showStatusDetails ? <MdKeyboardArrowUp className='icon' /> : <MdKeyboardArrowDown className='icon' />}
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
                  {isBuyer && <span>{(order.products.length < 10 && "0") + order.products.length} Product{order.products.length > 1 && "s"} - </span>}
                  <span>Order Placed on: {new Date(order.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="upperRight">${isBuyer ? order.summary.paidByBuyer.total : (subOrder.sellerToGet.total)}</div>
            </div>

            <div className="lower">
              {isBuyer ? BuyerProductOrder : SellerProductOrder}
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
                <p>${isBuyer ? order.summary.paidByBuyer.totalSalesPrice : subOrder.sellerToGet.salesPrice}</p>
              </div>
              <div className="row">
                <strong>Shipping Fees</strong>
                <p>${isBuyer ? order.summary.paidByBuyer.totalShipping : subOrder.sellerToGet.shippingFees}</p>
              </div>
              <div className="row">
                <strong>SubTotal</strong>
                <p>${isBuyer ? order.summary.paidByBuyer.subtotal : subOrder.sellerToGet.subtotal}</p>
              </div>
              <div className="row">
                <strong>Tax</strong>
                <p>{isBuyer ? "$" + order.summary.paidByBuyer.tax : "-$" + (subOrder.sellerToGet.tax).toFixed(2)}</p>
              </div>
              <div className="horizontalLine"></div>
              <div className="row">
                <strong>{isBuyer ? "You Paid" : "You will Get"}</strong>
                <p>${isBuyer ? order.summary.paidByBuyer.total : (subOrder.sellerToGet.total).toFixed(2)}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {showCancellationModel && <div className="popupDiv">
        <div className="popupContent">

          <form className="form">

            <h2 className="secondaryHeading"><span>Cancel</span> Order</h2>

            <div className="horizontalLine"></div>

            <div className="inputDiv">
              <label>Reason of Cancellation</label>
              <textarea type="text" className='inputField' value={cancellationReason} onChange={(e) => setCancellationReason(e.target.value)} placeholder='Enter Reason' />
            </div>

            <div className="buttonsDiv">
              <button className='dangerBtn' onClick={() => handleCancelOrder(showCancellationModel)}>Confirm Cancellation</button>
              <button className='secondaryBtn' onClick={() => setShowCancellationModel(null)}>Close</button>
            </div>

          </form>

          <div className="popupCloseBtn">
            <IoIosCloseCircleOutline className='icon' onClick={() => setShowCancellationModel(null)} />
          </div>

        </div>
      </div>
      }

      {showStartDisputeModel && <div className="popupDiv">
        <div className="popupContent disputePopupContent">

          <form className="form">

            <h2 className="secondaryHeading">Start <span>Dispute</span></h2>

            <div className="horizontalLine"></div>

            <div className="infoDiv">
              <p className="infoText">
                Please note that starting a dispute will change the order status to <span className='fw500'>InDispute</span>, and the admin will be notified.
                You, the {isBuyer ? "seller" : "buyer"}, and the admin will enter into a discussion via chat to resolve the issue.
                The admin will review the situation and decide how much of the order value will be refunded to {isBuyer ? "you" : "the buyer"} and how much will be paid to {isBuyer ? "the seller" : "you"}.
                Once resolved, the order will be marked as <span className='fw500'>Resolved</span>.
              </p>
              <p className="infoText">
                Ensure you have a valid reason for the dispute, as this process may take some time to resolve.
              </p>
            </div>

            <div className="horizontalLine"></div>

            <div className="inputDiv">
              <label>Reason of Dispute</label>
              <textarea type="text" className='inputField' value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} placeholder='Enter Reason' />
            </div>

            <div className="buttonsDiv">
              <button className='dangerBtn' onClick={(e) => handleStartDispute(e, showStartDisputeModel)}>Start Dispute</button>
              <button className='secondaryBtn' onClick={() => setShowStartDisputeModel(null)}>Close</button>
            </div>

          </form>

          <div className="popupCloseBtn">
            <IoIosCloseCircleOutline className='icon' onClick={() => setShowStartDisputeModel(null)} />
          </div>

        </div>
      </div>
      }

    </div>
  );
};

export default ProductOrderDetails;