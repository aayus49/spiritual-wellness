// ClientDashboard.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";

export default function ClientDashboard() {
  const { user } = useAuth();
  const { readings, appointments, deleteReading, updateAppointmentStatus } = useUserData();

  const [openReading, setOpenReading] = useState(null);

  const myReadings = readings.filter(r => r.type && user.role !== "guest");
  const myAppts = appointments.filter(a => a.clientId === user.id);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
      <p className="text-gray-600 mt-1">Welcome, {user.name}</p>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <Section title="Saved Readings">
          {myReadings.length === 0 ? (
            <p className="text-gray-600">No saved readings yet.</p>
          ) : (
            <div className="space-y-3">
              {myReadings.map(r => (
                <div key={r.id} className="border rounded-xl p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900">{r.title}</div>
                      <div className="text-sm text-gray-500">{r.createdAtLabel}</div>
                      {r.summary && (
                        <div className="mt-2 text-sm text-gray-700">{r.summary}</div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setOpenReading(r)}
                        className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteReading(r.id)}
                        className="px-3 py-2 rounded-lg border border-red-200 text-red-700 text-sm hover:bg-red-50 transition"
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
                <div key={a.id} className="border rounded-xl p-3">
                  <div className="font-medium text-gray-900">{a.practitionerName}</div>

                  <div className="text-sm text-gray-600">
                    {a.date ? (
                      <>
                        {a.date} at {a.time}
                      </>
                    ) : (
                      <>
                        {a.dateISO ? new Date(a.dateISO).toDateString() : "Date"}{" "}
                        {a.timeLabel ? `• ${a.timeLabel}` : ""}
                      </>
                    )}{" "}
                    — £{a.priceGBP}
                  </div>

                  <div className="text-xs mt-1 inline-flex px-2 py-1 rounded-full bg-gray-100">
                    {a.status}
                  </div>

                  {a.status !== "cancelled" && (
                    <button
                      onClick={() => updateAppointmentStatus(a.id, "cancelled")}
                      className="mt-2 text-sm text-red-600 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {openReading && (
        <ReadingModal reading={openReading} onClose={() => setOpenReading(null)} />
      )}
    </div>
  );
}

function ReadingModal({ reading, onClose }) {
  const tarot = reading?.type === "tarot" ? reading.payload : null;
  const cards = tarot?.cards || [];
  const positions = tarot?.positions || ["Past", "Present", "Future"];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-gray-900">{reading.title}</div>
            <div className="text-sm text-gray-600">{reading.createdAtLabel}</div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg hover:bg-gray-100 text-sm"
          >
            Close
          </button>
        </div>

        {reading.summary && (
          <div className="mt-4 text-sm text-gray-700">{reading.summary}</div>
        )}

        {reading.type === "tarot" && cards.length > 0 ? (
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {cards.map((c, i) => (
              <div key={`${c.name}-${i}`} className="rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500">{positions[i] || "Card"}</div>
                <div className="mt-1 font-semibold text-gray-900">{c.name}</div>
                <div className="text-xs mt-2 inline-flex px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                  {c.reversed ? "Reversed" : "Upright"}
                </div>
                <div className="mt-3 text-sm text-gray-700">
                  {c.reversed ? c.reversed : c.upright}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 text-sm text-gray-600">
            Detailed view not implemented yet for this reading type, or no payload found.
          </div>
        )}
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
