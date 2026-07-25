import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const RoleRoute = ({ allowedRoles }) => {
  const { role } = useAuth();

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  return allowedRoles.includes(role) ? <Outlet /> : <Navigate to="/403" replace />;
};

export default RoleRoute;
