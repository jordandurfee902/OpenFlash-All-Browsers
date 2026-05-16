import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MotiView } from 'moti';
import { Library as LibraryIcon } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFlashcardSets } from '@/hooks/use-flashcard-sets';
import SyncBanner from '@/components/library/SyncBanner';
import SetGrid from '@/components/library/SetGrid';

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { flashcardSets, loading } = useFlashcardSets();

  // TEMPORARY: Clear dismissal for testing
  useEffect(() => {
    AsyncStorage.removeItem('last_dismissed_sync_banner');
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#FACC15" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.header}
        >
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Library</Text>
          </View>
          <View style={[styles.iconBadge, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5' }]}>
            <LibraryIcon size={24} color={theme.text} />
          </View>
        </MotiView>

        <SyncBanner />
        
        <SetGrid sets={flashcardSets} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 100, // Extra space for tab bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    fontWeight: '500',
    opacity: 0.8,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
