import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';
import AdminLayout from '../layouts/AdminLayout';

const ProtectedRoute = ({ children }) => {
  const { isAdminLogin } = useContext(AuthContext);

  if (isAdminLogin === null)
    return null;
  
  if (!isAdminLogin) {
    return <Navigate to="/ftzy-admin/login" />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default ProtectedRoute;
