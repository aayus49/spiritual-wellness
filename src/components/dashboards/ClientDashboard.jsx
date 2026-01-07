// src/components/dashboards/ClientDashboard.jsx
import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";

export default function ClientDashboard() {
  const { user } = useAuth();
  const { readings, appointments, deleteReading, updateAppointmentStatus } = useUserData();

  const [tab, setTab] = useState("overview");
  const [openReading, setOpenReading] = useState(null);

  const myReadings = useMemo(
    () => readings.filter((r) => r.type && user.role !== "guest"),
    [readings, user.role]
  );

  const myAppts = useMemo(
    () => appointments.filter((a) => a.clientId === user.id),
    [appointments, user.id]
  );

  const recentActivity = useMemo(() => {
    const items = [];
    myReadings.slice(0, 4).forEach((r) => {
      items.push({
        id: `r-${r.id}`,
        kind: "reading",
        title: r.title,
        subtitle: r.createdAtLabel,
        action: () => setOpenReading(r),
      });
    });
    myAppts.slice(0, 4).forEach((a) => {
      items.push({
        id: `a-${a.id}`,
        kind: "appointment",
        title: `Appointment with ${a.practitionerName}`,
        subtitle: `${a.dateISO ? new Date(a.dateISO).toDateString() : a.date} • ${a.timeLabel || a.time}`,
        action: null,
      });
    });
    return items.slice(0, 6);
  }, [myReadings, myAppts]);

  const stats = useMemo(() => {
    const upcoming = myAppts.filter((a) => a.status !== "cancelled" && a.status !== "completed").length;
    const savedCharts = myReadings.filter((r) => r.type === "birthchart").length;
    return [
      { label: "Total Readings", value: myReadings.length },
      { label: "Upcoming Appointments", value: upcoming },
      { label: "Saved Charts", value: savedCharts },
      { label: "Account", value: user.role === "guest" ? "Guest" : "Client" },
    ];
  }, [myReadings, myAppts, user.role]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {user.name}</p>
          </div>

          <a
            href="/practitioners"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold hover:opacity-95 active:scale-[0.99] transition focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            Book New Appointment
          </a>
        </div>

        {/* Tabs */}
        <div className="mt-7 flex items-center gap-2 flex-wrap">
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>Overview</TabButton>
          <TabButton active={tab === "readings"} onClick={() => setTab("readings")}>My Readings</TabButton>
          <TabButton active={tab === "appointments"} onClick={() => setTab("appointments")}>My Appointments</TabButton>
          <TabButton active={tab === "profile"} onClick={() => setTab("profile")}>My Profile</TabButton>
        </div>

        {/* Stats */}
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className="mt-1 text-xl font-bold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="mt-8">
          {tab === "overview" && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Section title="Recent Activity">
                  {recentActivity.length === 0 ? (
                    <EmptyState
                      title="No activity yet"
                      text="Generate a reading or book an appointment to see your timeline here."
                      ctaLabel="Explore Practitioners"
                      ctaHref="/practitioners"
                    />
                  ) : (
                    <div className="space-y-3">
                      {recentActivity.map((it) => (
                        <div key={it.id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-sm transition">
                          <div>
                            <div className="font-semibold text-gray-900">{it.title}</div>
                            <div className="text-sm text-gray-500">{it.subtitle}</div>
                          </div>
                          {it.action ? (
                            <button
                              onClick={it.action}
                              className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-800 active:scale-[0.99] transition focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                              View
                            </button>
                          ) : (
                            <span className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">Logged</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                <Section title="Saved Readings (Latest)">
                  <ReadingsList
                    items={myReadings.slice(0, 5)}
                    onView={setOpenReading}
                    onDelete={deleteReading}
                  />
                </Section>
              </div>

              <div className="space-y-6">
                <Section title="Upcoming Appointments">
                  <AppointmentsList
                    items={myAppts.filter((a) => a.status !== "cancelled" && a.status !== "completed").slice(0, 5)}
                    onCancel={(id) => updateAppointmentStatus(id, "cancelled")}
                  />
                </Section>

                <Section title="Quick Actions">
                  <div className="grid gap-3">
                    <a
                      href="/tarot"
                      className="px-5 py-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.99] transition font-semibold text-gray-900"
                    >
                      Do a Tarot Reading
                    </a>
                    <a
                      href="/birth-chart"
                      className="px-5 py-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.99] transition font-semibold text-gray-900"
                    >
                      Generate Birth Chart
                    </a>
                    <a
                      href="/horoscope"
                      className="px-5 py-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.99] transition font-semibold text-gray-900"
                    >
                      View Daily Horoscope
                    </a>
                  </div>
                </Section>
              </div>
            </div>
          )}

          {tab === "readings" && (
            <Section title="My Readings">
              <ReadingsList items={myReadings} onView={setOpenReading} onDelete={deleteReading} />
            </Section>
          )}

          {tab === "appointments" && (
            <Section title="My Appointments">
              <AppointmentsList
                items={myAppts}
                onCancel={(id) => updateAppointmentStatus(id, "cancelled")}
              />
            </Section>
          )}

          {tab === "profile" && (
            <Section title="My Profile">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="mt-1 font-semibold text-gray-900">{user.name}</div>

                  <div className="mt-4 text-xs text-gray-500">Role</div>
                  <div className="mt-1 font-semibold text-gray-900">{user.role}</div>

                  <div className="mt-4 text-xs text-gray-500">Email</div>
                  <div className="mt-1 font-semibold text-gray-900">{user.email || "—"}</div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="font-semibold text-gray-900">Profile Settings</div>
                  <div className="mt-2 text-sm text-gray-600">
                    This is frontend-only right now. When you connect Supabase later, this section can save profile changes to the database.
                  </div>
                  <div className="mt-4 grid gap-3">
                    <button className="px-5 py-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.99] transition font-semibold text-gray-900">
                      Edit Profile (UI)
                    </button>
                    <button className="px-5 py-3 rounded-2xl border border-red-200 bg-white text-red-700 hover:bg-red-50 active:scale-[0.99] transition font-semibold">
                      Delete Account (UI)
                    </button>
                  </div>
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>

      {openReading && (
        <ReadingModal reading={openReading} onClose={() => setOpenReading(null)} />
      )}
    </div>
  );
}

/* ---------- UI pieces ---------- */

function TabButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={[
        "px-4 py-2 rounded-2xl text-sm font-semibold transition",
        "border",
        active
          ? "bg-gradient-to-r from-purple-600 to-purple-400 text-white border-transparent shadow-sm"
          : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
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

function EmptyState({ title, text, ctaLabel, ctaHref }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
      <div className="font-semibold text-gray-900">{title}</div>
      <div className="mt-1 text-sm text-gray-600">{text}</div>
      {ctaLabel && ctaHref && (
        <a
          href={ctaHref}
          className="inline-flex mt-4 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold hover:opacity-95 active:scale-[0.99] transition"
        >
          {ctaLabel}
        </a>
      )}
    </div>
  );
}

function badgeClass(type) {
  if (type === "tarot") return "bg-purple-50 text-purple-700 border-purple-100";
  if (type === "birthchart") return "bg-indigo-50 text-indigo-700 border-indigo-100";
  if (type === "horoscope") return "bg-yellow-50 text-yellow-700 border-yellow-100";
  return "bg-gray-50 text-gray-700 border-gray-100";
}

function ReadingsList({ items, onView, onDelete }) {
  if (!items || items.length === 0) {
    return <div className="text-gray-600">No saved readings yet.</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((r) => (
        <div key={r.id} className="border border-gray-200 rounded-2xl p-4 bg-white hover:shadow-md transition">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-semibold text-gray-900">{r.title}</div>
                <span className={`text-xs px-2 py-1 rounded-full border ${badgeClass(r.type)}`}>
                  {r.type}
                </span>
              </div>
              <div className="text-sm text-gray-500">{r.createdAtLabel}</div>
              {r.summary && <div className="mt-2 text-sm text-gray-700">{r.summary}</div>}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => onView(r)}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-800 active:scale-[0.99] transition focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                View
              </button>
              <button
                onClick={() => onDelete(r.id)}
                className="px-4 py-2 rounded-xl border border-red-200 text-red-700 text-sm hover:bg-red-50 active:scale-[0.99] transition focus:outline-none focus:ring-2 focus:ring-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function statusPill(status) {
  if (status === "confirmed") return "bg-green-50 text-green-700 border-green-100";
  if (status === "pending") return "bg-yellow-50 text-yellow-700 border-yellow-100";
  if (status === "completed") return "bg-gray-100 text-gray-700 border-gray-200";
  if (status === "cancelled") return "bg-red-50 text-red-700 border-red-100";
  return "bg-gray-50 text-gray-700 border-gray-100";
}

function AppointmentsList({ items, onCancel }) {
  if (!items || items.length === 0) {
    return <div className="text-gray-600">No bookings yet.</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((a) => (
        <div key={a.id} className="border border-gray-200 rounded-2xl p-4 bg-white hover:shadow-md transition">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold text-gray-900">{a.practitionerName}</div>
              <div className="text-sm text-gray-600">{a.serviceTitle || a.service} • £{a.priceGBP}</div>
              <div className="text-sm text-gray-500 mt-1">
                {(a.dateISO ? new Date(a.dateISO).toDateString() : a.date)} • {(a.timeLabel || a.time)}
              </div>

              <span className={`mt-2 inline-flex text-xs px-2 py-1 rounded-full border ${statusPill(a.status)}`}>
                {a.status}
              </span>
            </div>

            {a.status !== "cancelled" && a.status !== "completed" && (
              <button
                onClick={() => onCancel(a.id)}
                className="px-4 py-2 rounded-xl border border-red-200 text-red-700 text-sm hover:bg-red-50 active:scale-[0.99] transition focus:outline-none focus:ring-2 focus:ring-red-100"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Modal placeholder – keep your existing ReadingModal (the one you already fixed).
   If you already have a full ReadingModal in this file, keep it.
   If not, paste your working ReadingModal here. */
function ReadingModal({ reading, onClose }) {
  if (!reading) return null;

  const payload = reading.payload || {};
  const type = reading.type || "reading";
  const title = reading.title || "Reading";
  const createdLabel = reading.createdAtLabel || "";

  const showTarot = type === "tarot";
  const showHoroscope = type === "horoscope";
  const showBirthChart = type === "birthchart";

  const tarotCards = payload.cards || [];
  const horoscope = payload.content || {};
  const chart = payload.chart || {};
  const input = payload.input || {};

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-purple-400 text-white flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-wider text-white/80">{type}</div>
            <div className="font-bold">{title}</div>
          </div>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 transition">
            Close
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto">
          <div className="p-6 text-gray-700 space-y-5">
            <div className="text-sm text-gray-500">{createdLabel}</div>

            {reading.summary && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                {reading.summary}
              </div>
            )}

            {showTarot && (
              <div className="space-y-4">
                {payload.description && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 whitespace-pre-line">
                    {payload.description}
                  </div>
                )}

                {tarotCards.length > 0 && (
                  <div className="grid gap-3">
                    {tarotCards.map((c, idx) => (
                      <div key={`${c.id || c.name}-${idx}`} className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold text-gray-900">{c.position} - {c.name}</div>
                          <span className="text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                            {c.reversed ? "Reversed" : "Upright"}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          {c.reversed ? c.reversedText : c.upright}
                        </div>
                        {Array.isArray(c.keywords) && c.keywords.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {c.keywords.slice(0, 5).map((kw) => (
                              <span key={kw} className="text-[11px] px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showHoroscope && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-sm text-gray-500">Sign</div>
                  <div className="text-lg font-semibold text-gray-900">{payload.sign}</div>
                  <div className="mt-1 text-sm text-gray-600">{payload.date}</div>
                </div>

                <div className="grid gap-3">
                  {horoscope.overall && (
                    <div className="rounded-2xl border border-gray-200 p-4">
                      <div className="font-semibold text-gray-900">Overall</div>
                      <div className="mt-1 text-sm text-gray-700">{horoscope.overall}</div>
                    </div>
                  )}
                  {horoscope.love && (
                    <div className="rounded-2xl border border-gray-200 p-4">
                      <div className="font-semibold text-gray-900">Love</div>
                      <div className="mt-1 text-sm text-gray-700">{horoscope.love}</div>
                    </div>
                  )}
                  {horoscope.career && (
                    <div className="rounded-2xl border border-gray-200 p-4">
                      <div className="font-semibold text-gray-900">Career</div>
                      <div className="mt-1 text-sm text-gray-700">{horoscope.career}</div>
                    </div>
                  )}
                  {(horoscope.luckyNumber || horoscope.luckyColor) && (
                    <div className="rounded-2xl border border-gray-200 p-4">
                      <div className="font-semibold text-gray-900">Lucky</div>
                      <div className="mt-1 text-sm text-gray-700">Number: {horoscope.luckyNumber || "-"}</div>
                      <div className="text-sm text-gray-700">Color: {horoscope.luckyColor || "-"}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {showBirthChart && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-sm text-gray-500">Input</div>
                  <div className="mt-1 text-sm text-gray-700">Date: {input.dateISO || "-"}</div>
                  <div className="text-sm text-gray-700">Time: {input.timeLabel || "-"}</div>
                  <div className="text-sm text-gray-700">Place: {input.place?.label || "-"}</div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <div className="text-xs text-gray-500">Sun Sign</div>
                    <div className="font-semibold text-gray-900">{chart.sunSign || "-"}</div>
                  </div>
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <div className="text-xs text-gray-500">ASC</div>
                    <div className="font-semibold text-gray-900">{chart.ascDeg != null ? chart.ascDeg : "-"}</div>
                  </div>
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <div className="text-xs text-gray-500">MC</div>
                    <div className="font-semibold text-gray-900">{chart.mcDeg != null ? chart.mcDeg : "-"}</div>
                  </div>
                </div>

                {Array.isArray(chart.planets) && chart.planets.length > 0 && (
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <div className="font-semibold text-gray-900">Planet Positions</div>
                    <div className="mt-2 grid gap-2">
                      {chart.planets.map((p) => (
                        <div key={p.key} className="flex items-center justify-between text-sm">
                          <div className="text-gray-700">{p.label || p.key}</div>
                          <div className="font-semibold text-gray-900">{p.deg}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
