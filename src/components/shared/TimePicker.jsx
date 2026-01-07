import React from "react";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function TimePicker({ value, onChange }) {
  const [h, m] = (value || "18:00").split(":").map(Number);

  function setHour(next) {
    const hh = Math.max(0, Math.min(23, next));
    onChange(`${pad(hh)}:${pad(m)}`);
  }

  function setMin(next) {
    const mm = Math.max(0, Math.min(59, next));
    onChange(`${pad(h)}:${pad(mm)}`);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-sm font-semibold text-gray-900">Time</div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 p-3">
          <div className="text-xs text-gray-500">Hour</div>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setHour(h - 1)}
              className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              -
            </button>
            <div className="text-xl font-bold">{pad(h)}</div>
            <button
              type="button"
              onClick={() => setHour(h + 1)}
              className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-3">
          <div className="text-xs text-gray-500">Minutes</div>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMin(m - 5)}
              className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              -
            </button>
            <div className="text-xl font-bold">{pad(m)}</div>
            <button
              type="button"
              onClick={() => setMin(m + 5)}
              className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">Selected: {value}</div>
    </div>
  );
}
