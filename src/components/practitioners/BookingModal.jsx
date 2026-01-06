import React, { useMemo, useState } from "react";
import CustomCalendar from "../shared/CustomCalendar";
import TimePicker from "../shared/TimePicker";
import { useUserData } from "../../context/UserDataContext";

export default function BookingModal({ practitioner, onClose }) {
  const { createAppointment } = useUserData();

  const services = practitioner.services || [];
  const [serviceId, setServiceId] = useState(services[0]?.id || "");
  const [dateObj, setDateObj] = useState(new Date());
  const [timeLabel, setTimeLabel] = useState("18:00");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const selectedService = useMemo(() => services.find(s => s.id === serviceId) || services[0], [serviceId, services]);

  function confirm() {
    if (!selectedService) return;

    setSaving(true);
    try {
      createAppointment({
        practitionerId: practitioner.userId,
        practitionerName: practitioner.name,
        serviceId: selectedService.id,
        serviceTitle: selectedService.title,
        serviceType: selectedService.type,
        durationMin: selectedService.durationMin,
        dateISO: dateObj.toISOString().slice(0, 10),
        timeLabel,
        priceGBP: selectedService.priceGBP,
      });
      setMsg("Booked. Check your dashboard.");
      setTimeout(() => onClose(), 900);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-purple-600 to-purple-400 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xl font-bold">{practitioner.name}</div>
              <div className="text-white/90 text-sm">{(practitioner.specialties || []).join(" • ")}</div>
            </div>
            <button onClick={onClose} className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 transition">
              Close
            </button>
          </div>
        </div>

        <div className="p-6 grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-200 p-5">
            <div className="text-lg font-semibold text-gray-900">Select Service</div>
            <div className="mt-4 grid gap-2">
              {services.map(s => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setServiceId(s.id)}
                  className={[
                    "w-full text-left rounded-2xl border p-4 transition",
                    s.id === serviceId
                      ? "border-purple-300 bg-purple-50"
                      : "border-gray-200 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{s.title}</div>
                      <div className="text-sm text-gray-600">{s.type} • {s.durationMin} min</div>
                    </div>
                    <div className="font-bold text-gray-900">£{s.priceGBP}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <CustomCalendar value={dateObj} onChange={setDateObj} />
            <TimePicker value={timeLabel} onChange={setTimeLabel} />

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-sm font-semibold text-gray-900">Booking Summary</div>
              <div className="mt-2 text-sm text-gray-700">
                <div><span className="text-gray-500">Practitioner:</span> {practitioner.name}</div>
                <div><span className="text-gray-500">Service:</span> {selectedService?.title}</div>
                <div><span className="text-gray-500">When:</span> {dateObj.toDateString()} • {timeLabel}</div>
                <div><span className="text-gray-500">Duration:</span> {selectedService?.durationMin} min</div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-lg font-bold text-gray-900">£{selectedService?.priceGBP}</div>
                <button
                  type="button"
                  onClick={confirm}
                  disabled={saving}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60"
                >
                  {saving ? "Confirming…" : "Confirm Booking"}
                </button>
              </div>

              {msg && <div className="mt-3 text-sm text-green-700">{msg}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
