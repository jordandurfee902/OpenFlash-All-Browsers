import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Shield, Cloud, LogOut, UploadCloud, DownloadCloud, FileJson, Trash2 } from 'lucide-react-native';
import { MotiView } from 'moti';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StorageService } from '@/services/storage';
import AccountSection from '@/components/account/AccountSection';
import AccountItem from '@/components/account/AccountItem';
import SyncProgress from '@/components/account/SyncProgress';

import { useAuth } from '@/hooks/use-auth';
import { SyncService } from '@/services/sync';

export default function AccountScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const { user, signInWithGoogle, logout } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, phase: '', active: false });
  const [lastSynced, setLastSynced] = useState('Never');

  React.useEffect(() => {
    const fetchLastSynced = async () => {
      const val = await AsyncStorage.getItem('lastSynced');
      if (val) setLastSynced(new Date(val).toLocaleString());
    };
    fetchLastSynced();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in failed:", error);
      Alert.alert("Login Failed", "Could not connect to Google.");
    }
  };

  const handleBackup = async () => {
    if (!user) return;
    try {
      setIsSyncing(true);
      const timestamp = await SyncService.backupToCloud(user.uid, (current, total, phase) => {
        setSyncProgress({ current, total, phase, active: true });
      });
      setLastSynced(new Date(timestamp).toLocaleString());
      Alert.alert("Success", "Your data has been safely backed up.");
    } catch (error) {
      Alert.alert("Backup Failed", "An error occurred during sync.");
    } finally {
      setIsSyncing(false);
      setSyncProgress({ current: 0, total: 0, phase: '', active: false });
    }
  };

  const handleRestore = async () => {
    if (!user) return;
    Alert.alert(
      "Restore from Cloud?",
      "This will overwrite all local data with the cloud version. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: async () => {
            try {
              setIsSyncing(true);
              const timestamp = await SyncService.restoreFromCloud(user.uid, (current, total, phase) => {
                setSyncProgress({ current, total, phase, active: true });
              });
              setLastSynced(new Date(timestamp).toLocaleString());
              Alert.alert("Success", "Data restored from cloud.");
            } catch (error) {
              Alert.alert("Restore Failed", "An error occurred during sync.");
            } finally {
              setIsSyncing(false);
              setSyncProgress({ current: 0, total: 0, phase: '', active: false });
            }
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const sets = await StorageService.getSets();
      const data = JSON.stringify({ sets, version: '1.0.0', platform: 'mobile' }, null, 2);
      const fileName = `openflash-mobile-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.cacheDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, data);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Export failed:", error);
      Alert.alert('Export Failed', 'An error occurred while exporting your data.');
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Purge All Data?",
      "This will PERMANENTLY delete all your flashcards and settings from this device. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Everything", 
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            if (user) await SyncService.purgeCloudData(user.uid);
            Alert.alert("Data Purged", "All your data has been successfully deleted.");
          }
        }
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => logout() }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <MotiView
            from={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'timing', duration: 500 }}
          >
            <Text style={[styles.title, { color: theme.text }]}>Your Account</Text>
            <Text style={[styles.subtitle, { color: theme.icon }]}>
              Manage your profile, sync settings, and data.
            </Text>
          </MotiView>
        </View>

        {syncProgress.active && (
          <SyncProgress 
            current={syncProgress.current} 
            total={syncProgress.total} 
            phase={syncProgress.phase} 
          />
        )}

        <AccountSection title="Profile" icon={User} delay={100}>
          <AccountItem 
            label="Display Name" 
            value={user ? user.displayName || 'Unnamed User' : 'Guest User'} 
          />
          <AccountItem 
            label="Email" 
            value={user ? user.email || 'No email' : 'Not connected'} 
          />
        </AccountSection>

        <AccountSection title="Cloud Sync" icon={Cloud} isPremium={true} delay={200}>
          <AccountItem 
            label="Sync Status" 
            value={user ? 'Connected' : 'Not active'} 
            action={user ? undefined : (isSyncing ? 'Linking...' : 'Login')}
            onClick={user ? undefined : handleSignIn}
            disabled={isSyncing}
          />
          {user && (
            <>
              <AccountItem 
                label="Backup Data" 
                value="Upload local data to cloud" 
                action={isSyncing ? 'Syncing...' : 'Backup'}
                icon={UploadCloud}
                onClick={handleBackup}
                disabled={isSyncing}
              />
              <AccountItem 
                label="Restore Data" 
                value="Download cloud data to device" 
                action={isSyncing ? 'Syncing...' : 'Restore'}
                icon={DownloadCloud}
                onClick={handleRestore}
                disabled={isSyncing}
              />
            </>
          )}
          <AccountItem 
            label="Last Synced" 
            value={lastSynced} 
          />
        </AccountSection>

        <AccountSection title="Security" icon={Shield} delay={300}>
          <AccountItem 
            label="Data Export" 
            value="Download your data as JSON" 
            action="Share"
            icon={FileJson}
            onClick={handleExportData}
          />
          <AccountItem 
            label="Purge Data" 
            value="Remove all local and cloud data" 
            action="Purge"
            variant="danger"
            icon={Trash2}
            onClick={handleDeleteAccount}
          />
        </AccountSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>OpenFlash Mobile v1.0.0</Text>
          {user && (
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <LogOut size={18} color="#f87171" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
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
  footer: {
    marginTop: 20,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signOutText: {
    color: '#f87171',
    fontWeight: '800',
    fontSize: 14,
  },
});
