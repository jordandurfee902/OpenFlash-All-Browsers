import React, { useRef } from 'react';
import { Trash2, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CardRow = ({ index, card, onUpdate, onDelete }) => {
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onUpdate(card.id, { imageFile: file, imagePreview: previewUrl });
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    onUpdate(card.id, { imageFile: null, imagePreview: null, imageId: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 group hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold text-sm shrink-0">
        {index + 1}
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="relative group/input">
          <input
            type="text"
            value={card.term}
            onChange={(e) => onUpdate(card.id, { term: e.target.value })}
            className="w-full bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 py-2 text-neutral-900 dark:text-white focus:border-yellow-500 dark:focus:border-yellow-400 outline-none transition-colors peer placeholder-transparent"
            placeholder="Term"
            id={`term-${card.id}`}
          />
          <label 
            htmlFor={`term-${card.id}`}
            className="absolute left-0 -top-3.5 text-neutral-500 text-xs uppercase tracking-wider font-bold transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-yellow-600 dark:peer-focus:text-yellow-400 peer-focus:text-xs"
          >
            Term
          </label>
        </div>

        <div className="relative group/input">
          <input
            type="text"
            value={card.definition}
            onChange={(e) => onUpdate(card.id, { definition: e.target.value })}
            className="w-full bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 py-2 text-neutral-900 dark:text-white focus:border-yellow-500 dark:focus:border-yellow-400 outline-none transition-colors peer placeholder-transparent"
            placeholder="Definition"
            id={`def-${card.id}`}
          />
          <label 
            htmlFor={`def-${card.id}`}
            className="absolute left-0 -top-3.5 text-neutral-500 text-xs uppercase tracking-wider font-bold transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-yellow-600 dark:peer-focus:text-yellow-400 peer-focus:text-xs"
          >
            Definition
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-xl transition-all duration-300 ${
              card.imagePreview 
                ? 'bg-yellow-400/10 text-yellow-600 dark:text-yellow-400' 
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
            title="Add Image"
          >
            <ImageIcon size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          
          <AnimatePresence>
            {card.imagePreview && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-2 -right-2 w-12 h-12 rounded-lg border-2 border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900 shadow-xl group/preview"
              >
                <img src={card.imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                <button 
                  onClick={removeImage}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => onDelete(card.id)}
          className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
          title="Delete Card"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default CardRow;
