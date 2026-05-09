import React from 'react';
import { Settings, X, Minus, Check, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';

const ControlButton = ({ icon: Icon, onClick, colorClass, title, size = 24 }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    transition={{ type: "spring", stiffness: 500, damping: 25 }}
    onClick={onClick}
    className={`p-4 md:p-5 bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl border border-neutral-200 dark:border-white/5 rounded-full transition-all duration-75 shadow-2xl ${colorClass}`}
    title={title}
  >
    <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
  </motion.button>
);

const SortControls = ({ onSettings, onIncorrect, onSomewhat, onCorrect, onSwap, swapActive }) => {
  return (
    <div className="flex items-center justify-center gap-4 md:gap-6 lg:gap-10 py-6 md:py-12 w-full px-4">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        animate={{ rotate: swapActive ? 180 : 0 }}
        onClick={onSwap}
        className="p-4 md:p-5 bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl border border-neutral-200 dark:border-white/5 rounded-full transition-all duration-75 shadow-2xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-white/20"
        title="Swap Term/Definition"
      >
        <Repeat className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
      </motion.button>

      <ControlButton
        icon={X}
        onClick={onIncorrect}
        colorClass="text-red-500/80 hover:text-red-400 hover:border-red-500/30 active:bg-red-500/20"
        title="Incorrect (ArrowLeft)"
      />

      <ControlButton
        icon={Minus}
        onClick={onSomewhat}
        colorClass="text-yellow-500/80 hover:text-yellow-400 hover:border-yellow-500/30 active:bg-yellow-500/20"
        title="Somewhat (ArrowDown)"
      />

      <ControlButton
        icon={Check}
        onClick={onCorrect}
        colorClass="text-emerald-500/80 hover:text-emerald-400 hover:border-emerald-500/30 active:bg-emerald-500/20"
        title="Correct (ArrowRight)"
      />

      <ControlButton
        icon={Settings}
        onClick={onSettings}
        colorClass="text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-white/20"
        title="Sort Settings"
      />
    </div>
  );
};

export default SortControls;
