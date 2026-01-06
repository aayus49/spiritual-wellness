import React, { useMemo, useState } from "react";
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, isSameMonth, isSameDay, addDays } from "date-fns";

export default function CustomCalendar({ value, onChange }) {
  const [cursor, setCursor] = useState(value || new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });

    const out = [];
    let d = start;
    while (d <= end) {
      out.push(d);
      d = addDays(d, 1);
    }
    return out;
  }, [cursor]);

  const selected = value;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor(subMonths(cursor, 1))}
          className="px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200"
        >
          Prev
        </button>

        <div className="font-semibold text-gray-900">{format(cursor, "MMMM yyyy")}</div>

        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200"
        >
          Next
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 text-xs text-gray-500">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
          <div key={d} className="py-2 text-center">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(d => {
          const inMonth = isSameMonth(d, cursor);
          const isSelected = selected && isSameDay(d, selected);
          return (
            <button
              type="button"
              key={d.toISOString()}
              onClick={() => onChange(d)}
              className={[
                "h-10 rounded-xl text-sm transition",
                inMonth ? "text-gray-900" : "text-gray-400",
                isSelected ? "bg-purple-600 text-white" : "hover:bg-purple-50",
              ].join(" ")}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
