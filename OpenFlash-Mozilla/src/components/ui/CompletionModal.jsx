import React from 'react';
import Modal from './Modal';
import { Trophy, Library, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const CompletionModal = ({ isOpen, onRestart, onLibrary }) => {
  return (
    <Modal isOpen={isOpen} onClose={onLibrary} title="Set Complete!" maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center -mt-2">
        {/* Success Icon Animation */}
        <div className="relative mb-5">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500"
          >
            <Trophy size={32} />
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-yellow-500/20 rounded-full"
          />
        </div>

        <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2">
          Mastered!
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mb-6">
          Congratulations you have mastered every card in this set!
        </p>

        <div className="flex flex-col w-full gap-2">
          <button
            onClick={onRestart}
            className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 rounded-xl font-black text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} strokeWidth={3} />
            Restart Set
          </button>
          <button
            onClick={onLibrary}
            className="w-full py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Library size={16} />
            Go back to library
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CompletionModal;
