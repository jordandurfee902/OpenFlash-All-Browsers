import React from 'react';
import { useFlashcardSets } from '../../../hooks/useFlashcardSets';
import SetGrid from './SetGrid';
import SyncBanner from './SyncBanner';
import { motion } from 'framer-motion';

const LibraryDashboard = () => {
  const { flashcardSets, loading } = useFlashcardSets();

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
      <motion.header 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8 md:mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white mb-2 md:mb-3">Your Library</h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-base md:text-lg">
          Select a set to start studying or create a new one.
        </p>
      </motion.header>

      <SyncBanner />
      <SetGrid sets={flashcardSets} />

    </div>
  );
};

export default LibraryDashboard;
