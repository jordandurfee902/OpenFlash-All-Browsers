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
      const redirectUri = chrome.identity.getRedirectURL();
      const scopes = encodeURIComponent('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}`;

      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl,
          interactive: true
        },
        async (redirectUrl) => {
          if (chrome.runtime.lastError || !redirectUrl) {
            reject(chrome.runtime.lastError || new Error('Authentication failed or was cancelled'));
            return;
          }

          // Extract token from the redirect URL hash
          const urlParams = new URLSearchParams(new URL(redirectUrl).hash.substring(1));
          const token = urlParams.get('access_token');

          if (!token) {
            reject(new Error('No access token found in redirect URL'));
            return;
          }

          try {
            const credential = GoogleAuthProvider.credential(null, token);
            const result = await signInWithCredential(auth, credential);
            resolve(result.user);
          } catch (error) {
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
