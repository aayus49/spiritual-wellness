import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";

async function geocode(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  const data = await res.json();
  if (!data?.length) return null;
  return {
    displayName: data[0].display_name,
    lat: Number(data[0].lat),
    lon: Number(data[0].lon),
  };
}

// MVP placeholder: real astrology later; structure is supabase-ready
function fakeChart() {
  const signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
  const pick = () => signs[Math.floor(Math.random() * signs.length)];
  return { sun: pick(), moon: pick(), rising: pick() };
}

export default function BirthChartPage() {
  const { user } = useAuth();
  const { saveReading } = useUserData();

  const [form, setForm] = useState({ date: "", time: "", place: "" });
  const [loading, setLoading] = useState(false);
  const [geo, setGeo] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  const generate = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    setGeo(null);
    setResult(null);

    try {
      const g = await geocode(form.place);
      if (!g) throw new Error("Could not find that place. Try 'City, Country'.");
      setGeo(g);

      // Placeholder chart result – later plug real astrology library here
      const r = fakeChart();
      setResult(r);
    } catch (ex) {
      setErr(ex.message || "Failed to generate chart");
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    if (user.role === "guest" || !result || !geo) return;
    saveReading({
      type: "birth_chart",
      title: "Birth Chart",
      payload: { ...form, geo, result },
    });
  };

  return (
    <div className="bg-gray-50 min-h-[85vh] px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Birth Chart</h1>
        <p className="text-gray-600 mt-2">Uses real geolocation (city → latitude/longitude). Astrology engine will be swapped in later.</p>

        <form onSubmit={generate} className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Birth date">
              <input required type="date" className="w-full border rounded-xl px-3 py-2"
                value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <Field label="Birth time">
              <input required type="time" className="w-full border rounded-xl px-3 py-2"
                value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </Field>
            <Field label="Birth place">
              <input required type="text" placeholder="City, Country" className="w-full border rounded-xl px-3 py-2"
                value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} />
            </Field>
          </div>

          {err && <div className="mt-4 text-sm text-red-600">{err}</div>}

          <div className="mt-6 flex gap-3">
            <button disabled={loading} className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold disabled:opacity-60">
              {loading ? "Generating..." : "Generate Chart"}
            </button>
            <button type="button" onClick={save} disabled={user.role === "guest" || !result} className="px-5 py-3 rounded-xl border border-purple-200 text-purple-700 font-semibold disabled:opacity-50">
              Save to Profile
            </button>
          </div>
        </form>

        {(geo || result) && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Results</h2>

            {geo && (
              <div className="mt-3 text-gray-700">
                <div className="font-medium">{geo.displayName}</div>
                <div className="text-sm text-gray-600">Lat: {geo.lat} | Lon: {geo.lon}</div>
              </div>
            )}

            {result && (
              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <Result label="Sun" value={result.sun} />
                <Result label="Moon" value={result.moon} />
                <Result label="Rising" value={result.rising} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm text-gray-700">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
function Result({ label, value }) {
  return (
    <div className="rounded-xl bg-purple-50 border border-purple-100 p-4">
      <div className="text-sm text-purple-700 font-medium">{label}</div>
      <div className="text-lg font-semibold text-gray-900 mt-1">{value}</div>
    </div>
  );
}
