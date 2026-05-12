import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider } from "firebase/app-check";

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
const app = initializeApp(firebaseConfig);

// Initialize App Check
let appCheckProvider;

// Check if we are running in a browser extension
const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

if (import.meta.env.DEV || isExtension) {
    // In extension environment (dev or prod), we use a CustomProvider to avoid CSP violations
    // from ReCaptchaV3Provider attempting to load remote scripts.
    
    // Enable Debug Token for development
    if (import.meta.env.DEV) {
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    
    appCheckProvider = new CustomProvider({
        getToken: () => Promise.reject("Using Debug Token or skipped in extension")
    });
} else {
    // Web production
    appCheckProvider = new ReCaptchaV3Provider('6LdQXOEsAAAAAH5ssjz6-sjyOd5AIKsuIy2PSmDA');
}

const appCheck = initializeAppCheck(app, {
    provider: appCheckProvider,
    isTokenAutoRefreshEnabled: true
});

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;