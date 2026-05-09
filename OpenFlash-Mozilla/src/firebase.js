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

// In extensions (especially Firefox MV3), we cannot load remote scripts like reCAPTCHA api.js.
// We use the Debug Provider for testing or a Custom Provider to avoid CSP issues.
const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

if (import.meta.env.DEV || isExtension) {
    // Enable Debug Token
    // In production builds of extensions, you should set a real debug token string here
    // or use a CustomProvider that fetches a token from your own backend.
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    
    appCheckProvider = new CustomProvider({
        getToken: () => Promise.reject("Using Debug Token in extension environment")
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