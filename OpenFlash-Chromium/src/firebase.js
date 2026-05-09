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

if (import.meta.env.DEV) {
    // In development, we use the debug token. 
    // Setting this global variable tells Firebase to use the debug provider.
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    
    // We use a dummy CustomProvider to prevent the ReCaptchaV3Provider 
    // from attempting to load external scripts (which violates CSP).
    appCheckProvider = new CustomProvider({
        getToken: () => Promise.reject("Using Debug Token instead of Custom Provider")
    });
} else {
    // In production, ReCaptchaV3 is used (Note: MV3 extensions may require 
    // an offscreen document or custom provider for this to work in production).
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