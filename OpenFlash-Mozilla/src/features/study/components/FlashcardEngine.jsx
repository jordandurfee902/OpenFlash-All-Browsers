import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, Repeat, Settings } from 'lucide-react';
import StudySettingsModal from './StudySettingsModal';
import Flashcard from './Flashcard';

/**
 * FlashcardEngine
 * The primary controller for the study session.
 * Manages card navigation, shuffle, auto-flip, and keyboard shortcuts.
 */

const DEFAULT_SETTINGS = {
  keybinds: {
    next: 'ArrowRight',
    prev: 'ArrowLeft',
    flip: 'Space'
  },
  autoFlip: false
};

const FlashcardEngine = ({ set }) => {
  const [cards, setCards] = useState([...set.cards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Initialize and Load Settings
  useEffect(() => {
    setCards([...set.cards]);
    setCurrentIndex(0);
    
    chrome.storage.local.get(['studySettings'], (result) => {
      if (result.studySettings) {
        const mergedSettings = { ...DEFAULT_SETTINGS, ...result.studySettings };
        setSettings(mergedSettings);
        setIsFlipped(mergedSettings.autoFlip);
      } else {
        setIsFlipped(DEFAULT_SETTINGS.autoFlip);
      }
    });
  }, [set]);

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(settings.autoFlip);
    }
  }, [currentIndex, cards.length, settings.autoFlip]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(settings.autoFlip);
    }
  }, [currentIndex, settings.autoFlip]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleShuffle = useCallback(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(settings.autoFlip);
  }, [cards, settings.autoFlip]);

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    chrome.storage.local.set({ studySettings: newSettings });
    setIsFlipped(newSettings.autoFlip);
    setIsSettingsOpen(false);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSettingsOpen) return;
      
      if (e.code === settings.keybinds.next) handleNext();
      if (e.code === settings.keybinds.prev) handlePrev();
      if (e.code === settings.keybinds.flip) {
        e.preventDefault();
        handleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleFlip, settings, isSettingsOpen]);

  if (cards.length === 0) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">This set has no cards!</h3>
        <p className="text-neutral-500">Go to Edit mode to add some content.</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-6xl mx-auto py-4 md:py-8 px-8 md:px-12 lg:px-16 overflow-y-auto scrollbar-hide">
      {/* Main Study Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 md:gap-6">
        <Flashcard 
          card={currentCard} 
          isFlipped={isFlipped} 
          onFlip={handleFlip} 
        />

        {/* Tactile Control Bar */}
        <div className="flex items-center gap-4 md:gap-8 mt-4 md:mt-5">
          <button 
            onClick={handleShuffle}
            className="p-4 md:p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-yellow-600 dark:hover:text-yellow-400 hover:border-yellow-500/50 dark:hover:border-yellow-400 active:bg-yellow-400 active:text-neutral-900 active:border-yellow-400 rounded-full transition-all active:scale-90 shadow-xl"
            title="Shuffle Deck"
          >
            <Shuffle className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <div className="flex items-center gap-4 md:gap-8">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-4 md:p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-full disabled:opacity-20 disabled:cursor-not-allowed hover:text-yellow-600 dark:hover:text-yellow-400 hover:border-yellow-500/50 dark:hover:border-yellow-400 active:bg-yellow-400 active:text-neutral-900 active:border-yellow-400 transition-all shadow-xl"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
            </button>

            <span className="min-w-[4rem] md:min-w-[6rem] text-center text-neutral-400 font-black text-lg md:text-xl tracking-widest tabular-nums">
              {currentIndex + 1} / {cards.length}
            </span>

            <button 
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="p-4 md:p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-full disabled:opacity-20 disabled:cursor-not-allowed hover:text-yellow-600 dark:hover:text-yellow-400 hover:border-yellow-500/50 dark:hover:border-yellow-400 active:bg-yellow-400 active:text-neutral-900 active:border-yellow-400 transition-all shadow-xl"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
            </button>
          </div>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-4 md:p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-yellow-600 dark:hover:text-yellow-400 hover:border-yellow-500/50 dark:hover:border-yellow-400 active:bg-yellow-400 active:text-neutral-900 active:border-yellow-400 rounded-full transition-all shadow-xl"
            title="Settings"
          >
            <Settings className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      <StudySettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSave={handleSaveSettings}
        onShuffle={handleShuffle}
      />
    </div>
  );
};

export default FlashcardEngine;
