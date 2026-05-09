import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { Keyboard, Brain, Zap, Save, RotateCcw, Settings2, RefreshCw } from 'lucide-react';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const AGGRESSION_LEVELS = [
  { id: 'relaxed', label: 'Relaxed', desc: 'Mixes old and new cards evenly' },
  { id: 'normal', label: 'Normal', desc: 'Focuses on unlearned cards' },
  { id: 'aggressive', label: 'Aggressive', desc: 'Heavily prioritizes failed cards' }
];

const DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Easy', desc: '75% match required' },
  { id: 'medium', label: 'Medium', desc: '85% match required' },
  { id: 'hard', label: 'Hard', desc: '100% exact match' }
];

const TypeSettingsModal = ({ isOpen, onClose, currentSettings, onSave, onRestart, onSwap, swapActive }) => {
  const [settings, setSettings] = useState(JSON.parse(JSON.stringify(currentSettings)));
  const [listeningKey, setListeningKey] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(JSON.parse(JSON.stringify(currentSettings)));
      setListeningKey(null);
    }
  }, [isOpen, currentSettings]);

  useEffect(() => {
    if (!listeningKey) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const newSettings = { ...settings };
      newSettings.keybinds[listeningKey] = e.code;
      
      setSettings(newSettings);
      setListeningKey(null);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [listeningKey, settings]);

  const keybindOptions = [
    { label: 'Submit', key: 'submit' },
    { label: 'Override', key: 'override' },
    { label: 'Flip (Peek)', key: 'flip' },
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Type Mode Settings"
      maxWidth="max-w-md"
    >
      <div className="max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
        <div className="space-y-8">
        
        {/* Top Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="flex-1 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all border border-neutral-200 dark:border-neutral-700"
          >
            <RotateCcw size={16} />
            Restart
          </button>
          
          <button
            onClick={() => {
              onSwap();
            }}
            className={`flex-1 py-3 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 transition-all border ${
              swapActive 
                ? 'bg-yellow-400 text-neutral-900 border-yellow-400' 
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            <RefreshCw size={16} className={swapActive ? 'animate-spin-once' : ''} />
            Swap T/D
          </button>
        </div>

        {/* Grading Strictness */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-neutral-500">
            <Settings2 size={16} />
            <h3 className="text-xs font-black uppercase tracking-widest">Grading Strictness</h3>
          </div>
          
          <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
            <label className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800/50 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900/50">
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-300">Require Exact Case</span>
              <input 
                type="checkbox" 
                checked={settings.grading.uppercase}
                onChange={(e) => setSettings({
                  ...settings, 
                  grading: { ...settings.grading, uppercase: e.target.checked }
                })}
                className="w-5 h-5 accent-yellow-400 rounded bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
              />
            </label>
            <label className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800/50 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900/50">
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-300">Require Punctuation</span>
              <input 
                type="checkbox" 
                checked={settings.grading.punctuation}
                onChange={(e) => setSettings({
                  ...settings, 
                  grading: { ...settings.grading, punctuation: e.target.checked }
                })}
                className="w-5 h-5 accent-yellow-400 rounded bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
              />
            </label>
            <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900/50">
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-300">Require Accents</span>
              <input 
                type="checkbox" 
                checked={settings.grading.special}
                onChange={(e) => setSettings({
                  ...settings, 
                  grading: { ...settings.grading, special: e.target.checked }
                })}
                className="w-5 h-5 accent-yellow-400 rounded bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => setSettings({
                  ...settings, 
                  grading: { ...settings.grading, difficulty: level.id }
                })}
                className={`flex flex-col items-center text-center p-3 border rounded-xl transition-all ${
                  settings.grading.difficulty === level.id
                    ? 'bg-yellow-400/10 border-yellow-400/50'
                    : 'bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <span className={`text-xs font-bold ${settings.grading.difficulty === level.id ? 'text-yellow-600 dark:text-yellow-400' : 'text-neutral-900 dark:text-neutral-300'}`}>
                  {level.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mastery Threshold */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-neutral-500">
            <Brain size={16} />
            <h3 className="text-xs font-black uppercase tracking-widest">Mastery Threshold</h3>
          </div>
          <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
            <span className="text-sm font-bold text-neutral-400">Wins to Master</span>
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setSettings({ ...settings, masteryThreshold: num })}
                  className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                    settings.masteryThreshold === num
                      ? 'bg-yellow-400 text-neutral-900 shadow-lg shadow-yellow-400/20'
                      : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Aggression */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-neutral-500">
            <Zap size={16} />
            <h3 className="text-xs font-black uppercase tracking-widest">Rescheduling Aggression</h3>
          </div>
          <div className="grid gap-2">
            {AGGRESSION_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => setSettings({ ...settings, aggression: level.id })}
                className={`flex flex-col items-start p-4 border rounded-2xl transition-all ${
                  settings.aggression === level.id
                    ? 'bg-yellow-400/10 border-yellow-400/50'
                    : 'bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <span className={`text-sm font-bold ${settings.aggression === level.id ? 'text-yellow-600 dark:text-yellow-400' : 'text-neutral-900 dark:text-neutral-300'}`}>
                  {level.label}
                </span>
                <span className="text-[10px] text-neutral-500">{level.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Keybinds */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-neutral-500">
            <Keyboard size={16} />
            <h3 className="text-xs font-black uppercase tracking-widest">Keybinds</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {keybindOptions.map((opt) => (
              <div key={opt.key} className="flex flex-col gap-2 p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">{opt.label}</span>
                <button
                  onClick={() => setListeningKey(opt.key)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all border ${
                    listeningKey === opt.key
                      ? 'bg-yellow-400 text-neutral-900 border-yellow-400 animate-pulse'
                      : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500'
                  }`}
                >
                  {listeningKey === opt.key ? 'LISTENING...' : settings.keybinds[opt.key]}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="pt-4">
          <button
            onClick={() => onSave(settings)}
            className="w-full py-4 bg-yellow-400 text-neutral-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-yellow-300 transition-all"
          >
            <Save size={18} />
            Save Settings
          </button>
        </div>
        
        </div>
      </div>
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          onRestart();
          onClose();
        }}
        title="Restart Session?"
        message="Are you sure you want to restart? All current mastery progress for this session will be lost."
        confirmText="Restart"
        variant="danger"
      />
    </Modal>
  );
};

export default TypeSettingsModal;
