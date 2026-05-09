import React from 'react';
import Modal from './Modal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion } from 'framer-motion';

const StatusModal = ({ isOpen, onClose, type = 'success', title, message }) => {
  const configs = {
    success: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      pulseColor: 'bg-green-500/20'
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      pulseColor: 'bg-red-500/20'
    },
    info: {
      icon: Info,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      pulseColor: 'bg-blue-500/20'
    }
  };

  const config = configs[type] || configs.success;
  const Icon = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || (type === 'success' ? 'Success' : 'Notice')} maxWidth="max-w-sm">
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

        <button
          onClick={onClose}
          className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm transition-all active:scale-[0.98] shadow-lg shadow-neutral-200 dark:shadow-none"
        >
          Dismiss
        </button>
      </div>
    </Modal>
  );
};

export default StatusModal;
