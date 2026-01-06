import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";
import { uid } from "../../lib/localStorage";

const TYPES = ["Tarot", "Astrology", "Guidance", "Energy Work"];

export default function PractitionerDashboard() {
  const { user } = useAuth();
  const { appointments, getPractitionerByUserId, updateMyPractitionerServices, updateAppointmentStatus } = useUserData();

  const me = useMemo(() => getPractitionerByUserId(user.id), [user.id, getPractitionerByUserId]);
  const [services, setServices] = useState(me?.services || []);
  const [saving, setSaving] = useState(false);

  const myAppts = useMemo(() => appointments.filter(a => a.practitionerId === user.id), [appointments, user.id]);

  function addService() {
    setServices(prev => [
      {
        id: uid("svc"),
        type: "Tarot",
        title: "New Service",
        durationMin: 30,
        priceGBP: 40,
      },
      ...prev,
    ]);
  }

  function updateService(id, patch) {
    setServices(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeService(id) {
    setServices(prev => prev.filter(s => s.id !== id));
  }

  function saveServices() {
    setSaving(true);
    try {
      updateMyPractitionerServices(services);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Practitioner Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {user.name}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={addService} className="px-5 py-3 rounded-2xl bg-white border border-gray-200 font-semibold hover:bg-gray-50 transition">
              Add Service
            </button>
            <button
              onClick={saveServices}
              disabled={saving}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold hover:opacity-95 transition disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Services"}
            </button>
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-lg font-semibold text-gray-900">My Services</div>
            <div className="mt-4 grid gap-3">
              {services.length === 0 ? (
                <div className="text-sm text-gray-600">No services yet.</div>
              ) : (
                services.map(s => (
                  <div key={s.id} className="rounded-2xl border border-gray-200 p-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Title</div>
                        <input
                          value={s.title}
                          onChange={e => updateService(s.id, { title: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
                        />
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">Type</div>
                        <select
                          value={s.type}
                          onChange={e => updateService(s.id, { type: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
                        >
                          {TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">Duration (min)</div>
                        <input
                          type="number"
                          value={s.durationMin}
                          onChange={e => updateService(s.id, { durationMin: Number(e.target.value) })}
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
                        />
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">Rate (£)</div>
                        <input
                          type="number"
                          value={s.priceGBP}
                          onChange={e => updateService(s.id, { priceGBP: Number(e.target.value) })}
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button onClick={() => removeService(s.id)} className="px-4 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-sm font-semibold transition">
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-lg font-semibold text-gray-900">Appointments</div>
            <div className="mt-4 grid gap-3">
              {myAppts.length === 0 ? (
                <div className="text-sm text-gray-600">No bookings yet.</div>
              ) : (
                myAppts.map(a => (
                  <div key={a.id} className="rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-gray-900">{a.clientName}</div>
                        <div className="text-sm text-gray-600">{a.serviceTitle} • {a.durationMin} min</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(a.dateISO).toDateString()} • {a.timeLabel} • £{a.priceGBP}
                        </div>
                        <div className="mt-2 text-xs inline-flex px-2 py-1 rounded-full bg-gray-100">{a.status}</div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <ActionBtn
                          disabled={a.status !== "pending"}
                          label="Confirm"
                          onClick={() => updateAppointmentStatus(a.id, "confirmed")}
                          kind="primary"
                        />
                        <ActionBtn
                          disabled={a.status !== "confirmed"}
                          label="Complete"
                          onClick={() => updateAppointmentStatus(a.id, "completed")}
                          kind="success"
                        />
                        <ActionBtn
                          disabled={a.status === "cancelled" || a.status === "completed"}
                          label="Cancel"
                          onClick={() => updateAppointmentStatus(a.id, "cancelled")}
                          kind="danger"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ label, onClick, disabled, kind }) {
  const cls =
    kind === "primary"
      ? "bg-gray-900 text-white hover:bg-gray-800"
      : kind === "success"
      ? "bg-green-600 text-white hover:bg-green-700"
      : "border border-red-200 text-red-700 hover:bg-red-50";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "px-4 py-2 rounded-xl text-sm font-semibold transition active:scale-[0.99]",
        cls,
        disabled ? "opacity-50 cursor-not-allowed hover:none" : "",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
