import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, Plus } from 'lucide-react-native';
import SetCard from './SetCard';
import ActionCard from './ActionCard';
import { FlashcardSet } from '@/services/storage';

interface SetGridProps {
  sets: FlashcardSet[];
}

export default function SetGrid({ sets }: SetGridProps) {
  const router = useRouter();

  // Combine actions and sets into a single list for the grid
  const data = [
    { id: 'daily-review-item', type: 'action', action: 'daily' },
    ...sets.map(set => ({ ...set, type: 'set' })),
    { id: 'create-set-item', type: 'action', action: 'create' }
  ];

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.itemContainer}>
        {item.type === 'action' ? (
          item.action === 'daily' ? (
            <ActionCard 
              title="Daily Review"
              subtitle="Study your personalized daily subset"
              icon={Clock}
              type="primary"
              onPress={() => router.push('/daily')}
            />
          ) : (
            <ActionCard 
              title="Create New Set"
              subtitle="Add a new set to your collection"
              icon={Plus}
              onPress={() => router.push('/create')}
            />
          )
        ) : (
          <SetCard set={item} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={1}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
    gap: 16,
  },
  itemContainer: {
    width: '100%',
  },
});
