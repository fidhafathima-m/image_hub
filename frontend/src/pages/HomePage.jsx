import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Camera, Upload, Grid, Lock } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="text-center py-12">
      <div className="inline-block p-6 bg-primary-100 rounded-full mb-6">
        <Camera className="h-16 w-16 text-primary-600" />
      </div>
      
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Welcome to Image Hub
      </h1>
      
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        A beautiful and intuitive platform to upload, organize, and manage your images.
        Drag & drop to rearrange, bulk upload, and edit with ease.
      </p>

      {isAuthenticated ? (
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-8 py-3 bg-primary-600 text-white text-lg font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Grid className="h-6 w-6" />
          <span>Go to Dashboard</span>
        </Link>
      ) : (
        <div className="space-x-4">
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 px-8 py-3 bg-primary-600 text-white text-lg font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Upload className="h-6 w-6" />
            <span>Get Started</span>
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-8 py-3 border-2 border-primary-600 text-primary-600 text-lg font-medium rounded-lg hover:bg-primary-50 transition-colors"
          >
            <Lock className="h-6 w-6" />
            <span>Login</span>
          </Link>
        </div>
      )}

      {/* Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card">
          <div className="inline-block p-3 bg-blue-100 rounded-lg mb-4">
            <Upload className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Bulk Upload</h3>
          <p className="text-gray-600">
            Upload multiple images at once with individual titles for each image.
          </p>
        </div>

        <div className="card">
          <div className="inline-block p-3 bg-green-100 rounded-lg mb-4">
            <Grid className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Drag & Drop</h3>
          <p className="text-gray-600">
            Easily rearrange your images with intuitive drag and drop functionality.
          </p>
        </div>

        <div className="card">
          <div className="inline-block p-3 bg-purple-100 rounded-lg mb-4">
            <Lock className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
          <p className="text-gray-600">
            Your images are secure and accessible only to you with our authentication system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;