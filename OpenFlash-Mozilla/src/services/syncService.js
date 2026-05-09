import { db, storage } from '../firebase';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, listAll, getBlob, deleteObject } from 'firebase/storage';
import { openFlashDB } from '../db';
import { compressImage } from '../utils/imageUtils';

// Keys that are considered 'preferences' and stored in a single document
const PREFERENCE_KEYS = [
  'theme',
  'typeSettings',
  'sortSettings',
  'studySettings',
  'dismissedBanners'
];

// Keys that might contain nested arrays (which Firestore blocks)
const STRINGIFIED_KEYS = [
  'typeSessionStates',
  'sortSessionStates'
];

/**
 * Uploads local images to Firebase Storage if they don't already exist.
 */
const uploadImages = async (userId, onProgress) => {
  const localImageIds = await openFlashDB.getAllImageIds();
  if (localImageIds.length === 0) return;

  // 1. Get list of images already in cloud
  const storageRef = ref(storage, `users/${userId}/images`);
  const cloudImages = await listAll(storageRef);
  const cloudImageIds = new Set(cloudImages.items.map(item => item.name));

  // 2. Filter for images that need uploading
  const missingIds = localImageIds.filter(id => !cloudImageIds.has(id));
  
  if (missingIds.length === 0) {
    if (onProgress) onProgress(localImageIds.length, localImageIds.length, 'images');
    return;
  }

  // 3. Upload missing images
  let uploadedCount = 0;
  const totalToSync = missingIds.length;

  for (const id of missingIds) {
    try {
      const blob = await openFlashDB.getImageBlob(id);
      if (blob) {
        const compressedBlob = await compressImage(blob);
        const imageRef = ref(storage, `users/${userId}/images/${id}`);
        await uploadBytes(imageRef, compressedBlob);
      }
      uploadedCount++;
      if (onProgress) onProgress(uploadedCount, totalToSync, 'images');
    } catch (error) {
      console.error(`Failed to upload image ${id}:`, error);
    }
  }
};

/**
 * Downloads images from Firebase Storage if they don't exist locally.
 */
const downloadImages = async (userId, onProgress) => {
  const storageRef = ref(storage, `users/${userId}/images`);
  const cloudImages = await listAll(storageRef);
  
  if (cloudImages.items.length === 0) return;

  const localImageIds = new Set(await openFlashDB.getAllImageIds());
  const missingInLocal = cloudImages.items.filter(item => !localImageIds.has(item.name));

  if (missingInLocal.length === 0) {
    if (onProgress) onProgress(cloudImages.items.length, cloudImages.items.length, 'images');
    return;
  }

  let downloadedCount = 0;
  const totalToSync = missingInLocal.length;

  for (const item of missingInLocal) {
    try {
      const blob = await getBlob(item);
      await openFlashDB.saveImageWithId(item.name, blob);
      downloadedCount++;
      if (onProgress) onProgress(downloadedCount, totalToSync, 'images');
    } catch (error) {
      console.error(`Failed to download image ${item.name}:`, error);
    }
  }
};

/**
 * Completely deletes all user data from Firestore and Firebase Storage.
 */
export const purgeCloudData = async (userId) => {
  if (!userId) return;

  // 1. Delete Firestore Sets
  const setsRef = collection(db, 'users', userId, 'flashcardSets');
  const setsSnap = await getDocs(setsRef);
  const deleteSetPromises = setsSnap.docs.map(d => deleteDoc(d.ref));
  await Promise.all(deleteSetPromises);

  // 2. Delete Firestore Preferences
  const prefsRef = doc(db, 'users', userId, 'settings', 'preferences');
  await deleteDoc(prefsRef);

  // 3. Delete Storage Images
  const storageRef = ref(storage, `users/${userId}/images`);
  const cloudImages = await listAll(storageRef);
  const deleteImagePromises = cloudImages.items.map(item => deleteObject(item));
  await Promise.all(deleteImagePromises);
};

/**
 * Backs up all local storage data to Firestore.
 * - Saves preferences to users/{userId}/settings/preferences
 * - Saves each flashcard set to users/{userId}/flashcardSets/{setId}
 * - Syncs images to Firebase Storage
 */
export const backupToCloud = async (userId, onProgress) => {
  if (!userId) throw new Error("User must be logged in to sync.");

  if (onProgress) onProgress(0, 1, 'metadata');

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, async (localData) => {
      try {
        // 1. Separate preferences from sets
        const preferences = {};
        
        PREFERENCE_KEYS.forEach(key => {
          if (localData[key] !== undefined) {
            preferences[key] = localData[key];
          }
        });

        STRINGIFIED_KEYS.forEach(key => {
          if (localData[key] !== undefined) {
            preferences[key] = JSON.stringify(localData[key]);
          }
        });

        // 2. Upload preferences
        const prefsRef = doc(db, 'users', userId, 'settings', 'preferences');
        await setDoc(prefsRef, preferences);

        // 3. Upload flashcard sets
        const setsRef = collection(db, 'users', userId, 'flashcardSets');
        const currentSets = localData.flashcardSets || [];

        // First, clear existing cloud sets to ensure deleted local sets are removed from cloud
        const existingDocs = await getDocs(setsRef);
        const deletePromises = existingDocs.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);

        // Then, write all local sets
        const uploadPromises = currentSets.map(set => {
          const setDocRef = doc(db, 'users', userId, 'flashcardSets', String(set.id));
          return setDoc(setDocRef, set);
        });
        await Promise.all(uploadPromises);

        if (onProgress) onProgress(1, 1, 'metadata');

        // 4. Sync images
        await uploadImages(userId, onProgress);

        // 5. Update last synced timestamp locally
        const timestamp = new Date().toISOString();
        chrome.storage.local.set({ lastSynced: timestamp });

        resolve(timestamp);
      } catch (error) {
        console.error("Backup failed:", error);
        reject(error);
      }
    });
  });
};

/**
 * Restores data from Firestore to local storage.
 * Overwrites local data with cloud data.
 */
export const restoreFromCloud = async (userId, onProgress) => {
  if (!userId) throw new Error("User must be logged in to sync.");

  try {
    if (onProgress) onProgress(0, 1, 'metadata');

    const newData = {};

    // 1. Fetch preferences
    const prefsRef = doc(db, 'users', userId, 'settings', 'preferences');
    const prefsSnap = await getDoc(prefsRef);
    if (prefsSnap.exists()) {
      const prefs = prefsSnap.data();
      
      PREFERENCE_KEYS.forEach(key => {
        if (prefs[key] !== undefined) {
          newData[key] = prefs[key];
        }
      });

      STRINGIFIED_KEYS.forEach(key => {
        if (prefs[key] !== undefined) {
          try {
            newData[key] = JSON.parse(prefs[key]);
          } catch (e) {
            console.warn(`Failed to parse ${key} from cloud`, e);
          }
        }
      });
    }

    // 2. Fetch flashcard sets
    const setsRef = collection(db, 'users', userId, 'flashcardSets');
    const setsSnap = await getDocs(setsRef);
    
    const cloudSets = [];
    setsSnap.forEach(doc => {
      cloudSets.push(doc.data());
    });

    newData.flashcardSets = cloudSets;

    if (onProgress) onProgress(1, 1, 'metadata');

    // 3. Sync images
    await downloadImages(userId, onProgress);

    // 4. Update local storage
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(newData, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          // 5. Update last synced timestamp
          const timestamp = new Date().toISOString();
          chrome.storage.local.set({ lastSynced: timestamp }, () => {
            resolve(timestamp);
          });
        }
      });
    });

  } catch (error) {
    console.error("Restore failed:", error);
    throw error;
  }
};
