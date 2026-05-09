export const evaluateCard = (card, result, masteryThreshold) => {
  const currentScore = card.mastery || 0;
  let newScore;

  if (result === 'incorrect') {
    newScore = 0; // Drop to 0 on incorrect
  } else if (result === 'somewhat') {
    newScore = Math.max(0, currentScore - 1); // Drop by 1, min 0
  } else if (result === 'correct') {
    newScore = currentScore + 1; // Increase by 1
  }

  return { ...card, mastery: newScore, lastReviewed: Date.now() };
};

export const distributeCards = (cards, masteryThreshold) => {
  const boxes = Array.from({ length: masteryThreshold }, () => []);
  const mastered = [];

  cards.forEach(card => {
    const score = card.mastery || 0;
    if (score >= masteryThreshold) {
      mastered.push(card);
    } else {
      const boxIndex = Math.min(score, masteryThreshold - 1);
      boxes[boxIndex].push(card);
    }
  });

  return { boxes, mastered };
};

export const drawNextCard = (boxes, aggressionLevel, previousCardId = null) => {
  const allCards = boxes.flat();
  if (allCards.length === 0) return null;
  
  if (allCards.length === 1) return allCards[0];

  const filteredBoxes = boxes.map(box => box.filter(c => c.id !== previousCardId));
  
  let weights = [];
  if (aggressionLevel === 'aggressive') {
    weights = filteredBoxes.map((_, i) => Math.pow(0.2, i)); 
  } else if (aggressionLevel === 'normal') {
    weights = filteredBoxes.map((_, i) => Math.pow(0.5, i)); 
  } else {
    weights = filteredBoxes.map((_, i) => Math.pow(0.8, i)); 
  }
  
  const validWeights = weights.map((w, i) => filteredBoxes[i].length > 0 ? w : 0);
  const totalWeight = validWeights.reduce((sum, w) => sum + w, 0);
  
  if (totalWeight === 0) {
    return allCards.find(c => c.id !== previousCardId) || allCards[0];
  }
  
  let random = Math.random() * totalWeight;
  let selectedBoxIndex = 0;
  
  for (let i = 0; i < validWeights.length; i++) {
    random -= validWeights[i];
    if (random <= 0) {
      selectedBoxIndex = i;
      break;
    }
  }
  
  const box = filteredBoxes[selectedBoxIndex];
  const cardIndex = Math.floor(Math.random() * box.length);
  return box[cardIndex];
};

/**
 * Generates a daily subset of cards from all selected sets based on mastery levels.
 */
export const generateDailyPool = (allSets, sessionStates, dailyCount, aggressionLevel = 'normal') => {
  const pool = [];
  
  allSets.forEach(set => {
    const state = sessionStates[set.id] || {};
    let cardsWithMastery = [];
    
    if (state.boxes) {
      const cardsInBoxes = state.boxes.flat();
      const cardsInBoxesIds = new Set(cardsInBoxes.map(c => c.id));
      
      const masteredCards = set.cards
        .filter(c => !cardsInBoxesIds.has(c.id))
        .map(c => ({ ...c, mastery: 9 })); 
      
      cardsWithMastery = [...cardsInBoxes, ...masteredCards];
    } else {
      cardsWithMastery = set.cards.map(c => ({ ...c, mastery: 0 }));
    }
    
    pool.push(...cardsWithMastery.map(c => ({ ...c, parentSetId: set.id })));
  });

  if (pool.length === 0) return [];

  if (pool.length <= dailyCount) {
    return pool.sort(() => Math.random() - 0.5);
  }

  const dailySet = [];
  const remainingPool = [...pool];

  while (dailySet.length < dailyCount && remainingPool.length > 0) {
    const { boxes } = distributeCards(remainingPool, 10);
    const nextCard = drawNextCard(boxes, aggressionLevel);
    
    if (!nextCard) break;
    
    dailySet.push(nextCard);
    
    const index = remainingPool.findIndex(c => c.id === nextCard.id && c.parentSetId === nextCard.parentSetId);
    if (index !== -1) remainingPool.splice(index, 1);
  }

  return dailySet;
};
