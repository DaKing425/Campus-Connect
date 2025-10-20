import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const STUB_CLUBS = [
  { id: '1', name: 'Chess Club' },
  { id: '2', name: 'Robotics Club' },
  { id: '3', name: 'Photography Club' },
];

export default function Clubs() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Clubs</Text>
      <FlatList
        data={STUB_CLUBS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/events?clubId=${item.id}`)} style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontSize: 16 }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
