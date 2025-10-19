import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LandingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CampusConnect</Text>
      <Text style={styles.subtitle}>Welcome to UW Events!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4B2E83', // UW Purple
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#B7A57A', // UW Gold
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
});