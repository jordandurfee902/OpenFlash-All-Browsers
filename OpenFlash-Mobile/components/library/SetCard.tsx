import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { FlashcardSet } from '@/services/storage';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const iconMap: Record<string, string> = {
  brain: 'Brain',
  book: 'Book',
  science: 'FlaskConical',
  flaskconical: 'FlaskConical',
  math: 'Divide',
  divide: 'Divide',
  code: 'Code',
  globe: 'Globe',
  music: 'Music',
  sport: 'Trophy',
  trophy: 'Trophy'
};

interface SetCardProps {
  set: FlashcardSet;
}

export default function SetCard({ set }: SetCardProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const IconName = iconMap[set.icon?.toLowerCase() || ''] || 'Layers';
  const IconComponent = (LucideIcons as any)[IconName] || LucideIcons.Layers;
  
  const bgColor = set.iconColor || 'rgba(250, 204, 21, 0.1)';
  const fgColor = set.iconColor ? '#fff' : '#FACC15';

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.background, borderColor: colorScheme === 'dark' ? '#1a1a1a' : '#f0f0f0' }]}
      onPress={() => router.push(`/study/${set.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <IconComponent size={24} color={fgColor} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {set.title}
          </Text>
          <Text style={[styles.description, { color: theme.icon }]} numberOfLines={1}>
            {set.description || "No description provided."}
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5' }]}>
          <Text style={[styles.badgeText, { color: theme.text }]}>{set.cards.length}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
