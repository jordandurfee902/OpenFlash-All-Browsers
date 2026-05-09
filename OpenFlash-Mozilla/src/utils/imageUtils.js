/**
 * Compresses an image Blob using canvas resizing and JPEG encoding.
 * @param {Blob} blob - The original image blob.
 * @param {number} maxWidth - Maximum width of the compressed image.
 * @param {number} quality - JPEG quality (0 to 1).
 * @returns {Promise<Blob>} - The compressed image blob.
 */
export const compressImage = async (blob, maxWidth = 1024, quality = 0.8) => {
    // If the image is already small (e.g., < 50KB), don't bother compressing
    if (blob.size < 50 * 1024) return blob;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            
            let width = img.width;
            let height = img.height;
            
            // Calculate new dimensions
            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((compressedBlob) => {
                if (compressedBlob) {
                    // Only return compressed blob if it's actually smaller
                    resolve(compressedBlob.size < blob.size ? compressedBlob : blob);
                } else {
                    resolve(blob);
                }
            }, 'image/jpeg', quality);
        };
        
        img.onerror = (e) => {
            console.error("Image load error during compression:", e);
            resolve(blob); // Return original on error
        };
    });
};
