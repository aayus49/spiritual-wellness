import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/shared/Navigation";
import Footer from "./components/shared/Footer";

import HomePage from "./components/landing/HomePage";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import AuthGuard from "./components/auth/AuthGuard";

import TarotPage from "./components/features/TarotPage";
import BirthChartPage from "./components/features/BirthChartPage";
import HoroscopePage from "./components/features/HoroscopePage";
import PractitionersDirectory from "./components/practitioners/PractitionersDirectory";

import ClientDashboard from "./components/dashboards/ClientDashboard";
import PractitionerDashboard from "./components/dashboards/PractitionerDashboard";
import AdminDashboard from "./components/dashboards/AdminDashboard";
import { useAuth } from "./context/AuthContext";

function DashboardPage() {
  const { user } = useAuth();
  if (user.role === "admin") return <AdminDashboard />;
  if (user.role === "practitioner") return <PractitionerDashboard />;
  return <ClientDashboard />;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Features (guest can view; saving/booking requires login in feature pages) */}
          <Route path="/tarot" element={<TarotPage />} />
          <Route path="/birth-chart" element={<BirthChartPage />} />
          <Route path="/horoscope" element={<HoroscopePage />} />

          <Route path="/practitioners" element={<PractitionersDirectory />} />

          {/* Protected dashboard */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <DashboardPage />
              </AuthGuard>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
