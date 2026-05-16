import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MotiView } from 'moti';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SyncProgressProps {
  current: number;
  total: number;
  phase: string;
}

export default function SyncProgress({ current, total, phase }: SyncProgressProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const progress = Math.round((current / (total || 1)) * 100);

  return (
    <MotiView 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#0a0a0a' : '#fff', borderColor: colorScheme === 'dark' ? '#1a1a1a' : '#f0f0f0' }]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.phase, { color: theme.text }]}>Syncing {phase}...</Text>
          <Text style={[styles.details, { color: theme.icon }]}>
            {phase === 'metadata' 
              ? 'Preparing data structures' 
              : `Processing items: ${current} of ${total}`}
          </Text>
        </View>
        <Text style={styles.percentage}>{progress}%</Text>
      </View>
      <View style={[styles.progressBarContainer, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5' }]}>
        <MotiView 
          style={styles.progressBar}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", bounce: 0, duration: 0.5 }}
        />
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  phase: {
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FACC15',
  },
  progressBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FACC15',
    borderRadius: 6,
  },
});
