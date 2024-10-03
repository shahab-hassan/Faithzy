import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { enqueueSnackbar } from "notistack";
import { FaBasketShopping } from "react-icons/fa6";
import { TbTruckDelivery } from "react-icons/tb";
import { FaShop } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import { BsHourglassSplit } from "react-icons/bs";
import { FiDollarSign } from "react-icons/fi";

import DropDown from "../../components/common/Dropdown";
import { hostNameBack } from '../../utils/constants';

const Orders = ({ pageType }) => {
  const [searchParams] = useSearchParams();

  const [orders, setOrders] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(pageType === "dashboard" ? "Active" : "All");
  const [ordersType, setOrdersType] = useState(searchParams.get("s") === "t" ? "Services" : "Products");
  const token = localStorage.getItem("token");
  const productFilters = ["All", "Active", "Shipped", "Delivered", "Completed", "On Hold", "Cancelled", "InDispute", "Resolved"];
  const serviceFilters = ["All", "Active", "Delivered", "Completed", "Cancelled", "Past Due", "InDispute", "Resolved"];

  useEffect(() => {
    let url;
    if (pageType === "buyer") {
      url = `${hostNameBack}/api/v1/orders/buyer/${ordersType === "Products" ? "product" : "service"}/all`;
    } else if (pageType === "seller" || pageType === "dashboard") {
      url = `${hostNameBack}/api/v1/orders/seller/${ordersType === "Products" ? "product" : "service"}/all`;
    }

    axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        if (response.data.success) setOrders(response.data.orders);
      })
      .catch(e => {
        console.error(e);
        enqueueSnackbar(e?.response?.data?.error || "Something went wrong!", { variant: "error" });
      });
  }, [token, pageType, ordersType, selectedFilter]);

  const handleOrdersTypeChange = (type) => {
    setOrdersType(type);
    setSelectedFilter(pageType === "dashboard" ? "Active" : "All");
  };

  const calculateDeadline = (orderDate, deliveryDays) => {
    const deadline = new Date(orderDate);
    deadline.setDate(deadline.getDate() + deliveryDays);

    const options = { month: 'short', day: 'numeric', year: '2-digit' };
    return deadline.toLocaleDateString(undefined, options);
  };

  const BuyerProductOrders = orders && pageType === "buyer" && ordersType === "Products" ? orders.map((order, index) => {
    if (!order.products) return null;

    const filteredProducts = order.products.filter(product =>
      selectedFilter === "All" || selectedFilter === product.status[product.status.length - 1].name
    );

    if (filteredProducts.length === 0) return null;

    return (
      <div className="buyerProductOrderCard" key={index}>
        {filteredProducts.map((product, i) => (
          <div key={i}>
            <div className="order">
              <div className="left">
                <div className="leftLeft">
                  <div className="imgDiv">
                    <img src={`${hostNameBack}/${product.productId?.productImages[0]}`} alt="Error" />
                  </div>
                  <div className="productInfo">
                    <p className='singleLineText'>{product.productId?.title}</p>
                    <p className='category'>{product.productId?.category}</p>
                  </div>
                </div>
                <div className="leftRight">
                  <div className="column">
                    <p><FaShop className='icon' /></p>
                    <Link to={`/profile/${product?.productId?.sellerId?._id}`}>{product.productId?.sellerId?.userId?.username + " >"}</Link>
                  </div>
                  <div className="column">
                    <p><FaBasketShopping className='icon' /></p>
                    <div>{product.count < 10 ? "0" + product.count : product.count}</div>
                  </div>
                  <div className="column">
                    <p><TbTruckDelivery className='icon' /></p>
                    <div>{product.status[product.status.length - 1].name}</div>
                  </div>
                  <div className="column responsivePrice">
                    <p><FiDollarSign className='icon' /></p>
                    <div>${product.buyerPaid.salesPrice}</div>
                  </div>
                </div>
              </div>
              <div className="right">
                <div className="price">${product.buyerPaid.salesPrice}</div>
                <Link to={`/chat?p=${product?.productId?.sellerId?.userId?._id}`} className='secondaryBtn'>{"Contact Seller >"}</Link>
              </div>
            </div>
            <div className='horizontalLine'></div>
          </div>
        ))}
        <div className='actionsDiv'>
          <Link to={`/orders/product/orderDetails/${order._id}`}>{"View Order >"}</Link>
        </div>
      </div>
    );
  }) : "Nothing to show here!";

  const SellerProductOrders = orders && (pageType === "seller" || pageType === "dashboard") && ordersType === "Products" ? orders.map((order, index) => {
    if (!order.products) return null;

    const filteredProducts = order.products.filter(product =>
      selectedFilter === "All" || selectedFilter === product.status[product.status.length - 1].name
    );

    if (filteredProducts.length === 0) return null;

    return (
      <div className='subOrders' key={index}>
        {filteredProducts.map((product, i) => (
          <div className="sellerProductOrderCard" key={i}>
            <div className="order">
              <div className="left">
                <div className="leftLeft">
                  <div className="imgDiv">
                    <img src={`${hostNameBack}/${product.productId?.productImages[0]}`} alt="Error" />
                  </div>
                  <div className="productInfo">
                    <p className='singleLineText'>{product.productId?.title}</p>
                    <p className='category'>{product.productId?.category}</p>
                  </div>
                </div>
                <div className="leftRight">
                  <div className="column">
                    <p><FaUserCircle className='icon' /></p>
                    <div>{order.userId?.username}</div>
                  </div>
                  <div className="column">
                    <p><FaBasketShopping className='icon' /></p>
                    <div>{product.count < 10 ? "0" + product.count : product.count}</div>
                  </div>
                  <div className="column">
                    <p><TbTruckDelivery className='icon' /></p>
                    <div>{product.status[product.status.length - 1].name}</div>
                  </div>
                  <div className="column responsivePrice">
                    <p><FiDollarSign className='icon' /></p>
                    <div>${product.sellerToGet.salesPrice}</div>
                  </div>
                </div>
              </div>
              <div className="right">
                <div className="price">${product.sellerToGet.salesPrice}</div>
                <Link to={`/chat?p=${order?.userId?._id}`} className='secondaryBtn'>{"Contact Buyer >"}</Link>
              </div>
            </div>
            <div className='horizontalLine'></div>
            <div className='actionsDiv'>
              <Link to={`/seller/orders/product/orderDetails/${order._id}/${product._id}`}>{"View Order >"}</Link>
            </div>
          </div>
        ))}
      </div>
    );
  }) : "Nothing to show here!";

  const BuyerServiceOrders = orders && pageType === "buyer" && ordersType === "Services" ? orders.map((order, index) => {

    const crrService = order.service;

    if (!crrService) return null;

    const filteredServices = selectedFilter === "All" || selectedFilter === crrService.status[crrService.status.length - 1].name;

    if (!filteredServices) return null;

    const deadline = calculateDeadline(order.createdAt, crrService.pkg.deliveryDays);

    return (
      <div className="buyerProductOrderCard" key={index}>
        <div>
          <div className="order">
            <div className="left">
              <div className="leftLeft">
                <div className="imgDiv">
                  <img src={`${hostNameBack}/${crrService.serviceId?.serviceImages && crrService.serviceId?.serviceImages[0]}`} alt="Error" />
                </div>
                <div className="productInfo">
                  <p className='singleLineText'>{crrService.serviceId?.title}</p>
                  <p className='category'>{crrService.serviceId?.category}</p>
                </div>
              </div>
              <div className="leftRight">
                <div className="column">
                  <p><FaShop className='icon' /></p>
                  <Link to={`/profile/${crrService?.serviceId?.sellerId?._id}`}>{crrService.serviceId?.sellerId?.userId?.username + " >"}</Link>
                </div>
                <div className="column">
                  <p><TbTruckDelivery className='icon' /></p>
                  <div>{crrService.status[crrService.status.length - 1].name}</div>
                </div>
                <div className="column">
                  <p><BsHourglassSplit className='icon' /></p>
                  <div>{deadline}</div>
                </div>
                <div className="column responsivePrice">
                  <p><FiDollarSign className='icon' /></p>
                  <div>${order.summary.paidByBuyer.salesPrice}</div>
                </div>
              </div>
            </div>
            <div className="right">
              <div className="price">${order.summary.paidByBuyer.salesPrice}</div>
              <Link to={`/chat?p=${crrService.serviceId?.sellerId?.userId?._id}`} className='secondaryBtn'>{"Contact Seller >"}</Link>
            </div>
          </div>
          <div className="horizontalLine"></div>
        </div>
        <div className='actionsDiv'>
          <Link to={`/orders/posting/orderDetails/${order._id}`}>{"View Order >"}</Link>
        </div>

      </div>
    );
  }) : "Nothing to show here!";

  const SellerServiceOrders = orders && (pageType === "seller" || pageType === "dashboard") && ordersType === "Services" ? orders.map((order, index) => {

    const crrService = order.service;

    if (!crrService) return null;

    const filteredServices = selectedFilter === "All" || selectedFilter === crrService.status[crrService.status.length - 1].name;

    if (!filteredServices) return null;

    const deadline = calculateDeadline(order.createdAt, crrService.pkg.deliveryDays);

    return (
      <div className="buyerProductOrderCard" key={index}>
        <div>
          <div className="order">
            <div className="left">
              <div className="leftLeft">
                <div className="imgDiv">
                  <img src={`${hostNameBack}/${crrService.serviceId?.serviceImages && crrService.serviceId?.serviceImages[0]}`} alt="Error" />
                </div>
                <div className="productInfo">
                  <p className='singleLineText'>{crrService.serviceId?.title}</p>
                  <p className='category'>{crrService.serviceId?.category}</p>
                </div>
              </div>
              <div className="leftRight">
                <div className="column">
                  <p><FaUserCircle className='icon' /></p>
                  <div>{order.userId?.username}</div>
                </div>
                <div className="column">
                  <p><TbTruckDelivery className='icon' /></p>
                  <div>{crrService.status[crrService.status.length - 1].name}</div>
                </div>
                <div className="column">
                  <p><BsHourglassSplit className='icon' /></p>
                  <div>{deadline}</div>
                </div>
                <div className="column responsivePrice">
                  <p><FiDollarSign className='icon' /></p>
                  <div>${order.summary.sellerToGet.salesPrice}</div>
                </div>
              </div>
            </div>
            <div className="right">
              <div className="price">${order.summary.sellerToGet.salesPrice}</div>
              <Link to={`/chat?p=${order.userId?._id}`} className='secondaryBtn'>{"Contact Buyer >"}</Link>
            </div>
          </div>
          <div className="horizontalLine"></div>
        </div>
        <div className='actionsDiv'>
          <Link to={`/seller/orders/posting/orderDetails/${order._id}`}>{"View Order >"}</Link>
        </div>

      </div>
    );
  }) : "Nothing to show here!";

  const hasOrders = orders && (ordersType === "Products"
    ? orders.some(order => order.products && order.products.some(product =>
      selectedFilter === "All" || selectedFilter === product.status[product.status.length - 1].name
    ))
    : orders.some(order => selectedFilter === "All" || selectedFilter === order.service?.status[order.service?.status.length - 1].name));

  return (
    <div className='ordersDiv'>
      <section className="section">
        <div className="ordersContent">

          <div className="responsiveFilters">
            {pageType !== "dashboard" &&
              <DropDown options={ordersType === "Products" ? productFilters : serviceFilters} selected={selectedFilter} onSelect={setSelectedFilter} />}
            <DropDown options={["Products", "Services"]} selected={ordersType} onSelect={handleOrdersTypeChange} />
          </div>

          <div className="upper">
            <section className="section">

              <h2 className="primaryHeading">{selectedFilter} <span>Orders</span></h2>
              <div className="upperRight">
                {pageType !== "dashboard" &&
                  <DropDown options={ordersType === "Products" ? productFilters : serviceFilters} selected={selectedFilter} onSelect={setSelectedFilter} />}
                <DropDown options={["Products", "Services"]} selected={ordersType} onSelect={handleOrdersTypeChange} />
              </div>

            </section>
          </div>
          
          <div className="orders">
            {pageType === "buyer" ?
              hasOrders ? ordersType === "Products" ? BuyerProductOrders : BuyerServiceOrders : "Nothing to show here!"
              : hasOrders ? ordersType === "Products" ? SellerProductOrders : SellerServiceOrders : "Nothing to show here!"
            }
          </div>
        </div>
      </section>
    </div>
  );
};

export default Orders;
