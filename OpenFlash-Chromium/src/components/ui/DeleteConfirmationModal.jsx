import React from 'react';
import Modal from './Modal';
import { Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion" maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center -mt-2">
        {/* Warning Icon Animation */}
        <div className="relative mb-5">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500"
          >
            <AlertTriangle size={32} />
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-red-500/20 rounded-full"
          />
        </div>

        <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2">
          {title || "Are you sure?"}
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mb-6">
          {message || "This action cannot be undone. All your flashcards and progress for this set will be permanently deleted."}
        </p>

        <div className="flex flex-col w-full gap-2">
          <button
            onClick={onConfirm}
            className="w-full py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-black text-xs transition-all active:scale-[0.98]"
          >
            Delete Permanently
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-xl font-bold text-xs transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
