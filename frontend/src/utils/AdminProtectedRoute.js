import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import MobileRestricted from './MobileRestricted';

const ProtectedRoute = ({ children }) => {
  const { isAdminLogin, isTabletPro } = useContext(AuthContext);

  if (isTabletPro)
    return <MobileRestricted />

  else if (isAdminLogin === null)
    return null;

  if (!isAdminLogin) {
    return <Navigate to="/ftzy-admin/login" />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default ProtectedRoute;
