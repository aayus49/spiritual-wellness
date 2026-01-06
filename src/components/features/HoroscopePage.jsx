import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";

const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

function seededText(sign) {
  const today = format(new Date(), "yyyy-MM-dd");
  const seed = `${today}:${sign}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const msgs = [
    "Focus on one priority and finish it cleanly.",
    "A small conversation unlocks clarity.",
    "Keep your plans simple and consistent today.",
    "Choose calm over speed; it pays off.",
    "Say yes to what supports your long-term goals.",
  ];
  return msgs[h % msgs.length];
}

export default function HoroscopePage() {
  const { user } = useAuth();
  const { saveReading } = useUserData();
  const [sign, setSign] = useState("Aries");

  const content = useMemo(() => ({
    overall: seededText(sign),
    love: "Be direct and kind. Avoid assumptions.",
    career: "Momentum improves when you commit to a clear plan.",
    luckyNumber: (sign.length * 7) % 10 + 1,
    luckyColor: "Purple",
  }), [sign]);

  const save = () => {
    if (user.role === "guest") return;
    saveReading({ type: "horoscope", title: `Horoscope — ${sign}`, payload: { sign, date: format(new Date(), "PP"), content } });
  };

  return (
    <div className="bg-gray-50 min-h-[85vh] px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Daily Horoscope</h1>
        <p className="text-gray-600 mt-2">Consistent per sign per day (deterministic).</p>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {SIGNS.map(s => (
            <button key={s} onClick={() => setSign(s)}
              className={`py-2 rounded-xl border transition ${s === sign ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-700 border-gray-200 hover:bg-purple-50"}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm text-gray-500">Today</div>
              <div className="text-xl font-semibold text-gray-900">{sign}</div>
            </div>
            <button onClick={save} disabled={user.role === "guest"} className="px-5 py-3 rounded-xl border border-purple-200 text-purple-700 font-semibold disabled:opacity-50">
              Save
            </button>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <Section title="Overall" text={content.overall} />
            <Section title="Love" text={content.love} />
            <Section title="Career" text={content.career} />
            <div className="rounded-xl bg-purple-50 border border-purple-100 p-4">
              <div className="font-semibold text-gray-900">Lucky</div>
              <div className="mt-2 text-gray-700">Number: <span className="font-medium">{content.luckyNumber}</span></div>
              <div className="text-gray-700">Color: <span className="font-medium">{content.luckyColor}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, text }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="font-semibold text-gray-900">{title}</div>
      <div className="mt-2 text-gray-600">{text}</div>
    </div>
  );
}
