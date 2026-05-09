import { Plus, Clock } from 'lucide-react';
import SetCard from './SetCard';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SetGrid = ({ sets }) => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/daily')}
        className="bg-white dark:bg-neutral-900/50 border-2 border-yellow-400/20 dark:border-yellow-400/10 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-yellow-400/50 dark:hover:border-yellow-400/40 hover:bg-yellow-400/[0.03] transition-all group min-h-[200px] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-2 opacity-[0.03] dark:opacity-[0.05] -mr-4 -mt-4 text-neutral-900 dark:text-white group-hover:rotate-12 transition-transform duration-700">
          <Clock size={120} />
        </div>

        <div className="bg-yellow-400/10 dark:bg-yellow-400/5 p-4 rounded-full mb-4 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 group-hover:bg-yellow-400/20 transition-all">
          <Clock size={32} />
        </div>
        <h3 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-wider">Daily Review</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mt-2 px-4 font-medium">
          Study your personalized daily subset
        </p>
      </motion.div>

      {sets.map((set) => (
        <SetCard key={set.id} set={set} />
      ))}

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/create')}
        className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-yellow-500/50 dark:hover:border-yellow-400/50 hover:bg-yellow-400/5 transition-all group min-h-[200px]"
      >
        <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-full mb-4 text-neutral-500 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-800 transition-all">
          <Plus size={32} />
        </div>
        <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">Create New Set</h3>
        <p className="text-sm text-neutral-500 text-center mt-2 px-4">
          Add a new flashcard set to your collection
        </p>
      </motion.div>
    </div>
  );
};

export default SetGrid;
