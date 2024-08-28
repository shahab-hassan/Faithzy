import React, { useState, useEffect } from 'react'
import Dropdown from '../../components/common/Dropdown';
import { FaEye } from "react-icons/fa";
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { Link } from "react-router-dom"
import { IoIosCloseCircleOutline } from 'react-icons/io';

function AdminOrders({pre}) {

    const [orders, setOrders] = useState([]);
    const [ordersType, setOrdersType] = useState('Products');
    const [filterType, setFilterType] = useState('All');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [showOrderDetailsModel, setShowOrderDetailsModel] = useState(false);
    const [openedOrder, setOpenedOrder] = useState(null);
    const [openedSubOrder, setOpenedSubOrder] = useState(null);

    const productFilters = ["All", "Active", "Shipped", "Delivered", "Cancelled", "InDispute"];
    const serviceFilters = ["All", "Active", "Delivered", "Completed", "Cancelled", "Past Due", "InDispute"];

    useEffect(() => {
        const fetchOrders = () => {
            const token = localStorage.getItem('adminToken');
            axios.get(`http://localhost:5000/api/v1/orders/admin/all/`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { ordersType, pre }
            })
                .then((response) => {
                    if (response.data.success)
                        setOrders(response.data.orders);
                })
                .catch((e) => {
                    console.log(e);
                    enqueueSnackbar(e.response?.data?.error || 'Something went wrong!', { variant: 'error' });
                });
        };

        fetchOrders();
    }, [filterType, ordersType, pre]);

    useEffect(() => {
        if (filterType === 'All')
            setFilteredOrders(orders);
        else {
            const filtered = orders.filter(order =>
                ordersType === 'Products'
                    ? order.products.some(product => product.status[product.status.length - 1].name === filterType)
                    : order.service.status[order.service.status.length - 1].name === filterType
            );
            setFilteredOrders(filtered);
        }
    }, [filterType, orders, ordersType]);


    const serviceElems = ordersType === "Services" && filteredOrders.length > 0 ? filteredOrders.map((item, index) => (
        <div key={index}>
            <div className="requestRow row">
                <div className="titleField field">
                    <p className="title">{item?.service?.serviceId?.title}</p>
                </div>
                <p className="buyerField field">{item.userId?.username}</p>
                <Link to={`/ftzy-admin/sellers/${item?.service?.sellerId?._id}`} className="sellerField field">{item?.service?.sellerId?.userId?.username + " >"}</Link>
                <p className="priceField field">${item?.summary?.paidByBuyer?.salesPrice}</p>
                <p className="statusField field">{item?.service?.status[item?.service?.status?.length - 1].name}</p>
                <p className="dateField field">{new Date(item?.createdAt).toLocaleDateString()}</p>
                <div className="actionsField field">
                    <FaEye className="icon" onClick={() => handleOpenOrderDetails(item, null, false)} />
                </div>
            </div>
        </div >
    ))
        : <div className="row">Nothing to show here...</div>;


    const productElems = ordersType === "Products" && filteredOrders.length > 0 ? filteredOrders?.map((order) => (

        order?.products?.map((item, i) => {

            if (filterType !== "All" && item?.status[item?.status?.length - 1].name !== filterType)
                return null;

            return <div key={i}>
                <div className="requestRow row">
                    <div className="titleField field">
                        <p className="title">{item?.productId?.title}</p>
                    </div>
                    <p className="buyerField field">{order.userId?.username}</p>
                    <Link to={`/ftzy-admin/sellers/${item?.sellerId?._id}`} className="sellerField field">{item?.sellerId?.userId?.username + " >"}</Link>
                    <p className="priceField field">${item?.sellerToGet?.salesPrice}</p>
                    <p className="statusField field">{item?.status[item?.status?.length - 1].name}</p>
                    <p className="dateField field">{new Date(order?.createdAt).toLocaleDateString()}</p>
                    <div className="actionsField field">
                        <FaEye className="icon" onClick={() => handleOpenOrderDetails(order, item, true)} />
                    </div>
                </div>
            </div >
        })

    ))
        : <div className="row">Nothing to show here...</div>;


    const handleOrdersTypeChange = (type) => {
        setOrdersType(type);
        setFilterType("All");
    };

    const handleOpenOrderDetails = (order, subOrder, isProduct) => {
        setOpenedOrder(order);
        setOpenedSubOrder(subOrder);
        setShowOrderDetailsModel(true);
    }


    return (
        <div className='adminOrdersDiv'>
            <div className='adminOrdersContent'>

                <div className="tableDiv">
                    <div className="tableContent">
                        <div className="upper">
                            <h2 className="secondaryHeading">
                                <span>{pre === "dashboard"? "Orders" : filterType} </span>{pre === "dashboard"? "Management": "Orders"}
                                {/* <span className="totalRows">- {(filteredOrders.length < 10 && '0') + filteredOrders.length}</span> */}
                            </h2>
                            <div className="upperRight">
                                <Dropdown options={ordersType === "Products" ? productFilters : serviceFilters} selected={filterType} onSelect={setFilterType} />
                                <Dropdown options={["Products", "Services"]} onSelect={handleOrdersTypeChange} selected={ordersType} />
                                {pre === "dashboard" && <Link to="/ftzy-admin/orders" className='secondaryBtn'>View All {">"}</Link>}
                            </div>
                        </div>
                        <div className="header">
                            <p className="title">{ordersType === "Products" ? "Product" : "Service"}</p>
                            <p>Buyer</p>
                            <p>Seller</p>
                            <p>Amount</p>
                            <p>Status</p>
                            <p>Order Date</p>
                            <p>Actions</p>
                        </div>
                        <div className="rows">{
                            ordersType === "Products" ? productElems : serviceElems
                        }</div>
                    </div>
                </div>

            </div>

            {showOrderDetailsModel && (
                <div className="popupDiv addNewModelDiv">
                    <div className="popupContent">
                        <div className='form'>

                            <h2 className="secondaryHeading">About <span>Order</span></h2>
                            <div className="rows">
                                <div className="row">
                                    <div>{openedSubOrder ? "Product" : "Service"} Category</div>
                                    <div className="fw600">{openedSubOrder ? openedSubOrder.productId.category : openedOrder.service.serviceId.category}</div>
                                </div>
                                {openedSubOrder && <div className="row">
                                    <div>Quantity</div>
                                    <div className="fw600">{(openedSubOrder.count < 10 && "0") + openedSubOrder.count}</div>
                                </div>}
                            </div>

                            <div className="horizontalLine"></div>

                            <h2 className="secondaryHeading">Paid by <span>Buyer</span></h2>
                            {openedSubOrder && <div className="rows">
                                {Number(openedOrder.summary.paidByBuyer.promoDiscount) > 0 && <div className="row">
                                    <div>Coupon Applied</div>
                                    <div className="fw600">{openedOrder.summary.paidByBuyer.promoDiscount}% Discount</div>
                                </div>}
                                <div className="row">
                                    <div>Sales Price</div>
                                    <div className="fw600">${(openedSubOrder.buyerPaid.salesPrice).toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <div>Shipping Fees</div>
                                    <div className="fw600">${(openedSubOrder.buyerPaid.shippingFees).toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <div>SubTotal</div>
                                    <div className="fw600">${(openedSubOrder.buyerPaid.subtotal).toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <div>Tax</div>
                                    <div className="fw600">${(openedSubOrder.buyerPaid.tax).toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <div>Buyer Paid</div>
                                    <div className="fw600">${(openedSubOrder.buyerPaid.total).toFixed(2)}</div>
                                </div>
                            </div>}
                            {!openedSubOrder && <div className="rows">
                                {Number(openedOrder.summary.paidByBuyer.promoDiscount) > 0 && <div className="row">
                                    <div>Coupon Applied</div>
                                    <div className="fw600">{openedOrder.summary.paidByBuyer.promoDiscount}% Discount</div>
                                </div>}
                                <div className="row">
                                    <div>Sales Price</div>
                                    <div className="fw600">${(openedOrder.summary.paidByBuyer.salesPrice).toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <div>Tax</div>
                                    <div className="fw600">${(openedOrder.summary.paidByBuyer.tax).toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <div>Buyer Paid</div>
                                    <div className="fw600">${(openedOrder.summary.paidByBuyer.total).toFixed(2)}</div>
                                </div>
                            </div>}

                            <div className="horizontalLine"></div>

                            <h2 className="secondaryHeading">Seller <span>Earning</span></h2>
                            {openedSubOrder && <div className="rows">
                                <div className="row">
                                    <div>Sales Price</div>
                                    <div className="fw600">${(openedSubOrder.sellerToGet.salesPrice).toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <div>Shipping Fees</div>
                                    <div className="fw600">${(openedSubOrder.sellerToGet.shippingFees).toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <div>SubTotal</div>
                                    <div className="fw600">${(openedSubOrder.sellerToGet.subtotal).toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <div>Tax</div>
                                    <div className="fw600">${(openedSubOrder.sellerToGet.tax).toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <div>Seller To Get</div>
                                    <div className="fw600">${(openedSubOrder.sellerToGet.total).toFixed(2)}</div>
                                </div>
                            </div>}
                            {!openedSubOrder && <div className="rows">
                                <div className="row">
                                    <div>Sales Price</div>
                                    <div className="fw600">${(openedOrder.summary.sellerToGet.salesPrice).toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <div>Tax</div>
                                    <div className="fw600">${(openedOrder.summary.sellerToGet.tax).toFixed(2)}</div>
                                </div>
                                <div className="row">
                                    <div>Seller To Get</div>
                                    <div className="fw600">${(openedOrder.summary.sellerToGet.total).toFixed(2)}</div>
                                </div>
                            </div>}

                            <div className="horizontalLine"></div>
                            <h2 className="secondaryHeading">About <span>Buyer</span></h2>
                            {openedSubOrder && <div className='rows'>
                                <div className="row">
                                    <div>Name</div>
                                    <div className="fw600">{openedOrder.billingInfo.firstName + " " + openedOrder.billingInfo.lastName}</div>
                                </div>
                                <div className="row">
                                    <div>Email</div>
                                    <div className="fw600">{openedOrder.billingInfo.email}</div>
                                </div>
                                <div className="row">
                                    <div>Country</div>
                                    <div className="fw600">{openedOrder.billingInfo.country}</div>
                                </div>
                                <div className="row">
                                    <div>City</div>
                                    <div className="fw600">{openedOrder.billingInfo.city}</div>
                                </div>
                                <div className="row">
                                    <div>Phone</div>
                                    <div className="fw600">{openedOrder.billingInfo.phoneNumber}</div>
                                </div>
                            </div>}
                            {!openedSubOrder && <div className='rows'>
                                <div className="row">
                                    <div>Name</div>
                                    <div className="fw600">{openedOrder.buyerInfo.firstName + " " + openedOrder.buyerInfo.lastName}</div>
                                </div>
                                <div className="row">
                                    <div>Email</div>
                                    <div className="fw600">{openedOrder.buyerInfo.email}</div>
                                </div>
                                <div className="row">
                                    <div>Country</div>
                                    <div className="fw600">{openedOrder.buyerInfo.country}</div>
                                </div>
                                <div className="row">
                                    <div>City</div>
                                    <div className="fw600">{openedOrder.buyerInfo.city}</div>
                                </div>
                                <div className="row">
                                    <div>Phone</div>
                                    <div className="fw600">{openedOrder.buyerInfo.phoneNumber}</div>
                                </div>
                            </div>}
                            <div className="contactBuyerBtnDiv">
                                <Link className='primaryBtn'>Contact Buyer {">"}</Link>
                            </div>


                            <div className="buttonsDiv">
                                <button className="secondaryBtn" type="button" onClick={() => setShowOrderDetailsModel(false)}>Close</button>
                            </div>
                        </div>

                    </div>
                    <div className="popupCloseBtn">
                        <IoIosCloseCircleOutline className="icon" onClick={() => setShowOrderDetailsModel(false)} />
                    </div>
                </div>
            )}

        </div>
    )
}

export default AdminOrders