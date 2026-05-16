import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon, Sparkles } from 'lucide-react-native';
import { MotiView } from 'moti';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AccountSectionProps {
  title: string;
  icon: LucideIcon;
  isPremium?: boolean;
  children: React.ReactNode;
  delay?: number;
}

export default function AccountSection({ title, icon: Icon, isPremium, children, delay = 0 }: AccountSectionProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <MotiView
      from={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'timing', duration: 500 }}
      style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#0a0a0a' : '#fff', borderColor: colorScheme === 'dark' ? '#1a1a1a' : '#f0f0f0' }]}
    >
      {isPremium && (
        <View style={styles.premiumBadge}>
          <Sparkles size={12} color="#FACC15" />
          <Text style={styles.premiumText}>FREE</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5' }]}>
          <Icon size={22} color="#FACC15" />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      </View>

      <View style={styles.content}>
        {children}
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 32,
    borderWidth: 1,
    padding: 24,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
  },
  premiumBadge: {
    position: 'absolute',
    top: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.2)',
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FACC15',
    marginLeft: 4,
    letterSpacing: 1,
  },
  content: {
    gap: 8,
  },
});
