import React, { useMemo, useState } from "react";
import BookingModal from "./BookingModal";
import { useUserData } from "../../context/UserDataContext";

export default function PractitionersDirectory() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(null);

  const { practitioners } = useUserData();

  const filtered = useMemo(() => {
    const list = (practitioners || []).filter((p) => p.verified);
    return list.filter((p) => {
      const s = `${p.name} ${(p.specialties || []).join(" ")}`.toLowerCase();
      return s.includes(q.toLowerCase());
    });
  }, [practitioners, q]);

  return (
    <div className="bg-gray-50 min-h-[85vh] px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Practitioners</h1>
            <p className="text-gray-600 mt-1">
              Only verified, registered practitioners appear here.
            </p>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or specialty..."
            className="w-full sm:w-80 border rounded-xl px-3 py-2"
          />
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.userId}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-900">{p.name}</div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                  Verified
                </span>
              </div>

              <div className="mt-2 text-sm text-gray-600">{p.bio}</div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(p.specialties || []).map((sp) => (
                  <span
                    key={sp}
                    className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100"
                  >
                    {sp}
                  </span>
                ))}
              </div>

              <div className="mt-4 text-gray-900 font-medium">£{p.priceGBP} / session</div>

              <div className="mt-5">
                <button
                  onClick={() => setActive(p)}
                  className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold hover:opacity-95 active:scale-[0.99] transition"
                >
                  Book
                </button>
              </div>
            </div>
          ))}
        </div>

       
        <BookingModal open={!!active} practitioner={active} onClose={() => setActive(null)} />
      </div>
    </div>
  );
}
