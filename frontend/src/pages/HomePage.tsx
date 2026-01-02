import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, Upload, Grid, Lock, Shield, Zap, Users } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const features: Feature[] = [
    {
      icon: <Upload className="h-8 w-8" />,
      title: "Bulk Upload",
      description: "Upload multiple images at once with individual titles for each image. Supports drag and drop.",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: <Grid className="h-8 w-8" />,
      title: "Drag & Drop",
      description: "Easily rearrange your images with intuitive drag and drop functionality. Visual organization made simple.",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Secure & Private",
      description: "Your images are secure and accessible only to you with our robust authentication system.",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Safe Storage",
      description: "All images are securely stored with regular backups. Your memories are safe with us.",
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Fast & Reliable",
      description: "Optimized for speed with quick uploads and instant previews. No waiting around.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "User-Friendly",
      description: "Clean, intuitive interface that's easy to use for everyone, from beginners to pros.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-blue-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-block p-6 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl mb-6 shadow-lg">
              <Camera className="h-20 w-20 text-primary-600" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              Welcome to <span className="text-primary-600">Image Hub</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              A beautiful, intuitive platform to upload, organize, and manage your images.
              Drag & drop to rearrange, bulk upload, and edit with ease.
            </p>

            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white rounded-full shadow-lg">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-medium text-gray-700">
                    Welcome back, {user?.userName}!
                  </span>
                </div>
                <div>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center space-x-3 px-8 py-4 bg-primary-600 text-white text-lg font-medium rounded-xl hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Grid className="h-6 w-6" />
                    <span>Go to Dashboard</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center space-x-3 px-8 py-4 bg-primary-600 text-white text-lg font-medium rounded-xl hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Upload className="h-6 w-6" />
                  <span>Get Started Free</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center space-x-3 px-8 py-4 border-2 border-primary-600 text-primary-600 text-lg font-medium rounded-xl hover:bg-primary-50 transition-all duration-300"
                >
                  <Lock className="h-6 w-6" />
                  <span>Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-gray-600">Images Uploaded</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">5TB</div>
              <div className="text-gray-600">Storage Used</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">1K+</div>
              <div className="text-gray-600">Happy Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose Image Hub?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Packed with features designed to make image management effortless and enjoyable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`inline-flex p-4 ${feature.bgColor} rounded-2xl mb-6`}>
                  <div className={feature.color}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to organize your images?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users who trust Image Hub for their image management needs.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-flex items-center space-x-3 px-8 py-4 bg-white text-primary-600 text-lg font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl"
            >
              <Upload className="h-6 w-6" />
              <span>Start Free Trial</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;