// src/components/shared/Navigation.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, User } from "lucide-react";

const navClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg transition ${
    isActive ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-purple-50"
  }`;

export default function Navigation() {
  const { user, logout } = useAuth();
  const isPractitioner = user?.role === "practitioner";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-purple-700">
          InnerPath
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={navClass}>Home</NavLink>
          <NavLink to="/tarot" className={navClass}>Tarot</NavLink>
          <NavLink to="/birth-chart" className={navClass}>Birth Chart</NavLink>
          <NavLink to="/horoscope" className={navClass}>Horoscope</NavLink>

          {/* Practitioners directory should NOT appear for practitioner users */}
          {!isPractitioner && (
            <NavLink to="/practitioners" className={navClass}>Practitioners</NavLink>
          )}

          <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4" />
            <span className="text-sm">{user.role === "guest" ? "Guest" : user.name}</span>
          </div>

          {user.role !== "guest" ? (
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition active:scale-[0.99]"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-400 text-white hover:opacity-95 transition active:scale-[0.99]"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
