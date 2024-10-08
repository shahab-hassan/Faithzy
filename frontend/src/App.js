import React, { useContext } from 'react';
import { Route, Routes } from 'react-router-dom';

import Home from "./pages/buyer/Home";
import ProductDetails from "./pages/buyer/ProductDetails";
import Register from "./pages/common/Register";
import Login from "./pages/common/Login";
import BuyerLayout from "./layouts/BuyerLayout";
import BuyerLayoutHeader from "./layouts/BuyerLayoutHeader";
import BecomeSeller from './pages/seller/BecomeSeller';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import CreateProduct from './pages/seller/CreateProduct';
import ScrollToTop from "./utils/ScrollToTop"
import ResetPasswordRequest from './pages/buyer/ResetPasswordRequest.js';
import ResetPassword from './pages/buyer/ResetPassword.js';
import CreateService from './pages/seller/CreateService.js';
import SellerServices from './pages/seller/SellerServices.js';
import Settings from './pages/buyer/Settings.js';
import Categories from './pages/buyer/Categories.js';
import Products from './pages/buyer/Products.js';
import Services from './pages/buyer/Services.js';
import Wishlist from './pages/buyer/Wishlist.js';
import Cart from './pages/buyer/Cart.js';
import PostRequest from './pages/buyer/PostRequest.js';
import Tradelead from './pages/seller/Tradelead.js';
import Orders from './pages/common/Orders.js';
import { CheckoutStripeContainer } from './utils/StripeContainer.js';
import { UpgradeStripeContainer } from './utils/StripeContainer.js';
import ProductOrderDetails from './pages/common/ProductOrderDetails.js';
import ServiceDetails from './pages/buyer/ServiceDetails.js';
import Requirements from './pages/buyer/Requirements.js';
import ServiceOrderDetails from './pages/common/ServiceOrderDetails.js';
import ChatPage from './pages/buyer/Chat.js';
import Contact from './pages/buyer/Contact.js';
import Profile from './pages/buyer/Profile';

import AdminProtectedRoute from './utils/AdminProtectedRoute.js';
import LoginProtectedRoute from './utils/LoginProtectedRoute.js';
import SellerProtectedRoute from './utils/SellerProtectedRoute.js';
import AdminLogin from "./pages/admin/AdminLogin.js";
import AdminDashboard from './pages/admin/AdminDashboard.js';
import Employees from './pages/admin/Employees.js';
import AdminTerms from './pages/admin/AdminTerms.js';
import SocialLinks from './pages/admin/AdminSocialLinks.js';
import AdminCategories from './pages/admin/AdminCategories.js';
import Coupons from './pages/admin/Coupons.js';
import AdminFee from './pages/admin/AdminFee.js';
import AdminSellers from './pages/admin/AdminSellers.js';
import AdminBuyers from './pages/admin/AdminBuyers.js';
import AdminOrders from './pages/admin/AdminOrders.js';
import AdminRevenue from './pages/admin/AdminRevenue.js';
import AdminPayments from './pages/admin/AdminPayments.js';
import AdminDisputes from './pages/admin/AdminDisputes.js';
import Earnings from './pages/seller/Earnings.js';
import AdminSendEmal from './pages/admin/AdminSendEmal.js';
import NotFound from './utils/NotFound.js';
import AdminManageDispute from './pages/admin/AdminManageDispute.js';
import Terms from './pages/common/Terms.js';
import { AuthContext } from './utils/AuthContext.js';
import MobileRestricted from './utils/MobileRestricted.js';

function App() {

    const { isTabletPro } = useContext(AuthContext);

    return (
        <>
            <ScrollToTop />

            <Routes>

                <Route element={<BuyerLayout />}>
                    <Route path='/register' element={<Register />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/' element={<Home />} />
                    <Route path='/productDetails/:id' element={<ProductDetails />} />
                    <Route path='/categories' element={<Categories />} />
                    <Route path='/products' element={<Products />} />
                    <Route path='/services' element={<Services />} />
                    <Route path='/postingDetails/:id' element={<ServiceDetails />} />
                    <Route path='/contact' element={<Contact />} />
                    <Route path='/profile/:id' element={<Profile />} />
                    <Route path='/settings' element={<Settings />} />
                    <Route path='/terms' element={<Terms />} />
                </Route>

                <Route element={<BuyerLayoutHeader />}>
                    <Route path="/resetPasswordRequest" element={<ResetPasswordRequest />} />
                </Route>

                <Route element={<LoginProtectedRoute />} >
                    <Route path='/checkout' element={<CheckoutStripeContainer />} />
                    <Route path='/postRequest' element={<PostRequest />} />
                    <Route path='/wishlist' element={<Wishlist />} />
                    <Route path='/cart' element={<Cart />} />
                    <Route path='/orders' element={<Orders pageType="buyer" />} />
                    <Route path='/orders/product/orderDetails/:id' element={<ProductOrderDetails isBuyer={true} />} />
                    <Route path='/orders/posting/orderDetails/:id' element={<ServiceOrderDetails isBuyer={true} />} />
                    <Route path='/chat' element={isTabletPro ? (<MobileRestricted />) : (<ChatPage />)} />

                </Route>

                <Route element={<SellerProtectedRoute isFooter={true} />}>
                    <Route path='/seller/dashboard' element={<SellerDashboard />} />
                    <Route path='/seller/product/preview/:id' element={<ProductDetails />} />
                    <Route path='/seller/posting/preview/:id' element={<ServiceDetails />} />
                </Route>


                <Route element={<SellerProtectedRoute />}>
                    <Route path='/seller/products' element={<SellerProducts />} />
                    <Route path='/seller/products/manageProduct/new' element={<CreateProduct />} />
                    <Route path='/seller/products/manageProduct/edit/:id' element={<CreateProduct />} />
                    <Route path='/seller/postings' element={<SellerServices />} />
                    <Route path='/seller/postings/managePost/new' element={<CreateService />} />
                    <Route path='/seller/postings/managePost/edit/:id' element={<CreateService />} />
                    <Route path='/seller/orders' element={<Orders pageType="seller" />} />
                    <Route path='/seller/orders/product/orderDetails/:id/:subOrderId' element={<ProductOrderDetails isBuyer={false} />} />
                    <Route path='/seller/orders/posting/orderDetails/:id/' element={<ServiceOrderDetails isBuyer={false} />} />
                    <Route path='/seller/upgrade' element={<UpgradeStripeContainer />} />
                    <Route path='/seller/earnings' element={<Earnings />} />
                </Route>

                <Route element={<SellerProtectedRoute isDestinationTradelead={true} />}>
                    <Route path='/seller/tradeleads' element={<Tradelead />} />
                </Route>

                <Route>
                    <Route path="/resetPassword/:token" element={<ResetPassword />} />
                    <Route path='/requirements/:orderId' element={<Requirements />} />
                    <Route path='/seller/becomeaseller' element={<BecomeSeller />} />
                    <Route path='/ftzy-admin/login' element={<AdminLogin />} />
                    <Route path="*" element={<NotFound />} />
                </Route>

                <Route element={<AdminProtectedRoute />}>
                    <Route path="/ftzy-admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/ftzy-admin/employees" element={<Employees />} />
                    <Route path="/ftzy-admin/terms" element={<AdminTerms />} />
                    <Route path="/ftzy-admin/social" element={<SocialLinks />} />
                    <Route path="/ftzy-admin/categories" element={<AdminCategories />} />
                    <Route path="/ftzy-admin/coupons" element={<Coupons />} />
                    <Route path="/ftzy-admin/fee" element={<AdminFee />} />
                    <Route path="/ftzy-admin/sellers" element={<AdminSellers />} />
                    <Route path="/ftzy-admin/buyers" element={<AdminBuyers />} />
                    <Route path='/ftzy-admin/sellers/:id' element={<Profile />} />
                    <Route path='/ftzy-admin/orders' element={<AdminOrders />} />
                    <Route path='/ftzy-admin/chats' element={<ChatPage />} />
                    <Route path='/ftzy-admin/revenue' element={<AdminRevenue />} />
                    <Route path='/ftzy-admin/payments' element={<AdminPayments />} />
                    <Route path='/ftzy-admin/disputes' element={<AdminDisputes />} />
                    <Route path='/ftzy-admin/disputes/:id' element={<AdminManageDispute />} />
                    <Route path='/ftzy-admin/email/send/:id' element={<AdminSendEmal />} />
                </Route>

            </Routes>
        </>
    );
}

export default App;
