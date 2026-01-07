import React, { useMemo, useState } from "react";
import CustomCalendar from "../shared/CustomCalendar";
import TimePicker from "../shared/TimePicker";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";

const STEPS = ["Service", "Date & Time", "Details", "Confirm"];

function Pill({ children, active }) {
  return (
    <div
      className={[
        "text-xs px-3 py-1.5 rounded-full border",
        active ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-gray-50 text-gray-700 border-gray-200",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default function BookingModal({ open, onClose, practitioner }) {
  const { user } = useAuth();
  const { createAppointment } = useUserData();

  const [step, setStep] = useState(0);

  const services = practitioner?.services || [];
  const [serviceId, setServiceId] = useState(services?.[0]?.id || "");
  const service = useMemo(() => services.find((s) => s.id === serviceId) || services?.[0] || null, [services, serviceId]);

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("18:00");
  const [sessionType, setSessionType] = useState("video");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const canProceed =
    (step === 0 && !!service) ||
    (step === 1 && !!date && !!time) ||
    (step === 2 && user && user.role !== "guest") ||
    step === 3;

  const priceGBP = Number(service?.priceGBP || 0);

  function close() {
    onClose?.();
  }

  async function confirm() {
    if (!service) return;
    if (!user || user.role === "guest") return;

    setSaving(true);
    try {
      createAppointment({
        practitionerId: practitioner.id,
        practitionerName: practitioner.name,
        serviceId: service.id,
        serviceTitle: service.title,
        priceGBP,
        clientId: user.id,
        clientName: user.name,
        dateISO: date.toISOString(),
        timeLabel: time,
        sessionType,
        note,
        status: "pending",
      });
      close();
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-600 to-purple-400 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xl font-bold truncate">Book {practitioner?.name}</div>
              <div className="text-white/90 text-sm mt-1">Choose a service and time slot.</div>

              <div className="mt-4 flex items-center gap-2 flex-wrap">
                {STEPS.map((s, i) => (
                  <Pill key={s} active={i === step}>
                    {i + 1}. {s}
                  </Pill>
                ))}
              </div>
            </div>

            <button
              onClick={close}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.99] transition focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-6 grid lg:grid-cols-3 gap-6">
          {/* Left: Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* STEP 0: service */}
            {step === 0 && (
              <div className="rounded-2xl border border-gray-200 p-5">
                <div className="text-lg font-semibold text-gray-900">Choose a service</div>
                <div className="text-sm text-gray-600 mt-1">Rates are set by the practitioner.</div>

                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceId(s.id)}
                      className={[
                        "text-left rounded-2xl border p-4 transition active:scale-[0.99]",
                        s.id === serviceId
                          ? "border-purple-200 bg-purple-50"
                          : "border-gray-200 bg-white hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <div className="font-semibold text-gray-900">{s.title}</div>
                      <div className="text-sm text-gray-600 mt-1 line-clamp-2">{s.description}</div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-gray-700">{s.durationMin} min</span>
                        <span className="font-semibold text-gray-900">£{Number(s.priceGBP).toFixed(0)}</span>
                      </div>
                      <div className="mt-2 text-xs inline-flex px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
                        {s.type || "service"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1: date & time */}
            {step === 1 && (
              <div className="rounded-2xl border border-gray-200 p-5">
                <div className="text-lg font-semibold text-gray-900">Pick date & time</div>
                <div className="text-sm text-gray-600 mt-1">Select a date, then choose a time.</div>

                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="text-sm font-semibold text-gray-900">Date</div>
                    <div className="mt-3">
                      <CustomCalendar value={date} onChange={setDate} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="text-sm font-semibold text-gray-900">Time</div>
                    <div className="mt-3">
                      <TimePicker value={time} onChange={setTime} />
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-semibold text-gray-900">Session type</div>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {["video", "phone", "in-person"].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSessionType(t)}
                            className={[
                              "px-3 py-2 rounded-xl border text-sm transition active:scale-[0.99]",
                              sessionType === t ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white border-gray-200 text-gray-800 hover:bg-gray-50",
                            ].join(" ")}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: details */}
            {step === 2 && (
              <div className="rounded-2xl border border-gray-200 p-5">
                <div className="text-lg font-semibold text-gray-900">Your details</div>
                <div className="text-sm text-gray-600 mt-1">We use your logged-in profile details automatically.</div>

                {(!user || user.role === "guest") ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <div className="font-semibold text-red-800">Login required</div>
                    <div className="text-sm text-red-700 mt-1">
                      Please login to confirm bookings and save them to your dashboard.
                    </div>
                    <a href="/login" className="inline-flex mt-3 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-800 transition">
                      Go to Login
                    </a>
                  </div>
                ) : (
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="text-xs text-gray-500">Name</div>
                      <div className="mt-1 font-semibold text-gray-900">{user.name}</div>
                      <div className="mt-3 text-xs text-gray-500">Email</div>
                      <div className="mt-1 font-semibold text-gray-900">{user.email}</div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="text-xs text-gray-500">Special requests (optional)</div>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={6}
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200"
                        placeholder="Anything the practitioner should know before the session?"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: confirm */}
            {step === 3 && (
              <div className="rounded-2xl border border-gray-200 p-5">
                <div className="text-lg font-semibold text-gray-900">Confirm</div>
                <div className="text-sm text-gray-600 mt-1">Double-check your booking details.</div>

                <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Practitioner</div>
                      <div className="font-semibold text-gray-900">{practitioner?.name}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Service</div>
                      <div className="font-semibold text-gray-900">{service?.title}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Date</div>
                      <div className="font-semibold text-gray-900">{date?.toDateString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Time</div>
                      <div className="font-semibold text-gray-900">{time}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Session</div>
                      <div className="font-semibold text-gray-900">{sessionType}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Price</div>
                      <div className="font-semibold text-gray-900">£{priceGBP.toFixed(0)}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={confirm}
                  disabled={saving || !user || user.role === "guest"}
                  className={[
                    "mt-5 w-full px-5 py-3 rounded-2xl font-semibold text-white transition",
                    "bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-95 active:scale-[0.99]",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                  ].join(" ")}
                >
                  {saving ? "Confirming…" : "Confirm Booking"}
                </button>
              </div>
            )}

            {/* Bottom nav */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-800 text-sm hover:bg-gray-50 active:scale-[0.99] transition disabled:opacity-60"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => setStep((s) => Math.min(3, s + 1))}
                disabled={!canProceed || step === 3}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-800 active:scale-[0.99] transition disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>

          {/* Right: Sticky summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">Booking Summary</div>

              <div className="mt-4 space-y-3 text-sm">
                <Row label="Practitioner" value={practitioner?.name || "-"} />
                <Row label="Service" value={service?.title || "-"} />
                <Row label="Duration" value={service ? `${service.durationMin} min` : "-"} />
                <Row label="Price" value={service ? `£${priceGBP.toFixed(0)}` : "-"} />
                <div className="h-px bg-gray-200 my-3" />
                <Row label="Date" value={date ? date.toDateString() : "-"} />
                <Row label="Time" value={time || "-"} />
                <Row label="Session" value={sessionType || "-"} />
              </div>

              {user?.role === "guest" ? (
                <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                  Guest mode: login required to confirm booking.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-gray-500">{label}</div>
      <div className="font-semibold text-gray-900 text-right">{value}</div>
    </div>
  );
}
