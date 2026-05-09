import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SortMasteryCounter = ({ mastered, total }) => {
  return (
    <div className="flex justify-center pt-6 md:pt-8 pb-3 md:pb-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 md:px-5 py-1.5 md:py-2 bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl border border-neutral-200 dark:border-white/5 rounded-full flex items-center gap-2 md:gap-2.5 shadow-2xl"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
          Mastered
        </span>
        <div className="flex items-baseline gap-1">
          <AnimatePresence mode="wait">
            <motion.span 
              key={mastered}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="text-base md:text-lg font-black text-yellow-600 dark:text-yellow-400 tabular-nums"
            >
              {mastered}
            </motion.span>
          </AnimatePresence>
          <span className="text-neutral-600 font-bold mx-0.5">/</span>
          <span className="text-sm md:text-base font-bold text-neutral-400 tabular-nums">
            {total}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default SortMasteryCounter;
