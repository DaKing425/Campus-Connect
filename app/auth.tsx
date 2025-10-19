import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth/AuthProvider';
import { router } from 'expo-router';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { signInWithEmail } = useAuth();

  const handleSignIn = async () => {
    setLoading(true);
    setMessage('');
    
    const { success, error } = await signInWithEmail(email);

    if (success) {
      setMessage('Check your email for the magic link!');
    } else {
      Alert.alert('Sign In Error', error || 'Something went wrong.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sign In to CampusConnect</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your UW email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button
        title={loading ? 'Sending...' : 'Send Magic Link'}
        onPress={handleSignIn}
        disabled={loading}
        color="#4B2E83"
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {loading && <ActivityIndicator size="small" color="#4B2E83" style={styles.loader} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4B2E83',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  message: {
    marginTop: 16,
    color: 'green',
    fontSize: 16,
  },
  loader: {
    marginTop: 16,
  },
});