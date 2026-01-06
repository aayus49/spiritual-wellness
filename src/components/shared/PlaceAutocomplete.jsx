import React, { useEffect, useMemo, useState } from "react";

export default function PlaceAutocomplete({ value, onChange }) {
  const [q, setQ] = useState(value?.label || "");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const canSearch = useMemo(() => q.trim().length >= 3, [q]);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!canSearch) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=6`;
        const res = await fetch(url, {
          headers: {
            "Accept": "application/json",
          },
        });
        const data = await res.json();
        if (!alive) return;

        const mapped = (data || []).map(x => ({
          label: x.display_name,
          lat: Number(x.lat),
          lon: Number(x.lon),
        }));
        setItems(mapped);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    const t = setTimeout(run, 350);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q, canSearch]);

  return (
    <div className="relative">
      <div className="text-sm font-semibold text-gray-900">Birth Place</div>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="City, Country"
        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
      />

      <div className="mt-2 text-xs text-gray-500">
        {loading ? "Searching…" : value?.lat ? `Selected: ${value.lat.toFixed(4)}, ${value.lon.toFixed(4)}` : "Type 3+ characters"}
      </div>

      {items.length > 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          {items.map(it => (
            <button
              type="button"
              key={it.label}
              onClick={() => {
                onChange(it);
                setQ(it.label);
                setItems([]);
              }}
              className="w-full text-left px-4 py-3 hover:bg-purple-50 text-sm text-gray-800"
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
