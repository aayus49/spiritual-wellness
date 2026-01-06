import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";

const TABS = ["Overview", "My Readings", "My Appointments", "My Profile"];

export default function ClientDashboard() {
  const { user } = useAuth();
  const { readings, appointments, activity, deleteReading, updateAppointmentStatus } = useUserData();

  const [tab, setTab] = useState("Overview");
  const [openReading, setOpenReading] = useState(null);

  const myReadings = useMemo(() => readings.filter(r => r.type), [readings]);
  const myAppts = useMemo(() => appointments.filter(a => a.clientId === user.id), [appointments, user.id]);

  const stats = useMemo(() => {
    const upcoming = myAppts.filter(a => a.status !== "cancelled" && a.status !== "completed").length;
    return {
      readings: myReadings.length,
      upcoming,
      spent: myAppts
        .filter(a => a.status !== "cancelled")
        .reduce((sum, a) => sum + (Number(a.priceGBP) || 0), 0),
    };
  }, [myReadings, myAppts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {user.name}</p>
          </div>

          <a
            href="/practitioners"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold hover:opacity-95 transition"
          >
            Book New Appointment
          </a>
        </div>

        <div className="mt-6 flex gap-2 flex-wrap">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "px-4 py-2 rounded-xl text-sm font-semibold transition",
                tab === t ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            <StatCard title="Total Readings" value={stats.readings} />
            <StatCard title="Upcoming Appointments" value={stats.upcoming} />
            <StatCard title="Total Spent" value={`£${stats.spent}`} />

            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-lg font-semibold text-gray-900">Recent Activity</div>
              <div className="mt-4 space-y-3">
                {activity.length === 0 ? (
                  <div className="text-sm text-gray-600">No activity yet.</div>
                ) : (
                  activity.map(x => (
                    <div key={x.id} className="flex items-start justify-between gap-3 border border-gray-200 rounded-xl p-3">
                      <div>
                        <div className="font-medium text-gray-900">{x.label}</div>
                        <div className="text-xs text-gray-500">{new Date(x.ts).toLocaleString()}</div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100">{x.type}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-lg font-semibold text-gray-900">Next Appointment</div>
              <div className="mt-4">
                {myAppts.length === 0 ? (
                  <div className="text-sm text-gray-600">No bookings yet.</div>
                ) : (
                  <NextAppt appt={myAppts[0]} onCancel={() => updateAppointmentStatus(myAppts[0].id, "cancelled")} />
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "My Readings" && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-lg font-semibold text-gray-900">My Readings</div>
            <div className="mt-4 grid gap-3">
              {myReadings.length === 0 ? (
                <div className="text-sm text-gray-600">No saved readings yet.</div>
              ) : (
                myReadings.map(r => (
                  <div key={r.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{r.title}</div>
                        <div className="text-sm text-gray-500">{r.createdAtLabel}</div>
                        {r.summary && <div className="mt-2 text-sm text-gray-700">{r.summary}</div>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => setOpenReading(r)} className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 transition">
                          View
                        </button>
                        <button onClick={() => deleteReading(r.id)} className="px-3 py-2 rounded-lg border border-red-200 text-red-700 text-sm hover:bg-red-50 transition">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "My Appointments" && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-lg font-semibold text-gray-900">My Appointments</div>
            <div className="mt-4 grid gap-3">
              {myAppts.length === 0 ? (
                <div className="text-sm text-gray-600">No bookings yet.</div>
              ) : (
                myAppts.map(a => (
                  <AppointmentCard
                    key={a.id}
                    appt={a}
                    role="client"
                    onCancel={() => updateAppointmentStatus(a.id, "cancelled")}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {tab === "My Profile" && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-lg font-semibold text-gray-900">My Profile</div>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <Field label="Name" value={user.name} />
              <Field label="Email" value={user.email} />
              <Field label="Role" value={user.role} />
              <div className="text-sm text-gray-600">
                Profile editing (photo, phone, birth info) can be added next.
              </div>
            </div>
          </div>
        )}
      </div>

      {openReading && <ReadingModal reading={openReading} onClose={() => setOpenReading(null)} />}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function NextAppt({ appt, onCancel }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="font-semibold text-gray-900">{appt.practitionerName}</div>
      <div className="text-sm text-gray-600">{appt.serviceTitle} • {appt.serviceType}</div>
      <div className="text-sm text-gray-500 mt-1">
        {new Date(appt.dateISO).toDateString()} • {appt.timeLabel} • £{appt.priceGBP}
      </div>
      <div className="mt-2 text-xs inline-flex px-2 py-1 rounded-full bg-gray-100">{appt.status}</div>
      {appt.status !== "cancelled" && appt.status !== "completed" && (
        <button onClick={onCancel} className="mt-3 px-4 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-sm font-semibold transition">
          Cancel
        </button>
      )}
    </div>
  );
}

function AppointmentCard({ appt, role, onCancel }) {
  const canCancel = appt.status !== "cancelled" && appt.status !== "completed";
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold text-gray-900">{appt.practitionerName}</div>
          <div className="text-sm text-gray-600">{appt.serviceTitle} • {appt.durationMin} min</div>
          <div className="text-sm text-gray-500 mt-1">
            {new Date(appt.dateISO).toDateString()} • {appt.timeLabel} • £{appt.priceGBP}
          </div>
          <div className="mt-2 text-xs inline-flex px-2 py-1 rounded-full bg-gray-100">{appt.status}</div>
        </div>
        {role === "client" && canCancel && (
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-sm font-semibold transition">
            Cancel
          </button>
        )}
      </div>
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
          <button onClick={onClose} className="px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
            Close
          </button>
        </div>

        {reading.summary && <div className="mt-4 text-sm text-gray-700">{reading.summary}</div>}

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
          <div className="mt-6 text-sm text-gray-600">No detailed payload found for this type.</div>
        )}
      </div>
    </div>
  );
}
