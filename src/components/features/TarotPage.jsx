// src/components/features/TarotPage.jsx
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shuffle, Save } from "lucide-react";
import { TAROT_DECK } from "../../data/tarot/deck";
import Button from "../shared/Button";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";

const POSITIONS = ["Past", "Present", "Future"];

function pickCards(deck, count = 3) {
  const arr = [...deck].sort(() => Math.random() - 0.5).slice(0, count);
  return arr.map((c, i) => ({
    ...c,
    position: POSITIONS[i],
    reversed: Math.random() < 0.45,
  }));
}

function stableSummary(cards) {
  return cards.map((c) => `${c.position}: ${c.name}${c.reversed ? " (Reversed)" : ""}`).join(" • ");
}

function buildBetterDescription(cards) {
  const heading = "Your Past–Present–Future spread highlights the story behind your question.";
  const guide =
    "Use the Past to understand what shaped the situation, the Present to see the current energy, and the Future to spot likely momentum if you continue on the same path.";

  const perCard = cards
    .map((c) => {
      const tone = c.reversed
        ? "This energy is blocked, delayed, or working inward."
        : "This energy is active, available, and outward-facing.";
      const meaning = c.reversed ? c.reversedText : c.upright;
      const kws = (c.keywords || []).slice(0, 4);
      const kwLine = kws.length ? `Keywords: ${kws.join(", ")}.` : "";
      return `${c.position}: ${c.name}${c.reversed ? " (Reversed)" : ""}\n${tone} ${meaning}\n${kwLine}`.trim();
    })
    .join("\n\n");

  const closer =
    "Take one practical action that aligns with the Present card’s advice, and one boundary or adjustment inspired by the Past card. The Future card shows what strengthens when you do.";

  return [heading, guide, perCard, closer].join("\n\n");
}

function CardBack({ index, shuffling }) {
  return (
    <motion.div
      className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md shadow-xl aspect-[3/4]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
    >
      <motion.div
        className="absolute inset-0"
        animate={shuffling ? { backgroundPosition: ["0% 0%", "100% 100%"] } : { backgroundPosition: "0% 0%" }}
        transition={shuffling ? { duration: 0.55, repeat: 1 } : { duration: 0.2 }}
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(168,85,247,0.35), transparent 55%), radial-gradient(circle at 80% 30%, rgba(99,102,241,0.35), transparent 55%), radial-gradient(circle at 50% 80%, rgba(236,72,153,0.25), transparent 55%)",
          backgroundSize: "200% 200%",
        }}
      />
      <div className="relative h-full p-4 flex flex-col gap-3">
        <div className="flex-1 min-h-0 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-600/35 to-indigo-500/20 flex items-center justify-center">
          <div className="flex items-center gap-2 text-white/90">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wide">Tarot</span>
          </div>
        </div>
        <div className="h-3 w-24 rounded bg-white/10" />
        <div className="h-2.5 w-36 rounded bg-white/10" />
      </div>
    </motion.div>
  );
}

function TarotCard({ card, index, onFlip, flipped, shuffling }) {
  const [imageRatio, setImageRatio] = useState(null);
  const shuffleAnim = shuffling
    ? {
        x: [0, -10, 12, -8, 10, 0],
        y: [0, 6, -6, 5, -4, 0],
        rotate: [0, -2, 2, -1.5, 1.5, 0],
        scale: [1, 0.985, 1.01, 0.99, 1],
      }
    : { x: 0, y: 0, rotate: 0, scale: 1 };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
    >
      <motion.div animate={shuffleAnim} transition={{ duration: 0.6, ease: "easeInOut" }}>
        <motion.button type="button" onClick={onFlip} className="w-full text-left [perspective:1200px] focus:outline-none">
          <motion.div
            className="relative rounded-3xl"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.62, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ transformStyle: "preserve-3d", aspectRatio: flipped ? imageRatio || 3 / 4 : 3 / 4 }}
          >
            {/* FRONT (back design) */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md shadow-xl"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="h-full p-5 flex flex-col gap-4">
                <div className="flex-1 min-h-0 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-600/35 to-indigo-500/20 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white/90">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-semibold tracking-wide">Reveal</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/70 uppercase tracking-wider">{card.position}</div>
                  <div className="text-xs text-white/60">Click</div>
                </div>
              </div>
            </div>

            {/* BACK (actual card) */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 bg-white shadow-2xl"
              style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
            >
              <div className="p-5">
                <div className="text-xs text-gray-500 uppercase tracking-wider">{card.position}</div>
                <div className="mt-1 font-semibold text-gray-900 text-lg">{card.name}</div>

                {/* FIT: full card visible */}
                <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                  <div className="relative w-full aspect-[3/4]">
                    <img
                      src={card.img}
                      alt={card.name}
                      className={[
                        "w-full h-full object-contain bg-gray-50",
                        card.reversed ? "rotate-180" : "",
                      ].join(" ")}
                      loading="lazy"
                      onLoad={(event) => {
                        const { naturalWidth, naturalHeight } = event.currentTarget;
                        if (naturalWidth && naturalHeight) {
                          setImageRatio(naturalWidth / naturalHeight);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs inline-flex px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                    {card.reversed ? "Reversed" : "Upright"}
                  </span>

                  {!!card.keywords?.length && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {card.keywords.slice(0, 3).map((k) => (
                        <span key={k} className="text-[11px] px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 text-sm text-gray-700 leading-relaxed">
                  {card.reversed ? card.reversedText : card.upright}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function TarotPage() {
  const { user } = useAuth();
  const { saveReading } = useUserData();

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([false, false, false]);
  const [shuffling, setShuffling] = useState(false);
  const [saving, setSaving] = useState(false);

  // KEY: bump this to force a full re-render during shuffle (cards CHANGE)
  const [shuffleKey, setShuffleKey] = useState(0);

  const allRevealed = flipped.every(Boolean) && cards.length === 3;

  const summaryLine = useMemo(() => {
    if (cards.length !== 3) return "";
    return stableSummary(cards);
  }, [cards]);

  const description = useMemo(() => {
    if (cards.length !== 3) return "";
    return buildBetterDescription(cards);
  }, [cards]);

  function doShuffle(changeCards = true) {
    if (shuffling) return;

    // start shuffle animation
    setShuffling(true);

    // OPTIONAL: change the cards after a short delay
    if (changeCards) {
      setTimeout(() => {
        setCards(pickCards(TAROT_DECK, 3));
        setFlipped([false, false, false]); // shuffle resets reveal
        setShuffleKey((k) => k + 1); // force fresh render for motion
      }, 300);
    }

    setTimeout(() => setShuffling(false), 650);
  }

  function draw() {
    // draw is just "shuffle + change cards"
    doShuffle(true);
  }

  function flipCard(i) {
    setFlipped((prev) => prev.map((v, idx) => (idx === i ? true : v)));
  }

  function save() {
    if (user.role === "guest" || cards.length !== 3 || !allRevealed) return;

    setSaving(true);
    setTimeout(() => {
      saveReading({
        type: "tarot",
        title: "3-Card Tarot Reading",
        summary: summaryLine,
        payload: {
          spread: "3-card",
          cards: cards.map((c) => ({
            id: c.id,
            name: c.name,
            img: c.img,
            upright: c.upright,
            reversedText: c.reversedText,
            reversed: !!c.reversed,
            position: c.position,
            keywords: c.keywords || [],
          })),
          description,
        },
      });
      setSaving(false);
    }, 450);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tarot Reading</h1>
            <p className="mt-1 text-white/70 max-w-2xl">
              Shuffle to change the deck. Click each card to reveal it.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => doShuffle(true)} // SHUFFLE CHANGES CARDS
              disabled={shuffling}
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                <Shuffle className="w-4 h-4" />
                Shuffle
              </span>
            </Button>

            <Button variant="primary" onClick={draw} disabled={shuffling}>
              Draw Cards
            </Button>

            <Button
              variant="outline"
              onClick={save}
              loading={saving}
              disabled={user.role === "guest" || !allRevealed}
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save
              </span>
            </Button>
          </div>
        </div>

        {/* Cards */}
        <div key={shuffleKey} className="mt-10 grid md:grid-cols-3 gap-6">
          {cards.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => <CardBack key={i} index={i} shuffling={shuffling} />)
          ) : (
            cards.map((c, i) => (
              <TarotCard
                key={`${c.id}-${i}-${shuffleKey}`}
                card={c}
                index={i}
                flipped={flipped[i]}
                onFlip={() => flipCard(i)}
                shuffling={shuffling}
              />
            ))
          )}
        </div>

        {/* Description */}
        <AnimatePresence>
          {cards.length === 3 && (
            <motion.div
              className="mt-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-7 shadow-xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35 }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-sm font-semibold text-white">Reading Description</div>
                  <div className="mt-1 text-xs text-white/60">
                    Reveal all three cards to unlock the full interpretation.
                  </div>
                </div>
                {user.role === "guest" && (
                  <div className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/70">
                    Guest mode: saving disabled
                  </div>
                )}
              </div>

              {!allRevealed ? (
                <div className="mt-5 text-white/70 text-sm">
                  Click each card to reveal it. Your interpretation appears here.
                </div>
              ) : (
                <div className="mt-6 space-y-6">

  {/* SUMMARY STRIP */}
  <div className="rounded-2xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-white/10 px-5 py-4">
    <div className="text-xs uppercase tracking-wider text-purple-200">
      Reading Summary
    </div>
    <div className="mt-1 text-sm text-white font-medium">
      {summaryLine}
    </div>
  </div>

  {/* PER-CARD BREAKDOWN */}
  <div className="grid md:grid-cols-3 gap-4">
    {cards.map((card, i) => (
      <div
        key={card.id}
        className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-md"
      >
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-purple-300">
            {card.position}
          </div>
          <span className="text-[11px] px-2 py-1 rounded-full bg-white/10 border border-white/10 text-white/80">
            {card.reversed ? "Reversed" : "Upright"}
          </span>
        </div>

        <div className="mt-2 text-lg font-semibold text-white">
          {card.name}
        </div>

        <div className="mt-3 text-sm text-white/80 leading-relaxed">
          {card.reversed ? card.reversedText : card.upright}
        </div>

        {card.keywords?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {card.keywords.slice(0, 4).map((kw) => (
              <span
                key={kw}
                className="text-[11px] px-2 py-1 rounded-full bg-purple-500/10 text-purple-200 border border-purple-400/20"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>

  {/* GUIDANCE / CLOSING */}
  <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-md">
    <div className="text-sm font-semibold text-white">
      Guidance
    </div>

    <p className="mt-2 text-sm text-white/80 leading-relaxed">
      Take one practical action that aligns with the <span className="text-purple-300 font-medium">Present</span> card’s advice,
      and one boundary or adjustment inspired by the <span className="text-purple-300 font-medium">Past</span> card.
      The <span className="text-purple-300 font-medium">Future</span> card shows what strengthens when you do.
    </p>
  </div>

</div>

              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
