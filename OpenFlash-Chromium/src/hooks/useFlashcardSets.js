import { useState, useEffect } from 'react';

export const useFlashcardSets = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSets = () => {
      chrome.storage.local.get(['flashcardSets', 'flashcards'], (result) => {
        let sets = result.flashcardSets || [];
        
        // Handle legacy flashcards if sets don't exist yet
        if (result.flashcards && result.flashcards.length > 0 && sets.length === 0) {
          sets = [{
            id: 'default',
            title: 'Default Set',
            description: 'Cards added via the quick-add menu.',
            cards: result.flashcards
          }];
          chrome.storage.local.set({ flashcardSets: sets });
        }
        
        setFlashcardSets(sets);
        setLoading(false);
      });
    };

    fetchSets();

    const handleStorageChange = (changes, namespace) => {
      if (namespace === 'local' && changes.flashcardSets) {
        setFlashcardSets(changes.flashcardSets.newValue || []);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  return { flashcardSets, loading };
};
