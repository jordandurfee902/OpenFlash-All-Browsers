import React, { useRef, useState } from 'react';
import { Upload, FileType, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImportSection = ({ onImport }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleFile = async (file) => {
    setStatus('loading');
    const extension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        let cards = [];

        if (extension === 'json') {
          const data = JSON.parse(text);
          cards = Array.isArray(data) ? data : (data.cards || []);
        } else {
          // CSV / TXT parsing
          const lines = text.split(/\r?\n/);
          lines.forEach(line => {
            if (!line.trim()) return;
            let parts = line.split(/[,\t;]/);
            if (parts.length >= 2) {
              cards.push({
                term: parts[0].trim(),
                definition: parts.slice(1).join(',').trim()
              });
            }
          });
        }

        if (cards.length > 0) {
          // Process cards (fetching images if URLs provided)
          const processedCards = await Promise.all(cards.map(async (c) => {
            const card = {
              id: Date.now() + Math.random(),
              term: c.term || c.word || "No Term",
              definition: c.definition || c.def || c.meaning || "",
              imageId: null,
              imagePreview: null,
              imageFile: null
            };

            const imgUrl = c.image || c.imageUrl;
            if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
              try {
                const response = await fetch(imgUrl);
                const blob = await response.blob();
                card.imageFile = blob;
                card.imagePreview = URL.createObjectURL(blob);
              } catch (e) {
                console.warn("Failed to fetch imported image:", e);
              }
            }
            return card;
          }));

          onImport(file.name.replace(/\.[^/.]+$/, ""), processedCards);
          setStatus('success');
          setTimeout(() => setStatus('idle'), 2000);
        } else {
          throw new Error("No cards found");
        }
      } catch (error) {
        console.error("Import error:", error);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    };

    reader.readAsText(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[350px] ${
          isDragging 
            ? 'border-yellow-400 bg-yellow-400/5 scale-[1.02]' 
            : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          className="hidden" 
          accept=".csv,.txt,.json"
        />

        <AnimatePresence mode="wait">
          {status === 'loading' ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mb-4" />
              <p className="text-neutral-400 font-medium">Processing your deck...</p>
            </motion.div>
          ) : status === 'success' ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center text-green-400"
            >
              <CheckCircle2 size={64} className="mb-4" />
              <p className="text-lg font-bold">Import Successful!</p>
            </motion.div>
          ) : status === 'error' ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center text-red-400"
            >
              <AlertCircle size={64} className="mb-4" />
              <p className="text-lg font-bold">Import Failed</p>
              <p className="text-sm opacity-60">Check your file format and try again.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-2xl mb-6 text-neutral-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                <Upload size={48} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Upload your flashcards</h3>
              <p className="text-neutral-500 max-w-sm">
                Drag and drop or click to upload your existing decks from <span className="text-neutral-700 dark:text-neutral-300 font-medium">CSV, TXT, or JSON</span> files.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4 text-yellow-600 dark:text-yellow-400">
            <FileType size={20} />
            <h4 className="font-bold uppercase text-xs tracking-widest">CSV / TXT Format</h4>
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Ensure each line follows the <code className="text-neutral-800 dark:text-neutral-200">term, definition</code> pattern. We also support tabs or semicolons as separators.
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4 text-yellow-600 dark:text-yellow-400">
            <FileType size={20} />
            <h4 className="font-bold uppercase text-xs tracking-widest">JSON Format</h4>
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Format as an array of objects: <code className="text-neutral-800 dark:text-neutral-200">[{"{term: '...', definition: '...'}"}]</code>. You can even include image URLs!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportSection;
