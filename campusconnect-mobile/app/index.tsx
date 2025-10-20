import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>Campus Connect (Mobile)</Text>
      <Button title="Clubs" onPress={() => router.push('/clubs')} />
      <View style={{ height: 12 }} />
      <Button title="Events" onPress={() => router.push('/events')} />
    </View>
  );
}
