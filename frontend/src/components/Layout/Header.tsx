import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Camera, LogOut, User, Home, Image as ImageIcon, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = (): void => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate('/login');
    }
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-primary-700">
            <Camera className="h-8 w-8" />
            <span>Image Hub</span>
          </Link>

          {/* Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className={`flex items-center space-x-1 transition-colors ${
                  isActive('/') ? 'text-primary-600 font-medium' : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link 
                to="/dashboard" 
                className={`flex items-center space-x-1 transition-colors ${
                  isActive('/dashboard') ? 'text-primary-600 font-medium' : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <ImageIcon className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </nav>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-800">{user.userName}</span>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/dashboard"
                      className="p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-full hover:bg-gray-100"
                      title="Dashboard"
                    >
                      <ImageIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors rounded-lg"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 transition-colors rounded-lg font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-white text-primary-600 border border-primary-600 hover:bg-primary-50 transition-colors rounded-lg font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && (
          <nav className="md:hidden flex items-center justify-center space-x-4 mt-4 pt-4 border-t">
            <Link 
              to="/" 
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </Link>
            <Link 
              to="/dashboard" 
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/dashboard') ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ImageIcon className="h-5 w-5" />
              <span className="text-xs">Dashboard</span>
            </Link>
            <div className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-xs truncate max-w-[80px]">{user.userName}</span>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;