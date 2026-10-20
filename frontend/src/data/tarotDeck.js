const majorCards = [
  ["The Fool", "00_Fool.jpg", "New beginnings, curiosity and taking a thoughtful first step."],
  ["The Magician", "01_Magician.jpg", "Resourcefulness, skill and turning ideas into action."],
  ["The High Priestess", "02_High_Priestess.jpg", "Intuition, patience and inner reflection."],
  ["The Empress", "03_Empress.jpg", "Creativity, nurturing and abundance."],
  ["The Emperor", "04_Emperor.jpg", "Structure, stability and responsibility."],
  ["The Hierophant", "05_Hierophant.jpg", "Learning, tradition and shared wisdom."],
  ["The Lovers", "06_Lovers.jpg", "Connection, values and meaningful choices."],
  ["The Chariot", "07_Chariot.jpg", "Determination, direction and self-control."],
  ["Strength", "08_Strength.jpg", "Gentle courage, patience and resilience."],
  ["The Hermit", "09_Hermit.jpg", "Solitude, wisdom and thoughtful inquiry."],
  ["Wheel of Fortune", "10_Wheel_of_Fortune.jpg", "Cycles, change and adaptability."],
  ["Justice", "11_Justice.jpg", "Fairness, accountability and clear judgement."],
  ["The Hanged Man", "12_Hanged_Man.jpg", "Pause, surrender and a different perspective."],
  ["Death", "13_Death.jpg", "Transformation, endings and new beginnings."],
  ["Temperance", "14_Temperance.jpg", "Balance, moderation and harmony."],
  ["The Devil", "15_Devil.jpg", "Attachments, temptation and limiting patterns."],
  ["The Tower", "16_Tower.jpg", "Sudden change and rebuilding foundations."],
  ["The Star", "17_Star.jpg", "Hope, renewal and inspiration."],
  ["The Moon", "18_Moon.jpg", "Uncertainty, dreams and intuition."],
  ["The Sun", "19_Sun.jpg", "Joy, confidence and positivity."],
  ["Judgement", "20_Judgement.jpg", "Reflection, awakening and renewal."],
  ["The World", "21_World.jpg", "Completion, achievement and fulfilment."]
];

const suits = [
  {
    name: "Wands",
    prefix: "Wands",
    theme: "creativity, ambition and purposeful action"
  },
  {
    name: "Cups",
    prefix: "Cups",
    theme: "emotions, relationships and intuition"
  },
  {
    name: "Swords",
    prefix: "Swords",
    theme: "thoughts, communication and decisions"
  },
  {
    name: "Pentacles",
    prefix: "Pents",
    theme: "work, resources and practical matters"
  }
];

const ranks = [
  "Ace", "Two", "Three", "Four", "Five", "Six", "Seven",
  "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"
];

const majorDeck = majorCards.map(([name, filename], index) => ({
  id: `major-${index}`,
  name,
  arcana: "Major Arcana",
  image: `/tarot-real/${filename}`,
  meaning: majorCards[index][2]
}));

const minorDeck = suits.flatMap((suit) =>
  ranks.map((rank, index) => {
    const number = String(index + 1).padStart(2, "0");
    const name = `${rank} of ${suit.name}`;

    return {
      id: `${rank.toLowerCase()}-of-${suit.name.toLowerCase()}`,
      name,
      arcana: "Minor Arcana",
      image: `/tarot-real/${suit.prefix}${number}.jpg`,
      meaning: `${name} traditionally relates to ${suit.theme}. Reflect on how this theme connects with your present situation and choices.`
    };
  })
);

export const tarotDeck = [...majorDeck, ...minorDeck];