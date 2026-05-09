import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import StudyDashboard from './StudyDashboard';
import { useStudySet } from '../../../hooks/useStudySet';
import { BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import FlashcardEngine from './FlashcardEngine';
import SortModeEngine from '../../sortMode/components/SortModeEngine';
import TypeModeEngine from '../../typeMode/components/TypeModeEngine';
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal';

const StudyPage = () => {
  const { id } = useParams();
  const { studySet, loading, updateSet, deleteSet, resetMastery } = useStudySet(id);
  const [activeMode, setActiveMode] = useState('flashcards');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!studySet) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl font-black text-neutral-900 dark:text-white mb-4">Set not found</h2>
        <p className="text-neutral-400 mb-8 max-w-md">The flashcard set you are looking for doesn't exist or has been deleted.</p>
        <Link to="/" className="px-8 py-4 bg-yellow-400 text-neutral-900 rounded-2xl font-bold hover:bg-yellow-300 transition-all">
          Go back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <StudyDashboard 
        studySet={studySet} 
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        onUpdate={updateSet} 
        onDelete={() => setIsDeleteModalOpen(true)} 
        onResetMastery={resetMastery}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteSet}
        title={`Delete "${studySet.title}"?`}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-neutral-50 dark:bg-neutral-950 overflow-hidden relative">
        {activeMode === 'flashcards' ? (
          <FlashcardEngine set={studySet} />
        ) : activeMode === 'sort' ? (
          <SortModeEngine set={studySet} />
        ) : activeMode === 'type' ? (
          <TypeModeEngine set={studySet} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto custom-scrollbar">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl w-full text-center space-y-8"
            >
              <div className="inline-flex p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-yellow-600 dark:text-yellow-400 shadow-2xl shadow-yellow-400/5">
                <BookOpen size={64} strokeWidth={1.5} />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                  {activeMode.charAt(0).toUpperCase() + activeMode.slice(1)} Mode
                </h2>
                <p className="text-neutral-500 text-lg max-w-lg mx-auto leading-relaxed">
                  This study mode is coming soon. Use the Classic Flashcards mode for now!
                </p>
              </div>

              <button 
                onClick={() => setActiveMode('flashcards')}
                className="px-6 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-2xl font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
              >
                Switch to Flashcards
              </button>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyPage;
