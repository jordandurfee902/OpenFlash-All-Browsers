import { useState, useEffect, useCallback } from 'react';
import { generateDailyPool } from '../utils/leitner';

export const useDailyReview = () => {
  const [settings, setSettings] = useState({
    selectedSetIds: [],
    dailyCount: 20,
    aggression: 'normal'
  });
  const [dailyState, setDailyState] = useState({
    lastGenerated: null,
    cards: [],
    completedIds: []
  });
  const [loading, setLoading] = useState(true);
  const [allSets, setAllSets] = useState([]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const result = await new Promise(resolve => {
        chrome.storage.local.get(['flashcardSets', 'dailyReviewSettings', 'dailyReviewState'], resolve);
      });

      const sets = result.flashcardSets || [];
      setAllSets(sets);

      const savedSettings = result.dailyReviewSettings || {
        selectedSetIds: sets.map(s => s.id), // Default to all sets
        dailyCount: 20,
        aggression: 'normal'
      };
      setSettings(savedSettings);

      const savedState = result.dailyReviewState || {
        lastGenerated: null,
        cards: [],
        completedIds: []
      };
      setDailyState(savedState);
      setLoading(false);
    };

    init();
  }, []);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    chrome.storage.local.set({ dailyReviewSettings: newSettings });
  };

  const generateNewSession = useCallback(async () => {
    setLoading(true);
    const result = await new Promise(resolve => {
      chrome.storage.local.get(['flashcardSets', 'dailyReviewSettings', 'sortSessionStates'], (res) => {
        resolve(res);
      });
    });

    const sets = result.flashcardSets || [];
    const savedSettings = result.dailyReviewSettings || settings;
    const sessionStates = result.sortSessionStates || {};
    
    const selectedSets = sets.filter(s => savedSettings.selectedSetIds.includes(s.id));

    // Fallback: If no sets selected or selected sets are empty, try using all sets
    let finalSets = selectedSets;
    if (finalSets.length === 0 && sets.length > 0) {
      finalSets = sets;
      const updatedSettings = { ...savedSettings, selectedSetIds: sets.map(s => s.id) };
      setSettings(updatedSettings);
      chrome.storage.local.set({ dailyReviewSettings: updatedSettings });
    }

    const newCards = generateDailyPool(finalSets, sessionStates, savedSettings.dailyCount, savedSettings.aggression);
    
    const newState = {
      lastGenerated: Date.now(),
      cards: newCards,
      completedIds: []
    };
    
    setDailyState(newState);
    chrome.storage.local.set({ dailyReviewState: newState });
    setLoading(false);
  }, [settings]);

  const updateProgress = (cardId, isMastered) => {
    setDailyState(prev => {
      const newCompletedIds = isMastered 
        ? [...new Set([...prev.completedIds, cardId])] 
        : prev.completedIds;
      
      const newState = { ...prev, completedIds: newCompletedIds };
      chrome.storage.local.set({ dailyReviewState: newState });
      return newState;
    });
  };

  return {
    settings,
    saveSettings,
    dailyState,
    generateNewSession,
    updateProgress,
    loading,
    allSets
  };
};
