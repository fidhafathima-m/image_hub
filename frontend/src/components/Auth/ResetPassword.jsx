import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Lock, Loader, ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token, password);
      if (result.success) {
        setResetSuccess(true);
      } else {
        alert(result.message || "Failed to reset password");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.", err);
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
            <Lock className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Password Reset Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully. You can now login with
            your new password.
          </p>
          <div className="space-y-3">
            <Link to="/login" className="btn-primary w-full">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
        <p className="text-gray-600 text-center mb-6">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="Enter new password"
                required
                minLength="6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="Confirm new password"
                required
                minLength="6"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center space-x-2"
          >
            {loading ? <Loader className="h-5 w-5 animate-spin" /> : null}
            <span>{loading ? "Resetting..." : "Reset Password"}</span>
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

export default ResetPassword;
