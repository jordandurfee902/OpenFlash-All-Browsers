import React, { useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';

const TypeInputArea = ({ 
  value, 
  onChange, 
  disabled, 
  onOpenSettings,
  placeholder = "Type your answer here..."
}) => {
  const inputRef = useRef(null);

  // Auto-focus logic
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  return (
    <div className="w-full max-w-xl mx-auto mt-6 flex items-center gap-4">
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white px-5 py-3 rounded-2xl focus:outline-none focus:border-yellow-500/50 dark:focus:border-yellow-400/50 transition-all disabled:opacity-50 text-base font-medium placeholder-neutral-400 dark:placeholder-neutral-600"
          autoComplete="off"
          spellCheck="false"
        />
        
        <button
          onClick={onOpenSettings}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5"
          title="Settings"
          type="button"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};

export default TypeInputArea;
