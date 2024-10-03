import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md"
import { IoIosCloseCircleOutline } from 'react-icons/io';
import LeaveServiceReview from '../../components/common/LeaveServiceReview';

import Gallery from "../../components/seller/Gallery"
import DisputeChatRoom from '../../components/common/DisputeChatRoom';
import { AuthContext } from '../../utils/AuthContext';

function ServiceOrderDetails({ isBuyer }) {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [order, setOrder] = useState(null);
  const [usernames, setUsernames] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0 });
  const [showActivityDetails, setShowActivityDetails] = useState(null);
  const [answers, setAnswers] = React.useState([]);
  const [showExtensionModel, setShowExtensionModel] = useState(false);
  const [extensionDate, setExtensionDate] = useState('');
  const [extensionReason, setExtensionReason] = useState('');
  const [extendedDays, setExtendedDays] = useState(0);
  const [extensionPending, setExtensionPending] = useState(false);
  const [showDeliveryModel, setShowDeliveryModel] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    description: "",
    images: []
  })
  const [galleryImages, setGalleryImages] = useState([]);
  const [cancellationPending, setCancellationPending] = useState(false);
  const [isChange, setIsChange] = useState(false);
  const [showCancelModel, setShowCancelModel] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isPastDue, setIsPastDue] = useState(false);
  const [showImageModel, setShowImageModel] = useState(null);
  const [dispute, setDispute] = useState(null);
  const [showStartDisputeModel, setShowStartDisputeModel] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const {isTabletPro} = useContext(AuthContext);

  useEffect(() => {
    if (localStorage.getItem('reqsSubmitted')) {
      enqueueSnackbar("Answers submitted Successfully!", { variant: "success" });
      localStorage.removeItem('reqsSubmitted');
    }
    else if (localStorage.getItem('disputeStarted')) {
      enqueueSnackbar("Dispute has been started!", { variant: "success" });
      localStorage.removeItem('disputeStarted');
    }
  }, []);

  useEffect(() => {
    const fetchOrderData = () => {
      axios.get(`http://localhost:5000/api/v1/orders/${isBuyer ? "buyer" : "seller"}/service/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          if (response.data.success) {
            const order = response.data.order;
            setOrder(order);
            setUsernames(response.data.usernames);
            calculateTimeRemaining(order.createdAt, order.service.pkg.deliveryDays);
            if (order.service.status[order.service.status.length - 1].name === 'Past Due')
              setIsPastDue(true);
            order.service.history.forEach((activity) => {
              if (activity.name === "cancellationSent" && !activity.isDone)
                setCancellationPending(true);
              if (activity.name === "extensionRequested" && !activity.isDone)
                setExtensionPending(true);
            });
          }
        })
        .catch(e => {
          console.error(e);
          enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
        });
    };

    if (order?.service?.disputeId) {
      axios.get(`http://localhost:5000/api/v1/disputes/dispute/${order?.service?.disputeId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          if (response.data.success)
            setDispute(response.data.dispute);
        })
    }

    fetchOrderData();

    const intervalId = setInterval(fetchOrderData, 60000);

    return () => clearInterval(intervalId);
  }, [id, isChange, isBuyer, token, order?.service?.disputeId]);


  const calculateTimeRemaining = (createdAt, deliveryDays) => {
    const dueDate = new Date(createdAt);
    dueDate.setDate(dueDate.getDate() + deliveryDays);
    const now = new Date();
    const timeDiff = dueDate - now;

    if (timeDiff <= 0) {
      setIsPastDue(true);
      setTimeRemaining({ days: 0, hours: 0, minutes: 0 });
      return;
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    setTimeRemaining({ days, hours, minutes });
    // const dueDate = new Date(createdAt);
    // dueDate.setDate(dueDate.getDate() + deliveryDays);
    // const now = new Date();
    // const timeDiff = dueDate - now;

    // if (timeDiff <= 0) {
    //   setIsPastDue(true);
    //   setTimeRemaining({ days: 0, hours: 0, minutes: 0 });
    //   return;
    // }

    // const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    // const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    // const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    // setTimeRemaining({ days, hours, minutes });
  };

  const formatDate = (date) => {
    const options = { month: 'short', day: 'numeric', year: '2-digit' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const formatDateTime = (date) => {
    const options = { month: 'short', day: 'numeric', year: '2-digit' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const formattedDate = new Date(date).toLocaleDateString(undefined, options);
    const formattedTime = new Date(date).toLocaleTimeString(undefined, timeOptions);
    return `${formattedTime} - ${formattedDate}`;
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmitReqs = async (e) => {
    e.preventDefault();

    if (answers.length !== order.service.serviceId.questions.length) {
      enqueueSnackbar("Please answer all Questions", { variant: "warning" })
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/v1/orders/buyer/service/answers/${id}`, { answers }, { headers: { Authorization: `Bearer ${token}` } });
      enqueueSnackbar("Answers submitted successfully!", { variant: 'success' });
      localStorage.setItem('reqsSubmitted', 'true');
      window.location.reload();
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e?.response?.data?.error || "Failed to submit answers", { variant: 'error' });
    }
  }

  const handleExtensionDateChange = (e) => {
    const newDate = new Date(e.target.value);
    const originalDeadline = new Date(new Date(order.createdAt).getTime() + order.service.pkg.deliveryDays * 24 * 60 * 60 * 1000);
    const daysDiff = Math.ceil((newDate - originalDeadline) / (24 * 60 * 60 * 1000));
    setExtensionDate(e.target.value);
    setExtendedDays(daysDiff);
  };

  const handleSendExtension = async (e) => {
    e.preventDefault();

    setShowExtensionModel(false);

    try {
      await axios.put(`http://localhost:5000/api/v1/orders/seller/service/extension/request/${id}`, {
        extensionDate,
        extensionReason
      }, { headers: { Authorization: `Bearer ${token}` } });

      enqueueSnackbar("Extension request sent successfully!", { variant: 'success' });
      setExtensionPending(true);
      setIsChange(prev => !prev);
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e?.response?.data?.error || "Failed to send extension request", { variant: 'error' });
    }
  };

  const handleResponseToExtension = async (response, activityId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/v1/orders/buyer/service/extension/response/${order._id}/${activityId}`, { response }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        if (response === "accept")
          enqueueSnackbar("Extension Accepted Successfully!", { variant: "success" })
        else if (response === "decline")
          enqueueSnackbar("Extension Declined!", { variant: "success" })
        setIsChange(prev => !prev);

        setExtensionPending(false);
      }

    } catch (e) {
      console.error('Error responding to extension request:', e);
      enqueueSnackbar(e?.response?.data?.error || "Error responding to extension request", { variant: 'error' });
    }
  }

  const handleDeliveryImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const galleryImageUrls = [];

    const newImages = files.map(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        galleryImageUrls.push(reader.result);
        if (galleryImageUrls.length === files.length)
          setGalleryImages(galleryImageUrls);
      };
      reader.readAsDataURL(file);
      return file;
    });

    setDeliveryDetails(prev => ({
      ...prev,
      images: [...newImages]
    }));
  };

  const handleSendDelivery = async (e) => {
    e.preventDefault();

    if (deliveryDetails.images.length > 5) {
      enqueueSnackbar("Max of 5 images are allowed!", { variant: 'warning' });
      return;
    }

    setShowDeliveryModel(false);
    const formData = new FormData();
    formData.append('description', deliveryDetails.description);

    deliveryDetails.images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      await axios.put(`http://localhost:5000/api/v1/orders/seller/service/delivery/send/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      enqueueSnackbar("Order Delivered Successfully!", { variant: 'success' });
      setIsChange(prev => !prev);
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e?.response?.data?.error || "Failed to deliver order!", { variant: 'error' });
    }
  };

  const handleResponseToDelivery = async (response, activityId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/v1/orders/buyer/service/delivery/response/${order._id}/${activityId}`, { response }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        if (response === "accept")
          enqueueSnackbar("Delivery Accepted Successfully!", { variant: "success" })
        else if (response === "decline")
          enqueueSnackbar("Delivery Declined!", { variant: "success" })
        setIsChange(prev => !prev);
      }

    } catch (e) {
      console.error(e);
      enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: 'error' });
    }
  }

  const handleSendCancellation = async (e) => {
    e.preventDefault();

    setShowCancelModel(false);

    try {
      await axios.put(`http://localhost:5000/api/v1/orders/seller/service/cancel/request/${id}`, {
        cancellationReason
      }, { headers: { Authorization: `Bearer ${token}` } });

      enqueueSnackbar("Cancellation request sent successfully!", { variant: 'success' });
      setCancellationPending(true);
      setIsChange(prev => !prev);
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e?.response?.data?.error || "Failed to send order cancel request", { variant: 'error' });
    }
  };

  const handleResponseToCancellation = async (response, activityId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/v1/orders/buyer/service/cancel/response/${order._id}/${activityId}`, { response }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        if (response === "accept")
          enqueueSnackbar("Order has been Cancelled!", { variant: "success" })
        else if (response === "decline")
          enqueueSnackbar("Cancellation Request Declined!", { variant: "success" })
        setCancellationPending(false);
        setIsChange(prev => !prev);
      }

    } catch (e) {
      console.error(e);
      enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: 'error' });
    }
  }

  const handleStartDispute = async (e) => {

    e.preventDefault();

    if (!disputeReason || disputeReason === "") {
      enqueueSnackbar("Dispute reason is Required!", { variant: "error" });
      return;
    }

    setShowStartDisputeModel(null)
    try {
      const response = await axios.post('http://localhost:5000/api/v1/disputes/service/new', {
        orderId: order._id,
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

  const reqRequiredSection = order && <form className='form' onSubmit={handleSubmitReqs}>
    {order.service.serviceId.questions.map((question, index) => {
      return <div className='inputDiv' key={index}>
        <label>{question} <span>*</span></label>
        <textarea
          type="text"
          className='inputField'
          placeholder='Enter Answer...'
          value={answers[index] || ''}
          onChange={(e) => handleAnswerChange(index, e.target.value)}
          required
        />
      </div>
    })}
    <button type='submit' className='primaryBtn'>Submit Answers</button>
  </form>

  const reqsSubmittedSection = order && order.service.serviceId.questions.map((question, index) => {
    return <div className='reqsActivity'>
      <div className='question'>{question}</div>
      <div className='answer'>{order.answers[index]}</div>
    </div>
  })

  const ExtensionRequestedSection = ({ activity }) => {
    return <>
      <div><strong>Reason: </strong>{activity.description.text}</div>
      {isBuyer && !activity.isDone && <div className='detailsBtns'>
        <button className='primaryBtn' disabled={activity.isDone} onClick={() => handleResponseToExtension("accept", activity._id)}>Accept</button>
        <button className='secondaryBtn' disabled={activity.isDone} onClick={() => handleResponseToExtension("decline", activity._id)}>Decline</button>
      </div>}
    </>
  }

  const DeliverySentSection = ({ activity }) => {
    return <>
      <div><strong>Description: </strong>{activity.description.text}</div>

      <div className='deliveryImages'>{activity.description.images.map((img, index) => {
        return <img key={index} src={`http://localhost:5000/${img}`} alt="Error" style={{ cursor: "pointer" }} onClick={() => setShowImageModel(img)} />
      })}</div>

      {isBuyer && !activity.isDone && <div className='detailsBtns'>
        <button className='primaryBtn' disabled={activity.isDone} onClick={() => handleResponseToDelivery("accept", activity._id)}>Accept Delivery</button>
        <button className='secondaryBtn' disabled={activity.isDone} onClick={() => handleResponseToDelivery("decline", activity._id)}>Ask For Revision</button>
      </div>}
    </>
  }

  const CancellationSentSection = ({ activity }) => {
    return <>
      <div><strong>Reason: </strong>{activity.description.text}</div>

      {isBuyer && !activity.isDone && <div className='detailsBtns'>
        <button className='primaryBtn' disabled={activity.isDone} onClick={() => handleResponseToCancellation("accept", activity._id)}>Accept</button>
        <button className='secondaryBtn' disabled={activity.isDone} onClick={() => handleResponseToCancellation("decline", activity._id)}>Decline</button>
      </div>}
    </>
  }

  const historyActivities = order && order.service.history.map((activity, index) => {

    const actionBy = ((isBuyer && activity.role === "Buyer") || (!isBuyer && activity.role === "Seller")) ? "You" : isBuyer ? usernames[1] : usernames[0];

    if (activity.name === "requirementsRequired" && !isBuyer)
      return "";

    let detailToShow = null;
    detailToShow = activity.name === "requirementsRequired" && isBuyer ? reqRequiredSection : detailToShow;
    detailToShow = activity.name === "requirementsSubmitted" ? reqsSubmittedSection : detailToShow;
    detailToShow = activity.name === "extensionRequested" ? <ExtensionRequestedSection activity={activity} /> : detailToShow;
    detailToShow = activity.name === "deliverySent" ? <DeliverySentSection activity={activity} /> : detailToShow;
    detailToShow = activity.name === "cancellationSent" ? <CancellationSentSection activity={activity} /> : detailToShow;

    return <div className={`activity ${order.service.history.length - 1 === index && "lastElem"}`} key={index}>
      <div className="upper">
        <div className='title'>
          {activity.name !== "orderStarted" && <span className='actionBy'>{actionBy} </span>}
          <span>{activity.message} </span>
          <span className='time'>- {formatDateTime(activity.createdAt)}</span>
        </div>
        {detailToShow && <div onClick={() => setShowActivityDetails(showActivityDetails === activity._id ? null : activity._id)}>
          {showActivityDetails === activity._id ? <MdKeyboardArrowUp className='showDetails' /> :
            <MdKeyboardArrowDown className='showDetails' />}
        </div>}
      </div>

      {detailToShow && showActivityDetails === activity._id &&
        <div className="details">
          {detailToShow}
        </div>}

      {order.service.history.length - 1 !== index && <div className='horizontalLine'></div>}
    </div>
  });

  if (!order) return <div>Loading...</div>;

  const startedOn = formatDate(order.createdAt);
  const dueOn = formatDate(new Date(new Date(order.createdAt).getTime() + order.service.pkg.deliveryDays * 24 * 60 * 60 * 1000));

  const crrStatus = order && order.service.status[order.service.status.length - 1].name;

  return (
    <div className='serviceOrderDetailsDiv'>
      <section className="section">
        <div className="serviceOrderDetailsContent">

          <div className="leftContainer">

            {!isTabletPro && (order.service.status[order.service.status.length - 1].name === "InDispute" || order.service.status[order.service.status.length - 1].name === "Resolved") && <div className="leftUpper">
              <div className="commonChatDiv serviceOrderDisputeChat">
                <div>
                  {isBuyer ? order.service.status[order.service.status.length - 1].name === "Resolved" ?
                    <>
                      <h2 className="secondaryHeading">The Dispute has been <span>Resolved</span> - Admin refunded <span>${dispute?.amountToBuyer}</span></h2>
                      <p>Dispute, which was initiated by {dispute?.initiatedBy === "Buyer" ? "you" : "Seller"} has been marked as Resolved by Admin. You got ${dispute?.amountToBuyer} refund!  </p>
                    </>
                    : <>
                      <h2 className="secondaryHeading">Order in <span>Dispute</span> - Chat with <span>Admin</span></h2>
                      <p>You are currently in a dispute chat involving the seller, admin, and yourself. Continue the discussion to work towards a resolution!</p>
                    </> : order.service.status[order.service.status.length - 1].name === "Resolved" ?
                    <>
                      <h2 className="secondaryHeading">The Dispute has been <span>Resolved</span> - Admin paid <span>${dispute?.amountToSeller}</span> to you</h2>
                      <p>Dispute, which was initiated by {dispute?.initiatedBy === "Seller" ? "you" : "Buyer"} has been marked as Resolved by Admin. You have earned ${dispute?.amountToSeller}!  </p>
                    </>
                    : <>
                      <h2 className="secondaryHeading">Order in <span>Dispute</span> - Chat with <span>Admin</span></h2>
                      <p>You are currently in a dispute chat involving the buyer, admin, and yourself. Continue the discussion to work towards a resolution!</p>
                    </>}
                </div>
                <DisputeChatRoom disputeId={order.service.disputeId} isSourceAdmin={false} />
              </div>
            </div>}

            <div className="leftHistory">
              {(order.service.status[order.service.status.length - 1].name === "Completed" || order.service.status[order.service.status.length - 1].name === "Resolved") && <LeaveServiceReview orderId={order._id} sellerId={order?.service?.serviceId?.sellerId?._id || order?.service?.serviceId?.sellerId} serviceId={order?.service?.serviceId} isBuyer={isBuyer} />}
              <h2 className="secondaryHeading"><span>Order</span> History</h2>
              {!(order.service.status[order.service.status.length - 1].name === "Completed" || order.service.status[order.service.status.length - 1].name === "Resolved") && <div className="horizontalLine"></div>}
              <div className="history">
                {historyActivities}
              </div>
            </div>
          </div>

          <div className="rightBox">

            <div className="orderDetails">
              <h2 className="secondaryHeading"><span>Order</span> Details</h2>
              <div className="horizontalLine"></div>
              <div className="posting">
                <div className="imgDiv">
                  <img src={`http://localhost:5000/${order.service.serviceId.serviceImages[0]}`} alt="Error" />
                </div>
                <p className="singleLineText">{order.service.serviceId.title}</p>
              </div>
              <div className="details">

                {isBuyer && <div><p>Seller</p><Link to={`/profile/${order?.service?.serviceId?.sellerId?._id}`} className='username'>{usernames[1] + " >"}</Link></div>}
                {!isBuyer && <div><p>Buyer</p><strong className='username'>{usernames[0]}</strong></div>}

                <div><p>Order ID</p><strong>#{order._id}</strong></div>
                <div><p>Status</p><strong>{order.service.status[order.service.status.length - 1].name}</strong></div>

                {isBuyer && <><div><p>Price</p><strong>${(order.summary.paidByBuyer.salesPrice).toFixed(2)}</strong></div>
                  <div><p>Service Fee</p><strong>${(order.summary.paidByBuyer.tax).toFixed(2)}</strong></div>
                  <div><p>You Paid</p><strong>${(order.summary.paidByBuyer.total).toFixed(2)}</strong></div></>}

                {!isBuyer && <><div><p>Price</p><strong>${(order.summary.sellerToGet.salesPrice).toFixed(2)}</strong></div>
                  <div><p>Service Fee</p><strong>-${(order.summary.sellerToGet.tax).toFixed(2)}</strong></div>
                  <div><p>You will Get</p><strong>${(order.summary.sellerToGet.total).toFixed(2)}</strong></div></>}

              </div>
              <div className="actions">
                <Link to={`/chat?p=${!isBuyer ? order?.userId?._id : order?.service?.serviceId?.sellerId?.userId?._id}`} className='primaryBtn'>{`Contact ${isBuyer ? "Seller" : "Buyer"}`}</Link>
                <button className='secondaryBtn' disabled={crrStatus === "InDispute" || crrStatus === "Completed" || crrStatus === "Cancelled" || crrStatus === "Resolved" || crrStatus === "Delivered"} onClick={() => setShowStartDisputeModel(true)}>Start Dispute</button>
                <button className='dangerBtn' onClick={() => setShowCancelModel(true)} disabled={cancellationPending || crrStatus === "InDispute" || crrStatus === "Completed" || crrStatus === "Delivered" || crrStatus === "Cancelled" || crrStatus === "Resolved"}>{isBuyer ? "Cancel Order" : "Ask to Cancel"}</button>
              </div>
            </div>

            <div className="timeRemaining">
              <h2 className="secondaryHeading"><span>Time</span> Remaining</h2>
              <div className="horizontalLine"></div>
              {crrStatus !== "Completed" && crrStatus !== "Cancelled" && crrStatus !== "InDispute" && crrStatus !== "Resolved" && <><div className="countdownBox">
                <div><strong className={`${isPastDue && "pastDue"}`}>{(timeRemaining.days < 10 && "0") + timeRemaining.days}</strong> Days</div>
                <div className="verticalLine"></div>
                <div><strong className={`${isPastDue && "pastDue"}`}>{(timeRemaining.hours < 10 && "0") + timeRemaining.hours}</strong> Hours</div>
                <div className="verticalLine"></div>
                <div><strong className={`${isPastDue && "pastDue"}`}>{(timeRemaining.minutes < 10 && "0") + timeRemaining.minutes}</strong> Minutes</div>
              </div>
                <div className="horizontalLine"></div></>}
              <div className="details">
                <div><p>Delivery Time</p><strong>{order.service.pkg.deliveryDays} days</strong></div>
                <div><p>Started On</p><strong>{startedOn}</strong></div>
                <div><p>Due On</p><strong>{dueOn}</strong></div>
              </div>
              {!isBuyer && <div className="actions">
                <button className='primaryBtn' disabled={crrStatus === "InDispute" || crrStatus === "Completed" || crrStatus === "Delivered" || crrStatus === "Cancelled" || crrStatus === "Resolved"} onClick={() => setShowDeliveryModel(true)}>Deliver Now</button>
                <button className='primaryBtn2' disabled={extensionPending || crrStatus === "InDispute" || crrStatus === "Delivered" || crrStatus === "Completed" || crrStatus === "Cancelled" || crrStatus === "Resolved"} onClick={() => setShowExtensionModel(true)}>Ask For Extension</button>
              </div>}
            </div>

          </div>

        </div>
      </section>

      {showExtensionModel &&
        <div className="popupDiv">
          <div className="popupContent">
            <form className="form" onSubmit={handleSendExtension}>
              <div className='inputDiv'>
                <label>Extension Date <span>*</span></label>
                <input
                  type="date"
                  className='inputField'
                  min={new Date(new Date(order.createdAt).getTime() + ((order.service.pkg.deliveryDays + 1) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]}
                  value={extensionDate}
                  onChange={handleExtensionDateChange}
                  required
                />
              </div>
              <div className='inputDiv'>
                <span>Extended Delivery Days: </span>
                <strong>{(extendedDays < 10 && "0") + extendedDays}</strong>
              </div>
              <div className='inputDiv'>
                <label>Reason for Extension <span>*</span></label>
                <textarea
                  type="text"
                  className='inputField'
                  placeholder='Enter reason...'
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  required
                />
              </div>
              <div className="buttonsDiv">
                <button className='primaryBtn' type="submit">Send Extension</button>
                <button className='secondaryBtn' type="button" onClick={() => setShowExtensionModel(false)}>Close</button>
              </div>
            </form>
          </div>
          <div className="popupCloseBtn">
            <IoIosCloseCircleOutline className='icon' onClick={() => setShowExtensionModel(false)} />
          </div>
        </div>
      }

      {showDeliveryModel &&
        <div className="popupDiv">
          <div className="popupContent">
            <form className="form" onSubmit={handleSendDelivery}>
              <div className='inputDiv'>
                <label>Description <span>*</span></label>
                <textarea
                  type="text"
                  className='inputField'
                  placeholder='Explain what you did...'
                  value={deliveryDetails.description}
                  onChange={(e) => setDeliveryDetails(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              <Gallery images={galleryImages} setImages={setGalleryImages} handleImageChange={handleDeliveryImageChange} />
              <div className="buttonsDiv">
                <button className='primaryBtn' type="submit">Send Delivery</button>
                <button className='secondaryBtn' type="button" onClick={() => setShowDeliveryModel(false)}>Close</button>
              </div>
            </form>
          </div>
          <div className="popupCloseBtn">
            <IoIosCloseCircleOutline className='icon' onClick={() => setShowDeliveryModel(false)} />
          </div>
        </div>
      }

      {showCancelModel &&
        <div className="popupDiv">
          <div className="popupContent">
            <form className="form" onSubmit={handleSendCancellation}>
              <div className='inputDiv'>
                <label>Reason for Cancellation <span>*</span></label>
                <textarea
                  type="text"
                  className='inputField'
                  placeholder='Explain why you want to cancel order?'
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  required
                />
              </div>
              <div className="buttonsDiv">
                <button className='primaryBtn' type="submit">Send Request</button>
                <button className='secondaryBtn' type="button" onClick={() => setShowCancelModel(false)}>Close</button>
              </div>
            </form>
          </div>
          <div className="popupCloseBtn">
            <IoIosCloseCircleOutline className='icon' onClick={() => setShowCancelModel(false)} />
          </div>
        </div>
      }

      {showImageModel &&
        <div className="popupDiv">
          <div className="popupContent">

            <div className="form">

              <h2 className="secondaryHeading"><span>Preview</span> Image</h2>

              <div className="horizontalLine"></div>

              <div className="imgDiv previewImgDiv">
                <img src={`http://localhost:5000/${showImageModel}`} alt="Error" />
              </div>

              <div className="buttonsDiv">
                <button className='secondaryBtn' onClick={() => setShowImageModel(null)}>Close</button>
              </div>

            </div>

            <div className="popupCloseBtn">
              <IoIosCloseCircleOutline className='icon' onClick={() => setShowImageModel(null)} />
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
              <button className='dangerBtn' onClick={handleStartDispute}>Start Dispute</button>
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
}

export default ServiceOrderDetails;
