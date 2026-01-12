// src/components/landing/HomePage.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserData } from "../../context/UserDataContext";
import {
  Sparkles,
  Stars,
  MapPin,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Wand2,
  LineChart,
} from "lucide-react";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function Section({ children, className = "" }) {
  return <section className={cx("py-14", className)}>{children}</section>;
}

function Container({ children }) {
  return <div className="max-w-6xl mx-auto px-6">{children}</div>;
}

function Badge({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90">
      <Sparkles className="h-4 w-4" />
      {children}
    </div>
  );
}

function PrimaryButton({ to, children }) {
  return (
    <Link
      to={to}
      className={cx(
        "inline-flex items-center justify-center gap-2",
        "px-6 py-3 rounded-2xl font-semibold",
        "bg-white text-gray-900",
        "shadow-lg shadow-purple-900/20",
        "hover:shadow-xl hover:shadow-purple-900/30 hover:-translate-y-[1px]",
        "active:translate-y-0 active:scale-[0.99]",
        "transition"
      )}
    >
      {children}
      <ChevronRight className="h-4 w-4" />
    </Link>
  );
}

function GhostButton({ to, children }) {
  return (
    <Link
      to={to}
      className={cx(
        "inline-flex items-center justify-center gap-2",
        "px-6 py-3 rounded-2xl font-semibold",
        "bg-white/10 text-white border border-white/15",
        "hover:bg-white/15 hover:-translate-y-[1px]",
        "active:translate-y-0 active:scale-[0.99]",
        "transition"
      )}
    >
      {children}
      <ChevronRight className="h-4 w-4" />
    </Link>
  );
}

function FeatureCard({ icon: Icon, title, desc, to, tone = "purple" }) {
  const toneClasses =
    tone === "purple"
      ? "from-purple-600/10 to-indigo-500/5"
      : tone === "pink"
      ? "from-pink-500/10 to-purple-500/5"
      : "from-indigo-600/10 to-purple-500/5";

  return (
    <Link
      to={to}
      className={cx(
        "group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm",
        "hover:shadow-lg hover:-translate-y-[2px]",
        "transition"
      )}
    >
      <div className={cx("rounded-2xl border border-gray-200 bg-gradient-to-br p-4", toneClasses)}>
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-gray-200 shadow-sm">
          <Icon className="h-5 w-5 text-gray-900" />
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-gray-900">{title}</div>
          <div className="mt-1 text-sm text-gray-600 leading-relaxed">{desc}</div>
        </div>
        <div className="mt-1 text-gray-400 group-hover:text-gray-900 transition">
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-white/70">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const { practitioners } = useUserData();
  const featuredPractitioners = useMemo(() => {
    return (practitioners || []).filter((p) => p?.verified).slice(0, 2);
  }, [practitioners]);

  return (
    <div className="bg-gray-50">
      {/* HERO */}
      <div className="relative overflow-hidden">
        {/* gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-600" />
        {/* soft glow blobs */}
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-pink-400/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.16),transparent_55%),radial-gradient(circle_at_70%_30%,rgba(236,72,153,0.14),transparent_55%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.14),transparent_55%)]" />

        <Container>
          <div className="relative py-16 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="max-w-3xl md:max-w-none md:pr-[460px]"
            >
              <Badge>Birth charts with real locations • Verified practitioners only</Badge>

              <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight text-white">
                Discover Your
                <span className="block">Spiritual Path</span>
              </h1>

              <p className="mt-5 text-white/80 text-base md:text-lg leading-relaxed max-w-2xl">
                Tarot insights, birth charts using real geolocation, and daily horoscopes — plus practitioners you can
                actually book. Guests can explore; login to save readings and manage appointments.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <PrimaryButton to="/tarot">Get a Free Reading</PrimaryButton>
                <GhostButton to="/practitioners">Find Practitioners</GhostButton>
              </div>

              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
                <Stat label="Guest mode" value="Free" />
                <Stat label="Save readings" value="Login" />
                <Stat label="Real geo inputs" value="Lat/Lon" />
                <Stat label="Bookings" value="Built-in" />
              </div>
            </motion.div>

            {/* Right side “glass” panel */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-10 md:mt-0 md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2 md:w-[420px]"
            >
              <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/25 p-6">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Verified Directory</div>
                    <div className="text-white/70 text-sm">Only registered practitioners appear</div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-white/90 text-sm font-semibold">Tarot • 3-card spread</div>
                      <div className="text-xs text-white/60">Past / Present / Future</div>
                    </div>
                    <div className="mt-2 text-white/70 text-sm">
                      Flip cards, see upright/reversed meanings, then save to your dashboard.
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-white/90 text-sm font-semibold">Birth Chart • Real location</div>
                      <div className="text-xs text-white/60">City → Lat/Lon</div>
                    </div>
                    <div className="mt-2 text-white/70 text-sm">
                      Search places, use actual geolocation, and generate a chart wheel view.
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-white/90 text-sm font-semibold">Bookings</div>
                      <div className="text-xs text-white/60">Confirm / Cancel / Complete</div>
                    </div>
                    <div className="mt-2 text-white/70 text-sm">
                      Book sessions with available times and track status inside the dashboard.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>

      {/* SERVICES */}
      <Section>
        <Container>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-purple-700">Services</div>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">Everything in one place</h2>
              <p className="mt-2 text-gray-600 max-w-2xl">
                Clean UI, smooth interactions, and a structure that’s ready to swap localStorage for Supabase.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-gray-900 hover:text-purple-700 transition inline-flex items-center gap-2"
            >
              Open Dashboard <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Wand2}
              title="Tarot Reading"
              desc="Animated shuffle, 3-card spread, upright/reversed, and save-ready summaries."
              to="/tarot"
              tone="purple"
            />
            <FeatureCard
              icon={MapPin}
              title="Birth Chart"
              desc="Real place search with geolocation and a chart wheel view that looks like a real chart."
              to="/birth-chart"
              tone="indigo"
            />
            <FeatureCard
              icon={Stars}
              title="Daily Horoscope"
              desc="Zodiac-based guidance that stays consistent throughout the day."
              to="/horoscope"
              tone="pink"
            />
          </div>
        </Container>
      </Section>

      {/* PRACTITIONERS PREVIEW */}
      <Section className="pt-0">
        <Container>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-purple-700">Practitioners</div>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">Verified directory preview</h3>
              <p className="mt-2 text-gray-600">
                If no practitioners exist in storage, this section stays empty — no fake profiles.
              </p>
            </div>
            <Link
              to="/practitioners"
              className="text-sm font-semibold text-gray-900 hover:text-purple-700 transition inline-flex items-center gap-2"
            >
              View Directory <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {featuredPractitioners.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-7 text-gray-600">
                No practitioners registered yet.
              </div>
            ) : (
              featuredPractitioners.map((p) => (
                <div key={p.userId} className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-gray-900 font-semibold text-lg">{p.name || "Practitioner"}</div>
                      <div className="mt-1 text-sm text-gray-600">
                        {p.specialties?.length ? p.specialties.join(" • ") : "Spiritual Practitioner"}
                      </div>
                      <div className="mt-3 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700">
                        <ShieldCheck className="h-4 w-4" />
                        Registered
                      </div>
                    </div>
                    <Link
                      to="/practitioners"
                      className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-semibold hover:bg-gray-50 active:scale-[0.99] transition"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Container>
      </Section>

      {/* FINAL CTA */}
      <Section className="pt-0 pb-20">
        <Container>
          <div className="rounded-[32px] border border-gray-200 bg-white p-10 shadow-sm relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />

            <div className="relative flex items-start justify-between gap-6 flex-wrap">
              <div className="max-w-2xl">
                <div className="text-sm font-semibold text-purple-700">Ready</div>
                <h3 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">
                  Start with Tarot, then save it to your dashboard
                </h3>
                <p className="mt-2 text-gray-600">
                  Guests can explore immediately. Login unlocks saving readings, booking, and dashboard history.
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/tarot"
                  className="px-6 py-3 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 active:scale-[0.99] transition"
                >
                  Open Tarot
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900 font-semibold hover:bg-gray-50 active:scale-[0.99] transition"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}

function Step({ n, title, desc }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="h-9 w-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center font-bold text-gray-900">
        {n}
      </div>
      <div>
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="mt-1 text-sm text-gray-600 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}
