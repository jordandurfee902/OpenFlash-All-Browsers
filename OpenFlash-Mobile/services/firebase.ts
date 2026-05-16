import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCr9yUZIb8sbAnRs-gSjNbQ2s3ZA77gNXY",
    authDomain: "openflash-cf1e4.firebaseapp.com",
    projectId: "openflash-cf1e4",
    storageBucket: "openflash-cf1e4.firebasestorage.app",
    messagingSenderId: "637353478320",
    appId: "1:637353478320:web:d465792e14be0cdc73d375",
    measurementId: "G-YZ0S7YKET8"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;
