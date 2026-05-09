// Test file for leitner.js

// Polyfill for testing without Vite
// Actually, since package.json is commonjs, importing a .js file with 'export' will fail in raw node.
// We will test the logic by copying it here temporarily for the console test run,
// then we can delete this file or leave it for reference.

const evaluateCard = (card, result, masteryThreshold) => {
  const currentScore = card.mastery || 0;
  let newScore;

  if (result === 'incorrect') {
    newScore = 0;
  } else if (result === 'somewhat') {
    newScore = Math.max(0, currentScore - 1);
  } else if (result === 'correct') {
    newScore = currentScore + 1;
  }

  return { ...card, mastery: newScore };
};

const distributeCards = (cards, masteryThreshold) => {
  const boxes = Array.from({ length: masteryThreshold }, () => []);
  const mastered = [];

  cards.forEach(card => {
    const score = card.mastery || 0;
    if (score >= masteryThreshold) {
      mastered.push(card);
    } else {
      boxes[score].push(card);
    }
  });

  return { boxes, mastered };
};

const drawNextCard = (boxes, aggressionLevel) => {
  let weights = [];
  if (aggressionLevel === 'aggressive') {
    weights = boxes.map((_, i) => Math.pow(0.2, i)); 
  } else if (aggressionLevel === 'normal') {
    weights = boxes.map((_, i) => Math.pow(0.5, i)); 
  } else {
    weights = boxes.map((_, i) => Math.pow(0.8, i)); 
  }
  
  const validWeights = weights.map((w, i) => boxes[i].length > 0 ? w : 0);
  const totalWeight = validWeights.reduce((sum, w) => sum + w, 0);
  
  if (totalWeight === 0) return null;
  
  let random = Math.random() * totalWeight;
  let selectedBoxIndex = 0;
  
  for (let i = 0; i < validWeights.length; i++) {
    random -= validWeights[i];
    if (random <= 0) {
      selectedBoxIndex = i;
      break;
    }
  }
  
  const box = boxes[selectedBoxIndex];
  const cardIndex = Math.floor(Math.random() * box.length);
  return box[cardIndex];
};

console.log("--- Running Leitner Tests ---");

// Test 1: evaluateCard
let card = { id: 1, mastery: 1 };
card = evaluateCard(card, 'correct', 3);
console.assert(card.mastery === 2, "Test 1 Failed: correct should increase mastery");

card = evaluateCard(card, 'somewhat', 3);
console.assert(card.mastery === 1, "Test 2 Failed: somewhat should decrease mastery");

card = evaluateCard(card, 'incorrect', 3);
console.assert(card.mastery === 0, "Test 3 Failed: incorrect should drop mastery to 0");

// Test 2: distributeCards
const sampleCards = [
  { id: 1, mastery: 0 },
  { id: 2, mastery: 0 },
  { id: 3, mastery: 1 },
  { id: 4, mastery: 3 } // mastered (threshold 3)
];
const { boxes, mastered } = distributeCards(sampleCards, 3);
console.assert(boxes[0].length === 2, "Test 4 Failed: Box 0 should have 2 cards");
console.assert(boxes[1].length === 1, "Test 5 Failed: Box 1 should have 1 card");
console.assert(boxes[2].length === 0, "Test 6 Failed: Box 2 should have 0 cards");
console.assert(mastered.length === 1, "Test 7 Failed: Mastered should have 1 card");

// Test 3: drawNextCard (Probability Distribution)
const testBoxes = [[{id:1}], [{id:2}], [{id:3}]]; // 3 boxes, 1 card each
let counts = { 0: 0, 1: 0, 2: 0 };
for (let i = 0; i < 1000; i++) {
  const drawn = drawNextCard(testBoxes, 'normal');
  counts[drawn.id - 1]++;
}
console.log("Normal Distribution over 1000 draws (Box0, Box1, Box2):", counts);
console.assert(counts[0] > counts[1] && counts[1] > counts[2], "Test 8 Failed: Box 0 should be drawn most often in normal");

console.log("--- All tests finished (if no assertion errors, passed!) ---");
