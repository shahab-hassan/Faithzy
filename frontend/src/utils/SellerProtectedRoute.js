import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';
import SellerLayoutHeader from '../layouts/SellerLayoutHeader';
import SellerLayout from '../layouts/SellerLayout';
import { enqueueSnackbar } from 'notistack';

const ProtectedRoute = ({ children, isFooter, isDestinationTradelead }) => {
    const { isLogin, user } = useContext(AuthContext);

    if (isLogin === null)
        return null;

    if (!isLogin){
        enqueueSnackbar("Please login to accesss that Resource!", {variant: "info"})
        return <Navigate to="/login" />;
    }

    else if (!(user?.role === "seller")){
        enqueueSnackbar("You are not a Seller. Please create seller account to accesss that Resource!", {variant: "info"})
        return <Navigate to="/seller/becomeaseller" />
    }

    else if (isDestinationTradelead && user?.sellerId?.sellerType === "Free"){
        enqueueSnackbar("Only paid sellers can access Tradeleads! Upgrade your Account", {variant: "info"})
        return <Navigate to="/seller/upgrade" />
    }

    if(isFooter)
        return <SellerLayout>{children}</SellerLayout>;
    else
        return <SellerLayoutHeader>{children}</SellerLayoutHeader>;
};

export default ProtectedRoute;
