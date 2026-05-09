import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setThemeState] = useState('dark');

  useEffect(() => {
    // Load initial theme
    chrome.storage.local.get(['theme'], (result) => {
      if (result.theme) {
        applyTheme(result.theme);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        applyTheme('light');
      } else {
        applyTheme('dark');
      }
    });

    // Listen for changes from other contexts
    const handleStorageChange = (changes, namespace) => {
      if (namespace === 'local' && changes.theme) {
        applyTheme(changes.theme.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const applyTheme = (newTheme) => {
    setThemeState(newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    } else {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    chrome.storage.local.set({ theme: newTheme });
    applyTheme(newTheme);
  };

  return { theme, toggleTheme };
};
