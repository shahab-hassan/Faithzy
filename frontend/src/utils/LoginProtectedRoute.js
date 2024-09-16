import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';
import BuyerLayoutHeader from '../layouts/BuyerLayoutHeader';
import { enqueueSnackbar } from 'notistack';

const ProtectedRoute = ({ children }) => {
    const { isLogin } = useContext(AuthContext);

    if (isLogin === null)
        return null;

    if (!isLogin) {
        enqueueSnackbar("Please login to accesss that Resource!", {variant: "info"})
        return <Navigate to="/login" />;
    }

    return <BuyerLayoutHeader>{children}</BuyerLayoutHeader>;
};

export default ProtectedRoute;
