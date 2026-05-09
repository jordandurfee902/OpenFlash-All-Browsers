import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SortMasteryCounter from './SortMasteryCounter';
import SortControls from './SortControls';
import SortSettingsModal from './SortSettingsModal';
import Flashcard from '../../study/components/Flashcard';
import CompletionModal from '../../../components/ui/CompletionModal';
import { useNavigate } from 'react-router-dom';
import { evaluateCard, distributeCards, drawNextCard } from '../../../utils/leitner';

/**
 * SortModeEngine
 * Specialized study engine that tracks mastery using the Leitner system.
 */

const DEFAULT_SORT_SETTINGS = {
  keybinds: {
    correct: 'ArrowRight',
    incorrect: 'ArrowLeft',
    somewhat: 'ArrowDown',
    flip: 'ArrowUp'
  },
  aggression: 'normal',
  masteryThreshold: 3
};

const SortModeEngine = ({ set }) => {
  const [boxes, setBoxes] = useState([]);
  const [masteredCount, setMasteredCount] = useState(0);
  const [currentCard, setCurrentCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SORT_SETTINGS);
  const [swapActive, setSwapActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null); // { text, type }
  const [evalStatus, setEvalStatus] = useState(null); // 'correct', 'incorrect', 'somewhat'
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const navigate = useNavigate();

  // Initialize and Load Session/Settings
  useEffect(() => {
    const initSession = async () => {
      setLoading(true);

      const result = await new Promise(resolve => {
        chrome.storage.local.get(['sortSettings', 'sortSessionStates'], resolve);
      });

      // Load Settings
      const currentSettings = result.sortSettings ? { ...DEFAULT_SORT_SETTINGS, ...result.sortSettings } : DEFAULT_SORT_SETTINGS;
      setSettings(currentSettings);

      // Load Session
      const sessionStates = result.sortSessionStates || {};
      const savedState = sessionStates[set.id];

      if (savedState) {
        // Backwards compatibility for old flat array format
        if (savedState.boxes) {
          setBoxes(savedState.boxes);
          setMasteredCount(savedState.masteredCount || 0);
          setCurrentCard(savedState.currentCard || drawNextCard(savedState.boxes, currentSettings.aggression));
        } else {
          const { boxes: newBoxes, mastered } = distributeCards(savedState.cards || set.cards, currentSettings.masteryThreshold);
          setBoxes(newBoxes);
          setMasteredCount(mastered.length);
          setCurrentCard(drawNextCard(newBoxes, currentSettings.aggression));
        }
        setSwapActive(savedState.swapActive || false);
        setIsFlipped(savedState.swapActive);
      } else {
        // New Session: Initialize with cards from set
        const initialCards = set.cards.map(c => ({ ...c, mastery: 0 }));
        const { boxes: newBoxes, mastered } = distributeCards(initialCards, currentSettings.masteryThreshold);
        setBoxes(newBoxes);
        setMasteredCount(mastered.length);
        setCurrentCard(drawNextCard(newBoxes, currentSettings.aggression));
      }

      setLoading(false);
    };

    initSession();
  }, [set]);

  // Save Session State whenever it changes
  useEffect(() => {
    if (loading || !boxes.length) return;

    const saveSession = () => {
      chrome.storage.local.get(['sortSessionStates'], (result) => {
        const states = result.sortSessionStates || {};
        states[set.id] = {
          boxes,
          masteredCount,
          currentCard,
          swapActive
        };
        chrome.storage.local.set({ sortSessionStates: states });
      });
    };

    saveSession();
  }, [boxes, masteredCount, currentCard, swapActive, set.id, loading]);

  const showToast = (text, type) => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleEvaluation = useCallback((result) => {
    if (!currentCard) return;

    setEvalStatus(result);
    setTimeout(() => setEvalStatus(null), 300);

    const evaluatedCard = evaluateCard(currentCard, result, settings.masteryThreshold);
    
    // Deep copy boxes
    const newBoxes = boxes.map(b => [...b]); 
    
    // Remove old card
    const oldScore = currentCard.mastery || 0;
    const boxIndex = Math.min(oldScore, settings.masteryThreshold - 1);
    if (newBoxes[boxIndex]) {
      newBoxes[boxIndex] = newBoxes[boxIndex].filter(c => c.id !== currentCard.id);
    }

    let newMasteredCount = masteredCount;

    if (evaluatedCard.mastery >= settings.masteryThreshold) {
      showToast('Mastered!', 'success');
      newMasteredCount++;
    } else {
      newBoxes[evaluatedCard.mastery].push(evaluatedCard);
    }

    setBoxes(newBoxes);
    setMasteredCount(newMasteredCount);

    if (newMasteredCount >= set.cards.length) {
      setIsCompletionOpen(true);
      setCurrentCard(null);
    } else {
      const nextCard = drawNextCard(newBoxes, settings.aggression, currentCard.id);
      setCurrentCard(nextCard);
    }

    setIsFlipped(swapActive);
  }, [boxes, currentCard, settings, swapActive, masteredCount, set.cards.length]);

  const handleRestart = () => {
    const resetCards = set.cards.map(c => ({ ...c, mastery: 0 }));
    const { boxes: newBoxes, mastered } = distributeCards(resetCards, settings.masteryThreshold);
    setBoxes(newBoxes);
    setMasteredCount(mastered.length);
    setCurrentCard(drawNextCard(newBoxes, settings.aggression));
    setSwapActive(false);
    setIsFlipped(false);
    setIsCompletionOpen(false);
    showToast('Session Restarted', 'info');
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    chrome.storage.local.set({ sortSettings: newSettings });
    setIsSettingsOpen(false);
    
    // If mastery threshold changed, redistribute cards
    if (newSettings.masteryThreshold !== settings.masteryThreshold) {
        const flatCards = [];
        boxes.forEach(b => flatCards.push(...b));
        if (currentCard && currentCard.mastery < newSettings.masteryThreshold) {
            flatCards.push(currentCard);
        }
        const { boxes: newBoxes, mastered } = distributeCards(flatCards, newSettings.masteryThreshold);
        setBoxes(newBoxes);
        setMasteredCount(masteredCount + mastered.length); // Assuming we don't demote mastered cards
    }
  };

  const handleSwap = () => {
    setSwapActive(prev => !prev);
    setIsFlipped(!swapActive);
  };

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSettingsOpen || isCompletionOpen || loading || !currentCard) return;

      const binds = settings.keybinds;
      if (e.code === binds.correct) {
        e.preventDefault();
        handleEvaluation('correct');
      } else if (e.code === binds.incorrect) {
        e.preventDefault();
        handleEvaluation('incorrect');
      } else if (e.code === binds.somewhat) {
        e.preventDefault();
        handleEvaluation('somewhat');
      } else if (e.code === binds.flip) {
        e.preventDefault();
        handleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleEvaluation, handleFlip, settings, isSettingsOpen, loading, currentCard, isCompletionOpen]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full mx-auto overflow-y-auto scrollbar-hide">
      <div className="flex-1 w-full flex flex-col items-center justify-center relative px-8 md:px-12 lg:px-16 gap-4 md:gap-6 py-6">
        <SortMasteryCounter mastered={masteredCount} total={set.cards.length} />
        
        <AnimatePresence mode="wait">
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className={`absolute top-0 z-50 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl ${feedback.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                }`}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`w-full flex justify-center transition-all duration-300 transform ${evalStatus === 'correct' ? 'translate-x-4 opacity-50' :
            evalStatus === 'incorrect' ? '-translate-x-4 opacity-50' :
              evalStatus === 'somewhat' ? 'translate-y-4 opacity-50' : ''
          }`}>
          {currentCard && (
            <div className="w-full max-w-xl lg:max-w-2xl xl:max-w-3xl">
              <Flashcard
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={handleFlip}
                status={evalStatus}
              />
            </div>
          )}
        </div>

        <SortControls
          onSettings={() => setIsSettingsOpen(true)}
          onIncorrect={() => handleEvaluation('incorrect')}
          onSomewhat={() => handleEvaluation('somewhat')}
          onCorrect={() => handleEvaluation('correct')}
          onSwap={handleSwap}
          swapActive={swapActive}
        />
      </div>

      <SortSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSave={handleSaveSettings}
        onRestart={handleRestart}
      />

      <CompletionModal
        isOpen={isCompletionOpen}
        onRestart={handleRestart}
        onLibrary={() => navigate('/')}
      />
    </div>
  );
};

export default SortModeEngine;
