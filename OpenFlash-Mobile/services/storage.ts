import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SETS: 'openflash_sets',
};

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  image?: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  cards: Flashcard[];
  tags?: string[];
  createdAt: string;
}

export const StorageService = {
  async getSets(): Promise<FlashcardSet[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error fetching sets:', error);
      return [];
    }
  },

  async saveSets(sets: FlashcardSet[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETS, JSON.stringify(sets));
    } catch (error) {
      console.error('Error saving sets:', error);
    }
  },

  async saveSet(set: FlashcardSet): Promise<void> {
    const sets = await this.getSets();
    const index = sets.findIndex((s) => s.id === set.id);
    if (index > -1) {
      sets[index] = set;
    } else {
      sets.push(set);
    }
    await this.saveSets(sets);
  },

  async deleteSet(id: string): Promise<void> {
    const sets = await this.getSets();
    const filtered = sets.filter((s) => s.id !== id);
    await this.saveSets(filtered);
  },
};
