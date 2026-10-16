const major = [
  ["The Fool","Major Arcana","New beginnings, freedom and an open-minded step into the unknown.","Approach a new chapter with curiosity, but keep your footing."],
  ["The Magician","Major Arcana","Initiative, resourcefulness and turning potential into action.","Your tools are available; focused action matters more than waiting."],
  ["The High Priestess","Major Arcana","Intuition, hidden knowledge and inner reflection.","Listen carefully to what you already know beneath the noise."],
  ["The Empress","Major Arcana","Creativity, nurture, abundance and growth.","Something can flourish when given patience and consistent care."],
  ["The Emperor","Major Arcana","Structure, authority, boundaries and responsibility.","Clear structure can turn uncertainty into a workable plan."],
  ["The Hierophant","Major Arcana","Tradition, learning, mentorship and shared values.","Guidance from an established framework may clarify your next step."],
  ["The Lovers","Major Arcana","Values, connection and meaningful choices.","A choice becomes clearer when it aligns with your core values."],
  ["The Chariot","Major Arcana","Determination, direction and disciplined movement.","Momentum comes from choosing a direction and staying deliberate."],
  ["Strength","Major Arcana","Courage, compassion, patience and inner resilience.","Quiet consistency can be more powerful than force."],
  ["The Hermit","Major Arcana","Solitude, reflection and seeking inner wisdom.","Step back briefly to distinguish your own voice from outside pressure."],
  ["Wheel of Fortune","Major Arcana","Cycles, change and shifting circumstances.","A changing cycle may open a different route than the one expected."],
  ["Justice","Major Arcana","Balance, accountability and clear decisions.","Look at facts and consequences before making a final call."],
  ["The Hanged Man","Major Arcana","Pause, surrender and seeing a situation differently.","A change in perspective may reveal what rushing would miss."],
  ["Death","Major Arcana","Transformation, endings and renewal.","An old pattern may need to end before a new one can take shape."],
  ["Temperance","Major Arcana","Balance, integration and moderation.","Progress is supported by combining different strengths rather than choosing extremes."],
  ["The Devil","Major Arcana","Attachments, patterns and confronting limitations.","Notice what has become a habit or obligation rather than a choice."],
  ["The Tower","Major Arcana","Disruption, revelation and restructuring.","Unexpected change can expose a foundation that needs rebuilding."],
  ["The Star","Major Arcana","Hope, healing, inspiration and renewed direction.","A clearer sense of hope can return after a difficult period."],
  ["The Moon","Major Arcana","Uncertainty, imagination and the subconscious.","Do not mistake anxiety or assumptions for confirmed information."],
  ["The Sun","Major Arcana","Clarity, vitality, confidence and openness.","A period of greater clarity can make progress feel more visible."],
  ["Judgement","Major Arcana","Reflection, awakening and answering a call to change.","Past experience can become useful when it informs a conscious decision."],
  ["The World","Major Arcana","Completion, integration and a wider perspective.","A cycle can reach a satisfying conclusion and create room for the next one."],
];

const suits = {
  Wands: [
    ["Ace","initiative and creative spark"],["Two","planning and future direction"],["Three","expansion and looking ahead"],["Four","stability and celebration"],["Five","competition and friction"],["Six","recognition and progress"],["Seven","persistence and boundaries"],["Eight","swift movement and messages"],["Nine","resilience and preparation"],["Ten","responsibility and burden"],["Page","curiosity and energetic beginnings"],["Knight","bold action and momentum"],["Queen","confidence and creative leadership"],["King","vision and decisive leadership"]
  ],
  Cups: [
    ["Ace","emotional renewal and openness"],["Two","connection and mutual understanding"],["Three","community and shared joy"],["Four","reconsideration and emotional withdrawal"],["Five","grief and focusing on loss"],["Six","memory and familiar comfort"],["Seven","choices and imagination"],["Eight","leaving what no longer fulfills you"],["Nine","contentment and wishes"],["Ten","emotional harmony and belonging"],["Page","emotional curiosity and a message"],["Knight","romantic idealism and invitation"],["Queen","empathy and emotional depth"],["King","emotional maturity and composure"]
  ],
  Swords: [
    ["Ace","clarity and a decisive idea"],["Two","indecision and competing perspectives"],["Three","heartache and difficult truth"],["Four","rest and recovery"],["Five","conflict and complicated victory"],["Six","transition and moving forward"],["Seven","strategy and discretion"],["Eight","mental restriction and uncertainty"],["Nine","worry and overthinking"],["Ten","an ending and release"],["Page","curiosity and information"],["Knight","swift ideas and direct action"],["Queen","discernment and honest boundaries"],["King","logic and strategic authority"]
  ],
  Pentacles: [
    ["Ace","material opportunity and practical beginnings"],["Two","balance and managing priorities"],["Three","skill and collaboration"],["Four","security and holding tightly"],["Five","scarcity and asking for support"],["Six","generosity and reciprocal exchange"],["Seven","patience and assessing progress"],["Eight","practice and craftsmanship"],["Nine","independence and earned comfort"],["Ten","long-term stability and legacy"],["Page","learning and practical opportunity"],["Knight","reliability and steady progress"],["Queen","grounded care and resourcefulness"],["King","material wisdom and responsible leadership"]
  ],
};

export const tarotCards = [
  ...major.map((c, i) => ({ id: `m${i}`, name: c[0], group: c[1], meaning: c[2], future: c[3], symbol: "✦" })),
  ...Object.entries(suits).flatMap(([suit, ranks], si) =>
    ranks.map(([rank, meaning], i) => ({
      id: `${suit.toLowerCase()}-${i}`,
      name: `${rank} of ${suit}`,
      group: suit,
      meaning: meaning[0].toUpperCase() + meaning.slice(1) + ".",
      future: `The coming phase may highlight ${meaning}. Let the theme inform your choices without treating it as a fixed outcome.`,
      symbol: ["Wands","Cups","Swords","Pentacles"][si] === "Cups" ? "♡" : ["Wands","Cups","Swords","Pentacles"][si] === "Pentacles" ? "◇" : ["Wands","Cups","Swords","Pentacles"][si] === "Swords" ? "⚔" : "♣",
    }))
  ),
];