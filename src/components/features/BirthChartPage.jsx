import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";
import CustomCalendar from "../shared/CustomCalendar";
import TimePicker from "../shared/TimePicker";
import PlaceAutocomplete from "../shared/PlaceAutocomplete";
import Button from "../shared/Button";

/**
 * Frontend MVP “real chart” view:
 * - Real geolocation (lat/lon) via PlaceAutocomplete (Nominatim)
 * - SVG chart wheel with houses + planets plotted deterministically (stable per input)
 * - Replace computeChart() later with a real ephemeris library without changing UI
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

function hashToUnit(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function sunSignFromDate(dateObj) {
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
  return "Pisces";
}

function computeChart({ dateObj, timeLabel, place }) {
  const seed = `${dateObj.toISOString().slice(0, 10)}|${timeLabel}|${place?.lat}|${place?.lon}|${place?.label || ""}`;

  const planets = PLANETS.map((p, idx) => {
    const u = hashToUnit(seed + "|" + p.key + "|" + idx);
    return { ...p, deg: Math.round(u * 3600) / 10 };
  });

  const asc = Math.round(hashToUnit(seed + "|ASC") * 3600) / 10;
  const mc = Math.round(hashToUnit(seed + "|MC") * 3600) / 10;

  const sunSign = sunSignFromDate(dateObj);

  return {
    seed,
    sunSign,
    ascDeg: asc,
    mcDeg: mc,
    planets,
    houses: Array.from({ length: 12 }, (_, i) => ({
      house: i + 1,
      cuspDeg: Math.round((((asc + i * 30) % 360) * 10)) / 10,
    })),
  };
}

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      {(title || subtitle) && (
        <div>
          {title && <div className="text-lg font-semibold text-gray-900">{title}</div>}
          {subtitle && <div className="mt-1 text-sm text-gray-600">{subtitle}</div>}
        </div>
      )}
      <div className={title || subtitle ? "mt-4" : ""}>{children}</div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function ChartWheelSVG({ chart, size = 380 }) {
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
    return { house: h.house, p1, p2 };
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
      <circle cx={cx} cy={cy} r={rOuter} fill="white" stroke="#E5E7EB" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={rInner} fill="transparent" stroke="#E5E7EB" strokeWidth="2" />

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

      <line x1={ascLine.p1.x} y1={ascLine.p1.y} x2={ascLine.p2.x} y2={ascLine.p2.y} stroke="#7C3AED" strokeWidth="3" />
      <line x1={mcLine.p1.x} y1={mcLine.p1.y} x2={mcLine.p2.x} y2={mcLine.p2.y} stroke="#A78BFA" strokeWidth="3" />

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
      const computed = computeChart({ dateObj: birthDate, timeLabel: birthTime, place });
      setChart(computed);
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

    const summary = `Sun: ${chart.sunSign} ƒ?› ASC: ${chart.ascDeg}Aø ƒ?› Place: ${place.label.split(",").slice(0, 2).join(",")}`;

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
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Birth Chart</h1>
            <p className="text-gray-600 mt-1">Real geolocation input (lat/lon). Chart UI is ready for ephemeris swap.</p>
          </div>
          <div className="text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1">
            {headerSummary}
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          <Card title="Birth Date" subtitle="Select your birth date">
            <CustomCalendar value={birthDate} onChange={setBirthDate} />
          </Card>

          <Card title="Birth Time" subtitle="Pick your birth time">
            <TimePicker value={birthTime} onChange={setBirthTime} />
          </Card>

          <Card title="Birth Place" subtitle="Search city to fetch coordinates">
            <PlaceAutocomplete value={place} onChange={setPlace} />
          </Card>
        </div>

        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <Button
            variant="primary"
            onClick={generate}
            disabled={!canGenerate}
            loading={loading}
          >
            Generate Chart
          </Button>

          <Button
            variant="outline"
            onClick={save}
            disabled={user.role === "guest" || !chart}
          >
            Save Reading
          </Button>

        </div>

        <div id="birthchart-results" className="mt-10">
          {!chart ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm text-gray-600">
              Generate your chart to see results here.
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card title="Chart Wheel" subtitle="Planets plotted on a 12-house wheel">
                <div className="flex items-center justify-center">
                  <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                    <ChartWheelSVG chart={chart} size={380} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <StatPill label="Sun Sign" value={chart.sunSign} />
                  <StatPill label="ASC" value={`${chart.ascDeg}°`} />
                  <StatPill label="MC" value={`${chart.mcDeg}°`} />
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Replace <span className="font-semibold">computeChart()</span> with a real ephemeris library later.
                </div>
              </Card>

              <Card title="Details" subtitle="Inputs + planet positions">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-sm text-gray-700">
                    <div>
                      <span className="text-gray-500">Date:</span>{" "}
                      <span className="font-semibold text-gray-900">{birthDate.toISOString().slice(0, 10)}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-gray-500">Time:</span>{" "}
                      <span className="font-semibold text-gray-900">{birthTime}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-gray-500">Place:</span>{" "}
                      <span className="font-semibold text-gray-900">{place?.label}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Lat/Lon: {place?.lat?.toFixed?.(4)}, {place?.lon?.toFixed?.(4)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <Button
                    variant="primary"
                    onClick={save}
                    disabled={user.role === "guest" || !chart}
                  >
                    Save Reading
                  </Button>
                  {user.role === "guest" && (
                    <div className="text-xs text-gray-500">Login to save this reading.</div>
                  )}
                  {savedMsg && <div className="text-xs text-green-700">{savedMsg}</div>}
                </div>

                <div className="mt-5">
                  <div className="font-semibold text-gray-900">Planet Positions</div>
                  <div className="mt-3 grid gap-2">
                    {chart.planets.map(p => (
                      <div key={p.key} className="flex items-center justify-between text-sm">
                        <div className="text-gray-700">{p.label}</div>
                        <div className="font-semibold text-gray-900">{p.deg}°</div>
                      </div>
                    ))}
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
