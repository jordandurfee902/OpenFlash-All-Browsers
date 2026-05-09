const DB_NAME = "openFlashDB";
const STORE_NAME = "images";
const DB_VERSION = 1;

export const openFlashDB = {
    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async saveImage(blob) {
        const id = "img-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
        return this.saveImageWithId(id, blob);
    },

    /**
     * Saves an image blob with a specific ID.
     * Useful for restoring from cloud.
     */
    async saveImageWithId(id, blob) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(blob, id);
            request.onsuccess = () => resolve(id);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * Returns an array of all image IDs in the database.
     */
    async getAllImageIds() {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAllKeys();
            request.onsuccess = (e) => resolve(e.target.result || []);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * Returns the raw Blob from the database.
     * Service workers can use this, while UI pages can convert it to an ObjectURL.
     */
    async getImageBlob(id) {
        if (!id) return null;
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);
            request.onsuccess = (e) => resolve(e.target.result || null);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * Utility for UI pages to get a displayable URL
     */
    async getImage(id) {
        const blob = await this.getImageBlob(id);
        if (blob && typeof URL !== 'undefined' && URL.createObjectURL) {
            return URL.createObjectURL(blob);
        }
        return null;
    },

    async deleteImage(id) {
        if (!id) return;
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * Completely wipes all images from IndexedDB.
     */
    async clearAllImages() {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }
};

// Also attach to global for backward compatibility with existing components
if (typeof self !== 'undefined') {
    self.openFlashDB = openFlashDB;
}
if (typeof window !== 'undefined') {
    window.openFlashDB = openFlashDB;
}
