const IMG = "https://www.sacred-texts.com/tarot/pkt/img";

export const TAROT_SPREADS = [
  {
    id: "single",
    name: "Single",
    description: "Two cards for a focused question and a note of advice.",
    cardCount: 2,
    positions: ["Your Focus", "Advice"],
  },
  {
    id: "three",
    name: "Three Card",
    description: "Past • Present • Future",
    cardCount: 3,
    positions: ["Past", "Present", "Future"],
  },
  {
    id: "relationship",
    name: "Relationship",
    description: "You, the other person, and the connection between you.",
    cardCount: 3,
    positions: ["You", "The Other", "The Connection"],
  },
  {
    id: "career",
    name: "Career",
    description: "Current path, challenge, and likely outcome.",
    cardCount: 3,
    positions: ["Current Path", "Challenge", "Outcome"],
  },
  {
    id: "celtic",
    name: "Celtic Cross",
    description: "A condensed five-card cross for a deeper situation reading.",
    cardCount: 5,
    positions: ["Present", "Challenge", "Past", "Future", "Outcome"],
  },
  {
    id: "lifepath",
    name: "Life Path",
    description: "A broader look at direction, influence, and next steps.",
    cardCount: 5,
    positions: ["Foundation", "Present Influence", "Hidden Factor", "Guidance", "Direction"],
  },
];

export const FALLBACK_TAROT_DECK = [
  { id: "ar00", name: "The Fool", image: `${IMG}/ar00.jpg`, meaning: "New beginnings, spontaneity, a leap of faith.", meaningReversed: "Hesitation, recklessness, or fear of the unknown." },
  { id: "ar01", name: "The Magician", image: `${IMG}/ar01.jpg`, meaning: "Resourcefulness, willpower, manifestation.", meaningReversed: "Scattered energy, trickery, or unused potential." },
  { id: "ar02", name: "The High Priestess", image: `${IMG}/ar02.jpg`, meaning: "Intuition, mystery, inner knowledge.", meaningReversed: "Secrets withheld, ignored instincts, or surface-level answers." },
  { id: "ar03", name: "The Empress", image: `${IMG}/ar03.jpg`, meaning: "Abundance, nurturing, creativity.", meaningReversed: "Creative block, overgiving, or neglect of self-care." },
  { id: "ar04", name: "The Emperor", image: `${IMG}/ar04.jpg`, meaning: "Structure, authority, stability.", meaningReversed: "Rigidity, control issues, or lack of healthy boundaries." },
  { id: "ar05", name: "The Hierophant", image: `${IMG}/ar05.jpg`, meaning: "Tradition, guidance, shared belief.", meaningReversed: "Questioning doctrine, unconventional paths, or empty ritual." },
  { id: "ar06", name: "The Lovers", image: `${IMG}/ar06.jpg`, meaning: "Connection, choice, alignment of values.", meaningReversed: "Misalignment, indecision, or a values conflict." },
  { id: "ar07", name: "The Chariot", image: `${IMG}/ar07.jpg`, meaning: "Determination, willpower, forward motion.", meaningReversed: "Loss of direction, conflicting drives, or stalled progress." },
  { id: "ar08", name: "Strength", image: `${IMG}/ar08.jpg`, meaning: "Courage, patience, quiet resolve.", meaningReversed: "Self-doubt, force without compassion, or depleted will." },
  { id: "ar09", name: "The Hermit", image: `${IMG}/ar09.jpg`, meaning: "Introspection, solitude, inner guidance.", meaningReversed: "Isolation, withdrawal from needed counsel, or avoiding stillness." },
  { id: "ar10", name: "Wheel of Fortune", image: `${IMG}/ar10.jpg`, meaning: "Cycles, change, turning points.", meaningReversed: "Resistance to change, a stuck cycle, or poor timing." },
  { id: "ar11", name: "Justice", image: `${IMG}/ar11.jpg`, meaning: "Fairness, truth, cause and effect.", meaningReversed: "Bias, avoided accountability, or delayed consequences." },
  { id: "ar12", name: "The Hanged Man", image: `${IMG}/ar12.jpg`, meaning: "Pause, surrender, new perspective.", meaningReversed: "Stalling, martyrdom, or refusing a needed shift in view." },
  { id: "ar13", name: "Death", image: `${IMG}/ar13.jpg`, meaning: "Transformation, endings that make room for renewal.", meaningReversed: "Clinging to the old, stalled transition, or fear of release." },
  { id: "ar14", name: "Temperance", image: `${IMG}/ar14.jpg`, meaning: "Balance, patience, gradual integration.", meaningReversed: "Excess, impatience, or mixing energies that do not belong together." },
  { id: "ar15", name: "The Devil", image: `${IMG}/ar15.jpg`, meaning: "Attachment, restriction, facing what binds you.", meaningReversed: "Breaking a pattern, reclaiming agency, or seeing a bondage clearly." },
  { id: "ar16", name: "The Tower", image: `${IMG}/ar16.jpg`, meaning: "Sudden change, revelation, breaking down the old.", meaningReversed: "Delayed upheaval, denial of a crack in the foundation." },
  { id: "ar17", name: "The Star", image: `${IMG}/ar17.jpg`, meaning: "Hope, renewal, inspiration.", meaningReversed: "Discouragement, lost faith, or inspiration that needs grounding." },
  { id: "ar18", name: "The Moon", image: `${IMG}/ar18.jpg`, meaning: "Uncertainty, subconscious, illusion.", meaningReversed: "Clarity emerging, anxiety easing, or a deception coming to light." },
  { id: "ar19", name: "The Sun", image: `${IMG}/ar19.jpg`, meaning: "Joy, vitality, clarity.", meaningReversed: "Temporary cloud cover, overconfidence, or joy postponed." },
  { id: "ar20", name: "Judgement", image: `${IMG}/ar20.jpg`, meaning: "Reflection, reckoning, a turning point of awareness.", meaningReversed: "Self-criticism, ignored calling, or refusing to review the past." },
  { id: "ar21", name: "The World", image: `${IMG}/ar21.jpg`, meaning: "Completion, wholeness, fulfillment.", meaningReversed: "Loose ends, delayed closure, or a cycle not quite finished.", arcana: "major" },
];

const SUITS = [
  { key: "wands", prefix: "wa", label: "Wands", theme: "energy, will, and action" },
  { key: "cups", prefix: "cu", label: "Cups", theme: "feeling, relationship, and intuition" },
  { key: "swords", prefix: "sw", label: "Swords", theme: "thought, conflict, and truth" },
  { key: "pentacles", prefix: "pe", label: "Pentacles", theme: "work, body, and material life" },
];

const RANKS = [
  { code: "ac", name: "Ace", meaning: "A new beginning in this suit.", meaningReversed: "A delayed or blocked beginning." },
  { code: "02", name: "Two", meaning: "A choice or partnership taking shape.", meaningReversed: "Indecision or a stalemate." },
  { code: "03", name: "Three", meaning: "Growth through collaboration or expression.", meaningReversed: "Scattered effort or a plan delayed." },
  { code: "04", name: "Four", meaning: "Stability, pause, or conservation.", meaningReversed: "Restlessness or clinging too tightly." },
  { code: "05", name: "Five", meaning: "Strain, conflict, or a necessary loss.", meaningReversed: "Recovery after conflict, or lingering tension." },
  { code: "06", name: "Six", meaning: "Movement, exchange, or a turning toward balance.", meaningReversed: "Uneven giving, or progress that stalls." },
  { code: "07", name: "Seven", meaning: "Assessment, strategy, or standing ground.", meaningReversed: "Doubt, wasted effort, or giving up too soon." },
  { code: "08", name: "Eight", meaning: "Skill, momentum, or committed work.", meaningReversed: "Drudgery, impatience, or unused talent." },
  { code: "09", name: "Nine", meaning: "Nearing completion; a test of endurance.", meaningReversed: "Fatigue, isolation, or overprotection." },
  { code: "10", name: "Ten", meaning: "Culmination — the suit's theme at full volume.", meaningReversed: "Burden, excess, or an ending that needs release." },
  { code: "pa", name: "Page", meaning: "A message, student energy, or a first step.", meaningReversed: "Gossip, immaturity, or a missed message." },
  { code: "kn", name: "Knight", meaning: "Pursuit — this suit in motion.", meaningReversed: "Recklessness, delay, or mixed motives." },
  { code: "qu", name: "Queen", meaning: "Mastery of the inner side of this suit.", meaningReversed: "Smothering care, insecurity, or withheld support." },
  { code: "ki", name: "King", meaning: "Mastery of the outer side of this suit.", meaningReversed: "Domineering use of this energy, or a hollow authority." },
];

const MINOR_CARDS = SUITS.flatMap((suit) =>
  RANKS.map((rank) => ({
    id: `${suit.prefix}${rank.code}`,
    name: `${rank.name} of ${suit.label}`,
    image: `${IMG}/${suit.prefix}${rank.code}.jpg`,
    meaning: `${rank.meaning} Theme: ${suit.theme}.`,
    meaningReversed: rank.meaningReversed,
    arcana: "minor",
    suit: suit.key,
  }))
);

FALLBACK_TAROT_DECK.push(...MINOR_CARDS);

export function groupTarotDeck(deck) {
  const groups = [
    { id: "major", title: "Major Arcana", cards: [] },
    { id: "wands", title: "Wands", cards: [] },
    { id: "cups", title: "Cups", cards: [] },
    { id: "swords", title: "Swords", cards: [] },
    { id: "pentacles", title: "Pentacles", cards: [] },
  ];

  deck.forEach((card) => {
    const suit = String(card.suit || "").toLowerCase();
    const arcana = String(card.arcana || "").toLowerCase();
    const name = String(card.name || "").toLowerCase();

    if (arcana.includes("major") || (!suit && !name.includes(" of "))) {
      groups[0].cards.push(card);
      return;
    }
    if (suit.includes("wand") || name.includes("wand") || name.includes("rod")) groups[1].cards.push(card);
    else if (suit.includes("cup") || name.includes("cup")) groups[2].cards.push(card);
    else if (suit.includes("sword") || name.includes("sword")) groups[3].cards.push(card);
    else if (suit.includes("pentacl") || suit.includes("coin") || name.includes("pentacl") || name.includes("coin")) {
      groups[4].cards.push(card);
    } else {
      groups[0].cards.push(card);
    }
  });

  return groups.filter((g) => g.cards.length > 0);
}
