import { db, storage } from './firebase';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { StorageService, FlashcardSet } from './storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERENCE_KEYS = [
  'theme',
  'typeSettings',
  'sortSettings',
  'studySettings',
  'dismissedBanners'
];

export const SyncService = {
  async purgeCloudData(userId: string) {
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
  },

  async backupToCloud(userId: string, onProgress?: (current: number, total: number, phase: string) => void) {
    if (!userId) throw new Error("User must be logged in to sync.");

    if (onProgress) onProgress(0, 1, 'metadata');

    try {
      // 1. Fetch preferences directly from AsyncStorage
      const preferences: Record<string, any> = {};
      for (const key of PREFERENCE_KEYS) {
        const val = await AsyncStorage.getItem(key);
        if (val) {
          try {
            preferences[key] = JSON.parse(val);
          } catch (e) {
            preferences[key] = val;
          }
        }
      }

      // 2. Upload preferences
      const prefsRef = doc(db, 'users', userId, 'settings', 'preferences');
      await setDoc(prefsRef, preferences);

      // 3. Upload flashcard sets
      const currentSets = await StorageService.getSets();
      const setsRef = collection(db, 'users', userId, 'flashcardSets');

      // Clear existing cloud sets
      const existingDocs = await getDocs(setsRef);
      const deletePromises = existingDocs.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);

      // Write local sets
      const uploadPromises = currentSets.map(set => {
        const setDocRef = doc(db, 'users', userId, 'flashcardSets', String(set.id));
        return setDoc(setDocRef, set);
      });
      await Promise.all(uploadPromises);

      if (onProgress) onProgress(1, 1, 'metadata');

      // 4. Update last synced timestamp
      const timestamp = new Date().toISOString();
      await AsyncStorage.setItem('lastSynced', timestamp);

      return timestamp;
    } catch (error) {
      console.error("Backup failed:", error);
      throw error;
    }
  },

  async restoreFromCloud(userId: string, onProgress?: (current: number, total: number, phase: string) => void) {
    if (!userId) throw new Error("User must be logged in to sync.");

    try {
      if (onProgress) onProgress(0, 1, 'metadata');

      // 1. Fetch preferences
      const prefsRef = doc(db, 'users', userId, 'settings', 'preferences');
      const prefsSnap = await getDoc(prefsRef);
      if (prefsSnap.exists()) {
        const prefs = prefsSnap.data();
        for (const key of PREFERENCE_KEYS) {
          if (prefs[key] !== undefined) {
            await AsyncStorage.setItem(key, JSON.stringify(prefs[key]));
          }
        }
      }

      // 2. Fetch flashcard sets
      const setsRef = collection(db, 'users', userId, 'flashcardSets');
      const setsSnap = await getDocs(setsRef);
      const cloudSets: FlashcardSet[] = [];
      setsSnap.forEach(docSnap => {
        cloudSets.push(docSnap.data() as FlashcardSet);
      });

      await StorageService.saveSets(cloudSets);

      if (onProgress) onProgress(1, 1, 'metadata');

      // 3. Update last synced timestamp
      const timestamp = new Date().toISOString();
      await AsyncStorage.setItem('lastSynced', timestamp);

      return timestamp;
    } catch (error) {
      console.error("Restore failed:", error);
      throw error;
    }
  }
};
