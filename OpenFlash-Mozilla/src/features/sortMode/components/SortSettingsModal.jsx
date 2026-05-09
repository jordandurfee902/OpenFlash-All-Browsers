import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { Keyboard, Brain, Zap, Save, RotateCcw } from 'lucide-react';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const AGGRESSION_LEVELS = [
  { id: 'relaxed', label: 'Relaxed', desc: 'Mixes old and new cards evenly' },
  { id: 'normal', label: 'Normal', desc: 'Focuses on unlearned cards' },
  { id: 'aggressive', label: 'Aggressive', desc: 'Heavily prioritizes failed cards' }
];

const SortSettingsModal = ({ isOpen, onClose, currentSettings, onSave, onRestart }) => {
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
    { label: 'Correct', key: 'correct' },
    { label: 'Incorrect', key: 'incorrect' },
    { label: 'Somewhat', key: 'somewhat' },
    { label: 'Flip Card', key: 'flip' },
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Sort Mode Settings"
      maxWidth="max-w-md"
    >
      <div className="max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
        <div className="space-y-8">
        {/* Mastery Threshold */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-neutral-500">
            <Brain size={16} />
            <h3 className="text-xs font-black uppercase tracking-widest">Mastery Threshold</h3>
          </div>
          <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-400">Wins to Master</span>
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

        {/* Actions */}
        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="w-full py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all border border-neutral-200 dark:border-neutral-700"
          >
            <RotateCcw size={18} />
            Restart Session
          </button>

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

export default SortSettingsModal;
