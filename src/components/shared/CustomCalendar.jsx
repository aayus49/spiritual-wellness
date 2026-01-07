// src/components/shared/CustomCalendar.jsx
import React, { useMemo, useState } from "react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function clampYear(y) {
  // adjust if needed
  return Math.max(1900, Math.min(2100, y));
}

export default function CustomCalendar({ value, onChange }) {
  const initial = value || new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const today = new Date();

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const min = 1900;
    const max = current + 5;
    const arr = [];
    for (let y = max; y >= min; y--) arr.push(y);
    return arr;
  }, []);

  const grid = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const firstWeekday = first.getDay(); // 0 Sun
    const total = daysInMonth(first);

    const cells = [];
    // leading blanks
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    // month days
    for (let day = 1; day <= total; day++) cells.push(new Date(viewYear, viewMonth, day));
    // trailing blanks to complete 6 rows (optional)
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  function prevMonth() {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }
  function nextMonth() {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={prevMonth}
          className="shrink-0 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-[0.99] transition"
        >
          Prev
        </button>

        <div className="flex min-w-[220px] flex-1 items-center justify-center gap-2">
          <select
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
            value={viewMonth}
            onChange={(e) => setViewMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
            value={viewYear}
            onChange={(e) => setViewYear(clampYear(Number(e.target.value)))}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className="shrink-0 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-[0.99] transition"
        >
          Next
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 text-xs text-gray-500">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="py-2 text-center font-medium">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((d, idx) => {
          if (!d) return <div key={idx} className="h-10" />;
          const selected = value && sameDay(d, value);
          const isToday = sameDay(d, today);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange?.(d)}
              className={[
                "h-10 rounded-xl text-sm transition flex items-center justify-center",
                "border border-transparent hover:border-gray-200 hover:bg-gray-50 active:scale-[0.99]",
                selected ? "bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-sm" : "text-gray-900",
                !selected && isToday ? "ring-2 ring-purple-200" : "",
              ].join(" ")}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
