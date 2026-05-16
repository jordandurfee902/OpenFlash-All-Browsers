import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LucideIcon, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AccountItemProps {
  label: string;
  value?: string;
  action?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'danger';
}

export default function AccountItem({ 
  label, 
  value, 
  action, 
  icon: Icon, 
  onClick, 
  disabled, 
  variant = 'primary' 
}: AccountItemProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity 
      style={[styles.container, disabled && styles.disabled]} 
      onPress={onClick}
      disabled={disabled || !onClick}
      activeOpacity={0.7}
    >
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: theme.icon }]}>{label}</Text>
        {value && <Text style={[styles.value, { color: theme.text }]}>{value}</Text>}
      </View>
      
      {action && (
        <View style={[
          styles.actionButton, 
          variant === 'danger' ? styles.dangerButton : { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5' }
        ]}>
          {Icon && <Icon size={16} color={variant === 'danger' ? '#f87171' : theme.text} style={styles.actionIcon} />}
          <Text style={[
            styles.actionText, 
            { color: variant === 'danger' ? '#f87171' : theme.text }
          ]}>
            {action}
          </Text>
          {!Icon && <ChevronRight size={16} color={theme.icon} />}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 4,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 12,
  },
  dangerButton: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '800',
  },
  actionIcon: {
    marginRight: 6,
  },
  disabled: {
    opacity: 0.5,
  },
});
