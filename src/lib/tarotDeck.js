const MAJOR_ARCANA = [
  {
    name: "The Fool",
    arcana: "major",
    img: "",
    upright: "New beginnings, curiosity, and a leap of faith.",
    reversed: "Hesitation, poor planning, or reckless choices.",
    keywords: ["beginnings", "trust", "risk"],
  },
  {
    name: "The Magician",
    arcana: "major",
    img: "",
    upright: "Focus, willpower, and turning ideas into reality.",
    reversed: "Misuse of skills, scattered energy, or delays.",
    keywords: ["focus", "action", "skill"],
  },
  {
    name: "The High Priestess",
    arcana: "major",
    img: "",
    upright: "Intuition, inner knowing, and quiet insight.",
    reversed: "Hidden motives, confusion, or ignoring intuition.",
    keywords: ["intuition", "mystery", "reflection"],
  },
  {
    name: "The Empress",
    arcana: "major",
    img: "",
    upright: "Nurturing, creativity, and abundance.",
    reversed: "Burnout, overgiving, or creative blocks.",
    keywords: ["growth", "care", "creativity"],
  },
  {
    name: "The Emperor",
    arcana: "major",
    img: "",
    upright: "Structure, stability, and leadership.",
    reversed: "Rigidity, control issues, or instability.",
    keywords: ["structure", "authority", "discipline"],
  },
  {
    name: "The Hierophant",
    arcana: "major",
    img: "",
    upright: "Tradition, learning, and shared values.",
    reversed: "Rebellion, breaking norms, or stale beliefs.",
    keywords: ["tradition", "teaching", "beliefs"],
  },
  {
    name: "The Lovers",
    arcana: "major",
    img: "",
    upright: "Alignment, choices, and meaningful connection.",
    reversed: "Disharmony, misalignment, or difficult choices.",
    keywords: ["choice", "union", "values"],
  },
  {
    name: "The Chariot",
    arcana: "major",
    img: "",
    upright: "Momentum, focus, and forward progress.",
    reversed: "Lack of direction or competing priorities.",
    keywords: ["drive", "progress", "control"],
  },
  {
    name: "Strength",
    arcana: "major",
    img: "",
    upright: "Courage, patience, and inner power.",
    reversed: "Self-doubt, impatience, or low confidence.",
    keywords: ["courage", "compassion", "resilience"],
  },
  {
    name: "The Hermit",
    arcana: "major",
    img: "",
    upright: "Solitude, reflection, and guidance within.",
    reversed: "Isolation or avoiding inner work.",
    keywords: ["reflection", "wisdom", "solitude"],
  },
  {
    name: "Wheel of Fortune",
    arcana: "major",
    img: "",
    upright: "Cycles, change, and turning points.",
    reversed: "Resistance to change or stalled momentum.",
    keywords: ["change", "cycles", "chance"],
  },
  {
    name: "Justice",
    arcana: "major",
    img: "",
    upright: "Clarity, fairness, and cause and effect.",
    reversed: "Bias, imbalance, or unclear outcomes.",
    keywords: ["truth", "balance", "accountability"],
  },
];

export function buildDeck() {
  return [...MAJOR_ARCANA];
}

export default buildDeck;
