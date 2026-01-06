import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";

const MAJOR_ARCANA = [
  { name: "The Fool", upright: "New beginnings, spontaneity, faith.", reversed: "Recklessness, risk, poor judgment." },
  { name: "The Magician", upright: "Skill, manifestation, confidence.", reversed: "Manipulation, untapped potential." },
  { name: "The High Priestess", upright: "Intuition, inner wisdom, mystery.", reversed: "Hidden motives, confusion." },
  { name: "The Empress", upright: "Nurturing, abundance, creativity.", reversed: "Dependence, neglect, blockages." },
  { name: "The Emperor", upright: "Structure, authority, stability.", reversed: "Rigidity, control issues." },
  { name: "The Hierophant", upright: "Tradition, guidance, learning.", reversed: "Rebellion, poor advice." },
  { name: "The Lovers", upright: "Alignment, choices, connection.", reversed: "Disharmony, imbalance." },
  { name: "The Chariot", upright: "Willpower, victory, focus.", reversed: "Lack of control, aggression." },
  { name: "Strength", upright: "Courage, compassion, resilience.", reversed: "Self-doubt, weakness." },
  { name: "The Hermit", upright: "Reflection, solitude, insight.", reversed: "Isolation, withdrawal." },
  { name: "Wheel of Fortune", upright: "Change, cycles, opportunity.", reversed: "Bad timing, resistance." },
  { name: "Justice", upright: "Truth, balance, accountability.", reversed: "Unfairness, denial." },
  { name: "The Hanged Man", upright: "Perspective, surrender, pause.", reversed: "Stalling, indecision." },
  { name: "Death", upright: "Transformation, endings, renewal.", reversed: "Resistance to change." },
  { name: "Temperance", upright: "Harmony, patience, moderation.", reversed: "Extremes, imbalance." },
  { name: "The Devil", upright: "Attachments, desire, material pull.", reversed: "Release, freedom." },
  { name: "The Tower", upright: "Sudden change, awakening.", reversed: "Avoidance, fear of change." },
  { name: "The Star", upright: "Hope, healing, inspiration.", reversed: "Discouragement, doubt." },
  { name: "The Moon", upright: "Illusion, intuition, uncertainty.", reversed: "Clarity, releasing fear." },
  { name: "The Sun", upright: "Joy, success, vitality.", reversed: "Delay, low energy." },
  { name: "Judgement", upright: "Rebirth, reckoning, calling.", reversed: "Self-doubt, avoidance." },
  { name: "The World", upright: "Completion, wholeness, mastery.", reversed: "Incomplete closure." },
];

function pick3(deck) {
  const copy = [...deck];
  const out = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    const card = copy.splice(idx, 1)[0];
    out.push({ ...card, reversed: Math.random() < 0.5 });
  }
  return out;
}

export default function TarotPage() {
  const { user } = useAuth();
  const { saveReading } = useUserData();
  const [cards, setCards] = useState([]);
  const [savedMsg, setSavedMsg] = useState("");


  const positions = useMemo(() => ["Past", "Present", "Future"], []);

  const draw = () => setCards(pick3(MAJOR_ARCANA));

  const save = () => {
    if (user.role === "guest") return;
    const summary = cards
        .map((c, i) => `${positions[i]}: ${c.name}${c.reversed ? " (R)" : ""}`)
        .join(" • ");

    saveReading({
    type: "tarot",
    title: "3-Card Tarot Reading",
    summary,
    payload: { cards, positions },
    });

  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-purple-950 via-indigo-950 to-black text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold">Tarot Reading</h1>
        <p className="text-purple-200 mt-2">Draw 3 cards for Past, Present, Future.</p>

        <div className="mt-8 flex gap-3">
          <button onClick={draw} className="px-5 py-3 rounded-xl bg-white text-purple-800 font-semibold">Draw Cards</button>
          <button onClick={() => {
    save();
    setSavedMsg("Saved to your dashboard");
    setTimeout(() => setSavedMsg(""), 1800);
  }}
  disabled={user.role === "guest" || cards.length === 0}
  className={[
    "px-5 py-3 rounded-xl font-semibold transition active:scale-[0.99]",
    user.role === "guest" || cards.length === 0
      ? "border border-white/20 text-white/50 cursor-not-allowed"
      : "border border-white/30 text-white hover:bg-white/10 hover:border-white/50 cursor-pointer",
  ].join(" ")}
>
  Save Reading
</button>

        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {positions.map((pos, i) => (
            <Card key={pos} pos={pos} card={cards[i]} />
          ))}
        </div>
          {savedMsg && (
  <div className="mt-3 text-sm text-green-200">
    {savedMsg}
  </div>
)}

        {cards.length > 0 && (
          <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold">Interpretation</h2>
            <div className="mt-4 space-y-4 text-purple-100">
              {cards.map((c, i) => (
                <div key={c.name} className="border-b border-white/10 pb-4 last:border-0">
                  <div className="font-semibold text-white">{positions[i]} — {c.name} {c.reversed ? "(Reversed)" : "(Upright)"}</div>
                  <div className="mt-1">{c.reversed ? c.reversed : c.upright}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ pos, card }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
      <div className="text-sm text-purple-200">{pos}</div>
      <div className="mt-3 h-56 rounded-xl bg-gradient-to-br from-purple-700/40 to-indigo-700/30 border border-white/10 flex items-center justify-center">
        {card ? (
          <div className="text-center px-4">
            <div className="text-xl font-semibold">{card.name}</div>
            <div className="text-sm text-purple-200 mt-2">{card.reversed ? "Reversed" : "Upright"}</div>
          </div>
        ) : (
          <div className="text-purple-200">Face-down card</div>
        )}
      </div>
    </div>
  );
}
