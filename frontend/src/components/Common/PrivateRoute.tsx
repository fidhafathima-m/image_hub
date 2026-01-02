import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { PrivateRouteProps } from '../../types';

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate 
      to="/login" 
      state={{ from: location }} 
      replace 
    />
  );
};

export default PrivateRoute;