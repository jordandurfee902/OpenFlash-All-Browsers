import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import { Cloud } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/use-auth';

export default function SyncBanner() {
  const { user } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user) {
      setIsVisible(false);
      return;
    }
    const checkVisibility = async () => {
      const lastDismissed = await AsyncStorage.getItem('last_dismissed_sync_banner');
      if (lastDismissed) {
        const dismissDate = new Date(parseInt(lastDismissed));
        const now = new Date();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        
        if (now.getTime() - dismissDate.getTime() < oneWeek) {
          setIsVisible(false);
          return;
        }
      }
      setIsVisible(true);
    };

    checkVisibility();
  }, []);

  const handleDismiss = async () => {
    await AsyncStorage.setItem('last_dismissed_sync_banner', Date.now().toString());
    setIsVisible(false);
  };

  const handleGoToAccount = () => {
    router.push('/account');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: -20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          exit={{ opacity: 0, scale: 0.9, translateY: -20 }}
          style={styles.container}
        >
          <LinearGradient
            colors={['rgba(250, 204, 21, 0.95)', 'rgba(250, 204, 21, 0.8)', 'rgba(252, 211, 77, 0.6)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Cloud size={28} color="#451a03" />
              </View>
              
              <View style={styles.textContainer}>
                <Text style={styles.title}>Sync Your Progress</Text>
                <Text style={styles.subtitle}>Login to sync your cards across devices for free!</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.mainButton} onPress={handleGoToAccount}>
                <Text style={styles.buttonText}>Go to Account</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
                <Text style={styles.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </MotiView>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: 'transparent',
  },
  gradient: {
    padding: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#451a03',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(69, 26, 3, 0.8)',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
  mainButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  dismissButton: {
    padding: 10,
  },
  dismissText: {
    color: 'rgba(69, 26, 3, 0.6)',
    fontWeight: '700',
    fontSize: 14,
  },
});
