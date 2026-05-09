import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SortMasteryCounter from '../../sortMode/components/SortMasteryCounter';
import Flashcard from '../../study/components/Flashcard';
import CompletionModal from '../../../components/ui/CompletionModal';
import TypeInputArea from './TypeInputArea';
import TypeSettingsModal from './TypeSettingsModal';
import { useNavigate } from 'react-router-dom';
import { distributeCards, drawNextCard } from '../../../utils/leitner';
import { isAnswerCorrect } from '../utils/stringSimilarity';

const DEFAULT_TYPE_SETTINGS = {
  keybinds: {
    submit: 'Enter',
    override: 'Backspace',
    flip: 'Space' // Note: manual flip is usually disabled in type mode during 'typing', but we can allow it as a peek
  },
  grading: {
    uppercase: false,
    punctuation: false,
    special: false,
    difficulty: 'medium'
  },
  aggression: 'normal',
  masteryThreshold: 3
};

const TypeModeEngine = ({ set }) => {
  const [boxes, setBoxes] = useState([]);
  const [masteredCount, setMasteredCount] = useState(0);
  const [currentCard, setCurrentCard] = useState(null);
  
  const [inputValue, setInputValue] = useState('');
  const [evalState, setEvalState] = useState('typing'); // 'typing' | 'evaluated'
  const [evalStatus, setEvalStatus] = useState(null); // 'correct' | 'incorrect'
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_TYPE_SETTINGS);
  const [swapActive, setSwapActive] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const navigate = useNavigate();

  // Initialize Session
  useEffect(() => {
    const initSession = async () => {
      setLoading(true);

      const result = await new Promise(resolve => {
        chrome.storage.local.get(['typeSettings', 'typeSessionStates'], resolve);
      });

      const currentSettings = result.typeSettings ? { ...DEFAULT_TYPE_SETTINGS, ...result.typeSettings } : DEFAULT_TYPE_SETTINGS;
      setSettings(currentSettings);

      const sessionStates = result.typeSessionStates || {};
      const savedState = sessionStates[set.id];

      if (savedState) {
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
        setIsFlipped(false);
      } else {
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

  // Save Session
  useEffect(() => {
    if (loading || !boxes.length) return;
    const saveSession = () => {
      chrome.storage.local.get(['typeSessionStates'], (result) => {
        const states = result.typeSessionStates || {};
        states[set.id] = { boxes, masteredCount, currentCard, swapActive };
        chrome.storage.local.set({ typeSessionStates: states });
      });
    };
    saveSession();
  }, [boxes, masteredCount, currentCard, swapActive, set.id, loading]);

  const showToast = (text, type) => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleEvaluationSubmit = () => {
    if (!currentCard) return;
    
    const targetText = swapActive ? currentCard.term : currentCard.definition;
    const isCorrect = isAnswerCorrect(inputValue, targetText, settings);
    
    setEvalStatus(isCorrect ? 'correct' : 'incorrect');
    setEvalState('evaluated');
    setIsFlipped(true); // Show back of card
  };

  const handleContinue = useCallback((isOverride = false) => {
    const proceed = (override) => {
      const resultStatus = override ? 'correct' : evalStatus;
      const evaluatedCard = { ...currentCard };
      const currentScore = evaluatedCard.mastery || 0;
      
      if (resultStatus === 'correct') {
        evaluatedCard.mastery = currentScore + 1;
      } else {
        evaluatedCard.mastery = 0;
      }
      
      const newBoxes = boxes.map(b => [...b]); 
      const boxIndex = Math.min(currentScore, settings.masteryThreshold - 1);
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

      setIsFlipped(false);
      setEvalState('typing');
      setEvalStatus(null);
      setInputValue('');
    };

    if (isOverride) {
      setEvalStatus('correct');
      showToast('Overridden', 'success');
      setTimeout(() => proceed(true), 600);
    } else {
      proceed(false);
    }
  }, [currentCard, evalStatus, boxes, masteredCount, settings, set.cards.length, set.id]);

  const handleRestart = () => {
    const resetCards = set.cards.map(c => ({ ...c, mastery: 0 }));
    const { boxes: newBoxes, mastered } = distributeCards(resetCards, settings.masteryThreshold);
    setBoxes(newBoxes);
    setMasteredCount(mastered.length);
    setCurrentCard(drawNextCard(newBoxes, settings.aggression));
    setSwapActive(false);
    setIsFlipped(false);
    setIsCompletionOpen(false);
    setEvalState('typing');
    setEvalStatus(null);
    setInputValue('');
    showToast('Session Restarted', 'info');
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    chrome.storage.local.set({ typeSettings: newSettings });
    setIsSettingsOpen(false);
    
    if (newSettings.masteryThreshold !== settings.masteryThreshold) {
        const flatCards = [];
        boxes.forEach(b => flatCards.push(...b));
        if (currentCard && currentCard.mastery < newSettings.masteryThreshold) {
            flatCards.push(currentCard);
        }
        const { boxes: newBoxes, mastered } = distributeCards(flatCards, newSettings.masteryThreshold);
        setBoxes(newBoxes);
        setMasteredCount(masteredCount + mastered.length); 
    }
  };

  const handleSwap = () => {
    setSwapActive(prev => !prev);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if settings or completion is open
      if (isSettingsOpen || isCompletionOpen || loading || !currentCard) return;

      const binds = settings.keybinds;

      if (e.code === binds.submit || e.key === binds.submit) {
        e.preventDefault();
        if (evalState === 'typing') {
          handleEvaluationSubmit();
        } else if (evalState === 'evaluated') {
          handleContinue(false);
        }
      } else if (e.code === binds.override || e.key === binds.override) {
        if (evalState === 'evaluated' && evalStatus === 'incorrect') {
          e.preventDefault();
          handleContinue(true); // Override as correct
        }
      } else if (e.code === binds.flip || e.key === binds.flip) {
        // Optional peek feature if in typing mode
        if (evalState === 'typing' && inputValue === '') {
           e.preventDefault();
           setIsFlipped(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings, isSettingsOpen, loading, currentCard, isCompletionOpen, evalState, evalStatus, inputValue, handleEvaluationSubmit, handleContinue]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  // Extend the Flashcard component's logic slightly to show continue hint via a wrapper if needed, 
  // or we just inject it into Flashcard? 
  // The user prompt mentions the "Continue Hint" text.
  // Flashcard.jsx might not have a place for it, so we can position it absolutely over the card or below it.

  return (
    <div className="flex flex-col items-center justify-center w-full h-full mx-auto overflow-y-auto scrollbar-hide pb-8">
      <div className="flex-1 w-full flex flex-col items-center justify-center relative px-8 md:px-12 lg:px-16 gap-5 md:gap-8 py-6">
        <SortMasteryCounter mastered={masteredCount} total={set.cards.length} />

        <AnimatePresence mode="wait">
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className={`absolute top-0 z-50 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl ${feedback.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'}`}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>
 
        <div className={`w-full flex justify-center transition-all duration-300 relative ${
            evalStatus === 'correct' ? 'scale-105' :
            evalStatus === 'incorrect' ? 'scale-95' : ''
          }`}>
          {currentCard && (
            <div className="w-full max-w-xl lg:max-w-2xl xl:max-w-3xl relative">
              <Flashcard
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={() => {}} 
                status={evalStatus}
                swapActive={swapActive}
              />
              
              {evalState === 'evaluated' && (
                <div className="absolute -bottom-8 left-0 right-0 text-center font-bold text-yellow-600 dark:text-yellow-400 opacity-80 animate-pulse text-sm">
                  {evalStatus === 'incorrect' 
                    ? `Press ${settings.keybinds.submit} to continue or ${settings.keybinds.override} to override`
                    : `Press ${settings.keybinds.submit} to continue`}
                </div>
              )}
            </div>
          )}
        </div>

        <TypeInputArea 
          value={inputValue}
          onChange={setInputValue}
          disabled={evalState === 'evaluated'}
          onOpenSettings={() => setIsSettingsOpen(true)}
          placeholder={swapActive ? "Type the term..." : "Type the definition..."}
        />
      </div>

      <TypeSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSave={handleSaveSettings}
        onRestart={handleRestart}
        onSwap={handleSwap}
        swapActive={swapActive}
      />

      <CompletionModal
        isOpen={isCompletionOpen}
        onRestart={handleRestart}
        onLibrary={() => navigate('/')}
      />
    </div>
  );
};

export default TypeModeEngine;
