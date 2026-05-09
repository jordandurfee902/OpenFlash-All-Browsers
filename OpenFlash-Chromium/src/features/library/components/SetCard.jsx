import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

const iconMap = {
  brain: 'Brain',
  book: 'Book',
  science: 'FlaskConical',
  flaskconical: 'FlaskConical',
  math: 'Divide',
  divide: 'Divide',
  code: 'Code',
  globe: 'Globe',
  music: 'Music',
  sport: 'Trophy',
  trophy: 'Trophy'
};

const SetCard = ({ set }) => {
  const navigate = useNavigate();
  const IconComponent = Icons[iconMap[set.icon]] || Icons.Layers;
  const bgColor = set.iconColor || 'rgba(255, 215, 0, 0.1)';
  const fgColor = set.iconColor ? 'white' : '#fbbf24';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/study/${set.id}`)}
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors group"
    >
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-inner"
        style={{ backgroundColor: bgColor, color: fgColor }}
      >
        <IconComponent size={28} />
      </div>
      
      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
        {set.title}
      </h3>
      
      <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 line-clamp-2 leading-relaxed">
        {set.description || "No description provided."}
      </p>
      
      <div className="flex flex-wrap gap-2 mt-auto">
        <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-full text-xs font-semibold border border-neutral-200 dark:border-neutral-700">
          {set.cards.length} Cards
        </span>
        {(set.tags || []).map((tag, i) => (
          <span key={i} className="px-3 py-1 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 rounded-full text-xs border border-neutral-200 dark:border-neutral-800">
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default SetCard;
