import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useStudySet = (id) => {
  const navigate = useNavigate();
  const [studySet, setStudySet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSet = () => {
      chrome.storage.local.get(['flashcardSets'], (result) => {
        const sets = result.flashcardSets || [];
        const set = sets.find(s => s.id == id);
        if (set) {
          setStudySet(set);
        }
        setLoading(false);
      });
    };

    fetchSet();

    const handleStorageChange = (changes, namespace) => {
      if (namespace === 'local' && changes.flashcardSets) {
        const sets = changes.flashcardSets.newValue || [];
        const set = sets.find(s => s.id == id);
        if (set) setStudySet(set);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [id]);

  const updateSet = (updates) => {
    chrome.storage.local.get(['flashcardSets'], (result) => {
      const sets = result.flashcardSets || [];
      const index = sets.findIndex(s => s.id == id);
      if (index !== -1) {
        sets[index] = { ...sets[index], ...updates };
        chrome.storage.local.set({ flashcardSets: sets });
      }
    });
  };

  const deleteSet = () => {
    chrome.storage.local.get(['flashcardSets'], (result) => {
      const sets = result.flashcardSets || [];
      const newSets = sets.filter(s => s.id != id);
      chrome.storage.local.set({ flashcardSets: newSets }, () => {
        navigate('/');
      });
    });
  };

  const resetMastery = () => {
    chrome.storage.local.get(['sortSessionStates', 'typeSessionStates'], (result) => {
      const sortStates = result.sortSessionStates || {};
      const typeStates = result.typeSessionStates || {};
      
      delete sortStates[id];
      delete typeStates[id];
      
      chrome.storage.local.set({ 
        sortSessionStates: sortStates,
        typeSessionStates: typeStates
      });
    });
  };

  return { studySet, loading, updateSet, deleteSet, resetMastery };
};
