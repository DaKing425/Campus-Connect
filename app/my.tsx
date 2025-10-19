import React from 'react';
import { View, Text, Button, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth/AuthProvider';
import { router } from 'expo-router';

export default function MyProfileScreen() {
  const { user, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    const { success, error } = await signOut();
    if (success) {
      Alert.alert('Signed Out', 'You have been successfully signed out.');
      router.replace('/');
    } else {
      Alert.alert('Error', error || 'Failed to sign out.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text>Not logged in.</Text>
        <Button title="Go to Login" onPress={() => router.replace('/auth')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <ScrollView>
        <Text className="text-2xl font-bold text-uw-purple mb-6">My Profile</Text>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-700">Email:</Text>
          <Text className="text-gray-600">{user.email}</Text>
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-700">Name:</Text>
          <Text className="text-gray-600">{user.user_metadata?.full_name || 'N/A'}</Text>
        </View>

        {/* Placeholder for RSVPs, Followed Clubs, Settings */}
        <Text className="text-xl font-bold text-uw-purple mt-6 mb-4">My Activities</Text>
        <Text className="text-gray-600 mb-2">RSVPs: (Coming Soon)</Text>
        <Text className="text-gray-600 mb-2">Followed Clubs: (Coming Soon)</Text>

        <Text className="text-xl font-bold text-uw-purple mt-6 mb-4">Settings</Text>
        <Button title="Notification Settings (Coming Soon)" onPress={() => Alert.alert('Settings', 'Notification settings coming soon!')} color="#B7A57A" className="mb-2" />
        <Button title="Edit Profile (Coming Soon)" onPress={() => router.push('/onboarding')} color="#B7A57A" className="mb-2" />


        <View className="mt-8">
          <Button title="Sign Out" onPress={handleSignOut} color="red" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}