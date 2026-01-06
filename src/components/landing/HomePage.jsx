import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FeaturedPractitioners from "./FeaturedPractitioners";
export default function HomePage() {
  return (
    <div className="bg-gray-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 text-white">
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-bold leading-tight">
            Discover Your <span className="text-purple-200">Spiritual Path</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-6 max-w-2xl text-lg text-purple-100">
            Birth charts with real locations, tarot insights, and daily horoscopes — plus verified practitioners you can book.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-10 flex flex-wrap gap-4">
            <Link to="/tarot" className="px-7 py-3 rounded-xl bg-white text-purple-700 font-semibold shadow hover:-translate-y-0.5 transition">
              Get a Free Reading
            </Link>
            <Link to="/practitioners" className="px-7 py-3 rounded-xl border border-white/40 text-white hover:bg-white/10 transition">
              Find Practitioners
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900">Services</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <Card title="Tarot Reading" desc="Draw 3 cards with upright/reversed meanings." to="/tarot" />
          <Card title="Birth Chart" desc="Use real geolocation for accurate chart inputs." to="/birth-chart" />
          <Card title="Daily Horoscope" desc="Daily guidance by zodiac sign." to="/horoscope" />
        </div>
      </section>

      <FeaturedPractitioners />
    </div>
  );
}

function Card({ title, desc, to }) {
  return (
    <Link to={to} className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition">
      <div className="text-lg font-semibold text-gray-900">{title}</div>
      <div className="mt-2 text-gray-600">{desc}</div>
      <div className="mt-4 text-purple-700 font-medium group-hover:underline">Open</div>
    </Link>
  );
}
