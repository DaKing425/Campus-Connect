import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const STUB_EVENTS = [
  { id: 'e1', title: 'Weekly Meet' },
  { id: 'e2', title: 'Workshop: Intro to React' },
  { id: 'e3', title: 'Photo Walk' },
];

export default function Events() {
  const params = useLocalSearchParams();
  const clubId = params.clubId as string | undefined;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>
        Events {clubId ? `for club ${clubId}` : ''}
      </Text>
      <FlatList
        data={STUB_EVENTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontSize: 16 }}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}
