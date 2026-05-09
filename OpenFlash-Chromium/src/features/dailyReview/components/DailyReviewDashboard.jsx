import React, { useState } from 'react';
import { Settings, RotateCcw, List, Check, Clock, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const DailyReviewDashboard = ({ settings, saveSettings, onGenerate, allSets }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSet = (setId) => {
    const newSelected = settings.selectedSetIds.includes(setId)
      ? settings.selectedSetIds.filter(id => id !== setId)
      : [...settings.selectedSetIds, setId];
    saveSettings({ ...settings, selectedSetIds: newSelected });
  };

  const toggleAll = () => {
    if (settings.selectedSetIds.length === allSets.length) {
      saveSettings({ ...settings, selectedSetIds: [] });
    } else {
      saveSettings({ ...settings, selectedSetIds: allSets.map(s => s.id) });
    }
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isCollapsed ? '64px' : '320px',
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      }}
      className="flex-shrink-0 bg-white/80 dark:bg-neutral-900/50 backdrop-blur-md border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full sticky top-0 overflow-hidden"
    >
      {/* Toggle Button */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-xl transition-all shadow-sm"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pt-12">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-6 lg:p-8 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-400 rounded-xl text-neutral-900">
                    <Clock size={20} strokeWidth={2.5} />
                  </div>
                  <h1 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Daily Review</h1>
                </div>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Study a personalized subset of cards from your library.
                </p>
              </div>

              {/* Configuration */}
              <div className="p-6 lg:p-8 space-y-8 flex-1">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">Daily Goal</h3>
                  <div className="p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-neutral-500">Cards per session</span>
                      <span className="text-sm font-black text-neutral-900 dark:text-white">{settings.dailyCount}</span>
                    </div>
                    <input 
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={settings.dailyCount}
                      onChange={(e) => saveSettings({ ...settings, dailyCount: parseInt(e.target.value) })}
                      className="w-full accent-yellow-400"
                    />
                  </div>
                </div>

                <div className="space-y-4 flex flex-col min-h-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">Source Sets</h3>
                    <button 
                      onClick={toggleAll}
                      className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 hover:underline transition-all"
                    >
                      {settings.selectedSetIds.length === allSets.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {allSets.map((set) => {
                      const isSelected = settings.selectedSetIds.includes(set.id);
                      return (
                        <button
                          key={set.id}
                          onClick={() => toggleSet(set.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                            isSelected
                              ? 'bg-yellow-400/10 border-yellow-400/30'
                              : 'bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                          }`}
                        >
                          <div className="flex flex-col items-start overflow-hidden">
                            <span className={`text-[11px] font-bold truncate w-full text-left ${isSelected ? 'text-neutral-900 dark:text-yellow-400' : 'text-neutral-500'}`}>
                              {set.title}
                            </span>
                          </div>
                          {isSelected && <Check size={14} className="text-yellow-500 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 space-y-3">
                  <button
                    onClick={() => setIsConfirmOpen(true)}
                    className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-neutral-900/10"
                  >
                    <RotateCcw size={14} />
                    Regenerate Set
                  </button>
                </div>
              </div>

              <div className="p-6 lg:p-8 mt-auto border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-4 text-neutral-400 grayscale opacity-50">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <Settings size={16} />
                  </div>
                  <div className="text-[10px] font-bold">Sort Logic & Keybinds in Mode Settings</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          onGenerate();
        }}
        title="Regenerate Session?"
        message="This will pick a new set of cards for today. Your progress for the current session will be lost."
        confirmText="Regenerate"
        variant="warning"
      />
    </motion.aside>
  );
};

export default DailyReviewDashboard;
