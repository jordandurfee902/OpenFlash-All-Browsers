import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown, MessageCircle, Mail, Send } from 'lucide-react';

const FAQ_DATA = [
  {
    question: "How do I sync my flashcards across devices?",
    answer: "To sync your data, go to the Account page and log in with your Google account. Use the 'Upload to Cloud' and 'Download from Cloud' buttons to keep your devices in sync."
  },
  {
    question: "What is the Daily Review?",
    answer: "The Daily Review is a personalized study session that picks a subset of cards from your library based on what you need to study most. It prioritizes cards you've struggled with and ensures you review older material to keep it fresh in your memory."
  },
  {
    question: "How does 'Sort Mode' work?",
    answer: "Sort Mode uses a probability-based Leitner System (Bucket Method). When you get a card right, it moves up a mastery bucket. When you get it wrong, it resets to bucket 0. Cards in lower buckets appear much more frequently until you master them."
  },
  {
    question: "What is 'Type Mode'?",
    answer: "Type Mode tests your active recall by requiring you to type out the answer. It features smart grading that can ignore minor typos, punctuation, and capitalization based on your difficulty settings."
  },
  {
    question: "Are Daily Review and Sort Mode progress shared?",
    answer: "Yes! Your mastery progress is global. If you master a card in Sort Mode, that progress is reflected across the entire app. Daily Review sessions use this global data to pick the best cards for your daily study goal."
  },
  {
    question: "Can I customize the difficulty of my reviews?",
    answer: "Absolutely. In the settings of each mode, you can adjust the 'Mastery Threshold' (how many times you need to get a card right to master it) and the 'Rescheduling Aggression' (how aggressively the app prioritizes difficult cards)."
  },
  {
    question: "Can I use the extension offline?",
    answer: "Yes! All your flashcard sets are stored locally in your browser's database. You can study, create, and edit sets even without an internet connection. Syncing only requires an internet connection when you want to backup or restore data."
  },
  {
    question: "How do I import sets from Quizlet?",
    answer: "When you visit a Quizlet set page, the OpenFlash banner will appear at the top. Click 'Add to Library' to instantly save the set to your local library, including any images."
  },
  {
    question: "How do I import sets from Knowt?",
    answer: "Visit any Knowt set page and the OpenFlash banner will appear at the top. Click 'Add to Library' to import the cards and images."
  },
  {
    question: "How do I import sets from Brainscape?",
    answer: "To extract cards from Brainscape, you must be logged into your account and navigate to the 'Preview' section of a deck (where you can scroll through all the cards). The OpenFlash banner will appear automatically once you are in the preview view."
  }
];

const HelpPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="inline-flex items-center justify-center p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl mb-4">
          <HelpCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h1 className="text-4xl font-black text-neutral-900 dark:text-white mb-3">Help & Support</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-xl mx-auto">
          Need assistance? Check our FAQs below or get in touch with our team.
        </p>
      </motion.header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-3">
          <ChevronDown className="w-6 h-6 text-yellow-500" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {FAQ_DATA.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:border-yellow-200 dark:hover:border-yellow-900/50 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <span className="font-bold text-neutral-800 dark:text-neutral-200">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="p-5 pt-0 text-neutral-600 dark:text-neutral-400 bg-neutral-50/50 dark:bg-neutral-800/30"
                >
                  <p className="leading-relaxed">{faq.answer}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-3xl shadow-xl shadow-yellow-500/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-black text-neutral-900 mb-4 flex items-center gap-3">
              <MessageCircle className="w-8 h-8" />
              Contact Us
            </h2>
            <p className="text-neutral-900/80 mb-6 font-medium">
              Have a specific question or found a bug? Get in touch with us directly.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-neutral-900">
                <div className="p-2 bg-neutral-900/10 rounded-lg">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-bold">support.openflash@protonmail.com</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <a
              href="mailto:support.openflash@protonmail.com"
              className="px-8 py-4 bg-neutral-900 text-white font-black rounded-2xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 group active:scale-[0.98] shadow-2xl shadow-black/20 text-lg"
            >
              Email OpenFlash!
              <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HelpPage;
