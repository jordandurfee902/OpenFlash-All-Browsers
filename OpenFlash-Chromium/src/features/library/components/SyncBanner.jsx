import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, X } from 'lucide-react';

const SyncBanner = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If user is already logged in, never show the banner
    if (currentUser) {
      setIsVisible(false);
      return;
    }

    const lastDismissed = localStorage.getItem('last_dismissed_sync_banner');
    if (lastDismissed) {
      const dismissDate = new Date(parseInt(lastDismissed));
      const now = new Date();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      
      // If it has been less than a week since dismissal, don't show
      if (now.getTime() - dismissDate.getTime() < oneWeek) {
        setIsVisible(false);
        return;
      }
    }

    setIsVisible(true);
  }, [currentUser]);

  const handleDismiss = () => {
    localStorage.setItem('last_dismissed_sync_banner', Date.now().toString());
    setIsVisible(false);
  };

  const handleGoToAccount = () => {
    navigate('/account');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="mb-8 p-4 md:p-6 bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 rounded-3xl shadow-xl shadow-amber-500/10 border border-white/20 relative overflow-hidden group"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none group-hover:bg-white/20 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-200/20 rounded-full -ml-16 -mb-16 blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              <div className="p-3.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner">
                <Cloud className="w-7 h-7 text-amber-900" />
              </div>
              <div>
                <h3 className="text-amber-950 font-black text-lg md:text-xl leading-tight mb-1">
                  Sync Your Progress
                </h3>
                <p className="text-amber-900/80 text-sm md:text-base max-w-md font-semibold">
                  Login with Google to sync your studying across devices for free!
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleGoToAccount}
                className="flex-1 sm:flex-none px-6 py-3 bg-neutral-900 text-white font-black rounded-2xl hover:bg-neutral-800 hover:shadow-lg hover:shadow-black/20 transition-all active:scale-95 shadow-xl shadow-black/10"
              >
                Go to Account
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-amber-900/60 hover:text-amber-950 font-bold text-sm transition-all active:scale-90"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SyncBanner;
