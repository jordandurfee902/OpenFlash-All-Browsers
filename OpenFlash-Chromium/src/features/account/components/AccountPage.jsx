import React, { useState, useEffect } from 'react';
import { User, Shield, Cloud, Settings, LogOut, ChevronRight, Sparkles, UploadCloud, DownloadCloud } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { backupToCloud, restoreFromCloud, purgeCloudData } from '../../../services/syncService';
import { openFlashDB } from '../../../db';
import StatusModal from '../../../components/ui/StatusModal';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const AccountPage = () => {
  const { currentUser, signInWithGoogle, logout } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState('Never');
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, phase: '', active: false });

  // Modal State
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: 'Confirm', variant: 'primary' });

  const showStatus = (type, title, message) => {
    setStatusModal({ isOpen: true, type, title, message });
  };

  const showConfirm = (title, message, onConfirm, confirmText = 'Confirm', variant = 'primary') => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, confirmText, variant });
  };

  useEffect(() => {
    chrome.storage.local.get(['lastSynced'], (result) => {
      if (result.lastSynced) {
        setLastSynced(new Date(result.lastSynced).toLocaleString());
      }
    });
  }, []);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error("Failed to sign in:", error);
      showStatus('error', 'Sign In Failed', error.message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to sign out:", error);
      showStatus('error', 'Sign Out Failed', error.message);
    }
  };

  const handleBackup = async () => {
    if (!currentUser) return;
    try {
      setIsSyncing(true);
      const timestamp = await backupToCloud(currentUser.uid, (current, total, phase) => {
        setSyncProgress({ current, total, phase, active: true });
      });
      setLastSynced(new Date(timestamp).toLocaleString());
      showStatus('success', 'Backup Complete', 'Your flashcards and images have been safely backed up to the cloud.');
    } catch (error) {
      console.error("Backup failed:", error);
      showStatus('error', 'Backup Failed', error.message);
    } finally {
      setIsSyncing(false);
      setSyncProgress({ current: 0, total: 0, phase: '', active: false });
    }
  };

  const handleRestore = async () => {
    if (!currentUser) return;
    
    showConfirm(
        "Restore from Cloud",
        "This will overwrite all your local flashcards and settings with the cloud version. This action cannot be undone.",
        async () => {
            try {
                setIsSyncing(true);
                const timestamp = await restoreFromCloud(currentUser.uid, (current, total, phase) => {
                    setSyncProgress({ current, total, phase, active: true });
                });
                setLastSynced(new Date(timestamp).toLocaleString());
                showStatus('success', 'Restore Successful', 'Your local data and images have been synchronized with the cloud.');
            } catch (error) {
                console.error("Restore failed:", error);
                showStatus('error', 'Restore Failed', error.message);
            } finally {
                setIsSyncing(false);
                setSyncProgress({ current: 0, total: 0, phase: '', active: false });
            }
        },
        "Overwrite Local Data",
        "warning"
    );
  };

  const handleExportData = () => {
    chrome.storage.local.get(null, (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `openflash-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  const handleDeleteAccount = () => {
    showConfirm(
      "Purge All Data & Delete Account?",
      "This will PERMANENTLY delete all your flashcards, images, and settings from both this device and the cloud. This cannot be undone.",
      async () => {
        try {
          setIsSyncing(true);
          setSyncProgress({ current: 0, total: 1, phase: 'purging local...', active: true });
          
          // 1. Purge Local
          await chrome.storage.local.clear();
          await openFlashDB.clearAllImages();
          
          // 2. Purge Cloud
          if (currentUser) {
            setSyncProgress({ current: 0, total: 1, phase: 'purging cloud...', active: true });
            await purgeCloudData(currentUser.uid);
            
            // 3. Delete Auth User
            // Note: delete() might fail if the user hasn't logged in recently (re-auth required)
            try {
              await currentUser.delete();
            } catch (authError) {
              console.warn("User deletion requires fresh login. Logging out instead.", authError);
              await logout();
            }
          }
          
          showStatus('success', 'Account Purged', 'All your data has been successfully deleted.');
          setTimeout(() => window.location.reload(), 2000); // Reload to reset app state
        } catch (error) {
          console.error("Purge failed:", error);
          showStatus('error', 'Purge Failed', error.message);
        } finally {
          setIsSyncing(false);
          setSyncProgress({ current: 0, total: 0, phase: '', active: false });
        }
      },
      "Delete Everything",
      "danger"
    );
  };

  const sections = [
    {
      title: 'Profile',
      icon: User,
      items: [
        { label: 'Display Name', value: currentUser ? currentUser.displayName : 'Guest User' },
        { label: 'Email', value: currentUser ? currentUser.email : 'Not connected' },
      ]
    },
    {
      title: 'Cloud Sync',
      icon: Cloud,
      isPremium: true,
      items: [
        { 
          label: 'Sync Status', 
          value: currentUser ? 'Connected' : 'Not active', 
          action: currentUser ? null : (isSigningIn ? 'Connecting...' : 'Login with Google'),
          onClick: currentUser ? null : handleSignIn,
          disabled: isSigningIn || isSyncing
        },
        ...(currentUser ? [
          {
            label: 'Backup Data',
            value: 'Upload local data to cloud',
            action: isSyncing ? 'Syncing...' : 'Backup to Cloud',
            icon: UploadCloud,
            onClick: handleBackup,
            disabled: isSyncing
          },
          {
            label: 'Restore Data',
            value: 'Download cloud data to device',
            action: isSyncing ? 'Syncing...' : 'Restore from Cloud',
            icon: DownloadCloud,
            onClick: handleRestore,
            disabled: isSyncing
          }
        ] : []),
        { label: 'Last Synced', value: lastSynced },
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { 
          label: 'Data Export', 
          value: 'Download your data as a JSON file', 
          action: 'Download JSON',
          onClick: handleExportData
        },
        { 
          label: 'Delete Account', 
          value: 'Permanently remove all local and cloud data', 
          action: 'Purge all data', 
          variant: 'danger',
          onClick: handleDeleteAccount,
          disabled: isSyncing
        },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white p-8 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-neutral-900 dark:text-white mb-4 tracking-tight"
          >
            Your Account
          </motion.h1>
          <p className="text-neutral-500 text-lg">Manage your profile, sync settings, and data.</p>
        </header>

        {syncProgress.active && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold capitalize">Syncing {syncProgress.phase}...</h3>
                <p className="text-sm text-neutral-500">
                  {syncProgress.phase === 'metadata' 
                    ? 'Preparing data structures' 
                    : `Processing images: ${syncProgress.current} of ${syncProgress.total}`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-yellow-500">
                  {Math.round((syncProgress.current / (syncProgress.total || 1)) * 100)}%
                </span>
              </div>
            </div>
            <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-yellow-500"
                initial={{ width: 0 }}
                animate={{ width: `${(syncProgress.current / (syncProgress.total || 1)) * 100}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}

        <div className="grid gap-8">
          {sections.map((section, idx) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-8 relative overflow-hidden group"
            >
              {section.isPremium && (
                <div className="absolute top-0 right-0 p-6">
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-400 text-xs font-bold uppercase tracking-widest">
                    <Sparkles size={12} />
                    Completely Free
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-yellow-600 dark:text-yellow-400">
                  <section.icon size={24} />
                </div>
                <h2 className="text-2xl font-bold">{section.title}</h2>
              </div>

              <div className="grid gap-4">
                {section.items.map((item, itemIdx) => (
                    <div 
                      key={itemIdx}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors group/item"
                    >
                    <div>
                      <p className="text-sm text-neutral-500 font-medium mb-1 uppercase tracking-wider">{item.label}</p>
                      {item.value && <p className="text-lg font-bold text-neutral-900 dark:text-neutral-200">{item.value}</p>}
                    </div>
                    {item.action && (
                      <button 
                        onClick={item.onClick}
                        disabled={item.disabled}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                          item.variant === 'danger' 
                            ? 'text-red-400 hover:bg-red-400/10' 
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {item.icon && <item.icon size={16} />}
                        {item.action}
                        {!item.icon && <ChevronRight size={16} />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        <footer className="mt-12 pt-12 border-t border-neutral-200 dark:border-neutral-900 flex justify-between items-center text-neutral-500">
          <p className="text-sm">OpenFlash Extension v1.0.0</p>
          {currentUser && (
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-white transition-colors font-bold"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          )}
        </footer>
      </div>

      <StatusModal 
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
      />

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
      />
    </div>
  );
};

export default AccountPage;
