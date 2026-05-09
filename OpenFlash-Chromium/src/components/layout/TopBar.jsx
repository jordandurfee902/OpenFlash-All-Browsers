import React from 'react';

const TopBar = () => {
  return (
    <nav className="h-14 sm:h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-white/80 dark:bg-neutral-900/50 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="bg-yellow-400 p-2 rounded-lg shadow-lg shadow-yellow-400/20">
          <svg className="w-5 h-5 text-neutral-900" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 10V3L4 14H11V21L20 10H13Z" />
          </svg>
        </div>
        <span className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">OpenFlash</span>
      </div>
      
      <div className="flex items-center gap-4">
        <a 
          href="https://buymeacoffee.com/openflash" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-6 py-2 bg-yellow-400 text-neutral-900 rounded-xl text-sm font-bold hover:bg-yellow-300 shadow-lg shadow-yellow-400/20 transition-all duration-300"
        >
          Donate
        </a>
      </div>
    </nav>
  );
};

export default TopBar;
