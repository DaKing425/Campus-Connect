import { Stack } from 'expo-router';
import { SafeAreaView, StatusBar } from 'react-native';
import React from 'react';

export default function Layout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <Stack />
    </SafeAreaView>
  );
}
