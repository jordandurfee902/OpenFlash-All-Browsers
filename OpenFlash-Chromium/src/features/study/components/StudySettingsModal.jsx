import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { Keyboard, Shuffle, Save, Repeat } from 'lucide-react';

/**
 * StudySettingsModal
 * Manages study-specific configurations like keybinds and the 'Answer with Term' mode.
 */

const StudySettingsModal = ({ isOpen, onClose, currentSettings, onSave, onShuffle }) => {
  const [settings, setSettings] = useState(JSON.parse(JSON.stringify(currentSettings)));
  const [listeningKey, setListeningKey] = useState(null);

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
    { label: 'Next Card', key: 'next' },
    { label: 'Previous Card', key: 'prev' },
    { label: 'Flip Card', key: 'flip' },
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Study Settings"
      maxWidth="max-w-md"
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-neutral-500">
            <Keyboard size={16} />
            <h3 className="text-xs font-black uppercase tracking-widest">Keybinds</h3>
          </div>
          
          <div className="grid gap-3">
            {keybindOptions.map((opt) => (
              <div key={opt.key} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-400">{opt.label}</span>
                <button
                  onClick={() => setListeningKey(opt.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-black min-w-[6rem] transition-all border ${
                      listeningKey === opt.key
                      ? 'bg-yellow-400 text-neutral-900 border-yellow-400 animate-pulse'
                      : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-500'
                  }`}
                >
                  {listeningKey === opt.key ? 'Listening...' : settings.keybinds[opt.key]}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={() => {
              onShuffle();
              onClose();
            }}
            className="w-full py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all border border-neutral-200 dark:border-neutral-700"
          >
            <Shuffle size={18} />
            Shuffle Deck
          </button>

          <button
            onClick={() => setSettings({ ...settings, autoFlip: !settings.autoFlip })}
            className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border ${
              settings.autoFlip 
                ? 'bg-yellow-400 text-neutral-900 border-yellow-400 shadow-lg shadow-yellow-400/10' 
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            <Repeat size={18} />
            Answer with Term
          </button>

          <button
            onClick={() => onSave(settings)}
            className="w-full py-4 bg-yellow-400 text-neutral-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/10"
          >
            <Save size={18} />
            Save Settings
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default StudySettingsModal;
