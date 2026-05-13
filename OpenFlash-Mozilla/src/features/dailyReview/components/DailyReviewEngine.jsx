import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SortMasteryCounter from '../../sortMode/components/SortMasteryCounter';
import SortControls from '../../sortMode/components/SortControls';
import SortSettingsModal from '../../sortMode/components/SortSettingsModal';
import Flashcard from '../../study/components/Flashcard';
import CompletionModal from '../../../components/ui/CompletionModal';
import TypeInputArea from '../../typeMode/components/TypeInputArea';
import { isAnswerCorrect } from '../../typeMode/utils/stringSimilarity';
import { useNavigate } from 'react-router-dom';
import { evaluateCard, distributeCards, drawNextCard } from '../../../utils/leitner';

const DEFAULT_SETTINGS = {
  keybinds: {
    correct: 'ArrowRight',
    incorrect: 'ArrowLeft',
    somewhat: 'ArrowDown',
    flip: 'ArrowUp'
  },
  aggression: 'normal',
  masteryThreshold: 3
};

const DEFAULT_TYPE_SETTINGS = {
  keybinds: {
    submit: 'Enter',
    override: 'Backspace'
  },
  grading: {
    uppercase: false,
    punctuation: false,
    special: false,
    difficulty: 'medium'
  }
};

const DailyReviewEngine = ({ cards, onProgress, onGenerate, allSets, settings: dailySettings, saveSettings }) => {
  const [boxes, setBoxes] = useState([]);
  const [masteredCount, setMasteredCount] = useState(0);
  const [currentCard, setCurrentCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [typeSettings, setTypeSettings] = useState(DEFAULT_TYPE_SETTINGS);
  const [swapActive, setSwapActive] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [evalStatus, setEvalStatus] = useState(null);
  const [evalState, setEvalState] = useState('typing'); // 'typing' | 'evaluated'
  const [inputValue, setInputValue] = useState('');
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const navigate = useNavigate();

  // Initialize Session
  useEffect(() => {
    const init = async () => {
      const result = await new Promise(resolve => {
        chrome.storage.local.get(['sortSettings', 'typeSettings'], resolve);
      });
      setSettings(result.sortSettings ? { ...DEFAULT_SETTINGS, ...result.sortSettings } : DEFAULT_SETTINGS);
      setTypeSettings(result.typeSettings ? { ...DEFAULT_TYPE_SETTINGS, ...result.typeSettings } : DEFAULT_TYPE_SETTINGS);

      const threshold = result.sortSettings?.masteryThreshold || DEFAULT_SETTINGS.masteryThreshold;
      
      // Daily Review Subset starts with local mastery 0 for all cards.
      // Global mastery is preserved in the background but this session
      // requires mastering the subset from scratch.
      const sessionCards = cards.map(c => ({
        ...c,
        mastery: 0
      }));

      const { boxes: newBoxes, mastered } = distributeCards(sessionCards, threshold);
      setBoxes(newBoxes);
      setMasteredCount(0); // Everything starts unmastered locally
      setCurrentCard(drawNextCard(newBoxes, result.sortSettings?.aggression || 'normal'));
    };
    init();
  }, [cards]);

  const showToast = (text, type) => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    chrome.storage.local.set({ sortSettings: newSettings });
    setIsSettingsOpen(false);
  };

  const handleRestart = () => {
    onGenerate();
    showToast('Session Restarted', 'info');
  };

  const updateGlobalMastery = useCallback(async (card, result) => {
    const res = await new Promise(resolve => {
      chrome.storage.local.get(['sortSessionStates', 'flashcardSets'], resolve);
    });

    const states = res.sortSessionStates || {};
    const sets = res.flashcardSets || [];
    const setId = card.parentSetId;
    
    if (!states[setId]) {
      const parentSet = sets.find(s => s.id === setId);
      if (parentSet) {
        const initialCards = parentSet.cards.map(c => ({ ...c, mastery: 0 }));
        const { boxes: newBoxes, mastered } = distributeCards(initialCards, settings.masteryThreshold);
        states[setId] = { boxes: newBoxes, masteredCount: mastered.length };
      }
    }

    if (states[setId]) {
      const state = states[setId];
      // Find and remove card from current boxes
      let cardToUpdate = null;
      state.boxes = state.boxes.map(box => {
        const found = box.find(c => c.id === card.id);
        if (found) cardToUpdate = found;
        return box.filter(c => c.id !== card.id);
      });

      if (!cardToUpdate) cardToUpdate = { ...card, mastery: 0 };

      const evaluated = evaluateCard(cardToUpdate, result, settings.masteryThreshold);
      
      if (evaluated.mastery >= settings.masteryThreshold) {
        state.masteredCount = (state.masteredCount || 0) + 1;
      } else {
        state.boxes[evaluated.mastery].push(evaluated);
      }
      
      chrome.storage.local.set({ sortSessionStates: states });
    }
  }, [settings.masteryThreshold]);

  const handleTypeSubmit = useCallback(() => {
    if (!currentCard || evalState !== 'typing') return;
    
    const targetText = swapActive ? currentCard.term : currentCard.definition;
    const isCorrect = isAnswerCorrect(inputValue, targetText, typeSettings);
    
    setEvalStatus(isCorrect ? 'correct' : 'incorrect');
    setEvalState('evaluated');
    setIsFlipped(true);
  }, [currentCard, evalState, inputValue, swapActive, typeSettings]);

  const handleEvaluation = useCallback((result) => {
    if (!currentCard) return;

    const isOverride = result === 'override';
    const finalResult = isOverride ? 'correct' : result;

    setEvalStatus(finalResult);

    const proceed = () => {
      const evaluatedCard = evaluateCard(currentCard, finalResult, settings.masteryThreshold);
      
      // Update local boxes
      const newBoxes = boxes.map(b => [...b]); 
      const oldScore = currentCard.mastery || 0;
      const boxIndex = Math.min(oldScore, settings.masteryThreshold - 1);
      if (newBoxes[boxIndex]) {
        newBoxes[boxIndex] = newBoxes[boxIndex].filter(c => c.id === currentCard.id && c.parentSetId === currentCard.parentSetId ? false : true);
      }

      let newMasteredCount = masteredCount;
      let isMastered = false;

      if (evaluatedCard.mastery >= settings.masteryThreshold) {
        showToast('Mastered!', 'success');
        newMasteredCount++;
        isMastered = true;
      } else {
        const newBoxIndex = Math.min(evaluatedCard.mastery, settings.masteryThreshold - 1);
        newBoxes[newBoxIndex].push(evaluatedCard);
      }

      setBoxes(newBoxes);
      setMasteredCount(newMasteredCount);
      updateGlobalMastery(currentCard, finalResult);
      onProgress(currentCard.id, isMastered);

      if (newMasteredCount >= cards.length) {
        setIsCompletionOpen(true);
        setCurrentCard(null);
      } else {
        const nextCard = drawNextCard(newBoxes, settings.aggression, currentCard.id);
        setCurrentCard(nextCard);
      }

      setIsFlipped(swapActive);
      setEvalState('typing');
      setInputValue('');
      setEvalStatus(null);
    };

    if (isOverride) {
      showToast('Overridden', 'success');
      setTimeout(proceed, 600);
    } else {
      setTimeout(() => setEvalStatus(null), 300);
      proceed();
    }
  }, [boxes, currentCard, settings, swapActive, masteredCount, cards.length, updateGlobalMastery, onProgress]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSettingsOpen || isCompletionOpen || !currentCard) return;

      const isSort = dailySettings.reviewMode === 'sort';

      if (isSort) {
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
      } else {
        // Type Mode Bindings
        const typeBinds = typeSettings.keybinds;
        if (e.code === typeBinds.submit || e.key === typeBinds.submit) {
          e.preventDefault();
          if (evalState === 'typing') {
            handleTypeSubmit();
          } else {
            handleEvaluation(evalStatus);
          }
        } else if (e.code === typeBinds.override || e.key === typeBinds.override) {
          if (evalState === 'evaluated' && evalStatus === 'incorrect') {
            e.preventDefault();
            handleEvaluation('override');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleEvaluation, handleFlip, handleTypeSubmit, settings, typeSettings, isSettingsOpen, currentCard, isCompletionOpen, evalState, evalStatus, dailySettings.reviewMode]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full mx-auto overflow-y-auto scrollbar-hide">
      <div className="flex-1 w-full flex flex-col items-center justify-center relative px-8 md:px-12 lg:px-16 gap-4 md:gap-6 py-6">
        <SortMasteryCounter mastered={masteredCount} total={cards.length} />
        
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

        <div className={`w-full flex justify-center transition-all duration-300 transform relative ${
          dailySettings.reviewMode === 'sort' ? (
            evalStatus === 'correct' ? 'translate-x-4 opacity-50' :
            evalStatus === 'incorrect' ? '-translate-x-4 opacity-50' :
            evalStatus === 'somewhat' ? 'translate-y-4 opacity-50' : ''
          ) : (
            evalStatus === 'correct' ? 'scale-105' :
            evalStatus === 'incorrect' ? 'scale-95' : ''
          )
        }`}>
          {currentCard && (
            <div className="w-full max-w-xl lg:max-w-2xl xl:max-w-3xl relative">
              <Flashcard
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={handleFlip}
                status={evalStatus}
                swapActive={swapActive}
              />
              
              {dailySettings.reviewMode === 'type' && evalState === 'evaluated' && (
                <div className="absolute -bottom-8 left-0 right-0 text-center font-bold text-yellow-600 dark:text-yellow-400 opacity-80 animate-pulse text-[10px] uppercase tracking-widest">
                  {evalStatus === 'incorrect' 
                    ? `Press ${typeSettings.keybinds.submit} to continue or ${typeSettings.keybinds.override} to override`
                    : `Press ${typeSettings.keybinds.submit} to continue`}
                </div>
              )}
            </div>
          )}
        </div>

        {dailySettings.reviewMode === 'sort' ? (
          <SortControls
            onSettings={() => setIsSettingsOpen(true)}
            onIncorrect={() => handleEvaluation('incorrect')}
            onSomewhat={() => handleEvaluation('somewhat')}
            onCorrect={() => handleEvaluation('correct')}
            onSwap={() => { setSwapActive(!swapActive); setIsFlipped(!swapActive); }}
            swapActive={swapActive}
          />
        ) : (
          <TypeInputArea 
            value={inputValue}
            onChange={setInputValue}
            disabled={evalState === 'evaluated'}
            onOpenSettings={() => setIsSettingsOpen(true)}
            placeholder={swapActive ? "Type the term..." : "Type the definition..."}
          />
        )}
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
        onRestart={onGenerate}
        onLibrary={() => navigate('/')}
      />
    </div>
  );
};

export default DailyReviewEngine;
