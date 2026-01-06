// PractitionerDashboard.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";

export default function PractitionerDashboard() {
  const { user } = useAuth();
  const { appointments, updateAppointmentStatus } = useUserData();

  const myAppts = appointments.filter(a => a.practitionerId === user.id);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Practitioner Dashboard</h1>
      <p className="text-gray-600 mt-1">Welcome, {user.name}</p>

      <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="text-lg font-semibold text-gray-900">Bookings</div>
        <div className="mt-4 space-y-3">
          {myAppts.length === 0 ? (
            <p className="text-gray-600">No bookings yet.</p>
          ) : (
            myAppts.map(a => (
              <div key={a.id} className="border rounded-xl p-3">
                <div className="font-medium text-gray-900">{a.clientName}</div>
                <div className="text-sm text-gray-600">{a.date} at {a.time} — £{a.priceGBP}</div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => updateAppointmentStatus(a.id, "confirmed")} className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm">Confirm</button>
                  <button onClick={() => updateAppointmentStatus(a.id, "cancelled")} className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm">Cancel</button>
                  <button onClick={() => updateAppointmentStatus(a.id, "completed")} className="px-3 py-1 rounded-lg bg-gray-900 text-white text-sm">Complete</button>
                </div>
                <div className="text-xs mt-2 inline-flex px-2 py-1 rounded-full bg-gray-100">{a.status}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
