import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCreateSet } from '../../../hooks/useCreateSet';
import CardRow from './CardRow';
import ImportSection from './ImportSection';
import { Plus, Save, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CreateSetPage = () => {
  const { id } = useParams();
  const {
    title, setTitle,
    description, setDescription,
    cards, setCards,
    addCard, removeCard, updateCard,
    saveSet,
    loading, isEditMode
  } = useCreateSet(id);

  const [activeTab, setActiveTab] = useState('manual');

  const handleImport = (newTitle, newCards) => {
    setTitle(newTitle);
    setCards(newCards);
    setActiveTab('manual');
  };

  if (loading && isEditMode) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-12 pb-32">
      <header className="mb-8 md:mb-12 space-y-4 md:space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft size={16} /> Back to Library
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title, like 'Biology 101'"
              className="w-full bg-transparent text-2xl md:text-3xl lg:text-4xl font-black text-neutral-900 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-700 outline-none border-b-2 border-neutral-200 dark:border-neutral-800 focus:border-yellow-500 dark:focus:border-yellow-400 transition-all py-2"
            />
          </div>

          <button
            onClick={saveSet}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-yellow-400 text-neutral-900 rounded-2xl font-bold hover:bg-yellow-300 shadow-xl shadow-yellow-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group h-fit whitespace-nowrap"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-neutral-900/20 border-t-neutral-900 rounded-full animate-spin" />
            ) : (
              <Save size={20} className="group-hover:scale-110 transition-transform" />
            )}
            {isEditMode ? 'Update Set' : 'Save Set'}
          </button>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description (optional)"
          className="w-full bg-transparent text-neutral-600 dark:text-neutral-400 placeholder-neutral-300 dark:placeholder-neutral-800 outline-none resize-none h-12 focus:text-neutral-900 dark:focus:text-neutral-200 transition-all"
        />
      </header>

      <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-900/50 p-1 rounded-2xl mb-8 w-fit">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'manual' 
              ? 'bg-white dark:bg-neutral-800 text-yellow-600 dark:text-yellow-400 shadow-sm dark:shadow-lg' 
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
          }`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'import' 
              ? 'bg-white dark:bg-neutral-800 text-yellow-600 dark:text-yellow-400 shadow-sm dark:shadow-lg' 
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
          }`}
        >
          Import File
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'manual' ? (
          <motion.div
            key="manual"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {cards.map((card, index) => (
                <CardRow
                  key={card.id}
                  index={index}
                  card={card}
                  onUpdate={updateCard}
                  onDelete={removeCard}
                />
              ))}
            </div>

            <button
              onClick={addCard}
              className="w-full py-6 md:py-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center gap-2 text-neutral-500 hover:border-yellow-500/50 dark:hover:border-yellow-400/50 hover:bg-yellow-500/5 dark:hover:bg-yellow-400/5 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all group"
            >
              <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-bold uppercase tracking-widest text-sm">Add Card</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="import"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ImportSection onImport={handleImport} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateSetPage;
