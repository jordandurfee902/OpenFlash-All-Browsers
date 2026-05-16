import { useState, useEffect } from 'react';
import { FlashcardSet, StorageService } from '@/services/storage';

export const useFlashcardSets = () => {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSets = async () => {
    setLoading(true);
    const sets = await StorageService.getSets();
    setFlashcardSets(sets);
    setLoading(false);
  };

  useEffect(() => {
    fetchSets();
  }, []);

  return { flashcardSets, loading, refreshSets: fetchSets };
};
