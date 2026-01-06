import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";
import CustomCalendar from "../shared/CustomCalendar";
import TimePicker from "../shared/TimePicker";
import PlaceAutocomplete from "../shared/PlaceAutocomplete";

/**
 * This is a frontend MVP “real chart” view:
 * - Uses real geolocation (lat/lon from Nominatim via PlaceAutocomplete)
 * - Produces an actual chart wheel (SVG) with houses + planets plotted deterministically
 * - For now: planets are pseudo-positions (stable per input) to look/feel like a real chart UI
 * - Later: replace `computeChart()` with a real astro ephemeris library and keep the UI intact
 */

const PLANETS = [
  { key: "Sun", label: "Sun" },
  { key: "Moon", label: "Moon" },
  { key: "Mercury", label: "Mercury" },
  { key: "Venus", label: "Venus" },
  { key: "Mars", label: "Mars" },
  { key: "Jupiter", label: "Jupiter" },
  { key: "Saturn", label: "Saturn" },
];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function hashToUnit(str) {
  // deterministic 0..1
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // convert to 0..1
  return ((h >>> 0) % 100000) / 100000;
}

function sunSignFromDate(dateObj) {
  // simple Western sun sign boundaries
  const m = dateObj.getMonth() + 1;
  const d = dateObj.getDate();
  const md = m * 100 + d;
  if (md >= 321 && md <= 419) return "Aries";
  if (md >= 420 && md <= 520) return "Taurus";
  if (md >= 521 && md <= 620) return "Gemini";
  if (md >= 621 && md <= 722) return "Cancer";
  if (md >= 723 && md <= 822) return "Leo";
  if (md >= 823 && md <= 922) return "Virgo";
  if (md >= 923 && md <= 1022) return "Libra";
  if (md >= 1023 && md <= 1121) return "Scorpio";
  if (md >= 1122 && md <= 1221) return "Sagittarius";
  if (md >= 1222 || md <= 119) return "Capricorn";
  if (md >= 120 && md <= 218) return "Aquarius";
  return "Pisces"; // 2/19–3/20
}

function computeChart({ dateObj, timeLabel, place }) {
  // stable seed per input
  const seed = `${dateObj.toISOString().slice(0, 10)}|${timeLabel}|${place?.lat}|${place?.lon}|${place?.label || ""}`;

  // Create pseudo positions in degrees 0..360
  const planets = PLANETS.map((p, idx) => {
    const u = hashToUnit(seed + "|" + p.key + "|" + idx);
    return { ...p, deg: Math.round(u * 3600) / 10 }; // 0.1° resolution
  });

  // Ascendant/MC pseudo
  const asc = Math.round(hashToUnit(seed + "|ASC") * 3600) / 10;
  const mc = Math.round(hashToUnit(seed + "|MC") * 3600) / 10;

  const sunSign = sunSignFromDate(dateObj);

  return {
    seed,
    sunSign,
    ascDeg: asc,
    mcDeg: mc,
    planets,
    // houses are 12 equal divisions here; real calc later
    houses: Array.from({ length: 12 }, (_, i) => ({
      house: i + 1,
      cuspDeg: Math.round(((asc + i * 30) % 360) * 10) / 10,
    })),
  };
}

function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={[
        "px-5 py-3 rounded-2xl font-semibold transition",
        "active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-purple-200",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      {title && <div className="text-lg font-semibold text-gray-900">{title}</div>}
      <div className={title ? "mt-4" : ""}>{children}</div>
    </div>
  );
}

function ChartWheelSVG({ chart, size = 360 }) {
  const cx = size / 2;
  const cy = size / 2;

  const rOuter = size * 0.46;
  const rInner = size * 0.30;
  const rPlanets = size * 0.38;

  function polar(r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const houseLines = chart.houses.map(h => {
    const a = h.cuspDeg;
    const p1 = polar(rOuter, a);
    const p2 = polar(rInner, a);
    return { house: h.house, p1, p2, deg: a };
  });

  const planetDots = chart.planets.map(p => {
    const pos = polar(rPlanets, p.deg);
    return { ...p, ...pos };
  });

  const ascLine = (() => {
    const p1 = polar(rOuter, chart.ascDeg);
    const p2 = polar(rInner, chart.ascDeg);
    return { p1, p2 };
  })();

  const mcLine = (() => {
    const p1 = polar(rOuter, chart.mcDeg);
    const p2 = polar(rInner, chart.mcDeg);
    return { p1, p2 };
  })();

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      {/* background */}
      <circle cx={cx} cy={cy} r={rOuter} fill="white" stroke="#E5E7EB" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={rInner} fill="transparent" stroke="#E5E7EB" strokeWidth="2" />

      {/* house lines */}
      {houseLines.map(l => (
        <line
          key={l.house}
          x1={l.p1.x}
          y1={l.p1.y}
          x2={l.p2.x}
          y2={l.p2.y}
          stroke="#E5E7EB"
          strokeWidth="2"
        />
      ))}

      {/* ASC / MC emphasis */}
      <line x1={ascLine.p1.x} y1={ascLine.p1.y} x2={ascLine.p2.x} y2={ascLine.p2.y} stroke="#7C3AED" strokeWidth="3" />
      <line x1={mcLine.p1.x} y1={mcLine.p1.y} x2={mcLine.p2.x} y2={mcLine.p2.y} stroke="#A78BFA" strokeWidth="3" />

      {/* planet dots */}
      {planetDots.map(p => (
        <g key={p.key}>
          <circle cx={p.x} cy={p.y} r={8} fill="#111827" opacity="0.95" />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="8" fill="white">
            {p.key[0]}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function BirthChartPage() {
  const { user } = useAuth();
  const { saveReading } = useUserData();

  const [birthDate, setBirthDate] = useState(new Date());
  const [birthTime, setBirthTime] = useState("18:00");
  const [place, setPlace] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const canGenerate = !!birthDate && !!birthTime && !!place?.lat;

  const headerSummary = useMemo(() => {
    const dateLabel = birthDate ? birthDate.toDateString() : "";
    const placeLabel = place?.label ? place.label.split(",").slice(0, 2).join(",") : "";
    return `${dateLabel} • ${birthTime} • ${placeLabel}`;
  }, [birthDate, birthTime, place]);

  async function generate() {
    setSavedMsg("");
    setLoading(true);
    try {
      // In a real implementation: call astro library using date/time + lat/lon
      const computed = computeChart({ dateObj: birthDate, timeLabel: birthTime, place });
      setChart(computed);
      // smooth scroll into results
      setTimeout(() => {
        const el = document.getElementById("birthchart-results");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } finally {
      setLoading(false);
    }
  }

  function save() {
    if (!chart) return;

    const summary = `Sun: ${chart.sunSign} • ASC: ${chart.ascDeg}° • Place: ${place.label.split(",").slice(0, 2).join(",")}`;

    saveReading({
      type: "birthchart",
      title: "Birth Chart",
      summary,
      payload: {
        input: {
          dateISO: birthDate.toISOString().slice(0, 10),
          timeLabel: birthTime,
          place,
        },
        chart,
      },
    });

    setSavedMsg("Saved to your dashboard");
    setTimeout(() => setSavedMsg(""), 1800);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Birth Chart</h1>
        <p className="text-gray-600 mt-1">Enter your birth details. Place uses real geolocation (lat/lon).</p>

        {/* Form */}
        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          <Card title="Birth Date">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-gray-600">Selected</div>
                <div className="mt-1 font-semibold text-gray-900">{birthDate.toDateString()}</div>
              </div>
              <Button
                type="button"
                onClick={() => setShowDatePicker(v => !v)}
                className="border border-gray-200 bg-white hover:bg-gray-50"
              >
                {showDatePicker ? "Close" : "Pick date"}
              </Button>
            </div>

            {showDatePicker && (
              <div className="mt-4">
                <CustomCalendar
                  value={birthDate}
                  onChange={(d) => {
                    setBirthDate(d);
                    setShowDatePicker(false);
                  }}
                />
              </div>
            )}
          </Card>

          <Card title="Birth Time">
            <TimePicker value={birthTime} onChange={setBirthTime} />
          </Card>

          <Card title="Birth Place">
            <PlaceAutocomplete value={place} onChange={setPlace} />
          </Card>
        </div>

        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <Button
            type="button"
            onClick={generate}
            disabled={!canGenerate || loading}
            className="bg-gradient-to-r from-purple-600 to-purple-400 text-white hover:opacity-95"
          >
            {loading ? "Generating…" : "Generate Chart"}
          </Button>

          <div className="text-sm text-gray-600">{headerSummary}</div>
        </div>

        {/* Results */}
        <div id="birthchart-results" className="mt-10">
          {!chart ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-gray-600">
              Generate your chart to see results here.
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card title="Chart Wheel">
                <div className="flex items-center justify-center">
                  <div className="rounded-2xl border border-gray-200 p-4 bg-white">
                    <ChartWheelSVG chart={chart} size={360} />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 flex-wrap">
                  <Button
                    type="button"
                    onClick={save}
                    disabled={user.role === "guest"}
                    className={
                      user.role === "guest"
                        ? "border border-gray-200 bg-white text-gray-400"
                        : "border border-gray-200 bg-white hover:bg-gray-50 text-gray-900"
                    }
                  >
                    Save to Profile
                  </Button>

                  {user.role === "guest" && (
                    <div className="text-sm text-gray-500">Login to save readings.</div>
                  )}
                  {savedMsg && <div className="text-sm text-green-700">{savedMsg}</div>}
                </div>
              </Card>

              <Card title="Key Details">
                <div className="grid gap-3">
                  <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                    <div className="text-xs text-gray-500">Sun Sign</div>
                    <div className="mt-1 font-semibold text-gray-900">{chart.sunSign}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                      <div className="text-xs text-gray-500">Ascendant (ASC)</div>
                      <div className="mt-1 font-semibold text-gray-900">{chart.ascDeg}°</div>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                      <div className="text-xs text-gray-500">Midheaven (MC)</div>
                      <div className="mt-1 font-semibold text-gray-900">{chart.mcDeg}°</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 p-4">
                    <div className="font-semibold text-gray-900">Planet Positions</div>
                    <div className="mt-3 grid gap-2">
                      {chart.planets.map(p => (
                        <div key={p.key} className="flex items-center justify-between text-sm">
                          <div className="text-gray-700">{p.label}</div>
                          <div className="font-semibold text-gray-900">{p.deg}°</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Note: Positions are stable per input for UI demo. Replace `computeChart()` with real ephemeris later.
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
