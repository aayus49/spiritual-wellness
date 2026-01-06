// BookingModal.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";
import { X } from "lucide-react";

export default function BookingModal({ practitioner, onClose }) {
  const { user } = useAuth();
  const { bookAppointment } = useUserData();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const canBook = user.role !== "guest";

  const submit = () => {
    if (!canBook) return;
    bookAppointment({
      clientId: user.id,
      clientName: user.name,
      practitionerId: practitioner.userId,
      practitionerName: practitioner.name,
      date,
      time,
      notes,
      priceGBP: practitioner.priceGBP,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-gray-900">Book with {practitioner.name}</div>
            <div className="text-sm text-gray-600">£{practitioner.priceGBP} / session</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        {!canBook && (
          <div className="mt-4 text-sm text-red-600">You must be logged in to book.</div>
        )}

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700">Date</label>
            <input type="date" className="mt-1 w-full border rounded-xl px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-700">Time</label>
            <input type="time" className="mt-1 w-full border rounded-xl px-3 py-2" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm text-gray-700">Notes (optional)</label>
          <textarea className="mt-1 w-full border rounded-xl px-3 py-2" rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button
          onClick={submit}
          disabled={!canBook || !date || !time}
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold disabled:opacity-50"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
