import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowLeft, Loader } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await forgotPassword(email);
    
    if (result.success) {
      setSubmitted(true);
    }
    
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
            <Mail className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>.
            Please check your email and click the link to reset your password.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-800"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
        <p className="text-gray-600 text-center mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center space-x-2"
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : null}
            <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;