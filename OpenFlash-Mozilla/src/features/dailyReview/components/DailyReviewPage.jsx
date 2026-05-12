import React, { useState } from 'react';
import { useDailyReview } from '../../../hooks/useDailyReview';
import DailyReviewEngine from './DailyReviewEngine';
import StatusModal from '../../../components/ui/StatusModal';
import { Clock, Zap, Calendar, ArrowRight, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

import DailyReviewDashboard from './DailyReviewDashboard';

const DailyReviewPage = () => {
  const { 
    settings, 
    saveSettings, 
    dailyState, 
    generateNewSession, 
    updateProgress, 
    loading, 
    allSets 
  } = useDailyReview();
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const handleGenerate = () => {
    if (!allSets || allSets.length === 0) {
      setIsErrorOpen(true);
      return;
    }
    generateNewSession();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const isToday = dailyState.lastGenerated && new Date(dailyState.lastGenerated).toDateString() === new Date().toDateString();
  const isCompleted = isToday && dailyState.completedIds.length >= dailyState.cards.length && dailyState.cards.length > 0;

  let content;

  if (isCompleted) {
    content = (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-500/10 p-8 rounded-full mb-8 text-emerald-500"
        >
          <Calendar size={64} />
        </motion.div>
        <h1 className="text-4xl font-black text-neutral-900 dark:text-white mb-4">Daily Goal Reached!</h1>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-md mb-8">
          You've completed your daily review of {dailyState.cards.length} cards. Great job keeping your streak alive!
        </p>
        <button 
          onClick={handleGenerate}
          className="px-8 py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-2xl font-black text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all border border-neutral-200 dark:border-neutral-700"
        >
          Generate Extra Session
        </button>
      </div>
    );
  } else if (!isToday || dailyState.cards.length === 0) {
    content = (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-8"
        >
          <div className="bg-yellow-400 p-6 rounded-3xl w-fit mx-auto shadow-2xl shadow-yellow-400/20 rotate-3">
            <Clock size={48} className="text-neutral-900" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white">Ready for today?</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">
              We'll pick {settings.dailyCount} cards from your {settings.selectedSetIds.length} selected sets based on what you need to review most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="p-4 bg-neutral-100 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <Zap size={20} className="text-yellow-500 mb-2" />
              <h3 className="font-bold text-neutral-900 dark:text-white">Smart Selection</h3>
              <p className="text-xs text-neutral-500">Prioritizes cards in lower mastery buckets.</p>
            </div>
            <div className="p-4 bg-neutral-100 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <Calendar size={20} className="text-emerald-500 mb-2" />
              <h3 className="font-bold text-neutral-900 dark:text-white">Daily Subset</h3>
              <p className="text-xs text-neutral-500">Perfect for consistent, focused learning.</p>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            className="group w-full py-5 bg-yellow-400 text-neutral-900 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-yellow-300 shadow-xl shadow-yellow-400/20 transition-all"
          >
            Start Daily Review
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    );
  } else {
    content = (
      <DailyReviewEngine 
        cards={dailyState.cards}
        onProgress={updateProgress}
        onGenerate={handleGenerate}
        allSets={allSets}
        settings={settings}
        saveSettings={saveSettings}
      />
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <DailyReviewDashboard 
        settings={settings}
        saveSettings={saveSettings}
        onGenerate={handleGenerate}
        allSets={allSets}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {content}
      </main>

      <StatusModal 
        isOpen={isErrorOpen}
        onClose={() => setIsErrorOpen(false)}
        type="error"
        title="No Sets Found"
        message="You need at least one flashcard set in your library to start a Daily Review. Create or import a set first!"
      />
    </div>
  );
};

export default DailyReviewPage;
