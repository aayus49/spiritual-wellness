import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { LS_KEYS, lsGet } from "../../lib/localStorage";

export default function FeaturedPractitioners() {
  const featured = useMemo(() => {
    const list = lsGet(LS_KEYS.PRACTITIONERS, []);
    return list.filter(p => p.verified).slice(0, 3);
  }, []);

  if (featured.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 pb-16">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Featured Practitioners</h2>
          <p className="text-gray-600 mt-1">Verified practitioners available for booking.</p>
        </div>
        <Link to="/practitioners" className="text-purple-700 font-semibold hover:underline">
          View all
        </Link>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map(p => (
          <div
            key={p.userId}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-gray-900">{p.name}</div>
                <div className="text-sm text-gray-600">{p.specialties.join(" | ")}</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                Verified
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-600 line-clamp-3">{p.bio}</p>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-gray-900 font-semibold">GBP {p.priceGBP}</div>
              <div className="text-sm text-gray-600">{p.rating} stars ({p.reviews})</div>
            </div>

            <Link
              to="/practitioners"
              className="mt-5 block text-center px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold"
            >
              Book now
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
