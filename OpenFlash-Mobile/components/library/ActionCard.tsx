import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onPress: () => void;
  type?: 'primary' | 'secondary';
}

export default function ActionCard({ title, subtitle, icon: Icon, onPress, type = 'secondary' }: ActionCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const isPrimary = type === 'primary';

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: isPrimary ? (colorScheme === 'dark' ? '#0a0a0a' : '#fff') : 'transparent',
          borderColor: isPrimary ? '#FACC1544' : (colorScheme === 'dark' ? '#262626' : '#e5e5e5'),
          borderStyle: isPrimary ? 'solid' : 'dashed',
          borderWidth: 2,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: isPrimary ? '#FACC1522' : (colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5') }]}>
          <Icon size={24} color={isPrimary ? '#FACC15' : theme.icon} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>
            {subtitle}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 0, // Handled by Grid gap
    width: '100%',
    minHeight: 110,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.8,
  },
});
