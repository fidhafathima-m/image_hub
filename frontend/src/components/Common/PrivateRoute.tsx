import { useAuth } from '../../context/AuthContext';
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // Optional role-based protection
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check token validity on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!token && refreshToken) {
        // Token missing but refresh token exists - try to refresh
        try {
          // This will be handled by axios interceptor
          setIsChecking(false);
        } catch (error) {
          setIsChecking(false);
        }
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading spinner while checking auth
  if (loading || isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;