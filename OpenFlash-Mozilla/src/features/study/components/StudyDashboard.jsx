import React, { useState } from 'react';
import { Edit3, Trash2, Settings, Plus, Layout as LayoutIcon, Brain, Keyboard, X, PanelLeftClose, PanelLeftOpen, HelpCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import * as Icons from 'lucide-react';

const iconOptions = ['Brain', 'Book', 'FlaskConical', 'Divide', 'Code', 'Globe', 'Music', 'Trophy'];
const colorOptions = ['#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b', '#ec4899'];

const StudyDashboard = ({ studySet, activeMode, setActiveMode, onUpdate, onDelete, onResetMastery }) => {
  const navigate = useNavigate();
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [newTag, setNewTag] = useState('');

  const modes = [
    { id: 'flashcards', label: 'Flashcards', desc: 'Classic review', icon: LayoutIcon },
    { id: 'sort', label: 'Sort Mode', desc: 'Custom schedule', icon: Brain },
    { id: 'type', label: 'Type Mode', desc: 'Test your recall', icon: Keyboard },
  ];

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim()) {
      const currentTags = studySet.tags || [];
      if (!currentTags.includes(newTag.trim())) {
        onUpdate({ tags: [...currentTags, newTag.trim()] });
      }
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const removeTag = (tagToRemove) => {
    const currentTags = studySet.tags || [];
    onUpdate({ tags: currentTags.filter(t => t !== tagToRemove) });
  };

  if (!studySet) return null;

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isCollapsed ? '64px' : '320px',
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      }}
      className="flex-shrink-0 bg-white/80 dark:bg-neutral-900/50 backdrop-blur-md border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full sticky top-0 overflow-hidden pb-20"
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
              {/* Set Header */}
              <div className="p-4 lg:p-6 pb-2">
                <h1 className="text-xl lg:text-2xl font-black text-neutral-900 dark:text-white mb-2 leading-tight">{studySet.title}</h1>
                <p className="text-neutral-500 text-xs lg:text-sm leading-relaxed">{studySet.description || "No description provided."}</p>
              </div>

              {/* Management */}
              <div className="p-4 lg:p-6 pb-2 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-4">Management</h3>
                <div className="grid grid-cols-2 gap-2 lg:gap-3">
                  <button 
                    onClick={() => navigate(`/edit/${studySet.id}`)}
                    className="flex items-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-xl text-[10px] lg:text-xs font-bold transition-all"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button 
                    onClick={onDelete}
                    className="flex items-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[10px] lg:text-xs font-bold transition-all"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
                
                <div className="relative group/help">
                  <button 
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-xl text-[10px] lg:text-xs font-bold transition-all"
                  >
                    <RotateCcw size={14} /> Reset Mastery
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-neutral-900 text-white text-[9px] font-medium rounded-lg opacity-0 group-hover/help:opacity-100 pointer-events-none transition-opacity shadow-xl border border-neutral-800 z-[100]">
                    Resetting mastery will move all cards back to bucket 0. This makes them highly prioritized in Daily Review and Sort Mode until you master them again.
                  </div>
                </div>
              </div>

              {/* Modes */}
              <div className="p-4 lg:p-6 pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-4">Study Modes</h3>
                <div className="space-y-2">
                  {modes.map((mode) => {
                    const IconComp = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setActiveMode(mode.id)}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                        className={`w-full flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-2xl transition-all duration-200 text-left outline-none focus:outline-none border ${
                          activeMode === mode.id 
                            ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 shadow-xl opacity-100 grayscale-0' 
                            : 'bg-transparent border-transparent grayscale opacity-60 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:grayscale-0 hover:opacity-100'
                        }`}
                      >
                        <div className={`p-2 lg:p-2.5 rounded-xl ${activeMode === mode.id ? 'bg-yellow-400 text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                          <IconComp className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
                        </div>
                        <div>
                          <div className={`text-xs lg:text-sm font-bold ${activeMode === mode.id ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>{mode.label}</div>
                          <div className="text-[9px] lg:text-[10px] text-neutral-500 font-medium">{mode.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Appearance */}
              <div className="p-4 lg:p-6 pb-2 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-4">Appearance</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 lg:gap-3">
                    {iconOptions.map((iconName) => {
                      const IconComp = Icons[iconName] || Icons.HelpCircle;
                      const isSelected = studySet.icon === iconName.toLowerCase();
                      return (
                        <button
                          key={iconName}
                          onClick={() => onUpdate({ icon: iconName.toLowerCase() })}
                          className={`flex items-center justify-center aspect-square rounded-xl transition-all ${
                            isSelected 
                              ? 'bg-yellow-400 text-neutral-900 shadow-lg shadow-yellow-400/20 scale-110 z-10' 
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-300'
                          }`}
                        >
                          <IconComp className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-6 gap-2 lg:gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => onUpdate({ iconColor: color })}
                        className={`aspect-square rounded-xl border-2 transition-all ${
                          studySet.iconColor === color ? 'border-neutral-900 dark:border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105 hover:border-neutral-700'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="p-4 lg:p-6 pb-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">Tags</h3>
                  <button 
                    onClick={() => setIsAddingTag(!isAddingTag)}
                    className={`p-1.5 rounded-md transition-colors ${isAddingTag ? 'bg-yellow-400 text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-yellow-600 dark:hover:text-yellow-400'}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {isAddingTag && (
                  <form onSubmit={handleAddTag} className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <input
                      autoFocus
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onBlur={() => !newTag && setIsAddingTag(false)}
                      placeholder="Tag name..."
                      className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-yellow-400 transition-colors"
                    />
                  </form>
                )}

                <div className="flex flex-wrap gap-2">
                  {(studySet.tags || []).map((tag, i) => (
                    <span 
                      key={i} 
                      className="group flex items-center px-4 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 rounded-full text-xs font-bold border border-neutral-200 dark:border-neutral-700/50 transition-all cursor-default"
                    >
                      {tag}
                      <div className="w-0 overflow-hidden group-hover:w-4 group-hover:ml-2 transition-all duration-300 flex items-center justify-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTag(tag);
                          }}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </span>
                  ))}
                  {(!studySet.tags || studySet.tags.length === 0) && !isAddingTag && (
                    <span className="text-[10px] text-neutral-600 italic">No tags added</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ConfirmModal 
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          onResetMastery();
          setIsResetConfirmOpen(false);
          window.location.reload(); // Force reload to refresh UI states
        }}
        title="Reset Global Mastery?"
        message="This will clear your SRS progress for all cards in this set. They will be treated as new cards in Daily Review and Sort Mode."
        confirmText="Reset Progress"
        variant="warning"
      />
    </motion.aside>
  );
};

export default StudyDashboard;
