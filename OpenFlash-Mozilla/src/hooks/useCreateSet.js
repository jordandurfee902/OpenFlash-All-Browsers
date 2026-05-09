import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useCreateSet = (editId = null) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState([
    { id: Date.now(), term: '', definition: '', imageId: null, imagePreview: null, imageFile: null }
  ]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (editId) {
      setIsEditMode(true);
      setLoading(true);
      chrome.storage.local.get(['flashcardSets'], async (result) => {
        const sets = result.flashcardSets || [];
        const setToEdit = sets.find(s => s.id == editId);
        
        if (setToEdit) {
          setTitle(setToEdit.title);
          setDescription(setToEdit.description || '');
          
          const processedCards = await Promise.all(setToEdit.cards.map(async (card) => {
            let imagePreview = null;
            if (card.imageId) {
              imagePreview = await window.openFlashDB.getImage(card.imageId);
            }
            return {
              ...card,
              imagePreview,
              imageFile: null
            };
          }));
          
          setCards(processedCards);
        }
        setLoading(false);
      });
    }
  }, [editId]);

  const addCard = () => {
    setCards([...cards, { id: Date.now(), term: '', definition: '', imageId: null, imagePreview: null, imageFile: null }]);
  };

  const removeCard = (id) => {
    if (cards.length > 1) {
      setCards(cards.filter(c => c.id !== id));
    } else {
      // Clear first card if it's the last one
      setCards([{ id: Date.now(), term: '', definition: '', imageId: null, imagePreview: null, imageFile: null }]);
    }
  };

  const updateCard = (id, updates) => {
    setCards(cards.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const saveSet = async () => {
    if (!title.trim()) {
      alert("Please enter a title for your set.");
      return;
    }

    const validCards = cards.filter(c => c.term.trim() || c.definition.trim() || c.imageFile || c.imageId);
    if (validCards.length === 0) {
      alert("Please add at least one card with content.");
      return;
    }

    setLoading(true);

    try {
      const processedCards = await Promise.all(validCards.map(async (card) => {
        let imageId = card.imageId;
        
        // Save new image if file exists
        if (card.imageFile) {
          imageId = await window.openFlashDB.saveImage(card.imageFile);
        }
        
        const { imagePreview, imageFile, ...cardData } = card;
        return {
          ...cardData,
          imageId
        };
      }));

      chrome.storage.local.get(['flashcardSets'], (result) => {
        let sets = result.flashcardSets || [];
        
        if (isEditMode) {
          const index = sets.findIndex(s => s.id == editId);
          if (index !== -1) {
            sets[index] = {
              ...sets[index],
              title: title.trim(),
              description: description.trim(),
              cards: processedCards
            };
          }
        } else {
          const newSet = {
            id: "manual-" + Date.now(),
            title: title.trim(),
            description: description.trim(),
            cards: processedCards,
            tags: ["Manual"],
            icon: "book",
            createdAt: new Date().toISOString()
          };
          sets.unshift(newSet);
        }

        chrome.storage.local.set({ flashcardSets: sets }, () => {
          navigate('/');
        });
      });
    } catch (error) {
      console.error("Failed to save set:", error);
      alert("Error saving set. Please try again.");
      setLoading(false);
    }
  };

  return {
    title, setTitle,
    description, setDescription,
    cards, setCards,
    addCard, removeCard, updateCard,
    saveSet,
    loading, isEditMode
  };
};
