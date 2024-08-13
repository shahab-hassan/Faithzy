import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const token = localStorage.getItem("token")

    useEffect(() => {
        axios.get('http://localhost:5000/api/v1/orders/seller/all', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setOrders(response.data.orders);
            })
            .catch(error => {
                console.error(error);
            });
    }, [token]);

    const updateOrderStatus = (id, status) => {
        axios.put(`http://localhost:5000/api/v1/orders/status/${id}`, { status }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setOrders(orders.map(order => order._id === id ? response.data.order : order));
            })
            .catch(error => {
                console.error(error);
            });
    };

    return (
        <div>
            <h2>Your Orders</h2>
            <ul>
                {orders.map(order => (
                    <li key={order._id}>
                        <Link to={`/orders/seller/${order._id}`}>{order._id}</Link>
                        <p>Status: {order.status}</p>
                        <button onClick={() => updateOrderStatus(order._id, 'Completed')}>Mark as Completed</button>
                        <button onClick={() => updateOrderStatus(order._id, 'Cancelled')}>Cancel Order</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SellerOrders;