import React from 'react';
import Modal from './Modal';
import { HelpCircle, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "primary" 
}) => {
  const configs = {
    primary: {
      icon: HelpCircle,
      color: 'text-neutral-900 dark:text-white',
      bgColor: 'bg-neutral-100 dark:bg-neutral-800',
      btnColor: 'bg-neutral-900 dark:bg-white text-white dark:text-black',
      pulseColor: 'bg-neutral-200 dark:bg-neutral-700'
    },
    danger: {
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      btnColor: 'bg-red-500 hover:bg-red-400 text-white',
      pulseColor: 'bg-red-500/20'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      btnColor: 'bg-yellow-500 hover:bg-yellow-400 text-neutral-900',
      pulseColor: 'bg-yellow-500/20'
    }
  };

  const config = configs[variant] || configs.primary;
  const Icon = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || "Are you sure?"} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center -mt-2">
        {/* Animated Icon */}
        <div className="relative mb-6">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center ${config.color}`}
          >
            <Icon size={32} />
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 ${config.pulseColor} rounded-full`}
          />
        </div>

        <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex flex-col w-full gap-3">
          <button
            onClick={() => {
                onConfirm();
                onClose();
            }}
            className={`w-full py-4 ${config.btnColor} rounded-2xl font-black text-sm transition-all active:scale-[0.98] shadow-lg shadow-neutral-200 dark:shadow-none`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-2xl font-bold text-sm transition-all"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
