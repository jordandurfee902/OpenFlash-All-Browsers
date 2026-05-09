import React, { useState, useEffect } from 'react';

/**
 * Flashcard
 * Displays the front (term) or back (definition/image) of a card.
 * Handles image retrieval from IndexedDB via window.openFlashDB.
 */

const Flashcard = ({ card, isFlipped, onFlip, status, swapActive = false }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    let objectUrl = null;

    const loadImage = async () => {
      // Safety check for global DB object
      if (!window.openFlashDB) {
        console.warn("openFlashDB not found on window. Images may not load.");
        if (card.imageUrl) setImageUrl(card.imageUrl);
        return;
      }

      if (card.imageId) {
        try {
          const imageBlob = await window.openFlashDB.getImageBlob(card.imageId);
          if (imageBlob) {
            objectUrl = URL.createObjectURL(imageBlob);
            setImageUrl(objectUrl);
          }
        } catch (err) {
          console.error("Failed to load image from DB:", err);
        }
      } else if (card.imageUrl) {
        setImageUrl(card.imageUrl);
      } else {
        setImageUrl(null);
      }
    };

    loadImage();

    // Cleanup object URL to prevent memory leaks
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [card]);

  const getStatusClasses = () => {
    if (status === 'correct') return 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]';
    if (status === 'incorrect') return 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]';
    if (status === 'somewhat') return 'border-yellow-500 shadow-[0_0_40px_rgba(245,158,11,0.2)]';
    return 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700';
  };

  return (
    <div 
      onClick={onFlip}
      className="w-full max-w-xl lg:max-w-2xl xl:max-w-3xl aspect-[3/2] cursor-pointer group perspective-1000"
    >
      <div className="relative w-full h-full text-center">
        {/* Determine which side is front and which is back */}
        {/* Front side logic */}
        {((!isFlipped && !swapActive) || (isFlipped && swapActive)) ? (
          /* Term Side (Side A) */
          <div
            className={`absolute inset-0 bg-white dark:bg-neutral-900 border-2 rounded-3xl md:rounded-[3rem] flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 shadow-2xl transition-all duration-300 ${getStatusClasses()}`}
          >
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white leading-relaxed break-words max-w-full max-h-full overflow-y-auto scrollbar-hide text-center py-2">
                {card.term}
              </h2>
            </div>
          </div>
        ) : (
          /* Definition Side (Side B) */
          <div
            className={`absolute inset-0 bg-white dark:bg-neutral-900 border-2 rounded-3xl md:rounded-[3rem] flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 shadow-2xl transition-all duration-300 ${getStatusClasses()}`}
          >
            <div className="flex flex-col items-center justify-center gap-6 md:gap-8 w-full h-full overflow-hidden">
              {imageUrl && (
                <div className="w-full max-h-[50%] flex items-center justify-center flex-shrink-0">
                  <img 
                    src={imageUrl} 
                    alt="Card illustration" 
                    className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl md:rounded-[2rem]"
                  />
                </div>
              )}
              <div className="w-full flex-1 flex items-center justify-center overflow-hidden">
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-700 dark:text-neutral-300 leading-relaxed break-words max-w-full max-h-full overflow-y-auto scrollbar-hide text-center py-2">
                  {card.definition || "No definition provided."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcard;
