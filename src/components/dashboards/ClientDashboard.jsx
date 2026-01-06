import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";

/* Reuse a lightweight SVG wheel renderer inside dashboard modal */
function ChartWheelSVG({ chart, size = 280 }) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.46;
  const rInner = size * 0.30;
  const rPlanets = size * 0.38;

  function polar(r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const houseLines = (chart.houses || []).map(h => {
    const a = h.cuspDeg;
    const p1 = polar(rOuter, a);
    const p2 = polar(rInner, a);
    return { house: h.house, p1, p2 };
  });

  const planetDots = (chart.planets || []).map(p => {
    const pos = polar(rPlanets, p.deg);
    return { ...p, ...pos };
  });

  const ascLine = (() => {
    const p1 = polar(rOuter, chart.ascDeg || 0);
    const p2 = polar(rInner, chart.ascDeg || 0);
    return { p1, p2 };
  })();

  const mcLine = (() => {
    const p1 = polar(rOuter, chart.mcDeg || 0);
    const p2 = polar(rInner, chart.mcDeg || 0);
    return { p1, p2 };
  })();

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <circle cx={cx} cy={cy} r={rOuter} fill="white" stroke="#E5E7EB" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={rInner} fill="transparent" stroke="#E5E7EB" strokeWidth="2" />

      {houseLines.map(l => (
        <line key={l.house} x1={l.p1.x} y1={l.p1.y} x2={l.p2.x} y2={l.p2.y} stroke="#E5E7EB" strokeWidth="2" />
      ))}

      <line x1={ascLine.p1.x} y1={ascLine.p1.y} x2={ascLine.p2.x} y2={ascLine.p2.y} stroke="#7C3AED" strokeWidth="3" />
      <line x1={mcLine.p1.x} y1={mcLine.p1.y} x2={mcLine.p2.x} y2={mcLine.p2.y} stroke="#A78BFA" strokeWidth="3" />

      {planetDots.map(p => (
        <g key={p.key}>
          <circle cx={p.x} cy={p.y} r={7} fill="#111827" opacity="0.95" />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="8" fill="white">
            {String(p.key || "?")[0]}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const { readings, appointments, deleteReading, updateAppointmentStatus } = useUserData();

  const [openReading, setOpenReading] = useState(null);

  const myReadings = readings.filter(r => r.type && user.role !== "guest");
  const myAppts = appointments.filter(a => a.clientId === user.id);

  const readingBadge = (type) => {
    if (type === "tarot") return "bg-purple-50 text-purple-700 border-purple-100";
    if (type === "birthchart") return "bg-indigo-50 text-indigo-700 border-indigo-100";
    if (type === "horoscope") return "bg-yellow-50 text-yellow-700 border-yellow-100";
    return "bg-gray-50 text-gray-700 border-gray-100";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {user.name}</p>
          </div>

          <a
            href="/practitioners"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold hover:opacity-95 active:scale-[0.99] transition focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            Book New Appointment
          </a>
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          <Section title="Saved Readings">
            {myReadings.length === 0 ? (
              <p className="text-gray-600">No saved readings yet.</p>
            ) : (
              <div className="space-y-3">
                {myReadings.map(r => (
                  <div key={r.id} className="border border-gray-200 rounded-2xl p-4 bg-white hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-semibold text-gray-900">{r.title}</div>
                          <span className={`text-xs px-2 py-1 rounded-full border ${readingBadge(r.type)}`}>
                            {r.type}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">{r.createdAtLabel}</div>

                        {r.summary && <div className="mt-2 text-sm text-gray-700">{r.summary}</div>}

                        {/* Small birth chart preview row */}
                        {r.type === "birthchart" && r.payload?.chart && (
                          <div className="mt-3 text-xs text-gray-500">
                            Sun: <span className="font-semibold text-gray-700">{r.payload.chart.sunSign}</span>{" "}
                            • ASC: <span className="font-semibold text-gray-700">{r.payload.chart.ascDeg}°</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setOpenReading(r)}
                          className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-800 active:scale-[0.99] transition focus:outline-none focus:ring-2 focus:ring-gray-200"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteReading(r.id)}
                          className="px-4 py-2 rounded-xl border border-red-200 text-red-700 text-sm hover:bg-red-50 active:scale-[0.99] transition focus:outline-none focus:ring-2 focus:ring-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="My Appointments">
            {myAppts.length === 0 ? (
              <p className="text-gray-600">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {myAppts.map(a => (
                  <div key={a.id} className="border border-gray-200 rounded-2xl p-4 bg-white hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-gray-900">{a.practitionerName}</div>
                        <div className="text-sm text-gray-600">
                          {a.serviceTitle || a.service} • £{a.priceGBP}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {(a.dateISO ? new Date(a.dateISO).toDateString() : a.date)} • {(a.timeLabel || a.time)}
                        </div>
                        <div className="text-xs mt-2 inline-flex px-2 py-1 rounded-full bg-gray-100">{a.status}</div>
                      </div>

                      {a.status !== "cancelled" && a.status !== "completed" && (
                        <button
                          onClick={() => updateAppointmentStatus(a.id, "cancelled")}
                          className="px-4 py-2 rounded-xl border border-red-200 text-red-700 text-sm hover:bg-red-50 active:scale-[0.99] transition focus:outline-none focus:ring-2 focus:ring-red-100"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>

      {openReading && (
        <ReadingModal
          reading={openReading}
          onClose={() => setOpenReading(null)}
        />
      )}
    </div>
  );
}

function ReadingModal({ reading, onClose }) {
  const tarot = reading?.type === "tarot" ? reading.payload : null;
  const birth = reading?.type === "birthchart" ? reading.payload : null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-purple-600 to-purple-400 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xl font-bold">{reading.title}</div>
              <div className="text-white/90 text-sm">{reading.createdAtLabel}</div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.99] transition"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-6">
          {reading.summary && (
            <div className="text-sm text-gray-700">{reading.summary}</div>
          )}

          {/* Birth Chart Details */}
          {birth?.chart && (
            <div className="mt-6 grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50 flex items-center justify-center">
                <div className="rounded-2xl border border-gray-200 bg-white p-3">
                  <ChartWheelSVG chart={birth.chart} size={300} />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5">
                <div className="font-semibold text-gray-900">Birth Inputs</div>
                <div className="mt-2 text-sm text-gray-700">
                  <div><span className="text-gray-500">Date:</span> {birth.input?.dateISO}</div>
                  <div><span className="text-gray-500">Time:</span> {birth.input?.timeLabel}</div>
                  <div className="mt-1">
                    <span className="text-gray-500">Place:</span> {birth.input?.place?.label}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Lat/Lon: {birth.input?.place?.lat?.toFixed?.(4)}, {birth.input?.place?.lon?.toFixed?.(4)}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                    <div className="text-xs text-gray-500">Sun Sign</div>
                    <div className="mt-1 font-semibold text-gray-900">{birth.chart.sunSign}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                    <div className="text-xs text-gray-500">Ascendant</div>
                    <div className="mt-1 font-semibold text-gray-900">{birth.chart.ascDeg}°</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="font-semibold text-gray-900">Planet Positions</div>
                  <div className="mt-2 grid gap-2">
                    {(birth.chart.planets || []).map(p => (
                      <div key={p.key} className="flex items-center justify-between text-sm">
                        <div className="text-gray-700">{p.label}</div>
                        <div className="font-semibold text-gray-900">{p.deg}°</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  UI is complete. Swap in real ephemeris calculations later without changing layout.
                </div>
              </div>
            </div>
          )}

          {/* Tarot Details */}
          <div key={`${c.name}-${i}`} className="rounded-2xl border border-gray-200 p-4 bg-white">
  <div className="text-sm text-gray-500">{c.position || tarot.positions?.[i] || "Card"}</div>
  <div className="mt-1 font-semibold text-gray-900">{c.name}</div>

  <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
    <img
      src={c.img}
      alt={c.name}
      className={[
        "w-full h-56 object-cover",
        c.reversed ? "rotate-180" : "",
      ].join(" ")}
      loading="lazy"
    />
  </div>

  <div className="text-xs mt-3 inline-flex px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
    {c.reversed ? "Reversed" : "Upright"}
  </div>

  <div className="mt-3 text-sm text-gray-700">
    {c.reversed ? c.reversedText : c.upright}
  </div>
</div>


          {/* Fallback */}
          {!birth?.chart && !(tarot?.cards?.length > 0) && (
            <div className="mt-6 text-sm text-gray-600">
              Detailed view not implemented for this reading type yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="text-lg font-semibold text-gray-900">{title}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
