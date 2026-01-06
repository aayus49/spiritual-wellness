import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";
import { buildDeck } from "../../lib/tarotDeck";

const SPREADS = [
  { key: "single", label: "Single Card", count: 1, positions: ["Insight"] },
  { key: "three", label: "3-Card (Past/Present/Future)", count: 3, positions: ["Past", "Present", "Future"] },
];

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

function seedRand(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleDeterministic(arr, seed) {
  const r = seedRand(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function todaySeed() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function CardBack() {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-purple-700 via-indigo-800 to-black relative">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-purple-500/30 blur-2xl" />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full bg-indigo-500/25 blur-2xl" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-full border border-white/20 w-24 h-24 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white/15" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 right-3 text-[10px] text-white/60 tracking-widest text-center">
        WELLNESS CO TAROT
      </div>
    </div>
  );
}

function TarotCard({ card, flipped, reversed, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-[170px] h-[280px] md:w-[190px] md:h-[310px] rounded-2xl"
      style={{ perspective: 1200 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55 }}
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="w-full h-full rounded-2xl shadow-xl"
          >
            <CardBack />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-purple-300/40 transition" />
          </motion.div>
        </div>

        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="w-full h-full rounded-2xl shadow-xl overflow-hidden border border-white/10 bg-white"
          >
            <div className="relative w-full h-full bg-white">
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/15 pointer-events-none" />
              <img
                src={card.img}
                alt={card.name}
                className={[
                  "w-full h-full object-cover",
                  reversed ? "rotate-180" : "",
                ].join(" ")}
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur">
                <div className="text-sm font-semibold text-gray-900 leading-tight">{card.name}</div>
                <div className="mt-1 text-[11px] text-gray-600">
                  {reversed ? "Reversed" : "Upright"} • {card.arcana === "major" ? "Major Arcana" : card.suit}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* click feedback overlay */}
      <span className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-active:ring-purple-300/60 transition pointer-events-none" />
    </button>
  );
}

export default function TarotPage() {
  const { user } = useAuth();
  const { saveReading } = useUserData();

  const deck = useMemo(() => buildDeck(), []);
  const [spreadKey, setSpreadKey] = useState("three");
  const spread = useMemo(() => SPREADS.find(s => s.key === spreadKey) || SPREADS[1], [spreadKey]);

  const [seed, setSeed] = useState(() => `tarot|${todaySeed()}|init`);
  const [drawn, setDrawn] = useState([]); // { card, flipped, reversed }

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const ready = drawn.length === spread.count;
  const allFlipped = ready && drawn.every(x => x.flipped);

  function shuffleNew() {
    setMsg("");
    setSeed(`tarot|${todaySeed()}|${Date.now()}`);
    setDrawn([]);
  }

  function ensureSlots() {
    if (drawn.length === spread.count) return;
    const shuffled = shuffleDeterministic(deck, seed);
    const selected = shuffled.slice(0, spread.count).map((card, idx) => {
      // reversed chosen deterministically
      const r = shuffleDeterministic([0, 1, 2, 3, 4, 5], `${seed}|rev|${idx}`)[0];
      return { card, flipped: false, reversed: r % 2 === 1 };
    });
    setDrawn(selected);
  }

  function flipIndex(i) {
    setMsg("");
    setDrawn(prev => prev.map((x, idx) => (idx === i ? { ...x, flipped: true } : x)));
  }

  function save() {
    if (!allFlipped) return;
    if (user.role === "guest") return;

    setSaving(true);
    try {
      const now = new Date();
      const positions = spread.positions;
      const cardsPayload = drawn.map((x, i) => ({
        name: x.card.name,
        img: x.card.img,
        arcana: x.card.arcana,
        suit: x.card.suit || null,
        reversed: x.reversed,
        upright: x.card.upright,
        reversedText: x.card.reversed,
        keywords: x.card.keywords || [],
        position: positions[i] || `Card ${i + 1}`,
      }));

      const summary = cardsPayload
        .map(c => `${c.position}: ${c.name}${c.reversed ? " (R)" : ""}`)
        .join(" • ");

      saveReading({
        type: "tarot",
        title: `${spread.count}-Card Tarot Reading`,
        summary,
        payload: {
          spreadKey: spread.key,
          spreadLabel: spread.label,
          positions,
          createdAtISO: now.toISOString(),
          cards: cardsPayload,
        },
      });

      setMsg("Saved to your dashboard");
      setTimeout(() => setMsg(""), 1600);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-black text-white relative overflow-hidden">
      {/* ambient background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      {/* star field */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.25 }}>
        <StarField />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold">Tarot Reading</h1>
          <p className="text-white/70 mt-1">Choose a spread, focus your question, then reveal your cards.</p>
        </motion.div>

        <div className="mt-6 flex gap-2 flex-wrap">
          {SPREADS.map(s => (
            <button
              key={s.key}
              onClick={() => {
                setSpreadKey(s.key);
                setDrawn([]);
                setMsg("");
              }}
              className={[
                "px-4 py-2 rounded-xl text-sm font-semibold transition",
                "active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-purple-300/30",
                s.key === spreadKey
                  ? "bg-white/10 border border-white/15"
                  : "bg-white/5 border border-white/10 hover:bg-white/10",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-8 flex gap-3 flex-wrap">
          <Button
            type="button"
            onClick={() => {
              ensureSlots();
            }}
            className="bg-white/10 border border-white/15 hover:bg-white/15"
          >
            Draw Cards
          </Button>

          <Button
            type="button"
            onClick={shuffleNew}
            className="bg-white/5 border border-white/10 hover:bg-white/10"
          >
            Shuffle
          </Button>

          <Button
            type="button"
            onClick={save}
            disabled={user.role === "guest" || !allFlipped || saving}
            className={
              user.role === "guest"
                ? "bg-white/5 border border-white/10 text-white/40"
                : "bg-gradient-to-r from-purple-600 to-purple-400 text-white hover:opacity-95"
            }
          >
            {saving ? "Saving…" : "Save Reading"}
          </Button>

          {user.role === "guest" && (
            <div className="text-sm text-white/60 flex items-center">
              Login to save readings.
            </div>
          )}
          {msg && <div className="text-sm text-green-300">{msg}</div>}
        </div>

        <div className="mt-10 flex flex-wrap gap-6 items-start">
          {Array.from({ length: spread.count }).map((_, i) => {
            const slot = drawn[i];
            const flipped = !!slot?.flipped;
            const reversed = !!slot?.reversed;

            return (
              <div key={i} className="flex flex-col items-center">
                <TarotCard
                  card={slot?.card || { name: "Tarot", img: "" }}
                  flipped={flipped}
                  reversed={reversed}
                  onClick={() => {
                    if (!slot) {
                      ensureSlots();
                      return;
                    }
                    if (!slot.flipped) flipIndex(i);
                  }}
                />
                <div className="mt-3 text-sm text-white/70">
                  {spread.positions[i]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interpretation */}
        {ready && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6"
          >
            <div className="text-lg font-semibold">Interpretation</div>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              {drawn.map((x, i) => {
                const p = spread.positions[i];
                const text = x.reversed ? x.card.reversed : x.card.upright;
                return (
                  <div key={i} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm text-white/60">{p}</div>
                    <div className="mt-1 font-semibold">{x.card.name}</div>
                    <div className="mt-2 text-xs inline-flex px-2 py-1 rounded-full bg-white/10 border border-white/10">
                      {x.reversed ? "Reversed" : "Upright"}
                    </div>
                    <div className="mt-3 text-sm text-white/80 leading-relaxed">{text}</div>

                    {!!x.card.keywords?.length && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {x.card.keywords.slice(0, 3).map(k => (
                          <span key={k} className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 text-sm text-white/60">
              Tip: click any face-down card to draw; click again to reveal.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StarField() {
  // simple CSS star field using many tiny gradients
  // deterministic enough and cheap
  const dots = Array.from({ length: 80 }).map((_, i) => {
    const x = (i * 37) % 100;
    const y = (i * 53) % 100;
    const s = (i % 3) + 1;
    const o = (i % 5) / 10 + 0.2;
    return { x, y, s, o };
  });

  return (
    <div className="absolute inset-0">
      {dots.map((d, idx) => (
        <span
          key={idx}
          className="absolute rounded-full bg-white"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${d.s}px`,
            height: `${d.s}px`,
            opacity: d.o,
            boxShadow: "0 0 10px rgba(255,255,255,0.25)",
          }}
        />
      ))}
    </div>
  );
}
