import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || user.role === "guest") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-purple-700" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Sign in required</h2>
          <p className="text-gray-600 mt-2">Create an account to save readings and book practitioners.</p>
          <Navigate to={`/login?returnUrl=${encodeURIComponent(loc.pathname)}`} replace />
        </div>
      </div>
    );
  }

  return children;
}
