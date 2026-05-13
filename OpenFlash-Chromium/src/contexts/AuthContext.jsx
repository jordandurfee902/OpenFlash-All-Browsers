import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithCredential, GoogleAuthProvider, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cross-browser sign in using launchWebAuthFlow
  const signInWithGoogle = () => {
    return new Promise((resolve, reject) => {
      const clientId = '637353478320-pla6m2kn0lkuqgogmm19eu2dut5q7j80.apps.googleusercontent.com';
      
      // Use Firebase as a middleman for Chromium to bypass TLD restrictions in browsers like Ungoogled Chromium
      const isFirefox = typeof browser !== 'undefined' || chrome.runtime.getURL('').startsWith('moz-extension://');
      const redirectUri = isFirefox 
        ? chrome.identity.getRedirectURL() 
        : 'https://openflash-cf1e4.firebaseapp.com/redirect.html';
      
      const scopes = encodeURIComponent('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}`;

      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl,
          interactive: true
        },
        async (redirectUrl) => {
          if (chrome.runtime.lastError || !redirectUrl) {
            console.error("Auth: launchWebAuthFlow error:", chrome.runtime.lastError);
            reject(chrome.runtime.lastError || new Error('Authentication failed or was cancelled'));
            return;
          }

          console.log("Auth: Redirect URL received:", redirectUrl);

          // Extract token from the redirect URL hash
          const urlParams = new URLSearchParams(new URL(redirectUrl).hash.substring(1));
          const token = urlParams.get('access_token');

          console.log("Auth: Token found in hash:", token ? "Yes" : "No");

          if (!token) {
            console.error("Auth: URL hash content:", new URL(redirectUrl).hash);
            reject(new Error('No access token found in redirect URL.'));
            return;
          }

          try {
            console.log("Auth: Attempting Firebase sign-in...");
            const credential = GoogleAuthProvider.credential(null, token);
            const result = await signInWithCredential(auth, credential);
            console.log("Auth: Firebase sign-in successful!");
            resolve(result.user);
          } catch (error) {
            console.error("Auth: Firebase sign-in error:", error);
            reject(error);
          }
        }
      );
    });
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
